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
loader.runManifestRange('js/data/constants-data.js', 'js/application/progression-application.js');

const app = context.window.CodaApplication;
const data = context.window.CodaData;
const domain = context.window.CodaDomain;
const sectionModulation = context.window.CodaProgressionSectionModulation;

function noteIndex(name) {
	return data.notes.findIndex(function (note) {
		return note.nombre === name || note.enarmonica === name;
	});
}

const cMajorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('C'),
	tonicName: 'C'
});
const bMajorReport = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('B'),
	tonicName: 'B'
});

for (let invariantSeed = 1; invariantSeed <= 40; invariantSeed++) {
	const invariantState = {
		articulation: invariantSeed % 7 === 0 ? 'arpeggio_random' : 'sustain',
		bars: invariantSeed % 3 === 0 ? 32 : (invariantSeed % 2 === 0 ? 16 : 8),
		beatUnit: invariantSeed % 5 === 0 ? 8 : 4,
		beatsPerBar: invariantSeed % 5 === 0 ? 7 : (invariantSeed % 4 === 0 ? 3 : 4),
		bpm: 96 + invariantSeed,
		chromaticism: invariantSeed % 4 === 0 ? 90 : 35,
		counterpoint: 75,
		harmonicDensity: invariantSeed % 3 === 0 ? 85 : 45,
		humanization: invariantSeed % 2 === 0 ? 12 : 0,
		intensity: 82,
		meter: invariantSeed % 5 === 0 ? '7/8' : (invariantSeed % 4 === 0 ? '3/4' : '4/4'),
		modalInterchange: invariantSeed % 4 === 0 ? 70 : 20,
		style: invariantSeed % 2 === 0 ? 'classic' : 'contemporary',
		swing: invariantSeed % 3 === 0 ? 18 : 0,
		tensions: invariantSeed % 2 === 0 ? 80 : 35,
		voicing: invariantSeed % 2 === 0 ? 'open' : 'closed',
		voices: invariantSeed % 3 === 0 ? 5 : 4
	};
	const invariantProgression = app.generateProgressionFromState({
		data: data,
		domain: domain,
		progressionState: invariantState,
		report: cMajorReport,
		rng: lcg(invariantSeed)
	});
	const invariantSegments = allProgressionSegments(invariantProgression);

	assert.ok(maxInversionRun(invariantSegments) <= 3, 'seed ' + invariantSeed + ' exceeds inversion run limit');
	invariantSegments.forEach(function (segment) {
		assertNoDuplicatedInversion(segment.degree, invariantSeed);
		assertNoDuplicatedInversion(segment.displayName, invariantSeed);
	});
	assertFinalChordFillsBar(invariantProgression, invariantState, invariantSeed);
	assertSplitDurationsRespectPulse(invariantProgression, invariantSeed);
	assertRegisterStaysCentered(invariantSegments, invariantSeed);
}

assertModulationInvariants(cMajorReport, 51);
assertModulationInvariants(bMajorReport, 77);

console.log('Progression invariant tests passed');

function lcg(seed) {
	var state = seed >>> 0;

	return function () {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 4294967296;
	};
}

function allProgressionSegments(progression) {
	var result = [];

	(progression.measures || []).forEach(function (measure) {
		if (measure.chords && measure.chords.length) {
			measure.chords.forEach(function (chord) {
				result.push(chord);
			});
			return;
		}

		result.push(measure);
	});

	return result;
}

function maxInversionRun(segments) {
	var max = 0;
	var run = 0;
	var previous = null;

	segments.forEach(function (segment) {
		var current = segment.inversionIndex == null ? 0 : Number(segment.inversionIndex);

		if (current === previous) {
			run += 1;
		} else {
			run = 1;
			previous = current;
		}

		max = Math.max(max, run);
	});

	return max;
}

function assertNoDuplicatedInversion(label, seed) {
	var counts = {};
	var tokens = String(label || '').split(/\s+/);

	tokens.forEach(function (token) {
		if (/^(6|6\/4|6\/5|4\/3|4\/2)$/.test(token)) {
			counts[token] = (counts[token] || 0) + 1;
		}
	});

	Object.keys(counts).forEach(function (token) {
		assert.ok(counts[token] <= 1, 'seed ' + seed + ' duplicates inversion ' + token + ' in ' + label);
	});
}

function assertFinalChordFillsBar(progression, progressionState, seed) {
	var finalMeasure = progression.measures[progression.measures.length - 1];

	assert.ok(!finalMeasure.chords || finalMeasure.chords.length <= 1, 'seed ' + seed + ' splits final bar');
	assert.equal(Number(finalMeasure.durationBeats), Number(progressionState.beatsPerBar));
}

function assertSplitDurationsRespectPulse(progression, seed) {
	(progression.measures || []).forEach(function (measure) {
		var durationSum;
		var pulseCount;

		if (!measure.chords || !measure.chords.length) {
			return;
		}

		durationSum = measure.chords.reduce(function (sum, chord) {
			return sum + Number(chord.durationBeats || 0);
		}, 0);
		pulseCount = Math.round(Number(measure.durationBeats) || 0);

		assert.ok(Math.abs(durationSum - Number(measure.durationBeats)) < 0.001, 'seed ' + seed + ' split duration mismatch');
		if (measure.chords.length <= pulseCount) {
			measure.chords.forEach(function (chord) {
				assert.equal(Number(chord.durationBeats), Math.round(Number(chord.durationBeats)), 'seed ' + seed + ' uses fractional split pulse');
				assert.ok(Number(chord.durationBeats) >= 1, 'seed ' + seed + ' uses empty split pulse');
			});
		}
	});
}

function assertRegisterStaysCentered(segments, seed) {
	var centroids = segments.map(function (segment) {
		var midiNotes = segment.midiNotes || [];
		return midiNotes.reduce(function (sum, midiNote) {
			return sum + midiNote;
		}, 0) / Math.max(1, midiNotes.length);
	}).filter(function (value) {
		return isFinite(value);
	});
	var average = centroids.reduce(function (sum, value) {
		return sum + value;
	}, 0) / Math.max(1, centroids.length);

	assert.ok(average >= 44 && average <= 72, 'seed ' + seed + ' register drifts too far: ' + average);
}

function assertModulationInvariants(originReport, seed) {
	var state = {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		chromaticism: 35,
		counterpoint: 70,
		harmonicDensity: 0,
		humanization: 0,
		intensity: 80,
		meter: '3/4',
		modalInterchange: 10,
		style: 'baroque',
		swing: 0,
		tensions: 35,
		voicing: 'closed',
		voices: 4
	};
	var base = app.buildProgressionFromState({
		domain: domain,
		progressionState: state,
		report: originReport
	});
	var pivot = app.generateProgressionSection({
		data: data,
		domain: domain,
		modulationType: 'pivot',
		progression: base,
		progressionState: state,
		report: originReport,
		rng: lcg(seed),
		sectionType: 'contrast',
		selection: { preferFlats: false }
	});
	var secondaryDominant = app.generateProgressionSection({
		data: data,
		domain: domain,
		modulationType: 'secondaryDominant',
		progression: base,
		progressionState: state,
		report: originReport,
		rng: lcg(seed + 1),
		sectionType: 'contrast',
		selection: { preferFlats: false }
	});
	var noModulation = app.generateProgressionSection({
		data: data,
		domain: domain,
		modulationType: 'none',
		progression: base,
		progressionState: state,
		report: originReport,
		rng: lcg(seed + 2),
		sectionType: 'contrast',
		selection: { preferFlats: false }
	});

	assertPivotHasCommonChord(pivot, originReport, seed);
	assertTargetSectionConfirmsTonicAndDominant(pivot, seed);
	assertSecondaryDominantTargetsDestination(secondaryDominant, seed);
	assert.equal(noModulation.sections[1].contextTonicName, originReport.tonicName, 'seed ' + seed + ' no modulation changed tonic');
	assert.equal(noModulation.sections[1].contextScaleIndex, originReport.scaleIndex, 'seed ' + seed + ' no modulation changed scale');
	assert.equal(noModulation.sections[1].modulation, undefined, 'seed ' + seed + ' no modulation created metadata');
	assert.notEqual(noModulation.measures[noModulation.sections[1].startIndex].degreeIndex, 0, 'seed ' + seed + ' no modulation starts on tonic');
}

function assertPivotHasCommonChord(progression, originReport, seed) {
	var targetSection = progression.sections[1];
	var targetReport = reportForSection(targetSection);
	var pivot = sectionModulation.commonPivotChord(originReport, targetReport);
	var pivotMeasure = progression.measures[targetSection.startIndex - 1];

	assert.equal(targetSection.modulation.kind, 'pivot', 'seed ' + seed + ' did not create pivot metadata');
	assert.ok(pivot, 'seed ' + seed + ' pivot target has no common chord');
	assert.equal(pivotMeasure.modulationRole, 'pivot', 'seed ' + seed + ' missing pivot measure');
	assert.equal(pivotMeasure.pivotTargetDegree, pivot.targetDegree, 'seed ' + seed + ' pivot target degree mismatch');
	assert.notEqual(targetSection.contextLabel, originReport.tonicName + ' ' + originReport.scaleName, 'seed ' + seed + ' pivot did not modulate');
}

function assertTargetSectionConfirmsTonicAndDominant(progression, seed) {
	var targetSection = progression.sections[1];
	var targetMeasures = progression.measures.slice(targetSection.startIndex, targetSection.startIndex + targetSection.length);

	assert.ok(targetMeasures.some(function (measure) {
		return Number(measure.degreeIndex) === 0;
	}), 'seed ' + seed + ' target section lacks tonic confirmation');
	assert.ok(targetMeasures.some(function (measure) {
		return Number(measure.degreeIndex) === 4;
	}), 'seed ' + seed + ' target section lacks dominant confirmation');
}

function assertSecondaryDominantTargetsDestination(progression, seed) {
	var targetSection = progression.sections[1];
	var transitionMeasure = progression.measures[targetSection.startIndex - 1];

	assert.equal(targetSection.modulation.kind, 'secondaryDominant', 'seed ' + seed + ' did not create secondary dominant metadata');
	assert.equal(transitionMeasure.modulationRole, 'secondary-dominant', 'seed ' + seed + ' missing secondary dominant transition');
	assert.equal(transitionMeasure.sourceLabelKey, 'progression.modulation.secondaryDominant', 'seed ' + seed + ' wrong secondary dominant label');
	assert.equal(transitionMeasure.degree, 'V/' + targetSection.contextTonicName, 'seed ' + seed + ' secondary dominant target mismatch');
}

function reportForSection(section) {
	return app.buildScaleReport({
		data: data,
		domain: domain,
		preferFlats: String(section.contextTonicName || '').indexOf('b') > -1,
		scaleIndex: section.contextScaleIndex,
		scaleName: data.scales[section.contextScaleIndex].nombre,
		tonicIndex: noteIndex(section.contextTonicName),
		tonicName: section.contextTonicName
	});
}
