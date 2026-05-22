// Chooses tonal contexts for contrasting progression sections.
(function (global) {
	'use strict';

	var sectionDocument = global.CodaProgressionSectionDocument;

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
			label: sectionDocument.contextLabelFromReport(options.report),
			openingFunction: 'SD',
			report: options.report
		};
	}

	function sameKeyNoModulation(options) {
		return {
			id: 'same-no-modulation',
			label: sectionDocument.contextLabelFromReport(options.report),
			openingFunction: 'T_OR_SD',
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
		var primaryContext = sectionDocument.contextLabelFromReport(report);

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

	function noteIndexForName(notes, name) {
		for (var i = 0; i < notes.length; i++) {
			if (notes[i].nombre === name || notes[i].enarmonica === name) {
				return i;
			}
		}

		return null;
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

	global.CodaProgressionSectionCandidates = {
		circleNeighborCandidates: circleNeighborCandidates,
		chooseContrastCandidate: chooseContrastCandidate,
		chooseContrastCandidateExcluding: chooseContrastCandidateExcluding,
		contrastCandidates: contrastCandidates,
		existingSectionContexts: existingSectionContexts,
		parallelKey: parallelKey,
		relativeKey: relativeKey,
		reportForSection: reportForSection,
		sameKeyNoModulation: sameKeyNoModulation,
		sameKeySubdominant: sameKeySubdominant,
		transposeIndex: transposeIndex
	};
})(window);
