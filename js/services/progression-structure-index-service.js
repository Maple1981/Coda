// Shared index and object helpers for progression structural editing.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;

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
		return objectService.extendObject(target, values);
	}

	global.CodaProgressionStructureIndex = {
		clampChordIndex: clampChordIndex,
		clampMeasureIndex: clampMeasureIndex,
		extendObject: extendObject
	};
})(window);
