/**
 * Mostrar/ocultar indicador de carga en un elemento
 */
function toggleLoading(elementId, show = true, text = "Cargando...") {
  const element = document.getElementById(elementId);
  if (!element) return;

  if (show) {
    element.style.opacity = "0.6";
    element.style.pointerEvents = "none";
    if (element.tagName === "BUTTON") {
      element.dataset.originalText = element.textContent;
      element.textContent = text;
    }
  } else {
    element.style.opacity = "1";
    element.style.pointerEvents = "auto";
    if (element.tagName === "BUTTON" && element.dataset.originalText) {
      element.textContent = element.dataset.originalText;
      delete element.dataset.originalText;
    }
  }
}

/* ========== API INTEGRATION ========= */
const API_BASE_URL = "/api";

// Verificar si la cuenta fue eliminada
if (sessionStorage.getItem("accountDeleted") === "true") {
  sessionStorage.removeItem("accountDeleted");
  location.replace("iniciarSesion.html");
}

// Obtener usuario del localStorage
const usuarioLocal = JSON.parse(localStorage.getItem("usuario") || "{}");
const CURRENT_ASESOR_ID = usuarioLocal.id || null;
const AUTH_TOKEN = localStorage.getItem("token");

// Verificar autenticación básica
if (!CURRENT_ASESOR_ID || !AUTH_TOKEN) {
  location.replace("iniciarSesion.html");
}

// Verificar autenticación al enfocar la página (ej: al regresar con flecha atrás)
window.addEventListener("pageshow", (event) => {
  // Si la página se cargó desde caché (persisted=true), verificar autenticación
  if (event.persisted || performance.navigation.type === 2) {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
    if (!token || !usuario) {
      // Forzar recarga para evitar estados inconsistentes
      location.replace("iniciarSesion.html");
    }
  }
});

// Verificación adicional cuando la ventana recupera el foco
window.addEventListener("focus", () => {
  const token = localStorage.getItem("token");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!token || !usuario) {
    location.replace("iniciarSesion.html");
  }
});

/**
 * Helper para fetch con autenticación
 */
async function authFetch(url, options = {}) {
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${AUTH_TOKEN}`
  };
  
  // Si es POST/PUT y hay body, asegurar Content-Type JSON si no es FormData
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  
  if (response.status === 401 || response.status === 403) {
    // Token inválido o expirado
    console.warn("Sesión expirada o inválida");
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    localStorage.removeItem("isLoggedIn");
    window.location.href = "iniciarSesion.html";
    throw new Error("Sesión expirada");
  }

  return response;
}

/**
 * Cargar perfil completo del asesor (incluye temas) desde la API
 */
async function cargarPerfilCompletoDesdeAPI() {
  try {
    const response = await authFetch(
      `${API_BASE_URL}/usuarios/asesores/${CURRENT_ASESOR_ID}?t=${Date.now()}`
    );
    const result = await response.json();

    if (response.ok) {
      // Actualizar estado del perfil
      state.profile.name = result.nombre_completo;
      state.profile.career = result.nombre_carrera || "Carrera no especificada";
      state.profile.semester = result.semestre;
      state.profile.email = result.correo_contacto;
      state.profile.advisoriesGiven = result.numero_sesiones;
      state.profile.avatar = result.ruta_foto || "../imagenes/profilepicture.jpg";
      state.profile.stars = result.puntuacion_promedio;
      state.profile.roles = result.roles || [];

      // Actualizar localStorage para mantener sincronía
      const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
      usuario.ruta_foto = state.profile.avatar;
      usuario.nombre_completo = state.profile.name; // También actualizamos nombre por si acaso
      localStorage.setItem("usuario", JSON.stringify(usuario));

      // Actualizar estado de temas
      if (result.temas && Array.isArray(result.temas)) {
        state.topics = result.temas.map((t) => ({
          id_tema: t.id_tema,
          topic: t.nombre_tema,
          area: t.nombre_area,
        }));
      }

      console.log("✅ Perfil y temas cargados:", state.profile);

      // Actualizar UI del header
      $("#chipName").textContent = state.profile.name;
      $("#chipCareer").textContent = `${state.profile.career} · ${state.profile.semester}º`;
      const chipAvatar = $("#chipAvatar");
      chipAvatar.src = state.profile.avatar;
      chipAvatar.onerror = () => { chipAvatar.onerror = null; chipAvatar.src = "../imagenes/profilepicture.jpg"; };

      // Lógica del botón de cambio de rol
      const switchBtn = $('[data-action="switch-role"]');
      if (switchBtn) {
        // Solo mostrar si tiene más de un rol (ej. Asesor y Estudiante)
        if (state.profile.roles.length > 1) {
          switchBtn.hidden = false;
          switchBtn.onclick = () => {
            // Redirigir preservando el ID
            window.location.href = `panelAsesorado.html?id=${CURRENT_ASESOR_ID}`;
          };
        } else {
          switchBtn.hidden = true;
        }
      }

      // Si estamos en la vista de perfil, recargar formulario
      if ($("#view-perfil").classList.contains("is-visible")) {
        loadProfile();
        renderTopics();
      }
    } else {
      console.warn("No se pudo cargar el perfil del asesor");
      toast("Error al cargar perfil", "warning");
    }
  } catch (error) {
    console.error("❌ Error al cargar perfil:", error);
    toast("Error de conexión al cargar perfil", "danger");
  }
}

/**
 * Cargar sesiones/disponibilidades del asesor desde la API
 */
async function cargarSesionesDesdeAPI() {
  try {
    // Mostrar indicador de carga en la lista de sesiones
    const sessionsList = $("#sessionsList");
    if (sessionsList) {
      sessionsList.innerHTML =
        '<li class="card"><p class="dim">⏳ Cargando sesiones...</p></li>';
    }

    // Obtener rango de la semana actual
    const fechaDesde = currentMonday.toISOString().slice(0, 10);
    const fechaHasta = addDays(currentMonday, 6).toISOString().slice(0, 10);

    const response = await authFetch(
      `${API_BASE_URL}/usuarios/asesores/${CURRENT_ASESOR_ID}/disponibilidades?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`
    );
    const result = await response.json();

    if (response.ok && result.success) {
      // Convertir formato de API a formato del estado local
      state.sessions = result.data.map((disp) => ({
        id: disp.id_disponibilidad,
        title: disp.nombre_tema || "Tema Libre",
        mode: disp.modalidad,
        type: disp.tipo_sesion,
        area: disp.nombre_area || "Cualquier área",
        price: disp.precio,
        notes: "Disponible para inscripciones",
        student: disp.inscritos > 0 ? `${disp.inscritos} inscrito(s)` : "—",
        date: {
          start: new Date(disp.fecha_inicio),
          end: new Date(disp.fecha_fin),
        },
      }));

      console.log(
        "✅ Sesiones cargadas desde API:",
        state.sessions.length,
        "sesiones"
      );
    } else {
      console.warn("⚠️ No se pudieron cargar las sesiones desde la API");
      toast("No se pudieron cargar las sesiones", "warning");
    }
  } catch (error) {
    console.error("❌ Error al cargar sesiones desde API:", error);
    toast("Error de conexión al cargar sesiones", "danger");
  }
}

/* ========== UTILIDADES ========= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const toast = (msg, type = "info") => {
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  el.className = `toast ${type}`;
  setTimeout(() => (el.hidden = true), 2500);
};

const confirmDialog = (msg) =>
  new Promise((resolve) => {
    const dlg = $("#confirmDlg");
    $("#confirmMsg").textContent = msg;
    dlg.showModal();
    dlg.addEventListener("close", () => resolve(dlg.returnValue === "ok"), {
      once: true,
    });
  });

/* ========== ESTADO DEMO ========= */
const state = {
  profile: {
    stars: 4.8,
    name: "Mario Ortega",
    career: "Ingeniería Civil",
    semester: 9,
    email: "mario@utmentor.demo",
    avatar: usuarioLocal.ruta_foto || "../imagenes/adviser1.jpg",
    advisoriesGiven: 24,
    roles: [],
  },
  topics: [
    { topic: "Cálculo diferencial", area: "Matemáticas" },
    { topic: "Resistencia de materiales", area: "Física" },
    { topic: "AutoCAD básico", area: "Diseño" },
    { topic: "Tema Libre", area: "Diseño" },
  ],
  // Sesiones de ejemplo. En product, las filtrarás por semana desde tu backend.
  sessions: [],
};

/* Genera ejemplos dentro de la semana actual */
// function seedSessions(weekStart) { ... } (Eliminado para usar API)

/* ========== FECHAS / SEMANAS ========= */
let currentMonday = getMonday(new Date());
// seedSessions(currentMonday); // Eliminamos datos de prueba para usar solo API

function getMonday(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 Lunes … 6 Domingo
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function fmtShort(d) {
  return d
    .toLocaleDateString("es-MX", {
      weekday: "short",
      day: "2-digit",
      month: "short",
    })
    .replace(".", "");
}
function weekLabel(monday) {
  const start = fmtShort(monday);
  const end = fmtShort(addDays(monday, 6));
  return `${start} – ${end}`;
}
function addDayTime(base, dayIndex, start, end) {
  // dayIndex: 0..6 desde lunes
  const startParts = start.split(":").map(Number);
  const endParts = end.split(":").map(Number);
  const s = addDays(base, dayIndex);
  s.setHours(startParts[0], startParts[1] || 0, 0, 0);
  const e = addDays(base, dayIndex);
  e.setHours(endParts[0], endParts[1] || 0, 0, 0);
  return { start: s, end: e };
}

/* ========== INICIO ========= */
window.addEventListener("DOMContentLoaded", async () => {
  // Cargar perfil (incluye temas) y sesiones desde la API
  await cargarPerfilCompletoDesdeAPI();
  await cargarSesionesDesdeAPI();

  // header user chip (ya se actualiza en cargarPerfilCompletoDesdeAPI, pero por si acaso falla la carga inicial)
  $("#chipName").textContent = state.profile.name;
  $(
    "#chipCareer"
  ).textContent = `${state.profile.career} · ${state.profile.semester}º`;
  const chipAvatarInit = $("#chipAvatar");
  chipAvatarInit.src = state.profile.avatar;
  chipAvatarInit.onerror = () => { chipAvatarInit.onerror = null; chipAvatarInit.src = "../imagenes/profilepicture.jpg"; };

  // top bar week label
  renderWeek();

  // sidebar navegación
  $$(".side-link[data-view]").forEach((btn) => {
    btn.addEventListener("click", () => {
      $$(".side-link").forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const id = btn.dataset.view;
      $$(".view").forEach((v) => v.classList.remove("is-visible"));
      $(`#view-${id}`).classList.add("is-visible");
      if (id === "sesiones") renderSessions();
      if (id === "publicar") preparePublishForm();
      if (id === "perfil") {
        loadProfile();
        renderTopics();
      }
    });
  });

  // acciones laterales
  // El botón switch-role se maneja dinámicamente en cargarPerfilCompletoDesdeAPI
  
  $('[data-action="logout"]').addEventListener("click", async () => {
    if (await confirmDialog("¿Estás seguro de cerrar sesión?")) {
      try {
        const response = await authFetch(`${API_BASE_URL}/usuarios/${CURRENT_ASESOR_ID}/logout`, {
          method: "POST",
        });

        // Limpiar localStorage independientemente de la respuesta del servidor
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");

        if (response.ok) {
          toast("Sesión cerrada exitosamente", "success");
        } else {
          console.warn("Error al cerrar sesión en servidor");
        }
        
        setTimeout(() => {
          location.replace("principal.html");
        }, 1000);

      } catch (error) {
        console.error("Error al cerrar sesión:", error);
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        localStorage.removeItem("isLoggedIn");
        location.replace("principal.html");
      }
    }
  });
  $('[data-action="delete-account"]').addEventListener("click", async () => {
    if (
      await confirmDialog("Esto eliminará tu perfil y tus datos. ¿Continuar?")
    ) {
      try {
        const response = await authFetch(`${API_BASE_URL}/usuarios/${CURRENT_ASESOR_ID}`, {
          method: "DELETE",
        });

        if (response.ok) {
          toast("Perfil eliminado correctamente", "success");
          
          // Marcar que la cuenta fue eliminada antes de limpiar
          sessionStorage.setItem("accountDeleted", "true");
          
          // Limpiar sesión local
          localStorage.removeItem("usuario");
          localStorage.removeItem("token");
          localStorage.removeItem("isLoggedIn");

          // Redirigir al inicio o login después de un breve retraso
          setTimeout(() => {
            location.replace("iniciarSesion.html");
          }, 1500);
        } else {
          const res = await response.json();
          toast(res.error || "Error al eliminar el perfil", "danger");
        }
      } catch (error) {
        console.error("Error al eliminar perfil:", error);
        toast("Error de conexión", "danger");
      }
    }
  });

  // controles de semana
  $("#prevWeek").addEventListener("click", async () => {
    currentMonday = addDays(currentMonday, -7);
    renderWeek();
    await cargarSesionesDesdeAPI();
    renderSessions();
  });
  $("#nextWeek").addEventListener("click", async () => {
    currentMonday = addDays(currentMonday, 7);
    renderWeek();
    await cargarSesionesDesdeAPI();
    renderSessions();
  });
  $("#thisWeek").addEventListener("click", async () => {
    currentMonday = getMonday(new Date());
    renderWeek();
    await cargarSesionesDesdeAPI();
    renderSessions();
  });

  // sesiones inicial
  renderSessions();
});

/* ========== RENDER: SEMANA ========= */
function renderWeek() {
  $("#weekLabel").textContent = weekLabel(currentMonday);
}

/* ========== RENDER: SESIONES ========= */
function withinWeek(dateObj) {
  const start = currentMonday.getTime();
  const end = addDays(currentMonday, 7).getTime();
  const t = dateObj.start.getTime();
  return t >= start && t < end;
}

async function cargarEstudiantesInscritos(idDisponibilidad, sessionElement) {
  console.log("🔍 Cargando estudiantes para disponibilidad:", idDisponibilidad);
  
  const estudiantesContainer = sessionElement.querySelector('[data-slot="estudiantes"]');
  const estudiantesList = estudiantesContainer?.querySelector('ul');
  
  console.log("  - Container encontrado:", !!estudiantesContainer);
  console.log("  - Lista encontrada:", !!estudiantesList);
  
  if (!estudiantesContainer || !estudiantesList) {
    console.warn("⚠️ No se encontró el contenedor de estudiantes");
    return;
  }

  try {
    const url = `${API_BASE_URL}/usuarios/asesores/${CURRENT_ASESOR_ID}/disponibilidades/${idDisponibilidad}/estudiantes`;
    console.log("  - Fetch a:", url);
    
    const response = await authFetch(url);
    const result = await response.json();

    console.log("  - Respuesta:", result);

    if (response.ok && result.success) {
      if (result.data.length > 0) {
        console.log(`  - ✅ ${result.data.length} estudiante(s) encontrado(s)`);
        estudiantesContainer.hidden = false;
        estudiantesList.innerHTML = "";
        
        result.data.forEach((estudiante, index) => {
          const li = document.createElement("li");
          li.style.cssText = `
            padding: 0.75rem;
            margin-bottom: 0.5rem;
            background: white;
            border-radius: 4px;
            border-left: 3px solid #4285f4;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          `;
          li.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: #4285f4; color: white; border-radius: 50%; font-size: 0.75rem; font-weight: bold;">${index + 1}</span>
              <strong style="font-size: 0.95rem; color: #333;">${escapeHTML(estudiante.nombre_completo)}</strong>
            </div>
            <div style="padding-left: 2rem;">
              <span style="font-size: 0.85rem; color: #666;">📧 ${escapeHTML(estudiante.correo)}</span><br>
              <small style="font-size: 0.75rem; color: #999;">📅 Inscrito: ${new Date(estudiante.fecha_reserva).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</small>
            </div>
          `;
          estudiantesList.appendChild(li);
        });
      } else {
        console.log("  - ℹ️ No hay estudiantes inscritos");
        estudiantesContainer.hidden = true;
      }
    } else {
      console.warn("  - ⚠️ Error en respuesta:", result);
      estudiantesContainer.hidden = true;
    }
  } catch (error) {
    console.error("❌ Error al cargar estudiantes inscritos:", error);
    estudiantesContainer.hidden = true;
  }
}

function renderSessions() {
  const ul = $("#sessionsList");
  ul.innerHTML = "";

  // (en producción pedir al backend filtrado semanal)
  const weekSessions = state.sessions.filter((s) => withinWeek(s.date));
  if (!weekSessions.length) {
    ul.innerHTML = `<li class="card"><p class="dim">No tienes sesiones programadas esta semana.</p></li>`;
    return;
  }

  const tpl = $("#sessionCardTpl");
  weekSessions.forEach((s) => {
    const li = tpl.content.firstElementChild.cloneNode(true);
    li.dataset.id = s.id;
    
    // Extraer número de inscritos del string "X inscrito(s)" o "—"
    const studentText = s.student || "—";
    const numInscritos = studentText.match(/(\d+)\s*inscrito/i) ? parseInt(studentText.match(/(\d+)/)[0]) : 0;
    
    // Mostrar título con badge de inscritos si hay alguno
    const titleElement = li.querySelector('[data-slot="title"]');
    titleElement.textContent = s.title;
    
    if (numInscritos > 0) {
      const badge = document.createElement("span");
      badge.style.cssText = `
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 0.5rem;
        padding: 0.2rem 0.5rem;
        background: #4CAF50;
        color: white;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: bold;
      `;
      badge.textContent = `+${numInscritos}`;
      badge.title = `${numInscritos} estudiante${numInscritos > 1 ? 's' : ''} inscrito${numInscritos > 1 ? 's' : ''}`;
      titleElement.appendChild(badge);
    }
    
    li.querySelector('[data-slot="mode"]').textContent =
      s.mode === "virtual" ? "Virtual" : "Presencial";
    li.querySelector('[data-slot="area"]').textContent = s.area;
    li.querySelector('[data-slot="type"]').textContent =
      s.type === "grupal" ? "Grupal" : "Individual";
    li.querySelector('[data-slot="price"]').textContent = `$${s.price}`;
    li.querySelector('[data-slot="notes"]').textContent = s.notes || "—";
    li.querySelector('[data-slot="student"]').textContent = studentText;
    li.querySelector('[data-slot="date"]').textContent = formatRange(
      s.date.start,
      s.date.end
    );

    li.querySelector('[data-action="toggle"]').addEventListener("click", async () => {
      const detail = li.querySelector(".session-detail");
      const hidden = detail.hasAttribute("hidden");
      if (hidden) {
        detail.removeAttribute("hidden");
        // Cargar estudiantes inscritos si hay alguno
        await cargarEstudiantesInscritos(s.id, li);
      } else {
        detail.setAttribute("hidden", "");
      }
    });

    li.querySelector('[data-action="cancel"]').addEventListener(
      "click",
      async () => {
        const ok = await confirmDialog(
          "¿Cancelar esta sesión? El alumno será notificado."
        );
        if (!ok) return;

        try {
          const response = await authFetch(
            `${API_BASE_URL}/usuarios/asesores/${CURRENT_ASESOR_ID}/disponibilidades/${s.id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            // Actualizar estado local y UI
            state.sessions = state.sessions.filter((x) => x.id !== s.id);
            renderSessions();
            toast("Sesión cancelada correctamente", "success");
          } else {
            const res = await response.json();
            toast(res.error || "Error al cancelar la sesión", "danger");
          }
        } catch (error) {
          console.error("Error al cancelar sesión:", error);
          toast("Error de conexión", "danger");
        }
      }
    );

    ul.appendChild(li);
  });
}
function formatRange(s, e) {
  const opts = { weekday: "short", day: "2-digit", month: "short" };
  const day = s.toLocaleDateString("es-MX", opts).replace(".", "");
  const pad = (n) => String(n).padStart(2, "0");
  return `${day} ${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(
    e.getHours()
  )}:${pad(e.getMinutes())}`;
}

/* ========== PUBLICAR DISPONIBILIDAD ========= */
function preparePublishForm() {
  // Cargar temas del asesor
  const topicSel = $("#topicSel");
  topicSel.innerHTML = "";
  state.topics.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.topic;
    opt.textContent = t.topic;
    topicSel.appendChild(opt);
  });

  // Agregar "Tema Libre" manualmente
  const optLibre = document.createElement("option");
  optLibre.value = "Tema Libre";
  optLibre.textContent = "Tema Libre";
  topicSel.appendChild(optLibre);

  // Lógica para actualizar el área automáticamente
  const areaDisplay = $("#areaDisplay");
  const updateArea = () => {
    const val = topicSel.value;
    if (val === "Tema Libre") {
      areaDisplay.value = "Cualquier área";
    } else {
      const found = state.topics.find((t) => t.topic === val);
      areaDisplay.value = found ? found.area : "";
    }
  };
  topicSel.addEventListener("change", updateArea);
  updateArea(); // Inicializar

  // Días de la semana actual
  const daySel = $("#daySel");
  daySel.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const d = addDays(currentMonday, i);
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = d.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "2-digit",
      month: "short",
    });
    daySel.appendChild(opt);
  }

  // Reset de resultado
  $("#publishResult").hidden = true;

  // Submit
  $("#publishForm").onsubmit = async (e) => {
    e.preventDefault();
    const topic = $("#topicCustom").hidden
      ? $("#topicSel").value
      : $("#topicCustom").value.trim();
    
    console.log("🔍 DEBUG Publicar Disponibilidad:");
    console.log("  - topic seleccionado:", topic);
    console.log("  - state.topics:", state.topics);
    const dayIdx = Number($("#daySel").value);
    const start = $("#startTime").value;
    const end = $("#endTime").value;
    const mode = $("#modeSel").value;
    const type = $("#typeSel").value;
    const price = Number($("#price").value || 0);
    
    // Validaciones mínimas
    if (!topic) {
      return toast("Indica un tema válido", "danger");
    }
    if (!start || !end || end <= start) {
      return toast("Verifica horario (fin debe ser mayor a inicio)", "danger");
    }
    if (price < 0) {
      return toast("El precio no puede ser negativo", "danger");
    }

    // Preparar datos para la API
    const fechaInicio = addDayTime(currentMonday, dayIdx, start, end).start;
    const fechaFin = addDayTime(currentMonday, dayIdx, start, end).end;

    // Determinar fk_tema con logging
    let fk_tema = null;
    if (topic === "Tema Libre") {
      console.log("  - Tema Libre detectado, fk_tema = null");
      fk_tema = null;
    } else {
      const foundTopic = state.topics.find((t) => t.topic === topic);
      console.log("  - Búsqueda de tema:", foundTopic);
      fk_tema = foundTopic?.id_tema || null;
      console.log("  - fk_tema final:", fk_tema);
    }

    const disponibilidadData = {
      fecha_inicio: fechaInicio.toISOString().slice(0, 19),
      fecha_fin: fechaFin.toISOString().slice(0, 19),
      modalidad: mode,
      tipo_sesion: type,
      fk_tema: fk_tema,
      precio: price,
      capacidad: type === "individual" ? 1 : 2,
    };
    console.log("  - disponibilidadData completo:", disponibilidadData);
    try {
      // Mostrar indicador de carga
      const submitBtn = document.querySelector(
        '#publishForm button[type="submit"]'
      );
      toggleLoading("publishResult", true);
      if (submitBtn) {
        toggleLoading(submitBtn.id || "submitBtn", true, "Publicando...");
        submitBtn.disabled = true;
      }

      // Llamar a la API para crear la disponibilidad
      const response = await authFetch(
        `${API_BASE_URL}/usuarios/asesores/${CURRENT_ASESOR_ID}/disponibilidades`,
        {
          method: "POST",
          body: JSON.stringify(disponibilidadData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        // Recargar sesiones desde la API para tener datos actualizados
        await cargarSesionesDesdeAPI();

        // Mostrar resumen con datos reales de la API
        const box = $("#publishResult");
        box.hidden = false;
        box.innerHTML = `
          <p><strong>Sesión publicada exitosamente</strong></p>
          <ul>
            <li><strong>ID:</strong> ${result.data.id_disponibilidad}</li>
            <li><strong>Tema:</strong> ${result.data.nombre_tema || topic}</li>
            <li><strong>Área:</strong> ${
              result.data.nombre_area || "Cualquier área"
            }</li>
            <li><strong>Fecha:</strong> ${formatRange(
              fechaInicio,
              fechaFin
            )}</li>
            <li><strong>Modalidad:</strong> ${
              mode === "virtual" ? "Virtual" : "Presencial"
            }</li>
            <li><strong>Tipo:</strong> ${
              type === "individual" ? "Individual" : "Grupal"
            }</li>
            <li><strong>Capacidad:</strong> ${
              result.data.capacidad
            } persona(s)</li>
            <li><strong>Precio:</strong> $${price} MXN</li>
          </ul>
          <p class="muted">La sesión está ahora disponible para que los asesorados se inscriban.</p>
        `;

        // Limpiar formulario
        $("#publishForm").reset();
        $("#topicCustom").hidden = true;

        toast("Disponibilidad publicada", "success");
        renderSessions();
      } else {
        toast(result.message || "Error al publicar disponibilidad", "danger");
      }
    } catch (error) {
      console.error("Error al publicar disponibilidad:", error);
      toast("Error de conexión. Intenta de nuevo.", "danger");
    } finally {
      // Ocultar indicadores de carga
      const submitBtn = document.querySelector(
        '#publishForm button[type="submit"]'
      );
      toggleLoading("publishResult", false);
      if (submitBtn) {
        toggleLoading(submitBtn.id || "submitBtn", false);
        submitBtn.disabled = false;
      }
    }
  };

  $("#cancelPublish").onclick = () => {
    $("#publishForm").reset();
    $("#topicCustom").hidden = true;
    $("#publishResult").hidden = true;
  };
}
function guessArea(topic) {
  const hit = state.topics.find(
    (t) => t.topic.toLowerCase() === topic.toLowerCase()
  );
  return hit ? hit.area : "Otra";
}

/* ========== TEMAS ========= */
function renderTopics() {
  const wrap = $("#topicsList");
  if (!wrap) return; // Si no existe el elemento, salir

  wrap.innerHTML = "";
  const tpl = $("#topicRowTpl");

  state.topics.forEach((t) => {
    const row = tpl.content.firstElementChild.cloneNode(true);
    row.querySelector(".topic-input").value = t.topic;
    row.querySelector(".topic-area").value = t.area;
    row
      .querySelector('[data-action="remove-topic"]')
      .addEventListener("click", () => {
        row.remove();
      });
    wrap.appendChild(row);
  });

  // Limpiar event listeners previos
  const addTopicBtn = $("#addTopic");
  const topicsForm = $("#topicsForm");

  if (addTopicBtn) {
    addTopicBtn.onclick = null; // Limpiar listener previo
    addTopicBtn.onclick = () => {
      const row = tpl.content.firstElementChild.cloneNode(true);
      row
        .querySelector('[data-action="remove-topic"]')
        .addEventListener("click", () => row.remove());
      wrap.appendChild(row);
      row.querySelector(".topic-input").focus();
    };
  }

  // El manejo del submit del formulario se hace en loadProfile() para incluir todos los datos
}

/* ========== PERFIL ========= */
function loadProfile() {
  const profileAvatar = $("#profileAvatar");
  profileAvatar.src = state.profile.avatar;
  profileAvatar.onerror = () => { profileAvatar.onerror = null; profileAvatar.src = "../imagenes/profilepicture.jpg"; };
  $("#pName").value = state.profile.name;
  $("#pCareer").value = state.profile.career;
  $("#pSemester").value = state.profile.semester;
  $("#pEmail").value = state.profile.email;
  $("#pAdvisories").value = state.profile.advisoriesGiven;

  // Click en foto para cambiar
  $("#profileAvatar").onclick = () => $("#photoInput").click();

  // foto
  $("#photoInput").onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview inmediato
    const previewUrl = URL.createObjectURL(file);
    $("#profileAvatar").src = previewUrl;

    // Subir a la API
    const formData = new FormData();
    formData.append('foto', file);

    try {
      // Indicador visual simple (opacidad)
      $("#profileAvatar").style.opacity = "0.5";
      toast("Subiendo foto...", "info");

      const response = await authFetch(`${API_BASE_URL}/usuarios/asesores/${CURRENT_ASESOR_ID}/foto`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        state.profile.avatar = result.url;
        $("#profileAvatar").src = result.url;
        $("#chipAvatar").src = result.url;

        // Actualizar localStorage
        const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
        usuario.ruta_foto = result.url;
        localStorage.setItem("usuario", JSON.stringify(usuario));

        toast("Foto actualizada correctamente", "success");
      } else {
        throw new Error(result.error || "Error al subir foto");
      }
    } catch (error) {
      console.error("Error subiendo foto:", error);
      toast("Error al subir la foto", "danger");
      // Revertir imagen
      $("#profileAvatar").src = state.profile.avatar;
    } finally {
      $("#profileAvatar").style.opacity = "1";
      // Limpiar input para permitir subir la misma foto si se desea
      $("#photoInput").value = "";
    }
  };

  // Eliminar foto
  const deleteBtn = $("#deletePhotoBtn");
  if (deleteBtn) {
    deleteBtn.onclick = async () => {
      if (await confirmDialog("¿Eliminar foto de perfil?")) {
        const defaultAvatar = "../imagenes/adviser1.jpg"; // Imagen por defecto

        try {
          // Actualizar en backend
          const response = await authFetch(`${API_BASE_URL}/usuarios/asesores/${CURRENT_ASESOR_ID}`, {
            method: 'PUT',
            body: JSON.stringify({ ruta_foto: defaultAvatar })
          });

          if (response.ok) {
            // Actualizar UI y estado local solo si el backend respondió OK
            state.profile.avatar = defaultAvatar;
            $("#profileAvatar").src = defaultAvatar;
            $("#chipAvatar").src = defaultAvatar;
            $("#photoInput").value = ""; // Limpiar input file

            // Actualizar localStorage
            const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");
            usuario.ruta_foto = defaultAvatar;
            localStorage.setItem("usuario", JSON.stringify(usuario));

            toast("Foto eliminada correctamente");
          } else {
            const res = await response.json();
            toast(res.error || "Error al eliminar la foto", "danger");
          }
        } catch (error) {
          console.error("Error al eliminar foto:", error);
          toast("Error de conexión", "danger");
        }
      }
    };
  }

  // Manejo del formulario de temas (ahora guarda TODO)
  const topicsForm = $("#topicsForm");
  if (topicsForm) {
    topicsForm.onsubmit = async (e) => {
      e.preventDefault();
      
      // 1. Recolectar datos del perfil
      const name = $("#pName").value.trim();
      const career = $("#pCareer").value.trim();
      const semester = Number($("#pSemester").value);

      if (!name || !career || !semester) {
        return toast("Completa los campos obligatorios del perfil", "danger");
      }

      // 2. Recolectar temas
      const rows = $$(".topic-row", $("#topicsList"));
      const list = [];
      for (const r of rows) {
        const topic = r.querySelector(".topic-input").value.trim();
        const area = r.querySelector(".topic-area").value;
        if (!topic) {
          return toast("Hay un tema vacío.", "danger");
        }
        list.push({ topic, area });
      }

      try {
        toggleLoading("saveAllBtn", true, "Guardando...");
        
        const updateData = {
          nombre_completo: name,
          semestre: semester,
          // fk_carrera: ... (si tuviéramos select)
          temas: list
        };

        const response = await authFetch(
          `${API_BASE_URL}/usuarios/asesores/${CURRENT_ASESOR_ID}`,
          {
            method: "PUT",
            body: JSON.stringify(updateData),
          }
        );

        if (response.ok) {
          // Actualizar estado local
          state.profile.name = name;
          state.profile.career = career;
          state.profile.semester = semester;
          state.topics = list;

          // Actualizar UI
          $("#chipName").textContent = name;
          $("#chipCareer").textContent = `${career} · ${semester}º`;
          
          // Refrescar dropdown de publicación
          preparePublishForm();
          
          toast("Cambios guardados exitosamente", "success");
        } else {
          const result = await response.json();
          toast(result.error || "Error al guardar cambios", "danger");
        }
      } catch (error) {
        console.error("Error al guardar cambios:", error);
        toast("Error de conexión", "danger");
      } finally {
        toggleLoading("saveAllBtn", false);
      }
    };
  }
}

/* ========== SEGURIDAD BÁSICA ========= */
function escapeHTML(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
