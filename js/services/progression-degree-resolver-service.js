// Resolves progression degree plans against scale and parallel chord catalogs.
(function (global) {
	'use strict';

	function fromDegreeNames(options) {
		var resolvedDegrees = options.domain.resolveProgressionDegrees({
			degrees: options.degrees,
			scaleChords: options.report.scaleChords,
			scaleNotes: options.report.scaleNotes
		});

		return attachDegreeIndexes(resolvedDegrees, options.report.scaleNotes);
	}

	function fromGeneratedPlan(options) {
		var resolved = [];
		var degrees = options.degrees || [];
		var scaleNotes = options.report.scaleNotes || [];
		var scaleChords = options.report.scaleChords || [];
		var parallelChords = options.report.parallelScaleChords || [];
		var interchangeSources = options.report.modalInterchangeSources || [];

		for (var i = 0; i < degrees.length; i++) {
			var source = interchangeSourceForDegree(interchangeSources, degrees[i]);
			var chord = source && source.scaleChords && source.scaleChords[degrees[i].index] ?
				source.scaleChords[degrees[i].index] :
				degrees[i].source === 'parallel' && parallelChords[degrees[i].index] ?
					parallelChords[degrees[i].index] :
					scaleChords[degrees[i].index];

			resolved.push({
				chord: chord,
				degree: scaleNotes[degrees[i].index] ? scaleNotes[degrees[i].index].grado : '',
				degreeIndex: degrees[i].index,
				source: source ? 'interchange' : degrees[i].source || 'diatonic',
				sourceId: source ? source.id : degrees[i].sourceId,
				sourceScaleIndex: source ? source.scaleIndex : degrees[i].sourceScaleIndex,
				sourceTonicName: source ? source.tonicName : ''
			});
		}

		return resolved;
	}

	function interchangeSourceForDegree(sources, degree) {
		if (!degree || degree.source !== 'interchange') {
			return null;
		}

		for (var i = 0; i < sources.length; i++) {
			if (sources[i].id === degree.sourceId || Number(sources[i].scaleIndex) === Number(degree.sourceScaleIndex)) {
				return sources[i];
			}
		}

		return null;
	}

	function attachDegreeIndexes(resolvedDegrees, scaleNotes) {
		var result = [];

		for (var i = 0; i < resolvedDegrees.length; i++) {
			result.push(extendObject(resolvedDegrees[i], {
				degreeIndex: resolvedDegrees[i].degreeIndex != null ? resolvedDegrees[i].degreeIndex : degreeIndexForDegree(scaleNotes, resolvedDegrees[i].degree)
			}));
		}

		return result;
	}

	function degreeIndexForDegree(scaleNotes, degree) {
		var normalizedDegree = normalizeDegreeName(degree);

		scaleNotes = scaleNotes || [];
		for (var i = 0; i < scaleNotes.length; i++) {
			if (normalizeDegreeName(scaleNotes[i].grado) === normalizedDegree) {
				return i;
			}
		}

		return -1;
	}

	function normalizeDegreeName(degree) {
		return String(degree || '').replace('J', '').replace('M', '').replace('m', '').toUpperCase();
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

	global.CodaProgressionDegreeResolver = {
		attachDegreeIndexes: attachDegreeIndexes,
		degreeIndexForDegree: degreeIndexForDegree,
		fromDegreeNames: fromDegreeNames,
		fromGeneratedPlan: fromGeneratedPlan,
		interchangeSourceForDegree: interchangeSourceForDegree,
		normalizeDegreeName: normalizeDegreeName
	};
})(window);
