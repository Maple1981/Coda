(function (global) {
	'use strict';

	var formattingService = global.CodaProgressionFormatting;
	var measureCloneService = global.CodaProgressionMeasureClone;
	var objectService = global.CodaProgressionObjects;
	var sectionDocument = global.CodaProgressionSectionDocument;
	var timingService = global.CodaProgressionTiming;

	function prepare(context) {
		var requestedKind = normalizedKind(context.options.modulationType);
		var originReport = context.originReport;
		var targetReport = context.targetReport;
		var pivots = commonPivotChords(originReport, targetReport);
		var kind = requestedKind;
		var metadata;
		var pivotPlan;

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

		if (kind === 'pivot' && pivots.length) {
			pivotPlan = pivotTransitionPlan(context, pivots);
			if (!pivotPlan.previousPivots.length) {
				metadata.kind = 'direct';
				return {
					metadata: metadata
				};
			}

			metadata.pivotCount = pivotPlan.pivots.length;
			metadata.pivotDegree = pivotPlan.pivots.map(pivotDegreeLabel).join(', ');
			metadata.pivotDegrees = pivotPlan.pivots.map(function (pivot) {
				return {
					originDegree: pivot.originDegree,
					targetDegree: pivot.targetDegree
				};
			});

			return {
				metadata: metadata,
				previousPivots: pivotPlan.previousPivots
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
		var measures = transitionMeasuresForDegrees([objectService.extendObject({
			index: degreeIndex,
			source: 'diatonic'
		}, degreeOptions || {})], report, context, [metadata || {}]);

		return measures.length ? measures[0] : null;
	}

	function transitionMeasuresForDegrees(degrees, report, context, metadatas) {
		var generated;
		var state = cloneObject(context.progressionState || {});

		state.bars = degrees.length || 1;
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
						degrees: degrees,
						id: 'section-modulation-transition',
						modes: ['major', 'minor'],
						weight: 100
					}
				]
			}
		});

		if (!generated || !generated.measures || !generated.measures.length) {
			return [];
		}

		return generated.measures.slice(0, degrees.length).map(function (measure, index) {
			return objectService.extendObject(measure, metadatas && metadatas[index] ? metadatas[index] : {});
		});
	}

	function applyToCombinedMeasures(previousMeasures, sectionMeasures, modulation) {
		var result = previousMeasures.concat(sectionMeasures);
		var previousIndex = previousMeasures.length - 1;
		var nextIndex = previousMeasures.length;

		if (modulation && modulation.previousMeasure && previousIndex >= 0) {
			result[previousIndex] = replaceMeasureHarmony(result[previousIndex], modulation.previousMeasure);
		}

		if (modulation && modulation.previousPivots && modulation.previousPivots.length) {
			result = applyPreviousPivots(result, previousMeasures.length, modulation.previousPivots);
		}

		if (modulation && modulation.nextMeasure && nextIndex < result.length) {
			result[nextIndex] = replaceMeasureHarmony(result[nextIndex], modulation.nextMeasure);
		}

		return result;
	}

	function pivotTransitionPlan(context, pivots) {
		var originSlots = trailingChordSlots(context.originMeasures || [], 3);
		var maxCount = Math.min(3, originSlots.length, pivots.length);
		var count = maxCount ? Math.min(maxCount, 1 + Math.floor(modulationRng(context)() * maxCount)) : 0;
		var selected = selectPivotSequence(originSlots.slice(originSlots.length - count), context.sectionMeasures || [], pivots, count);
		var degrees = selected.map(function (pivot) {
			return {
				index: pivot.originIndex,
				source: 'diatonic'
			};
		});
		var metadatas = selected.map(function (pivot, index) {
			return pivotMetadata(pivot, index, selected.length, context.targetReport);
		});

		return {
			pivots: selected,
			previousPivots: transitionMeasuresForDegrees(degrees, context.originReport, context, metadatas)
		};
	}

	function selectPivotSequence(slots, sectionMeasures, pivots, count) {
		var selected = [];
		var used = {};

		for (var i = 0; i < count; i++) {
			var previousChord = i > 0 ? selected[i - 1].originChord : previousSlotChord(slots, i);
			var nextChord = i < count - 1 ? slots[i + 1].chord : firstSectionChord(sectionMeasures);
			var pivot = bestPivotForSlot(slots[i], previousChord, nextChord, pivots, used);

			if (!pivot) {
				break;
			}

			selected.push(pivot);
			used[pivot.originIndex + ':' + pivot.targetIndex] = true;
		}

		return selected;
	}

	function bestPivotForSlot(slot, previousChord, nextChord, pivots, used) {
		var best = null;
		var bestScore = -1;

		for (var i = 0; i < pivots.length; i++) {
			var key = pivots[i].originIndex + ':' + pivots[i].targetIndex;
			var score;

			if (used[key] && Object.keys(used).length < pivots.length) {
				continue;
			}

			score = pivotPlacementScore(slot, previousChord, nextChord, pivots[i]);
			if (score > bestScore) {
				bestScore = score;
				best = pivots[i];
			}
		}

		return best;
	}

	function pivotPlacementScore(slot, previousChord, nextChord, pivot) {
		var score = pivot.score || 0;

		if (slot && chordSignature(slot.chord) === pivot.signature) {
			score += 20;
		}

		score += commonToneScore(previousChord, pivot.originChord) * 3;
		score += commonToneScore(pivot.originChord, nextChord) * 2;

		return score;
	}

	function previousSlotChord(slots, index) {
		return index > 0 && slots[index - 1] ? slots[index - 1].chord : null;
	}

	function firstSectionChord(sectionMeasures) {
		var slots = chordSlots((sectionMeasures || []).slice(0, 1));

		return slots.length ? slots[0].chord : null;
	}

	function pivotMetadata(pivot, index, count, targetReport) {
		return {
			modulationKind: 'pivot',
			modulationPivotCount: count,
			modulationPivotIndex: index,
			modulationRole: 'pivot',
			modulationSourceLabelKey: 'progression.modulation.pivot',
			pivotOriginDegree: pivot.originDegree,
			pivotTargetDegree: pivot.targetDegree,
			pivotTargetScaleIndex: targetReport ? targetReport.scaleIndex : null,
			pivotTargetScaleName: targetReport ? targetReport.scaleName : '',
			pivotTargetTonicName: targetReport ? targetReport.tonicName : ''
		};
	}

	function applyPreviousPivots(measures, previousMeasureCount, replacements) {
		var result = measures.slice();
		var slots = trailingChordSlots(result.slice(0, previousMeasureCount), replacements.length);

		for (var i = 0; i < replacements.length && i < slots.length; i++) {
			result[slots[i].measureIndex] = replaceSlotHarmony(result[slots[i].measureIndex], slots[i], replacements[i]);
		}

		return result;
	}

	function replaceSlotHarmony(measure, slot, replacement) {
		if (slot.chordIndex == null) {
			return replaceMeasureHarmony(measure, replacement);
		}

		var result = measureCloneService.cloneMeasure(measure);
		var chords = result.chords ? result.chords.slice() : [];

		chords[slot.chordIndex] = replaceMeasureHarmony(chords[slot.chordIndex], replacement);
		result.chords = chords;

		if (slot.chordIndex === 0) {
			measureCloneService.copySegmentToMeasure(result, chords[0]);
		}

		return result;
	}

	function replaceMeasureHarmony(original, replacement) {
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

		timingService.copyTimingFields(result, original, timingKeys);
		delete result.chords;

		return result;
	}

	function trailingChordSlots(measures, maxCount) {
		var slots = chordSlots(measures);

		return maxCount ? slots.slice(Math.max(0, slots.length - maxCount)) : slots;
	}

	function chordSlots(measures) {
		var slots = [];

		for (var i = 0; i < (measures || []).length; i++) {
			if (measures[i].chords && measures[i].chords.length) {
				for (var j = 0; j < measures[i].chords.length; j++) {
					slots.push({
						chord: measures[i].chords[j],
						chordIndex: j,
						measureIndex: i
					});
				}
			} else {
				slots.push({
					chord: measures[i],
					chordIndex: null,
					measureIndex: i
				});
			}
		}

		return slots;
	}

	function commonPivotChord(originReport, targetReport) {
		var pivots = commonPivotChords(originReport, targetReport);

		return pivots.length ? pivots[0] : null;
	}

	function commonPivotChords(originReport, targetReport) {
		var best = null;
		var result = [];
		var originChords = originReport && originReport.scaleChords ? originReport.scaleChords : [];
		var targetChords = targetReport && targetReport.scaleChords ? targetReport.scaleChords : [];

		for (var i = 0; i < originChords.length; i++) {
			for (var j = 0; j < targetChords.length; j++) {
				var score = pivotScore(originChords[i], targetChords[j], i, j);

				if (score > 0) {
					best = {
						originChord: originChords[i],
						originDegree: degreeName(originReport, i, originChords[i]),
						originIndex: i,
						score: score,
						signature: chordSignature(originChords[i]),
						targetChord: targetChords[j],
						targetDegree: degreeName(targetReport, j, targetChords[j]),
						targetIndex: j
					};
					result.push(best);
				}
			}
		}

		result.sort(function (a, b) {
			return b.score - a.score;
		});

		return result;
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

	function commonToneScore(chordA, chordB) {
		var a = chordPitchSet(chordA);
		var b = chordPitchSet(chordB);
		var score = 0;

		for (var key in a) {
			if (Object.prototype.hasOwnProperty.call(a, key) && b[key]) {
				score += 1;
			}
		}

		return score;
	}

	function chordPitchSet(chord) {
		var notes = chord && chord.factorNotes ? chord.factorNotes.slice(0, 3) : chordFactors(chord);
		var result = {};

		for (var i = 0; i < notes.length; i++) {
			result[notePitch(notes[i])] = true;
		}

		return result;
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

	function modulationRng(context) {
		return context && typeof context.rng === 'function' ? context.rng : fixedRng;
	}

	function pivotDegreeLabel(pivot) {
		return pivot.originDegree + ' -> ' + pivot.targetDegree;
	}

	function cloneObject(value) {
		return objectService.extendObject({}, value || {});
	}

	global.CodaProgressionSectionModulation = {
		applyToCombinedMeasures: applyToCombinedMeasures,
		commonPivotChord: commonPivotChord,
		commonPivotChords: commonPivotChords,
		normalizedKind: normalizedKind,
		prepare: prepare,
		sameReportContext: sameReportContext
	};
})(window);
