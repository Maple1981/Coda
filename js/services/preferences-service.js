// Cookie-backed user preferences for lightweight frontend settings.
(function (global) {
	'use strict';

	function create(options) {
		var cookieName = (options && options.cookieName) || 'coda_preferences';
		var maxAge = (options && options.maxAge) || 31536000;

		function read() {
			var rawValue = readCookie(cookieName);

			if (!rawValue) {
				return {};
			}

			try {
				return JSON.parse(rawValue);
			} catch (error) {
				return {};
			}
		}

		function write(values) {
			writeCookie(cookieName, JSON.stringify(values || {}), maxAge);
		}

		function setValue(key, value) {
			var values = read();

			values[key] = value;
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

	function readCookie(name) {
		if (!global.document || !global.document.cookie) {
			return '';
		}

		var cookies = global.document.cookie.split('; ');

		for (var i = 0; i < cookies.length; i++) {
			var parts = cookies[i].split('=');

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
		create: create
	};
})(window);
