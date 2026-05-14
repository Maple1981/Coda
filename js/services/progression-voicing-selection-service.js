// Selects the best voicing inversion and disposition for a chord.
(function (global) {
	'use strict';

	var voicingDispositionService = global.CodaProgressionVoicingDisposition;
	var voicingFactory = global.CodaProgressionVoicingFactory;

	function chooseVoicing(options) {
		var labels = options.kind === 'seventh' ? ['', '6/5', '4/3', '4/2'] : ['', '6', '6/4'];
		var maxInversions = Math.min(options.baseNotes.length, labels.length);
		var bestVoicing = null;
		var bestScore = Infinity;
		var forcedInversionIndex = options.forceInversionIndex != null ? voicingFactory.clampInversionIndex(options.forceInversionIndex, maxInversions) : null;
		var disposition = normalizeVoicingDisposition(options.voicing);

		if (forcedInversionIndex != null) {
			bestVoicing = buildVoicingCandidate(options, forcedInversionIndex, labels[forcedInversionIndex], disposition);

			return voicingDispositionService.chooseCandidate(bestVoicing, options.previousPlan, disposition);
		}

		for (var i = 0; i < maxInversions; i++) {
			var voicing = buildVoicingCandidate(options, i, labels[i], disposition);
			var score = voicingDispositionService.score(voicing, options.previousPlan, disposition);

			if (score < bestScore) {
				bestScore = score;
				bestVoicing = voicing;
			}
		}

		return bestVoicing || voicingDispositionService.chooseCandidate(voicingFactory.create({
			baseNotes: options.baseNotes,
			chordName: options.chordName,
			extraNotes: options.extraNotes,
			initialMidiNote: options.initialMidiNote,
			inversionIndex: 0,
			inversionLabel: '',
			kind: options.kind,
			voices: options.voices
		}), options.previousPlan, disposition);
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

		return voicingDispositionService.chooseCandidate(voicing, options.previousPlan, disposition);
	}

	function normalizeVoicingDisposition(value) {
		return value === 'open' ? 'open' : 'closed';
	}

	global.CodaProgressionVoicingSelection = {
		buildVoicingCandidate: buildVoicingCandidate,
		chooseVoicing: chooseVoicing,
		normalizeVoicingDisposition: normalizeVoicingDisposition
	};
})(window);
