// Keeps the selected progression chord inspector in sync with the timeline.
(function (global) {
	'use strict';

	function initialize(options) {
		var selected = {
			chordIndex: 0,
			measureIndex: 0
		};

		options = options || {};
		bindActions(options, selected);
		refresh(options, selected);

		return {
			refresh: function () {
				refresh(options, selected);
			},
			select: function (measureIndex, chordIndex) {
				selected.measureIndex = normalizeIndex(measureIndex);
				selected.chordIndex = normalizeIndex(chordIndex);
				refresh(options, selected);
			},
			selection: function () {
				return {
					chordIndex: selected.chordIndex,
					measureIndex: selected.measureIndex
				};
			}
		};
	}

	function bindActions(options, selected) {
		var panel = inspectorPanel();

		if (!panel || panel.getAttribute('data-coda-progression-inspector') === 'true') {
			return;
		}

		panel.setAttribute('data-coda-progression-inspector', 'true');
		panel.addEventListener('click', function (event) {
			var actionButton = closest(event.target, '.progressionInspectorAction');
			var action;

			if (!actionButton) {
				return;
			}

			action = actionButton.getAttribute('data-inspector-action');
			prevent(event);
			if (action === 'change') {
				global.CodaProgressionTransportMenu.open(options.transportOptions, actionButton, selected.measureIndex, selected.chordIndex);
			} else if (action === 'replace') {
				replaceSelectedChord(options, selected, actionButton);
			} else if (action === 'silence') {
				replaceSelectedChord(options, selected, actionButton, {
					kind: 'silence'
				});
			} else if (action === 'add' || action === 'remove') {
				stopPlayback(options);
				global.CodaProgressionTransportMenu.close();
				global.CodaProgressionTransportActions.updateMeasureSplit(options.transportOptions, action, selected.measureIndex, selected.chordIndex);
			}
		});
	}

	function replaceSelectedChord(options, selected, actionButton, forcedReplacement) {
		var selection = selectionData(currentProgression(options), selected);
		var chord = selection.chord || {};
		var replacement = forcedReplacement || {
			degreeIndex: chord.degreeIndex,
			inversionIndex: parseInt(actionButton.getAttribute('data-inversion-index'), 10) || 0,
			kind: actionButton.getAttribute('data-chord-kind') || 'triad',
			source: chord.source || 'diatonic',
			sourceScaleIndex: chord.sourceScaleIndex
		};

		stopPlayback(options);
		global.CodaProgressionTransportMenu.close();
		global.CodaProgressionTransportActions.updateMeasureChordReplacement(options.transportOptions, selection.measureIndex, selection.chordIndex, replacement);
	}

	function refresh(options, selected) {
		var panel = inspectorPanel();
		var renderer = global.CodaRenderers && global.CodaRenderers.progressionInspector;
		var progression = currentProgression(options);
		var inspectorSelection = selectionData(progression, selected);

		selected.measureIndex = inspectorSelection.measureIndex;
		selected.chordIndex = inspectorSelection.chordIndex;
		updateSelectedChordClass(inspectorSelection);
		if (!panel || !renderer) {
			return;
		}

		panel.innerHTML = renderer.render(inspectorSelection, renderOptions(options));
	}

	function selectionData(progression, selected) {
		var measures = progression && progression.measures ? progression.measures : [];
		var measureIndex = clamp(selected.measureIndex, measures.length);
		var measure = measures[measureIndex] || null;
		var chords = measure && measure.chords && measure.chords.length ? measure.chords : (measure ? [measure] : []);
		var chordIndex = clamp(selected.chordIndex, chords.length);

		return {
			chord: chords[chordIndex] || null,
			chordCount: chords.length || 0,
			chordIndex: chordIndex,
			measure: measure,
			measureIndex: measureIndex
		};
	}

	function renderOptions(options) {
		var transportOptions = options.transportOptions || {};
		var uiState = transportOptions.uiState;

		return {
			i18n: transportOptions.i18n,
			notation: transportOptions.notation,
			notationStyle: uiState && uiState.getNotationStyle ? uiState.getNotationStyle() : 'anglosaxon'
		};
	}

	function currentProgression(options) {
		return options.transportOptions && options.transportOptions.uiState ? options.transportOptions.uiState.getProgression() : null;
	}

	function updateSelectedChordClass(selection) {
		var selectedChord;
		var chords = global.document ? global.document.querySelectorAll('.measureChord.isSelected') : [];

		Array.prototype.forEach.call(chords, function (chord) {
			chord.classList.remove('isSelected');
		});

		selectedChord = query('.measure[data-progression-index="' + selection.measureIndex + '"] .measureChord[data-measure-chord-index="' + selection.chordIndex + '"]');
		if (selectedChord) {
			selectedChord.classList.add('isSelected');
		}
	}

	function stopPlayback(options) {
		var transportOptions = options.transportOptions || {};

		if (global.CodaProgressionTransportPlayback && typeof global.CodaProgressionTransportPlayback.stop === 'function') {
			global.CodaProgressionTransportPlayback.stop(transportOptions, options.listenButton, options.getPlaybackHeadIndex ? options.getPlaybackHeadIndex() : 0);
		}
	}

	function inspectorPanel() {
		return query('.progressionInspector');
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	function closest(target, selector) {
		return target && typeof target.closest === 'function' ? target.closest(selector) : null;
	}

	function prevent(event) {
		if (event && typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
	}

	function normalizeIndex(index) {
		var numericIndex = parseInt(index, 10);

		return isFinite(numericIndex) && numericIndex >= 0 ? numericIndex : 0;
	}

	function clamp(index, length) {
		if (!length) {
			return 0;
		}

		return Math.max(0, Math.min(normalizeIndex(index), length - 1));
	}

	global.CodaProgressionInspector = {
		initialize: initialize,
		selectionData: selectionData
	};
})(window);
