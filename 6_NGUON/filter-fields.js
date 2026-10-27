/* Khai báo điều kiện lọc cho từng màn hình. type: multi (chọn nhiều) · bool (điều kiện nhanh) · range (một đầu của khoảng) · enum (chọn một, gửi tham số phẳng). */
function lfStatusOptions() { return Object.keys(VN.status).map(function (k) { return { v: k, l: VN.status[k] }; }); }
function DOC_FILTER_FIELDS() {
    return [
        { key: 'partnerId', label: 'Đối tác', type: 'multi', group: 'Đối tượng', options: function () { return partnerOptions(null, true); } },
        { key: 'group', label: 'Nhóm nghiệp vụ', type: 'multi', group: 'Đối tượng', options: function () { return groupOptions(true); } },
        { key: 'currency', label: 'Tiền tệ', type: 'multi', group: 'Đối tượng', options: function () { return currencyOptions(true).map(function (o) { return { v: o.v, l: o.v || o.l }; }); } },
        { key: 'status', label: 'Trạng thái chứng từ', type: 'multi', group: 'Trạng thái', options: lfStatusOptions },
        { key: 'payStatus', label: 'Tình trạng thanh toán', type: 'multi', group: 'Trạng thái', options: [{ v: 'UNPAID', l: 'Chưa thanh toán' }, { v: 'PARTIAL', l: 'Một phần' }, { v: 'PAID', l: 'Đã thanh toán' }, { v: 'CREDIT', l: 'Ghi có' }] },
        { key: 'aging', label: 'Tuổi nợ', type: 'multi', group: 'Trạng thái', options: function () { return Object.keys(VN.aging).map(function (k) { return { v: k, l: VN.aging[k] }; }); } },
        { key: 'orderId', label: 'Đơn hàng / PO', type: 'multi', group: 'Đối tượng', options: function () { return orderOptionsLF(); } },
        { key: 'amtFrom', label: 'Số tiền từ', type: 'range', part: 'from', advKey: 'amountMinor', rkind: 'amount', group: 'Số tiền (chọn đúng một tiền tệ)' },
        { key: 'amtTo', label: 'Số tiền đến', type: 'range', part: 'to', advKey: 'amountMinor', rkind: 'amount', group: 'Số tiền (chọn đúng một tiền tệ)' },
        { key: 'dueFrom', label: 'Hạn thanh toán từ', type: 'range', part: 'from', advKey: 'dueDate', rkind: 'date', group: 'Hạn thanh toán' },
        { key: 'dueTo', label: 'Hạn thanh toán đến', type: 'range', part: 'to', advKey: 'dueDate', rkind: 'date', group: 'Hạn thanh toán' },
        { key: 'overdue', label: 'Quá hạn', type: 'bool', group: 'Điều kiện nhanh' },
        { key: 'missingDue', label: 'Thiếu ngày đến hạn', type: 'bool', group: 'Điều kiện nhanh' },
        { key: 'hasWarning', label: 'Có cảnh báo', type: 'bool', group: 'Điều kiện nhanh' },
        { key: 'onlyOutstanding', label: 'Chỉ khoản còn nợ', type: 'bool', group: 'Điều kiện nhanh' },
        { key: 'onlyOpening', label: 'Chỉ dư đầu kỳ', type: 'bool', group: 'Điều kiện nhanh' },
        { key: 'noOrder', label: 'Chỉ chứng từ chưa gắn PO', type: 'bool', group: 'Điều kiện nhanh' }
    ];
}
function ORDER_FILTER_FIELDS() {
    return [
        { key: 'orderId', label: 'Đơn hàng / PO (chọn nhiều)', type: 'multi', group: 'Đối tượng', options: function () { return orderOptionsLF(); } },
        { key: 'partnerId', label: 'Khách hàng', type: 'multi', group: 'Đối tượng', options: function () { return partnerOptions(function (p) { return p.isCustomer; }, true); } },
        { key: 'group', label: 'Nhóm nghiệp vụ', type: 'multi', group: 'Đối tượng', options: function () { return groupOptions(true); } },
        { key: 'serviceCode', label: 'Mã dịch vụ', type: 'multi', group: 'Đối tượng', options: function () { return serviceOptions('', ''); } },
        { key: 'status', label: 'Trạng thái đơn', type: 'multi', group: 'Trạng thái', options: [{ v: 'OPEN', l: 'Đang mở' }, { v: 'CLOSED', l: 'Đã đóng' }, { v: 'CANCELLED', l: 'Đã hủy' }] },
        { key: 'onlyUninvoiced', label: 'Chỉ đơn còn khoản chưa lập hóa đơn', type: 'bool', group: 'Điều kiện nhanh' },
        { key: 'onlyInvoicing', label: 'Chỉ đơn có khoản đang lập hóa đơn', type: 'bool', group: 'Điều kiện nhanh' },
        { key: 'onlyMissingService', label: 'Chỉ PO chưa có mã dịch vụ', type: 'bool', group: 'Điều kiện nhanh' },
        { key: 'includeArchived', label: 'Hiện cả PO đã lưu trữ', type: 'bool', group: 'Lưu trữ' },
        { key: 'onlyArchived', label: 'Chỉ PO đã lưu trữ', type: 'bool', group: 'Lưu trữ' }
    ];
}
function PAY_FILTER_FIELDS() {
    return [
        { key: 'partnerId', label: 'Đối tác', type: 'multi', group: 'Đối tượng', options: function () { return partnerOptions(null, true); } },
        { key: 'cashAccountCode', label: 'Tài khoản quỹ', type: 'multi', group: 'Đối tượng', options: function () { return S.boot.catalogs.cashAccounts.map(function (c) { return { v: c.code, l: c.code + ' – ' + c.name }; }); } },
        { key: 'currency', label: 'Tiền tệ', type: 'multi', group: 'Đối tượng', options: function () { return currencyOptions(true).map(function (o) { return { v: o.v, l: o.v || o.l }; }); } },
        { key: 'direction', label: 'Chiều', type: 'multi', group: 'Trạng thái', options: [{ v: 'IN', l: 'Phiếu thu' }, { v: 'OUT', l: 'Phiếu chi' }] },
        { key: 'status', label: 'Trạng thái phiếu', type: 'multi', group: 'Trạng thái', options: lfStatusOptions },
        { key: 'amtFrom', label: 'Số tiền từ', type: 'range', part: 'from', advKey: 'amountMinor', rkind: 'amount', group: 'Số tiền (chọn đúng một tiền tệ)' },
        { key: 'amtTo', label: 'Số tiền đến', type: 'range', part: 'to', advKey: 'amountMinor', rkind: 'amount', group: 'Số tiền (chọn đúng một tiền tệ)' },
        { key: 'onlyUnallocated', label: 'Chỉ phiếu còn chưa phân bổ', type: 'bool', group: 'Điều kiện nhanh' }
    ];
}
function COST_FILTER_FIELDS() {
    return [
        { key: 'partnerId', label: 'Nhà cung cấp', type: 'enum', flat: 'partnerId', group: 'Đối tượng', options: function () { return partnerOptions(function (p) { return p.isSupplier; }, true); } },
        { key: 'status', label: 'Trạng thái', type: 'enum', flat: 'status', group: 'Trạng thái', options: [{ v: 'OPEN', l: 'Chưa nhận hóa đơn' }, { v: 'INVOICING', l: 'Hóa đơn nháp/chờ duyệt' }, { v: 'INVOICED', l: 'Đã ghi nhận' }] },
        { key: 'waiting', label: 'Chỉ chi phí chờ phân bổ (chung / chưa gắn mã dịch vụ)', type: 'bool', flat: 'waiting', group: 'Điều kiện nhanh' }
    ];
}
