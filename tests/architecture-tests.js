const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const context = {
	console,
	window: {}
};
context.window.window = context.window;
vm.createContext(context);

function runScript(relativePath) {
	const source = fs.readFileSync(path.join(root, relativePath), 'utf8');
	vm.runInContext(source, context, { filename: relativePath });
}

runScript('js/bootstrap/script-manifest.js');

const manifestScripts = context.window.CodaScriptManifest.applicationScripts;
manifestScripts.filter(function (scriptPath) {
	return scriptPath !== 'js/app.js';
}).forEach(runScript);

const global = context.window;
const scaleReportControllerSource = fs.readFileSync(path.join(root, 'js/ui/scale-report-controller.js'), 'utf8').replace(/\r\n/g, '\n');

assert.ok(global.CodaData);
assert.ok(global.CodaDataCatalogs);
assert.ok(global.CodaChangelogContent.es);
assert.ok(global.CodaChangelogContent.en);
assert.ok(global.CodaWelcomeContent.es);
assert.ok(global.CodaWelcomeContent.en);
assert.ok(global.CodaDataIndex.create);
assert.ok(global.CodaTranslations);
assert.ok(global.CodaI18n.create);
assert.ok(global.CodaMusicalContext.create);
assert.ok(global.CodaCircleOfFifthsTargets.reportForTarget);
assert.ok(global.CodaNotation.formatNoteName);
assert.ok(global.CodaPreferences.create);
assert.ok(global.CodaProgressionPreferences.fromPreferences);
assert.ok(global.CodaProgressionDocument.normalize);
assert.ok(global.CodaProgressionWorkspace.build);
assert.ok(global.CodaProgressionWorkspaceStorage.read);
assert.ok(global.CodaProgressionStateNormalizer.normalize);
assert.ok(global.CodaProgressionDocumentTransform.applyState);
assert.ok(global.CodaProgressionDegreeResolver.fromGeneratedPlan);
assert.ok(global.CodaProgressionPitch.normalizePitchName);
assert.ok(global.CodaProgressionClassicalDissonance.allowsSuspension);
assert.ok(global.CodaProgressionObjects.extendObject);
assert.ok(global.CodaProgressionObjects.cloneJson);
assert.ok(global.CodaProgressionChordQuality.chordQualitySuffix);
assert.ok(global.CodaProgressionVoiceLeadingScore.voiceLeadingTransitionScore);
assert.ok(global.CodaProgressionVoicingDisposition.chooseCandidate);
assert.ok(global.CodaProgressionVoicingFactors.prepareBaseNotesForVoiceCount);
assert.ok(global.CodaProgressionVoicingMidi.notesToAscendingMidi);
assert.ok(global.CodaProgressionVoicingFactory.create);
assert.ok(global.CodaProgressionVoicingSelection.chooseVoicing);
assert.ok(global.CodaProgressionVoicingSelection.inversionRunPenalty);
assert.ok(global.CodaProgressionVoicing.chooseVoicing);
assert.ok(global.CodaProgressionPedalLinks.commonVoiceLinks);
assert.ok(global.CodaProgressionVoiceLeading.annotateMeasures);
assert.ok(global.CodaProgressionMelodicCounterpoint.annotateMeasures);
assert.ok(global.CodaProgressionMeasureClone.cloneMeasure);
assert.ok(global.CodaProgressionMeasureSegments.measureSegments);
assert.ok(global.CodaProgressionTiming.measureTiming);
assert.ok(global.CodaProgressionMeasureTimeline.rebuildTimeline);
assert.ok(global.CodaProgressionFormatting.formatDegreeForChord);
assert.ok(global.CodaProgressionHarmonicAnalysis.analyze);
assert.ok(global.CodaProgressionAnalysisLabels.sourceLabel);
assert.ok(global.CodaProgressionAnalysisLabels.sourceLabelDescriptor);
assert.ok(global.CodaProgressionTonalFunction.forDegree);
assert.ok(global.CodaProgressionMeasureContext.resolvedDegreeFromMeasure);
assert.ok(global.CodaProgressionStructureIndex.clampMeasureIndex);
assert.ok(global.CodaProgressionStructureEditing.reorderMeasures);
assert.ok(global.CodaProgressionStructureEditing.removeSection);
assert.ok(global.CodaProgressionSuspensionResolution.choose);
assert.ok(global.CodaProgressionAdditionalChordScore.score);
assert.ok(global.CodaProgressionAdditionalChord.choose);
assert.ok(global.CodaProgressionSegmentBuilder.fromPlan);
assert.ok(global.CodaProgressionReplacementChord.buildSegment);
assert.ok(global.CodaProgressionMeasureChordAddition.addMeasureChord);
assert.ok(global.CodaProgressionMeasureChordReplacement.replaceMeasureChord);
assert.ok(global.CodaProgressionEditing.addMeasureChord);
assert.ok(global.CodaProgressionEditCommands.apply);
assert.ok(global.CodaProgressionRevoice.baseDegreeDisplayName);
assert.ok(global.CodaProgressionTensions.addToNotes);
assert.ok(global.CodaProgressionSuspensionHeuristic.probability);
assert.ok(global.CodaProgressionSuspension.choose);
assert.ok(global.CodaProgressionSeventhDecision.shouldUseSeventh);
assert.ok(global.CodaProgressionChordPlan.build);
assert.ok(global.CodaProgressionHarmonicDensity.apply);
assert.ok(global.CodaProgressionHarmonicDensity.chordCountForMeasure);
assert.ok(global.CodaProgressionMeasureBuilder.build);
assert.ok(global.CodaProgressionResult.build);
assert.ok(global.CodaProgressionStyle.isModern);
assert.ok(global.CodaProgressionChromaticCadence.neapolitanDegree);
assert.ok(global.CodaProgressionCadencePlanner.finalCadenceForPattern);
assert.ok(global.CodaProgressionCadencePlanner.forceCadentialSixFourEnding);
assert.ok(global.CodaProgressionModalPlanner.createPlan);
assert.ok(global.CodaProgressionPatternWeight.adjustedPatternWeight);
assert.ok(global.CodaProgressionPatternSelector.choose);
assert.ok(global.CodaProgressionPhraseBlockSelector.choose);
assert.ok(global.CodaProgressionPlanner.createPlan);
assert.ok(global.CodaProgressionPlanner.applyOpeningSectionFunctionBias);
assert.ok(global.CodaProgressionBuilder.fromState);
assert.ok(global.CodaProgressionSectionDocument.appendSection);
assert.ok(global.CodaProgressionSectionDocument.sectionRange);
assert.ok(global.CodaProgressionSectionDocument.sectionTransitionFromOrigin);
assert.ok(global.CodaProgressionSectionRetarget.replaceContext);
assert.ok(global.CodaProgressionSectionVariation.createVariationMeasures);
assert.ok(global.CodaProgressionSectionCandidates.chooseContrastCandidate);
assert.ok(global.CodaProgressionSectionModulation.prepare);
assert.ok(global.CodaProgressionSectionContrast.generate);
assert.ok(global.CodaProgressionSectionOperations.retargetSection);
assert.ok(global.CodaProgressionChordMenuOptions.chordReplacementOptions);
assert.ok(global.CodaProgressionChordMenu.build);
assert.ok(global.CodaMidiExport.createProgressionMidiFile);
assert.ok(global.CodaProgressionMidiFile.build);
assert.ok(global.CodaProgressionMidiDownload.exportMidi);
assert.ok(global.CodaProgressionMetronomeSchedule.build);
assert.ok(global.CodaProgressionPlaybackNoteEvents.build);
assert.ok(global.CodaProgressionPlaybackTiming.playbackDuration);
assert.ok(global.CodaProgressionPlaybackEventBuilder.buildMeasurePlaybackEvents);
assert.ok(global.CodaProgressionPlaybackSchedule.buildProgressionPlaybackSchedule);
assert.ok(global.CodaProgressionPlaybackEventNormalizer.asImmediateEvent);
assert.ok(global.CodaProgressionMidiEventPlayer.playMidiChord);
assert.ok(global.CodaProgressionEventPlayer.play);
assert.ok(global.CodaProgressionPlaybackCallbacks.shouldLoop);
assert.ok(global.CodaProgressionPlaybackTimers.create);
assert.ok(global.CodaProgressionPlaybackRunner.start);
assert.ok(global.CodaProgressionTransportShortcuts.handle);
assert.ok(global.CodaProgressionTransportDom.measureIndex);
assert.ok(global.CodaProgressionTransportDragClasses.clear);
assert.ok(global.CodaProgressionTransportDragState.create);
assert.ok(global.CodaProgressionTransportDragData.setMeasureDragData);
assert.ok(global.CodaProgressionTransportDragTargets.fromEvent);
assert.ok(global.CodaProgressionTransportDragHandlers.create);
assert.ok(global.CodaProgressionTransportDrag.initialize);
assert.ok(global.CodaProgressionTransportView.setPlaybackHead);
assert.ok(global.CodaProgressionInspector.initialize);
assert.ok(global.CodaProgressionTransportActions.updateMeasureSplit);
assert.ok(global.CodaProgressionTransportMenu.open);
assert.ok(global.CodaProgressionTransportPlayback.toggle);
assert.ok(global.CodaProgressionTransportButtons.bind);
assert.ok(global.CodaProgressionTransportMeasureClick.bind);
assert.ok(global.CodaProgressionTransportDocumentEvents.bind);
assert.ok(global.CodaProgressionTransportDragActions.bind);
assert.ok(global.CodaDomain.buildScale);
assert.ok(global.CodaDomain.buildScaleReport === undefined);
assert.ok(global.CodaDomain.resolveProgressionDegrees);
assert.ok(global.CodaDomain.createDiatonicDegreePlan);
assert.ok(global.CodaDomain.shouldPreferFlatsForKeySignature);
assert.ok(global.CodaApplication.buildScaleReport);
assert.ok(global.CodaApplication.buildProgressionMidiFile);
assert.ok(global.CodaApplication.createChordPlayback);
assert.ok(global.CodaApplication.createInstrumentPlayback);
assert.ok(global.CodaApplication.playChordFromCellId);
assert.ok(global.CodaApplication.playMidiNote);
assert.ok(global.CodaApplication.buildProgressionFromDegrees);
assert.ok(global.CodaApplication.buildProgressionFromState);
assert.ok(global.CodaApplication.generateProgressionFromState);
assert.ok(global.CodaApplication.revoiceProgression);
assert.ok(global.CodaApplication.transformProgressionFromState);
assert.ok(global.CodaApplication.generateContrastingProgressionSection);
assert.ok(global.CodaApplication.buildProgressionPlaybackSchedule);
assert.ok(global.CodaApplication.buildScheduledProgressionMeasures);
assert.ok(global.CodaApplication.createProgressionPlayback);
assert.ok(global.CodaApplication.formatProgressionDegreeForChord);
assert.ok(global.CodaApplication.reorderProgressionMeasures);
assert.ok(global.CodaApplication.removeProgressionSection);
assert.ok(global.CodaApplication.retargetProgressionSection);
assert.ok(global.CodaRenderers.scaleSummary);
assert.ok(global.CodaRenderers.scaleChords);
assert.ok(global.CodaRenderers.extendedHarmony);
assert.ok(global.CodaRenderers.instruments);
assert.ok(global.CodaRenderers.circleOfFifths);
assert.ok(global.CodaRenderers.changelog);
assert.ok(global.CodaRenderers.welcome);
assert.ok(global.CodaRenderers.progressionLabels.formatMusicalLabel);
assert.ok(global.CodaRenderers.progressionControls.renderPanels);
assert.ok(global.CodaRenderers.progressionTimeline.renderTimelineMeasures);
assert.ok(global.CodaRenderers.progressionInspector.render);
assert.ok(global.CodaRenderers.progressionWorkbench);
assert.ok(global.CodaRenderers.progressionChordMenu);
assert.ok(global.CodaUiState.create);
assert.ok(global.CodaProgressionStateSchema.normalize);
assert.ok(global.CodaProgressionState.normalize);
assert.ok(global.CodaStaticText.apply);
assert.ok(global.CodaVolumeControl.initialize);
assert.ok(global.CodaThemeControl.initialize);
assert.ok(global.CodaRandomSelect.initialize);
assert.ok(global.CodaRandomSelect.randomizeAllAssociatedControls);
assert.ok(global.CodaProgressionTransport.initialize);
assert.ok(global.CodaProgressionGenerationEvents.initialize);
assert.ok(global.CodaCircleOfFifthsPopover.initialize);
assert.ok(global.CodaWorkbenchInstrumentMenu.initialize);
assert.ok(global.CodaKeyNavigation.applyRecommendedNotation);
assert.ok(global.CodaChangelogDialog.initialize);
assert.ok(global.CodaUi.renderScaleReport);
assert.ok(global.CodaUi.renderProgression);
assert.ok(global.CodaUi.attachInstrumentEvents);
assert.ok(global.CodaUi.scheduleDashboardWorkspaceHeight);
assert.ok(global.CodaUi.scheduleInstrumentScale);
assert.ok(global.CodaUi.scheduleSidebarPanelViewport);
assert.ok(global.CodaDashboardResizer.initialize);
assert.ok(global.CodaScaleReportController.initialize);
assert.ok(global.CodaPlayback.create);
assert.ok(global.CodaBootstrap.start);
assert.ok(scaleReportControllerSource.indexOf('renderReport();') > -1);
assert.ok(scaleReportControllerSource.indexOf('recordHistorySnapshot();') > -1);
assert.ok(scaleReportControllerSource.indexOf("forEachElement('#tonica, #escala'") > -1);
assert.ok(manifestScripts.indexOf('js/data/constants-data.js') > -1);
assert.ok(manifestScripts.indexOf('js/data/midi-data.js') > -1);
assert.ok(manifestScripts.indexOf('js/data/scales-data.js') > -1);
assert.ok(manifestScripts.indexOf('js/data/progression-rules-data.js') > -1);
assert.ok(manifestScripts.indexOf('js/content/changelog-content.js') > -1);
assert.ok(manifestScripts.indexOf('js/content/welcome-content.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/changelog-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/welcome-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/progression-label-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/progression-controls-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/progression-timeline-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/progression-inspector-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/progression-workbench-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/renderers/progression-chord-menu-renderer.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/ui-state.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/progression-state-schema.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/progression-state.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/static-text-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/volume-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/theme-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/random-select-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/key-navigation-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/changelog-dialog-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/dashboard-resizer-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/progression-transport-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/progression-generation-events-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/circle-of-fifths-popover-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/ui/workbench-instrument-menu-controller.js') > -1);
assert.ok(manifestScripts.indexOf('js/domain/progression-domain.js') > -1);
assert.ok(manifestScripts.indexOf('js/application/progression-application.js') > -1);
assert.ok(manifestScripts.indexOf('js/application/progression-playback-application.js') > -1);
assert.ok(manifestScripts.indexOf('js/i18n/translations.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/data-index-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/i18n/i18n-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/musical-context-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/circle-of-fifths-target-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/notation-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/preferences-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-document-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-workspace-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-workspace-storage-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-state-normalizer-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-degree-resolver-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-pitch-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-classical-dissonance-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-object-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-chord-quality-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-voice-leading-score-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-voicing-disposition-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-voicing-factor-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-voicing-midi-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-voicing-factory-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-voicing-selection-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-voicing-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-pedal-link-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-voice-leading-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-melodic-counterpoint-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-measure-clone-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-measure-segment-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-timing-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-measure-timeline-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-formatting-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-harmonic-analysis-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-analysis-label-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-tonal-function-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-measure-context-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-structure-index-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-structure-editing-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-suspension-resolution-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-additional-chord-score-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-additional-chord-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-segment-builder-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-replacement-chord-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-measure-chord-addition-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-measure-chord-replacement-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-editing-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-tension-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-suspension-heuristic-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-suspension-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-seventh-decision-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-chord-plan-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-harmonic-density-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-revoice-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-document-transform-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-measure-builder-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-result-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-chromatic-cadence-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-style-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-cadence-planner-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-pattern-weight-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-pattern-selector-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-phrase-block-selector-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-modal-planner-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-planner-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-builder-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-section-document-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-section-retarget-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-section-variation-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-section-candidate-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-section-modulation-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-section-contrast-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-section-operations-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-edit-command-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-chord-menu-option-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-chord-menu-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-arpeggio-pattern-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-articulation-instrument-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/midi-export-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-midi-file-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-midi-download-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-metronome-schedule-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-playback-note-event-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-playback-timing-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-playback-event-builder-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-playback-schedule-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-playback-event-normalizer-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-midi-event-player-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-event-player-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-playback-callbacks-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-playback-timer-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-playback-runner-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-shortcut-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-dom-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-drag-class-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-drag-state-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-drag-data-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-drag-target-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-drag-handler-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-drag-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-view-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-inspector-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-actions-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-menu-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-playback-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-buttons-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-measure-click-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-document-events-service.js') > -1);
assert.ok(manifestScripts.indexOf('js/services/progression-transport-drag-actions-service.js') > -1);
assert.deepEqual(manifestScripts.slice(-1), ['js/app.js']);

const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const htmlScripts = [];
const htmlScriptTags = [];
const scriptRegex = /<script\s+([^>]*src="([^"]+)"[^>]*)>/g;
let match;
while ((match = scriptRegex.exec(indexHtml)) !== null) {
	htmlScriptTags.push(match[0]);
	htmlScripts.push(match[2]);
}

const manifestIndex = htmlScripts.indexOf('js/bootstrap/script-manifest.js');
assert.ok(manifestIndex > -1);
assert.ok(htmlScripts.indexOf('dist/js/coda.bundle.js') > -1);
assert.ok(htmlScripts.length < 20);
assert.deepEqual(htmlScripts.slice(-2), ['js/bootstrap/script-manifest.js', 'dist/js/coda.bundle.js']);
htmlScriptTags.forEach(function (scriptTag) {
	assert.ok(/<script\b[^>]*\bdefer\b/.test(scriptTag));
});
manifestScripts.forEach(function (scriptPath) {
	assert.equal(htmlScripts.indexOf(scriptPath), -1);
});
const bundleSource = fs.readFileSync(path.join(root, 'dist/js/coda.bundle.js'), 'utf8');
assert.ok(bundleSource.indexOf('Generated by tools/build-js-bundle.ps1') > -1);
const publishedCss = fs.readFileSync(path.join(root, 'dist/css/styles.min.css'), 'utf8');
assert.ok(publishedCss.indexOf('.workbenchInstrumentToggle') > -1);
assert.ok(publishedCss.indexOf('.workbenchInstrumentMenu') > -1);
manifestScripts.forEach(function (scriptPath) {
	assert.ok(bundleSource.indexOf('Source: ' + scriptPath) > -1);
});
assert.equal(indexHtml.indexOf('Novedades de la versión actual beta 0.5'), -1);
assert.ok(indexHtml.indexOf('<html lang="en">') > -1);
assert.ok(indexHtml.indexOf('<section id="controlVersiones" aria-live="polite"></section>') > -1);
assert.ok(indexHtml.indexOf('<section id="constructorProgresiones" class="progression-workbench"></section>') > -1);
assert.ok(indexHtml.indexOf('<section id="bienvenida"></section>') > -1);
assert.ok(indexHtml.indexOf('id="randomizeAll"') > -1);
assert.ok(indexHtml.indexOf('data-random-master-groups="global"') > -1);
assert.ok(indexHtml.indexOf('id="toggleCircleOfFifths"') < indexHtml.indexOf('id="randomizeAll"'));
assert.ok(indexHtml.indexOf('id="undoChange"') > -1);
assert.ok(indexHtml.indexOf('id="redoChange"') > -1);
assert.ok(indexHtml.indexOf('<span data-i18n="ui.language">') === -1);
assert.ok(indexHtml.indexOf('<span data-i18n="ui.notation">') === -1);
assert.ok(indexHtml.indexOf('<select id="selectorIdioma" title="Language" aria-label="Language">') > -1);
assert.ok(indexHtml.indexOf('<option value="en" selected>EN</option>') > -1);
assert.ok(indexHtml.indexOf('<select id="selectorNotacion" title="Notación" aria-label="Notación">') > -1);
assert.ok(indexHtml.indexOf('id="toggleCircleOfFifthsFromForm"') > -1);
assert.ok(indexHtml.indexOf('id="dashboardColumnResizer"') > -1);
assert.ok(indexHtml.indexOf('role="separator"') > -1);
assert.ok(indexHtml.indexOf('id="circleOfFifthsPopover"') > -1);
assert.ok(indexHtml.indexOf('<section id="circuloQuintas"></section>') > -1);
assert.ok(indexHtml.indexOf('id="toggleTheoryControls"') > -1);
assert.ok(indexHtml.indexOf('aria-controls="theoryControlsBody"') > -1);
assert.ok(indexHtml.indexOf('<label id="formatoLabel" class="opcion opcionFormato" for="sostenidos"') > -1);
assert.ok(indexHtml.indexOf('<label class="opcion opcionInstrumento" for="instrumentoSonoro"') > -1);
assert.ok(indexHtml.indexOf('<select id="instrumentoSonoro"></select>') > -1);
assert.ok(indexHtml.indexOf('id="randomizeTonic"') > -1);
assert.ok(indexHtml.indexOf('data-random-select-target="#tonica"') > -1);
assert.ok(indexHtml.indexOf('data-random-group="global"') > -1);
assert.ok(indexHtml.indexOf('id="randomizeScale"') > -1);
assert.ok(indexHtml.indexOf('data-random-select-target="#escala"') > -1);
assert.ok(indexHtml.indexOf('Content-Security-Policy') > -1);
assert.ok(indexHtml.indexOf("script-src 'self'") > -1);
assert.ok(indexHtml.indexOf('fonts.googleapis.com') > -1);
assert.ok(indexHtml.indexOf('fonts.gstatic.com') > -1);
assert.ok(indexHtml.indexOf('material-icons') > -1);
assert.equal(indexHtml.indexOf('script-src https://'), -1);
assert.ok(indexHtml.indexOf('id="themeToggleButton"') > -1);
assert.equal(indexHtml.indexOf('name="instrumento"'), -1);
assert.equal(indexHtml.indexOf('<strong>estudiantes</strong>'), -1);
assert.equal(indexHtml.indexOf('Imaj7'), -1);
assert.equal(global.CodaTranslations.es['changelog.html'], undefined);
assert.equal(global.CodaTranslations.en['changelog.html'], undefined);
assert.equal(global.CodaTranslations.es['welcome.main1'], undefined);
assert.equal(global.CodaTranslations.en['welcome.main1'], undefined);
assert.ok(global.CodaTranslations.es['footer.author'].indexOf('Maple81') > -1);
assert.ok(global.CodaTranslations.es['footer.contact'].indexOf('https://github.com/Maple1981/') > -1);
assert.equal(global.CodaTranslations.es['footer.contact'].indexOf('SoundCloud'), -1);
assert.ok(global.CodaTranslations.en['footer.github'].indexOf('GitHub repository') > -1);
assert.ok(global.CodaTranslations.es['footer.soundfonts'].indexOf('MIDI.js Soundfonts') > -1);
assert.ok(global.CodaTranslations.en['footer.soundfonts'].indexOf('Creative Commons Attribution 3.0') > -1);
assert.deepEqual(global.CodaPreferences.sanitizeValues({
	dashboardSidebarWidth: '512',
	format: '1',
	language: 'en',
	midiInstrument: 'drawbar_organ',
	notation: 'latin',
	progressionArticulation: 'arpeggio_outside_in',
	progressionBars: '16',
	progressionBpm: '132',
	progressionChromaticism: '55',
	progressionCounterpoint: '65',
	progressionGenerateMelodicVoice: 'false',
	progressionHarmonicDensity: '48',
	progressionHumanization: '12',
	progressionIntensity: '94',
	progressionMeter: '6/8',
	progressionModalInterchange: '40',
	progressionStyle: 'classic',
	progressionSwing: '18',
	progressionTensions: '75',
	progressionVoicing: 'open',
	progressionVoices: '5',
	scaleIndex: '3',
	theme: 'day',
	tonicIndex: '8',
	unknown: '<script>',
	volume: '73'
}), {
	dashboardSidebarWidth: 512,
	format: '1',
	language: 'en',
	midiInstrument: 'drawbar_organ',
	notation: 'latin',
	progressionArticulation: 'arpeggio_outside_in',
	progressionBars: '16',
	progressionBpm: 132,
	progressionChromaticism: 55,
	progressionCounterpoint: 65,
	progressionGenerateMelodicVoice: false,
	progressionHarmonicDensity: 48,
	progressionHumanization: 12,
	progressionIntensity: 94,
	progressionMeter: '6/8',
	progressionModalInterchange: 40,
	progressionStyle: 'classic',
	progressionSwing: 18,
	progressionTensions: 75,
	progressionVoicing: 'open',
	progressionVoices: 5,
	scaleIndex: 3,
	theme: 'day',
	tonicIndex: 8,
	volume: 73
});
assert.deepEqual(global.CodaPreferences.sanitizeValues({
	dashboardSidebarWidth: 9999,
	format: '9',
	language: 'fr',
	midiInstrument: '../bad',
	notation: 'bad',
	progressionArticulation: 'tenuto',
	progressionBars: '5',
	progressionBpm: 201,
	progressionCounterpoint: -1,
	progressionHumanization: 101,
	progressionIntensity: 128,
	progressionMeter: '13/16',
	progressionModalInterchange: 101,
	progressionStyle: 'atonal',
	progressionSwing: 76,
	progressionTensions: -1,
	progressionVoicing: 'wide',
	progressionVoices: 9,
	scaleIndex: 999,
	theme: 'dusk',
	tonicIndex: -1,
	volume: 101
}), {});
assert.deepEqual(global.CodaProgressionPreferences.fromPreferences({
	progressionArticulation: 'arpeggio_alternate',
	progressionBars: '16',
	progressionBpm: 132,
	progressionChromaticism: 55,
	progressionCounterpoint: 65,
	progressionGenerateMelodicVoice: false,
	progressionHarmonicDensity: 48,
	progressionMeter: '6/8',
	progressionModalInterchange: 40,
	progressionStyle: 'classic',
	progressionTensions: 75,
	progressionVoicing: 'open',
	progressionVoices: 5
}), {
	articulation: 'arpeggio_alternate',
	bars: '16',
	bpm: 132,
	chromaticism: 55,
	counterpoint: 65,
	generateMelodicVoice: false,
	harmonicDensity: 48,
	meter: '6/8',
	modalInterchange: 40,
	style: 'classic',
	tensions: 75,
	voicing: 'open',
	voices: 5
});
assert.deepEqual(global.CodaProgressionPreferences.normalizeControls({
	bars: '16',
	bpm: 132,
	voicing: 'open'
}, global.CodaProgressionState), {
	articulation: 'sustain',
	bars: 16,
	bpm: 132,
	chromaticism: 10,
	counterpoint: 20,
	generateMelodicVoice: false,
	harmonicDensity: 0,
	humanization: 0,
	intensity: 80,
	meter: '4/4',
	modalInterchange: 25,
	style: 'contemporary',
	swing: 0,
	tensions: 35,
	voicing: 'open',
	voices: 4
});

const storageWrites = {};
global.localStorage = {
	getItem: function (key) {
		return storageWrites[key] || null;
	},
	removeItem: function (key) {
		delete storageWrites[key];
	},
	setItem: function (key, value) {
		storageWrites[key] = String(value);
	}
};
const workspace = global.CodaProgressionWorkspaceStorage.buildWorkspace({
	progression: {
		bars: 1,
		measures: [{ bar: 1 }]
	},
	progressionState: {
		bars: 1,
		bpm: 120
	},
	selectedTuningIndex: 2,
	selection: {
		format: '1',
		scaleIndex: 2,
		tonicIndex: 5
	}
});
assert.equal(workspace.signature, '5|2|1');
assert.equal(global.CodaProgressionWorkspaceStorage.write(workspace), true);
assert.equal(global.CodaProgressionWorkspaceStorage.read().signature, '5|2|1');
assert.equal(global.CodaProgressionWorkspaceStorage.matchesSelection(workspace, {
	format: '1',
	scaleIndex: 2,
	tonicIndex: 5
}), true);
assert.equal(global.CodaProgressionWorkspaceStorage.matchesSelection(workspace, {
	format: '0',
	scaleIndex: 2,
	tonicIndex: 5
}), false);
const normalizedDocument = global.CodaProgressionDocument.normalize({
	measures: [{ bar: 1 }]
}, {
	ensureSections: true
});
assert.equal(normalizedDocument.documentVersion, 1);
assert.deepEqual(normalizedDocument.sections, [{
	id: 'A',
	labelKey: 'progression.sectionA',
	length: 1,
	startIndex: 0
}]);
assert.equal(normalizedDocument.measures[0].sectionId, 'A');
assert.equal(global.CodaProgressionDocument.markUserEdited({
	measures: [{ bar: 1 }]
}).userEdited, true);
assert.equal(global.CodaProgressionWorkspace.contextSignature({
	preferFlats: true,
	scaleIndex: 2,
	tonicIndex: 5
}), '5|2|1');
assert.deepEqual(global.CodaProgressionStateNormalizer.normalize({
	beatUnit: 8,
	beatsPerBar: 7,
	bpm: '132',
	meter: '7/8',
	style: 'classic',
	voicing: 'open'
}), {
	articulation: 'sustain',
	bars: 8,
	beatUnit: 8,
	beatsPerBar: 7,
	bpm: 132,
	chromaticism: 10,
	counterpoint: 20,
	generateMelodicVoice: false,
	harmonicDensity: 0,
	humanization: 0,
	intensity: 80,
	meter: '7/8',
	modalInterchange: 25,
	midiInstrument: 'acoustic_grand_piano',
	style: 'classic',
	swing: 0,
	tensions: 35,
	voicing: 'open',
	voices: 4
});
assert.deepEqual(global.CodaProgressionDegreeResolver.fromGeneratedPlan({
	degrees: [
		{ index: 0, source: 'diatonic' },
		{ index: 3, source: 'parallel' }
	],
	report: {
		parallelScaleChords: [{ nombre: 'Cm7' }, { nombre: 'Dm7♭5' }, { nombre: 'E♭maj7' }, { nombre: 'Fm7' }],
		scaleChords: [{ nombre: 'Cmaj7' }, { nombre: 'Dm7' }, { nombre: 'Em7' }, { nombre: 'Fmaj7' }],
		scaleNotes: [{ grado: 'I' }, { grado: 'II' }, { grado: 'III' }, { grado: 'IV' }]
	}
}).map(function (degree) {
	return {
		chord: degree.chord.nombre,
		degree: degree.degree,
		degreeIndex: degree.degreeIndex,
		source: degree.source
	};
}), [
	{ chord: 'Cmaj7', degree: 'I', degreeIndex: 0, source: 'diatonic' },
	{ chord: 'Fm7', degree: 'IV', degreeIndex: 3, source: 'parallel' }
]);
const closedVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['C', 'E', 'G'],
	chordName: 'C',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	voicing: 'closed',
	voices: 4
});
const openVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['C', 'E', 'G'],
	chordName: 'C',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	voicing: 'open',
	voices: 4
});
assert.ok(global.CodaProgressionVoicing.upperVoiceSpan(openVoicing.midiNotes) > global.CodaProgressionVoicing.upperVoiceSpan(closedVoicing.midiNotes));
const openingTonicVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['C', 'E', 'G'],
	chordName: 'C',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	openingTonic: true,
	openingTonicInversionPolicy: 'root',
	registerCenterMidi: 54,
	voicing: 'open',
	voices: 4
});
assert.equal(openingTonicVoicing.inversionIndex, 0);
const rareOpeningTonicVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['C', 'E', 'G'],
	chordName: 'C',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	openingTonic: true,
	openingTonicInversionPolicy: 'first',
	registerCenterMidi: 54,
	voicing: 'open',
	voices: 4
});
assert.equal(rareOpeningTonicVoicing.inversionIndex, 1);
assert.ok(global.CodaProgressionVoicingSelection.openingTonicInversionPenalty({
	inversionIndex: 1
}, {
	openingTonic: true,
	openingTonicInversionPolicy: 'root'
}) > 0);
assert.equal(global.CodaProgressionVoicingSelection.openingTonicInversionPenalty({
	inversionIndex: 1
}, {
	openingTonic: true,
	openingTonicInversionPolicy: 'first'
}), 0);
const originalOpeningPolicyRandom = vm.runInContext('Math.random', context);
context.__openingPolicyRandom = function () { return 0.005; };
vm.runInContext('Math.random = __openingPolicyRandom;', context);
assert.equal(global.CodaProgressionChordPlan.openingTonicInversionPolicy({
	index: 0,
	options: {
		allowRandomOpeningTonicInversion: true,
		rng: vm.runInContext('Math.random', context)
	},
	resolvedDegree: { degreeIndex: 0 }
}), 'upper');
context.__openingPolicyRandom = function () { return 0.05; };
vm.runInContext('Math.random = __openingPolicyRandom;', context);
assert.equal(global.CodaProgressionChordPlan.openingTonicInversionPolicy({
	index: 0,
	options: {
		allowRandomOpeningTonicInversion: true,
		rng: vm.runInContext('Math.random', context)
	},
	resolvedDegree: { degreeIndex: 0 }
}), 'first');
vm.runInContext('Math.random = __openingPolicyOriginalRandom;', Object.assign(context, {
	__openingPolicyOriginalRandom: originalOpeningPolicyRandom
}));
delete context.__openingPolicyRandom;
delete context.__openingPolicyOriginalRandom;
assert.deepEqual(global.CodaProgressionVoicingDisposition.spreadLowRegister({
	midiNotes: [36, 40, 43, 60],
	voiceNotes: [
		{ midiNote: 36, note: 'C', role: 'root' },
		{ midiNote: 40, note: 'E', role: 'third' },
		{ midiNote: 43, note: 'G', role: 'fifth' },
		{ midiNote: 60, note: 'C', role: 'root-doubling' }
	]
}).midiNotes, [36, 52, 55, 72]);
assert.deepEqual(global.CodaProgressionVoicingDisposition.spreadLowRegisterSpacing({
	midiNotes: [36, 40, 43, 60],
	voiceNotes: [
		{ midiNote: 36, note: 'C', role: 'root' },
		{ midiNote: 40, note: 'E', role: 'third' },
		{ midiNote: 43, note: 'G', role: 'fifth' },
		{ midiNote: 60, note: 'C', role: 'root-doubling' }
	]
}).midiNotes, [36, 52, 55, 60]);
const lowOpenVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['C', 'E', 'G'],
	chordName: 'C',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	previousPlan: {
		midiNotes: [24, 28, 31, 36],
		notes: ['C', 'E', 'G', 'C']
	},
	registerCenterMidi: 42,
	voicing: 'open',
	voices: 4
});
assert.ok(lowOpenVoicing.midiNotes[1] - lowOpenVoicing.midiNotes[0] >= global.CodaProgressionVoicingDisposition.minimumLowRegisterGap(lowOpenVoicing.midiNotes[0], 1));
assert.ok(global.CodaProgressionVoiceLeadingScore.lowRegisterBassPenalty({
	midiNotes: [16, 31, 48, 72]
}) > global.CodaProgressionVoiceLeadingScore.lowRegisterBassPenalty({
	midiNotes: [36, 48, 55, 72]
}));
assert.ok(global.CodaProgressionVoiceLeadingScore.lowRegisterSpacingPenalty({
	midiNotes: [36, 40, 55, 60]
}) > global.CodaProgressionVoiceLeadingScore.lowRegisterSpacingPenalty({
	midiNotes: [36, 45, 55, 60]
}));
assert.ok(global.CodaProgressionVoiceLeadingScore.playableRangePenalty({
	midiNotes: [16, 31, 48, 72]
}, {
	min: 21,
	max: 108
}) > 0);
assert.equal(global.CodaProgressionVoiceLeadingScore.pianoHandSpanPenaltyForSpan(12), 0);
assert.ok(
	global.CodaProgressionVoiceLeadingScore.pianoHandSpanPenaltyForSpan(17) >
	global.CodaProgressionVoiceLeadingScore.pianoHandSpanPenaltyForSpan(14)
);
assert.equal(global.CodaProgressionVoiceLeadingScore.guitarFingeringOptions(64).some(function (option) {
	return option.fret === 0;
}), true);
assert.ok(global.CodaProgressionVoiceLeadingScore.guitarVoicingPenalty({
	midiNotes: [40, 45, 50, 55, 59, 64, 69]
}) >= 12000);
assert.ok(global.CodaProgressionVoiceLeadingScore.idiomaticInstrumentPenalty({
	midiNotes: [48, 65, 67, 84]
}, 'acoustic_grand_piano') > 0);
const closedLowKeyboardVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['C', 'E', 'G'],
	chordName: 'C',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	midiInstrument: 'acoustic_grand_piano',
	previousPlan: {
		midiNotes: [36, 40, 43, 48],
		notes: ['C', 'E', 'G', 'C']
	},
	registerCenterMidi: 45,
	voicing: 'closed',
	voices: 4
});
assert.ok(closedLowKeyboardVoicing.midiNotes[1] - closedLowKeyboardVoicing.midiNotes[0] >= global.CodaProgressionVoicingDisposition.minimumLowRegisterGap(closedLowKeyboardVoicing.midiNotes[0], 1));
assert.ok(
	global.CodaProgressionVoiceLeadingScore.voiceLeadingTransitionScore({
		midiNotes: [45, 48, 52, 59],
		notes: ['A', 'C', 'E', 'B']
	}, {
		midiNotes: [35, 38, 43, 45],
		notes: ['B', 'D', 'G', 'A']
	}) >
	global.CodaProgressionVoiceLeadingScore.voiceLeadingTransitionScore({
		midiNotes: [45, 48, 52, 59],
		notes: ['A', 'C', 'E', 'B']
	}, {
		midiNotes: [47, 50, 55, 57],
		notes: ['B', 'D', 'G', 'A']
	})
);
assert.ok(global.CodaProgressionVoiceLeadingScore.melodicLeapPenalty(2) < global.CodaProgressionVoiceLeadingScore.melodicLeapPenalty(7));
assert.ok(global.CodaProgressionVoiceLeadingScore.melodicLeapPenalty(7) < global.CodaProgressionVoiceLeadingScore.melodicLeapPenalty(12));
assert.ok(global.CodaProgressionVoiceLeadingScore.sopranoLeapPenalty(2) < global.CodaProgressionVoiceLeadingScore.sopranoLeapPenalty(5));
assert.ok(global.CodaProgressionVoiceLeadingScore.sopranoLeapPenalty(5) < global.CodaProgressionVoiceLeadingScore.sopranoLeapPenalty(8));
assert.ok(
	global.CodaProgressionVoiceLeadingScore.voiceLeadingTransitionScore({
		midiNotes: [60, 64, 67, 72],
		notes: ['C', 'E', 'G', 'C']
	}, {
		midiNotes: [60, 64, 67, 84],
		notes: ['C', 'E', 'G', 'C']
	}) >
	global.CodaProgressionVoiceLeadingScore.voiceLeadingTransitionScore({
		midiNotes: [60, 64, 67, 72],
		notes: ['C', 'E', 'G', 'C']
	}, {
		midiNotes: [63, 67, 70, 75],
		notes: ['Eb', 'G', 'Bb', 'D']
	})
);
assert.ok(
	global.CodaProgressionVoiceLeadingScore.voiceLeadingTransitionScore({
		midiNotes: [48, 52, 55, 72],
		notes: ['C', 'E', 'G', 'C']
	}, {
		midiNotes: [48, 52, 55, 79],
		notes: ['C', 'E', 'G', 'G']
	}) >
	global.CodaProgressionVoiceLeadingScore.voiceLeadingTransitionScore({
		midiNotes: [48, 52, 55, 72],
		notes: ['C', 'E', 'G', 'C']
	}, {
		midiNotes: [41, 52, 55, 74],
		notes: ['F', 'E', 'G', 'D']
	})
);
const parsimoniousKeyboardVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['B', 'D', 'G'],
	chordName: 'G6 add9',
	extraNotes: ['A'],
	initialMidiNote: 60,
	kind: 'triad',
	midiInstrument: 'acoustic_grand_piano',
	previousPlan: {
		midiNotes: [45, 48, 52, 59],
		notes: ['A', 'C', 'E', 'B'],
		voiceNotes: [
			{ midiNote: 45, note: 'A' },
			{ midiNote: 48, note: 'C' },
			{ midiNote: 52, note: 'E' },
			{ midiNote: 59, note: 'B' }
		]
	},
	registerCenterMidi: 54,
	voicing: 'closed',
	voices: 4
});
assert.ok(parsimoniousKeyboardVoicing.midiNotes[0] >= 40, JSON.stringify(parsimoniousKeyboardVoicing.midiNotes));
assert.ok(Math.abs(parsimoniousKeyboardVoicing.midiNotes[3] - 59) <= 4, JSON.stringify(parsimoniousKeyboardVoicing.midiNotes));
assert.equal(global.CodaProgressionChordPlan.registerCenterMidi({
	initialMidiNote: 60,
	scaleNotes: [{ nombre: 'A' }]
}), 63);
assert.deepEqual(global.CodaProgressionChordPlan.playableMidiRange({
	midiInstrument: 'acoustic_guitar_nylon'
}), { min: 40, max: 88 });
assert.deepEqual(global.CodaProgressionChordPlan.playableMidiRange({
	midiInstrument: 'pad_2_warm'
}), { min: 21, max: 108 });
const playableLowOpenVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['E', 'G', 'B'],
	chordName: 'Em',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	playableRange: { min: 21, max: 108 },
	previousPlan: {
		midiNotes: [16, 19, 23, 28],
		notes: ['E', 'G', 'B', 'E']
	},
	registerCenterMidi: 30,
	voicing: 'open',
	voices: 4
});
assert.ok(playableLowOpenVoicing.midiNotes[0] >= 21);
const lowRegisterVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['C', 'E', 'G'],
	chordName: 'C',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	previousPlan: {
		midiNotes: [24, 28, 31, 36],
		notes: ['C', 'E', 'G', 'C']
	},
	registerCenterMidi: 54,
	voicing: 'closed',
	voices: 4
});
assert.ok(maxVoiceMotion([24, 28, 31, 36], lowRegisterVoicing.midiNotes) <= 12);
const highRegisterVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['C', 'E', 'G'],
	chordName: 'C',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	previousPlan: {
		midiNotes: [72, 76, 79, 84],
		notes: ['C', 'E', 'G', 'C']
	},
	registerCenterMidi: 54,
	voicing: 'closed',
	voices: 4
});
assert.ok(maxVoiceMotion([72, 76, 79, 84], highRegisterVoicing.midiNotes) <= 12);
const repeatedInversionPenalty = global.CodaProgressionVoicingSelection.inversionRunPenalty({
	inversionIndex: 2
}, {
	inversionIndex: 2,
	inversionRunKey: '2',
	inversionRunLength: 3
});
assert.ok(repeatedInversionPenalty >= 1000);
assert.equal(global.CodaProgressionVoicingSelection.nextInversionRunLength({
	inversionIndex: 2,
	inversionRunKey: '2',
	inversionRunLength: 3
}, {
	inversionIndex: 2
}), 4);
assert.ok(global.CodaProgressionChordPlan.sustainedInstrumentCommonToneStickiness({
	midiInstrument: 'pad_2_warm'
}) > 0);
assert.equal(global.CodaProgressionChordPlan.sustainedInstrumentCommonToneStickiness({
	midiInstrument: 'acoustic_grand_piano'
}), 0);
assert.equal(global.CodaProgressionChordPlan.sustainedInstrumentCommonToneStickiness({
	articulation: 'staccato',
	midiInstrument: 'pad_2_warm'
}), 0);
assert.equal(global.CodaProgressionChordPlan.sustainedInstrumentCommonToneStickiness({
	articulation: 'arpeggio_up',
	midiInstrument: 'string_ensemble_1'
}), 0);
assert.ok(global.CodaProgressionVoiceLeadingScore.commonToneStickinessBonus({
	voiceNotes: [
		{ midiNote: 48, note: 'C' },
		{ midiNote: 52, note: 'E' },
		{ midiNote: 55, note: 'G' }
	]
}, {
	voiceNotes: [
		{ midiNote: 48, note: 'C' },
		{ midiNote: 53, note: 'F' },
		{ midiNote: 55, note: 'G' }
	]
}, 42) > 80);
const repeatedInversionBreakVoicing = global.CodaProgressionVoicing.chooseVoicing({
	baseNotes: ['D', 'F', 'A'],
	chordName: 'Dm',
	extraNotes: [],
	initialMidiNote: 60,
	kind: 'triad',
	previousPlan: {
		inversionIndex: 2,
		inversionRunKey: '2',
		inversionRunLength: 3,
		midiNotes: [55, 60, 65],
		notes: ['G', 'C', 'F']
	},
	registerCenterMidi: 54,
	voicing: 'closed',
	voices: 3
});
assert.notEqual(repeatedInversionBreakVoicing.inversionIndex, 2);
assert.ok(repeatedInversionBreakVoicing.inversionRunLength >= 1);
assert.equal(Object.keys(repeatedInversionBreakVoicing).indexOf('inversionRunLength'), -1);
assert.equal(global.CodaProgressionVoicing.commonPitchNames(['C', 'E'], ['E', 'G']).join(','), 'E');
assert.equal(global.CodaProgressionRevoice.baseDegreeDisplayName({
	degree: 'IV7 4/3 sus4',
	inversion: '4/3',
	suspension: 'sus4'
}), 'IV7');
const voiceLeadingPedalMeasures = global.CodaProgressionVoiceLeading.annotateMeasures([
	{
		bar: 1,
		durationSeconds: 2,
		midiNotes: [48, 52, 55],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 52, note: 'E', role: 'third' },
			{ midiNote: 55, note: 'G', role: 'fifth' }
		]
	},
	{
		bar: 2,
		durationSeconds: 2,
		midiNotes: [48, 53, 57],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 53, note: 'F', role: 'fourth' },
			{ midiNote: 57, note: 'A', role: 'sixth' }
		]
	}
], { counterpoint: 80 });
assert.deepEqual(voiceLeadingPedalMeasures[0].pedalsOut.map(function (pedal) { return pedal.note; }), ['C']);
assert.equal(voiceLeadingPedalMeasures[1].voiceNotes[0].role, 'root-pedal');
assert.equal(global.CodaProgressionPedalLinks.prefersSustainedCommonTones({
	midiInstrument: 'pad_2_warm'
}), true);
assert.equal(global.CodaProgressionPedalLinks.prefersSustainedCommonTones({
	articulation: 'staccato',
	midiInstrument: 'pad_2_warm'
}), false);
assert.equal(global.CodaProgressionPedalLinks.prefersSustainedCommonTones({
	articulation: 'arpeggio',
	midiInstrument: 'drawbar_organ'
}), false);
const lowCounterpointPianoPedalMeasures = global.CodaProgressionVoiceLeading.annotateMeasures([
	{
		bar: 1,
		durationSeconds: 2,
		midiNotes: [48, 52, 55],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 52, note: 'E', role: 'third' },
			{ midiNote: 55, note: 'G', role: 'fifth' }
		]
	},
	{
		bar: 2,
		durationSeconds: 2,
		midiNotes: [48, 53, 57],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 53, note: 'F', role: 'fourth' },
			{ midiNote: 57, note: 'A', role: 'sixth' }
		]
	}
], { counterpoint: 0, midiInstrument: 'acoustic_grand_piano' });
assert.deepEqual(lowCounterpointPianoPedalMeasures[0].pedalsOut, []);
const lowCounterpointPadPedalMeasures = global.CodaProgressionVoiceLeading.annotateMeasures([
	{
		bar: 1,
		durationSeconds: 2,
		midiNotes: [48, 52, 55],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 52, note: 'E', role: 'third' },
			{ midiNote: 55, note: 'G', role: 'fifth' }
		]
	},
	{
		bar: 2,
		durationSeconds: 2,
		midiNotes: [48, 53, 57],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 53, note: 'F', role: 'fourth' },
			{ midiNote: 57, note: 'A', role: 'sixth' }
		]
	}
], { counterpoint: 0, midiInstrument: 'pad_2_warm' });
assert.deepEqual(lowCounterpointPadPedalMeasures[0].pedalsOut.map(function (pedal) { return pedal.note; }), ['C']);
const splitPedalMeasures = global.CodaProgressionVoiceLeading.annotateMeasures([
	{
		bar: 1,
		chords: [
			{
				bar: 1,
				durationSeconds: 1,
				midiNotes: [48, 52, 55],
				voiceNotes: [
					{ midiNote: 48, note: 'C', role: 'root' },
					{ midiNote: 52, note: 'E', role: 'third' },
					{ midiNote: 55, note: 'G', role: 'fifth' }
				]
			},
			{
				bar: 1,
				durationSeconds: 1,
				midiNotes: [48, 53, 57],
				voiceNotes: [
					{ midiNote: 48, note: 'C', role: 'fifth' },
					{ midiNote: 53, note: 'F', role: 'root' },
					{ midiNote: 57, note: 'A', role: 'third' }
				]
			}
		],
		durationSeconds: 2,
		midiNotes: [48, 52, 55],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 52, note: 'E', role: 'third' },
			{ midiNote: 55, note: 'G', role: 'fifth' }
		]
	}
], { counterpoint: 0, midiInstrument: 'string_ensemble_1' });
assert.deepEqual(splitPedalMeasures[0].chords[0].pedalsOut.map(function (pedal) { return pedal.note; }), ['C']);
assert.deepEqual(splitPedalMeasures[0].chords[1].pedalsIn.map(function (pedal) { return pedal.note; }), ['C']);
const splitOctaveShiftPedalMeasures = global.CodaProgressionVoiceLeading.annotateMeasures([
	{
		bar: 1,
		chords: [
			{
				bar: 1,
				durationSeconds: 1,
				midiNotes: [48, 52, 55, 60],
				voiceNotes: [
					{ midiNote: 48, note: 'C', role: 'root' },
					{ midiNote: 52, note: 'E', role: 'third' },
					{ midiNote: 55, note: 'G', role: 'fifth' },
					{ midiNote: 60, note: 'C', role: 'root' }
				]
			},
			{
				bar: 1,
				durationSeconds: 1,
				midiNotes: [57, 60, 62, 65],
				voiceNotes: [
					{ midiNote: 57, note: 'A', role: 'root' },
					{ midiNote: 60, note: 'C', role: 'third' },
					{ midiNote: 62, note: 'D', role: 'fourth' },
					{ midiNote: 65, note: 'F', role: 'sixth' }
				]
			}
		],
		durationSeconds: 2,
		midiNotes: [48, 52, 55, 60]
	}
], { counterpoint: 0, midiInstrument: 'pad_2_warm' });
assert.deepEqual(splitOctaveShiftPedalMeasures[0].chords[0].pedalsOut.map(function (pedal) { return pedal.midiNote; }), [60]);
assert.deepEqual(splitOctaveShiftPedalMeasures[0].chords[1].midiNotes, [57, 60, 62, 65]);
const splitPedalChainMeasures = global.CodaProgressionVoiceLeading.annotateMeasures([
	{
		bar: 1,
		chords: [
			{
				bar: 1,
				durationSeconds: 1,
				midiNotes: [48, 52, 55],
				voiceNotes: [
					{ midiNote: 48, note: 'C', role: 'root' },
					{ midiNote: 52, note: 'E', role: 'third' },
					{ midiNote: 55, note: 'G', role: 'fifth' }
				]
			},
			{
				bar: 1,
				durationSeconds: 1,
				midiNotes: [55, 60, 65],
				voiceNotes: [
					{ midiNote: 55, note: 'G', role: 'fifth' },
					{ midiNote: 60, note: 'C', role: 'root' },
					{ midiNote: 65, note: 'F', role: 'fourth' }
				]
			},
			{
				bar: 1,
				durationSeconds: 1,
				midiNotes: [55, 62, 67],
				voiceNotes: [
					{ midiNote: 55, note: 'G', role: 'root' },
					{ midiNote: 62, note: 'D', role: 'fifth' },
					{ midiNote: 67, note: 'G', role: 'root' }
				]
			}
		],
		durationSeconds: 3,
		midiNotes: [48, 52, 55]
	}
], { counterpoint: 0, midiInstrument: 'pad_2_warm' });
assert.equal(splitPedalChainMeasures[0].chords[0].pedalsOut[0].durationSeconds, 2);
assert.deepEqual(splitPedalChainMeasures[0].chords[1].pedalsOut.map(function (pedal) { return pedal.midiNote; }), [55]);
const melodicCounterpointMeasures = global.CodaProgressionMelodicCounterpoint.annotateMeasures([
	{
		bar: 1,
		durationSeconds: 2,
		midiNotes: [48, 52, 55, 60],
		notes: ['C', 'E', 'G'],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 52, note: 'E', role: 'third' },
			{ midiNote: 55, note: 'G', role: 'fifth' },
			{ midiNote: 60, note: 'C', role: 'root' }
		]
	},
	{
		bar: 2,
		durationSeconds: 2,
		midiNotes: [55, 59, 62, 67],
		notes: ['G', 'B', 'D'],
		voiceNotes: [
			{ midiNote: 55, note: 'G', role: 'root' },
			{ midiNote: 59, note: 'B', role: 'third' },
			{ midiNote: 62, note: 'D', role: 'fifth' },
			{ midiNote: 67, note: 'G', role: 'root' }
		]
	}
], { counterpoint: 90, voices: 4 }, {
	initialMidiNote: 60,
	rng: sequenceRng([0.1, 0]),
	scaleNotes: [{ nombre: 'C' }, { nombre: 'D' }, { nombre: 'E' }, { nombre: 'F' }, { nombre: 'G' }, { nombre: 'A' }, { nombre: 'B' }]
});
assert.equal(melodicCounterpointMeasures[0].melodicVoiceIndex, 3);
assert.equal(melodicCounterpointMeasures[0].melody.voiceIndex, 3);
assert.equal(melodicCounterpointMeasures[0].melody.startType, 'anacrusic');
assert.equal(melodicCounterpointMeasures[0].melodicStartType, 'anacrusic');
assert.equal(melodicCounterpointMeasures[0].voiceNotes[3].melodic, true);
assert.equal(melodicCounterpointMeasures[0].passingNotes[0].note, 'D');
assert.equal(melodicCounterpointMeasures[0].passingNotes[0].delaySeconds, 1);
assert.deepEqual(melodicCounterpointMeasures[0].melody.melodicCell, [2, -1, 2]);
assert.deepEqual(melodicCounterpointMeasures[0].melody.answerCell, [-2, 1, -3]);
assert.equal(melodicCounterpointMeasures[0].melody.motifRole, 'question');
assert.ok(melodicCounterpointMeasures[0].melodyEvents.length > 2);
assert.ok(melodicCounterpointMeasures[0].melodyEvents.some(function (event) {
	return event.delaySeconds > 0 && event.durationSeconds < melodicCounterpointMeasures[0].durationSeconds;
}));
assert.ok(melodicCounterpointMeasures[0].melodyEvents.some(function (event) {
	return String(event.kind || '').indexOf('motif-') === 0;
}));
const normalizedMelodicDocument = global.CodaProgressionDocument.normalize({
	generateMelodicVoice: true,
	measures: melodicCounterpointMeasures
});
assert.ok(normalizedMelodicDocument.measures[0].melodyEvents.length > 2);
assert.equal(normalizedMelodicDocument.measures[0].melodicVoiceIndex, 3);
assert.equal(normalizedMelodicDocument.measures[0].melody.startType, 'anacrusic');
const normalizedMelodicSchedule = global.CodaProgressionPlaybackSchedule.buildProgressionPlaybackSchedule(normalizedMelodicDocument);
assert.ok(normalizedMelodicSchedule[0].midiNoteEvents.length > 4);
assert.ok(normalizedMelodicSchedule[0].midiNoteEvents.some(function (event) {
	return event.kind === 'anacrusis' || event.kind === 'passing' || event.kind === 'neighbor';
}));
const melodicRepeatStats = consecutiveMelodyRepeatStats(melodicCounterpointMeasures);
assert.ok(melodicRepeatStats.repeats <= Math.floor(melodicRepeatStats.total * 0.05));
const questionAnswerMelodyMeasures = global.CodaProgressionMelodicCounterpoint.annotateMeasures([
	melodicTestMeasure(1, [48, 52, 55, 60], ['C', 'E', 'G']),
	melodicTestMeasure(2, [50, 53, 57, 62], ['D', 'F', 'A']),
	melodicTestMeasure(3, [52, 55, 59, 64], ['E', 'G', 'B']),
	melodicTestMeasure(4, [53, 57, 60, 65], ['F', 'A', 'C'])
], { counterpoint: 70, voices: 4 }, {
	initialMidiNote: 60,
	rng: sequenceRng([0.1, 0.6, 0.2, 0.4, 0.7, 0.1, 0.1, 0.1]),
	scaleNotes: [{ nombre: 'C' }, { nombre: 'D' }, { nombre: 'E' }, { nombre: 'F' }, { nombre: 'G' }, { nombre: 'A' }, { nombre: 'B' }]
});
assert.equal(questionAnswerMelodyMeasures[0].melody.motifRole, 'question');
assert.equal(questionAnswerMelodyMeasures[2].melody.motifRole, 'answer');
assert.equal(questionAnswerMelodyMeasures[3].melody.motifRole, 'close');
assert.ok(questionAnswerMelodyMeasures[2].melodyEvents.some(function (event) {
	return String(event.kind || '').indexOf('motif-answer') === 0;
}));
assert.ok(questionAnswerMelodyMeasures[3].melodyEvents.some(function (event) {
	return event.kind === 'phrase-closure' || event.kind === 'cadential';
}));
const finalTonicMelodyMeasures = global.CodaProgressionMelodicCounterpoint.annotateMeasures([
	melodicTestMeasure(1, [48, 52, 55, 60], ['C', 'E', 'G']),
	melodicTestMeasure(2, [50, 53, 57, 62], ['D', 'F', 'A']),
	melodicTestMeasure(3, [55, 59, 62, 67], ['G', 'B', 'D']),
	melodicTestMeasure(4, [60, 64, 67, 72], ['C', 'E', 'G'])
], { counterpoint: 70, voices: 4 }, {
	initialMidiNote: 60,
	rng: sequenceRng([0.1, 0.6, 0.2, 0.4, 0.7, 0.1, 0.1, 0.1]),
	scaleNotes: [{ nombre: 'C' }, { nombre: 'D' }, { nombre: 'E' }, { nombre: 'F' }, { nombre: 'G' }, { nombre: 'A' }, { nombre: 'B' }]
});
assert.equal(lastAudibleMelodyEvent(finalTonicMelodyMeasures[3]).kind, 'cadential');
assert.equal(lastAudibleMelodyEvent(finalTonicMelodyMeasures[3]).note, 'C');
const acephalousMelodyMeasures = global.CodaProgressionMelodicCounterpoint.annotateMeasures([
	{
		bar: 1,
		durationBeats: 4,
		durationSeconds: 2,
		midiNotes: [48, 52, 55, 60],
		notes: ['C', 'E', 'G'],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 52, note: 'E', role: 'third' },
			{ midiNote: 55, note: 'G', role: 'fifth' },
			{ midiNote: 60, note: 'C', role: 'root' }
		]
	},
	{
		bar: 2,
		durationBeats: 4,
		durationSeconds: 2,
		midiNotes: [55, 59, 62, 67],
		notes: ['G', 'B', 'D'],
		voiceNotes: [
			{ midiNote: 55, note: 'G', role: 'root' },
			{ midiNote: 59, note: 'B', role: 'third' },
			{ midiNote: 62, note: 'D', role: 'fifth' },
			{ midiNote: 67, note: 'G', role: 'root' }
		]
	}
], { counterpoint: 30, voices: 4 }, {
	initialMidiNote: 60,
	rng: sequenceRng([0.1, 0.3, 0.5, 0.6, 0.2, 0.5]),
	scaleNotes: [{ nombre: 'C' }, { nombre: 'D' }, { nombre: 'E' }, { nombre: 'F' }, { nombre: 'G' }, { nombre: 'A' }, { nombre: 'B' }]
});
assert.equal(acephalousMelodyMeasures[0].melodicStartType, 'acephalous');
assert.ok(firstAudibleMelodyDelay(acephalousMelodyMeasures[0]) > 0);
const lastPulseProtectedMelodyMeasures = global.CodaProgressionMelodicCounterpoint.annotateMeasures([
	{
		bar: 1,
		durationBeats: 4,
		durationSeconds: 2,
		midiNotes: [48, 52, 55, 60],
		notes: ['C', 'E', 'G'],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 52, note: 'E', role: 'third' },
			{ midiNote: 55, note: 'G', role: 'fifth' },
			{ midiNote: 60, note: 'C', role: 'root' }
		]
	},
	{
		bar: 2,
		durationBeats: 4,
		durationSeconds: 2,
		midiNotes: [55, 59, 62, 67],
		notes: ['G', 'B', 'D'],
		voiceNotes: [
			{ midiNote: 55, note: 'G', role: 'root' },
			{ midiNote: 59, note: 'B', role: 'third' },
			{ midiNote: 62, note: 'D', role: 'fifth' },
			{ midiNote: 67, note: 'G', role: 'root' }
		]
	}
], { counterpoint: 30, voices: 4 }, {
	initialMidiNote: 60,
	rng: sequenceRng([0.1, 0.6, 0.5, 0.6, 0.5, 0.5, 0.5, 0.75, 0.5]),
	scaleNotes: [{ nombre: 'C' }, { nombre: 'D' }, { nombre: 'E' }, { nombre: 'F' }, { nombre: 'G' }, { nombre: 'A' }, { nombre: 'B' }]
});
assert.equal(hasAudibleMelodyOnLastPulse(lastPulseProtectedMelodyMeasures[0]), true);
const endConnectionMelodyMeasures = global.CodaProgressionMelodicCounterpoint.annotateMeasures([
	{
		bar: 1,
		durationBeats: 4,
		durationSeconds: 2,
		midiNotes: [48, 52, 55, 60],
		notes: ['C', 'E', 'G'],
		voiceNotes: [
			{ midiNote: 48, note: 'C', role: 'root' },
			{ midiNote: 52, note: 'E', role: 'third' },
			{ midiNote: 55, note: 'G', role: 'fifth' },
			{ midiNote: 60, note: 'C', role: 'root' }
		]
	},
	{
		bar: 2,
		durationBeats: 4,
		durationSeconds: 2,
		midiNotes: [55, 59, 62, 67],
		notes: ['G', 'B', 'D'],
		voiceNotes: [
			{ midiNote: 55, note: 'G', role: 'root' },
			{ midiNote: 59, note: 'B', role: 'third' },
			{ midiNote: 62, note: 'D', role: 'fifth' },
			{ midiNote: 67, note: 'G', role: 'root' }
		]
	}
], { counterpoint: 30, voices: 4 }, {
	initialMidiNote: 60,
	rng: sequenceRng([0.1, 0.6, 0.5, 0.1, 0.5, 0.5, 0.5, 0.1, 0.4]),
	scaleNotes: [{ nombre: 'C' }, { nombre: 'D' }, { nombre: 'E' }, { nombre: 'F' }, { nombre: 'G' }, { nombre: 'A' }, { nombre: 'B' }]
});
assert.equal(hasShortMelodyConnectionAtMeasureEnd(endConnectionMelodyMeasures[0]), true);
assert.equal(global.CodaProgressionMelodicCounterpoint.melodicIntervalPenalty(2) < global.CodaProgressionMelodicCounterpoint.melodicIntervalPenalty(8), true);
const structuralMelodyCandidate = global.CodaProgressionMelodicCounterpoint.chooseStructuralMelodyNote({
	bar: 2,
	degreeIndex: 4,
	midiNotes: [55, 59, 62, 67],
	notes: ['G', 'B', 'D'],
	voiceNotes: [
		{ midiNote: 55, note: 'G', role: 'root' },
		{ midiNote: 59, note: 'B', role: 'third' },
		{ midiNote: 62, note: 'D', role: 'fifth' },
		{ midiNote: 67, note: 'G', role: 'root' }
	]
}, 3, {
	initialMidiNote: 60,
	isFirst: false,
	isLast: false,
	previous: { midiNote: 64, note: 'E' },
	previousInterval: 8,
	scaleNotes: [{ nombre: 'C' }, { nombre: 'D' }, { nombre: 'E' }, { nombre: 'F' }, { nombre: 'G' }, { nombre: 'A' }, { nombre: 'B' }]
});
assert.ok(structuralMelodyCandidate.midiNote <= 67);
const generatedMelodyEvents = global.CodaProgressionPlaybackNoteEvents.build({
	articulation: 'sustain',
	durationSeconds: 2,
	melodicVoiceIndex: 3,
	midiNotes: [48, 52, 55, 60],
	passingNotes: [{ delaySeconds: 1, durationSeconds: 1, kind: 'passing', midiNote: 62, note: 'D', voiceIndex: 3 }],
	voiceNotes: [
		{ midiNote: 48, note: 'C' },
		{ midiNote: 52, note: 'E' },
		{ midiNote: 55, note: 'G' },
		{ midiNote: 60, note: 'C' }
	],
	voices: 4
}, 2, {});
assert.deepEqual(generatedMelodyEvents.map(function (event) { return event.midiNote; }), [48, 52, 55, 72, 74]);
assert.equal(generatedMelodyEvents.filter(function (event) { return event.midiNote === 72; })[0].duration, 1);
const structuralOnlyMelodyEvents = global.CodaProgressionPlaybackNoteEvents.build({
	articulation: 'sustain',
	durationSeconds: 2,
	intensity: 120,
	melodicVoiceIndex: 3,
	midiNotes: [48, 52, 55, 60],
	voiceNotes: [
		{ midiNote: 48, note: 'C' },
		{ midiNote: 52, note: 'E' },
		{ midiNote: 55, note: 'G' },
		{ midiNote: 60, note: 'C' }
	],
	voices: 4
}, 2, {});
assert.deepEqual(structuralOnlyMelodyEvents.map(function (event) { return event.midiNote; }), [48, 52, 55, 72]);
assert.equal(structuralOnlyMelodyEvents[3].kind, 'melody-structural');
assert.equal(structuralOnlyMelodyEvents[3].duration, 2);
assert.ok(structuralOnlyMelodyEvents[0].velocity < structuralOnlyMelodyEvents[3].velocity);
assert.ok(structuralOnlyMelodyEvents[3].velocity < 120);
const plannedRhythmicMelodyEvents = global.CodaProgressionPlaybackNoteEvents.build({
	articulation: 'sustain',
	durationSeconds: 2,
	melodyEvents: [
		{ delaySeconds: 0, durationSeconds: 0.25, kind: 'anacrusis', melodic: true, midiNote: 59, note: 'B', voiceIndex: 3 },
		{ delaySeconds: 0.25, durationSeconds: 0.25, kind: 'rest', melodic: true, rest: true, voiceIndex: 3 },
		{ delaySeconds: 0.5, durationSeconds: 0.5, kind: 'melody-structural', melodic: true, midiNote: 60, note: 'C', voiceIndex: 3 }
	],
	melodicVoiceIndex: 3,
	midiNotes: [48, 52, 55, 60],
	voiceNotes: [
		{ midiNote: 48, note: 'C' },
		{ midiNote: 52, note: 'E' },
		{ midiNote: 55, note: 'G' },
		{ midiNote: 60, note: 'C' }
	],
	voices: 4
}, 2, {});
assert.deepEqual(plannedRhythmicMelodyEvents.map(function (event) { return event.midiNote; }), [48, 52, 55, 71, 72]);
assert.deepEqual(plannedRhythmicMelodyEvents.slice(3).map(function (event) { return event.delay; }), [0, 0.5]);
const overlappingMelodyEvents = global.CodaProgressionPlaybackNoteEvents.build({
	articulation: 'sustain',
	durationSeconds: 1,
	melodyEvents: [
		{ delaySeconds: 0, durationSeconds: 0.4, kind: 'melody-structural', melodic: true, midiNote: 60, note: 'C', voiceIndex: 3 },
		{ delaySeconds: 0.25, durationSeconds: 0.4, kind: 'neighbor', melodic: true, midiNote: 62, note: 'D', voiceIndex: 3 },
		{ delaySeconds: 0.65, durationSeconds: 0.35, kind: 'melody-structural', melodic: true, midiNote: 64, note: 'E', voiceIndex: 3 }
	],
	melodicVoiceIndex: 3,
	midiNotes: [48, 52, 55, 60],
	voiceNotes: [
		{ midiNote: 48, note: 'C' },
		{ midiNote: 52, note: 'E' },
		{ midiNote: 55, note: 'G' },
		{ midiNote: 60, note: 'C' }
	],
	voices: 4
}, 1, {});
assert.equal(melodyEventsOverlap(overlappingMelodyEvents.slice(3)), false);
assert.deepEqual(overlappingMelodyEvents.slice(3).map(function (event) { return event.duration; }), [0.25, 0.4, 0.35]);
const timelineProgression = global.CodaProgressionMeasureTimeline.rebuildTimeline({
	beatsPerBar: 4,
	bpm: 120,
	secondsPerBeat: 0.5
}, [
	{
		bar: 7,
		chordName: 'Am',
		durationBeats: 4,
		midiNotes: [57, 60, 64],
		notes: ['A', 'C', 'E'],
		startBeat: 12,
		voiceNotes: [{ midiNote: 57, note: 'A', role: 'root' }]
	}
]);
assert.equal(timelineProgression.measures[0].bar, 1);
assert.equal(timelineProgression.measures[0].startSeconds, 0);
assert.deepEqual(timelineProgression.measures[0].midiNotes, [57, 60, 64]);
assert.equal(global.CodaProgressionFormatting.triadName({ nombre: 'Cm7' }), 'Cm');
assert.equal(global.CodaProgressionFormatting.formatDegreeForChord('VI', 'Cmaj7'), 'VImaj7');
assert.equal(global.CodaProgressionFormatting.displayName('Cmaj7', '4/3', 'sus4', '9'), 'Cmaj7 4/3 sus4 9');
assert.deepEqual(global.CodaProgressionTensions.addToNotes(['C', 'E', 'G'], {
	degreeIndex: 0,
	kind: 'triad',
	scaleNotes: [{ nombre: 'C' }, { nombre: 'D' }, { nombre: 'E' }, { nombre: 'F' }, { nombre: 'G' }, { nombre: 'A' }, { nombre: 'B' }],
	tensions: 85,
	voices: 5
}), {
	label: 'add9 add13',
	notes: ['C', 'E', 'G', 'D', 'A']
});
const chordPlanServicePlan = global.CodaProgressionChordPlan.build({
	index: 0,
	options: {
		includeTensions: false,
		initialMidiNote: 60
	},
	previousPlan: null,
	progressionState: {
		voices: 4,
		voicing: 'closed'
	},
	resolvedDegree: {
		chord: { fundamental: 'C', nombre: 'Cmaj7', quinta: 'G', septima: 'B', tercera: 'E' },
		degree: 'I',
		degreeIndex: 0
	},
	resolvedDegrees: [
		{
			chord: { fundamental: 'C', nombre: 'Cmaj7', quinta: 'G', septima: 'B', tercera: 'E' },
			degree: 'I',
			degreeIndex: 0
		}
	]
});
assert.equal(chordPlanServicePlan.chordName, 'C');
assert.equal(chordPlanServicePlan.kind, 'triad');
const builtMeasures = global.CodaProgressionMeasureBuilder.build([
	{
		chord: { fundamental: 'C', nombre: 'Cmaj7', quinta: 'G', septima: 'B', tercera: 'E' },
		degree: 'I',
		degreeIndex: 0,
		source: 'diatonic'
	}
], {
	articulation: 'sustain',
	beatUnit: 4,
	beatsPerBar: 4,
	counterpoint: 20,
	voices: 4,
	voicing: 'closed'
}, 0.5, {
	initialMidiNote: 60,
	scaleDefinition: { funciones: 'T-SD-D', tonal: 'true' }
});
assert.equal(builtMeasures[0].displayName, 'C');
assert.equal(builtMeasures[0].tonalFunction, 'T');
assert.equal(builtMeasures[0].durationSeconds, 2);
const progressionResult = global.CodaProgressionResult.build({
	generationPlan: {
		pattern: {
			cadence: 'half',
			form: 'test-form',
			id: 'test-pattern'
		},
		voiceLeading: 'balanced'
	},
	measures: builtMeasures,
	progressionState: {
		articulation: 'sustain',
		bars: 1,
		beatUnit: 4,
		beatsPerBar: 4,
		bpm: 120,
		chromaticism: 10,
		counterpoint: 20,
		harmonicDensity: 0,
		meter: '4/4',
		modalInterchange: 25,
		style: 'contemporary',
		tensions: 35,
		voicing: 'closed',
		voices: 4
	},
	secondsPerBeat: 0.5
});
assert.equal(progressionResult.totalSeconds, 2);
assert.equal(progressionResult.generation.patternId, 'test-pattern');
assert.deepEqual(progressionResult.harmonicColor, { chromaticism: 10, counterpoint: 20, modalInterchange: 25, tensions: 35 });
assert.equal(progressionResult.harmonicDensity, 0);
assert.equal(global.CodaProgressionMidiFile.findInstrument(global.CodaData, 'string_ensemble_1').program, 48);
assert.equal(global.CodaProgressionMidiFile.findInstrument(global.CodaData, 'missing').id, global.CodaData.midiInstruments[0].id);
assert.deepEqual(global.CodaProgressionPlanner.createPlan({
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		counterpoint: 80,
		modalInterchange: 10,
		style: 'classic',
		tensions: 35
	},
	report: { mode: 'M' },
	rng: function () { return 0.99; },
	rules: {
		patterns: [
			{
				cadence: 'authentic',
				counterpoint: 80,
				degrees: [0, 1, 4, 0],
				form: 'test',
				id: 'test-authentic',
				modes: ['major'],
				modalColor: 10,
				tensionAffinity: 35,
				weight: 1
			}
		]
	}
}).degrees, [
	{ index: 0, source: 'diatonic' },
	{ index: 1, source: 'diatonic' },
	{ index: 4, source: 'diatonic' },
	{ index: 0, source: 'diatonic' }
]);
const majorFunctionReport = { scaleDefinition: { funciones: 'T-SD-T-SD-D-T-D' } };
assert.equal(global.CodaProgressionPlanner.openingDegreeForSectionStart(majorFunctionReport, sequenceRng([0.2])), 0);
assert.equal(global.CodaProgressionPlanner.openingDegreeForSectionStart(majorFunctionReport, sequenceRng([0.9, 0])), 2);
assert.equal(global.CodaProgressionPlanner.openingDegreeForSectionStart(majorFunctionReport, sequenceRng([0.97, 0.99])), 3);
assert.equal(global.CodaProgressionPlanner.openingDegreeForSectionStart(majorFunctionReport, sequenceRng([0.999])), null);
assert.deepEqual(global.CodaProgressionPlanner.applyOpeningSectionFunctionBias([
	{ index: 4, source: 'diatonic' }
], majorFunctionReport, null, sequenceRng([0.2]), true), [
	{ index: 0, source: 'diatonic' }
]);
assert.deepEqual(global.CodaProgressionPlanner.applyOpeningSectionFunctionBias([
	{ index: 4, source: 'diatonic' }
], majorFunctionReport, 'SD', sequenceRng([0.2]), true), [
	{ index: 4, source: 'diatonic' }
]);
assert.deepEqual(global.CodaProgressionPlanner.applyOpeningSectionFunctionBias([
	{ index: 4, source: 'diatonic', chromaticRole: 'secondary-dominant' }
], majorFunctionReport, null, sequenceRng([0.2]), true), [
	{ index: 4, source: 'diatonic', chromaticRole: 'secondary-dominant' }
]);
const cadentialSixFourPlan = global.CodaProgressionPlanner.createPlan({
	progressionState: {
		articulation: 'sustain',
		bars: 4,
		counterpoint: 100,
		modalInterchange: 10,
		style: 'classic',
		tensions: 35,
		voices: 4
	},
	report: { mode: 'M' },
	rng: sequenceRng([0, 0, 0]),
	rules: {
		patterns: [
			{
				cadence: 'authentic',
				counterpoint: 80,
				degrees: [0, 1, 4, 0],
				form: 'test',
				id: 'test-authentic',
				modes: ['major'],
				modalColor: 10,
				tensionAffinity: 35,
				weight: 1
			}
		]
	}
});
assert.equal(cadentialSixFourPlan.finalCadence, 'cadential64');
assert.equal(cadentialSixFourPlan.degrees[1].forceInversionIndex, 2);
assert.equal(cadentialSixFourPlan.degrees[1].tonalFunctionOverride, 'D');
assert.equal(cadentialSixFourPlan.degrees[2].forceKind, 'seventh');
const neapolitanDegree = global.CodaProgressionChromaticCadence.neapolitanDegree({ tonicIndex: 0 });
assert.deepEqual(neapolitanDegree.chord.factorNotes, ['Db', 'F', 'Ab']);
assert.equal(neapolitanDegree.forceInversionIndex, 1);
assert.equal(neapolitanDegree.degreeDisplayName, '♭II');
const gSharpSwissSixth = global.CodaProgressionChromaticCadence.augmentedSixthDegree({
	tonicIndex: 8,
	tonicName: 'G#'
}, sequenceRng([0.9]));
assert.equal(gSharpSwissSixth.chord.nombre, 'E Sw+6');
assert.deepEqual(gSharpSwissSixth.chord.factorNotes, ['E', 'G♯', 'A𝄪', 'C𝄪']);
assert.equal(gSharpSwissSixth.chord.fundamental, 'E');
assert.deepEqual(global.CodaProgressionChromaticCadence.augmentedSixthNotes(8, {
	id: 'german65',
	label: 'Ger+6'
}, 'G#'), ['E', 'G♯', 'B', 'C𝄪']);
assert.deepEqual(global.CodaProgressionChromaticCadence.augmentedSixthNotes(8, {
	id: 'french43',
	label: 'Fr+6'
}, 'G#'), ['E', 'G♯', 'A♯', 'C𝄪']);
assert.deepEqual(global.CodaProgressionChromaticCadence.augmentedSixthNotes(8, {
	id: 'italian6',
	label: 'It+6'
}, 'G#'), ['E', 'G♯', 'G♯', 'C𝄪']);
assert.equal(global.CodaProgressionVoicing.noteIndex('A𝄪'), 11);
assert.equal(global.CodaProgressionVoicing.noteIndex('C𝄪'), 2);
assert.ok(global.CodaProgressionChromaticCadence.chromaticCadenceProbability({
	cadence: 'authentic'
}, {
	chromaticism: 100,
	counterpoint: 80,
	style: 'renaissance'
}) < 0.1);
assert.ok(global.CodaProgressionChromaticCadence.chromaticResourceStyleWeight('italian6', {
	style: 'renaissance'
}) < global.CodaProgressionChromaticCadence.chromaticResourceStyleWeight('italian6', {
	style: 'baroque'
}));
assert.equal(global.CodaProgressionChromaticCadence.chromaticResourceStyleWeight('swiss65', {
	style: 'baroque'
}), 0);
assert.equal(global.CodaProgressionChromaticCadence.augmentedSixthVariant(sequenceRng([0.99]), {
	style: 'baroque'
}).id, 'german65');
assert.equal(global.CodaProgressionChromaticCadence.augmentedSixthVariant(sequenceRng([0.97]), {
	style: 'classic'
}).id, 'swiss65');
assert.equal(global.CodaProgressionChromaticCadence.augmentedSixthVariant(sequenceRng([0.88]), {
	style: 'romantic'
}).id, 'german65');
assert.equal(global.CodaProgressionCadencePlanner.finalCadenceForPattern({
	cadence: 'authentic'
}, {
	chromaticism: 100,
	counterpoint: 80,
	style: 'classic'
}, sequenceRng([0, 0])), 'neapolitan');
assert.equal(global.CodaProgressionChromaticCadence.subFiveCadenceChance({
	chromaticism: 70
}), 0);
assert.equal(global.CodaProgressionChromaticCadence.chooseChromaticCadenceType({
	chromaticism: 100,
	style: 'classic'
}, sequenceRng([0.9])), 'subFive');
const cMajorScaleChords = [
	{ fundamental: 'C', nombre: 'Cmaj7', quinta: 'G', septima: 'B', tercera: 'E' },
	{ fundamental: 'D', nombre: 'Dm7', quinta: 'A', septima: 'C', tercera: 'F' },
	{ fundamental: 'E', nombre: 'Em7', quinta: 'B', septima: 'D', tercera: 'G' },
	{ fundamental: 'F', nombre: 'Fmaj7', quinta: 'C', septima: 'E', tercera: 'A' },
	{ fundamental: 'G', nombre: 'G7', quinta: 'D', septima: 'F', tercera: 'B' },
	{ fundamental: 'A', nombre: 'Am7', quinta: 'E', septima: 'G', tercera: 'C' },
	{ fundamental: 'B', nombre: 'Bm7b5', quinta: 'F', septima: 'A', tercera: 'D' }
];
const cMajorSubFive = global.CodaProgressionChromaticCadence.subFiveDegree({
	scaleChords: cMajorScaleChords,
	tonicIndex: 0
}, {
	progressionState: {
		chromaticism: 100,
		voices: 4
	},
	rng: sequenceRng([0.7]),
	targetDegreeIndex: 0
});
assert.deepEqual(cMajorSubFive.chord.factorNotes, ['Db', 'F', 'Ab', 'B']);
assert.equal(cMajorSubFive.chord.nombre, 'Db7');
assert.equal(cMajorSubFive.degreeDisplayName, 'SubV/I');
assert.equal(cMajorSubFive.forceKind, 'seventh');
assert.equal(cMajorSubFive.tonalFunctionOverride, 'D');
const cMajorSubFiveOfDominant = global.CodaProgressionChromaticCadence.subFiveDegree({
	scaleChords: cMajorScaleChords,
	tonicIndex: 0
}, {
	progressionState: {
		chromaticism: 100,
		voices: 4
	},
	rng: sequenceRng([0.1]),
	targetDegreeIndex: 4
});
assert.deepEqual(cMajorSubFiveOfDominant.chord.factorNotes, ['Ab', 'C', 'Eb', 'Gb']);
assert.equal(cMajorSubFiveOfDominant.degreeDisplayName, 'SubV/V');
assert.equal(cMajorSubFiveOfDominant.forceInversionIndex, 3);
const chromaticEndingDegrees = [
	{ index: 0, source: 'diatonic' },
	{ index: 1, source: 'diatonic' },
	{ index: 4, source: 'diatonic' },
	{ index: 0, source: 'diatonic' }
];
global.CodaProgressionCadencePlanner.forceCadentialEnding(chromaticEndingDegrees, { cadence: 'neapolitan' }, {
	cadence: 'neapolitan',
	progressionState: {
		chromaticism: 100,
		counterpoint: 90,
		style: 'classic',
		voices: 4
	},
	report: { tonicIndex: 0 },
	rng: sequenceRng([1, 0])
});
assert.equal(chromaticEndingDegrees[1].chromaticRole, 'neapolitan');
assert.equal(chromaticEndingDegrees[1].tonalFunctionOverride, 'SD');
assert.equal(chromaticEndingDegrees[2].index, 4);
const subFiveHalfCadenceDegrees = [
	{ index: 0, source: 'diatonic' },
	{ index: 3, source: 'diatonic' },
	{ index: 1, source: 'diatonic' },
	{ index: 4, source: 'diatonic' }
];
global.CodaProgressionCadencePlanner.forceCadentialEnding(subFiveHalfCadenceDegrees, { cadence: 'half' }, {
	cadence: 'subFive',
	progressionState: {
		chromaticism: 100,
		voices: 4
	},
	report: {
		scaleChords: cMajorScaleChords,
		tonicIndex: 0
	},
	rng: sequenceRng([0.7, 0])
});
assert.equal(subFiveHalfCadenceDegrees[2].chromaticRole, 'subFive');
assert.equal(subFiveHalfCadenceDegrees[2].degreeDisplayName, 'SubV/V');
assert.equal(subFiveHalfCadenceDegrees[3].cadentialRole, 'cadential-dominant');
assert.equal(subFiveHalfCadenceDegrees[3].index, 4);
const subFiveAuthenticCadenceDegrees = [
	{ index: 0, source: 'diatonic' },
	{ index: 3, source: 'diatonic' },
	{ index: 4, source: 'diatonic' },
	{ index: 0, source: 'diatonic' }
];
global.CodaProgressionCadencePlanner.forceCadentialEnding(subFiveAuthenticCadenceDegrees, { cadence: 'authentic' }, {
	cadence: 'subFive',
	progressionState: {
		chromaticism: 80,
		voices: 4
	},
	report: {
		scaleChords: cMajorScaleChords,
		tonicIndex: 0
	},
	rng: sequenceRng([0.9, 0.7])
});
assert.equal(subFiveAuthenticCadenceDegrees[2].chromaticRole, 'subFive');
assert.equal(subFiveAuthenticCadenceDegrees[2].degreeDisplayName, 'SubV/I');
assert.equal(subFiveAuthenticCadenceDegrees[3].cadentialRole, 'cadential-resolution');
const variedTonicBlock = global.CodaProgressionPlanner.varyBlockOpening([
	{ index: 0, source: 'diatonic' },
	{ index: 3, source: 'diatonic' }
], 1, 'major', sequenceRng([0.7, 0]));
assert.equal(variedTonicBlock[0].index, 5);
const variedSubdominantBlock = global.CodaProgressionPlanner.varyBlockOpening([
	{ index: 0, source: 'diatonic' },
	{ index: 4, source: 'diatonic' }
], 2, 'minor', sequenceRng([0.95, 0]));
assert.equal(variedSubdominantBlock[0].index, 3);
assert.equal(global.CodaProgressionPlanner.repetitionChance({ bars: 2 }), 0);
assert.equal(global.CodaProgressionPlanner.repetitionChance({ bars: 4 }), 0.02);
assert.equal(global.CodaProgressionPlanner.repetitionChance({ bars: 8 }), 0.08);
assert.equal(global.CodaProgressionPlanner.repetitionChance({ bars: 16 }), 0.16);
assert.equal(global.CodaProgressionPlanner.repetitionChance({ bars: 32 }), 0.24);
const noRepeatTwoBars = global.CodaProgressionPlanner.applySparseChordRepetition([
	{ index: 0, source: 'diatonic' },
	{ index: 4, source: 'diatonic' }
], { bars: 2 }, sequenceRng([0]));
assert.deepEqual(noRepeatTwoBars.map(function (degree) { return degree.index; }), [0, 4]);
const sparseRepeatedDegrees = global.CodaProgressionPlanner.applySparseChordRepetition([
	{ index: 0, source: 'diatonic' },
	{ index: 3, source: 'diatonic' },
	{ index: 1, source: 'diatonic' },
	{ index: 4, source: 'diatonic' },
	{ index: 0, source: 'diatonic' },
	{ index: 2, source: 'diatonic' },
	{ index: 4, source: 'diatonic' },
	{ index: 0, source: 'diatonic' }
], { bars: 8 }, sequenceRng([0.01, 0.4]));
assert.deepEqual(sparseRepeatedDegrees.map(function (degree) { return degree.index; }), [0, 3, 1, 1, 0, 2, 4, 0]);
assert.equal(sparseRepeatedDegrees[3].repetitionRole, 'direct-repeat');
assert.equal(sparseRepeatedDegrees[6].index, 4);
assert.equal(sparseRepeatedDegrees[7].index, 0);
const chordMenuServiceGroups = global.CodaProgressionChordMenu.build({
	currentSegment: {
		notes: ['C', 'E', 'G'],
		tonalFunction: 'T'
	},
	report: {
		scaleChords: [
			{ fundamental: 'C', nombre: 'Cmaj7', quinta: 'G', septima: 'B', tercera: 'E' },
			{ fundamental: 'D', nombre: 'Dm7', quinta: 'A', septima: 'C', tercera: 'F' },
			{ fundamental: 'E', nombre: 'Em7', quinta: 'B', septima: 'D', tercera: 'G' }
		],
		scaleDefinition: {
			funciones: 'T-SD-T',
			tonal: 'true'
		},
		scaleNotes: [
			{ grado: 'I' },
			{ grado: 'II' },
			{ grado: 'III' }
		]
	}
});
assert.deepEqual(chordMenuServiceGroups[0].items.map(function (item) { return item.chordName; }), ['Cmaj7', 'Em7']);
assert.equal(chordMenuServiceGroups[1].id, 'interchange');
assert.deepEqual(chordMenuServiceGroups[2].items.map(function (item) { return item.chordName; }), ['Dm7']);
assert.equal(chordMenuServiceGroups[2].items[0].commonToneCount, 1);
assert.ok(fs.readFileSync(path.join(root, 'js/midi/loader.js'), 'utf8').indexOf('root.USE_XHR = false') > -1);
assert.equal(fs.readFileSync(path.join(root, 'js/midi/loader.js'), 'utf8').indexOf('script.text'), -1);
assert.ok(fs.readFileSync(path.join(root, 'js/ui/static-text-controller.js'), 'utf8').indexOf('setTrustedHtml') > -1);
assert.equal(global.CodaRandomSelect.isSelectableOption({ value: '7', text: '------------' }), false);
assert.equal(global.CodaRandomSelect.isSelectableOption({ value: '3', text: 'Menor natural' }), true);
assert.equal(global.CodaRandomSelect.isSelectableOption({ value: '3', text: 'Menor natural', disabled: true }), false);
assert.deepEqual(global.CodaRandomSelect.pickOption([
	{ value: '0', text: 'C' },
	{ value: '1', text: 'D' },
	{ value: '2', text: 'E' }
], function () { return 0.99; }), { value: '2', text: 'E' });
assert.equal(global.CodaRandomSelect.pickNumericValue({
	max: '200',
	min: '20',
	step: '1',
	type: 'number'
}, function () { return 0.999; }), '200');
assert.equal(global.CodaRandomSelect.pickNumericValue({
	max: '6',
	min: '1',
	step: '1',
	type: 'number'
}, function () { return 0; }), '1');

let controllerOptions;
const i18n = global.CodaI18n.create({
	initialLanguage: 'es',
	translations: global.CodaTranslations
});
const englishI18n = global.CodaI18n.create({
	initialLanguage: 'en',
	translations: global.CodaTranslations
});
const defaultI18n = global.CodaI18n.create({
	initialLanguage: '',
	translations: global.CodaTranslations
});
assert.equal(defaultI18n.getLanguage(), 'en');
assert.equal(global.CodaUiState.create().getLanguage(), 'en');
const preferences = global.CodaPreferences.create();
let playbackOptions;
let loadCalled = false;
const initialProgressionWorkspace = {
	progression: {
		bars: 1,
		measures: [{ bar: 1 }]
	},
	progressionState: {
		bars: 1
	},
	signature: '5|2|1',
	version: 1
};

const startResult = global.CodaBootstrap.start({
	application: global.CodaApplication,
	controller: {
		initialize: function (options) {
			controllerOptions = options;
			return { initialized: true };
		}
	},
	data: global.CodaData,
	domain: global.CodaDomain,
	i18n: i18n,
	initialForm: {
		format: '1',
		midiInstrument: 'string_ensemble_1',
		scaleIndex: '2',
		tonicIndex: '5'
	},
	initialNotation: 'latin',
	initialProgressionState: {
		bars: 16,
		voicing: 'open'
	},
	initialProgressionWorkspace: initialProgressionWorkspace,
	initialTheme: 'day',
	initialVolume: 73,
	midi: { plugin: {} },
	notation: global.CodaNotation,
	playbackFactory: {
		create: function (options) {
			playbackOptions = options;
			return {
				load: function () {
					loadCalled = true;
				}
			};
		}
	},
	preferences: preferences,
	renderers: global.CodaRenderers,
	keyNavigation: global.CodaKeyNavigation,
	changelogDialog: { initialize: function () {} },
	musicalContextFactory: global.CodaMusicalContext,
	staticText: global.CodaStaticText,
	themeControl: global.CodaThemeControl,
	ui: global.CodaUi,
	uiStateFactory: global.CodaUiState
});

assert.equal(startResult.controller.initialized, true);
assert.ok(startResult.chordPlayback.playChordFromCellId);
assert.ok(startResult.instrumentPlayback.playMidiNote);
assert.ok(startResult.progressionPlayback.play);
assert.equal(loadCalled, false);
assert.equal(playbackOptions.notes, global.CodaData.notes);
assert.equal(global.CodaData.indexes.notes.indexByName['F#'], 6);
assert.equal(global.CodaData.indexes.chords.byName.Dominante.abreviatura, '7');
assert.equal(playbackOptions.channel, global.CodaData.midi.channel);
assert.equal(playbackOptions.instrument, global.CodaData.midiInstruments[0].id);
assert.equal(playbackOptions.instruments, global.CodaData.midiInstruments);
assert.equal(playbackOptions.articulationInstruments, global.CodaData.midiPlaybackInstruments);
assert.equal(playbackOptions.volumePercent, 73);
assert.ok(global.CodaData.progressionRules.patterns.length > 0);
assert.ok(global.CodaData.progressionRules.modalFutureRules.length >= 8);
assert.ok(global.CodaData.progressionRules.modalFutureRules.every(function (rule) {
	return rule.active === false && rule.priority === 'future';
}));
assert.ok(global.CodaData.progressionRules.modalFutureRules.some(function (rule) {
	return rule.id === 'modal-deception';
}));
assert.equal(controllerOptions.application, global.CodaApplication);
assert.equal(controllerOptions.changelogDialog.initialize != null, true);
assert.equal(controllerOptions.chordPlayback, startResult.chordPlayback);
assert.equal(controllerOptions.dashboardResizer, global.CodaDashboardResizer);
assert.equal(controllerOptions.domain, global.CodaDomain);
assert.equal(controllerOptions.i18n, i18n);
assert.deepEqual(controllerOptions.initialForm, {
	format: '1',
	midiInstrument: 'string_ensemble_1',
	scaleIndex: '2',
	tonicIndex: '5'
});
assert.equal(controllerOptions.initialNotation, 'latin');
assert.deepEqual(controllerOptions.initialProgressionState, {
	bars: 16,
	voicing: 'open'
});
assert.equal(controllerOptions.initialProgressionWorkspace, initialProgressionWorkspace);
assert.equal(controllerOptions.initialTheme, 'day');
assert.equal(controllerOptions.initialVolume, 73);
assert.equal(controllerOptions.instrumentPlayback, startResult.instrumentPlayback);
assert.equal(controllerOptions.keyNavigation, global.CodaKeyNavigation);
assert.ok(controllerOptions.musicalContext.fromSelection);
assert.equal(controllerOptions.notation, global.CodaNotation);
assert.equal(controllerOptions.playbackService, startResult.playbackService);
assert.equal(controllerOptions.progressionDocument, global.CodaProgressionDocument);
assert.equal(controllerOptions.progressionPlayback, startResult.progressionPlayback);
assert.equal(controllerOptions.progressionPreferences, global.CodaProgressionPreferences);
assert.equal(controllerOptions.progressionWorkspaceStorage, global.CodaProgressionWorkspaceStorage);
assert.equal(controllerOptions.progressionState, global.CodaProgressionState);
assert.equal(controllerOptions.progressionTransport, global.CodaProgressionTransport);
assert.equal(controllerOptions.randomSelectControl, global.CodaRandomSelect);
assert.equal(controllerOptions.preferences, preferences);
assert.equal(controllerOptions.renderers, global.CodaRenderers);
assert.equal(controllerOptions.staticText, global.CodaStaticText);
assert.equal(controllerOptions.themeControl, global.CodaThemeControl);
assert.equal(controllerOptions.ui, global.CodaUi);
assert.equal(controllerOptions.uiState, startResult.uiState);
assert.equal(controllerOptions.volumeControl, global.CodaVolumeControl);
assert.equal(i18n.applyStatic, undefined);
assert.equal(startResult.uiState.getLanguage(), 'es');
assert.equal(startResult.uiState.getNotationStyle(), 'latin');
startResult.uiState.setSelection({ instrument: '0', tonicName: 'C' });
startResult.uiState.setMusicalContext({ tonicName: 'C', scaleName: 'Mayor' });
startResult.uiState.setSelectedTuningIndex(2);
assert.equal(startResult.uiState.getInstrument(), '0');
assert.equal(startResult.uiState.getMusicalContext().scaleName, 'Mayor');
assert.equal(startResult.uiState.getSelectedTuningIndex(), 2);
startResult.uiState.resetSelectedTuningIndex();
assert.equal(startResult.uiState.getSelectedTuningIndex(), 0);

let midiLoadOptions = null;
let playedChord = null;
let stoppedChord = null;
let volumeVelocity = null;
let chordVelocity = null;
let selectedProgram = null;
let stoppedAllNotes = false;
const lazyPlayback = global.CodaPlayback.create({
	channel: 0,
	initialMidiNote: 60,
	midi: {
		loadPlugin: function (options) {
			midiLoadOptions = options;
		},
		setVolume: function (channel, velocity) {
			volumeVelocity = velocity;
		},
		programChange: function (channel, program) {
			selectedProgram = program;
		},
		chordOn: function (channel, chord, velocity) {
			playedChord = chord;
			chordVelocity = velocity;
		},
		chordOff: function (channel, chord) {
			stoppedChord = chord;
		},
		stopAllNotes: function () {
			stoppedAllNotes = true;
		}
	},
	instruments: global.CodaData.midiInstruments,
	notes: global.CodaData.notes
});

lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.ok(midiLoadOptions);
assert.equal(playedChord, null);
assert.equal(midiLoadOptions.api, 'webaudio');
midiLoadOptions.onsuccess();
assert.deepEqual(playedChord, [60, 64, 67]);
assert.deepEqual(stoppedChord, [60, 64, 67]);
assert.equal(volumeVelocity, 127);
assert.equal(chordVelocity, 127);
assert.equal(selectedProgram, 0);
lazyPlayback.setVolume(50);
lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.equal(volumeVelocity, 64);
assert.equal(chordVelocity, 64);
lazyPlayback.setVolume(0);
lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.equal(chordVelocity, 0);
assert.equal(lazyPlayback.setInstrument('acoustic_guitar_nylon'), 'acoustic_guitar_nylon');
assert.equal(lazyPlayback.isReady(), false);
playedChord = null;
midiLoadOptions = null;
lazyPlayback.playChordFromNames(['C', 'E', 'G']);
assert.equal(midiLoadOptions.instrument, 'acoustic_guitar_nylon');
assert.equal(playedChord, null);
midiLoadOptions.onsuccess();
assert.equal(selectedProgram, 24);
assert.deepEqual(playedChord, [60, 64, 67]);
lazyPlayback.stopAllNotes();
assert.equal(stoppedAllNotes, true);
assert.equal(global.CodaScaleReportController.resolvePlaybackInstrument(global.CodaData, 'string_ensemble_1').viewInstrument, '1');
assert.equal(global.CodaScaleReportController.resolvePlaybackInstrument(global.CodaData, '0').id, 'acoustic_guitar_nylon');
assert.equal(global.CodaThemeControl.normalizeTheme('day'), 'day');
assert.equal(global.CodaThemeControl.normalizeTheme('night'), 'night');
assert.equal(global.CodaThemeControl.normalizeTheme('missing'), 'night');
assert.deepEqual(global.CodaScaleReportController.resolveInitialForm(global.CodaData, {
	format: '1',
	midiInstrument: 'drawbar_organ',
	scaleIndex: '3',
	tonicIndex: '8'
}), {
	format: '1',
	midiInstrument: 'drawbar_organ',
	scaleIndex: 3,
	tonicIndex: 8
});
assert.deepEqual(global.CodaScaleReportController.resolveInitialForm(global.CodaData, {
	format: '9',
	midiInstrument: 'missing',
	scaleIndex: '999',
	tonicIndex: '-1'
}), {
	format: '0',
	midiInstrument: 'acoustic_grand_piano',
	scaleIndex: 0,
	tonicIndex: 0
});

let sliderValue = '100';
let volumeInputHandler = null;
let volumeOutputText = null;
let volumeAriaText = null;
let savedVolume = null;
let appliedVolume = null;
function fakeVolumeElement() {
	return {
		setAttribute: function (name, value) {
			if (name === 'aria-valuetext') {
				volumeAriaText = value;
			}
		},
		addEventListener: function (eventName, handler) {
			if (eventName === 'input') {
				volumeInputHandler = handler;
			}
		},
		get textContent() {
			return volumeOutputText;
		},
		set textContent(value) {
			volumeOutputText = value;
		},
		get value() {
			return sliderValue;
		},
		set value(value) {
			sliderValue = String(value);
		}
	};
}
const fakeSlider = fakeVolumeElement();
const fakeOutput = fakeVolumeElement();
global.document = {
	getElementById: function (id) {
		if (id === 'selectorVolumen') {
			return fakeSlider;
		}
		if (id === 'valorVolumen') {
			return fakeOutput;
		}
		return null;
	}
};
global.CodaVolumeControl.initialize({
	initialVolume: 42,
	playbackService: {
		getVolume: function () {
			return 100;
		},
		setVolume: function (value) {
			appliedVolume = Number(value);
			return appliedVolume;
		}
	},
	preferences: {
		setValue: function (key, value) {
			if (key === 'volume') {
				savedVolume = value;
			}
		}
	}
});
assert.equal(appliedVolume, 42);
assert.equal(volumeOutputText, '42%');
assert.equal(volumeAriaText, '42%');
assert.equal(savedVolume, null);
sliderValue = '25';
volumeInputHandler();
assert.equal(savedVolume, 25);
assert.equal(appliedVolume, 25);

global.CodaData.scales.forEach(function (scale, index) {
	assert.ok(global.CodaTranslations.es['data.scales.' + index] != null);
	assert.ok(global.CodaTranslations.en['data.scales.' + index] != null);
});
global.CodaData.tunings.forEach(function (tuning, index) {
	assert.ok(global.CodaTranslations.es['data.tunings.' + index] != null);
	assert.ok(global.CodaTranslations.en['data.tunings.' + index] != null);
});
assert.equal(englishI18n.dataLabel('scales', 0, 'Mayor'), 'Major');
assert.equal(englishI18n.dataLabel('tunings', 0, 'Estándar E'), 'Standard E');
assert.equal(global.CodaNotation.formatChordName('F#m7', 'latin'), 'Fa♯m7');
assert.equal(global.CodaNotation.formatNoteSequence('D-F#-A-C', 'latin'), 'Re-Fa♯-La-Do');
assert.equal(global.CodaNotation.formatNoteName('A\uD834\uDD2A', 'latin'), 'La♯♯');
assert.equal(global.CodaNotation.formatNoteName('C\uD834\uDD2A', 'anglosaxon'), 'C♯♯');
assert.equal(global.CodaNotation.formatNoteName('Bbb', 'anglosaxon'), 'B♭♭');

global.CodaData.midiInstruments.forEach(function (instrument, index) {
	assert.ok(global.CodaTranslations.es['data.midiInstruments.' + index] != null);
	assert.ok(global.CodaTranslations.en['data.midiInstruments.' + index] != null);
});
assert.equal(englishI18n.dataLabel('midiInstruments', 1, 'Guitarra clásica'), 'Classical guitar');

function sequenceRng(values) {
	let index = 0;

	return function () {
		const value = values[Math.min(index, values.length - 1)];
		index += 1;

		return value;
	};
}

function consecutiveMelodyRepeatStats(measures) {
	let previous = null;
	let repeats = 0;
	let total = 0;

	(measures || []).forEach(function (measure) {
		(measure.melodyEvents || []).forEach(function (event) {
			if (event.rest || event.midiNote == null) {
				return;
			}

			if (previous != null && event.midiNote === previous) {
				repeats += 1;
			}

			previous = event.midiNote;
			total += 1;
		});
	});

	return {
		repeats: repeats,
		total: total
	};
}

function melodicTestMeasure(bar, midiNotes, notes) {
	return {
		bar: bar,
		degreeIndex: melodicTestDegreeIndex(notes[0]),
		durationBeats: 4,
		durationSeconds: 2,
		midiNotes: midiNotes.slice(),
		notes: notes.slice(),
		voiceNotes: [
			{ midiNote: midiNotes[0], note: notes[0], role: 'root' },
			{ midiNote: midiNotes[1], note: notes[1], role: 'third' },
			{ midiNote: midiNotes[2], note: notes[2], role: 'fifth' },
			{ midiNote: midiNotes[3], note: notes[0], role: 'root' }
		]
	};
}

function melodicTestDegreeIndex(noteName) {
	const indexes = {
		C: 0,
		D: 1,
		E: 2,
		F: 3,
		G: 4,
		A: 5,
		B: 6
	};

	return indexes[noteName] != null ? indexes[noteName] : 0;
}

function firstAudibleMelodyDelay(measure) {
	const firstEvent = (measure.melodyEvents || []).find(function (event) {
		return !event.rest && event.midiNote != null;
	});

	return firstEvent ? firstEvent.delaySeconds : null;
}

function lastAudibleMelodyEvent(measure) {
	const audibleEvents = (measure.melodyEvents || []).filter(function (event) {
		return !event.rest && event.midiNote != null;
	});

	return audibleEvents[audibleEvents.length - 1] || null;
}

function hasAudibleMelodyOnLastPulse(measure) {
	const durationSeconds = Number(measure && measure.durationSeconds) || 0;
	const durationBeats = Number(measure && measure.durationBeats) || 0;
	const secondsPerBeat = durationSeconds && durationBeats ? durationSeconds / durationBeats : 0.5;
	const lastPulseStart = Math.max(0, durationSeconds - secondsPerBeat);

	return (measure.melodyEvents || []).some(function (event) {
		if (event.rest || event.midiNote == null) {
			return false;
		}

		const start = Number(event.delaySeconds) || 0;
		const end = start + (Number(event.durationSeconds) || 0);

		return end > lastPulseStart + 0.001;
	});
}

function hasShortMelodyConnectionAtMeasureEnd(measure) {
	const durationSeconds = Number(measure && measure.durationSeconds) || 0;
	const durationBeats = Number(measure && measure.durationBeats) || 0;
	const secondsPerBeat = durationSeconds && durationBeats ? durationSeconds / durationBeats : 0.5;
	const eighthNoteSeconds = secondsPerBeat * 0.5;
	const endConnectionStart = Math.max(0, durationSeconds - eighthNoteSeconds);

	return (measure.melodyEvents || []).some(function (event) {
		if (event.rest || event.midiNote == null) {
			return false;
		}

		return Number(event.delaySeconds) >= endConnectionStart - 0.001 &&
			Number(event.durationSeconds) <= eighthNoteSeconds + 0.001;
	});
}

function melodyEventsOverlap(events) {
	const sortedEvents = (events || []).slice().sort(function (a, b) {
		return (a.delay || 0) - (b.delay || 0);
	});

	for (let i = 1; i < sortedEvents.length; i++) {
		const previousEnd = (Number(sortedEvents[i - 1].delay) || 0) + (Number(sortedEvents[i - 1].duration) || 0);
		const currentStart = Number(sortedEvents[i].delay) || 0;

		if (previousEnd > currentStart + 0.001) {
			return true;
		}
	}

	return false;
}

function maxVoiceMotion(previousMidiNotes, nextMidiNotes) {
	const length = Math.min((previousMidiNotes || []).length, (nextMidiNotes || []).length);
	let max = 0;

	for (let i = 0; i < length; i++) {
		max = Math.max(max, Math.abs(Number(nextMidiNotes[i]) - Number(previousMidiNotes[i])));
	}

	return max;
}

console.log('Architecture tests passed');
