const provinceMap = {
  L_AQUILA: "L'Aquila",
  TERAMO: 'Teramo',
  PESCARA: 'Pescara',
  CHIETI: 'Chieti',
  POTENZA: 'Potenza',
  MATERA: 'Matera',
  CATANZARO: 'Catanzaro',
  COSENZA: 'Cosenza',
  CROTONE: 'Crotone',
  REGGIO_CALABRIA: 'Reggio Calabria',
  VIBO_VALENTIA: 'Vibo Valentia',
  AVELLINO: 'Avellino',
  BENEVENTO: 'Benevento',
  CASERTA: 'Caserta',
  NAPOLI: 'Napoli',
  SALERNO: 'Salerno',
  BOLOGNA: 'Bologna',
  FERRARA: 'Ferrara',
  FORLI_CESENA: 'Forlì-Cesena',
  MODENA: 'Modena',
  PARMA: 'Parma',
  PIACENZA: 'Piacenza',
  RAVENNA: 'Ravenna',
  REGGIO_EMILIA: 'Reggio Emilia',
  RIMINI: 'Rimini',
  GORIZIA: 'Gorizia',
  PORDENONE: 'Pordenone',
  TRIESTE: 'Trieste',
  UDINE: 'Udine',
  FROSINONE: 'Frosinone',
  LATINA: 'Latina',
  RIETI: 'Rieti',
  ROMA: 'Roma',
  VITERBO: 'Viterbo',
  GENOVA: 'Genova',
  IMPERIA: 'Imperia',
  LA_SPEZIA: 'La Spezia',
  SAVONA: 'Savona',
  BERGAMO: 'Bergamo',
  BRESCIA: 'Brescia',
  COMO: 'Como',
  CREMONA: 'Cremona',
  LECCO: 'Lecco',
  LODI: 'Lodi',
  MANTOVA: 'Mantova',
  MILANO: 'Milano',
  MONZA_BRIANZA: 'Monza e della Brianza',
  PAVIA: 'Pavia',
  SONDRIO: 'Sondrio',
  VARESE: 'Varese',
  ANCONA: 'Ancona',
  ASCOLI_PICENO: 'Ascoli Piceno',
  FERMO: 'Fermo',
  MACERATA: 'Macerata',
  PESARO_URBINO: 'Pesaro e Urbino',
  CAMPOBASSO: 'Campobasso',
  ISERNIA: 'Isernia',
  ALESSANDRIA: 'Alessandria',
  ASTI: 'Asti',
  BIELLA: 'Biella',
  CUNEO: 'Cuneo',
  NOVARA: 'Novara',
  TORINO: 'Torino',
  VERBANO_CUSIO_OSSOLA: 'Verbano-Cusio-Ossola',
  VERCELLI: 'Vercelli',
  BARI: 'Bari',
  BARLETTA_ANDRIA_TRANI: 'Barletta-Andria-Trani',
  BRINDISI: 'Brindisi',
  FOGGIA: 'Foggia',
  LECCE: 'Lecce',
  TARANTO: 'Taranto',
  CAGLIARI: 'Cagliari',
  NUORO: 'Nuoro',
  ORISTANO: 'Oristano',
  SASSARI: 'Sassari',
  SUD_SARDEGNA: 'Sud Sardegna',
  AGRIGENTO: 'Agrigento',
  CALTANISSETTA: 'Caltanissetta',
  CATANIA: 'Catania',
  ENNA: 'Enna',
  MESSINA: 'Messina',
  PALERMO: 'Palermo',
  RAGUSA: 'Ragusa',
  SIRACUSA: 'Siracusa',
  TRAPANI: 'Trapani',
  AREZZO: 'Arezzo',
  FIRENZE: 'Firenze',
  GROSSETO: 'Grosseto',
  LIVORNO: 'Livorno',
  LUCCA: 'Lucca',
  MASSA_CARRARA: 'Massa-Carrara',
  PISA: 'Pisa',
  PISTOIA: 'Pistoia',
  PRATO: 'Prato',
  SIENA: 'Siena',
  BOLZANO: 'Bolzano',
  TRENTO: 'Trento',
  PERUGIA: 'Perugia',
  TERNI: 'Terni',
  AOSTA: 'Aosta',
  BELLUNO: 'Belluno',
  PADOVA: 'Padova',
  ROVIGO: 'Rovigo',
  TREVISO: 'Treviso',
  VENEZIA: 'Venezia',
  VERONA: 'Verona',
  VICENZA: 'Vicenza'
};

const italianRegions = [
  'Abruzzo',
  'Basilicata',
  'Calabria',
  'Campania',
  'Emilia-Romagna',
  'Friuli-Venezia Giulia',
  'Lazio',
  'Liguria',
  'Lombardia',
  'Marche',
  'Molise',
  'Piemonte',
  'Puglia',
  'Sardegna',
  'Sicilia',
  'Toscana',
  'Trentino-Alto Adige',
  'Umbria',
  "Valle d'Aosta",
  'Veneto'
];

function localeSort(a, b) {
  return a.localeCompare(b, 'it', { sensitivity: 'base' });
}

const provinceList = Array.from(new Set(Object.values(provinceMap))).sort(localeSort);
const regionList = [...italianRegions].sort(localeSort);

function apriPaginaArtisti(provincia) {
  window.location.href = `artists.html?province=${encodeURIComponent(provincia)}`;
}

function setupProvinceInteractions(svgElement) {
  const tooltip = document.getElementById('tooltip');
  if (!svgElement || !tooltip) {
    return;
  }

  const provinces = svgElement.querySelectorAll('path[id]');

  provinces.forEach(path => {
    const provinceName = path.id;

    path.addEventListener('mousemove', e => {
      tooltip.style.opacity = '1';
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.innerText = provinceName;
    });

    path.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    path.addEventListener('click', () => {
      const provName = provinceMap[path.id.toUpperCase()];
      if (provName) {
        apriPaginaArtisti(provName);
      } else {
        alert('Nessuna provincia associata a questo ID 😢');
      }
    });
  });
}

export function loadItalyMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) {
    return;
  }

  fetch('assets/img/map.svg')
    .then(response => {
      if (!response.ok) {
        throw new Error('Impossibile caricare la mappa');
      }
      return response.text();
    })
    .then(svgText => {
      const sanitizedSvg = svgText.replace(/<\?xml[^>]*?>/i, '');
      mapContainer.innerHTML = sanitizedSvg;

      const svgElement = mapContainer.querySelector('svg');
      if (svgElement) {
        svgElement.classList.add('italy-map');
        setupProvinceInteractions(svgElement);
      }
    })
    .catch(error => {
      console.error('Errore durante il caricamento della mappa:', error);
    });
}

function populateSuggestionLocationOptions() {
  const select = document.getElementById('suggestLocation');
  if (!select) {
    return;
  }

  select.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Non specificato';
  select.appendChild(placeholder);

  const provincesGroup = document.createElement('optgroup');
  provincesGroup.label = 'Province';
  provinceList.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    provincesGroup.appendChild(option);
  });
  select.appendChild(provincesGroup);

  const regionGroup = document.createElement('optgroup');
  regionGroup.label = 'Regioni';
  regionList.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    regionGroup.appendChild(option);
  });
  select.appendChild(regionGroup);
}

function populateProvinceSelects() {
  const selects = document.querySelectorAll('select[data-populate="province"]');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Seleziona provincia';
    select.appendChild(placeholder);
    provinceList.forEach(name => {
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

function populateRegionSelects() {
  const selects = document.querySelectorAll('select[data-populate="region"]');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Seleziona regione';
    select.appendChild(placeholder);
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

export function populateLocationSelectors() {
  populateSuggestionLocationOptions();
  populateProvinceSelects();
  populateRegionSelects();
}
