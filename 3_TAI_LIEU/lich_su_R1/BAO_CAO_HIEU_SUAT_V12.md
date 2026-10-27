> **LỊCH SỬ — đã được thay bằng bản R2 (ở thư mục gốc gói).** Lưu ý: câu "không đổi schema" trong tài liệu này CHỈ đúng so với bản giao ngay trước đó; so với bản 12 cũ trước đợt Tỷ giá, schema đã đổi (xem tài liệu R2).

# Báo cáo hiệu suất bản 12 (đo trên giả lập)

**Đây là số đo Node + Sheet/Cache giả đếm lệnh gọi, KHÔNG phải Google Apps Script thật.** `ms` phụ thuộc máy chạy, chỉ dùng so sánh tương đối trong cùng lượt đo; không dùng để cam kết tốc độ trên Google.

## Phương pháp
- Công cụ: `4_TESTS/bench/po.bench.cjs` (mới; có bảng ô đọc theo từng Sheet). Lệnh: `BENCH_N=3000 BENCH_R=5 node 4_TESTS/bench/po.bench.cjs <Backend_cũ.gs>`.
- Dữ liệu (cùng fixture, cùng truy vấn trước/sau): 3.000 chứng từ ghi nhận (AR/AP), **600 PO**, **9.000 dòng phí** (3 dòng/hóa đơn), **8.730 khoản phát sinh gắn dòng** (một phần có `poRef`), **872 dòng chia PO (`AccrualSplit`)**, điều chỉnh (~3% chứng từ, dòng dùng `adjustsLineId`), **2.910 phân bổ**, 800 phiếu thu. Cấu hình: ADMIN/APPROVER, phạm vi toàn bộ, `pageSize` 25.
- "Tải lạnh" = không dùng CacheService (đọc Sheet đầy đủ). "Bảng đã ấm" = bảng dữ liệu đã nằm trong cache bảng. "Đệm kết quả" = `cachedRead_` theo khóa người dùng/phạm vi/phiên bản dữ liệu. Mỗi kịch bản chạy 5 lần, báo **trung vị** và min–max.
- Trước = bản gói giao ngay trước đợt này; Sau = bản hiện tại.

## Kết quả (`doc.list`, N = 3.000)

| Kịch bản | Đọc Sheet (trước → sau) | Ô đọc (trước → sau) | Lệnh cache get (trước → sau) | Byte phản hồi (trước → sau) | Tổng bản ghi (trước → sau) | ms trung vị (trước → sau) |
|---|---|---|---|---|---|---|
| Tải lạnh, trang 1, không lọc PO | 7 → 7 | 744.122 → 744.122 | 0 → 0 | 15.724 → 16.349 | 1.500 → 1.500 | 1.285 → 1.359 |
| Tải lạnh, tìm `q=PO12` | 7 → 7 | 744.122 → 744.122 | 0 → 0 | 16.060 → 16.685 | 57 → 60 | 1.186 → 1.359 |
| Tải lạnh, lọc `orderId=o12` | 7 → 7 | 744.122 → 744.122 | 0 → 0 | 9.275 → 9.650 | 15 → 15 | 1.333 → 1.304 |
| Tải lạnh, `noOrder` | 7 → 7 | 744.122 → 744.122 | 0 → 0 | 11.527 → 155 | 45 → 0 | 1.311 → 1.333 |
| Bảng đã ấm, trang 1 | 0 → 0 | 0 → 0 | 8 → 8 | 15.724 → 16.349 | 1.500 → 1.500 | 168 → 151 |
| Bảng đã ấm, lọc `orderId=o12` | 0 → 0 | 0 → 0 | 8 → 8 | 9.275 → 9.650 | 15 → 15 | 175 → 207 |
| Đệm kết quả, lần 1 | 0 → 0 | 0 → 0 | 2 → 2 | 15.724 → 16.349 | 1.500 → 1.500 | 0 → 0 |
| Đệm kết quả, lần 2 (trúng) | 0 → 0 | 0 → 0 | 2 → 2 | 15.724 → 16.349 | 1.500 → 1.500 | 0 → 0 |

Ô đọc theo bảng (tải lạnh): DebtLine 252.000, Accrual 261.900, DebtDoc 132.000, Allocation 66.930, Order 15.600, AccrualSplit 13.952, Partner 1.740. Số lệnh `cache put` chỉ khác 0 ở lượt ghi cache đầu (không nêu trong bảng).

### Đọc kết quả
- **Không giảm số lần đọc Sheet hay số ô đọc khi tải lạnh** (7 lần, 744.122 ô, cả trước và sau). Tải lạnh bị chi phối bởi việc đọc toàn bộ các bảng (Accrual 35% và DebtLine 34% số ô), không phải bởi chỉ mục PO. Không có cải thiện đáng kể ở mục tiêu "giảm tải lạnh" trong phạm vi đợt này; ms chênh trong khoảng nhiễu của máy đo (xem min–max trong `po.bench.cjs`).
- **Thay đổi hiệu năng thực sự có:** trang không lọc/tìm PO chỉ dựng chỉ mục PO cho **dòng của trang hiện tại** (25 chứng từ) thay vì toàn bộ 9.000 dòng; chỉ mục dùng chung một lần đọc theo lô (`orderLinkCtx_`), memo theo dòng, không N+1. Tiết kiệm CPU/bộ nhớ trong request, nhưng không đo được ý nghĩa trên số ms ở máy giả lập này.
- **Phản hồi lớn hơn ~4%** (+625 byte/trang) do trường `ordersRestricted` và chứng từ điều chỉnh nay có `orders`.
- Cột "Tổng bản ghi" khác ở hai dòng là **thay đổi đúng về nghiệp vụ**, không phải lỗi hiệu năng: tìm `q=PO12` ra thêm 3 chứng từ điều chỉnh (57 → 60), `noOrder` từ 45 xuống 0 vì các điều chỉnh nay được gắn PO của dòng gốc.
- Cache bảng ấm và đệm kết quả giữ nguyên hành vi: đệm kết quả khóa theo người dùng/vai trò/phạm vi/phiên bản dữ liệu (kiểm bằng `po-scope.test.cjs` nhóm 9).

## Phần chưa tối ưu và bước tiếp theo
1. **Tải lạnh vẫn đọc 744 nghìn ô.** Hướng khả thi nhưng rủi ro (cần thiết kế + test riêng): đọc theo cột cho bảng Accrual/DebtLine (chỉ các cột cần cho chỉ mục: `id`, `orderId`, `poRef`, `accrualId`, `adjustsLineId`, cột hệ thống) thay vì cả hàng; hoặc đưa `docId → [orderId]` vào read model dựng định kỳ (kèm phiên bản dữ liệu, giới hạn kích thước, đường lui khi thiếu). Không làm trong đợt này để tránh đổi nguồn dữ liệu chuẩn.
2. Tải lạnh chỉ xảy ra khi cache bảng mất/hết hạn hoặc sau khi ghi làm mất hiệu lực; số đo thực tế trên Google cần chạy `measureSystem()` (có sẵn) trên bản triển khai thử.
3. Không đổi sang JDBC/CSDL, không tái cấu trúc lớn.

## Ngoài `doc.list`
Bảng đo cũ `4_TESTS/bench/perf.bench.cjs` (bàn làm việc, `summary.partners` đọc bảng tổng hợp, `payment.list`) giữ nguyên và chạy lại được; kết quả bản trước ở `bench/KET_QUA_TOI_UU.txt`. Báo cáo/read model vẫn cập nhật theo cơ chế hiện có (nút Làm mới, trigger 10 phút) và hiển thị thời điểm dựng ở Hệ thống → Trạng thái; đây là snapshot định kỳ, không phải realtime tuyệt đối. Các thao tác tài chính tiếp tục đọc nguồn chuẩn tại thời điểm ghi trong `runTx_` (khóa, phiên bản, requestId lặp an toàn); không có thay đổi nào cho phép cache/snapshot quyết định số dư được phân bổ.
