# Generación de progresiones

El constructor de progresiones utiliza un estado normalizado de controles de interfaz y lo transforma en bloques armónicos mediante reglas ponderadas.

## Mapa técnico de módulos

El flujo principal del generador se reparte en módulos pequeños para evitar que el constructor vuelva a concentrarse en un único archivo:

- `js/ui/progression-state-schema.js` define valores permitidos, valores por defecto y normalización de los controles.
- `js/ui/progression-state.js` lee controles del DOM y produce un estado estable para los casos de uso.
- `js/services/progression-planner-service.js` elige el patrón armónico general, los bloques de frase y la cadencia según el estilo, el modo y los controles de color.
- `js/services/progression-builder-service.js` coordina la generación completa desde el informe de escala y el estado normalizado.
- `js/services/progression-chord-plan-service.js` decide tríada, cuatríada, inversión, suspensión y tensiones antes de construir cada compás.
- `js/services/progression-voicing-*.js` resuelve factores, registros MIDI, inversión, disposición abierta/cerrada y puntuación de conducción de voces.
- `js/services/progression-measure-*.js` gestiona compases, segmentos internos, división en varios acordes y reconstrucción de la línea temporal.
- `js/services/progression-transport-*.js` contiene el transporte de UI: reproducción, atajos, drag and drop, menú contextual, botones y acciones de edición.
- `js/renderers/progression-*.js` separa etiquetas musicales, controles, línea temporal, menú contextual y composición del área de trabajo.
- `js/services/progression-midi-*.js` y `js/services/midi-export-service.js` convierten la progresión en eventos MIDI y archivo descargable.
- `js/application/progression-application.js` y `js/application/progression-playback-application.js` actúan como casos de uso, sin generar HTML ni leer controles directamente.

Las pruebas que necesitan cargar pilas largas de módulos deben usar `tests/helpers/script-loader.js` para leer el orden desde `js/bootstrap/script-manifest.js`, en lugar de duplicar listas extensas de scripts.

## Estilo de escritura

El control **Estilo** distingue dos enfoques iniciales:

- **Moderno**: evita cadencias auténticas finales como `V-I`, `V-i`, `viiº-I` o `viiº-i`. Prioriza semicadencias, cadencias plagales y cadencias rotas. Además, reduce la probabilidad de usar en exceso el segundo grado en tonalidades menores y el séptimo grado en tonalidades mayores, sin eliminarlos por completo.
- **Clásico**: favorece cadencias auténticas al final de la progresión, usando el retorno dominante-tónica como cierre estructural.

Esta distinción afecta a la selección de patrones completos y a los bloques de frase usados en progresiones largas. No cambia la escala ni los acordes disponibles; solo modifica la probabilidad y el tipo de cierre armónico elegido por el generador.

## Intercambio modal

El control **Intercambio** regula la probabilidad de usar acordes préstamo. El reemplazo se hace siempre sobre el mismo grado armónico: si el plan contiene un IV, el préstamo busca otros acordes construidos sobre el IV de una escala fuente relacionada.

Las fuentes disponibles son:

- La tonalidad paralela, por ejemplo `C menor natural` desde `C mayor` o `E mayor` desde `E menor`.
- La escala menor armónica sobre la misma tónica.
- Los modos griegos sobre la misma tónica: jónico, dórico, frigio, lidio, mixolidio, eólico y locrio.

El acorde inicial de la progresión queda excluido del intercambio para conservar una referencia tonal clara al comienzo. Cuando un acorde se genera por intercambio, la tarjeta de progresión conserva el grado funcional, pero muestra también la escala o tonalidad fuente de la que procede.

El menú contextual de cada acorde incluye una sección **Intercambio** con acordes del mismo grado tomados de esas mismas fuentes. Cada entrada permite elegir tríada o cuatríada y sus inversiones, igual que los acordes diatónicos.

## Densidad armónica y conducción de voces

Las progresiones se construyen por defecto con tríadas. Las cuatríadas con séptima se añaden de forma ocasional y ponderada cuando el nivel de tensiones, el contrapunto o el movimiento parsimonioso entre acordes lo justifican. El primer acorde no añade séptima si es una tónica, y el último acorde tampoco la añade cuando cierra en tónica.

El control **Tensiones** gobierna tanto la aparición de suspensiones como de tensiones añadidas. Las tensiones disponibles se calculan sobre los grados 9, 11 y 13 de la escala activa y se descartan cuando ya forman parte del acorde o quedan un semitono por encima de una nota estructural del acorde, porque esa relación produce clústers poco estables. En acordes sin séptima se cifran como `add9`, `add11` o `add13`; en cuatríadas se cifran como `9`, `11` o `13`, siguiendo la convención moderna de extensiones por encima de la séptima.

En escritura de cuatro o más voces, una tríada completa dobla factores del acorde cuando no hay tensiones disponibles: primero la fundamental, después la tercera y finalmente la quinta. Si el fader de tensiones activa notas disponibles, esas notas ocupan voces antes que los doblajes. En cuatríadas no se dobla la séptima, y las tensiones tampoco se doblan.

El control **Disposición** alterna entre escritura cerrada y abierta. En disposición cerrada, las voces superiores se mantienen dentro del registro más compacto posible y el generador penaliza aperturas innecesarias. En disposición abierta, el algoritmo abre la voz superior cuando es necesario para que el espacio entre voces superiores supere la octava, escogiendo la inversión que conserva el movimiento más parsimonioso frente al acorde anterior.

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
