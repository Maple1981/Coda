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

	function buildMeasures(resolvedDegrees, progressionState, secondsPerBeat) {
		var measures = [];

		for (var i = 0; i < resolvedDegrees.length; i++) {
			var startBeat = i * progressionState.beatsPerBar;
			var durationBeats = progressionState.beatsPerBar;

			measures.push({
				articulation: progressionState.articulation,
				bar: i + 1,
				beatUnit: progressionState.beatUnit,
				chord: resolvedDegrees[i].chord,
				chordName: resolvedDegrees[i].chord ? resolvedDegrees[i].chord.nombre : '',
				degree: resolvedDegrees[i].degree,
				durationBeats: durationBeats,
				durationSeconds: durationBeats * secondsPerBeat,
				endBeat: startBeat + durationBeats,
				endSeconds: (startBeat + durationBeats) * secondsPerBeat,
				notes: chordNotes(resolvedDegrees[i].chord),
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

	function normalizeProgressionState(progressionState) {
		progressionState = progressionState || {};

		return {
			articulation: progressionState.articulation || 'sustain',
			bars: numberOrDefault(progressionState.bars, 8),
			beatUnit: numberOrDefault(progressionState.beatUnit, meterPart(progressionState.meter, 1, 4)),
			beatsPerBar: numberOrDefault(progressionState.beatsPerBar, meterPart(progressionState.meter, 0, 4)),
			bpm: numberOrDefault(progressionState.bpm, 96),
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
})(window);
