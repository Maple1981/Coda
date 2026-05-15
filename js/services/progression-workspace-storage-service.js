// Local persistence for the current progression workspace.
(function (global) {
	'use strict';

	var storageKey = 'coda_progression_workspace';
	var version = 1;

	function read() {
		var storage = storageProvider();
		var parsed;

		if (!storage) {
			return null;
		}

		try {
			parsed = JSON.parse(storage.getItem(storageKey) || 'null');
		} catch (error) {
			return null;
		}

		return isValidWorkspace(parsed) ? parsed : null;
	}

	function write(workspace) {
		var storage = storageProvider();
		var normalized = sanitizeWorkspace(workspace);

		if (!storage || !normalized) {
			return false;
		}

		try {
			storage.setItem(storageKey, JSON.stringify(normalized));
			return true;
		} catch (error) {
			return false;
		}
	}

	function clear() {
		var storage = storageProvider();

		if (!storage) {
			return;
		}

		try {
			storage.removeItem(storageKey);
		} catch (error) {
			return;
		}
	}

	function buildWorkspace(options) {
		options = options || {};

		return sanitizeWorkspace({
			progression: options.progression,
			progressionState: options.progressionState,
			selectedTuningIndex: options.selectedTuningIndex,
			signature: contextSignature(options.selection),
			updatedAt: new Date().toISOString(),
			version: version
		});
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

	function sanitizeWorkspace(workspace) {
		if (!workspace || !workspace.progression || !workspace.progressionState || !workspace.signature) {
			return null;
		}

		return {
			progression: cloneJson(workspace.progression),
			progressionState: cloneJson(workspace.progressionState),
			selectedTuningIndex: normalizeTuningIndex(workspace.selectedTuningIndex),
			signature: String(workspace.signature),
			updatedAt: workspace.updatedAt || new Date().toISOString(),
			version: version
		};
	}

	function isValidWorkspace(workspace) {
		return !!(
			workspace &&
			Number(workspace.version) === version &&
			workspace.signature &&
			workspace.progression &&
			workspace.progressionState &&
			workspace.progression.measures &&
			workspace.progression.measures.length
		);
	}

	function normalizeTuningIndex(value) {
		var numericValue = Number(value);

		return isFinite(numericValue) && numericValue >= 0 ? numericValue : 0;
	}

	function cloneJson(value) {
		return value == null ? null : JSON.parse(JSON.stringify(value));
	}

	function storageProvider() {
		try {
			return global.localStorage || null;
		} catch (error) {
			return null;
		}
	}

	global.CodaProgressionWorkspaceStorage = {
		buildWorkspace: buildWorkspace,
		clear: clear,
		contextSignature: contextSignature,
		matchesSelection: matchesSelection,
		read: read,
		write: write
	};
})(window);
