import { provinceList, regionList } from './map.js';

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

function populateLocationOptions(selectElement) {
  if (!selectElement) {
    return;
  }

  selectElement.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Non specificato';
  selectElement.appendChild(placeholder);

  const provincesGroup = document.createElement('optgroup');
  provincesGroup.label = 'Province';
  provinceList.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    provincesGroup.appendChild(option);
  });
  selectElement.appendChild(provincesGroup);

  const regionGroup = document.createElement('optgroup');
  regionGroup.label = 'Regioni';
  regionList.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    regionGroup.appendChild(option);
  });
  selectElement.appendChild(regionGroup);
}

export function initSuggestionsModule(dom, { sessionApi, eventBus }) {
  const {
    modal,
    form,
    feedback,
    closeButton,
    openButtons = [],
    locationSelect
  } = dom;

  if (locationSelect) {
    populateLocationOptions(locationSelect);
  }

  function isModalOpen() {
    return modal && !modal.classList.contains('hidden');
  }

  function openModal() {
    if (!modal) {
      return;
    }

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
    form?.reset();
    setFormFeedback(feedback, '');
  }

  openButtons.forEach(button => {
    button?.addEventListener('click', () => {
      if (!sessionApi.ensureLoggedIn('Accedi per inviare un suggerimento')) {
        return;
      }
      openModal();
    });
  });

  closeButton?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => {
    if (event.target === modal) {
      closeModal();
    }
  });

  eventBus.on('suggestions:open', () => {
    if (!sessionApi.ensureLoggedIn('Accedi per inviare un suggerimento')) {
      return;
    }
    openModal();
  });

  eventBus.on('app:escape', () => {
    if (isModalOpen()) {
      closeModal();
    }
  });

  form?.addEventListener('submit', async event => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setFormFeedback(feedback, 'Completa i campi obbligatori evidenziati', 'error');
      return;
    }

    const formData = new FormData(form);
    const links = form.querySelectorAll('input[name="links"]');

    const payload = {
      nome_artista: formData.get('artist_name')?.toString().trim() || '',
      alias: formData.get('artist_alias')?.toString().trim() || '',
      provincia: formData.get('location')?.toString().trim() || '',
      categoria: formData.get('category')?.toString().trim() || '',
      instagram: links[0]?.value?.trim() || '',
      spotify: links[1]?.value?.trim() || '',
      soundcloud: links[2]?.value?.trim() || ''
    };

    setFormFeedback(feedback, 'Invio in corso...', 'info');

    try {
      const response = await fetch('../controller/SuggestionsController.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMessage = Array.isArray(result.errors) && result.errors.length > 0
          ? result.errors.join('\n')
          : 'Impossibile inviare il suggerimento.';

        setFormFeedback(feedback, errorMessage, 'error');
        sessionApi.showNotification(errorMessage, 'warning');
        return;
      }

      setFormFeedback(feedback, 'Suggerimento inviato con successo ✅');
      sessionApi.showNotification('Suggerimento inviato con successo ✅');
      form.reset();
      setTimeout(() => {
        closeModal();
      }, 900);
    } catch (error) {
      console.error('Errore invio suggerimento:', error);
      setFormFeedback(feedback, 'Si è verificato un errore inatteso. Riprova più tardi.', 'error');
      sessionApi.showNotification('Si è verificato un errore inatteso. Riprova più tardi.', 'warning');
    }
  });
}
