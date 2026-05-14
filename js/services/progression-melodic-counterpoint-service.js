// Adds weak-beat passing notes to one melodic voice when counterpoint is high.
(function (global) {
	'use strict';

	var pitchService = global.CodaProgressionPitch;

	function annotateMeasures(measures, progressionState, options) {
		var counterpoint = numberOrDefault(progressionState.counterpoint, 0);
		var rng;
		var melodicVoiceIndex;

		options = options || {};
		rng = typeof options.rng === 'function' ? options.rng : function () { return 0.5; };
		if (!measures || measures.length < 2 || counterpoint < 55) {
			return measures;
		}

		melodicVoiceIndex = chooseMelodicVoiceIndex(progressionState.voices, rng);
		for (var i = 0; i < measures.length - 1; i++) {
			addPassingNote(measures[i], measures[i + 1], melodicVoiceIndex, counterpoint, rng, options);
		}

		return measures;
	}

	function chooseMelodicVoiceIndex(voices, rng) {
		var voiceCount = Math.max(1, Math.min(Number(voices) || 4, 6));
		var roll = rng();

		if (voiceCount < 3) {
			return voiceCount - 1;
		}

		if (roll < 0.72) {
			return voiceCount - 1;
		}

		if (roll < 0.84) {
			return 0;
		}

		return Math.max(1, Math.min(voiceCount - 2, Math.floor(rng() * voiceCount)));
	}

	function addPassingNote(measure, nextMeasure, voiceIndex, counterpoint, rng, options) {
		var currentNote = voiceNoteAt(measure, voiceIndex);
		var nextNote = voiceNoteAt(nextMeasure, voiceIndex);
		var scaleNotes = scaleNotesForMeasure(measure, options);
		var passingNote;
		var durationSeconds;

		if (!currentNote || !nextNote || !scaleNotes.length || Math.abs(nextNote.midiNote - currentNote.midiNote) < 3) {
			return;
		}

		if (rng() > Math.min(0.82, 0.18 + counterpoint / 125)) {
			return;
		}

		passingNote = choosePassingNote(currentNote, nextNote, scaleNotes, measure.notes || [], options.initialMidiNote || 60);
		if (!passingNote) {
			return;
		}

		durationSeconds = Math.max(0.08, (Number(measure.durationSeconds) || 0.5) * 0.22);
		measure.melodicVoiceIndex = voiceIndex;
		measure.passingNotes = (measure.passingNotes || []).concat([{
			delaySeconds: (Number(measure.durationSeconds) || 0) * 0.5,
			durationSeconds: durationSeconds,
			midiNote: passingNote.midiNote,
			note: passingNote.note,
			voiceIndex: voiceIndex
		}]);
	}

	function choosePassingNote(currentNote, nextNote, scaleNotes, chordNotes, initialMidiNote) {
		var currentMidi = currentNote.midiNote;
		var nextMidi = nextNote.midiNote;
		var low = Math.min(currentMidi, nextMidi);
		var high = Math.max(currentMidi, nextMidi);
		var direction = nextMidi > currentMidi ? 1 : -1;
		var candidates = [];

		for (var i = 0; i < scaleNotes.length; i++) {
			var noteName = scaleNotes[i].nombre || scaleNotes[i];
			var midiNote = pitchService.noteNameToMidi(noteName, initialMidiNote);

			if (midiNote == null || isChordTone(noteName, chordNotes)) {
				continue;
			}

			midiNote = pitchService.nearestMidiTo(currentMidi + direction * 2, midiNote);
			if (midiNote > low && midiNote < high) {
				candidates.push({
					midiNote: midiNote,
					note: noteName,
					score: Math.abs((currentMidi + nextMidi) / 2 - midiNote)
				});
			}
		}

		candidates.sort(function (a, b) {
			return a.score - b.score;
		});

		return candidates[0] || null;
	}

	function scaleNotesForMeasure(measure, options) {
		var sourceScales = options && options.sourceScaleNotesByIndex ? options.sourceScaleNotesByIndex : {};

		if (measure.sourceScaleIndex != null && sourceScales[measure.sourceScaleIndex]) {
			return sourceScales[measure.sourceScaleIndex];
		}

		return options && options.scaleNotes ? options.scaleNotes : [];
	}

	function voiceNoteAt(measure, voiceIndex) {
		var voiceNotes = measure && measure.voiceNotes ? measure.voiceNotes : [];

		return voiceNotes[Math.min(voiceIndex, voiceNotes.length - 1)];
	}

	function isChordTone(noteName, chordNotes) {
		var normalized = pitchService.normalizePitchName(noteName);

		for (var i = 0; i < (chordNotes || []).length; i++) {
			if (pitchService.normalizePitchName(chordNotes[i]) === normalized) {
				return true;
			}
		}

		return false;
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionMelodicCounterpoint = {
		annotateMeasures: annotateMeasures,
		chooseMelodicVoiceIndex: chooseMelodicVoiceIndex,
		choosePassingNote: choosePassingNote
	};
})(window);
