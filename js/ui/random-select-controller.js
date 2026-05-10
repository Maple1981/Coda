// Patron reutilizable para botones de azar asociados a controles de formulario.
(function (global) {
	'use strict';

	function initialize(options) {
		var $ = options.$;
		var root = options.root || global.document;
		var selector = options.selector || '.randomSelectButton';
		var masterSelector = options.masterSelector || '.randomMasterButton';
		var random = options.random || Math.random;

		updateLabels($, options.i18n, selector);
		updateLabels($, options.i18n, masterSelector);

		$(root).on('click', selector, function () {
			randomizeAssociatedControl($, $(this), random);
		});

		$(root).on('click', masterSelector, function () {
			randomizeAllAssociatedControls($, root, random, {
				groups: $(this).attr('data-random-master-groups'),
				selector: selector
			});
		});
	}

	function updateLabels($, i18n, selector) {
		selector = selector || '.randomSelectButton, .randomMasterButton';

		$(selector).each(function () {
			var button = $(this);
			var key = button.attr('data-random-i18n-key') || 'randomSelect.label';
			var label = translate(i18n, key);

			button.attr('title', label);
			button.attr('aria-label', label);
		});
	}

	function randomizeAssociatedControl($, button, random) {
		var targetSelector = button.attr('data-random-control-target') || button.attr('data-random-select-target');

		if (!targetSelector) {
			return null;
		}

		return randomizeControl($, $(targetSelector), random);
	}

	function randomizeAssociatedSelect($, button, random) {
		return randomizeAssociatedControl($, button, random);
	}

	function randomizeAllAssociatedControls($, root, random, options) {
		var settings = options || {};
		var selector = settings.selector || '.randomSelectButton';
		var masterGroups = parseGroups(settings.groups);
		var randomizedTargets = {};
		var randomizedValues = [];

		$(root).find(selector).each(function () {
			var button = $(this);
			var targetSelector = button.attr('data-random-control-target') || button.attr('data-random-select-target');
			var value;

			if (!targetSelector || randomizedTargets[targetSelector] || !isButtonInMasterGroups(button, masterGroups)) {
				return;
			}

			value = randomizeAssociatedControl($, button, random);

			if (value !== null) {
				randomizedTargets[targetSelector] = true;
				randomizedValues.push({
					target: targetSelector,
					value: value
				});
			}
		});

		return randomizedValues;
	}

	function randomizeControl($, control, random) {
		var element;

		if (!control || !control.length) {
			return null;
		}

		element = control[0];

		if (String(element.tagName).toLowerCase() === 'select') {
			return randomizeSelect($, control, random);
		}

		if (String(element.tagName).toLowerCase() === 'input') {
			return randomizeInput($, control, random);
		}

		return null;
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

	function randomizeInput($, input, random) {
		var element;
		var type;
		var value;

		if (!input || !input.length) {
			return null;
		}

		element = input[0];
		type = String(element.type || '').toLowerCase();

		if (type !== 'number' && type !== 'range') {
			return null;
		}

		value = pickNumericValue({
			max: element.max,
			min: element.min,
			step: element.step,
			type: type
		}, random);

		input.val(value).trigger('input').trigger('change');

		return value;
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

	function pickNumericValue(config, random) {
		var min = parseNumber(config.min, 0);
		var max = parseNumber(config.max, min);
		var step = parseStep(config.step, config.type);
		var randomValue = typeof random === 'function' ? random() : Math.random();
		var steps;
		var index;
		var value;

		if (max < min) {
			max = min;
		}

		randomValue = Math.max(0, Math.min(0.999999999, Number(randomValue) || 0));
		steps = Math.floor((max - min) / step);
		index = Math.floor(randomValue * (steps + 1));
		value = min + (index * step);
		value = Math.min(max, value);

		return formatNumericValue(value, step);
	}

	function parseNumber(value, fallback) {
		var parsed = Number(value);

		return Number.isFinite(parsed) ? parsed : fallback;
	}

	function parseStep(value, type) {
		var parsed = Number(value);

		if (String(value).toLowerCase() === 'any' || !Number.isFinite(parsed) || parsed <= 0) {
			return type === 'range' ? 1 : 1;
		}

		return parsed;
	}

	function formatNumericValue(value, step) {
		var decimals = getDecimalPlaces(step);

		if (decimals === 0) {
			return String(Math.round(value));
		}

		return value.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
	}

	function getDecimalPlaces(value) {
		var text = String(value);
		var decimalIndex = text.indexOf('.');

		if (decimalIndex === -1) {
			return 0;
		}

		return text.length - decimalIndex - 1;
	}

	function isSelectableOption(option) {
		var text = String(option && option.text != null ? option.text : '').trim();

		if (!option || option.disabled || option.value === undefined || option.value === null) {
			return false;
		}

		return !/^-+$/.test(text);
	}

	function isButtonInMasterGroups(button, masterGroups) {
		var buttonGroups = parseGroups(button.attr('data-random-group'));

		if (masterGroups.indexOf('*') > -1) {
			return true;
		}

		for (var i = 0; i < buttonGroups.length; i++) {
			if (masterGroups.indexOf(buttonGroups[i]) > -1) {
				return true;
			}
		}

		return false;
	}

	function parseGroups(value) {
		var groups = String(value || 'global').split(/[\s,]+/);
		var normalizedGroups = [];

		for (var i = 0; i < groups.length; i++) {
			if (groups[i]) {
				normalizedGroups.push(groups[i]);
			}
		}

		return normalizedGroups.length ? normalizedGroups : ['global'];
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	global.CodaRandomSelect = {
		formatNumericValue: formatNumericValue,
		pickNumericValue: pickNumericValue,
		initialize: initialize,
		isSelectableOption: isSelectableOption,
		pickOption: pickOption,
		randomizeAssociatedControl: randomizeAssociatedControl,
		randomizeAssociatedSelect: randomizeAssociatedSelect,
		randomizeAllAssociatedControls: randomizeAllAssociatedControls,
		randomizeControl: randomizeControl,
		randomizeInput: randomizeInput,
		randomizeSelect: randomizeSelect,
		updateLabels: updateLabels
	};
})(window);
