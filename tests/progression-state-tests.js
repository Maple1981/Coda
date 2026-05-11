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

runScript('js/ui/progression-state.js');
runScript('js/ui/ui-state.js');

const progressionState = context.window.CodaProgressionState;
const uiStateFactory = context.window.CodaUiState;

assert.deepEqual(progressionState.defaults, {
	articulation: 'sustain',
	bars: 8,
	beatsPerBar: 4,
	beatUnit: 4,
	bpm: 120,
	counterpoint: 20,
	meter: '4/4',
	modalInterchange: 25,
	style: 'modern',
	tensions: 35,
	voices: 4
});

assert.deepEqual(progressionState.normalize({
	articulation: 'arpeggio',
	bars: '16',
	bpm: '128',
	counterpoint: '90',
	meter: '6/8',
	modalInterchange: '45',
	style: 'classic',
	tensions: '70',
	voices: '6'
}), {
	articulation: 'arpeggio',
	bars: 16,
	beatsPerBar: 6,
	beatUnit: 8,
	bpm: 128,
	counterpoint: 90,
	meter: '6/8',
	modalInterchange: 45,
	style: 'classic',
	tensions: 70,
	voices: 6
});

assert.deepEqual(progressionState.normalize({
	articulation: 'missing',
	bars: '99',
	bpm: '999',
	counterpoint: '-4',
	meter: '5/4',
	modalInterchange: 'bad',
	style: 'missing',
	tensions: '240',
	voices: '0'
}), {
	articulation: 'sustain',
	bars: 8,
	beatsPerBar: 4,
	beatUnit: 4,
	bpm: 200,
	counterpoint: 0,
	meter: '4/4',
	modalInterchange: 25,
	style: 'modern',
	tensions: 100,
	voices: 1
});

const state = progressionState.create({
	bars: 4,
	bpm: 80,
	meter: '3/4'
});

assert.deepEqual(state.get(), {
	articulation: 'sustain',
	bars: 4,
	beatsPerBar: 3,
	beatUnit: 4,
	bpm: 80,
	counterpoint: 20,
	meter: '3/4',
	modalInterchange: 25,
	style: 'modern',
	tensions: 35,
	voices: 4
});

state.set({
	articulation: 'legato',
	bpm: 112,
	tensions: 52
});

assert.equal(state.get().articulation, 'legato');
assert.equal(state.get().bars, 4);
assert.equal(state.get().bpm, 112);
assert.equal(state.get().tensions, 52);

const fakeDocument = {
	values: {
		progressionArticulation: 'staccato',
		progressionBars: '12',
		progressionBpm: '140',
		progressionCounterpoint: '33',
		progressionMeter: '6/8',
		progressionModalInterchange: '10',
		progressionStyle: 'classic',
		progressionTensions: '65',
		progressionVoices: '5'
	},
	getElementById: function (id) {
		return this.values[id] !== undefined ? { value: this.values[id] } : null;
	}
};

assert.deepEqual(progressionState.readFromControls(fakeDocument), {
	articulation: 'staccato',
	bars: 12,
	beatsPerBar: 6,
	beatUnit: 8,
	bpm: 140,
	counterpoint: 33,
	meter: '6/8',
	modalInterchange: 10,
	style: 'classic',
	tensions: 65,
	voices: 5
});

const uiState = uiStateFactory.create();
uiState.setProgressionState(progressionState.readFromControls(fakeDocument));
uiState.setProgression({ bars: 12, measures: [] });
assert.equal(uiState.getProgressionState().bars, 12);
assert.equal(uiState.getProgression().bars, 12);
assert.equal(uiState.toJSON().progressionState.articulation, 'staccato');
assert.equal(uiState.toJSON().progression.bars, 12);

console.log('Progression state tests passed');
