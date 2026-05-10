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

		function applyStatic($) {
			$('html').attr('lang', currentLanguage === 'en' ? 'en' : 'es-ES');
			$('meta[name="description"]').attr('content', t('meta.description'));
			$('#selectorIdioma').val(currentLanguage);

			setText($, '#appHeader h2', 'app.subtitle');
			setText($, '.appHeader__actions label span', 'ui.language');
			setAttribute($, '.settingsButton', 'title', 'settings.label');
			setAttribute($, '.settingsButton', 'aria-label', 'settings.label');

			setText($, '#interface h3', 'form.title');
			setText($, 'span[data-i18n="form.tonic"]', 'form.tonic');
			setText($, 'span[data-i18n="form.scale"]', 'form.scale');
			setText($, 'span[data-i18n="form.format"]', 'form.format');
			setText($, 'span[data-i18n="form.sharps"]', 'form.sharps');
			setText($, 'span[data-i18n="form.flats"]', 'form.flats');
			setText($, 'span[data-i18n="form.instrument"]', 'form.instrument');
			setText($, 'span[data-i18n="form.piano"]', 'form.piano');
			setText($, 'span[data-i18n="form.guitar"]', 'form.guitar');
			setValue($, '#btnEscala', 'form.submit');

			setText($, '.workbenchKicker', 'progression.subtitle');
			setText($, '.workbenchHeader h2', 'progression.title');
			setAttribute($, '.progressionTimeline', 'aria-label', 'progression.aria');
			applyProgressionLabels($);
			applyWelcome($);
			applyChangelog($);
			applyFooter($);
		}

		function setText($, selector, key) {
			$(selector).text(t(key));
		}

		function setHtml($, selector, key) {
			$(selector).html(t(key));
		}

		function setValue($, selector, key) {
			$(selector).val(t(key));
		}

		function setAttribute($, selector, attribute, key) {
			$(selector).attr(attribute, t(key));
		}

		function applyProgressionLabels($) {
			setText($, 'span[data-i18n="progression.time"]', 'progression.time');
			setText($, 'span[data-i18n="progression.bars"]', 'progression.bars');
			setText($, 'span[data-i18n="progression.meter"]', 'progression.meter');
			setText($, 'span[data-i18n="progression.voices"]', 'progression.voices');
			setText($, 'span[data-i18n="progression.writing"]', 'progression.writing');
			setText($, 'span[data-i18n="progression.articulation"]', 'progression.articulation');
			setText($, 'span[data-i18n="progression.harmonicColor"]', 'progression.harmonicColor');
			setText($, 'span[data-i18n="progression.modalInterchange"]', 'progression.modalInterchange');
			setText($, 'span[data-i18n="progression.tensions"]', 'progression.tensions');
			setText($, 'span[data-i18n="progression.counterpoint"]', 'progression.counterpoint');
			setText($, 'option[data-i18n="progression.articulation.sustain"]', 'progression.articulation.sustain');
			setText($, 'option[data-i18n="progression.articulation.legato"]', 'progression.articulation.legato');
			setText($, 'option[data-i18n="progression.articulation.staccato"]', 'progression.articulation.staccato');
			setText($, 'option[data-i18n="progression.articulation.arpeggio"]', 'progression.articulation.arpeggio');
			setValue($, '.transportControls input:eq(0)', 'progression.listen');
			setValue($, '.transportControls input:eq(1)', 'progression.exportMidi');
		}

		function applyWelcome($) {
			setHtml($, '#principal > div:eq(0) p:eq(0)', 'welcome.main1');
			setHtml($, '#principal > div:eq(1) p:eq(0)', 'welcome.main2');
			setText($, '#funciones h2', 'welcome.foundationTitle');
			setHtml($, '#funciones p:last', 'welcome.foundationBody');
			setText($, '#instrumentos h2', 'welcome.instrumentsTitle');
			setHtml($, '#instrumentos p:last', 'welcome.instrumentsBody');
			setText($, '#libre h2', 'welcome.licenseTitle');
			setHtml($, '#libre p:last', 'welcome.licenseBody');
		}

		function applyChangelog($) {
			$('#controlVersiones').html(t('changelog.html'));

			if (typeof $('#controlVersiones').dialog === 'function' && $('#controlVersiones').hasClass('ui-dialog-content')) {
				$('#controlVersiones').dialog('option', 'title', t('changelog.dialogTitle'));
			}
		}

		function applyFooter($) {
			setText($, '#enlaceNovedades', 'footer.news');
			setAttribute($, '#enlaceNovedades', 'title', 'footer.newsTitle');
			setText($, 'footer a[href="https://github.com/Maple1981/Coda"]', 'footer.github');
			setAttribute($, 'footer a[href="https://creativecommons.org/licenses/by-sa/4.0/"]', 'title', 'footer.licenseTitle');
			setHtml($, 'footer p:eq(5)', 'footer.beta');
			setHtml($, 'footer p:eq(6)', 'footer.contact');
		}

		return {
			applyStatic: applyStatic,
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
