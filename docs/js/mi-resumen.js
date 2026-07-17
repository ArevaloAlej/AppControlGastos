async function initMiResumen() {
  const tasaEl = document.getElementById("mi-resumen-tasa");
  const totalesEl = document.getElementById("mi-resumen-totales");
  const chartEl = document.getElementById("mi-resumen-grafico");

  try {
    const r = await apiGet("getMiResumen");

    tasaEl.textContent = `Tasa BCV de hoy: ${Number(r.tasa_bcv_hoy).toFixed(4)} Bs por USD`;

    const balanceBs = r.ingresos_bs - r.gastos_bs;
    totalesEl.innerHTML = `
      <tr><td>Gastos</td><td>${r.gastos_bs.toFixed(2)} Bs / $${r.gastos_usd.toFixed(2)}</td></tr>
      <tr><td>Ingresos</td><td>${r.ingresos_bs.toFixed(2)} Bs / $${r.ingresos_usd.toFixed(2)}</td></tr>
      <tr><td><strong>Balance</strong></td><td><strong>${balanceBs.toFixed(2)} Bs</strong></td></tr>
    `;

    const datos = Object.entries(r.categorias).map(([label, v]) => ({ label, value: v.bs }));
    renderBarChart(chartEl, datos, { prefix: "Bs ", decimals: 0 });
  } catch (err) {
    tasaEl.textContent = "Error cargando tu resumen: " + err.message;
  }
}
