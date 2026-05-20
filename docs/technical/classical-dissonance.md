# Tratamiento clásico de la disonancia

Este documento resume la regla práctica que Coda aplica cuando el control **Estilo** está en **Clásico**. La referencia de partida es la página "Dissonance handling" del manual de contrapunto de Ars Nova Software: https://www.ars-nova.com/cpmanual/dissonancerules.htm.

## Concepto

En escritura clásica, una disonancia no debe entenderse como una nota de color libre, sino como un gesto temporal con tres fases:

- **Preparación**: antes de sonar como disonancia, la nota debe estar justificada por el contexto anterior. En una suspensión estricta, la misma nota ya estaba presente como consonancia en el acorde previo.
- **Aparición**: la nota se vuelve disonante por el cambio de armonía, por su posición métrica o por su relación vertical con las demás voces. Las notas de paso suelen aparecer en posiciones débiles; las suspensiones aparecen de forma acentuada al prolongar una nota preparada.
- **Resolución**: la disonancia debe abandonar su tensión de forma controlada, normalmente por movimiento conjunto e inmediatamente hacia una nota consonante o estructural.

La regla no pretende convertir el generador en un corrector estricto de especies contrapuntísticas. Su función es que el estilo clásico reduzca las disonancias libres y prefiera adornos con dirección audible.

## Consonancia y disonancia

Para el motor de Coda, son consonancias estructurales los factores básicos del acorde vigente. Las notas ajenas a esa estructura, como suspensiones, notas de paso y tensiones añadidas, se tratan como disonancias que deben justificar su presencia.

El estilo moderno conserva el comportamiento anterior: permite tensiones disponibles y suspensiones por color y conducción de voces. El estilo clásico añade filtros:

- Las suspensiones sólo se aceptan si la nota suspendida aparece en la armonía anterior y puede resolver por semitono o tono hacia la tercera del acorde actual.
- Las notas de paso sólo se aceptan si enlazan dos notas reales por movimiento conjunto en la misma dirección.
- Las tensiones añadidas se limitan a una sola nota, sólo en posiciones funcionales de dominante, cadenciales o cromáticas, y deben poder resolver por paso a una nota del acorde siguiente.

## Suspensiones

La suspensión modelada por Coda sustituye la tercera del acorde por `sus2` o `sus4`. En estilo clásico, esta sustitución exige preparación real: el acorde anterior debe contener la misma clase de altura que se va a suspender. Después, la nota suspendida debe quedar a distancia de tono o semitono de la tercera del acorde, porque esa tercera actúa como nota de resolución.

Esto cubre el gesto básico de suspensión y retardo dentro del modelo actual de acordes. Si una futura mejora añade suspensiones explícitas por voz y duración, deberá conservar este contrato: la preparación pertenece al contexto anterior, la disonancia al ataque del acorde actual y la resolución a una nota estructural cercana.

## Notas de paso

Las notas de paso de Coda son eventos melódicos breves superpuestos a la progresión. En estilo clásico se restringen a movimientos diatónicos por grado conjunto:

- la nota de paso debe estar entre la nota anterior y la siguiente;
- el movimiento debe mantener una sola dirección ascendente o descendente;
- los dos tramos deben ser de semitono o tono;
- la nota de paso no debe ser un factor del acorde en el que aparece.

Así se evita que una única nota de paso intente rellenar saltos demasiado amplios, porque ese caso necesitaría dos o más notas ornamentales y una organización rítmica más explícita.

## Tensiones añadidas

Las tensiones `9`, `11` y `13` son un recurso moderno dentro del generador. En estilo clásico no desaparecen por completo, pero dejan de funcionar como color libre. Sólo pueden aparecer si el acorde cumple una función de dominante, una preparación cadencial o una cadencia cromática, y si la tensión puede moverse por paso hacia un factor del acorde siguiente.

La consecuencia práctica es que una tónica estable no recibirá `add9`, `add11` o `add13` en estilo clásico sólo porque el fader de tensiones esté alto. El fader sigue aumentando la probabilidad de disonancias, pero el servicio clásico decide cuáles tienen preparación y resolución suficientes.

## Implementación

La regla vive en `js/services/progression-classical-dissonance-service.js` y se aplica desde tres puntos:

- `js/services/progression-suspension-service.js`, antes de aceptar una suspensión.
- `js/services/progression-melodic-counterpoint-service.js`, al escoger notas de paso.
- `js/services/progression-tension-service.js`, al filtrar tensiones añadidas.

El servicio no modifica el documento público de progresión ni añade campos nuevos a compases o segmentos. Sólo actúa como filtro de generación cuando `progressionState.style === 'classic'`.
