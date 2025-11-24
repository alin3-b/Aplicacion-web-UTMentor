// Utilidad: obtener query param
const getParam = (k) => new URL(location.href).searchParams.get(k);

console.log("Script cambioContraseña.js cargado");

// Obtener el correo del usuario desde la URL
const userEmail = getParam("email");
const tokenAlert = document.getElementById("tokenAlert");
const form = document.getElementById("resetForm");
const submitBtn = document.getElementById("submitBtn");

if (!userEmail) {
  tokenAlert.textContent =
    "Enlace inválido. Falta el correo electrónico del usuario.";
  form.querySelectorAll("input,button").forEach((el) => {
    if (el !== tokenAlert) el.disabled = true;
  });
}

// Reglas de contraseña
const rules = {
  len: (v) => v.length >= 8,
  up: (v) => /[A-ZÁÉÍÓÚÑ]/.test(v),
  low: (v) => /[a-záéíóúñ]/.test(v),
  num: (v) => /\d/.test(v),
  spec: (v) => /[^A-Za-z0-9ÁÉÍÓÚáéíóúÑñ\s]/.test(v),
};

const pw = document.getElementById("password");
const cf = document.getElementById("confirm");
const pwErr = document.getElementById("pwError");
const cfErr = document.getElementById("cfError");

const cLen = document.getElementById("cLen");
const cUp = document.getElementById("cUp");
const cLow = document.getElementById("cLow");
const cNum = document.getElementById("cNum");
const cSpec = document.getElementById("cSpec");

function setState(el, ok) {
  el.classList.toggle("ok", ok);
  el.classList.toggle("bad", !ok);
}

function validatePassword(showMsg = true) {
  const v = pw.value.trim();
  const okLen = rules.len(v);
  const okUp = rules.up(v);
  const okLow = rules.low(v);
  const okNum = rules.num(v);
  const okSpec = rules.spec(v);

  setState(cLen, okLen);
  setState(cUp, okUp);
  setState(cLow, okLow);
  setState(cNum, okNum);
  setState(cSpec, okSpec);

  const allOk = okLen && okUp && okLow && okNum && okSpec;

  if (!v && showMsg) {
    pwErr.textContent = "Este campo es obligatorio.";
  } else if (!allOk && showMsg) {
    pwErr.textContent = "La contraseña no cumple los requisitos.";
  } else {
    pwErr.textContent = "";
  }
  return allOk;
}

function validateConfirm(showMsg = true) {
  const v1 = pw.value.trim();
  const v2 = cf.value.trim();
  if (!v2 && showMsg) {
    cfErr.textContent = "Este campo es obligatorio.";
    return false;
  }
  if (v1 !== v2) {
    if (showMsg) cfErr.textContent = "Las contraseñas no coinciden.";
    return false;
  }
  cfErr.textContent = "";
  return true;
}

pw.addEventListener("input", () => {
  validatePassword(false);
  if (cf.value) validateConfirm(false);
});
cf.addEventListener("input", () => validateConfirm(false));

// Mostrar/ocultar contraseña
document.querySelectorAll(".eye").forEach((btn) => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-toggle");
    const input = document.getElementById(targetId);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// Mensajes globales
const globalOk = document.getElementById("globalOk");
const globalErr = document.getElementById("globalErr");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  globalOk.style.display = "none";
  globalErr.style.display = "none";

  const okPw = validatePassword(true);
  const okCf = validateConfirm(true);
  if (!okPw || !okCf) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Actualizando...";

  try {
    // Hook de API real:
    const res = await fetch('/api/auth/reset-password', {
      method:'POST',
      headers: { 'Content-Type': 'application/json' },
      body:JSON.stringify({ email: userEmail, password: pw.value })
    });

    const data = await res.json();

    if (!res.ok) {
      globalErr.textContent = data.error || "Error al actualizar la contraseña.";
      globalErr.style.display = "block";
      submitBtn.disabled = false;
      submitBtn.textContent = "Actualizar contraseña";
      return;
    }

    // Éxito
    globalOk.innerHTML =
      'Tu contraseña ha sido actualizada exitosamente. <a class="link" href="iniciarSesion.html">Inicia sesión ahora</a>.';
    globalOk.style.display = "block";
    // Limpia campos
    pw.value = "";
    cf.value = "";
    validatePassword(false);
    validateConfirm(false);
    
  } catch (error) {
    console.error(error);
    globalErr.textContent = "No se pudo enviar el correo. Intenta nuevamente en unos minutos.";
    globalErr.style.display = "block";
  } finally {
    if (submitBtn.textContent === "Actualizando...") {
       submitBtn.disabled = false;
       submitBtn.textContent = "Actualizar contraseña";
    }
  }
});
