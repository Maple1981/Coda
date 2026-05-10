// Canonical browser script order for Coda application modules. Keep this list
// aligned with index.html until a bundler or module loader replaces script tags.
(function (global) {
	'use strict';

	global.CodaScriptManifest = {
		applicationScripts: [
			'js/data.js',
			'js/i18n/translations.js',
			'js/i18n/i18n-service.js',
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
			'js/ui/scale-report-ui.js',
			'js/ui/scale-report-controller.js',
			'js/services/playback-service.js',
			'js/bootstrap/coda-bootstrap.js',
			'js/app.js'
		]
	};
})(window);
