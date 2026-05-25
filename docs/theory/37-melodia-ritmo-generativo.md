# Melodía: ritmo generativo

Síntesis operativa para que una melodía generada no sea sólo una voz superior sostenida, sino una línea reconocible con ritmo propio. Complementa `15-melodia.md`, `34-melodia-linea-esencial.md`, `35-melodia-forma-ritmo-modulacion.md` y `36-melodia-ornamentacion-expresion.md`.

## Independencia rítmica

Una melodía necesita un plano temporal distinto al de los acordes. Si cada acorde dura un compás y la melodía sólo cambia con el acorde, el oído percibe una sucesión de bloques, no una línea cantable.

Reglas prácticas:

- Los acordes pueden sostenerse mientras la melodía usa valores más pequeños.
- Las notas melódicas breves no deben crear necesariamente nuevas armonías.
- Una nota larga en la melodía puede coincidir con un acorde entero, pero no debe ser el único comportamiento disponible.
- La alternancia entre notas y silencios ayuda a separar grupos y a crear fraseo.
- El ritmo melódico debe repetirse o variarse para que parezca motivo, no accidente.

## Valores de nota

Para una primera capa generativa, los valores más útiles son:

| Valor | Uso melódico |
| --- | --- |
| negra | apoyo, tono guía, cierre parcial |
| corchea | movimiento conjunto, notas de paso, anticipaciones |
| semicorchea | giro rápido, bordadura breve, impulso anacrúsico |
| blanca o más | reposo, cadencia, acento agógico |

La semicorchea no debe llenar toda la frase por defecto. Funciona mejor como figura local: giro inicial, enlace hacia una nota fuerte, adorno antes de una cadencia o variación de un motivo ya presentado.

## Silencios

El silencio forma parte del ritmo melódico. No es una ausencia de composición, sino una respiración.

Usos preferentes:

- antes de repetir un motivo;
- después de una nota larga;
- al comienzo de una frase acéfala;
- para separar pregunta y respuesta;
- para no saturar una armonía ya densa.

Un silencio breve en una subdivisión débil suele funcionar mejor que un hueco largo en medio de una frase inicial, salvo que se busque una entrada muy marcada.

## Tipos de comienzo

La relación entre melodía y primer pulso fuerte define el gesto inicial:

| Tipo | Descripción | Efecto |
| --- | --- | --- |
| tético | empieza en el pulso fuerte | claridad, afirmación, estabilidad |
| acéfalo | empieza después del pulso fuerte | hueco inicial, ligereza, suspensión |
| anacrúsico | empieza antes del apoyo fuerte | impulso hacia la frase |

En una aplicación sin compás previo real, la anacrusa puede modelarse como nota breve de empuje al inicio de la frase o, cuando haya una sección o compás anterior, como entrada al final del compás precedente.

## Anticipación y retardo

La anticipación adelanta una nota del siguiente apoyo. Debe ser breve y reaparecer después como nota real o como llegada clara.

El retardo conserva durante un instante una nota anterior sobre una armonía nueva. Debe resolver por paso o quedar integrado en un motivo reconocible. En estilos con disonancia preparada, el retardo exige más control que una simple nota de paso.

Para generación:

- usar anticipaciones cerca de cambios de acorde, entradas de motivo y cadencias;
- usar retardos con probabilidad moderada y resolución clara;
- evitar que una anticipación larga parezca un cambio armónico no planificado;
- evitar retardos si la disonancia resultante no está preparada por la voz.

## Motivo rítmico

La melodía debe nacer de una célula breve. Algunas células útiles:

| Célula | Lectura |
| --- | --- |
| negra, negra, blanca | corto-corto-largo |
| corchea, corchea, negra, blanca | impulso y reposo |
| corchea, negra con puntillo, negra, negra | síncopa suave |
| semicorchea, semicorchea, corchea, negra, blanca | giro rápido y apoyo |

La repetición exacta es válida. La variación debe conservar algo reconocible: la suma de duraciones, los acentos, el contorno o la posición de los tonos guía.

## Contorno y curva

La melodía no sólo necesita notas correctas, sino una dirección audible. Los modelos básicos son:

- arco ascendente y descenso posterior;
- arco invertido;
- rampa ascendente hacia tensión o punto culminante;
- rampa descendente hacia reposo;
- línea casi estática con pequeños giros ornamentales.

El punto culminante suele funcionar bien cerca del centro o del último tercio de la frase. Si aparece al final, produce sensación de continuación; si aparece demasiado pronto, la frase necesita una respuesta o una relajación clara.

## Tonos guía

Los tonos guía son notas con peso especial por duración, acento, registro o repetición. Deben formar una línea más simple dentro de la melodía completa.

Para Coda:

1. escoger primero una nota estructural por compás o por apoyo armónico;
2. decidir un motivo rítmico;
3. colocar las notas estructurales en posiciones fuertes o largas;
4. rellenar posiciones débiles con repetición, paso, bordadura, anticipación, retardo o silencio;
5. comprobar que el resultado conserva un contorno global.

## Implementación mínima recomendada

El generador debe separar dos capas:

- **línea esencial**: notas estructurales tomadas de una voz real del acorde;
- **superficie rítmica**: eventos melódicos con duración, retardo, silencio, anticipación y ornamento.

La preescucha y la exportación MIDI deben usar la misma lista de eventos, para que lo que se oye coincida con lo que se exporta. Los acordes pueden mantenerse como acompañamiento, pero la voz melódica no debe duplicarse como bloque sostenido si ya está articulada rítmicamente.
