//****************************
//Javier Arce 2013-2021
//Esta obra está bajo licencia Creative Commons by-sa 4.0 International, Reconocimiento-Compartir igual
//https://creativecommons.org/licenses/by-sa/4.0/
//****************************

$(document).ready(function () {
	'use strict';

	var data = CodaData;
	var playbackService = CodaPlayback.create({
		channel: data.midi.channel,
		delay: data.midi.delay,
		initialMidiNote: data.midi.initialMidiNote,
		instrument: 'acoustic_grand_piano',
		midi: MIDI,
		notes: data.notes,
		soundfontUrl: './soundfont/',
		velocity: data.midi.velocity
	});

	CodaScaleReportController.initialize({
		$: $,
		application: CodaApplication,
		data: data,
		domain: CodaDomain,
		playbackService: playbackService,
		renderers: CodaRenderers,
		ui: CodaUi
	});

	playbackService.load();
});
