// Builds playback and metronome schedules for generated progressions.
(function (global) {
	'use strict';

	var eventBuilder = global.CodaProgressionPlaybackEventBuilder;
	var metronomeScheduleService = global.CodaProgressionMetronomeSchedule;
	var timingService = global.CodaProgressionPlaybackTiming;

	function buildProgressionPlaybackSchedule(progression, options) {
		var measures = progression && progression.measures ? progression.measures : [];
		var startIndex = normalizeStartIndex(options ? options.startIndex : 0, progression);
		var startOffset = measures[startIndex] ? Number(measures[startIndex].startSeconds) || 0 : 0;
		var schedule = [];

		for (var i = startIndex; i < measures.length; i++) {
			schedule = schedule.concat(eventBuilder.buildMeasurePlaybackEvents(measures[i], i, startOffset, options));
		}

		return schedule;
	}

	function buildProgressionMetronomeSchedule(progression, options) {
		return metronomeScheduleService.build(progression, options);
	}

	function buildScheduledMeasures(progression, startIndex) {
		var measures = progression && progression.measures ? progression.measures : [];
		var normalizedStartIndex = normalizeStartIndex(startIndex, progression);
		var startOffset = measures[normalizedStartIndex] ? Number(measures[normalizedStartIndex].startSeconds) || 0 : 0;
		var scheduledMeasures = [];

		for (var i = normalizedStartIndex; i < measures.length; i++) {
			scheduledMeasures.push({
				delay: Math.max(0, (Number(measures[i].startSeconds) || 0) - startOffset),
				index: i,
				measure: measures[i]
			});
		}

		return scheduledMeasures;
	}

	function normalizeStartIndex(startIndex, progression) {
		return timingService.normalizeStartIndex(startIndex, progression);
	}

	function notesForVoices(notes, voices) {
		return timingService.notesForVoices(notes, voices);
	}

	function playbackTotalSeconds(progression, scheduledMeasures) {
		return timingService.playbackTotalSeconds(progression, scheduledMeasures);
	}

	function articulationDurationFactor(articulation) {
		return timingService.articulationDurationFactor(articulation);
	}

	function refreshPlaybackEvent(event, progression, options) {
		var measure = measureForPlaybackEvent(event, progression);
		var refreshed;

		if (!measure) {
			return event;
		}

		refreshed = eventBuilder.buildMeasurePlaybackEvent(measure, event.index, event.startOffset || 0, options || {}, event.chordIndex || 0);
		refreshed.delay = Math.max(0, (refreshed.delay || 0) - (event.delay || 0));

		return refreshed;
	}

	function measureForPlaybackEvent(event, progression) {
		var measures = progression && progression.measures ? progression.measures : [];
		var measure = measures[event && event.index];
		var chordIndex = event && event.chordIndex ? event.chordIndex : 0;

		if (!measure) {
			return null;
		}

		if (measure.chords && measure.chords.length) {
			return measure.chords[chordIndex] || measure.chords[0];
		}

		return measure;
	}

	global.CodaProgressionPlaybackSchedule = {
		articulationDurationFactor: articulationDurationFactor,
		buildProgressionMetronomeSchedule: buildProgressionMetronomeSchedule,
		buildProgressionPlaybackSchedule: buildProgressionPlaybackSchedule,
		buildScheduledMeasures: buildScheduledMeasures,
		normalizeStartIndex: normalizeStartIndex,
		notesForVoices: notesForVoices,
		playbackTotalSeconds: playbackTotalSeconds,
		refreshPlaybackEvent: refreshPlaybackEvent
	};
})(window);
