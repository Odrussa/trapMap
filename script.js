let provinces = {};

// Carica artisti dal JSON
fetch('artists.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(a => {
      let provName = a.province.trim();
      if(!provinces[provName]) provinces[provName] = [];
      provinces[provName].push(a);
    });
  });

// Funzione overlay
function openOverlay(artists){
  const overlay = document.getElementById('artist-overlay');
  const cardsDiv = document.getElementById('artist-cards');
  cardsDiv.innerHTML = '';

  artists.forEach(a => {
    let card = document.createElement('div');
    card.classList.add('artist-card-overlay');
    card.innerHTML = `
      <h3>${a.name}</h3>
      <p><strong>Crew:</strong> ${a.crew}</p>
      <p>${a.bio}</p>
      <a href="${a.spotify}" target="_blank">Ascolta su Spotify</a>
    `;
    cardsDiv.appendChild(card);
  });

  overlay.classList.remove('hidden');
}

// Chiudi overlay
document.getElementById('close-overlay').addEventListener('click', () => {
  document.getElementById('artist-overlay').classList.add('hidden');
});

// Collegamento ID (dallo SVG) -> chiave nel JSON
const provinceMap = {
  MILANO: "Milano",
  ROMA: "Roma",
  NAPOLI: "Napoli",
  TRAPANI: "Trapani"
  // aggiungi tutte le altre province
};

// Evento click sulle province
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('svg path').forEach(path => {
    path.addEventListener('click', () => {
      const provName = provinceMap[path.id.toUpperCase()];
      if (provinces[provName]) {
        openOverlay(provinces[provName]);
      } else {
        alert("Nessun artista registrato in questa provincia 😢");
      }
    });
  });
});

