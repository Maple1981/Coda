// Chooses sus2/sus4 chord suspensions using voice-leading and tension settings.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var suspensionHeuristic = global.CodaProgressionSuspensionHeuristic;
	var voicingService = global.CodaProgressionVoicing;

	function choose(context, baseNotes, kind) {
		var chord = context.resolvedDegree.chord;
		var previousPlan = context.previousPlan;
		var progressionState = context.progressionState;
		var rng = typeof context.options.rng === 'function' ? context.options.rng : function () { return 1; };
		var label;
		var suspensionNote;
		var originalVoicing;
		var suspendedVoicing;
		var probability;

		if (!chord || !previousPlan || !chord.segunda || !chord.cuarta || baseNotes.length < 3) {
			return null;
		}

		if (suspensionHeuristic.isTonicBoundary(context.index, context.resolvedDegrees.length, context.resolvedDegree.degreeIndex)) {
			return null;
		}

		label = formattingService.isMinorQuality(chord.nombre) ? 'sus2' : 'sus4';
		suspensionNote = label === 'sus2' ? chord.segunda : chord.cuarta;
		originalVoicing = chooseCandidateVoicing(context, baseNotes, kind);
		suspendedVoicing = chooseCandidateVoicing(context, suspendedNotes(baseNotes, suspensionNote), kind);
		probability = suspensionHeuristic.probability({
			originalScore: voicingService.voiceLeadingTransitionScore(previousPlan, originalVoicing),
			progressionState: progressionState,
			suspendedScore: voicingService.voiceLeadingTransitionScore(previousPlan, suspendedVoicing)
		});

		if (!suspensionHeuristic.voiceMovesParsimoniouslyToNote(previousPlan.voiceNotes, suspensionNote, context.options.initialMidiNote || 60)) {
			probability *= 0.5;
		}

		if (rng() >= Math.min(0.55, probability)) {
			return null;
		}

		return {
			label: label,
			note: suspensionNote
		};
	}

	function chooseCandidateVoicing(context, baseNotes, kind) {
		return voicingService.chooseVoicing({
			baseNotes: baseNotes,
			chordName: context.resolvedDegree.chord.nombre,
			extraNotes: [],
			initialMidiNote: context.options.initialMidiNote || 60,
			kind: kind,
			previousPlan: context.previousPlan,
			voicing: context.progressionState.voicing,
			voices: context.progressionState.voices
		});
	}

	function suspendedNotes(baseNotes, suspensionNote) {
		var result = baseNotes.slice();

		if (result.length > 1) {
			result[1] = suspensionNote;
		}

		return result;
	}

	global.CodaProgressionSuspension = {
		choose: choose,
		suspendedNotes: suspendedNotes
	};
})(window);
