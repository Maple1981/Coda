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
		html += '<button type="button" class="transportButton transportButton--listen" aria-pressed="false"><span class="material-icons" aria-hidden="true">play_arrow</span><span data-i18n="progression.listen"></span></button>';
		html += '<button type="button" class="transportButton transportButton--export"><span class="material-icons" aria-hidden="true">ios_share</span><span data-i18n="progression.exportMidi"></span></button>';
		html += '</div>';

		return html;
	}

	function renderTimePanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.time"></span></legend>';
		html += renderControl('progression.bars', '<select id="progressionBars"><option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="8" selected="selected">8</option><option value="12">12</option><option value="16">16</option><option value="32">32</option></select>', '#progressionBars');
		html += renderControl('progression.meter', '<select id="progressionMeter"><option value="4/4">4/4</option><option value="3/4">3/4</option><option value="6/8">6/8</option></select>', '#progressionMeter');
		html += renderControl(null, '<input id="progressionBpm" type="number" value="96" min="20" max="200" step="1" />', '#progressionBpm', 'BPM');
		html += '</fieldset>';

		return html;
	}

	function renderWritingPanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.writing"></span></legend>';
		html += renderControl('progression.voices', '<input id="progressionVoices" type="number" value="4" min="1" max="6" step="1" />', '#progressionVoices');
		html += renderControl('progression.articulation', '<select id="progressionArticulation"><option value="sustain" data-i18n="progression.articulation.sustain"></option><option value="legato" data-i18n="progression.articulation.legato"></option><option value="staccato" data-i18n="progression.articulation.staccato"></option><option value="arpeggio" data-i18n="progression.articulation.arpeggio"></option></select>', '#progressionArticulation');
		html += '</fieldset>';

		return html;
	}

	function renderColorPanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.harmonicColor"></span></legend>';
		html += renderControl('progression.modalInterchange', '<input id="progressionModalInterchange" type="range" value="25" min="0" max="100" step="1" />', '#progressionModalInterchange');
		html += renderControl('progression.tensions', '<input id="progressionTensions" type="range" value="35" min="0" max="100" step="1" />', '#progressionTensions');
		html += renderControl('progression.counterpoint', '<input id="progressionCounterpoint" type="range" value="20" min="0" max="100" step="1" />', '#progressionCounterpoint');
		html += '</fieldset>';

		return html;
	}

	function renderControl(labelKey, controlHtml, targetSelector, fallbackLabel) {
		var labelHtml = labelKey ? '<span data-i18n="' + labelKey + '"></span>' : '<span>' + fallbackLabel + '</span>';

		return '<label>' + labelHtml + controlHtml + renderRandomButton(targetSelector) + '</label>';
	}

	function renderRandomButton(targetSelector) {
		return '<button class="randomSelectButton randomControlButton" type="button" data-random-control-target="' + targetSelector + '" data-random-group="global" data-random-i18n-key="randomSelect.label"><span class="material-icons" aria-hidden="true">casino</span></button>';
	}

	function renderTimeline(progression) {
		var html = '<div class="progressionTimeline" aria-label="">';

		html += renderTimelineMeasures(progression);
		html += '</div>';

		return html;
	}

	function renderTimelineMeasures(progression) {
		var progressionMeasures = progression && progression.measures ? progression.measures : null;
		var measures = progressionMeasures || fallbackMeasures();
		var html = '';

		for (var i = 0; i < measures.length; i++) {
			html += renderMeasure(measures[i], i);
		}

		return html;
	}

	function renderMeasure(measure, index) {
		var bar = measure.bar || index + 1;
		var label = measure.chordName || measure.label || '';

		return '<div class="measure" data-progression-bar="' + escapeHtml(bar) + '"><span>' + escapeHtml(bar) + '</span><strong>' + escapeHtml(label) + '</strong></div>';
	}

	function fallbackMeasures() {
		return ['Imaj7', 'vi7', 'ii7', 'V7', 'Imaj7', 'IVmaj7', 'V7sus4', 'Imaj9'].map(function (label, index) {
			return {
				bar: index + 1,
				label: label
			};
		});
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionWorkbench = {
		render: render,
		renderColorPanel: renderColorPanel,
		renderTimePanel: renderTimePanel,
		renderTimeline: renderTimeline,
		renderTimelineMeasures: renderTimelineMeasures,
		renderWritingPanel: renderWritingPanel
	};
})(window);
