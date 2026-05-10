// Catálogo musical extraído desde js/data.js.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//arreglo tipo hashtable con el círculo de quintas
	const circuloQuintas = new Array();
	circuloQuintas.push({"nombre" : "C", "enarmonica" : "Am", "armadura" : ""});
	circuloQuintas.push({"nombre" : "G", "enarmonica" : "Em", "armadura" : "#"});
	circuloQuintas.push({"nombre" : "D", "enarmonica" : "Bm", "armadura" : "##"});
	circuloQuintas.push({"nombre" : "A", "enarmonica" : "F#m", "aka" : "Gbm", "armadura" : "###"});
	circuloQuintas.push({"nombre" : "E", "enarmonica" : "C#m", "aka" : "Dbm", "armadura" : "####"});
	circuloQuintas.push({"nombre" : "B", "enarmonica" : "G#m", "aka" : "Abm", "armadura" : "#####"});
	circuloQuintas.push({"nombre" : "Gb", "enarmonica" : "Ebm", "aka" : "Ebm", "armadura" : "######"});
	circuloQuintas.push({"nombre" : "Db", "aka" : "C#", "enarmonica" : "Bbm", "armadura" : "bbbbb"});
	circuloQuintas.push({"nombre" : "Ab", "aka" : "G#", "enarmonica" : "Fm", "armadura" : "bbbb"});
	circuloQuintas.push({"nombre" : "Eb", "aka" : "D#", "enarmonica" : "Cm", "armadura" : "bbb"});
	circuloQuintas.push({"nombre" : "Bb", "aka" : "A#", "enarmonica" : "Gm", "armadura" : "bb"});
	circuloQuintas.push({"nombre" : "F", "enarmonica" : "Dm", "armadura" : "b"});
	circuloQuintas.push({"nombre" : "F#", "enarmonica" : "D#m", "aka" : "D#m", "armadura" : "######"}); //agregado especial, enarmonica a Gb

	global.CodaDataCatalogs.circleOfFifths = circuloQuintas;
})(window);
