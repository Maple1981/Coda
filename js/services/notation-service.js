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
		return String(text).replace(/\b([A-G])([#b♯♭]?)(?=\s|$)/g, function (match) {
			return formatNoteName(match, style);
		});
	}

	function parseNoteName(value) {
		var match = /^([A-G])([#b♯♭]?)(.*)$/.exec(value || '');

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
		if (accidental === '#') {
			return '♯';
		}

		if (accidental === 'b') {
			return '♭';
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
