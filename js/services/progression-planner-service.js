// Harmonic phrase and cadence planner for generated progressions.
(function (global) {
	'use strict';

	var cadencePlanner = global.CodaProgressionCadencePlanner;
	var patternSelector = global.CodaProgressionPatternSelector;
	var phraseBlockSelector = global.CodaProgressionPhraseBlockSelector;

	function createPlan(options) {
		var progressionState = options.progressionState;
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var mode = progressionMode(options.report);
		var pattern = patternSelector.choose({
			mode: mode,
			progressionState: progressionState,
			rng: rng,
			rules: options.rules
		});
		var degrees = progressionState.bars >= 8 ?
			composePhraseBlocks({
				mode: mode,
				pattern: pattern,
				progressionState: progressionState,
				rng: rng,
				rules: options.rules
			}) :
			fitDegreesToBars(pattern, progressionState.bars);
		degrees = applyModalInterchangeSources(degrees, options.report, progressionState, rng);
		degrees = applyOpeningFunction(degrees, options.report, options.openingFunction, rng);

		return {
			degrees: degrees,
			pattern: pattern,
			voiceLeading: voiceLeadingProfile(progressionState)
		};
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
			var shouldTryInterchange = i > 0 && (isBorrowedMarker || (chance > 0 && rng() < chance));
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

	function progressionMode(report) {
		return report && report.mode === 'M' ? 'major' : 'minor';
	}

	function fitDegreesToBars(pattern, bars) {
		var fitted = [];
		var sourceDegrees = pattern.degrees || [0, 3, 4, 0];
		var normalizedBars = numberOrDefault(bars, sourceDegrees.length);
		var borrowedIndexes = pattern.borrowed || [];

		for (var i = 0; i < normalizedBars; i++) {
			fitted.push({
				index: sourceDegrees[i % sourceDegrees.length],
				source: borrowedIndexes.indexOf(i % sourceDegrees.length) > -1 ? 'parallel' : 'diatonic'
			});
		}

		cadencePlanner.forceCadentialEnding(fitted, pattern);

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
			var cadence = isFinalBlock ? cadencePlanner.finalCadenceForPattern(options.pattern, options.progressionState, options.rng) : cadencePlanner.chooseIntermediateCadence(options.rng);
			var block = phraseBlockSelector.choose({
				cadence: cadence,
				mode: options.mode,
				previousBlockId: previousBlockId,
				progressionState: options.progressionState,
				rng: options.rng,
				rules: options.rules
			});

			previousBlockId = block.id;
			degrees = degrees.concat(varyBlockOpening(
				phraseBlockSelector.fitBlockToBars(block, blockLength),
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

	global.CodaProgressionPlanner = {
		applyModalInterchangeSources: applyModalInterchangeSources,
		applyOpeningFunction: applyOpeningFunction,
		chooseInterchangeSource: chooseInterchangeSource,
		createPlan: createPlan,
		degreeIndexesForFunction: degreeIndexesForFunction,
		fitDegreesToBars: fitDegreesToBars,
		varyBlockOpening: varyBlockOpening,
		voiceLeadingProfile: voiceLeadingProfile
	};
})(window);
