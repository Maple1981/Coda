// Shared cloning helpers for progression measures and measure segments.
(function (global) {
	'use strict';

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

		return clone;
	}

	function copySegmentToMeasure(measure, segment) {
		var keys = [
			'chord',
			'chordKind',
			'chordName',
			'degree',
			'displayName',
			'inversion',
			'inversionIndex',
			'midiNotes',
			'notes',
			'source',
			'suspension',
			'tonalFunction',
			'voiceNotes',
			'voices'
		];

		for (var i = 0; i < keys.length; i++) {
			measure[keys[i]] = segment[keys[i]];
		}

		return measure;
	}

	function cloneVoiceNotes(voiceNotes) {
		var result = [];

		for (var i = 0; i < voiceNotes.length; i++) {
			result.push(extendObject({}, voiceNotes[i]));
		}

		return result;
	}

	function extendObject(target, values) {
		var result = {};
		var key;

		for (key in target) {
			if (Object.prototype.hasOwnProperty.call(target, key)) {
				result[key] = target[key];
			}
		}

		for (key in values) {
			if (Object.prototype.hasOwnProperty.call(values, key)) {
				result[key] = values[key];
			}
		}

		return result;
	}

	global.CodaProgressionMeasureClone = {
		cloneMeasure: cloneMeasure,
		copySegmentToMeasure: copySegmentToMeasure,
		extendObject: extendObject
	};
})(window);
