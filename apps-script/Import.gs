/**
 * Fase 6: importación de histórico. No se cargan datos de ejemplo aquí —
 * esta función solo existe para que, cuando el admin tenga su mapeo manual
 * listo, pueda enviarlo en lote en vez de fila por fila.
 *
 * Para backfills simples, el método recomendado sigue siendo: pegar un CSV
 * con el mismo orden de columnas de la hoja directamente en Google Sheets
 * (ver docs-and-testing/VERIFICATION.md). Este endpoint es para cuando se
 * quiera hacer la carga de forma programática.
 */

var IMPORT_TABLAS_VALIDAS = ["movimientos", "deudas"];

function importarLote(session, params) {
  requireAdmin(session);

  if (IMPORT_TABLAS_VALIDAS.indexOf(params.tipo) === -1) {
    throw new Error("tipo debe ser 'movimientos' o 'deudas'");
  }
  if (!params.filas || !params.filas.length) {
    throw new Error("No se recibieron filas para importar");
  }

  var nombreHoja = params.tipo === "movimientos" ? "Movimientos" : "Deudas";
  var headers = params.tipo === "movimientos" ? MOVIMIENTOS_HEADERS : DEUDAS_HEADERS;
  var sheet = SpreadsheetApp.getActive().getSheetByName(nombreHoja);

  var filasParaEscribir = params.filas.map(function (fila) {
    return headers.map(function (campo) {
      return fila[campo] != null ? fila[campo] : "";
    });
  });

  sheet.getRange(
    sheet.getLastRow() + 1,
    1,
    filasParaEscribir.length,
    headers.length
  ).setValues(filasParaEscribir);

  return { insertadas: filasParaEscribir.length };
}

var DEUDAS_HEADERS = [
  "id", "descripcion", "monto_original", "moneda",
  "saldo_pendiente", "fecha_vencimiento", "estado", "usuario_responsable"
];
