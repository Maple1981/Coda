# Plan de modulación y tonicalización

Este documento define una hoja de ruta para ampliar el generador de progresiones con modulaciones entre secciones y tonicalizaciones dentro de una misma sección. No describe una implementación cerrada; fija el modelo musical, los datos que conviene representar y un orden prudente de evolución.

## Objetivo

La app debe distinguir dos comportamientos que ahora tienden a mezclarse bajo los controles de cromatismo e intercambio:

- **Tonicalización**: un acorde o grupo breve de acordes trata un grado como centro local, pero la sección conserva su tonalidad principal.
- **Modulación**: una sección, subsección o tramo formal cambia de centro tonal y necesita un nuevo contexto de escala, acordes, armadura y funciones.

Esta separación permitirá que Coda genere material más histórico y más musical: no todo `V/x -> x` debe abrir una tonalidad nueva, y no todo cambio de sección debe ser una simple selección de relativa, paralela o vecina del círculo de quintas.

## Estado actual

La app ya contiene piezas útiles:

- `generateContrastingProgressionSection` puede crear secciones contrastantes.
- `progression-section-candidate-service.js` propone relativa, paralela, vecina del círculo y subdominante sobre el mismo centro.
- `progression-planner-service.js` elige patrones y bloques de frase.
- `progression-chromatic-cadence-service.js` construye napolitana, sextas aumentadas, Sub Five y séptimas disminuidas cromáticas.
- `progression-rules-data.js` contiene patrones de partimento y secuencias.
- El documento de progresión ya admite sección, fuente cromática, función tonal e información contextual.
- El control **Siguiente sección** permite elegir sin modulación, modulación directa, acorde pivote o dominante secundaria al crear secciones contrastantes.
- Las secciones contrastantes guardan `section.modulation` cuando el cambio de contexto necesita una lectura explícita.
- La dominante secundaria de llegada puede ocupar el último compás de la sección anterior.
- El acorde pivote ocupa normalmente el tramo final de la sección anterior. La implementación actual lo modela como una zona pivote de uno a tres acordes reales, no como un único compás obligatorio. El número se decide con el azar de la generación, con mínimo de uno y máximo de tres cuando se ha elegido modulación por pivote. Si los últimos compases están divididos, cada acorde interno cuenta como candidato: por tanto, el penúltimo compás puede contener uno o varios pivotes. El grado visible sigue perteneciendo a la sección de origen, mientras que la etiqueta del acorde indica la reinterpretación en la tonalidad de llegada, por ejemplo `Acorde pivote: iii en F mayor`. Conceptualmente no pertenece en exclusiva a una sección: funciona como bisagra o zona de transición entre el contexto de salida y el de llegada.
- La modulación por acorde pivote exige un destino tonal distinto del origen. No debe degradarse a una sección contrastante en la misma tonalidad: esa situación corresponde a **Sin modulación**. El candidato sólo es válido si contiene al menos un acorde común que pueda analizarse funcionalmente en ambos contextos.
- La nueva sección no debe repetir por obligación el acorde pivote como primer acorde. Puede hacerlo ocasionalmente si el plan musical lo produce, pero lo normal es que empiece con material del nuevo contexto y confirme la tonalidad mediante grados estructurales como `I` y `V`.
- La opción sin modulación conserva el contexto tonal de la sección previa, pero fuerza contraste armónico iniciando la nueva sección fuera de la tónica cuando hay acordes disponibles de función tónica secundaria o subdominante.

Lo que falta no es sólo añadir acordes, sino completar una capa de planificación tonal que decida cuándo un acorde cromático es color local y cuándo forma parte de un cambio de centro. La primera implementación cubre modulaciones estructurales entre secciones; las tonicalizaciones internas siguen siendo la parte pendiente más importante.

## Modelo conceptual

### Contexto tonal de sección

Cada sección debe tener un contexto principal:

- tónica;
- escala;
- modo mayor, menor o modal;
- informe de escala;
- acordes diatónicos;
- fuentes de intercambio;
- círculo de quintas;
- estilo de escritura;
- relación con la sección origen.

Este contexto ya existe en gran parte para secciones contrastantes. La mejora será registrar también **cómo** se llegó a él.

Campos futuros sugeridos:

```js
{
  modulation: {
    fromSectionId: 'A',
    kind: 'pivot',
    originKey: 'C',
    targetKey: 'G',
    relation: 'dominant',
    confirmation: 'cadence',
    pivotDegree: 'vi',
    arrivalCadence: 'authentic'
  }
}
```

### Evento de tonicalización

Una tonicalización debe pertenecer al plan interno de acordes, no al contexto de sección.

Campos futuros sugeridos por grado o segmento:

```js
{
  chromaticRole: 'secondaryDominant',
  targetDegreeIndex: 4,
  targetDegreeName: 'V',
  localFunction: 'D/V',
  temporaryKey: 'G',
  tonicizationRole: 'dominant-to-secondary-tonic',
  source: 'chromatic'
}
```

El acorde de destino puede marcarse como tónica secundaria:

```js
{
  index: 4,
  tonicizationRole: 'secondary-tonic',
  temporaryKey: 'G'
}
```

La UI no tiene que mostrar todos estos campos, pero conviene conservarlos para inspección, exportación futura y depuración.

## Distinción operativa

### Tonicalización

No cambia el contexto de sección.

Se activa por:

- dominante secundaria;
- sensible secundaria o `viidim7/x`;
- Sub Five secundario;
- Fonte breve;
- Monte cromático no cadencial;
- terceras descendentes con dominantes secundarias;
- Morte con `V/IV -> IV`;
- cadena corta de dominantes que retorna.

Condiciones:

- duración breve;
- resolución local clara;
- ausencia de cadencia estructural en el nuevo centro;
- retorno a una función esperada de la tonalidad principal;
- no aparecer en el último acorde salvo que el final sea semicadencial.

### Modulación

Cambia el contexto de sección o subsección.

Se activa por:

- acorde pivote;
- dominante de llegada;
- cadena de dominantes que desemboca en cadencia;
- Fonte modulante con segmento independiente;
- Monte cromático que confirma el último destino;
- modulación directa entre secciones;
- reinterpretación enharmónica en estilos avanzados.

Condiciones:

- nuevo centro confirmado;
- relación tonal etiquetable;
- cadencia o permanencia suficiente;
- informe tonal nuevo para la sección;
- posibilidad de volver a la tonalidad anterior en una sección posterior.

## Relaciones tonales prioritarias

La selección de destino debe depender del estilo.

### Barroco

Prioridad:

- dominante;
- relativa;
- subdominante;
- grados tonicalizados por Fonte, Monte y círculo;
- retorno claro al centro principal.

Evitar:

- saltos remotos sin preparación;
- mediantes cromáticas lejanas como destino estructural frecuente;
- cambios directos sin cadencia o sin secuencia que los justifique.

### Clásico

Prioridad:

- dominante en mayor;
- relativa mayor en menor;
- subdominante;
- paralela como color o contraste;
- modulación por pivote;
- cadencias estructurales muy claras.

Puede admitir:

- modulación directa al inicio de nueva sección;
- Fonte y Monte como transición;
- cadena de dominantes moderada.

### Romántico

Prioridad:

- mediantes cromáticas;
- paralela mayor/menor;
- relaciones por tercera;
- cadena de dominantes más larga;
- reinterpretaciones de séptima disminuida;
- Sub Five o equivalentes cromáticos cuando el control de cromatismo sea alto.

Debe conservar:

- resolución clara de notas direccionales;
- registro y conducción controlados;
- diferencia entre color local y nuevo centro.

### Impresionista y contemporáneo

Prioridad:

- cambios de centro menos funcionales;
- regiones modales;
- paralelismos o desplazamientos por color;
- retorno ambiguo o abierto.

Evitar:

- imponer `V-I` fuerte como mecanismo de modulación por defecto;
- abusar de disminuidos y dominantes fuertes si el estilo los minimiza.

## Recursos modulantes

### Acorde pivote

Primera prioridad para Barroco y Clasicismo.

Plan:

1. Calcular tonalidades candidatas.
2. Buscar acordes comunes entre origen y destino.
3. Elegir pivote con buena conducción desde el acorde anterior.
4. Reinterpretar función en el destino.
5. Confirmar con dominante o cadencia.

Necesidades técnicas:

- servicio de intersección de acordes entre dos informes de escala;
- puntuación por función tonal;
- preferencia por acordes no ambiguos en estilos clásicos;
- representación de doble análisis en el inspector.

### Dominante de llegada

Útil para secciones contrastantes y modulaciones directas preparadas.

Plan:

1. Elegir destino.
2. Insertar `V/target`, `V7/target` o `viidim7/target`.
3. Resolver en la tónica de destino.
4. Generar el resto de la sección en el nuevo contexto.

Necesidades técnicas:

- construir dominantes secundarias hacia una tónica externa, no sólo hacia grados de la tonalidad actual;
- resolver alteraciones con ortografía coherente;
- marcar el acorde como transición, no como acorde propio de la sección destino si aún pertenece a la sección anterior.

### Modulación directa

Debe ser una opción formal, no un accidente.

Plan:

1. Cerrar o suspender la sección origen.
2. Cambiar el contexto tonal al empezar la nueva sección.
3. Presentar tónica, dominante o patrón característico del destino.
4. Confirmar el destino en los primeros compases.

Necesidades técnicas:

- metadato `kind: 'direct'`;
- restricción por estilo;
- preferencia por cambios en límites de sección;
- opción de no usar acorde pivote.

### Cadena de dominantes

Sirve tanto para tonicalización encadenada como para modulación.

Plan:

1. Elegir destino final.
2. Construir ruta por quintas.
3. Alternar dominantes completas e incompletas.
4. Resolver séptimas y sensibles de forma obligada.
5. Decidir si el último destino es tónica local o nueva tónica de sección.

Necesidades técnicas:

- generador de rutas `V/x -> x`;
- límite de longitud por estilo;
- alternancia de inversiones `7`, `6/5`, `4/3`, `4/2`;
- control de paralelos por voicing;
- opción de cadena implícita con acordes incompletos.

### Fonte

Adecuada para escapes breves y retornos.

Plan:

1. Crear dos segmentos secuenciales.
2. Tonicalizar el primer segmento.
3. Volver por repetición transpuesta o descenso.
4. Confirmar el centro principal o cadenciar en el destino si se usa como modulación.

Necesidades técnicas:

- bloque de dos segmentos;
- destino preferente `ii` en mayor;
- variante en relativa mayor para contextos menores;
- inversión de voces permitida;
- clasificación como `tonicization` o `modulation` según cadencia final.

### Monte cromático

Adecuado para ascenso secuencial.

Plan:

1. Construir segmentos ascendentes.
2. Insertar sensibles cromáticas hacia cada destino.
3. Evitar destinos disminuidos inestables.
4. Confirmar sólo el último destino si se quiere modular.

Necesidades técnicas:

- lista de destinos permitidos por modo;
- variante con cromatismo en bajo;
- variante Monte Principale con cromatismo en voz superior y bajo por cuartas;
- marcador de centros temporales por segmento.

### Terceras descendentes

Adecuadas para color interno y transición.

Plan:

1. Construir marco `1̂-6̂-4̂-2̂` o fragmento.
2. Preparar cada llegada con dominante secundaria o `viidim7`.
3. En menor, permitir `b2̂` napolitano.
4. Recuperar el centro con cadencia.

Necesidades técnicas:

- patrón de bajo estructural separado del bajo superficial;
- dominantes secundarias sobre notas intermedias;
- sustitución por disminuida;
- variante napolitana.

### Lamento y Morte

Adecuados para cromatismo descendente, pero con función distinta.

Plan para Lamento:

- mantener el centro principal;
- usar modo menor;
- tratar cromatismos como sustituciones expresivas;
- resolver hacia cadencia sin crear centros locales innecesarios.

Plan para Morte:

- permitir mayor y menor;
- usar movimiento contrario en voces extremas;
- tonicalizar `IV`;
- permitir sexta aumentada;
- resolver hacia dominante o cadencia compuesta.

Necesidades técnicas:

- patrón de bajo cromático descendente;
- clasificación retórica;
- límite de textura para evitar paralelos;
- variante clásica separada de la barroca.

## Orden de implementación recomendado

### Fase 1: Tonicalizaciones locales

Objetivo: generar `V/x -> x` y `viidim7/x -> x` dentro de una sección sin cambiar su contexto.

Tareas:

- crear servicio de dominantes secundarias;
- añadir marcador `tonicizationRole`;
- ampliar `progression-chromatic-cadence-service.js` para destinos internos;
- añadir patrones Fonte, Monte cromático y terceras descendentes con destinos locales;
- probar que la sección conserva su tonalidad principal.

Pruebas:

- `V/ii -> ii` en mayor;
- `viidim7/V -> V`;
- cadena breve que retorna a `I`;
- ausencia de tonicalización hacia grados disminuidos inestables.

### Fase 2: Modulación entre secciones por pivote

Estado: primera versión implementada para secciones contrastantes.

Objetivo: que una sección `B` o `C` pueda llegar a una tonalidad nueva mediante acorde común.

Tareas:

- calcular acordes pivote;
- excluir la tonalidad de salida como destino válido;
- aceptar sólo candidatos con acorde común real entre origen y destino;
- generar transición al final de la sección previa sin forzar la repetición del pivote al inicio de la sección nueva;
- registrar metadatos de modulación en la sección;
- mostrar relación tonal en depuración o inspector futuro.

Pruebas:

- mayor a dominante;
- menor a relativa mayor;
- mayor a subdominante;
- retorno a la tonalidad original en sección posterior.

### Fase 3: Modulación por dominante de llegada y modulación directa

Objetivo: soportar cambios más claros y formales.

Tareas:

- construir dominantes hacia tónicas externas;
- permitir inicio de sección con dominante de llegada;
- añadir `kind: 'direct'` para cambios sin pivote;
- ponderar por estilo;
- confirmar el nuevo centro en los primeros compases.

Pruebas:

- sección `B` en dominante preparada por `V/V`;
- sección `B` por corte directo;
- estilo clásico favorece confirmación cadencial;
- estilo contemporáneo no impone dominante fuerte.

### Fase 4: Secuencias modulantes

Objetivo: convertir cadenas, Fonte y Monte en rutas modulantes controladas.

Tareas:

- generador de rutas por quintas;
- generador de segmentos cromáticos ascendentes;
- clasificación automática de cadena local o modulante;
- límite de longitud por estilo;
- voicing con resolución obligada de séptimas.

Pruebas:

- cadena corta como tonicalización;
- cadena larga hacia nueva tonalidad;
- alternancia de dominantes completas e incompletas;
- no aparición de paralelos graves en cuatro voces.

### Fase 5: Cromatismo descendente avanzado

Objetivo: añadir Lamento y Morte como familias diferenciadas.

Tareas:

- patrón Lamento menor no modulante;
- patrón Morte mayor/menor con tonicalización de `IV`;
- variante con sexta aumentada;
- control de textura a tres y cuatro voces;
- integración con cadencias compuestas.

Pruebas:

- Lamento no cambia contexto tonal;
- Morte puede tonicalizar `IV`;
- cuatro voces evita octavas paralelas cuando sea posible;
- la cadencia final recupera el centro.

## Criterios de ponderación

Variables actuales que deberían influir:

- `style`: define vocabulario y lejanía permitida.
- `chromaticism`: aumenta dominantes secundarias, disminuidas, cadenas y modulaciones remotas.
- `counterpoint`: aumenta patrones con conducción obligada y resoluciones cromáticas.
- `tensions`: permite séptimas dominantes y sonoridades más densas.
- `bars`: secciones largas admiten más preparación y confirmación.
- `harmonicDensity`: permite varios acordes por compás, útil para `V/x -> x` rápido.

Regla general:

- con poco cromatismo, sólo tonicalizaciones diatónicas cercanas;
- con cromatismo medio, dominantes secundarias y Fonte;
- con cromatismo alto, Monte cromático, cadenas de dominantes y séptimas disminuidas;
- con cromatismo muy alto y estilo romántico, mediantes cromáticas y reinterpretaciones más lejanas.

## Contrato de datos sugerido

### Sección

```js
{
  id: 'B',
  contextTonicName: 'G',
  contextScaleIndex: 0,
  contextScaleName: 'Mayor',
  modulation: {
    kind: 'pivot',
    relation: 'dominant',
    originSectionId: 'A',
    originTonicName: 'C',
    targetTonicName: 'G',
    targetScaleIndex: 0,
    pivot: {
      sourceDegree: 'vi',
      targetDegree: 'ii',
      chordName: 'Am'
    },
    confirmation: 'authentic'
  }
}
```

### Compás o segmento

```js
{
  chromaticRole: 'secondaryDominant',
  degree: 'V7/V',
  targetDegree: 'V',
  tonicizationRole: 'secondary-dominant',
  temporaryTonicName: 'G',
  source: 'chromatic'
}
```

### Destino local

```js
{
  degree: 'V',
  tonicizationRole: 'secondary-tonic',
  temporaryTonicName: 'G'
}
```

## Riesgos

- Convertir todo cromatismo en modulación y perder el centro principal.
- Usar dominantes secundarias en estilos que las minimizan.
- Cambiar de contexto tonal sin actualizar escala, intercambio, notas de paso y exportación MIDI.
- Romper pruebas deterministas por alterar demasiado los pesos de patrones existentes.
- Generar ortografías enharmónicas incorrectas en tonalidades remotas.
- Añadir cambios de sección que suenan formales pero no quedan confirmados musicalmente.

## Recomendación inmediata

La primera implementación debería limitarse a tonicalizaciones internas. Es la base necesaria para todo lo demás y aprovecha código ya existente de cromatismo, séptima disminuida, patrones de partimento y resolución de grados.

Después conviene abordar la modulación por pivote entre secciones, porque encaja con el modelo actual de secciones contrastantes y reduce el riesgo de cambios bruscos. La modulación directa y las cadenas largas deberían llegar más tarde, cuando existan metadatos suficientes para explicar el cambio tonal y probarlo de forma aislada.

## Pendiente de interfaz

Queda pendiente un panel discreto de transición entre secciones. Debe mostrar una lectura sintética de las relaciones `A -> B` o `B -> C`, por ejemplo `Acorde pivote: Am = vi en C / ii en G`, a partir del contrato de `CodaProgressionHarmonicAnalysis`. Ese panel no debe crear reglas musicales nuevas ni duplicar cálculos del generador: sólo explicará la transición ya existente en el documento final.
