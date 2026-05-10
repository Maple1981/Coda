// Fachada estable de datos musicales. Los catálogos viven en js/data/*.js
// y se ensamblan aquí para conservar el contrato público CodaData.
(function (global) {
	'use strict';

	var catalogs = global.CodaDataCatalogs || {};

	global.CodaData = {
		constants: catalogs.constants,
		midi: catalogs.midi,
		notes: catalogs.notes,
		intervals: catalogs.intervals,
		scales: catalogs.scales,
		chords: catalogs.chords,
		tunings: catalogs.tunings,
		circleOfFifths: catalogs.circleOfFifths,
		extendedHarmony: catalogs.extendedHarmony
	};
})(window);
