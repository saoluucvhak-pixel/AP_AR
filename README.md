# KATY AP/AR — công nợ phải thu / phải trả (Google Apps Script)

Ứng dụng web chạy trên Google Apps Script + Google Sheets: công nợ phải thu/phải trả, đơn hàng/PO, chi phí, thu hộ/chi hộ, ngoại tệ (bình quân gia quyền di động), sổ quỹ tiền mặt/ngân hàng, nhập sao kê hàng loạt.

Phiên bản: **R3.5**. Mọi kiểm thử chạy bằng Node với Sheet giả và Chromium (Playwright); **chưa chạy trên Google Apps Script thật, chưa chạy trên Windows**.

## Cấu trúc
| Thư mục / tệp | Nội dung |
|---|---|
| `1_BACKEND/Backend.gs` | Mã Backend để dán vào dự án Apps Script (Backend) |
| `2_GATEWAY/` | `Gateway.gs`, `index.html`, `luong-nghiep-vu.html` (dự án Gateway) |
| `AN_TOAN_KHI_DAN/` | Bản đã bỏ chú thích, dùng khi trình soạn thảo báo lỗi dán |
| `6_NGUON/` | **Mã nguồn gốc** + `build.py` (dựng ra các tệp trên) |
| `3_TAI_LIEU/` | Hướng dẫn sử dụng, mẫu nhập hàng loạt, `SHA256.txt` |
| `4_TESTS/`, `5_UI_TESTS/` | Test Node và test giao diện |
| `HUONG_DAN_TRIEN_KHAI_R35.md` | Triển khai trên bản sao (staging), sao lưu, quay lui |
| `BAO_CAO_QUYET_DINH_R35.md`, `KET_QUA_TEST_R35.md` | Quyết định chính sách và kết quả kiểm thử |

## Chạy test
```
node 4_TESTS/run-all.cjs
BACKEND_SRC=$PWD/AN_TOAN_KHI_DAN/Backend.gs node 4_TESTS/run-all.cjs
node 5_UI_TESTS/ui.e2e.cjs        # cần Node >= 18, playwright + chromium, python3 + openpyxl
```

## Bảo mật
Repo **không chứa** `HMAC_SECRET` hay ID Google Sheets. Đặt chúng trong *Script Properties* của từng dự án Apps Script (cùng một `HMAC_SECRET` ở cả Backend và Gateway). **Không** commit khóa vào repo.
