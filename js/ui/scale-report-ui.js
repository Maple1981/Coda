// UI orchestration for the legacy screen. It reads DOM selections and
// mounts renderer output, but delegates musical work to the application layer.
(function (global) {
	'use strict';

	var pendingDashboardWorkspaceHeight = false;
	var pendingInstrumentScale = false;
	var pendingSidebarPanelViewport = false;

	function readSelection(data) {
		var formatInput = query('#interface input[type="radio"][name="formato"]:checked');
		var scaleSelect = query('select#escala');
		var tonicSelect = query('select#tonica');
		var instrumentSelect = query('#instrumentoSonoro');
		var preferFlats = valueOf(formatInput) === '1';
		var scaleIndex = parseInt(valueOf(scaleSelect), 10);
		var tonicIndex = parseInt(valueOf(tonicSelect), 10);
		var scaleDefinition = data && data.scales ? data.scales[scaleIndex] : null;
		var tonicDefinition = data && data.notes ? data.notes[tonicIndex] : null;
		var midiInstrument = valueOf(instrumentSelect);
		var midiInstrumentDefinition = findMidiInstrument(data, midiInstrument);

		return {
			instrument: midiInstrumentDefinition ? midiInstrumentDefinition.viewInstrument : '1',
			midiInstrument: midiInstrument,
			preferFlats: preferFlats,
			scaleIndex: scaleIndex,
			scaleName: scaleDefinition ? scaleDefinition.nombre : selectedText(scaleSelect),
			tonicIndex: tonicIndex,
			tonicName: tonicDefinition ? noteName(tonicDefinition, preferFlats) : selectedText(tonicSelect)
		};
	}

	function findMidiInstrument(data, instrumentId) {
		var instruments = data && data.midiInstruments ? data.midiInstruments : [];

		for (var i = 0; i < instruments.length; i++) {
			if (instruments[i].id === instrumentId) {
				return instruments[i];
			}
		}

		return instruments.length ? instruments[0] : null;
	}

	function hasRenderedResults() {
		return childCount('notacion') > 0 && childCount('instrumento') > 0;
	}

	function renderScaleReport(options) {
		var report = options.report;
		var scaleDetails = createElement('div', {
			'class': 'scaleTheoryDetails',
			'id': 'scaleTheoryDetails'
		});

		setHtmlById('notacion', options.renderers.scaleSummary.renderTitle({
			i18n: options.i18n,
			notation: options.notation,
			notationStyle: options.notationStyle,
			scaleIndex: report.scaleIndex,
			scaleName: report.scaleName,
			tonicName: report.tonicName
		}));

		appendHtml(scaleDetails, options.renderers.scaleSummary.renderList({
			circleOfFifths: options.data.circleOfFifths,
			i18n: options.i18n,
			isDegreeSuppressed: report.isDegreeSuppressed,
			notation: options.notation,
			notationStyle: options.notationStyle,
			scaleDefinition: report.scaleDefinition,
			scaleNotes: report.scaleNotes,
			selectedScaleIndex: report.scaleIndex,
			tonicName: report.tonicName
		}));

		setHtmlById('armoniaExtendida', '');

		if (report.scaleNotes.length === 7) {
			appendHtml(scaleDetails, options.renderers.scaleChords.render({
				mode: report.mode,
				i18n: options.i18n,
				notation: options.notation,
				notationStyle: options.notationStyle,
				parallelScaleChords: report.parallelScaleChords,
				scaleChords: report.scaleChords,
				scaleDefinition: report.scaleDefinition,
				scaleNotes: report.scaleNotes
			}));

			if (report.extendedHarmonyEnabled) {
				renderExtendedHarmony(options);
			}
		}

		appendElementById('notacion', scaleDetails);

		setHtmlById('circuloQuintas', options.renderers.circleOfFifths.render({
			notation: options.notation,
			notationStyle: options.notationStyle,
			orderedKeys: report.circleOfFifths ? report.circleOfFifths.orderedKeys : null,
			selectedKey: report.circleOfFifths ? report.circleOfFifths.selectedKey : null
		}));

		attachChordEvents(options);
	}

	function renderProgression(options) {
		var timeline = query('.progressionTimeline');

		if (!timeline || !options.renderers || !options.renderers.progressionWorkbench) {
			return;
		}

		timeline.innerHTML = options.renderers.progressionWorkbench.renderTimelineMeasures(options.progression, {
			i18n: options.i18n,
			notation: options.notation,
			notationStyle: options.notationStyle,
			showCircleOfFifths: !!(options.report && options.report.circleOfFifths)
		});
	}

	function renderExtendedHarmony(options) {
		var report = options.report;

		setHtmlById('armoniaExtendida', options.renderers.extendedHarmony.render({
			data: options.data,
			domain: options.domain,
			i18n: options.i18n,
			mode: report.mode,
			notation: options.notation,
			notationStyle: options.notationStyle,
			preferFlats: options.selection.preferFlats,
			scaleIndex: report.scaleIndex,
			scaleChords: report.scaleChords,
			scaleName: report.scaleName,
			scaleNotes: report.scaleNotes,
			tonicName: report.tonicName
		}));

		initializeMultiAccordion(query('#acordeonArmoniaExtendida'));
		scheduleDashboardWorkspaceHeight();
	}

	function initializeMultiAccordion(accordion) {
		var accordionElement = asElement(accordion);
		var headers;

		if (!accordionElement) {
			return;
		}

		headers = childrenMatching(accordionElement, 'h3');
		accordionElement.classList.add('codaAccordion');

		headers.forEach(function (header, index) {
			var panel = nextElementMatching(header, 'div');
			var isOpen = index === 0;
			var panelId;

			if (!panel) {
				return;
			}

			panelId = panel.getAttribute('id') || 'acordeonArmoniaExtendidaPanel' + index;

			header.classList.add('codaAccordionHeader');
			header.classList.toggle('codaAccordionHeaderActive', isOpen);
			header.setAttribute('tabindex', '0');
			header.setAttribute('role', 'button');
			header.setAttribute('aria-controls', panelId);
			header.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

			panel.setAttribute('id', panelId);
			panel.setAttribute('role', 'region');
			panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
			panel.classList.add('codaAccordionPanel');
			panel.style.display = isOpen ? '' : 'none';
		});

		headers.forEach(function (header) {
			if (header.getAttribute('data-coda-accordion-initialized') === 'true') {
				return;
			}
			header.setAttribute('data-coda-accordion-initialized', 'true');
			header.addEventListener('click', handleAccordionEvent);
			header.addEventListener('keydown', handleAccordionEvent);
		});
	}

	function handleAccordionEvent(event) {
		if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
			return;
		}

		event.preventDefault();
		toggleAccordionSection(event.currentTarget);
	}

	function toggleAccordionSection(header) {
		var headerElement = asElement(header);
		var panel = headerElement ? nextElementMatching(headerElement, 'div') : null;
		var willOpen = panel ? panel.style.display === 'none' || panel.hidden : false;

		if (!headerElement || !panel) {
			return;
		}

		headerElement.classList.toggle('codaAccordionHeaderActive', willOpen);
		headerElement.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
		panel.setAttribute('aria-hidden', willOpen ? 'false' : 'true');
		panel.style.display = willOpen ? '' : 'none';
	}

	function attachChordEvents(options) {
		var eventScopes = [query('#notacion'), query('#armoniaExtendida')];

		eventScopes.forEach(function (scope) {
			if (!scope || scope.getAttribute('data-coda-chord-events') === 'true') {
				return;
			}

			scope.setAttribute('data-coda-chord-events', 'true');
			scope.addEventListener('mouseover', function (event) {
				var chord = closestWithin(event.target, '.celdaAcorde', scope);

				if (chord && event.relatedTarget && chord.contains(event.relatedTarget)) {
					return;
				}

				if (chord) {
					options.onChordMouseOver(chord);
				}
			});
			scope.addEventListener('mouseout', function (event) {
				var chord = closestWithin(event.target, '.celdaAcorde', scope);

				if (chord && event.relatedTarget && chord.contains(event.relatedTarget)) {
					return;
				}

				if (chord) {
					options.onChordMouseOut();
				}
			});
			scope.addEventListener('click', function (event) {
				var chord = closestWithin(event.target, '.celdaAcorde', scope);

				if (chord) {
					options.onChordClick(chord);
				}
			});
		});
	}

	function renderInstrument(options) {
		var html = '';

		if (options.instrumentView.type === 'piano') {
			html = options.renderers.instruments.renderPiano({
				i18n: options.i18n,
				keyboard: options.instrumentView.keyboard,
				notation: options.notation,
				notationStyle: options.notationStyle,
				scaleDefinition: options.report.scaleDefinition
			});
		} else {
			html = options.renderers.instruments.renderGuitar({
				i18n: options.i18n,
				notation: options.notation,
				notationStyle: options.notationStyle,
				scaleDefinition: options.report.scaleDefinition,
				strings: options.instrumentView.strings,
				tuning: options.instrumentView.tuning,
				tunings: options.data.tunings
			});
		}

		setHtmlById('instrumento', html);
		attachInstrumentEvents(options);
	}

	function attachInstrumentEvents(options) {
		var instrument = query('#instrumento');

		if (typeof options.onInstrumentNoteClick !== 'function' || !instrument || instrument.getAttribute('data-coda-instrument-events') === 'true') {
			return;
		}

		instrument.setAttribute('data-coda-instrument-events', 'true');
		instrument.addEventListener('click', function (event) {
			var note = closestWithin(event.target, 'td.celdaNota span[data-midi-note]', instrument);

			if (note) {
				options.onInstrumentNoteClick(note);
			}
		});
	}

	function scheduleInstrumentScale() {
		if (pendingInstrumentScale) {
			return;
		}

		pendingInstrumentScale = true;
		nextFrame(function () {
			pendingInstrumentScale = false;
			syncInstrumentScale();
		});
	}

	function scheduleDashboardWorkspaceHeight() {
		if (pendingDashboardWorkspaceHeight) {
			return;
		}

		pendingDashboardWorkspaceHeight = true;
		nextFrame(function () {
			pendingDashboardWorkspaceHeight = false;
			syncDashboardWorkspaceHeight();
		});
	}

	function scheduleSidebarPanelViewport() {
		if (pendingSidebarPanelViewport) {
			return;
		}

		pendingSidebarPanelViewport = true;
		nextFrame(function () {
			pendingSidebarPanelViewport = false;
			syncSidebarPanelViewport();
		});
	}

	function syncInstrumentScale() {
		var viewport = query('#instrumento .instrumentScaleViewport');
		var canvas = query('#instrumento .instrumentScaleCanvas');

		if (!viewport || !canvas) {
			return;
		}

		canvas.style.transform = 'none';
		canvas.style.left = '0px';
		viewport.style.height = 'auto';

		var baseWidth = canvas.offsetWidth;
		var baseHeight = canvas.offsetHeight;
		var availableWidth = viewport.clientWidth;

		if (!baseWidth || !baseHeight || !availableWidth) {
			return;
		}

		var scale = Math.min(1, availableWidth / baseWidth);
		var scaledWidth = baseWidth * scale;
		var offsetLeft = Math.max(0, (availableWidth - scaledWidth) / 2);

		canvas.style.transform = 'scale(' + scale + ')';
		canvas.style.left = offsetLeft + 'px';
		viewport.style.height = Math.ceil(baseHeight * scale) + 'px';
	}

	function syncDashboardWorkspaceHeight() {
		var sidebar = query('#panelTeorico');
		var sidebarPanel = query('.dashboard__sidebarPanel');
		var main = query('#areaTrabajo');
		var container = query('#container');

		if (!sidebar || !sidebarPanel || !main || !container) {
			return;
		}

		var viewportHeight = Math.max(0, global.innerHeight - 32);
		var sidebarHeight = sidebarPanel.scrollHeight;
		var mainHeight = main.scrollHeight;
		var workspaceHeight = Math.max(viewportHeight, sidebarHeight, mainHeight);

		container.style.setProperty('--dashboard-workspace-height', workspaceHeight + 'px');
		container.style.setProperty('--dashboard-sidebar-content-height', sidebarHeight + 'px');
		syncSidebarPanelViewport();
	}

	function syncSidebarPanelViewport() {
		var sidebarPanel = query('.dashboard__sidebarPanel');
		var container = query('#container');

		if (!sidebarPanel || !container) {
			return;
		}

		var panelTop = Math.max(sidebarPanel.getBoundingClientRect().top, 19);
		var panelHeight = Math.max(280, global.innerHeight - panelTop - 16);

		container.style.setProperty('--dashboard-sidebar-max-height', panelHeight + 'px');
	}

	function nextFrame(callback) {
		var scheduler = global.requestAnimationFrame || function (scheduledCallback) {
			return global.setTimeout(scheduledCallback, 16);
		};

		scheduler(callback);
	}

	function noteName(noteDefinition, preferFlats) {
		if (preferFlats && noteDefinition.enarmonica !== undefined) {
			return noteDefinition.enarmonica;
		}

		return noteDefinition.nombre;
	}

	function appendElementById(id, element) {
		var container = global.document ? global.document.getElementById(id) : null;

		if (container && element) {
			container.appendChild(element);
		}
	}

	function appendHtml(element, html) {
		if (element) {
			element.insertAdjacentHTML('beforeend', html);
		}
	}

	function asElement(value) {
		if (!value) {
			return null;
		}

		if (value.nodeType === 1) {
			return value;
		}

		return value[0] || null;
	}

	function childCount(id) {
		var element = global.document ? global.document.getElementById(id) : null;

		return element ? element.children.length : 0;
	}

	function childrenMatching(element, selector) {
		return Array.prototype.filter.call(element.children, function (child) {
			return child.matches(selector);
		});
	}

	function closestWithin(target, selector, scope) {
		var element = target && target.closest ? target.closest(selector) : null;

		if (!element || !scope.contains(element)) {
			return null;
		}

		return element;
	}

	function createElement(tagName, attributes) {
		var element = global.document.createElement(tagName);

		Object.keys(attributes).forEach(function (attribute) {
			element.setAttribute(attribute, attributes[attribute]);
		});

		return element;
	}

	function nextElementMatching(element, selector) {
		var sibling = element ? element.nextElementSibling : null;

		return sibling && sibling.matches(selector) ? sibling : null;
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	function selectedText(select) {
		if (!select || select.selectedIndex < 0 || !select.options[select.selectedIndex]) {
			return '';
		}

		return select.options[select.selectedIndex].textContent;
	}

	function setHtmlById(id, html) {
		var element = global.document ? global.document.getElementById(id) : null;

		if (element) {
			element.innerHTML = html;
		}
	}

	function valueOf(element) {
		return element ? element.value : '';
	}

	global.CodaUi = {
		attachChordEvents: attachChordEvents,
		attachInstrumentEvents: attachInstrumentEvents,
		hasRenderedResults: hasRenderedResults,
		initializeMultiAccordion: initializeMultiAccordion,
		noteName: noteName,
		readSelection: readSelection,
		renderExtendedHarmony: renderExtendedHarmony,
		renderInstrument: renderInstrument,
		renderProgression: renderProgression,
		renderScaleReport: renderScaleReport,
		scheduleDashboardWorkspaceHeight: scheduleDashboardWorkspaceHeight,
		scheduleInstrumentScale: scheduleInstrumentScale,
		scheduleSidebarPanelViewport: scheduleSidebarPanelViewport,
		syncDashboardWorkspaceHeight: syncDashboardWorkspaceHeight,
		syncInstrumentScale: syncInstrumentScale,
		syncSidebarPanelViewport: syncSidebarPanelViewport,
		toggleAccordionSection: toggleAccordionSection
	};
})(window);
