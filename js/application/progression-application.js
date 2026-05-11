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
				degree: formatDegreeForChord(resolvedDegrees[i].degree, resolvedDegrees[i].chord ? resolvedDegrees[i].chord.nombre : ''),
				displayName: displayName(resolvedDegrees[i].chord, tensionLabel),
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				endBeat: startBeat + durationBeats,
				endSeconds: (startBeat + durationBeats) * secondsPerBeat,
				notes: notes,
				source: resolvedDegrees[i].source || 'diatonic',
				startBeat: startBeat,
				startSeconds: startBeat * secondsPerBeat,
				tonalFunction: tonalFunctionForDegree(options.scaleDefinition, resolvedDegrees[i].degreeIndex),
				voices: progressionState.voices
			});
		}

		return measures;
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

	function displayName(chord, tensionLabel) {
		var name = chord ? chord.nombre : '';

		return tensionLabel ? name + ' ' + tensionLabel : name;
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
	global.CodaApplication.buildProgressionMidiFile = buildProgressionMidiFile;
	global.CodaApplication.buildProgressionFromDegrees = buildProgressionFromDegrees;
	global.CodaApplication.buildProgressionFromState = buildProgressionFromState;
	global.CodaApplication.generateProgressionFromState = generateProgressionFromState;
	global.CodaApplication.formatProgressionDegreeForChord = formatDegreeForChord;
	global.CodaApplication.rebuildProgressionTimeline = rebuildProgressionTimeline;
	global.CodaApplication.reorderProgressionMeasures = reorderProgressionMeasures;
})(window);
