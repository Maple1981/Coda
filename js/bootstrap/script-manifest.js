// Canonical browser script order for Coda application modules. Keep this list
// aligned with index.html until a bundler or module loader replaces script tags.
(function (global) {
	'use strict';

	global.CodaScriptManifest = {
		applicationScripts: [
			'js/data/constants-data.js',
			'js/data/midi-data.js',
			'js/data/notes-data.js',
			'js/data/intervals-data.js',
			'js/data/scales-data.js',
			'js/data/chords-data.js',
			'js/data/guitar-tunings-data.js',
			'js/data/circle-of-fifths-data.js',
			'js/data/extended-harmony-data.js',
			'js/content/changelog-content.js',
			'js/content/welcome-content.js',
			'js/data.js',
			'js/services/data-index-service.js',
			'js/i18n/translations.js',
			'js/i18n/i18n-service.js',
			'js/services/musical-context-service.js',
			'js/services/notation-service.js',
			'js/services/preferences-service.js',
			'js/domain/music-utils.js',
			'js/domain/scale-domain.js',
			'js/domain/chord-domain.js',
			'js/domain/extended-harmony-domain.js',
			'js/domain/circle-of-fifths-domain.js',
			'js/domain/instrument-domain.js',
			'js/domain/progression-domain.js',
			'js/domain/music-domain.js',
			'js/application/scale-report-application.js',
			'js/application/chord-playback-application.js',
			'js/application/progression-application.js',
			'js/renderers/scale-summary-renderer.js',
			'js/renderers/scale-chords-renderer.js',
			'js/renderers/extended-harmony-renderer.js',
			'js/renderers/instrument-renderer.js',
			'js/renderers/circle-of-fifths-renderer.js',
			'js/renderers/changelog-renderer.js',
			'js/renderers/welcome-renderer.js',
			'js/renderers/progression-workbench-renderer.js',
			'js/ui/ui-state.js',
			'js/ui/key-navigation-controller.js',
			'js/ui/changelog-dialog-controller.js',
			'js/ui/scale-report-ui.js',
			'js/ui/scale-report-controller.js',
			'js/services/playback-service.js',
			'js/bootstrap/coda-bootstrap.js',
			'js/app.js'
		]
	};
})(window);
