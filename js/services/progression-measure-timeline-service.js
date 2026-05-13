// Measure cloning, segmentation and timing utilities for progression editing.
(function (global) {
	'use strict';

	function rebuildTimeline(progression, measures) {
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
				measure.chords = retimeMeasureChords(measure, secondsPerBeat);
			}
			rebuiltMeasures.push(measure);
		}

		return extendObject(progression, {
			bars: rebuiltMeasures.length,
			measures: rebuiltMeasures,
			totalBeats: rebuiltMeasures.length * beatsPerBar,
			totalSeconds: rebuiltMeasures.length * beatsPerBar * secondsPerBeat
		});
	}

	function cloneMeasure(measure) {
		var clone = {};

		for (var key in measure) {
			if (Object.prototype.hasOwnProperty.call(measure, key)) {
				if ((key === 'notes' || key === 'midiNotes') && measure[key]) {
					clone[key] = measure[key].slice();
				} else if (key === 'chords' && measure[key]) {
					clone[key] = measure[key].map(cloneMeasure);
				} else if (key === 'voiceNotes' && measure[key]) {
					clone[key] = cloneVoiceNotes(measure[key]);
				} else {
					clone[key] = measure[key];
				}
			}
		}

		return clone;
	}

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

	function measureWithSegments(measure, segments, progression) {
		var rebuiltMeasure = cloneMeasure(measure);
		var secondsPerBeat = Number(progression.secondsPerBeat) || 60 / (Number(progression.bpm) || 120);

		if (!segments.length) {
			return rebuiltMeasure;
		}

		rebuiltMeasure = copySegmentToMeasure(rebuiltMeasure, segments[0]);
		if (segments.length === 1) {
			delete rebuiltMeasure.chords;
			return rebuiltMeasure;
		}

		rebuiltMeasure.chords = retimeMeasureChordList(rebuiltMeasure, segments, secondsPerBeat);

		return rebuiltMeasure;
	}

	function segmentFromMeasure(measure, timing) {
		var segment = cloneMeasure(measure);

		delete segment.chords;
		return extendObject(segment, {
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

	function copySegmentToMeasure(measure, segment) {
		var keys = [
			'chord',
			'chordKind',
			'chordName',
			'degree',
			'displayName',
			'inversion',
			'inversionIndex',
			'midiNotes',
			'notes',
			'source',
			'suspension',
			'tonalFunction',
			'voiceNotes',
			'voices'
		];

		for (var i = 0; i < keys.length; i++) {
			measure[keys[i]] = segment[keys[i]];
		}

		return measure;
	}

	function cloneVoiceNotes(voiceNotes) {
		var result = [];

		for (var i = 0; i < voiceNotes.length; i++) {
			result.push(extendObject({}, voiceNotes[i]));
		}

		return result;
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
