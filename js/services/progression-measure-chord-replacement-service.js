// Replaces a chord inside a progression measure with a menu-selected variant.
(function (global) {
	'use strict';

	var replacementChordService = global.CodaProgressionReplacementChord;
	var segmentBuilder = global.CodaProgressionSegmentBuilder;

	function replaceMeasureChord(progression, measureIndex, chordIndex, replacement, options, dependencies) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var normalizedChordIndex = Math.max(0, parseInt(chordIndex, 10) || 0);
		var segment;
		var nextMeasure;
		var replacedSegment;

		options = options || {};
		replacement = replacement || {};
		dependencies = dependencies || {};
		if (!progression || !measure || replacement.degreeIndex == null) {
			return progression;
		}

		segment = measure.chords && measure.chords.length ? measure.chords[Math.min(normalizedChordIndex, measure.chords.length - 1)] : measure;
		nextMeasure = measures[index + 1] || null;
		replacedSegment = replacementChordService.buildSegment({
			buildChordPlan: dependencies.buildChordPlan,
			chordIndex: normalizedChordIndex,
			data: options.data,
			measure: measure,
			nextMeasure: nextMeasure,
			progression: progression,
			progressionState: dependencies.normalizeProgressionState(options.progressionState || progression),
			replacement: replacement,
			report: options.report,
			segment: segment
		});

		if (!replacedSegment) {
			return progression;
		}

		if (measure.chords && measure.chords.length) {
			measures[index] = segmentBuilder.replaceSplitMeasureSegment(measure, normalizedChordIndex, replacedSegment);
		} else {
			measures[index] = segmentBuilder.replaceWholeMeasure(measure, replacedSegment);
		}

		return extendObject(progression, {
			measures: measures
		});
	}

	function extendObject(target, values) {
		var result = {};
		var key;

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

	function clampMeasureIndex(index, length) {
		var numericIndex = parseInt(index, 10);

		if (isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(length - 1, numericIndex));
	}

	global.CodaProgressionMeasureChordReplacement = {
		replaceMeasureChord: replaceMeasureChord
	};
})(window);
