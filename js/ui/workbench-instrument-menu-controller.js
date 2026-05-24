// Handles the workbench instrument dropdown.
(function (global) {
	'use strict';

	function initialize(options) {
		var root = options && options.root ? options.root : global.document;

		on(root, 'click', function (event) {
			var toggle = closest(event.target, '#toggleWorkbenchInstrumentMenu') ||
				closest(event.target, '#workbenchContextInstrumentToggle');
			var item = closest(event.target, '.workbenchInstrumentMenuItem');

			if (toggle) {
				toggleMenu(root);
				return;
			}

			if (item) {
				prevent(event);
				call(options, 'onInstrumentSelected', item.getAttribute('data-workbench-instrument-id'));
				close(root);
				return;
			}

			if (isOpen(root) && !closest(event.target, '.workbenchInstrumentMenu')) {
				close(root);
			}
		});

		on(root, 'keydown', function (event) {
			if (event.key === 'Escape') {
				close(root);
			}
		});

		return {
			close: function () {
				close(root);
			},
			isOpen: function () {
				return isOpen(root);
			},
			render: function (selection, optionsForRender) {
				render(root, selection, optionsForRender || options || {});
			}
		};
	}

	function render(root, selection, options) {
		var menu = query(root, '#workbenchInstrumentMenu');
		var instruments = options && options.data ? (options.data.midiInstruments || []) : [];
		var html = '';

		if (!menu) {
			return;
		}

		for (var i = 0; i < instruments.length; i++) {
			var label = options.i18n && typeof options.i18n.dataLabel === 'function' ?
				options.i18n.dataLabel('midiInstruments', i, instruments[i].nombre) :
				instruments[i].nombre;
			var selected = selection && selection.midiInstrument === instruments[i].id;

			html += '<button type="button" class="workbenchInstrumentMenuItem" data-workbench-instrument-id="' + escapeHtml(instruments[i].id) + '" aria-pressed="' + (selected ? 'true' : 'false') + '">' + escapeHtml(label) + '</button>';
		}

		menu.innerHTML = html;
	}

	function toggleMenu(root) {
		if (isOpen(root)) {
			close(root);
			return;
		}

		open(root);
	}

	function open(root) {
		var menu = query(root, '#workbenchInstrumentMenu');
		var toggle = query(root, '#toggleWorkbenchInstrumentMenu');

		if (!menu) {
			return;
		}

		menu.hidden = false;
		if (toggle) {
			toggle.setAttribute('aria-expanded', 'true');
			setToggleIcon(root, 'expand_less');
		}
		setContextExpanded(root, true);
	}

	function close(root) {
		var menu = query(root, '#workbenchInstrumentMenu');
		var toggle = query(root, '#toggleWorkbenchInstrumentMenu');

		if (menu) {
			menu.hidden = true;
		}

		if (toggle) {
			toggle.setAttribute('aria-expanded', 'false');
			setToggleIcon(root, 'expand_more');
		}
		setContextExpanded(root, false);
	}

	function isOpen(root) {
		var menu = query(root, '#workbenchInstrumentMenu');

		return !!(menu && !menu.hidden);
	}

	function setToggleIcon(root, iconName) {
		var icon = query(root, '#toggleWorkbenchInstrumentMenu .material-icons');

		if (icon) {
			icon.textContent = iconName;
		}
	}

	function setContextExpanded(root, expanded) {
		var contextInstrument = query(root, '#workbenchContextInstrumentToggle');

		if (contextInstrument) {
			contextInstrument.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	}

	function prevent(event) {
		if (event && typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
	}

	function call(options, callbackName) {
		var args = Array.prototype.slice.call(arguments, 2);

		if (options && typeof options[callbackName] === 'function') {
			return options[callbackName].apply(null, args);
		}

		return undefined;
	}

	function query(root, selector) {
		return root && root.querySelector ? root.querySelector(selector) : null;
	}

	function closest(target, selector) {
		return target && target.closest ? target.closest(selector) : null;
	}

	function on(element, eventName, handler) {
		if (element) {
			element.addEventListener(eventName, handler);
		}
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	global.CodaWorkbenchInstrumentMenu = {
		initialize: initialize,
		render: render
	};
})(window);
