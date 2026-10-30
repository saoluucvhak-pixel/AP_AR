# Báo cáo sửa lỗi định dạng số, tỷ giá, nhập XML (29/10/2026)

> Kiểm thử bằng Node (Sheet/Cache giả) và Chromium (Backend thật + Sheet giả). **Chưa chạy trên Google Apps Script thật.**

| # | Lỗi | Sửa | Test |
|---|---|---|---|
| 1 | Ô tỷ giá đọc `25,438.5` thành `25,4385`; máy chủ nhận mọi số dương; tỷ giá gõ nhầm trên một chứng từ được ghi thành tỷ giá cả ngày | `parseRate`: khi có cả hai dấu, dấu đứng sau cùng là thập phân; quy ước Việt Nam giữ cho dạng một dấu (khớp cách ô tự hiển thị `25.438`). Máy chủ `fxPlausible_`: ngoài [0,1 ; 50.000.000] bị chặn không cho xác nhận; lệch hơn 30% so với tỷ giá gần nhất phải xác nhận (`fxConfirm`), bị chặn thì không ghi vào bảng tỷ giá. Áp cho `doc.save`, `payment.save`, `fx.save` (cả mua/bán). Giao diện `apiFx` hỏi xác nhận rồi gửi lại bằng mã yêu cầu mới. Ô tỷ giá báo lỗi ngay khi gõ sai | `fix14` 1a–1c, UI nhóm 53 |
| 2 | Nhập XML làm tròn bằng nhân số thực (1,005 USD → 1,00; KWD ép 2 số lẻ), cả `netMinor` lẫn kiểm tra tổng | `EInvoiceXml.toMinor`: làm tròn nửa lên trên chuỗi thập phân; số lẻ lấy từ danh mục tiền tệ | `fix14` 2a (30.000 ca so với BigInt) |
| 3 | Phần trăm hiển thị `12.5%` | `fmtPct` (giao diện), `fmtBp_`/`fmtPctNum_` (máy chủ): `12,5%`; báo cáo VAT, lãi gộp, tổng % chia đơn | `fix14` 3a |
| 4 | `fmtMoney` ném lỗi với NaN/số lẻ làm hỏng cả màn hình | Trả `—` và ghi cảnh báo console | `fix14` 4 |
| 5 | Giờ bản nháp/danh sách theo múi giờ máy người dùng | Dùng `fmtTime` (Asia/Ho_Chi_Minh) | `fix14` 5 |
| 6 | Hàm `rcMinor_` cấp cao nhất là mã chết (làm tròn số thực, chỉ USD) | Xóa; còn bản trong `reconParseWorkbook` | `fix14` 6 |

Kết quả: `node 4_TESTS/run-all.cjs` 76/76; `ui.e2e.cjs` 53/53; `autosave.regression.cjs` đạt. Trên bản mã cũ, cả 8 nhóm của `fix14` đều hỏng.

Chưa làm (không thuộc 6 lỗi): `Math.round(Number(thuế%) * 100)` ở một số chỗ vẫn dùng số thực (không ảnh hưởng thuế suất nguyên/0,5); ngưỡng ±30% là giá trị khởi đầu, đổi ở `FX_DEV_PCT_`.
