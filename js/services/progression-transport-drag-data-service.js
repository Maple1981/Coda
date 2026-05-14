// DataTransfer helpers for progression drag and drop.
(function (global) {
	'use strict';

	function setChordDragData(event, measureIndexValue, chordIndexValue) {
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/coda-progression-chord', measureIndexValue + ':' + chordIndexValue);
			event.dataTransfer.setData('text/plain', measureIndexValue + ':' + chordIndexValue);
		}
	}

	function setMeasureDragData(event, measureIndexValue) {
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', String(measureIndexValue));
		}
	}

	function run(callback, value, secondValue, thirdValue) {
		if (typeof callback === 'function') {
			callback(value, secondValue, thirdValue);
		}
	}

	global.CodaProgressionTransportDragData = {
		run: run,
		setChordDragData: setChordDragData,
		setMeasureDragData: setMeasureDragData
	};
})(window);
