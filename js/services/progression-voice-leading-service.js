// Voice-leading annotations for progression measures.
(function (global) {
	'use strict';

	var pedalLinkService = global.CodaProgressionPedalLinks;
	var voicingService = global.CodaProgressionVoicing;

	function annotateMeasures(measures, progressionState) {
		for (var i = 0; i < measures.length; i++) {
			var previousMeasure = measures[i - 1] || null;
			var nextMeasure = measures[i + 1] || null;
			var commonLinks = previousMeasure ? pedalLinkService.commonVoiceLinks(previousMeasure, measures[i]) : [];

			measures[i].pedalsIn = measures[i].pedalsIn || [];
			measures[i].pedalsOut = measures[i].pedalsOut || [];
			measures[i].voiceLeading = {
				commonTones: commonLinks.length,
				exteriorParallelPerfects: previousMeasure ? voicingService.countParallelPerfects(previousMeasure.midiNotes, measures[i].midiNotes, true) : 0,
				parallelPerfects: previousMeasure ? voicingService.countParallelPerfects(previousMeasure.midiNotes, measures[i].midiNotes, false) : 0,
				score: previousMeasure ? voicingService.voiceLeadingTransitionScore(previousMeasure, measures[i]) : voicingService.firstVoicingScore(measures[i])
			};

			if (nextMeasure) {
				pedalLinkService.createBetween(measures[i], nextMeasure, progressionState);
			}
		}

		return measures;
	}

	global.CodaProgressionVoiceLeading = {
		annotateMeasures: annotateMeasures,
		commonVoiceLinks: pedalLinkService.commonVoiceLinks,
		midiNotesFromVoiceNotes: pedalLinkService.midiNotesFromVoiceNotes
	};
})(window);
