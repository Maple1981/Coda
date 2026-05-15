// Note-name presentation helpers. Internal musical identifiers remain in
// Anglo-Saxon notation; this service only formats visible labels.
(function (global) {
	'use strict';

	var latinRoots = {
		C: 'Do',
		D: 'Re',
		E: 'Mi',
		F: 'Fa',
		G: 'Sol',
		A: 'La',
		B: 'Si'
	};

	function normalizeStyle(style) {
		return style === 'latin' ? 'latin' : 'anglosaxon';
	}

	function formatNoteName(noteName, style) {
		var parsed = parseNoteName(noteName);

		if (!parsed) {
			return noteName;
		}

		return formatRoot(parsed.root, normalizeAccidental(parsed.accidental), normalizeStyle(style));
	}

	function formatKeyName(keyName, style) {
		var parsed = parseNoteName(keyName);

		if (!parsed) {
			return keyName;
		}

		return formatRoot(parsed.root, normalizeAccidental(parsed.accidental), normalizeStyle(style)) + parsed.suffix;
	}

	function formatChordName(chordName, style) {
		return formatKeyName(chordName, style);
	}

	function formatNoteSequence(sequence, style) {
		if (!sequence) {
			return sequence;
		}

		return sequence.split('-').map(function (noteName) {
			return formatNoteName(noteName, style);
		}).join('-');
	}

	function formatTextNotes(text, style) {
		return String(text).replace(/\b([A-G])((?:##|bb|#|b|\u266F|\u266D|\uD834\uDD2A|\uD834\uDD2B)?)(?=\s|$)/g, function (match) {
			return formatNoteName(match, style);
		});
	}

	function parseNoteName(value) {
		var match = /^([A-G])((?:##|bb|#|b|\u266F|\u266D|\uD834\uDD2A|\uD834\uDD2B)?)(.*)$/.exec(value || '');

		if (!match) {
			return null;
		}

		return {
			accidental: match[2] || '',
			root: match[1],
			suffix: match[3] || ''
		};
	}

	function formatRoot(root, accidental, style) {
		if (style === 'latin') {
			return latinRoots[root] + accidental;
		}

		return root + accidental;
	}

	function normalizeAccidental(accidental) {
		if (accidental === '#' || accidental === '\u266F') {
			return '\u266F';
		}

		if (accidental === 'b' || accidental === '\u266D') {
			return '\u266D';
		}

		if (accidental === '##' || accidental === '\uD834\uDD2A') {
			return '\uD834\uDD2A';
		}

		if (accidental === 'bb' || accidental === '\uD834\uDD2B') {
			return '\uD834\uDD2B';
		}

		return accidental || '';
	}

	global.CodaNotation = {
		formatChordName: formatChordName,
		formatKeyName: formatKeyName,
		formatNoteName: formatNoteName,
		formatNoteSequence: formatNoteSequence,
		formatTextNotes: formatTextNotes,
		normalizeStyle: normalizeStyle
	};
})(window);
