// ../js/panelPublicoAsesor.js
/* Panel público de asesor — carga perfil, disponibilidad semanal y reserva */
const fmtDay = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: '2-digit' });
const fmtTime = new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' });

const agendaGrid = document.getElementById('agendaGrid');
const weekLabel = document.getElementById('weekLabel');
const prevWeek = document.getElementById('prevWeek');
const nextWeek = document.getElementById('nextWeek');
const btnReservar = document.getElementById('btnReservar');

const modal = document.getElementById('bookModal');
const slotSummary = document.getElementById('slotSummary');
const bookForm = document.getElementById('bookForm');
const sessionTipo = document.getElementById('sessionTipo');
const maxPeople = document.getElementById('maxPeopleDiv');
const sessionTema = document.getElementById('sessionTema');

// Elementos de perfil (añadir IDs en HTML si no existen)
const profileNameEl = document.querySelector('.profile__name');
const profileCareerEl = document.querySelector('.profile__career');
const profileMailEl = document.querySelector('.profile__mail');
const profileTopicsUl = document.querySelector('#profileTopics ul');
const ratingBadge = document.querySelector('.rating-card .badge');
const ratingValue = document.querySelector('.rating-card__stars .rating');
const ratingStars = document.querySelector('.rating-card__stars .stars');
const sessionsMeta = document.querySelector('.rating-card__head .muted');

// Estado y utilidades
let horarios = []; // Disponibilidades reales traídas del backend (array de objetos)
let start = startOfWeek(new Date());
let selectedSlot = null;
let asesorId = null;

/* =========================
   Helpers de seguridad / UI
   ========================= */
function safeText(s = '') { return String(s == null ? '' : s); }

function showErrorMessage(msg) {
  // Mensaje simple; puedes adaptar para mostrar en UI
  alert(msg);
}

function getIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/* =========================
   Fetch perfil desde API
   ========================= */
async function fetchPerfilAsesor(id) {
  try {
    const res = await fetch(`/api/usuarios/asesores/${id}`);
    if (res.status === 404) {
      showErrorMessage('Asesor no encontrado.');
      return null;
    }
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching asesor:', err);
    showErrorMessage('Error al cargar el perfil. Intenta más tarde.');
    return null;
  }
}

/* =========================
   Render perfil (datos generales, temas)
   ========================= */
function renderPerfil(data) {
  if (!data) return;

  // Nombre y meta
  if (profileNameEl) profileNameEl.textContent = safeText(data.nombre_completo || 'Asesor');
  if (profileCareerEl) profileCareerEl.textContent = safeText(data.nombre_carrera ? `${data.nombre_carrera} · ${data.semestre ? data.semestre + '°' : ''}` : '');
  if (profileMailEl) profileMailEl.href = `mailto:${safeText(data.correo_contacto || '')}`;
  if (profileMailEl) profileMailEl.textContent = safeText(data.correo_contacto || '');

  // Rating y sesiones
  // Rating y sesiones
  const ratingNum = Number(data.puntuacion_promedio || 0);

  if (ratingBadge)
    ratingBadge.textContent = (Math.round(ratingNum * 10) / 10);

  if (ratingValue)
    ratingValue.textContent = ratingNum.toFixed(1);

  if (ratingStars)
    ratingStars.textContent = generarEstrellas(ratingNum);

  if (sessionsMeta)
    sessionsMeta.textContent = `${data.numero_sesiones || 0} clases`;

  // Temas (tomados desde disponibilidades si no hay tabla de temas)
  profileTopicsUl.innerHTML = '';
  const temas = Array.from(new Set((data.disponibilidades || []).map(d => d.nombre_tema).filter(Boolean)));
  if (temas.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'No especificado';
    profileTopicsUl.appendChild(li);
  } else {
    temas.forEach(t => {
      const li = document.createElement('li');
      li.textContent = t;
      profileTopicsUl.appendChild(li);
    });
  }

  // Guardar disponibilidades para el calendario y renderizar
  horarios = (data.disponibilidades || []).map(d => ({
    ...d,
    // asegurar que fechas sean ISO strings en caso contrario
    fecha_inicio: (new Date(d.fecha_inicio)).toISOString(),
    fecha_fin: (new Date(d.fecha_fin)).toISOString()
  }));

  renderWeek();
}

/* =========================
   Calendario semanal: usa `horarios`
   ========================= */
function formatWeekRange(startDate, endDate) {
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  const startStr = startDate.toLocaleDateString('es-MX', options);
  const endStr = endDate.toLocaleDateString('es-MX', options);

  // Si el mes y año son iguales, podemos simplificar a "17–23 oct 2025"
  if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
    return `${startDate.getDate()}–${endDate.getDate()} ${startStr.split(' ')[1]} ${startDate.getFullYear()}`;
  }

  // Si son meses o años distintos, mostramos completo
  return `${startStr} – ${endStr}`;
}

function renderWeek() {
  if (!agendaGrid || !weekLabel) return;
  const end = new Date(start); end.setDate(start.getDate() + 6);
  weekLabel.textContent = formatWeekRange(start, end);

  agendaGrid.innerHTML = '';

  // Filtrar disponibilidades de la semana actual
  const startTs = start.getTime();
  const endTs = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).getTime();

  const semanaSlots = horarios.filter(s => {
    const f = new Date(s.fecha_inicio).getTime();
    return f >= startTs && f <= endTs;
  });

  // Agrupar por día (key = toDateString)
  const porDia = {};
  semanaSlots.forEach(s => {
    const f = new Date(s.fecha_inicio);
    const key = f.toDateString();
    if (!porDia[key]) porDia[key] = [];
    porDia[key].push(s);
  });

  // Crear 7 columnas (lunes..domingo según start)
  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    const col = document.createElement('div');
    col.className = 'day-col';

    const head = document.createElement('div');
    head.className = 'day-col__head';
    head.innerHTML = `<div class="day-col__name">${fmtDay.format(day).split(' ')[0]}</div>
                      <div class="day-col__date">${fmtDay.format(day).split(' ')[1]}</div>`;
    col.appendChild(head);

    const key = day.toDateString();
    const daySlots = (porDia[key] || []).sort((a, b) => new Date(a.fecha_inicio) - new Date(b.fecha_inicio));

    if (daySlots.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'muted';
      empty.textContent = '— sin horarios —';
      col.appendChild(empty);
    } else {
      daySlots.forEach(slot => {
        const d = new Date(slot.fecha_inicio);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'session-item';
        btn.textContent = fmtTime.format(d);

        // mostrar meta en el botón (capacidad / modalidad)
        const meta = document.createElement('div');
        meta.className = 'session-meta';
        meta.textContent = `${slot.tipo_sesion || '1:1'} · ${slot.modalidad || 'virtual'}${slot.capacidad ? ' · ' + slot.capacidad + 'p' : ''}`;
        btn.appendChild(meta);

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
  let html = "";
  for (let i = 0; i < 5; i++) html += i < entero ? "★" : "☆";
  return html;
}

/* =========================
   Selección de slot y modal
   ========================= */
function selectSlot(slotObj, el) {
  // marcar visualmente
  agendaGrid.querySelectorAll('.session-item.selected').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');

  selectedSlot = slotObj;

  // mostrar resumen
  const fecha = new Date(slotObj.fecha_inicio);
  const textoFecha = fecha.toLocaleDateString('es-MX', { weekday: 'long', day: '2-digit', month: 'short' });
  slotSummary.textContent = `Has elegido: ${textoFecha}, ${fmtTime.format(fecha)} (${slotObj.tipo_sesion || '1:1'})`;

  // rellenar opciones de tema (si no hay opciones en modal)
  fillTopicsFromProfile();

  openModal();
}

function openModal() {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'false');
  setTimeout(() => bookForm.querySelector('.f-input')?.focus(), 100);
}

function closeModal() {
  if (!modal) return;
  modal.setAttribute('aria-hidden', 'true');
}
modal.addEventListener('click', (e) => { if (e.target.hasAttribute('data-close')) closeModal(); });
const modalCloseBtn = modal.querySelector('.modal__close');
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* Mostrar campo de capacidad si tipo == Grupo */
if (sessionTipo) {
  sessionTipo.addEventListener('change', () => {
    if (sessionTipo.value === 'Grupo') maxPeople.style.display = 'block';
    else maxPeople.style.display = 'none';
  });
}

/* =========================
   Llenar select de temas desde perfil
   ========================= */
function fillTopicsFromProfile() {
  // Si ya hay opciones, no duplicar
  sessionTema.innerHTML = '';
  const temas = Array.from(new Set(horarios.map(d => d.nombre_tema).filter(Boolean)));
  if (temas.length === 0) {
    const opt = document.createElement('option');
    opt.value = '';
    opt.textContent = 'General';
    sessionTema.appendChild(opt);
  } else {
    temas.forEach(t => {
      const opt = document.createElement('option');
      opt.value = t;
      opt.textContent = t;
      sessionTema.appendChild(opt);
    });
  }
}

/* =========================
   Reserva: envío al backend (si hay token). Si no, redirige a login.
   ========================= */
bookForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  if (!selectedSlot) {
    alert('Selecciona un horario en la agenda.');
    return;
  }

  // Revisa si el usuario está autenticado (token en localStorage)
  const token = localStorage.getItem('token');
  if (!token) {
    // Redirigir a login con retorno
    const url = `/iniciarSesion.html?returnTo=${encodeURIComponent(window.location.href)}`;
    if (confirm('Debes iniciar sesión para reservar. ¿Ir a iniciar sesión ahora?')) {
      window.location.href = url;
    }
    return;
  }

  // Preparar payload mínimo (ajusta según tu backend real)
  const payload = {
    fk_disponibilidad: selectedSlot.id_disponibilidad,
    tema: sessionTema.value || null,
    tipo_sesion: sessionTipo.value || null,
    capacidad: Number(bookForm.querySelector('input[name="capacidad"]')?.value || selectedSlot.capacidad || 1)
  };

  try {
    const res = await fetch(`/api/inscripciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (res.status === 401) {
      alert('Tu sesión expiró. Inicia sesión de nuevo.');
      localStorage.removeItem('token');
      window.location.href = `/iniciarSesion.html?returnTo=${encodeURIComponent(window.location.href)}`;
      return;
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }

    const data = await res.json();
    closeModal();
    alert('Reserva creada correctamente.');
    // Opcional: recargar disponibilidades (si backend devuelve nueva info)
    // recargaPerfil();
  } catch (err) {
    console.error('Error creando reserva:', err);
    alert('No se pudo crear la reserva: ' + (err.message || 'Error'));
  }
});

/* =========================
   Navegación semanas
   ========================= */
prevWeek.addEventListener('click', () => { start.setDate(start.getDate() - 7); renderWeek(); });
nextWeek.addEventListener('click', () => { start.setDate(start.getDate() + 7); renderWeek(); });

/* =========================
   Util: inicio de semana (lunes)
   ========================= */
function startOfWeek(d) {
  const r = new Date(d);
  const day = (r.getDay() + 6) % 7; // 0 = lunes
  r.setDate(r.getDate() - day);
  r.setHours(0, 0, 0, 0);
  return r;
}

/* =========================
   Inicialización: obtener ID y cargar perfil
   ========================= */
async function init() {
  asesorId = getIdFromUrl();
  if (!asesorId) {
    showErrorMessage('ID de asesor ausente en la URL. Serás redirigido a Explorar.');
    window.location.href = '/explorar.html';
    return;
  }

  const perfil = await fetchPerfilAsesor(asesorId);
  if (!perfil) return;
  console.log("Perfil completo recibido:", perfil);
  console.log("Valor de rating en API:", perfil?.puntuacion_promedio);

  renderPerfil(perfil);
}

init();
