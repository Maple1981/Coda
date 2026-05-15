// Renderer for the selected progression chord inspector.
(function (global) {
	'use strict';

	var labels = global.CodaRenderers.progressionLabels;
	var timeline = global.CodaRenderers.progressionTimeline;

	function renderShell() {
		return '<aside class="progressionInspector" aria-live="polite">' +
			'<div class="progressionInspector__inner">' +
			'<div class="progressionInspector__header">' +
			'<span class="material-icons" aria-hidden="true">analytics</span>' +
			'<div><h3 data-i18n="progression.inspector.title"></h3><p data-i18n="progression.inspector.empty"></p></div>' +
			'</div>' +
			'</div>' +
			'</aside>';
	}

	function render(selection, options) {
		var chord = selection && selection.chord ? selection.chord : null;
		var measure = selection && selection.measure ? selection.measure : {};
		var chordCount = selection && selection.chordCount ? selection.chordCount : 1;
		var chordIndex = selection && selection.chordIndex ? selection.chordIndex : 0;
		var label = chordLabel(chord, options);
		var html = '<div class="progressionInspector__inner">';
		var fields;

		if (!chord) {
			html += '<div class="progressionInspector__header">' +
				'<span class="material-icons" aria-hidden="true">analytics</span>' +
				'<div><h3>' + translate(options, 'progression.inspector.title') + '</h3><p>' + translate(options, 'progression.inspector.empty') + '</p></div>' +
				'</div></div>';
			return html;
		}

		fields = inspectorFields(chord, measure, selection, options);
		html += '<div class="progressionInspector__header">' +
			'<span class="material-icons" aria-hidden="true">analytics</span>' +
			'<div><h3>' + labels.formatMusicalLabel(label) + '</h3><p>' + translate(options, 'progression.inspector.bar') + ' ' + labels.escapeHtml(measure.bar || selection.measureIndex + 1) + '</p></div>' +
			'</div>';
		html += '<dl class="progressionInspector__grid">';
		for (var i = 0; i < fields.length; i++) {
			html += '<dt>' + labels.escapeHtml(fields[i].label) + '</dt><dd>' + fields[i].value + '</dd>';
		}
		html += '</dl>';
		html += renderQuickEditor(chord, options);
		html += renderActions(chord, chordCount, chordIndex, options);
		html += '</div>';

		return html;
	}

	function inspectorFields(chord, measure, selection, options) {
		var fields = [];
		var notes = timeline.notesLabel(chord, options || {});
		var source = timeline.sourceLabel(chord, options || {}) || defaultSourceLabel(chord, options);

		addField(fields, translate(options, 'progression.inspector.degree'), chord.degree ? labels.formatMusicalLabel(chord.degree) : '');
		addField(fields, translate(options, 'progression.inspector.function'), chord.tonalFunction);
		addField(fields, translate(options, 'progression.inspector.inversion'), chord.inversion ? labels.formatMusicalLabel(chord.inversion) : rootPositionLabel(options));
		addField(fields, translate(options, 'progression.inspector.source'), source);
		addField(fields, translate(options, 'progression.inspector.notes'), notes);
		addField(fields, translate(options, 'progression.inspector.section'), measure.sectionId || '');
		addField(fields, translate(options, 'progression.inspector.duration'), durationLabel(chord, options));
		addField(fields, translate(options, 'progression.inspector.voices'), voiceLabel(chord, options));

		return fields;
	}

	function addField(fields, label, value) {
		if (!value && value !== 0) {
			return;
		}

		fields.push({
			label: label,
			value: String(value).indexOf('<') > -1 ? value : labels.escapeHtml(value)
		});
	}

	function renderQuickEditor(chord, options) {
		var html = '';

		if (!canReplaceChord(chord)) {
			return '';
		}

		html += '<div class="progressionInspector__editor">';
		html += renderKindGroup(chord, 'triad', ['', '6', '6/4'], options);
		html += renderKindGroup(chord, 'seventh', ['', '6/5', '4/3', '4/2'], options);
		html += '</div>';

		return html;
	}

	function renderKindGroup(chord, kind, inversions, options) {
		var html = '<div class="progressionInspector__buttonGroup">';
		var titleKey = kind === 'seventh' ? 'progression.chordMenu.seventh' : 'progression.chordMenu.triad';

		html += '<span>' + translate(options, titleKey) + '</span>';
		for (var i = 0; i < inversions.length; i++) {
			html += renderReplaceButton(chord, kind, i, inversions[i], options);
		}
		html += '</div>';

		return html;
	}

	function renderReplaceButton(chord, kind, inversionIndex, inversionLabel, options) {
		var active = isActiveVariant(chord, kind, inversionIndex);
		var label = inversionLabel || translate(options, 'progression.inspector.rootPositionShort');

		return '<button type="button" class="progressionInspectorVariant' + (active ? ' isActive' : '') + '" data-inspector-action="replace" data-chord-kind="' + labels.escapeHtml(kind) + '" data-inversion-index="' + labels.escapeHtml(inversionIndex) + '" aria-pressed="' + (active ? 'true' : 'false') + '">' + labels.formatMusicalLabel(label) + '</button>';
	}

	function renderActions(chord, chordCount, chordIndex, options) {
		var html = '<div class="progressionInspector__actions">';

		html += '<button type="button" class="progressionInspectorAction" data-inspector-action="change"><span class="material-icons" aria-hidden="true">tune</span><span>' + translate(options, 'progression.inspector.moreChords') + '</span></button>';
		if (canReplaceChord(chord)) {
			html += '<button type="button" class="progressionInspectorAction" data-inspector-action="silence"><span class="material-icons" aria-hidden="true">volume_off</span><span>' + translate(options, 'progression.chordMenu.silence') + '</span></button>';
		}
		if (chordCount === 1 || (chordIndex > 0 && chordCount < 4)) {
			html += '<button type="button" class="progressionInspectorAction" data-inspector-action="add"><span class="material-icons" aria-hidden="true">add</span><span>' + translate(options, 'progression.inspector.add') + '</span></button>';
		}
		if (chordCount > 1 && chordIndex > 0) {
			html += '<button type="button" class="progressionInspectorAction progressionInspectorAction--danger" data-inspector-action="remove"><span class="material-icons" aria-hidden="true">remove</span><span>' + translate(options, 'progression.inspector.remove') + '</span></button>';
		}
		html += '</div>';

		return html;
	}

	function canReplaceChord(chord) {
		return !!(chord && !chord.isSilence && chord.degreeIndex != null && chord.source !== 'chromatic');
	}

	function isActiveVariant(chord, kind, inversionIndex) {
		var chordKind = chord && chord.kind ? chord.kind : (chord && chord.chordName && chord.chordName.indexOf('7') > -1 ? 'seventh' : 'triad');
		var chordInversionIndex = Number(chord && chord.inversionIndex);

		return chordKind === kind && chordInversionIndex === inversionIndex;
	}

	function chordLabel(chord, options) {
		if (!chord) {
			return '';
		}

		if (chord.isSilence) {
			return translate(options, 'progression.chordMenu.silence');
		}

		return chord.displayName || chord.chordName || chord.label || '';
	}

	function defaultSourceLabel(chord, options) {
		if (chord && chord.source === 'chromatic') {
			return translate(options, 'progression.inspector.chromatic');
		}

		return translate(options, 'progression.inspector.diatonic');
	}

	function rootPositionLabel(options) {
		return translate(options, 'progression.inspector.rootPosition');
	}

	function durationLabel(chord, options) {
		var duration = Number(chord.durationBeats);

		if (!isFinite(duration) || duration <= 0) {
			return '';
		}

		return duration + ' ' + translate(options, duration === 1 ? 'progression.inspector.beat' : 'progression.inspector.beats');
	}

	function voiceLabel(chord, options) {
		var voices = chord.voiceNotes || [];

		if (!voices.length) {
			return '';
		}

		return voices.length + ' ' + translate(options, voices.length === 1 ? 'progression.inspector.voice' : 'progression.inspector.voices');
	}

	function translate(options, key) {
		return options && options.i18n && typeof options.i18n.t === 'function' ? options.i18n.t(key) : key;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionInspector = {
		chordLabel: chordLabel,
		canReplaceChord: canReplaceChord,
		inspectorFields: inspectorFields,
		render: render,
		renderShell: renderShell
	};
})(window);
