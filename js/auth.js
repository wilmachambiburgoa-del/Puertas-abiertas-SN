// js/auth.js - Control de autenticación (Neon + API)
let esModoRegistro = false;

document.addEventListener("DOMContentLoaded", () => {
  const tabLogin = document.getElementById("tabLogin");
  const tabRegister = document.getElementById("tabRegister");
  const campoNombre = document.getElementById("campoNombre");
  const formTitulo = document.getElementById("formTitulo");
  const formSubtitulo = document.getElementById("formSubtitulo");
  const btnSubmitAuth = document.getElementById("btnSubmitAuth");
  const authForm = document.getElementById("authForm");
  const authMensaje = document.getElementById("authMensaje");

  if (tabLogin && tabRegister) {
    tabLogin.addEventListener("click", () => {
      esModoRegistro = false;
      tabLogin.className = "flex-1 py-3 text-center font-semibold text-emerald-600 border-b-2 border-emerald-600";
      tabRegister.className = "flex-1 py-3 text-center font-semibold text-gray-500 hover:text-emerald-600";
      if (campoNombre) campoNombre.classList.add("hidden");
      const nombreInput = document.getElementById("authNombre");
      if (nombreInput) nombreInput.required = false;
      if (formTitulo) formTitulo.textContent = "Bienvenido de nuevo";
      if (formSubtitulo) formSubtitulo.textContent = "Ingresa tus credenciales para acceder a tu cuenta";
      if (btnSubmitAuth) btnSubmitAuth.textContent = "Iniciar Sesión";
      if (authMensaje) authMensaje.classList.add("hidden");
    });

    tabRegister.addEventListener("click", () => {
      esModoRegistro = true;
      tabRegister.className = "flex-1 py-3 text-center font-semibold text-emerald-600 border-b-2 border-emerald-600";
      tabLogin.className = "flex-1 py-3 text-center font-semibold text-gray-500 hover:text-emerald-600";
      if (campoNombre) campoNombre.classList.remove("hidden");
      const nombreInput = document.getElementById("authNombre");
      if (nombreInput) nombreInput.required = true;
      if (formTitulo) formTitulo.textContent = "Crear cuenta";
      if (formSubtitulo) formSubtitulo.textContent = "Regístrate para publicar y gestionar tus propiedades";
      if (btnSubmitAuth) btnSubmitAuth.textContent = "Registrarme";
      if (authMensaje) authMensaje.classList.add("hidden");
    });
  }

  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("authEmail")?.value?.trim();
      const password = document.getElementById("authPassword")?.value;
      const nombre = document.getElementById("authNombre")?.value?.trim();

      if (!email || !password) return;

      btnSubmitAuth.disabled = true;
      btnSubmitAuth.textContent = "Procesando...";
      authMensaje.classList.add("hidden");

      try {
        if (esModoRegistro) {
          await window.PA.register({ email, password, full_name: nombre });
          authMensaje.className = "text-xs text-center mt-4 text-emerald-600 font-semibold";
          authMensaje.textContent = "¡Cuenta creada! Entrando al sistema...";
          authMensaje.classList.remove("hidden");
          setTimeout(() => { window.location.href = "mis-publicaciones.html"; }, 1200);
        } else {
          await window.PA.login({ email, password });
          authMensaje.className = "text-xs text-center mt-4 text-emerald-600 font-semibold";
          authMensaje.textContent = "Inicio de sesión correcto...";
          authMensaje.classList.remove("hidden");
          setTimeout(() => { window.location.href = "mis-publicaciones.html"; }, 1000);
        }
      } catch (err) {
        authMensaje.className = "text-xs text-center mt-4 text-rose-600 font-semibold";
        authMensaje.textContent = "Error: " + (err.message || "Credenciales incorrectas");
        authMensaje.classList.remove("hidden");
        btnSubmitAuth.disabled = false;
        btnSubmitAuth.textContent = esModoRegistro ? "Registrarme" : "Iniciar Sesión";
      }
    });
  }

  actualizarBarraUsuario();
});

async function actualizarBarraUsuario() {
  const contenedorAuth = document.getElementById("navAuthContenedor");
  const linkNavMisPub = document.getElementById("linkMisPublicacionesNav");
  const btnHeroMisPub = document.getElementById("btnMisPublicacionesHero");

  if (!contenedorAuth) return;

  // Intentar refrescar usuario si hay token
  let user = window.PA.currentUser();
  if (window.PA.isLoggedIn() && !user) {
    user = await window.PA.getMe();
  }

  if (user) {
    const nombre = user.full_name || (user.email ? user.email.split("@")[0] : "Usuario");

    if (linkNavMisPub) linkNavMisPub.classList.remove("hidden");
    if (btnHeroMisPub) btnHeroMisPub.classList.remove("hidden");

    contenedorAuth.innerHTML = `
      <div class="flex items-center gap-1.5 sm:gap-2">
        <a href="mis-publicaciones.html" class="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold py-1.5 px-2.5 sm:px-3 rounded-xl border border-emerald-200 transition">
          <i class="fa-solid fa-circle-user text-emerald-600"></i>
          <span class="max-w-[70px] sm:max-w-[110px] truncate">${nombre}</span>
        </a>
        <button onclick="cerrarSesion()" title="Cerrar sesión"
                class="text-gray-400 hover:text-rose-600 p-1.5 sm:p-2 hover:bg-rose-50 rounded-lg transition">
          <i class="fa-solid fa-right-from-bracket text-xs sm:text-sm"></i>
        </button>
      </div>
    `;
  } else {
    if (linkNavMisPub) linkNavMisPub.classList.add("hidden");
    if (btnHeroMisPub) btnHeroMisPub.classList.add("hidden");

    contenedorAuth.innerHTML = `
      <a href="login.html" class="text-xs sm:text-sm font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-2.5 sm:px-3 py-1.5 rounded-xl transition flex items-center gap-1">
        <i class="fa-solid fa-user"></i> <span>Ingresar</span>
      </a>
    `;
  }
}

async function cerrarSesion() {
  if (confirm("¿Deseas cerrar tu sesión?")) {
    window.PA.logout();
    window.location.href = "index.html";
  }
}
