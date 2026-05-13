// Application use case for sequenced progression playback.
(function (global) {
	'use strict';

	function createProgressionPlayback(options) {
		options = options || {};

		var playbackService = options.playbackService;
		var playbackSchedule = options.playbackSchedule || global.CodaProgressionPlaybackSchedule;
		var eventPlayer = options.eventPlayer || global.CodaProgressionEventPlayer;
		var playbackCallbacks = options.playbackCallbacks || global.CodaProgressionPlaybackCallbacks;
		var playbackTimers = options.playbackTimers || global.CodaProgressionPlaybackTimers.create(options.timerApi || global);
		var activeRun = null;

		function play(progression, callbacks) {
			callbacks = callbacks || {};

			var startIndex = playbackSchedule.normalizeStartIndex(callbacks.startIndex, progression);
			var schedule = playbackSchedule.buildProgressionPlaybackSchedule(progression, {
				instrument: playbackInstrumentAttributes(),
				startIndex: startIndex
			});
			var scheduledMeasures = playbackSchedule.buildScheduledMeasures(progression, startIndex);
			var run;

			if (!schedule.length || !playbackService) {
				return false;
			}

			stop();
			run = {
				callbacks: callbacks,
				timers: []
			};
			activeRun = run;
			playbackCallbacks.run(callbacks.onStart, progression, startIndex);

			if (shouldLoadBeforePlayback()) {
				playbackService.load(function () {
					startRunPlayback(run, progression, schedule, scheduledMeasures);
				});
				return true;
			}

			startRunPlayback(run, progression, schedule, scheduledMeasures);

			return true;
		}

		function stop() {
			var run = activeRun;

			if (!run) {
				return false;
			}

			playbackTimers.clear(run.timers);
			activeRun = null;

			if (playbackService && typeof playbackService.stopAllNotes === 'function') {
				playbackService.stopAllNotes();
			}

			playbackCallbacks.run(run.callbacks.onStop);
			return true;
		}

		function isPlaying() {
			return activeRun != null;
		}

		function shouldLoadBeforePlayback() {
			return playbackService &&
				typeof playbackService.isReady === 'function' &&
				typeof playbackService.load === 'function' &&
				!playbackService.isReady();
		}

		function playbackInstrumentAttributes() {
			if (playbackService && typeof playbackService.getInstrumentAttributes === 'function') {
				return playbackService.getInstrumentAttributes();
			}

			return null;
		}

		function startRunPlayback(run, progression, schedule, scheduledMeasures) {
			if (activeRun !== run) {
				return;
			}

			schedulePlaybackEvents(run, schedule);
			scheduleMetronomeEvents(run, progression, run.callbacks);
			scheduleMeasureCallbacks(run, progression, scheduledMeasures);
		}

		function schedulePlaybackEvents(run, schedule) {
			for (var i = 0; i < schedule.length; i++) {
				playbackTimers.schedule(run, schedule[i].delay, createPlaybackCallback(run, schedule[i]));
			}
		}

		function scheduleMetronomeEvents(run, progression, callbacks) {
			var schedule;

			if (!playbackService || typeof playbackService.playMetronomeClick !== 'function') {
				return;
			}

			schedule = playbackSchedule.buildProgressionMetronomeSchedule(progression, {
				startIndex: callbacks.startIndex
			});

			for (var i = 0; i < schedule.length; i++) {
				playbackTimers.schedule(run, schedule[i].delay, createMetronomeCallback(run, schedule[i]));
			}
		}

		function createMetronomeCallback(run, event) {
			return function () {
				if (activeRun === run && playbackCallbacks.shouldPlayMetronome(run.callbacks)) {
					playbackService.playMetronomeClick({
						accent: event.accent,
						bar: event.bar,
						beat: event.beat,
						delay: 0
					});
				}
			};
		}

		function createPlaybackCallback(run, event) {
			return function () {
				if (activeRun === run) {
					eventPlayer.play(playbackService, eventPlayer.asImmediateEvent(event));
				}
			};
		}

		function scheduleMeasureCallbacks(run, progression, scheduledMeasures) {
			var totalSeconds = playbackSchedule.playbackTotalSeconds(progression, scheduledMeasures);

			for (var i = 0; i < scheduledMeasures.length; i++) {
				playbackTimers.schedule(run, scheduledMeasures[i].delay, createMeasureStartCallback(run, scheduledMeasures[i].measure, scheduledMeasures[i].index));
			}

			playbackTimers.schedule(run, totalSeconds, function () {
				if (activeRun !== run) {
					return;
				}

				activeRun = null;

				if (playbackCallbacks.shouldLoop(run.callbacks)) {
					playbackCallbacks.run(run.callbacks.onCycleComplete, progression);
					play(progression, playbackCallbacks.extend(run.callbacks, {
						startIndex: 0
					}));
					return;
				}

				playbackCallbacks.run(run.callbacks.onComplete, progression);
			});
		}

		function createMeasureStartCallback(run, measure, index) {
			return function () {
				if (activeRun === run) {
					playbackCallbacks.run(run.callbacks.onMeasureStart, measure, index);
				}
			};
		}

		return {
			isPlaying: isPlaying,
			play: play,
			stop: stop
		};
	}

	global.CodaApplication = global.CodaApplication || {};
	global.CodaApplication.articulationDurationFactor = global.CodaProgressionPlaybackSchedule.articulationDurationFactor;
	global.CodaApplication.buildProgressionPlaybackSchedule = global.CodaProgressionPlaybackSchedule.buildProgressionPlaybackSchedule;
	global.CodaApplication.buildProgressionMetronomeSchedule = global.CodaProgressionPlaybackSchedule.buildProgressionMetronomeSchedule;
	global.CodaApplication.buildScheduledProgressionMeasures = global.CodaProgressionPlaybackSchedule.buildScheduledMeasures;
	global.CodaApplication.createProgressionPlayback = createProgressionPlayback;
	global.CodaApplication.notesForVoices = global.CodaProgressionPlaybackSchedule.notesForVoices;
})(window);
