// Renderer for the circle-of-fifths navigation.
(function (global) {
	'use strict';

	function render(viewModel) {
		if (!viewModel) {
			return '';
		}

		var html = '<div id="circuloDesplegado">';
		var positions = buildPositions(viewModel.orderedKeys.length, 80, 80, 200);

		for (var i = 0; i < viewModel.orderedKeys.length; i++) {
			html += renderCircleItem(viewModel.orderedKeys[i], viewModel.selectedKey, positions[i], i);
		}

		html += '</div>';

		return html;
	}

	function buildPositions(count, radiusX, radiusY, containerHeight) {
		var positions = [];
		var fragments = 360 / count;
		var center = containerHeight / 2;
		var itemOffset = 20;

		for (var i = 0; i < count; i++) {
			var theta = (Math.PI / 2) - ((fragments / 180) * i * Math.PI);
			var posX = Math.round(radiusX * Math.cos(theta));
			var posY = Math.round(radiusY * Math.sin(theta));

			positions.push({
				left: center + posX - itemOffset,
				top: center - posY - itemOffset
			});
		}

		return positions;
	}

	function renderCircleItem(key, selectedKey, position, index) {
		var isActual = isSelectedKey(key, selectedKey);
		var circleClass = isActual ? ' actual' : '';
		var actualClass = isActual ? ' class="actual"' : '';
		var html = '';

		html += '<div class="circulo numero' + index + circleClass + '" style="top: ' + position.top + 'px; left: ' + position.left + 'px;">';
		html += '<p' + actualClass + '><span id="' + key.nombre + '_" class="revamp estiloEnlace">' + key.nombre + '</span></p>';
		html += '<p' + actualClass + '><span id="' + key.enarmonica.replace('m', '') + '_m" class="revamp estiloEnlace">' + key.enarmonica + '</span></p>';
		html += '</div>';

		return html;
	}

	function isSelectedKey(key, selectedKey) {
		return key.nombre === selectedKey || key.enarmonica === selectedKey || key.aka === selectedKey || isEnharmonicKeyName(key.nombre, selectedKey);
	}

	function isEnharmonicKeyName(keyName, selectedKey) {
		var enharmonicKeys = {
			'Gb': 'F#',
			'Db': 'C#',
			'Ab': 'G#',
			'Eb': 'D#',
			'Bb': 'A#',
			'Cb': 'B'
		};

		return enharmonicKeys[keyName] === selectedKey;
	}

	global.CodaRenderers = global.CodaRenderers || {};
	global.CodaRenderers.circleOfFifths = {
		buildPositions: buildPositions,
		isEnharmonicKeyName: isEnharmonicKeyName,
		isSelectedKey: isSelectedKey,
		render: render,
		renderCircleItem: renderCircleItem
	};
})(window);
