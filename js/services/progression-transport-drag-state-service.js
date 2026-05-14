// Mutable drag state for progression transport interactions.
(function (global) {
	'use strict';

	function create() {
		var draggedMeasureIndex = null;
		var draggedMeasureChord = null;

		function setMeasureIndex(value) {
			draggedMeasureIndex = value;
			draggedMeasureChord = null;
		}

		function setMeasureChord(measureIndex, chordIndex) {
			draggedMeasureChord = {
				chordIndex: chordIndex,
				measureIndex: measureIndex
			};
			draggedMeasureIndex = null;
		}

		function clear() {
			draggedMeasureIndex = null;
			draggedMeasureChord = null;
		}

		return {
			clear: clear,
			measureChord: function () {
				return draggedMeasureChord;
			},
			measureIndex: function () {
				return draggedMeasureIndex;
			},
			setMeasureChord: setMeasureChord,
			setMeasureIndex: setMeasureIndex
		};
	}

	global.CodaProgressionTransportDragState = {
		create: create
	};
})(window);
