async function initDashboard() {
  const sesion = Sesion.get();
  if (!sesion || sesion.rol !== "admin") return;

  await Promise.all([cargarResumen(), cargarDeudas(), cargarMovimientos()]);
}

async function cargarResumen() {
  const tasaEl = document.getElementById("resumen-tasa");
  const usuariosCont = document.getElementById("resumen-usuarios-tabla");
  const catChart = document.getElementById("resumen-grafico-categorias");
  const userChart = document.getElementById("resumen-grafico-usuarios");

  try {
    const r = await apiGet("getResumen");

    tasaEl.textContent = `Tasa BCV de hoy: ${Number(r.tasa_bcv_hoy).toFixed(4)} Bs por USD`;

    usuariosCont.innerHTML = r.por_usuario.map(u => `
      <tr>
        <td>${u.nombre}</td>
        <td>Gastos: ${u.gastos_bs.toFixed(2)} Bs / $${u.gastos_usd.toFixed(2)}</td>
        <td>Ingresos: ${u.ingresos_bs.toFixed(2)} Bs / $${u.ingresos_usd.toFixed(2)}</td>
      </tr>
    `).join("");

    const datosCategorias = Object.entries(r.categorias).map(([label, v]) => ({ label, value: v.bs }));
    renderBarChart(catChart, datosCategorias, { prefix: "Bs ", decimals: 0 });

    const datosUsuarios = r.por_usuario.map(u => ({ label: u.nombre, value: u.gastos_bs }));
    renderBarChart(userChart, datosUsuarios, { prefix: "Bs ", decimals: 0 });
  } catch (err) {
    tasaEl.textContent = "Error cargando resumen: " + err.message;
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
        <td>${m.monto_bs} Bs / $${Number(m.monto_usd).toFixed(2)}${m.moneda_ingresada === "USD" ? " (ingresado en USD)" : ""}</td>
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
