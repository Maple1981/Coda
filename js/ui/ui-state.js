// Estado explícito de pantalla para desacoplar el controlador de variables en closures.
(function (global) {
	'use strict';

	function create(options) {
		options = options || {};

		var state = {
			language: options.language || 'es',
			notationStyle: options.initialNotation || 'anglosaxon',
			report: null,
			selectedTuningIndex: 0,
			selection: null
		};

		return {
			clearReport: function () {
				state.report = null;
			},
			getInstrument: function () {
				return state.selection ? state.selection.instrument : null;
			},
			getLanguage: function () {
				return state.language;
			},
			getNotationStyle: function () {
				return state.notationStyle;
			},
			getReport: function () {
				return state.report;
			},
			getSelectedTuningIndex: function () {
				return state.selectedTuningIndex;
			},
			getSelection: function () {
				return state.selection;
			},
			resetSelectedTuningIndex: function () {
				state.selectedTuningIndex = 0;
			},
			setLanguage: function (language) {
				state.language = language || state.language;
			},
			setNotationStyle: function (notationStyle) {
				state.notationStyle = notationStyle || state.notationStyle;
			},
			setReport: function (report) {
				state.report = report || null;
			},
			setSelectedTuningIndex: function (selectedTuningIndex) {
				state.selectedTuningIndex = selectedTuningIndex;
			},
			setSelection: function (selection) {
				state.selection = selection || null;
			},
			toJSON: function () {
				return {
					language: state.language,
					notationStyle: state.notationStyle,
					report: state.report,
					selectedTuningIndex: state.selectedTuningIndex,
					selection: state.selection
				};
			}
		};
	}

	global.CodaUiState = {
		create: create
	};
})(window);
