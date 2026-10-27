# Bản 8 — sửa lỗi và tối ưu hiệu suất

Ngày thực hiện: 26/10/2026. Nguồn: congno_deploy (8).zip.

## Kết quả

Đã cập nhật Backend, giao diện, nguồn build và AN_TOAN_KHI_DAN. Không đổi schema hay công thức công nợ. Giữ file DRAFT riêng và lịch tổng hợp 10 phút của bản gốc. Chưa triển khai hoặc thay đổi dữ liệu Google thật.

## Các lỗi đã sửa

1. **Xung đột tự lưu nháp:** giao diện gửi ifVersion, Backend chặn phiên bản cũ. Mỗi form chỉ có một lượt tự lưu đang chờ; thay đổi mới xử lý sau. Lấy trạng thái ban đầu ngay, thay cho chờ 500 ms. Lỗi tự lưu được hiển thị; xung đột giữ nguyên nội dung local và nháp máy chủ.
2. **Dọn nháp có thể xóa nội dung mới hơn:** chỉ dọn khi khớp chủ sở hữu, loại, bản ghi đích và phiên bản. Nếu thiếu xác nhận hoặc có nháp mới hơn thì giữ lại và báo draftRetained. Lượt tự lưu muộn không hồi sinh nháp đã xóa.
3. **Metadata nháp gây lỗi thử lại nghiệp vụ:** draftId/draftVersion được tách khỏi hash nghiệp vụ và khóa thử lại frontend. Trường tiền và nội dung nghiệp vụ vẫn được kiểm tra. Có nhánh tương thích hash cũ cho yêu cầu cũ được gửi lại đúng nội dung, vẫn kiểm actor/action.
4. **Lease tổng hợp không có chủ sở hữu:** thêm token cho từng lượt dựng; chỉ chủ sở hữu được trả lease. Kiểm lại token trước công bố. Thời hạn dự phòng 10 phút; không xóa tay RM_LEASE trong khi đang chạy.
5. **Cache sau đổi file:** khóa phản hồi thêm định danh MAIN, AUDIT, DRAFT và schema để không dùng nhầm cache khi đổi/khôi phục DB có cùng dataVersion.
6. **Mảnh ReadModel:** kiểm thêm dataVersion và asOf của từng mảnh trước khi ghép.

## Tối ưu

- Chỉ tải bootstrap trước khi mở menu; Bàn làm việc tải số liệu sau.
- Font ngoài không chặn hiển thị.
- Gộp tải mảnh cache khi cache phản hồi chưa có; không tải bảng không cần thiết khi phản hồi đã có.
- Nạp metadata cache sau reset xác thực và nạp lại sau phục hồi giao dịch.
- Tra cứu ID dùng chỉ mục trong bộ nhớ request; ghi dữ liệu vô hiệu hóa chỉ mục và dữ liệu lọc liên quan.
- Nháp mới không có targetId không kéo bảng chứng từ/PO chỉ để kiểm tra liên kết.
- Dọn PRIME_ khi vô hiệu hóa lượt đọc; thêm responseCacheHit vào thống kê.

### Số đo

Benchmark với 3.000 chứng từ giả: danh sách chứng từ có cache bảng ấm nhưng chưa có cache phản hồi giảm từ **5 xuống 2 lượt getAll**; số byte kết quả giữ nguyên và không đọc Sheet ở cả hai bản.

Test chỉ mục xác nhận 100 lần tra cùng bảng chỉ xây chỉ mục một lần; sau ghi thấy giá trị mới. Nháp mới không có targetId không tra bảng nguồn.

Đọc nguội danh sách vẫn đọc **312.740 ô**. Chưa loại bỏ mọi việc quét nguồn, chưa có phân trang vật lý hoàn chỉnh tại Sheets. Không dùng ms Node để cam kết tốc độ Apps Script; phép đo chịu ảnh hưởng khi chạy Chrome đồng thời. Log: 4_TESTS/bench/KET_QUA_TOI_UU.txt. Bộ đếm benchmark được reset riêng trước lượt dựng tổng hợp.

## Kiểm thử

- Trước sửa: 35/35 tệp đạt.
- Sau sửa: **36/36 tệp đạt**, gồm v8-repair.test.cjs bổ sung.
- UI Chrome/Playwright: **10/10 nhóm, 96 khẳng định đạt**.
- Ca bổ sung cố tình giữ RPC tự lưu chưa trả: lượt sau phải chờ, giá trị mới nhất được lưu đúng phiên bản.
- Ca bổ sung mô phỏng phiên khác cập nhật: không ghi đè nháp máy chủ, không mất nội dung đang gõ, có cảnh báo.
- Bộ AN_TOAN_KHI_DAN chạy lại ca sửa mới và ca UI tự lưu bổ sung thành công.
- Test giữ kiểm tra lỗi cache cũ: sau dựng lại, Dashboard dùng snapshot mới.

Điều chỉnh test có chủ đích: ca dọn nháp gửi đúng phiên bản; mock runTx của test gửi thư reset memo giống hàm thật; hook lease chuyển tiếp token. Không bỏ các khẳng định nghiệp vụ cũ.

Đây là kiểm thử local: Backend thật với Sheet/Cache/Lock giả, Chrome thật với RPC giả; CSS font ngoài được giả lập. Chưa kiểm nhiều tài khoản Google/đa tiến trình thật, backup/restore thật hoặc tốc độ cơ sở dữ liệu đang vận hành.

## Giới hạn còn lại

- Chưa triển khai tổng hợp gia tăng đầy đủ theo hàng đợi PO/đối tác; vẫn dựng cả bộ khi cần.
- Thiếu snapshot lần đầu vẫn có thể dựng cả bộ, nhưng menu không còn chờ phần này khi khởi động.
- Giữ chính sách gốc dọn DraftEntry cũ sau 30 ngày. Bản nháp chưa lưu không thay thế dữ liệu CHÍNH; cần thống nhất thời hạn lưu nháp khi vận hành.
- Chỉnh Sheet trực tiếp vẫn có thể bỏ qua version và kiểm soát ứng dụng.
- Không cam kết không còn bug hoặc real time tuyệt đối. Cần nghiệm thu trên bản sao dữ liệu thật.

## Cập nhật

1. Sao lưu MAIN, DRAFT, AUDIT và ghi lại deployment version.
2. Thay 1_BACKEND/Backend.gs, triển khai New version, giữ URL/Script Properties.
3. Thay Gateway index bằng 2_GATEWAY/index.html, triển khai New version. Gateway.gs và luong-nghiep-vu.html không đổi chức năng.
4. Nếu dùng AN_TOAN_KHI_DAN, dùng các tệp tương ứng đã cập nhật.
5. Không cần migration nếu đã dùng bản 8 có DraftEntry/ReadModel. Không chạy setupBackend tạo lại dữ liệu. Giữ lịch 10 phút, chỉ cài lại khi thiếu hoặc sai.
6. Ctrl+F5 tất cả tab. Backend mới nhận yêu cầu không có draftVersion sẽ ưu tiên giữ nháp thay vì tự xóa, nên phải cập nhật cả giao diện.
7. Thử PO, hóa đơn, thanh toán, khôi phục nháp, hai tab cùng sửa và làm mới trên bản sao trước.

Quay lui bằng deployment version cũ cho cả Backend/Gateway, không tự xóa dữ liệu mới. Khi có thông báo nháp mới hơn được giữ lại, kiểm tra ở Bản nháp của tôi trước khi xóa thủ công.
