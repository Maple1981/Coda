// Estado normalizado de los controles del constructor de progresiones.
(function (global) {
	'use strict';

	var allowedArticulations = ['sustain', 'legato', 'staccato', 'arpeggio'];
	var allowedBars = [2, 4, 6, 8, 12, 16, 32];
	var allowedMeters = ['4/4', '3/4', '6/8'];
	var allowedStyles = ['modern', 'classic'];
	var defaults = {
		articulation: 'sustain',
		bars: 8,
		bpm: 120,
		counterpoint: 20,
		meter: '4/4',
		modalInterchange: 25,
		style: 'modern',
		tensions: 35,
		voices: 4
	};

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
			counterpoint: valueOf(root, 'progressionCounterpoint'),
			meter: valueOf(root, 'progressionMeter'),
			modalInterchange: valueOf(root, 'progressionModalInterchange'),
			style: valueOf(root, 'progressionStyle'),
			tensions: valueOf(root, 'progressionTensions'),
			voices: valueOf(root, 'progressionVoices')
		});
	}

	function normalize(values, fallback) {
		values = values || {};
		fallback = fallback || defaults;

		return {
			articulation: pick(values.articulation, allowedArticulations, fallback.articulation),
			bars: pickNumber(values.bars, allowedBars, fallback.bars),
			beatsPerBar: meterBeats(pick(values.meter, allowedMeters, fallback.meter)),
			beatUnit: meterUnit(pick(values.meter, allowedMeters, fallback.meter)),
			bpm: clampInteger(values.bpm, 20, 200, fallback.bpm),
			counterpoint: clampInteger(values.counterpoint, 0, 100, fallback.counterpoint),
			meter: pick(values.meter, allowedMeters, fallback.meter),
			modalInterchange: clampInteger(values.modalInterchange, 0, 100, fallback.modalInterchange),
			style: pick(values.style, allowedStyles, fallback.style),
			tensions: clampInteger(values.tensions, 0, 100, fallback.tensions),
			voices: clampInteger(values.voices, 1, 6, fallback.voices)
		};
	}

	function pick(value, allowedValues, fallback) {
		return allowedValues.indexOf(value) > -1 ? value : fallback;
	}

	function pickNumber(value, allowedValues, fallback) {
		var numericValue = parseInt(value, 10);

		return allowedValues.indexOf(numericValue) > -1 ? numericValue : fallback;
	}

	function clampInteger(value, min, max, fallback) {
		var numericValue = parseInt(value, 10);

		if (isNaN(numericValue)) {
			return fallback;
		}

		return Math.max(min, Math.min(max, numericValue));
	}

	function meterBeats(meter) {
		return parseInt(String(meter).split('/')[0], 10);
	}

	function meterUnit(meter) {
		return parseInt(String(meter).split('/')[1], 10);
	}

	function valueOf(root, id) {
		var element = root && typeof root.getElementById === 'function' ? root.getElementById(id) : null;

		return element ? element.value : undefined;
	}

	function clone(value) {
		return {
			articulation: value.articulation,
			bars: value.bars,
			beatsPerBar: value.beatsPerBar,
			beatUnit: value.beatUnit,
			bpm: value.bpm,
			counterpoint: value.counterpoint,
			meter: value.meter,
			modalInterchange: value.modalInterchange,
			style: value.style,
			tensions: value.tensions,
			voices: value.voices
		};
	}

	global.CodaProgressionState = {
		allowedArticulations: allowedArticulations.slice(),
		allowedBars: allowedBars.slice(),
		allowedMeters: allowedMeters.slice(),
		allowedStyles: allowedStyles.slice(),
		create: create,
		defaults: clone(normalize(defaults)),
		normalize: normalize,
		readFromControls: readFromControls
	};
})(window);
