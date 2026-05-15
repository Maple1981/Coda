const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {
	console,
	window: {}
};
context.window.window = context.window;
vm.createContext(context);

function runScript(relativePath) {
	const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
	vm.runInContext(source, context, { filename: relativePath });
}

runScript('js/services/progression-metronome-schedule-service.js');
runScript('js/services/progression-playback-note-event-service.js');
runScript('js/services/progression-playback-timing-service.js');
runScript('js/services/progression-playback-event-builder-service.js');
runScript('js/services/progression-playback-schedule-service.js');
runScript('js/services/progression-playback-event-normalizer-service.js');
runScript('js/services/progression-midi-event-player-service.js');
runScript('js/services/progression-event-player-service.js');
runScript('js/services/progression-playback-callbacks-service.js');
runScript('js/services/progression-playback-timer-service.js');
runScript('js/services/progression-playback-runner-service.js');
runScript('js/application/progression-playback-application.js');

const app = context.window.CodaApplication;
const progression = {
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			notes: ['C', 'E', 'G', 'B'],
			startSeconds: 0,
			voices: 4
		},
		{
			articulation: 'staccato',
			bar: 2,
			degree: 'IVJ',
			durationSeconds: 2,
			notes: ['F', 'A', 'C', 'E'],
			startSeconds: 2,
			voices: 3
		},
		{
			articulation: 'arpeggio',
			bar: 3,
			degree: 'VJ',
			durationSeconds: 2,
			notes: ['G', 'B', 'D', 'F'],
			startSeconds: 4,
			voices: 4
		}
	],
	totalSeconds: 6
};

const schedule = app.buildProgressionPlaybackSchedule(progression);

assert.deepEqual(schedule[0], {
	arpeggioStep: 0.18,
	bar: 1,
	degree: 'I',
	delay: 0,
	duration: 1.9,
	index: 0,
	mode: 'chord',
	notes: ['C', 'E', 'G', 'B'],
	velocity: 80
});
assert.deepEqual(schedule[1], {
	arpeggioStep: 0.18,
	bar: 2,
	degree: 'IVJ',
	delay: 2,
	duration: 0.9,
	index: 1,
	mode: 'chord',
	notes: ['F', 'A', 'C'],
	velocity: 80
});
assert.equal(schedule[2].mode, 'arpeggio');
assert.equal(schedule[2].duration, 1.8);
assert.deepEqual(schedule[2].notes, ['G', 'B', 'D', 'F']);

const splitSchedule = app.buildProgressionPlaybackSchedule({
	measures: [
		{
			bar: 1,
			chords: [
				{
					articulation: 'sustain',
					bar: 1,
					degree: 'I',
					durationSeconds: 1,
					notes: ['C', 'E', 'G'],
					startSeconds: 0,
					voices: 3
				},
				{
					articulation: 'sustain',
					bar: 1,
					degree: 'vi',
					durationSeconds: 1,
					notes: ['A', 'C', 'E'],
					startSeconds: 1,
					voices: 3
				}
			],
			durationSeconds: 2,
			startSeconds: 0
		}
	]
});
assert.deepEqual(splitSchedule.map(function (event) {
	return {
		chordIndex: event.chordIndex || 0,
		degree: event.degree,
		delay: event.delay,
		duration: event.duration,
		notes: event.notes,
		velocity: event.velocity
	};
}), [
	{ chordIndex: 0, degree: 'I', delay: 0, duration: 0.95, notes: ['C', 'E', 'G'], velocity: 80 },
	{ chordIndex: 1, degree: 'vi', delay: 1, duration: 0.95, notes: ['A', 'C', 'E'], velocity: 80 }
]);

const metronomeSchedule = app.buildProgressionMetronomeSchedule({
	beatsPerBar: 4,
	bpm: 120,
	measures: [
		{
			bar: 1,
			durationBeats: 4,
			startSeconds: 0
		},
		{
			bar: 2,
			durationBeats: 4,
			startSeconds: 2
		}
	],
	secondsPerBeat: 0.5
});
assert.deepEqual(metronomeSchedule.slice(0, 5), [
	{ accent: true, bar: 1, beat: 1, delay: 0 },
	{ accent: false, bar: 1, beat: 2, delay: 0.5 },
	{ accent: false, bar: 1, beat: 3, delay: 1 },
	{ accent: false, bar: 1, beat: 4, delay: 1.5 },
	{ accent: true, bar: 2, beat: 1, delay: 2 }
]);

const pluckedPedalSchedule = app.buildProgressionPlaybackSchedule({
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			midiNotes: [48, 52, 55],
			notes: ['C', 'E', 'G'],
			pedalsOut: [{ durationSeconds: 2, midiNote: 55, note: 'G', toBar: 2 }],
			startSeconds: 0,
			voices: 3
		},
		{
			articulation: 'sustain',
			bar: 2,
			degree: 'IV',
			durationSeconds: 2,
			midiNotes: [55, 60, 65],
			notes: ['G', 'C', 'F'],
			pedalsIn: [{ durationSeconds: 2, midiNote: 55, note: 'G', fromBar: 1 }],
			startSeconds: 2,
			voices: 3
		}
	]
}, {
	instrument: {
		pedalBehavior: 'reattack',
		supportsPedalHold: false
	}
});
assert.equal(pluckedPedalSchedule[0].midiNoteEvents, undefined);
assert.equal(pluckedPedalSchedule[1].midiNoteEvents, undefined);

const pedalSchedule = app.buildProgressionPlaybackSchedule({
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			midiNotes: [48, 52, 55],
			notes: ['C', 'E', 'G'],
			pedalsOut: [{ durationSeconds: 2, midiNote: 55, note: 'G', toBar: 2 }],
			startSeconds: 0,
			voices: 3
		},
		{
			articulation: 'sustain',
			bar: 2,
			degree: 'IV',
			durationSeconds: 2,
			midiNotes: [55, 60, 65],
			notes: ['G', 'C', 'F'],
			pedalsIn: [{ durationSeconds: 2, midiNote: 55, note: 'G', fromBar: 1 }],
			startSeconds: 2,
			voices: 3
		}
	]
}, {
	instrument: {
		pedalBehavior: 'sustain',
		supportsPedalHold: true
	}
});
assert.deepEqual(pedalSchedule[0].midiNoteEvents, [
	{ duration: 1.9, midiNote: 48 },
	{ duration: 1.9, midiNote: 52 },
	{ duration: 3.9, midiNote: 55 }
]);
assert.deepEqual(pedalSchedule[1].midiNoteEvents, [
	{ duration: 1.9, midiNote: 60 },
	{ duration: 1.9, midiNote: 65 }
]);
const passingSchedule = app.buildProgressionPlaybackSchedule({
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			midiNotes: [48, 52, 55, 60],
			notes: ['C', 'E', 'G'],
			passingNotes: [{ delaySeconds: 1, durationSeconds: 0.25, midiNote: 62, note: 'D' }],
			startSeconds: 0,
			voices: 4
		}
	]
});
assert.deepEqual(passingSchedule[0].midiNoteEvents, [
	{ duration: 1.9, midiNote: 48 },
	{ duration: 1.9, midiNote: 52 },
	{ duration: 1.9, midiNote: 55 },
	{ duration: 1.9, midiNote: 60 },
	{ delay: 1, duration: 0.25, kind: 'passing', midiNote: 62 }
]);
const passingPlaybackCalls = [];
context.window.CodaProgressionMidiEventPlayer.playMidiNoteEvents({
	playMidiNote: function (note, options) {
		passingPlaybackCalls.push({ note: note, options: options });
	}
}, {
	delay: 2,
	midiNoteEvents: passingSchedule[0].midiNoteEvents.slice(4)
});
assert.deepEqual(passingPlaybackCalls, [
	{ note: 62, options: { delay: 3, duration: 0.25 } }
]);

const partialSchedule = app.buildProgressionPlaybackSchedule(progression, { startIndex: 1 });
assert.deepEqual(partialSchedule.map(function (event) { return event.bar; }), [2, 3]);
assert.deepEqual(partialSchedule.map(function (event) { return event.delay; }), [0, 2]);
assert.deepEqual(app.buildScheduledProgressionMeasures(progression, 1).map(function (item) {
	return {
		bar: item.measure.bar,
		delay: item.delay,
		index: item.index
	};
}), [
	{ bar: 2, delay: 0, index: 1 },
	{ bar: 3, delay: 2, index: 2 }
]);
assert.deepEqual(app.notesForVoices(['C', 'E', 'G', 'B'], 1), ['C']);
assert.deepEqual(app.notesForVoices(['C', 'E', 'G', 'B'], 6), ['C', 'E', 'G', 'B']);
assert.deepEqual(app.notesForVoices(['C', 'E', 'G', 'B', 'D', 'A'], 6), ['C', 'E', 'G', 'B', 'D', 'A']);
assert.equal(app.articulationDurationFactor('legato'), 1);
assert.equal(app.articulationDurationFactor('staccato'), 0.45);

const chordCalls = [];
const noteCalls = [];
const metronomeCalls = [];
let stopped = false;
const timers = [];
const clearedTimers = [];
const playback = app.createProgressionPlayback({
	playbackService: {
		chordNamesToMidi: function (notes) {
			return notes.map(function (note, index) {
				return 60 + index;
			});
		},
		playChordFromNames: function (notes, options) {
			chordCalls.push({
				notes: notes,
				options: options
			});
		},
		playMidiNote: function (note, options) {
			noteCalls.push({
				note: note,
				options: options
			});
		},
		playMetronomeClick: function (options) {
			metronomeCalls.push(options);
		},
		stopAllNotes: function () {
			stopped = true;
		}
	},
	timerApi: {
		clearTimeout: function (timerId) {
			clearedTimers.push(timerId);
		},
		setTimeout: function (callback, milliseconds) {
			var timerId = timers.length + 1;

			timers.push({
				callback: callback,
				id: timerId,
				milliseconds: milliseconds
			});

			return timerId;
		}
	}
});

const activeBars = [];
let started = false;
let completed = false;
const playResult = playback.play(progression, {
	onComplete: function () {
		completed = true;
	},
	onMeasureStart: function (measure) {
		activeBars.push(measure.bar);
	},
	onStart: function () {
		started = true;
	},
	shouldPlayMetronome: function () {
		return true;
	}
});

assert.equal(playResult, true);
assert.equal(playback.isPlaying(), true);
assert.equal(started, true);
assert.deepEqual(chordCalls, []);
assert.deepEqual(noteCalls, []);
assert.deepEqual(timers.map(function (timer) { return timer.milliseconds; }).slice(0, 7), [0, 2000, 4000, 0, 500, 1000, 1500]);

runTimersAt(0);
assert.deepEqual(activeBars, [1]);
assert.deepEqual(chordCalls.map(function (call) { return call.notes; }), [['C', 'E', 'G', 'B']]);
assert.deepEqual(chordCalls.map(function (call) { return call.options.delay; }), [0]);
assert.deepEqual(chordCalls.map(function (call) { return call.options.duration; }), [1.9]);
assert.equal(metronomeCalls[0].accent, true);

runTimersAt(2000);
assert.deepEqual(activeBars, [1, 2]);
assert.deepEqual(chordCalls.map(function (call) { return call.notes; }), [['C', 'E', 'G', 'B'], ['F', 'A', 'C']]);
assert.deepEqual(chordCalls.map(function (call) { return call.options.delay; }), [0, 0]);
assert.deepEqual(chordCalls.map(function (call) { return call.options.duration; }), [1.9, 0.9]);

runTimersAt(4000);
assert.deepEqual(activeBars, [1, 2, 3]);
assert.deepEqual(noteCalls.map(function (call) { return call.note; }), [60, 61, 62, 63]);
assert.deepEqual(noteCalls.map(function (call) { return call.options.delay; }), [0, 0.18, 0.36, 0.54]);

assert.equal(completed, false);
runTimersAt(6000);
assert.equal(completed, true);
assert.equal(playback.isPlaying(), false);

playback.play(progression);
const chordCallsBeforeStop = chordCalls.length;
assert.equal(playback.stop(), true);
assert.equal(stopped, true);
assert.ok(clearedTimers.length >= 4);
assert.equal(playback.isPlaying(), false);
runTimersAt(0);
runTimersAt(2000);
runTimersAt(4000);
assert.equal(chordCalls.length, chordCallsBeforeStop);

let loadCallback = null;
let delayedChordCalls = 0;
const delayedPlayback = app.createProgressionPlayback({
	playbackService: {
		isReady: function () {
			return false;
		},
		load: function (callback) {
			loadCallback = callback;
		},
		playChordFromNames: function () {
			delayedChordCalls += 1;
		},
		stopAllNotes: function () {}
	},
	timerApi: {
		clearTimeout: function () {},
		setTimeout: function () {}
	}
});

assert.equal(delayedPlayback.play(progression), true);
assert.equal(delayedPlayback.stop(), true);
loadCallback();
assert.equal(delayedChordCalls, 0);

let loopStarted = 0;
let cycleCompleted = false;
let loopCompleted = false;
const loopTimers = [];
const loopPlayback = app.createProgressionPlayback({
	playbackService: {
		playChordFromNames: function () {},
		playMidiNote: function () {},
		stopAllNotes: function () {}
	},
	timerApi: {
		clearTimeout: function () {},
		setTimeout: function (callback, milliseconds) {
			loopTimers.push({
				callback: callback,
				milliseconds: milliseconds
			});
			return loopTimers.length;
		}
	}
});

loopPlayback.play(progression, {
	onComplete: function () {
		loopCompleted = true;
	},
	onCycleComplete: function () {
		cycleCompleted = true;
	},
	onStart: function () {
		loopStarted += 1;
	},
	shouldLoop: function () {
		return cycleCompleted === false;
	},
	startIndex: 1
});

assert.deepEqual(loopTimers.map(function (timer) { return timer.milliseconds; }).slice(0, 5), [0, 2000, 0, 2000, 4000]);
loopTimers.filter(function (timer) {
	return timer.milliseconds === 4000;
})[0].callback();
assert.equal(cycleCompleted, true);
assert.equal(loopCompleted, false);
assert.equal(loopStarted, 2);

let metronomeEnabled = false;
const hotMetronomeCalls = [];
const hotMetronomeTimers = [];
const hotMetronomePlayback = app.createProgressionPlayback({
	playbackService: {
		playChordFromNames: function () {},
		playMetronomeClick: function (options) {
			hotMetronomeCalls.push(options);
		},
		stopAllNotes: function () {}
	},
	timerApi: {
		clearTimeout: function () {},
		setTimeout: function (callback, milliseconds) {
			hotMetronomeTimers.push({
				callback: callback,
				milliseconds: milliseconds
			});
			return hotMetronomeTimers.length;
		}
	}
});

hotMetronomePlayback.play(progression, {
	shouldPlayMetronome: function () {
		return metronomeEnabled;
	}
});
hotMetronomeTimers.filter(function (timer) {
	return timer.milliseconds === 0;
}).forEach(function (timer) {
	timer.callback();
});
assert.equal(hotMetronomeCalls.length, 0);
metronomeEnabled = true;
hotMetronomeTimers.filter(function (timer) {
	return timer.milliseconds === 500;
}).forEach(function (timer) {
	timer.callback();
});
assert.equal(hotMetronomeCalls.length, 1);
metronomeEnabled = false;
hotMetronomeTimers.filter(function (timer) {
	return timer.milliseconds === 1000;
}).forEach(function (timer) {
	timer.callback();
});
assert.equal(hotMetronomeCalls.length, 1);

console.log('Progression playback tests passed');

function runTimersAt(milliseconds) {
	timers.filter(function (timer) {
		return timer.milliseconds === milliseconds;
	}).forEach(function (timer) {
		timer.callback();
	});
}
