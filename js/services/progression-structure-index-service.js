// Shared index and object helpers for progression structural editing.
(function (global) {
	'use strict';

	function clampMeasureIndex(index, length) {
		return clampIndex(index, length);
	}

	function clampChordIndex(index, length) {
		return clampIndex(index, length);
	}

	function clampIndex(index, length) {
		var numericIndex = parseInt(index, 10);

		if (!length || isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(length - 1, numericIndex));
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

	global.CodaProgressionStructureIndex = {
		clampChordIndex: clampChordIndex,
		clampMeasureIndex: clampMeasureIndex,
		extendObject: extendObject
	};
})(window);
