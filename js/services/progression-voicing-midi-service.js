// MIDI register helpers for progression voicing construction.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;
	var pitchService = global.CodaProgressionPitch;

	function notesToAscendingMidi(notes, initialMidiNote) {
		var result = [];
		var previousNote = null;

		for (var i = 0; i < notes.length; i++) {
			var midiNote = pitchService.noteNameToMidi(notes[i], initialMidiNote);

			if (midiNote == null) {
				continue;
			}

			while (previousNote != null && midiNote <= previousNote) {
				midiNote += 12;
			}

			result.push(midiNote);
			previousNote = midiNote;
		}

		return result;
	}

	function fitToPrevious(voicing, previousPlan) {
		var fittedMidiNotes = [];
		var fittedVoiceNotes = [];
		var previousMidiNotes = previousPlan.midiNotes || [];

		for (var i = 0; i < voicing.midiNotes.length; i++) {
			var referenceNote = previousMidiNotes[Math.min(i, previousMidiNotes.length - 1)];
			var midiNote = referenceNote != null ? pitchService.nearestMidiTo(referenceNote, voicing.midiNotes[i]) : voicing.midiNotes[i];

			if (i > 0) {
				while (midiNote <= fittedMidiNotes[i - 1]) {
					midiNote += 12;
				}
			}

			fittedMidiNotes.push(midiNote);
			fittedVoiceNotes.push(extendObject(voicing.voiceNotes[i], {
				midiNote: midiNote
			}));
		}

		return extendObject(voicing, {
			midiNotes: fittedMidiNotes,
			voiceNotes: fittedVoiceNotes
		});
	}

	function clampInversionIndex(value, maxInversions) {
		var numericValue = parseInt(value, 10);

		if (isNaN(numericValue)) {
			return 0;
		}

		return Math.max(0, Math.min(maxInversions - 1, numericValue));
	}

	function extendObject(source, values) {
		return objectService.extendObject(source, values);
	}

	global.CodaProgressionVoicingMidi = {
		clampInversionIndex: clampInversionIndex,
		fitToPrevious: fitToPrevious,
		notesToAscendingMidi: notesToAscendingMidi
	};
})(window);
