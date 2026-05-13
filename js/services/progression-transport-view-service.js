// Updates visual transport state for progression playback.
(function (global) {
	'use strict';

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

	function setPlaybackHead(index, playing) {
		clearPlaybackHead();

		var measure = query('.measure[data-progression-index="' + index + '"]');

		if (measure) {
			measure.classList.add('isPlaybackHead');
			measure.classList.toggle('isPlaying', playing === true);
		}

		updateGoStartVisibility(index);
	}

	function clearActiveMeasure() {
		var measures = global.document ? global.document.querySelectorAll('.measure.isPlaying') : [];

		Array.prototype.forEach.call(measures, function (measure) {
			measure.classList.remove('isPlaying');
		});
	}

	function clearPlaybackHead() {
		var measures = global.document ? global.document.querySelectorAll('.measure.isPlaybackHead, .measure.isPlaying') : [];

		Array.prototype.forEach.call(measures, function (measure) {
			measure.classList.remove('isPlaybackHead');
			measure.classList.remove('isPlaying');
		});
	}

	function updateGoStartVisibility(index) {
		var button = query('.transportButton--goStart');

		if (button) {
			button.hidden = Number(index) <= 0;
		}
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	global.CodaProgressionTransportView = {
		clearActiveMeasure: clearActiveMeasure,
		clearPlaybackHead: clearPlaybackHead,
		setActiveMeasure: setActiveMeasure,
		setPlaybackHead: setPlaybackHead,
		setPlayingState: setPlayingState,
		updateGoStartVisibility: updateGoStartVisibility
	};
})(window);
