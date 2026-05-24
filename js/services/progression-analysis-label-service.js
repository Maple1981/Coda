// Derives visible analysis labels from the final progression document.
(function (global) {
	'use strict';

	var harmonicAnalysis = global.CodaProgressionHarmonicAnalysis;

	function sourceLabel(chord, options) {
		var descriptor = sourceLabelDescriptor(chord, options || {});

		return descriptor.visible ? descriptor.text : '';
	}

	function sourceLabelDescriptor(chord, options) {
		var source = harmonicAnalysis.sourceForChord(chord, options || {});

		if (!source) {
			return emptyDescriptor();
		}

		if (source.type === 'modulation') {
			if (source.kind === 'pivot' || source.labelKey === 'progression.modulation.pivot') {
				return descriptor('modulation', pivotSourceLabel(source, options), source);
			}

			return descriptor('modulation', translate(options, source.labelKey), source);
		}

		if (source.type === 'chromatic') {
			return descriptor('chromatic', source.labelKey ? translate(options, source.labelKey) : '', source);
		}

		if (source.type === 'interchange') {
			return descriptor('interchange', interchangeSourceLabel(source, options), source);
		}

		return emptyDescriptor();
	}

	function descriptor(type, text, source) {
		return {
			source: source || null,
			text: text || '',
			type: type || '',
			visible: !!text
		};
	}

	function emptyDescriptor() {
		return descriptor('', '', null);
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
		sourceLabelDescriptor: sourceLabelDescriptor,
		sourceLabel: sourceLabel
	};
})(window);
