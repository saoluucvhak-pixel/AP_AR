# Báo cáo sửa lỗi V12 — lần 2 (R2)

**Phiên bản tài liệu: R2.4 (mục 12: sửa lỗi dán vào Apps Script "Unexpected token ILLEGAL"; mục 9: rà quyền xem PO ở các màn khác; mục 10: đồng nhất NOT_FOUND theo ID đơn/khoản; mục 11: đồng nhất cho chứng từ, phiếu, đối tác).** **Đầu vào:** đúng `congno_deploy_v12_FIXED.zip` (SHA-256 `42e5e5f9…c746cd718`; `1_BACKEND/Backend.gs` `6db632c3…3e5c9`), được giữ nguyên bản gốc làm đối chứng tại `4_TESTS/baseline/Backend_v12_FIXED_goc.gs`. Không nhận được `BAO_CAO_KIEM_TRA_V12_FIXED.md`. Mọi kiểm thử dùng Node + Sheet/Cache giả; **chưa chạy trên Google thật, chưa chạy trên Windows**.

## 1. P1 — Người hẹp quyền thay thế bút toán nháp toàn kỳ
**Tái hiện:** `4_TESTS/fx-scope.test.cjs` nhóm 1, 2. Trên ZIP đầu vào, `fxEntryCreate_` bởi tài khoản chỉ có phạm vi p2/G1 **không bị từ chối** và thay toàn bộ nháp của kỳ; nhóm 1 thất bại đúng tại khẳng định "người hẹp quyền bị từ chối". Đạt trên bản sửa.

**Nguyên nhân:** đánh giá lại (`fxRevalLines_`) tính trên sổ giới hạn quyền người gọi (`loadLedger_(user)`), trong khi hủy nháp theo `periodId` toàn cục và phần REALIZED quét `Allocation` toàn cục → ba thành phần dùng ba phạm vi khác nhau.

**Chính sách cuối cùng (bút toán tỷ giá = bút toán tổng hợp toàn công ty):**
| Quyền | Ý nghĩa | ADMIN mặc định | Người khác |
|---|---|---|---|
| `fx.entry.read` | xem trước, liệt kê | có | chỉ khi được cấp |
| `fx.entry.write` | tạo/lập lại nháp | có | chỉ khi được cấp |
| `fx.entry.post` | ghi nhận | có | chỉ khi được cấp |
| `fx.entry.reverse` | đảo bút toán đã ghi nhận | có | chỉ khi được cấp |
| `fx.backfill` | điền tỷ giá cho chứng từ cũ (sửa chứng từ nguồn toàn cục) | có | chỉ khi được cấp |
- Điều kiện chung **mọi** hành động: phạm vi toàn công ty = `allPartners:true` **và** không giới hạn nhóm nghiệp vụ (`businessGroups` rỗng). `allPartners:true` + chỉ một số nhóm **không** được coi là toàn công ty; `partnerIds/partnerTags` không có hiệu lực khi đã `allPartners`. Kiểm tra tập trung ở `fxEntryGate_` (không hardcode email), chạy **trước** khi tính hoặc ghi.
- Quyền nhập/tra tỷ giá thường (`fx.write`, `fx.list`, R13/R14 theo phạm vi người xem) giữ chính sách cũ, không đóng chức năng.
- Không tự cấp quyền mới cho ACCOUNTANT/APPROVER: `fx.post` cũ đã bị gỡ khỏi APPROVER. Cấp quyền: Config `fx.entry.grants` = JSON `{"<userId>":["fx.entry.read",…]}` qua API `fx.grants.set` (cần `user.manage`, có audit) hoặc hàm `fxGrantEntryPerms(email, perms)` chạy trong trình soạn thảo. Cấp quyền cho tài khoản hẹp quyền **không có tác dụng** (cổng phạm vi chặn). `app.bootstrap` trả `user.fx` (các cờ hiệu lực) để giao diện ẩn/hiện.
- Người lập không tự ghi nhận (`SELF_APPROVAL_FORBIDDEN`) giữ nguyên; chưa có ngoại lệ quản trị nào cho bút toán tỷ giá nên ADMIN cũng không tự ghi nhận bản mình lập.

**Giao dịch và trạng thái:**
- `fxEntryCreate_`: **tính lại bên trong `runTx_` (đang giữ khóa)**, không dùng ảnh chụp trước khóa; chỉ hủy mềm (`isDeleted=1`, `CANCELLED`) các nháp (`DRAFT`) của kỳ; không đụng `POSTED`/`REVERSED`. Hai người tạo cùng kỳ: tuần tự dưới khóa, người sau thay nháp của người trước, không nhân đôi. Cùng `requestId`: engine trả lại kết quả cũ (kiểm bằng engine giao dịch thật, nhóm 11).
- `fxEntryPost_` so sánh hai thứ trước khi ghi: (1) **chữ ký bản nháp** `draftSig` = băm (id, phiên bản, số tiền) các nháp mà người ghi nhận đã xem (bắt buộc gửi kèm; thiếu → từ chối); (2) **tính lại từ dữ liệu nguồn hiện hành** (tỷ giá, chứng từ, số dư, phân bổ, bút toán đã ghi nhận) và so khớp từng dòng (loại, tiền tệ, chiều, liên kết đảo, số tiền, nguyên tệ, tỷ giá). Khác → `STALE_DRAFT`, yêu cầu lập lại. Nháp "di sản" do bản cũ lập (không có thông tin kiểm tra) không được coi là hợp lệ: nó chỉ ghi nhận được nếu khớp tính lại (`schema.test.cjs` nhóm 4). Không thêm cột để khóa phiên bản nguồn, nên **không cần migration cho việc này**.
- `fxEntryReverse_`: bắt buộc `ifVersion`, kiểm tra kỳ khóa, giữ liên kết `reversesId`, audit; không xóa/ghi lại bản POSTED.
- **Đảo kỳ trước:** lỗi cũ — nháp đảo (`DRAFT`) của chính kỳ này chặn việc dựng lại, nên tạo lại nháp làm mất dòng đảo. Nay chỉ bản đảo `POSTED` mới chặn; nháp (kể cả đã hủy mềm) không chặn; còn hiệu lực thì được thay thế khi tạo lại, không trùng (`fx-scope` nhóm 7).

## 2. P2 — Chặn xem số liệu tỷ giá ngoài quyền ở mọi API
Áp cùng cổng cho `fx.entryPreview`, `fx.entryList`, `fx.entryCreate`, `fx.entryPost`, `fx.entryReverse`, `fx.backfill`. Từ chối ở backend, trước khi tính/ghi; test gọi trực tiếp bằng 6 loại tài khoản (hẹp quyền p2/G1 dù đã cấp quyền, allPartners nhưng giới hạn nhóm, APPROVER chưa cấp, ACCOUNTANT mặc định, EXEC, AUDITOR) × 6 API, kiểm chứng toàn bộ dữ liệu (FxEntry, DebtDoc, Config, FxRate, Allocation, Payment) **không đổi** sau các lần từ chối; người lập, người ghi nhận, người đảo, ADMIN dùng được đúng phần quyền của mình (`fx-scope` nhóm 2–3).
- `fxBackfill_`: cần `fx.backfill` + toàn công ty; **bỏ qua chứng từ thuộc kỳ đã khóa** (báo `skippedClosed`); mỗi lần sửa tăng phiên bản và có audit; chỉ ghi các trường tỷ giá, không đụng số tiền công nợ.
- Cache/báo cáo/bootstrap: các API bút toán không nằm trong `RC_ACTIONS_` (không có cache kết quả dùng chung); `app.bootstrap` chỉ trả cờ quyền; R13/R14 và xuất báo cáo vẫn tính trên sổ theo phạm vi người xem (test nhóm 10: người p2 chỉ thấy "Phải trả").
- Còn lại, ngoài phạm vi sửa này: nhật ký audit (`audit.list`) của hành động `fx.entry*` chứa tổng số tiền; người có `audit.read` xem được theo chính sách audit hiện hành.

## 3. Tải XLSX trên Windows
**Chưa xác minh được trên Chrome Windows; không kết luận đã sửa.** Chỉ có Linux trong môi trường này, nơi cả luồng tải mẫu của ứng dụng và mọi đối chứng đều tải được.
- Thêm bộ chẩn đoán cùng browser context: `5_UI_TESTS/download.probe.cjs` + `_download_probe.cjs` với 5 đối chứng — A tệp thường qua HTTP có `Content-Disposition`, B Blob nhỏ trong trang HTTP, C Blob nhỏ trong `setContent` (`blob:null`), D/E Blob `.xlsx` đúng MIME ở hai kiểu trang — và, khi tải mẫu của ứng dụng thất bại, F: chính byte workbook ứng dụng vừa sinh phát lại qua Blob trong trang trống. In môi trường: Node, Playwright, phiên bản trình duyệt, hệ điều hành, đường dẫn đích và quyền ghi, `acceptDownloads`.
- Phân loại tự động: `ENV` (đối chứng tối thiểu cũng thất bại) hoặc `ENV_CONTENT` (chỉ byte workbook bị chặn) → nhóm 16 báo **BỊ CHẶN** kèm bằng chứng, mã thoát 3; `APP` (đối chứng + byte ứng dụng tải được, riêng nút của ứng dụng thất bại) → **FAIL**. Không có đường nào chuyển thất bại thành đạt. `KATY_SIMULATE_NO_DOWNLOADS=1` giả lập môi trường chặn để kiểm chính bộ chẩn đoán.
- Khẳng định thêm trong nhóm 16: tên tệp, MIME của Blob, kích thước Blob = tệp tải về, tệp là zip (`PK`), nội dung workbook (4 sheet, 23 cột), Blob URL không bị thu hồi trong 2,5 giây, và tải 3 lần thì cả 3 Blob URL đều được thu hồi (`BLOB_URL_TTL_MS`, test đặt 300 ms) — không rò bộ nhớ.
- Việc cần làm trên Windows: chạy `node 5_UI_TESTS/download.probe.cjs` rồi `node 5_UI_TESTS/ui.e2e.cjs`, gửi kết quả dòng `Môi trường:` và bảng đối chứng; kết quả sẽ cho biết lỗi thuộc môi trường hay ứng dụng.
- Giả thuyết TTL hoặc origin **không** được coi là nguyên nhân đã chứng minh (đúng theo kết quả kiểm trước: tăng TTL và đổi origin chưa đủ).

## 4. Tối ưu tải lạnh
Xem `BAO_CAO_HIEU_SUAT_V12_R2.md`: tải lạnh `doc.list` giảm **744.122 → 515.682 ô đọc (−30,7%)**, nhưng số lần đọc Sheet tăng 7 → 13; vẫn còn 515 nghìn ô (DebtLine 252.000, DebtDoc 132.000, Allocation 66.930) **chưa giảm** — không tuyên bố đã tối ưu toàn diện. Cơ chế: đọc theo cột (`repoSliceValid_`) cho ba bảng liên kết PO, có cache bản cắt theo cùng khóa phiên bản `gen` của bảng; MAIN vẫn là nguồn duy nhất, không có chỉ mục/snapshot thứ hai.

## 5. Schema và tài liệu (đính chính)
Gói FIXED **có đổi schema** so với bản 12 trước đợt Tỷ giá; đợt R2 nâng `SCHEMA_VERSION` 2.2 → **2.3** (làm mới khóa kiểm tra tiêu đề). Đủ danh sách thay đổi ở `HUONG_DAN_TRIEN_KHAI_V12_R2.md` mục 2. Đã rà: `TABLES_`, `EXTRA_COLS_`, `ID_PREFIX_` (`fxr`, `fxe`), `ensureSchema`/`migrateHeaders_` (cột số mới nay định dạng `0` thay vì `@`), registry cache (`FxRate`/`FxEntry` cố ý **không** vào `CACHED_TABLES_`: ghi nhận phải đọc nguồn), sao lưu (sao chép cả tệp nên gồm sheet mới; manifest theo sheet), khôi phục (`migrateHeaders_` + tạo sheet thiếu khi truy cập; bản sao lưu 2.2 khôi phục được vào 2.3, bút toán tỷ giá lập sau thời điểm sao lưu sẽ mất như mọi dữ liệu khác). `schema.test.cjs` kiểm: tiền tố ID duy nhất, tiêu đề, chạy lại không đổi dữ liệu, nâng cấp từ sheet Payment cũ giữ nguyên dòng cũ.

## 6. Giữ nguyên phần đã sửa đúng
`po-scope` (PO ngoài quyền, noOrder, điều chỉnh kế thừa đúng dòng, cache theo user/scope), autosave, `before-after.test.cjs` (số dư AR/AP, phân bổ, tổng, R01/R02/R03/R07/R12, workbench, dashboard, payment.list **giống hệt** bản FIXED trên cùng fixture; liên kết PO giống hệt). Không đổi công thức công nợ nguyên tệ, VAT, tỷ giá hay báo cáo khác.

## 7. Tệp/hàm ảnh hưởng
`Backend.gs`: `fxEntryGate_`, `fxCompanyWide_`, `fxGrants_`, `fxGrantSummary_`, `fxGrantsGet_/Set_`, `fxGrantEntryPerms`, `fxPeriodItems_`, `fxEntryPreview_/List_/Create_/Post_/Reverse_`, `fxDraftSig_`, `fxBackfill_`, `repoSliceValid_` (+ cache bản cắt), `orderLinkCtx_`, `migrateHeaders_`, `PERMS_` (ADMIN), `appBootstrap_`, `SCHEMA_VERSION`. `index.template.html`: khối bút toán/nút điền bù theo `user.fx`, gửi `draftSig`. Test mới: `fx-scope`, `slice-read`, `schema`, `before-after`; sửa test cũ để mô phỏng quyền mới và `repoSliceValid_`.

## 8. Hạn chế
- Chưa chạy trên Google Apps Script/Google Sheets thật; chưa xác minh `GOOGLEFINANCE`, trigger, hiệu năng thực, tải XLSX trên Windows.
- Quyền bút toán tỷ giá cho tài khoản không phải ADMIN phải cấu hình thủ công; chưa có màn hình quản trị cho việc này.
- Bút toán tỷ giá vẫn là bảng kê tổng hợp, không có mô hình theo từng phạm vi đối tác (theo yêu cầu).
- Không khẳng định "không bao giờ sai công nợ", "realtime" hay "đã hết chậm".

## 9. Rà quyền xem PO ở các màn khác (bổ sung R2.1)
**Phương pháp:** quét tự động `4_TESTS/po-leak-scan.test.cjs` (engine thật + Sheet giả, 300 chứng từ/60 đối tác, kèm khoản phát sinh đang mở để các màn Đơn hàng/COST/chưa lập hóa đơn có dữ liệu, bảng tổng hợp đã dựng). Người hẹp quyền (4 đối tác + nhóm G1) gọi **mọi API đọc** (các route đọc, trừ nhóm sao lưu/làm mới/lưu nháp) với tham số mặc định và các biến thể (`pageSize`, `direction`, `q=DH-…`, `q=PO…`), từng `doc.get` (150 chứng từ), `payment.get` (60 phiếu), `order.get`/`order.archiveCheck` (đơn ẩn), **toàn bộ R01–R14** (ba bộ tham số), gợi ý nhập hàng loạt. Mỗi phản hồi được dò theo số đơn, số PO, mã HSDV, ID và PO gửi NCC (`poRef`) của **mọi đơn ngoài phạm vi** (bộ dò định danh ẩn: hơn 50 đơn). Có đối chứng độ nhạy (người đủ quyền phải thấy PO ở `order.list`, `doc.list`, `accrual.list`, `summary.orders`, `summary.costs`) và đối chứng âm tính (vô hiệu hóa `orderInScope_` thì bộ quét phải phát hiện lộ ở ≥3 API).

**Kết quả:**
| Nhóm màn/API | Kết quả |
|---|---|
| Công nợ (`doc.list`, `doc.get`), phiếu thu/chi (`payment.*`), Đơn hàng (`order.*`), COST/khoản phát sinh (`accrual.list`), bàn làm việc, dashboard, chưa lập hóa đơn, bảng tổng hợp (`summary.partners/orders/costs`), phê duyệt, cảnh báo, nhắc nợ, đối chiếu Excel, báo cáo R01–R14 và xuất | **Không lộ** PO ngoài phạm vi (đã lọc theo phạm vi người xem hoặc từ chối) |
| Xem chi tiết đơn ẩn (`order.get`, `order.archiveCheck`) | từ chối (OUT_OF_SCOPE/NOT_FOUND), giữ nguyên |
| **Thông báo lỗi khi nhập hàng loạt hóa đơn (`doc.bulkPreview/Commit`)** | **Lỗi đã sửa:** nhập số đơn/PO ngoài phạm vi trả thông điệp khác với số không tồn tại ("Đơn DH-… ngoài phạm vi", "thuộc khách khác") → dò được sự tồn tại và (với AR) quan hệ đơn–khách. Nay đơn ngoài phạm vi bị loại khỏi tập tìm kiếm nên trả đúng thông điệp "không tìm thấy" |
| **Nhập chi phí hàng loạt (`order.bulkPreview/Commit` loại COST, cột đơn/PO)** | **Lỗi đã sửa:** thông điệp "khớp N đơn" đếm cả đơn ẩn và "Đơn … ngoài phạm vi"; nay chỉ xét đơn trong phạm vi |
| **Chia chi phí cho nhiều đơn (`accrual.save`, chế độ chia)** | **Lỗi đã sửa:** thông báo kèm số đơn và trạng thái "đã đóng/hủy" của đơn ngoài phạm vi (kiểm tra phạm vi đang đứng sau kiểm tra trạng thái); nay kiểm tra phạm vi trước và trả "không tìm thấy đơn hàng" |
Test 6 (`doc.bulkPreview` AR/AP theo số đơn và theo PO) và test 7 (chia chi phí) **thất bại trên Backend của ZIP FIXED và đạt trên bản sửa**; test 1–5 đạt trên cả hai (các màn đọc đã đúng ngay từ bản FIXED).

**Hạn chế còn lại sau mục 10:**
- Nhật ký audit (`audit.list`) có thể chứa số đơn trong `diff` của thao tác ghi; người có `audit.read` xem theo chính sách audit riêng.
- Bộ dò dùng dữ liệu giả; dữ liệu thật có thể có định danh khác (mã PO nhập tay, HSDV…) — nên chạy lại `po-leak-scan.test.cjs` sau khi đổi quy ước mã.

## 10. Đồng nhất NOT_FOUND theo ID (R2.2)
**Yêu cầu:** truy cập theo ID một đơn/khoản phát sinh ngoài phạm vi phải trả **giống hệt** ID không tồn tại (cùng mã lỗi và thông điệp), để không dò được "ID này có tồn tại".
**Thay đổi (`Backend.gs`):** hàm mới `assertVisible_(user, partner, group, what, fullMsg)` ném `NOT_FOUND` thay cho `OUT_OF_SCOPE` ở mọi đường theo ID:
| Đường | Trước | Sau |
|---|---|---|
| `order.get`, `order.archiveCheck`, `order.save` (sửa), `order.setStatus`, `order.archive`, `order.unarchive` | `OUT_OF_SCOPE` "Ngoài phạm vi dữ liệu được cấp." | `NOT_FOUND` "Không tìm thấy đơn hàng." |
| `accrual.save` (sửa khoản có sẵn; kiểm phạm vi **trước** kiểm trạng thái), `accrual.cancel`, `accrual.invoice` | `OUT_OF_SCOPE` | `NOT_FOUND` "Không tìm thấy khoản phát sinh." (riêng `accrual.invoice` dùng đúng thông điệp "Có khoản phát sinh không tồn tại." như ID không tồn tại) |
| `order.assignService` (gán mã dịch vụ hàng loạt) | dòng bỏ qua kèm **số đơn** và lý do "Ngoài phạm vi dữ liệu." | dòng bỏ qua "Không tìm thấy PO." không kèm số đơn |
**Test:** `po-leak-scan.test.cjs` nhóm 8 gọi 10 đường theo ID với ID đơn/khoản ẩn và ID không tồn tại, yêu cầu kết quả giống hệt sau khi chuẩn hóa ID và là NOT_FOUND/"Không tìm thấy"; **thất bại trên bản R2.1** (`order.get` trả OUT_OF_SCOPE) và đạt trên bản R2.2. Các test cũ kỳ vọng `OUT_OF_SCOPE` cho đơn theo ID (`reject.regression`, `fix`, `fix5`, `fix12`, `po-scope`) được cập nhật sang `NOT_FOUND` theo yêu cầu đồng nhất — đây là thay đổi hành vi có chủ ý, không giảm assertion.
**Đã mở rộng ở mục 11** cho chứng từ, phiếu thu/chi, đối tác.

## 11. Đồng nhất NOT_FOUND cho chứng từ, phiếu thu/chi, đối tác (R2.3)
**Quy tắc chung:** đối tượng (chứng từ, phiếu, đối tác, phân bổ, ghi nhận theo dõi nợ, dòng phí) ngoài phạm vi người gọi được xử lý **y như không tồn tại** — cùng mã lỗi, cùng thông điệp, cùng cấu trúc lỗi — ở mọi đường theo ID và cả khi ID/đối tác nằm trong payload.
| Nhóm | Đường | Trước | Sau |
|---|---|---|---|
| Đọc | `doc.get`, `payment.get`, `partner.get` | `OUT_OF_SCOPE` | `NOT_FOUND` "Không tìm thấy chứng từ./phiếu./đối tác." |
| Ghi theo ID | `doc.save` (sửa), `doc.submit/approve/reject/delete/post`, `doc.reverse`, `doc.adjust`; `payment.save` (sửa), `payment.submit/approve/reject/delete/post/reverse`, `payment.allocate` (ID phiếu), `payment.reverseAllocation`, `payment.suggest`; `partner.save` (sửa); `followup.close`; `reminder.preview/send`; báo cáo R05/R06 (ID đối tác); bản nháp nhập liệu có `targetId` | `OUT_OF_SCOPE` | `NOT_FOUND` với đúng thông điệp của ID không tồn tại ở từng hàm |
| ID trong payload | tạo chứng từ/phiếu/khoản phát sinh/đơn với `partnerId`/`customerPartnerId` ngoài phạm vi | `OUT_OF_SCOPE` sau khi qua kiểm tra dữ liệu | đối tác ngoài phạm vi coi như không tồn tại → cùng lỗi `VALIDATION_FAILED` "Chọn đối tác" như ID không có |
| ID trong payload | `payment.allocate` với dòng phí/chứng từ ngoài phạm vi | `OUT_OF_SCOPE` | "Không tìm thấy dòng phí." như dòng không tồn tại |
| ID trong payload | `followup.save` với chứng từ khác nhóm nghiệp vụ; `doc.bulkSuggest`/`doc.bulkPreview` với đối tác ngoài phạm vi | `OUT_OF_SCOPE` | `VALIDATION_FAILED` "Chứng từ không thuộc đối tác."; không có gợi ý / `PARTNER_UNKNOWN` như đối tác không tồn tại |
**Giữ nguyên có chủ ý:** phạm vi theo **nhóm nghiệp vụ** của một đối tượng bạn đã thấy (ví dụ tạo chứng từ cho đối tác trong phạm vi nhưng chọn nhóm nghiệp vụ ngoài phạm vi) vẫn `OUT_OF_SCOPE`, vì mã nhóm là danh mục chung, không phải ID cần che. Các màn **toàn công ty** (sao kê, dư đầu kỳ, sổ quỹ, bút toán tỷ giá) vẫn trả `OUT_OF_SCOPE`/`FORBIDDEN` rõ ràng vì không gắn với một ID.
**Test:** `po-leak-scan.test.cjs` nhóm 9 gọi 25 hàm theo ID, 5 đường tạo/phân bổ có đối tác/dòng trong payload và báo cáo R05/R06 với ID **ẩn** và ID **không tồn tại**, yêu cầu kết quả giống hệt sau chuẩn hóa ID, kèm đối chứng dương (đối tượng trong phạm vi vẫn dùng bình thường). **Thất bại trên bản R2.2** (`doc.get` còn `OUT_OF_SCOPE`), đạt trên R2.3. Các test cũ kỳ vọng `OUT_OF_SCOPE` được cập nhật: `reject.regression` (3 chỗ), `fix` (2), `adv.regression`, `rep9`, `bulk-invoice` (2) — thay đổi hành vi có chủ ý, không giảm kiểm tra.
**Hạn chế:** chưa rà các đường theo ID trong sao kê ngân hàng/dư đầu kỳ/sao lưu (thuộc màn toàn công ty); thời gian phản hồi không được cân bằng nên về lý thuyết vẫn có kênh đo thời gian (không đáng kể với Apps Script).

## 12. Lỗi dán vào Apps Script: `Syntax error: ParseError: Unexpected token ILLEGAL line: 798 file: Code.gs` (R2.4)
**Nguyên nhân (đã xác định):** trong khối chuẩn định dạng `hak-format.js` nhúng vào `Backend.gs` có hằng số BigInt `1n` (`BigInt(...)+1n`) lấy nguyên văn từ repo chuẩn. Trình phân tích khi lưu của Apps Script từ chối cú pháp này (báo `Unexpected token ILLEGAL` đúng tại dòng chứa `1n`; trong tệp triển khai là dòng 798 — dòng `let n=(BigInt(whole+kept||'0')+1n)…`). Test cục bộ chạy bằng Node mới nên không bắt được; **đây là sai sót của em ở đợt nhúng chuẩn định dạng**, các bản gửi trước (từ lúc nhúng đến R2.3) đều dính lỗi này.
**Sửa:** `hak-format.js` — thay `+1n` bằng hàm cộng chữ số `incDigits` (kết quả giống hệt; kiểm các trường hợp nhớ: 9,995→10,00; 999,999→1.000,00; 0,005→0,01; -0,005→-0,01; số trên 2^53), và viết lại tương đương hai cú pháp mới khác trong `validateColumns` (`??` và `{...c}`) mà trình phân tích cũ cũng có thể từ chối. Nhãn nguồn trong tệp ghi rõ các thay đổi so với bản gốc của repo chuẩn.
**Phòng ngừa:** `4_TESTS/syntax.test.cjs` nay phân tích Backend/Gateway (cả bản thường và bản an toàn) ở mức **ES2019** bằng `espree` (cấm hằng BigInt, `??`, `?.`, ngăn cách số...); nếu máy không có `espree` thì quét thô các mẫu đó. Test thất bại trên bản R2.3 (báo dòng chứa `??`/`1n`) và đạt trên R2.4. Phần còn lại của Backend dùng `BigInt(...)` dạng hàm và `**` như bản cũ vốn chạy được, nên không đổi.
**Chưa xác minh:** vẫn chưa dán thử vào Apps Script thật; nếu trình soạn thảo báo lỗi cú pháp khác, gửi em dòng lỗi và nội dung dòng đó (hoặc 3 dòng quanh nó) để sửa tiếp.

## 13. (R2.5) Lỗi web app "SyntaxError: Unexpected identifier 'version' (line 5, file "Code")"
- **Nguyên nhân thật:** Gateway nạp `index.html` bằng `createTemplateFromFile('index')` (HtmlTemplate). Mọi chuỗi `<?` trong tệp đều bị coi là mở scriptlet. `xlsx-lite.js` (nhúng trong index.html) có 6 chuỗi `'<?xml version="1.0"...'` nên trình biên dịch template báo lỗi cú pháp tại `version`. Đây KHÔNG phải do triển khai cũ/URL sai.
- **Sửa:** trong `xlsx-lite.js` đổi thành `'<' + '?xml ...'` (6 chỗ). Hành vi tạo .xlsx không đổi.
- **Chốt chặn:** `src/build.py` dừng build nếu index.html còn `<?` ngoài `<?= userEmail ?>`; `4_TESTS/syntax.test.cjs` kiểm tra lại cho 2_GATEWAY và AN_TOAN_KHI_DAN.
- **Cách cập nhật:** dán `index.html` mới vào dự án Gateway → Triển khai → Quản lý bản triển khai → Sửa → Phiên bản mới → Triển khai; tải lại Ctrl+F5. Backend không đổi so với R2.4.

## 14. (R2.6) Thu hộ / Chi hộ và sắp xếp lại menu theo phân hệ ERP
**Trước đây:** khoản hộ chỉ là cờ `isPassThrough` trên dòng phí; có báo cáo tổng chênh lệch nhưng không có màn riêng và không ghép được từng khoản.
**Thêm mới (Backend, schema 2.4):**
- Bảng `PassLink` (mã `pls`): ghép một khoản chi hộ (COST) với một khoản thu hộ (REVENUE), một phần hoặc toàn bộ. Không sinh bút toán; số còn mở = số khoản − tổng ghép đang hiệu lực.
- API: `passthrough.list` (lọc loại/trạng thái/khách/tiền tệ/ngày/từ khóa, phân trang, tổng và tuổi khoản mở 0–30/31–60/61–90/>90), `passthrough.candidates` (gợi ý đối ứng: cùng đơn → cùng khách → khác), `passthrough.link`, `passthrough.unlink`, `passthrough.links`, `passthrough.report` (theo khách hàng hoặc theo đơn).
- Kiểm tra khi ghép: cùng tiền tệ; số nguyên dương, không vượt phần còn mở của cả hai khoản; khác đơn/khách phải xác nhận lại (`CONFIRM_REQUIRED`); khoản ngoài phạm vi xem trả `NOT_FOUND` như phần còn lại của hệ thống; ghép/gỡ cần quyền `order.write`, xem cần `read`, báo cáo cần `report.read`.
- `accrual.cancel` từ chối hủy khoản đang được ghép (phải gỡ ghép trước).
**Giao diện:** menu `Tiền và thanh toán → Thu hộ / Chi hộ` với 3 tab (khoản hộ; đối chiếu theo khách hàng; đối chiếu theo đơn), thẻ tổng hợp theo từng tiền tệ, hộp thoại Ghép / Xem ghép / Gỡ; mục hướng dẫn mới "Thu hộ / Chi hộ".
**Menu:** thanh bên chia thành 9 phân hệ gập/mở được (Tổng quan; Bán hàng và phải thu; Mua hàng và phải trả; Tiền và thanh toán; Danh mục; Nhập liệu; Thuế GTGT; Báo cáo và kế toán; Quản trị hệ thống), nhớ trạng thái gập/mở, tự mở nhóm chứa màn đang dùng, thêm đường dẫn trang (nhóm › màn hình) trên đầu mỗi trang.
**Chưa làm:** bắt buộc đính kèm chứng từ gốc cho khoản chi hộ (hệ thống chưa có kho tệp đính kèm).
**Cập nhật:** dán lại `Backend.gs` và `index.html`, tạo phiên bản mới cho cả hai dự án, chạy `ensureSchema()` một lần để tạo trang tính `PassLink`.

## 15. (R2.7) Menu mở sẵn nhóm Tổng quan
Mặc định chỉ mở nhóm "Tổng quan" và nhóm đang dùng; các nhóm khác gập lại để thấy đủ 9 nhóm không phải cuộn. Lựa chọn gập/mở của người dùng vẫn được nhớ.

## 16. (R2.8) Quỹ ngoại tệ: tỷ giá phiếu chi theo bình quân gia quyền di động
**Vấn đề:** thu theo tỷ giá ngày thực thu là đúng, nhưng chi cũng lấy tỷ giá ngày chi thì quỹ ngoại tệ (số USD đang giữ) bị lệch vì tiền chi ra không khớp giá vốn của tiền đã nhận.
**Cách xử lý (mặc định, đổi được):**
- Mỗi tài khoản quỹ ngoại tệ (Danh mục → tài khoản quỹ có tiền tệ khác VND) là một "kho" tiền: số dư đầu kỳ định giá theo tỷ giá ngày đầu sổ; phiếu thu nhập theo tỷ giá ngày thực thu; phiếu chi xuất theo **tỷ giá bình quân tại thời điểm chi**. Quỹ không phát sinh lãi/lỗ khi chi; chi hết quỹ thì lấy đúng phần giá trị còn lại (không sót lẻ).
- Phiếu chi tự gắn tỷ giá bình quân khi **ghi nhận** (nguồn `MOVING_AVG`); phân bổ vào hóa đơn mua tính chênh lệch đã thực hiện = so với tỷ giá ghi nợ hóa đơn. Phiếu thu giữ tỷ giá ngày thực thu.
- Thứ tự tính: theo ngày hiệu lực; cùng ngày thu trước chi. Phiếu đã đảo không tính. Quỹ không đủ số dư hoặc thiếu tỷ giá đầu sổ: tạm ghi theo tỷ giá ngày chi và cảnh báo.
- Cuối kỳ quỹ được **đánh giá lại** theo tỷ giá cuối kỳ: thêm bút toán chưa thực hiện loại "quỹ tiền" (tự đảo kỳ sau như công nợ).
- Bổ sung phiếu thu/đầu kỳ lùi ngày làm bình quân đổi: màn **Tỷ giá ngoại tệ → Quỹ ngoại tệ** báo các phiếu chi lệch; nút **Tính lại bình quân** cập nhật phiếu chi và chênh lệch phân bổ (bỏ qua kỳ đã khóa; cần quyền `fx.backfill`). Chạy lại nhiều lần cho cùng kết quả.
- Đổi phương pháp về "theo tỷ giá ngày chi" bằng danh sách chọn trên cùng màn (Config `fx.outMethod`).
**API mới:** `fx.poolReport`, `fx.poolRecalc`, `fx.method.set`. **Chưa làm:** giá vốn theo từng tài khoản quỹ khi chuyển nội bộ giữa hai quỹ ngoại tệ; quỹ gộp theo tiền tệ thay vì theo tài khoản.
**Cập nhật:** dán lại `Backend.gs` và `index.html`, tạo phiên bản mới cho cả hai. Phiếu chi cũ giữ nguyên tỷ giá đã ghi; bấm Tính lại nếu muốn áp bình quân cho các phiếu chi đã ghi.

## 17. (R2.9) Chuyển nội bộ giữa hai quỹ ngoại tệ
- Bảng mới `CashTransfer` (mã `cxf`, số `CQ-yyyy-000001`); API `transfer.list/save/post/reverse/delete`. Chỉ chuyển giữa hai quỹ **cùng một ngoại tệ** (khác VND); đổi ngoại tệ ↔ VND hoặc sang ngoại tệ khác không phải chuyển nội bộ.
- Quy trình: lập nháp (`payment.write`) → ghi nhận bởi **người khác** (`payment.approve`; người lập không tự ghi nhận) → có thể đảo (`payment.reverse`, cần lý do, kỳ phải mở). Chỉ tài khoản có phạm vi toàn công ty được thao tác (quỹ là số liệu toàn công ty).
- Hạch toán trong quỹ: quỹ đi xuất theo bình quân di động tại ngày chuyển; quỹ nhận nhập đúng giá trị VND đó (không phát sinh chênh lệch tỷ giá, không bút toán). Thứ tự trong ngày: thu → chuyển → chi. Chi từ quỹ nhận về sau dùng bình quân riêng của quỹ nhận.
- Quá số dư/thiếu định giá: ghi theo tỷ giá ngày và cảnh báo (như phiếu chi). Phiếu đảo không tính vào quỹ.
- Bổ sung thu/đầu kỳ lùi ngày: báo lệch cả phiếu chuyển lẫn các phiếu chi phía sau; **Tính lại bình quân** cập nhật cả hai (bỏ qua kỳ khóa), chạy lại ổn định.
- Giao diện: màn Tỷ giá ngoại tệ → khối "Chuyển nội bộ giữa các quỹ ngoại tệ" (lập, ghi nhận, xóa nháp, đảo); sổ quỹ hiện "Chuyển đến/đi quỹ …".
- Đọc an toàn: nếu chưa chạy `ensureSchema()` sau khi cập nhật (chưa có trang `CashTransfer`) thì hệ thống coi như chưa có phiếu chuyển, ghi nhận phiếu chi vẫn chạy bình thường.
**Cập nhật:** dán lại `Backend.gs`, `index.html`, tạo phiên bản mới cho cả hai, chạy `ensureSchema()` một lần.

## 18. (R3.0) Mua / bán ngoại tệ và Sổ quỹ (tiền mặt, ngân hàng, ngoại tệ)
**Mua/bán ngoại tệ** (bảng `CashExchange`, số `MB-yyyy-000001`; API `exchange.list/save/post/reverse/delete`):
- BÁN: quỹ ngoại tệ xuất theo giá vốn bình quân di động; quỹ VND thu số tiền thực nhận; chênh lệch = thu − giá vốn lưu ở phiếu và vào **bút toán chênh lệch tỷ giá đã thực hiện** loại "Bán ngoại tệ" (hướng `EXCH`, cộng theo tháng, điều chỉnh khi đảo phiếu).
- MUA: quỹ VND chi số tiền thực trả; quỹ ngoại tệ nhập đúng số VND đó (không phát sinh chênh lệch), bình quân được tính lại.
- Quy trình như chuyển quỹ: nháp → người khác ghi nhận → đảo (cần lý do, kỳ mở). Tỷ giá thực tế = VND ÷ ngoại tệ hiển thị khi nhập. Quá số dư quỹ: ghi theo tỷ giá ngày + cảnh báo. Thu lùi ngày làm giá vốn thay đổi: báo lệch ở thẻ Quỹ ngoại tệ và "Tính lại bình quân" cập nhật giá vốn/lãi lỗ phiếu bán (bỏ qua kỳ khóa).
**Sổ quỹ** (`cash.book`; menu Tiền và thanh toán → Sổ quỹ): một sổ cho mỗi tài khoản quỹ (tiền mặt VND, ngân hàng VND, quỹ ngoại tệ): số dư đầu kỳ, từng phát sinh (phiếu thu/chi, chuyển quỹ, mua/bán ngoại tệ) có tồn sau dòng, cộng phát sinh, số dư cuối kỳ; quỹ ngoại tệ có thêm thu/chi/tồn quy VND và tỷ giá bình quân sau mỗi dòng. Thẻ tồn quỹ của mọi tài khoản ở đầu màn; lọc kỳ (đầu kỳ = số dư trước ngày bắt đầu); **In sổ** và **Xuất Excel**. Chỉ chứng từ đã ghi nhận; phiếu đã đảo không hiện; chỉ tài khoản phạm vi toàn công ty và có quyền xem báo cáo.
**Cập nhật:** dán lại `Backend.gs`, `index.html`; tạo phiên bản mới; chạy `ensureSchema()` để tạo trang tính `CashExchange` (chưa chạy thì hệ thống coi như chưa có phiếu mua/bán, các chức năng khác không ảnh hưởng).

## 19. (R3.1) Đối chiếu quỹ với sao kê ngân hàng và Kiểm kê quỹ
**Đối chiếu ngân hàng** (bảng `BankRecon`; API `bank.reconView/reconSuggest/reconCalc/reconSave/reconReopen`; menu Tiền và thanh toán → Đối chiếu ngân hàng):
- Công thức: số dư sao kê = số dư sổ quỹ − thu chưa lên sao kê + chi chưa lên sao kê + khoản chỉ có trên sao kê (phí, lãi…). **Chỉ xác nhận khi chênh lệch = 0** (`RECON_NOT_BALANCED`); lưu nháp được khi còn chênh. Xác nhận cần quyền `payment.approve`.
- Dán sao kê (ngày; số tiền +thu/−chi; nội dung) → **Ghép tự động**: cùng chiều, đúng số tiền, lệch ngày ≤ 7 ngày, mỗi dòng sổ ghép một lần; dòng không ghép được vào "chỉ có trên sao kê".
- Khoản đã khớp ở lần xác nhận trước không hiện lại; khoản chỉ có trên sao kê chưa ghi sổ được **chuyển tiếp** sang kỳ sau cho đến khi đánh dấu "đã ghi sổ" (kèm tick phát sinh tương ứng trong sổ). Mỗi tài khoản/ngày một bản; mở lại phải theo thứ tự từ lần mới nhất, cần lý do.
**Kiểm kê quỹ** (bảng `CashCount`, số `KK-yyyy-000001`; API `cashcount.preview/list/save/confirm/delete`; menu Kiểm kê quỹ):
- Đếm theo mệnh giá (VND và USD có sẵn bảng mệnh giá) hoặc nhập tổng; so với số dư sổ quỹ **cuối ngày kiểm kê**; chênh lệch (thiếu/thừa) **bắt buộc giải trình**; không kiểm kê ngày tương lai.
- Người lập khác người xác nhận; nếu sổ quỹ đổi sau lúc kiểm kê thì xác nhận bị chặn (`STALE_COUNT`), phải lập lại. In **Biên bản kiểm kê quỹ** có chỗ ký thủ quỹ / người lập / kế toán trưởng.
- Chưa tự lập phiếu thu/chi xử lý chênh lệch kiểm kê: kế toán xử lý bằng phiếu thường rồi tham chiếu biên bản.
**Cập nhật:** dán lại `Backend.gs`, `index.html`, tạo phiên bản mới; chạy `ensureSchema()` để tạo hai trang tính `BankRecon`, `CashCount`.

## 20. (R3.2) Hoàn thiện đối chiếu/kiểm kê quỹ
- **Xử lý chênh lệch kiểm kê** (`cashcount.adjust` / `cashcount.adjustReverse`): biên bản đã xác nhận có chênh lệch (quỹ VND) → "Xử lý chênh lệch" chọn cách xử lý (tính vào chi phí/thu nhập khác; người chịu trách nhiệm bồi thường/nộp lại; chờ xử lý) → thêm một dòng thu/chi **cuối ngày kiểm kê** vào sổ quỹ (loại "Xử lý kiểm kê") để số dư sổ bằng số kiểm đếm; đảo được (cần lý do, kỳ mở). Cần quyền duyệt. Quỹ ngoại tệ: xem mục 21. **Chưa hạch toán sang tài khoản kế toán** (ứng dụng này chỉ theo dõi công nợ và quỹ).
- **Nhập sao kê từ tệp**: chọn `.csv`/`.txt`/`.xlsx`; tự nhận cột Ngày, Ghi nợ/Ghi có (hoặc Số tiền), Nội dung (bỏ qua dòng tiêu đề phía trên, tự đoán dấu phân cách `,` `;` Tab); Ghi có = thu, Ghi nợ = chi. Nội dung đọc được đổ vào ô dán để kiểm tra rồi **Ghép tự động**.
- **Tổng quan nhiều tài khoản**: `bank.reconOverview` — trên màn Đối chiếu ngân hàng: mỗi tài khoản ngân hàng/ngoại tệ có số dư sổ, số khoản chưa đối chiếu, khoản chỉ có trên sao kê chờ ghi sổ, lần đối chiếu gần nhất (cảnh báo quá 35 ngày); trên màn Kiểm kê quỹ: lần kiểm kê gần nhất và chênh lệch (cảnh báo quá 31 ngày) của từng quỹ tiền mặt; cả hai có nút mở thẳng bản cần làm.
**Cập nhật:** dán lại `Backend.gs`, `index.html`; tạo phiên bản mới; chạy `ensureSchema()` (thêm cột xử lý vào trang tính `CashCount` nếu đã có).

## 21. (R3.3) Xử lý chênh lệch kiểm kê cho quỹ ngoại tệ
- **Thiếu ngoại tệ:** xuất khỏi quỹ theo **tỷ giá bình quân** của quỹ tại ngày kiểm kê (không phát sinh lãi/lỗ tỷ giá; bình quân gần như không đổi, chỉ lệch do làm tròn VND).
- **Thừa ngoại tệ:** nhập theo **tỷ giá ngày kiểm kê** trong bảng tỷ giá (chưa có thì tự lấy Google Finance; vẫn không có thì báo `FX_RATE_MISSING`, nhập tỷ giá ở màn Tỷ giá ngoại tệ rồi xử lý lại). Tỷ giá được lưu vào biên bản (`adjustRateE4`) nên đổi bảng tỷ giá về sau không làm đổi giá trị đã ghi.
- Sổ quỹ ngoại tệ hiện dòng "Xử lý kiểm kê" có cả số ngoại tệ và giá trị VND; quỹ sau xử lý vẫn được đánh giá lại cuối kỳ; đảo xử lý được như quỹ VND.

## 22. (R3.4) Nghĩa thu hộ / chi hộ (thay thế bản R3.4 trước)
Theo định nghĩa của chị: **CHI HỘ** = mình chi trả hộ khách rồi **thu lại của khách** (khoản phải thu); **THU HỘ** = mình thu tiền hộ rồi phải **trả lại** (khoản phải trả). Do đó:
- Ô tick ở **doanh thu / phải thu** ghi **Chi hộ (thu lại của khách)**; ở **chi phí / phải trả** ghi **Thu hộ (trả lại khách)** (form khoản, dòng phí hóa đơn theo chiều phải thu/phải trả, danh sách khoản, chi tiết hóa đơn, cột mẫu nhập hàng loạt, hướng dẫn, báo cáo lãi gộp theo đơn).
- Màn **Thu hộ / Chi hộ**: khoản phải thu hộ = CHI HỘ; khoản phải trả hộ = THU HỘ. Ghép = **bù trừ** một khoản thu hộ với một khoản chi hộ của cùng khách; "sau bù trừ" = thu hộ − chi hộ (dương: còn phải trả lại khách; âm: khách còn nợ mình).
- Dữ liệu và cờ `isPassThrough` không đổi; chỉ đổi tên gọi, mapping `side` trên màn Thu hộ / Chi hộ và báo cáo, nên khoản đã tick trước đây tự hiện đúng theo loại khoản.
