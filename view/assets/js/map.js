import * as locationUtils from './location-utils.js';

// ===============================================================
//   NAVIGAZIONE REGIONI
// ===============================================================

function apriPaginaArtisti(regione) {
  window.location.href = `artists.html?region=${encodeURIComponent(regione)}`;
}


//interazione con la mappa
function setupRegionInteractions(svgElement) {
  const tooltip = document.getElementById('tooltip');
  if (!svgElement || !tooltip) {
    return;
  }

  const regions = svgElement.querySelectorAll('path[id]');

  regions.forEach(path => {
    const regionId = path.id;
    const regionName = locationUtils.regionMap[regionId]; // ← FIX

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
      } else {
        alert('Nessuna regione associata a questo ID 😢');
      }
    });
  });
}



// ===============================================================
//   CARICAMENTO MAPPA ITALIA (REGIONI ATTIVE)
// ===============================================================

export function loadItalyMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) return;

  fetch('assets/img/it.svg')
    .then(response => response.text())
    .then(svgText => {
      const sanitizedSvg = svgText.replace(/<\?xml[^>]*?>/i, '');
      mapContainer.innerHTML = sanitizedSvg;

      const svgElement = mapContainer.querySelector('svg');
      if (svgElement) {
        svgElement.classList.add('italy-map');
        setupRegionInteractions(svgElement);
      }
    })
    .catch(err => console.error("Errore durante il caricamento della mappa:", err));
}
