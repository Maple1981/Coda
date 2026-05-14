// Adds compatible secondary chords inside a progression measure.
(function (global) {
	'use strict';

	var additionalChordService = global.CodaProgressionAdditionalChord;
	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var segmentBuilder = global.CodaProgressionSegmentBuilder;
	var structureIndex = global.CodaProgressionStructureIndex;

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
		return structureIndex.extendObject(target, values);
	}

	function clampMeasureIndex(index, length) {
		return structureIndex.clampMeasureIndex(index, length);
	}

	function clampChordIndex(index, length) {
		return structureIndex.clampChordIndex(index, length);
	}

	global.CodaProgressionMeasureChordAddition = {
		addMeasureChord: addMeasureChord
	};
})(window);
