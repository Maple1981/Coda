// Visual class helpers for progression drag and drop state.
(function (global) {
	'use strict';

	function clear(documentRef) {
		if (!documentRef || typeof documentRef.querySelectorAll !== 'function') {
			return;
		}

		Array.prototype.forEach.call(documentRef.querySelectorAll('.measure.isDragging, .measure.isDropTarget'), function (measure) {
			measure.classList.remove('isDragging');
			measure.classList.remove('isDropTarget');
		});
		Array.prototype.forEach.call(documentRef.querySelectorAll('.measureChord.isDragging, .measureChord.isChordDropTarget'), function (chord) {
			chord.classList.remove('isDragging');
			chord.classList.remove('isChordDropTarget');
		});
	}

	function markChordDragging(chordElement) {
		addClass(chordElement, 'isDragging');
	}

	function markChordDropTarget(chordElement) {
		addClass(chordElement, 'isChordDropTarget');
	}

	function markMeasureDragging(measure) {
		addClass(measure, 'isDragging');
	}

	function markMeasureDropTarget(measure) {
		addClass(measure, 'isDropTarget');
	}

	function unmarkChordDropTarget(chordElement) {
		removeClass(chordElement, 'isChordDropTarget');
	}

	function unmarkMeasureDropTarget(measure) {
		removeClass(measure, 'isDropTarget');
	}

	function addClass(element, className) {
		if (element && element.classList) {
			element.classList.add(className);
		}
	}

	function removeClass(element, className) {
		if (element && element.classList) {
			element.classList.remove(className);
		}
	}

	global.CodaProgressionTransportDragClasses = {
		clear: clear,
		markChordDragging: markChordDragging,
		markChordDropTarget: markChordDropTarget,
		markMeasureDragging: markMeasureDragging,
		markMeasureDropTarget: markMeasureDropTarget,
		unmarkChordDropTarget: unmarkChordDropTarget,
		unmarkMeasureDropTarget: unmarkMeasureDropTarget
	};
})(window);
