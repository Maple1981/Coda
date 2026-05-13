// Builds playback and metronome schedules for generated progressions.
(function (global) {
	'use strict';

	function buildProgressionPlaybackSchedule(progression, options) {
		var measures = progression && progression.measures ? progression.measures : [];
		var startIndex = normalizeStartIndex(options ? options.startIndex : 0, progression);
		var startOffset = measures[startIndex] ? Number(measures[startIndex].startSeconds) || 0 : 0;
		var schedule = [];

		for (var i = startIndex; i < measures.length; i++) {
			schedule = schedule.concat(buildMeasurePlaybackEvents(measures[i], i, startOffset, options));
		}

		return schedule;
	}

	function buildProgressionMetronomeSchedule(progression, options) {
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

	function buildScheduledMeasures(progression, startIndex) {
		var measures = progression && progression.measures ? progression.measures : [];
		startIndex = normalizeStartIndex(startIndex, progression);

		var startOffset = measures[startIndex] ? Number(measures[startIndex].startSeconds) || 0 : 0;
		var scheduledMeasures = [];

		for (var i = startIndex; i < measures.length; i++) {
			scheduledMeasures.push({
				delay: Math.max(0, (Number(measures[i].startSeconds) || 0) - startOffset),
				index: i,
				measure: measures[i]
			});
		}

		return scheduledMeasures;
	}

	function buildMeasurePlaybackEvents(measure, index, startOffset, options) {
		var chords = measure.chords && measure.chords.length ? measure.chords : [measure];
		var events = [];

		for (var i = 0; i < chords.length; i++) {
			events.push(buildMeasurePlaybackEvent(chords[i], index, startOffset, options, i));
		}

		return events;
	}

	function buildMeasurePlaybackEvent(measure, index, startOffset, options, chordIndex) {
		var duration = playbackDuration(measure);
		var notes = notesForVoices(measure.notes, measure.voices);
		var midiNotes = notesForVoices(measure.midiNotes, measure.voices);
		var midiNoteEvents = buildMidiNoteEvents(measure, duration, options);
		var mode = measure.articulation === 'arpeggio' ? 'arpeggio' : 'chord';
		var event = {
			arpeggioStep: arpeggioStepSeconds(measure),
			bar: measure.bar,
			degree: measure.degree,
			delay: Math.max(0, (measure.startSeconds || 0) - (startOffset || 0)),
			duration: duration,
			index: index,
			mode: mode,
			notes: notes
		};

		if (chordIndex) {
			event.chordIndex = chordIndex;
		}

		if (midiNotes.length) {
			event.midiNotes = midiNotes;
		}

		if (midiNoteEvents.length) {
			event.midiNoteEvents = midiNoteEvents;
		}

		return event;
	}

	function buildMidiNoteEvents(measure, duration, options) {
		var midiNotes = notesForVoices(measure.midiNotes, measure.voices);
		var events = [];

		if (!hasPedals(measure) || !supportsPedalHold(options ? options.instrument : null)) {
			return events;
		}

		for (var i = 0; i < midiNotes.length; i++) {
			if (isPedalIn(midiNotes[i], measure)) {
				continue;
			}

			events.push({
				duration: duration + pedalOutDuration(midiNotes[i], measure),
				midiNote: midiNotes[i]
			});
		}

		return events;
	}

	function hasPedals(measure) {
		return (measure.pedalsIn && measure.pedalsIn.length) || (measure.pedalsOut && measure.pedalsOut.length);
	}

	function supportsPedalHold(instrument) {
		return instrument && (instrument.supportsPedalHold === true || instrument.sustained === true || instrument.pedalBehavior === 'sustain');
	}

	function isPedalIn(midiNote, measure) {
		var pedals = measure.pedalsIn || [];

		for (var i = 0; i < pedals.length; i++) {
			if (pedals[i].midiNote === midiNote) {
				return true;
			}
		}

		return false;
	}

	function pedalOutDuration(midiNote, measure) {
		var pedals = measure.pedalsOut || [];
		var duration = 0;

		for (var i = 0; i < pedals.length; i++) {
			if (pedals[i].midiNote === midiNote) {
				duration = Math.max(duration, Number(pedals[i].durationSeconds) || 0);
			}
		}

		return duration;
	}

	function playbackTotalSeconds(progression, scheduledMeasures) {
		var lastMeasure;

		if (!scheduledMeasures.length) {
			return 0;
		}

		lastMeasure = scheduledMeasures[scheduledMeasures.length - 1].measure;

		return scheduledMeasures[scheduledMeasures.length - 1].delay + (Number(lastMeasure.durationSeconds) || 0);
	}

	function normalizeStartIndex(startIndex, progression) {
		var measures = progression && progression.measures ? progression.measures : [];
		var numericIndex = parseInt(startIndex, 10);

		if (!measures.length || isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(measures.length - 1, numericIndex));
	}

	function notesForVoices(notes, voices) {
		var voiceCount = Math.max(1, Math.min(Number(voices) || 4, 6));

		return (notes || []).slice(0, voiceCount);
	}

	function playbackDuration(measure) {
		var duration = Number(measure && measure.durationSeconds) || 0;
		var factor = articulationDurationFactor(measure ? measure.articulation : null);

		return Math.max(0.1, duration * factor);
	}

	function articulationDurationFactor(articulation) {
		if (articulation === 'staccato') {
			return 0.45;
		}

		if (articulation === 'arpeggio') {
			return 0.9;
		}

		if (articulation === 'legato') {
			return 1;
		}

		return 0.95;
	}

	function arpeggioStepSeconds(measure) {
		var duration = Number(measure && measure.durationSeconds) || 0;

		return Math.max(0.05, Math.min(0.18, duration / 8));
	}

	global.CodaProgressionPlaybackSchedule = {
		articulationDurationFactor: articulationDurationFactor,
		buildProgressionMetronomeSchedule: buildProgressionMetronomeSchedule,
		buildProgressionPlaybackSchedule: buildProgressionPlaybackSchedule,
		buildScheduledMeasures: buildScheduledMeasures,
		normalizeStartIndex: normalizeStartIndex,
		notesForVoices: notesForVoices,
		playbackTotalSeconds: playbackTotalSeconds
	};
})(window);
