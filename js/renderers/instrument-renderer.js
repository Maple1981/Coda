// Renderers for prepared instrument view models.
(function (global) {
	'use strict';

	function renderGuitar(options) {
		var html = '<h4>' + t(options, 'instrument.tuning') + ': ' + tuningLabel(options, options.tuning) + '&nbsp;';

		html += renderTuningSelect(options);
		html += '</h4>';
		html += '<div class="instrumentScaleViewport"><div class="instrumentScaleCanvas instrumentScaleCanvas--scroll">';
		html += '<table class="diapason fretboard"><tbody>';

		for (var i = 0; i < options.strings.length; i++) {
			html += '<tr class="guitarString" data-string-index="' + i + '">';
			html += renderGuitarCell(options, options.strings[i].aire, options.strings[i].midiNote, options.strings[i].perteneceEscala, options.strings[i].tipo, options.scaleDefinition, 0);

			for (var j = 0; j < options.strings[i].trastes.length; j++) {
				var fret = options.strings[i].trastes[j];
				html += renderGuitarCell(options, fret.nombre, fret.midiNote, fret.perteneceEscala, fret.tipo, options.scaleDefinition, j + 1);
			}

			html += '</tr>';
		}

		html += '</tbody>';
		html += '<tfoot><tr>';

		for (var k = 0; k < options.strings[0].trastes.length + 1; k++) {
			html += '<td class="fretNumber' + markerClass(k) + '"><span>' + k + '</span></td>';
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

	function renderGuitarCell(options, noteName, midiNote, belongsToScale, modalType, scaleDefinition, fretNumber) {
		var scaleClass = belongsToScale ? ' perteneceEscala' : ' noPerteneceEscala';
		var modalClass = modalSpanClass(modalType, scaleDefinition);
		var fretClass = Number(fretNumber) === 0 ? ' guitarOpenString' : ' guitarFret';
		var cellClass = 'celdaNota guitarNoteCell' + fretClass + markerClass(fretNumber);
		var midiAttribute = midiNote != null ? ' data-midi-note="' + midiNote + '"' : '';

		return '<td class="' + cellClass + scaleClass + '"><span data-note-name="' + noteName + '"' + midiAttribute + modalClass + '>' + formatNote(options, noteName) + '</span></td>';
	}

	function renderPiano(options) {
		var html = '<h4>' + t(options, 'instrument.pianoView') + '</h4>';

		html += '<div class="instrumentScaleViewport"><div class="instrumentScaleCanvas instrumentScaleCanvas--scroll">';
		html += '<div class="teclado pianoKeyboard" style="--white-key-count:' + whiteKeyCount(options.keyboard) + '">';
		html += renderWhiteKeys(options);
		html += renderBlackKeys(options);
		html += '</div>';
		html += '</div></div>';

		return html;
	}

	function renderBlackKeys(options) {
		var keys = pianoKeys(options.keyboard);
		var whiteCount = whiteKeyCount(options.keyboard);
		var whiteIndex = 0;
		var html = '<div class="teclasNegras pianoBlackKeys">';

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];

			if (key.type === 'white' || key.type === 'note') {
				whiteIndex += 1;
			} else if (key.type === 'black') {
				html += renderPianoNoteCell(options, key.nombre, key.midiNote, key.perteneceEscala, key.tipo, options.scaleDefinition, 'black', blackKeyStyle(whiteIndex, whiteCount));
			}
		}

		html += '</div>';

		return html;
	}

	function renderWhiteKeys(options) {
		var keys = pianoKeys(options.keyboard);
		var html = '<div class="teclasBlancas pianoWhiteKeys">';

		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];

			if (key.type === 'white' || key.type === 'note') {
				html += renderPianoNoteCell(options, key.nombre, key.midiNote, key.perteneceEscala, key.tipo, options.scaleDefinition, 'white');
			}
		}

		html += '</div>';

		return html;
	}

	function renderPianoNoteCell(options, noteName, midiNote, belongsToScale, modalType, scaleDefinition, keyType, style) {
		var scaleClass = belongsToScale ? ' perteneceEscala' : ' noPerteneceEscala';
		var modalClass = modalSpanClass(modalType, scaleDefinition);
		var cellClass = 'celdaNota pianoKey piano' + capitalize(keyType || 'white') + 'Key';
		var midiAttribute = midiNote != null ? ' data-midi-note="' + midiNote + '"' : '';
		var styleAttribute = style ? ' style="' + style + '"' : '';

		return '<div class="' + cellClass + scaleClass + '"' + styleAttribute + '><span data-note-name="' + noteName + '"' + midiAttribute + modalClass + '>' + formatNote(options, noteName) + '</span></div>';
	}

	function pianoKeys(keyboard) {
		if (keyboard && keyboard.allKeys && keyboard.allKeys.length) {
			return keyboard.allKeys;
		}

		return (keyboard && keyboard.whiteKeys) || [];
	}

	function whiteKeyCount(keyboard) {
		var keys = pianoKeys(keyboard);
		var count = 0;

		for (var i = 0; i < keys.length; i++) {
			if (keys[i].type === 'white' || keys[i].type === 'note') {
				count += 1;
			}
		}

		return count || 1;
	}

	function blackKeyStyle(whiteIndex, whiteCount) {
		var left = ((whiteIndex - 0.32) / whiteCount) * 100;

		return '--key-left:' + left.toFixed(4) + '%';
	}

	function markerClass(fretNumber) {
		var number = Number(fretNumber);

		if ([3, 5, 7, 9, 15, 17, 19, 21].indexOf(number) > -1) {
			return ' fretMarker';
		}
		if (number === 12 || number === 24) {
			return ' fretMarker fretMarkerDouble';
		}

		return '';
	}

	function capitalize(value) {
		value = String(value || '');

		return value.charAt(0).toUpperCase() + value.slice(1);
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
