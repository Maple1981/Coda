// Renderer for extended harmony tables. It receives already-computed scale
// context and delegates musical decisions to the domain layer.
(function (global) {
	'use strict';

	function render(options) {
		var html = '';

		html += '<h3>Armonía extendida de ' + options.tonicName + ' ' + options.scaleName + '</h3>';
		html += '<div id="acordeonArmoniaExtendida">';

		html += renderSection({
			title: 'Dominantes secundarios (D)',
			rows: [
				{ rules: options.data.extendedHarmony.secondaryDominants, chordTypeName: 'Dominante', rootSemitoneOffset: 7 },
				{ rules: options.data.extendedHarmony.secondaryDominants, chordTypeName: 'semidisminuido', rootSemitoneOffset: 11 },
				{ rules: options.data.extendedHarmony.secondaryDominants, chordTypeName: 'disminuído', rootSemitoneOffset: 11 }
			],
			options: options
		});

		html += renderSection({
			title: 'Subdominantes secundarios (SD)',
			rows: [
				{ rules: options.data.extendedHarmony.secondarySubdominants, chordTypeName: 'Mayor séptima', rootSemitoneOffset: 5 },
				{ rules: options.data.extendedHarmony.secondarySubdominants, chordTypeName: 'menor séptima', rootSemitoneOffset: 2 },
				{ rules: options.data.extendedHarmony.secondarySubdominants, chordTypeName: 'menor séptima', rootSemitoneOffset: 5 },
				{ rules: options.data.extendedHarmony.secondarySubdominants, chordTypeName: 'semidisminuido', rootSemitoneOffset: 2 },
				{ rules: options.data.extendedHarmony.secondarySubdominants, chordTypeName: 'Dominante', rootSemitoneOffset: 5 }
			],
			options: options
		});

		html += renderSection({
			title: 'Tritonos sustitutos (D)',
			rows: [
				{ rules: options.data.extendedHarmony.tritoneSubstitutes, chordTypeName: 'Dominante', rootSemitoneOffset: 6 }
			],
			options: options
		});

		html += renderSection({
			title: 'II menor relativo (SD)',
			rows: [
				{ rules: options.data.extendedHarmony.relativeMinorSeconds, chordTypeName: 'menor séptima', rootSemitoneOffset: 2 },
				{ rules: options.data.extendedHarmony.relativeMinorSeconds, chordTypeName: 'semidisminuido', rootSemitoneOffset: 2 }
			],
			options: options
		});

		html += '</div>';
		html += '<p class="leyenda"><span class="cadencial">Color:</span> acorde más frecuente</h4>';

		return html;
	}

	function renderSection(section) {
		var html = '';

		html += '<h3>' + section.title + '</h3><div>';
		html += '<table>';
		html += renderHeader(section.options.scaleChords);
		html += '<tbody>';

		for (var i = 0; i < section.rows.length; i++) {
			html += renderRow(section.rows[i], section.options);
		}

		html += '<tbody>';
		html += '</table>';
		html += '</div>';

		return html;
	}

	function renderHeader(scaleChords) {
		var html = '';

		html += '<thead><tr>';
		for (var i = 0; i <= scaleChords.length - 1; i++) {
			html += '<td class="cabecera">';
			html += scaleChords[i].nombre;
			html += '</td>';
		}
		html += '</tr></thead>';

		return html;
	}

	function renderRow(row, options) {
		var html = '';

		html += '<tr>';
		for (var i = 0; i <= options.scaleChords.length - 1; i++) {
			var extendedChord = options.domain.buildExtendedHarmonyChord({
				extensionRules: row.rules,
				targetDegree: options.scaleNotes[i].grado,
				chordTypeName: row.chordTypeName,
				rootSemitoneOffset: row.rootSemitoneOffset,
				scaleChord: options.scaleChords[i],
				notes: options.data.notes,
				chordDefinitions: options.data.chords,
				mode: options.mode,
				preferFlats: options.preferFlats,
				octaveSemitones: options.data.constants.octaveSemitones
			});

			if (extendedChord) {
				html += '<td class="celdaAcorde" id="' + extendedChord.noteId + '">';
				html += '<p>' + extendedChord.rootName + extendedChord.abbreviation + ' (' + extendedChord.ruleName + ')</p>';

				var frequencyClass = '';
				if (extendedChord.important) {
					frequencyClass = ' cadencial';
				}

				html += '<p class="destacado' + frequencyClass + '">' + extendedChord.noteId + '</p>';
				html += '</td>';
			} else {
				html += '<td>-</td>';
			}
		}
		html += '</tr>';

		return html;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.extendedHarmony = {
		render: render,
		renderHeader: renderHeader,
		renderRow: renderRow,
		renderSection: renderSection
	};
})(window);
