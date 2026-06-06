const assert = require('assert');
const path = require('path');
const vm = require('vm');
const { createScriptLoader } = require('./helpers/script-loader');

const root = path.resolve(__dirname, '..');
const context = {
	console,
	window: {}
};
context.window.window = context.window;
vm.createContext(context);

const loader = createScriptLoader(root, context);
loader.runManifestRange('js/data/constants-data.js', 'js/application/progression-playback-application.js');

const app = context.window.CodaApplication;
const data = context.window.CodaData;
const domain = context.window.CodaDomain;
const timing = context.window.CodaProgressionPlaybackTiming;

const instruments = [
	'pad_2_warm',
	'drawbar_organ',
	'string_ensemble_1',
	'acoustic_grand_piano'
];
const tonalities = [
	{ tonicName: 'C', scaleName: 'Mayor', preferFlats: false },
	{ tonicName: 'F', scaleName: 'Mayor', preferFlats: true },
	{ tonicName: 'Bb', scaleName: 'Mayor', preferFlats: true },
	{ tonicName: 'A', scaleName: 'Menor natural', preferFlats: false },
	{ tonicName: 'F#', scaleName: 'Menor natural', preferFlats: false },
	{ tonicName: 'Gb', scaleName: 'Menor natural', preferFlats: true }
];

for (let seed = 1; seed <= 100; seed++) {
	const rng = lcg(seed);
	const tonality = tonalities[seed % tonalities.length];
	const report = buildReport(tonality);
	const progressionState = {
		articulation: 'sustain',
		bars: seed % 3 === 0 ? 12 : 8,
		beatUnit: 4,
		beatsPerBar: seed % 5 === 0 ? 3 : 4,
		bpm: 84 + (seed % 40),
		chromaticism: seed % 4 === 0 ? 65 : 25,
		counterpoint: seed % 2 === 0 ? 85 : 70,
		generateMelodicVoice: false,
		harmonicDensity: 90,
		humanization: 0,
		intensity: 80,
		meter: seed % 5 === 0 ? '3/4' : '4/4',
		midiInstrument: instruments[seed % instruments.length],
		modalInterchange: seed % 3 === 0 ? 60 : 20,
		style: seed % 4 === 0 ? 'baroque' : (seed % 4 === 1 ? 'classic' : (seed % 4 === 2 ? 'romantic' : 'contemporary')),
		swing: 0,
		tensions: seed % 2 === 0 ? 70 : 35,
		voicing: seed % 2 === 0 ? 'open' : 'closed',
		voices: seed % 3 === 0 ? 5 : 4
	};
	let progression = app.generateProgressionFromState({
		data: data,
		domain: domain,
		progressionState: progressionState,
		report: report,
		rng: rng
	});

	progression = forceSplitMeasureEdits(progression, report, progressionState, rng);
	assert.ok(splitMeasureCount(progression) > 0, 'seed ' + seed + ' did not create split-measure chords');

	assertPlaybackAndInstrumentCoverage(progression, progressionState, seed);
}

console.log('Progression randomized playback tests passed');

function buildReport(tonality) {
	return app.buildScaleReport({
		data: data,
		domain: domain,
		preferFlats: tonality.preferFlats,
		scaleIndex: scaleIndex(tonality.scaleName),
		scaleName: tonality.scaleName,
		tonicIndex: noteIndex(tonality.tonicName),
		tonicName: tonality.tonicName
	});
}

function forceSplitMeasureEdits(progression, report, progressionState, rng) {
	var result = progression;
	var bars = result && result.measures ? result.measures.length : 0;
	var targets = uniqueMeasureTargets(bars, rng);

	for (var i = 0; i < targets.length; i++) {
		result = app.addProgressionMeasureChord(result, targets[i], {
			chordIndex: 0,
			data: data,
			progressionState: progressionState,
			report: report,
			rng: rng
		});

		if (rng() > 0.35) {
			result = app.addProgressionMeasureChord(result, targets[i], {
				chordIndex: 1,
				data: data,
				progressionState: progressionState,
				report: report,
				rng: rng
			});
		}

		if (rng() > 0.7 && result.measures[targets[i]] && result.measures[targets[i]].chords && result.measures[targets[i]].chords.length > 2) {
			result = app.removeProgressionMeasureChord(result, targets[i], 1);
		}
	}

	return result;
}

function uniqueMeasureTargets(length, rng) {
	var count = Math.min(length, 3);
	var targets = [];
	var seen = {};

	for (var i = 0; i < length * 2 && targets.length < count; i++) {
		var candidate = Math.max(0, Math.min(length - 1, Math.floor(rng() * length)));

		if (!seen[candidate]) {
			seen[candidate] = true;
			targets.push(candidate);
		}
	}

	return targets;
}

function assertPlaybackAndInstrumentCoverage(progression, progressionState, seed) {
	var starts = playbackStartIndexes(progression);
	var instrument = instrumentDefinition(progressionState.midiInstrument);

	for (var i = 0; i < starts.length; i++) {
		var run = simulatePlayback(progression, instrument, starts[i]);
		var segments = playableSegmentsFromStart(progression, starts[i]);

		for (var j = 0; j < segments.length; j++) {
			assertSegmentCoverage(segments[j], run, seed, starts[i]);
		}
	}
}

function playbackStartIndexes(progression) {
	var length = progression && progression.measures ? progression.measures.length : 0;
	var starts = [0];

	if (length > 2) {
		starts.push(1);
		starts.push(Math.min(length - 1, 2));
	}

	if (length > 6) {
		starts.push(5);
	}

	return uniqueNumbers(starts);
}

function simulatePlayback(progression, instrument, startIndex) {
	var clock = virtualClock();
	var audioIntervals = [];
	var viewEvents = [];
	var playback = app.createProgressionPlayback({
		playbackService: {
			getInstrumentAttributes: function () {
				return instrument;
			},
			playMidiChord: function (notes, options) {
				for (var i = 0; i < (notes || []).length; i++) {
					appendAudioInterval(audioIntervals, notes[i], options, clock.nowSeconds());
				}
			},
			playMidiNote: function (note, options) {
				appendAudioInterval(audioIntervals, note, options, clock.nowSeconds());
			},
			stopAllNotes: function () {}
		},
		timerApi: clock.timerApi
	});

	assert.equal(playback.play(progression, {
		onNoteEnd: function (notes) {
			viewEvents.push({
				notes: normalizeMidiNotes(notes),
				order: viewEvents.length,
				time: clock.nowSeconds(),
				type: 'off'
			});
		},
		onNoteStart: function (notes) {
			viewEvents.push({
				notes: normalizeMidiNotes(notes),
				order: viewEvents.length,
				time: clock.nowSeconds(),
				type: 'on'
			});
		},
		startIndex: startIndex
	}), true);

	clock.flush();

	return {
		audioIntervals: audioIntervals,
		startOffset: startOffsetSeconds(progression, startIndex),
		viewEvents: viewEvents
	};
}

function appendAudioInterval(intervals, note, options, now) {
	var delay = Math.max(0, Number(options && options.delay) || 0);
	var duration = Math.max(0, Number(options && options.duration) || 0);
	var start = now + delay;

	intervals.push({
		end: start + duration,
		note: Number(note),
		start: start
	});
}

function assertSegmentCoverage(segment, run, seed, startIndex) {
	var expected = expectedMidiNotes(segment);
	var start = Math.max(0, (Number(segment.startSeconds) || 0) - run.startOffset);
	var duration = timing.playbackDuration(segment);
	var probeTimes = uniqueNumbers([
		start + 0.002,
		start + Math.max(0.002, duration * 0.5),
		start + Math.max(0.002, duration - 0.002)
	]);

	for (var i = 0; i < probeTimes.length; i++) {
		var audio = activeAudioNotesAt(run.audioIntervals, probeTimes[i]);
		var view = activeViewNotesAt(run.viewEvents, probeTimes[i]);

		for (var j = 0; j < expected.length; j++) {
			assert.ok(audio.indexOf(expected[j]) > -1, failureMessage('audio', expected[j], segment, seed, startIndex, audio, probeTimes[i], run.audioIntervals));
			assert.ok(view.indexOf(expected[j]) > -1, failureMessage('instrument view', expected[j], segment, seed, startIndex, view, probeTimes[i], run.audioIntervals));
		}
	}
}

function expectedMidiNotes(segment) {
	return uniqueNumbers(timing.midiNotesForMeasure(segment)).sort(function (a, b) {
		return a - b;
	});
}

function activeAudioNotesAt(intervals, time) {
	return uniqueNumbers((intervals || []).filter(function (interval) {
		return interval.start <= time && interval.end > time;
	}).map(function (interval) {
		return interval.note;
	})).sort(function (a, b) {
		return a - b;
	});
}

function activeViewNotesAt(events, time) {
	var counts = {};
	var sorted = (events || []).slice().sort(function (a, b) {
		if (a.time !== b.time) {
			return a.time - b.time;
		}

		return a.order - b.order;
	});

	for (var i = 0; i < sorted.length; i++) {
		if (sorted[i].time > time) {
			break;
		}

		for (var j = 0; j < sorted[i].notes.length; j++) {
			var note = sorted[i].notes[j];

			if (sorted[i].type === 'on') {
				counts[note] = (counts[note] || 0) + 1;
			} else if (counts[note]) {
				counts[note] -= 1;
				if (!counts[note]) {
					delete counts[note];
				}
			}
		}
	}

	return Object.keys(counts).map(function (note) {
		return Number(note);
	}).sort(function (a, b) {
		return a - b;
	});
}

function playableSegmentsFromStart(progression, startIndex) {
	var measures = progression && progression.measures ? progression.measures.slice(startIndex) : [];
	var result = [];

	for (var i = 0; i < measures.length; i++) {
		var chords = measures[i].chords && measures[i].chords.length ? measures[i].chords : [measures[i]];

		for (var j = 0; j < chords.length; j++) {
			if (expectedMidiNotes(chords[j]).length) {
				result.push(chords[j]);
			}
		}
	}

	return result;
}

function splitMeasureCount(progression) {
	var count = 0;

	for (var i = 0; i < ((progression && progression.measures) || []).length; i++) {
		if (progression.measures[i].chords && progression.measures[i].chords.length > 1) {
			count += 1;
		}
	}

	return count;
}

function virtualClock() {
	var now = 0;
	var nextId = 1;
	var tasks = [];

	function setTimeout(callback, milliseconds) {
		var id = nextId++;

		tasks.push({
			callback: callback,
			cleared: false,
			id: id,
			milliseconds: now + Math.max(0, Number(milliseconds) || 0),
			order: id
		});

		return id;
	}

	function clearTimeout(id) {
		for (var i = 0; i < tasks.length; i++) {
			if (tasks[i].id === id) {
				tasks[i].cleared = true;
			}
		}
	}

	function flush() {
		var guard = 0;

		while (tasks.length) {
			tasks.sort(function (a, b) {
				if (a.milliseconds !== b.milliseconds) {
					return a.milliseconds - b.milliseconds;
				}

				return a.order - b.order;
			});

			var task = tasks.shift();
			if (task.cleared) {
				continue;
			}

			now = task.milliseconds;
			task.callback();
			guard += 1;
			assert.ok(guard < 50000, 'virtual playback timer overflow');
		}
	}

	return {
		flush: flush,
		nowSeconds: function () {
			return now / 1000;
		},
		timerApi: {
			clearTimeout: clearTimeout,
			setTimeout: setTimeout
		}
	};
}

function failureMessage(target, note, segment, seed, startIndex, active, time, audioIntervals) {
	return [
		'seed ' + seed,
		'startIndex ' + startIndex,
		'time ' + Number(time || 0).toFixed(3),
		'target ' + target,
		'missing note ' + note,
		'active [' + active.join(',') + ']',
		'bar ' + segment.bar,
		'chordIndex ' + (segment.chordIndex == null ? 'measure' : segment.chordIndex),
		'chord ' + (segment.displayName || segment.chordName || ''),
		'expected [' + expectedMidiNotes(segment).join(',') + ']',
		'events ' + JSON.stringify(segment.pedalsIn || []) + ' -> ' + JSON.stringify(segment.pedalsOut || []),
		'intervals ' + JSON.stringify((audioIntervals || []).filter(function (interval) { return interval.note === note; }))
	].join(' | ');
}

function instrumentDefinition(id) {
	for (var i = 0; i < data.midiInstruments.length; i++) {
		if (data.midiInstruments[i].id === id) {
			return data.midiInstruments[i];
		}
	}

	return data.midiInstruments[0];
}

function scaleIndex(scaleName) {
	for (var i = 0; i < data.scales.length; i++) {
		if (data.scales[i].nombre === scaleName) {
			return i;
		}
	}

	return 0;
}

function noteIndex(name) {
	for (var i = 0; i < data.notes.length; i++) {
		if (data.notes[i].nombre === name || data.notes[i].enarmonica === name) {
			return i;
		}
	}

	return 0;
}

function startOffsetSeconds(progression, startIndex) {
	var measure = progression && progression.measures ? progression.measures[startIndex] : null;

	return Number(measure && measure.startSeconds) || 0;
}

function normalizeMidiNotes(notes) {
	return uniqueNumbers(Array.isArray(notes) ? notes : [notes]);
}

function uniqueNumbers(source) {
	var result = [];
	var seen = {};

	for (var i = 0; i < (source || []).length; i++) {
		var value = Number(source[i]);

		if (isFinite(value) && !seen[value]) {
			seen[value] = true;
			result.push(value);
		}
	}

	return result;
}

function lcg(seed) {
	var state = seed >>> 0;

	return function () {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 4294967296;
	};
}
