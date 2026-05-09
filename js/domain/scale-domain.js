// Scale construction rules. This module has no DOM, jQuery, MIDI, or rendering dependencies.
(function (global) {
	'use strict';

	var utils = global.CodaMusicUtils;

	function buildScale(options) {
		var scaleDefinition = options.scaleDefinition;
		var scalePattern = utils.parsePattern(scaleDefinition.patron);
		var position = options.tonicIndex;
		var semitoneSum = 0;
		var modalPrincipal = 0;
		var modalSecondary = 0;
		var scaleNotes = [];

		if (scaleDefinition.modal === 'true') {
			var characteristicNotes = scaleDefinition.caracteristicas.split('-');
			modalPrincipal = parseInt(characteristicNotes[0], 10);
			modalSecondary = parseInt(characteristicNotes[1], 10);
		}

		for (var i = 0; i < scalePattern.length; i++) {
			position += scalePattern[i];
			if (position >= options.octaveSemitones) {
				position -= options.octaveSemitones;
			}

			semitoneSum += scalePattern[i];

			var interval = utils.findInterval(options.intervals, semitoneSum);
			var scaleNote = {
				nombre: utils.noteName(options.notes[position], options.preferFlats),
				semitonos: semitoneSum,
				nombreGrado: interval.nombre,
				grado: interval.grado
			};

			if (scaleDefinition.modal === 'true' && modalPrincipal > 0 && modalSecondary > 0) {
				if (i + 1 === modalPrincipal) {
					scaleNote.tipo = 'principal';
				} else if (i + 1 === modalSecondary) {
					scaleNote.tipo = 'secundaria';
				} else {
					scaleNote.tipo = null;
				}
			}

			scaleNotes.push(scaleNote);
		}

		return scaleNotes;
	}

	global.CodaScaleDomain = {
		buildScale: buildScale
	};
})(window);
