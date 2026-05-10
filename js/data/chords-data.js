// Catálogo musical extraído desde js/data.js.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//arreglo tipo hashtable de los distintos acordes que pueden formarse
	const acordes = new Array(); //de cuatriada
	acordes.push({"nombre" : "Mayor séptima", "patron" : "1-4-7-11", "abreviatura" : "maj7"});
	acordes.push({"nombre" : "Dominante", "patron" : "1-4-7-10", "abreviatura" : "7"});
	acordes.push({"nombre" : "menor séptima", "patron" : "1-3-7-10", "abreviatura" : "m7"});
	acordes.push({"nombre" : "semidisminuido", "patron" : "1-3-6-10", "abreviatura" : "m7♭5"});
	acordes.push({"nombre" : "disminuído", "patron" : "1-3-6-9", "abreviatura" : "dim7"});
	acordes.push({"nombre" : "Tónica menor", "patron" : "1-3-7-11", "abreviatura" : "mMaj7"});
	acordes.push({"nombre" : "séptima con cuarta suspendida", "patron" : "1-5-7-10", "abreviatura" : "7sus4"});
	acordes.push({"nombre" : "séptima con quinta bemol", "patron" : "1-4-6-10", "abreviatura" : "7♭5"});
	acordes.push({"nombre" : "séptima con quinta aumentada", "patron" : "1-4-8-10", "abreviatura" : "7♯5"});
	acordes.push({"nombre" : "menor séptima con quinta aumentada", "patron" : "1-3-8-10", "abreviatura" : "m7♯5"});
	acordes.push({"nombre" : "sexta", "patron" : "1-4-7-9", "abreviatura" : "6"});
	acordes.push({"nombre" : "menor sexta", "patron" : "1-3-7-9", "abreviatura" : "m6"});
	acordes.push({"nombre" : "sexta con cuarta suspendida", "patron" : "1-5-7-9", "abreviatura" : "6sus4"});
	acordes.push({"nombre" : "novena añadida", "patron" : "1-4-7-14", "abreviatura" : "add9"});
	acordes.push({"nombre" : "menor con novena añadida", "patron" : "1-3-7-14", "abreviatura" : "madd9"});
	acordes.push({"nombre" : "undécima añadida", "patron" : "1-4-7-17", "abreviatura" : "add11"});
	acordes.push({"nombre" : "aumentado con séptima mayor", "patron" : "1-4-8-11", "abreviatura" : "+maj7"});
	acordes.push({"nombre" : "aumentado con séptima dominante", "patron" : "1-4-8-10", "abreviatura" : "+7"});
	
	//de triada
	acordes.push({"nombre" : "segunda suspendida", "patron" : "1-2-7", "abreviatura" : "sus2"});
	acordes.push({"nombre" : "segunda suspendida", "patron" : "1-4-7", "abreviatura" : "sus4"});

	global.CodaDataCatalogs.chords = acordes;
})(window);
