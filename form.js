(function () {
    'use strict';

    const form = document.getElementById('reportForm');
    const submitBtn = document.getElementById('submitBtn');
    const messageEl = document.getElementById('message');

    function showMessage(text, type) {
        messageEl.textContent = text;
        messageEl.className = 'message ' + (type === 'error' ? 'error' : 'success');
        messageEl.classList.remove('hidden');
        messageEl.setAttribute('role', 'alert');
    }

    function hideMessage() {
        messageEl.classList.add('hidden');
        messageEl.textContent = '';
    }

    function setFieldError(fieldId, text) {
        const el = document.getElementById('error' + fieldId);
        if (el) {
            el.textContent = text || '';
        }
    }

    function validateForm() {
        let valid = true;
        const nombre = document.getElementById('nombre').value.trim();
        const grupo = document.getElementById('grupo').value;
        const predico = document.querySelector('input[name="predico"]:checked');

        setFieldError('Nombre', '');
        setFieldError('Grupo', '');
        setFieldError('Predico', '');

        if (!nombre) {
            setFieldError('Nombre', 'Escribe tu nombre.');
            valid = false;
        }
        if (!grupo) {
            setFieldError('Grupo', 'Selecciona tu grupo.');
            valid = false;
        }
        if (!predico) {
            setFieldError('Predico', 'Indica si predicaste este mes.');
            valid = false;
        }

        return valid;
    }

    function getFormData() {
        const num = (id) => {
            const v = document.getElementById(id).value.trim();
            return v === '' ? '' : (parseInt(v, 10) || 0);
        };
        return {
            nombre: document.getElementById('nombre').value.trim(),
            grupo: document.getElementById('grupo').value,
            predico: document.querySelector('input[name="predico"]:checked')?.value || '',
            horas: num('horas'),
            revisitas: num('revisitas'),
            estudios: num('estudios'),
            publicaciones: num('publicaciones'),
            supervision: document.getElementById('supervision').value.trim()
        };
    }

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        hideMessage();

        if (typeof SCRIPT_URL === 'undefined' || !SCRIPT_URL) {
            showMessage('Configura la URL del script en config.js (SCRIPT_URL).', 'error');
            return;
        }

        if (!validateForm()) {
            showMessage('Completa los campos obligatorios.', 'error');
            return;
        }

        const data = getFormData();
        if (typeof FORM_VALIDATION_CODE !== 'undefined' && FORM_VALIDATION_CODE) {
            data.codigo = FORM_VALIDATION_CODE;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';

        const params = new URLSearchParams();
        Object.keys(data).forEach(function (key) {
            params.append(key, data[key] === undefined || data[key] === null ? '' : data[key]);
        });

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString(),
                redirect: 'manual'
            });

            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar reporte';

            // Google Apps Script a veces responde 302 (redirige a googleusercontent.com).
            // El navegador no reenvía el POST en la redirección, pero el script puede haber
            // procesado el POST antes. Tratamos 302 como envío aceptado.
            if (response.type === 'opaqueredirect' || response.status === 302 || response.status === 0) {
                showMessage('Reporte enviado. Si no aparece en la hoja, abre la pestaña "Mi historial" y pulsa Actualizar, o intenta de nuevo.', 'success');
                form.reset();
                return;
            }

            const text = await response.text();
            let result = { ok: response.ok, message: text };
            try {
                result = JSON.parse(text);
            } catch (_) {
                // Si la respuesta es HTML (p. ej. página de echo de Google), no mostrar el HTML.
                if (typeof text === 'string' && (text.trim().startsWith('<') || text.includes('<html'))) {
                    result = { ok: response.ok, message: 'Reporte enviado correctamente. Gracias.' };
                }
            }

            if (result.ok) {
                showMessage(result.message || 'Reporte enviado correctamente. Gracias.', 'success');
                form.reset();
            } else {
                showMessage(result.message || 'Error al guardar. Vuelve a intentarlo.', 'error');
            }
        } catch (err) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar reporte';
            let msg = 'No se pudo conectar. Revisa la URL en config.js y que el script esté desplegado.';
            if (err.message) msg += ' (' + err.message + ')';
            msg += ' Si estás en GitHub Pages y el error persiste, usa el formulario en la URL del script añadiendo ?form=1.';
            showMessage(msg, 'error');
        }
    });

    form.addEventListener('reset', function () {
        hideMessage();
        setFieldError('Nombre', '');
        setFieldError('Grupo', '');
        setFieldError('Predico', '');
    });
})();
