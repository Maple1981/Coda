// Shared helpers for section metadata and measure slicing.
(function (global) {
	'use strict';

	var cloneService = global.CodaProgressionMeasureClone;

	function measuresForSectionA(progression, progressionState) {
		return measuresForSection(progression, 'A', progressionState);
	}

	function measuresForSection(progression, id, progressionState) {
		var measures = progression && progression.measures ? progression.measures : [];
		var section = findSection(progression, id);
		var length = section ? section.length : Number(progressionState && progressionState.bars) || measures.length;
		var startIndex = section ? section.startIndex : 0;

		return measures.slice(startIndex, startIndex + Math.min(length, measures.length));
	}

	function measuresForLastSection(progression, progressionState) {
		var sections = progression && progression.sections ? progression.sections : [];

		if (sections.length) {
			return measuresForSection(progression, sections[sections.length - 1].id, progressionState);
		}

		return measuresForSectionA(progression, progressionState);
	}

	function appendSection(progression, sectionMeasures, sectionMetadata, dependencies) {
		var previousSections = normalizedSections(progression);
		var combined = cloneMeasures(progression && progression.measures ? progression.measures : []).concat(cloneMeasures(sectionMeasures || []));
		var rebuilt = dependencies.rebuildProgressionTimeline(progression, combined);
		var startIndex = combined.length - (sectionMeasures ? sectionMeasures.length : 0);

		rebuilt.sections = previousSections.concat([extendObject(sectionMetadata, {
			length: sectionMeasures ? sectionMeasures.length : 0,
			startIndex: startIndex
		})]);
		annotateSectionMeasures(rebuilt.measures, rebuilt.sections);

		return rebuilt;
	}

	function normalizedSections(progression) {
		var sections = progression && progression.sections ? progression.sections : [];
		var result = [];

		if (!sections.length && progression && progression.measures && progression.measures.length) {
			return [{
				id: 'A',
				labelKey: 'progression.sectionA',
				length: progression.measures.length,
				startIndex: 0
			}];
		}

		for (var i = 0; i < sections.length; i++) {
			result.push(cloneSection(sections[i]));
		}

		return result;
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

	function findSection(progression, id) {
		var sections = progression && progression.sections ? progression.sections : [];

		for (var i = 0; i < sections.length; i++) {
			if (sections[i].id === id) {
				return sections[i];
			}
		}

		return null;
	}

	function sectionLabelKey(sectionId) {
		if (sectionId === 'A\'') {
			return 'progression.sectionAprime';
		}

		if (sectionId === 'B') {
			return 'progression.sectionB';
		}

		if (sectionId === 'B\'') {
			return 'progression.sectionBprime';
		}

		if (sectionId === 'C') {
			return 'progression.sectionC';
		}

		return 'progression.sectionA';
	}

	function sectionStateForSource(section, progressionState, sourceMeasures) {
		var state = cloneObject(section && section.state ? section.state : progressionState);

		state.bars = sourceMeasures.length || state.bars || (progressionState && progressionState.bars) || 8;

		return state;
	}

	function sectionMetadataFromReport(report) {
		return {
			circleOfFifths: report && report.circleOfFifths ? report.circleOfFifths : null,
			contextLabel: contextLabelFromReport(report),
			contextScaleIndex: report ? report.scaleIndex : null,
			contextScaleName: report ? report.scaleName : '',
			contextTonicName: report ? report.tonicName : ''
		};
	}

	function contextLabelFromReport(report) {
		return report && report.tonicName && report.scaleName ? report.tonicName + ' ' + report.scaleName : '';
	}

	function cloneMeasures(measures) {
		var result = [];

		for (var i = 0; i < (measures || []).length; i++) {
			result.push(cloneService.cloneMeasure(measures[i]));
		}

		return result;
	}

	function cloneSection(section) {
		var result = {};

		for (var key in section || {}) {
			if (Object.prototype.hasOwnProperty.call(section, key)) {
				result[key] = key === 'state' ? cloneObject(section[key]) : section[key];
			}
		}

		return result;
	}

	function cloneObject(value) {
		var result = {};

		for (var key in value || {}) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				result[key] = value[key];
			}
		}

		return result;
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

	global.CodaProgressionSectionDocument = {
		annotateSectionMeasures: annotateSectionMeasures,
		appendSection: appendSection,
		cloneMeasures: cloneMeasures,
		contextLabelFromReport: contextLabelFromReport,
		findSection: findSection,
		measuresForLastSection: measuresForLastSection,
		measuresForSection: measuresForSection,
		measuresForSectionA: measuresForSectionA,
		normalizedSections: normalizedSections,
		sectionLabelKey: sectionLabelKey,
		sectionMetadataFromReport: sectionMetadataFromReport,
		sectionStateForSource: sectionStateForSource
	};
})(window);
