// Builds timed progression measures from resolved harmonic degrees.
(function (global) {
	'use strict';

	var chordPlanService = global.CodaProgressionChordPlan;
	var formattingService = global.CodaProgressionFormatting;
	var tonalFunctionService = global.CodaProgressionTonalFunction;
	var voiceLeadingService = global.CodaProgressionVoiceLeading;

	function build(resolvedDegrees, progressionState, secondsPerBeat, options) {
		var measures = [];
		var previousPlan = null;

		options = options || {};
		for (var i = 0; i < resolvedDegrees.length; i++) {
			var startBeat = i * progressionState.beatsPerBar;
			var durationBeats = progressionState.beatsPerBar;
			var chordPlan = chordPlanService.build({
				index: i,
				options: options,
				previousPlan: previousPlan,
				progressionState: progressionState,
				resolvedDegree: resolvedDegrees[i],
				resolvedDegrees: resolvedDegrees
			});

			measures.push({
				articulation: progressionState.articulation,
				bar: i + 1,
				beatUnit: progressionState.beatUnit,
				chord: resolvedDegrees[i].chord,
				chordKind: chordPlan.kind,
				chordName: chordPlan.chordName,
				degree: formattingService.displayDegree(chordPlan.degree, chordPlan.inversionLabel, chordPlan.suspension),
				displayName: formattingService.displayName(chordPlan.chordName, chordPlan.inversionLabel, chordPlan.suspension, chordPlan.tensionLabel),
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				endBeat: startBeat + durationBeats,
				endSeconds: (startBeat + durationBeats) * secondsPerBeat,
				inversion: chordPlan.inversionLabel,
				inversionIndex: chordPlan.inversionIndex,
				midiNotes: chordPlan.midiNotes,
				notes: chordPlan.notes,
				source: resolvedDegrees[i].source || 'diatonic',
				startBeat: startBeat,
				startSeconds: startBeat * secondsPerBeat,
				suspension: chordPlan.suspension,
				tonalFunction: tonalFunctionForDegree(options.scaleDefinition, resolvedDegrees[i].degreeIndex),
				voiceNotes: chordPlan.voiceNotes,
				voices: progressionState.voices
			});
			previousPlan = chordPlan;
		}

		return voiceLeadingService.annotateMeasures(measures, progressionState);
	}

	function tonalFunctionForDegree(scaleDefinition, degreeIndex) {
		return tonalFunctionService.forDegree(scaleDefinition, degreeIndex);
	}

	global.CodaProgressionMeasureBuilder = {
		build: build,
		tonalFunctionForDegree: tonalFunctionForDegree
	};
})(window);
