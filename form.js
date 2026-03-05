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

    function submitViaIframe(data) {
        var iframe = document.getElementById('formTargetFrame');
        if (!iframe) {
            iframe = document.createElement('iframe');
            iframe.name = 'formTargetFrame';
            iframe.id = 'formTargetFrame';
            iframe.setAttribute('aria-hidden', 'true');
            iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;visibility:hidden;';
            document.body.appendChild(iframe);
        }
        var f = document.createElement('form');
        f.method = 'POST';
        f.action = SCRIPT_URL;
        f.target = 'formTargetFrame';
        f.style.display = 'none';
        Object.keys(data).forEach(function (key) {
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = data[key] === undefined || data[key] === null ? '' : String(data[key]);
            f.appendChild(input);
        });
        document.body.appendChild(f);
        f.submit();
        document.body.removeChild(f);
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

        submitViaIframe(data);
        showMessage('Revisa "Mi historial" para ver si se guardó. Si no aparece, usa el botón verde "Abrir formulario seguro para enviar" — ese sí guarda siempre.', 'success');
        form.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar reporte';
    });

    form.addEventListener('reset', function () {
        hideMessage();
        setFieldError('Nombre', '');
        setFieldError('Grupo', '');
        setFieldError('Predico', '');
    });

    var linkSeguro = document.getElementById('linkFormSeguro');
    if (linkSeguro && typeof SCRIPT_URL !== 'undefined' && SCRIPT_URL) {
        linkSeguro.href = SCRIPT_URL.indexOf('?') >= 0 ? SCRIPT_URL + '&form=1' : SCRIPT_URL + '?form=1';
    }
})();
