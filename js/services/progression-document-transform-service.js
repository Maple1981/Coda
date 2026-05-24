// Applies progression controls to an existing editable document without replacing its harmonic content.
(function (global) {
	'use strict';

	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var objectService = global.CodaProgressionObjects;
	var revoiceService = global.CodaProgressionRevoice;
	var timingService = global.CodaProgressionTiming;

	function applyState(progression, options) {
		var state = options && options.progressionState ? options.progressionState : {};
		var refreshed;
		var measures;

		if (!progression || !state) {
			return progression;
		}

		refreshed = progressionWithState(progression, state);
		measures = normalizeMeasureDurations(adjustedMeasuresForState(progression, options), state);
		refreshed = measureTimelineService.rebuildTimeline(refreshed, measures, {
			rng: options && options.rng
		});
		refreshed = progressionWithState(refreshed, state);

		if (revoiceService && typeof revoiceService.apply === 'function') {
			refreshed.measures = revoiceService.apply(refreshed, {
				data: options && options.data,
				progressionState: state,
				report: options && options.report,
				rng: options && options.rng
			});
		}

		refreshed.userEdited = true;

		return refreshed;
	}

	function adjustedMeasuresForState(progression, options) {
		var state = options && options.progressionState ? options.progressionState : {};
		var measures = cloneJson(progression && progression.measures ? progression.measures : []);
		var sections = progression && progression.sections ? progression.sections : [];
		var firstSection = sections.length ? sections[0] : null;
		var targetBars = Math.max(1, Number(state.bars) || measures.length);

		if (sections.length > 1 && firstSection && Number(firstSection.length) === targetBars) {
			return measures;
		}

		if (measures.length > targetBars) {
			return measures.slice(0, targetBars);
		}

		if (measures.length < targetBars) {
			return extendMeasuresByRepetition(measures, targetBars);
		}

		return measures;
	}

	function extendMeasuresByRepetition(measures, targetBars) {
		var result = cloneJson(measures || []);
		var sourceLength = result.length;
		var sourceIndex;

		if (!sourceLength) {
			return result;
		}

		while (result.length < targetBars) {
			sourceIndex = (result.length - sourceLength) % sourceLength;
			result.push(cloneJson(result[sourceIndex]));
		}

		return result;
	}

	function progressionWithState(progression, state) {
		var next = cloneJson(progression) || {};
		var secondsPerBeat = timingService.secondsPerBeat(null, state);

		next.articulation = state.articulation;
		next.beatUnit = state.beatUnit;
		next.beatsPerBar = state.beatsPerBar;
		next.bpm = state.bpm;
		next.harmonicColor = {
			chromaticism: state.chromaticism,
			counterpoint: state.counterpoint,
			modalInterchange: state.modalInterchange,
			tensions: state.tensions
		};
		next.harmonicDensity = state.harmonicDensity;
		next.humanization = state.humanization;
		next.intensity = state.intensity;
		next.meter = state.meter;
		next.secondsPerBeat = secondsPerBeat;
		next.style = state.style;
		next.swing = state.swing;
		next.totalBeats = (next.measures ? next.measures.length : Number(state.bars) || 0) * state.beatsPerBar;
		next.totalSeconds = next.totalBeats * secondsPerBeat;
		next.voicing = state.voicing;
		next.voices = state.voices;

		return next;
	}

	function normalizeMeasureDurations(measures, state) {
		var normalized = cloneJson(measures || []);

		for (var i = 0; i < normalized.length; i++) {
			applyMeasureState(normalized[i], state);
			normalized[i].durationBeats = state.beatsPerBar;
			if (normalized[i].chords && normalized[i].chords.length) {
				for (var j = 0; j < normalized[i].chords.length; j++) {
					applyMeasureState(normalized[i].chords[j], state);
				}
			}
		}

		return normalized;
	}

	function applyMeasureState(measure, state) {
		measure.articulation = state.articulation;
		measure.beatUnit = state.beatUnit;
		measure.beatsPerBar = state.beatsPerBar;
		measure.humanization = state.humanization;
		measure.intensity = state.intensity;
		measure.swing = state.swing;
	}

	function cloneJson(value) {
		return objectService.cloneJson(value);
	}

	global.CodaProgressionDocumentTransform = {
		adjustedMeasuresForState: adjustedMeasuresForState,
		applyState: applyState,
		extendMeasuresByRepetition: extendMeasuresByRepetition,
		normalizeMeasureDurations: normalizeMeasureDurations,
		progressionWithState: progressionWithState
	};
})(window);
