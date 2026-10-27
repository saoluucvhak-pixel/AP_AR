# Triển khai, kiểm tra trên bản sao (staging) và quay lui — V12 R2

Không bước nào dưới đây đã được chạy trên Google thật; đây là hướng dẫn để bạn tự thực hiện trên **bản sao Sheets/staging** trước, rồi mới làm trên bản chính.

## 1. Sao lưu (bắt buộc)
1. File → Make a copy cho 3 bảng tính: Dữ liệu (MAIN), Nhật ký (AUDIT), DRAFT/XEM NHANH. Chạy sao lưu của ứng dụng (Hệ thống → Sao lưu).
2. Ghi lại số phiên bản (Deploy → Manage deployments) của Backend và Gateway đang chạy, giá trị `SCHEMA_VERSION` hiện tại (Hệ thống → Trạng thái) và ảnh chụp tổng Phải thu/Phải trả theo từng tiền tệ (R01) để đối chiếu sau.
3. Làm toàn bộ trên **bản sao**: tạo project Apps Script thử trỏ tới bản sao dữ liệu (đổi `DB_MAIN_ID`, `DB_AUDIT_ID`, `DB_DRAFT_ID` trong Script Properties của project thử). Không cài trigger trên project thử cho tới bước 5.

## 2. Thay đổi schema (so với bản 12 TRƯỚC đợt Tỷ giá) — KHÔNG phải "không đổi schema"
`SCHEMA_VERSION`: 2.2 → **2.3**.
| Mục | Thay đổi | Ghi chú |
|---|---|---|
| Bảng mới `FxRate` | `id, rateDate, currency, rateE4, source, note` + cột hệ thống | tạo tự động khi `ensureSchema()` |
| Bảng mới `FxEntry` | `id, periodId, entryType, currency, direction, foreignMinor, rateE4, amountBaseMinor, status, reversesId, asOf, note` + cột hệ thống | tiền tố ID `fxr`, `fxe`; không vào cache bảng |
| Cột thêm cuối `Payment` | `fxRateE4, fxSource, amountBaseMinor` | sau cột hệ thống; dòng cũ để trống (đọc là 0/rỗng) |
| Cột thêm cuối `DebtDoc` | `fxRateE4, fxSource, totalBaseMinor` | như trên |
| Cột thêm cuối `Allocation` | `fxPayRateE4, fxDocRateE4, fxDiffBaseMinor` | như trên |
| Config mới (tùy chọn) | `fx.entry.grants` | cấp quyền bút toán tỷ giá (mục 4) |
| Quyền mới | `fx.entry.read/write/post/reverse`, `fx.backfill`, `fx.write` | `fx.post` cũ đã gỡ |
**Migration:** chỉ **thêm** bảng/cột; không xóa, không sửa dữ liệu; `ensureSchema()` kiểm tiêu đề trước (lệch thì dừng, không ghi), chạy lại bao nhiêu lần cũng an toàn. Bút toán POSTED cũ (nếu có) không bị đụng. Bản nháp bút toán cũ phải được lập lại hoặc khớp kiểm tra khi ghi nhận (STALE_DRAFT nếu không khớp).
**Quay lui schema:** bản Backend cũ bỏ qua các cột/bảng thừa (không lỗi); dữ liệu tỷ giá vẫn nằm trong Sheets. Không xóa cột thủ công. Muốn quay về hẳn: khôi phục từ bản sao ở mục 1.

## 3. Thứ tự triển khai (trên bản sao rồi bản chính)
1. Dán `1_BACKEND/Backend.gs` (hoặc `AN_TOAN_KHI_DAN/Backend.gs` nếu trình soạn thảo làm mất xuống dòng). Chạy `ensureSchema()` → xem Nhật ký thực thi: "Đã kiểm tra đủ … bảng, tiêu đề cột khớp" thì tiếp tục; "LỆCH SCHEMA" thì DỪNG.
2. Deploy Backend: Manage deployments → Edit → New version. Gateway: dán `Gateway.gs`, `index.html`, `luong-nghiep-vu.html` → New version. Ctrl+F5.
3. Nếu hệ thống chạy từ bản trước đợt Tỷ giá: chạy menu Tỷ giá → "Điền tỷ giá cho chứng từ ngoại tệ cũ" (cần quyền `fx.backfill`); kỳ đã khóa tự bỏ qua.

## 4. Cấp quyền bút toán chênh lệch tỷ giá
Mặc định chỉ **ADMIN có phạm vi toàn công ty** dùng được. Người khác phải đồng thời: (a) có phạm vi toàn công ty (`allPartners` bật và **không** giới hạn nhóm nghiệp vụ) và (b) được cấp quyền.
- Cấp: ADMIN gọi `fx.grants.set` (payload `{userId, perms:[…]}`) hoặc, trong trình soạn thảo, chạy `fxGrantEntryPerms('email@congty.vn', ['fx.entry.read','fx.entry.write'])`. Thu hồi: gửi `perms: []`. Xem: `fx.grants.get`.
- Nên tách: người lập có `fx.entry.read` + `fx.entry.write`; người ghi nhận khác có `fx.entry.read` + `fx.entry.post` (+ `fx.entry.reverse`). Người lập không tự ghi nhận được.
- Kiểm tra: đăng nhập tài khoản hẹp quyền → màn Tỷ giá không hiện khối bút toán; gọi API trực tiếp trả `FORBIDDEN`.

## 5. Trigger 10 phút (không tạo trùng)
1. Chạy `checkTriggers()` (chỉ đọc) → xem log: `ok:true` là đủ 5 bộ kích hoạt, mỗi loại 1 bản (`recoverTrigger` mỗi 10 phút).
2. Chỉ khi báo thiếu/trùng mới chạy `installTriggers()` một lần (xóa các bộ kích hoạt của ứng dụng rồi tạo lại đúng 1 bản mỗi loại; chạy lại an toàn). Chạy lại `checkTriggers()` để xác nhận.
3. Trên **bản sao/staging** có thể chưa cần cài trigger; khi cài, kiểm tra trang Triggers của Apps Script không có hàm trùng.

## 6. Kiểm tra trên staging (người thực hiện ghi kết quả)
1. **Đối chiếu số dư:** so R01 (Phải thu/Phải trả theo tiền tệ), số dư vài khách/NCC, tổng phân bổ **trước và sau** nâng cấp: phải giống hệt (nâng cấp không đổi công thức công nợ).
2. **Quyền PO:** tài khoản chỉ có phạm vi một NCC mở Phải trả: thấy hóa đơn, không thấy mã/số PO của khách khác, thấy "PO ngoài phạm vi xem"; tìm số PO ẩn không ra kết quả; mở/sửa đơn, chứng từ, phiếu hoặc đối tác bằng ID ngoài phạm vi báo "Không tìm thấy …" giống ID không tồn tại.
3. **Bút toán tỷ giá:** (a) tài khoản đủ quyền xem trước tháng có công nợ ngoại tệ; (b) người lập tạo nháp, người khác ghi nhận; (c) đổi tỷ giá cuối tháng sau khi lập nháp rồi ghi nhận → phải báo "đã thay đổi, lập lại"; (d) kỳ đã khóa không ghi/đảo được.
4. **Tải XLSX:** Nhập hàng loạt → tải biểu mẫu `.xlsx` bằng Chrome trên máy Windows của người dùng, mở được trong Excel. Nếu lỗi tải, chạy `node 5_UI_TESTS/download.probe.cjs` trên máy đó và gửi kết quả.
5. **GOOGLEFINANCE:** menu Tỷ giá → "Lấy từ Google Finance" cho một ngày gần đây; kiểm tra giá/ngày hợp lý.
6. **Hiệu năng:** chạy `measureSystem()` trên bản thử, lưu số đo (số lần đọc Sheet/ô đọc) để so sánh với `BAO_CAO_HIEU_SUAT_V12_R2.md`.

## 7. Quay lui
Deploy lại phiên bản Backend/Gateway cũ ghi ở mục 1 (Manage deployments → version cũ). Dữ liệu mới (tỷ giá, bút toán nháp/đã ghi) vẫn nằm trong Sheets nhưng bản cũ không dùng; nếu cần trả đúng trạng thái trước nâng cấp thì khôi phục từ bản sao mục 1 (dữ liệu nhập sau đó sẽ mất — chốt thời điểm quay lui với kế toán). Cấp quyền ở Config `fx.entry.grants` không ảnh hưởng bản cũ.

## 8. Xác minh hash và chạy test cục bộ
- `3_TAI_LIEU/SHA256.txt` (đường dẫn tính từ gốc gói, trên byte tệp cuối): Linux/macOS `sha256sum -c 3_TAI_LIEU/SHA256.txt`; Windows PowerShell: `Get-Content 3_TAI_LIEU\SHA256.txt | ForEach-Object { $h,$p = $_ -split '\s+',2; if ((Get-FileHash $p -Algorithm SHA256).Hash.ToLower() -eq $h) {"OK  $p"} else {"LỆCH $p"} }`.
- Test: `node 4_TESTS/run-all.cjs` (54 tệp; biến thể an toàn: `BACKEND_SRC=<đường dẫn tuyệt đối>/AN_TOAN_KHI_DAN/Backend.gs node 4_TESTS/run-all.cjs`); UI: `node 5_UI_TESTS/ui.e2e.cjs`, `node 5_UI_TESTS/autosave.regression.cjs`, `node 5_UI_TESTS/download.probe.cjs`. Cần Node ≥ 20, `playwright` + Chromium, Python 3 + `openpyxl` (hoặc đặt biến `PYTHON`). Không chạm Google, không cài trigger, không dùng dữ liệu thật.
- Dựng lại từ nguồn: `python 6_NGUON/build.py` (thư mục gốc gói ngang `6_NGUON`; `4_TESTS/sync.test.cjs` làm việc này trong thư mục tạm và so hash). Backend nguồn có điểm nhúng `hak-format.js`.
