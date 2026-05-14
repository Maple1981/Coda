// Chooses an additional chord for a split measure using tonal function and voice-leading heuristics.
(function (global) {
	'use strict';

	var additionalChordScoreService = global.CodaProgressionAdditionalChordScore;
	var measureContext = global.CodaProgressionMeasureContext;
	var suspensionResolutionService = global.CodaProgressionSuspensionResolution;

	function choose(options) {
		var report = options.report || {};
		var scaleChords = report.scaleChords || [];
		var scaleNotes = report.scaleNotes || [];
		var candidates = [];
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var previousPlan = measureContext.measurePlan(options.measure);
		var nextPlan = options.nextMeasure ? measureContext.measurePlan(options.nextMeasure) : null;
		var progressionState = options.progressionState;
		var initialMidiNote = options.data && options.data.midi ? options.data.midi.initialMidiNote : 60;
		var suspensionResolution = suspensionResolutionService.choose({
			buildChordPlan: options.buildChordPlan,
			initialMidiNote: initialMidiNote,
			measure: options.measure,
			nextMeasure: options.nextMeasure,
			nextPlan: nextPlan,
			previousPlan: previousPlan,
			progressionState: progressionState,
			report: report,
			rng: rng
		});

		if (suspensionResolution) {
			return suspensionResolution;
		}

		for (var i = 0; i < scaleChords.length; i++) {
			var resolvedDegree;
			var chordPlan;
			var score;

			if (!scaleChords[i] || additionalChordScoreService.sameChordFamily(scaleChords[i], options.measure)) {
				continue;
			}

			resolvedDegree = {
				chord: scaleChords[i],
				degree: scaleNotes[i] ? scaleNotes[i].grado : '',
				degreeIndex: i,
				source: 'diatonic'
			};
			chordPlan = options.buildChordPlan({
				index: 1,
				options: {
					includeTensions: true,
					initialMidiNote: initialMidiNote,
					rng: rng,
					scaleDefinition: report.scaleDefinition,
					scaleNotes: scaleNotes
				},
				previousPlan: previousPlan,
				progressionState: progressionState,
				resolvedDegree: resolvedDegree,
				resolvedDegrees: [
					measureContext.resolvedDegreeFromMeasure(options.measure, report) || resolvedDegree,
					resolvedDegree,
					measureContext.resolvedDegreeFromMeasure(options.nextMeasure, report) || resolvedDegree
				]
			});
			score = additionalChordScoreService.score({
				chordPlan: chordPlan,
				currentMeasure: options.measure,
				nextMeasure: options.nextMeasure,
				nextPlan: nextPlan,
				progressionState: progressionState,
				report: report,
				resolvedDegree: resolvedDegree,
				rng: rng
			});

			candidates.push({
				chordPlan: chordPlan,
				reportScaleDefinition: report.scaleDefinition,
				resolvedDegree: resolvedDegree,
				score: score
			});
		}

		candidates.sort(function (a, b) {
			return b.score - a.score;
		});

		return candidates.length ? candidates[0] : null;
	}

	global.CodaProgressionAdditionalChord = {
		choose: choose
	};
})(window);
