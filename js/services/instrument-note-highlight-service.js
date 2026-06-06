// Highlights notes currently sounding in the rendered instrument view.
(function (global) {
	'use strict';

	var activeCounts = {};
	var activeClass = 'isPlayingInstrumentNote';

	function noteOn(midiNotes) {
		var notes = normalizeMidiNotes(midiNotes);

		for (var i = 0; i < notes.length; i++) {
			activeCounts[notes[i]] = (activeCounts[notes[i]] || 0) + 1;
		}

		refreshActiveHighlights();
	}

	function noteOff(midiNotes) {
		var notes = normalizeMidiNotes(midiNotes);

		for (var i = 0; i < notes.length; i++) {
			if (activeCounts[notes[i]]) {
				activeCounts[notes[i]] -= 1;
			}

			if (!activeCounts[notes[i]]) {
				delete activeCounts[notes[i]];
			}
		}

		refreshActiveHighlights();
	}

	function clear() {
		var elements = instrumentNoteElements('.' + activeClass);

		activeCounts = {};
		for (var i = 0; i < elements.length; i++) {
			elements[i].classList.remove(activeClass);
		}
	}

	function refreshActiveHighlights() {
		var activeElements = instrumentNoteElements('.' + activeClass);
		var activeNotes = Object.keys(activeCounts).map(function (midiNote) {
			return Number(midiNote);
		}).filter(function (midiNote) {
			return isFinite(midiNote);
		}).sort(function (a, b) {
			return a - b;
		});
		var targets = highlightTargetsForMidiNotes(activeNotes);

		for (var i = 0; i < activeElements.length; i++) {
			activeElements[i].classList.remove(activeClass);
		}

		for (var j = 0; j < targets.length; j++) {
			targets[j].classList.add(activeClass);
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

	function highlightTargetsForMidiNotes(midiNotes) {
		var source = [];

		for (var i = 0; i < midiNotes.length; i++) {
			source = source.concat(Array.prototype.slice.call(instrumentNoteElements('[data-midi-note="' + String(midiNotes[i]) + '"]')));
		}

		return coherentHighlightTargets(source, midiNotes);
	}

	function coherentHighlightTargets(elements, midiNotes) {
		var source = Array.prototype.slice.call(elements || []);
		var regularTargets = source.filter(function (element) {
			return !isGuitarNoteElement(element);
		});
		var guitarTargets = source.filter(isGuitarNoteElement);

		if (!guitarTargets.length) {
			return source;
		}

		return regularTargets.concat(coherentGuitarTargets(guitarTargets, midiNotes));
	}

	function coherentGuitarTargets(elements, midiNotes) {
		var notes = normalizeMidiNotes(midiNotes).sort(function (a, b) {
			return a - b;
		});
		var grouped = {};
		var assignment;

		for (var i = 0; i < elements.length; i++) {
			var midiNote = elementMidiNote(elements[i]);

			if (!grouped[midiNote]) {
				grouped[midiNote] = [];
			}
			grouped[midiNote].push(elements[i]);
		}

		for (var j = 0; j < notes.length; j++) {
			if (!grouped[notes[j]] || !grouped[notes[j]].length) {
				return greedyUniqueGuitarTargets(elements);
			}
			grouped[notes[j]].sort(function (a, b) {
				return guitarNoteSortValue(a) - guitarNoteSortValue(b);
			});
		}

		assignment = bestGuitarTargetAssignment(notes, grouped, 0, {}, []);

		return assignment && assignment.targets ? assignment.targets : greedyUniqueGuitarTargets(elements);
	}

	function bestGuitarTargetAssignment(notes, grouped, index, usedStrings, targets) {
		var midiNote;
		var candidates;
		var best = null;

		if (index >= notes.length) {
			return {
				score: guitarTargetAssignmentScore(targets),
				targets: targets.slice()
			};
		}

		midiNote = notes[index];
		candidates = grouped[midiNote] || [];

		for (var i = 0; i < candidates.length; i++) {
			var stringIndex = guitarStringIndex(candidates[i]);
			var candidate;

			if (usedStrings[stringIndex]) {
				continue;
			}

			usedStrings[stringIndex] = true;
			targets.push(candidates[i]);
			candidate = bestGuitarTargetAssignment(notes, grouped, index + 1, usedStrings, targets);
			targets.pop();
			delete usedStrings[stringIndex];

			if (candidate && (!best || candidate.score < best.score)) {
				best = candidate;
			}
		}

		return best;
	}

	function greedyUniqueGuitarTargets(elements) {
		var sorted = Array.prototype.slice.call(elements || []).sort(function (a, b) {
			return guitarNoteSortValue(a) - guitarNoteSortValue(b);
		});
		var usedStrings = {};
		var targets = [];

		for (var i = 0; i < sorted.length; i++) {
			var stringIndex = guitarStringIndex(sorted[i]);

			if (usedStrings[stringIndex]) {
				continue;
			}

			usedStrings[stringIndex] = true;
			targets.push(sorted[i]);
		}

		return targets;
	}

	function guitarTargetAssignmentScore(elements) {
		var frets = [];
		var score = 0;
		var openCount = 0;
		var fretCounts = {};
		var bassStringIndex = elements[0] ? guitarStringIndex(elements[0]) : 0;

		for (var i = 0; i < elements.length; i++) {
			var fret = guitarFretNumber(elements[i]);

			if (fret === 0) {
				openCount += 1;
				continue;
			}

			frets.push(fret);
			fretCounts[fret] = (fretCounts[fret] || 0) + 1;
		}

		if (frets.length) {
			frets.sort(function (a, b) {
				return a - b;
			});
			score += (frets[frets.length - 1] - frets[0]) * 20;
			score += frets[0];
		}

		Object.keys(fretCounts).forEach(function (fret) {
			if (fretCounts[fret] > 1) {
				score -= (fretCounts[fret] - 1) * 4;
			}
		});

		score -= openCount * 6;
		score += Math.max(0, bassStringIndex - 2) * 12;

		return score;
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
		return guitarFretNumber(element) * 100 + guitarStringIndex(element);
	}

	function isGuitarNoteElement(element) {
		return !!guitarNoteCell(element);
	}

	function guitarNoteCell(element) {
		return element && element.closest ? element.closest('.guitarNoteCell') : null;
	}

	function elementMidiNote(element) {
		return numberOrDefault(element && element.getAttribute ? element.getAttribute('data-midi-note') : null, NaN);
	}

	function guitarFretNumber(element) {
		var cell = guitarNoteCell(element);

		return numberOrDefault(cell && cell.getAttribute ? cell.getAttribute('data-fret-number') : null, 99);
	}

	function guitarStringIndex(element) {
		var cell = guitarNoteCell(element);

		return numberOrDefault(cell && cell.getAttribute ? cell.getAttribute('data-string-index') : null, 99);
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
		coherentGuitarTargets: coherentGuitarTargets,
		coherentHighlightTargets: coherentHighlightTargets,
		highlightTargets: highlightTargets,
		highlightTargetsForMidiNotes: highlightTargetsForMidiNotes,
		noteOff: noteOff,
		noteOn: noteOn,
		normalizeMidiNotes: normalizeMidiNotes
	};
})(window);
