// Renderer for the contextual chord replacement menu.
(function (global) {
	'use strict';

	function render(menuData, options) {
		var doc = global.document;
		var menu;
		var hasItems = false;

		options = options || {};

		if (!doc || typeof doc.createElement !== 'function') {
			return null;
		}

		menu = doc.createElement('div');
		menu.className = 'progressionChordMenu';
		menu.setAttribute('role', 'menu');

		for (var i = 0; i < (menuData || []).length; i++) {
			if (!menuData[i].items.length) {
				continue;
			}

			hasItems = true;
			menu.appendChild(renderGroup(menuData[i], options));
		}

		return hasItems ? menu : null;
	}

	function renderGroup(group, options) {
		var doc = global.document;
		var section = doc.createElement('section');
		var title = doc.createElement('h3');

		section.className = 'progressionChordMenu__group';
		title.textContent = translate(options.i18n, 'progression.chordMenu.' + group.id);
		section.appendChild(title);

		for (var i = 0; i < group.items.length; i++) {
			section.appendChild(renderChord(group.items[i], options));
		}

		return section;
	}

	function renderChord(item, options) {
		var doc = global.document;
		var details = doc.createElement('details');
		var summary = doc.createElement('summary');
		var optionsContainer = doc.createElement('div');

		details.className = 'progressionChordMenu__chord';
		summary.innerHTML = formatMusicalLabel(item.chordName) + (item.degree ? ' &middot; ' + formatMusicalLabel(item.degree) : '');
		optionsContainer.className = 'progressionChordMenu__options';
		details.appendChild(summary);
		details.appendChild(optionsContainer);

		for (var i = 0; i < item.options.length; i++) {
			optionsContainer.appendChild(renderOption(item.options[i], options));
		}

		return details;
	}

	function renderOption(item, options) {
		var doc = global.document;
		var button = doc.createElement('button');
		var kindLabel = item.kind === 'seventh' ? translate(options.i18n, 'progression.chordMenu.seventh') : translate(options.i18n, 'progression.chordMenu.triad');

		button.type = 'button';
		button.className = 'measureChordMenuItem';
		button.setAttribute('data-progression-index', options.measureIndex);
		button.setAttribute('data-measure-chord-index', options.chordIndex);
		button.setAttribute('data-degree-index', item.degreeIndex);
		button.setAttribute('data-chord-kind', item.kind);
		button.setAttribute('data-inversion-index', item.inversionIndex);
		button.innerHTML = escapeHtml(kindLabel + ': ') + formatMusicalLabel(item.displayName) + (item.degree ? ' &middot; ' + formatMusicalLabel(item.degree) : '');

		return button;
	}

	function formatMusicalLabel(value) {
		return String(value).split(/(\s+)/).map(function (part) {
			if (isInversionLabel(part)) {
				return '<sub class="musicInversion">' + escapeHtml(part) + '</sub>';
			}

			return escapeHtml(part);
		}).join('');
	}

	function isInversionLabel(value) {
		return /^(6|6\/4|6\/5|4\/3|4\/2)$/.test(value);
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionChordMenu = {
		render: render
	};
})(window);
