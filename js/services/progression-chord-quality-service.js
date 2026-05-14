// Chord quality parsing helpers shared by progression services.
(function (global) {
	'use strict';

	function triadName(chord) {
		var chordName = normalizeChordText(chord && chord.nombre ? chord.nombre : chord);
		var rootMatch = /^([A-G](#|b|\u266d)?)/.exec(chordName);
		var root = rootMatch ? rootMatch[1].replace('b', '\u266d') : chordName;
		var suffix = chordQualitySuffix(chordName);

		if (!root) {
			return '';
		}

		if (isDiminishedSeventhQuality(chordName)) {
			return root + '\u00ba';
		}

		if (isMinorSuffix(suffix)) {
			return root + 'm';
		}

		if (suffix.indexOf('aug') >= 0 || suffix.indexOf('+') >= 0) {
			return root + '+';
		}

		return root;
	}

	function isMinorQuality(chordName) {
		var suffix = chordQualitySuffix(chordName);
		var lowerSuffix = suffix.toLowerCase();

		if (isDiminishedSeventhQuality(chordName)) {
			return true;
		}

		if (lowerSuffix.indexOf('maj') === 0) {
			return false;
		}

		return lowerSuffix.charAt(0) === 'm';
	}

	function isDiminishedSeventhQuality(chordName) {
		var suffix = chordQualitySuffix(chordName);
		var lowerSuffix = suffix.toLowerCase();

		return lowerSuffix.indexOf('dim') >= 0 || suffix.indexOf('\u00ba') >= 0 || suffix.indexOf('7\u266d5') >= 0;
	}

	function chordQualitySuffix(chordName) {
		return normalizeChordText(chordName)
			.replace(/^[A-G](#|b|\u266d)?/, '')
			.replace(/b5/g, '\u266d5');
	}

	function normalizeChordText(value) {
		return String(value || '')
			.replace(/\u00c3\u0192\u00c2\u00a2\u00c3\u00a2\u00e2\u20ac\u017e\u00c2\u00a2\u00c3\u201a\u00c2\u00ad|\u00c3\u00a2\u00e2\u201e\u00a2\u00c2\u00ad/g, '\u266d')
			.replace(/\u00e2\u2122\u00ad/g, '\u266d')
			.replace(/\u00c3\u0192\u00e2\u20ac\u0161\u00c3\u201a\u00c2\u00ba|\u00c3\u201a\u00c2\u00ba|\u00c2\u00ba/g, '\u00ba');
	}

	function isMinorSuffix(suffix) {
		return suffix.indexOf('mmaj7') >= 0 || suffix.indexOf('mMaj7') >= 0 || suffix.indexOf('m7') >= 0 || suffix === 'm';
	}

	global.CodaProgressionChordQuality = {
		chordQualitySuffix: chordQualitySuffix,
		isDiminishedSeventhQuality: isDiminishedSeventhQuality,
		isMinorQuality: isMinorQuality,
		isMinorSuffix: isMinorSuffix,
		normalizeChordText: normalizeChordText,
		triadName: triadName
	};
})(window);
