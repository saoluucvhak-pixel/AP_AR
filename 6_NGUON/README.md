# Nguồn và cách dựng lại
- `index.template.html` + `filter-core.js` (nguyên văn HAK_SMART_FILTER, commit 51816814f1224e8d0f666dc9a3cc1c66ca440b83) + `filter-fields.js` + `filter-ui.js` + `master-detail.js` + `filter.css` → `index.html`.
- `Backend.gs`, `Gateway.gs`, `luong-nghiep-vu.html`: nguồn nguyên khối (Backend chưa tách nhỏ hơn).
- Dựng: `python3 6_NGUON/build.py` (cần node; bước bỏ chú thích dùng espree, đặt NODE_PATH nếu thiếu). Kết quả: `dist/` (đầy đủ) và `dist-safe/` (không còn chú thích `//` và `/* */`, dùng khi dán vào trình soạn thảo Apps Script).
- Thư mục `AN_TOAN_KHI_DAN/` của gói là bản `dist-safe` đã dựng sẵn; đã chạy lại các test Backend và test giao diện trên bản này.
