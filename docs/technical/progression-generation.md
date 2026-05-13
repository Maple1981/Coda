# Generación de progresiones

El constructor de progresiones utiliza un estado normalizado de controles de interfaz y lo transforma en bloques armónicos mediante reglas ponderadas.

## Estilo de escritura

El control **Estilo** distingue dos enfoques iniciales:

- **Moderno**: evita cadencias auténticas finales como `V-I`, `V-i`, `viiº-I` o `viiº-i`. Prioriza semicadencias, cadencias plagales y cadencias rotas. Además, reduce la probabilidad de usar en exceso el segundo grado en tonalidades menores y el séptimo grado en tonalidades mayores, sin eliminarlos por completo.
- **Clásico**: favorece cadencias auténticas al final de la progresión, usando el retorno dominante-tónica como cierre estructural.

Esta distinción afecta a la selección de patrones completos y a los bloques de frase usados en progresiones largas. No cambia la escala ni los acordes disponibles; solo modifica la probabilidad y el tipo de cierre armónico elegido por el generador.

## Densidad armónica y conducción de voces

Las progresiones se construyen por defecto con tríadas. Las cuatríadas con séptima se añaden de forma ocasional y ponderada cuando el nivel de tensiones, el contrapunto o el movimiento parsimonioso entre acordes lo justifican. El primer acorde no añade séptima si es una tónica, y el último acorde tampoco la añade cuando cierra en tónica.

En escritura de cuatro o más voces, una tríada completa dobla factores del acorde antes de añadir material opcional: primero la fundamental, después la tercera y finalmente la quinta. Este orden sigue el modelo de trabajo de la aplicación, aunque cada caso puede ajustarse en el futuro con reglas más estrictas de estilo.

El generador elige inversiones para reducir el desplazamiento entre voces consecutivas. La nomenclatura usada es la tradicional:

- Tríadas: primera inversión `6`, segunda inversión `6/4`.
- Séptimas: primera inversión `6/5`, segunda inversión `4/3`, tercera inversión `4/2`.

La inversión se muestra junto al nombre del acorde y junto al grado armónico, por ejemplo `Cmaj7 4/3` y `Imaj7 4/3`. Internamente, cada compás conserva las notas por voz y sus alturas MIDI para que la preescucha y la exportación MIDI respeten mejor el voicing generado.

## Pedales, suspensiones y paralelas

El algoritmo valora positivamente las progresiones que enlazan acordes con notas comunes. Cuando dos acordes consecutivos comparten una o dos notas y el nivel de contrapunto lo favorece, esas notas pueden marcarse como pedales.

El comportamiento audible del pedal depende del instrumento. En instrumentos sostenidos, como órgano y cuerdas, la preescucha y la exportación MIDI prolongan el `noteOff` y omiten el `noteOn` duplicado en el compás siguiente. En instrumentos pulsados o percusivos, como piano y guitarra, la nota se reataca aunque sea común, para que la voz no quede muda por la caída natural del sonido.

Los acordes pueden suspender la tercera cuando la conducción de voces lo justifica. Las calidades menores, disminuidas y semidisminuidas tienden a `sus2`; las calidades mayores, dominantes y de séptima mayor tienden a `sus4`. El cifrado se muestra después de la inversión y antes de las tensiones añadidas, por ejemplo `G 6 sus4`, `Cm7 sus2` o `D7♭5 4/2 sus2`. Los grados reflejan la misma suspensión, por ejemplo `V 6 sus4` o `ii7♭5 4/2 sus2`.

Las suspensiones tienen un peso estadístico moderado: aumentan cuando el nivel de contrapunto o tensiones es mayor, cuando la articulación favorece continuidad y, sobre todo, cuando el acorde suspendido reduce o mantiene el movimiento entre voces respecto al acorde sin suspender. Si ninguna voz previa puede enlazar hacia la nota suspendida por tono o semitono, la suspensión sigue siendo posible, pero queda penalizada.

La puntuación de conducción penaliza quintas y octavas paralelas. La penalización es mayor cuando la paralela aparece entre las voces exteriores, especialmente bajo y soprano. Las paralelas interiores también restan calidad al voicing, aunque con menor peso.

## Compases divididos

Cada compás de la progresión puede dividirse en hasta cuatro acordes. El primer acorde conserva la función original del compás y los acordes añadidos se calculan como extensiones armónicas ponderadas, no como elecciones totalmente aleatorias.

La selección del acorde añadido prioriza tres criterios: notas comunes con el acorde inicial del compás, notas comunes con el acorde siguiente y coincidencia de función tonal. Esta regla favorece movimientos parsimoniosos y extensiones funcionales, especialmente extensiones de tónica. Por ejemplo, en `C` mayor, entre `C` y `F` puede aparecer `Am`, porque comparte `C` y `E` con `C`, y `A` y `C` con `F`.

Si el acorde desde el que se añade el nuevo segmento está suspendido, la primera regla es resolver la suspensión sobre el mismo acorde antes de buscar otro acompañante. Por ejemplo, después de `Esus4` se elige una variante de `E`, como tríada, cuatríada o inversión, según la conducción de voces más parsimoniosa.

El acorde inicial no puede retirarse. Los acordes añadidos pueden retirarse y, mientras no se haya alcanzado el máximo de cuatro acordes por compás, también pueden servir como punto de inserción para nuevos acordes. La preescucha y la exportación MIDI tratan todos los acordes del compás como eventos reales de duración proporcional, de modo que la división visual coincide con el resultado audible y exportado.

## Sustitución manual de acordes

Cada acorde del visualizador puede sustituirse manualmente desde un menú contextual. La lista se ordena por utilidad armónica: primero aparecen los acordes con la misma función tonal, después los acordes que comparten notas con el acorde actual y, finalmente, el resto de acordes de la tonalidad.

Cada entrada permite escoger tríada o cuatríada, incluyendo sus inversiones disponibles: estado fundamental, `6` y `6/4` para tríadas; estado fundamental, `6/5`, `4/3` y `4/2` para cuatríadas. Al aplicar una sustitución, el generador conserva la duración y posición del acorde dentro del compás y recalcula el voicing con la misma lógica de conducción de voces.

En cuatríadas de tres voces se omite la quinta para conservar tónica, tercera y séptima. La excepción son los acordes semidisminuidos y disminuidos con séptima: en ellos se omite la séptima para dejar una tríada disminuida clara.

## Metrónomo

La preescucha de progresiones puede activar un metrónomo desde los controles de transporte. El clic se genera con Web Audio en tiempo de ejecución, no mediante soundfonts, para evitar nuevas dependencias, descargas de samples y latencia de carga. El primer pulso de cada compás usa un acento más agudo y los demás pulsos usan un clic más ligero.
