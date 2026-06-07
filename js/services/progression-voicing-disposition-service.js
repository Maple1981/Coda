// Applies closed/open voicing disposition rules to generated chord voicings.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;
	var voiceLeadingScoreService = global.CodaProgressionVoiceLeadingScore;

	function chooseCandidate(voicing, previousPlan, disposition, options) {
		var normalizedDisposition = normalize(disposition);
		var candidates = dispositionCandidates(voicing, normalizedDisposition, options);
		var bestCandidate = candidates[0];
		var bestScore = score(bestCandidate, previousPlan, normalizedDisposition, options);

		for (var i = 1; i < candidates.length; i++) {
			var candidateScore = score(candidates[i], previousPlan, normalizedDisposition, options);

			if (candidateScore < bestScore) {
				bestScore = candidateScore;
				bestCandidate = candidates[i];
			}
		}

		return bestCandidate;
	}

	function dispositionCandidates(voicing, disposition, options) {
		var candidates;

		if (!voicing.midiNotes || voicing.midiNotes.length < 3) {
			return [voicing];
		}

		if (disposition === 'open') {
			candidates = isOpenVoicing(voicing.midiNotes) ? [voicing] : [
				openUpperVoice(voicing, voicing.midiNotes.length - 1)
			];
			return melodicUpperVoiceAlternatives(registerShiftCandidates(candidates).map(spreadLowRegister)).map(spreadLowRegisterSpacing);
		}

		candidates = isOpenVoicing(voicing.midiNotes) ? [compactUpperVoices(voicing)] : [voicing];

		candidates = registerShiftCandidates(candidates);
		candidates = melodicUpperVoiceAlternatives(candidates);

		if (!prefersLowRegisterSpacing(options && options.midiInstrument)) {
			return candidates;
		}

		return shouldForceLowRegisterSpacing(voicing, options) ? candidates.map(spreadLowRegisterSpacing) : lowRegisterSpacingAlternatives(candidates, spreadLowRegisterSpacing);
	}

	function score(voicing, previousPlan, disposition, options) {
		var baseScore = previousPlan ?
			voiceLeadingScoreService.voiceLeadingTransitionScore(previousPlan, voicing, options) :
			voiceLeadingScoreService.firstVoicingScore(voicing, options);

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

	function registerShiftCandidates(candidates) {
		var result = [];

		for (var i = 0; i < candidates.length; i++) {
			result.push(shiftRegister(candidates[i], -12));
			result.push(candidates[i]);
			result.push(shiftRegister(candidates[i], 12));
		}

		return result;
	}

	function melodicUpperVoiceAlternatives(candidates) {
		var result = [];

		for (var i = 0; i < candidates.length; i++) {
			appendUniqueCandidate(result, candidates[i]);
			appendUniqueCandidate(result, shiftUpperVoice(candidates[i], -12));
			appendUniqueCandidate(result, shiftUpperVoice(candidates[i], 12));
			appendUniqueCandidate(result, redistributeUpperVoiceDown(candidates[i]));
		}

		return result;
	}

	function shiftUpperVoice(voicing, semitones) {
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes.slice() : [];
		var voiceNotes = cloneVoiceNotes(voicing && voicing.voiceNotes);
		var topIndex = midiNotes.length - 1;

		if (topIndex <= 0) {
			return voicing;
		}

		midiNotes[topIndex] += semitones;

		if (midiNotes[topIndex] <= midiNotes[topIndex - 1]) {
			return voicing;
		}

		if (voiceNotes[topIndex]) {
			voiceNotes[topIndex] = extendObject(voiceNotes[topIndex], {
				midiNote: midiNotes[topIndex]
			});
		}

		return extendObject(voicing, {
			midiNotes: midiNotes,
			voiceNotes: voiceNotes
		});
	}

	function redistributeUpperVoiceDown(voicing) {
		var voiceNotes = cloneVoiceNotes(voicing && voicing.voiceNotes);
		var topIndex = voiceNotes.length - 1;
		var originalBass;
		var pairs = [];

		if (topIndex <= 1) {
			return voicing;
		}

		for (var i = 0; i < voiceNotes.length; i++) {
			pairs.push({
				midiNote: Number(voiceNotes[i] && voiceNotes[i].midiNote),
				voiceNote: voiceNotes[i]
			});
		}

		if (!isFinite(pairs[topIndex].midiNote)) {
			return voicing;
		}

		originalBass = pairs[0].midiNote;
		pairs[topIndex].midiNote -= 12;

		for (var j = topIndex - 1; j > 0; j--) {
			while (isFinite(pairs[j].midiNote) && pairs[j].midiNote >= pairs[topIndex].midiNote) {
				pairs[j].midiNote -= 12;
			}
		}

		pairs.sort(function (a, b) {
			return a.midiNote - b.midiNote;
		});

		if (!areStrictlyAscending(pairs) || pairs[0].midiNote !== originalBass) {
			return voicing;
		}

		return extendObject(voicing, {
			midiNotes: pairs.map(function (pair) {
				return pair.midiNote;
			}),
			notes: pairs.map(function (pair) {
				return pair.voiceNote && pair.voiceNote.note;
			}),
			voiceNotes: pairs.map(function (pair) {
				return extendObject(pair.voiceNote, {
					midiNote: pair.midiNote
				});
			})
		});
	}

	function areStrictlyAscending(pairs) {
		for (var i = 0; i < pairs.length; i++) {
			if (!isFinite(pairs[i].midiNote) || (i > 0 && pairs[i].midiNote <= pairs[i - 1].midiNote)) {
				return false;
			}
		}

		return true;
	}

	function shiftRegister(voicing, semitones) {
		var midiNotes = voicing.midiNotes.slice();
		var voiceNotes = cloneVoiceNotes(voicing.voiceNotes);

		for (var i = 0; i < midiNotes.length; i++) {
			midiNotes[i] += semitones;
			voiceNotes[i] = extendObject(voiceNotes[i], {
				midiNote: midiNotes[i]
			});
		}

		return extendObject(voicing, {
			midiNotes: midiNotes,
			voiceNotes: voiceNotes
		});
	}

	function spreadLowRegister(voicing) {
		var spacedVoicing = spreadLowRegisterSpacing(voicing);
		var midiNotes = spacedVoicing.midiNotes ? spacedVoicing.midiNotes.slice() : [];
		var voiceNotes = cloneVoiceNotes(spacedVoicing.voiceNotes);
		var changed = spacedVoicing !== voicing;

		while (midiNotes.length >= 3 && !isOpenVoicing(midiNotes)) {
			var topIndex = midiNotes.length - 1;

			midiNotes[topIndex] += 12;
			changed = true;
			if (voiceNotes[topIndex]) {
				voiceNotes[topIndex] = extendObject(voiceNotes[topIndex], {
					midiNote: midiNotes[topIndex]
				});
			}
		}

		return changed ? extendObject(spacedVoicing, {
			midiNotes: midiNotes,
			voiceNotes: voiceNotes
		}) : spacedVoicing;
	}

	function spreadLowRegisterSpacing(voicing) {
		var midiNotes = voicing.midiNotes ? voicing.midiNotes.slice() : [];
		var voiceNotes = cloneVoiceNotes(voicing.voiceNotes);
		var changed = false;

		for (var i = 1; i < midiNotes.length; i++) {
			var minimumGap = minimumLowRegisterGap(midiNotes[i - 1], i);

			while (minimumGap && midiNotes[i] - midiNotes[i - 1] < minimumGap) {
				midiNotes[i] += 12;
				changed = true;
			}

			if (changed && voiceNotes[i]) {
				voiceNotes[i] = extendObject(voiceNotes[i], {
					midiNote: midiNotes[i]
				});
			}
		}

		return changed ? extendObject(voicing, {
			midiNotes: midiNotes,
			voiceNotes: voiceNotes
		}) : voicing;
	}

	function lowRegisterSpacingAlternatives(candidates, spacingFunction) {
		var result = [];

		for (var i = 0; i < candidates.length; i++) {
			appendUniqueCandidate(result, candidates[i]);
			appendUniqueCandidate(result, spacingFunction(candidates[i]));
		}

		return result;
	}

	function shouldForceLowRegisterSpacing(voicing, options) {
		var midiNotes = voicing && voicing.midiNotes ? voicing.midiNotes : [];
		var bass = Number(midiNotes[0]);
		var center = Number(options && options.registerCenterMidi);

		return isFinite(bass) && (bass < 40 || (bass < 48 && isFinite(center) && center < 50));
	}

	function appendUniqueCandidate(target, candidate) {
		var key = candidateKey(candidate);

		for (var i = 0; i < target.length; i++) {
			if (candidateKey(target[i]) === key) {
				return;
			}
		}

		target.push(candidate);
	}

	function candidateKey(candidate) {
		return (candidate && candidate.midiNotes ? candidate.midiNotes : []).join(',');
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
		return midiInstrument === 'acoustic_grand_piano' ||
			midiInstrument === 'drawbar_organ' ||
			midiInstrument === 'string_ensemble_1' ||
			midiInstrument === 'pad_2_warm';
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
		melodicUpperVoiceAlternatives: melodicUpperVoiceAlternatives,
		minimumLowRegisterGap: minimumLowRegisterGap,
		registerShiftCandidates: registerShiftCandidates,
		redistributeUpperVoiceDown: redistributeUpperVoiceDown,
		score: score,
		spreadLowRegister: spreadLowRegister,
		spreadLowRegisterSpacing: spreadLowRegisterSpacing,
		upperVoiceSpan: upperVoiceSpan
	};
})(window);
