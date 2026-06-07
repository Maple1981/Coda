// Shared measure context lookups for progression chord editing.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;

	function measurePlan(measure) {
		if (!measure) {
			return null;
		}

		return {
			inversionIndex: measure.inversionIndex,
			inversionRunKey: measure.inversionRunKey,
			inversionRunLength: measure.inversionRunLength,
			midiNotes: measure.midiNotes || [],
			notes: measure.notes || [],
			voiceNotes: measure.voiceNotes || []
		};
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

	function resolvedDegreeFromMeasure(measure, report) {
		var scaleChords = report && report.scaleChords ? report.scaleChords : [];
		var parallelChords = report && report.parallelScaleChords ? report.parallelScaleChords : [];
		var scaleNotes = report && report.scaleNotes ? report.scaleNotes : [];
		var chordName = measure ? measure.chordName : '';

		if (!measure) {
			return null;
		}

		return findResolvedDegree(measure, chordName, scaleChords, scaleNotes, 'diatonic') ||
			findResolvedDegree(measure, chordName, parallelChords, scaleNotes, 'parallel');
	}

	function findResolvedDegree(measure, chordName, chords, scaleNotes, defaultSource) {
		for (var i = 0; i < chords.length; i++) {
			if (matchesMeasureChord(measure, chordName, chords[i])) {
				return {
					chord: chords[i],
					degree: scaleNotes[i] ? scaleNotes[i].grado : '',
					degreeIndex: i,
					source: measure.source || defaultSource
				};
			}
		}

		return null;
	}

	function matchesMeasureChord(measure, chordName, chord) {
		return chord === measure.chord || formattingService.triadName(chord) === chordName || chord.nombre === chordName;
	}

	global.CodaProgressionMeasureContext = {
		measurePlan: measurePlan,
		previousSegmentPlan: previousSegmentPlan,
		resolvedDegreeFromMeasure: resolvedDegreeFromMeasure
	};
})(window);
