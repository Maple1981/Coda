// Handles clicks on progression measures and measure chords.
(function (global) {
	'use strict';

	function bind(options) {
		options.root.addEventListener('click', function (event) {
			var transportDom = global.CodaProgressionTransportDom;
			var chordMenuButton = transportDom.closest(event.target, '.measureChordMenuButton');
			var chordElement = transportDom.closest(event.target, '.measureChord');
			var quickButton = transportDom.closest(event.target, '.measureChordQuickButton');
			var quickToggle = transportDom.closest(event.target, '.measureChordQuickToggle');
			var splitButton = transportDom.closest(event.target, '.measureSplitButton');
			var measure = transportDom.closest(event.target, '.measure');
			var clickedIndex;

			if (!measure || transportDom.closest(event.target, '.measureDragHandle')) {
				return;
			}

			clickedIndex = transportDom.measureIndex(measure);
			selectInspectorChord(options, clickedIndex, transportDom.chordIndex(chordElement));
			if (quickToggle) {
				preventAndStop(event);
				toggleQuickEditor(options.root, chordElement, quickToggle);
				return;
			}

			if (quickButton) {
				preventAndStop(event);
				updateQuickChord(options, quickButton, clickedIndex, transportDom.chordIndex(chordElement));
				return;
			}

			closeQuickEditors(options.root);

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

	function updateQuickChord(options, quickButton, measureIndex, chordIndex) {
		var action = quickButton.getAttribute('data-inspector-action');
		var selection = chordSelection(options, measureIndex, chordIndex);
		var chord = selection.chord || {};
		var replacement = quickReplacementFromAction(chord, action, quickButton);

		if (!selection.measure) {
			return;
		}
		if (!replacement) {
			return;
		}

		global.CodaProgressionTransportPlayback.stop(options.transportOptions, options.listenButton, options.getPlaybackHeadIndex());
		global.CodaProgressionTransportMenu.close();
		global.CodaProgressionTransportActions.updateMeasureChordReplacement(options.transportOptions, selection.measureIndex, selection.chordIndex, replacement);
		closeQuickEditors(options.root);
		options.setPlaybackHeadIndex(selection.measureIndex);
		options.transportView.setPlaybackHead(selection.measureIndex, false);
	}

	function quickReplacementFromAction(chord, action, quickButton) {
		var kind = quickKind(chord);
		var inversionIndex = quickInversionIndex(chord);
		var degreeIndex = editableDegreeIndex(chord);
		var source = editableSource(chord);
		var sourceScaleIndex = editableSourceScaleIndex(chord);

		if (action === 'silence') {
			return {
				kind: 'silence'
			};
		}
		if (degreeIndex == null) {
			return null;
		}
		if (action === 'quick-kind' || action === 'replace') {
			kind = quickButton.getAttribute('data-chord-kind') || kind;
			inversionIndex = clampInversionIndex(kind, inversionIndex);
		}
		if (action === 'quick-inversion' || action === 'replace') {
			inversionIndex = clampInversionIndex(kind, parseInt(quickButton.getAttribute('data-inversion-index'), 10) || 0);
		}

		return {
			chromaticRole: editableChromaticRole(chord),
			degreeIndex: degreeIndex,
			inversionIndex: inversionIndex,
			kind: kind === 'seventh' ? 'seventh' : 'triad',
			source: source,
			sourceScaleIndex: sourceScaleIndex
		};
	}

	function editableDegreeIndex(chord) {
		return chord && chord.isSilence ? chord.restorableDegreeIndex : chord.degreeIndex;
	}

	function editableSource(chord) {
		return chord && chord.isSilence ? (chord.restorableSource || 'diatonic') : (chord.source || 'diatonic');
	}

	function editableSourceScaleIndex(chord) {
		return chord && chord.isSilence ? chord.restorableSourceScaleIndex : chord.sourceScaleIndex;
	}

	function editableChromaticRole(chord) {
		return chord && chord.isSilence ? chord.restorableChromaticRole : chord.chromaticRole;
	}

	function quickKind(chord) {
		if (chord && chord.isSilence && chord.restorableKind) {
			return chord.restorableKind;
		}

		return chord && (chord.chordKind || chord.kind) ? (chord.chordKind || chord.kind) : (chord && chord.chordName && chord.chordName.indexOf('7') > -1 ? 'seventh' : 'triad');
	}

	function quickInversionIndex(chord) {
		if (chord && chord.isSilence && chord.restorableInversionIndex != null) {
			return Number(chord.restorableInversionIndex) || 0;
		}

		return Number(chord && chord.inversionIndex) || 0;
	}

	function clampInversionIndex(kind, inversionIndex) {
		var max = kind === 'seventh' ? 3 : 2;

		return Math.max(0, Math.min(max, Number(inversionIndex) || 0));
	}

	function chordSelection(options, measureIndex, chordIndex) {
		var progression = options.transportOptions && options.transportOptions.uiState ? options.transportOptions.uiState.getProgression() : null;
		var measures = progression && progression.measures ? progression.measures : [];
		var measure = measures[measureIndex] || null;

		return {
			chord: global.CodaProgressionTransportMenu.currentChordSegment(measure, chordIndex),
			chordIndex: chordIndex,
			measure: measure,
			measureIndex: measureIndex
		};
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

	function toggleQuickEditor(root, chordElement, button) {
		var open = chordElement && chordElement.classList && chordElement.classList.contains('isQuickOpen');

		closeQuickEditors(root);

		if (!open && chordElement && chordElement.classList) {
			chordElement.classList.add('isQuickOpen');
			if (button && typeof button.setAttribute === 'function') {
				button.setAttribute('aria-expanded', 'true');
			}
		}
	}

	function closeQuickEditors(root) {
		var opened = root && typeof root.querySelectorAll === 'function' ? root.querySelectorAll('.measureChord.isQuickOpen') : [];

		Array.prototype.forEach.call(opened, function (chordElement) {
			var button = typeof chordElement.querySelector === 'function' ? chordElement.querySelector('.measureChordQuickToggle') : null;

			chordElement.classList.remove('isQuickOpen');
			if (button && typeof button.setAttribute === 'function') {
				button.setAttribute('aria-expanded', 'false');
			}
		});
	}

	global.CodaProgressionTransportMeasureClick = {
		bind: bind
	};
})(window);
