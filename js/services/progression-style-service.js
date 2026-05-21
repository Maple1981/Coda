// Historical style profiles and normalized rule checks for progression generation.
(function (global) {
	'use strict';

	var styles = ['renaissance', 'baroque', 'classic', 'romantic', 'impressionist', 'contemporary'];
	var aliases = {
		classical: 'classic',
		modern: 'contemporary'
	};
	var profiles = {
		renaissance: {
			avoidsStrongDominantResolution: true,
			harmonicDensityBias: -0.04,
			minimizesDiminishedHarmony: true,
			patternAffinities: {
				'borrowed-plagal': 1.2,
				'plagal-return': 1.3,
				'tonic-substitution': 1.15
			},
			prefersStepwiseBass: true,
			seventhProbabilityScale: 0.48,
			requiresPreparedDissonance: true,
			usesCadentialSixFour: false,
			usesFunctionalCadence: false,
			usesFunctionalMinorDominant: false
		},
		baroque: {
			avoidsStrongDominantResolution: false,
			harmonicDensityBias: 0.08,
			minimizesDiminishedHarmony: false,
			patternAffinities: {
				'circle-fragment': 1.3,
				'circle-of-fifths': 1.55,
				'partimento-36': 1.45,
				'partimento-suspension': 1.4,
				'partimento-rule-octave': 1.5,
				'romanesca': 1.35,
				'subdominant-dominant': 1.18
			},
			prefersPartimentoBass: true,
			prefersSequentialPatterns: true,
			prefersStepwiseBass: true,
			seventhProbabilityScale: 1.16,
			requiresPreparedDissonance: true,
			usesCadentialSixFour: true,
			usesFunctionalCadence: true,
			usesFunctionalMinorDominant: true
		},
		classic: {
			avoidsStrongDominantResolution: false,
			harmonicDensityBias: 0.02,
			minimizesDiminishedHarmony: false,
			patternAffinities: {
				'period': 1.28,
				'sentence': 1.18,
				'subdominant-dominant': 1.15
			},
			prefersPartimentoBass: false,
			prefersSequentialPatterns: false,
			prefersStepwiseBass: false,
			seventhProbabilityScale: 0.92,
			requiresPreparedDissonance: true,
			usesCadentialSixFour: true,
			usesFunctionalCadence: true,
			usesFunctionalMinorDominant: true
		},
		romantic: {
			avoidsStrongDominantResolution: false,
			harmonicDensityBias: 0.08,
			minimizesDiminishedHarmony: false,
			patternAffinities: {
				'circle-of-fifths': 1.18,
				'deceptive-cadence': 1.2,
				'minor-cadential': 1.22,
				'sentence': 1.16
			},
			prefersPartimentoBass: false,
			prefersSequentialPatterns: true,
			prefersStepwiseBass: false,
			seventhProbabilityScale: 1.22,
			requiresPreparedDissonance: true,
			usesCadentialSixFour: true,
			usesFunctionalCadence: true,
			usesFunctionalMinorDominant: true
		},
		impressionist: {
			avoidsStrongDominantResolution: true,
			harmonicDensityBias: 0.03,
			minimizesDiminishedHarmony: true,
			patternAffinities: {
				'borrowed-plagal': 1.28,
				'plagal-return': 1.16,
				'tonic-substitution': 1.18
			},
			prefersPartimentoBass: false,
			prefersSequentialPatterns: false,
			prefersStepwiseBass: false,
			seventhProbabilityScale: 0.82,
			requiresPreparedDissonance: false,
			usesCadentialSixFour: false,
			usesFunctionalCadence: false,
			usesFunctionalMinorDominant: false
		},
		contemporary: {
			avoidsStrongDominantResolution: true,
			harmonicDensityBias: 0,
			minimizesDiminishedHarmony: true,
			patternAffinities: {
				'borrowed-plagal': 1.18,
				'deceptive-cadence': 1.16,
				'plagal-return': 1.14,
				'tonic-substitution': 1.2
			},
			prefersPartimentoBass: false,
			prefersSequentialPatterns: false,
			prefersStepwiseBass: false,
			seventhProbabilityScale: 0.78,
			requiresPreparedDissonance: false,
			usesCadentialSixFour: false,
			usesFunctionalCadence: false,
			usesFunctionalMinorDominant: false
		}
	};

	function normalize(progressionState) {
		var value = typeof progressionState === 'string' ? progressionState : progressionState && progressionState.style;
		var normalized = aliases[value] || value;

		return styles.indexOf(normalized) > -1 ? normalized : 'contemporary';
	}

	function isModern(progressionState) {
		return avoidsStrongDominantResolution(progressionState);
	}

	function isClassic(progressionState) {
		return normalize(progressionState) === 'classic';
	}

	function isAtLeast(progressionState, style) {
		return styles.indexOf(normalize(progressionState)) >= styles.indexOf(normalize(style));
	}

	function profile(progressionState) {
		return profiles[normalize(progressionState)] || profiles.contemporary;
	}

	function avoidsStrongDominantResolution(progressionState) {
		return profile(progressionState).avoidsStrongDominantResolution === true;
	}

	function requiresPreparedDissonance(progressionState) {
		return profile(progressionState).requiresPreparedDissonance === true;
	}

	function usesCadentialSixFour(progressionState) {
		return profile(progressionState).usesCadentialSixFour === true;
	}

	function usesFunctionalCadence(progressionState) {
		return profile(progressionState).usesFunctionalCadence === true;
	}

	function usesFunctionalMinorDominant(progressionState) {
		return profile(progressionState).usesFunctionalMinorDominant === true;
	}

	function harmonicDensityBias(progressionState) {
		return Number(profile(progressionState).harmonicDensityBias) || 0;
	}

	function minimizesDiminishedHarmony(progressionState) {
		return profile(progressionState).minimizesDiminishedHarmony === true;
	}

	function patternAffinity(progressionState, pattern) {
		var affinities = profile(progressionState).patternAffinities || {};
		var form = pattern && pattern.form;

		return form && affinities[form] ? Number(affinities[form]) || 1 : 1;
	}

	function prefersPartimentoBass(progressionState) {
		return profile(progressionState).prefersPartimentoBass === true;
	}

	function prefersSequentialPatterns(progressionState) {
		return profile(progressionState).prefersSequentialPatterns === true;
	}

	function prefersStepwiseBass(progressionState) {
		return profile(progressionState).prefersStepwiseBass === true;
	}

	function seventhProbabilityScale(progressionState) {
		var scale = Number(profile(progressionState).seventhProbabilityScale);

		return isFinite(scale) && scale > 0 ? scale : 1;
	}

	global.CodaProgressionStyle = {
		avoidsStrongDominantResolution: avoidsStrongDominantResolution,
		harmonicDensityBias: harmonicDensityBias,
		isClassic: isClassic,
		isAtLeast: isAtLeast,
		isModern: isModern,
		minimizesDiminishedHarmony: minimizesDiminishedHarmony,
		normalize: normalize,
		patternAffinity: patternAffinity,
		prefersPartimentoBass: prefersPartimentoBass,
		prefersSequentialPatterns: prefersSequentialPatterns,
		prefersStepwiseBass: prefersStepwiseBass,
		profile: profile,
		requiresPreparedDissonance: requiresPreparedDissonance,
		seventhProbabilityScale: seventhProbabilityScale,
		styles: styles.slice(),
		usesCadentialSixFour: usesCadentialSixFour,
		usesFunctionalCadence: usesFunctionalCadence,
		usesFunctionalMinorDominant: usesFunctionalMinorDominant
	};
})(window);
