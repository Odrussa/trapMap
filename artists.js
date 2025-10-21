// Recupera la provincia dalla query string
const params = new URLSearchParams(window.location.search);
const province = params.get('province'); 

// Mostra titolo e artisti
document.getElementById('page-title').textContent = `Artisti della provincia di ${province}`;

fetch(`artists.php?province=${encodeURIComponent(province)}`)
  .then(res => res.json())
  .then(data => {
    console.log(data); // 👀 utile per controllare cosa arriva dal PHP

    const artistsDiv = document.getElementById('artist-cards');

    if (data.length === 0) {
      artistsDiv.innerHTML = '<p>Nessun artista registrato in questa provincia 😢</p>';
      return;
    }

    data.forEach(a => {
      const card = document.createElement('div');
      card.classList.add('artist-card');
      card.innerHTML = `
        <img src="${a.immagine || 'default.jpg'}" alt="${a.nome}">
        <h3>${a.nome}</h3>
        <p><strong>Alias:</strong> ${a.alias || '—'}</p>
        <p><strong>Provincia:</strong> ${a.provincia}</p>
        <div class="social-links">
          ${a.spotify ? `<a href="${a.spotify}" target="_blank">Spotify</a>` : ''}
          ${a.soundcloud ? `<a href="${a.soundcloud}" target="_blank">SoundCloud</a>` : ''}
          ${a.instagram ? `<a href="${a.instagram}" target="_blank">Instagram</a>` : ''}
        </div>
      `;
      artistsDiv.appendChild(card);
    });
  })
  .catch(err => {
    console.error('Errore nel fetch:', err);
  });
