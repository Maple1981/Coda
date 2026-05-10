// Screen controller for the legacy scale report UI.
(function (global) {
	'use strict';

	function initialize(options) {
		var $ = options.$;
		var i18n = options.i18n;
		var notation = options.notation;
		var preferences = options.preferences;
		var uiState = options.uiState || global.CodaUiState.create({
			initialNotation: notation ? notation.normalizeStyle(options.initialNotation) : 'anglosaxon',
			language: i18n && i18n.getLanguage ? i18n.getLanguage() : 'es'
		});
		uiState.setNotationStyle(notation ? notation.normalizeStyle(options.initialNotation) : 'anglosaxon');

		$('#interface input:radio[name="formato"][value="0"]').prop('checked', true);
		$('#interface input:radio[name="instrumento"][value="1"]').prop('checked', true);
		$('#selectorNotacion').val(uiState.getNotationStyle());
		fillSelectHashTable($, $('#tonica'), options.data.notes, false, null, 'notes', notation, uiState.getNotationStyle());
		fillSelectHashTable($, $('#escala'), options.data.scales, false, i18n, 'scales');
		applyRecommendedNotation($, options);
		if (i18n) {
			i18n.applyStatic($);
		}
		initializeChangelogDialog($, i18n);
		options.ui.scheduleDashboardWorkspaceHeight($);

		$(window).on('resize', function () {
			options.ui.scheduleSidebarPanelViewport($);
			options.ui.scheduleInstrumentScale($);
			options.ui.scheduleDashboardWorkspaceHeight($);
		});
		$(window).on('scroll', function () {
			options.ui.scheduleSidebarPanelViewport($);
		});

		$('#btnEscala').click(function () {
			renderReport();
		});

		$('#interface select').change(function () {
			applyRecommendedNotation($, options);

			if (options.ui.hasRenderedResults($)) {
				renderReport();
			}
		});

		$('#interface input:radio[name="formato"]').change(function () {
			var preferFlats = $(this).val() === '1';
			fillSelectHashTable($, $('#tonica'), options.data.notes, preferFlats, null, 'notes', notation, currentNotation);

			if (options.ui.hasRenderedResults($)) {
				renderReport();
			}
		});

		$('#interface input:radio[name="instrumento"]').change(function () {
			if (options.ui.hasRenderedResults($)) {
				renderInstrument(true);
			}
		});

		$('#selectorIdioma').change(function () {
			if (i18n) {
				i18n.setLanguage($(this).val());
				uiState.setLanguage(i18n.getLanguage());
				savePreference(preferences, 'language', i18n.getLanguage());
				fillSelectHashTable($, $('#escala'), options.data.scales, false, i18n, 'scales');
				i18n.applyStatic($);
			}

			if (options.ui.hasRenderedResults($)) {
				renderReport();
			}

			options.ui.scheduleInstrumentScale($);
			options.ui.scheduleDashboardWorkspaceHeight($);
		});

		$('#selectorNotacion').change(function () {
			uiState.setNotationStyle(notation ? notation.normalizeStyle($(this).val()) : 'anglosaxon');
			savePreference(preferences, 'notation', uiState.getNotationStyle());
			fillSelectHashTable(
				$,
				$('#tonica'),
				options.data.notes,
				$('#interface input:radio[name="formato"]:checked').val() === '1',
				null,
				'notes',
				notation,
				uiState.getNotationStyle()
			);

			if (options.ui.hasRenderedResults($)) {
				renderReport();
			}

			options.ui.scheduleInstrumentScale($);
			options.ui.scheduleDashboardWorkspaceHeight($);
		});

		$(document).on('click', '.revamp', function (event) {
			navigateToLinkedKey($, options.data.notes, event.target.id, notation, uiState.getNotationStyle());
			applyRecommendedNotation($, options);
			renderReport();
		});

		$(document).on('change', '#selectorAfinaciones', function () {
			uiState.setSelectedTuningIndex(Number($(this).val()));
			if (uiState.getSelectedTuningIndex() >= 0) {
				renderInstrument(false);
			}
		});

		function renderReport() {
			var selection = options.ui.readSelection($, options.data);
			var report;
			uiState.setSelection(selection);

			if (selection.scaleName === '------------') {
				uiState.clearReport();
				return;
			}

			report = options.application.buildScaleReport({
				data: options.data,
				domain: options.domain,
				preferFlats: selection.preferFlats,
				scaleIndex: selection.scaleIndex,
				scaleName: selection.scaleName,
				tonicIndex: selection.tonicIndex,
				tonicName: selection.tonicName
			});
			uiState.setReport(report);

			options.ui.renderScaleReport({
				$: $,
				data: options.data,
				domain: options.domain,
				onChordClick: playChord(options.chordPlayback),
				onChordMouseOut: clearChordHighlight($),
				onChordMouseOver: highlightChord($),
				i18n: i18n,
				notation: notation,
				notationStyle: uiState.getNotationStyle(),
				renderers: options.renderers,
				report: report,
				selection: selection
			});

			renderInstrument(true);
		}

		function renderInstrument(resetTuning) {
			var selection = options.ui.readSelection($, options.data);
			var report = uiState.getReport();
			uiState.setSelection(selection);

			if (!report) {
				return;
			}

			if (resetTuning && selection.instrument === '0') {
				uiState.resetSelectedTuningIndex();
			}

			var instrumentView = options.application.buildInstrumentView({
				data: options.data,
				domain: options.domain,
				instrument: selection.instrument,
				octaveCount: 2,
				preferFlats: selection.preferFlats,
				report: report,
				tuningIndex: uiState.getSelectedTuningIndex()
			});

			options.ui.renderInstrument({
				$: $,
				data: options.data,
				i18n: i18n,
				instrumentView: instrumentView,
				notation: notation,
				notationStyle: uiState.getNotationStyle(),
				onInstrumentNoteClick: playInstrumentNote(options.instrumentPlayback),
				renderers: options.renderers,
				report: report
			});
			options.ui.scheduleInstrumentScale($);
			options.ui.scheduleDashboardWorkspaceHeight($);
		}

		return {
			renderInstrument: renderInstrument,
			renderReport: renderReport,
			uiState: uiState
		};
	}

	function fillSelectHashTable($, select, values, preferFlats, i18n, collectionName, notation, notationStyle) {
		var html = '';

		for (var i = 0; i < values.length; i++) {
			var name = values[i].nombre;
			var selected = '';

			if (i == $('select#' + select.attr('id') + ' option:selected').val()) {
				selected = ' selected ';
			}

			if (preferFlats && values[i].enarmonica !== undefined) {
				name = values[i].enarmonica;
			}

			if (i18n && collectionName) {
				name = i18n.dataLabel(collectionName, i, name);
			}

			if (notation && collectionName === 'notes') {
				name = notation.formatNoteName(name, notationStyle);
			}

			html += '<option value="';
			html += i + '"' + selected + '>';
			html += name + '</option>';
		}

		select.empty().append(html);
	}

	function initializeChangelogDialog($, i18n) {
		if (typeof $('#controlVersiones').dialog !== 'function') {
			return;
		}

		$('#controlVersiones').dialog({
			autoOpen: false,
			classes: {
				'ui-dialog': 'dialogoNovedades'
			},
			height: Math.min(720, $(window).height() - 60),
			modal: true,
			title: i18n ? i18n.t('changelog.dialogTitle') : 'Novedades y mejoras',
			width: Math.min(920, $(window).width() - 40)
		});

		$('#enlaceNovedades').click(function (event) {
			event.preventDefault();
			$('#controlVersiones').dialog('open');
		});

		$(document).on('mousedown', '.ui-widget-overlay', function () {
			$('#controlVersiones').dialog('close');
		});
	}

	function navigateToLinkedKey($, notes, targetId, notation, notationStyle) {
		var selectedOption = targetId.split('_');
		var noteValue = findNoteValue(notes, selectedOption[0]);

		if (selectedOption[1].indexOf('m') > -1) {
			$('select#escala').val('2');
		} else {
			$('select#escala').val('0');
		}

		if (selectedOption[0].indexOf('#') > 0) {
			fillSelectHashTable($, $('#tonica'), notes, false, null, 'notes', notation, notationStyle);
		}

		if (selectedOption[0].indexOf('b') > 0) {
			fillSelectHashTable($, $('#tonica'), notes, true, null, 'notes', notation, notationStyle);
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

	function applyRecommendedNotation($, options) {
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
		fillSelectHashTable($, $('#tonica'), options.data.notes, preferFlats, null, 'notes', options.notation, resolveNotationStyle(options));
	}

	function resolveNotationStyle(options) {
		if (options.uiState) {
			return options.uiState.getNotationStyle();
		}

		return options.notation ? options.notation.normalizeStyle(options.initialNotation || $('#selectorNotacion').val()) : 'anglosaxon';
	}

	function highlightChord($) {
		return function (element) {
			var noteNames = element.id.split('-');

			for (var i = 0; i < noteNames.length; i++) {
				$('td.celdaNota span[data-note-name="' + noteNames[i] + '"]').addClass('resaltada');
			}
		};
	}

	function clearChordHighlight($) {
		return function () {
			$('td.celdaNota span.resaltada').removeClass('resaltada');
		};
	}

	function playChord(chordPlayback) {
		return function (element) {
			chordPlayback.playChordFromCellId(element.id, {
				bassOctaveOffset: -12,
				duration: 0.75
			});
		};
	}

	function playInstrumentNote(instrumentPlayback) {
		return function (element) {
			if (!instrumentPlayback) {
				return;
			}

			instrumentPlayback.playMidiNote(element.getAttribute('data-midi-note'), {
				duration: 0.55
			});
		};
	}

	function savePreference(preferences, key, value) {
		if (preferences) {
			preferences.setValue(key, value);
		}
	}

	global.CodaScaleReportController = {
		clearChordHighlight: clearChordHighlight,
		applyRecommendedNotation: applyRecommendedNotation,
		fillSelectHashTable: fillSelectHashTable,
		findNoteValue: findNoteValue,
		highlightChord: highlightChord,
		initializeChangelogDialog: initializeChangelogDialog,
		initialize: initialize,
		navigateToLinkedKey: navigateToLinkedKey,
		playChord: playChord,
		playInstrumentNote: playInstrumentNote
	};
})(window);
