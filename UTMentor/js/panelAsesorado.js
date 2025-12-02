/* ===== Utilities (mismas del panel del asesor) ===== */
import { obtenerAsesores } from "./services/asesorService.js";

const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// === AUTH CHECK ===
// Verificar si la cuenta fue eliminada
if (sessionStorage.getItem("accountDeleted") === "true") {
  sessionStorage.removeItem("accountDeleted");
  location.replace("iniciarSesion.html");
}

const token = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

if (!token || !usuario) {
  location.replace("iniciarSesion.html");
}

const USER_ID = usuario.id;

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

// Helper para fetch con auth
async function authFetch(url, options = {}) {
  const headers = {
    ...options.headers,
    "Authorization": `Bearer ${token}`
  };
  
  // Si es POST/PUT y hay body, asegurar Content-Type si no es FormData
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 || res.status === 403) {
    // Token expirado o inválido
    localStorage.clear();
    location.replace("iniciarSesion.html");
    throw new Error("Sesión expirada");
  }
  return res;
}

const toast = (msg, type="info")=>{
  const el = $("#toast");
  el.textContent = msg;
  el.hidden = false;
  el.className = `toast ${type}`;
  setTimeout(()=> el.hidden = true, 2500);
};

const confirmDialog = (msg)=> new Promise(resolve=>{
  const dlg = $("#confirmDlg");
  $("#confirmMsg").textContent = msg;
  dlg.showModal();
  dlg.addEventListener("close", ()=> resolve(dlg.returnValue === "ok"), {once:true});
});

/* ===== Estado demo (asesorado) ===== */
const state = {
  profile: {
    stars: 4.9,
    name: "Lucía Hernández",
    career: "Ingeniería en Computación",
    semester: 5,
    email: "lucia@utmentor.demo",
    avatar: usuario.ruta_foto || "../imagenes/profilepicture.jpg"
  },
  sessions: [], // se llena según semana
  ratings: [
    { id: 1, tutor: "Mario Ortega", topic: "Derivadas parciales", date: "10 Oct", avatar: "../imagenes/adviser1.jpg" },
    { id: 2, tutor: "Ana Ruiz", topic: "Física I", date: "08 Oct", avatar: "../imagenes/adviser3.jpg" }
  ],
  favorites: [] // Se llenará desde el backend
};

/* ===== Semana y helpers de fecha ===== */
let currentMonday = getMonday(new Date());
// seedSessions(currentMonday); // Eliminamos datos semilla

function getMonday(date){
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0..6 (lunes..domingo)
  d.setDate(d.getDate() - day);
  d.setHours(0,0,0,0);
  return d;
}
function addDays(d, n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function fmtShort(dt){
  return dt.toLocaleDateString("es-MX",{weekday:"short", day:"2-digit", month:"short"}).replace(".","");
}
function weekLabel(monday){
  return `${fmtShort(monday)} – ${fmtShort(addDays(monday,6))}`;
}
function addDayTime(base, dayIdx, start, end){
  const s = addDays(base, dayIdx); const e = addDays(base, dayIdx);
  const [sh, sm=0] = start.split(":").map(Number);
  const [eh, em=0] = end.split(":").map(Number);
  s.setHours(sh, sm, 0, 0);
  e.setHours(eh, em, 0, 0);
  return {start:s, end:e};
}
function formatRange(s,e){
  const day = s.toLocaleDateString('es-MX',{weekday:'short', day:'2-digit', month:'short'}).replace('.','');
  const pad = n=>String(n).padStart(2,'0');
  return `${day} ${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
}

/* Obtener sesiones desde el backend */
async function fetchSessions() {
  try {
    const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/${USER_ID}/asesorias`);
    if (!res.ok) throw new Error("Error al obtener sesiones");
    const data = await res.json();

    const now = new Date();
    const upcoming = [];
    const pendingRating = [];

    data.forEach(item => {
      if (item.estado === 'cancelada') return;

      const endDate = new Date(item.fecha_fin);
      const session = {
        id: item.id_inscripcion,
        advisorId: item.fk_asesor,
        title: item.nombre_tema || "Asesoría",
        area: "General",
        mode: item.modalidad,
        type: item.tipo_sesion,
        price: item.precio,
        notes: "",
        tutor: item.nombre_asesor,
        avatar: item.foto_asesor, // Aseguramos tener la foto para la tarjeta de calificación
        date: {
          start: new Date(item.fecha_inicio),
          end: endDate
        },
        // Formato de fecha string para la tarjeta de calificación
        dateStr: new Date(item.fecha_inicio).toLocaleDateString("es-MX", {day: 'numeric', month: 'short'})
      };

      // Lógica de separación
      // Si la fecha fin es mayor a ahora, es futura (o en curso) -> Mis Sesiones
      // Si ya pasó Y no tiene calificación -> Calificar Asesores
      if (endDate > now) {
        upcoming.push(session);
      } else if (!item.id_calificacion) {
        // Asesoría pasada sin calificar
        // Adaptamos estructura para ratings
        pendingRating.push({
            id: session.id,
            advisorId: session.advisorId,
            tutor: session.tutor,
            topic: session.title,
            date: session.dateStr,
            avatar: session.avatar
        });
      }
    });

    state.sessions = upcoming;
    state.ratings = pendingRating;

    renderSessions();
    renderRatings(); // Actualizamos también la lista de calificaciones
  } catch (error) {
    console.error("Error fetching sessions:", error);
    toast("Error al cargar sesiones", "danger");
  }
}

/* ===== Inicio ===== */
window.addEventListener("DOMContentLoaded", ()=>{
  // Cargar perfil inmediatamente para mostrar datos reales
  loadProfile();
  initExplorarView();

  renderWeek();
  fetchSessions(); // Cargar sesiones reales

  // Si venimos de "Volver a Explorar" o "Favoritos", activar esa vista
  const hash = window.location.hash;
  if (hash === "#explorar" || hash === "#favoritos") {
    const viewId = hash.replace("#", "");
    const btn = $(`.side-link[data-view="${viewId}"]`);
    if (btn) {
      // Pequeño delay para asegurar que todo cargó
      setTimeout(() => btn.click(), 100);
    }
  }

  // Navegación por vistas
  $$(".side-link[data-view]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $$(".side-link").forEach(b=>b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const id = btn.dataset.view;
      $$(".view").forEach(v=>v.classList.remove("is-visible"));
      $(`#view-${id}`).classList.add("is-visible");
      
      if (id === "sesiones") fetchSessions(); // Recargar al volver a la vista
      if (id === "calificar") renderRatings();
      if (id === "favoritos") fetchFavorites();
      if (id === "perfil")   loadProfile();
    });
  });

  // Cambio de rol
  const btnSwitch = $("#btnSwitchRole");
  if(btnSwitch) {
      btnSwitch.addEventListener("click", ()=>{
        toast("Cambiando a vista de Asesor...");
        setTimeout(() => location.href = "panelAsesor.html", 800);
      });
  }

  $('[data-action="logout"]').addEventListener("click", async ()=>{
    if (await confirmDialog("¿Deseas cerrar sesión?")){
      try {
        const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/${USER_ID}/logout`, {
          method: "POST"
        });
        
        // Limpiar sesión local independientemente de la respuesta del servidor
        localStorage.clear();
        toast("Sesión cerrada", "success");
        setTimeout(() => location.replace("iniciarSesion.html"), 1000);

      } catch (error) {
        console.error(error);
        // Forzar salida en caso de error de red
        localStorage.clear();
        location.replace("iniciarSesion.html");
      }
    }
  });
  $('[data-action="delete-account"]').addEventListener("click", async ()=>{
    if (await confirmDialog("Esto eliminará tu cuenta permanentemente. ¿Continuar?")){
      try {
        const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/${USER_ID}`, {
          method: "DELETE"
        });
        if (res.ok) {
          // Marcar que la cuenta fue eliminada antes de limpiar
          sessionStorage.setItem("accountDeleted", "true");
          localStorage.clear(); // Limpiar storage al eliminar cuenta
          toast("Perfil eliminado", "success");
          setTimeout(() => location.replace("iniciarSesion.html"), 1500);
        } else {
          const err = await res.json();
          toast(err.error || "Error al eliminar cuenta", "danger");
        }
      } catch (error) {
        console.error(error);
        toast("Error de conexión", "danger");
      }
    }
  });

  // Controles semana
  $("#prevWeek").addEventListener("click", ()=>{ currentMonday = addDays(currentMonday,-7); renderWeek(); renderSessions(); });
  $("#nextWeek").addEventListener("click", ()=>{ currentMonday = addDays(currentMonday, 7); renderWeek(); renderSessions(); });
  $("#thisWeek").addEventListener("click", ()=>{ currentMonday = getMonday(new Date()); renderWeek(); renderSessions(); });
});

/* ===== Semana ===== */
function renderWeek(){
  $("#weekLabel").textContent = weekLabel(currentMonday);
}

/* ===== Sesiones ===== */
function withinWeek(range){
  const start = currentMonday.getTime();
  const end   = addDays(currentMonday,7).getTime();
  const t     = range.start.getTime();
  return t >= start && t < end;
}

function renderSessions(){
  const ul = $("#sessionsList");
  ul.innerHTML = "";
  const weekSessions = state.sessions.filter(s=>withinWeek(s.date));

  if (!weekSessions.length){
    ul.innerHTML = `
      <li class="card">
        <p class="dim">No tienes sesiones esta semana.</p>
        <div class="mt"><a class="btn" href="explorar.html">Explorar asesores</a></div>
      </li>`;
    return;
  }

  const tpl = $("#sessionCardTpl");
  weekSessions.forEach(s=>{
    const li = tpl.content.firstElementChild.cloneNode(true);
    li.dataset.id = s.id;
    li.querySelector('[data-slot="title"]').textContent  = s.title;
    li.querySelector('[data-slot="title2"]').textContent = s.title;
    li.querySelector('[data-slot="area"]').textContent   = s.area;
    li.querySelector('[data-slot="mode"]').textContent   = s.mode === "virtual" ? "Virtual" : "Presencial";
    li.querySelector('[data-slot="type"]').textContent   = s.type === "grupal" ? "Grupal" : "Individual";
    li.querySelector('[data-slot="price"]').textContent  = `$${s.price}`;
    li.querySelector('[data-slot="notes"]').textContent  = s.notes || "—";
    li.querySelector('[data-slot="tutor"]').textContent  = s.tutor;
    li.querySelector('[data-slot="date"]').textContent   = formatRange(s.date.start, s.date.end);

    li.querySelector('[data-action="toggle"]').addEventListener("click", ()=>{
      const detail = li.querySelector(".session-detail");
      detail.toggleAttribute("hidden");
    });

    li.querySelector('[data-action="cancel"]').addEventListener("click", async ()=>{
      const ok = await confirmDialog("¿Estás seguro de cancelar esta asesoría?");
      if (!ok) return;

      try {
        const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/${USER_ID}/asesorias/${s.id}`, {
            method: "DELETE",
            body: JSON.stringify({ motivo: "Cancelado por el usuario desde el panel" })
        });

        if (res.ok) {
            state.sessions = state.sessions.filter(x=>x.id !== s.id);
            renderSessions();
            toast("Sesión cancelada", "success");
        } else {
            const err = await res.json();
            toast(err.error || "Error al cancelar", "danger");
        }
      } catch (e) {
        console.error(e);
        toast("Error de conexión", "danger");
      }
    });

    ul.appendChild(li);
  });
}

/* ===== Calificaciones ===== */
function renderRatings() {
    const ul = $("#ratingList");
    ul.innerHTML = "";
    if (!state.ratings.length) {
      ul.innerHTML = '<p class="muted">No tienes calificaciones pendientes.</p>';
      return;
    }
    const tpl = $("#ratingCardTpl");
    state.ratings.forEach(r => {
      const li = tpl.content.firstElementChild.cloneNode(true);
      li.querySelector('[data-slot="tutorName"]').textContent = r.tutor;
      li.querySelector('[data-slot="topic"]').textContent = r.topic;
      li.querySelector('[data-slot="date"]').textContent = r.date;
      
      const img = li.querySelector('[data-slot="avatar"]');
      if(img) {
        img.src = r.avatar || "../imagenes/profilepicture.jpg";
        img.onerror = () => { img.onerror = null; img.src = "../imagenes/profilepicture.jpg"; };
      }

      // Botones
      li.querySelector('[data-action="rate"]').onclick = () => openRatingModal(r);
      
      li.querySelector('[data-action="skip"]').onclick = async () => {
          if(await confirmDialog("¿Omitir calificación? Desaparecerá de la lista.")) {
              state.ratings = state.ratings.filter(x => x.id !== r.id);
              renderRatings();
              toast("Calificación omitida");
          }
      };

      ul.appendChild(li);
    });
}

function openRatingModal(ratingItem) {
    const dlg = $("#ratingDlg");
    $("#ratingTutorName").textContent = ratingItem.tutor;
    
    // Reset form
    dlg.querySelector("form").reset();
    
    dlg.showModal();
    
    $("#btnSubmitRating").onclick = async (e) => {
        e.preventDefault(); // Prevent form submission
        const starsInput = dlg.querySelector('input[name="rating"]:checked');
        const stars = starsInput ? parseInt(starsInput.value) : 0;
        
        // Si no selecciona estrellas, se envía 0.

        try {
            // Usamos el endpoint específico para calificar la sesión por su ID
            const res = await authFetch(`${API_CONFIG.baseURL}/api/asesorias/${ratingItem.id}/calificar`, {
                method: "POST",
                body: JSON.stringify({
                    puntuacion: stars
                    // comentario omitido según requerimiento
                })
            });

            if (res.ok) {
                const msg = stars === 0 ? "Calificación enviada: 0 estrellas" : "¡Gracias por tu calificación!";
                toast(msg, stars === 0 ? "info" : "success");
                
                // Eliminar de la lista localmente para que desaparezca la card inmediatamente
                state.ratings = state.ratings.filter(r => String(r.id) !== String(ratingItem.id));
                renderRatings();
                dlg.close();
            } else {
                const err = await res.json();
                toast(err.error || "Error al enviar calificación", "danger");
            }
        } catch (error) {
            console.error(error);
            toast("Error de conexión", "danger");
        }
    };
}

/* ===== Favoritos ===== */
async function fetchFavorites() {
  try {
    const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/${USER_ID}/favoritos`);
    if (!res.ok) throw new Error("Error al obtener favoritos");
    const data = await res.json();
    
    // Mapear datos del backend al formato del estado
    state.favorites = data.map(f => ({
      id: f.id_asesor,
      name: f.nombre_completo,
      career: f.nombre_carrera || "Sin carrera",
      avatar: f.ruta_foto || "../imagenes/profilepicture.jpg"
    }));
    
    renderFavorites();
  } catch (error) {
    console.error("Error fetching favorites:", error);
    toast("Error al cargar favoritos", "danger");
  }
}

function renderFavorites() {
    const ul = $("#favoritesList");
    ul.innerHTML = "";
    if (!state.favorites.length) {
      ul.innerHTML = '<p class="muted">No tienes asesores favoritos.</p>';
      return;
    }
    const tpl = $("#favoriteCardTpl");
    state.favorites.forEach(f => {
      const li = tpl.content.firstElementChild.cloneNode(true);
      li.querySelector('[data-slot="name"]').textContent = f.name;
      li.querySelector('[data-slot="career"]').textContent = f.career;
      const img = li.querySelector('[data-slot="avatar"]');
      if(img) {
        img.src = f.avatar;
        img.onerror = () => { img.onerror = null; img.src = "../imagenes/profilepicture.jpg"; };
      }
      
      li.querySelector('[data-action="view-profile"]').onclick = () => {
          // Redirigir con parámetro de origen
          window.location.href = `panelPublicoAsesor.html?id=${f.id}&from=favoritos`;
      };

      li.querySelector('[data-action="remove-fav"]').onclick = async () => {
          if(await confirmDialog(`¿Eliminar a ${f.name} de favoritos?`)) {
              try {
                  const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/${USER_ID}/favoritos/${f.id}`, {
                      method: "DELETE"
                  });

                  if (res.ok) {
                      state.favorites = state.favorites.filter(x => x.id !== f.id);
                      renderFavorites();
                      toast("Eliminado de favoritos", "success");
                  } else {
                      const err = await res.json();
                      toast(err.error || "Error al eliminar favorito", "danger");
                  }
              } catch (error) {
                  console.error(error);
                  toast("Error de conexión", "danger");
              }
          }
      };
      ul.appendChild(li);
    });
}

/* ===== Perfil ===== */
async function loadProfile(){
  try {
    // Consumir endpoint para usuario ID dinámico
    const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/${USER_ID}`);
    if (res.ok) {
      const user = await res.json();
      state.profile.name = user.nombre_completo;
      state.profile.email = user.correo;
      state.profile.semester = user.semestre;
      state.profile.career = user.nombre_carrera || "";
      state.profile.fk_carrera = user.fk_carrera;
      
      // Actualizar chip del header
      $("#chipName").textContent = state.profile.name;
      $("#chipCareer").textContent = `${state.profile.career} · ${state.profile.semester}º`;
      
      // Actualizar avatar desde la respuesta del backend
      if (user.ruta_foto) {
        state.profile.avatar = user.ruta_foto;
      } else {
        state.profile.avatar = "../imagenes/profilepicture.jpg";
      }

      // Sincronizar localStorage
      const localUser = JSON.parse(localStorage.getItem("usuario") || "{}");
      localUser.ruta_foto = state.profile.avatar;
      localUser.nombre_completo = state.profile.name;
      localStorage.setItem("usuario", JSON.stringify(localUser));
    }
  } catch (error) {
    console.error("Error cargando perfil:", error);
    toast("Error al cargar datos del perfil", "danger");
  }

  const profileAvatar = $("#profileAvatar");
  profileAvatar.src = state.profile.avatar;
  profileAvatar.onerror = () => { profileAvatar.onerror = null; profileAvatar.src = "../imagenes/profilepicture.jpg"; };
  
  const chipAvatar = $("#chipAvatar");
  chipAvatar.src = state.profile.avatar;
  chipAvatar.onerror = () => { chipAvatar.onerror = null; chipAvatar.src = "../imagenes/profilepicture.jpg"; };
  
  $("#pName").value             = state.profile.name;
  $("#pCareer").value           = state.profile.fk_carrera || "";
  $("#pSemester").value         = state.profile.semester;
  $("#pEmail").value            = state.profile.email;
  // $("#stars").title             = `${state.profile.stars} / 5`; // Removed as it's not in the HTML

  $("#photoInput").onchange = async (e)=>{
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("foto", file);

    try {
      toast("Subiendo foto...");
      const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/asesores/${USER_ID}/foto`, {
        method: "POST",
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        // data.url contiene la URL de la imagen en MinIO (o local)
        const profileAvatarUpload = $("#profileAvatar");
        profileAvatarUpload.src = data.url;
        profileAvatarUpload.onerror = () => { profileAvatarUpload.onerror = null; profileAvatarUpload.src = "../imagenes/profilepicture.jpg"; };
        
        const chipAvatarUpload = $("#chipAvatar");
        chipAvatarUpload.src = data.url;
        chipAvatarUpload.onerror = () => { chipAvatarUpload.onerror = null; chipAvatarUpload.src = "../imagenes/profilepicture.jpg"; };

        // Actualizar localStorage
        const localUser = JSON.parse(localStorage.getItem("usuario") || "{}");
        localUser.ruta_foto = data.url;
        localStorage.setItem("usuario", JSON.stringify(localUser));

        toast("Foto actualizada", "success");
      } else {
        const err = await res.json();
        toast(err.error || "Error al subir foto", "danger");
      }
    } catch (error) {
      console.error("Error subiendo foto:", error);
      toast("Error de conexión", "danger");
    }
  };
  
  const btnDelete = $("#btnDeletePhoto");
  if(btnDelete) {
      btnDelete.onclick = async (e) => {
          e.preventDefault();
          if(await confirmDialog("¿Eliminar tu foto de perfil?")) {
              const defaultImg = "../imagenes/profilepicture.jpg"; // Fallback image
              $("#profileAvatar").src = defaultImg;
              $("#chipAvatar").src = defaultImg;

              // Actualizar localStorage
              const localUser = JSON.parse(localStorage.getItem("usuario") || "{}");
              localUser.ruta_foto = defaultImg;
              localStorage.setItem("usuario", JSON.stringify(localUser));

              toast("Foto eliminada");
          }
      };
  }

  $("#profileForm").onsubmit = async (e)=>{
    e.preventDefault();
    const name     = $("#pName").value.trim();
    const careerId = Number($("#pCareer").value);
    const semester = Number($("#pSemester").value);
    const password = $("#pPassword").value;

    if (!name || !careerId || !semester){
      toast("Completa los campos obligatorios","danger");
      return;
    }

    // Preparamos el payload
    const payload = {
      nombre_completo: name,
      semestre: semester,
      fk_carrera: careerId
    };
    if (password) {
      payload.password = password;
    }

    try {
      const res = await authFetch(`${API_CONFIG.baseURL}/api/usuarios/${USER_ID}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast("Perfil actualizado correctamente", "success");
        
        // Obtener nombre de carrera del select para actualizar UI
        const careerName = $("#pCareer").options[$("#pCareer").selectedIndex].text;

        // Actualizar estado local y UI
        state.profile.name = name;
        state.profile.semester = semester;
        state.profile.career = careerName;
        state.profile.fk_carrera = careerId;
        
        $("#chipName").textContent   = name;
        $("#chipCareer").textContent = `${careerName} · ${semester}º`;
        $("#pPassword").value = "";
      } else {
        const err = await res.json();
        toast(err.error || "Error al actualizar perfil", "danger");
      }
    } catch (error) {
      console.error("Error al guardar perfil:", error);
      toast("Error de conexión", "danger");
    }
  };
}

/* ===== Vista Explorar ===== */
let exploreState = {
  asesores: [],
  currentPage: 1,
  perPage: 6,
  totalPages: 1
};

function initExplorarView() {
  const view = $("#view-explorar");
  if (!view) return;

  const temaInput = view.querySelector('#filtro-tema');
  const asesorInput = view.querySelector('#filtro-asesor');
  const carreraSel = view.querySelector('#filtro-carrera');
  const diaSel = view.querySelector('#filtro-dia');
  const desdeTime = view.querySelector('#filtro-hora-desde');
  const hastaTime = view.querySelector('#filtro-hora-hasta');
  const areaSel = view.querySelector('#filtro-area');
  const buscarBtn = view.querySelector('#btn-buscar');
  const limpiarBtn = view.querySelector('#btn-limpiar');
  const listaAsesoresEl = view.querySelector("#lista-asesores");

  // Cargar asesores iniciales
  cargarAsesores();

  // Event listeners
  buscarBtn?.addEventListener('click', async () => {
    const filtros = {
      tema: temaInput?.value.trim() || '',
      asesor: asesorInput?.value.trim() || '',
      carrera: carreraSel?.value || '',
      dia: diaSel?.value || '',
      desde: desdeTime?.value || '',
      hasta: hastaTime?.value || '',
      area: areaSel?.value || ''
    };
    
    try {
      const resp = await obtenerAsesores(filtros);
      let asesores = [];
      if (Array.isArray(resp)) {
        asesores = resp;
      } else if (Array.isArray(resp.asesores)) {
        asesores = resp.asesores;
      }
      
      // Filtrar el perfil del usuario actual para evitar que se agende consigo mismo
      exploreState.asesores = asesores.filter(a => a.id_usuario !== USER_ID);
      
      exploreState.currentPage = 1;
      renderExplorePage();
      if(limpiarBtn) limpiarBtn.style.display = "inline-flex";
    } catch (error) {
      console.error("Error buscando asesores:", error);
      toast("Error al buscar asesores", "danger");
    }
  });

  limpiarBtn?.addEventListener('click', () => {
    if (temaInput) temaInput.value = "";
    if (asesorInput) asesorInput.value = "";
    if (carreraSel) carreraSel.selectedIndex = 0;
    if (diaSel) diaSel.selectedIndex = 0;
    if (areaSel) areaSel.selectedIndex = 0;
    if (desdeTime) desdeTime.value = "";
    if (hastaTime) hastaTime.value = "";
    limpiarBtn.style.display = "none";
    cargarAsesores();
  });

  // Paginación
  view.addEventListener('click', (e) => {
    if (e.target.matches('.page-btn.prev')) gotoExplorePage(exploreState.currentPage - 1);
    else if (e.target.matches('.page-btn.next')) gotoExplorePage(exploreState.currentPage + 1);
    else if (e.target.matches('.page-number')) {
      const n = Number(e.target.dataset.page);
      if (Number.isFinite(n)) gotoExplorePage(n);
    }
  });

  async function cargarAsesores() {
    try {
      const asesores = await obtenerAsesores();
      // Filtrar el perfil del usuario actual para evitar que se agende consigo mismo
      exploreState.asesores = asesores.filter(a => a.id_usuario !== USER_ID);
      exploreState.currentPage = 1;
      renderExplorePage();
    } catch (error) {
      console.error("Error cargando asesores:", error);
      if(listaAsesoresEl) listaAsesoresEl.innerHTML = `<li style="padding:2rem;text-align:center;">Error al cargar asesores</li>`;
    }
  }

  function renderExplorePage() {
    if (!listaAsesoresEl) return;
    
    const alerta = view.querySelector(".alerta-resultados");
    exploreState.totalPages = Math.ceil(exploreState.asesores.length / exploreState.perPage);

    if (exploreState.asesores.length === 0) {
      listaAsesoresEl.innerHTML = "";
      if (alerta) {
        alerta.style.display = "flex";
        alerta.querySelector(".alerta-texto").textContent = "No se encontraron asesores.";
      }
      updateExplorePagination();
      return;
    }

    if (alerta) alerta.style.display = "none";

    const start = (exploreState.currentPage - 1) * exploreState.perPage;
    const end = start + exploreState.perPage;
    const pageAsesores = exploreState.asesores.slice(start, end);

    listaAsesoresEl.innerHTML = pageAsesores.map(crearAsesorCard).join("");
    updateExplorePagination();
  }

  function updateExplorePagination() {
    const pag = view.querySelector('.paginacion');
    if (!pag) return;

    const btnPrev = pag.querySelector('.page-btn.prev');
    const btnNext = pag.querySelector('.page-btn.next');
    const pageList = pag.querySelector('.page-list');

    if (btnPrev) btnPrev.disabled = exploreState.currentPage <= 1;
    if (btnNext) btnNext.disabled = exploreState.currentPage >= exploreState.totalPages;

    if (pageList) {
      pageList.innerHTML = "";
      for (let i = 1; i <= exploreState.totalPages; i++) {
        if (exploreState.totalPages > 10 && Math.abs(i - exploreState.currentPage) > 2 && i !== 1 && i !== exploreState.totalPages) continue;
        
        const isCurrent = i === exploreState.currentPage;
        pageList.innerHTML += `
          <li><button class="page-number ${isCurrent ? 'is-active' : ''}" 
            data-page="${i}" ${isCurrent ? 'aria-current="page"' : ''}>${i}</button></li>`;
      }
    }
  }

  function gotoExplorePage(n) {
    exploreState.currentPage = Math.min(Math.max(1, n), exploreState.totalPages);
    renderExplorePage();
  }

  function safe(str) {
    return String(str || "").replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function crearAsesorCard(asesor) {
    const rating = parseFloat(asesor.puntuacion_promedio) || 0;
    const sesiones = asesor.numero_sesiones || 0;
    const sesionesTexto = sesiones >= 10 ? `${sesiones}+` : sesiones;
    const disponibilidad = formatDisponibilidad(asesor.disponibilidades);
    const avatar = asesor.ruta_foto || "../imagenes/profilepicture.jpg"; 

    const entero = Math.floor(rating);
    let starsHtml = "";
    for (let i = 0; i < 5; i++) starsHtml += i < entero ? "★" : "☆";

    return `
      <li class="asesor-card">
        <div class="asesor-card-main">
          <img class="asesor-avatar" src="${safe(avatar)}" alt="${safe(asesor.nombre_completo)}" onerror="this.onerror=null; this.src='../imagenes/profilepicture.jpg';" />
          <div class="asesor-info">
            <div class="asesor-headerline">
              <span class="asesor-nombre">${safe(asesor.nombre_completo)}</span>
            </div>
            <div class="asesor-detalle">
              <span class="asesor-carrera">${safe(asesor.nombre_carrera || "Sin carrera")}</span>
              <span class="asesor-bullet">·</span>
              <span class="asesor-semestre">${safe(asesor.semestre || "-")}º</span>
            </div>
            <div class="asesor-stats">
              <span class="asesor-sesiones">${sesionesTexto} sesiones completadas</span>
            </div>
          </div>
          <div class="asesor-extra">
            <div class="asesor-rating">
              <div class="stars" aria-label="${rating} de 5">${starsHtml}</div>
              <div class="asesor-submeta">
                <span>${rating.toFixed(1)} / 5</span>
              </div>
              <div class="asesor-availability">
                <span>${safe(disponibilidad)}</span>
              </div>
            </div>
            <a class="btn-perfil" href="panelPublicoAsesor.html?id=${asesor.id_usuario}">Ver perfil</a>
          </div>
        </div>
      </li>
    `;
  }

  function formatDisponibilidad(disponibilidades) {
    if (!disponibilidades || disponibilidades.length === 0) return "Sin disponibilidad";
    const nombresDias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    const dias = new Set();
    disponibilidades.forEach(d => {
      const fecha = new Date(d.fecha_inicio);
      dias.add(nombresDias[fecha.getDay()]);
    });
    return Array.from(dias).slice(0, 3).join(" · ") || "Próximamente";
  }
}