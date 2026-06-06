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
			allKeys: buildPianoKeys(options),
			blackKeys: buildBlackKeys(options),
			whiteKeys: buildWhiteKeys(options)
		};
	}

	function buildPianoKeys(options) {
		var keys = [];
		var midiNotes = pianoMidiNotes(options);

		for (var i = 0; i < midiNotes.length; i++) {
			keys.push(pianoKeyForMidiNote(midiNotes[i], options));
		}

		return keys;
	}

	function buildBlackKeys(options) {
		var keys = [];
		var midiNotes = pianoMidiNotes(options);

		for (var i = 0; i < midiNotes.length; i++) {
			var key = pianoKeyForMidiNote(midiNotes[i], options);

			if (key.type === 'black') {
				keys.push(key);
			}
		}

		return keys;
	}

	function buildWhiteKeys(options) {
		var keys = [];
		var midiNotes = pianoMidiNotes(options);

		for (var i = 0; i < midiNotes.length; i++) {
			var key = pianoKeyForMidiNote(midiNotes[i], options);

			if (key.type === 'white') {
				keys.push(key);
			}
		}

		return keys;
	}

	function pianoKeyForMidiNote(midiNote, options) {
		var note = options.notes[normalizePitchClass(midiNote)];
		var includeEnharmonic = note.enarmonica != null;
		var noteState = findScaleNoteStateForPitch({
			note: note,
			includeEnharmonic: includeEnharmonic,
			scaleNotes: options.scaleNotes,
			isDegreeSuppressed: options.isDegreeSuppressed
		});

		return {
			midiNote: midiNote,
			type: note.enarmonica == null ? 'white' : 'black',
			nombre: includeEnharmonic && options.preferFlats ? note.enarmonica : note.nombre,
			perteneceEscala: noteState.belongsToScale,
			tipo: noteState.modalType
		};
	}

	function pianoMidiNotes(options) {
		var firstMidiNote = numberOrDefault(options.pianoStartMidiNote, 48);
		var explicitEndMidiNote = numberOrNull(options.pianoEndMidiNote);
		var keyCount = numberOrDefault(options.pianoKeyCount, numberOrDefault(options.octaveCount, 2) * options.notes.length);
		var lastMidiNote = explicitEndMidiNote != null ? explicitEndMidiNote : firstMidiNote + keyCount - 1;
		var midiNotes = [];

		for (var midiNote = firstMidiNote; midiNote <= lastMidiNote; midiNote++) {
			midiNotes.push(midiNote);
		}

		return midiNotes;
	}

	function findScaleNoteStateByName(options) {
		for (var key in options.scaleNotes) {
			if ((options.scaleNotes[key].nombre === options.noteName || samePitchClass(options.scaleNotes[key].nombre, options.noteName)) && !options.isDegreeSuppressed(key)) {
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
			var matchesPitchClass = samePitchClass(scaleNote.nombre, options.note.nombre) ||
				(options.includeEnharmonic && options.note.enarmonica != null && samePitchClass(scaleNote.nombre, options.note.enarmonica));

			if ((matchesName || matchesEnharmonic || matchesPitchClass) && !options.isDegreeSuppressed(key)) {
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

	function samePitchClass(firstNoteName, secondNoteName) {
		var firstPitchClass = notePitchClass(firstNoteName);
		var secondPitchClass = notePitchClass(secondNoteName);

		return firstPitchClass != null && secondPitchClass != null && firstPitchClass === secondPitchClass;
	}

	function notePitchClass(noteName) {
		var match = /^([A-G])((?:##|bb|#|b|\u266f|\u266d|\uD834\uDD2A|\uD834\uDD2B)*)/.exec(String(noteName || ''));

		if (!match) {
			return null;
		}

		var basePitchClasses = {
			C: 0,
			D: 2,
			E: 4,
			F: 5,
			G: 7,
			A: 9,
			B: 11
		};
		var accidental = String(match[2] || '')
			.replace(/\u266f/g, '#')
			.replace(/\u266d/g, 'b')
			.replace(/\uD834\uDD2A/g, '##')
			.replace(/\uD834\uDD2B/g, 'bb');
		var offset = 0;

		for (var i = 0; i < accidental.length; i++) {
			if (accidental[i] === '#') {
				offset += 1;
			} else if (accidental[i] === 'b') {
				offset -= 1;
			}
		}

		return normalizePitchClass(basePitchClasses[match[1]] + offset);
	}

	function normalizePitchClass(value) {
		return ((value % 12) + 12) % 12;
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	function numberOrNull(value) {
		var number = Number(value);

		return isFinite(number) ? number : null;
	}

	function findNoteIndex(notes, noteName) {
		if (notes._codaIndex && notes._codaIndex.indexByName && notes._codaIndex.indexByName[noteName] !== undefined) {
			return notes._codaIndex.indexByName[noteName];
		}

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
		buildPianoKeys: buildPianoKeys,
		buildPianoKeyboard: buildPianoKeyboard,
		buildStringFrets: buildStringFrets,
		buildWhiteKeys: buildWhiteKeys,
		findNoteIndex: findNoteIndex,
		findScaleNoteStateByName: findScaleNoteStateByName,
		findScaleNoteStateForPitch: findScaleNoteStateForPitch,
		notePitchClass: notePitchClass,
		noteNameForFormat: noteNameForFormat,
		resolveNearestMidiForNoteName: resolveNearestMidiForNoteName,
		resolveTuningMidiNotes: resolveTuningMidiNotes
	};
})(window);
