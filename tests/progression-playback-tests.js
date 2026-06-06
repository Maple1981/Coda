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
runScript('js/services/progression-arpeggio-pattern-service.js');
runScript('js/services/progression-articulation-instrument-service.js');
runScript('js/services/progression-playback-timing-service.js');
runScript('js/services/progression-playback-event-builder-service.js');
runScript('js/services/progression-playback-schedule-service.js');
runScript('js/services/progression-playback-event-normalizer-service.js');
runScript('js/services/progression-midi-event-player-service.js');
runScript('js/services/progression-event-player-service.js');
runScript('js/services/instrument-note-highlight-service.js');
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
			articulation: 'arpeggio_down',
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
const voiceNotesAuthoritativeSchedule = app.buildProgressionPlaybackSchedule({
	generateMelodicVoice: false,
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'iv',
			durationSeconds: 2,
			midiNotes: [62, 65],
			notes: ['A', 'C', 'D', 'F'],
			startSeconds: 0,
			voiceNotes: [
				{ midiNote: 57, note: 'A' },
				{ midiNote: 60, note: 'C' },
				{ midiNote: 62, note: 'D' },
				{ midiNote: 65, note: 'F' }
			],
			voices: 4
		}
	],
	totalSeconds: 2
});
assert.deepEqual(voiceNotesAuthoritativeSchedule[0].midiNotes, [57, 60, 62, 65]);
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
assert.equal(schedule[2].arpeggioPattern, 'down');
assert.deepEqual(schedule[2].arpeggioOrder, [3, 2, 1, 0]);
assert.deepEqual(context.window.CodaProgressionPlaybackTiming.arpeggioOrderIndexes(4, 'arpeggio_up_down'), [0, 1, 2, 3, 2, 1]);
assert.deepEqual(context.window.CodaProgressionPlaybackTiming.arpeggioOrderIndexes(4, 'arpeggio_alternate'), [0, 2, 1, 3]);
assert.deepEqual(context.window.CodaProgressionPlaybackTiming.arpeggioOrderIndexes(4, 'arpeggio_outside_in'), [0, 3, 1, 2]);

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
	{ duration: 4, midiNote: 55 }
]);
assert.deepEqual(pedalSchedule[1].midiNoteEvents, [
	{ duration: 1.9, midiNote: 60 },
	{ duration: 1.9, midiNote: 65 }
]);
const invalidIncomingPedalSchedule = app.buildProgressionPlaybackSchedule({
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			midiNotes: [48, 52, 55],
			notes: ['C', 'E', 'G'],
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
assert.deepEqual(invalidIncomingPedalSchedule[1].midiNoteEvents, [
	{ duration: 1.9, midiNote: 55 },
	{ duration: 1.9, midiNote: 60 },
	{ duration: 1.9, midiNote: 65 }
]);
const chainedSplitPedalMeasures = [
	{
		bar: 1,
		chords: [
			{
				articulation: 'sustain',
				bar: 1,
				durationSeconds: 1,
				midiNotes: [48, 52, 55],
				notes: ['C', 'E', 'G'],
				pedalsOut: [{ durationSeconds: 2, midiNote: 55, note: 'G', toBar: 1 }],
				startSeconds: 0,
				voiceNotes: [
					{ midiNote: 48, note: 'C', role: 'root' },
					{ midiNote: 52, note: 'E', role: 'third' },
					{ midiNote: 55, note: 'G', role: 'fifth' }
				],
				voices: 3
			},
			{
				articulation: 'sustain',
				bar: 1,
				durationSeconds: 1,
				midiNotes: [55, 60, 65],
				notes: ['G', 'C', 'F'],
				pedalsIn: [{ durationSeconds: 2, midiNote: 55, note: 'G', fromBar: 1 }],
				pedalsOut: [{ durationSeconds: 1, midiNote: 55, note: 'G', toBar: 1 }],
				startSeconds: 1,
				voiceNotes: [
					{ midiNote: 55, note: 'G', role: 'fifth' },
					{ midiNote: 60, note: 'C', role: 'root' },
					{ midiNote: 65, note: 'F', role: 'fourth' }
				],
				voices: 3
			},
			{
				articulation: 'sustain',
				bar: 1,
				durationSeconds: 1,
				midiNotes: [55, 62, 67],
				notes: ['G', 'D', 'G'],
				pedalsIn: [{ durationSeconds: 1, midiNote: 55, note: 'G', fromBar: 1 }],
				startSeconds: 2,
				voiceNotes: [
					{ midiNote: 55, note: 'G', role: 'root' },
					{ midiNote: 62, note: 'D', role: 'fifth' },
					{ midiNote: 67, note: 'G', role: 'root' }
				],
				voices: 3
			}
		],
		durationSeconds: 3,
		midiNotes: [48, 52, 55],
		startSeconds: 0
	}
];
const chainedSplitPedalSchedule = app.buildProgressionPlaybackSchedule({
	measures: chainedSplitPedalMeasures
}, {
	instrument: {
		pedalBehavior: 'sustain',
		supportsPedalHold: true
	}
});
assert.deepEqual(chainedSplitPedalSchedule[0].midiNoteEvents, [
	{ duration: 0.95, midiNote: 48 },
	{ duration: 0.95, midiNote: 52 },
	{ duration: 3, midiNote: 55 }
]);
assert.deepEqual(chainedSplitPedalSchedule[1].midiNoteEvents, [
	{ duration: 2, midiNote: 55 },
	{ duration: 0.95, midiNote: 60 },
	{ duration: 0.95, midiNote: 65 }
]);
assert.deepEqual(chainedSplitPedalSchedule[2].midiNoteEvents, [
	{ duration: 0.95, midiNote: 55 },
	{ duration: 0.95, midiNote: 62 },
	{ duration: 0.95, midiNote: 67 }
]);
const partialPedalSchedule = app.buildProgressionPlaybackSchedule({
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
	},
	startIndex: 1
});
assert.deepEqual(partialPedalSchedule[0].midiNoteEvents, [
	{ duration: 1.9, midiNote: 55 },
	{ duration: 1.9, midiNote: 60 },
	{ duration: 1.9, midiNote: 65 }
]);
const refreshedPartialPedalNoteCalls = [];
const refreshedPartialPedalTimers = [];
const refreshedPartialPedalPlayback = app.createProgressionPlayback({
	playbackService: {
		getInstrumentAttributes: function () {
			return {
				pedalBehavior: 'sustain',
				supportsPedalHold: true
			};
		},
		playMidiNote: function (note, options) {
			refreshedPartialPedalNoteCalls.push({ note: note, options: options });
		},
		stopAllNotes: function () {}
	},
	timerApi: {
		clearTimeout: function () {},
		setTimeout: function (callback, milliseconds) {
			refreshedPartialPedalTimers.push({
				callback: callback,
				milliseconds: milliseconds
			});
			return refreshedPartialPedalTimers.length;
		}
	}
});
refreshedPartialPedalPlayback.play({
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
	startIndex: 1
});
refreshedPartialPedalTimers.filter(function (timer) {
	return timer.milliseconds === 0;
}).forEach(function (timer) {
	timer.callback();
});
assert.deepEqual(refreshedPartialPedalNoteCalls.map(function (call) {
	return call.note;
}), [55, 60, 65]);
const passingSchedule = app.buildProgressionPlaybackSchedule({
	generateMelodicVoice: true,
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
const structuralMelodySchedule = app.buildProgressionPlaybackSchedule({
	generateMelodicVoice: true,
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			intensity: 120,
			melodicVoiceIndex: 3,
			midiNotes: [48, 52, 55, 60],
			notes: ['C', 'E', 'G', 'C'],
			startSeconds: 0,
			voiceNotes: [
				{ midiNote: 48, note: 'C' },
				{ midiNote: 52, note: 'E' },
				{ midiNote: 55, note: 'G' },
				{ midiNote: 60, note: 'C' }
			],
			voices: 4
		}
	]
});
assert.deepEqual(structuralMelodySchedule[0].midiNoteEvents.map(function (event) {
	return {
		duration: event.duration,
		kind: event.kind,
		midiNote: event.midiNote,
		velocity: event.velocity
	};
}), [
	{ duration: 1.9, kind: undefined, midiNote: 48, velocity: 58 },
	{ duration: 1.9, kind: undefined, midiNote: 52, velocity: 58 },
	{ duration: 1.9, kind: undefined, midiNote: 55, velocity: 58 },
	{ duration: 1.9, kind: 'melody-structural', midiNote: 72, velocity: 93 }
]);
const mutedStructuralMelodySchedule = app.buildProgressionPlaybackSchedule({
	generateMelodicVoice: false,
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			intensity: 120,
			melodicVoiceIndex: 3,
			midiNotes: [48, 52, 55, 60],
			notes: ['C', 'E', 'G', 'C'],
			startSeconds: 0,
			voiceNotes: [
				{ midiNote: 48, note: 'C' },
				{ midiNote: 52, note: 'E' },
				{ midiNote: 55, note: 'G' },
				{ midiNote: 60, note: 'C' }
			],
			voices: 4
		}
	]
});
assert.deepEqual(mutedStructuralMelodySchedule[0].midiNoteEvents, undefined);
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

const staccatoSchedule = app.buildProgressionPlaybackSchedule({
	measures: [
		{
			articulation: 'staccato',
			bar: 1,
			beatsPerBar: 7,
			degree: 'I',
			durationBeats: 7,
			durationSeconds: 3.5,
			midiNotes: [60, 64, 67],
			notes: ['C', 'E', 'G'],
			startSeconds: 0,
			voices: 3
		}
	]
});
assert.equal(staccatoSchedule[0].midiNoteEvents.length, 21);
assert.deepEqual(staccatoSchedule[0].midiNoteEvents.slice(0, 6), [
	{ delay: 0, duration: 0.225, kind: 'staccato', midiNote: 60 },
	{ delay: 0, duration: 0.225, kind: 'staccato', midiNote: 64 },
	{ delay: 0, duration: 0.225, kind: 'staccato', midiNote: 67 },
	{ delay: 0.5, duration: 0.225, kind: 'staccato', midiNote: 60 },
	{ delay: 0.5, duration: 0.225, kind: 'staccato', midiNote: 64 },
	{ delay: 0.5, duration: 0.225, kind: 'staccato', midiNote: 67 }
]);
const shortPresetSchedule = app.buildProgressionPlaybackSchedule({
	measures: [
		{
			articulation: 'arpeggio_up',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			midiNotes: [60, 64, 67],
			notes: ['C', 'E', 'G'],
			startSeconds: 0,
			voices: 3
		}
	]
}, {
	instrument: {
		articulationInstruments: {
			arpeggio: 'pizzicato_strings',
			staccato: 'pizzicato_strings'
		},
		id: 'string_ensemble_1'
	}
});
assert.equal(shortPresetSchedule[0].playbackInstrumentId, 'pizzicato_strings');

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
assert.equal(app.articulationDurationFactor('unknown'), 0.95);
assert.equal(app.articulationDurationFactor('staccato'), 0.45);
assert.equal(app.articulationDurationFactor('arpeggio_random'), 0.9);

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
assert.deepEqual(noteCalls.map(function (call) { return call.note; }), [63, 62, 61, 60]);
assert.deepEqual(noteCalls.map(function (call) { return call.options.delay; }), [0, 0.18, 0.36, 0.54]);

assert.equal(completed, false);
runTimersAt(6050);
assert.equal(completed, true);
assert.equal(playback.isPlaying(), false);

const shortPresetNoteCalls = [];
context.window.CodaProgressionEventPlayer.play({
	playMidiNote: function (note, options) {
		shortPresetNoteCalls.push({ note: note, options: options });
	}
}, context.window.CodaProgressionEventPlayer.asImmediateEvent({
	arpeggioStep: 0.1,
	delay: 0,
	duration: 1,
	mode: 'arpeggio',
	midiNotes: [60, 64, 67],
	playbackInstrumentId: 'pizzicato_strings'
}));
assert.deepEqual(shortPresetNoteCalls.map(function (call) { return call.options.instrumentId; }), [
	'pizzicato_strings',
	'pizzicato_strings',
	'pizzicato_strings'
]);

const simultaneousChordCalls = [];
const simultaneousNoteCalls = [];
context.window.CodaProgressionEventPlayer.play({
	playMidiChord: function (notes, options) {
		simultaneousChordCalls.push({ notes: notes, options: options });
	},
	playMidiNote: function (note, options) {
		simultaneousNoteCalls.push({ note: note, options: options });
	}
}, context.window.CodaProgressionEventPlayer.asImmediateEvent({
	delay: 0,
	duration: 1.9,
	midiNoteEvents: [
		{ delay: 0, duration: 1.9, midiNote: 52 },
		{ delay: 0, duration: 1.9, midiNote: 55 },
		{ delay: 0, duration: 1.9, midiNote: 59 },
		{ delay: 0, duration: 1.9, midiNote: 64 }
	],
	playbackInstrumentId: 'acoustic_grand_piano'
}));
assert.deepEqual(simultaneousChordCalls.map(function (call) { return call.notes; }), [[52, 55, 59, 64]]);
assert.equal(simultaneousNoteCalls.length, 0);

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

assert.deepEqual(loopTimers.map(function (timer) { return timer.milliseconds; }).slice(0, 5), [0, 2000, 0, 2000, 4050]);
loopTimers.filter(function (timer) {
	return timer.milliseconds === 4050;
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

const liveProgression = {
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 2,
			notes: ['C', 'E', 'G'],
			startSeconds: 0,
			voices: 3
		},
		{
			articulation: 'sustain',
			bar: 2,
			degree: 'V',
			durationSeconds: 2,
			intensity: 70,
			notes: ['G', 'B', 'D'],
			startSeconds: 2,
			voices: 3
		}
	]
};
const liveChordCalls = [];
const liveTimers = [];
const livePlayback = app.createProgressionPlayback({
	playbackService: {
		playChordFromNames: function (notes, options) {
			liveChordCalls.push({
				notes: notes,
				options: options
			});
		},
		stopAllNotes: function () {}
	},
	timerApi: {
		clearTimeout: function () {},
		setTimeout: function (callback, milliseconds) {
			liveTimers.push({
				callback: callback,
				milliseconds: milliseconds
			});
			return liveTimers.length;
		}
	}
});

livePlayback.play(liveProgression);
liveProgression.measures[1].intensity = 112;
liveProgression.measures[1].humanization = 40;
liveProgression.measures[1].swing = 60;
liveTimers.filter(function (timer) {
	return timer.milliseconds === 2000;
}).forEach(function (timer) {
	timer.callback();
});
assert.deepEqual(liveChordCalls, [
	{
		notes: ['G', 'B', 'D'],
		options: {
			delay: 0,
			duration: 1.9,
			velocity: 80
		}
	}
]);

const visualNoteTimers = [];
const visualNoteStarts = [];
const visualNoteEnds = [];
const visualNotePlayback = app.createProgressionPlayback({
	playbackService: {
		playMidiChord: function () {},
		stopAllNotes: function () {}
	},
	timerApi: {
		clearTimeout: function () {},
		setTimeout: function (callback, milliseconds) {
			visualNoteTimers.push({
				callback: callback,
				done: false,
				milliseconds: milliseconds
			});
			return visualNoteTimers.length;
		}
	}
});

visualNotePlayback.play({
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'I',
			durationSeconds: 1,
			midiNotes: [60, 64],
			notes: ['C', 'E'],
			startSeconds: 0,
			voices: 2
		}
	],
	totalSeconds: 1
}, {
	onNoteEnd: function (midiNotes) {
		visualNoteEnds.push(midiNotes.slice());
	},
	onNoteStart: function (midiNotes) {
		visualNoteStarts.push(midiNotes.slice());
	}
});
runVisualNoteTimersAt(0);
assert.deepEqual(visualNoteStarts, [[60, 64]]);
runVisualNoteTimersAt(950);
assert.deepEqual(visualNoteEnds, [[60, 64]]);

const groupedVisualStarts = [];
const groupedVisualPlayback = app.createProgressionPlayback({
	playbackService: {
		playMidiChord: function () {},
		playMidiNote: function () {},
		stopAllNotes: function () {}
	},
	timerApi: {
		clearTimeout: function () {},
		setTimeout: function (callback, milliseconds) {
			visualNoteTimers.push({
				callback: callback,
				done: false,
				milliseconds: milliseconds
			});
			return visualNoteTimers.length;
		}
	}
});
groupedVisualPlayback.play({
	generateMelodicVoice: true,
	measures: [
		{
			articulation: 'sustain',
			bar: 1,
			degree: 'i',
			durationSeconds: 1,
			melodicVoiceIndex: 3,
			midiNotes: [52, 55, 59, 64],
			notes: ['E', 'G', 'B', 'E'],
			startSeconds: 0,
			voiceNotes: [
				{ midiNote: 52, note: 'E' },
				{ midiNote: 55, note: 'G' },
				{ midiNote: 59, note: 'B' },
				{ midiNote: 64, note: 'E' }
			],
			voices: 4
		}
	],
	totalSeconds: 1
}, {
	onNoteStart: function (midiNotes) {
		groupedVisualStarts.push(midiNotes.slice());
	}
});
runVisualNoteTimersAt(0);
assert.deepEqual(groupedVisualStarts, [[52, 55, 59, 76]]);

const pedalVisualStarts = [];
const pedalVisualEnds = [];
const pedalVisualTimers = [];
let pedalVisualNow = 0;
const pedalVisualPlayback = app.createProgressionPlayback({
	playbackService: {
		getInstrumentAttributes: function () {
			return {
				pedalBehavior: 'sustain',
				supportsPedalHold: true
			};
		},
		playMidiChord: function () {},
		playMidiNote: function () {},
		stopAllNotes: function () {}
	},
	timerApi: {
		clearTimeout: function () {},
		setTimeout: function (callback, milliseconds) {
			pedalVisualTimers.push({
				callback: callback,
				done: false,
				milliseconds: pedalVisualNow + milliseconds
			});
			return pedalVisualTimers.length;
		}
	}
});
pedalVisualPlayback.play({
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
			degree: 'I',
			durationSeconds: 2,
			midiNotes: [55, 60, 65],
			notes: ['G', 'C', 'F'],
			pedalsIn: [{ durationSeconds: 2, midiNote: 55, note: 'G', fromBar: 1 }],
			startSeconds: 2,
			voices: 3
		}
	],
	totalSeconds: 4
}, {
	onNoteEnd: function (midiNotes) {
		pedalVisualEnds.push(midiNotes.slice());
	},
	onNoteStart: function (midiNotes) {
		pedalVisualStarts.push(midiNotes.slice());
	}
});
runPedalVisualTimersAt(0);
assert.deepEqual(pedalVisualStarts, [[48, 52, 55]]);
runPedalVisualTimersAt(1900);
assert.deepEqual(pedalVisualEnds, [[48, 52]]);
runPedalVisualTimersAt(2000);
assert.deepEqual(pedalVisualStarts, [[48, 52, 55], [60, 65]]);
runPedalVisualTimersAt(3900);
assert.deepEqual(pedalVisualEnds, [[48, 52], [60, 65]]);
runPedalVisualTimersAt(4001);
assert.deepEqual(pedalVisualEnds, [[48, 52], [60, 65], [55]]);

const note60a = fakeInstrumentNoteElement();
const note60b = fakeInstrumentNoteElement();
const note64 = fakeInstrumentNoteElement();
context.window.document = {
	querySelectorAll: function (selector) {
		if (selector === '#instrumento .celdaNota span[data-midi-note="60"]') {
			return [note60a, note60b];
		}

		if (selector === '#instrumento .celdaNota span[data-midi-note="64"]') {
			return [note64];
		}

		if (selector === '#instrumento .celdaNota span.isPlayingInstrumentNote') {
			return [note60a, note60b, note64].filter(function (element) {
				return element.classList.contains('isPlayingInstrumentNote');
			});
		}

		return [];
	}
};

const highlighter = context.window.CodaInstrumentNoteHighlight;
highlighter.noteOn([60, 60, 64]);
assert.equal(note60a.classList.contains('isPlayingInstrumentNote'), true);
assert.equal(note60b.classList.contains('isPlayingInstrumentNote'), true);
assert.equal(note64.classList.contains('isPlayingInstrumentNote'), true);
highlighter.noteOn(60);
highlighter.noteOff(60);
assert.equal(note60a.classList.contains('isPlayingInstrumentNote'), true);
highlighter.noteOff(60);
assert.equal(note60a.classList.contains('isPlayingInstrumentNote'), false);
assert.equal(note60b.classList.contains('isPlayingInstrumentNote'), false);
assert.equal(note64.classList.contains('isPlayingInstrumentNote'), true);
highlighter.clear();
assert.equal(note64.classList.contains('isPlayingInstrumentNote'), false);
delete context.window.document;

const guitarFretFive = fakeGuitarInstrumentNoteElement(5, 1, 64);
const guitarOpen = fakeGuitarInstrumentNoteElement(0, 2, 64);
context.window.document = {
	querySelectorAll: function (selector) {
		if (selector === '#instrumento .celdaNota span[data-midi-note="64"]') {
			return [guitarFretFive, guitarOpen];
		}
		if (selector === '#instrumento .celdaNota span.isPlayingInstrumentNote') {
			return [guitarFretFive, guitarOpen].filter(function (element) {
				return element.classList.contains('isPlayingInstrumentNote');
			});
		}

		return [];
	}
};
highlighter.noteOn(64);
assert.equal(guitarOpen.classList.contains('isPlayingInstrumentNote'), true);
assert.equal(guitarFretFive.classList.contains('isPlayingInstrumentNote'), false);
highlighter.noteOff(64);
assert.equal(guitarOpen.classList.contains('isPlayingInstrumentNote'), false);
delete context.window.document;

const guitarOpenE = fakeGuitarInstrumentNoteElement(0, 2, 64);
const guitarSameStringG = fakeGuitarInstrumentNoteElement(3, 2, 67);
const guitarOtherStringE = fakeGuitarInstrumentNoteElement(5, 1, 64);
const guitarOtherStringG = fakeGuitarInstrumentNoteElement(8, 3, 67);
const guitarAllCandidates = [guitarOpenE, guitarSameStringG, guitarOtherStringE, guitarOtherStringG];
context.window.document = {
	querySelectorAll: function (selector) {
		if (selector === '#instrumento .celdaNota span[data-midi-note="64"]') {
			return [guitarOpenE, guitarOtherStringE];
		}
		if (selector === '#instrumento .celdaNota span[data-midi-note="67"]') {
			return [guitarSameStringG, guitarOtherStringG];
		}
		if (selector === '#instrumento .celdaNota span.isPlayingInstrumentNote') {
			return guitarAllCandidates.filter(function (element) {
				return element.classList.contains('isPlayingInstrumentNote');
			});
		}

		return [];
	}
};
highlighter.noteOn([64, 67]);
assert.equal(guitarOpenE.classList.contains('isPlayingInstrumentNote'), true);
assert.equal(guitarSameStringG.classList.contains('isPlayingInstrumentNote'), false);
assert.equal(guitarOtherStringG.classList.contains('isPlayingInstrumentNote'), true);
highlighter.noteOff([64, 67]);
delete context.window.document;

console.log('Progression playback tests passed');

function runTimersAt(milliseconds) {
	timers.filter(function (timer) {
		return timer.milliseconds === milliseconds;
	}).forEach(function (timer) {
		timer.callback();
	});
}

function runVisualNoteTimersAt(milliseconds) {
	let ran;

	do {
		ran = false;
		visualNoteTimers.filter(function (timer) {
			return timer.milliseconds === milliseconds && timer.done === false;
		}).forEach(function (timer) {
			timer.done = true;
			ran = true;
			timer.callback();
		});
	} while (ran);
}

function runPedalVisualTimersAt(milliseconds) {
	let ran;

	pedalVisualNow = milliseconds;
	do {
		ran = false;
		pedalVisualTimers.filter(function (timer) {
			return timer.milliseconds <= milliseconds + 0.01 && timer.done === false;
		}).forEach(function (timer) {
			timer.done = true;
			ran = true;
			timer.callback();
		});
	} while (ran);
}

function fakeInstrumentNoteElement() {
	const classes = {};

	return {
		classList: {
			add: function (className) {
				classes[className] = true;
			},
			contains: function (className) {
				return classes[className] === true;
			},
			remove: function (className) {
				delete classes[className];
			},
			toggle: function (className, force) {
				if (force) {
					classes[className] = true;
				} else {
					delete classes[className];
				}
			}
		}
	};
}

function fakeGuitarInstrumentNoteElement(fretNumber, stringIndex, midiNote) {
	const element = fakeInstrumentNoteElement();
	const cell = {
		getAttribute: function (name) {
			if (name === 'data-fret-number') {
				return String(fretNumber);
			}
			if (name === 'data-string-index') {
				return String(stringIndex);
			}

			return '';
		}
	};

	element.closest = function (selector) {
		return selector === '.guitarNoteCell' ? cell : null;
	};
	element.getAttribute = function (name) {
		return name === 'data-midi-note' ? String(midiNote) : '';
	};

	return element;
}
