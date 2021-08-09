# Coda

FEATURES
=================
This is a scale/chord generator written in Spanish language. It can generate the degrees and chords of any diatonic scale (triads and quatriads with their respective harmonic functions), as well as offer alternatives
such as sus2 and sus4 chords, secondary dominants and subdominants, substitute tritones and relative minors II, relative and parallel scales, and so on.

It also includes modal harmony and exotic scales.

Each chord can be heard by clicking on it.

The system supports guitar fretboard view (with different tunings) and keyboard view.

CODE AND IMPROVEMENTS
=============================
This is a web application based on HTML5, CSS3 and JavaScript.

It has some dependencies: JQuery (I will remove it on future pull requests), WebMIDI API (necessary to play the chords - soundfonts in mp3 https://webaudio.github.io/web-midi-api/) and Google Fonts (no problem with this).

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
