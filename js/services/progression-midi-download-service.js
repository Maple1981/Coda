// Builds and downloads progression MIDI files from the current UI state.
(function (global) {
	'use strict';

	function exportMidi(options) {
		var selection;
		var progression;
		var midiFile;

		options = options || {};
		selection = options.uiState ? options.uiState.getSelection() : null;
		progression = options.uiState ? options.uiState.getProgression() : null;

		if (!progression || !options.application || typeof options.application.buildProgressionMidiFile !== 'function') {
			return false;
		}

		midiFile = options.application.buildProgressionMidiFile({
			data: options.data,
			midiInstrument: selection ? selection.midiInstrument : null,
			progression: progression
		});

		return download(midiFile);
	}

	function download(midiFile) {
		var blob;
		var link;
		var url;

		if (!midiFile || !midiFile.bytes || !global.document || typeof global.Blob !== 'function') {
			return false;
		}

		blob = new global.Blob([midiFile.bytes], {
			type: midiFile.mimeType || 'audio/midi'
		});
		url = global.URL && typeof global.URL.createObjectURL === 'function' ? global.URL.createObjectURL(blob) : '';
		link = global.document.createElement('a');
		link.href = url;
		link.download = midiFile.fileName || 'coda-progression.mid';
		link.style.display = 'none';
		global.document.body.appendChild(link);
		link.click();
		global.document.body.removeChild(link);

		if (url && global.URL && typeof global.URL.revokeObjectURL === 'function') {
			global.URL.revokeObjectURL(url);
		}

		return true;
	}

	global.CodaProgressionMidiDownload = {
		download: download,
		exportMidi: exportMidi
	};
})(window);
