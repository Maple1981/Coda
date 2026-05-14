// Shared musical label formatting for progression renderers.
(function (global) {
	'use strict';

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

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.progressionLabels = {
		escapeHtml: escapeHtml,
		formatMusicalLabel: formatMusicalLabel,
		isInversionLabel: isInversionLabel
	};
})(window);
