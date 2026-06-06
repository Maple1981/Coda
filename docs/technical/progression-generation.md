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
- `js/services/progression-timing-service.js` centraliza el contrato temporal de compases y segmentos para que edición, retarget de secciones, playback y exportación compartan la misma lectura de pulsos y segundos.
- `js/services/progression-measure-*.js` gestiona compases, segmentos internos, división en varios acordes y reconstrucción de la línea temporal.
- `js/services/progression-section-document-service.js` define el contrato estructural de secciones: rangos de compases, sección previa, sección siguiente y transiciones modulantes entre origen y destino.
- `js/services/progression-section-retarget-service.js` reemplaza el contexto tonal de una sección existente conservando índices, tiempos absolutos, metadatos de sección y limpieza de modulaciones obsoletas.
- `js/services/progression-section-modulation-service.js` prepara las transiciones entre secciones: dominante secundaria, acorde pivote, modulación directa y metadatos de análisis.
- `js/services/progression-section-operations-service.js` ofrece una fachada para generar, modular y retargetear secciones sin exponer a la UI los detalles de servicios internos.
- `js/services/progression-harmonic-analysis-service.js` define el contrato analítico formal de la progresión final: transiciones de sección, fuente de cada compás y datos de modulación normalizados.
- `js/services/progression-analysis-label-service.js` deriva las etiquetas explicativas visibles desde el documento final de progresión; así una etiqueta de pivote o dominante secundaria sólo aparece si la relación de secciones sigue siendo válida.
- `js/services/progression-transport-*.js` contiene el transporte de UI: reproducción, atajos, drag and drop, menú contextual, botones y acciones de edición.
- `js/ui/progression-generation-events-controller.js` concentra los eventos DOM que generan progresiones, añaden secciones, cambian el tipo de sección siguiente o eliminan secciones.
- `js/ui/circle-of-fifths-popover-controller.js` concentra el popup del círculo de quintas, incluyendo render, apertura, cierre, arrastre y enrutado de targets globales o de sección.
- `js/ui/workbench-instrument-menu-controller.js` concentra el menú de instrumento del workbench para que el controlador principal no gestione HTML ni estado abierto/cerrado de ese desplegable.
- `js/renderers/progression-*.js` separa etiquetas musicales, controles, línea temporal, menú contextual y composición del área de trabajo.
- `js/services/progression-midi-*.js` y `js/services/midi-export-service.js` convierten la progresión en eventos MIDI y archivo descargable.
- `js/application/progression-application.js` y `js/application/progression-playback-application.js` actúan como casos de uso, sin generar HTML ni leer controles directamente.

Las pruebas que necesitan cargar pilas largas de módulos deben usar `tests/helpers/script-loader.js` para leer el orden desde `js/bootstrap/script-manifest.js`, en lugar de duplicar listas extensas de scripts.

La forma pública de documentos, secciones, compases y segmentos está fijada en `docs/technical/progression-segment-contract.md`. Las reglas nuevas del generador deben respetar ese contrato antes de llegar a renderers, playback, exportación MIDI o persistencia local.

## Forma y secciones

La progresión se organiza en secciones musicales. La sección `A` nace de los controles globales del área de trabajo y funciona como punto de referencia formal. Desde el control **Siguiente sección**, el usuario puede añadir `A'` como clon literal de `A`, `A'` con pequeñas variaciones, o una sección `B` contrastante.

Una sección contrastante puede conservar la tonalidad con apertura de función subdominante, usar la relativa, la paralela o desplazarse a una vecina del círculo de quintas. Después de crear `B`, el mismo control puede añadir `B'` como clon literal o como variación ligera. La siguiente sección contrastante toma la letra `B` si todavía no existe, o `C` si `B` ya está presente, y busca un contexto nuevo frente a los ya usados por `A`, `A'` y `B`.

Cada sección generada guarda una copia del estado de escritura con el que nació: compases, compás, tempo, voces, disposición, articulación, estilo, intercambio, cromatismo, tensiones, contrapunto y parámetros expresivos. Los clones copian los compases ya editados por el usuario; las variaciones sustituyen de forma ligera entre uno y tres acordes, según la duración y el azar, para producir una variación reconocible sin descartar la sección fuente.

Regla dura de preservación: una progresión marcada como `userEdited` no puede pasar por generación completa al cambiar controles como compás, tempo, voces, disposición, estilo, tensiones, cromatismo o contrapunto. Esos cambios sólo pueden transformar el documento existente: actualizar tiempos, duraciones, voicings, expresión o, si aumenta el número de compases, extender el material mediante repetición conservadora de lo ya generado. La llamada a `generateProgressionFromState` queda reservada para acciones explícitas del usuario como **Generar progresión** o **Siguiente sección**; cualquier regresión en la que un control regenere una secuencia nueva debe considerarse un fallo crítico de preservación.

Regla dura de retarget de sección: cuando el usuario cambia la tonalidad o modalidad de una sección existente desde su círculo de quintas, sólo se sustituye el material de esa sección. El documento debe conservar la cantidad de secciones, los `startIndex`, la numeración de compases, los tiempos absolutos y la cabeza de reproducción en un estado válido. Si la sección retargeteada recibía una modulación desde la sección previa, esa modulación deja de ser válida y sus etiquetas se limpian tanto en la sección de origen como en la sección de destino.

Regla de explicación: los metadatos generados no bastan por sí solos para mostrar una etiqueta analítica. Antes de renderizar recursos como **Acorde pivote** o **Dominante secundaria**, la capa de análisis comprueba que existe una sección relacionada, que el tipo de modulación coincide y que la relación origen-destino continúa vigente tras ediciones, borrados o cambios de tonalidad.

Pendiente de producto: queda previsto un panel discreto de transición entre secciones. Debería leer `CodaProgressionHarmonicAnalysis` y resumir relaciones como `A -> B: Acorde pivote, Am = vi en C / ii en G`, sin introducir una nueva fuente de verdad ni duplicar etiquetas en los renderers.

Prueba de regresión: `tests/progression-section-flow-smoke-tests.js` cubre el flujo crítico de composición por secciones: crear `A`, añadir `B` contrastante con pivote, verificar la etiqueta analítica, retargetear `B` desde el círculo y comprobar que se conservan secciones, compases ordenados y agenda de reproducción válida.

La cobertura UI queda separada en pruebas focales y una integración larga: `progression-ui-controls-instruments-tests.js` cubre controles de instrumento, `progression-section-flow-smoke-tests.js` cubre secciones y círculo, y `progression-ui-behavior-tests.js` conserva el recorrido integral de estado, preservación, expresión y regresiones combinadas.

La evolución de cambios de centro tonal está separada en `docs/technical/progression-modulation-planning.md`. El primer tramo implementado distingue entre la elección del contexto de la sección nueva y el modo de llegar a él. Desde **Siguiente sección** puede escogerse sin modulación, modulación directa, acorde pivote o dominante secundaria. La opción **Sin modulación** mantiene la tonalidad de partida, pero genera una sección contrastante que no arranca en la tónica: empieza preferentemente en otro acorde con función de tónica o en área subdominante. La modulación directa sólo registra el cambio de contexto; la dominante secundaria sustituye el último compás de la sección previa por el `V7` de la tonalidad destino; el acorde pivote se trata como bisagra o zona de transición al final de la sección de salida. Esa zona contiene entre uno y tres acordes pivote reales, elegidos de forma aleatoria dentro de ese límite y aplicados sobre los últimos acordes efectivos de la sección previa. Si un compás está dividido, cada acorde interno cuenta como un posible slot pivote, de modo que el penúltimo compás puede aportar uno o varios pivotes si sus acordes finales son adecuados. El grado visible sigue siendo el de la sección de origen, y la etiqueta del pivote añade la reinterpretación en la tonalidad de llegada, por ejemplo `Acorde pivote: iii en F mayor`. Por definición, una modulación por pivote no puede escoger como destino el mismo informe tonal de salida: si la sección parte de `B` mayor, la sección nueva debe situarse en otra tonalidad compatible y cada pivote debe ser un acorde común real entre ambos contextos.

El primer acorde de una progresión tonal recibe un sesgo formal propio. En una sección de apertura, especialmente `A`, el arranque en dominante se considera una excepción muy rara, porque una progresión necesita presentar primero el centro o una preparación estable. El reparto normal favorece de forma clara `I` o `i`; con menor probabilidad puede empezar en otro grado con función de tónica, y de forma aún más moderada en área subdominante. Los grados de función dominante sólo sobreviven como pequeña anomalía expresiva o cuando una regla explícita de sección los solicita.

Al añadir `C` después de `B`, la relación tonal se calcula desde la sección inmediatamente anterior, no desde `A`. Así se modelan transiciones `A -> B` y `B -> C` con el mismo criterio formal. Los metadatos quedan guardados en `section.modulation`, con el tipo elegido, sección de origen, sección de destino, contexto de llegada y, cuando procede, número y lecturas de llegada de los pivotes. Los acordes usados como transición se marcan con `modulationRole`; la etiqueta **Acorde pivote** sólo se muestra si existe una sección contrastante relacionada cuya modulación sea realmente de tipo pivote. La sección nueva no repite por obligación los acordes pivote: arranca con material propio del nuevo contexto y confirma la tonalidad mediante su plan armónico normal.

## Estilo de escritura

El control **Estilo** se organiza como una cadena histórica de perfiles: **Renacimiento**, **Barroco**, **Clásico**, **Romántico**, **Impresionista** y **Contemporáneo**. El valor antiguo `modern` queda como alias interno de **Contemporáneo** para no romper preferencias locales guardadas.

La capa común a todos los estilos es el **movimiento parsimonioso**: el generador intenta conservar notas comunes, mover voces con economía, evitar paralelismos duros, impedir rachas excesivas de una misma inversión y mantener el registro alrededor de una zona central útil. Esta capa funciona como estilo padre: no sustituye a los perfiles históricos, sino que los atraviesa.

Los perfiles actuales quedan compartimentados así:

- **Renacimiento**: punto de partida para contrapunto vocal modal, con independencia de líneas, preparación de disonancias, menor densidad armónica y cadencias menos dependientes del dominante funcional. Reduce el uso de grados disminuidos y favorece cierres plagales o menos conclusivos.
- **Barroco**: contrapunto instrumental armónico, con bajo direccional, secuencias, dominantes, disonancias preparadas y plantillas de partimento. Favorece patrones como regla de la octava, romanesca, círculo de quintas, bajos por grados e inversiones `6` cuando ayudan a dibujar una línea de bajo más activa.
- **Clásico**: marco tónica-dominante. Favorece cadencias auténticas, 6/4 cadenciales y preparación-resolución de disonancias, incluyendo séptimas.
- **Romántico**: marco funcional extendido. Hereda la lógica clásica, pero deja preparado un mayor peso para cromatismo, intercambio modal, dominantes, tensiones y disolución progresiva de la tonalidad estricta.
- **Impresionista**: giro hacia color, modalidad y ambigüedad. Por ahora suaviza la atracción dominante y reserva espacio para planing, acordes paralelos y campos armónicos menos funcionales.
- **Contemporáneo**: continuación del antiguo estilo moderno. Mantiene la conducción parsimoniosa, pero evita cadencias auténticas finales como `V-I`, `V-i`, `viidim-I` o `viidim-i`, priorizando semicadencias, cadencias plagales y cadencias rotas. En menor conserva preferentemente el `v` modal frente al `V` con sensible y minimiza, sin prohibir por completo, el uso de grados disminuidos o semidisminuidos.

Esta distinción afecta a la selección de patrones completos, a los bloques de frase usados en progresiones largas y al tipo de cierre armónico elegido. No cambia la escala ni los acordes disponibles; modifica la probabilidad y la lectura funcional de los recursos.

En tonalidades menores, los estilos **Barroco**, **Clásico** y **Romántico** tratan el quinto grado como dominante tonal. Por tanto, cuando la escala principal es menor natural o menor melódica descendente, el `V` o `V7` se toma de una fuente con sensible, preferentemente la menor armónica sobre la misma tónica. Esto evita cierres modales `v-i` en contextos que deben sonar funcionales y permite que aparezcan dominantes mayores o dominantes séptima como `G`/`G7` en `C` menor.

Los perfiles de estilo ya no actúan sólo como interruptores de cadencia. También exponen afinidades internas que el generador usa al puntuar patrones y bloques de frase:

- **Barroco** multiplica el peso de formas de partimento, círculo, regla de la octava y romanesca; además incrementa ligeramente la densidad armónica y la aparición de séptimas preparadas.
- **Renacimiento**, **Impresionista** y **Contemporáneo** aplican un factor de reducción a grados sensibles disminuidos cuando el estilo busca menos atracción dominante.
- **Clásico** favorece formas periódicas y cadencias funcionales claras.
- **Romántico** conserva el marco funcional, pero tolera más densidad, séptimas y secuencias.

Las plantillas de partimento pueden guardar metadatos por grado, por ejemplo inversiones forzadas. Así una fórmula de regla de la octava puede pedir `V 6` o `I 6` sin esperar a que el voicing lo decida por azar. Este mecanismo sigue usando el contrato normal de progresión: el grado se resuelve primero y la medida final sólo recibe el acorde, la inversión y las marcas habituales.

Los estilos que requieren disonancia preparada activan la capa documentada en `docs/technical/classical-dissonance.md`. Las suspensiones, notas de paso y tensiones añadidas deben responder al ciclo preparación-aparición-resolución: una disonancia debe estar justificada por el contexto anterior o por movimiento conjunto, sonar como tensión controlada y resolver por paso hacia una nota estructural.

## Repetición directa de acordes

El planificador puede repetir de forma esporádica el mismo acorde en dos compases consecutivos para producir insistencia, reposo o respiración armónica. No se aplica en progresiones de dos compases. En secciones de cuatro compases la probabilidad es mínima; aumenta moderadamente en ocho, dieciséis y treinta y dos compases, pero sigue limitada a una repetición directa por plan para que no se convierta en un rasgo dominante.

La repetición se aplica después de resolver dominantes menores, intercambio modal y sesgos de apertura, de modo que se copia el acorde real previsto para el compás anterior. El planificador evita alterar los dos últimos compases para preservar la cadencia final y también evita duplicar grados marcados como cadenciales o cromáticos obligatorios.

## Cadencias finales

El catálogo técnico de progresiones incluye una pequeña biblioteca de cadencias finales en `js/data/progression-rules-data.js`. El planificador las usa como cierres ponderados y, cuando procede, añade metadatos por grado para forzar inversiones, evitar suspensiones aleatorias o fijar la función tonal mostrada.

La **cadencia 6/4** se modela principalmente como `I-I 6/4-V-I`. El segundo acorde es la tónica en segunda inversión, pero se marca internamente con función dominante porque actúa como una suspensión cadencial sobre el quinto grado: el bajo pasa al grado 5, mientras los grados 1 y 3 de las voces superiores preparan la resolución hacia el dominante. El dominante siguiente puede generarse como tríada `V` o como cuatríada `V7`; en ambos casos se evita añadir tensiones o suspensiones accidentales para que el gesto cadencial quede claro.

También existe una variante en la que el `I 6/4` queda precedido por un predominante diatónico, especialmente `IV` o `ii`, y en modo menor también `VI`. Así pueden aparecer cierres del tipo `IV-I 6/4-V-I` o `ii-I 6/4-V-I`, manteniendo la consideración funcional dominante para el `I 6/4`. Las variantes donde un predominante aparece después del `I 6/4`, como `I-I 6/4-ii-V`, quedan reservadas para una futura división interna de compás, porque necesitan más de un acorde dentro del tramo cadencial para conservar también la resolución final.

El **6/4 auxiliar** se distingue del cadencial. En este uso, el bajo se mantiene como pedal y se superpone un acorde en segunda inversión que comparte ese mismo bajo, por ejemplo `Cm-Fm/C` o `Dº-G7/D`. El generador ya puede producir inversiones `6/4` por conducción parsimoniosa; solo se les asigna función dominante cuando forman parte explícita de la cadencia 6/4.

Los estilos funcionales y un valor alto de **Contrapunto** aumentan la probabilidad de que esta cadencia aparezca al final de la sección, pero no la fuerzan siempre. En estilo **Contemporáneo** queda como una posibilidad mucho más rara, subordinada a la preferencia general por semicadencias, cadencias plagales y cadencias rotas.

## Cromatismo cadencial

El control **Cromatismo** regula la probabilidad de introducir notas ajenas a la escala dentro de cierres tonales. De momento actúa de forma conservadora: solo interviene cuando la progresión trabaja en armonía funcional y favorece acordes cromáticos de preparación de dominante, no cambios arbitrarios en cualquier punto de la frase.

La **sexta napolitana** se modela como un acorde mayor sobre el `♭II`, normalmente en primera inversión (`N6`). Conserva función de subdominante y tiende a resolver hacia `V`, `V7` o hacia una cadencia con `I 6/4` intermedio. En `C` menor o mayor, el caso básico sería `D♭/F-G7-C` o `D♭/F-C/G-G7-C`.

Los **acordes de sexta aumentada** se modelan como sonoridades de área subdominante que contienen `♭6`, `1` y `#4`, con variantes italiana, francesa y suiza. Su destino preferente es el dominante; cuando el contexto lo favorece, pueden resolver primero en un `I 6/4` cadencial para suavizar la conducción de voces antes de alcanzar `V` o `V7`.

El estilo pondera de forma explícita la aparición de estos recursos. En Renacimiento la napolitana queda como rareza modal o frigia y las sextas aumentadas prácticamente desaparecen como categorías funcionales. En Barroco la napolitana y la italiana ganan peso, mientras que francesa y alemana quedan como recursos tardíos y la suiza no se trata como categoría histórica propia. En Clasicismo la napolitana, italiana, francesa y alemana son recursos asentados; la suiza queda como lectura analítica o enarmónica. En Romanticismo suben especialmente la napolitana, la francesa y la alemana, por su utilidad dramática, cromática y modulante.

El **Sub Five** se modela como dominante sustituto con función `D`: un acorde mayor con séptima menor cuya fundamental queda un semitono por encima del acorde de destino, por ejemplo `D♭7` como sustituto de `G7` para resolver en `C`. Solo entra de forma esporádica con **Cromatismo** alto o muy alto. Puede resolver directamente en `I`, o aparecer como `SubV/V -> V -> I`; en semicadencias puede cerrar como `SubV/V -> V`. Algunas apariciones fuerzan inversión `4/2` cuando hay voces suficientes, para reflejar el uso habitual del acorde con la séptima en el bajo.

Estas cadencias cromáticas tienen más peso con valores altos de **Cromatismo**, con estilos funcionales y con mayor **Contrapunto**, porque necesitan una conducción clara de las notas alteradas hacia su destino. No se aplican al inicio de la progresión ni al núcleo modal básico, donde podrían destruir la gravitación modal y convertir el resultado en una progresión funcional.

## Armonía modal básica

Cuando la escala elegida es un modo griego, el generador cambia de arquitectura armónica. En lugar de buscar progresión funcional hacia dominante y tónica, usa un plan modal específico: centro estable, retorno frecuente al acorde de tónica, ausencia de cadencias `V-I` tonales y preferencia por bajos que se mueven por segunda o tercera.

Los patrones modales se construyen como vamps o puentes alrededor de la tónica y de uno o varios acordes cadenciales modales. Estos acordes exponen la nota característica del modo en factores triádicos y reafirman el centro sin usar la lógica de dominante tonal. El planificador toma esos acordes desde la misma tabla de **Acordes de la modalidad** que ve el usuario: el acorde de tónica recibe la máxima prioridad, los acordes marcados como cadenciales reciben la segunda prioridad y los acordes marcados como **acorde a evitar** quedan excluidos del plan modal. La única salvedad es el centro de locrio, porque la tónica disminuida puede ser inestable y, aun así, debe existir como punto de referencia modal.

En progresiones modales se evita añadir séptimas dominantes cuando el acorde resultante sería propio del sistema tonal. Por ejemplo, el `IV` dórico o el `II` lidio se prefieren como tríadas para mostrar la nota característica del modo sin convertir el gesto en una dominante funcional. Las tensiones y suspensiones quedan subordinadas a esta lectura modal: la tónica y los acordes cadenciales modales reducen adornos accidentales para preservar la identidad del modo.

El **6/4 auxiliar** pertenece bien a este terreno modal cuando mantiene un bajo pedal y coloca encima una segunda inversión que comparte ese bajo, como `Cm-Fm/C`. De momento, el motor puede producir inversiones `6/4` por conducción parsimoniosa; una futura mejora puede etiquetar explícitamente estos casos como auxiliares cuando el bajo actúe como pedal modal.

## Segunda capa modal futura

Además de las reglas modales básicas ya activas, el catálogo técnico conserva una segunda capa de ideas marcadas como futuras en `js/data/progression-rules-data.js`. Estas reglas no tienen prioridad en el generador actual y no alteran todavía la selección de progresiones; funcionan como apuntes estructurados para ampliar la escritura modal cuando el núcleo tonal y modal sea más estable.

Las reglas futuras incluyen melodías finales modales, el truco de dos acordes característicos, desplazamientos de centro manteniendo el modo, engaños modales, gestos propios del eólico, estabilización del locrio sin quinta, movimientos modales por semitono, modulación entre modos y mezclas controladas entre modalidad y tonalidad. La intención es que estas ideas se conviertan más adelante en heurísticas ponderadas, no en obligaciones rígidas.

Cuando se activen, deberán seguir dos límites: conservar la gravitación modal hacia la tónica y evitar que los recursos de color acaben imponiendo una lectura funcional `V-I` salvo que se esté modelando deliberadamente una mezcla modal-tonal. En particular, los gestos por semitono deben diferenciarse de la sensible tonal, y los cambios de modo deben introducir las alteraciones nuevas de forma gradual para no romper el centro auditivo sin intención.

## Intercambio modal

El control **Intercambio** regula la probabilidad de usar acordes préstamo. El reemplazo se hace siempre sobre el mismo grado armónico: si el plan contiene un IV, el préstamo busca otros acordes construidos sobre el IV de una escala fuente relacionada.

Las fuentes disponibles son:

- La tonalidad paralela, por ejemplo `C menor natural` desde `C mayor` o `E mayor` desde `E menor`.
- La escala menor armónica sobre la misma tónica.
- Los modos griegos sobre la misma tónica: jónico, dórico, frigio, lidio, mixolidio, eólico y locrio.

El acorde inicial de la progresión queda excluido del intercambio para conservar una referencia tonal clara al comienzo. Cuando un acorde se genera por intercambio, la tarjeta de progresión conserva el grado funcional, pero muestra también la escala o tonalidad fuente de la que procede.

Las escalas fuente de intercambio y la escala paralela usan su propia preferencia de armadura, calculada con las reglas del círculo de quintas. Así, desde `C` mayor, la paralela `C` menor se escribe con `E♭`, `A♭` y `B♭`, aunque la escala principal no necesite alteraciones. Para favorecer esa lectura, `C` mayor recomienda bemoles como formato inicial cuando no hay una preferencia guardada del usuario.

El menú contextual de cada acorde incluye una sección **Intercambio** con acordes del mismo grado tomados de esas mismas fuentes. Cada entrada permite elegir tríada o cuatríada y sus inversiones, igual que los acordes diatónicos.

## Densidad armónica y conducción de voces

Las progresiones se construyen por defecto con tríadas. Las cuatríadas con séptima se añaden de forma ocasional y ponderada cuando el nivel de tensiones, el contrapunto o el movimiento parsimonioso entre acordes lo justifican. El primer acorde no añade séptima si es una tónica, y el último acorde tampoco la añade cuando cierra en tónica.

El control **Densidad armónica** regula cuántos acordes se insertan dentro de cada compás. Con valores bajos, el generador mantiene la escritura de un acorde por compás salvo apariciones ocasionales cerca de puntos de llegada. Con valores altos, divide más compases en varios segmentos, usando la misma lógica armónica que el botón `+` de cada acorde para elegir acordes compatibles. La probabilidad aumenta especialmente en los compases que preparan finales de frase o sección, como los compases 3, 7 u 11 en bloques de cuatro compases, aunque no se limita a ellos. El último acorde del conjunto generado queda excluido y ocupa siempre el compás completo.

Cuando un compás contiene varios acordes, sus duraciones se ajustan a pulsos completos siempre que el número de acordes quepa dentro del número de pulsos del compás. Por ejemplo, tres acordes en `4/4` se reparten como `2 + 1 + 1`, con el segmento largo escogido de forma aleatoria; dos acordes en `3/4` se reparten como `2 + 1`. Si hay más acordes que pulsos disponibles, el sistema conserva el reparto proporcional para evitar duraciones nulas.

La elección del número de acordes también se sesga según el tipo de compás: en compases binarios se favorecen `1`, `2` y `4` acordes, por lo que `3` aparece de forma mucho más esporádica; en compases ternarios se favorecen `1` y `3`, reduciendo la aparición de `2` y `4`. Los compases irregulares conservan una distribución más neutra.

El control **Contrapunto** regula el movimiento parsimonioso de voces, su independencia melódica y la adhesión a reglas clásicas como la evitación de quintas y octavas paralelas. En valores altos, el generador elige una voz melódica para cargar con más movimiento independiente: normalmente la voz superior, aunque ocasionalmente puede ser el bajo o una voz interior. Esa voz conserva factores del acorde en los tiempos fuertes y puede insertar notas de paso en tiempos débiles cuando pertenecen a la escala de origen del acorde y enlazan por movimiento cercano hacia el siguiente voicing. En estilos con disonancia preparada, esas notas de paso deben rellenar un movimiento por grado conjunto en una sola dirección.

Además de evitar quintas y octavas paralelas, la selección de voicings penaliza el cuarto acorde consecutivo con la misma inversión. La regla impide que una progresión avance demasiado tiempo "en bloque" con la misma disposición, por ejemplo cuatro tríadas seguidas en `6/4`, aunque la conducción individual no produzca paralelismos perfectos.

Las notas de paso no sustituyen al acorde: son eventos melódicos breves superpuestos a la duración del compás o segmento. Si el acorde procede de intercambio modal, las notas de paso se toman de la escala fuente del préstamo, no de la escala principal, para mantener coherencia con el color armónico elegido.

El control **Tensiones** gobierna tanto la aparición de suspensiones como de tensiones añadidas. Las tensiones disponibles se calculan sobre los grados 9, 11 y 13 de la escala activa y se descartan cuando ya forman parte del acorde o quedan un semitono por encima de una nota estructural del acorde, porque esa relación produce clústers poco estables. En acordes sin séptima se cifran como `add9`, `add11` o `add13`; en cuatríadas se cifran como `9`, `11` o `13`, siguiendo la convención moderna de extensiones por encima de la séptima. En estilos con disonancia preparada, las tensiones añadidas dejan de ser color libre: se limitan a una sola nota en contextos dominantes, cadenciales o cromáticos, y deben poder resolver por paso a un factor del acorde siguiente.

En escritura de cuatro o más voces, una tríada completa dobla factores del acorde cuando no hay tensiones disponibles: primero la fundamental, después la tercera y finalmente la quinta. Si el fader de tensiones activa notas disponibles, esas notas ocupan voces antes que los doblajes. En cuatríadas no se dobla la séptima, y las tensiones tampoco se doblan.

El control **Disposición** alterna entre escritura cerrada y abierta. En disposición cerrada, las voces superiores se mantienen dentro del registro más compacto posible y el generador penaliza aperturas innecesarias. En disposición abierta, el algoritmo abre la voz superior cuando es necesario para que el espacio entre voces superiores supere la octava, escogiendo la inversión que conserva el movimiento más parsimonioso frente al acorde anterior. Además, si el bajo cae en registros graves o extremos, se aplica una regla de claridad de arreglo: cuanto más baja esté la voz inferior, mayor debe ser la separación con la siguiente voz. Si un candidato queda demasiado cerrado abajo, una o varias voces superiores se desplazan una octava arriba para evitar un sonido embarrado.

El primer acorde de una progresión que empieza en tónica favorece claramente el estado fundamental. La primera inversión de la tónica inicial puede aparecer con baja probabilidad, y las inversiones más inestables sólo con una probabilidad mínima. Fuera de esos casos raros, el scoring penaliza las inversiones iniciales para que `I` o `i` en estado fundamental sea el arranque normal.

La selección de voicings incluye una fuerza suave de centrado registral. El centro se calcula a partir de la tónica cercana al C central, y la puntuación penaliza progresivamente los voicings cuyo centro de masa se aleja demasiado. Esta regla no impide excepciones ni saltos expresivos, pero evita que las progresiones largas deriven estadísticamente hacia registros demasiado graves o demasiado agudos.

El bloque armónico generado evita comenzar en registros demasiado graves: los voicings se construyen alrededor de la tónica central y el centro registral objetivo queda por encima de ella, de modo que el bajo tienda a la segunda octava útil o superior según el instrumento. La disposición cerrada y la abierta comparten esta regla de registro; la abierta añade separación interna, pero no debe arrastrar el bajo hacia la primera octava.

## Melodía generada

Cada progresión generada recibe una línea melódica estructural derivada de una voz real del acorde, normalmente la voz superior. La melodía no se construye como una pista ajena a la armonía: el generador toma los factores del acorde disponible en cada compás, escoge una nota cantable para esa voz y actualiza sus alturas MIDI para que la preescucha, el render de notas y la exportación MIDI compartan el mismo resultado.

El control **Generar voz melódica** permite desactivar esta capa. Cuando está apagado, la progresión conserva sólo el acompañamiento armónico: no se anotan nuevos eventos melódicos, la preescucha ignora cualquier metadato melódico residual y la exportación MIDI no añade esa voz.

La selección de la nota melódica aplica las reglas de `docs/theory/34-melodia-linea-esencial.md`: favorece movimiento conjunto y terceras, penaliza saltos amplios sin compensación, evita tritonos expuestos, pide cambio de dirección después de saltos grandes y trata `7̂`, `6̂` y `4̂` como grados activos con tendencia de resolución. En el primer compás, si la armonía es tónica, se favorece un factor estable; en el cierre, si la progresión llega a tónica, la fundamental recibe prioridad para producir reposo.

Cuando el control **Contrapunto** es alto, la misma capa puede añadir notas de paso entre una nota estructural y la siguiente. Estas notas no crean acordes nuevos: son eventos melódicos breves asociados a la misma voz. En reproducción sostenida, la voz melódica deja de sonar como bloque continuo y se articula como línea: nota estructural, nota de paso y llegada al siguiente compás. Las demás voces mantienen el acorde.

Aunque no haya notas de paso, la voz melódica estructural se exporta como evento propio de nota. En la preescucha, el resto del acorde queda ligeramente atenuado y la voz melódica se realza con una velocidad estable; en articulación **Sostenido**, este realce no depende de **Intensidad**, **Humanización** ni **Swing**.

La melodía tiene además una capa rítmica independiente, documentada en `docs/theory/37-melodia-ritmo-generativo.md`. El generador escoge pseudoaleatoriamente un tipo de comienzo tético, acéfalo o anacrúsico, un motivo rítmico, una célula interválica breve y una curva melódica global. A partir de esa decisión crea eventos con negras, corcheas, semicorcheas, silencios, anticipaciones, retardos, bordaduras o repeticiones. La armonía puede seguir ocupando el compás completo, pero la voz melódica queda subdividida para que se perciba como línea real.

La célula melódica funciona como gancho: se repite durante la progresión y se transforma por inversión, retrogradación, pequeña variación de uno de sus intervalos y cambios moderados de duración. El generador mantiene un vocabulario pequeño, normalmente de dos células y ocasionalmente tres: una célula de pregunta y una de respuesta. En cada bloque de cuatro compases, los dos primeros presentan o varían la pregunta, el tercer compás responde y el cuarto prepara un pequeño cierre de sentencia. Los compases 4, 8, 12, 16, 20, 24, 28 y 32 tienden así a contener una respiración melódica o un cierre local, sin obligar a una cadencia armónica fuerte en todos ellos.

El objetivo no es maximizar notas, sino conservar una huella rítmica e interválica reconocible. El plan de contorno puede ascender hacia el final, descender hacia el final, formar un arco con punto alto central o un arco invertido con punto bajo central. Las notas resultantes siguen puntuándose por parsimonia, resolución de grados activos, pertenencia al acorde en pulsos fuertes y registro cantable.

Si la progresión termina sobre el primer grado, el cierre final de la melodía favorece las notas estables de la escala con un orden claro: `1̂` recibe el mayor peso, `3̂` queda como alternativa estable y `5̂` sólo recibe un apoyo débil. La regla actúa como sesgo de cadencia melódica, no como bloqueo absoluto, para que la conducción por paso siga pudiendo evitar saltos torpes.

Cuando un compás se divide en dos o más acordes, los eventos melódicos del compás se proyectan sobre cada segmento interno. Cada acorde recibe sólo la porción temporal de melodía que le corresponde, conservando silencios, anticipaciones y notas mantenidas que crucen el cambio armónico. Esto evita que la melodía se corte al añadir acordes dentro de un mismo compás.

La salida audible y MIDI de la melodía se desplaza una octava por encima de la voz estructural de origen. La regla no altera los voicings ni las notas de los acordes: sólo separa la línea melódica para que no compita con el acompañamiento.

La repetición inmediata de una misma altura se trata como recurso excepcional. La capa melódica mantiene un presupuesto máximo cercano al 5 % de las notas emitidas; si una nota prevista repite la anterior y no entra en ese margen, se sustituye por silencio, apoyatura, trino breve o nota de arpegio del acorde. La repetición deja de ser textura por defecto y pasa a ser un gesto anecdótico.

La voz melódica es monofónica: antes de reproducir o exportar, sus eventos se ordenan temporalmente y cada evento se recorta contra el comienzo del siguiente. Si un recorte deja duración nula, el evento se descarta. De momento no se permiten solapamientos dentro de la línea melódica.

Los comienzos acéfalos tienen peso real en la generación: una frase puede dejar vacío el primer pulso y entrar en una subdivisión o en otro pulso posterior. En cambio, el último pulso de los compases no finales queda protegido contra silencios aleatorios, porque suele servir de enlace hacia el compás siguiente. Además, algunos compases no finales pueden recortar su nota larga final para insertar una conexión breve de `1/8` o `1/16`, normalmente como nota de paso, bordadura o anticipación hacia el compás siguiente. El silencio en ese punto se reserva sobre todo para el acorde final del conjunto, donde puede funcionar como respiración conclusiva.

Los controles del constructor se aplican también sobre la progresión en curso mediante `CodaProgressionDocumentTransform`. Cuando la progresión ya contiene ediciones del usuario, la aplicación no descarta sus compases, secciones ni acordes añadidos: reinterpreta el material existente con el nuevo estado, recalculando voicings, tensiones, número de voces, duraciones, pedales y parámetros expresivos. El botón **Generar progresión aleatoria** sigue usando esos mismos controles para crear material nuevo desde cero.

El generador elige inversiones para reducir el desplazamiento entre voces consecutivas. La nomenclatura usada es la tradicional:

- Tríadas: primera inversión `6`, segunda inversión `6/4`.
- Séptimas: primera inversión `6/5`, segunda inversión `4/3`, tercera inversión `4/2`.

La inversión se muestra junto al nombre del acorde y junto al grado armónico, por ejemplo `Cmaj7 4/3` y `Imaj7 4/3`. Internamente, cada compás conserva las notas por voz y sus alturas MIDI para que la preescucha y la exportación MIDI respeten mejor el voicing generado. Los metadatos temporales usados para escoger la inversión, como la longitud de la racha de una misma disposición, permanecen en el plan interno de voicing y no forman parte del documento público de la progresión.

## Expresión, preescucha y MIDI

Los controles expresivos modifican tanto la preescucha como la exportación MIDI cuando la articulación lo permite. **Intensidad** fija la velocidad base de los eventos `noteOn`; el valor `100 %` del volumen maestro sigue actuando como techo de salida, pero la progresión conserva su propia dinámica musical. **Humanización** añade pequeñas variaciones deterministas de tiempo y velocidad para evitar una ejecución completamente mecánica. **Swing** retrasa ligeramente las subdivisiones débiles cuando la posición rítmica lo permite. En articulación **Sostenido**, estos tres controles no alteran la reproducción ni la exportación MIDI: el sonido sostenido se mantiene estable aunque sus knobs hayan recibido valores aleatorios ocultos.

La exportación MIDI debe reflejar el estado editado, no solo el plan original: secciones `B`, `A'` y `C`, acordes añadidos dentro del compás, silencios, inversiones, suspensiones, tensiones, instrumento, tempo y compás. Las reglas de expresión se aplican sobre esos eventos finales para que el archivo exportado coincida con lo que se ha trabajado visualmente.

Las articulaciones y eventos breves compartidos por preescucha y MIDI, como `staccato`, notas de paso y pedales, se construyen desde el mismo servicio de eventos de nota. Así se evita que una articulación suene de una forma en el navegador y se exporte con otra duración o distribución rítmica en el archivo MIDI.

Los arpegios también se construyen como eventos de nota compartidos. La preescucha y la exportación MIDI usan el mismo orden de patrón; la exportación conserva un paso rítmico fijo en ticks para mantener compatibilidad con DAWs, mientras que la preescucha convierte ese patrón a segundos según la duración real del compás o segmento.

## Pedales, suspensiones y paralelas

El algoritmo valora positivamente las progresiones que enlazan acordes con notas comunes. Cuando dos acordes consecutivos comparten una o dos notas y el nivel de contrapunto lo favorece, esas notas pueden marcarse como pedales.

Si el instrumento seleccionado es sostenido, actualmente `drawbar_organ`, `string_ensemble_1` o `pad_2_warm`, y la articulación es **Sostenido**, el sesgo cambia de suave a fuerte: la selección de voicings premia que las notas comunes se mantengan en la misma altura MIDI y la anotación de pedales intenta conservar hasta tres enlaces comunes entre acordes consecutivos. Esta regla se aplica también entre segmentos internos de un compás dividido, no sólo entre compases completos.

Ese sesgo no se activa en articulaciones cortas o articuladas, como `staccato` o cualquier variante de `arpeggio`. En esos casos las notas comunes pueden existir por conducción normal, pero no deben convertirse en pedales prolongados ni condicionar de forma fuerte la selección del voicing, porque la articulación pide reataque o dibujo rítmico.

El comportamiento audible del pedal depende del instrumento. En instrumentos sostenidos, como órgano, cuerdas o pad, la preescucha y la exportación MIDI prolongan el `noteOff` y omiten el `noteOn` duplicado en el compás siguiente. En instrumentos pulsados o percusivos, como piano y guitarra, la nota se reataca aunque sea común, para que la voz no quede muda por la caída natural del sonido.

Los acordes pueden suspender la tercera cuando la conducción de voces lo justifica. Las calidades menores, disminuidas y semidisminuidas tienden a `sus2`; las calidades mayores, dominantes y de séptima mayor tienden a `sus4`. El cifrado se muestra después de la inversión y antes de las tensiones añadidas, por ejemplo `G 6 sus4`, `Cm7 sus2` o `D7♭5 4/2 sus2`. Los grados reflejan la misma suspensión, por ejemplo `V 6 sus4` o `ii7♭5 4/2 sus2`.

Las suspensiones tienen un peso estadístico moderado: aumentan cuando el nivel de contrapunto o tensiones es mayor, cuando la articulación favorece continuidad y, sobre todo, cuando el acorde suspendido reduce o mantiene el movimiento entre voces respecto al acorde sin suspender. Si ninguna voz previa puede enlazar hacia la nota suspendida por tono o semitono, la suspensión sigue siendo posible, pero queda penalizada. En estilos con disonancia preparada, la penalización se convierte en filtro: la nota suspendida debe estar preparada en el acorde anterior y resolver por tono o semitono hacia la tercera del acorde actual.

La puntuación de conducción penaliza quintas y octavas paralelas. La penalización es mayor cuando la paralela aparece entre las voces exteriores, especialmente bajo y soprano. Las paralelas interiores también restan calidad al voicing, aunque con menor peso.

## Compases divididos

Cada compás de la progresión puede dividirse en hasta cuatro acordes. El primer acorde conserva la función original del compás y los acordes añadidos se calculan como extensiones armónicas ponderadas, no como elecciones totalmente aleatorias.

La decisión de cuántos acordes aparecen en un compás pertenece a `js/services/progression-harmonic-density-service.js`. Con **Densidad armónica** a `0`, el generador conserva siempre un solo acorde por compás. Al subir el fader, la probabilidad de dividir compases crece siguiendo una curva formal: menor al inicio de frase o sección, mayor en los compases que preparan finales de frase y especialmente en el penúltimo compás de sección. El último compás de la progresión no se divide para que el cierre ocupe todo el compás.

La densidad también escucha la tensión armónica. Las dominantes, cadencias cromáticas, roles cadenciales y preparaciones que resuelven hacia tónica admiten algo más de actividad; las tónicas estables frenan la división. Los estilos funcionales, el contrapunto, las tensiones y el cromatismo añaden un pequeño empuje contextual, pero no sustituyen al valor principal del fader.

La métrica sesga el número de acordes elegido antes de repartir duraciones: en compases binarios se favorecen `1`, `2` o `4` acordes y se hace más raro `3`; en compases ternarios se favorecen `1` o `3` y se penalizan `2` y `4`; en compases irregulares se prefiere evitar divisiones demasiado mecánicas y se aceptan agrupaciones de tres acordes con más naturalidad. Además, salvo en densidades extremas, el servicio evita acumular más de dos compases muy densos seguidos.

La selección del acorde añadido prioriza tres criterios: notas comunes con el acorde inicial del compás, notas comunes con el acorde siguiente y coincidencia de función tonal. Esta regla favorece movimientos parsimoniosos y extensiones funcionales, especialmente extensiones de tónica. Por ejemplo, en `C` mayor, entre `C` y `F` puede aparecer `Am`, porque comparte `C` y `E` con `C`, y `A` y `C` con `F`.

Si el acorde desde el que se añade el nuevo segmento está suspendido, la primera regla es resolver la suspensión sobre el mismo acorde antes de buscar otro acompañante. Por ejemplo, después de `Esus4` se elige una variante de `E`, como tríada, cuatríada o inversión, según la conducción de voces más parsimoniosa.

El acorde inicial no puede retirarse. Los acordes añadidos pueden retirarse y, mientras no se haya alcanzado el máximo de cuatro acordes por compás, también pueden servir como punto de inserción para nuevos acordes. La preescucha y la exportación MIDI tratan todos los acordes del compás como eventos reales; sus duraciones se alinean con pulsos completos cuando es musicalmente posible, de modo que la división visual coincide con el resultado audible y exportado.

## Sustitución manual de acordes

Cada acorde del visualizador puede sustituirse manualmente desde un menú contextual. La lista se ordena por utilidad armónica: primero aparecen los acordes con la misma función tonal, después los acordes que comparten notas con el acorde actual y, finalmente, el resto de acordes de la tonalidad.

Cada entrada permite escoger tríada o cuatríada, incluyendo sus inversiones disponibles: estado fundamental, `6` y `6/4` para tríadas; estado fundamental, `6/5`, `4/3` y `4/2` para cuatríadas. Al aplicar una sustitución, el generador conserva la duración y posición del acorde dentro del compás y recalcula el voicing con la misma lógica de conducción de voces.

En cuatríadas de tres voces se omite la quinta para conservar tónica, tercera y séptima. La excepción son los acordes semidisminuidos y disminuidos con séptima: en ellos se omite la séptima para dejar una tríada disminuida clara.

## Metrónomo

La preescucha de progresiones puede activar un metrónomo desde los controles de transporte. El clic se genera con Web Audio en tiempo de ejecución, no mediante soundfonts, para evitar nuevas dependencias, descargas de samples y latencia de carga. El primer pulso de cada compás usa un acento más agudo y los demás pulsos usan un clic más ligero.
