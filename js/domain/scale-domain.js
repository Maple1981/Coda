// Scale construction rules. This module has no DOM, MIDI, or rendering dependencies.
(function (global) {
	'use strict';

	var utils = global.CodaMusicUtils;

	function buildScale(options) {
		var scaleDefinition = options.scaleDefinition;
		var scalePattern = utils.parsePattern(scaleDefinition.patron);
		var position = options.tonicIndex;
		var semitoneSum = 0;
		var modalPrincipal = 0;
		var modalSecondary = 0;
		var scaleNotes = [];
		var spellByDegree = shouldSpellByDegree(scaleDefinition, scalePattern);

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

			var interval = utils.findInterval(options.intervals, semitoneSum);
			var scaleNote = {
				midiNote: 60 + options.tonicIndex + semitoneSum,
				nombre: spellByDegree ?
					spelledDegreeName(options, i, position) :
					utils.noteName(options.notes[position], options.preferFlats),
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

	function shouldSpellByDegree(scaleDefinition, scalePattern) {
		return scalePattern.length === 7 && (
			scaleDefinition.tonal === 'true' ||
			scaleDefinition.modal === 'true'
		);
	}

	function spelledDegreeName(options, degreeIndex, chromaticPosition) {
		var tonicName = utils.noteName(options.notes[options.tonicIndex], options.preferFlats);
		var letter = letterAt(tonicName, degreeIndex);
		var targetIndex = chromaticPosition % options.octaveSemitones;
		var naturalIndex = naturalNoteIndex(letter);
		var accidental = accidentalForDistance(targetIndex - naturalIndex, options.octaveSemitones);

		return letter + accidental;
	}

	function letterAt(tonicName, degreeIndex) {
		var letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
		var tonicLetter = String(tonicName || 'C').charAt(0);
		var tonicLetterIndex = letters.indexOf(tonicLetter);

		if (tonicLetterIndex < 0) {
			tonicLetterIndex = 0;
		}

		return letters[(tonicLetterIndex + degreeIndex) % letters.length];
	}

	function naturalNoteIndex(letter) {
		var indexes = {
			C: 0,
			D: 2,
			E: 4,
			F: 5,
			G: 7,
			A: 9,
			B: 11
		};

		return indexes[letter];
	}

	function accidentalForDistance(distance, octaveSemitones) {
		while (distance > octaveSemitones / 2) {
			distance -= octaveSemitones;
		}

		while (distance < -octaveSemitones / 2) {
			distance += octaveSemitones;
		}

		if (distance === 2) {
			return '##';
		}

		if (distance === 1) {
			return '#';
		}

		if (distance === -1) {
			return 'b';
		}

		if (distance === -2) {
			return 'bb';
		}

		return '';
	}

	global.CodaScaleDomain = {
		accidentalForDistance: accidentalForDistance,
		buildScale: buildScale,
		letterAt: letterAt,
		shouldSpellByDegree: shouldSpellByDegree,
		spelledDegreeName: spelledDegreeName
	};
})(window);
