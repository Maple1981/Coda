// Application adapter for exporting progressions as MIDI files.
(function (global) {
	'use strict';

	function build(options) {
		var midiExport = options.midiExport || global.CodaMidiExport;
		var instrument = findInstrument(options.data, options.midiInstrument);

		return midiExport.createProgressionMidiFile({
			channel: options.data && options.data.midi ? options.data.midi.channel : 0,
			fileName: options.fileName,
			initialMidiNote: options.data && options.data.midi ? options.data.midi.initialMidiNote : 60,
			instrument: instrument,
			notes: options.data ? options.data.notes : [],
			progression: options.progression,
			ticksPerBeat: options.ticksPerBeat,
			velocity: options.progression && options.progression.intensity ? options.progression.intensity : (options.data && options.data.midi ? options.data.midi.velocity : 96)
		});
	}

	function findInstrument(data, instrumentId) {
		var instruments = data && data.midiInstruments ? data.midiInstruments : [];

		for (var i = 0; i < instruments.length; i++) {
			if (instruments[i].id === instrumentId) {
				return instruments[i];
			}
		}

		return instruments.length ? instruments[0] : {};
	}

	global.CodaProgressionMidiFile = {
		build: build,
		findInstrument: findInstrument
	};
})(window);
