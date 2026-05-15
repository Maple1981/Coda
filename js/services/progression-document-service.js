// Canonical helpers for editable progression documents.
(function (global) {
	'use strict';

	var documentVersion = 1;

	function normalize(progression, options) {
		var next;

		if (!progression) {
			return progression;
		}

		options = options || {};
		next = cloneJson(progression);
		next.documentVersion = Number(next.documentVersion) || documentVersion;

		if (options.ensureSections) {
			next.sections = normalizeSections(next.sections, next.measures);
		}

		if (next.sections && next.sections.length) {
			annotateSectionMeasures(next.measures || [], next.sections);
		}

		return next;
	}

	function markUserEdited(progression) {
		if (!progression) {
			return progression;
		}

		return extendObject(progression, {
			documentVersion: Number(progression.documentVersion) || documentVersion,
			userEdited: true
		});
	}

	function isUserEdited(progression) {
		return !!(progression && progression.userEdited === true);
	}

	function normalizeSections(sections, measures) {
		var normalized = [];
		var fallbackLength = measures && measures.length ? measures.length : 0;

		for (var i = 0; i < (sections || []).length; i++) {
			var section = sections[i] || {};
			var startIndex = normalizeNonNegative(section.startIndex);
			var length = normalizeNonNegative(section.length);

			if (!section.id || !length) {
				continue;
			}

			normalized.push(extendObject(section, {
				labelKey: section.labelKey || ('progression.section' + section.id),
				length: length,
				startIndex: startIndex
			}));
		}

		if (!normalized.length && fallbackLength) {
			normalized.push({
				id: 'A',
				labelKey: 'progression.sectionA',
				length: fallbackLength,
				startIndex: 0
			});
		}

		return normalized;
	}

	function annotateSectionMeasures(measures, sections) {
		for (var i = 0; i < (sections || []).length; i++) {
			var section = sections[i];

			for (var j = section.startIndex; j < section.startIndex + section.length && j < measures.length; j++) {
				measures[j].sectionId = section.id;
				measures[j].sectionLabelKey = section.labelKey;
			}
		}
	}

	function cloneJson(value) {
		return value == null ? null : JSON.parse(JSON.stringify(value));
	}

	function extendObject(target, values) {
		var result = {};
		var key;

		for (key in target || {}) {
			if (Object.prototype.hasOwnProperty.call(target, key)) {
				result[key] = target[key];
			}
		}

		for (key in values || {}) {
			if (Object.prototype.hasOwnProperty.call(values, key)) {
				result[key] = values[key];
			}
		}

		return result;
	}

	function normalizeNonNegative(value) {
		var numericValue = parseInt(value, 10);

		return isFinite(numericValue) && numericValue > 0 ? numericValue : 0;
	}

	global.CodaProgressionDocument = {
		annotateSectionMeasures: annotateSectionMeasures,
		isUserEdited: isUserEdited,
		markUserEdited: markUserEdited,
		normalize: normalize,
		normalizeSections: normalizeSections,
		version: documentVersion
	};
})(window);
