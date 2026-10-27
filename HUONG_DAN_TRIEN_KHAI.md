> **Bản V12 R2:** đọc `BAO_CAO_SUA_LOI_V12_R2.md`, `HUONG_DAN_TRIEN_KHAI_V12_R2.md`, `KET_QUA_TEST_V12_R2.md`, `BAO_CAO_HIEU_SUAT_V12_R2.md` trước khi triển khai (schema 2.3 có bảng/cột mới; cấp quyền bút toán tỷ giá; kiểm tra trigger không tạo trùng). Tài liệu bên dưới là bản bàn giao gốc.

> **Bản sửa và tối ưu 26/10/2026:** đọc [BAO_CAO_SUA_LOI_HIEU_SUAT_V8.md](BAO_CAO_SUA_LOI_HIEU_SUAT_V8.md) trước khi triển khai. Nội dung dưới đây là tài liệu bàn giao gốc.

# Triển khai bản mới – KATY AP/AR

Thư mục gồm:
- `1_BACKEND/Backend.gs` — dán vào project **Backend** (thay toàn bộ nội dung).
- `2_GATEWAY/` — dán vào project **Gateway**: `Gateway.gs`, `index.html`, `luong-nghiep-vu.html` (giữ đúng tên; trong Apps Script tạo tệp HTML tên `index` và `luong-nghiep-vu`).
- `3_TAI_LIEU/HUONG_DAN_SU_DUNG.md` — hướng dẫn sử dụng (cũng có sẵn trong ứng dụng).

## Trước khi nâng cấp (bắt buộc)
1. Sao lưu: File → Make a copy cho bảng tính **Dữ liệu** và bảng tính **Nhật ký** (và chạy sao lưu của ứng dụng). Ghi lại số phiên bản (Manage deployments) của Backend và Gateway đang chạy để quay lui.
2. Làm trước trên **bản sao** của dữ liệu và bản triển khai thử, kiểm tra xong mới làm trên bản chính.
3. Bản 1.9 chỉ **thêm tiêu đề cột ở cuối** bảng (Order: serviceCode, hsdvNo, servicesJson, cancelledDate; Accrual: serviceCode, cancelledDate; DebtLine: serviceCode; Partner: địa chỉ… ngân hàng). Không xóa dữ liệu, không đổi thứ tự cột. ensureSchema chạy 2 pha: kiểm tra (không ghi gì) rồi mới thêm cột; chạy lại bao nhiêu lần cũng không đổi thêm.

## Thứ tự
1. Backend: thay `Backend.gs` → chọn hàm **ensureSchema** → Chạy → xem Nhật ký thực thi. Bản này (schema 1.9) thêm cột cuối các bảng Partner (địa chỉ, điện thoại, người liên hệ, chức vụ, số tài khoản, ngân hàng), Order (mã dịch vụ, số HSDV, danh sách mã), Accrual và DebtLine (mã dịch vụ). Sau khi triển khai, vào Danh mục → Mã dịch vụ tạo các mã trước khi lập PO mới: ensureSchema tự thêm tiêu đề, KHÔNG làm lệch dữ liệu cũ; phải chạy trước khi dùng bản mới.
   - "Đã kiểm tra đủ … bảng, tiêu đề cột khớp": tiếp tục.
   - "LỆCH SCHEMA": DỪNG, chưa deploy; khôi phục tiêu đề cột các bảng được liệt kê.
2. Backend: Deploy → Manage deployments → Edit → New version (Execute as: Me; Who has access: Anyone). Giữ URL.
3. Gateway: thay 3 tệp → Deploy → New version. Cấu hình triển khai của Gateway: **Execute as: User accessing the web app**, Who has access: Anyone with Google account (hoặc tên miền công ty) — Gateway dùng Session.getActiveUser để xác định email nên không đặt Execute as Me. Backend: Execute as Me, Who has access: Anyone (chỉ nhận yêu cầu có chữ ký HMAC từ Gateway).
4. Sau khi cập nhật, chạy `ensureSchema()` (bản này kiểm tra tiêu đề trước, nếu lệch sẽ dừng và không ghi gì), rồi `installTriggers()` một lần để có bộ kích hoạt lưu trữ 03:00.
5. Trình duyệt Ctrl+F5, kiểm tra: trang đầu là Bàn làm việc; Luồng nghiệp vụ mở được; chạy thử R05, R06, R08 (tài khoản phạm vi toàn bộ), R09.

## Thay đổi hành vi cần biết ở bản này
- **Ngày ghi nhận:** sổ công nợ và báo cáo mặc định tính theo ngày ghi nhận vào sổ; chứng từ ngày 30/09 ghi nhận 23/10 không làm đổi số đã chốt 30/09. Báo cáo có thêm chế độ "Ngày chứng từ" (ghi nhãn rõ, không phát hành bản chốt). Sau khi nâng cấp chạy **auditLedgerDates()** (chỉ đọc) để liệt kê chứng từ có ngày ghi nhận khác tháng với ngày chứng từ — các báo cáo quá khứ của những chứng từ này có thể khác số bạn đã in trước đây; hãy rà soát danh sách đó.
- **Khóa kỳ:** lưu/hủy khoản phát sinh, lưu đơn, đổi trạng thái đơn, nhập hàng loạt đều bị chặn khi rơi vào kỳ đã khóa (kiểm cả ngày cũ và ngày mới khi sửa).
- **Ngày hủy:** khoản/đơn hủy từ bản này lưu ngày hủy. Khoản đã hủy từ trước không có ngày hủy (báo cáo quá khứ coi như hủy từ đầu) — hạn chế đã biết.
- **Đang lập hóa đơn:** khoản đã có hóa đơn nháp được tính thành nhóm riêng ở dashboard, R09, chi tiết đơn, điều kiện đóng đơn.
- **Thu hộ/chi hộ** được tách khỏi doanh thu/chi phí dịch vụ và lãi gộp; lãi gộp từng tiền tệ.
- **Nhật ký:** audit được lưu trước khi hoàn tất giao dịch; giao dịch dở được bộ phục hồi hoàn tất hoặc hoàn tác, không trùng.

## Bản dán an toàn
Nếu trình soạn thảo làm mất xuống dòng khi dán, dùng các tệp trong `AN_TOAN_KHI_DAN/` (đã bỏ mọi chú thích `//`, `/* */`) thay cho tệp cùng tên ở `1_BACKEND/` và `2_GATEWAY/`. Hai bản có cùng hành vi (cùng bộ test đạt). Dựng lại: `python3 6_NGUON/build.py`.

## Đợt vận hành (cảnh báo, trạng thái, đo hiệu năng)
1. Dán Backend mới → chạy `setupDraftDb()` (hoặc `ensureSchema()`) để tạo sheet `SystemAlert` trong file DRAFT; dán `index.html` mới.
2. Mở menu **Hệ thống → Trạng thái** (quản trị): xử lý các cờ vàng/đỏ (thường là thiếu bộ kích hoạt → chạy `installTriggers()`).
3. Chạy **`measureSystem()`** trong trình soạn thảo (Chạy → xem Nhật ký thực thi), sao chép kết quả JSON gửi cho người hỗ trợ.
4. Quay lui: deploy Backend cũ (bảng `SystemAlert` bị bỏ qua).

## Bản này (schema 2.2): file DRAFT/XEM NHANH + bản nháp nhập liệu + trigger 10 phút
**Việc làm theo thứ tự (hệ thống đã chạy từ trước):**
1. Sao lưu: File → Make a copy cho bảng tính Dữ liệu và Nhật ký (và chạy sao lưu của ứng dụng).
2. Dán Backend mới → chạy `ensureSchema()`.
3. Chạy **`setupDraftDb()`** một lần: tạo file Google Sheet `CONGNO_DB_DRAFT` (tự lưu ID vào Script Properties `DB_DRAFT_ID`), tạo sheet `ReadModel` và `DraftEntry` trong đó, rồi dựng lại bảng tổng hợp. Chạy lại không tạo trùng. Sheet `ReadModel` cũ trong file chính không còn dùng — xóa tay sau khi kiểm tra.
4. Chạy **`installTriggers()`** một lần để đổi `recoverTrigger` sang **10 phút/lần** (các trigger cũ được xóa và tạo lại, không trùng).
5. Dán `index.html` mới vào Gateway và triển khai lại Web app.
6. Cài mới hoàn toàn: `setupBackend()` đã tự tạo cả file DRAFT.
**Quy tắc:** chưa có `DB_DRAFT_ID` thì hệ thống vẫn chạy như cũ (ReadModel/DraftEntry nằm trong file chính). Làm mới/dựng lại bảng tổng hợp **không bao giờ** đụng `DraftEntry`. Sao lưu của ứng dụng nay sao chép thêm file DRAFT (bản nháp chưa lưu); khôi phục dữ liệu chính KHÔNG ghi đè file DRAFT, chỉ bỏ bản dựng sẵn và dựng lại.
**Quay lui:** deploy lại Backend cũ (bỏ qua file DRAFT; nháp chưa lưu sẽ không còn hiển thị, dữ liệu trong file DRAFT vẫn giữ).

## Bản này (schema 2.1): bộ bản dựng nhất quán, đối soát hằng đêm, lưu trữ PO
1. Dán Backend mới → chạy `ensureSchema()` (thêm 3 cột cuối bảng Đơn hàng: `archivedAt`, `archivedBy`, `archiveNote`; không đổi dữ liệu cũ).
2. Chạy `installTriggers()` **một lần** để thêm bộ kích hoạt `reconcileTrigger` (02:00 hằng đêm) — các bộ kích hoạt cũ được tạo lại như trước.
3. Chạy `rebuildSummaries()` một lần: dựng lại cả bộ bảng tổng hợp theo cách mới (bản kê + hai khe A/B). Bản dựng kiểu cũ trong sheet `ReadModel` tự bị dọn.
4. Mở *Tổng hợp công nợ* → tab **Đối soát** (cần quyền kiểm toán/quản trị) → *Chạy đối soát ngay* để có kết quả đầu tiên.
5. Quay lui: deploy lại Backend cũ; 3 cột lưu trữ bị bỏ qua (PO đã lưu trữ sẽ hiện lại như PO đã đóng); sheet `ReadModel` có thể xóa.

## Bảng tổng hợp (schema 2.0)
- Chạy `ensureSchema()` sau khi dán Backend mới: tạo sheet `ReadModel` (dữ liệu dẫn xuất). Sau đó chạy hàm `rebuildSummaries()` một lần để có bản dựng sẵn ngay (hoặc đợi tối đa 5 phút cho bộ kích hoạt `recoverTrigger`). Nếu chưa có bộ kích hoạt: `installTriggers()`.
- Có thể đổi tuổi tối đa của bản dựng sẵn (phút) bằng Config `summary.maxAgeMin` (mặc định 15).
- Quay lui: deploy lại Backend cũ; sheet `ReadModel` có thể giữ hoặc xóa.

## Tốc độ tải dữ liệu
- Sau khi triển khai Backend mới, bộ kích hoạt 5 phút (`recoverTrigger`) tự làm ấm bộ nhớ đệm; không cần cài lại bộ kích hoạt. Nếu chưa có, chạy `installTriggers()` một lần.
- Lần mở đầu tiên sau khi triển khai hoặc sau khi có thao tác ghi có thể vẫn chậm; các lần sau nhanh hơn rõ rệt. Nếu vẫn chậm: mở Console trình duyệt, gõ `copy(JSON.stringify(__perf()))` và gửi kết quả để phân tích; xem thêm mục "Tải dữ liệu chậm" trong BAO_CAO_BAN_GIAO.md.
- Dữ liệu lớn: chạy `archiveOldData()` định kỳ (đã có bộ kích hoạt 03:00).

## Quay lui
1. Gateway và Backend: Deploy → Manage deployments → Edit → chọn phiên bản cũ (đã ghi ở bước sao lưu) → Deploy. Cột mới ở cuối bảng không ảnh hưởng bản cũ.
2. Nếu dữ liệu bị ghi sai sau khi dùng bản mới: khôi phục từ bản sao ở bước sao lưu, hoặc dùng chức năng Sao lưu/khôi phục trong ứng dụng. Giao dịch dở: chạy `recoverStale_(0)` để hoàn tất/hoàn tác.
3. Không xóa cột bổ sung đã thêm; để trống là an toàn.

## Kiểm tra bằng Node (không bắt buộc)
`node 4_TESTS/run-all.cjs` chạy bộ test hồi quy (xem `4_TESTS/README.md`): có nhóm test dạng *từ chối lỗi* khẳng định thao tác sai bị chặn và không ghi gì. Đạt test không thay cho việc thử trên dữ liệu thật.

## Lưu ý
- (Khuyến nghị) Backend: bật dịch vụ nâng cao **Drive API** (Services → +) để tệp tạm khi xuất báo cáo được xóa hẳn; nếu không bật, hệ thống xóa sạch nội dung rồi bỏ vào thùng rác. Khi bật có thể cần cấp thêm quyền Drive.
- Script Properties của Gateway phải còn `BACKEND_URL` và `HMAC_SECRET`.
- Bản này thay đổi: khóa chống ghi đè AuditLog/BackupCatalog, kiểm tiêu đề cột (SCHEMA_MISMATCH), khóa khôi phục dữ liệu, R05/R06/R08/R09, Bàn làm việc, Hướng dẫn, chủ đề màu (mặc định Classic).
- **Chưa chạy thử trên Apps Script thật**: toàn bộ kiểm thử trong 4_TESTS dùng Sheet/Cache/Lock giả bằng Node; tốc độ thật, hạn mức thực thi, khóa đồng thời thật, quyền và gửi email chỉ kiểm được trên bản sao thật. Kiểm tra trên bản sao trước khi dùng cho dữ liệu chính.
- Tệp Excel tham chiếu (FWD/CBT/NCC/BMT) chưa được cung cấp nên chưa đối chiếu số liệu với file thật.
