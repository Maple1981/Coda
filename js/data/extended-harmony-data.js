// Catálogo musical extraído desde js/data.js.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//arreglo tipo hashtable de dominantes secundarios
	const dominantesSecundarios = new Array();
	dominantesSecundarios.push({"nombre" : "V-ii", "tipo" : "Dominante", "menor" : false});
	dominantesSecundarios.push({"nombre" : "V-iii", "tipo" : "Dominante", "menor" : false});
	dominantesSecundarios.push({"nombre" : "V-IV", "tipo" : "Dominante", "menor" : true, "importante" : true});
	dominantesSecundarios.push({"nombre" : "V-V", "tipo" : "Dominante", "menor" : true, "importante" : true});
	dominantesSecundarios.push({"nombre" : "V-vi", "tipo" : "Dominante", "menor" : false, "importante" : true});
	
	dominantesSecundarios.push({"nombre" : "vii7b5-ii", "tipo" : "semidisminuido", "menor" : false});
	dominantesSecundarios.push({"nombre" : "vii7b5-iii", "tipo" : "semidisminuido", "menor" : false});
	dominantesSecundarios.push({"nombre" : "vii7b5-IV", "tipo" : "semidisminuido", "menor" : true, "importante" : true});
	dominantesSecundarios.push({"nombre" : "vii7b5-V", "tipo" : "semidisminuido", "menor" : true, "importante" : true});
	dominantesSecundarios.push({"nombre" : "vii7b5-vi", "tipo" : "semidisminuido", "menor" : false, "importante" : true});
	
	dominantesSecundarios.push({"nombre" : "viiº7-ii", "tipo" : "disminuído", "menor" : false});
	dominantesSecundarios.push({"nombre" : "viiº7-iii", "tipo" : "disminuído", "menor" : false});
	dominantesSecundarios.push({"nombre" : "viiº7-IV", "tipo" : "disminuído", "menor" : true, "importante" : true});
	dominantesSecundarios.push({"nombre" : "viiº7-V", "tipo" : "disminuído", "menor" : true, "importante" : true});
	dominantesSecundarios.push({"nombre" : "viiº7-vi", "tipo" : "disminuído", "menor" : false, "importante" : true});
	
	//arreglo tipo hashtable de subdominantes secundarios
	const subDominantesSecundarios = new Array();
	subDominantesSecundarios.push({"nombre" : "IVmaj7-IV", "tipo" : "Mayor séptima", "menor" : true});
	subDominantesSecundarios.push({"nombre" : "IVmaj7-V", "tipo" : "Mayor séptima", "menor" : true});
	subDominantesSecundarios.push({"nombre" : "ii7-IV", "tipo" : "menor séptima", "menor" : true});
	subDominantesSecundarios.push({"nombre" : "ii7-V", "tipo" : "menor séptima", "menor" : true});
	subDominantesSecundarios.push({"nombre" : "iv7-IV", "tipo" : "menor séptima", "menor" : true});
	subDominantesSecundarios.push({"nombre" : "iv7-V", "tipo" : "menor séptima", "menor" : true});
	subDominantesSecundarios.push({"nombre" : "ii7b5-IV", "tipo" : "semidisminuido", "menor" : true, "importante" : true});
	subDominantesSecundarios.push({"nombre" : "ii7b5-V", "tipo" : "semidisminuido", "menor" : true, "importante" : true});
	subDominantesSecundarios.push({"nombre" : "IV7-IV", "tipo" : "Dominante", "menor" : true});
	subDominantesSecundarios.push({"nombre" : "IV7-V", "tipo" : "Dominante", "menor" : true});
	
	//arreglo tipo hashtable del tritono sustituto
	const tritonosSustitutos = new Array();
	tritonosSustitutos.push({"nombre" : "susV-IV", "tipo" : "Dominante", "menor" : true});
	tritonosSustitutos.push({"nombre" : "susV-V", "tipo" : "Dominante", "menor" : true, "importante" : true});
	tritonosSustitutos.push({"nombre" : "susV-VI", "tipo" : "Dominante", "menor" : true});
	
	//arreglo tipo hashtable de los segundos menores relativos
	const segundosMenoresRelativos = new Array();
	segundosMenoresRelativos.push({"nombre" : "ii7rel-IV", "tipo" : "menor séptima", "menor" : true});
	segundosMenoresRelativos.push({"nombre" : "ii7rel-V", "tipo" : "menor séptima", "menor" : true});
	segundosMenoresRelativos.push({"nombre" : "ii7rel-VI", "tipo" : "menor séptima", "menor" : true});
	segundosMenoresRelativos.push({"nombre" : "ii7b5rel-IV", "tipo" : "semidisminuido", "menor" : true});
	segundosMenoresRelativos.push({"nombre" : "ii7b5rel-V", "tipo" : "semidisminuido", "menor" : true});
	segundosMenoresRelativos.push({"nombre" : "ii7b5rel-VI", "tipo" : "semidisminuido", "menor" : true});

	global.CodaDataCatalogs.extendedHarmony = {
		secondaryDominants: dominantesSecundarios,
		secondarySubdominants: subDominantesSecundarios,
		tritoneSubstitutes: tritonosSustitutos,
		relativeMinorSeconds: segundosMenoresRelativos
	};
})(window);
