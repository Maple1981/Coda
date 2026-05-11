// Reglas iniciales para generar progresiones semialeatorias.
// Derivadas de docs/teoria-md/12-progresiones.md, 13-cadencias.md,
// 14-contrapunto.md y 20-forma.md.
(function (global) {
	'use strict';

	var catalogs = global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	catalogs.progressionRules = {
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
			}
		]
	};
})(window);
