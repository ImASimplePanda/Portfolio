// Abrir y cerrar side menu
const menuBtn = document.getElementById('menuBtn');
const closeBtn = document.getElementById('closeBtn');
const sideMenu = document.getElementById('sideMenu');
const overlay = document.getElementById('overlay');

// Control del menú lateral: abrirlo y cerrarlo cuando se pulsan los botones o el fondo oscuro
if (menuBtn && closeBtn && sideMenu && overlay) {
    menuBtn.addEventListener('click', () => {
        sideMenu.classList.add('active');
        overlay.classList.add('active');
    });

    closeBtn.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        overlay.classList.remove('active');
    });

    overlay.addEventListener('click', () => {
        sideMenu.classList.remove('active');
        overlay.classList.remove('active');
    });
}

// Dropdown perfil
const profileContainer = document.getElementById('profileContainer');
const profileDropdown = document.getElementById('profileDropdown');

// Control del menú de perfil: mostrarlo al pulsar el icono y ocultarlo al hacer clic fuera
if (profileContainer && profileDropdown) {
    profileContainer.addEventListener('click', (e) => {
        e.stopPropagation();
        profileDropdown.style.display =
            profileDropdown.style.display === 'block' ? 'none' : 'block';
    });

    document.addEventListener('click', () => {
        profileDropdown.style.display = 'none';
    });
}