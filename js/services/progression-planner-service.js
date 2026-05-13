// Harmonic phrase and cadence planner for generated progressions.
(function (global) {
	'use strict';

	var cadencePlanner = global.CodaProgressionCadencePlanner;

	function createPlan(options) {
		var progressionState = options.progressionState;
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var mode = progressionMode(options.report);
		var pattern = choosePattern({
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

		return {
			degrees: degrees,
			pattern: pattern,
			voiceLeading: voiceLeadingProfile(progressionState)
		};
	}

	function choosePattern(options) {
		var patterns = options.rules && options.rules.patterns ? options.rules.patterns : [];
		var candidates = [];
		var totalWeight = 0;
		var selectedValue;

		for (var i = 0; i < patterns.length; i++) {
			var weight;

			if (!matchesMode(patterns[i], options.mode)) {
				continue;
			}

			weight = adjustedPatternWeight(patterns[i], options.progressionState, options.mode);
			if (weight <= 0) {
				continue;
			}

			candidates.push({
				pattern: patterns[i],
				weight: weight
			});
			totalWeight += candidates[candidates.length - 1].weight;
		}

		if (!candidates.length) {
			return fallbackPatternForStyle(options.progressionState);
		}

		selectedValue = options.rng() * totalWeight;

		for (var j = 0; j < candidates.length; j++) {
			selectedValue -= candidates[j].weight;
			if (selectedValue <= 0) {
				return candidates[j].pattern;
			}
		}

		return candidates[candidates.length - 1].pattern;
	}

	function adjustedPatternWeight(pattern, progressionState, mode) {
		var weight = pattern.weight || 1;

		if (isModernStyle(progressionState) && cadencePlanner.isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		if (isClassicStyle(progressionState) && !cadencePlanner.isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		weight += affinityScore(progressionState.counterpoint, pattern.counterpoint);
		weight += affinityScore(progressionState.modalInterchange, pattern.modalColor);
		weight += affinityScore(progressionState.tensions, pattern.tensionAffinity);
		weight += commonToneDegreeScore(pattern.degrees, progressionState);
		weight *= sensitiveDegreeFactor(pattern.degrees, mode, progressionState);

		if (progressionState.articulation === 'arpeggio' && pattern.form === 'circle-of-fifths') {
			weight += 8;
		}

		if (progressionState.articulation === 'legato' && pattern.cadence === 'authentic') {
			weight += 5;
		}

		if (progressionState.articulation === 'staccato' && pattern.cadence === 'half') {
			weight += 5;
		}

		return Math.max(1, weight);
	}

	function fallbackPatternForStyle(progressionState) {
		if (isModernStyle(progressionState)) {
			return {
				cadence: 'half',
				counterpoint: 70,
				degrees: [0, 3, 1, 4],
				form: 'fallback-modern',
				id: 'fallback-modern-half',
				weight: 1
			};
		}

		return {
			cadence: 'authentic',
			counterpoint: 70,
			degrees: [0, 3, 4, 0],
			form: 'fallback-classic',
			id: 'fallback-classic-authentic',
			weight: 1
		};
	}

	function affinityScore(value, target) {
		return Math.max(0, 18 - Math.abs((Number(value) || 0) - (Number(target) || 0)) / 4);
	}

	function matchesMode(pattern, mode) {
		return !pattern.modes || pattern.modes.indexOf(mode) > -1;
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
			var block = choosePhraseBlock({
				cadence: cadence,
				mode: options.mode,
				previousBlockId: previousBlockId,
				progressionState: options.progressionState,
				rng: options.rng,
				rules: options.rules
			});

			previousBlockId = block.id;
			degrees = degrees.concat(fitBlockToBars(block, blockLength));
		}

		return degrees.slice(0, bars);
	}

	function choosePhraseBlock(options) {
		var blocks = options.rules && options.rules.phraseBlocks ? options.rules.phraseBlocks : fallbackPhraseBlocks();
		var candidates = [];
		var totalWeight = 0;
		var selectedValue;

		for (var i = 0; i < blocks.length; i++) {
			if (!matchesMode(blocks[i], options.mode) || !cadencePlanner.matchesCadence(blocks[i], options.cadence)) {
				continue;
			}

			candidates.push({
				block: blocks[i],
				weight: adjustedBlockWeight(blocks[i], options.progressionState, options.previousBlockId, options.mode)
			});
			totalWeight += candidates[candidates.length - 1].weight;
		}

		if (candidates.length > 1) {
			candidates = candidates.filter(function (candidate) {
				return candidate.block.id !== options.previousBlockId;
			});
			totalWeight = sumCandidateWeights(candidates);
		}

		if (!candidates.length) {
			return fallbackPhraseBlocks()[0];
		}

		selectedValue = options.rng() * totalWeight;

		for (var j = 0; j < candidates.length; j++) {
			selectedValue -= candidates[j].weight;
			if (selectedValue <= 0) {
				return candidates[j].block;
			}
		}

		return candidates[candidates.length - 1].block;
	}

	function sumCandidateWeights(candidates) {
		var totalWeight = 0;

		for (var i = 0; i < candidates.length; i++) {
			totalWeight += candidates[i].weight;
		}

		return totalWeight;
	}

	function adjustedBlockWeight(block, progressionState, previousBlockId, mode) {
		var weight = block.weight || 1;

		weight += affinityScore(progressionState.counterpoint, block.counterpoint);
		weight += affinityScore(progressionState.modalInterchange, block.modalColor);
		weight += affinityScore(progressionState.tensions, block.tensionAffinity);
		weight += commonToneDegreeScore(block.degrees, progressionState);
		weight *= sensitiveDegreeFactor(block.degrees, mode, progressionState);

		if (block.id === previousBlockId) {
			weight = Math.max(1, weight * 0.12);
		}

		return Math.max(1, weight);
	}

	function sensitiveDegreeFactor(degrees, mode, progressionState) {
		var sensitiveDegree = mode === 'major' ? 6 : 1;
		var factor = 1;

		if (!isModernStyle(progressionState) || !degrees) {
			return factor;
		}

		for (var i = 0; i < degrees.length; i++) {
			if (degrees[i] === sensitiveDegree) {
				factor *= 0.32;
			}
		}

		return factor;
	}

	function commonToneDegreeScore(degrees, progressionState) {
		var score = 0;
		var affinity = 0.4 + numberOrDefault(progressionState.counterpoint, 0) / 160;

		if (!degrees || degrees.length < 2) {
			return 0;
		}

		for (var i = 1; i < degrees.length; i++) {
			var distance = Math.abs((degrees[i] % 7) - (degrees[i - 1] % 7));
			var circularDistance = Math.min(distance, 7 - distance);

			if (circularDistance === 0) {
				score += 3.5;
			} else if (circularDistance === 2) {
				score += 3;
			} else if (circularDistance === 3) {
				score += 2;
			} else if (circularDistance === 4) {
				score += 1.5;
			}
		}

		return score * affinity;
	}

	function isModernStyle(progressionState) {
		return progressionState && progressionState.style === 'modern';
	}

	function isClassicStyle(progressionState) {
		return progressionState && progressionState.style === 'classic';
	}

	function fitBlockToBars(block, bars) {
		var degrees = [];
		var sourceDegrees = block.degrees || [0, 3, 4, 0];
		var borrowedIndexes = block.borrowed || [];

		for (var i = 0; i < bars; i++) {
			degrees.push({
				index: sourceDegrees[i % sourceDegrees.length],
				source: borrowedIndexes.indexOf(i % sourceDegrees.length) > -1 ? 'parallel' : 'diatonic'
			});
		}

		return degrees;
	}

	function fallbackPhraseBlocks() {
		return [
			{ cadence: 'half', degrees: [0, 1, 3, 4], id: 'fallback-half', modes: ['major', 'minor'], weight: 1 },
			{ cadence: 'authentic', degrees: [0, 3, 4, 0], id: 'fallback-authentic', modes: ['major', 'minor'], weight: 1 }
		];
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

	global.CodaProgressionPlanner = {
		createPlan: createPlan,
		fitDegreesToBars: fitDegreesToBars,
		voiceLeadingProfile: voiceLeadingProfile
	};
})(window);
