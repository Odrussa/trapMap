const globalNotification = document.getElementById('globalNotification');
let globalNotificationTimeout = null;

export function showGlobalNotification(message, type = 'success') {
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

export function setFormFeedback(element, message, type = 'success') {
  if (!element) {
    return;
  }

  element.textContent = message;
  element.classList.remove('error', 'info');

  if (type === 'error' || type === 'info') {
    element.classList.add(type);
  }
}
