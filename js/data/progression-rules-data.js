// Reglas iniciales para generar progresiones semialeatorias.
// Derivadas de docs/theory/12-progresiones.md, 13-cadencias.md,
// 14-contrapunto.md y 20-forma.md.
(function (global) {
	'use strict';

	var catalogs = global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	catalogs.progressionRules = {
		cadences: [
			{
				cadence: 'cadential64',
				counterpoint: 88,
				degrees: [0, 0, 4, 0],
				id: 'cadential-six-four',
				label: 'Cadencia 6/4',
				modes: ['major', 'minor'],
				roles: ['', 'cadential64', 'dominant', 'resolution'],
				weight: 10
			}
		],
		modalFutureRules: [
			{
				active: false,
				id: 'modal-final-melodies',
				label: 'Melodías finales modales',
				notes: 'Explorar cierres melódicos que caen desde la tónica hacia la quinta, o comienzan desde una nota inferior a la tónica, sin convertir el final en una cadencia tonal.',
				priority: 'future'
			},
			{
				active: false,
				id: 'modal-two-chord-trick',
				label: 'Truco de dos acordes',
				notes: 'Usar pares de acordes que expongan la nota característica del modo, preferentemente con pocas notas comunes para establecer color modal inmediato.',
				priority: 'future'
			},
			{
				active: false,
				id: 'modal-center-shift',
				label: 'Desplazamiento de centro manteniendo el modo',
				notes: 'Reutilizar un mismo modo sobre otros centros relacionados para crear desplazamientos modales sin caer en función dominante-tónica.',
				priority: 'future'
			},
			{
				active: false,
				id: 'modal-deception',
				label: 'Engaño modal',
				notes: 'Comenzar una frase en un grado distinto de la tónica modal para ocultar el centro, y revelarlo después mediante bajo, pedal o nota característica.',
				priority: 'future'
			},
			{
				active: false,
				id: 'aeolian-color-power',
				label: 'Poder del modo eólico',
				notes: 'Explotar pedales, movimientos por grado conjunto y semitonos II-III y V-VI para obtener oscuridad modal sin sensible tonal.',
				priority: 'future'
			},
			{
				active: false,
				id: 'locrian-without-fifth',
				label: 'Locrio sin quinta',
				notes: 'Estabilizar el acorde de tónica locrio omitiendo su quinta disminuida, tanto en tríadas como en cuatríadas.',
				priority: 'future'
			},
			{
				active: false,
				id: 'modal-semitone-gestures',
				label: 'Gestos modales por semitono',
				notes: 'Favorecer movimientos como i-bII en frigio, II-bIII y V-bVI en eólico, evitando el gesto sensible-tónica tonal.',
				priority: 'future'
			},
			{
				active: false,
				id: 'modal-modulation',
				label: 'Modulación entre modos',
				notes: 'Cambiar de modo con la misma tónica, mantener modo con otra tónica o cambiar ambas dimensiones introduciendo gradualmente las alteraciones nuevas.',
				priority: 'future'
			},
			{
				active: false,
				id: 'modal-tonal-hybrid',
				label: 'Modalidad y tonalidad híbridas',
				notes: 'Permitir pasajes modales que retrasan, suavizan o culminan en cadencias tonales, sin convertir el núcleo modal en progresión funcional por defecto.',
				priority: 'future'
			}
		],
		phraseBlocks: [
			{
				cadence: 'half',
				counterpoint: 76,
				degrees: [0, 1, 3, 4],
				id: 'I-ii-IV-V',
				modes: ['major', 'minor'],
				modalColor: 18,
				tensionAffinity: 55,
				weight: 16
			},
			{
				cadence: 'half',
				counterpoint: 88,
				degrees: [
					0,
					{ forceInversionIndex: 1, index: 4 },
					{ forceInversionIndex: 1, index: 0 },
					4
				],
				form: 'partimento-rule-octave',
				id: 'baroque-rule-octave-half',
				modes: ['major', 'minor'],
				modalColor: 14,
				styles: ['baroque'],
				tensionAffinity: 52,
				weight: 18
			},
			{
				cadence: 'half',
				counterpoint: 90,
				degrees: [
					0,
					{ forceInversionIndex: 1, index: 6 },
					{ forceInversionIndex: 1, index: 5 },
					4
				],
				form: 'partimento-suspension',
				id: 'baroque-descending-76-half',
				modes: ['major'],
				modalColor: 18,
				styles: ['baroque'],
				tensionAffinity: 62,
				weight: 14
			},
			{
				cadence: 'half',
				counterpoint: 82,
				degrees: [0, 5, 1, 4],
				id: 'I-vi-ii-V',
				modes: ['major', 'minor'],
				modalColor: 16,
				tensionAffinity: 64,
				weight: 15
			},
			{
				cadence: 'half',
				counterpoint: 70,
				degrees: [0, 3, 1, 4],
				id: 'I-IV-ii-V',
				modes: ['major', 'minor'],
				modalColor: 20,
				tensionAffinity: 58,
				weight: 12
			},
			{
				cadence: 'half',
				counterpoint: 62,
				degrees: [0, 6, 5, 4],
				id: 'i-bVII-bVI-V',
				modes: ['minor'],
				modalColor: 58,
				tensionAffinity: 48,
				weight: 14
			},
			{
				cadence: 'plagal',
				counterpoint: 74,
				degrees: [0, 4, 3, 0],
				id: 'I-V-IV-I',
				modes: ['major', 'minor'],
				modalColor: 24,
				tensionAffinity: 38,
				weight: 13
			},
			{
				cadence: 'plagal',
				counterpoint: 72,
				degrees: [0, 5, 3, 0],
				id: 'I-vi-IV-I',
				modes: ['major', 'minor'],
				modalColor: 22,
				tensionAffinity: 44,
				weight: 12
			},
			{
				borrowed: [2],
				cadence: 'plagal',
				counterpoint: 74,
				degrees: [0, 5, 3, 0],
				id: 'I-vi-iv-I',
				modes: ['major'],
				modalColor: 88,
				tensionAffinity: 35,
				weight: 10
			},
			{
				cadence: 'plagal',
				counterpoint: 68,
				degrees: [0, 5, 6, 0],
				id: 'i-bVI-bVII-i',
				modes: ['minor'],
				modalColor: 52,
				tensionAffinity: 50,
				weight: 11
			},
			{
				cadence: 'deceptive',
				counterpoint: 66,
				degrees: [0, 3, 4, 5],
				id: 'I-IV-V-vi',
				modes: ['major', 'minor'],
				modalColor: 18,
				tensionAffinity: 66,
				weight: 13
			},
			{
				cadence: 'deceptive',
				counterpoint: 74,
				degrees: [0, 1, 4, 5],
				id: 'I-ii-V-vi',
				modes: ['major', 'minor'],
				modalColor: 15,
				tensionAffinity: 70,
				weight: 12
			},
			{
				cadence: 'deceptive',
				counterpoint: 70,
				degrees: [0, 4, 2, 5],
				id: 'I-V-iii-vi',
				modes: ['major'],
				modalColor: 16,
				tensionAffinity: 62,
				weight: 10
			},
			{
				cadence: 'authentic',
				counterpoint: 84,
				degrees: [0, 1, 4, 0],
				id: 'I-ii-V-I',
				modes: ['major', 'minor'],
				modalColor: 8,
				tensionAffinity: 55,
				weight: 18
			},
			{
				cadence: 'authentic',
				counterpoint: 90,
				degrees: [
					0,
					{ forceInversionIndex: 1, index: 4 },
					{ forceInversionIndex: 1, index: 0 },
					0
				],
				form: 'partimento-rule-octave',
				id: 'baroque-rule-octave-authentic',
				modes: ['major', 'minor'],
				modalColor: 12,
				styles: ['baroque'],
				tensionAffinity: 58,
				weight: 18
			},
			{
				cadence: 'authentic',
				counterpoint: 92,
				degrees: [5, 1, 4, 0],
				form: 'circle-fragment',
				id: 'baroque-circle-fragment-authentic',
				modes: ['major', 'minor'],
				modalColor: 14,
				styles: ['baroque'],
				tensionAffinity: 68,
				weight: 17
			},
			{
				cadence: 'authentic',
				counterpoint: 86,
				degrees: [5, 1, 4, 0],
				id: 'vi-ii-V-I',
				modes: ['major', 'minor'],
				modalColor: 12,
				tensionAffinity: 62,
				weight: 17
			},
			{
				cadence: 'authentic',
				counterpoint: 72,
				degrees: [5, 3, 4, 0],
				id: 'bVI-iv-V-i',
				modes: ['minor'],
				modalColor: 42,
				tensionAffinity: 45,
				weight: 16
			}
		],
		patterns: [
			{
				cadence: 'authentic',
				counterpoint: 70,
				degrees: [0, 3, 4, 0],
				form: 'basic-cadence',
				id: 'I-IV-V-I',
				modes: ['major', 'minor'],
				modalColor: 10,
				tensionAffinity: 30,
				weight: 22
			},
			{
				cadence: 'authentic',
				counterpoint: 82,
				degrees: [0, 1, 4, 0],
				form: 'subdominant-dominant',
				id: 'I-ii-V-I',
				modes: ['major', 'minor'],
				modalColor: 8,
				tensionAffinity: 55,
				weight: 18
			},
			{
				cadence: 'authentic',
				counterpoint: 86,
				degrees: [5, 1, 4, 0],
				form: 'circle-fragment',
				id: 'vi-ii-V-I',
				modes: ['major', 'minor'],
				modalColor: 12,
				tensionAffinity: 62,
				weight: 17
			},
			{
				cadence: 'deceptive',
				counterpoint: 64,
				degrees: [0, 3, 4, 5],
				form: 'deceptive-cadence',
				id: 'I-IV-V-vi',
				modes: ['major', 'minor'],
				modalColor: 18,
				tensionAffinity: 66,
				weight: 12
			},
			{
				cadence: 'plagal',
				counterpoint: 72,
				degrees: [0, 4, 3, 0],
				form: 'plagal-return',
				id: 'I-V-IV-I',
				modes: ['major', 'minor'],
				modalColor: 22,
				tensionAffinity: 38,
				weight: 12
			},
			{
				cadence: 'plagal',
				counterpoint: 78,
				degrees: [0, 5, 3, 0],
				form: 'tonic-substitution',
				id: 'I-vi-IV-I',
				modes: ['major', 'minor'],
				modalColor: 20,
				tensionAffinity: 44,
				weight: 10
			},
			{
				borrowed: [1],
				cadence: 'mixed-plagal',
				counterpoint: 74,
				degrees: [0, 3, 0],
				form: 'borrowed-plagal',
				id: 'I-iv-I',
				modes: ['major'],
				modalColor: 88,
				tensionAffinity: 35,
				weight: 8
			},
			{
				cadence: 'half',
				counterpoint: 76,
				degrees: [0, 1, 3, 4],
				form: 'half-cadence',
				id: 'I-ii-IV-V',
				modes: ['major', 'minor'],
				modalColor: 18,
				tensionAffinity: 55,
				weight: 9
			},
			{
				cadence: 'half',
				counterpoint: 88,
				degrees: [
					0,
					{ forceInversionIndex: 1, index: 4 },
					{ forceInversionIndex: 1, index: 0 },
					3,
					{ forceInversionIndex: 0, index: 4 },
					{ forceInversionIndex: 1, index: 0 },
					{ forceInversionIndex: 1, index: 4 },
					4
				],
				form: 'partimento-rule-octave',
				id: 'baroque-rule-octave',
				modes: ['major', 'minor'],
				modalColor: 12,
				styles: ['baroque'],
				tensionAffinity: 55,
				weight: 13
			},
			{
				cadence: 'half',
				counterpoint: 86,
				degrees: [0, 4, 5, 2, 3, 0, 3, 4],
				form: 'romanesca',
				id: 'baroque-romanesca',
				modes: ['major', 'minor'],
				modalColor: 20,
				styles: ['baroque'],
				tensionAffinity: 58,
				weight: 12
			},
			{
				cadence: 'authentic',
				counterpoint: 84,
				degrees: [0, 5, 1, 4, 0, 3, 4, 0],
				form: 'period',
				id: 'I-vi-ii-V-I-IV-V-I',
				modes: ['major', 'minor'],
				modalColor: 14,
				tensionAffinity: 58,
				weight: 22
			},
			{
				cadence: 'deceptive',
				counterpoint: 70,
				degrees: [0, 3, 4, 5, 0, 1, 4, 0],
				form: 'sentence',
				id: 'I-IV-V-vi-I-ii-V-I',
				modes: ['major', 'minor'],
				modalColor: 22,
				tensionAffinity: 65,
				weight: 15
			},
			{
				cadence: 'plagal',
				counterpoint: 80,
				degrees: [0, 4, 0, 5, 0, 4, 3, 0],
				form: 'period-return',
				id: 'I-V-I-vi-I-V-IV-I',
				modes: ['major', 'minor'],
				modalColor: 28,
				tensionAffinity: 42,
				weight: 13
			},
			{
				cadence: 'authentic',
				counterpoint: 72,
				degrees: [0, 5, 3, 4, 0],
				form: 'minor-cadential',
				id: 'i-bVI-iv-V-i',
				modes: ['minor'],
				modalColor: 42,
				tensionAffinity: 45,
				weight: 18
			},
			{
				cadence: 'half',
				counterpoint: 62,
				degrees: [0, 6, 5, 4],
				form: 'andalusian',
				id: 'i-bVII-bVI-V',
				modes: ['minor'],
				modalColor: 58,
				tensionAffinity: 48,
				weight: 13
			},
			{
				cadence: 'authentic',
				counterpoint: 88,
				degrees: [0, 3, 6, 2, 5, 1, 4, 0],
				form: 'circle-of-fifths',
				id: 'circle-fifths-minor',
				modes: ['minor'],
				modalColor: 25,
				tensionAffinity: 70,
				weight: 11
			},
			{
				cadence: 'authentic',
				counterpoint: 90,
				degrees: [0, 3, 6, 2, 5, 1, 4, 0],
				form: 'circle-of-fifths',
				id: 'circle-fifths-major',
				modes: ['major'],
				modalColor: 18,
				styles: ['baroque', 'romantic'],
				tensionAffinity: 72,
				weight: 10
			}
		]
	};
})(window);
