// Chord-plan builder for generated progressions.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var tensionService = global.CodaProgressionTensions;
	var voicingService = global.CodaProgressionVoicing;

	function build(context) {
		var resolvedDegree = context.resolvedDegree;
		var chord = resolvedDegree.chord;
		var useSeventh = context.options.forceKind ? context.options.forceKind === 'seventh' : shouldUseSeventh(context);
		var baseNotes = useSeventh ? chordNotes(chord) : triadNotes(chord);
		var suspension = context.options.preventSuspension ? null : chooseSuspension(context, baseNotes, useSeventh ? 'seventh' : 'triad');
		var tensionOptions;
		var voicing;
		var chordName;

		if (suspension) {
			baseNotes = suspendedNotes(baseNotes, suspension.note);
		}

		tensionOptions = context.options.includeTensions ? tensionService.addToNotes(baseNotes, {
			degreeIndex: resolvedDegree.degreeIndex,
			kind: useSeventh ? 'seventh' : 'triad',
			rng: context.options.rng,
			scaleNotes: context.options.scaleNotes,
			tensions: context.progressionState.tensions,
			voices: context.progressionState.voices
		}) : {
			label: '',
			notes: baseNotes
		};
		voicing = voicingService.chooseVoicing({
			baseNotes: baseNotes,
			chordName: chord.nombre,
			extraNotes: tensionOptions.notes.slice(baseNotes.length),
			forceInversionIndex: context.options.forceInversionIndex,
			initialMidiNote: context.options.initialMidiNote || 60,
			kind: useSeventh ? 'seventh' : 'triad',
			previousPlan: context.previousPlan,
			voicing: context.progressionState.voicing,
			voices: context.progressionState.voices
		});
		chordName = useSeventh ? chord.nombre : formattingService.triadName(chord);

		return {
			chordName: chordName,
			degree: formattingService.formatDegreeForMeasure(resolvedDegree.degree, chord, useSeventh),
			inversionIndex: voicing.inversionIndex,
			inversionLabel: voicing.inversionLabel,
			kind: useSeventh ? 'seventh' : 'triad',
			midiNotes: voicing.midiNotes,
			notes: voicing.notes,
			suspension: suspension ? suspension.label : '',
			tensionLabel: tensionOptions.label,
			voiceNotes: voicing.voiceNotes
		};
	}

	function chooseSuspension(context, baseNotes, kind) {
		var chord = context.resolvedDegree.chord;
		var previousPlan = context.previousPlan;
		var progressionState = context.progressionState;
		var rng = typeof context.options.rng === 'function' ? context.options.rng : function () { return 1; };
		var label;
		var suspensionNote;
		var originalVoicing;
		var suspendedVoicing;
		var probability;
		var originalScore;
		var suspendedScore;

		if (!chord || !previousPlan || !chord.segunda || !chord.cuarta || baseNotes.length < 3) {
			return null;
		}

		if (isTonicBoundary(context.index, context.resolvedDegrees.length, context.resolvedDegree.degreeIndex)) {
			return null;
		}

		label = formattingService.isMinorQuality(chord.nombre) ? 'sus2' : 'sus4';
		suspensionNote = label === 'sus2' ? chord.segunda : chord.cuarta;
		originalVoicing = voicingService.chooseVoicing({
			baseNotes: baseNotes,
			chordName: chord.nombre,
			extraNotes: [],
			initialMidiNote: context.options.initialMidiNote || 60,
			kind: kind,
			previousPlan: previousPlan,
			voicing: progressionState.voicing,
			voices: progressionState.voices
		});
		suspendedVoicing = voicingService.chooseVoicing({
			baseNotes: suspendedNotes(baseNotes, suspensionNote),
			chordName: chord.nombre,
			extraNotes: [],
			initialMidiNote: context.options.initialMidiNote || 60,
			kind: kind,
			previousPlan: previousPlan,
			voicing: progressionState.voicing,
			voices: progressionState.voices
		});
		originalScore = voicingService.voiceLeadingTransitionScore(previousPlan, originalVoicing);
		suspendedScore = voicingService.voiceLeadingTransitionScore(previousPlan, suspendedVoicing);
		probability = suspensionProbability({
			originalScore: originalScore,
			progressionState: progressionState,
			suspendedScore: suspendedScore
		});

		if (!voiceMovesParsimoniouslyToNote(previousPlan.voiceNotes, suspensionNote, context.options.initialMidiNote || 60)) {
			probability *= 0.5;
		}

		if (rng() >= Math.min(0.55, probability)) {
			return null;
		}

		return {
			label: label,
			note: suspensionNote
		};
	}

	function suspensionProbability(options) {
		var progressionState = options.progressionState || {};
		var probability = 0.045 +
			Math.max(0, numberOrDefault(progressionState.counterpoint, 0) - 25) / 360 +
			Math.max(0, numberOrDefault(progressionState.tensions, 0) - 30) / 430;

		if (numberOrDefault(progressionState.voices, 4) >= 4) {
			probability += 0.02;
		}

		if (progressionState.articulation === 'sustain' || progressionState.articulation === 'legato') {
			probability += 0.02;
		} else if (progressionState.articulation === 'staccato') {
			probability -= 0.035;
		}

		if (numberOrDefault(progressionState.counterpoint, 0) >= 70 && numberOrDefault(progressionState.tensions, 0) >= 70) {
			probability += 0.08;
		}

		if (options.suspendedScore <= options.originalScore) {
			probability += 0.14;
		} else if (options.suspendedScore <= options.originalScore + 2) {
			probability += 0.09;
		} else {
			probability -= 0.05;
		}

		return Math.max(0.03, probability);
	}

	function suspendedNotes(baseNotes, suspensionNote) {
		var result = baseNotes.slice();

		if (result.length > 1) {
			result[1] = suspensionNote;
		}

		return result;
	}

	function voiceMovesParsimoniouslyToNote(voiceNotes, noteName, initialMidiNote) {
		var targetMidi = voicingService.noteNameToMidi(noteName, initialMidiNote);

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			if (targetMidi != null && Math.abs(voicingService.nearestMidiTo(voiceNotes[i].midiNote, targetMidi) - voiceNotes[i].midiNote) <= 2) {
				return true;
			}
		}

		return false;
	}

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

		return [chord.fundamental, chord.tercera, chord.quinta, chord.septima];
	}

	function triadNotes(chord) {
		if (!chord) {
			return [];
		}

		return [chord.fundamental, chord.tercera, chord.quinta];
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionChordPlan = {
		build: build,
		chordNotes: chordNotes,
		suspendedNotes: suspendedNotes,
		triadNotes: triadNotes
	};
})(window);
