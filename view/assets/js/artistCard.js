import { setFormFeedback, showGlobalNotification } from './notifications.js';

const artistCardModal = document.getElementById('artistCardModal');
const artistCardForm = document.getElementById('artistCardForm');
const artistCardFeedback = document.getElementById('artistCardFeedback');
const artistCardTitle = document.getElementById('artistCardTitle');
const artistCardSubmit = document.getElementById('artistCardSubmit');
const closeArtistCardButton = document.getElementById('closeArtistCardForm');

const artistNameInput = document.getElementById('artistName');
const artistAliasInput = document.getElementById('artistAlias');
const artistRegionInput = document.getElementById('artistRegion');
const artistProvinceInput = document.getElementById('artistProvince');
const artistCategoryInput = document.getElementById('artistCategory');
const artistSpotifyInput = document.getElementById('artistSpotify');
const artistInstagramInput = document.getElementById('artistInstagram');
const artistSoundcloudInput = document.getElementById('artistSoundcloud');
const artistImageInput = document.getElementById('artistImage');

const artistPreviewName = document.getElementById('artistPreviewName');
const artistPreviewAlias = document.getElementById('artistPreviewAlias');
const artistPreviewLocation = document.getElementById('artistPreviewLocation');
const artistPreviewCategory = document.getElementById('artistPreviewCategory');
const artistPreviewLinks = document.getElementById('artistPreviewLinks');
const artistPreviewImage = document.getElementById('artistPreviewImage');
const artistPreviewImageContainer = document.getElementById('artistPreviewImageContainer');

let artistCardMode = 'create';
const artistCardCreatedCallbacks = [];

export function registerArtistCardCreatedCallback(callback) {
  if (typeof callback === 'function') {
    artistCardCreatedCallbacks.push(callback);
  }
}

export function openArtistCardForm(mode = 'create') {
  if (!artistCardModal) {
    return;
  }

  artistCardMode = mode;

  if (artistCardTitle) {
    artistCardTitle.textContent = mode === 'edit' ? 'Modifica la tua artist card' : 'Crea la tua artist card';
  }

  if (artistCardSubmit) {
    artistCardSubmit.textContent = mode === 'edit' ? 'Aggiorna la mia artist card' : 'Crea la mia artist card';
  }

  artistCardModal.classList.remove('hidden');
  artistCardModal.setAttribute('aria-hidden', 'false');
  setFormFeedback(artistCardFeedback, '');
}

export function closeArtistCardForm() {
  if (!artistCardModal) {
    return;
  }

  artistCardModal.classList.add('hidden');
  artistCardModal.setAttribute('aria-hidden', 'true');

  if (artistCardMode === 'create') {
    artistCardForm?.reset();
    updateArtistPreviewImage(null);
    refreshArtistPreview();
  }

  setFormFeedback(artistCardFeedback, '');
}

export function isArtistCardFormOpen() {
  return Boolean(artistCardModal && !artistCardModal.classList.contains('hidden'));
}

function refreshArtistPreview() {
  if (!artistPreviewName || !artistPreviewAlias || !artistPreviewLocation || !artistPreviewCategory || !artistPreviewLinks) {
    return;
  }

  const nameValue = artistNameInput?.value.trim();
  const aliasValue = artistAliasInput?.value.trim().replace(/^@+/, '');
  const regionValue = artistRegionInput?.value.trim();
  const provinceValue = artistProvinceInput?.value.trim();
  const categoryValue = artistCategoryInput?.value;

  artistPreviewName.textContent = nameValue || 'Nome artista';
  artistPreviewAlias.textContent = aliasValue ? `@${aliasValue}` : '@alias';

  artistPreviewLocation.textContent = provinceValue || 'Provincia';

  let categoryLabel = 'Categoria';
  if (categoryValue === 'rapper') {
    categoryLabel = 'Rapper';
  } else if (categoryValue === 'producer') {
    categoryLabel = 'Producer';
  } else if (categoryValue === 'both') {
    categoryLabel = 'Rapper, Producer';
  }
  artistPreviewCategory.textContent = categoryLabel;

  artistPreviewLinks.innerHTML = '';
  const links = [
    { input: artistSpotifyInput, label: 'Spotify' },
    { input: artistInstagramInput, label: 'Instagram' },
    { input: artistSoundcloudInput, label: 'SoundCloud' }
  ];

  links
    .map(item => ({ value: item.input?.value.trim(), label: item.label }))
    .filter(item => item.value)
    .forEach(item => {
      const listItem = document.createElement('li');
      listItem.textContent = item.label;
      artistPreviewLinks.appendChild(listItem);
    });
}

function updateArtistPreviewImage(source) {
  if (!artistPreviewImage || !artistPreviewImageContainer) {
    return;
  }

  if (source) {
    artistPreviewImage.src = source;
    artistPreviewImage.hidden = false;
    artistPreviewImageContainer.classList.add('has-image');
  } else {
    artistPreviewImage.removeAttribute('src');
    artistPreviewImage.hidden = true;
    artistPreviewImageContainer.classList.remove('has-image');
  }
}

function handleArtistImageChange(event) {
  const file = event.target.files?.[0];
  if (!file) {
    updateArtistPreviewImage(null);
    return;
  }

  const reader = new FileReader();
  reader.onload = loadEvent => {
    updateArtistPreviewImage(loadEvent.target?.result);
  };
  reader.readAsDataURL(file);
}

function attachPreviewListeners() {
  artistNameInput?.addEventListener('input', refreshArtistPreview);
  artistAliasInput?.addEventListener('input', refreshArtistPreview);
  artistRegionInput?.addEventListener('change', refreshArtistPreview);
  artistProvinceInput?.addEventListener('change', refreshArtistPreview);
  artistCategoryInput?.addEventListener('change', refreshArtistPreview);
  artistSpotifyInput?.addEventListener('input', refreshArtistPreview);
  artistInstagramInput?.addEventListener('input', refreshArtistPreview);
  artistSoundcloudInput?.addEventListener('input', refreshArtistPreview);
  artistImageInput?.addEventListener('change', handleArtistImageChange);
}

function handleArtistCardSubmit() {
  artistCardForm?.addEventListener('submit', async event => {
    event.preventDefault();

    if (!artistCardForm.reportValidity()) {
      setFormFeedback(artistCardFeedback, 'Ricontrolla i campi evidenziati', 'error');
      return;
    }

    const formData = new FormData(artistCardForm);
    setFormFeedback(artistCardFeedback, 'Invio in corso...', 'info');

    try {
      const response = await fetch('../controller/ArtistCardController.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = Array.isArray(result.errors) && result.errors.length > 0
          ? result.errors.join('\n')
          : (result.message || 'Impossibile creare la tua artist card.');

        setFormFeedback(artistCardFeedback, errorMessage, 'error');
        showGlobalNotification(errorMessage, 'warning');
        return;
      }

      const successMessage = result.message || 'La tua artist card è stata inviata ✅';
      setFormFeedback(artistCardFeedback, successMessage);
      showGlobalNotification(successMessage);
      artistCardForm.reset();
      updateArtistPreviewImage(null);
      refreshArtistPreview();

      artistCardCreatedCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Errore callback artist card:', error);
        }
      });

      setTimeout(() => {
        closeArtistCardForm();
      }, 1200);
    } catch (error) {
      console.error('Artist card creation error:', error);
      setFormFeedback(artistCardFeedback, 'Si è verificato un errore inatteso. Riprova più tardi.', 'error');
      showGlobalNotification('Si è verificato un errore inatteso. Riprova più tardi.', 'warning');
    }
  });
}

export function initArtistCardForm() {
  closeArtistCardButton?.addEventListener('click', () => {
    closeArtistCardForm();
  });

  artistCardModal?.addEventListener('click', event => {
    if (event.target === artistCardModal) {
      closeArtistCardForm();
    }
  });

  attachPreviewListeners();
  refreshArtistPreview();
  handleArtistCardSubmit();
}
