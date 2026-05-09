# Arquitectura técnica

## Dirección

La modernización de Coda es progresiva. No se busca una reescritura total, sino extraer responsabilidades desde el antiguo monolito hacia módulos pequeños, testeables y orientados al dominio musical.

La aplicación sigue siendo frontend puro: HTML, CSS/Sass y JavaScript en navegador. No hay backend, base de datos, autenticación ni persistencia remota para el funcionamiento principal.

## Capas actuales

- `js/data.js`: catálogos musicales expuestos mediante `CodaData`. Los nombres globales legacy siguen existiendo temporalmente, pero el código nuevo debe consumir `CodaData`.
- `js/domain/`: reglas musicales puras sin DOM, jQuery, MIDI ni renderizado.
- `js/application/`: casos de uso. Orquesta dominio y servicios sin generar HTML ni leer directamente del DOM.
- `js/renderers/`: renderizado HTML. Recibe datos explícitos y no calcula reglas musicales.
- `js/ui/`: coordinación de interfaz legacy con jQuery. Lee selección del DOM, monta vistas y conecta eventos de pantalla.
- `js/services/`: infraestructura de navegador, como playback y futura exportación MIDI.
- `js/bootstrap/`: composition root y manifest de carga de scripts.
- `js/app.js`: bootstrap mínimo; llama a `CodaBootstrap.start(...)`.

## Módulos relevantes

- `js/bootstrap/script-manifest.js`: orden canónico de carga de módulos de la aplicación.
- `js/bootstrap/coda-bootstrap.js`: cablea datos, dominio, aplicación, renderers, UI, controlador y playback.
- `js/application/scale-report-application.js`: construye informes de escala e instrumentos.
- `js/application/chord-playback-application.js`: traduce identificadores de acordes de UI a notas y delega en playback.
- `js/application/progression-application.js`: casos de uso iniciales para progresiones armónicas.
- `js/domain/music-utils.js`: patrones, nombres de nota, índices circulares e intervalos compartidos.
- `js/domain/scale-domain.js`: construcción de escalas y notas características modales.
- `js/domain/chord-domain.js`: acordes diatónicos, acordes desde fundamental y etiquetas modales.
- `js/domain/extended-harmony-domain.js`: dominantes secundarios, subdominantes secundarios, sustitutos tritonales e ii relativos.
- `js/domain/circle-of-fifths-domain.js`: normalización de tonalidad y ordenación del círculo de quintas.
- `js/domain/instrument-domain.js`: modelos puros de diapasón de guitarra y teclado de piano.
- `js/domain/progression-domain.js`: resolución pura de grados de progresión contra acordes de escala.
- `js/domain/music-domain.js`: fachada de compatibilidad `CodaDomain`.
- `js/renderers/scale-summary-renderer.js`: título/lista de escala y relaciones relativa/paralela.
- `js/renderers/scale-chords-renderer.js`: tabla de acordes diatónicos.
- `js/renderers/extended-harmony-renderer.js`: tablas de armonía extendida.
- `js/renderers/instrument-renderer.js`: vistas de guitarra y piano.
- `js/renderers/circle-of-fifths-renderer.js`: navegación del círculo de quintas.
- `js/ui/scale-report-ui.js`: lectura/montaje de UI.
- `js/ui/scale-report-controller.js`: inicialización de selects, eventos, navegación tonal y delegación en aplicación/UI.

## Reglas de evolución

- La lógica musical nueva debe entrar primero en `js/domain/`.
- La orquestación de casos de uso debe vivir en `js/application/`.
- El HTML debe concentrarse en `js/renderers/`.
- La interacción con jQuery y el DOM debe quedarse en `js/ui/`.
- El orden de carga de módulos debe mantenerse en `js/bootstrap/script-manifest.js` y verificarse con `tests/architecture-tests.js`.
- Si una mejora requiere servidor, cuentas de usuario, sincronización externa o almacenamiento persistente, debe tratarse como cambio de alcance.
