// Derives visible analysis labels from the final progression document.
(function (global) {
	'use strict';

	function sourceLabel(chord, options) {
		var scaleIndex = chord && chord.sourceScaleIndex;
		var scaleName = scaleIndex != null ? translate(options, 'data.scales.' + scaleIndex) : '';
		var tonicName = chord && chord.sourceTonicName ? chord.sourceTonicName : '';

		if (!chord) {
			return '';
		}

		if (chord.modulationSourceLabelKey) {
			if (!isValidModulationSource(chord, options)) {
				return '';
			}

			if (chord.modulationKind === 'pivot' || chord.modulationSourceLabelKey === 'progression.modulation.pivot') {
				return pivotSourceLabel(chord, options);
			}

			return translate(options, chord.modulationSourceLabelKey);
		}

		if (chord.source === 'chromatic') {
			if (isTransitionLabelKey(chord.sourceLabelKey) && !isValidModulationSource(chord, options)) {
				return '';
			}

			return chord.sourceLabelKey ? translate(options, chord.sourceLabelKey) : '';
		}

		if (chord.source !== 'interchange' || !scaleName) {
			return '';
		}

		if (tonicName && options.notation && typeof options.notation.formatNoteName === 'function') {
			tonicName = options.notation.formatNoteName(tonicName, options.notationStyle);
		}

		return tonicName ? tonicName + ' ' + scaleName : scaleName;
	}

	function pivotSourceLabel(chord, options) {
		var baseLabel = capitalizeFirst(translate(options, chord.modulationSourceLabelKey || 'progression.modulation.pivot'));
		var targetDegree = chord.pivotTargetDegree || '';
		var targetContext = modulationTargetContextLabel(chord, options);
		var inLabel = translate(options, 'progression.modulation.inKey');

		if (targetDegree && targetContext) {
			return baseLabel + ': ' + targetDegree + ' ' + inLabel + ' ' + targetContext;
		}

		return baseLabel;
	}

	function modulationTargetContextLabel(chord, options) {
		var tonicName = chord.pivotTargetTonicName || chord.targetTonicName || '';
		var scaleName = chord.pivotTargetScaleName || '';
		var scaleIndex = chord.pivotTargetScaleIndex != null ? chord.pivotTargetScaleIndex : chord.targetScaleIndex;

		if (scaleIndex != null) {
			scaleName = translate(options, 'data.scales.' + scaleIndex);
		}

		if (tonicName && options.notation && typeof options.notation.formatNoteName === 'function') {
			tonicName = options.notation.formatNoteName(tonicName, options.notationStyle);
		}

		return [tonicName, scaleName].filter(Boolean).join(' ');
	}

	function isValidModulationSource(chord, options) {
		var sections = options && options.sections ? options.sections : [];
		var section = sectionForId(sections, chord.sectionId);
		var kind = chord.modulationKind || modulationKindFromLabel(chord.modulationSourceLabelKey || chord.sourceLabelKey);

		if (!section || !kind) {
			return false;
		}

		if (section.contrast && section.modulation && section.modulation.kind === kind && section.modulation.targetSectionId === section.id) {
			return true;
		}

		return !!sectionWithModulationFrom(sections, section.id, kind);
	}

	function isTransitionLabelKey(labelKey) {
		return labelKey === 'progression.modulation.pivot' ||
			labelKey === 'progression.modulation.secondaryDominant';
	}

	function modulationKindFromLabel(labelKey) {
		if (labelKey === 'progression.modulation.pivot') {
			return 'pivot';
		}

		if (labelKey === 'progression.modulation.secondaryDominant') {
			return 'secondaryDominant';
		}

		return '';
	}

	function sectionForId(sections, sectionId) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (sections[i].id === sectionId) {
				return sections[i];
			}
		}

		return null;
	}

	function sectionWithModulationFrom(sections, sectionId, kind) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (
				sections[i].contrast &&
				sections[i].modulation &&
				sections[i].modulation.kind === kind &&
				sections[i].modulation.originSectionId === sectionId &&
				sections[i].modulation.targetSectionId === sections[i].id
			) {
				return sections[i];
			}
		}

		return null;
	}

	function translate(options, key) {
		return options && options.i18n && typeof options.i18n.t === 'function' ? options.i18n.t(key) : key;
	}

	function capitalizeFirst(value) {
		value = String(value || '');

		return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
	}

	global.CodaProgressionAnalysisLabels = {
		isValidModulationSource: isValidModulationSource,
		modulationTargetContextLabel: modulationTargetContextLabel,
		pivotSourceLabel: pivotSourceLabel,
		sourceLabel: sourceLabel
	};
})(window);
