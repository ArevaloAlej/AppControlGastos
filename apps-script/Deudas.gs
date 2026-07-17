/**
 * CRUD de la hoja Deudas. La pareja ve solo las deudas donde ella es
 * usuario_responsable; el admin ve y edita todas.
 */

function crearDeuda(session, params) {
  requireAdmin(session);
  if (!params.descripcion || !params.monto_original || !params.moneda) {
    throw new Error("Faltan campos requeridos: descripcion, monto_original, moneda");
  }

  var id = Utilities.getUuid();
  var sheet = SpreadsheetApp.getActive().getSheetByName("Deudas");
  sheet.appendRow([
    id,
    params.descripcion,
    Number(params.monto_original),
    params.moneda,
    Number(params.saldo_pendiente != null ? params.saldo_pendiente : params.monto_original),
    params.fecha_vencimiento || "",
    params.estado || "pendiente",
    params.usuario_responsable || session.usuario_id
  ]);

  return { id: id };
}

function listarDeudas(session, params) {
  var sheet = SpreadsheetApp.getActive().getSheetByName("Deudas");
  var rows = sheet.getDataRange().getValues();
  var headers = rows[0];
  var out = [];

  for (var i = 1; i < rows.length; i++) {
    var row = rowToObject_(headers, rows[i]);
    if (session.rol !== "admin" && row.usuario_responsable !== session.usuario_id) {
      continue;
    }
    row._rowNumber = i + 1;
    out.push(row);
  }
  return out;
}

function editarDeuda(session, params) {
  requireAdmin(session);
  return editarFilaPorId_("Deudas", params.id, params.cambios);
}

function borrarDeuda(session, params) {
  requireAdmin(session);
  return borrarFilaPorId_("Deudas", params.id);
}
