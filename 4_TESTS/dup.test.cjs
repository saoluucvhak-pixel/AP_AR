// Chống trùng số liệu khi nhập khoản phát sinh (nhập hàng loạt PO/doanh thu/chi phí và lưu tay) + dùng lại sổ trong lượt dựng bảng tổng hợp.
// Mỗi ca đưa dữ liệu trùng/gần trùng và khẳng định phát hiện đúng, không ghi khi chưa xác nhận. Dữ liệu giả (vm Node), KHÔNG phải Google thật.
// Chạy bản cũ để chứng minh test bắt được lỗi: BACKEND_SRC=<Backend.gs cũ> node 4_TESTS/dup.test.cjs
const vm = require('vm'), fs = require('fs'), path = require('path'), assert = require('assert');
const SRCP = process.env.BACKEND_SRC || path.join(__dirname, '..', '1_BACKEND', 'Backend.gs'), SRC = fs.readFileSync(SRCP, 'utf8');
let steps = 0; const eq = (a, b, m) => { steps++; assert.strictEqual(JSON.stringify(a), JSON.stringify(b), m); }, ok = (c, m) => { steps++; assert.ok(c, m); };
function suite(n, f) { try { f(); console.log('✔', n); } catch (e) { console.log('✖', n, '-', String(e.message).split('\n').slice(0, 4).join(' | ').slice(0, 700)); process.exitCode = 1; } }
const code = f => { try { f(); return 'OK'; } catch (e) { return e.code || e.message; } };
function world() {
  const ctx = vm.createContext({ console, Logger: { log() { } }, Utilities: { getUuid: () => 'u' + Math.random(), formatDate: () => '2026-10-25' }, LockService: {}, CacheService: { getScriptCache: () => ({ get: () => null, put() { } }) }, PropertiesService: { getScriptProperties: () => ({ getProperty: () => null }) } });
  vm.runInContext(SRC, ctx);
  const cat = (id, type, c, act) => ({ id, catalogType: type, code: c, name: c, attrsJson: '{}', active: act === undefined ? 1 : act, sortOrder: 1, version: 1 });
  const T = { Catalog: [{ id: 'c1', catalogType: 'CURRENCY', code: 'VND', attrsJson: '{"decimals":0}', active: 1 }, cat('c2', 'BUSINESS_GROUP', 'G1'), cat('s1', 'SERVICE_CODE', 'FWD'), cat('s2', 'SERVICE_CODE', 'CBT'), cat('f', 'FEE_TYPE', 'F'), cat('f2', 'FEE_TYPE', 'F2')],
    Partner: [{ id: 'p1', shortName: 'ABC', legalName: 'A', isCustomer: 1, isSupplier: 0, status: 'ACTIVE', scopeTags: '', taxCode: '' }, { id: 'p9', shortName: 'NCC', legalName: 'N', isCustomer: 0, isSupplier: 1, status: 'ACTIVE', scopeTags: '', taxCode: '' }],
    Order: [], Accrual: [], AccrualSplit: [], DebtDoc: [], DebtLine: [], Period: [], Config: [{ id: 'ledgerStartDate', value: '2026-01-01' }] };
  ctx.repoValid_ = t => (T[t] || []).slice(); ctx.repoFind_ = (t, id) => (T[t] || []).find(x => x.id === id) || null; const seq = {}, cnt = { n: 0 };
  ctx.runTx_ = (user, meta, build) => { const ins = [], upd = []; // ghi gom lại, chỉ áp dụng khi hàm xây dựng không ném lỗi (đúng ngữ nghĩa thật)
    const tx = { user, now: 'T', find: (t, id) => (T[t] || []).find(x => x.id === id) || null, rows: t => (T[t] || []).slice(), insert: (t, o) => { const r = Object.assign({ id: t + '_' + (++cnt.n), version: 1 }, o); ins.push([t, r]); return r; },
      update: (t, id, p) => { upd.push([t, id, p]); return Object.assign({}, (T[t] || []).find(x => x.id === id), p); }, nextSeq: k => (seq[k] = (seq[k] || 0) + 1) };
    const built = build(tx); ins.forEach(([t, r]) => (T[t] = T[t] || []).push(r)); upd.forEach(([t, id, p]) => { const r = (T[t] || []).find(x => x.id === id) || ins.map(x => x[1]).find(x => x.id === id); if (r) Object.assign(r, p); }); return built && built.result; };
  return { ctx, T };
}
const AP = { id: 'a', email: 'a@x.vn', role: 'APPROVER', scope: { allPartners: true } };
const rev = (po, sc, net, o) => Object.assign({ customer: 'ABC', poNo: po, date: '2026-10-11', group: 'G1', currency: 'VND', serviceCode: sc || 'FWD', feeType: 'F', description: 'Cước vận chuyển', netText: String(net || 1000), vat: 'KCT' }, o || {});
const prev = (w, kind, rows) => w.ctx.orderBulkPreview_(AP, { payload: { kind, rows } });
const commit = (w, kind, rows, ack) => () => w.ctx.orderBulkCommit_(AP, { requestId: 'r' + Math.random(), payload: { kind, rows, acknowledgeDuplicates: ack } });

suite('1. Nhập lại cùng tệp PO/doanh thu: xem trước báo trùng, ghi không xác nhận bị chặn và KHÔNG ghi gì', () => {
  const w = world(), rows = [rev('PB1', 'FWD'), rev('PB2', 'CBT', 2000)];
  eq(code(commit(w, 'REVENUE', rows)), 'OK'); eq([w.T.Order.length, w.T.Accrual.length], [2, 2]);
  const p2 = prev(w, 'REVENUE', rows); eq([p2.errors, p2.duplicates.existing, p2.duplicates.inBatch, p2.canCommit], [0, 2, 0, true]); eq(p2.rows.map(r => r.dup), ['EXISTING', 'EXISTING']);
  const n = [w.T.Order.length, w.T.Accrual.length];
  eq(code(commit(w, 'REVENUE', rows)), 'DUPLICATE_SUSPECTED', 'không xác nhận thì từ chối'); eq([w.T.Order.length, w.T.Accrual.length], n, 'không ghi gì (hoàn tác)');
  let fields = null; try { commit(w, 'REVENUE', rows)(); } catch (e) { fields = e.fields; } eq(fields.map(f => f.path), ['row1', 'row2']);
  eq(code(commit(w, 'REVENUE', rows, true)), 'OK', 'đã xác nhận thì ghi'); eq(w.T.Accrual.length, 4);
  eq(w.T.Accrual.reduce((s, a) => s + a.netMinor, 0), 6000, 'sau xác nhận số liệu tăng đúng ý người dùng');
});
suite('2. Hai dòng y hệt trong cùng tệp: báo trùng trong tệp (dòng sau); xác nhận mới ghi', () => {
  const w = world(), rows = [rev('PB1', 'FWD'), rev('PB1', 'FWD'), rev('PB1', 'FWD', 1001)], p = prev(w, 'REVENUE', rows);
  eq([p.duplicates.existing, p.duplicates.inBatch], [0, 1]); eq(p.rows.map(r => r.dup), ['', 'IN_BATCH', '']); ok(p.rows[1].issues.some(i => i.code === 'DUPLICATE_IN_BATCH' && i.severity === 'WARNING' && /dòng 1/.test(i.message)));
  eq(code(commit(w, 'REVENUE', rows)), 'DUPLICATE_SUSPECTED'); eq(w.T.Accrual.length, 0); eq(code(commit(w, 'REVENUE', rows, true)), 'OK'); eq(w.T.Accrual.length, 3);
});
suite('3. Khác một trường thì KHÔNG coi là trùng (số tiền, ngày, loại phí, mã dịch vụ, diễn giải, PO, thuế)', () => {
  const w = world(); commit(w, 'REVENUE', [rev('PB1', 'FWD')])(); w.T.Order[0].servicesJson = JSON.stringify([{ code: 'FWD', hsdvNo: 'x' }, { code: 'CBT', hsdvNo: 'y' }]);
  for (const [n, row] of [['số tiền', rev('PB1', 'FWD', 1001)], ['ngày', rev('PB1', 'FWD', 1000, { date: '2026-10-12' })], ['loại phí', rev('PB1', 'FWD', 1000, { feeType: 'F2' })], ['mã dịch vụ', rev('PB1', 'CBT')], ['diễn giải', rev('PB1', 'FWD', 1000, { description: 'Phí khác' })], ['thuế', rev('PB1', 'FWD', 1000, { vat: '8' })]]) {
    const p = prev(w, 'REVENUE', [row]); eq([n, p.errors, p.duplicates.existing], [n, 0, 0]);
  }
  const same = prev(w, 'REVENUE', [rev('PB1', 'FWD', 1000, { description: 'CUOC  VAN chuyen' })]); eq(same.duplicates.existing, 1, 'so khớp không phân biệt hoa/thường, dấu, khoảng trắng');
});
suite('4. Khoản đã HỦY không tính là trùng; khoản loại khác (doanh thu/chi phí) không va nhau', () => {
  const w = world(); commit(w, 'REVENUE', [rev('PB1', 'FWD')])(); w.T.Accrual[0].status = 'CANCELLED'; eq(prev(w, 'REVENUE', [rev('PB1', 'FWD')]).duplicates.existing, 0);
  w.T.Accrual[0].status = 'OPEN'; const o = w.T.Order[0], c = { orderRef: o.orderNo, supplier: 'NCC', poRef: '', date: '2026-10-11', feeType: 'F', description: 'Cước vận chuyển', netText: '1000', vat: 'KCT', currency: 'VND', serviceCode: 'FWD' };
  eq(prev(w, 'COST', [c]).duplicates.existing, 0, 'cùng số tiền nhưng là chi phí');
});
suite('5. Chi phí: nhập lại cùng tệp bị báo trùng; chi phí chung và chia nhiều đơn cũng nhận ra', () => {
  const w = world(); commit(w, 'REVENUE', [rev('PB1', 'FWD'), rev('PB2', 'FWD')])(); const [o1, o2] = w.T.Order;
  const c = (ref, o) => Object.assign({ orderRef: ref, supplier: 'NCC', poRef: '', date: '2026-10-12', feeType: 'F', description: 'Chi phí', netText: '500', vat: 'KCT', currency: 'VND', serviceCode: 'FWD' }, o || {});
  const rows = [c(o1.orderNo), c('chung', { netText: '700' }), c(o1.orderNo + ':60%;' + o2.orderNo + ':40%', { netText: '900' })];
  eq(prev(w, 'COST', rows).errors, 0); eq(code(commit(w, 'COST', rows)), 'OK'); const n = w.T.Accrual.length;
  const p2 = prev(w, 'COST', rows); eq([p2.errors, p2.duplicates.existing], [0, 3], JSON.stringify(p2.rows.map(r => r.issues.map(i => i.code))));
  eq(code(commit(w, 'COST', rows)), 'DUPLICATE_SUSPECTED'); eq(w.T.Accrual.length, n);
  eq(prev(w, 'COST', [c(o2.orderNo + ':40%;' + o1.orderNo + ':60%', { netText: '900' })]).duplicates.existing, 1, 'cùng tập đơn chia (thứ tự khác) vẫn là trùng');
  eq(prev(w, 'COST', [c(o1.orderNo + ':50%;' + o2.orderNo + ':50%', { netText: '900' })]).duplicates.existing, 1, 'cùng tập đơn và cùng tổng, chỉ đổi tỷ lệ: vẫn nghi trùng (cần xác nhận)');
  eq(prev(w, 'COST', [c(o1.orderNo + ':50%;' + o2.orderNo + ':50%', { netText: '901' })]).duplicates.existing, 0, 'khác tổng: không trùng');
});
suite('6. Lưu tay hai khoản y hệt: cảnh báo ACCRUAL_SUSPECT_DUP (không chặn); sửa khoản có sẵn không báo', () => {
  const w = world(); commit(w, 'REVENUE', [rev('PB1', 'FWD', 5)])(); const o = w.T.Order[0];
  const acc = n => ({ orderId: o.id, kind: 'REVENUE', partnerId: 'p1', currency: 'VND', accrualDate: '2026-10-11', feeTypeCode: 'F', description: 'Tay', netMinor: n, vatMode: 'NONE', serviceCode: 'FWD' }), save = p => w.ctx.accrualSave_(AP, { requestId: 'q' + Math.random(), payload: p });
  const r1 = save(acc(777)); eq(r1.warnings.filter(x => x.code === 'ACCRUAL_SUSPECT_DUP').length, 0); const r2 = save(acc(777)); eq(r2.warnings.filter(x => x.code === 'ACCRUAL_SUSPECT_DUP').length, 1); eq(w.T.Accrual.length, 3, 'cảnh báo không chặn');
  eq(save(acc(778)).warnings.filter(x => x.code === 'ACCRUAL_SUSPECT_DUP').length, 0);
  const upd = save(Object.assign(acc(777), { id: r1.id, ifVersion: 1 })); eq(upd.warnings.filter(x => x.code === 'ACCRUAL_SUSPECT_DUP').length, 0, 'sửa khoản có sẵn không tự báo trùng');
});
suite('7. Xem trước không ghi gì; giao diện có ô xác nhận và gửi acknowledgeDuplicates', () => {
  const w = world(), before = JSON.stringify(w.T); prev(w, 'REVENUE', [rev('PB1', 'FWD'), rev('PB1', 'FWD')]); eq(JSON.stringify(w.T), before, 'preview không ghi');
  const GW = fs.readFileSync(process.env.GATEWAY_SRC || path.join(__dirname, '..', '2_GATEWAY', 'index.html'), 'utf8');
  ok(/data-ack-dup/.test(GW) && /acknowledgeDuplicates: dupChk\.checked/.test(GW) && /Trùng khoản đã có/.test(GW), 'giao diện xử lý trùng');
});
suite('8. Dựng bảng tổng hợp: sổ chỉ tính MỘT lần cho cả 5 mô hình, kết quả giống hệt cách tính riêng từng mô hình', () => {
  const { seedWorld } = require('./bench/_seed_ledger.cjs'), s = seedWorld(SRCP, 600), c = s.ctx;
  let raw = 0; const orig = c.loadLedgerRaw_; if (!orig) { ok(false, 'chưa có loadLedgerRaw_ (bản cũ)'); }
  c.loadLedgerRaw_ = function () { raw++; return orig.apply(this, arguments); };
  c.resetMemoDirect_(); const today = c.todayVn_(), models = Object.keys(c.RM_MODELS_), solo = {};
  // cách tính riêng từng mô hình (không dùng chung sổ)
  models.forEach(m => { c.resetMemoDirect_(); solo[m] = JSON.stringify(c.rmBuild_(m, today)); }); const rawSolo = raw; ok(rawSolo >= 5, 'mỗi mô hình riêng tự dựng sổ: ' + rawSolo);
  raw = 0; c.resetMemoDirect_(); vm.runInContext('MEMO_.cacheOk=true', c); const set = c.rmBuildSet_(); const strip = v => JSON.stringify(v, (k, x) => (k === 'generatedAt' ? undefined : x)); ok(set && set.models.length === models.length, 'dựng đủ bộ mô hình'); eq(raw, 1, 'cả bộ dựng chỉ tính sổ một lần (trước: ' + rawSolo + ')');
  c.resetMemoDirect_(); models.forEach(m => { const snap = c.rmLoad_(m); eq(strip(snap.value), strip(JSON.parse(solo[m])), 'mô hình ' + m + ' giống hệt'); });
  eq(typeof vm.runInContext('MEMO_.rmLed', c), 'undefined', 'bộ nhớ dùng chung được dọn sau khi dựng');
  // ngoài lượt dựng không dùng chung (tránh số cũ sau khi ghi)
  c.resetMemoDirect_(); raw = 0; const a = c.loadLedger_(c.RM_USER_, today), b2 = c.loadLedger_(c.RM_USER_, today); eq(raw, 2); ok(a !== b2);
  // lỗi giữa chừng vẫn dọn
  const rb = c.rmBuild_; c.rmBuild_ = () => { throw new Error('boom'); }; c.resetMemoDirect_(); try { c.rmBuildSetLocked_('t'); } catch (e) { } eq(typeof vm.runInContext('MEMO_.rmLed', c), 'undefined', 'dọn cả khi lỗi'); c.rmBuild_ = rb;
  // xu hướng: tháng cuối dùng lại số dư của sổ
  c.resetMemoDirect_(); const led = c.loadLedger_(c.RM_USER_, today); eq(JSON.stringify(led.bal), JSON.stringify(c.computeBalances(led.docs, led.lines, led.allocs, today)), 'số dư tháng cuối = số dư sổ');
  let calls = 0; const cb = c.computeBalances; c.computeBalances = function () { calls++; return cb.apply(this, arguments); }; c.resetMemoDirect_(); const d = c.dashboardSummaryLive_(c.RM_USER_, { payload: { asOf: today } }); const months = d.trend.months.length; eq(calls, months, 'một lần tính cho sổ + (số tháng - 1) lần cho xu hướng, không tính lại tháng cuối'); c.computeBalances = cb;
});
console.log('Tổng', steps, 'khẳng định');
