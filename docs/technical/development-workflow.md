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

## Pruebas

Comandos de verificación:

```powershell
node tests\domain-tests.js
node tests\app-layer-tests.js
node tests\progression-state-tests.js
node tests\progression-midi-tests.js
node tests\architecture-tests.js
node tests\renderers-tests.js
```

Cobertura actual:

- `tests/domain-tests.js`: reglas musicales puras.
- `tests/app-layer-tests.js`: casos de uso de aplicación, informes e instrumentos.
- `tests/progression-state-tests.js`: estado normalizado del constructor de progresiones.
- `tests/progression-midi-tests.js`: conversión de progresiones a eventos MIDI y archivo `.mid`.
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

## Smoke tests

Para pruebas de navegador, usar Live Server:

```text
http://127.0.0.1:5500/index.html
```

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
- Recargar la página y comprobar que la cookie `coda_preferences` conserva idioma, notación, tema visual, volumen maestro, tónica, escala, formato e instrumento sonoro.
