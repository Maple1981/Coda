# Barroco: patrones de conducción de voces

Síntesis propia de recursos barrocos para conducir voces, realizar bajo cifrado, generar cadencias, aplicar la regla de la octava y construir secuencias. El enfoque es práctico: patrones que Coda puede usar para generar o validar música tonal con sabor histórico sin depender de progresiones modernas entendidas sólo como nombres de acordes.

## Idea central

En el Barroco tonal, la armonía empieza a tener un peso mayor que en la polifonía renacentista, pero la escritura sigue pensándose desde líneas. Un acorde no es sólo una pila vertical: es el resultado de voces que llegan, chocan, se retienen y resuelven.

Para Coda, el periodo barroco conviene modelarlo como una gramática de movimientos:

- grados del bajo;
- intervalos sobre el bajo;
- voces superiores invertibles;
- cadencias por cláusulas;
- síncopas y retardos;
- secuencias transportables;
- modulaciones por patrones.

El enfoque de partimento refuerza esta idea: primero se reconoce un bajo o un esquema completo, y sólo después se analiza la sonoridad resultante como acorde. Una escala en terceras, una cadena `7-6`, un bajo ligado o una cadencia compuesta son unidades generativas por sí mismas.

En ese modelo, las notas de grado se leen como `1̂`, `2̂`, `3̂`, `4̂`, `5̂`, `6̂`, `7̂`, `8̂` y `9̂`, mientras que las cifras `3`, `6`, `7`, `2`, `4-3` o `7-6` describen intervalos sobre el bajo. Esta separación evita confundir una nota melódica como `5̂` con un acorde como `V`.

## Función tonal práctica

El Barroco tonal ya trabaja con tensión y reposo de forma muy clara: centro tonal, dominante, preparación cadencial, bajo continuo, regla de la octava y secuencias. Esta práctica no equivale todavía a una teoría analítica cerrada de tres funciones abstractas, pero sí consolida los gestos musicales que después se explicarán como tónica, subdominante y dominante.

Para Coda, conviene distinguir dos capas:

- **práctica barroca**: voces, bajo, cifras, cadencias, disonancias preparadas y patrones transportables;
- **lectura funcional posterior**: etiquetas como tónica, predominante, subdominante y dominante aplicadas para entender la dirección armónica.

El generador barroco debería partir de la primera capa y permitir que la segunda aparezca como consecuencia. En cambio, los estilos clásico y romántico pueden apoyarse más directamente en la sintaxis funcional explícita.

## Bajo cifrado

El bajo cifrado describe qué intervalos deben sonar sobre una nota grave. No obliga a una disposición exacta de las voces, sino a una familia de realizaciones posibles.

Equivalencias útiles:

| Cifra abreviada | Sentido práctico |
| --- | --- |
| sin cifra | tríada en estado fundamental, normalmente `5/3`; se realiza según el número de voces disponible. |
| `6` | primera inversión; en cifrado completo equivale a `6/3`. |
| `6/4` | segunda inversión; debe tratarse con más cuidado que un `6` ordinario. |
| `7` | acorde de séptima en fundamental. |
| `6/5` | primera inversión de séptima. |
| `4/3` | segunda inversión de séptima. |
| `4/2` o `2` | tercera inversión de séptima; la séptima está en el bajo. |
| `5/4`, `9/4`, `9/7`, `7/6`, `9/8` | figuras de retardo o suspensión, no meras sonoridades estáticas. |

Un accidente sin número suele afectar a la tercera sobre el bajo. Un accidente unido a una cifra altera el intervalo indicado. Una línea, barra o signo de elevación sobre una cifra debe entenderse como subida cromática de ese intervalo.

La imagen de las tablas de cifrado muestra dos ideas importantes:

- el mismo bajo puede realizarse a dos, tres o cuatro voces con distinta densidad;
- las cifras abreviadas esconden intervalos añadidos que el intérprete debe completar según textura y contexto.

## Textura

La realización barroca no exige siempre cuatro voces constantes.

- En dos voces se conserva el esqueleto: bajo más una voz esencial.
- En tres voces se completa la función principal con una tercera voz que evita vacíos excesivos.
- En cuatro voces se obtiene el tejido coral pleno, pero a veces conviene retirar o añadir una voz para evitar paralelismos.
- Las voces interiores pueden actuar como relleno flexible; no siempre tienen el mismo peso estructural que soprano y bajo.
- La disposición se nombra por el intervalo inicial entre voces exteriores: posición de octava, tercera o quinta.

Para el generador, esto sugiere que la textura sea variable. Un patrón barroco puede empezar a tres voces, pasar momentáneamente a cuatro y volver a tres si la conducción lo necesita.

## Cláusulas cadenciales

La cadencia barroca hereda una lógica contrapuntística de cláusulas. Una cláusula es un pequeño gesto melódico orientado hacia el cierre.

En esta sección, los patrones como `1-7-1`, `3-2-1` o `1-5-1` describen **notas de grado** de la escala local. En notación estricta pueden leerse como `1̂-7̂-1̂`, `3̂-2̂-1̂` o `1̂-5̂-1̂`. Se mantiene la forma sin acento dentro de las fórmulas para que sean más compactas, pero no deben confundirse con números romanos de acordes.

Cláusulas básicas:

- **Cláusula de discanto**: movimiento `1-7-1` en relación con la tonalidad local. Es la voz que crea la atracción de sensible.
- **Cláusula de tenor**: movimiento `3-2-1`, aunque puede empezar o acabar con variantes siempre que conserve el paso por `2` en la penúltima posición.
- **Cláusula de bajo**: movimiento `1-5-1`; pertenece al bajo y da la sensación cadencial más fuerte.
- **Cláusula de alto**: voz auxiliar que puede mantener `5-5-5` o completar la sonoridad sin definir por sí sola el cierre.

Las tres posiciones de una cadencia pueden entenderse así:

- antepenúltima: preparación del gesto;
- penúltima: punto de máxima tensión o dirección;
- última: llegada estable.

En menor, la séptima debe elevarse cuando actúa como sensible cadencial. Esto no implica abandonar el modo menor, sino activar la atracción hacia la tónica.

## Cadencias simples

Una cadencia simple usa sólo consonancias. Su fuerza depende de la combinación de cláusulas:

- a dos voces bastan discanto y tenor;
- a tres voces se añade el bajo `1-5-1`;
- a cuatro voces se suma una voz auxiliar que completa la textura.

El cierre más concluyente aparece cuando el bajo hace `5-1`. Si la cláusula de tenor o la de discanto pasan al bajo, el cierre puede funcionar, pero tiende a sonar menos terminal.

Las imágenes de cadencias simples muestran que las voces superiores pueden invertirse. La identidad del patrón no depende de que el discanto esté siempre arriba ni de que el tenor esté siempre en medio; depende del contorno interválico.

## Cadencias compuestas

Una cadencia compuesta añade una síncopa disonante. En vez de llegar directamente a la consonancia, una voz se retrasa y produce una fricción en la penúltima posición.

Toda síncopa cadencial tiene tres fases:

- preparación consonante;
- choque disonante en posición fuerte;
- resolución consonante.

La voz retenida es pasiva: mantiene una nota. La otra voz es activa: se mueve y provoca el choque. Esta distinción es muy útil para programar retardos, porque identifica qué voz conserva la altura y cuál cambia el entorno.

Figuras cadenciales frecuentes:

- `5/4 -> 3`: la cuarta debe venir preparada.
- `6/5 -> 3`: la quinta de la cifra se trata como disonante si funciona como retardo, incluso cuando acústicamente sea una quinta perfecta.
- `6/4 -> 5/3`: la cuarta puede entrar sin la misma preparación que exige el `5/4`, porque pertenece a otra disposición cadencial.

La conclusión visual es clara: la misma cadencia puede escribirse en varias posiciones, pero la disonancia conserva su identidad por preparación y resolución, no por la altura absoluta.

## Cadencias dobles

La cadencia doble combina una preparación cadencial simple con una cadencia compuesta. Produce más recorrido antes del cierre.

Rasgos principales:

- una voz presenta una cláusula de discanto prolongada, con un gesto adicional antes del `1-7-1`;
- el bajo puede usar variantes que desembocan en `5-1`;
- las voces auxiliares permiten inversiones múltiples, incluso con contrapunto invertible entre tres voces;
- puede construirse con `5/4` o con `6/5` según la línea de bajo.

Para Coda, la cadencia doble puede servir como cierre de frase largo, especialmente cuando el usuario pida cadencias elaboradas o estilo barroco académico.

## Cadencias evitadas

Una cadencia evitada prepara un cierre esperado, pero desvía la llegada.

Estrategias frecuentes:

- terminar en `6` en el bajo, equivalente a una llegada deceptiva;
- terminar en `3` en el bajo, suavizando el cierre;
- hacer que la cláusula de discanto resuelva hacia una nota que se reinterpreta como grado de una tonalidad vecina;
- convertir la nota de llegada en sensible de una tonalidad un grado más alta.

La cadencia evitada es especialmente útil para prolongar una frase o iniciar una modulación. No debe sonar como error: debe dar señales claras de cierre antes de desviarse.

## Cláusulas en el bajo

La cláusula de bajo `1-5-1` no es la única opción. Discanto y tenor también pueden aparecer en el bajo, aunque el resultado suele ser menos conclusivo.

Casos útiles:

- bajo con `1-7-1`: genera una sonoridad de `4/2` que resuelve hacia `6`;
- bajo con `3-2-1`: conserva la dirección cadencial, pero sin la autoridad de `5-1`;
- bajo con `1-2-3`: permite cierre o continuación con otro perfil;
- cadencia sobre `5` local: funciona como semicadencia cuando el sistema mayor-menor se interpreta de forma moderna.

Cuando la cláusula está en el bajo, las voces superiores dejan de ser simples rellenos: deben evitar quintas paralelas y ajustar sus inversiones.

## Tenor estático y tenor activo

En algunas cadencias, la cláusula de tenor se mantiene durante la resolución de la disonancia. En otras, se mueve antes del cierre y se parece parcialmente a una cláusula de bajo.

Esta ambigüedad es importante. Desde una lectura moderna podrían etiquetarse acordes distintos, pero el patrón de conducción puede ser casi el mismo. Para Coda conviene guardar ambas lecturas:

- lectura horizontal: qué voz actúa como cláusula y cómo se mueve;
- lectura vertical: qué sonoridad resulta en cada instante.

El estilo barroco temprano permite entender muchos enlaces por patrones de voces antes que por raíces armónicas.

## Regla de la octava

La regla de la octava asigna armonías normativas a cada grado de una escala en el bajo. Es una herramienta para armonizar bajos conjuntos sin convertir cada compás en una decisión aislada.

Versión básica:

- usa sobre todo acordes sin cifra y primeras inversiones `6`;
- en ascenso alterna estabilidad e inversión para evitar paralelismos;
- en descenso introduce giros que pueden tonicizar la dominante;
- el cuarto grado descendente suele recibir una sonoridad más activa que un simple `6`.

Versión avanzada:

- añade disonancias controladas como `6/5`, `4/3` o `4/2`;
- permite que el bajo escalístico se perciba como una cadena de microcadencias;
- requiere normalmente cuatro voces para realizar todos los movimientos sin errores.

La regla puede dividirse en mitad inferior y mitad superior. Esta división ayuda a generar segmentos transportables: cada tetracordo del bajo puede tener voces superiores invertibles.

## Regla de la octava como cláusulas

Una escala en el bajo no tiene por qué ser mero relleno. Puede entenderse como una sucesión de cláusulas cadenciales encadenadas.

Implicaciones:

- el bajo descendente puede contener una cláusula de discanto incompleta;
- una voz superior puede funcionar como tenor local;
- los tetracordos permiten inversión entre voces superiores;
- algunas quintas paralelas interiores pueden tolerarse más que las exteriores, aunque conviene evitarlas en generación automática.

Esto abre una buena vía para Coda: generar líneas de bajo por grados y derivar voces superiores con plantillas de regla de la octava, en vez de elegir acordes uno por uno.

## Secuencias con bajo conjunto

### Fauxbourdon

El fauxbourdon es una cadena de acordes `6` sobre un bajo conjunto.

- Suele ser más natural a tres voces.
- La sexta debe ocupar la voz superior para evitar quintas paralelas entre voces altas.
- En cuatro voces se añade una voz de relleno en zigzag, alternando duplicaciones para evitar paralelismos.
- En menor pueden aparecer decisiones cromáticas para evitar tritonos, aunque generen otros compromisos melódicos.

### Ascenso `5-6` y descenso `7-6`

Sobre un bajo ascendente, la fórmula `5-6` convierte cada grado en una pequeña expansión.

Sobre un bajo descendente, la fórmula equivalente es `7-6`.

Reglas prácticas:

- la disonancia o intervalo activo debe resolver por paso;
- en tres voces es más claro;
- en cuatro voces la voz de relleno debe alternar cuidadosamente sus duplicaciones;
- las voces superiores pueden invertirse si no producen paralelos.

### Bajo sincopado

En una secuencia con bajo sincopado, el bajo puede ser la voz retenida que produce la disonancia. Esto invierte la expectativa moderna de que el bajo siempre sea fundamento estable.

Figuras comunes:

- cadenas de `4/2 -> 6`;
- alternancia de `4/2` con `6/5`;
- bajo que actúa como voz paciente de una síncopa.

El resultado es muy barroco: el bajo no sólo sostiene, también participa en el retardo.

### Cadena ascendente por saltos de cuarta

Una voz que acaba de resolver una síncopa puede saltar una cuarta y convertirse en agente de la siguiente. Así se crea una cadena continua de retardos.

Patrones útiles:

- `9-8`;
- `7-6`;
- combinación de salto y resolución por paso.

Esta fórmula funciona bien cuando se quiere una secuencia ascendente con sensación de impulso acumulativo.

## Secuencias con bajo por saltos

### Terceras descendentes

La secuencia por terceras descendentes es uno de los motores barrocos más eficaces.

- Puede realizarse con acordes `6`.
- Puede intensificarse con `6/5`, donde la quinta de la cifra se trata como disonancia preparada y resuelta.
- El patrón suele mostrar sólo el inicio y el final: lo importante es continuar la célula.

Para Coda, esta secuencia puede codificarse como patrón recursivo de bajo y plantilla de voces superiores.

### Cuartas descendentes

La secuencia de cuartas descendentes sostiene patrones cercanos a la romanesca.

- Funciona a tres o cuatro voces.
- Admite retardos `4-3`, `9-8` y combinaciones `6/4 -> 5/3`.
- La adición de síncopas aumenta la densidad sin cambiar el esqueleto del bajo.

### Cuartas ascendentes

La secuencia por cuartas ascendentes puede repetirse por grado conjunto o por terceras.

- Puede usarse con tonicizaciones locales.
- Algunas variantes modulan de forma escalonada.
- En menor o en cromatismos fuertes pueden aparecer segundas aumentadas si no se cuida la melodía.

### Quintas descendentes

La secuencia por quintas descendentes, cercana al círculo de quintas, admite varias realizaciones:

- sólo tríadas `5/3`;
- alternancia de tríadas y séptimas;
- alternancia inversa de séptimas y tríadas;
- cadena de séptimas.

La séptima debe prepararse como nota común y resolver por paso descendente. Esta regla es prioritaria para que la cadena no suene como una sucesión moderna de acordes de séptima sin conducción.

### Quintas ascendentes

La secuencia por quintas ascendentes funciona mejor cuando cada grado conserva una quinta perfecta disponible.

Problemas típicos:

- saltos de quinta disminuida;
- correcciones cromáticas que generan relaciones cruzadas;
- disonancias en el bajo si se fuerza la solución.

Puede enriquecerse con retardos `4-3`, especialmente en tres voces.

## Omnibus y cromatismo tardío

El omnibus es una progresión cromática de aparición tardía respecto al Barroco central, pero útil como puente hacia el lenguaje clásico y romántico.

Rasgos:

- dos voces permanecen fijas mientras otras dos se mueven cromáticamente en sentido contrario;
- la armonía se reorganiza cada cuatro sonoridades;
- el patrón es reversible;
- cualquier punto puede reinterpretarse como centro momentáneo.

Para Coda, debe considerarse un recurso cromático avanzado, no un patrón básico barroco.

## Estrategias de modulación

La modulación barroca puede construirse con patrones ya conocidos:

- subir una quinta mediante bajo sincopado y cierre cadencial;
- bajar una quinta mediante `4/2`, regla de la octava o cadencia doble;
- subir una segunda reinterpretando una cadencia evitada;
- bajar por terceras mediante una cadena de llegadas deceptivas o tonicizadas.

La modulación no necesita un salto conceptual brusco. Puede nacer de una cadencia que no cierra donde parecía cerrar.

## Esquemas galantes y clásicos tempranos

Aunque muchos esquemas se asocian al estilo galante y al Clasicismo temprano, resultan útiles para extender el Barroco tardío hacia un vocabulario de frases.

Se identifican mejor por grados de las voces exteriores y por la relación fuerte-débil del compás, no por nombres de acordes.

Esquemas útiles:

| Esquema | Uso típico | Idea de conducción |
| --- | --- | --- |
| Do-Re-Mi | comienzo | bajo estable o cadencial con voz superior ascendente `1-2-3`. |
| Fenaroli | mitad | progresión con movimiento hacia una llegada local por `4-3` y `7-1`. |
| Fonte | comienzo o mitad | descenso secuencial por segmentos que tonicizan grados vecinos. |
| Indugio | mitad | prolongación expectante antes de resolver. |
| Meyer | comienzo | gesto de apertura con salto y respuesta por grados. |
| Monte | mitad | ascenso secuencial, a menudo por módulos transportados. |
| Passo indietro | mitad | retroceso controlado que permite prolongar la frase. |
| Ponte | comienzo o mitad | prolongación de la dominante o de `5` en el bajo. |
| Prinner | mitad | descenso superior `6-5-4-3` con bajo que sostiene la dirección cadencial. |
| Quiescenza | comienzo o final | reposo sobre dominante con cromatismo expresivo. |
| Romanesca | comienzo | bajo por grados característicos con voces superiores invertibles. |
| Sol-Fa-Mi | comienzo | descenso superior `5-4-3` con soporte cadencial. |

Estos esquemas no deberían implementarse como progresiones rígidas, sino como plantillas con ornamentación, inversión y transporte.

## Reglas de resolución

Reglas que conviene aplicar de forma transversal:

- La séptima preparada resuelve descendiendo por paso.
- El `4` sobre el bajo es disonante cuando funciona como retardo; en `5/4` exige preparación.
- El `6/4` cadencial puede comportarse de forma distinta al `5/4`; no toda cuarta tiene el mismo régimen.
- El `4/2` pide resolución hacia `6`.
- Las quintas y octavas paralelas entre voces exteriores deben evitarse con especial severidad.
- Una quinta disminuida puede resolver a tercera; el paso inverso hacia quinta perfecta es más delicado y debe reservarse para voces interiores.
- Las relaciones cromáticas cruzadas deben evitarse salvo que el patrón busque claramente ese efecto.
- La sensible cadencial en menor debe elevarse y resolver con claridad.

## Conclusiones de las imágenes

Los ejemplos visuales muestran patrones más que “acordes sueltos”.

- Las tablas de cifrado enseñan que la cifra abreviada es una instrucción de realización, no una sonoridad cerrada.
- Las cadencias aparecen en posiciones de octava, tercera y quinta; el patrón sobrevive a la inversión de las voces superiores.
- Las cadencias compuestas muestran que la disonancia se localiza en el tiempo: preparación, choque y resolución.
- Las realizaciones a cuatro voces a veces sacrifican plenitud para evitar errores de conducción.
- La regla de la octava se ve como una escala armonizada, pero sus tetracordos funcionan como pequeñas cadencias enlazadas.
- Las secuencias están escritas como células transportables; la partitura no necesita mostrar todo si el patrón está claro.
- Los colores de las voces en los ejemplos no representan timbres, sino funciones contrapuntísticas: voz retenida, voz activa, bajo o relleno.
- Las secuencias con síncopa demuestran que el bajo también puede ser una voz disonante retardada.
- Los esquemas finales reducen frases completas a grados exteriores y cifras, lo que confirma que el generador debe pensar en contornos y no sólo en etiquetas armónicas.

## Implicaciones para Coda

Un perfil barroco debería generar primero un bajo o una fórmula cadencial y después realizarla en voces.

Componentes recomendados:

- **CadencePattern**: simple, compuesta, doble, evitada, semicadencial.
- **ClausulaVoice**: discanto, tenor, bajo, alto auxiliar, con posibilidad de invertir voces.
- **FiguredBassRealizer**: expansión de cifras abreviadas según dos, tres o cuatro voces.
- **OctaveRulePlanner**: armonización de bajos conjuntos por regla básica o avanzada.
- **SequencePlanner**: fauxbourdon, `5-6`, `7-6`, bajo sincopado, terceras, cuartas y quintas.
- **SuspensionResolver**: preparación, choque y resolución de `4-3`, `7-6`, `9-8`, `6/5`, `4/2`.
- **SchemaPlanner**: plantillas galantes transportables y ornamentables.

Prioridades musicales:

- conducir voces antes de etiquetar acordes;
- permitir texturas variables;
- favorecer patrones transportables;
- resolver disonancias por voz, no sólo por acorde;
- tratar cadencia y modulación como dos caras de una misma mecánica;
- usar el bajo como línea activa, no sólo como raíz.

La diferencia respecto al Renacimiento es de peso relativo: el Barroco ya organiza mucho material desde bajo, cifra y tonalidad, pero la credibilidad sigue dependiendo de que cada voz se mueva con intención.
