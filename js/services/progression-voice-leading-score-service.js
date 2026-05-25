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
		return voicing.inversionIndex * 2 + voiceSpan(voicing.midiNotes) / 12 + registerCenterPenalty(voicing, options && options.registerCenterMidi) + lowRegisterBassPenalty(voicing);
	}

	function transitionScore(previousMidiNotes, nextMidiNotes) {
		var length = Math.min(previousMidiNotes.length, nextMidiNotes.length);
		var score = Math.abs(previousMidiNotes.length - nextMidiNotes.length) * 4;

		for (var i = 0; i < length; i++) {
			score += Math.abs(pitchService.nearestMidiTo(previousMidiNotes[i], nextMidiNotes[i]) - previousMidiNotes[i]);
		}

		return score;
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

	global.CodaProgressionVoiceLeadingScore = {
		countParallelPerfects: countParallelPerfects,
		firstVoicingScore: firstVoicingScore,
		lowRegisterBassPenalty: lowRegisterBassPenalty,
		registerCenterPenalty: registerCenterPenalty,
		voiceLeadingTransitionScore: voiceLeadingTransitionScore
	};
})(window);
