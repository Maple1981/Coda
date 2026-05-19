// Measure timeline rebuild utilities for progression editing.
(function (global) {
	'use strict';

	var measureCloneService = global.CodaProgressionMeasureClone;
	var measureSegmentService = global.CodaProgressionMeasureSegments;

	function rebuildTimeline(progression, measures, options) {
		var secondsPerBeat = Number(progression.secondsPerBeat) || 60 / (Number(progression.bpm) || 120);
		var beatsPerBar = Number(progression.beatsPerBar) || 4;
		var rebuiltMeasures = [];

		for (var i = 0; i < measures.length; i++) {
			var startBeat = i * beatsPerBar;
			var durationBeats = Number(measures[i].durationBeats) || beatsPerBar;
			var measure = cloneMeasure(measures[i]);

			measure.bar = i + 1;
			measure.startBeat = startBeat;
			measure.endBeat = startBeat + durationBeats;
			measure.durationBeats = durationBeats;
			measure.durationSeconds = durationBeats * secondsPerBeat;
			measure.startSeconds = startBeat * secondsPerBeat;
			measure.endSeconds = measure.endBeat * secondsPerBeat;
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
