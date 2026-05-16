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

			if (shouldLoadBeforePlayback(schedule)) {
				loadBeforePlayback(schedule, function () {
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

		function shouldLoadBeforePlayback(schedule) {
			if (!playbackService || typeof playbackService.isReady !== 'function') {
				return false;
			}

			if (!playbackService.isReady()) {
				return true;
			}

			return requiredInstrumentIds(schedule).some(function (instrumentId) {
				return typeof playbackService.isInstrumentReady === 'function' && !playbackService.isInstrumentReady(instrumentId);
			});
		}

		function loadBeforePlayback(schedule, callback) {
			var instrumentIds = requiredInstrumentIds(schedule);

			if (playbackService && typeof playbackService.getInstrument === 'function') {
				instrumentIds.unshift(playbackService.getInstrument());
			}

			if (playbackService && typeof playbackService.loadInstruments === 'function') {
				playbackService.loadInstruments(instrumentIds, callback);
				return;
			}

			if (playbackService && typeof playbackService.load === 'function') {
				playbackService.load(callback);
			}
		}

		function requiredInstrumentIds(schedule) {
			var ids = [];
			var seen = {};

			for (var i = 0; i < (schedule || []).length; i++) {
				if (schedule[i].playbackInstrumentId && !seen[schedule[i].playbackInstrumentId]) {
					seen[schedule[i].playbackInstrumentId] = true;
					ids.push(schedule[i].playbackInstrumentId);
				}
			}

			return ids;
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
