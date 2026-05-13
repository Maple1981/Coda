// Wraps timer scheduling for progression playback runs.
(function (global) {
	'use strict';

	function create(timerApi) {
		timerApi = timerApi || global;

		function schedule(run, seconds, callback) {
			var timerId;

			if (!run || !run.timers || typeof timerApi.setTimeout !== 'function') {
				return;
			}

			timerId = timerApi.setTimeout(callback, Math.max(0, seconds * 1000));
			run.timers.push(timerId);
		}

		function clear(timers) {
			if (!timers || typeof timerApi.clearTimeout !== 'function') {
				return;
			}

			for (var i = 0; i < timers.length; i++) {
				timerApi.clearTimeout(timers[i]);
			}
		}

		return {
			clear: clear,
			schedule: schedule
		};
	}

	global.CodaProgressionPlaybackTimers = {
		create: create
	};
})(window);
