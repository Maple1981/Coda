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
		var chordPlayback = options.application.createChordPlayback({
			playbackService: playbackService
		});
		var instrumentPlayback = options.application.createInstrumentPlayback({
			playbackService: playbackService
		});
		var uiStateFactory = options.uiStateFactory || global.CodaUiState;
		var uiState = uiStateFactory.create({
			initialNotation: options.initialNotation,
			language: options.i18n && options.i18n.getLanguage ? options.i18n.getLanguage() : 'es'
		});

		var controller = options.controller.initialize({
			$: options.$,
			application: options.application,
			chordPlayback: chordPlayback,
			data: data,
			domain: options.domain,
			i18n: options.i18n,
			initialNotation: options.initialNotation,
			instrumentPlayback: instrumentPlayback,
			notation: options.notation,
			preferences: options.preferences,
			renderers: options.renderers,
			ui: options.ui,
			uiState: uiState
		});

		return {
			chordPlayback: chordPlayback,
			controller: controller,
			instrumentPlayback: instrumentPlayback,
			playbackService: playbackService,
			uiState: uiState
		};
	}

	global.CodaBootstrap = {
		start: start
	};
})(window);
