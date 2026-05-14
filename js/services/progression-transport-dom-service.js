// DOM helpers for progression transport interactions.
(function (global) {
	'use strict';

	function closest(target, selector) {
		return target && typeof target.closest === 'function' ? target.closest(selector) : null;
	}

	function chordIndex(chordElement) {
		var index = chordElement ? parseInt(chordElement.getAttribute('data-measure-chord-index'), 10) : 0;

		return isNaN(index) ? 0 : index;
	}

	function measureIndex(measure) {
		var index = parseInt(measure.getAttribute('data-progression-index'), 10);

		return isNaN(index) ? 0 : index;
	}

	function dragSourceIndex(event, fallbackIndex) {
		var dataIndex = event && event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
		var numericIndex = parseInt(dataIndex, 10);

		return isNaN(numericIndex) ? fallbackIndex : numericIndex;
	}

	function preventDefault(event) {
		if (typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
	}

	function setDropEffect(event) {
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	global.CodaProgressionTransportDom = {
		chordIndex: chordIndex,
		closest: closest,
		dragSourceIndex: dragSourceIndex,
		measureIndex: measureIndex,
		preventDefault: preventDefault,
		setDropEffect: setDropEffect
	};
})(window);
