import { initMenuToggle } from './menu.js';
import { initAuth, openLogin, openRegister } from './auth.js';
import { initSuggestionForm, closeSuggestionForm, isSuggestionFormOpen } from './suggestions.js';
import { initArtistCardForm, closeArtistCardForm, isArtistCardFormOpen } from './artistCard.js';
import { initSessionUI, checkUserSession, handleEscapeKey } from './session.js';
import { populateLocationSelectors, loadItalyMap } from './map.js';

function onDocumentReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
  } else {
    callback();
  }
}

function init() {
  initMenuToggle();
  initAuth();
  initSuggestionForm();
  initArtistCardForm();
  initSessionUI();
  populateLocationSelectors();

  window.openLogin = openLogin;
  window.openRegister = openRegister;

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      handleEscapeKey();
      if (isSuggestionFormOpen()) {
        closeSuggestionForm();
      }
      if (isArtistCardFormOpen()) {
        closeArtistCardForm();
      }
    }
  });

  onDocumentReady(() => {
    checkUserSession();
    loadItalyMap();
  });
}

init();
