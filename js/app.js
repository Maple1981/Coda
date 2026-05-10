//****************************
//Javier Arce 2013-2021
//Esta obra está bajo licencia Creative Commons by-sa 4.0 International, Reconocimiento-Compartir igual
//https://creativecommons.org/licenses/by-sa/4.0/
//****************************

$(document).ready(function () {
	'use strict';

	var preferences = CodaPreferences.create();
	var storedPreferences = preferences.read();
	var i18n = CodaI18n.create({
		initialLanguage: storedPreferences.language || $('#selectorIdioma').val(),
		translations: CodaTranslations
	});

	CodaBootstrap.start({
		$: $,
		application: CodaApplication,
		controller: CodaScaleReportController,
		data: CodaData,
		domain: CodaDomain,
		i18n: i18n,
		initialNotation: storedPreferences.notation,
		midi: MIDI,
		notation: CodaNotation,
		playbackFactory: CodaPlayback,
		preferences: preferences,
		renderers: CodaRenderers,
		ui: CodaUi,
		uiStateFactory: CodaUiState
	});
});
