# Báo cáo kiểm tra main: hiệu suất và trùng lặp số liệu (31/10/2026)

> Số đo chạy trên Node với Sheet/Cache giả; thời gian ms không đại diện Google Apps Script thật. Chưa chạy trên Apps Script thật.

## 1. Trùng lặp số liệu — lỗi tái hiện được trên main
Nhập hàng loạt PO/doanh thu và chi phí (`order.bulkPreview/bulkCommit`) **không có kiểm tra trùng**. Tái hiện: nhập cùng một tệp hai lần → số khoản 2 → 4, tổng tiền khoản 3.000 → 6.000, xem trước không cảnh báo gì. Hóa đơn, thanh toán, sao kê, đối tác đã có cơ chế nghi trùng riêng; riêng khoản phát sinh chưa có.

| Tình huống | Trước | Sau |
|---|---|---|
| Nhập lại cùng tệp PO/doanh thu hoặc chi phí | ghi đôi, im lặng | xem trước đánh dấu "Trùng khoản đã có"; ghi mà chưa xác nhận bị từ chối (`DUPLICATE_SUSPECTED`), không ghi gì; tích "Tôi đã kiểm tra…" mới ghi (audit lưu số dòng đã xác nhận) |
| Hai dòng y hệt trong cùng tệp | ghi cả hai | đánh dấu "Trùng trong tệp" (dòng sau), cùng luật xác nhận |
| Lưu tay hai khoản y hệt | ghi cả hai | ghi được nhưng cảnh báo `ACCRUAL_SUSPECT_DUP` (không chặn) |

Khóa nghi trùng: loại (doanh thu/chi phí), đơn (hoặc tập đơn chia; chi phí chung), đối tác, mã dịch vụ, loại phí, ngày, tiền tệ, số tiền trước thuế, thuế, chi hộ, số lượng, diễn giải (không phân biệt hoa/thường/dấu/khoảng trắng), PO nhà cung cấp. Khoản đã hủy không tính. Chia nhiều đơn: cùng tập đơn và cùng tổng chỉ khác tỷ lệ vẫn bị coi là nghi trùng (yêu cầu xác nhận).

## 2. Hiệu suất
Đo từng API trên 3.000 chứng từ (bộ nhớ bảng tắt): nơi tốn nhất là đọc và đổi bảng (`doc.list` đọc 330.828 ô khi cache nguội); cache bảng đã xử lý phần này. Phần tính trùng lặp tìm thấy:
- Lượt dựng bảng tổng hợp (bộ kích hoạt hằng đêm và nút "Tính lại ngay") tính **cùng một sổ 5 lần** (đối tác, đơn, chi phí, Bàn làm việc, Tổng quan) và `computeBalances` 15 lần. Nay sổ được dùng lại trong lượt dựng (chỉ cho người dùng hệ thống, dọn kể cả khi lỗi): **5 → 1 lần tính sổ, 15 → 10 lần `computeBalances`** (tháng cuối của xu hướng dùng lại số dư của sổ). Giả lập, bảng đã nóng: 282 → 232 ms. Kết quả của cả 6 mô hình giống hệt cách tính riêng (test so từng mô hình; chỉ khác dấu thời gian `generatedAt`).
- Không đổi các đường đọc của người dùng (cache, SLICE giữ nguyên).

## 3. Chưa làm / đề xuất
1. Xu hướng Tổng quan vẫn tính số dư từng tháng một (10 lượt); có thể gộp một lượt theo sự kiện nếu dữ liệu lớn.
2. Nghi trùng đối tác so mã số thuế theo chuỗi nguyên văn (`0312345678` ≠ `0312345678-001`); nên chuẩn hóa trước khi so.
3. Đo độ trễ mỗi lệnh Sheets trên bản sao dữ liệu thật rồi mới quyết định bật SLICE hoặc làm bảng đọc nhanh cho `doc.list`.

## 4. Kiểm thử
`run-all.cjs` 77/77; `ui.e2e.cjs` 54/54; `dup.test.cjs` 56 khẳng định (7/8 nhóm hỏng trên bản main cũ). `fix10.test.cjs` đã chỉnh: hai dòng y hệt trong tệp nay cần xác nhận.
