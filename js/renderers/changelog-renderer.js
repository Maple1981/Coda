// Renderer para el contenido largo de novedades.
(function (global) {
	'use strict';

	function render(articles) {
		var html = '';

		for (var i = 0; i < articles.length; i++) {
			html += renderArticle(articles[i]);
		}

		return html;
	}

	function renderArticle(article) {
		var html = '<article>';

		html += '<h3>' + escapeHtml(article.title) + '</h3>';
		html += '<dl>';

		for (var i = 0; i < article.items.length; i++) {
			html += renderItem(article.items[i]);
		}

		html += '</dl>';
		html += '</article>';

		return html;
	}

	function renderItem(item) {
		var html = '<dt>' + escapeHtml(item.term) + '</dt>';

		for (var i = 0; i < item.descriptions.length; i++) {
			html += '<dd>' + escapeHtml(item.descriptions[i]) + '</dd>';
		}

		return html;
	}

	function escapeHtml(value) {
		return String(value)
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.changelog = {
		render: render,
		renderArticle: renderArticle,
		renderItem: renderItem
	};
})(window);
