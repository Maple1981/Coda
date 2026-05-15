// Central command dispatcher for editable progression operations.
(function (global) {
	'use strict';

	var documentService = global.CodaProgressionDocument;
	var editingService = global.CodaProgressionEditing;

	var commandTypes = {
		addMeasureChord: 'addMeasureChord',
		generateSectionB: 'generateSectionB',
		generateSection: 'generateSection',
		removeMeasureChord: 'removeMeasureChord',
		reorderMeasureChords: 'reorderMeasureChords',
		reorderMeasures: 'reorderMeasures',
		replaceMeasureChord: 'replaceMeasureChord'
	};

	function apply(command, context) {
		var nextProgression;

		command = command || {};
		context = context || {};

		switch (command.type) {
		case commandTypes.addMeasureChord:
			nextProgression = editingService.addMeasureChord(context.progression, command.measureIndex, command.options, context.dependencies);
			break;
		case commandTypes.removeMeasureChord:
			nextProgression = editingService.removeMeasureChord(context.progression, command.measureIndex, command.chordIndex);
			break;
		case commandTypes.reorderMeasureChords:
			nextProgression = editingService.reorderMeasureChords(context.progression, command.measureIndex, command.fromChordIndex, command.toChordIndex);
			break;
		case commandTypes.reorderMeasures:
			nextProgression = editingService.reorderMeasures(context.progression, command.fromIndex, command.toIndex);
			break;
		case commandTypes.replaceMeasureChord:
			nextProgression = editingService.replaceMeasureChord(context.progression, command.measureIndex, command.chordIndex, command.replacement, command.options, context.dependencies);
			break;
		case commandTypes.generateSectionB:
			nextProgression = typeof context.generateSectionB === 'function' ? context.generateSectionB(command.options || {}) : context.progression;
			break;
		case commandTypes.generateSection:
			nextProgression = typeof context.generateSection === 'function' ? context.generateSection(command.options || {}) : context.progression;
			break;
		default:
			nextProgression = context.progression;
			break;
		}

		return nextProgression === context.progression ? context.progression : markUserEdited(nextProgression);
	}

	function markUserEdited(progression) {
		return documentService && typeof documentService.markUserEdited === 'function' ?
			documentService.markUserEdited(progression) :
			fallbackMarkUserEdited(progression);
	}

	function fallbackMarkUserEdited(progression) {
		var next;

		if (!progression) {
			return progression;
		}

		next = JSON.parse(JSON.stringify(progression));
		next.userEdited = true;
		return next;
	}

	global.CodaProgressionEditCommands = {
		apply: apply,
		types: commandTypes
	};
})(window);
