> **LỊCH SỬ — đã được thay bằng bản R2 (ở thư mục gốc gói).** Lưu ý: câu "không đổi schema" trong tài liệu này CHỈ đúng so với bản giao ngay trước đó; so với bản 12 cũ trước đợt Tỷ giá, schema đã đổi (xem tài liệu R2).

# Triển khai và quay lui bản 12 (sửa lỗi quyền PO, liên kết điều chỉnh, kiểm thử UI)

Bản này **không đổi schema Sheets** (không thêm bảng/cột so với bản giao ngay trước). Nếu bạn đang chạy bản cũ hơn (trước đợt Tỷ giá), làm theo `HUONG_DAN_TRIEN_KHAI.md` và `BAO_CAO_BAN_GIAO.md` trước (cần `ensureSchema()` để thêm bảng `FxRate`, `FxEntry` và cột tỷ giá).

## Trước khi triển khai
1. Làm trên **bản sao** dữ liệu và bản triển khai thử trước. Sao lưu: File → Make a copy cho bảng tính Dữ liệu, Nhật ký, DRAFT; chạy sao lưu của ứng dụng. Ghi lại số phiên bản (Manage deployments) của Backend và Gateway hiện tại để quay lui.
2. Kiểm tra toàn vẹn gói (xem "Xác minh hash" bên dưới).

## Các bước
1. Backend: dán `1_BACKEND/Backend.gs` (hoặc `AN_TOAN_KHI_DAN/Backend.gs` nếu trình soạn thảo làm mất xuống dòng) → chạy `ensureSchema()` (chỉ kiểm tra/thêm tiêu đề thiếu; chạy lại an toàn) → Deploy → Manage deployments → Edit → New version. Giữ nguyên URL.
2. Gateway: dán `2_GATEWAY/Gateway.gs`, `index.html`, `luong-nghiep-vu.html` (hoặc bản trong `AN_TOAN_KHI_DAN/`) → New version. Trình duyệt Ctrl+F5.
3. **Trigger 10 phút, không tạo trùng:** trong trình soạn thảo chạy `checkTriggers()` (chỉ đọc) và xem Nhật ký thực thi: `ok: true` nghĩa là đủ 5 bộ kích hoạt, mỗi loại một bản (`recoverTrigger` mỗi 10 phút). Chỉ khi báo **thiếu/trùng** mới chạy `installTriggers()` một lần: hàm xóa các bộ kích hoạt của ứng dụng (`backupDailyTrigger`, `recoverTrigger`, `overdueDigestTrigger`, `reconcileTrigger`, `archiveTrigger`) rồi tạo lại đúng một bản mỗi loại. Có thể chạy lại, không nhân đôi. Chạy lại `checkTriggers()` để xác nhận. Màn Hệ thống → Trạng thái cũng cảnh báo thiếu bộ kích hoạt.
4. Kiểm tra sau triển khai (thủ công, chưa tự động được trên Google): (a) tài khoản có phạm vi hẹp (một NCC) mở Phải trả: thấy hóa đơn, không thấy số đơn/PO của khách khác, thấy dòng "PO ngoài phạm vi xem"; (b) tài khoản đủ quyền lọc theo đơn: thấy cả hóa đơn gốc lẫn điều chỉnh/đảo; (c) Nhập hàng loạt → tải biểu mẫu `.xlsx` mở được; (d) Hệ thống → Trạng thái không có cờ đỏ.

## Quay lui
Deploy lại phiên bản Backend/Gateway cũ đã ghi ở bước chuẩn bị (Manage deployments → chọn version cũ). Bản này không ghi dữ liệu mới nào vào Sheets nên quay lui không cần khôi phục dữ liệu. Bản cũ lại hiển thị PO ngoài phạm vi và bỏ sót điều chỉnh khi lọc PO (lỗi đã biết).

## Xác minh hash
`3_TAI_LIEU/SHA256.txt` có dạng `<sha256>  <đường dẫn tính từ gốc gói>`, tính trên **byte** của tệp bàn giao cuối cùng (không gồm chính tệp hash).
- Linux/macOS: `cd <thư mục gốc gói> && sha256sum -c 3_TAI_LIEU/SHA256.txt`
- Windows PowerShell: `Get-Content 3_TAI_LIEU\SHA256.txt | ForEach-Object { $h,$p = $_ -split '\s+',2; if ((Get-FileHash $p -Algorithm SHA256).Hash.ToLower() -eq $h) {"OK  $p"} else {"LỆCH $p"} }`
Backend/UI trong `1_BACKEND`, `2_GATEWAY`, `AN_TOAN_KHI_DAN` được dựng từ `6_NGUON` bằng `build.py`; `4_TESTS/sync.test.cjs` dựng lại trong thư mục tạm và so hash.

## Chạy kiểm thử cục bộ
Xem `KET_QUA_TEST_V12.md`. Cần Node ≥ 20; UI cần `playwright` + Chromium; một số bước cần Python 3 + `openpyxl` (đặt biến `PYTHON` nếu cần). Không chạy gì lên tài khoản Google, không cài trigger, không dùng dữ liệu thật.
