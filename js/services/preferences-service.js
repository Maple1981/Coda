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
			language: allowList(['es', 'en']),
			midiInstrument: allowList(['acoustic_grand_piano', 'acoustic_guitar_nylon', 'drawbar_organ', 'string_ensemble_1']),
			notation: allowList(['anglosaxon', 'latin']),
			scaleIndex: integerRange(0, 54),
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
