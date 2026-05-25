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

	function retimeMeasureChords(measure, secondsPerBeat, options) {
		var chords = measure.chords || [];

		return retimeMeasureChordList(measure, chords, secondsPerBeat, options);
	}

	function retimeMeasureChordList(measure, chords, secondsPerBeat, options) {
		var durationPlan = chordDurationPlan(measure, chords, options);
		var startBeat = Number(measure.startBeat) || 0;
		var startSeconds = Number(measure.startSeconds) || 0;
		var result = [];

		for (var i = 0; i < chords.length; i++) {
			var durationBeats = durationPlan[i];
			var segment = segmentFromMeasure(chords[i], {
				chordIndex: i,
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				startBeat: startBeat,
				startSeconds: startSeconds
			});

			result.push(applyParentMelodySlice(segment, measure));
			startBeat += durationBeats;
			startSeconds += durationBeats * secondsPerBeat;
		}

		return result;
	}

	function applyParentMelodySlice(segment, measure) {
		var sourceEvents = measure && measure.melodyEvents;
		var slicedEvents;

		if (!sourceEvents || !sourceEvents.length) {
			return segment;
		}

		slicedEvents = sliceMelodyEventsForSegment(sourceEvents, measure, segment);
		if (!slicedEvents.length) {
			delete segment.melodyEvents;
			delete segment.melodicStartType;
			return segment;
		}

		segment.melodyEvents = slicedEvents;
		segment.melodicVoiceIndex = measure.melodicVoiceIndex;
		segment.melodicStartType = measure.melodicStartType;
		segment.melody = measure.melody;

		return segment;
	}

	function sliceMelodyEventsForSegment(events, measure, segment) {
		var parentStart = Number(measure && measure.startSeconds) || 0;
		var segmentStart = Number(segment && segment.startSeconds) || parentStart;
		var segmentEnd = segmentStart + (Number(segment && segment.durationSeconds) || 0);
		var result = [];

		for (var i = 0; i < (events || []).length; i++) {
			var eventStart = parentStart + (Number(events[i].delaySeconds) || 0);
			var eventEnd = eventStart + (Number(events[i].durationSeconds) || 0);
			var clippedStart = Math.max(eventStart, segmentStart);
			var clippedEnd = Math.min(eventEnd, segmentEnd);
			var event;

			if (clippedEnd <= clippedStart) {
				continue;
			}

			event = cloneMelodyEvent(events[i]);
			event.delaySeconds = clippedStart - segmentStart;
			event.durationSeconds = clippedEnd - clippedStart;
			result.push(event);
		}

		return result;
	}

	function cloneMelodyEvent(event) {
		var result = {};

		for (var key in event || {}) {
			if (Object.prototype.hasOwnProperty.call(event, key)) {
				result[key] = event[key];
			}
		}

		return result;
	}

	function chordDurationPlan(measure, chords, options) {
		var chordCount = Math.max(1, (chords || []).length);
		var durationBeats = Number(measure && measure.durationBeats) || 4;
		var pulseCount = Math.round(durationBeats);
		var durations;
		var remainder;
		var availableIndexes;
		var rng;

		if (Math.abs(durationBeats - pulseCount) > 0.001 || chordCount > pulseCount) {
			return proportionalDurationPlan(durationBeats, chordCount);
		}

		durations = [];
		for (var i = 0; i < chordCount; i++) {
			durations.push(Math.floor(pulseCount / chordCount));
		}

		remainder = pulseCount - (durations[0] * chordCount);
		availableIndexes = [];
		for (var j = 0; j < chordCount; j++) {
			availableIndexes.push(j);
		}

		rng = options && typeof options.rng === 'function' ? options.rng : deterministicRng(measure, chords);
		while (remainder > 0 && availableIndexes.length) {
			var pick = Math.min(availableIndexes.length - 1, Math.floor(rng() * availableIndexes.length));
			durations[availableIndexes.splice(pick, 1)[0]] += 1;
			remainder -= 1;
		}

		return durations;
	}

	function proportionalDurationPlan(durationBeats, chordCount) {
		var duration = durationBeats / chordCount;
		var durations = [];

		for (var i = 0; i < chordCount; i++) {
			durations.push(duration);
		}

		return durations;
	}

	function deterministicRng(measure, chords) {
		var seed = hashTimingSeed(measure, chords);

		return function () {
			seed = (seed * 1664525 + 1013904223) >>> 0;
			return seed / 4294967296;
		};
	}

	function hashTimingSeed(measure, chords) {
		var source = [
			measure && measure.bar,
			measure && measure.startBeat,
			measure && measure.durationBeats,
			(chords || []).map(function (chord) {
				return chord && (chord.chordName || chord.displayName || chord.degree || '');
			}).join('|')
		].join(':');
		var hash = 2166136261;

		for (var i = 0; i < source.length; i++) {
			hash ^= source.charCodeAt(i);
			hash = Math.imul(hash, 16777619);
		}

		return hash >>> 0;
	}

	function cloneMeasure(measure) {
		return measureCloneService.cloneMeasure(measure);
	}

	global.CodaProgressionMeasureSegments = {
		chordDurationPlan: chordDurationPlan,
		measureSegments: measureSegments,
		sliceMelodyEventsForSegment: sliceMelodyEventsForSegment,
		retimeMeasureChordList: retimeMeasureChordList,
		retimeMeasureChords: retimeMeasureChords,
		segmentFromMeasure: segmentFromMeasure
	};
})(window);
