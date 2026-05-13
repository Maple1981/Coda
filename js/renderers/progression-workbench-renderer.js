// Renderer inicial para la futura área de construcción de progresiones.
(function (global) {
	'use strict';

	function render() {
		var html = '';

		html += '<div class="workbenchHeader">';
		html += '<div class="workbenchTitleGroup"><h2></h2><p class="workbenchKicker"></p></div>';
		html += '<div class="workbenchContextGroup"><button id="toggleCircleOfFifthsFromContext" class="workbenchCircleToggle" type="button" title="" aria-label="" aria-controls="circleOfFifthsPopover" aria-expanded="false" hidden><span class="material-icons" aria-hidden="true">donut_large</span></button><p class="workbenchContext" aria-live="polite"><span class="workbenchContextKey"></span><span class="workbenchContextInstrument"></span></p><button id="toggleWorkbenchInstrumentMenu" class="workbenchInstrumentToggle" type="button" title="" aria-label="" aria-controls="workbenchInstrumentMenu" aria-expanded="false"><span class="material-icons" aria-hidden="true">expand_more</span></button><div id="workbenchInstrumentMenu" class="workbenchInstrumentMenu" hidden></div></div>';
		html += '</div>';
		html += '<div class="progressionControls">';
		html += renderTimePanel();
		html += renderWritingPanel();
		html += renderColorPanel();
		html += '</div>';
		html += '<div class="progressionGenerateBar">';
		html += '<button id="generateProgression" type="button" class="transportButton transportButton--generate"><span class="material-icons" aria-hidden="true">auto_awesome</span><span data-i18n="progression.generate"></span></button>';
		html += '</div>';
		html += renderTimeline();
		html += '<div class="transportControls">';
		html += '<label class="loopControl metronomeControl"><input id="progressionMetronome" type="checkbox" /><span data-i18n="progression.metronome"></span></label>';
		html += '<label class="loopControl"><input id="progressionLoop" type="checkbox" /><span data-i18n="progression.loop"></span></label>';
		html += '<button type="button" class="transportButton transportButton--goStart" title="" aria-label="" hidden><span class="material-icons" aria-hidden="true">first_page</span><span data-i18n="progression.goStart"></span></button>';
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
		html += renderControl(null, '<input id="progressionBpm" type="number" value="120" min="20" max="200" step="1" />', '#progressionBpm', 'BPM');
		html += '</fieldset>';

		return html;
	}

	function renderWritingPanel() {
		var html = '<fieldset class="workbenchPanel">';

		html += '<legend><span data-i18n="progression.writing"></span></legend>';
		html += renderControl('progression.voices', '<input id="progressionVoices" type="number" value="4" min="1" max="6" step="1" />', '#progressionVoices');
		html += renderControl('progression.articulation', '<select id="progressionArticulation"><option value="sustain" data-i18n="progression.articulation.sustain"></option><option value="legato" data-i18n="progression.articulation.legato"></option><option value="staccato" data-i18n="progression.articulation.staccato"></option><option value="arpeggio" data-i18n="progression.articulation.arpeggio"></option></select>', '#progressionArticulation');
		html += renderControl('progression.style', '<select id="progressionStyle"><option value="modern" selected="selected" data-i18n="progression.style.modern"></option><option value="classic" data-i18n="progression.style.classic"></option></select>', '#progressionStyle');
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
		var measures = hasRenderableMeasures(progressionMeasures) ? progressionMeasures : fallbackMeasures();
		var html = '';

		for (var i = 0; i < measures.length; i++) {
			html += renderMeasure(measures[i], i);
		}

		return html;
	}

	function hasRenderableMeasures(measures) {
		if (!measures || !measures.length) {
			return false;
		}

		for (var i = 0; i < measures.length; i++) {
			if (measures[i].displayName || measures[i].chordName || measures[i].label) {
				return true;
			}

			if (measures[i].chords && hasRenderableMeasures(measures[i].chords)) {
				return true;
			}
		}

		return false;
	}

	function renderMeasure(measure, index) {
		var bar = measure.bar || index + 1;
		var chords = measure.chords && measure.chords.length ? measure.chords : [measure];
		var splitClass = chords.length > 1 ? ' measure--split' : '';
		var html = '';

		html += '<div class="measure' + splitClass + '" draggable="true" data-progression-bar="' + escapeHtml(bar) + '" data-progression-index="' + escapeHtml(index) + '" tabindex="0">';
		html += '<button type="button" class="measureDragHandle" draggable="true" aria-label="" title="" data-i18n-title="progression.dragMeasure"><span class="material-icons" aria-hidden="true">open_with</span></button>';
		html += '<span class="measureBar">' + escapeHtml(bar) + '</span>';
		html += '<div class="measureChordList">';

		for (var i = 0; i < chords.length; i++) {
			html += renderMeasureChord(chords[i], i, chords.length);
		}

		html += '</div>';
		html += '</div>';

		return html;
	}

	function renderMeasureChord(chord, chordIndex, chordCount) {
		var label = chord.displayName || chord.chordName || chord.label || '';
		var degree = chord.degree || '';
		var tonalFunction = chord.tonalFunction || '';
		var buttons = '';
		var dragHandle = '';

		if (chordCount > 2 && chordIndex > 0) {
			dragHandle = '<button type="button" class="measureChordDragHandle" draggable="true" aria-label="" title="" data-i18n-title="progression.dragMeasureChord"><span class="material-icons" aria-hidden="true">open_with</span></button>';
		}

		if (chordCount === 1 && chordIndex === 0) {
			buttons += '<button type="button" class="measureSplitButton" data-progression-split-action="add" aria-label="" title="" data-i18n-title="progression.addMeasureChord">+</button>';
		} else if (chordCount > 1 && chordIndex > 0) {
			if (chordCount < 4) {
				buttons += '<button type="button" class="measureSplitButton" data-progression-split-action="add" aria-label="" title="" data-i18n-title="progression.addMeasureChord">+</button>';
			}
			buttons += '<button type="button" class="measureSplitButton" data-progression-split-action="remove" aria-label="" title="" data-i18n-title="progression.removeMeasureChord">-</button>';
		}

		if (buttons) {
			buttons = '<span class="measureSplitActions">' + buttons + '</span>';
		}

		return '<div class="measureChord" data-measure-chord-index="' + escapeHtml(chordIndex) + '">' +
			dragHandle +
			buttons +
			'<span class="measureChordName"><strong>' + formatMusicalLabel(label) + '</strong><button type="button" class="measureChordMenuButton" data-measure-chord-menu="true" aria-haspopup="menu" aria-expanded="false" aria-label="" title="" data-i18n-title="progression.changeMeasureChord"><span class="material-icons" aria-hidden="true">more_vert</span></button></span>' +
			(degree ? '<em class="measureDegree">' + formatMusicalLabel(degree) + '</em>' : '') +
			(tonalFunction ? '<span class="measureFunction">' + escapeHtml(tonalFunction) + '</span>' : '') +
			'</div>';
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

	function formatMusicalLabel(value) {
		return String(value).split(/(\s+)/).map(function (part) {
			if (isInversionLabel(part)) {
				return '<sub class="musicInversion">' + escapeHtml(part) + '</sub>';
			}

			return escapeHtml(part);
		}).join('');
	}

	function isInversionLabel(value) {
		return /^(6|6\/4|6\/5|4\/3|4\/2)$/.test(value);
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionWorkbench = {
		render: render,
		renderColorPanel: renderColorPanel,
		renderTimePanel: renderTimePanel,
		renderTimeline: renderTimeline,
		hasRenderableMeasures: hasRenderableMeasures,
		renderTimelineMeasures: renderTimelineMeasures,
		renderWritingPanel: renderWritingPanel
	};
})(window);
