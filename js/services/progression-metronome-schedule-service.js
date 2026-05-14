// Builds metronome beat schedules for generated progressions.
(function (global) {
	'use strict';

	function build(progression, options) {
		var measures = progression && progression.measures ? progression.measures : [];
		var startIndex = normalizeStartIndex(options ? options.startIndex : 0, progression);
		var startOffset = measures[startIndex] ? Number(measures[startIndex].startSeconds) || 0 : 0;
		var secondsPerBeat = Number(progression && progression.secondsPerBeat) || secondsPerBeatFromProgression(progression);
		var schedule = [];

		for (var i = startIndex; i < measures.length; i++) {
			var measure = measures[i];
			var beats = Math.max(1, Math.round(Number(measure.durationBeats) || Number(progression.beatsPerBar) || 4));
			var measureDelay = Math.max(0, (Number(measure.startSeconds) || 0) - startOffset);

			for (var beat = 0; beat < beats; beat++) {
				schedule.push({
					accent: beat === 0,
					bar: measure.bar || i + 1,
					beat: beat + 1,
					delay: measureDelay + (beat * secondsPerBeat)
				});
			}
		}

		return schedule;
	}

	function secondsPerBeatFromProgression(progression) {
		var bpm = Number(progression && progression.bpm) || 120;

		return 60 / Math.max(1, bpm);
	}

	function normalizeStartIndex(startIndex, progression) {
		var measures = progression && progression.measures ? progression.measures : [];
		var numericIndex = parseInt(startIndex, 10);

		if (!measures.length || isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(measures.length - 1, numericIndex));
	}

	global.CodaProgressionMetronomeSchedule = {
		build: build
	};
})(window);
