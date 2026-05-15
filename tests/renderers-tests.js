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
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionBpm" type="number" value="120" min="20" max="200"') > -1);
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
assert.ok(progressionWorkbenchHtml.indexOf('id="progressionStyle"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.style.modern"') > -1);
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
assert.ok(progressionWorkbenchHtml.indexOf('data-i18n="progression.sectionB"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('id="generateProgressionSectionB"') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('casino') > -1);
assert.ok(progressionWorkbenchHtml.indexOf('<strong>Imaj7</strong>') > -1);

const renderedProgressionTimeline = progressionWorkbenchRenderer.renderTimelineMeasures({
	measures: [
		{
			bar: 1,
			chordName: 'Cmaj7',
			degree: 'Imaj7',
			displayName: 'Cmaj7 add9',
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
assert.ok(renderedProgressionTimeline.indexOf('data-progression-section="B"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-progression-index="0"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('measureDragHandle') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-progression-split-action="add"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('measureChordMenuButton') > -1);
assert.ok(renderedProgressionTimeline.indexOf('data-i18n-title="progression.changeMeasureChord"') > -1);
assert.ok(renderedProgressionTimeline.indexOf('<strong>Cmaj7 add9</strong>') > -1);
assert.ok(renderedProgressionTimeline.indexOf('<em class="measureDegree">Imaj7</em>') > -1);
assert.ok(renderedProgressionTimeline.indexOf('<span class="measureNotes">C - E - G - B - D</span>') > -1);
assert.ok(renderedProgressionTimeline.indexOf('<span class="measureFunction">T</span>') > -1);
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
assert.ok(sectionBContextTimeline.indexOf('Do Major') > -1);
assert.ok(sectionBContextTimeline.indexOf('progressionSectionContext') < sectionBContextTimeline.indexOf('progressionSectionCircleButton'));
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
assert.ok(progressionWorkbenchRenderer.render().indexOf('progressionInspector') > -1);
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
