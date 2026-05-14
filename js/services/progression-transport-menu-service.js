// Manages the contextual chord menu used by the progression transport.
(function (global) {
	'use strict';

	var activeButton = null;

	function open(options, button, measureIndex, chordIndex) {
		var progression = options.uiState ? options.uiState.getProgression() : null;
		var report = options.uiState && options.uiState.getReport ? options.uiState.getReport() : null;
		var measure = progression && progression.measures ? progression.measures[measureIndex] : null;
		var currentSegment = currentChordSegment(measure, chordIndex);
		var chordMenuRenderer = options.renderers && options.renderers.progressionChordMenu ? options.renderers.progressionChordMenu : global.CodaRenderers.progressionChordMenu;
		var menuData;
		var menu;

		if (!button || !measure || !chordMenuRenderer || !options.application || typeof options.application.buildProgressionChordMenu !== 'function') {
			return false;
		}

		close();
		menuData = options.application.buildProgressionChordMenu({
			currentSegment: currentSegment,
			report: report
		});
		menu = chordMenuRenderer.render(menuData, {
			chordIndex: chordIndex,
			i18n: options.i18n,
			measureIndex: measureIndex,
			notation: options.notation,
			notationStyle: options.uiState && options.uiState.getNotationStyle ? options.uiState.getNotationStyle() : 'anglosaxon'
		});

		if (!menu) {
			return false;
		}

		global.document.body.appendChild(menu);
		position(menu, button);
		activeButton = button;
		button.setAttribute('aria-expanded', 'true');
		return true;
	}

	function close() {
		var menu = query('.progressionChordMenu');

		if (menu && menu.parentNode) {
			menu.parentNode.removeChild(menu);
		}

		if (activeButton) {
			activeButton.setAttribute('aria-expanded', 'false');
			activeButton = null;
		}
	}

	function replacementFromItem(item) {
		if (item && item.getAttribute('data-chord-kind') === 'silence') {
			return {
				kind: 'silence'
			};
		}

		return {
			degreeIndex: parseInt(item.getAttribute('data-degree-index'), 10),
			inversionIndex: parseInt(item.getAttribute('data-inversion-index'), 10),
			kind: item.getAttribute('data-chord-kind'),
			source: item.getAttribute('data-chord-source') || 'diatonic',
			sourceScaleIndex: item.getAttribute('data-source-scale-index')
		};
	}

	function currentChordSegment(measure, chordIndex) {
		if (!measure) {
			return null;
		}

		if (measure.chords && measure.chords.length) {
			return measure.chords[Math.min(chordIndex, measure.chords.length - 1)];
		}

		return measure;
	}

	function position(menu, button) {
		var bounds;
		var viewport = viewportSize();
		var margin = 8;
		var gap = 6;
		var menuBounds;
		var menuHeight;
		var menuWidth;
		var availableAbove;
		var availableBelow;
		var openAbove;
		var maxHeight;
		var left;
		var top;

		if (!menu || !button || typeof button.getBoundingClientRect !== 'function') {
			return;
		}

		bounds = button.getBoundingClientRect();
		menu.style.maxHeight = Math.max(48, viewport.height - (margin * 2)) + 'px';
		menuBounds = typeof menu.getBoundingClientRect === 'function' ? menu.getBoundingClientRect() : {};
		menuWidth = menuBounds.width || 280;
		menuHeight = menuBounds.height || 0;
		availableAbove = Math.max(0, bounds.top - margin - gap);
		availableBelow = Math.max(0, viewport.height - bounds.bottom - margin - gap);
		openAbove = availableBelow < Math.min(menuHeight, 260) && availableAbove > availableBelow;
		maxHeight = Math.max(48, openAbove ? availableAbove : availableBelow);

		menu.style.maxHeight = maxHeight + 'px';
		menuBounds = typeof menu.getBoundingClientRect === 'function' ? menu.getBoundingClientRect() : menuBounds;
		menuHeight = Math.min(menuBounds.height || maxHeight, maxHeight);
		left = Math.max(margin, Math.min(viewport.width - menuWidth - margin, bounds.left));
		top = openAbove ? bounds.top - gap - menuHeight : bounds.bottom + gap;
		top = Math.max(margin, Math.min(viewport.height - menuHeight - margin, top));

		menu.style.left = left + 'px';
		menu.style.top = top + 'px';
	}

	function viewportSize() {
		var doc = global.document && global.document.documentElement ? global.document.documentElement : {};

		return {
			height: global.innerHeight || doc.clientHeight || 768,
			width: global.innerWidth || doc.clientWidth || 1024
		};
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	global.CodaProgressionTransportMenu = {
		close: close,
		currentChordSegment: currentChordSegment,
		open: open,
		position: position,
		replacementFromItem: replacementFromItem
	};
})(window);
