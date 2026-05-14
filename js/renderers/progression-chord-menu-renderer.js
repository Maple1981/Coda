// Renderer for the contextual chord replacement menu.
(function (global) {
	'use strict';

	var labels = global.CodaRenderers.progressionLabels;

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

		menu.appendChild(renderSilenceOption(options));
		hasItems = true;

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
		summary.innerHTML = labels.formatMusicalLabel(item.chordName) + (item.degree ? ' &middot; ' + labels.formatMusicalLabel(item.degree) : '') + sourceLabel(item, options);
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
		button.setAttribute('data-chord-source', item.source || 'diatonic');
		if (item.sourceScaleIndex != null) {
			button.setAttribute('data-source-scale-index', item.sourceScaleIndex);
		}
		button.innerHTML = labels.escapeHtml(kindLabel + ': ') + labels.formatMusicalLabel(item.displayName) + (item.degree ? ' &middot; ' + labels.formatMusicalLabel(item.degree) : '');

		return button;
	}

	function sourceLabel(item, options) {
		var sourceTonicName = item.sourceTonicName || '';
		var scaleKey = item.sourceScaleIndex != null ? 'data.scales.' + item.sourceScaleIndex : '';
		var scaleName = scaleKey ? translate(options.i18n, scaleKey) : '';
		var tonicName = formatNote(options, sourceTonicName);

		if (!scaleName) {
			return '';
		}

		return ' <span class="progressionChordMenu__source">' + labels.escapeHtml(tonicName + ' ' + scaleName) + '</span>';
	}

	function formatNote(options, noteName) {
		if (noteName && options.notation && typeof options.notation.formatNoteName === 'function') {
			return options.notation.formatNoteName(noteName, options.notationStyle);
		}

		return noteName;
	}

	function renderSilenceOption(options) {
		var doc = global.document;
		var section = doc.createElement('section');
		var button = doc.createElement('button');

		section.className = 'progressionChordMenu__group progressionChordMenu__group--silence';
		button.type = 'button';
		button.className = 'measureChordMenuItem';
		button.setAttribute('data-progression-index', options.measureIndex);
		button.setAttribute('data-measure-chord-index', options.chordIndex);
		button.setAttribute('data-chord-kind', 'silence');
		button.innerHTML = labels.escapeHtml(translate(options.i18n, 'progression.chordMenu.silence'));
		section.appendChild(button);

		return section;
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionChordMenu = {
		render: render
	};
})(window);
