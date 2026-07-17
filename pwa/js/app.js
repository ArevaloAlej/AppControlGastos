function mostrarVista(nombre) {
  document.querySelectorAll(".view").forEach(v => v.classList.add("hidden"));
  document.getElementById(`view-${nombre}`)?.classList.remove("hidden");
}

function actualizarNavPorRol() {
  const sesion = Sesion.get();
  const linkDashboard = document.getElementById("nav-dashboard");
  if (linkDashboard) {
    linkDashboard.classList.toggle("hidden", !sesion || sesion.rol !== "admin");
  }
  const nombre = document.getElementById("nav-nombre");
  if (nombre && sesion) nombre.textContent = sesion.nombre;
}

function enrutar() {
  const hash = window.location.hash || "#login";
  const sesion = Sesion.get();

  if (hash !== "#login" && !sesion) {
    window.location.hash = "#login";
    return;
  }

  if (hash === "#login") {
    mostrarVista("login");
  } else if (hash === "#entrada") {
    mostrarVista("entrada");
  } else if (hash === "#dashboard") {
    if (sesion.rol !== "admin") {
      window.location.hash = "#entrada";
      return;
    }
    mostrarVista("dashboard");
    initDashboard();
  }

  actualizarNavPorRol();
}

window.addEventListener("hashchange", enrutar);

window.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch(err =>
      console.error("Error registrando service worker:", err)
    );
  }

  document.getElementById("form-login").addEventListener("submit", async ev => {
    ev.preventDefault();
    const usuario = document.getElementById("login-usuario").value;
    const pin = document.getElementById("login-pin").value;
    try {
      await iniciarSesion(usuario, pin);
      window.location.hash = "#entrada";
    } catch (err) {
      document.getElementById("login-error").textContent = err.message;
    }
  });

  document.getElementById("btn-logout")?.addEventListener("click", cerrarSesion);

  initEntryForm();
  initRemindersNivel1();
  initRemindersNivel2();

  const sesionExistente = Sesion.get();
  window.location.hash = sesionExistente ? "#entrada" : "#login";
  enrutar();
});
