// Transport controls for progression preview and MIDI export.
(function (global) {
	'use strict';

	var draggedMeasureIndex = null;
	var activeChordMenuButton = null;

	function initialize(options) {
		options = options || {};

		var root = query('#constructorProgresiones');
		var goStartButton = query('.transportButton--goStart');
		var listenButton = query('.transportButton--listen');
		var exportButton = query('.transportButton--export');
		var playbackHeadIndex = 0;

		if (!root || root.getAttribute('data-coda-progression-transport') === 'true') {
			return null;
		}

		root.setAttribute('data-coda-progression-transport', 'true');

		if (goStartButton) {
			goStartButton.addEventListener('click', function () {
				stopPreview(options, listenButton, playbackHeadIndex);
				playbackHeadIndex = 0;
				setPlaybackHead(playbackHeadIndex, false);
			});
		}

		if (listenButton) {
			listenButton.addEventListener('click', function () {
				togglePreview(options, listenButton, playbackHeadIndex, function (index) {
					playbackHeadIndex = index;
				});
			});
		}

		if (exportButton) {
			exportButton.addEventListener('click', function () {
				exportMidi(options);
			});
		}

		root.addEventListener('click', function (event) {
			var chordMenuButton = closest(event.target, '.measureChordMenuButton');
			var chordElement = closest(event.target, '.measureChord');
			var splitButton = closest(event.target, '.measureSplitButton');
			var measure = closest(event.target, '.measure');
			var clickedIndex;

			if (!measure || closest(event.target, '.measureDragHandle')) {
				return;
			}

			clickedIndex = measureIndex(measure);
			if (chordMenuButton) {
				event.preventDefault();
				if (typeof event.stopPropagation === 'function') {
					event.stopPropagation();
				}
				openChordMenu(options, chordMenuButton, clickedIndex, chordIndex(chordElement));
				return;
			}

			if (splitButton) {
				event.preventDefault();
				stopPreview(options, listenButton, playbackHeadIndex);
				closeChordMenu();
				updateMeasureSplit(options, splitButton.getAttribute('data-progression-split-action'), clickedIndex, chordIndex(chordElement));
				playbackHeadIndex = clickedIndex;
				setPlaybackHead(playbackHeadIndex, false);
				return;
			}

			if (
				options.progressionPlayback &&
				typeof options.progressionPlayback.isPlaying === 'function' &&
				options.progressionPlayback.isPlaying() &&
				clickedIndex === playbackHeadIndex
			) {
				stopPreview(options, listenButton, playbackHeadIndex);
				return;
			}

			playbackHeadIndex = clickedIndex;
			setPlaybackHead(playbackHeadIndex, false);
			playPreview(options, listenButton, playbackHeadIndex, function (index) {
				playbackHeadIndex = index;
			});
		});

		root.addEventListener('dragstart', function (event) {
			var measure = closest(event.target, '.measure');

			if (!measure || closest(event.target, '.measureSplitButton') || closest(event.target, '.measureChordMenuButton')) {
				return;
			}

			draggedMeasureIndex = measureIndex(measure);
			measure.classList.add('isDragging');

			if (event.dataTransfer) {
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/plain', String(draggedMeasureIndex));
			}
		});

		root.addEventListener('dragover', function (event) {
			var measure = closest(event.target, '.measure');

			if (!measure) {
				return;
			}

			event.preventDefault();
			measure.classList.add('isDropTarget');

			if (event.dataTransfer) {
				event.dataTransfer.dropEffect = 'move';
			}
		});

		root.addEventListener('dragleave', function (event) {
			var measure = closest(event.target, '.measure');

			if (measure) {
				measure.classList.remove('isDropTarget');
			}
		});

		root.addEventListener('drop', function (event) {
			var measure = closest(event.target, '.measure');
			var fromIndex = dragSourceIndex(event, draggedMeasureIndex);
			var toIndex;

			if (!measure) {
				return;
			}

			event.preventDefault();
			clearDragState();
			stopPreview(options, listenButton, playbackHeadIndex);
			toIndex = measureIndex(measure);
			reorderProgression(options, fromIndex, toIndex);
			playbackHeadIndex = toIndex;
			setPlaybackHead(playbackHeadIndex, false);
		});

		root.addEventListener('dragend', clearDragState);

		if (global.document && typeof global.document.addEventListener === 'function') {
			global.document.addEventListener('click', function (event) {
				var menuItem = closest(event.target, '.measureChordMenuItem');
				var menu = closest(event.target, '.progressionChordMenu');

				if (menuItem) {
					var replacement = replacementFromMenuItem(menuItem);
					var menuMeasureIndex = parseInt(menuItem.getAttribute('data-progression-index'), 10);
					var menuChordIndex = parseInt(menuItem.getAttribute('data-measure-chord-index'), 10);

					stopPreview(options, listenButton, playbackHeadIndex);
					updateMeasureChordReplacement(options, menuMeasureIndex, menuChordIndex, replacement);
					closeChordMenu();
					playbackHeadIndex = menuMeasureIndex;
					setPlaybackHead(playbackHeadIndex, false);
					return;
				}

				if (!menu && !closest(event.target, '.measureChordMenuButton')) {
					closeChordMenu();
				}
			});
		}

		return {
			exportMidi: function () {
				exportMidi(options);
			},
			setPlaybackHead: function (index) {
				playbackHeadIndex = normalizeHeadIndex(index, options.uiState ? options.uiState.getProgression() : null);
				setPlaybackHead(playbackHeadIndex, false);
			},
			stop: function () {
				stopPreview(options, listenButton, playbackHeadIndex);
			},
			togglePreview: function () {
				togglePreview(options, listenButton, playbackHeadIndex, function (index) {
					playbackHeadIndex = index;
				});
			}
		};
	}

	function togglePreview(options, listenButton, playbackHeadIndex, setPlaybackHeadIndex) {
		var playback = options.progressionPlayback;
		var progression = options.uiState ? options.uiState.getProgression() : null;

		if (!playback) {
			return;
		}

		if (playback.isPlaying && playback.isPlaying()) {
			stopPreview(options, listenButton, playbackHeadIndex);
			return;
		}

		if (!progression) {
			return;
		}

		playPreview(options, listenButton, playbackHeadIndex, setPlaybackHeadIndex);
	}

	function playPreview(options, listenButton, playbackHeadIndex, setPlaybackHeadIndex) {
		var playback = options.progressionPlayback;
		var progression = options.uiState ? options.uiState.getProgression() : null;

		if (!playback || !progression) {
			return false;
		}

		playbackHeadIndex = normalizeHeadIndex(playbackHeadIndex, progression);

		return playback.play(progression, {
			onComplete: function () {
				setPlayingState(listenButton, false, options.i18n);
				setPlaybackHead(playbackHeadIndex, false);
			},
			onCycleComplete: function () {
				playbackHeadIndex = 0;
				if (typeof setPlaybackHeadIndex === 'function') {
					setPlaybackHeadIndex(playbackHeadIndex);
				}
				setPlaybackHead(playbackHeadIndex, true);
			},
			onMeasureStart: function (measure, index) {
				playbackHeadIndex = index;
				if (typeof setPlaybackHeadIndex === 'function') {
					setPlaybackHeadIndex(index);
				}
				setPlaybackHead(index, true);
			},
			onStart: function () {
				setPlayingState(listenButton, true, options.i18n);
			},
			onStop: function () {
				setPlayingState(listenButton, false, options.i18n);
				setPlaybackHead(playbackHeadIndex, false);
			},
			shouldLoop: function () {
				return isLoopEnabled();
			},
			shouldPlayMetronome: function () {
				return isMetronomeEnabled();
			},
			startIndex: playbackHeadIndex
		});
	}

	function stopPreview(options, listenButton, playbackHeadIndex) {
		if (options.progressionPlayback && typeof options.progressionPlayback.stop === 'function') {
			options.progressionPlayback.stop();
		}

		setPlayingState(listenButton, false, options.i18n);
		setPlaybackHead(playbackHeadIndex || 0, false);
	}

	function reorderProgression(options, fromIndex, toIndex) {
		var progression = options.uiState ? options.uiState.getProgression() : null;
		var reorderedProgression;

		if (
			!progression ||
			!options.application ||
			typeof options.application.reorderProgressionMeasures !== 'function'
		) {
			return;
		}

		reorderedProgression = options.application.reorderProgressionMeasures(progression, fromIndex, toIndex);

		if (options.onProgressionChanged && reorderedProgression) {
			options.onProgressionChanged(reorderedProgression, {
				playbackHeadIndex: toIndex
			});
		}
	}

	function updateMeasureSplit(options, action, measureIndex, chordIndex) {
		var progression = options.uiState ? options.uiState.getProgression() : null;
		var nextProgression = null;

		if (!progression || !options.application) {
			return;
		}

		if (action === 'remove' && typeof options.application.removeProgressionMeasureChord === 'function') {
			nextProgression = options.application.removeProgressionMeasureChord(progression, measureIndex, chordIndex);
		} else if (action === 'add' && typeof options.application.addProgressionMeasureChord === 'function') {
			nextProgression = options.application.addProgressionMeasureChord(progression, measureIndex, {
				chordIndex: chordIndex,
				data: options.data,
				progressionState: options.uiState && options.uiState.getProgressionState ? options.uiState.getProgressionState() : null,
				report: options.uiState && options.uiState.getReport ? options.uiState.getReport() : null
			});
		}

		if (options.onProgressionChanged && nextProgression) {
			options.onProgressionChanged(nextProgression, {
				playbackHeadIndex: measureIndex
			});
		}
	}

	function updateMeasureChordReplacement(options, measureIndex, chordIndex, replacement) {
		var progression = options.uiState ? options.uiState.getProgression() : null;
		var nextProgression = null;

		if (
			!progression ||
			!options.application ||
			typeof options.application.replaceProgressionMeasureChord !== 'function'
		) {
			return;
		}

		nextProgression = options.application.replaceProgressionMeasureChord(progression, measureIndex, chordIndex, replacement, {
			data: options.data,
			progressionState: options.uiState && options.uiState.getProgressionState ? options.uiState.getProgressionState() : null,
			report: options.uiState && options.uiState.getReport ? options.uiState.getReport() : null
		});

		if (options.onProgressionChanged && nextProgression) {
			options.onProgressionChanged(nextProgression, {
				playbackHeadIndex: measureIndex
			});
		}
	}

	function openChordMenu(options, button, measureIndex, chordIndex) {
		var progression = options.uiState ? options.uiState.getProgression() : null;
		var report = options.uiState && options.uiState.getReport ? options.uiState.getReport() : null;
		var measure = progression && progression.measures ? progression.measures[measureIndex] : null;
		var currentSegment = currentChordSegment(measure, chordIndex);
		var menuData;
		var menu;

		if (!button || !measure || !options.application || typeof options.application.buildProgressionChordMenu !== 'function') {
			return;
		}

		closeChordMenu();
		menuData = options.application.buildProgressionChordMenu({
			currentSegment: currentSegment,
			report: report
		});
		menu = renderChordMenu(menuData, {
			chordIndex: chordIndex,
			i18n: options.i18n,
			measureIndex: measureIndex
		});

		if (!menu) {
			return;
		}

		global.document.body.appendChild(menu);
		positionChordMenu(menu, button);
		activeChordMenuButton = button;
		button.setAttribute('aria-expanded', 'true');
	}

	function renderChordMenu(menuData, options) {
		var doc = global.document;
		var menu;
		var hasItems = false;

		if (!doc || typeof doc.createElement !== 'function') {
			return null;
		}

		menu = doc.createElement('div');
		menu.className = 'progressionChordMenu';
		menu.setAttribute('role', 'menu');

		for (var i = 0; i < (menuData || []).length; i++) {
			if (!menuData[i].items.length) {
				continue;
			}

			hasItems = true;
			menu.appendChild(renderChordMenuGroup(menuData[i], options));
		}

		return hasItems ? menu : null;
	}

	function renderChordMenuGroup(group, options) {
		var doc = global.document;
		var section = doc.createElement('section');
		var title = doc.createElement('h3');

		section.className = 'progressionChordMenu__group';
		title.textContent = translate(options.i18n, 'progression.chordMenu.' + group.id);
		section.appendChild(title);

		for (var i = 0; i < group.items.length; i++) {
			section.appendChild(renderChordMenuChord(group.items[i], options));
		}

		return section;
	}

	function renderChordMenuChord(item, options) {
		var doc = global.document;
		var details = doc.createElement('details');
		var summary = doc.createElement('summary');
		var optionsContainer = doc.createElement('div');

		details.className = 'progressionChordMenu__chord';
		summary.textContent = item.chordName + (item.degree ? ' · ' + item.degree : '');
		optionsContainer.className = 'progressionChordMenu__options';
		details.appendChild(summary);
		details.appendChild(optionsContainer);

		for (var i = 0; i < item.options.length; i++) {
			optionsContainer.appendChild(renderChordMenuOption(item.options[i], options));
		}

		return details;
	}

	function renderChordMenuOption(item, options) {
		var doc = global.document;
		var button = doc.createElement('button');
		var kindLabel = item.kind === 'seventh' ? translate(options.i18n, 'progression.chordMenu.seventh') : translate(options.i18n, 'progression.chordMenu.triad');

		button.type = 'button';
		button.className = 'measureChordMenuItem';
		button.setAttribute('data-progression-index', options.measureIndex);
		button.setAttribute('data-measure-chord-index', options.chordIndex);
		button.setAttribute('data-degree-index', item.degreeIndex);
		button.setAttribute('data-chord-kind', item.kind);
		button.setAttribute('data-inversion-index', item.inversionIndex);
		button.textContent = kindLabel + ': ' + item.displayName + (item.degree ? ' · ' + item.degree : '');

		return button;
	}

	function closeChordMenu() {
		var menu = query('.progressionChordMenu');

		if (menu && menu.parentNode) {
			menu.parentNode.removeChild(menu);
		}

		if (activeChordMenuButton) {
			activeChordMenuButton.setAttribute('aria-expanded', 'false');
			activeChordMenuButton = null;
		}
	}

	function positionChordMenu(menu, button) {
		var bounds;
		var menuWidth = 280;
		var left;
		var top;

		if (!menu || !button || typeof button.getBoundingClientRect !== 'function') {
			return;
		}

		bounds = button.getBoundingClientRect();
		left = Math.max(8, Math.min(global.innerWidth - menuWidth - 8, bounds.left));
		top = Math.max(8, bounds.bottom + 6);

		menu.style.left = left + 'px';
		menu.style.top = top + 'px';
	}

	function currentChordSegment(measure, chordIndex) {
		if (!measure) {
			return null;
		}

		if (measure.chords && measure.chords.length) {
			return measure.chords[Math.min(chordIndex, measure.chords.length - 1)];
		}

		return measure;
	}

	function replacementFromMenuItem(item) {
		return {
			degreeIndex: parseInt(item.getAttribute('data-degree-index'), 10),
			inversionIndex: parseInt(item.getAttribute('data-inversion-index'), 10),
			kind: item.getAttribute('data-chord-kind')
		};
	}

	function exportMidi(options) {
		var selection = options.uiState ? options.uiState.getSelection() : null;
		var progression = options.uiState ? options.uiState.getProgression() : null;
		var midiFile;

		if (!progression || !options.application || typeof options.application.buildProgressionMidiFile !== 'function') {
			return;
		}

		midiFile = options.application.buildProgressionMidiFile({
			data: options.data,
			midiInstrument: selection ? selection.midiInstrument : null,
			progression: progression
		});

		downloadMidiFile(midiFile);
	}

	function downloadMidiFile(midiFile) {
		var blob;
		var link;
		var url;

		if (!midiFile || !midiFile.bytes || !global.document || typeof global.Blob !== 'function') {
			return;
		}

		blob = new global.Blob([midiFile.bytes], {
			type: midiFile.mimeType || 'audio/midi'
		});
		url = global.URL && typeof global.URL.createObjectURL === 'function' ? global.URL.createObjectURL(blob) : '';
		link = global.document.createElement('a');
		link.href = url;
		link.download = midiFile.fileName || 'coda-progression.mid';
		link.style.display = 'none';
		global.document.body.appendChild(link);
		link.click();
		global.document.body.removeChild(link);

		if (url && global.URL && typeof global.URL.revokeObjectURL === 'function') {
			global.URL.revokeObjectURL(url);
		}
	}

	function setPlayingState(button, playing, i18n) {
		var icon;
		var label;

		if (!button) {
			return;
		}

		button.classList.toggle('isPlaying', playing);
		button.setAttribute('aria-pressed', playing ? 'true' : 'false');
		icon = button.querySelector('.material-icons');
		label = button.querySelector('span[data-i18n="progression.listen"]');

		if (icon) {
			icon.textContent = playing ? 'stop' : 'play_arrow';
		}

		if (label) {
			label.textContent = playing ? translate(i18n, 'progression.stop') : translate(i18n, 'progression.listen');
		}
	}

	function setActiveMeasure(bar) {
		clearActiveMeasure();

		var measure = query('.measure[data-progression-bar="' + bar + '"]');

		if (measure) {
			measure.classList.add('isPlaying');
		}
	}

	function setPlaybackHead(index, playing) {
		clearPlaybackHead();

		var measure = query('.measure[data-progression-index="' + index + '"]');

		if (measure) {
			measure.classList.add('isPlaybackHead');
			measure.classList.toggle('isPlaying', playing === true);
		}

		updateGoStartVisibility(index);
	}

	function clearActiveMeasure() {
		var measures = global.document ? global.document.querySelectorAll('.measure.isPlaying') : [];

		Array.prototype.forEach.call(measures, function (measure) {
			measure.classList.remove('isPlaying');
		});
	}

	function clearPlaybackHead() {
		var measures = global.document ? global.document.querySelectorAll('.measure.isPlaybackHead, .measure.isPlaying') : [];

		Array.prototype.forEach.call(measures, function (measure) {
			measure.classList.remove('isPlaybackHead');
			measure.classList.remove('isPlaying');
		});
	}

	function clearDragState() {
		draggedMeasureIndex = null;
		if (!global.document) {
			return;
		}

		Array.prototype.forEach.call(global.document.querySelectorAll('.measure.isDragging, .measure.isDropTarget'), function (measure) {
			measure.classList.remove('isDragging');
			measure.classList.remove('isDropTarget');
		});
	}

	function dragSourceIndex(event, fallbackIndex) {
		var dataIndex = event && event.dataTransfer ? event.dataTransfer.getData('text/plain') : '';
		var numericIndex = parseInt(dataIndex, 10);

		return isNaN(numericIndex) ? fallbackIndex : numericIndex;
	}

	function measureIndex(measure) {
		var index = parseInt(measure.getAttribute('data-progression-index'), 10);

		return isNaN(index) ? 0 : index;
	}

	function chordIndex(chordElement) {
		var index = chordElement ? parseInt(chordElement.getAttribute('data-measure-chord-index'), 10) : 0;

		return isNaN(index) ? 0 : index;
	}

	function normalizeHeadIndex(index, progression) {
		var measures = progression && progression.measures ? progression.measures : [];
		var numericIndex = parseInt(index, 10);

		if (!measures.length || isNaN(numericIndex)) {
			return 0;
		}

		return Math.max(0, Math.min(measures.length - 1, numericIndex));
	}

	function isLoopEnabled() {
		var checkbox = query('#progressionLoop');

		return checkbox ? checkbox.checked === true : false;
	}

	function isMetronomeEnabled() {
		var checkbox = query('#progressionMetronome');

		return checkbox ? checkbox.checked === true : false;
	}

	function updateGoStartVisibility(index) {
		var button = query('.transportButton--goStart');

		if (button) {
			button.hidden = Number(index) <= 0;
		}
	}

	function translate(i18n, key) {
		return i18n && typeof i18n.t === 'function' ? i18n.t(key) : key;
	}

	function query(selector) {
		return global.document ? global.document.querySelector(selector) : null;
	}

	function closest(target, selector) {
		return target && target.closest ? target.closest(selector) : null;
	}

	global.CodaProgressionTransport = {
		clearPlaybackHead: clearPlaybackHead,
		clearActiveMeasure: clearActiveMeasure,
		downloadMidiFile: downloadMidiFile,
		initialize: initialize,
		setActiveMeasure: setActiveMeasure,
		setPlaybackHead: setPlaybackHead,
		setPlayingState: setPlayingState
	};
})(window);
