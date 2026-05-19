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
		var html = renderSectionNavigator(sections, options);

		for (var i = 0; i < sections.length; i++) {
			html += renderSectionHeader(sections[i], options);
			for (var j = sections[i].startIndex; j < sections[i].startIndex + sections[i].length && j < measures.length; j++) {
				html += renderMeasure(measures[j], j, options);
			}
		}

		if (nextSectionOptions(sections).length) {
			html += renderNextSectionHeader(sections);
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
		var html = '<div id="' + labels.escapeHtml(sectionAnchorId(section.id)) + '" class="progressionSectionHeader" data-progression-section="' + labels.escapeHtml(section.id) + '">';
		var contextLabel = sectionContextLabel(section, options || {});

		html += '<h3 data-i18n="' + labels.escapeHtml(section.labelKey) + '"></h3>';
		if (contextLabel) {
			html += '<span class="progressionSectionContext">' + labels.escapeHtml(contextLabel) + '</span>';
		}
		if (section.circleOfFifths && options.showCircleOfFifths !== false) {
			html += '<button class="progressionSectionCircleButton" type="button" title="" aria-label="" aria-controls="circleOfFifthsPopover" aria-expanded="false" data-section-circle="' + labels.escapeHtml(section.id) + '" data-i18n-title="circle.open"><span class="material-icons" aria-hidden="true">donut_large</span></button>';
		}
		if (section.id !== 'A') {
			html += '<button class="progressionSectionDeleteButton" type="button" title="" aria-label="" data-section-delete="' + labels.escapeHtml(section.id) + '" data-i18n-title="progression.deleteSection"><span class="material-icons" aria-hidden="true">delete_outline</span></button>';
		}
		html += '</div>';

		return html;
	}

	function renderNextSectionHeader(sections) {
		var options = nextSectionOptions(sections);
		var html = '<div class="progressionSectionHeader progressionSectionHeader--next">';

		html += '<h3 data-i18n="progression.nextSection"></h3>';
		html += '<select id="progressionNextSectionType" class="progressionSectionTypeSelect" aria-label="" data-i18n-title="progression.nextSectionType">';
		for (var i = 0; i < options.length; i++) {
			html += '<option value="' + labels.escapeHtml(options[i].value) + '" data-i18n="' + labels.escapeHtml(options[i].labelKey) + '"></option>';
		}
		html += '</select>';
		html += '<button id="generateProgressionNextSection" type="button" class="transportButton transportButton--generate progressionSectionGenerateButton" title="" aria-label="" data-i18n-title="progression.generateNextSection"><span class="material-icons" aria-hidden="true">auto_awesome</span><span data-i18n="progression.generateNextSection"></span></button>';
		html += '</div>';

		return html;
	}

	function renderSectionNavigator(sections, options) {
		var html = '<nav class="progressionSectionNavigator" aria-label="" data-i18n-label="progression.sectionNavigator">';
		var hasLinks = false;

		for (var i = 0; i < (sections || []).length; i++) {
			if (!sections[i].length) {
				continue;
			}
			hasLinks = true;
			html += '<a class="progressionSectionNavLink" href="#' + labels.escapeHtml(sectionAnchorId(sections[i].id)) + '">' +
				'<span data-i18n="' + labels.escapeHtml(sections[i].labelKey) + '"></span>' +
				'</a>';
		}

		html += '</nav>';

		return hasLinks ? html : '';
	}

	function nextSectionOptions(sections) {
		var hasAprime = hasSection(sections, 'A\'');
		var hasB = hasSection(sections, 'B');
		var hasBprime = hasSection(sections, 'B\'');
		var hasC = hasSection(sections, 'C');
		var options = [];

		if (!hasAprime && !hasB) {
			return [
				{ labelKey: 'progression.nextSection.aprimeClone', value: 'aprimeClone' },
				{ labelKey: 'progression.nextSection.aprimeVariation', value: 'aprimeVariation' },
				{ labelKey: 'progression.nextSection.contrastB', value: 'contrast' }
			];
		}

		if (hasB && !hasBprime) {
			options.push({ labelKey: 'progression.nextSection.bprimeClone', value: 'bprimeClone' });
			options.push({ labelKey: 'progression.nextSection.bprimeVariation', value: 'bprimeVariation' });
		}

		if (!hasC) {
			options.push({ labelKey: hasB ? 'progression.nextSection.contrastC' : 'progression.nextSection.contrastB', value: 'contrast' });
		}

		return options;
	}

	function sectionAnchorId(sectionId) {
		return 'progression-section-' + String(sectionId || 'A').replace(/'/g, 'prime').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
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
		var quickControls = renderQuickControls(chord, options || {});

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
			'<span class="measureChordName"><strong>' + labels.formatMusicalLabel(label) + '</strong><button type="button" class="measureChordMenuButton" data-measure-chord-menu="true" aria-haspopup="menu" aria-expanded="false" aria-label="" title="" data-i18n-title="progression.changeMeasureChord"><span class="material-icons" aria-hidden="true">more_vert</span></button>' + quickControls + '</span>' +
			(degree ? '<em class="measureDegree">' + labels.formatMusicalLabel(degree) + '</em>' : '') +
			(notes ? '<span class="measureNotes">' + labels.escapeHtml(notes) + '</span>' : '') +
			(tonalFunction ? '<span class="measureFunction">' + labels.escapeHtml(tonalFunction) + '</span>' : '') +
			(source ? '<span class="measureSource">' + labels.escapeHtml(source) + '</span>' : '') +
			'</div>';
	}

	function renderQuickControls(chord, options) {
		if (!canQuickEdit(chord)) {
			return '';
		}

		return '<span class="measureChordQuickWrap">' + renderQuickToggle(chord) + renderQuickEditor(chord, options || {}) + '</span>';
	}

	function renderQuickToggle(chord) {
		if (!canQuickEdit(chord)) {
			return '';
		}

		return '<button type="button" class="measureChordQuickToggle" data-measure-chord-quick-toggle="true" aria-haspopup="true" aria-expanded="false" aria-label="" title="" data-i18n-title="progression.quickEditChord"><span class="material-icons" aria-hidden="true">chevron_right</span></button>';
	}

	function renderQuickEditor(chord, options) {
		var html = '';
		var kind = quickKind(chord);
		var silenceOnly = isAugmentedSixthChord(chord);
		var inversions = kind === 'seventh' ? [
			{ index: 0, label: translate(options, 'progression.inspector.rootPositionShort') },
			{ index: 1, label: '6/5' },
			{ index: 2, label: '4/3' },
			{ index: 3, label: '4/2' }
		] : [
			{ index: 0, label: translate(options, 'progression.inspector.rootPositionShort') },
			{ index: 1, label: '6' },
			{ index: 2, label: '6/4' }
		];

		if (!canQuickEdit(chord)) {
			return '';
		}

		html += '<div class="measureChordQuickEditor">';
		if (!silenceOnly) {
			html += '<div class="measureChordQuickGroup">';
			html += renderKindButton(chord, 'triad', '3', options);
			html += renderKindButton(chord, 'seventh', '7', options);
			html += '</div>';
			html += '<div class="measureChordQuickGroup">';
			for (var i = 0; i < inversions.length; i++) {
				html += renderInversionButton(chord, inversions[i].index, inversions[i].label, options);
			}
			html += '</div>';
		}
		html += '<div class="measureChordQuickGroup">';
		html += '<button type="button" class="measureChordQuickButton measureChordQuickButton--silence' + (chord.isSilence ? ' isActive' : '') + '" data-inspector-action="silence" title="' + labels.escapeHtml(translate(options, 'progression.chordMenu.silence')) + '" aria-label="' + labels.escapeHtml(translate(options, 'progression.chordMenu.silence')) + '" aria-pressed="' + (chord.isSilence ? 'true' : 'false') + '"><span class="material-icons" aria-hidden="true">volume_off</span></button>';
		html += '</div>';
		html += '</div>';

		return html;
	}

	function renderKindButton(chord, kind, label, options) {
		var active = quickKind(chord) === kind && !chord.isSilence;
		var title = translate(options, kind === 'seventh' ? 'progression.chordMenu.seventh' : 'progression.chordMenu.triad');

		return '<button type="button" class="measureChordQuickButton' + (active ? ' isActive' : '') + '" data-inspector-action="quick-kind" data-chord-kind="' + labels.escapeHtml(kind) + '" title="' + labels.escapeHtml(title) + '" aria-label="' + labels.escapeHtml(title) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' + labels.formatMusicalLabel(label) + '</button>';
	}

	function renderInversionButton(chord, inversionIndex, label, options) {
		var active = quickInversionIndex(chord) === inversionIndex && !chord.isSilence;
		var title = translate(options, 'progression.inspector.inversion');

		return '<button type="button" class="measureChordQuickButton' + (active ? ' isActive' : '') + '" data-inspector-action="quick-inversion" data-inversion-index="' + labels.escapeHtml(inversionIndex) + '" title="' + labels.escapeHtml(title + ' ' + label) + '" aria-label="' + labels.escapeHtml(title + ' ' + label) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' + labels.formatMusicalLabel(label) + '</button>';
	}

	function canQuickEdit(chord) {
		return !!(chord && (
			(editableDegreeIndex(chord) != null && editableSource(chord) !== 'chromatic') ||
			isNeapolitanChord(chord) ||
			isAugmentedSixthChord(chord)
		));
	}

	function editableDegreeIndex(chord) {
		return chord && chord.isSilence ? chord.restorableDegreeIndex : chord.degreeIndex;
	}

	function editableSource(chord) {
		return chord && chord.isSilence ? (chord.restorableSource || 'diatonic') : (chord.source || 'diatonic');
	}

	function editableChromaticRole(chord) {
		return chord && chord.isSilence ? chord.restorableChromaticRole : chord.chromaticRole;
	}

	function isNeapolitanChord(chord) {
		return editableSource(chord) === 'chromatic' && editableChromaticRole(chord) === 'neapolitan';
	}

	function isAugmentedSixthChord(chord) {
		var role = editableChromaticRole(chord);

		return editableSource(chord) === 'chromatic' && /^(italian6|french43|german65|swiss65)$/.test(role || '');
	}

	function quickKind(chord) {
		if (chord && chord.isSilence && chord.restorableKind) {
			return chord.restorableKind;
		}

		return chord && (chord.chordKind || chord.kind) ? (chord.chordKind || chord.kind) : (chord && chord.chordName && chord.chordName.indexOf('7') > -1 ? 'seventh' : 'triad');
	}

	function quickInversionIndex(chord) {
		if (chord && chord.isSilence && chord.restorableInversionIndex != null) {
			return Number(chord.restorableInversionIndex) || 0;
		}

		return Number(chord && chord.inversionIndex) || 0;
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

	function translate(options, key) {
		return options && options.i18n && typeof options.i18n.t === 'function' ? options.i18n.t(key) : key;
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
		renderQuickControls: renderQuickControls,
		renderQuickEditor: renderQuickEditor,
		renderSectionHeader: renderSectionHeader,
		renderSectionNavigator: renderSectionNavigator,
		notesLabel: notesLabel,
		nextSectionOptions: nextSectionOptions,
		sectionContextLabel: sectionContextLabel,
		sourceLabel: sourceLabel,
		renderTimeline: renderTimeline,
		renderTimelineMeasures: renderTimelineMeasures,
		timelineSections: timelineSections
	};
})(window);
