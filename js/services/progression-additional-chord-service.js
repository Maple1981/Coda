// Chooses an additional chord for a split measure using tonal function and voice-leading heuristics.
(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var voicingService = global.CodaProgressionVoicing;

	function choose(options) {
		var report = options.report || {};
		var scaleChords = report.scaleChords || [];
		var scaleNotes = report.scaleNotes || [];
		var candidates = [];
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var previousPlan = measurePlan(options.measure);
		var nextPlan = options.nextMeasure ? measurePlan(options.nextMeasure) : null;
		var progressionState = options.progressionState;
		var initialMidiNote = options.data && options.data.midi ? options.data.midi.initialMidiNote : 60;
		var suspensionResolution = chooseSuspensionResolutionForMeasure({
			buildChordPlan: options.buildChordPlan,
			initialMidiNote: initialMidiNote,
			measure: options.measure,
			nextMeasure: options.nextMeasure,
			nextPlan: nextPlan,
			previousPlan: previousPlan,
			progressionState: progressionState,
			report: report,
			rng: rng
		});

		if (suspensionResolution) {
			return suspensionResolution;
		}

		for (var i = 0; i < scaleChords.length; i++) {
			var resolvedDegree;
			var chordPlan;
			var score;

			if (!scaleChords[i] || sameChordFamily(scaleChords[i], options.measure)) {
				continue;
			}

			resolvedDegree = {
				chord: scaleChords[i],
				degree: scaleNotes[i] ? scaleNotes[i].grado : '',
				degreeIndex: i,
				source: 'diatonic'
			};
			chordPlan = options.buildChordPlan({
				index: 1,
				options: {
					includeTensions: true,
					initialMidiNote: initialMidiNote,
					rng: rng,
					scaleDefinition: report.scaleDefinition,
					scaleNotes: scaleNotes
				},
				previousPlan: previousPlan,
				progressionState: progressionState,
				resolvedDegree: resolvedDegree,
				resolvedDegrees: [
					resolvedDegreeFromMeasure(options.measure, report) || resolvedDegree,
					resolvedDegree,
					resolvedDegreeFromMeasure(options.nextMeasure, report) || resolvedDegree
				]
			});
			score = additionalChordScore({
				chordPlan: chordPlan,
				currentMeasure: options.measure,
				nextMeasure: options.nextMeasure,
				nextPlan: nextPlan,
				progressionState: progressionState,
				report: report,
				resolvedDegree: resolvedDegree,
				rng: rng
			});

			candidates.push({
				chordPlan: chordPlan,
				reportScaleDefinition: report.scaleDefinition,
				resolvedDegree: resolvedDegree,
				score: score
			});
		}

		candidates.sort(function (a, b) {
			return b.score - a.score;
		});

		return candidates.length ? candidates[0] : null;
	}

	function chooseSuspensionResolutionForMeasure(options) {
		var measure = options.measure;
		var resolvedDegree;
		var candidates = [];
		var kinds = ['triad', 'seventh'];

		if (!measure || !measure.suspension) {
			return null;
		}

		resolvedDegree = resolvedDegreeFromMeasure(measure, options.report);
		if (!resolvedDegree || !resolvedDegree.chord) {
			return null;
		}

		for (var i = 0; i < kinds.length; i++) {
			var labels = kinds[i] === 'seventh' ? ['', '6/5', '4/3', '4/2'] : ['', '6', '6/4'];

			for (var j = 0; j < labels.length; j++) {
				var chordPlan = options.buildChordPlan({
					index: 1,
					options: {
						forceInversionIndex: j,
						forceKind: kinds[i],
						includeTensions: false,
						initialMidiNote: options.initialMidiNote,
						preventSuspension: true,
						scaleDefinition: options.report.scaleDefinition,
						scaleNotes: options.report.scaleNotes
					},
					previousPlan: options.previousPlan,
					progressionState: options.progressionState,
					resolvedDegree: resolvedDegree,
					resolvedDegrees: [
						resolvedDegree,
						resolvedDegree,
						resolvedDegreeFromMeasure(options.nextMeasure, options.report) || resolvedDegree
					]
				});

				candidates.push({
					chordPlan: chordPlan,
					reportScaleDefinition: options.report.scaleDefinition,
					resolvedDegree: resolvedDegree,
					score: suspensionResolutionScore({
						chordPlan: chordPlan,
						nextPlan: options.nextPlan,
						previousPlan: options.previousPlan,
						rng: options.rng
					})
				});
			}
		}

		candidates.sort(function (a, b) {
			return a.score - b.score;
		});

		return candidates.length ? candidates[0] : null;
	}

	function suspensionResolutionScore(options) {
		var score = voicingService.voiceLeadingTransitionScore(options.previousPlan, options.chordPlan);

		if (options.nextPlan) {
			score += voicingService.voiceLeadingTransitionScore(options.chordPlan, options.nextPlan) * 0.25;
		}

		if (options.chordPlan.kind === 'seventh') {
			score += 0.25;
		}

		return score + ((typeof options.rng === 'function' ? options.rng() : Math.random()) * 0.01);
	}

	function additionalChordScore(options) {
		var currentCommon = voicingService.commonPitchNames(options.currentMeasure, options.chordPlan).length;
		var nextCommon = options.nextMeasure ? voicingService.commonPitchNames(options.chordPlan, options.nextMeasure).length : 0;
		var currentFunction = options.currentMeasure.tonalFunction || '';
		var nextFunction = options.nextMeasure ? options.nextMeasure.tonalFunction || '' : '';
		var candidateFunction = tonalFunctionForDegree(options.report.scaleDefinition, options.resolvedDegree.degreeIndex);
		var score = 0;

		score += currentCommon * 9;
		score += nextCommon * 7;

		if (currentCommon > 0 && (!options.nextMeasure || nextCommon > 0)) {
			score += 10;
		}

		if (candidateFunction && candidateFunction === currentFunction) {
			score += currentFunction === 'T' ? 18 : 8;
		} else if (currentFunction && candidateFunction) {
			score -= currentFunction === 'T' ? 8 : 4;
		}

		if (candidateFunction && candidateFunction === nextFunction) {
			score += 4;
		}

		if (options.nextMeasure && sameChordFamily(options.resolvedDegree.chord, options.nextMeasure)) {
			score -= 16;
		}

		score -= voicingService.voiceLeadingTransitionScore(options.currentMeasure, options.chordPlan) * 0.45;

		if (options.nextPlan) {
			score -= voicingService.voiceLeadingTransitionScore(options.chordPlan, options.nextPlan) * 0.35;
		}

		if (currentCommon === 0 && nextCommon === 0) {
			score -= 24;
		}

		score += (typeof options.rng === 'function' ? options.rng() : Math.random()) * 2.5;

		return score;
	}

	function measurePlan(measure) {
		if (!measure) {
			return null;
		}

		return {
			midiNotes: measure.midiNotes || [],
			notes: measure.notes || [],
			voiceNotes: measure.voiceNotes || []
		};
	}

	function resolvedDegreeFromMeasure(measure, report) {
		var scaleChords = report && report.scaleChords ? report.scaleChords : [];
		var parallelChords = report && report.parallelScaleChords ? report.parallelScaleChords : [];
		var scaleNotes = report && report.scaleNotes ? report.scaleNotes : [];
		var chordName = measure ? measure.chordName : '';

		if (!measure) {
			return null;
		}

		for (var i = 0; i < scaleChords.length; i++) {
			if (scaleChords[i] === measure.chord || formattingService.triadName(scaleChords[i]) === chordName || scaleChords[i].nombre === chordName) {
				return {
					chord: scaleChords[i],
					degree: scaleNotes[i] ? scaleNotes[i].grado : '',
					degreeIndex: i,
					source: measure.source || 'diatonic'
				};
			}
		}

		for (var j = 0; j < parallelChords.length; j++) {
			if (parallelChords[j] === measure.chord || formattingService.triadName(parallelChords[j]) === chordName || parallelChords[j].nombre === chordName) {
				return {
					chord: parallelChords[j],
					degree: scaleNotes[j] ? scaleNotes[j].grado : '',
					degreeIndex: j,
					source: measure.source || 'parallel'
				};
			}
		}

		return null;
	}

	function tonalFunctionForDegree(scaleDefinition, degreeIndex) {
		var funciones = scaleDefinition && scaleDefinition.funciones ? String(scaleDefinition.funciones).split('-') : [];
		var tonalFunction = funciones[degreeIndex] || '';

		return tonalFunction === 'â€”' || tonalFunction === 'Ã¢â‚¬â€' ? '' : tonalFunction;
	}

	function sameChordFamily(chord, measure) {
		return measure && (measure.chord === chord || measure.chordName === chord.nombre || measure.chordName === formattingService.triadName(chord));
	}

	global.CodaProgressionAdditionalChord = {
		choose: choose
	};
})(window);
