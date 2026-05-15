// Internal progression-state normalizer for application use cases.
(function (global) {
	'use strict';

	var styleService = global.CodaProgressionStyle;

	function normalize(progressionState) {
		progressionState = progressionState || {};

		return {
			articulation: progressionState.articulation || 'sustain',
			bars: numberOrDefault(progressionState.bars, 8),
			beatUnit: numberOrDefault(progressionState.beatUnit, meterPart(progressionState.meter, 1, 4)),
			beatsPerBar: numberOrDefault(progressionState.beatsPerBar, meterPart(progressionState.meter, 0, 4)),
			bpm: numberOrDefault(progressionState.bpm, 120),
			chromaticism: numberOrDefault(progressionState.chromaticism, 10),
			counterpoint: numberOrDefault(progressionState.counterpoint, 20),
			humanization: numberOrDefault(progressionState.humanization, 0),
			intensity: numberOrDefault(progressionState.intensity, 80),
			meter: progressionState.meter || '4/4',
			modalInterchange: numberOrDefault(progressionState.modalInterchange, 25),
			style: styleService.normalize(progressionState),
			swing: numberOrDefault(progressionState.swing, 0),
			tensions: numberOrDefault(progressionState.tensions, 35),
			voicing: progressionState.voicing === 'open' ? 'open' : 'closed',
			voices: numberOrDefault(progressionState.voices, 4)
		};
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	function meterPart(meter, partIndex, fallback) {
		var parts = String(meter || '').split('/');
		var number = Number(parts[partIndex]);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionStateNormalizer = {
		normalize: normalize,
		numberOrDefault: numberOrDefault
	};
})(window);
