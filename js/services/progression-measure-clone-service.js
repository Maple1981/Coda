// Shared cloning helpers for progression measures and measure segments.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;

	function cloneMeasure(measure) {
		var clone = {};

		for (var key in measure) {
			if (Object.prototype.hasOwnProperty.call(measure, key)) {
				if ((key === 'notes' || key === 'midiNotes') && measure[key]) {
					clone[key] = measure[key].slice();
				} else if (key === 'chords' && measure[key]) {
					clone[key] = measure[key].map(cloneMeasure);
				} else if (key === 'voiceNotes' && measure[key]) {
					clone[key] = cloneVoiceNotes(measure[key]);
				} else {
					clone[key] = measure[key];
				}
			}
		}

		copyInternalValue(clone, measure, 'inversionRunKey');
		copyInternalValue(clone, measure, 'inversionRunLength');

		return clone;
	}

	function copySegmentToMeasure(measure, segment) {
		var keys = [
			'chord',
			'beatsPerBar',
			'chordKind',
			'chordName',
			'degree',
			'displayName',
			'humanization',
			'intensity',
			'inversion',
			'inversionIndex',
			'midiNotes',
			'notes',
			'source',
			'swing',
			'suspension',
			'tonalFunction',
			'voiceNotes',
			'voices'
		];

		for (var i = 0; i < keys.length; i++) {
			measure[keys[i]] = segment[keys[i]];
		}

		copyInternalValue(measure, segment, 'inversionRunKey');
		copyInternalValue(measure, segment, 'inversionRunLength');

		return measure;
	}

	function copyInternalValue(target, source, key) {
		if (!target || !source || source[key] == null) {
			return;
		}

		if (typeof Object.defineProperty === 'function') {
			Object.defineProperty(target, key, {
				configurable: true,
				enumerable: false,
				value: source[key],
				writable: true
			});
			return;
		}

		target[key] = source[key];
	}

	function cloneVoiceNotes(voiceNotes) {
		return objectService.cloneObjects(voiceNotes);
	}

	function extendObject(target, values) {
		return objectService.extendObject(target, values);
	}

	global.CodaProgressionMeasureClone = {
		cloneMeasure: cloneMeasure,
		copySegmentToMeasure: copySegmentToMeasure,
		extendObject: extendObject
	};
})(window);
