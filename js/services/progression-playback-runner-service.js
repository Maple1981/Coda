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
				scheduleInstrumentNoteCallbacks(args, nextEvent);
			}
		};
	}

	function scheduleInstrumentNoteCallbacks(args, event) {
		var noteEvents;

		if (!args.run || (!args.run.callbacks.onNoteStart && !args.run.callbacks.onNoteEnd)) {
			return;
		}

		noteEvents = instrumentNoteEvents(args, event);
		for (var i = 0; i < noteEvents.length; i++) {
			scheduleNoteStart(args, noteEvents[i]);
			scheduleNoteEnd(args, noteEvents[i]);
		}
	}

	function scheduleNoteStart(args, noteEvent) {
		args.playbackTimers.schedule(args.run, noteEvent.delay, function () {
			if (args.getActiveRun() === args.run) {
				args.playbackCallbacks.run(args.run.callbacks.onNoteStart, noteEvent.midiNotes);
			}
		});
	}

	function scheduleNoteEnd(args, noteEvent) {
		args.playbackTimers.schedule(args.run, noteEvent.delay + noteEvent.duration, function () {
			if (args.getActiveRun() === args.run) {
				args.playbackCallbacks.run(args.run.callbacks.onNoteEnd, noteEvent.midiNotes);
			}
		});
	}

	function instrumentNoteEvents(args, event) {
		if (event.midiNoteEvents && event.midiNoteEvents.length) {
			return midiNoteEvents(event.midiNoteEvents);
		}

		if (event.mode === 'arpeggio') {
			return arpeggioNoteEvents(args, event);
		}

		return chordNoteEvents(args, event);
	}

	function midiNoteEvents(events) {
		var result = [];

		for (var i = 0; i < events.length; i++) {
			if (events[i].midiNote != null) {
				result.push({
					delay: Math.max(0, Number(events[i].delay) || 0),
					duration: Math.max(0, Number(events[i].duration) || 0),
					midiNotes: [events[i].midiNote]
				});
			}
		}

		return result;
	}

	function arpeggioNoteEvents(args, event) {
		var midiNotes = midiNotesForEvent(args, event);
		var order = event.arpeggioOrder && event.arpeggioOrder.length ? event.arpeggioOrder : [];
		var step = Number(event.arpeggioStep) || 0;
		var result = [];
		var noteIndex;

		if (!midiNotes.length) {
			return result;
		}

		if (!order.length) {
			for (var i = 0; i < midiNotes.length; i++) {
				order.push(i);
			}
		}

		for (var j = 0; j < order.length; j++) {
			noteIndex = Math.max(0, Math.min(midiNotes.length - 1, order[j]));
			result.push({
				delay: Math.max(0, step * j),
				duration: Math.max(0.1, (Number(event.duration) || 0) - (step * j)),
				midiNotes: [midiNotes[noteIndex]]
			});
		}

		return result;
	}

	function chordNoteEvents(args, event) {
		var midiNotes = midiNotesForEvent(args, event);

		if (!midiNotes.length) {
			return [];
		}

		return [{
			delay: 0,
			duration: Math.max(0, Number(event.duration) || 0),
			midiNotes: midiNotes
		}];
	}

	function midiNotesForEvent(args, event) {
		if (event.midiNotes && event.midiNotes.length) {
			return event.midiNotes.slice();
		}

		if (
			args.playbackService &&
			typeof args.playbackService.chordNamesToMidi === 'function' &&
			event.notes &&
			event.notes.length
		) {
			return args.playbackService.chordNamesToMidi(event.notes, 0) || [];
		}

		return [];
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
