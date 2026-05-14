// Event handlers for progression drag and drop interactions.
(function (global) {
	'use strict';

	var dragDom = global.CodaProgressionTransportDom;
	var dragClasses = global.CodaProgressionTransportDragClasses;
	var dragData = global.CodaProgressionTransportDragData;
	var dragTargets = global.CodaProgressionTransportDragTargets;

	function create(options, state, clearDragState) {
		options = options || {};

		return {
			dragend: clearDragState,
			dragleave: function (event) {
				var target = dragTargets.fromEvent(event);

				dragClasses.unmarkChordDropTarget(target.chordElement);
				dragClasses.unmarkMeasureDropTarget(target.measure);
			},
			dragover: function (event) {
				var target = dragTargets.fromEvent(event);

				if (!target.measure) {
					return;
				}

				if (state.measureChord()) {
					if (!dragTargets.canDropChord(state, target)) {
						return;
					}

					dragDom.preventDefault(event);
					dragClasses.markChordDropTarget(target.chordElement);
					dragDom.setDropEffect(event);
					return;
				}

				dragDom.preventDefault(event);
				dragClasses.markMeasureDropTarget(target.measure);
				dragDom.setDropEffect(event);
			},
			dragstart: function (event) {
				var target = dragTargets.fromEvent(event);
				var sourceMeasureIndex;
				var sourceChordIndex;

				if (dragTargets.isBlockedDragStart(event, target)) {
					return;
				}

				if (dragTargets.canStartChordDrag(target)) {
					sourceMeasureIndex = measureIndex(target.measure);
					sourceChordIndex = chordIndex(target.chordElement);
					state.setMeasureChord(sourceMeasureIndex, sourceChordIndex);
					dragClasses.markChordDragging(target.chordElement);
					dragData.setChordDragData(event, sourceMeasureIndex, sourceChordIndex);
					return;
				}

				state.setMeasureIndex(measureIndex(target.measure));
				dragClasses.markMeasureDragging(target.measure);
				dragData.setMeasureDragData(event, state.measureIndex());
			},
			drop: function (event) {
				var target = dragTargets.fromEvent(event);
				var fromIndex = dragSourceIndex(event, state.measureIndex());
				var targetChordIndex;
				var sourceChordDrag;

				if (!target.measure) {
					return;
				}

				if (state.measureChord()) {
					sourceChordDrag = state.measureChord();
					targetChordIndex = chordIndex(target.chordElement);
					if (!dragTargets.canDropChord(state, target)) {
						clearDragState();
						return;
					}

					dragDom.preventDefault(event);
					clearDragState();
					dragData.run(options.onMeasureChordDrop, sourceChordDrag.measureIndex, sourceChordDrag.chordIndex, targetChordIndex);
					return;
				}

				dragDom.preventDefault(event);
				clearDragState();
				dragData.run(options.onMeasureDrop, fromIndex, measureIndex(target.measure));
			}
		};
	}

	function dragSourceIndex(event, fallbackIndex) {
		return dragTargets.dragSourceIndex(event, fallbackIndex);
	}

	function measureIndex(measure) {
		return dragTargets.measureIndex(measure);
	}

	function chordIndex(chordElement) {
		return dragTargets.chordIndex(chordElement);
	}

	global.CodaProgressionTransportDragHandlers = {
		chordIndex: chordIndex,
		create: create,
		dragSourceIndex: dragSourceIndex,
		measureIndex: measureIndex
	};
})(window);
