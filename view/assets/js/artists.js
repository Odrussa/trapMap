
// ===============================================================
//   PAGINA ARTISTI
// ===============================================================

// Recupera la regione dalla query string
const params = new URLSearchParams(window.location.search);
const region = params.get('region');


document.getElementById('page-title').textContent = region
  ? `Artisti della regione ${region}`
  : `Artisti della regione`;


//Aggancio la select province
const provinceSelect = document.getElementById("artistProvince");

//Popolo solo le province di quella regione
populateProvinceOptions(provinceSelect, region);


fetch(`../controller/ArtistsController.php?region=${encodeURIComponent(region ?? '')}`)
  .then(res => {
    if (!res.ok) {
      throw new Error('Errore durante il recupero degli artisti');
    }
    return res.json();
  })
  .then(data => {
    const artistsDiv = document.getElementById('artist-cards');

    if (!Array.isArray(data) || data.length === 0) {
      artistsDiv.innerHTML = '<p>Nessun artista registrato in questa regione 😢</p>';
      return;
    }

    data.forEach(artist => {
      const card = ArtistCardFactory.createCard('standard', artist);
      artistsDiv.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Errore nel fetch:', err);
  });
