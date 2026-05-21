// Renderer for progression workbench control panels.
(function (global) {
	'use strict';

	function renderPanels() {
		return '<div class="progressionControls">' +
			renderTimePanel() +
			renderWritingPanel() +
			renderColorPanel() +
			'</div>' +
			renderStyleDialog();
	}

	function renderTimePanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.time"></span></legend>';
		html += renderControl('progression.bars', '<select id="progressionBars"><option value="2">2</option><option value="4">4</option><option value="6">6</option><option value="8" selected="selected">8</option><option value="12">12</option><option value="16">16</option><option value="32">32</option></select>', '#progressionBars', null, 'progression.help.bars');
		html += renderControl('progression.meter', renderMeterSelect(), '#progressionMeter', null, 'progression.help.meter');
		html += renderControl(null, '<input id="progressionBpm" type="number" value="120" min="20" max="200" step="1" />', '#progressionBpm', 'BPM', 'progression.help.bpm');
		html += renderControl('progression.harmonicDensity', '<input id="progressionHarmonicDensity" type="range" value="0" min="0" max="100" step="1" />', '#progressionHarmonicDensity', null, 'progression.help.harmonicDensity');
		html += '</fieldset>';

		return html;
	}

	function renderWritingPanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.writing"></span></legend>';
		html += renderControl('progression.voices', '<input id="progressionVoices" type="number" value="4" min="1" max="6" step="1" />', '#progressionVoices', null, 'progression.help.voices');
		html += renderControl('progression.voicing', '<select id="progressionVoicing"><option value="closed" selected="selected" data-i18n="progression.voicing.closed"></option><option value="open" data-i18n="progression.voicing.open"></option></select>', '#progressionVoicing', null, 'progression.help.voicing');
		html += renderControl('progression.style', renderStyleSelect(), '#progressionStyle', null, 'progression.help.style', renderStyleHelpButton());
		html += renderControl('progression.articulation', renderArticulationSelect(), '#progressionArticulation', null, 'progression.help.articulation');
		html += '<div class="progressionExpressiveControls" data-articulation-detail hidden>';
		html += renderKnobControl('progression.intensity', '<input id="progressionIntensity" class="knobControl__input" type="range" value="80" min="1" max="127" step="1" />', '#progressionIntensity', 'progression.help.intensity', '');
		html += renderKnobControl('progression.humanization', '<input id="progressionHumanization" class="knobControl__input" type="range" value="0" min="0" max="100" step="1" />', '#progressionHumanization', 'progression.help.humanization', '%');
		html += renderKnobControl('progression.swing', '<input id="progressionSwing" class="knobControl__input" type="range" value="0" min="0" max="75" step="1" />', '#progressionSwing', 'progression.help.swing', '%');
		html += '</div>';
		html += '</fieldset>';

		return html;
	}

	function renderMeterSelect() {
		return '<select id="progressionMeter">' +
			'<option value="4/4">4/4</option>' +
			'<option value="3/4">3/4</option>' +
			'<option value="5/4">5/4</option>' +
			'<option value="7/4">7/4</option>' +
			'<option value="11/4">11/4</option>' +
			'<option value="5/8">5/8</option>' +
			'<option value="6/8">6/8</option>' +
			'<option value="7/8">7/8</option>' +
			'<option value="9/8">9/8</option>' +
			'<option value="12/8">12/8</option>' +
			'</select>';
	}

	function renderStyleSelect() {
		return '<select id="progressionStyle">' +
			'<option value="renaissance" data-i18n="progression.style.renaissance"></option>' +
			'<option value="baroque" data-i18n="progression.style.baroque"></option>' +
			'<option value="classic" data-i18n="progression.style.classic"></option>' +
			'<option value="romantic" data-i18n="progression.style.romantic"></option>' +
			'<option value="impressionist" data-i18n="progression.style.impressionist"></option>' +
			'<option value="contemporary" selected="selected" data-i18n="progression.style.contemporary"></option>' +
			'</select>';
	}

	function renderStyleHelpButton() {
		return '<button id="progressionStyleHelp" class="workbenchHelpButton" type="button" aria-haspopup="dialog" aria-controls="progressionStyleDialog" data-i18n-title="progression.styleDialog.open"><span class="material-icons" aria-hidden="true">help_outline</span></button>';
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

	function renderArticulationSelect() {
		return '<select id="progressionArticulation">' +
			'<option value="sustain" data-i18n="progression.articulation.sustain"></option>' +
			'<option value="staccato" data-i18n="progression.articulation.staccato"></option>' +
			'<optgroup data-i18n-label="progression.articulation.arpeggioGroup">' +
			'<option value="arpeggio_up" data-i18n="progression.articulation.arpeggio.up"></option>' +
			'<option value="arpeggio_down" data-i18n="progression.articulation.arpeggio.down"></option>' +
			'<option value="arpeggio_up_down" data-i18n="progression.articulation.arpeggio.upDown"></option>' +
			'<option value="arpeggio_down_up" data-i18n="progression.articulation.arpeggio.downUp"></option>' +
			'<option value="arpeggio_alternate" data-i18n="progression.articulation.arpeggio.alternate"></option>' +
			'<option value="arpeggio_outside_in" data-i18n="progression.articulation.arpeggio.outsideIn"></option>' +
			'<option value="arpeggio_random" data-i18n="progression.articulation.arpeggio.random"></option>' +
			'</optgroup>' +
			'</select>';
	}

	function renderControl(labelKey, controlHtml, targetSelector, fallbackLabel, helpKey, labelActionHtml) {
		var labelHtml = labelKey ? '<span data-i18n="' + labelKey + '"></span>' : '<span>' + fallbackLabel + '</span>';
		var helpAttribute = helpKey ? ' class="workbenchControl" data-help-i18n="' + helpKey + '" title=""' : '';

		if (labelActionHtml) {
			return '<div' + helpAttribute.replace('workbenchControl', 'workbenchControl workbenchControl--withAction') + '><span class="workbenchControlLabel"><label class="workbenchControlText" for="' + targetSelector.replace('#', '') + '">' + labelHtml + '</label>' + labelActionHtml + '</span>' + controlHtml + renderRandomButton(targetSelector) + '</div>';
		}

		return '<label' + helpAttribute + '><span class="workbenchControlLabel">' + labelHtml + (labelActionHtml || '') + '</span>' + controlHtml + renderRandomButton(targetSelector) + '</label>';
	}

	function renderStyleDialog() {
		return '<div id="progressionStyleDialog" class="dialogoNovedades progressionStyleDialog" role="dialog" aria-modal="true" aria-labelledby="progressionStyleDialogTitle" hidden>' +
			'<div class="dialogoNovedades__surface">' +
			'<div class="dialogoNovedades__titlebar">' +
			'<h2 class="dialogoNovedades__title" id="progressionStyleDialogTitle" data-i18n="progression.styleDialog.title"></h2>' +
			'<button class="dialogoNovedades__close" id="progressionStyleDialogClose" type="button" data-i18n-title="progression.styleDialog.close"><span class="material-icons" aria-hidden="true">close</span></button>' +
			'</div>' +
			'<div class="dialogoNovedades__content">' +
			'<p data-i18n="progression.styleDialog.intro"></p>' +
			'<dl>' +
			'<dt data-i18n="progression.styleDialog.general.title"></dt>' +
			'<dd data-i18n="progression.styleDialog.general.body"></dd>' +
			'<dt data-i18n="progression.styleDialog.renaissance.title"></dt>' +
			'<dd data-i18n="progression.styleDialog.renaissance.body"></dd>' +
			'<dt data-i18n="progression.styleDialog.baroque.title"></dt>' +
			'<dd data-i18n="progression.styleDialog.baroque.body"></dd>' +
			'<dt data-i18n="progression.styleDialog.classic.title"></dt>' +
			'<dd data-i18n="progression.styleDialog.classic.body"></dd>' +
			'<dt data-i18n="progression.styleDialog.romantic.title"></dt>' +
			'<dd data-i18n="progression.styleDialog.romantic.body"></dd>' +
			'<dt data-i18n="progression.styleDialog.impressionist.title"></dt>' +
			'<dd data-i18n="progression.styleDialog.impressionist.body"></dd>' +
			'<dt data-i18n="progression.styleDialog.contemporary.title"></dt>' +
			'<dd data-i18n="progression.styleDialog.contemporary.body"></dd>' +
			'</dl>' +
			'<p data-i18n="progression.styleDialog.references"></p>' +
			'</div>' +
			'</div>' +
			'</div>';
	}

	function renderKnobControl(labelKey, controlHtml, targetSelector, helpKey, unit) {
		return '<label class="workbenchControl workbenchControl--knob" data-help-i18n="' + helpKey + '" title="">' +
			'<span class="workbenchControlHeader"><span data-i18n="' + labelKey + '"></span>' + renderRandomButton(targetSelector) + '</span>' +
			'<span class="knobControl" data-knob-unit="' + unit + '">' +
			controlHtml +
			'<span class="knobControl__dial" aria-hidden="true"><span class="knobControl__indicator"></span></span>' +
			'<output class="knobControl__value"></output>' +
			'</span>' +
			'</label>';
	}

	function renderRandomButton(targetSelector) {
		return '<button class="randomSelectButton randomControlButton" type="button" data-random-control-target="' + targetSelector + '" data-random-group="global" data-random-i18n-key="randomSelect.label"><span class="material-icons" aria-hidden="true">casino</span></button>';
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionControls = {
		renderColorPanel: renderColorPanel,
		renderControl: renderControl,
		renderMeterSelect: renderMeterSelect,
		renderKnobControl: renderKnobControl,
		renderPanels: renderPanels,
		renderStyleDialog: renderStyleDialog,
		renderStyleSelect: renderStyleSelect,
		renderArticulationSelect: renderArticulationSelect,
		renderTimePanel: renderTimePanel,
		renderWritingPanel: renderWritingPanel
	};
})(window);
