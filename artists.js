// Recupera la provincia dalla query string
const params = new URLSearchParams(window.location.search);
const province = params.get('province') || '';

// Mostra titolo e artisti
document.getElementById('page-title').textContent = province
  ? `Artisti della provincia di ${province}`
  : 'Artisti della provincia';

const isSafeHttpUrl = (value) => {
  if (typeof value !== 'string') {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (e) {
    return false;
  }
};

const isSafeImagePath = (value) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return false;
  }

  if (value.startsWith('//') || value.toLowerCase().startsWith('javascript:')) {
    return false;
  }

  if (isSafeHttpUrl(value)) {
    return true;
  }

  return /^[\w\-./]+$/.test(value);
};

const createSocialLink = (url, label) => {
  if (!isSafeHttpUrl(url)) {
    return null;
  }

  const link = document.createElement('a');
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = label;
  return link;
};

fetch(`artists.php?province=${encodeURIComponent(province)}`)
  .then((res) => res.json())
  .then((data) => {
    const artistsDiv = document.getElementById('artist-cards');

    if (!Array.isArray(data) || data.length === 0) {
      artistsDiv.textContent = 'Nessun artista registrato in questa provincia 😢';
      return;
    }

    data.forEach((artist) => {
      const card = document.createElement('div');
      card.classList.add('artist-card');

      const image = document.createElement('img');
      image.src = isSafeImagePath(artist.immagine) ? artist.immagine : 'default.jpg';
      image.alt = artist.nome || 'Artista';
      card.appendChild(image);

      const title = document.createElement('h3');
      title.textContent = artist.nome || 'Artista senza nome';
      card.appendChild(title);

      const alias = document.createElement('p');
      const aliasLabel = document.createElement('strong');
      aliasLabel.textContent = 'Alias:';
      alias.appendChild(aliasLabel);
      alias.append(' ');
      alias.append(artist.alias || '—');
      card.appendChild(alias);

      const provinceParagraph = document.createElement('p');
      const provinceLabel = document.createElement('strong');
      provinceLabel.textContent = 'Provincia:';
      provinceParagraph.appendChild(provinceLabel);
      provinceParagraph.append(` ${artist.provincia || '—'}`);
      card.appendChild(provinceParagraph);

      const socialContainer = document.createElement('div');
      socialContainer.classList.add('social-links');

      const spotifyLink = createSocialLink(artist.spotify, 'Spotify');
      const soundcloudLink = createSocialLink(artist.soundcloud, 'SoundCloud');
      const instagramLink = createSocialLink(artist.instagram, 'Instagram');

      [spotifyLink, soundcloudLink, instagramLink].forEach((link) => {
        if (link) {
          socialContainer.appendChild(link);
        }
      });

      card.appendChild(socialContainer);
      artistsDiv.appendChild(card);
    });
  })
  .catch((err) => {
    console.error('Errore nel fetch:', err);
  });
