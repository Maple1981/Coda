// Renderer for the scale chord table. It formats HTML only; chord and scale
// construction stay in the domain layer.
(function (global) {
	'use strict';

	function render(options) {
		var scaleChords = options.scaleChords || [];

		if (scaleChords.length === 0) {
			return undefined;
		}

		var rows = buildRows(options);
		var html = '<h4>Acordes de la tonalidad</h4>';

		html += '<table class="acordesEscala">';
		html += '<thead><tr><td>Grados</td>' + rows.degrees + '</tr></thead>';
		html += '<tbody><tr><td class="cabecera">Triada</td>' + rows.triads + '</tr>';
		html += '<tr><td class="cabecera">Cuatriada</td>' + rows.seventhChords + '</tr>';
		html += '<tr><td class="cabecera">Sus2</td>' + rows.sus2 + '</tr>';
		html += '<tr><td class="cabecera">Sus4</td>' + rows.sus4 + '</tr>';

		if (rows.functions !== '' && options.mode !== '') {
			if (rows.parallelSeventhChords !== '') {
				html += '<tr><td class="cabecera">Paralela</td>' + rows.parallelSeventhChords + '</tr>';
			}
			if (rows.parallelSeventhChords !== '') {
				html += '<tr><td class="cabecera">Paralela</td>' + rows.parallelTriads + '</tr>';
			}
			html += '<tr><td class="cabecera">Función: </td>' + rows.functions + '</tr>';
		}

		html += '<tr><td class="cabecera">Notas</td>' + rows.notes + '</tr>';
		html += '</tbody></table>';

		if (rows.functions !== '') {
			html += '<p class="leyenda"><strong>T</strong>: tónica, <strong>SD</strong>: subdominante, <strong>D</strong>: dominante</p>';
		}

		if (options.scaleDefinition.modal === 'true') {
			html += '<div class="leyendaAcordesModales">';
			html += '<span class="cadencial">Acorde cadencial</span> - ';
			html += '<span class="evitar">Acorde a evitar</span>';
			html += '</div>';
		}

		return html;
	}

	function buildRows(options) {
		var rows = {
			degrees: '',
			triads: '',
			seventhChords: '',
			sus2: '',
			sus4: '',
			parallelSeventhChords: '',
			parallelTriads: '',
			notes: '',
			functions: ''
		};
		var functions = options.scaleDefinition.funciones ? options.scaleDefinition.funciones.split('-') : [];

		for (var i = 0; i < options.scaleChords.length; i++) {
			var chord = options.scaleChords[i];
			var parallelChord = options.parallelScaleChords[i];

			rows.degrees += '<td>';
			rows.degrees += formatDegreeForChord(options.scaleNotes[i].grado, chord.nombre);
			rows.degrees += '</td>';

			rows.triads += '<td class="celdaAcorde" id="' + chord.fundamental + '-' + chord.tercera + '-' + chord.quinta + '">';
			rows.triads += triadName(chord.nombre);
			rows.triads += '</td>';

			rows.seventhChords += '<td class="celdaAcorde" id="' + chord.fundamental + '-' + chord.tercera + '-' + chord.quinta + '-' + chord.septima + '">';
			rows.seventhChords += chord.nombre;
			rows.seventhChords += '</td>';

			rows.sus2 += '<td class="celdaAcorde" id="' + chord.fundamental + '-' + chord.segunda + '-' + chord.quinta + '">';
			rows.sus2 += suspendedName(chord.nombre, 'sus2');
			rows.sus2 += '</td>';

			rows.sus4 += '<td class="celdaAcorde" id="' + chord.fundamental + '-' + chord.cuarta + '-' + chord.quinta + '">';
			rows.sus4 += suspendedName(chord.nombre, 'sus4');
			rows.sus4 += '</td>';

			if (options.scaleDefinition.funciones != null && parallelChord != null) {
				rows.parallelSeventhChords += '<td class="celdaAcorde" id="' + parallelChord.fundamental + '-' + parallelChord.tercera + '-' + parallelChord.quinta + '-' + parallelChord.septima + '">';
				rows.parallelSeventhChords += parallelChord.nombre;
				rows.parallelSeventhChords += '</td>';

				rows.parallelTriads += '<td class="celdaAcorde" id="' + parallelChord.fundamental + '-' + parallelChord.tercera + '-' + parallelChord.quinta + '">';
				rows.parallelTriads += triadName(parallelChord.nombre);
				rows.parallelTriads += '</td>';
			}

			rows.notes += '<td class="par">';
			if (options.scaleDefinition.modal === 'true' && chord.tipo !== '') {
				rows.notes += '<span class="' + chord.tipo + '">';
			}

			rows.notes += chord.fundamental + '-' + chord.tercera + '-' + chord.quinta + '-' + chord.septima;

			if (options.scaleDefinition.modal === 'true' && chord.tipo != null) {
				rows.notes += '</span>';
			}
			rows.notes += '</td>';

			if (options.scaleDefinition.funciones != null) {
				rows.functions += '<td>';
				rows.functions += functions[i];
				rows.functions += '</td>';
			}
		}

		return rows;
	}

	function triadName(chordName) {
		return chordName.replace('maj7', '').replace('m7♭5', 'dim').replace('m7', 'm').replace('7', '');
	}

	function suspendedName(chordName, suspension) {
		var name = chordName
			.replace('maj7', suspension)
			.replace('Maj7', suspension)
			.replace('m7♭5', suspension)
			.replace('dim7', suspension === 'sus4' ? 'sus2' : suspension)
			.replace('m7', suspension)
			.replace('7', '');

		if (chordName.length === 2) {
			name += suspension;
		}

		return name;
	}

	function formatDegreeForChord(degree, chordName) {
		var transformedDegree = '';
		var cleanDegree = degree.replace('J', '').replace('M', '').replace('m', '');

		if (chordName.indexOf('mmaj7') >= 0) {
			transformedDegree = cleanDegree.toLowerCase();
		} else if (chordName.indexOf('maj7') >= 0) {
			transformedDegree = cleanDegree.toUpperCase();
		} else if (chordName.indexOf('m') >= 0) {
			transformedDegree = cleanDegree.toLowerCase();
		} else {
			transformedDegree = cleanDegree.toUpperCase();
		}

		transformedDegree += chordName.replace('b', '').replace('#', '').substring(1, chordName.length);

		if (transformedDegree.indexOf('m7') >= 0 && transformedDegree.indexOf('dim7') === -1) {
			transformedDegree = transformedDegree.replace('m', '');
		}

		return transformedDegree;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.scaleChords = {
		buildRows: buildRows,
		formatDegreeForChord: formatDegreeForChord,
		render: render
	};
})(window);
