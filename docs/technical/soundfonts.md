# Soundfonts

## Fuente actual

CODA usa el formato clásico de MIDI.js: archivos JavaScript con muestras embebidas en base64, nombrados como `instrumento-mp3.js` e `instrumento-ogg.js`, dentro de `soundfont/`.

Los nuevos instrumentos descargados proceden del banco `FluidR3_GM` del proyecto [`gleitz/midi-js-soundfonts`](https://github.com/gleitz/midi-js-soundfonts), una colección de soundfonts General MIDI prerenderizados para usarse directamente con MIDI.js. Ese banco declara licencia [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/).

## Instrumentos locales

- `acoustic_grand_piano`: piano acústico. Es el sonido por defecto y corresponde a la vista de piano.
- `acoustic_guitar_nylon`: guitarra clásica. Corresponde a la vista de guitarra.
- `drawbar_organ`: órgano drawbar. Queda disponible para progresiones y sonidos sostenidos.
- `string_ensemble_1`: cuerdas. Queda disponible para progresiones y arreglos.

## Regla de carga

El motor de playback debe seguir cargando soundfonts de forma diferida. Cambiar el instrumento en la interfaz solo selecciona el preset activo; el archivo de soundfont se carga con la primera preescucha que lo necesite.

La lógica de negocio debe referirse a los instrumentos por su identificador General MIDI (`id`) declarado en `js/data/midi-data.js`. La selección visual de piano o guitarra se relaciona con el sonido mediante `viewInstrument`.
