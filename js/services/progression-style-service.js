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
				'partimento-fauxbourdon': 1.24,
				'partimento-suspension': 1.16,
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
				'circle-fifths-family': 1.5,
				'circle-of-fifths': 1.55,
				'common-tone-diminished': 1.16,
				'descending-thirds': 1.34,
				'diminished-seventh-family': 1.36,
				'fenaroli': 1.32,
				'folia': 1.34,
				'galant-cadence': 1.3,
				'galant-four-part-cadence': 1.34,
				'galant-marpurg-cadence': 1.24,
				'indugio': 1.26,
				'leaping-romanesca': 1.42,
				'minor-neapolitan-continuation': 1.18,
				'monte-romanesca': 1.34,
				'molldur-deceptive': 1.12,
				'modulating-folia': 1.24,
				'partimento-alto-cadence': 1.28,
				'partimento-compound-cadence': 1.52,
				'partimento-deceptive-cadence': 1.28,
				'partimento-discant-cadence': 1.3,
				'partimento-dominant-seventh-family': 1.42,
				'partimento-double-cadence': 1.44,
				'partimento-fauxbourdon': 1.35,
				'partimento-four-part-rule-octave': 1.56,
				'partimento-monte': 1.38,
				'partimento-phrygian-half': 1.34,
				'partimento-36': 1.45,
				'partimento-suspension': 1.4,
				'partimento-tenor-cadence': 1.24,
				'partimento-rule-octave': 1.5,
				'prinner': 1.24,
				'quiescenza': 1.22,
				'romanesca': 1.35,
				'subdominant-dominant': 1.18,
				'third-down-second-up': 1.34,
				'tied-bass-four-part': 1.36
			},
			prefersPartimentoBass: true,
			prefersFourPartHarmony: true,
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
				'fenaroli': 1.12,
				'common-tone-diminished': 1.08,
				'descending-thirds': 1.12,
				'diminished-seventh-family': 1.12,
				'galant-cadence': 1.38,
				'galant-four-part-cadence': 1.34,
				'galant-marpurg-cadence': 1.26,
				'indugio': 1.08,
				'minor-neapolitan-continuation': 1.08,
				'monte-romanesca': 1.16,
				'molldur-deceptive': 1.12,
				'modulating-folia': 1.08,
				'partimento-dominant-seventh-family': 1.18,
				'period': 1.28,
				'prinner': 1.32,
				'quiescenza': 1.2,
				'sentence': 1.18,
				'subdominant-dominant': 1.15
			},
			prefersPartimentoBass: false,
			prefersFourPartHarmony: true,
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
				'common-tone-diminished': 1.2,
				'deceptive-cadence': 1.2,
				'descending-thirds': 1.18,
				'diminished-seventh-family': 1.26,
				'minor-neapolitan-continuation': 1.12,
				'molldur-deceptive': 1.24,
				'modulating-folia': 1.16,
				'partimento-dominant-seventh-family': 1.12,
				'minor-cadential': 1.22,
				'sentence': 1.16
			},
			prefersPartimentoBass: false,
			prefersFourPartHarmony: true,
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

	function prefersFourPartHarmony(progressionState) {
		return profile(progressionState).prefersFourPartHarmony === true;
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
		prefersFourPartHarmony: prefersFourPartHarmony,
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
