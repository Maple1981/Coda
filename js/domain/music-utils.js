// Shared helpers for pure music-domain modules.
(function (global) {
	'use strict';

	function parsePattern(pattern) {
		if (!pattern) {
			return [];
		}

		return pattern.split('-').map(function (value) {
			return parseInt(value, 10);
		});
	}

	function noteName(noteDefinition, preferFlats) {
		if (preferFlats && noteDefinition.enarmonica !== undefined) {
			return noteDefinition.enarmonica;
		}

		return noteDefinition.nombre;
	}

	function findInterval(intervals, semitones) {
		var semitoneKey = String(parseInt(semitones, 10));

		if (intervals._codaIndex && intervals._codaIndex.bySemitones && intervals._codaIndex.bySemitones[semitoneKey]) {
			return intervals._codaIndex.bySemitones[semitoneKey];
		}

		for (var i = 0; i < intervals.length; i++) {
			if (parseInt(intervals[i].semitonos, 10) === parseInt(semitones, 10)) {
				return intervals[i];
			}
		}

		return { nombre: '', grado: '' };
	}

	function circularScaleNote(scaleNotes, index, steps) {
		var targetIndex = index + steps;

		if (targetIndex < scaleNotes.length) {
			return scaleNotes[targetIndex];
		}

		return scaleNotes[steps - (scaleNotes.length - index)];
	}

	function circularInterval(scaleNotes, index, note, octaveSemitones) {
		var rootSemitones = parseInt(scaleNotes[index].semitonos, 10);
		var targetSemitones = parseInt(note.semitonos, 10);

		if (targetSemitones >= rootSemitones) {
			return targetSemitones - rootSemitones;
		}

		return octaveSemitones - rootSemitones + targetSemitones;
	}

	function findChordDefinitionByName(chordDefinitions, name) {
		if (chordDefinitions._codaIndex && chordDefinitions._codaIndex.byName && chordDefinitions._codaIndex.byName[name]) {
			return chordDefinitions._codaIndex.byName[name];
		}

		for (var i = 0; i < chordDefinitions.length; i++) {
			if (chordDefinitions[i].nombre === name) {
				return chordDefinitions[i];
			}
		}
	}

	function noteIndex(notes, noteNameValue) {
		if (
			notes._codaIndex &&
			notes._codaIndex.indexByName &&
			notes._codaIndex.indexByName[noteNameValue] !== undefined
		) {
			return notes._codaIndex.indexByName[noteNameValue];
		}

		for (var i = 0; i < notes.length; i++) {
			if (notes[i].nombre === noteNameValue || notes[i].enarmonica === noteNameValue) {
				return i;
			}
		}

		return -1;
	}

	function circularChromaticIndex(index, offset, octaveSemitones) {
		var target = index + offset;

		while (target >= octaveSemitones) {
			target -= octaveSemitones;
		}

		while (target < 0) {
			target += octaveSemitones;
		}

		return target;
	}

	global.CodaMusicUtils = {
		circularChromaticIndex: circularChromaticIndex,
		circularInterval: circularInterval,
		circularScaleNote: circularScaleNote,
		findChordDefinitionByName: findChordDefinitionByName,
		findInterval: findInterval,
		noteIndex: noteIndex,
		noteName: noteName,
		parsePattern: parsePattern
	};
})(window);
