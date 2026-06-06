// Application use case for chord playback. UI code passes identifiers; this
// module translates them to note names and delegates to the playback service.
(function (global) {
	'use strict';

	function createChordPlayback(options) {
		return {
			playChordFromCellId: function (cellId, playbackOptions) {
				return playChordFromCellId({
					bassOctaveOffset: playbackOptions && playbackOptions.bassOctaveOffset,
					cellId: cellId,
					duration: playbackOptions && playbackOptions.duration,
					midiNotes: playbackOptions && playbackOptions.midiNotes,
					playbackService: options.playbackService
				});
			}
		};
	}

	function createInstrumentPlayback(options) {
		return {
			playMidiNote: function (midiNote, playbackOptions) {
				return playMidiNote({
					duration: playbackOptions && playbackOptions.duration,
					midiNote: midiNote,
					playbackService: options.playbackService
				});
			}
		};
	}

	function playChordFromCellId(options) {
		var noteNames = options.cellId.split('-').filter(function (noteName) {
			return noteName !== '';
		});
		var midiNotes = parseMidiNotes(options.midiNotes);

		if (midiNotes.length && typeof options.playbackService.playMidiChord === 'function') {
			options.playbackService.playMidiChord(midiNotes, {
				duration: options.duration != null ? options.duration : 0.75
			});

			return midiNotes;
		}

		options.playbackService.playChordFromNames(noteNames, {
			bassOctaveOffset: options.bassOctaveOffset != null ? options.bassOctaveOffset : -12,
			duration: options.duration != null ? options.duration : 0.75
		});

		return noteNames;
	}

	function parseMidiNotes(value) {
		var source = Array.isArray(value) ? value : String(value || '').split(',');
		var result = [];

		for (var i = 0; i < source.length; i++) {
			if (String(source[i]).trim() === '') {
				continue;
			}

			var midiNote = Number(source[i]);

			if (isFinite(midiNote)) {
				result.push(midiNote);
			}
		}

		return result;
	}

	function playMidiNote(options) {
		var noteNumber = Number(options.midiNote);

		if (isNaN(noteNumber)) {
			return null;
		}

		options.playbackService.playMidiNote(noteNumber, {
			duration: options.duration != null ? options.duration : 0.55
		});

		return noteNumber;
	}

	global.CodaApplication = global.CodaApplication || {};
	global.CodaApplication.createChordPlayback = createChordPlayback;
	global.CodaApplication.createInstrumentPlayback = createInstrumentPlayback;
	global.CodaApplication.playChordFromCellId = playChordFromCellId;
	global.CodaApplication.playMidiNote = playMidiNote;
	global.CodaApplication.parseChordMidiNotes = parseMidiNotes;
})(window);
