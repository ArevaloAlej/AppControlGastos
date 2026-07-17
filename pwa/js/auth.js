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
