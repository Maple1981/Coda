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
		var progressionPreferences = options.progressionPreferences || global.CodaProgressionPreferences;
		var progressionTransport = options.progressionTransport || global.CodaProgressionTransport;
		var progressionTransportController = null;
		var progressionDocument = options.progressionDocument || global.CodaProgressionDocument;
		var progressionState = options.progressionState || global.CodaProgressionState;
		var progressionWorkspaceStorage = options.progressionWorkspaceStorage || global.CodaProgressionWorkspaceStorage;
		var staticText = options.staticText || global.CodaStaticText;
		var uiState = options.uiState || global.CodaUiState.create({
			initialNotation: notation ? notation.normalizeStyle(options.initialNotation) : 'anglosaxon',
			language: i18n && i18n.getLanguage ? i18n.getLanguage() : 'es'
		});
		var circleOfFifthsAnchorId = '';
		var circleOfFifthsDragged = false;
		var history = {
			index: -1,
			items: [],
			limit: 11,
			restoring: false
		};
		var progressionStateInputTimer = null;
		var progressionStateInputDelay = 160;
		var initialProgressionWorkspace = options.initialProgressionWorkspace || null;
		var initialProgressionWorkspaceRestored = false;
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
		if (options.dashboardResizer) {
			options.dashboardResizer.initialize({
				preferences: preferences,
				ui: options.ui
			});
		}
		restoreProgressionControls(normalizeInitialProgressionControls(options.initialProgressionState, progressionState, progressionPreferences));
		syncProgressionState();
		bindProgressionState();
		bindProgressionTransport();
		bindProgressionGeneration();
		bindCircleOfFifthsPopover();
		bindWorkbenchInstrumentMenu();
		bindHistoryControls();
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
				recordHistorySnapshot();
			});
		});

		forEachElement('#interface input[type="radio"][name="formato"]', function (input) {
			input.addEventListener('change', function () {
				var preferFlats = input.value === '1';
				fillSelectHashTable(query('#tonica'), options.data.notes, preferFlats, null, 'notes', notation, uiState.getNotationStyle());
				updateFormatLabelTarget();
				saveFormPreferences(preferences);
				renderReport();
				recordHistorySnapshot();
			});
		});

		on(query('#instrumentoSonoro'), 'change', function (event) {
			updateInstrumentSelection(event.currentTarget.value);
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
				recordHistorySnapshot();
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
				recordHistorySnapshot();
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
			recordHistorySnapshot();
		});

		on(global.document, 'change', function (event) {
			if (!event.target || event.target.id !== 'selectorAfinaciones') {
				return;
			}

			uiState.setSelectedTuningIndex(Number(event.target.value));
			if (uiState.getSelectedTuningIndex() >= 0) {
				renderInstrument(false);
				recordHistorySnapshot();
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
				updateCircleOfFifthsAccess(null);
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
			if (!restoreInitialProgressionWorkspace(selection)) {
				syncProgressionPlan();
			}

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
			updateCircleOfFifthsAccess(report);

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
				onScaleNoteClick: playScaleNote(options.instrumentPlayback, options.data),
				renderers: options.renderers,
				report: report
			});
			options.ui.scheduleInstrumentScale();
			options.ui.scheduleDashboardWorkspaceHeight();
		}

		function bindProgressionState() {
			var controls = query('.progressionControls');

			if (!controls || controls.getAttribute('data-coda-progression-state') === 'true') {
				return;
			}

			controls.setAttribute('data-coda-progression-state', 'true');
			controls.addEventListener('input', function () {
				scheduleProgressionStateUpdate();
			});
			controls.addEventListener('change', function () {
				cancelProgressionStateUpdate();
				updateProgressionStateFromControls();
				recordHistorySnapshot();
			});
		}

		function bindProgressionTransport() {
			if (progressionTransport && typeof progressionTransport.initialize === 'function') {
				progressionTransportController = progressionTransport.initialize({
					application: options.application,
					data: options.data,
					i18n: i18n,
					onProgressionChanged: function (progression, renderOptions) {
						setProgression(markProgressionAsUserEdited(progression), renderOptions);
						recordHistorySnapshot();
					},
					notation: notation,
					progressionPlayback: options.progressionPlayback,
					uiState: uiState
				});
			}
		}

		function bindProgressionGeneration() {
			on(query('#generateProgression'), 'click', function () {
				cancelProgressionStateUpdate();
				updateProgressionStateFromControls();
				generateProgressionPlan();
				recordHistorySnapshot();
			});

			on(query('#constructorProgresiones'), 'click', function (event) {
				if (!closest(event.target, '#generateProgressionSectionB')) {
					return;
				}

				cancelProgressionStateUpdate();
				updateProgressionStateFromControls();
				generateProgressionSectionB();
				recordHistorySnapshot();
			});

			on(query('#constructorProgresiones'), 'click', function (event) {
				if (!closest(event.target, '#generateProgressionNextSection')) {
					return;
				}

				cancelProgressionStateUpdate();
				updateProgressionStateFromControls();
				generateProgressionNextSection();
				recordHistorySnapshot();
			});
		}

		function bindCircleOfFifthsPopover() {
			bindCircleOfFifthsDrag();

			on(global.document, 'click', function (event) {
				var trigger = closest(event.target, '#toggleCircleOfFifths') ||
					closest(event.target, '#toggleCircleOfFifthsFromContext') ||
					closest(event.target, '#toggleCircleOfFifthsFromForm') ||
					closest(event.target, '#workbenchContextKeyToggle') ||
					closest(event.target, '.progressionSectionCircleButton');

				if (trigger) {
					toggleCircleOfFifthsPopover(trigger);
					return;
				}

				if (closest(event.target, '#closeCircleOfFifths')) {
					closeCircleOfFifthsPopover();
					return;
				}

				if (isCircleOfFifthsPopoverOpen() && !closest(event.target, '.circlePopover__surface')) {
					closeCircleOfFifthsPopover();
				}
			});

			on(global.document, 'keydown', function (event) {
				if (event.key === 'Escape') {
					closeCircleOfFifthsPopover();
				}
			});
		}

		function bindWorkbenchInstrumentMenu() {
			on(global.document, 'click', function (event) {
				var toggle = closest(event.target, '#toggleWorkbenchInstrumentMenu') ||
					closest(event.target, '#workbenchContextInstrumentToggle');
				var item = closest(event.target, '.workbenchInstrumentMenuItem');

				if (toggle) {
					toggleWorkbenchInstrumentMenu();
					return;
				}

				if (item) {
					event.preventDefault();
					updateInstrumentSelection(item.getAttribute('data-workbench-instrument-id'));
					closeWorkbenchInstrumentMenu();
					return;
				}

				if (isWorkbenchInstrumentMenuOpen() && !closest(event.target, '.workbenchInstrumentMenu')) {
					closeWorkbenchInstrumentMenu();
				}
			});

			on(global.document, 'keydown', function (event) {
				if (event.key === 'Escape') {
					closeWorkbenchInstrumentMenu();
				}
			});
		}

		function bindHistoryControls() {
			on(query('#undoChange'), 'click', undoHistorySnapshot);
			on(query('#redoChange'), 'click', redoHistorySnapshot);
			on(global.document, 'keydown', function (event) {
				var key = event && event.key ? event.key.toLowerCase() : '';

				if (!(event.ctrlKey || event.metaKey) || key !== 'z' || isTextEntryTarget(event.target)) {
					return;
				}

				event.preventDefault();
				if (event.shiftKey) {
					redoHistorySnapshot();
				} else {
					undoHistorySnapshot();
				}
			});
		}

		function bindCircleOfFifthsDrag() {
			var popover = query('#circleOfFifthsPopover');
			var titlebar = query('.circlePopover__titlebar');
			var dragState = null;

			if (!popover || !titlebar || titlebar.getAttribute('data-coda-draggable') === 'true') {
				return;
			}

			titlebar.setAttribute('data-coda-draggable', 'true');

			titlebar.addEventListener('mousedown', function (event) {
				var bounds;

				if (closest(event.target, 'button')) {
					return;
				}

				bounds = popover.getBoundingClientRect();
				dragState = {
					offsetX: event.clientX - bounds.left,
					offsetY: event.clientY - bounds.top
				};
				popover.classList.add('isDragging');
				event.preventDefault();
			});

			global.document.addEventListener('mousemove', function (event) {
				if (!dragState) {
					return;
				}

				moveCircleOfFifthsPopover(popover, {
					x: event.clientX - dragState.offsetX,
					y: event.clientY - dragState.offsetY
				});
				circleOfFifthsDragged = true;
			});

			global.document.addEventListener('mouseup', function () {
				if (!dragState) {
					return;
				}

				dragState = null;
				popover.classList.remove('isDragging');
			});
		}

		function moveCircleOfFifthsPopover(popover, position) {
			var width = popover.offsetWidth;
			var height = popover.offsetHeight;
			var maxLeft = Math.max(0, global.innerWidth - width);
			var maxTop = Math.max(0, global.innerHeight - height);
			var left = Math.max(0, Math.min(maxLeft, position.x));
			var top = Math.max(0, Math.min(maxTop, position.y));

			popover.style.left = left + 'px';
			popover.style.top = top + 'px';
			popover.style.right = 'auto';
		}

		function positionCircleOfFifthsPopoverNearTrigger(popover, trigger) {
			var triggerBounds;
			var margin = 10;
			var width;
			var height;
			var maxLeft;
			var maxTop;
			var left;
			var top;

			if (!popover || !trigger || typeof trigger.getBoundingClientRect !== 'function') {
				return;
			}

			triggerBounds = trigger.getBoundingClientRect();
			width = popover.offsetWidth || 300;
			height = popover.offsetHeight || 260;
			maxLeft = Math.max(margin, global.innerWidth - width - margin);
			maxTop = Math.max(margin, global.innerHeight - height - margin);
			left = Math.min(maxLeft, Math.max(margin, triggerBounds.left));
			top = triggerBounds.bottom + margin;

			if (top + height > global.innerHeight - margin) {
				top = triggerBounds.top - height - margin;
			}

			top = Math.min(maxTop, Math.max(margin, top));
			popover.style.left = left + 'px';
			popover.style.top = top + 'px';
			popover.style.right = 'auto';
		}

		function updateCircleOfFifthsAccess(report) {
			var available = !!(report && report.circleOfFifths);

			updateCircleToggleButton(query('#toggleCircleOfFifths'), available);
			updateCircleToggleButton(query('#toggleCircleOfFifthsFromContext'), available);
			updateCircleToggleButton(query('#toggleCircleOfFifthsFromForm'), available);

			if (!available) {
				closeCircleOfFifthsPopover();
			}
		}

		function updateCircleToggleButton(button, available) {
			if (!button) {
				return;
			}

			button.hidden = !available;
			button.setAttribute('aria-hidden', available ? 'false' : 'true');

			if (!available) {
				button.setAttribute('aria-expanded', 'false');
			}
		}

		function toggleCircleOfFifthsPopover(trigger) {
			var triggerId = getCircleOfFifthsTriggerId(trigger);

			if (isCircleOfFifthsPopoverOpen() && triggerId === circleOfFifthsAnchorId) {
				closeCircleOfFifthsPopover();
				return;
			}

			openCircleOfFifthsPopover(trigger);
		}

		function openCircleOfFifthsPopover(trigger) {
			var popover = query('#circleOfFifthsPopover');
			var circle = circleOfFifthsForTrigger(trigger);
			var triggerId = getCircleOfFifthsTriggerId(trigger);
			var shouldResetPosition = !!trigger && (triggerId !== circleOfFifthsAnchorId || !circleOfFifthsDragged);

			if (!popover || !circle) {
				return;
			}

			renderCircleOfFifths(circle);
			popover.hidden = false;

			if (shouldResetPosition) {
				positionCircleOfFifthsPopoverNearTrigger(popover, trigger);
				circleOfFifthsDragged = false;
			}

			circleOfFifthsAnchorId = triggerId;
			setCircleToggleExpanded(true);
		}

		function getCircleOfFifthsTriggerId(trigger) {
			var sectionId = trigger && trigger.getAttribute ? trigger.getAttribute('data-section-circle') : '';

			if (trigger && trigger.id) {
				return trigger.id;
			}

			return sectionId ? 'section-' + sectionId : '';
		}

		function renderCircleOfFifths(circle) {
			var container = query('#circuloQuintas');

			if (!container || !circle || !options.renderers || !options.renderers.circleOfFifths) {
				return;
			}

			container.innerHTML = options.renderers.circleOfFifths.render({
				notation: notation,
				notationStyle: uiState.getNotationStyle(),
				orderedKeys: circle.orderedKeys,
				selectedKey: circle.selectedKey
			});
		}

		function circleOfFifthsForTrigger(trigger) {
			var sectionId = trigger && trigger.getAttribute ? trigger.getAttribute('data-section-circle') : '';
			var section = sectionId ? progressionSection(sectionId) : null;

			if (section && section.circleOfFifths) {
				return section.circleOfFifths;
			}

			return uiState.getReport() ? uiState.getReport().circleOfFifths : null;
		}

		function progressionSection(sectionId) {
			var progression = uiState.getProgression();
			var sections = progression && progression.sections ? progression.sections : [];

			for (var i = 0; i < sections.length; i++) {
				if (sections[i].id === sectionId) {
					return sections[i];
				}
			}

			return null;
		}

		function closeCircleOfFifthsPopover() {
			var popover = query('#circleOfFifthsPopover');

			if (popover) {
				popover.hidden = true;
			}

			setCircleToggleExpanded(false);
		}

		function isCircleOfFifthsPopoverOpen() {
			var popover = query('#circleOfFifthsPopover');

			return !!(popover && !popover.hidden);
		}

		function setCircleToggleExpanded(expanded) {
			updateCircleToggleExpanded(query('#toggleCircleOfFifths'), expanded);
			updateCircleToggleExpanded(query('#toggleCircleOfFifthsFromContext'), expanded);
			updateCircleToggleExpanded(query('#toggleCircleOfFifthsFromForm'), expanded);
			updateCircleToggleExpanded(query('#workbenchContextKeyToggle'), expanded);
			forEachElement('.progressionSectionCircleButton', function (button) {
				updateCircleToggleExpanded(button, expanded);
			});
		}

		function updateCircleToggleExpanded(button, expanded) {
			if (!button) {
				return;
			}

			button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}

		function toggleWorkbenchInstrumentMenu() {
			if (isWorkbenchInstrumentMenuOpen()) {
				closeWorkbenchInstrumentMenu();
				return;
			}

			openWorkbenchInstrumentMenu();
		}

		function openWorkbenchInstrumentMenu() {
			var menu = query('#workbenchInstrumentMenu');
			var toggle = query('#toggleWorkbenchInstrumentMenu');

			if (!menu) {
				return;
			}

			menu.hidden = false;
			if (toggle) {
				toggle.setAttribute('aria-expanded', 'true');
				setWorkbenchInstrumentToggleIcon('expand_less');
			}
			setWorkbenchInstrumentContextExpanded(true);
		}

		function closeWorkbenchInstrumentMenu() {
			var menu = query('#workbenchInstrumentMenu');
			var toggle = query('#toggleWorkbenchInstrumentMenu');

			if (menu) {
				menu.hidden = true;
			}

			if (toggle) {
				toggle.setAttribute('aria-expanded', 'false');
				setWorkbenchInstrumentToggleIcon('expand_more');
			}
			setWorkbenchInstrumentContextExpanded(false);
		}

		function isWorkbenchInstrumentMenuOpen() {
			var menu = query('#workbenchInstrumentMenu');

			return !!(menu && !menu.hidden);
		}

		function setWorkbenchInstrumentToggleIcon(iconName) {
			var icon = query('#toggleWorkbenchInstrumentMenu .material-icons');

			if (icon) {
				icon.textContent = iconName;
			}
		}

		function setWorkbenchInstrumentContextExpanded(expanded) {
			var contextInstrument = query('#workbenchContextInstrumentToggle');

			if (contextInstrument) {
				contextInstrument.setAttribute('aria-expanded', expanded ? 'true' : 'false');
			}
		}

		function updateInstrumentSelection(instrumentId) {
			var instrumentSelect = query('#instrumentoSonoro');

			if (!instrumentId || !instrumentSelect) {
				return;
			}

			setValue(instrumentSelect, instrumentId);
			setPlaybackInstrument(options, instrumentId);
			saveFormPreferences(preferences);
			renderInstrument(true);
			recordHistorySnapshot();
		}

		function recordHistorySnapshot() {
			var snapshot;
			var serialized;

			if (history.restoring) {
				updateHistoryButtons();
				return;
			}

			snapshot = createHistorySnapshot();
			serialized = JSON.stringify(snapshot);

			if (history.items[history.index] && history.items[history.index].serialized === serialized) {
				updateHistoryButtons();
				return;
			}

			history.items = history.items.slice(0, history.index + 1);
			history.items.push({
				serialized: serialized,
				snapshot: snapshot
			});

			if (history.items.length > history.limit) {
				history.items.shift();
			}

			history.index = history.items.length - 1;
			updateHistoryButtons();
		}

		function undoHistorySnapshot() {
			if (history.index <= 0) {
				return;
			}

			history.index -= 1;
			restoreHistorySnapshot(history.items[history.index].snapshot);
		}

		function redoHistorySnapshot() {
			if (history.index >= history.items.length - 1) {
				return;
			}

			history.index += 1;
			restoreHistorySnapshot(history.items[history.index].snapshot);
		}

		function createHistorySnapshot() {
			return cloneJson({
				controls: {
					articulation: valueOf(query('#progressionArticulation')),
					bars: valueOf(query('#progressionBars')),
					bpm: valueOf(query('#progressionBpm')),
					counterpoint: valueOf(query('#progressionCounterpoint')),
					format: valueOf(query('#interface input[type="radio"][name="formato"]:checked')),
					humanization: valueOf(query('#progressionHumanization')),
					intensity: valueOf(query('#progressionIntensity')),
					instrument: valueOf(query('#instrumentoSonoro')),
					meter: valueOf(query('#progressionMeter')),
					modalInterchange: valueOf(query('#progressionModalInterchange')),
					notacion: valueOf(query('#selectorNotacion')),
					scale: valueOf(query('#escala')),
					style: valueOf(query('#progressionStyle')),
					swing: valueOf(query('#progressionSwing')),
					tensions: valueOf(query('#progressionTensions')),
					tonic: valueOf(query('#tonica')),
					tuning: valueOf(query('#selectorAfinaciones')),
					voicing: valueOf(query('#progressionVoicing')),
					voices: valueOf(query('#progressionVoices'))
				},
				progression: uiState.getProgression(),
				progressionState: uiState.getProgressionState(),
				selectedTuningIndex: uiState.getSelectedTuningIndex()
			});
		}

		function restoreHistorySnapshot(snapshot) {
			var controls = snapshot && snapshot.controls ? snapshot.controls : {};

			if (!snapshot) {
				return;
			}

			history.restoring = true;
			setValue(query('#selectorNotacion'), controls.notacion);
			uiState.setNotationStyle(notation ? notation.normalizeStyle(controls.notacion) : controls.notacion);
			setRadioValue('#interface input[type="radio"][name="formato"]', controls.format);
			fillSelectHashTable(query('#tonica'), options.data.notes, controls.format === '1', null, 'notes', notation, uiState.getNotationStyle());
			setValue(query('#tonica'), controls.tonic);
			setValue(query('#escala'), controls.scale);
			setValue(query('#instrumentoSonoro'), controls.instrument);
			restoreProgressionControls(controls);
			uiState.setSelectedTuningIndex(normalizeHistoryTuningIndex(snapshot.selectedTuningIndex));
			renderReport();
			uiState.setProgressionState(cloneJson(snapshot.progressionState));
			setProgression(cloneJson(snapshot.progression), {
				playbackHeadIndex: 0
			});
			setValue(query('#selectorAfinaciones'), controls.tuning);
			if (controls.tuning !== '') {
				uiState.setSelectedTuningIndex(normalizeHistoryTuningIndex(controls.tuning));
				renderInstrument(false);
			}
			history.restoring = false;
			updateHistoryButtons();
		}

		function restoreProgressionControls(controls) {
			if (progressionPreferences && typeof progressionPreferences.writeControls === 'function') {
				progressionPreferences.writeControls(global.document, controls);
				return;
			}

			setValue(query('#progressionArticulation'), controls.articulation);
			setValue(query('#progressionBars'), controls.bars);
			setValue(query('#progressionBpm'), controls.bpm);
			setValue(query('#progressionCounterpoint'), controls.counterpoint);
			setValue(query('#progressionHumanization'), controls.humanization);
			setValue(query('#progressionIntensity'), controls.intensity);
			setValue(query('#progressionMeter'), controls.meter);
			setValue(query('#progressionModalInterchange'), controls.modalInterchange);
			setValue(query('#progressionStyle'), controls.style);
			setValue(query('#progressionSwing'), controls.swing);
			setValue(query('#progressionTensions'), controls.tensions);
			setValue(query('#progressionVoicing'), controls.voicing);
			setValue(query('#progressionVoices'), controls.voices);
		}

		function updateHistoryButtons() {
			setDisabled(query('#undoChange'), history.index <= 0);
			setDisabled(query('#redoChange'), history.index >= history.items.length - 1);
		}

		function normalizeHistoryTuningIndex(value) {
			var index = Number(value);

			return isNaN(index) || index < 0 ? 0 : index;
		}

		function syncProgressionState() {
			if (progressionState && typeof progressionState.readFromControls === 'function') {
				uiState.setProgressionState(progressionState.readFromControls(global.document));
				syncProgressionPlan();
			}
		}

		function updateProgressionStateFromControls() {
			if (progressionState && typeof progressionState.readFromControls === 'function') {
				uiState.setProgressionState(progressionState.readFromControls(global.document));
				if (isUserEditedProgression(uiState.getProgression())) {
					refreshEditedProgressionFromState();
				} else {
					syncProgressionPlan();
				}
			}
			saveProgressionPreferences(preferences, progressionPreferences);
		}

		function scheduleProgressionStateUpdate() {
			cancelProgressionStateUpdate();

			if (typeof global.setTimeout !== 'function') {
				updateProgressionStateFromControls();
				return;
			}

			progressionStateInputTimer = global.setTimeout(function () {
				progressionStateInputTimer = null;
				updateProgressionStateFromControls();
			}, progressionStateInputDelay);
		}

		function cancelProgressionStateUpdate() {
			if (progressionStateInputTimer && typeof global.clearTimeout === 'function') {
				global.clearTimeout(progressionStateInputTimer);
			}

			progressionStateInputTimer = null;
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

		function generateProgressionSectionB() {
			if (
				options.application &&
				typeof options.application.generateContrastingProgressionSection === 'function' &&
				uiState.getProgression() &&
				uiState.getReport() &&
				uiState.getProgressionState()
			) {
				setProgression(markProgressionAsUserEdited(options.application.generateContrastingProgressionSection({
					data: options.data,
					domain: options.domain,
					progression: uiState.getProgression(),
					progressionState: uiState.getProgressionState(),
					report: uiState.getReport(),
					selection: uiState.getSelection()
				})));
			}
		}

		function generateProgressionNextSection() {
			var sectionType = availableNextSectionType(valueOf(query('#progressionNextSectionType')), uiState.getProgression());

			if (
				options.application &&
				typeof options.application.generateProgressionSection === 'function' &&
				uiState.getProgression() &&
				uiState.getReport() &&
				uiState.getProgressionState() &&
				sectionType
			) {
				setProgression(markProgressionAsUserEdited(options.application.generateProgressionSection({
					data: options.data,
					domain: options.domain,
					progression: uiState.getProgression(),
					progressionState: uiState.getProgressionState(),
					report: uiState.getReport(),
					sectionType: sectionType,
					selection: uiState.getSelection()
				})));
			}
		}

		function availableNextSectionType(sectionType, progression) {
			var hasAprime = hasProgressionSection(progression, 'A\'');
			var hasC = hasProgressionSection(progression, 'C');

			if ((sectionType === 'ap' || sectionType === 'A\'') && !hasAprime) {
				return 'ap';
			}

			if ((sectionType === 'C' || sectionType === 'c') && !hasC) {
				return 'C';
			}

			if (!hasAprime) {
				return 'ap';
			}

			if (!hasC) {
				return 'C';
			}

			return '';
		}

		function hasProgressionSection(progression, id) {
			var sections = progression && progression.sections ? progression.sections : [];

			for (var i = 0; i < sections.length; i++) {
				if (sections[i].id === id) {
					return true;
				}
			}

			return false;
		}

		function setProgression(progression, renderOptions) {
			renderOptions = renderOptions || {};
			uiState.setProgression(progression);
			saveProgressionWorkspace();

			if (progressionTransportController && typeof progressionTransportController.stop === 'function') {
				progressionTransportController.stop();
			}

			if (options.ui && typeof options.ui.renderProgression === 'function') {
				options.ui.renderProgression({
					i18n: i18n,
					notation: notation,
					notationStyle: uiState.getNotationStyle(),
					progression: uiState.getProgression(),
					report: uiState.getReport(),
					renderers: options.renderers
				});
			}

			if (staticText && typeof staticText.applyProgressionLabels === 'function') {
				staticText.applyProgressionLabels(i18n);
			}

			if (progressionTransportController && typeof progressionTransportController.setPlaybackHead === 'function') {
				progressionTransportController.setPlaybackHead(renderOptions.playbackHeadIndex || 0);
			}
			if (progressionTransportController && typeof progressionTransportController.refreshInspector === 'function') {
				progressionTransportController.refreshInspector();
			}
		}

		function restoreInitialProgressionWorkspace(selection) {
			if (
				initialProgressionWorkspaceRestored ||
				!initialProgressionWorkspace ||
				!progressionWorkspaceStorage ||
				typeof progressionWorkspaceStorage.matchesSelection !== 'function' ||
				!progressionWorkspaceStorage.matchesSelection(initialProgressionWorkspace, selection)
			) {
				initialProgressionWorkspaceRestored = true;
				return false;
			}

			initialProgressionWorkspaceRestored = true;
			restoreProgressionControls(initialProgressionWorkspace.progressionState);
			uiState.setProgressionState(cloneJson(initialProgressionWorkspace.progressionState));
			uiState.setSelectedTuningIndex(normalizeHistoryTuningIndex(initialProgressionWorkspace.selectedTuningIndex));
			setProgression(cloneJson(initialProgressionWorkspace.progression), {
				playbackHeadIndex: 0
			});
			return true;
		}

		function saveProgressionWorkspace() {
			if (
				!progressionWorkspaceStorage ||
				typeof progressionWorkspaceStorage.buildWorkspace !== 'function' ||
				typeof progressionWorkspaceStorage.write !== 'function' ||
				!uiState.getProgression() ||
				!uiState.getProgressionState() ||
				!uiState.getSelection()
			) {
				return;
			}

			progressionWorkspaceStorage.write(progressionWorkspaceStorage.buildWorkspace({
				progression: uiState.getProgression(),
				progressionState: uiState.getProgressionState(),
				selectedTuningIndex: uiState.getSelectedTuningIndex(),
				selection: uiState.getSelection()
			}));
		}

		function refreshEditedProgressionFromState() {
			var progression = uiState.getProgression();
			var state = uiState.getProgressionState();
			var refreshed;

			if (!progression || !state) {
				return;
			}

			refreshed = progressionWithState(progression, state);
			if (options.application && typeof options.application.rebuildProgressionTimeline === 'function') {
				refreshed = options.application.rebuildProgressionTimeline(refreshed, normalizeMeasureDurations(adjustedMeasuresForState(progression, state), state));
			}
			refreshed.userEdited = true;
			setProgression(refreshed);
		}

		function adjustedMeasuresForState(progression, state) {
			var measures = cloneJson(progression.measures || []);
			var sections = progression && progression.sections ? progression.sections : [];
			var firstSection = sections.length ? sections[0] : null;
			var targetBars = Math.max(1, Number(state.bars) || measures.length);
			var generated;

			if (sections.length > 1 && firstSection && Number(firstSection.length) === targetBars) {
				return measures;
			}

			if (measures.length > targetBars) {
				return measures.slice(0, targetBars);
			}

			if (
				measures.length < targetBars &&
				options.application &&
				typeof options.application.generateProgressionFromState === 'function' &&
				uiState.getReport()
			) {
				generated = options.application.generateProgressionFromState({
					data: options.data,
					progressionState: state,
					report: uiState.getReport()
				});
				measures = measures.concat((generated.measures || []).slice(measures.length, targetBars));
			}

			return measures;
		}

		function progressionWithState(progression, state) {
			var next = cloneJson(progression) || {};
			var secondsPerBeat = 60 / (Number(state.bpm) || 120);

			next.articulation = state.articulation;
			next.beatUnit = state.beatUnit;
			next.beatsPerBar = state.beatsPerBar;
			next.bpm = state.bpm;
			next.harmonicColor = {
				chromaticism: state.chromaticism,
				counterpoint: state.counterpoint,
				modalInterchange: state.modalInterchange,
				tensions: state.tensions
			};
			next.humanization = state.humanization;
			next.intensity = state.intensity;
			next.meter = state.meter;
			next.secondsPerBeat = secondsPerBeat;
			next.style = state.style;
			next.swing = state.swing;
			next.totalBeats = (next.measures ? next.measures.length : Number(state.bars) || 0) * state.beatsPerBar;
			next.totalSeconds = next.totalBeats * secondsPerBeat;
			next.voicing = state.voicing;
			next.voices = state.voices;

			return next;
		}

		function normalizeMeasureDurations(measures, state) {
			var normalized = cloneJson(measures || []);

			for (var i = 0; i < normalized.length; i++) {
				normalized[i].articulation = state.articulation;
				normalized[i].beatUnit = state.beatUnit;
				normalized[i].beatsPerBar = state.beatsPerBar;
				normalized[i].durationBeats = state.beatsPerBar;
				normalized[i].humanization = state.humanization;
				normalized[i].intensity = state.intensity;
				normalized[i].swing = state.swing;
				if (normalized[i].chords && normalized[i].chords.length) {
					for (var j = 0; j < normalized[i].chords.length; j++) {
						normalized[i].chords[j].articulation = state.articulation;
						normalized[i].chords[j].beatUnit = state.beatUnit;
						normalized[i].chords[j].beatsPerBar = state.beatsPerBar;
						normalized[i].chords[j].humanization = state.humanization;
						normalized[i].chords[j].intensity = state.intensity;
						normalized[i].chords[j].swing = state.swing;
					}
				}
			}

			return normalized;
		}

		function markProgressionAsUserEdited(progression) {
			return progressionDocument && typeof progressionDocument.markUserEdited === 'function' ?
				progressionDocument.markUserEdited(progression) :
				fallbackMarkProgressionAsUserEdited(progression);
		}

		function isUserEditedProgression(progression) {
			return progressionDocument && typeof progressionDocument.isUserEdited === 'function' ?
				progressionDocument.isUserEdited(progression) :
				!!(progression && progression.userEdited === true);
		}

		function fallbackMarkProgressionAsUserEdited(progression) {
			var next = cloneJson(progression) || progression;

			if (next) {
				next.userEdited = true;
			}

			return next;
		}

		function updateWorkbenchContext(selection, musicalContext) {
			var contextElement = query('.workbenchContext');
			var keyElement = query('.workbenchContextKey');
			var instrumentElement = query('.workbenchContextInstrument');
			var instrumentName = selectedInstrumentName(selection);
			var scaleName = selectedScaleName(selection);
			var tonicName = musicalContext && musicalContext.tonicName ? musicalContext.tonicName : selection.tonicName;
			var keyLabel = '';

			if (!contextElement) {
				updateWorkbenchInstrumentMenu(selection);
				return;
			}

			if (musicalContext && musicalContext.isScaleSeparator) {
				contextElement.textContent = '';
				updateWorkbenchInstrumentMenu(selection);
				return;
			}

			if (tonicName) {
				keyLabel = notation ? notation.formatNoteName(tonicName, uiState.getNotationStyle()) : tonicName;
			}

			if (scaleName) {
				keyLabel = keyLabel ? keyLabel + ' ' + scaleName : scaleName;
			}

			if (keyElement && instrumentElement) {
				keyElement.textContent = keyLabel + (keyLabel && instrumentName ? ' ' : '');
				instrumentElement.textContent = instrumentName;
			} else {
				contextElement.textContent = keyLabel + (instrumentName ? ' ' + instrumentName : '');
			}

			updateWorkbenchInstrumentMenu(selection);
		}

		function updateWorkbenchInstrumentMenu(selection) {
			var menu = query('#workbenchInstrumentMenu');
			var instruments = options.data.midiInstruments || [];
			var html = '';

			if (!menu) {
				return;
			}

			for (var i = 0; i < instruments.length; i++) {
				var label = i18n ? i18n.dataLabel('midiInstruments', i, instruments[i].nombre) : instruments[i].nombre;
				var selected = selection && selection.midiInstrument === instruments[i].id;

				html += '<button type="button" class="workbenchInstrumentMenuItem" data-workbench-instrument-id="' + escapeHtml(instruments[i].id) + '" aria-pressed="' + (selected ? 'true' : 'false') + '">' + escapeHtml(label) + '</button>';
			}

			menu.innerHTML = html;
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
		recordHistorySnapshot();

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

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
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

	function playScaleNote(instrumentPlayback, data) {
		return function (element) {
			var midiNote;

			if (!instrumentPlayback || !element) {
				return;
			}

			midiNote = element.getAttribute('data-midi-note') || midiNoteForScaleNote(data, element.getAttribute('data-note-name'));
			if (midiNote == null) {
				return;
			}

			instrumentPlayback.playMidiNote(midiNote, {
				duration: 0.55
			});
		};
	}

	function midiNoteForScaleNote(data, noteName) {
		var notes = data && data.notes ? data.notes : [];

		for (var i = 0; i < notes.length; i++) {
			if (notes[i].nombre === noteName || notes[i].enarmonica === noteName) {
				return 60 + i;
			}
		}

		return null;
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

	function saveProgressionPreferences(preferences, progressionPreferences) {
		if (progressionPreferences && typeof progressionPreferences.save === 'function') {
			progressionPreferences.save(preferences, global.document);
			return;
		}

		if (!preferences) {
			return;
		}

		preferences.setValue('progressionArticulation', valueOf(query('#progressionArticulation')));
		preferences.setValue('progressionBars', valueOf(query('#progressionBars')));
		preferences.setValue('progressionBpm', valueOf(query('#progressionBpm')));
		preferences.setValue('progressionCounterpoint', valueOf(query('#progressionCounterpoint')));
		preferences.setValue('progressionMeter', valueOf(query('#progressionMeter')));
		preferences.setValue('progressionModalInterchange', valueOf(query('#progressionModalInterchange')));
		preferences.setValue('progressionStyle', valueOf(query('#progressionStyle')));
		preferences.setValue('progressionTensions', valueOf(query('#progressionTensions')));
		preferences.setValue('progressionVoicing', valueOf(query('#progressionVoicing')));
		preferences.setValue('progressionVoices', valueOf(query('#progressionVoices')));
	}

	function normalizeInitialProgressionControls(initialProgressionState, progressionState, progressionPreferences) {
		if (progressionPreferences && typeof progressionPreferences.normalizeControls === 'function') {
			return progressionPreferences.normalizeControls(initialProgressionState, progressionState);
		}

		var state = progressionState && typeof progressionState.normalize === 'function' ?
			progressionState.normalize(initialProgressionState || {}) :
			initialProgressionState || {};

		return {
			articulation: state.articulation,
			bars: state.bars,
			bpm: state.bpm,
			counterpoint: state.counterpoint,
			meter: state.meter,
			modalInterchange: state.modalInterchange,
			style: state.style,
			tensions: state.tensions,
			voicing: state.voicing,
			voices: state.voices
		};
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

	function setRadioValue(selector, value) {
		forEachElement(selector, function (input) {
			input.checked = input.value === value;
		});
	}

	function setDisabled(element, disabled) {
		if (element) {
			element.disabled = disabled === true;
			element.setAttribute('aria-disabled', disabled === true ? 'true' : 'false');
		}
	}

	function isTextEntryTarget(target) {
		var tagName = target && target.tagName ? String(target.tagName).toLowerCase() : '';
		var inputType = target && target.type ? String(target.type).toLowerCase() : '';

		return !!(target && (
			target.isContentEditable ||
			tagName === 'textarea' ||
			(tagName === 'input' && isTextInputType(inputType))
		));
	}

	function isTextInputType(inputType) {
		return !inputType || [
			'email',
			'password',
			'search',
			'tel',
			'text',
			'url'
		].indexOf(inputType) > -1;
	}

	function cloneJson(value) {
		return value == null ? null : JSON.parse(JSON.stringify(value));
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
