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
				contrast: candidate.id,
				contextLabel: candidate.label,
				id: 'B',
				labelKey: 'progression.sectionB',
				length: sectionB.measures ? sectionB.measures.length : 0,
				startIndex: sectionAMeasures.length
			}
		];
		annotateSectionMeasures(rebuilt.measures, rebuilt.sections);
		rebuilt.sectionContrast = candidate.id;

		return rebuilt;
	}

	function measuresForSectionA(progression, progressionState) {
		var measures = progression && progression.measures ? progression.measures : [];
		var section = findSection(progression, 'A');
		var length = section ? section.length : Number(progressionState.bars) || measures.length;
		var startIndex = section ? section.startIndex : 0;

		return measures.slice(startIndex, startIndex + Math.min(length, measures.length));
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
			label: '',
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

	function preferFlatsForCandidate(options, tonicIndex, scaleIndex, scaleDefinition) {
		var data = options.data || {};
		var tonicName = noteNameForIndex(data.notes || [], tonicIndex, false);
		var preferFlats = options.domain && typeof options.domain.shouldPreferFlatsForKeySignature === 'function' ?
			options.domain.shouldPreferFlatsForKeySignature({
				scaleDefinition: scaleDefinition,
				selectedScaleIndex: scaleIndex,
				tonicName: tonicName
			}) :
			null;

		return preferFlats == null ? !!(options.selection && options.selection.preferFlats) : preferFlats;
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

	function cloneObject(value) {
		var result = {};

		for (var key in value || {}) {
			if (Object.prototype.hasOwnProperty.call(value, key)) {
				result[key] = value[key];
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
		generate: generate,
		measuresForSectionA: measuresForSectionA,
		parallelKey: parallelKey,
		relativeKey: relativeKey,
		sameKeySubdominant: sameKeySubdominant,
		transposeIndex: transposeIndex
	};
})(window);
