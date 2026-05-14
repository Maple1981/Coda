// Servicio puro de exportación MIDI. Convierte progresiones en eventos MIDI y bytes SMF.
(function (global) {
	'use strict';

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
		var startTick = Math.round(measure.startBeat * options.ticksPerBeat);
		var durationTicks = Math.max(1, Math.round(measure.durationBeats * options.ticksPerBeat * articulationFactor(measure.articulation)));
		var arpeggioStep = measure.articulation === 'arpeggio' ? Math.max(1, Math.round(options.ticksPerBeat / 4)) : 0;

		for (var i = 0; i < notes.length; i++) {
			if (supportsPedalHold(options.instrument) && isPedalIn(notes[i], measure)) {
				continue;
			}

			var noteStart = startTick + (arpeggioStep * i);
			var noteEnd = Math.max(noteStart + 1, startTick + durationTicks + (supportsPedalHold(options.instrument) ? pedalOutTicks(notes[i], measure, options) : 0));

			events.push({
				bar: measure.bar,
				channel: options.channel,
				degree: measure.degree,
				note: notes[i],
				tick: noteStart,
				type: 'noteOn',
				velocity: options.velocity
			});
			events.push({
				bar: measure.bar,
				channel: options.channel,
				degree: measure.degree,
				note: notes[i],
				tick: noteEnd,
				type: 'noteOff',
				velocity: 0
			});
		}

		appendPassingNoteEvents(events, measure, options, startTick);
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
				velocity: Math.max(1, Math.round(options.velocity * 0.82))
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
		return instrument && (instrument.supportsPedalHold === true || instrument.sustained === true || instrument.pedalBehavior === 'sustain');
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

		return noteIndexes[normalizedName] != null ? noteIndexes[normalizedName] : null;
	}

	function normalizeNoteName(noteName) {
		var match = /^([A-G])([#b♯♭]?)/.exec(String(noteName || '').replace('♯', '#').replace('♭', 'b'));

		return match ? match[1] + match[2] : '';
	}

	function articulationFactor(articulation) {
		if (articulation === 'staccato') {
			return 0.45;
		}

		if (articulation === 'arpeggio') {
			return 0.9;
		}

		return 1;
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

	global.CodaMidiExport = {
		articulationFactor: articulationFactor,
		bpmToMicrosecondsPerBeat: bpmToMicrosecondsPerBeat,
		chordNotesToMidi: chordNotesToMidi,
		createProgressionMidiEvents: createProgressionMidiEvents,
		createProgressionMidiFile: createProgressionMidiFile,
		encodeMidiFile: encodeMidiFile,
		mimeType: midiMimeType,
		noteIndex: noteIndex,
		secondsPerBeatForMeasure: secondsPerBeatForMeasure,
		variableLengthQuantity: variableLengthQuantity
	};
})(window);
