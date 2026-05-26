// Shapes one chord voice into a melodic line and adds controlled embellishments.
(function (global) {
	'use strict';

	var classicalDissonanceService = global.CodaProgressionClassicalDissonance;
	var pitchService = global.CodaProgressionPitch;

	function annotateMeasures(measures, progressionState, options) {
		var counterpoint = numberOrDefault(progressionState.counterpoint, 0);
		var rng;
		var melodicVoiceIndex;

		options = options || {};
		rng = typeof options.rng === 'function' ? options.rng : function () { return 0.5; };
		if (!measures || !measures.length) {
			return measures;
		}

		melodicVoiceIndex = chooseMelodicVoiceIndex(progressionState.voices, rng);
		shapeStructuralMelody(measures, melodicVoiceIndex, progressionState, options);
		if (measures.length >= 2 && counterpoint >= 55) {
			for (var i = 0; i < measures.length - 1; i++) {
				addPassingNote(measures[i], measures[i + 1], melodicVoiceIndex, counterpoint, rng, options, progressionState);
			}
		}

		planMelodicRhythm(measures, melodicVoiceIndex, progressionState, options, rng);

		return measures;
	}

	function chooseMelodicVoiceIndex(voices, rng) {
		var voiceCount = Math.max(1, Math.min(Number(voices) || 4, 6));
		var roll = rng();

		if (voiceCount < 3) {
			return voiceCount - 1;
		}

		if (roll < 0.86) {
			return voiceCount - 1;
		}

		if (roll < 0.97) {
			return voiceCount - 2;
		}

		return Math.max(1, voiceCount - 3);
	}

	function shapeStructuralMelody(measures, voiceIndex, progressionState, options) {
		var previous = null;
		var previousInterval = 0;
		var initialMidiNote = options.initialMidiNote || 60;
		var scaleNotes = options.scaleNotes || [];

		for (var i = 0; i < measures.length; i++) {
			var measure = measures[i];
			var original = voiceNoteAt(measure, voiceIndex);
			var candidate;

			if (!original || !measure.voiceNotes || !measure.voiceNotes.length) {
				continue;
			}

			candidate = chooseStructuralMelodyNote(measure, voiceIndex, {
				initialMidiNote: initialMidiNote,
				isFirst: i === 0,
				isLast: i === measures.length - 1,
				previous: previous,
				previousInterval: previousInterval,
				scaleNotes: scaleNotes
			});

			if (!candidate) {
				candidate = original;
			}

			applyMelodyCandidate(measure, voiceIndex, candidate);
			setMeasureValue(measure, 'melodicVoiceIndex', voiceIndex);
			setMeasureValue(measure, 'melody', {
				contour: melodyContourRole(i, measures.length),
				midiNote: candidate.midiNote,
				note: candidate.note,
				source: 'structural-chord-tone',
				voiceIndex: voiceIndex
			});

			if (previous) {
				previousInterval = candidate.midiNote - previous.midiNote;
			}
			previous = candidate;
		}
	}

	function chooseStructuralMelodyNote(measure, voiceIndex, context) {
		var candidates = structuralMelodyCandidates(measure, voiceIndex, context);

		if (!candidates.length) {
			return null;
		}

		candidates.sort(function (a, b) {
			return a.score - b.score;
		});

		return candidates[0];
	}

	function structuralMelodyCandidates(measure, voiceIndex, context) {
		var original = voiceNoteAt(measure, voiceIndex);
		var noteNames = uniqueNoteNames(measure.notes && measure.notes.length ? measure.notes : notesFromVoiceNotes(measure.voiceNotes));
		var lowerVoice = voiceIndex > 0 ? voiceNoteAt(measure, voiceIndex - 1) : null;
		var lowerLimit = lowerVoice && isFinite(Number(lowerVoice.midiNote)) ? Number(lowerVoice.midiNote) + 1 : null;
		var candidates = [];

		for (var i = 0; i < noteNames.length; i++) {
			var baseMidi = pitchService.noteNameToMidi(noteNames[i], context.initialMidiNote || 60);
			var targetMidi = context.previous ? context.previous.midiNote : original.midiNote;
			var midiNote;
			var role;

			if (baseMidi == null) {
				continue;
			}

			midiNote = pitchService.nearestMidiTo(targetMidi, baseMidi);
			midiNote = fitMelodyMidiToVoice(midiNote, lowerLimit);
			role = roleForNote(measure.voiceNotes, noteNames[i]);
			candidates.push({
				duplicatesExistingVoice: duplicatesExistingVoice(measure.voiceNotes, noteNames[i], voiceIndex),
				midiNote: midiNote,
				note: noteNames[i],
				role: role,
				score: structuralMelodyScore({
					context: context,
					duplicatesExistingVoice: duplicatesExistingVoice(measure.voiceNotes, noteNames[i], voiceIndex),
					measure: measure,
					midiNote: midiNote,
					original: original,
					role: role,
					note: noteNames[i]
				})
			});
		}

		return candidates;
	}

	function structuralMelodyScore(args) {
		var context = args.context;
		var originalMidi = Number(args.original && args.original.midiNote);
		var score = Math.abs(args.midiNote - originalMidi) * 1.2;
		var interval;

		if (context.previous) {
			interval = args.midiNote - context.previous.midiNote;
			score += melodicIntervalPenalty(interval);
			score += activeDegreeResolutionPenalty(context.previous.note, args.note, interval, context.scaleNotes);
			score += repeatedStructuralTonePenalty(interval);
			score += uncompensatedLeapPenalty(interval, context.previousInterval);
		} else {
			score += openingStructuralPenalty(args);
		}

		score += cadenceStructuralPenalty(args);
		score += duplicateStructuralTonePenalty(args);
		score += registerPenalty(args.midiNote);

		return score;
	}

	function melodicIntervalPenalty(interval) {
		var distance = Math.abs(interval);

		if (distance <= 2) {
			return -3;
		}

		if (distance <= 4) {
			return 0;
		}

		if (distance === 6) {
			return 22;
		}

		if (distance <= 7) {
			return 8;
		}

		if (distance === 12) {
			return 10;
		}

		return 18 + distance;
	}

	function repeatedStructuralTonePenalty(interval) {
		return interval === 0 ? 2 : 0;
	}

	function uncompensatedLeapPenalty(interval, previousInterval) {
		if (!previousInterval || Math.abs(previousInterval) <= 4 || !interval) {
			return 0;
		}

		if (sameSign(interval, previousInterval)) {
			return Math.abs(interval) > 2 ? 18 : 8;
		}

		return Math.abs(interval) <= 4 ? -8 : -2;
	}

	function activeDegreeResolutionPenalty(previousNote, currentNote, interval, scaleNotes) {
		var previousDegree = scaleDegreeIndex(previousNote, scaleNotes);
		var currentDegree = scaleDegreeIndex(currentNote, scaleNotes);

		if (previousDegree === 6) {
			return currentDegree === 0 && interval > 0 ? -8 : 9;
		}

		if (previousDegree === 5) {
			return currentDegree === 4 && interval < 0 ? -5 : 4;
		}

		if (previousDegree === 3) {
			return currentDegree === 2 && interval < 0 ? -4 : 3;
		}

		return 0;
	}

	function openingStructuralPenalty(args) {
		if (args.context.isFirst && args.measure.degreeIndex === 0) {
			if (isRootRole(args.role)) {
				return -8;
			}

			if (isThirdRole(args.role)) {
				return -3;
			}
		}

		return 0;
	}

	function cadenceStructuralPenalty(args) {
		if (!args.context.isLast) {
			return 0;
		}

		if (args.measure.degreeIndex === 0) {
			if (isRootRole(args.role)) {
				return -12;
			}

			if (isThirdRole(args.role)) {
				return -4;
			}

			if (isFifthRole(args.role)) {
				return 2;
			}
		}

		return 0;
	}

	function duplicateStructuralTonePenalty(args) {
		if (!args.duplicatesExistingVoice || args.context.isLast) {
			return 0;
		}

		return args.measure.voiceNotes && args.measure.voiceNotes.length <= uniqueNoteNames(args.measure.notes).length ? 20 : 4;
	}

	function registerPenalty(midiNote) {
		if (midiNote > 84) {
			return (midiNote - 84) * 3;
		}

		if (midiNote < 48) {
			return (48 - midiNote) * 2;
		}

		return 0;
	}

	function applyMelodyCandidate(measure, voiceIndex, candidate) {
		var voiceNotes = cloneVoiceNotes(measure.voiceNotes);

		if (!voiceNotes[voiceIndex]) {
			return;
		}

		voiceNotes[voiceIndex] = extendObject(voiceNotes[voiceIndex], {
			midiNote: candidate.midiNote,
			note: candidate.note
		});
		setInternalValue(voiceNotes[voiceIndex], 'melodic', true);

		measure.voiceNotes = voiceNotes;
		measure.midiNotes = midiNotesFromVoiceNotes(voiceNotes, measure.midiNotes);
	}

	function fitMelodyMidiToVoice(midiNote, lowerLimit) {
		var result = midiNote;

		if (lowerLimit != null) {
			while (result < lowerLimit) {
				result += 12;
			}
		}

		while (result > 84 && (lowerLimit == null || result - 12 >= lowerLimit)) {
			result -= 12;
		}

		return result;
	}

	function melodyContourRole(index, total) {
		if (total <= 1) {
			return 'single';
		}

		if (index === 0) {
			return 'opening';
		}

		if (index === total - 1) {
			return 'cadence';
		}

		return index < (total - 1) / 2 ? 'ascent' : 'release';
	}

	function planMelodicRhythm(measures, voiceIndex, progressionState, options, rng) {
		var phrasePlan = chooseMelodicPhrasePlan(measures, progressionState, rng);
		var repetitionState = createMelodyRepetitionState();
		var motifState = createMotifState();

		for (var i = 0; i < measures.length; i++) {
			var events = buildMeasureMelodyEvents(measures[i], {
				index: i,
				isLastMeasure: i === measures.length - 1,
				motifState: motifState,
				nextMeasure: measures[i + 1] || null,
				options: options || {},
				phrasePlan: phrasePlan,
				previousMeasure: measures[i - 1] || null,
				progressionState: progressionState || {},
				repetitionState: repetitionState,
				rng: rng,
				voiceIndex: voiceIndex
			});

			if (events.length) {
				setMeasureValue(measures[i], 'melodyEvents', events);
				setMeasureValue(measures[i], 'melodicStartType', phrasePlan.startType);
				setMeasureValue(measures[i], 'melody', extendObject(measures[i].melody, {
					answerCell: phrasePlan.answerCell.slice(),
					contourShape: phrasePlan.contourShape,
					melodicCell: phrasePlan.primaryCell.slice(),
					motifCount: phrasePlan.motifCells.length,
					motifId: phrasePlan.motifId,
					motifRole: motifRoleForMeasure(i),
					rhythmSource: 'melodic-rhythm-plan',
					startType: phrasePlan.startType
				}));
			}
		}
	}

	function chooseMelodicPhrasePlan(measures, progressionState, rng) {
		var startRoll = rng();
		var contourRoll = rng();
		var motifRoll = rng();
		var cellRoll = rng();
		var secondaryCellRoll = rng();
		var primaryCell = choosePrimaryMelodicCell(cellRoll);
		var motifCells = melodicMotifCells(primaryCell, secondaryCellRoll);

		return {
			contourShape: contourRoll < 0.28 ? 'descending-ramp' : (contourRoll < 0.56 ? 'ascending-ramp' : (contourRoll < 0.82 ? 'arch' : 'inverted-arch')),
			motifId: motifRoll < 0.25 ? 'short-short-long' : (motifRoll < 0.5 ? 'eighth-run-cadence' : (motifRoll < 0.75 ? 'syncopated-cell' : 'sixteenth-turn')),
			answerCell: motifCells[1].slice(),
			motifCells: motifCells,
			primaryCell: primaryCell,
			startType: startRoll < 0.18 ? 'anacrusic' : (startRoll < 0.55 ? 'acephalous' : 'thetic'),
			totalMeasures: measures ? measures.length : 0,
			voices: progressionState ? progressionState.voices : 4
		};
	}

	function choosePrimaryMelodicCell(roll) {
		if (roll < 0.2) {
			return [2, -1, 2];
		}

		if (roll < 0.4) {
			return [2, 2, -1];
		}

		if (roll < 0.6) {
			return [-2, 1, -2];
		}

		if (roll < 0.8) {
			return [3, -1, 2];
		}

		return [-1, 2, 1];
	}

	function melodicMotifCells(primaryCell, roll) {
		var answerCell = answerCellFromPrimary(primaryCell);
		var cells = [primaryCell.slice(), answerCell];

		if (roll > 0.62) {
			cells.push(contrastCellForPrimary(primaryCell, roll));
		}

		return cells;
	}

	function answerCellFromPrimary(primaryCell) {
		var result = [];

		for (var i = 0; i < (primaryCell || []).length; i++) {
			result.push(-primaryCell[i]);
		}

		if (result.length) {
			result[result.length - 1] += result[result.length - 1] < 0 ? -1 : 1;
		}

		return result;
	}

	function contrastCellForPrimary(primaryCell, roll) {
		var candidates = [
			[1, 2, -1],
			[-2, -1, 2],
			[3, -2, 1],
			[-1, 3, -2]
		];
		var index = Math.floor(Math.max(0, Math.min(0.999999, roll)) * candidates.length);
		var candidate = candidates[index] || candidates[0];

		if (sameCell(candidate, primaryCell)) {
			return candidates[(index + 1) % candidates.length].slice();
		}

		return candidate.slice();
	}

	function sameCell(a, b) {
		if (!a || !b || a.length !== b.length) {
			return false;
		}

		for (var i = 0; i < a.length; i++) {
			if (a[i] !== b[i]) {
				return false;
			}
		}

		return true;
	}

	function createMotifState() {
		return {
			previousInterval: 0,
			previousNote: null
		};
	}

	function buildMeasureMelodyEvents(measure, context) {
		var voiceNote = voiceNoteAt(measure, context.voiceIndex);
		var previousNote = voiceNoteAt(context.previousMeasure, context.voiceIndex);
		var nextNote = voiceNoteAt(context.nextMeasure, context.voiceIndex);
		var secondsPerBeat = secondsPerBeatForMeasure(measure);
		var durationBeats = Number(measure && measure.durationBeats) || 4;
		var startOffsetBeats = melodicStartOffsetBeats(context.index, context.phrasePlan, context.rng);
		var pattern = rhythmPatternForMeasure(context.phrasePlan, context.index, context.progressionState, context.rng);
		var events = [];
		var beat = startOffsetBeats;
		var slotIndex = 0;

		context.currentDurationTotalBeats = durationBeats;

		if (!voiceNote || !measure || !measure.voiceNotes) {
			return events;
		}

		if (context.index === 0 && context.phrasePlan.startType === 'anacrusic') {
			events.push(finalizeMelodyEvent(measure, context, {
				kind: 'anacrusis',
				note: melodicPickupNote(voiceNote, context)
			}, 0, Math.min(0.5, durationBeats / 4), secondsPerBeat));
			beat = Math.min(0.5, durationBeats / 4);
		}

		while (beat < durationBeats - 0.001) {
			var patternItem = pattern[slotIndex % pattern.length];
			var itemBeats = typeof patternItem === 'number' ? patternItem : patternItem.beats;
			var duration = Math.min(itemBeats, durationBeats - beat);
			var event;

			if (duration <= 0.001) {
				break;
			}

			event = plannedMelodyEvent(measure, {
				beat: beat,
				durationBeats: duration,
				durationTotalBeats: durationBeats,
				isLastMeasure: context.isLastMeasure,
				measureIndex: context.index,
				motifState: context.motifState,
				nextNote: nextNote,
				patternItem: patternItem,
				phrasePlan: context.phrasePlan,
				previousNote: previousNote,
				progressionState: context.progressionState,
				rng: context.rng,
				scaleNotes: scaleNotesForMeasure(measure, context.options),
				slotIndex: slotIndex,
				voiceIndex: context.voiceIndex,
				voiceNote: voiceNote
			});

			if (event) {
				events.push(finalizeMelodyEvent(measure, context, event, beat, duration, secondsPerBeat));
			}

			beat += duration;
			slotIndex += 1;
		}

		maybeAddMeasureEndConnection(events, measure, context, durationBeats, secondsPerBeat, voiceNote, nextNote);

		return coalesceMelodyRests(events);
	}

	function maybeAddMeasureEndConnection(events, measure, context, durationBeats, secondsPerBeat, voiceNote, nextNote) {
		var counterpoint = numberOrDefault(context.progressionState && context.progressionState.counterpoint, 0);
		var chance = Math.min(0.72, 0.28 + counterpoint / 160);
		var connectionBeats;
		var connection;
		var event;
		var beat;

		if (context.isLastMeasure || durationBeats < 2 || !voiceNote || !events.length || context.rng() > chance) {
			return;
		}

		connectionBeats = context.rng() < 0.72 ? 0.5 : 0.25;
		beat = Math.max(0, durationBeats - connectionBeats);
		connection = measureEndConnectionNote(measure, context, voiceNote, nextNote);

		if (!connection || !connection.note) {
			return;
		}

		trimMelodyEventsAt(events, beat * secondsPerBeat);
		event = finalizeMelodyEvent(measure, context, connection, beat, connectionBeats, secondsPerBeat);
		if (event && !event.rest) {
			events.push(event);
		}
	}

	function measureEndConnectionNote(measure, context, voiceNote, nextNote) {
		var scaleNotes = scaleNotesForMeasure(measure, context.options);
		var passingNote;

		if (nextNote) {
			passingNote = choosePassingNote(voiceNote, nextNote, scaleNotes, measure.notes || [], context.options.initialMidiNote || 60, context.progressionState);
			if (passingNote) {
				return {
					kind: 'end-connection',
					note: passingNote
				};
			}

			return {
				kind: 'anticipation',
				note: nextNote
			};
		}

		return {
			kind: 'end-connection',
			note: neighborMelodyNote(voiceNote, scaleNotes, context.index % 2 ? -1 : 1)
		};
	}

	function trimMelodyEventsAt(events, cutoffSeconds) {
		var cutoff = Number(cutoffSeconds) || 0;

		for (var i = events.length - 1; i >= 0; i--) {
			var start = Number(events[i].delaySeconds) || 0;
			var duration = Number(events[i].durationSeconds) || 0;
			var end = start + duration;

			if (start >= cutoff - 0.001) {
				events.splice(i, 1);
				continue;
			}

			if (end > cutoff + 0.001) {
				if (cutoff - start < 0.05) {
					events.splice(i, 1);
					continue;
				}
				events[i].durationSeconds = cutoff - start;
			}
		}
	}

	function finalizeMelodyEvent(measure, context, event, beat, durationBeats, secondsPerBeat) {
		var planned = avoidExcessiveRepeatedNote(measure, context, event, beat, durationBeats);
		var rendered = melodyEvent(measure, context.voiceIndex, planned.note, beat, durationBeats, secondsPerBeat, planned.kind, planned.rest);

		registerMelodyEvent(context.repetitionState, rendered);
		registerMotifEvent(context.motifState, rendered);

		return rendered;
	}

	function createMelodyRepetitionState() {
		return {
			previousMidi: null,
			repeatedNotes: 0,
			totalNotes: 0
		};
	}

	function melodicStartOffsetBeats(index, phrasePlan, rng) {
		if (index !== 0 || phrasePlan.startType !== 'acephalous') {
			return 0;
		}

		return rng() < 0.65 ? 0.5 : 1;
	}

	function rhythmPatternForMeasure(phrasePlan, measureIndex, progressionState, rng) {
		var patterns = {
			'short-short-long': [1, 1, 2],
			'eighth-run-cadence': [0.5, 0.5, 1, 2],
			'syncopated-cell': [0.5, 1.5, 1, 1],
			'sixteenth-turn': [0.25, 0.25, 0.5, 1, 2]
		};
		var base = patterns[phrasePlan.motifId] || patterns['short-short-long'];
		var counterpoint = numberOrDefault(progressionState && progressionState.counterpoint, 0);
		var result = base.slice();

		if (measureIndex % 4 === 3) {
			return cadenceRhythmPattern(result);
		}

		if (measureIndex % 2 === 1 && rng() < Math.min(0.42, 0.14 + counterpoint / 260)) {
			return varyRhythmPattern(result);
		}

		return result;
	}

	function cadenceRhythmPattern(pattern) {
		var total = sumNumbers(pattern);

		if (total <= 2) {
			return [1, 1];
		}

		return [0.5, 0.5, Math.max(1, total - 1)];
	}

	function varyRhythmPattern(pattern) {
		if (pattern.length < 3) {
			return pattern.slice();
		}

		return [pattern[0], pattern[1] / 2, pattern[1] / 2].concat(pattern.slice(2));
	}

	function sumNumbers(values) {
		var total = 0;

		for (var i = 0; i < values.length; i++) {
			total += Number(values[i]) || 0;
		}

		return total;
	}

	function plannedMelodyEvent(measure, args) {
		var isFinalSlot = args.beat + args.durationBeats >= args.durationTotalBeats - 0.001;
		var roll = args.rng();
		var closureEvent;
		var motifEvent;
		var note = args.voiceNote;

		if (shouldRest(args, roll)) {
			return {
				kind: 'rest',
				rest: true
			};
		}

		closureEvent = phraseClosureMelodyEvent(measure, args, roll, isFinalSlot);
		if (closureEvent) {
			return closureEvent;
		}

		motifEvent = motifMelodyEvent(measure, args, roll, isFinalSlot);
		if (motifEvent) {
			return motifEvent;
		}

		if (args.beat < 0.001 && args.previousNote && roll < 0.16) {
			return {
				kind: 'retardation',
				note: args.previousNote
			};
		}

		if (!isFinalSlot && args.nextNote && args.durationBeats <= 0.5 && roll > 0.82) {
			return {
				kind: 'anticipation',
				note: args.nextNote
			};
		}

		if (!isStrongBeat(args.beat) && args.nextNote && Math.abs(args.nextNote.midiNote - args.voiceNote.midiNote) >= 3) {
			note = choosePassingNote(args.voiceNote, args.nextNote, args.scaleNotes, measure.notes || [], args.optionsInitialMidiNote || 60, {}) || note;
			return {
				kind: 'passing',
				note: note
			};
		}

		if (!isStrongBeat(args.beat) && roll < 0.55) {
			return {
				kind: 'neighbor',
				note: neighborMelodyNote(args.voiceNote, args.scaleNotes, roll < 0.28 ? -1 : 1)
			};
		}

		return {
			kind: isFinalSlot && measure.degreeIndex === 0 ? 'cadential' : 'melody-structural',
			note: args.voiceNote
		};
	}

	function motifMelodyEvent(measure, args, roll, isFinalSlot) {
		var motifNote;

		if (!args.phrasePlan || !motifCellForMeasure(args.phrasePlan, args.measureIndex).length) {
			return null;
		}

		if (args.beat < 0.001 && args.previousNote && roll < 0.12) {
			return null;
		}

		motifNote = motifNoteForSlot(measure, args);
		if (!motifNote) {
			return null;
		}

		return {
			kind: isFinalSlot && measure.degreeIndex === 0 ? 'cadential' : motifKindForMeasure(args.measureIndex),
			note: motifNote
		};
	}

	function motifKindForMeasure(measureIndex) {
		var transformation = motifTransformationForMeasure(measureIndex);
		var role = motifRoleForMeasure(measureIndex);

		if (role === 'answer') {
			return transformation === 'repeat' ? 'motif-answer' : 'motif-answer-' + transformation;
		}

		if (role === 'close') {
			return 'motif-closure';
		}

		return transformation === 'repeat' ? 'motif-question' : 'motif-question-' + transformation;
	}

	function motifNoteForSlot(measure, args) {
		var cell = transformedMelodicCell(motifCellForMeasure(args.phrasePlan, args.measureIndex), args.measureIndex);
		var interval = variedMotifInterval(cell[args.slotIndex % cell.length], args.measureIndex, args.slotIndex);
		var contourOffset = contourOffsetForSlot(args.phrasePlan, args.measureIndex, args.slotIndex);
		var anchor = motifAnchorNote(args);
		var targetMidi = anchor.midiNote + interval + contourOffset;
		var strongBeat = isStrongBeat(args.beat);
		var noteNames = strongBeat ? uniqueNoteNames(measure.notes || []) : scaleNoteNames(args.scaleNotes);
		var candidates = motifNoteCandidates(noteNames, targetMidi, measure, args, strongBeat);

		if (!candidates.length && !strongBeat) {
			candidates = motifNoteCandidates(uniqueNoteNames(measure.notes || []), targetMidi, measure, args, true);
		}

		candidates.sort(function (a, b) {
			return a.score - b.score;
		});

		return candidates[0] || null;
	}

	function phraseClosureMelodyEvent(measure, args, roll, isFinalSlot) {
		var note;

		if (!isFinalSlot || !isPhraseClosureMeasure(args.measureIndex, args.phrasePlan.totalMeasures)) {
			return null;
		}

		if (!args.isLastMeasure && roll > 0.84) {
			return null;
		}

		note = phraseClosureNote(measure, args);
		if (!note) {
			return null;
		}

		return {
			kind: args.isLastMeasure && measure.degreeIndex === 0 ? 'cadential' : 'phrase-closure',
			note: note
		};
	}

	function phraseClosureNote(measure, args) {
		var previous = args.motifState && args.motifState.previousNote ? args.motifState.previousNote : args.voiceNote;
		var chordNotes = uniqueNoteNames(measure.notes || []);
		var candidates = [];

		for (var i = 0; i < chordNotes.length; i++) {
			var noteName = chordNotes[i];
			var midiNote = pitchService.noteNameToMidi(noteName, args.optionsInitialMidiNote || 60);
			var interval;
			var score;

			if (midiNote == null) {
				continue;
			}

			midiNote = pitchService.nearestMidiTo(previous.midiNote, midiNote);
			interval = midiNote - previous.midiNote;
			score = Math.abs(interval) * 1.1;
			score += melodicIntervalPenalty(interval);
			score += closureRolePenalty(measure, noteName);
			score += finalTonicClosurePenalty(measure, args, noteName);
			score += registerPenalty(midiNote);

			candidates.push({
				midiNote: midiNote,
				note: noteName,
				score: score
			});
		}

		candidates.sort(function (a, b) {
			return a.score - b.score;
		});

		return candidates[0] || args.voiceNote;
	}

	function closureRolePenalty(measure, noteName) {
		var role = roleForNote(measure.voiceNotes, noteName);

		if (measure && measure.degreeIndex === 0 && isRootRole(role)) {
			return -7;
		}

		if (isThirdRole(role)) {
			return -3;
		}

		if (isFifthRole(role)) {
			return 1;
		}

		return 0;
	}

	function finalTonicClosurePenalty(measure, args, noteName) {
		var degree;

		if (!args || !args.isLastMeasure || !measure || measure.degreeIndex !== 0) {
			return 0;
		}

		degree = scaleDegreeIndex(noteName, args.scaleNotes);
		if (degree === 0) {
			return -22;
		}

		if (degree === 2) {
			return -10;
		}

		if (degree === 4) {
			return -1;
		}

		return finalTonicClosureRolePenalty(measure, noteName);
	}

	function finalTonicClosureRolePenalty(measure, noteName) {
		var role = roleForNote(measure.voiceNotes, noteName);

		if (isRootRole(role)) {
			return -18;
		}

		if (isThirdRole(role)) {
			return -9;
		}

		if (isFifthRole(role)) {
			return -1;
		}

		return 8;
	}

	function motifAnchorNote(args) {
		if (args.motifState && args.motifState.previousNote) {
			return args.motifState.previousNote;
		}

		return args.voiceNote;
	}

	function motifNoteCandidates(noteNames, targetMidi, measure, args, strongBeat) {
		var previous = args.motifState && args.motifState.previousNote;
		var candidates = [];

		for (var i = 0; i < (noteNames || []).length; i++) {
			var noteName = noteNames[i];
			var midiNote = pitchService.noteNameToMidi(noteName, args.optionsInitialMidiNote || 60);
			var interval;
			var score;

			if (midiNote == null) {
				continue;
			}

			midiNote = pitchService.nearestMidiTo(targetMidi, midiNote);
			interval = previous ? midiNote - previous.midiNote : midiNote - args.voiceNote.midiNote;
			score = Math.abs(targetMidi - midiNote) * 0.8;
			score += melodicIntervalPenalty(interval);
			score += activeDegreeResolutionPenalty(previous ? previous.note : args.voiceNote.note, noteName, interval, args.scaleNotes);
			score += uncompensatedLeapPenalty(interval, args.motifState ? args.motifState.previousInterval : 0);
			score += registerPenalty(midiNote);

			if (strongBeat && !isChordTone(noteName, measure.notes || [])) {
				score += 9;
			}

			if (previous && midiNote === previous.midiNote) {
				score += 18;
			}

			candidates.push({
				midiNote: midiNote,
				note: noteName,
				score: score
			});
		}

		return candidates;
	}

	function transformedMelodicCell(cell, measureIndex) {
		var transformation = motifTransformationForMeasure(measureIndex);
		var result = (cell || []).slice();

		if (transformation === 'retrograde' || transformation === 'retrograde-inversion') {
			result.reverse();
		}

		if (transformation === 'inversion' || transformation === 'retrograde-inversion') {
			for (var i = 0; i < result.length; i++) {
				result[i] = -result[i];
			}
		}

		return result;
	}

	function motifCellForMeasure(phrasePlan, measureIndex) {
		var cells = phrasePlan && phrasePlan.motifCells ? phrasePlan.motifCells : [];
		var phraseGroup = Math.floor((Number(measureIndex) || 0) / 4);
		var role = motifRoleForMeasure(measureIndex);

		if (!cells.length && phrasePlan && phrasePlan.primaryCell) {
			return phrasePlan.primaryCell;
		}

		if (role === 'answer' || role === 'close') {
			return cells[1] || cells[0] || [];
		}

		if (cells.length > 2 && phraseGroup % 3 === 2) {
			return cells[2];
		}

		return cells[0] || [];
	}

	function motifRoleForMeasure(measureIndex) {
		var position = (Number(measureIndex) || 0) % 4;

		if (position < 2) {
			return 'question';
		}

		if (position === 2) {
			return 'answer';
		}

		return 'close';
	}

	function isPhraseClosureMeasure(measureIndex, totalMeasures) {
		var index = Number(measureIndex) || 0;
		var total = Number(totalMeasures) || 0;

		return (index + 1) % 4 === 0 || (total > 0 && index === total - 1);
	}

	function motifTransformationForMeasure(measureIndex) {
		var cycle = measureIndex % 8;
		var role = motifRoleForMeasure(measureIndex);

		if (role === 'answer') {
			return cycle === 6 ? 'variation' : 'repeat';
		}

		if (role === 'close') {
			return cycle === 7 ? 'retrograde-inversion' : 'inversion';
		}

		if (cycle === 0 || cycle === 1 || cycle === 4) {
			return 'repeat';
		}

		if (cycle === 2 || cycle === 6) {
			return 'variation';
		}

		if (cycle === 3) {
			return 'inversion';
		}

		if (cycle === 5) {
			return 'retrograde';
		}

		return 'retrograde-inversion';
	}

	function variedMotifInterval(interval, measureIndex, slotIndex) {
		if (motifTransformationForMeasure(measureIndex) !== 'variation') {
			return interval;
		}

		if (slotIndex % 3 !== 1) {
			return interval;
		}

		return interval + (interval < 0 ? -1 : 1);
	}

	function contourOffsetForSlot(phrasePlan, measureIndex, slotIndex) {
		var total = Math.max(1, Number(phrasePlan.totalMeasures) || 1);
		var progress = total <= 1 ? 0 : measureIndex / (total - 1);
		var shape = phrasePlan.contourShape;
		var local = slotIndex % 2 ? 1 : 0;

		if (shape === 'ascending-ramp') {
			return Math.round(progress * 4) + local;
		}

		if (shape === 'descending-ramp') {
			return -Math.round(progress * 4) - local;
		}

		if (shape === 'arch') {
			return Math.round((1 - Math.abs(progress - 0.5) * 2) * 5);
		}

		return -Math.round((1 - Math.abs(progress - 0.5) * 2) * 5);
	}

	function scaleNoteNames(scaleNotes) {
		var result = [];

		for (var i = 0; i < (scaleNotes || []).length; i++) {
			result.push(scaleNotes[i].nombre || scaleNotes[i]);
		}

		return result;
	}

	function avoidExcessiveRepeatedNote(measure, context, event, beat, durationBeats) {
		var state = context.repetitionState || createMelodyRepetitionState();
		var note = event && event.note;
		var midiNote = Number(note && note.midiNote);
		var roll;

		if (!event || event.rest || !isFinite(midiNote) || state.previousMidi == null || midiNote !== state.previousMidi) {
			return event;
		}

		roll = context.rng();
		if (allowRareMelodicRepeat(state, roll)) {
			return event;
		}

		return repeatedNoteReplacement(measure, context, event, roll, beat, durationBeats);
	}

	function allowRareMelodicRepeat(state, roll) {
		var allowedRepeats = Math.floor(Math.max(0, state.totalNotes) * 0.05);

		return state.totalNotes >= 20 && state.repeatedNotes < allowedRepeats && roll < 0.04;
	}

	function repeatedNoteReplacement(measure, context, event, roll, beat, durationBeats) {
		var anchor = event.note;
		var scaleNotes = scaleNotesForMeasure(measure, context.options);
		var replacement;

		if (roll < 0.25 && canUseMelodicRest(context, beat, durationBeats)) {
			return {
				kind: 'rest',
				rest: true
			};
		}

		if (roll < 0.5) {
			replacement = appoggiaturaMelodyNote(anchor, scaleNotes, context);
			return extendObject(event, {
				kind: 'appoggiatura',
				note: replacement
			});
		}

		if (roll < 0.75) {
			replacement = neighborMelodyNote(anchor, scaleNotes, context.index % 2 ? -1 : 1);
			return extendObject(event, {
				kind: 'trill',
				note: replacement
			});
		}

		replacement = arpeggioMelodyNote(anchor, measure, context);
		return extendObject(event, {
			kind: 'arpeggio-tone',
			note: replacement
		});
	}

	function appoggiaturaMelodyNote(anchor, scaleNotes, context) {
		var direction = context.index % 2 ? 1 : -1;

		return neighborMelodyNote(anchor, scaleNotes, direction);
	}

	function arpeggioMelodyNote(anchor, measure, context) {
		var candidates = [];
		var chordNotes = uniqueNoteNames(measure && measure.notes ? measure.notes : []);
		var targetOffset = context.index % 2 ? -3 : 4;

		for (var i = 0; i < chordNotes.length; i++) {
			var midiNote = pitchService.noteNameToMidi(chordNotes[i], 60);

			if (midiNote == null) {
				continue;
			}

			midiNote = pitchService.nearestMidiTo(anchor.midiNote + targetOffset, midiNote);
			if (midiNote === anchor.midiNote) {
				midiNote += targetOffset > 0 ? 12 : -12;
			}

			candidates.push({
				midiNote: midiNote,
				note: chordNotes[i],
				score: Math.abs((anchor.midiNote + targetOffset) - midiNote)
			});
		}

		candidates.sort(function (a, b) {
			return a.score - b.score;
		});

		return candidates[0] || neighborMelodyNote(anchor, scaleNotesForMeasure(measure, context.options), targetOffset > 0 ? 1 : -1);
	}

	function registerMelodyEvent(state, event) {
		if (!state || !event || event.rest || event.midiNote == null) {
			return;
		}

		if (state.previousMidi != null && event.midiNote === state.previousMidi) {
			state.repeatedNotes += 1;
		}

		state.previousMidi = event.midiNote;
		state.totalNotes += 1;
	}

	function registerMotifEvent(state, event) {
		var note;

		if (!state || !event || event.rest || event.midiNote == null) {
			return;
		}

		note = {
			midiNote: event.midiNote,
			note: event.note
		};

		if (state.previousNote) {
			state.previousInterval = note.midiNote - state.previousNote.midiNote;
		}

		state.previousNote = note;
	}

	function shouldRest(args, roll) {
		if (args.slotIndex === 0 || args.durationBeats >= 1.5) {
			return false;
		}

		if (isLastPulse(args.beat, args.durationBeats, args.durationTotalBeats) && !args.isLastMeasure) {
			return false;
		}

		return roll > 0.7 && roll < (args.isLastMeasure ? 0.88 : 0.82);
	}

	function canUseMelodicRest(context, beat, durationBeats) {
		var durationTotalBeats = Number(context && context.currentDurationTotalBeats) || 0;

		if (!durationTotalBeats) {
			return true;
		}

		return context && context.isLastMeasure ? true : !isLastPulse(beat, durationBeats, durationTotalBeats);
	}

	function isLastPulse(beat, durationBeats, durationTotalBeats) {
		var start = Number(beat) || 0;
		var end = start + (Number(durationBeats) || 0);
		var lastPulseStart = Math.max(0, (Number(durationTotalBeats) || 0) - 1);

		return end > lastPulseStart + 0.001;
	}

	function isStrongBeat(beat) {
		return Math.abs(beat - Math.round(beat)) < 0.001 && Math.round(beat) % 2 === 0;
	}

	function melodicPickupNote(targetNote, context) {
		var scaleNotes = scaleNotesForMeasure(context.previousMeasure || context.nextMeasure || {}, context.options);

		return neighborMelodyNote(targetNote, scaleNotes, -1);
	}

	function neighborMelodyNote(anchor, scaleNotes, direction) {
		var note = nearestScaleStep(anchor, scaleNotes, direction);

		return note || {
			midiNote: anchor.midiNote + (direction > 0 ? 2 : -2),
			note: anchor.note
		};
	}

	function nearestScaleStep(anchor, scaleNotes, direction) {
		var targetMidi = anchor.midiNote + (direction > 0 ? 2 : -2);
		var candidates = [];

		for (var i = 0; i < (scaleNotes || []).length; i++) {
			var noteName = scaleNotes[i].nombre || scaleNotes[i];
			var midiNote = pitchService.noteNameToMidi(noteName, 60);

			if (midiNote == null) {
				continue;
			}

			midiNote = pitchService.nearestMidiTo(targetMidi, midiNote);
			if ((direction > 0 && midiNote > anchor.midiNote) || (direction < 0 && midiNote < anchor.midiNote)) {
				candidates.push({
					midiNote: midiNote,
					note: noteName,
					score: Math.abs(targetMidi - midiNote)
				});
			}
		}

		candidates.sort(function (a, b) {
			return a.score - b.score;
		});

		return candidates[0] || null;
	}

	function melodyEvent(measure, voiceIndex, note, beat, durationBeats, secondsPerBeat, kind, rest) {
		var event = {
			delaySeconds: beat * secondsPerBeat,
			durationSeconds: Math.max(0.05, durationBeats * secondsPerBeat),
			kind: kind || 'melody-structural',
			melodic: true,
			voiceIndex: voiceIndex
		};

		if (rest) {
			event.rest = true;
			return event;
		}

		event.midiNote = note.midiNote;
		event.note = note.note;

		return event;
	}

	function coalesceMelodyRests(events) {
		var result = [];

		for (var i = 0; i < events.length; i++) {
			if (events[i].rest && result.length && result[result.length - 1].rest) {
				result[result.length - 1].durationSeconds += events[i].durationSeconds;
				continue;
			}

			result.push(events[i]);
		}

		return result;
	}

	function addPassingNote(measure, nextMeasure, voiceIndex, counterpoint, rng, options, progressionState) {
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

		passingNote = choosePassingNote(currentNote, nextNote, scaleNotes, measure.notes || [], options.initialMidiNote || 60, progressionState);
		if (!passingNote) {
			return;
		}

		durationSeconds = Math.max(0.08, (Number(measure.durationSeconds) || 0.5) * 0.22);
		setMeasureValue(measure, 'melodicVoiceIndex', voiceIndex);
		measure.passingNotes = (measure.passingNotes || []).concat([{
			delaySeconds: (Number(measure.durationSeconds) || 0) * 0.5,
			durationSeconds: melodicPassingDuration(measure, durationSeconds),
			kind: 'passing',
			melodic: true,
			midiNote: passingNote.midiNote,
			note: passingNote.note,
			voiceIndex: voiceIndex
		}]);
	}

	function choosePassingNote(currentNote, nextNote, scaleNotes, chordNotes, initialMidiNote, progressionState) {
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
			if (midiNote > low && midiNote < high && classicalDissonanceService.allowsPassingNote(currentNote, {
				midiNote: midiNote,
				note: noteName
			}, nextNote, progressionState)) {
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

	function melodicPassingDuration(measure, fallbackDuration) {
		var durationSeconds = Number(measure.durationSeconds) || 0;
		var delaySeconds = durationSeconds * 0.5;

		if (!durationSeconds) {
			return fallbackDuration;
		}

		return Math.max(fallbackDuration, durationSeconds - delaySeconds);
	}

	function scaleNotesForMeasure(measure, options) {
		var sourceScales = options && options.sourceScaleNotesByIndex ? options.sourceScaleNotesByIndex : {};

		if (measure.sourceScaleIndex != null && sourceScales[measure.sourceScaleIndex]) {
			return sourceScales[measure.sourceScaleIndex];
		}

		return options && options.scaleNotes ? options.scaleNotes : [];
	}

	function secondsPerBeatForMeasure(measure) {
		var durationSeconds = Number(measure && measure.durationSeconds) || 0;
		var durationBeats = Number(measure && measure.durationBeats) || 0;

		return durationSeconds > 0 && durationBeats > 0 ? durationSeconds / durationBeats : 0.5;
	}

	function voiceNoteAt(measure, voiceIndex) {
		var voiceNotes = measure && measure.voiceNotes ? measure.voiceNotes : [];

		return voiceNotes[Math.min(voiceIndex, voiceNotes.length - 1)];
	}

	function midiNotesFromVoiceNotes(voiceNotes, fallback) {
		var result = [];

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			result.push(voiceNotes[i].midiNote);
		}

		return result.length ? result : (fallback || []);
	}

	function notesFromVoiceNotes(voiceNotes) {
		var result = [];

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			result.push(voiceNotes[i].note);
		}

		return result;
	}

	function uniqueNoteNames(notes) {
		var result = [];
		var seen = {};

		for (var i = 0; i < (notes || []).length; i++) {
			var note = typeof notes[i] === 'object' ? notes[i].note || notes[i].nombre : notes[i];
			var normalized = pitchService.normalizePitchName(note);

			if (note && !seen[normalized]) {
				seen[normalized] = true;
				result.push(note);
			}
		}

		return result;
	}

	function roleForNote(voiceNotes, noteName) {
		var normalized = pitchService.normalizePitchName(noteName);

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			if (pitchService.normalizePitchName(voiceNotes[i].note) === normalized) {
				return voiceNotes[i].role || '';
			}
		}

		return '';
	}

	function duplicatesExistingVoice(voiceNotes, noteName, voiceIndex) {
		var normalized = pitchService.normalizePitchName(noteName);

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			if (i !== voiceIndex && pitchService.normalizePitchName(voiceNotes[i].note) === normalized) {
				return true;
			}
		}

		return false;
	}

	function scaleDegreeIndex(noteName, scaleNotes) {
		var normalized = pitchService.normalizePitchName(noteName);

		for (var i = 0; i < (scaleNotes || []).length; i++) {
			var candidate = scaleNotes[i].nombre || scaleNotes[i];

			if (pitchService.normalizePitchName(candidate) === normalized) {
				return i % 7;
			}
		}

		return -1;
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

	function cloneVoiceNotes(voiceNotes) {
		var result = [];

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			result.push(extendObject(voiceNotes[i], {}));
		}

		return result;
	}

	function extendObject(target, values) {
		var result = {};
		var key;

		for (key in target || {}) {
			if (Object.prototype.hasOwnProperty.call(target, key)) {
				result[key] = target[key];
			}
		}

		for (key in values || {}) {
			if (Object.prototype.hasOwnProperty.call(values, key)) {
				result[key] = values[key];
			}
		}

		return result;
	}

	function isRootRole(role) {
		return String(role || '').indexOf('root') === 0;
	}

	function isThirdRole(role) {
		return String(role || '').indexOf('third') === 0;
	}

	function isFifthRole(role) {
		return String(role || '').indexOf('fifth') === 0;
	}

	function sameSign(a, b) {
		return (a < 0 && b < 0) || (a > 0 && b > 0);
	}

	function setInternalValue(target, key, value) {
		if (!target) {
			return;
		}

		if (typeof Object.defineProperty === 'function') {
			Object.defineProperty(target, key, {
				configurable: true,
				enumerable: false,
				value: value,
				writable: true
			});
			return;
		}

		target[key] = value;
	}

	function setMeasureValue(target, key, value) {
		if (!target) {
			return;
		}

		target[key] = value;
	}

	global.CodaProgressionMelodicCounterpoint = {
		annotateMeasures: annotateMeasures,
		chooseMelodicVoiceIndex: chooseMelodicVoiceIndex,
		chooseMelodicPhrasePlan: chooseMelodicPhrasePlan,
		choosePassingNote: choosePassingNote,
		chooseStructuralMelodyNote: chooseStructuralMelodyNote,
		melodicIntervalPenalty: melodicIntervalPenalty,
		planMelodicRhythm: planMelodicRhythm,
		shapeStructuralMelody: shapeStructuralMelody
	};
})(window);
