// Builds per-note playback events, including sustained pedal behavior.
(function (global) {
	'use strict';

	function build(measure, duration, options) {
		var midiNotes = notesForVoices(measure.midiNotes, measure.voices);
		var events = [];
		var melodicVoiceEnabled = !options || options.enableMelodicVoice !== false;
		var usesPatternArticulation = isArpeggioArticulation(measure && measure.articulation) || (measure && measure.articulation === 'staccato');
		var melodicEvents = melodicVoiceEnabled ? (usesPatternArticulation ? legacyPassingNoteEvents(measure) : passingNoteEvents(measure)) : [];
		var hasMelody = melodicVoiceEnabled && hasStructuralMelody(measure, melodicEvents);
		var melodyVoiceIndex = hasMelody ? melodicEventVoiceIndex(measure, melodicEvents) : null;

		if (isArpeggioArticulation(measure && measure.articulation)) {
			return arpeggioNoteEvents(midiNotes, measure, duration, options).concat(melodicEvents);
		}

		if (measure && measure.articulation === 'staccato') {
			return staccatoNoteEvents(midiNotes, measure).concat(melodicEvents);
		}

		if (!hasPedals(measure) || !supportsPedalHold(options ? options.instrument : null)) {
			return hasMelody || melodicEvents.length ? chordAndMelodyNoteEvents(midiNotes, measure, duration, melodicEvents) : [];
		}

		for (var i = 0; i < midiNotes.length; i++) {
			if (i === melodyVoiceIndex) {
				continue;
			}

			if (!forcePedalAttack(options) && isPedalIn(midiNotes[i], measure)) {
				continue;
			}

			events.push({
				duration: duration + pedalOutDuration(midiNotes[i], measure),
				midiNote: midiNotes[i]
			});
		}

		return hasMelody ? events.concat(structuralMelodyNoteEvents(measure, duration, melodicEvents, melodyVoiceIndex)) : events.concat(melodicEvents);
	}

	function chordAndMelodyNoteEvents(midiNotes, measure, duration, melodicEvents) {
		var voiceIndex = melodicEventVoiceIndex(measure, melodicEvents);

		if (voiceIndex == null || !measure.voiceNotes || !measure.voiceNotes[voiceIndex]) {
			return chordNoteEvents(midiNotes, duration).concat(melodicEvents);
		}

		return chordNoteEventsExcept(midiNotes, duration, voiceIndex, accompanimentVelocity(measure)).concat(structuralMelodyNoteEvents(measure, duration, melodicEvents, voiceIndex));
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

	function chordNoteEventsExcept(midiNotes, duration, excludedIndex, velocity) {
		var events = [];

		for (var i = 0; i < midiNotes.length; i++) {
			if (i === excludedIndex) {
				continue;
			}

			var event = {
				duration: duration,
				midiNote: midiNotes[i]
			};

			if (isFinite(Number(velocity))) {
				event.velocity = clampVelocity(velocity);
			}

			events.push(event);
		}

		return events;
	}

	function structuralMelodyNoteEvents(measure, duration, melodicEvents, voiceIndex) {
		var events = [];
		var melodyVelocity = structuralMelodyVelocity(measure);
		var ornamentVelocity = passingMelodyVelocity(measure);
		var structuralNote = measure.voiceNotes[voiceIndex].midiNote;
		var cursor = 0;
		var sortedEvents = clampSequentialMelodicEvents(melodicEvents);

		if (hasPlannedMelodyEvents(sortedEvents)) {
			return plannedMelodyNoteEvents(sortedEvents, duration, melodyVelocity, ornamentVelocity);
		}

		for (var i = 0; i < sortedEvents.length; i++) {
			var eventDelay = Math.max(0, Math.min(duration, sortedEvents[i].delay));
			var eventDuration = boundedEventDuration(sortedEvents[i], eventDelay, duration);

			if (eventDuration <= 0) {
				continue;
			}

			if (eventDelay > cursor) {
				events.push({
					delay: cursor,
					duration: eventDelay - cursor,
					kind: 'melody-structural',
					midiNote: isolatedMelodyMidiNote(structuralNote),
					velocity: melodyVelocity
				});
			}

			events.push({
				delay: eventDelay,
				duration: eventDuration,
				kind: sortedEvents[i].kind || 'passing',
				midiNote: isolatedMelodyMidiNote(sortedEvents[i].midiNote),
				velocity: sortedEvents[i].velocity || ornamentVelocity
			});
			cursor = Math.max(cursor, eventDelay + eventDuration);
		}

		if (cursor < duration && shouldReturnToStructural(sortedEvents)) {
			events.push({
				delay: cursor,
				duration: duration - cursor,
				kind: 'melody-structural',
				midiNote: isolatedMelodyMidiNote(structuralNote),
				velocity: melodyVelocity
			});
		}

		return events;
	}

	function passingNoteEvents(measure) {
		if (measure && measure.melodyEvents && measure.melodyEvents.length) {
			return normalizeMelodicEvents(measure.melodyEvents);
		}

		return legacyPassingNoteEvents(measure);
	}

	function legacyPassingNoteEvents(measure) {
		return normalizeMelodicEvents(measure ? measure.passingNotes || [] : []);
	}

	function normalizeMelodicEvents(sourceEvents) {
		var events = [];

		for (var i = 0; i < sourceEvents.length; i++) {
			var duration = Number(sourceEvents[i].durationSeconds);
			var event = {
				delay: Math.max(0, Number(sourceEvents[i].delaySeconds) || 0),
				duration: isFinite(duration) && duration > 0 ? duration : 0.12,
				kind: sourceEvents[i].kind || 'passing',
				midiNote: sourceEvents[i].midiNote
			};

			if (sourceEvents[i].melodic) {
				event.melodic = true;
			}

			if (sourceEvents[i].rest) {
				event.rest = true;
			}

			if (sourceEvents[i].voiceIndex != null) {
				event.voiceIndex = sourceEvents[i].voiceIndex;
			}

			events.push(event);
		}

		return clampSequentialMelodicEvents(events);
	}

	function clampSequentialMelodicEvents(events) {
		var source = (events || []).slice().sort(function (a, b) {
			return (a.delay || 0) - (b.delay || 0);
		});
		var result = [];

		for (var i = 0; i < source.length; i++) {
			var event = cloneEvent(source[i]);
			var nextDelay = i < source.length - 1 ? Math.max(0, Number(source[i + 1].delay) || 0) : null;

			event.delay = Math.max(0, Number(event.delay) || 0);
			event.duration = Math.max(0, Number(event.duration) || 0);

			if (nextDelay != null) {
				event.duration = Math.min(event.duration, Math.max(0, nextDelay - event.delay));
			}

			if (event.duration > 0.001) {
				result.push(event);
			}
		}

		return result;
	}

	function cloneEvent(event) {
		var result = {};

		for (var key in event || {}) {
			if (Object.prototype.hasOwnProperty.call(event, key)) {
				result[key] = event[key];
			}
		}

		return result;
	}

	function hasPlannedMelodyEvents(events) {
		for (var i = 0; i < (events || []).length; i++) {
			if (events[i].melodic) {
				return true;
			}
		}

		return false;
	}

	function plannedMelodyNoteEvents(events, duration, melodyVelocity, ornamentVelocity) {
		var result = [];

		for (var i = 0; i < events.length; i++) {
			if (events[i].rest || events[i].midiNote == null) {
				continue;
			}

			var eventDelay = Math.max(0, Math.min(duration, events[i].delay || 0));
			var eventDuration = boundedEventDuration(events[i], eventDelay, duration);

			if (eventDuration <= 0) {
				continue;
			}

			result.push({
				delay: eventDelay,
				duration: eventDuration,
				kind: events[i].kind || 'melody-structural',
				midiNote: isolatedMelodyMidiNote(events[i].midiNote),
				velocity: melodyEventVelocity(events[i], melodyVelocity, ornamentVelocity)
			});
		}

		return result;
	}

	function boundedEventDuration(event, delay, maxDuration) {
		return Math.max(0, Math.min(maxDuration - delay, Number(event && event.duration) || 0));
	}

	function melodyEventVelocity(event, melodyVelocity, ornamentVelocity) {
		if (event.kind === 'passing' || event.kind === 'neighbor' || event.kind === 'anticipation' || event.kind === 'anacrusis') {
			return ornamentVelocity;
		}

		return melodyVelocity;
	}

	function isolatedMelodyMidiNote(midiNote) {
		var note = Number(midiNote);

		return isFinite(note) ? note + 12 : midiNote;
	}

	function melodicEventVoiceIndex(measure, melodicEvents) {
		var voiceIndex = measure && measure.melodicVoiceIndex != null ? Number(measure.melodicVoiceIndex) : null;

		if (!isFinite(voiceIndex)) {
			voiceIndex = null;
		}

		for (var i = 0; i < (melodicEvents || []).length; i++) {
			if (melodicEvents[i].voiceIndex != null) {
				voiceIndex = Number(melodicEvents[i].voiceIndex);
				break;
			}
		}

		return isFinite(voiceIndex) ? voiceIndex : null;
	}

	function hasStructuralMelody(measure, melodicEvents) {
		var voiceIndex = melodicEventVoiceIndex(measure, melodicEvents);

		return voiceIndex != null && measure && measure.voiceNotes && measure.voiceNotes[voiceIndex];
	}

	function accompanimentVelocity(measure) {
		return clampVelocity(Math.round(melodicBaseVelocity(measure) * 0.72));
	}

	function structuralMelodyVelocity(measure) {
		return clampVelocity(Math.round(melodicBaseVelocity(measure) * 1.16));
	}

	function passingMelodyVelocity(measure) {
		return clampVelocity(Math.round(melodicBaseVelocity(measure) * 1.04));
	}

	function melodicBaseVelocity(measure) {
		if (!measure || !measure.articulation || measure.articulation === 'sustain') {
			return 80;
		}

		return clampVelocity(Number(measure.intensity) || 80);
	}

	function clampVelocity(value) {
		return Math.max(1, Math.min(127, Math.round(Number(value) || 1)));
	}

	function shouldReturnToStructural(melodicEvents) {
		if (!melodicEvents.length) {
			return true;
		}

		var lastKind = melodicEvents[melodicEvents.length - 1].kind;

		return lastKind === 'neighbor' || lastKind === 'appoggiatura';
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

	function forcePedalAttack(options) {
		return !!(options && options.forcePedalAttack === true);
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
		chordNoteEventsExcept: chordNoteEventsExcept,
		hasStructuralMelody: hasStructuralMelody,
		isArpeggioArticulation: isArpeggioArticulation,
		passingNoteEvents: passingNoteEvents,
		pulseCountForMeasure: pulseCountForMeasure,
		forcePedalAttack: forcePedalAttack,
		supportsPedalHold: supportsPedalHold
	};
})(window);
