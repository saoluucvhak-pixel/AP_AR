# Báo cáo hiệu suất — R3.4

> **Số đo này là GIẢ LẬP**: Sheet/Cache giả đếm lệnh `getValues` và số ô; mili-giây là thời gian CPU của Node trên máy dựng, **không đại diện độ trễ Google Sheets**. Chưa đo trên Apps Script thật. Với n = 5–7 mẫu mỗi điều kiện, báo cáo chỉ nêu **p50 và min–max**; **không** nêu p95 (cần ≥ 20 mẫu).

## 1. Bài đo
- Dữ liệu: 3.000 chứng từ (≈ 1.500 chứng từ/chiều), 60 đối tác, 52.380 ô khoản phát sinh. Tải: `doc.list` trang 1/25 dòng, chiều AR.
- Điều kiện: `cold` (không cache), `coldcache` (cache trống nhưng cho phép ghi cache), `warm` (cache bảng ấm), `afterwrite` (vừa ghi → cache 3 bảng chứng từ mất hiệu lực).
- Công cụ: `4_TESTS/bench/r34.bench.cjs` (R=5 lần cho bảng 2; R=7 cho bảng 1).

## 2. Đường hiện tại (FULL) so với R3.3 — không suy giảm

`BENCH_ONLY_FULL=1 BENCH_R=7 node 4_TESTS/bench/r34.bench.cjs <Backend>`:

| Điều kiện | R3.3: lệnh đọc / ô | R3.3 p50 (min–max) ms | R3.4: lệnh đọc / ô | R3.4 p50 (min–max) ms |
|---|---|---|---|---|
| cold | 13 / 515.682 | 1278 (1038–1556) | 13 / 515.682 | 1212 (1019–1381) |
| coldcache | 13 / 515.682 | 1260 (1211–1530) | 13 / 515.682 | 1330 (1157–1430) |
| warm | 0 / 0 | 137 (118–163) | 0 / 0 | 118 (113–144) |
| afterwrite | 3 / 450.930 | 1035 (893–1175) | 3 / 450.930 | 989 (888–1231) |

Số lệnh đọc và số ô **giống hệt**; thời gian nằm trong biên nhiễu. Đồng hồ từng bước (`readMs/rowsMs/cacheMs/ledgerMs/filterSortMs/pageMs`) chỉ cộng vài phép trừ thời gian, không thêm lệnh đọc Sheet.

## 3. Đánh giá "đọc chọn cột + gộp dải" (SLICE) — thử nghiệm, MẶC ĐỊNH TẮT

`gap` = gộp hai dải cột nếu khoảng trống giữa chúng ≤ gap cột. Ba bảng chứng từ (DebtDoc, DebtLine, Allocation) là bảng dùng nhiều ô nhất.

| Phương án | Chế độ | Lệnh đọc | Ô đọc | p50 ms | min–max | n |
|---|---|---|---|---|---|---|
| FULL | cold | 13 | 515.682 | 1116 | 989–1208 | 5 |
| FULL | afterwrite | 3 | 450.930 | 912 | 890–1066 | 5 |
| SLICE gap=0 | cold | 28 | 247.212 | 902 | 807–1010 | 5 |
| SLICE gap=0 | afterwrite | 18 | 182.460 | 654 | 589–807 | 5 |
| SLICE gap=1 | cold | 26 | 259.212 | 827 | 780–1065 | 5 |
| SLICE gap=1 | afterwrite | 16 | 194.460 | 630 | 562–700 | 5 |
| SLICE gap=2 | cold | 22 | 307.212 | 825 | 790–886 | 5 |
| SLICE gap=2 | afterwrite | 12 | 242.460 | 676 | 606–772 | 5 |
| SLICE gap=3 | cold | 17 | 369.942 | 934 | 831–1136 | 5 |
| SLICE gap=3 | afterwrite | 7 | 305.190 | 701 | 641–780 | 5 |
| SLICE gap=5 | cold | 14 | 465.942 | 854 | 835–1051 | 5 |
| SLICE gap=5 | afterwrite | 4 | 401.190 | 674 | 609–875 | 5 |
| SLICE gap=8 | cold | 14 | 465.942 | 967 | 816–1063 | 5 |
| SLICE gap=8 | afterwrite | 4 | 401.190 | 689 | 676–786 | 5 |
(`warm` = 0 lệnh đọc ở mọi phương án, ≈ 82–114 ms; `coldcache` gần `cold`. Đầy đủ: `4_TESTS/bench/KET_QUA_R34.json`.)

**Kết quả đúng đắn:** ở cả 7 phương án, kết quả `doc.list` (14 biến thể lọc/sắp xếp/phân trang + người hẹp quyền) **bằng đúng** kết quả FULL sau khi bỏ trường `read`/`dataVersion` (`r34-slice.test.cjs`: thử cả cache hỏng/thiếu → tự lùi về FULL, dữ liệu đúng).

**Kết luận (có thận trọng):**
- Giảm số ô đọc 52 %–65 % (gap 0–2) nhưng **tăng số lệnh `getValues` từ 13 lên 22–28** (cold). Trong Google Sheets, mỗi lệnh có độ trễ cố định mà bản giả lập **không mô phỏng**; chưa có số đo thật nên **chưa chứng minh được lợi ích**. Điểm hòa vốn phụ thuộc tỉ lệ độ trễ cố định/lệnh với chi phí/ô — chỉ đo được trên staging.
- Quyết định: **giữ đường FULL làm mặc định (TẮT slice)**. Người có quyền admin bật thử trên bản sao bằng `perf.set`; nếu không có lợi rõ rệt thì tắt lại, không cần triển khai lại.
- Cờ lưu ở Script Properties (`PERF_LIST_SLICE`), **không** thêm lệnh đọc Sheet (đã kiểm: 13 lệnh như FULL).
- Chưa đo gộp theo cả hai thước (lệnh đọc **và** ô) trên dữ liệu thật; phương án "gap" tốt nhất trên giả lập (gap=1–2) có thể không là tốt nhất trên Google.

## 4. Thao tác ghi tiền không dùng đường chọn cột / bảng dựng sẵn
Các thao tác tài chính (ghi nhận phiếu, phân bổ, chuyển/mua bán ngoại tệ, xử lý chênh lệch kiểm kê) chạy trong `runTx_` (khóa script) và đọc **đủ cột** từ bảng nguồn, không dùng đường chọn cột và không dùng bảng dựng sẵn (`r34-slice.test.cjs` nhóm 7). Cache bảng (nếu có) chỉ tăng tốc và bị vô hiệu theo generation khi có ghi (nhóm 5). Bảng dựng sẵn (ReadModel) chỉ dùng cho màn xem tổng hợp, kèm ghi chú: `asOf`, `dataVersion`, lần dựng thành công cuối, lỗi gần nhất và cờ **"đang dùng dữ liệu cũ"**; trigger 10 phút và nút làm mới giữ nguyên (UI nhóm 30).

## 5. Hướng dẫn đo trên staging (bản sao Google Sheets thật)
1. Dán Backend vào dự án **bản sao**, chạy `ensureSchema`.
2. Trình soạn thảo → chạy `measureDocList(30, false)` (đường FULL), ghi kết quả (đã gồm từng bước `readMs/rowsMs/cacheMs/ledgerMs/filterSortMs/pageMs`, số lệnh đọc, số ô). n = 30 → có thể tính p95.
3. Chạy `perfListSliceSet(true, 1)` rồi `measureDocList(30, true)`; so sánh p50/p95 **và** kiểm kết quả `doc.list` giống nhau trên vài màn lọc.
4. Quyết định bật chỉ khi p50 **và** p95 cold/afterwrite đều tốt hơn rõ rệt và kết quả giống nhau; còn không `perfListSliceSet(false)`.
5. Không đổi cờ trên bản chính trong giờ làm việc.
