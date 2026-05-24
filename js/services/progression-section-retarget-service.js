(function (global) {
	'use strict';

	var timingService = global.CodaProgressionTiming;

	function replaceContext(options) {
		options = options || {};
		var next = cloneJson(options.progression);
		var sections = next && next.sections ? next.sections : [];
		var section = findSection(sections, options.sectionId);
		var generatedMeasures = cloneJson(options.generatedMeasures || []);
		var length;
		var startIndex;

		if (!section) {
			return next;
		}

		length = section.length || generatedMeasures.length;
		startIndex = section.startIndex || 0;
		generatedMeasures = generatedMeasures.slice(0, length);
		while (generatedMeasures.length < length && generatedMeasures.length) {
			generatedMeasures.push(cloneJson(generatedMeasures[generatedMeasures.length - 1]));
		}
		if (!generatedMeasures.length) {
			return next;
		}

		clearModulationForTargetSection(next, options.sectionId);
		for (var i = 0; i < generatedMeasures.length; i++) {
			normalizeGeneratedSectionMeasure(generatedMeasures[i], (next.measures || [])[startIndex + i], section, startIndex, i);
		}

		next.measures = (next.measures || []).slice(0, startIndex)
			.concat(generatedMeasures)
			.concat((next.measures || []).slice(startIndex + length));
		updateSectionContext(section, options.targetReport, options.sectionState, generatedMeasures.length);

		return next;
	}

	function findSection(sections, sectionId) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (sections[i].id === sectionId) {
				return sections[i];
			}
		}

		return null;
	}

	function updateSectionContext(section, targetReport, sectionState, length) {
		section.circleOfFifths = targetReport && targetReport.circleOfFifths ? targetReport.circleOfFifths : null;
		section.contextLabel = targetReport ? targetReport.tonicName + ' ' + targetReport.scaleName : '';
		section.contextScaleIndex = targetReport ? targetReport.scaleIndex : null;
		section.contextScaleName = targetReport ? targetReport.scaleName : '';
		section.contextTonicName = targetReport ? targetReport.tonicName : '';
		section.length = length;
		section.state = cloneJson(sectionState || {});
		delete section.modulation;
	}

	function normalizeGeneratedSectionMeasure(measure, referenceMeasure, section, startIndex, sectionMeasureIndex) {
		var localStartBeat = Number(measure.startBeat) || 0;
		var localStartSeconds = Number(measure.startSeconds) || 0;

		measure.bar = referenceMeasure && referenceMeasure.bar != null ? referenceMeasure.bar : startIndex + sectionMeasureIndex + 1;
		measure.startBeat = referenceMeasure && referenceMeasure.startBeat != null ? referenceMeasure.startBeat : localStartBeat;
		measure.startSeconds = referenceMeasure && referenceMeasure.startSeconds != null ? referenceMeasure.startSeconds : localStartSeconds;
		timingService.copyTimingFields(measure, referenceMeasure, sectionTimingFields());
		measure.sectionId = section.id;
		measure.sectionLabelKey = section.labelKey;
		normalizeGeneratedMeasureChords(measure, referenceMeasure, localStartBeat, localStartSeconds);
	}

	function normalizeGeneratedMeasureChords(measure, referenceMeasure, localStartBeat, localStartSeconds) {
		var chords = measure.chords || [];
		var referenceChords = referenceMeasure && referenceMeasure.chords ? referenceMeasure.chords : [];

		for (var i = 0; i < chords.length; i++) {
			normalizeGeneratedMeasureChord(chords[i], referenceChords[i], measure, localStartBeat, localStartSeconds);
		}
	}

	function normalizeGeneratedMeasureChord(chord, referenceChord, parentMeasure, localStartBeat, localStartSeconds) {
		var localBeatOffset = (Number(chord.startBeat) || 0) - localStartBeat;
		var localSecondOffset = (Number(chord.startSeconds) || 0) - localStartSeconds;

		chord.bar = parentMeasure.bar;
		chord.startBeat = referenceChord && referenceChord.startBeat != null ? referenceChord.startBeat : parentMeasure.startBeat + localBeatOffset;
		chord.startSeconds = referenceChord && referenceChord.startSeconds != null ? referenceChord.startSeconds : parentMeasure.startSeconds + localSecondOffset;
		timingService.copyTimingFields(chord, referenceChord || parentMeasure, sectionTimingFields());
		chord.sectionId = parentMeasure.sectionId;
		chord.sectionLabelKey = parentMeasure.sectionLabelKey;
	}

	function sectionTimingFields() {
		return [
			'beatUnit',
			'beatsPerBar',
			'bpm',
			'durationBeats',
			'durationSeconds',
			'secondsPerBeat'
		];
	}

	function clearModulationForTargetSection(progression, sectionId) {
		var sections = progression && progression.sections ? progression.sections : [];
		var originIds = {};

		for (var i = 0; i < sections.length; i++) {
			if (sections[i].modulation && sections[i].modulation.targetSectionId === sectionId) {
				originIds[sections[i].modulation.originSectionId] = true;
				delete sections[i].modulation;
			}
		}

		for (var j = 0; j < sections.length; j++) {
			if (originIds[sections[j].id] || sections[j].id === sectionId) {
				clearModulationFieldsForSection(progression.measures || [], sections[j]);
			}
		}
	}

	function clearModulationFieldsForSection(measures, section) {
		var start = section.startIndex || 0;
		var end = start + (section.length || 0);

		for (var i = start; i < end && i < measures.length; i++) {
			clearModulationFields(measures[i]);
		}
	}

	function clearModulationFields(measure) {
		var fields = [
			'modulationKind',
			'modulationRole',
			'modulationSourceLabelKey',
			'pivotOriginDegree',
			'pivotTargetDegree',
			'pivotTargetScaleIndex',
			'pivotTargetScaleName',
			'pivotTargetTonicName',
			'sourceLabelKey',
			'targetScaleIndex',
			'targetTonicName'
		];

		for (var i = 0; i < fields.length; i++) {
			delete measure[fields[i]];
		}

		if (measure.chords && measure.chords.length) {
			for (var j = 0; j < measure.chords.length; j++) {
				clearModulationFields(measure.chords[j]);
			}
		}
	}

	function cloneJson(value) {
		return value == null ? null : JSON.parse(JSON.stringify(value));
	}

	global.CodaProgressionSectionRetarget = {
		replaceContext: replaceContext
	};
})(window);
