// Rebuilds voicings and expressive harmonic details without replacing the chord sequence.
(function (global) {
	'use strict';

	var chordPlanService = global.CodaProgressionChordPlan;
	var measureContext = global.CodaProgressionMeasureContext;
	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var objectService = global.CodaProgressionObjects;
	var segmentBuilder = global.CodaProgressionSegmentBuilder;
	var voiceLeadingService = global.CodaProgressionVoiceLeading;
	var MAX_INVERSION_RUN = 3;

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
					nextSegment: nextSegmentAfter(measures, i, j),
					preserveInversions: !(options && options.preserveInversions === false),
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
				forceInversionIndex: forcedInversionIndexForSegment(segment, context),
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

	function forcedInversionIndexForSegment(segment, context) {
		if (shouldPreserveSegmentInversion(segment, context)) {
			return numberOrDefault(segment.inversionIndex, 0);
		}

		if (wouldSetUpForcedInversionOverflow(segment, context)) {
			return alternateInversionIndex(segment);
		}

		return null;
	}

	function shouldPreserveSegmentInversion(segment, context) {
		var structurallyProtected = !!(segment && (segment.cadentialRole || segment.chromaticRole || segment.restorableInversionIndex != null));

		if (context.preserveInversions) {
			return true;
		}

		if (!structurallyProtected) {
			return false;
		}

		return !wouldSetUpForcedInversionOverflow(segment, context);
	}

	function wouldSetUpForcedInversionOverflow(segment, context) {
		var current = Number(segment && segment.inversionIndex);
		var previousKey = context.previousPlan && context.previousPlan.inversionRunKey != null ?
			String(context.previousPlan.inversionRunKey) :
			String(Number(context.previousPlan && context.previousPlan.inversionIndex));
		var previousLength = Number(context.previousPlan && context.previousPlan.inversionRunLength);
		var nextSegment = context.nextSegment;

		if (!isFinite(current) || String(current) !== previousKey || !isFinite(previousLength) || previousLength < MAX_INVERSION_RUN - 1) {
			return false;
		}

		return Number(nextSegment && nextSegment.inversionIndex) === current &&
			!!(nextSegment && (nextSegment.cadentialRole || nextSegment.chromaticRole || nextSegment.restorableInversionIndex != null));
	}

	function alternateInversionIndex(segment) {
		var current = numberOrDefault(segment && segment.inversionIndex, 0);
		var max = segment && segment.chordKind === 'seventh' ? 3 : 2;

		return current === 1 ? 2 : 1 <= max ? 1 : 0;
	}

	function nextSegmentAfter(measures, measureIndex, segmentIndex) {
		var currentSegments = measureTimelineService.measureSegments(measures[measureIndex]);

		if (currentSegments[segmentIndex + 1]) {
			return currentSegments[segmentIndex + 1];
		}

		for (var i = measureIndex + 1; i < measures.length; i++) {
			var segments = measureTimelineService.measureSegments(measures[i]);

			if (segments.length) {
				return segments[0];
			}
		}

		return null;
	}

	function resolvedDegreeFromSegment(segment, report) {
		var resolvedDegree = measureContext.resolvedDegreeFromMeasure(segment, report);

		if (resolvedDegree) {
			resolvedDegree.cadentialRole = segment.cadentialRole;
			resolvedDegree.chromaticRole = segment.chromaticRole;
			resolvedDegree.modalRole = segment.modalRole;
			resolvedDegree.sourceLabelKey = segment.sourceLabelKey;
			resolvedDegree.sourceScaleIndex = segment.sourceScaleIndex;
			resolvedDegree.sourceTonicName = segment.sourceTonicName;
			resolvedDegree.tonalFunctionOverride = segment.tonalFunction;
			return resolvedDegree;
		}

		if (!segment || !segment.chord) {
			return null;
		}

		return {
			chord: segment.chord,
			cadentialRole: segment.cadentialRole,
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
			inversionIndex: segment.inversionIndex,
			inversionRunKey: segment.inversionRunKey,
			inversionRunLength: segment.inversionRunLength,
			midiNotes: segment.midiNotes || [],
			notes: segment.notes || [],
			voiceNotes: segment.voiceNotes || []
		};
	}

	function updateMeasureState(measure, state) {
		var next = measureTimelineService.cloneMeasure(measure);

		next.articulation = valueOrExisting(state.articulation, next.articulation);
		next.beatUnit = valueOrExisting(state.beatUnit, next.beatUnit);
		next.beatsPerBar = valueOrExisting(state.beatsPerBar, next.beatsPerBar);
		next.humanization = valueOrExisting(state.humanization, next.humanization);
		next.intensity = valueOrExisting(state.intensity, next.intensity);
		next.swing = valueOrExisting(state.swing, next.swing);
		next.voices = valueOrExisting(state.voices, next.voices);
		next.pedalsIn = [];
		next.pedalsOut = [];

		return next;
	}

	function valueOrExisting(value, existing) {
		return value == null ? existing : value;
	}

	function extendObject(target, values) {
		return objectService.extendObject(target, values);
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
