# Formulario de reporte mensual → Google Sheets

Formulario web para registrar reportes de servicio en una hoja de Google Sheets (mismo esquema que tu dashboard: nombre, grupo, predicó, horas, revisitas, estudios, publicaciones, supervisión).

---

## Despliegue en GitHub Pages

1. **Configura primero el script en Google Sheets** (Extensiones → Apps Script), pega `Code.gs`, despliega como **Aplicación web** (Cualquier persona) y copia la URL (ej. `https://script.google.com/macros/s/.../exec`).
2. **En este proyecto** edita `config.js` y pon esa URL en `SCRIPT_URL`. Si usas código de acceso, ponlo en `FORM_VALIDATION_CODE`.
3. **Sube el repo a GitHub** y activa Pages: **Settings → Pages → Source: Deploy from a branch** → rama `main` (o `master`) y carpeta **/ (root)** → Save.
4. La página quedará en `https://<tu-usuario>.github.io/form_reporte_mensual/` (o el nombre de tu repo).

**Si al enviar el formulario aparece error de red o no se muestra "Enviado correctamente"**, puede ser por CORS (Google a veces no permite leer la respuesta desde otro dominio). En ese caso puedes:
- Compartir el formulario que sirve Google: la misma URL del script con **`?form=1`** al final (no necesitas GitHub Pages para eso), o
- Probar en otro navegador; en algunos entornos la petición sí completa.

---

## Opción A: Usar el formulario desde Google (sin CORS)

1. **Abre tu hoja de Google Sheets** (la que ya tienes con los datos).
2. **Extensiones → Apps Script.** Se abre el editor.
3. **Configura el script:**
   - Pega el contenido de `Code.gs` en `Code.gs` (reemplaza el que haya).
   - Crea un archivo en el proyecto: **Archivo → Nuevo → Archivo HTML**, nombre: `formulario`.
   - Abre `formulario.html` del proyecto (en tu PC) y copia todo su contenido en el archivo `formulario.html` del Apps Script. Guarda.
   - En `Code.gs` revisa y ajusta si hace falta:
     - `SHEET_ID`: ID de tu hoja (en la URL: `.../d/ESTE_ID/...`).
     - `SHEET_TAB_NAME`: nombre exacto de la pestaña donde se escriben los datos (ej. `Respuestas de formulario 4`).
     - `VALIDATION_CODE`: código de acceso o `''` para no pedir código.
4. **Desplegar la aplicación:**
   - **Implementar → Nueva implementación → Tipo: Aplicación web.**
   - **Ejecutar como:** Yo.
   - **Quién tiene acceso:** Cualquier persona.
   - **Implementar** y copia la URL.
5. **Abrir el formulario:**  
   Abre en el navegador la URL que copiaste **más** `?form=1` al final.  
   Ejemplo: `https://script.google.com/macros/s/.../exec?form=1`  
   Esa es la página del formulario; los envíos se guardan en tu hoja.

Con esta opción no necesitas hospedar los archivos en ningún otro sitio.

---

## Opción B: Formulario en tu PC o en otro servidor

Si quieres usar los archivos `index.html`, `style.css`, `form.js` y `config.js` en tu computadora o en un servidor (GitHub Pages, etc.):

1. **Configura el script en la hoja** como en la Opción A (solo `Code.gs`; no hace falta el archivo `formulario.html` si no usas la URL con `?form=1`).
2. **Despliega** la aplicación web y copia la URL del script (sin `?form=1`).
3. **En tu proyecto local** edita `config.js`:
   - `SCRIPT_URL`: pega la URL de la aplicación web (ej. `https://script.google.com/macros/s/.../exec`).
   - `FORM_VALIDATION_CODE`: mismo código que `VALIDATION_CODE` en el script, o `''` para no validar.
4. **Abrir el formulario:**  
   Abre `index.html` en el navegador (por archivo o desde tu servidor).

**Nota:** Si abres `index.html` como archivo (`file://`) o desde otro dominio, el navegador puede bloquear la petición por CORS. En ese caso usa la **Opción A** (formulario con `?form=1`) o sirve los archivos desde un servidor que permita las peticiones a Google.

---

## Columnas en la hoja

El script escribe una fila por envío con este orden (igual que tu rango A2:I):

| A      | B      | C     | D         | E     | F         | G        | H              | I           |
|--------|--------|-------|-----------|-------|-----------|----------|----------------|-------------|
| Fecha  | Nombre | Grupo | Predicó   | Horas | Revisitas | Estudios | Publicaciones  | Supervisión |

La fecha se rellena automáticamente en el momento del envío.

---

## Resumen de archivos

- **index.html** – Vista con dos pestañas: **Enviar reporte** (formulario) y **Mi historial** (consultar con filtros por mes y nombre).
- **style.css** – Estilos del formulario, pestañas y panel de historial (responsivo).
- **config.js** – `SCRIPT_URL` (enviar), `SHEET_READ_URL` / `SHEET_ID`, `SHEET_GID` (lectura para historial), y código de validación.
- **form.js** – Lógica del formulario (validación y envío).
- **history.js** – Carga datos de la hoja, filtros por mes y nombre, y muestra historial en tarjetas o tabla.
- **Code.gs** – Código para pegar en Apps Script (recibe datos y escribe en la hoja).
- **formulario.html** – Formulario autocontenido para servir desde Apps Script (Opción A).
- **README.md** – Este archivo.

Para que la pestaña **Mi historial** funcione, la hoja debe ser **pública** (o “Cualquier persona con el enlace”) y en `config.js` deben estar configurados `SHEET_ID` y `SHEET_GID`.
