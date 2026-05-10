// Catálogo musical extraído desde js/data.js.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//arreglo tipo hashtable de afinaciones para guitarra
	const afinaciones = new Array();
	afinaciones.push({"nombre" : "Estándar E", "patron" : "E-A-D-G-B-E", "enarmonica" : "E-A-D-G-B-E"});
	afinaciones.push({"nombre" : "E♭ tuning", "patron" : "Eb-Ab-Db-Gb-Bb-Eb", "enarmonica" : "D#-G#-C#-F#-A#-D#"});
	afinaciones.push({"nombre" : "Drop D♭", "patron" : "Db-Ab-Db-Gb-Bb-Eb", "enarmonica" : "C#-G#-C#-F#-A#-D#"});

	global.CodaDataCatalogs.tunings = afinaciones;
})(window);
