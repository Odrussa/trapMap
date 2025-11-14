import { createEventBus } from './modules/eventBus.js';
import { initSessionModule } from './modules/session.js';
import { initSuggestionsModule } from './modules/suggestions.js';
import { initArtistCardModule } from './modules/artistCard.js';
import { initMap } from './modules/map.js';
import { initAuthPopupsModule } from './modules/authPopups.js';

document.addEventListener('DOMContentLoaded', () => {
  const eventBus = createEventBus();

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      eventBus.emit('app:escape');
    }
  });

  const navElement = document.querySelector('header nav');
  const navList = navElement?.querySelector('ul') ?? null;

  const sessionApi = initSessionModule({
    menuToggle: document.getElementById('menu-toggle'),
    navElement,
    navList,
    loginNavItem: document.getElementById('navLoginItem'),
    registerNavItem: document.getElementById('navRegisterItem'),
    profilePanel: document.getElementById('profilePanel'),
    profilePanelBackdrop: document.getElementById('profilePanelBackdrop'),
    profileUsernameLabel: document.getElementById('profileUsername'),
    profileActionSuggest: document.getElementById('profileActionSuggest'),
    profileActionCreateCard: document.getElementById('profileActionCreateCard'),
    profileActionMySuggestions: document.getElementById('profileActionMySuggestions'),
    profileActionEditCard: document.getElementById('profileActionEditCard'),
    profileActionLogout: document.getElementById('profileActionLogout'),
    closeProfilePanelButton: document.getElementById('closeProfilePanel'),
    globalNotification: document.getElementById('globalNotification')
  }, { eventBus });

  initAuthPopupsModule({
    loginPopup: document.getElementById('loginPopup'),
    registerPopup: document.getElementById('registerPopup'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginErrors: document.getElementById('loginErrors'),
    registerErrors: document.getElementById('registerErrors'),
    closeLoginButton: document.getElementById('closeLogin'),
    closeRegisterButton: document.getElementById('closeRegister'),
    showLoginLink: document.getElementById('showLogin'),
    showRegisterLink: document.getElementById('showRegister'),
    navLoginLink: document.getElementById('navLoginLink'),
    navRegisterLink: document.getElementById('navRegisterLink')
  }, { eventBus });

  initSuggestionsModule({
    modal: document.getElementById('suggestionModal'),
    form: document.getElementById('suggestionForm'),
    feedback: document.getElementById('suggestionFeedback'),
    closeButton: document.getElementById('closeSuggestionForm'),
    openButtons: [
      document.getElementById('suggestArtistCta')
    ],
    locationSelect: document.getElementById('suggestLocation')
  }, { sessionApi, eventBus });

  const provinceSelects = Array.from(document.querySelectorAll('select[data-populate="province"]'));

  initArtistCardModule({
    modal: document.getElementById('artistCardModal'),
    form: document.getElementById('artistCardForm'),
    feedback: document.getElementById('artistCardFeedback'),
    closeButton: document.getElementById('closeArtistCardForm'),
    openButtons: [
      document.getElementById('createArtistCardCta')
    ],
    title: document.getElementById('artistCardTitle'),
    submitButton: document.getElementById('artistCardSubmit'),
    provinceSelects,
    nameInput: document.getElementById('artistName'),
    aliasInput: document.getElementById('artistAlias'),
    provinceInput: document.getElementById('artistProvince'),
    categoryInput: document.getElementById('artistCategory'),
    spotifyInput: document.getElementById('artistSpotify'),
    instagramInput: document.getElementById('artistInstagram'),
    soundcloudInput: document.getElementById('artistSoundcloud'),
    imageInput: document.getElementById('artistImage'),
    previewName: document.getElementById('artistPreviewName'),
    previewAlias: document.getElementById('artistPreviewAlias'),
    previewLocation: document.getElementById('artistPreviewLocation'),
    previewCategory: document.getElementById('artistPreviewCategory'),
    previewLinks: document.getElementById('artistPreviewLinks'),
    previewImage: document.getElementById('artistPreviewImage'),
    previewImageContainer: document.getElementById('artistPreviewImageContainer')
  }, { sessionApi, eventBus });

  initMap({
    mapContainer: document.getElementById('map-container'),
    tooltip: document.getElementById('tooltip')
  }, {
    onProvinceSelect: province => {
      window.location.href = `artists.html?province=${encodeURIComponent(province)}`;
    }
  });

  sessionApi.refreshSession();
});
