// Aplicación de textos estáticos y contenido largo traducido sobre el DOM.
(function (global) {
	'use strict';

	function apply($, i18n) {
		if (!i18n) {
			return;
		}

		$('html').attr('lang', i18n.getLanguage() === 'en' ? 'en' : 'es-ES');
		$('meta[name="description"]').attr('content', i18n.t('meta.description'));
		$('#selectorIdioma').val(i18n.getLanguage());

		setText($, i18n, '#appHeader h2', 'app.subtitle');
		setText($, i18n, 'span[data-i18n="ui.language"]', 'ui.language');
		setText($, i18n, 'span[data-i18n="ui.notation"]', 'ui.notation');
		setText($, i18n, 'span[data-i18n="ui.volume"]', 'ui.volume');
		setText($, i18n, 'option[data-i18n="notation.anglosaxon"]', 'notation.anglosaxon');
		setText($, i18n, 'option[data-i18n="notation.latin"]', 'notation.latin');
		setAttribute($, i18n, '#selectorVolumen', 'aria-label', 'ui.volumeTitle');
		setAttribute($, i18n, '#selectorVolumen', 'title', 'ui.volumeTitle');
		setAttribute($, i18n, '#randomizeAll', 'title', 'randomSelect.master');
		setAttribute($, i18n, '#randomizeAll', 'aria-label', 'randomSelect.master');
		setAttribute($, i18n, '#themeToggleButton', 'title', 'theme.switchToDay');
		setAttribute($, i18n, '#themeToggleButton', 'aria-label', 'theme.switchToDay');
		setAttribute($, i18n, '#settingsButton', 'title', 'settings.label');
		setAttribute($, i18n, '#settingsButton', 'aria-label', 'settings.label');

		setText($, i18n, '#interface h3', 'form.title');
		setText($, i18n, 'span[data-i18n="form.tonic"]', 'form.tonic');
		setText($, i18n, 'span[data-i18n="form.scale"]', 'form.scale');
		setText($, i18n, 'span[data-i18n="form.format"]', 'form.format');
		setText($, i18n, 'span[data-i18n="form.sharps"]', 'form.sharps');
		setText($, i18n, 'span[data-i18n="form.flats"]', 'form.flats');
		setText($, i18n, 'span[data-i18n="form.instrument"]', 'form.instrument');
		setAttribute($, i18n, '#randomizeTonic', 'title', 'randomSelect.tonic');
		setAttribute($, i18n, '#randomizeTonic', 'aria-label', 'randomSelect.tonic');
		setAttribute($, i18n, '#randomizeScale', 'title', 'randomSelect.scale');
		setAttribute($, i18n, '#randomizeScale', 'aria-label', 'randomSelect.scale');

		ensureProgressionWorkbench($);
		setText($, i18n, '.workbenchKicker', 'progression.subtitle');
		setText($, i18n, '.workbenchHeader h2', 'progression.title');
		setAttribute($, i18n, '.progressionTimeline', 'aria-label', 'progression.aria');
		applyProgressionLabels($, i18n);
		applyWelcome($, i18n);
		applyChangelog($, i18n);
		applyFooter($, i18n);
	}

	function setText($, i18n, selector, key) {
		$(selector).text(i18n.t(key));
	}

	function setTrustedHtml($, i18n, selector, key) {
		// HTML controlado por `js/i18n/translations.js`: solo enlaces y énfasis locales revisados.
		$(selector).html(i18n.t(key));
	}

	function setValue($, i18n, selector, key) {
		$(selector).val(i18n.t(key));
	}

	function setAttribute($, i18n, selector, attribute, key) {
		$(selector).attr(attribute, i18n.t(key));
	}

	function applyProgressionLabels($, i18n) {
		ensureProgressionWorkbench($);
		setText($, i18n, 'span[data-i18n="progression.time"]', 'progression.time');
		setText($, i18n, 'span[data-i18n="progression.bars"]', 'progression.bars');
		setText($, i18n, 'span[data-i18n="progression.meter"]', 'progression.meter');
		setText($, i18n, 'span[data-i18n="progression.voices"]', 'progression.voices');
		setText($, i18n, 'span[data-i18n="progression.writing"]', 'progression.writing');
		setText($, i18n, 'span[data-i18n="progression.articulation"]', 'progression.articulation');
		setText($, i18n, 'span[data-i18n="progression.harmonicColor"]', 'progression.harmonicColor');
		setText($, i18n, 'span[data-i18n="progression.modalInterchange"]', 'progression.modalInterchange');
		setText($, i18n, 'span[data-i18n="progression.tensions"]', 'progression.tensions');
		setText($, i18n, 'span[data-i18n="progression.counterpoint"]', 'progression.counterpoint');
		setText($, i18n, 'option[data-i18n="progression.articulation.sustain"]', 'progression.articulation.sustain');
		setText($, i18n, 'option[data-i18n="progression.articulation.legato"]', 'progression.articulation.legato');
		setText($, i18n, 'option[data-i18n="progression.articulation.staccato"]', 'progression.articulation.staccato');
		setText($, i18n, 'option[data-i18n="progression.articulation.arpeggio"]', 'progression.articulation.arpeggio');
		setText($, i18n, '.transportButton--listen span[data-i18n="progression.listen"]', 'progression.listen');
		setText($, i18n, '.transportButton--export span[data-i18n="progression.exportMidi"]', 'progression.exportMidi');
	}

	function ensureProgressionWorkbench($) {
		if ($('#constructorProgresiones').children().length === 0 && global.CodaRenderers && global.CodaRenderers.progressionWorkbench) {
			$('#constructorProgresiones').html(global.CodaRenderers.progressionWorkbench.render());
		}
	}

	function applyWelcome($, i18n) {
		var content = global.CodaWelcomeContent || {};
		var welcome = content[i18n.getLanguage()] || content.es;

		if (welcome && global.CodaRenderers && global.CodaRenderers.welcome) {
			$('#bienvenida').html(global.CodaRenderers.welcome.render(welcome));
		}
	}

	function applyChangelog($, i18n) {
		var content = global.CodaChangelogContent || {};
		var articles = content[i18n.getLanguage()] || content.es || [];

		if (global.CodaRenderers && global.CodaRenderers.changelog) {
			$('#controlVersiones').html(global.CodaRenderers.changelog.render(articles));
		}

		if (typeof $('#controlVersiones').dialog === 'function' && $('#controlVersiones').hasClass('ui-dialog-content')) {
			$('#controlVersiones').dialog('option', 'title', i18n.t('changelog.dialogTitle'));
		}
	}

	function applyFooter($, i18n) {
		setText($, i18n, '#enlaceNovedades', 'footer.news');
		setAttribute($, i18n, '#enlaceNovedades', 'title', 'footer.newsTitle');
		setText($, i18n, 'footer a[href="https://github.com/Maple1981/Coda"]', 'footer.github');
		setAttribute($, i18n, 'footer a[href="https://creativecommons.org/licenses/by-sa/4.0/"]', 'title', 'footer.licenseTitle');
		setTrustedHtml($, i18n, '#creditosSoundfonts', 'footer.soundfonts');
		setTrustedHtml($, i18n, '#estadoBeta', 'footer.beta');
		setTrustedHtml($, i18n, '#contactoAutor', 'footer.contact');
	}

	global.CodaStaticText = {
		apply: apply,
		applyChangelog: applyChangelog,
		applyFooter: applyFooter,
		applyProgressionLabels: applyProgressionLabels,
		applyWelcome: applyWelcome
	};
})(window);
