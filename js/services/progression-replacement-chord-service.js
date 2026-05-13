// Builds replacement chord segments for the progression chord menu.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
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
		previousPlan = previousSegmentPlan(options.progression, options.measure.bar, options.chordIndex);
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
				resolvedDegreeFromMeasure(options.segment, report) || resolvedDegree,
				resolvedDegree,
				resolvedDegreeFromMeasure(options.nextMeasure, report) || resolvedDegree
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

	function previousSegmentPlan(progression, bar, chordIndex) {
		var measures = progression && progression.measures ? progression.measures : [];
		var measureIndex = Math.max(0, (Number(bar) || 1) - 1);
		var currentMeasure = measures[measureIndex];
		var previousMeasure;

		if (chordIndex > 0 && currentMeasure && currentMeasure.chords && currentMeasure.chords[chordIndex - 1]) {
			return measurePlan(currentMeasure.chords[chordIndex - 1]);
		}

		previousMeasure = measures[measureIndex - 1];
		if (!previousMeasure) {
			return null;
		}

		if (previousMeasure.chords && previousMeasure.chords.length) {
			return measurePlan(previousMeasure.chords[previousMeasure.chords.length - 1]);
		}

		return measurePlan(previousMeasure);
	}

	function measurePlan(measure) {
		if (!measure) {
			return null;
		}

		return {
			midiNotes: measure.midiNotes || [],
			notes: measure.notes || [],
			voiceNotes: measure.voiceNotes || []
		};
	}

	function resolvedDegreeFromMeasure(measure, report) {
		var scaleChords = report && report.scaleChords ? report.scaleChords : [];
		var parallelChords = report && report.parallelScaleChords ? report.parallelScaleChords : [];
		var scaleNotes = report && report.scaleNotes ? report.scaleNotes : [];
		var chordName = measure ? measure.chordName : '';

		if (!measure) {
			return null;
		}

		for (var i = 0; i < scaleChords.length; i++) {
			if (scaleChords[i] === measure.chord || formattingService.triadName(scaleChords[i]) === chordName || scaleChords[i].nombre === chordName) {
				return {
					chord: scaleChords[i],
					degree: scaleNotes[i] ? scaleNotes[i].grado : '',
					degreeIndex: i,
					source: measure.source || 'diatonic'
				};
			}
		}

		for (var j = 0; j < parallelChords.length; j++) {
			if (parallelChords[j] === measure.chord || formattingService.triadName(parallelChords[j]) === chordName || parallelChords[j].nombre === chordName) {
				return {
					chord: parallelChords[j],
					degree: scaleNotes[j] ? scaleNotes[j].grado : '',
					degreeIndex: j,
					source: measure.source || 'parallel'
				};
			}
		}

		return null;
	}

	global.CodaProgressionReplacementChord = {
		buildSegment: buildSegment
	};
})(window);
