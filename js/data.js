//****************************
//Javier Arce 2013-2021
//Esta obra está bajo licencia Creative Commons by-sa 4.0 International, Reconocimiento-Compartir igual
//https://creativecommons.org/licenses/by-sa/4.0/
//****************************

//VARIABLES DE ÁMBITO GLOBAL, CONSTANTES
const numeroNotasEscalaDiatonica = 12; //7 + alteraciones
const numeroTrastes = 12; //diapasón de la guitarra

//variables MIDI
const delay = 0; // toca la nota cada cuarto de segundo
const note = -1; // la nota MIDI
const velocity = 127; // volumen de dicha nota
const channel = 0; // canal
const Cinicial = 60; //nota MIDI de la octava inicial desde donde reproducir sonidos de ejemplo. C0 = 0, C1 = 12, C2 = 24, C3 = 36, C4 = 48, C5 = 60, C6 = 72, etc.

//arreglo tipo hashtable de las 12 notas de la escala diatónica y sus correspondientes enarmonías
const notas = new Array();
notas.push({"nombre" : "C"});
notas.push({"nombre" : "C#", "enarmonica" : "Db"});
notas.push({"nombre" : "D"});
notas.push({"nombre" : "D#", "enarmonica" : "Eb"});
notas.push({"nombre" : "E"});
notas.push({"nombre" : "F"});
notas.push({"nombre" : "F#", "enarmonica" : "Gb"});
notas.push({"nombre" : "G"});
notas.push({"nombre" : "G#", "enarmonica" : "Ab"});
notas.push({"nombre" : "A"});
notas.push({"nombre" : "A#", "enarmonica" : "Bb"});
notas.push({"nombre" : "B"});

//arreglo tipo hashtable de distancias de intervalo, sus nombres y el grado que les corresponde
const intervalos = new Array();
intervalos.push({"nombre" : "Unísono", "semitonos" : 0, "grado" : "I"});
intervalos.push({"nombre" : "2ª menor", "semitonos" : 1, "grado" : "IIm"});
intervalos.push({"nombre" : "2ª Mayor", "semitonos" : 2, "grado" : "II"});
intervalos.push({"nombre" : "3ª menor", "semitonos" : 3, "grado" : "IIIm"});
intervalos.push({"nombre" : "3ª Mayor", "semitonos" : 4, "grado" : "III"});
intervalos.push({"nombre" : "4ª Justa", "semitonos" : 5, "grado" : "IVJ"});
intervalos.push({"nombre" : "4ª aumentada / 5ª disminuida", "semitonos" : 6, "grado" : "IVaug"});
intervalos.push({"nombre" : "5ª Justa", "semitonos" : 7, "grado" : "VJ"});
intervalos.push({"nombre" : "6ª menor", "semitonos" : 8, "grado" : "VIm"});
intervalos.push({"nombre" : "6ª Mayor", "semitonos" : 9, "grado" : "VI"});
intervalos.push({"nombre" : "7ª menor", "semitonos" : 10, "grado" : "VIIm"});
intervalos.push({"nombre" : "7ª Mayor", "semitonos" : 11, "grado" : "VII"});
intervalos.push({"nombre" : "8ª Justa", "semitonos" : 12, "grado" : "VIIIJ"});
intervalos.push({"nombre" : "9ª menor", "semitonos" : 13, "grado" : "IXm"});
intervalos.push({"nombre" : "9ª Mayor", "semitonos" : 14, "grado" : "IX"});
intervalos.push({"nombre" : "11ª Justa", "semitonos" : 17, "grado" : "XIJ"});
intervalos.push({"nombre" : "13ª menor", "semitonos" : 20, "grado" : "XIIIm"});
intervalos.push({"nombre" : "13ª Mayor", "semitonos" : 21, "grado" : "XIII"});

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

//arreglo tipo hashtable de los distintos acordes que pueden formarse
const acordes = new Array(); //de cuatriada
acordes.push({"nombre" : "Mayor séptima", "patron" : "1-4-7-11", "abreviatura" : "maj7"});
acordes.push({"nombre" : "Dominante", "patron" : "1-4-7-10", "abreviatura" : "7"});
acordes.push({"nombre" : "menor séptima", "patron" : "1-3-7-10", "abreviatura" : "m7"});
acordes.push({"nombre" : "semidisminuido", "patron" : "1-3-6-10", "abreviatura" : "m7♭5"});
acordes.push({"nombre" : "disminuído", "patron" : "1-3-6-9", "abreviatura" : "dim7"});
acordes.push({"nombre" : "Tónica menor", "patron" : "1-3-7-11", "abreviatura" : "mMaj7"});
acordes.push({"nombre" : "séptima con cuarta suspendida", "patron" : "1-5-7-10", "abreviatura" : "7sus4"});
acordes.push({"nombre" : "séptima con quinta bemol", "patron" : "1-4-6-10", "abreviatura" : "7♭5"});
acordes.push({"nombre" : "séptima con quinta aumentada", "patron" : "1-4-8-10", "abreviatura" : "7♯5"});
acordes.push({"nombre" : "menor séptima con quinta aumentada", "patron" : "1-3-8-10", "abreviatura" : "m7♯5"});
acordes.push({"nombre" : "sexta", "patron" : "1-4-7-9", "abreviatura" : "6"});
acordes.push({"nombre" : "menor sexta", "patron" : "1-3-7-9", "abreviatura" : "m6"});
acordes.push({"nombre" : "sexta con cuarta suspendida", "patron" : "1-5-7-9", "abreviatura" : "6sus4"});
acordes.push({"nombre" : "novena añadida", "patron" : "1-4-7-14", "abreviatura" : "add9"});
acordes.push({"nombre" : "menor con novena añadida", "patron" : "1-3-7-14", "abreviatura" : "madd9"});
acordes.push({"nombre" : "undécima añadida", "patron" : "1-4-7-17", "abreviatura" : "add11"});
acordes.push({"nombre" : "aumentado con séptima mayor", "patron" : "1-4-8-11", "abreviatura" : "+maj7"});
acordes.push({"nombre" : "aumentado con séptima dominante", "patron" : "1-4-8-10", "abreviatura" : "+7"});

//de triada
acordes.push({"nombre" : "segunda suspendida", "patron" : "1-2-7", "abreviatura" : "sus2"});
acordes.push({"nombre" : "segunda suspendida", "patron" : "1-4-7", "abreviatura" : "sus4"});

//arreglo tipo hashtable de afinaciones para guitarra
const afinaciones = new Array();
afinaciones.push({"nombre" : "Estándar E", "patron" : "E-A-D-G-B-E", "enarmonica" : "E-A-D-G-B-E"});
afinaciones.push({"nombre" : "E♭ tuning", "patron" : "Eb-Ab-Db-Gb-Bb-Eb", "enarmonica" : "D#-G#-C#-F#-A#-D#"});
afinaciones.push({"nombre" : "Drop D♭", "patron" : "Db-Ab-Db-Gb-Bb-Eb", "enarmonica" : "C#-G#-C#-F#-A#-D#"});

//arreglo tipo hashtable con el círculo de quintas
const circuloQuintas = new Array();
circuloQuintas.push({"nombre" : "C", "enarmonica" : "Am", "armadura" : ""});
circuloQuintas.push({"nombre" : "G", "enarmonica" : "Em", "armadura" : "#"});
circuloQuintas.push({"nombre" : "D", "enarmonica" : "Bm", "armadura" : "##"});
circuloQuintas.push({"nombre" : "A", "enarmonica" : "F#m", "aka" : "Gbm", "armadura" : "###"});
circuloQuintas.push({"nombre" : "E", "enarmonica" : "C#m", "aka" : "Dbm", "armadura" : "####"});
circuloQuintas.push({"nombre" : "B", "enarmonica" : "G#m", "aka" : "Abm", "armadura" : "#####"});
circuloQuintas.push({"nombre" : "Gb", "enarmonica" : "Ebm", "aka" : "Ebm", "armadura" : "######"});
circuloQuintas.push({"nombre" : "Db", "aka" : "C#", "enarmonica" : "Bbm", "armadura" : "bbbbb"});
circuloQuintas.push({"nombre" : "Ab", "aka" : "G#", "enarmonica" : "Fm", "armadura" : "bbbb"});
circuloQuintas.push({"nombre" : "Eb", "aka" : "D#", "enarmonica" : "Cm", "armadura" : "bbb"});
circuloQuintas.push({"nombre" : "Bb", "aka" : "A#", "enarmonica" : "Gm", "armadura" : "bb"});
circuloQuintas.push({"nombre" : "F", "enarmonica" : "Dm", "armadura" : "b"});
circuloQuintas.push({"nombre" : "F#", "enarmonica" : "D#m", "aka" : "D#m", "armadura" : "######"}); //agregado especial, enarmonica a Gb

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