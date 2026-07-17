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
          <div class="bar-value">${prefix}${d.value.toFixed(decimals)}</div>
        </div>
      `;
    })
    .join("");

  container.innerHTML = filas;
}
