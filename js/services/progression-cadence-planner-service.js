// Cadence decisions and cadential endings for generated progressions.
(function (global) {
	'use strict';

	function finalCadenceForPattern(pattern, progressionState, rng) {
		if (isModernStyle(progressionState)) {
			return modernFinalCadence(pattern, rng);
		}

		if (pattern && (pattern.cadence === 'plagal' || pattern.cadence === 'mixed-plagal' || pattern.cadence === 'deceptive')) {
			return pattern.cadence;
		}

		return 'authentic';
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

	function forceCadentialEnding(degrees, pattern) {
		if (degrees.length < 2) {
			return;
		}

		if (pattern.cadence === 'authentic') {
			degrees[degrees.length - 2] = { index: 4, source: 'diatonic' };
			degrees[degrees.length - 1] = { index: 0, source: 'diatonic' };
		} else if (pattern.cadence === 'plagal' || pattern.cadence === 'mixed-plagal') {
			degrees[degrees.length - 2] = { index: 3, source: pattern.cadence === 'mixed-plagal' ? 'parallel' : 'diatonic' };
			degrees[degrees.length - 1] = { index: 0, source: 'diatonic' };
		} else if (pattern.cadence === 'deceptive') {
			degrees[degrees.length - 2] = { index: 4, source: 'diatonic' };
			degrees[degrees.length - 1] = { index: 5, source: 'diatonic' };
		} else if (pattern.cadence === 'half') {
			degrees[degrees.length - 1] = { index: 4, source: 'diatonic' };
		}
	}

	function matchesCadence(block, cadence) {
		return block.cadence === cadence || (cadence === 'mixed-plagal' && block.cadence === 'plagal');
	}

	function isAuthenticCadence(cadence) {
		return cadence === 'authentic';
	}

	function isModernStyle(progressionState) {
		return progressionState && progressionState.style === 'modern';
	}

	global.CodaProgressionCadencePlanner = {
		chooseIntermediateCadence: chooseIntermediateCadence,
		finalCadenceForPattern: finalCadenceForPattern,
		forceCadentialEnding: forceCadentialEnding,
		isAuthenticCadence: isAuthenticCadence,
		matchesCadence: matchesCadence
	};
})(window);
