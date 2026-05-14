// Wires fixed progression transport buttons to transport services.
(function (global) {
	'use strict';

	function bind(options) {
		options = options || {};

		if (options.goStartButton) {
			options.goStartButton.addEventListener('click', function () {
				global.CodaProgressionTransportPlayback.stop(options.transportOptions, options.listenButton, options.getPlaybackHeadIndex());
				options.setPlaybackHeadIndex(0);
				options.transportView.setPlaybackHead(0, false);
			});
		}

		if (options.listenButton) {
			options.listenButton.addEventListener('click', function () {
				global.CodaProgressionTransportPlayback.toggle(options.transportOptions, options.listenButton, options.getPlaybackHeadIndex(), options.setPlaybackHeadIndex);
			});
		}

		if (options.exportButton) {
			options.exportButton.addEventListener('click', function () {
				global.CodaProgressionMidiDownload.exportMidi(options.transportOptions);
			});
		}
	}

	global.CodaProgressionTransportButtons = {
		bind: bind
	};
})(window);
