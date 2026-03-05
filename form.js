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

    form.addEventListener('submit', function (e) {
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

        var data = getFormData();
        if (typeof FORM_VALIDATION_CODE !== 'undefined' && FORM_VALIDATION_CODE) {
            data.codigo = FORM_VALIDATION_CODE;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Enviando…';

        var body = JSON.stringify(data);
        var opts = {
            method: 'POST',
            redirect: 'manual',
            cache: 'no-cache',
            headers: { 'Content-Type': 'application/json' },
            body: body
        };

        function onDone(result) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar reporte';
            if (result && result.ok) {
                showMessage(result.message || 'Reporte enviado. Revisa la pestaña "Mi historial" para confirmar que se guardó.', 'success');
                form.reset();
            } else {
                showMessage((result && result.message) || 'Error al enviar. Vuelve a intentar.', 'error');
            }
        }
        function onFail(err) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Enviar reporte';
            showMessage('Error al enviar: ' + (err.message || 'vuelve a intentar.'), 'error');
        }

        function parseResponse(res) {
            return res.text().then(function (text) {
                try {
                    return JSON.parse(text);
                } catch (_) {
                    return { ok: false, message: text || 'Error desconocido.' };
                }
            });
        }

        fetch(SCRIPT_URL, opts)
            .then(function (res) {
                if (res.type === 'opaqueredirect' || res.status === 0) {
                    onFail(new Error('No se pudo conectar con el servidor. Comprueba la URL del script.'));
                    return;
                }
                if (res.status === 302 || res.status === 301) {
                    var location = res.headers.get('Location');
                    if (location) {
                        return fetch(location, {
                            method: 'POST',
                            cache: 'no-cache',
                            headers: { 'Content-Type': 'application/json' },
                            body: body
                        }).then(parseResponse);
                    }
                }
                return parseResponse(res);
            })
            .then(function (result) {
                if (result) {
                    onDone(result);
                }
            })
            .catch(onFail);
    });

    form.addEventListener('reset', function () {
        hideMessage();
        setFieldError('Nombre', '');
        setFieldError('Grupo', '');
        setFieldError('Predico', '');
    });
})();
