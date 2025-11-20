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
      case "preview":
        return this.createPreviewCard(artist);
      case "standard":
      default:
        return this.createStandardCard(artist);
    }
  }

  /* ===========================
     CARD STANDARD (griglia)
     =========================== */
  static createStandardCard(artist) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("artist-card", "artist-card-core");

    this.buildCardContent(wrapper, artist);

    return wrapper;
  }

  /* ===========================
     PREVIEW DEL FORM
     =========================== */
  static createPreviewCard(artist) {
    const outer = document.createElement("div");
    outer.classList.add("artist-preview");

    const core = document.createElement("div");
    core.classList.add("artist-card-core");

    this.buildCardContent(core, artist);

    outer.appendChild(core);
    return outer;
  }

  /* ===========================
     CONTENUTO DELLA CARD (CORE)
     =========================== */
  static buildCardContent(card, artist) {
    /* ---- IMMAGINE ---- */
    const imgWrapper = document.createElement("div");
    imgWrapper.classList.add("artist-card-image");
    const img = document.createElement("img");
    img.src = artist.immagine || "default.jpg";
    img.alt = artist.nome;
    imgWrapper.appendChild(img);
    card.appendChild(imgWrapper);

    /* ---- BODY ---- */
    const body = document.createElement("div");
    body.classList.add("artist-card-body");

    const title = document.createElement("h3");
    title.textContent = artist.nome;
    body.appendChild(title);

    if (artist.alias) {
      const alias = document.createElement("p");
      alias.classList.add("artist-card-alias");
      alias.textContent = `@${artist.alias}`;
      body.appendChild(alias);
    }

    if (artist.provincia) {
      const location = document.createElement("p");
      location.classList.add("artist-card-meta");
      location.textContent = artist.provincia;
      body.appendChild(location);
    }

    const category = document.createElement("p");
    category.classList.add("artist-card-category");
    category.textContent = artist.categorie || "—";
    body.appendChild(category);

    const links = document.createElement("ul");
    links.classList.add("artist-card-links");

    this.appendSocialLink(links, artist.spotify, "Spotify");
    this.appendSocialLink(links, artist.soundcloud, "SoundCloud");
    this.appendSocialLink(links, artist.instagram, "Instagram");

    body.appendChild(links);

    card.appendChild(body);
  }

  static appendSocialLink(wrapper, url, label) {
    if (!url) return;

    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = label;

    li.appendChild(link);
    wrapper.appendChild(li);
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
