# Partimento: cromatismo, tonicalización y modulación

Síntesis propia de criterios para convertir el cromatismo de partimento en reglas de generación armónica. El foco está en distinguir tres niveles: adorno cromático sin cambio funcional, tonicalización breve de un grado y modulación con establecimiento perceptible de una nueva tonalidad.

No se conserva ninguna imagen de trabajo. Las partituras, reducciones, bajos y cifras examinadas se han usado únicamente para extraer conclusiones musicales y reescribirlas como reglas propias.

## Enfoque

El cromatismo tonal no debe entenderse como una colección arbitraria de alteraciones. En los estilos barroco, clásico y temprano-romántico, muchas notas cromáticas aparecen para reforzar una dirección melódica o para convertir temporalmente un grado en centro local.

La diferencia esencial es esta:

- **cromatismo ornamental**: altera una línea, pero no cambia la lectura armónica;
- **cromatismo funcional local**: crea una dominante secundaria, una sensible secundaria o una sonoridad disminuida que empuja hacia un acorde de destino;
- **tonicalización**: el acorde de destino se escucha durante un momento como tónica secundaria, aunque el centro principal no se abandona;
- **modulación**: el nuevo centro tonal queda confirmado por duración, cadencia, repetición formal o continuidad temática suficiente.

Para Coda, esta distinción es crucial: una tonicalización dentro de una sección no debe cambiar el informe tonal de la sección; una modulación entre secciones sí debe crear un nuevo contexto de escala, acordes, círculo de quintas y armadura.

## Notación de trabajo

Se mantienen estos niveles:

- **notas de grado**: `1̂`, `2̂`, `3̂`, `4̂`, `5̂`, `6̂`, `7̂`, `8̂` y `9̂`;
- **cifras de bajo**: `5/3`, `6/3`, `6/4`, `7/5/3`, `6/5/3`, `6/4/3`, `6/4/2`, `7-6`, `4-3`, etc.;
- **cifrado reducido de la app**: `6`, `6/4`, `7`, `6/5`, `4/3`, `4/2`;
- **acordes disminuidos**: `viidim`, `viidim7`, `viidim7/V`, etc., sin usar símbolo de grado.

Cuando un acorde cromático funciona como dominante o sensible secundaria, debe marcarse también su destino: `V/V`, `viidim7/V`, `V/ii`, `viidim7/IV`, etc. Este destino es más importante que el nombre aislado del acorde.

## Tonicalización frente a modulación

Una tonicalización convierte un grado no tónico en centro momentáneo. El procedimiento típico es:

1. elegir un acorde diatónico de destino;
2. tratarlo como tónica secundaria;
3. preparar ese destino con dominante secundaria, séptima disminuida o bajo cromático;
4. regresar al marco principal sin que el nuevo centro se estabilice por completo.

Una modulación exige más peso formal. Puede considerarse estable cuando hay al menos uno de estos indicios:

- cadencia clara en la nueva tonalidad;
- frase completa o semifrase que empieza y termina dentro del nuevo centro;
- repetición secuencial que prolonga el nuevo contexto;
- cambio de sección formal;
- confirmación melódica de la nueva sensible y de la nueva tónica;
- bajo que deja de poder explicarse como simple adorno dentro de la tonalidad anterior.

En una lectura práctica, el mismo pasaje puede admitir dos niveles. A pequeña escala puede describirse como una breve tonalidad secundaria; a gran escala puede seguir subordinado a la tonalidad principal. El generador debe poder producir ambas lecturas sin confundirlas.

## Dominante secundaria y tónica secundaria

La dominante secundaria es el motor más directo de la tonicalización. Su forma básica es `V/x -> x`, donde `x` es el grado tratado momentáneamente como tónica.

Rasgos:

- el acorde preparatorio suele contener la sensible del destino;
- la tercera de la dominante secundaria es la nota más direccional;
- la séptima, si aparece, debe resolver con claridad;
- el destino puede ser mayor o menor, pero no una tríada disminuida estable;
- la tonicalización puede durar sólo dos acordes o extenderse mediante una pequeña cadencia local.

Ejemplos abstractos:

- en mayor: `V/ii -> ii`, `V/IV -> IV`, `V/V -> V`, `V/vi -> vi`;
- en menor: `V/iv -> iv`, `V/V -> V`, `V/VI -> VI`, con más cuidado cuando el destino debilita el marco tonal;
- con sensible disminuida: `viidim7/x -> x`;
- con sustitución dominante: `SubV/x -> x`, más apropiado para estilos posteriores.

El destino se considera **tónica secundaria**, no tónica principal. Sólo se convierte en modulación si el pasaje acumula duración, cadencia o independencia formal.

## Acordes pivote

Un acorde pivote pertenece de forma razonable a la tonalidad de salida y a la tonalidad de llegada. En partimento, no siempre se etiqueta como concepto abstracto; muchas veces se percibe como un acorde común que permite reinterpretar una línea ya en marcha.

Uso práctico:

- elegir tonalidades relacionadas por cercanía tonal;
- buscar acordes comunes entre ambas escalas;
- usar el acorde primero con función en la tonalidad de salida;
- reinterpretarlo después con función en la tonalidad de llegada;
- confirmar el nuevo centro con `V-I`, `V7-I`, `viidim7-I`, cadencia 6/4 o patrón cadencial equivalente.

La modulación por pivote es especialmente adecuada entre secciones o al comienzo de una sección contrastante, porque permite que el cambio suene preparado.

## Modulación directa

La modulación directa cambia de centro sin acorde común explícito. Puede aparecer por repetición literal o transposición de un módulo, por corte formal, por entrada de un nuevo tema o por un gesto cadencial fuerte en la nueva tonalidad.

Uso práctico:

- funciona bien entre secciones, especialmente si hay cambio temático o contraste de registro;
- requiere confirmar pronto el nuevo centro;
- puede apoyarse en una dominante de llegada antes de presentar la nueva tónica;
- debe usarse con menor frecuencia que el pivote en estilos barroco y clásico;
- en Romanticismo puede tener más presencia, sobre todo si hay cromatismo alto.

En el generador conviene distinguir la modulación directa planificada de un simple salto de acorde: la primera cambia el contexto tonal; el segundo sólo cambia el color local.

## Fonte

La Fonte es una secuencia de dos segmentos: primero se escapa brevemente del centro principal y después se regresa. Suele aparecer tras una cesura, repetición medial o punto formal donde el oído acepta un pequeño desvío.

Esquema general:

- segmento 1: tonicalización de un grado, a menudo `ii` en modo mayor;
- segmento 2: repetición secuencial un grado más abajo o retorno al centro principal;
- bajo con resolución de sensible secundaria;
- voces superiores con patrones de resolución reconocibles;
- final que reabsorbe la excursión.

Lectura funcional:

- si el primer segmento sólo insinúa el nuevo centro, se trata de tonicalización;
- si contiene una cadencia interna y el segundo segmento queda claramente separado, puede sentirse como breve modulación;
- si ambos segmentos comparten un acorde intermedio, ese acorde puede funcionar como llegada y nuevo arranque.

Conclusiones extraídas de las partituras:

- el mismo patrón puede aparecer en voces invertidas;
- el bajo no siempre lleva la línea cromática principal;
- las voces interiores pueden portar la sensible secundaria;
- la independencia de cada segmento aumenta cuando hay cadencia local;
- en modo menor, la Fonte evita convertir una tríada disminuida en tónica secundaria y suele recurrir a la relativa mayor.

Para Coda:

- crear patrones Fonte como tonicalización de `ii` o de relativa mayor;
- reservar la versión modulante para secciones o bloques de cuatro compases;
- permitir inversión de voces sin cambiar el análisis;
- reforzar la vuelta al centro mediante cadencia o repetición descendente.

## Monte cromático

El Monte cromático es una secuencia ascendente. A diferencia del Monte diatónico, introduce sensibles cromáticas que preparan tonicalizaciones sucesivas.

Rasgos:

- alterna acordes en `5/3` y `6/3` o sus equivalentes reducidos;
- cada sensible cromática empuja hacia el siguiente grado;
- el cromatismo suele encajar mejor en el bajo, pero puede trasladarse a una voz superior;
- cuando el bajo salta por cuartas ascendentes o quintas descendentes, el esquema se acerca a una variante principal del Monte;
- en mayor, los destinos más naturales son `ii`, `IV`, `V` y `vi`;
- en menor, los destinos más naturales son `I`, `iv` o `IV`, y `V`;
- algunos grados resisten la tonicalización porque producirían una tríada disminuida o debilitarían demasiado el marco tonal.

Conclusiones extraídas de las partituras:

- el Monte cromático puede aparecer como bajo ascendente por semitonos o como cromatismo transferido a una voz interna;
- las reducciones muestran a menudo resoluciones de cuarta aumentada o quinta disminuida hacia intervalos consonantes;
- cada segmento puede tener una tonalidad temporal distinta sin que la sección abandone necesariamente la tonalidad principal;
- en realizaciones extensas, la sucesión de centros temporales puede sonar como modulación encadenada.

Para Coda:

- usarlo como patrón secuencial con `chromaticism` medio-alto;
- marcar cada segmento con destino local;
- no permitir que todos los grados sean candidatos equivalentes;
- elevar su probabilidad en Barroco, Clasicismo y Romanticismo;
- convertirlo en modulación de sección sólo si el último destino se confirma cadencialmente.

## Tonicalización en terceras descendentes

La secuencia de terceras descendentes puede alojar tonicalizaciones sucesivas. El bajo puede descender por grados conjuntos con notas intermedias de paso, pero la estructura profunda se percibe como una cadena de llegadas por tercera.

Rasgos:

- marco frecuente: `1̂-6̂-4̂-2̂` o fragmentos equivalentes;
- cada llegada puede recibir una dominante secundaria;
- las dominantes pueden aparecer como `V7`, `V 6/5`, `V 4/3`, `V 4/2` o como `viidim7`;
- las notas intermedias del bajo pueden ser pasos melódicos y, a la vez, bajos armónicos de dominantes secundarias;
- la inestabilidad aumenta, pero la tonalidad principal puede mantenerse si el cierre la reafirma.

En modo menor aparece un caso especial: el `b2̂` napolitano puede sustituir al `2̂` natural para evitar una estructura disminuida o para intensificar una cadencia posterior.

Conclusiones extraídas de las partituras:

- las tonicalizaciones no siempre tienen la misma duración;
- una cadena puede pasar por varias tonalidades temporales sin abandonar la principal;
- los acordes disminuidos sustituyen con naturalidad a dominantes secundarias;
- el bajo puede ser escalístico en superficie y secuencial por terceras en estructura;
- la frase final necesita recuperar la primacía del centro principal mediante cadencia.

Para Coda:

- extender el patrón de terceras descendentes ya existente con destinos secundarios;
- permitir `V/x` y `viidim7/x`;
- en modo menor, incluir variante con napolitana;
- impedir que la cadena termine en un centro no confirmado salvo que se quiera modular.

## Lamento

El Lamento realiza un tetracordo cromático descendente, normalmente en modo menor. Su función primaria no es modular, sino expresar una caída intensificada por semitonos.

Esquema básico:

- bajo descendente desde `1̂` hacia `5̂` o hacia un punto cadencial;
- cromatismos descendentes como variantes de grados diatónicos;
- alternancia frecuente de `5/3` y `6/3`;
- suspensiones `7-6` y disonancias controladas;
- textura muy eficaz a tres voces;
- en cuatro voces, la voz añadida puede verse obligada a saltar para evitar octavas paralelas.

Conclusiones extraídas de las partituras:

- los cromatismos del Lamento suelen funcionar como sustitutos expresivos, no como señales de tonalidades temporales;
- puede aparecer como bajo ostinato;
- puede cerrar con doble cadencia o cadencia compuesta;
- una lectura demasiado vertical pierde la lógica de caída lineal;
- los motivos de suspiro en voces superiores refuerzan la retórica de descenso.

Para Coda:

- usarlo como patrón menor de color expresivo;
- no etiquetar cada semitono como modulación;
- permitir realizaciones consonantes y disonantes;
- favorecer tres voces o cuatro voces con control estricto de paralelos;
- conectarlo con cadencias fuertes al final del bajo.

## Morte

La Morte comparte el bajo cromático descendente del Lamento, pero cambia la armonización y la retórica. Es más característica de una escritura clásica y puede aparecer en mayor o menor.

Rasgos:

- bajo cromático descendente;
- voz superior en movimiento contrario;
- mayor presencia de tonicalización de `IV`;
- uso de dominantes secundarias y acordes de sexta aumentada;
- posibilidad de molldur en modo mayor;
- tendencia a conducir hacia dominante o hacia una cadencia más amplia.

Conclusiones extraídas de las partituras:

- la voz superior suele ser más estructural que en un Lamento ostinato;
- la tonicalización de `IV` es un punto clave;
- las sextas aumentadas pueden reemplazar o intensificar acordes anteriores;
- algunas resoluciones producen paralelos aceptados por estilo, pero el generador debe preferir alternativas limpias cuando sea posible;
- el mismo bajo puede sonar barroco o clásico según la armonización.

Para Coda:

- separar Lamento y Morte como formas distintas aunque compartan bajo;
- permitir Morte en modo mayor y menor;
- usar `V/IV -> IV` y variantes con sexta aumentada;
- aumentar su peso en Clasicismo y Romanticismo;
- resolver hacia dominante o cadencia compuesta.

## Cadena de dominantes

La cadena de dominantes es la variante cromática del esquema quinta descendente/cuarta ascendente. Cada acorde funciona como dominante del siguiente.

Esquema general:

- movimiento de bajo por quinta descendente o cuarta ascendente;
- cada acorde se reinterpreta como dominante secundaria;
- alternancia posible entre acordes mayores `5/3` y dominantes con séptima;
- si hay séptimas sucesivas, la séptima desciende regularmente;
- la tercera de cada dominante, como sensible, puede descender cromáticamente hacia la siguiente;
- las posiciones completas e incompletas se alternan para evitar paralelos duros.

La cadena abandona el marco principal cuando el bajo salta hacia un grado que ya no puede explicarse como parte de la tonalidad de salida. Sin embargo, puede seguir siendo una sucesión de tonicalizaciones si el final vuelve al centro anterior.

Conclusiones extraídas de las partituras:

- puede aparecer implícita, con dominantes incompletas o notas omitidas por textura;
- el canon o la imitación pueden ocultar el bajo estructural;
- las voces interiores suelen resolver séptimas y tritonos aunque el oído siga la superficie melódica;
- una cadena larga necesita punto de salida cadencial;
- una cadena demasiado completa puede producir quintas paralelas, por lo que conviene alternar disposiciones.

Para Coda:

- convertirla en familia propia, no sólo en círculo de quintas diatónico;
- permitir `V7/x -> x` donde `x` se convierte inmediatamente en `V/y`;
- alternar dominantes completas e incompletas;
- limitar la longitud por estilo y por cromatismo;
- usarla para modulación entre secciones cuando el último destino se confirma.

## Criterios para la generación

### Tonicalización dentro de una sección

Debe conservar la tonalidad de la sección. La app puede marcar un acorde como cromático o secundario, pero el contexto de escala no cambia.

Recursos adecuados:

- `V/x -> x`;
- `viidim7/x -> x`;
- `SubV/x -> x`, sobre todo en estilos posteriores;
- Fonte breve;
- Monte cromático no cadencial;
- terceras descendentes con dominantes secundarias;
- Morte con `V/IV -> IV`;
- cadena corta de dominantes que retorna a la tonalidad principal.

Límites:

- no cerrar la sección en la tónica secundaria si no se pretende modular;
- no prolongar más de dos o tres compases el centro local sin confirmarlo como modulación;
- evitar tonicalizar tríadas disminuidas como si fueran centros estables;
- resolver las sensibles secundarias y séptimas con prioridad sobre el azar de voicing.

### Modulación entre secciones

Debe crear un nuevo contexto tonal. La sección resultante necesita su propio informe de escala, armadura, acordes diatónicos, intercambios y círculo de quintas.

Recursos adecuados:

- acorde pivote;
- dominante de llegada;
- cadena de dominantes hacia la nueva tonalidad;
- Fonte modulante;
- Monte cromático que desemboca en cadencia;
- modulación directa por corte formal;
- paso por relativa, dominante, subdominante, paralela o mediantes cromáticas según estilo.

Límites:

- en Barroco y Clasicismo, preferir tonalidades cercanas;
- en Romanticismo, permitir más mediantes cromáticas y reinterpretaciones enharmónicas;
- en Contemporáneo e Impresionismo, permitir cambios de centro menos funcionales, pero sin imponer `V-I` fuerte por defecto;
- confirmar la nueva tonalidad con un gesto suficiente antes de continuar generando material.

## Tabla de recursos

| Recurso | Uso principal | Estilos prioritarios | Cambio de centro |
| --- | --- | --- | --- |
| Dominante secundaria | Tonicalización local | Barroco, Clásico, Romántico | Local |
| Séptima disminuida secundaria | Tonicalización intensa | Barroco, Clásico, Romántico | Local o modulante |
| Acorde pivote | Modulación preparada | Barroco, Clásico, Romántico | Estructural |
| Modulación directa | Contraste formal | Clásico tardío, Romántico, Contemporáneo | Estructural |
| Fonte | Escape y retorno | Barroco, Clásico | Local o semiformal |
| Monte cromático | Ascenso secuencial | Barroco, Clásico, Romántico | Local o encadenado |
| Terceras descendentes | Tonicalizaciones sucesivas | Barroco, Clásico, Romántico | Local |
| Lamento | Color expresivo menor | Barroco, Romántico | Normalmente no modulante |
| Morte | Cromatismo clásico descendente | Clásico, Romántico | Local o cadencial |
| Cadena de dominantes | Encadenamiento funcional | Barroco, Clásico, Romántico | Local o estructural |

## Conclusión práctica

El cromatismo de partimento no es un único control de color. Debe dividirse en intenciones:

- intensificar una nota de llegada;
- crear una tónica secundaria;
- encadenar centros locales;
- transformar un bajo cromático en retórica expresiva;
- cambiar realmente de tonalidad.

Para la app, la mejora más importante será separar **tonicalización** y **modulación** como capas distintas del plan armónico. La primera opera dentro de la sección y resuelve hacia el contexto actual. La segunda crea una sección o subsección con contexto propio y debe confirmar su nuevo centro.
