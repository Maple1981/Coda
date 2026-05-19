// Facade for progression editing operations used by the UI and application layer.
(function (global) {
	'use strict';

	var measureChordAdditionService = global.CodaProgressionMeasureChordAddition;
	var measureChordReplacementService = global.CodaProgressionMeasureChordReplacement;
	var structureEditingService = global.CodaProgressionStructureEditing;

	function reorderMeasures(progression, fromIndex, toIndex) {
		return structureEditingService.reorderMeasures(progression, fromIndex, toIndex);
	}

	function reorderMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex) {
		return structureEditingService.reorderMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex);
	}

	function addMeasureChord(progression, measureIndex, options, dependencies) {
		return measureChordAdditionService.addMeasureChord(progression, measureIndex, options, dependencies);
	}

	function removeMeasureChord(progression, measureIndex, chordIndex) {
		return structureEditingService.removeMeasureChord(progression, measureIndex, chordIndex);
	}

	function removeSection(progression, sectionId) {
		return structureEditingService.removeSection(progression, sectionId);
	}

	function replaceMeasureChord(progression, measureIndex, chordIndex, replacement, options, dependencies) {
		return measureChordReplacementService.replaceMeasureChord(progression, measureIndex, chordIndex, replacement, options, dependencies);
	}

	global.CodaProgressionEditing = {
		addMeasureChord: addMeasureChord,
		removeMeasureChord: removeMeasureChord,
		removeSection: removeSection,
		reorderMeasureChords: reorderMeasureChords,
		reorderMeasures: reorderMeasures,
		replaceMeasureChord: replaceMeasureChord
	};
})(window);
