// Builds final progression objects from normalized state and prepared measures.
(function (global) {
	'use strict';

	function build(options) {
		var progressionState = options.progressionState;
		var secondsPerBeat = options.secondsPerBeat;
		var progression = {
			articulation: progressionState.articulation,
			bars: progressionState.bars,
			beatUnit: progressionState.beatUnit,
			beatsPerBar: progressionState.beatsPerBar,
			bpm: progressionState.bpm,
			harmonicColor: {
				counterpoint: progressionState.counterpoint,
				modalInterchange: progressionState.modalInterchange,
				tensions: progressionState.tensions
			},
			measures: options.measures || [],
			meter: progressionState.meter,
			secondsPerBeat: secondsPerBeat,
			style: progressionState.style,
			totalBeats: progressionState.bars * progressionState.beatsPerBar,
			totalSeconds: progressionState.bars * progressionState.beatsPerBar * secondsPerBeat,
			voicing: progressionState.voicing,
			voices: progressionState.voices
		};

		if (options.generationPlan) {
			progression.generation = {
				cadence: options.generationPlan.pattern.cadence,
				form: options.generationPlan.pattern.form,
				patternId: options.generationPlan.pattern.id,
				style: progressionState.style,
				voiceLeading: options.generationPlan.voiceLeading
			};
		}

		return progression;
	}

	global.CodaProgressionResult = {
		build: build
	};
})(window);
