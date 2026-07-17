// Formato con separador de miles, consistente con el formato de moneda ya
// usado en la hoja de Resumen ($#,##0.00): coma para miles, punto decimal.
function formatMonto(n, decimals = 2) {
  return Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

// Las fechas llegan de Sheets como ISO completo (celdas tipo Date se
// serializan con hora), ej. "2026-07-17T07:00:00.000Z". Se muestran como
// DD/MM/AAAA en vez del ISO crudo. Se usa UTC porque una celda de solo
// fecha en Sheets representa medianoche UTC, no la hora local del usuario.
function formatFecha(valor) {
  if (!valor) return "";
  const d = new Date(valor);
  if (isNaN(d.getTime())) return String(valor);
  const dia = String(d.getUTCDate()).padStart(2, "0");
  const mes = String(d.getUTCMonth() + 1).padStart(2, "0");
  const anio = d.getUTCFullYear();
  return `${dia}/${mes}/${anio}`;
}

// Gráfica de barras horizontales, sin dependencias externas. `data` es un
// arreglo de { label, value }. Pensada para montos en Bs/USD, no para series
// temporales — con pocas categorías esto se lee mejor que un pie chart.
function renderBarChart(container, data, opts) {
  opts = opts || {};
  const prefix = opts.prefix || "";
  const decimals = opts.decimals != null ? opts.decimals : 2;

  const positivos = data.filter(d => d.value > 0);
  if (!positivos.length) {
    container.innerHTML = '<p class="chart-empty">Sin datos todavía</p>';
    return;
  }

  const max = Math.max(...positivos.map(d => d.value));
  const filas = positivos
    .sort((a, b) => b.value - a.value)
    .map(d => {
      const pct = max > 0 ? (d.value / max) * 100 : 0;
      return `
        <div class="bar-row">
          <div class="bar-label">${d.label}</div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${pct}%"></div>
          </div>
          <div class="bar-value">${prefix}${formatMonto(d.value, decimals)}</div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = filas;
}
