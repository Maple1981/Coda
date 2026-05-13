// Adds compatible secondary chords inside a progression measure.
(function (global) {
	'use strict';

	var additionalChordService = global.CodaProgressionAdditionalChord;
	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var segmentBuilder = global.CodaProgressionSegmentBuilder;

	function addMeasureChord(progression, measureIndex, options, dependencies) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var segments;
		var insertAfterIndex;
		var additionalChord;
		var additionalSegment;

		options = options || {};
		dependencies = dependencies || {};
		if (!progression || !measure) {
			return progression;
		}

		segments = measureTimelineService.measureSegments(measure);
		if (segments.length >= 4) {
			return progression;
		}

		insertAfterIndex = clampChordIndex(options.chordIndex, segments.length);
		additionalChord = additionalChordService.choose({
			buildChordPlan: dependencies.buildChordPlan,
			data: options.data,
			measure: segments[insertAfterIndex],
			nextMeasure: segments[insertAfterIndex + 1] || measures[index + 1] || null,
			progression: progression,
			progressionState: dependencies.normalizeProgressionState(options.progressionState || progression),
			report: options.report,
			rng: options.rng
		});

		if (!additionalChord) {
			return progression;
		}

		additionalSegment = segmentBuilder.fromPlan(segments[insertAfterIndex], additionalChord, {
			chordIndex: insertAfterIndex + 1,
			durationBeats: Number(segments[insertAfterIndex].durationBeats) || Number(measure.durationBeats) || Number(progression.beatsPerBar) || 4,
			durationSeconds: Number(segments[insertAfterIndex].durationSeconds) || Number(measure.durationSeconds) || 0,
			startBeat: Number(segments[insertAfterIndex].endBeat) || Number(segments[insertAfterIndex].startBeat) || Number(measure.startBeat) || 0,
			startSeconds: Number(segments[insertAfterIndex].endSeconds) || Number(segments[insertAfterIndex].startSeconds) || Number(measure.startSeconds) || 0
		});
		segments.splice(insertAfterIndex + 1, 0, additionalSegment);
		measures[index] = measureTimelineService.measureWithSegments(measure, segments, progression);

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

	function clampChordIndex(index, length) {
		var numericIndex = parseInt(index, 10);

		if (isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(Math.max(0, length - 1), numericIndex));
	}

	global.CodaProgressionMeasureChordAddition = {
		addMeasureChord: addMeasureChord
	};
})(window);
