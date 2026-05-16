// Builds chord playback events from scheduled progression measures.
(function (global) {
	'use strict';

	var noteEventService = global.CodaProgressionPlaybackNoteEvents;
	var articulationInstruments = global.CodaProgressionArticulationInstruments;
	var timingService = global.CodaProgressionPlaybackTiming;

	function buildMeasurePlaybackEvents(measure, index, startOffset, options) {
		var chords = measure.chords && measure.chords.length ? measure.chords : [measure];
		var events = [];

		for (var i = 0; i < chords.length; i++) {
			events.push(buildMeasurePlaybackEvent(chords[i], index, startOffset, options, i));
		}

		return events;
	}

	function buildMeasurePlaybackEvent(measure, index, startOffset, options, chordIndex) {
		var duration = timingService.playbackDuration(measure);
		var notes = timingService.notesForVoices(measure.notes, measure.voices);
		var midiNotes = timingService.notesForVoices(measure.midiNotes, measure.voices);
		var midiNoteEvents = noteEventService.build(measure, duration, options);
		var mode = timingService.isArpeggioArticulation(measure.articulation) ? 'arpeggio' : 'chord';
		var delay = Math.max(0, (measure.startSeconds || 0) - (startOffset || 0));
		var event = {
			arpeggioStep: timingService.arpeggioStepSeconds(measure),
			bar: measure.bar,
			degree: measure.degree,
			delay: Math.max(0, delay + expressiveDelay(measure, chordIndex)),
			duration: duration,
			index: index,
			mode: mode,
			notes: notes,
			velocity: expressiveVelocity(measure, chordIndex)
		};

		setHiddenStartOffset(event, startOffset || 0);

		if (chordIndex) {
			event.chordIndex = chordIndex;
		}

		if (mode === 'arpeggio') {
			event.arpeggioPattern = timingService.arpeggioPattern(measure.articulation);
			event.arpeggioOrder = timingService.arpeggioOrderIndexes(midiNotes.length || notes.length, measure.articulation, measure.bar);
		}

		addPlaybackInstrument(event, measure, options);

		if (midiNotes.length) {
			event.midiNotes = midiNotes;
		}

		if (midiNoteEvents.length) {
			event.midiNoteEvents = midiNoteEvents;
		}

		return event;
	}

	function addPlaybackInstrument(event, measure, options) {
		var instrumentId = articulationInstruments.resolveInstrumentId(options ? options.instrument : null, measure.articulation);

		if (instrumentId) {
			event.playbackInstrumentId = instrumentId;
		}
	}

	function setHiddenStartOffset(event, startOffset) {
		if (typeof Object.defineProperty === 'function') {
			Object.defineProperty(event, 'startOffset', {
				configurable: true,
				enumerable: false,
				value: startOffset,
				writable: true
			});
			return;
		}

		event.startOffset = startOffset;
	}

	function expressiveVelocity(measure, chordIndex) {
		var base = Math.max(1, Math.min(127, Number(measure.intensity) || 80));
		var humanization = Math.max(0, Math.min(100, Number(measure.humanization) || 0));
		var offset = humanization ? deterministicOffset(measure, chordIndex, 9) * Math.min(12, humanization / 8) : 0;

		return Math.max(1, Math.min(127, Math.round(base + offset)));
	}

	function expressiveDelay(measure, chordIndex) {
		return humanizedDelay(measure, chordIndex) + swingDelay(measure);
	}

	function humanizedDelay(measure, chordIndex) {
		var humanization = Math.max(0, Math.min(100, Number(measure.humanization) || 0));

		if (!humanization) {
			return 0;
		}

		return deterministicOffset(measure, chordIndex, 17) * Math.min(0.04, humanization / 2500);
	}

	function swingDelay(measure) {
		var swing = Math.max(0, Math.min(75, Number(measure.swing) || 0));
		var durationSeconds = Number(measure.durationSeconds) || 0;
		var durationBeats = Number(measure.durationBeats) || 0;
		var localBeat = Math.abs((Number(measure.startBeat) || 0) % (Number(measure.beatsPerBar) || 4));
		var fractional = localBeat - Math.floor(localBeat);

		if (!swing || Math.abs(fractional - 0.5) > 0.01 || !durationSeconds || !durationBeats) {
			return 0;
		}

		return (durationSeconds / durationBeats) * (swing / 100) * 0.33;
	}

	function deterministicOffset(measure, chordIndex, salt) {
		var seed = ((Number(measure.bar) || 0) * 31) + ((Number(chordIndex) || 0) * 11) + salt;
		var value = Math.sin(seed) * 10000;

		return (value - Math.floor(value)) * 2 - 1;
	}

	global.CodaProgressionPlaybackEventBuilder = {
		buildMeasurePlaybackEvent: buildMeasurePlaybackEvent,
		buildMeasurePlaybackEvents: buildMeasurePlaybackEvents,
		expressiveDelay: expressiveDelay,
		expressiveVelocity: expressiveVelocity
	};
})(window);
