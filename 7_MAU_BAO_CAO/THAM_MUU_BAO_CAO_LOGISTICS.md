# Tham mưu: bộ báo cáo cho doanh nghiệp dịch vụ logistics (forwarding, thủ tục hải quan, vận tải)

Tài liệu này là ý kiến tư vấn của người làm phần mềm, dựa trên cách ứng dụng KATY AP/AR đang ghi dữ liệu (PO/HSDV, doanh thu – chi phí theo mã dịch vụ, thu hộ/chi hộ, công nợ phải thu – phải trả, tiền thu/chi, phân bổ). Đây không phải tư vấn thuế hay kế toán chính thức: các điểm về thuế GTGT, thu hộ/chi hộ, hạch toán chi phí cần kế toán trưởng và tư vấn thuế xác nhận.

## 1. Vì sao logistics cần báo cáo khác doanh nghiệp bán hàng thông thường
1. **Vòng tiền ngược:** thường phải trả hãng tàu, cảng, nhà vận tải, hải quan trước hoặc cùng lúc, nhưng khách trả sau 15–60 ngày. Báo cáo quan trọng nhất là *tiền sẽ ra – vào khi nào*, không chỉ *còn nợ bao nhiêu*.
2. **Lãi gộp theo hồ sơ (HSDV/PO), không theo tháng:** một lô hàng có thể có doanh thu tháng này, chi phí tháng sau. Cần xem lãi gộp *theo từng hồ sơ* và nhìn rõ hồ sơ nào *chưa đủ chi phí* thì lãi tạm tính chưa đáng tin.
3. **Thu hộ / chi hộ:** phí hãng tàu, thuế nhập khẩu, phí cảng thu hộ… không phải doanh thu/chi phí của công ty. Nếu lẫn vào, biên lợi nhuận sai và doanh thu bị thổi phồng.
4. **Doanh thu và chi phí ghi nhận trước hóa đơn:** dịch vụ đã làm nhưng chưa xuất hóa đơn (chưa lập hóa đơn), chi phí NCC đã phát sinh nhưng hóa đơn đến muộn. Cuối tháng đây là chỗ sai lệch lớn nhất.
5. **Đa tiền tệ:** USD (cước biển/hàng không) và VND cùng tồn tại; không được cộng chéo, phải theo dõi rủi ro tỷ giá riêng.

## 2. Bộ báo cáo đề xuất theo người dùng và nhịp sử dụng

| Người dùng | Báo cáo | Nhịp | Trạng thái trong ứng dụng |
|---|---|---|---|
| Kế toán trưởng | R01 Tổng hợp công nợ cuối ngày; R07 Tuổi nợ; R08 Sổ thu/chi; R05/R06 quyết toán và biên bản đối chiếu | Hằng ngày / cuối tháng | Có |
| Giám đốc / CFO | **R12 Dự báo dòng tiền thu – chi theo hạn** (mới); R09 Doanh thu – chi phí – lãi gộp | Hằng tuần | R12 mới; R09 có |
| Kinh doanh (sales) | R02 Chi tiết phải thu theo khách; R07 tuổi nợ theo khách; danh sách khách vượt hạn mức | Hằng tuần | Có (chưa có báo cáo hạn mức riêng) |
| Mua hàng / thanh toán | R03 Phải trả NCC; R12 (cột chi); lịch thanh toán ưu tiên theo hạn | Hằng tuần | Có |
| Vận hành / chứng từ | Danh sách chi phí chờ phân bổ (màn COST); PO chưa có mã dịch vụ; khoản chưa lập hóa đơn | Hằng ngày | Có (dạng bộ lọc) |
| Kế toán thuế | R10, R11 bảng kê GTGT | Hằng tháng/quý | Có |

## 3. Chỉ số (KPI) nên theo dõi và cách tính
(Mọi chỉ số tính riêng từng tiền tệ.)

| KPI | Công thức đề xuất | Ngưỡng cảnh báo gợi ý (cần doanh nghiệp tự đặt) |
|---|---|---|
| DSO – số ngày thu tiền bình quân | Phải thu cuối kỳ ÷ doanh thu kỳ × số ngày kỳ | Vượt điều khoản thanh toán bình quân |
| DPO – số ngày trả bình quân | Phải trả cuối kỳ ÷ chi phí kỳ × số ngày kỳ | Quá thấp = đang trả sớm hơn cần thiết |
| Chênh lệch DSO – DPO | DSO − DPO | Dương càng lớn càng cần vốn lưu động |
| Tỷ lệ nợ quá hạn | Phải thu quá hạn ÷ tổng phải thu | > 15–20% là cần xử lý |
| Nợ > 60 / > 90 ngày | Từ báo cáo tuổi nợ (R07) | Theo dõi từng khách |
| Lãi gộp theo hồ sơ | (Doanh thu dịch vụ − chi phí dịch vụ) ÷ doanh thu dịch vụ, **không tính thu hộ/chi hộ** | So sánh theo loại dịch vụ, tuyến, khách |
| Hồ sơ chưa đủ chi phí | Số/giá trị hồ sơ có doanh thu nhưng chưa có chi phí | Phải về 0 trước khi chốt tháng |
| Doanh thu chưa lập hóa đơn | Tổng khoản "chưa lập" + "đang lập" | Theo tuổi (ngày kể từ phát sinh) |
| Chi phí chưa nhận hóa đơn NCC | Tổng khoản chi phí chưa có hóa đơn | Theo tuổi; trích trước nếu cần |
| Số hộ chưa đối ứng | Thu hộ − chi hộ theo hồ sơ | Phải về 0 khi hồ sơ hoàn tất |
| Tập trung khách hàng | % phải thu của top 5/top 10 khách | Cao = rủi ro phụ thuộc |
| Tập trung NCC | % phải trả của top 5 NCC | Cao = rủi ro đàm phán/giao hàng |
| Tỷ lệ chứng từ thiếu hạn | Số chứng từ còn nợ chưa có ngày đến hạn ÷ tổng | Phải gần 0, nếu không dự báo dòng tiền sai |
| Trạng thái ngoại tệ | Phải thu USD − phải trả USD | Cần quyết định có phòng ngừa/cân đối hay không |

## 4. Kiểm soát nên đưa vào quy trình (đặc thù logistics)
1. **Đóng hồ sơ (HSDV) chỉ khi** đã có đủ doanh thu, chi phí, hóa đơn đầu ra/đầu vào và số hộ đã cân. Ứng dụng đã chặn đóng đơn khi còn khoản chưa/đang lập hóa đơn; nên bổ sung thủ tục kiểm "chi phí về muộn" sau khi đóng (xem mục 6).
2. **Chi phí phát sinh muộn** (lưu container/bãi, demurrage/detention, phí thay đổi): quy định ai phê duyệt, ghi vào hồ sơ nào, có tái xuất hóa đơn cho khách không. Thiếu quy định này thì lãi gộp hồ sơ bị "ảo".
3. **Chi phí không gắn hồ sơ** phải có danh sách chờ phân bổ và người chịu trách nhiệm; cuối tháng không để tồn. (Ứng dụng có bộ lọc "chỉ chi phí chờ phân bổ".)
4. **Tách thu hộ/chi hộ** ngay khi nhập; khoản chưa chắc chắn để ở trạng thái "chờ xác minh", không tự coi là doanh thu.
5. **Hạn mức tín dụng & dừng dịch vụ:** đặt hạn mức theo khách, báo khi vượt hạn mức hoặc nợ quá hạn quá X ngày; quyết định ai được duyệt ngoại lệ.
6. **Đối chiếu công nợ định kỳ** với khách và NCC (R06 biên bản) hằng tháng; ghi kết quả/chênh lệch.
7. **Đối chiếu trùng giữa các nhóm NCC/BMT…** (nếu cùng một chi phí xuất hiện ở hai nhóm) trước khi thanh toán.
8. **Cut-off cuối tháng:** khóa kỳ chỉ sau khi: không còn khoản "đang lập hóa đơn" lâu ngày, không còn chi phí chờ phân bổ, đã đối chiếu quỹ/ngân hàng.

## 5. Dữ liệu nên bổ sung để báo cáo có giá trị hơn (hiện chưa thu thập trong ứng dụng)
Đề xuất thêm vào hồ sơ/PO (không bắt buộc hết, ưu tiên theo nghiệp vụ):
- Số vận đơn (MBL/HBL/AWB), số container, số tờ khai (ứng dụng đã có số tờ khai ở dòng phí), tàu/chuyến, ETD/ETA, cảng đi/đến, tuyến, incoterm, loại hình (FCL/LCL/hàng không/nội địa/thủ tục).
- Người phụ trách bán hàng (sales) và người điều hành hồ sơ — để báo cáo theo người phụ trách.
- Loại thu hộ/chi hộ rõ ràng (phí hãng tàu, thuế, phí cảng…) và bằng chứng chứng từ.
- Chi phí **ước tính** lúc nhận đơn để so với thực tế (kiểm soát biên lợi nhuận kế hoạch so với thực tế).
- Ngày nhận hóa đơn NCC và ngày gửi hóa đơn cho khách (để đo thời gian "từ phát sinh đến lập hóa đơn").
Những trường này là thay đổi cấu trúc dữ liệu: cần quyết định riêng, có migration và sao lưu.

## 6. Báo cáo/chức năng nên làm tiếp (đề xuất thứ tự ưu tiên)
1. **Lãi gộp theo hồ sơ có cột "độ tin cậy"** (đủ chi phí / chưa đủ / có số hộ lệch) và xuất danh sách hồ sơ cần xử lý — R09 đã có trạng thái số liệu, cần thêm màn lọc theo trạng thái.
2. **Tuổi doanh thu chưa lập hóa đơn và chi phí chưa nhận hóa đơn** (aging của khoản phát sinh) — hiện chỉ có tổng.
3. **Báo cáo theo khách hàng:** doanh thu – lãi gộp – DSO – nợ quá hạn trên một trang (cho sales).
4. **Báo cáo khách vượt hạn mức / quá hạn quá X ngày** + nhắc tự động (ứng dụng đã có nhắc nợ thủ công).
5. **Dòng tiền 13 tuần** (mở rộng R12): thêm kế hoạch lương/chi cố định và tiền ứng — cần nhập kế hoạch, ngoài phạm vi công nợ.
6. **Gửi báo cáo định kỳ qua email** (tuổi nợ hằng tuần cho sales, dòng tiền cho giám đốc) — cần quyết định ai nhận gì.
7. **Chế độ in/xuất cho danh sách** (chứng từ, đơn hàng, phiếu thu/chi) cùng chuỗi mô tả phạm vi lọc.

## 7. Nguyên tắc trình bày mẫu báo cáo (đã áp dụng trong mẫu mới)
- Đầu trang: tên và thông tin doanh nghiệp, mã mẫu, tên báo cáo, kỳ/ngày chốt, bộ lọc, cơ sở ngày (ngày ghi nhận hay ngày chứng từ), nhãn BẢN NHÁP/BẢN CHỐT.
- Khối TÓM TẮT theo từng tiền tệ ở đầu báo cáo để người đọc nắm số chính trước khi đọc chi tiết.
- Số: căn phải, phân tách hàng nghìn, số âm màu đỏ, đúng số lẻ từng tiền tệ; **không cộng chéo tiền tệ**.
- Dòng nhóm, dòng cộng, dòng tổng cộng khác màu; tiêu đề bảng lặp ở mọi trang in; giấy A4 (A3 cho báo cáo rất rộng).
- Cuối trang: bằng chữ (khi cần), ghi chú phương pháp, khối chữ ký (người lập/kiểm tra/duyệt, hoặc hai bên với biên bản đối chiếu), chân trang ghi nguồn và phiên bản dữ liệu.
- Bản chốt có mã băm dữ liệu; bản nháp ghi rõ thời điểm in và người in.

## 8. Việc doanh nghiệp cần cấu hình/quyết định
1. Điền thông tin doanh nghiệp ở Thiết lập: tên, địa chỉ, mã số thuế, điện thoại, email, tài khoản ngân hàng (cho R05), mã tệp logo (Drive).
2. Quy định hạn thanh toán mặc định theo khách/NCC (điều khoản đối tác) để giảm "chưa xác định hạn".
3. Chọn nhịp báo cáo và người nhận (mục 2). **Khuyến nghị:** bắt đầu bằng R12 (hằng tuần) và R09 (cuối tháng) cho giám đốc, R07 (hằng tuần) cho sales.
4. Quyết định có thu thập thêm các trường ở mục 5 không (khuyến nghị: số vận đơn/container, ETD/ETA, sales phụ trách trước).
5. Đặt ngưỡng cảnh báo (mục 3) phù hợp quy mô; hệ thống chưa tự đặt ngưỡng thay doanh nghiệp.

## 9. Giới hạn của bản mẫu hiện tại
- Mẫu PDF/Excel được dựng và kiểm thử bằng bố cục giả lập; **chưa xuất thử trên Google Sheets thật** (hiển thị thật có thể khác chút về phông, độ rộng, ngắt trang). Cần chạy thử trên bản sao và chỉnh nếu cần.
- Xuất PDF vẫn đi qua Google Sheets (không dùng trình dựng PDF riêng); tiêu đề lặp dùng cơ chế "đóng băng hàng". Đã thu gọn băng lặp còn 3 hàng (khoảng 100px): công ty · tên báo cáo · trạng thái nháp/chốt · mã mẫu/ngày chốt · tiêu đề cột; điều kiện lọc và tóm tắt chỉ nằm ở trang đầu. Riêng bảng hẹp (biên bản R06) dùng khối tiêu đề đầy đủ, không lặp.
- R12 đã trừ tiền khách thu/tiền chi NCC chưa phân bổ và có chế độ chia theo tuần; chưa gồm thuế, phí ngân hàng, chênh lệch tỷ giá, lương và chi phí cố định.
- Các KPI ở mục 3 là đề xuất; ứng dụng mới có sẵn một phần (tuổi nợ, lãi gộp theo hồ sơ, chưa lập hóa đơn); DSO/DPO, tập trung khách hàng, tuổi doanh thu chưa lập hóa đơn **chưa được tính tự động**.
