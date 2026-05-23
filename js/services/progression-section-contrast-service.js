// Orchestrates derivative and contrasting progression sections.
(function (global) {
	'use strict';

	var sectionCandidates = global.CodaProgressionSectionCandidates;
	var sectionDocument = global.CodaProgressionSectionDocument;
	var sectionVariation = global.CodaProgressionSectionVariation;
	var formattingService = global.CodaProgressionFormatting;

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

		modulation = prepareSectionModulation({
			candidate: candidate,
			dependencies: dependencies,
			originReport: options.report,
			originSectionId: 'A',
			options: options,
			progressionState: progressionState,
			sectionMeasures: sectionB.measures || [],
			targetReport: targetReport,
			targetSectionId: 'B'
		});
		combined = applyModulationToCombinedMeasures(
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
		modulation = prepareSectionModulation({
			candidate: candidate,
			dependencies: dependencies,
			originReport: originReport,
			originSectionId: originSection ? originSection.id : 'A',
			options: options,
			progressionState: progressionState,
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

			if (commonPivotChord(originReport, candidates[i].report)) {
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
		return !!(candidate && candidate.report && !sameReportContext(originReport, candidate.report));
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
		var prepared = applyModulationToCombinedMeasures(previousMeasures, sectionDocument.cloneMeasures(sectionMeasures || []), modulation);
		var rebuilt = dependencies.rebuildProgressionTimeline(progression, prepared);
		var startIndex = previousMeasures.length;

		rebuilt.sections = previousSections.concat([extendObject(metadata, {
			length: sectionMeasures ? sectionMeasures.length : 0,
			startIndex: startIndex
		})]);
		sectionDocument.annotateSectionMeasures(rebuilt.measures, rebuilt.sections);

		return rebuilt;
	}

	function prepareSectionModulation(context) {
		var requestedKind = normalizedModulationKind(context.options.modulationType);
		var originReport = context.originReport;
		var targetReport = context.targetReport;
		var pivot = commonPivotChord(originReport, targetReport);
		var kind = requestedKind;
		var metadata;

		if (!kind || kind === 'none' || sameReportContext(originReport, targetReport)) {
			return emptyModulation('none');
		}

		metadata = {
			kind: kind,
			originSectionId: context.originSectionId || 'A',
			targetSectionId: context.targetSectionId || 'B',
			targetContextLabel: sectionDocument.contextLabelFromReport(targetReport),
			targetScaleIndex: targetReport ? targetReport.scaleIndex : null,
			targetTonicName: targetReport ? targetReport.tonicName : ''
		};

		if (kind === 'secondaryDominant') {
			return {
				metadata: metadata,
				previousMeasure: transitionMeasureForDegree(4, targetReport, context, {
					degree: 'V/' + targetTonicLabel(targetReport),
					modulationKind: kind,
					modulationRole: 'secondary-dominant',
					source: 'chromatic',
					sourceLabelKey: 'progression.modulation.secondaryDominant',
					tonalFunction: 'D'
				}, {
					forceKind: 'seventh'
				})
			};
		}

		if (kind === 'pivot' && pivot) {
			metadata.pivotDegree = pivot.originDegree + ' -> ' + pivot.targetDegree;
			return {
				metadata: metadata,
				previousMeasure: transitionMeasureForDegree(pivot.originIndex, originReport, context, {
					modulationKind: kind,
					modulationRole: 'pivot',
					modulationSourceLabelKey: 'progression.modulation.pivot',
					pivotOriginDegree: pivot.originDegree,
					pivotTargetDegree: pivot.targetDegree,
					pivotTargetScaleIndex: targetReport ? targetReport.scaleIndex : null,
					pivotTargetScaleName: targetReport ? targetReport.scaleName : '',
					pivotTargetTonicName: targetReport ? targetReport.tonicName : ''
				})
			};
		}

		metadata.kind = 'direct';
		return {
			metadata: metadata
		};
	}

	function emptyModulation(kind) {
		return {
			metadata: kind === 'direct' ? { kind: 'direct' } : null
		};
	}

	function normalizedModulationKind(value) {
		if (value === 'none' || value === 'pivot' || value === 'secondaryDominant' || value === 'direct') {
			return value;
		}

		return 'none';
	}

	function isExplicitNoModulation(options) {
		return options && options.modulationType === 'none';
	}

	function transitionMeasureForDegree(degreeIndex, report, context, metadata, degreeOptions) {
		var generated;
		var degree = extendObject({
			index: degreeIndex,
			source: 'diatonic'
		}, degreeOptions || {});
		var state = cloneObject(context.progressionState || {});

		state.bars = 1;
		state.harmonicDensity = 0;
		state.chromaticism = 0;
		state.style = 'baroque';

		generated = context.dependencies.generateProgressionFromState({
			data: context.options.data,
			domain: context.options.domain,
			progressionState: state,
			report: report,
			rng: fixedRng,
			rules: {
				patterns: [
					{
						cadence: 'authentic',
						counterpoint: Number(state.counterpoint) || 50,
						degrees: [degree],
						id: 'section-modulation-transition',
						modes: ['major', 'minor'],
						weight: 100
					}
				]
			}
		});

		if (!generated || !generated.measures || !generated.measures.length) {
			return null;
		}

		return extendObject(generated.measures[0], metadata || {});
	}

	function applyModulationToCombinedMeasures(previousMeasures, sectionMeasures, modulation) {
		var result = previousMeasures.concat(sectionMeasures);
		var previousIndex = previousMeasures.length - 1;
		var nextIndex = previousMeasures.length;

		if (modulation && modulation.previousMeasure && previousIndex >= 0) {
			result[previousIndex] = replaceMeasureHarmony(result[previousIndex], modulation.previousMeasure);
		}

		if (modulation && modulation.nextMeasure && nextIndex < result.length) {
			result[nextIndex] = replaceMeasureHarmony(result[nextIndex], modulation.nextMeasure);
		}

		return result;
	}

	function replaceMeasureHarmony(original, replacement) {
		var timing = {};
		var result = extendObject(original, replacement);
		var timingKeys = [
			'articulation',
			'bar',
			'beatUnit',
			'beatsPerBar',
			'bpm',
			'durationBeats',
			'durationSeconds',
			'endBeat',
			'endSeconds',
			'sectionId',
			'sectionLabelKey',
			'startBeat',
			'startSeconds'
		];

		for (var i = 0; i < timingKeys.length; i++) {
			if (original && Object.prototype.hasOwnProperty.call(original, timingKeys[i])) {
				timing[timingKeys[i]] = original[timingKeys[i]];
			}
		}

		result = extendObject(result, timing);
		delete result.chords;

		return result;
	}

	function commonPivotChord(originReport, targetReport) {
		var best = null;
		var bestScore = -1;
		var originChords = originReport && originReport.scaleChords ? originReport.scaleChords : [];
		var targetChords = targetReport && targetReport.scaleChords ? targetReport.scaleChords : [];

		for (var i = 0; i < originChords.length; i++) {
			for (var j = 0; j < targetChords.length; j++) {
				var score = pivotScore(originChords[i], targetChords[j], i, j);

				if (score > bestScore) {
					bestScore = score;
					best = {
						originDegree: degreeName(originReport, i, originChords[i]),
						originIndex: i,
						targetDegree: degreeName(targetReport, j, targetChords[j]),
						targetIndex: j
					};
				}
			}
		}

		return bestScore > 0 ? best : null;
	}

	function pivotScore(originChord, targetChord, originIndex, targetIndex) {
		var originSignature = chordSignature(originChord);
		var targetSignature = chordSignature(targetChord);
		var score = originSignature && originSignature === targetSignature ? 1 : 0;

		if (!score) {
			return 0;
		}

		if (originIndex !== 0 && originIndex !== 4) {
			score += 4;
		}

		if (targetIndex !== 0 && targetIndex !== 4) {
			score += 4;
		}

		if (originIndex === 5 || targetIndex === 1 || targetIndex === 3) {
			score += 2;
		}

		return score;
	}

	function chordSignature(chord) {
		var notes = chord && chord.factorNotes ? chord.factorNotes.slice(0, 3) : chordFactors(chord);
		var indexes = [];

		for (var i = 0; i < notes.length; i++) {
			indexes.push(notePitch(notes[i]));
		}

		if (indexes.length < 3) {
			return '';
		}

		indexes.sort(function (a, b) {
			return a - b;
		});

		return indexes.join('-');
	}

	function chordFactors(chord) {
		if (!chord) {
			return [];
		}

		return [chord.fundamental, chord.tercera, chord.quinta].filter(Boolean);
	}

	function notePitch(noteName) {
		var pitch = {
			'C': 0,
			'B#': 0,
			'C#': 1,
			'Db': 1,
			'D': 2,
			'D#': 3,
			'Eb': 3,
			'E': 4,
			'Fb': 4,
			'E#': 5,
			'F': 5,
			'F#': 6,
			'Gb': 6,
			'G': 7,
			'G#': 8,
			'Ab': 8,
			'A': 9,
			'A#': 10,
			'Bb': 10,
			'B': 11,
			'Cb': 11
		};

		return pitch[String(noteName || '').replace(/[0-9]/g, '')];
	}

	function degreeName(report, index, chord) {
		var rawDegree = report && report.scaleNotes && report.scaleNotes[index] ? report.scaleNotes[index].grado : '';

		if (formattingService && typeof formattingService.formatTriadDegreeForChord === 'function') {
			return formattingService.formatTriadDegreeForChord(rawDegree, chord ? chord.nombre : '');
		}

		return rawDegree;
	}

	function targetTonicLabel(report) {
		return report && report.tonicName ? report.tonicName : 'I';
	}

	function sameReportContext(originReport, targetReport) {
		return !!(originReport && targetReport &&
			originReport.tonicIndex === targetReport.tonicIndex &&
			originReport.scaleIndex === targetReport.scaleIndex);
	}

	function fixedRng() {
		return 0.99;
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
		sameKeyNoModulation: sectionCandidates.sameKeyNoModulation,
		transposeIndex: sectionCandidates.transposeIndex
	};
})(window);
