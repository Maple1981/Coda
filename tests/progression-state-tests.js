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

runScript('js/ui/ui-state.js');
runScript('js/ui/progression-state-schema.js');
runScript('js/ui/progression-state.js');

const progressionState = context.window.CodaProgressionState;
const uiStateFactory = context.window.CodaUiState;

assert.deepEqual(progressionState.defaults, {
	articulation: 'sustain',
	bars: 8,
	beatsPerBar: 4,
	beatUnit: 4,
	bpm: 120,
	chromaticism: 10,
	counterpoint: 20,
	humanization: 0,
	intensity: 80,
	meter: '4/4',
	modalInterchange: 25,
	style: 'modern',
	swing: 0,
	tensions: 35,
	voicing: 'closed',
	voices: 4
});

assert.deepEqual(progressionState.normalize({
	articulation: 'arpeggio',
	bars: '16',
	bpm: '128',
	chromaticism: '80',
	counterpoint: '90',
	humanization: '22',
	intensity: '104',
	meter: '6/8',
	modalInterchange: '45',
	style: 'classic',
	swing: '35',
	tensions: '70',
	voicing: 'open',
	voices: '6'
}), {
	articulation: 'arpeggio',
	bars: 16,
	beatsPerBar: 6,
	beatUnit: 8,
	bpm: 128,
	chromaticism: 80,
	counterpoint: 90,
	humanization: 22,
	intensity: 104,
	meter: '6/8',
	modalInterchange: 45,
	style: 'classic',
	swing: 35,
	tensions: 70,
	voicing: 'open',
	voices: 6
});

assert.deepEqual(progressionState.normalize({
	articulation: 'missing',
	bars: '99',
	bpm: '999',
	chromaticism: '200',
	counterpoint: '-4',
	humanization: '200',
	intensity: '999',
	meter: '5/4',
	modalInterchange: 'bad',
	style: 'missing',
	swing: '99',
	tensions: '240',
	voicing: 'wide',
	voices: '0'
}), {
	articulation: 'sustain',
	bars: 8,
	beatsPerBar: 4,
	beatUnit: 4,
	bpm: 200,
	chromaticism: 100,
	counterpoint: 0,
	humanization: 100,
	intensity: 127,
	meter: '4/4',
	modalInterchange: 25,
	style: 'modern',
	swing: 75,
	tensions: 100,
	voicing: 'closed',
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
	chromaticism: 10,
	counterpoint: 20,
	humanization: 0,
	intensity: 80,
	meter: '3/4',
	modalInterchange: 25,
	style: 'modern',
	swing: 0,
	tensions: 35,
	voicing: 'closed',
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
		progressionChromaticism: '72',
		progressionCounterpoint: '33',
		progressionHumanization: '18',
		progressionIntensity: '96',
		progressionMeter: '6/8',
		progressionModalInterchange: '10',
		progressionStyle: 'classic',
		progressionSwing: '24',
		progressionTensions: '65',
		progressionVoicing: 'open',
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
	chromaticism: 72,
	counterpoint: 33,
	humanization: 18,
	intensity: 96,
	meter: '6/8',
	modalInterchange: 10,
	style: 'classic',
	swing: 24,
	tensions: 65,
	voicing: 'open',
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
