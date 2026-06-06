// Chord-plan builder for generated progressions.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var pitchService = global.CodaProgressionPitch;
	var seventhDecisionService = global.CodaProgressionSeventhDecision;
	var suspensionService = global.CodaProgressionSuspension;
	var tensionService = global.CodaProgressionTensions;
	var tonalFunctionService = global.CodaProgressionTonalFunction;
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
			cadentialRole: resolvedDegree.cadentialRole,
			chromaticRole: resolvedDegree.chromaticRole,
			kind: useSeventh ? 'seventh' : 'triad',
			nextChordNotes: nextTriadNotes(context),
			rng: context.options.rng,
			scaleNotes: context.options.scaleNotes,
			style: context.progressionState.style,
			tensions: context.progressionState.tensions,
			tonalFunction: resolvedDegree.tonalFunctionOverride || tonalFunctionForDegree(context.options.scaleDefinition, resolvedDegree.degreeIndex),
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
			openingTonic: context.index === 0 && resolvedDegree.degreeIndex === 0,
			openingTonicInversionPolicy: openingTonicInversionPolicy(context),
			previousPlan: context.previousPlan,
			registerCenterMidi: registerCenterMidi(context.options),
			commonToneStickiness: sustainedInstrumentCommonToneStickiness(context.progressionState),
			voicing: context.progressionState.voicing,
			voices: context.progressionState.voices
		});
		chordName = chord.displayName || (useSeventh ? chord.nombre : formattingService.triadName(chord));

		return {
			chordName: chordName,
			degree: resolvedDegree.degreeDisplayName || formattingService.formatDegreeForMeasure(resolvedDegree.degree, chord, useSeventh),
			inversionIndex: voicing.inversionIndex,
			inversionLabel: voicing.inversionLabel,
			inversionRunKey: voicing.inversionRunKey != null ? voicing.inversionRunKey : voicingService.inversionRunKey(voicing),
			inversionRunLength: voicing.inversionRunLength != null ? voicing.inversionRunLength : voicingService.nextInversionRunLength(context.previousPlan, voicing),
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

	function nextTriadNotes(context) {
		var nextResolvedDegree = context.resolvedDegrees[context.index + 1];

		return nextResolvedDegree && nextResolvedDegree.chord ? triadNotes(nextResolvedDegree.chord) : [];
	}

	function tonalFunctionForDegree(scaleDefinition, degreeIndex) {
		return tonalFunctionService.forDegree(scaleDefinition, degreeIndex);
	}

	function registerCenterMidi(options) {
		var initialMidiNote = Number(options && options.initialMidiNote) || 60;
		var scaleNotes = options && options.scaleNotes ? options.scaleNotes : [];
		var tonicName = scaleNotes[0] && (scaleNotes[0].nombre || scaleNotes[0].note || scaleNotes[0].name);
		var tonicMidi = tonicName ? pitchService.noteNameToMidi(tonicName, initialMidiNote) : initialMidiNote;

		if (tonicMidi == null) {
			tonicMidi = initialMidiNote;
		}

		return pitchService.nearestMidiTo(initialMidiNote, tonicMidi) + 6;
	}

	function openingTonicInversionPolicy(context) {
		var rng = context && context.options && typeof context.options.rng === 'function' ? context.options.rng : null;
		var roll;

		if (
			!context ||
			context.index !== 0 ||
			!context.resolvedDegree ||
			context.resolvedDegree.degreeIndex !== 0 ||
			!context.options ||
			!context.options.allowRandomOpeningTonicInversion ||
			!rng ||
			rng !== Math.random
		) {
			return 'root';
		}

		roll = rng();
		if (roll < 0.01) {
			return 'upper';
		}

		if (roll < 0.08) {
			return 'first';
		}

		return 'root';
	}

	function sustainedInstrumentCommonToneStickiness(progressionState) {
		var instrument = progressionState && progressionState.midiInstrument;
		var sustainedInstruments = {
			drawbar_organ: true,
			pad_2_warm: true,
			string_ensemble_1: true
		};

		return sustainedInstruments[instrument] && isSustainArticulation(progressionState) ? 42 : 0;
	}

	function isSustainArticulation(progressionState) {
		var articulation = progressionState && progressionState.articulation;

		return !articulation || articulation === 'sustain';
	}

	global.CodaProgressionChordPlan = {
		build: build,
		chordNotes: chordNotes,
		openingTonicInversionPolicy: openingTonicInversionPolicy,
		nextTriadNotes: nextTriadNotes,
		registerCenterMidi: registerCenterMidi,
		sustainedInstrumentCommonToneStickiness: sustainedInstrumentCommonToneStickiness,
		suspendedNotes: suspendedNotes,
		triadNotes: triadNotes
	};
})(window);
