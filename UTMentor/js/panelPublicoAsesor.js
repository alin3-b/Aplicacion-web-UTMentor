/* Panel público de asesor — carga perfil, disponibilidad semanal y reserva */

const API_BASE_URL = "";

const fmtDay = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: '2-digit' });
const agendaGrid = document.getElementById('agendaGrid');
const weekLabel = document.getElementById('weekLabel');
const prevWeek = document.getElementById('prevWeek');
const nextWeek = document.getElementById('nextWeek');
const modal = document.getElementById('bookModal');
const slotSummary = document.getElementById('slotSummary');
const bookForm = document.getElementById('bookForm');
const capacidadDiv = document.getElementById('capacidadDiv');

// Elementos de perfil
const profileNameEl = document.querySelector('.profile__name');
const profileCareerEl = document.querySelector('.profile__career');
const profileMailEl = document.querySelector('.profile__mail');
const profileTopicsUl = document.querySelector('#profileTopics ul');
const ratingBadge = document.querySelector('.rating-card .badge');
const ratingValue = document.querySelector('.rating-card__stars .rating');
const ratingStars = document.querySelector('.rating-card__stars .stars');
const sessionsMeta = document.querySelector('.rating-card__head .muted');

// Modal tema fijo/seleccionable
const temaDiv = document.getElementById('temaDiv');
const temaFijoDiv = document.getElementById('temaFijoDiv');
const temaFijoSpan = document.getElementById('temaFijo');
const temaSelect = document.getElementById('temaSelect');
const modalidadSelect = document.getElementById('modalidadSelect');

// Zona horaria fija México (CDMX)
const MX_TZ = 'America/Mexico_City';

// =========================
// Estado global
// =========================
let horarios = [];
let start = startOfWeek(new Date());
let selectedSlot = null;
let asesorId = null;
let temasDelPerfil = [];

// =========================
// Helpers
// =========================
function safeText(s = '') { return String(s ?? ''); }
function showErrorMessage(msg) { alert(msg); }
function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}
function utcToMexicoLocal(utcIsoString) {
  if (!utcIsoString) return null;
  const utcDate = new Date(utcIsoString);
  const strMx = utcDate.toLocaleString('en-US', { timeZone: MX_TZ });
  return new Date(strMx);
}

// =========================
// Fetch perfil desde API
// =========================
async function fetchPerfilAsesor(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/usuarios/asesores/${id}`);
    if (res.status === 404) { showErrorMessage('Asesor no encontrado.'); return null; }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Error fetching asesor:', err);
    showErrorMessage('Error al cargar el perfil. Intenta más tarde.');
    return null;
  }
}

// ===========================
// Fetch asesorías por asesor
// ===========================
async function fetchAsesorias(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/asesorias/asesor/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.asesorias || [];
  } catch (err) {
    console.error('Error fetch asesorías:', err);
    return [];
  }
}

// =========================
// GENERAR DESCRIPCIÓN CON IA (si no existe)
// =========================
async function generarYMostrarDescripcion(data) {
  const descEl = document.getElementById("profileDescription");

  // Si ya tiene descripción → mostrarla y salir
  if (data.descripcion && data.descripcion.trim() !== "") {
    descEl.textContent = data.descripcion.trim();
    descEl.classList.remove("muted");
    return;
  }

  // Si no tiene → generar con IA
  descEl.textContent = "Generando una descripción increíble para ti...";
  descEl.classList.remove("muted");
  descEl.style.fontStyle = "italic";
  descEl.style.color = "#6366f1";

  try {
    const temasTexto = temasDelPerfil.map(t => t.nombre_tema);

    const response = await fetch(`${API_BASE_URL}/api/ia/generarDescripcionAsesor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: data.nombre_completo?.trim() || "Asesor",
        carrera: data.nombre_carrera || "Ingeniería",
        semestre: data.semestre || null,
        temas: temasTexto,
        area: temasDelPerfil[0]?.nombre_area || "Ciencias e Ingeniería",
        rating: Number(data.puntuacion_promedio) || 4.9,
        totalClases: data.numero_sesiones || 50
      })
    });

    if (!response.ok) throw new Error(`Error ${response.status}`);

    const result = await response.json();
    const descripcionGenerada = result.descripcion?.trim();

    if (descripcionGenerada) {
      descEl.textContent = descripcionGenerada;
      descEl.style.fontStyle = "normal";
      descEl.style.color = "#333";
    } else {
      descEl.textContent = "Este asesor aún no ha agregado una descripción personal.";
    }
  } catch (err) {
    console.error("Error generando descripción:", err);
    descEl.textContent = "No pudimos generar la descripción en este momento.";
    descEl.style.color = "#e11d48";
  }
}

// =========================
// Render perfil
// =========================
function renderPerfil(data) {
  if (!data) return;

  profileNameEl.textContent = safeText(data.nombre_completo || 'Asesor');
  profileCareerEl.textContent = safeText(
    data.nombre_carrera
      ? `${data.nombre_carrera} · ${data.semestre ? data.semestre + '°' : ''}`
      : ''
  );

  profileMailEl.href = `mailto:${safeText(data.correo_contacto)}`;
  profileMailEl.textContent = safeText(data.correo_contacto);

  const ratingNum = Number(data.puntuacion_promedio || 0);
  ratingBadge.textContent = Math.round(ratingNum * 10) / 10;
  ratingValue.textContent = ratingNum.toFixed(1);
  ratingStars.textContent = generarEstrellas(ratingNum);
  sessionsMeta.textContent = `${data.numero_sesiones || 0} clases`;

  // Temas perfil
  temasDelPerfil = data.temas || [];

  profileTopicsUl.innerHTML = '';
  const temasUnicos = [...new Set(temasDelPerfil.map(t => t.nombre_tema))];

  if (temasUnicos.length === 0) {
    profileTopicsUl.innerHTML = '<li>No especificado</li>';
  } else {
    temasUnicos.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      profileTopicsUl.appendChild(li);
    });
  }

  // ¡¡AQUÍ SE LLAMA A LA GENERACIÓN DE DESCRIPCIÓN!!
  generarYMostrarDescripcion(data);
}

// =========================
// Inyectar asesorías al sistema de horarios
// =========================
function prepararHorarios(asesorias) {
  horarios = asesorias.map(a => ({
    ...a,
    fecha_inicio: utcToMexicoLocal(a.fecha_inicio),
    fecha_fin: utcToMexicoLocal(a.fecha_fin),
    temasDelAsesor: temasDelPerfil,
    nombre_area: a.nombre_area || temasDelPerfil[0]?.nombre_area || null
  }));

  renderWeek();
}

// =========================
// Calendario semanal
// =========================
function formatWeekRange(startDate, endDate) {
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const startStr = startDate.toLocaleDateString('es-MX', options);
  const endStr = endDate.toLocaleDateString('es-MX', options);
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.getDate()}–${endDate.getDate()} ${startStr.split(' ')[1]} ${startDate.getFullYear()}`;
  }
  return `${startStr} – ${endStr}`;
}

function renderWeek() {
  if (!agendaGrid || !weekLabel) return;
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  weekLabel.textContent = formatWeekRange(start, end);
  agendaGrid.innerHTML = '';

  const startTs = start.getTime();
  const endTs = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).getTime();

  const semanaSlots = horarios.filter(s => {
    const f = s.fecha_inicio.getTime();
    return f >= startTs && f <= endTs;
  });

  const porDia = {};
  semanaSlots.forEach(s => {
    const key = s.fecha_inicio.toDateString();
    if (!porDia[key]) porDia[key] = [];
    porDia[key].push(s);
  });

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    const col = document.createElement('div');
    col.className = 'day-col';

    const head = document.createElement('div');
    head.className = 'day-col__head';
    head.innerHTML = `
      <div class="day-col__name">${fmtDay.format(day).split(' ')[0]}</div>
      <div class="day-col__date">${fmtDay.format(day).split(' ')[1]}</div>`;
    col.appendChild(head);

    const key = day.toDateString();
    const daySlots = (porDia[key] || []).sort((a, b) => a.fecha_inicio - b.fecha_inicio);

    if (daySlots.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = '— sin horarios —';
      col.appendChild(empty);
    } else {
      daySlots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'session-item';

        const horaTexto = slot.fecha_inicio.toLocaleTimeString('es-MX', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: MX_TZ
        });

        const temaTexto = slot.nombre_tema || 'Tema libre';

        btn.textContent = `${horaTexto} · ${temaTexto}`;

        btn.addEventListener('click', () => selectSlot(slot, btn));
        col.appendChild(btn);
      });
    }

    agendaGrid.appendChild(col);
  }
}

function generarEstrellas(calificacion) {
  const rating = parseFloat(calificacion) || 0;
  const entero = Math.floor(rating);
  return '★'.repeat(entero) + '☆'.repeat(5 - entero);
}

// =========================
// Selección de slot y modal
// =========================
function selectSlot(slotObj, el) {
  const token = localStorage.getItem('token');

  if (!token) {
    // Usuario no autenticado → mostrar modal para agendar
    const loginModal = document.getElementById('loginToBookModal');
    loginModal.setAttribute('aria-hidden', 'false');
    return;
  }

  // Si está autenticado → abrir modal normal
  agendaGrid.querySelectorAll('.session-item.selected').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  selectedSlot = slotObj;

  const textoFecha = slotObj.fecha_inicio.toLocaleString('es-MX', {
    weekday: 'long', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: MX_TZ
  });

  slotSummary.textContent = `Has elegido: ${textoFecha} (${slotObj.tipo_sesion || 'individual'})`;
  openModal();
}


function openModal() {
  if (!modal || !selectedSlot) return;

  const inicioStr = selectedSlot.fecha_inicio.toLocaleString('es-MX', {
    weekday: 'long', day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: MX_TZ
  });
  const finStr = selectedSlot.fecha_fin.toLocaleString('es-MX', {
    hour: '2-digit', minute: '2-digit', timeZone: MX_TZ
  });

  document.getElementById('modalFecha').textContent =
    `${inicioStr.split(', ')[0]}, ${inicioStr.split(', ')[1]} - ${finStr}`;

  document.getElementById('modalTipo').textContent = selectedSlot.tipo_sesion || 'individual';
  document.getElementById('modalAsesor').textContent = selectedSlot.nombre_asesor || 'Asesor';
  document.getElementById('modalPrecio').textContent = `$${selectedSlot.precio || 0} MXN`;

  // Tema fijo o seleccionable
  if (selectedSlot.nombre_tema) {
    temaDiv.style.display = 'none';
    temaFijoDiv.style.display = 'block';
    temaFijoSpan.textContent = selectedSlot.nombre_tema;
    document.getElementById('modalArea').textContent = selectedSlot.nombre_area || '';
  } else {
    temaDiv.style.display = 'block';
    temaFijoDiv.style.display = 'none';

    temaSelect.innerHTML = '';
    temasDelPerfil.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id_tema;
      opt.textContent = t.nombre_tema;
      temaSelect.appendChild(opt);
    });

    const firstTema = temasDelPerfil[0];
    document.getElementById('modalArea').textContent = firstTema?.nombre_area || '';
  }

  // Modalidad
  const modalidadDiv = document.getElementById('modalidadDiv');
  let modalidadFijoDiv = document.getElementById('modalidadFijoDiv');

  if (!modalidadFijoDiv) {
    modalidadFijoDiv = document.createElement('div');
    modalidadFijoDiv.id = 'modalidadFijoDiv';
    modalidadFijoDiv.className = 'f-field';
    modalidadFijoDiv.style.display = 'none';
    modalidadFijoDiv.innerHTML = `
      <span class="f-label">Modalidad</span>
      <span id="modalidadFijo" class="f-info"></span>
    `;
    modalidadDiv.parentNode.insertBefore(modalidadFijoDiv, modalidadDiv);
  }

  if (selectedSlot.modalidad) {
    modalidadDiv.style.display = 'none';
    modalidadFijoDiv.style.display = 'block';
    document.getElementById('modalidadFijo').textContent =
      capitalizeFirstLetter(selectedSlot.modalidad);
  } else {
    modalidadDiv.style.display = 'block';
    modalidadFijoDiv.style.display = 'none';
    modalidadSelect.value = 'Virtual';
  }

  function capitalizeFirstLetter(s) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
  }

  // Capacidad
  if (selectedSlot.tipo_sesion?.toLowerCase() === 'grupal') {
    capacidadDiv.style.display = 'flex';
    document.getElementById('modalCapacidad').textContent =
      selectedSlot.capacidad || 1;
  } else {
    capacidadDiv.style.display = 'none';
  }

  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => bookForm.querySelector('.f-input')?.focus(), 100);
}

// Cambiar área al seleccionar tema
temaSelect.addEventListener('change', () => {
  const temaId = temaSelect.value;
  const tema = temasDelPerfil.find(t => t.id_tema == temaId);
  document.getElementById('modalArea').textContent = tema?.nombre_area || '';
});

function closeModal() {
  modal?.setAttribute('aria-hidden', 'true');
  selectedSlot = null;
  agendaGrid.querySelectorAll('.session-item.selected').forEach(s => s.classList.remove('selected'));
}

// Cerrar modal
modal?.addEventListener('click', e => {
  if (e.target.hasAttribute('data-close')) closeModal();
});
document.querySelector('.modal__close')?.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

// =========================
// Reserva
// =========================
bookForm.addEventListener('submit', async e => {
  e.preventDefault();
  if (!selectedSlot) return alert('Selecciona un horario.');

  const token = localStorage.getItem('token');
  if (!token) {
    if (confirm('Debes iniciar sesión para reservar. ¿Ir ahora?')) {
      window.location.href =
        `/iniciarSesion.html?returnTo=${encodeURIComponent(location.href)}`;
    }
    return;
  }

  const payload = {
    fk_disponibilidad: selectedSlot.id_disponibilidad,
    tema: selectedSlot.nombre_tema ? null : temaSelect.value,
    tipo_sesion: selectedSlot.tipo_sesion || null,
    capacidad:
      selectedSlot.tipo_sesion?.toLowerCase() === 'grupal'
        ? Number(bookForm.querySelector('input[name="capacidad"]')?.value ||
            selectedSlot.capacidad ||
            1)
        : 1
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/inscripciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(err.error || `Error ${res.status}`);
    }

    alert('¡Reserva creada con éxito!');
    closeModal();
    location.reload();
  } catch (err) {
    console.error(err);
    alert('Error al reservar: ' + err.message);
  }
});

// =========================
// Navegación semanas
// =========================
prevWeek.addEventListener('click', () => {
  start.setDate(start.getDate() - 7);
  renderWeek();
});
nextWeek.addEventListener('click', () => {
  start.setDate(start.getDate() + 7);
  renderWeek();
});

// =========================
// Inicio de semana (lunes)
// =========================
function startOfWeek(d) {
  const r = new Date(d);
  const day = (r.getDay() + 6) % 7;
  r.setDate(r.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

// =========================
// Helpers UI
// =========================
function checkSessionUI() {
  const token = localStorage.getItem("token");
  if (token) {
    const panel = document.querySelector(".nav .panel");
    if (panel) {
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from');
      
      console.log("Param from:", from); // Debug

      let backLinkText = "Volver a explorar";
      let backLinkHref = "panelAsesorado.html#explorar";

      if (from === 'favoritos') {
        backLinkText = "Volver a mis asesores";
        backLinkHref = "panelAsesorado.html#favoritos";
      }

      // Reemplazar botones de login/registro por "Volver al panel"
      panel.innerHTML = `
        <a class="link" href="${backLinkHref}">${backLinkText}</a>
      `;
    }
  }
}

// =========================
// Inicialización
// =========================
async function init() {
  checkSessionUI();
  asesorId = getIdFromUrl();
  if (!asesorId) {
    showErrorMessage('Falta el ID del asesor.');
    return;
  }

  const perfil = await fetchPerfilAsesor(asesorId);
  if (!perfil) return;
  renderPerfil(perfil);

  const asesorias = await fetchAsesorias(asesorId);
  prepararHorarios(asesorias);

  // Deshabilitar click en el logo
  const brandLink = document.querySelector('.brand');
  if (brandLink) {
    brandLink.addEventListener('click', (e) => {
      e.preventDefault();
    });
    brandLink.style.cursor = 'default';
  }
}

init();

// === BOTÓN FAVORITO ===
const btnFavorito = document.getElementById('btnFavorito');
const saveModal = document.getElementById('saveAsesorModal');
const closeSaveModalBtn = document.getElementById('closeSaveModal');
const goLoginBtn = document.getElementById('goLogin');
const goRegisterBtn = document.getElementById('goRegister');

btnFavorito.addEventListener('click', async () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Usuario no autenticado → mostrar modal
    saveModal.setAttribute('aria-hidden', 'false');
    return;
  }

  // Usuario autenticado → guardar en favoritos
  if (!asesorId) {
    alert('Falta el ID del asesor.');
    return;
  }

  let userId;
  try {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    if (usuario && usuario.id) {
      userId = usuario.id;
    }
  } catch (e) {
    console.error("Error parsing user data", e);
  }

  if (!userId) {
    alert("Error: No se pudo identificar al usuario. Por favor inicia sesión nuevamente.");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/favoritos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fk_asesorado: Number(userId),
        fk_asesor: Number(asesorId)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      if (data.error && data.error.includes('ya está en favoritos')) {
        alert('Este asesor ya está en tus favoritos.');
      } else {
        throw new Error(data.error || `Error ${res.status}`);
      }
      return;
    }

    alert('Asesor agregado a tus favoritos ✅');
    // Opcional: cambiar el estilo del botón para indicar “guardado”
    btnFavorito.classList.add('saved');
    btnFavorito.textContent = 'Guardado';
  } catch (err) {
    console.error('Error guardando favorito:', err);
    alert('No se pudo guardar el asesor. Intenta más tarde.');
  }
});

// === MODAL USUARIO NO AUTENTICADO ===
// Cerrar modal
closeSaveModalBtn.addEventListener('click', () => {
  saveModal.setAttribute('aria-hidden', 'true');
});

// Redirigir a login
goLoginBtn.addEventListener('click', () => {
  const returnUrl = encodeURIComponent(location.href);
  window.location.href = `/iniciarSesion.html?returnTo=${returnUrl}`;
});

// Redirigir a registro
goRegisterBtn.addEventListener('click', () => {
  const returnUrl = encodeURIComponent(location.href);
  window.location.href = `/registro.html?returnTo=${returnUrl}`;
});

// Cerrar modal al hacer click fuera del card
saveModal.addEventListener('click', e => {
  if (e.target.hasAttribute('data-close')) {
    saveModal.setAttribute('aria-hidden', 'true');
  }
});
const loginBookModal = document.getElementById('loginToBookModal');
const closeLoginBookModalBtn = document.getElementById('closeLoginBookModal');
const loginBookBtn = document.getElementById('loginBookBtn');
const registerBookBtn = document.getElementById('registerBookBtn');

// Cerrar modal
closeLoginBookModalBtn.addEventListener('click', () => {
  loginBookModal.setAttribute('aria-hidden', 'true');
});
loginBookModal.addEventListener('click', e => {
  if (e.target.hasAttribute('data-close')) loginBookModal.setAttribute('aria-hidden', 'true');
});

// Redirigir a login o registro
loginBookBtn.addEventListener('click', () => {
  const returnUrl = encodeURIComponent(location.href);
  window.location.href = `/iniciarSesion.html?returnTo=${returnUrl}`;
});
registerBookBtn.addEventListener('click', () => {
  const returnUrl = encodeURIComponent(location.href);
  window.location.href = `/registro.html?returnTo=${returnUrl}`;
});
