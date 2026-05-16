// Shared arpeggio pattern ordering for playback and MIDI export.
(function (global) {
	'use strict';

	function pattern(articulation) {
		switch (String(articulation || '')) {
		case 'down':
		case 'arpeggio_down':
			return 'down';
		case 'upDown':
		case 'arpeggio_up_down':
			return 'upDown';
		case 'downUp':
		case 'arpeggio_down_up':
			return 'downUp';
		case 'alternate':
		case 'arpeggio_alternate':
			return 'alternate';
		case 'outsideIn':
		case 'arpeggio_outside_in':
			return 'outsideIn';
		case 'random':
		case 'arpeggio_random':
			return 'random';
		case 'up':
		case 'arpeggio':
		case 'arpeggio_up':
		default:
			return 'up';
		}
	}

	function orderIndexes(noteCount, articulation, seed) {
		var count = Math.max(0, parseInt(noteCount, 10) || 0);
		var selectedPattern = pattern(articulation);
		var indexes = ascendingIndexes(count);

		if (count < 2) {
			return indexes;
		}

		if (selectedPattern === 'down') {
			return indexes.reverse();
		}

		if (selectedPattern === 'upDown') {
			return indexes.concat(ascendingIndexes(count).reverse().slice(1, -1));
		}

		if (selectedPattern === 'downUp') {
			return indexes.reverse().concat(ascendingIndexes(count).slice(1, -1));
		}

		if (selectedPattern === 'alternate') {
			return alternatingIndexes(count);
		}

		if (selectedPattern === 'outsideIn') {
			return outsideInIndexes(count);
		}

		if (selectedPattern === 'random') {
			return deterministicShuffle(indexes, seed || count);
		}

		return indexes;
	}

	function ascendingIndexes(count) {
		var indexes = [];

		for (var i = 0; i < count; i++) {
			indexes.push(i);
		}

		return indexes;
	}

	function alternatingIndexes(count) {
		var indexes = [];
		var i;

		for (i = 0; i < count; i += 2) {
			indexes.push(i);
		}

		for (i = 1; i < count; i += 2) {
			indexes.push(i);
		}

		return indexes;
	}

	function outsideInIndexes(count) {
		var indexes = [];
		var left = 0;
		var right = count - 1;

		while (left <= right) {
			indexes.push(left);

			if (right !== left) {
				indexes.push(right);
			}

			left += 1;
			right -= 1;
		}

		return indexes;
	}

	function deterministicShuffle(indexes, seed) {
		var shuffled = indexes.slice();

		for (var i = shuffled.length - 1; i > 0; i--) {
			var randomValue = deterministicValue((Number(seed) || 0) + (i * 37));
			var swapIndex = Math.floor(randomValue * (i + 1));
			var current = shuffled[i];

			shuffled[i] = shuffled[swapIndex];
			shuffled[swapIndex] = current;
		}

		return shuffled;
	}

	function deterministicValue(seed) {
		var value = Math.sin(seed) * 10000;

		return value - Math.floor(value);
	}

	global.CodaProgressionArpeggioPatterns = {
		ascendingIndexes: ascendingIndexes,
		orderIndexes: orderIndexes,
		pattern: pattern
	};
})(window);
