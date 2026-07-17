/**
 * Lee el resultado de las fórmulas ya calculadas en la hoja Resumen
 * (SUMIFS/QUERY) y lo expone como JSON. La hoja Resumen es la fuente de
 * verdad del cálculo; este endpoint solo la lee, no recalcula nada aquí,
 * para no duplicar lógica entre fórmulas de Sheets y Apps Script.
 *
 * Devuelve todas las celdas no vacías de la hoja como una matriz simple
 * (fila, columna, valor) para que el dashboard las renderice tal cual están
 * organizadas en la plantilla, sin asumir una disposición fija de celdas.
 */

function getResumen(session, params) {
  requireAdmin(session);
  var sheet = SpreadsheetApp.getActive().getSheetByName("Resumen");
  var range = sheet.getDataRange();
  var values = range.getValues();

  var filas = [];
  for (var r = 0; r < values.length; r++) {
    var fila = values[r];
    var vacia = fila.every(function (v) { return v === "" || v === null; });
    if (!vacia) {
      filas.push(fila);
    }
  }

  return { filas: filas };
}
