// Plays scheduled progression events through the active browser playback service.
(function (global) {
	'use strict';

	var eventNormalizer = global.CodaProgressionPlaybackEventNormalizer;
	var midiEventPlayer = global.CodaProgressionMidiEventPlayer;

	function play(playbackService, event) {
		if (!playbackService || !event) {
			return false;
		}

		if (event.midiNoteEvents && event.midiNoteEvents.length) {
			return midiEventPlayer.playMidiNoteEvents(playbackService, event);
		}

		if (event.mode === 'arpeggio') {
			return midiEventPlayer.playArpeggio(playbackService, event);
		}

		if (event.midiNotes && event.midiNotes.length) {
			return midiEventPlayer.playMidiChord(playbackService, event);
		}

		return midiEventPlayer.playChordFallback(playbackService, event);
	}

	function asImmediateEvent(event) {
		return eventNormalizer.asImmediateEvent(event);
	}

	global.CodaProgressionEventPlayer = {
		asImmediateEvent: asImmediateEvent,
		play: play
	};
})(window);
