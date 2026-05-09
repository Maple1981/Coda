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
- Dependencias locales historicas como jQuery y jQuery UI.

## Principios de desarrollo

- Mantener la aplicacion como una herramienta musical interactiva, no como una pagina de marketing.
- Priorizar reglas musicales claras, resultados predecibles y una interfaz rapida para explorar ideas.
- Evitar dependencias pesadas cuando una solucion simple de frontend sea suficiente.
- No introducir persistencia permanente salvo que el usuario lo pida de forma explicita.
- Mantener la compatibilidad con el flujo de trabajo de exportar MIDI hacia DAWs.
- Preservar los recursos existentes de audio, teclado, diapason e interfaz salvo que haya una razon clara para cambiarlos.
- Al modificar logica musical, documentar brevemente la regla armonica o ritmica si no es evidente en el codigo.

## Estructura relevante

- `index.html`: entrada principal de la aplicacion.
- `styles.css` y `src/css/`: estilos compilados y fuentes Sass.
- `js/app.js`: logica principal de la aplicacion.
- `js/data.js`: datos y estructuras musicales.
- `js/midi/`: utilidades relacionadas con MIDI y reproduccion.
- `soundfont/`: instrumentos y muestras usadas para preescucha.
- `img/`: recursos visuales como teclado y diapason.
- `Docs/`: repositorio de teoria musical, reglas tecnico-musicales y referencias conceptuales.
- `Docs/teoria-md/`: version Markdown separada por areas o grupos de conceptos.

## Criterios para futuras mejoras

Las nuevas funciones deben reforzar alguno de estos objetivos:

- Mejor generacion armonica, melodica o ritmica.
- Mejor preescucha de acordes y progresiones.
- Mejor exportacion MIDI.
- Mejor visualizacion musical en teclado, diapason o interfaz equivalente.
- Mejor ergonomia para componer, probar y llevar ideas a una DAW.

Si una propuesta requiere servidor, cuentas de usuario, sincronizacion externa o almacenamiento persistente, debe tratarse como cambio de alcance y explicarse antes de implementarse.
