# Kết quả kiểm thử — R3.5 (áp dụng quyết định chính sách 26/10/2026)

Môi trường: Linux x64, Node v22.22.0, Playwright 1.63.0, Chromium 153. **Sheet/Cache/Lock giả — không phải Google Apps Script thật, không phải Windows.** PASSED / FAILED / BLOCKED như KET_QUA_TEST_R34.md.

| Lượt chạy | Kết quả |
|---|---|
| `node 4_TESTS/run-all.cjs` (bản thường) | **PASSED** 64/64 tệp |
| `BACKEND_SRC=…/AN_TOAN_KHI_DAN/Backend.gs node 4_TESTS/run-all.cjs` | **PASSED** 64/64 tệp |
| `5_UI_TESTS/ui.e2e.cjs` bản thường | **PASSED** 31/31 nhóm, 294 khẳng định |
| `ui.e2e.cjs` bản an toàn (`BACKEND_SRC` + `UI_HTML`) | **PASSED** 31/31 nhóm, 294 khẳng định |
| `autosave.regression.cjs` | **PASSED** |
| `download.selftest.cjs` | **PASSED** (16 khẳng định) |
| `download.probe.cjs` | **PASSED** |
| Tải/xuất Excel trên Windows + Excel thật | **BLOCKED** (chưa có môi trường) |
| `r35-policy.test.cjs` (47 khẳng định, 11 nhóm, gồm nhóm 9: đảo làm âm quỹ tiền mặt) | **PASSED** trên R3.5; trên R3.3: nhóm 1B-a/b/c/d, 3B, 5B, 6A, 7B, 9, 8A **FAILED** (đúng chủ đích), 2B PASSED (đã đúng sẵn) |
| `r34-migration.test.cjs` (95; 97 khi có `BACKEND_OLD`) | **PASSED**, gồm M7 (PassLink cũ → thêm 3 cột) và M5 (Backend R3.3 vẫn đọc DB đã nâng) |

Test cũ phải đổi vì quy tắc đổi (không nới điều kiện, chỉ đổi kỳ vọng theo quyết định): `fx-pool.test.cjs` nhóm 5 (kỳ khóa → từ chối cả lượt, kiểm dữ liệu không đổi) và nhóm 18 (thừa kiểm kê theo bình quân, không cần tỷ giá ngày); `schema.test.cjs` (`SCHEMA_VERSION` 2.5).

Chưa kiểm: Google Apps Script thật · Windows · Excel · đồng thời nhiều người · hiệu năng thật (xem `BAO_CAO_HIEU_SUAT_R34.md`, không đổi).
