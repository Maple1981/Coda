// Renderer for progression measure timeline.
(function (global) {
	'use strict';

	var labels = global.CodaRenderers.progressionLabels;

	function renderTimeline(progression, options) {
		var html = '<div class="progressionTimeline" aria-label="">';

		html += renderTimelineMeasures(progression, options);
		html += '</div>';

		return html;
	}

	function renderTimelineMeasures(progression, options) {
		var progressionMeasures = progression && progression.measures ? progression.measures : null;
		var measures = hasRenderableMeasures(progressionMeasures) ? progressionMeasures : fallbackMeasures();
		var html = '';

		for (var i = 0; i < measures.length; i++) {
			html += renderMeasure(measures[i], i, options);
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

			if (measures[i].isSilence) {
				return true;
			}

			if (measures[i].chords && hasRenderableMeasures(measures[i].chords)) {
				return true;
			}
		}

		return false;
	}

	function renderMeasure(measure, index, options) {
		var bar = measure.bar || index + 1;
		var chords = measure.chords && measure.chords.length ? measure.chords : [measure];
		var splitClass = chords.length > 1 ? ' measure--split' : '';
		var html = '';

		html += '<div class="measure' + splitClass + '" draggable="true" data-progression-bar="' + labels.escapeHtml(bar) + '" data-progression-index="' + labels.escapeHtml(index) + '" tabindex="0">';
		html += '<button type="button" class="measureDragHandle" draggable="true" aria-label="" title="" data-i18n-title="progression.dragMeasure"><span class="material-icons" aria-hidden="true">open_with</span></button>';
		html += '<span class="measureBar">' + labels.escapeHtml(bar) + '</span>';
		html += '<div class="measureChordList">';

		for (var i = 0; i < chords.length; i++) {
			html += renderMeasureChord(chords[i], i, chords.length, options);
		}

		html += '</div>';
		html += '</div>';

		return html;
	}

	function renderMeasureChord(chord, chordIndex, chordCount, options) {
		var label = chord.displayName || chord.chordName || chord.label || '';
		var degree = chord.degree || '';
		var tonalFunction = chord.tonalFunction || '';
		var source = sourceLabel(chord, options || {});
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

		return '<div class="measureChord" data-measure-chord-index="' + labels.escapeHtml(chordIndex) + '">' +
			dragHandle +
			buttons +
			'<span class="measureChordName"><strong>' + labels.formatMusicalLabel(label) + '</strong><button type="button" class="measureChordMenuButton" data-measure-chord-menu="true" aria-haspopup="menu" aria-expanded="false" aria-label="" title="" data-i18n-title="progression.changeMeasureChord"><span class="material-icons" aria-hidden="true">more_vert</span></button></span>' +
			(degree ? '<em class="measureDegree">' + labels.formatMusicalLabel(degree) + '</em>' : '') +
			(tonalFunction ? '<span class="measureFunction">' + labels.escapeHtml(tonalFunction) + '</span>' : '') +
			(source ? '<span class="measureSource">' + labels.escapeHtml(source) + '</span>' : '') +
			'</div>';
	}

	function sourceLabel(chord, options) {
		var scaleIndex = chord.sourceScaleIndex;
		var scaleName = scaleIndex != null && options.i18n && typeof options.i18n.t === 'function' ? options.i18n.t('data.scales.' + scaleIndex) : '';
		var tonicName = chord.sourceTonicName || '';

		if (chord.source !== 'interchange' || !scaleName) {
			return '';
		}

		if (tonicName && options.notation && typeof options.notation.formatNoteName === 'function') {
			tonicName = options.notation.formatNoteName(tonicName, options.notationStyle);
		}

		return tonicName ? tonicName + ' ' + scaleName : scaleName;
	}

	function fallbackMeasures() {
		return ['Imaj7', 'vi7', 'ii7', 'V7', 'Imaj7', 'IVmaj7', 'V7sus4', 'Imaj9'].map(function (label, index) {
			return {
				bar: index + 1,
				label: label
			};
		});
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionTimeline = {
		hasRenderableMeasures: hasRenderableMeasures,
		renderMeasure: renderMeasure,
		renderMeasureChord: renderMeasureChord,
		sourceLabel: sourceLabel,
		renderTimeline: renderTimeline,
		renderTimelineMeasures: renderTimelineMeasures
	};
})(window);
