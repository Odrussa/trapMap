import { provinceList } from './map.js';

function setFormFeedback(element, message, type = 'success') {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove('error', 'info');

  if (type === 'error' || type === 'info') {
    element.classList.add(type);
  }
}

function populateProvinceSelects(selects) {
  selects.forEach(select => {
    if (!select) {
      return;
    }

    const currentValue = select.value;
    select.innerHTML = '';

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Seleziona provincia';
    select.appendChild(placeholder);

    provinceList.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });

    if (currentValue) {
      select.value = currentValue;
    }
  });
}

export function initArtistCardModule(dom, { sessionApi, eventBus }) {
  const {
    modal,
    form,
    feedback,
    closeButton,
    openButtons = [],
    title,
    submitButton,
    provinceSelects = [],
    nameInput,
    aliasInput,
    provinceInput,
    categoryInput,
    spotifyInput,
    instagramInput,
    soundcloudInput,
    imageInput,
    previewName,
    previewAlias,
    previewLocation,
    previewCategory,
    previewLinks,
    previewImage,
    previewImageContainer
  } = dom;

  let mode = 'create';

  if (provinceSelects.length > 0) {
    populateProvinceSelects(provinceSelects);
  }

  function isModalOpen() {
    return modal && !modal.classList.contains('hidden');
  }

  function updatePreview() {
    if (!previewName || !previewAlias || !previewLocation || !previewCategory || !previewLinks) {
      return;
    }

    const nameValue = nameInput?.value.trim();
    const aliasValue = aliasInput?.value.trim().replace(/^@+/, '');
    const provinceValue = provinceInput?.value.trim();
    const categoryValue = categoryInput?.value;

    previewName.textContent = nameValue || 'Nome artista';
    previewAlias.textContent = aliasValue ? `@${aliasValue}` : '@alias';
    previewLocation.textContent = provinceValue || 'Provincia';

    let categoryLabel = 'Categoria';
    if (categoryValue === 'rapper') {
      categoryLabel = 'Rapper';
    } else if (categoryValue === 'producer') {
      categoryLabel = 'Producer';
    } else if (categoryValue === 'both') {
      categoryLabel = 'Rapper, Producer';
    }
    previewCategory.textContent = categoryLabel;

    previewLinks.innerHTML = '';
    const links = [
      { input: spotifyInput, label: 'Spotify' },
      { input: instagramInput, label: 'Instagram' },
      { input: soundcloudInput, label: 'SoundCloud' }
    ];

    links
      .map(item => ({ value: item.input?.value.trim(), label: item.label }))
      .filter(item => item.value)
      .forEach(item => {
        const listItem = document.createElement('li');
        listItem.textContent = item.label;
        previewLinks.appendChild(listItem);
      });
  }

  function updatePreviewImage(source) {
    if (!previewImage || !previewImageContainer) {
      return;
    }

    if (source) {
      previewImage.src = source;
      previewImage.hidden = false;
      previewImageContainer.classList.add('has-image');
    } else {
      previewImage.removeAttribute('src');
      previewImage.hidden = true;
      previewImageContainer.classList.remove('has-image');
    }
  }

  function applyModeLabels(currentMode) {
    if (title) {
      title.textContent = currentMode === 'edit' ? 'Modifica la tua artist card' : 'Crea la tua artist card';
    }
    if (submitButton) {
      submitButton.textContent = currentMode === 'edit' ? 'Aggiorna la mia artist card' : 'Crea la mia artist card';
    }
  }

  function openModal(openMode = 'create') {
    if (!modal) {
      return;
    }

    mode = openMode;
    applyModeLabels(mode);

    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden', 'false');
    setFormFeedback(feedback, '');
  }

  function closeModal() {
    if (!modal) {
      return;
    }

    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');

    if (mode === 'create') {
      form?.reset();
      updatePreviewImage(null);
      updatePreview();
    }

    setFormFeedback(feedback, '');
  }

  openButtons.forEach(button => {
    button?.addEventListener('click', () => {
      if (!sessionApi.ensureLoggedIn('Effettua il login per creare la tua artist card')) {
        return;
      }
      openModal('create');
    });
  });

  closeButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  eventBus.on('artistCard:open', payload => {
    if (!sessionApi.ensureLoggedIn('Effettua il login per gestire la tua artist card')) {
      return;
    }
    const requestedMode = payload?.mode === 'edit' ? 'edit' : 'create';
    openModal(requestedMode);
  });

  eventBus.on('app:escape', () => {
    if (isModalOpen()) {
      closeModal();
    }
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setFormFeedback(feedback, 'Ricontrolla i campi evidenziati', 'error');
      return;
    }

    const formData = new FormData(form);
    setFormFeedback(feedback, 'Invio in corso...', 'info');

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

        setFormFeedback(feedback, errorMessage, 'error');
        sessionApi.showNotification(errorMessage, 'warning');
        return;
      }

      const successMessage = result.message || 'La tua artist card è stata inviata ✅';
      setFormFeedback(feedback, successMessage);
      sessionApi.showNotification(successMessage);
      sessionApi.markHasArtistCard(true);
      form.reset();
      updatePreviewImage(null);
      updatePreview();

      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (error) {
      console.error('Artist card creation error:', error);
      setFormFeedback(feedback, 'Si è verificato un errore inatteso. Riprova più tardi.', 'error');
      sessionApi.showNotification('Si è verificato un errore inatteso. Riprova più tardi.', 'warning');
    }
  });

  const previewInputs = [
    { element: nameInput, event: 'input' },
    { element: aliasInput, event: 'input' },
    { element: provinceInput, event: 'change' },
    { element: categoryInput, event: 'change' },
    { element: spotifyInput, event: 'input' },
    { element: instagramInput, event: 'input' },
    { element: soundcloudInput, event: 'input' }
  ];

  previewInputs.forEach(item => {
    item.element?.addEventListener(item.event, updatePreview);
  });

  imageInput?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (!file) {
      updatePreviewImage(null);
      return;
    }

    const reader = new FileReader();
    reader.onload = loadEvent => {
      updatePreviewImage(loadEvent.target?.result);
    };
    reader.readAsDataURL(file);
  });

  updatePreview();
}
