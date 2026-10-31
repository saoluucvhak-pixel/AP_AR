/* Đọc tệp XML hóa đơn điện tử (Thông tư 78/2021: HDon/DLHDon). Thuần JS, không phụ thuộc DOM — chạy được ở trình duyệt và Node để kiểm thử. */
var EInvoiceXml = (function () {
    function unesc(s) { return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(+d); }).replace(/&#x([0-9a-f]+);/gi, function (m, d) { return String.fromCharCode(parseInt(d, 16)); }).replace(/&amp;/g, '&'); }
    // Phân tích XML tối giản thành cây {n: tên (bỏ tiền tố namespace), a: thuộc tính, c: con, t: chữ}
    function parseXml(src) {
        var s = String(src).replace(/^﻿/, '').replace(/<\?[\s\S]*?\?>/g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<!DOCTYPE[^>]*>/gi, '');
        var re = /<!\[CDATA\[([\s\S]*?)\]\]>|<(\/?)([A-Za-z_][\w:.\-]*)((?:\s+[\w:.\-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)/g, m, root = { n: '#root', a: {}, c: [], t: '' }, stack = [root];
        while ((m = re.exec(s)) !== null) {
            var cur = stack[stack.length - 1];
            if (m[1] !== undefined)
                cur.t += m[1];
            else if (m[3] !== undefined) {
                var name = m[3].replace(/^.*:/, '');
                if (m[2]) {
                    if (stack.length < 2 || stack[stack.length - 1].n !== name)
                        throw new Error('XML sai cấu trúc (thẻ đóng </' + name + '> không khớp).');
                    stack.pop();
                }
                else {
                    var node = { n: name, a: {}, c: [], t: '' };
                    (m[4] || '').replace(/([\w:.\-]+)\s*=\s*("([^"]*)"|'([^']*)')/g, function (x, k, v, d, sq) { node.a[k.replace(/^.*:/, '')] = unesc(d !== undefined ? d : sq); return x; });
                    cur.c.push(node);
                    if (!m[5])
                        stack.push(node);
                }
            }
            else if (m[6] !== undefined && m[6].trim() !== '')
                cur.t += unesc(m[6]);
        }
        if (stack.length !== 1)
            throw new Error('XML chưa đóng hết thẻ.');
        return root;
    }
    function kids(n, name) { return n ? n.c.filter(function (x) { return x.n === name; }) : []; }
    function kid(n, name) { return kids(n, name)[0] || null; }
    function txt(n, name) { var k = n && (name ? kid(n, name) : n); return k ? String(k.t).trim() : ''; }
    function path(n, p) { var cur = n; p.split('/').forEach(function (s) { cur = cur ? kid(cur, s) : null; }); return cur; }
    function num(s) { s = String(s === undefined || s === null ? '' : s).trim(); if (s === '')
        return null; var n = Number(s.replace(/,/g, '')); return isFinite(n) ? n : null; }
    // Số tiền thập phân → đơn vị nhỏ nhất (số nguyên), làm tròn nửa lên TRÊN CHUỖI thập phân (không nhân số thực: 1,005 → 101 chứ không phải 100).
    function toMinor(v, decimals) {
        if (v === null || v === undefined || typeof v !== 'number' || !isFinite(v))
            return null;
        var d = Number.isInteger(decimals) && decimals >= 0 && decimals <= 6 ? decimals : 2, s = Math.abs(v).toString();
        if (/e/i.test(s))
            s = Math.abs(v).toFixed(10);
        var p = s.split('.'), fp = p[1] || '', n = Number(p[0] + fp.slice(0, d).padEnd(d, '0')) + (fp.charAt(d) >= '5' ? 1 : 0);
        return Number.isSafeInteger(n) ? (v < 0 ? -n : n) : null;
    }
    // Chuỗi số tiền ở dạng ứng dụng đọc được (số lẻ theo danh mục tiền tệ nếu truyền decimals; mặc định VND 0, tiền khác 2).
    function moneyText(v, cur, decimals) {
        if (v === null)
            return '';
        var d = Number.isInteger(decimals) ? decimals : (cur && cur !== 'VND' ? 2 : 0), n = toMinor(v, d);
        if (n === null)
            return '';
        var digits = String(Math.abs(n)).padStart(d + 1, '0');
        return (n < 0 ? '-' : '') + (d ? digits.slice(0, -d) + '.' + digits.slice(-d) : digits);
    }
    function vatOf(ts) {
        var t = String(ts || '').trim().toUpperCase().replace(/\s+/g, '');
        if (!t)
            return { mode: 'UNCONFIRMED', text: '', pct: null };
        if (t === 'KCT' || t === 'KKKNT' || t === 'KHONGCHIUTHUE')
            return { mode: 'NONE', text: 'KCT', pct: null };
        var m = /^(\d+(?:[.,]\d+)?)%?$/.exec(t);
        if (m)
            return { mode: 'EXCLUSIVE', text: String(Number(m[1].replace(',', '.'))), pct: Number(m[1].replace(',', '.')) };
        return { mode: 'UNCONFIRMED', text: '', pct: null };
    }
    function parse(src) {
        var root;
        try {
            root = parseXml(src);
        }
        catch (e) {
            return { ok: false, error: 'Tệp không phải XML hợp lệ: ' + e.message };
        }
        var hd = kid(root, 'HDon'), dl = hd ? kid(hd, 'DLHDon') : kid(root, 'DLHDon');
        if (!dl)
            return { ok: false, error: 'Không nhận ra định dạng hóa đơn điện tử (cần cấu trúc HDon/DLHDon theo Thông tư 78). Các định dạng cũ chưa được hỗ trợ.' };
        var tc = kid(dl, 'TTChung'), nd = kid(dl, 'NDHDon'), warnings = [];
        if (!tc || !nd)
            return { ok: false, error: 'Thiếu TTChung hoặc NDHDon trong hóa đơn.' };
        var cur = txt(tc, 'DVTTe') || 'VND', date = txt(tc, 'NLap');
        if (!/^\d{4}-\d{2}-\d{2}/.test(date))
            warnings.push('Ngày lập không đúng dạng yyyy-MM-dd: "' + date + '".');
        var party = function (n) { return n ? { name: txt(n, 'Ten'), tax: txt(n, 'MST').replace(/\s+/g, ''), address: txt(n, 'DChi') } : { name: '', tax: '', address: '' }; };
        var lines = [], hh = path(nd, 'DSHHDVu');
        kids(hh, 'HHDVu').forEach(function (x, i) {
            var tchat = Number(txt(x, 'TChat') || 1);
            if (tchat === 4)
                return;
            var net = num(txt(x, 'ThTien')), v = vatOf(txt(x, 'TSuat')), disc = tchat === 3;
            if (net !== null && disc && net > 0)
                net = -net;
            lines.push({ no: txt(x, 'STT') || String(i + 1), name: txt(x, 'THHDVu'), code: txt(x, 'MHHDVu'), unit: txt(x, 'DVTinh'), qty: num(txt(x, 'SLuong')), price: num(txt(x, 'DGia')), net: net, netText: moneyText(net, cur), vat: v, vatAmount: num(txt(x, 'TThue')), kind: tchat, isDiscount: disc, isPromo: tchat === 2 });
        });
        if (!lines.length)
            warnings.push('Hóa đơn không có dòng hàng hóa/dịch vụ.');
        var tt = kid(nd, 'TToan'), totals = { net: num(txt(tt, 'TgTCThue')), vat: num(txt(tt, 'TgTThue')), gross: num(txt(tt, 'TgTTTBSo')) };
        var sumNet = lines.reduce(function (a, l) { return a + (l.net || 0); }, 0);
        if (totals.net !== null && Math.abs(sumNet - totals.net) > (cur === 'VND' ? 1 : 0.01) && !lines.some(function (l) { return l.isDiscount; }))
            warnings.push('Tổng các dòng (' + moneyText(sumNet, cur) + ') khác "Tổng tiền chưa thuế" trong hóa đơn (' + moneyText(totals.net, cur) + ').');
        if (lines.some(function (l) { return l.isDiscount; }))
            warnings.push('Hóa đơn có dòng chiết khấu thương mại (số âm): ứng dụng chưa nhập được dòng âm — hãy bỏ dòng này và nhập lại số tiền đã trừ chiết khấu, hoặc xử lý bằng điều chỉnh.');
        return { ok: true, warnings: warnings, invoice: { form: txt(tc, 'KHMSHDon'), serial: txt(tc, 'KHHDon'), number: txt(tc, 'SHDon'), date: date.slice(0, 10), currency: cur, rate: num(txt(tc, 'TGia')), seller: party(kid(nd, 'NBan')), buyer: party(kid(nd, 'NMua')), lines: lines, totals: totals, mccqt: txt(hd, 'MCCQT'), type: txt(tc, 'THDon') } };
    }
    return { parse: parse, parseXml: parseXml, vatOf: vatOf, moneyText: moneyText, toMinor: toMinor };
})();
