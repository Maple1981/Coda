//****************************
//Javier Arce 2013-2021
//Esta obra está bajo licencia Creative Commons by-sa 4.0 International, Reconocimiento-Compartir igual
//https://creativecommons.org/licenses/by-sa/4.0/
//****************************

$(document).ready(function () {
	'use strict';

	CodaBootstrap.start({
		$: $,
		application: CodaApplication,
		controller: CodaScaleReportController,
		data: CodaData,
		domain: CodaDomain,
		midi: MIDI,
		playbackFactory: CodaPlayback,
		renderers: CodaRenderers,
		ui: CodaUi
	});
});
