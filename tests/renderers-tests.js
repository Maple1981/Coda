const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {
	console,
	window: {}
};
context.window.window = context.window;
vm.createContext(context);

function runScript(relativePath) {
	const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
	vm.runInContext(source, context, { filename: relativePath });
}

[
	'js/data/constants-data.js',
	'js/data/midi-data.js',
	'js/data/notes-data.js',
	'js/data/intervals-data.js',
	'js/data/scales-data.js',
	'js/data/chords-data.js',
	'js/data/guitar-tunings-data.js',
	'js/data/circle-of-fifths-data.js',
	'js/data/extended-harmony-data.js',
	'js/content/changelog-content.js',
	'js/content/welcome-content.js',
	'js/data.js',
	'js/services/data-index-service.js',
	'js/i18n/translations.js',
	'js/i18n/i18n-service.js',
	'js/services/notation-service.js',
	'js/domain/music-utils.js',
	'js/domain/scale-domain.js',
	'js/domain/chord-domain.js',
	'js/domain/extended-harmony-domain.js',
	'js/domain/circle-of-fifths-domain.js',
	'js/domain/instrument-domain.js',
	'js/domain/progression-domain.js',
	'js/domain/music-domain.js',
	'js/renderers/scale-summary-renderer.js',
	'js/renderers/scale-chords-renderer.js',
	'js/renderers/extended-harmony-renderer.js',
	'js/renderers/instrument-renderer.js',
	'js/renderers/circle-of-fifths-renderer.js',
	'js/renderers/changelog-renderer.js',
	'js/renderers/welcome-renderer.js',
	'js/renderers/progression-workbench-renderer.js'
].forEach(runScript);

const data = context.window.CodaData;
const domain = context.window.CodaDomain;
const circleOfFifthsRenderer = context.window.CodaRenderers.circleOfFifths;
const changelogRenderer = context.window.CodaRenderers.changelog;
const extendedHarmonyRenderer = context.window.CodaRenderers.extendedHarmony;
const instrumentsRenderer = context.window.CodaRenderers.instruments;
const scaleChordsRenderer = context.window.CodaRenderers.scaleChords;
const scaleSummaryRenderer = context.window.CodaRenderers.scaleSummary;
const welcomeRenderer = context.window.CodaRenderers.welcome;
const progressionWorkbenchRenderer = context.window.CodaRenderers.progressionWorkbench;
const notation = context.window.CodaNotation;
const englishI18n = context.window.CodaI18n.create({
	initialLanguage: 'en',
	translations: context.window.CodaTranslations
});

function byName(collection, name) {
	return collection.find(function (item) {
		return item.nombre === name;
	});
}

function noteIndex(name) {
	return data.notes.findIndex(function (note) {
		return note.nombre === name || note.enarmonica === name;
	});
}

const cMajor = domain.buildScale({
	tonicIndex: noteIndex('C'),
	scaleDefinition: byName(data.scales, 'Mayor'),
	notes: data.notes,
	intervals: data.intervals,
	octaveSemitones: data.constants.octaveSemitones,
	preferFlats: false
});

const cMajorChords = domain.buildScaleChords({
	scaleNotes: cMajor,
	scaleDefinition: byName(data.scales, 'Mayor'),
	chordDefinitions: data.chords,
	octaveSemitones: data.constants.octaveSemitones
});

const cMinorNatural = domain.buildScale({
	tonicIndex: noteIndex('C'),
	scaleDefinition: byName(data.scales, 'Menor natural'),
	notes: data.notes,
	intervals: data.intervals,
	octaveSemitones: data.constants.octaveSemitones,
	preferFlats: false
});

const cMinorNaturalChords = domain.buildScaleChords({
	scaleNotes: cMinorNatural,
	scaleDefinition: byName(data.scales, 'Menor natural'),
	chordDefinitions: data.chords,
	octaveSemitones: data.constants.octaveSemitones
});

const scaleSummaryHtml = scaleSummaryRenderer.render({
	circleOfFifths: data.circleOfFifths,
	isDegreeSuppressed: function () { return false; },
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleName: 'Mayor',
	scaleNotes: cMajor,
	selectedScaleIndex: 0,
	tonicName: 'C'
});

assert.ok(scaleSummaryHtml.indexOf('<h3>C Mayor</h3>') > -1);
assert.ok(scaleSummaryHtml.indexOf('<span id="A_m_" class="revamp estiloEnlace">Am</span>') > -1);
assert.ok(scaleSummaryHtml.indexOf('<span id="C_m" class="revamp estiloEnlace">Cm</span>') > -1);
assert.ok(scaleSummaryHtml.indexOf('<ul class="notasEscala">') > -1);
assert.ok(scaleSummaryHtml.indexOf('C<sup>I</sup>') > -1);

const circleHtml = circleOfFifthsRenderer.render({
	orderedKeys: data.circleOfFifths.slice(0, 12),
	selectedKey: 'C'
});

assert.ok(circleHtml.indexOf('<div id="circuloDesplegado">') > -1);
assert.ok(circleHtml.indexOf('class="circulo numero0 actual" style="top: 0px; left: 80px;"') > -1);
assert.ok(circleHtml.indexOf('<p class="actual"><span id="C_" class="revamp estiloEnlace">C</span></p>') > -1);
assert.ok(circleHtml.indexOf('<span id="A_m" class="revamp estiloEnlace">Am</span>') > -1);

const fSharpCircleHtml = circleOfFifthsRenderer.render({
	orderedKeys: domain.buildCircleOfFifthsView({
		circleOfFifths: data.circleOfFifths,
		preferFlats: false,
		scaleDefinition: byName(data.scales, 'Mayor'),
		selectedScaleIndex: 0,
		tonicName: 'F#'
	}).orderedKeys,
	selectedKey: 'F#'
});

assert.ok(fSharpCircleHtml.indexOf('<span id="F#_" class="revamp estiloEnlace">F#</span>') > -1);
assert.ok(fSharpCircleHtml.indexOf('<span id="D#_m" class="revamp estiloEnlace">D#m</span>') > -1);

const guitarHtml = instrumentsRenderer.renderGuitar({
	scaleDefinition: byName(data.scales, 'Mayor'),
	strings: [
		{
			aire: 'E',
			midiNote: 64,
			perteneceEscala: true,
			trastes: [
				{ nombre: 'F', midiNote: 65, perteneceEscala: true },
				{ nombre: 'F#', midiNote: 66, perteneceEscala: false }
			]
		}
	],
	tuning: data.tunings[0],
	tunings: data.tunings
});

assert.ok(guitarHtml.indexOf('<select id="selectorAfinaciones">') > -1);
assert.ok(guitarHtml.indexOf('<table class="diapason">') > -1);
assert.ok(guitarHtml.indexOf('<td class="celdaNota perteneceEscala"><span data-note-name="E" data-midi-note="64">E</span></td>') > -1);
assert.ok(guitarHtml.indexOf('<td><span>2</span></td>') > -1);

const pianoKeyboard = domain.buildPianoKeyboard({
	isDegreeSuppressed: function () { return false; },
	notes: data.notes,
	octaveCount: 1,
	preferFlats: true,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: cMajor
});

const pianoHtml = instrumentsRenderer.renderPiano({
	keyboard: pianoKeyboard,
	scaleDefinition: byName(data.scales, 'Mayor')
});

assert.ok(pianoHtml.indexOf('<table class="teclasNegras">') > -1);
assert.ok(pianoHtml.indexOf('<table class="teclasBlancas">') > -1);
assert.ok(pianoHtml.indexOf('<span data-note-name="Bb" data-midi-note="58">Bb</span>') > -1);
assert.ok(pianoHtml.indexOf('<td class="celdaNota  perteneceEscala"><span data-note-name="C" data-midi-note="48">C</span></td>') > -1);

const englishPianoHtml = instrumentsRenderer.renderPiano({
	i18n: englishI18n,
	keyboard: pianoKeyboard,
	scaleDefinition: byName(data.scales, 'Mayor')
});
assert.ok(englishPianoHtml.indexOf('<h4>Piano view</h4>') > -1);

const englishGuitarHtml = instrumentsRenderer.renderGuitar({
	i18n: englishI18n,
	scaleDefinition: byName(data.scales, 'Mayor'),
	strings: [
		{
			aire: 'E',
			midiNote: 64,
			perteneceEscala: true,
			trastes: []
		}
	],
	tuning: data.tunings[0],
	tunings: data.tunings
});
assert.ok(englishGuitarHtml.indexOf('<h4>Tuning: Standard E') > -1);
assert.ok(englishGuitarHtml.indexOf('E♭ tuning') > -1);

const latinSummaryHtml = scaleSummaryRenderer.render({
	circleOfFifths: data.circleOfFifths,
	i18n: englishI18n,
	isDegreeSuppressed: function () { return false; },
	notation: notation,
	notationStyle: 'latin',
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleIndex: 0,
	scaleName: 'Mayor',
	scaleNotes: cMajor,
	selectedScaleIndex: 0,
	tonicName: 'C'
});
assert.ok(latinSummaryHtml.indexOf('<h3>Do Major</h3>') > -1);
assert.ok(latinSummaryHtml.indexOf('<span id="A_m_" class="revamp estiloEnlace">Lam</span>') > -1);
assert.ok(latinSummaryHtml.indexOf('Do<sup>I</sup>') > -1);

const latinGuitarHtml = instrumentsRenderer.renderGuitar({
	i18n: englishI18n,
	notation: notation,
	notationStyle: 'latin',
	scaleDefinition: byName(data.scales, 'Mayor'),
	strings: [
		{
			aire: 'E',
			midiNote: 64,
			perteneceEscala: true,
			trastes: []
		}
	],
	tuning: data.tunings[0],
	tunings: data.tunings
});
assert.ok(latinGuitarHtml.indexOf('<h4>Tuning: Standard Mi') > -1);
assert.ok(latinGuitarHtml.indexOf('<span data-note-name="E" data-midi-note="64">Mi</span>') > -1);

const scaleChordsHtml = scaleChordsRenderer.render({
	mode: 'M',
	parallelScaleChords: cMinorNaturalChords,
	scaleChords: cMajorChords,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: cMajor
});

assert.ok(scaleChordsHtml.indexOf('<table class="acordesEscala">') > -1);
assert.ok(scaleChordsHtml.indexOf('Cmaj7') > -1);
assert.ok(scaleChordsHtml.indexOf('class="celdaAcorde" id="G-B-D-F"') > -1);
assert.ok(scaleChordsHtml.indexOf('<td>V7</td>') > -1);
assert.ok(scaleChordsHtml.indexOf('<td class="cabecera">Función</td>') > -1);

const latinScaleChordsHtml = scaleChordsRenderer.render({
	mode: 'M',
	notation: notation,
	notationStyle: 'latin',
	parallelScaleChords: cMinorNaturalChords,
	scaleChords: cMajorChords,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: cMajor
});
assert.ok(latinScaleChordsHtml.indexOf('Domaj7') > -1);
assert.ok(latinScaleChordsHtml.indexOf('Sol7') > -1);
assert.ok(latinScaleChordsHtml.indexOf('Do-Mi-Sol-Si') > -1);

const dDorianDefinition = data.scales.find(function (scale) {
	return scale.modal === 'true' && scale.nombre.indexOf('rico') > -1;
});

const dDorian = domain.buildScale({
	tonicIndex: noteIndex('D'),
	scaleDefinition: byName(data.scales, 'Modo dórico'),
	notes: data.notes,
	intervals: data.intervals,
	octaveSemitones: data.constants.octaveSemitones,
	preferFlats: false
});

const dDorianChords = domain.buildScaleChords({
	scaleNotes: dDorian,
	scaleDefinition: byName(data.scales, 'Modo dórico'),
	chordDefinitions: data.chords,
	octaveSemitones: data.constants.octaveSemitones
});

const modalSummaryHtml = scaleSummaryRenderer.renderList({
	circleOfFifths: data.circleOfFifths,
	isDegreeSuppressed: function () { return false; },
	scaleDefinition: dDorianDefinition,
	scaleNotes: dDorian,
	selectedScaleIndex: 7,
	tonicName: 'D'
});

assert.ok(modalSummaryHtml.indexOf('<span class="principal">Nota principal</span>') > -1);
assert.ok(modalSummaryHtml.indexOf('<li class="principal">') > -1);
assert.ok(modalSummaryHtml.indexOf('<li class="secundaria">') > -1);

const modalChordsHtml = scaleChordsRenderer.render({
	mode: '',
	parallelScaleChords: [],
	scaleChords: dDorianChords,
	scaleDefinition: byName(data.scales, 'Modo dórico'),
	scaleNotes: dDorian
});

assert.ok(modalChordsHtml.indexOf('<span class="cadencial">') > -1);
assert.ok(modalChordsHtml.indexOf('<span class="evitar">') > -1);
assert.ok(modalChordsHtml.indexOf('Acorde cadencial') > -1);

const html = extendedHarmonyRenderer.render({
	data: data,
	domain: domain,
	mode: 'M',
	preferFlats: false,
	scaleChords: cMajorChords,
	scaleName: 'Mayor',
	scaleNotes: cMajor,
	tonicName: 'C'
});

assert.ok(html.indexOf('<div id="acordeonArmoniaExtendida">') > -1);
assert.ok(html.indexOf('Dominantes secundarios (D)') > -1);
assert.ok(html.indexOf('D7 (V-V)') > -1);
assert.ok(html.indexOf('D-F#-A-C') > -1);
assert.ok(html.indexOf('class="celdaAcorde" id="D-F#-A-C"') > -1);

const changelogHtml = changelogRenderer.render(context.window.CodaChangelogContent.es);
assert.ok(changelogHtml.indexOf('<h3>Novedades de la versión actual beta 0.5</h3>') > -1);
assert.ok(changelogHtml.indexOf('<dt>Interfaz más directa</dt>') > -1);
assert.ok(changelogHtml.indexOf('<dd>El formulario incorpora un selector de instrumento') > -1);
assert.ok(changelogHtml.indexOf('<script>') === -1);

const englishChangelogHtml = changelogRenderer.render(context.window.CodaChangelogContent.en);
assert.ok(englishChangelogHtml.indexOf('<h3>Current beta 0.5 release notes</h3>') > -1);
assert.ok(englishChangelogHtml.indexOf('<dt>More direct interface</dt>') > -1);

const welcomeHtml = welcomeRenderer.render(context.window.CodaWelcomeContent.es);
assert.ok(welcomeHtml.indexOf('<article id="principal" class="columnata">') > -1);
assert.ok(welcomeHtml.indexOf('<h2>Fundamentos</h2>') > -1);
assert.ok(welcomeHtml.indexOf('<span class="material-icons icono fundamentos">class</span>') > -1);
assert.ok(welcomeHtml.indexOf('<span class="material-icons icono instrumentos">piano</span>') > -1);
assert.ok(welcomeHtml.indexOf('<span class="material-icons icono licencia">flaky</span>') > -1);
assert.ok(welcomeHtml.indexOf('piano, guitarra clásica, órgano y cuerdas') > -1);

const progressionWorkbenchHtml = progressionWorkbenchRenderer.render();
assert.ok(progressionWorkbenchHtml.indexOf('class="progressionControls"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.articulation.sustain"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('<strong>Imaj7</strong>') > -1);

console.log('Renderer tests passed');
