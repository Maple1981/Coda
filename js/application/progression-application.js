// Application use cases for harmonic progressions.
(function (global) {
	'use strict';

	function buildProgressionFromDegrees(options) {
		return options.domain.resolveProgressionDegrees({
			degrees: options.degrees,
			scaleChords: options.report.scaleChords,
			scaleNotes: options.report.scaleNotes
		});
	}

	global.CodaApplication = global.CodaApplication || {};
	global.CodaApplication.buildProgressionFromDegrees = buildProgressionFromDegrees;
})(window);
