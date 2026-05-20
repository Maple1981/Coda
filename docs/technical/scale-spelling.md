# Ortografía de escalas

Las escalas tonales y modales de siete notas deben escribirse con una letra distinta para cada grado. Esta regla es independiente de que una nota concreta pueda sonar igual que otra en temperamento igual.

Por ejemplo, en `C` menor natural la sucesión correcta es:

```text
C-D-Eb-F-G-Ab-Bb
```

No debe escribirse como:

```text
C-D-D#-F-G-G#-A#
```

La segunda forma produce notas repetidas por letra (`D` y `D#`, `G` y `G#`, `A` y `A#`) y oculta la función real de los grados tercero, sexto y séptimo.

## Regla técnica

`js/domain/scale-domain.js` aplica ortografía por grado cuando la escala:

- tiene siete notas;
- está marcada como tonal (`tonal === "true"`) o modal (`modal === "true"`).

El algoritmo toma la letra de la tónica como punto de partida y avanza una letra por grado. Después calcula el accidente necesario para que esa letra coincida con la altura cromática real del patrón. Así, `F#` mayor se escribe `F#-G#-A#-B-C#-D#-E#`, no `F#-G#-A#-B-C#-D#-F`.

Las escalas no tonales o no modales conservan de momento la preferencia general de sostenidos/bemoles, porque algunas escalas sintéticas, pentatónicas, hexatónicas u octatónicas no responden siempre al mismo contrato de siete letras.

El resumen visual añade la tónica superior de cierre para completar la escala en la octava. Esa nota de cierre facilita la lectura y la escucha, pero no forma parte del recuento interno de grados: las pentatónicas siguen teniendo cinco grados reales, las hexatónicas seis y las heptatónicas siete.

## Relación con armaduras

La preferencia de armadura sigue decidiendo la forma de la tónica cuando hay enarmonías disponibles, pero ya no puede producir grados con letras duplicadas en escalas tonales o modales de siete notas. Si la armadura sugiere una zona de bemoles, la escala seguirá usando bemoles allí donde corresponda; si sugiere sostenidos, se usarán sostenidos, dobles sostenidos o alteraciones equivalentes cuando sean necesarios para preservar la letra del grado.
