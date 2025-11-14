const menuToggle = document.getElementById('menu-toggle');
const navList = document.querySelector('header nav ul');

export function initMenuToggle() {
  menuToggle?.addEventListener('click', () => {
    navList?.classList.toggle('show');
  });
}
