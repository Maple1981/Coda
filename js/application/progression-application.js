// Application use cases for harmonic progressions.
(function (global) {
	'use strict';

	function buildProgressionFromDegrees(options) {
		var resolvedDegrees = options.domain.resolveProgressionDegrees({
			degrees: options.degrees,
			scaleChords: options.report.scaleChords,
			scaleNotes: options.report.scaleNotes
		});

		return attachDegreeIndexes(resolvedDegrees, options.report.scaleNotes);
	}

	function buildProgressionFromState(options) {
		var progressionState = normalizeProgressionState(options.progressionState);
		var degrees = options.domain.createDiatonicDegreePlan({
			bars: progressionState.bars,
			scaleNotes: options.report.scaleNotes
		});
		var resolvedDegrees = buildProgressionFromDegrees({
			degrees: degrees,
			domain: options.domain,
			report: options.report
		});
		var secondsPerBeat = 60 / progressionState.bpm;

		return {
			articulation: progressionState.articulation,
			bars: progressionState.bars,
			beatUnit: progressionState.beatUnit,
			beatsPerBar: progressionState.beatsPerBar,
			bpm: progressionState.bpm,
			harmonicColor: {
				counterpoint: progressionState.counterpoint,
				modalInterchange: progressionState.modalInterchange,
				tensions: progressionState.tensions
			},
			measures: buildMeasures(resolvedDegrees, progressionState, secondsPerBeat, {
				initialMidiNote: options.data && options.data.midi ? options.data.midi.initialMidiNote : 60,
				scaleDefinition: options.report.scaleDefinition
			}),
			meter: progressionState.meter,
			secondsPerBeat: secondsPerBeat,
			style: progressionState.style,
			totalBeats: progressionState.bars * progressionState.beatsPerBar,
			totalSeconds: progressionState.bars * progressionState.beatsPerBar * secondsPerBeat,
			voices: progressionState.voices
		};
	}

	function generateProgressionFromState(options) {
		var progressionState = normalizeProgressionState(options.progressionState);
		var generationPlan = createGenerationPlan({
			progressionState: progressionState,
			report: options.report,
			rng: options.rng,
			rules: options.rules || (options.data ? options.data.progressionRules : null)
		});
		var resolvedDegrees = resolveGeneratedDegrees({
			degrees: generationPlan.degrees,
			report: options.report
		});
		var secondsPerBeat = 60 / progressionState.bpm;
		var progression = {
			articulation: progressionState.articulation,
			bars: progressionState.bars,
			beatUnit: progressionState.beatUnit,
			beatsPerBar: progressionState.beatsPerBar,
			bpm: progressionState.bpm,
			generation: {
				cadence: generationPlan.pattern.cadence,
				form: generationPlan.pattern.form,
				patternId: generationPlan.pattern.id,
				style: progressionState.style,
				voiceLeading: generationPlan.voiceLeading
			},
			harmonicColor: {
				counterpoint: progressionState.counterpoint,
				modalInterchange: progressionState.modalInterchange,
				tensions: progressionState.tensions
			},
			measures: buildMeasures(resolvedDegrees, progressionState, secondsPerBeat, {
				includeTensions: true,
				initialMidiNote: options.data && options.data.midi ? options.data.midi.initialMidiNote : 60,
				rng: options.rng,
				scaleDefinition: options.report.scaleDefinition,
				scaleNotes: options.report.scaleNotes
			}),
			meter: progressionState.meter,
			secondsPerBeat: secondsPerBeat,
			style: progressionState.style,
			totalBeats: progressionState.bars * progressionState.beatsPerBar,
			totalSeconds: progressionState.bars * progressionState.beatsPerBar * secondsPerBeat,
			voices: progressionState.voices
		};

		return progression;
	}

	function buildProgressionMidiFile(options) {
		var midiExport = options.midiExport || global.CodaMidiExport;
		var instrument = findInstrument(options.data, options.midiInstrument);

		return midiExport.createProgressionMidiFile({
			channel: options.data && options.data.midi ? options.data.midi.channel : 0,
			fileName: options.fileName,
			initialMidiNote: options.data && options.data.midi ? options.data.midi.initialMidiNote : 60,
			instrument: instrument,
			notes: options.data ? options.data.notes : [],
			progression: options.progression,
			ticksPerBeat: options.ticksPerBeat,
			velocity: options.data && options.data.midi ? options.data.midi.velocity : 96
		});
	}

	function reorderProgressionMeasures(progression, fromIndex, toIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var movedMeasure;

		fromIndex = clampMeasureIndex(fromIndex, measures.length);
		toIndex = clampMeasureIndex(toIndex, measures.length);

		if (!progression || !measures.length || fromIndex === toIndex) {
			return progression;
		}

		movedMeasure = measures.splice(fromIndex, 1)[0];
		measures.splice(toIndex, 0, movedMeasure);

		return rebuildProgressionTimeline(progression, measures);
	}

	function reorderProgressionMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var segments;
		var movedSegment;

		if (!progression || !measure || !measure.chords || measure.chords.length < 3) {
			return progression;
		}

		segments = measureSegments(measure);
		fromChordIndex = clampChordIndex(fromChordIndex, segments.length);
		toChordIndex = clampChordIndex(toChordIndex, segments.length);

		if (fromChordIndex === 0 || toChordIndex === 0 || fromChordIndex === toChordIndex) {
			return progression;
		}

		movedSegment = segments.splice(fromChordIndex, 1)[0];
		segments.splice(toChordIndex, 0, movedSegment);
		measures[index] = measureWithSegments(measure, segments, progression);

		return extendProgression(progression, {
			measures: measures
		});
	}

	function addProgressionMeasureChord(progression, measureIndex, options) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var segments;
		var insertAfterIndex;
		var additionalChord;
		var additionalSegment;

		options = options || {};
		if (!progression || !measure) {
			return progression;
		}

		segments = measureSegments(measure);
		if (segments.length >= 4) {
			return progression;
		}

		insertAfterIndex = clampChordIndex(options.chordIndex, segments.length);
		additionalChord = chooseAdditionalChordForMeasure({
			data: options.data,
			measure: segments[insertAfterIndex],
			nextMeasure: segments[insertAfterIndex + 1] || measures[index + 1] || null,
			progression: progression,
			progressionState: normalizeProgressionState(options.progressionState || progression),
			report: options.report,
			rng: options.rng
		});

		if (!additionalChord) {
			return progression;
		}

		additionalSegment = segmentFromPlan(segments[insertAfterIndex], additionalChord, {
			chordIndex: insertAfterIndex + 1,
			durationBeats: Number(segments[insertAfterIndex].durationBeats) || Number(measure.durationBeats) || Number(progression.beatsPerBar) || 4,
			durationSeconds: Number(segments[insertAfterIndex].durationSeconds) || Number(measure.durationSeconds) || 0,
			startBeat: Number(segments[insertAfterIndex].endBeat) || Number(segments[insertAfterIndex].startBeat) || Number(measure.startBeat) || 0,
			startSeconds: Number(segments[insertAfterIndex].endSeconds) || Number(segments[insertAfterIndex].startSeconds) || Number(measure.startSeconds) || 0
		});
		segments.splice(insertAfterIndex + 1, 0, additionalSegment);
		measures[index] = measureWithSegments(measure, segments, progression);

		return extendProgression(progression, {
			measures: measures
		});
	}

	function removeProgressionMeasureChord(progression, measureIndex, chordIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var segments;
		var normalizedChordIndex;

		if (!progression || !measure || !measure.chords || measure.chords.length < 2) {
			return progression;
		}

		segments = measureSegments(measure);
		normalizedChordIndex = clampChordIndex(chordIndex, segments.length);
		if (normalizedChordIndex === 0) {
			return progression;
		}

		segments.splice(normalizedChordIndex, 1);
		measures[index] = measureWithSegments(measure, segments, progression);

		return extendProgression(progression, {
			measures: measures
		});
	}

	function replaceProgressionMeasureChord(progression, measureIndex, chordIndex, replacement, options) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var normalizedChordIndex = Math.max(0, parseInt(chordIndex, 10) || 0);
		var segment;
		var nextMeasure;
		var replacedSegment;

		options = options || {};
		replacement = replacement || {};
		if (!progression || !measure || replacement.degreeIndex == null) {
			return progression;
		}

		segment = measure.chords && measure.chords.length ? measure.chords[Math.min(normalizedChordIndex, measure.chords.length - 1)] : measure;
		nextMeasure = measures[index + 1] || null;
		replacedSegment = buildReplacementSegment({
			chordIndex: normalizedChordIndex,
			data: options.data,
			measure: measure,
			nextMeasure: nextMeasure,
			progression: progression,
			progressionState: normalizeProgressionState(options.progressionState || progression),
			replacement: replacement,
			report: options.report,
			segment: segment
		});

		if (!replacedSegment) {
			return progression;
		}

		if (measure.chords && measure.chords.length) {
			measures[index] = replaceSplitMeasureSegment(measure, normalizedChordIndex, replacedSegment);
		} else {
			measures[index] = replaceWholeMeasure(measure, replacedSegment);
		}

		return extendProgression(progression, {
			measures: measures
		});
	}

	function rebuildProgressionTimeline(progression, measures) {
		var secondsPerBeat = Number(progression.secondsPerBeat) || 60 / (Number(progression.bpm) || 120);
		var beatsPerBar = Number(progression.beatsPerBar) || 4;
		var rebuiltMeasures = [];

		for (var i = 0; i < measures.length; i++) {
			var startBeat = i * beatsPerBar;
			var durationBeats = Number(measures[i].durationBeats) || beatsPerBar;
			var measure = cloneMeasure(measures[i]);

			measure.bar = i + 1;
			measure.startBeat = startBeat;
			measure.endBeat = startBeat + durationBeats;
			measure.durationBeats = durationBeats;
			measure.durationSeconds = durationBeats * secondsPerBeat;
			measure.startSeconds = startBeat * secondsPerBeat;
			measure.endSeconds = measure.endBeat * secondsPerBeat;
			if (measure.chords && measure.chords.length) {
				measure.chords = retimeMeasureChords(measure, secondsPerBeat);
			}
			rebuiltMeasures.push(measure);
		}

		return extendProgression(progression, {
			bars: rebuiltMeasures.length,
			measures: rebuiltMeasures,
			totalBeats: rebuiltMeasures.length * beatsPerBar,
			totalSeconds: rebuiltMeasures.length * beatsPerBar * secondsPerBeat
		});
	}

	function cloneMeasure(measure) {
		var clone = {};

		for (var key in measure) {
			if (Object.prototype.hasOwnProperty.call(measure, key)) {
				if ((key === 'notes' || key === 'midiNotes') && measure[key]) {
					clone[key] = measure[key].slice();
				} else if (key === 'chords' && measure[key]) {
					clone[key] = measure[key].map(cloneMeasure);
				} else if (key === 'voiceNotes' && measure[key]) {
					clone[key] = cloneVoiceNotes(measure[key]);
				} else {
					clone[key] = measure[key];
				}
			}
		}

		return clone;
	}

	function chooseAdditionalChordForMeasure(options) {
		var report = options.report || {};
		var scaleChords = report.scaleChords || [];
		var scaleNotes = report.scaleNotes || [];
		var candidates = [];
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var previousPlan = measurePlan(options.measure);
		var nextPlan = options.nextMeasure ? measurePlan(options.nextMeasure) : null;
		var progressionState = options.progressionState;
		var initialMidiNote = options.data && options.data.midi ? options.data.midi.initialMidiNote : 60;

		for (var i = 0; i < scaleChords.length; i++) {
			var resolvedDegree;
			var chordPlan;
			var score;

			if (!scaleChords[i] || sameChordFamily(scaleChords[i], options.measure)) {
				continue;
			}

			resolvedDegree = {
				chord: scaleChords[i],
				degree: scaleNotes[i] ? scaleNotes[i].grado : '',
				degreeIndex: i,
				source: 'diatonic'
			};
			chordPlan = buildChordPlan({
				index: 1,
				options: {
					includeTensions: true,
					initialMidiNote: initialMidiNote,
					rng: rng,
					scaleDefinition: report.scaleDefinition,
					scaleNotes: scaleNotes
				},
				previousPlan: previousPlan,
				progressionState: progressionState,
				resolvedDegree: resolvedDegree,
				resolvedDegrees: [
					resolvedDegreeFromMeasure(options.measure, report) || resolvedDegree,
					resolvedDegree,
					resolvedDegreeFromMeasure(options.nextMeasure, report) || resolvedDegree
				]
			});
			score = additionalChordScore({
				chordPlan: chordPlan,
				currentMeasure: options.measure,
				nextMeasure: options.nextMeasure,
				nextPlan: nextPlan,
				progressionState: progressionState,
				report: report,
				resolvedDegree: resolvedDegree,
				rng: rng
			});

			candidates.push({
				chordPlan: chordPlan,
				reportScaleDefinition: report.scaleDefinition,
				resolvedDegree: resolvedDegree,
				score: score
			});
		}

		candidates.sort(function (a, b) {
			return b.score - a.score;
		});

		return candidates.length ? candidates[0] : null;
	}

	function buildProgressionChordMenu(options) {
		var report = options && options.report ? options.report : {};
		var scaleChords = report.scaleChords || [];
		var scaleNotes = report.scaleNotes || [];
		var currentSegment = options ? options.currentSegment : null;
		var currentFunction = currentSegment ? currentSegment.tonalFunction || '' : '';
		var groups = [
			{ id: 'sameFunction', items: [] },
			{ id: 'commonNotes', items: [] },
			{ id: 'remaining', items: [] }
		];
		var usedIndexes = {};

		function pushToGroup(groupIndex, degreeIndex, metadata) {
			var chord = scaleChords[degreeIndex];
			var rawDegree = scaleNotes[degreeIndex] ? scaleNotes[degreeIndex].grado : '';

			if (!chord || usedIndexes[degreeIndex]) {
				return;
			}

			groups[groupIndex].items.push({
				chordName: chord.nombre,
				commonToneCount: metadata && metadata.commonToneCount ? metadata.commonToneCount : 0,
				degree: formatDegreeForChord(rawDegree, chord.nombre),
				degreeIndex: degreeIndex,
				options: chordReplacementOptions(chord, scaleNotes[degreeIndex], degreeIndex)
			});
			usedIndexes[degreeIndex] = true;
		}

		for (var i = 0; i < scaleChords.length; i++) {
			if (currentFunction && tonalFunctionForDegree(report.scaleDefinition, i) === currentFunction) {
				pushToGroup(0, i);
			}
		}

		for (var j = 0; j < scaleChords.length; j++) {
			var commonToneCount = currentSegment ? commonPitchNames(currentSegment, { notes: chordNotes(scaleChords[j]) }).length : 0;

			if (commonToneCount > 0) {
				pushToGroup(1, j, {
					commonToneCount: commonToneCount
				});
			}
		}

		groups[1].items.sort(function (a, b) {
			if (a.commonToneCount !== b.commonToneCount) {
				return b.commonToneCount - a.commonToneCount;
			}

			return a.degreeIndex - b.degreeIndex;
		});

		for (var k = 0; k < scaleChords.length; k++) {
			pushToGroup(2, k);
		}

		return groups;
	}

	function chordReplacementOptions(chord, scaleNote, degreeIndex) {
		var degree = scaleNote ? scaleNote.grado : '';
		var triadLabels = ['', '6', '6/4'];
		var seventhLabels = ['', '6/5', '4/3', '4/2'];
		var options = [];

		for (var i = 0; i < triadLabels.length; i++) {
			options.push({
				degree: displayDegree(formatTriadDegreeForChord(degree, chord.nombre), triadLabels[i], ''),
				degreeIndex: degreeIndex,
				displayName: displayName(triadName(chord), triadLabels[i], '', ''),
				inversionIndex: i,
				inversionLabel: triadLabels[i],
				kind: 'triad'
			});
		}

		for (var j = 0; j < seventhLabels.length; j++) {
			options.push({
				degree: displayDegree(formatDegreeForChord(degree, chord.nombre), seventhLabels[j], ''),
				degreeIndex: degreeIndex,
				displayName: displayName(chord.nombre, seventhLabels[j], '', ''),
				inversionIndex: j,
				inversionLabel: seventhLabels[j],
				kind: 'seventh'
			});
		}

		return options;
	}

	function additionalChordScore(options) {
		var currentCommon = commonPitchNames(options.currentMeasure, options.chordPlan).length;
		var nextCommon = options.nextMeasure ? commonPitchNames(options.chordPlan, options.nextMeasure).length : 0;
		var currentFunction = options.currentMeasure.tonalFunction || '';
		var nextFunction = options.nextMeasure ? options.nextMeasure.tonalFunction || '' : '';
		var candidateFunction = tonalFunctionForDegree(options.report.scaleDefinition, options.resolvedDegree.degreeIndex);
		var score = 0;

		score += currentCommon * 9;
		score += nextCommon * 7;

		if (currentCommon > 0 && (!options.nextMeasure || nextCommon > 0)) {
			score += 10;
		}

		if (candidateFunction && candidateFunction === currentFunction) {
			score += currentFunction === 'T' ? 18 : 8;
		} else if (currentFunction && candidateFunction) {
			score -= currentFunction === 'T' ? 8 : 4;
		}

		if (candidateFunction && candidateFunction === nextFunction) {
			score += 4;
		}

		if (options.nextMeasure && sameChordFamily(options.resolvedDegree.chord, options.nextMeasure)) {
			score -= 16;
		}

		score -= voiceLeadingTransitionScore(options.currentMeasure, options.chordPlan) * 0.45;

		if (options.nextPlan) {
			score -= voiceLeadingTransitionScore(options.chordPlan, options.nextPlan) * 0.35;
		}

		if (currentCommon === 0 && nextCommon === 0) {
			score -= 24;
		}

		score += (typeof options.rng === 'function' ? options.rng() : Math.random()) * 2.5;

		return score;
	}

	function splitMeasureWithAdditionalChord(measure, additionalChord, progression) {
		var splitMeasure = cloneMeasure(measure);
		var secondsPerBeat = Number(progression.secondsPerBeat) || 60 / (Number(progression.bpm) || 120);
		var totalBeats = Number(measure.durationBeats) || Number(progression.beatsPerBar) || 4;
		var halfBeats = totalBeats / 2;
		var startBeat = Number(measure.startBeat) || 0;
		var startSeconds = Number(measure.startSeconds) || 0;
		var halfSeconds = halfBeats * secondsPerBeat;
		var primaryChord = segmentFromMeasure(measure, {
			chordIndex: 0,
			durationBeats: halfBeats,
			durationSeconds: halfSeconds,
			startBeat: startBeat,
			startSeconds: startSeconds
		});
		var extraChord = segmentFromPlan(measure, additionalChord, {
			chordIndex: 1,
			durationBeats: halfBeats,
			durationSeconds: halfSeconds,
			startBeat: startBeat + halfBeats,
			startSeconds: startSeconds + halfSeconds
		});

		splitMeasure.chords = [primaryChord, extraChord];

		return splitMeasure;
	}

	function measureSegments(measure) {
		if (measure && measure.chords && measure.chords.length) {
			return measure.chords.map(cloneMeasure);
		}

		return measure ? [segmentFromMeasure(measure, {
			chordIndex: 0,
			durationBeats: Number(measure.durationBeats) || 4,
			durationSeconds: Number(measure.durationSeconds) || 0,
			startBeat: Number(measure.startBeat) || 0,
			startSeconds: Number(measure.startSeconds) || 0
		})] : [];
	}

	function measureWithSegments(measure, segments, progression) {
		var rebuiltMeasure = cloneMeasure(measure);
		var secondsPerBeat = Number(progression.secondsPerBeat) || 60 / (Number(progression.bpm) || 120);

		if (!segments.length) {
			return rebuiltMeasure;
		}

		rebuiltMeasure = copySegmentToMeasure(rebuiltMeasure, segments[0]);
		if (segments.length === 1) {
			delete rebuiltMeasure.chords;
			return rebuiltMeasure;
		}

		rebuiltMeasure.chords = retimeMeasureChordList(rebuiltMeasure, segments, secondsPerBeat);

		return rebuiltMeasure;
	}

	function buildReplacementSegment(options) {
		var report = options.report || {};
		var scaleChords = report.scaleChords || [];
		var scaleNotes = report.scaleNotes || [];
		var degreeIndex = parseInt(options.replacement.degreeIndex, 10);
		var resolvedDegree;
		var chordPlan;
		var previousPlan;

		if (isNaN(degreeIndex) || !scaleChords[degreeIndex]) {
			return null;
		}

		resolvedDegree = {
			chord: scaleChords[degreeIndex],
			degree: scaleNotes[degreeIndex] ? scaleNotes[degreeIndex].grado : '',
			degreeIndex: degreeIndex,
			source: 'diatonic'
		};
		previousPlan = previousSegmentPlan(options.progression, options.measure.bar, options.chordIndex);
		chordPlan = buildChordPlan({
			index: 1,
			options: {
				forceInversionIndex: parseInt(options.replacement.inversionIndex, 10) || 0,
				forceKind: options.replacement.kind === 'seventh' ? 'seventh' : 'triad',
				includeTensions: false,
				initialMidiNote: options.data && options.data.midi ? options.data.midi.initialMidiNote : 60,
				preventSuspension: true,
				scaleDefinition: report.scaleDefinition,
				scaleNotes: scaleNotes
			},
			previousPlan: previousPlan,
			progressionState: options.progressionState,
			resolvedDegree: resolvedDegree,
			resolvedDegrees: [
				resolvedDegreeFromMeasure(options.segment, report) || resolvedDegree,
				resolvedDegree,
				resolvedDegreeFromMeasure(options.nextMeasure, report) || resolvedDegree
			]
		});

		return segmentFromPlan(options.segment, {
			chordPlan: chordPlan,
			reportScaleDefinition: report.scaleDefinition,
			resolvedDegree: resolvedDegree
		}, {
			chordIndex: options.chordIndex,
			durationBeats: Number(options.segment.durationBeats) || Number(options.measure.durationBeats) || 4,
			durationSeconds: Number(options.segment.durationSeconds) || Number(options.measure.durationSeconds) || 0,
			startBeat: Number(options.segment.startBeat) || Number(options.measure.startBeat) || 0,
			startSeconds: Number(options.segment.startSeconds) || Number(options.measure.startSeconds) || 0
		});
	}

	function replaceSplitMeasureSegment(measure, chordIndex, segment) {
		var replacedMeasure = cloneMeasure(measure);
		var index = Math.min(chordIndex, replacedMeasure.chords.length - 1);

		replacedMeasure.chords[index] = segment;
		if (index === 0) {
			replacedMeasure = copySegmentToMeasure(replacedMeasure, segment);
		}

		return replacedMeasure;
	}

	function replaceWholeMeasure(measure, segment) {
		return copySegmentToMeasure(cloneMeasure(measure), segment);
	}

	function copySegmentToMeasure(measure, segment) {
		var keys = [
			'chord',
			'chordKind',
			'chordName',
			'degree',
			'displayName',
			'inversion',
			'inversionIndex',
			'midiNotes',
			'notes',
			'source',
			'suspension',
			'tonalFunction',
			'voiceNotes',
			'voices'
		];

		for (var i = 0; i < keys.length; i++) {
			measure[keys[i]] = segment[keys[i]];
		}

		measure.pedalsIn = [];
		measure.pedalsOut = [];

		return measure;
	}

	function previousSegmentPlan(progression, bar, chordIndex) {
		var measures = progression && progression.measures ? progression.measures : [];
		var measureIndex = Math.max(0, (Number(bar) || 1) - 1);
		var currentMeasure = measures[measureIndex];
		var previousMeasure;

		if (chordIndex > 0 && currentMeasure && currentMeasure.chords && currentMeasure.chords[chordIndex - 1]) {
			return measurePlan(currentMeasure.chords[chordIndex - 1]);
		}

		previousMeasure = measures[measureIndex - 1];
		if (!previousMeasure) {
			return null;
		}

		if (previousMeasure.chords && previousMeasure.chords.length) {
			return measurePlan(previousMeasure.chords[previousMeasure.chords.length - 1]);
		}

		return measurePlan(previousMeasure);
	}

	function segmentFromMeasure(measure, timing) {
		var segment = cloneMeasure(measure);

		delete segment.chords;
		return extendProgression(segment, {
			chordIndex: timing.chordIndex,
			durationBeats: timing.durationBeats,
			durationSeconds: timing.durationSeconds,
			endBeat: timing.startBeat + timing.durationBeats,
			endSeconds: timing.startSeconds + timing.durationSeconds,
			startBeat: timing.startBeat,
			startSeconds: timing.startSeconds
		});
	}

	function segmentFromPlan(measure, additionalChord, timing) {
		var resolvedDegree = additionalChord.resolvedDegree;
		var chordPlan = additionalChord.chordPlan;

		return {
			articulation: measure.articulation,
			bar: measure.bar,
			beatUnit: measure.beatUnit,
			chord: resolvedDegree.chord,
			chordIndex: timing.chordIndex,
			chordKind: chordPlan.kind,
			chordName: chordPlan.chordName,
			degree: displayDegree(chordPlan.degree, chordPlan.inversionLabel, chordPlan.suspension),
			displayName: displayName(chordPlan.chordName, chordPlan.inversionLabel, chordPlan.suspension, chordPlan.tensionLabel),
			durationBeats: timing.durationBeats,
			durationSeconds: timing.durationSeconds,
			endBeat: timing.startBeat + timing.durationBeats,
			endSeconds: timing.startSeconds + timing.durationSeconds,
			inversion: chordPlan.inversionLabel,
			inversionIndex: chordPlan.inversionIndex,
			midiNotes: chordPlan.midiNotes,
			notes: chordPlan.notes,
			source: resolvedDegree.source || 'diatonic',
			startBeat: timing.startBeat,
			startSeconds: timing.startSeconds,
			suspension: chordPlan.suspension,
			tonalFunction: tonalFunctionForDegree(additionalChord.reportScaleDefinition, resolvedDegree.degreeIndex),
			voiceNotes: chordPlan.voiceNotes,
			voices: measure.voices
		};
	}

	function retimeMeasureChords(measure, secondsPerBeat) {
		var chords = measure.chords || [];

		return retimeMeasureChordList(measure, chords, secondsPerBeat);
	}

	function retimeMeasureChordList(measure, chords, secondsPerBeat) {
		var durationBeats = (Number(measure.durationBeats) || 4) / Math.max(1, chords.length);
		var result = [];

		for (var i = 0; i < chords.length; i++) {
			result.push(segmentFromMeasure(chords[i], {
				chordIndex: i,
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				startBeat: (Number(measure.startBeat) || 0) + (durationBeats * i),
				startSeconds: (Number(measure.startSeconds) || 0) + (durationBeats * secondsPerBeat * i)
			}));
		}

		return result;
	}

	function measurePlan(measure) {
		if (!measure) {
			return null;
		}

		return {
			midiNotes: measure.midiNotes || [],
			notes: measure.notes || [],
			voiceNotes: measure.voiceNotes || []
		};
	}

	function resolvedDegreeFromMeasure(measure, report) {
		var scaleChords = report && report.scaleChords ? report.scaleChords : [];
		var scaleNotes = report && report.scaleNotes ? report.scaleNotes : [];
		var chordName = measure ? measure.chordName : '';

		if (!measure) {
			return null;
		}

		for (var i = 0; i < scaleChords.length; i++) {
			if (scaleChords[i] === measure.chord || triadName(scaleChords[i]) === chordName || scaleChords[i].nombre === chordName) {
				return {
					chord: scaleChords[i],
					degree: scaleNotes[i] ? scaleNotes[i].grado : '',
					degreeIndex: i,
					source: measure.source || 'diatonic'
				};
			}
		}

		return null;
	}

	function sameChordFamily(chord, measure) {
		return measure && (measure.chord === chord || measure.chordName === chord.nombre || measure.chordName === triadName(chord));
	}

	function cloneVoiceNotes(voiceNotes) {
		var result = [];

		for (var i = 0; i < voiceNotes.length; i++) {
			result.push(extendProgression({}, voiceNotes[i]));
		}

		return result;
	}

	function extendProgression(progression, values) {
		var result = {};

		for (var key in progression) {
			if (Object.prototype.hasOwnProperty.call(progression, key)) {
				result[key] = progression[key];
			}
		}

		for (var valueKey in values) {
			if (Object.prototype.hasOwnProperty.call(values, valueKey)) {
				result[valueKey] = values[valueKey];
			}
		}

		return result;
	}

	function clampMeasureIndex(index, length) {
		var numericIndex = parseInt(index, 10);

		if (isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(length - 1, numericIndex));
	}

	function clampChordIndex(index, length) {
		var numericIndex = parseInt(index, 10);

		if (isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(Math.max(0, length - 1), numericIndex));
	}

	function buildMeasures(resolvedDegrees, progressionState, secondsPerBeat, options) {
		var measures = [];
		var previousPlan = null;

		options = options || {};
		for (var i = 0; i < resolvedDegrees.length; i++) {
			var startBeat = i * progressionState.beatsPerBar;
			var durationBeats = progressionState.beatsPerBar;
			var chordPlan = buildChordPlan({
				index: i,
				options: options,
				previousPlan: previousPlan,
				progressionState: progressionState,
				resolvedDegree: resolvedDegrees[i],
				resolvedDegrees: resolvedDegrees
			});

			measures.push({
				articulation: progressionState.articulation,
				bar: i + 1,
				beatUnit: progressionState.beatUnit,
				chord: resolvedDegrees[i].chord,
				chordKind: chordPlan.kind,
				chordName: chordPlan.chordName,
				degree: displayDegree(chordPlan.degree, chordPlan.inversionLabel, chordPlan.suspension),
				displayName: displayName(chordPlan.chordName, chordPlan.inversionLabel, chordPlan.suspension, chordPlan.tensionLabel),
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				endBeat: startBeat + durationBeats,
				endSeconds: (startBeat + durationBeats) * secondsPerBeat,
				inversion: chordPlan.inversionLabel,
				inversionIndex: chordPlan.inversionIndex,
				midiNotes: chordPlan.midiNotes,
				notes: chordPlan.notes,
				source: resolvedDegrees[i].source || 'diatonic',
				startBeat: startBeat,
				startSeconds: startBeat * secondsPerBeat,
				suspension: chordPlan.suspension,
				tonalFunction: tonalFunctionForDegree(options.scaleDefinition, resolvedDegrees[i].degreeIndex),
				voiceNotes: chordPlan.voiceNotes,
				voices: progressionState.voices
			});
			previousPlan = chordPlan;
		}

		return annotateMeasureVoiceLeading(measures, progressionState);
	}

	function attachDegreeIndexes(resolvedDegrees, scaleNotes) {
		var result = [];

		for (var i = 0; i < resolvedDegrees.length; i++) {
			result.push(extendProgression(resolvedDegrees[i], {
				degreeIndex: resolvedDegrees[i].degreeIndex != null ? resolvedDegrees[i].degreeIndex : degreeIndexForDegree(scaleNotes, resolvedDegrees[i].degree)
			}));
		}

		return result;
	}

	function degreeIndexForDegree(scaleNotes, degree) {
		var normalizedDegree = normalizeDegreeName(degree);

		scaleNotes = scaleNotes || [];
		for (var i = 0; i < scaleNotes.length; i++) {
			if (normalizeDegreeName(scaleNotes[i].grado) === normalizedDegree) {
				return i;
			}
		}

		return -1;
	}

	function normalizeDegreeName(degree) {
		return String(degree || '').replace('J', '').replace('M', '').replace('m', '').toUpperCase();
	}

	function tonalFunctionForDegree(scaleDefinition, degreeIndex) {
		var functions;
		var tonalFunction;

		if (!scaleDefinition || scaleDefinition.tonal !== 'true' || !scaleDefinition.funciones || degreeIndex < 0) {
			return '';
		}

		functions = scaleDefinition.funciones.split('-');
		tonalFunction = functions[degreeIndex] || '';

		return tonalFunction === '—' ? '' : tonalFunction;
	}

	function chordNotes(chord) {
		if (!chord) {
			return [];
		}

		return [chord.fundamental, chord.tercera, chord.quinta, chord.septima];
	}

	function triadNotes(chord) {
		if (!chord) {
			return [];
		}

		return [chord.fundamental, chord.tercera, chord.quinta];
	}

	function buildChordPlan(context) {
		var resolvedDegree = context.resolvedDegree;
		var chord = resolvedDegree.chord;
		var useSeventh = context.options.forceKind ? context.options.forceKind === 'seventh' : shouldUseSeventh(context);
		var baseNotes = useSeventh ? chordNotes(chord) : triadNotes(chord);
		var suspension = context.options.preventSuspension ? null : chooseSuspension(context, baseNotes, useSeventh ? 'seventh' : 'triad');

		if (suspension) {
			baseNotes = suspendedNotes(baseNotes, suspension.note);
		}

		var tensionOptions = context.options.includeTensions ? addTensionsToNotes(baseNotes, {
			degreeIndex: resolvedDegree.degreeIndex,
			scaleNotes: context.options.scaleNotes,
			tensions: context.progressionState.tensions,
			voices: context.progressionState.voices
		}) : {
			label: '',
			notes: baseNotes
		};
		var voicing = chooseVoicing({
			baseNotes: baseNotes,
			chordName: chord.nombre,
			extraNotes: tensionOptions.notes.slice(baseNotes.length),
			forceInversionIndex: context.options.forceInversionIndex,
			initialMidiNote: context.options.initialMidiNote || 60,
			kind: useSeventh ? 'seventh' : 'triad',
			previousPlan: context.previousPlan,
			voices: context.progressionState.voices
		});
		var chordName = useSeventh ? chord.nombre : triadName(chord);

		return {
			chordName: chordName,
			degree: formatDegreeForMeasure(resolvedDegree.degree, chord, useSeventh),
			inversionIndex: voicing.inversionIndex,
			inversionLabel: voicing.inversionLabel,
			kind: useSeventh ? 'seventh' : 'triad',
			midiNotes: voicing.midiNotes,
			notes: voicing.notes,
			suspension: suspension ? suspension.label : '',
			tensionLabel: tensionOptions.label,
			voiceNotes: voicing.voiceNotes
		};
	}

	function chooseSuspension(context, baseNotes, kind) {
		var chord = context.resolvedDegree.chord;
		var previousPlan = context.previousPlan;
		var progressionState = context.progressionState;
		var rng = typeof context.options.rng === 'function' ? context.options.rng : function () { return 1; };
		var label;
		var suspensionNote;
		var originalVoicing;
		var suspendedVoicing;
		var probability;

		if (!chord || !previousPlan || !chord.segunda || !chord.cuarta || baseNotes.length < 3) {
			return null;
		}

		if (isTonicBoundary(context.index, context.resolvedDegrees.length, context.resolvedDegree.degreeIndex)) {
			return null;
		}

		label = isMinorQuality(chord.nombre) ? 'sus2' : 'sus4';
		suspensionNote = label === 'sus2' ? chord.segunda : chord.cuarta;
		originalVoicing = chooseVoicing({
			baseNotes: baseNotes,
			chordName: chord.nombre,
			extraNotes: [],
			initialMidiNote: context.options.initialMidiNote || 60,
			kind: kind,
			previousPlan: previousPlan,
			voices: progressionState.voices
		});
		suspendedVoicing = chooseVoicing({
			baseNotes: suspendedNotes(baseNotes, suspensionNote),
			chordName: chord.nombre,
			extraNotes: [],
			initialMidiNote: context.options.initialMidiNote || 60,
			kind: kind,
			previousPlan: previousPlan,
			voices: progressionState.voices
		});
		probability = 0.04 +
			Math.max(0, numberOrDefault(progressionState.counterpoint, 0) - 35) / 260 +
			Math.max(0, numberOrDefault(progressionState.tensions, 0) - 30) / 320;

		if (voiceLeadingTransitionScore(previousPlan, suspendedVoicing) <= voiceLeadingTransitionScore(previousPlan, originalVoicing) + 1) {
			probability += 0.18;
		}

		if (!voiceMovesParsimoniouslyToNote(previousPlan.voiceNotes, suspensionNote, context.options.initialMidiNote || 60)) {
			probability *= 0.35;
		}

		if (rng() >= Math.min(0.55, probability)) {
			return null;
		}

		return {
			label: label,
			note: suspensionNote
		};
	}

	function suspendedNotes(baseNotes, suspensionNote) {
		var result = baseNotes.slice();

		if (result.length > 1) {
			result[1] = suspensionNote;
		}

		return result;
	}

	function voiceMovesParsimoniouslyToNote(voiceNotes, noteName, initialMidiNote) {
		var targetMidi = noteNameToMidi(noteName, initialMidiNote);

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			if (targetMidi != null && Math.abs(nearestMidiTo(voiceNotes[i].midiNote, targetMidi) - voiceNotes[i].midiNote) <= 2) {
				return true;
			}
		}

		return false;
	}

	function shouldUseSeventh(context) {
		var progressionState = context.progressionState;
		var resolvedDegree = context.resolvedDegree;
		var nextResolvedDegree = context.resolvedDegrees[context.index + 1];
		var rng = typeof context.options.rng === 'function' ? context.options.rng : function () { return 1; };
		var degreeIndex = resolvedDegree.degreeIndex;
		var voices = Math.max(1, Math.min(numberOrDefault(progressionState.voices, 4), 6));
		var probability = 0.08;

		if (!resolvedDegree.chord || voices < 4) {
			return false;
		}

		if (isTonicBoundary(context.index, context.resolvedDegrees.length, degreeIndex)) {
			return false;
		}

		probability += Math.max(0, numberOrDefault(progressionState.tensions, 0) - 25) / 250;
		probability += Math.max(0, numberOrDefault(progressionState.counterpoint, 0) - 35) / 350;

		if (degreeIndex === 4 || degreeIndex === 1) {
			probability += 0.14;
		}

		if (nextResolvedDegree && nextResolvedDegree.degreeIndex === 0) {
			probability += 0.12;
		}

		if (seventhImprovesMovement(context)) {
			probability += 0.22;
		}

		return rng() < Math.min(0.72, probability);
	}

	function seventhImprovesMovement(context) {
		var previousPlan = context.previousPlan;
		var chord = context.resolvedDegree.chord;
		var initialMidiNote = context.options.initialMidiNote || 60;
		var voices = context.progressionState.voices;
		var triadVoicing;
		var seventhVoicing;

		if (!previousPlan || !chord) {
			return false;
		}

		triadVoicing = chooseVoicing({
			baseNotes: triadNotes(chord),
			chordName: chord.nombre,
			extraNotes: [],
			initialMidiNote: initialMidiNote,
			kind: 'triad',
			previousPlan: previousPlan,
			voices: voices
		});
		seventhVoicing = chooseVoicing({
			baseNotes: chordNotes(chord),
			chordName: chord.nombre,
			extraNotes: [],
			initialMidiNote: initialMidiNote,
			kind: 'seventh',
			previousPlan: previousPlan,
			voices: voices
		});

		return voiceLeadingTransitionScore(previousPlan, seventhVoicing) + 2 <= voiceLeadingTransitionScore(previousPlan, triadVoicing);
	}

	function isTonicBoundary(index, length, degreeIndex) {
		return degreeIndex === 0 && (index === 0 || index === length - 1);
	}

	function chooseVoicing(options) {
		var labels = options.kind === 'seventh' ? ['', '6/5', '4/3', '4/2'] : ['', '6', '6/4'];
		var maxInversions = Math.min(options.baseNotes.length, labels.length);
		var bestVoicing = null;
		var bestScore = Infinity;
		var forcedInversionIndex = options.forceInversionIndex != null ? clampInversionIndex(options.forceInversionIndex, maxInversions) : null;

		if (forcedInversionIndex != null) {
			bestVoicing = createVoicing({
				baseNotes: options.baseNotes,
				chordName: options.chordName,
				extraNotes: options.extraNotes,
				initialMidiNote: options.initialMidiNote,
				inversionIndex: forcedInversionIndex,
				inversionLabel: labels[forcedInversionIndex],
				kind: options.kind,
				voices: options.voices
			});

			return options.previousPlan ? fitVoicingToPrevious(bestVoicing, options.previousPlan) : bestVoicing;
		}

		for (var i = 0; i < maxInversions; i++) {
			var voicing = createVoicing({
				baseNotes: options.baseNotes,
				chordName: options.chordName,
				extraNotes: options.extraNotes,
				initialMidiNote: options.initialMidiNote,
				inversionIndex: i,
				inversionLabel: labels[i],
				kind: options.kind,
				voices: options.voices
			});
			if (options.previousPlan) {
				voicing = fitVoicingToPrevious(voicing, options.previousPlan);
			}
			var score = options.previousPlan ? voiceLeadingTransitionScore(options.previousPlan, voicing) : firstVoicingScore(voicing);

			if (score < bestScore) {
				bestScore = score;
				bestVoicing = voicing;
			}
		}

		return bestVoicing || createVoicing({
			baseNotes: options.baseNotes,
			chordName: options.chordName,
			extraNotes: options.extraNotes,
			initialMidiNote: options.initialMidiNote,
			inversionIndex: 0,
			inversionLabel: '',
			kind: options.kind,
			voices: options.voices
		});
	}

	function clampInversionIndex(value, maxInversions) {
		var numericValue = parseInt(value, 10);

		if (isNaN(numericValue)) {
			return 0;
		}

		return Math.max(0, Math.min(maxInversions - 1, numericValue));
	}

	function fitVoicingToPrevious(voicing, previousPlan) {
		var fittedMidiNotes = [];
		var fittedVoiceNotes = [];
		var previousMidiNotes = previousPlan.midiNotes || [];

		for (var i = 0; i < voicing.midiNotes.length; i++) {
			var referenceNote = previousMidiNotes[Math.min(i, previousMidiNotes.length - 1)];
			var midiNote = referenceNote != null ? nearestMidiTo(referenceNote, voicing.midiNotes[i]) : voicing.midiNotes[i];

			if (i > 0) {
				while (midiNote <= fittedMidiNotes[i - 1]) {
					midiNote += 12;
				}
			}

			fittedMidiNotes.push(midiNote);
			fittedVoiceNotes.push(extendProgression(voicing.voiceNotes[i], {
				midiNote: midiNote
			}));
		}

		return extendProgression(voicing, {
			midiNotes: fittedMidiNotes,
			voiceNotes: fittedVoiceNotes
		});
	}

	function annotateMeasureVoiceLeading(measures, progressionState) {
		for (var i = 0; i < measures.length; i++) {
			var previousMeasure = measures[i - 1] || null;
			var nextMeasure = measures[i + 1] || null;

			measures[i].pedalsIn = measures[i].pedalsIn || [];
			measures[i].pedalsOut = measures[i].pedalsOut || [];
			measures[i].voiceLeading = {
				commonTones: previousMeasure ? commonVoiceLinks(previousMeasure, measures[i]).length : 0,
				exteriorParallelPerfects: previousMeasure ? countParallelPerfects(previousMeasure.midiNotes, measures[i].midiNotes, true) : 0,
				parallelPerfects: previousMeasure ? countParallelPerfects(previousMeasure.midiNotes, measures[i].midiNotes, false) : 0,
				score: previousMeasure ? voiceLeadingTransitionScore(previousMeasure, measures[i]) : firstVoicingScore(measures[i])
			};

			if (nextMeasure) {
				createPedalsBetween(measures[i], nextMeasure, progressionState);
			}
		}

		return measures;
	}

	function createPedalsBetween(currentMeasure, nextMeasure, progressionState) {
		var links = commonVoiceLinks(currentMeasure, nextMeasure);
		var maxPedals = numberOrDefault(progressionState.counterpoint, 0) >= 70 ? 2 : 1;
		var pedalProbability = 0.16 +
			Math.max(0, numberOrDefault(progressionState.counterpoint, 0) - 20) / 180 +
			Math.max(0, links.length - 1) * 0.12;
		var selectedLinks = links.slice(0, Math.min(maxPedals, links.length));

		if (!selectedLinks.length || pedalProbability < 0.25) {
			return;
		}

		nextMeasure.pedalsIn = nextMeasure.pedalsIn || [];
		nextMeasure.pedalsOut = nextMeasure.pedalsOut || [];

		for (var i = 0; i < selectedLinks.length; i++) {
			var link = selectedLinks[i];
			var pedal = {
				durationSeconds: nextMeasure.durationSeconds,
				fromBar: currentMeasure.bar,
				midiNote: link.midiNote,
				note: link.note,
				toBar: nextMeasure.bar
			};

			alignPedalVoice(nextMeasure, link);
			currentMeasure.pedalsOut.push(pedal);
			nextMeasure.pedalsIn.push(pedal);
		}

		nextMeasure.midiNotes = midiNotesFromVoiceNotes(nextMeasure.voiceNotes);
	}

	function alignPedalVoice(measure, link) {
		for (var i = 0; i < measure.voiceNotes.length; i++) {
			if (normalizePitchName(measure.voiceNotes[i].note) === normalizePitchName(link.note)) {
				measure.voiceNotes[i] = extendProgression(measure.voiceNotes[i], {
					midiNote: link.midiNote,
					role: measure.voiceNotes[i].role + '-pedal'
				});
				return;
			}
		}
	}

	function commonVoiceLinks(firstMeasure, secondMeasure) {
		var links = [];
		var usedSecondVoices = {};

		for (var i = 0; i < (firstMeasure.voiceNotes || []).length; i++) {
			for (var j = 0; j < (secondMeasure.voiceNotes || []).length; j++) {
				if (usedSecondVoices[j] || normalizePitchName(firstMeasure.voiceNotes[i].note) !== normalizePitchName(secondMeasure.voiceNotes[j].note)) {
					continue;
				}

				links.push({
					firstVoiceIndex: i,
					midiNote: firstMeasure.voiceNotes[i].midiNote,
					note: firstMeasure.voiceNotes[i].note,
					secondVoiceIndex: j
				});
				usedSecondVoices[j] = true;
				break;
			}
		}

		return links.sort(function (a, b) {
			return Math.abs(a.firstVoiceIndex - a.secondVoiceIndex) - Math.abs(b.firstVoiceIndex - b.secondVoiceIndex);
		});
	}

	function midiNotesFromVoiceNotes(voiceNotes) {
		var result = [];

		for (var i = 0; i < (voiceNotes || []).length; i++) {
			result.push(voiceNotes[i].midiNote);
		}

		return result;
	}

	function createVoicing(options) {
		var voiceCount = Math.max(1, Math.min(numberOrDefault(options.voices, 4), 6));
		var preparedBase = prepareBaseNotesForVoiceCount(options.baseNotes, options.kind, voiceCount, options.chordName);
		var baseNotes = rotate(preparedBase.notes, options.inversionIndex);
		var notes = baseNotes.slice();
		var factorRoles = rotate(preparedBase.roles, options.inversionIndex);
		var roles = factorRoles.slice();
		var duplicateIndex = 0;
		var duplicatePreference = options.kind === 'triad' ? ['root', 'third', 'fifth'] : ['root', 'third', 'seventh', 'fifth'];
		var midiNotes;
		var voiceNotes = [];

		while (options.kind === 'triad' && notes.length < Math.min(voiceCount, 4) && notes.length > 0) {
			var duplicate = duplicateFactor(options.baseNotes, duplicatePreference[duplicateIndex % duplicatePreference.length], options.kind);
			notes.push(duplicate.note);
			roles.push(duplicate.role + '-doubling');
			duplicateIndex += 1;
		}

		for (var i = 0; i < options.extraNotes.length && notes.length < voiceCount; i++) {
			notes.push(options.extraNotes[i]);
			roles.push('tension');
		}

		while (notes.length < voiceCount && notes.length > 0) {
			duplicate = duplicateFactor(options.baseNotes, duplicatePreference[duplicateIndex % duplicatePreference.length], options.kind);
			notes.push(duplicate.note);
			roles.push(duplicate.role + '-doubling');
			duplicateIndex += 1;
		}

		notes = notes.slice(0, voiceCount);
		roles = roles.slice(0, voiceCount);
		midiNotes = notesToAscendingMidi(notes, options.initialMidiNote, options.inversionIndex);

		for (var j = 0; j < notes.length; j++) {
			voiceNotes.push({
				midiNote: midiNotes[j],
				note: notes[j],
				role: roles[j]
			});
		}

		return {
			inversionIndex: options.inversionIndex,
			inversionLabel: options.inversionLabel,
			midiNotes: midiNotes,
			notes: notes,
			voiceNotes: voiceNotes
		};
	}

	function prepareBaseNotesForVoiceCount(baseNotes, kind, voiceCount, chordName) {
		var roles = factorRolesForKind(kind);
		var selectedNotes = [];
		var selectedRoles = [];
		var allowedRoles;

		if (kind !== 'seventh' || voiceCount !== 3 || baseNotes.length < 4) {
			return {
				notes: baseNotes.slice(),
				roles: roles
			};
		}

		allowedRoles = isDiminishedSeventhQuality(chordName) ?
			{ fifth: true, root: true, third: true } :
			{ root: true, seventh: true, third: true };

		for (var i = 0; i < baseNotes.length; i++) {
			if (allowedRoles[roles[i]]) {
				selectedNotes.push(baseNotes[i]);
				selectedRoles.push(roles[i]);
			}
		}

		return {
			notes: selectedNotes,
			roles: selectedRoles
		};
	}

	function rotate(values, startIndex) {
		var result = [];

		for (var i = 0; i < values.length; i++) {
			result.push(values[(startIndex + i) % values.length]);
		}

		return result;
	}

	function factorRolesForKind(kind) {
		return kind === 'seventh' ? ['root', 'third', 'fifth', 'seventh'] : ['root', 'third', 'fifth'];
	}

	function duplicateFactor(baseNotes, role, kind) {
		var roleIndex = {
			fifth: 2,
			root: 0,
			seventh: kind === 'seventh' ? 3 : 0,
			third: 1
		}[role];

		return {
			note: baseNotes[Math.min(roleIndex, baseNotes.length - 1)] || baseNotes[0],
			role: role
		};
	}

	function notesToAscendingMidi(notes, initialMidiNote, inversionIndex) {
		var result = [];
		var previousNote = null;

		for (var i = 0; i < notes.length; i++) {
			var midiNote = noteNameToMidi(notes[i], initialMidiNote);

			if (midiNote == null) {
				continue;
			}

			midiNote -= 12;

			while (previousNote != null && midiNote <= previousNote) {
				midiNote += 12;
			}

			result.push(midiNote);
			previousNote = midiNote;
		}

		return result;
	}

	function noteNameToMidi(noteName, initialMidiNote) {
		var index = noteIndex(noteName);

		return index == null ? null : initialMidiNote + index;
	}

	function noteIndex(noteName) {
		var indexes = {
			C: 0,
			'C#': 1,
			Db: 1,
			D: 2,
			'D#': 3,
			Eb: 3,
			E: 4,
			F: 5,
			'F#': 6,
			Gb: 6,
			G: 7,
			'G#': 8,
			Ab: 8,
			A: 9,
			'A#': 10,
			Bb: 10,
			B: 11
		};
		var normalizedName = normalizePitchName(noteName);

		return indexes[normalizedName] != null ? indexes[normalizedName] : null;
	}

	function normalizePitchName(noteName) {
		var match = /^([A-G])([#b♯♭]?)/.exec(String(noteName || '').replace('♯', '#').replace('♭', 'b'));

		return match ? match[1] + match[2] : '';
	}

	function transitionScore(previousMidiNotes, nextMidiNotes) {
		var length = Math.min(previousMidiNotes.length, nextMidiNotes.length);
		var score = Math.abs(previousMidiNotes.length - nextMidiNotes.length) * 4;

		for (var i = 0; i < length; i++) {
			score += Math.abs(nearestMidiTo(previousMidiNotes[i], nextMidiNotes[i]) - previousMidiNotes[i]);
		}

		return score;
	}

	function voiceLeadingTransitionScore(previousPlan, nextPlan) {
		var score = transitionScore(previousPlan.midiNotes, nextPlan.midiNotes);
		var commonTones = commonPitchNames(previousPlan.notes, nextPlan.notes).length;
		var parallelPerfects = countParallelPerfects(previousPlan.midiNotes, nextPlan.midiNotes, false);
		var exteriorParallelPerfects = countParallelPerfects(previousPlan.midiNotes, nextPlan.midiNotes, true);

		score -= commonTones * 3;
		score += parallelPerfects * 18;
		score += exteriorParallelPerfects * 28;

		return score;
	}

	function commonPitchNames(firstNotes, secondNotes) {
		var common = [];
		var firstNamesList = noteNamesFromValue(firstNotes);
		var secondNamesList = noteNamesFromValue(secondNotes);
		var secondNames = {};

		for (var i = 0; i < secondNamesList.length; i++) {
			secondNames[normalizePitchName(secondNamesList[i])] = true;
		}

		for (var j = 0; j < firstNamesList.length; j++) {
			var name = normalizePitchName(firstNamesList[j]);

			if (secondNames[name] && common.indexOf(name) === -1) {
				common.push(name);
			}
		}

		return common;
	}

	function noteNamesFromValue(value) {
		var result = [];

		if (!value) {
			return result;
		}

		if (Object.prototype.toString.call(value) === '[object Array]') {
			return value;
		}

		if (value.notes) {
			return value.notes;
		}

		for (var i = 0; i < (value.voiceNotes || []).length; i++) {
			result.push(value.voiceNotes[i].note);
		}

		return result;
	}

	function countParallelPerfects(previousMidiNotes, nextMidiNotes, exteriorOnly) {
		var count = 0;
		var length = Math.min((previousMidiNotes || []).length, (nextMidiNotes || []).length);

		for (var i = 0; i < length; i++) {
			for (var j = i + 1; j < length; j++) {
				if (exteriorOnly && !(i === 0 && j === length - 1)) {
					continue;
				}

				if (isParallelPerfect(previousMidiNotes, nextMidiNotes, i, j)) {
					count += 1;
				}
			}
		}

		return count;
	}

	function isParallelPerfect(previousMidiNotes, nextMidiNotes, lowerIndex, upperIndex) {
		var previousInterval = intervalClass(previousMidiNotes[upperIndex] - previousMidiNotes[lowerIndex]);
		var nextInterval = intervalClass(nextMidiNotes[upperIndex] - nextMidiNotes[lowerIndex]);
		var lowerMotion = nextMidiNotes[lowerIndex] - previousMidiNotes[lowerIndex];
		var upperMotion = nextMidiNotes[upperIndex] - previousMidiNotes[upperIndex];

		if (!isPerfectInterval(previousInterval) || previousInterval !== nextInterval) {
			return false;
		}

		if (lowerMotion === 0 || upperMotion === 0) {
			return false;
		}

		return (lowerMotion > 0 && upperMotion > 0) || (lowerMotion < 0 && upperMotion < 0);
	}

	function intervalClass(interval) {
		return Math.abs(interval) % 12;
	}

	function isPerfectInterval(interval) {
		return interval === 0 || interval === 7;
	}

	function nearestMidiTo(referenceNote, midiNote) {
		var nearest = midiNote;

		while (nearest - referenceNote > 6) {
			nearest -= 12;
		}

		while (referenceNote - nearest > 6) {
			nearest += 12;
		}

		return nearest;
	}

	function firstVoicingScore(voicing) {
		return voicing.inversionIndex * 2 + voiceSpan(voicing.midiNotes) / 12;
	}

	function voiceSpan(midiNotes) {
		if (!midiNotes.length) {
			return 0;
		}

		return midiNotes[midiNotes.length - 1] - midiNotes[0];
	}

	function createGenerationPlan(options) {
		var progressionState = options.progressionState;
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var mode = progressionMode(options.report);
		var pattern = choosePattern({
			mode: mode,
			progressionState: progressionState,
			rng: rng,
			rules: options.rules
		});
		var degrees = progressionState.bars >= 8 ?
			composePhraseBlocks({
				mode: mode,
				pattern: pattern,
				progressionState: progressionState,
				rng: rng,
				rules: options.rules
			}) :
			fitDegreesToBars(pattern, progressionState.bars);

		return {
			degrees: degrees,
			pattern: pattern,
			voiceLeading: voiceLeadingProfile(progressionState)
		};
	}

	function choosePattern(options) {
		var patterns = options.rules && options.rules.patterns ? options.rules.patterns : [];
		var candidates = [];
		var totalWeight = 0;
		var selectedValue;

		for (var i = 0; i < patterns.length; i++) {
			var weight;

			if (!matchesMode(patterns[i], options.mode)) {
				continue;
			}

			weight = adjustedPatternWeight(patterns[i], options.progressionState, options.mode);
			if (weight <= 0) {
				continue;
			}

			candidates.push({
				pattern: patterns[i],
				weight: weight
			});
			totalWeight += candidates[candidates.length - 1].weight;
		}

		if (!candidates.length) {
			return fallbackPatternForStyle(options.progressionState);
		}

		selectedValue = options.rng() * totalWeight;

		for (var j = 0; j < candidates.length; j++) {
			selectedValue -= candidates[j].weight;
			if (selectedValue <= 0) {
				return candidates[j].pattern;
			}
		}

		return candidates[candidates.length - 1].pattern;
	}

	function adjustedPatternWeight(pattern, progressionState, mode) {
		var weight = pattern.weight || 1;

		if (isModernStyle(progressionState) && isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		if (isClassicStyle(progressionState) && !isAuthenticCadence(pattern.cadence)) {
			return 0;
		}

		weight += affinityScore(progressionState.counterpoint, pattern.counterpoint);
		weight += affinityScore(progressionState.modalInterchange, pattern.modalColor);
		weight += affinityScore(progressionState.tensions, pattern.tensionAffinity);
		weight += commonToneDegreeScore(pattern.degrees, progressionState);
		weight *= sensitiveDegreeFactor(pattern.degrees, mode, progressionState);

		if (progressionState.articulation === 'arpeggio' && pattern.form === 'circle-of-fifths') {
			weight += 8;
		}

		if (progressionState.articulation === 'legato' && pattern.cadence === 'authentic') {
			weight += 5;
		}

		if (progressionState.articulation === 'staccato' && pattern.cadence === 'half') {
			weight += 5;
		}

		return Math.max(1, weight);
	}

	function fallbackPatternForStyle(progressionState) {
		if (isModernStyle(progressionState)) {
			return {
				cadence: 'half',
				counterpoint: 70,
				degrees: [0, 3, 1, 4],
				form: 'fallback-modern',
				id: 'fallback-modern-half',
				weight: 1
			};
		}

		return {
			cadence: 'authentic',
			counterpoint: 70,
			degrees: [0, 3, 4, 0],
			form: 'fallback-classic',
			id: 'fallback-classic-authentic',
			weight: 1
		};
	}

	function affinityScore(value, target) {
		return Math.max(0, 18 - Math.abs((Number(value) || 0) - (Number(target) || 0)) / 4);
	}

	function matchesMode(pattern, mode) {
		return !pattern.modes || pattern.modes.indexOf(mode) > -1;
	}

	function progressionMode(report) {
		return report && report.mode === 'M' ? 'major' : 'minor';
	}

	function fitDegreesToBars(pattern, bars) {
		var fitted = [];
		var sourceDegrees = pattern.degrees || [0, 3, 4, 0];
		var normalizedBars = numberOrDefault(bars, sourceDegrees.length);
		var borrowedIndexes = pattern.borrowed || [];

		for (var i = 0; i < normalizedBars; i++) {
			fitted.push({
				index: sourceDegrees[i % sourceDegrees.length],
				source: borrowedIndexes.indexOf(i % sourceDegrees.length) > -1 ? 'parallel' : 'diatonic'
			});
		}

		forceCadentialEnding(fitted, pattern);

		return fitted;
	}

	function composePhraseBlocks(options) {
		var bars = numberOrDefault(options.progressionState.bars, 8);
		var blockCount = Math.ceil(bars / 4);
		var degrees = [];
		var previousBlockId = '';

		for (var blockIndex = 0; blockIndex < blockCount; blockIndex++) {
			var remainingBars = bars - degrees.length;
			var blockLength = Math.min(4, remainingBars);
			var isFinalBlock = blockIndex === blockCount - 1;
			var cadence = isFinalBlock ? finalCadenceForPattern(options.pattern, options.progressionState, options.rng) : chooseIntermediateCadence(options.rng);
			var block = choosePhraseBlock({
				cadence: cadence,
				mode: options.mode,
				previousBlockId: previousBlockId,
				progressionState: options.progressionState,
				rng: options.rng,
				rules: options.rules
			});

			previousBlockId = block.id;
			degrees = degrees.concat(fitBlockToBars(block, blockLength));
		}

		return degrees.slice(0, bars);
	}

	function finalCadenceForPattern(pattern, progressionState, rng) {
		if (isModernStyle(progressionState)) {
			return modernFinalCadence(pattern, rng);
		}

		if (pattern && (pattern.cadence === 'plagal' || pattern.cadence === 'mixed-plagal' || pattern.cadence === 'deceptive')) {
			return pattern.cadence;
		}

		return 'authentic';
	}

	function modernFinalCadence(pattern, rng) {
		var value;

		if (pattern && !isAuthenticCadence(pattern.cadence)) {
			return pattern.cadence === 'mixed-plagal' ? 'plagal' : pattern.cadence;
		}

		value = typeof rng === 'function' ? rng() : Math.random();

		if (value < 0.34) {
			return 'half';
		}

		if (value < 0.68) {
			return 'plagal';
		}

		return 'deceptive';
	}

	function chooseIntermediateCadence(rng) {
		var value = rng();

		if (value < 0.42) {
			return 'half';
		}

		if (value < 0.72) {
			return 'plagal';
		}

		return 'deceptive';
	}

	function choosePhraseBlock(options) {
		var blocks = options.rules && options.rules.phraseBlocks ? options.rules.phraseBlocks : fallbackPhraseBlocks();
		var candidates = [];
		var totalWeight = 0;
		var selectedValue;

		for (var i = 0; i < blocks.length; i++) {
			if (!matchesMode(blocks[i], options.mode) || !matchesCadence(blocks[i], options.cadence)) {
				continue;
			}

			candidates.push({
				block: blocks[i],
				weight: adjustedBlockWeight(blocks[i], options.progressionState, options.previousBlockId, options.mode)
			});
			totalWeight += candidates[candidates.length - 1].weight;
		}

		if (candidates.length > 1) {
			candidates = candidates.filter(function (candidate) {
				return candidate.block.id !== options.previousBlockId;
			});
			totalWeight = sumCandidateWeights(candidates);
		}

		if (!candidates.length) {
			return fallbackPhraseBlocks()[0];
		}

		selectedValue = options.rng() * totalWeight;

		for (var j = 0; j < candidates.length; j++) {
			selectedValue -= candidates[j].weight;
			if (selectedValue <= 0) {
				return candidates[j].block;
			}
		}

		return candidates[candidates.length - 1].block;
	}

	function sumCandidateWeights(candidates) {
		var totalWeight = 0;

		for (var i = 0; i < candidates.length; i++) {
			totalWeight += candidates[i].weight;
		}

		return totalWeight;
	}

	function adjustedBlockWeight(block, progressionState, previousBlockId, mode) {
		var weight = block.weight || 1;

		weight += affinityScore(progressionState.counterpoint, block.counterpoint);
		weight += affinityScore(progressionState.modalInterchange, block.modalColor);
		weight += affinityScore(progressionState.tensions, block.tensionAffinity);
		weight += commonToneDegreeScore(block.degrees, progressionState);
		weight *= sensitiveDegreeFactor(block.degrees, mode, progressionState);

		if (block.id === previousBlockId) {
			weight = Math.max(1, weight * 0.12);
		}

		return Math.max(1, weight);
	}

	function sensitiveDegreeFactor(degrees, mode, progressionState) {
		var sensitiveDegree = mode === 'major' ? 6 : 1;
		var factor = 1;

		if (!isModernStyle(progressionState) || !degrees) {
			return factor;
		}

		for (var i = 0; i < degrees.length; i++) {
			if (degrees[i] === sensitiveDegree) {
				factor *= 0.32;
			}
		}

		return factor;
	}

	function commonToneDegreeScore(degrees, progressionState) {
		var score = 0;
		var affinity = 0.4 + numberOrDefault(progressionState.counterpoint, 0) / 160;

		if (!degrees || degrees.length < 2) {
			return 0;
		}

		for (var i = 1; i < degrees.length; i++) {
			var distance = Math.abs((degrees[i] % 7) - (degrees[i - 1] % 7));
			var circularDistance = Math.min(distance, 7 - distance);

			if (circularDistance === 0) {
				score += 3.5;
			} else if (circularDistance === 2) {
				score += 3;
			} else if (circularDistance === 3) {
				score += 2;
			} else if (circularDistance === 4) {
				score += 1.5;
			}
		}

		return score * affinity;
	}

	function isModernStyle(progressionState) {
		return progressionState && progressionState.style === 'modern';
	}

	function isClassicStyle(progressionState) {
		return progressionState && progressionState.style === 'classic';
	}

	function isAuthenticCadence(cadence) {
		return cadence === 'authentic';
	}

	function matchesCadence(block, cadence) {
		return block.cadence === cadence || (cadence === 'mixed-plagal' && block.cadence === 'plagal');
	}

	function fitBlockToBars(block, bars) {
		var degrees = [];
		var sourceDegrees = block.degrees || [0, 3, 4, 0];
		var borrowedIndexes = block.borrowed || [];

		for (var i = 0; i < bars; i++) {
			degrees.push({
				index: sourceDegrees[i % sourceDegrees.length],
				source: borrowedIndexes.indexOf(i % sourceDegrees.length) > -1 ? 'parallel' : 'diatonic'
			});
		}

		return degrees;
	}

	function fallbackPhraseBlocks() {
		return [
			{ cadence: 'half', degrees: [0, 1, 3, 4], id: 'fallback-half', modes: ['major', 'minor'], weight: 1 },
			{ cadence: 'authentic', degrees: [0, 3, 4, 0], id: 'fallback-authentic', modes: ['major', 'minor'], weight: 1 }
		];
	}

	function forceCadentialEnding(degrees, pattern) {
		if (degrees.length < 2) {
			return;
		}

		if (pattern.cadence === 'authentic') {
			degrees[degrees.length - 2] = { index: 4, source: 'diatonic' };
			degrees[degrees.length - 1] = { index: 0, source: 'diatonic' };
		} else if (pattern.cadence === 'plagal' || pattern.cadence === 'mixed-plagal') {
			degrees[degrees.length - 2] = { index: 3, source: pattern.cadence === 'mixed-plagal' ? 'parallel' : 'diatonic' };
			degrees[degrees.length - 1] = { index: 0, source: 'diatonic' };
		} else if (pattern.cadence === 'deceptive') {
			degrees[degrees.length - 2] = { index: 4, source: 'diatonic' };
			degrees[degrees.length - 1] = { index: 5, source: 'diatonic' };
		} else if (pattern.cadence === 'half') {
			degrees[degrees.length - 1] = { index: 4, source: 'diatonic' };
		}
	}

	function resolveGeneratedDegrees(options) {
		var resolved = [];
		var degrees = options.degrees || [];
		var scaleNotes = options.report.scaleNotes || [];
		var scaleChords = options.report.scaleChords || [];
		var parallelChords = options.report.parallelScaleChords || [];

		for (var i = 0; i < degrees.length; i++) {
			resolved.push({
				chord: degrees[i].source === 'parallel' && parallelChords[degrees[i].index] ? parallelChords[degrees[i].index] : scaleChords[degrees[i].index],
				degree: scaleNotes[degrees[i].index] ? scaleNotes[degrees[i].index].grado : '',
				degreeIndex: degrees[i].index,
				source: degrees[i].source || 'diatonic'
			});
		}

		return resolved;
	}

	function addTensionsToNotes(notes, options) {
		var result = notes.slice();
		var labels = [];
		var maxVoices = Math.max(1, Math.min(numberOrDefault(options.voices, 4), 6));

		if ((Number(options.tensions) || 0) >= 40 && maxVoices >= 5) {
			addScaleNote(result, options.scaleNotes, options.degreeIndex + 1);
			labels.push('add9');
		}

		if ((Number(options.tensions) || 0) >= 70 && maxVoices >= 6) {
			addScaleNote(result, options.scaleNotes, options.degreeIndex + 5);
			labels.push('add13');
		}

		return {
			label: labels.join(' '),
			notes: result.slice(0, maxVoices)
		};
	}

	function addScaleNote(notes, scaleNotes, degreeIndex) {
		var scaleNote = scaleNotes && scaleNotes.length ? scaleNotes[degreeIndex % scaleNotes.length] : null;

		if (scaleNote && notes.indexOf(scaleNote.nombre) === -1) {
			notes.push(scaleNote.nombre);
		}
	}

	function displayDegree(degree, inversionLabel, suspensionLabel) {
		var name = degree || '';

		if (inversionLabel) {
			name += ' ' + inversionLabel;
		}

		return suspensionLabel ? name + ' ' + suspensionLabel : name;
	}

	function displayName(chordName, inversionLabel, suspensionLabel, tensionLabel) {
		var name = chordName || '';

		if (inversionLabel) {
			name += ' ' + inversionLabel;
		}

		if (suspensionLabel) {
			name += ' ' + suspensionLabel;
		}

		return tensionLabel ? name + ' ' + tensionLabel : name;
	}

	function triadName(chord) {
		var chordName = chord ? chord.nombre : '';
		var rootMatch = /^([A-G](#|b|♭)?)/.exec(chordName);
		var root = rootMatch ? rootMatch[1].replace('b', '♭') : chordName;
		var suffix = chordQualitySuffix(chordName);

		if (!root) {
			return '';
		}

		if (suffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0) {
			return root + 'º';
		}

		if (suffix.indexOf('mmaj7') >= 0 || suffix.indexOf('mMaj7') >= 0 || suffix.indexOf('m7') >= 0 || suffix === 'm') {
			return root + 'm';
		}

		if (suffix.indexOf('aug') >= 0 || suffix.indexOf('+') >= 0) {
			return root + '+';
		}

		return root;
	}

	function isMinorQuality(chordName) {
		var suffix = chordQualitySuffix(chordName);
		var lowerSuffix = suffix.toLowerCase();

		if (lowerSuffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0) {
			return true;
		}

		if (lowerSuffix.indexOf('maj') === 0) {
			return false;
		}

		return lowerSuffix.charAt(0) === 'm';
	}

	function isDiminishedSeventhQuality(chordName) {
		var suffix = chordQualitySuffix(chordName);
		var lowerSuffix = suffix.toLowerCase();

		return lowerSuffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0 || suffix.indexOf('7â™­5') >= 0;
	}

	function formatDegreeForMeasure(degree, chord, useSeventh) {
		if (useSeventh) {
			return formatDegreeForChord(degree, chord ? chord.nombre : '');
		}

		return formatTriadDegreeForChord(degree, chord ? chord.nombre : '');
	}

	function formatTriadDegreeForChord(degree, chordName) {
		var cleanDegree = String(degree || '').replace('J', '').replace('M', '').replace('m', '');
		var suffix = chordQualitySuffix(chordName);
		var transformedDegree;

		if (!cleanDegree) {
			return '';
		}

		if (suffix.indexOf('dim') >= 0 || suffix.indexOf('º') >= 0 || suffix.indexOf('7♭5') >= 0) {
			return cleanDegree.toLowerCase() + 'º';
		}

		if (suffix.indexOf('mmaj7') >= 0 || suffix.indexOf('mMaj7') >= 0 || suffix.indexOf('m7') >= 0 || suffix === 'm') {
			transformedDegree = cleanDegree.toLowerCase();
		} else {
			transformedDegree = cleanDegree.toUpperCase();
		}

		if (suffix.indexOf('aug') >= 0 || suffix.indexOf('+') >= 0) {
			transformedDegree += '+';
		}

		return transformedDegree;
	}

	function formatDegreeForChord(degree, chordName) {
		var transformedDegree = '';
		var cleanDegree = String(degree || '').replace('J', '').replace('M', '').replace('m', '');
		var chordQuality = chordQualitySuffix(chordName);

		if (!cleanDegree) {
			return '';
		}

		if (chordName.indexOf('mmaj7') >= 0) {
			transformedDegree = cleanDegree.toLowerCase();
		} else if (chordName.indexOf('maj7') >= 0) {
			transformedDegree = cleanDegree.toUpperCase();
		} else if (chordName.indexOf('m') >= 0) {
			transformedDegree = cleanDegree.toLowerCase();
		} else {
			transformedDegree = cleanDegree.toUpperCase();
		}

		transformedDegree += chordQuality;

		if (transformedDegree.indexOf('m7') >= 0 && transformedDegree.indexOf('dim7') === -1) {
			transformedDegree = transformedDegree.replace('m', '');
		}

		return transformedDegree;
	}

	function chordQualitySuffix(chordName) {
		return String(chordName || '')
			.replace(/^[A-G](#|b|♭)?/, '')
			.replace(/b5/g, '♭5');
	}

	function voiceLeadingProfile(progressionState) {
		if (progressionState.counterpoint >= 70) {
			return 'contrary-stepwise';
		}

		if (progressionState.counterpoint >= 35) {
			return 'balanced';
		}

		return 'homophonic';
	}

	function normalizeProgressionState(progressionState) {
		progressionState = progressionState || {};

		return {
			articulation: progressionState.articulation || 'sustain',
			bars: numberOrDefault(progressionState.bars, 8),
			beatUnit: numberOrDefault(progressionState.beatUnit, meterPart(progressionState.meter, 1, 4)),
			beatsPerBar: numberOrDefault(progressionState.beatsPerBar, meterPart(progressionState.meter, 0, 4)),
			bpm: numberOrDefault(progressionState.bpm, 120),
			counterpoint: numberOrDefault(progressionState.counterpoint, 20),
			meter: progressionState.meter || '4/4',
			modalInterchange: numberOrDefault(progressionState.modalInterchange, 25),
			style: progressionState.style === 'classic' ? 'classic' : 'modern',
			tensions: numberOrDefault(progressionState.tensions, 35),
			voices: numberOrDefault(progressionState.voices, 4)
		};
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	function meterPart(meter, partIndex, fallback) {
		var parts = String(meter || '').split('/');
		var number = Number(parts[partIndex]);

		return isFinite(number) ? number : fallback;
	}

	function findInstrument(data, instrumentId) {
		var instruments = data && data.midiInstruments ? data.midiInstruments : [];

		for (var i = 0; i < instruments.length; i++) {
			if (instruments[i].id === instrumentId) {
				return instruments[i];
			}
		}

		return instruments.length ? instruments[0] : {};
	}

	global.CodaApplication = global.CodaApplication || {};
	global.CodaApplication.addProgressionMeasureChord = addProgressionMeasureChord;
	global.CodaApplication.buildProgressionChordMenu = buildProgressionChordMenu;
	global.CodaApplication.buildProgressionMidiFile = buildProgressionMidiFile;
	global.CodaApplication.buildProgressionFromDegrees = buildProgressionFromDegrees;
	global.CodaApplication.buildProgressionFromState = buildProgressionFromState;
	global.CodaApplication.generateProgressionFromState = generateProgressionFromState;
	global.CodaApplication.formatProgressionDegreeForChord = formatDegreeForChord;
	global.CodaApplication.rebuildProgressionTimeline = rebuildProgressionTimeline;
	global.CodaApplication.removeProgressionMeasureChord = removeProgressionMeasureChord;
	global.CodaApplication.replaceProgressionMeasureChord = replaceProgressionMeasureChord;
	global.CodaApplication.reorderProgressionMeasureChords = reorderProgressionMeasureChords;
	global.CodaApplication.reorderProgressionMeasures = reorderProgressionMeasures;
})(window);
