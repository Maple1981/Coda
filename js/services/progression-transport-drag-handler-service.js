// Event handlers for progression drag and drop interactions.
(function (global) {
	'use strict';

	var dragDom = global.CodaProgressionTransportDom;
	var dragClasses = global.CodaProgressionTransportDragClasses;

	function create(options, state, clearDragState) {
		options = options || {};

		return {
			dragend: clearDragState,
			dragleave: function (event) {
				var measure = dragDom.closest(event.target, '.measure');
				var chordElement = dragDom.closest(event.target, '.measureChord');

				dragClasses.unmarkChordDropTarget(chordElement);
				dragClasses.unmarkMeasureDropTarget(measure);
			},
			dragover: function (event) {
				var measure = dragDom.closest(event.target, '.measure');
				var chordElement = dragDom.closest(event.target, '.measureChord');
				var targetChordIndex;

				if (!measure) {
					return;
				}

				if (state.measureChord()) {
					targetChordIndex = chordIndex(chordElement);
					if (measureIndex(measure) !== state.measureChord().measureIndex || targetChordIndex <= 0) {
						return;
					}

					dragDom.preventDefault(event);
					dragClasses.markChordDropTarget(chordElement);
					dragDom.setDropEffect(event);
					return;
				}

				dragDom.preventDefault(event);
				dragClasses.markMeasureDropTarget(measure);
				dragDom.setDropEffect(event);
			},
			dragstart: function (event) {
				var measure = dragDom.closest(event.target, '.measure');
				var chordHandle = dragDom.closest(event.target, '.measureChordDragHandle');
				var chordElement = dragDom.closest(event.target, '.measureChord');
				var sourceMeasureIndex;
				var sourceChordIndex;

				if (!measure || dragDom.closest(event.target, '.measureSplitButton') || dragDom.closest(event.target, '.measureChordMenuButton')) {
					return;
				}

				if (chordHandle) {
					sourceMeasureIndex = measureIndex(measure);
					sourceChordIndex = chordIndex(chordElement);
					if (sourceChordIndex <= 0) {
						return;
					}

					state.setMeasureChord(sourceMeasureIndex, sourceChordIndex);
					dragClasses.markChordDragging(chordElement);
					setChordDragData(event, sourceMeasureIndex, sourceChordIndex);
					return;
				}

				state.setMeasureIndex(measureIndex(measure));
				dragClasses.markMeasureDragging(measure);
				setMeasureDragData(event, state.measureIndex());
			},
			drop: function (event) {
				var measure = dragDom.closest(event.target, '.measure');
				var chordElement = dragDom.closest(event.target, '.measureChord');
				var fromIndex = dragSourceIndex(event, state.measureIndex());
				var targetChordIndex;
				var sourceChordDrag;

				if (!measure) {
					return;
				}

				if (state.measureChord()) {
					sourceChordDrag = state.measureChord();
					targetChordIndex = chordIndex(chordElement);
					if (measureIndex(measure) !== sourceChordDrag.measureIndex || targetChordIndex <= 0) {
						clearDragState();
						return;
					}

					dragDom.preventDefault(event);
					clearDragState();
					run(options.onMeasureChordDrop, sourceChordDrag.measureIndex, sourceChordDrag.chordIndex, targetChordIndex);
					return;
				}

				dragDom.preventDefault(event);
				clearDragState();
				run(options.onMeasureDrop, fromIndex, measureIndex(measure));
			}
		};
	}

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

	function dragSourceIndex(event, fallbackIndex) {
		return dragDom.dragSourceIndex(event, fallbackIndex);
	}

	function measureIndex(measure) {
		return dragDom.measureIndex(measure);
	}

	function chordIndex(chordElement) {
		return dragDom.chordIndex(chordElement);
	}

	global.CodaProgressionTransportDragHandlers = {
		chordIndex: chordIndex,
		create: create,
		dragSourceIndex: dragSourceIndex,
		measureIndex: measureIndex
	};
})(window);
