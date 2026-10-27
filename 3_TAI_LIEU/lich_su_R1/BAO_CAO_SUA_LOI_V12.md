> **LỊCH SỬ — đã được thay bằng bản R2 (ở thư mục gốc gói).** Lưu ý: câu "không đổi schema" trong tài liệu này CHỈ đúng so với bản giao ngay trước đó; so với bản 12 cũ trước đợt Tỷ giá, schema đã đổi (xem tài liệu R2).

# Báo cáo sửa lỗi bản 12

> **Phạm vi xác minh.** Tôi nhận được prompt `PROMPT_SUA_LOI_TOI_UU_CONGNO_BAN_12.md` nhưng **không nhận được** `congno_deploy (12).zip` hay `BAO_CAO_TEST_CONGNO_BAN_12.md`. Tôi làm trên bản mã đang có trong phiên làm việc (cùng dòng phát triển, cũng 46 tệp test gốc, có nhúng `hak-format.js`). "Bản gốc" bên dưới là gói tôi đã giao ngay trước đợt này; số dòng có thể lệch vài chục dòng so với tham chiếu trong prompt. Mọi kiểm thử dùng Node + Sheet/Cache giả, **chưa chạy trên Google Apps Script/Google Sheets thật**.

## 1. Lỗi 1 — danh sách công nợ làm lộ thông tin PO ngoài quyền
- **Tái hiện (đã thành test):** `po-scope.test.cjs` nhóm 1–4, 9. Trên bản gốc, người chỉ có quyền NCC `p2`/nhóm `G1` gọi `docList_` AP nhận `orders` chứa `id`, `orderNo`, `poNo` của PO `o1` (thuộc khách `p1`), trong khi `orderGet_('o1')` trả `OUT_OF_SCOPE`.
- **Nguyên nhân:** `docOrderIndex_` đọc toàn bộ Order/Accrual/AccrualSplit, không áp phạm vi PO; mọi nơi dùng chỉ mục (hiển thị, ô tìm kiếm `q`, lọc `orderId`, `noOrder`, số lượng) đều thừa hưởng.
- **Sửa (`Backend.gs`):**
  - `docOrderIndex_(user, lines, ctx)` dùng đúng `orderInScope_` (cùng chính sách với `orderGet_`/`orderListData_`). PO ngoài phạm vi không vào danh sách `orders`, không vào `orderCount`, không vào chuỗi tìm kiếm, không khớp bộ lọc `orderId`. Chỉ ghi cờ `restricted`.
  - `docRowOut_` trả thêm `ordersRestricted` (boolean) để UI phân biệt "không gắn PO" với "có PO ngoài phạm vi xem" mà **không** lộ số lượng/định danh. UI (`docOrderCell`) hiển thị "PO ngoài phạm vi xem".
  - `noOrder`: chỉ khớp hóa đơn không có liên kết nào (kể cả liên kết bị giới hạn quyền); hóa đơn có PO ẩn không bị xếp nhầm là "chưa gắn PO".
  - `poRefs` (PO gửi NCC của khoản chi phí) chỉ trả khi khoản đó không gắn PO ẩn, vì có thể suy ra PO.
  - `docGet_`: số HSDV của dòng phí lấy từ Order chỉ khi Order trong phạm vi (trước đó đọc thẳng).
  - Hóa đơn AP hợp lệ **không bị loại** khỏi danh sách; liên kết nguồn không bị xóa/sửa.
- **Cache:** khóa đệm kết quả (`respKey_`) đã gồm `user.id`, `role`, `scope`; test nhóm 9 chạy `cachedRead_` với cache ấm giữa hai người khác phạm vi và xác nhận không lẫn dữ liệu. Chỉ mục PO **không** được lưu giữa các request (chỉ dựng trong một request) nên không có chỉ mục dùng chung cần giới hạn quyền.
- **Chưa kiểm/chưa sửa:** tôi chỉ rà `doc.list`/`doc.get`. Các màn khác lấy tên đơn qua đường riêng (ví dụ bảng tổng hợp `summary.*`, báo cáo) chưa được rà theo prompt này; nên rà tiếp trước khi cấp phạm vi hẹp cho người dùng thật.

## 2. Lỗi 2 — lọc PO bỏ sót chứng từ điều chỉnh/đảo
- **Tái hiện:** nhóm 5, 6, 7, 10. Điều chỉnh tăng/giảm và chứng từ đảo có dòng dùng `adjustsLineId`, không có `accrualId` → bản gốc không tra được PO: danh sách không lọc thấy, `orders` rỗng.
- **Sửa:** `lineAccrualIds_` lần theo `adjustsLineId` tới **đúng dòng gốc** (từng dòng, không lấy cả hóa đơn gốc), có memo theo dòng, giới hạn độ sâu 8, chống vòng lặp (`seen`), dòng gốc thiếu → không có PO. Không suy đoán theo đối tác/số tiền/ngày. Khoản chia nhiều PO lấy qua `AccrualSplit`; định danh được khử trùng lặp. Dữ liệu trả về vẫn qua bước quyền ở mục 1.
- **Hiệu năng:** `orderLinkCtx_` đọc Order/Accrual/AccrualSplit/DebtLine một lần mỗi request (qua `repoValid_`), không đọc theo từng dòng.
- **Số dư không đổi:** nhóm 8 so `totalsByCurrency`, `outstandingMinor`, `totalGrossMinor` giữa người đủ quyền và người hạn chế; không có công thức ledger nào bị sửa.
- **Thay đổi hành vi có chủ ý:** `noOrder` và bộ đếm PO giờ tính cả chứng từ điều chỉnh/đảo của hóa đơn có PO (trên dữ liệu thử 3.000 chứng từ, `noOrder` AR giảm từ 45 xuống 0 vì các điều chỉnh trước đây bị xếp nhầm là "chưa gắn PO").

## 3. Giao diện kiểm thử và tải biểu mẫu (mục 4 prompt)
- **Đường dẫn:** `ui.e2e.cjs` không còn ghi cứng `/home/user/...` và `/tmp/...`; dùng `__dirname` và `fs.mkdtempSync(os.tmpdir())`, chỉ xóa đúng thư mục do test tạo (cả ở `autosave.regression.cjs` và `bulk-template.test.cjs`).
- **Python:** thay `execSync("python3 - <<'PY' …")` bằng `spawnSync(exe, ['-I','-',...args], {input: script})`, kiểm tra mã thoát, thử `PYTHON` (nếu đặt), `python3`, `python`, `py`; không ghép lệnh shell. Thiếu Python/openpyxl → nhóm bị đánh dấu **BỊ CHẶN (chưa xác minh)** và mã thoát 3, không âm thầm đạt.
- **Điều tra `download.saveAs: canceled`:** lỗi không tái hiện được trên Linux (cả bản cũ lẫn bản mới tải được). Hai nguyên nhân khả dĩ: (a) test ghi cứng `/tmp/...` — thư mục không tồn tại trên Windows, nhiều khả năng là nguyên nhân chính; (b) ứng dụng thu hồi Blob URL sau 1–1,5 giây, có thể hủy tải trên máy chậm. **(a) là suy đoán chưa kiểm chứng trên Windows.** Tôi đã sửa test (thu thập `download.failure()`, URL, lỗi trang/console khi `saveAs` lỗi) và **gia cố ứng dụng** (b): `BLOB_URL_TTL_MS = 60000` cho cả tải biểu mẫu và `downloadB64`. Test mới khẳng định Blob URL chưa bị thu hồi sau 2,5 giây; test này **thất bại trên bản cũ** (thu hồi ở ~1,56 giây) và đạt trên bản mới, nên không phải assertion luôn đạt.
- Nhóm 16 chạy đủ luồng: tải mẫu, kiểm tra workbook (4 sheet, 23 cột), tạo tệp điền thử có ô ngày Excel thật bằng openpyxl, tải lên, xem trước, gắn PO, ghi 2 hóa đơn nháp/3 dòng, kiểm tra dữ liệu tạo ra.

## 4. Thay đổi khác
- `checkTriggers()` (chỉ đọc) liệt kê bộ kích hoạt, báo thiếu/trùng; không tạo/xóa gì. `installTriggers()` giữ nguyên (xóa các bộ kích hoạt của ứng dụng rồi tạo lại, nên không trùng).
- `run-all.cjs` và các test đọc `BACKEND_SRC`/`SRC` để chạy được trên bản an toàn khi dán (xem `KET_QUA_TEST_V12.md`).
- Thêm test: `po-scope.test.cjs` (73 khẳng định), `syntax.test.cjs`, `sync.test.cjs`; benchmark `bench/po.bench.cjs`.

## 5. Tệp/hàm bị ảnh hưởng
`Backend.gs`: `docOrderIndex_`, `orderLinkCtx_`, `lineAccrualIds_` (mới), `docList_`, `docRowOut_`, `docGet_`, `checkTriggers` (mới). `index.template.html`: `docOrderCell`, `downloadB64`, tải biểu mẫu (`BLOB_URL_TTL_MS`). Không đổi schema Sheets, không đổi công thức công nợ, quy đổi tiền tệ, duyệt/ghi nhận, khóa kỳ, phân bổ.

## 6. Hạn chế
- Chưa chạy trên Google thật; UI test chạy trên Chromium với backend thật + Sheet giả.
- Không giảm số ô đọc khi tải lạnh (xem `BAO_CAO_HIEU_SUAT_V12.md`).
- Không tuyên bố công nợ "không bao giờ sai" hay "realtime tuyệt đối"; bảng tổng hợp vẫn là snapshot làm mới định kỳ 10 phút/nút Làm mới.
