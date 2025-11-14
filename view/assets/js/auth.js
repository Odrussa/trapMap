const loginPopup = document.getElementById('loginPopup');
const registerPopup = document.getElementById('registerPopup');
const registerErrors = document.getElementById('registerErrors');
const loginErrors = document.getElementById('loginErrors');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const showLoginLink = document.getElementById('showLogin');
const showRegisterLink = document.getElementById('showRegister');
const closeLoginButton = document.getElementById('closeLogin');
const closeRegisterButton = document.getElementById('closeRegister');

export function openLogin() {
  loginPopup?.classList.remove('hidden');
}

export function openRegister() {
  registerPopup?.classList.remove('hidden');
}

export function closeLogin() {
  loginPopup?.classList.add('hidden');
}

export function closeRegister() {
  registerPopup?.classList.add('hidden');
}

function handleRegisterSubmit() {
  registerForm?.addEventListener('submit', event => {
    event.preventDefault();

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
        } else if (Array.isArray(data.errors)) {
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
}

function handleLoginSubmit() {
  loginForm?.addEventListener('submit', event => {
    event.preventDefault();

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
        } else if (Array.isArray(data.errors)) {
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
}

export function initAuth() {
  showLoginLink?.addEventListener('click', event => {
    event.preventDefault();
    registerPopup?.classList.add('hidden');
    loginPopup?.classList.remove('hidden');
  });

  showRegisterLink?.addEventListener('click', event => {
    event.preventDefault();
    loginPopup?.classList.add('hidden');
    registerPopup?.classList.remove('hidden');
  });

  closeLoginButton?.addEventListener('click', closeLogin);
  closeRegisterButton?.addEventListener('click', closeRegister);

  handleRegisterSubmit();
  handleLoginSubmit();
}
