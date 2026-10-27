# R3.5 — Áp dụng các quyết định chính sách của kế toán trưởng (26/10/2026)

> Kiểm thử bằng Node + Sheet giả + Chromium; **chưa chạy trên Google Apps Script thật, chưa chạy trên Windows**. Test: `4_TESTS/r35-policy.test.cjs` (chạy trên R3.3: 10/11 nhóm thất bại, riêng 2B đã đúng sẵn; trên R3.5: đạt hết).

## 1. Bảng quyết định → cách làm

| # | Quyết định của chị | Cách hệ thống làm ở R3.5 |
|---|---|---|
| 1 | **B** — cho **quỹ tiền mặt**: chặn chi vượt số dư | Quỹ có `type = CASH` trong danh mục CASH_ACCOUNT: khi **ghi nhận** phiếu chi, chuyển quỹ đi, bán ngoại tệ (quỹ ngoại tệ), mua ngoại tệ (quỹ VND trả tiền) mà làm xuất hiện **thêm** một điểm âm/vượt quỹ tại hoặc sau ngày hiệu lực (kể cả chi lùi ngày làm các lần chi sau thiếu) → `CASH_OVERDRAFT`, không đổi dữ liệu. Quỹ `BANK`: giữ cách cũ (tạm ghi theo tỷ giá ngày + cảnh báo). Số âm có sẵn từ dữ liệu cũ không bị đổ cho phiếu mới. |
| 2 | **B** — chênh lệch làm tròn dồn vào phiếu cuối | Cách tính đã sẵn như vậy: phiếu chi rút hết số ngoại tệ còn lại nhận **đúng phần VND còn lại** của quỹ (không còn dư làm tròn). Bổ sung test để giữ cố định (2B). |
| 3 | **B** — thu lùi ngày vào kỳ đã khóa: phải mở khóa | "Tính lại bình quân" nếu có phiếu/phân bổ/chuyển quỹ/bán ngoại tệ bị ảnh hưởng nằm trong kỳ đã khóa → **từ chối cả lượt** (`PERIOD_CLOSED`), không tính lại một phần; mở khóa kỳ theo quy trình rồi tính lại. (Trước: bỏ qua phần trong kỳ khóa và báo.) |
| 4 | **A** — mỗi quỹ ngoại tệ một bình quân riêng | Giữ nguyên. |
| 5 | **B** — chênh lệch tỷ giá bù trừ thu hộ/chi hộ ngoại tệ ghi vào lãi/lỗ | Khi ghép, lưu tỷ giá hai khoản (theo ngày phát sinh của từng khoản, **đúng ngày**, như mọi chỗ ghi sổ khác) và `fxDiffBaseMinor = VND(phần ghép theo tỷ giá khoản chi hộ) − VND(theo tỷ giá khoản thu hộ)`: dương = lãi, âm = lỗ. Cộng vào bút toán chênh lệch tỷ giá **đã thực hiện** của kỳ chứa ngày ghép (chiều "Bù trừ thu hộ/chi hộ"); gỡ ghép thì phần này bị điều chỉnh ngược ở lần xem trước kế tiếp. Thiếu tỷ giá một trong hai ngày: chênh lệch 0 + cảnh báo (không chặn). |
| 6 | **A** — khoản hộ không chịu thuế | Khoản thu hộ/chi hộ chỉ nhận thuế "không chịu thuế"; "có thuế suất" hoặc "chưa xác nhận" bị từ chối (`PASS_THROUGH_VAT`). Ghép theo tiền gốc (= số gộp). |
| 7 | **B** (chị đổi từ A sang B sau lần trả lời đầu) — thừa kiểm kê ngoại tệ nhập theo bình quân | Dòng thừa nhập vào quỹ theo tỷ giá **bình quân** của quỹ tại thời điểm đó (không lãi/lỗ trên quỹ). Không còn đòi tỷ giá ngày kiểm kê; chỉ khi quỹ chưa có bình quân (hết tiền/chưa định giá) mới dùng tỷ giá ngày kiểm kê. Biên bản đã xử lý **trước R3.5** có tỷ giá đã lưu → giữ nguyên số cũ. |
| 9 | **Chặn** (chị chốt 27/10) — đảo làm quỹ tiền mặt âm | Đảo phiếu thu vào quỹ, đảo phiếu chuyển quỹ (quỹ nhận), đảo phiếu bán/mua ngoại tệ (phần tiền vào quỹ), đảo xử lý thừa kiểm kê: nếu bỏ khoản đó đi khiến quỹ **tiền mặt** âm/vượt quỹ tại hoặc sau ngày hiệu lực → `CASH_OVERDRAFT`, không đổi dữ liệu. Quỹ ngân hàng không chặn. |
| 8 | **A** — hủy đơn đang bù trừ vẫn chặn | Giữ (`ORDER_HAS_PASS_LINKS`). |

## 2. Thay đổi dữ liệu / tương thích
- `SCHEMA_VERSION` `2.4` → `2.5`; `PassLink` thêm 3 cột cuối (`costRateE4`, `revRateE4`, `fxDiffBaseMinor`). Dòng cũ = 0.
- Các ghép thu hộ/chi hộ ngoại tệ **tạo trước R3.5** có `fxDiffBaseMinor = 0` → không vào bút toán. Muốn tính: gỡ ghép và ghép lại sau khi đã có tỷ giá hai ngày.
- Quỹ trong danh mục chưa khai `type` (hoặc `BANK`) **không bị chặn** chi vượt. Muốn áp dụng mục 1, đặt `type = CASH` cho quỹ tiền mặt (Thiết lập → Danh mục → CASH_ACCOUNT).

## 3. Chưa có quy định (không tự bịa)
1. ~~Đảo phiếu thu làm quỹ tiền mặt âm~~ — đã chốt **chặn** (27/10), xem dòng 9 ở bảng trên.
2. Xử lý kiểm kê **thiếu** vẫn đưa sổ về đúng số đếm (không bị chặn vì không thể âm nếu số đếm ≥ 0).
3. Chi từ quỹ tiền mặt theo phiếu **đã ghi nhận trước R3.5** dẫn đến âm: không đổi.
4. Với mục 5: chưa có quy định tỷ giá khi hai khoản hộ nằm ở ngày **không có** tỷ giá nhập (đang ghi 0 + cảnh báo, không lấy "tỷ giá gần nhất").
