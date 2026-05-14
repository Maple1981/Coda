// Builds chord replacement variants for the progression chord menu.
(function (global) {
	'use strict';

	function chordReplacementOptions(chord, scaleNote, degreeIndex, formatting) {
		var degree = scaleNote ? scaleNote.grado : '';
		var triadLabels = ['', '6', '6/4'];
		var seventhLabels = ['', '6/5', '4/3', '4/2'];
		var options = [];

		pushOptions(options, {
			chord: chord,
			degree: degree,
			degreeIndex: degreeIndex,
			formatting: formatting,
			kind: 'triad',
			labels: triadLabels
		});
		pushOptions(options, {
			chord: chord,
			degree: degree,
			degreeIndex: degreeIndex,
			formatting: formatting,
			kind: 'seventh',
			labels: seventhLabels
		});

		return options;
	}

	function pushOptions(options, config) {
		for (var i = 0; i < config.labels.length; i++) {
			options.push(buildOption(config, i));
		}
	}

	function buildOption(config, inversionIndex) {
		var inversionLabel = config.labels[inversionIndex];
		var formattedDegree = config.kind === 'seventh' ?
			config.formatting.formatDegreeForChord(config.degree, config.chord.nombre) :
			config.formatting.formatTriadDegreeForChord(config.degree, config.chord.nombre);
		var chordName = config.kind === 'seventh' ? config.chord.nombre : config.formatting.triadName(config.chord);

		return {
			degree: config.formatting.displayDegree(formattedDegree, inversionLabel, ''),
			degreeIndex: config.degreeIndex,
			displayName: config.formatting.displayName(chordName, inversionLabel, '', ''),
			inversionIndex: inversionIndex,
			inversionLabel: inversionLabel,
			kind: config.kind
		};
	}

	function chordNotes(chord) {
		if (!chord) {
			return [];
		}

		return [chord.fundamental, chord.tercera, chord.quinta, chord.septima];
	}

	global.CodaProgressionChordMenuOptions = {
		chordNotes: chordNotes,
		chordReplacementOptions: chordReplacementOptions
	};
})(window);
