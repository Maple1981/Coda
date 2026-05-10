// Renderer para el bloque de bienvenida.
(function (global) {
	'use strict';

	function render(content) {
		var html = '';

		html += '<article id="principal" class="columnata">';
		html += '<div><p>' + content.main[0] + '</p></div>';
		html += '<div><p>' + content.main[1] + '</p></div>';
		html += '</article>';
		html += '<div class="columnata">';

		for (var i = 0; i < content.sections.length; i++) {
			html += renderSection(content.sections[i]);
		}

		html += '</div>';

		return html;
	}

	function renderSection(section) {
		var html = '<article id="' + section.id + '">';

		html += '<h2>' + section.title + '</h2>';
		html += '<p class="centrado"><span class="material-icons icono ' + section.iconClass + '">' + section.icon + '</span></p>';
		html += '<p>' + section.body + '</p>';
		html += '</article>';

		return html;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.welcome = {
		render: render,
		renderSection: renderSection
	};
})(window);
