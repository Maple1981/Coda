// Encapsulates drag and drop interactions for progression measures and measure chords.
(function (global) {
	'use strict';

	function initialize(options) {
		options = options || {};

		var root = options.root;
		var draggedMeasureIndex = null;
		var draggedMeasureChord = null;

		if (!root || typeof root.addEventListener !== 'function') {
			return null;
		}

		root.addEventListener('dragstart', function (event) {
			var measure = closest(event.target, '.measure');
			var chordHandle = closest(event.target, '.measureChordDragHandle');
			var chordElement = closest(event.target, '.measureChord');
			var sourceMeasureIndex;
			var sourceChordIndex;

			if (!measure || closest(event.target, '.measureSplitButton') || closest(event.target, '.measureChordMenuButton')) {
				return;
			}

			if (chordHandle) {
				sourceMeasureIndex = measureIndex(measure);
				sourceChordIndex = chordIndex(chordElement);
				if (sourceChordIndex <= 0) {
					return;
				}

				draggedMeasureChord = {
					chordIndex: sourceChordIndex,
					measureIndex: sourceMeasureIndex
				};
				if (chordElement) {
					chordElement.classList.add('isDragging');
				}

				if (event.dataTransfer) {
					event.dataTransfer.effectAllowed = 'move';
					event.dataTransfer.setData('text/coda-progression-chord', sourceMeasureIndex + ':' + sourceChordIndex);
					event.dataTransfer.setData('text/plain', sourceMeasureIndex + ':' + sourceChordIndex);
				}
				return;
			}

			draggedMeasureIndex = measureIndex(measure);
			measure.classList.add('isDragging');

			if (event.dataTransfer) {
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/plain', String(draggedMeasureIndex));
			}
		});

		root.addEventListener('dragover', function (event) {
			var measure = closest(event.target, '.measure');
			var chordElement = closest(event.target, '.measureChord');
			var targetChordIndex;

			if (!measure) {
				return;
			}

			if (draggedMeasureChord) {
				targetChordIndex = chordIndex(chordElement);
				if (measureIndex(measure) !== draggedMeasureChord.measureIndex || targetChordIndex <= 0) {
					return;
				}

				preventDefault(event);
				if (chordElement) {
					chordElement.classList.add('isChordDropTarget');
				}
				setDropEffect(event);
				return;
			}

			preventDefault(event);
			measure.classList.add('isDropTarget');
			setDropEffect(event);
		});

		root.addEventListener('dragleave', function (event) {
			var measure = closest(event.target, '.measure');
			var chordElement = closest(event.target, '.measureChord');

			if (chordElement) {
				chordElement.classList.remove('isChordDropTarget');
			}
			if (measure) {
				measure.classList.remove('isDropTarget');
			}
		});

		root.addEventListener('drop', function (event) {
			var measure = closest(event.target, '.measure');
			var chordElement = closest(event.target, '.measureChord');
			var fromIndex = dragSourceIndex(event, draggedMeasureIndex);
			var toIndex;
			var targetChordIndex;
			var sourceChordDrag;

			if (!measure) {
				return;
			}

			if (draggedMeasureChord) {
				sourceChordDrag = draggedMeasureChord;
				targetChordIndex = chordIndex(chordElement);
				if (measureIndex(measure) !== sourceChordDrag.measureIndex || targetChordIndex <= 0) {
					clearDragState();
					return;
				}

				preventDefault(event);
				clearDragState();
				run(options.onMeasureChordDrop, sourceChordDrag.measureIndex, sourceChordDrag.chordIndex, targetChordIndex);
				return;
			}

			preventDefault(event);
			clearDragState();
			toIndex = measureIndex(measure);
			run(options.onMeasureDrop, fromIndex, toIndex);
		});

		root.addEventListener('dragend', clearDragState);

		function clearDragState() {
			draggedMeasureIndex = null;
			draggedMeasureChord = null;
			if (!global.document || typeof global.document.querySelectorAll !== 'function') {
				return;
			}

			Array.prototype.forEach.call(global.document.querySelectorAll('.measure.isDragging, .measure.isDropTarget'), function (measure) {
				measure.classList.remove('isDragging');
				measure.classList.remove('isDropTarget');
			});
			Array.prototype.forEach.call(global.document.querySelectorAll('.measureChord.isDragging, .measureChord.isChordDropTarget'), function (chord) {
				chord.classList.remove('isDragging');
				chord.classList.remove('isChordDropTarget');
			});
		}

		return {
			clear: clearDragState
		};
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

	function run(callback, value, secondValue, thirdValue) {
		if (typeof callback === 'function') {
			callback(value, secondValue, thirdValue);
		}
	}

	function dragSourceIndex(event, fallbackIndex) {
		var dataIndex = event && event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
		var numericIndex = parseInt(dataIndex, 10);

		return isNaN(numericIndex) ? fallbackIndex : numericIndex;
	}

	function measureIndex(measure) {
		var index = parseInt(measure.getAttribute('data-progression-index'), 10);

		return isNaN(index) ? 0 : index;
	}

	function chordIndex(chordElement) {
		var index = chordElement ? parseInt(chordElement.getAttribute('data-measure-chord-index'), 10) : 0;

		return isNaN(index) ? 0 : index;
	}

	function closest(target, selector) {
		return target && typeof target.closest === 'function' ? target.closest(selector) : null;
	}

	global.CodaProgressionTransportDrag = {
		chordIndex: chordIndex,
		dragSourceIndex: dragSourceIndex,
		initialize: initialize,
		measureIndex: measureIndex
	};
})(window);
