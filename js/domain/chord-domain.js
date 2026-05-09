// Chord construction rules. This module has no DOM, jQuery, MIDI, or rendering dependencies.
(function (global) {
	'use strict';

	var utils = global.CodaMusicUtils;

	function findChordType(chordDefinitions, pattern) {
		for (var i = 0; i < chordDefinitions.length; i++) {
			if (chordDefinitions[i].patron === pattern) {
				return chordDefinitions[i].abreviatura;
			}
		}

		return '';
	}

	function buildChordFromRoot(options) {
		var chordDefinition = utils.findChordDefinitionByName(options.chordDefinitions, options.chordTypeName);

		if (!chordDefinition) {
			return;
		}

		var pattern = utils.parsePattern(chordDefinition.patron);
		var chordNoteNames = [];

		for (var i = 0; i < pattern.length; i++) {
			var noteOffset = i === 0 ? 0 : pattern[i];
			var notePosition = utils.circularChromaticIndex(options.rootIndex, noteOffset, options.octaveSemitones);
			chordNoteNames.push(utils.noteName(options.notes[notePosition], options.preferFlats));
		}

		return {
			rootName: utils.noteName(options.notes[options.rootIndex], options.preferFlats),
			abbreviation: chordDefinition.abreviatura,
			notes: chordNoteNames
		};
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

			var third = utils.circularScaleNote(options.scaleNotes, i, thirdSteps);
			var fifth = utils.circularScaleNote(options.scaleNotes, i, fifthSteps);
			var seventh = utils.circularScaleNote(options.scaleNotes, i, seventhSteps);
			var second = utils.circularScaleNote(options.scaleNotes, i, secondSteps);
			var fourth = utils.circularScaleNote(options.scaleNotes, i, fourthSteps);

			var firstInterval = utils.circularInterval(options.scaleNotes, i, third, options.octaveSemitones);
			var secondInterval = utils.circularInterval(options.scaleNotes, i, fifth, options.octaveSemitones);
			var thirdInterval = utils.circularInterval(options.scaleNotes, i, seventh, options.octaveSemitones);
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

	global.CodaChordDomain = {
		buildChordFromRoot: buildChordFromRoot,
		buildScaleChords: buildScaleChords,
		findChordType: findChordType,
		modalChordType: modalChordType
	};
})(window);
