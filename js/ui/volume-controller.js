// Control de volumen maestro para toda la preescucha de la aplicación.
(function (global) {
	'use strict';

	function initialize(options) {
		var $ = options.$;
		var playbackService = options.playbackService;
		var preferences = options.preferences;
		var slider = $('#selectorVolumen');
		var output = $('#valorVolumen');
		var initialVolume = resolveInitialVolume(options);

		if (!slider.length || !playbackService || typeof playbackService.setVolume !== 'function') {
			return;
		}

		slider.val(initialVolume);

		function updateVolume(savePreference) {
			var volume = playbackService.setVolume(slider.val());
			var label = Math.round(volume) + '%';

			output.text(label);
			slider.attr('aria-valuetext', label);

			if (savePreference && preferences && typeof preferences.setValue === 'function') {
				preferences.setValue('volume', Math.round(volume));
			}
		}

		slider.on('input change', function () {
			updateVolume(true);
		});
		updateVolume(false);
	}

	function resolveInitialVolume(options) {
		var fallback = 100;

		if (options.playbackService && typeof options.playbackService.getVolume === 'function') {
			fallback = options.playbackService.getVolume();
		}

		if (options.initialVolume !== undefined) {
			return normalizeVolume(options.initialVolume, fallback);
		}

		if (options.preferences && typeof options.preferences.getValue === 'function') {
			return normalizeVolume(options.preferences.getValue('volume', fallback), fallback);
		}

		return normalizeVolume(fallback, 100);
	}

	function normalizeVolume(value, fallback) {
		var numericValue = Number(value);

		if (isNaN(numericValue)) {
			return fallback;
		}

		return Math.max(0, Math.min(100, Math.round(numericValue)));
	}

	global.CodaVolumeControl = {
		initialize: initialize
	};
})(window);
