// Application use cases for harmonic progressions.
(function (global) {
	'use strict';

	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var formattingService = global.CodaProgressionFormatting;
	var editingService = global.CodaProgressionEditing;
	var chordPlanService = global.CodaProgressionChordPlan;
	var chordMenuService = global.CodaProgressionChordMenu;
	var stateNormalizer = global.CodaProgressionStateNormalizer;
	var midiFileService = global.CodaProgressionMidiFile;
	var progressionBuilder = global.CodaProgressionBuilder;

	function buildProgressionFromDegrees(options) {
		return progressionBuilder.fromDegrees(options);
	}

	function buildProgressionFromState(options) {
		return progressionBuilder.fromState(options);
	}

	function generateProgressionFromState(options) {
		return progressionBuilder.generate(options);
	}

	function buildProgressionMidiFile(options) {
		return midiFileService.build(options);
	}

	function reorderProgressionMeasures(progression, fromIndex, toIndex) {
		return editingService.reorderMeasures(progression, fromIndex, toIndex);
	}

	function reorderProgressionMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex) {
		return editingService.reorderMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex);
	}

	function addProgressionMeasureChord(progression, measureIndex, options) {
		return editingService.addMeasureChord(progression, measureIndex, options, {
			buildChordPlan: buildChordPlan,
			normalizeProgressionState: normalizeProgressionState
		});
	}

	function removeProgressionMeasureChord(progression, measureIndex, chordIndex) {
		return editingService.removeMeasureChord(progression, measureIndex, chordIndex);
	}

	function replaceProgressionMeasureChord(progression, measureIndex, chordIndex, replacement, options) {
		return editingService.replaceMeasureChord(progression, measureIndex, chordIndex, replacement, options, {
			buildChordPlan: buildChordPlan,
			normalizeProgressionState: normalizeProgressionState
		});
	}

	function rebuildProgressionTimeline(progression, measures) {
		return measureTimelineService.rebuildTimeline(progression, measures);
	}

	function buildProgressionChordMenu(options) {
		return chordMenuService.build(options);
	}

	function buildChordPlan(context) {
		return chordPlanService.build(context);
	}

	function formatTriadDegreeForChord(degree, chordName) {
		return formattingService.formatTriadDegreeForChord(degree, chordName);
	}

	function formatDegreeForChord(degree, chordName) {
		return formattingService.formatDegreeForChord(degree, chordName);
	}

	function normalizeProgressionState(progressionState) {
		return stateNormalizer.normalize(progressionState);
	}

	global.CodaApplication = global.CodaApplication || {};
	global.CodaApplication.addProgressionMeasureChord = addProgressionMeasureChord;
	global.CodaApplication.buildProgressionChordMenu = buildProgressionChordMenu;
	global.CodaApplication.buildProgressionMidiFile = buildProgressionMidiFile;
	global.CodaApplication.buildProgressionFromDegrees = buildProgressionFromDegrees;
	global.CodaApplication.buildProgressionFromState = buildProgressionFromState;
	global.CodaApplication.generateProgressionFromState = generateProgressionFromState;
	global.CodaApplication.formatProgressionDegreeForChord = formatDegreeForChord;
	global.CodaApplication.rebuildProgressionTimeline = rebuildProgressionTimeline;
	global.CodaApplication.removeProgressionMeasureChord = removeProgressionMeasureChord;
	global.CodaApplication.replaceProgressionMeasureChord = replaceProgressionMeasureChord;
	global.CodaApplication.reorderProgressionMeasureChords = reorderProgressionMeasureChords;
	global.CodaApplication.reorderProgressionMeasures = reorderProgressionMeasures;
})(window);
