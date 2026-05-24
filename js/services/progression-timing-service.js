// Shared timing helpers for progression documents, measures and inner chords.
(function (global) {
	'use strict';

	function secondsPerBeat(progression, state) {
		var explicit = Number(progression && progression.secondsPerBeat);
		var bpm = Number(state && state.bpm) || Number(progression && progression.bpm) || 120;

		return explicit || 60 / bpm;
	}

	function beatsPerBar(progression, state) {
		return Number(state && state.beatsPerBar) || Number(progression && progression.beatsPerBar) || 4;
	}

	function beatUnit(progression, state) {
		return Number(state && state.beatUnit) || Number(progression && progression.beatUnit) || 4;
	}

	function measureTiming(index, measure, progression, state) {
		var barBeats = beatsPerBar(progression, state);
		var beatSeconds = secondsPerBeat(progression, state);
		var startBeat = index * barBeats;
		var durationBeats = Number(measure && measure.durationBeats) || barBeats;

		return {
			bar: index + 1,
			beatUnit: beatUnit(progression, state),
			beatsPerBar: barBeats,
			durationBeats: durationBeats,
			durationSeconds: durationBeats * beatSeconds,
			endBeat: startBeat + durationBeats,
			endSeconds: (startBeat + durationBeats) * beatSeconds,
			secondsPerBeat: beatSeconds,
			startBeat: startBeat,
			startSeconds: startBeat * beatSeconds
		};
	}

	function applyTiming(target, timing) {
		target.bar = timing.bar;
		target.beatUnit = timing.beatUnit;
		target.beatsPerBar = timing.beatsPerBar;
		target.durationBeats = timing.durationBeats;
		target.durationSeconds = timing.durationSeconds;
		target.endBeat = timing.endBeat;
		target.endSeconds = timing.endSeconds;
		target.secondsPerBeat = timing.secondsPerBeat;
		target.startBeat = timing.startBeat;
		target.startSeconds = timing.startSeconds;

		return target;
	}

	function copyTimingFields(target, source, fields) {
		fields = fields || timingFieldNames();

		for (var i = 0; i < fields.length; i++) {
			copyTimingField(target, source, fields[i]);
		}

		return target;
	}

	function copyTimingField(target, source, field) {
		if (source && source[field] != null) {
			target[field] = source[field];
		}
	}

	function timingFieldNames() {
		return [
			'bar',
			'beatUnit',
			'beatsPerBar',
			'bpm',
			'durationBeats',
			'durationSeconds',
			'endBeat',
			'endSeconds',
			'secondsPerBeat',
			'startBeat',
			'startSeconds'
		];
	}

	function isNondecreasingStartSeconds(measures) {
		for (var i = 1; i < (measures || []).length; i++) {
			if (Number(measures[i].startSeconds) < Number(measures[i - 1].startSeconds)) {
				return false;
			}
		}

		return true;
	}

	global.CodaProgressionTiming = {
		applyTiming: applyTiming,
		beatsPerBar: beatsPerBar,
		beatUnit: beatUnit,
		copyTimingFields: copyTimingFields,
		isNondecreasingStartSeconds: isNondecreasingStartSeconds,
		measureTiming: measureTiming,
		secondsPerBeat: secondsPerBeat,
		timingFieldNames: timingFieldNames
	};
})(window);
