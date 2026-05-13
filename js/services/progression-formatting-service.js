// Nomenclatura de acordes, grados e inversiones para progresiones.
(function (global) {
	'use strict';

	function displayDegree(degree, inversionLabel, suspensionLabel) {
		var name = degree || '';

		if (inversionLabel) {
			name += ' ' + inversionLabel;
		}

		return suspensionLabel ? name + ' ' + suspensionLabel : name;
	}

	function displayName(chordName, inversionLabel, suspensionLabel, tensionLabel) {
		var name = chordName || '';

		if (inversionLabel) {
			name += ' ' + inversionLabel;
		}

		if (suspensionLabel) {
			name += ' ' + suspensionLabel;
		}

		return tensionLabel ? name + ' ' + tensionLabel : name;
	}

	function triadName(chord) {
		var chordName = normalizeChordText(chord ? chord.nombre : '');
		var rootMatch = /^([A-G](#|b|♭)?)/.exec(chordName);
		var root = rootMatch ? rootMatch[1].replace('b', '♭') : chordName;
		var suffix = chordQualitySuffix(chordName);

		if (!root) {
			return '';
		}

		if (suffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0) {
			return root + 'º';
		}

		if (suffix.indexOf('mmaj7') >= 0 || suffix.indexOf('mMaj7') >= 0 || suffix.indexOf('m7') >= 0 || suffix === 'm') {
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

		if (lowerSuffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0) {
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

		return lowerSuffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0;
	}

	function formatDegreeForMeasure(degree, chord, useSeventh) {
		if (useSeventh) {
			return formatDegreeForChord(degree, chord ? chord.nombre : '');
		}

		return formatTriadDegreeForChord(degree, chord ? chord.nombre : '');
	}

	function formatTriadDegreeForChord(degree, chordName) {
		var cleanDegree = String(degree || '').replace('J', '').replace('M', '').replace('m', '');
		var suffix = chordQualitySuffix(chordName);
		var transformedDegree;

		if (!cleanDegree) {
			return '';
		}

		if (suffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0) {
			return cleanDegree.toLowerCase() + 'º';
		}

		if (suffix.indexOf('mmaj7') >= 0 || suffix.indexOf('mMaj7') >= 0 || suffix.indexOf('m7') >= 0 || suffix === 'm') {
			transformedDegree = cleanDegree.toLowerCase();
		} else {
			transformedDegree = cleanDegree.toUpperCase();
		}

		if (suffix.indexOf('aug') >= 0 || suffix.indexOf('+') >= 0) {
			transformedDegree += '+';
		}

		return transformedDegree;
	}

	function formatDegreeForChord(degree, chordName) {
		var transformedDegree = '';
		var cleanDegree = String(degree || '').replace('J', '').replace('M', '').replace('m', '');
		var normalizedChordName = normalizeChordText(chordName);
		var chordQuality = chordQualitySuffix(normalizedChordName);

		if (!cleanDegree) {
			return '';
		}

		if (normalizedChordName.indexOf('mmaj7') >= 0) {
			transformedDegree = cleanDegree.toLowerCase();
		} else if (normalizedChordName.indexOf('maj7') >= 0) {
			transformedDegree = cleanDegree.toUpperCase();
		} else if (normalizedChordName.indexOf('m') >= 0) {
			transformedDegree = cleanDegree.toLowerCase();
		} else {
			transformedDegree = cleanDegree.toUpperCase();
		}

		transformedDegree += chordQuality;

		if (transformedDegree.indexOf('m7') >= 0 && transformedDegree.indexOf('dim7') === -1) {
			transformedDegree = transformedDegree.replace('m', '');
		}

		return transformedDegree;
	}

	function chordQualitySuffix(chordName) {
		return normalizeChordText(chordName)
			.replace(/^[A-G](#|b|♭)?/, '')
			.replace(/b5/g, '♭5');
	}

	function normalizeChordText(value) {
		return String(value || '')
			.replace(/Ã¢â„¢Â­|â™­/g, '♭')
			.replace(/Ã‚Âº|Âº/g, 'º');
	}

	global.CodaProgressionFormatting = {
		chordQualitySuffix: chordQualitySuffix,
		displayDegree: displayDegree,
		displayName: displayName,
		formatDegreeForChord: formatDegreeForChord,
		formatDegreeForMeasure: formatDegreeForMeasure,
		formatTriadDegreeForChord: formatTriadDegreeForChord,
		isDiminishedSeventhQuality: isDiminishedSeventhQuality,
		isMinorQuality: isMinorQuality,
		triadName: triadName
	};
})(window);