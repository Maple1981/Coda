// Cadence decisions and cadential endings for generated progressions.
(function (global) {
	'use strict';

	var chromaticCadenceService = global.CodaProgressionChromaticCadence;
	var styleService = global.CodaProgressionStyle;

	function finalCadenceForPattern(pattern, progressionState, rng) {
		if (chromaticCadenceService && chromaticCadenceService.shouldUseChromaticCadence(pattern, progressionState, rng)) {
			return chromaticCadenceService.chooseChromaticCadenceType(progressionState, rng);
		}

		if (shouldUseCadentialSixFour(pattern, progressionState, rng)) {
			return 'cadential64';
		}

		if (styleService.isModern(progressionState)) {
			return modernFinalCadence(pattern, rng);
		}

		if (pattern && (pattern.cadence === 'plagal' || pattern.cadence === 'mixed-plagal' || pattern.cadence === 'deceptive')) {
			return pattern.cadence;
		}

		return 'authentic';
	}

	function shouldUseCadentialSixFour(pattern, progressionState, rng) {
		var probability = cadentialSixFourProbability(pattern, progressionState);
		var value;

		if (probability <= 0) {
			return false;
		}

		value = typeof rng === 'function' ? rng() : Math.random();

		return value < probability;
	}

	function cadentialSixFourProbability(pattern, progressionState) {
		var counterpoint = numberOrDefault(progressionState && progressionState.counterpoint, 0);
		var probability = styleService.isClassic(progressionState) ? 0.12 : 0.025;

		if (pattern && pattern.cadence && !isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		probability += counterpoint / (styleService.isClassic(progressionState) ? 260 : 780);

		if (pattern && isAuthenticCadence(pattern.cadence)) {
			probability += styleService.isClassic(progressionState) ? 0.1 : 0.025;
		}

		return Math.min(styleService.isClassic(progressionState) ? 0.58 : 0.18, probability);
	}

	function modernFinalCadence(pattern, rng) {
		var value;

		if (pattern && !isAuthenticCadence(pattern.cadence)) {
			return pattern.cadence === 'mixed-plagal' ? 'plagal' : pattern.cadence;
		}

		value = typeof rng === 'function' ? rng() : Math.random();

		if (value < 0.34) {
			return 'half';
		}

		if (value < 0.68) {
			return 'plagal';
		}

		return 'deceptive';
	}

	function chooseIntermediateCadence(rng) {
		var value = typeof rng === 'function' ? rng() : Math.random();

		if (value < 0.42) {
			return 'half';
		}

		if (value < 0.72) {
			return 'plagal';
		}

		return 'deceptive';
	}

	function forceCadentialEnding(degrees, pattern, options) {
		var cadence;

		options = options || {};
		cadence = options.cadence || (pattern ? pattern.cadence : '');

		if (degrees.length < 2) {
			return;
		}

		if (cadence === 'cadential64') {
			forceCadentialSixFourEnding(degrees, options);
		} else if (cadence === 'neapolitan' || cadence === 'augmented6' || cadence === 'subFive') {
			options.pattern = pattern;
			options.patternCadence = pattern ? pattern.cadence : '';
			chromaticCadenceService.forceChromaticEnding(degrees, options);
		} else if (cadence === 'authentic') {
			degrees[degrees.length - 2] = { index: 4, source: 'diatonic' };
			degrees[degrees.length - 1] = { index: 0, source: 'diatonic' };
		} else if (cadence === 'plagal' || cadence === 'mixed-plagal') {
			degrees[degrees.length - 2] = { index: 3, source: cadence === 'mixed-plagal' ? 'parallel' : 'diatonic' };
			degrees[degrees.length - 1] = { index: 0, source: 'diatonic' };
		} else if (cadence === 'deceptive') {
			degrees[degrees.length - 2] = { index: 4, source: 'diatonic' };
			degrees[degrees.length - 1] = { index: 5, source: 'diatonic' };
		} else if (cadence === 'half') {
			degrees[degrees.length - 1] = { index: 4, source: 'diatonic' };
		}
	}

	function forceCadentialSixFourEnding(degrees, options) {
		var start = Math.max(0, degrees.length - 4);
		var dominantKind = cadentialDominantKind(options.progressionState, options.rng);
		var variant = cadentialSixFourVariant(options.mode, options.rng);
		var openingDegree = cadentialSixFourOpeningDegree(variant, options.mode, options.rng);

		if (degrees.length < 4) {
			forceCadentialEnding(degrees, { cadence: 'authentic' });
			return;
		}

		degrees[start] = {
			cadentialRole: variant === 'predominant-before' ? 'cadential-predominant' : 'cadential-tonic',
			forceInversionIndex: 0,
			forceKind: 'triad',
			index: openingDegree,
			preventSuspension: true,
			preventTensions: true,
			source: 'diatonic'
		};
		degrees[start + 1] = {
			cadentialRole: 'cadential64',
			forceInversionIndex: 2,
			forceKind: 'triad',
			index: 0,
			preventSuspension: true,
			preventTensions: true,
			source: 'diatonic',
			tonalFunctionOverride: 'D'
		};
		degrees[start + 2] = {
			cadentialRole: 'cadential-dominant',
			forceInversionIndex: 0,
			forceKind: dominantKind,
			index: 4,
			preventSuspension: true,
			preventTensions: true,
			source: 'diatonic',
			tonalFunctionOverride: 'D'
		};
		degrees[start + 3] = {
			cadentialRole: 'cadential-resolution',
			forceInversionIndex: 0,
			forceKind: 'triad',
			index: 0,
			preventSuspension: true,
			preventTensions: true,
			source: 'diatonic'
		};
	}

	function cadentialSixFourVariant(mode, rng) {
		var value = typeof rng === 'function' ? rng() : Math.random();

		if (value < 0.62) {
			return 'tonic-before';
		}

		return 'predominant-before';
	}

	function cadentialSixFourOpeningDegree(variant, mode, rng) {
		var candidates;

		if (variant !== 'predominant-before') {
			return 0;
		}

		candidates = mode === 'minor' ? [3, 1, 5] : [3, 1];

		return candidates[Math.floor((typeof rng === 'function' ? rng() : Math.random()) * candidates.length) % candidates.length];
	}

	function cadentialDominantKind(progressionState, rng) {
		var counterpoint = numberOrDefault(progressionState && progressionState.counterpoint, 0);
		var voices = numberOrDefault(progressionState && progressionState.voices, 4);
		var probability = voices >= 4 ? 0.55 : 0.28;
		var value;

		probability += counterpoint / 420;
		value = typeof rng === 'function' ? rng() : Math.random();

		return value < Math.min(0.82, probability) ? 'seventh' : 'triad';
	}

	function matchesCadence(block, cadence) {
		if (cadence === 'cadential64') {
			return block.cadence === 'authentic';
		}

		if (cadence === 'subFive') {
			return block.cadence === 'authentic' || block.cadence === 'half';
		}

		return block.cadence === cadence || (cadence === 'mixed-plagal' && block.cadence === 'plagal');
	}

	function isAuthenticCadence(cadence) {
		return cadence === 'authentic' || cadence === 'cadential64';
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionCadencePlanner = {
		cadentialDominantKind: cadentialDominantKind,
		cadentialSixFourOpeningDegree: cadentialSixFourOpeningDegree,
		cadentialSixFourProbability: cadentialSixFourProbability,
		cadentialSixFourVariant: cadentialSixFourVariant,
		chooseIntermediateCadence: chooseIntermediateCadence,
		finalCadenceForPattern: finalCadenceForPattern,
		forceCadentialEnding: forceCadentialEnding,
		forceCadentialSixFourEnding: forceCadentialSixFourEnding,
		isAuthenticCadence: isAuthenticCadence,
		matchesCadence: matchesCadence,
		shouldUseCadentialSixFour: shouldUseCadentialSixFour
	};
})(window);
