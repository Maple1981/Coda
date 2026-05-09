// Pure helpers for preparing the circle-of-fifths view model.
(function (global) {
	'use strict';

	function buildCircleOfFifthsView(options) {
		if (options.scaleDefinition.tonal == null) {
			return null;
		}

		var selectedKey = selectedKeyName(options.tonicName, options.selectedScaleIndex);
		var cleanCircle = cleanCircleOfFifths(options.circleOfFifths);
		var selectedIndex = findKeyIndex(options.circleOfFifths, selectedKey);

		if (selectedIndex === 13) {
			selectedIndex = 6;
		}

		if (selectedIndex < 0) {
			return null;
		}

		return {
			orderedKeys: orderCircle(cleanCircle, selectedIndex),
			selectedKey: selectedKey
		};
	}

	function selectedKeyName(tonicName, selectedScaleIndex) {
		if (String(selectedScaleIndex) === '0') {
			if (tonicName === 'F#') {
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

	global.CodaCircleOfFifthsDomain = {
		buildCircleOfFifthsView: buildCircleOfFifthsView,
		cleanCircleOfFifths: cleanCircleOfFifths,
		findKeyIndex: findKeyIndex,
		orderCircle: orderCircle,
		selectedKeyName: selectedKeyName
	};
})(window);
