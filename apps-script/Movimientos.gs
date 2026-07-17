/**
 * CRUD de la hoja Movimientos. El usuario y el rol siempre se toman de la
 * sesión (nunca del cliente), para que la pareja no pueda registrar o leer
 * a nombre del admin.
 */

var MOVIMIENTOS_HEADERS = [
  "id", "fecha", "usuario", "tipo", "categoria",
  "monto_bs", "tasa_bcv_dia", "monto_usd", "nota", "timestamp_registro"
];

function crearMovimiento(session, params) {
  if (!params.fecha || !params.tipo || !params.categoria || !params.monto_bs) {
    throw new Error("Faltan campos requeridos: fecha, tipo, categoria, monto_bs");
  }
  if (params.tipo !== "gasto" && params.tipo !== "ingreso") {
    throw new Error("tipo debe ser 'gasto' o 'ingreso'");
  }

  var tasa = getTasaBcv(params.fecha);
  var montoBs = Number(params.monto_bs);
  var montoUsd = montoBs / tasa;
  var id = Utilities.getUuid();

  var sheet = SpreadsheetApp.getActive().getSheetByName("Movimientos");
  sheet.appendRow([
    id,
    params.fecha,
    session.usuario_id,
    params.tipo,
    params.categoria,
    montoBs,
    tasa,
    montoUsd,
    params.nota || "",
    new Date()
  ]);

  return { id: id, tasa_bcv_dia: tasa, monto_usd: montoUsd };
}

function listarMovimientos(session, params) {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Movimientos");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var out = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rowToObject_(headers, rows[i]);
    if (session.rol !== "admin" && row.usuario !== session.usuario_id) {
      continue;
    }
    if (params.usuario && row.usuario !== params.usuario) continue;
    if (params.desde && row.fecha < params.desde) continue;
    if (params.hasta && row.fecha > params.hasta) continue;
    row._rowNumber = i + 1;
    out.push(row);
  }
  return out;
}

function editarMovimiento(session, params) {
  requireAdmin(session);
  return editarFilaPorId_("Movimientos", params.id, params.cambios);
}

function borrarMovimiento(session, params) {
  requireAdmin(session);
  return borrarFilaPorId_("Movimientos", params.id);
}

/** Utilidades compartidas por Movimientos.gs y Deudas.gs */

function rowToObject_(headers, row) {
  var obj = {};
  for (var i = 0; i < headers.length; i++) {
    obj[headers[i]] = row[i];
  }
  return obj;
}

function editarFilaPorId_(nombreHoja, id, cambios) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(nombreHoja);
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var idxId = headers.indexOf("id");

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][idxId]) === String(id)) {
      for (var campo in cambios) {
        var col = headers.indexOf(campo);
        if (col !== -1) {
          sheet.getRange(i + 1, col + 1).setValue(cambios[campo]);
        }
      }
      return { ok: true };
    }
  }
  throw new Error("No se encontró el id " + id + " en " + nombreHoja);
}

function borrarFilaPorId_(nombreHoja, id) {
  var sheet = SpreadsheetApp.getActive().getSheetByName(nombreHoja);
  var rows = sheet.getDataRange().getValues();
  var idxId = rows[0].indexOf("id");

  for (var i = 1; i < rows.length; i++) {
    if (String(rows[i][idxId]) === String(id)) {
      sheet.deleteRow(i + 1);
      return { ok: true };
    }
  }
  throw new Error("No se encontró el id " + id + " en " + nombreHoja);
}
