/* Biểu mẫu Excel nhập hàng loạt (đẹp, đủ cột theo cấu trúc dữ liệu hiện tại, có danh sách chọn lấy từ danh mục thật) + đọc lại tệp .xlsx đã điền. */
var BULK_SPEC = (function () {
    var C = { navy: 'FF12304A', teal: 'FF0F766E', orange: 'FFB4531A', green: 'FF2F855A', slate: 'FF475569', grey: 'FFF1F5F9', line: 'FFCBD5E1', warn: 'FFFEF3C7' };
    function col(k, t, g, o) { return Object.assign({ k: k, t: t, g: g, req: false, w: 14, type: 'text', desc: '', ex: '' }, o || {}); }
    var INV = function (dir) {
        var ar = dir === 'AR', G1 = 'THÔNG TIN HÓA ĐƠN', G2 = 'GẮN PO (TỰ ĐỘNG)', G3 = 'DÒNG PHÍ';
        return [
            col('partner', 'Đối tác *', G1, { req: 1, w: 26, list: 'partner', desc: (ar ? 'Khách hàng' : 'Nhà cung cấp') + ': tên viết tắt, tên pháp lý hoặc mã số thuế (phải đang hoạt động và đúng vai trò).', ex: ar ? 'ABC' : 'Cảng Cát Lái' }),
            col('invoiceNo', 'Số hóa đơn *', G1, { req: 1, w: 16, desc: 'Các dòng có cùng Đối tác + Số hóa đơn + Ký hiệu + Tiền tệ được GOM thành một hóa đơn nhiều dòng phí.', ex: '0000123' }),
            col('serial', 'Ký hiệu', G1, { w: 12, desc: 'Ký hiệu hóa đơn (nếu có).', ex: '1C26TAA' }),
            col('invoiceDate', 'Ngày hóa đơn *', G1, { req: 1, w: 15, type: 'date', desc: 'Định dạng dd/MM/yyyy. Phải từ ngày đầu sổ.', ex: '05/10/2026' }),
            col('docDate', 'Ngày chứng từ', G1, { w: 15, type: 'date', desc: 'Ngày ghi nhận dự kiến. Để trống = bằng Ngày hóa đơn. Công nợ chỉ tính từ NGÀY GHI NHẬN khi được duyệt.', ex: '' }),
            col('due', 'Hạn thanh toán', G1, { w: 15, type: 'date', desc: 'dd/MM/yyyy. Để trống = tự tính theo điều khoản thanh toán của đối tác (nếu có).', ex: '05/11/2026' }),
            col('expectedPay', 'Ngày dự kiến thanh toán', G1, { w: 17, type: 'date', desc: 'dd/MM/yyyy, tùy chọn.', ex: '' }),
            col('period', 'Kỳ quyết toán (yyyy-MM)', G1, { w: 16, desc: 'Tháng quyết toán nếu khác tháng của ngày chứng từ, dạng 2026-10.', ex: '2026-10' }),
            col('group', 'Nhóm nghiệp vụ *', G1, { req: 1, w: 15, list: 'group', desc: 'Mã nhóm trong Danh mục. Nếu có gắn PO mà để trống thì lấy theo nhóm của đơn.', ex: 'G1' }),
            col('currency', 'Tiền tệ', G1, { w: 10, list: 'currency', desc: 'Mã tiền tệ; để trống = VND. VND là số nguyên đồng; USD tối đa 2 số lẻ.', ex: 'VND' }),
            col('order', ar ? 'Số đơn / PO khách' : 'Số đơn / PO khách (gắn chi phí)', G2, { w: 20, list: 'order', desc: 'Số đơn DH-… hoặc số PO của khách (đơn phải ĐANG MỞ). Điền thì MỌI dòng phí của hóa đơn đều phải có. Hệ thống gắn dòng phí vào khoản phát sinh còn mở cùng đơn + đối tác + tiền tệ + số tiền; không có thì TẠO khoản phát sinh mới trong đơn.', ex: 'DH-2026-000001' }),
            col('poRef', 'PO gửi NCC', G2, { w: 16, desc: ar ? 'Chỉ dùng cho hóa đơn mua; hóa đơn bán để trống.' : 'Số PO bạn gửi nhà cung cấp (ghi vào khoản chi phí).', ex: ar ? '' : 'PO-NCC-01' }),
            col('serviceCode', 'Mã dịch vụ', G3, { w: 12, list: 'service', desc: 'Mã dịch vụ trong Danh mục. Bắt buộc nếu PO có nhiều mã dịch vụ; PO một mã thì tự lấy.', ex: 'FWD' }),
            col('feeType', 'Loại phí *', G3, { req: 1, w: 24, list: 'fee', desc: 'Tên hoặc mã loại phí trong Danh mục.', ex: 'Cước vận chuyển' }),
            col('description', 'Diễn giải *', G3, { req: 1, w: 40, desc: 'Nội dung dòng phí (tối đa 500 ký tự).', ex: 'Cước vận chuyển hàng từ cảng Cát Lái đi An Thới' }),
            col('containerQty', 'SL container', G3, { w: 11, type: 'int', desc: 'Số lượng container (số nguyên, tùy chọn).', ex: '2' }),
            col('declNo', 'Số tờ khai', G3, { w: 16, desc: 'Số tờ khai hải quan; hệ thống tạo/ghép tham chiếu lô hàng.', ex: '' }),
            col('declDate', 'Ngày tờ khai', G3, { w: 14, type: 'date', desc: 'dd/MM/yyyy (đi kèm Số tờ khai).', ex: '' }),
            col('netText', 'Số tiền trước thuế *', G3, { req: 1, w: 18, type: 'money', desc: 'Số tiền chưa gồm thuế GTGT. Có thể gõ 10.000.000 hoặc 10000000.', ex: '10000000' }),
            col('vat', 'Thuế', G3, { w: 10, list: 'vat', desc: 'KCT = không chịu thuế; số % (ví dụ 8, 10); để trống = CHƯA XÁC NHẬN thuế (có cảnh báo).', ex: '8' }),
            col('isPassThrough', ar ? 'Chi hộ (1/0)' : 'Thu hộ (1/0)', G3, { w: 11, list: 'flag', desc: '1 = ' + (ar ? 'chi hộ (thu lại của khách)' : 'thu hộ (trả lại khách)') + ' (không phải doanh thu/chi phí của công ty); 0 hoặc trống = bình thường.', ex: '0' }),
            col('lotNote', 'Ghi chú dòng', G3, { w: 22, desc: 'Ghi chú tham chiếu của dòng phí (lô, PO, container…).', ex: '' }),
            col('note', 'Ghi chú hóa đơn', G3, { w: 24, desc: 'Ghi chú chung của hóa đơn (lấy từ dòng đầu của hóa đơn).', ex: '' })
        ];
    };
    var SPEC = {
        INV_AR: { file: 'Mau_nhap_hoa_don_ban', title: 'BIỂU MẪU NHẬP HÀNG LOẠT — HÓA ĐƠN BÁN (PHẢI THU)', color: C.teal, cols: INV('AR'), role: 'customer',
            notes: ['Mỗi DÒNG = một dòng phí. Các dòng cùng Đối tác + Số hóa đơn + Ký hiệu + Tiền tệ tạo thành MỘT hóa đơn nháp.', 'Các dòng cùng hóa đơn phải giống nhau ở: ngày hóa đơn/chứng từ, hạn, kỳ, nhóm nghiệp vụ.', 'Điền số đơn/PO để tự gắn hóa đơn vào PO (hiện ở cột Đơn hàng/PO của danh sách Phải thu).'],
            examples: [['ABC', '0000123', '1C26TAA', '05/10/2026', '', '05/11/2026', '', '2026-10', 'G1', 'VND', 'DH-2026-000001', '', 'FWD', 'Cước vận chuyển', 'Cước vận chuyển tháng 10 (2 container)', '2', '', '', '10000000', '8', '0', '', ''], ['ABC', '0000123', '1C26TAA', '05/10/2026', '', '05/11/2026', '', '2026-10', 'G1', 'VND', 'DH-2026-000001', '', 'FWD', 'Phí dịch vụ thủ tục hải quan', 'Phí thủ tục hải quan tờ khai 1001', '', '1001/2026', '04/10/2026', '1500000', 'KCT', '0', '', ''], ['XYZ', '0000124', '1C26TAA', '06/10/2026', '', '', '', '', 'G1', 'VND', '', '', '', 'Khác', 'Phí lưu kho bãi (hóa đơn không gắn PO)', '', '', '', '3200000', '', '0', '', 'Chờ xác nhận thuế'], ['GLOBAL INC', 'EXP-009', '', '07/10/2026', '', '', '', '', 'G1', 'USD', '', '', '', 'Cước vận chuyển', 'Ocean freight (USD)', '', '', '', '1250.50', 'KCT', '0', '', '']] },
        INV_AP: { file: 'Mau_nhap_hoa_don_mua', title: 'BIỂU MẪU NHẬP HÀNG LOẠT — HÓA ĐƠN MUA / CHI PHÍ (PHẢI TRẢ)', color: C.orange, cols: INV('AP'), role: 'supplier',
            notes: ['Mỗi DÒNG = một dòng phí của hóa đơn nhà cung cấp. Các dòng cùng Đối tác + Số hóa đơn + Ký hiệu + Tiền tệ tạo thành MỘT hóa đơn nháp.', 'Điền số đơn/PO khách để tự gắn chi phí vào đơn (tính lãi gộp của đơn); cột PO gửi NCC ghi vào khoản chi phí.', 'Hóa đơn không điền số đơn là chi phí chung, không gắn PO.'],
            examples: [['Cảng Cát Lái', '0001234', 'AA/26E', '05/10/2026', '', '', '', '', 'G1', 'VND', 'DH-2026-000001', 'PO-NCC-01', 'FWD', 'Cước vận chuyển', 'Cước đường bộ tháng 10', '2', '', '', '4800000', 'KCT', '0', '', ''], ['Cảng Cát Lái', '0001234', 'AA/26E', '05/10/2026', '', '', '', '', 'G1', 'VND', 'DH-2026-000001', 'PO-NCC-01', 'FWD', 'Phí nâng/hạ container', 'Phí nâng hạ container', '2', '', '', '900000', '8', '0', '', ''], ['Công ty Kho vận', '0000777', '', '06/10/2026', '', '20/11/2026', '', '', 'G1', 'VND', '', '', '', 'Khác', 'Phí kho chung tháng 10 (không gắn PO)', '', '', '', '2100000', '8', '0', '', '']] },
        REVENUE: { file: 'Mau_nhap_PO_doanh_thu', title: 'BIỂU MẪU NHẬP HÀNG LOẠT — PO / DOANH THU', color: C.teal, role: 'customer',
            cols: [col('customer', 'Khách hàng *', 'ĐƠN HÀNG / PO', { req: 1, w: 26, list: 'partner', desc: 'Khách hàng (tên viết tắt hoặc tên pháp lý).', ex: 'ABC' }), col('poNo', 'Số PO khách *', 'ĐƠN HÀNG / PO', { req: 1, w: 18, desc: 'Các dòng cùng Khách + Số PO được gom vào MỘT đơn hàng (tạo mới hoặc gắn vào đơn đang mở).', ex: 'PO-123' }), col('date', 'Ngày *', 'ĐƠN HÀNG / PO', { req: 1, w: 14, type: 'date', desc: 'dd/MM/yyyy; phải trong kỳ đang mở.', ex: '05/10/2026' }), col('group', 'Nhóm nghiệp vụ *', 'ĐƠN HÀNG / PO', { req: 1, w: 15, list: 'group', desc: 'Mã nhóm trong Danh mục.', ex: 'G1' }), col('currency', 'Tiền tệ *', 'ĐƠN HÀNG / PO', { req: 1, w: 10, list: 'currency', desc: 'Mã tiền tệ.', ex: 'VND' }),
                col('serviceCode', 'Mã dịch vụ *', 'KHOẢN DOANH THU', { req: 1, w: 12, list: 'service', desc: 'Mỗi khoản ghi một mã dịch vụ; đơn có thêm mã mới thì được cấp thêm số HSDV.', ex: 'FWD' }), col('feeType', 'Loại phí *', 'KHOẢN DOANH THU', { req: 1, w: 24, list: 'fee', desc: 'Tên hoặc mã loại phí.', ex: 'Cước vận chuyển' }), col('description', 'Diễn giải *', 'KHOẢN DOANH THU', { req: 1, w: 40, desc: 'Nội dung khoản doanh thu.', ex: 'Phí dịch vụ hải quan' }), col('containerQty', 'SL container', 'KHOẢN DOANH THU', { w: 11, type: 'int', desc: 'Số nguyên, tùy chọn.', ex: '2' }), col('netText', 'Số tiền trước thuế *', 'KHOẢN DOANH THU', { req: 1, w: 18, type: 'money', desc: 'Chưa gồm thuế GTGT.', ex: '3200000' }), col('vat', 'Thuế', 'KHOẢN DOANH THU', { w: 10, list: 'vat', desc: 'KCT / số % / trống = chưa xác nhận.', ex: '8' }), col('isPassThrough', 'Chi hộ (1/0)', 'KHOẢN DOANH THU', { w: 11, list: 'flag', desc: '1 = chi hộ (mình chi hộ khách, thu lại của khách).', ex: '0' })],
            notes: ['Mỗi dòng là một khoản doanh thu của PO; các dòng cùng Khách + Số PO được gom vào một đơn hàng.', 'Sau khi nhập, lập hóa đơn bán từ các khoản phát sinh ở trang đơn (hoặc dùng mẫu Hóa đơn bán để nhập thẳng hóa đơn kèm tự gắn PO).'],
            examples: [['ABC', 'PO-123', '05/10/2026', 'G1', 'VND', 'FWD', 'Cước vận chuyển', 'Cước vận chuyển 2 container', '2', '10000000', '8', '0'], ['ABC', 'PO-123', '05/10/2026', 'G1', 'VND', 'FWD', 'Phí dịch vụ thủ tục hải quan', 'Phí thủ tục hải quan', '', '1500000', 'KCT', '0']] },
        COST: { file: 'Mau_nhap_chi_phi', title: 'BIỂU MẪU NHẬP HÀNG LOẠT — CHI PHÍ', color: C.orange, role: 'supplier',
            cols: [col('orderRef', 'Số đơn / PO khách', 'GẮN ĐƠN', { w: 26, list: 'order', desc: 'Số đơn DH-… hoặc số PO khách duy nhất; TRỐNG hoặc "chung" = chi phí chung; chia nhiều đơn: DH-1:60%;DH-2:40% (theo %), DH-1:700.000;DH-2:300.000 (theo số tiền) hoặc chỉ liệt kê các đơn để chia đều.', ex: 'DH-2026-000001' }), col('supplier', 'Nhà cung cấp *', 'NHÀ CUNG CẤP', { req: 1, w: 26, list: 'partner', desc: 'Nhà cung cấp (tên viết tắt hoặc tên pháp lý).', ex: 'Cảng Cát Lái' }), col('poRef', 'PO gửi NCC', 'NHÀ CUNG CẤP', { w: 16, desc: 'Số PO bạn gửi nhà cung cấp.', ex: 'PO-NCC-01' }),
                col('date', 'Ngày *', 'KHOẢN CHI PHÍ', { req: 1, w: 14, type: 'date', desc: 'dd/MM/yyyy; trong kỳ đang mở.', ex: '05/10/2026' }), col('feeType', 'Loại phí *', 'KHOẢN CHI PHÍ', { req: 1, w: 24, list: 'fee', desc: 'Tên hoặc mã loại phí.', ex: 'Cước vận chuyển' }), col('description', 'Diễn giải *', 'KHOẢN CHI PHÍ', { req: 1, w: 40, desc: 'Nội dung chi phí.', ex: 'Cước đường bộ' }), col('containerQty', 'SL container', 'KHOẢN CHI PHÍ', { w: 11, type: 'int', desc: 'Số nguyên, tùy chọn.', ex: '2' }), col('netText', 'Số tiền trước thuế *', 'KHOẢN CHI PHÍ', { req: 1, w: 18, type: 'money', desc: 'Chưa gồm thuế GTGT.', ex: '4800000' }), col('vat', 'Thuế', 'KHOẢN CHI PHÍ', { w: 10, list: 'vat', desc: 'KCT / số % / trống = chưa xác nhận.', ex: 'KCT' }), col('isPassThrough', 'Thu hộ (1/0)', 'KHOẢN CHI PHÍ', { w: 11, list: 'flag', desc: '1 = thu hộ (mình thu hộ, phải trả lại).', ex: '0' }), col('currency', 'Tiền tệ', 'KHOẢN CHI PHÍ', { w: 10, list: 'currency', desc: 'Để trống = tiền tệ của đơn (bắt buộc với chi phí chung).', ex: '' }), col('serviceCode', 'Mã dịch vụ', 'KHOẢN CHI PHÍ', { w: 12, list: 'service', desc: 'Bắt buộc nếu PO có nhiều mã dịch vụ.', ex: 'FWD' })],
            notes: ['Mỗi dòng là một khoản chi phí chưa nhận hóa đơn; sau đó nhận hóa đơn NCC ở màn COST/đơn hàng (hoặc dùng mẫu Hóa đơn mua để nhập thẳng hóa đơn kèm tự gắn PO).'],
            examples: [['DH-2026-000001', 'Cảng Cát Lái', 'PO-NCC-01', '05/10/2026', 'Cước vận chuyển', 'Cước đường bộ', '2', '4800000', 'KCT', '0', '', 'FWD'], ['chung', 'Công ty Kho vận', '', '06/10/2026', 'Khác', 'Phí kho chung tháng 10', '', '2100000', '8', '0', 'VND', '']] }
    };
    var VAT = ['KCT', '0', '5', '8', '10'];
    function st(o) { return o; }
    async function build(kind, ctx) {
        var S0 = SPEC[kind], cols = S0.cols, n = cols.length, MAXR = 500, FIRST = 5, LAST = FIRST + MAXR - 1;
        var b = { navy: C.navy, brand: S0.color };
        var fee = ctx.feeTypes || [], groups = ctx.groups || [], curs = ctx.currencies || [], svcs = ctx.serviceCodes || [], partners = ctx.partners || [], orders = ctx.orders || [];
        var L = { fee: { sheetCol: 'A', vals: fee.map(function (x) { return x.name || x.code; }) }, group: { sheetCol: 'C', vals: groups.map(function (x) { return x.code; }) }, currency: { sheetCol: 'E', vals: curs.map(function (x) { return x.code; }) }, service: { sheetCol: 'F', vals: svcs.map(function (x) { return x.code; }) }, vat: { sheetCol: 'H', vals: VAT }, flag: { sheetCol: 'I', vals: ['0', '1'] }, partner: { sheetCol: 'J', vals: partners }, order: { sheetCol: 'K', vals: orders } };
        var thin = C.line, head = { font: { b: 1, color: 'FFFFFFFF', sz: 10 }, border: 'FFFFFFFF', align: { h: 'center', v: 'center', wrap: 1 } };
        var gColors = { 0: S0.color, 1: C.navy, 2: C.green, 3: C.slate }, gOrder = [];
        cols.forEach(function (c) { if (gOrder.indexOf(c.g) < 0)
            gOrder.push(c.g); });
        // ---- Sheet 1: Nhập liệu ----
        var rows = [], merges = [], validations = [], i, merges2 = [];
        function fillRow(h, text, s, spanTo) { var cells = []; cells[0] = { v: text, s: s }; for (var k = 1; k < n; k++)
            cells[k] = { v: '', s: s }; return { h: h, cells: cells }; }
        rows.push(fillRow(36, S0.title, { font: { b: 1, color: 'FFFFFFFF', sz: 15 }, fill: C.navy, align: { h: 'left', v: 'center', indent: 1 } }));
        merges.push('A1:' + XLSXLite.colName(n - 1) + '1');
        rows.push(fillRow(46, 'HƯỚNG DẪN NHANH: điền dữ liệu từ dòng 5 trở xuống (tối đa ' + MAXR + ' dòng) — KHÔNG đổi tên/thứ tự cột — cột có dấu * là bắt buộc — chọn từ danh sách thả xuống khi có. Cách dùng: tải tệp này lên trong ứng dụng (Nhập hàng loạt → nút "Chọn tệp") hoặc copy vùng dữ liệu kể cả dòng tiêu đề rồi dán vào ô nhập. Xem sheet "Hướng dẫn" và "Ví dụ".', { font: { color: 'FF7C2D12', sz: 10 }, fill: C.warn, align: { h: 'left', v: 'center', wrap: 1, indent: 1 } }));
        merges.push('A2:' + XLSXLite.colName(n - 1) + '2');
        var bands = [], start = 0;
        gOrder.forEach(function (g, gi) {
            var cnt = cols.filter(function (c) { return c.g === g; }).length, s = { font: { b: 1, color: 'FFFFFFFF', sz: 10 }, fill: gColors[gi % 4], align: { h: 'center', v: 'center' }, border: 'FFFFFFFF' };
            for (var k = 0; k < cnt; k++)
                bands[start + k] = { v: k === 0 ? g : '', s: s };
            if (cnt > 1)
                merges.push(XLSXLite.colName(start) + '3:' + XLSXLite.colName(start + cnt - 1) + '3');
            start += cnt;
        });
        rows.push({ h: 22, cells: bands });
        rows.push({ h: 44, cells: cols.map(function (c) { var gi = gOrder.indexOf(c.g); return { v: c.t, s: Object.assign({}, head, { fill: c.req ? darker(gColors[gi % 4]) : gColors[gi % 4], font: { b: 1, color: 'FFFFFFFF', sz: 10 } }) }; }) });
        var cellStyles = cols.map(function (c) { return { border: thin, numFmt: c.type === 'money' ? undefined : '@', align: { h: c.type === 'money' || c.type === 'int' ? 'right' : 'left', v: 'center' } }; });
        for (i = 0; i < MAXR; i++)
            rows.push({ cells: cols.map(function (c, k) { return { v: '', s: cellStyles[k] }; }) });
        cols.forEach(function (c, k) {
            var colL = XLSXLite.colName(k), rng = colL + FIRST + ':' + colL + LAST, lst = c.list && L[c.list];
            if (lst && lst.vals.length) {
                var ref = "'Danh mục'!$" + lst.sheetCol + '$2:$' + lst.sheetCol + '$' + (lst.vals.length + 1);
                if (c.list === 'vat' || c.list === 'flag' || c.list === 'currency' || c.list === 'group' || c.list === 'service' || c.list === 'fee')
                    validations.push({ sqref: rng, list: ref, title: c.t.replace(' *', ''), prompt: c.desc, warn: c.list === 'fee' || c.list === 'vat', error: 'Giá trị này chưa có trong danh mục. Kiểm tra lại chính tả.' });
                else
                    validations.push({ sqref: rng, list: ref, title: c.t.replace(' *', ''), prompt: c.desc, warn: true, error: 'Giá trị chưa có trong danh sách (vẫn có thể giữ nếu đúng tên/số).' });
            }
        });
        var s1 = { name: 'Nhập liệu', tabColor: S0.color, cols: cols.map(function (c) { return { w: c.w }; }), rows: rows, merges: merges, freeze: { row: 4, col: kind.indexOf('INV') === 0 ? 2 : 1 }, filter: 'A4:' + XLSXLite.colName(n - 1) + LAST, validations: validations, showGrid: false, active: true, zoom: 90 };
        // ---- Sheet 2: Hướng dẫn ----
        var hs = { font: { b: 1, color: 'FFFFFFFF' }, fill: C.navy, border: 'FFFFFFFF', align: { h: 'left', v: 'center', wrap: 1, indent: 1 } }, tx = { border: thin, align: { v: 'top', wrap: 1, indent: 1 } }, txb = { border: thin, font: { b: 1 }, align: { v: 'top', wrap: 1, indent: 1 } }, sec = { font: { b: 1, color: S0.color, sz: 12 }, align: { v: 'center' } };
        var gr = [];
        gr.push({ h: 34, cells: [{ v: S0.title, s: { font: { b: 1, color: 'FFFFFFFF', sz: 15 }, fill: C.navy, align: { v: 'center', indent: 1 } } }, { v: '', s: { fill: C.navy } }, { v: '', s: { fill: C.navy } }, { v: '', s: { fill: C.navy } }, { v: '', s: { fill: C.navy } }, { v: '', s: { fill: C.navy } }] });
        gr.push({ h: 8, cells: [] });
        gr.push({ h: 24, cells: [{ v: 'CÁCH SỬ DỤNG', s: sec }] });
        ['1. Điền dữ liệu vào sheet "Nhập liệu" từ dòng 5 (mỗi dòng một bản ghi/dòng phí). Xóa dữ liệu mẫu nếu bạn sao chép từ sheet "Ví dụ".', '2. Trong ứng dụng: menu Nhập hàng loạt → chọn đúng tab → nút "Chọn tệp" và chọn tệp .xlsx này (hoặc copy vùng dữ liệu kể cả dòng tiêu đề rồi dán).', '3. Bấm "Xem trước" để kiểm tra: lỗi được báo đúng dòng, đúng ô. Có lỗi thì sửa tệp và tải lại — hệ thống KHÔNG ghi gì cho đến khi tất cả dòng hợp lệ.', '4. Khi hợp lệ, bấm ghi. Dữ liệu vào trạng thái nháp/chờ duyệt theo đúng quy trình thông thường.'].concat(S0.notes.map(function (x) { return '• ' + x; })).forEach(function (t) { gr.push({ h: 34, cells: [{ v: t, s: { align: { v: 'center', wrap: 1, indent: 1 } } }] }); merges2.push('A' + gr.length + ':F' + gr.length); });
        gr.push({ h: 12, cells: [] });
        gr.push({ h: 24, cells: [{ v: 'GIẢI THÍCH TỪNG CỘT', s: sec }] });
        gr.push({ h: 26, cells: ['Cột', 'Tên cột', 'Bắt buộc', 'Kiểu dữ liệu', 'Quy tắc / mô tả', 'Ví dụ'].map(function (t) { return { v: t, s: hs }; }) });
        var typeName = { text: 'Chữ', date: 'Ngày dd/MM/yyyy', money: 'Số tiền', int: 'Số nguyên' };
        cols.forEach(function (c, k) { gr.push({ h: Math.max(30, 15 * Math.ceil((c.desc.length + 1) / 70)), cells: [{ v: XLSXLite.colName(k), s: txb }, { v: c.t.replace(' *', ''), s: txb }, { v: c.req ? 'Có' : 'Không', s: Object.assign({}, tx, { font: { b: c.req ? 1 : 0, color: c.req ? 'FFB91C1C' : 'FF475569' } }) }, { v: (typeName[c.type] || 'Chữ') + (c.list ? ' / chọn từ danh sách' : ''), s: tx }, { v: c.desc, s: tx }, { v: c.ex, s: tx }] }); });
        var s2 = { name: 'Hướng dẫn', tabColor: C.navy, cols: [{ w: 7 }, { w: 26 }, { w: 11 }, { w: 24 }, { w: 80 }, { w: 30 }], rows: gr, merges: (function () { var m = ['A1:F1']; gr.forEach(function (r, ri) { if (r.cells.length === 1 && ri > 2 && r.h === 34)
                m.push('A' + (ri + 1) + ':F' + (ri + 1)); }); return m; })(), showGrid: false };
        // ---- Sheet 3: Ví dụ ----
        var er = [{ h: 30, cells: [{ v: 'VÍ DỤ MINH HỌA — sao chép sang sheet "Nhập liệu" rồi sửa lại cho đúng dữ liệu của bạn (đừng giữ nguyên dòng mẫu)', s: { font: { b: 1, color: 'FF7C2D12' }, fill: C.warn, align: { v: 'center', indent: 1 } } }] }];
        er.push({ h: 40, cells: cols.map(function (c) { var gi = gOrder.indexOf(c.g); return { v: c.t, s: Object.assign({}, head, { fill: gColors[gi % 4] }) }; }) });
        S0.examples.forEach(function (ex) { er.push({ cells: cols.map(function (c, k) { return { v: ex[k] === undefined ? '' : ex[k], s: { border: thin, font: { i: 1, color: 'FF334155' }, numFmt: '@', align: { h: c.type === 'money' || c.type === 'int' ? 'right' : 'left', wrap: 1 } } }; }) }); });
        var s3 = { name: 'Ví dụ', tabColor: C.green, cols: cols.map(function (c) { return { w: c.w }; }), rows: er, merges: ['A1:' + XLSXLite.colName(n - 1) + '1'], freeze: { row: 2 }, showGrid: false };
        // ---- Sheet 4: Danh mục ----
        var heads = ['Loại phí (tên)', 'Mã loại phí', 'Nhóm nghiệp vụ (mã)', 'Tên nhóm', 'Tiền tệ', 'Mã dịch vụ', 'Tên dịch vụ', 'Thuế', 'Chi hộ (phải thu lại) / Thu hộ (phải trả lại)', S0.role === 'customer' ? 'Khách hàng (đang hoạt động)' : 'Nhà cung cấp (đang hoạt động)', 'Đơn đang mở (số đơn · PO)'], dc = [{ h: 30, cells: heads.map(function (t) { return { v: t, s: hs }; }) }];
        var colsVals = [fee.map(function (x) { return x.name || x.code; }), fee.map(function (x) { return x.code; }), groups.map(function (x) { return x.code; }), groups.map(function (x) { return x.name || ''; }), curs.map(function (x) { return x.code; }), svcs.map(function (x) { return x.code; }), svcs.map(function (x) { return x.name || ''; }), VAT, ['0', '1'], partners, orders], maxLen = 1;
        colsVals.forEach(function (c) { maxLen = Math.max(maxLen, c.length); });
        for (i = 0; i < maxLen; i++)
            dc.push({ cells: colsVals.map(function (c) { return { v: c[i] === undefined ? '' : c[i], s: { border: thin, numFmt: '@' } }; }) });
        var s4 = { name: 'Danh mục', tabColor: C.slate, cols: [{ w: 30 }, { w: 16 }, { w: 18 }, { w: 24 }, { w: 10 }, { w: 14 }, { w: 28 }, { w: 8 }, { w: 14 }, { w: 34 }, { w: 34 }], rows: dc, freeze: { row: 1 }, showGrid: false };
        return XLSXLite.write({ sheets: [s1, s2, s3, s4] });
    }
    function darker(argb) { var r = parseInt(argb.slice(2, 4), 16), g = parseInt(argb.slice(4, 6), 16), b = parseInt(argb.slice(6, 8), 16), f = 0.72; function h(x) { return ('0' + Math.round(x * f).toString(16)).slice(-2); } return 'FF' + h(r) + h(g) + h(b); }
    return { SPEC: SPEC, build: function (kind, ctx) { return build(kind, ctx); } };
})();
