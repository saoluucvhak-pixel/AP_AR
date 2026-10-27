/* Màn "Thu hộ / Chi hộ": danh sách từng khoản hộ, ghép đối ứng chi hộ ↔ thu hộ, đối chiếu theo khách hàng / đơn hàng, tuổi khoản còn mở. */
var PT_SIDE = { CHI_HO: ['Chi hộ', 'warn'], THU_HO: ['Thu hộ', 'info'] };
var PT_STATE = { OPEN: ['Chưa ghép', 'danger'], PARTIAL: ['Ghép một phần', 'warn'], MATCHED: ['Đã khớp', 'ok'] };
var PT_AGING = ['0–30 ngày', '31–60 ngày', '61–90 ngày', 'Trên 90 ngày'];
function ptTabs(active, onPick) {
    var items = [['list', 'Khoản thu hộ / chi hộ'], ['CUSTOMER', 'Đối chiếu theo khách hàng'], ['ORDER', 'Đối chiếu theo đơn hàng']];
    return h('div', { class: 'tabs', role: 'tablist' }, items.map(function (t) { return h('button', { class: 'tab' + (t[0] === active ? ' on' : ''), role: 'tab', 'aria-selected': t[0] === active ? 'true' : 'false', 'data-pt-tab': t[0], onclick: function () { onPick(t[0]); } }, t[1]); }));
}
function ptSummary(summary) {
    var cs = Object.keys(summary || {});
    if (!cs.length)
        return h('div', { class: 'msg info' }, 'Chưa có khoản thu hộ / chi hộ nào. Đánh dấu "Chi hộ" khi thêm khoản doanh thu hoặc chi phí để theo dõi tại đây.');
    return h('div', null, cs.map(function (c) {
        var t = summary[c];
        function k(label, val, sub, tone) { return h('div', { class: 'kpi', style: 'cursor:default' }, h('div', { class: 'l' }, label), h('div', { class: 'v', style: tone ? 'color:var(--' + tone + ')' : '' }, fmtMoney(val, c)), h('div', { class: 's' }, sub || '')); }
        var ag = function (arr) { return arr.map(function (v, i) { return v ? PT_AGING[i] + ': ' + fmtMoney(v, c) : ''; }).filter(Boolean).join(' · ') || 'Không còn mở'; };
        return h('div', { class: 'card', 'data-pt-sum': c }, h('div', { class: 'bar' }, h('b', { class: 'grow' }, 'Tiền tệ ' + c), h('span', { class: 'hint' }, t.count + ' khoản')),
            h('div', { class: 'grid g4' }, k('Chi hộ (thu lại của khách)', t.chiHo, 'Đã bù trừ ' + fmtMoney(t.chiHoLinked, c)), k('Thu hộ (trả lại khách)', t.thuHo, 'Đã bù trừ ' + fmtMoney(t.thuHoLinked, c)),
                k('Chi hộ chưa thu lại', t.chiHoOpen, ag(t.chiAging), t.chiHoOpen > 0 ? 'warn' : ''), k('Thu hộ chưa trả lại', t.thuHoOpen, ag(t.thuAging), t.thuHoOpen > 0 ? 'warn' : '')),
            h('div', { class: 'hint', style: 'margin-top:6px' }, 'Sau bù trừ còn phải trả lại khách (thu hộ − chi hộ): ' + fmtMoney(t.openGap, c) + ' (âm = khách còn nợ mình) · Chênh lệch tổng: ' + fmtMoney(t.gap, c) + '. Khoản hộ không phải doanh thu/chi phí và không vào lãi gộp.'));
    }));
}
async function ptLinkDialog(x, reload) {
    var d;
    try {
        d = await api('passthrough.candidates', { accrualId: x.id });
    }
    catch (e) {
        showError(e);
        return;
    }
    var me = d.item, chi = me.side === 'CHI_HO', picked = null, amt = moneyInput(me.currency, Math.min(me.openMinor, me.openMinor)), note = h('input', { type: 'text', placeholder: 'Ghi chú (không bắt buộc)', maxlength: 300 }), info = h('div', { class: 'hint' });
    function pick(c) { picked = c; var mx = Math.min(me.openMinor, c.openMinor); amt.value = fmtMoney(mx, me.currency); info.textContent = 'Ghép tối đa ' + fmtMoney(mx, me.currency) + ' ' + me.currency + ' (' + c.basis + ').'; }
    var list = d.items.length ? responsiveList([
        { label: '', render: function (c) { var r = h('input', { type: 'radio', name: 'pt-pick', 'aria-label': 'Chọn khoản đối ứng', 'data-pt-pick': c.id }); r.onchange = function () { pick(c); }; return r; } },
        { label: 'Ngày', render: function (c) { return fmtDate(c.accrualDate); } }, { label: 'Đối tác', render: function (c) { return c.partnerName || c.customerName; } },
        { label: 'Đơn hàng', render: function (c) { return c.orderNo + (c.poNo ? ' · PO ' + c.poNo : ''); } }, { label: 'Nội dung', key: 'description' },
        { label: 'Còn mở', align: 'r', render: function (c) { return fmtMoney(c.openMinor, c.currency); } }, { label: 'Gợi ý', render: function (c) { return badge(c.basis, c.rank === 0 ? 'ok' : c.rank === 1 ? 'info' : 'warn'); } }
    ], d.items, { empty: '' }) : h('div', { class: 'msg warn' }, 'Chưa có khoản ' + (chi ? 'thu hộ' : 'chi hộ') + ' cùng tiền tệ (' + me.currency + ') còn số chưa ghép. Hãy thêm khoản đối ứng trước.');
    var body = h('div', null, h('div', { class: 'card' }, h('b', null, PT_SIDE[me.side][0] + ': ' + me.description), h('div', { class: 'hint' }, fmtDate(me.accrualDate) + ' · ' + me.partnerName + ' · ' + me.orderNo + ' · Còn mở ' + fmtMoney(me.openMinor, me.currency) + ' ' + me.currency)),
        h('h4', null, 'Chọn khoản ' + (chi ? 'thu hộ' : 'chi hộ') + ' để ghép'), list, d.items.length ? h('div', null, field('Số tiền ghép*', amt), field('Ghi chú', note), info) : null);
    if (!d.items.length) {
        modal('Bù trừ chi hộ ↔ thu hộ', body, [{ label: 'Đóng' }]);
        return;
    }
    var requestId = uuid();
    modal('Bù trừ chi hộ ↔ thu hộ', body, [{ label: 'Hủy' }, { label: 'Ghép', primary: true, onClick: async function () {
                if (!picked) {
                    toast('Chọn khoản đối ứng', 'warn');
                    return false;
                }
                var v = amt.getMinor();
                if (v === null || Number.isNaN(v) || v <= 0) {
                    toast('Nhập số tiền ghép hợp lệ', 'warn');
                    return false;
                }
                var payload = { costAccrualId: chi ? picked.id : me.id, revenueAccrualId: chi ? me.id : picked.id, amountMinor: v, note: note.value };
                try {
                    await api('passthrough.link', payload, { write: true, requestId: requestId });
                }
                catch (e) {
                    if (e.code === 'CONFIRM_REQUIRED') {
                        confirmBox(e.message, async function () { await api('passthrough.link', Object.assign({ confirmMismatch: true }, payload), { write: true }); toast('Đã ghép'); reload(); }, 'Vẫn ghép');
                        return true;
                    }
                    throw e;
                }
                toast('Đã ghép');
                reload();
            } }]);
}
async function ptLinksDialog(x, reload) {
    var d;
    try {
        d = await api('passthrough.links', { accrualId: x.id });
    }
    catch (e) {
        showError(e);
        return;
    }
    var body = d.items.length ? responsiveList([
        { label: 'Ngày ghép', render: function (l) { return fmtDate(l.linkDate); } }, { label: 'Chi hộ', key: 'costText' }, { label: 'Thu hộ', key: 'revenueText' },
        { label: 'Số tiền', align: 'r', render: function (l) { return fmtMoney(l.amountMinor, l.currency) + ' ' + l.currency; } }, { label: 'Ghi chú', key: 'note' },
        { label: '', render: function (l) { return can('order.write') ? h('button', { class: 'sm danger', onclick: function () { confirmBox('Gỡ bản ghép này? Số tiền trở lại trạng thái chưa ghép.', async function () { await api('passthrough.unlink', { id: l.id, ifVersion: l.version }, { write: true }); toast('Đã gỡ ghép'); reload(); }, 'Gỡ ghép', true); } }, 'Gỡ') : ''; } }
    ], d.items, {}) : h('div', { class: 'hint' }, 'Khoản này chưa được ghép.');
    modal('Các bản ghép của khoản', body, [{ label: 'Đóng' }]);
}
VIEWS.passthrough = async function (r, main, page) {
    var q = r.q, tab = q.tab === 'CUSTOMER' || q.tab === 'ORDER' ? q.tab : 'list', root = h('div'), slot = h('div'), today = S.asOf || todayIso();
    function nav(extra) { go('passthrough', Object.assign({}, q, extra)); }
    var side = sel([{ v: '', l: 'Chi hộ & thu hộ' }, { v: 'CHI_HO', l: 'Chỉ chi hộ' }, { v: 'THU_HO', l: 'Chỉ thu hộ' }], q.side || ''), st = sel([{ v: '', l: 'Mọi trạng thái' }, { v: 'OPEN', l: 'Chưa ghép' }, { v: 'PARTIAL', l: 'Ghép một phần' }, { v: 'MATCHED', l: 'Đã khớp' }], q.state || ''),
        cus = sel(partnerOptions(null, true), q.partnerId || ''), cur = sel(currencyOptions(true), q.currency || ''), from = dateInput(q.from || '', { 'aria-label': 'Từ ngày' }), to = dateInput(q.to || today, { 'aria-label': 'Đến ngày' }), qi = h('input', { type: 'search', placeholder: '🔍 Tìm nội dung, đối tác, PO…', value: q.q || '' }),
        onlyOpen = h('input', { type: 'checkbox', checked: q.onlyOpen !== '0' });
    function apply() { nav({ side: side.value, state: st.value, partnerId: cus.value, currency: cur.value, from: from.getIso() || '', to: to.getIso() || '', q: qi.value, onlyOpen: onlyOpen.checked ? '1' : '0', page: 1 }); }
    var bar = tab === 'list'
        ? h('div', { class: 'card filters-row' }, h('div', { class: 'grid g4' }, field('Loại', side), field('Trạng thái ghép', st), field('Khách hàng / đối tác', cus), field('Tiền tệ', cur), field('Từ ngày', from), field('Đến ngày', to), field('Tìm kiếm', qi)), h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: apply }, 'Lọc'), h('button', { onclick: function () { go('passthrough', { tab: 'list' }); } }, 'Xóa lọc')))
        : h('div', { class: 'card filters-row' }, h('div', { class: 'grid g4' }, field('Tiền tệ', cur), field('Từ ngày', from), field('Đến ngày', to), h('div', { class: 'field' }, h('label', null, onlyOpen, ' Chỉ nhóm còn số chưa đối ứng'))), h('div', { class: 'bar' }, h('button', { class: 'primary', onclick: apply }, 'Xem')));
    root.appendChild(h('div', { class: 'bar' }, h('div', { class: 'grow' }, h('h1', null, 'Thu hộ / Chi hộ'), h('div', { class: 'hint' }, 'Chi hộ: mình chi hộ khách, sẽ thu lại của khách. Thu hộ: mình thu hộ, phải trả lại. Bù trừ (ghép) từng khoản ngược chiều, xem phần còn mở và tuổi khoản.'))));
    root.appendChild(ptTabs(tab, function (t) { go('passthrough', { tab: t }); }));
    root.appendChild(bar);
    root.appendChild(slot);
    slot.appendChild(skeletonBlock());
    page.show(root);
    var filt = { currency: q.currency || '', from: q.from || '', to: q.to || today };
    var data = await settle(page, slot, tab === 'list' ? api('passthrough.list', { side: q.side || '', state: q.state || '', partnerId: q.partnerId || '', currency: q.currency || '', from: q.from || '', to: q.to || '', q: q.q || '', page: Number(q.page || 1), pageSize: 50, asOf: today })
        : api('passthrough.report', { groupBy: tab, currency: filt.currency, from: filt.from, to: filt.to, onlyOpen: q.onlyOpen !== '0', asOf: today }));
    if (!data)
        return null;
    clear(slot);
    slot.appendChild(ptSummary(data.summary));
    if (tab === 'list') {
        slot.appendChild(responsiveList([
            { label: 'Loại', render: function (x) { return badge(PT_SIDE[x.side][0], PT_SIDE[x.side][1]); } }, { label: 'Ngày', render: function (x) { return fmtDate(x.accrualDate); } },
            { label: 'Đối tác', render: function (x) { return h('div', null, x.partnerName, x.side === 'CHI_HO' && x.customerName ? h('div', { class: 'hint' }, 'Khách: ' + x.customerName) : null); } },
            { label: 'Đơn hàng', render: function (x) { return x.orderId ? h('a', { href: '#/order/' + x.orderId }, x.orderNo + (x.poNo ? ' · PO ' + x.poNo : '')) : x.orderNo; } },
            { label: 'Nội dung', key: 'description' }, { label: 'Số tiền', align: 'r', render: function (x) { return fmtMoney(x.grossMinor, x.currency) + ' ' + x.currency; } },
            { label: 'Đã ghép', align: 'r', render: function (x) { return fmtMoney(x.linkedMinor, x.currency); } }, { label: 'Còn mở', align: 'r', render: function (x) { return fmtMoney(x.openMinor, x.currency); } },
            { label: 'Tuổi', align: 'r', render: function (x) { return x.openMinor > 0 ? x.ageDays + ' ngày' : ''; } }, { label: 'Trạng thái', render: function (x) { return badge(PT_STATE[x.state][0], PT_STATE[x.state][1]); } },
            { label: '', render: function (x) { return h('div', { class: 'bar' }, can('order.write') && x.openMinor > 0 ? h('button', { class: 'sm primary', 'data-pt-link': x.id, onclick: function () { ptLinkDialog(x, route2); } }, 'Ghép') : null, x.linkedMinor > 0 ? h('button', { class: 'sm', onclick: function () { ptLinksDialog(x, route2); } }, 'Xem ghép') : null); } }
        ], data.items, { empty: 'Không có khoản nào khớp bộ lọc.' }));
        slot.appendChild(pager(data.total, data.page, data.pageSize, function (p) { nav({ page: p }); }));
    }
    else {
        slot.appendChild(responsiveList([
            { label: tab === 'ORDER' ? 'Đơn hàng' : 'Khách hàng', render: function (x) { return h('b', null, x.name); } }, { label: 'Tiền tệ', key: 'currency' },
            { label: 'Chi hộ', align: 'r', render: function (x) { return fmtMoney(x.chiHo, x.currency); } }, { label: 'Thu hộ', align: 'r', render: function (x) { return fmtMoney(x.thuHo, x.currency); } },
            { label: 'Chi hộ chưa thu lại', align: 'r', render: function (x) { return fmtMoney(x.chiHoOpen, x.currency); } }, { label: 'Thu hộ chưa đối ứng', align: 'r', render: function (x) { return fmtMoney(x.thuHoOpen, x.currency); } },
            { label: 'Chênh lệch còn mở', align: 'r', render: function (x) { return h('span', { style: x.openGap ? 'color:var(--danger)' : '' }, fmtMoney(x.openGap, x.currency)); } },
            { label: 'Khoản mở lâu nhất', render: function (x) { return x.oldestOpen ? fmtDate(x.oldestOpen) + ' (' + x.maxAge + ' ngày)' : ''; } }
        ], data.items, { empty: 'Không có nhóm nào còn số chưa đối ứng trong kỳ chọn.' }));
        slot.appendChild(h('div', { class: 'hint' }, 'Chi hộ gắn vào khách theo đơn hàng; chi hộ chung hoặc chia nhiều đơn hiện ở nhóm "Chưa xác định khách" / "Chia n đơn".'));
    }
    return null;
};
