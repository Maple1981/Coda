// Orchestrates derivative and contrasting progression sections.
(function (global) {
	'use strict';

	var sectionCandidates = global.CodaProgressionSectionCandidates;
	var sectionDocument = global.CodaProgressionSectionDocument;
	var sectionVariation = global.CodaProgressionSectionVariation;

	function generate(options, dependencies) {
		var progression = options.progression || {};
		var progressionState = cloneObject(options.progressionState || {});
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var sectionAMeasures = sectionDocument.measuresForSectionA(progression, progressionState);
		options.buildScaleReport = dependencies.buildScaleReport;
		var candidate = sectionCandidates.chooseContrastCandidate(options, rng);
		var targetReport = candidate.report || options.report;
		var sectionState = cloneObject(progressionState);
		var sectionB;
		var combined;
		var rebuilt;

		sectionState.bars = sectionAMeasures.length || progressionState.bars || 8;
		sectionB = dependencies.generateProgressionFromState({
			data: options.data,
			domain: options.domain,
			openingFunction: candidate.openingFunction,
			progressionState: sectionState,
			report: targetReport,
			rng: rng
		});

		combined = sectionDocument.cloneMeasures(sectionAMeasures).concat(sectionDocument.cloneMeasures(sectionB.measures || []));
		rebuilt = dependencies.rebuildProgressionTimeline(progression, combined);
		rebuilt.sections = [
			{
				id: 'A',
				labelKey: 'progression.sectionA',
				length: sectionAMeasures.length,
				startIndex: 0
			},
			sectionMetadata(candidate, targetReport, 'B', sectionAMeasures.length, sectionB.measures ? sectionB.measures.length : 0, sectionState)
		];
		sectionDocument.annotateSectionMeasures(rebuilt.measures, rebuilt.sections);
		rebuilt.sectionContrast = candidate.id;

		return rebuilt;
	}

	function generateSection(options, dependencies) {
		var sectionType;

		options = options || {};
		sectionType = normalizedSectionType(options.sectionType);
		options.buildScaleReport = dependencies.buildScaleReport;

		if (sectionType === 'aprimeClone') {
			return generateDerivativeSection(options, dependencies, 'A', 'A\'', false);
		}

		if (sectionType === 'aprimeVariation') {
			return generateDerivativeSection(options, dependencies, 'A', 'A\'', true);
		}

		if (sectionType === 'bprimeClone') {
			return generateDerivativeSection(options, dependencies, 'B', 'B\'', false);
		}

		if (sectionType === 'bprimeVariation') {
			return generateDerivativeSection(options, dependencies, 'B', 'B\'', true);
		}

		if (sectionType === 'contrast') {
			return generateContrastSection(options, dependencies, sectionDocument.findSection(options.progression, 'B') ? 'C' : 'B');
		}

		return generateContrastSection(options, dependencies, 'B');
	}

	function generateAprimeSection(options, dependencies) {
		return generateDerivativeSection(options, dependencies, 'A', 'A\'', true);
	}

	function generateCSection(options, dependencies) {
		return generateContrastSection(options, dependencies, 'C');
	}

	function generateContrastSection(options, dependencies, targetId) {
		var progression = options.progression || {};
		var progressionState = cloneObject(options.progressionState || {});
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var referenceMeasures = targetId === 'B' ?
			sectionDocument.measuresForSection(progression, 'A', progressionState) :
			sectionDocument.measuresForLastSection(progression, progressionState);
		var sectionState = cloneObject(progressionState);
		var candidate;
		var targetReport;
		var sectionProgression;

		if (sectionDocument.findSection(progression, targetId)) {
			return progression;
		}

		options.buildScaleReport = dependencies.buildScaleReport;
		sectionState.bars = referenceMeasures.length || progressionState.bars || 8;
		candidate = sectionCandidates.chooseContrastCandidateExcluding(options, rng, sectionCandidates.existingSectionContexts(progression, options.report));
		targetReport = candidate.report || options.report;
		sectionProgression = dependencies.generateProgressionFromState({
			data: options.data,
			domain: options.domain,
			openingFunction: candidate.openingFunction,
			progressionState: sectionState,
			report: targetReport,
			rng: rng
		});

		return sectionDocument.appendSection(progression, sectionProgression.measures || [], sectionMetadata(candidate, targetReport, targetId, 0, 0, sectionState), dependencies);
	}

	function generateDerivativeSection(options, dependencies, sourceId, targetId, shouldVary) {
		var progression = options.progression || {};
		var progressionState = cloneObject(options.progressionState || {});
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var sourceSection = sectionDocument.findSection(progression, sourceId);
		var sourceMeasures = sectionDocument.measuresForSection(progression, sourceId, progressionState);
		var sourceReport = sectionCandidates.reportForSection(sourceSection, options) || options.report;
		var sectionState = sectionDocument.sectionStateForSource(sourceSection, progressionState, sourceMeasures);
		var sectionMeasures = sectionDocument.cloneMeasures(sourceMeasures);
		var generated;

		if (sectionDocument.findSection(progression, targetId) || !sourceMeasures.length) {
			return progression;
		}

		if (shouldVary) {
			generated = dependencies.generateProgressionFromState({
				data: options.data,
				domain: options.domain,
				progressionState: sectionState,
				report: sourceReport,
				rng: rng
			});
			sectionMeasures = sectionVariation.createVariationMeasures(sourceMeasures, generated.measures || [], rng);
		}

		return sectionDocument.appendSection(progression, sectionMeasures, extendObject(sectionDocument.sectionMetadataFromReport(sourceReport), {
			id: targetId,
			labelKey: sectionDocument.sectionLabelKey(targetId),
			state: cloneObject(sectionState),
			variationKind: shouldVary ? 'small' : 'clone',
			variationOf: sourceId
		}), dependencies);
	}

	function sectionMetadata(candidate, report, id, startIndex, length, state) {
		return {
			circleOfFifths: report.circleOfFifths || null,
			contrast: candidate.id,
			contextLabel: candidate.label,
			contextScaleIndex: report.scaleIndex,
			contextScaleName: report.scaleName,
			contextTonicName: report.tonicName,
			id: id,
			labelKey: sectionDocument.sectionLabelKey(id),
			length: length,
			startIndex: startIndex,
			state: cloneObject(state)
		};
	}

	function normalizedSectionType(value) {
		if (value === 'ap' || value === 'A\'' || value === 'aprimeVariation') {
			return 'aprimeVariation';
		}

		if (value === 'aprimeClone') {
			return 'aprimeClone';
		}

		if (value === 'bprimeClone') {
			return 'bprimeClone';
		}

		if (value === 'bprimeVariation') {
			return 'bprimeVariation';
		}

		if (value === 'C' || value === 'c' || value === 'contrast') {
			return 'contrast';
		}

		return 'contrast';
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

	global.CodaProgressionSectionContrast = {
		annotateSectionMeasures: sectionDocument.annotateSectionMeasures,
		circleNeighborCandidates: sectionCandidates.circleNeighborCandidates,
		chooseContrastCandidate: sectionCandidates.chooseContrastCandidate,
		chooseContrastCandidateExcluding: sectionCandidates.chooseContrastCandidateExcluding,
		contrastCandidates: sectionCandidates.contrastCandidates,
		contextLabelFromReport: sectionDocument.contextLabelFromReport,
		generate: generate,
		generateAprimeSection: generateAprimeSection,
		generateCSection: generateCSection,
		generateSection: generateSection,
		measuresForSection: sectionDocument.measuresForSection,
		measuresForSectionA: sectionDocument.measuresForSectionA,
		parallelKey: sectionCandidates.parallelKey,
		relativeKey: sectionCandidates.relativeKey,
		sameKeySubdominant: sectionCandidates.sameKeySubdominant,
		transposeIndex: sectionCandidates.transposeIndex
	};
})(window);
