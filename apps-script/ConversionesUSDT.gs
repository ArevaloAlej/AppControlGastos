/**
 * Libro de cambio manual del admin: USDT -> Bs vía Binance. No existe una
 * tasa "oficial" P2P consultable, así que la tasa la ingresa el admin a mano.
 * Todas las acciones son admin-only (ya validado en routeAction, pero se
 * revalida aquí como defensa adicional).
 */

function crearConversionUsdt(session, params) {
  requireAdmin(session);
  if (!params.fecha || !params.monto_usdt || !params.tasa_usdt_bs) {
    throw new Error("Faltan campos requeridos: fecha, monto_usdt, tasa_usdt_bs");
  }

  var montoUsdt = Number(params.monto_usdt);
  var tasa = Number(params.tasa_usdt_bs);
  var montoBsResultante = montoUsdt * tasa;
  var id = Utilities.getUuid();

  var sheet = SpreadsheetApp.getActive().getSheetByName("Conversiones_USDT");
  sheet.appendRow([
    id,
    params.fecha,
    montoUsdt,
    tasa,
    montoBsResultante,
    params.plataforma || "Binance",
    params.origen_fondos || "",
    params.nota || ""
  ]);

  return { id: id, monto_bs_resultante: montoBsResultante };
}

function listarConversionesUsdt(session, params) {
  requireAdmin(session);
  var sheet = SpreadsheetApp.getActive().getSheetByName("Conversiones_USDT");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var out = [];
  for (var i = 1; i < rows.length; i++) {
    out.push(rowToObject_(headers, rows[i]));
  }
  return out;
}
