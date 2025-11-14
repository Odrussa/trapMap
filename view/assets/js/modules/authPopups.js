function openOverlay(overlay) {
  overlay?.classList.remove('hidden');
}

function closeOverlay(overlay) {
  overlay?.classList.add('hidden');
}

function clearErrors(container) {
  if (!container) {
    return;
  }
  container.innerHTML = '';
  container.style.color = '#ff39f0';
}

export function initAuthPopupsModule(dom, { eventBus }) {
  const {
    loginPopup,
    registerPopup,
    loginForm,
    registerForm,
    loginErrors,
    registerErrors,
    closeLoginButton,
    closeRegisterButton,
    showLoginLink,
    showRegisterLink,
    navLoginLink,
    navRegisterLink
  } = dom;

  function openLogin() {
    clearErrors(loginErrors);
    openOverlay(loginPopup);
  }

  function openRegister() {
    clearErrors(registerErrors);
    openOverlay(registerPopup);
  }

  function closeLogin() {
    closeOverlay(loginPopup);
  }

  function closeRegister() {
    closeOverlay(registerPopup);
  }

  closeLoginButton?.addEventListener('click', closeLogin);
  closeRegisterButton?.addEventListener('click', closeRegister);

  navLoginLink?.addEventListener('click', event => {
    event.preventDefault();
    openLogin();
  });

  navRegisterLink?.addEventListener('click', event => {
    event.preventDefault();
    openRegister();
  });

  showLoginLink?.addEventListener('click', event => {
    event.preventDefault();
    closeRegister();
    openLogin();
  });

  showRegisterLink?.addEventListener('click', event => {
    event.preventDefault();
    closeLogin();
    openRegister();
  });

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
            closeRegister();
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
            closeLogin();
            loginErrors.innerText = '';
            loginErrors.style.color = '#ff39f0';
            loginForm.reset();
            eventBus.emit('auth:login-success', data);
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

  eventBus.on('auth:open-login', openLogin);
  eventBus.on('auth:open-register', openRegister);

  eventBus.on('app:escape', () => {
    closeLogin();
    closeRegister();
  });
}
