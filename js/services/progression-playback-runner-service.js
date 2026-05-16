// Schedules and runs a single progression playback pass.
(function (global) {
	'use strict';

	function start(args) {
		if (args.getActiveRun() !== args.run) {
			return;
		}

		schedulePlaybackEvents(args);
		scheduleMetronomeEvents(args);
		scheduleMeasureCallbacks(args);
	}

	function schedulePlaybackEvents(args) {
		for (var i = 0; i < args.schedule.length; i++) {
			args.playbackTimers.schedule(args.run, args.schedule[i].delay, createPlaybackCallback(args, args.schedule[i]));
		}
	}

	function scheduleMetronomeEvents(args) {
		var schedule;

		if (!args.playbackService || typeof args.playbackService.playMetronomeClick !== 'function') {
			return;
		}

		schedule = args.playbackSchedule.buildProgressionMetronomeSchedule(args.progression, {
			startIndex: args.run.callbacks.startIndex
		});

		for (var i = 0; i < schedule.length; i++) {
			args.playbackTimers.schedule(args.run, schedule[i].delay, createMetronomeCallback(args, schedule[i]));
		}
	}

	function scheduleMeasureCallbacks(args) {
		var totalSeconds = args.playbackSchedule.playbackTotalSeconds(args.progression, args.scheduledMeasures);

		for (var i = 0; i < args.scheduledMeasures.length; i++) {
			args.playbackTimers.schedule(args.run, args.scheduledMeasures[i].delay, createMeasureStartCallback(args, args.scheduledMeasures[i].measure, args.scheduledMeasures[i].index));
		}

		args.playbackTimers.schedule(args.run, totalSeconds, function () {
			if (args.getActiveRun() !== args.run) {
				return;
			}

			args.setActiveRun(null);

			if (args.playbackCallbacks.shouldLoop(args.run.callbacks)) {
				args.playbackCallbacks.run(args.run.callbacks.onCycleComplete, args.progression);
				args.playAgain(args.progression, args.playbackCallbacks.extend(args.run.callbacks, {
					startIndex: 0
				}));
				return;
			}

			args.playbackCallbacks.run(args.run.callbacks.onComplete, args.progression);
		});
	}

	function createPlaybackCallback(args, event) {
		return function () {
			var nextEvent;

			if (args.getActiveRun() === args.run) {
				nextEvent = refreshPlaybackEvent(args, event);
				args.eventPlayer.play(args.playbackService, args.eventPlayer.asImmediateEvent(nextEvent));
			}
		};
	}

	function refreshPlaybackEvent(args, event) {
		if (!args.playbackSchedule || typeof args.playbackSchedule.refreshPlaybackEvent !== 'function') {
			return event;
		}

		return args.playbackSchedule.refreshPlaybackEvent(event, args.progression, {
			instrument: args.getPlaybackInstrumentAttributes ? args.getPlaybackInstrumentAttributes() : null
		});
	}

	function createMetronomeCallback(args, event) {
		return function () {
			if (args.getActiveRun() === args.run && args.playbackCallbacks.shouldPlayMetronome(args.run.callbacks)) {
				args.playbackService.playMetronomeClick({
					accent: event.accent,
					bar: event.bar,
					beat: event.beat,
					delay: 0
				});
			}
		};
	}

	function createMeasureStartCallback(args, measure, index) {
		return function () {
			if (args.getActiveRun() === args.run) {
				args.playbackCallbacks.run(args.run.callbacks.onMeasureStart, measure, index);
			}
		};
	}

	global.CodaProgressionPlaybackRunner = {
		start: start
	};
})(window);
