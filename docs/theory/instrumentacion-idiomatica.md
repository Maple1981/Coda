# Instrumentación idiomática

Este documento recoge reglas prácticas para que los voicings generados se acerquen a una escritura tocable. No sustituye a la elección creativa, pero sirve como base de penalizaciones y preferencias del algoritmo.

## Guitarra

La guitarra no se comporta como un teclado pequeño. Las notas se pisan con una sola mano sobre seis cuerdas, y eso limita mucho la apertura física de un acorde.

Reglas de escritura:

- Un voicing muy abierto puede ser impracticable aunque la disposición armónica esté marcada como abierta. La apertura debe medirse por trastes pisados, no sólo por distancia MIDI.
- No pueden sonar a la vez una cuerda al aire y una nota pisada en esa misma cuerda. Cada cuerda sólo puede producir una altura simultánea.
- Si dos o más notas usan el mismo traste en cuerdas distintas, puede aparecer el recurso de cejilla: un dedo pisa varias cuerdas con su superficie lateral. Esto hace posibles acordes que serían incómodos si cada nota exigiera una punta de dedo independiente.
- Las cuerdas al aire son cómodas y resonantes. Conviene favorecerlas cuando no rompan la conducción de voces ni generen una sonoridad demasiado vacía.
- Las cuerdas graves suelen funcionar como base natural del acorde. En la representación del diapasón aparecen arriba, pero musicalmente sostienen el registro inferior y conviene darles peso como fundamento.
- En acordes simultáneos, una mano media se mueve con seguridad dentro de unos cuatro trastes de apertura efectiva. Cinco trastes ya deben considerarse exigentes; más de cinco suele requerir una digitación especial o debe evitarse.

Aplicación algorítmica:

- Para cada nota del acorde se buscan posiciones posibles en las seis cuerdas.
- Se descartan o penalizan fuertemente los voicings que necesitan más notas simultáneas que cuerdas disponibles.
- Se penalizan asignaciones que obliguen a usar la misma cuerda para dos notas.
- Se favorecen digitaciones compactas, cuerdas al aire y bajos en cuerdas graves.
- Se acepta la cejilla como reducción de dificultad cuando varias notas comparten traste.

## Piano

El piano permite más voces simultáneas que la guitarra porque el intérprete cuenta con dos manos y diez dedos. Aun así, un voicing simultáneo debe poder repartirse de forma razonable entre ambas manos.

Guía práctica de apertura por mano:

| Apertura | Uso habitual | Comentario |
| --- | --- | --- |
| 5ª / 6ª | Muy cómoda | Apta para casi cualquier contexto. |
| 7ª | Cómoda-normal | Habitual en acordes y acompañamientos. |
| 8ª | Estándar | Límite cómodo universal aproximado. |
| 9ª | Posible, pero exigente | Conviene usarla con cuidado. |
| 10ª | Límite amplio | Recurso para manos grandes o escritura lenta. |
| 11ª o más | Excepcional | Normalmente se arpegia, redistribuye o evita. |

Reglas de escritura:

- Una octava por mano es una apertura segura.
- Una novena es razonable si no se repite rápido y no exige una posición torcida.
- Una décima es pianística, pero selectiva: no debe tratarse como requisito universal.
- Más de una décima no debería escribirse como simultáneo obligatorio.
- En voicings densos, el problema no es sólo la distancia extrema, sino el reparto entre manos. Es preferible distribuir bajo, notas guía y tensiones antes que concentrar una décima con notas interiores en una sola mano.
- Las combinaciones con teclas negras, la velocidad, la dinámica, el legato y la repetición pueden convertir una apertura aparentemente posible en una escritura incómoda.

Aplicación algorítmica:

- El acorde se evalúa buscando una partición plausible entre mano izquierda y mano derecha.
- Se considera segura cualquier mano que no supere la octava.
- La novena recibe una penalización suave.
- La décima recibe una penalización clara, mayor si además contiene notas interiores.
- Las aperturas superiores a la décima reciben una penalización fuerte para que el generador prefiera otra inversión, otra octava o una redistribución más natural.

