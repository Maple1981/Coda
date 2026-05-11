// Contenido de bienvenida separado del HTML inicial.
(function (global) {
	'use strict';

	global.CodaWelcomeContent = {
		es: {
			main: [
				'<em>CODA</em> es una aplicación web para <strong>estudiantes</strong> de armonía, <strong>compositores</strong>, <strong>productores</strong> y <strong>músicos</strong> de todo tipo. Proporciona información básica sobre tonalidades, escalas, acordes y progresiones. Con unos sencillos pasos, puede obtenerse ayuda rápida para componer una canción nueva, efectuar arreglos, armonizar una melodía, utilizar modos griegos o cambiar la tonalidad de una obra.',
				'El sistema es muy sencillo: escoges una <strong>tónica</strong>, un <strong>tipo de escala</strong> y un <strong>instrumento</strong>. En la zona izquierda aparecerá una vista de la escala elegida, una tabla de los acordes que pueden formarse sobre ella, una vista del instrumento seleccionado, e información sobre cómo extender su armonía. En la zona derecha, aparecerá una progresión de acordes totalmente configurable, y exportable en formato MIDI, para que puedas traspasar el trabajo a tu programa preferido.'
			],
			sections: [
				{
					id: 'funciones',
					icon: 'class',
					iconClass: 'fundamentos',
					title: 'Fundamentos',
					body: 'La aplicación se basa en las reglas esenciales de la <a href="http://es.wikipedia.org/wiki/Armon%C3%ADa" title="Ver en Wikipedia información sobre armonía tonal o funcional" target="_blank" rel="noopener noreferrer">armonía funcional</a>, pero también ofrece información sobre <a href="http://es.wikipedia.org/wiki/Modos_musicales" title="Ver en Wikipedia información sobre armonía modal" target="_blank" rel="noopener noreferrer">armonía modal</a> y sobre escalas no diatónicas o poco utilizadas en occidente (exóticas).'
				},
				{
					id: 'instrumentos',
					icon: 'piano',
					iconClass: 'instrumentos',
					title: 'Instrumentos',
					body: 'Además de la información puramente teórica, CODA incluye una vista de <strong>diapasón</strong> y otra de <strong>teclado</strong>, junto con sonidos de piano, guitarra clásica, órgano y cuerdas para preescuchar el material generado.'
				},
				{
					id: 'libre',
					icon: 'flaky',
					iconClass: 'licencia',
					title: 'Licencia',
					body: 'Esta aplicación está creada utilizando solamente especificaciones y estándares <strong>abiertos</strong> como HTML5, CSS3 y JavaScript a través de JQuery. Su código fuente es <strong>libre</strong> y utiliza una licencia <a href="https://creativecommons.org/licenses/by-sa/4.0/" title="Licencia Creative Commons Atribución/Reconocimiento - Compartir igual 4.0 Internacional" target="_blank" rel="noopener noreferrer">Creative Commons by-sa 4.0 International</a>.'
				}
			]
		},
		en: {
			main: [
				'<em>CODA</em> is a web application for harmony <strong>students</strong>, <strong>composers</strong>, <strong>producers</strong> and <strong>musicians</strong> of all kinds. It provides basic information about keys, scales, chords and progressions. In a few simple steps, it can quickly help compose a new song, create arrangements, harmonize a melody, use Greek modes or change the key of a piece.',
				'The system is very simple: choose a <strong>tonic</strong>, a <strong>scale type</strong> and an <strong>instrument</strong>. The left area will show a view of the selected scale, a table of the chords that can be formed on it, a view of the selected instrument, and information on how to extend its harmony. The right area will show a fully configurable chord progression, exportable as MIDI, so you can transfer the work to your preferred program.'
			],
			sections: [
				{
					id: 'funciones',
					icon: 'class',
					iconClass: 'fundamentos',
					title: 'Foundations',
					body: 'The application is based on the essential rules of <a href="http://es.wikipedia.org/wiki/Armon%C3%ADa" title="View tonal or functional harmony on Wikipedia" target="_blank" rel="noopener noreferrer">functional harmony</a>, but it also provides information about <a href="http://es.wikipedia.org/wiki/Modos_musicales" title="View modal harmony on Wikipedia" target="_blank" rel="noopener noreferrer">modal harmony</a> and non-diatonic or less common Western scales.'
				},
				{
					id: 'instrumentos',
					icon: 'piano',
					iconClass: 'instrumentos',
					title: 'Instruments',
					body: 'In addition to theoretical information, CODA includes <strong>fretboard</strong> and <strong>keyboard</strong> views, plus piano, classical guitar, organ and string sounds for previewing generated material.'
				},
				{
					id: 'libre',
					icon: 'flaky',
					iconClass: 'licencia',
					title: 'License',
					body: 'This application is built using only <strong>open</strong> specifications and standards such as HTML5, CSS3 and JavaScript through JQuery. Its source code is <strong>free</strong> and uses a <a href="https://creativecommons.org/licenses/by-sa/4.0/" title="Creative Commons Attribution-ShareAlike 4.0 International" target="_blank" rel="noopener noreferrer">Creative Commons by-sa 4.0 International</a> license.'
				}
			]
		}
	};
})(window);
