// Harmonic phrase and cadence planner for generated progressions.
(function (global) {
	'use strict';

	var cadencePlanner = global.CodaProgressionCadencePlanner;
	var modalPlanner = global.CodaProgressionModalPlanner;
	var patternSelector = global.CodaProgressionPatternSelector;
	var phraseBlockSelector = global.CodaProgressionPhraseBlockSelector;
	var styleService = global.CodaProgressionStyle;

	function createPlan(options) {
		var progressionState = options.progressionState;
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var mode = progressionMode(options.report);
		var modalPlan;

		if (modalPlanner && modalPlanner.isGreekMode(options.report)) {
			modalPlan = modalPlanner.createPlan({
				progressionState: progressionState,
				report: options.report,
				rng: rng,
				rules: options.rules
			});

			modalPlan.degrees = applySparseChordRepetition(modalPlan.degrees, progressionState, rng);

			return modalPlan;
		}

		var pattern = patternSelector.choose({
			mode: mode,
			progressionState: progressionState,
			rng: rng,
			rules: options.rules
		});
		var finalCadence = cadencePlanner.finalCadenceForPattern(pattern, progressionState, rng);
		var endingCadence = effectiveEndingCadence(pattern, finalCadence);
		var degrees = progressionState.bars >= 8 ?
			composePhraseBlocks({
				finalCadence: endingCadence,
				mode: mode,
				pattern: pattern,
				progressionState: progressionState,
				report: options.report,
				rng: rng,
				rules: options.rules
			}) :
			fitDegreesToBars(pattern, progressionState.bars, {
				cadence: endingCadence,
				mode: mode,
				progressionState: progressionState,
				report: options.report,
				rng: rng,
				rules: options.rules
			});
		degrees = applyClassicMinorDominants(degrees, options.report, progressionState, mode);
		degrees = applyModalInterchangeSources(degrees, options.report, progressionState, rng);
		degrees = applyOpeningFunction(degrees, options.report, options.openingFunction, rng);
		degrees = applySparseChordRepetition(degrees, progressionState, rng);

		return {
			degrees: degrees,
			finalCadence: finalCadence,
			pattern: pattern,
			voiceLeading: voiceLeadingProfile(progressionState)
		};
	}

	function effectiveEndingCadence(pattern, finalCadence) {
		if (finalCadence === 'cadential64' || finalCadence === 'neapolitan' || finalCadence === 'augmented6' || finalCadence === 'subFive') {
			return finalCadence;
		}

		if (pattern && pattern.cadence && !cadencePlanner.isAuthenticCadence(pattern.cadence)) {
			return pattern.cadence;
		}

		return finalCadence;
	}

	function applyOpeningFunction(degrees, report, openingFunction, rng) {
		var candidates;

		if (!degrees || !degrees.length || !openingFunction) {
			return degrees;
		}

		candidates = degreeIndexesForFunction(report, openingFunction);
		if (!candidates.length) {
			return degrees;
		}

		degrees[0] = extendObject(degrees[0], {
			index: candidates[Math.floor(rng() * candidates.length) % candidates.length],
			source: 'diatonic'
		});

		return degrees;
	}

	function applySparseChordRepetition(degrees, progressionState, rng) {
		var chance = repetitionChance(progressionState);
		var candidates;
		var targetIndex;

		rng = typeof rng === 'function' ? rng : Math.random;

		if (!degrees || degrees.length < 3 || !chance || rng() >= chance) {
			return degrees;
		}

		candidates = repeatableDegreeIndexes(degrees);
		if (!candidates.length) {
			return degrees;
		}

		targetIndex = candidates[Math.floor(rng() * candidates.length) % candidates.length];
		degrees[targetIndex] = repeatDegree(degrees[targetIndex - 1]);

		return degrees;
	}

	function repetitionChance(progressionState) {
		var bars = numberOrDefault(progressionState && progressionState.bars, 0);

		if (bars <= 2) {
			return 0;
		}

		if (bars <= 4) {
			return 0.02;
		}

		if (bars <= 8) {
			return 0.08;
		}

		if (bars <= 16) {
			return 0.16;
		}

		return 0.24;
	}

	function repeatableDegreeIndexes(degrees) {
		var indexes = [];
		var protectedCadenceStart = Math.max(1, degrees.length - 2);

		for (var i = 1; i < protectedCadenceStart; i++) {
			if (canRepeatDegree(degrees[i - 1]) && canReplaceWithRepeat(degrees[i])) {
				indexes.push(i);
			}
		}

		return indexes;
	}

	function canRepeatDegree(degree) {
		return degree &&
			degree.index !== undefined &&
			!degree.cadentialRole &&
			!degree.chromaticRole;
	}

	function canReplaceWithRepeat(degree) {
		return degree &&
			!degree.cadentialRole &&
			!degree.chromaticRole &&
			degree.forceInversionIndex === undefined &&
			!degree.forceKind;
	}

	function repeatDegree(degree) {
		var repeated = extendObject(degree, {});

		repeated.repetitionRole = 'direct-repeat';

		return repeated;
	}

	function degreeIndexesForFunction(report, functionName) {
		var functions = report && report.scaleDefinition && report.scaleDefinition.funciones ? report.scaleDefinition.funciones.split('-') : [];
		var indexes = [];

		for (var i = 0; i < functions.length; i++) {
			if (functions[i] === functionName && i !== 0) {
				indexes.push(i);
			}
		}

		return indexes;
	}

	function applyModalInterchangeSources(degrees, report, progressionState, rng) {
		var result = [];
		var chance = Math.max(0, (numberOrDefault(progressionState.modalInterchange, 0) - 55) / 120);

		for (var i = 0; i < (degrees || []).length; i++) {
			var degree = extendObject(degrees[i], {});
			var isBorrowedMarker = degree.source === 'parallel';
			var canInterchange = !degree.source || degree.source === 'diatonic' || degree.source === 'parallel';
			var shouldTryInterchange = canInterchange && i > 0 && (isBorrowedMarker || (chance > 0 && rng() < chance));
			var source = shouldTryInterchange ? chooseInterchangeSource(report, degree.index, rng) : null;

			if (source) {
				degree.source = 'interchange';
				degree.sourceId = source.id;
				degree.sourceScaleIndex = source.scaleIndex;
			} else if (isBorrowedMarker) {
				degree.source = 'diatonic';
			}

			result.push(degree);
		}

		return result;
	}

	function applyClassicMinorDominants(degrees, report, progressionState, mode) {
		var result = [];
		var source = harmonicMinorDominantSource(report);

		if (!styleService.usesFunctionalMinorDominant(progressionState) || mode !== 'minor' || !source) {
			return degrees;
		}

		for (var i = 0; i < (degrees || []).length; i++) {
			var degree = extendObject(degrees[i], {});

			if (shouldUseClassicMinorDominant(degree, report, source)) {
				degree.source = 'interchange';
				degree.sourceId = source.id;
				degree.sourceScaleIndex = source.scaleIndex;
			}

			result.push(degree);
		}

		return result;
	}

	function chooseInterchangeSource(report, degreeIndex, rng) {
		var sources = report && report.modalInterchangeSources ? report.modalInterchangeSources : [];
		var candidates = [];
		var baseChord = report && report.scaleChords ? report.scaleChords[degreeIndex] : null;

		for (var i = 0; i < sources.length; i++) {
			var chord = sources[i].scaleChords ? sources[i].scaleChords[degreeIndex] : null;

			if (chord && (!baseChord || chord.nombre !== baseChord.nombre)) {
				candidates.push(sources[i]);
			}
		}

		if (!candidates.length) {
			return null;
		}

		return candidates[Math.floor(rng() * candidates.length) % candidates.length];
	}

	function harmonicMinorDominantSource(report) {
		var sources = report && report.modalInterchangeSources ? report.modalInterchangeSources : [];

		for (var i = 0; i < sources.length; i++) {
			if (Number(sources[i].scaleIndex) === 3 && sources[i].scaleChords && sources[i].scaleChords[4]) {
				return sources[i];
			}
		}

		return null;
	}

	function shouldUseClassicMinorDominant(degree, report, source) {
		var baseChord = report && report.scaleChords ? report.scaleChords[4] : null;
		var sourceChord = source && source.scaleChords ? source.scaleChords[4] : null;

		return degree &&
			degree.index === 4 &&
			(!degree.source || degree.source === 'diatonic' || degree.source === 'parallel') &&
			sourceChord &&
			(!baseChord || sourceChord.nombre !== baseChord.nombre);
	}

	function progressionMode(report) {
		return report && report.mode === 'M' ? 'major' : 'minor';
	}

	function fitDegreesToBars(pattern, bars, cadenceOptions) {
		var fitted = [];
		var sourceDegrees = pattern.degrees || [0, 3, 4, 0];
		var normalizedBars = numberOrDefault(bars, sourceDegrees.length);
		var borrowedIndexes = pattern.borrowed || [];

		for (var i = 0; i < normalizedBars; i++) {
			fitted.push(degreeFromSource(sourceDegrees[i % sourceDegrees.length], {
				source: borrowedIndexes.indexOf(i % sourceDegrees.length) > -1 ? 'parallel' : 'diatonic'
			}));
		}

		cadencePlanner.forceCadentialEnding(fitted, pattern, cadenceOptions || {});

		return fitted;
	}

	function composePhraseBlocks(options) {
		var bars = numberOrDefault(options.progressionState.bars, 8);
		var blockCount = Math.ceil(bars / 4);
		var degrees = [];
		var previousBlockId = '';

		for (var blockIndex = 0; blockIndex < blockCount; blockIndex++) {
			var remainingBars = bars - degrees.length;
			var blockLength = Math.min(4, remainingBars);
			var isFinalBlock = blockIndex === blockCount - 1;
			var cadence = isFinalBlock ? options.finalCadence : cadencePlanner.chooseIntermediateCadence(options.rng);
			var block = phraseBlockSelector.choose({
				cadence: cadence,
				mode: options.mode,
				previousBlockId: previousBlockId,
				progressionState: options.progressionState,
				rng: options.rng,
				rules: options.rules
			});
			var fittedBlock = phraseBlockSelector.fitBlockToBars(block, blockLength);

			if (isFinalBlock) {
				cadencePlanner.forceCadentialEnding(fittedBlock, block, {
					cadence: cadence,
					mode: options.mode,
					progressionState: options.progressionState,
					report: options.report,
					rng: options.rng,
					rules: options.rules
				});
			}

			previousBlockId = block.id;
			degrees = degrees.concat(varyBlockOpening(
				fittedBlock,
				blockIndex,
				options.mode,
				options.rng
			));
		}

		return degrees.slice(0, bars);
	}

	function varyBlockOpening(blockDegrees, blockIndex, mode, rng) {
		var roll;
		var candidates;

		if (!blockDegrees || !blockDegrees.length || blockIndex === 0 || blockDegrees[0].index !== 0) {
			return blockDegrees;
		}

		roll = rng();
		if (roll < 0.52) {
			return blockDegrees;
		}

		candidates = roll < 0.9 ? tonicAlternatives(mode) : subdominantAlternatives(mode);
		blockDegrees[0] = extendObject(blockDegrees[0], {
			index: candidates[Math.floor(rng() * candidates.length) % candidates.length],
			source: 'diatonic'
		});

		return blockDegrees;
	}

	function tonicAlternatives(mode) {
		return mode === 'major' ? [5, 2] : [2, 5];
	}

	function subdominantAlternatives() {
		return [3, 1];
	}

	function voiceLeadingProfile(progressionState) {
		if (progressionState.counterpoint >= 70) {
			return 'contrary-stepwise';
		}

		if (progressionState.counterpoint >= 35) {
			return 'balanced';
		}

		return 'homophonic';
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	function extendObject(target, values) {
		var result = {};
		var key;

		target = target || {};
		for (key in target) {
			if (Object.prototype.hasOwnProperty.call(target, key)) {
				result[key] = target[key];
			}
		}

		for (key in values) {
			if (Object.prototype.hasOwnProperty.call(values, key)) {
				result[key] = values[key];
			}
		}

		return result;
	}

	function degreeFromSource(sourceDegree, defaults) {
		if (phraseBlockSelector && typeof phraseBlockSelector.degreeFromSource === 'function') {
			return phraseBlockSelector.degreeFromSource(sourceDegree, defaults);
		}

		return typeof sourceDegree === 'object' ? extendObject(sourceDegree, defaults || {}) : extendObject(defaults || {}, {
			index: sourceDegree
		});
	}

	global.CodaProgressionPlanner = {
		applyClassicMinorDominants: applyClassicMinorDominants,
		applyModalInterchangeSources: applyModalInterchangeSources,
		applyOpeningFunction: applyOpeningFunction,
		applySparseChordRepetition: applySparseChordRepetition,
		chooseInterchangeSource: chooseInterchangeSource,
		createPlan: createPlan,
		degreeIndexesForFunction: degreeIndexesForFunction,
		effectiveEndingCadence: effectiveEndingCadence,
		fitDegreesToBars: fitDegreesToBars,
		degreeFromSource: degreeFromSource,
		harmonicMinorDominantSource: harmonicMinorDominantSource,
		repetitionChance: repetitionChance,
		shouldUseClassicMinorDominant: shouldUseClassicMinorDominant,
		varyBlockOpening: varyBlockOpening,
		voiceLeadingProfile: voiceLeadingProfile
	};
})(window);
