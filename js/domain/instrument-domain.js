// Pure instrument model builders. Renderers consume these structures without
// knowing how notes are matched against the selected scale.
(function (global) {
	'use strict';

	function buildGuitarFretboard(options) {
		var openStrings = options.preferFlats ? options.tuning.patron.split('-') : options.tuning.enarmonica.split('-');
		var openStringMidiNotes = resolveTuningMidiNotes(openStrings, options.notes);
		var strings = [];

		for (var i = openStrings.length - 1; i >= 0; i--) {
			var openState = findScaleNoteStateByName({
				noteName: openStrings[i],
				scaleNotes: options.scaleNotes,
				isDegreeSuppressed: options.isDegreeSuppressed
			});

			strings.push({
				aire: openStrings[i],
				midiNote: openStringMidiNotes[i],
				perteneceEscala: openState.belongsToScale,
				tipo: openState.modalType,
				trastes: buildStringFrets(openStrings[i], options, openStringMidiNotes[i])
			});
		}

		return strings;
	}

	function buildStringFrets(openStringName, options, openStringMidiNote) {
		var frets = [];
		var currentPosition = findNoteIndex(options.notes, openStringName);

		for (var i = 0; i < options.fretCount; i++) {
			currentPosition = currentPosition < options.notes.length - 1 ? currentPosition + 1 : 0;

			var noteName = noteNameForFormat(options.notes[currentPosition], options.preferFlats);
			var noteState = findScaleNoteStateByName({
				noteName: noteName,
				scaleNotes: options.scaleNotes,
				isDegreeSuppressed: options.isDegreeSuppressed
			});

			frets.push({
				midiNote: openStringMidiNote != null ? openStringMidiNote + i + 1 : undefined,
				nombre: noteName,
				perteneceEscala: noteState.belongsToScale,
				tipo: noteState.modalType
			});
		}

		return frets;
	}

	function buildPianoKeyboard(options) {
		return {
			blackKeys: buildBlackKeys(options),
			whiteKeys: buildWhiteKeys(options)
		};
	}

	function buildBlackKeys(options) {
		var keys = [];
		var firstMidiNote = options.pianoStartMidiNote || 48;

		for (var octave = 0; octave < options.octaveCount; octave++) {
			for (var i = 0; i < options.notes.length; i++) {
				var note = options.notes[i];
				var midiNote = firstMidiNote + (octave * options.notes.length) + i;

				if (note.enarmonica != null) {
					var noteState = findScaleNoteStateForPitch({
						note: note,
						includeEnharmonic: true,
						scaleNotes: options.scaleNotes,
						isDegreeSuppressed: options.isDegreeSuppressed
					});

					keys.push({
						midiNote: midiNote,
						type: 'note',
						nombre: options.preferFlats ? note.enarmonica : note.nombre,
						perteneceEscala: noteState.belongsToScale,
						tipo: noteState.modalType
					});
				} else {
					keys.push({
						type: 'spacer',
						nombre: note.nombre
					});
				}
			}
		}

		return keys;
	}

	function buildWhiteKeys(options) {
		var keys = [];
		var firstMidiNote = options.pianoStartMidiNote || 48;

		for (var octave = 0; octave < options.octaveCount; octave++) {
			for (var i = 0; i < options.notes.length; i++) {
				var note = options.notes[i];
				var midiNote = firstMidiNote + (octave * options.notes.length) + i;

				if (note.enarmonica == null) {
					var noteState = findScaleNoteStateForPitch({
						note: note,
						includeEnharmonic: false,
						scaleNotes: options.scaleNotes,
						isDegreeSuppressed: options.isDegreeSuppressed
					});

					keys.push({
						midiNote: midiNote,
						type: 'note',
						nombre: note.nombre,
						perteneceEscala: noteState.belongsToScale,
						tipo: noteState.modalType
					});
				}
			}
		}

		return keys;
	}

	function findScaleNoteStateByName(options) {
		for (var key in options.scaleNotes) {
			if (options.scaleNotes[key].nombre === options.noteName && !options.isDegreeSuppressed(key)) {
				return {
					belongsToScale: true,
					modalType: options.scaleNotes[key].tipo || ''
				};
			}
		}

		return {
			belongsToScale: false,
			modalType: ''
		};
	}

	function findScaleNoteStateForPitch(options) {
		for (var key in options.scaleNotes) {
			var scaleNote = options.scaleNotes[key];
			var matchesName = scaleNote.nombre === options.note.nombre;
			var matchesEnharmonic = options.includeEnharmonic && options.note.enarmonica != null && scaleNote.nombre === options.note.enarmonica;

			if ((matchesName || matchesEnharmonic) && !options.isDegreeSuppressed(key)) {
				return {
					belongsToScale: true,
					modalType: scaleNote.tipo || ''
				};
			}
		}

		return {
			belongsToScale: false,
			modalType: ''
		};
	}

	function findNoteIndex(notes, noteName) {
		for (var i = 0; i < notes.length; i++) {
			if (notes[i].nombre === noteName || notes[i].enarmonica === noteName) {
				return i;
			}
		}

		return 0;
	}

	function noteNameForFormat(note, preferFlats) {
		if (preferFlats && note.enarmonica !== undefined) {
			return note.enarmonica;
		}

		return note.nombre;
	}

	function resolveTuningMidiNotes(openStrings, notes) {
		var standardGuitarMidiNotes = [40, 45, 50, 55, 59, 64];
		var midiNotes = [];

		for (var i = 0; i < openStrings.length; i++) {
			midiNotes.push(resolveNearestMidiForNoteName(openStrings[i], notes, standardGuitarMidiNotes[i]));
		}

		return midiNotes;
	}

	function resolveNearestMidiForNoteName(noteName, notes, referenceMidiNote) {
		var pitchClass = findNoteIndex(notes, noteName);
		var closestMidiNote = pitchClass;

		while (closestMidiNote < referenceMidiNote - 6) {
			closestMidiNote += notes.length;
		}

		while (closestMidiNote > referenceMidiNote + 6) {
			closestMidiNote -= notes.length;
		}

		return closestMidiNote;
	}

	global.CodaInstrumentDomain = {
		buildBlackKeys: buildBlackKeys,
		buildGuitarFretboard: buildGuitarFretboard,
		buildPianoKeyboard: buildPianoKeyboard,
		buildStringFrets: buildStringFrets,
		buildWhiteKeys: buildWhiteKeys,
		findNoteIndex: findNoteIndex,
		findScaleNoteStateByName: findScaleNoteStateByName,
		findScaleNoteStateForPitch: findScaleNoteStateForPitch,
		noteNameForFormat: noteNameForFormat,
		resolveNearestMidiForNoteName: resolveNearestMidiForNoteName,
		resolveTuningMidiNotes: resolveTuningMidiNotes
	};
})(window);
