// Local persistence for the current progression workspace.
(function (global) {
	'use strict';

	var storageKey = 'coda_progression_workspace';
	var workspaceService = global.CodaProgressionWorkspace;

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

		parsed = workspaceService && typeof workspaceService.migrate === 'function' ? workspaceService.migrate(parsed) : parsed;

		return workspaceService && workspaceService.isValid(parsed) ? parsed : null;
	}

	function write(workspace) {
		var storage = storageProvider();
		var normalized = workspaceService && typeof workspaceService.sanitize === 'function' ? workspaceService.sanitize(workspace) : null;

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
		return workspaceService && typeof workspaceService.build === 'function' ? workspaceService.build(options) : null;
	}

	function matchesSelection(workspace, selection) {
		return workspaceService && typeof workspaceService.matchesSelection === 'function' ?
			workspaceService.matchesSelection(workspace, selection) :
			false;
	}

	function contextSignature(selection) {
		return workspaceService && typeof workspaceService.contextSignature === 'function' ?
			workspaceService.contextSignature(selection) :
			'';
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
