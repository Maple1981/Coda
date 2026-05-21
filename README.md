# Coda

![Coda preview](https://user-images.githubusercontent.com/88559684/128783209-bfd3ba43-08a9-4968-9e2d-7723d1e31472.jpg)

Coda is a browser-based music theory and composition tool for exploring scales, chords and harmonic progressions. It is designed for composers, producers, arrangers, guitarists, pianists and harmony students who want fast, playable musical material without leaving the browser.

The app is a pure frontend project: HTML, CSS/Sass and vanilla JavaScript. It has no backend, database, accounts, authentication or remote persistence layer.

## What It Does

- Builds scales and modes from a selected tonic.
- Generates diatonic triads and seventh chords with degree labels and harmonic functions.
- Shows relative and parallel relationships, modal sources and circle-of-fifths context.
- Provides guitar fretboard and piano keyboard views.
- Plays chords and generated progressions in the browser through Web Audio/Web MIDI utilities and local soundfonts.
- Generates editable harmonic progressions with sections, voicings, inversions, chromatic cadences, modal interchange, harmonic density, articulations, arpeggios, staccato playback and expressive controls.
- Exports generated or edited progressions as Standard MIDI Files for use in DAWs and sequencers such as Cubase, Ableton Live, Logic Pro, Digital Performer, Pro Tools and similar tools.

## Progression Engine

The progression workspace is the most active part of the project. It can generate and transform progressions using:

- modern or classical writing styles;
- major, minor and modal harmonic contexts;
- modal interchange from related scales and modes;
- secondary dominants, tritone substitutes and other extended-harmony resources;
- cadential chromaticism, including Neapolitan and augmented-sixth sonorities;
- SubV/Sub Five dominant substitutes at high chromaticism settings;
- harmonic density control for multiple chords per bar;
- section generation, cloning, variation and contrast;
- editable measure order and chord replacements;
- voice-leading, register centering, inversion-run limits and parallel-perfect penalties;
- classical dissonance handling for prepared/resolved suspensions, passing tones and restrained added tensions.

The exported MIDI is intended to match the visible progression, including sections, user edits, split bars, articulations, tempo, meter, voicing and expressive timing.

## Interface And Language

The default interface language is English, with Spanish also available. Note names can be displayed in either Anglo-Saxon notation (`C, D, E, F, G, A, B`) or Latin notation (`Do, Re, Mi, Fa, Sol, La, Si`).

The current UI uses native browser APIs and modular renderers.

## Technical Shape

Coda is organized as small browser modules loaded through `js/bootstrap/script-manifest.js` and published as `dist/js/coda.bundle.js`.

Main areas:

- `js/data/`: musical catalogs and static data.
- `js/domain/`: pure music-domain rules.
- `js/application/`: use cases that coordinate domain and services.
- `js/services/`: progression generation, playback, MIDI export, preferences and shared utilities.
- `js/renderers/`: HTML rendering without direct business logic.
- `js/ui/`: DOM coordination and user interaction.
- `docs/technical/`: architecture, workflow, security, soundfonts and progression-generation notes.
- `docs/theory/`: music-theory reference material used to guide future rules, including style syntheses under `docs/theory/styles/`.

When application scripts are added, removed or reordered, update `js/bootstrap/script-manifest.js` and regenerate the published bundle:

```powershell
.\tools\build-js-bundle.ps1
```

## Local Development

The recommended local workflow is to serve the repository as static files, for example with VS Code Live Server:

```text
http://127.0.0.1:5500/index.html
```

Avoid `file://` for full functional testing, because browsers can block soundfont or Web Audio/MIDI-related loads from local files.

## Tests

Run the full local verification suite with:

```powershell
.\tools\run-tests.ps1
```

The runner regenerates `dist/js/coda.bundle.js` and executes the project checks. Individual test files include:

```powershell
node tests\domain-tests.js
node tests\app-layer-tests.js
node tests\progression-invariants-tests.js
node tests\progression-state-tests.js
node tests\progression-midi-tests.js
node tests\progression-playback-tests.js
node tests\progression-transport-tests.js
node tests\progression-ui-behavior-tests.js
node tests\renderers-tests.js
node tests\architecture-tests.js
```

## Documentation

Useful technical entry points:

- `docs/technical/architecture.md`
- `docs/technical/development-workflow.md`
- `docs/technical/progression-generation.md`
- `docs/technical/progression-segment-contract.md`
- `docs/technical/classical-dissonance.md`
- `docs/technical/security.md`
- `docs/technical/soundfonts.md`

## Status

Coda is still in beta. It is usable, but the harmonic engine and playback behavior are evolving actively.

## License

Application content and code: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).

Soundfont assets are based on MIDI.js Soundfonts and keep their own attribution and license notes in the app and technical documentation.
