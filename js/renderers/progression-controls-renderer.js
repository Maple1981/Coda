// Renderer for progression workbench control panels.
(function (global) {
	'use strict';

	function renderPanels() {
		return '<div class="progressionControls">' +
			renderTimePanel() +
			renderWritingPanel() +
			renderColorPanel() +
			'</div>';
	}

	function renderTimePanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.time"></span></legend>';
		html += renderControl('progression.bars', '<select id="progressionBars"><option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="8" selected="selected">8</option><option value="12">12</option><option value="16">16</option><option value="32">32</option></select>', '#progressionBars', null, 'progression.help.bars');
		html += renderControl('progression.meter', '<select id="progressionMeter"><option value="4/4">4/4</option><option value="3/4">3/4</option><option value="6/8">6/8</option></select>', '#progressionMeter', null, 'progression.help.meter');
		html += renderControl(null, '<input id="progressionBpm" type="number" value="120" min="20" max="200" step="1" />', '#progressionBpm', 'BPM', 'progression.help.bpm');
		html += '</fieldset>';

		return html;
	}

	function renderWritingPanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.writing"></span></legend>';
		html += renderControl('progression.voices', '<input id="progressionVoices" type="number" value="4" min="1" max="6" step="1" />', '#progressionVoices', null, 'progression.help.voices');
		html += renderControl('progression.voicing', '<select id="progressionVoicing"><option value="closed" selected="selected" data-i18n="progression.voicing.closed"></option><option value="open" data-i18n="progression.voicing.open"></option></select>', '#progressionVoicing', null, 'progression.help.voicing');
		html += renderControl('progression.articulation', '<select id="progressionArticulation"><option value="sustain" data-i18n="progression.articulation.sustain"></option><option value="legato" data-i18n="progression.articulation.legato"></option><option value="staccato" data-i18n="progression.articulation.staccato"></option><option value="arpeggio" data-i18n="progression.articulation.arpeggio"></option></select>', '#progressionArticulation', null, 'progression.help.articulation');
		html += renderControl('progression.style', '<select id="progressionStyle"><option value="modern" selected="selected" data-i18n="progression.style.modern"></option><option value="classic" data-i18n="progression.style.classic"></option></select>', '#progressionStyle', null, 'progression.help.style');
		html += renderControl('progression.intensity', '<input id="progressionIntensity" type="range" value="80" min="1" max="127" step="1" />', '#progressionIntensity', null, 'progression.help.intensity');
		html += renderControl('progression.humanization', '<input id="progressionHumanization" type="range" value="0" min="0" max="100" step="1" />', '#progressionHumanization', null, 'progression.help.humanization');
		html += renderControl('progression.swing', '<input id="progressionSwing" type="range" value="0" min="0" max="75" step="1" />', '#progressionSwing', null, 'progression.help.swing');
		html += '</fieldset>';

		return html;
	}

	function renderColorPanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.harmonicColor"></span></legend>';
		html += renderControl('progression.modalInterchange', '<input id="progressionModalInterchange" type="range" value="25" min="0" max="100" step="1" />', '#progressionModalInterchange', null, 'progression.help.modalInterchange');
		html += renderControl('progression.chromaticism', '<input id="progressionChromaticism" type="range" value="10" min="0" max="100" step="1" />', '#progressionChromaticism', null, 'progression.help.chromaticism');
		html += renderControl('progression.tensions', '<input id="progressionTensions" type="range" value="35" min="0" max="100" step="1" />', '#progressionTensions', null, 'progression.help.tensions');
		html += renderControl('progression.counterpoint', '<input id="progressionCounterpoint" type="range" value="20" min="0" max="100" step="1" />', '#progressionCounterpoint', null, 'progression.help.counterpoint');
		html += '</fieldset>';

		return html;
	}

	function renderControl(labelKey, controlHtml, targetSelector, fallbackLabel, helpKey) {
		var labelHtml = labelKey ? '<span data-i18n="' + labelKey + '"></span>' : '<span>' + fallbackLabel + '</span>';
		var helpAttribute = helpKey ? ' class="workbenchControl" data-help-i18n="' + helpKey + '" title=""' : '';

		return '<label' + helpAttribute + '>' + labelHtml + controlHtml + renderRandomButton(targetSelector) + '</label>';
	}

	function renderRandomButton(targetSelector) {
		return '<button class="randomSelectButton randomControlButton" type="button" data-random-control-target="' + targetSelector + '" data-random-group="global" data-random-i18n-key="randomSelect.label"><span class="material-icons" aria-hidden="true">casino</span></button>';
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionControls = {
		renderColorPanel: renderColorPanel,
		renderControl: renderControl,
		renderPanels: renderPanels,
		renderTimePanel: renderTimePanel,
		renderWritingPanel: renderWritingPanel
	};
})(window);
