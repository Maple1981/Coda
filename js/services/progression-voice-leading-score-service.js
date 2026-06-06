// Scores voice-leading transitions and detects parallel perfect intervals.
(function (global) {
	'use strict';

	var pitchService = global.CodaProgressionPitch;

	function voiceLeadingTransitionScore(previousPlan, nextPlan, options) {
		var score = transitionScore(previousPlan.midiNotes, nextPlan.midiNotes);
		var commonTones = pitchService.commonPitchNames(previousPlan.notes, nextPlan.notes).length;
		var parallelPerfects = countParallelPerfects(previousPlan.midiNotes, nextPlan.midiNotes, false);
		var exteriorParallelPerfects = countParallelPerfects(previousPlan.midiNotes, nextPlan.midiNotes, true);

		score -= commonTones * 3;
		score += parallelPerfects * 18;
		score += exteriorParallelPerfects * 28;
		score += registerCenterPenalty(nextPlan, options && options.registerCenterMidi);
		score += lowRegisterBassPenalty(nextPlan);
		score += playableRangePenalty(nextPlan, options && options.playableRange);
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
			playableRangePenalty(voicing, options && options.playableRange);
	}

	function transitionScore(previousMidiNotes, nextMidiNotes) {
		var length = Math.min(previousMidiNotes.length, nextMidiNotes.length);
		var score = Math.abs(previousMidiNotes.length - nextMidiNotes.length) * 4;

		for (var i = 0; i < length; i++) {
			score += Math.abs(pitchService.nearestMidiTo(previousMidiNotes[i], nextMidiNotes[i]) - previousMidiNotes[i]);
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

	global.CodaProgressionVoiceLeadingScore = {
		commonToneStickinessBonus: commonToneStickinessBonus,
		countParallelPerfects: countParallelPerfects,
		firstVoicingScore: firstVoicingScore,
		lowRegisterBassPenalty: lowRegisterBassPenalty,
		playableRangePenalty: playableRangePenalty,
		registerCenterPenalty: registerCenterPenalty,
		voiceLeadingTransitionScore: voiceLeadingTransitionScore
	};
})(window);
