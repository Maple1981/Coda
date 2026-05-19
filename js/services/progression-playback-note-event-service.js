// Builds per-note playback events, including sustained pedal behavior.
(function (global) {
	'use strict';

	function build(measure, duration, options) {
		var midiNotes = notesForVoices(measure.midiNotes, measure.voices);
		var events = [];
		var melodicEvents = passingNoteEvents(measure);

		if (isArpeggioArticulation(measure && measure.articulation)) {
			return arpeggioNoteEvents(midiNotes, measure, duration, options).concat(melodicEvents);
		}

		if (measure && measure.articulation === 'staccato') {
			return staccatoNoteEvents(midiNotes, measure).concat(melodicEvents);
		}

		if (!hasPedals(measure) || !supportsPedalHold(options ? options.instrument : null)) {
			return melodicEvents.length ? chordNoteEvents(midiNotes, duration).concat(melodicEvents) : [];
		}

		for (var i = 0; i < midiNotes.length; i++) {
			if (isPedalIn(midiNotes[i], measure)) {
				continue;
			}

			events.push({
				duration: duration + pedalOutDuration(midiNotes[i], measure),
				midiNote: midiNotes[i]
			});
		}

		return events.concat(melodicEvents);
	}

	function staccatoNoteEvents(midiNotes, measure) {
		var pulseCount = pulseCountForMeasure(measure);
		var pulseSeconds = pulseSecondsForMeasure(measure, pulseCount);
		var duration = Math.max(0.05, pulseSeconds * 0.45);
		var events = [];

		for (var pulseIndex = 0; pulseIndex < pulseCount; pulseIndex++) {
			for (var noteIndex = 0; noteIndex < midiNotes.length; noteIndex++) {
				events.push({
					delay: pulseSeconds * pulseIndex,
					duration: duration,
					kind: 'staccato',
					midiNote: midiNotes[noteIndex]
				});
			}
		}

		return events;
	}

	function arpeggioNoteEvents(midiNotes, measure, duration, options) {
		var step = arpeggioStepSeconds(measure, duration, options);
		var order = arpeggioPatternService().orderIndexes(midiNotes.length, measure.articulation, measure.bar);
		var events = [];

		for (var i = 0; i < order.length; i++) {
			var noteIndex = Math.max(0, Math.min(midiNotes.length - 1, order[i]));
			var delay = step * i;

			events.push({
				delay: delay,
				duration: Math.max(0.1, duration - delay),
				kind: 'arpeggio',
				midiNote: midiNotes[noteIndex]
			});
		}

		return events;
	}

	function chordNoteEvents(midiNotes, duration) {
		var events = [];

		for (var i = 0; i < midiNotes.length; i++) {
			events.push({
				duration: duration,
				midiNote: midiNotes[i]
			});
		}

		return events;
	}

	function passingNoteEvents(measure) {
		var events = [];
		var passingNotes = measure.passingNotes || [];

		for (var i = 0; i < passingNotes.length; i++) {
			events.push({
				delay: Math.max(0, Number(passingNotes[i].delaySeconds) || 0),
				duration: Math.max(0.05, Number(passingNotes[i].durationSeconds) || 0.12),
				kind: 'passing',
				midiNote: passingNotes[i].midiNote
			});
		}

		return events;
	}

	function pulseCountForMeasure(measure) {
		return Math.max(1, Math.round(Number(measure && measure.durationBeats) || Number(measure && measure.beatsPerBar) || 1));
	}

	function pulseSecondsForMeasure(measure, pulseCount) {
		var durationSeconds = Number(measure && measure.durationSeconds) || 0;

		if (durationSeconds > 0 && pulseCount > 0) {
			return durationSeconds / pulseCount;
		}

		return 0.5;
	}

	function hasPedals(measure) {
		return (measure.pedalsIn && measure.pedalsIn.length) || (measure.pedalsOut && measure.pedalsOut.length);
	}

	function supportsPedalHold(instrument) {
		return instrument && (instrument.supportsPedalHold === true || instrument.sustained === true || instrument.pedalBehavior === 'sustain');
	}

	function arpeggioStepSeconds(measure, duration, options) {
		var configuredStep = Number(options && options.arpeggioStepSeconds);

		if (isFinite(configuredStep) && configuredStep > 0) {
			return configuredStep;
		}

		return Math.max(0.05, Math.min(0.18, (Number(measure && measure.durationSeconds) || duration || 0) / 8));
	}

	function isArpeggioArticulation(articulation) {
		return String(articulation || '').indexOf('arpeggio') === 0;
	}

	function arpeggioPatternService() {
		return global.CodaProgressionArpeggioPatterns || {
			orderIndexes: ascendingIndexes
		};
	}

	function ascendingIndexes(count) {
		var indexes = [];

		for (var i = 0; i < count; i++) {
			indexes.push(i);
		}

		return indexes;
	}

	function isPedalIn(midiNote, measure) {
		var pedals = measure.pedalsIn || [];

		for (var i = 0; i < pedals.length; i++) {
			if (pedals[i].midiNote === midiNote) {
				return true;
			}
		}

		return false;
	}

	function pedalOutDuration(midiNote, measure) {
		var pedals = measure.pedalsOut || [];
		var duration = 0;

		for (var i = 0; i < pedals.length; i++) {
			if (pedals[i].midiNote === midiNote) {
				duration = Math.max(duration, Number(pedals[i].durationSeconds) || 0);
			}
		}

		return duration;
	}

	function notesForVoices(notes, voices) {
		var voiceCount = Math.max(1, Math.min(Number(voices) || 4, 6));

		return (notes || []).slice(0, voiceCount);
	}

	global.CodaProgressionPlaybackNoteEvents = {
		arpeggioNoteEvents: arpeggioNoteEvents,
		arpeggioStepSeconds: arpeggioStepSeconds,
		build: build,
		chordNoteEvents: chordNoteEvents,
		isArpeggioArticulation: isArpeggioArticulation,
		passingNoteEvents: passingNoteEvents,
		pulseCountForMeasure: pulseCountForMeasure,
		supportsPedalHold: supportsPedalHold
	};
})(window);
