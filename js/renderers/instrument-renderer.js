// Renderers for prepared instrument view models.
(function (global) {
	'use strict';

	function renderGuitar(options) {
		var html = '<h4>' + t(options, 'instrument.tuning') + ': ' + tuningLabel(options, options.tuning) + '&nbsp;';

		html += renderTuningSelect(options);
		html += '</h4>';
		html += '<div class="instrumentScaleViewport"><div class="instrumentScaleCanvas">';
		html += '<table class="diapason"><tbody>';

		for (var i = 0; i < options.strings.length; i++) {
			html += '<tr>';
			html += renderGuitarCell(options, options.strings[i].aire, options.strings[i].midiNote, options.strings[i].perteneceEscala, options.strings[i].tipo, options.scaleDefinition);

			for (var j = 0; j < options.strings[i].trastes.length; j++) {
				var fret = options.strings[i].trastes[j];
				html += renderGuitarCell(options, fret.nombre, fret.midiNote, fret.perteneceEscala, fret.tipo, options.scaleDefinition, true);
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
		html += '</div></div>';

		return html;
	}

	function renderTuningSelect(options) {
		var html = '<select id="selectorAfinaciones"><option value="-1">' + t(options, 'instrument.change') + '&nbsp;</option>';

		for (var i = 0; i < options.tunings.length; i++) {
			if (options.tunings[i].nombre !== options.tuning.nombre) {
				html += '<option value="' + i + '">' + tuningLabel(options, options.tunings[i], i) + '</option>';
			}
		}

		html += '</select>';

		return html;
	}

	function renderGuitarCell(options, noteName, midiNote, belongsToScale, modalType, scaleDefinition, addSpace) {
		var scaleClass = belongsToScale ? ' perteneceEscala' : ' noPerteneceEscala';
		var modalClass = modalSpanClass(modalType, scaleDefinition);
		var cellClass = addSpace ? 'celdaNota ' : 'celdaNota';
		var midiAttribute = midiNote != null ? ' data-midi-note="' + midiNote + '"' : '';

		return '<td class="' + cellClass + scaleClass + '"><span data-note-name="' + noteName + '"' + midiAttribute + modalClass + '>' + formatNote(options, noteName) + '</span></td>';
	}

	function renderPiano(options) {
		var html = '<h4>' + t(options, 'instrument.pianoView') + '</h4>';

		html += '<div class="instrumentScaleViewport"><div class="instrumentScaleCanvas">';
		html += '<div class="teclado">';
		html += renderBlackKeys(options);
		html += renderWhiteKeys(options);
		html += '</div>';
		html += '</div></div>';

		return html;
	}

	function renderBlackKeys(options) {
		var html = '<table class="teclasNegras"><tbody><tr>';

		for (var i = 0; i < options.keyboard.blackKeys.length; i++) {
			var key = options.keyboard.blackKeys[i];

			if (key.type === 'note') {
				html += renderPianoNoteCell(options, key.nombre, key.midiNote, key.perteneceEscala, key.tipo, options.scaleDefinition);
			} else {
				html += '<td class="huecoBlanco hueco' + key.nombre + '"><span>&nbsp;&nbsp;</span></td>';
			}
		}

		html += '</tr></table>';

		return html;
	}

	function renderWhiteKeys(options) {
		var html = '<table class="teclasBlancas"><tbody><tr>';

		for (var i = 0; i < options.keyboard.whiteKeys.length; i++) {
			var key = options.keyboard.whiteKeys[i];
			html += renderPianoNoteCell(options, key.nombre, key.midiNote, key.perteneceEscala, key.tipo, options.scaleDefinition, true);
		}

		html += '</tr></table>';

		return html;
	}

	function renderPianoNoteCell(options, noteName, midiNote, belongsToScale, modalType, scaleDefinition, addSpace) {
		var scaleClass = belongsToScale ? ' perteneceEscala' : ' noPerteneceEscala';
		var modalClass = modalSpanClass(modalType, scaleDefinition);
		var cellClass = addSpace ? 'celdaNota ' : 'celdaNota';
		var midiAttribute = midiNote != null ? ' data-midi-note="' + midiNote + '"' : '';

		return '<td class="' + cellClass + scaleClass + '"><span data-note-name="' + noteName + '"' + midiAttribute + modalClass + '>' + formatNote(options, noteName) + '</span></td>';
	}

	function modalSpanClass(modalType, scaleDefinition) {
		if (scaleDefinition.modal && modalType !== '') {
			return ' class="' + modalType + '"';
		}

		return '';
	}

	function t(options, key) {
		if (options.i18n) {
			return options.i18n.t(key);
		}

		var fallback = {
			'instrument.change': 'Cambiar',
			'instrument.pianoView': 'Vista de piano',
			'instrument.tuning': 'Afinación'
		};

		return fallback[key] || key;
	}

	function tuningLabel(options, tuning, index) {
		var label = tuning.nombre;

		if (options.i18n && options.tunings) {
			var tuningIndex = index;

			if (tuningIndex == null) {
				tuningIndex = options.tunings.indexOf(tuning);
			}

			if (tuningIndex > -1) {
				label = options.i18n.dataLabel('tunings', tuningIndex, tuning.nombre);
			}
		}

		if (options.notation) {
			return options.notation.formatTextNotes(label, options.notationStyle);
		}

		return label;
	}

	function formatNote(options, noteName) {
		if (options.notation) {
			return options.notation.formatNoteName(noteName, options.notationStyle);
		}

		return noteName;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.instruments = {
		renderBlackKeys: renderBlackKeys,
		renderGuitar: renderGuitar,
		renderPiano: renderPiano,
		renderTuningSelect: renderTuningSelect,
		tuningLabel: tuningLabel,
		renderWhiteKeys: renderWhiteKeys
	};
})(window);
