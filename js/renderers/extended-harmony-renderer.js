// Renderer for extended harmony tables. It receives already-computed scale
// context and delegates musical decisions to the domain layer.
(function (global) {
	'use strict';

	function render(options) {
		var html = '';

		html += '<h3>' + t(options, 'extended.title', {
			scale: scaleLabel(options),
			tonic: formatNote(options, options.tonicName)
		}) + '</h3>';
		html += '<div id="acordeonArmoniaExtendida">';

		html += renderSection({
			title: t(options, 'extended.secondaryDominants'),
			rows: [
				{ rules: options.data.extendedHarmony.secondaryDominants, chordTypeName: 'Dominante', rootSemitoneOffset: 7 },
				{ rules: options.data.extendedHarmony.secondaryDominants, chordTypeName: 'semidisminuido', rootSemitoneOffset: 11 },
				{ rules: options.data.extendedHarmony.secondaryDominants, chordTypeName: 'disminuído', rootSemitoneOffset: 11 }
			],
			options: options
		});

		html += renderSection({
			title: t(options, 'extended.secondarySubdominants'),
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
			title: t(options, 'extended.tritoneSubstitutes'),
			rows: [
				{ rules: options.data.extendedHarmony.tritoneSubstitutes, chordTypeName: 'Dominante', rootSemitoneOffset: 6 }
			],
			options: options
		});

		html += renderSection({
			title: t(options, 'extended.relativeMinorSeconds'),
			rows: [
				{ rules: options.data.extendedHarmony.relativeMinorSeconds, chordTypeName: 'menor séptima', rootSemitoneOffset: 2 },
				{ rules: options.data.extendedHarmony.relativeMinorSeconds, chordTypeName: 'semidisminuido', rootSemitoneOffset: 2 }
			],
			options: options
		});

		html += '</div>';
		html += '<p class="leyenda"><span class="cadencial">' + t(options, 'extended.colorLegend') + '</span></p>';

		return html;
	}

	function renderSection(section) {
		var html = '';

		html += '<h3>' + section.title + '</h3><div>';
		html += '<table>';
		html += renderHeader(section.options);
		html += '<tbody>';

		for (var i = 0; i < section.rows.length; i++) {
			html += renderRow(section.rows[i], section.options);
		}

		html += '<tbody>';
		html += '</table>';
		html += '</div>';

		return html;
	}

	function renderHeader(options) {
		var html = '';

		html += '<thead><tr>';
		for (var i = 0; i <= options.scaleChords.length - 1; i++) {
			html += '<td class="cabecera">';
			html += formatChord(options, options.scaleChords[i].nombre);
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
				html += '<p>' + formatChord(options, extendedChord.rootName + extendedChord.abbreviation) + ' (' + extendedChord.ruleName + ')</p>';

				var frequencyClass = '';
				if (extendedChord.important) {
					frequencyClass = ' cadencial';
				}

				html += '<p class="destacado' + frequencyClass + '">' + formatNoteSequence(options, extendedChord.noteId) + '</p>';
				html += '</td>';
			} else {
				html += '<td>-</td>';
			}
		}
		html += '</tr>';

		return html;
	}

	function t(options, key, values) {
		if (options.i18n) {
			return options.i18n.t(key, values);
		}

		var fallback = {
			'extended.colorLegend': 'Color: acorde más frecuente',
			'extended.relativeMinorSeconds': 'II menor relativo (SD)',
			'extended.secondaryDominants': 'Dominantes secundarios (D)',
			'extended.secondarySubdominants': 'Subdominantes secundarios (SD)',
			'extended.title': 'Armonía extendida de {tonic} {scale}',
			'extended.tritoneSubstitutes': 'Tritonos sustitutos (D)'
		};
		var text = fallback[key] || key;

		if (!values) {
			return text;
		}

		return text.replace(/\{([^}]+)\}/g, function (match, name) {
			return values[name] != null ? values[name] : match;
		});
	}

	function scaleLabel(options) {
		if (options.i18n && options.scaleIndex != null) {
			return options.i18n.dataLabel('scales', options.scaleIndex, options.scaleName);
		}

		return options.scaleName;
	}

	function formatNote(options, noteName) {
		if (options.notation) {
			return options.notation.formatNoteName(noteName, options.notationStyle);
		}

		return noteName;
	}

	function formatChord(options, chordName) {
		if (options.notation) {
			return options.notation.formatChordName(chordName, options.notationStyle);
		}

		return chordName;
	}

	function formatNoteSequence(options, noteSequence) {
		if (options.notation) {
			return options.notation.formatNoteSequence(noteSequence, options.notationStyle);
		}

		return noteSequence;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.extendedHarmony = {
		render: render,
		renderHeader: renderHeader,
		renderRow: renderRow,
		renderSection: renderSection
	};
})(window);
