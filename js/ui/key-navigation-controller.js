// Navegación tonal y recomendación de formato de armadura.
(function (global) {
	'use strict';

	function navigateToLinkedKey($, notes, targetId, notation, notationStyle, fillSelect) {
		var selectedOption = targetId.split('_');
		var noteValue = findNoteValue(notes, selectedOption[0]);

		if (selectedOption[1].indexOf('m') > -1) {
			$('select#escala').val('2');
		} else {
			$('select#escala').val('0');
		}

		if (selectedOption[0].indexOf('#') > 0) {
			fillSelect($, $('#tonica'), notes, false, null, 'notes', notation, notationStyle);
		}

		if (selectedOption[0].indexOf('b') > 0) {
			fillSelect($, $('#tonica'), notes, true, null, 'notes', notation, notationStyle);
		}

		if (noteValue > -1) {
			$('select#tonica').val(String(noteValue));
		}
	}

	function findNoteValue(notes, noteName) {
		if (notes._codaIndex && notes._codaIndex.indexByName && notes._codaIndex.indexByName[noteName] !== undefined) {
			return notes._codaIndex.indexByName[noteName];
		}

		for (var i = 0; i < notes.length; i++) {
			if (notes[i].nombre === noteName || notes[i].enarmonica === noteName) {
				return i;
			}
		}

		return -1;
	}

	function applyRecommendedNotation($, options, fillSelect) {
		var scaleIndex = parseInt($('select#escala option:selected').val(), 10);
		var scaleDefinition = options.data.scales[scaleIndex];
		var tonicIndex = parseInt($('select#tonica option:selected').val(), 10);
		var tonicDefinition = options.data.notes[tonicIndex];

		if (!tonicDefinition) {
			return;
		}

		var preferFlats = options.domain.shouldPreferFlatsForKeySignature({
			notes: options.data.notes,
			scaleDefinition: scaleDefinition,
			selectedScaleIndex: scaleIndex,
			tonicName: options.ui.noteName(tonicDefinition, $('#interface input:radio[name="formato"]:checked').val() === '1')
		});

		if (preferFlats == null) {
			return;
		}

		$('#interface input:radio[name="formato"][value="' + (preferFlats ? '1' : '0') + '"]').prop('checked', true);
		fillSelect($, $('#tonica'), options.data.notes, preferFlats, null, 'notes', options.notation, resolveNotationStyle(options, $));
	}

	function resolveNotationStyle(options, $) {
		if (options.uiState) {
			return options.uiState.getNotationStyle();
		}

		return options.notation ? options.notation.normalizeStyle(options.initialNotation || $('#selectorNotacion').val()) : 'anglosaxon';
	}

	global.CodaKeyNavigation = {
		applyRecommendedNotation: applyRecommendedNotation,
		findNoteValue: findNoteValue,
		navigateToLinkedKey: navigateToLinkedKey,
		resolveNotationStyle: resolveNotationStyle
	};
})(window);
