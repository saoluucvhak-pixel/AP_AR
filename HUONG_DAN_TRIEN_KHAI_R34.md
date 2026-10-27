# Triển khai, kiểm tra trên bản sao (staging), sao lưu và quay lui — R3.4

> Gói này **chưa được chạy trên Google Apps Script thật và chưa chạy trên Windows**. Mọi bước dưới đây trên Google/Windows là việc người triển khai phải làm và ghi kết quả. **Không triển khai thẳng lên bản chính.**
> Không dán `HMAC_SECRET` vào chat/tài liệu; đổi khóa (rotate), cùng một giá trị ở **cả hai** dự án (Gateway và Backend).

## 1. Sao lưu (bắt buộc, trước mọi thứ)
1. Trong Google Drive: *Make a copy* cho từng Spreadsheet `DB_MAIN`, `DB_AUDIT`, `DB_DRAFT` (nếu có). Đặt tên theo ngày, ví dụ `DB_MAIN_truoc_R34_2026-10-26`. Ghi lại ID.
2. Ghi lại **phiên bản đang deploy** của Backend và Gateway (Deploy → Manage deployments → số version) và export mã hiện tại (Project Settings → copy toàn bộ file).
3. Chạy `checkTriggers()` (chỉ đọc) và lưu kết quả; ghi số lượng trigger hiện có.
4. Ghi `dataVersion` từ màn Quản trị / `ops.status` để so sánh sau nâng cấp.

## 2. Dựng bản sao (staging)
1. Tạo **bản sao** của 3 Spreadsheet ở bước 1 (đây là DB staging) và một dự án Apps Script mới cho Backend, một cho Gateway. Script Properties trỏ vào DB **staging**: `DB_MAIN_ID`, `DB_AUDIT_ID`, `DB_DRAFT_ID`, `ENV=STAGING`, `HMAC_SECRET` (khóa riêng cho staging).
2. Dán Backend (`1_BACKEND/Backend.gs`) và Gateway/`index.html` (`2_GATEWAY/`). Nếu trình soạn thảo báo lỗi dán/cú pháp, dùng bộ **an toàn khi dán**: `AN_TOAN_KHI_DAN/` (đã bỏ chú thích; cùng chức năng). Không dán đè lên bản chính.
3. Chạy `ensureSchema()`. Kết quả mong đợi: mảng rỗng `[]`. Nếu có `SCHEMA_MISMATCH` (tiêu đề cột bị sửa tay) → **dừng**, đối chiếu tiêu đề với `parseCols_`, không xóa dữ liệu.
4. Thay đổi schema R3.4 so với R3.3: **không có bảng/cột mới** trong R3.4 (SCHEMA_VERSION vẫn `2.4`). Các bảng/cột thêm ở R3.0–R3.3 (PassLink, CashTransfer, CashExchange, BankRecon, CashCount và cột xử lý chênh lệch) nằm **cuối** bảng; `ensureSchema` chỉ thêm, không xóa/ghi đè.
5. Trigger: chạy `checkTriggers()`; nếu báo trùng hoặc thiếu mới chạy `installTriggers()` **một lần** (hàm tự xóa trigger của chính các hàm này rồi tạo đúng 1 bộ; trigger 10 phút là `recoverTrigger`). Chạy lại `checkTriggers()` để xác nhận: mỗi hàm đúng 1.

## 3. Kiểm tra trên staging (người thực hiện ghi PASSED / FAILED / BLOCKED từng mục)
| # | Việc | Mong đợi |
|---|---|---|
| 1 | So R01 (Phải thu/Phải trả theo tiền tệ), số dư vài khách/NCC, tổng phân bổ **trước/sau** | Giống hệt (R3.4 không đổi công thức công nợ) |
| 2 | Thu hộ/Chi hộ: ghép 2 khoản, thử giảm số tiền khoản đang ghép dưới phần đã ghép; thử hủy đơn có khoản đang ghép | Bị từ chối (`STATE_TRANSITION_INVALID` / `ORDER_HAS_PASS_LINKS`); gỡ ghép xong thì được |
| 3 | Kiểm kê quỹ → xác nhận → nhập một phiếu thu lùi ngày → bấm xử lý chênh lệch | Báo `STALE_COUNT`, phải lập biên bản kiểm kê mới |
| 4 | Tỷ giá → chọn "Theo tỷ giá ngày chi" → "Tính lại bình quân" | Không có phiếu chi nào bị đổi tỷ giá |
| 5 | Cấp/thu hồi quyền bút toán tỷ giá cho một user | Cấp: có hiệu lực ngay ở thao tác kế tiếp; thu hồi: bị chặn ngay |
| 6 | Bản nháp: để một nháp gần hết hạn (hoặc chỉnh ngày tạo trong bản sao) | Banner/thông báo cảnh báo; nút xuất `.json` mở được |
| 7 | Tải XLSX (Nhập hàng loạt, Sổ quỹ) bằng Chrome **trên máy Windows của người dùng**, mở bằng Excel | Mở được; số liệu đúng. Lỗi → mục 4 |
| 8 | GOOGLEFINANCE: Tỷ giá → "Lấy từ Google Finance" một ngày gần đây | Giá/ngày hợp lý |
| 9 | Hiệu năng: `measureDocList(30,false)` rồi (nếu muốn thử) `perfListSliceSet(true,1)` + `measureDocList(30,true)` | Xem `BAO_CAO_HIEU_SUAT_R34.md` mục 5; không bật slice nếu không tốt rõ rệt |
| 10 | Gửi lại cùng một thao tác ghi (mất mạng giữa chừng) | Không tạo bản ghi trùng (cùng `requestId` trả kết quả cũ) |

## 4. Kiểm tra tải xuống / Excel trên Windows (chưa xác minh trên Windows)
Máy Windows cần Node.js ≥ 18 và Playwright (`npm i playwright` rồi `npx playwright install chromium`). Từ thư mục gốc gói:
```
node 5_UI_TESTS\download.selftest.cjs     # tự kiểm công cụ chẩn đoán (hash, XLSX hợp lệ, bị chặn → BLOCKED)
node 5_UI_TESTS\download.probe.cjs        # đối chứng: nút tải của app so với blob/anchor mẫu trong CÙNG BrowserContext
node 5_UI_TESTS\ui.e2e.cjs                # nhóm 16 (chẩn đoán), 25 (xuất Excel), 29 (đường B64 dùng chung)
```
Đọc kết quả: `PASS` = tải được và XLSX hợp lệ (zip + đọc lại bằng thư viện độc lập); `FAIL` = công cụ phát hiện lỗi cụ thể; `BLOCKED` (mã thoát 3) = môi trường không cho kiểm (ví dụ chặn loopback, không cho tải) → **không phải PASS**, gửi nguyên văn kết quả. Nếu trình duyệt thật vẫn không tải được: kiểm tra Chrome ▸ Cài đặt ▸ Tải xuống (hỏi nơi lưu), chính sách chặn tải của máy, thư mục `%TEMP%` có ghi được không, phần mềm diệt virus chặn `.xlsx`. Gói **chưa** được chạy trên Windows; hành vi `showSaveFilePicker`/chặn tải theo chính sách cơ quan chỉ xác minh được trên máy thật.

## 5. Triển khai lên bản chính (sau khi staging đạt)
1. Thông báo ngừng nhập trong 15 phút. 2. Sao lưu lại như mục 1. 3. Dán Backend/Gateway/`index.html` vào dự án chính (bản mới nhất), `ensureSchema()` → `[]`. 4. Tạo **Version mới** (Deploy → Manage deployments → Edit → New version) cho Backend và Gateway. 5. `checkTriggers()` → mỗi hàm đúng 1. 6. Chạy mục 3 #1 và #10 trên bản chính. 7. Mở lại nhập liệu.

## 6. Quay lui
- **Mã:** Deploy lại version Backend/Gateway cũ (Manage deployments → chọn version cũ). Mã R3.3 **đọc được** DB đã qua `ensureSchema` của R3.4 vì cột/bảng mới chỉ nằm cuối và bản cũ chỉ kiểm tiêu đề đầu (`r34-migration.test.cjs` M5, chạy khi đặt `BACKEND_OLD`; kiểm trên Sheet giả).
- **Dữ liệu:** nếu cần trả đúng trạng thái trước nâng cấp, thay file `DB_*` bằng bản sao ở mục 1 (đổi `DB_MAIN_ID`… trong Script Properties). **Mất mọi thao tác ghi sau thời điểm sao lưu** — chỉ làm khi thật cần và sau khi xuất sổ phát sinh để nhập lại.
- Cờ thử nghiệm: tắt đọc chọn cột bằng `perfListSliceSet(false)` (không cần deploy lại).
- Sau quay lui chạy `checkTriggers()`; chạy `installTriggers()` nếu báo trùng/thiếu.

## 7. Xác minh gói và chạy test cục bộ
- Hash: `3_TAI_LIEU/SHA256.txt` (đường dẫn tính từ gốc gói). Linux/macOS: `sha256sum -c 3_TAI_LIEU/SHA256.txt`. Windows PowerShell: `Get-Content 3_TAI_LIEU\SHA256.txt | ForEach-Object { $h,$p = $_ -split '\s+',2; if ((Get-FileHash $p -Algorithm SHA256).Hash.ToLower() -ne $h) { "SAI: $p" } }`.
- Test: `node 4_TESTS/run-all.cjs` (bản thường); bản an toàn: `BACKEND_SRC=<đường dẫn tuyệt đối>/AN_TOAN_KHI_DAN/Backend.gs node 4_TESTS/run-all.cjs`. Mã thoát: 0 = tất cả PASSED, 1 = có FAILED, 3 = có BLOCKED (không tính là đạt).
- UI: `node 5_UI_TESTS/ui.e2e.cjs` (bản an toàn: thêm `BACKEND_SRC=…/AN_TOAN_KHI_DAN/Backend.gs UI_HTML=…/AN_TOAN_KHI_DAN/index.html`), `node 5_UI_TESTS/autosave.regression.cjs`.
- Tái hiện lỗi R3.4 trên bản cũ: `BACKEND_SRC=<Backend R3.3> node 4_TESTS/r34-bugs.test.cjs` phải THẤT BẠI.
- Dựng lại từ nguồn: `python 6_NGUON/build.py` (xem `4_TESTS/sync.test.cjs`).

## 8. Chưa xác minh (nêu thẳng)
1. **Chưa chạy trên Google Apps Script thật**: mọi test dùng Sheet/Cache/Lock/Properties giả. Hành vi khóa script, hạn mức thời gian 6 phút, độ trễ Sheets, giới hạn cache 100 KB/key chỉ kiểm được ở staging.
2. **Chưa chạy trên Windows**; chưa mở file `.xlsx` bằng Microsoft Excel (chỉ kiểm cấu trúc zip và đọc lại bằng thư viện độc lập).
3. **Chưa có số đo hiệu năng thật**: số trong báo cáo hiệu suất là giả lập; quyết định giữ slice TẮT dựa trên đó.
4. **GOOGLEFINANCE** chỉ kiểm bằng giả lập.
5. Các điểm chính sách chưa quyết (BAO_CAO_SUA_LOI_R34.md mục 3) cần kế toán trưởng xác nhận trước khi dùng cho báo cáo chính thức.
6. Quay lui bằng `BACKEND_OLD` chỉ chạy khi có bản R3.3 (không kèm trong gói).
7. Chưa kiểm tải đồng thời nhiều người dùng thật; chưa kiểm trình duyệt ngoài Chromium.
