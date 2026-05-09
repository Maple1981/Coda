# Coda

![codapreview](https://user-images.githubusercontent.com/88559684/128783209-bfd3ba43-08a9-4968-9e2d-7723d1e31472.jpg)



FEATURES
=================
This is a scale/chord generator written in Spanish language. It can generate the degrees and chords of any diatonic scale (triads and quatriads with their respective harmonic functions), as well as offer alternatives
such as sus2 and sus4 chords, secondary dominants and subdominants, substitute tritones and relative minors II, relative and parallel scales, and so on.

It also includes modal harmony and exotic scales.

Each chord can be heard by clicking on it.

The system supports guitar fretboard view (with different tunings) and keyboard view.

CODE AND IMPROVEMENTS
=============================
This is a pure frontend web application based on HTML5, CSS3 and JavaScript.

It uses locally vendored jQuery 4.0.0 and jQuery UI 1.14.2 for the current legacy interface. It also uses Web MIDI / Web Audio utilities and MP3 soundfonts to play chords in the browser, plus Google Fonts / Material Icons for typography and icons.

The long-term direction is to keep extracting music-domain logic into small JavaScript modules and progressively reduce UI coupling with jQuery where it makes the code easier to maintain.

Run the domain checks with:

```bash
node tests/domain-tests.js
node tests/app-layer-tests.js
node tests/architecture-tests.js
node tests/renderers-tests.js
```

These checks cover representative scales, diatonic chords, modal chord labels, application report orchestration, architecture wiring, instrument models, secondary dominants, tritone substitutes and relative minor seconds.

The layout needs some small improvements to be fully responsive.

I should translate the app into English. 

I will probably change the CSS nomenclature to BEM, and the CSS architecture to Atomic.

It would be nice to use TypeScript in the app.js to get static typing and convert the primitive types to class properties. 

The folder structure is ready to use with Visual Studio Code and Watch SASS extension.

LICENSE
===============================
Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
https://creativecommons.org/licenses/by-sa/4.0/

Enjoy coding!
