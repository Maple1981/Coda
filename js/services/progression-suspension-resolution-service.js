// Chooses the best immediate resolution when a split measure starts from a suspended chord.
(function (global) {
	'use strict';

	var measureContext = global.CodaProgressionMeasureContext;
	var voicingService = global.CodaProgressionVoicing;

	function choose(options) {
		var measure = options.measure;
		var resolvedDegree;
		var candidates = [];
		var kinds = ['triad', 'seventh'];

		if (!measure || !measure.suspension) {
			return null;
		}

		resolvedDegree = measureContext.resolvedDegreeFromMeasure(measure, options.report);
		if (!resolvedDegree || !resolvedDegree.chord) {
			return null;
		}

		for (var i = 0; i < kinds.length; i++) {
			var labels = kinds[i] === 'seventh' ? ['', '6/5', '4/3', '4/2'] : ['', '6', '6/4'];

			for (var j = 0; j < labels.length; j++) {
				var chordPlan = options.buildChordPlan({
					index: 1,
					options: {
						forceInversionIndex: j,
						forceKind: kinds[i],
						includeTensions: false,
						initialMidiNote: options.initialMidiNote,
						preventSuspension: true,
						scaleDefinition: options.report.scaleDefinition,
						scaleNotes: options.report.scaleNotes
					},
					previousPlan: options.previousPlan,
					progressionState: options.progressionState,
					resolvedDegree: resolvedDegree,
					resolvedDegrees: [
						resolvedDegree,
						resolvedDegree,
						measureContext.resolvedDegreeFromMeasure(options.nextMeasure, options.report) || resolvedDegree
					]
				});

				candidates.push({
					chordPlan: chordPlan,
					reportScaleDefinition: options.report.scaleDefinition,
					resolvedDegree: resolvedDegree,
					score: score({
						chordPlan: chordPlan,
						nextPlan: options.nextPlan,
						previousPlan: options.previousPlan,
						rng: options.rng
					})
				});
			}
		}

		candidates.sort(function (a, b) {
			return a.score - b.score;
		});

		return candidates.length ? candidates[0] : null;
	}

	function score(options) {
		var result = voicingService.voiceLeadingTransitionScore(options.previousPlan, options.chordPlan);

		if (options.nextPlan) {
			result += voicingService.voiceLeadingTransitionScore(options.chordPlan, options.nextPlan) * 0.25;
		}

		if (options.chordPlan.kind === 'seventh') {
			result += 0.25;
		}

		return result + ((typeof options.rng === 'function' ? options.rng() : Math.random()) * 0.01);
	}

	global.CodaProgressionSuspensionResolution = {
		choose: choose
	};
})(window);
