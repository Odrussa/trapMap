import { showGlobalNotification } from './notifications.js';
import { openSuggestionForm } from './suggestions.js';
import { openArtistCardForm, registerArtistCardCreatedCallback } from './artistCard.js';
import { openLogin } from './auth.js';

const navList = document.querySelector('header nav ul');

const profilePanel = document.getElementById('profilePanel');
const profilePanelBackdrop = document.getElementById('profilePanelBackdrop');
const profileUsernameLabel = document.getElementById('profileUsername');
const profileActionSuggest = document.getElementById('profileActionSuggest');
const profileActionCreateCard = document.getElementById('profileActionCreateCard');
const profileActionMySuggestions = document.getElementById('profileActionMySuggestions');
const profileActionEditCard = document.getElementById('profileActionEditCard');
const profileActionLogout = document.getElementById('profileActionLogout');
const closeProfilePanelButton = document.getElementById('closeProfilePanel');

const suggestArtistCta = document.getElementById('suggestArtistCta');
const createArtistCardCta = document.getElementById('createArtistCardCta');

const userSession = {
  loggedIn: false,
  username: '',
  hasArtistCard: false
};

let profileMenuItem = null;
let profileButton = null;

function toggleAuthLinks(show) {
  const loginLi = document.querySelector('a[onclick="openLogin()"]')?.parentElement;
  const registerLi = document.querySelector('a[onclick="openRegister()"]')?.parentElement;
  const display = show ? '' : 'none';

  if (loginLi) {
    loginLi.style.display = display;
  }

  if (registerLi) {
    registerLi.style.display = display;
  }
}

function applyNavProfileState(enable) {
  const nav = document.querySelector('header nav');
  if (nav) {
    nav.classList.toggle('nav-with-profile', enable);
  }
}

function setActionVisibility(buttonElement, shouldShow) {
  if (!buttonElement) {
    return;
  }

  const container = buttonElement.closest('li') || buttonElement;
  container.classList.toggle('is-hidden', !shouldShow);
  buttonElement.setAttribute('tabindex', shouldShow ? '0' : '-1');
  buttonElement.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
}

function updateProfilePanelState() {
  if (profileUsernameLabel) {
    profileUsernameLabel.textContent = userSession.username ? `@${userSession.username}` : '';
  }

  const isLogged = userSession.loggedIn;
  setActionVisibility(profileActionSuggest, isLogged);
  setActionVisibility(profileActionMySuggestions, isLogged);
  setActionVisibility(profileActionLogout, isLogged);
  setActionVisibility(profileActionCreateCard, isLogged && !userSession.hasArtistCard);
  setActionVisibility(profileActionEditCard, false);
}

function openProfilePanel() {
  if (!userSession.loggedIn) {
    openLogin();
    return;
  }

  updateProfilePanelState();

  if (profilePanel) {
    profilePanel.classList.add('show');
    profilePanel.setAttribute('aria-hidden', 'false');
  }

  if (profilePanelBackdrop) {
    profilePanelBackdrop.classList.remove('hidden');
    profilePanelBackdrop.setAttribute('aria-hidden', 'false');
  }

  profileButton?.setAttribute('aria-expanded', 'true');

  const firstVisibleAction = profilePanel?.querySelector('.profile-panel-actions button[aria-hidden="false"]');
  firstVisibleAction?.focus({ preventScroll: true });
}

export function closeProfilePanel() {
  if (profilePanel && profilePanel.classList.contains('show')) {
    profilePanel.classList.remove('show');
    profilePanel.setAttribute('aria-hidden', 'true');
  }

  if (profilePanelBackdrop && !profilePanelBackdrop.classList.contains('hidden')) {
    profilePanelBackdrop.classList.add('hidden');
    profilePanelBackdrop.setAttribute('aria-hidden', 'true');
  }

  profileButton?.setAttribute('aria-expanded', 'false');
}

function clearProfileMenu() {
  if (profileMenuItem) {
    profileMenuItem.remove();
    profileMenuItem = null;
  }

  if (profileButton) {
    profileButton = null;
  }

  closeProfilePanel();
  applyNavProfileState(false);
}

function handleLogout(event) {
  event.preventDefault();

  fetch('../controller/LogoutController.php', {
    method: 'POST',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        userSession.loggedIn = false;
        userSession.username = '';
        userSession.hasArtistCard = false;
        clearProfileMenu();
        toggleAuthLinks(true);
        showGlobalNotification('Logout effettuato. A presto!', 'warning');
        checkUserSession();
      } else if (data.error) {
        console.error('Errore logout:', data.error);
        showGlobalNotification('Impossibile completare il logout', 'warning');
      }
    })
    .catch(err => {
      console.error('Errore logout:', err);
      showGlobalNotification('Errore di connessione durante il logout', 'warning');
    });
}

function showProfileMenu(username) {
  toggleAuthLinks(false);

  if (!navList) {
    return;
  }

  applyNavProfileState(true);

  if (!profileMenuItem) {
    profileMenuItem = document.createElement('li');
    profileMenuItem.className = 'profile-menu';

    profileButton = document.createElement('button');
    profileButton.type = 'button';
    profileButton.className = 'profile-button';
    profileButton.setAttribute('aria-haspopup', 'true');
    profileButton.setAttribute('aria-expanded', 'false');
    profileButton.setAttribute('aria-controls', 'profilePanel');
    profileButton.setAttribute('aria-label', 'Apri il pannello personale');
    profileButton.innerHTML = '<span aria-hidden="true">👤</span>';

    profileButton.addEventListener('click', event => {
      event.stopPropagation();
      openProfilePanel();
    });

    profileMenuItem.appendChild(profileButton);
    navList.appendChild(profileMenuItem);
  }

  if (profileButton) {
    const labelName = username || 'utente';
    profileButton.setAttribute('aria-label', `Apri il pannello personale di ${labelName}`);
    profileButton.title = `Profilo ${labelName}`;
  }

  updateProfilePanelState();
}

function applySessionData(data) {
  userSession.loggedIn = true;
  userSession.username = data.username || '';
  userSession.hasArtistCard = Boolean(data.has_artist_card);
  showProfileMenu(userSession.username || 'Profilo');
}

export function checkUserSession() {
  fetch('../controller/UserInfoController.php', { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Risposta non valida dal server');
      }
      return response.json();
    })
    .then(data => {
      if (data.logged_in) {
        applySessionData(data);
      } else {
        userSession.loggedIn = false;
        userSession.username = '';
        userSession.hasArtistCard = false;
        toggleAuthLinks(true);
        clearProfileMenu();
      }
      updateProfilePanelState();
    })
    .catch(err => {
      console.error('Errore durante il controllo della sessione:', err);
      toggleAuthLinks(true);
      clearProfileMenu();
    });
}

function handleSuggestAction() {
  if (!userSession.loggedIn) {
    showGlobalNotification('Accedi per inviare un suggerimento', 'warning');
    openLogin();
    return;
  }

  closeProfilePanel();
  openSuggestionForm();
}

function handleCreateCardAction() {
  if (!userSession.loggedIn) {
    showGlobalNotification('Effettua il login per creare la tua artist card', 'warning');
    openLogin();
    return;
  }

  closeProfilePanel();
  openArtistCardForm('create');
}

function handleMySuggestionsAction() {
  showGlobalNotification('La sezione "I miei suggerimenti" arriverà presto', 'warning');
}

function handleEditCardAction() {
  if (!userSession.loggedIn) {
    openLogin();
    return;
  }
  closeProfilePanel();
  openArtistCardForm('edit');
}

function bindProfileActions() {
  profileActionSuggest?.addEventListener('click', handleSuggestAction);
  profileActionCreateCard?.addEventListener('click', handleCreateCardAction);
  profileActionMySuggestions?.addEventListener('click', handleMySuggestionsAction);
  profileActionEditCard?.addEventListener('click', handleEditCardAction);
  profileActionLogout?.addEventListener('click', event => {
    closeProfilePanel();
    handleLogout(event);
  });
}

function bindPanelCloseActions() {
  closeProfilePanelButton?.addEventListener('click', closeProfilePanel);
  profilePanelBackdrop?.addEventListener('click', closeProfilePanel);
}

function bindCtaActions() {
  suggestArtistCta?.addEventListener('click', handleSuggestAction);
  createArtistCardCta?.addEventListener('click', handleCreateCardAction);
}

export function initSessionUI() {
  bindProfileActions();
  bindPanelCloseActions();
  bindCtaActions();

  registerArtistCardCreatedCallback(() => {
    userSession.hasArtistCard = true;
    updateProfilePanelState();
  });
}

export function isUserLoggedIn() {
  return userSession.loggedIn;
}

export function getUserSession() {
  return { ...userSession };
}

export function handleEscapeKey() {
  closeProfilePanel();
}
