# App de control de gastos en pareja

PWA + Google Apps Script + Google Sheets para registrar gastos, ingresos y deudas de dos personas (admin y pareja), con conversión automática Bs↔USD según la tasa oficial BCV del día de cada movimiento.

## Componentes

- **`pwa/`** — Frontend: PWA instalable (login por PIN, formulario rápido de registro, dashboard de admin, recordatorios). Se publica en GitHub Pages.
- **`apps-script/`** — Backend: código `.gs` que se pega en el editor de Apps Script del Google Sheet. Expone un Web App que recibe las peticiones de la PWA, calcula la conversión de tasa BCV, y lee/escribe en el Sheet.
- **`sheet-template/`** — `Presupuesto_Pareja_Template.xlsx`: plantilla con las 7 hojas necesarias, para subir a tu Google Drive y convertir en Google Sheet.
- **`docs-and-testing/VERIFICATION.md`** — Checklist de pruebas manuales end-to-end.

## Pasos de instalación (en orden)

### 1. Google Sheet

1. Sube `sheet-template/Presupuesto_Pareja_Template.xlsx` a tu Google Drive.
2. Ábrelo con Google Sheets (clic derecho → Abrir con → Google Sheets), o impórtalo dentro de un Sheet nuevo (Archivo → Importar).
3. Ve a la hoja `Usuarios` y cambia los PIN de ejemplo por los tuyos (4 dígitos).
4. Anota el ID del Sheet (está en la URL, entre `/d/` y `/edit`).

### 2. Apps Script

1. En el Sheet, ve a **Extensiones → Apps Script**.
2. Crea un archivo `.gs` por cada archivo en `apps-script/` (mismo nombre) y pega el contenido correspondiente. Reemplaza también el `appsscript.json` (necesitas activar "Show appsscript.json manifest file" en Configuración del proyecto, ícono de engranaje).
3. Guarda el proyecto.
4. Despliega como Web App: **Implementar → Nueva implementación → Tipo: Aplicación web**.
   - Ejecutar como: **Yo (tu cuenta)**.
   - Quién tiene acceso: **Cualquier usuario**.
5. Copia la URL `/exec` que te da el despliegue.

### 3. PWA

1. Pega la URL `/exec` del paso anterior en `pwa/js/api.js` (constante `APPS_SCRIPT_URL`).
2. Renombra la carpeta `pwa/` a `docs/` antes de publicar (ver siguiente sección) — o mantenla como `pwa/` si vas a usar la raíz del repo para Pages.

### 4. Publicar en GitHub Pages

```
git init
git add .
git commit -m "Scaffold inicial: PWA, Apps Script, plantilla de Sheet"
git remote add origin <URL-de-tu-repo>
git push -u origin main
```

Luego en GitHub: **Settings → Pages → Source: Deploy from a branch → Branch: main /docs**.

Si el sitio queda publicado en un subpath (`usuario.github.io/repo/`), revisa que las rutas relativas en `index.html` y `manifest.json` sigan funcionando (no deben empezar con `/`).

### 5. Instalar en el celular

- **Android (Chrome):** abre la URL publicada, debería aparecer un banner de "Instalar app" o "Agregar a inicio".
- **iOS (Safari, 16.4+):** abre la URL, toca el ícono de compartir → "Agregar a inicio". Los recordatorios push reales solo funcionan si la app fue agregada así (no en una pestaña normal).

## Notas de diseño y riesgos conocidos

Ver la sección de riesgos en `docs-and-testing/VERIFICATION.md` y los comentarios en el código: CORS de Apps Script (mitigado enviando `text/plain` desde el cliente), confiabilidad de la API de tasa BCV (`ve.dolarapi.com`, sin SLA, mitigado con caché), y Web Push real (nivel experimental, con notificaciones locales como respaldo funcional).
