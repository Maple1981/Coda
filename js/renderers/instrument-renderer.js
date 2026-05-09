// Renderers for instrument views. They format the guitar fretboard and piano
// keyboard HTML; the app still owns when each view is selected.
(function (global) {
	'use strict';

	function renderGuitar(options) {
		var html = '<h4>Afinación: ' + options.tuning.nombre + '&nbsp;';

		html += renderTuningSelect(options);
		html += '</h4>';
		html += '<table class="diapason"><tbody>';

		for (var i = 0; i < options.strings.length; i++) {
			html += '<tr>';
			html += renderGuitarCell(options.strings[i].aire, options.strings[i].perteneceEscala, options.strings[i].tipo, options.scaleDefinition);

			for (var j = 0; j < options.strings[i].trastes.length; j++) {
				var fret = options.strings[i].trastes[j];
				html += renderGuitarCell(fret.nombre, fret.perteneceEscala, fret.tipo, options.scaleDefinition, true);
			}

			html += '</tr>';
		}

		html += '</tbody>';
		html += '<tfoot><tr>';

		for (var k = 0; k < options.strings[0].trastes.length + 1; k++) {
			html += '<td><span>' + k + '</span></td>';
		}

		html += '</tr></tfoot>';
		html += '</table>';

		return html;
	}

	function renderTuningSelect(options) {
		var html = '<select id="selectorAfinaciones"><option value="-1">Cambiar&nbsp;</option>';

		for (var i = 0; i < options.tunings.length; i++) {
			if (options.tunings[i].nombre !== options.tuning.nombre) {
				html += '<option value="' + i + '">' + options.tunings[i].nombre + '</option>';
			}
		}

		html += '</select>';

		return html;
	}

	function renderGuitarCell(noteName, belongsToScale, modalType, scaleDefinition, addSpace) {
		var scaleClass = belongsToScale ? ' perteneceEscala' : ' noPerteneceEscala';
		var modalClass = modalSpanClass(modalType, scaleDefinition);
		var cellClass = addSpace ? 'celdaNota ' : 'celdaNota';

		return '<td class="' + cellClass + scaleClass + '"><span' + modalClass + '>' + noteName + '</span></td>';
	}

	function renderPiano(options) {
		var html = '<h4>Vista de piano</h4>';

		html += '<div class="teclado">';
		html += renderBlackKeys(options);
		html += renderWhiteKeys(options);
		html += '</div>';

		return html;
	}

	function renderBlackKeys(options) {
		var html = '<table class="teclasNegras"><tbody><tr>';

		for (var i = 0; i < options.octaveCount; i++) {
			for (var j = 0; j < options.notes.length; j++) {
				var note = options.notes[j];

				if (note.enarmonica != null) {
					var state = findScaleNoteState(note, options, true);
					var noteName = options.preferFlats ? note.enarmonica : note.nombre;

					html += renderPianoNoteCell(noteName, state.belongsToScale, state.modalType, options.scaleDefinition);
				} else {
					html += '<td class="huecoBlanco hueco' + note.nombre + '"><span>&nbsp;&nbsp;</span></td>';
				}
			}
		}

		html += '</tr></table>';

		return html;
	}

	function renderWhiteKeys(options) {
		var html = '<table class="teclasBlancas"><tbody><tr>';

		for (var i = 0; i < options.octaveCount; i++) {
			for (var j = 0; j < options.notes.length; j++) {
				var note = options.notes[j];

				if (note.enarmonica == null) {
					var state = findScaleNoteState(note, options, false);
					html += renderPianoNoteCell(note.nombre, state.belongsToScale, state.modalType, options.scaleDefinition, true);
				}
			}
		}

		html += '</tr></table>';

		return html;
	}

	function renderPianoNoteCell(noteName, belongsToScale, modalType, scaleDefinition, addSpace) {
		var scaleClass = belongsToScale ? ' perteneceEscala' : ' noPerteneceEscala';
		var modalClass = modalSpanClass(modalType, scaleDefinition);
		var cellClass = addSpace ? 'celdaNota ' : 'celdaNota';

		return '<td class="' + cellClass + scaleClass + '"><span' + modalClass + '>' + noteName + '</span></td>';
	}

	function findScaleNoteState(note, options, includeEnharmonic) {
		for (var key in options.scaleNotes) {
			var scaleNote = options.scaleNotes[key];
			var matchesName = scaleNote.nombre === note.nombre;
			var matchesEnharmonic = includeEnharmonic && note.enarmonica != null && scaleNote.nombre === note.enarmonica;

			if (matchesName || matchesEnharmonic) {
				if (!options.isDegreeSuppressed(key)) {
					return {
						belongsToScale: true,
						modalType: scaleNote.tipo || ''
					};
				}
			}
		}

		return {
			belongsToScale: false,
			modalType: ''
		};
	}

	function modalSpanClass(modalType, scaleDefinition) {
		if (scaleDefinition.modal && modalType !== '') {
			return ' class="' + modalType + '"';
		}

		return '';
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.instruments = {
		findScaleNoteState: findScaleNoteState,
		renderBlackKeys: renderBlackKeys,
		renderGuitar: renderGuitar,
		renderPiano: renderPiano,
		renderTuningSelect: renderTuningSelect,
		renderWhiteKeys: renderWhiteKeys
	};
})(window);
