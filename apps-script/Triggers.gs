/**
 * Envío de recordatorios Web Push reales (nivel 2, experimental).
 *
 * IMPORTANTE — riesgo técnico más alto de todo el proyecto: Apps Script no
 * tiene una librería equivalente a `web-push` (Node). El envío de un push
 * real requiere:
 *   1. Firmar el mensaje con VAPID (JWT firmado con ES256 usando la clave
 *      privada VAPID) en el header Authorization.
 *   2. Cifrar el payload con AES128GCM usando las claves p256dh/auth de
 *      cada suscripción (RFC 8291).
 * Apps Script solo expone primitivas de bajo nivel (Utilities.computeHmacSha256Signature,
 * Utilities.base64Encode, etc.) — no hay soporte nativo para ECDH P-256 ni
 * AES-GCM, así que este archivo deja la función `enviarPushATodos` como el
 * punto de extensión, con un TODO explícito y una implementación de
 * fallback que NO envía push real, para que el proyecto siga siendo
 * funcional (vía las notificaciones locales de pwa/js/reminders.js) aunque
 * esta parte no se complete.
 *
 * Si se decide continuar con la implementación completa de VAPID+AES128GCM
 * en Apps Script, considerar como alternativa más simple: usar un servicio
 * intermedio (p.ej. una Cloud Function gratuita) que sí tenga `web-push`
 * disponible, y que Apps Script solo dispare vía UrlFetchApp. Eso reduce
 * drásticamente el riesgo técnico a cambio de depender de un servicio
 * externo adicional.
 */

function createTimeDrivenTriggers() {
  borrarTriggersExistentes_();

  ScriptApp.newTrigger("enviarRecordatorioPush")
    .timeBased()
    .atHour(13)
    .everyDays(1)
    .create();

  ScriptApp.newTrigger("enviarRecordatorioPush")
    .timeBased()
    .atHour(21)
    .everyDays(1)
    .create();
}

function borrarTriggersExistentes_() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "enviarRecordatorioPush") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }
}

function enviarRecordatorioPush() {
  var suscripciones = listarSuscripcionesPush_();
  var mensaje = "Recuerda registrar tus gastos de hoy";

  suscripciones.forEach(function (sub) {
    try {
      enviarPushATodos_(sub, mensaje);
    } catch (err) {
      Logger.log("Error enviando push a " + sub.endpoint + ": " + err.message);
    }
  });
}

/**
 * TODO: implementar cifrado AES128GCM + firma VAPID (RFC 8291/8292) antes
 * de que esto envíe pushes reales. Por ahora solo registra en el log para
 * que el resto del sistema (triggers, almacenamiento de suscripciones)
 * pueda probarse de forma aislada.
 */
function enviarPushATodos_(sub, mensaje) {
  Logger.log("[push pendiente de implementar] destinatario=" + sub.usuario_id + " mensaje=" + mensaje);
}
