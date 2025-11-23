// ===============================================================
//   UTIL PER REGIONI E PROVINCE
// ===============================================================


// id SVG -> nome regione
export const regionMap = {
  IT65: "Abruzzo",
  IT77: "Basilicata",
  IT78: "Calabria",
  IT72: "Campania",
  IT45: "Emilia-Romagna",
  IT36: "Friuli-Venezia Giulia",
  IT62: "Lazio",
  IT42: "Liguria",
  IT25: "Lombardia",
  IT57: "Marche",
  IT67: "Molise",
  IT21: "Piemonte",
  IT75: "Puglia",
  IT88: "Sardegna",
  IT82: "Sicilia",
  IT52: "Toscana",
  IT32: "Trentino-Alto Adige",
  IT55: "Umbria",
  IT23: "Valle d'Aosta",
  IT34: "Veneto"
};


export const regionProvinceMap = {
  "Valle d'Aosta": ["Aosta"],
  Piemonte: ['Torino', 'Cuneo', 'Asti', 'Alessandria', 'Biella', 'Novara', 'Vercelli', 'Verbano-Cusio-Ossola'],
  Liguria: ['Genova', 'Imperia', 'La Spezia', 'Savona'],
  Lombardia: ['Bergamo', 'Brescia', 'Como', 'Cremona', 'Lecco', 'Lodi', 'Mantova', 'Milano', 'Monza-Brianza', 'Pavia', 'Sondrio', 'Varese'],
  'Trentino-Alto Adige': ['Bolzano', 'Trento'],
  Veneto: ['Belluno', 'Padova', 'Rovigo', 'Treviso', 'Venezia', 'Verona', 'Vicenza'],
  'Friuli-Venezia Giulia': ['Gorizia', 'Pordenone', 'Trieste', 'Udine'],
  Toscana: ['Arezzo', 'Firenze', 'Grosseto', 'Livorno', 'Lucca', 'Massa-Carrara', 'Pisa', 'Pistoia', 'Prato', 'Siena'],
  Umbria: ['Perugia', 'Terni'],
  Lazio: ['Frosinone', 'Latina', 'Rieti', 'Roma', 'Viterbo'],
  Abruzzo: ["L'Aquila", 'Teramo', 'Pescara', 'Chieti'],
  Puglia: ['Bari', 'Barletta-Andria-Trani', 'Brindisi', 'Foggia', 'Lecce', 'Taranto'],
  Campania: ['Avellino', 'Benevento', 'Caserta', 'Napoli', 'Salerno'],
  Molise: ['Campobasso', 'Isernia'],
  Basilicata: ['Matera', 'Potenza'],
  Calabria: ['Catanzaro', 'Cosenza', 'Crotone', 'Reggio Calabria', 'Vibo Valentia'],
  Sicilia: ['Agrigento', 'Caltanissetta', 'Catania', 'Enna', 'Messina', 'Palermo', 'Ragusa', 'Siracusa', 'Trapani'],
  Sardegna: ['Cagliari', 'Nuoro', 'Oristano', 'Sassari', 'Sud Sardegna'],
  'Emilia-Romagna': ['Bologna', 'Ferrara', 'Forlì-Cesena', 'Modena', 'Parma', 'Piacenza', 'Ravenna', 'Reggio Emilia', 'Rimini'],
  Marche: ['Ancona', 'Ascoli Piceno', 'Fermo', 'Macerata', 'Pesaro e Urbino']
};



//ordinamento
export function localeSort(a, b) {
  return a.localeCompare(b, 'it', { sensitivity: 'base' });
}

export const regionList = Object.keys(regionProvinceMap).sort(localeSort);


//popolamento SELECT
export function populateRegionSelects() {
  const selects = document.querySelectorAll('select[data-populate="region"]');
  
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '';   //svuotiamo i select

	//creazione voce seleziona regione
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Seleziona regione';
    select.appendChild(placeholder);

	//aggiungi le opzioni regioni
    regionList.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    if (currentValue) {
      select.value = currentValue;
    }
  });
}

export function populateProvinceOptions(select, regionValue) {
  select.innerHTML = ''; //svuotiamo i select

  //creazione voce corretta
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = regionValue ? 'Seleziona provincia' : 'Seleziona prima una regione';
  placeholder.selected = true;
  select.appendChild(placeholder);
  
  //se non è stata ancora selezionata una regione, disabilita select provincia
  if (!regionValue) {
    select.disabled = true;
    return;
  }
  select.disabled = false;

  //crea opzioni province della regione selezionata
  const provinces = regionProvinceMap[regionValue] || [];
  provinces.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

}


//export finale
export function populateLocationSelectors() {
  populateRegionSelects();

  const regionSelects = document.querySelectorAll('select[data-populate="region"]');
  const provinceSelects = document.querySelectorAll('select[data-populate="province"]');

  // Disattiva tutte le province all'avvio
  provinceSelects.forEach(select => populateProvinceOptions(select, null));

  // Collega ogni coppia select regione → select provincia
  regionSelects.forEach((regionSelect, index) => {
    const provinceSelect = provinceSelects[index];

    if (!provinceSelect) return;

    regionSelect.addEventListener('change', () => {
      populateProvinceOptions(provinceSelect, regionSelect.value);
    });
  });
}
