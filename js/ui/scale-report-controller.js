// Screen controller for the legacy scale report UI.
(function (global) {
	'use strict';

	function initialize(options) {
		var i18n = options.i18n;
		var keyNavigation = options.keyNavigation || global.CodaKeyNavigation;
		var musicalContextService = options.musicalContext || global.CodaMusicalContext.create({
			data: options.data
		});
		var notation = options.notation;
		var preferences = options.preferences;
		var progressionTransport = options.progressionTransport || global.CodaProgressionTransport;
		var progressionTransportController = null;
		var progressionState = options.progressionState || global.CodaProgressionState;
		var staticText = options.staticText || global.CodaStaticText;
		var uiState = options.uiState || global.CodaUiState.create({
			initialNotation: notation ? notation.normalizeStyle(options.initialNotation) : 'anglosaxon',
			language: i18n && i18n.getLanguage ? i18n.getLanguage() : 'es'
		});
		uiState.setNotationStyle(notation ? notation.normalizeStyle(options.initialNotation) : 'anglosaxon');
		var initialForm = resolveInitialForm(options.data, options.initialForm);

		checkFormat(initialForm.format);
		updateFormatLabelTarget();
		setValue(query('#selectorNotacion'), uiState.getNotationStyle());
		fillSelectHashTable(query('#tonica'), options.data.notes, initialForm.format === '1', null, 'notes', notation, uiState.getNotationStyle());
		setValue(query('#tonica'), String(initialForm.tonicIndex));
		fillSelectHashTable(query('#escala'), options.data.scales, false, i18n, 'scales');
		setValue(query('#escala'), String(initialForm.scaleIndex));
		fillInstrumentSelect(query('#instrumentoSonoro'), options.data.midiInstruments, i18n);
		setValue(query('#instrumentoSonoro'), initialForm.midiInstrument);
		setPlaybackInstrument(options, valueOf(query('#instrumentoSonoro')));
		if (!hasInitialFormValue(options.initialForm, 'format')) {
			keyNavigation.applyRecommendedNotation(options, fillSelectHashTable);
			updateFormatLabelTarget();
		}
		if (staticText) {
			staticText.apply(i18n);
		}
		if (options.themeControl) {
			options.themeControl.initialize({
				i18n: i18n,
				initialTheme: options.initialTheme,
				preferences: preferences
			});
		}
		if (options.volumeControl) {
			options.volumeControl.initialize({
				initialVolume: options.initialVolume,
				playbackService: options.playbackService,
				preferences: preferences
			});
		}
		if (options.changelogDialog) {
			options.changelogDialog.initialize(i18n);
		}
		if (options.randomSelectControl) {
			options.randomSelectControl.initialize({
				i18n: i18n
			});
		}
		syncProgressionState();
		bindProgressionState();
		bindProgressionTransport();
		bindProgressionGeneration();
		updateCollapsiblePanelStates(i18n);
		options.ui.scheduleDashboardWorkspaceHeight();

		global.addEventListener('resize', function () {
			options.ui.scheduleSidebarPanelViewport();
			options.ui.scheduleInstrumentScale();
			options.ui.scheduleDashboardWorkspaceHeight();
		});
		global.addEventListener('scroll', function () {
			options.ui.scheduleSidebarPanelViewport();
		});

		on(query('#toggleTheoryControls'), 'click', function () {
			query('#interface').classList.toggle('isCollapsed');
			updateCollapsiblePanelStates(i18n);
			options.ui.scheduleSidebarPanelViewport();
			options.ui.scheduleDashboardWorkspaceHeight();
		});

		on(global.document, 'click', function (event) {
			if (!closest(event.target, '#toggleScaleTheoryDetails')) {
				return;
			}

			query('#herramientasTeoricas').classList.toggle('scaleDetailsCollapsed');
			updateCollapsiblePanelStates(i18n);
			options.ui.scheduleInstrumentScale();
			options.ui.scheduleSidebarPanelViewport();
			options.ui.scheduleDashboardWorkspaceHeight();
		});

		forEachElement('#tonica, #escala', function (control) {
			control.addEventListener('change', function () {
				keyNavigation.applyRecommendedNotation(options, fillSelectHashTable);
				updateFormatLabelTarget();
				saveFormPreferences(preferences);
				renderReport();
			});
		});

		forEachElement('#interface input[type="radio"][name="formato"]', function (input) {
			input.addEventListener('change', function () {
				var preferFlats = input.value === '1';
				fillSelectHashTable(query('#tonica'), options.data.notes, preferFlats, null, 'notes', notation, uiState.getNotationStyle());
				updateFormatLabelTarget();
				saveFormPreferences(preferences);
				renderReport();
			});
		});

		on(query('#instrumentoSonoro'), 'change', function (event) {
			setPlaybackInstrument(options, event.currentTarget.value);
			saveFormPreferences(preferences);
			renderReport();
		});

		on(query('#selectorIdioma'), 'change', function (event) {
			if (i18n) {
				i18n.setLanguage(event.currentTarget.value);
				uiState.setLanguage(i18n.getLanguage());
				savePreference(preferences, 'language', i18n.getLanguage());
				fillSelectHashTable(query('#escala'), options.data.scales, false, i18n, 'scales');
				fillInstrumentSelect(query('#instrumentoSonoro'), options.data.midiInstruments, i18n);
				if (staticText) {
					staticText.apply(i18n);
				}
				updateCollapsiblePanelStates(i18n);
				if (options.themeControl) {
					options.themeControl.updateButton(i18n, global.document.body.getAttribute('data-theme'));
				}
				if (options.randomSelectControl) {
					options.randomSelectControl.updateLabels(i18n);
				}
			}

			if (options.ui.hasRenderedResults()) {
				renderReport();
			}

			options.ui.scheduleInstrumentScale();
			options.ui.scheduleDashboardWorkspaceHeight();
		});

		on(query('#selectorNotacion'), 'change', function (event) {
			uiState.setNotationStyle(notation ? notation.normalizeStyle(event.currentTarget.value) : 'anglosaxon');
			savePreference(preferences, 'notation', uiState.getNotationStyle());
			fillSelectHashTable(
				query('#tonica'),
				options.data.notes,
				valueOf(query('#interface input[type="radio"][name="formato"]:checked')) === '1',
				null,
				'notes',
				notation,
				uiState.getNotationStyle()
			);

			if (options.ui.hasRenderedResults()) {
				renderReport();
			}

			options.ui.scheduleInstrumentScale();
			options.ui.scheduleDashboardWorkspaceHeight();
		});

		on(global.document, 'click', function (event) {
			var link = closest(event.target, '.revamp');

			if (!link) {
				return;
			}

			keyNavigation.navigateToLinkedKey(options.data.notes, link.id, notation, uiState.getNotationStyle(), fillSelectHashTable);
			keyNavigation.applyRecommendedNotation(options, fillSelectHashTable);
			saveFormPreferences(preferences);
			renderReport();
		});

		on(global.document, 'change', function (event) {
			if (!event.target || event.target.id !== 'selectorAfinaciones') {
				return;
			}

			uiState.setSelectedTuningIndex(Number(event.target.value));
			if (uiState.getSelectedTuningIndex() >= 0) {
				renderInstrument(false);
			}
		});

		function renderReport() {
			var selection = options.ui.readSelection(options.data);
			var musicalContext = musicalContextService.fromSelection(selection);
			var report;
			uiState.setSelection(selection);
			uiState.setMusicalContext(musicalContext);
			setPlaybackInstrument(options, musicalContext.midiInstrument);
			updateWorkbenchContext(selection, musicalContext);

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
			syncProgressionPlan();

			options.ui.renderScaleReport({
				data: options.data,
				domain: options.domain,
				onChordClick: playChord(options.chordPlayback),
				onChordMouseOut: clearChordHighlight(),
				onChordMouseOver: highlightChord(),
				i18n: i18n,
				notation: notation,
				notationStyle: uiState.getNotationStyle(),
				renderers: options.renderers,
				report: report,
				selection: selection
			});
			updateCollapsiblePanelStates(i18n);

			renderInstrument(true);
		}

		function renderInstrument(resetTuning) {
			var selection = options.ui.readSelection(options.data);
			var musicalContext = musicalContextService.fromSelection(selection);
			var report = uiState.getReport();
			uiState.setSelection(selection);
			uiState.setMusicalContext(musicalContext);
			setPlaybackInstrument(options, musicalContext.midiInstrument);
			updateWorkbenchContext(selection, musicalContext);

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
				data: options.data,
				i18n: i18n,
				instrumentView: instrumentView,
				notation: notation,
				notationStyle: uiState.getNotationStyle(),
				onInstrumentNoteClick: playInstrumentNote(options.instrumentPlayback),
				renderers: options.renderers,
				report: report
			});
			options.ui.scheduleInstrumentScale();
			options.ui.scheduleDashboardWorkspaceHeight();
		}

		function bindProgressionState() {
			var controls = query('#constructorProgresiones');

			if (!controls || controls.getAttribute('data-coda-progression-state') === 'true') {
				return;
			}

			controls.setAttribute('data-coda-progression-state', 'true');
			controls.addEventListener('input', syncProgressionState);
			controls.addEventListener('change', syncProgressionState);
		}

		function bindProgressionTransport() {
			if (progressionTransport && typeof progressionTransport.initialize === 'function') {
				progressionTransportController = progressionTransport.initialize({
					application: options.application,
					data: options.data,
					i18n: i18n,
					onProgressionChanged: setProgression,
					progressionPlayback: options.progressionPlayback,
					uiState: uiState
				});
			}
		}

		function bindProgressionGeneration() {
			on(query('#generateProgression'), 'click', function () {
				syncProgressionState();
				generateProgressionPlan();
			});
		}

		function syncProgressionState() {
			if (progressionState && typeof progressionState.readFromControls === 'function') {
				uiState.setProgressionState(progressionState.readFromControls(global.document));
				syncProgressionPlan();
			}
		}

		function syncProgressionPlan() {
			if (
				options.application &&
				typeof options.application.buildProgressionFromState === 'function' &&
				uiState.getReport() &&
				uiState.getProgressionState()
			) {
				setProgression(options.application.buildProgressionFromState({
					domain: options.domain,
					progressionState: uiState.getProgressionState(),
					report: uiState.getReport()
				}));
			}
		}

		function generateProgressionPlan() {
			if (
				options.application &&
				typeof options.application.generateProgressionFromState === 'function' &&
				uiState.getReport() &&
				uiState.getProgressionState()
			) {
				setProgression(options.application.generateProgressionFromState({
					data: options.data,
					progressionState: uiState.getProgressionState(),
					report: uiState.getReport()
				}));
			}
		}

		function setProgression(progression, renderOptions) {
			renderOptions = renderOptions || {};
			uiState.setProgression(progression);

			if (progressionTransportController && typeof progressionTransportController.stop === 'function') {
				progressionTransportController.stop();
			}

			if (options.ui && typeof options.ui.renderProgression === 'function') {
				options.ui.renderProgression({
					progression: uiState.getProgression(),
					renderers: options.renderers
				});
			}

			if (staticText && typeof staticText.applyProgressionLabels === 'function') {
				staticText.applyProgressionLabels(i18n);
			}

			if (progressionTransportController && typeof progressionTransportController.setPlaybackHead === 'function') {
				progressionTransportController.setPlaybackHead(renderOptions.playbackHeadIndex || 0);
			}
		}

		function updateWorkbenchContext(selection, musicalContext) {
			var contextElement = query('.workbenchContext');
			var instrumentName = selectedInstrumentName(selection);
			var scaleName = selectedScaleName(selection);
			var tonicName = musicalContext && musicalContext.tonicName ? musicalContext.tonicName : selection.tonicName;
			var keyLabel = '';
			var values = [];

			if (!contextElement) {
				return;
			}

			if (musicalContext && musicalContext.isScaleSeparator) {
				contextElement.textContent = '';
				return;
			}

			if (tonicName) {
				keyLabel = notation ? notation.formatNoteName(tonicName, uiState.getNotationStyle()) : tonicName;
			}

			if (scaleName) {
				keyLabel = keyLabel ? keyLabel + ' ' + scaleName : scaleName;
			}

			if (keyLabel) {
				values.push(keyLabel);
			}

			if (instrumentName) {
				values.push(instrumentName);
			}

			contextElement.textContent = values.join(' · ');
		}

		function selectedScaleName(selection) {
			var scale = options.data.scales[selection.scaleIndex];

			if (!scale || scale.separador) {
				return '';
			}

			return i18n ? i18n.dataLabel('scales', selection.scaleIndex, scale.nombre) : scale.nombre;
		}

		function selectedInstrumentName(selection) {
			var instruments = options.data.midiInstruments || [];

			for (var i = 0; i < instruments.length; i++) {
				if (instruments[i].id === selection.midiInstrument) {
					return i18n ? i18n.dataLabel('midiInstruments', i, instruments[i].nombre) : instruments[i].nombre;
				}
			}

			return '';
		}

		renderReport();

		return {
			renderInstrument: renderInstrument,
			renderReport: renderReport,
			uiState: uiState
		};
	}

	function fillSelectHashTable(select, values, preferFlats, i18n, collectionName, notation, notationStyle) {
		var selectElement = asElement(select);
		var selectedValue = valueOf(selectElement);
		var html = '';

		for (var i = 0; i < values.length; i++) {
			var name = values[i].nombre;
			var selected = '';

			if (i == selectedValue) {
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

		if (selectElement) {
			selectElement.innerHTML = html;
		}
	}

	function fillInstrumentSelect(select, instruments, i18n) {
		var selectElement = asElement(select);
		var selectedValue = valueOf(selectElement);
		var html = '';

		for (var i = 0; i < instruments.length; i++) {
			var name = i18n ? i18n.dataLabel('midiInstruments', i, instruments[i].nombre) : instruments[i].nombre;
			var selected = instruments[i].id === selectedValue ? ' selected ' : '';

			html += '<option value="';
			html += instruments[i].id + '"' + selected + '>';
			html += name + '</option>';
		}

		if (selectElement) {
			selectElement.innerHTML = html;

			if (!selectElement.value && instruments.length) {
				selectElement.value = instruments[0].id;
			}
		}
	}

	function highlightChord() {
		return function (element) {
			var noteNames = element.id.split('-');

			for (var i = 0; i < noteNames.length; i++) {
				forEachElement('td.celdaNota span[data-note-name="' + noteNames[i] + '"]', function (note) {
					note.classList.add('resaltada');
				});
			}
		};
	}

	function clearChordHighlight() {
		return function () {
			forEachElement('td.celdaNota span.resaltada', function (note) {
				note.classList.remove('resaltada');
			});
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

	function saveFormPreferences(preferences) {
		if (!preferences) {
			return;
		}

		preferences.setValue('tonicIndex', valueOf(query('#tonica')));
		preferences.setValue('scaleIndex', valueOf(query('#escala')));
		preferences.setValue('format', valueOf(query('#interface input[type="radio"][name="formato"]:checked')));
		preferences.setValue('midiInstrument', valueOf(query('#instrumentoSonoro')));
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

	function updateFormatLabelTarget() {
		var checkedFormat = query('#interface input[type="radio"][name="formato"]:checked');
		var label = query('#formatoLabel');

		if (checkedFormat && label) {
			label.setAttribute('for', checkedFormat.id);
		}
	}

	function updateCollapsiblePanelStates(i18n) {
		var interfacePanel = query('#interface');
		var theoryPanel = query('#herramientasTeoricas');
		var controlsExpanded = interfacePanel ? !interfacePanel.classList.contains('isCollapsed') : true;
		var scaleDetailsExpanded = theoryPanel ? !theoryPanel.classList.contains('scaleDetailsCollapsed') : true;

		updateCollapseToggleButton(query('#toggleTheoryControls'), controlsExpanded, {
			collapse: translate(i18n, 'panel.controls.collapse'),
			expand: translate(i18n, 'panel.controls.expand')
		});
		updateCollapseToggleButton(query('#toggleScaleTheoryDetails'), scaleDetailsExpanded, {
			collapse: translate(i18n, 'scaleSummary.collapseDetails'),
			expand: translate(i18n, 'scaleSummary.expandDetails')
		});
	}

	function updateCollapseToggleButton(button, expanded, labels) {
		var icon;

		if (!button) {
			return;
		}

		button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		button.setAttribute('title', expanded ? labels.collapse : labels.expand);
		button.setAttribute('aria-label', expanded ? labels.collapse : labels.expand);
		icon = button.querySelector('.material-icons');

		if (icon) {
			icon.textContent = expanded ? 'expand_less' : 'expand_more';
		}
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	function asElement(value) {
		if (!value) {
			return null;
		}

		if (value.nodeType === 1 || value === global.document) {
			return value;
		}

		return value[0] || null;
	}

	function checkFormat(value) {
		var input = query('#bemoles');

		if (value !== '1') {
			input = query('#sostenidos');
		}

		if (input) {
			input.checked = true;
		}
	}

	function closest(target, selector) {
		return target && target.closest ? target.closest(selector) : null;
	}

	function forEachElement(selector, callback) {
		if (!global.document) {
			return;
		}

		Array.prototype.forEach.call(global.document.querySelectorAll(selector), callback);
	}

	function on(element, eventName, handler) {
		if (element && element.addEventListener) {
			element.addEventListener(eventName, handler);
		}
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	function setValue(element, value) {
		if (element && value !== undefined && value !== null) {
			element.value = value;
		}
	}

	function valueOf(element) {
		return element ? element.value : '';
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
