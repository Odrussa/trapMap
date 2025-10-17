// Recupera la provincia dalla query string
const params = new URLSearchParams(window.location.search);
const province = params.get('province'); 

// Mostra titolo e artisti
document.getElementById('page-title').textContent = `Artisti della provincia di ${province}`;

fetch('artists.json')
  .then(res => res.json())
  .then(data => {
    const artistsDiv = document.getElementById('artist-cards');
    const filtered = data.filter(a => a.province.trim().toLowerCase() === province.trim().toLowerCase());

    if (filtered.length === 0) {
      artistsDiv.innerHTML = '<p>Nessun artista registrato in questa provincia 😢</p>';
      return;
    }

    filtered.forEach(a => {
      const card = document.createElement('div');
      card.classList.add('artist-card');
      card.innerHTML = `
        <img src="${a.image}" alt="${a.name}">
        <h3>${a.name}</h3>
        <p><strong>Crew:</strong> ${a.crew}</p>
        <div class="social-links">
          ${a.spotify ? `<a href="${a.spotify}" target="_blank">Spotify</a>` : ''}
          ${a.soundcloud ? `<a href="${a.soundcloud}" target="_blank">SoundCloud</a>` : ''}
          ${a.instagram ? `<a href="${a.instagram}" target="_blank">Instagram</a>` : ''}
        </div>
      `;
      artistsDiv.appendChild(card);
    });
  });
