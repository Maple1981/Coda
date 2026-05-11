// Patron reutilizable para botones de azar asociados a controles de formulario.
(function (global) {
	'use strict';

	function initialize(options) {
		var root = options.root || global.document;
		var selector = options.selector || '.randomSelectButton';
		var masterSelector = options.masterSelector || '.randomMasterButton';
		var random = options.random || Math.random;

		if (!root || typeof root.addEventListener !== 'function') {
			return;
		}

		updateLabels(options.i18n, selector);
		updateLabels(options.i18n, masterSelector);

		root.addEventListener('click', function (event) {
			var button = findDelegatedButton(root, event.target, selector);

			if (button) {
				randomizeAssociatedControl(button, random);
			}
		});

		root.addEventListener('click', function (event) {
			var button = findDelegatedButton(root, event.target, masterSelector);

			if (!button) {
				return;
			}

			randomizeAllAssociatedControls(root, random, {
				groups: button.getAttribute('data-random-master-groups'),
				selector: selector
			});
		});
	}

	function updateLabels(i18n, selector) {
		selector = selector || '.randomSelectButton, .randomMasterButton';

		forEachElement(global.document, selector, function (button) {
			var key = button.getAttribute('data-random-i18n-key') || 'randomSelect.label';
			var label = translate(i18n, key);

			button.setAttribute('title', label);
			button.setAttribute('aria-label', label);
		});
	}

	function randomizeAssociatedControl(button, random) {
		var buttonElement = asElement(button);
		var targetSelector = buttonElement ? buttonElement.getAttribute('data-random-control-target') || buttonElement.getAttribute('data-random-select-target') : null;
		var target;

		if (!targetSelector) {
			return null;
		}

		target = global.document ? global.document.querySelector(targetSelector) : null;

		return randomizeControl(target, random);
	}

	function randomizeAssociatedSelect(button, random) {
		return randomizeAssociatedControl(button, random);
	}

	function randomizeAllAssociatedControls(root, random, options) {
		var settings = options || {};
		var selector = settings.selector || '.randomSelectButton';
		var masterGroups = parseGroups(settings.groups);
		var randomizedTargets = {};
		var randomizedValues = [];

		forEachElement(root, selector, function (button) {
			var targetSelector = button.getAttribute('data-random-control-target') || button.getAttribute('data-random-select-target');
			var value;

			if (!targetSelector || randomizedTargets[targetSelector] || !isButtonInMasterGroups(button, masterGroups)) {
				return;
			}

			value = randomizeAssociatedControl(button, random);

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

	function randomizeControl(control, random) {
		var element = asElement(control);

		if (!element) {
			return null;
		}

		if (String(element.tagName).toLowerCase() === 'select') {
			return randomizeSelect(element, random);
		}

		if (String(element.tagName).toLowerCase() === 'input') {
			return randomizeInput(element, random);
		}

		return null;
	}

	function randomizeSelect(select, random) {
		var selectElement = asElement(select);
		var selectableOptions = [];
		var selectedOption;

		if (!selectElement) {
			return null;
		}

		Array.prototype.forEach.call(selectElement.options || [], function (optionElement) {
			var option = {
				disabled: optionElement.disabled,
				text: optionElement.textContent,
				value: optionElement.value
			};

			if (isSelectableOption(option)) {
				selectableOptions.push(option);
			}
		});

		selectedOption = pickOption(selectableOptions, random);

		if (!selectedOption) {
			return null;
		}

		selectElement.value = selectedOption.value;
		dispatchFormEvent(selectElement, 'change');

		return selectedOption.value;
	}

	function randomizeInput(input, random) {
		var element = asElement(input);
		var type;
		var value;

		if (!element) {
			return null;
		}

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

		element.value = value;
		dispatchFormEvent(element, 'input');
		dispatchFormEvent(element, 'change');

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
		var buttonElement = asElement(button);
		var buttonGroups = parseGroups(buttonElement ? buttonElement.getAttribute('data-random-group') : null);

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

	function asElement(value) {
		if (!value) {
			return null;
		}

		if (value.nodeType === 1 || value.nodeType === 9) {
			return value;
		}

		return value[0] || null;
	}

	function dispatchFormEvent(element, eventName) {
		var event = new Event(eventName, { bubbles: true });

		element.dispatchEvent(event);
	}

	function findDelegatedButton(root, target, selector) {
		var button = target && target.closest ? target.closest(selector) : null;

		if (!button) {
			return null;
		}

		return root === global.document || root.contains(button) ? button : null;
	}

	function forEachElement(root, selector, callback) {
		if (!root || typeof root.querySelectorAll !== 'function') {
			return;
		}

		Array.prototype.forEach.call(root.querySelectorAll(selector), callback);
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
