// Voice-leading annotations and pedal links between progression measures.
(function (global) {
	'use strict';

	var voicingService = global.CodaProgressionVoicing;

	function annotateMeasures(measures, progressionState) {
		for (var i = 0; i < measures.length; i++) {
			var previousMeasure = measures[i - 1] || null;
			var nextMeasure = measures[i + 1] || null;

			measures[i].pedalsIn = measures[i].pedalsIn || [];
			measures[i].pedalsOut = measures[i].pedalsOut || [];
			measures[i].voiceLeading = {
				commonTones: previousMeasure ? commonVoiceLinks(previousMeasure, measures[i]).length : 0,
				exteriorParallelPerfects: previousMeasure ? voicingService.countParallelPerfects(previousMeasure.midiNotes, measures[i].midiNotes, true) : 0,
				parallelPerfects: previousMeasure ? voicingService.countParallelPerfects(previousMeasure.midiNotes, measures[i].midiNotes, false) : 0,
				score: previousMeasure ? voicingService.voiceLeadingTransitionScore(previousMeasure, measures[i]) : voicingService.firstVoicingScore(measures[i])
			};

			if (nextMeasure) {
				createPedalsBetween(measures[i], nextMeasure, progressionState);
			}
		}

		return measures;
	}

	function createPedalsBetween(currentMeasure, nextMeasure, progressionState) {
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
		var result = {};
		var key;

		for (key in target) {
			if (Object.prototype.hasOwnProperty.call(target, key)) {
				result[key] = target[key];
			}
		}

		for (key in values) {
			if (Object.prototype.hasOwnProperty.call(values, key)) {
				result[key] = values[key];
			}
		}

		return result;
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionVoiceLeading = {
		annotateMeasures: annotateMeasures,
		commonVoiceLinks: commonVoiceLinks,
		midiNotesFromVoiceNotes: midiNotesFromVoiceNotes
	};
})(window);
