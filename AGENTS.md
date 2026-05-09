# AGENTS.md

## Proposito del proyecto

Coda es una aplicacion web de frontend puro escrita en JavaScript para generar escalas, acordes y progresiones armonicas. Su objetivo es servir como herramienta creativa y didactica para compositores, productores, arreglistas, guitarristas, pianistas y estudiantes de armonia.

La aplicacion genera material musical al vuelo a partir de reglas de armonia funcional y de tecnicas modernas sobre melodia, ritmo y armonia. Debe ayudar a explorar tonalidades, modos, grados, funciones armonicas, acordes diatonicos, dominantes secundarios, sustituciones, escalas relativas o paralelas, armonia modal y otros recursos musicales sin requerir una capa de persistencia.

## Aplicacion

La experiencia principal consiste en seleccionar o construir un contexto musical y obtener resultados inmediatamente utilizables:

- Generacion de escalas y modos.
- Generacion de acordes, triadas y cuatriadas.
- Identificacion de grados y funciones armonicas.
- Generacion de progresiones armonicas.
- Preescucha de acordes y progresiones generadas desde el navegador.
- Exportacion de archivos MIDI para continuar el trabajo en otras aplicaciones musicales.

Los archivos MIDI exportados deben poder importarse en Digital Audio Workstations y secuenciadores como Cubase, Ableton Live, Logic Pro, Digital Performer, Pro Tools y herramientas equivalentes.

## Alcance tecnico

Este proyecto es solo frontend. No debe introducirse backend, base de datos, autenticacion, servicios de persistencia ni almacenamiento remoto para el funcionamiento principal.

Los datos musicales deben generarse en tiempo de ejecucion segun las reglas definidas en el codigo. El estado de la interfaz puede existir solo mientras dura la sesion del navegador, salvo que se acuerde explicitamente una mejora local y ligera.

El repositorio de informacion teorica y reglas tecnico-musicales esta en `Docs/`. Esa carpeta contiene la base conceptual que debe consultarse para entender o ampliar areas como compases, ritmo, escalas, acordes, inversiones, cromatismo, forma, instrumentacion, orquestacion, progresiones y otros grupos de conceptos. La version convertida a Markdown vive en `Docs/teoria-md/`, con un archivo por hoja del libro original para facilitar la consulta y el mantenimiento.

La base tecnica actual usa:

- HTML5.
- CSS3 / Sass.
- JavaScript en navegador.
- Web Audio / Web MIDI y soundfonts para reproduccion.
- jQuery 4.0.0 y jQuery UI 1.14.2 vendorizados localmente.

## Principios de desarrollo

- Mantener la aplicacion como una herramienta musical interactiva, no como una pagina de marketing.
- Priorizar reglas musicales claras, resultados predecibles y una interfaz rapida para explorar ideas.
- Evitar dependencias pesadas cuando una solucion simple de frontend sea suficiente.
- No introducir persistencia permanente salvo que el usuario lo pida de forma explicita.
- Mantener la compatibilidad con el flujo de trabajo de exportar MIDI hacia DAWs.
- Preservar los recursos existentes de audio, teclado, diapason e interfaz salvo que haya una razon clara para cambiarlos.
- Al modificar logica musical, documentar brevemente la regla armonica o ritmica si no es evidente en el codigo.

## Direccion arquitectonica

La modernizacion debe hacerse de forma progresiva, evitando una reescritura total. La prioridad es extraer primero la logica musical pura a modulos de dominio sin dependencias de DOM, jQuery, MIDI ni renderizado.

- `js/domain/`: reglas musicales puras separadas por responsabilidad. `music-utils.js` contiene utilidades compartidas, `scale-domain.js` escalas, `chord-domain.js` acordes, `extended-harmony-domain.js` armonia extendida y `music-domain.js` conserva la fachada `CodaDomain`.
- `js/data.js`: catalogos musicales expuestos mediante `CodaData`. Los nombres globales legacy siguen existiendo temporalmente, pero el codigo nuevo debe consumir `CodaData`.
- `js/services/`: servicios de frontend para infraestructura del navegador, como preescucha y futura exportacion MIDI.
- `js/renderers/`: renderizado HTML separado progresivamente desde `js/app.js`. Los renderers deben recibir datos y opciones explicitas, y no calcular reglas musicales.
- `js/app.js`: orquestacion legacy de interfaz, eventos y renderizado mientras se completa la migracion.
- Futuros servicios pueden separarse por responsabilidad: escalas, acordes, progresiones, reproduccion, exportacion MIDI e instrumentos.
- La armonia extendida debe formalizarse en dominio antes de reutilizarse en generacion de progresiones o exportacion MIDI. `CodaDomain.buildExtendedHarmonyChord(...)` es la primera frontera extraida para dominantes secundarios, subdominantes secundarios, sustitutos tritonales y ii relativos.

Los nuevos modulos deben poder probarse de forma aislada siempre que sea razonable.

## Estructura relevante

- `index.html`: entrada principal de la aplicacion.
- `styles.css` y `src/css/`: estilos compilados y fuentes Sass.
- `js/app.js`: logica principal de la aplicacion.
- `js/data.js`: datos y estructuras musicales agrupados en `CodaData`.
- `js/domain/`: modulos de dominio extraidos progresivamente desde el monolito.
  - `music-utils.js`: patrones, nombres de nota, indices circulares e intervalos compartidos.
  - `scale-domain.js`: construccion de escalas y notas caracteristicas modales.
  - `chord-domain.js`: acordes diatonicos, acordes desde fundamental y etiquetas modales.
  - `extended-harmony-domain.js`: dominantes secundarios, subdominantes secundarios, sustitutos tritonales e ii relativos.
  - `circle-of-fifths-domain.js`: normalizacion de tonalidad y ordenacion del circulo de quintas.
  - `music-domain.js`: fachada de compatibilidad `CodaDomain` para la aplicacion legacy.
- `js/renderers/`: modulos de renderizado. `scale-summary-renderer.js` genera el titulo/lista de escala y relaciones tonal relativa/paralela, `scale-chords-renderer.js` genera la tabla de acordes diatonicos, `extended-harmony-renderer.js` genera las tablas de armonia extendida, `instrument-renderer.js` genera las vistas de guitarra y piano y `circle-of-fifths-renderer.js` genera la navegacion del circulo de quintas.
- `js/services/`: servicios extraidos progresivamente para reproduccion, exportacion MIDI y otras integraciones de navegador.
- `js/midi/`: utilidades relacionadas con MIDI y reproduccion.
- `soundfont/`: instrumentos y muestras usadas para preescucha.
- `img/`: recursos visuales como teclado y diapason.
- `Docs/`: repositorio de teoria musical, reglas tecnico-musicales y referencias conceptuales.
- `Docs/teoria-md/`: version Markdown separada por areas o grupos de conceptos.
- `tests/domain-tests.js`: pruebas basicas de dominio para escalas, acordes diatonicos, etiquetas modales, dominantes secundarios, sustitutos tritonales, ii relativos y armonia extendida.
- `tests/renderers-tests.js`: pruebas basicas de renderizado HTML desacoplado de la interfaz.

## Criterios para futuras mejoras

Las nuevas funciones deben reforzar alguno de estos objetivos:

- Mejor generacion armonica, melodica o ritmica.
- Mejor preescucha de acordes y progresiones.
- Mejor exportacion MIDI.
- Mejor visualizacion musical en teclado, diapason o interfaz equivalente.
- Mejor ergonomia para componer, probar y llevar ideas a una DAW.

Si una propuesta requiere servidor, cuentas de usuario, sincronizacion externa o almacenamiento persistente, debe tratarse como cambio de alcance y explicarse antes de implementarse.
