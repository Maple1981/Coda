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

runScript('js/ui/progression-transport-controller.js');

const progression = {
	measures: [
		{ bar: 1 },
		{ bar: 2 },
		{ bar: 3 }
	]
};
const document = createFakeDocument(progression.measures.length);
context.window.document = document;
context.window.Blob = function () {};
context.window.URL = {
	createObjectURL: function () {
		return 'blob:coda';
	},
	revokeObjectURL: function () {}
};

let lastPlayCallbacks = null;
let lastStartIndex = null;
let stopped = 0;
let playing = false;
let reorderedRequest = null;
let changedProgression = null;
let changedOptions = null;
let playCalls = 0;
let splitRequest = null;

const controller = context.window.CodaProgressionTransport.initialize({
	application: {
		reorderProgressionMeasures: function (sourceProgression, fromIndex, toIndex) {
			reorderedRequest = {
				fromIndex: fromIndex,
				sourceProgression: sourceProgression,
				toIndex: toIndex
			};
			return {
				measures: sourceProgression.measures.slice().reverse()
			};
		},
		addProgressionMeasureChord: function (sourceProgression, measureIndex, options) {
			splitRequest = {
				measureIndex: measureIndex,
				options: options,
				sourceProgression: sourceProgression
			};
			return {
				measures: sourceProgression.measures.slice()
			};
		},
		removeProgressionMeasureChord: function (sourceProgression, measureIndex, chordIndex) {
			splitRequest = {
				chordIndex: chordIndex,
				measureIndex: measureIndex,
				sourceProgression: sourceProgression
			};
			return {
				measures: sourceProgression.measures.slice(0, 2)
			};
		}
	},
	data: { midi: { initialMidiNote: 60 } },
	i18n: {
		t: function (key) {
			return key;
		}
	},
	onProgressionChanged: function (nextProgression, options) {
		changedProgression = nextProgression;
		changedOptions = options;
	},
	progressionPlayback: {
		isPlaying: function () {
			return playing;
		},
		play: function (sourceProgression, callbacks) {
			playCalls += 1;
			playing = true;
			lastPlayCallbacks = callbacks;
			lastStartIndex = callbacks.startIndex;
			callbacks.onStart();
			callbacks.onMeasureStart(sourceProgression.measures[callbacks.startIndex], callbacks.startIndex);
			return true;
		},
		stop: function () {
			stopped += 1;
			playing = false;
			if (lastPlayCallbacks && lastPlayCallbacks.onStop) {
				lastPlayCallbacks.onStop();
			}
			return true;
		}
	},
	uiState: {
		getProgression: function () {
			return progression;
		},
		getProgressionState: function () {
			return { bars: 3 };
		},
		getReport: function () {
			return { scaleChords: [] };
		},
		getSelection: function () {
			return {};
		}
	}
});

assert.ok(controller);

document.measures[2].dispatchDelegatedClick();
assert.equal(lastStartIndex, 2);
assert.equal(document.measures[2].classList.contains('isPlaybackHead'), true);
assert.equal(document.measures[2].classList.contains('isPlaying'), true);
assert.equal(document.goStart.hidden, false);

document.measures[2].dispatchDelegatedClick();
assert.equal(stopped, 1);
assert.equal(playCalls, 1);
assert.equal(document.measures[2].classList.contains('isPlaybackHead'), true);
assert.equal(document.measures[2].classList.contains('isPlaying'), false);

document.measures[2].dispatchDelegatedClick();
assert.equal(playCalls, 2);
assert.equal(document.measures[2].classList.contains('isPlaying'), true);

controller.stop();
assert.equal(stopped, 2);
assert.equal(document.measures[2].classList.contains('isPlaybackHead'), true);
assert.equal(document.measures[2].classList.contains('isPlaying'), false);

document.goStart.dispatchEvent({ type: 'click', target: document.goStart });
assert.equal(document.measures[0].classList.contains('isPlaybackHead'), true);
assert.equal(document.goStart.hidden, true);

document.measures[1].dispatchSplitClick('add');
assert.equal(splitRequest.measureIndex, 1);
assert.equal(splitRequest.options.chordIndex, 0);
assert.deepEqual(splitRequest.options.progressionState, { bars: 3 });
assert.deepEqual(changedOptions, {
	playbackHeadIndex: 1
});

document.measures[1].dispatchSplitClick('remove', 1);
assert.equal(splitRequest.measureIndex, 1);
assert.equal(splitRequest.chordIndex, 1);
assert.deepEqual(changedProgression, {
	measures: [
		{ bar: 1 },
		{ bar: 2 }
	]
});

document.dragStart(0);
document.dropOn(2);
assert.deepEqual(reorderedRequest, {
	fromIndex: 0,
	sourceProgression: progression,
	toIndex: 2
});
assert.deepEqual(changedProgression, {
	measures: [
		{ bar: 3 },
		{ bar: 2 },
		{ bar: 1 }
	]
});
assert.deepEqual(changedOptions, {
	playbackHeadIndex: 2
});
assert.ok(stopped >= 2);

document.loop.checked = true;
assert.equal(lastPlayCallbacks.shouldLoop(), true);
document.metronome.checked = true;
assert.equal(lastPlayCallbacks.shouldPlayMetronome(), true);

console.log('Progression transport tests passed');

function createFakeDocument(measureCount) {
	const rootElement = createFakeElement('constructorProgresiones');
	const listen = createFakeElement('listen');
	const exportButton = createFakeElement('export');
	const goStart = createFakeElement('goStart');
	const loop = createFakeElement('progressionLoop');
	const metronome = createFakeElement('progressionMetronome');
	const measures = [];

	for (let i = 0; i < measureCount; i++) {
		measures.push(createFakeMeasure(i, rootElement));
	}

	const fakeDocument = {
		body: createFakeElement('body'),
		exportButton,
		goStart,
		listen,
		loop,
		metronome,
		measures,
		querySelector: function (selector) {
			if (selector === '#constructorProgresiones') {
				return rootElement;
			}
			if (selector === '.transportButton--goStart') {
				return goStart;
			}
			if (selector === '.transportButton--listen') {
				return listen;
			}
			if (selector === '.transportButton--export') {
				return exportButton;
			}
			if (selector === '#progressionLoop') {
				return loop;
			}
			if (selector === '#progressionMetronome') {
				return metronome;
			}
			const indexMatch = selector.match(/\.measure\[data-progression-index="(\d+)"\]/);
			if (indexMatch) {
				return measures[Number(indexMatch[1])] || null;
			}
			const barMatch = selector.match(/\.measure\[data-progression-bar="(\d+)"\]/);
			if (barMatch) {
				return measures[Number(barMatch[1]) - 1] || null;
			}
			return null;
		},
		querySelectorAll: function (selector) {
			if (selector === '.measure.isPlaybackHead, .measure.isPlaying') {
				return measures.filter(function (measure) {
					return measure.classList.contains('isPlaybackHead') || measure.classList.contains('isPlaying');
				});
			}
			if (selector === '.measure.isPlaying') {
				return measures.filter(function (measure) {
					return measure.classList.contains('isPlaying');
				});
			}
			if (selector === '.measure.isDragging, .measure.isDropTarget') {
				return measures.filter(function (measure) {
					return measure.classList.contains('isDragging') || measure.classList.contains('isDropTarget');
				});
			}
			return [];
		},
		dragStart: function (index) {
			rootElement.dispatchEvent({
				dataTransfer: dataTransfer(),
				target: measures[index],
				type: 'dragstart'
			});
		},
		dropOn: function (index) {
			const transfer = dataTransfer();
			transfer.setData('text/plain', '0');
			rootElement.dispatchEvent({
				dataTransfer: transfer,
				preventDefault: function () {},
				target: measures[index],
				type: 'drop'
			});
		}
	};

	return fakeDocument;
}

function createFakeMeasure(index, rootElement) {
	const element = createFakeElement('measure-' + index);
	const splitButton = createFakeElement('split-' + index);
	const chordElement = createFakeElement('chord-' + index);

	element.getAttribute = function (name) {
		if (name === 'data-progression-index') {
			return String(index);
		}
		if (name === 'data-progression-bar') {
			return String(index + 1);
		}
		return null;
	};
	element.closest = function (selector) {
		if (selector === '.measure') {
			return element;
		}
		return null;
	};
	element.dispatchDelegatedClick = function () {
		rootElement.dispatchEvent({
			target: element,
			type: 'click'
		});
	};
	chordElement.getAttribute = function (name) {
		if (name === 'data-measure-chord-index') {
			return chordElement.chordIndex || '0';
		}
		return null;
	};
	chordElement.closest = function (selector) {
		if (selector === '.measureChord') {
			return chordElement;
		}
		if (selector === '.measure') {
			return element;
		}
		return null;
	};
	element.dispatchSplitClick = function (action, chordIndex) {
		chordElement.chordIndex = String(chordIndex || 0);
		splitButton.getAttribute = function (name) {
			if (name === 'data-progression-split-action') {
				return action;
			}
			return null;
		};
		splitButton.closest = function (selector) {
			if (selector === '.measureSplitButton') {
				return splitButton;
			}
			if (selector === '.measure') {
				return element;
			}
			if (selector === '.measureChord') {
				return chordElement;
			}
			return null;
		};
		rootElement.dispatchEvent({
			preventDefault: function () {},
			target: splitButton,
			type: 'click'
		});
	};

	return element;
}

function createFakeElement(id) {
	const listeners = {};
	const attributes = {};
	const classes = {};

	return {
		checked: false,
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
				classes[className] = force === undefined ? !classes[className] : force;
			}
		},
		addEventListener: function (eventName, handler) {
			listeners[eventName] = listeners[eventName] || [];
			listeners[eventName].push(handler);
		},
		dispatchEvent: function (event) {
			const handlers = listeners[event.type] || [];
			event.currentTarget = this;
			event.target = event.target || this;
			handlers.forEach(function (handler) {
				handler(event);
			});
		},
		getAttribute: function (name) {
			return attributes[name];
		},
		id: id,
		querySelector: function () {
			return null;
		},
		setAttribute: function (name, value) {
			attributes[name] = String(value);
		}
	};
}

function dataTransfer() {
	const values = {};

	return {
		dropEffect: '',
		effectAllowed: '',
		getData: function (type) {
			return values[type] || '';
		},
		setData: function (type, value) {
			values[type] = value;
		}
	};
}
