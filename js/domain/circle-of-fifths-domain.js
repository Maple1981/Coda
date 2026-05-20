// Pure helpers for preparing the circle-of-fifths view model.
(function (global) {
	'use strict';

	function buildCircleOfFifthsView(options) {
		if (options.scaleDefinition.tonal == null) {
			return null;
		}

		var selectedKey = selectedKeyName(options.tonicName, options.selectedScaleIndex, options.preferFlats);
		var cleanCircle = cleanCircleOfFifths(options.circleOfFifths);
		var selectedIndex = findKeyIndex(options.circleOfFifths, selectedKey);

		if (selectedIndex === 13) {
			selectedIndex = 6;
		}

		if (selectedIndex < 0) {
			return null;
		}

		return {
			orderedKeys: applyCircleNotation(cleanCircle, options.circleOfFifths, options.preferFlats),
			selectedKey: selectedKey
		};
	}

	function selectedKeyName(tonicName, selectedScaleIndex, preferFlats) {
		if (String(selectedScaleIndex) === '0') {
			if (tonicName === 'F#' && preferFlats) {
				return 'Gb';
			}

			return tonicName;
		}

		if (tonicName === 'A#') {
			return 'Bbm';
		}

		return tonicName + 'm';
	}

	function cleanCircleOfFifths(circleOfFifths) {
		return circleOfFifths.slice(0, 12);
	}

	function applyCircleNotation(circleOfFifths, fullCircleOfFifths, preferFlats) {
		var keys = cloneCircleKeys(circleOfFifths);

		if (!preferFlats) {
			keys[6] = cloneCircleKey(fullCircleOfFifths[12] || keys[6]);
		}

		return keys;
	}

	function cloneCircleKeys(circleOfFifths) {
		var keys = [];

		for (var i = 0; i < circleOfFifths.length; i++) {
			keys.push(cloneCircleKey(circleOfFifths[i]));
		}

		return keys;
	}

	function cloneCircleKey(key) {
		var clone = {};

		for (var property in key) {
			if (Object.prototype.hasOwnProperty.call(key, property)) {
				clone[property] = key[property];
			}
		}

		return clone;
	}

	function findKeyIndex(circleOfFifths, keyName) {
		var foundIndex = -1;

		for (var i = 0; i < circleOfFifths.length; i++) {
			if (
				circleOfFifths[i].nombre === keyName ||
				circleOfFifths[i].enarmonica === keyName ||
				circleOfFifths[i].aka === keyName
			) {
				foundIndex = i;
			}
		}

		return foundIndex;
	}

	function orderCircle(circleOfFifths, selectedIndex) {
		var orderedKeys = [];

		for (var i = 0; i < 12; i++) {
			var currentIndex = selectedIndex - i;

			if (currentIndex <= -1) {
				currentIndex += circleOfFifths.length;
			}

			orderedKeys.push(circleOfFifths[currentIndex]);
		}

		return orderedKeys;
	}

	function shouldPreferFlatsForKeySignature(options) {
		var scaleDefinition = options.scaleDefinition;

		if (!scaleDefinition || (scaleDefinition.tonal == null && scaleDefinition.modal == null)) {
			return null;
		}

		if (scaleDefinition.modal === 'true') {
			return shouldPreferFlatsForMode(options);
		}

		if (String(options.selectedScaleIndex) === '0') {
			return preferFlatsForMajorKey(options.tonicName);
		}

		return preferFlatsForMinorKey(options.tonicName + 'm');
	}

	function shouldPreferFlatsForMode(options) {
		if (isMajorRelatedMode(options.selectedScaleIndex, options.scaleDefinition.nombre)) {
			return preferFlatsForMajorKey(options.tonicName);
		}

		return preferFlatsForMinorKey(options.tonicName + 'm');
	}

	function isMajorRelatedMode(selectedScaleIndex, scaleName) {
		var majorRelatedModeIndexes = [13, 16, 17];
		var majorRelatedModeNames = ['Modo jónico', 'Modo lidio', 'Modo mixolidio'];

		if (majorRelatedModeIndexes.indexOf(Number(selectedScaleIndex)) > -1) {
			return true;
		}

		return majorRelatedModeNames.indexOf(scaleName) > -1;
	}

	function preferFlatsForMajorKey(keyName) {
		var flatKeys = ['C', 'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];

		return flatKeys.indexOf(keyName) > -1;
	}

	function preferFlatsForMinorKey(keyName) {
		var flatKeys = ['Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm', 'Abm'];

		return flatKeys.indexOf(keyName) > -1;
	}

	global.CodaCircleOfFifthsDomain = {
		buildCircleOfFifthsView: buildCircleOfFifthsView,
		applyCircleNotation: applyCircleNotation,
		cleanCircleOfFifths: cleanCircleOfFifths,
		cloneCircleKey: cloneCircleKey,
		cloneCircleKeys: cloneCircleKeys,
		findKeyIndex: findKeyIndex,
		isMajorRelatedMode: isMajorRelatedMode,
		orderCircle: orderCircle,
		preferFlatsForMajorKey: preferFlatsForMajorKey,
		preferFlatsForMinorKey: preferFlatsForMinorKey,
		selectedKeyName: selectedKeyName,
		shouldPreferFlatsForMode: shouldPreferFlatsForMode,
		shouldPreferFlatsForKeySignature: shouldPreferFlatsForKeySignature
	};
})(window);
