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
loader.runManifestRange('js/data/constants-data.js', 'js/renderers/progression-chord-menu-renderer.js');

const data = context.window.CodaData;
const domain = context.window.CodaDomain;
const app = context.window.CodaApplication;
const circleOfFifthsRenderer = context.window.CodaRenderers.circleOfFifths;
const changelogRenderer = context.window.CodaRenderers.changelog;
const extendedHarmonyRenderer = context.window.CodaRenderers.extendedHarmony;
const instrumentsRenderer = context.window.CodaRenderers.instruments;
const scaleChordsRenderer = context.window.CodaRenderers.scaleChords;
const scaleSummaryRenderer = context.window.CodaRenderers.scaleSummary;
const welcomeRenderer = context.window.CodaRenderers.welcome;
const progressionWorkbenchRenderer = context.window.CodaRenderers.progressionWorkbench;
const progressionInspectorRenderer = context.window.CodaRenderers.progressionInspector;
const progressionChordMenuRenderer = context.window.CodaRenderers.progressionChordMenu;
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

function sequenceRng(values) {
	let index = 0;

	return function () {
		const value = values[Math.min(index, values.length - 1)];
		index += 1;
		return value;
	};
}

function createRendererDocument() {
	return {
		createElement: function (tagName) {
			const attributes = {};

			return {
				children: [],
				className: '',
				innerHTML: '',
				parentNode: null,
				style: {},
				tagName: tagName.toUpperCase(),
				textContent: '',
				type: '',
				appendChild: function (child) {
					this.children.push(child);
					child.parentNode = this;
					return child;
				},
				getAttribute: function (name) {
					return attributes[name];
				},
				setAttribute: function (name, value) {
					attributes[name] = String(value);
				}
			};
		}
	};
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

const bMajor = domain.buildScale({
	tonicIndex: noteIndex('B'),
	scaleDefinition: byName(data.scales, 'Mayor'),
	notes: data.notes,
	intervals: data.intervals,
	octaveSemitones: data.constants.octaveSemitones,
	preferFlats: false
});

const bMajorChords = domain.buildScaleChords({
	scaleNotes: bMajor,
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

const cAcoustic = domain.buildScale({
	tonicIndex: noteIndex('C'),
	scaleDefinition: byName(data.scales, 'Acústica'),
	notes: data.notes,
	intervals: data.intervals,
	octaveSemitones: data.constants.octaveSemitones,
	preferFlats: false
});

const cAcousticChords = domain.buildScaleChords({
	scaleNotes: cAcoustic,
	scaleDefinition: byName(data.scales, 'Acústica'),
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

assert.ok(scaleSummaryHtml.indexOf('<h3 class="scaleTitleHeader"><span>C Mayor</span>') > -1);
assert.ok(scaleSummaryHtml.indexOf('id="toggleScaleTheoryDetails"') > -1);
assert.ok(scaleSummaryHtml.indexOf('aria-controls="scaleTheoryDetails instrumento"') > -1);
assert.ok(scaleSummaryHtml.indexOf('<span id="A_m_" class="revamp estiloEnlace">Am</span>') > -1);
assert.ok(scaleSummaryHtml.indexOf('<span id="C_m" class="revamp estiloEnlace">Cm</span>') > -1);
assert.ok(scaleSummaryHtml.indexOf('<ul class="notasEscala">') > -1);
assert.ok(scaleSummaryHtml.indexOf('C<sup>I</sup>') > -1);
assert.ok(scaleSummaryHtml.indexOf('class="scaleDegreePlayButton"') > -1);
assert.ok(scaleSummaryHtml.indexOf('title="Reproducir escala"') > -1);
assert.ok(scaleSummaryHtml.indexOf('data-midi-notes="60,62,64,65,67,69,71,72"') > -1);
assert.ok(scaleSummaryHtml.indexOf('class="scaleDegreeNoteButton"') > -1);
assert.ok(scaleSummaryHtml.indexOf('data-note-name="C"') > -1);
assert.ok(scaleSummaryHtml.indexOf('data-midi-note="60"') > -1);
assert.ok(scaleSummaryHtml.indexOf('data-midi-note="72"') > -1);
assert.equal((scaleSummaryHtml.match(/class="scaleDegreeNoteButton"/g) || []).length, 8);

const pentatonicSummaryHtml = scaleSummaryRenderer.render({
	circleOfFifths: data.circleOfFifths,
	isDegreeSuppressed: function () { return false; },
	scaleDefinition: byName(data.scales, 'Pentatónica Mayor'),
	scaleName: 'Pentatónica Mayor',
	scaleNotes: domain.buildScale({
		tonicIndex: 0,
		scaleDefinition: byName(data.scales, 'Pentatónica Mayor'),
		notes: data.notes,
		intervals: data.intervals,
		octaveSemitones: data.constants.octaveSemitones,
		preferFlats: false
	}),
	selectedScaleIndex: 8,
	tonicName: 'C'
});

assert.ok(pentatonicSummaryHtml.indexOf('data-midi-notes="60,62,64,67,69,72"') > -1);
assert.equal((pentatonicSummaryHtml.match(/class="scaleDegreeNoteButton"/g) || []).length, 6);
assert.ok(pentatonicSummaryHtml.indexOf('data-midi-note="72"') > -1);

const bluesHexatonicSummaryHtml = scaleSummaryRenderer.render({
	circleOfFifths: data.circleOfFifths,
	isDegreeSuppressed: function () { return false; },
	scaleDefinition: byName(data.scales, 'Blues hexatónica'),
	scaleName: 'Blues hexatónica',
	scaleNotes: domain.buildScale({
		tonicIndex: 0,
		scaleDefinition: byName(data.scales, 'Blues hexatónica'),
		notes: data.notes,
		intervals: data.intervals,
		octaveSemitones: data.constants.octaveSemitones,
		preferFlats: true
	}),
	selectedScaleIndex: 10,
	tonicName: 'C'
});

assert.ok(bluesHexatonicSummaryHtml.indexOf('data-midi-notes="60,63,65,66,67,70,72"') > -1);
assert.equal((bluesHexatonicSummaryHtml.match(/class="scaleDegreeNoteButton"/g) || []).length, 7);
assert.ok(bluesHexatonicSummaryHtml.indexOf('data-midi-note="72"') > -1);

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
assert.ok(latinSummaryHtml.indexOf('<h3 class="scaleTitleHeader"><span>Do Major</span>') > -1);
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
assert.ok(scaleChordsHtml.indexOf('<h4>Acordes de la tonalidad</h4>') > -1);
assert.ok(scaleChordsHtml.indexOf('Cmaj7') > -1);
assert.ok(scaleChordsHtml.indexOf('class="celdaAcorde" id="G-B-D-F"') > -1);
assert.ok(scaleChordsHtml.indexOf('<td>V7</td>') > -1);
assert.ok(scaleChordsHtml.indexOf('<td>vii7♭5</td>') > -1);
assert.ok(scaleChordsHtml.indexOf('<td class="cabecera">Función</td>') > -1);

assert.ok(scaleChordsHtml.indexOf('<td class="cabecera">Paralela</td>') > -1);
assert.ok(scaleChordsHtml.indexOf('<td class="cabecera">Paralela 7</td>') > -1);
assert.ok(scaleChordsHtml.indexOf('<td class="cabecera">Paralela</td>') < scaleChordsHtml.indexOf('<td class="cabecera">Paralela 7</td>'));

const bMajorScaleChordsHtml = scaleChordsRenderer.render({
	mode: 'M',
	parallelScaleChords: [],
	scaleChords: bMajorChords,
	scaleDefinition: byName(data.scales, 'Mayor'),
	scaleNotes: bMajor
});
assert.ok(bMajorScaleChordsHtml.indexOf('F#sus2') > -1);
assert.ok(bMajorScaleChordsHtml.indexOf('F#sus4') > -1);
assert.equal(scaleChordsRenderer.suspendedName('F#7', 'sus4'), 'F#sus4');
assert.equal(scaleChordsRenderer.suspendedName('B♭7', 'sus2'), 'B♭sus2');

const acousticScaleChordsHtml = scaleChordsRenderer.render({
	mode: '',
	parallelScaleChords: [],
	scaleChords: cAcousticChords,
	scaleDefinition: byName(data.scales, 'Acústica'),
	scaleNotes: cAcoustic
});
assert.ok(acousticScaleChordsHtml.indexOf('<h4>Acordes de la escala</h4>') > -1);
assert.ok(acousticScaleChordsHtml.indexOf('<td>iv7♭5</td>') > -1);
assert.equal(acousticScaleChordsHtml.indexOf('ivaug7'), -1);
assert.ok(acousticScaleChordsHtml.indexOf('F#dim') > -1);
assert.ok(acousticScaleChordsHtml.indexOf('F#m7♭5') > -1);

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

assert.ok(modalChordsHtml.indexOf('<h4>Acordes de la modalidad</h4>') > -1);
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
assert.ok(changelogHtml.indexOf('<h3>Novedades de la versión actual beta 0.6</h3>') > -1);
assert.ok(changelogHtml.indexOf('<dt>Constructor de progresiones</dt>') > -1);
assert.ok(changelogHtml.indexOf('<dd>La aplicación incorpora un área de trabajo amplia') > -1);
assert.ok(changelogHtml.indexOf('<h3>Novedades de la versión beta 0.5</h3>') > -1);
assert.ok(changelogHtml.indexOf('<dt>Interfaz más directa</dt>') > -1);
assert.ok(changelogHtml.indexOf('<dd>El formulario incorpora un selector de instrumento') > -1);
assert.ok(changelogHtml.indexOf('<script>') === -1);

const englishChangelogHtml = changelogRenderer.render(context.window.CodaChangelogContent.en);
assert.ok(englishChangelogHtml.indexOf('<h3>Current beta 0.6 release notes</h3>') > -1);
assert.ok(englishChangelogHtml.indexOf('<dt>Progression builder</dt>') > -1);
assert.ok(englishChangelogHtml.indexOf('<h3>Beta 0.5 release notes</h3>') > -1);
assert.ok(englishChangelogHtml.indexOf('<dt>More direct interface</dt>') > -1);

const welcomeHtml = welcomeRenderer.render(context.window.CodaWelcomeContent.es);
assert.ok(welcomeHtml.indexOf('<article id="principal" class="columnata">') > -1);
assert.ok(welcomeHtml.indexOf('Con unos sencillos pasos') > -1);
assert.ok(welcomeHtml.indexOf('<strong>instrumento</strong>') > -1);
assert.ok(welcomeHtml.indexOf('exportable en formato MIDI') > -1);
assert.ok(welcomeHtml.indexOf('<h2>Fundamentos</h2>') > -1);
assert.ok(welcomeHtml.indexOf('<span class="material-icons icono fundamentos">class</span>') > -1);
assert.ok(welcomeHtml.indexOf('<span class="material-icons icono instrumentos">piano</span>') > -1);
assert.ok(welcomeHtml.indexOf('<span class="material-icons icono licencia">flaky</span>') > -1);
assert.ok(welcomeHtml.indexOf('piano, guitarra clásica, órgano y cuerdas') > -1);

const progressionWorkbenchHtml = progressionWorkbenchRenderer.render();
assert.ok(progressionWorkbenchHtml.indexOf('class="workbenchTitleGroup"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="workbenchContext" aria-live="polite"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="workbenchContextKeyToggle"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="workbenchContextKey" role="button"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="workbenchContextInstrumentToggle"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="workbenchContextInstrument" role="button"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="toggleCircleOfFifthsFromContext"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('donut_large') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('aria-controls="circleOfFifthsPopover"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="toggleWorkbenchInstrumentMenu"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="workbenchInstrumentMenu"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('expand_more') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="progressionControls"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('<select id="progressionBars"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('<option value="32">32</option>') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('<option value="11/4">11/4</option>') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('<option value="5/8">5/8</option>') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('<option value="9/8">9/8</option>') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('<option value="12/8">12/8</option>') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionBpm" type="number" value="120" min="20" max="200"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionHarmonicDensity" type="range" value="0" min="0" max="100"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-help-i18n="progression.help.harmonicDensity"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionVoices" type="number" value="4" min="1" max="6"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionVoicing"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.voicing.closed"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-help-i18n="progression.help.voicing"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-random-control-target="#progressionCounterpoint"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-random-control-target="#progressionChromaticism"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-random-group="global"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-help-i18n="progression.help.style"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-help-i18n="progression.help.tensions"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-help-i18n="progression.help.chromaticism"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-help-i18n="progression.help.counterpoint"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.articulation.sustain"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n-label="progression.articulation.arpeggioGroup"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="arpeggio_up"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="arpeggio_down"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="arpeggio_up_down"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="arpeggio_down_up"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="arpeggio_alternate"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="arpeggio_outside_in"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="arpeggio_random"') > -1);
assert.equal(progressionWorkbenchHtml.indexOf('data-i18n="progression.articulation.legato"'), -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="progressionExpressiveControls"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="workbenchControl workbenchControl--knob"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="knobControl__input"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionStyle"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.style.renaissance"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.style.baroque"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.style.contemporary"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionStyleHelp"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionStyleDialog"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="generateProgression"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.generate"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('auto_awesome') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="transportButton transportButton--listen" aria-pressed="false"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('play_arrow') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="transportButton transportButton--goStart" title="" aria-label="" hidden') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionMetronome" type="checkbox"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionLoop" type="checkbox"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('class="transportButton transportButton--export"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('ios_share') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionMetronome"') < progressionWorkbenchHtml.indexOf('id="progressionLoop"'));
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionLoop"') < progressionWorkbenchHtml.indexOf('transportButton--goStart'));
assert.ok(progressionWorkbenchHtml.indexOf('transportButton--goStart') < progressionWorkbenchHtml.indexOf('transportButton--listen'));
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.sectionA"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.nextSection"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="aprimeClone"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('value="aprimeVariation"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.nextSection.contrastB"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionNextSectionModulationType"') > -1);
const hiddenModulationSelectSnippet = progressionWorkbenchHtml.slice(progressionWorkbenchHtml.indexOf('id="progressionNextSectionModulationType"'), progressionWorkbenchHtml.indexOf('id="progressionNextSectionModulationType"') + 260);
assert.ok(hiddenModulationSelectSnippet.indexOf('hidden aria-hidden="true"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.nextSectionModulation.none"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.nextSectionModulation.none"') < progressionWorkbenchHtml.indexOf('data-i18n="progression.nextSectionModulation.pivot"'));
assert.equal(progressionWorkbenchHtml.indexOf('data-i18n="progression.nextSectionModulation.auto"'), -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.nextSectionModulation.pivot"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.nextSectionModulation.secondaryDominant"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="generateProgressionNextSection"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('auto_awesome') > -1);
assert.equal(progressionWorkbenchHtml.indexOf('id="generateProgressionSectionB"'), -1);
assert.ok(progressionWorkbenchHtml.indexOf('<strong>Imaj7</strong>') > -1);

const unavailableProgressionTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	unsupportedScale: true
}, {
	i18n: englishI18n
});
assert.ok(unavailableProgressionTimeline.indexOf('Harmonic progressions require a heptatonic scale.') > -1);
assert.equal(unavailableProgressionTimeline.indexOf('Imaj7'), -1);

const renderedProgressionTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chordName: 'Cmaj7',
			degreeIndex: 0,
			degree: 'Imaj7',
			displayName: 'Cmaj7 add9',
			inversionIndex: 0,
			kind: 'seventh',
			notes: ['C', 'E', 'G', 'B', 'D', 'C'],
			tonalFunction: 'T'
		},
		{
			bar: 2,
			chordName: 'Fmaj7'
		}
	]
});
assert.ok(renderedProgressionTimeline.indexOf('data-progression-bar="1"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-progression-section="A"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('progression.nextSection.aprimeClone') > -1);
assert.ok(renderedProgressionTimeline.indexOf('progression.nextSection.aprimeVariation') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-progression-index="0"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('measureDragHandle') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-progression-split-action="add"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('measureChordMenuButton') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-i18n-title="progression.changeMeasureChord"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('measureChordQuickToggle') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-i18n-title="progression.quickEditChord"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('<strong>Cmaj7 add9</strong>') > -1);
assert.ok(renderedProgressionTimeline.indexOf('<em class="measureDegree">Imaj7</em>') > -1);
assert.ok(renderedProgressionTimeline.indexOf('<span class="measureNotes">C - E - G - B - D</span>') > -1);
assert.ok(renderedProgressionTimeline.indexOf('<span class="measureFunction">T</span>') > -1);
assert.ok(renderedProgressionTimeline.indexOf('measureChordQuickEditor') > -1);
assert.ok(renderedProgressionTimeline.indexOf('measureChordQuickButton') > -1);
assert.ok(renderedProgressionTimeline.indexOf('measureChordQuickGroup') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-inspector-action="quick-kind"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-inspector-action="quick-inversion"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-chord-kind="triad"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-chord-kind="seventh"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-inspector-action="silence"') > -1);
assert.ok(context.window.CodaRenderers.progressionTimeline.renderMeasureChord({
	isSilence: true,
	restorableDegreeIndex: 0,
	restorableInversionIndex: 1,
	restorableKind: 'triad',
	restorableSource: 'diatonic'
}, 0, 1).indexOf('measureChordQuickToggle') > -1);
const renderedFullTimeline = progressionWorkbenchRenderer.renderTimeline({
	measures: [
		{ bar: 1, chordName: 'C', sectionId: 'A' },
		{ bar: 2, chordName: 'F', sectionId: 'B' }
	],
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 1, startIndex: 0 },
		{ id: 'B', labelKey: 'progression.sectionB', length: 1, startIndex: 1 }
	]
});
assert.ok(renderedFullTimeline.indexOf('progressionSectionNavigator') > -1);
assert.ok(renderedFullTimeline.indexOf('href="#progression-section-a"') > -1);
assert.ok(renderedFullTimeline.indexOf('href="#progression-section-b"') > -1);
const neapolitanQuickHtml = context.window.CodaRenderers.progressionTimeline.renderMeasureChord({
	chromaticRole: 'neapolitan',
	degreeIndex: 1,
	source: 'chromatic'
}, 0, 1);
assert.ok(neapolitanQuickHtml.indexOf('measureChordQuickToggle') > -1);
assert.ok(neapolitanQuickHtml.indexOf('data-inspector-action="quick-kind"') > -1);
const swissQuickHtml = context.window.CodaRenderers.progressionTimeline.renderMeasureChord({
	chromaticRole: 'swiss65',
	degreeIndex: 5,
	source: 'chromatic'
}, 0, 1);
assert.ok(swissQuickHtml.indexOf('measureChordQuickToggle') > -1);
assert.equal(swissQuickHtml.indexOf('data-inspector-action="quick-kind"'), -1);
assert.ok(swissQuickHtml.indexOf('data-inspector-action="silence"') > -1);
assert.equal(context.window.CodaRenderers.progressionTimeline.notesLabel({
	notes: ['C', 'Eb', 'G', 'C']
}, {
	notation: notation,
	notationStyle: 'latin'
}), 'Do - Mi♭ - Sol');
const sectionBContextTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{ bar: 1, chordName: 'C' },
		{ bar: 2, chordName: 'F', sectionId: 'B' }
	],
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 1, startIndex: 0 },
		{
			circleOfFifths: data.circleOfFifths,
			contextScaleIndex: 0,
			contextScaleName: 'Mayor',
			contextTonicName: 'C',
			id: 'B',
			labelKey: 'progression.sectionB',
			length: 1,
			startIndex: 1
		}
	]
}, {
	i18n: englishI18n,
	notation: notation,
	notationStyle: 'latin'
});
assert.ok(sectionBContextTimeline.indexOf('progressionSectionCircleButton') > -1);
assert.ok(sectionBContextTimeline.indexOf('data-section-circle="B"') > -1);
assert.ok(sectionBContextTimeline.indexOf('progressionSectionNavItem') > -1);
assert.ok(sectionBContextTimeline.indexOf('progressionSectionNavDeleteButton') > -1);
assert.ok(sectionBContextTimeline.indexOf('progressionSectionDeleteButton') > -1);
assert.ok(sectionBContextTimeline.indexOf('data-section-delete="B"') > -1);
assert.equal(sectionBContextTimeline.indexOf('data-section-delete="A"'), -1);
assert.ok(sectionBContextTimeline.indexOf('Do Major') > -1);
assert.ok(sectionBContextTimeline.indexOf('progressionSectionContext') < sectionBContextTimeline.indexOf('progressionSectionCircleButton'));
assert.ok(sectionBContextTimeline.indexOf('progressionSectionCircleButton') < sectionBContextTimeline.indexOf('progressionSectionDeleteButton'));
assert.ok(sectionBContextTimeline.indexOf('value="bprimeClone"') > -1);
assert.ok(sectionBContextTimeline.indexOf('value="bprimeVariation"') > -1);
assert.ok(sectionBContextTimeline.indexOf('progression.nextSection.contrastC') > -1);
assert.ok(sectionBContextTimeline.indexOf('progression.nextSectionModulation.direct') > -1);
const contrastOnlyTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{ bar: 1, chordName: 'C', sectionId: 'A' },
		{ bar: 2, chordName: 'C', sectionId: 'A\'' }
	],
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 1, startIndex: 0 },
		{ id: 'A\'', labelKey: 'progression.sectionAprime', length: 1, startIndex: 1 }
	]
});
const contrastOnlyModulationIndex = contrastOnlyTimeline.indexOf('id="progressionNextSectionModulationType"');
assert.ok(contrastOnlyModulationIndex > -1);
assert.equal(contrastOnlyTimeline.indexOf('hidden aria-hidden="true"', contrastOnlyModulationIndex), -1);
assert.equal(progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{ bar: 1, chordName: 'C' },
		{ bar: 2, chordName: 'F', sectionId: 'B' }
	],
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 1, startIndex: 0 },
		{
			circleOfFifths: data.circleOfFifths,
			contextScaleIndex: 0,
			contextTonicName: 'C',
			id: 'B',
			labelKey: 'progression.sectionB',
			length: 1,
			startIndex: 1
		}
	]
}, { showCircleOfFifths: false }).indexOf('progressionSectionCircleButton'), -1);
const stalePivotLabelTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chordName: 'Am',
			degree: 'vi',
			displayName: 'Am',
			modulationKind: 'pivot',
			modulationRole: 'pivot',
			modulationSourceLabelKey: 'progression.modulation.pivot',
			sectionId: 'A'
		}
	],
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 1, startIndex: 0 }
	]
}, {
	i18n: englishI18n
});
assert.equal(stalePivotLabelTimeline.indexOf('<span class="measureSource">pivot chord</span>'), -1);
const validPivotLabelTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chordName: 'Am',
			degree: 'vi',
			displayName: 'Am',
			modulationKind: 'pivot',
			modulationRole: 'pivot',
			modulationSourceLabelKey: 'progression.modulation.pivot',
			sectionId: 'A'
		},
		{
			bar: 2,
			chordName: 'Am',
			degree: 'ii',
			displayName: 'Am',
			modulationKind: 'pivot',
			modulationRole: 'pivot',
			modulationSourceLabelKey: 'progression.modulation.pivot',
			sectionId: 'B'
		}
	],
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 1, startIndex: 0 },
		{
			contrast: 'relative',
			contextScaleIndex: 0,
			contextTonicName: 'G',
			id: 'B',
			labelKey: 'progression.sectionB',
			length: 1,
			modulation: {
				kind: 'pivot',
				originSectionId: 'A',
				targetSectionId: 'B'
			},
			startIndex: 1
		}
	]
}, {
	i18n: englishI18n
});
assert.ok(validPivotLabelTimeline.indexOf('<span class="measureSource">pivot chord</span>') > -1);
assert.equal(validPivotLabelTimeline.match(/<span class="measureSource">pivot chord<\/span>/g).length, 2);
const separatedPivotLabelTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chordName: 'Am',
			degree: 'vi / ii',
			displayName: 'Am',
			modulationKind: 'pivot',
			modulationRole: 'pivot',
			modulationSourceLabelKey: 'progression.modulation.pivot',
			sectionId: 'A'
		},
		{ bar: 2, chordName: 'C', degree: 'I', displayName: 'C', sectionId: 'A\'' },
		{
			bar: 3,
			chordName: 'Am',
			degree: 'vi / ii',
			displayName: 'Am',
			modulationKind: 'pivot',
			modulationRole: 'pivot',
			modulationSourceLabelKey: 'progression.modulation.pivot',
			sectionId: 'B'
		}
	],
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 1, startIndex: 0 },
		{ id: 'A\'', labelKey: 'progression.sectionAprime', length: 1, startIndex: 1 },
		{
			contrast: 'relative',
			id: 'B',
			labelKey: 'progression.sectionB',
			length: 1,
			modulation: {
				kind: 'pivot',
				originSectionId: 'A',
				targetSectionId: 'B'
			},
			startIndex: 2
		}
	]
}, {
	i18n: englishI18n
});
assert.equal(separatedPivotLabelTimeline.match(/<span class="measureSource">pivot chord<\/span>/g).length, 2);
assert.ok(separatedPivotLabelTimeline.indexOf('<em class="measureDegree">vi / ii</em>') > -1);
const bMajorReportForPivotTimeline = app.buildScaleReport({
	data: data,
	domain: domain,
	preferFlats: false,
	scaleIndex: 0,
	scaleName: 'Mayor',
	tonicIndex: noteIndex('B'),
	tonicName: 'B'
});
const bMajorProgressionForPivotTimeline = app.buildProgressionFromState({
	domain: domain,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 70,
		meter: '3/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: bMajorReportForPivotTimeline
});
const generatedPivotTimelineProgression = app.generateProgressionSection({
	data: data,
	domain: domain,
	modulationType: 'pivot',
	progression: bMajorProgressionForPivotTimeline,
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		beatUnit: 4,
		beatsPerBar: 3,
		bpm: 120,
		counterpoint: 70,
		meter: '3/4',
		modalInterchange: 10,
		style: 'baroque',
		tensions: 40,
		voices: 4
	},
	report: bMajorReportForPivotTimeline,
	rng: sequenceRng([0.99, 0.1, 0.1, 0.1]),
	sectionType: 'contrast',
	selection: { preferFlats: false }
});
const generatedPivotTimelineHtml = progressionWorkbenchRenderer.renderTimelineMeasures(generatedPivotTimelineProgression, {
	i18n: englishI18n
});
assert.notEqual(generatedPivotTimelineProgression.sections[1].contextLabel, 'B Mayor');
assert.equal((generatedPivotTimelineHtml.match(/<span class="measureSource">pivot chord<\/span>/g) || []).length, 2);
const complexSectionTimeline = progressionWorkbenchRenderer.renderTimeline({
	measures: [
		{
			bar: 1,
			chordName: 'Cmaj7',
			degree: 'Imaj7',
			displayName: 'Cmaj7',
			notes: ['C', 'E', 'G', 'B'],
			sectionId: 'A',
			tonalFunction: 'T'
		},
		{
			bar: 2,
			chordName: 'G7 4/3',
			chords: [
				{ chordName: 'Dm7', degree: 'ii7', displayName: 'Dm7', durationBeats: 1, notes: ['D', 'F', 'A', 'C'], tonalFunction: 'SD' },
				{ chordName: 'G7 4/3', degree: 'V7 4/3', displayName: 'G7 4/3', durationBeats: 2, notes: ['F', 'G', 'B', 'D'], tonalFunction: 'D' },
				{ chordName: 'Cmaj7', degree: 'Imaj7', displayName: 'Cmaj7', durationBeats: 1, notes: ['C', 'E', 'G', 'B'], tonalFunction: 'T' }
			],
			degree: 'V7 4/3',
			displayName: 'G7 4/3',
			sectionId: 'A',
			tonalFunction: 'D'
		},
		{ bar: 3, chordName: 'Am7', degree: 'vi7', displayName: 'Am7', sectionId: 'A\'' },
		{ bar: 4, chordName: 'Fmaj7', degree: 'IVmaj7', displayName: 'Fmaj7', sectionId: 'B' },
		{ bar: 5, chordName: 'Bb7', degree: 'SubV7/V', displayName: 'Bb7', sectionId: 'B', tonalFunction: 'D' },
		{ bar: 6, chordName: 'Gm7', degree: 'ii7', displayName: 'Gm7', sectionId: 'B\'' },
		{ bar: 7, chordName: 'Ebmaj7', degree: 'Imaj7', displayName: 'Ebmaj7', sectionId: 'C' }
	],
	sections: [
		{ id: 'A', labelKey: 'progression.sectionA', length: 2, startIndex: 0 },
		{ id: 'A\'', labelKey: 'progression.sectionAprime', length: 1, startIndex: 2 },
		{
			circleOfFifths: data.circleOfFifths,
			contextScaleIndex: 0,
			contextTonicName: 'F',
			id: 'B',
			labelKey: 'progression.sectionB',
			length: 2,
			startIndex: 3
		},
		{ id: 'B\'', labelKey: 'progression.sectionBprime', length: 1, startIndex: 5 },
		{
			contextLabel: 'Eb Mayor',
			id: 'C',
			labelKey: 'progression.sectionC',
			length: 1,
			startIndex: 6
		}
	]
}, {
	i18n: englishI18n,
	notation: notation,
	notationStyle: 'english'
});
assert.ok(complexSectionTimeline.indexOf('progressionSectionNavigator') > -1);
assert.ok(complexSectionTimeline.indexOf('href="#progression-section-a"') > -1);
assert.ok(complexSectionTimeline.indexOf('href="#progression-section-aprime"') > -1);
assert.ok(complexSectionTimeline.indexOf('href="#progression-section-b"') > -1);
assert.ok(complexSectionTimeline.indexOf('href="#progression-section-bprime"') > -1);
assert.ok(complexSectionTimeline.indexOf('href="#progression-section-c"') > -1);
assert.equal((complexSectionTimeline.match(/progressionSectionNavDeleteButton/g) || []).length, 4);
assert.equal((complexSectionTimeline.match(/progressionSectionDeleteButton/g) || []).length, 4);
assert.equal(complexSectionTimeline.indexOf('data-section-delete="A"'), -1);
assert.ok(complexSectionTimeline.indexOf('data-section-delete="A&#39;"') > -1);
assert.ok(complexSectionTimeline.indexOf('data-section-delete="B"') > -1);
assert.ok(complexSectionTimeline.indexOf('data-section-delete="B&#39;"') > -1);
assert.ok(complexSectionTimeline.indexOf('data-section-delete="C"') > -1);
assert.ok(complexSectionTimeline.indexOf('measure--split') > -1);
assert.equal((complexSectionTimeline.match(/data-progression-split-action="remove"/g) || []).length, 2);
assert.ok(complexSectionTimeline.indexOf('<strong>G7 <sub class="musicInversion">4/3</sub></strong>') > -1);
assert.equal(complexSectionTimeline.indexOf('undefined'), -1);
assert.equal(complexSectionTimeline.indexOf('NaN'), -1);
const invertedProgressionTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chordName: 'F',
			degree: 'IV 6/4',
			displayName: 'F 6/4',
			tonalFunction: 'SD'
		}
	]
});
assert.ok(invertedProgressionTimeline.indexOf('<strong>F <sub class="musicInversion">6/4</sub></strong>') > -1);
assert.ok(invertedProgressionTimeline.indexOf('<em class="measureDegree">IV <sub class="musicInversion">6/4</sub></em>') > -1);
assert.ok(progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chords: [
				{ displayName: 'C', degree: 'I', tonalFunction: 'T' },
				{ displayName: 'Am', degree: 'vi', tonalFunction: 'T' }
			]
		}
	]
}).indexOf('data-progression-split-action="remove"') > -1);
const fourChordMeasureHtml = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chords: [
				{ displayName: 'C', degree: 'I', tonalFunction: 'T' },
				{ displayName: 'Am', degree: 'vi', tonalFunction: 'T' },
				{ displayName: 'Em', degree: 'iii', tonalFunction: 'T' },
				{ displayName: 'G', degree: 'V', tonalFunction: 'D' }
			]
		}
	]
});
assert.equal((fourChordMeasureHtml.match(/data-progression-split-action="add"/g) || []).length, 0);
assert.equal((fourChordMeasureHtml.match(/data-progression-split-action="remove"/g) || []).length, 3);
assert.equal((fourChordMeasureHtml.match(/measureChordDragHandle/g) || []).length, 3);
assert.ok(fourChordMeasureHtml.indexOf('data-i18n-title="progression.dragMeasureChord"') > -1);
assert.equal(progressionWorkbenchRenderer.hasRenderableMeasures([{ chordName: '' }]), false);
assert.ok(progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chordName: ''
		}
	]
}).indexOf('<strong>Imaj7</strong>') > -1);
assert.equal(progressionWorkbenchRenderer.render().indexOf('progressionInspector'), -1);
const renderedInspector = progressionInspectorRenderer.render({
	chord: {
		degree: 'Imaj7 4/3',
		degreeIndex: 0,
		displayName: 'Cmaj7 4/3',
		durationBeats: 2,
		inversion: '4/3',
		inversionIndex: 2,
		kind: 'seventh',
		notes: ['C', 'E', 'G', 'B'],
		tonalFunction: 'T',
		voiceNotes: [{ note: 'C' }, { note: 'E' }, { note: 'G' }, { note: 'B' }]
	},
	chordCount: 2,
	chordIndex: 1,
	measure: {
		bar: 3,
		sectionId: 'B'
	},
	measureIndex: 2
}, {
	i18n: englishI18n,
	notation: notation,
	notationStyle: 'latin'
});
assert.ok(renderedInspector.indexOf('Cmaj7 <sub class="musicInversion">4/3</sub>') > -1);
assert.ok(renderedInspector.indexOf('Do - Mi - Sol - Si') > -1);
assert.ok(renderedInspector.indexOf('data-inspector-action="replace"') > -1);
assert.ok(renderedInspector.indexOf('data-chord-kind="triad"') > -1);
assert.ok(renderedInspector.indexOf('data-chord-kind="seventh"') > -1);
assert.ok(renderedInspector.indexOf('aria-pressed="true"') > -1);
assert.ok(renderedInspector.indexOf('Silence') > -1);
assert.ok(renderedInspector.indexOf('Remove') > -1);
assert.ok(renderedInspector.indexOf('Bar 3') > -1);

context.window.document = createRendererDocument();
const chordMenu = progressionChordMenuRenderer.render([
	{
		id: 'sameFunction',
		items: [
			{
				chordName: 'Cmaj7 4/3',
				degree: 'Imaj7 4/3',
				options: [
					{
						degree: 'I 6',
						degreeIndex: 0,
						displayName: 'C 6',
						inversionIndex: 1,
						kind: 'triad'
					}
				]
			}
		]
	}
], {
	chordIndex: 2,
	i18n: englishI18n,
	measureIndex: 4
});

assert.equal(chordMenu.className, 'progressionChordMenu');
assert.equal(chordMenu.children[0].children[0].textContent, 'Same tonal function');
assert.ok(chordMenu.children[0].children[1].children[0].innerHTML.indexOf('<sub class="musicInversion">4/3</sub>') > -1);
assert.equal(chordMenu.children[0].children[1].children[1].children[0].getAttribute('data-progression-index'), '4');
assert.equal(chordMenu.children[0].children[1].children[1].children[0].getAttribute('data-measure-chord-index'), '2');
assert.ok(chordMenu.children[0].children[1].children[1].children[0].innerHTML.indexOf('<sub class="musicInversion">6</sub>') > -1);
assert.equal(chordMenu.children[1].className, 'progressionChordMenu__group progressionChordMenu__group--silence');
assert.equal(chordMenu.children[1].children[0].getAttribute('data-chord-kind'), 'silence');
assert.equal(chordMenu.children[1].children[0].innerHTML, 'Silence');

console.log('Renderer tests passed');
