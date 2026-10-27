/* Nhập hóa đơn từ tệp XML hóa đơn điện tử (nhiều tệp một lần): tự nhận chiều, đối tác theo MST, gợi ý ghép PO/Cost, mỗi dòng chọn mã dịch vụ riêng (1 hóa đơn nhiều mã dịch vụ). */
var XML_IMPORT = { files: [] };
function xmlDigits(s) { return String(s || '').replace(/\D+/g, ''); }
function xmlNormMst(s) { var d = xmlDigits(s); return d.length > 10 ? d.slice(0, 10) : d; }
function xmlFindPartner(party, role) {
    var m = xmlNormMst(party.tax), nm = String(party.name || '').trim().toLowerCase(), list = S.boot.partners.filter(function (p) { return p.status === 'ACTIVE' && (role === 'AR' ? p.isCustomer : p.isSupplier); });
    var hit = m ? list.filter(function (p) { return xmlNormMst(p.taxCode) === m; }) : [];
    if (!hit.length && nm)
        hit = list.filter(function (p) { return String(p.legalName || '').trim().toLowerCase() === nm || String(p.shortName || '').trim().toLowerCase() === nm; });
    return hit.length === 1 ? hit[0] : null;
}
function xmlDetectDir(inv) {
    var mine = xmlNormMst((S.boot.config || {}).entityTaxCode);
    if (!mine)
        return '';
    if (xmlNormMst(inv.seller.tax) === mine)
        return 'AR';
    if (xmlNormMst(inv.buyer.tax) === mine)
        return 'AP';
    return '';
}
function xmlRowsOf(f) {
    var inv = f.inv, serial = (inv.form || '') + (inv.serial || '');
    return f.lines.filter(function (l) { return l.use; }).map(function (l, i) {
        return { partner: f.partner ? f.partner.shortName : '', invoiceNo: inv.number, serial: serial, invoiceDate: inv.date, docDate: '', due: f.due || '', expectedPay: '', period: '', group: f.group || '', currency: inv.currency || 'VND', order: l.order || '', poRef: '', serviceCode: l.serviceCode || '', feeType: l.feeType || '', description: (l.name || '').slice(0, 500), containerQty: '', declNo: '', declDate: '', netText: l.netText, vat: l.vat.text, isPassThrough: 0, lotNote: '', note: i === 0 ? ('HĐĐT XML' + (inv.mccqt ? ' · MCCQT ' + inv.mccqt : '')).slice(0, 500) : '' };
    });
}
async function xmlLoadFiles(fileList, onChange) {
    var added = 0;
    for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i], txt = await file.text(), r = EInvoiceXml.parse(txt), entry = { name: file.name, ok: r.ok, error: r.error, warnings: r.warnings || [], inv: r.invoice, dir: '', partner: null, lines: [], group: '', due: '', result: null };
        if (r.ok) {
            var inv = r.invoice;
            entry.dir = xmlDetectDir(inv);
            xmlResolve(entry);
            var dflt = (S.boot.catalogs.feeTypes.filter(function (x) { return x.code === 'OTHER'; })[0] || S.boot.catalogs.feeTypes[0] || {}).code || '';
            entry.lines = inv.lines.map(function (l) { return { no: l.no, name: l.name, netText: l.netText, net: l.net, vat: l.vat, use: !l.isDiscount && !l.isPromo || l.net > 0 && !l.isDiscount, discount: l.isDiscount, order: '', serviceCode: '', feeType: dflt, cands: [] }; });
        }
        XML_IMPORT.files.push(entry);
        added++;
    }
    for (var k = XML_IMPORT.files.length - added; k < XML_IMPORT.files.length; k++)
        await xmlSuggest(XML_IMPORT.files[k]);
    onChange();
}
function xmlResolve(f) {
    f.partner = null;
    f.partnerErr = '';
    if (!f.dir)
        return;
    var party = f.dir === 'AR' ? f.inv.buyer : f.inv.seller;
    f.partner = xmlFindPartner(party, f.dir);
    if (!f.partner)
        f.partnerErr = (f.dir === 'AR' ? 'Khách hàng' : 'Nhà cung cấp') + ' "' + party.name + '" (MST ' + (party.tax || '—') + ') chưa có trong danh sách đối tác (hoặc sai vai trò). Thêm ở menu Đối tác rồi tải lại tệp.';
}
async function xmlSuggest(f) {
    if (!f.ok || !f.partner || !f.dir)
        return;
    try {
        var res = await api('doc.bulkSuggest', { direction: f.dir, partnerId: f.partner.id, currency: f.inv.currency || 'VND', lines: f.lines.map(function (l) { return { netText: l.netText, vat: l.vat.text }; }) });
        res.items.forEach(function (it, i) {
            var l = f.lines[i];
            l.cands = it.candidates || [];
            var ex = l.cands.filter(function (c) { return c.exact; });
            if (ex.length >= 1 && !l.order) {
                var c = ex[0];
                l.order = c.orderNo;
                l.serviceCode = c.serviceCode || l.serviceCode;
                l.feeType = c.feeTypeCode || l.feeType;
                l.auto = true;
                if (!f.group)
                    f.group = c.group;
            }
        });
    }
    catch (e) { }
}
function renderXmlImport(root, out) {
    var box = h('div'), fileIn = h('input', { type: 'file', accept: '.xml,text/xml,application/xml', multiple: true, 'data-xml-file': '1' }), results = h('div');
    function redraw() { clear(box).appendChild(xmlCards()); }
    fileIn.onchange = async function () {
        if (!fileIn.files.length)
            return;
        try {
            await xmlLoadFiles(fileIn.files, redraw);
        }
        catch (e) {
            showError(e);
        }
        fileIn.value = '';
    };
    root.appendChild(h('div', { class: 'card' }, h('div', { class: 'hint' }, 'Chọn một hoặc nhiều tệp XML hóa đơn điện tử (Thông tư 78: HDon/DLHDon). Hệ thống tự nhận hóa đơn bán hay mua theo mã số thuế công ty (Danh mục → entity.taxCode), tìm đối tác theo MST, gợi ý ghép với khoản phát sinh còn mở của PO/Cost (cùng số tiền). Mỗi dòng hóa đơn chọn riêng MÃ DỊCH VỤ và số đơn/PO — một hóa đơn có thể có nhiều mã dịch vụ.'), h('div', { class: 'bar' }, fileIn, h('button', { class: 'sm', type: 'button', onclick: function () { XML_IMPORT.files = []; redraw(); clear(results); } }, 'Xóa danh sách'))));
    root.appendChild(box);
    root.appendChild(results);
    function sel2(opts, val, onch, attrs) { var s = sel(opts, val, attrs || {}); s.onchange = function () { onch(s.value); }; return s; }
    function xmlCards() {
        var wrap = h('div');
        if (!XML_IMPORT.files.length) {
            wrap.appendChild(h('div', { class: 'hint' }, 'Chưa có tệp nào.'));
            return wrap;
        }
        XML_IMPORT.files.forEach(function (f, fi) {
            var card = h('div', { class: 'card', 'data-xml-card': fi });
            if (!f.ok) {
                card.appendChild(h('div', { class: 'msg danger' }, f.name + ': ' + f.error));
                wrap.appendChild(card);
                return;
            }
            var inv = f.inv, tot = inv.totals;
            card.appendChild(h('div', { class: 'bar' }, h('b', { class: 'grow' }, f.name + ' — HĐ ' + inv.form + inv.serial + ' số ' + inv.number + ' ngày ' + fmtDate(inv.date)), h('button', { class: 'sm danger', type: 'button', onclick: function () { XML_IMPORT.files.splice(fi, 1); redraw(); } }, 'Bỏ')));
            card.appendChild(h('div', { class: 'hint' }, 'Bên bán: ' + inv.seller.name + ' (MST ' + (inv.seller.tax || '—') + ') → Bên mua: ' + inv.buyer.name + ' (MST ' + (inv.buyer.tax || '—') + ') · ' + inv.currency + ' · trước thuế ' + (tot.net === null ? '—' : fmtMoney(Math.round(tot.net * (inv.currency === 'VND' ? 1 : 100)), inv.currency)) + ' · tổng ' + (tot.gross === null ? '—' : fmtMoney(Math.round(tot.gross * (inv.currency === 'VND' ? 1 : 100)), inv.currency))));
            f.warnings.forEach(function (w) { card.appendChild(h('div', { class: 'msg warn' }, w)); });
            var dirSel = sel2([{ v: '', l: '— Chọn chiều —' }, { v: 'AR', l: 'Hóa đơn BÁN (phải thu)' }, { v: 'AP', l: 'Hóa đơn MUA (phải trả)' }], f.dir, function (v) { f.dir = v; xmlResolve(f); f.lines.forEach(function (l) { l.order = ''; l.cands = []; l.auto = false; }); xmlSuggest(f).then(redraw); redraw(); });
            var grp = sel2([{ v: '', l: '— Nhóm nghiệp vụ (trống = theo đơn) —' }].concat(groupOptions(false)), f.group, function (v) { f.group = v; });
            var due = dateInput(f.due, { 'aria-label': 'Hạn thanh toán' });
            due.addEventListener('input', function () { f.due = due.getIso() || ''; });
            card.appendChild(h('div', { class: 'grid g3' }, field('Chiều công nợ*', dirSel), field('Nhóm nghiệp vụ', grp), field('Hạn thanh toán (trống = theo điều khoản)', due)));
            if (f.partner)
                card.appendChild(h('div', { class: 'hint' }, '✔ Đối tác: ' + f.partner.shortName));
            else if (f.partnerErr)
                card.appendChild(h('div', { class: 'msg danger' }, f.partnerErr));
            else if (!f.dir)
                card.appendChild(h('div', { class: 'msg warn' }, 'Không xác định được chiều (MST công ty chưa khai ở Danh mục hoặc không khớp bên bán/mua): hãy chọn chiều.'));
            var svcOpts = [{ v: '', l: '— Mã DV —' }].concat((S.boot.catalogs.serviceCodes || []).map(function (c) { return { v: c.code, l: c.code }; })), feeOpts = S.boot.catalogs.feeTypes.map(function (x) { return { v: x.code, l: x.name || x.code }; });
            card.appendChild(responsiveList([
                { label: 'Dùng', render: function (l) { var c = h('input', { type: 'checkbox', checked: l.use, 'aria-label': 'Nhập dòng này' }); c.onchange = function () { l.use = c.checked; }; return c; } },
                { label: '#', key: 'no' },
                { label: 'Hàng hóa / dịch vụ', render: function (l) { return h('div', null, l.name, l.discount ? h('div', { class: 'hint' }, 'Dòng chiết khấu (âm) — không nhập được') : null); } },
                { label: 'Trước thuế', align: 'r', render: function (l) { return l.netText; } },
                { label: 'Thuế', render: function (l) { return l.vat.text || 'chưa XN'; } },
                { label: 'Loại phí', render: function (l) { return sel2(feeOpts, l.feeType, function (v) { l.feeType = v; }); } },
                { label: 'Mã dịch vụ', render: function (l) { return sel2(svcOpts, l.serviceCode, function (v) { l.serviceCode = v; }, { 'data-xml-svc': 1 }); } },
                { label: 'Gắn PO (gợi ý)', render: function (l) {
                        var opts = [{ v: '', l: '— không gắn PO —' }].concat(l.cands.map(function (c) { return { v: c.orderNo + '|' + c.id, l: c.orderNo + (c.poNo ? ' · PO ' + c.poNo : '') + ' · ' + (c.serviceCode || '—') + ' · ' + String(c.description).slice(0, 30) + (c.exact ? ' ✔ khớp số tiền' : ' (khớp trước thuế)') }; }));
                        var cur = l.order ? (l.cands.filter(function (c) { return c.orderNo === l.order; })[0]) : null;
                        var s = sel(opts, cur ? cur.orderNo + '|' + cur.id : '', { 'data-xml-order': 1 });
                        s.onchange = function () { var v = s.value; if (!v) {
                            l.order = '';
                            l.auto = false;
                            return;
                        } var c = l.cands.filter(function (x) { return x.orderNo + '|' + x.id === v; })[0]; l.order = c.orderNo; l.serviceCode = c.serviceCode || l.serviceCode; l.feeType = c.feeTypeCode || l.feeType; if (!f.group)
                            f.group = c.group; redraw(); };
                        return l.cands.length ? s : h('div', null, h('input', { value: l.order, placeholder: 'Số đơn/PO (tự nhập)', 'data-xml-order-text': 1, onchange: function (ev) { l.order = ev.target.value.trim(); } }));
                    } }
            ], f.lines, { empty: 'Không có dòng.' }));
            wrap.appendChild(card);
        });
        var chk = h('input', { type: 'checkbox', 'data-xml-submit': '1' }), lab = h('input', { placeholder: 'Nhãn đợt nhập (ví dụ: HĐĐT T10)' });
        wrap.appendChild(h('div', { class: 'bar' }, h('button', { class: 'primary', 'data-xml-preview': '1', type: 'button', onclick: function () { xmlPreview(results, chk, lab); } }, 'Xem trước'), can('doc.submit') ? h('label', null, [chk, ' Gửi duyệt ngay']) : null, lab));
        return wrap;
    }
    redraw();
}
async function xmlPreview(results, chk, lab) {
    clear(results).appendChild(skeleton(3));
    var byDir = { AR: [], AP: [] }, map = { AR: [], AP: [] }, problems = [];
    XML_IMPORT.files.forEach(function (f, fi) {
        if (!f.ok)
            return;
        if (!f.dir || !f.partner) {
            problems.push(f.name + ': chưa xác định chiều/đối tác.');
            return;
        }
        var rows = xmlRowsOf(f);
        if (!rows.length) {
            problems.push(f.name + ': không có dòng nào được chọn.');
            return;
        }
        rows.forEach(function (r) { byDir[f.dir].push(r); map[f.dir].push(fi); });
    });
    clear(results);
    problems.forEach(function (p) { results.appendChild(h('div', { class: 'msg danger' }, p)); });
    var ok = !problems.length, pv = {}, any = false;
    for (var d of ['AR', 'AP']) {
        if (!byDir[d].length)
            continue;
        any = true;
        try {
            pv[d] = await api('doc.bulkPreview', { direction: d, rows: byDir[d] });
        }
        catch (e) {
            results.appendChild(errorBlock(e, function () { xmlPreview(results, chk, lab); }));
            return;
        }
        var title = d === 'AR' ? 'Hóa đơn bán' : 'Hóa đơn mua', p = pv[d];
        if (p.errors)
            ok = false;
        results.appendChild(h('div', { class: 'msg ' + (p.errors ? 'danger' : 'ok'), 'data-xml-pv': d + ':' + (p.errors ? 'bad' : 'ok') }, title + ': ' + (p.errors ? p.errors + ' dòng lỗi (chưa ghi gì).' : 'hợp lệ — sẽ tạo ' + p.created.docs + ' hóa đơn nháp (' + p.created.lines + ' dòng phí)' + (p.created.linked ? ', gắn PO ' + p.created.linked + ' dòng (' + p.created.matchedAccruals + ' khớp khoản sẵn có, ' + p.created.newAccruals + ' tạo mới)' : '') + (p.duplicates ? ' · ⚠ ' + p.duplicates + ' hóa đơn nghi trùng' : '') + '.')));
        results.appendChild(responsiveList([{ label: 'Tệp', render: function (x) { return XML_IMPORT.files[x.fi].name; } }, { label: 'Kết quả', render: function (x) { return x.ok ? badge('Hợp lệ', 'ok') : badge('Lỗi', 'danger'); } }, { label: 'Nội dung', render: function (x) { return x.ok ? x.summary : x.issues.map(function (i) { return h('div', { class: 'errmsg' }, '✖ ' + i.message); }); } }], p.rows.map(function (r, i) { return Object.assign({ fi: map[d][i] }, r); })));
    }
    if (!any)
        return;
    if (!ok)
        return;
    var b = h('button', { class: 'primary', 'data-xml-commit': '1', type: 'button', onclick: async function () {
            b.disabled = true;
            try {
                var made = 0, submitted = false;
                for (var d2 of ['AR', 'AP']) {
                    if (!byDir[d2].length)
                        continue;
                    var res = await api('doc.bulkCommit', { direction: d2, rows: byDir[d2], submit: !!chk.checked, batchLabel: lab.value }, { write: true });
                    made += res.created.docs;
                    submitted = res.submitted;
                }
                toast('Đã tạo ' + made + ' hóa đơn' + (submitted ? ' và gửi duyệt' : ' nháp'));
                XML_IMPORT.files = [];
                go('docs/' + (byDir.AR.length && !byDir.AP.length ? 'AR' : 'AP'));
            }
            catch (e) {
                showError(e);
            }
            finally {
                b.disabled = false;
            }
        } }, 'Ghi thành hóa đơn nháp');
    results.appendChild(h('div', { class: 'bar' }, b));
}
// Đọc 1 tệp XML để điền sẵn form (lập hóa đơn từ khoản phát sinh / form chứng từ): trả {inv, partnerMatch, warnings}
async function xmlPickOne() {
    return new Promise(function (resolve) {
        var inp = h('input', { type: 'file', accept: '.xml,text/xml,application/xml', style: 'display:none' });
        inp.onchange = async function () {
            var f = inp.files[0];
            inp.remove();
            if (!f)
                return resolve(null);
            var r = EInvoiceXml.parse(await f.text());
            if (!r.ok) {
                toast(r.error, 'danger');
                return resolve(null);
            }
            resolve(r);
        };
        document.body.appendChild(inp);
        inp.click();
    });
}
