// Shared helpers for section metadata and measure slicing.
(function (global) {
	'use strict';

	var cloneService = global.CodaProgressionMeasureClone;
	var objectService = global.CodaProgressionObjects;

	function measuresForSectionA(progression, progressionState) {
		return measuresForSection(progression, 'A', progressionState);
	}

	function measuresForSection(progression, id, progressionState) {
		var measures = progression && progression.measures ? progression.measures : [];
		var section = findSection(progression, id);
		var range = section ? sectionRange(section, measures.length) : {
			end: Math.min(Number(progressionState && progressionState.bars) || measures.length, measures.length),
			start: 0
		};

		return measures.slice(range.start, range.end);
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

			var range = sectionRange(section, measures.length);

			for (var j = range.start; j < range.end; j++) {
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

	function previousSection(progression, id) {
		var sections = progression && progression.sections ? progression.sections : [];
		var index = sectionIndex(sections, id);

		return index > 0 ? sections[index - 1] : null;
	}

	function nextSection(progression, id) {
		var sections = progression && progression.sections ? progression.sections : [];
		var index = sectionIndex(sections, id);

		return index >= 0 && index < sections.length - 1 ? sections[index + 1] : null;
	}

	function sectionIndex(sections, id) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (sections[i].id === id) {
				return i;
			}
		}

		return -1;
	}

	function sectionEndIndex(section) {
		return (Number(section && section.startIndex) || 0) + (Number(section && section.length) || 0);
	}

	function sectionRange(section, measureCount) {
		var start = Math.max(0, Number(section && section.startIndex) || 0);
		var end = sectionEndIndex(section);

		if (measureCount != null) {
			end = Math.min(end, Math.max(0, Number(measureCount) || 0));
		}

		return {
			end: Math.max(start, end),
			length: Math.max(0, end - start),
			start: start
		};
	}

	function sectionTransitionFromOrigin(sections, originSectionId, kind) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (
				sections[i].contrast &&
				sections[i].modulation &&
				(!kind || sections[i].modulation.kind === kind) &&
				sections[i].modulation.originSectionId === originSectionId &&
				sections[i].modulation.targetSectionId === sections[i].id
			) {
				return sections[i];
			}
		}

		return null;
	}

	function sectionTransitionForTarget(sections, targetSectionId, kind) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (
				sections[i].contrast &&
				sections[i].modulation &&
				(!kind || sections[i].modulation.kind === kind) &&
				sections[i].modulation.targetSectionId === targetSectionId
			) {
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
		return objectService.cloneObject(value);
	}

	function extendObject(target, values) {
		return objectService.extendObject(target, values);
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
		nextSection: nextSection,
		normalizedSections: normalizedSections,
		previousSection: previousSection,
		sectionEndIndex: sectionEndIndex,
		sectionLabelKey: sectionLabelKey,
		sectionMetadataFromReport: sectionMetadataFromReport,
		sectionRange: sectionRange,
		sectionTransitionForTarget: sectionTransitionForTarget,
		sectionTransitionFromOrigin: sectionTransitionFromOrigin,
		sectionStateForSource: sectionStateForSource
	};
})(window);
