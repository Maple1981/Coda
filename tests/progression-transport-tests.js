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
		}
	},
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
