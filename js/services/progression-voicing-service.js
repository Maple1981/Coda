// Fachada de voicing y conducción de voces para progresiones armónicas.
(function (global) {
	'use strict';

	var pitchService = global.CodaProgressionPitch;
	var voiceLeadingScoreService = global.CodaProgressionVoiceLeadingScore;
	var voicingDispositionService = global.CodaProgressionVoicingDisposition;
	var voicingSelectionService = global.CodaProgressionVoicingSelection;

	function chooseVoicing(options) {
		return voicingSelectionService.chooseVoicing(options);
	}

	function voiceLeadingTransitionScore(previousPlan, nextPlan) {
		return voiceLeadingScoreService.voiceLeadingTransitionScore(previousPlan, nextPlan);
	}

	function commonPitchNames(firstNotes, secondNotes) {
		return pitchService.commonPitchNames(firstNotes, secondNotes);
	}

	function countParallelPerfects(previousMidiNotes, nextMidiNotes, exteriorOnly) {
		return voiceLeadingScoreService.countParallelPerfects(previousMidiNotes, nextMidiNotes, exteriorOnly);
	}

	function firstVoicingScore(voicing) {
		return voiceLeadingScoreService.firstVoicingScore(voicing);
	}

	function noteNameToMidi(noteName, initialMidiNote) {
		return pitchService.noteNameToMidi(noteName, initialMidiNote);
	}

	function noteIndex(noteName) {
		return pitchService.noteIndex(noteName);
	}

	function normalizePitchName(noteName) {
		return pitchService.normalizePitchName(noteName);
	}

	function nearestMidiTo(referenceNote, midiNote) {
		return pitchService.nearestMidiTo(referenceNote, midiNote);
	}

	function upperVoiceSpan(midiNotes) {
		return voicingDispositionService.upperVoiceSpan(midiNotes);
	}

	function registerCenterMidi(options) {
		return voicingSelectionService.registerCenterMidi(options);
	}

	global.CodaProgressionVoicing = {
		chooseVoicing: chooseVoicing,
		commonPitchNames: commonPitchNames,
		countParallelPerfects: countParallelPerfects,
		firstVoicingScore: firstVoicingScore,
		nearestMidiTo: nearestMidiTo,
		normalizePitchName: normalizePitchName,
		noteIndex: noteIndex,
		noteNameToMidi: noteNameToMidi,
		registerCenterMidi: registerCenterMidi,
		upperVoiceSpan: upperVoiceSpan,
		voiceLeadingTransitionScore: voiceLeadingTransitionScore
	};
})(window);
