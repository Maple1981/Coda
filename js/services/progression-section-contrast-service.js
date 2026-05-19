// Builds a contrasting B section while preserving the A section timeline.
(function (global) {
	'use strict';

	var cloneService = global.CodaProgressionMeasureClone;

	function generate(options, dependencies) {
		var progression = options.progression || {};
		var progressionState = cloneObject(options.progressionState || {});
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var sectionAMeasures = measuresForSectionA(progression, progressionState);
		options.buildScaleReport = dependencies.buildScaleReport;
		var candidate = chooseContrastCandidate(options, rng);
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

		combined = cloneMeasures(sectionAMeasures).concat(cloneMeasures(sectionB.measures || []));
		rebuilt = dependencies.rebuildProgressionTimeline(progression, combined);
		rebuilt.sections = [
			{
				id: 'A',
				labelKey: 'progression.sectionA',
				length: sectionAMeasures.length,
				startIndex: 0
			},
			{
				circleOfFifths: targetReport.circleOfFifths || null,
				contrast: candidate.id,
				contextLabel: candidate.label,
				contextScaleIndex: targetReport.scaleIndex,
				contextScaleName: targetReport.scaleName,
				contextTonicName: targetReport.tonicName,
				id: 'B',
				labelKey: 'progression.sectionB',
				length: sectionB.measures ? sectionB.measures.length : 0,
				state: cloneObject(sectionState),
				startIndex: sectionAMeasures.length
			}
		];
		annotateSectionMeasures(rebuilt.measures, rebuilt.sections);
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
			return generateContrastSection(options, dependencies, findSection(options.progression, 'B') ? 'C' : 'B');
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
		var referenceMeasures = targetId === 'B' ? measuresForSection(progression, 'A', progressionState) : measuresForLastSection(progression, progressionState);
		var sectionState = cloneObject(progressionState);
		var candidate;
		var targetReport;
		var sectionProgression;

		if (findSection(progression, targetId)) {
			return progression;
		}

		options.buildScaleReport = dependencies.buildScaleReport;
		sectionState.bars = referenceMeasures.length || progressionState.bars || 8;
		candidate = chooseContrastCandidateExcluding(options, rng, existingSectionContexts(progression, options.report));
		targetReport = candidate.report || options.report;
		sectionProgression = dependencies.generateProgressionFromState({
			data: options.data,
			domain: options.domain,
			openingFunction: candidate.openingFunction,
			progressionState: sectionState,
			report: targetReport,
			rng: rng
		});

		return appendSection(progression, sectionProgression.measures || [], {
			circleOfFifths: targetReport.circleOfFifths || null,
			contrast: candidate.id,
			contextLabel: candidate.label,
			contextScaleIndex: targetReport.scaleIndex,
			contextScaleName: targetReport.scaleName,
			contextTonicName: targetReport.tonicName,
			id: targetId,
			labelKey: sectionLabelKey(targetId),
			state: cloneObject(sectionState)
		}, dependencies);
	}

	function generateDerivativeSection(options, dependencies, sourceId, targetId, shouldVary) {
		var progression = options.progression || {};
		var progressionState = cloneObject(options.progressionState || {});
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var sourceSection = findSection(progression, sourceId);
		var sourceMeasures = measuresForSection(progression, sourceId, progressionState);
		var sourceReport = reportForSection(sourceSection, options) || options.report;
		var sectionState = sectionStateForSource(sourceSection, progressionState, sourceMeasures);
		var sectionMeasures = cloneMeasures(sourceMeasures);
		var generated;

		if (findSection(progression, targetId) || !sourceMeasures.length) {
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
			sectionMeasures = createVariationMeasures(sourceMeasures, generated.measures || [], rng);
		}

		return appendSection(progression, sectionMeasures, extendObject(sectionMetadataFromReport(sourceReport), {
			id: targetId,
			labelKey: sectionLabelKey(targetId),
			state: cloneObject(sectionState),
			variationKind: shouldVary ? 'small' : 'clone',
			variationOf: sourceId
		}), dependencies);
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

	function measuresForSectionA(progression, progressionState) {
		return measuresForSection(progression, 'A', progressionState);
	}

	function measuresForSection(progression, id, progressionState) {
		var measures = progression && progression.measures ? progression.measures : [];
		var section = findSection(progression, id);
		var length = section ? section.length : Number(progressionState.bars) || measures.length;
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

	function chooseContrastCandidate(options, rng) {
		var roll = rng();
		var target;

		if (roll < 0.42) {
			return sameKeySubdominant(options);
		}

		if (roll < 0.67) {
			target = relativeKey(options);
			return target || sameKeySubdominant(options);
		}

		if (roll < 0.87) {
			target = parallelKey(options);
			return target || sameKeySubdominant(options);
		}

		target = circleNeighborKey(options, rng);
		return target || sameKeySubdominant(options);
	}

	function sameKeySubdominant(options) {
		return {
			id: 'same-sd',
			label: contextLabelFromReport(options.report),
			openingFunction: 'SD',
			report: options.report
		};
	}

	function relativeKey(options) {
		var isMajor = isMajorReport(options.report);
		var tonicIndex = isMajor ? transposeIndex(options.report.tonicIndex, -3) : transposeIndex(options.report.tonicIndex, 3);
		var scaleIndex = isMajor ? 2 : 0;

		return buildCandidate('relative', tonicIndex, scaleIndex, options);
	}

	function parallelKey(options) {
		var scaleIndex = isMajorReport(options.report) ? 2 : 0;

		return buildCandidate('parallel', options.report.tonicIndex, scaleIndex, options);
	}

	function circleNeighborKey(options, rng) {
		var candidates = circleNeighborCandidates(options);

		if (!candidates.length) {
			return null;
		}

		return candidates[Math.floor(rng() * candidates.length) % candidates.length];
	}

	function circleNeighborCandidates(options) {
		var isMajor = isMajorReport(options.report);
		var result = [];
		var offsets = [7, -7];

		for (var i = 0; i < offsets.length; i++) {
			var neighborIndex = transposeIndex(options.report.tonicIndex, offsets[i]);
			var sameModeScaleIndex = isMajor ? 0 : 2;
			var relatedScaleIndex = isMajor ? 2 : 0;
			var relatedTonicIndex = isMajor ? transposeIndex(neighborIndex, -3) : transposeIndex(neighborIndex, 3);
			var sameMode = buildCandidate('circle-neighbor', neighborIndex, sameModeScaleIndex, options);
			var related = buildCandidate('circle-neighbor', relatedTonicIndex, relatedScaleIndex, options);

			if (sameMode) {
				result.push(sameMode);
			}

			if (related) {
				result.push(related);
			}
		}

		return result;
	}

	function chooseContrastCandidateExcluding(options, rng, excludedContexts) {
		var candidates = contrastCandidates(options);
		var filtered = [];

		for (var i = 0; i < candidates.length; i++) {
			if (!isExcludedCandidate(candidates[i], excludedContexts)) {
				filtered.push(candidates[i]);
			}
		}

		if (!filtered.length) {
			filtered = candidates;
		}

		if (!filtered.length) {
			return sameKeySubdominant(options);
		}

		return filtered[Math.floor(rng() * filtered.length) % filtered.length] || sameKeySubdominant(options);
	}

	function contrastCandidates(options) {
		var candidates = [];
		var relative = relativeKey(options);
		var parallel = parallelKey(options);
		var circle = circleNeighborCandidates(options);

		if (relative) {
			candidates.push(relative);
		}
		if (parallel) {
			candidates.push(parallel);
		}

		return candidates.concat(circle).concat([sameKeySubdominant(options)]);
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

	function existingSectionContexts(progression, report) {
		var sections = progression && progression.sections ? progression.sections : [];
		var contexts = [];
		var primaryContext = contextLabelFromReport(report);

		if (primaryContext) {
			contexts.push(primaryContext);
		}

		for (var i = 0; i < sections.length; i++) {
			if (sections[i].contextLabel) {
				contexts.push(sections[i].contextLabel);
			}
		}

		return contexts;
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

		state.bars = sourceMeasures.length || state.bars || progressionState.bars || 8;

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

	function reportForSection(section, options) {
		var data = options.data || {};
		var tonicIndex;
		var scaleIndex = section && section.contextScaleIndex != null ? Number(section.contextScaleIndex) : null;
		var scaleDefinition = scaleIndex != null && data.scales ? data.scales[scaleIndex] : null;

		if (!section || !section.contextTonicName || !scaleDefinition || !options.buildScaleReport) {
			return null;
		}

		tonicIndex = noteIndexForName(data.notes || [], section.contextTonicName);
		if (tonicIndex == null) {
			return null;
		}

		return options.buildScaleReport({
			data: data,
			domain: options.domain,
			preferFlats: !!(options.selection && options.selection.preferFlats),
			scaleIndex: scaleIndex,
			scaleName: scaleDefinition.nombre,
			tonicIndex: tonicIndex,
			tonicName: section.contextTonicName
		});
	}

	function noteIndexForName(notes, name) {
		for (var i = 0; i < notes.length; i++) {
			if (notes[i].nombre === name || notes[i].enarmonica === name) {
				return i;
			}
		}

		return null;
	}

	function buildCandidate(id, tonicIndex, scaleIndex, options) {
		var data = options.data || {};
		var scaleDefinition = data.scales ? data.scales[scaleIndex] : null;
		var tonicName;
		var preferFlats;
		var report;

		if (!scaleDefinition || !data.notes || !data.notes[tonicIndex]) {
			return null;
		}

		preferFlats = preferFlatsForCandidate(options, tonicIndex, scaleIndex, scaleDefinition);
		tonicName = noteNameForIndex(data.notes, tonicIndex, preferFlats);
		report = options.buildScaleReport({
			data: data,
			domain: options.domain,
			preferFlats: preferFlats,
			scaleIndex: scaleIndex,
			scaleName: scaleDefinition.nombre,
			tonicIndex: tonicIndex,
			tonicName: tonicName
		});

		if (!report) {
			return null;
		}

		return {
			id: id,
			label: tonicName + ' ' + scaleDefinition.nombre,
			report: report
		};
	}

	function contextLabelFromReport(report) {
		return report && report.tonicName && report.scaleName ? report.tonicName + ' ' + report.scaleName : '';
	}

	function preferFlatsForCandidate(options, tonicIndex, scaleIndex, scaleDefinition) {
		var data = options.data || {};
		var tonicName = noteNameForIndex(data.notes || [], tonicIndex, false);
		var flatTonicName = noteNameForIndex(data.notes || [], tonicIndex, true);
		var preferFlats = options.domain && typeof options.domain.shouldPreferFlatsForKeySignature === 'function' ?
			options.domain.shouldPreferFlatsForKeySignature({
				scaleDefinition: scaleDefinition,
				selectedScaleIndex: scaleIndex,
				tonicName: tonicName
			}) :
			null;

		if (preferFlats === false && flatTonicName && flatTonicName !== tonicName && isConventionalFlatKey(flatTonicName, scaleIndex) && !isConventionalSharpKey(tonicName, scaleIndex)) {
			return true;
		}

		return preferFlats == null ? !!(options.selection && options.selection.preferFlats) : preferFlats;
	}

	function isConventionalFlatKey(tonicName, scaleIndex) {
		var keyName = String(scaleIndex) === '0' ? tonicName : tonicName + 'm';
		var flatKeys = String(scaleIndex) === '0' ?
			['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'] :
			['Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'];

		return flatKeys.indexOf(keyName) > -1;
	}

	function isConventionalSharpKey(tonicName, scaleIndex) {
		var keyName = String(scaleIndex) === '0' ? tonicName : tonicName + 'm';
		var sharpKeys = String(scaleIndex) === '0' ?
			['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#'] :
			['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'A#m'];

		return sharpKeys.indexOf(keyName) > -1;
	}

	function annotateSectionMeasures(measures, sections) {
		for (var i = 0; i < sections.length; i++) {
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

	function cloneMeasures(measures) {
		var result = [];

		for (var i = 0; i < (measures || []).length; i++) {
			result.push(cloneService.cloneMeasure(measures[i]));
		}

		return result;
	}

	function createVariationMeasures(sourceMeasures, generatedMeasures, rng) {
		var variation = cloneMeasures(sourceMeasures);
		var count = variationChangeCount(variation.length, rng);
		var used = {};
		var index;
		var replacement;

		for (var i = 0; i < count && variation.length; i++) {
			index = variationIndex(variation.length, rng, used);
			used[index] = true;
			replacement = variationReplacementMeasure(index, sourceMeasures, generatedMeasures);
			if (replacement) {
				variation[index] = cloneService.cloneMeasure(replacement);
			}
		}

		return variation;
	}

	function variationReplacementMeasure(index, sourceMeasures, generatedMeasures) {
		var sourceSignature = measureVisibleChordSignature(sourceMeasures[index]);
		var fallback;

		if (generatedMeasures[index] && measureVisibleChordSignature(generatedMeasures[index]) !== sourceSignature) {
			return generatedMeasures[index];
		}

		fallback = firstDifferentMeasure(sourceSignature, generatedMeasures);
		if (fallback) {
			return fallback;
		}

		return firstDifferentMeasure(sourceSignature, sourceMeasures, index);
	}

	function firstDifferentMeasure(sourceSignature, measures, excludedIndex) {
		for (var i = 0; i < (measures || []).length; i++) {
			if (i !== excludedIndex && measureVisibleChordSignature(measures[i]) !== sourceSignature) {
				return measures[i];
			}
		}

		return null;
	}

	function measureVisibleChordSignature(measure) {
		if (!measure) {
			return '';
		}

		if (measure.chords && measure.chords.length) {
			return measure.chords.map(measureVisibleChordSignature).join('|');
		}

		return [
			measure.displayName,
			measure.chordName,
			measure.label
		].join('::');
	}

	function variationChangeCount(length, rng) {
		var max = length >= 12 ? 3 : (length >= 6 ? 2 : 1);

		return 1 + Math.floor(rng() * max);
	}

	function variationIndex(length, rng, used) {
		var min = length > 3 ? 1 : 0;
		var max = length > 3 ? length - 2 : length - 1;
		var index = min + Math.floor(rng() * Math.max(1, max - min + 1));
		var guard = 0;

		while (used[index] && guard < length) {
			index += 1;
			if (index > max) {
				index = min;
			}
			guard += 1;
		}

		return index;
	}

	function appendSection(progression, sectionMeasures, sectionMetadata, dependencies) {
		var previousSections = normalizedSections(progression);
		var combined = cloneMeasures(progression.measures || []).concat(cloneMeasures(sectionMeasures || []));
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

	function isMajorReport(report) {
		return report && report.mode === 'M';
	}

	function noteNameForIndex(notes, index, preferFlats) {
		var note = notes[normalizeIndex(index)];

		return preferFlats && note.enarmonica ? note.enarmonica : note.nombre;
	}

	function normalizeIndex(index) {
		var normalized = Number(index) % 12;

		return normalized < 0 ? normalized + 12 : normalized;
	}

	function transposeIndex(index, semitones) {
		return normalizeIndex(Number(index) + semitones);
	}

	global.CodaProgressionSectionContrast = {
		annotateSectionMeasures: annotateSectionMeasures,
		circleNeighborCandidates: circleNeighborCandidates,
		chooseContrastCandidate: chooseContrastCandidate,
		chooseContrastCandidateExcluding: chooseContrastCandidateExcluding,
		contrastCandidates: contrastCandidates,
		contextLabelFromReport: contextLabelFromReport,
		generate: generate,
		generateSection: generateSection,
		measuresForSectionA: measuresForSectionA,
		measuresForSection: measuresForSection,
		parallelKey: parallelKey,
		relativeKey: relativeKey,
		sameKeySubdominant: sameKeySubdominant,
		transposeIndex: transposeIndex
	};
})(window);
