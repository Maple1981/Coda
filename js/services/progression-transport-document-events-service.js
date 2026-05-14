// Document-level progression transport events: shortcuts and chord menu clicks.
(function (global) {
	'use strict';

	function bind(options) {
		var documentRef = global.document;

		if (!documentRef || typeof documentRef.addEventListener !== 'function') {
			return;
		}

		documentRef.addEventListener('keydown', function (event) {
			global.CodaProgressionTransportShortcuts.handle(event, {
				getPlaybackHeadIndex: options.getPlaybackHeadIndex,
				progression: options.transportOptions.uiState ? options.transportOptions.uiState.getProgression() : null,
				setPlaybackHead: options.transportView.setPlaybackHead,
				setPlaybackHeadIndex: options.setPlaybackHeadIndex,
				stopPreview: function (index) {
					global.CodaProgressionTransportPlayback.stop(options.transportOptions, options.listenButton, index);
				},
				togglePreview: function (index, setPlaybackHeadIndex) {
					global.CodaProgressionTransportPlayback.toggle(options.transportOptions, options.listenButton, index, setPlaybackHeadIndex);
				}
			});
		});

		documentRef.addEventListener('click', function (event) {
			var transportDom = global.CodaProgressionTransportDom;
			var menuItem = transportDom.closest(event.target, '.measureChordMenuItem');
			var menu = transportDom.closest(event.target, '.progressionChordMenu');

			if (menuItem) {
				replaceFromMenuItem(options, menuItem);
				return;
			}

			if (!menu && !transportDom.closest(event.target, '.measureChordMenuButton')) {
				global.CodaProgressionTransportMenu.close();
			}
		});
	}

	function replaceFromMenuItem(options, menuItem) {
		var transportDom = global.CodaProgressionTransportDom;
		var replacement = global.CodaProgressionTransportMenu.replacementFromItem(menuItem);
		var menuMeasureIndex = transportDom.measureIndex(menuItem);
		var menuChordIndex = transportDom.chordIndex(menuItem);

		global.CodaProgressionTransportPlayback.stop(options.transportOptions, options.listenButton, options.getPlaybackHeadIndex());
		global.CodaProgressionTransportActions.updateMeasureChordReplacement(options.transportOptions, menuMeasureIndex, menuChordIndex, replacement);
		global.CodaProgressionTransportMenu.close();
		options.setPlaybackHeadIndex(menuMeasureIndex);
		options.transportView.setPlaybackHead(menuMeasureIndex, false);
	}

	global.CodaProgressionTransportDocumentEvents = {
		bind: bind
	};
})(window);
