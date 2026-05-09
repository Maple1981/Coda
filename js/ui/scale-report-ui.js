// UI orchestration for the legacy jQuery screen. It reads DOM selections and
// mounts renderer output, but delegates musical work to the application layer.
(function (global) {
	'use strict';

	function readSelection($) {
		return {
			instrument: $('#interface input:radio[name="instrumento"]:checked').val(),
			preferFlats: $('#interface input:radio[name="formato"]:checked').val() === '1',
			scaleIndex: parseInt($('select#escala option:selected').val(), 10),
			scaleName: $('select#escala option:selected').text(),
			tonicIndex: parseInt($('select#tonica option:selected').val(), 10),
			tonicName: $('select#tonica option:selected').text()
		};
	}

	function hasRenderedResults($) {
		return $('#notacion').children().length > 0 && $('#instrumento').children().length > 0;
	}

	function renderScaleReport(options) {
		var $ = options.$;
		var report = options.report;

		$('#notacion').empty().append(options.renderers.scaleSummary.renderTitle({
			scaleName: report.scaleName,
			tonicName: report.tonicName
		}));

		$('#notacion').append(options.renderers.scaleSummary.renderList({
			circleOfFifths: options.data.circleOfFifths,
			isDegreeSuppressed: report.isDegreeSuppressed,
			scaleDefinition: report.scaleDefinition,
			scaleNotes: report.scaleNotes,
			selectedScaleIndex: report.scaleIndex,
			tonicName: report.tonicName
		}));

		$('#armoniaExtendida').empty();

		if (report.scaleNotes.length === 7) {
			$('#notacion').append(options.renderers.scaleChords.render({
				mode: report.mode,
				parallelScaleChords: report.parallelScaleChords,
				scaleChords: report.scaleChords,
				scaleDefinition: report.scaleDefinition,
				scaleNotes: report.scaleNotes
			}));

			if (report.extendedHarmonyEnabled) {
				renderExtendedHarmony(options);
			}

			attachChordEvents(options);
		}

		$('#circuloQuintas').empty().append(options.renderers.circleOfFifths.render(report.circleOfFifths));
	}

	function renderExtendedHarmony(options) {
		var $ = options.$;
		var report = options.report;

		$('#armoniaExtendida').empty().append(options.renderers.extendedHarmony.render({
			data: options.data,
			domain: options.domain,
			mode: report.mode,
			preferFlats: options.selection.preferFlats,
			scaleChords: report.scaleChords,
			scaleName: report.scaleName,
			scaleNotes: report.scaleNotes,
			tonicName: report.tonicName
		}));

		$('#acordeonArmoniaExtendida').accordion({
			heightStyle: 'content'
		});
		$('#acordeonArmoniaExtendida').accordion('option', 'collapsible', true);
	}

	function attachChordEvents(options) {
		var $ = options.$;

		$('.celdaAcorde').mouseover(function () {
			options.onChordMouseOver(this);
		});
		$('.celdaAcorde').mouseout(function () {
			options.onChordMouseOut();
		});
		$('.celdaAcorde').click(function () {
			options.onChordClick(this);
		});
	}

	function renderInstrument(options) {
		var html = '';

		if (options.instrumentView.type === 'piano') {
			html = options.renderers.instruments.renderPiano({
				keyboard: options.instrumentView.keyboard,
				scaleDefinition: options.report.scaleDefinition
			});
		} else {
			html = options.renderers.instruments.renderGuitar({
				scaleDefinition: options.report.scaleDefinition,
				strings: options.instrumentView.strings,
				tuning: options.instrumentView.tuning,
				tunings: options.data.tunings
			});
		}

		options.$('#instrumento').empty().append(html);
	}

	global.CodaUi = {
		attachChordEvents: attachChordEvents,
		hasRenderedResults: hasRenderedResults,
		readSelection: readSelection,
		renderExtendedHarmony: renderExtendedHarmony,
		renderInstrument: renderInstrument,
		renderScaleReport: renderScaleReport
	};
})(window);
