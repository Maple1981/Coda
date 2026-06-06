// Highlights notes currently sounding in the rendered instrument view.
(function (global) {
	'use strict';

	var activeCounts = {};
	var activeClass = 'isPlayingInstrumentNote';

	function noteOn(midiNotes) {
		var notes = normalizeMidiNotes(midiNotes);

		for (var i = 0; i < notes.length; i++) {
			activeCounts[notes[i]] = (activeCounts[notes[i]] || 0) + 1;
			setNoteClass(notes[i], true);
		}
	}

	function noteOff(midiNotes) {
		var notes = normalizeMidiNotes(midiNotes);

		for (var i = 0; i < notes.length; i++) {
			if (activeCounts[notes[i]]) {
				activeCounts[notes[i]] -= 1;
			}

			if (!activeCounts[notes[i]]) {
				delete activeCounts[notes[i]];
				setNoteClass(notes[i], false);
			}
		}
	}

	function clear() {
		var elements = instrumentNoteElements('.' + activeClass);

		activeCounts = {};
		for (var i = 0; i < elements.length; i++) {
			elements[i].classList.remove(activeClass);
		}
	}

	function setNoteClass(midiNote, active) {
		var elements = instrumentNoteElements('[data-midi-note="' + String(midiNote) + '"]');

		for (var i = 0; i < elements.length; i++) {
			elements[i].classList.toggle(activeClass, active);
		}
	}

	function instrumentNoteElements(selectorSuffix) {
		if (!global.document || typeof global.document.querySelectorAll !== 'function') {
			return [];
		}

		return global.document.querySelectorAll('#instrumento .celdaNota span' + selectorSuffix);
	}

	function normalizeMidiNotes(midiNotes) {
		var source = Array.isArray(midiNotes) ? midiNotes : [midiNotes];
		var normalized = [];
		var seen = {};
		var value;

		for (var i = 0; i < source.length; i++) {
			value = Number(source[i]);
			if (isFinite(value) && !seen[value]) {
				seen[value] = true;
				normalized.push(value);
			}
		}

		return normalized;
	}

	global.CodaInstrumentNoteHighlight = {
		clear: clear,
		noteOff: noteOff,
		noteOn: noteOn,
		normalizeMidiNotes: normalizeMidiNotes
	};
})(window);
