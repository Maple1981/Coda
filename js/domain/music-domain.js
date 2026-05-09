// Compatibility facade for pure music-domain modules.
(function (global) {
	'use strict';

	global.CodaDomain = {
		buildExtendedHarmonyChord: global.CodaExtendedHarmonyDomain.buildExtendedHarmonyChord,
		buildScale: global.CodaScaleDomain.buildScale,
		buildScaleChords: global.CodaChordDomain.buildScaleChords,
		cleanDegreeForExtendedHarmony: global.CodaExtendedHarmonyDomain.cleanDegreeForExtendedHarmony,
		findExtendedHarmonyRule: global.CodaExtendedHarmonyDomain.findExtendedHarmonyRule,
		noteName: global.CodaMusicUtils.noteName,
		parsePattern: global.CodaMusicUtils.parsePattern
	};
})(window);
