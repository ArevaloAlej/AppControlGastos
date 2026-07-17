async function cargarSelectorUsuarios() {
  const select = document.getElementById("login-usuario");
  try {
    const usuarios = await apiGet("listarUsuarios");
    select.innerHTML = usuarios
      .map(u => `<option value="${u.usuario_id}">${u.nombre}</option>`)
      .join("");
  } catch (err) {
    select.innerHTML = `<option value="">No se pudo cargar (${err.message})</option>`;
  }
}

async function iniciarSesion(usuario, pin) {
  const sesion = await apiGet("login", { usuario, pin });
  Sesion.set(sesion);
  return sesion;
}

function cerrarSesion() {
  Sesion.clear();
  window.location.hash = "#login";
}

function sesionActivaOForzarLogin() {
  const sesion = Sesion.get();
  if (!sesion) {
    window.location.hash = "#login";
    return null;
  }
  return sesion;
}
