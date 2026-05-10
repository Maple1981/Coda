// Screen controller for the legacy scale report UI.
(function (global) {
	'use strict';

	function initialize(options) {
		var $ = options.$;
		var report = null;
		var selectedTuningIndex = 0;

		$('#interface input:radio[name="formato"][value="0"]').prop('checked', true);
		$('#interface input:radio[name="instrumento"][value="1"]').prop('checked', true);
		fillSelectHashTable($, $('#tonica'), options.data.notes, false);
		fillSelectHashTable($, $('#escala'), options.data.scales, false);
		applyRecommendedNotation($, options);
		initializeChangelogDialog($);
		options.ui.syncDashboardWorkspaceHeight($);

		$(window).on('resize', function () {
			options.ui.syncInstrumentScale($);
			options.ui.syncDashboardWorkspaceHeight($);
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
			fillSelectHashTable($, $('#tonica'), options.data.notes, preferFlats);

			if (options.ui.hasRenderedResults($)) {
				renderReport();
			}
		});

		$('#interface input:radio[name="instrumento"]').change(function () {
			if (options.ui.hasRenderedResults($)) {
				renderInstrument(true);
			}
		});

		$(document).on('click', '.revamp', function (event) {
			navigateToLinkedKey($, options.data.notes, event.target.id);
			applyRecommendedNotation($, options);
			renderReport();
		});

		$(document).on('change', '#selectorAfinaciones', function () {
			selectedTuningIndex = Number($(this).val());
			if (selectedTuningIndex >= 0) {
				renderInstrument(false);
			}
		});

		function renderReport() {
			var selection = options.ui.readSelection($);

			if (selection.scaleName === '------------') {
				report = null;
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

			options.ui.renderScaleReport({
				$: $,
				data: options.data,
				domain: options.domain,
				onChordClick: playChord(options.chordPlayback),
				onChordMouseOut: clearChordHighlight($),
				onChordMouseOver: highlightChord($),
				renderers: options.renderers,
				report: report,
				selection: selection
			});

			renderInstrument(true);
		}

		function renderInstrument(resetTuning) {
			var selection = options.ui.readSelection($);

			if (!report) {
				return;
			}

			if (resetTuning && selection.instrument === '0') {
				selectedTuningIndex = 0;
			}

			var instrumentView = options.application.buildInstrumentView({
				data: options.data,
				domain: options.domain,
				instrument: selection.instrument,
				octaveCount: 2,
				preferFlats: selection.preferFlats,
				report: report,
				tuningIndex: selectedTuningIndex
			});

			options.ui.renderInstrument({
				$: $,
				data: options.data,
				instrumentView: instrumentView,
				renderers: options.renderers,
				report: report
			});
			options.ui.syncInstrumentScale($);
			options.ui.syncDashboardWorkspaceHeight($);
		}

		return {
			renderInstrument: renderInstrument,
			renderReport: renderReport
		};
	}

	function fillSelectHashTable($, select, values, preferFlats) {
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

			html += '<option value="';
			html += i + '"' + selected + '>';
			html += name + '</option>';
		}

		select.empty().append(html);
	}

	function initializeChangelogDialog($) {
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
			title: 'Novedades y mejoras',
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

	function navigateToLinkedKey($, notes, targetId) {
		var selectedOption = targetId.split('_');
		var noteValue = findNoteValue(notes, selectedOption[0]);

		if (selectedOption[1].indexOf('m') > -1) {
			$('select#escala').val('2');
		} else {
			$('select#escala').val('0');
		}

		if (selectedOption[0].indexOf('#') > 0) {
			fillSelectHashTable($, $('#tonica'), notes, false);
		}

		if (selectedOption[0].indexOf('b') > 0) {
			fillSelectHashTable($, $('#tonica'), notes, true);
		}

		if (noteValue > -1) {
			$('select#tonica').val(String(noteValue));
		}
	}

	function findNoteValue(notes, noteName) {
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
		var preferFlats = options.domain.shouldPreferFlatsForKeySignature({
			notes: options.data.notes,
			scaleDefinition: scaleDefinition,
			selectedScaleIndex: scaleIndex,
			tonicName: $('select#tonica option:selected').text()
		});

		if (preferFlats == null) {
			return;
		}

		$('#interface input:radio[name="formato"][value="' + (preferFlats ? '1' : '0') + '"]').prop('checked', true);
		fillSelectHashTable($, $('#tonica'), options.data.notes, preferFlats);
	}

	function highlightChord($) {
		return function (element) {
			var instrumentNoteCells = $('td.celdaNota span');
			var noteNames = element.id.split('-');

			for (var i = 0; i < noteNames.length; i++) {
				for (var j = 0; j < instrumentNoteCells.length; j++) {
					if ($(instrumentNoteCells[j]).html() === noteNames[i]) {
						$(instrumentNoteCells[j]).addClass('resaltada');
					}
				}
			}
		};
	}

	function clearChordHighlight($) {
		return function () {
			var instrumentNoteCells = $('td.celdaNota span');

			for (var i = 0; i < instrumentNoteCells.length; i++) {
				$(instrumentNoteCells[i]).removeClass('resaltada');
			}
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

	global.CodaScaleReportController = {
		clearChordHighlight: clearChordHighlight,
		applyRecommendedNotation: applyRecommendedNotation,
		fillSelectHashTable: fillSelectHashTable,
		findNoteValue: findNoteValue,
		highlightChord: highlightChord,
		initializeChangelogDialog: initializeChangelogDialog,
		initialize: initialize,
		navigateToLinkedKey: navigateToLinkedKey,
		playChord: playChord
	};
})(window);
