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
loader.runManifestRange('js/data/constants-data.js', 'js/ui/workbench-instrument-menu-controller.js');

const global = context.window;
const rootElement = createInstrumentRoot();
const selected = [];
const menu = global.CodaWorkbenchInstrumentMenu.initialize({
	data: {
		midiInstruments: global.CodaData.midiInstruments.slice(0, 3)
	},
	i18n: {
		dataLabel: function (collection, index, fallback) {
			return collection + ':' + index + ':' + fallback;
		}
	},
	onInstrumentSelected: function (instrumentId) {
		selected.push(instrumentId);
	},
	root: rootElement
});

menu.render({ midiInstrument: global.CodaData.midiInstruments[1].id });
assert.ok(rootElement.menu.innerHTML.indexOf('aria-pressed="true"') > -1);
assert.ok(rootElement.menu.innerHTML.indexOf('data.midiInstruments') === -1);
rootElement.dispatch('click', {
	target: rootElement.contextToggle,
	type: 'click'
});
assert.equal(menu.isOpen(), true);
assert.equal(rootElement.contextToggle.getAttribute('aria-expanded'), 'true');
assert.equal(rootElement.menuIcon.textContent, 'expand_less');
rootElement.dispatch('click', {
	target: rootElement.instrumentItem,
	type: 'click'
});
assert.deepEqual(selected, [rootElement.instrumentItem.getAttribute('data-workbench-instrument-id')]);
assert.equal(menu.isOpen(), false);
assert.equal(rootElement.menuIcon.textContent, 'expand_more');

console.log('Progression UI controls and instruments tests passed');

function createInstrumentRoot() {
	const listeners = {};
	const elements = {};
	const root = {
		addEventListener: function (eventName, handler) {
			listeners[eventName] = listeners[eventName] || [];
			listeners[eventName].push(handler);
		},
		dispatch: function (eventName, event) {
			(listeners[eventName] || []).forEach(function (handler) {
				handler(event);
			});
		},
		querySelector: function (selector) {
			return elements[selector] || null;
		}
	};

	root.menu = element('workbenchInstrumentMenu');
	root.menu.hidden = true;
	root.menuIcon = element('menuIcon');
	root.toggle = element('toggleWorkbenchInstrumentMenu');
	root.contextToggle = element('workbenchContextInstrumentToggle');
	root.instrumentItem = element('instrumentItem');
	root.instrumentItem.setAttribute('data-workbench-instrument-id', 'drawbar_organ');
	root.instrumentItem.closest = function (selector) {
		return selector === '.workbenchInstrumentMenuItem' ? root.instrumentItem : null;
	};
	root.contextToggle.closest = function (selector) {
		return selector === '#workbenchContextInstrumentToggle' ? root.contextToggle : null;
	};
	elements['#workbenchInstrumentMenu'] = root.menu;
	elements['#toggleWorkbenchInstrumentMenu'] = root.toggle;
	elements['#workbenchContextInstrumentToggle'] = root.contextToggle;
	elements['#toggleWorkbenchInstrumentMenu .material-icons'] = root.menuIcon;

	return root;
}

function element(id) {
	return {
		attributes: {},
		closest: function (selector) {
			return selector.charAt(0) === '#' && selector.slice(1) === id ? this : null;
		},
		getAttribute: function (name) {
			return this.attributes[name];
		},
		hidden: false,
		id: id,
		innerHTML: '',
		setAttribute: function (name, value) {
			this.attributes[name] = String(value);
		},
		textContent: ''
	};
}
