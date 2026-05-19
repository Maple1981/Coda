// Rebuilds voicings and expressive harmonic details without replacing the chord sequence.
(function (global) {
	'use strict';

	var chordPlanService = global.CodaProgressionChordPlan;
	var measureContext = global.CodaProgressionMeasureContext;
	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var segmentBuilder = global.CodaProgressionSegmentBuilder;
	var voiceLeadingService = global.CodaProgressionVoiceLeading;

	function apply(progression, options) {
		var progressionState = options && options.progressionState ? options.progressionState : {};
		var report = options && options.report ? options.report : {};
		var secondsPerBeat = Number(progression && progression.secondsPerBeat) || 60 / (Number(progressionState.bpm) || Number(progression && progression.bpm) || 120);
		var progressionContext = extendObject(progression || {}, {
			beatUnit: progressionState.beatUnit,
			beatsPerBar: progressionState.beatsPerBar,
			bpm: progressionState.bpm,
			secondsPerBeat: secondsPerBeat
		});
		var measures = progression && progression.measures ? progression.measures : [];
		var rebuiltMeasures = [];
		var previousPlan = null;

		for (var i = 0; i < measures.length; i++) {
			var measure = updateMeasureState(measures[i], progressionState);
			var segments = measureTimelineService.measureSegments(measure);
			var rebuiltSegments = [];

			for (var j = 0; j < segments.length; j++) {
				var segment = updateMeasureState(segments[j], progressionState);
				var rebuiltSegment = revoiceSegment(segment, {
					data: options.data,
					index: i,
					previousPlan: previousPlan,
					progressionState: progressionState,
					report: report,
					resolvedDegree: resolvedDegreeFromSegment(segment, report),
					resolvedDegrees: resolvedDegreesForSegment(segment, report)
				});

				rebuiltSegments.push(rebuiltSegment);
				previousPlan = segmentPlan(rebuiltSegment);
			}

			rebuiltMeasures.push(measureTimelineService.measureWithSegments(measure, rebuiltSegments, progressionContext, {
				rng: options && options.rng
			}));
		}

		return voiceLeadingService.annotateMeasures(rebuiltMeasures, progressionState);
	}

	function revoiceSegment(segment, context) {
		var resolvedDegree = context.resolvedDegree;
		var chordPlan;

		if (!resolvedDegree || segment.isSilence || segment.chordKind === 'silence' || !segment.chord) {
			return segment;
		}

		chordPlan = chordPlanService.build({
			index: context.index,
			options: {
				forceInversionIndex: numberOrDefault(segment.inversionIndex, 0),
				forceKind: segment.chordKind === 'seventh' ? 'seventh' : 'triad',
				includeTensions: true,
				initialMidiNote: context.data && context.data.midi ? context.data.midi.initialMidiNote : 60,
				preventSuspension: !segment.suspension,
				rng: segment.suspension ? function () { return 0; } : function () { return 1; },
				scaleDefinition: context.report.scaleDefinition,
				scaleNotes: context.report.scaleNotes
			},
			previousPlan: context.previousPlan,
			progressionState: context.progressionState,
			resolvedDegree: resolvedDegree,
			resolvedDegrees: context.resolvedDegrees
		});

		return segmentBuilder.fromPlan(segment, {
			chordPlan: chordPlan,
			reportScaleDefinition: context.report.scaleDefinition,
			resolvedDegree: resolvedDegree
		}, {
			chordIndex: numberOrDefault(segment.chordIndex, 0),
			durationBeats: Number(segment.durationBeats) || 4,
			durationSeconds: Number(segment.durationSeconds) || 0,
			startBeat: Number(segment.startBeat) || 0,
			startSeconds: Number(segment.startSeconds) || 0
		});
	}

	function resolvedDegreeFromSegment(segment, report) {
		var resolvedDegree = measureContext.resolvedDegreeFromMeasure(segment, report);

		if (resolvedDegree) {
			return resolvedDegree;
		}

		if (!segment || !segment.chord) {
			return null;
		}

		return {
			chord: segment.chord,
			chromaticRole: segment.chromaticRole,
			degree: segment.degree || '',
			degreeDisplayName: baseDegreeDisplayName(segment),
			degreeIndex: numberOrDefault(segment.degreeIndex, 0),
			source: segment.source || 'diatonic',
			sourceLabelKey: segment.sourceLabelKey,
			sourceScaleIndex: segment.sourceScaleIndex,
			sourceTonicName: segment.sourceTonicName,
			tonalFunctionOverride: segment.tonalFunction
		};
	}

	function baseDegreeDisplayName(segment) {
		var degree = segment && segment.degree ? String(segment.degree) : '';
		var suffixes = [
			segment && segment.suspension,
			segment && segment.inversion,
			'4/2',
			'4/3',
			'6/5',
			'6/4',
			'6'
		];

		for (var i = 0; i < suffixes.length; i++) {
			degree = removeSuffix(degree, suffixes[i]);
		}

		return degree;
	}

	function removeSuffix(value, suffix) {
		var text = String(value || '');
		var ending = suffix ? String(suffix) : '';

		if (!ending || text.length <= ending.length || text.slice(-ending.length) !== ending) {
			return text;
		}

		return text.slice(0, -ending.length).replace(/\s+$/, '');
	}

	function resolvedDegreesForSegment(segment, report) {
		var resolvedDegree = resolvedDegreeFromSegment(segment, report);

		return resolvedDegree ? [resolvedDegree] : [];
	}

	function segmentPlan(segment) {
		return {
			midiNotes: segment.midiNotes || [],
			notes: segment.notes || [],
			voiceNotes: segment.voiceNotes || []
		};
	}

	function updateMeasureState(measure, state) {
		var next = measureTimelineService.cloneMeasure(measure);

		next.articulation = state.articulation;
		next.beatUnit = state.beatUnit;
		next.beatsPerBar = state.beatsPerBar;
		next.humanization = state.humanization;
		next.intensity = state.intensity;
		next.swing = state.swing;
		next.voices = state.voices;

		return next;
	}

	function extendObject(target, values) {
		var result = {};
		var key;

		for (key in target) {
			if (Object.prototype.hasOwnProperty.call(target, key)) {
				result[key] = target[key];
			}
		}

		for (key in values) {
			if (Object.prototype.hasOwnProperty.call(values, key)) {
				result[key] = values[key];
			}
		}

		return result;
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	global.CodaProgressionRevoice = {
		apply: apply,
		baseDegreeDisplayName: baseDegreeDisplayName,
		resolvedDegreeFromSegment: resolvedDegreeFromSegment,
		revoiceSegment: revoiceSegment
	};
})(window);
