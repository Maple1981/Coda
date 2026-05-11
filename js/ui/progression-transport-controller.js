// Transport controls for progression preview and MIDI export.
(function (global) {
	'use strict';

	function initialize(options) {
		options = options || {};

		var root = query('#constructorProgresiones');
		var listenButton = query('.transportButton--listen');
		var exportButton = query('.transportButton--export');

		if (!root || root.getAttribute('data-coda-progression-transport') === 'true') {
			return null;
		}

		root.setAttribute('data-coda-progression-transport', 'true');

		if (listenButton) {
			listenButton.addEventListener('click', function () {
				togglePreview(options, listenButton);
			});
		}

		if (exportButton) {
			exportButton.addEventListener('click', function () {
				exportMidi(options);
			});
		}

		return {
			exportMidi: function () {
				exportMidi(options);
			},
			stop: function () {
				stopPreview(options, listenButton);
			},
			togglePreview: function () {
				togglePreview(options, listenButton);
			}
		};
	}

	function togglePreview(options, listenButton) {
		var playback = options.progressionPlayback;
		var progression = options.uiState ? options.uiState.getProgression() : null;

		if (!playback) {
			return;
		}

		if (playback.isPlaying && playback.isPlaying()) {
			stopPreview(options, listenButton);
			return;
		}

		if (!progression) {
			return;
		}

		playback.play(progression, {
			onComplete: function () {
				setPlayingState(listenButton, false, options.i18n);
				clearActiveMeasure();
			},
			onMeasureStart: function (measure) {
				setActiveMeasure(measure.bar);
			},
			onStart: function () {
				setPlayingState(listenButton, true, options.i18n);
			},
			onStop: function () {
				setPlayingState(listenButton, false, options.i18n);
				clearActiveMeasure();
			}
		});
	}

	function stopPreview(options, listenButton) {
		if (options.progressionPlayback && typeof options.progressionPlayback.stop === 'function') {
			options.progressionPlayback.stop();
		}

		setPlayingState(listenButton, false, options.i18n);
		clearActiveMeasure();
	}

	function exportMidi(options) {
		var selection = options.uiState ? options.uiState.getSelection() : null;
		var progression = options.uiState ? options.uiState.getProgression() : null;
		var midiFile;

		if (!progression || !options.application || typeof options.application.buildProgressionMidiFile !== 'function') {
			return;
		}

		midiFile = options.application.buildProgressionMidiFile({
			data: options.data,
			midiInstrument: selection ? selection.midiInstrument : null,
			progression: progression
		});

		downloadMidiFile(midiFile);
	}

	function downloadMidiFile(midiFile) {
		var blob;
		var link;
		var url;

		if (!midiFile || !midiFile.bytes || !global.document || typeof global.Blob !== 'function') {
			return;
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
	}

	function setPlayingState(button, playing, i18n) {
		var icon;
		var label;

		if (!button) {
			return;
		}

		button.classList.toggle('isPlaying', playing);
		button.setAttribute('aria-pressed', playing ? 'true' : 'false');
		icon = button.querySelector('.material-icons');
		label = button.querySelector('span[data-i18n="progression.listen"]');

		if (icon) {
			icon.textContent = playing ? 'stop' : 'play_arrow';
		}

		if (label) {
			label.textContent = playing ? translate(i18n, 'progression.stop') : translate(i18n, 'progression.listen');
		}
	}

	function setActiveMeasure(bar) {
		clearActiveMeasure();

		var measure = query('.measure[data-progression-bar="' + bar + '"]');

		if (measure) {
			measure.classList.add('isPlaying');
		}
	}

	function clearActiveMeasure() {
		var measures = global.document ? global.document.querySelectorAll('.measure.isPlaying') : [];

		Array.prototype.forEach.call(measures, function (measure) {
			measure.classList.remove('isPlaying');
		});
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	global.CodaProgressionTransport = {
		clearActiveMeasure: clearActiveMeasure,
		downloadMidiFile: downloadMidiFile,
		initialize: initialize,
		setActiveMeasure: setActiveMeasure,
		setPlayingState: setPlayingState
	};
})(window);
