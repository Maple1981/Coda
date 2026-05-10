// Derived indexes for CodaData catalogs. They keep the public arrays intact
// while giving domain and services fast lookups by musical identifiers.
(function (global) {
	'use strict';

	function create(data) {
		var indexes = {
			chords: indexChords(data.chords || []),
			circleOfFifths: indexCircleOfFifths(data.circleOfFifths || []),
			intervals: indexIntervals(data.intervals || []),
			notes: indexNotes(data.notes || []),
			scales: indexNamedCollection(data.scales || []),
			tunings: indexNamedCollection(data.tunings || [])
		};

		attachIndex(data.chords, indexes.chords);
		attachIndex(data.circleOfFifths, indexes.circleOfFifths);
		attachIndex(data.intervals, indexes.intervals);
		attachIndex(data.notes, indexes.notes);
		attachIndex(data.scales, indexes.scales);
		attachIndex(data.tunings, indexes.tunings);

		data.indexes = indexes;

		return indexes;
	}

	function indexNotes(notes) {
		var index = {
			byName: createMap(),
			indexByName: createMap()
		};

		for (var i = 0; i < notes.length; i++) {
			index.byName[notes[i].nombre] = notes[i];
			index.indexByName[notes[i].nombre] = i;

			if (notes[i].enarmonica !== undefined) {
				index.byName[notes[i].enarmonica] = notes[i];
				index.indexByName[notes[i].enarmonica] = i;
			}
		}

		return index;
	}

	function indexIntervals(intervals) {
		var index = {
			bySemitones: createMap()
		};

		for (var i = 0; i < intervals.length; i++) {
			index.bySemitones[String(parseInt(intervals[i].semitonos, 10))] = intervals[i];
		}

		return index;
	}

	function indexChords(chords) {
		var index = indexNamedCollection(chords);
		index.byPattern = createMap();

		for (var i = 0; i < chords.length; i++) {
			index.byPattern[chords[i].patron] = chords[i];
		}

		return index;
	}

	function indexCircleOfFifths(circleOfFifths) {
		var index = indexNamedCollection(circleOfFifths);
		index.byKeyName = createMap();

		for (var i = 0; i < circleOfFifths.length; i++) {
			addKeyAlias(index.byKeyName, circleOfFifths[i].nombre, i);
			addKeyAlias(index.byKeyName, circleOfFifths[i].enarmonica, i);
			addKeyAlias(index.byKeyName, circleOfFifths[i].aka, i);
		}

		return index;
	}

	function indexNamedCollection(collection) {
		var index = {
			byName: createMap(),
			indexByName: createMap(),
			indexesByName: createMap()
		};

		for (var i = 0; i < collection.length; i++) {
			var name = collection[i].nombre;

			if (index.byName[name] === undefined) {
				index.byName[name] = collection[i];
				index.indexByName[name] = i;
			}

			if (index.indexesByName[name] === undefined) {
				index.indexesByName[name] = [];
			}

			index.indexesByName[name].push(i);
		}

		return index;
	}

	function addKeyAlias(index, keyName, position) {
		if (keyName !== undefined) {
			index[keyName] = position;
		}
	}

	function attachIndex(collection, index) {
		if (!collection || typeof Object.defineProperty !== 'function') {
			return;
		}

		Object.defineProperty(collection, '_codaIndex', {
			configurable: true,
			enumerable: false,
			value: index
		});
	}

	function createMap() {
		return Object.create(null);
	}

	global.CodaDataIndex = {
		create: create
	};

	if (global.CodaData) {
		create(global.CodaData);
	}
})(window);
