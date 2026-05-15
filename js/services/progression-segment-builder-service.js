// Builds and replaces measure segments from chord plans.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var tonalFunctionService = global.CodaProgressionTonalFunction;

	function fromPlan(measure, chordSelection, timing) {
		var resolvedDegree = chordSelection.resolvedDegree;
		var chordPlan = chordSelection.chordPlan;

		var segment = {
			articulation: measure.articulation,
			bar: measure.bar,
			beatUnit: measure.beatUnit,
			chord: resolvedDegree.chord,
			chordIndex: timing.chordIndex,
			chordKind: chordPlan.kind,
			chordName: chordPlan.chordName,
			degreeIndex: resolvedDegree.degreeIndex,
			degree: formattingService.displayDegree(chordPlan.degree, chordPlan.inversionLabel, chordPlan.suspension),
			displayName: formattingService.displayName(chordPlan.chordName, chordPlan.inversionLabel, chordPlan.suspension, chordPlan.tensionLabel),
			durationBeats: timing.durationBeats,
			durationSeconds: timing.durationSeconds,
			endBeat: timing.startBeat + timing.durationBeats,
			endSeconds: timing.startSeconds + timing.durationSeconds,
			inversion: chordPlan.inversionLabel,
			inversionIndex: chordPlan.inversionIndex,
			midiNotes: chordPlan.midiNotes,
			notes: chordPlan.notes,
			source: resolvedDegree.source || 'diatonic',
			startBeat: timing.startBeat,
			startSeconds: timing.startSeconds,
			suspension: chordPlan.suspension,
			tonalFunction: tonalFunctionForDegree(chordSelection.reportScaleDefinition, resolvedDegree.degreeIndex),
			voiceNotes: chordPlan.voiceNotes,
			voices: measure.voices
		};

		if (resolvedDegree.chromaticRole) {
			segment.chromaticRole = resolvedDegree.chromaticRole;
		}

		if (resolvedDegree.sourceLabelKey) {
			segment.sourceLabelKey = resolvedDegree.sourceLabelKey;
		}

		if (resolvedDegree.sourceScaleIndex != null) {
			segment.sourceScaleIndex = resolvedDegree.sourceScaleIndex;
			segment.sourceTonicName = resolvedDegree.sourceTonicName || '';
		}

		return segment;
	}

	function replaceSplitMeasureSegment(measure, chordIndex, segment) {
		var replacedMeasure = measureTimelineService.cloneMeasure(measure);
		var index = Math.min(chordIndex, replacedMeasure.chords.length - 1);

		replacedMeasure.chords[index] = segment;
		if (index === 0) {
			replacedMeasure = copySegmentToMeasure(replacedMeasure, segment);
		}

		return replacedMeasure;
	}

	function replaceWholeMeasure(measure, segment) {
		return copySegmentToMeasure(measureTimelineService.cloneMeasure(measure), segment);
	}

	function copySegmentToMeasure(measure, segment) {
		var keys = [
			'chord',
			'chordKind',
			'chordName',
			'chromaticRole',
			'degree',
			'degreeIndex',
			'displayName',
			'inversion',
			'inversionIndex',
			'isSilence',
			'midiNotes',
			'notes',
			'restorableChromaticRole',
			'restorableDegreeIndex',
			'restorableInversionIndex',
			'restorableKind',
			'restorableSource',
			'restorableSourceLabelKey',
			'restorableSourceScaleIndex',
			'source',
			'sourceLabelKey',
			'sourceScaleIndex',
			'sourceTonicName',
			'suspension',
			'tonalFunction',
			'voiceNotes',
			'voices'
		];

		for (var i = 0; i < keys.length; i++) {
			measure[keys[i]] = segment[keys[i]];
		}

		measure.pedalsIn = [];
		measure.pedalsOut = [];

		return measure;
	}

	function tonalFunctionForDegree(scaleDefinition, degreeIndex) {
		return tonalFunctionService.forDegree(scaleDefinition, degreeIndex);
	}

	global.CodaProgressionSegmentBuilder = {
		copySegmentToMeasure: copySegmentToMeasure,
		fromPlan: fromPlan,
		replaceSplitMeasureSegment: replaceSplitMeasureSegment,
		replaceWholeMeasure: replaceWholeMeasure,
		tonalFunctionForDegree: tonalFunctionForDegree
	};
})(window);
