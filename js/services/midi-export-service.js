// Servicio puro de exportación MIDI. Convierte progresiones en eventos MIDI y bytes SMF.
(function (global) {
	'use strict';

	var arpeggioPatterns = global.CodaProgressionArpeggioPatterns;
	var articulationInstruments = global.CodaProgressionArticulationInstruments;
	var noteEventService = global.CodaProgressionPlaybackNoteEvents;
	var defaultTicksPerBeat = 480;
	var midiMimeType = 'audio/midi';
	var noteIndexes = {
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

	function createProgressionMidiFile(options) {
		var events = createProgressionMidiEvents(options);

		return {
			bytes: encodeMidiFile(events, options),
			events: events,
			fileName: options.fileName || 'coda-progression.mid',
			mimeType: midiMimeType
		};
	}

	function createProgressionMidiEvents(options) {
		options = options || {};

		var progression = options.progression || {};
		var measures = progression.measures || [];
		var ticksPerBeat = numberOrDefault(options.ticksPerBeat, defaultTicksPerBeat);
		var channel = clamp(numberOrDefault(options.channel, 0), 0, 15);
		var velocity = clamp(numberOrDefault(options.velocity, 96), 1, 127);
		var initialMidiNote = numberOrDefault(options.initialMidiNote, 60);
		var instrument = options.instrument || {};
		var events = [
			{
				microsecondsPerBeat: bpmToMicrosecondsPerBeat(progression.bpm || options.bpm || 96),
				tick: 0,
				type: 'setTempo'
			},
			{
				denominator: progression.beatUnit || 4,
				numerator: progression.beatsPerBar || 4,
				tick: 0,
				type: 'timeSignature'
			},
			{
				channel: channel,
				program: clamp(numberOrDefault(options.program, instrument.program || 0), 0, 127),
				tick: 0,
				type: 'programChange'
			}
		];

		for (var i = 0; i < measures.length; i++) {
			appendMeasureEvents(events, measures[i], {
				channel: channel,
				initialMidiNote: initialMidiNote,
				articulationInstruments: options.articulationInstruments || [],
				instrument: instrument,
				nextMeasure: measures[i + 1] || null,
				ticksPerBeat: ticksPerBeat,
				velocity: velocity
			});
		}

		return sortEvents(events);
	}

	function appendMeasureEvents(events, measure, options) {
		var chords = measure.chords && measure.chords.length ? measure.chords : [measure];

		for (var chordIndex = 0; chordIndex < chords.length; chordIndex++) {
			appendChordEvents(events, chords[chordIndex], options);
		}
	}

	function appendChordEvents(events, measure, options) {
		var notes = measure.midiNotes && measure.midiNotes.length ? measure.midiNotes.slice() : chordNotesToMidi(measure.notes || [], options.initialMidiNote);
		var startTick = Math.max(0, Math.round(measure.startBeat * options.ticksPerBeat) + expressiveDelayTicks(measure, options));
		var durationTicks = Math.max(1, Math.round(measure.durationBeats * options.ticksPerBeat * articulationFactor(measure.articulation)));
		var arpeggioStep = isArpeggioArticulation(measure.articulation) ? Math.max(1, Math.round(options.ticksPerBeat / 4)) : 0;
		var order = isArpeggioArticulation(measure.articulation) ? arpeggioOrderIndexes(notes.length, measure.articulation, measure.bar) : arpeggioPatterns.ascendingIndexes(notes.length);
		var velocity = expressiveVelocity(measure, options.velocity);
		var playbackInstrument = articulationInstruments.resolveInstrument(options.instrument, measure.articulation, options.articulationInstruments);
		var sharedNoteEvents;

		appendProgramChange(events, playbackInstrument, options.channel, startTick);

		if (shouldUseSharedNoteEvents(measure, options.instrument)) {
			sharedNoteEvents = noteEventService.build(measureWithMidiNotes(measure, notes, options), ticksToSeconds(durationTicks, measure, options), {
				arpeggioStepSeconds: secondsPerBeatForMeasure(measure) / 4,
				instrument: options.instrument
			});
			appendSharedNoteEvents(events, sharedNoteEvents, measure, options, startTick, velocity);
			return;
		}

		for (var i = 0; i < order.length; i++) {
			var noteIndex = Math.max(0, Math.min(notes.length - 1, order[i]));
			var note = notes[noteIndex];

			if (supportsPedalHold(options.instrument) && isPedalIn(note, measure)) {
				continue;
			}

			var noteStart = startTick + (arpeggioStep * i);
			var noteEnd = Math.max(noteStart + 1, startTick + durationTicks + (supportsPedalHold(options.instrument) ? pedalOutTicks(note, measure, options) : 0));

			events.push({
				bar: measure.bar,
				channel: options.channel,
				degree: measure.degree,
				note: note,
				tick: noteStart,
				type: 'noteOn',
				velocity: velocity
			});
			events.push({
				bar: measure.bar,
				channel: options.channel,
				degree: measure.degree,
				note: note,
				tick: noteEnd,
				type: 'noteOff',
				velocity: 0
			});
		}

		appendPassingNoteEvents(events, measure, options, startTick);
	}

	function shouldUseSharedNoteEvents(measure, instrument) {
		return measure.articulation === 'staccato' ||
			isArpeggioArticulation(measure.articulation) ||
			(hasPedals(measure) && supportsPedalHold(instrument)) ||
			(!isArpeggioArticulation(measure.articulation) && measure.passingNotes && measure.passingNotes.length);
	}

	function hasPedals(measure) {
		return (measure && measure.pedalsIn && measure.pedalsIn.length) ||
			(measure && measure.pedalsOut && measure.pedalsOut.length);
	}

	function measureWithMidiNotes(measure, midiNotes, options) {
		var result = {};
		var key;

		for (key in measure || {}) {
			if (Object.prototype.hasOwnProperty.call(measure, key)) {
				result[key] = measure[key];
			}
		}

		result.midiNotes = midiNotes;
		result.pedalsOut = pedalsWithDurationFallback(result.pedalsOut, options);

		return result;
	}

	function pedalsWithDurationFallback(pedals, options) {
		var fallbackDuration = options && options.nextMeasure ?
			(Number(options.nextMeasure.durationSeconds) || ((Number(options.nextMeasure.durationBeats) || 0) * secondsPerBeatForMeasure(options.nextMeasure))) :
			0;
		var result = [];

		for (var i = 0; i < (pedals || []).length; i++) {
			var pedal = shallowClone(pedals[i]);

			if (!pedal.durationSeconds && fallbackDuration) {
				pedal.durationSeconds = fallbackDuration;
			}

			result.push(pedal);
		}

		return result;
	}

	function shallowClone(source) {
		var result = {};

		for (var key in source || {}) {
			if (Object.prototype.hasOwnProperty.call(source, key)) {
				result[key] = source[key];
			}
		}

		return result;
	}

	function appendSharedNoteEvents(events, noteEvents, measure, options, startTick, velocity) {
		var secondsPerBeat = secondsPerBeatForMeasure(measure);

		for (var i = 0; i < noteEvents.length; i++) {
			var noteStart = startTick + secondsToTicks(noteEvents[i].delay || 0, secondsPerBeat, options);
			var noteEnd = Math.max(noteStart + 1, noteStart + secondsToTicks(noteEvents[i].duration || 0, secondsPerBeat, options));

			events.push({
				bar: measure.bar,
				channel: options.channel,
				degree: measure.degree,
				note: noteEvents[i].midiNote,
				tick: noteStart,
				type: 'noteOn',
				velocity: noteEvents[i].velocity || (noteEvents[i].kind === 'passing' ? Math.max(1, Math.round(velocity * 0.82)) : velocity)
			});
			events.push({
				bar: measure.bar,
				channel: options.channel,
				degree: measure.degree,
				note: noteEvents[i].midiNote,
				tick: noteEnd,
				type: 'noteOff',
				velocity: 0
			});
		}
	}

	function secondsToTicks(seconds, secondsPerBeat, options) {
		return Math.round((Math.max(0, Number(seconds) || 0) / secondsPerBeat) * options.ticksPerBeat);
	}

	function ticksToSeconds(ticks, measure, options) {
		return (Math.max(0, Number(ticks) || 0) / options.ticksPerBeat) * secondsPerBeatForMeasure(measure);
	}

	function appendStaccatoChordEvents(events, notes, measure, options, startTick, velocity) {
		var pulseCount = pulseCountForMeasure(measure);
		var pulseTicks = Math.max(1, Math.round((Number(measure.durationBeats) || pulseCount) * options.ticksPerBeat / pulseCount));
		var durationTicks = Math.max(1, Math.round(pulseTicks * 0.45));

		for (var pulseIndex = 0; pulseIndex < pulseCount; pulseIndex++) {
			for (var noteIndex = 0; noteIndex < notes.length; noteIndex++) {
				var noteStart = startTick + (pulseTicks * pulseIndex);
				var noteEnd = noteStart + durationTicks;

				events.push({
					bar: measure.bar,
					channel: options.channel,
					degree: measure.degree,
					note: notes[noteIndex],
					tick: noteStart,
					type: 'noteOn',
					velocity: velocity
				});
				events.push({
					bar: measure.bar,
					channel: options.channel,
					degree: measure.degree,
					note: notes[noteIndex],
					tick: noteEnd,
					type: 'noteOff',
					velocity: 0
				});
			}
		}
	}

	function appendProgramChange(events, instrument, channel, tick) {
		if (!instrument || instrument.program === undefined) {
			return;
		}

		events.push({
			channel: channel,
			program: clamp(numberOrDefault(instrument.program, 0), 0, 127),
			tick: tick,
			type: 'programChange'
		});
	}

	function appendPassingNoteEvents(events, measure, options, startTick) {
		var passingNotes = measure.passingNotes || [];
		var secondsPerBeat = secondsPerBeatForMeasure(measure);

		for (var i = 0; i < passingNotes.length; i++) {
			var delayTicks = Math.round((Math.max(0, Number(passingNotes[i].delaySeconds) || 0) / secondsPerBeat) * options.ticksPerBeat);
			var durationTicks = Math.max(1, Math.round((Math.max(0.05, Number(passingNotes[i].durationSeconds) || 0.12) / secondsPerBeat) * options.ticksPerBeat));
			var noteStart = startTick + delayTicks;
			var noteEnd = noteStart + durationTicks;

			events.push({
				bar: measure.bar,
				channel: options.channel,
				degree: measure.degree,
				note: passingNotes[i].midiNote,
				tick: noteStart,
				type: 'noteOn',
				velocity: Math.max(1, Math.round(expressiveVelocity(measure, options.velocity) * 0.82))
			});
			events.push({
				bar: measure.bar,
				channel: options.channel,
				degree: measure.degree,
				note: passingNotes[i].midiNote,
				tick: noteEnd,
				type: 'noteOff',
				velocity: 0
			});
		}
	}

	function secondsPerBeatForMeasure(measure) {
		var durationSeconds = Number(measure.durationSeconds) || 0;
		var durationBeats = Number(measure.durationBeats) || 0;

		return durationSeconds > 0 && durationBeats > 0 ? durationSeconds / durationBeats : 0.5;
	}

	function pulseCountForMeasure(measure) {
		return Math.max(1, Math.round(Number(measure && measure.durationBeats) || Number(measure && measure.beatsPerBar) || 1));
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

	function supportsPedalHold(instrument) {
		return noteEventService.supportsPedalHold(instrument);
	}

	function pedalOutTicks(midiNote, measure, options) {
		var pedals = measure.pedalsOut || [];
		var ticks = 0;

		for (var i = 0; i < pedals.length; i++) {
			if (pedals[i].midiNote === midiNote) {
				ticks = Math.max(ticks, nextMeasureDurationTicks(options));
			}
		}

		return ticks;
	}

	function nextMeasureDurationTicks(options) {
		if (!options.nextMeasure) {
			return 0;
		}

		return Math.max(0, Math.round((Number(options.nextMeasure.durationBeats) || 0) * options.ticksPerBeat));
	}

	function encodeMidiFile(events, options) {
		options = options || {};

		var ticksPerBeat = numberOrDefault(options.ticksPerBeat, defaultTicksPerBeat);
		var trackBytes = encodeTrack(sortEvents(events || []));

		return toUint8Array(
			asciiBytes('MThd')
				.concat(uint32Bytes(6))
				.concat(uint16Bytes(0))
				.concat(uint16Bytes(1))
				.concat(uint16Bytes(ticksPerBeat))
				.concat(asciiBytes('MTrk'))
				.concat(uint32Bytes(trackBytes.length))
				.concat(trackBytes)
		);
	}

	function encodeTrack(events) {
		var bytes = [];
		var lastTick = 0;

		for (var i = 0; i < events.length; i++) {
			bytes = bytes.concat(variableLengthQuantity(events[i].tick - lastTick));
			bytes = bytes.concat(encodeEvent(events[i]));
			lastTick = events[i].tick;
		}

		bytes = bytes.concat(variableLengthQuantity(0));
		bytes = bytes.concat([0xFF, 0x2F, 0x00]);

		return bytes;
	}

	function encodeEvent(event) {
		if (event.type === 'setTempo') {
			return [0xFF, 0x51, 0x03].concat(uint24Bytes(event.microsecondsPerBeat));
		}

		if (event.type === 'timeSignature') {
			return [0xFF, 0x58, 0x04, event.numerator, denominatorPower(event.denominator), 24, 8];
		}

		if (event.type === 'programChange') {
			return [0xC0 | event.channel, event.program];
		}

		if (event.type === 'noteOn') {
			return [0x90 | event.channel, event.note, event.velocity];
		}

		if (event.type === 'noteOff') {
			return [0x80 | event.channel, event.note, event.velocity || 0];
		}

		return [];
	}

	function chordNotesToMidi(noteNames, initialMidiNote) {
		var notes = [];
		var previousNote = null;

		for (var i = 0; i < noteNames.length; i++) {
			var index = noteIndex(noteNames[i]);
			var midiNote;

			if (index == null) {
				continue;
			}

			midiNote = initialMidiNote + index;

			while (previousNote != null && midiNote <= previousNote) {
				midiNote += 12;
			}

			notes.push(midiNote);
			previousNote = midiNote;
		}

		return notes;
	}

	function noteIndex(noteName) {
		var normalizedName = normalizeNoteName(noteName);

		return noteIndexes[normalizedName] != null ? noteIndexes[normalizedName] : parsedNoteIndex(normalizedName);
	}

	function normalizeNoteName(noteName) {
		var normalized = String(noteName || '')
			.replace(/\uD834\uDD2A/g, '##')
			.replace(/\uD834\uDD2B/g, 'bb')
			.replace(/♯/g, '#')
			.replace(/♭/g, 'b');
		var match = /^([A-G])([#b]{0,2})/.exec(normalized);

		return match ? match[1] + match[2] : '';
	}

	function parsedNoteIndex(noteName) {
		var match = /^([A-G])([#b]{0,2})$/.exec(noteName || '');
		var naturalIndexes = {
			C: 0,
			D: 2,
			E: 4,
			F: 5,
			G: 7,
			A: 9,
			B: 11
		};
		var index;

		if (!match || naturalIndexes[match[1]] == null) {
			return null;
		}

		index = naturalIndexes[match[1]] + accidentalOffset(match[2]);
		index %= 12;

		return index < 0 ? index + 12 : index;
	}

	function accidentalOffset(accidental) {
		var offset = 0;

		for (var i = 0; i < String(accidental || '').length; i++) {
			offset += accidental.charAt(i) === '#' ? 1 : -1;
		}

		return offset;
	}

	function articulationFactor(articulation) {
		if (articulation === 'staccato') {
			return 0.45;
		}

		if (isArpeggioArticulation(articulation)) {
			return 0.9;
		}

		return 1;
	}

	function expressiveVelocity(measure, fallbackVelocity) {
		var base = measure && measure.intensity != null ? Number(measure.intensity) : fallbackVelocity;
		var humanization = Math.max(0, Math.min(100, Number(measure && measure.humanization) || 0));
		var offset = humanization ? deterministicOffset(measure, 9) * Math.min(12, humanization / 8) : 0;

		return clamp(Math.round((isFinite(base) ? base : fallbackVelocity) + offset), 1, 127);
	}

	function expressiveDelayTicks(measure, options) {
		var humanization = Math.max(0, Math.min(100, Number(measure && measure.humanization) || 0));
		var swing = Math.max(0, Math.min(75, Number(measure && measure.swing) || 0));
		var humanized = humanization ? deterministicOffset(measure, 17) * Math.min(options.ticksPerBeat * 0.08, humanization * 0.4) : 0;
		var localBeat = Math.abs((Number(measure && measure.startBeat) || 0) % (Number(measure && measure.beatsPerBar) || 4));
		var fractional = localBeat - Math.floor(localBeat);
		var swingTicks = swing && Math.abs(fractional - 0.5) <= 0.01 ? options.ticksPerBeat * (swing / 100) * 0.33 : 0;

		return Math.round(humanized + swingTicks);
	}

	function deterministicOffset(measure, salt) {
		var seed = ((Number(measure && measure.bar) || 0) * 31) + salt;
		var value = Math.sin(seed) * 10000;

		return (value - Math.floor(value)) * 2 - 1;
	}

	function bpmToMicrosecondsPerBeat(bpm) {
		return Math.round(60000000 / Math.max(1, numberOrDefault(bpm, 96)));
	}

	function denominatorPower(denominator) {
		return Math.round(Math.log(numberOrDefault(denominator, 4)) / Math.log(2));
	}

	function sortEvents(events) {
		return events.slice().sort(function (a, b) {
			if (a.tick !== b.tick) {
				return a.tick - b.tick;
			}

			return eventPriority(a.type) - eventPriority(b.type);
		});
	}

	function eventPriority(type) {
		var priorities = {
			setTempo: 0,
			timeSignature: 1,
			programChange: 2,
			noteOff: 3,
			noteOn: 4
		};

		return priorities[type] != null ? priorities[type] : 9;
	}

	function variableLengthQuantity(value) {
		var buffer = value & 0x7F;
		var bytes = [];

		while ((value = value >> 7)) {
			buffer <<= 8;
			buffer |= ((value & 0x7F) | 0x80);
		}

		while (true) {
			bytes.push(buffer & 0xFF);

			if (buffer & 0x80) {
				buffer >>= 8;
			} else {
				break;
			}
		}

		return bytes;
	}

	function asciiBytes(text) {
		var bytes = [];

		for (var i = 0; i < text.length; i++) {
			bytes.push(text.charCodeAt(i));
		}

		return bytes;
	}

	function uint16Bytes(value) {
		return [
			(value >> 8) & 0xFF,
			value & 0xFF
		];
	}

	function uint24Bytes(value) {
		return [
			(value >> 16) & 0xFF,
			(value >> 8) & 0xFF,
			value & 0xFF
		];
	}

	function uint32Bytes(value) {
		return [
			(value >> 24) & 0xFF,
			(value >> 16) & 0xFF,
			(value >> 8) & 0xFF,
			value & 0xFF
		];
	}

	function toUint8Array(bytes) {
		return new Uint8Array(bytes);
	}

	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	function numberOrDefault(value, fallback) {
		var number = Number(value);

		return isFinite(number) ? number : fallback;
	}

	function isArpeggioArticulation(articulation) {
		return String(articulation || '').indexOf('arpeggio') === 0;
	}

	function arpeggioPattern(articulation) {
		return arpeggioPatterns.pattern(articulation);
	}

	function arpeggioOrderIndexes(noteCount, articulation, seed) {
		return arpeggioPatterns.orderIndexes(noteCount, articulation, seed);
	}

	global.CodaMidiExport = {
		arpeggioOrderIndexes: arpeggioOrderIndexes,
		arpeggioPattern: arpeggioPattern,
		articulationFactor: articulationFactor,
		bpmToMicrosecondsPerBeat: bpmToMicrosecondsPerBeat,
		chordNotesToMidi: chordNotesToMidi,
		createProgressionMidiEvents: createProgressionMidiEvents,
		createProgressionMidiFile: createProgressionMidiFile,
		encodeMidiFile: encodeMidiFile,
		expressiveDelayTicks: expressiveDelayTicks,
		expressiveVelocity: expressiveVelocity,
		isArpeggioArticulation: isArpeggioArticulation,
		mimeType: midiMimeType,
		noteIndex: noteIndex,
		secondsPerBeatForMeasure: secondsPerBeatForMeasure,
		shouldUseSharedNoteEvents: shouldUseSharedNoteEvents,
		variableLengthQuantity: variableLengthQuantity
	};
})(window);
