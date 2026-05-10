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

- jQuery 4.0.0 en `js/jquery-4.0.0.min.js`.
- jQuery UI 1.14.2 en `js/jquery-ui-1.14.2/`.
- Utilidades MIDI/Web Audio en `js/midi/`, `js/inc/` y `js/util/`.
- Soundfonts en `soundfont/`.

No añadir dependencias de build, backend o servidor salvo decisión explícita.

## Pruebas

Comandos de verificación:

```powershell
node tests\domain-tests.js
node tests\app-layer-tests.js
node tests\architecture-tests.js
node tests\renderers-tests.js
```

Cobertura actual:

- `tests/domain-tests.js`: reglas musicales puras.
- `tests/app-layer-tests.js`: casos de uso de aplicación, informes e instrumentos.
- `tests/architecture-tests.js`: carga de módulos, manifest de scripts y bootstrap.
- `tests/renderers-tests.js`: renderizado HTML desacoplado de la interfaz real.

## Smoke tests

Para pruebas de navegador, usar Live Server:

```text
http://127.0.0.1:5500/index.html
```

Flujos mínimos a comprobar tras cambios de arquitectura o UI:

- Generar `C Mayor`.
- Ver tabla de acordes y armonía extendida.
- Alternar guitarra y piano.
- Cambiar formato sostenidos/bemoles.
- Cambiar afinación de guitarra.
- Navegar por el círculo de quintas.
- Hacer hover/click en un acorde para resaltar/preescuchar.
- Cambiar el selector de idioma entre español e inglés y comprobar que se actualizan cabecera, formulario, área de progresiones, textos de ayuda, novedades, tablas e instrumento.
