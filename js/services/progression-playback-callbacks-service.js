// Normalizes runtime callbacks used by progression playback.
(function (global) {
	'use strict';

	function shouldLoop(callbacks) {
		if (callbacks && typeof callbacks.shouldLoop === 'function') {
			return callbacks.shouldLoop();
		}

		return callbacks && callbacks.loop === true;
	}

	function shouldPlayMetronome(callbacks) {
		if (callbacks && typeof callbacks.shouldPlayMetronome === 'function') {
			return callbacks.shouldPlayMetronome();
		}

		return callbacks && callbacks.metronome === true;
	}

	function extend(callbacks, values) {
		var result = {};
		var key;

		callbacks = callbacks || {};
		values = values || {};

		for (key in callbacks) {
			if (Object.prototype.hasOwnProperty.call(callbacks, key)) {
				result[key] = callbacks[key];
			}
		}

		for (key in values) {
			if (Object.prototype.hasOwnProperty.call(values, key)) {
				result[key] = values[key];
			}
		}

		return result;
	}

	function run(callback, value, index) {
		if (typeof callback === 'function') {
			callback(value, index);
		}
	}

	global.CodaProgressionPlaybackCallbacks = {
		extend: extend,
		run: run,
		shouldLoop: shouldLoop,
		shouldPlayMetronome: shouldPlayMetronome
	};
})(window);
