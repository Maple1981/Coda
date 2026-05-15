// MIDI playback strategies for progression chord and arpeggio events.
(function (global) {
	'use strict';

	function playMidiChord(playbackService, event) {
		var options;

		if (typeof playbackService.playMidiChord === 'function') {
			options = withVelocity({
				delay: event.delay,
				duration: event.duration
			}, event.velocity);
			playbackService.playMidiChord(event.midiNotes, options);
			return true;
		}

		if (typeof playbackService.playMidiNote !== 'function') {
			return false;
		}

		for (var i = 0; i < event.midiNotes.length; i++) {
			playbackService.playMidiNote(event.midiNotes[i], withVelocity({
				delay: event.delay,
				duration: event.duration
			}, event.velocity));
		}

		return true;
	}

	function playMidiNoteEvents(playbackService, event) {
		if (typeof playbackService.playMidiNote !== 'function') {
			return playMidiChord(playbackService, event);
		}

		for (var i = 0; i < event.midiNoteEvents.length; i++) {
			playbackService.playMidiNote(event.midiNoteEvents[i].midiNote, withVelocity({
				delay: event.delay + (event.midiNoteEvents[i].delay || 0),
				duration: event.midiNoteEvents[i].duration
			}, event.midiNoteEvents[i].velocity || event.velocity));
		}

		return true;
	}

	function playArpeggio(playbackService, event) {
		var midiNotes;

		if (event.midiNotes && event.midiNotes.length) {
			midiNotes = event.midiNotes;
		} else if (typeof playbackService.chordNamesToMidi === 'function') {
			midiNotes = playbackService.chordNamesToMidi(event.notes, 0);
		}

		if (!midiNotes || !midiNotes.length || typeof playbackService.playMidiNote !== 'function') {
			return playChordFallback(playbackService, event);
		}

		for (var i = 0; i < midiNotes.length; i++) {
			playbackService.playMidiNote(midiNotes[i], withVelocity({
				delay: event.delay + (event.arpeggioStep * i),
				duration: Math.max(0.1, event.duration - (event.arpeggioStep * i))
			}, event.velocity));
		}

		return true;
	}

	function playChordFallback(playbackService, event) {
		if (typeof playbackService.playChordFromNames !== 'function') {
			return false;
		}

		playbackService.playChordFromNames(event.notes, withVelocity({
			delay: event.delay,
			duration: event.duration
		}, event.velocity));

		return true;
	}

	function withVelocity(options, velocity) {
		if (velocity != null) {
			options.velocity = velocity;
		}

		return options;
	}

	global.CodaProgressionMidiEventPlayer = {
		playArpeggio: playArpeggio,
		playChordFallback: playChordFallback,
		playMidiChord: playMidiChord,
		playMidiNoteEvents: playMidiNoteEvents
	};
})(window);
