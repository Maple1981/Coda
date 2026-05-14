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

runScript('js/renderers/progression-label-renderer.js');
runScript('js/renderers/progression-chord-menu-renderer.js');
runScript('js/services/progression-midi-download-service.js');
runScript('js/services/progression-transport-shortcut-service.js');
runScript('js/services/progression-transport-dom-service.js');
runScript('js/services/progression-transport-drag-class-service.js');
runScript('js/services/progression-transport-drag-state-service.js');
runScript('js/services/progression-transport-drag-data-service.js');
runScript('js/services/progression-transport-drag-target-service.js');
runScript('js/services/progression-transport-drag-handler-service.js');
runScript('js/services/progression-transport-drag-service.js');
runScript('js/services/progression-transport-view-service.js');
runScript('js/services/progression-transport-actions-service.js');
runScript('js/services/progression-transport-menu-service.js');
runScript('js/services/progression-transport-playback-service.js');
runScript('js/services/progression-transport-buttons-service.js');
runScript('js/services/progression-transport-measure-click-service.js');
runScript('js/services/progression-transport-document-events-service.js');
runScript('js/services/progression-transport-drag-actions-service.js');
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
let reorderedChordRequest = null;
let midiBuildRequest = null;
let midiDownloads = 0;

const controller = context.window.CodaProgressionTransport.initialize({
	application: {
		buildProgressionMidiFile: function (request) {
			midiBuildRequest = request;
			return {
				bytes: new Uint8Array([77, 84, 104, 100]),
				fileName: 'test-progression.mid',
				mimeType: 'audio/midi'
			};
		},
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
		},
		reorderProgressionMeasureChords: function (sourceProgression, measureIndex, fromChordIndex, toChordIndex) {
			reorderedChordRequest = {
				fromChordIndex: fromChordIndex,
				measureIndex: measureIndex,
				sourceProgression: sourceProgression,
				toChordIndex: toChordIndex
			};
			return {
				measures: sourceProgression.measures.slice()
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
			return {
				midiInstrument: 'acoustic_grand_piano'
			};
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

document.dispatchKeydown('2');
assert.equal(document.measures[1].classList.contains('isPlaybackHead'), true);
assert.equal(document.goStart.hidden, false);

playCalls = 0;
playing = false;
document.dispatchKeydown(' ');
assert.equal(playCalls, 1);
assert.equal(lastStartIndex, 1);
document.dispatchKeydown(' ');
assert.equal(playing, false);

document.dispatchKeydown('0');
assert.equal(document.measures[1].classList.contains('isPlaybackHead'), true);

const focusedSelect = createFakeElement('focused-select');
focusedSelect.tagName = 'SELECT';
document.dispatchKeydown('3', focusedSelect);
assert.equal(document.measures[2].classList.contains('isPlaybackHead'), true);

const focusedNumberInput = createFakeElement('focused-number');
focusedNumberInput.tagName = 'INPUT';
focusedNumberInput.type = 'number';
playCalls = 0;
playing = false;
document.dispatchKeydown(' ', focusedNumberInput);
assert.equal(playCalls, 1);
document.dispatchKeydown(' ', focusedNumberInput);
assert.equal(playing, false);

const focusedTextInput = createFakeElement('focused-text');
focusedTextInput.tagName = 'INPUT';
focusedTextInput.type = 'text';
playCalls = 0;
document.dispatchKeydown(' ', focusedTextInput);
assert.equal(playCalls, 0);

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

document.measures[1].dispatchChordDragStart(3);
document.measures[1].dropChordOn(1);
assert.deepEqual(reorderedChordRequest, {
	fromChordIndex: 3,
	measureIndex: 1,
	sourceProgression: progression,
	toChordIndex: 1
});
assert.deepEqual(changedOptions, {
	playbackHeadIndex: 1
});

reorderedChordRequest = null;
document.measures[1].dispatchChordDragStart(2);
document.measures[1].dropChordOn(0);
assert.equal(reorderedChordRequest, null);

document.measures[1].dispatchChordDragStart(2);
document.measures[2].dropChordOn(1);
assert.equal(reorderedChordRequest, null);

document.loop.checked = true;
assert.equal(lastPlayCallbacks.shouldLoop(), true);
document.metronome.checked = true;
assert.equal(lastPlayCallbacks.shouldPlayMetronome(), true);

document.exportButton.dispatchEvent({ type: 'click', target: document.exportButton });
assert.deepEqual(midiBuildRequest, {
	data: { midi: { initialMidiNote: 60 } },
	midiInstrument: 'acoustic_grand_piano',
	progression: progression
});
assert.equal(document.lastDownload.download, 'test-progression.mid');
assert.equal(midiDownloads, 1);

const silenceMenuItem = createFakeElement('silence-menu-item');
silenceMenuItem.setAttribute('data-chord-kind', 'silence');
assert.deepEqual(context.window.CodaProgressionTransportMenu.replacementFromItem(silenceMenuItem), {
	kind: 'silence'
});
context.window.innerWidth = 320;
context.window.innerHeight = 240;
const tallMenu = createFakeElement('tall-menu');
const lowButton = createFakeElement('low-button');
tallMenu.getBoundingClientRect = function () {
	return { height: 500, width: 280 };
};
lowButton.getBoundingClientRect = function () {
	return { bottom: 230, left: 260, top: 210 };
};
context.window.CodaProgressionTransportMenu.position(tallMenu, lowButton);
assert.equal(tallMenu.style.left, '32px');
assert.equal(tallMenu.style.top, '8px');
assert.equal(tallMenu.style.maxHeight, '196px');

console.log('Progression transport tests passed');

function createFakeDocument(measureCount) {
	const rootElement = createFakeElement('constructorProgresiones');
	const listen = createFakeElement('listen');
	const exportButton = createFakeElement('export');
	const goStart = createFakeElement('goStart');
	const loop = createFakeElement('progressionLoop');
	const metronome = createFakeElement('progressionMetronome');
	const measures = [];
	const chordElements = [];
	const listeners = {};

	for (let i = 0; i < measureCount; i++) {
		measures.push(createFakeMeasure(i, rootElement, chordElements));
	}

	const fakeDocument = {
		body: createFakeElement('body'),
		createElement: function (tagName) {
			const element = createFakeElement(tagName);

			element.tagName = tagName.toUpperCase();
			return element;
		},
		exportButton,
		goStart,
		listen,
		loop,
		metronome,
		measures,
		addEventListener: function (eventName, handler) {
			listeners[eventName] = listeners[eventName] || [];
			listeners[eventName].push(handler);
		},
		dispatchKeydown: function (key, target) {
			const event = {
				key: key,
				preventDefaultCalled: false,
				preventDefault: function () {
					this.preventDefaultCalled = true;
				},
				target: target || createFakeElement('shortcut-target'),
				type: 'keydown'
			};
			(listeners.keydown || []).forEach(function (handler) {
				handler(event);
			});
			return event;
		},
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
			if (selector === '.measureChord.isDragging, .measureChord.isChordDropTarget') {
				return chordElements.filter(function (chordElement) {
					return chordElement.classList.contains('isDragging') || chordElement.classList.contains('isChordDropTarget');
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

function createFakeMeasure(index, rootElement, chordElements) {
	const element = createFakeElement('measure-' + index);
	const splitButton = createFakeElement('split-' + index);
	const chordElement = createFakeChordElement(index, 0, element);
	const chords = [chordElement];
	const chordHandles = [];

	for (let i = 1; i < 4; i++) {
		const additionalChord = createFakeChordElement(index, i, element);
		const chordHandle = createFakeElement('chord-handle-' + index + '-' + i);

		chordHandle.closest = function (selector) {
			if (selector === '.measureChordDragHandle') {
				return chordHandle;
			}
			if (selector === '.measureChord') {
				return additionalChord;
			}
			if (selector === '.measure') {
				return element;
			}
			return null;
		};
		chords[i] = additionalChord;
		chordHandles[i] = chordHandle;
		chordElements.push(additionalChord);
	}

	chordElements.push(chordElement);

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
	element.dispatchSplitClick = function (action, chordIndex) {
		const targetChord = chords[chordIndex || 0] || chordElement;
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
				return targetChord;
			}
			return null;
		};
		rootElement.dispatchEvent({
			preventDefault: function () {},
			target: splitButton,
			type: 'click'
		});
	};
	element.dispatchChordDragStart = function (chordIndex) {
		rootElement.dispatchEvent({
			dataTransfer: dataTransfer(),
			target: chordHandles[chordIndex],
			type: 'dragstart'
		});
	};
	element.dropChordOn = function (chordIndex) {
		rootElement.dispatchEvent({
			dataTransfer: dataTransfer(),
			preventDefault: function () {},
			target: chords[chordIndex],
			type: 'drop'
		});
	};

	return element;
}

function createFakeChordElement(measureIndex, chordIndex, measureElement) {
	const chordElement = createFakeElement('chord-' + measureIndex + '-' + chordIndex);

	chordElement.getAttribute = function (name) {
		if (name === 'data-measure-chord-index') {
			return String(chordIndex);
		}
		return null;
	};
	chordElement.closest = function (selector) {
		if (selector === '.measureChord') {
			return chordElement;
		}
		if (selector === '.measure') {
			return measureElement;
		}
		return null;
	};

	return chordElement;
}

function createFakeElement(id) {
	const listeners = {};
	const attributes = {};
	const classes = {};

	return {
		appendChild: function (child) {
			this.children = this.children || [];
			this.children.push(child);
			child.parentNode = this;
			return child;
		},
		checked: false,
		click: function () {
			midiDownloads += 1;
			document.lastDownload = this;
		},
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
		removeChild: function (child) {
			this.children = (this.children || []).filter(function (item) {
				return item !== child;
			});
			child.parentNode = null;
			return child;
		},
		setAttribute: function (name, value) {
			attributes[name] = String(value);
		},
		style: {}
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
