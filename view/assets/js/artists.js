// Recupera la provincia dalla query string
const params = new URLSearchParams(window.location.search);
const province = params.get('province');

document.getElementById('page-title').textContent = province
  ? `Artisti della provincia di ${province}`
  : 'Artisti della provincia';

/**
 * Factory responsabile della creazione delle card artista.
 * Permette di estendere facilmente nuovi layout mantenendo
 * il codice della view pulito e focalizzato sulla logica.
 */
class ArtistCardFactory {
  static createCard(type, artist) {
    switch (type) {
      case 'highlight':
        return this.createHighlightCard(artist);
      case 'standard':
      default:
        return this.createStandardCard(artist);
    }
  }

  static createStandardCard(artist) {
    const card = document.createElement('div');
    card.classList.add('artist-card');

    const image = document.createElement('img');
    image.src = artist.immagine || 'default.jpg';
    image.alt = artist.nome;
    card.appendChild(image);

    const title = document.createElement('h3');
    title.textContent = artist.nome;
    card.appendChild(title);

    const alias = document.createElement('p');
    alias.innerHTML = `<strong>Alias:</strong> ${artist.alias || '—'}`;
    card.appendChild(alias);

    const provinceInfo = document.createElement('p');
    provinceInfo.innerHTML = `<strong>Provincia:</strong> ${artist.provincia}`;
    card.appendChild(provinceInfo);

    const socials = document.createElement('div');
    socials.classList.add('social-links');
    this.appendSocialLink(socials, artist.spotify, 'Spotify');
    this.appendSocialLink(socials, artist.soundcloud, 'SoundCloud');
    this.appendSocialLink(socials, artist.instagram, 'Instagram');
    card.appendChild(socials);

    return card;
  }

  static createHighlightCard(artist) {
    const card = this.createStandardCard(artist);
    card.classList.add('artist-card--highlight');
    return card;
  }

  static appendSocialLink(wrapper, url, label) {
    if (!url) {
      return;
    }

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = label;
    wrapper.appendChild(link);
  }
}

fetch(`../controller/ArtistsController.php?province=${encodeURIComponent(province ?? '')}`)
  .then(res => {
    if (!res.ok) {
      throw new Error('Errore durante il recupero degli artisti');
    }
    return res.json();
  })
  .then(data => {
    const artistsDiv = document.getElementById('artist-cards');

    if (!Array.isArray(data) || data.length === 0) {
      artistsDiv.innerHTML = '<p>Nessun artista registrato in questa provincia 😢</p>';
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
