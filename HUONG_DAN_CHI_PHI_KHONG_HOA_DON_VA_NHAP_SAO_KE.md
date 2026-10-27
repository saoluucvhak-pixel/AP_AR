# Chi phí không hóa đơn & nhập hàng loạt ngân hàng / tiền mặt

> Kiểm thử bằng Node + Sheet giả + Chromium; chưa chạy trên Google Apps Script thật, chưa chạy trên Windows.

## 1. Khoản chi phí KHÔNG có hóa đơn ghi nhận thế nào?

Ứng dụng này là sổ **công nợ phải thu / phải trả + sổ quỹ**, không phải sổ cái: mọi khoản thu/chi tiền phải gắn với một **đối tác**. Có hai tình huống:

| Tình huống | Cách ghi trong ứng dụng | Kết quả |
|---|---|---|
| **A. Chưa có hóa đơn nhưng sẽ có** (nhà cung cấp chưa xuất, đã phát sinh chi phí) | Nhập hàng loạt → **Chi phí** (`Mau_nhap_chi_phi.xlsx`) tạo **khoản phát sinh** (COST) cho nhà cung cấp, gắn PO nếu có. Khi có hóa đơn: lập hóa đơn từ khoản phát sinh. Khi trả tiền: dùng file ngân hàng / tiền mặt, cột *Số HĐ/Mã dịch vụ* để gợi ý phân bổ. | Chi phí hiện trong lãi gộp của đơn và trong phải trả chờ hóa đơn; không có thuế GTGT cho tới khi có hóa đơn. |
| **B. Không bao giờ có hóa đơn** (phí ngân hàng, tiền xe, chi lặt vặt, mua lẻ…) | Tạo **một nhà cung cấp riêng**, ví dụ `CHI PHÍ KHÔNG HÓA ĐƠN` (có thể tách theo loại: phí ngân hàng, chi vãng lai…). Khi nhập sao kê / sổ tiền mặt, chọn nhà cung cấp này làm *Đối tác* và ghi **"KHÔNG HÓA ĐƠN"** ở *Diễn giải*. | Số tiền vào **sổ quỹ đúng** (ngân hàng / tiền mặt giảm). Khoản này **không có hóa đơn và không có thuế GTGT**, không vào bảng kê thuế mua vào; hiện là khoản *đã trả chưa phân bổ* của nhà cung cấp đó (không làm sai công nợ nhà cung cấp thật). |

**Giới hạn cần biết (không tự quyết thay kế toán trưởng):**
- Ứng dụng **không hạch toán tài khoản chi phí** (không có sổ cái) và **không phán** khoản nào được trừ khi tính thuế. Điều kiện chứng từ hợp lệ (bảng kê, biên nhận…) do kế toán trưởng quyết định theo quy định hiện hành.
- Chưa có loại chứng từ "chi phí nội bộ không đối tác" / "bảng kê chi phí không hóa đơn" riêng. Nếu chị muốn (có số bảng kê, người nhận tiền, đính kèm chứng từ, báo cáo riêng), đó là một chức năng mới cần chị chốt quy trình.

## 2. File nhập hàng loạt ngân hàng + tiền mặt

Dùng **chung một mẫu** cho cả hai; phân biệt bằng cột *Tài khoản quỹ* (mã quỹ trong Danh mục, quỹ ngân hàng hoặc quỹ tiền mặt).

Cột (đúng thứ tự, đúng tên): `Ngày | Tài khoản quỹ | Thu | Chi | Mã GD ngân hàng | Đối tác | Diễn giải | Số HĐ/Mã dịch vụ`. Mỗi dòng chỉ **Thu hoặc Chi**; ngày dd/MM/yyyy (ô ngày của Excel cũng được); VND số nguyên, USD tối đa 2 số lẻ; tối đa 1.000 dòng.

**Tệp trong gói** (`3_TAI_LIEU/MAU_NHAP_HANG_LOAT/`):
- `Mau_nhap_ngan_hang_tien_mat.xlsx` — sheet *Nhập liệu* (trống, có danh sách chọn quỹ), *Hướng dẫn*, *Ví dụ*, *Danh mục*.
- `Mau_nhap_ngan_hang.csv`, `Mau_nhap_tien_mat.csv` — CSV UTF-8 có dòng ví dụ (đã kiểm: tiêu đề khớp, 0 lỗi).

**Khuyên dùng trong ứng dụng:** menu **Nhập sao kê** → nút **⬇ Tải file mẫu (.xlsx)** — file có sẵn danh sách *quỹ ngân hàng, quỹ tiền mặt và đối tác THẬT* của công ty. Điền xong → **Chọn tệp** (nhận cả `.xlsx` lẫn `.csv`) → **Xem trước** → rà soát từng dòng (chọn đối tác, chấp nhận / loại, nhận gợi ý phân bổ) → **người khác** duyệt ghi.

**Quy tắc đã có sẵn:** chống nhập trùng cùng tệp (SHA), cảnh báo trùng ngày/số tiền/mã GD, chặn kỳ đã khóa, mọi dòng được ghi phải có đối tác đúng vai trò (Thu = khách hàng, Chi = nhà cung cấp), quỹ tiền mặt (VND và ngoại tệ) không cho chi vượt số dư kể cả khi nhập hàng loạt (cộng dồn cả lô theo ngày; lỗi `CASH_OVERDRAFT` ở bước duyệt ghi). Quỹ ngân hàng không bị chặn.

## 3. Thay đổi mã
- `Backend.gs`: duyệt ghi lô sao kê kiểm số dư quỹ tiền mặt VND và ngoại tệ (test `r35-policy.test.cjs` nhóm 10 và 10b, trên R3.3 thất bại).
- `index.template.html`: màn *Nhập sao kê* nhận `.xlsx` (đọc sheet "Nhập liệu", tự tìm dòng tiêu đề, đổi ô ngày Excel sang dd/MM/yyyy) và nút tải mẫu `.xlsx` động. 
- Test: `5_UI_TESTS/ui.e2e.cjs` nhóm 32.
