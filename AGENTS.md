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

El repositorio de información teórica y reglas técnico-musicales está en `Docs/`. Esa carpeta contiene la base conceptual que debe consultarse para entender o ampliar áreas como compases, ritmo, escalas, acordes, inversiones, cromatismo, forma, instrumentación, orquestación, progresiones y otros grupos de conceptos. La versión convertida a Markdown vive en `Docs/teoria-md/`, con un archivo por hoja del libro original para facilitar la consulta y el mantenimiento.

La base técnica actual usa:

- HTML5.
- CSS3 / Sass.
- JavaScript en navegador.
- Web Audio / Web MIDI y soundfonts para reproducción.
- jQuery 4.0.0 y jQuery UI 1.14.2 vendorizados localmente.

## Principios de desarrollo

- Mantener la aplicación como una herramienta musical interactiva, no como una página de marketing.
- Priorizar reglas musicales claras, resultados predecibles y una interfaz rápida para explorar ideas.
- Evitar dependencias pesadas cuando una solución simple de frontend sea suficiente.
- No introducir persistencia permanente salvo que el usuario lo pida de forma explícita.
- Mantener la compatibilidad con el flujo de trabajo de exportar MIDI hacia DAWs.
- Preservar los recursos existentes de audio, teclado, diapasón e interfaz salvo que haya una razón clara para cambiarlos.
- Al modificar lógica musical, documentar brevemente la regla armónica o rítmica si no es evidente en el código.
- Toda documentación debe redactarse en español estándar escrupuloso, con tildes, signos y ortografía correctos. Mantener este criterio hasta que se acuerde una traducción al inglés.
- Cualquier cambio de texto visible en la interfaz o en catálogos de datos presentados al usuario debe actualizarse en todos los idiomas disponibles. De momento, los idiomas disponibles son español de España e inglés. Los nombres de las notas quedan fuera de esta regla hasta que se defina explícitamente su tratamiento.

## Documentación técnica

La documentación técnica vive en `docs/technical/` para no mezclarla con la base teórico-musical de `Docs/`.

- `docs/technical/architecture.md`: capas, módulos relevantes, manifest de scripts y reglas de evolución.
- `docs/technical/development-workflow.md`: flujo recomendado con Live Server, comandos de prueba y smoke tests.

La modernización debe hacerse de forma progresiva, evitando una reescritura total. Los nuevos módulos deben poder probarse de forma aislada siempre que sea razonable.

## Criterios para futuras mejoras

Las nuevas funciones deben reforzar alguno de estos objetivos:

- Mejor generación armónica, melódica o rítmica.
- Mejor preescucha de acordes y progresiones.
- Mejor exportación MIDI.
- Mejor visualización musical en teclado, diapasón o interfaz equivalente.
- Mejor ergonomía para componer, probar y llevar ideas a una DAW.

Si una propuesta requiere servidor, cuentas de usuario, sincronización externa o almacenamiento persistente, debe tratarse como cambio de alcance y explicarse antes de implementarse.
