// Measure timeline rebuild utilities for progression editing.
(function (global) {
	'use strict';

	var measureCloneService = global.CodaProgressionMeasureClone;
	var measureSegmentService = global.CodaProgressionMeasureSegments;
	var timingService = global.CodaProgressionTiming;

	function rebuildTimeline(progression, measures, options) {
		var secondsPerBeat = timingService.secondsPerBeat(progression);
		var beatsPerBar = timingService.beatsPerBar(progression);
		var rebuiltMeasures = [];

		for (var i = 0; i < measures.length; i++) {
			var measure = cloneMeasure(measures[i]);
			var timing = timingService.measureTiming(i, measure, progression);

			timingService.applyTiming(measure, timing);
			if (measure.chords && measure.chords.length) {
				measure.chords = retimeMeasureChords(measure, secondsPerBeat, options);
			}
			rebuiltMeasures.push(measure);
		}

		return measureCloneService.extendObject(progression, {
			bars: rebuiltMeasures.length,
			measures: rebuiltMeasures,
			totalBeats: rebuiltMeasures.length * beatsPerBar,
			totalSeconds: rebuiltMeasures.length * beatsPerBar * secondsPerBeat
		});
	}

	function cloneMeasure(measure) {
		return measureCloneService.cloneMeasure(measure);
	}

	function measureSegments(measure) {
		return measureSegmentService.measureSegments(measure);
	}

	function measureWithSegments(measure, segments, progression, options) {
		var rebuiltMeasure = cloneMeasure(measure);
		var secondsPerBeat = Number(progression.secondsPerBeat) || 60 / (Number(progression.bpm) || 120);

		if (!segments.length) {
			return rebuiltMeasure;
		}

		rebuiltMeasure = measureCloneService.copySegmentToMeasure(rebuiltMeasure, segments[0]);
		if (segments.length === 1) {
			delete rebuiltMeasure.chords;
			return rebuiltMeasure;
		}

		rebuiltMeasure.chords = retimeMeasureChordList(rebuiltMeasure, segments, secondsPerBeat, options);

		return rebuiltMeasure;
	}

	function segmentFromMeasure(measure, timing) {
		return measureSegmentService.segmentFromMeasure(measure, timing);
	}

	function retimeMeasureChords(measure, secondsPerBeat, options) {
		return measureSegmentService.retimeMeasureChords(measure, secondsPerBeat, options);
	}

	function retimeMeasureChordList(measure, chords, secondsPerBeat, options) {
		return measureSegmentService.retimeMeasureChordList(measure, chords, secondsPerBeat, options);
	}

	global.CodaProgressionMeasureTimeline = {
		cloneMeasure: cloneMeasure,
		measureSegments: measureSegments,
		measureWithSegments: measureWithSegments,
		rebuildTimeline: rebuildTimeline,
		retimeMeasureChordList: retimeMeasureChordList,
		retimeMeasureChords: retimeMeasureChords,
		segmentFromMeasure: segmentFromMeasure
	};
})(window);
