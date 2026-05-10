// UI orchestration for the legacy jQuery screen. It reads DOM selections and
// mounts renderer output, but delegates musical work to the application layer.
(function (global) {
	'use strict';

	function readSelection($) {
		return {
			instrument: $('#interface input:radio[name="instrumento"]:checked').val(),
			preferFlats: $('#interface input:radio[name="formato"]:checked').val() === '1',
			scaleIndex: parseInt($('select#escala option:selected').val(), 10),
			scaleName: $('select#escala option:selected').text(),
			tonicIndex: parseInt($('select#tonica option:selected').val(), 10),
			tonicName: $('select#tonica option:selected').text()
		};
	}

	function hasRenderedResults($) {
		return $('#notacion').children().length > 0 && $('#instrumento').children().length > 0;
	}

	function renderScaleReport(options) {
		var $ = options.$;
		var report = options.report;

		$('#notacion').empty().append(options.renderers.scaleSummary.renderTitle({
			scaleName: report.scaleName,
			tonicName: report.tonicName
		}));

		$('#notacion').append(options.renderers.scaleSummary.renderList({
			circleOfFifths: options.data.circleOfFifths,
			isDegreeSuppressed: report.isDegreeSuppressed,
			scaleDefinition: report.scaleDefinition,
			scaleNotes: report.scaleNotes,
			selectedScaleIndex: report.scaleIndex,
			tonicName: report.tonicName
		}));

		$('#armoniaExtendida').empty();

		if (report.scaleNotes.length === 7) {
			$('#notacion').append(options.renderers.scaleChords.render({
				mode: report.mode,
				parallelScaleChords: report.parallelScaleChords,
				scaleChords: report.scaleChords,
				scaleDefinition: report.scaleDefinition,
				scaleNotes: report.scaleNotes
			}));

			if (report.extendedHarmonyEnabled) {
				renderExtendedHarmony(options);
			}

			attachChordEvents(options);
		}

		$('#circuloQuintas').empty().append(options.renderers.circleOfFifths.render(report.circleOfFifths));
	}

	function renderExtendedHarmony(options) {
		var $ = options.$;
		var report = options.report;

		$('#armoniaExtendida').empty().append(options.renderers.extendedHarmony.render({
			data: options.data,
			domain: options.domain,
			mode: report.mode,
			preferFlats: options.selection.preferFlats,
			scaleChords: report.scaleChords,
			scaleName: report.scaleName,
			scaleNotes: report.scaleNotes,
			tonicName: report.tonicName
		}));

		$('#acordeonArmoniaExtendida').accordion({
			activate: function () {
				syncDashboardWorkspaceHeight($);
			},
			heightStyle: 'content'
		});
		$('#acordeonArmoniaExtendida').accordion('option', 'collapsible', true);
		syncDashboardWorkspaceHeight($);
	}

	function attachChordEvents(options) {
		var $ = options.$;

		$('.celdaAcorde').mouseover(function () {
			options.onChordMouseOver(this);
		});
		$('.celdaAcorde').mouseout(function () {
			options.onChordMouseOut();
		});
		$('.celdaAcorde').click(function () {
			options.onChordClick(this);
		});
	}

	function renderInstrument(options) {
		var html = '';

		if (options.instrumentView.type === 'piano') {
			html = options.renderers.instruments.renderPiano({
				keyboard: options.instrumentView.keyboard,
				scaleDefinition: options.report.scaleDefinition
			});
		} else {
			html = options.renderers.instruments.renderGuitar({
				scaleDefinition: options.report.scaleDefinition,
				strings: options.instrumentView.strings,
				tuning: options.instrumentView.tuning,
				tunings: options.data.tunings
			});
		}

		options.$('#instrumento').empty().append(html);
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

	global.CodaUi = {
		attachChordEvents: attachChordEvents,
		hasRenderedResults: hasRenderedResults,
		readSelection: readSelection,
		renderExtendedHarmony: renderExtendedHarmony,
		renderInstrument: renderInstrument,
		renderScaleReport: renderScaleReport,
		syncDashboardWorkspaceHeight: syncDashboardWorkspaceHeight,
		syncInstrumentScale: syncInstrumentScale,
		syncSidebarPanelViewport: syncSidebarPanelViewport
	};
})(window);
