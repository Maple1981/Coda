// High-level progression builders used by the application facade.
(function (global) {
	'use strict';

	var degreeResolver = global.CodaProgressionDegreeResolver;
	var measureBuilderService = global.CodaProgressionMeasureBuilder;
	var plannerService = global.CodaProgressionPlanner;
	var resultService = global.CodaProgressionResult;
	var stateNormalizer = global.CodaProgressionStateNormalizer;

	function fromDegrees(options) {
		return degreeResolver.fromDegreeNames(options);
	}

	function fromState(options) {
		var progressionState = stateNormalizer.normalize(options.progressionState);
		var degrees = options.domain.createDiatonicDegreePlan({
			bars: progressionState.bars,
			scaleNotes: options.report.scaleNotes
		});
		var resolvedDegrees = fromDegrees({
			degrees: degrees,
			domain: options.domain,
			report: options.report
		});
		var secondsPerBeat = 60 / progressionState.bpm;

		return resultService.build({
			measures: measureBuilderService.build(resolvedDegrees, progressionState, secondsPerBeat, {
				initialMidiNote: options.data && options.data.midi ? options.data.midi.initialMidiNote : 60,
				interchangeSources: options.report.modalInterchangeSources || [],
				scaleDefinition: options.report.scaleDefinition,
				scaleNotes: options.report.scaleNotes
			}),
			progressionState: progressionState,
			secondsPerBeat: secondsPerBeat
		});
	}

	function generate(options) {
		var progressionState = stateNormalizer.normalize(options.progressionState);
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var generationPlan = plannerService.createPlan({
			openingFunction: options.openingFunction,
			progressionState: progressionState,
			report: options.report,
			rng: rng,
			rules: options.rules || (options.data ? options.data.progressionRules : null)
		});
		var resolvedDegrees = degreeResolver.fromGeneratedPlan({
			degrees: generationPlan.degrees,
			report: options.report
		});
		var secondsPerBeat = 60 / progressionState.bpm;

		return resultService.build({
			generationPlan: generationPlan,
			measures: measureBuilderService.build(resolvedDegrees, progressionState, secondsPerBeat, {
				includeTensions: true,
				initialMidiNote: options.data && options.data.midi ? options.data.midi.initialMidiNote : 60,
				interchangeSources: options.report.modalInterchangeSources || [],
				avoidDominantSeventh: isModalReport(options.report),
				rng: rng,
				scaleDefinition: options.report.scaleDefinition,
				scaleNotes: options.report.scaleNotes
			}),
			progressionState: progressionState,
			secondsPerBeat: secondsPerBeat
		});
	}

	global.CodaProgressionBuilder = {
		fromDegrees: fromDegrees,
		fromState: fromState,
		generate: generate
	};

	function isModalReport(report) {
		return !!(report && report.scaleDefinition && report.scaleDefinition.modal === 'true');
	}
})(window);
