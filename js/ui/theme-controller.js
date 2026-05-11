// Alternancia de tema visual y persistencia de preferencia local.
(function (global) {
	'use strict';

	function initialize(options) {
		var preferences = options.preferences;
		var i18n = options.i18n;
		var doc = global.document;
		var button = doc ? doc.getElementById('themeToggleButton') : null;
		var theme = normalizeTheme(options.initialTheme);

		applyTheme(theme);

		if (!button) {
			return;
		}

		updateButton(i18n, theme);

		button.addEventListener('click', function () {
			theme = theme === 'day' ? 'night' : 'day';
			applyTheme(theme);
			updateButton(i18n, theme);

			if (preferences && typeof preferences.setValue === 'function') {
				preferences.setValue('theme', theme);
			}
		});
	}

	function applyTheme(theme) {
		if (global.document && global.document.body) {
			global.document.body.setAttribute('data-theme', normalizeTheme(theme));
		}
	}

	function updateButton(i18n, theme) {
		var doc = global.document;
		var button = doc ? doc.getElementById('themeToggleButton') : null;
		var icon;
		var labelKey = theme === 'day' ? 'theme.switchToNight' : 'theme.switchToDay';

		if (!button) {
			return;
		}

		icon = button.querySelector('.material-icons');

		if (icon) {
			icon.textContent = theme === 'day' ? 'dark_mode' : 'light_mode';
		}

		button.setAttribute('title', translate(i18n, labelKey));
		button.setAttribute('aria-label', translate(i18n, labelKey));
		button.setAttribute('aria-pressed', theme === 'day' ? 'true' : 'false');
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
