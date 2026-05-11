// Navegación tonal y recomendación de formato de armadura.
(function (global) {
	'use strict';

	function navigateToLinkedKey(notes, targetId, notation, notationStyle, fillSelect) {
		var selectedOption = targetId.split('_');
		var noteValue = findNoteValue(notes, selectedOption[0]);
		var scaleSelect = getElement('escala');
		var tonicSelect = getElement('tonica');

		if (selectedOption[1].indexOf('m') > -1) {
			setValue(scaleSelect, '2');
		} else {
			setValue(scaleSelect, '0');
		}

		if (selectedOption[0].indexOf('#') > 0) {
			fillSelect(tonicSelect, notes, false, null, 'notes', notation, notationStyle);
		}

		if (selectedOption[0].indexOf('b') > 0) {
			fillSelect(tonicSelect, notes, true, null, 'notes', notation, notationStyle);
		}

		if (noteValue > -1) {
			setValue(tonicSelect, String(noteValue));
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

	function applyRecommendedNotation(options, fillSelect) {
		var scaleSelect = getElement('escala');
		var tonicSelect = getElement('tonica');
		var formatInput = getCheckedFormatInput();
		var scaleIndex = parseInt(getValue(scaleSelect), 10);
		var scaleDefinition = options.data.scales[scaleIndex];
		var tonicIndex = parseInt(getValue(tonicSelect), 10);
		var tonicDefinition = options.data.notes[tonicIndex];

		if (!tonicDefinition) {
			return;
		}

		var preferFlats = options.domain.shouldPreferFlatsForKeySignature({
			notes: options.data.notes,
			scaleDefinition: scaleDefinition,
			selectedScaleIndex: scaleIndex,
			tonicName: options.ui.noteName(tonicDefinition, getValue(formatInput) === '1')
		});

		if (preferFlats == null) {
			return;
		}

		checkFormat(preferFlats ? '1' : '0');
		fillSelect(tonicSelect, options.data.notes, preferFlats, null, 'notes', options.notation, resolveNotationStyle(options));
	}

	function resolveNotationStyle(options) {
		if (options.uiState) {
			return options.uiState.getNotationStyle();
		}

		return options.notation ? options.notation.normalizeStyle(options.initialNotation || getValue(getElement('selectorNotacion'))) : 'anglosaxon';
	}

	function getElement(id) {
		return global.document ? global.document.getElementById(id) : null;
	}

	function getCheckedFormatInput() {
		return global.document ? global.document.querySelector('#interface input[type="radio"][name="formato"]:checked') : null;
	}

	function checkFormat(value) {
		var input = global.document ? global.document.querySelector('#interface input[type="radio"][name="formato"][value="' + value + '"]') : null;

		if (input) {
			input.checked = true;
		}
	}

	function getValue(element) {
		return element ? element.value : '';
	}

	function setValue(element, value) {
		if (element) {
			element.value = value;
		}
	}

	global.CodaKeyNavigation = {
		applyRecommendedNotation: applyRecommendedNotation,
		findNoteValue: findNoteValue,
		navigateToLinkedKey: navigateToLinkedKey,
		resolveNotationStyle: resolveNotationStyle
	};
})(window);
