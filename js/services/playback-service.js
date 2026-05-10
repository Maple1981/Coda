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
		var channel = defaultValue(options.channel, 0);
		var baseVelocity = defaultValue(options.velocity, 127);
		var volumePercent = normalizeVolumePercent(defaultValue(options.volumePercent, 100));
		var delay = defaultValue(options.delay, 0);
		var initialMidiNote = defaultValue(options.initialMidiNote, 60);
		var loading = false;
		var readyCallbacks = [];
		var ready = false;

		function load(callback) {
			if (ready) {
				runCallback(callback);
				return true;
			}

			if (typeof callback === 'function') {
				readyCallbacks.push(callback);
			}

			if (loading) {
				return true;
			}

			if (!midi || typeof midi.loadPlugin !== 'function') {
				readyCallbacks = [];
				return false;
			}

			loading = true;
			midi.loadPlugin({
				soundfontUrl: options.soundfontUrl || './soundfont/',
				instrument: options.instrument || 'acoustic_grand_piano',
				onprogress: options.onprogress || function () {},
				onsuccess: function () {
					loading = false;
					ready = true;
					if (typeof midi.setVolume === 'function') {
						midi.setVolume(channel, currentVelocity());
					}

					if (typeof options.onsuccess === 'function') {
						options.onsuccess();
					}

					flushReadyCallbacks();
				}
			});

			return true;
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

			if (!ready) {
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

			if (!ready) {
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

			if (ready && midi && typeof midi.setVolume === 'function') {
				midi.setVolume(channel, currentVelocity());
			}

			return volumePercent;
		}

		function flushReadyCallbacks() {
			var callbacks = readyCallbacks.slice();
			readyCallbacks = [];

			for (var i = 0; i < callbacks.length; i++) {
				runCallback(callbacks[i]);
			}
		}

		function runCallback(callback) {
			if (typeof callback === 'function') {
				callback();
			}
		}

		return {
			load: load,
			isReady: function () {
				return ready;
			},
			isLoading: function () {
				return loading;
			},
			noteNameToMidi: noteNameToMidi,
			chordNamesToMidi: chordNamesToMidi,
			playChordFromNames: playChordFromNames,
			playMidiNote: playMidiNote,
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
