// Facade for high-level progression section operations.
(function (global) {
	'use strict';

	var sectionContrast = global.CodaProgressionSectionContrast;
	var sectionDocument = global.CodaProgressionSectionDocument;
	var objectService = global.CodaProgressionObjects;
	var sectionRetarget = global.CodaProgressionSectionRetarget;

	function generateContrastingSection(options, dependencies) {
		return sectionContrast.generate(options || {}, dependencies || {});
	}

	function generateSection(options, dependencies) {
		return sectionContrast.generateSection(options || {}, dependencies || {});
	}

	function retargetSection(options, dependencies) {
		var progression = options && options.progression ? options.progression : null;
		var section = sectionDocument.findSection(progression, options && options.sectionId);
		var sectionState;
		var generated;

		if (!progression || !section || !options.targetReport || !dependencies || typeof dependencies.generateProgressionFromState !== 'function') {
			return progression;
		}

		sectionState = cloneJson(options.sectionState || section.state || options.progressionState || {});
		sectionState.bars = section.length || sectionState.bars || 8;
		generated = dependencies.generateProgressionFromState({
			data: options.data,
			domain: options.domain,
			progressionState: sectionState,
			report: options.targetReport,
			rng: options.rng
		});

		return sectionRetarget.replaceContext({
			generatedMeasures: generated && generated.measures ? generated.measures : [],
			progression: progression,
			sectionId: options.sectionId,
			sectionState: sectionState,
			targetReport: options.targetReport
		});
	}

	function cloneJson(value) {
		return objectService.cloneJson(value);
	}

	global.CodaProgressionSectionOperations = {
		generateContrastingSection: generateContrastingSection,
		generateSection: generateSection,
		retargetSection: retargetSection
	};
})(window);
