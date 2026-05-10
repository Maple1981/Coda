// UI orchestration for the legacy jQuery screen. It reads DOM selections and
// mounts renderer output, but delegates musical work to the application layer.
(function (global) {
	'use strict';

	var pendingDashboardWorkspaceHeight = false;
	var pendingInstrumentScale = false;
	var pendingSidebarPanelViewport = false;

	function readSelection($, data) {
		var preferFlats = $('#interface input:radio[name="formato"]:checked').val() === '1';
		var scaleIndex = parseInt($('select#escala option:selected').val(), 10);
		var tonicIndex = parseInt($('select#tonica option:selected').val(), 10);
		var scaleDefinition = data && data.scales ? data.scales[scaleIndex] : null;
		var tonicDefinition = data && data.notes ? data.notes[tonicIndex] : null;
		var midiInstrument = $('#instrumentoSonoro').val();
		var midiInstrumentDefinition = findMidiInstrument(data, midiInstrument);

		return {
			instrument: midiInstrumentDefinition ? midiInstrumentDefinition.viewInstrument : '1',
			midiInstrument: midiInstrument,
			preferFlats: preferFlats,
			scaleIndex: scaleIndex,
			scaleName: scaleDefinition ? scaleDefinition.nombre : $('select#escala option:selected').text(),
			tonicIndex: tonicIndex,
			tonicName: tonicDefinition ? noteName(tonicDefinition, preferFlats) : $('select#tonica option:selected').text()
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

	function hasRenderedResults($) {
		return $('#notacion').children().length > 0 && $('#instrumento').children().length > 0;
	}

	function renderScaleReport(options) {
		var $ = options.$;
		var report = options.report;
		var scaleDetails = $('<div id="scaleTheoryDetails" class="scaleTheoryDetails"></div>');

		$('#notacion').empty().append(options.renderers.scaleSummary.renderTitle({
			i18n: options.i18n,
			notation: options.notation,
			notationStyle: options.notationStyle,
			scaleIndex: report.scaleIndex,
			scaleName: report.scaleName,
			tonicName: report.tonicName
		}));

		scaleDetails.append(options.renderers.scaleSummary.renderList({
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

		$('#armoniaExtendida').empty();

		if (report.scaleNotes.length === 7) {
			scaleDetails.append(options.renderers.scaleChords.render({
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

		$('#notacion').append(scaleDetails);

		$('#circuloQuintas').empty().append(options.renderers.circleOfFifths.render({
			notation: options.notation,
			notationStyle: options.notationStyle,
			orderedKeys: report.circleOfFifths ? report.circleOfFifths.orderedKeys : null,
			selectedKey: report.circleOfFifths ? report.circleOfFifths.selectedKey : null
		}));

		attachChordEvents(options);
	}

	function renderExtendedHarmony(options) {
		var $ = options.$;
		var report = options.report;

		$('#armoniaExtendida').empty().append(options.renderers.extendedHarmony.render({
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

		initializeMultiAccordion($, $('#acordeonArmoniaExtendida'));
		scheduleDashboardWorkspaceHeight($);
	}

	function initializeMultiAccordion($, accordion) {
		var headers = accordion.children('h3');

		accordion.addClass('ui-accordion ui-widget ui-helper-reset');

		headers.each(function (index) {
			var header = $(this);
			var panel = header.next('div');
			var isOpen = index === 0;

			header
				.addClass('ui-accordion-header ui-corner-top ui-state-default')
				.toggleClass('ui-accordion-header-active ui-state-active', isOpen)
				.attr('tabindex', '0');

			panel
				.addClass('ui-accordion-content ui-corner-bottom ui-helper-reset ui-widget-content')
				.toggle(isOpen);
		});

		headers.off('click.codaMultiAccordion keydown.codaMultiAccordion');
		headers.on('click.codaMultiAccordion keydown.codaMultiAccordion', function (event) {
			if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') {
				return;
			}

			event.preventDefault();
			toggleAccordionSection($, $(this));
		});
	}

	function toggleAccordionSection($, header) {
		var panel = header.next('div');
		var willOpen = !panel.is(':visible');

		header.toggleClass('ui-accordion-header-active ui-state-active', willOpen);
		panel.stop(true, true).slideToggle(120, function () {
			scheduleDashboardWorkspaceHeight($);
		});
	}

	function attachChordEvents(options) {
		var $ = options.$;
		var eventScope = $('#notacion, #armoniaExtendida');

		eventScope.off('.codaChordEvents');
		eventScope.on('mouseenter.codaChordEvents', '.celdaAcorde', function () {
			options.onChordMouseOver(this);
		});
		eventScope.on('mouseleave.codaChordEvents', '.celdaAcorde', function () {
			options.onChordMouseOut();
		});
		eventScope.on('click.codaChordEvents', '.celdaAcorde', function () {
			options.onChordClick(this);
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

		options.$('#instrumento').empty().append(html);
		attachInstrumentEvents(options);
	}

	function attachInstrumentEvents(options) {
		var $ = options.$;

		if (typeof options.onInstrumentNoteClick !== 'function') {
			return;
		}

		$('#instrumento').off('click.codaInstrumentPlayback');
		$('#instrumento').on('click.codaInstrumentPlayback', 'td.celdaNota span[data-midi-note]', function () {
			options.onInstrumentNoteClick(this);
		});
	}

	function scheduleInstrumentScale($) {
		if (pendingInstrumentScale) {
			return;
		}

		pendingInstrumentScale = true;
		nextFrame(function () {
			pendingInstrumentScale = false;
			syncInstrumentScale($);
		});
	}

	function scheduleDashboardWorkspaceHeight($) {
		if (pendingDashboardWorkspaceHeight) {
			return;
		}

		pendingDashboardWorkspaceHeight = true;
		nextFrame(function () {
			pendingDashboardWorkspaceHeight = false;
			syncDashboardWorkspaceHeight($);
		});
	}

	function scheduleSidebarPanelViewport($) {
		if (pendingSidebarPanelViewport) {
			return;
		}

		pendingSidebarPanelViewport = true;
		nextFrame(function () {
			pendingSidebarPanelViewport = false;
			syncSidebarPanelViewport($);
		});
	}

	function syncInstrumentScale($) {
		var viewport = $('#instrumento .instrumentScaleViewport')[0];
		var canvas = $('#instrumento .instrumentScaleCanvas')[0];

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

	function syncDashboardWorkspaceHeight($) {
		var sidebar = $('#panelTeorico')[0];
		var sidebarPanel = $('.dashboard__sidebarPanel')[0];
		var main = $('#areaTrabajo')[0];
		var container = $('#container')[0];

		if (!sidebar || !sidebarPanel || !main || !container) {
			return;
		}

		var viewportHeight = Math.max(0, window.innerHeight - 32);
		var sidebarHeight = sidebarPanel.scrollHeight;
		var mainHeight = main.scrollHeight;
		var workspaceHeight = Math.max(viewportHeight, sidebarHeight, mainHeight);

		container.style.setProperty('--dashboard-workspace-height', workspaceHeight + 'px');
		container.style.setProperty('--dashboard-sidebar-content-height', sidebarHeight + 'px');
		syncSidebarPanelViewport($);
	}

	function syncSidebarPanelViewport($) {
		var sidebarPanel = $('.dashboard__sidebarPanel')[0];
		var container = $('#container')[0];

		if (!sidebarPanel || !container) {
			return;
		}

		var panelTop = Math.max(sidebarPanel.getBoundingClientRect().top, 19);
		var panelHeight = Math.max(280, window.innerHeight - panelTop - 16);

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

	global.CodaUi = {
		attachChordEvents: attachChordEvents,
		attachInstrumentEvents: attachInstrumentEvents,
		hasRenderedResults: hasRenderedResults,
		initializeMultiAccordion: initializeMultiAccordion,
		noteName: noteName,
		readSelection: readSelection,
		renderExtendedHarmony: renderExtendedHarmony,
		renderInstrument: renderInstrument,
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
