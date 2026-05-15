// Chord-plan builder for generated progressions.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var seventhDecisionService = global.CodaProgressionSeventhDecision;
	var suspensionService = global.CodaProgressionSuspension;
	var tensionService = global.CodaProgressionTensions;
	var voicingService = global.CodaProgressionVoicing;

	function build(context) {
		var resolvedDegree = context.resolvedDegree;
		var chord = resolvedDegree.chord;
		var useSeventh = context.options.forceKind ? context.options.forceKind === 'seventh' : seventhDecisionService.shouldUseSeventh(context);
		var baseNotes = useSeventh ? chordNotes(chord) : triadNotes(chord);
		var suspension = context.options.preventSuspension ? null : suspensionService.choose(context, baseNotes, useSeventh ? 'seventh' : 'triad');
		var tensionOptions;
		var voicing;
		var chordName;

		if (suspension) {
			baseNotes = suspensionService.suspendedNotes(baseNotes, suspension.note);
		}

		tensionOptions = context.options.includeTensions && !context.options.preventTensions ? tensionService.addToNotes(baseNotes, {
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

	function suspendedNotes(baseNotes, suspensionNote) {
		return suspensionService.suspendedNotes(baseNotes, suspensionNote);
	}

	function chordNotes(chord) {
		return seventhDecisionService.chordNotes(chord);
	}

	function triadNotes(chord) {
		return seventhDecisionService.triadNotes(chord);
	}

	global.CodaProgressionChordPlan = {
		build: build,
		chordNotes: chordNotes,
		suspendedNotes: suspendedNotes,
		triadNotes: triadNotes
	};
})(window);
