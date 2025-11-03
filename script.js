document.getElementById("menu-toggle").addEventListener("click", function() {
  document.querySelector("nav ul").classList.toggle("show");
});

let profileMenuItem = null;
let profileDropdown = null;
let profileButton = null;
let profileDocumentListenerActive = false;

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

function handleDocumentClick(event) {
  if (profileMenuItem && profileDropdown && !profileMenuItem.contains(event.target)) {
    profileDropdown.classList.remove('show');
    if (profileButton) {
      profileButton.setAttribute('aria-expanded', 'false');
    }
  }
}

function clearProfileMenu() {
  if (profileMenuItem) {
    profileMenuItem.remove();
    profileMenuItem = null;
  }

  if (profileButton) {
    profileButton.setAttribute('aria-expanded', 'false');
  }

  profileDropdown = null;
  profileButton = null;

  if (profileDocumentListenerActive) {
    document.removeEventListener('click', handleDocumentClick);
    profileDocumentListenerActive = false;
  }

  applyNavProfileState(false);
}

function handleLogout(event) {
  event.preventDefault();

  fetch('logout.php', {
    method: 'POST',
    credentials: 'same-origin'
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        clearProfileMenu();
        toggleAuthLinks(true);
        checkUserSession();
      } else if (data.error) {
        console.error('Errore logout:', data.error);
      }
    })
    .catch(err => console.error('Errore logout:', err));
}

function showProfileMenu(username) {
  toggleAuthLinks(false);

  const header = document.querySelector('header');
  const navList = document.querySelector('header nav ul');
  if (!header || !navList) {
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
    profileButton.setAttribute('aria-label', 'Apri il menu profilo');
    profileButton.innerHTML = '<span aria-hidden="true">👤</span>';

    profileDropdown = document.createElement('div');
    profileDropdown.className = 'profile-dropdown';
    profileDropdown.setAttribute('role', 'menu');
    profileDropdown.setAttribute('aria-label', 'Opzioni profilo');
    profileDropdown.innerHTML = `
      <p class="profile-username"></p>
      <button type="button" class="logout-button">Logout</button>
    `;

    profileMenuItem.appendChild(profileButton);
    profileMenuItem.appendChild(profileDropdown);
    navList.appendChild(profileMenuItem);

    profileButton.addEventListener('click', event => {
      event.stopPropagation();
      const isOpen = profileDropdown.classList.toggle('show');
      profileButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    if (!profileDocumentListenerActive) {
      document.addEventListener('click', handleDocumentClick);
      profileDocumentListenerActive = true;
    }

    const logoutBtn = profileDropdown.querySelector('.logout-button');
    if (logoutBtn) {
      logoutBtn.setAttribute('role', 'menuitem');
      logoutBtn.addEventListener('click', handleLogout);
    }
  }

  if (profileDropdown) {
    profileDropdown.classList.remove('show');
  }

  if (profileButton) {
    profileButton.setAttribute('aria-expanded', 'false');
  }

  const usernameLabel = profileMenuItem?.querySelector('.profile-username');
  if (usernameLabel) {
    usernameLabel.textContent = username;
  }
}


//----

function checkUserSession() {
  fetch('user_info.php', { credentials: 'same-origin' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Risposta non valida dal server');
      }
      return response.json();
    })
    .then(data => {
      if (data.logged_in) {
        showProfileMenu(data.username);
      } else {
        toggleAuthLinks(true);
        clearProfileMenu();
      }
    })
    .catch(err => {
      console.error('Errore durante il controllo della sessione:', err);
      toggleAuthLinks(true);
      clearProfileMenu();
    });
}

document.addEventListener('DOMContentLoaded', checkUserSession);



// 🔹 Nuova funzione per aprire la pagina artisti
function apriPaginaArtisti(provincia) {
  window.location.href = `artists.html?province=${encodeURIComponent(provincia)}`;
}

// Collegamento ID (dallo SVG) -> campo del DB
const provinceMap = {
  // **Abruzzo**
  L_AQUILA: "L'Aquila",
  TERAMO: "Teramo",
  PESCARA: "Pescara",
  CHIETI: "Chieti",

  // **Basilicata**
  POTENZA: "Potenza",
  MATERA: "Matera",

  // **Calabria**
  CATANZARO: "Catanzaro",
  COSENZA: "Cosenza",
  CROTONE: "Crotone",
  REGGIO_CALABRIA: "Reggio Calabria",
  VIBO_VALENTIA: "Vibo Valentia",

  // **Campania**
  AVELLINO: "Avellino",
  BENEVENTO: "Benevento",
  CASERTA: "Caserta",
  NAPOLI: "Napoli",
  SALERNO: "Salerno",

  // **Emilia-Romagna**
  BOLOGNA: "Bologna",
  FERRARA: "Ferrara",
  FORLI_CESENA: "Forlì-Cesena",
  MODENA: "Modena",
  PARMA: "Parma",
  PIACENZA: "Piacenza",
  RAVENNA: "Ravenna",
  REGGIO_EMILIA: "Reggio Emilia",
  RIMINI: "Rimini",

  // **Friuli-Venezia Giulia**
  GORIZIA: "Gorizia",
  PORDENONE: "Pordenone",
  TRIESTE: "Trieste",
  UDINE: "Udine",

  // **Lazio**
  FROSINONE: "Frosinone",
  LATINA: "Latina",
  RIETI: "Rieti",
  ROMA: "Roma",
  VITERBO: "Viterbo",

  // **Liguria**
  GENOVA: "Genova",
  IMPERIA: "Imperia",
  LA_SPEZIA: "La Spezia",
  SAVONA: "Savona",

  // **Lombardia**
  BERGAMO: "Bergamo",
  BRESCIA: "Brescia",
  COMO: "Como",
  CREMONA: "Cremona",
  LECCO: "Lecco",
  LODI: "Lodi",
  MANTOVA: "Mantova",
  MILANO: "Milano",
  MONZA_BRIANZA: "Monza e della Brianza",
  PAVIA: "Pavia",
  SONDRIO: "Sondrio",
  VARESE: "Varese",

  // **Marche**
  ANCONA: "Ancona",
  ASCOLI_PICENO: "Ascoli Piceno",
  FERMO: "Fermo",
  MACERATA: "Macerata",
  PESARO_URBINO: "Pesaro e Urbino",

  // **Molise**
  CAMPOBASSO: "Campobasso",
  ISERNIA: "Isernia",

  // **Piemonte**
  ALESSANDRIA: "Alessandria",
  ASTI: "Asti",
  BIELLA: "Biella",
  CUNEO: "Cuneo",
  NOVARA: "Novara",
  TORINO: "Torino",
  VERBANO_CUSIO_OSSOLA: "Verbano-Cusio-Ossola",
  VERCELLI: "Vercelli",

  // **Puglia**
  BARI: "Bari",
  BARLETTA_ANDRIA_TRANI: "Barletta-Andria-Trani",
  BRINDISI: "Brindisi",
  FOGGIA: "Foggia",
  LECCE: "Lecce",
  TARANTO: "Taranto",

  // **Sardegna**
  CAGLIARI: "Cagliari",
  NUORO: "Nuoro",
  ORISTANO: "Oristano",
  SASSARI: "Sassari",
  SUD_SARDEGNA: "Sud Sardegna",

  // **Sicilia**
  AGRIGENTO: "Agrigento",
  CALTANISSETTA: "Caltanissetta",
  CATANIA: "Catania",
  ENNA: "Enna",
  MESSINA: "Messina",
  PALERMO: "Palermo",
  RAGUSA: "Ragusa",
  SIRACUSA: "Siracusa",
  TRAPANI: "Trapani",

  // **Toscana**
  AREZZO: "Arezzo",
  FIRENZE: "Firenze",
  GROSSETO: "Grosseto",
  LIVORNO: "Livorno",
  LUCCA: "Lucca",
  MASSA_CARRARA: "Massa-Carrara",
  PISA: "Pisa",
  PISTOIA: "Pistoia",
  PRATO: "Prato",
  SIENA: "Siena",

  // **Trentino-Alto Adige**
  BOLZANO: "Bolzano",
  TRENTO: "Trento",

  // **Umbria**
  PERUGIA: "Perugia",
  TERNI: "Terni",

  // **Valle d’Aosta**
  AOSTA: "Aosta",

  // **Veneto**
  BELLUNO: "Belluno",
  PADOVA: "Padova",
  ROVIGO: "Rovigo",
  TREVISO: "Treviso",
  VENEZIA: "Venezia",
  VERONA: "Verona",
  VICENZA: "Vicenza"
};

function setupProvinceInteractions(svgElement) {
  const tooltip = document.getElementById("tooltip");
  if (!svgElement || !tooltip) {
    return;
  }

  const provinces = svgElement.querySelectorAll("path[id]");

  provinces.forEach(path => {
    const provinceName = path.id;

    path.addEventListener("mousemove", e => {
      tooltip.style.opacity = "1";
      tooltip.style.left = e.pageX + 10 + "px";
      tooltip.style.top = e.pageY + 10 + "px";
      tooltip.innerText = provinceName;
    });

    path.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    path.addEventListener("click", () => {
      const provName = provinceMap[path.id.toUpperCase()];
      if (provName) {
        apriPaginaArtisti(provName);
      } else {
        alert("Nessuna provincia associata a questo ID 😢");
      }
    });
  });
}

function loadItalyMap() {
  const mapContainer = document.getElementById("map-container");
  if (!mapContainer) {
    return;
  }

  fetch("map.svg")
    .then(response => {
      if (!response.ok) {
        throw new Error("Impossibile caricare la mappa");
      }
      return response.text();
    })
    .then(svgText => {
      const sanitizedSvg = svgText.replace(/<\?xml[^>]*?>/i, "");
      mapContainer.innerHTML = sanitizedSvg;

      const svgElement = mapContainer.querySelector("svg");
      if (svgElement) {
        svgElement.classList.add("italy-map");
        setupProvinceInteractions(svgElement);
      }
    })
    .catch(error => {
      console.error("Errore durante il caricamento della mappa:", error);
    });
}

document.addEventListener("DOMContentLoaded", loadItalyMap);


// ----------- POPUP LOGIN/REGISTRAZIONE -------------
const loginPopup = document.getElementById('loginPopup');
const registerPopup = document.getElementById('registerPopup');
const registerErrors = document.getElementById('registerErrors');
const loginErrors = document.getElementById('loginErrors');

const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');

// Apri login/registrazione dal link
document.getElementById('showLogin')?.addEventListener('click', e => {
    e.preventDefault();
    registerPopup.classList.add('hidden');
    loginPopup.classList.remove('hidden');
});

document.getElementById('showRegister')?.addEventListener('click', e => {
    e.preventDefault();
    loginPopup.classList.add('hidden');
    registerPopup.classList.remove('hidden');
});

// Chiudi popup
document.getElementById('closeLogin')?.addEventListener('click', () => {
    loginPopup.classList.add('hidden');
});

document.getElementById('closeRegister')?.addEventListener('click', () => {
    registerPopup.classList.add('hidden');
});

// Funzioni per aprire popup
function openLogin() { loginPopup.classList.remove('hidden'); }
function openRegister() { registerPopup.classList.remove('hidden'); }

// ------------------ REGISTRAZIONE ------------------
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(registerForm);

    fetch('register.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        registerErrors.innerHTML = ''; // reset errori
        if (data.success) {
            registerErrors.style.color = '#39ff14';
            registerErrors.innerText = data.message;

            setTimeout(() => {
                registerPopup.classList.add('hidden');
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

// ------------------ LOGIN ------------------
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(loginForm);

    fetch('login.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        loginErrors.innerHTML = ''; // reset errori
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


