// Modal progression planning for Greek modes.
(function (global) {
	'use strict';

	var profiles = {
		13: {
			cadentialDegrees: [4],
			finalCadence: [4, 0],
			id: 'ionian',
			patterns: [[0, 3, 0, 4], [0, 4, 3, 0]],
			tonicQuality: 'major'
		},
		14: {
			cadentialDegrees: [3],
			finalCadence: [3, 0],
			id: 'dorian',
			patterns: [[0, 3, 0, 1], [0, 1, 3, 0], [0, 3, 0, 3]],
			tonicQuality: 'minor'
		},
		15: {
			cadentialDegrees: [1],
			finalCadence: [1, 0],
			id: 'phrygian',
			patterns: [[0, 1, 0, 6], [0, 3, 1, 0], [0, 1, 0, 1]],
			tonicQuality: 'minor'
		},
		16: {
			cadentialDegrees: [1],
			finalCadence: [1, 0],
			id: 'lydian',
			patterns: [[0, 1, 0, 6], [0, 1, 3, 0], [0, 6, 1, 0]],
			tonicQuality: 'major'
		},
		17: {
			cadentialDegrees: [6, 3],
			finalCadence: [6, 3, 0],
			id: 'mixolydian',
			patterns: [[0, 6, 3, 0], [0, 6, 0, 4], [0, 4, 6, 0]],
			tonicQuality: 'major'
		},
		18: {
			cadentialDegrees: [4, 5, 6],
			finalCadence: [5, 6, 0],
			id: 'aeolian',
			patterns: [[0, 6, 5, 6], [0, 6, 5, 4], [5, 6, 0, 0]],
			tonicQuality: 'minor'
		},
		19: {
			cadentialDegrees: [1],
			finalCadence: [1, 0],
			id: 'locrian',
			patterns: [[0, 1, 0, 5], [0, 3, 1, 0], [1, 0, 5, 0]],
			tonicQuality: 'diminished'
		}
	};

	function isGreekMode(report) {
		return !!profileForReport(report);
	}

	function createPlan(options) {
		var progressionState = options.progressionState || {};
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var profile = profileForReport(options.report);
		var bars = Math.max(1, numberOrDefault(progressionState.bars, 8));
		var indexes = modalDegreeIndexes(profile, bars, rng);
		var degrees = [];

		for (var i = 0; i < indexes.length; i++) {
			degrees.push(modalDegree(profile, indexes[i], i, indexes.length));
		}

		return {
			degrees: degrees,
			finalCadence: 'modal',
			pattern: {
				cadence: 'modal',
				form: 'modal-vamp',
				id: profile.id + '-modal-vamp'
			},
			voiceLeading: modalVoiceLeadingProfile(progressionState)
		};
	}

	function modalDegreeIndexes(profile, bars, rng) {
		var pattern = choosePattern(profile, rng);
		var indexes = [];

		if (bars === 1) {
			return [0];
		}

		if (bars === 2) {
			return [profile.finalCadence[0], 0];
		}

		while (indexes.length < bars) {
			indexes = indexes.concat(pattern);
		}

		indexes = indexes.slice(0, bars);
		applyFinalCadence(indexes, profile);

		return indexes;
	}

	function choosePattern(profile, rng) {
		var patterns = profile.patterns || [[0, 3, 4, 0]];

		return patterns[Math.floor(rng() * patterns.length) % patterns.length];
	}

	function applyFinalCadence(indexes, profile) {
		var finalCadence = profile.finalCadence || [profile.cadentialDegrees[0], 0];
		var start = Math.max(0, indexes.length - finalCadence.length);

		for (var i = 0; i < finalCadence.length && start + i < indexes.length; i++) {
			indexes[start + i] = finalCadence[i];
		}
	}

	function modalDegree(profile, index, position, length) {
		var role = modalRole(profile, index, position, length);
		var degree = {
			forceInversionIndex: 0,
			index: index,
			modalRole: role,
			source: 'diatonic'
		};

		if (role === 'tonic' || role === 'modal-cadential') {
			degree.preventTensions = true;
		}

		if (role === 'modal-cadential' || role === 'avoid') {
			degree.forceKind = 'triad';
			degree.preventSuspension = true;
		}

		return degree;
	}

	function modalRole(profile, index, position, length) {
		if (index === 0) {
			return 'tonic';
		}

		if (position === length - 1) {
			return 'tonic';
		}

		if ((profile.cadentialDegrees || []).indexOf(index) > -1) {
			return 'modal-cadential';
		}

		return 'modal-color';
	}

	function profileForReport(report) {
		var index = report ? Number(report.scaleIndex) : NaN;

		return profiles[index] || null;
	}

	function modalVoiceLeadingProfile(progressionState) {
		if (numberOrDefault(progressionState.counterpoint, 0) >= 70) {
			return 'modal-pedal-stepwise';
		}

		return 'modal-pedal';
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionModalPlanner = {
		applyFinalCadence: applyFinalCadence,
		createPlan: createPlan,
		isGreekMode: isGreekMode,
		modalDegree: modalDegree,
		modalDegreeIndexes: modalDegreeIndexes,
		modalRole: modalRole,
		profileForReport: profileForReport
	};
})(window);
