/**
 * Resúmenes calculados directamente desde Movimientos/Deudas (no desde
 * fórmulas de la hoja Resumen), para devolver JSON estructurado que el
 * dashboard pueda graficar sin tener que parsear celdas con formato de
 * moneda como texto.
 */

function sumarPorTipo_(movimientos, tipo, campo) {
  var total = 0;
  movimientos.forEach(function (m) {
    if (m.tipo === tipo) {
      total += Number(m[campo]) || 0;
    }
  });
  return total;
}

function gastosPorCategoria_(movimientos) {
  var categorias = {};
  movimientos.forEach(function (m) {
    if (m.tipo !== "gasto") return;
    if (!categorias[m.categoria]) {
      categorias[m.categoria] = { bs: 0, usd: 0 };
    }
    categorias[m.categoria].bs += Number(m.monto_bs) || 0;
    categorias[m.categoria].usd += Number(m.monto_usd) || 0;
  });
  return categorias;
}

/**
 * Resumen consolidado, solo admin: totales por usuario, por categoría,
 * balance general, estado de deudas y la tasa BCV vigente hoy.
 */
function getResumen(session, params) {
  requireAdmin(session);

  var movimientos = leerHojaComoObjetos_("Movimientos");
  var deudas = leerHojaComoObjetos_("Deudas");
  var usuarios = listarUsuarios();
  var tasaHoy = getTasaBcv(formatFechaIso_(new Date()));

  var porUsuario = usuarios.map(function (u) {
    var propios = movimientos.filter(function (m) { return m.usuario === u.usuario_id; });
    return {
      usuario_id: u.usuario_id,
      nombre: u.nombre,
      gastos_bs: sumarPorTipo_(propios, "gasto", "monto_bs"),
      ingresos_bs: sumarPorTipo_(propios, "ingreso", "monto_bs"),
      gastos_usd: sumarPorTipo_(propios, "gasto", "monto_usd"),
      ingresos_usd: sumarPorTipo_(propios, "ingreso", "monto_usd")
    };
  });

  var estadoDeudas = { pendiente: 0, pagada: 0, vencida: 0, parcial: 0 };
  var saldoPendienteBs = 0;
  var saldoPendienteUsd = 0;
  deudas.forEach(function (d) {
    if (estadoDeudas[d.estado] != null) estadoDeudas[d.estado] += 1;
    if (d.estado === "pendiente") {
      if (d.moneda === "USD") saldoPendienteUsd += Number(d.saldo_pendiente) || 0;
      else saldoPendienteBs += Number(d.saldo_pendiente) || 0;
    }
  });

  return {
    tasa_bcv_hoy: tasaHoy,
    por_usuario: porUsuario,
    categorias: gastosPorCategoria_(movimientos),
    balance: {
      ingresos_bs: sumarPorTipo_(movimientos, "ingreso", "monto_bs"),
      gastos_bs: sumarPorTipo_(movimientos, "gasto", "monto_bs"),
      ingresos_usd: sumarPorTipo_(movimientos, "ingreso", "monto_usd"),
      gastos_usd: sumarPorTipo_(movimientos, "gasto", "monto_usd")
    },
    deudas: {
      estados: estadoDeudas,
      saldo_pendiente_bs: saldoPendienteBs,
      saldo_pendiente_usd: saldoPendienteUsd
    }
  };
}

/**
 * Resumen propio: cualquier usuario autenticado ve sus propios gastos e
 * ingresos (Bs y USD) y su desglose por categoría. Es lo que usa la
 * pareja en "Mi resumen", y también el admin para su propia vista personal.
 */
function getMiResumen(session, params) {
  var movimientos = leerHojaComoObjetos_("Movimientos")
    .filter(function (m) { return m.usuario === session.usuario_id; });

  return {
    tasa_bcv_hoy: getTasaBcv(formatFechaIso_(new Date())),
    gastos_bs: sumarPorTipo_(movimientos, "gasto", "monto_bs"),
    ingresos_bs: sumarPorTipo_(movimientos, "ingreso", "monto_bs"),
    gastos_usd: sumarPorTipo_(movimientos, "gasto", "monto_usd"),
    ingresos_usd: sumarPorTipo_(movimientos, "ingreso", "monto_usd"),
    categorias: gastosPorCategoria_(movimientos)
  };
}
