// Shared weight heuristics for harmonic patterns and phrase blocks.
(function (global) {
	'use strict';

	var cadencePlanner = global.CodaProgressionCadencePlanner;
	var styleService = global.CodaProgressionStyle;

	function adjustedPatternWeight(pattern, progressionState, mode) {
		var weight = pattern.weight || 1;

		if (!matchesStyle(pattern, progressionState)) {
			return 0;
		}

		if (styleService.avoidsStrongDominantResolution(progressionState) && cadencePlanner.isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		if (styleService.isClassic(progressionState) && !cadencePlanner.isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		if (styleService.usesFunctionalCadence(progressionState) && !cadencePlanner.isAuthenticCadence(pattern.cadence)) {
			weight *= 0.45;
		}

		weight *= styleService.patternAffinity(progressionState, pattern);
		weight += affinityScore(progressionState.counterpoint, pattern.counterpoint);
		weight += affinityScore(progressionState.modalInterchange, pattern.modalColor);
		weight += affinityScore(progressionState.tensions, pattern.tensionAffinity);
		weight += commonToneDegreeScore(pattern.degrees, progressionState);
		weight += stepwiseBassScore(pattern.degrees, progressionState);
		weight += sequentialBassScore(pattern.degrees, progressionState);
		weight *= sensitiveDegreeFactor(pattern.degrees, mode, progressionState);

		if (isArpeggioArticulation(progressionState.articulation) && pattern.form === 'circle-of-fifths') {
			weight += 8;
		}

		if (progressionState.articulation === 'staccato' && pattern.cadence === 'half') {
			weight += 5;
		}

		return Math.max(1, weight);
	}

	function affinityScore(value, target) {
		return Math.max(0, 18 - Math.abs((Number(value) || 0) - (Number(target) || 0)) / 4);
	}

	function sensitiveDegreeFactor(degrees, mode, progressionState) {
		var sensitiveDegree = mode === 'major' ? 6 : 1;
		var factor = 1;

		if (!styleService.minimizesDiminishedHarmony(progressionState) || !degrees) {
			return factor;
		}

		for (var i = 0; i < degrees.length; i++) {
			if (degreeIndex(degrees[i]) === sensitiveDegree) {
				factor *= 0.32;
			}
		}

		return factor;
	}

	function commonToneDegreeScore(degrees, progressionState) {
		var score = 0;
		var affinity = 0.4 + numberOrDefault(progressionState.counterpoint, 0) / 160;

		if (!degrees || degrees.length < 2) {
			return 0;
		}

		for (var i = 1; i < degrees.length; i++) {
			var distance = Math.abs((degreeIndex(degrees[i]) % 7) - (degreeIndex(degrees[i - 1]) % 7));
			var circularDistance = Math.min(distance, 7 - distance);

			if (circularDistance === 0) {
				score += 3.5;
			} else if (circularDistance === 2) {
				score += 3;
			} else if (circularDistance === 3) {
				score += 2;
			} else if (circularDistance === 4) {
				score += 1.5;
			}
		}

		return score * affinity;
	}

	function stepwiseBassScore(degrees, progressionState) {
		var score = 0;

		if (!styleService.prefersStepwiseBass(progressionState) || !degrees || degrees.length < 2) {
			return 0;
		}

		for (var i = 1; i < degrees.length; i++) {
			var distance = circularDegreeDistance(degreeIndex(degrees[i - 1]), degreeIndex(degrees[i]));

			if (distance === 1) {
				score += 2.4;
			} else if (distance === 2) {
				score += 1.1;
			}
		}

		return score;
	}

	function sequentialBassScore(degrees, progressionState) {
		var score = 0;

		if (!styleService.prefersSequentialPatterns(progressionState) || !degrees || degrees.length < 3) {
			return 0;
		}

		for (var i = 2; i < degrees.length; i++) {
			var first = circularDegreeDistance(degreeIndex(degrees[i - 2]), degreeIndex(degrees[i - 1]));
			var second = circularDegreeDistance(degreeIndex(degrees[i - 1]), degreeIndex(degrees[i]));

			if ((first === 3 && second === 1) || (first === 1 && second === 3) || (first === 4 && second === 3)) {
				score += 2.8;
			}
		}

		return score;
	}

	function circularDegreeDistance(first, second) {
		var distance = Math.abs((Number(first) || 0) % 7 - (Number(second) || 0) % 7);

		return Math.min(distance, 7 - distance);
	}

	function degreeIndex(degree) {
		if (degree && typeof degree === 'object') {
			return Number(degree.index) || 0;
		}

		return Number(degree) || 0;
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	function isArpeggioArticulation(articulation) {
		return String(articulation || '').indexOf('arpeggio') === 0;
	}

	function matchesStyle(pattern, progressionState) {
		return !pattern.styles || pattern.styles.indexOf(styleService.normalize(progressionState)) > -1;
	}

	global.CodaProgressionPatternWeight = {
		adjustedPatternWeight: adjustedPatternWeight,
		affinityScore: affinityScore,
		commonToneDegreeScore: commonToneDegreeScore,
		degreeIndex: degreeIndex,
		matchesStyle: matchesStyle,
		sensitiveDegreeFactor: sensitiveDegreeFactor
	};
})(window);
