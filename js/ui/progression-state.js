// Estado normalizado de los controles del constructor de progresiones.
(function (global) {
	'use strict';

	var schema = global.CodaProgressionStateSchema;

	function create(values) {
		var state = normalize(values);

		return {
			get: function () {
				return clone(state);
			},
			set: function (nextValues) {
				state = normalize(nextValues, state);
				return clone(state);
			},
			toJSON: function () {
				return clone(state);
			}
		};
	}

	function readFromControls(root) {
		root = root || global.document;

		return normalize({
			articulation: valueOf(root, 'progressionArticulation'),
			bars: valueOf(root, 'progressionBars'),
			bpm: valueOf(root, 'progressionBpm'),
			chromaticism: valueOf(root, 'progressionChromaticism'),
			counterpoint: valueOf(root, 'progressionCounterpoint'),
			generateMelodicVoice: checkedValueOf(root, 'progressionGenerateMelodicVoice'),
			harmonicDensity: valueOf(root, 'progressionHarmonicDensity'),
			humanization: valueOf(root, 'progressionHumanization'),
			intensity: valueOf(root, 'progressionIntensity'),
			meter: valueOf(root, 'progressionMeter'),
			modalInterchange: valueOf(root, 'progressionModalInterchange'),
			midiInstrument: valueOf(root, 'instrumentoSonoro'),
			style: valueOf(root, 'progressionStyle'),
			swing: valueOf(root, 'progressionSwing'),
			tensions: valueOf(root, 'progressionTensions'),
			voicing: valueOf(root, 'progressionVoicing'),
			voices: valueOf(root, 'progressionVoices')
		});
	}

	function normalize(values, fallback) {
		return schema.normalize(values, fallback);
	}

	function valueOf(root, id) {
		var element = root && typeof root.getElementById === 'function' ? root.getElementById(id) : null;

		return element ? element.value : undefined;
	}

	function checkedValueOf(root, id) {
		var element = root && typeof root.getElementById === 'function' ? root.getElementById(id) : null;

		return element ? element.checked !== false : undefined;
	}

	function clone(value) {
		return schema.clone(value);
	}

	global.CodaProgressionState = {
		allowedArticulations: schema.allowedArticulations.slice(),
		allowedBars: schema.allowedBars.slice(),
		allowedMeters: schema.allowedMeters.slice(),
		allowedStyles: schema.allowedStyles.slice(),
		allowedVoicings: schema.allowedVoicings.slice(),
		create: create,
		defaults: clone(schema.defaults),
		normalize: normalize,
		readFromControls: readFromControls
	};
})(window);
