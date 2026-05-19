// Creates small derivative variations for cloned progression sections.
(function (global) {
	'use strict';

	var sectionDocument = global.CodaProgressionSectionDocument;

	function createVariationMeasures(sourceMeasures, generatedMeasures, rng) {
		var variation = sectionDocument.cloneMeasures(sourceMeasures);
		var count = variationChangeCount(variation.length, rng);
		var used = {};
		var index;
		var replacement;

		for (var i = 0; i < count && variation.length; i++) {
			index = variationIndex(variation.length, rng, used);
			used[index] = true;
			replacement = variationReplacementMeasure(index, sourceMeasures, generatedMeasures);
			if (replacement) {
				variation[index] = sectionDocument.cloneMeasures([replacement])[0];
			}
		}

		return variation;
	}

	function variationReplacementMeasure(index, sourceMeasures, generatedMeasures) {
		var sourceSignature = measureVisibleChordSignature(sourceMeasures[index]);
		var fallback;

		if (generatedMeasures[index] && measureVisibleChordSignature(generatedMeasures[index]) !== sourceSignature) {
			return generatedMeasures[index];
		}

		fallback = firstDifferentMeasure(sourceSignature, generatedMeasures);
		if (fallback) {
			return fallback;
		}

		return firstDifferentMeasure(sourceSignature, sourceMeasures, index);
	}

	function firstDifferentMeasure(sourceSignature, measures, excludedIndex) {
		for (var i = 0; i < (measures || []).length; i++) {
			if (i !== excludedIndex && measureVisibleChordSignature(measures[i]) !== sourceSignature) {
				return measures[i];
			}
		}

		return null;
	}

	function measureVisibleChordSignature(measure) {
		if (!measure) {
			return '';
		}

		if (measure.chords && measure.chords.length) {
			return measure.chords.map(measureVisibleChordSignature).join('|');
		}

		return [
			measure.displayName,
			measure.chordName,
			measure.label
		].join('::');
	}

	function variationChangeCount(length, rng) {
		var max = length >= 12 ? 3 : (length >= 6 ? 2 : 1);

		return 1 + Math.floor(rng() * max);
	}

	function variationIndex(length, rng, used) {
		var min = length > 3 ? 1 : 0;
		var max = length > 3 ? length - 2 : length - 1;
		var index = min + Math.floor(rng() * Math.max(1, max - min + 1));
		var guard = 0;

		while (used[index] && guard < length) {
			index += 1;
			if (index > max) {
				index = min;
			}
			guard += 1;
		}

		return index;
	}

	global.CodaProgressionSectionVariation = {
		createVariationMeasures: createVariationMeasures,
		measureVisibleChordSignature: measureVisibleChordSignature,
		variationChangeCount: variationChangeCount,
		variationIndex: variationIndex,
		variationReplacementMeasure: variationReplacementMeasure
	};
})(window);
