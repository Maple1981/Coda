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
		var sections = timelineSections(progression, measures);
		var html = '';

		for (var i = 0; i < sections.length; i++) {
			html += renderSectionHeader(sections[i], options);
			for (var j = sections[i].startIndex; j < sections[i].startIndex + sections[i].length && j < measures.length; j++) {
				html += renderMeasure(measures[j], j, options);
			}
		}

		if (!hasSection(sections, 'B')) {
			html += renderSectionHeader({
				id: 'B',
				labelKey: 'progression.sectionB',
				length: 0,
				startIndex: measures.length
			}, options);
		}

		return html;
	}

	function timelineSections(progression, measures) {
		var sections = progression && progression.sections ? progression.sections : null;

		if (sections && sections.length) {
			return sections;
		}

		return [
			{
				id: 'A',
				labelKey: 'progression.sectionA',
				length: measures.length,
				startIndex: 0
			}
		];
	}

	function hasSection(sections, id) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (sections[i].id === id) {
				return true;
			}
		}

		return false;
	}

	function renderSectionHeader(section, options) {
		var html = '<div class="progressionSectionHeader" data-progression-section="' + labels.escapeHtml(section.id) + '">';
		var contextLabel = sectionContextLabel(section, options || {});

		html += '<h3 data-i18n="' + labels.escapeHtml(section.labelKey) + '"></h3>';
		if (contextLabel) {
			html += '<span class="progressionSectionContext">' + labels.escapeHtml(contextLabel) + '</span>';
		}
		if (section.id === 'B' && section.circleOfFifths && options.showCircleOfFifths !== false) {
			html += '<button class="progressionSectionCircleButton" type="button" title="" aria-label="" aria-controls="circleOfFifthsPopover" aria-expanded="false" data-section-circle="B" data-i18n-title="circle.open"><span class="material-icons" aria-hidden="true">donut_large</span></button>';
		}
		if (section.id === 'B') {
			html += '<button id="generateProgressionSectionB" class="progressionSectionRandomButton" type="button" title="" aria-label="" data-i18n-title="progression.generateSectionB"><span class="material-icons" aria-hidden="true">casino</span></button>';
		}
		html += '</div>';

		return html;
	}

	function sectionContextLabel(section, options) {
		var tonicName = section.contextTonicName || '';
		var scaleName = section.contextScaleName || '';

		if (section.contextScaleIndex != null && options.i18n && typeof options.i18n.t === 'function') {
			scaleName = options.i18n.t('data.scales.' + section.contextScaleIndex);
		}

		if (tonicName && options.notation && typeof options.notation.formatNoteName === 'function') {
			tonicName = options.notation.formatNoteName(tonicName, options.notationStyle);
		}

		if (tonicName || scaleName) {
			return [tonicName, scaleName].filter(Boolean).join(' ');
		}

		return section.contextLabel || '';
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
		var notes = notesLabel(chord, options || {});
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
			(notes ? '<span class="measureNotes">' + labels.escapeHtml(notes) + '</span>' : '') +
			(tonalFunction ? '<span class="measureFunction">' + labels.escapeHtml(tonalFunction) + '</span>' : '') +
			(source ? '<span class="measureSource">' + labels.escapeHtml(source) + '</span>' : '') +
			'</div>';
	}

	function notesLabel(chord, options) {
		var notes = uniqueNotes(chord.notes || notesFromVoices(chord.voiceNotes));
		var formatted = [];

		if (!notes.length) {
			return '';
		}

		for (var i = 0; i < notes.length; i++) {
			if (options.notation && typeof options.notation.formatNoteName === 'function') {
				formatted.push(options.notation.formatNoteName(notes[i], options.notationStyle));
			} else {
				formatted.push(notes[i]);
			}
		}

		return formatted.join(' - ');
	}

	function notesFromVoices(voiceNotes) {
		var notes = [];

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			notes.push(voiceNotes[i].note);
		}

		return notes;
	}

	function uniqueNotes(notes) {
		var result = [];
		var seen = {};

		for (var i = 0; i < (notes || []).length; i++) {
			var note = notes[i];

			if (note && !seen[note]) {
				seen[note] = true;
				result.push(note);
			}
		}

		return result;
	}

	function sourceLabel(chord, options) {
		var scaleIndex = chord.sourceScaleIndex;
		var scaleName = scaleIndex != null && options.i18n && typeof options.i18n.t === 'function' ? options.i18n.t('data.scales.' + scaleIndex) : '';
		var tonicName = chord.sourceTonicName || '';

		if (chord.source === 'chromatic') {
			return chord.sourceLabelKey && options.i18n && typeof options.i18n.t === 'function' ? options.i18n.t(chord.sourceLabelKey) : '';
		}

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
		renderSectionHeader: renderSectionHeader,
		notesLabel: notesLabel,
		sectionContextLabel: sectionContextLabel,
		sourceLabel: sourceLabel,
		renderTimeline: renderTimeline,
		renderTimelineMeasures: renderTimelineMeasures,
		timelineSections: timelineSections
	};
})(window);
