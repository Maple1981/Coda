// Voice-leading annotations for progression measures.
(function (global) {
	'use strict';

	var pedalLinkService = global.CodaProgressionPedalLinks;
	var voicingService = global.CodaProgressionVoicing;

	function annotateMeasures(measures, progressionState) {
		clearPedals(measures);

		for (var i = 0; i < measures.length; i++) {
			var previousMeasure = measures[i - 1] || null;
			var commonLinks = previousMeasure ? pedalLinkService.commonVoiceLinks(previousMeasure, measures[i]) : [];

			measures[i].voiceLeading = {
				commonTones: commonLinks.length,
				exteriorParallelPerfects: previousMeasure ? voicingService.countParallelPerfects(previousMeasure.midiNotes, measures[i].midiNotes, true) : 0,
				parallelPerfects: previousMeasure ? voicingService.countParallelPerfects(previousMeasure.midiNotes, measures[i].midiNotes, false) : 0,
				score: previousMeasure ? voicingService.voiceLeadingTransitionScore(previousMeasure, measures[i]) : voicingService.firstVoicingScore(measures[i])
			};
		}

		annotatePedalTimeline(measures, progressionState);

		return measures;
	}

	function annotatePedalTimeline(measures, progressionState) {
		var timeline = segmentTimeline(measures);

		for (var i = 0; i < timeline.length - 1; i++) {
			pedalLinkService.createBetween(timeline[i], timeline[i + 1], progressionState);
		}
	}

	function segmentTimeline(measures) {
		var timeline = [];

		for (var i = 0; i < (measures || []).length; i++) {
			if (measures[i].chords && measures[i].chords.length) {
				for (var j = 0; j < measures[i].chords.length; j++) {
					timeline.push(measures[i].chords[j]);
				}
			} else {
				timeline.push(measures[i]);
			}
		}

		return timeline;
	}

	function clearPedals(measures) {
		for (var i = 0; i < (measures || []).length; i++) {
			measures[i].pedalsIn = [];
			measures[i].pedalsOut = [];

			for (var j = 0; j < ((measures[i] && measures[i].chords) || []).length; j++) {
				measures[i].chords[j].pedalsIn = [];
				measures[i].chords[j].pedalsOut = [];
			}
		}

	}

	global.CodaProgressionVoiceLeading = {
		annotateMeasures: annotateMeasures,
		commonVoiceLinks: pedalLinkService.commonVoiceLinks,
		midiNotesFromVoiceNotes: pedalLinkService.midiNotesFromVoiceNotes,
		segmentTimeline: segmentTimeline
	};
})(window);
