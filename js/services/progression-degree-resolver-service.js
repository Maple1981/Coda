// Resolves progression degree plans against scale and parallel chord catalogs.
(function (global) {
	'use strict';

	var objectService = global.CodaProgressionObjects;

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
				degrees[i].chord ?
					degrees[i].chord :
					degrees[i].source === 'parallel' && parallelChords[degrees[i].index] ?
						parallelChords[degrees[i].index] :
						scaleChords[degrees[i].index];

			resolved.push({
				cadentialRole: degrees[i].cadentialRole || '',
				chromaticRole: degrees[i].chromaticRole || '',
				chord: chord,
				degree: degrees[i].degreeDisplayName || (scaleNotes[degrees[i].index] ? scaleNotes[degrees[i].index].grado : ''),
				degreeDisplayName: degrees[i].degreeDisplayName || '',
				degreeIndex: degrees[i].index,
				forceInversionIndex: degrees[i].forceInversionIndex,
				forceKind: degrees[i].forceKind,
				modalRole: degrees[i].modalRole || '',
				preventSuspension: !!degrees[i].preventSuspension,
				preventTensions: !!degrees[i].preventTensions,
				source: source ? 'interchange' : degrees[i].source || 'diatonic',
				sourceId: source ? source.id : degrees[i].sourceId,
				sourceLabelKey: degrees[i].sourceLabelKey || '',
				sourceScaleIndex: source ? source.scaleIndex : degrees[i].sourceScaleIndex,
				sourceTonicName: source ? source.tonicName : '',
				tonalFunctionOverride: degrees[i].tonalFunctionOverride || ''
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
		return objectService.extendObject(target, values);
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
