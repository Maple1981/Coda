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
					playbackService: options.playbackService
				});
			}
		};
	}

	function playChordFromCellId(options) {
		var noteNames = options.cellId.split('-').filter(function (noteName) {
			return noteName !== '';
		});

		options.playbackService.playChordFromNames(noteNames, {
			bassOctaveOffset: options.bassOctaveOffset != null ? options.bassOctaveOffset : -12,
			duration: options.duration != null ? options.duration : 0.75
		});

		return noteNames;
	}

	global.CodaApplication = global.CodaApplication || {};
	global.CodaApplication.createChordPlayback = createChordPlayback;
	global.CodaApplication.playChordFromCellId = playChordFromCellId;
})(window);
