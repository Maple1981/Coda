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

		var patronEscalaElegida = escalaElegida['patron'];
		var intervalosEscalaElegida = patronEscalaElegida.split('-');
		
		
		
		var posicion = tonicaElegida;
		var sumaSemitonos = 0;
		
		//si la escala elegida es modal, marcamos ya las notas principales y secundarias del modo.
		var notaPrincipal = 0;
		var notaSecundaria = 0;
		if(escalaElegida['modal'] == 'true'){
					var notasCaracteristicasPart = escalaElegida['caracteristicas'].split('-');
					var notaPrincipal = parseInt(notasCaracteristicasPart[0]);
					var notaSecundaria = parseInt(notasCaracteristicasPart[1]);
		};
		
		for(var i=0; i<intervalosEscalaElegida.length; i++)
		{
			
			posicion += parseInt(intervalosEscalaElegida[i]);
			if (posicion >=numeroNotasEscalaDiatonica){
				posicion = posicion - numeroNotasEscalaDiatonica;
			};
			
			sumaSemitonos += parseInt(intervalosEscalaElegida[i]);
			
			var nombreGrado = "";
			var grado = "";
			var enarmonica = "";
			for(var j=0;j<intervalos.length;j++)
			{
				if(parseInt(sumaSemitonos)==parseInt(intervalos[j]['semitonos']))
				{
					nombreGrado = intervalos[j]['nombre'];
					grado = intervalos[j]['grado'];
					break;
				};
			};
			
			var nombre = notas[posicion]['nombre'];
			if($("#interface input:radio:checked").val()==1){
					if (notas[posicion]['enarmonica'] != undefined){ nombre= notas[posicion]['enarmonica'];} 
			};
			
			
			if(escalaElegida['modal'] == 'true' && notaPrincipal > 0 && notaSecundaria > 0){	
					var tipoDeLaActual;
					if(i+1==notaPrincipal){
						tipoDeLaActual = "principal";
					}else if(i+1==notaSecundaria){
						tipoDeLaActual = "secundaria";
					}else{
						tipoDeLaActual = null;	
					};
					
					arrayEscala.push({"nombre" : nombre, "semitonos" : sumaSemitonos, "nombreGrado" : nombreGrado, "grado" : grado, "tipo" : tipoDeLaActual});
					
			}else{
				arrayEscala.push({"nombre" : nombre, "semitonos" : sumaSemitonos, "nombreGrado" : nombreGrado, "grado" : grado});	
			};
			
			
		};

	};
	
	//método que rellena la hashtable acordesEscalaElegida con las columnas:
	//nombre, fundamental, tercera, quinta y septima
	//según el hashTable notasEscalaElegida
	function obtenAcordesEscala(arrayNotas, arrayAcordes)
	{
		//distancias de heptatónicas
		//los acordes se forman por superposición de terceras (2 tonos) desde la fundamental
		
		var superposicionTerceras = 2;
		var stepsHastaTercera = superposicionTerceras;
		var stepsHastaQuinta = superposicionTerceras * 2;
		var stepsHastaSeptima = superposicionTerceras * 3;
		
		//para los acordes suspendidos obtenemos sus segundas(sus2) y sus cuartas (sus4)
		var stepsHastaSegunda = 1; //un tono
		var stepsHastaCuarta = 3; //tres tonos

		for(var i=0; i<arrayNotas.length; i++)
		{
		//acordes de la escala
			
			if(!compruebaSiGradoEstaSuprimido(i)){
				
				var acordeEncontrado;
				var intervalosEncontrados;
				var terceraEncontrada;
				var quintaEncontrada;
				var septimaEncontrada;
				
				var segundaEncontrada;
				var cuartaEncontrada;
				
				var primerIntervalo;
				var segundoIntervalo;
				var tercerIntervalo;
				
				var sus2Intervalo;
				var sus4Intervalo;
				
				//para cada nota fundamental, buscamos su tercera, quinta y séptima, y obtenemos su cuatriada
				if(i<arrayNotas.length - stepsHastaTercera){
					terceraEncontrada = arrayNotas[i + stepsHastaTercera];
					primerIntervalo = parseInt(terceraEncontrada['semitonos']) - parseInt(arrayNotas[i]['semitonos']);
				}else{
					terceraEncontrada = arrayNotas[stepsHastaTercera - (arrayNotas.length - i)];
					primerIntervalo = (numeroNotasEscalaDiatonica - parseInt(arrayNotas[i]['semitonos'])) + parseInt(terceraEncontrada['semitonos']);	
				};
				
				if(i<(arrayNotas.length - stepsHastaQuinta)){
					quintaEncontrada = arrayNotas[i + stepsHastaQuinta];
					segundoIntervalo = parseInt(quintaEncontrada['semitonos']) - parseInt(arrayNotas[i]['semitonos']);
				}else{
					quintaEncontrada = arrayNotas[stepsHastaQuinta - (arrayNotas.length - i)];
					segundoIntervalo = (numeroNotasEscalaDiatonica - parseInt(arrayNotas[i]['semitonos'])) + parseInt(quintaEncontrada['semitonos']);	
				};
				
				if(i<(arrayNotas.length - stepsHastaSeptima)){
					septimaEncontrada = arrayNotas[i + stepsHastaSeptima];
					tercerIntervalo = parseInt(septimaEncontrada['semitonos']) - parseInt(arrayNotas[i]['semitonos']);
				}else{
					septimaEncontrada = arrayNotas[stepsHastaSeptima - (arrayNotas.length - i)];
					tercerIntervalo = (numeroNotasEscalaDiatonica - parseInt(arrayNotas[i]['semitonos'])) + parseInt(septimaEncontrada['semitonos']);	
				};

				intervalosEncontrados = '1-' + primerIntervalo + '-' + segundoIntervalo + '-' + tercerIntervalo;
				
				
			    //hacemos lo propio con los sus
				//no rellenamos los intervalosEncontrados porque son acordes accesorios que obtendremos en la representación
				if(i<(arrayNotas.length - stepsHastaSegunda)){
					segundaEncontrada = arrayNotas[i + stepsHastaSegunda];
				}else{
					segundaEncontrada = arrayNotas[stepsHastaSegunda - (arrayNotas.length - i)];
				};
				if(i<(arrayNotas.length - stepsHastaCuarta)){
					cuartaEncontrada = arrayNotas[i + stepsHastaCuarta];
				}else{
					cuartaEncontrada = arrayNotas[stepsHastaCuarta - (arrayNotas.length - i)];
				};
				
				//sabiendo el patrón, buscamos el acorde
				var tipoAcorde = "";
				for(var j=0;j<acordes.length;j++){
					
					if(acordes[j]['patron'] == intervalosEncontrados){
							tipoAcorde = acordes[j]['abreviatura'];
							break;
					};
					
				};
				
				//si la escala es modal, marcamos el acorde a evitar y los principales 
				if(escalaElegida['modal'] == "true"){
					var tipoAcordeModal = '';
					
					if((arrayNotas[i]['tipo'] == 'principal' || arrayNotas[i]['tipo'] == 'secundaria') && ((terceraEncontrada['tipo'] == 'principal' || terceraEncontrada['tipo'] == 'secundaria') || (quintaEncontrada['tipo'] == 'principal' || quintaEncontrada['tipo'] == 'secundaria') || (septimaEncontrada['tipo'] == 'principal' || septimaEncontrada['tipo'] == 'secundaria'))){
						//si la fundamental es principal o secundaria, y además la tercera, la quinta o la séptima también lo son
						//(el acorde contiene ambas notas-tritono-, y una está en su fundamental)
						tipoAcordeModal = 'evitar';
					}else if(arrayNotas[i]['tipo'] == 'principal' || terceraEncontrada['tipo'] == 'principal' || quintaEncontrada['tipo'] == 'principal' || septimaEncontrada['tipo'] == 'principal'){
						//si el acorde no es el anterior pero contiene la nota principal en cualquiera de sus posiciones
						tipoAcordeModal = 'cadencial';
					}else{
						tipoAcordeModal = '';
					};
					
					arrayAcordes.push({"nombre" : arrayNotas[i]['nombre'] + tipoAcorde, "fundamental" : arrayNotas[i]['nombre'], "segunda" : segundaEncontrada['nombre'], "tercera" : terceraEncontrada['nombre'], "cuarta" : cuartaEncontrada['nombre'], "quinta" : quintaEncontrada['nombre'], "septima" : septimaEncontrada['nombre'], "tipo" : tipoAcordeModal});
					
					
				}else{ //si la escala es tonal
					arrayAcordes.push({"nombre" : arrayNotas[i]['nombre'] + tipoAcorde, "fundamental" : arrayNotas[i]['nombre'], "segunda" : segundaEncontrada['nombre'], "tercera" : terceraEncontrada['nombre'], "cuarta" : cuartaEncontrada['nombre'], "quinta" : quintaEncontrada['nombre'], "septima" : septimaEncontrada['nombre']});
					
				};
				
				
		
			};//fin if grado suprimido
		};//for i
		
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
		var html = '';
		
		nombreTonicaElegida = $('select#tonica option:selected').text();
		nombreEscalaElegida = $('select#escala option:selected').text();
		
		html += '<h3>' + nombreTonicaElegida + " " + nombreEscalaElegida + '</h3>';	
		
		return html;
	};
	
	//función de output html que devuelve una lista de los grados de la escala
	function generaListaEscala(arrayNotas){
		
		var html = '';
		
		//si se puede, añadimos información de la escala (relativa, paralela)
		if(escalaElegida['tonal']!= null){
			
			//Relativa: buscamos en el circulo de quintas
			var enarmCirculo = '';
			var abreviaturaEscalaElegida = '';
			if($('select#escala option:selected').val() == '0'){
				abreviaturaEscalaElegida = $('select#tonica option:selected').text();
				
				for(var i=0; i<circuloQuintas.length; i++)
				{
					if(circuloQuintas[i]['nombre']==abreviaturaEscalaElegida){
						enarmCirculo = circuloQuintas[i]['enarmonica'];
						break;
					}else if(circuloQuintas[i]['aka'] != null){
						if(circuloQuintas[i]['aka']==abreviaturaEscalaElegida){
							enarmCirculo = circuloQuintas[i]['enarmonica'];
							break;
						};
					};
					
				};
				
			}else{ //si no es mayor, por fuerza el resto de escalas "tonales" son menores
				abreviaturaEscalaElegida = $('select#tonica option:selected').text() + 'm';
				
				for(var i=0; i<circuloQuintas.length; i++)
				{
					if(circuloQuintas[i]['enarmonica']==abreviaturaEscalaElegida){
						enarmCirculo = circuloQuintas[i]['nombre'];
						break;
					}else if(circuloQuintas[i]['aka'] != null){
						if(circuloQuintas[i]['aka']==abreviaturaEscalaElegida){
							enarmCirculo = circuloQuintas[i]['nombre'];
							break;
						};
					};
					
				};
				
			};
			
			enarmCirculo = enarmCirculo.replace('m','_m'); //para controlar mejor los parametros pasados, es preferible preparar el posterior split
			
			html += '<p class="infoAdicional"><strong>Tonalidad relativa</strong>: <span id="' + enarmCirculo + '_" class="revamp estiloEnlace">' + enarmCirculo.replace('_m','m') + '</span>';
			
			//Paralela: más fácil todavía, comprobamos el modo de la tonalidad
			var modoTon = '',modoParalelo = '';
			if($('select#escala option:selected').val() == '0'){
				modoTon = 'mayor';
				modoParalelo = 'm';
			}else{
				modoTon = 'menor';
				modoParalelo = '';
			};
			
			html += '&nbsp;<strong>Tonalidad paralela</strong>: <span id="' + $('select#tonica option:selected').text() + '_' + modoParalelo + '" class="revamp estiloEnlace">' + $('select#tonica option:selected').text() + '' + modoParalelo + '</span></p>';
		};
		
		html += '<h4>Grados de la escala</h4>';
		//y creamos la escala en sí en formato lista
		html += '<ul class="notasEscala">';
		for(var i=0; i<arrayNotas.length; i++)
		{
			
			if(!compruebaSiGradoEstaSuprimido(i))
			{
				
				//si la escala es modal, marcamos las notas principales y secundarias
				var cssElementoLista = '';
				if(arrayNotas[i]['tipo'] != null){
					cssElementoLista = ' class="' + arrayNotas[i]['tipo'] + '"';	
				};
				
				html += '<li' + cssElementoLista + '>';
				
				var nombre = arrayNotas[i]['nombre'];
				html += nombre + '<sup>' + arrayNotas[i]['grado'] + '</sup>'; //otros datos del hash: semitonos, nombreGrado
				if(i<arrayNotas.length-1)	html += ' - ';
				html += '</li>';
			};

		};
		
		if(html.substring(html.length - 8, html.length) == ' - </li>')	html = html.substring(0,html.length-8) + '<li>';
		
		html += '</ul>';
		
		//leyenda de las escalas modales
		if(escalaElegida['modal']=='true'){
			html += '<div class="leyendaModal">';
			html += '<span class="principal">Nota principal</span> - ';
			html += '<span class="secundaria">Nota secundaria</span>';
			html += '</div>';
		};
		
		return html;
	};
	
	//función de output html que devuelve una tabla con los acordes que se forma en cada grado de la escala
	function generaTablaAcordes(arrayNotas, arrayAcordes, arrayAcordesParalelos){
	
		var html;
		
		if(arrayAcordes.length > 0){
		
			html = '<h4>Acordes de la tonalidad</h4>';
			html += '<table class="acordesEscala">';

			
			var filaGrados = '',
			filaNombreTriadas = '',
			filaNombreAcordes = '',
			filaNombreSus2 = '',
			filaNombreSus4 = '',
			filaNombreParalela = '',
			filaNombreParalelaTri = '',
			filaNotasAcordes = '',
			filaFuncionesArmonicas = '';
			
			for(var i=0; i<arrayAcordes.length; i++)
			{
			//acordes de la escala
			
				filaGrados += '<td>';
				
				filaGrados += transformaGradoSegunAcorde(arrayNotas[i]['grado'], arrayAcordes[i]['nombre']);
				filaGrados += '</td>';
			
			    filaNombreTriadas +=  '<td class="celdaAcorde" id="' + arrayAcordes[i]['fundamental'] + "-" + arrayAcordes[i]['tercera'] + "-" + arrayAcordes[i]['quinta'] + '">';
				filaNombreTriadas += arrayAcordes[i]['nombre'].replace('maj7', '').replace('m7♭5', 'dim').replace('m7', 'm').replace('7', '');
				filaNombreTriadas += '</td>';
				
				
				filaNombreAcordes += '<td class="celdaAcorde" id="' + arrayAcordes[i]['fundamental'] + "-" + arrayAcordes[i]['tercera'] + "-" + arrayAcordes[i]['quinta'] + "-" + arrayAcordes[i]['septima'] + '">';
				filaNombreAcordes += arrayAcordes[i]['nombre'];
				filaNombreAcordes += '</td>';
				
				//acordes suspendidos
				filaNombreSus2 +=  '<td class="celdaAcorde" id="' + arrayAcordes[i]['fundamental'] + "-" + arrayAcordes[i]['segunda'] + "-" + arrayAcordes[i]['quinta'] + '">';
				filaNombreSus2 += arrayAcordes[i]['nombre'].replace('maj7', 'sus2').replace('Maj7', 'sus2').replace('m7♭5', 'sus2').replace('dim7', 'sus2').replace('m7', 'sus2').replace('7', '');
				if(arrayAcordes[i]['nombre'].length==2) filaNombreSus2 += 'sus2';
				filaNombreSus2 += '</td>';
				filaNombreSus4 +=  '<td class="celdaAcorde" id="' + arrayAcordes[i]['fundamental'] + "-" + arrayAcordes[i]['cuarta'] + "-" + arrayAcordes[i]['quinta'] + '">';
				filaNombreSus4 += arrayAcordes[i]['nombre'].replace('maj7', 'sus4').replace('Maj7', 'sus4').replace('m7♭5', 'sus4').replace('dim7', 'sus2').replace('m7', 'sus4').replace('7', '');
				if(arrayAcordes[i]['nombre'].length==2) filaNombreSus4 += 'sus4';
				filaNombreSus4 += '</td>';
				
				//tonalidad paralela
				if (escalaElegida['funciones'] != null && arrayAcordesParalelos[i] != null){
					filaNombreParalela +=  '<td class="celdaAcorde" id="' + arrayAcordesParalelos[i]['fundamental'] + "-" + arrayAcordesParalelos[i]['tercera'] + "-" + arrayAcordesParalelos[i]['quinta'] + "-" + arrayAcordesParalelos[i]['septima'] +  '">';
					filaNombreParalela += arrayAcordesParalelos[i]['nombre'];
					filaNombreParalela += '</td>';
					
					filaNombreParalelaTri +=  '<td class="celdaAcorde" id="' + arrayAcordesParalelos[i]['fundamental'] + "-" + arrayAcordesParalelos[i]['tercera'] + "-" + arrayAcordesParalelos[i]['quinta'] + '">';
					filaNombreParalelaTri += arrayAcordesParalelos[i]['nombre'].replace('maj7', '').replace('m7♭5', 'dim').replace('m7', 'm').replace('7', '');
					filaNombreParalelaTri += '</td>';
					
				};
				
				//notas del grado
				filaNotasAcordes += '<td class="par">';
				
				if(escalaElegida['modal'] == 'true' && arrayAcordes[i]['tipo'] != ''){
					filaNotasAcordes += '<span class="' + arrayAcordes[i]['tipo'] + '">';	
				};
				
				filaNotasAcordes += arrayAcordes[i]['fundamental'] + "-" + arrayAcordes[i]['tercera'] + "-" + arrayAcordes[i]['quinta'] + "-" + arrayAcordes[i]['septima'];
				
				if(escalaElegida['modal'] == 'true' && arrayAcordes[i]['tipo'] != null){
					filaNotasAcordes += '</span>';	
				};
				
				filaNotasAcordes += '</td>';

				if (escalaElegida['funciones'] != null){
					filaFuncionesArmonicas += '<td>';
					var splitFuncionesEscalaElegida  = escalaElegida['funciones'].split('-');
					filaFuncionesArmonicas += splitFuncionesEscalaElegida[i];
					filaFuncionesArmonicas += '</td>';
				};

			};
			
			html +='<thead><tr><td>Grados</td>' + filaGrados + '</tr></thead><tbody><tr><td class="cabecera">Triada</td>' + filaNombreTriadas + '</tr><tr><td class="cabecera">Cuatriada</td>' + filaNombreAcordes + '</tr>';
			html +='<tr><td class="cabecera">Sus2</td>' + filaNombreSus2 + '</tr><tr><td class="cabecera">Sus4</td>' + filaNombreSus4 + '</tr>';
			

			if(filaFuncionesArmonicas != '' && modalidadGeneralElegida != ''){
				if(filaNombreParalela != '')	html +='<tr><td class="cabecera">Paralela</td>' + filaNombreParalela + '</tr>';
				if(filaNombreParalela != '')	html +='<tr><td class="cabecera">Paralela</td>' + filaNombreParalelaTri + '</tr>';
				html += '<tr><td class="cabecera">Función: </td>' + filaFuncionesArmonicas + '</tr>';
			};
			
			html +='<tr><td class="cabecera">Notas</td>' + filaNotasAcordes + '</tr>';
			
			html += '</tbody></table>';
			
			//leyendas de la tabla
			if(filaFuncionesArmonicas != ''){
				html += '<p class="leyenda"><strong>T</strong>: tónica, <strong>SD</strong>: subdominante, <strong>D</strong>: dominante</p>';
			};
			
			//leyenda de las escalas modales
			if(escalaElegida['modal']=='true'){
				html += '<div class="leyendaAcordesModales">';
				html += '<span class="cadencial">Acorde cadencial</span> - ';
				html += '<span class="evitar">Acorde a evitar</span>';
				html += '</div>';
			};
			
			
		};
		
		return html;
		
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
		
		var html = '';
		
		html += '<h3>Armonía extendida de ' + nombreTonicaElegida + " " + nombreEscalaElegida + '</h3>';
		html += '<div id="acordeonArmoniaExtendida">';
		
		html += generaTablaArmoniaExtendida('Dominantes secundarios (D)', arrayNotas, arrayAcordes);
		html += generaTablaArmoniaExtendida('Subdominantes secundarios (SD)', arrayNotas, arrayAcordes);
		html += generaTablaArmoniaExtendida('Tritonos sustitutos (D)', arrayNotas, arrayAcordes);
		html += generaTablaArmoniaExtendida('II menor relativo (SD)', arrayNotas, arrayAcordes);
		html += '</div>';
		
		html += '<p class="leyenda"><span class="cadencial">Color:</span> acorde más frecuente</h4>';

		return html;
	
	};
	
	//crea una tabla de acordes extendidos a partir del titulo pasado (dominantes secundarios, subdominantes secundarios, etc.)
	function generaTablaArmoniaExtendida(titulo, arrayNotas, arrayAcordes){
	
		var html = '';
		
		
		html +='<h3>' + titulo + '</h3><div>';
		
		html += '<table>';
		html += generaCabeceraTablaArmoniaExtendida(arrayAcordes);
		
		html += '<tbody>';
		
		//determinar si la elección ha sido Mayor o menor
		if($('select#escala option:selected').val() == '0'){ //si es mayor
			modalidadGeneralElegida = "M";
		}else{
			modalidadGeneralElegida = "m";
		};
		
		switch(titulo)
		{
			case 'Dominantes secundarios (D)':
				
				//dominantes secundarios (tipo V7)
				html += generaFilaArmoniaExtendida(dominantesSecundarios, 'Dominante', 7, arrayNotas, arrayAcordes);
				//dominantes secundarios (tipo vii7b5)
				html += generaFilaArmoniaExtendida(dominantesSecundarios, 'semidisminuido', 11, arrayNotas, arrayAcordes);
				//dominantes secundarios (tipo viiDim7)
				html += generaFilaArmoniaExtendida(dominantesSecundarios, 'disminuído', 11, arrayNotas, arrayAcordes);
				break;
			case 'Subdominantes secundarios (SD)':
			
				//subdominantes secundarios (tipo IVmaj7)
				html += generaFilaArmoniaExtendida(subDominantesSecundarios, 'Mayor séptima', 5, arrayNotas, arrayAcordes);
				//subdominantes secundarios (tipo ii7)
				html += generaFilaArmoniaExtendida(subDominantesSecundarios, 'menor séptima', 2, arrayNotas, arrayAcordes);
				//subdominantes secundarios (tipo iv7)
				html += generaFilaArmoniaExtendida(subDominantesSecundarios, 'menor séptima', 5, arrayNotas, arrayAcordes);
				//subdominantes secundarios (tipo ii7b5)
				html += generaFilaArmoniaExtendida(subDominantesSecundarios, 'semidisminuido', 2, arrayNotas, arrayAcordes);
				//subdominantes secundarios (tipo IV7)
				html += generaFilaArmoniaExtendida(subDominantesSecundarios, 'Dominante', 5, arrayNotas, arrayAcordes);

				break;
			case 'Tritonos sustitutos (D)':
				//tritonos sustitutos (tipo bII7), a distancia de 4ª aug del dominante normal de la escala
				html += generaFilaArmoniaExtendida(tritonosSustitutos, 'Dominante', 6, arrayNotas, arrayAcordes);
				break;
			case 'II menor relativo (SD)':
				//Segundo menor relativo (tipo ii7)
				html += generaFilaArmoniaExtendida(segundosMenoresRelativos, 'menor séptima', 2, arrayNotas, arrayAcordes);
				//Segundo menor relativo (tipo ii7b5)
				html += generaFilaArmoniaExtendida(segundosMenoresRelativos, 'semidisminuido', 2, arrayNotas, arrayAcordes);
				break;
		};
		
		
		html += '<tbody>';
		html += '</table>';
		html += '</div>'; //fin div del acordeon
		
		return html;
	
	};
	
	//simplemente genera una thead con los acordes ya calculados de la escala elegida
	//para que el usuario tenga una referencia rápida
	function generaCabeceraTablaArmoniaExtendida(arrayAcordes)
	{
		var html = '';
		//cabecera de referencia
		html += '<thead><tr>';
		for(var i=0; i<=arrayAcordes.length - 1; i++){
			
			html += '<td class="cabecera">';
			html += arrayAcordes[i]['nombre'];
			html += '</td>';
		};
		html += '</tr></thead>';
		
		return html;
	};
	
	
	//crea una tr con tds con todos los acordes extendidos a partir de un tipo de arrayExtendido (Dominantes secundarias, subdominantes secundarias,...), un nombre del tipo de acorde (dominante, disminuído,...) y el nº de semitonos hasta la fundamental del nuevo acorde
	function generaFilaArmoniaExtendida(arrayExtendido, nombreAcordeExtendido, semitonosHastaNuevaFundamental, arrayNotas, arrayAcordes){
		
		var html = '';
		var posExtendidaEncontrada = -1;
		
		html += '<tr>';
		for(var i=0; i<=arrayAcordes.length - 1; i++){

			var gradoLimpio = arrayNotas[i]['grado'].replace('J','').replace('m','').replace('sus','').replace('rel', '').toLowerCase();

			posExtendidaEncontrada = encuentraPosicionArmoniaExtendida(arrayExtendido, gradoLimpio, nombreAcordeExtendido);
			
			if(posExtendidaEncontrada >=0){
				
				//calculamos el acorde en sí a partir de su fundamental y tipo

				//primero sacamos la posicion de la fundamental del acorde analizado
				var posicionFundamental = -1;
				for(var j=0; j<=notas.length - 1; j++){
					if(arrayAcordes[i]['fundamental']==notas[j]['nombre'] || arrayAcordes[i]['fundamental']==notas[j]['enarmonica']){
						posicionFundamental = j;
					};
				};
				
				
				//a dicha posición, le añadimos el nº de semitonos necesarios para obtener el acorde extendido
				var posicionFundamentalNuevoAcorde = posicionFundamental + semitonosHastaNuevaFundamental;
				if(posicionFundamentalNuevoAcorde>11)	posicionFundamentalNuevoAcorde = posicionFundamentalNuevoAcorde - 12;
				
				//y encontramos qué nota es
				var notaDominante =  notas[posicionFundamentalNuevoAcorde]['nombre'];
				if($("#interface input:radio:checked").val()==1){ 
				//bemoles
					if(notas[posicionFundamentalNuevoAcorde]['enarmonica']){
						notaDominante = notas[posicionFundamentalNuevoAcorde]['enarmonica'];
					};
				};
				
				
				
				//Obtenemos el patrón de tonos del acorde
				var patronAcorde = '';
				var abreviaturaAcorde = '';
				for(var j=0; j<=acordes.length - 1; j++){
					if(arrayExtendido[posExtendidaEncontrada]['tipo'] == acordes[j]['nombre']){
						patronAcorde = acordes[j]['patron'];
						abreviaturaAcorde = acordes[j]['abreviatura'];
					};
				};
				
				//y, teniendo la fundamental y el patrón, simplemente buscamos el resto de notas del patrón
				var terceraPatron, quintaPatron, septimaPatron = '';
				var patronPart = patronAcorde.split('-');
				
				terceraPatron = parseInt(posicionFundamentalNuevoAcorde) + parseInt(patronPart[1]);
				if(terceraPatron > 11)	terceraPatron = terceraPatron -12;
				quintaPatron = parseInt(posicionFundamentalNuevoAcorde) + parseInt(patronPart[2]);
				if(quintaPatron > 11)	quintaPatron = quintaPatron -12;
				septimaPatron = parseInt(posicionFundamentalNuevoAcorde) + parseInt(patronPart[3]);
				if(septimaPatron > 11)	septimaPatron = septimaPatron -12;
				
				var acordeCompuesto = notaDominante + '-' + notas[terceraPatron]['nombre'] + '-' + notas[quintaPatron]['nombre'] + '-' + notas[septimaPatron]['nombre'];
				
				if($("#interface input:radio:checked").val()==1){ 
				//bemoles
					acordeCompuesto = notaDominante;
					if(notas[terceraPatron]['enarmonica']){
						acordeCompuesto += '-' + notas[terceraPatron]['enarmonica'];
					}else{
						acordeCompuesto += '-' + notas[terceraPatron]['nombre'];
					}
					if(notas[quintaPatron]['enarmonica']){
						acordeCompuesto += '-' + notas[quintaPatron]['enarmonica'];
					}else{
						acordeCompuesto += '-' + notas[quintaPatron]['nombre'];
					}
					if(notas[septimaPatron]['enarmonica']){
						acordeCompuesto += '-' + notas[septimaPatron]['enarmonica'];
					}else{
						acordeCompuesto += '-' + notas[septimaPatron]['nombre'];
					};
				};

			};
			
			if(posExtendidaEncontrada > -1 && notaDominante && abreviaturaAcorde && arrayExtendido[posExtendidaEncontrada]['nombre'] && acordeCompuesto){
				
				html += '<td class="celdaAcorde" id="' + acordeCompuesto + '">';
				
				html += '<p>' + notaDominante + abreviaturaAcorde + ' (' + arrayExtendido[posExtendidaEncontrada]['nombre'] + ')</p>';
				
				var classFrecuencia = '';
				
				if(arrayExtendido[posExtendidaEncontrada]['importante'])	classFrecuencia = ' cadencial';
				
				html += '<p class="destacado' + classFrecuencia + '">' + acordeCompuesto + '</p>'
				
			html += '</td>';
			
			}else{
			
				html += '<td>-</td>';
			
			};
			
			
		};

		html += '</tr>';
	
		return html;
	
	};
	
	
	//recorre el hashtable de armonía extendida pasado y devuelve la posicion según el grado y tipo de acorde pasado
	function encuentraPosicionArmoniaExtendida(arreglo, grado, tipo){
	
		//recorremos las dominantes
			var posEncontrada = -1;
			for(var j= 0; j<=arreglo.length - 1; j++){
				var nombreLimpio = arreglo[j]['nombre'].toLowerCase().split('-');
				
				if(grado == nombreLimpio[1] && tipo == arreglo[j]['tipo']){
					
					if(modalidadGeneralElegida == "M"){
						posEncontrada = j;
					}else{
						if(arreglo[j]['menor'] == true)	posEncontrada = j;
					};
					
					
				};
			};
		
		return posEncontrada;
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
	
	//función que devuelve el número romano de un grado en formato estandarizado según el acorde que se forma en él.
	//por ejemplo, un II con Dm7, lo transforma en ii7; un I con Cmaj7 lo transforma en Imaj7, etc.
	function transformaGradoSegunAcorde(grado, acorde)
	{
		var gradoTransformado = '';
		
		grado = grado.replace('J', '').replace('M','').replace('m',''); //limpiamos posibles intervalos
		
		if(acorde.indexOf('mmaj7') >= 0){
			gradoTransformado = grado.toLowerCase();
		}else if(acorde.indexOf('maj7') >= 0){
			gradoTransformado = grado.toUpperCase();
		}else if(acorde.indexOf('m') >= 0){
			gradoTransformado = grado.toLowerCase();
		}else{
			gradoTransformado = grado.toUpperCase();
		};
		
		//quitamos el posible bemol o sostenido del acorde y finalmente eliminamos la letra de la nota
		gradoTransformado += acorde.replace('b','').replace('#','').substring(1,acorde.length);
		
		//en el caso de los menores séptima, eliminamos la m por ser redundante, ya que hemos pasado a lcase previamente
		if(gradoTransformado.indexOf('m7') >= 0 && gradoTransformado.indexOf('dim7') == -1){
				gradoTransformado = gradoTransformado.replace('m','');
		};

		return gradoTransformado;
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
		
		//traducimos el acorde de la celda en notas midi
		var notasPart = objThis.id.split('-');
		
		var acordeMIDI = new Array();
		
		for(var i= 0; i<=notasPart.length - 1; i++){
			
			var separacion = 0;
			if(i==0)	separacion = -12; //pasamos la nota del bajo separada una octava del resto del acorde

			
			acordeMIDI.push(calculaNotaMIDI(notasPart[i], separacion));
			
		};
		
		MIDI.chordOn(channel, acordeMIDI, velocity, delay);
		MIDI.chordOff(channel, acordeMIDI, delay + 0.75);
		
			
	};
	
	//traduce la notación estándar americana en MIDI notes numéricas (integer)
	function calculaNotaMIDI(nota, separacion)
	{
		for(var i = 0; i<= notas.length - 1; i++){
			
			if(notas[i]['nombre'] == nota || notas[i]['enarmonica'] == nota){
				//hemos encontrado la posición en el hashtable de notas, por tanto devolvemos dicha posición + la octava del C3 en midi notes
				
				return + Cinicial + separacion + i;	
			};
				
		};
		 
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
		if($('#notacion').children().size() > 0 && $('#instrumento').children().size() > 0 ){
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
		   if($('#notacion').children().size() > 0 && $('#instrumento').children().size() > 0 ){
			generaInformacion();
		  };
		  
	}); 
	
	//evento de cambio de vista instrumento con los input radio
	$('#interface input:radio[name="instrumento"]').change(function () {
		//simplemente actualizamos el instrumento, no hay que hacer nada más
		if($('#notacion').children().size() > 0 && $('#instrumento').children().size() > 0 ){
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
	//generamos un objeto MIDI que esté accesible a nivel de toda la aplicación
	
	MIDI.loadPlugin({
		soundfontUrl: "./soundfont/",
		instrument: "acoustic_grand_piano",
		onprogress: function(state, progress) {
			//console.log(state, progress);
		},
		onsuccess: function() {
			
			// establecemos el min-max MIDI
			MIDI.setVolume(0, 127);
			//MIDI.noteOn(0, note, velocity, delay);
			//MIDI.noteOff(0, note, delay + 0.75);

			
		}
	});
	
	
	
	
	
});// fin document ready