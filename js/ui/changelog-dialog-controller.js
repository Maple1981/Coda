// Control del diálogo de novedades.
(function (global) {
	'use strict';

	var previousFocus = null;

	function initialize(i18n) {
		var doc = global.document;
		var content = doc ? doc.getElementById('controlVersiones') : null;
		var link = doc ? doc.getElementById('enlaceNovedades') : null;
		var dialog;
		var closeButton;

		if (!content || !link) {
			return;
		}

		ensureDialogStructure(i18n);
		updateTitle(i18n);
		dialog = doc.getElementById('controlVersionesDialog');
		closeButton = doc.getElementById('controlVersionesDialogClose');

		if (dialog.getAttribute('data-coda-dialog-initialized') === 'true') {
			return;
		}
		dialog.setAttribute('data-coda-dialog-initialized', 'true');

		link.addEventListener('click', function (event) {
			event.preventDefault();
			openDialog();
		});

		dialog.addEventListener('mousedown', function (event) {
			if (event.target === dialog) {
				closeDialog();
			}
		});

		closeButton.addEventListener('click', closeDialog);
		doc.addEventListener('keydown', handleDocumentKeydown);
	}

	function ensureDialogStructure(i18n) {
		var doc = global.document;
		var content = doc.getElementById('controlVersiones');
		var dialog;
		var surface;
		var titlebar;
		var title;
		var closeButton;
		var contentShell;

		if (doc.getElementById('controlVersionesDialog')) {
			return;
		}

		dialog = createElement('div', {
			'class': 'dialogoNovedades',
			'aria-labelledby': 'controlVersionesDialogTitle',
			'aria-modal': 'true',
			'hidden': '',
			'id': 'controlVersionesDialog',
			'role': 'dialog'
		});
		surface = createElement('div', { 'class': 'dialogoNovedades__surface' });
		titlebar = createElement('div', { 'class': 'dialogoNovedades__titlebar' });
		title = createElement('h2', { 'class': 'dialogoNovedades__title', 'id': 'controlVersionesDialogTitle' });
		closeButton = createElement('button', { 'class': 'dialogoNovedades__close', 'id': 'controlVersionesDialogClose', 'type': 'button' });
		closeButton.innerHTML = '<span class="material-icons" aria-hidden="true">close</span>';
		contentShell = createElement('div', { 'class': 'dialogoNovedades__content' });

		content.parentNode.insertBefore(dialog, content);
		contentShell.appendChild(content);
		titlebar.appendChild(title);
		titlebar.appendChild(closeButton);
		surface.appendChild(titlebar);
		surface.appendChild(contentShell);
		dialog.appendChild(surface);
		updateTitle(i18n);
	}

	function openDialog() {
		var doc = global.document;
		var dialog = doc.getElementById('controlVersionesDialog');
		var closeButton = doc.getElementById('controlVersionesDialogClose');

		previousFocus = doc.activeElement;
		dialog.removeAttribute('hidden');
		dialog.classList.add('isOpen');
		doc.body.classList.add('hasOpenDialog');
		closeButton.focus();
	}

	function closeDialog() {
		var doc = global.document;
		var dialog = doc.getElementById('controlVersionesDialog');

		dialog.setAttribute('hidden', 'hidden');
		dialog.classList.remove('isOpen');
		doc.body.classList.remove('hasOpenDialog');

		if (previousFocus && typeof previousFocus.focus === 'function') {
			previousFocus.focus();
		}
		previousFocus = null;
	}

	function isOpen() {
		var doc = global.document;
		var dialog = doc ? doc.getElementById('controlVersionesDialog') : null;

		return Boolean(dialog && dialog.classList.contains('isOpen'));
	}

	function updateTitle(i18n) {
		var doc = global.document;
		var titleElement = doc ? doc.getElementById('controlVersionesDialogTitle') : null;
		var closeButton = doc ? doc.getElementById('controlVersionesDialogClose') : null;
		var title = i18n ? i18n.t('changelog.dialogTitle') : 'Novedades y mejoras';
		var closeLabel = i18n ? i18n.t('changelog.close') : 'Cerrar novedades';

		if (titleElement) {
			titleElement.textContent = title;
		}

		if (closeButton) {
			closeButton.setAttribute('aria-label', closeLabel);
			closeButton.setAttribute('title', closeLabel);
		}
	}

	function handleDocumentKeydown(event) {
		if (event.key === 'Escape' && isOpen()) {
			closeDialog();
		}
	}

	function createElement(tagName, attributes) {
		var element = global.document.createElement(tagName);

		Object.keys(attributes).forEach(function (attribute) {
			element.setAttribute(attribute, attributes[attribute]);
		});

		return element;
	}

	global.CodaChangelogDialog = {
		initialize: initialize,
		updateTitle: updateTitle
	};
})(window);
