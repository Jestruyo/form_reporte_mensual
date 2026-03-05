/**
 * Formulario de reporte mensual → Google Sheets
 * 
 * Cómo usar:
 * 1. En tu hoja de Google: Extensiones → Apps Script.
 * 2. Pega este código y guarda.
 * 3. Configura abajo SHEET_ID y, si quieres, VALIDATION_CODE.
 * 4. Despliega: Implementar → Nueva implementación → Tipo: Aplicación web.
 *    - Ejecutar como: Yo | Quién tiene acceso: Cualquier persona.
 * 5. Copia la URL de la aplicación web y úsala en config.js (SCRIPT_URL)
 *    o abre esa misma URL en el navegador para usar el formulario que sirve este script.
 */

// ID de la hoja (está en la URL: .../d/ESTE_ES_EL_ID/...)
const SHEET_ID = '1Z_Ri-OglzByxA1Y9KW_OapUmqdwqL58qu_NtFcAMiQs';
// Nombre de la pestaña donde se escriben los datos (ej: "Respuestas de formulario 4")
const SHEET_TAB_NAME = 'Respuestas de formulario 4';
// Código opcional: si lo pones, el formulario debe enviar el mismo código en "codigo". Déjalo '' para no validar.
const VALIDATION_CODE = '1914';

function doGet(e) {
  // Opcional: servir el formulario desde aquí para evitar CORS
  const params = e && e.parameter || {};
  if (params.form === '1' || params.view === 'form') {
    return serveForm();
  }
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    message: 'Usa POST para enviar un reporte, o ?form=1 para ver el formulario.'
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    // Aceptar tanto JSON (postData.contents) como form-urlencoded (parameter)
    var params = {};
    if (e.postData && e.postData.contents) {
      try {
        params = JSON.parse(e.postData.contents);
      } catch (err) {
        return jsonResponse({ ok: false, message: 'Cuerpo de la petición no válido.' });
      }
    } else if (e.parameter) {
      params = e.parameter;
    }

    if (VALIDATION_CODE && (params.codigo || '') !== VALIDATION_CODE) {
      return jsonResponse({ ok: false, message: 'Código de acceso incorrecto.' });
    }

    const nombre = (params.nombre || '').toString().trim();
    const grupo = (params.grupo || '').toString().trim();
    const predico = (params.predico || '').toString().trim();
    const horas = parseNum(params.horas);
    const revisitas = parseNum(params.revisitas);
    const estudios = parseNum(params.estudios);
    const publicaciones = parseNum(params.publicaciones);
    const supervision = (params.supervision || '').toString().trim();

    if (!nombre) {
      return jsonResponse({ ok: false, message: 'Falta el nombre.' });
    }
    if (!grupo) {
      return jsonResponse({ ok: false, message: 'Falta el grupo.' });
    }
    if (!predico) {
      return jsonResponse({ ok: false, message: 'Indica si predicaste (Sí/No).' });
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName(SHEET_TAB_NAME);
    if (!sheet) {
      return jsonResponse({ ok: false, message: 'No se encontró la pestaña: ' + SHEET_TAB_NAME });
    }

    // Fila: Timestamp, Nombre, Grupo, Predicó, Horas, Revisitas, Estudios, Publicaciones, Supervisión
    const now = new Date();
    const row = [
      now,
      nombre,
      grupo,
      predico,
      horas,
      revisitas,
      estudios,
      publicaciones,
      supervision
    ];
    sheet.appendRow(row);

    // Respuesta en JSON para que el navegador/CORS la maneje correctamente
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, message: 'Reporte guardado correctamente. Gracias.' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, message: 'Error en el servidor: ' + (err.message || String(err)) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function parseNum(val) {
  if (val === undefined || val === null || val === '') return '';
  const n = Number(val);
  return isNaN(n) ? '' : n;
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sirve el formulario HTML desde el script (misma URL = sin CORS).
 * Crea un archivo en el proyecto llamado "formulario.html" con el HTML del form
 * o usa el snippet siguiente inline.
 */
function serveForm() {
  const html = HtmlService.createHtmlOutputFromFile('formulario')
    .setTitle('Reporte mensual')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return html;
}
