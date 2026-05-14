// Builds chord voicing candidates before disposition and voice-leading scoring.
(function (global) {
	'use strict';

	var voicingFactors = global.CodaProgressionVoicingFactors;
	var voicingMidi = global.CodaProgressionVoicingMidi;

	function create(options) {
		var voiceCount = Math.max(1, Math.min(numberOrDefault(options.voices, 4), 6));
		var preparedBase = voicingFactors.prepareBaseNotesForVoiceCount(options.baseNotes, options.kind, voiceCount, options.chordName);
		var baseNotes = rotate(preparedBase.notes, options.inversionIndex);
		var notes = baseNotes.slice();
		var factorRoles = rotate(preparedBase.roles, options.inversionIndex);
		var roles = factorRoles.slice();
		var duplicateIndex = 0;
		var duplicatePreference = ['root', 'third', 'fifth'];
		var midiNotes;
		var voiceNotes = [];

		for (var i = 0; i < options.extraNotes.length && notes.length < voiceCount; i++) {
			notes.push(options.extraNotes[i]);
			roles.push('tension');
		}

		while (notes.length < voiceCount && notes.length > 0) {
			var duplicate = voicingFactors.duplicateFactor(options.baseNotes, duplicatePreference[duplicateIndex % duplicatePreference.length], options.kind);
			notes.push(duplicate.note);
			roles.push(duplicate.role + '-doubling');
			duplicateIndex += 1;
		}

		notes = notes.slice(0, voiceCount);
		roles = roles.slice(0, voiceCount);
		midiNotes = voicingMidi.notesToAscendingMidi(notes, options.initialMidiNote);

		for (var j = 0; j < notes.length; j++) {
			voiceNotes.push({
				midiNote: midiNotes[j],
				note: notes[j],
				role: roles[j]
			});
		}

		return {
			inversionIndex: options.inversionIndex,
			inversionLabel: options.inversionLabel,
			midiNotes: midiNotes,
			notes: notes,
			voiceNotes: voiceNotes
		};
	}

	function fitToPrevious(voicing, previousPlan) {
		return voicingMidi.fitToPrevious(voicing, previousPlan);
	}

	function clampInversionIndex(value, maxInversions) {
		return voicingMidi.clampInversionIndex(value, maxInversions);
	}

	function rotate(values, startIndex) {
		var result = [];

		for (var i = 0; i < values.length; i++) {
			result.push(values[(startIndex + i) % values.length]);
		}

		return result;
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionVoicingFactory = {
		clampInversionIndex: clampInversionIndex,
		create: create,
		fitToPrevious: fitToPrevious
	};
})(window);
