// Domain helpers for pure music rules. This file intentionally avoids DOM,
// jQuery, MIDI, and rendering concerns so it can be tested independently.
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

	function buildScale(options) {
		var scaleDefinition = options.scaleDefinition;
		var scalePattern = parsePattern(scaleDefinition.patron);
		var position = options.tonicIndex;
		var semitoneSum = 0;
		var modalPrincipal = 0;
		var modalSecondary = 0;
		var scaleNotes = [];

		if (scaleDefinition.modal === 'true') {
			var characteristicNotes = scaleDefinition.caracteristicas.split('-');
			modalPrincipal = parseInt(characteristicNotes[0], 10);
			modalSecondary = parseInt(characteristicNotes[1], 10);
		}

		for (var i = 0; i < scalePattern.length; i++) {
			position += scalePattern[i];
			if (position >= options.octaveSemitones) {
				position -= options.octaveSemitones;
			}

			semitoneSum += scalePattern[i];

			var interval = findInterval(options.intervals, semitoneSum);
			var scaleNote = {
				nombre: noteName(options.notes[position], options.preferFlats),
				semitonos: semitoneSum,
				nombreGrado: interval.nombre,
				grado: interval.grado
			};

			if (scaleDefinition.modal === 'true' && modalPrincipal > 0 && modalSecondary > 0) {
				if (i + 1 === modalPrincipal) {
					scaleNote.tipo = 'principal';
				} else if (i + 1 === modalSecondary) {
					scaleNote.tipo = 'secundaria';
				} else {
					scaleNote.tipo = null;
				}
			}

			scaleNotes.push(scaleNote);
		}

		return scaleNotes;
	}

	function findChordType(chordDefinitions, pattern) {
		for (var i = 0; i < chordDefinitions.length; i++) {
			if (chordDefinitions[i].patron === pattern) {
				return chordDefinitions[i].abreviatura;
			}
		}

		return '';
	}

	function modalChordType(scaleNote, third, fifth, seventh) {
		var rootIsCharacteristic = scaleNote.tipo === 'principal' || scaleNote.tipo === 'secundaria';
		var chordContainsOtherCharacteristic =
			third.tipo === 'principal' ||
			third.tipo === 'secundaria' ||
			fifth.tipo === 'principal' ||
			fifth.tipo === 'secundaria' ||
			seventh.tipo === 'principal' ||
			seventh.tipo === 'secundaria';

		if (rootIsCharacteristic && chordContainsOtherCharacteristic) {
			return 'evitar';
		}

		if (
			scaleNote.tipo === 'principal' ||
			third.tipo === 'principal' ||
			fifth.tipo === 'principal' ||
			seventh.tipo === 'principal'
		) {
			return 'cadencial';
		}

		return '';
	}

	function buildScaleChords(options) {
		var thirdSteps = 2;
		var fifthSteps = thirdSteps * 2;
		var seventhSteps = thirdSteps * 3;
		var secondSteps = 1;
		var fourthSteps = 3;
		var chords = [];
		var isDegreeSuppressed = options.isDegreeSuppressed || function () { return false; };

		for (var i = 0; i < options.scaleNotes.length; i++) {
			if (isDegreeSuppressed(i)) {
				continue;
			}

			var third = circularScaleNote(options.scaleNotes, i, thirdSteps);
			var fifth = circularScaleNote(options.scaleNotes, i, fifthSteps);
			var seventh = circularScaleNote(options.scaleNotes, i, seventhSteps);
			var second = circularScaleNote(options.scaleNotes, i, secondSteps);
			var fourth = circularScaleNote(options.scaleNotes, i, fourthSteps);

			var firstInterval = circularInterval(options.scaleNotes, i, third, options.octaveSemitones);
			var secondInterval = circularInterval(options.scaleNotes, i, fifth, options.octaveSemitones);
			var thirdInterval = circularInterval(options.scaleNotes, i, seventh, options.octaveSemitones);
			var chordPattern = '1-' + firstInterval + '-' + secondInterval + '-' + thirdInterval;
			var chordType = findChordType(options.chordDefinitions, chordPattern);

			var chord = {
				nombre: options.scaleNotes[i].nombre + chordType,
				fundamental: options.scaleNotes[i].nombre,
				segunda: second.nombre,
				tercera: third.nombre,
				cuarta: fourth.nombre,
				quinta: fifth.nombre,
				septima: seventh.nombre
			};

			if (options.scaleDefinition.modal === 'true') {
				chord.tipo = modalChordType(options.scaleNotes[i], third, fifth, seventh);
			}

			chords.push(chord);
		}

		return chords;
	}

	global.CodaDomain = {
		buildScale: buildScale,
		buildScaleChords: buildScaleChords,
		noteName: noteName,
		parsePattern: parsePattern
	};
})(window);
