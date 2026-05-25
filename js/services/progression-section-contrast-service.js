// Orchestrates derivative and contrasting progression sections.
(function (global) {
	'use strict';

	var sectionCandidates = global.CodaProgressionSectionCandidates;
	var sectionDocument = global.CodaProgressionSectionDocument;
	var sectionModulation = global.CodaProgressionSectionModulation;
	var objectService = global.CodaProgressionObjects;
	var sectionVariation = global.CodaProgressionSectionVariation;

	function generate(options, dependencies) {
		var progression = options.progression || {};
		var progressionState = cloneObject(options.progressionState || {});
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var sectionAMeasures = sectionDocument.measuresForSectionA(progression, progressionState);
		options.buildScaleReport = dependencies.buildScaleReport;
		var candidate = contrastCandidateForOptions(options, rng);
		var targetReport = candidate.report || options.report;
		var modulation;
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

		modulation = sectionModulation.prepare({
			candidate: candidate,
			dependencies: dependencies,
			originMeasures: sectionAMeasures,
			originReport: options.report,
			originSectionId: 'A',
			options: options,
			progressionState: progressionState,
			rng: rng,
			sectionMeasures: sectionB.measures || [],
			targetReport: targetReport,
			targetSectionId: 'B'
		});
		combined = sectionModulation.applyToCombinedMeasures(
			sectionDocument.cloneMeasures(sectionAMeasures),
			sectionDocument.cloneMeasures(sectionB.measures || []),
			modulation
		);
		rebuilt = dependencies.rebuildProgressionTimeline(progression, combined);
		rebuilt.sections = [
			{
				id: 'A',
				labelKey: 'progression.sectionA',
				length: sectionAMeasures.length,
				startIndex: 0
			},
			sectionMetadata(candidate, targetReport, 'B', sectionAMeasures.length, sectionB.measures ? sectionB.measures.length : 0, sectionState, modulation.metadata)
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
		var originSection = lastSection(progression) || sectionDocument.findSection(progression, 'A');
		var referenceMeasures = sectionDocument.measuresForSection(progression, originSection ? originSection.id : 'A', progressionState);
		var originReport;
		var candidateOptions;
		var sectionState = cloneObject(progressionState);
		var candidate;
		var targetReport;
		var sectionProgression;
		var modulation;

		if (sectionDocument.findSection(progression, targetId)) {
			return progression;
		}

		options.buildScaleReport = dependencies.buildScaleReport;
		originReport = sectionCandidates.reportForSection(originSection, options) || options.report;
		candidateOptions = extendObject(options, {
			report: originReport
		});
		sectionState.bars = referenceMeasures.length || progressionState.bars || 8;
		candidate = contrastCandidateForOptions(candidateOptions, rng, progression, originReport);
		targetReport = candidate.report || options.report;
		sectionProgression = dependencies.generateProgressionFromState({
			data: options.data,
			domain: options.domain,
			openingFunction: candidate.openingFunction,
			progressionState: sectionState,
			report: targetReport,
			rng: rng
		});
		modulation = sectionModulation.prepare({
			candidate: candidate,
			dependencies: dependencies,
			originMeasures: referenceMeasures,
			originReport: originReport,
			originSectionId: originSection ? originSection.id : 'A',
			options: options,
			progressionState: progressionState,
			rng: rng,
			sectionMeasures: sectionProgression.measures || [],
			targetReport: targetReport,
			targetSectionId: targetId
		});

		return appendContrastSection(
			progression,
			sectionProgression.measures || [],
			sectionMetadata(candidate, targetReport, targetId, 0, 0, sectionState, modulation.metadata),
			dependencies,
			modulation
		);
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

	function sectionMetadata(candidate, report, id, startIndex, length, state, modulation) {
		var metadata = {
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

		if (modulation) {
			metadata.modulation = modulation;
		}

		return metadata;
	}

	function contrastCandidateForOptions(options, rng, progression, originReport) {
		if (isExplicitNoModulation(options)) {
			return sectionCandidates.sameKeyNoModulation(options);
		}

		if (options && options.modulationType === 'pivot') {
			return pivotCompatibleCandidate(options, rng, progression, originReport);
		}

		if (progression) {
			return sectionCandidates.chooseContrastCandidateExcluding(options, rng, sectionCandidates.existingSectionContexts(progression, originReport || options.report));
		}

		return sectionCandidates.chooseContrastCandidate(options, rng);
	}

	function pivotCompatibleCandidate(options, rng, progression, originReport) {
		var candidates = sectionCandidates.contrastCandidates(options);
		var excludedContexts = progression ? sectionCandidates.existingSectionContexts(progression, originReport || options.report) : [];
		var origin = originReport || options.report;
		var filtered = pivotCandidates(candidates, origin, excludedContexts);

		if (!filtered.length && excludedContexts.length) {
			filtered = pivotCandidates(candidates, origin, []);
		}

		if (!filtered.length) {
			return firstDifferentCandidate(candidates, origin, excludedContexts) ||
				firstDifferentCandidate(candidates, origin, []) ||
				sectionCandidates.sameKeyNoModulation(options);
		}

		return filtered[Math.floor(rng() * filtered.length) % filtered.length] || filtered[0];
	}

	function pivotCandidates(candidates, originReport, excludedContexts) {
		var filtered = [];

		for (var i = 0; i < (candidates || []).length; i++) {
			if (isExcludedCandidate(candidates[i], excludedContexts) || !isModulatingCandidate(candidates[i], originReport)) {
				continue;
			}

			if (sectionModulation.commonPivotChord(originReport, candidates[i].report)) {
				filtered.push(candidates[i]);
			}
		}

		return filtered;
	}

	function firstDifferentCandidate(candidates, originReport, excludedContexts) {
		for (var i = 0; i < (candidates || []).length; i++) {
			if (!isExcludedCandidate(candidates[i], excludedContexts) && isModulatingCandidate(candidates[i], originReport)) {
				return candidates[i];
			}
		}

		return null;
	}

	function isModulatingCandidate(candidate, originReport) {
		return !!(candidate && candidate.report && !sectionModulation.sameReportContext(originReport, candidate.report));
	}

	function isExcludedCandidate(candidate, excludedContexts) {
		var label = candidate && candidate.label ? candidate.label : '';

		if (!label) {
			return false;
		}

		for (var i = 0; i < (excludedContexts || []).length; i++) {
			if (excludedContexts[i] === label) {
				return true;
			}
		}

		return false;
	}

	function appendContrastSection(progression, sectionMeasures, metadata, dependencies, modulation) {
		var previousSections = sectionDocument.normalizedSections(progression);
		var previousMeasures = sectionDocument.cloneMeasures(progression && progression.measures ? progression.measures : []);
		var prepared = sectionModulation.applyToCombinedMeasures(previousMeasures, sectionDocument.cloneMeasures(sectionMeasures || []), modulation);
		var rebuilt = dependencies.rebuildProgressionTimeline(progression, prepared);
		var startIndex = previousMeasures.length;

		rebuilt.sections = previousSections.concat([extendObject(metadata, {
			length: sectionMeasures ? sectionMeasures.length : 0,
			startIndex: startIndex
		})]);
		sectionDocument.annotateSectionMeasures(rebuilt.measures, rebuilt.sections);

		return rebuilt;
	}

	function isExplicitNoModulation(options) {
		return options && options.modulationType === 'none';
	}

	function lastSection(progression) {
		var sections = progression && progression.sections ? progression.sections : [];

		return sections.length ? sections[sections.length - 1] : null;
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
		return objectService.cloneObject(value);
	}

	function extendObject(target, values) {
		return objectService.extendObject(target, values);
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
		sameKeyNoModulation: sectionCandidates.sameKeyNoModulation,
		transposeIndex: sectionCandidates.transposeIndex
	};
})(window);
