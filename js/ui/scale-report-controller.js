// Screen controller for the legacy scale report UI.
(function (global) {
	'use strict';

	function initialize(options) {
		var $ = options.$;
		var i18n = options.i18n;
		var keyNavigation = options.keyNavigation || global.CodaKeyNavigation;
		var musicalContextService = options.musicalContext || global.CodaMusicalContext.create({
			data: options.data
		});
		var notation = options.notation;
		var preferences = options.preferences;
		var staticText = options.staticText || global.CodaStaticText;
		var uiState = options.uiState || global.CodaUiState.create({
			initialNotation: notation ? notation.normalizeStyle(options.initialNotation) : 'anglosaxon',
			language: i18n && i18n.getLanguage ? i18n.getLanguage() : 'es'
		});
		uiState.setNotationStyle(notation ? notation.normalizeStyle(options.initialNotation) : 'anglosaxon');
		var initialForm = resolveInitialForm(options.data, options.initialForm);

		$('#interface input:radio[name="formato"][value="' + initialForm.format + '"]').prop('checked', true);
		updateFormatLabelTarget($);
		$('#selectorNotacion').val(uiState.getNotationStyle());
		fillSelectHashTable($, $('#tonica'), options.data.notes, initialForm.format === '1', null, 'notes', notation, uiState.getNotationStyle());
		$('#tonica').val(String(initialForm.tonicIndex));
		fillSelectHashTable($, $('#escala'), options.data.scales, false, i18n, 'scales');
		$('#escala').val(String(initialForm.scaleIndex));
		fillInstrumentSelect($, $('#instrumentoSonoro'), options.data.midiInstruments, i18n);
		$('#instrumentoSonoro').val(initialForm.midiInstrument);
		setPlaybackInstrument(options, $('#instrumentoSonoro').val());
		if (!hasInitialFormValue(options.initialForm, 'format')) {
			keyNavigation.applyRecommendedNotation($, options, fillSelectHashTable);
			updateFormatLabelTarget($);
		}
		if (staticText) {
			staticText.apply($, i18n);
		}
		if (options.themeControl) {
			options.themeControl.initialize({
				$: $,
				i18n: i18n,
				initialTheme: options.initialTheme,
				preferences: preferences
			});
		}
		if (options.volumeControl) {
			options.volumeControl.initialize({
				$: $,
				initialVolume: options.initialVolume,
				playbackService: options.playbackService,
				preferences: preferences
			});
		}
		if (options.changelogDialog) {
			options.changelogDialog.initialize($, i18n);
		}
		if (options.randomSelectControl) {
			options.randomSelectControl.initialize({
				$: $,
				i18n: i18n
			});
		}
		updateCollapsiblePanelStates($, i18n);
		options.ui.scheduleDashboardWorkspaceHeight($);

		$(window).on('resize', function () {
			options.ui.scheduleSidebarPanelViewport($);
			options.ui.scheduleInstrumentScale($);
			options.ui.scheduleDashboardWorkspaceHeight($);
		});
		$(window).on('scroll', function () {
			options.ui.scheduleSidebarPanelViewport($);
		});

		$('#toggleTheoryControls').click(function () {
			$('#interface').toggleClass('isCollapsed');
			updateCollapsiblePanelStates($, i18n);
			options.ui.scheduleSidebarPanelViewport($);
			options.ui.scheduleDashboardWorkspaceHeight($);
		});

		$(document).on('click', '#toggleScaleTheoryDetails', function () {
			$('#herramientasTeoricas').toggleClass('scaleDetailsCollapsed');
			updateCollapsiblePanelStates($, i18n);
			options.ui.scheduleInstrumentScale($);
			options.ui.scheduleSidebarPanelViewport($);
			options.ui.scheduleDashboardWorkspaceHeight($);
		});

		$('#tonica, #escala').change(function () {
			keyNavigation.applyRecommendedNotation($, options, fillSelectHashTable);
			updateFormatLabelTarget($);
			saveFormPreferences(preferences, $);
			renderReport();
		});

		$('#interface input:radio[name="formato"]').change(function () {
			var preferFlats = $(this).val() === '1';
			fillSelectHashTable($, $('#tonica'), options.data.notes, preferFlats, null, 'notes', notation, uiState.getNotationStyle());
			updateFormatLabelTarget($);
			saveFormPreferences(preferences, $);
			renderReport();
		});

		$('#instrumentoSonoro').change(function () {
			setPlaybackInstrument(options, $(this).val());
			saveFormPreferences(preferences, $);
			renderReport();
		});

		$('#selectorIdioma').change(function () {
			if (i18n) {
				i18n.setLanguage($(this).val());
				uiState.setLanguage(i18n.getLanguage());
				savePreference(preferences, 'language', i18n.getLanguage());
				fillSelectHashTable($, $('#escala'), options.data.scales, false, i18n, 'scales');
				fillInstrumentSelect($, $('#instrumentoSonoro'), options.data.midiInstruments, i18n);
				if (staticText) {
					staticText.apply($, i18n);
				}
				updateCollapsiblePanelStates($, i18n);
				if (options.themeControl) {
					options.themeControl.updateButton($, i18n, $('body').attr('data-theme'));
				}
				if (options.randomSelectControl) {
					options.randomSelectControl.updateLabels($, i18n);
				}
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
			keyNavigation.navigateToLinkedKey($, options.data.notes, event.target.id, notation, uiState.getNotationStyle(), fillSelectHashTable);
			keyNavigation.applyRecommendedNotation($, options, fillSelectHashTable);
			saveFormPreferences(preferences, $);
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
			var musicalContext = musicalContextService.fromSelection(selection);
			var report;
			uiState.setSelection(selection);
			uiState.setMusicalContext(musicalContext);
			setPlaybackInstrument(options, musicalContext.midiInstrument);

			if (musicalContext.isScaleSeparator) {
				uiState.clearReport();
				return;
			}

			report = options.application.buildScaleReport({
				data: options.data,
				domain: options.domain,
				preferFlats: musicalContext.preferFlats,
				scaleIndex: musicalContext.scaleIndex,
				scaleName: musicalContext.scaleName,
				tonicIndex: musicalContext.tonicIndex,
				tonicName: musicalContext.tonicName
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
			updateCollapsiblePanelStates($, i18n);

			renderInstrument(true);
		}

		function renderInstrument(resetTuning) {
			var selection = options.ui.readSelection($, options.data);
			var musicalContext = musicalContextService.fromSelection(selection);
			var report = uiState.getReport();
			uiState.setSelection(selection);
			uiState.setMusicalContext(musicalContext);
			setPlaybackInstrument(options, musicalContext.midiInstrument);

			if (!report) {
				return;
			}

			if (resetTuning && musicalContext.instrument === '0') {
				uiState.resetSelectedTuningIndex();
			}

			var instrumentView = options.application.buildInstrumentView({
				data: options.data,
				domain: options.domain,
				instrument: musicalContext.instrument,
				octaveCount: 2,
				preferFlats: musicalContext.preferFlats,
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

		renderReport();

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

	function fillInstrumentSelect($, select, instruments, i18n) {
		var selectedValue = select.val();
		var html = '';

		for (var i = 0; i < instruments.length; i++) {
			var name = i18n ? i18n.dataLabel('midiInstruments', i, instruments[i].nombre) : instruments[i].nombre;
			var selected = instruments[i].id === selectedValue ? ' selected ' : '';

			html += '<option value="';
			html += instruments[i].id + '"' + selected + '>';
			html += name + '</option>';
		}

		select.empty().append(html);

		if (!select.val() && instruments.length) {
			select.val(instruments[0].id);
		}
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

	function saveFormPreferences(preferences, $) {
		if (!preferences) {
			return;
		}

		preferences.setValue('tonicIndex', $('#tonica').val());
		preferences.setValue('scaleIndex', $('#escala').val());
		preferences.setValue('format', $('#interface input:radio[name="formato"]:checked').val());
		preferences.setValue('midiInstrument', $('#instrumentoSonoro').val());
	}

	function resolveInitialForm(data, initialForm) {
		initialForm = initialForm || {};

		return {
			format: initialForm.format === '1' ? '1' : '0',
			midiInstrument: resolveInitialMidiInstrument(data, initialForm.midiInstrument),
			scaleIndex: clampIndex(initialForm.scaleIndex, data && data.scales ? data.scales.length : 0, 0),
			tonicIndex: clampIndex(initialForm.tonicIndex, data && data.notes ? data.notes.length : 0, 0)
		};
	}

	function resolveInitialMidiInstrument(data, midiInstrument) {
		var instruments = data && data.midiInstruments ? data.midiInstruments : [];

		for (var i = 0; i < instruments.length; i++) {
			if (instruments[i].id === midiInstrument) {
				return midiInstrument;
			}
		}

		return instruments.length ? instruments[0].id : '';
	}

	function clampIndex(value, length, fallback) {
		var numericValue = parseInt(value, 10);

		if (isNaN(numericValue) || numericValue < 0 || numericValue >= length) {
			return fallback;
		}

		return numericValue;
	}

	function hasInitialFormValue(initialForm, key) {
		return initialForm && initialForm[key] !== undefined && initialForm[key] !== null && initialForm[key] !== '';
	}

	function setPlaybackInstrument(options, selectedInstrument) {
		var playbackInstrument = resolvePlaybackInstrument(options.data, selectedInstrument);

		if (options.playbackService && typeof options.playbackService.setInstrument === 'function' && playbackInstrument) {
			options.playbackService.setInstrument(playbackInstrument.id);
		}
	}

	function updateFormatLabelTarget($) {
		var checkedFormat = $('#interface input:radio[name="formato"]:checked');

		if (checkedFormat.length) {
			$('#formatoLabel').attr('for', checkedFormat.attr('id'));
		}
	}

	function updateCollapsiblePanelStates($, i18n) {
		var controlsExpanded = !$('#interface').hasClass('isCollapsed');
		var scaleDetailsExpanded = !$('#herramientasTeoricas').hasClass('scaleDetailsCollapsed');

		updateCollapseToggleButton($, $('#toggleTheoryControls'), controlsExpanded, {
			collapse: translate(i18n, 'panel.controls.collapse'),
			expand: translate(i18n, 'panel.controls.expand')
		});
		updateCollapseToggleButton($, $('#toggleScaleTheoryDetails'), scaleDetailsExpanded, {
			collapse: translate(i18n, 'scaleSummary.collapseDetails'),
			expand: translate(i18n, 'scaleSummary.expandDetails')
		});
	}

	function updateCollapseToggleButton($, button, expanded, labels) {
		if (!button || !button.length) {
			return;
		}

		button.attr('aria-expanded', expanded ? 'true' : 'false');
		button.attr('title', expanded ? labels.collapse : labels.expand);
		button.attr('aria-label', expanded ? labels.collapse : labels.expand);
		button.find('.material-icons').text(expanded ? 'expand_less' : 'expand_more');
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	function resolvePlaybackInstrument(data, selectedInstrument) {
		var instruments = data && data.midiInstruments ? data.midiInstruments : [];

		for (var i = 0; i < instruments.length; i++) {
			if (instruments[i].id === selectedInstrument) {
				return instruments[i];
			}
		}

		for (var j = 0; j < instruments.length; j++) {
			if (instruments[j].viewInstrument === selectedInstrument) {
				return instruments[j];
			}
		}

		return instruments.length ? instruments[0] : null;
	}

	global.CodaScaleReportController = {
		clearChordHighlight: clearChordHighlight,
		fillInstrumentSelect: fillInstrumentSelect,
		fillSelectHashTable: fillSelectHashTable,
		highlightChord: highlightChord,
		resolveInitialForm: resolveInitialForm,
		initialize: initialize,
		playChord: playChord,
		playInstrumentNote: playInstrumentNote,
		resolvePlaybackInstrument: resolvePlaybackInstrument,
		setPlaybackInstrument: setPlaybackInstrument
	};
})(window);
