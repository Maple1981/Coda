// Builds timed progression measures from resolved harmonic degrees.
(function (global) {
	'use strict';

	var chordPlanService = global.CodaProgressionChordPlan;
	var formattingService = global.CodaProgressionFormatting;
	var melodicCounterpointService = global.CodaProgressionMelodicCounterpoint;
	var tonalFunctionService = global.CodaProgressionTonalFunction;
	var voiceLeadingService = global.CodaProgressionVoiceLeading;

	function build(resolvedDegrees, progressionState, secondsPerBeat, options) {
		var measures = [];
		var previousPlan = null;

		options = options || {};
		for (var i = 0; i < resolvedDegrees.length; i++) {
			var startBeat = i * progressionState.beatsPerBar;
			var durationBeats = progressionState.beatsPerBar;
			var chordOptions = optionsForDegree(options, resolvedDegrees[i]);
			var chordPlan = chordPlanService.build({
				index: i,
				options: chordOptions,
				previousPlan: previousPlan,
				progressionState: progressionState,
				resolvedDegree: resolvedDegrees[i],
				resolvedDegrees: resolvedDegrees
			});

			var measure = {
				articulation: progressionState.articulation,
				bar: i + 1,
				beatUnit: progressionState.beatUnit,
				chord: resolvedDegrees[i].chord,
				chordKind: chordPlan.kind,
				chordName: chordPlan.chordName,
				degreeIndex: resolvedDegrees[i].degreeIndex,
				degree: formattingService.displayDegree(chordPlan.degree, chordPlan.inversionLabel, chordPlan.suspension),
				displayName: formattingService.displayName(chordPlan.chordName, chordPlan.inversionLabel, chordPlan.suspension, chordPlan.tensionLabel),
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				endBeat: startBeat + durationBeats,
				endSeconds: (startBeat + durationBeats) * secondsPerBeat,
				inversion: chordPlan.inversionLabel,
				inversionIndex: chordPlan.inversionIndex,
				midiNotes: chordPlan.midiNotes,
				notes: chordPlan.notes,
				source: resolvedDegrees[i].source || 'diatonic',
				startBeat: startBeat,
				startSeconds: startBeat * secondsPerBeat,
				suspension: chordPlan.suspension,
				tonalFunction: resolvedDegrees[i].tonalFunctionOverride || tonalFunctionForDegree(options.scaleDefinition, resolvedDegrees[i].degreeIndex),
				voiceNotes: chordPlan.voiceNotes,
				voices: progressionState.voices
			};

			if (resolvedDegrees[i].cadentialRole) {
				measure.cadentialRole = resolvedDegrees[i].cadentialRole;
			}

			if (resolvedDegrees[i].chromaticRole) {
				measure.chromaticRole = resolvedDegrees[i].chromaticRole;
			}

			if (resolvedDegrees[i].modalRole) {
				measure.modalRole = resolvedDegrees[i].modalRole;
			}

			if (resolvedDegrees[i].sourceLabelKey) {
				measure.sourceLabelKey = resolvedDegrees[i].sourceLabelKey;
			}

			if (resolvedDegrees[i].sourceScaleIndex != null) {
				measure.sourceScaleIndex = resolvedDegrees[i].sourceScaleIndex;
				measure.sourceTonicName = resolvedDegrees[i].sourceTonicName || '';
			}

			measures.push(measure);
			previousPlan = chordPlan;
		}

		measures = voiceLeadingService.annotateMeasures(measures, progressionState);

		return melodicCounterpointService.annotateMeasures(measures, progressionState, {
			initialMidiNote: options.initialMidiNote,
			rng: options.rng,
			scaleNotes: options.scaleNotes,
			sourceScaleNotesByIndex: sourceScaleNotesByIndex(options.interchangeSources)
		});
	}

	function sourceScaleNotesByIndex(sources) {
		var result = {};

		for (var i = 0; i < (sources || []).length; i++) {
			result[sources[i].scaleIndex] = sources[i].scaleNotes || [];
		}

		return result;
	}

	function tonalFunctionForDegree(scaleDefinition, degreeIndex) {
		return tonalFunctionService.forDegree(scaleDefinition, degreeIndex);
	}

	function optionsForDegree(options, resolvedDegree) {
		var result = {};
		var key;

		for (key in options) {
			if (Object.prototype.hasOwnProperty.call(options, key)) {
				result[key] = options[key];
			}
		}

		if (resolvedDegree.forceKind) {
			result.forceKind = resolvedDegree.forceKind;
		}

		if (resolvedDegree.forceInversionIndex != null) {
			result.forceInversionIndex = resolvedDegree.forceInversionIndex;
		}

		if (resolvedDegree.preventSuspension) {
			result.preventSuspension = true;
		}

		if (resolvedDegree.preventTensions) {
			result.preventTensions = true;
		}

		return result;
	}

	global.CodaProgressionMeasureBuilder = {
		build: build,
		optionsForDegree: optionsForDegree,
		sourceScaleNotesByIndex: sourceScaleNotesByIndex,
		tonalFunctionForDegree: tonalFunctionForDegree
	};
})(window);
