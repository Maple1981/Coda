// Transport controls for progression preview and MIDI export.
(function (global) {
	'use strict';

	function initialize(options) {
		options = options || {};

		var root = query('#constructorProgresiones');
		var transportView = global.CodaProgressionTransportView;
		var transportButtons = global.CodaProgressionTransportButtons;
		var transportMeasureClick = global.CodaProgressionTransportMeasureClick;
		var transportDocumentEvents = global.CodaProgressionTransportDocumentEvents;
		var transportDragActions = global.CodaProgressionTransportDragActions;
		var goStartButton = query('.transportButton--goStart');
		var listenButton = query('.transportButton--listen');
		var exportButton = query('.transportButton--export');
		var playbackHeadIndex = 0;
		var inspector = null;

		if (!root || root.getAttribute('data-coda-progression-transport') === 'true') {
			return null;
		}

		root.setAttribute('data-coda-progression-transport', 'true');
		inspector = global.CodaProgressionInspector ? global.CodaProgressionInspector.initialize({
			getPlaybackHeadIndex: function () {
				return playbackHeadIndex;
			},
			listenButton: listenButton,
			transportOptions: options
		}) : null;

		transportButtons.bind({
			exportButton: exportButton,
			getPlaybackHeadIndex: function () {
				return playbackHeadIndex;
			},
			goStartButton: goStartButton,
			listenButton: listenButton,
			setPlaybackHeadIndex: function (index) {
				playbackHeadIndex = index;
			},
			transportOptions: options,
			transportView: transportView
		});

		transportMeasureClick.bind({
			getPlaybackHeadIndex: function () {
				return playbackHeadIndex;
			},
			listenButton: listenButton,
			inspector: inspector,
			root: root,
			setPlaybackHeadIndex: function (index) {
				playbackHeadIndex = index;
			},
			transportOptions: options,
			transportView: transportView
		});

		transportDragActions.bind({
			getPlaybackHeadIndex: function () {
				return playbackHeadIndex;
			},
			listenButton: listenButton,
			root: root,
			setPlaybackHeadIndex: function (index) {
				playbackHeadIndex = index;
			},
			transportOptions: options,
			transportView: transportView
		});

		transportDocumentEvents.bind({
			getPlaybackHeadIndex: function () {
				return playbackHeadIndex;
			},
			listenButton: listenButton,
			setPlaybackHeadIndex: function (index) {
				playbackHeadIndex = index;
			},
			transportOptions: options,
			transportView: transportView
		});

		return {
			exportMidi: function () {
				global.CodaProgressionMidiDownload.exportMidi(options);
			},
			refreshInspector: function () {
				if (inspector && typeof inspector.refresh === 'function') {
					inspector.refresh();
				}
			},
			selectChord: function (measureIndex, chordIndex) {
				if (inspector && typeof inspector.select === 'function') {
					inspector.select(measureIndex, chordIndex);
				}
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

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
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
