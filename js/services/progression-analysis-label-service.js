// Derives visible analysis labels from the final progression document.
(function (global) {
	'use strict';

	var harmonicAnalysis = global.CodaProgressionHarmonicAnalysis;

	function sourceLabel(chord, options) {
		var source = harmonicAnalysis.sourceForChord(chord, options || {});

		if (!source) {
			return '';
		}

		if (source.type === 'modulation') {
			if (source.kind === 'pivot' || source.labelKey === 'progression.modulation.pivot') {
				return pivotSourceLabel(source, options);
			}

			return translate(options, source.labelKey);
		}

		if (source.type === 'chromatic') {
			return source.labelKey ? translate(options, source.labelKey) : '';
		}

		if (source.type === 'interchange') {
			return interchangeSourceLabel(source, options);
		}

		return '';
	}

	function pivotSourceLabel(source, options) {
		var baseLabel = capitalizeFirst(translate(options, source.labelKey || 'progression.modulation.pivot'));
		var targetDegree = source.targetDegree || '';
		var targetContext = modulationTargetContextLabel(source, options);
		var inLabel = translate(options, 'progression.modulation.inKey');

		if (targetDegree && targetContext) {
			return baseLabel + ': ' + targetDegree + ' ' + inLabel + ' ' + targetContext;
		}

		return baseLabel;
	}

	function modulationTargetContextLabel(source, options) {
		var targetContext = source.targetContext || {};
		var tonicName = targetContext.tonicName || '';
		var scaleName = targetContext.scaleName || '';
		var scaleIndex = targetContext.scaleIndex;

		if (scaleIndex != null) {
			scaleName = translate(options, 'data.scales.' + scaleIndex);
		}

		if (tonicName && options.notation && typeof options.notation.formatNoteName === 'function') {
			tonicName = options.notation.formatNoteName(tonicName, options.notationStyle);
		}

		return [tonicName, scaleName].filter(Boolean).join(' ');
	}

	function interchangeSourceLabel(source, options) {
		var scaleName = source.scaleIndex != null ? translate(options, 'data.scales.' + source.scaleIndex) : '';
		var tonicName = source.tonicName || '';

		if (!scaleName) {
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

	function capitalizeFirst(value) {
		value = String(value || '');

		return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
	}

	global.CodaProgressionAnalysisLabels = {
		modulationTargetContextLabel: modulationTargetContextLabel,
		pivotSourceLabel: pivotSourceLabel,
		sourceLabel: sourceLabel
	};
})(window);
