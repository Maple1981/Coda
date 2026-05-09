// Composition root for the browser app. It wires concrete dependencies
// together and starts the legacy UI controller.
(function (global) {
	'use strict';

	function start(options) {
		var data = options.data;
		var playbackService = options.playbackFactory.create({
			channel: data.midi.channel,
			delay: data.midi.delay,
			initialMidiNote: data.midi.initialMidiNote,
			instrument: 'acoustic_grand_piano',
			midi: options.midi,
			notes: data.notes,
			soundfontUrl: './soundfont/',
			velocity: data.midi.velocity
		});

		var controller = options.controller.initialize({
			$: options.$,
			application: options.application,
			data: data,
			domain: options.domain,
			playbackService: playbackService,
			renderers: options.renderers,
			ui: options.ui
		});

		playbackService.load();

		return {
			controller: controller,
			playbackService: playbackService
		};
	}

	global.CodaBootstrap = {
		start: start
	};
})(window);
