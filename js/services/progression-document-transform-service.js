// Applies progression controls to an existing editable document without replacing its harmonic content.
(function (global) {
	'use strict';

	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var revoiceService = global.CodaProgressionRevoice;

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
		var generated;

		if (sections.length > 1 && firstSection && Number(firstSection.length) === targetBars) {
			return measures;
		}

		if (measures.length > targetBars) {
			return measures.slice(0, targetBars);
		}

		if (measures.length < targetBars && typeof (options && options.generateProgressionFromState) === 'function' && options.report) {
			generated = options.generateProgressionFromState({
				data: options.data,
				progressionState: state,
				report: options.report
			});
			measures = measures.concat(((generated && generated.measures) || []).slice(measures.length, targetBars));
		}

		return measures;
	}

	function progressionWithState(progression, state) {
		var next = cloneJson(progression) || {};
		var secondsPerBeat = 60 / (Number(state.bpm) || 120);

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
		return value == null ? null : JSON.parse(JSON.stringify(value));
	}

	global.CodaProgressionDocumentTransform = {
		adjustedMeasuresForState: adjustedMeasuresForState,
		applyState: applyState,
		normalizeMeasureDurations: normalizeMeasureDurations,
		progressionWithState: progressionWithState
	};
})(window);
