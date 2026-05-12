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
			pedalBehavior: 'reattack',
			program: 0,
			soundEnvelope: 'percussive',
			supportsPedalHold: false,
			usage: ['instrument-view', 'progressions'],
			viewInstrument: '1',
			sustained: false
		},
		{
			id: 'acoustic_guitar_nylon',
			nombre: 'Guitarra clásica',
			family: 'guitar',
			pedalBehavior: 'reattack',
			program: 24,
			soundEnvelope: 'plucked',
			supportsPedalHold: false,
			usage: ['instrument-view', 'progressions'],
			viewInstrument: '0',
			sustained: false
		},
		{
			id: 'drawbar_organ',
			nombre: 'Órgano drawbar',
			family: 'organ',
			pedalBehavior: 'sustain',
			program: 16,
			soundEnvelope: 'sustained',
			supportsPedalHold: true,
			usage: ['progressions'],
			viewInstrument: '1',
			sustained: true
		},
		{
			id: 'string_ensemble_1',
			nombre: 'Cuerdas',
			family: 'strings',
			pedalBehavior: 'sustain',
			program: 48,
			soundEnvelope: 'sustained',
			supportsPedalHold: true,
			usage: ['progressions'],
			viewInstrument: '1',
			sustained: true
		}
	];
})(window);
