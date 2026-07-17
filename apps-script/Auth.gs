/**
 * Autenticación simple por PIN. No es información bancaria ni sensible,
 * por lo que un token de sesión en caché (sin JWT ni cifrado) es suficiente.
 */

var SESSION_TTL_SECONDS = 6 * 60 * 60; // 6 horas

function login(usuario, pin) {
  if (!usuario || !pin) {
    throw new Error("Faltan usuario o PIN");
  }

  var sheet = SpreadsheetApp.getActive().getSheetByName("Usuarios");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idx = {
    usuario_id: headers.indexOf("usuario_id"),
    nombre: headers.indexOf("nombre"),
    rol: headers.indexOf("rol"),
    pin_acceso: headers.indexOf("pin_acceso")
  };

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    if (String(row[idx.usuario_id]) === String(usuario) &&
        String(row[idx.pin_acceso]) === String(pin)) {
      var token = Utilities.getUuid();
      var session = {
        usuario_id: row[idx.usuario_id],
        nombre: row[idx.nombre],
        rol: row[idx.rol]
      };
      CacheService.getScriptCache().put(
        "session_" + token,
        JSON.stringify(session),
        SESSION_TTL_SECONDS
      );
      return Object.assign({ token: token }, session);
    }
  }

  throw new Error("Usuario o PIN incorrecto");
}

function requireSession(token) {
  if (!token) {
    throw new Error("Sesión requerida: falta token");
  }
  var raw = CacheService.getScriptCache().get("session_" + token);
  if (!raw) {
    throw new Error("Sesión expirada o inválida, vuelve a iniciar sesión");
  }
  return JSON.parse(raw);
}

function requireAdmin(session) {
  if (session.rol !== "admin") {
    throw new Error("Acción solo permitida para el admin");
  }
}

/**
 * Lista pública (sin sesión) de usuario_id + nombre, para que el login de
 * la PWA muestre los nombres reales en vez de valores fijos "admin"/"pareja".
 * Nunca expone pin_acceso.
 */
function listarUsuarios() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Usuarios");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idxId = headers.indexOf("usuario_id");
  var idxNombre = headers.indexOf("nombre");

  var out = [];
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][idxId]) {
      out.push({ usuario_id: rows[i][idxId], nombre: rows[i][idxNombre] });
    }
  }
  return out;
}
