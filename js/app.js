//****************************
//Javier Arce 2013-2021
//Esta obra está bajo licencia Creative Commons by-sa 4.0 International, Reconocimiento-Compartir igual
//https://creativecommons.org/licenses/by-sa/4.0/
//****************************

$( document ).ready(function() {
	
	//VARIABLES DE ÁMBITO LOCAL, GENERADAS UNA VEZ EL DOM ESTÉ PREPARADO
	var escalaElegida;
	var nombreTonicaElegida;
	var nombreEscalaElegida;
	var modalidadGeneralElegida; //En el caso de las escalas tonificables, guarda una M o una m.
	var circuloQuintasElegido; //array Asociativo (hashtable). No confundir con el array global circuloQuintas
	
	//variable local para recoger cambios en diapasón y piano (evento on change)
	var notasEscalaElegidaGlobal;
	
	var numeroAfinacionElegida;
	var afinacionElegida;
	var cuerdas; //array Asociativo (hashtable)

	var data = CodaData;
	var numeroNotasEscalaDiatonica = data.constants.octaveSemitones;
	var delay = data.midi.delay;
	var velocity = data.midi.velocity;
	var channel = data.midi.channel;
	var Cinicial = data.midi.initialMidiNote;
	var notas = data.notes;
	var intervalos = data.intervals;
	var escalas = data.scales;
	var acordes = data.chords;
	var afinaciones = data.tunings;
	var circuloQuintas = data.circleOfFifths;

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
	 
	//método que rellena la hashtable notasEscalaElegida con las columnas:
	//nombre, semitonos, nombreGrado y grado
	//según la elección del usuario	en el front-end
	function obtenEscala(tonicaElegida, numeroEscalaElegida, arrayEscala)
	{
		escalaElegida = escalas[numeroEscalaElegida];

		var notasCalculadas = CodaDomain.buildScale({
			tonicIndex: tonicaElegida,
			scaleDefinition: escalaElegida,
			notes: notas,
			intervals: intervalos,
			octaveSemitones: numeroNotasEscalaDiatonica,
			preferFlats: $("#interface input:radio:checked").val()==1
		});

		Array.prototype.push.apply(arrayEscala, notasCalculadas);

	};
	
	//método que rellena la hashtable acordesEscalaElegida con las columnas:
	//nombre, fundamental, tercera, quinta y septima
	//según el hashTable notasEscalaElegida
	function obtenAcordesEscala(arrayNotas, arrayAcordes)
	{
		var acordesCalculados = CodaDomain.buildScaleChords({
			scaleNotes: arrayNotas,
			scaleDefinition: escalaElegida,
			chordDefinitions: acordes,
			octaveSemitones: numeroNotasEscalaDiatonica,
			isDegreeSuppressed: compruebaSiGradoEstaSuprimido
		});

		Array.prototype.push.apply(arrayAcordes, acordesCalculados);
		
	};
	
	//método que rellena el hashtable multidimensional cuerdas con las columnas:
	//aire, trastes(nombre, perteneceAEscala), perteneceAEscala
	//según indique la afinacion elegida (de momento sólo afinación estándar)
	function obtenDiapason(arrayNotas)
	{
		afinacionElegida = afinaciones[numeroAfinacionElegida];
		var cuerdasAlAire;
		
		//si están seleccionados sostenidos, cojemos la afinación pero enarmónica
		if($("#interface input:radio:checked").val()==0){
			cuerdasAlAire = afinacionElegida['enarmonica'].split('-');
		}else{
			cuerdasAlAire = afinacionElegida['patron'].split('-');
		};
		
		for(var i=cuerdasAlAire.length-1;i>=0;i--)
		{	
			
			//para cada nota añadida al aire, comprobamos si está en la escala elegida, para marcarla
			var perteneceEscala = false;
			var tipoModal = '';
			for(var key in arrayNotas)
			{
				if(arrayNotas[key]['nombre']==cuerdasAlAire[i])
				{
					if(!compruebaSiGradoEstaSuprimido(key))
					{
						perteneceEscala = true;
						if(escalaElegida['modal'] && arrayNotas[key]['tipo'] != '')	tipoModal = arrayNotas[key]['tipo'];
						break;
					};
				};
					 
			};
			
			if(escalaElegida['modal']){
				cuerdas.push({'aire' : cuerdasAlAire[i], 'trastes' : new Array(), 'perteneceEscala' : perteneceEscala, 'tipo' : tipoModal});	
			}else{
				cuerdas.push({'aire' : cuerdasAlAire[i], 'trastes' : new Array(), 'perteneceEscala' : perteneceEscala});	
			};
			
			
		};
		
		for(var j=0;j<cuerdas.length;j++)
		{	
		
			//sacamos la posición inicial desde donde se empiezan a almacenar las notas de cada cuerda
			var posicionInicial = 0;
			for(var key in notas)
			{
				if(notas[key]['nombre']==cuerdas[j]['aire']){
					posicionInicial = parseInt(key);
				}else{
				
					if(notas[key]['enarmonica']==cuerdas[j]['aire']){
						posicionInicial = parseInt(key);
					};
				
				};
					 
			};
			
			//a partir de esa posición, vamos añadiendo notas a los trastes
			var posicionActual = posicionInicial;
			for(var k=0;k<numeroTrastes;k++)
			{
				if(posicionActual <notas.length - 1)
				{
					posicionActual += 1;
				}else{
					posicionActual = 0;
				};
				
				
				var nombre = notas[posicionActual]['nombre'];
				if($("#interface input:radio:checked").val()==1){
						if (notas[posicionActual]['enarmonica'] != undefined){ nombre= notas[posicionActual]['enarmonica'];} 
				};
				
				//para cada nota añadida al diapasón, comprobamos si está en la escala elegida, para marcarla
				var perteneceEscala = false;
				var tipoModal = '';
				for(var key in arrayNotas)
				{
					if(arrayNotas[key]['nombre']==nombre)
					{
						if(!compruebaSiGradoEstaSuprimido(key))
						{
							perteneceEscala = true;
							if(escalaElegida['modal'] && arrayNotas[key]['tipo'] != '')	tipoModal = arrayNotas[key]['tipo'];
							break;
						};
					};
						 
				};
				
				
				if(escalaElegida['modal']){
					cuerdas[j]['trastes'].push({'nombre' : nombre, 'perteneceEscala' : perteneceEscala, 'tipo' : tipoModal});	
				}else{
					cuerdas[j]['trastes'].push({'nombre' : nombre, 'perteneceEscala' : perteneceEscala});	
				};
				
			};
		};
		
	};
	
	//método que rellena el hashtable circuloQuintasElegido
    //sólo válido para las escalas tonales
	function obtenCirculoQuintasElegido()
	{

		var posicionModalidad = $('select#escala option:selected').val(); //necesario para saber qué escalas son tonales
		
		if(posicionModalidad > -1 && posicionModalidad < 7){
			//estamos visualizando una tonalidad, por tanto, llenamos el círculo de quintas respectivo
			
			
			var escala = $('select#tonica option:selected').text();
			var modalidad = $('select#escala option:selected').text();
			
			var modalidadAbreviada = "";
			if (modalidad.indexOf("Menor")>= 0){
				modalidadAbreviada = "m";
			};
			
			var tonalidadAbreviada = escala + modalidadAbreviada;
			
			//conociendo ya la nomenclatura de la tonalidad a mostrar, 
			//buscamos su posición en el arreglo general circuloQuintas
			var columnaEncontrada;
			var filaEncontrada;
			for(var i=0; i<circuloQuintas.length; i++)
			{
				if (circuloQuintas[i]['nombre']==tonalidadAbreviada){
					columnaEncontrada = 'nombre';
					filaEncontrada = i;
					break;
					
				}else if(circuloQuintas[i]['aka'] != null){
						if(circuloQuintas[i]['aka']==tonalidadAbreviada){
						columnaEncontrada = 'aka';
						filaEncontrada = i;
						break;
						};
				}else if(circuloQuintas[i]['enarmonica']==tonalidadAbreviada)
				{
					columnaEncontrada = 'enarmonica';
					filaEncontrada = i;
					break;
				};
			};
			//alert(filaEncontrada + ' ' + columnaEncontrada);
			
			//llenamos el arreglo circuloQuintasElegido a partir de 
			for(var i=0; i<12; i++)
			{
			
				if (i + filaEncontrada < 12){
					circuloQuintasElegido.push(circuloQuintas[i + filaEncontrada]);
				}else{
					circuloQuintasElegido.push(circuloQuintas[i + filaEncontrada - 12]);
				};
			};
			
		};
		
		
	};
	
	//función de output html que devuelve el nombre de Tónica + Escala según la elección del usuario
	function generaTituloEscala(){
		nombreTonicaElegida = $('select#tonica option:selected').text();
		nombreEscalaElegida = $('select#escala option:selected').text();

		return CodaRenderers.scaleSummary.renderTitle({
			scaleName: nombreEscalaElegida,
			tonicName: nombreTonicaElegida
		});
	};
	
	//función de output html que devuelve una lista de los grados de la escala
	function generaListaEscala(arrayNotas){
		return CodaRenderers.scaleSummary.renderList({
			circleOfFifths: circuloQuintas,
			isDegreeSuppressed: compruebaSiGradoEstaSuprimido,
			scaleDefinition: escalaElegida,
			scaleNotes: arrayNotas,
			selectedScaleIndex: $('select#escala option:selected').val(),
			tonicName: $('select#tonica option:selected').text()
		});
	};
	
	//función de output html que devuelve una tabla con los acordes que se forma en cada grado de la escala
	function generaTablaAcordes(arrayNotas, arrayAcordes, arrayAcordesParalelos){
		return CodaRenderers.scaleChords.render({
			mode: modalidadGeneralElegida,
			parallelScaleChords: arrayAcordesParalelos,
			scaleChords: arrayAcordes,
			scaleDefinition: escalaElegida,
			scaleNotes: arrayNotas
		});
	};
	
	//función de output html que devuelve una tabla con el diapasón completo
	//marcando con una cssclass específica las notas que sí pertenecen a la escala elegida. 
	function generaTablaDiapason(){
		
		var html ='<h4>Afinación: ' + afinacionElegida['nombre'] + '&nbsp;';
		
		//selector de afinaciones
		html += '<select id="selectorAfinaciones"><option value="-1">Cambiar&nbsp;</option>';
		
		for(var i=0; i<afinaciones.length; i++)
		{
			
			if (afinaciones[i]['nombre'] != afinacionElegida['nombre'])
			{
				html += '<option value="' + i + '">' + afinaciones[i]['nombre'] + '</option>';
			};
			
		};
		
		
		html += '</select>';
		
		html += '</h4>';
		
		html += '<table class="diapason"><tbody>';
		
		for(var i=0;i<cuerdas.length;i++)
		{
			html+='<tr>';	
			
			//cuerdas al aire
			//determinamos la css class de la celda
			var cssClassCeldaAire = ' noPerteneceEscala';
			if(cuerdas[i]['perteneceEscala'])	cssClassCeldaAire = ' perteneceEscala';
			
			var cssModal = ''
			if(escalaElegida['modal'] == 'true' && cuerdas[i]['tipo'] != ''){
				cssModal = ' class="' + cuerdas[i]['tipo'] + '"';
			};
			
			html+='<td class="celdaNota' + cssClassCeldaAire + '"><span' + cssModal + '>' + cuerdas[i]['aire'] + '</span></td>';
			
			//trastes
			for(var j=0;j<cuerdas[i]['trastes'].length;j++)
			{
				//determinamos la css class de la celda
				var cssClassCelda = ' noPerteneceEscala';
				if(cuerdas[i]['trastes'][j]['perteneceEscala'])
				{
					cssClassCelda = ' perteneceEscala';
				};
				
				var cssModal = ''
				if(escalaElegida['modal'] == 'true' && cuerdas[i]['trastes'][j]['tipo'] != ''){
					cssModal = ' class="' + cuerdas[i]['trastes'][j]['tipo'] + '"';
				};
				
				html+='<td class="celdaNota ' + cssClassCelda + '"><span' + cssModal + '>' + cuerdas[i]['trastes'][j]['nombre'] + '</span></td>';
				
			};
			
			html+='</tr>';
		};
		
		html+='</tbody>';
		
		//añadimos fila de numeración
		html+='<tfoot><tr>';
		for(var k = 0;k<cuerdas[0]['trastes'].length + 1;k++)
		{
			html+='<td><span>' + k + '</span></td>';
		};
		
		
		html+='</tr></tfoot>';
		
		html+='</table>';
		
		return html;
			
	};
	
	//función de output html que devuelve una tabla con dos octavas de piano
	//marcando con una cssclass específica las notas que sí pertenecen a la escala elegida. 
	function generaTablaPiano(arrayNotas)
	{
		var numOctavas = 2;
	
		var html = '<h4>Vista de piano</h4>';
		html += '<div class="teclado">';
		
		html += '<table class="teclasNegras">';
		html += '<tbody>';
		html += '<tr>';
		
		for(var i=0;i<numOctavas;i++)
		{
			
			for(var j=0;j<notas.length;j++)
			{
				var nombreNota = '';
				nombreNota = notas[j]['nombre'];
				
				//comprobamos si la nota renderizada en el piano pertenece a la escala seleccionada o no, para marcarla.
				var perteneceEscala = false;
				var tipoModal = '';
				for(var key in arrayNotas)
				{
					if(arrayNotas[key]['nombre']==notas[j]['nombre'])
					{
						if(!compruebaSiGradoEstaSuprimido(key))
						{
							perteneceEscala = true;
							if(escalaElegida['modal'] && arrayNotas[key]['tipo'] != '')	tipoModal = arrayNotas[key]['tipo'];
							break;
						}
					}else if(notas[j]['enarmonica']!=null){
						if(arrayNotas[key]['nombre']==notas[j]['enarmonica']){
							if(!compruebaSiGradoEstaSuprimido(key))
							{
								perteneceEscala = true;
								if(escalaElegida['modal'] && arrayNotas[key]['tipo'] != '')	tipoModal = arrayNotas[key]['tipo'];
								break;
							};
						};
					};
				};
				
				var cssClassPerteneceEscala = '';
				var cssModal = '';
				if (perteneceEscala){cssClassPerteneceEscala=' perteneceEscala';}
				else{cssClassPerteneceEscala=' noPerteneceEscala';}
				
				if(tipoModal!=''){cssModal = ' class="' + tipoModal + '"';}
				
				if(notas[j]['enarmonica'] != null){
					
					if($("#interface input:radio:checked").val()==1)
					{
					//si se ha pulsado bemoles, cargamos las notas correspondientes en el caso de las alteraciones
					
						nombreNota = notas[j]['enarmonica'];
						
					}
					
					html+='<td class="celdaNota' + cssClassPerteneceEscala + '"><span' + cssModal + '>' + nombreNota + '</span></td>';
					
				}else{
					nombreNota = '&nbsp;&nbsp;'; //dejamos vacías las celdas donde no hay teclas negras
					html+='<td class="huecoBlanco hueco' + notas[j]['nombre'] + '"><span>' + nombreNota + '</span></td>';
				};
				
				
			};
		
		};
		
		html+='</tr>';
		html+='</table>';
		
		html += '<table class="teclasBlancas">';
		html += '<tbody>';
		html += '<tr>';
		
		for(var i=0;i<numOctavas;i++)
		{
			
			for(var j=0;j<notas.length;j++)
			{
				
				if(notas[j]['enarmonica'] == null){
					var nombreNota = '';
					nombreNota = notas[j]['nombre'];
					
					
					//comprobamos si la nota renderizada en el piano pertenece a la escala seleccionada o no, para marcarla.
					var perteneceEscala = false;
					var tipoModal = '';
					for(var key in arrayNotas)
					{
						if(arrayNotas[key]['nombre']==notas[j]['nombre'])
						{
							if(!compruebaSiGradoEstaSuprimido(key))
							{
								perteneceEscala = true;
								if(escalaElegida['modal'] && arrayNotas[key]['tipo'] != '')	tipoModal = arrayNotas[key]['tipo'];
								break;
							}; //en este caso no  miramos enarmonías, porque son notas naturales, sin alteraciones
						};
					};
					var cssClassPerteneceEscala = '';
					var cssModal = '';
					if (perteneceEscala){cssClassPerteneceEscala=' perteneceEscala';}
					else{cssClassPerteneceEscala=' noPerteneceEscala';}
					
					if(tipoModal!=''){cssModal = ' class="' + tipoModal + '"';}
					
					html+='<td class="celdaNota ' + cssClassPerteneceEscala + '"><span' + cssModal + '>' + nombreNota + '</span></td>';
				};
				
				
				
			};
		
		};
		
		html+='</tr>';
		html+='</table>';
		
		
		html+='</div>';
		
		return html;
	};
	
	//función de output html que devuelve una tabla para simular un círculo de quintas contenido en circuloQuintas, siempre que hayamos elegido una escala tonificable.
	function generaCirculoQuintas()
	{

		
		if(escalaElegida['tonal']!= null){
		
			//encontramos la posición de la escala elegida.
			var abreviaturaEscalaElegida = '';
			if($('select#escala option:selected').val() == '0'){ //si es mayor
				abreviaturaEscalaElegida = $('select#tonica option:selected').text();
				
				//problema con F# Mayor ya que es la última posición enarmónica del hashtable circuloQuintas (entrada nº 13), y ésta es despreciada
				if($('select#tonica option:selected').text() == 'F#'){
					abreviaturaEscalaElegida = 'Gb';
				};
				
			}else{ //si no es mayor, por fuerza el resto de escalas "tonales" son menores
				abreviaturaEscalaElegida = $('select#tonica option:selected').text() + 'm';
				
				//problema con A#m (ya que en circuloQuintas está "Db", "aka" : "C#", "enarmonica" : "Bbm" y no aparece nunca A#m)
				if($('select#tonica option:selected').text() == 'A#'){
					abreviaturaEscalaElegida = 'Bbm';
				};
				
				
				
			};
			
			
			//recorremos el círculo de quintas hasta encontrar la posición de la escala elegida.
			var posInicial = -1;
			var posFinal = -1;
			for(var i=0; i<=circuloQuintas.length - 1; i++){
			
				if((circuloQuintas[i]['nombre']== abreviaturaEscalaElegida) || circuloQuintas[i]['enarmonica']== abreviaturaEscalaElegida || circuloQuintas[i]['aka']== abreviaturaEscalaElegida){
					posInicial = i;
				};
				
			};
			
			//limpiamos la ultima posición enharmónica del array
			if (posInicial == 13)	posInicial = 6;
			var CirculoQuintasLimpio = circuloQuintas;
			if(CirculoQuintasLimpio.length==13)	CirculoQuintasLimpio.pop();
			
			if(posInicial > -1){

				/////////////////////////////////////////////////////////////////
		
				var circuloOrdenado = new Array();
				
				for(var i=0; i<12; i++){
					var posActual = -1;
					
					posActual = posInicial - i
					
					if(posActual <= -1)
					{
						posActual = posActual + CirculoQuintasLimpio.length;
					};
					
					circuloOrdenado.push(CirculoQuintasLimpio[posActual]);

				};
				
				//para cuadrar el circulo, ya que se pinta en sentido horario desde las 15:00, tenemos que hacer una pequeña ñapa: aumentar la posición inicial
			
				
				var theta = [];

				var setup = function(n, rx, ry, id) {
				  var contenedor = document.getElementById(id);
				  var mainHeight = parseInt(window.getComputedStyle(contenedor).height.slice(0, -2));
				  var vCirculo = [];
				  for (var i = 0; i < n; i++) {
					var circulo = document.createElement('div');
					circulo.className = 'circulo numero' + i;
					vCirculo.push(circulo);
					vCirculo[i].posx = Math.round(rx * (Math.cos(theta[i]))) + 'px';
					vCirculo[i].posy = Math.round(ry * (Math.sin(theta[i]))) + 'px';
					vCirculo[i].style.top = ((mainHeight / 2) - parseInt(vCirculo[i].posy.slice(0, -2))) + 'px';
					vCirculo[i].style.left = ((mainHeight / 2) + parseInt(vCirculo[i].posx.slice(0, -2))) + 'px';
					
					var classElegida = '';
					
					if(abreviaturaEscalaElegida == circuloOrdenado[i]['nombre'] || abreviaturaEscalaElegida == circuloOrdenado[i]['enarmonica'] || abreviaturaEscalaElegida == circuloOrdenado[i]['aka']){
						classElegida = ' class="actual"';
					};
					
					$(circulo).append('<p' + classElegida +'><span id="' + circuloOrdenado[i]['nombre'] + '_" class="revamp estiloEnlace">' + circuloOrdenado[i]['nombre'] +  '</span></p>');
					
					$(circulo).append('<p' + classElegida +'><span id="' + circuloOrdenado[i]['enarmonica'].replace('m','') + '_m" class="revamp estiloEnlace">' + circuloOrdenado[i]['enarmonica'] +  '</span></p>');
					
					
					contenedor.appendChild(vCirculo[i]);
				  };
				};

				var generaCirculo = function(n, rx, ry, id) {
				  var frags = 360 / n;
				  for (var i = 0; i <= n; i++) {
					theta.push((frags / 180) * i * Math.PI);
				  };
				  setup(n, rx, ry, id)
				};
				
				var circuloDesplegado = document.createElement('div');
				circuloDesplegado.id = 'circuloDesplegado';
				$('#circuloQuintas').append(circuloDesplegado);
				generaCirculo(12, 80, 80, 'circuloDesplegado');
				
				
				
				////////////////////////////////////////////////////////////////
				
			
			};
		
		};
		
	};
	
	//genera tablas con acordes derivados de las cuatriadas básicas (sus dominantes secundarias, etc.)
	function generaArmoniaExtendida(arrayNotas, arrayAcordes){
		modalidadGeneralElegida = $('select#escala option:selected').val() == '0' ? "M" : "m";

		return CodaRenderers.extendedHarmony.render({
			data: data,
			domain: CodaDomain,
			mode: modalidadGeneralElegida,
			preferFlats: $("#interface input:radio:checked").val()==1,
			scaleChords: arrayAcordes,
			scaleName: nombreEscalaElegida,
			scaleNotes: arrayNotas,
			tonicName: nombreTonicaElegida
		});
	};
	
	
	//MÉTODOS Y FUNCIONES DE UTILIDAD
	
	//función que comprueba que la escala elegida en notasEscalaElegida no tenga ningún grado suprimido
	//y devuelve un booleano true en caso afirmativo
	//se utiliza para impedir el cálculo de acordes en escalas no diatónicas
	function compruebaSiGradoEstaSuprimido(i){
		
			var gradoSuprimido = false;
			if('gradosEliminados' in escalaElegida){

				var gradosEliminados = escalaElegida['gradosEliminados'].split('-');
				for(var j=0;j<gradosEliminados.length;j++){
					if(notasEscalaElegida[i]['grado']==gradosEliminados[j]){
						gradoSuprimido = true;
						break;
					};
				};
			};
			return gradoSuprimido;	
	};
	
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
		if($('#notacion').children().length > 0 && $('#instrumento').children().length > 0 ){
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
		   if($('#notacion').children().length > 0 && $('#instrumento').children().length > 0 ){
			generaInformacion();
		  };
		  
	}); 
	
	//evento de cambio de vista instrumento con los input radio
	$('#interface input:radio[name="instrumento"]').change(function () {
		//simplemente actualizamos el instrumento, no hay que hacer nada más
		if($('#notacion').children().length > 0 && $('#instrumento').children().length > 0 ){
			creaInterfazInstrumento(notasEscalaElegidaGlobal);
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
		var radios = $('#interface input:radio[name="formato"]');
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
		
		numeroAfinacionElegida = $(this).val();
		afinacionElegida = afinaciones[$(this).val()];
		
		//alert('hola mundo ' + $(this).val());
		cuerdas = new Array();
		obtenDiapason(notasEscalaElegidaGlobal);
		$('#instrumento').empty().append(generaTablaDiapason());
	});
	

	
	//método ESENCIAL que genera la vista de resultados según lo elegido
	//este método es invocado cada vez que el usuario cambia opciones de la interfaz
	//(es decir, desata eventos como el click del botón, o el cambio entre inputs radio)
	function generaInformacion()
	{
		//inicializamos las variables
		var notasEscalaElegida = new Array();
		var acordesEscalaElegida = new Array();
		var notasEscalaParalela = new Array();
		var acordesEscalaParalela = new Array();
		escalaElegida = null;
		nombreTonicaElegida = null;
		nombreEscalaElegida = null;
		
		if($('select#escala option:selected').text()!='------------')
		{
			var tonicaElegida = parseInt($('select#tonica option:selected').val());
		    var numeroEscalaElegida = parseInt($('select#escala option:selected').val());
			
			obtenEscala(tonicaElegida, numeroEscalaElegida, notasEscalaElegida); //llena el arreglo hashtable notasEscalaElegida con las notas pertenecientes a la elección de los selects
			if(notasEscalaElegida.length==7){
				obtenAcordesEscala(notasEscalaElegida, acordesEscalaElegida);	//solo agregamos acordes a escalas heptatónicas
				
				//obtención de escala y acordes paralelos
				if(numeroEscalaElegida==0 ||numeroEscalaElegida ==2){
					var numeroEscalaParalela;
					if(numeroEscalaElegida == 0){
						//si ha elegido mayor, la paralela es la menor
						numeroEscalaParalela = 2;
					};
					if(numeroEscalaElegida==2){
						numeroEscalaParalela = 0;
					};
					obtenEscala(tonicaElegida, numeroEscalaParalela, notasEscalaParalela);
					obtenAcordesEscala(notasEscalaParalela, acordesEscalaParalela);
				};
				
			};
			
			notasEscalaElegidaGlobal = notasEscalaElegida //para eventos de on change
			

			//empezamos a mostrar por pantalla
			$('#notacion').empty().append(generaTituloEscala());
			$('#notacion').append(generaListaEscala(notasEscalaElegida));
			
			//vaciamos el panel de armonía extendida
			$( "#armoniaExtendida" ).empty();
			
			if(notasEscalaElegida.length==7){
				
				$('#notacion').append(generaTablaAcordes(notasEscalaElegida, acordesEscalaElegida, acordesEscalaParalela)); //solo agregamos acordes a escalas heptatónicas
				
				//si, además, es tonificable, agregamos armonía extendida
				if(escalaElegida['tonal']!= null && (numeroEscalaElegida==0 ||numeroEscalaElegida ==2)){
				
					$('#armoniaExtendida').empty().append(generaArmoniaExtendida(notasEscalaElegida, acordesEscalaElegida));
					
					//aprovechamos para crear el evento de jqueryui que permita hacer acordeon
					//sobre las tablas de armonía extendida
					$( "#acordeonArmoniaExtendida" ).accordion(
						{
						  heightStyle: "content"
						}
					);
					$( "#acordeonArmoniaExtendida" ).accordion( "option", "collapsible", true );
					
				
				};	
				
				//EVENTOS AGREGADOS EN TIEMPO DE EJECUCIÓN
				
				//agregamos evento de on hover para la celda de cada acorde.
				$('.celdaAcorde').mouseover(function(event) {
					coloreaAcordeElegido(this);
				});
				//y la limpieza de colores al salir
				$('.celdaAcorde').mouseout(function(event) {
					limpiaColorAcordes();
				});
				
				//agregamos evento click para la reproducción de acordes a dichas celdas.
				$('.celdaAcorde').click(function(event) {
					reproduceAcorde(this);
				});
				
			};
			

			creaInterfazInstrumento(notasEscalaElegida);
			
			$('#circuloQuintas').empty().append(generaCirculoQuintas());
		};
	};
	
	//método que genera el gestor de instrumento según lo elegido
	//este método es invocado cada vez que se refresca la vista completa de resultados
	//(click del botón información y cambio entre inputs radio)
	function creaInterfazInstrumento(notasEscalaElegida)
	{
		
		//según qué haya marcado el usuario, alternamos entre vista de instrumentos
		switch($('#interface input:radio[name="instrumento"]:checked').val()){
			case '0': //guitarra
			default:
				
				numeroAfinacionElegida = 0; //de momento, cuando tenga selector, habrá que recogerlo del DOM
				afinacionElegida = undefined;
				cuerdas = new Array();
				
				obtenDiapason(notasEscalaElegida); //llena el arreglo hashtable multidimensional cuerdas con los trastes de la guitarra
				$('#instrumento').empty().append(generaTablaDiapason());
				break;
			case '1': //piano
				$('#instrumento').empty().append(generaTablaPiano(notasEscalaElegida));
				break;
		};
		
	};
	
	//FIN MAIN
	
	
	//CARGA DE WEB MIDI Y WEB AUDIO
	playbackService.load();
	
	
	
	
	
});// fin document ready
