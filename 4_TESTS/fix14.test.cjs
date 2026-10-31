// Hồi quy 6 lỗi định dạng số / tỷ giá / nhập XML (báo cáo kiểm tra 29/10/2026). Mỗi ca đưa đầu vào xấu và khẳng định kết quả đúng; chạy với bản mã cũ phải báo lỗi.
// Dữ liệu giả (vm Node), KHÔNG phải Google thật. Chạy với bản khác: BACKEND_SRC=<Backend.gs> GATEWAY_SRC=<index.html> node 4_TESTS/fix14.test.cjs
const vm = require('vm'), fs = require('fs'), path = require('path'), assert = require('assert');
const BE = fs.readFileSync(process.env.BACKEND_SRC || path.join(__dirname, '..', '1_BACKEND', 'Backend.gs'), 'utf8');
const GW = fs.readFileSync(process.env.GATEWAY_SRC || path.join(__dirname, '..', '2_GATEWAY', 'index.html'), 'utf8');
const EI = fs.readFileSync(process.env.EINVOICE_SRC || path.join(__dirname, '..', '6_NGUON', 'einvoice-xml.js'), 'utf8');
const FMT = fs.readFileSync(path.join(__dirname, '..', '6_NGUON', 'hak-format.js'), 'utf8');
let steps = 0;
const ok = (c, m) => { steps++; assert.ok(c, m); }, eq = (a, b, m) => { steps++; assert.deepStrictEqual(a, b, m); };
function suite(n, f) { try { f(); console.log('✔', n); } catch (e) { console.log('✖', n, '-', String(e.message).split('\n')[0]); process.exitCode = 1; } }
const slice = (src, from, to) => { const a = src.indexOf(from), b = src.indexOf(to, a + 1); assert.ok(a >= 0 && b > a, 'không tìm thấy đoạn ' + from); return src.slice(a, b); };

// ---- Giao diện: nạp đúng các hàm từ index.html đã triển khai ----
const cur = [{ code: 'VND', decimals: 0 }, { code: 'USD', decimals: 2 }, { code: 'KWD', decimals: 3 }];
const ui = vm.createContext({ S: { boot: { catalogs: { currencies: cur } } }, console: { warn() { }, log() { } }, window: { console: { warn() { } } } });
vm.runInContext(FMT + ';this.HAKFormat=HAKFormat;', ui);
const tryLoad = (label, f) => { try { f(); } catch (e) { console.log('  (không nạp được ' + label + ' — bản mã chưa có)'); } };
tryLoad('hàm tiền/phần trăm', () => vm.runInContext(slice(GW, 'function curInfo(c)', 'function fxText(e4)'), ui));
tryLoad('parseRate', () => vm.runInContext(slice(GW, 'function parseRate(s) {', 'function fxSrcName(x)'), ui));
tryLoad('rateProblem', () => vm.runInContext(slice(GW, 'function rateProblem(s) {', 'function parseRate(s) {'), ui));
tryLoad('fmtTime', () => vm.runInContext(slice(GW, 'function fmtTime(iso)', 'function todayIso()'), ui));
const ei = vm.createContext({ console }); vm.runInContext(EI + ';this.E=EInvoiceXml', ei);

// ---- Backend: nạp Backend.gs với bảng tỷ giá giả ----
function world(history) {
  const T = { FxRate: history || [] }, spy = { stored: [], ran: 0 };
  const c = vm.createContext({ console: { log() { }, warn() { }, error() { } }, Logger: { log() { } }, Utilities: { getUuid: () => 'u' + Math.random() }, LockService: {}, CacheService: { getScriptCache: () => ({ get: () => null, put() { }, getAll: () => ({}), putAll() { } }) }, PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) } });
  vm.runInContext(BE, c);
  c.repoValid_ = t => (T[t] || []).filter(x => x.isDeleted !== 1);
  c.fxStore_ = (u, cu, d, e4, s, n) => { spy.stored.push([cu, d, e4, s]); return { id: 'x' }; };
  c.requirePerm_ = () => { }; c.currencyMap_ = () => ({ USD: { decimals: 2 }, JPY: { decimals: 0 } }); c.todayVn_ = () => '2026-10-29';
  c.runTx_ = (u, m, b) => { spy.ran++; return {}; };
  return { c, spy };
}
const row = (d, cu, r, id) => ({ id: id || 'f' + d + cu, rateDate: d, currency: cu, rateE4: Math.round(r * 10000), source: 'MANUAL', version: 1, isDeleted: 0 });
const U = { id: 'u1', email: 'a@x.vn', role: 'APPROVER', scope: { allPartners: true } };
const code = f => { try { f(); return 'OK'; } catch (e) { return (e.fields && e.fields[0] && e.fields[0].code) || e.code || e.message; } };

suite('1a. Ô tỷ giá: kiểu Mỹ "25,438.5" không còn bị đọc thành 25,4385; kiểu Việt Nam giữ nguyên', () => {
  const P = ui.parseRate;
  for (const [s, w] of [['25.438,5', '25438.5'], ['25,438.5', '25438.5'], ['25438.5', '25438.5'], ['25.438', '25438'], ['170,123', '170.123'], ['170,12', '170.12'], ['1,234,567', '1234567'], ['1.234.567,25', '1234567.25'], ['0,0001', '0.0001'], ['  25 438,5 ', '25438.5'], ['', '']])
    eq(P(s), w, 'parseRate(' + JSON.stringify(s) + ')');
  for (const s of ['abc', '1.2.3', '1,2,3', '100000000000', '25,438.5.1', '--5']) eq(P(s), 'x', 'phải từ chối ' + s);
  eq(ui.rateProblem('abc').length > 0, true); eq(ui.rateProblem('25,438.5'), ''); eq(ui.rateProblem(''), '');
  // tỷ giá đang hiển thị (fxText_) nạp lại vào ô phải đọc ra đúng giá trị cũ
  const w = world(); for (const e4 of [254385000, 253000000, 1705000, 1700000, 254385001, 10000, 12345]) { const shown = w.c.fxText_(e4); eq(w.c.fxE4_(P(shown)), e4, 'vòng lặp hiển thị→nhập ' + shown); }
});
suite('1b. Máy chủ: tỷ giá nhập tay ngoài khoảng hợp lý bị chặn; lệch >30% so với tỷ giá gần nhất phải xác nhận', () => {
  const w = world([row('2026-10-20', 'USD', 25438.5), row('2026-10-25', 'USD', 25500), row('2026-10-28', 'JPY', 170.12)]), R = (cu, d, v, conf) => () => w.c.fxResolve_(U, cu, d, v, conf);
  eq(code(R('USD', '2026-10-26', '25.4385')), 'FX_IMPLAUSIBLE', '1000 lần nhỏ hơn');
  eq(code(R('USD', '2026-10-26', '25.4385', true)), 'OK', 'xác nhận thì cho qua (nếu trong giới hạn tuyệt đối)');
  eq(code(R('USD', '2026-10-26', '25.5')), 'FX_IMPLAUSIBLE'); eq(code(R('USD', '2026-10-26', '35000')), 'FX_IMPLAUSIBLE', '+37%');
  eq(code(R('USD', '2026-10-26', '19000')), 'OK', '-25% trong ngưỡng'); eq(code(R('USD', '2026-10-26', '30000')), 'OK', '+17.6% trong ngưỡng');
  eq(code(R('USD', '2026-10-26', '25438.5')), 'OK'); eq(code(R('JPY', '2026-10-29', '170123')), 'FX_IMPLAUSIBLE', 'JPY gõ nhầm dấu: 170123');
  eq(code(R('JPY', '2026-10-29', '170,12'.replace(',', '.'))), 'OK');
  eq(code(R('USD', '2026-10-26', '0.01', true)), 'FX_OUT_OF_RANGE', 'dưới 0,1 không cho dù có xác nhận'); eq(code(R('USD', '2026-10-26', '60000000', true)), 'FX_OUT_OF_RANGE', 'trên 50 triệu không cho dù có xác nhận');
  eq(code(R('USD', '2026-10-26', '0')), 'FX_INVALID'); eq(code(R('USD', '2026-10-26', 'abc')), 'FX_INVALID');
  // dùng tỷ giá gần nhất TRƯỚC hoặc đúng ngày; không có thì lấy mốc mới nhất bất kỳ
  eq(code(R('USD', '2026-10-21', '25500')), 'OK'); eq(code(R('USD', '2026-10-01', '25500')), 'OK', 'trước mọi mốc: so với mốc mới nhất');
  eq(code(R('USD', '2026-10-01', '300')), 'FX_IMPLAUSIBLE');
  // bị chặn thì KHÔNG ghi vào bảng tỷ giá của ngày
  w.spy.stored.length = 0; code(R('USD', '2026-10-27', '25.4385')); eq(w.spy.stored.length, 0, 'không ghi tỷ giá sai vào bảng ngày');
  code(R('USD', '2026-10-27', '25500')); eq(w.spy.stored.length, 1, 'tỷ giá hợp lý vẫn được ghi cho ngày chưa có');
  // chưa có lịch sử: chỉ áp giới hạn tuyệt đối
  const w2 = world([]); eq(code(() => w2.c.fxResolve_(U, 'USD', '2026-10-26', '25438.5')), 'OK'); eq(code(() => w2.c.fxResolve_(U, 'USD', '2026-10-26', '0.0001')), 'FX_OUT_OF_RANGE');
});
suite('1c. Menu Tỷ giá (fx.save) và phiếu/chứng từ dùng cùng kiểm tra; không ghi gì khi bị chặn', () => {
  const w = world([row('2026-10-20', 'USD', 25438.5)]), S = (p) => () => w.c.fxSave_(U, { requestId: 'r', payload: Object.assign({ currency: 'USD', rateDate: '2026-10-25', rate: '25438.5' }, p) });
  eq(code(S({ rate: '25.4385' })), 'FX_IMPLAUSIBLE'); eq(w.spy.ran, 0, 'bị chặn trước khi mở giao dịch');
  eq(code(S({ rate: '25.4385', fxConfirm: true })), 'OK'); eq(w.spy.ran, 1);
  eq(code(S({ buy: '2.5', sell: '25500' })), 'FX_IMPLAUSIBLE', 'tỷ giá mua cũng được kiểm'); eq(code(S({ rate: '0.01', fxConfirm: true })), 'FX_OUT_OF_RANGE');
  ok(/fxResolve_\(user, fxCur, fxDate, p\.fxRate, p\.fxConfirm\)/.test(BE), 'docSave truyền fxConfirm'); ok(/fxResolve_\(user, p\.currency, p\.effectiveDate, p\.fxRate, p\.fxConfirm\)/.test(BE), 'paymentSave truyền fxConfirm');
  ok(/apiFx\('doc\.save'/.test(GW) && /apiFx\('payment\.save'/.test(GW) && /apiFx\('fx\.save'/.test(GW), 'giao diện gửi qua apiFx (hỏi xác nhận rồi gửi lại)');
});
suite('2a. Nhập XML: số tiền làm tròn nửa lên trên chuỗi thập phân, không nhân số thực', () => {
  const M = ei.E.toMinor;
  for (const [v, d, w] of [[1.005, 2, 101], [0.285, 2, 29], [1.255, 2, 126], [2.675, 2, 268], [1234.565, 2, 123457], [1234567.5, 0, 1234568], [-1234567.5, 0, -1234568], [12.3456, 3, 12346], [0.1 + 0.2, 2, 30], [8.07, 2, 807], [1.15, 1, 12], [5, 0, 5], [-0.005, 2, -1], [0, 2, 0]])
    eq(M(v, d), w, 'toMinor(' + v + ',' + d + ')');
  eq(M(null, 2), null); eq(M(NaN, 2), null); eq(M(1e21, 0), null, 'quá 2^53'); eq(M(1.5e-7, 2), 0); eq(M('1.005', 2), null, 'chỉ nhận số');
  const T = ei.E.moneyText;
  eq([T(1.005, 'USD'), T(0.285, 'USD'), T(12.3456, 'KWD', 3), T(5, 'VND'), T(-0.5, 'USD'), T(1234567.5, 'VND'), T(null, 'USD'), T(1.005, 'USD', 3), T(7, 'USD', 0)], ['1.01', '0.29', '12.346', '5', '-0.50', '1234568', '', '1.005', '7']);
  // ngẫu nhiên: so với phép làm tròn nửa lên bằng BigInt trên chuỗi thập phân
  let bad = 0; for (let i = 0; i < 30000; i++) {
    const d = i % 4, intLen = 1 + (i % 9), fracLen = (i * 7) % 6, ip = String(Math.floor(Math.random() * Math.pow(10, intLen))), fp = Array.from({ length: fracLen }, () => Math.floor(Math.random() * 10)).join(''), s = fp ? ip + '.' + fp : ip, v = Number(s);
    if (!Number.isFinite(v) || (ip + fp).length > 15) continue;
    const kept = fp.slice(0, d).padEnd(d, '0'), want = Number(BigInt(ip + kept) + (fp.charAt(d) >= '5' ? 1n : 0n));
    if (M(v, d) !== want) { bad++; if (bad < 4) console.log('lệch', s, d, M(v, d), want); }
  }
  eq(bad, 0, 'toMinor khớp phép làm tròn chính xác');
  // cũ: Math.round(v * 100) sai ở các giá trị này (chứng minh ca thử có tác dụng)
  ok(Math.round(1.005 * 100) !== 101 && Math.round(0.285 * 100) !== 29 && Math.round(1.255 * 100) !== 126, 'phép nhân số thực quả thực sai');
  ok(!/Math\.round\(l\.net \* dec\)/.test(GW) && !/Math\.round\(inv\.totals\.gross \* dec\)/.test(GW), 'index.html không còn nhân số thực'); ok(/EInvoiceXml\.toMinor\(l\.net, decs\)/.test(GW) && /decs = curInfo\(cur\)\.decimals/.test(GW), 'số lẻ lấy từ danh mục tiền tệ');
});
suite('3a. Phần trăm theo định dạng Việt Nam (dấu phẩy thập phân), máy chủ và giao diện cho cùng kết quả', () => {
  const w = world();
  for (const [bp, s] of [[800, '8%'], [1000, '10%'], [550, '5,5%'], [0, '0%'], [5, '0,05%'], [10000, '100%'], [1234, '12,34%'], [-250, '-2,5%']]) eq(w.c.fmtBp_(bp), s, 'fmtBp_(' + bp + ')');
  for (const [p, s] of [[12.5, '12,5%'], [33.33, '33,33%'], [8, '8%'], [100, '100%'], [0, '0%'], [-5.25, '-5,25%'], [0.1 + 0.2, '0,3%'], [1000.5, '1.000,5%']]) { eq(w.c.fmtPctNum_(p), s, 'fmtPctNum_(' + p + ')'); eq(ui.fmtPct(p), s, 'fmtPct(' + p + ')'); }
  for (const x of [NaN, null, undefined, 'x', Infinity]) { eq(w.c.fmtPctNum_(x), '—'); eq(ui.fmtPct(x), '—'); } eq(w.c.fmtBp_(1.5), ''); eq(w.c.fmtBp_(NaN), '');
  ok(!/\(l\.vatRateBp \/ 100\) \+ '%'/.test(BE) && !/\(rate \/ 100\) \+ '%'/.test(BE) && !/\(k \/ 100\) \+ '%'/.test(BE), 'báo cáo VAT không còn nối số thực + "%"'); ok(!/Math\.round\(\(e\.rev - e\.cost\) \* 10000 \/ e\.rev\) \/ 100 \+ '%'/.test(BE));
  ok(!/marginPct \+ '%'/.test(GW) && /fmtPct\(t\.marginPct\)/.test(GW) && /fmtPct\(bt\.marginPct\)/.test(GW) && /fmtPct\(Math\.round\(tot \* 100\) \/ 100\)/.test(GW), 'giao diện dùng fmtPct');
});
suite('4. fmtMoney không ném lỗi làm hỏng cả màn hình', () => {
  const F = ui.fmtMoney;
  for (const [m, c, w] of [[NaN, 'VND', '—'], [1.5, 'VND', '—'], [9007199254740992, 'VND', '—'], [Infinity, 'USD', '—'], [-Infinity, 'USD', '—'], [null, 'VND', '—'], [undefined, 'VND', '—'], ['', 'VND', '—'], ['12', 'VND', '12'], [0, 'VND', '0'], [123456789, 'USD', '1.234.567,89'], [-5, 'USD', '-0,05'], [12346, 'KWD', '12,346'], [9007199254740991, 'VND', '9.007.199.254.740.991']])
    eq(F(m, c), w, 'fmtMoney(' + m + ',' + c + ')');
  // vòng lặp định dạng→đọc lại không lệch (ngẫu nhiên)
  let bad = 0; for (let i = 0; i < 40000; i++) { const c = ['VND', 'USD', 'KWD'][i % 3], m = (Math.random() < .3 ? -1 : 1) * Math.floor(Math.random() * Math.pow(10, 1 + (i % 14))), back = ui.parseMoney(F(m, c), c); if (!Object.is(back, m) && !(back === 0 && m === 0)) { bad++; if (bad < 4) console.log('lệch', c, m, F(m, c), back); } }
  eq(bad, 0);
});
suite('5. Giờ hiển thị luôn theo Asia/Ho_Chi_Minh, không theo máy người dùng', () => {
  const t = ui.fmtTime('2026-10-25T17:30:00Z');
  ok(/00:30:00/.test(t) && /26\/10\/2026/.test(t), 'UTC 17:30 = 00:30 ngày 26/10 giờ Việt Nam: ' + t); eq(ui.fmtTime(''), '—'); eq(ui.fmtTime('không phải ngày'), 'không phải ngày');
  ok(!/new Date\([^)]*\)\.toLocaleString\('vi-VN'\)/.test(GW), 'không còn toLocaleString không múi giờ'); ok((GW.match(/fmtTime\(it\.updatedAt\)/g) || []).length === 1 && (GW.match(/fmtTime\(x\.updatedAt\)/g) || []).length === 1);
});
suite('6. Không còn hàm rcMinor_ cấp cao nhất (mã chết, làm tròn số thực chỉ cho USD)', () => {
  ok(!/^function rcMinor_/m.test(BE), 'bản cấp cao nhất đã xóa'); eq((BE.match(/function rcMinor_/g) || []).length, 1, 'chỉ còn bản trong reconParseWorkbook (theo số lẻ danh mục)');
  ok(/function rcMinor_\(v, cur\) \{ var m = DEC\[cur\]/.test(BE));
  const names = {}; (BE.match(/^function [A-Za-z0-9_]+/gm) || []).forEach(n => { names[n] = (names[n] || 0) + 1; }); eq(Object.keys(names).filter(n => names[n] > 1), [], 'không có hàm cấp cao nhất trùng tên');
});
console.log('Tổng', steps, 'khẳng định');
