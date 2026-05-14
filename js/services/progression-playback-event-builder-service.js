// Builds chord playback events from scheduled progression measures.
(function (global) {
	'use strict';

	var noteEventService = global.CodaProgressionPlaybackNoteEvents;
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
		var mode = measure.articulation === 'arpeggio' ? 'arpeggio' : 'chord';
		var event = {
			arpeggioStep: timingService.arpeggioStepSeconds(measure),
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

	global.CodaProgressionPlaybackEventBuilder = {
		buildMeasurePlaybackEvent: buildMeasurePlaybackEvent,
		buildMeasurePlaybackEvents: buildMeasurePlaybackEvents
	};
})(window);
