// Handles circle-of-fifths popover UI and target routing.
(function (global) {
	'use strict';

	function initialize(options) {
		var root = options && options.root ? options.root : global.document;
		var state = {
			anchorId: '',
			dragged: false,
			sectionId: ''
		};

		bindDrag(root, state);
		bindDocumentEvents(root, state, options || {});

		return {
			close: function () {
				close(root, state);
			},
			isOpen: function () {
				return isOpen(root);
			},
			updateAccess: function (report) {
				updateAccess(root, state, report);
			}
		};
	}

	function bindDocumentEvents(root, state, options) {
		on(root, 'click', function (event) {
			var trigger = closest(event.target, '#toggleCircleOfFifths') ||
				closest(event.target, '#toggleCircleOfFifthsFromContext') ||
				closest(event.target, '#toggleCircleOfFifthsFromForm') ||
				closest(event.target, '#workbenchContextKeyToggle') ||
				closest(event.target, '.progressionSectionCircleButton');
			var link = closest(event.target, '.revamp');

			if (trigger) {
				toggle(root, state, trigger, options);
				return;
			}

			if (link && shouldHandleCircleLink(root, link) && applyCircleLink(root, state, link, options)) {
				prevent(event);
				close(root, state);
				call(options, 'onTargetApplied');
				return;
			}

			if (closest(event.target, '#closeCircleOfFifths')) {
				close(root, state);
				return;
			}

			if (isOpen(root) && !closest(event.target, '.circlePopover__surface')) {
				close(root, state);
			}
		});

		on(root, 'keydown', function (event) {
			if (event.key === 'Escape') {
				close(root, state);
			}
		});
	}

	function shouldHandleCircleLink(root, link) {
		return !!(
			link &&
			link.getAttribute &&
			(link.getAttribute('data-section-circle-target') || (isOpen(root) && closest(link, '.circlePopover__surface')))
		);
	}

	function bindDrag(root, state) {
		var popover = query(root, '#circleOfFifthsPopover');
		var titlebar = query(root, '.circlePopover__titlebar');
		var dragState = null;

		if (!popover || !titlebar || titlebar.getAttribute('data-coda-draggable') === 'true') {
			return;
		}

		titlebar.setAttribute('data-coda-draggable', 'true');

		titlebar.addEventListener('mousedown', function (event) {
			var bounds;

			if (closest(event.target, 'button')) {
				return;
			}

			bounds = popover.getBoundingClientRect();
			dragState = {
				offsetX: event.clientX - bounds.left,
				offsetY: event.clientY - bounds.top
			};
			popover.classList.add('isDragging');
			prevent(event);
		});

		root.addEventListener('mousemove', function (event) {
			if (!dragState) {
				return;
			}

			move(popover, {
				x: event.clientX - dragState.offsetX,
				y: event.clientY - dragState.offsetY
			});
			state.dragged = true;
		});

		root.addEventListener('mouseup', function () {
			if (!dragState) {
				return;
			}

			dragState = null;
			popover.classList.remove('isDragging');
		});
	}

	function updateAccess(root, state, report) {
		var available = !!(report && report.circleOfFifths);

		updateToggleButton(query(root, '#toggleCircleOfFifths'), available);
		updateToggleButton(query(root, '#toggleCircleOfFifthsFromContext'), available);
		updateToggleButton(query(root, '#toggleCircleOfFifthsFromForm'), available);

		if (!available) {
			close(root, state);
		}
	}

	function updateToggleButton(button, available) {
		if (!button) {
			return;
		}

		button.hidden = !available;
		button.setAttribute('aria-hidden', available ? 'false' : 'true');

		if (!available) {
			button.setAttribute('aria-expanded', 'false');
		}
	}

	function toggle(root, state, trigger, options) {
		var triggerId = triggerIdFor(trigger);

		if (isOpen(root) && triggerId === state.anchorId) {
			close(root, state);
			return;
		}

		open(root, state, trigger, options);
	}

	function open(root, state, trigger, options) {
		var popover = query(root, '#circleOfFifthsPopover');
		var circle = circleForTrigger(trigger, options);
		var triggerId = triggerIdFor(trigger);
		var shouldResetPosition = !!trigger && (triggerId !== state.anchorId || !state.dragged);

		if (!popover || !circle) {
			return;
		}

		state.sectionId = trigger && trigger.getAttribute ? (trigger.getAttribute('data-section-circle') || '') : '';
		render(root, circle, state.sectionId, options);
		popover.hidden = false;

		if (shouldResetPosition) {
			positionNearTrigger(popover, trigger);
			state.dragged = false;
		}

		state.anchorId = triggerId;
		setExpanded(root, true);
	}

	function circleForTrigger(trigger, options) {
		var sectionId = trigger && trigger.getAttribute ? trigger.getAttribute('data-section-circle') : '';
		var section = sectionId && options.sectionForId ? options.sectionForId(sectionId) : null;

		if (section && section.circleOfFifths) {
			return section.circleOfFifths;
		}

		return options.report ? options.report().circleOfFifths : null;
	}

	function render(root, circle, sectionId, options) {
		var container = query(root, '#circuloQuintas');

		if (!container || !circle || !options.renderers || !options.renderers.circleOfFifths) {
			return;
		}

		container.innerHTML = options.renderers.circleOfFifths.render({
			notation: options.notation,
			notationStyle: options.notationStyle ? options.notationStyle() : 'anglosaxon',
			orderedKeys: circle.orderedKeys,
			sectionId: sectionId || '',
			selectedKey: circle.selectedKey
		});
	}

	function applyCircleLink(root, state, link, options) {
		var sectionId = link && link.getAttribute ? link.getAttribute('data-section-circle-target') : '';

		if (!sectionId) {
			sectionId = state.sectionId;
		}

		if (sectionId) {
			return call(options, 'onSectionTarget', sectionId, link.id) !== false;
		}

		return call(options, 'onGlobalTarget', link.id) !== false;
	}

	function close(root, state) {
		var popover = query(root, '#circleOfFifthsPopover');

		if (popover) {
			popover.hidden = true;
		}

		state.sectionId = '';
		setExpanded(root, false);
	}

	function isOpen(root) {
		var popover = query(root, '#circleOfFifthsPopover');

		return !!(popover && !popover.hidden);
	}

	function setExpanded(root, expanded) {
		updateExpanded(query(root, '#toggleCircleOfFifths'), expanded);
		updateExpanded(query(root, '#toggleCircleOfFifthsFromContext'), expanded);
		updateExpanded(query(root, '#toggleCircleOfFifthsFromForm'), expanded);
		updateExpanded(query(root, '#workbenchContextKeyToggle'), expanded);
		forEach(root, '.progressionSectionCircleButton', function (button) {
			updateExpanded(button, expanded);
		});
	}

	function updateExpanded(button, expanded) {
		if (button) {
			button.setAttribute('aria-expanded', expanded ? 'true' : 'false');
		}
	}

	function move(popover, position) {
		var width = popover.offsetWidth;
		var height = popover.offsetHeight;
		var maxLeft = Math.max(0, global.innerWidth - width);
		var maxTop = Math.max(0, global.innerHeight - height);
		var left = Math.max(0, Math.min(maxLeft, position.x));
		var top = Math.max(0, Math.min(maxTop, position.y));

		popover.style.left = left + 'px';
		popover.style.top = top + 'px';
		popover.style.right = 'auto';
	}

	function positionNearTrigger(popover, trigger) {
		var triggerBounds;
		var margin = 10;
		var width;
		var height;
		var maxLeft;
		var maxTop;
		var left;
		var top;

		if (!popover || !trigger || typeof trigger.getBoundingClientRect !== 'function') {
			return;
		}

		triggerBounds = trigger.getBoundingClientRect();
		width = popover.offsetWidth || 300;
		height = popover.offsetHeight || 260;
		maxLeft = Math.max(margin, global.innerWidth - width - margin);
		maxTop = Math.max(margin, global.innerHeight - height - margin);
		left = Math.min(maxLeft, Math.max(margin, triggerBounds.left));
		top = triggerBounds.bottom + margin;

		if (top + height > global.innerHeight - margin) {
			top = triggerBounds.top - height - margin;
		}

		top = Math.min(maxTop, Math.max(margin, top));
		popover.style.left = left + 'px';
		popover.style.top = top + 'px';
		popover.style.right = 'auto';
	}

	function triggerIdFor(trigger) {
		var sectionId = trigger && trigger.getAttribute ? trigger.getAttribute('data-section-circle') : '';

		if (trigger && trigger.id) {
			return trigger.id;
		}

		return sectionId ? 'section-' + sectionId : '';
	}

	function prevent(event) {
		if (event && typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
	}

	function call(options, callbackName) {
		var args = Array.prototype.slice.call(arguments, 2);

		if (options && typeof options[callbackName] === 'function') {
			return options[callbackName].apply(null, args);
		}

		return undefined;
	}

	function query(root, selector) {
		return root && root.querySelector ? root.querySelector(selector) : null;
	}

	function forEach(root, selector, callback) {
		var items = root && root.querySelectorAll ? root.querySelectorAll(selector) : [];

		for (var i = 0; i < items.length; i++) {
			callback(items[i]);
		}
	}

	function closest(target, selector) {
		return target && target.closest ? target.closest(selector) : null;
	}

	function on(element, eventName, handler) {
		if (element) {
			element.addEventListener(eventName, handler);
		}
	}

	global.CodaCircleOfFifthsPopover = {
		initialize: initialize,
		triggerIdFor: triggerIdFor
	};
})(window);
