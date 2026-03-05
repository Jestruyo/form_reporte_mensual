// CONFIGURACIÓN: URL del Web App de Google Apps Script (para enviar reportes)
// Después de desplegar el script en tu hoja (Extensiones → Apps Script → Implementar),
// pega aquí la URL que te da Google (ej. https://script.google.com/macros/s/.../exec).
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyMtpuJh60WayOOYqJ3kPv9fOJ8GiHfuysB31TNWZ-osx-eOVDtFCq8_BBuRxguO-w5Gw/exec';

// Opcional: código de validación para que solo usuarios autorizados envíen el formulario.
const FORM_VALIDATION_CODE = '';

// CONFIGURACIÓN: Lectura de la hoja (para la pestaña "Mi historial")
// La hoja debe ser pública o "Cualquier persona con el enlace puede ver".
const SHEET_ID = '1Z_Ri-OglzByxA1Y9KW_OapUmqdwqL58qu_NtFcAMiQs';
const SHEET_GID = '442652710';   // ID de la pestaña (gid) - en la URL de la pestaña
const SHEET_RANGE = 'A2:I1000';  // Rango de datos (sin encabezado)
const SHEET_READ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?gid=${SHEET_GID}&range=${SHEET_RANGE}&tqx=out:json`;
