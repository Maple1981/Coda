// Application use case for sequenced progression playback.
(function (global) {
	'use strict';

	function createProgressionPlayback(options) {
		options = options || {};

		var playbackService = options.playbackService;
		var timerApi = options.timerApi || global;
		var activeRun = null;

		function play(progression, callbacks) {
			var schedule = buildProgressionPlaybackSchedule(progression);
			var run;

			callbacks = callbacks || {};

			if (!schedule.length || !playbackService) {
				return false;
			}

			stop();
			run = {
				callbacks: callbacks,
				timers: []
			};
			activeRun = run;
			runCallback(callbacks.onStart, progression);

			if (shouldLoadBeforePlayback()) {
				playbackService.load(function () {
					startRunPlayback(run, progression, schedule);
				});
				return true;
			}

			startRunPlayback(run, progression, schedule);

			return true;
		}

		function stop() {
			var run = activeRun;

			if (!run) {
				return false;
			}

			clearTimers(run.timers);
			activeRun = null;

			if (playbackService && typeof playbackService.stopAllNotes === 'function') {
				playbackService.stopAllNotes();
			}

			runCallback(run.callbacks.onStop);
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

		function startRunPlayback(run, progression, schedule) {
			if (activeRun !== run) {
				return;
			}

			for (var i = 0; i < schedule.length; i++) {
				playScheduledEvent(schedule[i]);
			}

			scheduleMeasureCallbacks(run, progression);
		}

		function playScheduledEvent(event) {
			if (event.mode === 'arpeggio') {
				playArpeggio(event);
				return;
			}

			if (typeof playbackService.playChordFromNames === 'function') {
				playbackService.playChordFromNames(event.notes, {
					delay: event.delay,
					duration: event.duration
				});
			}
		}

		function playArpeggio(event) {
			var midiNotes;

			if (typeof playbackService.chordNamesToMidi === 'function') {
				midiNotes = playbackService.chordNamesToMidi(event.notes, 0);
			}

			if (!midiNotes || !midiNotes.length || typeof playbackService.playMidiNote !== 'function') {
				if (typeof playbackService.playChordFromNames === 'function') {
					playbackService.playChordFromNames(event.notes, {
						delay: event.delay,
						duration: event.duration
					});
				}
				return;
			}

			for (var i = 0; i < midiNotes.length; i++) {
				playbackService.playMidiNote(midiNotes[i], {
					delay: event.delay + (event.arpeggioStep * i),
					duration: Math.max(0.1, event.duration - (event.arpeggioStep * i))
				});
			}
		}

		function scheduleMeasureCallbacks(run, progression) {
			var measures = progression && progression.measures ? progression.measures : [];
			var totalSeconds = progression ? progression.totalSeconds : 0;

			for (var i = 0; i < measures.length; i++) {
				scheduleTimer(run, measures[i].startSeconds, createMeasureStartCallback(run, measures[i], i));
			}

			scheduleTimer(run, totalSeconds, function () {
				if (activeRun !== run) {
					return;
				}

				activeRun = null;
				runCallback(run.callbacks.onComplete, progression);
			});
		}

		function createMeasureStartCallback(run, measure, index) {
			return function () {
				if (activeRun === run) {
					runCallback(run.callbacks.onMeasureStart, measure, index);
				}
			};
		}

		function scheduleTimer(run, seconds, callback) {
			var timerId;

			if (typeof timerApi.setTimeout !== 'function') {
				return;
			}

			timerId = timerApi.setTimeout(callback, Math.max(0, seconds * 1000));
			run.timers.push(timerId);
		}

		function clearTimers(timers) {
			if (typeof timerApi.clearTimeout !== 'function') {
				return;
			}

			for (var i = 0; i < timers.length; i++) {
				timerApi.clearTimeout(timers[i]);
			}
		}

		return {
			isPlaying: isPlaying,
			play: play,
			stop: stop
		};
	}

	function buildProgressionPlaybackSchedule(progression) {
		var measures = progression && progression.measures ? progression.measures : [];
		var schedule = [];

		for (var i = 0; i < measures.length; i++) {
			schedule.push(buildMeasurePlaybackEvent(measures[i]));
		}

		return schedule;
	}

	function buildMeasurePlaybackEvent(measure) {
		var duration = playbackDuration(measure);
		var notes = notesForVoices(measure.notes, measure.voices);
		var mode = measure.articulation === 'arpeggio' ? 'arpeggio' : 'chord';

		return {
			arpeggioStep: arpeggioStepSeconds(measure),
			bar: measure.bar,
			degree: measure.degree,
			delay: measure.startSeconds || 0,
			duration: duration,
			mode: mode,
			notes: notes
		};
	}

	function notesForVoices(notes, voices) {
		var voiceCount = Math.max(1, Math.min(Number(voices) || 4, 4));

		return (notes || []).slice(0, voiceCount);
	}

	function playbackDuration(measure) {
		var duration = Number(measure && measure.durationSeconds) || 0;
		var factor = articulationDurationFactor(measure ? measure.articulation : null);

		return Math.max(0.1, duration * factor);
	}

	function articulationDurationFactor(articulation) {
		if (articulation === 'staccato') {
			return 0.45;
		}

		if (articulation === 'arpeggio') {
			return 0.9;
		}

		if (articulation === 'legato') {
			return 1;
		}

		return 0.95;
	}

	function arpeggioStepSeconds(measure) {
		var duration = Number(measure && measure.durationSeconds) || 0;

		return Math.max(0.05, Math.min(0.18, duration / 8));
	}

	function runCallback(callback, value, index) {
		if (typeof callback === 'function') {
			callback(value, index);
		}
	}

	global.CodaApplication = global.CodaApplication || {};
	global.CodaApplication.articulationDurationFactor = articulationDurationFactor;
	global.CodaApplication.buildProgressionPlaybackSchedule = buildProgressionPlaybackSchedule;
	global.CodaApplication.createProgressionPlayback = createProgressionPlayback;
	global.CodaApplication.notesForVoices = notesForVoices;
})(window);
