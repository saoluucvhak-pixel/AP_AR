# Báo cáo hiệu suất V12 — R2 (đo trên giả lập)

**Đây là số đo Node + Sheet/Cache giả đếm lệnh gọi, KHÔNG phải Google Apps Script thật.** `ms` phụ thuộc máy chạy (trung vị 5 lần, kèm min–max), chỉ so sánh tương đối trong cùng lượt đo, **không dùng để cam kết tốc độ trên Google**.

## Phương pháp
- Công cụ: `4_TESTS/bench/po.bench.cjs` (dữ liệu từ `bench/_seed_po.cjs`). Lệnh: `BENCH_N=3000 BENCH_R=5 node 4_TESTS/bench/po.bench.cjs 4_TESTS/baseline/Backend_v12_FIXED_goc.gs`.
- **Trước** = `Backend.gs` của đúng `congno_deploy_v12_FIXED.zip` (lưu ở `4_TESTS/baseline/`); **Sau** = bản R2. Cùng fixture, cùng người dùng (ADMIN/APPROVER phạm vi toàn bộ), cùng truy vấn (`doc.list` AR, `pageSize` 25).
- Dữ liệu: 3.000 chứng từ ghi nhận, 9.000 dòng phí (3 dòng/hóa đơn), **600 PO**, **8.730 khoản phát sinh gắn dòng**, **872 dòng chia PO**, điều chỉnh (~3%), **2.910 phân bổ**, 800 phiếu thu.
- Tách môi trường: *tải lạnh* = không CacheService; *cache bật nhưng trống* = tải lạnh thật trong sản xuất (đọc Sheet rồi ghi cache); *bảng đã ấm* = cache bảng/bản cắt đã có; *ngay sau khi ghi* = đã ấm rồi đổi phiên bản (`gen`) của Accrual và DebtLine như một lần ghi; *đệm kết quả* = `cachedRead_`.

## Kết quả (`doc.list`, N = 3.000)
| Kịch bản | Lần đọc Sheet | Ô đọc | Lệnh cache get | Byte phản hồi | Tổng bản ghi | ms trung vị (min–max) |
|---|---|---|---|---|---|---|
| Tải lạnh: trang 1, không lọc PO | 7 → 13 | 744.122 → 515.682 | 0 → 0 | 16.349 → 16.349 | 1500 | 1448 (1332–1743) → 1296 (1191–1542) |
| Tải lạnh: tìm theo số PO (q=PO12) | 7 → 13 | 744.122 → 515.682 | 0 → 0 | 16.685 → 16.685 | 60 | 1536 (1365–1763) → 1148 (1029–1320) |
| Tải lạnh: lọc orderId=o12 | 7 → 13 | 744.122 → 515.682 | 0 → 0 | 9.650 → 9.650 | 15 | 1540 (1416–1653) → 1242 (1171–1577) |
| Tải lạnh: noOrder | 7 → 13 | 744.122 → 515.682 | 0 → 0 | 155 → 155 | 0 | 1396 (1272–1540) → 1219 (1117–1275) |
| Cache bật nhưng trống (tải lạnh thật): trang 1 | 7 → 13 | 744.122 → 515.682 | 1 → 4 | 16.349 → 16.349 | 1500 | 1623 (1472–1777) → 1271 (1229–1419) |
| Cache bật nhưng trống: lọc orderId=o12 | 7 → 13 | 744.122 → 515.682 | 1 → 4 | 9.650 → 9.650 | 15 | 1598 (1419–1818) → 1295 (1163–1406) |
| Bảng đã ấm (cache bảng): trang 1 | 0 → 0 | 0 → 0 | 8 → 11 | 16.349 → 16.349 | 1500 | 173 (141–214) → 111 (110–121) |
| Bảng đã ấm: lọc orderId=o12 | 0 → 0 | 0 → 0 | 8 → 11 | 9.650 → 9.650 | 15 | 194 (184–266) → 162 (154–206) |
| Ngay sau khi ghi (đổi phiên bản Accrual + DebtLine): trang 1 | 2 → 4 | 513.900 → 304.380 | 6 → 9 | 16.349 → 16.349 | 1500 | 1109 (1018–1178) → 823 (801–842) |
| Đệm kết quả: lần 1 | 0 → 0 | 0 → 0 | 2 → 2 | 16.349 → 16.349 | 1500 | 0 (0–151) → 0 (0–130) |
| Đệm kết quả: lần 2 (trúng) | 0 → 0 | 0 → 0 | 2 → 2 | 16.349 → 16.349 | 1500 | 0 (0–0) → 0 (0–0) |

Ô đọc theo bảng (tải lạnh): **trước** DebtLine 252.000 · Accrual 261.900 · DebtDoc 132.000 · Allocation 66.930 · Order 15.600 · AccrualSplit 13.952 · Partner 1.740; **sau** DebtLine 252.000 · DebtDoc 132.000 · Allocation 66.930 · Accrual 52.380 · Order 5.400 · AccrualSplit 5.232 · Partner 1.740.

## Kết luận có số đo
- **Tải lạnh: 744.122 → 515.682 ô đọc (−30,7%)** ở mọi kịch bản không có cache (trang đầu, tìm PO, lọc `orderId`, `noOrder`). **Đánh đổi:** số lần gọi đọc Sheet tăng **7 → 13** (mỗi bảng đọc theo cột cần 2 lệnh: cột dữ liệu + cột hệ thống). Số lần gọi và số ô có chi phí khác nhau trên Google; chưa đo được trên Google thật nên chưa kết luận chắc chắn nhanh hơn.
- **Sau khi ghi (Accrual/DebtLine đổi phiên bản): 513.900 → 304.380 ô (−40,8%)**, 2 → 4 lần đọc.
- **Cache bảng/bản cắt đã ấm: 0 lần đọc Sheet, 0 ô** — không tệ hơn trước (bản cắt được lưu vào cache theo đúng khóa phiên bản `gen` của bảng nên tự vô hiệu khi bảng đổi; cache get 8 → 11).
- Đệm kết quả: không đổi (trúng = 0 lần đọc).
- Kích thước phản hồi không đổi so với bản FIXED; số bản ghi/phân trang giống hệt (xem `before-after.test.cjs`).

## Chưa đạt / chưa tối ưu
1. **Còn 515 nghìn ô ở tải lạnh**: DebtLine 252.000 (49%), DebtDoc 132.000, Allocation 66.930 vẫn đọc cả bảng vì tính số dư (`loadLedger_`) cần quét toàn bộ dòng/phân bổ và dùng chung cho nhiều màn. **Không tuyên bố đã tối ưu toàn diện.**
2. Không có chỉ mục/bảng đọc dẫn xuất cho DebtLine/DebtDoc/Allocation. Hướng tiếp theo (cần thiết kế và test riêng, vì ảnh hưởng mọi báo cáo): đọc theo cột có chọn lọc cho đường `doc.list` (số dư chỉ cần ~10/28 cột DebtLine; trang hiển thị cần bản đầy đủ chỉ cho 25 chứng từ, đọc theo lô) hoặc read model theo phiên bản có `asOf/dataVersion` công khai. Không làm trong R2 vì chưa chứng minh được tính đúng của số dư/phân trang với đường đọc cắt cột cho toàn bộ ledger.
3. Số ms trên giả lập không phản ánh Google; cần chạy `measureSystem()` trên bản staging để có số liệu thật.

## Giữ đúng quyền, tìm kiếm, lọc, sắp xếp, tổng, phân trang
`slice-read.test.cjs` (6 nhóm, 40 khẳng định) so kết quả đọc theo cột với đọc cả bảng trên ADMIN và người hẹp quyền cho: trang đầu, `q=PO…`, `q=NCC-…`, `orderId`, `noOrder`, phân trang, sắp xếp; điều kiện hợp lệ như `repoValid_` (bỏ xóa mềm, chỉ lấy `P` của giao dịch COMMITTED); không dùng dữ liệu cũ sau khi ghi (xóa memo + đổi `gen`); fallback đọc cả bảng khi cột không có trong schema; cache thiếu/lỗi thì đọc lại Sheet. `before-after.test.cjs` so R01/R02/R03/R07/R12, workbench, dashboard, payment.list, danh sách AR/AP (cả người hẹp quyền): giống hệt bản FIXED.

## Nguyên tắc nguồn dữ liệu và cập nhật
MAIN vẫn là nguồn chuẩn duy nhất; cache chỉ là lớp tăng tốc có thể mất bất kỳ lúc nào (mất/thiếu chunk/hết hạn → đọc lại Sheet; lỗi cache bị nuốt an toàn); không có chỉ mục lưu bền thứ hai nên không có việc "dựng lại/làm mới chỉ mục". Invalidation: mọi lần ghi vào bảng đổi khóa `gen` (`bumpGen_`) nên bản cắt cũ không còn dùng; memo trong request bị xóa khi ghi. Báo cáo/read model vẫn làm mới bằng trigger 10 phút/nút Làm mới và công khai `asOf`/`dataVersion`/thời điểm dựng ở Hệ thống → Trạng thái; đây là snapshot định kỳ, không phải realtime tuyệt đối. Thao tác tài chính vẫn đọc nguồn chuẩn dưới `runTx_` (khóa, phiên bản, `requestId`); không có thay đổi nào để cache/bản cắt quyết định số dư được phân bổ.
