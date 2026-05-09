// Renderer for the selected scale title and note list. It formats HTML only;
// scale construction and degree filtering stay outside this module.
(function (global) {
	'use strict';

	function render(options) {
		return renderTitle(options) + renderList(options);
	}

	function renderTitle(options) {
		return '<h3>' + options.tonicName + ' ' + options.scaleName + '</h3>';
	}

	function renderList(options) {
		var html = '';

		if (options.scaleDefinition.tonal != null) {
			html += renderTonalRelationships(options);
		}

		html += '<h4>Grados de la escala</h4>';
		html += '<ul class="notasEscala">';
		html += renderScaleNotes(options);
		html += '</ul>';

		if (options.scaleDefinition.modal === 'true') {
			html += '<div class="leyendaModal">';
			html += '<span class="principal">Nota principal</span> - ';
			html += '<span class="secundaria">Nota secundaria</span>';
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
		html += '<strong>Tonalidad relativa</strong>: ';
		html += '<span id="' + relativeKey.id + '" class="revamp estiloEnlace">' + relativeKey.label + '</span>';
		html += '&nbsp;<strong>Tonalidad paralela</strong>: ';
		html += '<span id="' + options.tonicName + '_' + parallelMode + '" class="revamp estiloEnlace">' + parallelKey + '</span>';
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
			html += note.nombre + '<sup>' + note.grado + '</sup>' + separator;
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
