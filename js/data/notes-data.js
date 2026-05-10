// Catálogo musical extraído desde js/data.js.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//arreglo tipo hashtable de las 12 notas de la escala diatónica y sus correspondientes enarmonías
	const notas = new Array();
	notas.push({"nombre" : "C"});
	notas.push({"nombre" : "C#", "enarmonica" : "Db"});
	notas.push({"nombre" : "D"});
	notas.push({"nombre" : "D#", "enarmonica" : "Eb"});
	notas.push({"nombre" : "E"});
	notas.push({"nombre" : "F"});
	notas.push({"nombre" : "F#", "enarmonica" : "Gb"});
	notas.push({"nombre" : "G"});
	notas.push({"nombre" : "G#", "enarmonica" : "Ab"});
	notas.push({"nombre" : "A"});
	notas.push({"nombre" : "A#", "enarmonica" : "Bb"});
	notas.push({"nombre" : "B"});

	global.CodaDataCatalogs.notes = notas;
})(window);
