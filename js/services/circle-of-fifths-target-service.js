// Resolves circle-of-fifths DOM target ids into scale reports.
(function (global) {
	'use strict';

	function reportForTarget(options) {
		var target = targetFromId(options && options.targetId);
		var noteIndex;

		if (!target || !options || !options.application || typeof options.application.buildScaleReport !== 'function') {
			return null;
		}

		noteIndex = findNoteValue(options.data ? options.data.notes : [], target.tonicName, options.keyNavigation);
		if (noteIndex < 0) {
			return null;
		}

		return options.application.buildScaleReport({
			data: options.data,
			domain: options.domain,
			preferFlats: target.preferFlats,
			scaleIndex: target.scaleIndex,
			scaleName: options.data.scales[target.scaleIndex].nombre,
			tonicIndex: noteIndex,
			tonicName: target.tonicName
		});
	}

	function targetFromId(targetId) {
		var parts = String(targetId || '').split('_');
		var tonicName = parts[0];

		if (!tonicName) {
			return null;
		}

		return {
			preferFlats: tonicName.indexOf('b') > -1,
			scaleIndex: parts[1] && parts[1].indexOf('m') > -1 ? 2 : 0,
			tonicName: tonicName
		};
	}

	function findNoteValue(notes, noteName, keyNavigation) {
		if (keyNavigation && typeof keyNavigation.findNoteValue === 'function') {
			return keyNavigation.findNoteValue(notes, noteName);
		}

		for (var i = 0; i < (notes || []).length; i++) {
			if (notes[i].nombre === noteName || notes[i].enarmonica === noteName) {
				return i;
			}
		}

		return -1;
	}

	global.CodaCircleOfFifthsTargets = {
		findNoteValue: findNoteValue,
		reportForTarget: reportForTarget,
		targetFromId: targetFromId
	};
})(window);
