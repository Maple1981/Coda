// Application use cases for harmonic progressions.
(function (global) {
	'use strict';

	function buildProgressionFromDegrees(options) {
		return options.domain.resolveProgressionDegrees({
			degrees: options.degrees,
			scaleChords: options.report.scaleChords,
			scaleNotes: options.report.scaleNotes
		});
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
			measures: buildMeasures(resolvedDegrees, progressionState, secondsPerBeat),
			meter: progressionState.meter,
			secondsPerBeat: secondsPerBeat,
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
				voiceLeading: generationPlan.voiceLeading
			},
			harmonicColor: {
				counterpoint: progressionState.counterpoint,
				modalInterchange: progressionState.modalInterchange,
				tensions: progressionState.tensions
			},
			measures: buildMeasures(resolvedDegrees, progressionState, secondsPerBeat, {
				includeTensions: true,
				scaleNotes: options.report.scaleNotes
			}),
			meter: progressionState.meter,
			secondsPerBeat: secondsPerBeat,
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
				clone[key] = key === 'notes' && measure.notes ? measure.notes.slice() : measure[key];
			}
		}

		return clone;
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

	function buildMeasures(resolvedDegrees, progressionState, secondsPerBeat, options) {
		var measures = [];
		var measureOptions;

		options = options || {};
		for (var i = 0; i < resolvedDegrees.length; i++) {
			var startBeat = i * progressionState.beatsPerBar;
			var durationBeats = progressionState.beatsPerBar;
			var notes = chordNotes(resolvedDegrees[i].chord);
			var tensionLabel = '';

			if (options.includeTensions) {
				measureOptions = addTensionsToNotes(notes, {
					degreeIndex: resolvedDegrees[i].degreeIndex,
					scaleNotes: options.scaleNotes,
					tensions: progressionState.tensions,
					voices: progressionState.voices
				});
				notes = measureOptions.notes;
				tensionLabel = measureOptions.label;
			}

			measures.push({
				articulation: progressionState.articulation,
				bar: i + 1,
				beatUnit: progressionState.beatUnit,
				chord: resolvedDegrees[i].chord,
				chordName: resolvedDegrees[i].chord ? resolvedDegrees[i].chord.nombre : '',
				degree: resolvedDegrees[i].degree,
				displayName: displayName(resolvedDegrees[i].chord, tensionLabel),
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				endBeat: startBeat + durationBeats,
				endSeconds: (startBeat + durationBeats) * secondsPerBeat,
				notes: notes,
				source: resolvedDegrees[i].source || 'diatonic',
				startBeat: startBeat,
				startSeconds: startBeat * secondsPerBeat,
				voices: progressionState.voices
			});
		}

		return measures;
	}

	function chordNotes(chord) {
		if (!chord) {
			return [];
		}

		return [chord.fundamental, chord.tercera, chord.quinta, chord.septima];
	}

	function createGenerationPlan(options) {
		var progressionState = options.progressionState;
		var rng = typeof options.rng === 'function' ? options.rng : Math.random;
		var pattern = choosePattern({
			mode: progressionMode(options.report),
			progressionState: progressionState,
			rng: rng,
			rules: options.rules
		});
		var degrees = fitDegreesToBars(pattern, progressionState.bars);

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
			if (!matchesMode(patterns[i], options.mode)) {
				continue;
			}

			candidates.push({
				pattern: patterns[i],
				weight: adjustedPatternWeight(patterns[i], options.progressionState)
			});
			totalWeight += candidates[candidates.length - 1].weight;
		}

		if (!candidates.length) {
			return {
				cadence: 'authentic',
				counterpoint: 70,
				degrees: [0, 3, 4, 0],
				form: 'fallback',
				id: 'fallback-authentic',
				weight: 1
			};
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

	function adjustedPatternWeight(pattern, progressionState) {
		var weight = pattern.weight || 1;

		weight += affinityScore(progressionState.counterpoint, pattern.counterpoint);
		weight += affinityScore(progressionState.modalInterchange, pattern.modalColor);
		weight += affinityScore(progressionState.tensions, pattern.tensionAffinity);

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

	function displayName(chord, tensionLabel) {
		var name = chord ? chord.nombre : '';

		return tensionLabel ? name + ' ' + tensionLabel : name;
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
	global.CodaApplication.buildProgressionMidiFile = buildProgressionMidiFile;
	global.CodaApplication.buildProgressionFromDegrees = buildProgressionFromDegrees;
	global.CodaApplication.buildProgressionFromState = buildProgressionFromState;
	global.CodaApplication.generateProgressionFromState = generateProgressionFromState;
	global.CodaApplication.rebuildProgressionTimeline = rebuildProgressionTimeline;
	global.CodaApplication.reorderProgressionMeasures = reorderProgressionMeasures;
})(window);
