// Playback service for browser audio preview. MIDI.js remains the current
// engine, but app code should depend on this small facade instead.
(function (global) {
	'use strict';

	function defaultValue(value, fallback) {
		return value !== undefined ? value : fallback;
	}

	function clamp(value, min, max) {
		return Math.max(min, Math.min(max, value));
	}

	function normalizeVolumePercent(value) {
		var numericValue = Number(value);

		if (isNaN(numericValue)) {
			return 100;
		}

		return clamp(numericValue, 0, 100);
	}

	function create(options) {
		var midi = options.midi;
		var notes = options.notes || [];
		var instruments = (options.instruments || []).concat(options.articulationInstruments || []);
		var channel = defaultValue(options.channel, 0);
		var baseVelocity = defaultValue(options.velocity, 127);
		var volumePercent = normalizeVolumePercent(defaultValue(options.volumePercent, 100));
		var delay = defaultValue(options.delay, 0);
		var initialMidiNote = defaultValue(options.initialMidiNote, 60);
		var activeInstrument = options.instrument || 'acoustic_grand_piano';
		var loadingInstruments = {};
		var loadedInstruments = {};
		var readyCallbacks = {};
		var metronomeAudioContext = null;

		function load(callback) {
			return loadInstrument(activeInstrument, callback);
		}

		function loadInstruments(instrumentIds, callback) {
			var pending = uniqueInstrumentIds(instrumentIds);
			var remaining = pending.length;

			if (!remaining) {
				runCallback(callback);
				return true;
			}

			for (var i = 0; i < pending.length; i++) {
				loadInstrument(pending[i], function () {
					remaining -= 1;

					if (remaining === 0) {
						runCallback(callback);
					}
				});
			}

			return true;
		}

		function loadInstrument(instrumentId, callback) {
			if (loadedInstruments[instrumentId]) {
				applyInstrument(instrumentId);
				runCallback(callback);
				return true;
			}

			if (typeof callback === 'function') {
				addReadyCallback(instrumentId, callback);
			}

			if (loadingInstruments[instrumentId]) {
				return true;
			}

			if (!midi || typeof midi.loadPlugin !== 'function') {
				readyCallbacks[instrumentId] = [];
				return false;
			}

			loadingInstruments[instrumentId] = true;
			midi.loadPlugin({
				api: options.api || 'webaudio',
				soundfontUrl: options.soundfontUrl || './soundfont/',
				instrument: instrumentId,
				onprogress: options.onprogress || function () {},
				onsuccess: function () {
					loadingInstruments[instrumentId] = false;
					loadedInstruments[instrumentId] = true;
					if (activeInstrument === instrumentId) {
						applyInstrument(instrumentId);
					}
					if (typeof midi.setVolume === 'function') {
						midi.setVolume(channel, currentVelocity());
					}

					if (typeof options.onsuccess === 'function') {
						options.onsuccess(instrumentId);
					}

					flushReadyCallbacks(instrumentId);
				}
			});

			return true;
		}

		function applyInstrument(instrumentId) {
			var instrument = findInstrument(instrumentId);

			if (midi && typeof midi.programChange === 'function' && instrument && instrument.program !== undefined) {
				midi.programChange(channel, instrument.program);
			}

			applyChannelInstrumentMetadata(instrument);
		}

		function applyChannelInstrumentMetadata(instrument) {
			var midiChannel = midi && midi.channels ? midi.channels[channel] : null;

			if (!midiChannel || !instrument) {
				return;
			}

			midiChannel.codaInstrumentId = instrument.id || '';
			midiChannel.codaSoundEnvelope = instrument.soundEnvelope || (instrument.sustained ? 'sustained' : 'percussive');
			midiChannel.codaSustainedInstrument = instrument.sustained === true ||
				instrument.supportsPedalHold === true ||
				instrument.pedalBehavior === 'sustain' ||
				instrument.soundEnvelope === 'sustained';
		}

		function findInstrument(instrumentId) {
			for (var i = 0; i < instruments.length; i++) {
				if (instruments[i].id === instrumentId) {
					return instruments[i];
				}
			}

			if (midi && midi.GM && midi.GM.byName && midi.GM.byName[instrumentId]) {
				return {
					id: instrumentId,
					program: midi.GM.byName[instrumentId].number
				};
			}

			return {
				id: instrumentId
			};
		}

		function noteNameToMidi(noteName, offset) {
			var parsedIndex = parsedNoteIndex(noteName);

			if (notes._codaIndex && notes._codaIndex.indexByName && notes._codaIndex.indexByName[noteName] !== undefined) {
				return initialMidiNote + defaultValue(offset, 0) + notes._codaIndex.indexByName[noteName];
			}

			for (var i = 0; i < notes.length; i++) {
				if (notes[i].nombre === noteName || notes[i].enarmonica === noteName) {
					return initialMidiNote + defaultValue(offset, 0) + i;
				}
			}

			if (parsedIndex != null) {
				return initialMidiNote + defaultValue(offset, 0) + parsedIndex;
			}
		}

		function parsedNoteIndex(noteName) {
			var normalized = String(noteName || '')
				.replace(/\uD834\uDD2A/g, '##')
				.replace(/\uD834\uDD2B/g, 'bb')
				.replace(/\u266F/g, '#')
				.replace(/\u266D/g, 'b');
			var match = /^([A-G])([#b]{0,2})/.exec(normalized);
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

		function chordNamesToMidi(noteNames, bassOctaveOffset) {
			var chord = [];

			for (var i = 0; i < noteNames.length; i++) {
				chord.push(noteNameToMidi(noteNames[i], i === 0 ? bassOctaveOffset : 0));
			}

			return chord;
		}

		function playChordFromNames(noteNames, playbackOptions) {
			playbackOptions = playbackOptions || {};
			var instrumentId = playbackInstrumentId(playbackOptions);

			if (!midi) {
				return;
			}

			if (!isInstrumentReady(instrumentId)) {
				loadInstrument(instrumentId, function () {
					playChordFromNames(noteNames, playbackOptions);
				});
				return;
			}

			if (typeof midi.chordOn !== 'function' || typeof midi.chordOff !== 'function') {
				return;
			}

			var chord = chordNamesToMidi(noteNames, defaultValue(playbackOptions.bassOctaveOffset, 0));
			var startDelay = defaultValue(playbackOptions.delay, delay);
			var duration = defaultValue(playbackOptions.duration, 0.75);

			applyInstrument(instrumentId);
			midi.chordOn(channel, chord, velocityFor(playbackOptions), startDelay);
			midi.chordOff(channel, chord, startDelay + duration);
		}

		function playMidiChord(midiNotes, playbackOptions) {
			playbackOptions = playbackOptions || {};
			var instrumentId = playbackInstrumentId(playbackOptions);

			if (!midi) {
				return;
			}

			if (!isInstrumentReady(instrumentId)) {
				loadInstrument(instrumentId, function () {
					playMidiChord(midiNotes, playbackOptions);
				});
				return;
			}

			if (typeof midi.chordOn !== 'function' || typeof midi.chordOff !== 'function') {
				return;
			}

			var chord = normalizeMidiNotes(midiNotes);
			var startDelay = defaultValue(playbackOptions.delay, delay);
			var duration = defaultValue(playbackOptions.duration, 0.75);

			if (!chord.length) {
				return;
			}

			applyInstrument(instrumentId);
			midi.chordOn(channel, chord, velocityFor(playbackOptions), startDelay);
			midi.chordOff(channel, chord, startDelay + duration);
		}

		function playMidiNote(midiNote, playbackOptions) {
			playbackOptions = playbackOptions || {};
			var instrumentId = playbackInstrumentId(playbackOptions);

			if (!midi) {
				return;
			}

			if (!isInstrumentReady(instrumentId)) {
				loadInstrument(instrumentId, function () {
					playMidiNote(midiNote, playbackOptions);
				});
				return;
			}

			if (typeof midi.noteOn !== 'function' || typeof midi.noteOff !== 'function') {
				return;
			}

			var noteNumber = Number(midiNote);

			if (isNaN(noteNumber)) {
				return;
			}

			var startDelay = defaultValue(playbackOptions.delay, delay);
			var duration = defaultValue(playbackOptions.duration, 0.55);

			applyInstrument(instrumentId);
			midi.noteOn(channel, noteNumber, velocityFor(playbackOptions), startDelay);
			midi.noteOff(channel, noteNumber, startDelay + duration);
		}

		function playMetronomeClick(playbackOptions) {
			playbackOptions = playbackOptions || {};

			var audioContext = ensureMetronomeAudioContext();
			var startDelay = Math.max(0, Number(defaultValue(playbackOptions.delay, 0)) || 0);
			var startTime;
			var oscillator;
			var gain;
			var accent = playbackOptions.accent === true;
			var volume = currentVelocity() / Math.max(1, baseVelocity);

			if (!audioContext) {
				return false;
			}

			startTime = audioContext.currentTime + startDelay;
			oscillator = audioContext.createOscillator();
			gain = audioContext.createGain();
			oscillator.type = 'square';
			oscillator.frequency.setValueAtTime(accent ? 1320 : 880, startTime);
			gain.gain.setValueAtTime(0.0001, startTime);
			gain.gain.exponentialRampToValueAtTime((accent ? 0.22 : 0.13) * volume, startTime + 0.004);
			gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (accent ? 0.075 : 0.055));
			oscillator.connect(gain);
			gain.connect(audioContext.destination);
			oscillator.start(startTime);
			oscillator.stop(startTime + 0.09);

			return true;
		}

		function ensureMetronomeAudioContext() {
			var AudioContextConstructor = global.AudioContext || global.webkitAudioContext;

			if (!AudioContextConstructor) {
				return null;
			}

			if (!metronomeAudioContext) {
				metronomeAudioContext = new AudioContextConstructor();
			}

			if (metronomeAudioContext.state === 'suspended' && typeof metronomeAudioContext.resume === 'function') {
				metronomeAudioContext.resume();
			}

			return metronomeAudioContext;
		}

		function normalizeMidiNotes(midiNotes) {
			var result = [];

			for (var i = 0; i < (midiNotes || []).length; i++) {
				var noteNumber = Number(midiNotes[i]);

				if (!isNaN(noteNumber)) {
					result.push(noteNumber);
				}
			}

			return result;
		}

		function stopAllNotes() {
			if (midi && typeof midi.stopAllNotes === 'function') {
				midi.stopAllNotes();
			}
		}

		function currentVelocity() {
			return clamp(Math.round(baseVelocity * volumePercent / 100), 0, baseVelocity);
		}

		function setVolume(value) {
			volumePercent = normalizeVolumePercent(value);

			if (midi && typeof midi.setVolume === 'function') {
				midi.setVolume(channel, currentVelocity());
			}

			return volumePercent;
		}

		function velocityFor(playbackOptions) {
			var requested = playbackOptions && playbackOptions.velocity != null ? Number(playbackOptions.velocity) : null;

			if (requested == null || isNaN(requested)) {
				return currentVelocity();
			}

			return clamp(Math.round(requested * volumePercent / 100), 0, 127);
		}

		function setInstrument(instrumentId) {
			if (!instrumentId) {
				return activeInstrument;
			}

			activeInstrument = instrumentId;

			if (loadedInstruments[activeInstrument]) {
				applyInstrument(activeInstrument);
			}

			return activeInstrument;
		}

		function getInstrumentAttributes() {
			var instrument = findInstrument(activeInstrument);

			return {
				articulationInstruments: instrument.articulationInstruments || null,
				family: instrument.family || '',
				id: instrument.id || activeInstrument,
				pedalBehavior: instrument.pedalBehavior || (instrument.sustained ? 'sustain' : 'reattack'),
				playableRange: instrument.playableRange || null,
				soundEnvelope: instrument.soundEnvelope || (instrument.sustained ? 'sustained' : 'percussive'),
				supportsPedalHold: instrument.supportsPedalHold === true || instrument.sustained === true,
				sustained: instrument.sustained === true
			};
		}

		function addReadyCallback(instrumentId, callback) {
			readyCallbacks[instrumentId] = readyCallbacks[instrumentId] || [];
			readyCallbacks[instrumentId].push(callback);
		}

		function flushReadyCallbacks(instrumentId) {
			var callbacks = (readyCallbacks[instrumentId] || []).slice();
			readyCallbacks[instrumentId] = [];

			for (var i = 0; i < callbacks.length; i++) {
				runCallback(callbacks[i]);
			}
		}

		function runCallback(callback) {
			if (typeof callback === 'function') {
				callback();
			}
		}

		function isReady() {
			return loadedInstruments[activeInstrument] === true;
		}

		function isInstrumentReady(instrumentId) {
			return loadedInstruments[instrumentId || activeInstrument] === true;
		}

		function playbackInstrumentId(playbackOptions) {
			return playbackOptions && playbackOptions.instrumentId ? playbackOptions.instrumentId : activeInstrument;
		}

		function uniqueInstrumentIds(instrumentIds) {
			var seen = {};
			var result = [];

			for (var i = 0; i < (instrumentIds || []).length; i++) {
				if (instrumentIds[i] && !seen[instrumentIds[i]]) {
					seen[instrumentIds[i]] = true;
					result.push(instrumentIds[i]);
				}
			}

			return result;
		}

		function isLoading() {
			for (var instrumentId in loadingInstruments) {
				if (loadingInstruments[instrumentId]) {
					return true;
				}
			}

			return false;
		}

		return {
			load: load,
			loadInstruments: loadInstruments,
			isReady: function () {
				return isReady();
			},
			isInstrumentReady: isInstrumentReady,
			isLoading: function () {
				return isLoading();
			},
			getInstrument: function () {
				return activeInstrument;
			},
			getInstrumentAttributes: getInstrumentAttributes,
			noteNameToMidi: noteNameToMidi,
			chordNamesToMidi: chordNamesToMidi,
			playChordFromNames: playChordFromNames,
			playMetronomeClick: playMetronomeClick,
			playMidiChord: playMidiChord,
			playMidiNote: playMidiNote,
			setInstrument: setInstrument,
			setVolume: setVolume,
			stopAllNotes: stopAllNotes,
			getVolume: function () {
				return volumePercent;
			}
		};
	}

	global.CodaPlayback = {
		create: create
	};
}(window));
