/* ========== UTILIDADES ========= */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
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

/* ========== ESTADO DEMO ========= */
const state = {
  profile: {
    stars: 4.8,
    name: "Mario Ortega",
    career: "Ingeniería Civil",
    semester: 9,
    email: "mario@utmentor.demo",
    avatar: "../imagenes/adviser1.jpg"
  },
  topics: [
    {topic:"Cálculo diferencial", area:"Matemáticas"},
    {topic:"Resistencia de materiales", area:"Física"},
    {topic:"AutoCAD básico", area:"Diseño"},
    {topic:"Tema Libre", area:"Diseño"}
  ],
  // Sesiones de ejemplo. En product, las filtrarás por semana desde tu backend.
  sessions: []
};

/* Genera ejemplos dentro de la semana actual */
function seedSessions(weekStart){
  const d = new Date(weekStart);
  state.sessions = [
    {id:1, title:"Cálculo diferencial", mode:"virtual", type:"individual", area:"Matemáticas", price:200, notes:"Zoom", student:"Ana Pérez", date: addDayTime(d,1,"10:00","11:00")},
    {id:2, title:"AutoCAD básico", mode:"presencial", type:"grupal", area:"Diseño", price:250, notes:"Aula B-12", student:"Equipo 3", date: addDayTime(d,3,"16:00","17:00")},
    {id:3, title:"Resistencia de materiales", mode:"virtual", type:"individual", area:"Física", price:220, notes:"Google Meet", student:"Luis M.", date: addDayTime(d,4,"09:00","10:00")}
  ];
}

/* ========== FECHAS / SEMANAS ========= */
let currentMonday = getMonday(new Date());
seedSessions(currentMonday);

function getMonday(date){
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 Lunes … 6 Domingo
  d.setDate(d.getDate() - day);
  d.setHours(0,0,0,0);
  return d;
}
function addDays(date, days){ const d = new Date(date); d.setDate(d.getDate()+days); return d; }
function fmtShort(d){
  return d.toLocaleDateString('es-MX', {weekday:'short', day:'2-digit', month:'short'}).replace('.', '');
}
function weekLabel(monday){
  const start = fmtShort(monday);
  const end = fmtShort(addDays(monday,6));
  return `${start} – ${end}`;
}
function addDayTime(base, dayIndex, start, end){
  // dayIndex: 0..6 desde lunes
  const startParts = start.split(':').map(Number);
  const endParts = end.split(':').map(Number);
  const s = addDays(base, dayIndex);
  s.setHours(startParts[0], startParts[1]||0, 0, 0);
  const e = addDays(base, dayIndex);
  e.setHours(endParts[0], endParts[1]||0, 0, 0);
  return { start: s, end: e };
}

/* ========== INICIO ========= */
window.addEventListener("DOMContentLoaded", ()=>{
  // header user chip
  $("#chipName").textContent = state.profile.name;
  $("#chipCareer").textContent = `${state.profile.career} · ${state.profile.semester}º`;
  $("#chipAvatar").src = state.profile.avatar;

  // top bar week label
  renderWeek();

  // sidebar navegación
  $$(".side-link[data-view]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      $$(".side-link").forEach(b=>b.classList.remove("is-active"));
      btn.classList.add("is-active");
      const id = btn.dataset.view;
      $$(".view").forEach(v=>v.classList.remove("is-visible"));
      $(`#view-${id}`).classList.add("is-visible");
      if (id === "sesiones") renderSessions();
      if (id === "publicar") preparePublishForm();
      if (id === "temas") renderTopics();
      if (id === "perfil") loadProfile();
    });
  });

  // acciones laterales
  $('[data-action="switch-role"]').addEventListener("click", ()=>{
    toast("Cambiando a panel de asesorado…");
    // redirige en producción
    // location.href = "panelAsesorado.html";
  });
  $('[data-action="logout"]').addEventListener("click", async ()=>{
    if (await confirmDialog("¿Deseas cerrar sesión?")) {
      toast("Sesión cerrada");
      // location.href = "iniciarSesion.html";
    }
  });
  $('[data-action="delete-account"]').addEventListener("click", async ()=>{
    if (await confirmDialog("Esto eliminará tu perfil y tus datos. ¿Continuar?")) {
      toast("Perfil eliminado");
    }
  });

  // controles de semana
  $("#prevWeek").addEventListener("click", ()=>{ currentMonday = addDays(currentMonday,-7); renderWeek(); renderSessions();});
  $("#nextWeek").addEventListener("click", ()=>{ currentMonday = addDays(currentMonday, 7); renderWeek(); renderSessions();});
  $("#thisWeek").addEventListener("click", ()=>{ currentMonday = getMonday(new Date()); renderWeek(); renderSessions();});

  // sesiones inicial
  renderSessions();
});

/* ========== RENDER: SEMANA ========= */
function renderWeek(){
  $("#weekLabel").textContent = weekLabel(currentMonday);
}

/* ========== RENDER: SESIONES ========= */
function withinWeek(dateObj){
  const start = currentMonday.getTime();
  const end   = addDays(currentMonday,7).getTime();
  const t = dateObj.start.getTime();
  return t >= start && t < end;
}

function renderSessions(){
  const ul = $("#sessionsList");
  ul.innerHTML = "";

  // (en producción pedir al backend filtrado semanal)
  const weekSessions = state.sessions.filter(s=>withinWeek(s.date));
  if (!weekSessions.length){
    ul.innerHTML = `<li class="card"><p class="dim">No tienes sesiones programadas esta semana.</p></li>`;
    return;
  }

  const tpl = $("#sessionCardTpl");
  weekSessions.forEach(s=>{
    const li = tpl.content.firstElementChild.cloneNode(true);
    li.dataset.id = s.id;
    li.querySelector('[data-slot="title"]').textContent = s.title;
    li.querySelector('[data-slot="mode"]').textContent  = s.mode === "virtual" ? "Virtual" : "Presencial";
    li.querySelector('[data-slot="area"]').textContent  = s.area;
    li.querySelector('[data-slot="type"]').textContent  = s.type === "grupal" ? "Grupal" : "Individual";
    li.querySelector('[data-slot="price"]').textContent = `$${s.price}`;
    li.querySelector('[data-slot="notes"]').textContent = s.notes || "—";
    li.querySelector('[data-slot="student"]').textContent = s.student || "—";
    li.querySelector('[data-slot="date"]').textContent = formatRange(s.date.start, s.date.end);

    li.querySelector('[data-action="toggle"]').addEventListener("click", ()=>{
      const detail = li.querySelector(".session-detail");
      const hidden = detail.hasAttribute("hidden");
      if (hidden) detail.removeAttribute("hidden"); else detail.setAttribute("hidden","");
    });

    li.querySelector('[data-action="cancel"]').addEventListener("click", async ()=>{
      const ok = await confirmDialog("¿Cancelar esta sesión? El alumno será notificado.");
      if (!ok) return;
      // simulación
      state.sessions = state.sessions.filter(x=>x.id !== s.id);
      renderSessions();
      toast("Sesión cancelada", "danger");
    });

    ul.appendChild(li);
  });
}
function formatRange(s,e){
  const opts = {weekday:'short', day:'2-digit', month:'short'};
  const day = s.toLocaleDateString('es-MX', opts).replace('.','');
  const pad = n=>String(n).padStart(2,'0');
  return `${day} ${pad(s.getHours())}:${pad(s.getMinutes())}–${pad(e.getHours())}:${pad(e.getMinutes())}`;
}

/* ========== PUBLICAR DISPONIBILIDAD ========= */
function preparePublishForm(){
  // Cargar temas del asesor
  const topicSel = $("#topicSel");
  topicSel.innerHTML = "";
  state.topics.forEach(t=>{
    const opt = document.createElement("option");
    opt.value = t.topic; opt.textContent = t.topic;
    topicSel.appendChild(opt);
  });

  // Días de la semana actual
  const daySel = $("#daySel");
  daySel.innerHTML = "";
  for (let i=0;i<7;i++){
    const d = addDays(currentMonday,i);
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = d.toLocaleDateString('es-MX',{weekday:'long', day:'2-digit', month:'short'});
    daySel.appendChild(opt);
  }

  // Tema libre toggle
  $("#btnTopicCustom").onclick = ()=>{
    const input = $("#topicCustom");
    input.hidden = !input.hidden;
    input.focus();
  };

  // Reset de resultado
  $("#publishResult").hidden = true;

  // Submit
  $("#publishForm").onsubmit = async (e)=>{
    e.preventDefault();
    const topic = $("#topicCustom").hidden ? $("#topicSel").value : $("#topicCustom").value.trim();
    const dayIdx = Number($("#daySel").value);
    const start = $("#startTime").value;
    const end   = $("#endTime").value;
    const mode  = $("#modeSel").value;
    const type  = $("#typeSel").value;
    const price = Number($("#price").value || 0);
    const notes = $("#notes").value.trim();

    // Validaciones mínimas
    if (!topic){ return toast("Indica un tema válido","danger"); }
    if (!start || !end || end <= start){ return toast("Verifica horario (fin debe ser mayor a inicio)","danger"); }
    if (price < 0){ return toast("El precio no puede ser negativo","danger"); }

    // Simula error de red 1/6
    if (Math.random() < 0.17){ toast("Error de conexión. Intenta de nuevo.","danger"); return; }

    // Construir objeto y “publicar”
    const s = {
      id: Date.now(),
      title: topic,
      mode, type, area: guessArea(topic),
      price, notes,
      date: addDayTime(currentMonday, dayIdx, start, end),
      student: null
    };
    state.sessions.push(s);

    // Resumen
    const box = $("#publishResult");
    box.hidden = false;
    box.innerHTML = `
      <p><strong>Sesión publicada</strong></p>
      <ul>
        <li>Tema: ${escapeHTML(topic)}</li>
        <li>Fecha: ${formatRange(s.date.start, s.date.end)}</li>
        <li>Modalidad: ${mode}</li>
        <li>Tipo: ${type}</li>
        <li>Precio: $${price}</li>
      </ul>
    `;
    toast("Disponibilidad publicada","success");
    // refrescar lista de sesiones si estás en esa vista
    renderSessions();
  };

  $("#cancelPublish").onclick = ()=> {
    $("#publishForm").reset();
    $("#topicCustom").hidden = true;
    $("#publishResult").hidden = true;
  };
}
function guessArea(topic){
  const hit = state.topics.find(t=>t.topic.toLowerCase() === topic.toLowerCase());
  return hit ? hit.area : "Otra";
}

/* ========== TEMAS ========= */
function renderTopics(){
  const wrap = $("#topicsList");
  wrap.innerHTML = "";
  const tpl = $("#topicRowTpl");

  state.topics.forEach(t=>{
    const row = tpl.content.firstElementChild.cloneNode(true);
    row.querySelector(".topic-input").value = t.topic;
    row.querySelector(".topic-area").value  = t.area;
    row.querySelector('[data-action="remove-topic"]').addEventListener("click", ()=>{
      row.remove();
    });
    wrap.appendChild(row);
  });

  $("#addTopic").onclick = ()=>{
    const row = tpl.content.firstElementChild.cloneNode(true);
    row.querySelector('[data-action="remove-topic"]').addEventListener("click", ()=>row.remove());
    wrap.appendChild(row);
    row.querySelector(".topic-input").focus();
  };

  $("#topicsForm").onsubmit = (e)=>{
    e.preventDefault();
    const rows = $$(".topic-row", wrap);
    const list = [];
    for (const r of rows){
      const topic = r.querySelector(".topic-input").value.trim();
      const area  = r.querySelector(".topic-area").value;
      if (!topic){ toast("Hay un tema vacío.","danger"); return; }
      list.push({topic, area});
    }
    state.topics = list;
    preparePublishForm(); // refrezca select de temas
    toast("Temas guardados","success");
  };
}

/* ========== PERFIL ========= */
function loadProfile(){
  $("#profileAvatar").src = state.profile.avatar;
  $("#pName").value = state.profile.name;
  $("#pCareer").value = state.profile.career;
  $("#pSemester").value = state.profile.semester;
  $("#pEmail").value = state.profile.email;
  $("#stars").title = `${state.profile.stars} / 5`;

  // foto
  $("#photoInput").onchange = (e)=>{
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    $("#profileAvatar").src = url;
    $("#chipAvatar").src = url;
    toast("Foto actualizada");
  };

  $("#profileForm").onsubmit = (e)=>{
    e.preventDefault();
    const name = $("#pName").value.trim();
    const career = $("#pCareer").value.trim();
    const semester = Number($("#pSemester").value);
    const password = $("#pPassword").value;

    if (!name || !career || !semester){ return toast("Completa los campos obligatorios","danger"); }
    state.profile.name = name; state.profile.career = career; state.profile.semester = semester;
    $("#chipName").textContent = name;
    $("#chipCareer").textContent = `${career} · ${semester}º`;
    if (password) toast("Contraseña actualizada","success");
    toast("Perfil guardado","success");
    $("#pPassword").value = "";
  };
}

/* ========== SEGURIDAD BÁSICA ========= */
function escapeHTML(s){
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}
