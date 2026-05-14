// Builds replacement chord segments for the progression chord menu.
(function (global) {
	'use strict';

	var measureContext = global.CodaProgressionMeasureContext;
	var segmentBuilder = global.CodaProgressionSegmentBuilder;

	function buildSegment(options) {
		var report = options.report || {};
		var scaleChords = report.scaleChords || [];
		var scaleNotes = report.scaleNotes || [];
		var degreeIndex = parseInt(options.replacement.degreeIndex, 10);
		var resolvedDegree;
		var chordPlan;
		var previousPlan;

		if (isNaN(degreeIndex) || !scaleChords[degreeIndex]) {
			return null;
		}

		resolvedDegree = {
			chord: scaleChords[degreeIndex],
			degree: scaleNotes[degreeIndex] ? scaleNotes[degreeIndex].grado : '',
			degreeIndex: degreeIndex,
			source: 'diatonic'
		};
		previousPlan = measureContext.previousSegmentPlan(options.progression, options.measure.bar, options.chordIndex);
		chordPlan = options.buildChordPlan({
			index: 1,
			options: {
				forceInversionIndex: parseInt(options.replacement.inversionIndex, 10) || 0,
				forceKind: options.replacement.kind === 'seventh' ? 'seventh' : 'triad',
				includeTensions: false,
				initialMidiNote: options.data && options.data.midi ? options.data.midi.initialMidiNote : 60,
				preventSuspension: true,
				scaleDefinition: report.scaleDefinition,
				scaleNotes: scaleNotes
			},
			previousPlan: previousPlan,
			progressionState: options.progressionState,
			resolvedDegree: resolvedDegree,
			resolvedDegrees: [
				measureContext.resolvedDegreeFromMeasure(options.segment, report) || resolvedDegree,
				resolvedDegree,
				measureContext.resolvedDegreeFromMeasure(options.nextMeasure, report) || resolvedDegree
			]
		});

		return segmentBuilder.fromPlan(options.segment, {
			chordPlan: chordPlan,
			reportScaleDefinition: report.scaleDefinition,
			resolvedDegree: resolvedDegree
		}, {
			chordIndex: options.chordIndex,
			durationBeats: Number(options.segment.durationBeats) || Number(options.measure.durationBeats) || 4,
			durationSeconds: Number(options.segment.durationSeconds) || Number(options.measure.durationSeconds) || 0,
			startBeat: Number(options.segment.startBeat) || Number(options.measure.startBeat) || 0,
			startSeconds: Number(options.segment.startSeconds) || Number(options.measure.startSeconds) || 0
		});
	}

	function buildSilenceSegment(segment, measure, chordIndex) {
		return {
			articulation: measure.articulation,
			bar: measure.bar,
			beatUnit: measure.beatUnit,
			chord: null,
			chordIndex: chordIndex,
			chordKind: 'silence',
			chordName: '',
			degree: '',
			displayName: '',
			durationBeats: Number(segment.durationBeats) || Number(measure.durationBeats) || 4,
			durationSeconds: Number(segment.durationSeconds) || Number(measure.durationSeconds) || 0,
			endBeat: Number(segment.endBeat) || (Number(segment.startBeat) || Number(measure.startBeat) || 0) + (Number(segment.durationBeats) || Number(measure.durationBeats) || 4),
			endSeconds: Number(segment.endSeconds) || (Number(segment.startSeconds) || Number(measure.startSeconds) || 0) + (Number(segment.durationSeconds) || Number(measure.durationSeconds) || 0),
			inversion: '',
			inversionIndex: 0,
			isSilence: true,
			midiNotes: [],
			notes: [],
			source: 'silence',
			startBeat: Number(segment.startBeat) || Number(measure.startBeat) || 0,
			startSeconds: Number(segment.startSeconds) || Number(measure.startSeconds) || 0,
			suspension: '',
			tonalFunction: '',
			voiceNotes: [],
			voices: measure.voices
		};
	}

	global.CodaProgressionReplacementChord = {
		buildSegment: buildSegment,
		buildSilenceSegment: buildSilenceSegment
	};
})(window);
