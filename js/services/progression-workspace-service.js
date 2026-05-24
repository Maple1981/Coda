// Canonical shape and validation for the persisted progression workspace.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;
	var workspaceVersion = 1;
	var progressionDocument = global.CodaProgressionDocument;

	function build(options) {
		options = options || {};

		return sanitize({
			progression: options.progression,
			progressionState: options.progressionState,
			selectedTuningIndex: options.selectedTuningIndex,
			signature: contextSignature(options.selection),
			updatedAt: new Date().toISOString(),
			version: workspaceVersion
		});
	}

	function sanitize(workspace) {
		if (!workspace || !workspace.progression || !workspace.progressionState || !workspace.signature) {
			return null;
		}

		return {
			progression: progressionDocument && typeof progressionDocument.normalize === 'function' ?
				progressionDocument.normalize(workspace.progression) :
				cloneJson(workspace.progression),
			progressionState: cloneJson(workspace.progressionState),
			selectedTuningIndex: normalizeTuningIndex(workspace.selectedTuningIndex),
			signature: String(workspace.signature),
			updatedAt: workspace.updatedAt || new Date().toISOString(),
			version: workspaceVersion
		};
	}

	function migrate(workspace) {
		if (!workspace) {
			return null;
		}

		if (Number(workspace.version) === workspaceVersion) {
			return sanitize(workspace);
		}

		return null;
	}

	function isValid(workspace) {
		return !!(
			workspace &&
			Number(workspace.version) === workspaceVersion &&
			workspace.signature &&
			workspace.progression &&
			workspace.progressionState &&
			workspace.progression.measures &&
			workspace.progression.measures.length
		);
	}

	function matchesSelection(workspace, selection) {
		return !!(workspace && workspace.signature && workspace.signature === contextSignature(selection));
	}

	function contextSignature(selection) {
		selection = selection || {};

		return [
			selection.tonicIndex != null ? selection.tonicIndex : '',
			selection.scaleIndex != null ? selection.scaleIndex : '',
			selection.format != null ? selection.format : formatFromPreference(selection.preferFlats)
		].join('|');
	}

	function formatFromPreference(preferFlats) {
		if (preferFlats === true) {
			return '1';
		}

		if (preferFlats === false) {
			return '0';
		}

		return '';
	}

	function normalizeTuningIndex(value) {
		var numericValue = Number(value);

		return isFinite(numericValue) && numericValue >= 0 ? numericValue : 0;
	}

	function cloneJson(value) {
		return objectService.cloneJson(value);
	}

	global.CodaProgressionWorkspace = {
		build: build,
		contextSignature: contextSignature,
		isValid: isValid,
		matchesSelection: matchesSelection,
		migrate: migrate,
		sanitize: sanitize,
		version: workspaceVersion
	};
})(window);
