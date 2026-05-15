// Schema and normalization rules for progression workbench controls.
(function (global) {
	'use strict';

	var allowedArticulations = ['sustain', 'legato', 'staccato', 'arpeggio'];
	var allowedBars = [2, 4, 6, 8, 12, 16, 32];
	var allowedMeters = ['4/4', '3/4', '6/8'];
	var allowedStyles = ['modern', 'classic'];
	var allowedVoicings = ['closed', 'open'];
	var defaults = {
		articulation: 'sustain',
		bars: 8,
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
	};

	function normalize(values, fallback) {
		values = values || {};
		fallback = fallback || defaults;

		return {
			articulation: pick(values.articulation, allowedArticulations, fallback.articulation),
			bars: pickNumber(values.bars, allowedBars, fallback.bars),
			beatsPerBar: meterBeats(pick(values.meter, allowedMeters, fallback.meter)),
			beatUnit: meterUnit(pick(values.meter, allowedMeters, fallback.meter)),
			bpm: clampInteger(values.bpm, 20, 200, fallback.bpm),
			chromaticism: clampInteger(values.chromaticism, 0, 100, fallback.chromaticism),
			counterpoint: clampInteger(values.counterpoint, 0, 100, fallback.counterpoint),
			humanization: clampInteger(values.humanization, 0, 100, fallback.humanization),
			intensity: clampInteger(values.intensity, 1, 127, fallback.intensity),
			meter: pick(values.meter, allowedMeters, fallback.meter),
			modalInterchange: clampInteger(values.modalInterchange, 0, 100, fallback.modalInterchange),
			style: pick(values.style, allowedStyles, fallback.style),
			swing: clampInteger(values.swing, 0, 75, fallback.swing),
			tensions: clampInteger(values.tensions, 0, 100, fallback.tensions),
			voicing: pick(values.voicing, allowedVoicings, fallback.voicing),
			voices: clampInteger(values.voices, 1, 6, fallback.voices)
		};
	}

	function clone(value) {
		return {
			articulation: value.articulation,
			bars: value.bars,
			beatsPerBar: value.beatsPerBar,
			beatUnit: value.beatUnit,
			bpm: value.bpm,
			chromaticism: value.chromaticism,
			counterpoint: value.counterpoint,
			humanization: value.humanization,
			intensity: value.intensity,
			meter: value.meter,
			modalInterchange: value.modalInterchange,
			style: value.style,
			swing: value.swing,
			tensions: value.tensions,
			voicing: value.voicing,
			voices: value.voices
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

	global.CodaProgressionStateSchema = {
		allowedArticulations: allowedArticulations.slice(),
		allowedBars: allowedBars.slice(),
		allowedMeters: allowedMeters.slice(),
		allowedStyles: allowedStyles.slice(),
		allowedVoicings: allowedVoicings.slice(),
		clone: clone,
		defaults: clone(normalize(defaults)),
		normalize: normalize
	};
})(window);
