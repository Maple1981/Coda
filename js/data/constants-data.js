// Constantes generales y configuración MIDI del catálogo musical.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//VARIABLES DE ÁMBITO GLOBAL, CONSTANTES
	const numeroNotasEscalaDiatonica = 12; //7 + alteraciones
	const numeroTrastes = 12; //diapasón de la guitarra
	
	global.CodaDataCatalogs.constants = {
		octaveSemitones: numeroNotasEscalaDiatonica,
		fretCount: numeroTrastes
	};
})(window);
