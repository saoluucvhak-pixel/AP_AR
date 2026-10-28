# Hướng dẫn sử dụng ứng dụng KATY AP/AR

> Tài liệu này cũng có sẵn trong ứng dụng: menu **Tổng quan → Hướng dẫn sử dụng** (có tìm kiếm và nút In).

## Mục lục

- [1. Giới thiệu và đăng nhập](#gioi-thieu)
- [2. Vai trò và quyền](#vai-tro)
- [3. Làm quen giao diện và chủ đề màu](#giao-dien)
- [4. Luồng nghiệp vụ tổng thể](#luong-tong-the)
- [5. Đối tác](#doi-tac)
- [6. Đơn hàng/PO, doanh thu và chi phí](#don-hang)
- [7. Nhập PO/doanh thu/Cost hàng loạt](#nhap-hang-loat)
- [8. Chứng từ phải thu và phải trả](#chung-tu)
- [9. Phiếu thu/chi và phân bổ](#thu-chi)
- [10. Nhắc nợ và theo dõi](#nhac-no)
- [11. Dư đầu kỳ](#dau-ky)
- [12. Nhập sao kê ngân hàng](#sao-ke)
- [13. Đối chiếu với file Excel](#doi-chieu)
- [14. Báo cáo](#bao-cao)
- [15. Kỳ kế toán](#ky)
- [16. Sao lưu và khôi phục](#sao-luu)
- [17. Người dùng, danh mục và nhật ký](#quan-tri)
- [18. Thông báo thường gặp và cách xử lý](#loi)
- [19. Quy tắc làm việc nên nhớ](#luu-y)
- [20. Dành cho quản trị: cài đặt và cập nhật](#cai-dat)

<a id="gioi-thieu"></a>

## 1. Giới thiệu và đăng nhập

Ứng dụng **KATY AP/AR** quản lý công nợ phải thu (khách hàng) và phải trả (nhà cung cấp/shipper) theo đơn hàng, mã dịch vụ và đợt thanh toán. Mọi số tiền được lưu bằng số nguyên theo đơn vị nhỏ nhất của tiền tệ; **VND và USD là hai sổ riêng, không cộng lẫn**.

1. Mở đường dẫn ứng dụng bằng trình duyệt và đăng nhập đúng tài khoản Google đã được quản trị viên cấp quyền.
2. Nếu thấy thông báo **"Tài khoản chưa được cấp quyền sử dụng hệ thống"**, hãy gửi email Google của bạn cho quản trị viên. Nếu thấy **"Tài khoản đã bị tạm khóa"**, liên hệ quản trị viên để mở lại.
3. Nếu thấy **"Không xác minh được tài khoản Google"**, đăng xuất các tài khoản Google khác, đăng nhập lại và cấp quyền cho ứng dụng.

> **Mẹo:** Ô **Ngày chốt** ở đầu trang quyết định số dư, tuổi nợ và dashboard được tính tại ngày nào. Đổi ngày chốt thì màn hình hiện tại tự tải lại.

<a id="vai-tro"></a>

## 2. Vai trò và quyền

Menu chỉ hiển thị những màn hình bạn có quyền dùng. Quyền luôn được kiểm tra lại ở máy chủ, nên ẩn nút không phải là cơ chế bảo mật duy nhất.

| Vai trò | Được làm | Không được làm |
|---|---|---|
| Kế toán nhập liệu | Tạo/sửa đối tác, đơn hàng, chi phí, chứng từ, phiếu thu/chi; gửi duyệt; phân bổ; nhập hàng loạt, sao kê, dư đầu kỳ; xem và xuất báo cáo | Duyệt, ghi nhận, đảo, điều chỉnh, khóa kỳ |
| Kế toán trưởng/Người duyệt | Toàn bộ quyền của kế toán, cộng duyệt/từ chối, ghi nhận, đảo, điều chỉnh, vượt hạn mức tín dụng, khóa kỳ, yêu cầu mở lại kỳ, phát hành bản chốt báo cáo, sao lưu và khôi phục, xem nhật ký | Tự duyệt chứng từ do chính mình lập hoặc gửi duyệt |
| Lãnh đạo | Xem Tổng quan, Báo cáo và xuất báo cáo | Nhập liệu, duyệt |
| Kiểm soát viên | Xem dữ liệu, báo cáo, nhật ký, danh sách sao lưu | Mọi thao tác ghi |
| Quản trị hệ thống | Người dùng và phạm vi, Danh mục/Cấu hình, Nhật ký, Sao lưu, xác nhận mở lại kỳ | Nhập liệu nghiệp vụ (vai trò này không có quyền đọc dữ liệu công nợ) |

Mỗi người dùng còn có **phạm vi dữ liệu**: toàn bộ đối tác, hoặc chỉ một số nhóm kinh doanh, đối tác hoặc nhãn đối tác. Dữ liệu ngoài phạm vi sẽ báo **"Ngoài phạm vi dữ liệu được cấp"**.

<a id="giao-dien"></a>

## 3. Làm quen giao diện và chủ đề màu

- **Bàn làm việc** là trang đầu tiên sau khi vào hệ thống: phần **Việc cần làm** tóm tắt việc đang chờ (dòng nợ thiếu hạn, chứng từ nghi trùng, chứng từ chờ xử lý...), bên dưới là các khối chức năng xếp theo chu trình (doanh thu, cung ứng, tiền và thanh toán, ghi sổ - kỳ - báo cáo, danh mục và hệ thống). Bấm một khối để mở đúng màn hình; chỉ hiện các chức năng bạn có quyền.
- **Menu trái** chia theo nhóm: Tổng quan · Đơn hàng và chi phí · Công nợ và thu chi · Ghi sổ và đối chiếu · Báo cáo và kỳ · Hệ thống.
- **Luồng nghiệp vụ** (dưới Tổng quan) hiển thị sơ đồ dòng dữ liệu từ đối tác đến báo cáo. Đây là màn hình chỉ để tra cứu.
- Cuối menu có nút **Giao diện sáng/tối** và nút **Chủ đề màu**. Chọn một trong 5 chủ đề theo chuẩn HAK Enterprise Design System: **Classic** (xanh ngọc teal trên nền navy, mặc định), **Luxe** (xanh navy và vàng champagne trên nền ngà), **Jade** (xanh ngọc bích), **Neutral** (xám xanh doanh nghiệp), **Champagne** (vàng ấm). Mỗi chủ đề có bản sáng và tối. Lựa chọn chỉ lưu trên trình duyệt này, không ghi vào dữ liệu nghiệp vụ.
- Trên điện thoại, dùng nút menu để mở/đóng thanh bên.
- **Bộ lọc thông minh (HAK Smart Filter)** ở các màn Công nợ phải thu/phải trả, Đơn hàng/PO, Phiếu thu/chi (và COST): một thanh gồm ô tìm không dấu, khoảng ngày (Từ/Đến) hoặc chọn **Kỳ** (tháng), nút **Lọc**, **Lọc nâng cao**, **Xóa lọc** và danh sách **bộ lọc đã lưu**. Hộp **Lọc nâng cao** chia nhóm: đối tượng (đối tác, nhóm nghiệp vụ, tiền tệ, quỹ, mã dịch vụ), trạng thái, số tiền từ–đến (chỉ khi chọn đúng một tiền tệ), hạn thanh toán từ–đến, và điều kiện nhanh (quá hạn, thiếu ngày đến hạn, có cảnh báo, chỉ khoản còn nợ, chỉ dư đầu kỳ, chỉ phiếu chưa phân bổ…). Điều kiện đang áp dụng hiện thành **chip** (bấm để bỏ từng cái); dòng "Kết quả: N dòng · Phạm vi lọc: …" mô tả đúng điều kiện đang dùng. Lọc và tổng do **máy chủ** tính, luôn nằm trong phạm vi dữ liệu của tài khoản bạn (lọc không mở rộng quyền xem); điều kiện không hợp lệ bị báo lỗi chứ không bị bỏ qua. Điều kiện nằm trên địa chỉ trang nên chép đường dẫn là gửi được cho người khác; các liên kết cũ từ Tổng quan vẫn chạy. **Lưu bộ lọc** lưu điều kiện (không lưu dữ liệu) trên trình duyệt của bạn, riêng từng màn hình; khi mở lại bộ lọc cũ mà có điều kiện màn hình không còn hỗ trợ, ứng dụng báo rõ điều kiện nào bị bỏ.
- **Dòng con (cha–con):** ở danh sách chứng từ, đơn hàng và phiếu thu/chi, bấm nút ▸ đầu dòng (hoặc Enter/Space) để mở dòng con: dòng phí và phân bổ thanh toán của chứng từ, khoản phát sinh của đơn (kể cả phần chia từ chi phí chung), phân bổ của phiếu. Dòng con chỉ tải khi mở và được nhớ trong lần xem; có "Mở tất cả / Thu gọn tất cả"; lỗi mạng hiện nút Thử lại. Nhãn **Khớp/Lệch** do máy chủ đối chiếu tổng dòng con với tổng chứng từ (và phân bổ với sổ), chỉ gồm phần trong phạm vi của bạn. Dòng con chỉ để xem; sửa ở màn chi tiết.
- **Tổng hợp công nợ (số liệu dựng sẵn):** menu *Tổng hợp công nợ* có 3 tab — Khách hàng/NCC (dư nợ, quá hạn, đến hạn 7 ngày, chưa xác định hạn, tiền chưa phân bổ), PO chưa thanh toán (doanh thu, chưa lập/đang lập hóa đơn, phải thu còn lại, chi phí) và Chi phí chưa thanh toán. Hệ thống **tự dựng sẵn các bảng tổng hợp mỗi 5 phút khi có thay đổi dữ liệu** nên các màn này (và Bàn làm việc, Tổng quan khi bạn có phạm vi toàn bộ) mở rất nhanh. Đầu màn ghi thời điểm dựng; nếu có thay đổi mới hơn sẽ hiện "Có N thay đổi mới chưa vào bảng tổng hợp"; bấm **Tính lại ngay** để tính trực tiếp (chậm hơn) và cập nhật cho mọi người. Danh sách được lọc theo phạm vi dữ liệu của tài khoản bạn; tổng do máy chủ tính. Muốn số tức thời tuyệt đối (ví dụ khi đối chiếu), dùng các màn Công nợ/Đơn hàng/Phiếu thu-chi hoặc nút Tính lại ngay.
- **Đối soát (tab cuối của Tổng hợp công nợ, dành cho quản trị/kiểm toán):** hệ thống tự đối soát mỗi đêm lúc 02:00 và có nút *Chạy đối soát ngay*: so bảng tổng hợp với sổ gốc, kiểm tổng dòng–chứng từ, phân bổ, bản ghi mồ côi, PO đã lưu trữ còn nghĩa vụ. Mục nào LỖI sẽ được gửi email quản trị. Nếu đầu màn tổng hợp hiện dòng đỏ “Lần dựng gần nhất lỗi”, số liệu đang là bản cũ hoặc tính trực tiếp — báo quản trị kiểm tra bộ kích hoạt.
- **Lưu trữ PO:** khi PO đã *Đóng*, hết phải thu và phải trả của từng đối tác (không bù trừ), không còn chứng từ chờ và đã đủ doanh thu/chi phí/chứng từ, bấm *Lưu trữ PO* ở chi tiết đơn. Lưu trữ chỉ ẩn PO khỏi danh sách và tổng hợp mặc định, không xóa hay đổi số liệu. PO còn phải trả NCC vẫn hiện ở *Tổng hợp công nợ → PO chưa thanh toán*. Cần xem lại: bộ lọc *Hiện cả PO đã lưu trữ*; muốn ghi nhận thêm: *Mở lại lưu trữ* (nhập lý do) rồi *Mở lại đơn*.
- **Trạng thái hệ thống (quản trị):** menu *Hệ thống → Trạng thái* gom các cảnh báo (dựng bảng tổng hợp, đối soát, sao lưu, giao dịch dở, bộ kích hoạt…). Huy hiệu số là số mục cần chú ý. Cảnh báo được lưu lại ngay cả khi email không gửi được; bấm *Xác nhận* sau khi đã xử lý. Khi gặp lỗi hệ thống, hãy gửi cho quản trị **mã tham chiếu** hiện trong thông báo lỗi.
- **Nhập hóa đơn từ XML:** *Nhập hàng loạt → Hóa đơn từ XML* (hoặc nút *📄 Nhập hóa đơn từ XML* ở trang COST/chi tiết PO). Chọn một hoặc nhiều tệp XML hóa đơn điện tử; hệ thống tự nhận hóa đơn bán/mua theo MST công ty (khai `entity.taxCode` ở Danh mục), tìm đối tác theo MST và gợi ý ghép với khoản phát sinh còn mở cùng số tiền. Mỗi dòng chọn riêng *Mã dịch vụ* và *Gắn PO*, nên một hóa đơn có thể gồm nhiều mã dịch vụ. Bấm *Xem trước* → *Ghi thành hóa đơn nháp* (tùy chọn gửi duyệt ngay). Khi nhập tay: dùng nút *Điền từ file XML* trong form hóa đơn, hoặc trong hộp *Lập hóa đơn bán/Ghi nhận hóa đơn mua* từ khoản phát sinh.
- **Nhập hàng loạt hóa đơn bán/mua (có tự gắn PO):** menu *Nhập hàng loạt* → tab *Hóa đơn bán* hoặc *Hóa đơn mua* → bấm **Tải file mẫu (.xlsx)** (có danh sách chọn lấy từ danh mục thật, hướng dẫn từng cột và ví dụ). Điền sheet *Nhập liệu* từ dòng 5 (mỗi dòng một dòng phí; các dòng cùng đối tác + số hóa đơn + ký hiệu + tiền tệ gom thành một hóa đơn), rồi **Chọn tệp** để tải lên (hoặc copy vùng dữ liệu dán vào ô). Điền cột *Số đơn / PO khách* để hóa đơn **tự gắn vào PO** (ghép với khoản phát sinh còn mở cùng số tiền, không có thì tạo khoản mới trong đơn); đã gắn PO thì mọi dòng của hóa đơn đều phải có số đơn. Bấm *Xem trước*, sửa lỗi ở tệp rồi tải lại; khi hợp lệ bấm *Ghi thành hóa đơn nháp* (có thể tick *Gửi duyệt ngay*). Hóa đơn chưa tính vào công nợ cho đến khi được ghi nhận.
- **Chờ duyệt:** menu *Chờ duyệt* có huy hiệu số mục đang chờ BẠN; Bàn làm việc cũng báo ở đầu trang. Màn này liệt kê chứng từ và phiếu thu/chi chờ duyệt hoặc chờ ghi nhận (lâu nhất lên đầu); bấm *Xem* để kiểm tra chi tiết, sau đó *Duyệt*, *Từ chối* (nhập lý do) hoặc *Ghi nhận* ngay tại danh sách. Mục do chính bạn lập/gửi không tự duyệt được.
- **Biết khoản công nợ thuộc PO nào:** danh sách *Phải thu* và *Phải trả* có cột **Đơn hàng/PO** (bấm số đơn để sang đơn; chi phí hiện thêm PO gửi NCC). Ô tìm nhanh tìm được cả số đơn/số PO, bộ lọc nâng cao có *Đơn hàng/PO* và *Chỉ chứng từ chưa gắn PO*.
- **Phân bổ thu/chi:** có 3 cách: (1) menu *Phân bổ thu/chi* — danh sách phiếu thu/chi đã ghi nhận còn tiền chưa phân bổ, bấm *Phân bổ*; (2) trong chi tiết một hóa đơn còn nợ, bấm *Phân bổ thu/chi* rồi chọn phiếu; (3) trong chi tiết phiếu. Phiếu phải ở trạng thái đã ghi nhận; hóa đơn và phiếu phải cùng đối tác và tiền tệ; ngày phân bổ nằm trong kỳ đang mở.
- **Bản nháp tự lưu:** khi nhập chứng từ, phiếu thu/chi, đơn hàng, doanh thu/chi phí, hệ thống tự lưu nháp riêng cho bạn (người khác không xem được). Nếu tắt nhầm trang hoặc mất mạng, mở lại đúng màn đó sẽ có thông báo **Khôi phục / Bỏ bản nháp**; xem tất cả ở menu *Bản nháp của tôi*. Bấm *Lưu* thành công thì bản nháp tự mất; nháp quá 30 ngày tự xóa. Nháp chưa phải số liệu công nợ nên không ảnh hưởng báo cáo.

<a id="luong-tong-the"></a>

## 4. Luồng nghiệp vụ tổng thể

1. **Đối tác** (khách/NCC) được tạo trước.
2. **Đơn hàng/PO** gắn khách, số PO và mã dịch vụ.
3. Từ đơn hàng ghi nhận **doanh thu** và **chi phí** (khoản phát sinh).
4. Từ khoản phát sinh **lập hóa đơn** thành chứng từ phải thu/phải trả ở trạng thái Nháp.
5. Chứng từ đi qua **gửi duyệt → duyệt → ghi nhận**.
6. **Phiếu thu/chi** cũng đi qua duyệt và ghi nhận, rồi **phân bổ** vào các dòng phí.
7. Hệ thống tính **số dư, tuổi nợ**, hỗ trợ **nhắc nợ** và **báo cáo R01–R09**.

> **Lưu ý:** Các nguyên tắc cốt lõi: công nợ chỉ phát sinh khi chứng từ được **ghi nhận**; hóa đơn nháp không tạo công nợ; người lập không tự duyệt chứng từ của mình; số dư không lưu sẵn mà tính bằng thành tiền trừ tổng phân bổ tại ngày chốt.

<a id="doi-tac"></a>

## 5. Đối tác

- Mở **Đối tác** để xem, tìm, thêm hoặc sửa. Có thể đánh dấu là khách hàng, nhà cung cấp hoặc cả hai.
- Khai báo **số ngày thanh toán** (điều khoản) để hệ thống gợi ý ngày đến hạn, và **hạn mức tín dụng** nếu cần kiểm soát công nợ phải thu.
- Nhập đối tác hàng loạt: dán từ Excel mỗi dòng một đối tác theo mẫu **Tên viết tắt | Tên pháp lý | MST | Khách hàng (1/0) | Nhà cung cấp (1/0) | Số ngày hạn nợ | Email | Địa chỉ | Điện thoại | Người liên hệ | Chức vụ | Số tài khoản | Ngân hàng** (các cột sau Email có thể bỏ trống), hoặc tải tệp CSV/văn bản; xem trước rồi mới ghi. Nhập hàng loạt chỉ dành cho người có phạm vi toàn bộ đối tác.
- Hồ sơ đối tác có thêm thông tin liên hệ và thanh toán: **địa chỉ, điện thoại, người liên hệ, chức vụ, email, số tài khoản, ngân hàng (tên, chi nhánh)**. Điện thoại 6–20 ký tự (số, +, khoảng trắng, dấu - . ( )); số tài khoản 4–34 ký tự (chữ, số, gạch). Ô **Thông tin ngân hàng khác** vẫn dùng làm ghi chú. Tên người liên hệ và điện thoại tìm kiếm được ở ô tìm đối tác; tất cả hiện ở trang chi tiết đối tác.
- Nhãn phạm vi (scope tag) dùng để giới hạn người dùng chỉ thấy một nhóm đối tác. Người bị giới hạn phạm vi chỉ sửa được đối tác trong phạm vi của mình, và khi lưu phải gán nhãn thuộc phạm vi đó (nếu không đối tác sẽ biến mất khỏi tầm nhìn của họ).

<a id="don-hang"></a>

## 6. Đơn hàng/PO, doanh thu và chi phí

- **Đơn hàng/PO (Revenue)**: tạo đơn gắn khách, số PO, ngày, nhóm kinh doanh, tiền tệ và **mã dịch vụ** (bắt buộc, chọn một hoặc nhiều mã từ Danh mục → Mã dịch vụ). Mỗi mã dịch vụ trong PO được **cấp tự động một số HSDV riêng** khi lưu theo công thức `GML/<mã dịch vụ>/<tên viết tắt khách>-<2 số cuối năm>/<STT 3 số>`, ví dụ `GML/FWD/YUANDA-26/001`. Tên viết tắt lấy từ hồ sơ đối tác (bỏ dấu, viết hoa, bỏ khoảng trắng); STT đếm riêng theo khách + mã dịch vụ + năm và bắt đầu lại từ 001 khi sang năm mới. Số đã cấp không đổi và không đổi khách hay năm của đơn (hủy và tạo đơn mới nếu cần). Thêm mã mới vào PO thì cấp thêm số; bỏ một mã chỉ được khi chưa có khoản doanh thu/chi phí nào mang mã đó. Đơn cũ chưa có mã dịch vụ chưa nhận được doanh thu/chi phí mới: Bàn làm việc và Tổng quan có cảnh báo "N PO đang mở chưa có mã dịch vụ"; bấm vào để lọc, tick các PO rồi **Gán mã dịch vụ** một lần (mỗi PO được cấp số HSDV riêng), hoặc mở từng PO để chọn nhiều mã. Khi thêm doanh thu/chi phí vào PO có nhiều mã dịch vụ, mỗi khoản (doanh thu và cả chi phí) phải chọn một mã của PO (PO chỉ một mã thì tự điền): chi phí của PO nào mang mã dịch vụ của PO đó và hiện kèm số HSDV, bộ phận thực hiện ở màn Chi phí; hóa đơn lập từ khoản mang mã đó. Đơn có trạng thái mở, đóng hoặc hủy; đơn đã đóng có thể mở lại.
- **COST** (chi phí nhà cung cấp): ghi các khoản chi phải trả nhà cung cấp, có thể gắn một đơn hoặc **chia theo nhiều đơn**.
- Mỗi khoản có loại phí, số lượng container, thành tiền chưa thuế, **chế độ thuế** (Không chịu thuế / Có thuế suất / Chưa xác nhận) và thuế VAT tính sẵn.
- Khoản chưa lập hóa đơn có thể **hủy**. Khoản đã lập hóa đơn thì chỉ giải phóng khi chứng từ bị xóa hoặc đảo.
- **Vòng đời khoản phát sinh:** Chưa lập hóa đơn (OPEN) → **Đang lập hóa đơn** (INVOICING, đã có hóa đơn nháp/chờ duyệt) → Đã lập hóa đơn (INVOICED); hủy hoặc đảo hóa đơn thì khoản trở về Chưa lập. Khoản Đang lập hóa đơn **không biến mất và không tính hai lần**: dashboard, R09, chi tiết đơn và điều kiện đóng đơn đều tính riêng nhóm này; đơn còn khoản Đang lập hóa đơn thì chưa đóng được.
- **Thu hộ/chi hộ** (khoản đánh dấu hộ) được tách khỏi doanh thu/chi phí dịch vụ và khỏi lãi gộp: chi tiết đơn và R09 hiện riêng Doanh thu dịch vụ, Chi phí dịch vụ, Thu hộ, Chi hộ và **Số hộ chưa đối ứng** (thu hộ ≠ chi hộ). Hệ thống không tự biến chênh lệch hộ thành lợi nhuận và không tự tạo khoản đối ứng; khoản chi hộ chưa đủ căn cứ ở trạng thái **chờ xác minh**. Nghĩa vụ phải thu/phải trả và dòng tiền của khoản hộ vẫn được giữ. Lãi gộp tính **riêng từng tiền tệ**.
- Hủy khoản phát sinh hoặc đơn lưu **ngày hủy**; báo cáo tại ngày trước ngày hủy vẫn gồm khoản đó. Lưu, hủy khoản/đơn, đổi ngày đơn hoặc nhập hàng loạt vào kỳ đã **khóa** đều bị chặn.
- Màn **COST** có bộ lọc **Chỉ chi phí chờ phân bổ**: chi phí chung (không thuộc đơn, không chia) và chi phí của đơn chưa có mã dịch vụ/HSDV. Đây là danh sách chờ phân bổ; chi phí chia nhiều đơn hoặc đã gắn mã không nằm trong danh sách.

<a id="nhap-hang-loat"></a>

## 7. Nhập PO/doanh thu/Cost hàng loạt

1. Mở **Nhập PO/Cost hàng loạt** và chọn loại cần nhập (PO/doanh thu hoặc Cost).
2. Dán dữ liệu từ Excel (mỗi dòng một bản ghi, theo dòng ví dụ hiển thị trên màn hình) hoặc tải tệp CSV/văn bản.
3. Bấm xem trước. Hệ thống báo dòng hợp lệ, cảnh báo và lỗi từng dòng.
4. Sửa tệp nếu có lỗi, rồi xác nhận ghi.

- **Nhập chi phí**: cột đầu dùng để tìm đơn theo số đơn, nếu không có thì theo số PO khách (duy nhất).
- **Nhập doanh thu**: các dòng được gom theo khách + số PO; mỗi dòng ghi một mã dịch vụ (bắt buộc, đúng mã trong Danh mục). PO có thêm mã nào xuất hiện thì được cấp thêm mã và số HSDV đó. Với chi phí gắn một đơn có nhiều mã dịch vụ, điền cột Mã dịch vụ ở cuối dòng.
- Thêm tay từng khoản thì gắn thẳng vào đơn đã chọn, mang mã dịch vụ của đơn.

<a id="chung-tu"></a>

## 8. Chứng từ phải thu và phải trả

Mở **Phải thu** hoặc **Phải trả**. Mỗi chứng từ gồm phần đầu (đối tác, tiền tệ, ngày, hóa đơn, hạn thanh toán) và các dòng phí.

| Trạng thái | Ý nghĩa | Bước tiếp theo |
|---|---|---|
| Nháp | Đang soạn, chưa tạo công nợ | Sửa, xóa, gửi duyệt |
| Chờ duyệt | Đã gửi duyệt, đã có số chứng từ | Người duyệt khác: duyệt hoặc từ chối (bắt buộc ghi lý do) |
| Đã duyệt | Chờ ghi nhận | Ghi nhận vào sổ |
| Bị từ chối | Trả về kèm lý do | Sửa rồi gửi duyệt lại, hoặc xóa |
| Đã ghi nhận | Đã tạo công nợ chính thức | Phân bổ thanh toán; muốn sửa phải đảo hoặc điều chỉnh |
| Đã đảo / Đã xóa | Đã vô hiệu | Chỉ xem |

- **Số chứng từ** cấp khi gửi duyệt: PT (phải thu), PTR (phải trả), DH (đảo), DC (điều chỉnh), kèm năm và số thứ tự 6 chữ số.
- **Người lập và người gửi duyệt không được tự duyệt.** Cần một người duyệt khác.
- Chỉ người lập hoặc người duyệt được xóa chứng từ nháp/bị từ chối.
- Hệ thống cảnh báo **nghi trùng** khi cùng đối tác và tiền tệ mà trùng số hóa đơn (và ký hiệu), hoặc trùng ngày + số tiền + chiều công nợ. Khi ghi nhận, muốn tiếp tục phải xác nhận và nhập lý do.
- Với phải thu, hệ thống kiểm **hạn mức tín dụng/quá hạn** khi ghi nhận. Chính sách mặc định chỉ **cảnh báo**; nếu quản trị cấu hình chặn thì người duyệt phải chọn vượt hạn mức kèm lý do mới ghi nhận được.
- **Đảo chứng từ** chỉ làm được khi không còn phân bổ thanh toán (đảo phân bổ trước), chứng từ chưa có điều chỉnh (kể cả bản nháp; xóa hoặc điều chỉnh ngược trước), ngày đảo không trước ngày chứng từ gốc. Không đảo chứng từ đảo/điều chỉnh, hãy lập điều chỉnh ngược lại.
- **Điều chỉnh giảm** không được vượt số dư còn lại của dòng gốc, tính cả các bản điều chỉnh giảm đang chờ và khi ghi nhận kiểm tra lại. Điều chỉnh không tách VAT (hệ thống nhắc khi dòng gốc có thuế). Ngày ghi nhận không được trước ngày chứng từ.
- **Điều chỉnh tăng/giảm** dùng để sửa sai cho chứng từ đã ghi nhận, kể cả trong kỳ đã khóa (ghi nhận vào kỳ đang mở).

> **Lưu ý:** Khoản **chi hộ** không tính VAT: dòng chi hộ phải chọn "không chịu thuế" (VAT của khoản gốc thuộc hóa đơn đứng tên khách hàng). Sửa bản nháp chứng từ, phiếu hay đơn hàng chỉ làm được với đối tác trong phạm vi dữ liệu của chị/anh; phân bổ thanh toán cũng kiểm tra phạm vi của từng chứng từ đích.
- **Ngày ghi nhận:** khi bấm Ghi nhận hệ thống hỏi **ngày ghi nhận** (mặc định là ngày chứng từ nếu còn trong tháng hiện tại, ngược lại là hôm nay; không được là ngày tương lai, không được rơi vào kỳ đã khóa). Sổ công nợ và báo cáo mặc định tính theo **ngày ghi nhận**. Ví dụ chứng từ ngày 30/09 ghi nhận ngày 23/10 xuất hiện trong sổ từ 23/10, **không làm đổi số liệu đã chốt tại 30/09**. Thanh toán, phân bổ, điều chỉnh và đảo cũng theo ngày hiệu lực của chính nó.

<a id="thu-chi"></a>

## 9. Phiếu thu/chi và phân bổ

- Mở **Thu/Chi** để lập phiếu thu (từ khách) hoặc phiếu chi (cho NCC). Mục đích: Thanh toán, Ứng trước hoặc Hoàn tiền.
- Phiếu đi qua các trạng thái giống chứng từ: Nháp → Chờ duyệt → Đã duyệt → Đã ghi nhận. Số phiếu: PH (thu), PC (chi).
- Phiếu đã ghi nhận được **phân bổ** vào các dòng phí còn nợ. Hệ thống gợi ý phân bổ theo thứ tự cũ nhất trước (FIFO) hoặc theo số hóa đơn/ghi chú khớp.
- Phần chưa phân bổ của phiếu là số dư ứng trước, dùng phân bổ sau.
- **Đảo phân bổ** trước, rồi mới đảo được phiếu. Ngày đảo không được trước ngày hiệu lực của phiếu.

> **Mẹo:** Ngày hiệu lực của phiếu quyết định kỳ kế toán ghi nhận. Nếu kỳ đã khóa, hệ thống từ chối.

> **Lưu ý:** Chỉ người lập (hoặc người duyệt) được gửi duyệt phiếu; người lập không được tự từ chối hay tự duyệt phiếu của mình.

<a id="nhac-no"></a>

## 10. Nhắc nợ và theo dõi

- Mở **Nhắc nợ** để xem nợ đến hạn, quá hạn theo nhóm tuổi nợ: Chưa đến hạn · 1–30 · 31–60 · 61–90 · Trên 90 ngày · Thiếu ngày đến hạn.
- Với từng khoản có thể ghi **theo dõi**: cam kết thanh toán, tranh chấp, ghi chú, đã liên hệ; sau đó đóng theo dõi.
- **Xem trước và gửi thư nhắc nợ** tới email liên hệ của đối tác; nội dung gồm danh sách chứng từ và thông tin ngân hàng. Mỗi lần gửi được ghi vào lịch sử theo 3 bước: "chưa xác nhận đã gửi" → "đã gửi" hoặc "gửi thất bại". Bấm gửi hai lần cùng một thư không gửi trùng; nếu thất bại, đóng cửa sổ và soạn lại.
- Hệ thống tự gửi bản tổng hợp nợ quá hạn mỗi sáng nếu đã cấu hình email cảnh báo.
- Khoản còn nợ chưa có ngày đến hạn hiển thị **"Chưa xác định hạn"**: không tự kết luận là quá hạn, nằm riêng trong nhóm tuổi nợ và trong cảnh báo; bổ sung hạn (hoặc điều khoản đối tác) để khoản vào nhóm tuổi nợ đúng.

<a id="dau-ky"></a>

## 11. Dư đầu kỳ

1. Mở **Dư đầu kỳ**, nhập (dán) tối đa 1.000 dòng mỗi lần. Mỗi dòng thuộc một loại: **AR** (phải thu), **AP** (phải trả), **CASH** (quỹ/tài khoản) hoặc **CREDIT** (khoản ứng/có của đối tác), tại **ngày đầu sổ**.
2. Lưu nháp, kiểm tra tổng, rồi gửi duyệt.
3. Người duyệt khác (không phải người lập) kiểm tra bản xem trước, xác nhận đúng tổng hợp rồi ghi nhận. Hệ thống tạo chứng từ mở đầu (số **OPN-...**) cho AR/AP, phiếu ứng trước cho CREDIT và số dư quỹ cho CASH.

4. Quy tắc kiểm tra: mỗi tài khoản quỹ (CASH) chỉ một dòng số dư; ngày chứng từ gốc phải trước ngày đầu sổ; hạn thanh toán không được trước ngày chứng từ; đối tác đã ngừng sử dụng bị từ chối. Khi người duyệt bấm ghi nhận, hệ thống kiểm tra lại toàn bộ dòng theo danh mục hiện tại; nếu có lỗi sẽ chặn và nêu dòng nào, người duyệt từ chối để người lập sửa.
5. Dư đầu kỳ là số liệu toàn công ty: chỉ người có phạm vi toàn bộ đối tác và nhóm nghiệp vụ được lập, gửi duyệt, từ chối, ghi nhận. Người bị giới hạn phạm vi khi xem chỉ thấy các dòng thuộc phạm vi của mình.
6. Sau khi đã ghi nhận không sửa trực tiếp: công nợ sai thì sửa bằng chứng từ điều chỉnh hoặc đảo; số dư quỹ đầu kỳ sai cần quản trị xử lý.

> **Lưu ý:** Ngày đầu sổ mặc định là 01/01/2026, do quản trị đặt khi cài đặt và không đổi trên giao diện sau khi đã có dữ liệu. Không ghi chứng từ trước ngày này.

<a id="sao-ke"></a>

## 12. Nhập sao kê ngân hàng

1. Mở **Nhập sao kê**, chọn tài khoản quỹ và tải tệp CSV sao kê.
2. Hệ thống đọc và **xem trước**: dòng hợp lệ, cảnh báo trùng với phiếu đã có (cùng ngày/số tiền/mã giao dịch), thiếu thông tin. Tệp đã nhập trước đó (cùng nội dung) bị chặn.
3. Với từng dòng chọn **Chấp nhận** hoặc **Loại dòng**; dòng chưa quyết định thì chưa ghi.
4. Người có quyền duyệt xác nhận ghi lô. Hệ thống tạo **phiếu thu/chi đã ghi nhận** theo ngày giao dịch, mục đích Thanh toán, nguồn "Nhập từ tệp". Sau đó vào Thu/Chi để phân bổ.

> **Lưu ý:** Nhập, rà soát và ghi sao kê chỉ dành cho người có phạm vi toàn bộ đối tác và nhóm nghiệp vụ; người bị giới hạn chỉ xem được các dòng thuộc đối tác trong phạm vi. Khi ghi lô, hệ thống kiểm tra lại trùng với phiếu đã có hoặc dòng đã ghi (kể cả từ lô khác); nếu có sẽ chặn và yêu cầu tải lại để quyết định lại.

> **Mẹo:** Có thể hủy cả lô nếu chưa ghi.

<a id="doi-chieu"></a>

## 13. Đối chiếu với file Excel

- Mở **Đối chiếu Excel**, tải file Excel công nợ đang dùng.
- Hệ thống đọc phần phải thu, phải trả, so với số liệu trong ứng dụng theo đối tác, số hóa đơn và tiền tệ.
- Kết quả liệt kê khớp, lệch và thiếu để bạn xử lý. Chức năng chỉ so sánh, **không sửa dữ liệu**.
- Hệ thống đọc file theo **mẫu cột cố định** (sheet FWD, CBT, NCC, BMT). Nếu một sheet có dữ liệu mà không đọc được dòng nào, báo cáo có cảnh báo "file có thể không đúng mẫu". Số hóa đơn, mã dịch vụ so khớp không phân biệt hoa/thường, dấu cách, dấu gạch và số 0 đầu. Phải thu của nhóm/tiền tệ không có trong file mẫu được ghi chú riêng, không tính vào so sánh.

<a id="bao-cao"></a>

## 14. Báo cáo

| Mã | Tên báo cáo |
|---|---|
| R01 | Báo cáo tổng hợp công nợ cuối ngày |
| R02 | Bảng chi tiết công nợ phải thu khách hàng |
| R03 | Bảng chi tiết công nợ phải trả NCC/shipper |
| R04 | Bảng công nợ theo mã dịch vụ và đợt |
| R05 | Bảng quyết toán công nợ |
| R06 | Biên bản đối chiếu/xác nhận công nợ |
| R07 | Báo cáo tuổi nợ |
| R08 | Sổ thu/chi và phân bổ thanh toán |
| R09 | Báo cáo doanh thu – chi phí – lãi gộp theo đơn hàng/mã dịch vụ (mỗi đơn tách từng mã dịch vụ kèm số HSDV và bộ phận thực hiện; cuối mỗi tiền tệ có bảng tổng hợp theo mã) |
| R10 | Bảng kê thuế GTGT hàng hóa, dịch vụ bán ra (menu Thuế GTGT) |
| R11 | Bảng kê thuế GTGT hàng hóa, dịch vụ mua vào (menu Thuế GTGT) |
| R12 | Dự báo dòng tiền thu – chi theo hạn thanh toán (từng tiền tệ) |

- Chọn báo cáo, đặt tham số (ngày chốt, đối tác, tiền tệ...) và chạy. **Xuất** ra Excel hoặc PDF.
- **Phát hành bản chốt**: lưu cố định một báo cáo tại thời điểm đó (có mã băm và phiên bản) để tải lại sau này.
- R09 tính lãi gộp theo đơn hàng, từng tiền tệ riêng, CHỈ từ khoản đã lập hóa đơn (có hóa đơn mới ghi nhận doanh thu, chi phí): khoản chưa/đang lập hóa đơn không vào lãi. Khi có tiền tệ khác VND, cuối báo cáo có phần Quy đổi VND (tham khảo): mỗi lần ghi nhận quy đổi theo tỷ giá đã lưu trên chính chứng từ đó. R09 có thể lọc theo khách hàng, nhóm, tiền tệ, khoảng ngày đơn, **một đơn hàng cụ thể** (ô Đơn hàng cụ thể) hoặc **tìm theo một phần số đơn/số PO**; lọc theo đơn thì không hiện dòng Chi phí chung và tiêu đề ghi đơn đang lọc. **R02/R03 theo đối tác:** từng dòng chứng từ chỉ hiện phần đã phân bổ vào chứng từ đó; tiền thu/chi đã ghi nhận nhưng chưa phân bổ (ứng trước) hiện thành dòng riêng cuối mỗi đối tác, kèm dòng đã thu/đã trả gồm ứng trước và số còn lại sau khi trừ ứng trước. Màn Tổng hợp công nợ (tab Khách hàng/NCC) có cột Còn nợ ròng đã trừ tiền chưa phân bổ. **Công nợ tổng thể quy đổi VND:** Tổng quan có thẻ Tổng công nợ quy đổi VND (phải thu, phải trả, ròng); Tổng hợp công nợ có công tắc Hiển thị (Quy đổi VND / Từng tiền tệ / Chỉ USD…); R01, R02/R03 và R07 có khối Quy đổi VND ở cuối. Quy đổi theo giá trị ghi sổ: số còn nợ nguyên tệ × tỷ giá ĐÃ LƯU trên từng chứng từ (tiền chưa phân bổ theo số VND đã lưu trên phiếu), không dùng tỷ giá ngày chốt (đánh giá lại cuối kỳ xem R14); chứng từ chưa có tỷ giá và bảng Tỷ giá cũng không có thì không tính và được báo rõ. Sau khi cập nhật bản mới, bấm Làm mới (tính lại ngay) ở Tổng hợp công nợ/Tổng quan một lần để bảng tổng hợp có số quy đổi.
- R02/R03 (chi tiết phải thu/phải trả) có ô "Đơn hàng cụ thể" và "Tìm theo số đơn / PO": chỉ liệt kê chứng từ có dòng phí gắn với PO đó (kể cả khoản chia nhiều đơn); tiêu đề ghi "Đơn hàng: …". Khi lọc theo đơn, tiền ứng trước không gắn với đơn nên không đưa vào.
- Tỷ giá mua/bán: ở menu Tỷ giá có thể nhập thêm tỷ giá MUA và BÁN của ngân hàng (không bắt buộc). Đánh giá lại cuối kỳ (R14 và bút toán chênh lệch) dùng tỷ giá MUA cho phải thu và quỹ ngoại tệ, tỷ giá BÁN cho phải trả; chưa nhập thì dùng tỷ giá chung và có cảnh báo. R14 tách cột "đã quy đổi" và "chưa quy đổi (thiếu tỷ giá)"; tỷ giá cuối kỳ cũ hơn 7 ngày cũng được cảnh báo.
- **Thuế GTGT (R10 bán ra, R11 mua vào)**: mở từ menu **Thuế GTGT**. Chọn khoảng ngày (mặc định từ đầu tháng đến ngày chốt, **theo ngày hóa đơn**), có thể lọc nhóm. Bảng kê gom theo thuế suất (0%, 5%, 8%, 10%…, không chịu thuế) kèm ký hiệu, số, ngày hóa đơn, tên và mã số thuế đối tác. Chỉ gồm chứng từ **đã ghi nhận**, hóa đơn **VND**; dòng chi hộ không kê. Hóa đơn bị đảo hiện cả dòng gốc và dòng đảo (số âm); điều chỉnh tăng/giảm và dòng **chưa xác nhận thuế** nằm riêng, không cộng vào tổng (chưa xác nhận thuế sẽ chặn "Phát hành bản chốt"). Hóa đơn ngoại tệ, chứng từ chưa ghi nhận và thiếu mã số thuế được ghi chú cuối báo cáo. Bảng mua vào chưa phân loại "đủ điều kiện khấu trừ": kế toán thuế rà trước khi kê khai.
- Các báo cáo đều tính **tại ngày chốt** đã chọn: R05 và R09 chỉ gồm chứng từ, điều chỉnh, khoản phát sinh có ngày đến ngày chốt. R05 có thêm các dòng đảo/điều chỉnh của kỳ quyết toán; R06 ghi thêm phiếu thu/chi chưa phân bổ (ứng trước) và số dư sau khi trừ ứng trước; hai cột "chưa lập/nhận HĐ" của R09 là số đã gồm thuế.
- **Bản chốt** của báo cáo không gắn đối tác (R01, R02, R03, R07, R08, R09) chỉ người có phạm vi toàn bộ đối tác và nhóm kinh doanh, hoặc chính người phát hành, mới xem và tải được. Bản chốt gắn đối tác (R04, R05, R06) theo phạm vi đối tác.
- **Sổ thu/chi quỹ (R08)** chỉ dành cho người có phạm vi toàn bộ đối tác và nhóm kinh doanh, vì tồn quỹ không chia theo đối tác.
- **Cơ sở ngày:** mặc định báo cáo tính theo ngày ghi nhận (khớp sổ đã chốt). Có thể chọn **Ngày chứng từ** để xem/đối chiếu; báo cáo ghi nhãn rõ cơ sở ngày, số có thể khác sổ đã chốt, và **không phát hành bản chốt** ở chế độ này. Quản trị chạy hàm **auditLedgerDates()** để liệt kê chứng từ có ngày ghi nhận khác tháng với ngày chứng từ (dữ liệu cũ chịu ảnh hưởng) — chỉ liệt kê, không sửa dữ liệu.
- R09 có cột trạng thái số liệu: **"Chưa đủ dữ liệu"** khi có doanh thu dịch vụ nhưng chưa có chi phí; **"Lãi gộp theo khoản đã ghi nhận – …"** khi còn khoản chưa/đang lập hóa đơn, số hộ chưa đối ứng hoặc chi hộ chờ xác minh. Chi phí chưa gắn mã dịch vụ/HSDV nằm ở dòng "(chưa gắn mã)" làm danh sách chờ phân bổ.
- R09 dựng lại trạng thái hóa đơn **theo ngày chốt** từ lịch sử liên kết hóa đơn–khoản: đảo hóa đơn hoặc tạo hóa đơn nháp sau ngày chốt **không làm đổi** R09 của các ngày trước đó. **Điều chỉnh tăng/giảm đã ghi nhận** (ví dụ giảm giá dịch vụ) được cộng vào doanh thu/chi phí của khoản gốc từ ngày hiệu lực của điều chỉnh; R09 trước ngày đó giữ nguyên. Điều chỉnh không tách VAT nên phần giảm trừ vào số trước thuế bằng đúng số điều chỉnh. Hóa đơn bị xóa hoặc bị từ chối sau ngày chốt cũng không làm đổi R09 của các ngày trước (bản ghi đã xóa được giữ để dựng lịch sử; khoản thuộc hóa đơn bị từ chối vẫn tính là "đang lập" cho đến khi hóa đơn được xóa). Khi điều chỉnh một khoản chi phí chia nhiều đơn, phần điều chỉnh được chia cho các đơn sao cho **tổng các phần đúng bằng số điều chỉnh gốc** (phần dư chia theo phần lẻ lớn nhất).
- **R12 – Dự báo dòng tiền thu – chi theo hạn:** xếp các khoản còn nợ đã ghi nhận theo ngày dự kiến thanh toán (nếu đã nhập) hoặc ngày đến hạn: quá hạn, trong 7 ngày, 8–14, 15–30, 31–60, 61–90, trên 90 ngày; mỗi tiền tệ một khối, có chênh lệch thu – chi và lũy kế. Khoản **chưa xác định hạn** nằm riêng, KHÔNG tính vào lũy kế (cần bổ sung hạn). Tiền khách đã thu và tiền đã chi NCC chưa phân bổ vào chứng từ được trừ ở dòng bù trừ riêng (kèm dòng \"dự kiến sau bù trừ\"); có thể chia theo tuần (4 tuần đầu). Chưa tính thuế, tỷ giá, lương và chi phí cố định.
- **Mẫu PDF/Excel:** tiêu đề doanh nghiệp (khai báo ở Thiết lập: tên, địa chỉ, MST, điện thoại, email, logo, tài khoản ngân hàng), mã mẫu, kỳ/ngày chốt, bộ lọc và cơ sở ngày, nhãn BẢN NHÁP/BẢN CHỐT, khối TÓM TẮT theo từng tiền tệ, băng tiêu đề gọn 3 hàng (công ty · tên báo cáo · trạng thái · mã mẫu · tiêu đề cột) lặp ở mọi trang in, điều kiện lọc và tóm tắt chỉ ở trang đầu, dòng nhóm/tổng riêng, số âm màu đỏ, bằng chữ, ghi chú, khối chữ ký và chân trang. Báo cáo rộng (trên 14 cột, như R09) xuất giấy A3. Tệp Excel có thêm trang "Hướng dẫn đọc" (cách tính, tham số, lưu ý).

<a id="ky"></a>

## 15. Kỳ kế toán

1. Mở **Kỳ**, bấm **Kiểm tra điều kiện khóa** để xem danh sách việc còn dang dở (chứng từ chưa ghi nhận...).
2. Khi đủ điều kiện, người có quyền **khóa kỳ**. Kỳ đã khóa không cho ghi chứng từ, phiếu hay phân bổ có ngày hiệu lực trong kỳ.
3. Không khóa được kỳ trong tương lai, cũng không khóa được tháng trước tháng đầu sổ. Phải khóa các kỳ theo thứ tự (kỳ trước chưa khóa thì chưa khóa được kỳ sau), và dư đầu kỳ đang nháp hoặc chờ duyệt cũng chặn khóa kỳ.
4. Cần sửa: dùng **chứng từ điều chỉnh** vào kỳ đang mở. Nếu bắt buộc phải mở lại: Kế toán trưởng **yêu cầu mở lại** kèm lý do, quản trị hệ thống **xác nhận mở lại**.
5. Khóa kỳ chặn **mọi đường ghi** vào kỳ đã khóa: chứng từ, phiếu thu/chi, phân bổ, điều chỉnh, khoản phát sinh (lưu/hủy/lập hóa đơn), đơn hàng và nhập hàng loạt. Khi sửa ngày hoặc chuyển hồ sơ, hệ thống kiểm cả kỳ cũ lẫn kỳ mới. Nghiệp vụ phát sinh sau khi khóa: lập chứng từ điều chỉnh ở kỳ đang mở, hoặc mở lại kỳ theo quy trình trên.

<a id="sao-luu"></a>

## 16. Sao lưu và khôi phục

- Hệ thống **tự sao lưu hằng ngày lúc 01:00**. Có thể bấm **Sao lưu** thủ công; chỉ sao lưu khi không còn thao tác ghi dở.
- Mặc định giữ **14 bản gần nhất**, luôn giữ tối thiểu 3 bản đã xác minh; ghi chú có chữ **KEEP** để bảo vệ bản đó.
- Bấm **Kiểm tra** để xác minh bản sao lưu bằng mã băm và số dòng.
- Khi sao lưu, hệ thống còn so bản sao với dữ liệu gốc; bản sao lệch bị đánh dấu thất bại và báo cho quản trị.
- Bản sao lưu thủ công và bản tự động trước khi khôi phục được tính cửa sổ lưu riêng, không làm mất các bản hằng ngày.
- Cảnh báo (sao lưu thất bại, khôi phục) gửi tới email đặt ở **ALERT_EMAIL**; nếu chưa đặt thì gửi tới email của tài khoản chạy hệ thống.

**Khôi phục dữ liệu cần hai người:**

1. Người thứ nhất bấm **Chuẩn bị khôi phục**, nhập lý do. Hệ thống tự sao lưu trước, đưa vào **chế độ bảo trì** (chặn mọi thao tác ghi) và tạo bản ứng viên, đồng thời cho biết số thao tác sẽ mất kể từ thời điểm sao lưu.
2. Người thứ hai (vai trò Kế toán trưởng, khác người thứ nhất) kiểm tra rồi bấm **Chuyển sang bản khôi phục**. Nếu số kiểm soát sau khôi phục không khớp, hệ thống tự quay lại dữ liệu cũ.
3. Có thể **Quay lại dữ liệu cũ** (chỉ Kế toán trưởng, phải nhập lý do, không làm được khi đang có yêu cầu khôi phục) hoặc **Hủy khôi phục** (gỡ chế độ bảo trì, tệp ứng viên được bỏ vào thùng rác) khi cần.
4. Có thể khôi phục bản sao lưu của phiên bản cũ: hệ thống tự bổ sung các cột mới trước khi kiểm tra. Nếu bước kiểm tra gặp lỗi bất kỳ, hệ thống tự quay lại dữ liệu cũ và giữ yêu cầu khôi phục để chị xem lại hoặc hủy.

> **Lưu ý:** Khi hệ thống ở chế độ bảo trì, mọi thao tác ghi bị chặn với thông báo "Hệ thống đang bảo trì/khôi phục dữ liệu". Chỉ người có quyền khôi phục mới gỡ được.

<a id="quan-tri"></a>

## 17. Người dùng, danh mục và nhật ký

- **Người dùng**: mời người dùng bằng email Google, gán vai trò, phạm vi dữ liệu; tạm khóa/mở lại.
- **Danh mục và cấu hình**: loại phí, **mã dịch vụ** (mỗi mã có thêm cột **bộ phận thực hiện**; PO chọn một hoặc nhiều mã; bản có sẵn 5 mã theo bộ phận: CFN, FWD, CBT, MV, TRD; mã đã dùng không đổi được, chỉ ngừng dùng), tài khoản quỹ, tiền tệ, nhóm kinh doanh...; cấu hình ngày đầu sổ, số bản sao lưu giữ...
- **Mã danh mục đang dùng không đổi được**: loại phí, nhóm kinh doanh, tiền tệ, tài khoản quỹ đã có dữ liệu thì chỉ sửa tên hoặc ngừng sử dụng; tiền tệ đã phát sinh dữ liệu không đổi số chữ số thập phân. Không đổi loại của mục đã tạo.
- Khi lưu người dùng, phạm vi dữ liệu được kiểm tra (đối tác, nhóm nghiệp vụ phải tồn tại; nhãn hợp lệ). Không tự đổi vai trò, trạng thái hay phạm vi của chính mình.
- **Nhật ký**: mọi thay đổi và các lần bị từ chối truy cập (ai, lúc nào, làm gì, trước/sau). Dùng để truy vết và kiểm soát. Số tài khoản và điện thoại đối tác được che (chỉ còn 4 số cuối) trong nhật ký. Khi lọc/tìm, hệ thống chỉ quét 20.000 dòng gần nhất và hiện thông báo nếu bị cắt. **Lưu trữ tự động:** mỗi ngày lúc 03:00 hệ thống chuyển lịch sử giao dịch cũ (mặc định trên 90 ngày) và nhật ký cũ (mặc định trên 24 tháng) sang tệp bảng tính CONGNO_ARCHIVE_SysTx_<năm> và CONGNO_ARCHIVE_AuditLog_<năm> trong Drive của chủ hệ thống, sau khi kiểm tra bản lưu khớp mới xóa khỏi bảng đang dùng. Số ngày/tháng giữ chỉnh ở Danh mục → Thông tin doanh nghiệp (tối thiểu 30 ngày và 12 tháng). Dữ liệu đã lưu trữ không hiện trong màn Nhật ký; mở trực tiếp tệp lưu trữ khi cần tra cứu.

<a id="loi"></a>

## 18. Thông báo thường gặp và cách xử lý

| Thông báo | Nguyên nhân | Cách xử lý |
|---|---|---|
| Hệ thống đang bận / Dữ liệu đang được cập nhật | Có người khác đang ghi | Chờ vài giây rồi thử lại. Không cần bấm nhiều lần: ứng dụng tự chống ghi trùng |
| Bản ghi đã được người khác thay đổi. Hãy tải lại | Hai người cùng sửa một bản ghi | Tải lại màn hình, xem bản mới nhất rồi sửa lại |
| Người lập/gửi duyệt không được tự duyệt | Chặn tự duyệt | Nhờ người duyệt khác |
| Chứng từ đang ở trạng thái ..., không thực hiện được | Sai bước quy trình hoặc đã có người xử lý | Tải lại để xem trạng thái hiện tại |
| Chứng từ nghi trùng | Có chứng từ tương tự | Kiểm tra, nếu đúng là hợp lệ thì xác nhận kèm lý do |
| Còn phân bổ thanh toán | Đảo chứng từ/phiếu khi còn phân bổ | Đảo phân bổ trước |
| Kỳ đã khóa | Ngày hiệu lực nằm trong kỳ khóa | Dùng chứng từ điều chỉnh vào kỳ đang mở hoặc xin mở lại kỳ |
| Quá nhiều yêu cầu | Gửi quá nhanh | Chờ khoảng một phút |
| Hệ thống đang bảo trì/khôi phục | Đang khôi phục dữ liệu | Chờ quản trị gỡ chế độ bảo trì |
| Sheet ... sai tiêu đề cột | Có người sửa cấu trúc bảng tính dữ liệu | Báo quản trị: khôi phục tiêu đề cột, chạy lại ensureSchema() |
| Mã ... đã được dùng trong ...: không đổi mã | Mục danh mục đã có dữ liệu | Chỉ sửa tên hoặc ngừng sử dụng; muốn mã khác thì tạo mục mới |
| Khoản chi hộ không tính VAT | Dòng chi hộ chọn thuế suất | Chọn "không chịu thuế" cho dòng chi hộ |
| Không khóa kỳ trong tương lai / kỳ trước tháng đầu sổ | Chọn nhầm tháng khi khóa | Chọn lại kỳ đang kết thúc |
| Dữ liệu danh mục đã đổi từ lúc lưu (dư đầu kỳ) | Đối tác hoặc danh mục đổi sau khi lưu nháp | Từ chối, người lập sửa các dòng được nêu rồi gửi lại |
| Không đọc được bản khôi phục. Đã tự quay lại DB cũ | Bản ứng viên lỗi hoặc lệch số kiểm soát | Dữ liệu đang dùng không đổi; hủy hoặc chuẩn bị lại khôi phục |
| Chứng từ đã có điều chỉnh (khi đảo) | Còn bản điều chỉnh gắn với chứng từ | Xóa bản nháp điều chỉnh hoặc lập điều chỉnh ngược trước |
| Giảm quá số dư còn lại của dòng | Điều chỉnh giảm lớn hơn số dư, tính cả bản nháp khác | Giảm số tiền hoặc xử lý bản nháp đang chờ |
| Sao kê: từ lúc xem trước đã có phiếu cùng ngày/số tiền/mã giao dịch | Phiếu trùng được tạo giữa chừng | Tải lại lô, quyết định lại dòng đó |
| Không đủ quyền / Ngoài phạm vi | Vai trò hoặc phạm vi chưa cho phép | Nhờ quản trị cấp quyền nếu cần |

<a id="luu-y"></a>

## 19. Quy tắc làm việc nên nhớ

- Kiểm tra ngày chốt trước khi đọc số dư/báo cáo.
- Không nhập hai lần cùng một hóa đơn; đọc kỹ cảnh báo nghi trùng.
- Khi bấm lưu mà chưa thấy phản hồi, **đừng nhập lại**: mở lại danh sách để kiểm tra trước.
- Sửa sai bằng **đảo/điều chỉnh**, không xóa chứng từ đã ghi nhận.
- Phiếu thu/chi luôn nên được phân bổ để tuổi nợ phản ánh đúng.
- Không chia sẻ tài khoản Google đã được cấp quyền.
- Mỗi thao tác ghi dữ liệu được ghi **nhật ký trước khi hoàn tất**; nếu hệ thống dừng giữa chừng, bộ phục hồi (mỗi 5 phút, hoặc quản trị chạy **recoverStale_**) hoàn tất hoặc hoàn tác giao dịch, không tạo bản ghi hay nhật ký trùng. Gửi lại cùng mã yêu cầu trả kết quả cũ; cùng mã nhưng nội dung khác bị từ chối; hai người cùng sửa một bản ghi thì người sau phải tải lại.

<a id="cai-dat"></a>

## 20. Dành cho quản trị: cài đặt và cập nhật

Hệ thống gồm hai Apps Script: **Gateway** (giao diện, xác minh tài khoản Google, ký yêu cầu) và **Backend** (dữ liệu, nghiệp vụ, Web App chạy dưới quyền chủ sở hữu và chỉ nhận yêu cầu có chữ ký HMAC).

1. Backend: chạy **setupBackend()** một lần để tạo 2 bảng tính (dữ liệu và nhật ký), khóa HMAC, tiêu đề cột, dữ liệu mặc định và bộ kích hoạt tự động (sao lưu 01:00, dọn giao dịch dở mỗi 5 phút, tổng hợp quá hạn 08:00).
2. Đặt Script Property **BOOTSTRAP_ADMIN** = email quản trị đầu tiên; tùy chọn **ALERT_EMAIL** để nhận cảnh báo.
3. Deploy Backend: Execute as Me, Who has access: Anyone. Sao chép URL.
4. Gateway: đặt Script Properties **BACKEND_URL** (URL trên) và **HMAC_SECRET** (giá trị ghi trong nhật ký chạy setupBackend). Deploy Web App phục vụ người dùng với **Execute as: User accessing the web app** và Who has access: Anyone with Google account (hoặc chỉ tên miền công ty): Gateway dựa vào Session.getActiveUser để lấy đúng email người đang dùng, nên KHÔNG đặt Execute as Me. Backend thì Execute as Me (quyền chủ triển khai) và chỉ nhận yêu cầu có chữ ký HMAC.
5. Mỗi lần cập nhật code: lưu, chọn **Deploy → Manage deployments → Edit → New version** để chắc người dùng chạy mã mới; làm mới trình duyệt (Ctrl+F5).
6. Chạy **ensureSchema()** sau khi cập nhật (bắt buộc với bản có schema 1.7, vì thêm cột cuối các bảng Đối tác, Đơn hàng (mã dịch vụ, số HSDV), Khoản phát sinh (mã dịch vụ) và Dòng chứng từ (mã dịch vụ): hàm tự thêm tiêu đề, không làm lệch dữ liệu cũ) hoặc nếu nghi ngờ ai đó sửa tiêu đề cột. Kết quả ghi ở Logger; nếu có bảng lệch phải sửa trước khi dùng.
7. Cần xóa bộ nhớ đệm đọc: chạy **clearReadCache()**. Sau khi cập nhật bản có lưu trữ tự động, chạy **installTriggers()** một lần để tạo bộ kích hoạt lưu trữ 03:00 (hoặc chạy **archiveOldData()** thủ công để lưu trữ ngay).
8. (Khuyến nghị) Bật dịch vụ nâng cao **Drive API** (Services → Drive API) cho Backend để tệp bảng tính tạm khi xuất báo cáo được xóa hẳn. Nếu không bật, hệ thống xóa sạch nội dung tệp tạm rồi bỏ vào thùng rác.

> **Lưu ý:** Không chia sẻ HMAC_SECRET. Không thêm/xóa/đổi thứ tự cột trong các bảng tính dữ liệu; ứng dụng ánh xạ cột theo vị trí và sẽ từ chối chạy nếu tiêu đề lệch.
9. **Nâng cấp từ bản cũ (schema 1.9):** (a) Sao lưu: File → Make a copy cho cả bảng tính Dữ liệu và Nhật ký (và chạy sao lưu của ứng dụng); (b) thay Backend.gs nhưng CHƯA deploy; (c) chạy ensureSchema(): bước 1 chỉ kiểm tra tiêu đề (dry-run), nếu lệch lõi thì DỪNG và không ghi gì; bước 2 chỉ thêm tiêu đề cột bổ sung ở **cuối** bảng, không đổi thứ tự, không động đến dữ liệu; chạy lại bao nhiêu lần cũng không đổi gì thêm; (d) chạy auditLedgerDates() để xem dữ liệu cũ có ngày ghi nhận khác ngày chứng từ; (e) deploy phiên bản mới. **Quay lui:** deploy lại phiên bản Backend trước (Manage deployments → chọn version cũ); các cột mới ở cuối bảng không ảnh hưởng bản cũ; nếu cần, khôi phục từ bản sao ở bước (a).

## 21. Bổ sung R3.5: chi phí không hóa đơn, quỹ tiền mặt, nhập sao kê .xlsx

### 21.1 Chi phí không có hóa đơn GTGT
- **Công nợ phải trả chỉ phát sinh từ chứng từ phải trả đã ghi nhận.** Khoản phát sinh (COST) gắn đơn mà chưa lập hóa đơn **chưa phải công nợ**: chỉ tính vào chi phí/lãi gộp của đơn và hiện ở "Phát sinh chưa lập hóa đơn".
- **Thuế:** chọn **Không chịu thuế (KCT)** ở dòng chi phí → VAT = 0, không vào bảng kê thuế mua vào. Không để "Chưa xác nhận".
- **Gắn đơn/PO:** nhập khoản COST ở chi tiết đơn hoặc Nhập hàng loạt → Cost.
- **Tạo chứng từ phải trả:** (a) nhập tay hóa đơn mua (số hóa đơn không bắt buộc); (b) từ khoản phát sinh → "Ghi nhận hóa đơn mua" (**bắt buộc số hóa đơn + ngày hóa đơn NCC**); (c) Nhập hàng loạt hóa đơn mua (cột Số hóa đơn bắt buộc). Với (b), (c): điền số biên nhận / bảng kê / số chứng từ nội bộ và ghi "KHÔNG HÓA ĐƠN" ở ghi chú.
- **Duyệt, ghi nhận, trả tiền** như chứng từ thường; công nợ tính từ ngày ghi nhận. Trả tiền bằng phiếu chi hoặc Nhập sao kê (điền số chứng từ ở cột *Số HĐ/Mã dịch vụ* để được gợi ý phân bổ).
- **Chi lặt vặt, phí ngân hàng, không đơn:** Nhập sao kê, Đối tác = nhà cung cấp riêng (ví dụ "CHI PHÍ KHÔNG HÓA ĐƠN"), Diễn giải ghi "KHÔNG HÓA ĐƠN". Không tạo phải trả; khoản đã chi là "đã trả chưa phân bổ" của nhà cung cấp riêng đó.
- Điều kiện được trừ thuế và hạch toán tài khoản chi phí do **kế toán trưởng** quyết định; ứng dụng không đánh giá. Chưa có loại chứng từ riêng "chi phí không hóa đơn".

### 21.2 Quỹ tiền mặt không chi vượt số dư
Tài khoản quỹ có loại *Tiền mặt (CASH)* hoặc *Ngân hàng (BANK)*. Quỹ tiền mặt (VND và ngoại tệ) không được chi vượt số dư khi ghi nhận phiếu chi, chuyển quỹ (quỹ đi), bán/mua ngoại tệ, nhập sao kê (cộng dồn cả lô theo ngày); cũng không được đảo phiếu thu/chuyển quỹ nhận/bán-mua ngoại tệ/thừa kiểm kê nếu tiền đã chi hết. Lỗi `CASH_OVERDRAFT`, dữ liệu không đổi. Quỹ ngân hàng giữ cách cũ.

### 21.3 Nhập sao kê ngân hàng / sổ tiền mặt (.xlsx)
Một mẫu dùng chung, phân biệt bằng cột Tài khoản quỹ. Bấm **⬇ Tải file mẫu (.xlsx)** (có quỹ + đối tác thật), điền, **Chọn tệp** (.xlsx hoặc .csv) → Xem trước → rà soát → người khác duyệt ghi. Mọi dòng ghi phải có đối tác đúng vai trò.

### 21.4 Thu hộ / chi hộ và tỷ giá (thay đổi R3.5)
Khoản hộ không chịu thuế. Hai khoản hộ ngoại tệ khác ngày: chênh lệch tỷ giá khi ghép vào bút toán chênh lệch tỷ giá đã thực hiện. Thừa kiểm kê quỹ ngoại tệ nhập theo tỷ giá bình quân của quỹ. "Tính lại bình quân" gặp kỳ đã khóa thì từ chối cả lượt, mở khóa kỳ rồi tính lại.

### 21.5 Khởi tạo dữ liệu cho công ty mới
Menu **Quản trị hệ thống → Khởi tạo công ty mới**. Tạo bộ Google Sheets **mới, trống** rồi chuyển sang dùng; dữ liệu cũ **không bị xóa** và quay lại được. Giữ: người dùng và quyền, danh mục (trừ tài khoản quỹ), bản sao lưu, cấu hình chung. Bắt đầu lại: đối tác, đơn hàng, chứng từ, phiếu, tài khoản quỹ, số dư đầu kỳ, tỷ giá, số chứng từ. Hai người: người thứ nhất nhập tên/MST/ngày đầu sổ/lý do và gõ **KHOI TAO MOI**; Kế toán trưởng/Người duyệt khác xác nhận (tự sao lưu trước, lỗi thì tự quay lại). Quay lại bộ cũ ở cùng màn. Nhật ký hệ thống dùng chung.

### 21.6 Phân bổ theo chứng từ, số lượng × đơn giá, nhập số, lọc nhiều đơn
- **Phân bổ thu/chi theo chứng từ:** tích chọn chứng từ (tự điền số còn nợ, sửa được để phân bổ một phần); chỉ nút **"Tự động theo thứ tự thời gian (FIFO)"** mới phân bổ lần lượt từ chứng từ cũ nhất.
- **SL × đơn giá = thành tiền** (thay "SL container"): SL tối đa 3 số lẻ, đơn giá tối đa 4 số lẻ; có cả hai thì thành tiền tự tính và khóa; có SL không đơn giá thì gõ thành tiền (đơn giá gợi ý = thành tiền ÷ SL). Mẫu nhập hàng loạt có cột Đơn giá: để trống Số tiền khi đã có SL + đơn giá thì tự tính.
- **Nhập số:** tự thêm dấu chấm phân cách hàng nghìn khi gõ; dấu thập phân là dấu phẩy.
- **Lọc nhiều đơn hàng:** danh sách Đơn hàng có mục lọc "Đơn hàng / PO (chọn nhiều)".

### 21.7 Chọn hóa đơn thanh toán ngay trên phiếu thu/chi
Ở form phiếu thu/chi có khối **Chọn hóa đơn thanh toán**: liệt kê chứng từ còn nợ của đối tác (theo chiều và tiền tệ), tích chọn (tự điền số còn nợ, sửa được) hoặc bấm "Tự động theo thứ tự thời gian (FIFO)". Lưu cùng phiếu; khi phiếu được ghi nhận, hệ thống tự phân bổ theo lựa chọn. Chứng từ hết nợ lúc ghi nhận thì phiếu vẫn ghi nhận và báo lý do, phân bổ tay sau.
