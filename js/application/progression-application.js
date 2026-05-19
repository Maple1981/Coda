// Application use cases for harmonic progressions.
(function (global) {
	'use strict';

	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var formattingService = global.CodaProgressionFormatting;
	var editCommands = global.CodaProgressionEditCommands;
	var chordPlanService = global.CodaProgressionChordPlan;
	var chordMenuService = global.CodaProgressionChordMenu;
	var stateNormalizer = global.CodaProgressionStateNormalizer;
	var midiFileService = global.CodaProgressionMidiFile;
	var progressionBuilder = global.CodaProgressionBuilder;
	var progressionRevoice = global.CodaProgressionRevoice;
	var sectionContrastService = global.CodaProgressionSectionContrast;

	function buildProgressionFromDegrees(options) {
		return progressionBuilder.fromDegrees(options);
	}

	function buildProgressionFromState(options) {
		return progressionBuilder.fromState(options);
	}

	function generateProgressionFromState(options) {
		return progressionBuilder.generate(options);
	}

	function generateContrastingProgressionSection(options) {
		options = options || {};

		return editCommands.apply({
			options: options,
			type: editCommands.types.generateSectionB
		}, {
			generateSectionB: function (commandOptions) {
				return sectionContrastService.generate(commandOptions, {
					buildScaleReport: global.CodaApplication.buildScaleReport,
					generateProgressionFromState: generateProgressionFromState,
					rebuildProgressionTimeline: rebuildProgressionTimeline
				});
			},
			progression: options.progression
		});
	}

	function generateProgressionSection(options) {
		options = options || {};

		return editCommands.apply({
			options: options,
			type: editCommands.types.generateSection
		}, {
			generateSection: function (commandOptions) {
				return sectionContrastService.generateSection(commandOptions, {
					buildScaleReport: global.CodaApplication.buildScaleReport,
					generateProgressionFromState: generateProgressionFromState,
					rebuildProgressionTimeline: rebuildProgressionTimeline
				});
			},
			progression: options.progression
		});
	}

	function buildProgressionMidiFile(options) {
		return midiFileService.build(options);
	}

	function reorderProgressionMeasures(progression, fromIndex, toIndex) {
		return editCommands.apply({
			fromIndex: fromIndex,
			toIndex: toIndex,
			type: editCommands.types.reorderMeasures
		}, {
			progression: progression
		});
	}

	function reorderProgressionMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex) {
		return editCommands.apply({
			fromChordIndex: fromChordIndex,
			measureIndex: measureIndex,
			toChordIndex: toChordIndex,
			type: editCommands.types.reorderMeasureChords
		}, {
			progression: progression
		});
	}

	function addProgressionMeasureChord(progression, measureIndex, options) {
		return editCommands.apply({
			measureIndex: measureIndex,
			options: options,
			type: editCommands.types.addMeasureChord
		}, {
			dependencies: {
				buildChordPlan: buildChordPlan,
				normalizeProgressionState: normalizeProgressionState
			},
			progression: progression
		});
	}

	function removeProgressionMeasureChord(progression, measureIndex, chordIndex) {
		return editCommands.apply({
			chordIndex: chordIndex,
			measureIndex: measureIndex,
			type: editCommands.types.removeMeasureChord
		}, {
			progression: progression
		});
	}

	function removeProgressionSection(progression, sectionId) {
		return editCommands.apply({
			sectionId: sectionId,
			type: editCommands.types.removeSection
		}, {
			progression: progression
		});
	}

	function replaceProgressionMeasureChord(progression, measureIndex, chordIndex, replacement, options) {
		return editCommands.apply({
			chordIndex: chordIndex,
			measureIndex: measureIndex,
			options: options,
			replacement: replacement,
			type: editCommands.types.replaceMeasureChord
		}, {
			dependencies: {
				buildChordPlan: buildChordPlan,
				normalizeProgressionState: normalizeProgressionState
			},
			progression: progression
		});
	}

	function rebuildProgressionTimeline(progression, measures) {
		return measureTimelineService.rebuildTimeline(progression, measures);
	}

	function revoiceProgression(progression, options) {
		return progressionRevoice.apply(progression, options || {});
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
	global.CodaApplication.generateContrastingProgressionSection = generateContrastingProgressionSection;
	global.CodaApplication.generateProgressionSection = generateProgressionSection;
	global.CodaApplication.formatProgressionDegreeForChord = formatDegreeForChord;
	global.CodaApplication.rebuildProgressionTimeline = rebuildProgressionTimeline;
	global.CodaApplication.revoiceProgression = revoiceProgression;
	global.CodaApplication.removeProgressionMeasureChord = removeProgressionMeasureChord;
	global.CodaApplication.removeProgressionSection = removeProgressionSection;
	global.CodaApplication.replaceProgressionMeasureChord = replaceProgressionMeasureChord;
	global.CodaApplication.reorderProgressionMeasureChords = reorderProgressionMeasureChords;
	global.CodaApplication.reorderProgressionMeasures = reorderProgressionMeasures;
})(window);
