# Contrato de progresiones y segmentos

Este documento fija la forma pública de una progresión generada o editada. Su objetivo es evitar que la UI, el playback, la exportación MIDI y los servicios de transformación dependan de detalles internos del algoritmo de voces.

## Documento de progresión

Una progresión editable se trata como un documento versionado mediante `CodaProgressionDocument`. Los campos públicos principales son:

- `documentVersion`: versión del contrato del documento.
- `userEdited`: indica que la progresión procede de una acción del usuario o debe preservarse frente a cambios de controles.
- `sections`: metadatos formales de secciones.
- `measures`: compases visibles y reproducibles.

Las operaciones de edición, creación de secciones, reordenación, sustitución de acordes y retiming deben devolver un documento con esta forma. La UI no debe reconstruir manualmente secciones ni compases si existe un servicio de documento o un comando de edición para hacerlo.

## Secciones

Cada entrada de `sections` describe un bloque formal:

- `id`: identificador estable, como `A`, `A'`, `B`, `B'` o `C`.
- `labelKey`: clave i18n visible.
- `startIndex`: índice del primer compás en `measures`.
- `length`: número de compases de la sección.
- `contextTonicName`, `contextScaleIndex`, `contextScaleName` o `contextLabel`: contexto tonal cuando la sección contrasta con otra.
- `circleOfFifths`: datos opcionales para abrir el círculo de quintas desde la cabecera de sección.
- `state`: copia del estado de escritura con el que nació la sección.

Si se elimina una sección intermedia, los servicios de documento deben reetiquetar las secciones posteriores cuando proceda. Por ejemplo, si existen `B` y `C` y se elimina `B`, la antigua `C` pasa a ocupar el lugar formal de `B`.

## Compases y segmentos

Un compás puede contener un único acorde o varios segmentos internos:

- En compases simples, el propio objeto del compás actúa como segmento.
- En compases divididos, `measure.chords` contiene los segmentos internos, y el compás conserva en su nivel superior una representación del primer segmento para mantener compatibilidad con renderers, inspector, playback y MIDI.

Los campos públicos habituales de un compás o segmento son:

- Posición y duración: `bar`, `startBeat`, `durationBeats`, `startSeconds`, `durationSeconds`, `beatsPerBar`, `beatUnit`.
- Identidad armónica: `chord`, `chordName`, `displayName`, `degree`, `degreeIndex`, `chordKind`, `kind`, `source`, `sourceScaleIndex`, `sourceTonicName`, `sourceLabelKey`.
- Inversión y voces: `inversion`, `inversionIndex`, `notes`, `midiNotes`, `voiceNotes`, `voices`.
- Función y rol: `tonalFunction`, `cadentialRole`, `chromaticRole`, `modalRole`.
- Reproducción y expresión: `articulation`, `humanization`, `intensity`, `swing`, `passingNotes`, `pedalsIn`, `pedalsOut`.
- Edición interna de compás: `chords`, cuando el compás está dividido.

La suma de `durationBeats` de los segmentos internos debe completar la duración del compás. La distribución debe respetar los pulsos siempre que sea posible: en 4/4 con tres acordes, por ejemplo, uno ocupa dos pulsos y los otros dos ocupan un pulso cada uno; en compases ternarios con dos acordes, uno ocupa dos pulsos y el otro un pulso. El acorde final del conjunto de secciones debe ocupar todo su compás.

## Metadatos internos

Algunos servicios de voces pueden adjuntar metadatos no enumerables para tomar decisiones estadísticas sin convertirlos en contrato público. Actualmente existen:

- `inversionRunKey`
- `inversionRunLength`

Estos campos sirven para limitar rachas de acordes en la misma disposición. No deben serializarse, renderizarse, exportarse a MIDI, guardarse como estado del usuario ni usarse como API pública entre capas. Si una regla necesita sobrevivir a clonaciones, retiming o persistencia, debe convertirse en un campo público documentado antes de depender de ella.

## Transformaciones

`CodaProgressionDocumentTransform` es el punto común para aplicar controles sobre una progresión editable. Puede recalcular tempo, compás, voces, articulación, intensidad, humanización, swing y duraciones sin perder la identidad armónica ni las secciones del usuario.

Cuando una progresión generada con densidad armónica divide compases, el generador puede revocear esos segmentos al final para mantener invariantes musicales, como el centrado registral aproximado y la limitación de rachas de inversión. Ese revoicing puede relajar inversiones generadas automáticamente, pero debe preservar inversiones cadenciales, cromáticas o elegidas por edición manual.

## Renderizado, playback y MIDI

Los renderers solo deben leer campos públicos. Deben ignorar metadatos internos aunque estén presentes en los objetos.

El playback y la exportación MIDI deben consumir `notes`, `midiNotes`, `voiceNotes` y los eventos compartidos de `CodaProgressionPlaybackNoteEvents`. Las articulaciones como staccato, pizzicato, órgano percusivo, arpegios, pedales y notas de paso deben sonar igual en preescucha y en el archivo MIDI exportado siempre que el formato MIDI lo permita.
