// Contexto musical actual derivado de la selección de pantalla.
(function (global) {
	'use strict';

	function create(options) {
		options = options || {};

		function fromSelection(selection) {
			var data = options.data || {};
			var scaleDefinition = data.scales ? data.scales[selection.scaleIndex] : null;
			var tonicDefinition = data.notes ? data.notes[selection.tonicIndex] : null;

			return {
				instrument: selection.instrument,
				midiInstrument: selection.midiInstrument,
				mode: scaleDefinition ? scaleDefinition.tonal : null,
				preferFlats: selection.preferFlats,
				scaleDefinition: scaleDefinition,
				scaleIndex: selection.scaleIndex,
				scaleName: selection.scaleName,
				tonicDefinition: tonicDefinition,
				tonicIndex: selection.tonicIndex,
				tonicName: selection.tonicName,
				isScaleSeparator: selection.scaleName === '------------',
				isTonal: scaleDefinition ? scaleDefinition.tonal != null : false
			};
		}

		return {
			fromSelection: fromSelection
		};
	}

	global.CodaMusicalContext = {
		create: create
	};
})(window);
