// Decides when a generated chord should use a seventh instead of a triad.
(function (global) {
	'use strict';

	var voicingService = global.CodaProgressionVoicing;

	function shouldUseSeventh(context) {
		var progressionState = context.progressionState;
		var resolvedDegree = context.resolvedDegree;
		var nextResolvedDegree = context.resolvedDegrees[context.index + 1];
		var rng = typeof context.options.rng === 'function' ? context.options.rng : function () { return 1; };
		var degreeIndex = resolvedDegree.degreeIndex;
		var voices = Math.max(1, Math.min(numberOrDefault(progressionState.voices, 4), 6));
		var probability = 0.08;

		if (!resolvedDegree.chord || voices < 4) {
			return false;
		}

		if (context.options.avoidDominantSeventh && isDominantSeventhChord(resolvedDegree.chord)) {
			return false;
		}

		if (isTonicBoundary(context.index, context.resolvedDegrees.length, degreeIndex)) {
			return false;
		}

		probability += Math.max(0, numberOrDefault(progressionState.tensions, 0) - 25) / 250;
		probability += Math.max(0, numberOrDefault(progressionState.counterpoint, 0) - 35) / 350;

		if (degreeIndex === 4 || degreeIndex === 1) {
			probability += 0.14;
		}

		if (nextResolvedDegree && nextResolvedDegree.degreeIndex === 0) {
			probability += 0.12;
		}

		if (seventhImprovesMovement(context)) {
			probability += 0.22;
		}

		return rng() < Math.min(0.72, probability);
	}

	function seventhImprovesMovement(context) {
		var previousPlan = context.previousPlan;
		var chord = context.resolvedDegree.chord;
		var initialMidiNote = context.options.initialMidiNote || 60;
		var voices = context.progressionState.voices;
		var triadVoicing;
		var seventhVoicing;

		if (!previousPlan || !chord) {
			return false;
		}

		triadVoicing = voicingService.chooseVoicing({
			baseNotes: triadNotes(chord),
			chordName: chord.nombre,
			extraNotes: [],
			initialMidiNote: initialMidiNote,
			kind: 'triad',
			previousPlan: previousPlan,
			voicing: context.progressionState.voicing,
			voices: voices
		});
		seventhVoicing = voicingService.chooseVoicing({
			baseNotes: chordNotes(chord),
			chordName: chord.nombre,
			extraNotes: [],
			initialMidiNote: initialMidiNote,
			kind: 'seventh',
			previousPlan: previousPlan,
			voicing: context.progressionState.voicing,
			voices: voices
		});

		return voicingService.voiceLeadingTransitionScore(previousPlan, seventhVoicing) + 2 <= voicingService.voiceLeadingTransitionScore(previousPlan, triadVoicing);
	}

	function isTonicBoundary(index, length, degreeIndex) {
		return degreeIndex === 0 && (index === 0 || index === length - 1);
	}

	function chordNotes(chord) {
		if (!chord) {
			return [];
		}

		if (chord.factorNotes && chord.factorNotes.length) {
			return chord.factorNotes.slice();
		}

		return [chord.fundamental, chord.tercera, chord.quinta, chord.septima];
	}

	function isDominantSeventhChord(chord) {
		return !!(chord && /(^|[^a-z])7$/.test(String(chord.nombre || '')) && String(chord.nombre || '').indexOf('maj7') === -1);
	}

	function triadNotes(chord) {
		if (!chord) {
			return [];
		}

		if (chord.factorNotes && chord.factorNotes.length) {
			return chord.factorNotes.slice(0, 3);
		}

		return [chord.fundamental, chord.tercera, chord.quinta];
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionSeventhDecision = {
		chordNotes: chordNotes,
		isDominantSeventhChord: isDominantSeventhChord,
		shouldUseSeventh: shouldUseSeventh,
		triadNotes: triadNotes
	};
})(window);
