// Application use cases. This layer orchestrates domain services and returns
// view-ready models without touching the DOM or producing HTML.
(function (global) {
	'use strict';

	function buildScaleReport(options) {
		var scaleDefinition = options.data.scales[options.scaleIndex];

		if (!scaleDefinition) {
			return null;
		}

		var scaleNotes = options.domain.buildScale({
			tonicIndex: options.tonicIndex,
			scaleDefinition: scaleDefinition,
			notes: options.data.notes,
			intervals: options.data.intervals,
			octaveSemitones: options.data.constants.octaveSemitones,
			preferFlats: options.preferFlats
		});
		var isDegreeSuppressed = createIsDegreeSuppressed(scaleDefinition, scaleNotes);
		var report = {
			circleOfFifths: null,
			extendedHarmonyEnabled: false,
			isDegreeSuppressed: isDegreeSuppressed,
			mode: String(options.scaleIndex) === '0' ? 'M' : 'm',
			modalInterchangeSources: [],
			parallelScaleChords: [],
			parallelScaleDefinition: null,
			parallelScaleNotes: [],
			scaleChords: [],
			scaleDefinition: scaleDefinition,
			scaleIndex: options.scaleIndex,
			scaleName: options.scaleName,
			scaleNotes: scaleNotes,
			tonicIndex: options.tonicIndex,
			tonicName: options.tonicName
		};

		if (scaleNotes.length === 7) {
			report.scaleChords = options.domain.buildScaleChords({
				scaleNotes: scaleNotes,
				scaleDefinition: scaleDefinition,
				chordDefinitions: options.data.chords,
				octaveSemitones: options.data.constants.octaveSemitones,
				isDegreeSuppressed: isDegreeSuppressed
			});

			addParallelScale(report, options);
			addModalInterchangeSources(report, options);
			report.extendedHarmonyEnabled = scaleDefinition.tonal != null && (Number(options.scaleIndex) === 0 || Number(options.scaleIndex) === 2);
		}

		report.circleOfFifths = options.domain.buildCircleOfFifthsView({
			circleOfFifths: options.data.circleOfFifths,
			preferFlats: options.preferFlats,
			scaleDefinition: scaleDefinition,
			selectedScaleIndex: options.scaleIndex,
			tonicName: options.tonicName
		});

		return report;
	}

	function addParallelScale(report, options) {
		var parallelScaleIndex = findParallelScaleIndex(options.scaleIndex);

		if (parallelScaleIndex == null) {
			return;
		}

		var parallelScaleDefinition = options.data.scales[parallelScaleIndex];
		var parallelPreferFlats = preferFlatsForScale(options, parallelScaleDefinition, parallelScaleIndex, options.tonicName);
		var parallelScaleNotes = options.domain.buildScale({
			tonicIndex: options.tonicIndex,
			scaleDefinition: parallelScaleDefinition,
			notes: options.data.notes,
			intervals: options.data.intervals,
			octaveSemitones: options.data.constants.octaveSemitones,
			preferFlats: parallelPreferFlats
		});
		var isParallelDegreeSuppressed = createIsDegreeSuppressed(parallelScaleDefinition, parallelScaleNotes);

		report.parallelScaleDefinition = parallelScaleDefinition;
		report.parallelScaleNotes = parallelScaleNotes;
		report.parallelScaleChords = options.domain.buildScaleChords({
			scaleNotes: parallelScaleNotes,
			scaleDefinition: parallelScaleDefinition,
			chordDefinitions: options.data.chords,
			octaveSemitones: options.data.constants.octaveSemitones,
			isDegreeSuppressed: isParallelDegreeSuppressed
		});
	}

	function addModalInterchangeSources(report, options) {
		var sourceIndexes = [];
		var parallelScaleIndex = findParallelScaleIndex(options.scaleIndex);

		pushUnique(sourceIndexes, parallelScaleIndex);
		pushUnique(sourceIndexes, 3);
		for (var i = 13; i <= 19; i++) {
			pushUnique(sourceIndexes, i);
		}

		for (var j = 0; j < sourceIndexes.length; j++) {
			var source = buildInterchangeSource(sourceIndexes[j], report, options);

			if (source) {
				report.modalInterchangeSources.push(source);
			}
		}
	}

	function buildInterchangeSource(scaleIndex, report, options) {
		var scaleDefinition;
		var scaleNotes;
		var isDegreeSuppressed;

		if (scaleIndex == null || Number(scaleIndex) === Number(options.scaleIndex) || !options.data.scales[scaleIndex]) {
			return null;
		}

		scaleDefinition = options.data.scales[scaleIndex];
		scaleNotes = options.domain.buildScale({
			tonicIndex: options.tonicIndex,
			scaleDefinition: scaleDefinition,
			notes: options.data.notes,
			intervals: options.data.intervals,
			octaveSemitones: options.data.constants.octaveSemitones,
			preferFlats: preferFlatsForScale(options, scaleDefinition, scaleIndex, options.tonicName)
		});

		if (scaleNotes.length !== report.scaleNotes.length) {
			return null;
		}

		isDegreeSuppressed = createIsDegreeSuppressed(scaleDefinition, scaleNotes);

		return {
			id: 'scale-' + scaleIndex,
			scaleChords: options.domain.buildScaleChords({
				scaleNotes: scaleNotes,
				scaleDefinition: scaleDefinition,
				chordDefinitions: options.data.chords,
				octaveSemitones: options.data.constants.octaveSemitones,
				isDegreeSuppressed: isDegreeSuppressed
			}),
			scaleDefinition: scaleDefinition,
			scaleIndex: scaleIndex,
			scaleName: scaleDefinition.nombre,
			scaleNotes: scaleNotes,
			tonicName: report.tonicName
		};
	}

	function pushUnique(values, value) {
		if (value != null && values.indexOf(value) === -1) {
			values.push(value);
		}
	}

	function preferFlatsForScale(options, scaleDefinition, scaleIndex, tonicName) {
		var preferFlats = options.domain && typeof options.domain.shouldPreferFlatsForKeySignature === 'function' ?
			options.domain.shouldPreferFlatsForKeySignature({
				notes: options.data.notes,
				scaleDefinition: scaleDefinition,
				selectedScaleIndex: scaleIndex,
				tonicName: tonicName
			}) :
			null;

		return preferFlats == null ? options.preferFlats : preferFlats;
	}

	function buildInstrumentView(options) {
		if (options.instrument === '1') {
			return {
				keyboard: options.domain.buildPianoKeyboard({
					isDegreeSuppressed: options.report.isDegreeSuppressed,
					notes: options.data.notes,
					octaveCount: options.octaveCount || 2,
					pianoStartMidiNote: options.pianoStartMidiNote || 48,
					preferFlats: options.preferFlats,
					scaleDefinition: options.report.scaleDefinition,
					scaleNotes: options.report.scaleNotes
				}),
				type: 'piano'
			};
		}

		var tuning = options.data.tunings[options.tuningIndex || 0];

		return {
			strings: options.domain.buildGuitarFretboard({
				fretCount: options.data.constants.fretCount,
				isDegreeSuppressed: options.report.isDegreeSuppressed,
				notes: options.data.notes,
				preferFlats: options.preferFlats,
				scaleDefinition: options.report.scaleDefinition,
				scaleNotes: options.report.scaleNotes,
				tuning: tuning
			}),
			tuning: tuning,
			type: 'guitar'
		};
	}

	function createIsDegreeSuppressed(scaleDefinition, scaleNotes) {
		return function (index) {
			if (!('gradosEliminados' in scaleDefinition)) {
				return false;
			}

			var suppressedDegrees = scaleDefinition.gradosEliminados.split('-');

			for (var i = 0; i < suppressedDegrees.length; i++) {
				if (scaleNotes[index].grado === suppressedDegrees[i]) {
					return true;
				}
			}

			return false;
		};
	}

	function findParallelScaleIndex(scaleIndex) {
		if (Number(scaleIndex) === 0) {
			return 2;
		}

		if (Number(scaleIndex) === 2) {
			return 0;
		}

		return null;
	}

	global.CodaApplication = {
		buildInstrumentView: buildInstrumentView,
		buildScaleReport: buildScaleReport,
		buildInterchangeSource: buildInterchangeSource,
		createIsDegreeSuppressed: createIsDegreeSuppressed,
		findParallelScaleIndex: findParallelScaleIndex,
		preferFlatsForScale: preferFlatsForScale
	};
})(window);
