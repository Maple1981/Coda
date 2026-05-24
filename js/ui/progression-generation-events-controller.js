// Binds progression generation UI events to controller callbacks.
(function (global) {
	'use strict';

	function initialize(options) {
		var root = options && options.root ? options.root : global.document;
		var constructor = query(root, '#constructorProgresiones');

		on(query(root, '#generateProgression'), 'click', function () {
			call(options, 'onGenerate');
		});

		on(constructor, 'click', function (event) {
			if (closest(event.target, '#generateProgressionSectionB')) {
				call(options, 'onGenerateSectionB');
			}
		});

		on(constructor, 'click', function (event) {
			var sectionType;

			if (!closest(event.target, '#generateProgressionNextSection')) {
				return;
			}

			sectionType = valueOf(query(root, '#progressionNextSectionType'));
			call(options, 'onGenerateNextSection', sectionType, modulationTypeForSection(root, sectionType));
		});

		on(constructor, 'change', function (event) {
			if (!event.target || event.target.id !== 'progressionNextSectionType') {
				return;
			}

			call(options, 'onSectionTypeChange', event.target.value);
		});

		on(constructor, 'click', function (event) {
			var button = closest(event.target, '.progressionSectionDeleteButton') ||
				closest(event.target, '.progressionSectionNavDeleteButton');

			if (!button) {
				return;
			}

			call(options, 'onRemoveSection', button.getAttribute('data-section-delete'));
		});
	}

	function modulationTypeForSection(root, sectionType) {
		return sectionType === 'contrast' ? (valueOf(query(root, '#progressionNextSectionModulationType')) || 'none') : 'none';
	}

	function call(options, callbackName) {
		var args = Array.prototype.slice.call(arguments, 2);

		if (options && typeof options[callbackName] === 'function') {
			options[callbackName].apply(null, args);
		}
	}

	function on(element, eventName, handler) {
		if (element) {
			element.addEventListener(eventName, handler);
		}
	}

	function query(root, selector) {
		return root && root.querySelector ? root.querySelector(selector) : null;
	}

	function closest(target, selector) {
		return target && target.closest ? target.closest(selector) : null;
	}

	function valueOf(element) {
		return element ? element.value : '';
	}

	global.CodaProgressionGenerationEvents = {
		initialize: initialize,
		modulationTypeForSection: modulationTypeForSection
	};
})(window);
