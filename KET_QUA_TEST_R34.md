# Kết quả kiểm thử — R3.4

Môi trường chạy: Linux x64 (kernel 6.18), Node v22.22.0, Playwright 1.63.0, Chromium 153. **Không phải Google Apps Script thật, không phải Windows.** Backend chạy trong `vm` của Node với Sheet/Cache/Lock/Properties giả. Ngày chạy: 26/10/2026.

Quy ước: **PASSED** = chạy xong và mọi khẳng định đúng · **FAILED** = có khẳng định sai · **BLOCKED** = môi trường không cho kiểm (không tính là đạt).

## 1. Bộ test Node (`4_TESTS/run-all.cjs`)

| Lượt chạy | Backend dùng | Kết quả |
|---|---|---|
| Bản thường | `1_BACKEND/Backend.gs` (mặc định) | **PASSED** 63/63 tệp · FAILED 0 · BLOCKED 0 |
| Bản an toàn khi dán | `BACKEND_SRC=…/AN_TOAN_KHI_DAN/Backend.gs` (đường dẫn tuyệt đối) | **PASSED** 63/63 tệp · FAILED 0 · BLOCKED 0 |

Tệp dùng `BACKEND_SRC` để đổi bản Backend: mọi test engine thật/giả (`fx-*.test.cjs`, `passthrough`, `r34-*`, `schema`, …). Tệp kiểm cú pháp (`syntax*.test.cjs`) và `dupfn.test.cjs` tự đọc cả hai bản.

Kiểm cú pháp bằng trình phân tích thật (acorn 8.18.0, ES2019, ghim SHA256 trong `4_TESTS/vendor/PARSER_PIN.json`): **PASSED** — 40 mục biên dịch, 0 lỗi; parser thiếu hoặc bị sửa → **BLOCKED** (thoát 3), có test riêng (`syntax-parser.test.cjs`, 21 khẳng định, PASSED). Trùng tên hàm (`dupfn.test.cjs`): **PASSED**, không có.

## 2. Test mới / mở rộng ở R3.4

| Tệp | Nội dung | Số khẳng định | Kết quả |
|---|---|---|---|
| `r34-bugs.test.cjs` | B1–B4 (xem BAO_CAO_SUA_LOI_R34 mục 1) | 18 | **PASSED** trên bản sửa; **FAILED cả 4 ca trên R3.3** (đúng chủ đích: tái hiện lỗi) |
| `r34-migration.test.cjs` | M1–M6: ensureSchema lặp, nâng cấp CashCount cũ, tiêu đề sửa tay, giữ dữ liệu, quay lui R3.3 (cần `BACKEND_OLD`), installTriggers không trùng | 69 (71 khi có `BACKEND_OLD`) | **PASSED**; M5 chạy thật với `BACKEND_OLD` = Backend R3.3: PASSED; không đặt biến → ghi "bỏ qua", **không tính là đã kiểm quay lui** |
| `fx-scope.test.cjs` nhóm 12 | Cấp/thu hồi quyền có hiệu lực ở request kế tiếp (cache nóng), lệnh bị từ chối không đổi dữ liệu, đảo sai phiên bản/id lạ | 122 (cả tệp) | **PASSED** |
| `r34-slice.test.cjs` | Đọc chọn cột = đọc đủ cột; cache hỏng/thiếu vẫn đúng; rào phiên bản; thao tác tài chính không dùng đường chọn cột | 385 | **PASSED** |
| `r34-measure.test.cjs` | Đồng hồ từng bước, hàm đo staging | 15 | **PASSED** |
| `r34-draft.test.cjs` | Hạn nháp 30 ngày, cảnh báo, xuất | 29 | **PASSED** |
| `r34-tx-newtables.test.cjs` | requestId lặp, dừng trước/sau commit, phục hồi, trigger chạy trùng | 56 | **PASSED** |
| `passthrough.test.cjs`, `fx-pool.test.cjs` | Thu hộ/chi hộ (72), quỹ ngoại tệ bình quân (256, 18 nhóm) | 72 / 256 | **PASSED** |

Lệnh tái hiện lỗi trên bản cũ: `BACKEND_SRC=<Backend R3.3> node 4_TESTS/r34-bugs.test.cjs` → 4 dòng ✖ (B1–B4), mã thoát 1. Trên bản sửa → 4 dòng ✔, mã thoát 0.

## 3. Giao diện (Playwright + Chromium, Backend thật + Sheet giả)

| Lượt chạy | Kết quả |
|---|---|
| `5_UI_TESTS/ui.e2e.cjs` — bản thường | **PASSED** 31/31 nhóm, 294 khẳng định |
| `ui.e2e.cjs` — bản an toàn (`BACKEND_SRC` + `UI_HTML` trỏ `AN_TOAN_KHI_DAN`) | **PASSED** 31/31 nhóm, 294 khẳng định |
| `5_UI_TESTS/autosave.regression.cjs` | **PASSED** (autosave tuần tự; xung đột phiên bản giữa hai tab hiện rõ, không ghi đè im lặng) |
| `5_UI_TESTS/download.selftest.cjs` | **PASSED** 16 khẳng định (gồm: giả lập chặn tải → BLOCKED mã 3; chặn loopback → đo HTTP BLOCKED, đo setContent vẫn chạy, dọn tài nguyên) |
| `5_UI_TESTS/download.probe.cjs` (đối chứng trong BrowserContext của app, XLSX kiểm độc lập bằng zip + openpyxl) | **PASSED** (kết luận đối chứng: PASS) |
| Tải/xuất Excel trên **Windows + Excel thật** | **BLOCKED** — chưa có môi trường Windows; xem HUONG_DAN_TRIEN_KHAI_R34 mục 4 |

Ghi chú trung thực: lần chạy đầu của lượt R3.4, nhóm UI 23 FAILED do dữ liệu thử của chính test không có `fxSource='MOVING_AVG'` cho phiếu chi (sau sửa B4, chỉ phiếu ghi theo bình quân mới bị báo lệch). Đã sửa dữ liệu thử cho đúng thực tế, **không** nới điều kiện kiểm; chạy lại cả hai bản đều 31/31.

## 4. Hiệu suất (giả lập)
Xem `BAO_CAO_HIEU_SUAT_R34.md`: đường FULL so với R3.3 giống hệt về số lệnh đọc/số ô; đọc chọn cột tương đương về kết quả nhưng chưa chứng minh lợi ích → mặc định TẮT.

## 5. Chưa kiểm
Google Apps Script thật · Windows · Microsoft Excel · tải đồng thời nhiều người dùng · số đo hiệu năng thật · trình duyệt ngoài Chromium. Xem `HUONG_DAN_TRIEN_KHAI_R34.md` mục 8.
