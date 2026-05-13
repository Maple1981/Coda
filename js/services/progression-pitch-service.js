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

		return indexes[normalizedName] != null ? indexes[normalizedName] : null;
	}

	function normalizePitchName(noteName) {
		var match = /^([A-G])([#b\u266f\u266d]?)/.exec(String(noteName || '').replace('\u266f', '#').replace('\u266d', 'b'));

		return match ? match[1] + match[2] : '';
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
