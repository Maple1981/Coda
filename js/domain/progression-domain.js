// Pure helpers for harmonic progressions. This first slice resolves degree
// symbols against already-built scale chords.
(function (global) {
	'use strict';

	function resolveProgressionDegrees(options) {
		var progression = [];

		for (var i = 0; i < options.degrees.length; i++) {
			var degree = options.degrees[i];
			var chord = findChordByDegree({
				degree: degree,
				scaleChords: options.scaleChords,
				scaleNotes: options.scaleNotes
			});

			progression.push({
				chord: chord,
				degree: degree
			});
		}

		return progression;
	}

	function findChordByDegree(options) {
		var normalizedDegree = normalizeDegree(options.degree);

		for (var i = 0; i < options.scaleNotes.length; i++) {
			if (normalizeDegree(options.scaleNotes[i].grado) === normalizedDegree) {
				return options.scaleChords[i];
			}
		}

		return undefined;
	}

	function normalizeDegree(degree) {
		return String(degree)
			.replace('J', '')
			.replace('M', '')
			.replace('m', '')
			.toUpperCase();
	}

	global.CodaProgressionDomain = {
		findChordByDegree: findChordByDegree,
		normalizeDegree: normalizeDegree,
		resolveProgressionDegrees: resolveProgressionDegrees
	};
})(window);
