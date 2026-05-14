// Resolves tonal functions for progression degrees.
(function (global) {
	'use strict';

	function forDegree(scaleDefinition, degreeIndex) {
		var functions;
		var tonalFunction;

		if (!scaleDefinition || scaleDefinition.tonal !== 'true' || !scaleDefinition.funciones || degreeIndex < 0) {
			return '';
		}

		functions = String(scaleDefinition.funciones).split('-');
		tonalFunction = functions[degreeIndex] || '';

		return isDashPlaceholder(tonalFunction) ? '' : tonalFunction;
	}

	function isDashPlaceholder(value) {
		return value === '-' ||
			value === '\u2014' ||
			value === '\u00e2\u20ac\u201d' ||
			value === '\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u20ac\u009d' ||
			value === '\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u00e2\u201a\u00ac\u00c5\u00a1\u00c3\u201a\u00c2\u00ac\u00c3\u00a2\u00e2\u201a\u00ac\u00c2\u009d';
	}

	global.CodaProgressionTonalFunction = {
		forDegree: forDegree
	};
})(window);
