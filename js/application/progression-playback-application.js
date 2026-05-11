// Application use case for sequenced progression playback.
(function (global) {
	'use strict';

	function createProgressionPlayback(options) {
		options = options || {};

		var playbackService = options.playbackService;
		var timerApi = options.timerApi || global;
		var activeRun = null;

		function play(progression, callbacks) {
			callbacks = callbacks || {};

			var startIndex = normalizeStartIndex(callbacks.startIndex, progression);
			var schedule = buildProgressionPlaybackSchedule(progression, {
				startIndex: startIndex
			});
			var scheduledMeasures = buildScheduledMeasures(progression, startIndex);
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
			runCallback(callbacks.onStart, progression, startIndex);

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

		function startRunPlayback(run, progression, schedule, scheduledMeasures) {
			if (activeRun !== run) {
				return;
			}

			schedulePlaybackEvents(run, schedule);
			scheduleMeasureCallbacks(run, progression, scheduledMeasures);
		}

		function schedulePlaybackEvents(run, schedule) {
			for (var i = 0; i < schedule.length; i++) {
				scheduleTimer(run, schedule[i].delay, createPlaybackCallback(run, schedule[i]));
			}
		}

		function createPlaybackCallback(run, event) {
			return function () {
				if (activeRun === run) {
					playScheduledEvent(asImmediateEvent(event));
				}
			};
		}

		function asImmediateEvent(event) {
			return {
				arpeggioStep: event.arpeggioStep,
				bar: event.bar,
				degree: event.degree,
				delay: 0,
				duration: event.duration,
				mode: event.mode,
				notes: event.notes
			};
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

		function scheduleMeasureCallbacks(run, progression, scheduledMeasures) {
			var totalSeconds = playbackTotalSeconds(progression, scheduledMeasures);

			for (var i = 0; i < scheduledMeasures.length; i++) {
				scheduleTimer(run, scheduledMeasures[i].delay, createMeasureStartCallback(run, scheduledMeasures[i].measure, scheduledMeasures[i].index));
			}

			scheduleTimer(run, totalSeconds, function () {
				if (activeRun !== run) {
					return;
				}

				activeRun = null;

				if (shouldLoop(run.callbacks)) {
					runCallback(run.callbacks.onCycleComplete, progression);
					play(progression, extendCallbacks(run.callbacks, {
						startIndex: 0
					}));
					return;
				}

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

	function buildProgressionPlaybackSchedule(progression, options) {
		var measures = progression && progression.measures ? progression.measures : [];
		var startIndex = normalizeStartIndex(options ? options.startIndex : 0, progression);
		var startOffset = measures[startIndex] ? Number(measures[startIndex].startSeconds) || 0 : 0;
		var schedule = [];

		for (var i = startIndex; i < measures.length; i++) {
			schedule.push(buildMeasurePlaybackEvent(measures[i], i, startOffset));
		}

		return schedule;
	}

	function buildScheduledMeasures(progression, startIndex) {
		var measures = progression && progression.measures ? progression.measures : [];
		startIndex = normalizeStartIndex(startIndex, progression);

		var startOffset = measures[startIndex] ? Number(measures[startIndex].startSeconds) || 0 : 0;
		var scheduledMeasures = [];

		for (var i = startIndex; i < measures.length; i++) {
			scheduledMeasures.push({
				delay: Math.max(0, (Number(measures[i].startSeconds) || 0) - startOffset),
				index: i,
				measure: measures[i]
			});
		}

		return scheduledMeasures;
	}

	function buildMeasurePlaybackEvent(measure, index, startOffset) {
		var duration = playbackDuration(measure);
		var notes = notesForVoices(measure.notes, measure.voices);
		var mode = measure.articulation === 'arpeggio' ? 'arpeggio' : 'chord';

		return {
			arpeggioStep: arpeggioStepSeconds(measure),
			bar: measure.bar,
			degree: measure.degree,
			delay: Math.max(0, (measure.startSeconds || 0) - (startOffset || 0)),
			duration: duration,
			index: index,
			mode: mode,
			notes: notes
		};
	}

	function playbackTotalSeconds(progression, scheduledMeasures) {
		var lastMeasure;

		if (!scheduledMeasures.length) {
			return 0;
		}

		lastMeasure = scheduledMeasures[scheduledMeasures.length - 1].measure;

		return scheduledMeasures[scheduledMeasures.length - 1].delay + (Number(lastMeasure.durationSeconds) || 0);
	}

	function normalizeStartIndex(startIndex, progression) {
		var measures = progression && progression.measures ? progression.measures : [];
		var numericIndex = parseInt(startIndex, 10);

		if (!measures.length || isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(measures.length - 1, numericIndex));
	}

	function shouldLoop(callbacks) {
		if (callbacks && typeof callbacks.shouldLoop === 'function') {
			return callbacks.shouldLoop();
		}

		return callbacks && callbacks.loop === true;
	}

	function extendCallbacks(callbacks, values) {
		var result = {};
		var key;

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

	function notesForVoices(notes, voices) {
		var voiceCount = Math.max(1, Math.min(Number(voices) || 4, 6));

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
	global.CodaApplication.buildScheduledProgressionMeasures = buildScheduledMeasures;
	global.CodaApplication.createProgressionPlayback = createProgressionPlayback;
	global.CodaApplication.notesForVoices = notesForVoices;
})(window);
