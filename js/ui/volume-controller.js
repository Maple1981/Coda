// Control de volumen maestro para toda la preescucha de la aplicación.
(function (global) {
	'use strict';

	function initialize(options) {
		var $ = options.$;
		var playbackService = options.playbackService;
		var slider = $('#selectorVolumen');
		var output = $('#valorVolumen');

		if (!slider.length || !playbackService || typeof playbackService.setVolume !== 'function') {
			return;
		}

		function updateVolume() {
			var volume = playbackService.setVolume(slider.val());
			var label = Math.round(volume) + '%';

			output.text(label);
			slider.attr('aria-valuetext', label);
		}

		slider.on('input change', updateVolume);
		updateVolume();
	}

	global.CodaVolumeControl = {
		initialize: initialize
	};
})(window);
