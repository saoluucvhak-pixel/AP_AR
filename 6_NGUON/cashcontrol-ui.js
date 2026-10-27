/* Đối chiếu quỹ với sao kê ngân hàng và Kiểm kê quỹ. */
var CC_DENOM = { VND: [500000, 200000, 100000, 50000, 20000, 10000, 5000, 2000, 1000, 500], USD: [10000, 5000, 2000, 1000, 500, 200, 100] };
CB_KIND.ADJ = 'Xử lý kiểm kê';
var CC_ADJ = { EXPENSE: 'Tính vào chi phí/thu nhập khác', COMPENSATION: 'Người chịu trách nhiệm bồi thường/nộp lại', PENDING: 'Chờ xử lý (treo)' };
function ccNorm(t) { return String(t === undefined || t === null ? '' : t).toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim(); }
function ccSplitCsv(text) {
    var head = text.split(/\r?\n/).filter(function (l) { return l.trim(); }).slice(0, 12), delim = [';', '\t', ','].map(function (d) { return [d, head.reduce(function (t, l) { return t + l.split(d).length - 1; }, 0)]; }).sort(function (a, b) { return b[1] - a[1]; })[0][0], rows = [], row = [], cell = '', q = false, i, ch;
    for (i = 0; i < text.length; i++) {
        ch = text[i];
        if (q) {
            if (ch === '"' && text[i + 1] === '"') {
                cell += '"';
                i++;
            }
            else if (ch === '"')
                q = false;
            else
                cell += ch;
        }
        else if (ch === '"')
            q = true;
        else if (ch === delim) {
            row.push(cell);
            cell = '';
        }
        else if (ch === '\n' || ch === '\r') {
            if (ch === '\r' && text[i + 1] === '\n')
                i++;
            row.push(cell);
            cell = '';
            rows.push(row);
            row = [];
        }
        else
            cell += ch;
    }
    if (cell || row.length) {
        row.push(cell);
        rows.push(row);
    }
    return rows;
}
// Nhận diện cột của sao kê (ngày, ghi nợ/ghi có hoặc số tiền, nội dung) rồi đổi sang các dòng {date, amountMinor (+ thu, − chi), text}.
function ccSheetToLines(rows, cur) {
    var hi = -1, col = {}, i, j;
    for (i = 0; i < Math.min(rows.length, 25) && hi < 0; i++) {
        var c = { date: -1, debit: -1, credit: -1, amount: -1, text: -1 };
        for (j = 0; j < rows[i].length; j++) {
            var t = ccNorm(rows[i][j]);
            if (!t)
                continue;
            if (c.date < 0 && /(^|\s)(ngay|date)/.test(t))
                c.date = j;
            else if (c.debit < 0 && (/ghi no|debit|so tien no|^no$|rut ra|\bchi\b/.test(t)))
                c.debit = j;
            else if (c.credit < 0 && (/ghi co|credit|so tien co|^co$|nop vao|\bthu\b/.test(t)))
                c.credit = j;
            else if (c.amount < 0 && /so tien|amount|gia tri|giao dich/.test(t))
                c.amount = j;
            else if (c.text < 0 && /noi dung|dien giai|mo ta|description|narrative|chi tiet|ghi chu/.test(t))
                c.text = j;
        }
        if (c.date >= 0 && ((c.debit >= 0 || c.credit >= 0) || c.amount >= 0)) {
            hi = i;
            col = c;
        }
    }
    if (hi < 0)
        return { lines: [], bad: 0, error: 'Không nhận ra cột Ngày / Ghi nợ / Ghi có (hoặc Số tiền) trong tệp.' };
    var out = [], bad = 0, num = function (v) { v = String(v === undefined || v === null ? '' : v).trim().replace(/^\+/, '').replace(/^\((.*)\)$/, '-$1'); if (!v)
        return 0; var m = parseMoney(v, cur); return m === null || Number.isNaN(m) ? NaN : m; };
    for (i = hi + 1; i < rows.length; i++) {
        var r = rows[i], dv = String(r[col.date] === undefined ? '' : r[col.date]).trim();
        if (!dv)
            continue;
        var d = parseDateVn(dv.slice(0, 10)) || (/^\d{4}-\d{2}-\d{2}/.test(dv) ? dv.slice(0, 10) : ''), amt = 0;
        if (col.debit >= 0 || col.credit >= 0) {
            var cr = col.credit >= 0 ? num(r[col.credit]) : 0, db = col.debit >= 0 ? num(r[col.debit]) : 0;
            amt = Number.isNaN(cr) || Number.isNaN(db) ? NaN : Math.abs(cr) - Math.abs(db);
        }
        else
            amt = num(r[col.amount]);
        if (!d || Number.isNaN(amt) || amt === 0) {
            bad++;
            continue;
        }
        out.push({ date: d, amountMinor: amt, text: col.text >= 0 ? String(r[col.text] || '').replace(/[;\r\n\t]+/g, ' ').trim().slice(0, 200) : '' });
    }
    return { lines: out, bad: bad, error: '' };
}
async function ccReadStatementFile(file, cur) {
    var name = String(file.name || '').toLowerCase(), rows;
    if (/\.xlsx$/.test(name)) {
        var wb = await XLSXLite.read(await file.arrayBuffer()), sh = wb.sheets.filter(function (x) { return !x.hidden && x.rows.length; })[0];
        if (!sh)
            return { lines: [], bad: 0, error: 'Tệp Excel không có dữ liệu.' };
        rows = sh.rows;
    }
    else
        rows = ccSplitCsv(await file.text());
    return ccSheetToLines(rows, cur);
}
function ccLinesToText(lines, cur) { return lines.map(function (l) { return fmtDate(l.date) + ';' + fmtMoney(l.amountMinor, cur) + ';' + (l.text || ''); }).join('\n'); }
function ccAgeBadge(days, warn) { return days === null ? badge('Chưa từng', 'danger') : badge(days + ' ngày trước', days > warn ? 'warn' : 'ok'); }
function ccKindBadge(l) { return badge(CB_KIND[l.kind] || l.kind, l.kind === 'IN' || l.kind === 'XIN' || l.kind === 'EBUY' ? 'ok' : 'warn'); }
function ccParseStmt(text, cur) {
    var out = [], bad = 0;
    String(text || '').split(/\r?\n/).forEach(function (ln) {
        ln = ln.trim();
        if (!ln)
            return;
        var parts = ln.split(/\t|;|\|/).map(function (x) { return x.trim(); });
        if (parts.length < 2)
            parts = ln.split(/\s{2,}/);
        var d = parseDateVn(parts[0]) || (/^\d{4}-\d{2}-\d{2}$/.test(parts[0]) ? parts[0] : ''), a = String(parts[1] || '').replace(/^\+/, '').replace(/^\((.*)\)$/, '-$1'), v = parseMoney(a, cur);
        if (!d || v === null || Number.isNaN(v) || v === 0) {
            bad++;
            return;
        }
        out.push({ date: d, amountMinor: v, text: parts.slice(2).join(' ').slice(0, 200) });
    });
    return { lines: out, bad: bad };
}
VIEWS.bankrecon = async function (r, main, page) {
    var q = r.q, today = S.asOf || todayIso(), root = h('div'), slot = h('div');
    var all = S.boot.catalogs.cashAccounts.filter(function (a) { return a.active; }), pick = q.account || (all.filter(function (a) { return a.type === 'BANK'; })[0] || all[0] || {}).code || '';
    var accSel = sel(all.map(function (a) { return { v: a.code, l: a.code + ' – ' + (a.name || '') + ' (' + a.currency + ')' }; }), pick), dt = dateInput(q.date || today);
    root.appendChild(h('div', { class: 'bar' }, h('div', { class: 'grow' }, h('h1', null, 'Đối chiếu quỹ với sao kê ngân hàng'), h('div', { class: 'hint' }, 'Số dư sao kê = số dư sổ quỹ − khoản thu chưa lên sao kê + khoản chi chưa lên sao kê + khoản chỉ có trên sao kê (phí, lãi…). Chênh lệch bằng 0 mới xác nhận được.'))));
    root.appendChild(h('div', { class: 'card filters-row' }, h('div', { class: 'grid g4' }, field('Tài khoản', accSel), field('Ngày sao kê', dt)), h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: function () { go('bankrecon', { account: accSel.value, date: dt.getIso() || '' }); } }, 'Mở bản đối chiếu'))));
    var ovBox = h('div', { class: 'card', 'data-rc-overview': '1' }, h('h3', null, 'Tình hình đối chiếu các tài khoản'));
    root.appendChild(ovBox);
    root.appendChild(slot);
    page.show(root);
    api('bank.reconOverview', { asOf: today }).then(function (o) {
        if (!page.alive())
            return;
        var items = o.items.filter(function (x) { return x.type === 'BANK' || x.currency !== 'VND'; });
        ovBox.appendChild(responsiveList([{ label: 'Tài khoản', render: function (x) { return h('div', { style: 'white-space:nowrap' }, h('b', null, x.code), ' · ' + x.currency); } }, { label: 'Số dư sổ quỹ', align: 'r', render: function (x) { return fmtMoney(x.bookBalance, x.currency); } },
            { label: 'Chưa đối chiếu', render: function (x) { return x.pending ? x.pending + ' khoản (thu ' + fmtMoney(x.pendingThu, x.currency) + ' · chi ' + fmtMoney(x.pendingChi, x.currency) + ')' : 'Không'; } }, { label: 'Chỉ có trên sao kê chờ ghi sổ', render: function (x) { return x.carried ? x.carried + ' khoản' : ''; } },
            { label: 'Đối chiếu gần nhất', render: function (x) { return h('span', null, x.lastRecon ? fmtDate(x.lastRecon) + ' ' : '', ccAgeBadge(x.daysSince, 35)); } }, { label: '', render: function (x) { return h('button', { class: 'sm', onclick: function () { go('bankrecon', { account: x.code, date: today }); } }, x.draftDate ? 'Tiếp tục nháp' : 'Đối chiếu'); } }], items, { empty: 'Chưa có tài khoản ngân hàng hoặc ngoại tệ.' }));
    }).catch(function () { });
    if (!pick) {
        slot.appendChild(h('div', { class: 'msg info' }, 'Chưa có tài khoản quỹ. Khai báo ở Danh mục → Tài khoản quỹ.'));
        return null;
    }
    clear(slot).appendChild(skeletonBlock());
    var d = await settle(page, slot, api('bank.reconView', { account: pick, stmtDate: dt.getIso() || today }));
    if (!d)
        return null;
    clear(slot);
    var cur = d.account.currency, rc = d.recon, locked = rc && rc.status === 'CONFIRMED', cleared = {}, resolved = {}, stmtOnly = rc ? rc.stmtOnly.slice() : [];
    if (rc) {
        rc.cleared.forEach(function (k) { cleared[k] = 1; });
        rc.resolved.forEach(function (k) { resolved[k] = 1; });
    }
    var bal = moneyInput(cur, rc ? rc.stmtBalanceMinor : null, { disabled: !!locked, 'data-rc-balance': '1' }), note = h('input', { maxlength: 500, value: rc ? rc.note : '', placeholder: 'Ghi chú', disabled: !!locked }), paste = h('textarea', { rows: 4, placeholder: 'Dán dòng sao kê: ngày [Tab hoặc ;] số tiền (+ thu, − chi) [Tab hoặc ;] nội dung. Ví dụ:\n12/10/2026;1.000.000;Khách ABC chuyển\n15/10/2026;-20.000;Phí chuyển khoản', disabled: !!locked }), res = h('div', { class: 'card', 'data-rc-result': '1' }), bookBox = h('div'), soBox = h('div');
    function calc() {
        var uT = 0, uC = 0, cN = 0, sN = 0;
        d.lines.forEach(function (l) { if (!cleared[l.ref]) {
            uT += l.thu;
            uC += l.chi;
        } });
        d.carried.forEach(function (c) { if (!resolved[c.id])
            cN += c.amountMinor; });
        stmtOnly.forEach(function (x) { sN += x.amountMinor; });
        var b = bal.getMinor(), has = b !== null && !Number.isNaN(b), adj = d.bookBalance - uT + uC + cN + sN, diff = has ? b - adj : null;
        return { uT: uT, uC: uC, cN: cN, sN: sN, adj: adj, diff: diff, has: has, b: b };
    }
    function paintRes() {
        var c = calc();
        clear(res).appendChild(h('div', { class: 'grid g4' }, h('div', { class: 'kpi', style: 'cursor:default' }, h('div', { class: 'l' }, 'Số dư sổ quỹ'), h('div', { class: 'v' }, fmtMoney(d.bookBalance, cur))), h('div', { class: 'kpi', style: 'cursor:default' }, h('div', { class: 'l' }, 'Thu chưa lên sao kê (−)'), h('div', { class: 'v' }, fmtMoney(c.uT, cur))),
            h('div', { class: 'kpi', style: 'cursor:default' }, h('div', { class: 'l' }, 'Chi chưa lên sao kê (+)'), h('div', { class: 'v' }, fmtMoney(c.uC, cur))), h('div', { class: 'kpi', style: 'cursor:default' }, h('div', { class: 'l' }, 'Chỉ có trên sao kê (±)'), h('div', { class: 'v' }, fmtMoney(c.cN + c.sN, cur)))));
        res.appendChild(h('div', { style: 'margin-top:8px' }, 'Số dư sổ quỹ sau điều chỉnh: ', h('b', null, fmtMoney(c.adj, cur) + ' ' + cur), c.has ? [' · Số dư sao kê: ', h('b', null, fmtMoney(c.b, cur)), ' · Chênh lệch: ', h('b', { 'data-rc-diff': c.diff, style: 'color:var(--' + (c.diff === 0 ? 'success' : 'danger') + ')' }, fmtMoney(c.diff, cur) + (c.diff === 0 ? ' ✓ cân' : ''))] : ' · Nhập số dư theo sao kê để so sánh.'));
    }
    function paintBook() {
        clear(bookBox);
        bookBox.appendChild(h('h4', null, 'Phát sinh trong sổ quỹ chưa đối chiếu (tick = đã lên sao kê)'));
        bookBox.appendChild(responsiveList([{ label: 'Đã khớp', render: function (l) { var c = h('input', { type: 'checkbox', 'data-rc-line': l.docNo, checked: !!cleared[l.ref], disabled: !!locked, 'aria-label': 'Đã lên sao kê' }); c.onchange = function () { if (c.checked)
                    cleared[l.ref] = 1;
                else
                    delete cleared[l.ref]; paintRes(); }; return c; } }, { label: 'Ngày', render: function (l) { return fmtDate(l.date); } }, { label: 'Số CT', key: 'docNo' }, { label: 'Diễn giải', render: function (l) { return h('span', null, ccKindBadge(l), ' ' + l.text); } },
            { label: 'Thu', align: 'r', render: function (l) { return l.thu ? fmtMoney(l.thu, cur) : ''; } }, { label: 'Chi', align: 'r', render: function (l) { return l.chi ? fmtMoney(l.chi, cur) : ''; } }], d.lines, { empty: 'Không có phát sinh nào chưa đối chiếu.' }));
        if (!locked && d.lines.length)
            bookBox.appendChild(h('div', { class: 'bar' }, h('button', { class: 'sm', onclick: function () { d.lines.forEach(function (l) { cleared[l.ref] = 1; }); paintBook(); paintRes(); } }, 'Tick tất cả'), h('button', { class: 'sm', onclick: function () { cleared = {}; paintBook(); paintRes(); } }, 'Bỏ tick tất cả')));
    }
    function paintSo() {
        clear(soBox);
        if (d.carried.length) {
            soBox.appendChild(h('h4', null, 'Khoản chỉ có trên sao kê từ kỳ trước (đánh dấu khi đã ghi sổ)'));
            soBox.appendChild(responsiveList([{ label: 'Đã ghi sổ', render: function (c) { var k = h('input', { type: 'checkbox', checked: !!resolved[c.id], disabled: !!locked, 'aria-label': 'Đã ghi sổ' }); k.onchange = function () { if (k.checked)
                        resolved[c.id] = 1;
                    else
                        delete resolved[c.id]; paintRes(); }; return k; } }, { label: 'Ngày', render: function (c) { return fmtDate(c.date); } }, { label: 'Nội dung', key: 'text' }, { label: 'Số tiền', align: 'r', render: function (c) { return fmtMoney(c.amountMinor, cur); } }], d.carried, {}));
        }
        soBox.appendChild(h('h4', null, 'Khoản chỉ có trên sao kê, chưa có trong sổ quỹ (phí, lãi, thu chưa ghi sổ…)'));
        soBox.appendChild(responsiveList([{ label: 'Ngày', render: function (x) { return fmtDate(x.date); } }, { label: 'Nội dung', key: 'text' }, { label: 'Số tiền (+ thu, − chi)', align: 'r', render: function (x) { return fmtMoney(x.amountMinor, cur); } },
            { label: '', render: function (x) { return locked ? '' : h('button', { class: 'sm danger', onclick: function () { stmtOnly.splice(stmtOnly.indexOf(x), 1); paintSo(); paintRes(); } }, 'Bỏ'); } }], stmtOnly, { empty: 'Chưa có.' }));
        if (!locked) {
            var sd = dateInput(dt.getIso() || today), sa = moneyInput(cur, null), st = h('input', { maxlength: 200, placeholder: 'Nội dung' });
            soBox.appendChild(h('div', { class: 'grid g4' }, field('Ngày', sd), field('Số tiền (− là chi)', sa), field('Nội dung', st), h('div', { class: 'field' }, h('label', null, ' '), h('button', { onclick: function () { var v = sa.getMinor(); if (!sd.getIso() || v === null || Number.isNaN(v) || v === 0) {
                    toast('Nhập ngày và số tiền khác 0.', 'warn');
                    return;
                } stmtOnly.push({ date: sd.getIso(), amountMinor: v, text: st.value }); paintSo(); paintRes(); } }, 'Thêm khoản'))));
        }
    }
    bal.addEventListener('input', paintRes);
    bal.addEventListener('change', paintRes);
    var matchBtn = h('button', { 'data-rc-match': '1', onclick: async function () {
            var cu = cur, ps = ccParseStmt(paste.value, cu);
            if (!ps.lines.length) {
                toast('Không đọc được dòng sao kê nào. Mỗi dòng: ngày; số tiền; nội dung.', 'warn');
                return;
            }
            try {
                var s = await api('bank.reconSuggest', { account: pick, stmtDate: dt.getIso() || today, lines: ps.lines });
                s.matches.forEach(function (m) { cleared[m.ref] = 1; });
                s.unmatched.forEach(function (i) { stmtOnly.push(ps.lines[i]); });
                paste.value = '';
                paintBook();
                paintSo();
                paintRes();
                toast('Đã khớp ' + s.matches.length + ' dòng; ' + s.unmatched.length + ' dòng chỉ có trên sao kê' + (ps.bad ? '; bỏ qua ' + ps.bad + ' dòng không đọc được' : ''), s.unmatched.length ? 'warn' : undefined);
            }
            catch (e) {
                showError(e);
            }
        } }, 'Ghép tự động');
    async function save(confirm) {
        var b = bal.getMinor();
        if (b === null || Number.isNaN(b)) {
            toast('Nhập số dư theo sao kê.', 'warn');
            return;
        }
        try {
            var r2 = await api('bank.reconSave', { account: pick, stmtDate: d.stmtDate, stmtBalanceMinor: b, cleared: Object.keys(cleared), resolved: Object.keys(resolved), stmtOnly: stmtOnly, note: note.value, confirm: !!confirm }, { write: true });
            toast(confirm ? 'Đã xác nhận đối chiếu' : 'Đã lưu nháp (chênh lệch ' + fmtMoney(r2.diffMinor, cur) + ')');
            route2();
        }
        catch (e) {
            showError(e);
        }
    }
    slot.appendChild(h('div', { class: 'card' }, h('div', { class: 'bar' }, h('h3', { class: 'grow' }, d.account.code + ' · sao kê ngày ' + fmtDate(d.stmtDate)), rc ? badge(locked ? 'Đã xác nhận' : 'Nháp', locked ? 'ok' : '') : null),
        h('div', { class: 'grid g4' }, field('Số dư theo sao kê ngân hàng*', bal), field('Ghi chú', note))));
    var fileIn = h('input', { type: 'file', accept: '.csv,.txt,.xlsx', 'data-rc-file': '1', onchange: async function () {
            var f = fileIn.files && fileIn.files[0];
            if (!f)
                return;
            try {
                var rd = await ccReadStatementFile(f, cur);
                if (rd.error) {
                    toast(rd.error, 'warn');
                    return;
                }
                paste.value = ccLinesToText(rd.lines, cur);
                toast('Đã đọc ' + rd.lines.length + ' dòng từ tệp' + (rd.bad ? '; bỏ qua ' + rd.bad + ' dòng không đọc được' : '') + '. Kiểm tra rồi bấm Ghép tự động.');
            }
            catch (e) {
                toast('Không đọc được tệp: ' + (e.message || e), 'warn');
            }
            fileIn.value = '';
        } });
    if (!locked)
        slot.appendChild(h('div', { class: 'card' }, h('h4', null, 'Dán sao kê hoặc chọn tệp (.csv, .xlsx) để ghép tự động'), paste, h('div', { class: 'bar' }, field('Hoặc chọn tệp sao kê', fileIn)), h('div', { class: 'bar' }, matchBtn, h('span', { class: 'hint' }, 'Khớp theo chiều thu/chi, đúng số tiền, lệch ngày không quá 7 ngày. Dòng không khớp được chuyển vào "chỉ có trên sao kê".'))));
    slot.appendChild(h('div', { class: 'card' }, bookBox, soBox));
    slot.appendChild(res);
    paintBook();
    paintSo();
    paintRes();
    slot.appendChild(h('div', { class: 'bar noprint' }, locked ? (can('payment.approve') ? h('button', { onclick: function () { promptReason('Mở lại đối chiếu ' + fmtDate(d.stmtDate), async function (reason) { await api('bank.reconReopen', { id: rc.id, ifVersion: rc.version, reason: reason }, { write: true }); toast('Đã mở lại'); route2(); }, 'Mở lại'); } }, 'Mở lại để sửa') : null)
        : [can('payment.write') ? h('button', { 'data-rc-save': '1', onclick: function () { save(false); } }, 'Lưu nháp') : null, can('payment.approve') ? h('button', { class: 'primary', 'data-rc-confirm': '1', onclick: function () { confirmBox('Xác nhận đối chiếu ngày ' + fmtDate(d.stmtDate) + '? Các khoản đã tick sẽ không hiện lại ở kỳ sau.', function () { return save(true); }, 'Xác nhận'); } }, 'Xác nhận (cần chênh lệch = 0)') : null], h('button', { onclick: function () { window.print(); } }, 'In')));
    if (d.history.length)
        slot.appendChild(h('div', { class: 'card' }, h('h4', null, 'Các lần đã xác nhận'), responsiveList([{ label: 'Ngày sao kê', render: function (x) { return h('a', { href: '#/bankrecon?account=' + encodeURIComponent(pick) + '&date=' + x.stmtDate }, fmtDate(x.stmtDate)); } }, { label: 'Số dư sao kê', align: 'r', render: function (x) { return fmtMoney(x.stmtBalanceMinor, cur); } }, { label: 'Người xác nhận', key: 'confirmedBy' }], d.history, {})));
    return null;
};
function ccAdjustDialog(x) {
    var kind = sel(Object.keys(CC_ADJ).map(function (k) { return { v: k, l: CC_ADJ[k] }; }), 'EXPENSE'), note = h('input', { maxlength: 500, placeholder: 'Ghi chú (người chịu trách nhiệm, số quyết định…)' });
    modal('Xử lý chênh lệch kiểm kê ' + x.countNo, h('div', null, h('p', null, 'Quỹ ' + x.accountCode + ' ' + (x.diffMinor < 0 ? 'thiếu ' : 'thừa ') + fmtMoney(Math.abs(x.diffMinor), x.currency) + ' ' + x.currency + ' ngày ' + fmtDate(x.countDate) + '.'), field('Cách xử lý', kind), field('Ghi chú', note),
        h('div', { class: 'hint' }, 'Ghi nhận sẽ thêm một dòng ' + (x.diffMinor < 0 ? 'chi' : 'thu') + ' vào sổ quỹ cuối ngày kiểm kê để số dư sổ bằng số kiểm đếm. ' + (x.currency === 'VND' ? '' : (x.diffMinor < 0 ? 'Quỹ ngoại tệ thiếu: xuất theo tỷ giá bình quân của quỹ (không phát sinh lãi/lỗ tỷ giá). ' : 'Quỹ ngoại tệ thừa: nhập theo tỷ giá bình quân của quỹ (không phát sinh lãi/lỗ tỷ giá); chỉ khi quỹ chưa có bình quân mới dùng tỷ giá ngày kiểm kê trong bảng tỷ giá. ')) + 'Hệ thống chưa hạch toán sang tài khoản kế toán: ghi sổ kế toán theo quyết định xử lý.')), [{ label: 'Hủy' }, { label: 'Ghi nhận xử lý', primary: true, onClick: async function () { await api('cashcount.adjust', { id: x.id, ifVersion: x.version, kind: kind.value, note: note.value }, { write: true }); toast('Đã xử lý chênh lệch; sổ quỹ khớp số kiểm đếm'); route2(); } }]);
}
function ccPrintMinutes(x, acc) {
    var cur = x.currency, den = Object.keys(x.denominations || {}).map(Number).sort(function (a, b) { return b - a; });
    modal('Biên bản kiểm kê quỹ ' + x.countNo, h('div', { class: 'report', 'data-cc-print': '1' }, h('h3', { style: 'text-align:center' }, 'BIÊN BẢN KIỂM KÊ QUỸ'), h('p', { style: 'text-align:center' }, 'Số ' + x.countNo + ' · ngày ' + fmtDate(x.countDate)),
        h('p', null, 'Quỹ: ', h('b', null, x.accountCode + (acc && acc.name ? ' – ' + acc.name : '') + ' (' + cur + ')')),
        den.length ? dataTable([{ label: 'Mệnh giá', align: 'r', render: function (v) { return fmtMoney(v, cur); } }, { label: 'Số tờ', align: 'r', render: function (v) { return String(x.denominations[v]); } }, { label: 'Thành tiền', align: 'r', render: function (v) { return fmtMoney(v * x.denominations[v], cur); } }], den, {}) : null,
        h('p', null, 'Số dư theo sổ quỹ: ', h('b', null, fmtMoney(x.bookMinor, cur) + ' ' + cur)), h('p', null, 'Số tiền kiểm đếm thực tế: ', h('b', null, fmtMoney(x.countedMinor, cur) + ' ' + cur)),
        h('p', null, 'Chênh lệch (thực tế − sổ): ', h('b', null, fmtMoney(x.diffMinor, cur) + ' ' + cur + (x.diffMinor === 0 ? ' (khớp)' : x.diffMinor < 0 ? ' (thiếu quỹ)' : ' (thừa quỹ)'))), x.reason ? h('p', null, 'Giải trình: ' + x.reason) : null, x.note ? h('p', null, 'Ghi chú: ' + x.note) : null,
        h('div', { class: 'grid g3', style: 'margin-top:28px;text-align:center' }, h('div', null, h('b', null, 'Thủ quỹ'), h('div', { class: 'hint' }, '(ký, ghi rõ họ tên)')), h('div', null, h('b', null, 'Người lập'), h('div', { class: 'hint' }, x.createdBy || '')), h('div', null, h('b', null, 'Kế toán trưởng'), h('div', { class: 'hint' }, x.confirmedBy || '(ký, ghi rõ họ tên)')))),
        [{ label: 'Đóng' }, { label: 'In', primary: true, onClick: function () { window.print(); return false; } }]);
}
VIEWS.cashcount = async function (r, main, page) {
    var q = r.q, today = S.asOf || todayIso(), root = h('div'), slot = h('div');
    var all = S.boot.catalogs.cashAccounts.filter(function (a) { return a.active; }), pick = q.account || (all.filter(function (a) { return a.type === 'CASH'; })[0] || all[0] || {}).code || '';
    var accSel = sel(all.map(function (a) { return { v: a.code, l: a.code + ' – ' + (a.name || '') + ' (' + a.currency + ')' }; }), pick), dt = dateInput(q.date || today);
    root.appendChild(h('div', { class: 'bar' }, h('div', { class: 'grow' }, h('h1', null, 'Kiểm kê quỹ'), h('div', { class: 'hint' }, 'Đếm thực tế theo mệnh giá, so với số dư sổ quỹ cuối ngày. Chênh lệch phải giải trình; người xác nhận khác người lập. Hệ thống chỉ lưu biên bản, chưa tự lập phiếu xử lý chênh lệch.'))));
    root.appendChild(h('div', { class: 'card filters-row' }, h('div', { class: 'grid g4' }, field('Tài khoản quỹ', accSel), field('Ngày kiểm kê', dt)), h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: function () { go('cashcount', { account: accSel.value, date: dt.getIso() || '' }); } }, 'Lập biên bản'))));
    var ovBox2 = h('div', { class: 'card', 'data-cc-overview': '1' }, h('h3', null, 'Tình hình kiểm kê các quỹ'));
    root.appendChild(ovBox2);
    root.appendChild(slot);
    page.show(root);
    api('bank.reconOverview', { asOf: today }).then(function (o) {
        if (!page.alive())
            return;
        ovBox2.appendChild(responsiveList([{ label: 'Quỹ', render: function (x) { return h('div', { style: 'white-space:nowrap' }, h('b', null, x.code), ' · ' + x.currency + (x.type === 'CASH' ? ' (tiền mặt)' : x.type === 'BANK' ? ' (ngân hàng)' : '')); } }, { label: 'Số dư sổ quỹ', align: 'r', render: function (x) { return fmtMoney(x.bookBalance, x.currency); } },
            { label: 'Kiểm kê gần nhất', render: function (x) { return h('span', null, x.lastCount ? fmtDate(x.lastCount) + ' ' : '', ccAgeBadge(x.daysSinceCount, 31)); } }, { label: 'Chênh lệch lần đó', align: 'r', render: function (x) { return x.lastCount ? h('span', { style: x.lastCountDiff ? 'color:var(--danger)' : '' }, fmtMoney(x.lastCountDiff, x.currency)) : ''; } },
            { label: '', render: function (x) { return h('button', { class: 'sm', onclick: function () { go('cashcount', { account: x.code, date: today }); } }, 'Kiểm kê'); } }], o.items.filter(function (x) { return x.type !== 'BANK'; }), { empty: 'Chưa có quỹ tiền mặt.' }));
    }).catch(function () { });
    if (!pick) {
        slot.appendChild(h('div', { class: 'msg info' }, 'Chưa có tài khoản quỹ. Khai báo ở Danh mục → Tài khoản quỹ.'));
        return null;
    }
    clear(slot).appendChild(skeletonBlock());
    var date = dt.getIso() || today, pv, list;
    try {
        pv = await api('cashcount.preview', { account: pick, countDate: date });
        list = await api('cashcount.list', { pageSize: 100 });
    }
    catch (e) {
        if (page.alive())
            clear(slot).appendChild(errorBlock(e, function () { renderView(page.main); }));
        return null;
    }
    if (!page.alive())
        return null;
    clear(slot);
    var cur = pv.account.currency, existing = list.items.filter(function (x) { return x.accountCode === pick && x.countDate === date; })[0] || null, locked = existing && existing.status === 'CONFIRMED', presets = CC_DENOM[cur] || [], inputs = {}, total = h('b', { 'data-cc-total': '1' }), diffEl = h('b', { 'data-cc-diff': '1' }), reason = h('textarea', { rows: 2, placeholder: 'Nguyên nhân chênh lệch / giải trình (bắt buộc nếu thiếu hoặc thừa)', disabled: !!locked }), note = h('input', { maxlength: 500, placeholder: 'Ghi chú', disabled: !!locked }), manual = moneyInput(cur, null, { disabled: !!locked, 'data-cc-manual': '1' });
    if (existing) {
        reason.value = existing.reason;
        note.value = existing.note;
    }
    function counted() { var sum = 0, any = false; presets.forEach(function (dv) { var n = Number(inputs[dv].value); if (n > 0) {
        sum += dv * n;
        any = true;
    } }); if (any)
        return sum; var m = manual.getMinor(); return m === null || Number.isNaN(m) ? null : m; }
    function paint() { var c = counted(); total.textContent = c === null ? '—' : fmtMoney(c, cur) + ' ' + cur; var diff = c === null ? null : c - pv.bookMinor; diffEl.textContent = diff === null ? '—' : fmtMoney(diff, cur) + (diff === 0 ? ' (khớp)' : diff < 0 ? ' (thiếu)' : ' (thừa)'); diffEl.style.color = diff === null ? '' : diff === 0 ? 'var(--success)' : 'var(--danger)'; }
    var rowsEl = presets.map(function (dv) { var i = h('input', { type: 'number', min: 0, step: 1, inputmode: 'numeric', 'data-cc-den': dv, style: 'max-width:110px', disabled: !!locked, value: existing && existing.denominations[dv] ? existing.denominations[dv] : '' }); inputs[dv] = i; i.addEventListener('input', paint); return h('tr', null, h('td', { class: 'money' }, fmtMoney(dv, cur)), h('td', null, i), h('td', { class: 'money' }, h('span', { 'data-cc-line': dv }))); });
    manual.addEventListener('input', paint);
    presets.forEach(function (dv) { inputs[dv].addEventListener('input', function () { var n = Number(inputs[dv].value); document.querySelector('[data-cc-line="' + dv + '"]').textContent = n > 0 ? fmtMoney(dv * n, cur) : ''; }); });
    slot.appendChild(h('div', { class: 'card' }, h('div', { class: 'bar' }, h('h3', { class: 'grow' }, 'Quỹ ' + pick + ' · cuối ngày ' + fmtDate(date)), existing ? badge(locked ? 'Đã xác nhận' : 'Nháp ' + existing.countNo, locked ? 'ok' : '') : null),
        h('div', { class: 'kpi', style: 'cursor:default;max-width:360px' }, h('div', { class: 'l' }, 'Số dư theo sổ quỹ'), h('div', { class: 'v', 'data-cc-book': pv.bookMinor }, fmtMoney(pv.bookMinor, cur) + ' ' + cur)),
        presets.length ? h('table', { class: 'tbl' }, h('thead', null, h('tr', null, h('th', null, 'Mệnh giá (' + cur + ')'), h('th', null, 'Số tờ'), h('th', null, 'Thành tiền'))), h('tbody', null, rowsEl)) : null,
        field(presets.length ? 'Hoặc nhập tổng số tiền kiểm đếm' : 'Tổng số tiền kiểm đếm', manual), h('div', { style: 'margin:8px 0' }, 'Kiểm đếm thực tế: ', total, ' · Chênh lệch: ', diffEl), field('Giải trình', reason), field('Ghi chú', note)));
    paint();
    presets.forEach(function (dv) { var n = Number(inputs[dv].value); if (n > 0)
        document.querySelector('[data-cc-line="' + dv + '"]').textContent = fmtMoney(dv * n, cur); });
    if (!locked && can('payment.write'))
        slot.appendChild(h('div', { class: 'bar' }, h('button', { class: 'primary', 'data-cc-save': '1', onclick: async function () { var c = counted(); if (c === null) {
                toast('Nhập số tờ theo mệnh giá hoặc tổng số tiền.', 'warn');
                return;
            } var den = {}; presets.forEach(function (dv) { var n = Number(inputs[dv].value); if (n > 0)
                den[dv] = n; }); try {
                var r2 = await api('cashcount.save', { account: pick, countDate: date, denominations: Object.keys(den).length ? den : undefined, countedMinor: Object.keys(den).length ? undefined : c, reason: reason.value, note: note.value }, { write: true });
                toast('Đã lưu biên bản ' + r2.countNo);
                route2();
            }
            catch (e) {
                if (e.fields)
                    toast(e.fields.map(function (f) { return f.message; }).join(' '), 'warn');
                else
                    showError(e);
            } } }, existing ? 'Lưu lại biên bản' : 'Lưu biên bản')));
    slot.appendChild(h('div', { class: 'card' }, h('h3', null, 'Các biên bản kiểm kê'), responsiveList([{ label: 'Số', key: 'countNo' }, { label: 'Ngày', render: function (x) { return fmtDate(x.countDate); } }, { label: 'Quỹ', key: 'accountCode' }, { label: 'Sổ quỹ', align: 'r', render: function (x) { return fmtMoney(x.bookMinor, x.currency); } }, { label: 'Kiểm đếm', align: 'r', render: function (x) { return fmtMoney(x.countedMinor, x.currency); } },
        { label: 'Chênh lệch', align: 'r', render: function (x) { return h('span', { style: x.diffMinor ? 'color:var(--danger)' : '' }, fmtMoney(x.diffMinor, x.currency)); } }, { label: 'Trạng thái', render: function (x) { return h('div', null, badge(x.status === 'CONFIRMED' ? 'Đã xác nhận' : 'Nháp', x.status === 'CONFIRMED' ? 'ok' : ''), x.adjustStatus === 'POSTED' ? h('div', { class: 'hint' }, 'Đã xử lý: ' + (CC_ADJ[x.adjustKind] || x.adjustKind)) : x.status === 'CONFIRMED' && x.diffMinor !== 0 ? h('div', { class: 'hint', style: 'color:var(--danger)' }, 'Chưa xử lý chênh lệch') : null); } },
        { label: '', render: function (x) { return h('div', { class: 'bar' }, x.status === 'DRAFT' && can('payment.approve') ? h('button', { class: 'sm primary', 'data-cc-confirm': x.countNo, onclick: function () { confirmBox('Xác nhận biên bản ' + x.countNo + '? Người lập không tự xác nhận được.', async function () { await api('cashcount.confirm', { id: x.id, ifVersion: x.version }, { write: true }); toast('Đã xác nhận'); route2(); }, 'Xác nhận'); } }, 'Xác nhận') : null,
            x.status === 'CONFIRMED' && x.diffMinor !== 0 && x.adjustStatus !== 'POSTED' && can('payment.approve') ? h('button', { class: 'sm primary', 'data-cc-adjust': x.countNo, onclick: function () { ccAdjustDialog(x); } }, 'Xử lý chênh lệch') : null,
            x.adjustStatus === 'POSTED' && can('payment.reverse') ? h('button', { class: 'sm', onclick: function () { promptReason('Đảo xử lý chênh lệch ' + x.countNo, async function (reason) { await api('cashcount.adjustReverse', { id: x.id, ifVersion: x.version, reason: reason }, { write: true }); toast('Đã đảo xử lý'); route2(); }, 'Đảo xử lý'); } }, 'Đảo xử lý') : null,
            x.status === 'DRAFT' ? h('button', { class: 'sm danger', onclick: function () { confirmBox('Xóa biên bản nháp ' + x.countNo + '?', async function () { await api('cashcount.delete', { id: x.id, ifVersion: x.version }, { write: true }); toast('Đã xóa'); route2(); }, 'Xóa', true); } }, 'Xóa') : null,
            h('button', { class: 'sm', onclick: function () { ccPrintMinutes(x, all.filter(function (a) { return a.code === x.accountCode; })[0]); } }, 'Biên bản')); } }], list.items, { empty: 'Chưa có biên bản kiểm kê nào.' })));
    return null;
};
