// Construcción del menú de sustitución de acordes para el visualizador de progresiones.
(function (global) {
	'use strict';

	var menuOptions = global.CodaProgressionChordMenuOptions;
	var tonalFunctionService = global.CodaProgressionTonalFunction;

	function build(options) {
		var report = options && options.report ? options.report : {};
		var scaleChords = report.scaleChords || [];
		var scaleNotes = report.scaleNotes || [];
		var currentSegment = options ? options.currentSegment : null;
		var currentFunction = currentSegment ? currentSegment.tonalFunction || '' : '';
		var formatting = options.formatting || global.CodaProgressionFormatting;
		var voicing = options.voicing || global.CodaProgressionVoicing;
		var groups = [
			{ id: 'sameFunction', items: [] },
			{ id: 'commonNotes', items: [] },
			{ id: 'remaining', items: [] }
		];
		var usedIndexes = {};

		function pushToGroup(groupIndex, degreeIndex, metadata) {
			var chord = scaleChords[degreeIndex];
			var rawDegree = scaleNotes[degreeIndex] ? scaleNotes[degreeIndex].grado : '';

			if (!chord || usedIndexes[degreeIndex]) {
				return;
			}

			groups[groupIndex].items.push({
				chordName: chord.nombre,
				commonToneCount: metadata && metadata.commonToneCount ? metadata.commonToneCount : 0,
				degree: formatting.formatDegreeForChord(rawDegree, chord.nombre),
				degreeIndex: degreeIndex,
				options: chordReplacementOptions(chord, scaleNotes[degreeIndex], degreeIndex, formatting)
			});
			usedIndexes[degreeIndex] = true;
		}

		for (var i = 0; i < scaleChords.length; i++) {
			if (currentFunction && tonalFunctionForDegree(report.scaleDefinition, i) === currentFunction) {
				pushToGroup(0, i);
			}
		}

		for (var j = 0; j < scaleChords.length; j++) {
			var commonToneCount = currentSegment ? voicing.commonPitchNames(currentSegment, { notes: menuOptions.chordNotes(scaleChords[j]) }).length : 0;

			if (commonToneCount > 0) {
				pushToGroup(1, j, {
					commonToneCount: commonToneCount
				});
			}
		}

		groups[1].items.sort(function (a, b) {
			if (a.commonToneCount !== b.commonToneCount) {
				return b.commonToneCount - a.commonToneCount;
			}

			return a.degreeIndex - b.degreeIndex;
		});

		for (var k = 0; k < scaleChords.length; k++) {
			pushToGroup(2, k);
		}

		return groups;
	}

	function chordReplacementOptions(chord, scaleNote, degreeIndex, formatting) {
		return menuOptions.chordReplacementOptions(chord, scaleNote, degreeIndex, formatting);
	}

	function tonalFunctionForDegree(scaleDefinition, degreeIndex) {
		return tonalFunctionService.forDegree(scaleDefinition, degreeIndex);
	}

	global.CodaProgressionChordMenu = {
		build: build,
		chordReplacementOptions: chordReplacementOptions
	};
})(window);
