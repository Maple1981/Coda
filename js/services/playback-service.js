// Playback service for browser audio preview. MIDI.js remains the current
// engine, but app code should depend on this small facade instead.
(function (global) {
	'use strict';

	function defaultValue(value, fallback) {
		return value !== undefined ? value : fallback;
	}

	function create(options) {
		var midi = options.midi;
		var notes = options.notes || [];
		var channel = defaultValue(options.channel, 0);
		var velocity = defaultValue(options.velocity, 127);
		var delay = defaultValue(options.delay, 0);
		var initialMidiNote = defaultValue(options.initialMidiNote, 60);
		var ready = false;

		function load() {
			if (!midi || typeof midi.loadPlugin !== 'function') {
				return;
			}

			midi.loadPlugin({
				soundfontUrl: options.soundfontUrl || './soundfont/',
				instrument: options.instrument || 'acoustic_grand_piano',
				onprogress: options.onprogress || function () {},
				onsuccess: function () {
					ready = true;
					if (typeof midi.setVolume === 'function') {
						midi.setVolume(channel, velocity);
					}

					if (typeof options.onsuccess === 'function') {
						options.onsuccess();
					}
				}
			});
		}

		function noteNameToMidi(noteName, offset) {
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

			if (!ready || !midi || typeof midi.chordOn !== 'function' || typeof midi.chordOff !== 'function') {
				return;
			}

			var chord = chordNamesToMidi(noteNames, defaultValue(playbackOptions.bassOctaveOffset, 0));
			var startDelay = defaultValue(playbackOptions.delay, delay);
			var duration = defaultValue(playbackOptions.duration, 0.75);

			midi.chordOn(channel, chord, velocity, startDelay);
			midi.chordOff(channel, chord, startDelay + duration);
		}

		return {
			load: load,
			isReady: function () {
				return ready;
			},
			noteNameToMidi: noteNameToMidi,
			chordNamesToMidi: chordNamesToMidi,
			playChordFromNames: playChordFromNames
		};
	}

	global.CodaPlayback = {
		create: create
	};
}(window));
