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
		var targets = active ? highlightTargets(elements) : elements;

		for (var i = 0; i < targets.length; i++) {
			targets[i].classList.toggle(activeClass, active);
		}
	}

	function highlightTargets(elements) {
		var source = Array.prototype.slice.call(elements || []);
		var guitarNotes = source.filter(isGuitarNoteElement);
		var selectedGuitarNote;

		if (guitarNotes.length <= 1) {
			return source;
		}

		selectedGuitarNote = preferredGuitarNoteElement(guitarNotes);

		return source.filter(function (element) {
			return !isGuitarNoteElement(element) || element === selectedGuitarNote;
		});
	}

	function preferredGuitarNoteElement(elements) {
		var result = elements[0];

		for (var i = 1; i < elements.length; i++) {
			if (guitarNoteSortValue(elements[i]) < guitarNoteSortValue(result)) {
				result = elements[i];
			}
		}

		return result;
	}

	function guitarNoteSortValue(element) {
		var cell = guitarNoteCell(element);
		var fret = numberOrDefault(cell && cell.getAttribute ? cell.getAttribute('data-fret-number') : null, 99);
		var stringIndex = numberOrDefault(cell && cell.getAttribute ? cell.getAttribute('data-string-index') : null, 99);

		return fret * 100 + stringIndex;
	}

	function isGuitarNoteElement(element) {
		return !!guitarNoteCell(element);
	}

	function guitarNoteCell(element) {
		return element && element.closest ? element.closest('.guitarNoteCell') : null;
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

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaInstrumentNoteHighlight = {
		clear: clear,
		highlightTargets: highlightTargets,
		noteOff: noteOff,
		noteOn: noteOn,
		normalizeMidiNotes: normalizeMidiNotes
	};
})(window);
