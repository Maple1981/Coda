// Compatibility facade for pure music-domain modules.
(function (global) {
	'use strict';

	global.CodaDomain = {
		buildExtendedHarmonyChord: global.CodaExtendedHarmonyDomain.buildExtendedHarmonyChord,
		buildCircleOfFifthsView: global.CodaCircleOfFifthsDomain.buildCircleOfFifthsView,
		buildGuitarFretboard: global.CodaInstrumentDomain.buildGuitarFretboard,
		buildPianoKeyboard: global.CodaInstrumentDomain.buildPianoKeyboard,
		buildScale: global.CodaScaleDomain.buildScale,
		buildScaleChords: global.CodaChordDomain.buildScaleChords,
		cleanDegreeForExtendedHarmony: global.CodaExtendedHarmonyDomain.cleanDegreeForExtendedHarmony,
		createDiatonicDegreePlan: global.CodaProgressionDomain.createDiatonicDegreePlan,
		findChordByDegree: global.CodaProgressionDomain.findChordByDegree,
		findExtendedHarmonyRule: global.CodaExtendedHarmonyDomain.findExtendedHarmonyRule,
		noteName: global.CodaMusicUtils.noteName,
		parsePattern: global.CodaMusicUtils.parsePattern,
		resolveProgressionDegrees: global.CodaProgressionDomain.resolveProgressionDegrees,
		shouldPreferFlatsForKeySignature: global.CodaCircleOfFifthsDomain.shouldPreferFlatsForKeySignature
	};
})(window);
