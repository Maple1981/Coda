# Soundfonts

## Fuente actual

CODA usa el formato clásico de MIDI.js: archivos JavaScript con muestras embebidas en base64, nombrados como `instrumento-mp3.js` e `instrumento-ogg.js`, dentro de `soundfont/`.

Los nuevos instrumentos descargados proceden del banco `FluidR3_GM` del proyecto [`gleitz/midi-js-soundfonts`](https://github.com/gleitz/midi-js-soundfonts), una colección de soundfonts General MIDI prerenderizados para usarse directamente con MIDI.js. Ese banco declara licencia [Creative Commons Attribution 3.0](https://creativecommons.org/licenses/by/3.0/).

La atribución documental de estos archivos se mantiene en [`docs/ATTRIBUTIONS.md`](../ATTRIBUTIONS.md). La aplicación también incluye una referencia visible en el pie, porque los soundfonts se distribuyen con la versión pública.

## Instrumentos locales

- `acoustic_grand_piano`: piano acústico. Es el sonido por defecto y corresponde a la vista de piano.
- `acoustic_guitar_nylon`: guitarra clásica. Corresponde a la vista de guitarra.
- `drawbar_organ`: órgano drawbar. Usa la vista de piano y queda disponible para progresiones y sonidos sostenidos.
- `string_ensemble_1`: cuerdas. Usa la vista de piano y queda disponible para progresiones y arreglos.

## Regla de carga

El motor de playback debe seguir cargando soundfonts de forma diferida. Cambiar el instrumento en la interfaz solo selecciona el preset activo; el archivo de soundfont se carga con la primera preescucha que lo necesite.

Los soundfonts se cargan como scripts locales desde `soundfont/`. No deben inyectarse como texto JavaScript obtenido por XHR, porque eso obligaría a relajar `script-src` en la política CSP. Los identificadores de instrumento y formato deben mantenerse como tokens simples (`a-z`, `0-9` y guion bajo) antes de construir la ruta del archivo.

La lógica de negocio debe referirse a los instrumentos por su identificador General MIDI (`id`) declarado en `js/data/midi-data.js`. La selección visible del usuario es un selector de instrumentos sonoros; la vista gráfica asociada se decide mediante `viewInstrument`: guitarra clásica muestra diapasón, y piano, órgano y cuerdas muestran teclado.

## Integridad local

Los hashes SHA-256 de los soundfonts vendorizados se registran en `docs/technical/soundfont-checksums.sha256`. Tras descargar o sustituir un instrumento, recalcular esos hashes y ejecutar:

```powershell
.\tools\verify-soundfonts.ps1
```
