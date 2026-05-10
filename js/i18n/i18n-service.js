// Lightweight frontend i18n service for static UI and renderer labels.
(function (global) {
	'use strict';

	function create(options) {
		var translations = options.translations || {};
		var currentLanguage = normalizeLanguage(options.initialLanguage, translations);

		function t(key, values) {
			var dictionary = translations[currentLanguage] || translations.es || {};
			var fallback = translations.es || {};
			var text = dictionary[key] != null ? dictionary[key] : fallback[key];

			if (text == null) {
				return key;
			}

			if (!values) {
				return text;
			}

			return text.replace(/\{([^}]+)\}/g, function (match, name) {
				return values[name] != null ? values[name] : match;
			});
		}

		function setLanguage(language) {
			currentLanguage = normalizeLanguage(language, translations);
		}

		function getLanguage() {
			return currentLanguage;
		}

		function dataLabel(collectionName, index, fallback) {
			var key = 'data.' + collectionName + '.' + index;
			var text = t(key);

			return text === key ? fallback : text;
		}

		return {
			dataLabel: dataLabel,
			getLanguage: getLanguage,
			setLanguage: setLanguage,
			t: t
		};
	}

	function normalizeLanguage(language, translations) {
		if (translations[language]) {
			return language;
		}

		return 'es';
	}

	global.CodaI18n = {
		create: create
	};
})(window);
