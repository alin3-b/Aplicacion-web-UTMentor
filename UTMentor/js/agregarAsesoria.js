const btnAgregarAsesoria = document.getElementById('btnAgregarAsesoria');
const addSessionModal = document.getElementById('addSessionModal');
const closeAddSession = document.getElementById('closeAddSession');
const cancelSession = document.getElementById('cancelSession');

const sessionTipo = document.getElementById('sessionTipo');
const maxPeopleDiv = document.getElementById('maxPeopleDiv');

const sessionTema = document.getElementById('sessionTema');
const profileTopicsList = document.querySelectorAll('#profileTopics ul li'); // Temas del perfil

// --- Abrir modal ---
btnAgregarAsesoria.addEventListener('click', () => {
    addSessionModal.style.display = 'block';
    cargarTemas();
});

// --- Cerrar modal ---
closeAddSession.addEventListener('click', () => addSessionModal.style.display = 'none');
cancelSession.addEventListener('click', () => addSessionModal.style.display = 'none');
window.addEventListener('click', (e) => {
    if (e.target === addSessionModal) addSessionModal.style.display = 'none';
});

// --- Mostrar campo de cantidad máxima si es Grupo ---
sessionTipo.addEventListener('change', () => {
    if (sessionTipo.value === 'Grupo') {
        maxPeopleDiv.style.display = 'block';
    } else {
        maxPeopleDiv.style.display = 'none';
    }
});

// --- Cargar temas desde el perfil ---
function cargarTemas() {
    sessionTema.innerHTML = ''; // Limpiar select
    profileTopicsList.forEach(li => {
        const option = document.createElement('option');
        option.value = li.textContent;
        option.textContent = li.textContent;
        sessionTema.appendChild(option);
    });
}

