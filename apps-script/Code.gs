/**
 * Punto de entrada del Web App. Todas las peticiones de la PWA llegan aquí.
 *
 * Lecturas (sin body, sin sesión sensible) van por GET para evitar el
 * preflight CORS que Apps Script no responde correctamente.
 * Escrituras van por POST con Content-Type: text/plain (ver pwa/js/api.js)
 * para que el navegador lo trate como "simple request" y no dispare preflight.
 */

function doGet(e) {
  var params = (e && e.parameter) || {};

  if (params.test) {
    return jsonOutput({ status: "ok" });
  }

  try {
    return jsonOutput(routeAction(params.action, params));
  } catch (err) {
    return jsonOutput({ error: true, message: err.message }, 200);
  }
}

function doPost(e) {
  var payload = {};
  try {
    payload = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOutput({ error: true, message: "Cuerpo inválido, se esperaba JSON" });
  }

  try {
    return jsonOutput(routeAction(payload.action, payload));
  } catch (err) {
    return jsonOutput({ error: true, message: err.message }, 200);
  }
}

function jsonOutput(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Dispatcher central: mapea el string "action" a la función correspondiente.
 * Cada handler recibe (params, session) donde session ya viene resuelta
 * (o null para "login", que es la única acción sin sesión previa).
 */
function routeAction(action, params) {
  if (!action) {
    throw new Error("Falta el parámetro 'action'");
  }

  if (action === "login") {
    return login(params.usuario, params.pin);
  }

  var session = requireSession(params.token);

  switch (action) {
    case "getTasa":
      return { tasa: getTasaBcv(params.fecha) };

    case "crearMovimiento":
      return crearMovimiento(session, params);
    case "listarMovimientos":
      return listarMovimientos(session, params);
    case "editarMovimiento":
      return editarMovimiento(session, params);
    case "borrarMovimiento":
      return borrarMovimiento(session, params);

    case "crearDeuda":
      return crearDeuda(session, params);
    case "listarDeudas":
      return listarDeudas(session, params);
    case "editarDeuda":
      return editarDeuda(session, params);
    case "borrarDeuda":
      return borrarDeuda(session, params);

    case "crearConversionUsdt":
      requireAdmin(session);
      return crearConversionUsdt(session, params);
    case "listarConversionesUsdt":
      requireAdmin(session);
      return listarConversionesUsdt(session, params);

    case "getResumen":
      requireAdmin(session);
      return getResumen(session, params);

    case "registrarPush":
      return registrarPush(session, params);

    case "importarLote":
      requireAdmin(session);
      return importarLote(session, params);

    default:
      throw new Error("Acción desconocida: " + action);
  }
}
