async function initDashboard() {
  const sesion = Sesion.get();
  if (!sesion || sesion.rol !== "admin") return;

  await Promise.all([cargarResumen(), cargarDeudas(), cargarMovimientos()]);
}

async function cargarResumen() {
  const cont = document.getElementById("resumen-tabla");
  try {
    const { filas } = await apiGet("getResumen");
    cont.innerHTML = filas.map(fila =>
      `<tr>${fila.map(c => `<td>${c}</td>`).join("")}</tr>`
    ).join("");
  } catch (err) {
    cont.innerHTML = `<tr><td>Error cargando resumen: ${err.message}</td></tr>`;
  }
}

async function cargarDeudas() {
  const cont = document.getElementById("deudas-tabla");
  try {
    const deudas = await apiGet("listarDeudas");
    cont.innerHTML = deudas.map(d => `
      <tr>
        <td>${d.descripcion}</td>
        <td>${d.saldo_pendiente} ${d.moneda}</td>
        <td>${d.fecha_vencimiento}</td>
        <td>${d.estado}</td>
        <td>${d.usuario_responsable}</td>
      </tr>
    `).join("");
  } catch (err) {
    cont.innerHTML = `<tr><td>Error cargando deudas: ${err.message}</td></tr>`;
  }
}

async function cargarMovimientos() {
  const cont = document.getElementById("movimientos-tabla");
  try {
    const movimientos = await apiGet("listarMovimientos");
    cont.innerHTML = movimientos.map(m => `
      <tr>
        <td>${m.fecha}</td>
        <td>${m.usuario}</td>
        <td>${m.tipo}</td>
        <td>${m.categoria}</td>
        <td>${m.monto_bs} Bs / $${Number(m.monto_usd).toFixed(2)}</td>
        <td>${m.nota || ""}</td>
        <td>
          <button onclick="borrarMovimientoUI('${m.id}')">Borrar</button>
        </td>
      </tr>
    `).join("");
  } catch (err) {
    cont.innerHTML = `<tr><td>Error cargando movimientos: ${err.message}</td></tr>`;
  }
}

async function borrarMovimientoUI(id) {
  if (!confirm("¿Borrar este movimiento?")) return;
  try {
    await apiPost("borrarMovimiento", { id });
    await cargarMovimientos();
  } catch (err) {
    mostrarToast("Error al borrar: " + err.message, true);
  }
}
