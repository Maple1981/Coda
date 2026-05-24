(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var objectService = global.CodaProgressionObjects;
	var sectionDocument = global.CodaProgressionSectionDocument;

	function prepare(context) {
		var requestedKind = normalizedKind(context.options.modulationType);
		var originReport = context.originReport;
		var targetReport = context.targetReport;
		var pivot = commonPivotChord(originReport, targetReport);
		var kind = requestedKind;
		var metadata;

		if (!kind || kind === 'none' || sameReportContext(originReport, targetReport)) {
			return emptyModulation('none');
		}

		metadata = {
			kind: kind,
			originSectionId: context.originSectionId || 'A',
			targetSectionId: context.targetSectionId || 'B',
			targetContextLabel: sectionDocument.contextLabelFromReport(targetReport),
			targetScaleIndex: targetReport ? targetReport.scaleIndex : null,
			targetTonicName: targetReport ? targetReport.tonicName : ''
		};

		if (kind === 'secondaryDominant') {
			return {
				metadata: metadata,
				previousMeasure: transitionMeasureForDegree(4, targetReport, context, {
					degree: 'V/' + targetTonicLabel(targetReport),
					modulationKind: kind,
					modulationRole: 'secondary-dominant',
					source: 'chromatic',
					sourceLabelKey: 'progression.modulation.secondaryDominant',
					tonalFunction: 'D'
				}, {
					forceKind: 'seventh'
				})
			};
		}

		if (kind === 'pivot' && pivot) {
			metadata.pivotDegree = pivot.originDegree + ' -> ' + pivot.targetDegree;
			return {
				metadata: metadata,
				previousMeasure: transitionMeasureForDegree(pivot.originIndex, originReport, context, {
					modulationKind: kind,
					modulationRole: 'pivot',
					modulationSourceLabelKey: 'progression.modulation.pivot',
					pivotOriginDegree: pivot.originDegree,
					pivotTargetDegree: pivot.targetDegree,
					pivotTargetScaleIndex: targetReport ? targetReport.scaleIndex : null,
					pivotTargetScaleName: targetReport ? targetReport.scaleName : '',
					pivotTargetTonicName: targetReport ? targetReport.tonicName : ''
				})
			};
		}

		metadata.kind = 'direct';
		return {
			metadata: metadata
		};
	}

	function emptyModulation(kind) {
		return {
			metadata: kind === 'direct' ? { kind: 'direct' } : null
		};
	}

	function normalizedKind(value) {
		if (value === 'none' || value === 'pivot' || value === 'secondaryDominant' || value === 'direct') {
			return value;
		}

		return 'none';
	}

	function transitionMeasureForDegree(degreeIndex, report, context, metadata, degreeOptions) {
		var generated;
		var degree = objectService.extendObject({
			index: degreeIndex,
			source: 'diatonic'
		}, degreeOptions || {});
		var state = cloneObject(context.progressionState || {});

		state.bars = 1;
		state.harmonicDensity = 0;
		state.chromaticism = 0;
		state.style = 'baroque';

		generated = context.dependencies.generateProgressionFromState({
			data: context.options.data,
			domain: context.options.domain,
			progressionState: state,
			report: report,
			rng: fixedRng,
			rules: {
				patterns: [
					{
						cadence: 'authentic',
						counterpoint: Number(state.counterpoint) || 50,
						degrees: [degree],
						id: 'section-modulation-transition',
						modes: ['major', 'minor'],
						weight: 100
					}
				]
			}
		});

		if (!generated || !generated.measures || !generated.measures.length) {
			return null;
		}

		return objectService.extendObject(generated.measures[0], metadata || {});
	}

	function applyToCombinedMeasures(previousMeasures, sectionMeasures, modulation) {
		var result = previousMeasures.concat(sectionMeasures);
		var previousIndex = previousMeasures.length - 1;
		var nextIndex = previousMeasures.length;

		if (modulation && modulation.previousMeasure && previousIndex >= 0) {
			result[previousIndex] = replaceMeasureHarmony(result[previousIndex], modulation.previousMeasure);
		}

		if (modulation && modulation.nextMeasure && nextIndex < result.length) {
			result[nextIndex] = replaceMeasureHarmony(result[nextIndex], modulation.nextMeasure);
		}

		return result;
	}

	function replaceMeasureHarmony(original, replacement) {
		var timing = {};
		var result = objectService.extendObject(original, replacement);
		var timingKeys = [
			'articulation',
			'bar',
			'beatUnit',
			'beatsPerBar',
			'bpm',
			'durationBeats',
			'durationSeconds',
			'endBeat',
			'endSeconds',
			'sectionId',
			'sectionLabelKey',
			'startBeat',
			'startSeconds'
		];

		for (var i = 0; i < timingKeys.length; i++) {
			if (original && Object.prototype.hasOwnProperty.call(original, timingKeys[i])) {
				timing[timingKeys[i]] = original[timingKeys[i]];
			}
		}

		result = objectService.extendObject(result, timing);
		delete result.chords;

		return result;
	}

	function commonPivotChord(originReport, targetReport) {
		var best = null;
		var bestScore = -1;
		var originChords = originReport && originReport.scaleChords ? originReport.scaleChords : [];
		var targetChords = targetReport && targetReport.scaleChords ? targetReport.scaleChords : [];

		for (var i = 0; i < originChords.length; i++) {
			for (var j = 0; j < targetChords.length; j++) {
				var score = pivotScore(originChords[i], targetChords[j], i, j);

				if (score > bestScore) {
					bestScore = score;
					best = {
						originDegree: degreeName(originReport, i, originChords[i]),
						originIndex: i,
						targetDegree: degreeName(targetReport, j, targetChords[j]),
						targetIndex: j
					};
				}
			}
		}

		return bestScore > 0 ? best : null;
	}

	function pivotScore(originChord, targetChord, originIndex, targetIndex) {
		var originSignature = chordSignature(originChord);
		var targetSignature = chordSignature(targetChord);
		var score = originSignature && originSignature === targetSignature ? 1 : 0;

		if (!score) {
			return 0;
		}

		if (originIndex !== 0 && originIndex !== 4) {
			score += 4;
		}

		if (targetIndex !== 0 && targetIndex !== 4) {
			score += 4;
		}

		if (originIndex === 5 || targetIndex === 1 || targetIndex === 3) {
			score += 2;
		}

		return score;
	}

	function chordSignature(chord) {
		var notes = chord && chord.factorNotes ? chord.factorNotes.slice(0, 3) : chordFactors(chord);
		var indexes = [];

		for (var i = 0; i < notes.length; i++) {
			indexes.push(notePitch(notes[i]));
		}

		if (indexes.length < 3) {
			return '';
		}

		indexes.sort(function (a, b) {
			return a - b;
		});

		return indexes.join('-');
	}

	function chordFactors(chord) {
		if (!chord) {
			return [];
		}

		return [chord.fundamental, chord.tercera, chord.quinta].filter(Boolean);
	}

	function notePitch(noteName) {
		var pitch = {
			'C': 0,
			'B#': 0,
			'C#': 1,
			'Db': 1,
			'D': 2,
			'D#': 3,
			'Eb': 3,
			'E': 4,
			'Fb': 4,
			'E#': 5,
			'F': 5,
			'F#': 6,
			'Gb': 6,
			'G': 7,
			'G#': 8,
			'Ab': 8,
			'A': 9,
			'A#': 10,
			'Bb': 10,
			'B': 11,
			'Cb': 11
		};

		return pitch[String(noteName || '').replace(/[0-9]/g, '')];
	}

	function degreeName(report, index, chord) {
		var rawDegree = report && report.scaleNotes && report.scaleNotes[index] ? report.scaleNotes[index].grado : '';

		if (formattingService && typeof formattingService.formatTriadDegreeForChord === 'function') {
			return formattingService.formatTriadDegreeForChord(rawDegree, chord ? chord.nombre : '');
		}

		return rawDegree;
	}

	function targetTonicLabel(report) {
		return report && report.tonicName ? report.tonicName : 'I';
	}

	function sameReportContext(originReport, targetReport) {
		return !!(originReport && targetReport &&
			originReport.tonicIndex === targetReport.tonicIndex &&
			originReport.scaleIndex === targetReport.scaleIndex);
	}

	function fixedRng() {
		return 0.99;
	}

	function cloneObject(value) {
		return objectService.extendObject({}, value || {});
	}

	global.CodaProgressionSectionModulation = {
		applyToCombinedMeasures: applyToCombinedMeasures,
		commonPivotChord: commonPivotChord,
		normalizedKind: normalizedKind,
		prepare: prepare,
		sameReportContext: sameReportContext
	};
})(window);
