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
		var profile = profileWithReport(profileForReport(options.report), options.report);
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
		var pattern = sanitizedPattern(choosePattern(profile, rng), profile);
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
		applyWeightedModalMiddle(indexes, profile, rng);
		applyFinalCadence(indexes, profile);

		return indexes;
	}

	function applyWeightedModalMiddle(indexes, profile, rng) {
		var cadenceLength = profile.finalCadence ? profile.finalCadence.length : 2;
		var cadenceStart = Math.max(0, indexes.length - cadenceLength);

		for (var i = 0; i < indexes.length; i++) {
			if (i === 0 || i >= cadenceStart) {
				continue;
			}

			if (i % 2 === 1) {
				indexes[i] = 0;
				continue;
			}

			indexes[i] = weightedModalDegree(profile, i, indexes.length, rng);
		}
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

	function sanitizedPattern(pattern, profile) {
		var result = [];
		var source = pattern && pattern.length ? pattern : [0];

		for (var i = 0; i < source.length; i++) {
			result.push(isAvoidDegree(profile, source[i]) ? weightedModalDegree(profile, i, source.length, fixedMiddleRng) : source[i]);
		}

		return result;
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

	function weightedModalDegree(profile, position, length, rng) {
		var candidates = [];
		var total = 0;
		var selected;

		for (var i = 0; i < 7; i++) {
			var weight = modalDegreeWeight(profile, i, position, length);

			if (weight <= 0) {
				continue;
			}

			candidates.push({
				index: i,
				weight: weight
			});
			total += weight;
		}

		if (!candidates.length) {
			return 0;
		}

		selected = rng() * total;
		for (var j = 0; j < candidates.length; j++) {
			selected -= candidates[j].weight;
			if (selected <= 0) {
				return candidates[j].index;
			}
		}

		return candidates[candidates.length - 1].index;
	}

	function modalDegreeWeight(profile, index, position, length) {
		if (isAvoidDegree(profile, index)) {
			return 0;
		}

		if (index === 0) {
			return position === 0 || position === length - 1 ? 140 : 120;
		}

		if ((profile.cadentialDegrees || []).indexOf(index) > -1) {
			return 20;
		}

		return 4;
	}

	function profileWithReport(profile, report) {
		var result = cloneObject(profile || {});
		var cadentialDegrees = [];
		var avoidDegrees = [];
		var chords = report && report.scaleChords ? report.scaleChords : [];

		for (var i = 0; i < chords.length; i++) {
			if (chords[i].tipo === 'cadencial') {
				cadentialDegrees.push(i);
			} else if (i !== 0 && chords[i].tipo === 'evitar') {
				avoidDegrees.push(i);
			}
		}

		if (cadentialDegrees.length) {
			result.cadentialDegrees = cadentialDegrees;
			result.finalCadence = modalFinalCadence(cadentialDegrees, avoidDegrees);
		}
		result.avoidDegrees = avoidDegrees;
		result.patterns = sanitizedPatterns(result.patterns, result);

		return result;
	}

	function modalFinalCadence(cadentialDegrees, avoidDegrees) {
		for (var i = 0; i < cadentialDegrees.length; i++) {
			if (avoidDegrees.indexOf(cadentialDegrees[i]) === -1) {
				return [cadentialDegrees[i], 0];
			}
		}

		return [0];
	}

	function sanitizedPatterns(patterns, profile) {
		var result = [];

		for (var i = 0; i < (patterns || []).length; i++) {
			result.push(sanitizedPattern(patterns[i], profile));
		}

		return result.length ? result : [[0]];
	}

	function isAvoidDegree(profile, index) {
		return (profile.avoidDegrees || []).indexOf(index) > -1;
	}

	function fixedMiddleRng() {
		return 0.5;
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

	function cloneObject(value) {
		var result = {};

		for (var key in value || {}) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				result[key] = value[key];
			}
		}

		return result;
	}

	global.CodaProgressionModalPlanner = {
		applyFinalCadence: applyFinalCadence,
		createPlan: createPlan,
		isGreekMode: isGreekMode,
		modalDegree: modalDegree,
		modalDegreeIndexes: modalDegreeIndexes,
		modalDegreeWeight: modalDegreeWeight,
		modalRole: modalRole,
		profileForReport: profileForReport
	};
})(window);
