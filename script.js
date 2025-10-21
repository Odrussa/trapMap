document.getElementById("menu-toggle").addEventListener("click", function() {
  document.querySelector("nav ul").classList.toggle("show");
});


// 🔹 Nuova funzione per aprire la pagina artisti
function apriPaginaArtisti(provincia) {
  window.location.href = `artists.html?province=${encodeURIComponent(provincia)}`;
}

// Collegamento ID (dallo SVG) -> campo del DB
const provinceMap = {
  // **Abruzzo**
  L_AQUILA: "L'Aquila",
  TERAMO: "Teramo",
  PESCARA: "Pescara",
  CHIETI: "Chieti",

  // **Basilicata**
  POTENZA: "Potenza",
  MATERA: "Matera",

  // **Calabria**
  CATANZARO: "Catanzaro",
  COSENZA: "Cosenza",
  CROTONE: "Crotone",
  REGGIO_CALABRIA: "Reggio Calabria",
  VIBO_VALENTIA: "Vibo Valentia",

  // **Campania**
  AVELLINO: "Avellino",
  BENEVENTO: "Benevento",
  CASERTA: "Caserta",
  NAPOLI: "Napoli",
  SALERNO: "Salerno",

  // **Emilia-Romagna**
  BOLOGNA: "Bologna",
  FERRARA: "Ferrara",
  FORLI_CESENA: "Forlì-Cesena",
  MODENA: "Modena",
  PARMA: "Parma",
  PIACENZA: "Piacenza",
  RAVENNA: "Ravenna",
  REGGIO_EMILIA: "Reggio Emilia",
  RIMINI: "Rimini",

  // **Friuli-Venezia Giulia**
  GORIZIA: "Gorizia",
  PORDENONE: "Pordenone",
  TRIESTE: "Trieste",
  UDINE: "Udine",

  // **Lazio**
  FROSINONE: "Frosinone",
  LATINA: "Latina",
  RIETI: "Rieti",
  ROMA: "Roma",
  VITERBO: "Viterbo",

  // **Liguria**
  GENOVA: "Genova",
  IMPERIA: "Imperia",
  LA_SPEZIA: "La Spezia",
  SAVONA: "Savona",

  // **Lombardia**
  BERGAMO: "Bergamo",
  BRESCIA: "Brescia",
  COMO: "Como",
  CREMONA: "Cremona",
  LECCO: "Lecco",
  LODI: "Lodi",
  MANTOVA: "Mantova",
  MILANO: "Milano",
  MONZA_BRIANZA: "Monza e della Brianza",
  PAVIA: "Pavia",
  SONDRIO: "Sondrio",
  VARESE: "Varese",

  // **Marche**
  ANCONA: "Ancona",
  ASCOLI_PICENO: "Ascoli Piceno",
  FERMO: "Fermo",
  MACERATA: "Macerata",
  PESARO_URBINO: "Pesaro e Urbino",

  // **Molise**
  CAMPOBASSO: "Campobasso",
  ISERNIA: "Isernia",

  // **Piemonte**
  ALESSANDRIA: "Alessandria",
  ASTI: "Asti",
  BIELLA: "Biella",
  CUNEO: "Cuneo",
  NOVARA: "Novara",
  TORINO: "Torino",
  VERBANO_CUSIO_OSSOLA: "Verbano-Cusio-Ossola",
  VERCELLI: "Vercelli",

  // **Puglia**
  BARI: "Bari",
  BARLETTA_ANDRIA_TRANI: "Barletta-Andria-Trani",
  BRINDISI: "Brindisi",
  FOGGIA: "Foggia",
  LECCE: "Lecce",
  TARANTO: "Taranto",

  // **Sardegna**
  CAGLIARI: "Cagliari",
  NUORO: "Nuoro",
  ORISTANO: "Oristano",
  SASSARI: "Sassari",
  SUD_SARDEGNA: "Sud Sardegna",

  // **Sicilia**
  AGRIGENTO: "Agrigento",
  CALTANISSETTA: "Caltanissetta",
  CATANIA: "Catania",
  ENNA: "Enna",
  MESSINA: "Messina",
  PALERMO: "Palermo",
  RAGUSA: "Ragusa",
  SIRACUSA: "Siracusa",
  TRAPANI: "Trapani",

  // **Toscana**
  AREZZO: "Arezzo",
  FIRENZE: "Firenze",
  GROSSETO: "Grosseto",
  LIVORNO: "Livorno",
  LUCCA: "Lucca",
  MASSA_CARRARA: "Massa-Carrara",
  PISA: "Pisa",
  PISTOIA: "Pistoia",
  PRATO: "Prato",
  SIENA: "Siena",

  // **Trentino-Alto Adige**
  BOLZANO: "Bolzano",
  TRENTO: "Trento",

  // **Umbria**
  PERUGIA: "Perugia",
  TERNI: "Terni",

  // **Valle d’Aosta**
  AOSTA: "Aosta",

  // **Veneto**
  BELLUNO: "Belluno",
  PADOVA: "Padova",
  ROVIGO: "Rovigo",
  TREVISO: "Treviso",
  VENEZIA: "Venezia",
  VERONA: "Verona",
  VICENZA: "Vicenza"
};


// Evento click sulle province
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('svg path').forEach(path => {
    path.addEventListener('click', () => {
      const provName = provinceMap[path.id.toUpperCase()];
      if (provName) {
        apriPaginaArtisti(provName); // 🔹 Qui cambia: apre una nuova pagina invece dell’overlay
      } else {
        alert("Nessuna provincia associata a questo ID 😢");
      }
    });
  });
});
