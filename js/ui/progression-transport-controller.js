// Transport controls for progression preview and MIDI export.
(function (global) {
	'use strict';

	function initialize(options) {
		options = options || {};

		var root = query('#constructorProgresiones');
		var transportView = global.CodaProgressionTransportView;
		var goStartButton = query('.transportButton--goStart');
		var listenButton = query('.transportButton--listen');
		var exportButton = query('.transportButton--export');
		var playbackHeadIndex = 0;

		if (!root || root.getAttribute('data-coda-progression-transport') === 'true') {
			return null;
		}

		root.setAttribute('data-coda-progression-transport', 'true');

		if (goStartButton) {
			goStartButton.addEventListener('click', function () {
				global.CodaProgressionTransportPlayback.stop(options, listenButton, playbackHeadIndex);
				playbackHeadIndex = 0;
				transportView.setPlaybackHead(playbackHeadIndex, false);
			});
		}

		if (listenButton) {
			listenButton.addEventListener('click', function () {
				global.CodaProgressionTransportPlayback.toggle(options, listenButton, playbackHeadIndex, function (index) {
					playbackHeadIndex = index;
				});
			});
		}

		if (exportButton) {
			exportButton.addEventListener('click', function () {
				global.CodaProgressionMidiDownload.exportMidi(options);
			});
		}

		root.addEventListener('click', function (event) {
			var chordMenuButton = closest(event.target, '.measureChordMenuButton');
			var chordElement = closest(event.target, '.measureChord');
			var splitButton = closest(event.target, '.measureSplitButton');
			var measure = closest(event.target, '.measure');
			var clickedIndex;

			if (!measure || closest(event.target, '.measureDragHandle')) {
				return;
			}

			clickedIndex = measureIndex(measure);
			if (chordMenuButton) {
				event.preventDefault();
				if (typeof event.stopPropagation === 'function') {
					event.stopPropagation();
				}
				global.CodaProgressionTransportMenu.open(options, chordMenuButton, clickedIndex, chordIndex(chordElement));
				return;
			}

			if (splitButton) {
				event.preventDefault();
				global.CodaProgressionTransportPlayback.stop(options, listenButton, playbackHeadIndex);
				global.CodaProgressionTransportMenu.close();
				global.CodaProgressionTransportActions.updateMeasureSplit(options, splitButton.getAttribute('data-progression-split-action'), clickedIndex, chordIndex(chordElement));
				playbackHeadIndex = clickedIndex;
				transportView.setPlaybackHead(playbackHeadIndex, false);
				return;
			}

			if (
				options.progressionPlayback &&
				typeof options.progressionPlayback.isPlaying === 'function' &&
				options.progressionPlayback.isPlaying() &&
				clickedIndex === playbackHeadIndex
			) {
				global.CodaProgressionTransportPlayback.stop(options, listenButton, playbackHeadIndex);
				return;
			}

			playbackHeadIndex = clickedIndex;
			transportView.setPlaybackHead(playbackHeadIndex, false);
			global.CodaProgressionTransportPlayback.play(options, listenButton, playbackHeadIndex, function (index) {
				playbackHeadIndex = index;
			});
		});

		global.CodaProgressionTransportDrag.initialize({
			onMeasureChordDrop: function (measureIndex, fromChordIndex, toChordIndex) {
				global.CodaProgressionTransportPlayback.stop(options, listenButton, playbackHeadIndex);
				global.CodaProgressionTransportActions.reorderMeasureChords(options, measureIndex, fromChordIndex, toChordIndex);
				playbackHeadIndex = measureIndex;
				transportView.setPlaybackHead(playbackHeadIndex, false);
			},
			onMeasureDrop: function (fromIndex, toIndex) {
				global.CodaProgressionTransportPlayback.stop(options, listenButton, playbackHeadIndex);
				global.CodaProgressionTransportActions.reorderProgression(options, fromIndex, toIndex);
				playbackHeadIndex = toIndex;
				transportView.setPlaybackHead(playbackHeadIndex, false);
			},
			root: root
		});

		if (global.document && typeof global.document.addEventListener === 'function') {
			global.document.addEventListener('keydown', function (event) {
				global.CodaProgressionTransportShortcuts.handle(event, {
					getPlaybackHeadIndex: function () {
						return playbackHeadIndex;
					},
					progression: options.uiState ? options.uiState.getProgression() : null,
					setPlaybackHead: transportView.setPlaybackHead,
					setPlaybackHeadIndex: function (index) {
						playbackHeadIndex = index;
					},
					stopPreview: function (index) {
						global.CodaProgressionTransportPlayback.stop(options, listenButton, index);
					},
					togglePreview: function (index, setPlaybackHeadIndex) {
						global.CodaProgressionTransportPlayback.toggle(options, listenButton, index, setPlaybackHeadIndex);
					}
				});
			});

			global.document.addEventListener('click', function (event) {
				var menuItem = closest(event.target, '.measureChordMenuItem');
				var menu = closest(event.target, '.progressionChordMenu');

				if (menuItem) {
					var replacement = global.CodaProgressionTransportMenu.replacementFromItem(menuItem);
					var menuMeasureIndex = parseInt(menuItem.getAttribute('data-progression-index'), 10);
					var menuChordIndex = parseInt(menuItem.getAttribute('data-measure-chord-index'), 10);

					global.CodaProgressionTransportPlayback.stop(options, listenButton, playbackHeadIndex);
					global.CodaProgressionTransportActions.updateMeasureChordReplacement(options, menuMeasureIndex, menuChordIndex, replacement);
					global.CodaProgressionTransportMenu.close();
					playbackHeadIndex = menuMeasureIndex;
					transportView.setPlaybackHead(playbackHeadIndex, false);
					return;
				}

				if (!menu && !closest(event.target, '.measureChordMenuButton')) {
					global.CodaProgressionTransportMenu.close();
				}
			});
		}

		return {
			exportMidi: function () {
				global.CodaProgressionMidiDownload.exportMidi(options);
			},
			setPlaybackHead: function (index) {
				playbackHeadIndex = global.CodaProgressionTransportPlayback.normalizeHeadIndex(index, options.uiState ? options.uiState.getProgression() : null);
				transportView.setPlaybackHead(playbackHeadIndex, false);
			},
			stop: function () {
				global.CodaProgressionTransportPlayback.stop(options, listenButton, playbackHeadIndex);
			},
			togglePreview: function () {
				global.CodaProgressionTransportPlayback.toggle(options, listenButton, playbackHeadIndex, function (index) {
					playbackHeadIndex = index;
				});
			}
		};
	}

	function measureIndex(measure) {
		var index = parseInt(measure.getAttribute('data-progression-index'), 10);

		return isNaN(index) ? 0 : index;
	}

	function chordIndex(chordElement) {
		var index = chordElement ? parseInt(chordElement.getAttribute('data-measure-chord-index'), 10) : 0;

		return isNaN(index) ? 0 : index;
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	function closest(target, selector) {
		return target && target.closest ? target.closest(selector) : null;
	}

	global.CodaProgressionTransport = {
		clearPlaybackHead: global.CodaProgressionTransportView.clearPlaybackHead,
		clearActiveMeasure: global.CodaProgressionTransportView.clearActiveMeasure,
		downloadMidiFile: global.CodaProgressionMidiDownload.download,
		initialize: initialize,
		setActiveMeasure: global.CodaProgressionTransportView.setActiveMeasure,
		setPlaybackHead: global.CodaProgressionTransportView.setPlaybackHead,
		setPlayingState: global.CodaProgressionTransportView.setPlayingState
	};
})(window);
