# Bộ test hồi quy (Node)

Chạy: `node 4_TESTS/run-all.cjs` (Node 18 trở lên, không cần cài gói). Các test nạp thẳng `1_BACKEND/Backend.gs` vào máy ảo Node với Sheet/Cache giả.

- `reject.regression.test.cjs` — **hồi quy dạng từ chối lỗi**: mỗi ca đưa thao tác sai (ngoài phạm vi, trùng khoản, vượt số dư, đổi mã đang dùng, khóa kỳ sai, gán mã sai...) và khẳng định hệ thống ném đúng mã lỗi **và không ghi gì**. Mô phỏng `runTx_` đúng ngữ nghĩa thật (ghi gom lại, chỉ áp khi hàm xây dựng không ném lỗi). Chạy thử với bản mã khác: `BACKEND_SRC=<đường dẫn Backend.gs cũ> node 4_TESTS/reject.regression.test.cjs` — bản cũ phải báo lỗi, bản mới phải đạt.
- `prompt2.regression.test.cjs` — theo prompt sửa lỗi nâng cấp: ngày ghi nhận qua hai kỳ, khóa kỳ mọi đường ghi, báo cáo quá khứ trước/sau ngày hủy, OPEN/INVOICING/INVOICED, thu hộ/chi hộ và phí dịch vụ, thanh toán một phần/nhiều lần/đảo phân bổ/chặn vượt số dư.
- `txaudit.test.cjs` — dừng thực thi tại từng bước giao dịch rồi phục hồi (dữ liệu + nhật ký, không trùng), gửi lặp cùng requestId (cùng nội dung → kết quả cũ; khác nội dung → IDEMPOTENCY_MISMATCH), hai người cùng sửa (VERSION_CONFLICT).
- `hdr.test.cjs` — kiểm tiêu đề thật khi ghi (hoán đổi cột khi cache còn sống), migration hai pha, migration trên dữ liệu cũ (giữ nguyên dữ liệu và thứ tự cột, chạy lại không đổi).
- `archive.test.cjs`, `fix*.test.cjs`, `rep*.test.cjs`, `vat.test.cjs` — kiểm hành vi mong đợi (báo cáo R01–R11, phạm vi, danh mục, mã dịch vụ, lưu trữ...).
- `readmodel.test.cjs` (bảng tổng hợp, bộ bản dựng nhất quán, cảnh báo, đối soát), `archive-po.test.cjs` (lưu trữ PO theo V6) — Sheet/Cache giả.
- `draft-entry.test.cjs` — bản nháp nhập liệu và định tuyến file DRAFT/XEM NHANH (Sheet/Cache giả).

Giới hạn: dữ liệu và Sheet là giả; chưa chạy trên Google Sheets/Drive/Apps Script thật, chưa kiểm đồng thời nhiều người, PDF/XLSX thật hay đối soát dữ liệu khách hàng. Test VAT kiểm phần mềm bằng dữ liệu giả, không xác nhận mẫu biểu pháp lý.
Mỗi lần sửa lỗi nên thêm một ca vào `reject.regression.test.cjs` (đưa đầu vào sai, mong đợi bị từ chối) thay vì chỉ khẳng định kết quả đúng.

- `adv.regression.test.cjs` — bộ lọc nâng cao `adv` (chọn nhiều, khoảng, cờ), đầu vào xấu bị từ chối, lọc sau giới hạn phạm vi, đối chiếu cha–con do máy chủ tính (cha không con/một con/nhiều con/lệch).
- `cache.test.cjs` — cache đọc: ấm = nguội, ghi làm mất hiệu lực, gộp getAll.
- `bench/perf.bench.cjs` — đo trên giả lập: `node 4_TESTS/bench/perf.bench.cjs <Backend_cũ.gs>`.
- Giao diện: `node 5_UI_TESTS/ui.e2e.cjs` (Playwright, Backend thật + Sheet giả).
