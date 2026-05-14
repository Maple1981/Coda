// Nomenclatura de acordes, grados e inversiones para progresiones.
(function (global) {
	'use strict';

	var chordQuality = global.CodaProgressionChordQuality;

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

	function formatDegreeForMeasure(degree, chord, useSeventh) {
		if (useSeventh) {
			return formatDegreeForChord(degree, chord ? chord.nombre : '');
		}

		return formatTriadDegreeForChord(degree, chord ? chord.nombre : '');
	}

	function formatTriadDegreeForChord(degree, chordName) {
		var cleanDegree = cleanDegreeName(degree);
		var suffix = chordQuality.chordQualitySuffix(chordName);
		var transformedDegree;

		if (!cleanDegree) {
			return '';
		}

		if (chordQuality.isDiminishedSeventhQuality(chordName)) {
			return cleanDegree.toLowerCase() + '\u00ba';
		}

		if (chordQuality.isMinorSuffix(suffix)) {
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
		var cleanDegree = cleanDegreeName(degree);
		var normalizedChordName = chordQuality.normalizeChordText(chordName);
		var suffix = chordQuality.chordQualitySuffix(normalizedChordName);
		var transformedDegree;

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

		transformedDegree += suffix;

		if (transformedDegree.indexOf('m7') >= 0 && transformedDegree.indexOf('dim7') === -1) {
			transformedDegree = transformedDegree.replace('m', '');
		}

		return transformedDegree;
	}

	function cleanDegreeName(degree) {
		return String(degree || '').replace('J', '').replace('M', '').replace('m', '');
	}

	global.CodaProgressionFormatting = {
		chordQualitySuffix: chordQuality.chordQualitySuffix,
		displayDegree: displayDegree,
		displayName: displayName,
		formatDegreeForChord: formatDegreeForChord,
		formatDegreeForMeasure: formatDegreeForMeasure,
		formatTriadDegreeForChord: formatTriadDegreeForChord,
		isDiminishedSeventhQuality: chordQuality.isDiminishedSeventhQuality,
		isMinorQuality: chordQuality.isMinorQuality,
		triadName: chordQuality.triadName
	};
})(window);
