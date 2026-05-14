// Normalizes scheduled progression playback events for immediate execution.
(function (global) {
	'use strict';

	function asImmediateEvent(event) {
		var immediateEvent = {
			arpeggioStep: event.arpeggioStep,
			bar: event.bar,
			degree: event.degree,
			delay: 0,
			duration: event.duration,
			mode: event.mode,
			notes: event.notes
		};

		if (event.midiNotes && event.midiNotes.length) {
			immediateEvent.midiNotes = event.midiNotes;
		}

		if (event.midiNoteEvents && event.midiNoteEvents.length) {
			immediateEvent.midiNoteEvents = event.midiNoteEvents;
		}

		return immediateEvent;
	}

	global.CodaProgressionPlaybackEventNormalizer = {
		asImmediateEvent: asImmediateEvent
	};
})(window);
