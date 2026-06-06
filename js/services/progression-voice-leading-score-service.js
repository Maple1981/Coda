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

		return (excess * excess) / 3;
	}

	function lowRegisterBassPenalty(voicing) {
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes : [];
		var bass = Number(midiNotes[0]);
		var excess;

		if (!isFinite(bass) || bass >= 40) {
			return 0;
		}

		excess = 40 - bass;

		return excess * excess * 4;
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
			return pianoVoicingPenalty(voicing);
		}

		return 0;
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
		firstVoicingScore: firstVoicingScore,
		guitarFingeringOptions: guitarFingeringOptions,
		guitarVoicingPenalty: guitarVoicingPenalty,
		idiomaticInstrumentPenalty: idiomaticInstrumentPenalty,
		lowRegisterBassPenalty: lowRegisterBassPenalty,
		playableRangePenalty: playableRangePenalty,
		pianoHandSpanPenaltyForSpan: pianoHandSpanPenaltyForSpan,
		pianoVoicingPenalty: pianoVoicingPenalty,
		registerCenterPenalty: registerCenterPenalty,
		voiceLeadingTransitionScore: voiceLeadingTransitionScore
	};
})(window);
