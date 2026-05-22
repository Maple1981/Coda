# Partimento: síntesis de acordes y cadencias

Síntesis propia de criterios finales para consolidar construcción de acordes, familias de inversiones y tipos de cadencia. El objetivo no es repetir todos los documentos anteriores, sino fijar un mapa compacto que ayude a validar reglas de generación, cifrado e inspección musical en Coda.

No se conserva ninguna imagen de trabajo. Las tablas, reducciones y ejemplos examinados se han usado únicamente para extraer conclusiones musicales y reescribirlas como reglas propias.

## Aporte principal

Los apéndices refuerzan una idea metodológica importante: la armonía se puede mirar desde lo vertical, pero procede de relaciones lineales.

Para Coda conviene conservar tres capas:

- **intervalo**: tercera, sexta, cuarta aumentada, quinta disminuida, séptima, etc.;
- **familia de acorde**: tríada o cuatríada considerada en varias posiciones;
- **función de frase**: cadencia, tonicalización, prolongación, engaño o semicierre.

El error que debe evitarse es interpretar cada cifra como un nombre moderno de acorde sin atender a su resolución. Una `6/3`, una `6/4`, una `6/5` o una `4/2` pueden ser inversiones de una familia vertical, pero también pueden surgir como consecuencia de una suspensión, un paso o un intercambio de voces.

## Intervalos armónicos

Las terceras y sextas son la base de la consonancia móvil en la escritura de partimento. Como son inversiones recíprocas, una misma conducción puede presentarse en terceras o en sextas según qué voz ocupe el bajo.

Reglas prácticas:

- una tercera mayor invertida produce sexta menor;
- una tercera menor invertida produce sexta mayor;
- una cuarta justa invertida produce quinta justa;
- una segunda menor invertida produce séptima mayor;
- una segunda mayor invertida produce séptima menor.

Los intervalos aumentados y disminuidos exigen resolución dirigida:

- la quinta disminuida tiende a cerrarse hacia tercera;
- la cuarta aumentada tiende a abrirse hacia sexta;
- la séptima disminuida tiende a resolver hacia quinta justa;
- la segunda aumentada tiende a resolver hacia cuarta justa;
- la sexta aumentada tiende a abrirse hacia octava;
- la tercera disminuida tiende a cerrarse hacia unísono.

Para el algoritmo, estas relaciones son más importantes que el nombre aislado del acorde. Si una sonoridad cromática contiene una cuarta aumentada, quinta disminuida, sexta aumentada o séptima disminuida, el voicing debe respetar su destino melódico.

## Tríadas

La escala mayor genera tres tipos básicos:

- tríadas mayores sobre `1̂`, `4̂` y `5̂`;
- tríadas menores sobre `2̂`, `3̂` y `6̂`;
- tríada disminuida sobre `7̂`.

La escala menor, según la variante usada, añade más posibilidades:

- menor natural: abundan las tríadas propias del modo eólico;
- menor armónica: aparecen dominante mayor, sensible disminuida y tercera aumentada sobre `3̂`;
- menor melódica: modifica el color de `6̂` y `7̂` según dirección o contexto.

La tríada aumentada no debe tratarse como simple rareza: aparece cuando la escala menor armónica o determinados cromatismos elevan una quinta. Tiene potencial direccional y suele pedir resolución por conducción de voces, no permanencia estática.

## Familias de tríadas

Las posiciones `5/3`, `6/3` y `6/4` pueden describirse como familia de una misma tríada:

| Posición completa | Cifrado de la app | Uso |
| --- | --- | --- |
| `5/3` | fundamental | reposo, inicio, llegada o consonancia estructural |
| `6/3` | `6` | movilidad, enlace, bajo por grados |
| `6/4` | `6/4` | cadencial, auxiliar, de paso o resultado de inversión |

La lectura por familias explica por qué dos posiciones pueden sonar relacionadas aunque el bajo cambie. Aun así, el generador debe mantener una actitud prudente: un `6/4` cadencial no es lo mismo que un `6/4` de paso, y un `6/3` puede ser inversión estable o simple consecuencia de una línea.

## Cuatríadas

El repertorio básico de cuatríadas incluye cinco familias:

- séptima mayor;
- séptima menor;
- séptima de dominante;
- semidisminuida;
- disminuida.

En mayor, el reparto típico es:

- `Imaj7` y `IVmaj7`;
- `ii7`, `iii7` y `vi7`;
- `V7`;
- `vii7b5`.

En menor, el resultado depende mucho de la variante de escala. La menor armónica refuerza `V7` y `viidim7`; la menor natural aporta colores modales; la menor melódica altera de forma más flexible los grados superiores.

Para Coda, esto confirma dos criterios:

- la dominante mayor en menor funcional debe tomarse de una fuente con sensible;
- la séptima disminuida completa `viidim7` pertenece de forma natural al vocabulario tonal funcional, especialmente cuando hay resolución.

## Familias de cuatríadas

Las cuatríadas se organizan en cuatro posiciones:

| Posición completa | Cifrado de la app | Observación |
| --- | --- | --- |
| `7/5/3` | `7` | posición fundamental |
| `6/5/3` | `6/5` | primera inversión |
| `6/4/3` | `4/3` | segunda inversión |
| `6/4/2` | `4/2` | tercera inversión |

Esta convención debe seguir usándose de forma uniforme en la app. En la documentación y en el motor conviene evitar cifras mixtas que confundan el análisis completo con el cifrado reducido visible.

## Sextas aumentadas

Las sonoridades de sexta aumentada se explican por la resolución de ese intervalo hacia la octava. Pueden aparecer en menor de forma directa y también en mayor mediante color menor o molldur.

Rasgos:

- suelen apoyarse en `b6̂` o en una variante cromática equivalente;
- contienen una nota que sube hacia `5̂` y otra que baja hacia `5̂`;
- preparan con fuerza una dominante o un `I 6/4` cadencial;
- pueden presentarse como familias con añadidos distintos: forma básica, forma con quinta añadida y forma con cuarta aumentada añadida;
- la forma concreta importa menos que la resolución de la sexta aumentada.

Para Coda:

- las variantes italiana, francesa, alemana o suiza deben compartir un mismo destino funcional;
- no deben recibir tensiones libres que oculten la resolución principal;
- en mayor deben aparecer con más probabilidad si hay molldur, cromatismo alto o estilo romántico.

## Cadencia a dos voces

La cadencia a dos voces es el núcleo contrapuntístico del cierre. Dos voces alcanzan la tónica por movimiento conjunto, con una relación clara entre preparación y llegada.

Puede ser:

- **perfecta**: ambas voces cierran en la tónica o la voz superior principal llega a `1̂`;
- **imperfecta**: la voz superior queda en `3̂` o el cierre resulta menos terminal;
- **simple**: usa consonancias estructurales;
- **compuesta**: incluye suspensión o disonancia preparada.

Patrones relevantes:

- `6-8` o `6-8-8` como cierre de tenor;
- `3-1` como cierre de discanto;
- `7-6-8` como cadencia compuesta;
- `2-3-1` como cadencia compuesta alternativa.

La etiqueta de cadencia no depende sólo del bajo. El grado final de la voz superior y la colocación métrica determinan gran parte de la fuerza del cierre.

## Cadencia doble

La cadencia doble encadena una etapa simple y una compuesta, a menudo sobre un `5̂` prolongado.

Rasgos:

- prolonga la dominante;
- contiene dos resoluciones de sensible o dos momentos cadenciales;
- puede preparar una suspensión mientras resuelve la anterior;
- aumenta la solemnidad del cierre;
- funciona bien como final estructural o como cierre de alta intensidad.

Para Coda, la cadencia doble debe modelarse como proceso de varios eventos, no como un único acorde `V-I`.

## Cadencia a tres voces

La cadencia a tres voces combina bajo y dos voces superiores. Sus tipos principales se distinguen por qué voz lleva el gesto cadencial:

| Tipo | Rasgo | Fuerza |
| --- | --- | --- |
| Perfecta | bajo `5̂-1̂`, soprano o voz principal a `1̂` | fuerte |
| Tenor | bajo o voz con gesto `2̂-1̂` | media o suave |
| Discanto | gesto `1̂-7̂-1̂` | puede abrir o enlazar |
| Alto | gesto `5̂-4̂-3̂` o `4̂-3̂` | débil |
| Frigia | semicadencia menor hacia `5̂` | abierta |

La cadencia frigia merece tratamiento especial: pertenece al modo menor, cierra en `5̂` y actúa como semicadencia. Puede aparecer en variante barroca con descenso característico o en variante clásica con una sexta aumentada que intensifica la llegada al dominante.

## Cadencia sobre `5̂-1̂`

El bajo `5̂-1̂` es el cierre fuerte por excelencia. Puede interpretarse como salto de cuarta ascendente o quinta descendente.

Rasgos:

- divide la octava en quinta y cuarta;
- permite cadencias simples y compuestas;
- admite acordes completos e incompletos;
- el `5/3` sobre `5̂` suele necesitar claridad especial;
- en menor, la dominante debe conservar la sensible si el estilo es funcional.

El generador debe distinguir este cierre de cadencias internas con bajo `2̂-1̂`, `4̂-3̂` o `1̂-7̂-1̂`, porque no tienen la misma fuerza formal.

## Cadencia galante

La cadencia galante enfatiza la fluidez de voces superiores, normalmente en terceras o sextas paralelas, sobre un bajo cadencial.

Rasgos:

- puede ser simple o compuesta;
- la versión compuesta usa una sonoridad `6/4` o equivalente sobre el dominante;
- esa disonancia suele comportarse como apoyatura o paso acentuado, no como suspensión estricta;
- puede cerrar fuerte o funcionar como semicadencia;
- en inversión, las terceras paralelas pueden reemplazar a las sextas.

Para Coda, esto confirma que el estilo galante necesita una lógica distinta de la suspensión barroca: la disonancia puede nacer de una línea elegante y acentuada, no siempre de una ligadura preparada.

## Cadencia napolitana

La cadencia napolitana es una variante expresiva del marco galante, sobre todo en modo menor.

Rasgos:

- introduce `b2̂`;
- el giro `b2̂-7̂` puede producir tercera disminuida;
- el paso puede rellenarse con una nota intermedia;
- puede aparecer como giro melódico en una voz superior o interior;
- no debe reducirse a un simple acorde `bII6`.

El dato generativo importante es el **giro napolitano**: `b2̂` intensifica la llegada hacia sensible y dominante. Si sólo se inserta `bII6` sin conducción característica, el resultado pierde parte del estilo.

## Cadencia deceptiva

La cadencia deceptiva sustituye la tónica esperada por otra llegada, normalmente `6̂`.

Rasgos:

- el inicio debe sugerir un cierre normal;
- el bajo evita `1̂` y se desplaza a `6̂`;
- las voces superiores pueden cerrar de forma casi normal;
- una voz puede tener que descender por paso para evitar quintas paralelas;
- en cuatro voces suele requerir una duplicación cuidada de la llegada.

La cadencia deceptiva no es un fallo de resolución: es una decisión formal que prolonga la frase y prepara continuación.

## Cadencia a cuatro voces

La cadencia a cuatro voces no cambia la esencia de la cadencia a tres voces. La cuarta voz completa acordes, enriquece el sonido y obliga a decidir duplicaciones.

Reglas prácticas:

- en cadencias simples, es habitual duplicar el bajo;
- todas las voces deben seguir patrones naturales;
- las voces interiores no deben crear paralelos reales;
- las cadencias perfectas pueden usar todas las tríadas completas;
- las cadencias imperfectas suelen quedar en posición abierta o con soprano no conclusiva.

En cadencias compuestas a cuatro voces, el paso de una voz puede generar patrones estereotipados de alto o tenor. La séptima, cuarta o sexta disonante debe resolver aunque el bloque armónico parezca suficiente por sí solo.

## Jerarquía de fuerza cadencial

La fuerza de una cadencia puede ordenarse así, de mayor a menor:

1. Cadencia perfecta con bajo `5̂-1̂` y soprano en `1̂`.
2. Cadencia doble o compuesta con resolución completa.
3. Cadencia galante perfecta.
4. Cadencia imperfecta con cierre en `3̂`.
5. Cadencia frigia o semicadencia en `5̂`.
6. Cadencia tenor o alto como cierre interno.
7. Cadencia deceptiva, que evita el reposo esperado.

Esta jerarquía no debe ser absoluta. La métrica, la duración, el registro, la densidad y la repetición formal pueden reforzar o debilitar cualquier cierre.

## Implicaciones para Coda

### Catálogo de acordes

- Mantener separadas tríadas y cuatríadas.
- Confirmar que las inversiones visibles son `6`, `6/4`, `7`, `6/5`, `4/3` y `4/2`.
- Usar `viidim` y `viidim7` para disminuidos, sin símbolo de grado.
- Conservar `vii7b5` para semidisminuidos.
- Evitar que una inversión se interprete automáticamente como función nueva.

### Generador de cadencias

- Modelar cadencias como patrones de voces y bajo, no como dos acordes finales.
- Distinguir perfecta, imperfecta, semicadencial, deceptiva, doble, galante, napolitana, tenor, discanto y alto.
- Asignar a cada tipo una fuerza formal.
- Usar cadencias débiles en antecedentes, aperturas o enlaces.
- Reservar cadencias perfectas y dobles para cierres estructurales.

### Conducción de voces

- Dar prioridad a la resolución de tritonos, sextas aumentadas, séptimas disminuidas y suspensiones.
- Revisar duplicaciones en cuatro voces.
- Evitar duplicar sensibles y disonancias estructurales.
- Permitir acordes incompletos cuando resuelven mejor.
- Tratar las voces interiores como relevantes aunque el oído las perciba menos.

### Estilos

- Barroco: más peso a cadencias compuestas, dobles, frigias y suspensiones preparadas.
- Clásico: más peso a cadencias galantes, perfectas, imperfectas y claridad formal.
- Romántico: más cromatismo, sextas aumentadas, napolitanas y disminuidas, pero con resolución.
- Contemporáneo: minimizar dominantes fuertes y disminuidos salvo intención explícita.

## Novedades útiles frente a documentos previos

La información nueva más útil no es un patrón aislado, sino una ordenación:

- los intervalos explican la resolución de acordes cromáticos;
- las familias de acordes justifican inversiones, pero no sustituyen a la conducción;
- la cadencia se clasifica por voces, bajo, métrica y efecto, no sólo por función armónica;
- la cuarta voz completa y duplica, pero no cambia la identidad cadencial básica;
- el mismo bajo puede producir cierres de fuerza muy distinta según soprano, disonancia y posición métrica.

Esta síntesis puede servir como lista de control para futuras mejoras del motor de progresiones: antes de añadir más acordes, conviene asegurar que cada acorde sabe resolver y que cada cadencia sabe qué grado de cierre representa.
