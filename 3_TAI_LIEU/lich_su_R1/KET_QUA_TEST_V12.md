> **LỊCH SỬ — đã được thay bằng bản R2 (ở thư mục gốc gói).** Lưu ý: câu "không đổi schema" trong tài liệu này CHỈ đúng so với bản giao ngay trước đó; so với bản 12 cũ trước đợt Tỷ giá, schema đã đổi (xem tài liệu R2).

# Kết quả kiểm thử bản 12

**Môi trường thực tế:** Linux 6.18 (container), Node v22.22.0, Playwright 1.63.0 + Chromium kèm theo, Python 3.13.17 + openpyxl 3.1.5. Backend thật chạy trong `vm` của Node với Sheet/Cache/Lock/Properties **giả**. **Không có bước nào chạy trên Google Apps Script/Google Sheets thật. Chưa chạy trên Windows** (các đường dẫn đã chuyển sang `__dirname`/`os.tmpdir()` nhưng lỗi `download.saveAs: canceled` bạn gặp trên Windows chưa được tái hiện hay xác nhận là đã hết).

## Lệnh và kết quả từng lượt (không cộng gộp)
| # | Lệnh (từ thư mục gốc gói) | Biến thể | Kết quả |
|---|---|---|---|
| 1 | `node 4_TESTS/run-all.cjs` | thường (`1_BACKEND`) | **49/49 tệp đạt** (46 tệp có từ trước đợt này, gồm `fx` và `hak-format`; thêm 3 tệp mới: `po-scope`, `syntax`, `sync`) |
| 2 | `BACKEND_SRC=<tuyệt đối>/AN_TOAN_KHI_DAN/Backend.gs node 4_TESTS/run-all.cjs` | an toàn khi dán | **49/49 đạt**; 44/49 tệp thực sự nạp Backend an toàn qua `BACKEND_SRC`/`SRC`. Đối chứng: đặt `BACKEND_SRC` sai đường dẫn thì 44 tệp thất bại (chứng minh biến được dùng). 5 tệp không phụ thuộc biến: `bulk-template` (đọc `6_NGUON`), `dupfn`, `einvoice-xml`, `sync`, `syntax` (các tệp này kiểm cả hai biến thể bằng cách khác) |
| 3 | `node 5_UI_TESTS/ui.e2e.cjs` | UI thường + Backend thường | **21/21 nhóm đạt, 188 khẳng định trong lượt này** |
| 4 | `UI_HTML=…/AN_TOAN_KHI_DAN/index.html BACKEND_SRC=…/AN_TOAN_KHI_DAN/Backend.gs node 5_UI_TESTS/ui.e2e.cjs` | UI an toàn + Backend an toàn | **21/21 nhóm đạt, 188 khẳng định trong lượt này** |
| 5 | `node 5_UI_TESTS/autosave.regression.cjs` | thường | 2/2 PASS: nhập đầu + yêu cầu chậm tuần tự; xung đột hai phiên không ghi đè |
| 6 | cùng lệnh 5 với `UI_HTML`/`BACKEND_SRC` an toàn | an toàn | 2/2 PASS |
| 7 | `PYTHON=/khong/co node 5_UI_TESTS/ui.e2e.cjs` | thường | 20/21 đạt; **nhóm 16 BỊ CHẶN (chưa xác minh)** vì thiếu Python, mã thoát 3 — chứng minh test không âm thầm đạt |
| 8 | `UI_HTML=<bản cũ trước đợt này> node 5_UI_TESTS/ui.e2e.cjs` | bản cũ | 20/21: nhóm 16 **thất bại** ở khẳng định Blob URL (bị thu hồi sau ~1,56 s) — chứng minh khẳng định mới có ý nghĩa |
| 9 | `node 4_TESTS/po-scope.test.cjs` | thường | 11/11 nhóm, 73 khẳng định |
| 10 | `BACKEND_SRC=<bản cũ trước đợt này> node 4_TESTS/po-scope.test.cjs` | bản cũ | **10/11 nhóm thất bại** (nhóm 1–7, 9, 10, 11) — tái hiện hai lỗi PO; nhóm 8 (số dư không đổi) đạt trên cả hai |

Ghi chú: "bản cũ" là gói giao ngay trước đợt này, không phải `congno_deploy (12).zip` của bạn (không nhận được).

## Bao phủ theo yêu cầu của prompt
- **Mục 2 (quyền PO):** `po-scope` nhóm 1–4 (PO ngoài quyền, nhiều PO một phần, tìm `q`/`orderId`, `noOrder` phân biệt PO thật/PO ẩn), nhóm 9 (cache ấm hai người khác phạm vi, có kiểm khóa và nội dung cache).
- **Mục 3 (điều chỉnh/đảo):** nhóm 5 (tăng, giảm, đảo, phân trang, tổng), 6 (điều chỉnh một dòng của hóa đơn nhiều PO chỉ kế thừa PO dòng đó), 7 (dòng gốc thiếu, vòng 2 nút, tự tham chiếu, chuỗi vượt độ sâu 8), 8 (số dư không đổi), 10 (luồng thật `docAdjust_`).
- **Mục 4 (UI):** nhóm 16 chạy đủ luồng (tải mẫu → kiểm workbook → tệp openpyxl có ô ngày thật → tải lên → xem trước → gắn PO → ghi 2 hóa đơn nháp/3 dòng); nhóm 17–18 (XML) dùng fixture theo `__dirname`.
- **Mục 6:** `syntax.test.cjs` (34 khối: Backend/Gateway cả hai biến thể và 13+13+2+2 khối script JavaScript trong HTML, bỏ qua khối JSON), `sync.test.cjs` (dựng lại từ `6_NGUON` bằng `build.py` trong thư mục tạm, so SHA-256 với 8 tệp bàn giao và kiểm Backend chứa nguyên văn `hak-format.js`), `dupfn`, test cache/giao dịch lặp/khóa kỳ/phân bổ/bảng tổng hợp hiện có (toàn bộ 46 tệp gốc giữ nguyên, không xóa hay giảm khẳng định; chỉ sửa đường dẫn nạp Backend để chạy được biến thể an toàn).

## Mục bị chặn / chưa xác minh
- Mọi thứ trên Google thật: `GOOGLEFINANCE`, trigger 10 phút, `ensureSchema()`, triển khai Web app, hiệu năng thực.
- Chạy trên Windows/macOS và Chrome của người dùng: chưa.
- Các màn khác ngoài `doc.list`/`doc.get` (bảng tổng hợp, báo cáo) chưa được rà theo quyền xem PO.
