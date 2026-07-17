/**
 * Nivel 1 (siempre disponible): notificaciones locales mientras la PWA
 * está abierta o recién en segundo plano. No despierta la app si el
 * teléfono lleva rato inactivo — es un recordatorio "blando".
 *
 * Nivel 2 (experimental): suscripción Web Push real, para que el
 * recordatorio llegue con la app cerrada en iOS 16.4+/Android. Depende de
 * que Triggers.gs en Apps Script complete el envío firmado VAPID (ver TODO
 * en ese archivo) — si no está implementado, la suscripción se guarda pero
 * no se recibirá el push real; el nivel 1 sigue funcionando igual.
 */

const HORAS_RECORDATORIO = [13, 21];

function initRemindersNivel1() {
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    document.getElementById("btn-activar-recordatorios")?.addEventListener("click", async () => {
      await Notification.requestPermission();
    });
  }

  setInterval(() => {
    if (Notification.permission !== "granted") return;
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minuto = ahora.getMinutes();
    if (HORAS_RECORDATORIO.includes(horaActual) && minuto === 0) {
      new Notification("Gastos en Pareja", {
        body: "Recuerda registrar tus gastos de hoy",
        icon: "icons/icon-192.png"
      });
    }
  }, 60 * 1000);
}

async function initRemindersNivel2() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    // Requiere una VAPID public key real una vez que Triggers.gs implemente
    // el envío firmado en el backend; hasta entonces esto queda inactivo.
    return;
  }

  await apiPost("registrarPush", subscription.toJSON());
}
