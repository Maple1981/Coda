// Shared object helpers for progression services.
(function (global) {
	'use strict';

	function extendObject(target, values) {
		var result = {};
		var key;

		target = target || {};
		values = values || {};

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

	function cloneObjects(items) {
		var result = [];

		for (var i = 0; i < (items || []).length; i++) {
			result.push(extendObject({}, items[i]));
		}

		return result;
	}

	global.CodaProgressionObjects = {
		cloneObjects: cloneObjects,
		extendObject: extendObject
	};
})(window);
