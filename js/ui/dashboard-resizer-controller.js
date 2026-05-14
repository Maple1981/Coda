// Arrastre de la divisoria entre teoría y área de progresiones.
(function (global) {
	'use strict';

	var minWidth = 320;
	var maxWidth = 760;
	var minMainWidth = 520;
	var responsiveBreakpoint = 980;
	var step = 24;

	function initialize(options) {
		var doc = global.document;
		var container = doc ? doc.getElementById('container') : null;
		var sidebar = doc ? doc.getElementById('panelTeorico') : null;
		var resizer = doc ? doc.getElementById('dashboardColumnResizer') : null;
		var preferences = options ? options.preferences : null;
		var ui = options ? options.ui : null;
		var drag = null;

		if (!doc || !container || !sidebar || !resizer) {
			return null;
		}

		applyWidth(container, resizer, initialWidth(preferences, sidebar, container));
		bindStart(resizer, doc, function (event) {
			if (event.button != null && event.button !== 0) {
				return;
			}

			drag = {
				startX: pointerX(event),
				startWidth: sidebar.getBoundingClientRect().width
			};
			resizer.classList.add('isDragging');
			doc.body.classList.add('dashboardResizing');
			preventDefault(event);
		});
		bindMove(doc, function (event) {
			if (!drag) {
				return;
			}

			applyWidth(container, resizer, drag.startWidth + pointerX(event) - drag.startX);
			scheduleAfterResize(ui);
			preventDefault(event);
		});
		bindEnd(doc, function () {
			if (!drag) {
				return;
			}

			drag = null;
			resizer.classList.remove('isDragging');
			doc.body.classList.remove('dashboardResizing');
			saveWidth(preferences, container);
			scheduleAfterResize(ui);
		});
		resizer.addEventListener('keydown', function (event) {
			var direction = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;

			if (!direction) {
				return;
			}

			applyWidth(container, resizer, sidebar.getBoundingClientRect().width + (direction * step));
			saveWidth(preferences, container);
			scheduleAfterResize(ui);
			preventDefault(event);
		});
		global.addEventListener('resize', function () {
			applyWidth(container, resizer, currentWidth(container, sidebar));
		});

		return {
			applyWidth: function (width) {
				applyWidth(container, resizer, width);
			}
		};
	}

	function bindStart(resizer, doc, callback) {
		resizer.addEventListener(global.PointerEvent ? 'pointerdown' : 'mousedown', callback);
	}

	function bindMove(doc, callback) {
		doc.addEventListener(global.PointerEvent ? 'pointermove' : 'mousemove', callback);
	}

	function bindEnd(doc, callback) {
		doc.addEventListener(global.PointerEvent ? 'pointerup' : 'mouseup', callback);
		doc.addEventListener('mouseleave', callback);
	}

	function initialWidth(preferences, sidebar, container) {
		var storedWidth = preferences && typeof preferences.getValue === 'function' ?
			preferences.getValue('dashboardSidebarWidth', null) :
			null;

		return storedWidth || currentWidth(container, sidebar);
	}

	function currentWidth(container, sidebar) {
		var computedWidth = parseInt(container.style.getPropertyValue('--dashboard-sidebar-width'), 10);

		return isFinite(computedWidth) ? computedWidth : sidebar.getBoundingClientRect().width;
	}

	function applyWidth(container, resizer, width) {
		var normalizedWidth = clampWidth(width, container);

		if (global.innerWidth <= responsiveBreakpoint) {
			return;
		}

		container.style.setProperty('--dashboard-sidebar-width', normalizedWidth + 'px');
		resizer.setAttribute('aria-valuemin', String(minWidth));
		resizer.setAttribute('aria-valuemax', String(maxForContainer(container)));
		resizer.setAttribute('aria-valuenow', String(normalizedWidth));
	}

	function saveWidth(preferences, container) {
		var width = parseInt(container.style.getPropertyValue('--dashboard-sidebar-width'), 10);

		if (preferences && typeof preferences.setValue === 'function' && isFinite(width)) {
			preferences.setValue('dashboardSidebarWidth', width);
		}
	}

	function clampWidth(width, container) {
		var numericWidth = Math.round(Number(width));
		var max = maxForContainer(container);

		if (!isFinite(numericWidth)) {
			numericWidth = minWidth;
		}

		return Math.max(minWidth, Math.min(max, numericWidth));
	}

	function maxForContainer(container) {
		var availableWidth = container ? container.clientWidth : 0;
		var dynamicMax = availableWidth ? availableWidth - minMainWidth : maxWidth;

		return Math.max(minWidth, Math.min(maxWidth, dynamicMax));
	}

	function pointerX(event) {
		return Number(event.clientX) || 0;
	}

	function preventDefault(event) {
		if (event && typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
	}

	function scheduleAfterResize(ui) {
		if (ui && typeof ui.scheduleInstrumentScale === 'function') {
			ui.scheduleInstrumentScale();
		}
		if (ui && typeof ui.scheduleSidebarPanelViewport === 'function') {
			ui.scheduleSidebarPanelViewport();
		}
		if (ui && typeof ui.scheduleDashboardWorkspaceHeight === 'function') {
			ui.scheduleDashboardWorkspaceHeight();
		}
	}

	global.CodaDashboardResizer = {
		initialize: initialize
	};
})(window);
