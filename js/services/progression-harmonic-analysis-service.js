// Formal harmonic analysis contract derived from a progression document.
(function (global) {
	'use strict';

	function analyze(progression) {
		var sections = progression && progression.sections ? progression.sections : [];
		var measures = progression && progression.measures ? progression.measures : [];

		return {
			measures: measureAnalyses(measures, sections),
			transitions: transitionAnalyses(sections),
			version: 1
		};
	}

	function sourceForChord(chord, options) {
		var modulation;

		if (!chord) {
			return null;
		}

		modulation = modulationForChord(chord, options);
		if (modulation) {
			return {
				kind: modulation.kind,
				labelKey: chord.modulationSourceLabelKey || chord.sourceLabelKey,
				targetContext: modulation.targetContext,
				targetDegree: chord.pivotTargetDegree || '',
				type: 'modulation'
			};
		}

		if (chord.source === 'chromatic') {
			if (isTransitionLabelKey(chord.sourceLabelKey)) {
				return null;
			}

			return {
				labelKey: chord.sourceLabelKey || '',
				role: chord.chromaticRole || '',
				type: 'chromatic'
			};
		}

		if (chord.source === 'interchange') {
			return {
				scaleIndex: chord.sourceScaleIndex,
				tonicName: chord.sourceTonicName || '',
				type: 'interchange'
			};
		}

		return null;
	}

	function modulationForChord(chord, options) {
		var sections = options && options.sections ? options.sections : [];
		var section = sectionForId(sections, chord.sectionId);
		var kind = chord.modulationKind || modulationKindFromLabel(chord.modulationSourceLabelKey || chord.sourceLabelKey);
		var transition;

		if (!section || !kind) {
			return null;
		}

		if (section.contrast && section.modulation && section.modulation.kind === kind && section.modulation.targetSectionId === section.id) {
			return transitionFromSection(section);
		}

		transition = transitionFromOriginSection(sections, section.id, kind);
		return transition || null;
	}

	function transitionAnalyses(sections) {
		var transitions = [];

		for (var i = 0; i < (sections || []).length; i++) {
			if (sections[i].contrast && sections[i].modulation && sections[i].modulation.targetSectionId === sections[i].id) {
				transitions.push(transitionFromSection(sections[i]));
			}
		}

		return transitions;
	}

	function measureAnalyses(measures, sections) {
		var result = [];

		for (var i = 0; i < (measures || []).length; i++) {
			result.push({
				bar: measures[i].bar || i + 1,
				index: i,
				sectionId: measures[i].sectionId || '',
				source: sourceForChord(measures[i], { sections: sections })
			});
		}

		return result;
	}

	function transitionFromSection(section) {
		var modulation = section.modulation || {};

		return {
			kind: modulation.kind || '',
			originSectionId: modulation.originSectionId || '',
			pivotDegree: modulation.pivotDegree || '',
			targetContext: {
				label: modulation.targetContextLabel || section.contextLabel || '',
				scaleIndex: modulation.targetScaleIndex != null ? modulation.targetScaleIndex : section.contextScaleIndex,
				scaleName: section.contextScaleName || '',
				tonicName: modulation.targetTonicName || section.contextTonicName || ''
			},
			targetSectionId: modulation.targetSectionId || section.id
		};
	}

	function transitionFromOriginSection(sections, sectionId, kind) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (
				sections[i].contrast &&
				sections[i].modulation &&
				sections[i].modulation.kind === kind &&
				sections[i].modulation.originSectionId === sectionId &&
				sections[i].modulation.targetSectionId === sections[i].id
			) {
				return transitionFromSection(sections[i]);
			}
		}

		return null;
	}

	function isValidModulationSource(chord, options) {
		return !!modulationForChord(chord, options);
	}

	function isTransitionLabelKey(labelKey) {
		return labelKey === 'progression.modulation.pivot' ||
			labelKey === 'progression.modulation.secondaryDominant';
	}

	function modulationKindFromLabel(labelKey) {
		if (labelKey === 'progression.modulation.pivot') {
			return 'pivot';
		}

		if (labelKey === 'progression.modulation.secondaryDominant') {
			return 'secondaryDominant';
		}

		return '';
	}

	function sectionForId(sections, sectionId) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (sections[i].id === sectionId) {
				return sections[i];
			}
		}

		return null;
	}

	global.CodaProgressionHarmonicAnalysis = {
		analyze: analyze,
		isTransitionLabelKey: isTransitionLabelKey,
		isValidModulationSource: isValidModulationSource,
		modulationForChord: modulationForChord,
		modulationKindFromLabel: modulationKindFromLabel,
		sourceForChord: sourceForChord
	};
})(window);
