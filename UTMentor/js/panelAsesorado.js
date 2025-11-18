/* ===== Utilities (mismas del panel del asesor) ===== */
const $  = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

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
    avatar: "../imagenes/adviser2.jpg"
  },
  sessions: [] // se llena según semana
};

/* ===== Semana y helpers de fecha ===== */
let currentMonday = getMonday(new Date());
seedSessions(currentMonday);

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

/* Sesiones de muestra dentro de la semana actual (asesorado) */
function seedSessions(weekStart){
  const d = new Date(weekStart);
  state.sessions = [
    {id:101, title:"Cálculo diferencial", area:"Matemáticas", mode:"virtual", type:"individual", price:200, notes:"Zoom", tutor:"Mario Ortega", date:addDayTime(d,1,"10:00","11:00")},
    {id:102, title:"Circuitos I", area:"Electrónica", mode:"presencial", type:"grupal", price:180, notes:"Lab E-203", tutor:"Teo Trujillo", date:addDayTime(d,3,"16:00","17:30")},
    {id:103, title:"Algoritmos", area:"Computación", mode:"virtual", type:"individual", price:220, notes:"Google Meet", tutor:"Mailén Jasso", date:addDayTime(d,5,"09:00","10:00")}
  ];
}

/* ===== Inicio ===== */
window.addEventListener("DOMContentLoaded", ()=>{
  // Chip superior
  $("#chipName").textContent   = state.profile.name;
  $("#chipCareer").textContent = `${state.profile.career} · ${state.profile.semester}º`;
  $("#chipAvatar").src         = state.profile.avatar;

  renderWeek();
  renderSessions();

  // Navegación por vistas
  $$(".side-link[data-view]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $$(".side-link").forEach(b=>b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const id = btn.dataset.view;
      $$(".view").forEach(v=>v.classList.remove("is-visible"));
      $(`#view-${id}`).classList.add("is-visible");
      if (id === "sesiones") renderSessions();
      if (id === "perfil")   loadProfile();
    });
  });

  // Acciones laterales
  $('[data-action="switch-role"]').addEventListener("click", ()=>{
    toast("Cambiando al panel de asesor…");
    // location.href = "panelAsesor.html";
  });
  $('[data-action="logout"]').addEventListener("click", async ()=>{
    if (await confirmDialog("¿Deseas cerrar sesión?")){
      toast("Sesión cerrada");
      // location.href = "iniciarSesion.html";
    }
  });
  $('[data-action="delete-account"]').addEventListener("click", async ()=>{
    if (await confirmDialog("Esto eliminará tu cuenta. ¿Continuar?")){
      toast("Perfil eliminado","danger");
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
      const ok = await confirmDialog("¿Cancelar esta sesión? El asesor será notificado.");
      if (!ok) return;

      // Simulación de cancelación
      state.sessions = state.sessions.filter(x=>x.id !== s.id);
      renderSessions();
      toast("Sesión cancelada","danger");
    });

    ul.appendChild(li);
  });
}

/* ===== Perfil ===== */
function loadProfile(){
  $("#profileAvatar").src       = state.profile.avatar;
  $("#pName").value             = state.profile.name;
  $("#pCareer").value           = state.profile.career;
  $("#pSemester").value         = state.profile.semester;
  $("#pEmail").value            = state.profile.email;
  $("#stars").title             = `${state.profile.stars} / 5`;

  $("#photoInput").onchange = (e)=>{
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    $("#profileAvatar").src = url;
    $("#chipAvatar").src    = url;
    toast("Foto actualizada");
  };

  $("#profileForm").onsubmit = (e)=>{
    e.preventDefault();
    const name     = $("#pName").value.trim();
    const career   = $("#pCareer").value.trim();
    const semester = Number($("#pSemester").value);
    const password = $("#pPassword").value;

    if (!name || !career || !semester){
      toast("Completa los campos obligatorios","danger");
      return;
    }
    state.profile.name     = name;
    state.profile.career   = career;
    state.profile.semester = semester;
    $("#chipName").textContent   = name;
    $("#chipCareer").textContent = `${career} · ${semester}º`;
    if (password) toast("Contraseña actualizada","success");
    toast("Perfil guardado","success");
    $("#pPassword").value = "";
  };
}
