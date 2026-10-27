/* Bộ lọc thông minh KATY AP/AR. Lõi lọc: HAK_SMART_FILTER core/smart-filter.js (nhúng nguyên văn, commit 51816814f1224e8d0f666dc9a3cc1c66ca440b83).
   Giao diện lọc viết riêng cho ứng dụng; lọc và tổng do máy chủ tính, trình duyệt chỉ dựng điều kiện và hiển thị. */
var LF_PERIODS = 36;
function lfOptions(f) {
    var o = typeof f.options === 'function' ? f.options() : (f.options || []);
    return o.filter(function (x) { return x.v !== ''; }).map(function (x) { return { value: String(x.v), label: x.l }; });
}
/* Bộ lọc đã lưu: localStorage khi dùng được; nếu trình duyệt chặn thì giữ trong bộ nhớ đến khi tải lại trang (và báo cho người dùng). */
var LF_PRESETS = null, LF_PERSISTENT = false;
function lfPresets() {
    if (!LF_PRESETS) {
        var st = null;
        try { st = window.localStorage; st.getItem('hak.sf.presets'); LF_PERSISTENT = true; } catch (e) { st = null; LF_PERSISTENT = false; }
        LF_PRESETS = window.HAKCore.sf.presets(st);
    }
    return LF_PRESETS;
}
function listFilter(cfg) {
    var SF = window.HAKCore.sf, fields = cfg.fields, byKey = {};
    fields.forEach(function (f) { byKey[f.key] = f; });
    var core = { screenId: cfg.screenId, fields: fields.map(function (f) { return { key: f.key, label: f.label, type: f.type === 'range' ? 'enum' : f.type, options: f.type === 'range' ? [] : function () { return lfOptions(f); } }; }) };
    var q0 = cfg.q || {};
    function fromUrl(q) {
        var s = SF.empty();
        s.q = q.q || '';
        if (q.from || q.to) s = SF.setDates(s, SF.isoDay(q.from), SF.isoDay(q.to));
        fields.forEach(function (f) {
            var sv = q['s.' + f.key], ov = q['o.' + f.key], fv = q['f.' + f.key], lv = q[f.key];
            if (f.type === 'multi') { var v = sv ? sv.split('|') : (lv ? [lv] : []); if (v.length) s.sel[f.key] = v; }
            else if (f.type === 'bool') { if (fv === '1' || lv === '1' || lv === 'true') s.flag[f.key] = true; }
            else { var x = ov || lv || ''; if (x) s.one[f.key] = x; }
        });
        return SF.normalize(s, core);
    }
    function toUrl(s) {
        var p = {};
        cfg.keep && cfg.keep.forEach(function (k) { if (q0[k]) p[k] = q0[k]; });
        if (s.q) p.q = s.q;
        if (s.tu) p.from = s.tu;
        if (s.den) p.to = s.den;
        Object.keys(s.sel).forEach(function (k) { p['s.' + k] = s.sel[k].join('|'); });
        Object.keys(s.one).forEach(function (k) { p['o.' + k] = s.one[k]; });
        Object.keys(s.flag).forEach(function (k) { p['f.' + k] = '1'; });
        return p;
    }
    var state = fromUrl(q0);
    /* Điều kiện gửi máy chủ. Trả { params, error }: lỗi đầu vào được báo, không bỏ qua âm thầm. */
    function request(s) {
        s = SF.normalize(s || state, core);
        var adv = { sel: {}, range: {}, flag: {} }, flat = {}, err = '', p = {};
        if (s.q) p.q = s.q;
        if (s.tu) p.from = s.tu;
        if (s.den) p.to = s.den;
        var dp = SF.dateProblem(s);
        if (dp) err = dp;
        var ranges = {};
        fields.forEach(function (f) {
            if (f.type === 'multi' && s.sel[f.key]) { if (f.flat) flat[f.flat] = s.sel[f.key][0]; else adv.sel[f.advKey || f.key] = s.sel[f.key]; }
            else if (f.type === 'bool' && s.flag[f.key]) { if (f.flat) flat[f.flat] = true; else adv.flag[f.advKey || f.key] = true; }
            else if (f.type === 'enum' && s.one[f.key]) flat[f.flat || f.key] = s.one[f.key];
            else if (f.type === 'range' && s.one[f.key]) { var r = ranges[f.advKey] = ranges[f.advKey] || {}; r[f.part] = { raw: s.one[f.key], kind: f.rkind, label: f.label }; }
        });
        Object.keys(ranges).forEach(function (k) {
            var out = {}, kind = null;
            ['from', 'to'].forEach(function (part) {
                var x = ranges[k][part];
                if (!x) return;
                kind = x.kind;
                var v;
                if (x.kind === 'date') { v = parseDateVn(x.raw); if (!v) { err = err || x.label + ': ngày không hợp lệ (dd/MM/yyyy)'; return; } }
                else {
                    var cur = adv.sel.currency && adv.sel.currency.length === 1 ? adv.sel.currency[0] : '';
                    if (!cur) { err = err || 'Lọc theo số tiền cần chọn đúng một tiền tệ'; return; }
                    v = parseMoney(x.raw, cur);
                    if (v === null || Number.isNaN(v)) { err = err || x.label + ': số tiền không hợp lệ'; return; }
                }
                out[part] = v;
            });
            if (out.from !== undefined && out.to !== undefined && out.from > out.to) err = err || 'Giá trị "từ" phải nhỏ hơn hoặc bằng "đến"';
            if (out.from !== undefined || out.to !== undefined) adv.range[k] = out;
        });
        if (Object.keys(adv.sel).length || Object.keys(adv.range).length || Object.keys(adv.flag).length) p.adv = adv;
        Object.keys(flat).forEach(function (k) { p[k] = flat[k]; });
        return { params: p, error: err };
    }
    function apply(s) {
        var r = request(s);
        if (r.error) { toast('⚠ ' + r.error, 'warn'); return false; }
        state = SF.normalize(s, core);
        go(cfg.route, toUrl(state));
        return true;
    }
    var presets = lfPresets();
    var el = h('div', { class: 'sf', 'data-sf': cfg.screenId }), bar = h('div', { class: 'sf-bar' }), chipsBox = h('div', { class: 'fchips' }), resultLine = h('div', { class: 'sf-sum', role: 'status' });
    var qIn = h('input', { type: 'search', class: 'sf-q', value: state.q, placeholder: cfg.placeholder || 'Tìm…', 'aria-label': 'Tìm kiếm (không dấu)', 'data-sf-q': '1' });
    var tu = dateInput(state.tu, { 'aria-label': 'Từ ngày', title: 'Từ ngày', 'data-sf-tu': '1' }), den = dateInput(state.den, { 'aria-label': 'Đến ngày', title: 'Đến ngày', 'data-sf-den': '1' });
    var per = h('select', { 'aria-label': 'Kỳ', 'data-sf-period': '1' });
    (function () {
        per.appendChild(h('option', { value: '' }, 'Kỳ: tùy chọn'));
        var t = new Date(todayIso() + 'T00:00:00Z');
        for (var i = 0; i < LF_PERIODS; i++) {
            var y = t.getUTCFullYear(), m = t.getUTCMonth() + 1, v = y + '-' + ('0' + m).slice(-2);
            per.appendChild(h('option', { value: v }, 'Kỳ ' + ('0' + m).slice(-2) + '/' + y));
            t.setUTCMonth(t.getUTCMonth() - 1);
        }
        per.value = state.ky || '';
    })();
    per.addEventListener('change', function () { var s = SF.setPeriod(draftFromToolbar(), per.value); tu.value = SF.fmtVN(s.tu); den.value = SF.fmtVN(s.den); });
    function draftFromToolbar() {
        var s = SF.normalize(state, core), a = parseDateVn(tu.value), b = parseDateVn(den.value);
        s.q = qIn.value.trim();
        if (cfg.noDates) return s;
        if (a === null || b === null) { toast('⚠ Ngày không hợp lệ — nhập dd/MM/yyyy', 'warn'); return null; }
        return SF.setDates(s, a, b);
    }
    function applyToolbar() { var s = draftFromToolbar(); if (s) apply(s); }
    qIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') applyToolbar(); });
    [tu, den].forEach(function (i) { i.addEventListener('keydown', function (e) { if (e.key === 'Enter') applyToolbar(); }); });
    var nAdv = SF.activeCount(state) - (state.q ? 1 : 0) - (state.tu || state.den ? 1 : 0);
    var advBtn = h('button', { type: 'button', class: 'sf-adv' + (nAdv > 0 ? ' has' : ''), 'aria-haspopup': 'dialog', 'data-sf-adv': '1', onclick: openAdvanced }, '⚙ Lọc nâng cao' + (nAdv > 0 ? ' (' + nAdv + ')' : ''));
    var okBtn = h('button', { type: 'button', class: 'primary', onclick: applyToolbar }, 'Lọc'), clrBtn = h('button', { type: 'button', 'data-sf-reset': '1', onclick: function () { apply(SF.empty()); } }, 'Xóa lọc');
    var savedSel = h('select', { 'aria-label': 'Bộ lọc đã lưu', 'data-sf-saved': '1' });
    function drawSaved() {
        clear(savedSel);
        var names = presets.list(cfg.screenId);
        savedSel.appendChild(h('option', { value: '' }, names.length ? 'Bộ lọc đã lưu (' + names.length + ')' : 'Chưa có bộ lọc lưu'));
        names.forEach(function (n) { savedSel.appendChild(h('option', { value: n }, n)); });
    }
    drawSaved();
    savedSel.addEventListener('change', function () {
        if (!savedSel.value) return;
        var r = SF.applyPreset(core, presets.get(cfg.screenId, savedSel.value));
        if (!r.ok) { toast('⚠ Không đọc được bộ lọc đã lưu này', 'warn'); return; }
        if (r.dropped.length) toast('⚠ Màn hình này không còn áp dụng: ' + r.dropped.join(', ') + ' — các điều kiện còn lại đã được dùng', 'warn');
        apply(r.state);
    });
    var saveBtn = h('button', { type: 'button', class: 'sm', title: 'Lưu điều kiện hiện tại (trên trình duyệt này, riêng màn hình này)', onclick: function () {
            if (SF.isEmpty(state)) { toast('Chưa chọn điều kiện lọc nào', 'warn'); return; }
            var inp = h('input', { placeholder: 'Ví dụ: Quá hạn USD', maxlength: 60 });
            modal('Lưu bộ lọc', h('div', null, field('Tên bộ lọc', inp, null, LF_PERSISTENT ? 'Chỉ lưu điều kiện lọc (không lưu dữ liệu), trên trình duyệt này.' : '⚠ Trình duyệt chặn lưu trữ: bộ lọc chỉ giữ đến khi tải lại trang.')), [{ label: 'Hủy' }, { label: 'Lưu', primary: true, onClick: function () {
                        var r = presets.save(cfg.screenId, inp.value, state);
                        if (!r.ok) { toast('⚠ ' + r.msg, 'warn'); return false; }
                        toast('Đã lưu bộ lọc “' + inp.value.trim() + '”');
                        drawSaved();
                    } }]);
        } }, '💾 Lưu'), delBtn = h('button', { type: 'button', class: 'sm', title: 'Xóa bộ lọc đang chọn', onclick: function () { if (!savedSel.value) { toast('Chọn bộ lọc cần xóa', 'warn'); return; } presets.remove(cfg.screenId, savedSel.value); toast('Đã xóa bộ lọc'); drawSaved(); } }, '🗑');
    (cfg.noDates ? [qIn, okBtn, advBtn, clrBtn, savedSel, saveBtn, delBtn] : [qIn, h('label', { class: 'sf-d' }, 'Từ ', tu), h('label', { class: 'sf-d' }, 'Đến ', den), per, okBtn, advBtn, clrBtn, savedSel, saveBtn, delBtn]).forEach(function (x) { bar.appendChild(x); });
    function drawChips() {
        clear(chipsBox);
        var cs = SF.conditions(core, state);
        cs.forEach(function (c) {
            chipsBox.appendChild(h('button', { type: 'button', class: 'fchip', title: 'Bỏ điều kiện này', 'aria-label': 'Bỏ ' + c.text, onclick: function () { apply(SF.remove(state, c)); } }, c.text + ' ×'));
        });
        if (cs.length) chipsBox.appendChild(h('button', { type: 'button', class: 'sm', onclick: function () { apply(SF.empty()); } }, 'Xóa tất cả'));
    }
    function setResult(total) {
        clear(resultLine);
        resultLine.appendChild(h('b', null, 'Kết quả: ' + Number(total).toLocaleString('vi-VN') + ' dòng'));
        resultLine.appendChild(h('span', { class: 'hint', 'data-sf-scope': '1' }, 'Phạm vi lọc: ' + SF.scopeText(core, state)));
    }
    drawChips();
    resultLine.appendChild(h('span', { class: 'hint' }, 'Đang tải…'));
    el.appendChild(bar); el.appendChild(chipsBox); el.appendChild(resultLine);
    /* ---- hộp thoại lọc nâng cao ---- */
    function multiBox(f, draft) {
        var opts = lfOptions(f), box = h('div', { class: 'sfm' }), list = h('div', { class: 'sfm-list', role: 'group', 'aria-label': f.label }), cnt = h('span', { class: 'hint' });
        var qs = opts.length > 8 ? h('input', { type: 'search', placeholder: 'Tìm (không dấu)…', 'aria-label': 'Tìm trong ' + f.label }) : null;
        function draw() {
            clear(list);
            var fq = qs ? SF.fold(qs.value) : '', shown = 0, cur = draft.sel[f.key] || [];
            opts.forEach(function (o) {
                if (fq && SF.fold(o.label).indexOf(fq) < 0) return;
                shown++;
                var cb = h('input', { type: 'checkbox', checked: cur.indexOf(o.value) >= 0 });
                cb.addEventListener('change', function () {
                    var a = (draft.sel[f.key] || []).slice(), i = a.indexOf(o.value);
                    if (cb.checked && i < 0) a.push(o.value);
                    if (!cb.checked && i >= 0) a.splice(i, 1);
                    if (a.length) draft.sel[f.key] = a; else delete draft.sel[f.key];
                    cnt.textContent = a.length + '/' + opts.length + ' đã chọn';
                });
                list.appendChild(h('label', { class: 'sfm-row' }, cb, ' ' + o.label));
            });
            if (!shown) list.appendChild(h('div', { class: 'hint' }, 'Không có lựa chọn khớp'));
            cnt.textContent = (draft.sel[f.key] || []).length + '/' + opts.length + ' đã chọn';
        }
        if (qs) { qs.addEventListener('input', draw); box.appendChild(qs); }
        box.appendChild(list); box.appendChild(cnt);
        draw();
        return field(f.label, box);
    }
    function advancedBody(draft) {
        var body = h('div', { class: 'sfa' }), groups = [], gmap = {};
        fields.forEach(function (f) { var g = f.group || 'Khác'; if (!gmap[g]) { gmap[g] = []; groups.push(g); } gmap[g].push(f); });
        groups.forEach(function (g) {
            var fs = h('fieldset', { class: 'sfa-g' }, h('legend', null, g)), grid = h('div', { class: 'grid g2' }), flags = h('div', { class: 'sfa-flags' });
            gmap[g].forEach(function (f) {
                if (f.type === 'multi') grid.appendChild(multiBox(f, draft));
                else if (f.type === 'bool') {
                    var cb = h('input', { type: 'checkbox', checked: !!draft.flag[f.key], 'data-sf-field': f.key });
                    cb.addEventListener('change', function () { if (cb.checked) draft.flag[f.key] = true; else delete draft.flag[f.key]; });
                    flags.appendChild(h('label', { class: 'sfa-flag' }, cb, ' ' + f.label));
                }
                else if (f.type === 'range') {
                    var inp = f.rkind === 'date' ? dateInput('', { placeholder: 'dd/MM/yyyy', 'data-sf-field': f.key }) : h('input', { class: 'money', inputmode: 'decimal', placeholder: f.part === 'from' ? 'Từ' : 'Đến', 'data-sf-field': f.key });
                    inp.value = draft.one[f.key] || '';
                    inp.addEventListener('input', function () { if (inp.value.trim()) draft.one[f.key] = inp.value.trim(); else delete draft.one[f.key]; });
                    grid.appendChild(field(f.label, inp));
                }
                else {
                    var s2 = sel([{ v: '', l: 'Tất cả' }].concat(f.options ? (typeof f.options === 'function' ? f.options() : f.options).filter(function (x) { return x.v !== ''; }) : []), draft.one[f.key] || '', { 'data-sf-field': f.key });
                    s2.addEventListener('change', function () { if (s2.value) draft.one[f.key] = s2.value; else delete draft.one[f.key]; });
                    grid.appendChild(field(f.label, s2));
                }
            });
            fs.appendChild(grid);
            if (flags.children.length) fs.appendChild(flags);
            body.appendChild(fs);
        });
        return body;
    }
    function openAdvanced() {
        var draft = SF.normalize(state, core), holder = h('div'), mount = function () { clear(holder); holder.appendChild(advancedBody(draft)); };
        mount();
        modal('Lọc nâng cao', holder, [{ label: 'Hủy' }, { label: 'Đặt lại', onClick: function () { var keep = { q: draft.q, tu: draft.tu, den: draft.den, ky: draft.ky }; draft = SF.empty(); draft.q = keep.q; draft.tu = keep.tu; draft.den = keep.den; draft.ky = keep.ky; mount(); return false; } },
            { label: 'Áp dụng', primary: true, onClick: function () { return apply(draft) ? undefined : false; } }]);
    }
    return { el: el, request: function () { return request(state); }, setResult: setResult, core: core, state: function () { return state; } };
}
