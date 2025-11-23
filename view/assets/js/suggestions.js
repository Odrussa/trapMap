import { setFormFeedback, showGlobalNotification } from './notifications.js';

const suggestionModal = document.getElementById('suggestionModal');
const suggestionForm = document.getElementById('suggestionForm');
const suggestionFeedback = document.getElementById('suggestionFeedback');
const closeSuggestionButton = document.getElementById('closeSuggestionForm');

export function openSuggestionForm() {
  if (!suggestionModal) {
    return;
  }

  suggestionModal.classList.remove('hidden');
  suggestionModal.setAttribute('aria-hidden', 'false');
  setFormFeedback(suggestionFeedback, '');
}

export function closeSuggestionForm() {
  if (!suggestionModal) {
    return;
  }

  suggestionModal.classList.add('hidden');
  suggestionModal.setAttribute('aria-hidden', 'true');
  suggestionForm?.reset();
  setFormFeedback(suggestionFeedback, '');
}

export function isSuggestionFormOpen() {
  return Boolean(suggestionModal && !suggestionModal.classList.contains('hidden'));
}

export function initSuggestionForm() {
  closeSuggestionButton?.addEventListener('click', () => {
    closeSuggestionForm();
  });

  suggestionModal?.addEventListener('click', event => {
    if (event.target === suggestionModal) {
      closeSuggestionForm();
    }
  });

  suggestionForm?.addEventListener('submit', async event => {
    event.preventDefault();

    if (!suggestionForm.reportValidity()) {
      setFormFeedback(suggestionFeedback, 'Completa i campi obbligatori evidenziati', 'error');
      return;
    }

    const formData = new FormData(suggestionForm);
    const links = suggestionForm.querySelectorAll('input[name="links"]');

    const payload = {
      nome_artista: formData.get('artist_name')?.toString().trim() || '',
      alias: formData.get('artist_alias')?.toString().trim() || '',
      regione: formData.get('region')?.toString().trim() || '',
	  provincia: formData.get('province')?.toString().trim() || '',
      categoria: formData.get('category')?.toString().trim() || '',
      instagram: links[0]?.value?.trim() || '',
      spotify: links[1]?.value?.trim() || '',
      soundcloud: links[2]?.value?.trim() || ''
    };

    setFormFeedback(suggestionFeedback, 'Invio in corso...', 'info');

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

        setFormFeedback(suggestionFeedback, errorMessage, 'error');
        showGlobalNotification(errorMessage, 'warning');
        return;
      }

      setFormFeedback(suggestionFeedback, 'Suggerimento inviato con successo ✅');
      showGlobalNotification('Suggerimento inviato con successo ✅');
      suggestionForm.reset();
      setTimeout(() => {
        closeSuggestionForm();
      }, 900);
    } catch (error) {
      setFormFeedback(suggestionFeedback, 'Si è verificato un errore inatteso. Riprova più tardi.', 'error');
      showGlobalNotification('Si è verificato un errore inatteso. Riprova più tardi.', 'warning');
    }
  });
}
