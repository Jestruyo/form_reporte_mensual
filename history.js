(function () {
    'use strict';

    const tabBtnForm = document.getElementById('tabBtnForm');
    const tabBtnHistory = document.getElementById('tabBtnHistory');
    const panelForm = document.getElementById('panelForm');
    const panelHistory = document.getElementById('panelHistory');
    const filterMonth = document.getElementById('filterMonth');
    const filterName = document.getElementById('filterName');
    const btnApplyHistory = document.getElementById('btnApplyHistory');
    const btnRefreshHistory = document.getElementById('btnRefreshHistory');
    const historyLoading = document.getElementById('historyLoading');
    const historyError = document.getElementById('historyError');
    const historyEmpty = document.getElementById('historyEmpty');
    const historyList = document.getElementById('historyList');

    let historyData = [];

    function parseGoogleSheetsDate(dateValue) {
        if (dateValue === undefined || dateValue === null) return null;
        if (dateValue instanceof Date) return dateValue;
        if (typeof dateValue === 'number') {
            const d = new Date(dateValue);
            return isNaN(d.getTime()) ? null : d;
        }
        if (typeof dateValue === 'string' && dateValue.startsWith('Date(')) {
            const m = dateValue.match(/Date\((\d+),(\d+),(\d+)(?:,(\d+))?(?:,(\d+))?(?:,(\d+))?\)/);
            if (m) {
                return new Date(
                    parseInt(m[1], 10),
                    parseInt(m[2], 10),
                    parseInt(m[3], 10),
                    m[4] ? parseInt(m[4], 10) : 0,
                    m[5] ? parseInt(m[5], 10) : 0,
                    m[6] ? parseInt(m[6], 10) : 0
                );
            }
        }
        if (typeof dateValue === 'string') {
            const d = new Date(dateValue);
            return isNaN(d.getTime()) ? null : d;
        }
        return null;
    }

    function formatDate(date) {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function extractNum(val) {
        if (val === undefined || val === null || val === '') return 0;
        const n = Number(val);
        return isNaN(n) ? 0 : n;
    }

    function normalizeForFilter(str) {
        if (!str) return '';
        return str.toString().toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    function processSheetData(jsonData) {
        if (!jsonData || !jsonData.table || !jsonData.table.rows) return [];
        return jsonData.table.rows.map(function (row) {
            const c = row.c || [];
            const ts = parseGoogleSheetsDate(c[0] && c[0].v);
            return {
                timestamp: ts,
                nombre: (c[1] && c[1].v) || '',
                grupo: (c[2] && c[2].v) != null ? c[2].v : '',
                predico: (c[3] && c[3].v) || '',
                horas: extractNum(c[4] && c[4].v),
                revisitas: extractNum(c[5] && c[5].v),
                estudios: extractNum(c[6] && c[6].v),
                publicaciones: extractNum(c[7] && c[7].v),
                supervision: (c[8] && c[8].v) || ''
            };
        }).filter(function (item) { return item.nombre; });
    }

    function showHistoryError(msg) {
        historyError.textContent = msg || '';
        historyError.classList.toggle('hidden', !msg);
    }

    function getFilteredData() {
        const monthVal = filterMonth ? filterMonth.value : '';
        const nameVal = filterName ? normalizeForFilter(filterName.value) : '';

        return historyData.filter(function (item) {
            if (monthVal !== '') {
                if (!item.timestamp) return false;
                const d = item.timestamp instanceof Date ? item.timestamp : parseGoogleSheetsDate(item.timestamp);
                if (!d || isNaN(d.getTime())) return false;
                if (d.getMonth() !== parseInt(monthVal, 10)) return false;
                const currentYear = new Date().getFullYear();
                if (d.getFullYear() !== currentYear) return false;
            }
            if (nameVal) {
                if (!normalizeForFilter(item.nombre).includes(nameVal)) return false;
            }
            return true;
        });
    }

    function renderHistory(filtered) {
        historyEmpty.classList.add('hidden');
        historyList.classList.remove('hidden');
        historyList.innerHTML = '';

        if (filtered.length === 0) {
            historyList.classList.add('hidden');
            historyEmpty.classList.remove('hidden');
            historyEmpty.textContent = 'No hay reportes con los filtros seleccionados.';
            return;
        }

        historyEmpty.textContent = '';

        var sorted = filtered.slice().sort(function (a, b) {
            var ta = a.timestamp && a.timestamp.getTime ? a.timestamp.getTime() : 0;
            var tb = b.timestamp && b.timestamp.getTime ? b.timestamp.getTime() : 0;
            return tb - ta;
        });

        var isWide = window.innerWidth >= 720;
        if (isWide) {
            var table = document.createElement('div');
            table.className = 'history-table-wrap';
            table.innerHTML = '<table class="history-table" aria-label="Historial de reportes">' +
                '<thead><tr>' +
                '<th>Fecha</th><th>Nombre</th><th>Grupo</th><th>Predicó</th>' +
                '<th>Horas</th><th>Revisitas</th><th>Estudios</th><th>Pub.</th>' +
                '</tr></thead><tbody></tbody></table>';
            var tbody = table.querySelector('tbody');
            sorted.forEach(function (item) {
                var tr = document.createElement('tr');
                var predicoClass = item.predico === 'No prediqué' ? ' predico-no' : '';
                tr.innerHTML =
                    '<td>' + formatDate(item.timestamp) + '</td>' +
                    '<td>' + escapeHtml(item.nombre) + '</td>' +
                    '<td>' + escapeHtml(String(item.grupo)) + '</td>' +
                    '<td class="' + predicoClass + '">' + escapeHtml(item.predico || '') + '</td>' +
                    '<td>' + item.horas + '</td>' +
                    '<td>' + item.revisitas + '</td>' +
                    '<td>' + item.estudios + '</td>' +
                    '<td>' + item.publicaciones + '</td>';
                tbody.appendChild(tr);
            });
            historyList.appendChild(table);
        } else {
            sorted.forEach(function (item) {
                var card = document.createElement('div');
                card.className = 'history-card';
                var predicoClass = item.predico === 'Si prediqué' ? 'yes' : 'no';
                card.innerHTML =
                    '<div class="history-card-header">' +
                    '<span class="history-card-name">' + escapeHtml(item.nombre) + '</span>' +
                    '<span class="history-card-date">' + formatDate(item.timestamp) + '</span>' +
                    '</div>' +
                    '<div class="history-card-predico ' + predicoClass + '">' + escapeHtml(item.predico || '') + '</div>' +
                    '<div class="history-card-stats">' +
                    '<span>Grupo ' + escapeHtml(String(item.grupo)) + '</span>' +
                    '<span><strong>Horas:</strong> ' + item.horas + '</span>' +
                    '<span><strong>Revisitas:</strong> ' + item.revisitas + '</span>' +
                    '<span><strong>Estudios:</strong> ' + item.estudios + '</span>' +
                    '<span><strong>Publicaciones:</strong> ' + item.publicaciones + '</span>' +
                    '</div>' +
                    (item.supervision ? '<div class="history-summary">Supervisión: ' + escapeHtml(item.supervision) + '</div>' : '');
                historyList.appendChild(card);
            });
        }
    }

    function escapeHtml(str) {
        if (str == null) return '';
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function applyHistoryView() {
        showHistoryError('');
        var filtered = getFilteredData();
        renderHistory(filtered);
    }

    function setHistoryLoading(loading) {
        historyLoading.classList.toggle('hidden', !loading);
        if (loading) {
            historyError.classList.add('hidden');
            historyList.classList.add('hidden');
            historyEmpty.classList.add('hidden');
        }
    }

    function loadHistory() {
        if (typeof SHEET_READ_URL === 'undefined' || !SHEET_READ_URL) {
            showHistoryError('Configura SHEET_READ_URL en config.js (SHEET_ID, SHEET_GID).');
            return;
        }
        setHistoryLoading(true);
        fetch(SHEET_READ_URL)
            .then(function (r) { return r.text(); })
            .then(function (text) {
                var m = text.match(/google\.visualization\.Query\.setResponse\((.*)\);/);
                if (!m) {
                    setHistoryLoading(false);
                    showHistoryError('No se pudo leer la hoja. Comprueba que sea pública.');
                    return;
                }
                var json = JSON.parse(m[1]);
                historyData = processSheetData(json);
                setHistoryLoading(false);
                applyHistoryView();
            })
            .catch(function (err) {
                setHistoryLoading(false);
                showHistoryError('Error al cargar: ' + (err.message || 'revisa la URL de la hoja.'));
            });
    }

    function switchTab(tabId) {
        var isForm = tabId === 'form';
        tabBtnForm.classList.toggle('active', isForm);
        tabBtnHistory.classList.toggle('active', !isForm);
        tabBtnForm.setAttribute('aria-selected', isForm ? 'true' : 'false');
        tabBtnHistory.setAttribute('aria-selected', !isForm ? 'true' : 'false');
        panelForm.classList.toggle('active', isForm);
        panelHistory.classList.toggle('active', !isForm);
        panelForm.hidden = !isForm;
        panelHistory.hidden = isForm;
        if (panelForm.setAttribute) panelForm.setAttribute('aria-hidden', isForm ? 'false' : 'true');
        if (panelHistory.setAttribute) panelHistory.setAttribute('aria-hidden', isForm ? 'true' : 'false');
        if (!isForm && historyData.length === 0) {
            var monthSelect = document.getElementById('filterMonth');
            if (monthSelect && monthSelect.value === '') {
                var now = new Date();
                monthSelect.value = String(now.getMonth());
            }
            loadHistory();
        }
    }

    function initMonthDefault() {
        if (filterMonth && filterMonth.value === '') {
            var now = new Date();
            filterMonth.value = String(now.getMonth());
        }
    }

    if (tabBtnForm && tabBtnHistory && panelForm && panelHistory) {
        tabBtnForm.addEventListener('click', function () { switchTab('form'); });
        tabBtnHistory.addEventListener('click', function () { switchTab('history'); });
    }

    if (btnApplyHistory) {
        btnApplyHistory.addEventListener('click', function () {
            if (historyData.length === 0) {
                loadHistory();
            } else {
                applyHistoryView();
            }
        });
    }
    if (btnRefreshHistory) {
        btnRefreshHistory.addEventListener('click', loadHistory);
    }
    if (filterMonth && filterName) {
        filterName.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (historyData.length === 0) loadHistory();
                else applyHistoryView();
            }
        });
    }

    initMonthDefault();
})();
