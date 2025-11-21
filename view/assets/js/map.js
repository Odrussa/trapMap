const regionIdMap = {
  IT23: "Valle d'Aosta",
  IT21: 'Piemonte',
  IT42: 'Liguria',
  IT25: 'Lombardia',
  IT32: 'Trentino-Alto Adige',
  IT34: 'Veneto',
  IT36: 'Friuli Venezia Giulia',
  IT52: 'Toscana',
  IT55: 'Umbria',
  IT62: 'Lazio',
  IT65: 'Abruzzo',
  IT75: 'Puglia',
  IT72: 'Campania',
  IT67: 'Molise',
  IT77: 'Basilicata',
  IT78: 'Calabria',
  IT82: 'Sicilia',
  IT88: 'Sardegna',
  IT45: 'Emilia-Romagna',
  IT57: 'Marche'
};

const regionProvinceMap = {
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

function localeSort(a, b) {
  return a.localeCompare(b, 'it', { sensitivity: 'base' });
}

const regionList = Object.keys(regionProvinceMap).sort(localeSort);

function apriPaginaArtisti(regione) {
  window.location.href = `artists.html?region=${encodeURIComponent(regione)}`;
}

function setupRegionInteractions(svgElement) {
  const tooltip = document.getElementById('tooltip');
  if (!svgElement || !tooltip) {
    return;
  }

  const regions = svgElement.querySelectorAll('path[id]');

  regions.forEach(path => {
    const regionId = path.id;
    const regionName = regionIdMap[regionId] || path.getAttribute('name') || regionId;

    path.addEventListener('mousemove', e => {
      tooltip.style.opacity = '1';
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.innerText = regionName;
    });

    path.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    path.addEventListener('click', () => {
      if (regionName) {
        apriPaginaArtisti(regionName);
      }
    });
  });
}

export function loadItalyMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) {
    return;
  }

  fetch('assets/img/it.svg')
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
        setupRegionInteractions(svgElement);
      }
    })
    .catch(error => {
      console.error('Errore durante il caricamento della mappa:', error);
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

function populateProvinceOptions(select, regionValue) {
  const currentValue = select.value;
  select.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = regionValue ? 'Seleziona provincia' : 'Seleziona prima una regione';
  placeholder.disabled = !regionValue;
  placeholder.selected = true;
  select.appendChild(placeholder);

  if (!regionValue) {
    select.disabled = true;
    return;
  }

  select.disabled = false;

  const provinces = regionProvinceMap[regionValue] || [];
  provinces.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
  });

  if (currentValue) {
    select.value = currentValue;
  }
}

function populateProvinceSelects() {
  const selects = document.querySelectorAll('select[data-populate="province"]');
  selects.forEach(select => {
    const regionSelectorId = select.dataset.regionSelector;
    const regionSelect = regionSelectorId ? document.getElementById(regionSelectorId) : null;
    const regionValue = regionSelect?.value || '';

    populateProvinceOptions(select, regionValue);

    if (regionSelect) {
      regionSelect.addEventListener('change', event => {
        populateProvinceOptions(select, event.target.value);
      });
    }
  });
}

export function populateLocationSelectors() {
  populateRegionSelects();
  populateProvinceSelects();
}
