// Resolucion de presets alternativos para articulaciones cortas.
(function (global) {
	'use strict';

	function resolveInstrument(instrument, articulation, playbackInstruments) {
		var baseInstrument = instrument || {};
		var targetId = resolveInstrumentId(baseInstrument, articulation);

		if (!targetId) {
			return baseInstrument;
		}

		return findInstrument(playbackInstruments, targetId) || {
			baseInstrumentId: baseInstrument.id,
			id: targetId,
			pedalBehavior: 'reattack',
			soundEnvelope: 'percussive',
			supportsPedalHold: false,
			sustained: false
		};
	}

	function resolveInstrumentId(instrument, articulation) {
		var key = articulationKey(articulation);
		var mappings = instrument && instrument.articulationInstruments;

		return key && mappings ? mappings[key] : '';
	}

	function articulationKey(articulation) {
		if (articulation === 'staccato') {
			return 'staccato';
		}

		if (isArpeggioArticulation(articulation)) {
			return 'arpeggio';
		}

		return '';
	}

	function isArpeggioArticulation(articulation) {
		return String(articulation || '').indexOf('arpeggio') === 0;
	}

	function findInstrument(instruments, instrumentId) {
		for (var i = 0; i < (instruments || []).length; i++) {
			if (instruments[i].id === instrumentId) {
				return instruments[i];
			}
		}

		return null;
	}

	global.CodaProgressionArticulationInstruments = {
		articulationKey: articulationKey,
		resolveInstrument: resolveInstrument,
		resolveInstrumentId: resolveInstrumentId
	};
})(window);
