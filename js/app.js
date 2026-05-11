//****************************
//Javier Arce 2013-2021
//Esta obra está bajo licencia Creative Commons by-sa 4.0 International, Reconocimiento-Compartir igual
//https://creativecommons.org/licenses/by-sa/4.0/
//****************************

document.addEventListener('DOMContentLoaded', function () {
	'use strict';

	var preferences = CodaPreferences.create();
	var storedPreferences = preferences.read();
	var languageSelector = document.getElementById('selectorIdioma');
	var i18n = CodaI18n.create({
		initialLanguage: storedPreferences.language || (languageSelector ? languageSelector.value : 'es'),
		translations: CodaTranslations
	});

	CodaBootstrap.start({
		application: CodaApplication,
		controller: CodaScaleReportController,
		data: CodaData,
		domain: CodaDomain,
		i18n: i18n,
		changelogDialog: CodaChangelogDialog,
		keyNavigation: CodaKeyNavigation,
		initialForm: {
			format: storedPreferences.format,
			midiInstrument: storedPreferences.midiInstrument,
			scaleIndex: storedPreferences.scaleIndex,
			tonicIndex: storedPreferences.tonicIndex
		},
		initialNotation: storedPreferences.notation,
		initialTheme: storedPreferences.theme,
		initialVolume: storedPreferences.volume,
		musicalContextFactory: CodaMusicalContext,
		midi: MIDI,
		notation: CodaNotation,
		playbackFactory: CodaPlayback,
		preferences: preferences,
		renderers: CodaRenderers,
		staticText: CodaStaticText,
		themeControl: CodaThemeControl,
		ui: CodaUi,
		uiStateFactory: CodaUiState,
		volumeControl: CodaVolumeControl
	});
});
