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
			return registerShiftCandidates(candidates).map(spreadLowRegister);
		}

		candidates = isOpenVoicing(voicing.midiNotes) ? [compactUpperVoices(voicing)] : [voicing];

		candidates = registerShiftCandidates(candidates);

		return prefersLowRegisterSpacing(options && options.midiInstrument) ? candidates.map(spreadLowRegisterSpacing) : candidates;
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
		minimumLowRegisterGap: minimumLowRegisterGap,
		registerShiftCandidates: registerShiftCandidates,
		score: score,
		spreadLowRegister: spreadLowRegister,
		spreadLowRegisterSpacing: spreadLowRegisterSpacing,
		upperVoiceSpan: upperVoiceSpan
	};
})(window);
