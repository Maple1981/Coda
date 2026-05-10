// Control del diálogo de novedades.
(function (global) {
	'use strict';

	function initialize($, i18n) {
		if (typeof $('#controlVersiones').dialog !== 'function') {
			return;
		}

		$('#controlVersiones').dialog({
			autoOpen: false,
			classes: {
				'ui-dialog': 'dialogoNovedades'
			},
			height: Math.min(720, $(window).height() - 60),
			modal: true,
			title: i18n ? i18n.t('changelog.dialogTitle') : 'Novedades y mejoras',
			width: Math.min(920, $(window).width() - 40)
		});

		$('#enlaceNovedades').click(function (event) {
			event.preventDefault();
			$('#controlVersiones').dialog('open');
		});

		$(document).on('mousedown', '.ui-widget-overlay', function () {
			$('#controlVersiones').dialog('close');
		});
	}

	global.CodaChangelogDialog = {
		initialize: initialize
	};
})(window);
