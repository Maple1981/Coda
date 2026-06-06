// Pedal-note links between adjacent progression measures.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;
	var voicingService = global.CodaProgressionVoicing;

	function createBetween(currentMeasure, nextMeasure, progressionState) {
		progressionState = progressionState || {};

		var links = commonVoiceLinks(currentMeasure, nextMeasure);
		var sustainedPedalInstrument = prefersSustainedCommonTones(progressionState);
		var maxPedals = sustainedPedalInstrument ? 3 : (numberOrDefault(progressionState.counterpoint, 0) >= 70 ? 2 : 1);
		var pedalProbability = sustainedPedalInstrument ? 1 : 0.16 +
			Math.max(0, numberOrDefault(progressionState.counterpoint, 0) - 20) / 180 +
			Math.max(0, links.length - 1) * 0.12;
		var selectedLinks = links.slice(0, Math.min(maxPedals, links.length));

		if (!selectedLinks.length || pedalProbability < 0.25) {
			return;
		}

		nextMeasure.pedalsIn = nextMeasure.pedalsIn || [];
		nextMeasure.pedalsOut = nextMeasure.pedalsOut || [];

		for (var i = 0; i < selectedLinks.length; i++) {
			var link = selectedLinks[i];
			var pedal = {
				durationSeconds: nextMeasure.durationSeconds,
				fromBar: currentMeasure.bar,
				midiNote: link.midiNote,
				note: link.note,
				toBar: nextMeasure.bar
			};

			extendIncomingPedal(currentMeasure, link.midiNote, nextMeasure.durationSeconds);
			alignPedalVoice(nextMeasure, link);
			currentMeasure.pedalsOut.push(pedal);
			nextMeasure.pedalsIn.push(pedal);
		}

		nextMeasure.midiNotes = midiNotesFromVoiceNotes(nextMeasure.voiceNotes);
	}

	function extendIncomingPedal(measure, midiNote, durationSeconds) {
		var extension = Number(durationSeconds) || 0;

		if (!extension || !measure || !measure.pedalsIn || !measure.pedalsIn.length) {
			return;
		}

		for (var i = 0; i < measure.pedalsIn.length; i++) {
			if (Number(measure.pedalsIn[i].midiNote) === Number(midiNote)) {
				measure.pedalsIn[i].durationSeconds = (Number(measure.pedalsIn[i].durationSeconds) || 0) + extension;
			}
		}
	}

	function alignPedalVoice(measure, link) {
		for (var i = 0; i < measure.voiceNotes.length; i++) {
			if (Number(measure.voiceNotes[i].midiNote) === Number(link.midiNote)) {
				measure.voiceNotes[i] = extendObject(measure.voiceNotes[i], {
					midiNote: link.midiNote,
					role: measure.voiceNotes[i].role + '-pedal'
				});
				return;
			}
		}
	}

	function commonVoiceLinks(firstMeasure, secondMeasure) {
		var links = [];
		var usedSecondVoices = {};

		for (var i = 0; i < (firstMeasure.voiceNotes || []).length; i++) {
			for (var j = 0; j < (secondMeasure.voiceNotes || []).length; j++) {
				if (usedSecondVoices[j] || !isExactCommonVoice(firstMeasure.voiceNotes[i], secondMeasure.voiceNotes[j])) {
					continue;
				}

				links.push({
					firstVoiceIndex: i,
					midiNote: firstMeasure.voiceNotes[i].midiNote,
					note: firstMeasure.voiceNotes[i].note,
					secondVoiceIndex: j
				});
				usedSecondVoices[j] = true;
				break;
			}
		}

		return links.sort(function (a, b) {
			return Math.abs(a.firstVoiceIndex - a.secondVoiceIndex) - Math.abs(b.firstVoiceIndex - b.secondVoiceIndex);
		});
	}

	function isExactCommonVoice(firstVoice, secondVoice) {
		return Number(firstVoice && firstVoice.midiNote) === Number(secondVoice && secondVoice.midiNote) &&
			voicingService.normalizePitchName(firstVoice && firstVoice.note) === voicingService.normalizePitchName(secondVoice && secondVoice.note);
	}

	function midiNotesFromVoiceNotes(voiceNotes) {
		var result = [];

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			result.push(voiceNotes[i].midiNote);
		}

		return result;
	}

	function prefersSustainedCommonTones(progressionState) {
		var instrument = progressionState && progressionState.midiInstrument;

		return isSustainArticulation(progressionState) && (
			instrument === 'drawbar_organ' ||
			instrument === 'string_ensemble_1' ||
			instrument === 'pad_2_warm'
		);
	}

	function isSustainArticulation(progressionState) {
		var articulation = progressionState && progressionState.articulation;

		return !articulation || articulation === 'sustain';
	}

	function extendObject(target, values) {
		return objectService.extendObject(target, values);
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionPedalLinks = {
		commonVoiceLinks: commonVoiceLinks,
		createBetween: createBetween,
		prefersSustainedCommonTones: prefersSustainedCommonTones,
		midiNotesFromVoiceNotes: midiNotesFromVoiceNotes
	};
})(window);
