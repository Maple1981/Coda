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
		var instruments = options.instruments || [];
		var channel = defaultValue(options.channel, 0);
		var baseVelocity = defaultValue(options.velocity, 127);
		var volumePercent = normalizeVolumePercent(defaultValue(options.volumePercent, 100));
		var delay = defaultValue(options.delay, 0);
		var initialMidiNote = defaultValue(options.initialMidiNote, 60);
		var activeInstrument = options.instrument || 'acoustic_grand_piano';
		var loadingInstruments = {};
		var loadedInstruments = {};
		var readyCallbacks = {};

		function load(callback) {
			return loadInstrument(activeInstrument, callback);
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
			if (notes._codaIndex && notes._codaIndex.indexByName && notes._codaIndex.indexByName[noteName] !== undefined) {
				return initialMidiNote + defaultValue(offset, 0) + notes._codaIndex.indexByName[noteName];
			}

			for (var i = 0; i < notes.length; i++) {
				if (notes[i].nombre === noteName || notes[i].enarmonica === noteName) {
					return initialMidiNote + defaultValue(offset, 0) + i;
				}
			}
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

			if (!midi) {
				return;
			}

			if (!isReady()) {
				load(function () {
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

			midi.chordOn(channel, chord, currentVelocity(), startDelay);
			midi.chordOff(channel, chord, startDelay + duration);
		}

		function playMidiNote(midiNote, playbackOptions) {
			playbackOptions = playbackOptions || {};

			if (!midi) {
				return;
			}

			if (!isReady()) {
				load(function () {
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

			midi.noteOn(channel, noteNumber, currentVelocity(), startDelay);
			midi.noteOff(channel, noteNumber, startDelay + duration);
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
			isReady: function () {
				return isReady();
			},
			isLoading: function () {
				return isLoading();
			},
			getInstrument: function () {
				return activeInstrument;
			},
			noteNameToMidi: noteNameToMidi,
			chordNamesToMidi: chordNamesToMidi,
			playChordFromNames: playChordFromNames,
			playMidiNote: playMidiNote,
			setInstrument: setInstrument,
			setVolume: setVolume,
			getVolume: function () {
				return volumePercent;
			}
		};
	}

	global.CodaPlayback = {
		create: create
	};
}(window));
