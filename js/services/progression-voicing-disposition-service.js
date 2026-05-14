// Applies closed/open voicing disposition rules to generated chord voicings.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;
	var voiceLeadingScoreService = global.CodaProgressionVoiceLeadingScore;

	function chooseCandidate(voicing, previousPlan, disposition) {
		var normalizedDisposition = normalize(disposition);
		var candidates = dispositionCandidates(voicing, normalizedDisposition);
		var bestCandidate = candidates[0];
		var bestScore = score(bestCandidate, previousPlan, normalizedDisposition);

		for (var i = 1; i < candidates.length; i++) {
			var candidateScore = score(candidates[i], previousPlan, normalizedDisposition);

			if (candidateScore < bestScore) {
				bestScore = candidateScore;
				bestCandidate = candidates[i];
			}
		}

		return bestCandidate;
	}

	function dispositionCandidates(voicing, disposition) {
		if (!voicing.midiNotes || voicing.midiNotes.length < 3) {
			return [voicing];
		}

		if (disposition === 'open') {
			return isOpenVoicing(voicing.midiNotes) ? [voicing] : [
				openUpperVoice(voicing, voicing.midiNotes.length - 1)
			];
		}

		return isOpenVoicing(voicing.midiNotes) ? [compactUpperVoices(voicing)] : [voicing];
	}

	function score(voicing, previousPlan, disposition) {
		var baseScore = previousPlan ?
			voiceLeadingScoreService.voiceLeadingTransitionScore(previousPlan, voicing) :
			voiceLeadingScoreService.firstVoicingScore(voicing);

		if (normalize(disposition) === 'open') {
			return baseScore + (isOpenVoicing(voicing.midiNotes) ? 0 : 24);
		}

		return baseScore;
	}

	function openUpperVoice(voicing, voiceIndex) {
		var midiNotes = voicing.midiNotes.slice();
		var voiceNotes = cloneVoiceNotes(voicing.voiceNotes);

		midiNotes[voiceIndex] += 12;
		voiceNotes[voiceIndex] = extendObject(voiceNotes[voiceIndex], {
			midiNote: midiNotes[voiceIndex]
		});

		return extendObject(voicing, {
			midiNotes: midiNotes,
			voiceNotes: voiceNotes
		});
	}

	function compactUpperVoices(voicing) {
		var midiNotes = voicing.midiNotes.slice();
		var voiceNotes = cloneVoiceNotes(voicing.voiceNotes);

		for (var i = midiNotes.length - 1; i >= 2; i--) {
			while (midiNotes[i] - 12 > midiNotes[i - 1]) {
				midiNotes[i] -= 12;
			}
			voiceNotes[i] = extendObject(voiceNotes[i], {
				midiNote: midiNotes[i]
			});
		}

		return extendObject(voicing, {
			midiNotes: midiNotes,
			voiceNotes: voiceNotes
		});
	}

	function isOpenVoicing(midiNotes) {
		return upperVoiceSpan(midiNotes) > 12;
	}

	function upperVoiceSpan(midiNotes) {
		if (!midiNotes || midiNotes.length < 3) {
			return 0;
		}

		return midiNotes[midiNotes.length - 1] - midiNotes[1];
	}

	function normalize(value) {
		return value === 'open' ? 'open' : 'closed';
	}

	function cloneVoiceNotes(voiceNotes) {
		return objectService.cloneObjects(voiceNotes);
	}

	function extendObject(source, values) {
		return objectService.extendObject(source, values);
	}

	global.CodaProgressionVoicingDisposition = {
		chooseCandidate: chooseCandidate,
		score: score,
		upperVoiceSpan: upperVoiceSpan
	};
})(window);
