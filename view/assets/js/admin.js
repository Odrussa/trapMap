const tableBody = document.getElementById('suggestionsTableBody');
const adminListStatus = document.getElementById('adminListStatus');
const adminFeedback = document.getElementById('adminFeedback');
const adminForm = document.getElementById('adminCreateCardForm');

const fields = {
  suggestionId: document.getElementById('adminSuggestionId'),
  nome: document.getElementById('adminArtistName'),
  alias: document.getElementById('adminArtistAlias'),
  provincia: document.getElementById('adminArtistProvince'),
  categoria: document.getElementById('adminArtistCategory'),
  instagram: document.getElementById('adminInstagramFacebook'),
  spotify: document.getElementById('adminSpotify'),
  soundcloud: document.getElementById('adminSoundcloud'),
  note: document.getElementById('adminNotes'),
};

let cachedSuggestions = [];

function setAdminFeedback(message, type = 'info') {
  if (!adminFeedback) {
    return;
  }

  adminFeedback.textContent = message;
  adminFeedback.classList.remove('error', 'success');

  if (type === 'error') {
    adminFeedback.classList.add('error');
  } else if (type === 'success') {
    adminFeedback.classList.add('success');
  }
}

function decodeHtml(value) {
  const parser = document.createElement('textarea');
  parser.innerHTML = value ?? '';
  return parser.value;
}

function renderSuggestions(list) {
  if (!tableBody) {
    return;
  }

  if (!Array.isArray(list) || list.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7">Nessun suggerimento disponibile.</td></tr>';
    return;
  }

  tableBody.innerHTML = list.map(item => {
    const contactLines = [
      item.instagram_facebook ? `<div><strong>Instagram/Facebook:</strong> <a href="${item.instagram_facebook}" target="_blank" rel="noopener">Profilo</a></div>` : '',
      item.spotify ? `<div><strong>Spotify:</strong> <a href="${item.spotify}" target="_blank" rel="noopener">Link</a></div>` : '',
      item.soundcloud ? `<div><strong>SoundCloud:</strong> <a href="${item.soundcloud}" target="_blank" rel="noopener">Link</a></div>` : '',
    ].filter(Boolean).join('');

    const note = item.commento ? item.commento : '—';
    const province = item.provincia ? item.provincia : '—';
    const badge = item.status ? `<span class="badge">${item.status}</span>` : '';

    return `
      <tr data-suggestion-id="${item.id}">
        <td>
          <strong>${item.nome_artista}</strong>
          ${item.alias ? `<div>${item.alias}</div>` : ''}
        </td>
        <td>${item.categoria || '—'}</td>
        <td>${province}</td>
        <td>${contactLines || '—'}</td>
        <td>${note}</td>
        <td>${badge}</td>
        <td><button type="button" class="primary" data-action="create" data-id="${item.id}">Crea card</button></td>
      </tr>
    `;
  }).join('');
}

function fillFormFromSuggestion(id) {
  const suggestion = cachedSuggestions.find(item => item.id === id);
  if (!suggestion) {
    setAdminFeedback('Suggerimento non trovato.', 'error');
    return;
  }

  fields.suggestionId.value = suggestion.id;
  fields.nome.value = decodeHtml(suggestion.nome_artista);
  fields.alias.value = decodeHtml(suggestion.alias);
  fields.provincia.value = decodeHtml(suggestion.provincia);
  fields.categoria.value = suggestion.categoria || '';
  fields.instagram.value = suggestion.instagram_facebook || '';
  fields.spotify.value = suggestion.spotify || '';
  fields.soundcloud.value = suggestion.soundcloud || '';
  fields.note.value = decodeHtml(suggestion.commento);

  setAdminFeedback(`Stai creando la card per ${suggestion.nome_artista}.`);
}

function attachTableListeners() {
  tableBody?.addEventListener('click', event => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.dataset.action === 'create') {
      const id = Number.parseInt(target.dataset.id || '', 10);
      if (Number.isNaN(id)) {
        setAdminFeedback('Suggerimento non valido.', 'error');
        return;
      }
      fillFormFromSuggestion(id);
    }
  });
}

async function loadSuggestions() {
  if (adminListStatus) {
    adminListStatus.textContent = 'Caricamento suggerimenti…';
  }

  try {
    const response = await fetch('../controller/AdminSuggestionsController.php', {
      credentials: 'same-origin'
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok || !payload.success) {
      const message = payload.errors?.join(' ') || 'Non è stato possibile recuperare i suggerimenti.';
      throw new Error(message);
    }

    cachedSuggestions = Array.isArray(payload.data) ? payload.data : [];
    renderSuggestions(cachedSuggestions);
    if (adminListStatus) {
      adminListStatus.textContent = `${cachedSuggestions.length} suggerimenti trovati.`;
    }
  } catch (error) {
    console.error('Errore durante il caricamento dei suggerimenti:', error);
    if (adminListStatus) {
      adminListStatus.textContent = error.message || 'Errore durante il caricamento.';
    }
    setAdminFeedback(error.message || 'Errore durante il recupero dei suggerimenti.', 'error');
    if (error.message && /autenticazione|accesso negato/i.test(error.message)) {
      setAdminFeedback('Accedi con un account amministratore per utilizzare questa area.', 'error');
    }
    renderSuggestions([]);
  }
}

adminForm?.addEventListener('submit', async event => {
  event.preventDefault();

  if (!adminForm.reportValidity()) {
    setAdminFeedback('Ricontrolla i campi obbligatori prima di procedere.', 'error');
    return;
  }

  const suggestionId = Number.parseInt(fields.suggestionId.value || '', 10);
  if (!suggestionId) {
    setAdminFeedback('Seleziona un suggerimento dalla lista.', 'error');
    return;
  }

  const payload = {
    suggestion_id: suggestionId,
    nome_artista: fields.nome.value.trim(),
    alias: fields.alias.value.trim(),
    provincia: fields.provincia.value.trim(),
    categoria: fields.categoria.value,
    instagram_facebook: fields.instagram.value.trim(),
    spotify: fields.spotify.value.trim(),
    soundcloud: fields.soundcloud.value.trim(),
  };

  setAdminFeedback('Creazione card in corso…');

  try {
    const response = await fetch('../controller/AdminSuggestionsController.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || !data.success) {
      const message = data.errors?.join(' ') || 'Errore durante la creazione della card.';
      throw new Error(message);
    }

    setAdminFeedback(data.message || 'Artist card creata con successo.', 'success');
    adminForm.reset();
    fields.note.value = '';
    await loadSuggestions();
  } catch (error) {
    console.error('Errore durante la creazione della card:', error);
    setAdminFeedback(error.message || 'Errore durante la creazione della card.', 'error');
    if (error.message && /autenticazione|accesso negato/i.test(error.message)) {
      setAdminFeedback('La sessione admin non è valida. Effettua di nuovo l’accesso.', 'error');
    }
  }
});

attachTableListeners();
loadSuggestions();
