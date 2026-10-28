/* Màn "Tổng hợp công nợ": đọc bảng tổng hợp dựng sẵn định kỳ (nhanh); nút "Tính lại ngay" tính trực tiếp (chậm hơn). Lọc/tổng do máy chủ; ô tìm chỉ lọc hiển thị. */
function snapshotNote(meta, onRefresh) {
    var ageMin = meta.builtAt && !isNaN(new Date(meta.builtAt).getTime()) ? Math.max(0, Math.round((Date.now() - new Date(meta.builtAt).getTime()) / 60000)) : null, old = meta.source === 'SNAPSHOT' && (meta.behind > 0 || (ageMin !== null && meta.maxAgeMin && ageMin > meta.maxAgeMin * 3));
    var box = h('div', { class: 'msg ' + (old || meta.source === 'LIVE' ? 'warn' : 'info'), 'data-snapshot': meta.source, 'data-snapshot-old': old ? '1' : '0' });
    var tm = function (iso) { var t = iso ? new Date(iso) : null; return t && !isNaN(t.getTime()) ? t.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Ho_Chi_Minh' }) + ' ' + fmtDate(String(iso).slice(0, 10)) : '—'; }, st = meta.status || {};
    box.appendChild(h('span', null, (meta.source === 'SNAPSHOT' ? 'Số liệu dựng sẵn lúc ' : 'Số liệu vừa tính trực tiếp lúc ') + tm(meta.builtAt) + ', tính đến ngày ' + fmtDate(meta.asOf) + '. Dựng định kỳ (khoảng 10 phút một lần), không phải thời gian thực tuyệt đối. '));
    if (old)
        box.appendChild(h('b', { class: 'bad', 'data-snapshot-old-flag': '1' }, 'ĐANG DÙNG DỮ LIỆU CŨ' + (meta.behind > 0 ? ': có ' + meta.behind + ' thay đổi mới chưa vào bảng tổng hợp' : ': bản dựng đã ' + ageMin + ' phút') + '. '));
    else if (meta.behind > 0)
        box.appendChild(h('b', null, 'Có ' + meta.behind + ' thay đổi mới chưa vào bảng tổng hợp. '));
    box.appendChild(h('span', { class: 'hint', 'data-snapshot-detail': '1' }, 'Phiên bản dữ liệu: bản dựng ' + (meta.dataVersion === undefined ? '—' : meta.dataVersion) + ' / hiện tại ' + (meta.currentDataVersion === undefined ? '—' : meta.currentDataVersion) + ' · dựng thành công gần nhất: ' + tm(st.lastOkAt || meta.builtAt) + (st.lastError ? ' · lỗi gần nhất: ' + st.lastError : '') + '. '));
    if (st.failures > 0)
        box.appendChild(h('b', { class: 'bad', 'data-build-failed': st.failures }, 'Lần dựng gần nhất lỗi (' + st.failures + ' lần liên tiếp)' + (st.lastError ? ': ' + st.lastError : '') + '. Đang hiển thị bản cũ hoặc tính trực tiếp. '));
    if (onRefresh)
        box.appendChild(h('button', { type: 'button', class: 'sm', 'data-summary-refresh': '1', onclick: onRefresh }, 'Làm mới (tính lại ngay)'));
    return box;
}
function sumCurLines(map, key, cls) {
    var cs = Object.keys(map || {}).filter(function (c) { return map[c][key] > 0 || map[c][key] < 0; });
    return cs.length ? cs.map(function (c) { return h('div', { class: 'money' + (cls ? ' ' + cls : '') }, fmtMoney(map[c][key], c) + ' ' + c); }) : '—';
}
VIEWS.summary = async function (r, main, page) {
    var curMode = null, tab = r.q.tab === 'orders' || r.q.tab === 'costs' || (r.q.tab === 'recon' && can('audit.read')) ? r.q.tab : 'partners', live = !!r.q.live, root = h('div'), slot = h('div'), search = '', cache = null;
    root.appendChild(h('h1', null, 'Tổng hợp công nợ'));
    var tabs = h('div', { class: 'tabs', role: 'tablist' }, [['partners', 'Khách hàng / NCC'], ['orders', 'PO chưa thanh toán'], ['costs', 'Chi phí chưa thanh toán']].concat(can('audit.read') ? [['recon', 'Đối soát']] : []).map(function (t) {
        return h('button', { type: 'button', role: 'tab', class: 'tab' + (tab === t[0] ? ' on' : ''), 'aria-selected': tab === t[0] ? 'true' : 'false', onclick: function () { go('summary', { tab: t[0] }); } }, t[1]);
    }));
    root.appendChild(tabs);
    var qi = h('input', { type: 'search', placeholder: '🔍 Lọc nhanh trong danh sách đang hiển thị…', 'aria-label': 'Lọc nhanh' });
    var noteSlot = h('div'), searchBar = h('div', { class: 'bar' }, qi);
    root.appendChild(noteSlot);
    root.appendChild(searchBar);
    root.appendChild(slot);
    slot.appendChild(skeletonBlock());
    page.show(root);
    if (tab === 'recon') {
        searchBar.style.display = 'none';
        var drawRecon = function (d) {
            clear(slot);
            var lvl = { OK: 'Khớp', WARN: 'Cần xem', FAIL: 'LỖI' }, head = d.status === 'NEVER' ? 'Chưa có kết quả đối soát (bộ kích hoạt chạy hằng đêm lúc 02:00).' : 'Kết quả lúc ' + new Date(d.runAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) + ' — ' + (lvl[d.status] || d.status);
            slot.appendChild(h('div', { class: 'msg ' + (d.status === 'FAIL' ? 'bad' : d.status === 'WARN' ? 'warn' : 'info'), 'data-recon': d.status }, [h('span', null, head + '. '), h('button', { type: 'button', class: 'sm', 'data-recon-run': '1', onclick: function () { runRecon(); } }, 'Chạy đối soát ngay')]));
            (d.checks || []).forEach(function (c) {
                slot.appendChild(h('div', { class: 'card', 'data-recon-check': c.code, 'data-status': c.status }, [h('b', null, (c.status === 'OK' ? '✔ ' : c.status === 'WARN' ? '⚠ ' : '✖ ') + c.title + (c.count ? ' — ' + c.count + ' mục' : '')), c.note ? h('div', { class: 'muted' }, c.note) : null].concat((c.samples || []).map(function (x) { return h('div', { class: 'muted' }, x); }))));
            });
        };
        var runRecon = async function () {
            clear(slot).appendChild(skeletonBlock());
            try {
                drawRecon(await api('summary.reconcile', { run: true }));
            }
            catch (e) {
                if (page.alive())
                    clear(slot).appendChild(errorBlock(e, runRecon));
            }
        };
        try {
            drawRecon(await api('summary.reconcile', {}));
        }
        catch (e) {
            if (page.alive())
                clear(slot).appendChild(errorBlock(e, function () { go('summary', { tab: 'recon' }); }));
        }
        return;
    }
    var action = { partners: 'summary.partners', orders: 'summary.orders', costs: 'summary.costs' }[tab];
    async function load(forceLive) {
        clear(slot).appendChild(skeletonBlock());
        var d;
        try {
            d = await api(action, forceLive ? { live: true } : {});
        }
        catch (e) {
            if (page.alive())
                clear(slot).appendChild(errorBlock(e, function () { load(forceLive); }));
            return;
        }
        if (!page.alive())
            return;
        cache = d;
        clear(noteSlot).appendChild(snapshotNote(d.meta, function () { load(true); }));
        draw();
    }
    function match(text) { var q = fold(qi.value); return !q || fold(text).indexOf(q) >= 0; }
    function fold(s) { return window.HAKCore.sf.fold(s); }
    function totalsCard(parts) { return h('div', { class: 'card' }, h('b', null, 'Tổng trong phạm vi của bạn (không phụ thuộc ô lọc nhanh): '), parts); }
    function draw() {
        clear(slot);
        var d = cache;
        if (tab === 'partners') {
            var rows = d.items.filter(function (x) { return match(x.name); });
            // R36: chế độ xem tiền tệ. BASE = quy đổi VND theo giá trị ghi sổ (tỷ giá lưu trên chứng từ), mỗi ô MỘT số; ALL = từng tiền tệ xếp chồng; hoặc một tiền tệ cụ thể.
            var allCurs = {}; d.items.forEach(function (x) { ['AR', 'AP'].forEach(function (k) { Object.keys(x[k]).forEach(function (c) { allCurs[c] = 1; }); Object.keys(x.adv[k]).forEach(function (c) { allCurs[c] = 1; }); }); });
            var curList = Object.keys(allCurs).sort(), mode = curMode || (d.bookReady && curList.length > 1 ? 'BASE' : 'ALL');
            if (mode === 'BASE' && !d.bookReady)
                mode = 'ALL';
            var baseCur = 'VND';
            var bar = h('div', { class: 'bar', 'data-cur-mode': mode }, h('b', null, 'Hiển thị: '), [['BASE', 'Quy đổi ' + baseCur + ' (giá trị ghi sổ)'], ['ALL', 'Từng tiền tệ']].concat(curList.map(function (c) { return [c, 'Chỉ ' + c]; })).map(function (m) {
                return h('button', { type: 'button', class: 'sm' + (mode === m[0] ? ' primary' : ''), 'data-cur-btn': m[0], 'aria-pressed': mode === m[0] ? 'true' : 'false', onclick: function () { curMode = m[0]; draw(); } }, m[1]);
            }));
            slot.appendChild(bar);
            if (!d.bookReady)
                slot.appendChild(h('div', { class: 'msg warn', 'data-book-notready': '1' }, 'Chưa có số quy đổi VND: bảng tổng hợp đang là bản dựng của phiên bản cũ. Bấm "Làm mới (tính lại ngay)" ở trên một lần để có số quy đổi.'));
            var miss = d.book ? d.book.AR.miss + d.book.AP.miss : 0;
            if (mode === 'BASE' && miss)
                slot.appendChild(h('div', { class: 'msg warn', 'data-book-miss': miss }, miss + ' dòng/phiếu chưa có tỷ giá ghi nhận (chứng từ hoặc bảng Tỷ giá) nên chưa được quy đổi VND; số nguyên tệ vẫn đủ ở chế độ "Từng tiền tệ".'));
            var one = function (map, key, cls) { if (mode === 'ALL')
                return sumCurLines(map, key, cls); var m = {}; if (map[mode])
                m[mode] = map[mode]; return sumCurLines(m, key, cls); };
            var baseNum = function (x, dir, key, cls) { var v = x.base[dir][key]; return v ? h('div', { class: 'money' + (cls ? ' ' + cls : '') }, fmtMoney(v, baseCur) + ' ' + baseCur) : '—'; };
            var col = function (x, dir, key, cls) { return mode === 'BASE' ? baseNum(x, dir, key, cls) : one(x[dir], key, cls); };
            var advCell = function (x) { if (mode === 'BASE') { var o = []; [['AR', 'Thu '], ['AP', 'Chi ']].forEach(function (k) { if (x.base[k[0]].adv)
                o.push(h('div', { class: 'money' }, k[1] + fmtMoney(x.base[k[0]].adv, baseCur) + ' ' + baseCur)); }); return o.length ? o : '—'; } var out = []; ['AR', 'AP'].forEach(function (k) { Object.keys(x.adv[k]).filter(function (c) { return mode === 'ALL' || c === mode; }).forEach(function (c) { out.push(h('div', { class: 'money' }, (k === 'AR' ? 'Thu ' : 'Chi ') + fmtMoney(x.adv[k][c], c) + ' ' + c)); }); }); return out.length ? out : '—'; };
            var netCell = function (x) { var out = []; [['AR', 'Phải thu '], ['AP', 'Phải trả ']].forEach(function (k) { if (mode === 'BASE') { var n = x.base[k[0]].net; if (n)
                out.push(h('div', { class: 'money' + (n < 0 ? ' neg' : '') }, k[1] + fmtMoney(n, baseCur) + ' ' + baseCur)); return; } Object.keys(x.net[k[0]] || {}).filter(function (c) { return mode === 'ALL' || c === mode; }).forEach(function (c) { var n = x.net[k[0]][c]; out.push(h('div', { class: 'money' + (n < 0 ? ' neg' : '') }, k[1] + fmtMoney(n, c) + ' ' + c)); }); }); return out.length ? out : '—'; };
            slot.appendChild(responsiveList([
                { label: 'Đối tác', render: function (x) { return h('div', null, h('b', null, x.name), ' ', x.isCustomer ? badge('Khách', 'ok') : null, ' ', x.isSupplier ? badge('NCC', 'info') : null); } },
                { label: 'Phải thu còn nợ', align: 'r', render: function (x) { return h('a', { href: '#/docs/AR?s.partnerId=' + encodeURIComponent(x.partnerId) + '&f.onlyOutstanding=1' }, col(x, 'AR', 'out')); } },
                { label: 'Quá hạn', align: 'r', render: function (x) { return col(x, 'AR', 'overdue', 'neg'); } },
                { label: 'Đến hạn 7 ngày', align: 'r', render: function (x) { return col(x, 'AR', 'due7'); } },
                { label: 'Chưa xác định hạn', align: 'r', render: function (x) { return col(x, 'AR', 'missing'); } },
                { label: 'Phải trả còn nợ', align: 'r', render: function (x) { return h('a', { href: '#/docs/AP?s.partnerId=' + encodeURIComponent(x.partnerId) + '&f.onlyOutstanding=1' }, col(x, 'AP', 'out')); } },
                { label: 'Phải trả quá hạn', align: 'r', render: function (x) { return col(x, 'AP', 'overdue', 'neg'); } },
                { label: 'Quá hạn tối đa', align: 'r', render: function (x) { var m = 0; Object.keys(x.AR).forEach(function (c) { if (mode === 'ALL' || mode === 'BASE' || c === mode)
                    m = Math.max(m, x.AR[c].maxDays); }); return m ? m + ' ngày' : '—'; } },
                { label: 'Còn nợ ròng (đã trừ tiền chưa phân bổ)', align: 'r', render: netCell },
                { label: 'Tiền chưa phân bổ', align: 'r', render: advCell }
            ], rows, { empty: 'Không có đối tác còn số dư.' }));
            if (mode === 'BASE' && d.book)
                slot.appendChild(totalsCard(h('div', { 'data-book-total': '1' }, [['AR', 'Phải thu'], ['AP', 'Phải trả']].map(function (k) { var t = d.book[k[0]]; return h('div', null, k[1] + ' quy đổi ' + baseCur + ': còn ' + fmtMoney(t.out, baseCur) + ' (quá hạn ' + fmtMoney(t.overdue, baseCur) + ', chưa xác định hạn ' + fmtMoney(t.missing, baseCur) + ') · tiền chưa phân bổ ' + fmtMoney(t.adv, baseCur) + ' · ròng ' + fmtMoney(t.net, baseCur)); }).concat([h('div', null, h('b', null, 'Công nợ ròng (phải thu − phải trả): ' + fmtMoney(d.book.net, baseCur) + ' ' + baseCur))]))));
            else
                slot.appendChild(totalsCard([['AR', 'Phải thu'], ['AP', 'Phải trả']].map(function (k) { var t = d.totals[k[0]], cs = Object.keys(t).filter(function (c) { return mode === 'ALL' || c === mode; }); return h('div', null, k[1] + ': ', cs.length ? cs.map(function (c) { return c + ' còn ' + fmtMoney(t[c].out, c) + ' (quá hạn ' + fmtMoney(t[c].overdue, c) + ', chưa xác định hạn ' + fmtMoney(t[c].missing, c) + ')'; }).join(' · ') : 'không có'); })));
        }
        else if (tab === 'orders') {
            var os = d.items.filter(function (x) { return match([x.no, x.po, x.customer, x.hs].join(' ')); });
            slot.appendChild(responsiveList([
                { label: 'Số đơn', render: function (x) { return h('a', { href: '#/order/' + x.id }, x.no); } }, { label: 'Số PO', render: function (x) { return x.po || '—'; } }, { label: 'Khách hàng', key: 'customer' }, { label: 'Số HSDV', render: function (x) { return x.hs || '—'; } },
                { label: 'Ngày', render: function (x) { return fmtDate(x.d); } },
                { label: 'Doanh thu (gồm thuế)', align: 'r', render: function (x) { return sumCurLines(x.cur, 'rev'); } },
                { label: 'Chưa lập HĐ', align: 'r', render: function (x) { return sumCurLines(x.cur, 'un'); } },
                { label: 'Đang lập HĐ', align: 'r', render: function (x) { return sumCurLines(x.cur, 'ing'); } },
                { label: 'Phải thu còn lại', align: 'r', render: function (x) { return sumCurLines(x.cur, 'ar', 'neg'); } },
                { label: 'Phải trả NCC còn lại', align: 'r', render: function (x) { return sumCurLines(x.cur, 'ap', 'neg'); } },
                { label: 'Chi phí', align: 'r', render: function (x) { return sumCurLines(x.cur, 'cost'); } },
                { label: 'Trạng thái', render: function (x) { return badge(ORDER_ST[x.st][0], ORDER_ST[x.st][1]); } }
            ], os, { empty: 'Không có PO nào còn khoản chưa thanh toán hoặc chưa lập hóa đơn.' }));
            slot.appendChild(totalsCard(Object.keys(d.totals).length ? Object.keys(d.totals).map(function (c) { var t = d.totals[c]; return h('div', null, c + ': doanh thu ' + fmtMoney(t.rev, c) + ' · chưa lập HĐ ' + fmtMoney(t.un, c) + ' · đang lập ' + fmtMoney(t.ing, c) + ' · phải thu còn ' + fmtMoney(t.ar, c) + (t.ap ? ' · phải trả còn ' + fmtMoney(t.ap, c) : '')); }) : h('span', { class: 'hint' }, 'không có')));
        }
        else {
            var cs2 = d.items.filter(function (x) { return match([x.supplier, x.on, x.ds, x.doc].join(' ')); });
            slot.appendChild(responsiveList([
                { label: 'Ngày', render: function (x) { return fmtDate(x.d); } }, { label: 'Nhà cung cấp', key: 'supplier' }, { label: 'Đơn / loại', render: function (x) { return x.o ? h('a', { href: '#/order/' + x.o }, x.on) : x.on; } }, { label: 'Diễn giải', key: 'ds' },
                { label: 'Giá trị', align: 'r', render: function (x) { return fmtMoney(x.gross, x.c) + ' ' + x.c; } },
                { label: 'Còn phải trả', align: 'r', render: function (x) { return h('b', null, fmtMoney(x.out, x.c) + ' ' + x.c); } },
                { label: 'Trạng thái', render: function (x) { var s = COST_ST[x.st]; return h('span', null, s ? badge(s[0], s[1]) : badge(x.st, ''), x.pt ? badge('Chi hộ', 'warn') : null); } },
                { label: 'Hóa đơn / hạn', render: function (x) { return x.doc ? x.doc + (x.due ? ' · hạn ' + fmtDate(x.due) : ' · chưa xác định hạn') : '—'; } }
            ], cs2, { empty: 'Không có chi phí nào chưa thanh toán.' }));
            slot.appendChild(totalsCard(Object.keys(d.totals).length ? Object.keys(d.totals).map(function (c) { var t = d.totals[c]; return h('div', null, c + ': còn phải trả ' + fmtMoney(t.out, c) + ' (chưa nhận hóa đơn/đang lập ' + fmtMoney(t.unbilled, c) + ' · hóa đơn đã ghi nhận còn nợ ' + fmtMoney(t.billed, c) + ')'); }) : h('span', { class: 'hint' }, 'không có')));
        }
    }
    qi.addEventListener('input', function () { if (cache)
        draw(); });
    await load(live);
    return null;
};
