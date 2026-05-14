// Harmonic phrase and cadence planner for generated progressions.
(function (global) {
	'use strict';

	var cadencePlanner = global.CodaProgressionCadencePlanner;
	var patternSelector = global.CodaProgressionPatternSelector;
	var phraseBlockSelector = global.CodaProgressionPhraseBlockSelector;

	function createPlan(options) {
		var progressionState = options.progressionState;
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var mode = progressionMode(options.report);
		var pattern = patternSelector.choose({
			mode: mode,
			progressionState: progressionState,
			rng: rng,
			rules: options.rules
		});
		var degrees = progressionState.bars >= 8 ?
			composePhraseBlocks({
				mode: mode,
				pattern: pattern,
				progressionState: progressionState,
				rng: rng,
				rules: options.rules
			}) :
			fitDegreesToBars(pattern, progressionState.bars);

		return {
			degrees: degrees,
			pattern: pattern,
			voiceLeading: voiceLeadingProfile(progressionState)
		};
	}

	function progressionMode(report) {
		return report && report.mode === 'M' ? 'major' : 'minor';
	}

	function fitDegreesToBars(pattern, bars) {
		var fitted = [];
		var sourceDegrees = pattern.degrees || [0, 3, 4, 0];
		var normalizedBars = numberOrDefault(bars, sourceDegrees.length);
		var borrowedIndexes = pattern.borrowed || [];

		for (var i = 0; i < normalizedBars; i++) {
			fitted.push({
				index: sourceDegrees[i % sourceDegrees.length],
				source: borrowedIndexes.indexOf(i % sourceDegrees.length) > -1 ? 'parallel' : 'diatonic'
			});
		}

		cadencePlanner.forceCadentialEnding(fitted, pattern);

		return fitted;
	}

	function composePhraseBlocks(options) {
		var bars = numberOrDefault(options.progressionState.bars, 8);
		var blockCount = Math.ceil(bars / 4);
		var degrees = [];
		var previousBlockId = '';

		for (var blockIndex = 0; blockIndex < blockCount; blockIndex++) {
			var remainingBars = bars - degrees.length;
			var blockLength = Math.min(4, remainingBars);
			var isFinalBlock = blockIndex === blockCount - 1;
			var cadence = isFinalBlock ? cadencePlanner.finalCadenceForPattern(options.pattern, options.progressionState, options.rng) : cadencePlanner.chooseIntermediateCadence(options.rng);
			var block = phraseBlockSelector.choose({
				cadence: cadence,
				mode: options.mode,
				previousBlockId: previousBlockId,
				progressionState: options.progressionState,
				rng: options.rng,
				rules: options.rules
			});

			previousBlockId = block.id;
			degrees = degrees.concat(phraseBlockSelector.fitBlockToBars(block, blockLength));
		}

		return degrees.slice(0, bars);
	}

	function voiceLeadingProfile(progressionState) {
		if (progressionState.counterpoint >= 70) {
			return 'contrary-stepwise';
		}

		if (progressionState.counterpoint >= 35) {
			return 'balanced';
		}

		return 'homophonic';
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionPlanner = {
		createPlan: createPlan,
		fitDegreesToBars: fitDegreesToBars,
		voiceLeadingProfile: voiceLeadingProfile
	};
})(window);
