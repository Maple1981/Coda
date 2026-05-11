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

	function createDiatonicDegreePlan(options) {
		var scaleNotes = options.scaleNotes || [];
		var indexes = degreeIndexesForBars(options.bars);
		var degrees = [];

		for (var i = 0; i < indexes.length; i++) {
			degrees.push(degreeNameAt(scaleNotes, indexes[i]));
		}

		return degrees;
	}

	function degreeIndexesForBars(bars) {
		var normalizedBars = parseInt(bars, 10);
		var templates = {
			2: [0, 4],
			4: [0, 3, 4, 0],
			6: [0, 5, 3, 1, 4, 0],
			8: [0, 5, 1, 4, 0, 3, 4, 0],
			12: [0, 5, 1, 4, 0, 5, 3, 1, 0, 3, 4, 0],
			16: [0, 5, 1, 4, 0, 3, 4, 0, 0, 5, 1, 4, 0, 3, 4, 0]
		};

		if (normalizedBars === 32) {
			return templates[16].concat(templates[16]);
		}

		return templates[normalizedBars] || templates[8];
	}

	function degreeNameAt(scaleNotes, index) {
		if (!scaleNotes.length) {
			return '';
		}

		return scaleNotes[index % scaleNotes.length].grado;
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
		createDiatonicDegreePlan: createDiatonicDegreePlan,
		degreeIndexesForBars: degreeIndexesForBars,
		findChordByDegree: findChordByDegree,
		normalizeDegree: normalizeDegree,
		resolveProgressionDegrees: resolveProgressionDegrees
	};
})(window);
