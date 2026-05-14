// Normalized style checks for progression generation rules.
(function (global) {
	'use strict';

	function normalize(progressionState) {
		return progressionState && progressionState.style === 'classic' ? 'classic' : 'modern';
	}

	function isModern(progressionState) {
		return normalize(progressionState) === 'modern';
	}

	function isClassic(progressionState) {
		return normalize(progressionState) === 'classic';
	}

	global.CodaProgressionStyle = {
		isClassic: isClassic,
		isModern: isModern,
		normalize: normalize
	};
})(window);
