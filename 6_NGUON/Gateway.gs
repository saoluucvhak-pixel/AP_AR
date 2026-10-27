var ACTION_RE_ = /^[a-z]+\.[A-Za-z]+$/;
function doGet() {
    var t = HtmlService.createTemplateFromFile('index');
    t.userEmail = Session.getActiveUser().getEmail() || '';
    return t.evaluate().setTitle('KATY AP/AR').addMetaTag('viewport', 'width=device-width, initial-scale=1').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}
function include_(name) { return HtmlService.createHtmlOutputFromFile(name).getContent(); }
function rpc(envelope) {
    var email = String(Session.getActiveUser().getEmail() || '').trim().toLowerCase();
    if (!email)
        return { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Không xác minh được tài khoản Google. Hãy đăng nhập Google và cấp quyền cho ứng dụng.' } };
    if (!envelope || typeof envelope.action !== 'string' || !ACTION_RE_.test(envelope.action) && envelope.action !== 'sys.batch')
        return { ok: false, error: { code: 'NOT_FOUND', message: 'Yêu cầu không hợp lệ.' } };
    var props = PropertiesService.getScriptProperties().getProperties(), url = props.BACKEND_URL, secret = props.HMAC_SECRET;
    if (!url || !secret)
        return { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Gateway chưa được cấu hình.' } };
    var payloadJson = JSON.stringify({ requestId: String(envelope.requestId || Utilities.getUuid()).slice(0, 100), payload: envelope.payload === undefined ? {} : envelope.payload });
    if (payloadJson.length > 3000000)
        return { ok: false, error: { code: 'VALIDATION_FAILED', message: 'Dữ liệu gửi quá lớn.' } };
    var ts = String(Date.now()), nonce = Utilities.getUuid();
    var body = { email: email, action: envelope.action, payloadJson: payloadJson, ts: ts, nonce: nonce, sig: signature_(secret, ts, nonce, email, envelope.action, payloadJson) };
    var t0 = Date.now(), resp;
    try {
        resp = UrlFetchApp.fetch(url, { method: 'post', contentType: 'application/json', payload: JSON.stringify(body), muteHttpExceptions: true, followRedirects: true });
    }
    catch (e) {
        // Nêu nguyên nhân thường gặp (không in địa chỉ/khóa); chi tiết đầy đủ: chạy diagBackend() trong trình soạn thảo Gateway.
        var why = fetchFailHint_(e);
        return { ok: false, error: { code: 'SERVER_BUSY', message: 'Không kết nối được máy chủ dữ liệu.' + (why ? ' ' + why : ''), retryable: true } };
    }
    var out;
    try {
        out = JSON.parse(resp.getContentText());
    }
    catch (e) {
        out = { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Phản hồi máy chủ không hợp lệ (' + resp.getResponseCode() + ').', retryable: true } };
    }
    out.gatewayMs = Date.now() - t0;
    return out;
}
function sha256Hex_(s) {
    return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8).map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
function signature_(secret, ts, nonce, email, action, payloadJson) {
    return Utilities.base64Encode(Utilities.computeHmacSha256Signature([ts, nonce, email, action, sha256Hex_(payloadJson)].join('.'), secret));
}
function flowDoc() {
    if (!String(Session.getActiveUser().getEmail() || '').trim())
        throw new Error('UNAUTHENTICATED');
    var who = rpc({ action: 'app.whoami', payload: {}, requestId: Utilities.getUuid() });
    if (!who || !who.ok)
        throw new Error('FORBIDDEN');
    return HtmlService.createHtmlOutputFromFile('luong-nghiep-vu').getContent();
}

function fetchFailHint_(e) {
    var m = String(e && e.message || e);
    if (/permission|authori[sz]|scope|external_request/i.test(m))
        return 'Gateway chưa được cấp quyền gọi URL bên ngoài (UrlFetchApp): mở trình soạn thảo Gateway, chạy diagBackend() và bấm Cho phép.';
    if (/invalid argument|invalid url|malformed|not a valid/i.test(m))
        return 'BACKEND_URL (Script Properties của Gateway) không hợp lệ: phải là địa chỉ triển khai Backend kết thúc bằng /exec.';
    if (/DNS|timed out|timeout|unavailable|Address unavailable/i.test(m))
        return 'Máy chủ Backend chưa phản hồi (hết thời gian/không truy cập được). Thử lại sau ít phút.';
    return 'Chạy diagBackend() trong trình soạn thảo Gateway để xem nguyên nhân.';
}
// Chạy tay trong trình soạn thảo Gateway (xem Nhật ký thực thi): kiểm tra cấu hình và gọi thử Backend. KHÔNG in HMAC_SECRET và không in toàn bộ địa chỉ.
function diagBackend() {
    var p = PropertiesService.getScriptProperties(), url = String(p.getProperty('BACKEND_URL') || ''), out = [];
    out.push('HMAC_SECRET: ' + (p.getProperty('HMAC_SECRET') ? 'đã đặt' : 'CHƯA ĐẶT (cần cùng giá trị với Backend)'));
    out.push('BACKEND_URL: ' + (url ? 'đã đặt (' + url.length + ' ký tự; bắt đầu "' + url.slice(0, 32) + '…", kết thúc "' + url.slice(-6) + '")' : 'CHƯA ĐẶT'));
    if (url) {
        if (url !== url.trim())
            out.push('CẢNH BÁO: BACKEND_URL có khoảng trắng đầu/cuối.');
        if (!/^https:\/\/script\.google\.com\/macros\/s\/[^\/]+\/exec$/.test(url.trim()))
            out.push('CẢNH BÁO: BACKEND_URL không đúng dạng https://script.google.com/macros/s/<ID>/exec (không dùng địa chỉ /dev, không dùng địa chỉ của Gateway).');
        try {
            var r = UrlFetchApp.fetch(url.trim(), { method: 'get', muteHttpExceptions: true, followRedirects: true }), body = r.getContentText();
            out.push('Gọi thử Backend: HTTP ' + r.getResponseCode() + (/accounts\.google\.com|ServiceLogin|Sign in/i.test(body) ? ' — Backend yêu cầu đăng nhập Google: triển khai Backend với "Ai có quyền truy cập: Bất kỳ ai" (Anyone), chạy bằng tài khoản của bạn.' : ' — ' + body.slice(0, 120).replace(/\s+/g, ' ')));
        }
        catch (e) {
            out.push('LỖI khi gọi Backend: ' + String(e && e.message || e).replace(/https?:\/\/\S+/g, '<url>').slice(0, 300));
        }
    }
    Logger.log(out.join('\n'));
    return out;
}
