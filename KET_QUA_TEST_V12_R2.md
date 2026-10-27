# Kết quả kiểm thử V12 — R2

**Môi trường thực tế:** Linux 6.18 (container, x64), Node v22.22.0, Playwright 1.63.0 + Chromium 153.0.8010.12, Python 3.13.17 + openpyxl 3.1.5. Backend thật chạy trong `vm` của Node với Sheet/Cache/Lock/Properties **giả**. **Không có bước nào chạy trên Google Apps Script/Google Sheets thật. Chưa chạy trên Windows/Chrome Windows** — lỗi `download.saveAs: canceled` bạn báo trên Windows **chưa được tái hiện và chưa được xác nhận là đã hết**.

Mỗi dòng dưới đây là **một lượt chạy riêng**; không cộng gộp.

## A. Backend (không UI)
| # | Lệnh (từ thư mục gốc gói) | Biến thể | Kết quả |
|---|---|---|---|
| 1 | `node 4_TESTS/run-all.cjs` | thường (`1_BACKEND`) | **PASSED 54/54 tệp** (49 tệp trước + `fx-scope`, `slice-read`, `schema`, `before-after`, `po-leak-scan`) |
| 2 | `BACKEND_SRC=<tuyệt đối>/AN_TOAN_KHI_DAN/Backend.gs node 4_TESTS/run-all.cjs` | an toàn khi dán | **PASSED 54/54**. 49/54 tệp nạp Backend qua `BACKEND_SRC`/`SRC`; đối chứng đặt đường dẫn sai → 49 tệp thất bại, chứng minh biến được dùng. **5 tệp không phụ thuộc biến** (số còn lại đều nạp biến): `bulk-template` (đọc `6_NGUON`), `dupfn` và `syntax` (đọc cố định cả hai biến thể), `sync` (dựng lại từ `6_NGUON`), `einvoice-xml` (không dùng Backend) |
| 3 | `node 4_TESTS/fx-scope.test.cjs` | thường | PASSED 11/11 nhóm, 105 khẳng định |
| 4 | `BACKEND_SRC=<Backend của congno_deploy_v12_FIXED.zip> node 4_TESTS/fx-scope.test.cjs` | **ZIP đầu vào** | **FAILED 10/11 nhóm** (nhóm 1 thất bại đúng tại "người hẹp quyền bị từ chối"; nhóm 2 thất bại tại API preview) — chứng minh test bắt được lỗi trên bản gốc |
| 5 | `node 4_TESTS/po-scope.test.cjs` trên bản thường và trên ZIP đầu vào | cả hai | PASSED 11/11 ở cả hai (PO-scope/điều chỉnh đã được sửa đúng ở bản FIXED, R2 giữ nguyên) |
| 6 | `node 4_TESTS/slice-read.test.cjs` / `schema.test.cjs` / `before-after.test.cjs` | thường | PASSED 6/6 (40 kh.) · 4/4 (56 kh.) · 4/4 (41 kh.) |
| 7 | `BACKEND_SRC=…/AN_TOAN_KHI_DAN/Backend.gs node 4_TESTS/<mỗi tệp trên>` | an toàn | PASSED (gồm trong lượt 2) |

## B. Giao diện (Chromium/Playwright; Backend thật + Sheet giả)
| # | Lệnh | Biến thể | Kết quả |
|---|---|---|---|
| 8 | `node 5_UI_TESTS/ui.e2e.cjs` | thường | **PASSED:** 21/21 nhóm đạt; 195 khẳng định trong lượt chạy này (Backend thật + Sheet giả, chưa phải Apps Script thật) (gồm nhóm 16 tải XLSX đầy đủ và nhóm 17–18 XML) |
| 9 | `UI_HTML=…/AN_TOAN_KHI_DAN/index.html BACKEND_SRC=…/AN_TOAN_KHI_DAN/Backend.gs node 5_UI_TESTS/ui.e2e.cjs` | an toàn | **PASSED:** 21/21 nhóm đạt; 195 khẳng định trong lượt chạy này (Backend thật + Sheet giả, chưa phải Apps Script thật) |
| 10 | `node 5_UI_TESTS/autosave.regression.cjs` | thường | PASSED 2/2 (nhập đầu + yêu cầu chậm tuần tự; xung đột hai phiên không ghi đè) |
| 11 | như lượt 10 với `UI_HTML`/`BACKEND_SRC` an toàn | an toàn | PASSED 2/2 |
| 12 | `node 5_UI_TESTS/download.probe.cjs` | — | PASSED: 5 đối chiếu A–E tải được (tệp thường HTTP, Blob nhỏ trong trang HTTP và `setContent`, Blob `.xlsx` ở hai kiểu trang) |
| 13 | `KATY_SIMULATE_NO_DOWNLOADS=1 node 5_UI_TESTS/ui.e2e.cjs` | giả lập môi trường chặn tải | **BLOCKED (có chủ đích, để kiểm bộ chẩn đoán):** 20/21 nhóm đạt, 1 nhóm BỊ CHẶN (chưa xác minh); 172 khẳng định trong lượt chạy này (Backend thật + Sheet giả, chưa phải Apps Script thật); nhóm 16 báo BỊ CHẶN kèm bằng chứng, mã thoát 3 |
| 14 | `PYTHON=/khong/co node 5_UI_TESTS/ui.e2e.cjs` | thiếu Python | **BLOCKED:** 20/21 nhóm đạt, 1 nhóm BỊ CHẶN (chưa xác minh); 185 khẳng định trong lượt chạy này (Backend thật + Sheet giả, chưa phải Apps Script thật); mã thoát 3 |
| 15 | `UI_HTML/BACKEND_SRC` = bản của ZIP đầu vào, `node 5_UI_TESTS/ui.e2e.cjs` | **ZIP đầu vào** | **FAILED:** 20/21 nhóm đạt; 190 khẳng định trong lượt chạy này (Backend thật + Sheet giả, chưa phải Apps Script thật) — nhóm 21 (kiểm quyền bút toán trên giao diện) thất bại trên bản gốc, đạt trên bản sửa |

## C. Kiểm tra cấu trúc gói
- `4_TESTS/syntax.test.cjs`: biên dịch Backend/Gateway cả hai biến thể và mọi khối `<script>` JavaScript trong `index.html`/`luong-nghiep-vu.html` (bỏ khối JSON): 34 khối, 0 lỗi.
- `4_TESTS/dupfn.test.cjs`: không khai báo trùng tên hàm cấp cao.
- `4_TESTS/sync.test.cjs`: dựng lại từ `6_NGUON` bằng `build.py` trong thư mục tạm; 8 tệp (`1_BACKEND`, `2_GATEWAY`, `AN_TOAN_KHI_DAN`) khớp SHA-256 byte-theo-byte và Backend chứa nguyên văn `hak-format.js`.
- Hash: `3_TAI_LIEU/SHA256.txt` xác minh lại **sau khi đóng gói** (giải nén ZIP vào thư mục tạm rồi `sha256sum -c`; kết quả ghi ở phần "Kiểm tra sau đóng gói" bên dưới).

## D. Tái hiện lỗi P1/P2 trên ZIP đầu vào
Kịch bản `fx-scope.test.cjs` nhóm 1: AR p1 và AP p2 mỗi chứng từ 1.000 USD, tỷ giá 25.000 → 26.000; người đủ quyền lập 2 nháp (AR lãi, AP lỗ); tài khoản chỉ có p2/G1 gọi `fxEntryCreate_`. ZIP đầu vào: **không bị từ chối**, nháp AR cũ bị thay (mất). Bản sửa: `FORBIDDEN`, 2 nháp giữ nguyên id/phiên bản/số tiền, không có thay đổi nào trong FxEntry, DebtDoc, Config, FxRate, Allocation, Payment (so sánh nguyên văn trước/sau).

## E. Chưa xác minh / BỊ CHẶN
- Tất cả những gì cần Google thật: `GOOGLEFINANCE`, trigger 10 phút, `ensureSchema()`, Web app, hiệu năng thực.
- Tải XLSX trên Chrome Windows (cần chạy `download.probe.cjs` + `ui.e2e.cjs` trên máy đó).
- Quyền xem PO: đã quét mọi API đọc, bảng tổng hợp và báo cáo R01–R14 bằng dữ liệu giả (mục G); chưa kiểm trên dữ liệu thật và ID đơn/khoản/chứng từ/phiếu/đối tác ẩn đã được đồng nhất NOT_FOUND ở các đường theo ID (báo cáo mục 10–11).

## G. Quét quyền PO toàn hệ thống (R2.1)
- `node 4_TESTS/po-leak-scan.test.cjs` (thường) → **PASSED 11/11 nhóm, 22 khẳng định**; với `BACKEND_SRC` an toàn → PASSED (trong lượt 2). Trên Backend của ZIP FIXED: **FAILED nhóm 6, 7** (thông báo lỗi nhập hàng loạt và chia chi phí lộ sự tồn tại/số đơn của đơn ngoài phạm vi); nhóm 1–5 đạt trên cả hai. Nhóm 8 (NOT_FOUND theo ID đơn/khoản, R2.2) thất bại trên bản R2.1; nhóm 9 (NOT_FOUND theo ID chứng từ/phiếu/đối tác/phân bổ, R2.3) thất bại trên bản R2.2; cả hai đạt trên R2.3. Chi tiết phạm vi quét ở `BAO_CAO_SUA_LOI_V12_R2.md` mục 9.
- Sau thay đổi R2.1, R2.2, R2.3 chạy lại: `run-all` 54/54 (thường) và 54/54 (an toàn); UI thường 21/21 nhóm, 195 khẳng định; UI an toàn 21/21, 195; autosave 2/2 cả hai bản (các lượt riêng, cùng môi trường như mục A–B).

## H. Tương thích trình phân tích Apps Script (R2.4)
- `node 4_TESTS/syntax.test.cjs` → **PASSED**: 38 khối, 0 lỗi; gồm phân tích `Backend.gs`/`Gateway.gs` (cả bản thường và an toàn) ở mức **ES2019** bằng `espree`. Trên Backend của R2.3 test **thất bại** (cú pháp ES2020 `??`/`1n`); sau sửa đạt. Chạy lại sau R2.4: `run-all` 54/54 (thường) và 54/54 (an toàn); UI thường 21/21 nhóm 195 khẳng định; UI an toàn 21/21 nhóm 195 (các lượt riêng).
- **Chưa xác minh:** dán thật vào trình soạn thảo Apps Script (không có tài khoản Google trong môi trường này).

## F. Kiểm tra sau đóng gói (`congno_deploy_v12_FIXED_R2.zip`)
Giải nén ZIP vào thư mục tạm mới: `sha256sum -c 3_TAI_LIEU/SHA256.txt` → **26/26 tệp OK** (0 lệch); `node 4_TESTS/run-all.cjs` từ bản giải nén → **54/54**; cùng lệnh với `BACKEND_SRC` trỏ Backend an toàn trong bản giải nén → **54/54** (gồm `sync.test.cjs` dựng lại từ `6_NGUON` và so hash). UI không chạy lại từ bản giải nén (tệp UI/test không đổi sau các lượt B).

## I. R2.5 (lỗi HtmlTemplate `<?xml`)
- run-all: 54/54 (bản thường và bản an toàn); syntax.test: 40 khối, 0 lỗi, gồm kiểm tra "không còn `<?` lạ" trong index.html.
- UI e2e: 21/21 nhóm, 195 khẳng định; autosave: PASS. (Backend thật + Sheet giả; chưa chạy trên Apps Script thật.)

## J. R2.6 (Thu hộ / Chi hộ, menu ERP)
- run-all: 55/55 (bản thường và bản an toàn), thêm `passthrough.test.cjs` (9 nhóm, 69 khẳng định: tổng/tuổi/trạng thái, ghép một phần, từ chối, xác nhận khác đơn, gỡ ghép và chặn hủy, gợi ý, phạm vi/quyền, báo cáo, lược đồ).
- UI e2e: 22/22 nhóm, 211 khẳng định (nhóm 22: menu gập/mở, đường dẫn trang, ghép–gỡ trên giao diện, hai tab đối chiếu); autosave PASS. Backend thật + Sheet giả, chưa chạy trên Apps Script thật.

## K. R2.8 (bình quân di động)
- run-all 56/56 (thường + an toàn), thêm `fx-pool.test.cjs` (6 nhóm, 52 khẳng định, kiểm tra số cụ thể: 24.000 + 25.000 → bình quân 24.333,3333; chi 600 USD ghi 14.600.000; chi hết lấy đúng phần còn lại; lãi phân bổ 400.000; thu lùi ngày → bình quân 24.388,2353 và tính lại ổn định). Cập nhật `fx.test`/`fx-scope.test` cho bút toán đánh giá lại quỹ.
- UI e2e 23/23 nhóm, 218 khẳng định (nhóm 23: thẻ Quỹ ngoại tệ, báo lệch, tính lại, sổ quỹ). Dữ liệu giả, chưa chạy trên Apps Script thật.

## L. R2.9 (chuyển quỹ)
- run-all 56/56 (thường + an toàn); `fx-pool.test.cjs` nay 9 nhóm, 97 khẳng định (chuyển 400 USD QU→QU2 theo bình quân 24.333,3333 = 9.733.333 VND; kiểm tra dữ liệu/quyền/kỳ khóa/đảo/xóa nháp; quá số dư; thu lùi ngày → tính lại 2 phiếu, ổn định).
- UI e2e 24/24 nhóm, 227 khẳng định (nhóm 24: lập phiếu, người lập không tự ghi nhận, người khác ghi nhận, quỹ nhận có tồn đúng, đảo). Dữ liệu giả, chưa chạy trên Apps Script thật.

## M. R3.0 (mua/bán ngoại tệ, sổ quỹ)
- run-all 56/56 (thường + an toàn); `fx-pool.test.cjs` 12 nhóm, 154 khẳng định (bán 600 USD thu 15.300.000: giá vốn 14.600.000, lãi 700.000 vào bút toán `EXCH`; mua 200 USD trả 5.100.000: bình quân 24.545,4545; sổ quỹ VND/USD đúng tồn từng dòng, lọc kỳ, quyền).
- UI e2e 25/25 nhóm, 239 khẳng định (nhóm 25: lập – ghi nhận bởi người khác – lãi hiển thị, sổ quỹ tiền mặt, sổ quỹ USD, xuất Excel). Dữ liệu giả, chưa chạy trên Apps Script thật.

## N. R3.1 (đối chiếu ngân hàng, kiểm kê quỹ)
- run-all 56/56 (thường + an toàn); `fx-pool.test.cjs` 15 nhóm, 204 khẳng định (ghép sao kê, cân chênh lệch, chuyển tiếp khoản chỉ có trên sao kê, mở lại theo thứ tự, kiểm kê theo mệnh giá, giải trình, xác nhận khác người, sổ đổi thì lập lại, quỹ USD).
- UI e2e 26/26 nhóm, 253 khẳng định (nhóm 26: dán sao kê → ghép tự động → chênh lệch 0 → xác nhận; kiểm kê quỹ theo mệnh giá → giải trình → xác nhận → biên bản). Dữ liệu giả, chưa chạy trên Apps Script thật.

## O. R3.2
- run-all 56/56 (thường + an toàn); `fx-pool.test.cjs` 17 nhóm, 237 khẳng định (xử lý thiếu/thừa quỹ vào sổ quỹ, đảo, quỹ ngoại tệ/kỳ khóa chặn, tổng quan đối chiếu).
- UI e2e 27/27 nhóm, 264 khẳng định (nhóm 27: nạp sao kê CSV có tiêu đề phụ, đọc Excel, ghép → chênh lệch 0, tổng quan, xử lý kiểm kê hiện trong sổ quỹ). Dữ liệu giả, chưa chạy trên Apps Script thật.

## P. R3.3
- run-all 56/56 (thường + an toàn); `fx-pool.test.cjs` 18 nhóm, 245 khẳng định (thiếu 100 USD xuất 2.433.333 VND theo bình quân; thừa 100 USD nhập 2.600.000 VND theo tỷ giá 26.000 ngày kiểm kê; thiếu tỷ giá thì báo; đảo). UI e2e 27/27, autosave PASS. Dữ liệu giả.

## Q. R3.4
- run-all 56/56 (thường + an toàn); `passthrough.test.cjs` cập nhật theo nghĩa mới (72 khẳng định); UI e2e 28/28 nhóm, 269 khẳng định (nhóm 28: nhãn Chi hộ/Thu hộ theo loại khoản và chiều hóa đơn); autosave PASS.
