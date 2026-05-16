// Control visual reutilizable para inputs range representados como knobs.
(function (global) {
	'use strict';

	function initialize(options) {
		var root = options && options.root ? options.root : global.document;

		if (!root || root.getAttribute && root.getAttribute('data-coda-knob-control') === 'true') {
			refreshAll(root);
			return;
		}

		if (root.setAttribute) {
			root.setAttribute('data-coda-knob-control', 'true');
		}

		root.addEventListener('input', function (event) {
			if (isKnobInput(event.target)) {
				refresh(event.target);
			}
		});

		root.addEventListener('change', function (event) {
			if (isKnobInput(event.target)) {
				refresh(event.target);
			}
		});

		root.addEventListener('pointerdown', function (event) {
			var knob = closest(event.target, '.knobControl');

			if (!knob || event.target && event.target.closest && event.target.closest('button')) {
				return;
			}

			if (event.ctrlKey) {
				resetToZero(knob, event);
				return;
			}

			startDrag(knob, event);
		});

		refreshAll(root);
	}

	function startDrag(knob, event) {
		var input = knob ? knob.querySelector('.knobControl__input') : null;
		var startY;
		var startValue;
		var min;
		var max;
		var step;
		var range;

		if (!input || event.button && event.button !== 0) {
			return;
		}

		event.preventDefault();
		input.focus();

		startY = event.clientY;
		startValue = numberOr(input.value, 0);
		min = numberOr(input.min, 0);
		max = numberOr(input.max, min);
		step = Math.max(numberOr(input.step, 1), 1);
		range = Math.max(max - min, step);

		function move(moveEvent) {
			var delta = startY - moveEvent.clientY;
			var sensitivity = moveEvent.shiftKey ? 640 : 160;
			var value = startValue + (delta * range / sensitivity);

			setInputValue(input, quantize(value, min, max, step));
			dispatch(input, 'input');
		}

		function end() {
			global.removeEventListener('pointermove', move);
			global.removeEventListener('pointerup', end);
			dispatch(input, 'change');
		}

		global.addEventListener('pointermove', move);
		global.addEventListener('pointerup', end);
	}

	function resetToZero(knob, event) {
		var input = knob ? knob.querySelector('.knobControl__input') : null;
		var min;

		if (!input || event.button && event.button !== 0) {
			return;
		}

		event.preventDefault();
		input.focus();

		min = numberOr(input.min, 0);
		setInputValue(input, min <= 0 ? 0 : min);
		dispatch(input, 'input');
		dispatch(input, 'change');
	}

	function refreshAll(root) {
		root = root || global.document;

		if (!root || typeof root.querySelectorAll !== 'function') {
			return;
		}

		forEach(root.querySelectorAll('.knobControl__input'), refresh);
	}

	function refresh(input) {
		var knob = input ? closest(input, '.knobControl') : null;
		var output = knob ? knob.querySelector('.knobControl__value') : null;
		var value;
		var min;
		var max;
		var ratio;
		var angle;
		var unit;

		if (!knob || !input) {
			return;
		}

		value = numberOr(input.value, 0);
		min = numberOr(input.min, 0);
		max = numberOr(input.max, min);
		ratio = max === min ? 0 : (value - min) / (max - min);
		angle = -135 + (Math.max(0, Math.min(1, ratio)) * 270);
		unit = knob.getAttribute('data-knob-unit') || '';

		knob.style.setProperty('--knob-angle', angle + 'deg');

		if (output) {
			output.textContent = formatValue(value, input.step) + unit;
		}
	}

	function setInputValue(input, value) {
		input.value = formatValue(value, input.step);
		refresh(input);
	}

	function quantize(value, min, max, step) {
		var steps = Math.round((value - min) / step);

		return Math.max(min, Math.min(max, min + (steps * step)));
	}

	function dispatch(element, eventName) {
		var event;

		if (!element) {
			return;
		}

		event = new Event(eventName, {
			bubbles: true
		});
		element.dispatchEvent(event);
	}

	function formatValue(value, step) {
		var decimals = decimalsFor(step);

		return Number(value).toFixed(decimals);
	}

	function decimalsFor(step) {
		var text = String(step || '1');
		var index = text.indexOf('.');

		return index === -1 ? 0 : text.length - index - 1;
	}

	function numberOr(value, fallback) {
		var parsed = Number(value);

		return Number.isFinite(parsed) ? parsed : fallback;
	}

	function isKnobInput(element) {
		return element && element.classList && element.classList.contains('knobControl__input');
	}

	function closest(element, selector) {
		return element && element.closest ? element.closest(selector) : null;
	}

	function forEach(list, callback) {
		for (var i = 0; i < list.length; i++) {
			callback(list[i]);
		}
	}

	global.CodaKnobControl = {
		initialize: initialize,
		refresh: refresh,
		refreshAll: refreshAll
	};
})(window);
