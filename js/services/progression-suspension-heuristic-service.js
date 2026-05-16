// Heuristics for choosing chord suspensions in generated progressions.
(function (global) {
	'use strict';

	var voicingService = global.CodaProgressionVoicing;

	function probability(options) {
		var progressionState = options.progressionState || {};
		var result = 0.045 +
			Math.max(0, numberOrDefault(progressionState.counterpoint, 0) - 25) / 360 +
			Math.max(0, numberOrDefault(progressionState.tensions, 0) - 30) / 430;

		if (numberOrDefault(progressionState.voices, 4) >= 4) {
			result += 0.02;
		}

		if (progressionState.articulation === 'sustain') {
			result += 0.02;
		} else if (progressionState.articulation === 'staccato') {
			result -= 0.035;
		}

		if (numberOrDefault(progressionState.counterpoint, 0) >= 70 && numberOrDefault(progressionState.tensions, 0) >= 70) {
			result += 0.08;
		}

		if (options.suspendedScore <= options.originalScore) {
			result += 0.14;
		} else if (options.suspendedScore <= options.originalScore + 2) {
			result += 0.09;
		} else {
			result -= 0.05;
		}

		return Math.max(0.03, result);
	}

	function voiceMovesParsimoniouslyToNote(voiceNotes, noteName, initialMidiNote) {
		var targetMidi = voicingService.noteNameToMidi(noteName, initialMidiNote);

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			if (targetMidi != null && Math.abs(voicingService.nearestMidiTo(voiceNotes[i].midiNote, targetMidi) - voiceNotes[i].midiNote) <= 2) {
				return true;
			}
		}

		return false;
	}

	function isTonicBoundary(index, length, degreeIndex) {
		return degreeIndex === 0 && (index === 0 || index === length - 1);
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionSuspensionHeuristic = {
		isTonicBoundary: isTonicBoundary,
		probability: probability,
		voiceMovesParsimoniouslyToNote: voiceMovesParsimoniouslyToNote
	};
})(window);
