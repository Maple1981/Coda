# AGENTS.md

## Propósito del proyecto

Coda es una aplicación web de frontend puro escrita en JavaScript para generar escalas, acordes y progresiones armónicas. Su objetivo es servir como herramienta creativa y didáctica para compositores, productores, arreglistas, guitarristas, pianistas y estudiantes de armonía.

La aplicación genera material musical al vuelo a partir de reglas de armonía funcional y de técnicas modernas sobre melodía, ritmo y armonía. Debe ayudar a explorar tonalidades, modos, grados, funciones armónicas, acordes diatónicos, dominantes secundarios, sustituciones, escalas relativas o paralelas, armonía modal y otros recursos musicales sin requerir una capa de persistencia.

## Aplicación

La experiencia principal consiste en seleccionar o construir un contexto musical y obtener resultados inmediatamente utilizables:

- Generación de escalas y modos.
- Generación de acordes, tríadas y cuatríadas.
- Identificación de grados y funciones armónicas.
- Generación de progresiones armónicas.
- Preescucha de acordes y progresiones generadas desde el navegador.
- Exportación de archivos MIDI para continuar el trabajo en otras aplicaciones musicales.

Los archivos MIDI exportados deben poder importarse en Digital Audio Workstations y secuenciadores como Cubase, Ableton Live, Logic Pro, Digital Performer, Pro Tools y herramientas equivalentes.

## Alcance técnico

Este proyecto es solo frontend. No debe introducirse backend, base de datos, autenticación, servicios de persistencia ni almacenamiento remoto para el funcionamiento principal.

Los datos musicales deben generarse en tiempo de ejecución según las reglas definidas en el código. El estado de la interfaz puede existir solo mientras dura la sesión del navegador, salvo que se acuerde explícitamente una mejora local y ligera.

El repositorio de información teórica y reglas técnico-musicales está en `docs/theory/`. Esa carpeta contiene la base conceptual que debe consultarse para entender o ampliar áreas como compases, ritmo, escalas, acordes, inversiones, cromatismo, forma, instrumentación, orquestación, progresiones y otros grupos de conceptos. La versión convertida a Markdown vive directamente en `docs/theory/`, con un archivo por hoja del libro original para facilitar la consulta y el mantenimiento. Las síntesis por estilo viven en `docs/theory/styles/`.

La base técnica actual usa:

- HTML5.
- CSS3 / Sass.
- JavaScript en navegador sin jQuery.
- Web Audio / Web MIDI y soundfonts para reproducción.

## Principios de desarrollo

- Mantener la aplicación como una herramienta musical interactiva, no como una página de marketing.
- Priorizar reglas musicales claras, resultados predecibles y una interfaz rápida para explorar ideas.
- Evitar dependencias pesadas cuando una solución simple de frontend sea suficiente.
- No introducir persistencia permanente salvo que el usuario lo pida de forma explícita.
- Mantener la compatibilidad con el flujo de trabajo de exportar MIDI hacia DAWs.
- Preservar los recursos existentes de audio, teclado, diapasón e interfaz salvo que haya una razón clara para cambiarlos.
- Al modificar lógica musical, documentar brevemente la regla armónica o rítmica si no es evidente en el código.
- Toda documentación debe redactarse en español estándar escrupuloso, con tildes, signos y ortografía correctos. Mantener este criterio hasta que se acuerde una traducción al inglés.
- Cualquier cambio de texto visible en la interfaz o en catálogos de datos presentados al usuario debe actualizarse en todos los idiomas disponibles. De momento, los idiomas disponibles son español de España e inglés. Los nombres de las notas deben respetar la preferencia de notación elegida por el usuario: anglosajona (`C, D, E, F, G, A, B`) o latina (`Do, Re, Mi, Fa, Sol, La, Si`).

## Artefactos servidos

`index.html` sirve los estilos desde `dist/css/styles.min.css` y `dist/css/progression-playback.css`. Por tanto, cualquier cambio en estilos fuente (`src/css/styles.scss`, `src/css/styles.css` o CSS relacionado) debe reflejarse también en los archivos CSS de `dist/` antes de dar el trabajo por verificado, pasar smoke tests o publicar cambios. No basta con modificar `src/`, porque Live Server y GitHub Pages cargan los artefactos de `dist/`.

## Documentación técnica

La documentación técnica vive en `docs/technical/` para no mezclarla con la base teórico-musical de `docs/theory/`.

- `docs/technical/architecture.md`: capas, módulos relevantes, manifest de scripts y reglas de evolución.
- `docs/technical/development-workflow.md`: flujo recomendado con Live Server, comandos de prueba y smoke tests.
- `docs/technical/progression-generation.md`: reglas técnicas del generador de progresiones, estilos de escritura y sesgos armónicos.
- `docs/technical/security.md`: CSP, permisos del navegador, validación de preferencias y uso de HTML confiable.
- `docs/technical/soundfonts.md`: origen, licencia, carga diferida e integridad local de los soundfonts.

Las herramientas locales de apoyo viven en `tools/`. El flujo recomendado para publicar cambios es `tools/publish.ps1`, que ejecuta pruebas, prepara cambios, crea el commit y hace push de forma controlada. Si se quiere reforzar la comprobación antes de publicar, `tools/install-pre-push-hook.ps1` instala un hook local que ejecuta las pruebas antes de cada `git push`.

Si el usuario avisa con una frase como "los chats vuelven a dar error", comprobar antes de nada la limitación conocida de Codex Desktop documentada en `docs/technical/development-workflow.md`: algunas respuestas finales antiguas pueden haber guardado directivas `::git-*` con rutas Windows escapadas (`C:\\Users\\Usuario\\Documents\\GitHub\\Coda`), lo que rompe el renderizado del chat. Ejecutar `tools/repair-codex-chat-history.ps1` para diagnosticar y `tools/repair-codex-chat-history.ps1 -Fix` para corregir los historiales locales afectados con copia de seguridad.

El bundle de JavaScript publicado en `dist/js/coda.bundle.js` se genera con `tools/build-js-bundle.ps1` a partir de `js/bootstrap/script-manifest.js`. Cuando se añadan, retiren o reordenen scripts de aplicación, actualizar el manifest y regenerar el bundle antes de publicar.

Cuando el usuario pida publicar los cambios sin indicar mensaje, revisar el diff y escoger un mensaje de commit en inglés con esta convención: prefijo `Add`, `Upd`, `Del` o `Fix`, seguido de dos a cinco palabras descriptivas. Usar `Add` para funcionalidad nueva, `Upd` para mejoras o cambios evolutivos, `Del` para retiradas de código/contenido y `Fix` para correcciones de errores.

La modernización debe hacerse de forma progresiva, evitando una reescritura total. Los nuevos módulos deben poder probarse de forma aislada siempre que sea razonable.

## Criterios para futuras mejoras

Las nuevas funciones deben reforzar alguno de estos objetivos:

- Mejor generación armónica, melódica o rítmica.
- Mejor preescucha de acordes y progresiones.
- Mejor exportación MIDI.
- Mejor visualización musical en teclado, diapasón o interfaz equivalente.
- Mejor ergonomía para componer, probar y llevar ideas a una DAW.

Si una propuesta requiere servidor, cuentas de usuario, sincronización externa o almacenamiento persistente, debe tratarse como cambio de alcance y explicarse antes de implementarse.
