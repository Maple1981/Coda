// Plays scheduled progression events through the active browser playback service.
(function (global) {
	'use strict';

	function play(playbackService, event) {
		if (!playbackService || !event) {
			return false;
		}

		if (event.mode === 'arpeggio') {
			playArpeggio(playbackService, event);
			return true;
		}

		if (event.midiNoteEvents && event.midiNoteEvents.length) {
			playMidiNoteEvents(playbackService, event);
			return true;
		}

		if (event.midiNotes && event.midiNotes.length) {
			playMidiChord(playbackService, event);
			return true;
		}

		if (typeof playbackService.playChordFromNames === 'function') {
			playbackService.playChordFromNames(event.notes, {
				delay: event.delay,
				duration: event.duration
			});
			return true;
		}

		return false;
	}

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

	function playMidiChord(playbackService, event) {
		if (typeof playbackService.playMidiChord === 'function') {
			playbackService.playMidiChord(event.midiNotes, {
				delay: event.delay,
				duration: event.duration
			});
			return;
		}

		if (typeof playbackService.playMidiNote !== 'function') {
			return;
		}

		for (var i = 0; i < event.midiNotes.length; i++) {
			playbackService.playMidiNote(event.midiNotes[i], {
				delay: event.delay,
				duration: event.duration
			});
		}
	}

	function playMidiNoteEvents(playbackService, event) {
		if (typeof playbackService.playMidiNote !== 'function') {
			playMidiChord(playbackService, event);
			return;
		}

		for (var i = 0; i < event.midiNoteEvents.length; i++) {
			playbackService.playMidiNote(event.midiNoteEvents[i].midiNote, {
				delay: event.delay,
				duration: event.midiNoteEvents[i].duration
			});
		}
	}

	function playArpeggio(playbackService, event) {
		var midiNotes;

		if (event.midiNotes && event.midiNotes.length) {
			midiNotes = event.midiNotes;
		} else if (typeof playbackService.chordNamesToMidi === 'function') {
			midiNotes = playbackService.chordNamesToMidi(event.notes, 0);
		}

		if (!midiNotes || !midiNotes.length || typeof playbackService.playMidiNote !== 'function') {
			if (typeof playbackService.playChordFromNames === 'function') {
				playbackService.playChordFromNames(event.notes, {
					delay: event.delay,
					duration: event.duration
				});
			}
			return;
		}

		for (var i = 0; i < midiNotes.length; i++) {
			playbackService.playMidiNote(midiNotes[i], {
				delay: event.delay + (event.arpeggioStep * i),
				duration: Math.max(0.1, event.duration - (event.arpeggioStep * i))
			});
		}
	}

	global.CodaProgressionEventPlayer = {
		asImmediateEvent: asImmediateEvent,
		play: play
	};
})(window);
