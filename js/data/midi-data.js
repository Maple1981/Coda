// Configuración MIDI y presets de soundfont disponibles para playback.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	global.CodaDataCatalogs.midi = {
		channel: 0,
		delay: 0,
		initialMidiNote: 60, // En notación científica MIDI, C4 = 60.
		note: -1,
		velocity: 127
	};

	global.CodaDataCatalogs.midiInstruments = [
		{
			id: 'acoustic_grand_piano',
			nombre: 'Piano acústico',
			family: 'piano',
			sustained: false
		},
		{
			id: 'drawbar_organ',
			nombre: 'Órgano drawbar',
			family: 'organ',
			sustained: true
		}
	];
})(window);
