// Handles clicks on progression measures and measure chords.
(function (global) {
	'use strict';

	function bind(options) {
		options.root.addEventListener('click', function (event) {
			var transportDom = global.CodaProgressionTransportDom;
			var chordMenuButton = transportDom.closest(event.target, '.measureChordMenuButton');
			var chordElement = transportDom.closest(event.target, '.measureChord');
			var splitButton = transportDom.closest(event.target, '.measureSplitButton');
			var measure = transportDom.closest(event.target, '.measure');
			var clickedIndex;

			if (!measure || transportDom.closest(event.target, '.measureDragHandle')) {
				return;
			}

			clickedIndex = transportDom.measureIndex(measure);
			selectInspectorChord(options, clickedIndex, transportDom.chordIndex(chordElement));
			if (chordMenuButton) {
				preventAndStop(event);
				global.CodaProgressionTransportMenu.open(options.transportOptions, chordMenuButton, clickedIndex, transportDom.chordIndex(chordElement));
				return;
			}

			if (splitButton) {
				prevent(event);
				global.CodaProgressionTransportPlayback.stop(options.transportOptions, options.listenButton, options.getPlaybackHeadIndex());
				global.CodaProgressionTransportMenu.close();
				global.CodaProgressionTransportActions.updateMeasureSplit(options.transportOptions, splitButton.getAttribute('data-progression-split-action'), clickedIndex, transportDom.chordIndex(chordElement));
				options.setPlaybackHeadIndex(clickedIndex);
				options.transportView.setPlaybackHead(clickedIndex, false);
				return;
			}

			if (isSamePlayingMeasure(options, clickedIndex)) {
				global.CodaProgressionTransportPlayback.stop(options.transportOptions, options.listenButton, options.getPlaybackHeadIndex());
				return;
			}

			options.setPlaybackHeadIndex(clickedIndex);
			options.transportView.setPlaybackHead(clickedIndex, false);
			global.CodaProgressionTransportPlayback.play(options.transportOptions, options.listenButton, clickedIndex, options.setPlaybackHeadIndex);
		});
	}

	function selectInspectorChord(options, measureIndex, chordIndex) {
		if (options.inspector && typeof options.inspector.select === 'function') {
			options.inspector.select(measureIndex, chordIndex);
		}
	}

	function isSamePlayingMeasure(options, clickedIndex) {
		return options.transportOptions.progressionPlayback &&
			typeof options.transportOptions.progressionPlayback.isPlaying === 'function' &&
			options.transportOptions.progressionPlayback.isPlaying() &&
			clickedIndex === options.getPlaybackHeadIndex();
	}

	function prevent(event) {
		if (event && typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
	}

	function preventAndStop(event) {
		prevent(event);
		if (event && typeof event.stopPropagation === 'function') {
			event.stopPropagation();
		}
	}

	global.CodaProgressionTransportMeasureClick = {
		bind: bind
	};
})(window);
