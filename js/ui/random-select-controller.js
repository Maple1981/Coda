// Patron reutilizable para botones de azar asociados a selectores.
(function (global) {
	'use strict';

	function initialize(options) {
		var $ = options.$;
		var root = options.root || global.document;
		var selector = options.selector || '.randomSelectButton';
		var random = options.random || Math.random;

		updateLabels($, options.i18n, selector);

		$(root).on('click', selector, function () {
			randomizeAssociatedSelect($, $(this), random);
		});
	}

	function updateLabels($, i18n, selector) {
		selector = selector || '.randomSelectButton';

		$(selector).each(function () {
			var button = $(this);
			var key = button.attr('data-random-i18n-key') || 'randomSelect.label';
			var label = translate(i18n, key);

			button.attr('title', label);
			button.attr('aria-label', label);
		});
	}

	function randomizeAssociatedSelect($, button, random) {
		var targetSelector = button.attr('data-random-select-target');

		if (!targetSelector) {
			return null;
		}

		return randomizeSelect($, $(targetSelector), random);
	}

	function randomizeSelect($, select, random) {
		var selectableOptions = [];
		var selectedOption;

		if (!select || !select.length) {
			return null;
		}

		select.find('option').each(function () {
			var option = {
				disabled: this.disabled,
				text: $(this).text(),
				value: $(this).val()
			};

			if (isSelectableOption(option)) {
				selectableOptions.push(option);
			}
		});

		selectedOption = pickOption(selectableOptions, random);

		if (!selectedOption) {
			return null;
		}

		select.val(selectedOption.value).trigger('change');

		return selectedOption.value;
	}

	function pickOption(options, random) {
		var randomValue;
		var index;

		if (!options || !options.length) {
			return null;
		}

		randomValue = typeof random === 'function' ? random() : Math.random();
		randomValue = Math.max(0, Math.min(0.999999999, Number(randomValue) || 0));
		index = Math.floor(randomValue * options.length);

		return options[index];
	}

	function isSelectableOption(option) {
		var text = String(option && option.text != null ? option.text : '').trim();

		if (!option || option.disabled || option.value === undefined || option.value === null) {
			return false;
		}

		return !/^-+$/.test(text);
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	global.CodaRandomSelect = {
		initialize: initialize,
		isSelectableOption: isSelectableOption,
		pickOption: pickOption,
		randomizeAssociatedSelect: randomizeAssociatedSelect,
		randomizeSelect: randomizeSelect,
		updateLabels: updateLabels
	};
})(window);
