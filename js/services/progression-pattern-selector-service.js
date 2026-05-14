// Weighted selection of base harmonic progression patterns.
(function (global) {
	'use strict';

	var patternWeight = global.CodaProgressionPatternWeight;
	var styleService = global.CodaProgressionStyle;

	function choose(options) {
		var patterns = options.rules && options.rules.patterns ? options.rules.patterns : [];
		var candidates = [];
		var totalWeight = 0;
		var selectedValue;

		for (var i = 0; i < patterns.length; i++) {
			var weight;

			if (!matchesMode(patterns[i], options.mode)) {
				continue;
			}

			weight = patternWeight.adjustedPatternWeight(patterns[i], options.progressionState, options.mode);
			if (weight <= 0) {
				continue;
			}

			candidates.push({
				pattern: patterns[i],
				weight: weight
			});
			totalWeight += candidates[candidates.length - 1].weight;
		}

		if (!candidates.length) {
			return fallbackPatternForStyle(options.progressionState);
		}

		selectedValue = options.rng() * totalWeight;

		for (var j = 0; j < candidates.length; j++) {
			selectedValue -= candidates[j].weight;
			if (selectedValue <= 0) {
				return candidates[j].pattern;
			}
		}

		return candidates[candidates.length - 1].pattern;
	}

	function fallbackPatternForStyle(progressionState) {
		if (styleService.isModern(progressionState)) {
			return {
				cadence: 'half',
				counterpoint: 70,
				degrees: [0, 3, 1, 4],
				form: 'fallback-modern',
				id: 'fallback-modern-half',
				weight: 1
			};
		}

		return {
			cadence: 'authentic',
			counterpoint: 70,
			degrees: [0, 3, 4, 0],
			form: 'fallback-classic',
			id: 'fallback-classic-authentic',
			weight: 1
		};
	}

	function matchesMode(pattern, mode) {
		return !pattern.modes || pattern.modes.indexOf(mode) > -1;
	}

	function sensitiveDegreeFactor(degrees, mode, progressionState) {
		return patternWeight.sensitiveDegreeFactor(degrees, mode, progressionState);
	}

	function commonToneDegreeScore(degrees, progressionState) {
		return patternWeight.commonToneDegreeScore(degrees, progressionState);
	}

	global.CodaProgressionPatternSelector = {
		affinityScore: patternWeight.affinityScore,
		choose: choose,
		commonToneDegreeScore: commonToneDegreeScore,
		matchesMode: matchesMode,
		sensitiveDegreeFactor: sensitiveDegreeFactor
	};
})(window);
