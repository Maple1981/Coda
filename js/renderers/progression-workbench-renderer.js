// Renderer inicial para el área de construcción de progresiones.
(function (global) {
	'use strict';

	var controlsRenderer = global.CodaRenderers.progressionControls;
	var timelineRenderer = global.CodaRenderers.progressionTimeline;

	function render() {
		var html = '';

		html += renderHeader();
		html += controlsRenderer.renderPanels();
		html += renderGenerateBar();
		html += timelineRenderer.renderTimeline();
		html += renderTransportControls();

		return html;
	}

	function renderHeader() {
		return '<div class="workbenchHeader">' +
			'<div class="workbenchTitleGroup"><h2></h2><p class="workbenchKicker"></p></div>' +
			'<div class="workbenchContextGroup"><button id="toggleCircleOfFifthsFromContext" class="workbenchCircleToggle" type="button" title="" aria-label="" aria-controls="circleOfFifthsPopover" aria-expanded="false" hidden><span class="material-icons" aria-hidden="true">donut_large</span></button><p class="workbenchContext" aria-live="polite"><span id="workbenchContextKeyToggle" class="workbenchContextKey" role="button" tabindex="0" aria-controls="circleOfFifthsPopover" aria-expanded="false"></span><span id="workbenchContextInstrumentToggle" class="workbenchContextInstrument" role="button" tabindex="0" aria-controls="workbenchInstrumentMenu" aria-expanded="false"></span></p><button id="toggleWorkbenchInstrumentMenu" class="workbenchInstrumentToggle" type="button" title="" aria-label="" aria-controls="workbenchInstrumentMenu" aria-expanded="false"><span class="material-icons" aria-hidden="true">expand_more</span></button><div id="workbenchInstrumentMenu" class="workbenchInstrumentMenu" hidden></div></div>' +
			'</div>';
	}

	function renderGenerateBar() {
		return '<div class="progressionGenerateBar">' +
			'<button id="generateProgression" type="button" class="transportButton transportButton--generate"><span class="material-icons" aria-hidden="true">auto_awesome</span><span data-i18n="progression.generate"></span></button>' +
			'</div>';
	}

	function renderTransportControls() {
		var html = '<div class="transportControls">';

		html += '<label class="loopControl metronomeControl"><input id="progressionMetronome" type="checkbox" /><span data-i18n="progression.metronome"></span></label>';
		html += '<label class="loopControl"><input id="progressionLoop" type="checkbox" /><span data-i18n="progression.loop"></span></label>';
		html += '<button type="button" class="transportButton transportButton--goStart" title="" aria-label="" hidden><span class="material-icons" aria-hidden="true">first_page</span><span data-i18n="progression.goStart"></span></button>';
		html += '<button type="button" class="transportButton transportButton--listen" aria-pressed="false"><span class="material-icons" aria-hidden="true">play_arrow</span><span data-i18n="progression.listen"></span></button>';
		html += '<button type="button" class="transportButton transportButton--export"><span class="material-icons" aria-hidden="true">ios_share</span><span data-i18n="progression.exportMidi"></span></button>';
		html += '</div>';

		return html;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionWorkbench = {
		hasRenderableMeasures: timelineRenderer.hasRenderableMeasures,
		render: render,
		renderColorPanel: controlsRenderer.renderColorPanel,
		renderHeader: renderHeader,
		renderTimePanel: controlsRenderer.renderTimePanel,
		renderTimeline: timelineRenderer.renderTimeline,
		renderTimelineMeasures: timelineRenderer.renderTimelineMeasures,
		renderTransportControls: renderTransportControls,
		renderWritingPanel: controlsRenderer.renderWritingPanel
	};
})(window);
