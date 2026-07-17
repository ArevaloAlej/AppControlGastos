/**
 * Resolución y caché de la tasa BCV (ve.dolarapi.com), por fecha.
 * Se cachea en la hoja Tasas_Cambio para no golpear la API en cada registro
 * (no tiene SLA ni límite de rate documentado).
 */

function getTasaBcv(fechaIso) {
  if (!fechaIso) {
    throw new Error("Falta la fecha para resolver la tasa BCV");
  }

  var sheet = SpreadsheetApp.getActive().getSheetByName("Tasas_Cambio");
  var rows = sheet.getDataRange().getValues();

  for (var i = 1; i < rows.length; i++) {
    if (formatFechaIso_(rows[i][0]) === fechaIso) {
      return rows[i][1];
    }
  }

  var hoyIso = formatFechaIso_(new Date());
  var tasa;
  try {
    if (fechaIso === hoyIso) {
      tasa = fetchTasaHoy_();
    } else {
      tasa = fetchTasaHistorica_(fechaIso);
    }
  } catch (err) {
    var fallback = fallbackTasaAnterior_(rows, fechaIso);
    if (fallback !== null) {
      return fallback;
    }
    throw new Error("No se pudo obtener la tasa BCV para " + fechaIso + ": " + err.message);
  }

  sheet.appendRow([fechaIso, tasa]);
  return tasa;
}

function fetchTasaHoy_() {
  var resp = UrlFetchApp.fetch("https://ve.dolarapi.com/v1/dolares/oficial", {
    muteHttpExceptions: true
  });
  var data = JSON.parse(resp.getContentText());
  if (!data || !data.promedio) {
    throw new Error("Respuesta inesperada de dolarapi.com (tasa de hoy)");
  }
  return data.promedio;
}

function fetchTasaHistorica_(fechaIso) {
  var partes = fechaIso.split("-"); // YYYY-MM-DD
  var url = "https://ve.dolarapi.com/v1/historicos/dolares/oficial/" +
    partes[0] + "/" + partes[1] + "/" + partes[2];
  var resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (resp.getResponseCode() === 404) {
    throw new Error("Sin publicación BCV para " + fechaIso + " (posible fin de semana/feriado)");
  }
  var data = JSON.parse(resp.getContentText());
  if (!data || !data.promedio) {
    throw new Error("Respuesta inesperada de dolarapi.com (histórico)");
  }
  return data.promedio;
}

/**
 * Si la API falla (o no hay publicación esa fecha, ej. fin de semana),
 * usamos la fecha cacheada más cercana anterior como aproximación.
 */
function fallbackTasaAnterior_(rows, fechaIso) {
  var mejor = null;
  var mejorFecha = null;
  for (var i = 1; i < rows.length; i++) {
    var f = formatFechaIso_(rows[i][0]);
    if (f <= fechaIso && (mejorFecha === null || f > mejorFecha)) {
      mejorFecha = f;
      mejor = rows[i][1];
    }
  }
  return mejor;
}

function formatFechaIso_(value) {
  var d = (value instanceof Date) ? value : new Date(value);
  return Utilities.formatDate(d, "America/Caracas", "yyyy-MM-dd");
}
