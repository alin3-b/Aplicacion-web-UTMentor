// ../js/registro.js
function sanitize(input) {
    return input.replace(/[<>'"]/g, "");
}

const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{3,60}$/;
const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexPassword = /^[A-Za-z0-9!@#$%^&*()_\-+=.?]{6,50}$/;

// Limpia errores mientras escribe
document.getElementById("nombre_completo").addEventListener("input", () => {
    document.getElementById("errorNombre").style.display = "none";
});
document.getElementById("correo").addEventListener("input", () => {
    document.getElementById("errorCorreo").style.display = "none";
});

// Toggle contraseñas
document.getElementById("togglePass").addEventListener("click", () => {
    const pass = document.getElementById("password");
    const icon = document.getElementById("togglePass");
    if (pass.type === "password") { pass.type = "text"; icon.src = "../imagenes/ocultar.png"; }
    else { pass.type = "password"; icon.src = "../imagenes/vista.png"; }
});
document.getElementById("toggleConfirmPass").addEventListener("click", () => {
    const pass = document.getElementById("confirmPassword");
    const icon = document.getElementById("toggleConfirmPass");
    if (pass.type === "password") { pass.type = "text"; icon.src = "../imagenes/ocultar.png"; }
    else { pass.type = "password"; icon.src = "../imagenes/vista.png"; }
});

// Llenar select de semestres
const semestre = document.getElementById("semestre");
for (let i = 1; i <= 10; i++) {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `${i}° semestre`;
    semestre.appendChild(opt);
}

// Listener del formulario
document.getElementById("formRegistro").addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombre = sanitize(document.getElementById("nombre_completo").value.trim());
    const correo = sanitize(document.getElementById("correo").value.trim());
    const password = sanitize(document.getElementById("password").value.trim());
    const confirmPassword = sanitize(document.getElementById("confirmPassword").value.trim());
    const errorConfirm = document.getElementById("errorConfirm");
    const errorNombre = document.getElementById("errorNombre");
    const errorCorreo = document.getElementById("errorCorreo");
    const policy = document.getElementById("policy");

    // Validar contraseñas
    if (password !== confirmPassword) {
        errorConfirm.textContent = "Las contraseñas no coinciden.";
        errorConfirm.style.display = "block";
        return;
    } else { errorConfirm.style.display = "none"; }

    // Validar nombre
    if (!regexNombre.test(nombre)) {
        errorNombre.textContent = "El nombre solo debe contener letras y espacios (3 a 60 caracteres).";
        errorNombre.style.display = "block";
        return;
    }

    // Validar correo
    if (!regexCorreo.test(correo)) { alert("❌ Correo inválido."); return; }

    // Validar contraseña
    if (!regexPassword.test(password)) { alert("❌ Contraseña inválida."); return; }

    // Validar términos y condiciones
    if (!policy.checked) { alert("Debes aceptar los términos y condiciones."); return; }

    const roles = document.getElementById("roles").value.split(",").map(Number);

    const data = {
        nombre_completo: nombre,
        correo,
        semestre: Number(document.getElementById("semestre").value),
        fk_carrera: Number(document.getElementById("fk_carrera").value),
        password,
        roles
    };

    try {
        const response = await fetch("/api/usuarios", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        const toast = document.getElementById("toastMensaje");
        errorCorreo.style.display = "none";

        if (!response.ok) {
            if (result.error === "El correo ya está registrado") {
                errorCorreo.textContent = result.error;
                errorCorreo.style.display = "block";
                return;
            }
            toast.textContent = result.error || "Error interno del servidor";
            toast.classList.add("error", "show");
            setTimeout(() => toast.classList.remove("show"), 3500);
            return;
        }

        // Éxito
        toast.textContent = "Usuario creado con éxito";
        toast.classList.remove("error");
        toast.classList.add("show");
        document.getElementById("formRegistro").reset();
        setTimeout(() => toast.classList.remove("show"), 3500);

    } catch (error) {
        console.error("Error del fetch:", error);
        const toast = document.getElementById("toastMensaje");
        toast.textContent = "No se pudo conectar con el servidor.";
        toast.classList.add("error", "show");
        setTimeout(() => toast.classList.remove("show"), 3500);
    }

});