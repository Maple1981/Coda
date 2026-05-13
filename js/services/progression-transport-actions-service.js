// Applies progression transport actions and reports updated progressions back to the UI.
(function (global) {
	'use strict';

	function reorderProgression(options, fromIndex, toIndex) {
		var progression = currentProgression(options);
		var reorderedProgression;

		if (
			!progression ||
			!options.application ||
			typeof options.application.reorderProgressionMeasures !== 'function'
		) {
			return;
		}

		reorderedProgression = options.application.reorderProgressionMeasures(progression, fromIndex, toIndex);
		notifyProgressionChanged(options, reorderedProgression, toIndex);
	}

	function reorderMeasureChords(options, measureIndex, fromChordIndex, toChordIndex) {
		var progression = currentProgression(options);
		var reorderedProgression;

		if (
			!progression ||
			!options.application ||
			typeof options.application.reorderProgressionMeasureChords !== 'function'
		) {
			return;
		}

		reorderedProgression = options.application.reorderProgressionMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex);
		notifyProgressionChanged(options, reorderedProgression, measureIndex);
	}

	function updateMeasureSplit(options, action, measureIndex, chordIndex) {
		var progression = currentProgression(options);
		var nextProgression = null;

		if (!progression || !options.application) {
			return;
		}

		if (action === 'remove' && typeof options.application.removeProgressionMeasureChord === 'function') {
			nextProgression = options.application.removeProgressionMeasureChord(progression, measureIndex, chordIndex);
		} else if (action === 'add' && typeof options.application.addProgressionMeasureChord === 'function') {
			nextProgression = options.application.addProgressionMeasureChord(progression, measureIndex, {
				chordIndex: chordIndex,
				data: options.data,
				progressionState: progressionState(options),
				report: report(options)
			});
		}

		notifyProgressionChanged(options, nextProgression, measureIndex);
	}

	function updateMeasureChordReplacement(options, measureIndex, chordIndex, replacement) {
		var progression = currentProgression(options);
		var nextProgression = null;

		if (
			!progression ||
			!options.application ||
			typeof options.application.replaceProgressionMeasureChord !== 'function'
		) {
			return;
		}

		nextProgression = options.application.replaceProgressionMeasureChord(progression, measureIndex, chordIndex, replacement, {
			data: options.data,
			progressionState: progressionState(options),
			report: report(options)
		});

		notifyProgressionChanged(options, nextProgression, measureIndex);
	}

	function currentProgression(options) {
		return options && options.uiState ? options.uiState.getProgression() : null;
	}

	function progressionState(options) {
		return options.uiState && options.uiState.getProgressionState ? options.uiState.getProgressionState() : null;
	}

	function report(options) {
		return options.uiState && options.uiState.getReport ? options.uiState.getReport() : null;
	}

	function notifyProgressionChanged(options, progression, playbackHeadIndex) {
		if (options.onProgressionChanged && progression) {
			options.onProgressionChanged(progression, {
				playbackHeadIndex: playbackHeadIndex
			});
		}
	}

	global.CodaProgressionTransportActions = {
		reorderMeasureChords: reorderMeasureChords,
		reorderProgression: reorderProgression,
		updateMeasureChordReplacement: updateMeasureChordReplacement,
		updateMeasureSplit: updateMeasureSplit
	};
})(window);
