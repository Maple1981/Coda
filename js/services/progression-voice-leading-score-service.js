// Scores voice-leading transitions and detects parallel perfect intervals.
(function (global) {
	'use strict';

	var pitchService = global.CodaProgressionPitch;
	var GUITAR_OPEN_STRING_MIDI_NOTES = [40, 45, 50, 55, 59, 64];
	var GUITAR_MAX_FRET = 24;

	function voiceLeadingTransitionScore(previousPlan, nextPlan, options) {
		var score = transitionScore(previousPlan.midiNotes, nextPlan.midiNotes, options);
		var commonTones = pitchService.commonPitchNames(previousPlan.notes, nextPlan.notes).length;
		var parallelPerfects = countParallelPerfects(previousPlan.midiNotes, nextPlan.midiNotes, false);
		var exteriorParallelPerfects = countParallelPerfects(previousPlan.midiNotes, nextPlan.midiNotes, true);

		score -= commonTones * 3;
		score += parallelPerfects * 18;
		score += exteriorParallelPerfects * 28;
		score += registerCenterPenalty(nextPlan, options && options.registerCenterMidi);
		score += lowRegisterBassPenalty(nextPlan);
		score += playableRangePenalty(nextPlan, options && options.playableRange);
		score += idiomaticInstrumentPenalty(nextPlan, options && options.midiInstrument);
		score += melodicMotionPenalty(previousPlan.midiNotes, nextPlan.midiNotes, options);
		score += upperVoiceGapPenalty(nextPlan);
		score += extremeUpperRegisterPenalty(nextPlan);
		score -= commonToneStickinessBonus(previousPlan, nextPlan, options && options.commonToneStickiness);

		return score;
	}

	function countParallelPerfects(previousMidiNotes, nextMidiNotes, exteriorOnly) {
		var count = 0;
		var length = Math.min((previousMidiNotes || []).length, (nextMidiNotes || []).length);

		for (var i = 0; i < length; i++) {
			for (var j = i + 1; j < length; j++) {
				if (exteriorOnly && !(i === 0 && j === length - 1)) {
					continue;
				}

				if (isParallelPerfect(previousMidiNotes, nextMidiNotes, i, j)) {
					count += 1;
				}
			}
		}

		return count;
	}

	function firstVoicingScore(voicing, options) {
		return voicing.inversionIndex * 2 +
			voiceSpan(voicing.midiNotes) / 12 +
			registerCenterPenalty(voicing, options && options.registerCenterMidi) +
			lowRegisterBassPenalty(voicing) +
			upperVoiceGapPenalty(voicing) +
			extremeUpperRegisterPenalty(voicing) +
			playableRangePenalty(voicing, options && options.playableRange) +
			idiomaticInstrumentPenalty(voicing, options && options.midiInstrument);
	}

	function transitionScore(previousMidiNotes, nextMidiNotes, options) {
		var length = Math.min(previousMidiNotes.length, nextMidiNotes.length);
		var score = Math.abs(previousMidiNotes.length - nextMidiNotes.length) * 4;

		for (var i = 0; i < length; i++) {
			score += options && options.pitchClassOnly ?
				Math.abs(pitchService.nearestMidiTo(previousMidiNotes[i], nextMidiNotes[i]) - previousMidiNotes[i]) :
				Math.abs(nextMidiNotes[i] - previousMidiNotes[i]);
		}

		return score;
	}

	function melodicMotionPenalty(previousMidiNotes, nextMidiNotes, options) {
		var length = Math.min((previousMidiNotes || []).length, (nextMidiNotes || []).length);
		var penalty = 0;

		for (var i = 0; i < length; i++) {
			var motion = options && options.pitchClassOnly ?
				Math.abs(pitchService.nearestMidiTo(previousMidiNotes[i], nextMidiNotes[i]) - previousMidiNotes[i]) :
				Math.abs(Number(nextMidiNotes[i]) - Number(previousMidiNotes[i]));

			if (!isFinite(motion)) {
				continue;
			}

			penalty += melodicLeapPenalty(motion) * voiceMotionWeight(i, length);
		}

		return penalty;
	}

	function melodicLeapPenalty(motion) {
		var interval = Math.max(0, Number(motion) || 0);
		var excess;

		if (interval <= 2) {
			return 0;
		}

		if (interval <= 4) {
			return (interval - 2) * 1.5;
		}

		if (interval <= 7) {
			excess = interval - 4;
			return 4 + (excess * excess * 3);
		}

		if (interval <= 12) {
			excess = interval - 7;
			return 32 + (excess * excess * 5);
		}

		excess = interval - 12;

		return 160 + (excess * excess * 12);
	}

	function voiceMotionWeight(index, length) {
		if (index === length - 1) {
			return 2.6;
		}

		if (index === 0) {
			return 1.35;
		}

		return 1.7;
	}

	function commonToneStickinessBonus(previousPlan, nextPlan, weight) {
		var normalizedWeight = Math.max(0, Number(weight) || 0);
		var sameVoiceCount;
		var sameMidiCount;

		if (!normalizedWeight) {
			return 0;
		}

		sameVoiceCount = stickySameVoiceCommonTones(previousPlan, nextPlan);
		sameMidiCount = stickySameMidiCommonTones(previousPlan, nextPlan);

		return (sameVoiceCount * normalizedWeight) + (sameMidiCount * Math.round(normalizedWeight / 2));
	}

	function stickySameVoiceCommonTones(previousPlan, nextPlan) {
		var previousVoices = previousPlan && previousPlan.voiceNotes ? previousPlan.voiceNotes : [];
		var nextVoices = nextPlan && nextPlan.voiceNotes ? nextPlan.voiceNotes : [];
		var length = Math.min(previousVoices.length, nextVoices.length);
		var count = 0;

		for (var i = 0; i < length; i++) {
			if (
				Number(previousVoices[i].midiNote) === Number(nextVoices[i].midiNote) &&
				pitchService.normalizePitchName(previousVoices[i].note) === pitchService.normalizePitchName(nextVoices[i].note)
			) {
				count += 1;
			}
		}

		return count;
	}

	function stickySameMidiCommonTones(previousPlan, nextPlan) {
		var previousVoices = previousPlan && previousPlan.voiceNotes ? previousPlan.voiceNotes : [];
		var nextVoices = nextPlan && nextPlan.voiceNotes ? nextPlan.voiceNotes : [];
		var usedNext = {};
		var count = 0;

		for (var i = 0; i < previousVoices.length; i++) {
			for (var j = 0; j < nextVoices.length; j++) {
				if (usedNext[j]) {
					continue;
				}

				if (
					Number(previousVoices[i].midiNote) === Number(nextVoices[j].midiNote) &&
					pitchService.normalizePitchName(previousVoices[i].note) === pitchService.normalizePitchName(nextVoices[j].note)
				) {
					usedNext[j] = true;
					count += 1;
					break;
				}
			}
		}

		return count;
	}

	function isParallelPerfect(previousMidiNotes, nextMidiNotes, lowerIndex, upperIndex) {
		var previousInterval = intervalClass(previousMidiNotes[upperIndex] - previousMidiNotes[lowerIndex]);
		var nextInterval = intervalClass(nextMidiNotes[upperIndex] - nextMidiNotes[lowerIndex]);
		var lowerMotion = nextMidiNotes[lowerIndex] - previousMidiNotes[lowerIndex];
		var upperMotion = nextMidiNotes[upperIndex] - previousMidiNotes[upperIndex];

		if (!isPerfectInterval(previousInterval) || previousInterval !== nextInterval) {
			return false;
		}

		if (lowerMotion === 0 || upperMotion === 0) {
			return false;
		}

		return (lowerMotion > 0 && upperMotion > 0) || (lowerMotion < 0 && upperMotion < 0);
	}

	function intervalClass(interval) {
		return Math.abs(interval) % 12;
	}

	function isPerfectInterval(interval) {
		return interval === 0 || interval === 7;
	}

	function voiceSpan(midiNotes) {
		if (!midiNotes.length) {
			return 0;
		}

		return midiNotes[midiNotes.length - 1] - midiNotes[0];
	}

	function registerCenterPenalty(voicing, registerCenterMidi) {
		var center = Number(registerCenterMidi);
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes : [];
		var centroid;
		var distance;
		var excess;

		if (!isFinite(center) || !midiNotes.length) {
			return 0;
		}

		centroid = midiNotes.reduce(function (sum, midiNote) {
			return sum + midiNote;
		}, 0) / midiNotes.length;
		distance = Math.abs(centroid - center);
		excess = Math.max(0, distance - 6);

		return (excess * excess) / 1.5;
	}

	function lowRegisterBassPenalty(voicing) {
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes : [];
		var bass = Number(midiNotes[0]);
		var excess;

		if (!isFinite(bass) || bass >= 40) {
			return 0;
		}

		excess = 40 - bass;

		return excess * excess * 40;
	}

	function upperVoiceGapPenalty(voicing) {
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes : [];
		var penalty = 0;

		for (var i = 2; i < midiNotes.length; i++) {
			var gap = Number(midiNotes[i]) - Number(midiNotes[i - 1]);
			var excess;

			if (!isFinite(gap) || gap <= 17) {
				continue;
			}

			excess = gap - 17;
			penalty += excess * excess * 8;
		}

		return penalty;
	}

	function extremeUpperRegisterPenalty(voicing) {
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes : [];
		var top = Number(midiNotes[midiNotes.length - 1]);
		var excess;

		if (!isFinite(top) || top <= 96) {
			return 0;
		}

		excess = top - 96;

		return excess * excess * 6;
	}

	function playableRangePenalty(voicing, range) {
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes : [];
		var min = range && range.min != null ? Number(range.min) : NaN;
		var max = range && range.max != null ? Number(range.max) : NaN;
		var penalty = 0;

		if (!isFinite(min) && !isFinite(max)) {
			return 0;
		}

		for (var i = 0; i < midiNotes.length; i++) {
			var midiNote = Number(midiNotes[i]);
			var excess = 0;

			if (!isFinite(midiNote)) {
				continue;
			}

			if (isFinite(min) && midiNote < min) {
				excess = min - midiNote;
			} else if (isFinite(max) && midiNote > max) {
				excess = midiNote - max;
			}

			penalty += excess * excess * 10000;
		}

		return penalty;
	}

	function idiomaticInstrumentPenalty(voicing, midiInstrument) {
		if (midiInstrument === 'acoustic_guitar_nylon') {
			return guitarVoicingPenalty(voicing);
		}

		if (midiInstrument === 'acoustic_grand_piano') {
			return pianoVoicingPenalty(voicing) + lowRegisterSpacingPenalty(voicing);
		}

		if (prefersLowRegisterSpacing(midiInstrument)) {
			return lowRegisterSpacingPenalty(voicing);
		}

		return 0;
	}

	function lowRegisterSpacingPenalty(voicing) {
		var midiNotes = sortedMidiNotes(voicing);
		var penalty = 0;

		for (var i = 1; i < midiNotes.length; i++) {
			var minimumGap = minimumLowRegisterGap(midiNotes[i - 1], i);
			var gap = midiNotes[i] - midiNotes[i - 1];
			var shortage = Math.max(0, minimumGap - gap);

			penalty += shortage * shortage * (i === 1 ? 10 : 4);
		}

		return penalty;
	}

	function minimumLowRegisterGap(lowerMidiNote, upperVoiceIndex) {
		var lower = Number(lowerMidiNote);

		if (!isFinite(lower)) {
			return 0;
		}

		if (upperVoiceIndex === 1) {
			if (lower < 36) {
				return 12;
			}

			if (lower < 48) {
				return 8;
			}

			if (lower < 52) {
				return 7;
			}
		}

		if (lower < 43) {
			return 7;
		}

		if (lower < 50) {
			return 5;
		}

		return 1;
	}

	function prefersLowRegisterSpacing(midiInstrument) {
		return midiInstrument === 'drawbar_organ' ||
			midiInstrument === 'string_ensemble_1' ||
			midiInstrument === 'pad_2_warm';
	}

	function pianoVoicingPenalty(voicing) {
		var midiNotes = sortedMidiNotes(voicing);
		var bestPenalty = Infinity;

		if (midiNotes.length < 3) {
			return 0;
		}

		for (var split = 1; split < midiNotes.length; split++) {
			bestPenalty = Math.min(
				bestPenalty,
				pianoHandPenalty(midiNotes.slice(0, split)) + pianoHandPenalty(midiNotes.slice(split))
			);
		}

		return isFinite(bestPenalty) ? bestPenalty : 0;
	}

	function pianoHandPenalty(midiNotes) {
		var span;
		var penalty;

		if (midiNotes.length < 2) {
			return 0;
		}

		span = midiNotes[midiNotes.length - 1] - midiNotes[0];
		penalty = pianoHandSpanPenaltyForSpan(span);

		if (midiNotes.length >= 3 && span > 14) {
			penalty += 8 + ((span - 14) * 4);
		}

		return penalty;
	}

	function pianoHandSpanPenaltyForSpan(span) {
		var normalizedSpan = Math.max(0, Number(span) || 0);
		var excess;

		if (normalizedSpan <= 12) {
			return 0;
		}

		if (normalizedSpan <= 14) {
			return (normalizedSpan - 12) * 3;
		}

		if (normalizedSpan <= 16) {
			return 8 + ((normalizedSpan - 14) * 8);
		}

		excess = normalizedSpan - 16;

		return 30 + (excess * excess * 12);
	}

	function guitarVoicingPenalty(voicing) {
		var midiNotes = sortedMidiNotes(voicing);
		var bestPenalty;

		if (!midiNotes.length) {
			return 0;
		}

		if (midiNotes.length > GUITAR_OPEN_STRING_MIDI_NOTES.length) {
			return 12000 + ((midiNotes.length - GUITAR_OPEN_STRING_MIDI_NOTES.length) * 2000);
		}

		bestPenalty = bestGuitarAssignmentPenalty(midiNotes, 0, {}, []);

		return isFinite(bestPenalty) ? bestPenalty : 12000;
	}

	function bestGuitarAssignmentPenalty(midiNotes, index, usedStrings, assignment) {
		var options;
		var bestPenalty = Infinity;

		if (index >= midiNotes.length) {
			return guitarAssignmentPenalty(assignment);
		}

		options = guitarFingeringOptions(midiNotes[index]);

		for (var i = 0; i < options.length; i++) {
			if (usedStrings[options[i].stringIndex]) {
				continue;
			}

			usedStrings[options[i].stringIndex] = true;
			assignment.push(options[i]);
			bestPenalty = Math.min(bestPenalty, bestGuitarAssignmentPenalty(midiNotes, index + 1, usedStrings, assignment));
			assignment.pop();
			delete usedStrings[options[i].stringIndex];
		}

		return bestPenalty;
	}

	function guitarFingeringOptions(midiNote) {
		var normalizedMidiNote = Number(midiNote);
		var options = [];

		if (!isFinite(normalizedMidiNote)) {
			return options;
		}

		for (var i = 0; i < GUITAR_OPEN_STRING_MIDI_NOTES.length; i++) {
			var fret = normalizedMidiNote - GUITAR_OPEN_STRING_MIDI_NOTES[i];

			if (fret >= 0 && fret <= GUITAR_MAX_FRET) {
				options.push({
					fret: fret,
					stringIndex: i
				});
			}
		}

		return options.sort(function (a, b) {
			if (a.fret !== b.fret) {
				return a.fret - b.fret;
			}

			return a.stringIndex - b.stringIndex;
		});
	}

	function guitarAssignmentPenalty(assignment) {
		var fretted = [];
		var fretCounts = {};
		var openCount = 0;
		var penalty = 0;
		var bassStringIndex;
		var fretSpan;
		var barreBonus = 0;

		for (var i = 0; i < assignment.length; i++) {
			var fret = assignment[i].fret;

			if (fret === 0) {
				openCount += 1;
			} else {
				fretted.push(fret);
				fretCounts[fret] = (fretCounts[fret] || 0) + 1;
			}
		}

		if (fretted.length) {
			fretted.sort(function (a, b) {
				return a - b;
			});
			fretSpan = fretted[fretted.length - 1] - fretted[0];

			if (fretSpan === 5) {
				penalty += 24;
			} else if (fretSpan > 5) {
				penalty += 120 + ((fretSpan - 5) * (fretSpan - 5) * 60);
			}
		}

		Object.keys(fretCounts).forEach(function (fret) {
			if (fretCounts[fret] > 1) {
				barreBonus += (fretCounts[fret] - 1) * 4;
			}
		});

		bassStringIndex = assignment[0] ? assignment[0].stringIndex : 0;
		if (bassStringIndex > 2) {
			penalty += (bassStringIndex - 2) * 8;
		}

		return Math.max(0, penalty - (openCount * 4) - barreBonus);
	}

	function sortedMidiNotes(voicing) {
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes : [];

		return midiNotes.map(function (midiNote) {
			return Number(midiNote);
		}).filter(function (midiNote) {
			return isFinite(midiNote);
		}).sort(function (a, b) {
			return a - b;
		});
	}

	global.CodaProgressionVoiceLeadingScore = {
		commonToneStickinessBonus: commonToneStickinessBonus,
		countParallelPerfects: countParallelPerfects,
		extremeUpperRegisterPenalty: extremeUpperRegisterPenalty,
		firstVoicingScore: firstVoicingScore,
		guitarFingeringOptions: guitarFingeringOptions,
		guitarVoicingPenalty: guitarVoicingPenalty,
		idiomaticInstrumentPenalty: idiomaticInstrumentPenalty,
		lowRegisterBassPenalty: lowRegisterBassPenalty,
		lowRegisterSpacingPenalty: lowRegisterSpacingPenalty,
		melodicLeapPenalty: melodicLeapPenalty,
		melodicMotionPenalty: melodicMotionPenalty,
		playableRangePenalty: playableRangePenalty,
		pianoHandSpanPenaltyForSpan: pianoHandSpanPenaltyForSpan,
		pianoVoicingPenalty: pianoVoicingPenalty,
		registerCenterPenalty: registerCenterPenalty,
		upperVoiceGapPenalty: upperVoiceGapPenalty,
		voiceLeadingTransitionScore: voiceLeadingTransitionScore
	};
})(window);
