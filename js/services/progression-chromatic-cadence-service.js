// Cadencias cromáticas: sexta napolitana y sextas aumentadas.
(function (global) {
	'use strict';

	var OCTAVE = 12;

	function shouldUseChromaticCadence(pattern, progressionState, rng) {
		var probability = chromaticCadenceProbability(pattern, progressionState);
		var value;

		if (probability <= 0) {
			return false;
		}

		value = typeof rng === 'function' ? rng() : Math.random();

		return value < probability;
	}

	function chromaticCadenceProbability(pattern, progressionState) {
		var chromaticism = numberOrDefault(progressionState && progressionState.chromaticism, 0);
		var counterpoint = numberOrDefault(progressionState && progressionState.counterpoint, 0);
		var probability;

		if (chromaticism < 25) {
			return 0;
		}

		probability = (chromaticism - 25) / 105;
		probability += counterpoint / 480;

		if (progressionState && progressionState.style === 'classic') {
			probability += 0.1;
		}

		if (pattern && pattern.cadence && pattern.cadence !== 'authentic' && pattern.cadence !== 'half') {
			probability *= pattern.cadence === 'plagal' ? 0.62 : 0.72;
		}

		return Math.min(chromaticism >= 95 ? 0.86 : 0.62, Math.max(0, probability));
	}

	function chooseChromaticCadenceType(progressionState, rng) {
		var chromaticism = numberOrDefault(progressionState && progressionState.chromaticism, 0);
		var value = typeof rng === 'function' ? rng() : Math.random();

		if (value < (chromaticism >= 75 ? 0.42 : 0.58)) {
			return 'neapolitan';
		}

		return 'augmented6';
	}

	function forceChromaticEnding(degrees, options) {
		var cadence = options.cadence;

		if (cadence === 'neapolitan') {
			forceNeapolitanEnding(degrees, options);
		} else if (cadence === 'augmented6') {
			forceAugmentedSixthEnding(degrees, options);
		}
	}

	function forceNeapolitanEnding(degrees, options) {
		var start = degrees.length >= 4 && shouldUseCadentialBridge(options.progressionState, options.rng) ? degrees.length - 4 : degrees.length - 3;

		if (degrees.length < 3) {
			forceShortAuthenticEnding(degrees);
			return;
		}

		degrees[start] = neapolitanDegree(options.report);
		if (degrees.length - start === 4) {
			degrees[start + 1] = cadentialSixFourDegree();
			degrees[start + 2] = dominantDegree(options);
			degrees[start + 3] = tonicResolutionDegree();
		} else {
			degrees[start + 1] = dominantDegree(options);
			degrees[start + 2] = tonicResolutionDegree();
		}
	}

	function forceAugmentedSixthEnding(degrees, options) {
		var start = degrees.length >= 4 && shouldUseCadentialBridge(options.progressionState, options.rng) ? degrees.length - 4 : degrees.length - 3;

		if (degrees.length < 3) {
			forceShortAuthenticEnding(degrees);
			return;
		}

		degrees[start] = augmentedSixthDegree(options.report, options.rng);
		if (degrees.length - start === 4) {
			degrees[start + 1] = cadentialSixFourDegree();
			degrees[start + 2] = dominantDegree(options);
			degrees[start + 3] = tonicResolutionDegree();
		} else {
			degrees[start + 1] = dominantDegree(options);
			degrees[start + 2] = tonicResolutionDegree();
		}
	}

	function neapolitanDegree(report) {
		var tonicIndex = tonicIndexFromReport(report);
		var root = noteName(tonicIndex + 1, 'flat');
		var third = noteName(tonicIndex + 5, 'flat');
		var fifth = noteName(tonicIndex + 8, 'flat');

		return {
			chord: {
				factorNotes: [root, third, fifth],
				fundamental: root,
				nombre: root,
				quinta: fifth,
				septima: noteName(tonicIndex, 'flat'),
				tercera: third
			},
			chromaticRole: 'neapolitan',
			degreeDisplayName: '\u266dII',
			forceInversionIndex: 1,
			forceKind: 'triad',
			index: 1,
			preventSuspension: true,
			preventTensions: true,
			source: 'chromatic',
			sourceLabelKey: 'progression.chromatic.neapolitan',
			tonalFunctionOverride: 'SD'
		};
	}

	function augmentedSixthDegree(report, rng) {
		var tonicIndex = tonicIndexFromReport(report);
		var variant = augmentedSixthVariant(rng);
		var notes = augmentedSixthNotes(tonicIndex, variant);

		return {
			chord: {
				factorNotes: notes,
				fundamental: notes[0],
				nombre: variant.label,
				quinta: notes[2],
				septima: notes[3],
				tercera: notes[1]
			},
			chromaticRole: variant.id,
			degreeDisplayName: variant.label,
			forceInversionIndex: 0,
			forceKind: 'seventh',
			index: 5,
			preventSuspension: true,
			preventTensions: true,
			source: 'chromatic',
			sourceLabelKey: 'progression.chromatic.augmentedSixth',
			tonalFunctionOverride: 'SD'
		};
	}

	function augmentedSixthVariant(rng) {
		var value = typeof rng === 'function' ? rng() : Math.random();

		if (value < 0.34) {
			return { id: 'italian6', label: 'It+6' };
		}

		if (value < 0.68) {
			return { id: 'french43', label: 'Fr+6' };
		}

		return { id: 'swiss65', label: 'Sw+6' };
	}

	function augmentedSixthNotes(tonicIndex, variant) {
		var flatSix = noteName(tonicIndex + 8, 'flat');
		var tonic = noteName(tonicIndex, 'sharp');
		var sharpFour = noteName(tonicIndex + 6, 'sharp');

		if (variant.id === 'italian6') {
			return [flatSix, tonic, tonic, sharpFour];
		}

		if (variant.id === 'french43') {
			return [flatSix, tonic, noteName(tonicIndex + 2, 'sharp'), sharpFour];
		}

		return [flatSix, tonic, noteName(tonicIndex + 3, 'flat'), sharpFour];
	}

	function cadentialSixFourDegree() {
		return {
			cadentialRole: 'cadential64',
			forceInversionIndex: 2,
			forceKind: 'triad',
			index: 0,
			preventSuspension: true,
			preventTensions: true,
			source: 'diatonic',
			tonalFunctionOverride: 'D'
		};
	}

	function dominantDegree(options) {
		return {
			cadentialRole: 'cadential-dominant',
			forceInversionIndex: 0,
			forceKind: dominantKind(options.progressionState, options.rng),
			index: 4,
			preventSuspension: true,
			preventTensions: true,
			source: 'diatonic',
			tonalFunctionOverride: 'D'
		};
	}

	function tonicResolutionDegree() {
		return {
			cadentialRole: 'cadential-resolution',
			forceInversionIndex: 0,
			forceKind: 'triad',
			index: 0,
			preventSuspension: true,
			preventTensions: true,
			source: 'diatonic'
		};
	}

	function forceShortAuthenticEnding(degrees) {
		if (!degrees || degrees.length < 2) {
			return;
		}

		degrees[degrees.length - 2] = dominantDegree({});
		degrees[degrees.length - 1] = tonicResolutionDegree();
	}

	function dominantKind(progressionState, rng) {
		var voices = numberOrDefault(progressionState && progressionState.voices, 4);
		var chromaticism = numberOrDefault(progressionState && progressionState.chromaticism, 0);
		var value = typeof rng === 'function' ? rng() : Math.random();
		var probability = voices >= 4 ? 0.58 : 0.32;

		probability += chromaticism / 450;

		return value < Math.min(0.82, probability) ? 'seventh' : 'triad';
	}

	function shouldUseCadentialBridge(progressionState, rng) {
		var counterpoint = numberOrDefault(progressionState && progressionState.counterpoint, 0);
		var chromaticism = numberOrDefault(progressionState && progressionState.chromaticism, 0);
		var value = typeof rng === 'function' ? rng() : Math.random();
		var probability = 0.18 + counterpoint / 360 + chromaticism / 500;

		if (progressionState && progressionState.style === 'classic') {
			probability += 0.12;
		}

		return value < Math.min(0.58, probability);
	}

	function tonicIndexFromReport(report) {
		var data = global.CodaData || {};
		var byName = data.indexes && data.indexes.notes ? data.indexes.notes.indexByName : null;
		var tonicIndex = Number(report && report.tonicIndex);

		if (isFinite(tonicIndex)) {
			return tonicIndex;
		}

		if (byName && report && report.tonicName != null && byName[report.tonicName] != null) {
			return byName[report.tonicName];
		}

		return 0;
	}

	function noteName(index, spelling) {
		var data = global.CodaData || {};
		var notes = data.notes || [];
		var note = notes[normalizeIndex(index)];

		if (!note) {
			return 'C';
		}

		if (spelling === 'flat' && note.enarmonica) {
			return note.enarmonica;
		}

		return note.nombre;
	}

	function normalizeIndex(index) {
		var normalized = Number(index) % OCTAVE;

		return normalized < 0 ? normalized + OCTAVE : normalized;
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionChromaticCadence = {
		augmentedSixthDegree: augmentedSixthDegree,
		augmentedSixthNotes: augmentedSixthNotes,
		augmentedSixthVariant: augmentedSixthVariant,
		chromaticCadenceProbability: chromaticCadenceProbability,
		chooseChromaticCadenceType: chooseChromaticCadenceType,
		forceAugmentedSixthEnding: forceAugmentedSixthEnding,
		forceChromaticEnding: forceChromaticEnding,
		forceNeapolitanEnding: forceNeapolitanEnding,
		neapolitanDegree: neapolitanDegree,
		shouldUseCadentialBridge: shouldUseCadentialBridge,
		shouldUseChromaticCadence: shouldUseChromaticCadence
	};
})(window);
