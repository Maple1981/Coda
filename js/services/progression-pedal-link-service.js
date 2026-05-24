// Pedal-note links between adjacent progression measures.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;
	var voicingService = global.CodaProgressionVoicing;

	function createBetween(currentMeasure, nextMeasure, progressionState) {
		var links = commonVoiceLinks(currentMeasure, nextMeasure);
		var maxPedals = numberOrDefault(progressionState.counterpoint, 0) >= 70 ? 2 : 1;
		var pedalProbability = 0.16 +
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

			alignPedalVoice(nextMeasure, link);
			currentMeasure.pedalsOut.push(pedal);
			nextMeasure.pedalsIn.push(pedal);
		}

		nextMeasure.midiNotes = midiNotesFromVoiceNotes(nextMeasure.voiceNotes);
	}

	function alignPedalVoice(measure, link) {
		for (var i = 0; i < measure.voiceNotes.length; i++) {
			if (voicingService.normalizePitchName(measure.voiceNotes[i].note) === voicingService.normalizePitchName(link.note)) {
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
				if (usedSecondVoices[j] || voicingService.normalizePitchName(firstMeasure.voiceNotes[i].note) !== voicingService.normalizePitchName(secondMeasure.voiceNotes[j].note)) {
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

	function midiNotesFromVoiceNotes(voiceNotes) {
		var result = [];

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			result.push(voiceNotes[i].midiNote);
		}

		return result;
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
		midiNotesFromVoiceNotes: midiNotesFromVoiceNotes
	};
})(window);
