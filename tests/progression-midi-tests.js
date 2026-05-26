const assert = require('assert');
const path = require('path');
const vm = require('vm');
const { createScriptLoader } = require('./helpers/script-loader');

const root = path.resolve(__dirname, '..');
const context = {
	console,
	window: {}
};
context.window.window = context.window;
vm.createContext(context);

const loader = createScriptLoader(root, context);
loader.runManifestRange('js/data/constants-data.js', 'js/ui/progression-state.js');

const app = context.window.CodaApplication;
const data = context.window.CodaData;
const domain = context.window.CodaDomain;
const midiExport = context.window.CodaMidiExport;
const progressionState = context.window.CodaProgressionState;

function noteIndex(name) {
	return data.notes.findIndex(function (note) {
		return note.nombre === name || note.enarmonica === name;
	});
}

const cMajorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('C'),
	tonicName: 'C'
});

const state = progressionState.normalize({
	articulation: 'sustain',
	bars: 4,
	bpm: 120,
	generateMelodicVoice: true,
	meter: '3/4',
	voices: 4
});

const progression = app.buildProgressionFromState({
	domain: domain,
	progressionState: state,
	report: cMajorReport
});

const midiFile = app.buildProgressionMidiFile({
	data: data,
	midiInstrument: 'drawbar_organ',
	progression: progression
});

assert.equal(midiFile.mimeType, 'audio/midi');
assert.equal(midiFile.fileName, 'coda-progression.mid');
assert.equal(Object.prototype.toString.call(midiFile.bytes), '[object Uint8Array]');
assert.deepEqual(Array.prototype.slice.call(midiFile.bytes, 0, 4).map(function (value) {
	return String.fromCharCode(value);
}).join(''), 'MThd');
assert.deepEqual(Array.prototype.slice.call(midiFile.bytes, 14, 18).map(function (value) {
	return String.fromCharCode(value);
}).join(''), 'MTrk');

assert.deepEqual(midiExport.chordNotesToMidi(['C', 'E', 'G', 'B'], 60), [60, 64, 67, 71]);
assert.deepEqual(midiExport.chordNotesToMidi(['F', 'A', 'C', 'E'], 60), [65, 69, 72, 76]);
assert.deepEqual(midiExport.variableLengthQuantity(480), [0x83, 0x60]);

const tempoEvent = midiFile.events.find(function (event) {
	return event.type === 'setTempo';
});
const timeSignatureEvent = midiFile.events.find(function (event) {
	return event.type === 'timeSignature';
});
const programEvent = midiFile.events.find(function (event) {
	return event.type === 'programChange';
});
const noteOnEvents = midiFile.events.filter(function (event) {
	return event.type === 'noteOn';
});
const noteOffEvents = midiFile.events.filter(function (event) {
	return event.type === 'noteOff';
});

assert.equal(tempoEvent.microsecondsPerBeat, 500000);
assert.deepEqual(timeSignatureEvent, {
	denominator: 4,
	numerator: 3,
	tick: 0,
	type: 'timeSignature'
});
assert.deepEqual(programEvent, {
	channel: 0,
	program: 16,
	tick: 0,
	type: 'programChange'
});
assert.deepEqual(noteOnEvents.filter(function (event) { return event.tick === 0; }).map(function (event) { return event.note; }), [60, 64, 67]);
assert.ok(noteOnEvents.some(function (event) { return event.tick > 0 && event.tick < 1440 && event.note >= 72; }));
assert.deepEqual(noteOnEvents.filter(function (event) { return event.tick === 1440; }).map(function (event) { return event.note; }), [60, 65, 69, 84]);
assert.ok(noteOnEvents.some(function (event) { return event.tick > 0 && event.tick < 1440; }));
assert.ok(noteOffEvents.some(function (event) { return event.tick === 1440; }));
assert.ok(noteOnEvents.length > 16);
assert.equal(noteOffEvents.length, noteOnEvents.length);

const splitProgression = app.addProgressionMeasureChord(progression, 0, {
	data: data,
	progressionState: state,
	report: cMajorReport,
	rng: function () { return 0; }
});
const splitEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	progression: splitProgression
});
const splitNoteOns = splitEvents.filter(function (event) {
	return event.type === 'noteOn';
});
assert.deepEqual(splitNoteOns.filter(function (event) { return event.tick === 0; }).map(function (event) { return event.tick; }), [0, 0, 0]);
assert.deepEqual(splitNoteOns.filter(function (event) { return event.tick === 960; }).slice(0, 4).map(function (event) { return event.tick; }), [960, 960, 960, 960]);
assert.ok(splitNoteOns.filter(function (event) { return event.tick === 960; }).some(function (event) {
	return event.degree.indexOf('vi') === 0;
}));
assert.ok(splitProgression.measures[0].chords[0].melodyEvents.length > 0);
assert.ok(splitProgression.measures[0].chords[1].melodyEvents.length > 0);
const splitPlaybackSchedule = app.buildProgressionPlaybackSchedule(splitProgression);
assert.ok(splitPlaybackSchedule[0].midiNoteEvents.length > 0);
assert.ok(splitPlaybackSchedule[1].midiNoteEvents.length > 0);

const pluckedPedalEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	instrument: {
		id: 'acoustic_grand_piano',
		pedalBehavior: 'reattack',
		supportsPedalHold: false
	},
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		generateMelodicVoice: true,
		measures: [
			{
				articulation: 'sustain',
				bar: 1,
				degree: 'I',
				durationBeats: 4,
				midiNotes: [48, 52, 55],
				pedalsOut: [{ midiNote: 55, note: 'G', toBar: 2 }],
				startBeat: 0
			},
			{
				articulation: 'sustain',
				bar: 2,
				degree: 'IV',
				durationBeats: 4,
				midiNotes: [55, 60, 65],
				pedalsIn: [{ midiNote: 55, note: 'G', fromBar: 1 }],
				startBeat: 4
			}
		]
	}
});
const pluckedPedalNoteOns = pluckedPedalEvents.filter(function (event) {
	return event.type === 'noteOn';
});
const pluckedPedalOffs = pluckedPedalEvents.filter(function (event) {
	return event.type === 'noteOff' && event.note === 55;
});
assert.equal(pluckedPedalNoteOns.length, 6);
assert.deepEqual(pluckedPedalOffs.map(function (event) { return event.tick; }), [1920, 3840]);

const sustainedPedalEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	instrument: {
		id: 'drawbar_organ',
		pedalBehavior: 'sustain',
		supportsPedalHold: true
	},
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		generateMelodicVoice: true,
		measures: [
			{
				articulation: 'sustain',
				bar: 1,
				degree: 'I',
				durationBeats: 4,
				midiNotes: [48, 52, 55],
				pedalsOut: [{ midiNote: 55, note: 'G', toBar: 2 }],
				startBeat: 0
			},
			{
				articulation: 'sustain',
				bar: 2,
				degree: 'IV',
				durationBeats: 4,
				midiNotes: [55, 60, 65],
				pedalsIn: [{ midiNote: 55, note: 'G', fromBar: 1 }],
				startBeat: 4
			}
		]
	}
});
const sustainedPedalNoteOns = sustainedPedalEvents.filter(function (event) {
	return event.type === 'noteOn';
});
const sustainedPedalOff = sustainedPedalEvents.filter(function (event) {
	return event.type === 'noteOff' && event.note === 55;
})[0];
assert.equal(sustainedPedalNoteOns.length, 5);
assert.equal(sustainedPedalOff.tick, 3840);

const passingNoteEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		generateMelodicVoice: true,
		measures: [
			{
				articulation: 'sustain',
				bar: 1,
				degree: 'I',
				durationBeats: 4,
				durationSeconds: 2,
				midiNotes: [48, 52, 55, 60],
				passingNotes: [{ delaySeconds: 1, durationSeconds: 0.25, midiNote: 62, note: 'D' }],
				startBeat: 0
			}
		]
	}
});
const passingNoteOn = passingNoteEvents.filter(function (event) {
	return event.type === 'noteOn' && event.note === 62;
})[0];
const passingNoteOff = passingNoteEvents.filter(function (event) {
	return event.type === 'noteOff' && event.note === 62;
})[0];
assert.equal(passingNoteOn.tick, 960);
assert.equal(passingNoteOff.tick, 1200);
assert.ok(passingNoteOn.velocity < 96);

const structuralMelodyMidiMeasure = {
	articulation: 'sustain',
	bar: 1,
	degree: 'I',
	durationBeats: 4,
	durationSeconds: 2,
	intensity: 120,
	midiNotes: [48, 52, 55, 60],
	startBeat: 0,
	voiceNotes: [
		{ midiNote: 48, note: 'C' },
		{ midiNote: 52, note: 'E' },
		{ midiNote: 55, note: 'G' },
		{ midiNote: 60, note: 'C' }
	],
	voices: 4
};
Object.defineProperty(structuralMelodyMidiMeasure, 'melodicVoiceIndex', {
	configurable: true,
	enumerable: false,
	value: 3
});
const structuralMelodyMidiEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		generateMelodicVoice: true,
		measures: [structuralMelodyMidiMeasure]
	}
});
const structuralMelodyNoteOns = structuralMelodyMidiEvents.filter(function (event) {
	return event.type === 'noteOn';
});
assert.deepEqual(structuralMelodyNoteOns.map(function (event) { return event.note; }), [48, 52, 55, 72]);
assert.deepEqual(structuralMelodyNoteOns.map(function (event) { return event.velocity; }), [58, 58, 58, 93]);
assert.equal(structuralMelodyMidiEvents.filter(function (event) {
	return event.type === 'noteOff' && event.note === 72;
})[0].tick, 1920);
const mutedStructuralMelodyMidiEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		generateMelodicVoice: false,
		measures: [structuralMelodyMidiMeasure]
	}
});
assert.deepEqual(mutedStructuralMelodyMidiEvents.filter(function (event) {
	return event.type === 'noteOn';
}).map(function (event) { return event.note; }), [48, 52, 55, 60]);

const staccatoEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	progression: app.buildProgressionFromState({
		domain: domain,
		progressionState: progressionState.normalize({
			articulation: 'staccato',
			bars: 2,
			bpm: 120,
			meter: '4/4'
		}),
		report: cMajorReport
	})
});
const firstStaccatoOff = staccatoEvents.filter(function (event) {
	return event.type === 'noteOff';
})[0];
const staccatoNoteOns = staccatoEvents.filter(function (event) {
	return event.type === 'noteOn';
});
assert.equal(firstStaccatoOff.tick, 216);
assert.deepEqual(staccatoNoteOns.slice(0, 8).map(function (event) { return event.tick; }), [0, 0, 0, 0, 480, 480, 480, 480]);
assert.equal(staccatoNoteOns.length, 32);

const pizzicatoStaccatoFile = app.buildProgressionMidiFile({
	data: data,
	midiInstrument: 'string_ensemble_1',
	progression: app.buildProgressionFromState({
		domain: domain,
		progressionState: progressionState.normalize({
			articulation: 'staccato',
			bars: 1,
			bpm: 120,
			meter: '4/4'
		}),
		report: cMajorReport
	})
});
assert.ok(pizzicatoStaccatoFile.events.some(function (event) {
	return event.type === 'programChange' && event.program === 45;
}));

const oddMeterStaccatoEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	progression: {
		beatUnit: 8,
		beatsPerBar: 7,
		bpm: 120,
		measures: [
			{
				articulation: 'staccato',
				bar: 1,
				degree: 'I',
				durationBeats: 7,
				midiNotes: [60, 64, 67],
				startBeat: 0
			}
		]
	}
});
assert.equal(oddMeterStaccatoEvents.filter(function (event) {
	return event.type === 'noteOn';
}).length, 21);

const arpeggioEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		measures: [
			{
				articulation: 'arpeggio_up_down',
				bar: 1,
				degree: 'I',
				durationBeats: 4,
				midiNotes: [60, 64, 67, 72],
				startBeat: 0
			}
		]
	}
});
const arpeggioNoteOns = arpeggioEvents.filter(function (event) {
	return event.type === 'noteOn';
});
assert.deepEqual(arpeggioNoteOns.map(function (event) { return event.note; }), [60, 64, 67, 72, 67, 64]);
assert.deepEqual(arpeggioNoteOns.map(function (event) { return event.tick; }), [0, 120, 240, 360, 480, 600]);
assert.deepEqual(midiExport.arpeggioOrderIndexes(4, 'arpeggio_down_up'), [3, 2, 1, 0, 1, 2]);

const percussiveOrganArpeggioFile = app.buildProgressionMidiFile({
	data: data,
	midiInstrument: 'drawbar_organ',
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		measures: [
			{
				articulation: 'arpeggio_up',
				bar: 1,
				degree: 'I',
				durationBeats: 4,
				midiNotes: [60, 64, 67],
				startBeat: 0
			}
		]
	}
});
assert.ok(percussiveOrganArpeggioFile.events.some(function (event) {
	return event.type === 'programChange' && event.program === 17;
}));

const expressiveEvents = midiExport.createProgressionMidiEvents({
	initialMidiNote: 60,
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		intensity: 70,
		measures: [
			{
				articulation: 'sustain',
				bar: 1,
				beatsPerBar: 4,
				degree: 'I',
				durationBeats: 1,
				humanization: 0,
				intensity: 70,
				midiNotes: [60, 64, 67],
				startBeat: 0,
				swing: 0
			},
			{
				articulation: 'sustain',
				bar: 1,
				beatsPerBar: 4,
				degree: 'IV',
				durationBeats: 1,
				humanization: 0,
				intensity: 70,
				midiNotes: [65, 69, 72],
				startBeat: 0.5,
				swing: 60
			}
		]
	}
});
const expressiveNoteOns = expressiveEvents.filter(function (event) {
	return event.type === 'noteOn';
});
assert.equal(expressiveNoteOns[0].velocity, 80);
assert.equal(expressiveNoteOns[3].tick, 240);

const editedMidiFile = app.buildProgressionMidiFile({
	data: data,
	midiInstrument: 'string_ensemble_1',
	progression: {
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 90,
		intensity: 64,
		measures: [
			{
				bar: 1,
				chords: [
					{
						articulation: 'sustain',
						bar: 1,
						degree: 'Iadd9 6/4 sus4',
						durationBeats: 2,
						humanization: 0,
						intensity: 64,
						inversion: '6/4',
						midiNotes: [55, 60, 64, 74],
						startBeat: 0,
						swing: 0,
						suspension: 'sus4',
						tensions: ['add9']
					},
					{
						bar: 1,
						degree: 'Silencio',
						durationBeats: 2,
						isSilence: true,
						midiNotes: [],
						notes: [],
						startBeat: 2
					}
				],
				durationBeats: 4,
				startBeat: 0
			},
			{
				bar: 2,
				degree: 'V7 4/2',
				durationBeats: 4,
				humanization: 0,
				intensity: 64,
				inversion: '4/2',
				midiNotes: [53, 59, 62, 67],
				sectionId: 'B',
				startBeat: 4,
				swing: 0
			}
		],
		meter: '4/4',
		sections: [
			{ id: 'A', labelKey: 'progression.sectionA', length: 1, startIndex: 0 },
			{ id: 'B', labelKey: 'progression.sectionB', length: 1, startIndex: 1 }
		]
	}
});
const editedProgramEvent = editedMidiFile.events.find(function (event) {
	return event.type === 'programChange';
});
const editedNoteOns = editedMidiFile.events.filter(function (event) {
	return event.type === 'noteOn';
});
assert.equal(editedProgramEvent.program, 48);
assert.equal(editedNoteOns.length, 8);
assert.deepEqual(editedNoteOns.slice(0, 4).map(function (event) { return event.degree; }), [
	'Iadd9 6/4 sus4',
	'Iadd9 6/4 sus4',
	'Iadd9 6/4 sus4',
	'Iadd9 6/4 sus4'
]);
assert.deepEqual(editedNoteOns.slice(4).map(function (event) { return event.tick; }), [1920, 1920, 1920, 1920]);
assert.deepEqual(editedNoteOns.slice(4).map(function (event) { return event.degree; }), ['V7 4/2', 'V7 4/2', 'V7 4/2', 'V7 4/2']);
assert.ok(!editedMidiFile.events.some(function (event) {
	return event.type === 'noteOn' && event.tick === 960;
}));

console.log('Progression MIDI tests passed');
