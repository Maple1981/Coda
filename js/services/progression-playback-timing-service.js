// Playback timing helpers for scheduled progression events.
(function (global) {
	'use strict';

	var arpeggioPatterns = global.CodaProgressionArpeggioPatterns;

	function normalizeStartIndex(startIndex, progression) {
		var measures = progression && progression.measures ? progression.measures : [];
		var numericIndex = parseInt(startIndex, 10);

		if (!measures.length || isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(measures.length - 1, numericIndex));
	}

	function notesForVoices(notes, voices) {
		var voiceCount = Math.max(1, Math.min(Number(voices) || 4, 6));

		return (notes || []).slice(0, voiceCount);
	}

	function playbackDuration(measure) {
		var duration = Number(measure && measure.durationSeconds) || 0;
		var factor = articulationDurationFactor(measure ? measure.articulation : null);

		return Math.max(0.1, duration * factor);
	}

	function articulationDurationFactor(articulation) {
		if (articulation === 'staccato') {
			return 0.45;
		}

		if (isArpeggioArticulation(articulation)) {
			return 0.9;
		}

		return 0.95;
	}

	function arpeggioStepSeconds(measure) {
		var duration = Number(measure && measure.durationSeconds) || 0;

		return Math.max(0.05, Math.min(0.18, duration / 8));
	}

	function arpeggioPattern(articulation) {
		return arpeggioPatterns.pattern(articulation);
	}

	function arpeggioOrderIndexes(noteCount, articulation, seed) {
		return arpeggioPatterns.orderIndexes(noteCount, articulation, seed);
	}

	function isArpeggioArticulation(articulation) {
		return String(articulation || '').indexOf('arpeggio') === 0;
	}

	function playbackTotalSeconds(progression, scheduledMeasures) {
		var lastMeasure;

		if (!scheduledMeasures.length) {
			return 0;
		}

		lastMeasure = scheduledMeasures[scheduledMeasures.length - 1].measure;

		return scheduledMeasures[scheduledMeasures.length - 1].delay + (Number(lastMeasure.durationSeconds) || 0);
	}

	global.CodaProgressionPlaybackTiming = {
		arpeggioOrderIndexes: arpeggioOrderIndexes,
		arpeggioPattern: arpeggioPattern,
		arpeggioStepSeconds: arpeggioStepSeconds,
		articulationDurationFactor: articulationDurationFactor,
		isArpeggioArticulation: isArpeggioArticulation,
		normalizeStartIndex: normalizeStartIndex,
		notesForVoices: notesForVoices,
		playbackDuration: playbackDuration,
		playbackTotalSeconds: playbackTotalSeconds
	};
})(window);
