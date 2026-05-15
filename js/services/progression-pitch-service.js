// Pitch helpers shared by progression voicing, voice leading and chord menus.
(function (global) {
	'use strict';

	function commonPitchNames(firstNotes, secondNotes) {
		var common = [];
		var firstNamesList = noteNamesFromValue(firstNotes);
		var secondNamesList = noteNamesFromValue(secondNotes);
		var secondNames = {};

		for (var i = 0; i < secondNamesList.length; i++) {
			secondNames[normalizePitchName(secondNamesList[i])] = true;
		}

		for (var j = 0; j < firstNamesList.length; j++) {
			var name = normalizePitchName(firstNamesList[j]);

			if (secondNames[name] && common.indexOf(name) === -1) {
				common.push(name);
			}
		}

		return common;
	}

	function noteNameToMidi(noteName, initialMidiNote) {
		var index = noteIndex(noteName);

		return index == null ? null : initialMidiNote + index;
	}

	function noteIndex(noteName) {
		var indexes = {
			C: 0,
			'C#': 1,
			Db: 1,
			D: 2,
			'D#': 3,
			Eb: 3,
			E: 4,
			F: 5,
			'F#': 6,
			Gb: 6,
			G: 7,
			'G#': 8,
			Ab: 8,
			A: 9,
			'A#': 10,
			Bb: 10,
			B: 11
		};
		var normalizedName = normalizePitchName(noteName);

		return indexes[normalizedName] != null ? indexes[normalizedName] : parsedNoteIndex(normalizedName);
	}

	function normalizePitchName(noteName) {
		var normalized = String(noteName || '')
			.replace(/\uD834\uDD2A/g, '##')
			.replace(/\uD834\uDD2B/g, 'bb')
			.replace(/\u266f/g, '#')
			.replace(/\u266d/g, 'b');
		var match = /^([A-G])([#b]{0,2})/.exec(normalized);

		return match ? match[1] + match[2] : '';
	}

	function parsedNoteIndex(noteName) {
		var match = /^([A-G])([#b]{0,2})$/.exec(noteName || '');
		var naturalIndexes = {
			C: 0,
			D: 2,
			E: 4,
			F: 5,
			G: 7,
			A: 9,
			B: 11
		};
		var index;

		if (!match || naturalIndexes[match[1]] == null) {
			return null;
		}

		index = naturalIndexes[match[1]] + accidentalOffset(match[2]);
		index %= 12;

		return index < 0 ? index + 12 : index;
	}

	function accidentalOffset(accidental) {
		var offset = 0;

		for (var i = 0; i < String(accidental || '').length; i++) {
			offset += accidental.charAt(i) === '#' ? 1 : -1;
		}

		return offset;
	}

	function nearestMidiTo(referenceNote, midiNote) {
		var nearest = midiNote;

		while (nearest - referenceNote > 6) {
			nearest -= 12;
		}

		while (referenceNote - nearest > 6) {
			nearest += 12;
		}

		return nearest;
	}

	function noteNamesFromValue(value) {
		var result = [];

		if (!value) {
			return result;
		}

		if (Object.prototype.toString.call(value) === '[object Array]') {
			return value;
		}

		if (value.notes) {
			return value.notes;
		}

		for (var i = 0; i < (value.voiceNotes || []).length; i++) {
			result.push(value.voiceNotes[i].note);
		}

		return result;
	}

	global.CodaProgressionPitch = {
		commonPitchNames: commonPitchNames,
		nearestMidiTo: nearestMidiTo,
		normalizePitchName: normalizePitchName,
		noteIndex: noteIndex,
		noteNameToMidi: noteNameToMidi
	};
})(window);
