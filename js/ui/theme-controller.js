// Alternancia de tema visual y persistencia de preferencia local.
(function (global) {
	'use strict';

	function initialize(options) {
		var $ = options.$;
		var preferences = options.preferences;
		var i18n = options.i18n;
		var button = $('#themeToggleButton');
		var theme = normalizeTheme(options.initialTheme);

		applyTheme($, theme);

		if (!button.length) {
			return;
		}

		updateButton($, i18n, theme);

		button.on('click', function () {
			theme = theme === 'day' ? 'night' : 'day';
			applyTheme($, theme);
			updateButton($, i18n, theme);

			if (preferences && typeof preferences.setValue === 'function') {
				preferences.setValue('theme', theme);
			}
		});
	}

	function applyTheme($, theme) {
		$('body').attr('data-theme', normalizeTheme(theme));
	}

	function updateButton($, i18n, theme) {
		var button = $('#themeToggleButton');
		var icon = button.find('.material-icons');
		var labelKey = theme === 'day' ? 'theme.switchToNight' : 'theme.switchToDay';

		icon.text(theme === 'day' ? 'dark_mode' : 'light_mode');
		button.attr('title', translate(i18n, labelKey));
		button.attr('aria-label', translate(i18n, labelKey));
		button.attr('aria-pressed', theme === 'day' ? 'true' : 'false');
	}

	function normalizeTheme(theme) {
		return theme === 'day' ? 'day' : 'night';
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	global.CodaThemeControl = {
		applyTheme: applyTheme,
		initialize: initialize,
		normalizeTheme: normalizeTheme,
		updateButton: updateButton
	};
})(window);
