// Structural editing operations for progression measures and split-measure chords.
(function (global) {
	'use strict';

	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var structureIndex = global.CodaProgressionStructureIndex;

	function reorderMeasures(progression, fromIndex, toIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var movedMeasure;

		fromIndex = clampMeasureIndex(fromIndex, measures.length);
		toIndex = clampMeasureIndex(toIndex, measures.length);

		if (!progression || !measures.length || fromIndex === toIndex) {
			return progression;
		}

		movedMeasure = measures.splice(fromIndex, 1)[0];
		measures.splice(toIndex, 0, movedMeasure);

		return measureTimelineService.rebuildTimeline(progression, measures);
	}

	function reorderMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var segments;
		var movedSegment;

		if (!progression || !measure || !measure.chords || measure.chords.length < 3) {
			return progression;
		}

		segments = measureTimelineService.measureSegments(measure);
		fromChordIndex = clampChordIndex(fromChordIndex, segments.length);
		toChordIndex = clampChordIndex(toChordIndex, segments.length);

		if (fromChordIndex === 0 || toChordIndex === 0 || fromChordIndex === toChordIndex) {
			return progression;
		}

		movedSegment = segments.splice(fromChordIndex, 1)[0];
		segments.splice(toChordIndex, 0, movedSegment);
		measures[index] = measureTimelineService.measureWithSegments(measure, segments, progression);

		return structureIndex.extendObject(progression, {
			measures: measures
		});
	}

	function removeMeasureChord(progression, measureIndex, chordIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var segments;
		var normalizedChordIndex;

		if (!progression || !measure || !measure.chords || measure.chords.length < 2) {
			return progression;
		}

		segments = measureTimelineService.measureSegments(measure);
		normalizedChordIndex = clampChordIndex(chordIndex, segments.length);
		if (normalizedChordIndex === 0) {
			return progression;
		}

		segments.splice(normalizedChordIndex, 1);
		measures[index] = measureTimelineService.measureWithSegments(measure, segments, progression);

		return structureIndex.extendObject(progression, {
			measures: measures
		});
	}

	function clampMeasureIndex(index, length) {
		return structureIndex.clampMeasureIndex(index, length);
	}

	function clampChordIndex(index, length) {
		return structureIndex.clampChordIndex(index, length);
	}

	global.CodaProgressionStructureEditing = {
		clampChordIndex: clampChordIndex,
		clampMeasureIndex: clampMeasureIndex,
		removeMeasureChord: removeMeasureChord,
		reorderMeasureChords: reorderMeasureChords,
		reorderMeasures: reorderMeasures
	};
})(window);
