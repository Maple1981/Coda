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
- `js/i18n/`: traducciones de interfaz y servicio ligero de internacionalización.
- `js/services/`: infraestructura de navegador, como playback y futura exportación MIDI.
- `js/bootstrap/`: composition root y manifest de carga de scripts.
- `js/app.js`: bootstrap mínimo; llama a `CodaBootstrap.start(...)`.

## Módulos relevantes

- `js/bootstrap/script-manifest.js`: orden canónico de carga de módulos de la aplicación.
- `js/bootstrap/coda-bootstrap.js`: cablea datos, dominio, aplicación, renderers, UI, controlador y playback.
- `js/i18n/translations.js`: diccionarios de interfaz para español de España e inglés.
- `js/i18n/i18n-service.js`: servicio de traducción y aplicación de textos estáticos.
- `js/services/notation-service.js`: formato visible de notas en notación anglosajona o latina sin alterar identificadores internos.
- `js/services/preferences-service.js`: preferencias ligeras en cookie, actualmente idioma y notación.
- `js/application/scale-report-application.js`: construye informes de escala e instrumentos.
- `js/application/chord-playback-application.js`: traduce identificadores de acordes de UI y alturas MIDI de instrumentos a eventos de playback.
- `js/application/progression-application.js`: casos de uso iniciales para progresiones armónicas.
- `js/domain/music-utils.js`: patrones, nombres de nota, índices circulares e intervalos compartidos.
- `js/domain/scale-domain.js`: construcción de escalas y notas características modales.
- `js/domain/chord-domain.js`: acordes diatónicos, acordes desde fundamental y etiquetas modales.
- `js/domain/extended-harmony-domain.js`: dominantes secundarios, subdominantes secundarios, sustitutos tritonales e ii relativos.
- `js/domain/circle-of-fifths-domain.js`: normalización de tonalidad y ordenación del círculo de quintas.
- `js/domain/instrument-domain.js`: modelos puros de diapasón de guitarra y teclado de piano, incluyendo la altura MIDI de cada nota visible.
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
- Los textos visibles nuevos deben pasar por `js/i18n/` cuando formen parte de la interfaz.
- Los catálogos de datos que se muestran al usuario deben mantener traducción en todos los idiomas disponibles. El dato canónico puede seguir en español si el dominio lo necesita, pero la etiqueta visible debe resolverse desde `js/i18n/`. Los nombres de las notas deben formatearse mediante `js/services/notation-service.js`.
- La notación de notas es una preferencia de presentación. Los cálculos, ids de acordes, navegación tonal y playback deben conservar identificadores internos anglosajones.
- La vista de instrumento usa alturas MIDI explícitas en notación científica estándar: C4 es el C central y equivale a la nota MIDI 60. El teclado actual comienza en C3, y la guitarra estándar parte de 6ª E2, 5ª A2, 4ª D3, 3ª G3, 2ª B3 y 1ª E4.
- Las preferencias ligeras pueden guardarse en la cookie `coda_preferences`; cualquier valor nuevo debe añadirse de forma compatible con los existentes.
- El orden de carga de módulos debe mantenerse en `js/bootstrap/script-manifest.js` y verificarse con `tests/architecture-tests.js`.
- Si una mejora requiere servidor, cuentas de usuario, sincronización externa o almacenamiento persistente, debe tratarse como cambio de alcance.
