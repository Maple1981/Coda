// Mapeo entre preferencias ligeras de usuario y controles del constructor.
(function (global) {
	'use strict';

	var mappings = [
		{ id: 'progressionArticulation', preference: 'progressionArticulation', state: 'articulation' },
		{ id: 'progressionBars', preference: 'progressionBars', state: 'bars' },
		{ id: 'progressionBpm', preference: 'progressionBpm', state: 'bpm' },
		{ id: 'progressionChromaticism', preference: 'progressionChromaticism', state: 'chromaticism' },
		{ id: 'progressionCounterpoint', preference: 'progressionCounterpoint', state: 'counterpoint' },
		{ id: 'progressionHumanization', preference: 'progressionHumanization', state: 'humanization' },
		{ id: 'progressionIntensity', preference: 'progressionIntensity', state: 'intensity' },
		{ id: 'progressionMeter', preference: 'progressionMeter', state: 'meter' },
		{ id: 'progressionModalInterchange', preference: 'progressionModalInterchange', state: 'modalInterchange' },
		{ id: 'progressionStyle', preference: 'progressionStyle', state: 'style' },
		{ id: 'progressionSwing', preference: 'progressionSwing', state: 'swing' },
		{ id: 'progressionTensions', preference: 'progressionTensions', state: 'tensions' },
		{ id: 'progressionVoicing', preference: 'progressionVoicing', state: 'voicing' },
		{ id: 'progressionVoices', preference: 'progressionVoices', state: 'voices' }
	];

	function fromPreferences(preferences) {
		var state = {};

		preferences = preferences || {};

		for (var i = 0; i < mappings.length; i++) {
			if (preferences[mappings[i].preference] !== undefined) {
				state[mappings[i].state] = preferences[mappings[i].preference];
			}
		}

		return state;
	}

	function normalizeControls(values, progressionState) {
		var state = progressionState && typeof progressionState.normalize === 'function' ?
			progressionState.normalize(values || {}) :
			values || {};

		return controlsFromState(state);
	}

	function readControls(root) {
		var controls = {};

		for (var i = 0; i < mappings.length; i++) {
			controls[mappings[i].state] = valueOf(root, mappings[i].id);
		}

		return controls;
	}

	function writeControls(root, controls) {
		controls = controls || {};

		for (var i = 0; i < mappings.length; i++) {
			setValue(root, mappings[i].id, controls[mappings[i].state]);
		}
	}

	function save(preferences, root) {
		if (!preferences || typeof preferences.setValue !== 'function') {
			return;
		}

		for (var i = 0; i < mappings.length; i++) {
			preferences.setValue(mappings[i].preference, valueOf(root, mappings[i].id));
		}
	}

	function controlsFromState(state) {
		var controls = {};

		state = state || {};

		for (var i = 0; i < mappings.length; i++) {
			controls[mappings[i].state] = state[mappings[i].state];
		}

		return controls;
	}

	function valueOf(root, id) {
		var element = elementById(root, id);

		return element ? element.value : '';
	}

	function setValue(root, id, value) {
		var element = elementById(root, id);

		if (element && value !== undefined && value !== null) {
			element.value = value;
		}
	}

	function elementById(root, id) {
		root = root || global.document;

		return root && typeof root.getElementById === 'function' ? root.getElementById(id) : null;
	}

	global.CodaProgressionPreferences = {
		fromPreferences: fromPreferences,
		mappings: mappings.slice(),
		normalizeControls: normalizeControls,
		readControls: readControls,
		save: save,
		writeControls: writeControls
	};
})(window);
