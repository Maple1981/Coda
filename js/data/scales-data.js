// Catálogo musical extraído desde js/data.js.
(function (global) {
	'use strict';

	global.CodaDataCatalogs = global.CodaDataCatalogs || {};

	//arreglo tipo hashtable de las distintas escalas y sus distancias en semitonos
	const escalas = new Array();
	escalas.push({"nombre" : "Mayor", "patron" : "0-2-2-1-2-2-2", "grados" : "I-II-III-IV-V-VI-VI", "funciones" : "T-SD-T-SD-D-T-D", "tonal" : "true"});
	escalas.push({"nombre" : "Mayor artificial", "patron" : "0-2-2-1-2-1-3"});
	escalas.push({"nombre" : "Menor natural", "patron" : "0-2-1-2-2-1-2", "funciones" : "T-SD-T-SD-D-SD-SD", "tonal" : "true"});
	escalas.push({"nombre" : "Menor armónica", "patron" : "0-2-1-2-2-1-3", "funciones" : "T-SD-T-SD-D-SD-D", "tonal" : "true"});
	escalas.push({"nombre" : "Menor melódica ascendente", "patron" : "0-2-1-2-2-2-2", "funciones" : "T-SD-T-SD-D-—-—", "tonal" : "true"});
	escalas.push({"nombre" : "Menor melódica descendente", "patron" : "0-2-1-2-2-1-2", "funciones" : "T-SD-T-SD-D-SD-SD", "tonal" : "true"}); //igual que la natural
	escalas.push({"nombre" : "Menor bachiana", "patron" : "0-2-1-2-2-2-2"});
	escalas.push({"nombre" : "------------", "patron" : ""}); //separador
	//escalas.push({"nombre" : "Pentatónica Mayor", "patron" : "0-2-2-1-2-2-2", "gradosEliminados" : "IVJ-VII"});
	//escalas.push({"nombre" : "Pentatónica menor", "patron" : "0-2-1-2-2-1-2", "gradosEliminados" : "II-VIm"});
	//escalas.push({"nombre" : "Blues hexatónica", "patron" : "0-2-1-2-1-1-1-2", "gradosEliminados" : "II-VIm", "gradosAnadidos" : "IVaug"});
	escalas.push({"nombre" : "Pentatónica Mayor", "patron" : "0-2-2-3-2"});
	escalas.push({"nombre" : "Pentatónica menor", "patron" : "0-3-2-2-3"});
	escalas.push({"nombre" : "Blues hexatónica", "patron" : "0-3-2-1-1-3"});
	escalas.push({"nombre" : "Blues heptatónica", "patron" : "0-2-1-2-1-3-1"});
	escalas.push({"nombre" : "------------", "patron" : ""});
	escalas.push({"nombre" : "Modo jónico", "patron" : "0-2-2-1-2-2-2", "modal" : "true", "caracteristicas" : "4-7"});//orden de notas características del modo (principal y secundaria)
	escalas.push({"nombre" : "Modo dórico", "patron" : "0-2-1-2-2-2-1", "modal" : "true", "caracteristicas" : "6-3"});//de aquí pueden extrapolarse los acordes cadenciales (contienen la nota principal)
	escalas.push({"nombre" : "Modo frigio", "patron" : "0-1-2-2-2-1-2", "modal" : "true", "caracteristicas" : "2-5"});//y el acorde a evitar (contiene ambas notas -tritono-, y una de ellas es la fundamental del acorde)
	escalas.push({"nombre" : "Modo lidio", "patron" : "0-2-2-2-1-2-2", "modal" : "true", "caracteristicas" : "4-1"});
	escalas.push({"nombre" : "Modo mixolidio", "patron" : "0-2-2-1-2-2-1", "modal" : "true", "caracteristicas" : "7-3"});
	escalas.push({"nombre" : "Modo eólico", "patron" : "0-2-1-2-2-1-2", "modal" : "true", "caracteristicas" : "6-2"});
	escalas.push({"nombre" : "Modo locrio", "patron" : "0-1-2-2-1-2-2", "modal" : "true", "caracteristicas" : "5-1"});
	escalas.push({"nombre" : "------------", "patron" : ""});
	escalas.push({"nombre" : "Acústica", "patron" : "0-2-2-2-1-2-1"});
	escalas.push({"nombre" : "Doble armónica", "patron" : "0-1-3-1-2-1-3"});
	escalas.push({"nombre" : "Dórica ucraniana", "patron" : "0-2-1-3-1-2-1"});
	escalas.push({"nombre" : "Dórica napolitana", "patron" : "0-1-2-2-2-2-1"});
	escalas.push({"nombre" : "Enigmática", "patron" : "0-1-3-2-2-2-1"});
	escalas.push({"nombre" : "Esplá", "patron" : "0-1-2-1-1-1-2-2"});
	escalas.push({"nombre" : "Frigia armónica", "patron" : "0-1-2-2-2-1-3"});
	escalas.push({"nombre" : "Frigia española heptatónica", "patron" : "0-1-3-1-2-1-2"});
	escalas.push({"nombre" : "Frigia española octatónica", "patron" : "0-1-2-1-1-2-1-2"});
	escalas.push({"nombre" : "Frigia Mayor", "patron" : "0-1-2-2-2-2-2"});
	escalas.push({"nombre" : "Húngara mayor I", "patron" : "0-3-1-2-1-2-1"});
	escalas.push({"nombre" : "Húngara mayor II", "patron" : "0-3-1-2-1-2-2"});
	escalas.push({"nombre" : "Húngara menor I", "patron" : "0-2-1-3-1-1-2"});
	escalas.push({"nombre" : "Húngara menor II", "patron" : "0-2-1-3-1-1-3"})
	escalas.push({"nombre" : "Lidia disminuída", "patron" : "0-2-1-3-1-2-2"});
	escalas.push({"nombre" : "Lidia menor", "patron" : "0-2-2-2-1-1-2"});
	escalas.push({"nombre" : "Locria dórica", "patron" : "0-2-1-2-1-3-1"});
	escalas.push({"nombre" : "Locria Mayor", "patron" : "0-2-2-1-1-2-2"});
	escalas.push({"nombre" : "Locria menor", "patron" : "0-2-1-2-1-2-2"});
	escalas.push({"nombre" : "Mayor armónica", "patron" : "0-2-2-1-2-1-3"});
	escalas.push({"nombre" : "Mayor-menor", "patron" : "0-2-2-1-2-1-2"});
	escalas.push({"nombre" : "Menor locria", "patron" : "0-2-1-2-1-2-3"});
	escalas.push({"nombre" : "Mixolidia 2ª#", "patron" : "0-3-1-1-2-2-1"});
	escalas.push({"nombre" : "Mixolidia 6ªb", "patron" : "0-2-2-1-2-1-2"});
	escalas.push({"nombre" : "Napolitana mayor", "patron" : "0-1-3-1-2-2-2"});
	escalas.push({"nombre" : "Napolitana mixolidia", "patron" : "0-1-3-1-2-2-1"});
	escalas.push({"nombre" : "Octatónica", "patron" : "0-2-1-2-1-2-1-2"});
	escalas.push({"nombre" : "Oriental", "patron" : "0-1-2-2-1-3-1"});
	escalas.push({"nombre" : "Persa", "patron" : "0-1-3-1-1-3-1"});
	escalas.push({"nombre" : "Prometeo", "patron" : "0-2-2-2-3-1"});
	escalas.push({"nombre" : "Prometeo napolitana", "patron" : "0-1-3-2-3-1"});
	escalas.push({"nombre" : "Super locria", "patron" : "0-1-2-1-2-2-2"});
	escalas.push({"nombre" : "Ultra locria", "patron" : "0-1-2-1-2-2-1"});
	escalas.push({"nombre" : "Whole-tone", "patron" : "0-2-2-2-2-2-1"});

	global.CodaDataCatalogs.scales = escalas;
})(window);
