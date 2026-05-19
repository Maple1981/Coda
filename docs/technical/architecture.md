# Arquitectura técnica

## Dirección

La modernización de Coda es progresiva. No se busca una reescritura total, sino extraer responsabilidades desde el antiguo monolito hacia módulos pequeños, testeables y orientados al dominio musical.

La aplicación sigue siendo frontend puro: HTML, CSS/Sass y JavaScript en navegador. No hay backend, base de datos, autenticación ni persistencia remota para el funcionamiento principal.

## Capas actuales

- `js/data/*.js`: catálogos musicales separados por área: constantes, configuración MIDI, instrumentos MIDI/soundfont, notas, intervalos, escalas, acordes, afinaciones, círculo de quintas y armonía extendida.
- `js/content/*.js`: contenido largo de interfaz que no pertenece al dominio musical, como bienvenida, novedades y mejoras.
- `js/data.js`: fachada estable que ensambla esos catálogos y expone `CodaData`. El código nuevo debe consumir `CodaData`, no leer directamente variables internas de los catálogos.
- `js/services/data-index-service.js`: índices derivados de los catálogos de `CodaData` para búsquedas rápidas por nombre, patrón o semitonos sin modificar el contrato público de arrays.
- `js/domain/`: reglas musicales puras sin DOM, MIDI ni renderizado.
- `js/application/`: casos de uso. Orquesta dominio y servicios sin generar HTML ni leer directamente del DOM.
- `js/renderers/`: renderizado HTML. Recibe datos explícitos y no calcula reglas musicales.
- `js/ui/`: coordinación de interfaz con DOM nativo. Lee selección del DOM, monta vistas y conecta eventos de pantalla.
- `js/ui/ui-state.js`: estado explícito de pantalla. Conserva selección actual, informe renderizado, instrumento, afinación, idioma y notación sin dispersarlos en closures del controlador.
- `js/ui/progression-state.js`: estado normalizado del constructor de progresiones: compases, compás, BPM, voces, articulación, intercambio modal, tensiones y contrapunto.
- `js/ui/progression-state-schema.js`: contrato de valores permitidos, valores por defecto y normalización del estado de progresiones. `progression-state.js` lo usa para no duplicar reglas de validación.
- `js/i18n/`: traducciones de interfaz y servicio ligero de internacionalización.
- `js/services/`: infraestructura de navegador y servicios técnicos puros, como playback y exportación MIDI.
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
- `js/services/progression-object-service.js`: utilidades compartidas de copia superficial y clonación de colecciones de objetos usadas por el motor de progresiones.
- `js/services/progression-modal-planner-service.js`: planificación específica para modos griegos. Prioriza centro modal, tónica recurrente, acordes cadenciales modales, movimiento de bajo por segunda o tercera y evitación de gestos funcionales dominantes.
- `js/services/progression-chromatic-cadence-service.js`: generación de cadencias cromáticas tonales con sexta napolitana y acordes de sexta aumentada, siempre como preparación de dominante.
- `js/services/musical-context-service.js`: construcción del contexto musical actual a partir de la selección de pantalla.
- `js/services/preferences-service.js`: preferencias ligeras en cookie, actualmente idioma, notación, tema visual, volumen maestro, tónica, escala, formato, instrumento sonoro y controles del constructor de progresiones.
- `js/services/progression-document-service.js`: forma canónica del documento editable de progresión. Normaliza versión, secciones y marcas de edición de usuario sin mezclarlo con renderizado ni almacenamiento.
- `js/services/progression-document-transform-service.js`: aplica el estado actual de los controles sobre una progresión editable existente sin sustituir su contenido armónico. Centraliza retiming, revoicing y preservación de secciones, compases y acordes del usuario.
- `js/services/progression-workspace-service.js`: contrato versionado del workspace persistido de progresiones. Construye, valida y firma el estado que puede guardarse localmente.
- `js/services/progression-workspace-storage-service.js`: persistencia local del trabajo actual del constructor de progresiones mediante `localStorage`, incluyendo secciones, acordes añadidos, reordenaciones y controles asociados.
- `js/services/progression-edit-command-service.js`: despachador común de comandos de edición de progresiones: añadir, quitar, reordenar, reemplazar acordes y generar sección B.
- `js/services/progression-section-document-service.js`: operaciones estructurales de secciones, como localizar, clonar, anexar y anotar medidas por sección.
- `js/services/progression-section-variation-service.js`: creación de secciones derivadas con pequeñas variaciones garantizando al menos un cambio cuando procede.
- `js/services/progression-section-candidate-service.js`: elección de contextos tonales contrastantes para nuevas secciones.
- `js/services/progression-section-contrast-service.js`: orquestador de alto nivel para secciones clonadas, variantes y contrastantes.
- `js/services/midi-export-service.js`: conversión de progresiones a eventos MIDI y bytes de archivo Standard MIDI File sin depender del DOM.
- `js/services/progression-playback-note-event-service.js`: eventos de nota compartidos por playback y exportación MIDI para staccato, notas de paso y pedales, evitando divergencias entre preescucha y archivo exportado.
- `js/application/scale-report-application.js`: construye informes de escala e instrumentos.
- `js/application/chord-playback-application.js`: traduce identificadores de acordes de UI y alturas MIDI de instrumentos a eventos de playback.
- `js/application/progression-application.js`: casos de uso iniciales para progresiones armónicas. Convierte el estado normalizado de progresiones en un plan diatónico con compases, duración en beats/segundos y acordes resueltos.
- `js/domain/music-utils.js`: patrones, nombres de nota, índices circulares e intervalos compartidos.
- `js/domain/scale-domain.js`: construcción de escalas y notas características modales.
- `js/domain/chord-domain.js`: acordes diatónicos, acordes desde fundamental y etiquetas modales.
- `js/domain/extended-harmony-domain.js`: dominantes secundarios, subdominantes secundarios, sustitutos tritonales e ii relativos.
- `js/domain/circle-of-fifths-domain.js`: normalización de tonalidad y ordenación del círculo de quintas.
- `js/domain/instrument-domain.js`: modelos puros de diapasón de guitarra y teclado de piano, incluyendo la altura MIDI de cada nota visible.
- `js/domain/progression-domain.js`: planificación diatónica inicial y resolución pura de grados de progresión contra acordes de escala.
- `js/domain/music-domain.js`: fachada de compatibilidad `CodaDomain`.
- `js/renderers/scale-summary-renderer.js`: título/lista de escala y relaciones relativa/paralela.
- `js/renderers/scale-chords-renderer.js`: tabla de acordes diatónicos.
- `js/renderers/extended-harmony-renderer.js`: tablas de armonía extendida.
- `js/renderers/instrument-renderer.js`: vistas de guitarra y piano.
- `js/renderers/circle-of-fifths-renderer.js`: navegación del círculo de quintas.
- `js/renderers/changelog-renderer.js`: renderizado del contenido de novedades.
- `js/renderers/welcome-renderer.js`: renderizado del contenido de bienvenida.
- `js/renderers/progression-label-renderer.js`: formateo HTML común de etiquetas musicales de progresiones, incluyendo subíndices de inversiones.
- `js/renderers/progression-controls-renderer.js`: renderizado de los controles de tiempo, escritura y color armónico del constructor de progresiones.
- `js/renderers/progression-timeline-renderer.js`: renderizado de compases, acordes, divisiones internas, grados, funciones e iconos de edición de la progresión.
- `js/renderers/progression-inspector-renderer.js`: renderizado del inspector del acorde seleccionado en el constructor de progresiones.
- `js/renderers/progression-workbench-renderer.js`: composición inicial del área de progresiones a partir de los renderers especializados.
- `js/ui/ui-state.js`: factoría `CodaUiState.create(...)` para el estado mutable de pantalla.
- `js/ui/progression-state-schema.js`: esquema estable de los controles del constructor de progresiones.
- `js/ui/progression-state.js`: factoría y normalizador `CodaProgressionState` para leer los controles actuales de progresiones y producir un objeto estable.
- `js/services/progression-inspector-service.js`: sincronización del acorde seleccionado con el inspector y acciones rápidas compatibles con el transporte de progresiones.
- `js/ui/static-text-controller.js`: aplicación de textos estáticos y contenido largo traducido sobre el DOM.
- `js/ui/volume-controller.js`: fader de volumen maestro de la cabecera. Ajusta el porcentaje global de preescucha sin cambiar las reglas musicales ni la exportación MIDI.
- `js/ui/theme-controller.js`: conmutador de tema visual día/noche. Aplica `data-theme` sobre `body` y guarda la preferencia en cookie.
- `js/ui/random-select-controller.js`: patrón reutilizable para botones de azar asociados a selectores. Cambia el valor del `select` objetivo y dispara su evento `change` para reutilizar la lógica existente.
- `js/ui/key-navigation-controller.js`: navegación desde el círculo de quintas y recomendación de formato bemol/sostenido.
- `js/ui/changelog-dialog-controller.js`: apertura, cierre y configuración del diálogo de novedades.
- `js/ui/scale-report-ui.js`: lectura/montaje de UI.
- `js/ui/scale-report-controller.js`: inicialización de selects, eventos principales y delegación en aplicación/UI.

## Reglas de evolución

- La lógica musical nueva debe entrar primero en `js/domain/`.
- La orquestación de casos de uso debe vivir en `js/application/`.
- El HTML debe concentrarse en `js/renderers/`.
- Los renderers de progresiones deben mantenerse segmentados: controles, línea temporal, etiquetas musicales y composición del área de trabajo. Evitar que `progression-workbench-renderer.js` vuelva a acumular controles, compases y formato de etiquetas.
- La interacción con el DOM debe quedarse en `js/ui/`.
- El estado mutable de pantalla debe vivir en `CodaUiState`; el controlador puede orquestar eventos, pero no debe acumular nuevos valores de sesión como variables sueltas en closures.
- El estado de progresiones debe leerse desde `CodaProgressionState` y guardarse en `CodaUiState`; los casos de uso posteriores deben recibir ese objeto normalizado, no leer directamente controles de formulario.
- La progresión editable debe tratarse como un documento versionado mediante `CodaProgressionDocument`. Las operaciones de edición deben devolver documentos marcados como trabajo de usuario para que undo/redo, persistencia y renderizado tengan un contrato estable.
- Las ediciones de progresión deben pasar por `CodaProgressionEditCommands` o por casos de uso de aplicación que lo utilicen. Evitar que la UI marque o reconstruya manualmente operaciones como añadir, quitar, reordenar o reemplazar acordes.
- La lógica de secciones debe mantenerse separada por responsabilidad: documento de secciones, variaciones, candidatos tonales y orquestación. Evitar que `progression-section-contrast-service.js` vuelva a acumular clonación, reindexado, variación y búsqueda tonal en un único archivo.
- Las reglas de validación y valores permitidos del estado de progresiones deben vivir en `CodaProgressionStateSchema`; si se añade un control nuevo al constructor, debe actualizarse ese esquema, la cookie funcional y las traducciones de interfaz.
- El transporte de progresiones debe componerse mediante servicios pequeños: botones, clicks de compases, eventos de documento, drag and drop, acciones, playback y menú contextual. `js/ui/progression-transport-controller.js` debe limitarse a inicializar y cablear esas piezas.
- La reproducción de progresiones debe mantener separadas la agenda musical, la normalización de eventos, las estrategias MIDI/arpegio y el runner de una ejecución. El caso de uso `createProgressionPlayback` no debe acumular nuevas reglas de secuenciación internas.
- La selección de tónica, escala, formato e instrumento sonoro debe transformarse en un contexto musical explícito mediante `CodaMusicalContext` antes de alimentar casos de uso de aplicación. El instrumento sonoro se conserva como identificador General MIDI y la vista gráfica se resuelve mediante `viewInstrument`.
- Las búsquedas repetidas en catálogos deben usar `CodaData.indexes` o los índices no enumerables generados por `js/services/data-index-service.js`; conservar siempre fallback lineal si una función acepta colecciones externas.
- Las utilidades genéricas de copia y extensión de objetos dentro del motor de progresiones deben pasar por `CodaProgressionObjects`, no repetirse en cada servicio.
- Los textos visibles nuevos deben pasar por `js/i18n/` cuando formen parte de la interfaz.
- `js/i18n/` no debe escribir en el DOM. La aplicación de textos al HTML debe hacerse desde `js/ui/static-text-controller.js` o módulos UI equivalentes.
- El contenido largo de interfaz debe vivir en `js/content/` como datos estructurados y renderizarse desde `js/renderers/`, evitando duplicarlo como HTML estático en `index.html`.
- Los contenedores estáticos principales de `index.html` deben permanecer ligeros. Las áreas de bienvenida, novedades y progresiones se montan desde contenido o renderers.
- Los catálogos de datos que se muestran al usuario deben mantener traducción en todos los idiomas disponibles. El dato canónico puede seguir en español si el dominio lo necesita, pero la etiqueta visible debe resolverse desde `js/i18n/`. Los nombres de las notas deben formatearse mediante `js/services/notation-service.js`.
- La notación de notas es una preferencia de presentación. Los cálculos, ids de acordes, navegación tonal y playback deben conservar identificadores internos anglosajones.
- La vista de instrumento usa alturas MIDI explícitas en notación científica estándar: C4 es el C central y equivale a la nota MIDI 60. El teclado actual comienza en C3, y la guitarra estándar parte de 6ª E2, 5ª A2, 4ª D3, 3ª G3, 2ª B3 y 1ª E4.
- El playback debe cargarse de forma diferida: el soundfont y el motor MIDI se inicializan con la primera acción de preescucha, no durante el arranque de la aplicación.
- La exportación MIDI debe pasar por `js/services/midi-export-service.js`: la aplicación entrega una progresión normalizada y recibe eventos MIDI/bytes de archivo; la UI no debe construir mensajes MIDI manualmente.
- El volumen maestro de la interfaz debe aplicarse desde `js/services/playback-service.js`, escalando la velocidad MIDI base. El 100% equivale al volumen histórico de la aplicación y el valor elegido por el usuario se conserva en `coda_preferences`.
- Los instrumentos MIDI/soundfont deben declararse en `js/data/midi-data.js`; el bootstrap no debe depender de literales de instrumento salvo como fallback defensivo.
- La fuente, licencia y reglas de carga de los soundfonts locales se documentan en `docs/technical/soundfonts.md`.
- Las decisiones de seguridad del frontend, CSP, permisos del navegador y validación de preferencias se documentan en `docs/technical/security.md`.
- Los eventos sobre acordes y notas de instrumento deben delegarse desde contenedores estables. Evitar reenlazar manejadores sobre cada celda renderizada.
- Los reajustes de layout dependientes de medidas del DOM deben programarse con `requestAnimationFrame` mediante las funciones `schedule...` de `js/ui/scale-report-ui.js`.
- Las preferencias ligeras pueden guardarse en la cookie `coda_preferences`; cualquier valor nuevo debe añadirse de forma compatible con los existentes. La selección principal del formulario debe restaurarse al arrancar sin forzar la recomendación automática de formato cuando el usuario ya había guardado una elección explícita.
- El trabajo editable de progresiones debe guardarse en `coda_progression_workspace` mediante `localStorage`, no en cookie. Incluye la progresión completa y debe restaurarse solo cuando coincida con la tónica, escala y formato guardados para evitar mezclar material armónico de contextos distintos. El contrato versionado de ese estado vive en `CodaProgressionWorkspace`; el servicio de almacenamiento solo debe leer y escribir en el navegador.
- Una progresión que el usuario haya manipulado debe conservarse al cambiar cualquier control del constructor. Se consideran trabajo del usuario las progresiones aleatorias generadas desde el botón del constructor, las secciones nuevas, los acordes añadidos o sustituidos, los cambios de orden de compases y los cambios de orden de acordes dentro de un compás. Los controles pueden actualizar tempo, compás, articulación, voces, duraciones y metadatos, pero no deben reconstruir la progresión desde el patrón inicial ni perder secciones o ediciones manuales.
- La aplicación de controles sobre una progresión editable debe pasar por `CodaProgressionDocumentTransform`. La UI no debe duplicar reglas de retiming, revoicing, crecimiento o recorte de compases; solo debe leer controles, delegar el caso de uso y renderizar el resultado.
- Las reglas de eventos de nota que afecten tanto a preescucha como a exportación MIDI deben vivir en un servicio compartido. Evitar duplicar staccato, notas de paso, pedales o articulaciones especiales en `midi-export-service.js` y en los servicios de playback por separado.
- El orden de carga de módulos debe mantenerse en `js/bootstrap/script-manifest.js` y verificarse con `tests/architecture-tests.js`.
- Las pruebas que cargan pilas largas de scripts deben usar `tests/helpers/script-loader.js` para leer rangos desde el manifest, evitando listas manuales que se desincronicen al añadir módulos.
- Las invariantes musicales recurrentes deben tener cobertura multi-semilla en la capa de aplicación: límite de rachas de inversión, ausencia de sufijos duplicados, duración completa del acorde final, reparto por pulsos en compases divididos y centrado registral aproximado.
- Si una mejora requiere servidor, cuentas de usuario, sincronización externa o almacenamiento persistente, debe tratarse como cambio de alcance.
