document.getElementById("menu-toggle").addEventListener("click", function() {
  document.querySelector("nav ul").classList.toggle("show");
});


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

/*Evento cursore province*/
document.addEventListener("DOMContentLoaded", () => {
  const tooltip = document.getElementById("tooltip");

  // Seleziona tutti i path con ID (cioè le province)
  const provinces = document.querySelectorAll("svg path[id]");

  provinces.forEach(path => {
    const provinceName = path.id; // L'id corrisponde al nome, es. "LATINA"

    // Mostra tooltip
    path.addEventListener("mousemove", e => {
      tooltip.style.opacity = "1";
      tooltip.style.left = e.pageX + 10 + "px";
      tooltip.style.top = e.pageY + 10 + "px";
      tooltip.innerText = provinceName;
    });

    // Nascondi tooltip
    path.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });
  });
});


// Evento click sulle province
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('svg path').forEach(path => {
    path.addEventListener('click', () => {
      const provName = provinceMap[path.id.toUpperCase()];
      if (provName) {
        apriPaginaArtisti(provName); // 🔹 Qui cambia: apre una nuova pagina invece dell’overlay
      } else {
        alert("Nessuna provincia associata a questo ID 😢");
      }
    });
  });
});


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



