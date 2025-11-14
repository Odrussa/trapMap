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
    const wrapper = document.createElement('div');
    wrapper.classList.add('artist-card');
    const core = this.createCardCore(artist, {
      placeholderText: 'Immagine non disponibile',
      linksAsAnchors: true
    });
    wrapper.appendChild(core);
    return wrapper;
  }

  static createHighlightCard(artist) {
    const card = this.createStandardCard(artist);
    card.classList.add('artist-card--highlight');
    return card;
  }

  static createPreviewCard(artist = {}) {
    const preview = document.createElement('div');
    preview.classList.add('artist-preview');
    const core = this.createCardCore(artist, {
      placeholderText: "Carica un'immagine per la tua card",
      linksAsAnchors: false
    });
    preview.appendChild(core);
    return preview;
  }

  static createCardCore(artist = {}, options = {}) {
    const {
      placeholderText = 'Immagine non disponibile',
      fallbackImage = null,
      linksAsAnchors = true
    } = options;

    const core = document.createElement('div');
    core.classList.add('artist-card-core');

    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('artist-card-image');

    const image = document.createElement('img');
    image.alt = artist.nome || 'Artista TrapMap';

    const imageSource = artist.immagine || fallbackImage;
    if (imageSource) {
      image.src = imageSource;
      imageWrapper.classList.add('has-image');
    } else {
      image.hidden = true;
    }

    const placeholder = document.createElement('span');
    placeholder.classList.add('artist-card-placeholder');
    placeholder.textContent = placeholderText;

    imageWrapper.appendChild(image);
    imageWrapper.appendChild(placeholder);
    core.appendChild(imageWrapper);

    const body = document.createElement('div');
    body.classList.add('artist-card-body');

    const title = document.createElement('h3');
    title.classList.add('artist-card-title');
    title.textContent = artist.nome || 'Nome artista';
    body.appendChild(title);

    const aliasValue = typeof artist.alias === 'string' ? artist.alias.trim().replace(/^@+/, '') : '';
    const alias = document.createElement('p');
    alias.classList.add('artist-card-meta');
    alias.textContent = aliasValue ? `@${aliasValue}` : '@alias';
    body.appendChild(alias);

    const locationParts = [];
    if (artist.provincia) {
      locationParts.push(artist.provincia);
    }
    if (artist.regione) {
      locationParts.push(artist.regione);
    }
    const locationText = locationParts.length > 0 ? locationParts.join(' • ') : 'Provincia non disponibile';

    const provinceInfo = document.createElement('p');
    provinceInfo.classList.add('artist-card-meta');
    provinceInfo.textContent = locationText;
    body.appendChild(provinceInfo);

    const categoryValue = Array.isArray(artist.categorie)
      ? artist.categorie.filter(Boolean).join(' • ')
      : artist.categorie;
    const categoryInfo = document.createElement('p');
    categoryInfo.classList.add('artist-card-category');
    categoryInfo.textContent = categoryValue || 'Categoria';
    body.appendChild(categoryInfo);

    const linksWrapper = document.createElement('div');
    linksWrapper.classList.add('artist-card-links');

    const links = [
      { url: artist.spotify, label: 'Spotify' },
      { url: artist.soundcloud, label: 'SoundCloud' },
      { url: artist.instagram, label: 'Instagram' }
    ];

    links.forEach(link => {
      if (!link.url) {
        return;
      }

      if (linksAsAnchors) {
        const anchor = document.createElement('a');
        anchor.classList.add('artist-card-link');
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = link.label;
        linksWrapper.appendChild(anchor);
      } else {
        const chip = document.createElement('span');
        chip.classList.add('artist-card-link');
        chip.textContent = link.label;
        linksWrapper.appendChild(chip);
      }
    });

    body.appendChild(linksWrapper);
    core.appendChild(body);

    return core;
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
