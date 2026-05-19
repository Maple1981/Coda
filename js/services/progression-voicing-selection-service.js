// Selects the best voicing inversion and disposition for a chord.
(function (global) {
	'use strict';

	var voicingDispositionService = global.CodaProgressionVoicingDisposition;
	var voicingFactory = global.CodaProgressionVoicingFactory;
	var MAX_INVERSION_RUN = 3;
	var INVERSION_RUN_PENALTY = 1000;

	function chooseVoicing(options) {
		var labels = options.kind === 'seventh' ? ['', '6/5', '4/3', '4/2'] : ['', '6', '6/4'];
		var maxInversions = Math.min(options.baseNotes.length, labels.length);
		var bestVoicing = null;
		var bestScore = Infinity;
		var forcedInversionIndex = options.forceInversionIndex != null ? voicingFactory.clampInversionIndex(options.forceInversionIndex, maxInversions) : null;
		var disposition = normalizeVoicingDisposition(options.voicing);

		if (forcedInversionIndex != null) {
			bestVoicing = buildVoicingCandidate(options, forcedInversionIndex, labels[forcedInversionIndex], disposition);

			return withInversionRunMetadata(voicingDispositionService.chooseCandidate(bestVoicing, options.previousPlan, disposition, scoreOptions(options)), options.previousPlan);
		}

		for (var i = 0; i < maxInversions; i++) {
			var voicing = buildVoicingCandidate(options, i, labels[i], disposition);
			var score = voicingDispositionService.score(voicing, options.previousPlan, disposition, scoreOptions(options)) +
				inversionRunPenalty(voicing, options.previousPlan);

			if (score < bestScore) {
				bestScore = score;
				bestVoicing = voicing;
			}
		}

		if (bestVoicing) {
			return withInversionRunMetadata(bestVoicing, options.previousPlan);
		}

		return withInversionRunMetadata(voicingDispositionService.chooseCandidate(voicingFactory.create({
			baseNotes: options.baseNotes,
			chordName: options.chordName,
			extraNotes: options.extraNotes,
			initialMidiNote: options.initialMidiNote,
			inversionIndex: 0,
			inversionLabel: '',
			kind: options.kind,
			voices: options.voices
		}), options.previousPlan, disposition, scoreOptions(options)), options.previousPlan);
	}

	function buildVoicingCandidate(options, inversionIndex, inversionLabel, disposition) {
		var voicing = voicingFactory.create({
			baseNotes: options.baseNotes,
			chordName: options.chordName,
			extraNotes: options.extraNotes,
			initialMidiNote: options.initialMidiNote,
			inversionIndex: inversionIndex,
			inversionLabel: inversionLabel,
			kind: options.kind,
			voices: options.voices
		});

		if (options.previousPlan) {
			voicing = voicingFactory.fitToPrevious(voicing, options.previousPlan);
		}

		return voicingDispositionService.chooseCandidate(voicing, options.previousPlan, disposition, scoreOptions(options));
	}

	function normalizeVoicingDisposition(value) {
		return value === 'open' ? 'open' : 'closed';
	}

	function scoreOptions(options) {
		return {
			registerCenterMidi: registerCenterMidi(options)
		};
	}

	function registerCenterMidi(options) {
		var center = Number(options && options.registerCenterMidi);
		var fallback = Number(options && options.initialMidiNote);

		if (isFinite(center)) {
			return center;
		}

		return (isFinite(fallback) ? fallback : 60) - 6;
	}

	function inversionRunKey(plan) {
		var inversionIndex = Number(plan && plan.inversionIndex);

		return isFinite(inversionIndex) ? String(inversionIndex) : '';
	}

	function nextInversionRunLength(previousPlan, nextPlan) {
		var previousKey = previousPlan && previousPlan.inversionRunKey != null ?
			String(previousPlan.inversionRunKey) :
			inversionRunKey(previousPlan);
		var nextKey = inversionRunKey(nextPlan);
		var previousLength = Number(previousPlan && previousPlan.inversionRunLength);

		if (!nextKey) {
			return 0;
		}

		if (previousKey === nextKey) {
			return (isFinite(previousLength) && previousLength > 0 ? previousLength : 1) + 1;
		}

		return 1;
	}

	function inversionRunPenalty(voicing, previousPlan) {
		if (!previousPlan || inversionRunKey(voicing) !== (previousPlan.inversionRunKey != null ? String(previousPlan.inversionRunKey) : inversionRunKey(previousPlan))) {
			return 0;
		}

		return nextInversionRunLength(previousPlan, voicing) > MAX_INVERSION_RUN ? INVERSION_RUN_PENALTY : 0;
	}

	function withInversionRunMetadata(voicing, previousPlan) {
		var runKey = inversionRunKey(voicing);
		var runLength = nextInversionRunLength(previousPlan, voicing);

		setInternalValue(voicing, 'inversionRunKey', runKey);
		setInternalValue(voicing, 'inversionRunLength', runLength);

		return voicing;
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

	global.CodaProgressionVoicingSelection = {
		buildVoicingCandidate: buildVoicingCandidate,
		chooseVoicing: chooseVoicing,
		inversionRunKey: inversionRunKey,
		inversionRunPenalty: inversionRunPenalty,
		nextInversionRunLength: nextInversionRunLength,
		normalizeVoicingDisposition: normalizeVoicingDisposition,
		registerCenterMidi: registerCenterMidi,
		withInversionRunMetadata: withInversionRunMetadata
	};
})(window);
