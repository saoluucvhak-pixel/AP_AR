> **Bản sửa và tối ưu 26/10/2026:** đọc [BAO_CAO_SUA_LOI_HIEU_SUAT_V8.md](BAO_CAO_SUA_LOI_HIEU_SUAT_V8.md) trước khi triển khai. Nội dung dưới đây là tài liệu bàn giao gốc.

# Báo cáo bàn giao – sửa lỗi và nâng cấp KATY AP/AR (schema 1.9)

> Mọi kiểm thử dưới đây chạy bằng **Node với Sheet/Cache/Lock giả (mock/local)**. **Chưa có bước nào chạy trên Google Apps Script thật.** Việc deploy, `ensureSchema()` và kiểm tra trên bản sao dữ liệu thật do người quản trị thực hiện.

## 1. Lỗi đã xác minh bằng mã nguồn và test, nguyên nhân, cách sửa

| # | Vấn đề | Nguyên nhân | Cách sửa |
|---|---|---|---|
| A | Chứng từ ngày 30/09 ghi nhận 23/10 làm đổi sổ đã chốt 30/09 | Ngày vào sổ lấy theo ngày chứng từ (`docEffDate_`) | Sổ/báo cáo mặc định theo **ngày ghi nhận** (`DATE_BASIS_='POSTING'`); chế độ **Ngày chứng từ** là lựa chọn riêng, ghi nhãn, không phát hành bản chốt; hộp thoại chọn ngày ghi nhận (không tương lai, không vào kỳ khóa); `auditLedgerDates()` liệt kê dữ liệu cũ bị ảnh hưởng (chỉ đọc) |
| B | Lưu/hủy khoản phát sinh, lưu/đổi trạng thái đơn, nhập hàng loạt không kiểm khóa kỳ | Thiếu `assertPeriodOpen_` ở `accrualSave_`, `accrualCancel_`, `orderSetStatus_`, `orderSave_`, `bulkBuild_` | Thêm kiểm khóa cho cả kỳ cũ và kỳ mới khi sửa/chuyển ngày; lưu `cancelledDate` cho khoản/đơn hủy để báo cáo quá khứ vẫn thấy khoản trước ngày hủy |
| C | Khoản INVOICING (đã có hóa đơn nháp) biến mất khỏi nhóm "chưa lập" nhưng chưa vào "đã lập" | `orderTotals`, R09, dashboard, điều kiện đóng đơn, kiểm tín dụng chỉ biết OPEN/INVOICED | Nhóm riêng "Đang lập hóa đơn" ở mọi nơi; test đối chiếu OPEN+INVOICING+INVOICED = tổng khoản hợp lệ, không trùng |
| D | Thu hộ/chi hộ lẫn trong doanh thu/chi phí/lợi nhuận | `isPassThrough` chỉ để hiển thị | Tách doanh thu dịch vụ, chi phí dịch vụ, thu hộ, chi hộ, số hộ chưa đối ứng; lãi gộp từng tiền tệ; chi hộ chưa đủ căn cứ = chờ xác minh; trạng thái "Lợi nhuận tạm tính/Chưa đủ dữ liệu" |
| E | Audit ghi sau khi hoàn tất, lỗi chỉ ghi console; dừng sau commit có thể mất nhật ký | `writeAudit_` gọi sau `finalizeTx_` | Audit lưu bền (PENDING) **trước** khi commit; `recoverStale_` hoàn tất hoặc hoàn tác; mã nhật ký xác định theo giao dịch nên phục hồi lặp không trùng; lỗi ghi nhật ký làm giao dịch không ghi dữ liệu |
| G | (Báo cáo kiểm thử bản 2, P1) Đảo hóa đơn / tạo hóa đơn nháp sau ngày chốt làm đổi phân loại hóa đơn của R09 quá khứ | `accrualAt_` đọc trạng thái hiện tại của khoản | Dựng trạng thái tại ngày chốt từ lịch sử liên kết DebtLine.accrualId + ngày ghi nhận/đảo/ngày tạo hóa đơn (`accrualCtx_`, `accrualInvState_`) |
| H | (Báo cáo kiểm thử bản 2, P1) Điều chỉnh giảm giá dịch vụ không vào doanh thu R09 | R09 tổng hợp từ Accrual, bỏ qua DebtLine điều chỉnh | Cộng điều chỉnh đã ghi nhận (ADJ_INC/ADJ_DEC) vào khoản gốc từ ngày hiệu lực; khoản chia nhiều đơn chia theo tỷ lệ; danh sách/chi tiết đơn cũng dùng số đã điều chỉnh |
| I | (Báo cáo kiểm thử bản 3, P1) Xóa/từ chối hóa đơn sau ngày chốt làm đổi phân loại R09 quá khứ | Lịch sử dựng từ `repoValid_` (đã loại bản ghi xóa mềm); REJECTED bị bỏ qua theo trạng thái hiện tại | Đọc cả bản ghi xóa mềm qua `repoCommitted_` (chỉ để dựng lịch sử); thời điểm xóa = updatedAt; hóa đơn bị từ chối vẫn giữ khoản (đúng nghiệp vụ) |
| J | (Báo cáo kiểm thử bản 3, P2) Điều chỉnh khoản chia nhiều đơn làm tròn từng phần, tổng lệch công nợ | `Math.round` độc lập từng đơn | `apportion_`: chia cả bộ phần cùng lúc, phần dư theo phần lẻ lớn nhất, bảo toàn tổng; kiểm 2/3/4/5 đơn, VND/USD, tăng/giảm |
| F | Hiển thị hạn thanh toán thiếu | Nhãn "Thiếu hạn/Chưa có" | Thống nhất **"Chưa xác định hạn"**, không tính quá hạn |

## 2. Kết quả kiểm thử thực tế (mock/local)

`node 4_TESTS/run-all.cjs` → **27/27 tệp đạt**; `prompt2` nay 178 khẳng định (thêm ca F–I cho các lỗi của báo cáo kiểm thử bản 2 và 3; các ca đều báo lỗi trên bản cũ, đạt trên bản mới), trong đó `prompt2.regression.test.cjs` 116 khẳng định, `reject.regression.test.cjs` 71 khẳng định "bị từ chối và không ghi gì". Ngoài ra: kiểm cú pháp toàn bộ script trong `index.html`, và Playwright smoke với Backend giả (các màn hình mở không lỗi; màn Luồng nghiệp vụ kiểm bằng kịch bản riêng).

| Yêu cầu kiểm thử | Tệp | Trạng thái |
|---|---|---|
| 1. Chứng từ khác ngày ghi nhận, qua hai kỳ | prompt2 (A, A2) | Đạt (mock) |
| 2. Sửa, hủy, chuyển ngày, nhập hàng loạt vào kỳ khóa | prompt2 (B), reject | Đạt (mock) |
| 3. Báo cáo quá khứ trước/sau ngày hủy/đảo | prompt2 (B2) | Đạt (mock) |
| 4. OPEN/INVOICING/INVOICED không mất, không trùng | prompt2 (C) | Đạt (mock) |
| 5. Thu hộ/chi hộ cân/lệch, phí dịch vụ riêng | prompt2 (D) | Đạt (mock) |
| 6. Thanh toán một phần/nhiều lần, đảo phân bổ, chặn vượt số dư | prompt2 (E) | Đạt (mock) |
| 7. Gửi lặp cùng requestId; hai người cùng sửa | txaudit (mục 2, 7, 8) | Đạt (mock) |
| 8. Dừng tại các bước giao dịch rồi phục hồi dữ liệu + audit | txaudit (mục 2–4) | Đạt (mock) |
| 9. Migration trên dữ liệu cũ, chạy lại | hdr | Đạt (mock) |
| 10. Đối chiếu FWD/CBT/NCC/BMT với file Excel | — | **KHÔNG THỰC HIỆN**: tệp Excel tham chiếu không có trong tệp đính kèm |

## 2b. Giao diện (yêu cầu bổ sung)
- **Bộ lọc thông minh:** nhúng thư viện HAK Smart Filter (repo HAK_SMART_FILTER v1.0.0: core + popover + UI, nhúng thẳng vào `index.html` vì Apps Script không nạp tệp ngoài) cho 4 màn danh sách: Đơn hàng/PO, COST, Phải thu/Phải trả, Thu/Chi. Lọc phía máy chủ (giữ phân trang), trạng thái lọc nằm trên địa chỉ trang; có chip, ngăn nâng cao, lưu bộ lọc (localStorage). Đã chạy kịch bản Playwright với Backend giả (chọn lọc nhanh, gõ tìm, ngăn nâng cao, bỏ chip, mở lưu bộ lọc: đạt). Chưa chạy trên Apps Script thật. Các màn còn lại (Đối tác, Nhắc nợ, Sao kê…) vẫn dùng bộ lọc cũ.
- **Menu:** nhãn menu không xuống dòng (cắt bằng dấu …, có tooltip), thanh bên rộng 268px, tab cuộn ngang thay vì xuống dòng, nút không ngắt chữ.
- **Biểu mẫu:** nhãn trên – ô nhập – trợ giúp dưới đồng nhất; lưới thẳng hàng; ô tick đặt cùng hàng với nhãn; hộp thoại nhập liệu chia hai cột (một cột trên điện thoại). Kiểm bằng ảnh chụp màn hình ở 1366px và 390px với Backend giả.


## 2c. Nâng cấp giao diện, bảng cha–con, bộ lọc thông minh (theo PROMPT_NANG_CAP_GIAO_DIEN)
**Đã làm**
- **Bộ lọc (C):** lõi `core/smart-filter.js` nhúng NGUYÊN VĂN (commit `51816814f1224e8d0f666dc9a3cc1c66ca440b83`, đã so `cmp`), giao diện lọc viết riêng (thay bản bộ điều hợp tạm ở lần trước). Thanh lọc: tìm không dấu, Từ/Đến ngày, chọn Kỳ, Lọc, Lọc nâng cao (hộp chia nhóm: đối tượng, trạng thái, số tiền, hạn thanh toán, điều kiện nhanh), Xóa lọc, bộ lọc đã lưu; chip, dòng "Kết quả: N dòng · Phạm vi lọc: …"; trạng thái trong URL; liên kết cũ vẫn chạy. Máy chủ: tham số `adv` (`sel`/`range`/`flag`) kiểm tra chặt từng màn hình (khóa lạ, cờ màn khác, khoảng đảo, ngày sai, số tiền không nguyên, > 50 giá trị, số tiền không có đúng một tiền tệ → `VALIDATION_FAILED`); lọc chạy sau giới hạn phạm vi; không thêm lần đọc Sheets.
- **Cha–con (B):** Công nợ (dòng phí + phân bổ), Đơn hàng/PO (khoản phát sinh kể cả phần chia), Phiếu thu/chi (phân bổ). Tải theo yêu cầu bằng `doc.get`/`order.get`/`payment.get`, ghi nhớ, Mở/Thu gọn tất cả (song song 3), `aria-expanded`/`aria-controls`, Enter/Space, thẻ trên điện thoại, lỗi kèm Thử lại. Đối chiếu do máy chủ trả về trong `reconcile` (`childOk`, `allocOk`, `splitMismatches`…); giao diện chỉ hiện Khớp/Lệch.
- **Giao diện (A):** menu một dòng (nowrap, "…", `title`, không co khi cuộn), ngăn kéo điện thoại đóng bằng Esc/bấm ngoài; form: nhãn–ô–gợi ý đồng nhất, ô ≥ 40px, ô tick trong khung, hộp thoại 2 cột/1 cột, ô phụ thuộc (thuế suất) hiện mờ thay vì biến mất.
- **Hiệu suất (5):** cache đọc gộp `getAll` (khóa phiên bản + đầu của mọi bảng một lần).
- **Nguồn:** `6_NGUON/` + `build.py`; `AN_TOAN_KHI_DAN/` không còn chú thích.

**Số đo trước/sau — TRÊN GIẢ LẬP (Node, Sheet/Cache giả đếm lệnh), N = 3.000 chứng từ; CHƯA đo trên Google thật**
| Thao tác | Cache get lẻ (trước → sau) | getAll (trước → sau) | Lần đọc Sheet | Ô đọc |
|---|---|---|---|---|
| doc.list, cache ấm | 8 → 0 | 4 → 5 (1 gộp + 4 phần dữ liệu) | 0 → 0 | 0 → 0 |
| doc.list, cache nguội | 8 → 0 | 0 → 1 | 4 → 4 | 312.740 → 312.740 |
| workbench.summary, ấm | 12 → 1 | 4 → 5 | 2 → 2 | 33 → 33 |
| payment.list, ấm | 10 → 0 | 4 → 5 | 1 → 1 | 24.000 → 24.000 |
Tổng số lệnh cache: doc.list ấm 12 → 5. Byte phản hồi doc.list: 10.991 → 11.029 (thêm trường `adv`). Số lần đọc Sheet và số ô đọc không đổi khi lọc (đúng yêu cầu không đọc thêm). Màn Bàn làm việc dùng điểm cuối nhẹ `workbench.summary` (test khẳng định không gọi `dashboard.summary`).

**Kiểm thử đã chạy**: 29/29 tệp test Backend (có thêm `adv.regression` 67 khẳng định, `cache`); 7/7 nhóm giao diện Chromium (59 khẳng định, google.script.run nối tới Backend.gs thật + Sheet giả): mọi menu dựng xong không lỗi JS/console, thanh lọc/chip/lưu/mở bộ lọc đã lưu (kể cả báo điều kiện bị bỏ), mở/thu gọn dòng con ở 3 màn, lỗi mạng + Thử lại, bản điện thoại, nhãn menu dài. Cả hai bộ test cũng chạy lại trên bản `AN_TOAN_KHI_DAN`. Ảnh trước/sau: `6_ANH_TRUOC_SAU/`.

**Chưa làm / hạn chế**
- Chưa chạy trên Apps Script/Sheets thật (đặc biệt: localStorage trong khung iframe của Apps Script có thể bị chặn → bộ lọc đã lưu chỉ giữ trong phiên và có cảnh báo; getAll thật; hạn mức).
- Danh sách chứng từ/đơn/phiếu **chưa có xuất Excel/in** nên chưa có chuyện "màn hình = Excel = in"; chuỗi phạm vi lọc dùng chung đã sẵn để gắn khi có chức năng xuất.
- Bộ lọc đã lưu nằm trong trình duyệt từng người; chưa có phiên bản lược đồ riêng ngoài `schema` của lõi lọc.
- Màn COST dùng điều kiện phẳng (không `adv`); các màn khác (Đối tác, Nhắc nợ…) vẫn bộ lọc cũ.
- Đối chiếu đơn hàng: tổng khoản vs theo trạng thái hóa đơn + phần chia; đối chiếu "khoản vs dòng hóa đơn" chưa làm.
- `Backend.gs` chưa tách thành nhiều tệp nguồn.
- Chưa kiểm bằng phông hệ thống lớn hơn thật (đã kiểm nhãn dài và phóng 130% bằng CSS).
- Đã chạy lại các test cũ: tất cả đạt; không sửa test nào để xanh (một số mock test cũ phải bổ sung `repoCommitted_` từ lần trước).

## 2d. Mẫu báo cáo PDF/Excel chuyên nghiệp + tham mưu logistics
- **Mẫu mới (mọi báo cáo R01–R12):** khối tiêu đề (doanh nghiệp, MST, ĐT/email, mã mẫu), tên báo cáo, kỳ/ngày chốt/bộ lọc/cơ sở ngày, nhãn BẢN NHÁP/BẢN CHỐT, khối TÓM TẮT theo từng tiền tệ, tiêu đề bảng xanh đậm cố định/lặp khi in, dòng so le, dòng nhóm/cộng/tổng khác màu, số thật căn phải có định dạng theo số lẻ tiền tệ (số âm đỏ), ngày dd/MM/yyyy, bằng chữ, ghi chú, khối chữ ký (người lập/kiểm tra/duyệt hoặc hai bên), chân trang; A3 cho báo cáo > 14 cột; Excel có thêm trang "Hướng dẫn đọc". Bố cục là hàm thuần `reportLayout_` (test được).
- **Báo cáo mới R12 – Dự báo dòng tiền thu – chi theo hạn** (ưu tiên ngày dự kiến thanh toán, rồi hạn; từng tiền tệ; khoản chưa xác định hạn nằm riêng, không vào lũy kế).
- **Tham mưu:** `7_MAU_BAO_CAO/THAM_MUU_BAO_CAO_LOGISTICS.md` (bộ báo cáo theo người dùng, KPI, kiểm soát đặc thù, dữ liệu nên bổ sung, thứ tự ưu tiên, việc cần quyết định).
- **Kiểm thử:** `4_TESTS/report-layout.test.cjs` 50 khẳng định (bố cục, R12 theo số tính tay, áp lên Sheets giả); 30/30 tệp test Backend, 7/7 nhóm giao diện. **Chưa xuất thử trên Google Sheets/Drive thật**: hiển thị PDF/Excel thật cần kiểm trên bản sao. Ảnh/tệp xem trước ở `7_MAU_BAO_CAO/xem_truoc/` dựng bằng openpyxl/LibreOffice từ cùng bố cục, không phải tệp từ Google.
- **Cập nhật (R12 và tiêu đề):** R12 trừ tiền khách thu/tiền chi NCC chưa phân bổ thành dòng bù trừ riêng + dòng "dự kiến sau bù trừ", có chế độ chia theo tuần (4 tuần đầu), từ chối cách chia không hợp lệ. Tiêu đề: băng lặp mỗi trang thu còn 3 hàng (khoảng 100px, trước đây ~170px; đã thấy trên bản xem trước nhiều trang), nhãn BẢN NHÁP/BẢN CHỐT nằm trong băng nên có ở mọi trang; điều kiện lọc và tóm tắt chuyển xuống thân (trang đầu); tiêu đề dài tự giảm cỡ chữ và tăng chiều cao để không cắt dấu; bảng hẹp (R06) dùng khối đầy đủ không đóng băng. Test `report-layout` nay 68 khẳng định.
- **Hạn chế đã biết:** R09 (19 cột) vẫn rất dày dù A3; R12 chưa gồm thuế, tỷ giá, lương, chi phí cố định; KPI DSO/DPO, tập trung khách hàng chưa tính tự động; chưa xuất thử trên Google thật.

## 2e. Tải dữ liệu chậm — nguyên nhân tìm được và cách xử lý
**Đo trên giả lập (Node; 10.000 chứng từ, 20.000 dòng phí, 9.000 khoản phát sinh; Sheet/Cache giả đếm lệnh) — CHƯA đo trên Google thật.** Số mili giây là CPU của máy giả lập, không đại diện thời gian Google; con số đáng tin để so sánh là số lần đọc Sheets/Cache.
| Nguyên nhân | Biểu hiện | Xử lý |
|---|---|---|
| Đọc nguội: mỗi bảng lớn phải đọc nguyên bảng từ Sheets (doc.list: 4 lần đọc, ~1.040.000 ô); bộ nhớ đệm bảng chỉ sống 5 phút nên cứ 5 phút lại có người gặp lần đọc nguội | Nguyên nhân chính khi dữ liệu lớn: ~1,8–2,7 giây CPU chỉ để đọc/chuyển đổi, trên Google thường lâu hơn nhiều | Thời gian sống của đệm bảng 5 → 30 phút (vẫn tự vô hiệu ngay khi có thao tác ghi) + **làm ấm tự động** trong bộ kích hoạt 5 phút sẵn có (`recoverTrigger` gọi `warmCache_`) để người dùng hiếm khi gặp đọc nguội |
| Nhiều lệnh cache lẻ: mỗi bảng 2–3 lệnh `get` + 1 `getAll` | doc.list ấm: 12 lệnh cache | Gộp: 1 `getAll` cho mọi khóa phiên bản/đầu → còn 5 lệnh (làm trong lượt trước) |
| Cùng một màn hình mở lại phải tính lại toàn bộ | doc.list ấm vẫn ~250–400 ms CPU (giải nén + phân tích JSON các bảng) | **Đệm kết quả đọc** (`cachedRead_`): cùng người dùng + phạm vi + hành động + tham số + phiên bản dữ liệu + ngày → trả kết quả cũ: doc.list lần hai còn **1 ms CPU, 0 lần đọc Sheet, 1 lệnh cache** (trước: ~350 ms, 8 lệnh get + 4 getAll). Mọi thao tác ghi tăng phiên bản dữ liệu nên khóa cũ tự mất hiệu lực; chỉ áp cho các hành động đọc thuần |
| Mở ứng dụng phải gọi tuần tự 2 lượt qua Gateway (bootstrap rồi số liệu Bàn làm việc), mỗi lượt qua hai tầng Apps Script | Chậm cảm nhận khi vào ứng dụng | Gộp thành **một lượt gọi** (`sys.batch`: bootstrap + workbench.summary); lỗi thì tự quay về cách gọi cũ |
| Bản trước của tôi thêm `accrualCtx_` quét lại toàn bộ dòng phí ở mỗi lần xem đơn hàng | Thêm ~170–340 ms CPU mỗi lần xem danh sách đơn | Viết lại thành một lượt qua dữ liệu, bỏ các bản sao thừa |
Test: `cache.test.cjs` (đệm kết quả khác người dùng/phạm vi/vai trò/phiên bản/tham số thì khác khóa; không đệm hành động không thuần đọc, kết quả > 90KB, lỗi; làm ấm), `ui.e2e.cjs` (khởi động đúng 1 lượt gọi gộp), `dupfn.test.cjs` (bắt khai báo trùng tên hàm — chính lỗi trùng `rcKey_` đã xảy ra khi làm và được test cũ phát hiện).
**Còn lại / hạn chế:** chưa đo thời gian thật trên Google (cần đo trước/sau trên bản sao: mở Console trình duyệt gõ `copy(JSON.stringify(__perf()))` rồi gửi lại để tôi phân tích từng hành động); độ trễ hai tầng Gateway–Backend (~1 giây mỗi lượt) không loại bỏ được; khi dữ liệu thật sự lớn (hàng chục nghìn chứng từ) nên chạy lưu trữ/dọn dữ liệu cũ vì hệ thống vẫn đọc cả bảng; sửa tay trên Sheet có thể thấy chậm tối đa 30 phút (hoặc chạy `clearReadCache()`); đệm kết quả chiếm bộ nhớ đệm chung của script (tự hết hạn sau 10 phút).

## 2f. Bảng tổng hợp dựng định kỳ bằng bộ kích hoạt (giải pháp tải chậm, theo đề xuất của chị)
**Ý tưởng:** thay vì mỗi lần mở màn hình phải đọc/tính lại cả sổ, bộ kích hoạt 5 phút **dựng sẵn** số liệu tổng hợp vào một sheet nhỏ `ReadModel` (nằm ngay trong bảng tính dữ liệu chính); màn hình chỉ đọc sheet nhỏ đó. Mở màn hình không còn phụ thuộc kích thước sổ.
- **Dựng sẵn 6 mô hình:** khách hàng/NCC (dư nợ theo nhóm và tiền tệ, quá hạn, đến hạn 7 ngày, chưa xác định hạn, tiền chưa phân bổ), PO chưa thanh toán/chưa lập hóa đơn, chi phí chưa thanh toán, và số liệu Bàn làm việc / Tổng quan / chưa lập hóa đơn.
- **Màn mới "Tổng hợp công nợ"** (3 tab) + Bàn làm việc và Tổng quan dùng bản dựng sẵn (người có phạm vi toàn bộ, không kèm bộ lọc). Mọi màn ghi rõ thời điểm dựng, số thay đổi chưa vào bảng, nút **Tính lại ngay** (tính trực tiếp rồi cập nhật bảng cho mọi người).
- **Chỉ dựng lại khi cần:** bộ kích hoạt so phiên bản dữ liệu/ngày; không đổi thì không làm gì. Dựng theo hàng rào đọc nhất quán (không dựng khi đang có giao dịch dở); không đi qua `runTx_`, không tăng phiên bản dữ liệu, không ghi nhật ký (đây là dữ liệu dẫn xuất, xóa/dựng lại được bất cứ lúc nào, `rebuildSummaries()`).
- **Phạm vi người dùng:** hàng dựng sẵn mang khóa (đối tác, nhóm) và được lọc theo phạm vi của từng người **khi đọc** (test với người bị giới hạn đối tác + nhóm); người có phạm vi hẹp luôn tính trực tiếp ở Bàn làm việc/Tổng quan.
- **Độ tươi:** bản dựng sẵn phục vụ nếu cùng ngày và không quá 15 phút (cấu hình `summary.maxAgeMin`); quá hạn hoặc chưa có thì tính trực tiếp và lưu lại. Sau khôi phục/quay lại cơ sở dữ liệu, mọi bản dựng sẵn bị bỏ.
- **Số đo (giả lập, N = 10.000 chứng từ; chưa đo trên Google thật):** đọc "Khách hàng/NCC" từ bảng tổng hợp: **3 lần đọc Sheet, 1.862 ô, ~4 ms CPU**, độc lập với kích thước sổ; tính trực tiếp khi bảng đã ấm ~250 ms CPU, và khi đọc nguội phải đọc ~1.040.000 ô (~2 giây CPU giả lập, trên Google thường lâu hơn nhiều). Bộ kích hoạt dựng 6 bảng: ~1,8 giây CPU chạy nền, người dùng không chờ.
- **Test:** `readmodel.test.cjs` (66 khẳng định: đọc lại = tính trực tiếp, giá trị tính tay, phạm vi, độ tươi/live, chia mảnh/mảnh lệch/quá lớn, hàng rào đọc, vô hiệu hóa sau khôi phục, không đổi dataVersion) và nhóm 8 của `ui.e2e.cjs`.
- **Đổi cấu trúc dữ liệu (nêu rõ):** thêm bảng `ReadModel` (schema 1.9 → 2.0). `ensureSchema()` tự tạo; không đổi bảng cũ. **Quay lui:** bản Backend cũ bỏ qua sheet `ReadModel`, có thể xóa sheet đó.
- **Hạn chế:** số liệu ở các màn dựng sẵn có thể chậm tối đa ~5 phút (hoặc 15 phút nếu bộ kích hoạt hỏng) so với thao tác ghi mới nhất, và màn ghi rõ điều đó; chưa dựng sẵn cho danh sách chứng từ/phiếu chi tiết và báo cáo (vẫn tính trực tiếp, có đệm); chưa đo trên Google thật; mỗi mô hình lớn hơn khoảng 2,4 MB (60 mảnh × 40.000 ký tự) sẽ không lưu được và tự quay về tính trực tiếp; khối lượng chạy của bộ kích hoạt tính vào hạn mức thời gian trigger hằng ngày của Google.

## 2b. Đợt V6 (schema 2.1): nguồn chuẩn – xem nhanh – đối soát – lưu trữ PO
**Bước 1 – bảng tổng hợp đáng tin:**
- **Một bộ, một phiên bản:** cả 6 mô hình (Khách hàng/NCC, PO, Chi phí, Bàn làm việc, Tổng quan, Chưa lập HĐ) được dựng dưới CÙNG một phiên bản dữ liệu rồi ghi vào khe còn lại (A/B); **bản kê (MANIFEST)** được ghi sau cùng và là điểm công bố duy nhất. Lỗi giữa chừng thì bản kê vẫn trỏ bộ cũ nguyên vẹn (test: gây lỗi ở mô hình thứ 3, bộ cũ vẫn đọc được). Không còn tình trạng màn này theo phiên bản 7, màn kia theo phiên bản 8.
- **Cảnh báo và hiển thị lỗi:** mỗi lần dựng lỗi được ghi vào bản kê (số lần liên tiếp, thông điệp, lần thành công gần nhất); từ lần thứ 3 gửi email quản trị (không quá 1 lần / 2 giờ); bản dựng cũ hơn 3 lần hạn mà dữ liệu đã đổi cũng cảnh báo. Đầu các màn tổng hợp hiện dòng đỏ “Lần dựng gần nhất lỗi (n lần)”. Lỗi do người dùng bấm xem không tính vào bộ đếm (tránh báo nhầm khi chỉ bận tạm thời).
- **Đối soát hằng đêm (02:00, `reconcileTrigger`) + nút “Chạy đối soát ngay”:** chỉ ĐỌC, không sửa dữ liệu. Kiểm: tổng dòng = tổng chứng từ; bản ghi mồ côi (dòng/phân bổ/phiếu/phát sinh đã lập HĐ/đối tác); phân bổ không vượt số tiền phiếu và cùng loại tiền; đơn đã đóng còn phát sinh dở; **tổng công nợ tính độc lập từ dữ liệu gốc khớp bảng tổng hợp theo từng chiều–loại tiền**; bảng tổng hợp = kết quả tính trực tiếp; PO đã lưu trữ nhưng còn nghĩa vụ; giao dịch ghi dở. Có LỖI thì gửi email quản trị. Kết quả xem ở tab *Đối soát* (cần quyền `audit.read`).
**Bước 2 – lưu trữ PO theo prompt V6:**
- Lưu trữ **chỉ đổi trạng thái** (`archivedAt/By/Note` trên Order); chứng từ, dòng, phát sinh, phân bổ, ID và liên kết không đổi (test so sánh nguyên vẹn trước/sau).
- **Điều kiện chặn cứng:** đơn phải “Đã đóng”; phải có doanh thu/chi phí; không còn khoản chưa lập xong hóa đơn; không còn chứng từ chờ duyệt/ghi sổ; **hết phải thu và phải trả xét RIÊNG từng chiều–đối tác–tiền tệ (không bù trừ)**; người dùng phải tích xác nhận đã tập hợp đủ doanh thu/chi phí/chứng từ.
- **Cảnh báo phải xác nhận kèm ghi chú:** đối tác còn tiền ứng/chưa phân bổ cùng loại tiền; thu hộ–chi hộ lệch; đơn chỉ có một phía (chỉ doanh thu hoặc chỉ chi phí).
- **PO hết phải thu nhưng còn phải trả vẫn được theo dõi:** không lưu trữ được; ở *Tổng hợp công nợ → PO chưa thanh toán* đơn đã đóng vẫn hiện, có cột mới “Phải trả NCC còn lại”.
- **Ẩn/hiện:** PO lưu trữ không hiện ở danh sách đơn và tổng hợp mặc định; bộ lọc “Hiện cả PO đã lưu trữ” / “Chỉ PO đã lưu trữ”.
- **Mở lại:** nút *Mở lại lưu trữ* (bắt buộc lý do, ghi nhật ký) giữ nguyên ID/lịch sử; sau đó mở lại đơn và ghi nhận thêm bình thường. Đơn đang lưu trữ không đổi trạng thái trực tiếp.
- **Test:** `readmodel.test.cjs` (113 khẳng định, thêm bộ nhất quán/lỗi giữa chừng/cảnh báo/đối soát gài lỗi), `archive-po.test.cjs` (57 khẳng định, 8 nhóm), nhóm 9 của `ui.e2e.cjs`.
- **Đổi cấu trúc dữ liệu (nêu rõ):** thêm 3 cột cuối bảng Order (schema 2.0 → 2.1) — `ensureSchema()` tự thêm. Thêm bộ kích hoạt `reconcileTrigger` (chạy `installTriggers()`).
- **CHƯA làm (có chủ đích):** sheet DRAFT tách riêng; tổng hợp gia tăng (dirty-queue) — hiện vẫn dựng lại cả bộ khi dữ liệu đổi; so sánh “gia tăng = dựng lại toàn bộ” vì thế chưa cần. **Chưa chạy trên Apps Script/Sheets thật** (mọi test dùng Sheet/Cache giả): thời gian dựng cả bộ và hạn mức 6 phút cần đo bằng dữ liệu thật sau khi triển khai.

## 2c. Chứng từ/phiếu bị từ chối và ô nhập dài
- **Quyền khi bị từ chối (chứng từ và phiếu thu/chi):** người lập (nhập liệu) được **sửa và gửi duyệt lại**, không xóa; người duyệt (APPROVER) được **xóa**, không sửa/gửi lại thay người lập. Máy chủ chặn cả khi gọi thẳng API (FORBIDDEN). Bản nháp giữ quy tắc cũ. Test: `reject-perm.test.cjs`.
- **Giao diện:** diễn giải dòng phí, nội dung khoản phát sinh và ghi chú (đơn, khoản, phiếu, nhập nhanh) là ô nhiều dòng tự giãn theo nội dung; chữ trong bảng và thông báo (kể cả lý do từ chối) tự xuống dòng, giữ xuống dòng người nhập. Cột số tiền/ngày vẫn một dòng. Chưa kiểm tay trên điện thoại thật.

## 2d. Xử lý báo cáo kiểm tra V7
- **[P1] Cache phản hồi cũ:** khóa cache của Tổng quan, Bàn làm việc, Chưa lập HĐ và khởi động nay có thêm “thế hệ bộ tổng hợp” (`RM_GEN`, đổi mỗi lần công bố/vô hiệu hóa). Dựng lại không còn bị cache che. Test hồi quy nhóm 12.
- **[P1] Kiểm lại trong khóa:** sau khi lấy khóa công bố, kiểm lại phiên bản nguồn, giao dịch dở và bản kê mới hơn; đổi thì bỏ bản dựng, giữ bộ cũ, không tính là lỗi (đã thử bằng cách gỡ kiểm tra → test hỏng).
- **[P2] Mở màn không dựng cả bộ:** đường đọc chỉ tính riêng mô hình cần (không công bố); dựng cả bộ chỉ khi bấm “Tính lại ngay” hoặc lần đầu chưa có bộ nào; việc dựng nền do bộ kích hoạt.
- **[P2] Chống dựng chồng:** giấy phép dựng (`RM_LEASE`, hết hạn 5 phút).
- **CHƯA làm (nói rõ):** khóa ghi vẫn giữ suốt bước ghi bộ (chưa chuyển sang staging + công bố khóa ngắn); file DRAFT riêng, dấu cập nhật bền vững, tổng hợp gia tăng; chu kỳ bộ kích hoạt vẫn 5 phút (chưa 10). Chưa đo trên Google thật.

## 2e. File DRAFT/XEM NHANH, bản nháp nhập liệu, trigger 10 phút (schema 2.2)
- **Bước 1 – tách file:** `ReadModel` (xem nhanh) và bảng mới `DraftEntry` (bản nháp) nằm trong file `CONGNO_DB_DRAFT` (`DB_DRAFT_ID`); sổ nghiệp vụ vẫn ở CHÍNH. Chưa cấu hình thì chạy như cũ. Có `setupDraftDb()` cho hệ thống đang chạy và tự tạo khi `setupBackend()`. Sao lưu sao chép cả file DRAFT.
- **Dựng bảng tổng hợp ít chặn ghi sổ hơn:** ghi vào khe A/B không đang công bố được làm NGOÀI khóa script (đã có giấy phép dựng một lượt); khóa script chỉ giữ trong bước công bố (kiểm lại nguồn + lật bản kê). Lưu ý trung thực: LockService là khóa toàn script, nên việc tách file không tự giảm khóa — mức giảm đến từ việc không còn giữ khóa suốt lúc ghi.
- **Bước 2 – bản nháp nhập liệu:** form chứng từ, phiếu thu/chi, đơn hàng, doanh thu/chi phí tự lưu nháp 1,5 giây sau khi ngừng gõ (hoặc khi chuyển tab). Mở lại form có thông báo “Có bản nháp chưa lưu — Khôi phục / Bỏ”. Menu mới **Bản nháp của tôi**. Chỉ chủ bản nháp đọc/sửa/xóa (người khác nhận NOT_FOUND/FORBIDDEN, kể cả quản trị). Nháp không đi qua ghi sổ: không đổi phiên bản dữ liệu, không ghi nhật ký, không kích hoạt dựng lại tổng hợp. Lưu thật (doc/payment/order/accrual.save) thành công thì máy chủ mới dọn nháp tương ứng; lỗi thì giữ nháp; tự lưu gửi muộn sau khi đã dọn không làm nháp “sống lại”. Gửi lại cùng mã nháp không tạo trùng. Nháp dựa trên bản ghi có sẵn mang phiên bản gốc: nếu bản ghi đã đổi thì báo “Bản ghi gốc đã thay đổi”. Tự xóa sau 30 ngày; tối đa ~45.000 ký tự/nháp.
- **Bước 3:** `recoverTrigger` 10 phút; chạy lại `installTriggers()` không tạo trùng. Nút “Làm mới/Tính lại ngay” giữ nguyên.
- **Test:** `draft-entry.test.cjs` (34 khẳng định: chủ sở hữu, idempotent, không đổi dataVersion/nhật ký, làm mới không đụng nháp, dọn khi lưu thật/lỗi/gửi muộn, bản gốc đổi/mất, dọn quá hạn, định tuyến file, ghi khe ngoài khóa), nhóm 10 của `ui.e2e.cjs` (gõ → tự lưu → mở lại → khôi phục → lưu thật dọn nháp, trên Chromium thật).
- **Hạn chế/chưa làm:** chưa thử trên Apps Script/Sheets thật (hai file, quyền Drive, thời gian ghi); khôi phục theo từng ô nhập dựa trên thứ tự ô trong form nên nếu sau này form đổi cấu trúc thì nháp cũ có thể khôi phục thiếu; nháp không tự gộp khi hai tab cùng sửa (tab nào lưu sau thắng); phần xung đột “bản ghi gốc đổi” chỉ cảnh báo, chưa so sánh từng trường.

## 2f. Kiểm tra bản 8 (FIX_HIEU_SUAT) và sửa tiếp
- Nền: bản `congno_deploy_v8_FIX_HIEU_SUAT` (giữ các sửa của họ: ifVersion cho nháp, dọn nháp theo phiên bản, hash bỏ draftId/draftVersion, lease có token, khóa cache theo định danh file, chỉ mục tra ID…).
- **Sửa 1:** `repoFind_` dùng chỉ mục nhưng `setOpenTx_` chưa xóa chỉ mục → sau khi giao dịch COMMITTED vẫn không thấy dòng mới. Nay xóa cả `idx:` và `c:`.
- **Sửa 2:** gửi lại lần lưu nháp đã tới máy chủ nhưng mất phản hồi (`ifVersion` cũ) không còn báo xung đột nếu nội dung giống hệt; nội dung khác vẫn là xung đột thật. Test `v9-fix.test.cjs`.
- **COST:** chi phí thuộc một đơn đang mở nay có nút **Sửa/Hủy ngay tại màn COST**; bấm vào dòng mở form sửa (bấm vào số đơn mới sang trang đơn). Khoản đã lập hóa đơn hoặc đơn đã đóng thì không sửa (đúng quy tắc cũ). Test giao diện nhóm 11.
- Còn lại (nhẹ): nếu một lượt tự lưu nháp đang chờ đúng lúc bấm Lưu, nháp có thể được giữ lại kèm thông báo (không mất dữ liệu).

## 2g. Cột PO ở công nợ và màn Phân bổ thu/chi
- **Cột “Đơn hàng/PO”** ở danh sách Phải thu và Phải trả: số đơn (bấm sang đơn) + số PO khách; chi phí có thêm “PO NCC” (số PO gửi nhà cung cấp); chi phí chia nhiều đơn hiện từng đơn (“+n đơn khác”); hóa đơn nhập trực tiếp ghi “Không gắn PO”, dư đầu kỳ ghi “Dư đầu kỳ”. Nguồn: dòng phí → khoản phát sinh → đơn (và phần chia).
- **Tìm nhanh** theo số đơn, số PO khách, PO NCC. **Bộ lọc nâng cao:** “Đơn hàng / PO” (chọn nhiều) và “Chỉ chứng từ chưa gắn PO”. Phạm vi người dùng vẫn áp dụng. Test `po-column.test.cjs`.
- **Phân bổ thu/chi** (trước đây chỉ nằm trong chi tiết phiếu): (1) menu mới **Phân bổ thu/chi** (nhóm Công nợ và thu chi) liệt kê phiếu thu và phiếu chi đã ghi nhận còn tiền chưa phân bổ, bấm *Phân bổ* để chọn hóa đơn (có gợi ý FIFO); (2) nút **Phân bổ thu/chi** ngay trong chi tiết hóa đơn còn nợ: chọn phiếu cùng đối tác/tiền tệ/chiều rồi phân bổ vào chính hóa đơn đó; (3) vẫn có ở chi tiết phiếu. Quy tắc server không đổi (kỳ mở, không vượt số tiền, cùng tiền tệ). Test giao diện nhóm 12.

## 2h. Tên viết tắt trên logo/menu
- Thêm cấu hình **`entity.shortName`** (Thiết lập → Cấu hình, ô “Tên viết tắt”). Logo/menu trái hiện tên viết tắt (dòng một), vòng tròn logo hiện chữ cái đầu (tối đa 4); rê chuột vào tên để xem tên đầy đủ. Báo cáo, thư nhắc nợ, phiếu in vẫn dùng **tên đầy đủ** (`entity.name`).
- Nếu chưa nhập, hệ thống tự rút gọn từ tên đầy đủ: bỏ “CÔNG TY TNHH/CỔ PHẦN…”, bỏ phần sau dấu gạch (tên tiếng Anh), lấy chữ cái đầu (ví dụ “CÔNG TY TNHH GLOBAL MULTI LOGISTICS - …” → **GML**). Chưa có tên nào thì hiện “KATY AP/AR”. Không cần migration. Test giao diện nhóm 13.

## 2i. Kiểm tra bản 9 và hàng chờ duyệt
- Bản `congno_deploy_9` trùng hoàn toàn với bản em gửi trước (Backend/Gateway/giao diện giống từng byte sau khi chuẩn hóa xuống dòng); 38/38 test đạt trước khi sửa.
- **Phát hiện:** trước đây KHÔNG có nơi nào liệt kê “đang chờ tôi duyệt”: Bàn làm việc chỉ có một dòng tổng “n chứng từ chờ xử lý” (không tách người duyệt, không tính phiếu thu/chi, không bấm tới nơi xử lý); muốn duyệt phải vào danh sách Phải thu/Phải trả hoặc Thu/Chi, lọc trạng thái rồi mở từng mục.
- **Đã làm:** (1) API `approval.list` gom chứng từ + phiếu thu/chi + dư đầu kỳ đang chờ duyệt hoặc chờ ghi nhận theo đúng quyền/phạm vi của người xem; mục do chính mình lập/gửi không tính vào “chờ bạn” (tách riêng “đang chờ người khác”); (2) menu **Chờ duyệt** có **huy hiệu số** (làm mới tối đa 45 giây/lần và ngay sau mỗi thao tác ghi); (3) thanh thông báo màu vàng đầu **Bàn làm việc** bấm tới màn Chờ duyệt, các dòng “việc cần làm” cũng trỏ tới đây; (4) màn **Chờ duyệt/ghi nhận**: loại, số, đối tác, chiều, số tiền, ngày, người gửi, số ngày chờ (lâu nhất lên đầu); nút **Xem** mở chi tiết, **Duyệt/Từ chối/Ghi nhận** ngay tại danh sách, hộp xác nhận nêu rõ mục sắp duyệt; máy chủ vẫn kiểm quyền, phiên bản và nguyên tắc người lập ≠ người duyệt. Test `approval.test.cjs`, giao diện nhóm 14.

## 2j. Xử lý lỗi và hiệu suất vận hành (đợt “làm toàn bộ”)
**Xử lý lỗi**
- **Cảnh báo bền vững:** bảng mới `SystemAlert` (trong file DRAFT) — mọi cảnh báo gửi quản trị đều được GHI TRƯỚC rồi mới gửi email; trùng chủ đề thì gộp (đếm ×n, email tối đa 2 giờ/lần); email lỗi/hết hạn mức không làm mất cảnh báo (cột “Chưa gửi được”). Lỗi hệ thống bất ngờ (INTERNAL_ERROR) ở bất kỳ thao tác nào cũng tạo cảnh báo kèm thông điệp lỗi.
- **Màn “Trạng thái hệ thống”** (menu Hệ thống, có huy hiệu số): tình trạng chung OK/Cần chú ý/LỖI; cờ cảnh báo: chưa có bảng tổng hợp, bảng tổng hợp cũ, dựng lỗi liên tiếp, đối soát LỖI/quá cũ, giao dịch ghi dở, sao lưu thiếu/cũ/xác minh hỏng, lỗi ghi nhật ký, thiếu bộ kích hoạt, chưa tách file DRAFT; tuổi bản dựng, kích thước dữ liệu (số dòng), danh sách cảnh báo có nút Xác nhận; nút dựng lại. Quyền `sys.health`.
- **Thông báo lỗi dễ hiểu:** phân loại nhập sai / dữ liệu đã đổi (tải lại) / hệ thống bận (đợi) / mất mạng / thiếu quyền / lỗi hệ thống; mỗi loại có lời khuyên; lỗi hệ thống kèm **mã tham chiếu** (mã lỗi + 8 ký tự mã yêu cầu + thao tác) và nút sao chép để gửi quản trị. Không còn hiện chung “Lỗi không xác định”.
- **Sửa một điểm báo nhầm:** nguồn dữ liệu đổi trong lúc đang dựng bảng tổng hợp là chuyện bình thường khi nhiều người dùng; trước đây bị tính là lỗi dựng (có thể gây cảnh báo giả sau 3 lần) — nay bỏ lượt dựng đó và không tính lỗi.
- **Kiểm thử đồng thời (giả lập):** hai người duyệt cùng một chứng từ → người sau bị chặn (không duyệt hai lần); duyệt trong lúc đang dựng → bộ đã công bố nguyên vẹn. Test `ops.test.cjs`, `concurrency.test.cjs`, giao diện nhóm 15.
**Hiệu suất**
- Huy hiệu Chờ duyệt + Trạng thái: **một** lượt gọi gộp (sys.batch), không gọi khi tab ẩn, tối đa 45 giây/lần, `approval.list` được cache theo phiên bản dữ liệu.
- **`measureSystem()`**: hàm chạy trong trình soạn thảo Apps Script, chỉ đọc, đo THẬT trên Google: thời gian đọc từng bảng, dựng từng mô hình, lấy khóa, cache, danh sách chứng từ nguội, hàng chờ duyệt; gợi ý nếu mô hình nào dựng quá 20 giây. Gửi kết quả (Nhật ký thực thi) cho em để quyết định tối ưu tiếp.
- **CHƯA làm (có chủ đích):** (1) bảng dựng sẵn riêng cho danh sách chứng từ — chỉ có lợi khi bảng cache nguội, còn lúc đó bảng dựng sẵn cũng thường đã lỗi thời (mỗi lần ghi đổi phiên bản dữ liệu) nên lợi ích thấp so với rủi ro lệch dữ liệu; (2) tổng hợp gia tăng theo PO/đối tác — sai một phụ thuộc là số cũ mãi mãi; chỉ nên làm khi `measureSystem()` cho thấy dựng cả bộ vượt ~60 giây. Cả hai cần số đo thật trước khi làm.

## 2k. Nhập hàng loạt hóa đơn bán / hóa đơn mua
- Menu **Nhập hàng loạt** (trước là “Nhập PO/Cost hàng loạt”) có thêm 2 tab: **Hóa đơn bán (phải thu)** và **Hóa đơn mua / chi phí (phải trả)**. Dán từ Excel (cột cách nhau Tab) hoặc CSV, tối đa 500 dòng/lần.
- Mỗi dòng là một dòng phí; các dòng cùng đối tác + số hóa đơn + ký hiệu + tiền tệ được **gom thành một chứng từ NHÁP** nhiều dòng. 15 cột: đối tác (tên viết tắt/pháp lý/MST), số hóa đơn, ký hiệu, ngày hóa đơn, hạn thanh toán (trống = theo điều khoản đối tác), nhóm nghiệp vụ, tiền tệ, mã dịch vụ, loại phí, diễn giải, số tiền trước thuế, thuế (KCT / % / trống = chưa xác nhận), thu hộ/chi hộ, số PO (ghi chú tham chiếu), ghi chú.
- **Xem trước** báo lỗi đúng dòng và đúng ô (đối tác sai vai trò, thiếu số hóa đơn, ngày sai, loại phí/nhóm/mã dịch vụ lạ, số tiền sai, thuế sai, các dòng cùng hóa đơn khác ngày/hạn/nhóm, ngoài phạm vi), tổng theo từng tiền tệ, cảnh báo **nghi trùng** với hóa đơn đã có. Có lỗi thì **không ghi hóa đơn nào** (tất cả hoặc không).
- **Ghi** dùng đúng luật của nhập tay (cùng hàm kiểm tra), nhãn đợt tùy chọn; tùy chọn **Gửi duyệt ngay** (cấp số PT-/PTR-…); sau đó người duyệt xử lý ở màn **Chờ duyệt**. Công nợ chỉ phát sinh khi được ghi nhận như thường lệ.
- Giới hạn: cột “Số PO” chỉ là ghi chú tham chiếu (không tạo liên kết đơn hàng); muốn công nợ gắn PO để hiện ở cột Đơn hàng/PO thì nhập PO/Cost ở tab trước rồi lập hóa đơn từ khoản phát sinh. Test `bulk-invoice.test.cjs`, giao diện nhóm 16.

## 2l. Biểu mẫu Excel chuyên nghiệp + tự gắn PO khi nhập hóa đơn hàng loạt
- **Nút “⬇ Tải file mẫu (.xlsx)”** ở mỗi tab của *Nhập hàng loạt* (PO/Doanh thu, Chi phí, Hóa đơn bán, Hóa đơn mua). Tệp sinh NGAY TRONG TRÌNH DUYỆT (không phụ thuộc thư viện ngoài, không tốn hạn mức Google), gồm 4 sheet: **Nhập liệu** (tiêu đề công ty/biểu mẫu, hướng dẫn nhanh, dải nhóm cột có màu, cột bắt buộc đánh dấu *, đóng băng tiêu đề, bộ lọc, 500 dòng có kẻ ô, ô ngày để dạng chữ nên Excel không tự đổi định dạng, danh sách thả xuống + gợi ý khi chọn ô), **Hướng dẫn** (cách dùng và bảng giải thích từng cột: bắt buộc, kiểu dữ liệu, quy tắc, ví dụ), **Ví dụ** (dòng mẫu nhiều trường hợp), **Danh mục** (loại phí, nhóm, tiền tệ, mã dịch vụ, thuế, đối tác đang hoạt động, đơn đang mở — lấy từ dữ liệu thật tại lúc tải).
- **Đủ cột theo cấu trúc dữ liệu:** hóa đơn 23 cột (đối tác, số HĐ, ký hiệu, ngày hóa đơn, ngày chứng từ, hạn, ngày dự kiến thanh toán, kỳ quyết toán, nhóm, tiền tệ, số đơn/PO, PO gửi NCC, mã dịch vụ, loại phí, diễn giải, SL container, số/ngày tờ khai, số tiền trước thuế, thuế, thu/chi hộ, ghi chú dòng, ghi chú hóa đơn); PO/Doanh thu 12 cột; Chi phí 12 cột. Có test đối chiếu từng cột của mẫu với mã nguồn nhập để không lệch.
- **Tải tệp lên trực tiếp:** nút “Chọn tệp” nay nhận **.xlsx** (đọc sheet “Nhập liệu”, hiểu cả ô ngày thật của Excel → dd/MM/yyyy), .csv, .txt; tự bỏ dòng tiêu đề/hướng dẫn/dòng trống; vẫn có thể dán từ Excel.
- **TỰ GẮN PO khi nhập hóa đơn hàng loạt:** cột “Số đơn / PO khách” (số DH-… hoặc số PO khách; đơn phải đang mở, đúng khách với hóa đơn bán, đúng mã dịch vụ của PO, đúng nhóm; kỳ phải mở). Mỗi dòng phí được **ghép với khoản phát sinh còn mở** cùng đơn + đối tác + tiền tệ + số tiền (khớp loại phí thì ưu tiên); **không có thì tạo khoản phát sinh mới** trong đơn (doanh thu hoặc chi phí; có kiểm hạn mức tín dụng như nhập tay). Hóa đơn sinh ra thuộc nguồn “từ đơn hàng” (khóa dòng như hóa đơn lập từ khoản phát sinh), các khoản chuyển INVOICING và lên INVOICED khi ghi nhận. **Đã gắn PO thì mọi dòng của hóa đơn phải có số đơn.** Xem trước ghi rõ từng dòng là “khớp khoản sẵn có” hay “tạo khoản mới”. Cột **Đơn hàng/PO** ở danh sách Phải thu/Phải trả hiện ngay.
- Lưu ý: nếu sau đó xóa hóa đơn nháp thì khoản phát sinh tự tạo quay về trạng thái “chưa lập hóa đơn” trong đơn (không bị mất). Test: `bulk-invoice.test.cjs` (72 khẳng định), `bulk-template.test.cjs` (115), giao diện nhóm 16 (tải mẫu, tải .xlsx tạo bằng openpyxl, gắn PO). 4 tệp mẫu tĩnh nằm ở `3_TAI_LIEU/MAU_NHAP_HANG_LOAT/` (bản trong ứng dụng có danh mục thật).

## 2m. Nhập hóa đơn từ file XML (hóa đơn điện tử) — thủ công + đọc XML, một hóa đơn nhiều mã dịch vụ
- **Màn mới: Nhập hàng loạt → tab “Hóa đơn từ XML”** (cũng có nút **📄 Nhập hóa đơn từ XML** ở trang COST và trang chi tiết PO). Chọn một hoặc nhiều tệp .xml theo Thông tư 78 (HDon/DLHDon). Hệ thống đọc: mẫu số/ký hiệu/số hóa đơn, ngày lập, tiền tệ, bên bán/bên mua (tên, MST), từng dòng hàng hóa/dịch vụ (thành tiền trước thuế, thuế suất 8%/10%/KCT/KKKNT…), tổng tiền, MCCQT (ghi vào ghi chú hóa đơn). Bỏ dòng ghi chú; dòng chiết khấu (số âm) được cảnh báo vì ứng dụng chưa nhập được số âm; cảnh báo khi tổng các dòng lệch tổng trong hóa đơn; tệp sai định dạng báo lỗi rõ.
- **Tự nhận chiều và đối tác:** so MST bên bán/bên mua với MST công ty (Danh mục → `entity.taxCode`) để biết hóa đơn BÁN (phải thu) hay MUA (phải trả); tìm đối tác theo MST (bỏ hậu tố -001; không thấy thì theo tên) và báo rõ nếu chưa có đối tác. Có thể đổi chiều thủ công.
- **Gợi ý ghép PO/Cost:** từng dòng XML được so với các khoản phát sinh còn mở của cùng chiều/đối tác/tiền tệ có **cùng thành tiền** (hoặc cùng trước thuế); khớp đúng thì tự điền số đơn, mã dịch vụ, loại phí, nhóm; có nhiều ứng viên thì chọn trong danh sách; không khớp thì chọn tay hoặc để không gắn PO.
- **Một hóa đơn nhiều mã dịch vụ:** mỗi dòng chọn MÃ DỊCH VỤ và số đơn/PO riêng (PO có nhiều mã bắt buộc chọn); dòng phí và khoản phát sinh gắn đúng mã. Có test hóa đơn FWD + CFN trong cùng một PO.
- **Ghi:** dùng đúng bộ kiểm tra/ghi của nhập hàng loạt hóa đơn (tất cả hoặc không; nghi trùng số hóa đơn đã có thì cảnh báo; tùy chọn gửi duyệt ngay), tạo hóa đơn NHÁP.
- **Thủ công + XML ở các form:** nút **“Điền từ file XML”** trong form hóa đơn nhập tay (điền đối tác theo MST, số/ký hiệu/ngày, tiền tệ và thay các dòng phí bằng dòng trong XML để chọn loại phí/mã dịch vụ) và trong hộp **lập/ghi nhận hóa đơn từ khoản phát sinh** ở PO/COST (điền số, ký hiệu, ngày; đối chiếu tổng tiền và MST với các khoản đã chọn, cảnh báo nếu lệch).
- Giới hạn: chỉ hỗ trợ định dạng TT78 (HDon/DLHDon); định dạng cũ (TT32 …) và tệp .zip chứa nhiều XML chưa hỗ trợ; ứng dụng không lưu bản gốc tệp XML (chỉ MCCQT trong ghi chú). Test: `einvoice-xml.test.cjs` (30), `bulk-invoice.test.cjs` (87, gồm gợi ý ghép và nhiều mã dịch vụ), giao diện nhóm 17–18; mẫu XML trong `4_TESTS/fixtures/`.

## 3. Hạn chế còn lại / việc cần kiểm tra trên môi trường thật
- Chưa chạy trên Apps Script/Sheets thật: tốc độ, hạn mức thời gian, khóa đồng thời thật, thời gian khóa khi sao lưu, quyền Drive/email, PDF/XLSX thật.
- Test #10 chưa làm; chưa kiểm BMT có trùng NCC/Shipper trên dữ liệu thật. Phần tách dòng chi tiết/dòng tổng khi nhập Excel chỉ kiểm theo mô tả hiện có, chưa đối chiếu với file thật.
- Khoản/đơn đã hủy trước bản này không có `cancelledDate` → báo cáo quá khứ coi như hủy từ đầu.
- Chứng từ cũ có ngày ghi nhận khác tháng ngày chứng từ: số báo cáo quá khứ có thể khác bản đã in; xem danh sách bằng `auditLedgerDates()` và rà soát thủ công, hệ thống không tự sửa.
- Danh sách chờ phân bổ chi phí: bộ lọc "Chỉ chi phí chờ phân bổ" ở màn COST (chi phí chung + chi phí của đơn chưa gắn mã dịch vụ), có test (ca J); giao diện mới kiểm bằng smoke với Backend giả.
- Thời điểm xóa hóa đơn lấy từ ngày cập nhật cuối của bản ghi đã xóa (updatedAt); chưa có bảng sự kiện trạng thái riêng. Test dùng Sheet giả nên chưa chứng minh trên dữ liệu thật việc đọc bản ghi xóa mềm. Mọi bộ test giả lập `repoValid_` cần giả lập thêm `repoCommitted_`. Điều chỉnh không tách VAT: với dòng gốc có thuế, phần giảm trừ vào số trước thuế bằng đúng số điều chỉnh. Đối chiếu Excel (bản 2) mới xác nhận đọc/tổng hợp nguồn, chưa đối chiếu với cơ sở dữ liệu ứng dụng.
- Không tự chuyển công nợ thành doanh thu/chi phí; phân loại thuế/hộ vẫn do người dùng xác nhận.

## 4. Quy trình nâng cấp – xem `HUONG_DAN_TRIEN_KHAI.md` (sao lưu, migration hai pha, deploy, quay lui).

## Áp dụng chuẩn HAK_ACCOUNTING_REPORT_STANDARD (số, ngày, căn lề)
Nguồn: repo saoluucvhak-pixel/HAK_ACCOUNTING_REPORT_STANDARD, commit a5833a9797921148a2eaa897df2cd2d47d220136. Các hàm formatExact, formatDateISO, alignFor... nhúng nguyên văn trong `6_NGUON/hak-format.js` (HAKFormat), dùng chung cho giao diện và Backend.
- **Số tiền**: nhóm nghìn kiểu Việt `1.250.000,75`, số âm `-5`; tính bằng chuỗi thập phân chính xác (không qua số thực), tương thích 100% hàm cũ (đã so khớp tự động).
- **Ngày**: `dd/MM/yyyy`; ngày không có thật trên lịch (vd 31/02) giữ nguyên chuỗi gốc, không tự bịa ngày.
- **Căn lề bảng**: số/tiền căn phải, ngày căn giữa, chữ/mã (MST, số hóa đơn, số chứng từ) căn trái; cột ngày không khai kiểu vẫn tự căn giữa nếu giá trị là dd/MM/yyyy; tiêu đề căn cùng ô. Mã số thuế/số hóa đơn luôn là chuỗi (giữ số 0 đầu, không nhóm nghìn).
- **Excel báo cáo**: cột ngày là ô ngày thật (định dạng dd/MM/yyyy, căn giữa) thay vì chữ; tiền giữ ô số; chuỗi bắt đầu = + - @ vẫn bị vô hiệu hóa (chống chèn công thức).
- Kiểm thử: `4_TESTS/hak-format.test.cjs` (115 khẳng định) + nhóm 19 của `5_UI_TESTS/ui.e2e.cjs`. Tất cả chỉ là kiểm thử trên dữ liệu giả/Chromium, CHƯA chạy trên Google Apps Script thật; ô ngày thật trong Excel (Date → dd/MM/yyyy) cần chị mở thử một báo cáo xuất ra để xác nhận trên Google Sheets.
- Lưu ý: `src/Backend.gs` chứa dấu `/*@@HAK_FORMAT@@*/`, `build.py` thay bằng hak-format.js khi dựng; tệp dán vào Apps Script là `1_BACKEND/Backend.gs` (đã thay sẵn).

## Tỷ giá ngoại tệ (mới)
- Bảng mới `FxRate` (ngày, ngoại tệ, tỷ giá ×10.000, nguồn MANUAL/GOOGLE); menu **Tỷ giá**; quyền `fx.write` cho Kế toán và Người duyệt.
- Thứ tự lấy tỷ giá: nhập tay trên phiếu/menu → bảng (nhập tay trước Google) → tự lấy Google Finance bằng GOOGLEFINANCE trong tệp tạm (lưu lại, dọn tệp) → báo thiếu.
- Phiếu thu/chi ngoại tệ lưu tỷ giá theo ngày hiệu lực + số VND; chứng từ nhập trực tiếp lưu tỷ giá theo ngày chứng từ. Phân bổ thu/chi ghi chênh lệch tỷ giá đã thực hiện (đảo theo tỷ lệ). Báo cáo R13, R14. Test: `4_TESTS/fx.test.cjs` (78 khẳng định), e2e nhóm 20.
- Cột mới (tự thêm khi chạy `ensureSchema()`): Payment.fxRateE4/fxSource/amountBaseMinor; DebtDoc.fxRateE4/fxSource/totalBaseMinor; Allocation.fxPayRateE4/fxDocRateE4/fxDiffBaseMinor; bảng FxRate. **Cần chạy `ensureSchema()` một lần sau khi dán mã mới.**
- Chưa làm: bút toán đánh giá lại số dư cuối kỳ; tự ghi bút toán chênh lệch; gắn tỷ giá cho chứng từ tạo từ PO/Cost/hàng loạt/XML (khi phân bổ tra bảng theo ngày chứng từ); bảng kê GTGT cho chứng từ ngoại tệ vẫn loại ra. GOOGLEFINANCE chưa chạy thử trên Google thật (cần chị thử và kiểm tra ngày/giá).

## Tỷ giá — đợt 2 (bút toán, GTGT, gắn tỷ giá chứng từ cũ)
- **Bút toán chênh lệch tỷ giá theo tháng** (bảng `FxEntry`, menu Tỷ giá): đã thực hiện (từ các lần phân bổ trong tháng) + đánh giá lại công nợ ngoại tệ cuối tháng theo tỷ giá ngày cuối tháng; tạo NHÁP (`fx.write`), ghi nhận bởi người khác có `fx.post` (Người duyệt), kiểm tra kỳ khóa; tháng sau tự đảo phần đánh giá lại; đảo bút toán đã ghi nhận kèm lý do. Số dương = lãi, âm = lỗ. Ứng dụng chưa có hệ thống tài khoản nên đây là bảng kê để kế toán hạch toán, KHÔNG tự đẩy sang phần mềm kế toán.
- **Gắn tỷ giá cho chứng từ tạo từ PO/Cost/hàng loạt/XML**: tự gắn khi ghi nhận (theo ngày chứng từ, tự lấy Google nếu thiếu); chứng từ cũ dùng nút "Điền tỷ giá cho chứng từ ngoại tệ cũ" (tối đa 15 ngày tra Google mỗi lần).
- **Bảng kê GTGT R10/R11**: chứng từ ngoại tệ quy đổi VND theo tỷ giá NGÀY HÓA ĐƠN trong bảng Tỷ giá (không có thì dùng tỷ giá ngày chứng từ, có ghi chú; không có nữa thì loại ra và ghi chú). Kế toán thuế cần đối chiếu với tỷ giá quy định.
- Test: `fx.test.cjs` (116 khẳng định), e2e nhóm 21. Cột/bảng mới thêm khi chạy `ensureSchema()` (bảng FxEntry).

## V12 R2
Xem `BAO_CAO_SUA_LOI_V12_R2.md`: quyền/phạm vi bút toán tỷ giá (toàn công ty, quyền riêng, `draftSig`/kiểm tra nháp cũ, đảo kỳ trước), `fx.backfill` có quyền và bỏ qua kỳ khóa, đọc theo cột cho liên kết PO (tải lạnh −30,7% ô đọc, +6 lần gọi), bộ chẩn đoán tải xuống, schema 2.3.
