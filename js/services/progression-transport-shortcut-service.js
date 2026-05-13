// Handles keyboard shortcuts for the progression transport.
(function (global) {
	'use strict';

	function handle(event, options) {
		options = options || {};

		var progression = options.progression;
		var key = event && event.key;
		var targetIndex;

		if (!event || isTextEntryTarget(event.target)) {
			return false;
		}

		if (key === ' ' || key === 'Spacebar') {
			preventDefault(event);
			run(options.togglePreview, currentHeadIndex(options), options.setPlaybackHeadIndex);
			return true;
		}

		if (!/^[0-9]$/.test(key || '') || !progression || !progression.measures) {
			return false;
		}

		targetIndex = key === '0' ? 9 : Number(key) - 1;
		if (targetIndex < 0 || targetIndex >= Math.min(10, progression.measures.length)) {
			return false;
		}

		preventDefault(event);
		run(options.stopPreview, currentHeadIndex(options));
		run(options.setPlaybackHeadIndex, targetIndex);
		run(options.setPlaybackHead, targetIndex, false);
		return true;
	}

	function currentHeadIndex(options) {
		if (typeof options.getPlaybackHeadIndex === 'function') {
			return options.getPlaybackHeadIndex();
		}

		return 0;
	}

	function preventDefault(event) {
		if (typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
	}

	function run(callback, value, extraValue) {
		if (typeof callback === 'function') {
			callback(value, extraValue);
		}
	}

	function isTextEntryTarget(target) {
		var tagName = target && target.tagName ? String(target.tagName).toLowerCase() : '';
		var inputType = target && target.type ? String(target.type).toLowerCase() : '';

		return !!(target && (
			target.isContentEditable ||
			tagName === 'textarea' ||
			(tagName === 'input' && isTextInputType(inputType))
		));
	}

	function isTextInputType(inputType) {
		return !inputType || [
			'email',
			'password',
			'search',
			'tel',
			'text',
			'url'
		].indexOf(inputType) > -1;
	}

	global.CodaProgressionTransportShortcuts = {
		handle: handle,
		isTextEntryTarget: isTextEntryTarget
	};
})(window);
