// Constantes generales y configuración MIDI del catálogo musical.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//VARIABLES DE ÁMBITO GLOBAL, CONSTANTES
	const numeroNotasEscalaDiatonica = 12; //7 + alteraciones
	const numeroTrastes = 12; //diapasón de la guitarra
	
	//variables MIDI
	const delay = 0; // toca la nota cada cuarto de segundo
	const note = -1; // la nota MIDI
	const velocity = 127; // volumen de dicha nota
	const channel = 0; // canal
	const Cinicial = 60; //nota MIDI de la octava inicial desde donde reproducir sonidos de ejemplo. En notación científica MIDI, C4 = 60.

	global.CodaDataCatalogs.constants = {
		octaveSemitones: numeroNotasEscalaDiatonica,
		fretCount: numeroTrastes
	};
	global.CodaDataCatalogs.midi = {
		delay: delay,
		note: note,
		velocity: velocity,
		channel: channel,
		initialMidiNote: Cinicial
	};
})(window);
