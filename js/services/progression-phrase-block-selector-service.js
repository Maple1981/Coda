// Weighted selection of four-bar phrase blocks for generated progressions.
(function (global) {
	'use strict';

	var cadencePlanner = global.CodaProgressionCadencePlanner;
	var patternWeight = global.CodaProgressionPatternWeight;
	var patternSelector = global.CodaProgressionPatternSelector;

	function choose(options) {
		var blocks = options.rules && options.rules.phraseBlocks ? options.rules.phraseBlocks : fallbackPhraseBlocks();
		var candidates = [];
		var totalWeight = 0;
		var selectedValue;

		for (var i = 0; i < blocks.length; i++) {
			var weight;

			if (!patternSelector.matchesMode(blocks[i], options.mode) || !cadencePlanner.matchesCadence(blocks[i], options.cadence)) {
				continue;
			}

			weight = adjustedBlockWeight(blocks[i], options.progressionState, options.previousBlockId, options.mode);
			if (weight <= 0) {
				continue;
			}

			candidates.push({
				block: blocks[i],
				weight: weight
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
		return candidates.reduce(function (sum, candidate) {
			return sum + candidate.weight;
		}, 0);
	}

	function adjustedBlockWeight(block, progressionState, previousBlockId, mode) {
		var weight = block.weight || 1;

		weight += patternWeight.affinityScore(progressionState.counterpoint, block.counterpoint);
		weight += patternWeight.affinityScore(progressionState.modalInterchange, block.modalColor);
		weight += patternWeight.affinityScore(progressionState.tensions, block.tensionAffinity);
		weight += patternWeight.commonToneDegreeScore(block.degrees, progressionState);
		weight *= patternWeight.sensitiveDegreeFactor(block.degrees, mode, progressionState);

		if (block.id === previousBlockId) {
			weight = Math.max(1, weight * 0.12);
		}

		return Math.max(1, weight);
	}

	function fitBlockToBars(block, bars) {
		var sourceDegrees = block.degrees || [0, 3, 4, 0];
		var borrowedIndexes = block.borrowed || [];
		var fitted = [];

		for (var i = 0; i < bars; i++) {
			fitted.push({
				index: sourceDegrees[i % sourceDegrees.length],
				source: borrowedIndexes.indexOf(i % sourceDegrees.length) > -1 ? 'parallel' : 'diatonic'
			});
		}

		return fitted;
	}

	function fallbackPhraseBlocks() {
		return [
			{
				cadence: 'half',
				degrees: [0, 1, 3, 4],
				id: 'fallback-half',
				modes: ['major', 'minor'],
				weight: 1
			},
			{
				cadence: 'authentic',
				degrees: [0, 3, 4, 0],
				id: 'fallback-authentic',
				modes: ['major', 'minor'],
				weight: 1
			}
		];
	}

	global.CodaProgressionPhraseBlockSelector = {
		choose: choose,
		fallbackPhraseBlocks: fallbackPhraseBlocks,
		fitBlockToBars: fitBlockToBars
	};
})(window);
