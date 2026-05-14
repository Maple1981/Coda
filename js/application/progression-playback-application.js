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
		var playbackRunner = options.playbackRunner || global.CodaProgressionPlaybackRunner;
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
			playbackRunner.start({
				eventPlayer: eventPlayer,
				getActiveRun: function () {
					return activeRun;
				},
				playAgain: play,
				playbackCallbacks: playbackCallbacks,
				playbackSchedule: playbackSchedule,
				playbackService: playbackService,
				playbackTimers: playbackTimers,
				progression: progression,
				run: run,
				schedule: schedule,
				scheduledMeasures: scheduledMeasures,
				setActiveRun: function (nextRun) {
					activeRun = nextRun;
				}
			});
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
