const defaultSession = {
  loggedIn: false,
  username: '',
  hasArtistCard: false
};

export function initSessionModule(dom, { eventBus }) {
  const {
    menuToggle,
    navElement,
    navList,
    loginNavItem,
    registerNavItem,
    profilePanel,
    profilePanelBackdrop,
    profileUsernameLabel,
    profileActionSuggest,
    profileActionCreateCard,
    profileActionMySuggestions,
    profileActionEditCard,
    profileActionLogout,
    closeProfilePanelButton,
    globalNotification
  } = dom;

  const userSession = { ...defaultSession };
  let profileMenuItem = null;
  let profileButton = null;
  let notificationTimeout = null;

  function toggleAuthLinks(show) {
    const display = show ? '' : 'none';
    if (loginNavItem) {
      loginNavItem.style.display = display;
    }
    if (registerNavItem) {
      registerNavItem.style.display = display;
    }
  }

  function applyNavProfileState(enable) {
    navElement?.classList.toggle('nav-with-profile', enable);
  }

  function showNotification(message, type = 'success') {
    if (!globalNotification || !message) {
      return;
    }

    globalNotification.textContent = message;
    globalNotification.classList.remove('hidden', 'warning', 'show');

    if (type === 'warning') {
      globalNotification.classList.add('warning');
    }

    requestAnimationFrame(() => {
      globalNotification.classList.add('show');
    });

    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
    }

    notificationTimeout = setTimeout(() => {
      globalNotification.classList.remove('show');
    }, 3400);
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

  function closeProfilePanel() {
    if (profilePanel?.classList.contains('show')) {
      profilePanel.classList.remove('show');
      profilePanel.setAttribute('aria-hidden', 'true');
    }

    if (profilePanelBackdrop && !profilePanelBackdrop.classList.contains('hidden')) {
      profilePanelBackdrop.classList.add('hidden');
      profilePanelBackdrop.setAttribute('aria-hidden', 'true');
    }

    profileButton?.setAttribute('aria-expanded', 'false');
  }

  function openProfilePanel() {
    if (!userSession.loggedIn) {
      requireLogin('Accedi per gestire il tuo profilo');
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
          Object.assign(userSession, { ...defaultSession });
          clearProfileMenu();
          toggleAuthLinks(true);
          showNotification('Logout effettuato. A presto!', 'warning');
          checkUserSession();
        } else if (data.error) {
          console.error('Errore logout:', data.error);
          showNotification('Impossibile completare il logout', 'warning');
        }
      })
      .catch(err => {
        console.error('Errore logout:', err);
        showNotification('Errore di connessione durante il logout', 'warning');
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

  function checkUserSession() {
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
          Object.assign(userSession, { ...defaultSession });
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

  function requireLogin(message) {
    showNotification(message, 'warning');
    eventBus.emit('auth:open-login');
  }

  function ensureLoggedIn(message) {
    if (!userSession.loggedIn) {
      if (message) {
        requireLogin(message);
      } else {
        eventBus.emit('auth:open-login');
      }
      return false;
    }
    return true;
  }

  function markHasArtistCard(value = true) {
    userSession.hasArtistCard = Boolean(value);
    updateProfilePanelState();
  }

  function getSessionSnapshot() {
    return { ...userSession };
  }

  menuToggle?.addEventListener('click', () => {
    navList?.classList.toggle('show');
  });

  profileActionSuggest?.addEventListener('click', () => {
    if (!ensureLoggedIn('Accedi per inviare un suggerimento')) {
      return;
    }
    closeProfilePanel();
    eventBus.emit('suggestions:open');
  });

  profileActionCreateCard?.addEventListener('click', () => {
    if (!ensureLoggedIn('Effettua il login per creare la tua artist card')) {
      return;
    }
    closeProfilePanel();
    eventBus.emit('artistCard:open', { mode: 'create' });
  });

  profileActionMySuggestions?.addEventListener('click', () => {
    showNotification('La sezione "I miei suggerimenti" arriverà presto', 'warning');
  });

  profileActionEditCard?.addEventListener('click', () => {
    if (!ensureLoggedIn()) {
      return;
    }
    closeProfilePanel();
    eventBus.emit('artistCard:open', { mode: 'edit' });
  });

  profileActionLogout?.addEventListener('click', event => {
    closeProfilePanel();
    handleLogout(event);
  });

  closeProfilePanelButton?.addEventListener('click', closeProfilePanel);
  profilePanelBackdrop?.addEventListener('click', closeProfilePanel);

  eventBus.on('app:escape', () => {
    closeProfilePanel();
  });

  eventBus.on('auth:login-success', () => {
    checkUserSession();
  });

  // Initial state
  toggleAuthLinks(true);
  updateProfilePanelState();

  return {
    isLoggedIn: () => userSession.loggedIn,
    hasArtistCard: () => userSession.hasArtistCard,
    ensureLoggedIn,
    requireLogin,
    showNotification,
    markHasArtistCard,
    refreshSession: checkUserSession,
    getSessionSnapshot
  };
}
