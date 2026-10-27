# Mẫu báo cáo PDF/Excel và tham mưu logistics
- `THAM_MUU_BAO_CAO_LOGISTICS.md` — tư vấn bộ báo cáo, KPI, kiểm soát, dữ liệu nên bổ sung, thứ tự ưu tiên.
- `xem_truoc/` — 5 báo cáo mẫu (R02, R06, R07, R09, R12) dựng từ dữ liệu GIẢ bằng đúng bố cục mà Backend áp lên Google Sheets (xlsx do openpyxl, pdf do LibreOffice). **Đây là bản xem trước thiết kế, không phải tệp xuất từ Google**; phông/độ rộng/ngắt trang thật có thể khác chút.
- `tools/` — `dump_layouts.cjs` (chạy báo cáo thật của Backend.gs trên dữ liệu mẫu → bố cục JSON) và `layout_to_xlsx.py` (bố cục → xlsx xem trước).
- Mã nguồn bố cục: `reportLayout_`, `buildReportSheet_`, `rep12_` trong `1_BACKEND/Backend.gs`; test: `4_TESTS/report-layout.test.cjs`.
- Điền thông tin doanh nghiệp để tiêu đề đầy đủ: Config `entity.name`, `entity.address`, `entity.taxCode`, `entity.phone`, `entity.email`, `entity.bank`, `entity.logoFileId`.
