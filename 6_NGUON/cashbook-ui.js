/* Sổ quỹ: một sổ cho mỗi tài khoản quỹ (tiền mặt, ngân hàng VND, quỹ ngoại tệ). Hiện đầu kỳ, từng phát sinh có tồn sau dòng, cộng phát sinh, cuối kỳ; in và xuất Excel. */
var CB_KIND = { IN: 'Thu', OUT: 'Chi', XIN: 'Chuyển đến', XOUT: 'Chuyển đi', EBUY: 'Mua ngoại tệ', ESELL: 'Bán ngoại tệ' };
function cbDownloadBytes(name, bytes) {
    var url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })), a = h('a', { href: url, download: name });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 60000);
}
async function cbExportXlsx(d) {
    var b = d.book, acc = d.account, dec = (S.boot.catalogs.currencies.filter(function (c) { return c.code === acc.currency; })[0] || { decimals: 0 }).decimals, num = function (m, cur) { var k = Math.pow(10, cur === 'VND' ? 0 : dec); return Number(m) / k; };
    var cur = acc.currency, fmt = cur === 'VND' ? '#,##0' : '#,##0.00', head = { font: { b: 1, color: 'FFFFFFFF' }, fill: 'FF0F766E', border: 'FFCBD5E1', align: { h: 'center', v: 'center', wrap: 1 } }, cell = { border: 'FFCBD5E1' }, money = { border: 'FFCBD5E1', numFmt: fmt, align: { h: 'right' } }, moneyV = { border: 'FFCBD5E1', numFmt: '#,##0', align: { h: 'right' } }, bold = function (s) { return Object.assign({}, s, { font: { b: 1 } }); };
    var cols = ['Ngày', 'Số chứng từ', 'Diễn giải', 'Thu (' + cur + ')', 'Chi (' + cur + ')', 'Tồn (' + cur + ')'], widths = [12, 16, 48, 16, 16, 16];
    if (b.foreign) {
        cols = cols.concat(['Thu (VND)', 'Chi (VND)', 'Tồn (VND)', 'Tỷ giá bình quân']);
        widths = widths.concat([16, 16, 18, 16]);
    }
    var rows = [{ h: 26, cells: [{ v: 'SỔ QUỸ ' + acc.code + (acc.name && acc.name !== acc.code ? ' – ' + acc.name : '') + ' (' + cur + ')', s: { font: { b: 1, sz: 14 } } }] }, { cells: [{ v: 'Từ ' + fmtDate(d.from) + ' đến ' + fmtDate(d.to), s: { font: { i: 1 } } }] }, { cells: [] },
        { h: 30, cells: cols.map(function (t) { return { v: t, s: head }; }) }];
    var o = [{ v: '', s: cell }, { v: '', s: cell }, { v: 'Số dư đầu kỳ', s: bold(cell) }, { v: '', s: cell }, { v: '', s: cell }, { v: num(b.opening, cur), s: bold(money) }];
    if (b.foreign)
        o = o.concat([{ v: '', s: cell }, { v: '', s: cell }, { v: num(b.openingBase, 'VND'), s: bold(moneyV) }, { v: '', s: cell }]);
    rows.push({ cells: o });
    b.lines.forEach(function (l) {
        var c = [{ v: fmtDate(l.date), s: cell }, { v: l.docNo || '', s: cell }, { v: (CB_KIND[l.kind] || '') + ': ' + l.text, s: cell }, { v: l.thu ? num(l.thu, cur) : '', s: money }, { v: l.chi ? num(l.chi, cur) : '', s: money }, { v: num(l.bal, cur), s: money }];
        if (b.foreign)
            c = c.concat([{ v: l.thuB ? num(l.thuB, 'VND') : '', s: moneyV }, { v: l.chiB ? num(l.chiB, 'VND') : '', s: moneyV }, { v: num(l.balB, 'VND'), s: moneyV }, { v: l.avgRate || '', s: { border: 'FFCBD5E1', align: { h: 'right' } } }]);
        rows.push({ cells: c });
    });
    var t = [{ v: '', s: cell }, { v: '', s: cell }, { v: 'Cộng phát sinh', s: bold(cell) }, { v: num(b.thu, cur), s: bold(money) }, { v: num(b.chi, cur), s: bold(money) }, { v: '', s: cell }];
    if (b.foreign)
        t = t.concat([{ v: num(b.thuBase, 'VND'), s: bold(moneyV) }, { v: num(b.chiBase, 'VND'), s: bold(moneyV) }, { v: '', s: cell }, { v: '', s: cell }]);
    rows.push({ cells: t });
    var z = [{ v: '', s: cell }, { v: '', s: cell }, { v: 'Số dư cuối kỳ', s: bold(cell) }, { v: '', s: cell }, { v: '', s: cell }, { v: num(b.closing, cur), s: bold(money) }];
    if (b.foreign)
        z = z.concat([{ v: '', s: cell }, { v: '', s: cell }, { v: num(b.closingBase, 'VND'), s: bold(moneyV) }, { v: '', s: cell }]);
    rows.push({ cells: z });
    var bytes = await XLSXLite.write({ sheets: [{ name: ('So quy ' + acc.code).slice(0, 31), cols: widths.map(function (w) { return { w: w }; }), rows: rows, freeze: { row: 4 }, showGrid: false }] });
    cbDownloadBytes('So-quy-' + acc.code + '-' + d.from + '_' + d.to + '.xlsx', bytes);
}
VIEWS.cashbook = async function (r, main, page) {
    var q = r.q, today = S.asOf || todayIso(), root = h('div'), slot = h('div');
    var first = await (async function () { try {
        return await api('cash.book', { from: q.from || today.slice(0, 8) + '01', to: q.to || today });
    }
    catch (e) {
        if (page.alive())
            page.show(h('div', null, errorBlock(e, function () { renderView(page.main); })));
        return null;
    } })();
    if (!first || !page.alive())
        return null;
    var accs = first.accounts.filter(function (a) { return a.active; }), pick = q.account || (accs.filter(function (a) { return a.type === 'CASH' && a.currency === 'VND'; })[0] || accs[0] || {}).code || '';
    var accSel = sel(accs.map(function (a) { return { v: a.code, l: a.code + ' – ' + (a.name || '') + ' (' + a.currency + (a.type === 'CASH' ? ', tiền mặt' : a.type === 'BANK' ? ', ngân hàng' : '') + ')' }; }), pick), from = dateInput(q.from || today.slice(0, 8) + '01'), to = dateInput(q.to || today);
    function apply() { go('cashbook', { account: accSel.value, from: from.getIso() || '', to: to.getIso() || '' }); }
    root.appendChild(h('div', { class: 'bar' }, h('div', { class: 'grow' }, h('h1', null, 'Sổ quỹ'), h('div', { class: 'hint' }, 'Sổ chi tiết từng tài khoản quỹ: tiền mặt, ngân hàng VND và quỹ ngoại tệ (USD…). Chỉ phiếu thu/chi, chuyển quỹ, mua bán ngoại tệ đã ghi nhận.'))));
    root.appendChild(h('div', { class: 'card filters-row' }, h('div', { class: 'grid g4' }, field('Tài khoản quỹ', accSel), field('Từ ngày', from), field('Đến ngày', to)), h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: apply }, 'Xem sổ'))));
    var sm = first.summary.filter(function (x) { return x.active; });
    root.appendChild(h('div', { class: 'card', 'data-cb-summary': '1' }, h('h3', null, 'Tồn quỹ tại ' + fmtDate(first.to)), h('div', { class: 'grid g4' }, sm.map(function (x) {
        return h('div', { class: 'kpi', tabindex: 0, role: 'link', style: x.code === pick ? 'border-color:var(--brand)' : '', onclick: function () { go('cashbook', { account: x.code, from: from.getIso() || '', to: to.getIso() || '' }); } }, h('div', { class: 'l' }, x.code + (x.name && x.name !== x.code ? ' · ' + x.name : '')), h('div', { class: 'v' }, fmtMoney(x.balMinor, x.currency) + ' ' + x.currency), h('div', { class: 's' }, x.currency === 'VND' ? (x.type === 'BANK' ? 'Ngân hàng VND' : 'Tiền mặt VND') : 'Ghi sổ ' + fmtMoney(x.balBaseMinor, 'VND') + ' VND'));
    }))));
    root.appendChild(slot);
    page.show(root);
    if (!pick) {
        slot.appendChild(h('div', { class: 'msg info' }, 'Chưa có tài khoản quỹ nào. Khai báo ở Danh mục → Tài khoản quỹ.'));
        return null;
    }
    clear(slot).appendChild(skeletonBlock());
    var d = await settle(page, slot, api('cash.book', { account: pick, from: from.getIso() || first.from, to: to.getIso() || first.to }));
    if (!d)
        return null;
    clear(slot);
    var b = d.book, cur = d.account.currency, fg = b.foreign;
    (b.warnings || []).forEach(function (w) { slot.appendChild(h('div', { class: 'msg warn' }, w)); });
    var rows = [{ _t: 'OPEN' }].concat(b.lines, [{ _t: 'TOTAL' }, { _t: 'CLOSE' }]), B = function (t) { return h('b', null, t); };
    var cols = [{ label: 'Ngày', render: function (l) { return l.date ? fmtDate(l.date) : ''; } }, { label: 'Số CT', key: 'docNo' },
        { label: 'Diễn giải', render: function (l) { return l._t === 'OPEN' ? B('Số dư đầu kỳ') : l._t === 'TOTAL' ? B('Cộng phát sinh') : l._t === 'CLOSE' ? B('Số dư cuối kỳ') : h('div', null, badge(CB_KIND[l.kind] || l.kind, l.kind === 'IN' || l.kind === 'XIN' || l.kind === 'EBUY' ? 'ok' : 'warn'), ' ' + l.text, l.fallback ? h('div', { class: 'hint' }, 'Tạm ghi theo tỷ giá ngày (quỹ chưa đủ dữ liệu bình quân).') : null); } },
        { label: 'Thu', align: 'r', render: function (l) { return l._t === 'TOTAL' ? B(fmtMoney(b.thu, cur)) : l.thu ? fmtMoney(l.thu, cur) : ''; } }, { label: 'Chi', align: 'r', render: function (l) { return l._t === 'TOTAL' ? B(fmtMoney(b.chi, cur)) : l.chi ? fmtMoney(l.chi, cur) : ''; } },
        { label: 'Tồn (' + cur + ')', align: 'r', render: function (l) { return l._t === 'OPEN' ? B(fmtMoney(b.opening, cur)) : l._t === 'CLOSE' ? B(fmtMoney(b.closing, cur)) : l._t === 'TOTAL' ? '' : fmtMoney(l.bal, cur); } }];
    if (fg)
        cols = cols.concat([{ label: 'Thu (VND)', align: 'r', render: function (l) { return l._t === 'TOTAL' ? B(fmtMoney(b.thuBase, 'VND')) : l.thuB ? fmtMoney(l.thuB, 'VND') : ''; } }, { label: 'Chi (VND)', align: 'r', render: function (l) { return l._t === 'TOTAL' ? B(fmtMoney(b.chiBase, 'VND')) : l.chiB ? fmtMoney(l.chiB, 'VND') : ''; } },
            { label: 'Tồn (VND)', align: 'r', render: function (l) { return l._t === 'OPEN' ? B(fmtMoney(b.openingBase, 'VND')) : l._t === 'CLOSE' ? B(fmtMoney(b.closingBase, 'VND')) : l._t === 'TOTAL' ? '' : fmtMoney(l.balB, 'VND'); } }, { label: 'Bình quân', align: 'r', render: function (l) { return l._t ? '' : l.avgRate || ''; } }]);
    slot.appendChild(h('div', { class: 'card', 'data-cb-book': '1' }, h('div', { class: 'bar' }, h('h3', { class: 'grow' }, 'Sổ quỹ ' + d.account.code + (d.account.name && d.account.name !== d.account.code ? ' – ' + d.account.name : '') + ' (' + cur + ') · ' + fmtDate(d.from) + ' – ' + fmtDate(d.to)),
        h('button', { class: 'sm noprint', onclick: function () { window.print(); } }, 'In sổ'), h('button', { class: 'sm noprint', 'data-cb-xlsx': '1', onclick: async function () { try { await cbExportXlsx(d); } catch (e) { showError(e); } } }, 'Xuất Excel')),
        responsiveList(cols, rows, { empty: '' }), b.lines.length ? null : h('div', { class: 'hint' }, 'Không có phát sinh trong kỳ.')));
    return null;
};
