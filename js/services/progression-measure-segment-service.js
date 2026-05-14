// Segment and retiming helpers for split progression measures.
(function (global) {
	'use strict';

	var measureCloneService = global.CodaProgressionMeasureClone;

	function measureSegments(measure) {
		if (measure && measure.chords && measure.chords.length) {
			return measure.chords.map(cloneMeasure);
		}

		return measure ? [segmentFromMeasure(measure, {
			chordIndex: 0,
			durationBeats: Number(measure.durationBeats) || 4,
			durationSeconds: Number(measure.durationSeconds) || 0,
			startBeat: Number(measure.startBeat) || 0,
			startSeconds: Number(measure.startSeconds) || 0
		})] : [];
	}

	function segmentFromMeasure(measure, timing) {
		var segment = cloneMeasure(measure);

		delete segment.chords;
		return measureCloneService.extendObject(segment, {
			chordIndex: timing.chordIndex,
			durationBeats: timing.durationBeats,
			durationSeconds: timing.durationSeconds,
			endBeat: timing.startBeat + timing.durationBeats,
			endSeconds: timing.startSeconds + timing.durationSeconds,
			startBeat: timing.startBeat,
			startSeconds: timing.startSeconds
		});
	}

	function retimeMeasureChords(measure, secondsPerBeat) {
		var chords = measure.chords || [];

		return retimeMeasureChordList(measure, chords, secondsPerBeat);
	}

	function retimeMeasureChordList(measure, chords, secondsPerBeat) {
		var durationBeats = (Number(measure.durationBeats) || 4) / Math.max(1, chords.length);
		var result = [];

		for (var i = 0; i < chords.length; i++) {
			result.push(segmentFromMeasure(chords[i], {
				chordIndex: i,
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				startBeat: (Number(measure.startBeat) || 0) + (durationBeats * i),
				startSeconds: (Number(measure.startSeconds) || 0) + (durationBeats * secondsPerBeat * i)
			}));
		}

		return result;
	}

	function cloneMeasure(measure) {
		return measureCloneService.cloneMeasure(measure);
	}

	global.CodaProgressionMeasureSegments = {
		measureSegments: measureSegments,
		retimeMeasureChordList: retimeMeasureChordList,
		retimeMeasureChords: retimeMeasureChords,
		segmentFromMeasure: segmentFromMeasure
	};
})(window);
