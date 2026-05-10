# Arquitectura técnica

## Dirección

La modernización de Coda es progresiva. No se busca una reescritura total, sino extraer responsabilidades desde el antiguo monolito hacia módulos pequeños, testeables y orientados al dominio musical.

La aplicación sigue siendo frontend puro: HTML, CSS/Sass y JavaScript en navegador. No hay backend, base de datos, autenticación ni persistencia remota para el funcionamiento principal.

## Capas actuales

- `js/data/*.js`: catálogos musicales separados por área: constantes, configuración MIDI, instrumentos MIDI/soundfont, notas, intervalos, escalas, acordes, afinaciones, círculo de quintas y armonía extendida.
- `js/content/*.js`: contenido largo de interfaz que no pertenece al dominio musical, como bienvenida, novedades y mejoras.
- `js/data.js`: fachada estable que ensambla esos catálogos y expone `CodaData`. El código nuevo debe consumir `CodaData`, no leer directamente variables internas de los catálogos.
- `js/services/data-index-service.js`: índices derivados de los catálogos de `CodaData` para búsquedas rápidas por nombre, patrón o semitonos sin modificar el contrato público de arrays.
- `js/domain/`: reglas musicales puras sin DOM, jQuery, MIDI ni renderizado.
- `js/application/`: casos de uso. Orquesta dominio y servicios sin generar HTML ni leer directamente del DOM.
- `js/renderers/`: renderizado HTML. Recibe datos explícitos y no calcula reglas musicales.
- `js/ui/`: coordinación de interfaz legacy con jQuery. Lee selección del DOM, monta vistas y conecta eventos de pantalla.
- `js/ui/ui-state.js`: estado explícito de pantalla. Conserva selección actual, informe renderizado, instrumento, afinación, idioma y notación sin dispersarlos en closures del controlador.
- `js/i18n/`: traducciones de interfaz y servicio ligero de internacionalización.
- `js/services/`: infraestructura de navegador, como playback y futura exportación MIDI.
- `js/bootstrap/`: composition root y manifest de carga de scripts.
- `js/app.js`: bootstrap mínimo; llama a `CodaBootstrap.start(...)`.

## Módulos relevantes

- `js/bootstrap/script-manifest.js`: orden canónico de carga de módulos de la aplicación.
- `js/bootstrap/coda-bootstrap.js`: cablea datos, dominio, aplicación, renderers, UI, controlador y playback.
- `js/data/*.js`: catálogos fuente del dominio musical.
- `js/content/changelog-content.js`: contenido estructurado de novedades por idioma.
- `js/content/welcome-content.js`: contenido estructurado de bienvenida por idioma.
- `js/data.js`: ensamblado de `CodaData`.
- `js/i18n/translations.js`: diccionarios de interfaz para español de España e inglés.
- `js/i18n/i18n-service.js`: servicio de traducción, idioma actual y etiquetas de catálogos.
- `js/services/notation-service.js`: formato visible de notas en notación anglosajona o latina sin alterar identificadores internos.
- `js/services/data-index-service.js`: creación de `CodaData.indexes` y de índices no enumerables en las colecciones principales.
- `js/services/musical-context-service.js`: construcción del contexto musical actual a partir de la selección de pantalla.
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
- `js/renderers/changelog-renderer.js`: renderizado del contenido de novedades.
- `js/renderers/welcome-renderer.js`: renderizado del contenido de bienvenida.
- `js/renderers/progression-workbench-renderer.js`: renderizado inicial del área de progresiones.
- `js/ui/ui-state.js`: factoría `CodaUiState.create(...)` para el estado mutable de pantalla.
- `js/ui/static-text-controller.js`: aplicación de textos estáticos y contenido largo traducido sobre el DOM.
- `js/ui/volume-controller.js`: fader de volumen maestro de la cabecera. Ajusta el porcentaje global de preescucha sin cambiar las reglas musicales ni la exportación MIDI.
- `js/ui/key-navigation-controller.js`: navegación desde el círculo de quintas y recomendación de formato bemol/sostenido.
- `js/ui/changelog-dialog-controller.js`: apertura, cierre y configuración del diálogo de novedades.
- `js/ui/scale-report-ui.js`: lectura/montaje de UI.
- `js/ui/scale-report-controller.js`: inicialización de selects, eventos principales y delegación en aplicación/UI.

## Reglas de evolución

- La lógica musical nueva debe entrar primero en `js/domain/`.
- La orquestación de casos de uso debe vivir en `js/application/`.
- El HTML debe concentrarse en `js/renderers/`.
- La interacción con jQuery y el DOM debe quedarse en `js/ui/`.
- El estado mutable de pantalla debe vivir en `CodaUiState`; el controlador puede orquestar eventos, pero no debe acumular nuevos valores de sesión como variables sueltas en closures.
- La selección de tónica, escala, formato e instrumento debe transformarse en un contexto musical explícito mediante `CodaMusicalContext` antes de alimentar casos de uso de aplicación.
- Las búsquedas repetidas en catálogos deben usar `CodaData.indexes` o los índices no enumerables generados por `js/services/data-index-service.js`; conservar siempre fallback lineal si una función acepta colecciones externas.
- Los textos visibles nuevos deben pasar por `js/i18n/` cuando formen parte de la interfaz.
- `js/i18n/` no debe escribir en el DOM. La aplicación de textos al HTML debe hacerse desde `js/ui/static-text-controller.js` o módulos UI equivalentes.
- El contenido largo de interfaz debe vivir en `js/content/` como datos estructurados y renderizarse desde `js/renderers/`, evitando duplicarlo como HTML estático en `index.html`.
- Los contenedores estáticos principales de `index.html` deben permanecer ligeros. Las áreas de bienvenida, novedades y progresiones se montan desde contenido o renderers.
- Los catálogos de datos que se muestran al usuario deben mantener traducción en todos los idiomas disponibles. El dato canónico puede seguir en español si el dominio lo necesita, pero la etiqueta visible debe resolverse desde `js/i18n/`. Los nombres de las notas deben formatearse mediante `js/services/notation-service.js`.
- La notación de notas es una preferencia de presentación. Los cálculos, ids de acordes, navegación tonal y playback deben conservar identificadores internos anglosajones.
- La vista de instrumento usa alturas MIDI explícitas en notación científica estándar: C4 es el C central y equivale a la nota MIDI 60. El teclado actual comienza en C3, y la guitarra estándar parte de 6ª E2, 5ª A2, 4ª D3, 3ª G3, 2ª B3 y 1ª E4.
- El playback debe cargarse de forma diferida: el soundfont y el motor MIDI se inicializan con la primera acción de preescucha, no durante el arranque de la aplicación.
- El volumen maestro de la interfaz debe aplicarse desde `js/services/playback-service.js`, escalando la velocidad MIDI base. El 100% equivale al volumen histórico de la aplicación.
- Los instrumentos MIDI/soundfont deben declararse en `js/data/midi-data.js`; el bootstrap no debe depender de literales de instrumento salvo como fallback defensivo.
- Los eventos sobre acordes y notas de instrumento deben delegarse desde contenedores estables. Evitar reenlazar manejadores sobre cada celda renderizada.
- Los reajustes de layout dependientes de medidas del DOM deben programarse con `requestAnimationFrame` mediante las funciones `schedule...` de `js/ui/scale-report-ui.js`.
- Las preferencias ligeras pueden guardarse en la cookie `coda_preferences`; cualquier valor nuevo debe añadirse de forma compatible con los existentes.
- El orden de carga de módulos debe mantenerse en `js/bootstrap/script-manifest.js` y verificarse con `tests/architecture-tests.js`.
- Si una mejora requiere servidor, cuentas de usuario, sincronización externa o almacenamiento persistente, debe tratarse como cambio de alcance.
