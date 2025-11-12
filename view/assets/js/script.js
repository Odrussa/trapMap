const menuToggle = document.getElementById('menu-toggle');
const navList = document.querySelector('header nav ul');

menuToggle?.addEventListener('click', () => {
  navList?.classList.toggle('show');
});

const userSession = {
  loggedIn: false,
  username: '',
  isArtist: false,
  hasArtistCard: false
};

let profileMenuItem = null;
let profileButton = null;
let globalNotificationTimeout = null;
let artistCardMode = 'create';

const profilePanel = document.getElementById('profilePanel');
const profilePanelBackdrop = document.getElementById('profilePanelBackdrop');
const profileUsernameLabel = document.getElementById('profileUsername');
const profileActionSuggest = document.getElementById('profileActionSuggest');
const profileActionCreateCard = document.getElementById('profileActionCreateCard');
const profileActionMySuggestions = document.getElementById('profileActionMySuggestions');
const profileActionEditCard = document.getElementById('profileActionEditCard');
const profileActionLogout = document.getElementById('profileActionLogout');
const closeProfilePanelButton = document.getElementById('closeProfilePanel');

const suggestionModal = document.getElementById('suggestionModal');
const suggestionForm = document.getElementById('suggestionForm');
const suggestionFeedback = document.getElementById('suggestionFeedback');
const closeSuggestionButton = document.getElementById('closeSuggestionForm');
const suggestArtistCta = document.getElementById('suggestArtistCta');

const artistCardModal = document.getElementById('artistCardModal');
const artistCardForm = document.getElementById('artistCardForm');
const artistCardFeedback = document.getElementById('artistCardFeedback');
const artistCardTitle = document.getElementById('artistCardTitle');
const artistCardSubmit = document.getElementById('artistCardSubmit');
const closeArtistCardButton = document.getElementById('closeArtistCardForm');
const createArtistCardCta = document.getElementById('createArtistCardCta');

const globalNotification = document.getElementById('globalNotification');

const artistNameInput = document.getElementById('artistName');
const artistAliasInput = document.getElementById('artistAlias');
const artistProvinceInput = document.getElementById('artistProvince');
const artistRegionInput = document.getElementById('artistRegion');
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

function showGlobalNotification(message, type = 'success') {
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

  if (globalNotificationTimeout) {
    clearTimeout(globalNotificationTimeout);
  }

  globalNotificationTimeout = setTimeout(() => {
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
  setActionVisibility(profileActionCreateCard, isLogged && userSession.isArtist && !userSession.hasArtistCard);
  setActionVisibility(profileActionEditCard, isLogged && userSession.hasArtistCard);
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

function closeProfilePanel() {
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
        userSession.isArtist = false;
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
  userSession.isArtist = Boolean(data.is_artist);
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
        userSession.loggedIn = false;
        userSession.username = '';
        userSession.isArtist = false;
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

function openSuggestionForm() {
  if (!suggestionModal) {
    return;
  }

  suggestionModal.classList.remove('hidden');
  suggestionModal.setAttribute('aria-hidden', 'false');
  setFormFeedback(suggestionFeedback, '');
}

function closeSuggestionForm() {
  if (!suggestionModal) {
    return;
  }

  suggestionModal.classList.add('hidden');
  suggestionModal.setAttribute('aria-hidden', 'true');
  suggestionForm?.reset();
  setFormFeedback(suggestionFeedback, '');
}

function openArtistCardForm(mode = 'create') {
  if (!artistCardModal) {
    return;
  }

  artistCardMode = mode;

  if (artistCardTitle) {
    artistCardTitle.textContent = mode === 'edit' ? 'Modifica la tua artist card' : 'Crea la tua artist card';
  }

  if (artistCardSubmit) {
    artistCardSubmit.textContent = mode === 'edit' ? 'Aggiorna la mia artist card' : 'Pubblica la mia artist card';
  }

  artistCardModal.classList.remove('hidden');
  artistCardModal.setAttribute('aria-hidden', 'false');
  setFormFeedback(artistCardFeedback, '');
}

function closeArtistCardForm() {
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

  if (!userSession.isArtist && !userSession.hasArtistCard) {
    showGlobalNotification('Richiedi l’abilitazione come artista dal team TrapMap', 'warning');
    return;
  }

  closeProfilePanel();
  openArtistCardForm(userSession.hasArtistCard ? 'edit' : 'create');
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

profileActionSuggest?.addEventListener('click', handleSuggestAction);
profileActionCreateCard?.addEventListener('click', handleCreateCardAction);
profileActionMySuggestions?.addEventListener('click', handleMySuggestionsAction);
profileActionEditCard?.addEventListener('click', handleEditCardAction);
profileActionLogout?.addEventListener('click', event => {
  closeProfilePanel();
  handleLogout(event);
});

closeProfilePanelButton?.addEventListener('click', closeProfilePanel);
profilePanelBackdrop?.addEventListener('click', closeProfilePanel);

suggestArtistCta?.addEventListener('click', handleSuggestAction);
createArtistCardCta?.addEventListener('click', handleCreateCardAction);

closeSuggestionButton?.addEventListener('click', () => {
  closeSuggestionForm();
});

closeArtistCardButton?.addEventListener('click', () => {
  closeArtistCardForm();
});

suggestionModal?.addEventListener('click', event => {
  if (event.target === suggestionModal) {
    closeSuggestionForm();
  }
});

artistCardModal?.addEventListener('click', event => {
  if (event.target === artistCardModal) {
    closeArtistCardForm();
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    closeProfilePanel();
    if (suggestionModal && !suggestionModal.classList.contains('hidden')) {
      closeSuggestionForm();
    }
    if (artistCardModal && !artistCardModal.classList.contains('hidden')) {
      closeArtistCardForm();
    }
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
    provincia: formData.get('location')?.toString().trim() || '',
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

artistCardForm?.addEventListener('submit', event => {
  event.preventDefault();

  if (!artistCardForm.reportValidity()) {
    setFormFeedback(artistCardFeedback, 'Ricontrolla i campi evidenziati', 'error');
    return;
  }

  const successMessage = artistCardMode === 'edit'
    ? 'Artist card aggiornata ✅'
    : 'Artist card pubblicata ✅';

  setFormFeedback(artistCardFeedback, 'Salvataggio in corso...', 'info');

  setTimeout(() => {
    setFormFeedback(artistCardFeedback, successMessage);
    showGlobalNotification(successMessage);
    userSession.isArtist = true;
    userSession.hasArtistCard = true;
    updateProfilePanelState();
    if (artistCardMode === 'create') {
      setTimeout(() => {
        closeArtistCardForm();
      }, 1100);
    }
  }, 1000);
});

function refreshArtistPreview() {
  if (!artistPreviewName || !artistPreviewAlias || !artistPreviewLocation || !artistPreviewCategory || !artistPreviewLinks) {
    return;
  }

  const nameValue = artistNameInput?.value.trim();
  const aliasValue = artistAliasInput?.value.trim().replace(/^@+/, '');
  const provinceValue = artistProvinceInput?.value.trim();
  const regionValue = artistRegionInput?.value.trim();
  const categoryValue = artistCategoryInput?.value;

  artistPreviewName.textContent = nameValue || 'Nome artista';
  artistPreviewAlias.textContent = aliasValue ? `@${aliasValue}` : '@alias';

  let locationText = '';
  if (provinceValue && regionValue) {
    locationText = `${provinceValue} • ${regionValue}`;
  } else if (provinceValue || regionValue) {
    locationText = provinceValue || regionValue;
  }
  artistPreviewLocation.textContent = locationText || 'Provincia • Regione';

  let categoryLabel = 'Categoria';
  if (categoryValue === 'rapper') {
    categoryLabel = 'Rapper';
  } else if (categoryValue === 'producer') {
    categoryLabel = 'Producer';
  } else if (categoryValue === 'both') {
    categoryLabel = 'Rapper & Producer';
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

artistNameInput?.addEventListener('input', refreshArtistPreview);
artistAliasInput?.addEventListener('input', refreshArtistPreview);
artistProvinceInput?.addEventListener('change', refreshArtistPreview);
artistRegionInput?.addEventListener('change', refreshArtistPreview);
artistCategoryInput?.addEventListener('change', refreshArtistPreview);
artistSpotifyInput?.addEventListener('input', refreshArtistPreview);
artistInstagramInput?.addEventListener('input', refreshArtistPreview);
artistSoundcloudInput?.addEventListener('input', refreshArtistPreview);

artistImageInput?.addEventListener('change', event => {
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
});

refreshArtistPreview();

function apriPaginaArtisti(provincia) {
  window.location.href = `artists.html?province=${encodeURIComponent(provincia)}`;
}

const provinceMap = {
  L_AQUILA: "L'Aquila",
  TERAMO: 'Teramo',
  PESCARA: 'Pescara',
  CHIETI: 'Chieti',
  POTENZA: 'Potenza',
  MATERA: 'Matera',
  CATANZARO: 'Catanzaro',
  COSENZA: 'Cosenza',
  CROTONE: 'Crotone',
  REGGIO_CALABRIA: 'Reggio Calabria',
  VIBO_VALENTIA: 'Vibo Valentia',
  AVELLINO: 'Avellino',
  BENEVENTO: 'Benevento',
  CASERTA: 'Caserta',
  NAPOLI: 'Napoli',
  SALERNO: 'Salerno',
  BOLOGNA: 'Bologna',
  FERRARA: 'Ferrara',
  FORLI_CESENA: 'Forlì-Cesena',
  MODENA: 'Modena',
  PARMA: 'Parma',
  PIACENZA: 'Piacenza',
  RAVENNA: 'Ravenna',
  REGGIO_EMILIA: 'Reggio Emilia',
  RIMINI: 'Rimini',
  GORIZIA: 'Gorizia',
  PORDENONE: 'Pordenone',
  TRIESTE: 'Trieste',
  UDINE: 'Udine',
  FROSINONE: 'Frosinone',
  LATINA: 'Latina',
  RIETI: 'Rieti',
  ROMA: 'Roma',
  VITERBO: 'Viterbo',
  GENOVA: 'Genova',
  IMPERIA: 'Imperia',
  LA_SPEZIA: 'La Spezia',
  SAVONA: 'Savona',
  BERGAMO: 'Bergamo',
  BRESCIA: 'Brescia',
  COMO: 'Como',
  CREMONA: 'Cremona',
  LECCO: 'Lecco',
  LODI: 'Lodi',
  MANTOVA: 'Mantova',
  MILANO: 'Milano',
  MONZA_BRIANZA: 'Monza e della Brianza',
  PAVIA: 'Pavia',
  SONDRIO: 'Sondrio',
  VARESE: 'Varese',
  ANCONA: 'Ancona',
  ASCOLI_PICENO: 'Ascoli Piceno',
  FERMO: 'Fermo',
  MACERATA: 'Macerata',
  PESARO_URBINO: 'Pesaro e Urbino',
  CAMPOBASSO: 'Campobasso',
  ISERNIA: 'Isernia',
  ALESSANDRIA: 'Alessandria',
  ASTI: 'Asti',
  BIELLA: 'Biella',
  CUNEO: 'Cuneo',
  NOVARA: 'Novara',
  TORINO: 'Torino',
  VERBANO_CUSIO_OSSOLA: 'Verbano-Cusio-Ossola',
  VERCELLI: 'Vercelli',
  BARI: 'Bari',
  BARLETTA_ANDRIA_TRANI: 'Barletta-Andria-Trani',
  BRINDISI: 'Brindisi',
  FOGGIA: 'Foggia',
  LECCE: 'Lecce',
  TARANTO: 'Taranto',
  CAGLIARI: 'Cagliari',
  NUORO: 'Nuoro',
  ORISTANO: 'Oristano',
  SASSARI: 'Sassari',
  SUD_SARDEGNA: 'Sud Sardegna',
  AGRIGENTO: 'Agrigento',
  CALTANISSETTA: 'Caltanissetta',
  CATANIA: 'Catania',
  ENNA: 'Enna',
  MESSINA: 'Messina',
  PALERMO: 'Palermo',
  RAGUSA: 'Ragusa',
  SIRACUSA: 'Siracusa',
  TRAPANI: 'Trapani',
  AREZZO: 'Arezzo',
  FIRENZE: 'Firenze',
  GROSSETO: 'Grosseto',
  LIVORNO: 'Livorno',
  LUCCA: 'Lucca',
  MASSA_CARRARA: 'Massa-Carrara',
  PISA: 'Pisa',
  PISTOIA: 'Pistoia',
  PRATO: 'Prato',
  SIENA: 'Siena',
  BOLZANO: 'Bolzano',
  TRENTO: 'Trento',
  PERUGIA: 'Perugia',
  TERNI: 'Terni',
  AOSTA: 'Aosta',
  BELLUNO: 'Belluno',
  PADOVA: 'Padova',
  ROVIGO: 'Rovigo',
  TREVISO: 'Treviso',
  VENEZIA: 'Venezia',
  VERONA: 'Verona',
  VICENZA: 'Vicenza'
};

const italianRegions = [
  'Abruzzo',
  'Basilicata',
  'Calabria',
  'Campania',
  'Emilia-Romagna',
  'Friuli-Venezia Giulia',
  'Lazio',
  'Liguria',
  'Lombardia',
  'Marche',
  'Molise',
  'Piemonte',
  'Puglia',
  'Sardegna',
  'Sicilia',
  'Toscana',
  'Trentino-Alto Adige',
  'Umbria',
  "Valle d'Aosta",
  'Veneto'
];

function localeSort(a, b) {
  return a.localeCompare(b, 'it', { sensitivity: 'base' });
}

const provinceList = Array.from(new Set(Object.values(provinceMap))).sort(localeSort);
const regionList = [...italianRegions].sort(localeSort);

function populateSuggestionLocationOptions() {
  const select = document.getElementById('suggestLocation');
  if (!select) {
    return;
  }

  select.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Non specificato';
  select.appendChild(placeholder);

  const provincesGroup = document.createElement('optgroup');
  provincesGroup.label = 'Province';
  provinceList.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    provincesGroup.appendChild(option);
  });
  select.appendChild(provincesGroup);

  const regionGroup = document.createElement('optgroup');
  regionGroup.label = 'Regioni';
  regionList.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    regionGroup.appendChild(option);
  });
  select.appendChild(regionGroup);
}

function populateProvinceSelects() {
  const selects = document.querySelectorAll('select[data-populate="province"]');
  selects.forEach(select => {
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

function populateRegionSelects() {
  const selects = document.querySelectorAll('select[data-populate="region"]');
  selects.forEach(select => {
    const currentValue = select.value;
    select.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Seleziona regione';
    select.appendChild(placeholder);
    regionList.forEach(name => {
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

function populateLocationSelectors() {
  populateSuggestionLocationOptions();
  populateProvinceSelects();
  populateRegionSelects();
}

function setupProvinceInteractions(svgElement) {
  const tooltip = document.getElementById('tooltip');
  if (!svgElement || !tooltip) {
    return;
  }

  const provinces = svgElement.querySelectorAll('path[id]');

  provinces.forEach(path => {
    const provinceName = path.id;

    path.addEventListener('mousemove', e => {
      tooltip.style.opacity = '1';
      tooltip.style.left = `${e.pageX + 10}px`;
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.innerText = provinceName;
    });

    path.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });

    path.addEventListener('click', () => {
      const provName = provinceMap[path.id.toUpperCase()];
      if (provName) {
        apriPaginaArtisti(provName);
      } else {
        alert('Nessuna provincia associata a questo ID 😢');
      }
    });
  });
}

function loadItalyMap() {
  const mapContainer = document.getElementById('map-container');
  if (!mapContainer) {
    return;
  }

  fetch('assets/img/map.svg')
    .then(response => {
      if (!response.ok) {
        throw new Error('Impossibile caricare la mappa');
      }
      return response.text();
    })
    .then(svgText => {
      const sanitizedSvg = svgText.replace(/<\?xml[^>]*?>/i, '');
      mapContainer.innerHTML = sanitizedSvg;

      const svgElement = mapContainer.querySelector('svg');
      if (svgElement) {
        svgElement.classList.add('italy-map');
        setupProvinceInteractions(svgElement);
      }
    })
    .catch(error => {
      console.error('Errore durante il caricamento della mappa:', error);
    });
}

const loginPopup = document.getElementById('loginPopup');
const registerPopup = document.getElementById('registerPopup');
const registerErrors = document.getElementById('registerErrors');
const loginErrors = document.getElementById('loginErrors');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

function openLogin() {
  loginPopup?.classList.remove('hidden');
}

function openRegister() {
  registerPopup?.classList.remove('hidden');
}

function closeLogin() {
  loginPopup?.classList.add('hidden');
}

function closeRegister() {
  registerPopup?.classList.add('hidden');
}

document.getElementById('showLogin')?.addEventListener('click', e => {
  e.preventDefault();
  registerPopup?.classList.add('hidden');
  loginPopup?.classList.remove('hidden');
});

document.getElementById('showRegister')?.addEventListener('click', e => {
  e.preventDefault();
  loginPopup?.classList.add('hidden');
  registerPopup?.classList.remove('hidden');
});

document.getElementById('closeLogin')?.addEventListener('click', closeLogin);
document.getElementById('closeRegister')?.addEventListener('click', closeRegister);

registerForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(registerForm);

  fetch('../controller/RegisterController.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      registerErrors.innerHTML = '';
      if (data.success) {
        registerErrors.style.color = '#39ff14';
        registerErrors.innerText = data.message;

        setTimeout(() => {
          registerPopup?.classList.add('hidden');
          registerErrors.innerText = '';
          registerErrors.style.color = '#ff39f0';
          registerForm.reset();
        }, 2000);
      } else {
        data.errors.forEach(err => {
          const p = document.createElement('p');
          p.innerText = err;
          registerErrors.appendChild(p);
        });
      }
    })
    .catch(err => {
      console.error('Errore fetch:', err);
      registerErrors.innerText = 'Errore di comunicazione col server.';
    });
});

loginForm?.addEventListener('submit', function (e) {
  e.preventDefault();

  const formData = new FormData(loginForm);

  fetch('../controller/LoginController.php', {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      loginErrors.innerHTML = '';
      if (data.success) {
        loginErrors.style.color = '#39ff14';
        loginErrors.innerText = data.message;

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        data.errors.forEach(err => {
          const p = document.createElement('p');
          p.innerText = err;
          loginErrors.appendChild(p);
        });
      }
    })
    .catch(err => {
      console.error('Errore fetch:', err);
      loginErrors.innerText = 'Errore di comunicazione col server.';
    });
});

populateLocationSelectors();

window.openLogin = openLogin;
window.openRegister = openRegister;

document.addEventListener('DOMContentLoaded', () => {
  checkUserSession();
  loadItalyMap();
});