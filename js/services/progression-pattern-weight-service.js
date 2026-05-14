// Shared weight heuristics for harmonic patterns and phrase blocks.
(function (global) {
	'use strict';

	var cadencePlanner = global.CodaProgressionCadencePlanner;
	var styleService = global.CodaProgressionStyle;

	function adjustedPatternWeight(pattern, progressionState, mode) {
		var weight = pattern.weight || 1;

		if (styleService.isModern(progressionState) && cadencePlanner.isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		if (styleService.isClassic(progressionState) && !cadencePlanner.isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		weight += affinityScore(progressionState.counterpoint, pattern.counterpoint);
		weight += affinityScore(progressionState.modalInterchange, pattern.modalColor);
		weight += affinityScore(progressionState.tensions, pattern.tensionAffinity);
		weight += commonToneDegreeScore(pattern.degrees, progressionState);
		weight *= sensitiveDegreeFactor(pattern.degrees, mode, progressionState);

		if (progressionState.articulation === 'arpeggio' && pattern.form === 'circle-of-fifths') {
			weight += 8;
		}

		if (progressionState.articulation === 'legato' && pattern.cadence === 'authentic') {
			weight += 5;
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

		if (!styleService.isModern(progressionState) || !degrees) {
			return factor;
		}

		for (var i = 0; i < degrees.length; i++) {
			if (degrees[i] === sensitiveDegree) {
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
			var distance = Math.abs((degrees[i] % 7) - (degrees[i - 1] % 7));
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

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionPatternWeight = {
		adjustedPatternWeight: adjustedPatternWeight,
		affinityScore: affinityScore,
		commonToneDegreeScore: commonToneDegreeScore,
		sensitiveDegreeFactor: sensitiveDegreeFactor
	};
})(window);
