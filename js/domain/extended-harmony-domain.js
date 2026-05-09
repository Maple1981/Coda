// Extended harmony rules: secondary dominants, subdominants, tritone substitutes, and relative ii chords.
(function (global) {
	'use strict';

	var utils = global.CodaMusicUtils;
	var chordDomain = global.CodaChordDomain;

	function cleanDegreeForExtendedHarmony(degree) {
		return degree.replace('J', '').replace('m', '').replace('sus', '').replace('rel', '').toLowerCase();
	}

	function findExtendedHarmonyRule(rules, degree, chordTypeName, mode) {
		var normalizedDegree = cleanDegreeForExtendedHarmony(degree);

		for (var i = 0; i < rules.length; i++) {
			var ruleParts = rules[i].nombre.toLowerCase().split('-');

			if (normalizedDegree === ruleParts[1] && chordTypeName === rules[i].tipo) {
				if (mode === 'M' || rules[i].menor === true) {
					return rules[i];
				}
			}
		}
	}

	function buildExtendedHarmonyChord(options) {
		var rule = findExtendedHarmonyRule(
			options.extensionRules,
			options.targetDegree,
			options.chordTypeName,
			options.mode
		);

		if (!rule) {
			return;
		}

		var scaleChordRootIndex = utils.noteIndex(options.notes, options.scaleChord.fundamental);

		if (scaleChordRootIndex < 0) {
			return;
		}

		var extendedRootIndex = utils.circularChromaticIndex(
			scaleChordRootIndex,
			options.rootSemitoneOffset,
			options.octaveSemitones
		);

		var chord = chordDomain.buildChordFromRoot({
			rootIndex: extendedRootIndex,
			chordTypeName: rule.tipo,
			chordDefinitions: options.chordDefinitions,
			notes: options.notes,
			preferFlats: options.preferFlats,
			octaveSemitones: options.octaveSemitones
		});

		if (!chord) {
			return;
		}

		return {
			ruleName: rule.nombre,
			chordTypeName: rule.tipo,
			rootName: chord.rootName,
			abbreviation: chord.abbreviation,
			notes: chord.notes,
			noteId: chord.notes.join('-'),
			important: rule.importante === true
		};
	}

	global.CodaExtendedHarmonyDomain = {
		buildExtendedHarmonyChord: buildExtendedHarmonyChord,
		cleanDegreeForExtendedHarmony: cleanDegreeForExtendedHarmony,
		findExtendedHarmonyRule: findExtendedHarmonyRule
	};
})(window);
