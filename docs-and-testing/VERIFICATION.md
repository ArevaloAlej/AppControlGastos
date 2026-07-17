# Checklist de verificación end-to-end

Sigue estos pasos en orden después de desplegar el Apps Script y antes de darle la URL final a la pareja.

## 1. Apps Script responde

Abre en el navegador: `<url-del-deploy>/exec?test=1`
Esperado: `{"status":"ok"}`

## 2. Tasa BCV — hoy

`<url>/exec?action=getTasa&fecha=<fecha-de-hoy-YYYY-MM-DD>`
Esperado: un número plausible de Bs por USD. Revisa que la hoja `Tasas_Cambio` tenga una fila nueva con esa fecha.

## 3. Tasa BCV — histórica

`<url>/exec?action=getTasa&fecha=<una-fecha-del-mes-pasado>`
Esperado: confirma que usa la ruta `/historicos/dolares/oficial/YYYY/MM/DD`. Repite la misma llamada una segunda vez y confirma en **Apps Script → Ejecuciones** que la segunda vez no vuelve a llamar a `UrlFetchApp.fetch` (debe leer el caché de `Tasas_Cambio`).

## 4. PWA en local

Sirve la carpeta `pwa/` con un servidor estático (no abras `index.html` directo con `file://`, los service workers no funcionan así):

```
npx serve pwa
```

Abre la URL local, confirma que carga el login, y en DevTools → Application → Service Workers confirma que el service worker quedó registrado.

## 5. Instalación (Add to Home Screen)

- **Android/Chrome:** confirma que aparece el banner de instalación o la opción en el menú.
- **iOS Safari 16.4+:** desde el ícono de compartir, "Agregar a inicio". Abre el ícono desde la pantalla de inicio y confirma que se ve sin la barra de Safari (modo standalone).

## 6. Login y separación de roles

- Entra como `pareja`: confirma que no aparece el link "Resumen" en la navegación, y que al pedir movimientos/deudas solo ves los tuyos (aunque manipules la petición).
- Entra como `admin`: confirma que ves el dashboard completo, los movimientos de ambos usuarios, y que puedes borrar cualquier movimiento.

## 7. Gasto con fecha pasada

Desde el formulario, registra un gasto con fecha de hace 2 semanas. Confirma que el preview de USD y la fila guardada en `Movimientos` usan la tasa BCV de esa fecha (columna `tasa_bcv_dia`), no la de hoy.

## 8. Recordatorios — nivel 1 (local)

Con la PWA abierta, cambia temporalmente `HORAS_RECORDATORIO` en `pwa/js/reminders.js` a la hora actual + 1 minuto, recarga, y confirma que llega la notificación local del navegador. Revierte el cambio después de probar.

## 9. Recordatorios — nivel 2 (push real, experimental)

Este nivel depende de que se complete la firma VAPID/cifrado AES128GCM en `apps-script/Triggers.gs` (marcado como TODO). Si se implementa:

1. Suscríbete desde el ícono instalado en iOS (no desde una pestaña normal).
2. Confirma que aparece una fila nueva en `Push_Subscripciones`.
3. Ejecuta manualmente `enviarRecordatorioPush` desde el editor de Apps Script (botón "Ejecutar").
4. Confirma que llega la notificación con la app cerrada.

Si no se implementa, el nivel 1 sigue funcionando como respaldo — no es un bloqueo para usar el resto de la app.

## 10. CORS

Con las DevTools abiertas en la pestaña Network, envía un movimiento desde el formulario. Confirma que:
- No hay una petición `OPTIONS` fallida antes del `POST`.
- El `POST` a la URL de Apps Script responde `200` con JSON válido.

Si ves un error de CORS, revisa que `pwa/js/api.js` esté enviando `Content-Type: text/plain;charset=utf-8` (no `application/json`) en `apiPost`.

## Riesgos conocidos (no son bugs, son limitaciones aceptadas)

- **`dolarapi.com`** no tiene SLA ni límite de rate documentado — mitigado con caché en `Tasas_Cambio` y fallback a la fecha anterior más cercana si falla.
- **Web Push real (nivel 2)** requiere criptografía (VAPID + AES128GCM) que Apps Script no soporta de forma nativa — queda como TODO explícito en `Triggers.gs`. El nivel 1 (notificación local) es el respaldo funcional.
- **GitHub Pages en subpath** (`usuario.github.io/repo/`): si las rutas relativas fallan, revisa que ningún archivo en `pwa/` use rutas que empiecen con `/`.
