// Applies automatic split-measure harmonic density to generated progressions.
(function (global) {
	'use strict';

	var additionalChordService = global.CodaProgressionAdditionalChord;
	var chordPlanService = global.CodaProgressionChordPlan;
	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var segmentBuilder = global.CodaProgressionSegmentBuilder;

	function apply(measures, options) {
		var progressionState = options && options.progressionState ? options.progressionState : {};
		var density = normalizedDensity(progressionState.harmonicDensity);
		var rng = options && typeof options.rng === 'function' ? options.rng : Math.random;
		var result;
		var progression;

		if (!measures || !measures.length || density <= 0) {
			return measures || [];
		}

		result = cloneMeasures(measures);
		progression = progressionContext(progressionState, options);

		for (var i = 0; i < result.length - 1; i++) {
			var targetCount = chordCountForMeasure({
				denseRun: denseRunBefore(result, i),
				density: density,
				index: i,
				measure: result[i],
				nextMeasure: result[i + 1],
				progressionState: progressionState,
				rng: rng,
				totalMeasures: result.length
			});

			if (targetCount > 1) {
				result[i] = densifyMeasure(result, i, targetCount, progression, options || {}, rng);
			}
		}

		return result;
	}

	function densifyMeasure(measures, measureIndex, targetCount, progression, options, rng) {
		var measure = measures[measureIndex];
		var segments = measureTimelineService.measureSegments(measure);
		var guard = 0;

		while (segments.length < targetCount && guard < 8) {
			var insertAfterIndex = segments.length - 1;
			var anchorSegment = segments[insertAfterIndex];
			var additionalChord = chooseAdditionalChord(measures, measureIndex, segments, insertAfterIndex, progression, options, rng);
			var additionalSegment;

			if (!additionalChord) {
				break;
			}

			additionalSegment = segmentBuilder.fromPlan(anchorSegment, additionalChord, {
				chordIndex: insertAfterIndex + 1,
				durationBeats: Number(anchorSegment.durationBeats) || Number(measure.durationBeats) || Number(progression.beatsPerBar) || 4,
				durationSeconds: Number(anchorSegment.durationSeconds) || Number(measure.durationSeconds) || 0,
				startBeat: Number(anchorSegment.endBeat) || Number(anchorSegment.startBeat) || Number(measure.startBeat) || 0,
				startSeconds: Number(anchorSegment.endSeconds) || Number(anchorSegment.startSeconds) || Number(measure.startSeconds) || 0
			});
			segments.splice(insertAfterIndex + 1, 0, additionalSegment);
			measure = measureTimelineService.measureWithSegments(measure, segments, progression, {
				rng: rng
			});
			segments = measureTimelineService.measureSegments(measure);
			guard += 1;
		}

		return measure;
	}

	function chooseAdditionalChord(measures, measureIndex, segments, insertAfterIndex, progression, options, rng) {
		return additionalChordService.choose({
			buildChordPlan: chordPlanService.build,
			data: options.data,
			measure: segments[insertAfterIndex],
			nextMeasure: segments[insertAfterIndex + 1] || measures[measureIndex + 1] || null,
			progression: progression,
			progressionState: options.progressionState,
			report: options.report,
			rng: rng
		});
	}

	function chordCountForMeasure(options) {
		var index = Number(options && options.index) || 0;
		var totalMeasures = Number(options && options.totalMeasures) || 0;
		var progressionState = options && options.progressionState ? options.progressionState : {};
		var density = normalizedDensityInput(options && options.density != null ? options.density : progressionState.harmonicDensity);
		var rng = options && typeof options.rng === 'function' ? options.rng : Math.random;
		var measure = options && options.measure ? options.measure : null;
		var nextMeasure = options && options.nextMeasure ? options.nextMeasure : null;
		var denseRun = Number(options && options.denseRun) || 0;
		var maxChords = maxChordCount(progressionState);
		var boost = 0;
		var brake = 0;
		var extraScore;
		var extraCount;
		var targetCount;

		if (maxChords <= 1 || density <= 0 || isFinalMeasure(index, totalMeasures)) {
			return 1;
		}

		boost += formalDensityBoost(index, totalMeasures);
		boost += harmonicTensionBoost(measure, nextMeasure);
		boost += writingDensityBoost(progressionState);
		brake += formalDensityBrake(index, totalMeasures);
		brake += harmonicRestBrake(measure);

		if (denseRun >= 2 && density < 0.94) {
			brake += 0.45;
		}

		extraScore = density * (0.52 + boost - brake) * (maxChords - 1);
		extraScore = Math.max(0, Math.min(maxChords - 1, extraScore));
		extraCount = Math.floor(extraScore);
		if (rng() < extraScore - extraCount) {
			extraCount += 1;
		}

		targetCount = Math.max(1, Math.min(maxChords, 1 + extraCount));
		targetCount = biasTargetChordCount(targetCount, progressionState, density, rng);

		if (denseRun >= 2 && targetCount >= 3 && density < 0.94) {
			targetCount = 2;
		}

		return Math.max(1, Math.min(maxChords, targetCount));
	}

	function targetChordCount(index, totalMeasures, progressionState, density, rng) {
		return chordCountForMeasure({
			density: density,
			index: index,
			progressionState: progressionState,
			rng: rng,
			totalMeasures: totalMeasures
		});
	}

	function formalDensityBoost(index, totalMeasures) {
		var boost = 0;

		if (isPhraseApproachMeasure(index)) {
			boost += 0.28;
		}

		if (isSectionApproachMeasure(index, totalMeasures)) {
			boost += 0.32;
		}

		if (totalMeasures >= 16 && !isOpeningMeasure(index)) {
			boost += 0.08;
		}

		return boost;
	}

	function formalDensityBrake(index, totalMeasures) {
		var brake = 0;

		if (isOpeningMeasure(index)) {
			brake += 0.24;
		}

		if (totalMeasures <= 4 && !isSectionApproachMeasure(index, totalMeasures)) {
			brake += 0.1;
		}

		return brake;
	}

	function harmonicTensionBoost(measure, nextMeasure) {
		var boost = 0;

		if (measure && measure.tonalFunction === 'D') {
			boost += 0.1;
		}

		if (measure && (measure.cadentialRole || measure.chromaticRole)) {
			boost += 0.16;
		}

		if (nextMeasure && nextMeasure.tonalFunction === 'T' && measure && measure.tonalFunction !== 'T') {
			boost += 0.08;
		}

		return boost;
	}

	function harmonicRestBrake(measure) {
		if (!measure) {
			return 0;
		}

		if (measure.tonalFunction === 'T' && !measure.cadentialRole && !measure.chromaticRole) {
			return 0.08;
		}

		return 0;
	}

	function writingDensityBoost(progressionState) {
		var boost = 0;

		if (progressionState && progressionState.style === 'classic') {
			boost += 0.05;
		}

		boost += normalizedControl(progressionState && progressionState.counterpoint) * 0.08;
		boost += normalizedControl(progressionState && progressionState.tensions) * 0.05;
		boost += normalizedControl(progressionState && progressionState.chromaticism) * 0.05;

		return boost;
	}

	function biasTargetChordCount(targetCount, progressionState, density, rng) {
		var family = meterFamily(progressionState);

		if (family === 'binary' && targetCount === 3 && rng() < 0.82) {
			return density >= 0.68 && maxChordCount(progressionState) >= 4 ? 4 : 2;
		}

		if (family === 'ternary' && targetCount === 2 && rng() < 0.82) {
			return density >= 0.58 ? 3 : 1;
		}

		if (family === 'ternary' && targetCount === 4 && rng() < 0.88) {
			return 3;
		}

		if (family === 'irregular' && targetCount === 4 && maxChordCount(progressionState) < 7 && rng() < 0.45) {
			return 3;
		}

		if (family === 'irregular' && targetCount === 2 && density >= 0.76 && rng() < 0.42) {
			return 3;
		}

		return targetCount;
	}

	function meterFamily(progressionState) {
		var beatsPerBar = Math.max(1, Math.round(Number(progressionState && progressionState.beatsPerBar) || 4));

		if (beatsPerBar % 2 === 0) {
			return 'binary';
		}

		if (beatsPerBar % 3 === 0) {
			return 'ternary';
		}

		return 'irregular';
	}

	function isPhraseApproachMeasure(index) {
		return (index + 1) % 4 === 3;
	}

	function isSectionApproachMeasure(index, totalMeasures) {
		return totalMeasures > 1 && index === totalMeasures - 2;
	}

	function isOpeningMeasure(index) {
		return index % 4 === 0;
	}

	function isFinalMeasure(index, totalMeasures) {
		return totalMeasures > 0 && index >= totalMeasures - 1;
	}

	function maxChordCount(progressionState) {
		var beatsPerBar = Math.floor(Number(progressionState && progressionState.beatsPerBar) || 4);

		return Math.max(1, Math.min(4, beatsPerBar));
	}

	function progressionContext(progressionState, options) {
		return {
			beatUnit: progressionState.beatUnit,
			beatsPerBar: progressionState.beatsPerBar,
			bpm: progressionState.bpm,
			secondsPerBeat: options && options.secondsPerBeat ? options.secondsPerBeat : 60 / (Number(progressionState.bpm) || 120)
		};
	}

	function normalizedDensity(value) {
		var number = Number(value);

		if (!isFinite(number)) {
			return 0;
		}

		return Math.max(0, Math.min(100, number)) / 100;
	}

	function normalizedDensityInput(value) {
		var number = Number(value);

		if (!isFinite(number)) {
			return 0;
		}

		if (number >= 0 && number <= 1) {
			return number;
		}

		return normalizedDensity(number);
	}

	function normalizedControl(value) {
		var number = Number(value);

		if (!isFinite(number)) {
			return 0;
		}

		return Math.max(0, Math.min(100, number)) / 100;
	}

	function denseRunBefore(measures, index) {
		var run = 0;

		for (var i = index - 1; i >= 0; i--) {
			var measure = measures[i];
			var count = measure && measure.chords && measure.chords.length ? measure.chords.length : 1;

			if (count < 3) {
				break;
			}

			run += 1;
		}

		return run;
	}

	function cloneMeasures(measures) {
		var result = [];

		for (var i = 0; i < (measures || []).length; i++) {
			result.push(measureTimelineService.cloneMeasure(measures[i]));
		}

		return result;
	}

	global.CodaProgressionHarmonicDensity = {
		apply: apply,
		biasTargetChordCount: biasTargetChordCount,
		chordCountForMeasure: chordCountForMeasure,
		maxChordCount: maxChordCount,
		meterFamily: meterFamily,
		targetChordCount: targetChordCount
	};
})(window);
