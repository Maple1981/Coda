// Cookie-backed user preferences for lightweight frontend settings.
(function (global) {
	'use strict';

	function create(options) {
		var cookieName = (options && options.cookieName) || 'coda_preferences';
		var maxAge = (options && options.maxAge) || 31536000;
		var validators = createValidators(options && options.validators);

		function read() {
			var rawValue = readCookie(cookieName);

			if (!rawValue) {
				return {};
			}

			try {
				return sanitizeValues(JSON.parse(rawValue), validators);
			} catch (error) {
				return {};
			}
		}

		function write(values) {
			writeCookie(cookieName, JSON.stringify(sanitizeValues(values, validators)), maxAge);
		}

		function setValue(key, value) {
			var values = read();
			var sanitizedValue = sanitizeValue(key, value, validators);

			if (sanitizedValue === undefined) {
				return;
			}

			values[key] = sanitizedValue;
			write(values);
		}

		function getValue(key, fallback) {
			var values = read();

			return values[key] != null ? values[key] : fallback;
		}

		return {
			getValue: getValue,
			read: read,
			setValue: setValue,
			write: write
		};
	}

	function createValidators(customValidators) {
		var validators = {
			format: function (value) {
				value = String(value);
				return value === '0' || value === '1' ? value : undefined;
			},
			dashboardSidebarWidth: integerRange(320, 760),
			language: allowList(['es', 'en']),
			midiInstrument: allowList(['acoustic_grand_piano', 'acoustic_guitar_nylon', 'drawbar_organ', 'string_ensemble_1', 'pad_2_warm']),
			notation: allowList(['anglosaxon', 'latin']),
			progressionArticulation: allowList([
				'sustain',
				'staccato',
				'arpeggio',
				'arpeggio_up',
				'arpeggio_down',
				'arpeggio_up_down',
				'arpeggio_down_up',
				'arpeggio_alternate',
				'arpeggio_outside_in',
				'arpeggio_random'
			]),
			progressionBars: allowList(['2', '4', '6', '8', '12', '16', '32']),
			progressionBpm: integerRange(20, 200),
			progressionChromaticism: integerRange(0, 100),
			progressionCounterpoint: integerRange(0, 100),
			progressionGenerateMelodicVoice: booleanValue,
			progressionHarmonicDensity: integerRange(0, 100),
			progressionHumanization: integerRange(0, 100),
			progressionIntensity: integerRange(1, 127),
			progressionMeter: allowList(['4/4', '3/4', '5/4', '7/4', '11/4', '5/8', '6/8', '7/8', '9/8', '12/8']),
			progressionModalInterchange: integerRange(0, 100),
			progressionStyle: allowList(['modern', 'renaissance', 'baroque', 'classic', 'romantic', 'impressionist', 'contemporary']),
			progressionSwing: integerRange(0, 75),
			progressionTensions: integerRange(0, 100),
			progressionVoicing: allowList(['closed', 'open']),
			progressionVoices: integerRange(1, 6),
			scaleIndex: integerRange(0, 55),
			theme: allowList(['night', 'day']),
			tonicIndex: integerRange(0, 11),
			volume: integerRange(0, 100)
		};

		customValidators = customValidators || {};

		for (var key in customValidators) {
			if (Object.prototype.hasOwnProperty.call(customValidators, key)) {
				validators[key] = customValidators[key];
			}
		}

		return validators;
	}

	function sanitizeValues(values, validators) {
		var sanitized = {};

		if (!values || typeof values !== 'object' || values.length !== undefined) {
			return sanitized;
		}

		validators = validators || createValidators();

		for (var key in values) {
			if (Object.prototype.hasOwnProperty.call(values, key)) {
				var sanitizedValue = sanitizeValue(key, values[key], validators);

				if (sanitizedValue !== undefined) {
					sanitized[key] = sanitizedValue;
				}
			}
		}

		return sanitized;
	}

	function sanitizeValue(key, value, validators) {
		validators = validators || createValidators();

		if (!Object.prototype.hasOwnProperty.call(validators, key)) {
			return undefined;
		}

		return validators[key](value);
	}

	function allowList(values) {
		var allowed = {};

		for (var i = 0; i < values.length; i++) {
			allowed[values[i]] = true;
		}

		return function (value) {
			value = String(value);
			return allowed[value] ? value : undefined;
		};
	}

	function integerRange(min, max) {
		return function (value) {
			var numericValue = Number(value);

			if (!isFinite(numericValue)) {
				return undefined;
			}

			numericValue = Math.round(numericValue);

			if (numericValue < min || numericValue > max) {
				return undefined;
			}

			return numericValue;
		};
	}

	function booleanValue(value) {
		if (value === true || value === 'true' || value === '1' || value === 1 || value === 'on') {
			return true;
		}

		if (value === false || value === 'false' || value === '0' || value === 0 || value === '') {
			return false;
		}

		return undefined;
	}

	function readCookie(name) {
		if (!global.document || !global.document.cookie) {
			return '';
		}

		var cookies = global.document.cookie.split(';');

		for (var i = 0; i < cookies.length; i++) {
			var parts = cookies[i].trim().split('=');

			if (parts[0] === name) {
				return decodeURIComponent(parts.slice(1).join('='));
			}
		}

		return '';
	}

	function writeCookie(name, value, maxAge) {
		if (!global.document) {
			return;
		}

		global.document.cookie = name + '=' + encodeURIComponent(value) + '; max-age=' + maxAge + '; path=/; SameSite=Lax';
	}

	global.CodaPreferences = {
		create: create,
		sanitizeValue: sanitizeValue,
		sanitizeValues: sanitizeValues
	};
})(window);
