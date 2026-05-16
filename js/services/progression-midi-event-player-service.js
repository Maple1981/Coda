// MIDI playback strategies for progression chord and arpeggio events.
(function (global) {
	'use strict';

	var arpeggioPatterns = global.CodaProgressionArpeggioPatterns;

	function playMidiChord(playbackService, event) {
		var options;

		if (typeof playbackService.playMidiChord === 'function') {
			options = withVelocity({
				delay: event.delay,
				duration: event.duration,
				instrumentId: event.playbackInstrumentId
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
				duration: event.duration,
				instrumentId: event.playbackInstrumentId
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
				duration: event.midiNoteEvents[i].duration,
				instrumentId: event.playbackInstrumentId
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

		var order = event.arpeggioOrder && event.arpeggioOrder.length ? event.arpeggioOrder : arpeggioPatterns.orderIndexes(midiNotes.length, event.arpeggioPattern || event.articulation, event.bar);

		for (var i = 0; i < order.length; i++) {
			var noteIndex = Math.max(0, Math.min(midiNotes.length - 1, order[i]));

			playbackService.playMidiNote(midiNotes[noteIndex], withVelocity({
				delay: event.delay + (event.arpeggioStep * i),
				duration: Math.max(0.1, event.duration - (event.arpeggioStep * i)),
				instrumentId: event.playbackInstrumentId
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
			duration: event.duration,
			instrumentId: event.playbackInstrumentId
		}, event.velocity));

		return true;
	}

	function withVelocity(options, velocity) {
		if (!options.instrumentId) {
			delete options.instrumentId;
		}

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
