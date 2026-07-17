/**
 * Registro de suscripciones Web Push (nivel 2 de recordatorios, experimental).
 * El cliente llama a PushManager.subscribe() y envía el objeto resultante
 * aquí; Triggers.gs usa estas filas para enviar el push real a la hora
 * programada.
 */

function registrarPush(session, params) {
  if (!params.endpoint || !params.keys) {
    throw new Error("Suscripción push inválida: falta endpoint o keys");
  }

  var sheet = SpreadsheetApp.getActive().getSheetByName("Push_Subscripciones");
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] === params.endpoint) {
      return { ok: true, ya_existia: true };
    }
  }

  sheet.appendRow([
    params.endpoint,
    params.keys.p256dh,
    params.keys.auth,
    session.usuario_id,
    new Date()
  ]);

  return { ok: true, ya_existia: false };
}

function listarSuscripcionesPush_() {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Push_Subscripciones");
  var rows = sheet.getDataRange().getValues();
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    out.push({
      endpoint: rows[i][0],
      p256dh: rows[i][1],
      auth: rows[i][2],
      usuario_id: rows[i][3]
    });
  }
  return out;
}
