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
assert.deepEqual(noteOnEvents.slice(0, 4).map(function (event) { return event.note; }), [48, 52, 55, 60]);
assert.deepEqual(noteOnEvents.slice(4, 8).map(function (event) { return event.note; }), [48, 53, 57, 65]);
assert.deepEqual(noteOnEvents.slice(4, 8).map(function (event) { return event.tick; }), [1440, 1440, 1440, 1440]);
assert.equal(noteOffEvents[0].tick, 1440);
assert.equal(noteOnEvents.length, 16);
assert.equal(noteOffEvents.length, 16);

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
assert.deepEqual(splitNoteOns.slice(0, 4).map(function (event) { return event.tick; }), [0, 0, 0, 0]);
assert.deepEqual(splitNoteOns.slice(4, 8).map(function (event) { return event.tick; }), [720, 720, 720, 720]);
assert.equal(splitNoteOns[4].degree.indexOf('vi'), 0);

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
assert.equal(firstStaccatoOff.tick, 864);

console.log('Progression MIDI tests passed');
