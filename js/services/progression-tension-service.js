// Rules for adding safe chord tensions to generated progressions.
(function (global) {
	'use strict';

	var NOTE_INDEXES = {
		C: 0,
		'C#': 1,
		Db: 1,
		D: 2,
		'D#': 3,
		Eb: 3,
		E: 4,
		F: 5,
		'F#': 6,
		Gb: 6,
		G: 7,
		'G#': 8,
		Ab: 8,
		A: 9,
		'A#': 10,
		Bb: 10,
		B: 11
	};

	function addToNotes(notes, options) {
		var result = notes.slice();
		var labels = [];
		var maxVoices = Math.max(1, Math.min(numberOrDefault(options.voices, 4), 6));
		var slots = Math.max(0, maxVoices - result.length);
		var desiredTensions = desiredTensionCount(options.tensions);
		var candidates = availableCandidates(notes, options);
		var selectedCount = Math.min(slots, desiredTensions, candidates.length);

		for (var i = 0; i < selectedCount; i++) {
			result.push(candidates[i].note);
			labels.push(tensionLabel(candidates[i].label, options.kind));
		}

		return {
			label: labels.join(' '),
			notes: result.slice(0, maxVoices)
		};
	}

	function desiredTensionCount(tensions) {
		var value = numberOrDefault(tensions, 0);

		if (value >= 85) {
			return 3;
		}

		if (value >= 65) {
			return 2;
		}

		if (value >= 40) {
			return 1;
		}

		return 0;
	}

	function availableCandidates(notes, options) {
		var scaleNotes = options.scaleNotes || [];
		var candidates = [
			{ degreeOffset: 1, label: '9' },
			{ degreeOffset: 3, label: '11' },
			{ degreeOffset: 5, label: '13' }
		];
		var result = [];

		for (var i = 0; i < candidates.length; i++) {
			var scaleNote = scaleNotes.length ? scaleNotes[(options.degreeIndex + candidates[i].degreeOffset) % scaleNotes.length] : null;

			if (!scaleNote || containsPitchName(notes, scaleNote.nombre) || createsUpperSemitone(scaleNote.nombre, notes)) {
				continue;
			}

			result.push({
				label: candidates[i].label,
				note: scaleNote.nombre
			});
		}

		return result;
	}

	function containsPitchName(notes, noteName) {
		var normalizedNote = normalizePitchName(noteName);

		for (var i = 0; i < notes.length; i++) {
			if (normalizePitchName(notes[i]) === normalizedNote) {
				return true;
			}
		}

		return false;
	}

	function createsUpperSemitone(tensionNote, structuralNotes) {
		var tensionIndex = noteIndex(tensionNote);

		if (tensionIndex == null) {
			return false;
		}

		for (var i = 0; i < structuralNotes.length; i++) {
			var structuralIndex = noteIndex(structuralNotes[i]);

			if (structuralIndex != null && (tensionIndex - structuralIndex + 12) % 12 === 1) {
				return true;
			}
		}

		return false;
	}

	function tensionLabel(label, kind) {
		return kind === 'seventh' ? label : 'add' + label;
	}

	function noteIndex(noteName) {
		var normalized = normalizePitchName(noteName);

		return Object.prototype.hasOwnProperty.call(NOTE_INDEXES, normalized) ? NOTE_INDEXES[normalized] : null;
	}

	function normalizePitchName(noteName) {
		return String(noteName || '').replace('♭', 'b');
	}

	function numberOrDefault(value, fallback) {
		var parsed = Number(value);

		return Number.isFinite(parsed) ? parsed : fallback;
	}

	global.CodaProgressionTensions = {
		addToNotes: addToNotes,
		availableCandidates: availableCandidates,
		containsPitchName: containsPitchName,
		createsUpperSemitone: createsUpperSemitone,
		desiredTensionCount: desiredTensionCount,
		tensionLabel: tensionLabel
	};
})(window);
