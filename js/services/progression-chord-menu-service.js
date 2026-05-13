// Construcción del menú de sustitución de acordes para el visualizador de progresiones.
(function (global) {
	'use strict';

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
			var commonToneCount = currentSegment ? voicing.commonPitchNames(currentSegment, { notes: chordNotes(scaleChords[j]) }).length : 0;

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
		var degree = scaleNote ? scaleNote.grado : '';
		var triadLabels = ['', '6', '6/4'];
		var seventhLabels = ['', '6/5', '4/3', '4/2'];
		var options = [];

		for (var i = 0; i < triadLabels.length; i++) {
			options.push({
				degree: formatting.displayDegree(formatting.formatTriadDegreeForChord(degree, chord.nombre), triadLabels[i], ''),
				degreeIndex: degreeIndex,
				displayName: formatting.displayName(formatting.triadName(chord), triadLabels[i], '', ''),
				inversionIndex: i,
				inversionLabel: triadLabels[i],
				kind: 'triad'
			});
		}

		for (var j = 0; j < seventhLabels.length; j++) {
			options.push({
				degree: formatting.displayDegree(formatting.formatDegreeForChord(degree, chord.nombre), seventhLabels[j], ''),
				degreeIndex: degreeIndex,
				displayName: formatting.displayName(chord.nombre, seventhLabels[j], '', ''),
				inversionIndex: j,
				inversionLabel: seventhLabels[j],
				kind: 'seventh'
			});
		}

		return options;
	}

	function tonalFunctionForDegree(scaleDefinition, degreeIndex) {
		var functions;
		var tonalFunction;

		if (!scaleDefinition || scaleDefinition.tonal !== 'true' || !scaleDefinition.funciones || degreeIndex < 0) {
			return '';
		}

		functions = scaleDefinition.funciones.split('-');
		tonalFunction = functions[degreeIndex] || '';

		return tonalFunction === '—' || tonalFunction === 'â€”' ? '' : tonalFunction;
	}

	function chordNotes(chord) {
		if (!chord) {
			return [];
		}

		return [chord.fundamental, chord.tercera, chord.quinta, chord.septima];
	}

	global.CodaProgressionChordMenu = {
		build: build,
		chordReplacementOptions: chordReplacementOptions
	};
})(window);
