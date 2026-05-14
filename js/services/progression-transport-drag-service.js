// Encapsulates drag and drop wiring for progression measures and measure chords.
(function (global) {
	'use strict';

	var dragClasses = global.CodaProgressionTransportDragClasses;
	var dragHandlers = global.CodaProgressionTransportDragHandlers;
	var dragState = global.CodaProgressionTransportDragState;

	function initialize(options) {
		options = options || {};

		var root = options.root;
		var state = dragState.create();
		var handlers;

		if (!root || typeof root.addEventListener !== 'function') {
			return null;
		}

		handlers = dragHandlers.create(options, state, clearDragState);

		root.addEventListener('dragstart', handlers.dragstart);
		root.addEventListener('dragover', handlers.dragover);
		root.addEventListener('dragleave', handlers.dragleave);
		root.addEventListener('drop', handlers.drop);
		root.addEventListener('dragend', handlers.dragend);

		function clearDragState() {
			state.clear();
			dragClasses.clear(global.document);
		}

		return {
			clear: clearDragState
		};
	}

	function dragSourceIndex(event, fallbackIndex) {
		return dragHandlers.dragSourceIndex(event, fallbackIndex);
	}

	function measureIndex(measure) {
		return dragHandlers.measureIndex(measure);
	}

	function chordIndex(chordElement) {
		return dragHandlers.chordIndex(chordElement);
	}

	global.CodaProgressionTransportDrag = {
		chordIndex: chordIndex,
		dragSourceIndex: dragSourceIndex,
		initialize: initialize,
		measureIndex: measureIndex
	};
})(window);
