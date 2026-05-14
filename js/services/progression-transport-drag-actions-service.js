// Wires progression drag and drop callbacks to editing actions and playback head updates.
(function (global) {
	'use strict';

	function bind(options) {
		global.CodaProgressionTransportDrag.initialize({
			onMeasureChordDrop: function (measureIndex, fromChordIndex, toChordIndex) {
				global.CodaProgressionTransportPlayback.stop(options.transportOptions, options.listenButton, options.getPlaybackHeadIndex());
				global.CodaProgressionTransportActions.reorderMeasureChords(options.transportOptions, measureIndex, fromChordIndex, toChordIndex);
				options.setPlaybackHeadIndex(measureIndex);
				options.transportView.setPlaybackHead(measureIndex, false);
			},
			onMeasureDrop: function (fromIndex, toIndex) {
				global.CodaProgressionTransportPlayback.stop(options.transportOptions, options.listenButton, options.getPlaybackHeadIndex());
				global.CodaProgressionTransportActions.reorderProgression(options.transportOptions, fromIndex, toIndex);
				options.setPlaybackHeadIndex(toIndex);
				options.transportView.setPlaybackHead(toIndex, false);
			},
			root: options.root
		});
	}

	global.CodaProgressionTransportDragActions = {
		bind: bind
	};
})(window);
