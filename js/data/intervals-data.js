// Catálogo musical extraído desde js/data.js.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//arreglo tipo hashtable de distancias de intervalo, sus nombres y el grado que les corresponde
	const intervalos = new Array();
	intervalos.push({"nombre" : "Unísono", "semitonos" : 0, "grado" : "I"});
	intervalos.push({"nombre" : "2ª menor", "semitonos" : 1, "grado" : "IIm"});
	intervalos.push({"nombre" : "2ª Mayor", "semitonos" : 2, "grado" : "II"});
	intervalos.push({"nombre" : "3ª menor", "semitonos" : 3, "grado" : "IIIm"});
	intervalos.push({"nombre" : "3ª Mayor", "semitonos" : 4, "grado" : "III"});
	intervalos.push({"nombre" : "4ª Justa", "semitonos" : 5, "grado" : "IVJ"});
	intervalos.push({"nombre" : "4ª aumentada / 5ª disminuida", "semitonos" : 6, "grado" : "IVaug"});
	intervalos.push({"nombre" : "5ª Justa", "semitonos" : 7, "grado" : "VJ"});
	intervalos.push({"nombre" : "6ª menor", "semitonos" : 8, "grado" : "VIm"});
	intervalos.push({"nombre" : "6ª Mayor", "semitonos" : 9, "grado" : "VI"});
	intervalos.push({"nombre" : "7ª menor", "semitonos" : 10, "grado" : "VIIm"});
	intervalos.push({"nombre" : "7ª Mayor", "semitonos" : 11, "grado" : "VII"});
	intervalos.push({"nombre" : "8ª Justa", "semitonos" : 12, "grado" : "VIIIJ"});
	intervalos.push({"nombre" : "9ª menor", "semitonos" : 13, "grado" : "IXm"});
	intervalos.push({"nombre" : "9ª Mayor", "semitonos" : 14, "grado" : "IX"});
	intervalos.push({"nombre" : "11ª Justa", "semitonos" : 17, "grado" : "XIJ"});
	intervalos.push({"nombre" : "13ª menor", "semitonos" : 20, "grado" : "XIIIm"});
	intervalos.push({"nombre" : "13ª Mayor", "semitonos" : 21, "grado" : "XIII"});

	global.CodaDataCatalogs.intervals = intervalos;
})(window);
