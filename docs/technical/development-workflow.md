# Flujo de desarrollo

## Ejecución local

El flujo recomendado durante desarrollo es abrir la aplicación desde Live Server de Visual Studio Code:

```text
http://127.0.0.1:5500/index.html
```

Esto mantiene el proyecto como frontend puro, sin añadir dependencias al repositorio. Live Server solo sirve los archivos estáticos por HTTP durante el desarrollo.

Evitar `file://` para las pruebas funcionales completas. Al abrir `index.html` directamente desde disco, el navegador puede bloquear cargas dinámicas de soundfonts o utilidades MIDI/Web Audio por políticas CORS. La aplicación puede renderizar, pero la preescucha puede comportarse de forma distinta.

## Dependencias

Las dependencias actuales están vendorizadas localmente:

- Utilidades MIDI/Web Audio en `js/midi/`, `js/inc/` y `js/util/`.
- Soundfonts en `soundfont/`.

No añadir dependencias de build, backend o servidor salvo decisión explícita.

## Bundle JavaScript

La versión servida por `index.html` carga los módulos de aplicación desde `dist/js/coda.bundle.js` para reducir el número de peticiones en GitHub Pages. El bundle se genera sin dependencias externas a partir de `js/bootstrap/script-manifest.js`:

```powershell
.\tools\build-js-bundle.ps1
```

Cada vez que se añada, quite o reordene un script de aplicación, actualizar `js/bootstrap/script-manifest.js` y regenerar el bundle. El runner común `.\tools\run-tests.ps1` también lo regenera antes de ejecutar las pruebas.

## Pruebas

Comandos de verificación:

```powershell
node tests\domain-tests.js
node tests\app-layer-tests.js
node tests\progression-invariants-tests.js
node tests\progression-state-tests.js
node tests\progression-midi-tests.js
node tests\progression-playback-tests.js
node tests\progression-ui-behavior-tests.js
node tests\architecture-tests.js
node tests\renderers-tests.js
```

Cobertura actual:

- `tests/domain-tests.js`: reglas musicales puras.
- `tests/app-layer-tests.js`: casos de uso de aplicación, informes e instrumentos.
- `tests/progression-invariants-tests.js`: invariantes multi-semilla del generador de progresiones. Está separado de la capa de aplicación para poder aislar su coste si en el futuro conviene moverlo a una batería extendida.
- `tests/progression-state-tests.js`: estado normalizado del constructor de progresiones.
- `tests/progression-midi-tests.js`: conversión de progresiones a eventos MIDI y archivo `.mid`.
- `tests/progression-playback-tests.js`: secuenciación temporal de progresiones para preescucha.
- `tests/progression-ui-behavior-tests.js`: flujo de comportamiento `controles de UI -> estado de progresión -> progresión esperada`.
- `tests/architecture-tests.js`: carga de módulos, manifest de scripts y bootstrap.
- `tests/renderers-tests.js`: renderizado HTML desacoplado de la interfaz real.

También puede usarse el runner común:

```powershell
.\tools\run-tests.ps1
```

## Publicación en Git

Para evitar repetir manualmente la secuencia de pruebas, commit y push, el proyecto incluye un script local de publicación:

```powershell
.\tools\publish.ps1 "Resumen breve del cambio"
```

El flujo que ejecuta es:

- Detectar la rama actual.
- Mostrar el estado de Git.
- Ejecutar las pruebas automatizadas.
- Preparar todos los cambios con `git add --all`.
- Crear el commit con el mensaje indicado.
- Hacer `git push` hacia el upstream configurado; si la rama no tiene upstream, lo crea en `origin`.

Si el usuario pide simplemente publicar los cambios, el mensaje de commit lo decide Codex después de revisar el diff. La convención del repositorio es usar un mensaje breve en inglés con un prefijo de tres letras:

- `Add`: funcionalidad, documentación o recursos nuevos.
- `Upd`: mejora o evolución de algo existente.
- `Del`: eliminación de código, contenido o recursos.
- `Fix`: corrección de errores o regresiones.

Después del prefijo se añaden de dos a cinco palabras descriptivas en inglés. Ejemplos válidos:

```text
Add publish workflow tools
Upd instrument playback docs
Fix fifths circle layout
Del obsolete dependency files
```

Opciones útiles:

```powershell
.\tools\publish.ps1 "Resumen breve del cambio" -DryRun
.\tools\publish.ps1 "Resumen breve del cambio" -NoPush
.\tools\publish.ps1 "Resumen breve del cambio" -SkipTests
.\tools\publish.ps1 "Resumen breve del cambio" -Remote origin -Branch main
```

`-DryRun` comprueba la rama y muestra el estado sin modificar Git. `-NoPush` sirve para crear el commit sin publicarlo todavía. `-SkipTests` debe reservarse para casos excepcionales, porque el flujo normal de Coda es publicar solo después de comprobar que la base sigue estable.

De forma opcional, puede instalarse un hook local de Git para ejecutar las mismas pruebas antes de cada `git push`:

```powershell
.\tools\install-pre-push-hook.ps1
```

El hook se instala en `.git/hooks/pre-push`, que es una zona local del repositorio y no se versiona. El script versionado que ejecuta el hook vive en `tools/git-hooks/pre-push.ps1`.

## Limitación conocida de Codex Desktop

En Windows, algunas versiones de Codex Desktop pueden fallar al abrir chats antiguos si el historial local contiene directivas internas de Git con rutas Windows escapadas. El síntoma visible es que el chat se abre con un error de renderizado; en el log aparece una traza similar a:

```text
invalid syntax at line 1 col 5:

1  cwd="C:\Users\Usuario\Documents\GitHub\Coda"
       ^
```

En Windows, los logs de Codex Desktop no están en `.codex\log`. La ruta habitual está bajo el paquete de la aplicación:

```text
%LOCALAPPDATA%\Packages\OpenAI.Codex_...\LocalCache\Local\Codex\Logs\...
```

La causa conocida en este proyecto es una respuesta final de Codex con directivas como:

```text
::git-stage{cwd="C:\Users\Usuario\Documents\GitHub\Coda"}
::git-commit{cwd="C:\Users\Usuario\Documents\GitHub\Coda"}
::git-push{cwd="C:\Users\Usuario\Documents\GitHub\Coda" branch="master"}
```

El formato seguro usa barras `/` incluso en Windows:

```text
::git-stage{cwd="C:/Users/Usuario/Documents/GitHub/Coda"}
::git-commit{cwd="C:/Users/Usuario/Documents/GitHub/Coda"}
::git-push{cwd="C:/Users/Usuario/Documents/GitHub/Coda" branch="master"}
```

Si el usuario avisa con una frase como "los chats vuelven a dar error", comprobar primero este fallo antes de investigar la aplicación Coda. El diagnóstico local es:

```powershell
.\tools\repair-codex-chat-history.ps1
```

Si el script informa de historiales afectados, aplicar la reparación con:

```powershell
.\tools\repair-codex-chat-history.ps1 -Fix
```

El script revisa `C:\Users\Usuario\.codex\sessions`, crea una copia `.bak-codex-render-fix` antes de modificar cada JSONL y reemplaza solamente el literal serializado `C:\\Users\\Usuario\\Documents\\GitHub\\Coda` por `C:/Users/Usuario/Documents/GitHub/Coda`. La corrección conserva el historial en UTF-8 sin BOM.

## Smoke tests

Para pruebas de navegador, usar Live Server:

```text
http://127.0.0.1:5500/index.html
```

Para validar progresiones complejas con layout real de navegador, abrir también:

```text
http://127.0.0.1:5500/tests/progression-visual-smoke.html
```

Este smoke monta el área de progresiones, genera una progresión con densidad armónica alta, secciones derivadas y contrastantes, arpegio aleatorio y una variante staccato, y marca `data-smoke-status="passed"` en el elemento raíz cuando el renderizado conserva navegador de secciones, controles de borrado, compases divididos y tamaños de layout válidos sin desbordamiento horizontal.

Flujos mínimos a comprobar tras cambios de arquitectura o UI:

- Generar `C Mayor`.
- Ver tabla de acordes y armonía extendida.
- Cambiar el selector de instrumento entre piano, guitarra, órgano y cuerdas.
- Cambiar formato sostenidos/bemoles.
- Cambiar afinación de guitarra.
- Navegar por el círculo de quintas.
- Hacer hover/click en un acorde para resaltar/preescuchar.
- Hacer click en notas del piano y del diapasón; comprobar que suena la altura real de la nota seleccionada.
- Al recargar, comprobar que la página aparece sin esperar a la carga de soundfonts; el primer click de preescucha debe inicializar el playback.
- Cambiar el selector de idioma entre español e inglés y comprobar que se actualizan cabecera, formulario, área de progresiones, textos de ayuda, novedades, tablas e instrumento.
- Cambiar el selector de notación entre anglosajona y latina; comprobar que tónica, escala generada, acordes, instrumento y círculo de quintas cambian la representación visible de las notas.
- Recargar la página y comprobar que la cookie `coda_preferences` conserva idioma, notación, tema visual, volumen maestro, tónica, escala, formato, instrumento sonoro y controles del constructor de progresiones.
- Añadir acordes a compases, reordenarlos, generar una sección B, recargar la página y comprobar que `localStorage.coda_progression_workspace` restaura el trabajo de progresión para la misma tónica, escala y formato.
