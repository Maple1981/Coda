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
			playableRange: { min: 21, max: 109 },
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
			playableRange: { min: 21, max: 108 },
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
			articulationInstruments: {
				arpeggio: 'percussive_organ',
				staccato: 'percussive_organ'
			},
			family: 'organ',
			pedalBehavior: 'sustain',
			playableRange: { min: 21, max: 108 },
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
			articulationInstruments: {
				arpeggio: 'pizzicato_strings',
				staccato: 'pizzicato_strings'
			},
			family: 'strings',
			pedalBehavior: 'sustain',
			playableRange: { min: 21, max: 108 },
			program: 48,
			soundEnvelope: 'sustained',
			supportsPedalHold: true,
			usage: ['progressions'],
			viewInstrument: '1',
			sustained: true
		},
		{
			id: 'pad_2_warm',
			nombre: 'Pad cálido',
			family: 'synth-pad',
			pedalBehavior: 'sustain',
			playableRange: { min: 21, max: 108 },
			program: 89,
			soundEnvelope: 'sustained',
			supportsPedalHold: true,
			usage: ['progressions'],
			viewInstrument: '1',
			sustained: true
		}
	];

	global.CodaDataCatalogs.midiPlaybackInstruments = [
		{
			id: 'percussive_organ',
			nombre: 'Órgano percutivo',
			family: 'organ',
			pedalBehavior: 'reattack',
			playableRange: { min: 21, max: 108 },
			program: 17,
			soundEnvelope: 'percussive',
			supportsPedalHold: false,
			usage: ['articulation-playback'],
			viewInstrument: '1',
			sustained: false
		},
		{
			id: 'pizzicato_strings',
			nombre: 'Cuerdas pizzicato',
			family: 'strings',
			pedalBehavior: 'reattack',
			playableRange: { min: 21, max: 108 },
			program: 45,
			soundEnvelope: 'plucked',
			supportsPedalHold: false,
			usage: ['articulation-playback'],
			viewInstrument: '1',
			sustained: false
		}
	];
})(window);
