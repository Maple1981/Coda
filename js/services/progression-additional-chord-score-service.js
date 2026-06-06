// Scores candidate chords inserted inside an existing progression measure.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var chordQualityService = global.CodaProgressionChordQuality;
	var styleService = global.CodaProgressionStyle;
	var tonalFunctionService = global.CodaProgressionTonalFunction;
	var voicingService = global.CodaProgressionVoicing;

	function score(options) {
		var currentCommon = voicingService.commonPitchNames(options.currentMeasure, options.chordPlan).length;
		var nextCommon = options.nextMeasure ? voicingService.commonPitchNames(options.chordPlan, options.nextMeasure).length : 0;
		var currentFunction = options.currentMeasure.tonalFunction || '';
		var nextFunction = options.nextMeasure ? options.nextMeasure.tonalFunction || '' : '';
		var candidateFunction = tonalFunctionService.forDegree(options.report.scaleDefinition, options.resolvedDegree.degreeIndex);
		var result = 0;

		result += currentCommon * 9;
		result += nextCommon * 7;

		if (currentCommon > 0 && (!options.nextMeasure || nextCommon > 0)) {
			result += 10;
		}

		if (candidateFunction && candidateFunction === currentFunction) {
			result += currentFunction === 'T' ? 18 : 8;
		} else if (currentFunction && candidateFunction) {
			result -= currentFunction === 'T' ? 8 : 4;
		}

		if (candidateFunction && candidateFunction === nextFunction) {
			result += 4;
		}

		if (options.nextMeasure && sameChordFamily(options.resolvedDegree.chord, options.nextMeasure)) {
			result -= 16;
		}

		result -= diminishedCandidatePenalty(options);
		result -= voicingService.voiceLeadingTransitionScore(options.currentMeasure, options.chordPlan) * 0.45;

		if (options.nextPlan) {
			result -= voicingService.voiceLeadingTransitionScore(options.chordPlan, options.nextPlan) * 0.35;
		}

		if (currentCommon === 0 && nextCommon === 0) {
			result -= 24;
		}

		result += (typeof options.rng === 'function' ? options.rng() : Math.random()) * 2.5;

		return result;
	}

	function sameChordFamily(chord, measure) {
		return measure && (measure.chord === chord || measure.chordName === chord.nombre || measure.chordName === formattingService.triadName(chord));
	}

	function diminishedCandidatePenalty(options) {
		var chord = options && options.resolvedDegree && options.resolvedDegree.chord;
		var scale = styleService && typeof styleService.diminishedHarmonyScale === 'function' ?
			styleService.diminishedHarmonyScale(options && options.progressionState) :
			0.32;

		if (
			!styleService ||
			typeof styleService.minimizesDiminishedHarmony !== 'function' ||
			!styleService.minimizesDiminishedHarmony(options && options.progressionState) ||
			!chordQualityService ||
			typeof chordQualityService.isDiminishedSeventhQuality !== 'function' ||
			!chordQualityService.isDiminishedSeventhQuality(chord && chord.nombre)
		) {
			return 0;
		}

		return 42 * (1 - Math.max(0, Math.min(1, scale)));
	}

	global.CodaProgressionAdditionalChordScore = {
		diminishedCandidatePenalty: diminishedCandidatePenalty,
		sameChordFamily: sameChordFamily,
		score: score
	};
})(window);
