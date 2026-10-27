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
        return { ok: false, error: { code: 'SERVER_BUSY', message: 'Không kết nối được máy chủ dữ liệu.', retryable: true } };
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
