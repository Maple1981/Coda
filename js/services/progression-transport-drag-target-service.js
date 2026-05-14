// Target resolution and validation for progression drag and drop.
(function (global) {
	'use strict';

	var dragDom = global.CodaProgressionTransportDom;

	function fromEvent(event) {
		return {
			chordElement: dragDom.closest(event.target, '.measureChord'),
			chordHandle: dragDom.closest(event.target, '.measureChordDragHandle'),
			measure: dragDom.closest(event.target, '.measure')
		};
	}

	function isBlockedDragStart(event, target) {
		return !target.measure ||
			dragDom.closest(event.target, '.measureSplitButton') ||
			dragDom.closest(event.target, '.measureChordMenuButton');
	}

	function canStartChordDrag(target) {
		return target.chordHandle && chordIndex(target.chordElement) > 0;
	}

	function canDropChord(state, target) {
		var sourceChordDrag = state.measureChord();
		var targetChordIndex = chordIndex(target.chordElement);

		return sourceChordDrag &&
			target.measure &&
			measureIndex(target.measure) === sourceChordDrag.measureIndex &&
			targetChordIndex > 0;
	}

	function dragSourceIndex(event, fallbackIndex) {
		return dragDom.dragSourceIndex(event, fallbackIndex);
	}

	function measureIndex(measure) {
		return dragDom.measureIndex(measure);
	}

	function chordIndex(chordElement) {
		return dragDom.chordIndex(chordElement);
	}

	global.CodaProgressionTransportDragTargets = {
		canDropChord: canDropChord,
		canStartChordDrag: canStartChordDrag,
		chordIndex: chordIndex,
		dragSourceIndex: dragSourceIndex,
		fromEvent: fromEvent,
		isBlockedDragStart: isBlockedDragStart,
		measureIndex: measureIndex
	};
})(window);
