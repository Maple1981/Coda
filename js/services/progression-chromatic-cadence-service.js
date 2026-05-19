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
		var subFiveChance = subFiveCadenceChance(progressionState);

		if (subFiveChance > 0 && value >= 1 - subFiveChance) {
			return 'subFive';
		}

		if (value < (chromaticism >= 75 ? 0.42 : 0.58)) {
			return 'neapolitan';
		}

		return 'augmented6';
	}

	function subFiveCadenceChance(progressionState) {
		var chromaticism = numberOrDefault(progressionState && progressionState.chromaticism, 0);
		var styleBonus = progressionState && progressionState.style === 'modern' ? 0.04 : 0;

		if (chromaticism < 75) {
			return 0;
		}

		if (chromaticism >= 95) {
			return 0.18 + styleBonus;
		}

		return 0.08 + styleBonus / 2;
	}

	function forceChromaticEnding(degrees, options) {
		var cadence = options.cadence;

		if (cadence === 'neapolitan') {
			forceNeapolitanEnding(degrees, options);
		} else if (cadence === 'augmented6') {
			forceAugmentedSixthEnding(degrees, options);
		} else if (cadence === 'subFive') {
			forceSubFiveEnding(degrees, options);
		}
	}

	function forceSubFiveEnding(degrees, options) {
		var cadence = options.patternCadence || (options.pattern ? options.pattern.cadence : '');
		var resolvesToDominant = cadence === 'half';
		var canUseDominantChain = degrees.length >= 3 && !resolvesToDominant && shouldResolveSubFiveToDominant(options.progressionState, options.rng);
		var start;

		if (degrees.length < 2) {
			forceShortAuthenticEnding(degrees);
			return;
		}

		if (resolvesToDominant) {
			degrees[degrees.length - 2] = subFiveDegree(options.report, {
				progressionState: options.progressionState,
				rng: options.rng,
				targetDegreeIndex: 4
			});
			degrees[degrees.length - 1] = dominantDegree(options);
			return;
		}

		if (canUseDominantChain) {
			start = degrees.length - 3;
			degrees[start] = subFiveDegree(options.report, {
				progressionState: options.progressionState,
				rng: options.rng,
				targetDegreeIndex: 4
			});
			degrees[start + 1] = dominantDegree(options);
			degrees[start + 2] = tonicResolutionDegree();
			return;
		}

		degrees[degrees.length - 2] = subFiveDegree(options.report, {
			progressionState: options.progressionState,
			rng: options.rng,
			targetDegreeIndex: 0
		});
		degrees[degrees.length - 1] = tonicResolutionDegree();
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
				nombre: root + 'maj7',
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
		var tonicName = tonicNameFromReport(report, tonicIndex);
		var variant = augmentedSixthVariant(rng);
		var notes = augmentedSixthNotes(tonicIndex, variant, tonicName);
		var chordName = notes[0] + ' ' + variant.label;

		return {
			chord: {
				factorNotes: notes,
				fundamental: notes[0],
				nombre: chordName,
				quinta: notes[2],
				septima: notes[3],
				tercera: notes[1],
				displayName: chordName
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

		if (value < 0.25) {
			return { id: 'italian6', label: 'It+6' };
		}

		if (value < 0.5) {
			return { id: 'french43', label: 'Fr+6' };
		}

		if (value < 0.75) {
			return { id: 'german65', label: 'Ger+6' };
		}

		return { id: 'swiss65', label: 'Sw+6' };
	}

	function augmentedSixthNotes(tonicIndex, variant, tonicName) {
		var flatSix = spellChromaticDegree(tonicName, tonicIndex, 6, 8);
		var tonic = spellChromaticDegree(tonicName, tonicIndex, 1, 0);
		var sharpFour = spellChromaticDegree(tonicName, tonicIndex, 4, 6);

		if (variant.id === 'italian6') {
			return [flatSix, tonic, tonic, sharpFour];
		}

		if (variant.id === 'french43') {
			return [flatSix, tonic, spellChromaticDegree(tonicName, tonicIndex, 2, 2), sharpFour];
		}

		if (variant.id === 'german65') {
			return [flatSix, tonic, spellChromaticDegree(tonicName, tonicIndex, 3, 3), sharpFour];
		}

		return [flatSix, tonic, spellChromaticDegree(tonicName, tonicIndex, 2, 3), sharpFour];
	}

	function subFiveDegree(report, options) {
		var targetDegreeIndex = numberOrDefault(options && options.targetDegreeIndex, 0);
		var targetPitch = targetPitchClass(report, targetDegreeIndex);
		var rootIndex = normalizeIndex(targetPitch + 1);
		var root = noteName(rootIndex, 'flat');
		var third = noteName(rootIndex + 4, 'flat');
		var fifth = noteName(rootIndex + 7, 'flat');
		var seventh = noteName(rootIndex + 10, 'flat');

		return {
			chord: {
				factorNotes: [root, third, fifth, seventh],
				fundamental: root,
				nombre: root + '7',
				quinta: fifth,
				septima: seventh,
				tercera: third
			},
			chromaticRole: 'subFive',
			degreeDisplayName: targetDegreeIndex === 4 ? 'SubV/V' : 'SubV/I',
			forceInversionIndex: subFiveInversionIndex(options && options.progressionState, options && options.rng),
			forceKind: 'seventh',
			index: targetDegreeIndex,
			preventSuspension: true,
			preventTensions: true,
			source: 'chromatic',
			sourceLabelKey: 'progression.chromatic.subFive',
			tonalFunctionOverride: 'D'
		};
	}

	function shouldResolveSubFiveToDominant(progressionState, rng) {
		var chromaticism = numberOrDefault(progressionState && progressionState.chromaticism, 0);
		var value = typeof rng === 'function' ? rng() : Math.random();
		var probability = chromaticism >= 95 ? 0.42 : 0.28;

		return value < probability;
	}

	function subFiveInversionIndex(progressionState, rng) {
		var chromaticism = numberOrDefault(progressionState && progressionState.chromaticism, 0);
		var voices = numberOrDefault(progressionState && progressionState.voices, 4);
		var value = typeof rng === 'function' ? rng() : Math.random();
		var thirdInversionChance = chromaticism >= 95 ? 0.34 : 0.22;

		if (voices >= 4 && value < thirdInversionChance) {
			return 3;
		}

		if (value < thirdInversionChance + 0.16) {
			return 1;
		}

		if (value < thirdInversionChance + 0.24) {
			return 2;
		}

		return 0;
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

	function tonicNameFromReport(report, tonicIndex) {
		if (report && report.tonicName) {
			return report.tonicName;
		}

		return noteName(tonicIndex, 'sharp');
	}

	function targetPitchClass(report, degreeIndex) {
		var pitchService = global.CodaProgressionPitch || global.CodaProgressionVoicing;
		var chord = report && report.scaleChords ? report.scaleChords[degreeIndex] : null;
		var pitch;

		if (chord && chord.fundamental && pitchService && typeof pitchService.noteIndex === 'function') {
			pitch = pitchService.noteIndex(chord.fundamental);
			if (pitch != null) {
				return pitch;
			}
		}

		return normalizeIndex(tonicIndexFromReport(report) + (degreeIndex === 4 ? 7 : 0));
	}

	function spellChromaticDegree(tonicName, tonicIndex, degreeNumber, semitoneOffset) {
		var letter = degreeLetter(tonicName, degreeNumber);
		var target = normalizeIndex(tonicIndex + semitoneOffset);
		var accidental = accidentalFor(letter, target);

		return letter + accidental;
	}

	function degreeLetter(tonicName, degreeNumber) {
		var letters = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
		var tonicLetter = parseNoteName(tonicName).letter || 'C';
		var tonicLetterIndex = letters.indexOf(tonicLetter);

		if (tonicLetterIndex < 0) {
			tonicLetterIndex = 0;
		}

		return letters[(tonicLetterIndex + degreeNumber - 1) % letters.length];
	}

	function accidentalFor(letter, targetPitchClass) {
		var natural = naturalPitchClass(letter);
		var delta = targetPitchClass - natural;

		while (delta > 6) {
			delta -= OCTAVE;
		}
		while (delta < -6) {
			delta += OCTAVE;
		}

		if (delta === 2) {
			return '\uD834\uDD2A';
		}
		if (delta === 1) {
			return '\u266F';
		}
		if (delta === -1) {
			return '\u266D';
		}
		if (delta === -2) {
			return '\uD834\uDD2B';
		}

		return '';
	}

	function naturalPitchClass(letter) {
		var values = {
			C: 0,
			D: 2,
			E: 4,
			F: 5,
			G: 7,
			A: 9,
			B: 11
		};

		return values[letter] || 0;
	}

	function parseNoteName(noteNameValue) {
		var match = /^([A-G])([#b\u266F\u266D\uD834\uDD2A\uD834\uDD2B]*)/.exec(String(noteNameValue || ''));

		return {
			accidental: match ? match[2] : '',
			letter: match ? match[1] : ''
		};
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
		forceSubFiveEnding: forceSubFiveEnding,
		neapolitanDegree: neapolitanDegree,
		shouldUseCadentialBridge: shouldUseCadentialBridge,
		shouldUseChromaticCadence: shouldUseChromaticCadence,
		shouldResolveSubFiveToDominant: shouldResolveSubFiveToDominant,
		subFiveCadenceChance: subFiveCadenceChance,
		subFiveDegree: subFiveDegree,
		subFiveInversionIndex: subFiveInversionIndex
	};
})(window);
