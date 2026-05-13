// Servicio de disposición y conducción de voces para progresiones armónicas.
(function (global) {
	'use strict';

	var pitchService = global.CodaProgressionPitch;
	var voiceLeadingScoreService = global.CodaProgressionVoiceLeadingScore;
	var voicingDispositionService = global.CodaProgressionVoicingDisposition;

	function chooseVoicing(options) {
		var labels = options.kind === 'seventh' ? ['', '6/5', '4/3', '4/2'] : ['', '6', '6/4'];
		var maxInversions = Math.min(options.baseNotes.length, labels.length);
		var bestVoicing = null;
		var bestScore = Infinity;
		var forcedInversionIndex = options.forceInversionIndex != null ? clampInversionIndex(options.forceInversionIndex, maxInversions) : null;
		var disposition = normalizeVoicingDisposition(options.voicing);

		if (forcedInversionIndex != null) {
			bestVoicing = createVoicing({
				baseNotes: options.baseNotes,
				chordName: options.chordName,
				extraNotes: options.extraNotes,
				initialMidiNote: options.initialMidiNote,
				inversionIndex: forcedInversionIndex,
				inversionLabel: labels[forcedInversionIndex],
				kind: options.kind,
				voices: options.voices
			});
			if (options.previousPlan) {
				bestVoicing = fitVoicingToPrevious(bestVoicing, options.previousPlan);
			}

			return voicingDispositionService.chooseCandidate(bestVoicing, options.previousPlan, disposition);
		}

		for (var i = 0; i < maxInversions; i++) {
			var voicing = createVoicing({
				baseNotes: options.baseNotes,
				chordName: options.chordName,
				extraNotes: options.extraNotes,
				initialMidiNote: options.initialMidiNote,
				inversionIndex: i,
				inversionLabel: labels[i],
				kind: options.kind,
				voices: options.voices
			});
			if (options.previousPlan) {
				voicing = fitVoicingToPrevious(voicing, options.previousPlan);
			}
			voicing = voicingDispositionService.chooseCandidate(voicing, options.previousPlan, disposition);
			var score = voicingScore(voicing, options.previousPlan, disposition);

			if (score < bestScore) {
				bestScore = score;
				bestVoicing = voicing;
			}
		}

		return bestVoicing || voicingDispositionService.chooseCandidate(createVoicing({
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

	function voicingScore(voicing, previousPlan, disposition) {
		return voicingDispositionService.score(voicing, previousPlan, disposition);
	}

	function createVoicing(options) {
		var voiceCount = Math.max(1, Math.min(numberOrDefault(options.voices, 4), 6));
		var preparedBase = prepareBaseNotesForVoiceCount(options.baseNotes, options.kind, voiceCount, options.chordName);
		var baseNotes = rotate(preparedBase.notes, options.inversionIndex);
		var notes = baseNotes.slice();
		var factorRoles = rotate(preparedBase.roles, options.inversionIndex);
		var roles = factorRoles.slice();
		var duplicateIndex = 0;
		var duplicatePreference = ['root', 'third', 'fifth'];
		var midiNotes;
		var voiceNotes = [];

		for (var i = 0; i < options.extraNotes.length && notes.length < voiceCount; i++) {
			notes.push(options.extraNotes[i]);
			roles.push('tension');
		}

		while (notes.length < voiceCount && notes.length > 0) {
			var duplicate = duplicateFactor(options.baseNotes, duplicatePreference[duplicateIndex % duplicatePreference.length], options.kind);
			notes.push(duplicate.note);
			roles.push(duplicate.role + '-doubling');
			duplicateIndex += 1;
		}

		notes = notes.slice(0, voiceCount);
		roles = roles.slice(0, voiceCount);
		midiNotes = notesToAscendingMidi(notes, options.initialMidiNote);

		for (var j = 0; j < notes.length; j++) {
			voiceNotes.push({
				midiNote: midiNotes[j],
				note: notes[j],
				role: roles[j]
			});
		}

		return {
			inversionIndex: options.inversionIndex,
			inversionLabel: options.inversionLabel,
			midiNotes: midiNotes,
			notes: notes,
			voiceNotes: voiceNotes
		};
	}

	function prepareBaseNotesForVoiceCount(baseNotes, kind, voiceCount, chordName) {
		var roles = factorRolesForKind(kind);
		var selectedNotes = [];
		var selectedRoles = [];
		var allowedRoles;

		if (kind !== 'seventh' || voiceCount !== 3 || baseNotes.length < 4) {
			return {
				notes: baseNotes.slice(),
				roles: roles
			};
		}

		allowedRoles = isDiminishedSeventhQuality(chordName) ?
			{ fifth: true, root: true, third: true } :
			{ root: true, seventh: true, third: true };

		for (var i = 0; i < baseNotes.length; i++) {
			if (allowedRoles[roles[i]]) {
				selectedNotes.push(baseNotes[i]);
				selectedRoles.push(roles[i]);
			}
		}

		return {
			notes: selectedNotes,
			roles: selectedRoles
		};
	}

	function fitVoicingToPrevious(voicing, previousPlan) {
		var fittedMidiNotes = [];
		var fittedVoiceNotes = [];
		var previousMidiNotes = previousPlan.midiNotes || [];

		for (var i = 0; i < voicing.midiNotes.length; i++) {
			var referenceNote = previousMidiNotes[Math.min(i, previousMidiNotes.length - 1)];
			var midiNote = referenceNote != null ? nearestMidiTo(referenceNote, voicing.midiNotes[i]) : voicing.midiNotes[i];

			if (i > 0) {
				while (midiNote <= fittedMidiNotes[i - 1]) {
					midiNote += 12;
				}
			}

			fittedMidiNotes.push(midiNote);
			fittedVoiceNotes.push(extendObject(voicing.voiceNotes[i], {
				midiNote: midiNote
			}));
		}

		return extendObject(voicing, {
			midiNotes: fittedMidiNotes,
			voiceNotes: fittedVoiceNotes
		});
	}

	function voiceLeadingTransitionScore(previousPlan, nextPlan) {
		return voiceLeadingScoreService.voiceLeadingTransitionScore(previousPlan, nextPlan);
	}

	function commonPitchNames(firstNotes, secondNotes) {
		return pitchService.commonPitchNames(firstNotes, secondNotes);
	}

	function countParallelPerfects(previousMidiNotes, nextMidiNotes, exteriorOnly) {
		return voiceLeadingScoreService.countParallelPerfects(previousMidiNotes, nextMidiNotes, exteriorOnly);
	}

	function firstVoicingScore(voicing) {
		return voiceLeadingScoreService.firstVoicingScore(voicing);
	}

	function notesToAscendingMidi(notes, initialMidiNote) {
		var result = [];
		var previousNote = null;

		for (var i = 0; i < notes.length; i++) {
			var midiNote = noteNameToMidi(notes[i], initialMidiNote);

			if (midiNote == null) {
				continue;
			}

			midiNote -= 12;

			while (previousNote != null && midiNote <= previousNote) {
				midiNote += 12;
			}

			result.push(midiNote);
			previousNote = midiNote;
		}

		return result;
	}

	function noteNameToMidi(noteName, initialMidiNote) {
		return pitchService.noteNameToMidi(noteName, initialMidiNote);
	}

	function noteIndex(noteName) {
		return pitchService.noteIndex(noteName);
	}

	function normalizePitchName(noteName) {
		return pitchService.normalizePitchName(noteName);
	}

	function nearestMidiTo(referenceNote, midiNote) {
		return pitchService.nearestMidiTo(referenceNote, midiNote);
	}

	function upperVoiceSpan(midiNotes) {
		return voicingDispositionService.upperVoiceSpan(midiNotes);
	}

	function rotate(values, startIndex) {
		var result = [];

		for (var i = 0; i < values.length; i++) {
			result.push(values[(startIndex + i) % values.length]);
		}

		return result;
	}

	function factorRolesForKind(kind) {
		return kind === 'seventh' ? ['root', 'third', 'fifth', 'seventh'] : ['root', 'third', 'fifth'];
	}

	function duplicateFactor(baseNotes, role, kind) {
		var roleIndex = {
			fifth: 2,
			root: 0,
			seventh: kind === 'seventh' ? 3 : 0,
			third: 1
		}[role];

		return {
			note: baseNotes[Math.min(roleIndex, baseNotes.length - 1)] || baseNotes[0],
			role: role
		};
	}

	function normalizeVoicingDisposition(value) {
		return value === 'open' ? 'open' : 'closed';
	}

	function clampInversionIndex(value, maxInversions) {
		var numericValue = parseInt(value, 10);

		if (isNaN(numericValue)) {
			return 0;
		}

		return Math.max(0, Math.min(maxInversions - 1, numericValue));
	}

	function isDiminishedSeventhQuality(chordName) {
		var suffix = chordQualitySuffix(chordName);
		var lowerSuffix = suffix.toLowerCase();

		return lowerSuffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0 || suffix.indexOf('7b5') >= 0;
	}

	function chordQualitySuffix(chordName) {
		return String(chordName || '')
			.replace(/^[A-G](#|b|♭)?/, '')
			.replace(/b5/g, '♭5');
	}

	function extendObject(source, values) {
		var result = {};

		for (var key in source) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				result[key] = source[key];
			}
		}

		for (var valueKey in values) {
			if (Object.prototype.hasOwnProperty.call(values, valueKey)) {
				result[valueKey] = values[valueKey];
			}
		}

		return result;
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionVoicing = {
		chooseVoicing: chooseVoicing,
		commonPitchNames: commonPitchNames,
		countParallelPerfects: countParallelPerfects,
		firstVoicingScore: firstVoicingScore,
		nearestMidiTo: nearestMidiTo,
		normalizePitchName: normalizePitchName,
		noteIndex: noteIndex,
		noteNameToMidi: noteNameToMidi,
		upperVoiceSpan: upperVoiceSpan,
		voiceLeadingTransitionScore: voiceLeadingTransitionScore
	};
})(window);
