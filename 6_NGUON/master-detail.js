/* Bảng cha–con: dòng con tải theo yêu cầu (API chi tiết có sẵn), ghi nhớ trong lần hiển thị; đối chiếu cha = con do máy chủ tính, giao diện chỉ hiển thị. */
var MD_SEQ = 0, MD_PARALLEL = 3;
function mdWrap(box) { return box.closest('.md-detail') || box.closest('.md-cardbox'); }
function reconcileLine(items) {
    var wrap = h('div', { class: 'md-rec' });
    items.forEach(function (x) {
        wrap.appendChild(h('span', { class: 'md-recitem' }, badge(x.ok ? 'Khớp' : 'Lệch', x.ok ? 'ok' : 'danger'), ' ', x.text));
    });
    return wrap;
}
function masterDetail(cols, rows, opt) {
    var states = {}, uid = 'md' + (++MD_SEQ);
    rows.forEach(function (r, i) { states[r.id] = { row: r, open: false, status: 'idle', data: null, boxes: [], tid: uid + '-' + i }; });
    function drawInto(st, box) {
        clear(box);
        if (st.status === 'loading') box.appendChild(h('div', { class: 'md-load hint' }, 'Đang tải dòng con…'));
        else if (st.status === 'err') box.appendChild(h('div', { class: 'msg danger' }, 'Không tải được dòng con: ' + (st.err && st.err.message ? st.err.message : 'lỗi'), ' ', h('button', { type: 'button', class: 'sm retry', onclick: function () { st.status = 'idle'; load(st); } }, 'Thử lại')));
        else if (st.status === 'ok') box.appendChild(opt.render(st.row, st.data));
    }
    function redraw(st) { st.boxes.forEach(function (b) { drawInto(st, b); }); }
    function load(st) {
        if (st.status === 'ok' || st.status === 'loading') return st.promise || Promise.resolve();
        st.status = 'loading'; redraw(st);
        st.promise = opt.load(st.row).then(function (d) { st.data = d; st.status = 'ok'; }, function (e) { st.err = e; st.status = 'err'; }).then(function () { st.promise = null; redraw(st); });
        return st.promise;
    }
    function setOpen(st, open) {
        st.open = open;
        st.toggles.forEach(function (t) { t.setAttribute('aria-expanded', open ? 'true' : 'false'); t.textContent = open ? '▾' : '▸'; });
        st.boxes.forEach(function (b) { mdWrap(b).hidden = !open; });
        if (open) load(st);
    }
    function mkToggle(st, label) {
        var b = h('button', { type: 'button', class: 'md-toggle', 'aria-expanded': 'false', 'aria-controls': st.tid + '-' + (st.toggles.length ? 'c' : 't'), 'aria-label': label, onclick: function (e) { e.stopPropagation(); setOpen(st, !st.open); } }, '▸');
        st.toggles.push(b);
        return b;
    }
    var colCount = cols.length + 1, al = colAligns(cols, rows.slice(0, 20).map(function (r) { return cols.map(function (c) { return c.render ? c.render(r) : r[c.key]; }); }));
    var tbody = h('tbody', null), head = h('tr', null, h('th', { class: 'md-th' }, ''), cols.map(function (c, i) { return h('th', { class: al[i] }, c.label); }));
    var cards = h('div', { class: 'card-list' });
    rows.forEach(function (r) {
        var st = states[r.id];
        st.toggles = [];
        var box = h('div', { class: 'md-box', id: st.tid + '-t' }), drow = h('tr', { class: 'md-detail', hidden: true }, h('td', { colspan: colCount }, box));
        st.boxes.push(box);
        tbody.appendChild(h('tr', { class: r._cls || '' }, h('td', { class: 'md-td' }, mkToggle(st, 'Mở dòng con')), cols.map(function (c, i) {
            var v = c.render ? c.render(r) : r[c.key];
            return h('td', { class: al[i], 'data-label': c.label }, v === null || v === undefined ? '' : v);
        })));
        tbody.appendChild(drow);
        var cbox = h('div', { class: 'md-box', id: st.tid + '-c' }), cwrap = h('div', { class: 'md-cardbox', hidden: true }, cbox);
        st.boxes.push(cbox);
        cards.appendChild(h('div', { class: 'card-item' }, cols.map(function (c) {
            var v = c.render ? c.render(r) : r[c.key];
            if (v === null || v === undefined || v === '') return null;
            return h('div', { style: 'display:flex;justify-content:space-between;gap:12px;padding:2px 0' }, h('span', { class: 'hint' }, c.label), h('span', { class: c.align === 'r' ? 'money' : '' }, v));
        }), h('div', { class: 'bar' }, mkToggle(st, 'Mở dòng con (thẻ)'), h('span', { class: 'hint' }, 'Dòng con')), cwrap));
    });
    var table = h('div', { class: 'tablewrap table-only' }, h('table', { class: 'md-table' }, h('thead', null, head), tbody));
    if (!rows.length) { table = h('div', { class: 'hint' }, opt.empty || 'Chưa có dữ liệu.'); cards = h('div'); }
    function all(open) {
        var list = rows.map(function (r) { return states[r.id]; });
        list.forEach(function (st) { st.open = open; st.toggles.forEach(function (t) { t.setAttribute('aria-expanded', open ? 'true' : 'false'); t.textContent = open ? '▾' : '▸'; }); st.boxes.forEach(function (b) { mdWrap(b).hidden = !open; }); });
        if (!open) return;
        var queue = list.filter(function (st) { return st.status !== 'ok'; });
        function worker() { var st = queue.shift(); if (!st) return Promise.resolve(); return load(st).then(worker); }
        for (var i = 0; i < MD_PARALLEL; i++) worker();
    }
    var tools = h('div', { class: 'bar md-tools' }, h('button', { type: 'button', class: 'sm', onclick: function () { all(true); } }, 'Mở tất cả dòng con'), h('button', { type: 'button', class: 'sm', onclick: function () { all(false); } }, 'Thu gọn tất cả'));
    var out = h('div', { class: 'md' }, rows.length ? tools : null, table, cards);
    out._states = states;
    return out;
}
function mdLinesTable(rows, cols, empty) { return rows.length ? dataTable(cols, rows, { empty: empty }) : h('div', { class: 'hint' }, empty); }
/* Dòng con của chứng từ: dòng phí + phân bổ thanh toán; đối chiếu do máy chủ trả về (reconcile). */
var MD_DOC = {
    load: function (x) { return api('doc.get', { id: x.id, asOf: S.asOf }); },
    render: function (x, d) {
        var cur = x.currency, rc = d.reconcile || {}, root = h('div', { class: 'md-body' });
        root.appendChild(h('div', { class: 'md-title' }, 'Dòng chi tiết của ' + (x.docNo || '(nháp)'), ' ', reconcileLine([{ ok: rc.childOk, text: 'Tổng dòng con ' + fmtMoney(rc.childSumMinor, cur) + ' / tổng chứng từ ' + fmtMoney(rc.parentMinor, cur) + (rc.childOk ? '' : ' (lệch ' + fmtMoney(rc.childDiffMinor, cur) + ')') + (rc.scoped ? ' · trong phạm vi của bạn' : '') }])));
        root.appendChild(mdLinesTable(d.lines, [{ label: 'STT', key: 'lineNo' }, { label: 'Loại phí', key: 'feeTypeCode' }, { label: 'Diễn giải', key: 'description' }, { label: 'HSDV', render: function (l) { return l.hsdvNo || '—'; } },
            { label: 'Trước thuế', align: 'r', render: function (l) { return fmtMoney(l.netMinor, cur); } }, { label: 'Thuế', align: 'r', render: function (l) { return fmtMoney(l.vatMinor, cur); } },
            { label: 'Thành tiền', align: 'r', render: function (l) { return fmtMoney(l.grossMinor, cur); } }, { label: 'Đã TT', align: 'r', render: function (l) { return fmtMoney(l.allocatedMinor, cur); } }], 'Chứng từ chưa có dòng chi tiết.'));
        root.appendChild(h('div', { class: 'md-title' }, 'Phân bổ thanh toán (' + d.allocations.length + ')', ' ', reconcileLine([{ ok: rc.allocOk, text: 'Tổng phân bổ ' + fmtMoney(rc.allocSumMinor, cur) + ' / sổ ' + fmtMoney(rc.ledgerAllocMinor, cur) }])));
        if (d.allocations.length) root.appendChild(dataTable([{ label: 'Phiếu', render: function (a) { return h('a', { href: '#/payment/' + a.paymentId }, a.payNo || '—'); } }, { label: 'Ngày', render: function (a) { return fmtDate(a.effectiveDate); } },
            { label: 'Số tiền', align: 'r', render: function (a) { return fmtMoney(a.amountMinor, cur); } }], d.allocations, {}));
        return root;
    }
};
/* Dòng con của đơn hàng: khoản phát sinh doanh thu / chi phí, kể cả phần chia từ chi phí chung. */
var MD_ORDER = {
    load: function (x) { return api('order.get', { id: x.id, asOf: S.asOf }); },
    render: function (x, d) {
        var rc = d.reconcile || {}, root = h('div', { class: 'md-body' }), items = [];
        Object.keys(rc.byCurrency || {}).forEach(function (c) { var t = rc.byCurrency[c]; items.push({ ok: t.ok, text: c + ': tổng khoản ' + fmtMoney(t.childSumMinor, c) + ' / theo trạng thái hóa đơn ' + fmtMoney(t.stateSumMinor, c) }); });
        if (rc.splitMismatches && rc.splitMismatches.length) items.push({ ok: false, text: rc.splitMismatches.length + ' khoản chi phí chia nhiều đơn có phần chia không khớp khoản gốc' });
        if (!items.length) items.push({ ok: true, text: 'Chưa có khoản phát sinh' });
        root.appendChild(h('div', { class: 'md-title' }, 'Khoản phát sinh của ' + x.orderNo, ' ', reconcileLine(items)));
        root.appendChild(mdLinesTable(d.accruals, [{ label: 'Loại', render: function (a) { return badge(a.kind === 'REVENUE' ? 'Doanh thu' : 'Chi phí', a.kind === 'REVENUE' ? 'ok' : 'info'); } }, { label: 'Mã DV', render: function (a) { return a.serviceCode || (a.sharedFrom ? 'phần chia' : '—'); } },
            { label: 'Diễn giải', key: 'description' }, { label: 'Thành tiền', align: 'r', render: function (a) { return fmtMoney(a.grossMinor, a.currency) + ' ' + a.currency; } },
            { label: 'Trạng thái', render: function (a) { var s = COST_ST[a.status]; return s ? badge(s[0], s[1]) : badge(a.status, ''); } }, { label: 'Hóa đơn', render: function (a) { return a.docId ? h('a', { href: '#/doc/' + a.docId }, a.docNo || a.invoiceNo || 'Xem') : '—'; } }], 'Đơn chưa có khoản phát sinh.'));
        return root;
    }
};
/* Dòng con của phiếu thu/chi: các phân bổ vào chứng từ. */
var MD_PAY = {
    load: function (x) { return api('payment.get', { id: x.id }); },
    render: function (x, d) {
        var cur = x.currency, rc = d.reconcile || {}, root = h('div', { class: 'md-body' });
        root.appendChild(h('div', { class: 'md-title' }, 'Phân bổ của ' + (x.payNo || '(nháp)'), ' ', reconcileLine([{ ok: rc.allocOk, text: 'Tổng phân bổ ' + fmtMoney(rc.allocSumMinor, cur) + ' / số tiền phiếu ' + fmtMoney(rc.parentMinor, cur) + (rc.overAllocated ? ' (phân bổ vượt số tiền phiếu)' : '') }])));
        root.appendChild(mdLinesTable(d.allocations, [{ label: 'Chứng từ', render: function (a) { return h('a', { href: '#/doc/' + a.docId }, a.docNo || '—'); } }, { label: 'Số HĐ', render: function (a) { return a.invoiceNo || '—'; } }, { label: 'Dòng phí', key: 'lineDesc' },
            { label: 'Ngày', render: function (a) { return fmtDate(a.effectiveDate); } }, { label: 'Số tiền', align: 'r', render: function (a) { return fmtMoney(a.amountMinor, cur); } }], 'Phiếu chưa phân bổ vào chứng từ nào.'));
        return root;
    }
};
