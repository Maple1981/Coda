# Melodía: ornamentación y expresión

Síntesis propia de reglas para transformar una línea esencial en una melodía más rica mediante notas no estructurales, repetición, diminución y expresión. Este documento presupone que ya existe una línea base validada según `34-melodia-linea-esencial.md` y una forma organizada según `35-melodia-forma-ritmo-modulacion.md`.

## Notas esenciales y ornamentales

Una nota es **esencial** cuando sostiene la armonía, el contorno, el acento o la cadencia. Una nota es **ornamental** cuando conecta, prepara, retrasa, anticipa o rodea una nota esencial.

La distinción depende de varios factores:

| Factor | Más esencial | Más ornamental |
| --- | --- | --- |
| duración | larga | breve |
| posición métrica | tiempo fuerte | subdivisión débil |
| armonía | factor del acorde | ajena al acorde |
| contorno | punto alto, cierre, apoyo | enlace o decoración |
| repetición | reaparece como tono guía | aparece sólo como gesto rápido |

Una nota breve puede ser esencial si define una armonía o un motivo; una nota larga puede ser ornamental si funciona como suspensión o apoyatura. Por eso Coda no debe clasificar sólo por duración.

## Suspensión

La suspensión prolonga una nota sobre una nueva armonía y la resuelve por paso. Tiene tres fases:

| Fase | Función |
| --- | --- |
| preparación | la nota pertenece al contexto anterior |
| suspensión | la nota se mantiene y entra en tensión con el nuevo contexto |
| resolución | la nota se mueve por grado conjunto hacia una nota estructural |

Reglas:

- Funciona especialmente bien en movimientos descendentes por grado.
- También funciona en ascenso cuando la nota suspendida tiene tendencia ascendente, como `7̂` o una alteración elevada.
- Suele tener más efecto en tiempo fuerte o en una posición métrica perceptible.
- Puede escribirse como ligadura o como repetición de la misma nota, según la articulación.
- Si aparece sobre un salto, no es una suspensión estricta; debe entenderse como repetición, arpegio o línea de acorde.

En el modelo actual de Coda, las suspensiones `sus2` y `sus4` son aproximaciones verticales. En una futura melodía por voz, deberían existir como eventos temporales: nota preparada, retención y resolución.

## Anticipación

La anticipación adelanta una nota esencial justo antes de su llegada real.

Reglas:

- Es breve.
- Normalmente se rearticula, no se liga.
- La primera aparición es ornamental; la segunda es la nota esencial.
- Puede anticipar una nota estructural, un cierre, un cambio de acorde o una entrada motivica.
- Se parece superficialmente a la suspensión, pero su dirección temporal es opuesta: la anticipación mira hacia delante; la suspensión retiene algo anterior.

Para generación, la anticipación debe aparecer cerca de cadencias, entradas de motivo y cambios armónicos claros.

## Nota de paso

La nota de paso rellena el espacio entre dos notas esenciales.

Reglas:

- Una tercera se rellena con una nota intermedia.
- Una cuarta se rellena con dos notas intermedias en la misma dirección.
- Saltos mayores pueden convertirse en líneas de paso, pero entonces algunas notas intermedias probablemente serán factores de acorde.
- La nota de paso suele ser breve y no acentuada.
- Puede hacerse acentuada si se desplaza hacia el segundo apoyo rítmico, pero entonces necesita mejor justificación.
- Una nota de paso cromática conecta dos grados separados por tono entero; tiende a ser más expresiva e intensa que una diatónica.
- Las notas de paso repetidas funcionan mejor si tienen suficiente peso rítmico para percibirse como parte del motivo.

En Coda, una nota de paso no debería crear un acorde nuevo por sí sola. Sólo debe modificar la superficie melódica salvo que su duración, acento o repetición la conviertan en nota estructural.

## Bordadura

La bordadura rodea una nota principal y vuelve a ella.

Forma básica:

```text
nota principal -> vecino superior o inferior -> nota principal
```

Reglas:

- La bordadura se diferencia de la nota de paso porque vuelve a su punto de partida.
- Puede ser superior o inferior.
- Puede insertarse antes o después de una repetición de la nota principal.
- El vecino superior suele respetar la escala local.
- El vecino inferior puede ser diatónico o cromático según estilo, modo y carácter.
- Si la bordadura se repite de forma continua sobre varias notas esenciales, produce una figuración o parte en movimiento.

La bordadura es especialmente útil para enriquecer notas largas sin alterar la armonía.

## Grupos ornamentales ampliados

La célula de tres notas de la bordadura puede ampliarse:

- añadiendo un factor del acorde antes o después;
- añadiendo una nota de paso;
- usando vecino superior e inferior antes de volver;
- repitiendo el vecino;
- encadenando grupos equivalentes sobre varias notas esenciales.

Cuanto más largo sea el grupo, más importante es conservar su función: debe seguir orbitando una nota esencial o una línea estructural reconocible.

## Apoyatura

La apoyatura es una nota vecina que aparece antes de la nota principal y resuelve en ella por paso. A diferencia de la bordadura, no necesita haber sonado antes la nota principal.

Reglas:

- Suele estar acentuada.
- Puede ser más larga que la nota de resolución.
- La apoyatura superior es muy común.
- La apoyatura inferior también es posible si el contorno la prepara.
- Conviene aproximarla desde el lado contrario a su resolución: si resolverá hacia abajo, puede venir desde abajo o desde un salto ascendente; si resolverá hacia arriba, puede venir desde arriba o desde un salto descendente.
- Justifica ciertos saltos sucesivos que serían pobres si se analizaran como línea esencial.

Para Coda, la apoyatura debe reservarse para estilos que admiten disonancia preparada o expresiva: barroco, clásico, romántico y, con más libertad, contemporáneo.

## Doble apoyatura

La doble apoyatura usa los dos vecinos de una nota principal antes de resolver.

Patrones:

```text
vecino superior -> vecino inferior -> principal
vecino inferior -> vecino superior -> principal
principal -> vecino superior -> vecino inferior -> principal
principal -> vecino inferior -> vecino superior -> principal
```

Reglas:

- Aumenta mucho la expresividad.
- Puede formar grupos de tres o cuatro notas.
- Debe mantener una resolución clara hacia la nota principal.
- Si se usa de forma continua, debe tener un patrón rítmico regular para no sonar accidental.

## Vecino no resuelto

Un vecino no resuelto aparece entre dos notas principales, pero no vuelve directamente a la primera. El caso más útil es el vecino superior que cae por tercera hacia la siguiente nota principal en una línea descendente.

Reglas:

- Debe ser breve y no acentuado.
- Se parece a una anticipación porque apunta hacia la nota siguiente.
- Funciona mejor entre dos notas estructurales descendentes por grado.
- Si hay modulación, la notación y la función deben pertenecer al contexto de la nota de llegada.

Este recurso es más avanzado que la bordadura común y conviene usarlo con probabilidad baja.

## Germen melódico

Una melodía ornamental puede nacer de un germen muy simple: dos o tres notas de escala, una línea de acorde, una tercera descendente, un giro hacia `7̂-1̂`, etc.

El proceso útil para Coda:

1. Generar un germen estructural correcto.
2. Repetirlo o secuenciarlo.
3. Insertar notas de paso entre saltos.
4. Añadir bordaduras a notas largas.
5. Usar apoyaturas en puntos expresivos.
6. Variar ritmo, registro o dirección sin perder el contorno.
7. Ocultar parcialmente el germen bajo ornamentación, pero conservar su función.

La originalidad no está en que el germen sea raro, sino en cómo se transforma.

## Ornamentación de repeticiones y secuencias

Una repetición puede disfrazarse mediante ornamentación:

- repetir el mismo esqueleto con más notas de paso;
- conservar el ritmo y cambiar adornos;
- conservar los grados fuertes y variar notas débiles;
- secuenciar un grupo ornamental completo;
- reducir un motivo a su final y repetir sólo ese fragmento;
- ampliar un motivo al añadir una bordadura o apoyatura en cada repetición.

Para el oyente, el patrón sigue siendo reconocible si coinciden algunos tonos guía, acentos o ritmos fuertes.

## Expresión melódica

La expresión nace cuando las reglas técnicas se ponen al servicio de carácter, texto, gesto o estilo.

Relaciones prácticas:

| Recurso | Efecto habitual |
| --- | --- |
| modo mayor | claridad, brillo, afirmación |
| modo menor | sombra, tensión, interioridad |
| ritmo binario | estabilidad, firmeza |
| ritmo ternario | ligereza, balanceo, gracia |
| tempo lento | más espacio para escala, suspensión y apoyatura |
| tempo rápido | más arpegio, repetición y figuras breves |
| línea ascendente | intensificación |
| línea descendente | relajación, cierre o gravedad |
| movimiento conjunto | cambio gradual |
| salto | cambio más brusco o enérgico |
| cromatismo | color más expresivo, seductor o dramático |
| nota larga/acento | aumento del peso semántico de la nota |

Estas asociaciones no son leyes absolutas, pero ayudan a puntuar opciones cuando varias melodías son técnicamente correctas.

## Melodía vocal

Si la melodía se compone para texto, la prosodia debe mandar:

- sílabas acentuadas e importantes en notas más largas, altas o métricamente fuertes;
- sílabas débiles en notas más cortas, bajas o menos acentuadas;
- varias notas sobre una sílaba deben ligarse o agruparse;
- palabras distintas necesitan separación clara;
- el contorno debe reforzar el sentido emocional del texto.

Aunque Coda no genere texto, estas reglas sirven para melodías cantables: una nota importante necesita una posición importante.

## Contraste con la documentación existente

`19-disonancias.md` y `docs/technical/classical-dissonance.md` ya tratan preparación, aparición y resolución de disonancias. Este documento amplía el enfoque desde el punto de vista melódico:

- no toda nota ajena al acorde es igual;
- la duración y el acento pueden convertir una nota ornamental en estructural;
- anticipación, suspensión y apoyatura se distinguen por su dirección temporal;
- las notas de paso y bordaduras no deben generar armonías nuevas salvo que tengan peso real;
- la ornamentación debe revelar o transformar un germen, no tapar errores de línea esencial.

## Reglas para futura algoritmia

Un futuro `MelodyOrnamentationPlanner` debería:

1. Recibir una línea esencial ya válida.
2. Marcar notas largas y acentuadas como candidatas a bordadura o apoyatura.
3. Marcar saltos de tercera o cuarta como candidatos a notas de paso.
4. Reservar anticipaciones para cambios de acorde, entradas y cadencias.
5. Exigir preparación y resolución a suspensiones estrictas.
6. Evitar que una nota ornamental cambie la armonía si no supera un umbral de duración o acento.
7. Usar cromatismo con dirección: ascendente hacia tensión, descendente hacia relajación o color.
8. Conservar tonos guía para que el contorno siga siendo reconocible.
9. Reducir la ornamentación en tempo muy rápido o en registros incómodos.
10. Aumentarla en repeticiones, secuencias y notas largas para evitar monotonía.
