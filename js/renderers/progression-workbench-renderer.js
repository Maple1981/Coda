// Renderer inicial para la futura área de construcción de progresiones.
(function (global) {
	'use strict';

	function render() {
		var html = '';

		html += '<div class="workbenchHeader">';
		html += '<p class="workbenchKicker"></p>';
		html += '<h2></h2>';
		html += '</div>';
		html += '<div class="progressionControls">';
		html += renderTimePanel();
		html += renderWritingPanel();
		html += renderColorPanel();
		html += '</div>';
		html += renderTimeline();
		html += '<div class="transportControls">';
		html += '<input type="button" value="" />';
		html += '<input type="button" value="" />';
		html += '</div>';

		return html;
	}

	function renderTimePanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.time"></span></legend>';
		html += '<label><span data-i18n="progression.bars"></span><input type="number" value="8" min="1" max="32" /></label>';
		html += '<label><span data-i18n="progression.meter"></span><select><option>4/4</option><option>3/4</option><option>6/8</option></select></label>';
		html += '<label>BPM <input type="number" value="96" min="40" max="240" /></label>';
		html += '</fieldset>';

		return html;
	}

	function renderWritingPanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.writing"></span></legend>';
		html += '<label><span data-i18n="progression.voices"></span><input type="number" value="4" min="2" max="6" /></label>';
		html += '<label><span data-i18n="progression.articulation"></span><select>';
		html += '<option data-i18n="progression.articulation.sustain"></option>';
		html += '<option data-i18n="progression.articulation.legato"></option>';
		html += '<option data-i18n="progression.articulation.staccato"></option>';
		html += '<option data-i18n="progression.articulation.arpeggio"></option>';
		html += '</select></label>';
		html += '</fieldset>';

		return html;
	}

	function renderColorPanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.harmonicColor"></span></legend>';
		html += '<label><span data-i18n="progression.modalInterchange"></span><input type="range" value="25" min="0" max="100" /></label>';
		html += '<label><span data-i18n="progression.tensions"></span><input type="range" value="35" min="0" max="100" /></label>';
		html += '<label><span data-i18n="progression.counterpoint"></span><input type="range" value="20" min="0" max="100" /></label>';
		html += '</fieldset>';

		return html;
	}

	function renderTimeline() {
		var measures = ['Imaj7', 'vi7', 'ii7', 'V7', 'Imaj7', 'IVmaj7', 'V7sus4', 'Imaj9'];
		var html = '<div class="progressionTimeline" aria-label="">';

		for (var i = 0; i < measures.length; i++) {
			html += '<div class="measure"><span>' + (i + 1) + '</span><strong>' + measures[i] + '</strong></div>';
		}

		html += '</div>';

		return html;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionWorkbench = {
		render: render,
		renderColorPanel: renderColorPanel,
		renderTimePanel: renderTimePanel,
		renderTimeline: renderTimeline,
		renderWritingPanel: renderWritingPanel
	};
})(window);
