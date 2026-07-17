const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxlwHSRGRcP5V50xMoepnClM6aqfW_ujIQ3oRLe679kPO1LA1U4wAYB9kd4-VQ7w02NwA/exec";

const Sesion = {
  get() {
    const raw = localStorage.getItem("sesion");
    return raw ? JSON.parse(raw) : null;
  },
  set(sesion) {
    localStorage.setItem("sesion", JSON.stringify(sesion));
  },
  clear() {
    localStorage.removeItem("sesion");
  }
};

/**
 * GET para lecturas: sin body, así el navegador no dispara un preflight
 * CORS (Apps Script no responde OPTIONS de forma que satisfaga un
 * preflight real).
 */
async function apiGet(action, params = {}) {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set("action", action);
  const sesion = Sesion.get();
  if (sesion) url.searchParams.set("token", sesion.token);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const resp = await fetch(url.toString());
  return manejarRespuesta_(await resp.json());
}

/**
 * POST para escrituras. Se envía como text/plain (no application/json)
 * para que el navegador lo trate como "simple request" y evite el
 * preflight OPTIONS que Apps Script Web Apps no maneja.
 */
async function apiPost(action, params = {}) {
  const sesion = Sesion.get();
  const body = Object.assign({ action }, params, sesion ? { token: sesion.token } : {});

  const resp = await fetch(APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(body)
  });
  return manejarRespuesta_(await resp.json());
}

function manejarRespuesta_(data) {
  if (data && data.error) {
    if (/sesión|token/i.test(data.message || "")) {
      Sesion.clear();
      window.location.hash = "#login";
    }
    throw new Error(data.message || "Error desconocido del servidor");
  }
  return data;
}
