# Presupuesto_Pareja_Template.xlsx

Plantilla base de la base de datos de la app, con 7 hojas:

1. **Movimientos** — gastos e ingresos de ambos usuarios. Apps Script llena automáticamente `id`, `tasa_bcv_dia`, `monto_usd` y `timestamp_registro`.
2. **Deudas** — deudas registradas por el admin, con dueño (`usuario_responsable`).
3. **Tasas_Cambio** — caché diario de la tasa BCV. La administra Apps Script, no la edites a mano salvo para corregir un error.
4. **Usuarios** — usuarios y PIN de acceso. **Cambia los PIN de ejemplo (celdas amarillas) antes de usar la app.**
5. **Conversiones_USDT** — libro de cambio manual del admin (USDT → Bs vía Binance).
6. **Push_Subscripciones** — suscripciones de notificaciones push, las administra Apps Script.
7. **Resumen** — totales y balances calculados con fórmulas (SUMIFS/COUNTIF), solo lectura, visible para el admin.

Cada hoja con datos de ejemplo tiene una fila marcada `ejemplo-no-borrar` en gris cursiva — bórrala cuando empieces a usar la app de verdad; solo está ahí para mostrar el formato esperado de cada columna.

## Cómo subirla

1. Sube este archivo `.xlsx` a tu Google Drive.
2. Ábrelo con Google Sheets: clic derecho → **Abrir con → Google Sheets** (o Archivo → Importar si ya tienes un Sheet vacío creado).
3. Ve a la hoja `Usuarios` y cambia los PIN.
4. Copia el ID del Sheet desde la URL (entre `/d/` y `/edit`) — lo necesitarás si más adelante quieres automatizar algo fuera de Apps Script, aunque para el flujo normal (Apps Script vive dentro del mismo Sheet) no hace falta.
5. Continúa con la sección "Apps Script" del [README principal](../README.md).

## Nota sobre los dropdowns

Los menús desplegables (categoría, tipo, estado, etc.) usan una hoja de soporte oculta llamada `Listas` — no la borres, ni la hoja `Listas` ni sus rangos, o los dropdowns dejarán de funcionar. Si quieres cambiar las categorías disponibles, edítalas ahí (y también en `docs/js/categories.js` para que el formulario de la PWA quede sincronizado).
