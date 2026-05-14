// Builds per-note playback events, including sustained pedal behavior.
(function (global) {
	'use strict';

	function build(measure, duration, options) {
		var midiNotes = notesForVoices(measure.midiNotes, measure.voices);
		var events = [];

		if (!hasPedals(measure) || !supportsPedalHold(options ? options.instrument : null)) {
			return events;
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

		return events;
	}

	function hasPedals(measure) {
		return (measure.pedalsIn && measure.pedalsIn.length) || (measure.pedalsOut && measure.pedalsOut.length);
	}

	function supportsPedalHold(instrument) {
		return instrument && (instrument.supportsPedalHold === true || instrument.sustained === true || instrument.pedalBehavior === 'sustain');
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
		build: build,
		supportsPedalHold: supportsPedalHold
	};
})(window);
