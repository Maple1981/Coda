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

		var groups = groupedMidiNoteEvents(event);

		for (var i = 0; i < groups.length; i++) {
			if (groups[i].midiNotes.length > 1 && typeof playbackService.playMidiChord === 'function') {
				playbackService.playMidiChord(groups[i].midiNotes, withVelocity({
					delay: event.delay + groups[i].delay,
					duration: groups[i].duration,
					instrumentId: event.playbackInstrumentId
				}, groups[i].velocity));
				continue;
			}

			for (var j = 0; j < groups[i].midiNotes.length; j++) {
				playbackService.playMidiNote(groups[i].midiNotes[j], withVelocity({
					delay: event.delay + groups[i].delay,
					duration: groups[i].duration,
					instrumentId: event.playbackInstrumentId
				}, groups[i].velocity));
			}
		}

		return true;
	}

	function groupedMidiNoteEvents(event) {
		var groups = [];
		var indexes = {};
		var fallbackVelocity = event && event.velocity;
		var source = event && event.midiNoteEvents ? event.midiNoteEvents : [];

		for (var i = 0; i < source.length; i++) {
			if (source[i].midiNote == null) {
				continue;
			}

			var delay = Math.max(0, Number(source[i].delay) || 0);
			var duration = Math.max(0, Number(source[i].duration) || 0);
			var velocity = source[i].velocity || fallbackVelocity;
			var key = [delay.toFixed(6), duration.toFixed(6), velocity == null ? '' : String(velocity)].join('|');
			var groupIndex = indexes[key];

			if (groupIndex == null) {
				groupIndex = groups.length;
				indexes[key] = groupIndex;
				groups.push({
					delay: delay,
					duration: duration,
					midiNotes: [],
					velocity: velocity
				});
			}

			groups[groupIndex].midiNotes.push(source[i].midiNote);
		}

		return groups;
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
		groupedMidiNoteEvents: groupedMidiNoteEvents,
		playArpeggio: playArpeggio,
		playChordFallback: playChordFallback,
		playMidiChord: playMidiChord,
		playMidiNoteEvents: playMidiNoteEvents
	};
})(window);
