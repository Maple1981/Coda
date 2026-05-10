// Renderer for the selected scale title and note list. It formats HTML only;
// scale construction and degree filtering stay outside this module.
(function (global) {
	'use strict';

	function render(options) {
		return renderTitle(options) + renderList(options);
	}

	function renderTitle(options) {
		return '<h3>' + formatNote(options, options.tonicName) + ' ' + scaleLabel(options) + '</h3>';
	}

	function renderList(options) {
		var html = '';

		if (options.scaleDefinition.tonal != null) {
			html += renderTonalRelationships(options);
		}

		html += '<h4>' + t(options, 'scaleSummary.degrees') + '</h4>';
		html += '<ul class="notasEscala">';
		html += renderScaleNotes(options);
		html += '</ul>';

		if (options.scaleDefinition.modal === 'true') {
			html += '<div class="leyendaModal">';
			html += '<span class="principal">' + t(options, 'scaleSummary.mainNote') + '</span> - ';
			html += '<span class="secundaria">' + t(options, 'scaleSummary.secondaryNote') + '</span>';
			html += '</div>';
		}

		return html;
	}

	function renderTonalRelationships(options) {
		var relativeKey = findRelativeKey(options);
		var parallelMode = isMajorScale(options) ? 'm' : '';
		var parallelKey = options.tonicName + parallelMode;
		var html = '';

		html += '<p class="infoAdicional">';
		html += '<strong>' + t(options, 'scaleSummary.relativeKey') + '</strong>: ';
		html += '<span id="' + relativeKey.id + '" class="revamp estiloEnlace">' + formatKey(options, relativeKey.label) + '</span>';
		html += '&nbsp;<strong>' + t(options, 'scaleSummary.parallelKey') + '</strong>: ';
		html += '<span id="' + options.tonicName + '_' + parallelMode + '" class="revamp estiloEnlace">' + formatKey(options, parallelKey) + '</span>';
		html += '</p>';

		return html;
	}

	function renderScaleNotes(options) {
		var visibleNotes = [];

		for (var i = 0; i < options.scaleNotes.length; i++) {
			if (!options.isDegreeSuppressed(i)) {
				visibleNotes.push(options.scaleNotes[i]);
			}
		}

		var html = '';
		for (var j = 0; j < visibleNotes.length; j++) {
			var note = visibleNotes[j];
			var cssClass = note.tipo != null ? ' class="' + note.tipo + '"' : '';
			var separator = j < visibleNotes.length - 1 ? ' - ' : '';

			html += '<li' + cssClass + '>';
			html += formatNote(options, note.nombre) + '<sup>' + note.grado + '</sup>' + separator;
			html += '</li>';
		}

		return html;
	}

	function findRelativeKey(options) {
		var abbreviatedKey = isMajorScale(options) ? options.tonicName : options.tonicName + 'm';
		var relativeKey = '';

		for (var i = 0; i < options.circleOfFifths.length; i++) {
			var key = options.circleOfFifths[i];

			if (isMajorScale(options)) {
				if (key.nombre === abbreviatedKey || key.aka === abbreviatedKey) {
					relativeKey = key.enarmonica;
					break;
				}
			} else if (key.enarmonica === abbreviatedKey || key.aka === abbreviatedKey) {
				relativeKey = key.nombre;
				break;
			}
		}

		var relativeId = relativeKey.replace('m', '_m') + '_';

		return {
			id: relativeId,
			label: relativeId.replace('_m', 'm').replace(/_$/, '')
		};
	}

	function isMajorScale(options) {
		return String(options.selectedScaleIndex) === '0';
	}

	function t(options, key) {
		if (options.i18n) {
			return options.i18n.t(key);
		}

		var fallback = {
			'scaleSummary.degrees': 'Grados de la escala',
			'scaleSummary.mainNote': 'Nota principal',
			'scaleSummary.parallelKey': 'Tonalidad paralela',
			'scaleSummary.relativeKey': 'Tonalidad relativa',
			'scaleSummary.secondaryNote': 'Nota secundaria'
		};

		return fallback[key] || key;
	}

	function scaleLabel(options) {
		if (options.i18n && options.scaleIndex != null) {
			return options.i18n.dataLabel('scales', options.scaleIndex, options.scaleName);
		}

		return options.scaleName;
	}

	function formatNote(options, noteName) {
		if (options.notation) {
			return options.notation.formatNoteName(noteName, options.notationStyle);
		}

		return noteName;
	}

	function formatKey(options, keyName) {
		if (options.notation) {
			return options.notation.formatKeyName(keyName, options.notationStyle);
		}

		return keyName;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.scaleSummary = {
		findRelativeKey: findRelativeKey,
		render: render,
		renderList: renderList,
		renderScaleNotes: renderScaleNotes,
		renderTitle: renderTitle,
		renderTonalRelationships: renderTonalRelationships
	};
})(window);
