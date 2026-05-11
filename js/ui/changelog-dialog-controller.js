// Control del diálogo de novedades.
(function (global) {
	'use strict';

	var previousFocus = null;

	function initialize($, i18n) {
		if ($('#controlVersiones').length === 0 || $('#enlaceNovedades').length === 0) {
			return;
		}

		ensureDialogStructure($, i18n);
		updateTitle($, i18n);

		$('#enlaceNovedades').off('click.codaChangelogDialog').on('click.codaChangelogDialog', function (event) {
			event.preventDefault();
			openDialog($);
		});

		$('#controlVersionesDialog').off('mousedown.codaChangelogDialog').on('mousedown.codaChangelogDialog', function (event) {
			if (event.target === this) {
				closeDialog($);
			}
		});

		$('#controlVersionesDialogClose').off('click.codaChangelogDialog').on('click.codaChangelogDialog', function () {
			closeDialog($);
		});

		$(document).off('keydown.codaChangelogDialog').on('keydown.codaChangelogDialog', function (event) {
			if (event.key === 'Escape' && isOpen($)) {
				closeDialog($);
			}
		});
	}

	function ensureDialogStructure($, i18n) {
		var content = $('#controlVersiones');
		var dialog;
		var surface;
		var titlebar;
		var title;
		var closeButton;
		var contentShell;

		if ($('#controlVersionesDialog').length > 0) {
			return;
		}

		dialog = $('<div id="controlVersionesDialog" class="dialogoNovedades" role="dialog" aria-modal="true" aria-labelledby="controlVersionesDialogTitle" hidden></div>');
		surface = $('<div class="dialogoNovedades__surface"></div>');
		titlebar = $('<div class="dialogoNovedades__titlebar"></div>');
		title = $('<h2 id="controlVersionesDialogTitle" class="dialogoNovedades__title"></h2>');
		closeButton = $('<button id="controlVersionesDialogClose" class="dialogoNovedades__close" type="button"><span class="material-icons" aria-hidden="true">close</span></button>');
		contentShell = $('<div class="dialogoNovedades__content"></div>');

		content.before(dialog);
		contentShell.append(content);
		titlebar.append(title, closeButton);
		surface.append(titlebar, contentShell);
		dialog.append(surface);
		updateTitle($, i18n);
	}

	function openDialog($) {
		var dialog = $('#controlVersionesDialog');

		previousFocus = document.activeElement;
		dialog.removeAttr('hidden').addClass('isOpen');
		$('body').addClass('hasOpenDialog');
		$('#controlVersionesDialogClose').trigger('focus');
	}

	function closeDialog($) {
		$('#controlVersionesDialog').attr('hidden', 'hidden').removeClass('isOpen');
		$('body').removeClass('hasOpenDialog');

		if (previousFocus && typeof previousFocus.focus === 'function') {
			previousFocus.focus();
		}
		previousFocus = null;
	}

	function isOpen($) {
		return $('#controlVersionesDialog').hasClass('isOpen');
	}

	function updateTitle($, i18n) {
		var title = i18n ? i18n.t('changelog.dialogTitle') : 'Novedades y mejoras';
		var closeLabel = i18n ? i18n.t('changelog.close') : 'Cerrar novedades';

		$('#controlVersionesDialogTitle').text(title);
		$('#controlVersionesDialogClose').attr('aria-label', closeLabel).attr('title', closeLabel);
	}

	global.CodaChangelogDialog = {
		initialize: initialize,
		updateTitle: updateTitle
	};
})(window);
