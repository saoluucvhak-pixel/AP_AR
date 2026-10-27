# Báo cáo sửa lỗi và hoàn thiện — R3.4 (nâng từ R3.3)

> Mọi kiểm thử dưới đây chạy bằng Node với **Sheet/Cache/Lock giả** và Chromium của Playwright. **Chưa chạy trên Google Apps Script thật, chưa chạy trên Windows.** "Đạt" nghĩa là khẳng định trong test đúng với dữ liệu giả, không chứng minh mã sạch lỗi trên dữ liệu thật.

## 1. Tóm tắt thay đổi so với R3.3

| # | Hạng mục | Loại | Tái hiện trên R3.3 | Kết quả bản này |
|---|---|---|---|---|
| B1 | Sửa khoản thu hộ/chi hộ **đang bù trừ** làm số còn mở âm / lệch tiền tệ | Lỗi **chắc chắn** (tái hiện được) | `r34-bugs.test.cjs` B1 THẤT BẠI | Đạt |
| B2 | Hủy đơn làm hủy khoản đang bù trừ → bản ghép mồ côi | Lỗi **chắc chắn** | B2 THẤT BẠI | Đạt |
| B3 | Xử lý chênh lệch kiểm kê khi sổ quỹ đã đổi sau lúc kiểm kê → sổ lệch thêm | Lỗi **chắc chắn** | B3 THẤT BẠI | Đạt |
| B4 | Chọn phương pháp "theo ngày chi" nhưng "Tính lại bình quân"/báo lệch vẫn đụng phiếu chi ghi theo tỷ giá ngày | Lỗi **chắc chắn** | B4 THẤT BẠI | Đạt |
| B5 | `fx.entryReverse` với id không tồn tại trả `STATE_TRANSITION_INVALID` thay vì `NOT_FOUND` | Không nhất quán mã lỗi (không lộ dữ liệu; đã gate quyền toàn công ty) | Phát hiện khi viết test quyền | Đạt (đổi sang `NOT_FOUND`) |
| F1 | Đọc chọn cột doc.list (bật/tắt bằng `perf.set`, **mặc định TẮT**) | Tính năng thử nghiệm | — | Tương đương kết quả FULL ở mọi cấu hình đo |
| F2 | Bản nháp: hiện hạn giữ 30 ngày, cảnh báo sắp hết hạn, xuất .json | Tính năng | — | Đạt |
| F3 | Kiểm tra cú pháp bằng trình phân tích thật (acorn ES2019) có PASSED/FAILED/BLOCKED | Công cụ kiểm | Bản cũ có dương tính giả ở dòng chú thích | Đạt |
| F4 | Chẩn đoán tải xuống/XLSX: đối chứng trong BrowserContext của app, xác minh XLSX độc lập, loopback chặn → BLOCKED | Công cụ kiểm | — | Đạt |

Mỗi lỗi B1–B4 có test thất bại trên R3.3 và đạt trên bản sửa:
```
BACKEND_SRC=<Backend R3.3> node 4_TESTS/r34-bugs.test.cjs   →  B1 B2 B3 B4 đều ✖ (6 khẳng định rồi dừng)
node 4_TESTS/r34-bugs.test.cjs                              →  B1 B2 B3 B4 đều ✔ (18 khẳng định)
```
(Bản R3.3 dùng để so sánh được trích từ gói R3.3 đã giao; gói này không kèm nó.)

## 2. Chi tiết từng lỗi

**B1 — `accrualSave_`.** Khoản đã có bản ghép (`PassLink`) vẫn cho giảm số tiền dưới phần đã ghép, đổi tiền tệ, hoặc bỏ cờ "hộ". Hệ quả: `openMinor` âm hoặc ghép khác tiền tệ. Sửa: tính `passLinkedSum_` và trả `STATE_TRANSITION_INVALID` với ba trường hợp trên; tăng số tiền hoặc sửa mô tả vẫn được.

**B2 — `orderSetStatus_`.** Hủy đơn hủy luôn các khoản của đơn kể cả khoản đang bù trừ. Sửa: nếu có bản ghép còn hiệu lực → `ORDER_HAS_PASS_LINKS`, không đổi dữ liệu; gỡ ghép xong thì hủy bình thường. *Chọn chặn thay vì tự gỡ ghép* để người dùng thấy rõ tác động.

**B3 — `countAdjust_`.** Biên bản kiểm kê xác nhận ở ngày D, sau đó có phiếu thu/chi lùi ngày ≤ D làm số sổ quỹ đổi; xử lý chênh lệch theo số sổ cũ khiến sổ không khớp số đếm. Sửa: so lại số sổ hiện tại với số sổ lúc kiểm kê (`countBook_`); khác → `STALE_COUNT`, không ghi gì; cần lập biên bản kiểm kê mới.

**B4 — `fxPoolReport_`/`fxPoolRecalc_`.** Khi cấu hình `fx.outMethod = DAY`, báo lệch và "Tính lại bình quân" vẫn xét phiếu chi. Sửa: chỉ xét phiếu có `fxSource = MOVING_AVG` và chỉ khi phương pháp hiện hành là bình quân; phiếu ghi theo ngày không bị đổi. *Hệ quả với dữ liệu cũ:* phiếu chi nhập trước R2.8 không có `fxSource` nay sẽ không bị báo lệch (đúng chủ ý: chưa từng ghi theo bình quân). Test giao diện nhóm 23 đã đổi dữ liệu thử cho phiếu chi bình quân có `fxSource='MOVING_AVG'` cho đúng thực tế.

**B5.** Chỉ đổi mã lỗi; không đổi dữ liệu.

## 3. Phân loại rủi ro đã rà nhưng CHƯA có chính sách (không tự bịa — cần kế toán trưởng quyết)

Các điểm này **không phải lỗi đã chứng minh**, là khoảng trống chính sách. Hệ thống đang xử lý như ghi chú bên phải:

1. Quỹ ngoại tệ không đủ số dư khi chi / thiếu định giá đầu kỳ → **tạm** ghi theo tỷ giá ngày chi và cảnh báo. Chưa có quy định có cho phép chi âm quỹ hay không.
2. Làm tròn bình quân: mỗi phiếu làm tròn half-up theo VND; phần dư làm tròn tích lũy **không** được phân bổ lại. Chưa có quy định xử lý chênh lệch làm tròn.
3. Thu lùi ngày vào kỳ đã khóa: bỏ qua khi tính lại và báo, chưa có quy trình mở khóa chuẩn.
4. Nhiều quỹ cùng loại ngoại tệ: bình quân tính **riêng từng quỹ**; chuyển quỹ chuyển theo giá bình quân của quỹ đi. Chưa có quy định bình quân hợp nhất theo loại tiền.
5. Thu hộ/chi hộ ngoại tệ: chỉ ghép cùng tiền tệ; chênh lệch tỷ giá giữa hai khoản hộ khác ngày **chưa** được hạch toán riêng.
6. Thuế GTGT trên khoản hộ: ghép theo số **gộp thuế**; chưa có quy định khoản hộ có hoặc không chịu thuế.
7. Xử lý chênh lệch kiểm kê ngoại tệ: tỷ giá xử lý do người dùng nhập (`adjustRateE4`), chưa có quy định tỷ giá bắt buộc (bình quân hay ngày kiểm kê).
8. Hủy đơn đang bù trừ: đang **chặn** (B2); chưa có quy định có nên tự gỡ ghép.

## 4. Quyền ngoại tệ, kiểm lại (mục 5)

`fx-scope.test.cjs` nhóm 12 (mới, engine thật + cache): chưa cấp → `FORBIDDEN` kể cả khi cache nóng; cấp xong có hiệu lực ở request kế tiếp; thu hồi chặn ngay ở request kế tiếp; `post/reverse/backfill` bị từ chối khi chỉ có read+write; mọi lệnh bị từ chối **không đổi** ảnh chụp `FxEntry/FxRate/Period/Config`; đảo sai phiên bản → `VERSION_CONFLICT` và id lạ → `NOT_FOUND` không đổi dữ liệu. Nhóm 1–11 giữ nguyên và đạt.

## 5. Nháp 30 ngày, schema, giao dịch (mục 6)

- Nháp: hiện "hết hạn trong N ngày", banner + thông báo một lần/ngày khi sắp hết, xuất `.json` hợp lệ (`r34-draft.test.cjs`, UI nhóm 31).
- Migration: `r34-migration.test.cjs` (M1–M6): `ensureSchema` tạo đủ bảng mới, chạy lại 3 lần không đổi ô nào; CashCount bản cũ được thêm cột cuối, giữ nguyên dòng cũ; tiêu đề sửa tay bị **báo `SCHEMA_MISMATCH`, không tự ghi đè**; dữ liệu ở bảng mới được giữ; Backend R3.3 đọc được DB đã nâng schema (M5, chỉ chạy khi đặt `BACKEND_OLD`); `installTriggers` lặp không tạo trùng, trigger 10 phút luôn đúng 1, trigger lạ không bị xóa.
- Giao dịch: `r34-tx-newtables.test.cjs`: gửi lại cùng `requestId`, dừng trước/sau commit rồi phục hồi → đúng một bản ghi/hiệu lực; trigger phục hồi chạy trùng không đổi gì.

## 6. Hạn chế đã biết
Xem `HUONG_DAN_TRIEN_KHAI_R34.md` mục 8 (danh sách chưa xác minh).
