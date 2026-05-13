// Coordinates progression preview playback from the transport UI.
(function (global) {
	'use strict';

	function toggle(options, listenButton, playbackHeadIndex, setPlaybackHeadIndex) {
		var playback = options.progressionPlayback;
		var progression = options.uiState ? options.uiState.getProgression() : null;

		if (!playback) {
			return;
		}

		if (playback.isPlaying && playback.isPlaying()) {
			stop(options, listenButton, playbackHeadIndex);
			return;
		}

		if (!progression) {
			return;
		}

		play(options, listenButton, playbackHeadIndex, setPlaybackHeadIndex);
	}

	function play(options, listenButton, playbackHeadIndex, setPlaybackHeadIndex) {
		var playback = options.progressionPlayback;
		var progression = options.uiState ? options.uiState.getProgression() : null;

		if (!playback || !progression) {
			return false;
		}

		playbackHeadIndex = normalizeHeadIndex(playbackHeadIndex, progression);

		return playback.play(progression, {
			onComplete: function () {
				global.CodaProgressionTransportView.setPlayingState(listenButton, false, options.i18n);
				global.CodaProgressionTransportView.setPlaybackHead(playbackHeadIndex, false);
			},
			onCycleComplete: function () {
				playbackHeadIndex = 0;
				if (typeof setPlaybackHeadIndex === 'function') {
					setPlaybackHeadIndex(playbackHeadIndex);
				}
				global.CodaProgressionTransportView.setPlaybackHead(playbackHeadIndex, true);
			},
			onMeasureStart: function (measure, index) {
				playbackHeadIndex = index;
				if (typeof setPlaybackHeadIndex === 'function') {
					setPlaybackHeadIndex(index);
				}
				global.CodaProgressionTransportView.setPlaybackHead(index, true);
			},
			onStart: function () {
				global.CodaProgressionTransportView.setPlayingState(listenButton, true, options.i18n);
			},
			onStop: function () {
				global.CodaProgressionTransportView.setPlayingState(listenButton, false, options.i18n);
				global.CodaProgressionTransportView.setPlaybackHead(playbackHeadIndex, false);
			},
			shouldLoop: function () {
				return isLoopEnabled();
			},
			shouldPlayMetronome: function () {
				return isMetronomeEnabled();
			},
			startIndex: playbackHeadIndex
		});
	}

	function stop(options, listenButton, playbackHeadIndex) {
		if (options.progressionPlayback && typeof options.progressionPlayback.stop === 'function') {
			options.progressionPlayback.stop();
		}

		global.CodaProgressionTransportView.setPlayingState(listenButton, false, options.i18n);
		global.CodaProgressionTransportView.setPlaybackHead(playbackHeadIndex || 0, false);
	}

	function normalizeHeadIndex(index, progression) {
		var measures = progression && progression.measures ? progression.measures : [];
		var numericIndex = parseInt(index, 10);

		if (!measures.length || isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(measures.length - 1, numericIndex));
	}

	function isLoopEnabled() {
		var checkbox = query('#progressionLoop');

		return checkbox ? checkbox.checked === true : false;
	}

	function isMetronomeEnabled() {
		var checkbox = query('#progressionMetronome');

		return checkbox ? checkbox.checked === true : false;
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	global.CodaProgressionTransportPlayback = {
		normalizeHeadIndex: normalizeHeadIndex,
		play: play,
		stop: stop,
		toggle: toggle
	};
})(window);
