# Melodía: línea esencial

Síntesis propia de reglas para construir una línea melódica estructural antes de añadir adornos. El objetivo para Coda es separar la **línea esencial** de la figuración: primero se decide qué notas sostienen frase, armonía y cadencia; después se pueden insertar notas de paso, bordaduras, anticipaciones o apoyaturas.

## Principio general

Una melodía eficaz no es una sucesión arbitraria de alturas. Debe equilibrar tres condiciones:

- **Coherencia local**: cada grupo breve de tres o cuatro notas debe tener sentido como movimiento conjunto, arpegio, repetición o patrón reconocible.
- **Unidad formal**: la frase completa debe conducir hacia un reposo, una semicadencia o una continuación clara.
- **Variedad controlada**: la línea necesita contraste suficiente para no sonar mecánica, pero sin acumular excepciones que destruyan el centro tonal.

En Coda conviene modelar la melodía como una sucesión de **notas de grado** (`1̂`, `2̂`, `3̂`, etc.) antes de convertirlas en nombres de nota. Esto evita confundir, por ejemplo, `5̂` como nota melódica con `V` como acorde dominante.

## Grados estables y activos

En un contexto tonal mayor, los grados `1̂`, `3̂` y `5̂` forman el núcleo de reposo porque pertenecen a la tríada de tónica. Son puntos naturales de inicio, apoyo y cierre.

Los grados `7̂`, `6̂` y `4̂` son más activos:

| Nota de grado | Tendencia principal | Lectura práctica |
| --- | --- | --- |
| `7̂` | asciende a `1̂` | sensible fuerte; evitar dejarla sin resolución si está expuesta |
| `6̂` | desciende a `5̂` | tiende hacia dominante o reposo intermedio |
| `4̂` | desciende a `3̂` | tensión moderada, a menudo ligada a función subdominante |
| `2̂` | puede ir a `1̂` o `3̂` | grado flexible; se decide por contexto, acento y contorno |

Esta clasificación no sustituye la función armónica. Un `4̂` puede aparecer sobre varios acordes, pero su tendencia melódica sigue importando, sobre todo si cae en tiempo fuerte o tiene duración larga.

## Línea de escala

La línea de escala es el movimiento por grados conjuntos, ascendente o descendente. Debe ser el material más disponible para melodías cantables y para voces internas.

Reglas útiles:

- El movimiento conjunto puede prolongarse con libertad si no acumula direcciones sin objetivo.
- Una línea ascendente puede girar casi en cualquier grado, pero el giro justo después de `7̂` es delicado si la sensible queda acentuada.
- Una línea descendente puede girar casi en cualquier grado, pero el giro después de `6̂` o `4̂` necesita más cuidado si esos grados venían reforzados.
- Cuando un grado activo se aborda desde el lado contrario a su resolución, puede funcionar como giro expresivo y no siempre exige resolver de inmediato.
- Cuando un grado activo se aborda en la misma dirección de su resolución natural, la tendencia queda reforzada y debe cumplirse salvo razón formal clara.

Para generación, la línea de escala debe ser el comportamiento por defecto de la melodía principal en frases clásicas, barrocas sencillas y voces internas. Los saltos deben aparecer como contraste, no como textura permanente, salvo en arpegios o motivos muy definidos.

## Repetición de nota

Repetir una misma nota es siempre posible, pero no es neutro. Puede reforzar un apoyo, fijar un motivo vocal, preparar una resolución o crear insistencia rítmica.

Reglas prácticas:

- Funciona mejor cuando la nota repetida tiene valor estructural: `1̂`, `3̂`, `5̂` o un factor claro del acorde.
- Si la repetición cae en posiciones métricas equivalentes de compases sucesivos, se percibe como patrón.
- Si se repite demasiado una nota no estructural, la melodía se vuelve estática o parece no saber resolver.
- Una repetición puede suavizar reglas de salto, porque el oído recibe primero estabilidad y luego movimiento.

## Saltos de tercera

La tercera es el salto melódico más flexible. Conecta notas de una misma tríada o permite abandonar momentáneamente el movimiento conjunto sin romper la cantabilidad.

Reglas:

- Una tercera desde un grado estable no exige compensación especial.
- Una tercera desde un grado activo en su dirección natural funciona bien.
- Una tercera desde un grado activo contra su tendencia debe compensarse de inmediato, normalmente regresando o continuando por grado conjunto en sentido corrector.
- Dos terceras consecutivas en la misma dirección empiezan a sonar como línea de acorde; por tanto, deben analizarse como arpegio, no como simple escala.

## Saltos amplios

Se consideran amplios los saltos mayores que una tercera. En melodía cantable, un salto amplio suele pedir cambio de dirección.

Reglas:

- Tras una cuarta, quinta, sexta, séptima u octava, la respuesta normal es girar en sentido contrario.
- Si la línea continúa en la misma dirección tras el salto, conviene avanzar sólo un grado y girar después.
- Un salto amplio hacia un grado activo puede justificarse si ese grado resuelve naturalmente y produce el giro.
- El salto de octava es una repetición registral de una misma nota; se admite con más libertad si el registro de salida y llegada resulta cómodo.
- El salto de séptima es inestable y sólo conviene si se integra en una línea de acorde muy clara o en una resolución expresiva.

Para Coda, cualquier futuro `MelodyLeapPlanner` debería puntuar mejor estas respuestas:

| Situación | Respuesta preferente |
| --- | --- |
| salto amplio ascendente | descenso por grado conjunto o tercera |
| salto amplio descendente | ascenso por grado conjunto o tercera |
| salto hacia `7̂` | resolución a `1̂` si el contexto es tonal |
| salto hacia `4̂` o `6̂` | descenso a `3̂` o `5̂` si el grado está acentuado |
| octava | repetición registral permitida, pero con uso moderado |

## Línea de acorde

La línea de acorde es el movimiento por factores de una armonía: fundamental, tercera, quinta, séptima, novena, o sus omisiones. Produce un efecto más vigoroso que la escala.

Reglas:

- Todo salto aislado debería poder explicarse como parte de un acorde posible en la tonalidad.
- Una cadena de saltos en la misma dirección debe formar una imagen armónica reconocible.
- Las cadenas de arpegio funcionan mejor cuando coinciden con grupos rítmicos completos: medio compás, compás, dos compases o un patrón equivalente.
- Si la última nota de una cadena de saltos no pertenece al acorde insinuado, conviene corregirla por octava, por cambio de dirección o por resolución inmediata.
- El tritono `4̂-7̂` o `7̂-4̂` es muy delicado en mayor; sólo se justifica si el oído reconoce claramente una dominante con séptima o un acorde equivalente.

La línea de acorde no implica que la armonía deba cambiar en cada nota. Un arpegio puede desplegar un acorde sobre una armonía sostenida o sugerir un cambio implícito.

## Relación con las funciones T, SD y D

Para Coda, la línea melódica debe escuchar la función armónica sin reducirse a ella.

| Función | Grados melódicos preferentes | Comportamiento |
| --- | --- | --- |
| `T` | `1̂`, `3̂`, `5̂`, ocasional `6̂` | reposo, inicio, cierre o falsa llegada |
| `SD` | `2̂`, `4̂`, `6̂` | preparación, apertura, alejamiento moderado |
| `D` | `5̂`, `7̂`, `2̂`, `4̂` | tensión, semicadencia, impulso hacia tónica |

En una frase tonal simple, una melodía puede empezar en un factor de tónica, avanzar por escala o acorde hacia grados activos, y cerrar resolviendo hacia `1̂`.

## Modo menor

En menor, no conviene pensar en una sola escala fija para toda la frase. La forma armónica ofrece una sensible fuerte, pero produce una segunda aumentada entre `6̂` y `7̂` si ambos grados aparecen de forma inmediata. Por eso:

- la sensible elevada se reserva con especial naturalidad para cadencias y dominantes;
- el `6̂` natural o elevado se decide por dirección, estilo y destino;
- la sucesión inmediata `6̂-7̂` aumentada debe evitarse salvo color deliberado;
- el salto `3̂-7̂` en menor puede resultar áspero si sugiere una quinta aumentada sin soporte armónico;
- una melodía menor puede usar una lectura más natural descendente y una lectura más dirigida al ascender hacia cadencia.

Para el generador, el modo menor debe resolverse por contexto melódico y armónico, igual que ya se hace en la regla de la octava y en la dominante funcional de los estilos barroco, clásico y romántico.

## Cadencia melódica básica

Una frase de cuatro compases tiende a cerrar en `1̂` sobre un tiempo fuerte. La nota anterior suele pertenecer al área dominante: `5̂`, `7̂` o `2̂`, según la armonía y el contorno.

Reglas:

- `7̂-1̂` produce cierre fuerte.
- `2̂-1̂` produce cierre conjunto más suave.
- `5̂-1̂` puede sonar conclusivo si el salto está preparado o si la armonía confirma tónica.
- Terminar en `5̂` sugiere semicadencia, suspensión o continuación.
- Terminar en `3̂` puede cerrar con dulzura, pero necesita que la armonía haga evidente la tónica.

## Contraste con la documentación existente

Este documento concreta reglas que en `15-melodia.md` aparecían como principios generales: preferencia por movimiento conjunto, mezcla controlada de saltos, tonos guía y contorno. La novedad es convertir esos principios en restricciones operativas:

- distinguir notas de grado (`1̂`) de acordes (`I`);
- separar línea de escala, línea de acorde y repetición;
- compensar saltos amplios;
- tratar `7̂`, `6̂` y `4̂` como grados con tendencia;
- mantener una relación clara entre melodía, función tonal y cadencia.

## Reglas para futura algoritmia

Un generador melódico debería trabajar en capas:

1. Elegir el tipo de frase: cierre perfecto, semicadencia, continuación o motivo abierto.
2. Seleccionar notas estructurales por compás, preferentemente factores del acorde vigente.
3. Conectar esas notas mediante escala, tercera o arpegio.
4. Penalizar saltos amplios sin compensación.
5. Reforzar la resolución de grados activos cuando estén acentuados o sean largos.
6. Reservar tritonos, séptimas y cromatismos para contextos armónicos claros.
7. Añadir ornamentación sólo después de validar la línea esencial.
