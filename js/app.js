//****************************
//Javier Arce 2013-2021
//Esta obra está bajo licencia Creative Commons by-sa 4.0 International, Reconocimiento-Compartir igual
//https://creativecommons.org/licenses/by-sa/4.0/
//****************************

$( document ).ready(function() {
	
	//VARIABLES DE ÁMBITO LOCAL, GENERADAS UNA VEZ EL DOM ESTÉ PREPARADO
	var informeEscalaActual;
	var numeroAfinacionElegida = 0;

	var data = CodaData;
	var delay = data.midi.delay;
	var velocity = data.midi.velocity;
	var channel = data.midi.channel;
	var Cinicial = data.midi.initialMidiNote;
	var notas = data.notes;
	var escalas = data.scales;

	var playbackService = CodaPlayback.create({
		midi: MIDI,
		notes: notas,
		channel: channel,
		velocity: velocity,
		delay: delay,
		initialMidiNote: Cinicial,
		soundfontUrl: './soundfont/',
		instrument: 'acoustic_grand_piano'
	});
	
	//en cuanto estamos preparados, incializamos el radio de formato para evitar
	//inconsistencias de #/b que puedan provocar en el select desplegable las recargas de navegador(F5)
	$('#interface input:radio[name="formato"][value="0"]').prop('checked', true);
	
	//FUNCIONES Y MÉTODOS
	//método que rellena los selects del front-end con las hashtables notas y escalas
    function llenaSelectHashTable(selec, vector, bemoles)   
	{
		var html = '';
		for(var i = 0; i < vector.length; ++i) {
		   
		    var nombre = vector[i]['nombre'];
		   
		   
		   //si ya ha habido una selección previa, marcamos el option que ya estaba
		   var seleccionado = '';
		   if (i == $('select#' + selec.attr('id') + ' option:selected').val()){
				seleccionado = ' selected ';
		   };
		   
		   if(bemoles)
		   {
				if (vector[i]['enarmonica'] != undefined){ nombre= vector[i]['enarmonica'];}   
		   };
		   
		   html += '<option value="';
		   html += i + '"' + seleccionado + '>';
		   
		   html += nombre + '</option>';
		};
		
		selec.empty().append(html);
	};
	 
	//MÉTODOS Y FUNCIONES DE UTILIDAD
	
	//responde al mouseover sobre la celda de un acorde de notación, coloreando la vista de instrumento
	function coloreaAcordeElegido(objThis){
	
		var celdasNotasInstrumento = $("td.celdaNota span");
		var notasPart = objThis.id.split('-');
		
		for(var i= 0; i<=notasPart.length - 1; i++){
			for(var j= 0; j<=celdasNotasInstrumento.length - 1; j++){
				
				if($(celdasNotasInstrumento[j]).html() == notasPart[i]){
					$(celdasNotasInstrumento[j]).addClass('resaltada');
				};
				
			};
		};

	};
	
	//devuelve el color original a las notas del instrumento
	function limpiaColorAcordes(){
		
		var celdasNotasInstrumento = $("td.celdaNota span");
		for(var i= 0; i<=celdasNotasInstrumento.length - 1; i++){
			$(celdasNotasInstrumento[i]).removeClass('resaltada');
		};
	};
	
	//reproduce un acorde web-midi / web-audio con las notas pasadas en el id de la celda
	function reproduceAcorde(objThis){
		
		var notasPart = objThis.id.split('-');
		playbackService.playChordFromNames(notasPart, {
			bassOctaveOffset: -12,
			duration: 0.75
		});
	};
	
	 
	//MAIN
	//inicializamos los inputs del front-end (select desplegables con tónicas y escalas disponibles)
	llenaSelectHashTable($('#tonica'), notas, false);
	llenaSelectHashTable($('#escala'), escalas, false);
	
	//evento principal, click de obtener información
	$('#btnEscala').click(function(event) {
		
		generaInformacion();
		
		//console.log( event );
	}); //fin onclick
	
	//evento de cambios de tonica y escala
	$('#interface select').change(function () {
		//si el usuario ha pulsado al menos una vez el botón, los siguientes cambios de vista
		//son automáticos.
		if(CodaUi.hasRenderedResults($)){
			generaInformacion();
		  };
	});
	
	//evento de cambios de formato entre bemoles y sostenidos con los input radio
	$('#interface input:radio[name="formato"]').change(function () {
		  //var selectedVal = $("#interface input:radio:checked").val();
		  //console.log(selectedVal);
		  
		  if($(this).val()=='0')
		  {
			  //sostenidos
			  llenaSelectHashTable($('#tonica'), notas, false);
		  }else
		  {
			  //bemoles
		  	  llenaSelectHashTable($('#tonica'), notas, true);
		  };
		  
		  //además de rellenar de nuevo los selects, actualizamos los resultados al completo
		  //en caso de que ya se haya generado alguna información
		   if(CodaUi.hasRenderedResults($)){
			generaInformacion();
		  };
		  
	}); 
	
	//evento de cambio de vista instrumento con los input radio
	$('#interface input:radio[name="instrumento"]').change(function () {
		//simplemente actualizamos el instrumento, no hay que hacer nada más
		if(CodaUi.hasRenderedResults($)){
			creaInterfazInstrumento(true);
		};
	});
	
	//evento de click en una escala + tonalidad añadida dinámicamente
	//por ejemplo, en los enlaces de las escalas relativas y paralelas
	//rehace de nuevo la información de la página atendiendo al valor clickado
	$(document).on('click', '.revamp', function(event) {

		var revampElegido = event.target.id;
		//cambiamos el valor de los selects
		
		var opcionElegida = revampElegido.split('_');
		if(opcionElegida[1].indexOf('m') > -1){
			//cambiamos a la tonalidad menor (natural)
			$('select#escala').val('2');
		}else{
			//cambiamos a la tonalidad mayor
			$('select#escala').val('0');
		};
		
		//buscamos en el select de notas el valor de la opcionElegida
		
		//si la elección contiene bemoles o sostenidos, cambiamos a la vista apropiada
		if(opcionElegida[0].indexOf('#') > 0){
			$('#interface input:radio[name="formato"][value="0"]').prop('checked', true);
			llenaSelectHashTable($('#tonica'), notas, false);//actualizamos el select con sostenidos
		};
		if(opcionElegida[0].indexOf('b') > 0){
			$('#interface input:radio[name="formato"][value="1"]').prop('checked', true);
			llenaSelectHashTable($('#tonica'), notas, true);//actualizamos el select con bemoles
		};
		
		//finalmente estamos preparados para buscar y cambiar a selected la nueva nota tónica
		$('select#tonica option').each(function(){
			if (this.text == opcionElegida[0]) {
				$(this).prop('selected', true);
				return false;
			};
		});
		
		
		generaInformacion();
	});
	

	
	//evento de change en el select de afinaciones
	$(document).on('change', '#selectorAfinaciones', function(event) {
		
		//cambiamos la afinación elegida y volvemos a crear el diapasón
		
		numeroAfinacionElegida = Number($(this).val());
		if(numeroAfinacionElegida >= 0){
			creaInterfazInstrumento(false);
		};
	});
	

	
	//método ESENCIAL que genera la vista de resultados según lo elegido
	//este método es invocado cada vez que el usuario cambia opciones de la interfaz
	//(es decir, desata eventos como el click del botón, o el cambio entre inputs radio)
	function generaInformacion()
	{
		informeEscalaActual = null;
		var selection = CodaUi.readSelection($);

		if(selection.scaleName!='------------')
		{
			informeEscalaActual = CodaApplication.buildScaleReport({
				data: data,
				domain: CodaDomain,
				preferFlats: selection.preferFlats,
				scaleIndex: selection.scaleIndex,
				scaleName: selection.scaleName,
				tonicIndex: selection.tonicIndex,
				tonicName: selection.tonicName
			});

			CodaUi.renderScaleReport({
				$: $,
				data: data,
				domain: CodaDomain,
				onChordClick: reproduceAcorde,
				onChordMouseOut: limpiaColorAcordes,
				onChordMouseOver: coloreaAcordeElegido,
				renderers: CodaRenderers,
				report: informeEscalaActual,
				selection: selection
			});

			creaInterfazInstrumento(true);
		};
	};
	
	//método que genera el gestor de instrumento según lo elegido
	//este método es invocado cada vez que se refresca la vista completa de resultados
	//(click del botón información y cambio entre inputs radio)
	function creaInterfazInstrumento(resetTuning)
	{
		var selection = CodaUi.readSelection($);

		if(resetTuning && selection.instrument === '0'){
			numeroAfinacionElegida = 0;
		};

		var instrumentView = CodaApplication.buildInstrumentView({
			data: data,
			domain: CodaDomain,
			instrument: selection.instrument,
			octaveCount: 2,
			preferFlats: selection.preferFlats,
			report: informeEscalaActual,
			tuningIndex: numeroAfinacionElegida
		});

		CodaUi.renderInstrument({
			$: $,
			data: data,
			instrumentView: instrumentView,
			renderers: CodaRenderers,
			report: informeEscalaActual
		});
	};
	
	//FIN MAIN
	
	
	//CARGA DE WEB MIDI Y WEB AUDIO
	playbackService.load();
	
	
	
	
	
});// fin document ready
