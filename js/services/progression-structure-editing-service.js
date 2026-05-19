// Structural editing operations for progression measures and split-measure chords.
(function (global) {
	'use strict';

	var measureTimelineService = global.CodaProgressionMeasureTimeline;
	var structureIndex = global.CodaProgressionStructureIndex;

	function reorderMeasures(progression, fromIndex, toIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var movedMeasure;

		fromIndex = clampMeasureIndex(fromIndex, measures.length);
		toIndex = clampMeasureIndex(toIndex, measures.length);

		if (!progression || !measures.length || fromIndex === toIndex) {
			return progression;
		}

		movedMeasure = measures.splice(fromIndex, 1)[0];
		measures.splice(toIndex, 0, movedMeasure);

		return measureTimelineService.rebuildTimeline(progression, measures);
	}

	function reorderMeasureChords(progression, measureIndex, fromChordIndex, toChordIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var segments;
		var movedSegment;

		if (!progression || !measure || !measure.chords || measure.chords.length < 3) {
			return progression;
		}

		segments = measureTimelineService.measureSegments(measure);
		fromChordIndex = clampChordIndex(fromChordIndex, segments.length);
		toChordIndex = clampChordIndex(toChordIndex, segments.length);

		if (fromChordIndex === 0 || toChordIndex === 0 || fromChordIndex === toChordIndex) {
			return progression;
		}

		movedSegment = segments.splice(fromChordIndex, 1)[0];
		segments.splice(toChordIndex, 0, movedSegment);
		measures[index] = measureTimelineService.measureWithSegments(measure, segments, progression);

		return structureIndex.extendObject(progression, {
			measures: measures
		});
	}

	function removeMeasureChord(progression, measureIndex, chordIndex) {
		var measures = progression && progression.measures ? progression.measures.slice() : [];
		var index = clampMeasureIndex(measureIndex, measures.length);
		var measure = measures[index];
		var segments;
		var normalizedChordIndex;

		if (!progression || !measure || !measure.chords || measure.chords.length < 2) {
			return progression;
		}

		segments = measureTimelineService.measureSegments(measure);
		normalizedChordIndex = clampChordIndex(chordIndex, segments.length);
		if (normalizedChordIndex === 0) {
			return progression;
		}

		segments.splice(normalizedChordIndex, 1);
		measures[index] = measureTimelineService.measureWithSegments(measure, segments, progression);

		return structureIndex.extendObject(progression, {
			measures: measures
		});
	}

	function removeSection(progression, sectionId) {
		var sections = progression && progression.sections ? progression.sections : [];
		var section = findSection(sections, sectionId);
		var measures = progression && progression.measures ? progression.measures : [];
		var startIndex = Number(section && section.startIndex) || 0;
		var length = Number(section && section.length) || 0;
		var nextMeasures;
		var nextProgression;
		var nextSections;

		if (!progression || !section || section.id === 'A' || !length) {
			return progression;
		}

		nextMeasures = measures.slice(0, startIndex).concat(measures.slice(startIndex + length));
		nextProgression = measureTimelineService.rebuildTimeline(progression, nextMeasures);
		nextSections = normalizeSectionIdsAfterRemoval(rebuildSectionsWithout(sections, section.id));
		annotateSectionMeasures(nextProgression.measures, nextSections);

		return structureIndex.extendObject(nextProgression, {
			sections: nextSections
		});
	}

	function findSection(sections, sectionId) {
		for (var i = 0; i < (sections || []).length; i++) {
			if (sections[i].id === sectionId) {
				return sections[i];
			}
		}

		return null;
	}

	function rebuildSectionsWithout(sections, removedSectionId) {
		var nextSections = [];
		var startIndex = 0;

		for (var i = 0; i < (sections || []).length; i++) {
			var section = sections[i];
			var nextSection;

			if (!section || section.id === removedSectionId) {
				continue;
			}

			nextSection = structureIndex.extendObject(section, {
				startIndex: startIndex
			});
			nextSections.push(nextSection);
			startIndex += Number(nextSection.length) || 0;
		}

		return nextSections;
	}

	function normalizeSectionIdsAfterRemoval(sections) {
		if (findSection(sections, 'B') || !findSection(sections, 'C')) {
			return sections;
		}

		return sections.map(function (section) {
			if (section.id !== 'C') {
				return section;
			}

			return structureIndex.extendObject(section, {
				id: 'B',
				labelKey: sectionLabelKey('B')
			});
		});
	}

	function sectionLabelKey(sectionId) {
		if (sectionId === 'A\'') {
			return 'progression.sectionAprime';
		}

		if (sectionId === 'B') {
			return 'progression.sectionB';
		}

		if (sectionId === 'B\'') {
			return 'progression.sectionBprime';
		}

		if (sectionId === 'C') {
			return 'progression.sectionC';
		}

		return 'progression.sectionA';
	}

	function annotateSectionMeasures(measures, sections) {
		for (var i = 0; i < (measures || []).length; i++) {
			delete measures[i].sectionId;
			delete measures[i].sectionLabelKey;
		}

		for (var j = 0; j < (sections || []).length; j++) {
			var section = sections[j];
			var startIndex = Number(section.startIndex) || 0;
			var endIndex = Math.min((measures || []).length, startIndex + (Number(section.length) || 0));

			for (var k = startIndex; k < endIndex; k++) {
				measures[k].sectionId = section.id;
				measures[k].sectionLabelKey = section.labelKey;
			}
		}
	}

	function clampMeasureIndex(index, length) {
		return structureIndex.clampMeasureIndex(index, length);
	}

	function clampChordIndex(index, length) {
		return structureIndex.clampChordIndex(index, length);
	}

	global.CodaProgressionStructureEditing = {
		clampChordIndex: clampChordIndex,
		clampMeasureIndex: clampMeasureIndex,
		removeMeasureChord: removeMeasureChord,
		removeSection: removeSection,
		reorderMeasureChords: reorderMeasureChords,
		reorderMeasures: reorderMeasures
	};
})(window);
