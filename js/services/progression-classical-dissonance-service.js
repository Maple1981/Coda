// Classical preparation, appearance and resolution checks for generated dissonances.
(function (global) {
	'use strict';

	var pitchService = global.CodaProgressionPitch;
	var styleService = global.CodaProgressionStyle;

	function isClassic(progressionState) {
		return styleService && styleService.requiresPreparedDissonance ?
			styleService.requiresPreparedDissonance(progressionState) :
			progressionState && progressionState.style === 'classic';
	}

	function allowsSuspension(context, baseNotes, suspensionNote) {
		if (!isClassic(context && context.progressionState)) {
			return true;
		}

		return isPreparedByPreviousHarmony(context && context.previousPlan, suspensionNote) &&
			resolvesByStepToChordThird(baseNotes, suspensionNote);
	}

	function isPreparedByPreviousHarmony(previousPlan, dissonantNote) {
		return containsPitchClass(notesFromPlan(previousPlan), dissonantNote);
	}

	function resolvesByStepToChordThird(baseNotes, dissonantNote) {
		var resolutionNote = baseNotes && baseNotes[1];

		return stepDistance(dissonantNote, resolutionNote) > 0 && stepDistance(dissonantNote, resolutionNote) <= 2;
	}

	function allowsAddedTension(tensionNote, chordNotes, options) {
		if (!isClassic({ style: options && options.style })) {
			return true;
		}

		if (!isFunctionalDissonancePosition(options)) {
			return false;
		}

		return resolvesByStepToAny(tensionNote, options && options.nextChordNotes);
	}

	function desiredTensionCount(desiredCount, options) {
		if (!isClassic({ style: options && options.style })) {
			return desiredCount;
		}

		return Math.min(desiredCount, 1);
	}

	function allowsPassingNote(currentNote, passingNote, nextNote, progressionState) {
		var currentMidi;
		var passingMidi;
		var nextMidi;
		var direction;

		if (!isClassic(progressionState)) {
			return true;
		}

		currentMidi = midiFromValue(currentNote);
		passingMidi = midiFromValue(passingNote);
		nextMidi = midiFromValue(nextNote);
		if (currentMidi == null || passingMidi == null || nextMidi == null || currentMidi === nextMidi) {
			return false;
		}

		direction = nextMidi > currentMidi ? 1 : -1;

		return (passingMidi - currentMidi) * direction > 0 &&
			(nextMidi - passingMidi) * direction > 0 &&
			Math.abs(passingMidi - currentMidi) <= 2 &&
			Math.abs(nextMidi - passingMidi) <= 2;
	}

	function resolvesByStepToAny(noteName, targetNotes) {
		for (var i = 0; i < (targetNotes || []).length; i++) {
			var distance = stepDistance(noteName, targetNotes[i]);

			if (distance > 0 && distance <= 2) {
				return true;
			}
		}

		return false;
	}

	function isFunctionalDissonancePosition(options) {
		if (!options) {
			return false;
		}

		return options.tonalFunction === 'D' || !!options.cadentialRole || !!options.chromaticRole;
	}

	function notesFromPlan(plan) {
		var result = [];
		var voiceNotes = plan && plan.voiceNotes ? plan.voiceNotes : [];
		var notes = plan && plan.notes ? plan.notes : [];

		for (var i = 0; i < voiceNotes.length; i++) {
			result.push(voiceNotes[i].note || voiceNotes[i]);
		}

		return result.concat(notes);
	}

	function containsPitchClass(notes, noteName) {
		var targetIndex = pitchService.noteIndex(noteName);

		if (targetIndex == null) {
			return false;
		}

		for (var i = 0; i < (notes || []).length; i++) {
			if (pitchService.noteIndex(notes[i]) === targetIndex) {
				return true;
			}
		}

		return false;
	}

	function stepDistance(firstNote, secondNote) {
		var firstIndex = pitchService.noteIndex(firstNote);
		var secondIndex = pitchService.noteIndex(secondNote);
		var up;
		var down;

		if (firstIndex == null || secondIndex == null) {
			return 99;
		}

		up = (secondIndex - firstIndex + 12) % 12;
		down = (firstIndex - secondIndex + 12) % 12;

		return Math.min(up, down);
	}

	function midiFromValue(value) {
		if (value == null) {
			return null;
		}

		if (typeof value === 'number') {
			return value;
		}

		if (value.midiNote != null) {
			return Number(value.midiNote);
		}

		return null;
	}

	global.CodaProgressionClassicalDissonance = {
		allowsAddedTension: allowsAddedTension,
		allowsPassingNote: allowsPassingNote,
		allowsSuspension: allowsSuspension,
		containsPitchClass: containsPitchClass,
		desiredTensionCount: desiredTensionCount,
		isPreparedByPreviousHarmony: isPreparedByPreviousHarmony,
		resolvesByStepToAny: resolvesByStepToAny,
		resolvesByStepToChordThird: resolvesByStepToChordThird,
		stepDistance: stepDistance
	};
})(window);
