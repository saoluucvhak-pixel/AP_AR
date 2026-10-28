var SCHEMA_VERSION = '2.7';
var SYS_COLS_ = ['createdAt:s', 'createdBy:s', 'updatedAt:s', 'updatedBy:s', 'version:i', 'isDeleted:i', 'commitState:s', 'txId:s'];
var TABLES_ = {
    Partner: ['id:s', 'partnerNo:s', 'legalName:s', 'shortName:s', 'taxCode:s', 'isCustomer:i', 'isSupplier:i', 'paymentTermDays:n',
        'bankInfo:s', 'status:s', 'scopeTags:s', 'searchText:s', 'contactEmail:s', 'creditLimitMinor:n', 'creditLimitCurrency:s'],
    ServiceFile: ['id:s', 'hsdvCode:s', 'businessGroupCode:s', 'customerPartnerId:s', 'status:s', 'dataGapJson:s', 'note:s', 'searchText:s'],
    ShipmentRef: ['id:s', 'refType:s', 'refValue:s', 'refDate:s', 'serviceFileId:s', 'linkStatus:s', 'evidence:s', 'lotNo:s'],
    DebtDoc: ['id:s', 'docNo:s', 'direction:s', 'docType:s', 'partnerId:s', 'currency:s', 'businessGroupCode:s', 'docDate:s',
        'invoiceNo:s', 'invoiceSerial:s', 'invoiceDate:s', 'statementPeriod:s', 'dueDate:s', 'dueDateSource:s', 'expectedPayDate:s',
        'statusNote:s', 'batchLabel:s', 'totalGrossMinor:i', 'status:s', 'periodId:s', 'postingDate:s', 'submittedBy:s', 'approvedBy:s',
        'approvedAt:s', 'adjustsDocId:s', 'reversesDocId:s', 'isOpening:i', 'source:s', 'sourceKey:s', 'assuranceLevel:s',
        'warningsJson:s', 'rejectReason:s', 'searchText:s'],
    DebtLine: ['id:s', 'docId:s', 'lineNo:i', 'feeTypeCode:s', 'description:s', 'serviceFileId:s', 'shipmentRefId:s', 'containerQty:n',
        'netMinor:i', 'vatMode:s', 'vatRateBp:n', 'vatMinor:i', 'grossMinor:i', 'isPassThrough:i', 'adjustsLineId:s', 'statementPeriod:s',
        'lotNote:s', 'taxConfirmedBy:s', 'accrualId:s'],
    Order: ['id:s', 'orderNo:s', 'customerPartnerId:s', 'poNo:s', 'orderDate:s', 'businessGroupCode:s', 'currency:s', 'serviceFileId:s', 'status:s', 'note:s', 'searchText:s'],
    Accrual: ['id:s', 'orderId:s', 'kind:s', 'partnerId:s', 'poRef:s', 'accrualDate:s', 'feeTypeCode:s', 'description:s', 'containerQty:n', 'netMinor:i', 'vatMode:s',
        'vatRateBp:n', 'vatMinor:i', 'grossMinor:i', 'isPassThrough:i', 'currency:s', 'status:s', 'docId:s', 'debtLineId:s', 'note:s'],
    AccrualSplit: ['id:s', 'accrualId:s', 'orderId:s', 'shareNetMinor:i', 'shareVatMinor:i', 'shareGrossMinor:i', 'basis:s', 'note:s'],
    Followup: ['id:s', 'partnerId:s', 'docId:s', 'direction:s', 'kind:s', 'followDate:s', 'promisedDate:s', 'promisedAmountMinor:n', 'currency:s', 'channel:s', 'note:s', 'status:s'],
    Payment: ['id:s', 'payNo:s', 'direction:s', 'partnerId:s', 'currency:s', 'amountMinor:i', 'effectiveDate:s', 'method:s',
        'cashAccountCode:s', 'bankRef:s', 'purpose:s', 'status:s', 'periodId:s', 'postingDate:s', 'submittedBy:s', 'approvedBy:s',
        'note:s', 'reversedDate:s', 'source:s', 'sourceKey:s', 'rejectReason:s', 'warningsJson:s'],
    Allocation: ['id:s', 'paymentId:s', 'debtLineId:s', 'docId:s', 'partnerId:s', 'currency:s', 'amountMinor:i', 'effectiveDate:s',
        'status:s', 'reversesAllocId:s', 'periodId:s', 'note:s'],
    OpeningBalance: ['id:s', 'kind:s', 'partnerId:s', 'direction:s', 'currency:s', 'amountMinor:i', 'cashAccountCode:s', 'ledgerStartDate:s',
        'batchId:s', 'note:s'],
    Period: ['id:s', 'startDate:s', 'endDate:s', 'status:s', 'closedBy:s', 'closedAt:s', 'reopenReason:s', 'reopenRequestedBy:s'],
    AppUser: ['id:s', 'email:s', 'displayName:s', 'role:s', 'scopeJson:s', 'status:s', 'permissionsVersion:i'],
    Catalog: ['id:s', 'catalogType:s', 'code:s', 'name:s', 'attrsJson:s', 'active:i', 'sortOrder:i'],
    Config: ['id:s', 'value:s'],
    ImportBatch: ['id:s', 'fileName:s', 'fileSha256:s', 'mode:s', 'sourceType:s', 'status:s', 'summaryJson:s', 'committedBy:s', 'committedAt:s'],
    ImportRow: ['id:s', 'batchId:s', 'rowNo:i', 'dataJson:s', 'issuesJson:s', 'decision:s'],
    ReportSnapshot: ['id:s', 'reportCode:s', 'versionLabel:s', 'paramsJson:s', 'asOfDate:s', 'dataFileId:s', 'pdfFileId:s',
        'dataSha256:s', 'status:s', 'issuedBy:s', 'issuedAt:s', 'dataVersion:i'],
    BackupCatalog: ['id:s', 'type:s', 'trigger:s', 'schemaVersion:s', 'driveFolderId:s', 'mainFileId:s', 'auditFileId:s',
        'manifestFileId:s', 'manifestJson:s', 'verifyStatus:s', 'verifiedAt:s', 'note:s'],
    SysTx: ['id:s', 'requestId:s', 'action:s', 'actor:s', 'payloadHash:s', 'status:s', 'startedAt:s', 'committedAt:s',
        'finalizedAt:s', 'planJson:s', 'resultJson:s', 'errorJson:s'],
    FxRate: ['id:s', 'rateDate:s', 'currency:s', 'rateE4:i', 'source:s', 'note:s'],
    PassLink: ['id:s', 'costAccrualId:s', 'revenueAccrualId:s', 'currency:s', 'amountMinor:i', 'status:s', 'linkDate:s', 'note:s'],
    CashTransfer: ['id:s', 'transferNo:s', 'currency:s', 'fromAccount:s', 'toAccount:s', 'amountMinor:i', 'effectiveDate:s', 'status:s', 'periodId:s', 'postingDate:s', 'rateE4:i', 'baseMinor:i', 'reversedDate:s', 'note:s'],
    BankRecon: ['id:s', 'accountCode:s', 'currency:s', 'stmtDate:s', 'stmtBalanceMinor:i', 'bookBalanceMinor:i', 'diffMinor:i', 'status:s', 'clearedJson:s', 'stmtOnlyJson:s', 'resolvedJson:s', 'note:s', 'confirmedBy:s', 'confirmedAt:s'],
    CashCount: ['id:s', 'countNo:s', 'accountCode:s', 'currency:s', 'countDate:s', 'bookMinor:i', 'countedMinor:i', 'diffMinor:i', 'denomJson:s', 'status:s', 'reason:s', 'note:s', 'confirmedBy:s', 'confirmedAt:s'],
    CashExchange: ['id:s', 'exchangeNo:s', 'kind:s', 'currency:s', 'foreignAccount:s', 'baseAccount:s', 'foreignMinor:i', 'baseMinor:i', 'rateE4:i', 'effectiveDate:s', 'status:s', 'periodId:s', 'postingDate:s', 'costBaseMinor:i', 'diffMinor:i', 'reversedDate:s', 'note:s'],
    FxEntry: ['id:s', 'periodId:s', 'entryType:s', 'currency:s', 'direction:s', 'foreignMinor:i', 'rateE4:i', 'amountBaseMinor:i', 'status:s', 'reversesId:s', 'asOf:s', 'note:s'],
    SystemAlert: ['id:s', 'at:s', 'lastAt:s', 'level:s', 'subject:s', 'body:s', 'count:i', 'emailOk:i', 'ackedBy:s', 'ackedAt:s'],
    DraftEntry: ['id:s', 'kind:s', 'ownerId:s', 'targetId:s', 'slot:s', 'baseVersion:i', 'title:s', 'dataJson:s'],
    ReadModel: ['id:s', 'model:s', 'part:i', 'parts:i', 'json:s', 'dataVersion:i', 'builtAt:s', 'asOf:s'],
    AuditLog: ['id:s', 'at:s', 'actorUserId:s', 'actorEmail:s', 'action:s', 'entityType:s', 'entityId:s', 'diffJson:s', 'txId:s',
        'requestId:s', 'result:s', 'reasonCode:s']
};
var NOSYS_ = { SysTx: 1, AuditLog: 1 };
// Cột bổ sung SAU cột hệ thống (để không làm lệch dữ liệu cũ); ensureSchema() tự thêm tiêu đề còn thiếu.
var EXTRA_COLS_ = { Partner: ['address:s', 'phone:s', 'contactName:s', 'contactTitle:s', 'bankAccountNo:s', 'bankName:s'], Order: ['serviceCode:s', 'hsdvNo:s', 'servicesJson:s', 'cancelledDate:s', 'archivedAt:s', 'archivedBy:s', 'archiveNote:s'], Accrual: ['serviceCode:s', 'cancelledDate:s', 'unitPrice:n'], PassLink: ['costRateE4:i', 'revRateE4:i', 'fxDiffBaseMinor:i'], DebtLine: ['serviceCode:s', 'unitPrice:n'], Payment: ['fxRateE4:i', 'fxSource:s', 'amountBaseMinor:i', 'allocPlanJson:s'], DebtDoc: ['fxRateE4:i', 'fxSource:s', 'totalBaseMinor:i'], Allocation: ['fxPayRateE4:i', 'fxDocRateE4:i', 'fxDiffBaseMinor:i'], CashCount: ['adjustStatus:s', 'adjustKind:s', 'adjustNote:s', 'adjustedBy:s', 'adjustedAt:s', 'adjustRateE4:i'] };
var ID_PREFIX_ = { Partner: 'par', ServiceFile: 'sf', ShipmentRef: 'shr', DebtDoc: 'doc', DebtLine: 'dln', Payment: 'pay', Allocation: 'alc',
    OpeningBalance: 'opb', AppUser: 'usr', Catalog: 'cat', ImportBatch: 'bat', ImportRow: 'imr', BackupCatalog: 'bkp',
    ReportSnapshot: 'rpt', ReadModel: 'rdm', Order: 'odr', Accrual: 'acr', AccrualSplit: 'acs', Followup: 'flu', FxRate: 'fxr', FxEntry: 'fxe', PassLink: 'pls', CashTransfer: 'cxf', CashExchange: 'cex', BankRecon: 'brc', CashCount: 'ckk', SysTx: 'tx', AuditLog: 'aud' };
var COLS_CACHE_ = {};
function parseCols_(table) {
    if (COLS_CACHE_[table])
        return COLS_CACHE_[table];
    var defs = TABLES_[table];
    if (!defs)
        throw new Error('Bảng không tồn tại: ' + table);
    var all = (NOSYS_[table] ? defs : defs.concat(SYS_COLS_)).concat(EXTRA_COLS_[table] || []);
    var cols = all.map(function (d) { var p = d.split(':'); return { name: p[0], type: p[1] }; });
    COLS_CACHE_[table] = cols;
    return cols;
}
function coerce_(type, v) {
    if (type === 'i') {
        var n = Number(v);
        return isNaN(n) ? 0 : n;
    }
    if (type === 'n')
        return (v === '' || v === null || v === undefined) ? null : Number(v);
    if (v instanceof Date)
        return Utilities.formatDate(v, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
    return v === null || v === undefined ? '' : String(v);
}
function toCell_(type, v) {
    if (type === 'i')
        return v === undefined || v === null || v === '' ? 0 : Number(v);
    if (type === 'n')
        return v === undefined || v === null || v === '' ? '' : Number(v);
    return v === undefined || v === null ? '' : String(v);
}
var PERMS_ = {
    ADMIN: ['fx.entry.read', 'fx.entry.write', 'fx.entry.post', 'fx.entry.reverse', 'fx.backfill', 'user.manage', 'config.write', 'audit.read', 'backup.run', 'backup.list', 'backup.restore', 'period.reopenConfirm', 'sys.health'],
    ACCOUNTANT: ['read', 'partner.write', 'doc.write', 'doc.submit', 'payment.write', 'payment.submit', 'payment.allocate', 'fx.write',
        'import.write', 'opening.write', 'order.write', 'collect.write', 'report.read', 'report.export', 'dashboard.read'],
    APPROVER: ['read', 'partner.write', 'doc.write', 'doc.submit', 'doc.approve', 'doc.post', 'doc.adjust', 'payment.write', 'payment.submit',
        'payment.approve', 'payment.allocate', 'payment.reverse', 'fx.write', 'import.write', 'import.approve', 'order.write', 'collect.write', 'credit.override', 'opening.write', 'opening.approve',
        'report.read', 'report.export', 'report.issue', 'period.close', 'period.reopenRequest', 'config.finance', 'backup.run', 'backup.list',
        'backup.restore', 'audit.read', 'dashboard.read', 'sys.health'],
    EXEC: ['dashboard.read', 'report.read', 'report.export'],
    AUDITOR: ['read', 'dashboard.read', 'report.read', 'report.export', 'audit.read', 'backup.list']
};
function roleHas_(role, perm) { var p = PERMS_[role]; return !!p && p.indexOf(perm) >= 0; }
var MEMO_ = {};
var STAT_ = {};
var LOCKED_ = false;
var SIG_OK_ = false;
function withLock_(waitMs, fn) {
    if (LOCKED_)
        return fn();
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(waitMs))
        throw err_('SERVER_BUSY', 'Hệ thống đang bận, vui lòng thử lại.');
    LOCKED_ = true;
    try {
        return fn();
    }
    finally {
        LOCKED_ = false;
        lock.releaseLock();
    }
}
function statReset_() { STAT_ = { reads: 0, cells: 0, cacheHit: 0, cacheMiss: 0, lockWaitMs: 0, lockHeldMs: 0, tables: {}, steps: {} }; }
// Thời gian từng bước (ms) cộng dồn trong một request: readMs (getValues), rowsMs (dựng đối tượng), cacheMs (đọc + giải mã cache), ledgerMs (tính số dư), filterSortMs, pageMs.
function statStep_(k, ms) { if (STAT_.steps)
    STAT_.steps[k] = (STAT_.steps[k] || 0) + ms; }
function statAdd_(k, n) { if (STAT_.tables)
    STAT_[k] = (STAT_[k] || 0) + n; }
function resetMemo_() { var ok = MEMO_.cacheOk; MEMO_ = {}; MEMO_.cacheOk = ok; HDR_FRESH_ = {}; }
function resetMemoDirect_() { MEMO_ = { cacheOk: false }; HDR_FRESH_ = {}; }
var PSTABLE_ = { HMAC_SECRET: 1, DB_MAIN_ID: 1, DB_AUDIT_ID: 1, DB_DRAFT_ID: 1, ENV: 1, RATE_LIMIT_PER_MIN: 1, BOOTSTRAP_ADMIN: 1 }, PMEMO_ = {};
function props_() {
    var sp = PropertiesService.getScriptProperties();
    return {
        getProperty: function (k) { if (!PSTABLE_[k])
            return sp.getProperty(k); if (!(k in PMEMO_))
            PMEMO_[k] = sp.getProperty(k); return PMEMO_[k]; },
        setProperty: function (k, v) { delete PMEMO_[k]; return sp.setProperty(k, v); },
        deleteProperty: function (k) { delete PMEMO_[k]; return sp.deleteProperty(k); }
    };
}
// File DRAFT/XEM NHANH: bảng xem nhanh (ReadModel) và bản nháp nhập liệu (DraftEntry). Chưa cấu hình DB_DRAFT_ID thì dùng chung file chính (tương thích bản cũ).
var DRAFT_HOME_TABLES_ = { ReadModel: 1, DraftEntry: 1, SystemAlert: 1 };
function dbIdKey_(kind) { return kind === 'AUDIT' ? 'DB_AUDIT_ID' : kind === 'DRAFT' ? 'DB_DRAFT_ID' : 'DB_MAIN_ID'; }
function tableHome_(t) { return t === 'AuditLog' ? 'AUDIT' : DRAFT_HOME_TABLES_[t] && props_().getProperty('DB_DRAFT_ID') ? 'DRAFT' : 'MAIN'; }
function openDb_(kind) {
    var key = 'db:' + kind;
    if (MEMO_[key])
        return MEMO_[key];
    var id = props_().getProperty(dbIdKey_(kind));
    if (!id)
        throw err_('NOT_CONFIGURED', 'Chưa cài đặt cơ sở dữ liệu (chạy setupBackend).');
    return (MEMO_[key] = SpreadsheetApp.openById(id));
}
var HDR_OK_ = {}, HDR_FRESH_ = {};
// force=true (đường ghi, ensureSchema): luôn đọc tiêu đề thật, bỏ qua cache dùng chung và HDR_OK_.
function assertHeader_(t, s, cols, force) {
    if (!force && HDR_OK_[t])
        return;
    var home = tableHome_(t), ck = 'hdr:' + SCHEMA_VERSION + ':' + (props_().getProperty(dbIdKey_(home)) || '') + ':' + t, cache = CacheService.getScriptCache(), hit = null;
    if (!force) {
        try {
            hit = cache.get(ck);
        }
        catch (e) { }
        if (hit) {
            HDR_OK_[t] = true;
            return;
        }
    }
    var bad = [];
    if (s.getMaxColumns() < cols.length)
        bad.push('thiếu cột (chỉ có ' + s.getMaxColumns() + '/' + cols.length + ')');
    else {
        var got = s.getRange(1, 1, 1, cols.length).getValues()[0];
        cols.forEach(function (c, i) { if (String(got[i]).trim() !== c.name)
            bad.push('cột ' + (i + 1) + ' cần "' + c.name + '" nhưng là "' + got[i] + '"'); });
    }
    if (bad.length)
        throw err_('SCHEMA_MISMATCH', 'Sheet "' + t + '" sai tiêu đề cột so với thiết kế: ' + bad.slice(0, 5).join('; ') + '. Không thêm/xóa/đổi thứ tự cột; hãy khôi phục tiêu đề.');
    HDR_OK_[t] = true;
    try {
        cache.put(ck, '1', CACHE_TTL_);
    }
    catch (e) { }
}
function schemaProblems_() {
    var out = [];
    HDR_OK_ = {};
    HDR_FRESH_ = {};
    Object.keys(TABLES_).forEach(function (t) { try {
        repoSheet_(t, true);
    }
    catch (e) {
        out.push(t + ': ' + (e.userMessage || e.message));
    } });
    return out;
}
function repoSheet_(t, fresh) {
    var ss = openDb_(tableHome_(t)), s = ss.getSheetByName(t);
    if (s) {
        if (fresh) {
            if (!HDR_FRESH_[t]) {
                assertHeader_(t, s, parseCols_(t), true);
                HDR_FRESH_[t] = true;
            }
        }
        else
            assertHeader_(t, s, parseCols_(t));
        return s;
    }
    var cols = parseCols_(t);
    s = ss.insertSheet(t);
    s.getRange(1, 1, 1, cols.length).setValues([cols.map(function (c) { return c.name; })]);
    s.setFrozenRows(1);
    cols.forEach(function (c, i) { s.getRange(1, i + 1, s.getMaxRows(), 1).setNumberFormat(c.type === 's' ? '@' : '0'); });
    return s;
}
function rowToObj_(cols, vals, rowNo) {
    var o = { _row: rowNo };
    for (var j = 0; j < cols.length; j++)
        o[cols[j].name] = coerce_(cols[j].type, vals[j]);
    return o;
}
function objToRow_(cols, o) { return cols.map(function (c) { return toCell_(c.type, o[c.name]); }); }
var CACHE_TTL_ = 1800;
var CACHED_TABLES_ = { AccrualSplit: 1, AppUser: 1, Config: 1, Catalog: 1, Partner: 1, Period: 1, ServiceFile: 1, Order: 1, Accrual: 1, DebtDoc: 1, DebtLine: 1, Allocation: 1, Payment: 1 };
function cacheGenKey_(t) { return 'gen:' + (props_().getProperty('DB_MAIN_ID') || '') + ':' + t; }
function bumpGen_(t) { if (CACHED_TABLES_[t]) {
    try {
        CacheService.getScriptCache().put(cacheGenKey_(t), Utilities.getUuid(), 21600);
    }
    catch (e) { }
} }
function cacheHeadKey_(t) { return 'hd:' + (props_().getProperty('DB_MAIN_ID') || '') + ':' + t; }
// Một lần getAll cho khóa phiên bản + khóa đầu của mọi bảng có cache (thay cho 2–3 lần get mỗi bảng).
function cachePrefetch_() {
    if (!MEMO_.cacheOk)
        return;
    try {
        var keys = [];
        Object.keys(CACHED_TABLES_).forEach(function (t) { keys.push(cacheGenKey_(t), cacheHeadKey_(t)); });
        MEMO_.cpre = CacheService.getScriptCache().getAll(keys);
    }
    catch (e) {
        MEMO_.cpre = null;
    }
}
function cachePrefetchRows_(action) {
    if (!MEMO_.cacheOk || !MEMO_.cpre)
        return;
    var deps = {
        'app.bootstrap': ['Partner', 'Catalog', 'Config'],
        'doc.list': ['Partner', 'DebtDoc', 'DebtLine', 'Allocation', 'ServiceFile', 'Order', 'Accrual', 'AccrualSplit'],
        'order.options': ['Partner', 'Order'],
        'payment.list': ['Partner', 'Payment', 'Allocation', 'AppUser'],
        'workbench.summary': ['Config', 'Partner', 'DebtDoc', 'DebtLine', 'Allocation', 'Order'],
        'dashboard.summary': ['Config', 'Partner', 'DebtDoc', 'DebtLine', 'Allocation', 'Order', 'Payment'],
        'dashboard.uninvoiced': ['Partner', 'Order', 'Accrual', 'AccrualSplit', 'DebtDoc', 'DebtLine']
    }, tables = deps[action];
    if (!tables)
        return;
    var keys = [], pre = MEMO_.cpre, known = MEMO_.cchunkKeys || {}, chunks = MEMO_.cchunks || {};
    tables.forEach(function (t) {
        var gen = pre[cacheGenKey_(t)], head = pre[cacheHeadKey_(t)];
        if (!gen || !head)
            return;
        var hp = head.split(':'), n = Number(hp[1]);
        if (hp[0] !== gen || !Number.isInteger(n) || n < 0 || n > 40)
            return;
        for (var i = 0; i < n; i++) {
            var k = 'tb:' + t + ':' + gen + ':' + i;
            if (!known[k])
                keys.push(k);
        }
    });
    if (!keys.length)
        return;
    try {
        var got = CacheService.getScriptCache().getAll(keys);
        keys.forEach(function (k) { known[k] = true; if (got[k] !== undefined)
            chunks[k] = got[k]; });
        MEMO_.cchunkKeys = known;
        MEMO_.cchunks = chunks;
    }
    catch (e) { }
}
function cacheLoad_(t) {
    var t0 = Date.now();
    try {
        return cacheLoadRaw_(t);
    }
    finally {
        statStep_('cacheMs', Date.now() - t0);
    }
}
function cacheLoadRaw_(t) {
    if (!MEMO_.cacheOk)
        return null;
    try {
        var c = CacheService.getScriptCache(), gk = cacheGenKey_(t), hk = cacheHeadKey_(t), pre = MEMO_.cpre || c.getAll([gk, hk]), gen = pre[gk], head = pre[hk];
        if (!gen) {
            gen = Utilities.getUuid();
            c.put(gk, gen, 21600);
            return { gen: gen, rows: null };
        }
        if (!head)
            return { gen: gen, rows: null };
        var hp = head.split(':');
        if (hp[0] !== gen)
            return { gen: gen, rows: null };
        var n = Number(hp[1]), zip = hp[2] === 'z', base = 'tb:' + t + ':' + gen, keys = [];
        for (var i = 0; i < n; i++)
            keys.push(base + ':' + i);
        var batched = MEMO_.cchunkKeys && keys.every(function (k) { return MEMO_.cchunkKeys[k]; });
        var got = batched ? MEMO_.cchunks : c.getAll(keys), data = '';
        for (var j = 0; j < n; j++) {
            if (got[keys[j]] === undefined)
                return { gen: gen, rows: null };
            data += got[keys[j]];
        }
        if (zip)
            data = Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(data), 'application/x-gzip')).getDataAsString();
        return { gen: gen, rows: JSON.parse(data) };
    }
    catch (e) {
        return { gen: null, rows: null };
    }
}
function cacheStore_(t, gen, rows) {
    if (!gen || !MEMO_.cacheOk)
        return;
    try {
        var json = JSON.stringify(rows), zip = json.length > 20000, data = zip ? Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(json, 'text/plain', 't')).getBytes()) : json;
        var size = 90000, parts = {}, n = Math.ceil(data.length / size), base = 'tb:' + t + ':' + gen;
        if (n > 40)
            return;
        for (var i = 0; i < n; i++)
            parts[base + ':' + i] = data.substr(i * size, size);
        parts[cacheHeadKey_(t)] = gen + ':' + n + ':' + (zip ? 'z' : 'r');
        CacheService.getScriptCache().putAll(parts, CACHE_TTL_);
    }
    catch (e) { }
}
function repoReadAll_(t) {
    var mk = 't:' + t;
    if (MEMO_[mk])
        return MEMO_[mk];
    var cl = CACHED_TABLES_[t] ? cacheLoad_(t) : null;
    if (cl && cl.rows) {
        statAdd_('cacheHit', 1);
        return (MEMO_[mk] = cl.rows);
    }
    if (cl)
        statAdd_('cacheMiss', 1);
    var s = repoSheet_(t), cols = parseCols_(t), n = s.getLastRow() - 1, rows = [];
    if (n > 0) {
        var tr0 = Date.now(), vals = s.getRange(2, 1, n, cols.length).getValues();
        statStep_('readMs', Date.now() - tr0);
        statAdd_('reads', 1);
        statAdd_('cells', n * cols.length);
        if (STAT_.tables)
            STAT_.tables[t] = n;
        var tr1 = Date.now();
        for (var i = 0; i < vals.length; i++)
            rows.push(rowToObj_(cols, vals[i], i + 2));
        statStep_('rowsMs', Date.now() - tr1);
    }
    if (cl)
        cacheStore_(t, cl.gen, rows);
    return (MEMO_[mk] = rows);
}
function openTx_() {
    if (MEMO_.openTx)
        return MEMO_.openTx;
    return (MEMO_.openTx = safeJson_(props_().getProperty('OPEN_TX'), {}));
}
function setOpenTx_(txId, status) {
    var m = safeJson_(props_().getProperty('OPEN_TX'), {});
    if (status)
        m[txId] = status;
    else
        delete m[txId];
    props_().setProperty('OPEN_TX', JSON.stringify(m));
    MEMO_.openTx = m;
    Object.keys(MEMO_).forEach(function (k) { if (k.indexOf('v:') === 0 || k.indexOf('c:') === 0 || k.indexOf('idx:') === 0 || k.indexOf('sv:') === 0)
        delete MEMO_[k]; });
}
function repoValid_(t) {
    var vk = 'v:' + t;
    if (MEMO_[vk])
        return MEMO_[vk].slice();
    var open = openTx_();
    MEMO_[vk] = repoReadAll_(t).filter(function (r) {
        return r.isDeleted !== 1 && (r.commitState === 'C' || (r.commitState === 'P' && open[r.txId] === 'COMMITTED'));
    });
    return MEMO_[vk].slice();
}
// Đọc cả bản ghi đã xóa mềm (chỉ phục vụ dựng lịch sử theo ngày chốt, không dùng để hiển thị/ghi).
// Đọc THEO CỘT (chỉ các cột cần + cột hệ thống isDeleted/commitState/txId), cùng điều kiện hợp lệ như repoValid_. Dùng cho đường chỉ cần vài trường của bảng lớn (liên kết PO).
// Thứ tự: (1) bảng đã đọc đủ trong request; (2) cache bảng đầy đủ; (3) cache bản cắt cột theo CÙNG khóa phiên bản (gen) của bảng — mọi lần ghi vào bảng đổi gen nên bản cắt cũ tự vô hiệu; (4) đọc Sheet theo cột rồi ghi cache bản cắt.
// MAIN vẫn là nguồn duy nhất; cache chỉ để tăng tốc, mất/thiếu chunk/lỗi thì đọc lại Sheet.
function cacheSliceBase_(t, gen, tag) { return 'ts:' + t + ':' + tag + ':' + gen; }
function cacheSliceLoad_(t, gen, tag) {
    if (!gen || !MEMO_.cacheOk)
        return null;
    try {
        var c = CacheService.getScriptCache(), base = cacheSliceBase_(t, gen, tag), head = c.get(base + ':h');
        if (!head)
            return null;
        var hp = head.split(':'), n = Number(hp[0]), keys = [];
        if (!Number.isInteger(n) || n < 0 || n > 40)
            return null;
        for (var i = 0; i < n; i++)
            keys.push(base + ':' + i);
        var got = n ? c.getAll(keys) : {}, data = '';
        for (var j = 0; j < n; j++) {
            if (got[keys[j]] === undefined)
                return null;
            data += got[keys[j]];
        }
        if (hp[1] === 'z')
            data = Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(data), 'application/x-gzip')).getDataAsString();
        var rows = JSON.parse(data);
        return Array.isArray(rows) ? rows : null;
    }
    catch (e) {
        return null;
    }
}
function cacheSliceStore_(t, gen, tag, rows) {
    if (!gen || !MEMO_.cacheOk)
        return;
    try {
        var json = JSON.stringify(rows), zip = json.length > 20000, data = zip ? Utilities.base64Encode(Utilities.gzip(Utilities.newBlob(json, 'text/plain', 't')).getBytes()) : json;
        var size = 90000, n = Math.ceil(data.length / size), base = cacheSliceBase_(t, gen, tag), parts = {};
        if (n > 40)
            return;
        for (var i = 0; i < n; i++)
            parts[base + ':' + i] = data.substr(i * size, size);
        parts[base + ':h'] = n + ':' + (zip ? 'z' : 'r');
        CacheService.getScriptCache().putAll(parts, CACHE_TTL_);
    }
    catch (e) { }
}
// maxGap (mặc định 0): gộp hai dải cột liền kề khi khoảng trống giữa chúng ≤ maxGap cột — đọc thừa vài cột nhưng bớt lệnh getValues. Chỉ giữ lại đúng các cột được yêu cầu.
function repoSliceValid_(t, names, maxGap) {
    var sk = 'sv:' + t, bucket = MEMO_[sk] = MEMO_[sk] || {}, key = names.join(',');
    if (bucket[key])
        return bucket[key].slice();
    if (MEMO_['t:' + t])
        return repoValid_(t);
    var cl = CACHED_TABLES_[t] ? cacheLoad_(t) : null;
    if (cl && cl.rows) {
        statAdd_('cacheHit', 1);
        MEMO_['t:' + t] = cl.rows;
        return repoValid_(t);
    }
    if (cl)
        statAdd_('cacheMiss', 1);
    var cols = parseCols_(t), pos = {}, want = names.concat(['isDeleted', 'commitState', 'txId']), idx = [], tag = want.join('.');
    cols.forEach(function (c, i) { pos[c.name] = i; });
    for (var w = 0; w < want.length; w++) {
        if (pos[want[w]] === undefined)
            return repoValid_(t);
        idx.push(pos[want[w]]);
    }
    var raw = cl && cl.gen ? cacheSliceLoad_(t, cl.gen, tag) : null;
    if (raw)
        statAdd_('cacheHit', 1);
    else {
        raw = [];
        var s = repoSheet_(t), n = s.getLastRow() - 1;
        if (n > 0) {
            var uniq = idx.filter(function (x, i) { return idx.indexOf(x) === i; }).sort(function (a, b) { return a - b; }), runs = [], data = {};
            var gap = Math.max(0, Math.min(Number(maxGap) || 0, 12));
            uniq.forEach(function (x) { var last = runs[runs.length - 1]; if (last && x - last[1] - 1 <= gap)
                last[1] = x;
            else
                runs.push([x, x]); });
            runs.forEach(function (r) {
                var len = r[1] - r[0] + 1, trs = Date.now(), vals = s.getRange(2, r[0] + 1, n, len).getValues();
                statStep_('readMs', Date.now() - trs);
                statAdd_('reads', 1);
                statAdd_('cells', n * len);
                for (var j = 0; j < len; j++) {
                    var col = new Array(n);
                    for (var i = 0; i < n; i++)
                        col[i] = vals[i][j];
                    data[r[0] + j] = col;
                }
            });
            for (var i2 = 0; i2 < n; i2++) {
                var o = { _row: i2 + 2 };
                for (var k = 0; k < want.length; k++)
                    o[want[k]] = coerce_(cols[idx[k]].type, data[idx[k]][i2]);
                raw.push(o);
            }
        }
        if (cl && cl.gen)
            cacheSliceStore_(t, cl.gen, tag, raw);
    }
    var open = openTx_(), out = raw.filter(function (o) { return o.isDeleted !== 1 && (o.commitState === 'C' || (o.commitState === 'P' && open[o.txId] === 'COMMITTED')); });
    bucket[key] = out;
    return out.slice();
}
function repoCommitted_(t) {
    var vk = 'c:' + t;
    if (MEMO_[vk])
        return MEMO_[vk].slice();
    var open = openTx_();
    MEMO_[vk] = repoReadAll_(t).filter(function (r) {
        return r.commitState === 'C' || (r.commitState === 'P' && open[r.txId] === 'COMMITTED');
    });
    return MEMO_[vk].slice();
}
function repoFind_(t, id) {
    var key = 'idx:' + t, index = MEMO_[key];
    if (!index) {
        index = Object.create(null);
        repoValid_(t).forEach(function (row) { if (!Object.prototype.hasOwnProperty.call(index, row.id)) index[row.id] = row; });
        MEMO_[key] = index;
    }
    return index[id] || null;
}
function ensureRows_(s, lastNeeded) {
    var max = s.getMaxRows();
    if (max < lastNeeded)
        s.insertRowsAfter(max, lastNeeded - max + 200);
}
function repoAppend_(t, objs) {
    if (!objs.length)
        return null;
    var s = repoSheet_(t, true), cols = parseCols_(t), start = s.getLastRow() + 1;
    ensureRows_(s, start + objs.length - 1);
    s.getRange(start, 1, objs.length, cols.length).setValues(objs.map(function (o) { return objToRow_(cols, o); }));
    delete MEMO_['t:' + t];
    delete MEMO_['v:' + t];
    if (t === 'Catalog')
        delete MEMO_['v:curMap'];
    delete MEMO_['idx:' + t];
    delete MEMO_['sv:' + t];
    delete MEMO_['c:' + t];
    bumpGen_(t);
    return start;
}
function repoWriteRow_(t, rowNo, obj) {
    var s = repoSheet_(t, true), cols = parseCols_(t);
    s.getRange(rowNo, 1, 1, cols.length).setValues([objToRow_(cols, obj)]);
    delete MEMO_['t:' + t];
    delete MEMO_['v:' + t];
    if (t === 'Catalog')
        delete MEMO_['v:curMap'];
    delete MEMO_['idx:' + t];
    delete MEMO_['sv:' + t];
    delete MEMO_['c:' + t];
    bumpGen_(t);
}
function repoReadRaw_(t, rowNo) {
    var s = repoSheet_(t), cols = parseCols_(t);
    return s.getRange(rowNo, 1, 1, cols.length).getValues()[0];
}
function repoWriteRaw_(t, rowNo, arr) {
    var s = repoSheet_(t, true), cols = parseCols_(t);
    s.getRange(rowNo, 1, 1, cols.length).setValues([arr]);
    delete MEMO_['t:' + t];
    delete MEMO_['v:' + t];
    if (t === 'Catalog')
        delete MEMO_['v:curMap'];
    delete MEMO_['idx:' + t];
    delete MEMO_['sv:' + t];
    delete MEMO_['c:' + t];
    bumpGen_(t);
}
function repoSetColumn_(t, startRow, count, colName, value) {
    var s = repoSheet_(t, true), cols = parseCols_(t), ci = -1;
    for (var i = 0; i < cols.length; i++)
        if (cols[i].name === colName)
            ci = i + 1;
    var arr = [];
    for (var k = 0; k < count; k++)
        arr.push([value]);
    s.getRange(startRow, ci, count, 1).setValues(arr);
    delete MEMO_['t:' + t];
    delete MEMO_['v:' + t];
    if (t === 'Catalog')
        delete MEMO_['v:curMap'];
    delete MEMO_['idx:' + t];
    delete MEMO_['sv:' + t];
    delete MEMO_['c:' + t];
    bumpGen_(t);
}
function repoSetCell_(t, rowNo, colName, value) { repoSetColumn_(t, rowNo, 1, colName, value); }
function repoLastRows_(t, n) {
    var s = repoSheet_(t), cols = parseCols_(t), last = s.getLastRow();
    if (last < 2)
        return [];
    var start = Math.max(2, last - n + 1), vals = s.getRange(start, 1, last - start + 1, cols.length).getValues();
    return vals.map(function (r, i) { return rowToObj_(cols, r, start + i); });
}
function repoTailRows_(t, skipFromEnd, count) {
    var s = repoSheet_(t), cols = parseCols_(t), last = s.getLastRow(), end = last - skipFromEnd;
    if (end < 2 || count <= 0)
        return [];
    var start = Math.max(2, end - count + 1), vals = s.getRange(start, 1, end - start + 1, cols.length).getValues();
    return vals.map(function (r, i) { return rowToObj_(cols, r, start + i); });
}
function repoRowCount_(t) { return Math.max(0, repoSheet_(t).getLastRow() - 1); }
function ensureAllSheets_() { Object.keys(TABLES_).forEach(function (t) { repoSheet_(t); }); }
function uid_(prefix) { return prefix + '_' + Utilities.getUuid().replace(/-/g, ''); }
function nowIso_() { return new Date().toISOString(); }
function todayVn_() { return Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd'); }
function err_(code, msg, fields) { var e = new Error(code + (msg ? ': ' + msg : '')); e.code = code; e.userMessage = msg || code; e.fields = fields || null; return e; }
function normText_(s) {
    return String(s == null ? '' : s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, ' ').trim();
}
function isDate_(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
    if (!m)
        return false;
    var y = +m[1], mo = +m[2], d = +m[3], dt = new Date(Date.UTC(y, mo - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === mo - 1 && dt.getUTCDate() === d;
}
function isMonth_(s) { return /^\d{4}-(0[1-9]|1[0-2])$/.test(String(s || '')); }
function daysBetween_(a, b) {
    var pa = a.split('-'), pb = b.split('-');
    return Math.round((Date.UTC(+pb[0], +pb[1] - 1, +pb[2]) - Date.UTC(+pa[0], +pa[1] - 1, +pa[2])) / 86400000);
}
function addDays_(d, n) {
    var p = d.split('-'), t = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));
    return t.getUTCFullYear() + '-' + ('0' + (t.getUTCMonth() + 1)).slice(-2) + '-' + ('0' + t.getUTCDate()).slice(-2);
}
function monthEnd_(ym) {
    var p = ym.split('-'), y = +p[0], m = +p[1], ny = m === 12 ? y + 1 : y, nm = m === 12 ? 1 : m + 1;
    return addDays_(ny + '-' + ('0' + nm).slice(-2) + '-01', -1);
}
function monthOf_(d) { return String(d).slice(0, 7); }
function paginate_(arr, page, size) {
    size = Math.min(Math.max(+size || 25, 1), 200);
    page = Math.max(+page || 1, 1);
    return { items: arr.slice((page - 1) * size, page * size), total: arr.length, page: page, pageSize: size };
}
function sumBy_(arr, fn) { var s = 0; for (var i = 0; i < arr.length; i++)
    s += fn(arr[i]); return s; }
function groupBy_(arr, fn) { var o = {}; arr.forEach(function (x) { var k = fn(x); (o[k] = o[k] || []).push(x); }); return o; }
function byId_(arr) { var o = {}; arr.forEach(function (x) { o[x.id] = x; }); return o; }
function cmpStr_(a, b) { return a < b ? -1 : a > b ? 1 : 0; }
function safeJson_(s, d) { try {
    return s ? JSON.parse(s) : d;
}
catch (e) {
    return d;
} }
function sanitizeCell_(v) { return (typeof v === 'string' && /^[=+\-@\t\r]/.test(v)) ? "'" + v : v; }
function maxStr_(s, n) { return String(s == null ? '' : s).slice(0, n); }
var MONEY_MAX = 9999999999999;
function assertMoney_(n) {
    if (typeof n !== 'number' || !Number.isSafeInteger(n))
        throw new Error('VALIDATION: số tiền phải là số nguyên');
    if (Math.abs(n) > MONEY_MAX)
        throw new Error('AMOUNT_OVERFLOW');
    return n;
}
function vatMinor(netMinor, rateBp) {
    assertMoney_(netMinor);
    if (!Number.isInteger(rateBp) || rateBp < 0)
        throw new Error('VALIDATION: vatRateBp');
    var neg = netMinor < 0;
    var a = BigInt(Math.abs(netMinor));
    var r = (a * BigInt(rateBp) + BigInt(5000)) / BigInt(10000);
    var out = Number(r);
    return neg ? -out : out;
}
function convertMinor(amountMinor, rateScaled, scale, fromDecimals, toDecimals) {
    assertMoney_(amountMinor);
    var neg = amountMinor < 0;
    var num = BigInt(Math.abs(amountMinor)) * BigInt(rateScaled) * (BigInt(10) ** BigInt(toDecimals));
    var den = (BigInt(10) ** BigInt(scale)) * (BigInt(10) ** BigInt(fromDecimals));
    var out = Number((num * BigInt(2) + den) / (den * BigInt(2)));
    return neg ? -out : out;
}
var DIGITS_ = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function readGroup_(n, hasHigher, opt) {
    var h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10, p = [];
    if (h > 0 || hasHigher)
        p.push(DIGITS_[h] + ' trăm');
    if (t > 1) {
        p.push(DIGITS_[t] + ' mươi');
        if (u === 1)
            p.push('mốt');
        else if (u === 4)
            p.push(opt.tu ? 'tư' : 'bốn');
        else if (u === 5)
            p.push('lăm');
        else if (u > 0)
            p.push(DIGITS_[u]);
    }
    else if (t === 1) {
        p.push('mười');
        if (u === 5)
            p.push('lăm');
        else if (u > 0)
            p.push(DIGITS_[u]);
    }
    else if (u > 0) {
        if (h > 0 || hasHigher)
            p.push(opt.le);
        p.push(DIGITS_[u]);
    }
    return p.join(' ');
}
function numberToWords_(n, opt) {
    if (n === 0)
        return 'không';
    var billions = Math.floor(n / 1e9), rest = n % 1e9, parts = [];
    if (billions > 0)
        parts.push(numberToWords_(billions, opt) + ' tỷ');
    var g = [Math.floor(rest / 1e6), Math.floor((rest % 1e6) / 1e3), rest % 1e3];
    var units = ['triệu', opt.nghin, ''];
    var seenHigher = billions > 0;
    for (var i = 0; i < 3; i++) {
        if (g[i] === 0)
            continue;
        var w = readGroup_(g[i], seenHigher, opt);
        parts.push(units[i] ? w + ' ' + units[i] : w);
        seenHigher = true;
    }
    return parts.join(' ');
}
function amountToWords(amountMinor, currency, opts) {
    assertMoney_(amountMinor);
    var opt = Object.assign({ nghin: 'nghìn', le: 'lẻ', tu: false }, opts || {});
    var neg = amountMinor < 0, a = Math.abs(amountMinor), s;
    if (currency === 'VND') {
        s = numberToWords_(a, opt) + ' đồng chẵn';
    }
    else if (currency === 'USD') {
        var d = Math.floor(a / 100), c = a % 100;
        s = numberToWords_(d, opt) + ' đô la Mỹ' + (c ? ' và ' + numberToWords_(c, opt) + ' xu' : ' chẵn');
    }
    else
        throw new Error('CURRENCY_UNSUPPORTED');
    s = (neg ? 'âm ' : '') + s;
    return s.charAt(0).toUpperCase() + s.slice(1) + '.';
}
function wordsToNumber_(text) {
    var t = String(text).toLowerCase().replace(/[.,]/g, ' ').replace(/đồng chẵn|đồng/g, ' ')
        .replace(/trăn\b/g, 'trăm').replace(/muoi\b/g, 'mươi').replace(/ngàn/g, 'nghìn').replace(/\blinh\b/g, 'lẻ');
    var tokens = t.split(/\s+/).filter(Boolean);
    var map = { 'không': 0, 'một': 1, 'mốt': 1, 'hai': 2, 'ba': 3, 'bốn': 4, 'tư': 4, 'năm': 5, 'lăm': 5, 'sáu': 6, 'bảy': 7, 'tám': 8, 'chín': 9 };
    var units = { 'nghìn': 1e3, 'triệu': 1e6, 'tỷ': 1e9 };
    var total = 0, grp = 0, cur = 0;
    for (var i = 0; i < tokens.length; i++) {
        var w = tokens[i];
        if (w in map)
            cur = map[w];
        else if (w === 'mười') {
            grp += 10;
            cur = 0;
        }
        else if (w === 'mươi') {
            grp += cur * 10;
            cur = 0;
        }
        else if (w === 'trăm') {
            grp += cur * 100;
            cur = 0;
        }
        else if (w === 'lẻ') { }
        else if (w in units) {
            grp += cur;
            total += grp * units[w];
            grp = 0;
            cur = 0;
        }
        else
            return null;
    }
    return total + grp + cur;
}
/* ===== HAK Accounting & Reporting Standard: định dạng số/ngày/căn lề — nhúng NGUYÊN VĂN các hàm từ HAK_ACCOUNTING_REPORT_STANDARD (commit a5833a9797921148a2eaa897df2cd2d47d220136, src/index.js + src/exact-format.js); chỉ bọc trong HAKFormat, thêm 2 hàm tiện ích formatMinor/formatDate ở cuối và thay MỘT số cú pháp mới mà trình phân tích của Apps Script từ chối (hằng BigInt 1n → incDigits, toán tử ?? và spread {...c} trong validateColumns) bằng cách viết tương đương. ===== */
var HAKFormat = (function () {
    'use strict';
    var numberFormats = new Map();
    function formatNumber(value, { maxDecimals = 2, minDecimals = 0 } = {}) {
        if (value === null || value === undefined || value === '') return '';
        if (typeof value !== 'number' || !Number.isFinite(value)) throw new TypeError('Expected finite number');
        if (Math.abs(value) >= Number.MAX_SAFE_INTEGER + 1) throw new RangeError('|value| >= 2^53: use formatExact with a decimal string');
        if (!Number.isInteger(maxDecimals) || maxDecimals < 0 || maxDecimals > 20 || !Number.isInteger(minDecimals) || minDecimals < 0 || minDecimals > maxDecimals) throw new RangeError('Invalid precision');
        const key = minDecimals + ':' + maxDecimals;
        if (!numberFormats.has(key)) numberFormats.set(key, new Intl.NumberFormat('vi-VN', {useGrouping:true,minimumFractionDigits:minDecimals,maximumFractionDigits:maxDecimals}));
        return numberFormats.get(key).format(value);
    }
    function formatVND(value) { return formatNumber(value, {maxDecimals:0}); }
    // Cộng 1 vào chuỗi số nguyên thập phân bằng chữ số (thay cho BigInt(...)+1n: trình phân tích của Apps Script từ chối hằng BigInt `1n`).
    function incDigits(s) {
        const a = s.split('');
        for (let i = a.length - 1; i >= 0; i--) {
            if (a[i] === '9') a[i] = '0';
            else { a[i] = String(Number(a[i]) + 1); return a.join(''); }
        }
        return '1' + a.join('');
    }
    function formatDateISO(value) {
        if (value === null || value === undefined || value === '') return '';
        if (typeof value !== 'string') throw new TypeError('Expected ISO yyyy-MM-dd');
        const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (!m) throw new RangeError('Invalid date');
        const y = +m[1], mo = +m[2], d = +m[3];
        const dt = new Date(Date.UTC(y,mo-1,d));
        if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo-1 || dt.getUTCDate() !== d) throw new RangeError('Invalid calendar date');
        return m[3]+'/'+m[2]+'/'+m[1];
    }
    function alignFor(type) {
        if (['integer','decimal','money','percent'].includes(type)) return 'right';
        if (['date','datetime'].includes(type)) return 'center';
        return 'left';
    }
    function validateColumns(columns) {
        if (!Array.isArray(columns) || !columns.length) throw new TypeError('Non-empty columns required');
        const keys = new Set();
        return columns.map(c => {
            if (!c || typeof c.key !== 'string' || !c.key || keys.has(c.key)) throw new TypeError('Invalid/duplicate column key');
            keys.add(c.key);
            const type = c.type || 'text';
            if (!['text','code','integer','decimal','money','percent','date','datetime','boolean'].includes(type)) throw new TypeError('Invalid column type');
            const minWidth = c.minWidth == null ? 70 : c.minWidth, maxWidth = c.maxWidth == null ? 350 : c.maxWidth;
            if (!(minWidth > 0 && maxWidth >= minWidth)) throw new RangeError('Invalid column widths');
            return Object.assign({}, c, {type:type,align:c.align || alignFor(type),minWidth:minWidth,maxWidth:maxWidth,wrap:c.wrap == null ? type === 'text' : c.wrap});
        });
    }
    function formatExact(value,{digits=2,mode='decimal',trimTrailingZeros=false}={}){
        if(!Number.isInteger(digits)||digits<0||digits>6||!['integer','decimal'].includes(mode))throw RangeError('Invalid precision');
        if(typeof value==='bigint')value=value.toString();
        if(typeof value!=='string'||!/^[+-]?\d+(?:\.\d+)?$/.test(value))throw TypeError('Expected ungrouped decimal string or bigint');
        const negative=value.startsWith('-');const clean=value.replace(/^[+-]/,'');let [whole,fraction='']=clean.split('.');
        const places=mode==='integer'?0:digits;
        const next=fraction[places]||'0';
        let kept=fraction.slice(0,places).padEnd(places,'0');
        if(next>='5'){
            let n=incDigits(whole+kept||'0').padStart(whole.length+places,'0');
            whole=places?n.slice(0,-places):n;kept=places?n.slice(-places):'';
        }
        whole=whole.replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,'.');
        if(trimTrailingZeros)kept=kept.replace(/0+$/,'');
        const zero=/^0+$/.test(whole.replace(/\./g,''))&&!/[1-9]/.test(kept);
        return (negative&&!zero?'-':'')+whole+(kept?','+kept:'');
    }
    // ---- Tiện ích của KATY (không thuộc gói chuẩn): số tiền lưu dạng đơn vị nhỏ nhất (minor) → chuỗi thập phân chính xác rồi định dạng bằng formatExact; ngày sai lịch thì giữ nguyên chuỗi gốc.
    function formatMinor(minor, decimals) {
        if (!Number.isSafeInteger(minor) || !Number.isInteger(decimals) || decimals < 0 || decimals > 6)
            throw new RangeError('Số tiền hoặc độ chính xác không hợp lệ.');
        var neg = minor < 0, digits = String(Math.abs(minor)).padStart(decimals + 1, '0'), s = decimals ? digits.slice(0, -decimals) + '.' + digits.slice(-decimals) : digits;
        return formatExact((neg ? '-' : '') + s, { digits: decimals });
    }
    function formatDate(iso, blank) {
        if (iso === null || iso === undefined || iso === '')
            return blank === undefined ? '' : blank;
        try {
            return formatDateISO(String(iso));
        }
        catch (e) {
            return String(iso);
        }
    }
    return { formatNumber: formatNumber, formatVND: formatVND, formatDateISO: formatDateISO, alignFor: alignFor, validateColumns: validateColumns, formatExact: formatExact, formatMinor: formatMinor, formatDate: formatDate };
})();

function formatMinorVn_(minor, decimals) { return HAKFormat.formatMinor(minor, decimals); }
function appBootstrap_(user, req) {
    var pm = repoValid_('Partner').filter(function (p) { return inScope_(user, p, '') || user.role === 'EXEC'; });
    var cats = { currencies: catalogList_('CURRENCY').map(function (c) { return { code: c.code, name: c.name, decimals: safeJson_(c.attrsJson, {}).decimals || 0 }; }),
        groups: catalogList_('BUSINESS_GROUP').map(function (c) { return { code: c.code, name: c.name, currency: safeJson_(c.attrsJson, {}).currency || '' }; }),
        feeTypes: catalogList_('FEE_TYPE').map(function (c) { return { code: c.code, name: c.name }; }),
        serviceCodes: catalogList_('SERVICE_CODE').map(function (c) { return { code: c.code, name: c.name, department: String(safeJson_(c.attrsJson, {}).department || '') }; }),
        cashAccounts: catalogList_('CASH_ACCOUNT', true).map(function (c) { var a = safeJson_(c.attrsJson, {}); return { code: c.code, name: c.name, currency: a.currency, type: a.type, bank: a.bank, accountNo: a.accountNo, active: c.active }; }) };
    var draftExpiring = 0;
    try {
        repoValid_('DraftEntry').forEach(function (r) { var d = r.ownerId === user.id ? draftDaysLeft_(r) : null; if (d !== null && d <= DRAFT_WARN_DAYS_)
            draftExpiring++; });
    }
    catch (e) { }
    return { user: { email: user.email, displayName: user.displayName, role: user.role, perms: PERMS_[user.role] || [], fx: fxGrantSummary_(user), draftExpiring: draftExpiring, draftWarnDays: DRAFT_WARN_DAYS_ }, catalogs: cats,
        partners: pm.map(function (p) { return { id: p.id, shortName: p.shortName, legalName: p.legalName, taxCode: p.taxCode, isCustomer: p.isCustomer, isSupplier: p.isSupplier, status: p.status }; }).slice(0, 3000),
        config: { ledgerStartDate: ledgerStart_(), entityName: cfgGet_('entity.name', ''), entityShortName: cfgGet_('entity.shortName', ''), entityTaxCode: cfgGet_('entity.taxCode', '') }, today: todayVn_(), env: props_().getProperty('ENV') || 'PROD', maintenance: props_().getProperty('MAINTENANCE') === '1',
        dataVersion: dataVersion_(), schemaVersion: SCHEMA_VERSION };
}
function userList_(user, req) {
    requirePerm_(user, 'user.manage');
    return { items: repoValid_('AppUser').map(function (u) { return { id: u.id, email: u.email, displayName: u.displayName, role: u.role, scope: safeJson_(u.scopeJson, {}), status: u.status, version: u.version }; }) };
}
function userSave_(user, req) {
    requirePerm_(user, 'user.manage');
    var p = req.payload, errs = [];
    function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
    var email = String(p.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        E('email', 'EMAIL_INVALID', 'Email không hợp lệ.');
    if (!PERMS_[p.role])
        E('role', 'ROLE_INVALID', 'Vai trò không hợp lệ.');
    if (!String(p.displayName || '').trim())
        E('displayName', 'REQUIRED', 'Nhập tên hiển thị.');
    if (errs.length)
        throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
    var sc = p.scope || {}, scope = { allPartners: !!sc.allPartners, partnerIds: Array.isArray(sc.partnerIds) ? sc.partnerIds : [], partnerTags: Array.isArray(sc.partnerTags) ? sc.partnerTags : [], businessGroups: Array.isArray(sc.businessGroups) ? sc.businessGroups : [] };
    return runTx_(user, { requestId: req.requestId, action: 'user.save', payload: p, failAt: req.failAt }, function (tx) {
        var users = tx.rows('AppUser'), existing = p.id ? tx.find('AppUser', p.id) : null;
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy người dùng.');
        if (users.some(function (u) { return u.email === email && (!existing || u.id !== existing.id); }))
            throw err_('VALIDATION_FAILED', 'Email đã tồn tại', [{ path: 'email', code: 'DUPLICATE', message: 'Email đã có trong danh sách.' }]);
        var status = p.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE';
        var pmU = byId_(tx.rows('Partner')), grpU = {}, scErrs = [];
        tx.rows('Catalog').forEach(function (c) { if (c.catalogType === 'BUSINESS_GROUP')
            grpU[c.code] = 1; });
        scope.partnerIds.forEach(function (id) { if (!pmU[id])
            scErrs.push({ path: 'scope.partnerIds', code: 'NOT_FOUND', message: 'Đối tác không tồn tại: ' + id }); });
        scope.businessGroups.forEach(function (g) { if (!grpU[g])
            scErrs.push({ path: 'scope.businessGroups', code: 'NOT_FOUND', message: 'Nhóm nghiệp vụ không tồn tại: ' + g }); });
        scope.partnerTags.forEach(function (t) { if (typeof t !== 'string' || !t.trim() || t.length > 50)
            scErrs.push({ path: 'scope.partnerTags', code: 'INVALID', message: 'Nhãn phạm vi không hợp lệ.' }); });
        if (scErrs.length)
            throw err_('VALIDATION_FAILED', 'Phạm vi dữ liệu chưa hợp lệ', scErrs);
        function normScope_(x) { x = x || {}; return JSON.stringify({ a: !!x.allPartners, i: (x.partnerIds || []).slice().sort(), t: (x.partnerTags || []).slice().sort(), g: (x.businessGroups || []).slice().sort() }); }
        if (existing && existing.id === user.id && normScope_(safeJson_(existing.scopeJson, {})) !== normScope_(scope))
            throw err_('FORBIDDEN', 'Không tự đổi phạm vi dữ liệu của chính mình.');
        if (existing && existing.id === user.id && (p.status === 'SUSPENDED' || p.role !== existing.role))
            throw err_('FORBIDDEN', 'Không tự thay đổi vai trò/trạng thái của chính mình.');
        var activeAdmins = users.filter(function (u) { return u.role === 'ADMIN' && u.status === 'ACTIVE' && (!existing || u.id !== existing.id); }).length + (p.role === 'ADMIN' && status === 'ACTIVE' ? 1 : 0);
        if (activeAdmins < 1)
            throw err_('LAST_ADMIN', 'Phải còn ít nhất một quản trị hệ thống hoạt động.');
        var fields = { email: email, displayName: maxStr_(p.displayName, 100).trim(), role: p.role, scopeJson: JSON.stringify(scope), status: status, permissionsVersion: (existing ? existing.permissionsVersion : 0) + 1 };
        var row = existing ? tx.update('AppUser', existing.id, fields, p.ifVersion) : tx.insert('AppUser', fields);
        return { result: { id: row.id }, audit: [{ entityType: 'AppUser', entityId: row.id, action: existing ? 'user.update' : 'user.create', diff: { email: email, role: p.role, status: status, scope: scope } }] };
    });
}
var CATALOG_TYPES_ = ['CURRENCY', 'BUSINESS_GROUP', 'FEE_TYPE', 'CASH_ACCOUNT', 'SERVICE_CODE'];
function catalogList2_(user, req) { var t = req.payload && req.payload.type; return { items: repoValid_('Catalog').filter(function (c) { return !t || c.catalogType === t; }).sort(function (a, b) { return a.sortOrder - b.sortOrder || cmpStr_(a.code, b.code); }).map(function (c) { return { id: c.id, catalogType: c.catalogType, code: c.code, name: c.name, attrs: safeJson_(c.attrsJson, {}), active: c.active, sortOrder: c.sortOrder, version: c.version }; }) }; }
function catalogUsage_(tx, c) {
    if (c.catalogType === 'SERVICE_CODE') {
        if (tx.rows('Order').some(function (o) { return orderServices_(o).some(function (x) { return x.code === c.code; }); }))
            return 'đơn hàng/PO';
        if (tx.rows('Accrual').some(function (a) { return a.serviceCode === c.code; }))
            return 'khoản phát sinh';
        if (tx.rows('DebtLine').some(function (l) { return l.serviceCode === c.code; }))
            return 'dòng chứng từ';
        return '';
    }
    var code = c.code, refs = {
        FEE_TYPE: [['DebtLine', 'feeTypeCode', 'dòng chứng từ'], ['Accrual', 'feeTypeCode', 'khoản phát sinh']],
        BUSINESS_GROUP: [['DebtDoc', 'businessGroupCode', 'chứng từ'], ['Order', 'businessGroupCode', 'đơn hàng'], ['ServiceFile', 'businessGroupCode', 'hồ sơ dịch vụ']],
        CURRENCY: [['DebtDoc', 'currency', 'chứng từ'], ['Payment', 'currency', 'thanh toán'], ['Accrual', 'currency', 'khoản phát sinh'], ['Order', 'currency', 'đơn hàng'], ['OpeningBalance', 'currency', 'dư đầu kỳ'], ['Partner', 'creditLimitCurrency', 'hạn mức đối tác']],
        CASH_ACCOUNT: [['Payment', 'cashAccountCode', 'thanh toán'], ['OpeningBalance', 'cashAccountCode', 'dư đầu kỳ']],
        SERVICE_CODE: [['Order', 'serviceCode', 'đơn hàng/PO'], ['DebtLine', 'serviceCode', 'dòng chứng từ']]
    }[c.catalogType] || [], out = '';
    refs.some(function (r) {
        if (tx.rows(r[0]).some(function (x) { return x[r[1]] === code; })) {
            out = r[2];
            return true;
        }
        return false;
    });
    return out;
}
function catalogSave_(user, req) {
    if (!can_(user, 'config.write') && !can_(user, 'config.finance'))
        throw err_('FORBIDDEN', 'Không đủ quyền cập nhật danh mục.');
    var p = req.payload, errs = [];
    function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
    if (CATALOG_TYPES_.indexOf(p.catalogType) < 0)
        E('catalogType', 'INVALID', 'Loại danh mục không hợp lệ.');
    var code = String(p.code || '').trim().toUpperCase();
    if (!/^[A-Z0-9_\-]{2,30}$/.test(code))
        E('code', 'CODE_INVALID', 'Mã gồm 2–30 ký tự A-Z, 0-9, gạch.');
    if (!String(p.name || '').trim())
        E('name', 'REQUIRED', 'Nhập tên.');
    var attrs = Object.assign({}, p.attrs || {});
    if (p.catalogType === 'CASH_ACCOUNT') {
        if (!currencyMap_()[attrs.currency])
            E('attrs.currency', 'REQUIRED', 'Chọn tiền tệ.');
        if (['CASH', 'BANK'].indexOf(attrs.type) < 0)
            E('attrs.type', 'REQUIRED', 'Chọn loại quỹ (tiền mặt/ngân hàng).');
    }
    if (p.catalogType === 'SERVICE_CODE')
        attrs = { department: maxStr_(attrs.department, 100).trim() };
    if (errs.length)
        throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
    return runTx_(user, { requestId: req.requestId, action: 'catalog.save', payload: p, failAt: req.failAt }, function (tx) {
        var existing = p.id ? tx.find('Catalog', p.id) : null;
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy mục danh mục.');
        if (tx.rows('Catalog').some(function (c) { return c.catalogType === p.catalogType && c.code === code && (!existing || c.id !== existing.id); }))
            throw err_('VALIDATION_FAILED', 'Mã đã tồn tại', [{ path: 'code', code: 'DUPLICATE', message: 'Mã đã tồn tại.' }]);
        if (existing && existing.catalogType !== p.catalogType)
            throw err_('VALIDATION_FAILED', 'Không đổi loại của mục danh mục đã tạo.');
        if (existing) {
            var oldA = safeJson_(existing.attrsJson, {}), usage = catalogUsage_(tx, existing);
            if (usage && existing.code !== code)
                throw err_('IN_USE', 'Mã ' + existing.code + ' đã được dùng trong ' + usage + ': không đổi mã (chỉ được sửa tên hoặc ngừng sử dụng).');
            if (usage && p.catalogType === 'CASH_ACCOUNT' && oldA.currency !== attrs.currency)
                throw err_('IN_USE', 'Tài khoản quỹ đã có giao dịch: không đổi tiền tệ (chỉ được ngừng sử dụng).');
            if (usage && p.catalogType === 'CURRENCY' && Number(oldA.decimals) !== Number(attrs.decimals))
                throw err_('IN_USE', 'Tiền tệ ' + existing.code + ' đã phát sinh dữ liệu: không đổi số chữ số thập phân.');
        }
        var fields = { catalogType: p.catalogType, code: code, name: maxStr_(p.name, 150).trim(), attrsJson: JSON.stringify(attrs), active: p.active === 0 || p.active === false ? 0 : 1, sortOrder: Number.isInteger(p.sortOrder) ? p.sortOrder : 100 };
        var row = existing ? tx.update('Catalog', existing.id, fields, p.ifVersion) : tx.insert('Catalog', fields);
        return { result: { id: row.id }, audit: [{ entityType: 'Catalog', entityId: row.id, action: existing ? 'catalog.update' : 'catalog.create', diff: fields }] };
    });
}
var CONFIG_EDITABLE_ = ['entity.name', 'entity.shortName', 'entity.address', 'entity.taxCode', 'entity.bank', 'entity.phone', 'entity.email', 'entity.logoFileId', 'backup.retention.daily', 'archive.sysTxDays', 'archive.auditMonths', 'credit.policy', 'credit.maxOverdueDays'];
var CONFIG_FINANCE_ = ['credit.policy', 'credit.maxOverdueDays'];
function configGet_(user, req) { var o = {}; CONFIG_EDITABLE_.concat(['ledgerStartDate']).forEach(function (k) { o[k] = cfgGet_(k, ''); }); return o; }
function configSet_(user, req) {
    var p = req.payload || {};
    Object.keys(p.values || {}).forEach(function (k) { if (!(can_(user, 'config.write') || (CONFIG_FINANCE_.indexOf(k) >= 0 && can_(user, 'config.finance'))))
        throw err_('FORBIDDEN', 'Không đủ quyền đổi cấu hình: ' + k); });
    if (p.values && p.values['archive.sysTxDays'] !== undefined && !(Number.isInteger(Number(p.values['archive.sysTxDays'])) && Number(p.values['archive.sysTxDays']) >= 30 && Number(p.values['archive.sysTxDays']) <= 3650))
        throw err_('VALIDATION_FAILED', 'Số ngày giữ lịch sử giao dịch phải từ 30 đến 3650.');
    if (p.values && p.values['archive.auditMonths'] !== undefined && !(Number.isInteger(Number(p.values['archive.auditMonths'])) && Number(p.values['archive.auditMonths']) >= 12 && Number(p.values['archive.auditMonths']) <= 240))
        throw err_('VALIDATION_FAILED', 'Số tháng giữ nhật ký phải từ 12 đến 240.');
    if (p.values && p.values['credit.policy'] !== undefined && ['WARN', 'BLOCK'].indexOf(p.values['credit.policy']) < 0)
        throw err_('VALIDATION_FAILED', 'Chính sách hạn mức: WARN hoặc BLOCK.');
    return runTx_(user, { requestId: req.requestId, action: 'config.set', payload: p, failAt: req.failAt }, function (tx) {
        var changed = {};
        Object.keys(p.values || {}).forEach(function (k) {
            if (CONFIG_EDITABLE_.indexOf(k) < 0)
                throw err_('VALIDATION_FAILED', 'Khóa cấu hình không được phép sửa: ' + k);
            var v = maxStr_(p.values[k], 500), cur = tx.find('Config', k);
            if (cur)
                tx.update('Config', k, { value: v });
            else
                tx.insert('Config', { id: k, value: v });
            changed[k] = v;
        });
        return { result: { changed: Object.keys(changed) }, audit: [{ entityType: 'Config', entityId: 'config', action: 'config.set', diff: changed }] };
    });
}
function auditList_(user, req) {
    requirePerm_(user, 'audit.read');
    var p = req.payload || {}, q = normText_(p.q), size = Math.min(Math.max(+p.pageSize || 50, 1), 200), page = Math.max(+p.page || 1, 1);
    function out(a) { return { at: a.at, actor: a.actorEmail, action: a.action, entityType: a.entityType, entityId: a.entityId, result: a.result, reasonCode: a.reasonCode, diff: safeJson_(a.diffJson, null) }; }
    var filtered = !!(p.result || p.entityType || p.entityId || p.from || p.to || q);
    if (!filtered) {
        var total = repoRowCount_('AuditLog'), rows0 = repoTailRows_('AuditLog', (page - 1) * size, size).reverse();
        return { items: rows0.map(out), total: total, page: page, pageSize: size, readMode: 'tail' };
    }
    var AUDIT_SCAN_MAX_ = 20000, totalAll = repoRowCount_('AuditLog');
    var rows = repoTailRows_('AuditLog', 0, AUDIT_SCAN_MAX_).filter(function (a) {
        if (p.result && a.result !== p.result)
            return false;
        if (p.entityType && a.entityType !== p.entityType)
            return false;
        if (p.entityId && a.entityId !== p.entityId)
            return false;
        if (p.from && a.at.slice(0, 10) < p.from)
            return false;
        if (p.to && a.at.slice(0, 10) > p.to)
            return false;
        return !q || normText_(a.actorEmail + ' ' + a.action + ' ' + a.reasonCode + ' ' + a.entityType).indexOf(q) >= 0;
    }).sort(function (a, b) { return cmpStr_(b.at, a.at); });
    var pg = paginate_(rows, page, size);
    return { items: pg.items.map(out), total: pg.total, page: pg.page, pageSize: pg.pageSize, readMode: 'scan', truncated: totalAll > AUDIT_SCAN_MAX_, scanned: Math.min(totalAll, AUDIT_SCAN_MAX_) };
}
function txStatus_(user, req) {
    var t = findTxByRequest_(req.payload.requestId);
    if (!t || (t.actor !== user.email && user.role !== 'ADMIN'))
        return { status: 'NOT_FOUND' };
    return { status: t.status, action: t.action, result: (t.status === 'COMMITTED' || t.status === 'FINALIZED') ? safeJson_(t.resultJson, null) : null };
}
function sysHealth_(user, req) {
    requirePerm_(user, 'sys.health');
    var b = repoValid_('BackupCatalog').sort(function (a, c) { return cmpStr_(c.createdAt, a.createdAt); })[0];
    return { dataVersion: dataVersion_(), openTx: Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {})), maintenance: props_().getProperty('MAINTENANCE') === '1', env: props_().getProperty('ENV') || 'PROD', schemaVersion: SCHEMA_VERSION,
        lastBackup: b ? { id: b.id, at: b.createdAt, verifyStatus: b.verifyStatus } : null, rows: { SysTx: repoRowCount_('SysTx'), AuditLog: repoRowCount_('AuditLog') }, auditFailures: Number(props_().getProperty('AUDIT_FAIL_COUNT') || 0), crossPeriodPostedDocs: ledgerDateImpact_().length, auditFailLast: props_().getProperty('AUDIT_FAIL_LAST') || '', serverTime: nowIso_() };
}
var HMAC_WINDOW_MS = 2 * 60 * 1000;
function signature_(secret, ts, nonce, email, action, payloadJson) {
    var msg = [ts, nonce, email, action, sha256Hex_(payloadJson)].join('.');
    return Utilities.base64Encode(Utilities.computeHmacSha256Signature(msg, secret));
}
function constantTimeEquals_(a, b) {
    if (a.length !== b.length)
        return false;
    var r = 0;
    for (var i = 0; i < a.length; i++)
        r |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return r === 0;
}
function verifyGatewayRequest_(req) {
    var secret = props_().getProperty('HMAC_SECRET');
    if (!secret)
        throw err_('UNAUTHENTICATED', 'no-secret');
    if (!req || !req.email || !req.sig || !req.ts || !req.nonce)
        throw err_('UNAUTHENTICATED', 'malformed');
    var email = String(req.email).trim().toLowerCase();
    var payloadJson = typeof req.payloadJson === 'string' ? req.payloadJson : '';
    var expect = signature_(secret, String(req.ts), String(req.nonce), email, String(req.action), payloadJson);
    if (!constantTimeEquals_(expect, String(req.sig)))
        throw err_('UNAUTHENTICATED', 'bad-sig');
    if (Math.abs(Date.now() - Number(req.ts)) > HMAC_WINDOW_MS)
        throw err_('UNAUTHENTICATED', 'expired');
    var cache = CacheService.getScriptCache(), nk = 'nonce:' + req.nonce;
    if (cache.get(nk))
        throw err_('UNAUTHENTICATED', 'replay');
    cache.put(nk, '1', 600);
    SIG_OK_ = true;
    return resolveUser_(email);
}
function resolveUser_(email) {
    resetMemo_();
    cachePrefetch_();
    var users = repoValid_('AppUser'), u = null;
    for (var i = 0; i < users.length; i++)
        if (users[i].email === email)
            u = users[i];
    if (!u && users.length === 0 && props_().getProperty('BOOTSTRAP_ADMIN') === email) {
        var sys = { id: 'system', email: 'system' };
        runTx_(sys, { requestId: 'bootstrap-' + email, action: 'user.bootstrap', payload: { email: email } }, function (tx) {
            var row = tx.insert('AppUser', { email: email, displayName: email, role: 'ADMIN', scopeJson: JSON.stringify({ allPartners: true }), status: 'ACTIVE', permissionsVersion: 1 });
            return { result: { id: row.id }, audit: [{ entityType: 'AppUser', entityId: row.id, action: 'user.bootstrap', diff: { email: email } }] };
        });
        resetMemo_();
        users = repoValid_('AppUser');
        for (var j = 0; j < users.length; j++)
            if (users[j].email === email)
                u = users[j];
    }
    if (!u)
        throw err_('FORBIDDEN', 'Tài khoản chưa được cấp quyền sử dụng hệ thống.');
    if (u.status !== 'ACTIVE')
        throw err_('FORBIDDEN', 'Tài khoản đã bị tạm khóa.');
    return { id: u.id, email: u.email, displayName: u.displayName, role: u.role, scope: safeJson_(u.scopeJson, {}), version: u.version };
}
function can_(user, perm) { return roleHas_(user.role, perm); }
function requirePerm_(user, perm) { if (!can_(user, perm))
    throw err_('FORBIDDEN', 'Không đủ quyền: ' + perm); }
function inScope_(user, partner, group) {
    var sc = user.scope || {};
    if (sc.businessGroups && sc.businessGroups.length && group && sc.businessGroups.indexOf(group) < 0)
        return false;
    if (sc.allPartners)
        return true;
    if (!partner)
        return false;
    if (sc.partnerIds && sc.partnerIds.indexOf(partner.id) >= 0)
        return true;
    if (sc.partnerTags && partner.scopeTags) {
        var tags = String(partner.scopeTags).split(',').map(function (x) { return x.trim(); });
        for (var i = 0; i < tags.length; i++)
            if (tags[i] && sc.partnerTags.indexOf(tags[i]) >= 0)
                return true;
    }
    return false;
}
function assertScope_(user, partner, group) { if (!inScope_(user, partner, group))
    throw err_('OUT_OF_SCOPE', 'Ngoài phạm vi dữ liệu được cấp.'); }
// Truy cập theo ID mà đối tượng nằm ngoài phạm vi: trả NOT_FOUND giống hệt ID không tồn tại (không lộ "ID này có tồn tại").
function assertVisible_(user, partner, group, what, fullMsg) { if (!inScope_(user, partner, group))
    throw err_('NOT_FOUND', fullMsg || 'Không tìm thấy ' + what + '.'); }
var SYS_ADMIN_ = { id: 'system', email: 'system', role: 'APPROVER', scope: { allPartners: true } };
function sheetHash_(sheet) {
    var last = sheet.getLastRow(), cols = sheet.getLastColumn(), h = '', rows = 0;
    if (last < 1 || cols < 1)
        return { rows: 0, sha256: sha256Hex_('') };
    var CH = 500;
    for (var r = 1; r <= last; r += CH) {
        var n = Math.min(CH, last - r + 1), vals = sheet.getRange(r, 1, n, cols).getValues();
        h = sha256Hex_(h + JSON.stringify(vals));
    }
    return { rows: last - 1, sha256: h };
}
function dbFingerprint_(ssId) {
    var ss = SpreadsheetApp.openById(ssId), out = {};
    ss.getSheets().forEach(function (s) { out[s.getName()] = sheetHash_(s); });
    return out;
}
function controlTotals_() {
    resetMemo_();
    var led = loadLedger_(SYS_ADMIN_, todayVn_()), out = {};
    led.lines.forEach(function (l) {
        var b = led.bal.byLine[l.id];
        if (!b)
            return;
        var d = led.docById[l.docId];
        var k = d.direction + ':' + d.currency, o = out[k] = out[k] || { gross: 0, settled: 0, out: 0 };
        o.gross += b.gross + b.adjust;
        o.settled += b.alloc;
        o.out += b.out;
    });
    return out;
}
function backupRun_(user, req) { requirePerm_(user, 'backup.run'); return doBackup_(user, 'MANUAL', (req.payload && req.payload.note) || ''); }
function backupDailyTrigger() { try {
    doBackup_(SYS_ADMIN_, 'SCHEDULED', '');
}
catch (e) {
    alertAdmin_('Sao lưu tự động thất bại', String(e));
} }
// Cảnh báo cho quản trị: GHI BỀN VÀO bảng SystemAlert (hiện trên giao diện) rồi mới gửi email; email lỗi/hết hạn mức không làm mất cảnh báo.
function alertRecord_(subject, body, level) {
    try {
        return withLock_(3000, function () {
            resetMemo_();
            var now = nowIso_(), open = repoReadAll_('SystemAlert').filter(function (r) { return r.isDeleted !== 1 && !r.ackedAt && r.subject === subject; })[0];
            if (open) {
                var fresh = Date.now() - new Date(open.lastAt).getTime() > 7200000;
                repoWriteRow_('SystemAlert', open._row, Object.assign({}, open, { count: open.count + 1, lastAt: now, body: maxStr_(body, 1500), updatedAt: now }));
                return { id: open.id, sendMail: fresh };
            }
            var row = { id: uid_('alr'), at: now, lastAt: now, level: level || 'WARN', subject: maxStr_(subject, 200), body: maxStr_(body, 1500), count: 1, emailOk: 0, ackedBy: '', ackedAt: '', version: 1, isDeleted: 0, commitState: 'C', txId: '', createdAt: now, createdBy: 'system', updatedAt: now, updatedBy: 'system' };
            repoAppend_('SystemAlert', [row]);
            return { id: row.id, sendMail: true };
        });
    }
    catch (e) {
        console.warn('alertRecord ' + e);
        return { id: '', sendMail: true };
    }
}
function alertAdmin_(subject, body, level) {
    var rec = alertRecord_(subject, body, level), ok = false;
    try {
        if (rec.sendMail) {
            var to = props_().getProperty('ALERT_EMAIL');
            if (!to) {
                try {
                    to = Session.getEffectiveUser().getEmail();
                }
                catch (e0) { }
            }
            if (to) {
                MailApp.sendEmail(to, '[KATY AP/AR] ' + subject, body);
                ok = true;
            }
        }
    }
    catch (e) {
        console.error('ALERT_FAIL ' + e);
    }
    if (rec.id && ok) {
        try {
            withLock_(2000, function () { resetMemo_(); var r = repoReadAll_('SystemAlert').filter(function (x) { return x.id === rec.id; })[0]; if (r)
                repoWriteRow_('SystemAlert', r._row, Object.assign({}, r, { emailOk: 1 })); });
        }
        catch (e2) { }
    }
}
function doBackup_(user, trigger, note) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000))
        throw err_('SERVER_BUSY', 'Hệ thống đang bận, thử lại sau.');
    var meta;
    LOCKED_ = true;
    try {
        resetMemo_();
        recoverStale_(0);
        var open = Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {}));
        if (open.length)
            throw err_('TX_OPEN', 'Còn ' + open.length + ' thao tác ghi chưa hoàn tất, không sao lưu lúc này.');
        var ts = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmmss'), root = driveFolder_('BACKUP_FOLDER_ID', 'CONGNO_BACKUPS');
        var folder = root.createFolder(ts + '-' + trigger);
        var mainCopy = DriveApp.getFileById(props_().getProperty('DB_MAIN_ID')).makeCopy('DB_MAIN_' + ts, folder);
        var auditCopy = DriveApp.getFileById(props_().getProperty('DB_AUDIT_ID')).makeCopy('DB_AUDIT_' + ts, folder);
        var draftId = props_().getProperty('DB_DRAFT_ID'), draftCopy = draftId ? DriveApp.getFileById(draftId).makeCopy('DB_DRAFT_' + ts, folder) : null;
        var srcMain = dbFingerprint_(props_().getProperty('DB_MAIN_ID')), srcAudit = dbFingerprint_(props_().getProperty('DB_AUDIT_ID'));
        meta = { backupId: 'bkp_' + ts, type: 'DATA', trigger: trigger, createdAt: nowIso_(), createdBy: user.email, schemaVersion: SCHEMA_VERSION, env: props_().getProperty('ENV') || 'PROD',
            dataVersion: dataVersion_(), pendingTx: 0, files: draftCopy ? { main: mainCopy.getId(), audit: auditCopy.getId(), draft: draftCopy.getId() } : { main: mainCopy.getId(), audit: auditCopy.getId() }, controlTotals: controlTotals_() };
        meta.srcMain = srcMain;
        meta.srcAudit = srcAudit;
    }
    finally {
        LOCKED_ = false;
        lock.releaseLock();
    }
    meta.sheets = { main: dbFingerprint_(meta.files.main), audit: dbFingerprint_(meta.files.audit) };
    meta.sourceDiffs = copyFidelityDiffs_(meta.srcMain, meta.sheets.main, 'main').concat(copyFidelityDiffs_(meta.srcAudit, meta.sheets.audit, 'audit'));
    delete meta.srcMain;
    delete meta.srcAudit;
    var folderId = DriveApp.getFileById(meta.files.main).getParents().next().getId();
    var mf = DriveApp.getFolderById(folderId).createFile('manifest.json', JSON.stringify(meta, null, 2), 'application/json');
    var row = { id: uid_('bkp'), type: 'DATA', trigger: trigger, schemaVersion: SCHEMA_VERSION, driveFolderId: folderId, mainFileId: meta.files.main, auditFileId: meta.files.audit, manifestFileId: mf.getId(),
        manifestJson: JSON.stringify({ controlTotals: meta.controlTotals, sheets: meta.sheets, createdAt: meta.createdAt, dataVersion: meta.dataVersion, sourceDiffs: meta.sourceDiffs }), verifyStatus: 'UNVERIFIED', verifiedAt: '', note: maxStr_(note, 300),
        createdAt: nowIso_(), createdBy: user.id, updatedAt: nowIso_(), updatedBy: user.id, version: 1, isDeleted: 0, commitState: 'C', txId: '' };
    var catRow = withLock_(30000, function () { return repoAppend_('BackupCatalog', [row]); });
    var v = verifyBackupRow_(row);
    withLock_(30000, function () {
        repoSetCell_('BackupCatalog', catRow, 'verifyStatus', v.ok ? 'VERIFIED' : 'FAILED');
        repoSetCell_('BackupCatalog', catRow, 'verifiedAt', nowIso_());
    });
    if (!v.ok)
        alertAdmin_('Sao lưu không qua kiểm tra', JSON.stringify(v));
    writeAudit_(user, '', '', [{ entityType: 'Backup', entityId: row.id, action: 'backup.run', diff: { trigger: trigger, verify: v.ok } }]);
    applyRetention_();
    return { id: row.id, verify: v, createdAt: meta.createdAt };
}
function copyFidelityDiffs_(src, copy, label) {
    var out = [];
    Object.keys(src || {}).forEach(function (name) {
        var a = src[name], b = (copy || {})[name];
        if (!b)
            out.push(label + '/' + name + ': bản sao thiếu sheet');
        else if (a.rows !== b.rows || a.sha256 !== b.sha256)
            out.push(label + '/' + name + ': bản sao khác DB gốc');
    });
    return out;
}
function schemaNum_(v) { return String(v || '0').split('.').map(Number); }
function schemaLte_(a, b) {
    var x = schemaNum_(a), y = schemaNum_(b);
    for (var i = 0; i < Math.max(x.length, y.length); i++) {
        var p = x[i] || 0, q = y[i] || 0;
        if (p !== q)
            return p < q;
    }
    return true;
}
function verifyBackupRow_(row) {
    var m = safeJson_(row.manifestJson, null), diffs = [];
    if (!m)
        return { ok: false, diffs: ['Không có manifest'] };
    (m.sourceDiffs || []).forEach(function (d) { diffs.push(d); });
    var live = { main: dbFingerprint_(row.mainFileId), audit: dbFingerprint_(row.auditFileId) };
    ['main', 'audit'].forEach(function (k) {
        Object.keys(m.sheets[k]).forEach(function (name) {
            var a = m.sheets[k][name], b = live[k][name];
            if (!b)
                diffs.push(k + '/' + name + ': thiếu sheet');
            else if (a.rows !== b.rows || a.sha256 !== b.sha256)
                diffs.push(k + '/' + name + ': số dòng/mã băm không khớp');
        });
    });
    return { ok: diffs.length === 0, diffs: diffs };
}
function backupList_(user, req) {
    requirePerm_(user, 'backup.list');
    var items = repoValid_('BackupCatalog').sort(function (a, b) { return cmpStr_(b.createdAt, a.createdAt); }).map(function (b) {
        var m = safeJson_(b.manifestJson, {});
        return { id: b.id, trigger: b.trigger, createdAt: b.createdAt, schemaVersion: b.schemaVersion, verifyStatus: b.verifyStatus, verifiedAt: b.verifiedAt, note: b.note, controlTotals: m.controlTotals, keep: b.note && b.note.indexOf('KEEP') >= 0 };
    });
    var cand = safeJson_(props_().getProperty('RESTORE_CANDIDATE'), null);
    return { items: items, maintenance: props_().getProperty('MAINTENANCE') === '1', restoreCandidate: cand ? { backupId: cand.backupId, preparedAt: cand.preparedAt, preparedBy: cand.preparedBy } : null, retention: retentionPolicy_() };
}
function backupVerify_(user, req) {
    requirePerm_(user, 'backup.run');
    var row = repoFind_('BackupCatalog', req.payload.id);
    if (!row)
        throw err_('NOT_FOUND', 'Không tìm thấy bản sao lưu.');
    var v = verifyBackupRow_(row);
    withLock_(30000, function () {
        repoSetCell_('BackupCatalog', row._row, 'verifyStatus', v.ok ? 'VERIFIED' : 'FAILED');
        repoSetCell_('BackupCatalog', row._row, 'verifiedAt', nowIso_());
    });
    return v;
}
function retentionPolicy_() { return { daily: Number(cfgGet_('backup.retention.daily', '14')), minVerifiedKept: 3 }; }
function applyRetention_() {
    try {
        var pol = retentionPolicy_(), all = repoValid_('BackupCatalog').sort(function (a, b) { return cmpStr_(b.createdAt, a.createdAt); }), keepV = 0, cnt = { S: 0, O: 0 };
        all.forEach(function (b) {
            var grp = b.trigger === 'SCHEDULED' ? 'S' : 'O', idx = ++cnt[grp];
            var protectedRow = (b.note && b.note.indexOf('KEEP') >= 0) || (b.verifyStatus === 'VERIFIED' && keepV < pol.minVerifiedKept);
            if (b.verifyStatus === 'VERIFIED')
                keepV++;
            if (idx > pol.daily && !protectedRow) {
                try {
                    DriveApp.getFolderById(b.driveFolderId).setTrashed(true);
                }
                catch (e) { }
                withLock_(30000, function () { repoSetCell_('BackupCatalog', b._row, 'isDeleted', 1); });
            }
        });
    }
    catch (e) {
        console.error('RETENTION_FAIL ' + e);
    }
}
function backupRestorePrepare_(user, req) {
    requirePerm_(user, 'backup.restore');
    var p = req.payload, row = repoFind_('BackupCatalog', p.backupId);
    if (!row)
        throw err_('NOT_FOUND', 'Không tìm thấy bản sao lưu.');
    if (!String(p.reason || '').trim())
        throw err_('VALIDATION_FAILED', 'Nhập lý do khôi phục.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do.' }]);
    var checks = [], v = verifyBackupRow_(row);
    checks.push({ name: 'Mã băm & số dòng bản sao lưu', ok: v.ok, detail: v.diffs.join('; ') });
    var m = safeJson_(row.manifestJson, {});
    checks.push({ name: 'Phiên bản schema (' + row.schemaVersion + ' ≤ ' + SCHEMA_VERSION + ')', ok: schemaLte_(row.schemaVersion, SCHEMA_VERSION) });
    if (!checks.every(function (c) { return c.ok; }))
        return { ok: false, checks: checks };
    withLock_(30000, function () {
        if (props_().getProperty('MAINTENANCE') === '1' || props_().getProperty('RESTORE_CANDIDATE'))
            throw err_('STATE_TRANSITION_INVALID', 'Đang có yêu cầu khôi phục chờ xác nhận hoặc hệ thống đang bảo trì. Hãy hủy yêu cầu cũ (backup.cancelRestore) trước.');
        props_().setProperty('MAINTENANCE', '1');
    });
    try {
    var pre = doBackup_(user, 'PRE_RESTORE', 'Trước khôi phục ' + row.id);
    var ts = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmmss');
    var cand = DriveApp.getFileById(row.mainFileId).makeCopy('DB_RESTORE_CANDIDATE_' + ts, driveFolder_('BACKUP_FOLDER_ID', 'CONGNO_BACKUPS'));
    var fp = dbFingerprint_(cand.getId()), bad = [];
    Object.keys(m.sheets.main).forEach(function (n) { if (!fp[n] || fp[n].sha256 !== m.sheets.main[n].sha256)
        bad.push(n); });
    checks.push({ name: 'Bản ứng viên khớp manifest', ok: bad.length === 0, detail: bad.join(', ') });
    var lost = repoReadAll_('AuditLog').filter(function (a) { return a.at > (m.createdAt || '') && a.result === 'OK'; });
    var live = controlTotals_(), diff = {};
    Object.keys(Object.assign({}, live, m.controlTotals)).forEach(function (k) { var a = live[k] || { out: 0 }, b = (m.controlTotals || {})[k] || { out: 0 }; if (a.out !== b.out)
        diff[k] = { live: a.out, backup: b.out, delta: b.out - a.out }; });
    withLock_(30000, function () {
        props_().setProperty('RESTORE_CANDIDATE', JSON.stringify({ candidateId: cand.getId(), backupId: row.id, preparedBy: user.id, preparedAt: nowIso_(), reason: maxStr_(p.reason, 300), controlTotals: m.controlTotals || {}, preBackupId: pre.id }));
        writeAudit_(user, '', '', [{ entityType: 'Backup', entityId: row.id, action: 'backup.restorePrepare', diff: { reason: p.reason } }]);
    });
    return { ok: checks.every(function (c) { return c.ok; }), checks: checks, impact: { lostOperationsSinceBackup: lost.length, sample: lost.slice(-20).map(function (a) { return { at: a.at, by: a.actorEmail, action: a.action }; }), controlTotalsDiff: diff },
        preRestoreBackup: pre.id, maintenance: true, nextStep: 'Người xác nhận thứ hai (vai trò APPROVER, khác người chuẩn bị) gọi backup.switch.' };
    } catch (e) {
        try {
            withLock_(30000, function () { if (!props_().getProperty('RESTORE_CANDIDATE'))
                props_().deleteProperty('MAINTENANCE'); });
        }
        catch (e2) {
            console.error('RESTORE_PREPARE_CLEANUP_FAIL ' + e2);
        }
        throw e;
    }
}
function backupSwitch_(user, req) {
    requirePerm_(user, 'backup.restore');
    return withLock_(30000, function () { return backupSwitchLocked_(user, req); });
}
function backupSwitchLocked_(user, req) {
    requirePerm_(user, 'backup.restore');
    var c = safeJson_(props_().getProperty('RESTORE_CANDIDATE'), null);
    if (!c)
        throw err_('STATE_TRANSITION_INVALID', 'Chưa có bản ứng viên khôi phục.');
    if (c.preparedBy === user.id)
        throw err_('SELF_APPROVAL_FORBIDDEN', 'Cần người thứ hai xác nhận khôi phục.');
    if (user.role !== 'APPROVER')
        throw err_('FORBIDDEN', 'Chỉ Kế toán trưởng/người duyệt được xác nhận chuyển sang bản khôi phục.');
    var row = repoFind_('BackupCatalog', c.backupId), m = safeJson_(row ? row.manifestJson : '', {}), fp = dbFingerprint_(c.candidateId), bad = [];
    Object.keys(m.sheets.main).forEach(function (n) { if (!fp[n] || fp[n].sha256 !== m.sheets.main[n].sha256)
        bad.push(n); });
    if (bad.length)
        throw err_('RESTORE_CANDIDATE_INVALID', 'Bản ứng viên không còn khớp manifest: ' + bad.join(', '));
    var oldId = props_().getProperty('DB_MAIN_ID'), oldPrev = props_().getProperty('DB_MAIN_ID_PREV'), oldTx = props_().getProperty('OPEN_TX');
    props_().setProperty('DB_MAIN_ID_PREV', oldId);
    props_().setProperty('DB_MAIN_ID', c.candidateId);
    props_().setProperty('OPEN_TX', '{}');
    bumpDataVersion_();
    resetMemo_();
    rmInvalidate_();
    var mismatch = [], fail = '';
    try {
        HDR_OK_ = {};
        migrateHeaders_();
        resetMemo_();
        var now = controlTotals_();
        Object.keys(c.controlTotals).forEach(function (k) { var a = now[k] || { out: 0 }; if (a.out !== c.controlTotals[k].out)
            mismatch.push(k); });
    }
    catch (ex) {
        fail = String(ex && (ex.userMessage || ex.message) || ex);
    }
    if (mismatch.length || fail) {
        props_().setProperty('DB_MAIN_ID', oldId);
        if (oldPrev)
            props_().setProperty('DB_MAIN_ID_PREV', oldPrev);
        else
            props_().deleteProperty('DB_MAIN_ID_PREV');
        if (oldTx !== null && oldTx !== undefined)
            props_().setProperty('OPEN_TX', oldTx);
        HDR_OK_ = {};
        bumpDataVersion_();
        resetMemo_();
        rmInvalidate_();
        if (fail) {
            alertAdmin_('Khôi phục thất bại – đã quay lại DB cũ', 'Lỗi khi kiểm tra bản khôi phục: ' + fail);
            throw err_('RESTORE_SMOKE_FAILED', 'Không đọc được bản khôi phục (' + fail + '). Đã tự quay lại DB cũ; yêu cầu khôi phục vẫn còn, có thể hủy.');
        }
        alertAdmin_('Khôi phục thất bại – đã quay lại DB cũ', 'Số kiểm soát lệch: ' + mismatch.join(', '));
        throw err_('RESTORE_SMOKE_FAILED', 'Số kiểm soát sau khôi phục không khớp (' + mismatch.join(', ') + '). Đã tự quay lại DB cũ.');
    }
    props_().deleteProperty('RESTORE_CANDIDATE');
    props_().deleteProperty('MAINTENANCE');
    writeAudit_(user, '', '', [{ entityType: 'Backup', entityId: c.backupId, action: 'backup.switch', diff: { from: oldId, to: c.candidateId } }]);
    alertAdmin_('Khôi phục thành công', 'Bản ' + c.backupId + ' đã được đưa vào sử dụng bởi ' + user.email);
    return { ok: true, switchedTo: c.candidateId, previous: oldId, note: 'DB cũ giữ nguyên (DB_MAIN_ID_PREV) để quay lại bằng backup.rollbackSwitch. Lập báo cáo khoảng hở các thao tác sau thời điểm sao lưu để nhập lại.' };
}
function backupRollbackSwitch_(user, req) {
    requirePerm_(user, 'backup.restore');
    return withLock_(30000, function () { return backupRollbackSwitchLocked_(user, req); });
}
function backupRollbackSwitchLocked_(user, req) {
    requirePerm_(user, 'backup.restore');
    if (user.role !== 'APPROVER')
        throw err_('FORBIDDEN', 'Chỉ Kế toán trưởng/người duyệt được quay lại DB trước.');
    if (!String((req.payload || {}).reason || '').trim())
        throw err_('VALIDATION_FAILED', 'Nhập lý do quay lại DB trước.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do.' }]);
    if (props_().getProperty('MAINTENANCE') === '1' || props_().getProperty('RESTORE_CANDIDATE'))
        throw err_('STATE_TRANSITION_INVALID', 'Đang có yêu cầu khôi phục hoặc bảo trì; hủy trước khi quay lại.');
    var prev = props_().getProperty('DB_MAIN_ID_PREV');
    if (!prev)
        throw err_('STATE_TRANSITION_INVALID', 'Không có DB trước đó để quay lại.');
    var cur = props_().getProperty('DB_MAIN_ID');
    props_().setProperty('DB_MAIN_ID', prev);
    props_().setProperty('DB_MAIN_ID_PREV', cur);
    props_().setProperty('OPEN_TX', '{}');
    bumpDataVersion_();
    resetMemo_();
    rmInvalidate_();
    writeAudit_(user, '', '', [{ entityType: 'Backup', entityId: '', action: 'backup.rollbackSwitch', diff: { to: prev, reason: maxStr_(req.payload.reason, 300) } }]);
    return { ok: true, nowUsing: prev };
}
// ===== Khởi tạo DỮ LIỆU MỚI cho công ty mới (R3.5) =====
// KHÔNG xóa dữ liệu cũ: tạo bộ Google Sheets MỚI (trống, đúng schema), chép sang: người dùng + quyền, danh mục (trừ tài khoản quỹ), danh sách bản sao lưu, cấu hình chung;
// đặt tên/MST/ngày đầu sổ của công ty mới rồi CHUYỂN sang bộ mới. Bộ cũ giữ nguyên trong Drive và quay lại được (company.initRollback). Nhật ký kiểm toán dùng chung (có ghi sự kiện).
// Hai người: một người yêu cầu (gõ cụm xác nhận), người thứ hai có vai trò Kế toán trưởng/Người duyệt xác nhận. Trước khi chuyển luôn sao lưu PRE_INIT.
var INIT_PHRASE_ = 'khoi tao moi';
var INIT_CFG_SKIP_ = /^(seq\.|entity\.|ledgerStartDate$)/;
function companyInitState_() { return safeJson_(props_().getProperty('INIT_REQUEST'), null); }
function companyInitOut_(c) { return c ? { requestedBy: c.requestedByEmail, at: c.at, companyName: c.companyName, shortName: c.shortName, taxCode: c.taxCode, ledgerStartDate: c.ledgerStartDate, keepCatalog: c.keepCatalog, reason: c.reason } : null; }
function companyInitStatus_(user, req) {
    requirePerm_(user, 'backup.restore');
    var prev = safeJson_(props_().getProperty('INIT_PREV'), null);
    return { pending: companyInitOut_(companyInitState_()), canRollback: !!prev, previous: prev ? { at: prev.at, by: prev.byEmail, companyName: prev.companyName } : null, maintenance: props_().getProperty('MAINTENANCE') === '1', phrase: 'KHOI TAO MOI' };
}
function companyInitRequest_(user, req) {
    requirePerm_(user, 'backup.restore');
    var p = req.payload || {}, errs = [];
    if (!String(p.companyName || '').trim())
        errs.push({ path: 'companyName', code: 'REQUIRED', message: 'Nhập tên công ty mới.' });
    if (!isDate_(p.ledgerStartDate))
        errs.push({ path: 'ledgerStartDate', code: 'DATE_INVALID', message: 'Nhập ngày đầu sổ hợp lệ (yyyy-MM-dd).' });
    if (!String(p.reason || '').trim())
        errs.push({ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do khởi tạo.' });
    if (normText_(p.confirmText || '') !== INIT_PHRASE_)
        errs.push({ path: 'confirmText', code: 'CONFIRM_TEXT', message: 'Gõ đúng cụm "KHOI TAO MOI" để xác nhận.' });
    if (errs.length)
        throw err_('VALIDATION_FAILED', 'Chưa đủ thông tin để khởi tạo dữ liệu mới.', errs);
    return withLock_(30000, function () {
        if (props_().getProperty('MAINTENANCE') === '1' || props_().getProperty('RESTORE_CANDIDATE'))
            throw err_('STATE_TRANSITION_INVALID', 'Hệ thống đang bảo trì hoặc có yêu cầu khôi phục chờ xác nhận.');
        if (companyInitState_())
            throw err_('STATE_TRANSITION_INVALID', 'Đã có yêu cầu khởi tạo đang chờ xác nhận. Hủy yêu cầu cũ trước.');
        var c = { requestedBy: user.id, requestedByEmail: user.email, at: nowIso_(), companyName: maxStr_(String(p.companyName).trim(), 200), shortName: maxStr_(String(p.shortName || '').trim(), 60), taxCode: maxStr_(String(p.taxCode || '').trim(), 20), ledgerStartDate: p.ledgerStartDate, keepCatalog: p.keepCatalog !== false, reason: maxStr_(String(p.reason).trim(), 300) };
        props_().setProperty('INIT_REQUEST', JSON.stringify(c));
        writeAudit_(user, '', '', [{ entityType: 'Company', entityId: '', action: 'company.initRequest', diff: { companyName: c.companyName, ledgerStartDate: c.ledgerStartDate, keepCatalog: c.keepCatalog, reason: c.reason } }]);
        return { ok: true, pending: companyInitOut_(c), nextStep: 'Người thứ hai (Kế toán trưởng/Người duyệt, khác người yêu cầu) gọi company.initConfirm.' };
    });
}
function companyInitCancel_(user, req) {
    requirePerm_(user, 'backup.restore');
    return withLock_(30000, function () {
        if (!companyInitState_())
            throw err_('STATE_TRANSITION_INVALID', 'Không có yêu cầu khởi tạo nào đang chờ.');
        props_().deleteProperty('INIT_REQUEST');
        writeAudit_(user, '', '', [{ entityType: 'Company', entityId: '', action: 'company.initCancel', diff: null }]);
        return { ok: true };
    });
}
// Dựng bộ Sheets mới (không đụng DB đang dùng). Trả {mainId, draftId, copied}.
function companyInitBuild_(c) {
    var ts = Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'yyyyMMdd-HHmmss'), oldMain = openDb_('MAIN'), hasDraft = !!props_().getProperty('DB_DRAFT_ID'), oldDraft = hasDraft ? openDb_('DRAFT') : null;
    var main = SpreadsheetApp.create('CONGNO_DB_MAIN_' + ts), draft = hasDraft ? SpreadsheetApp.create('CONGNO_DB_DRAFT_' + ts) : null, made = { mainId: main.getId(), draftId: draft ? draft.getId() : '', copied: {} };
    try {
        Object.keys(TABLES_).forEach(function (t) {
            var home = tableHome_(t);
            if (home === 'AUDIT')
                return;
            var dst = home === 'DRAFT' ? draft : main, src = (home === 'DRAFT' ? oldDraft : oldMain).getSheetByName(t), cols = parseCols_(t), s = dst.insertSheet(t);
            s.getRange(1, 1, 1, cols.length).setValues([cols.map(function (x) { return x.name; })]);
            s.setFrozenRows(1);
            cols.forEach(function (x, i) { s.getRange(1, i + 1, s.getMaxRows(), 1).setNumberFormat(x.type === 's' ? '@' : '0'); });
            var keep = t === 'AppUser' || t === 'BackupCatalog' ? function () { return true; } : t === 'Catalog' ? function (o) { return c.keepCatalog && o.catalogType !== 'CASH_ACCOUNT'; } : t === 'Config' ? function (o) { return !INIT_CFG_SKIP_.test(String(o.id)); } : null;
            if (!keep || !src || src.getLastRow() < 2)
                return;
            var vals = src.getRange(1, 1, src.getLastRow(), cols.length).getValues(), head = vals[0].map(function (x) { return String(x).trim(); }), idx = {}, rows = [];
            head.forEach(function (n, i) { idx[n] = i; });
            for (var r = 1; r < vals.length; r++) {
                var o = {};
                head.forEach(function (n, i) { o[n] = vals[r][i]; });
                if (keep(o))
                    rows.push(cols.map(function (x) { return idx[x.name] === undefined || vals[r][idx[x.name]] === undefined ? '' : vals[r][idx[x.name]]; }));
            }
            if (rows.length) {
                s.getRange(2, 1, rows.length, cols.length).setValues(rows);
                made.copied[t] = rows.length;
            }
        });
        [main, draft].forEach(function (ss) { if (ss) {
            var d = ss.getSheetByName('Sheet1') || ss.getSheetByName('Trang tính1');
            if (d && ss.getSheets().length > 1)
                ss.deleteSheet(d);
        } });
    }
    catch (e) {
        companyInitTrash_(made);
        throw e;
    }
    return made;
}
function companyInitTrash_(made) { try {
    [made.mainId, made.draftId].forEach(function (id) { if (id)
        DriveApp.getFileById(id).setTrashed(true); });
}
catch (e) {
    console.error('INIT_TRASH_FAIL ' + e);
} }
function companyInitConfirm_(user, req) {
    requirePerm_(user, 'backup.restore');
    if (user.role !== 'APPROVER')
        throw err_('FORBIDDEN', 'Chỉ Kế toán trưởng/người duyệt được xác nhận khởi tạo dữ liệu mới.');
    var p = req.payload || {};
    if (normText_(p.confirmText || '') !== INIT_PHRASE_)
        throw err_('VALIDATION_FAILED', 'Gõ đúng cụm "KHOI TAO MOI" để xác nhận.', [{ path: 'confirmText', code: 'CONFIRM_TEXT', message: 'Gõ đúng cụm "KHOI TAO MOI".' }]);
    var c = null;
    withLock_(30000, function () {
        c = companyInitState_();
        if (!c)
            throw err_('STATE_TRANSITION_INVALID', 'Không có yêu cầu khởi tạo nào đang chờ.');
        if (c.requestedBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Cần người thứ hai xác nhận khởi tạo dữ liệu mới.');
        if (props_().getProperty('MAINTENANCE') === '1' || props_().getProperty('RESTORE_CANDIDATE'))
            throw err_('STATE_TRANSITION_INVALID', 'Hệ thống đang bảo trì hoặc có yêu cầu khôi phục chờ xác nhận.');
        props_().setProperty('MAINTENANCE', '1');
    });
    var made = null, pre = null;
    try {
        pre = doBackup_(user, 'PRE_INIT', 'Trước khi khởi tạo dữ liệu công ty mới: ' + c.companyName);
        made = companyInitBuild_(c);
        return withLock_(30000, function () { return companyInitSwitch_(user, c, made, pre); });
    }
    catch (e) {
        if (made && props_().getProperty('DB_MAIN_ID') !== made.mainId)
            companyInitTrash_(made);
        try {
            withLock_(30000, function () { if (!props_().getProperty('RESTORE_CANDIDATE'))
                props_().deleteProperty('MAINTENANCE'); });
        }
        catch (e2) {
            console.error('INIT_CLEANUP_FAIL ' + e2);
        }
        throw e;
    }
}
function companyInitSwitch_(user, c, made, pre) {
    var p = props_(), old = { main: p.getProperty('DB_MAIN_ID'), draft: p.getProperty('DB_DRAFT_ID') || '', tx: p.getProperty('OPEN_TX'), name: maxStr_(cfgGet_('entity.name', ''), 200) };
    function setIds_(mainId, draftId) { p.setProperty('DB_MAIN_ID', mainId); if (draftId)
        p.setProperty('DB_DRAFT_ID', draftId); }
    function revert_() { setIds_(old.main, old.draft); if (old.tx !== null && old.tx !== undefined)
        p.setProperty('OPEN_TX', old.tx); HDR_OK_ = {}; bumpDataVersion_(); resetMemo_(); rmInvalidate_(); }
    setIds_(made.mainId, made.draftId);
    p.setProperty('OPEN_TX', '{}');
    bumpDataVersion_();
    resetMemo_();
    rmInvalidate_();
    try {
        HDR_OK_ = {};
        var bad = schemaProblems_();
        if (bad.length)
            throw new Error('Schema lệch: ' + bad.slice(0, 3).join('; '));
        var now = nowIso_(), sys = { createdAt: now, createdBy: user.id, updatedAt: now, updatedBy: user.id, version: 1, isDeleted: 0, commitState: 'C', txId: '' };
        repoAppend_('Config', [['ledgerStartDate', c.ledgerStartDate], ['entity.name', c.companyName], ['entity.shortName', c.shortName], ['entity.taxCode', c.taxCode]].map(function (kv) { return Object.assign({ id: kv[0], value: kv[1] }, sys); }));
        seedDefaults_();
        resetMemo_();
        if (!repoValid_('AppUser').some(function (u) { return u.id === user.id; }))
            throw new Error('Người xác nhận không còn trong danh sách người dùng của bộ dữ liệu mới.');
    }
    catch (e) {
        revert_();
        companyInitTrash_(made);
        alertAdmin_('Khởi tạo dữ liệu mới thất bại – đã quay lại DB cũ', String(e && (e.userMessage || e.message) || e));
        throw err_('INIT_FAILED', 'Khởi tạo thất bại, đã tự quay lại dữ liệu cũ: ' + String(e && (e.userMessage || e.message) || e).slice(0, 200));
    }
    p.setProperty('INIT_PREV', JSON.stringify({ main: old.main, draft: old.draft, at: nowIso_(), byEmail: user.email, companyName: old.name, preBackup: pre && pre.id || '' }));
    p.deleteProperty('INIT_REQUEST');
    p.deleteProperty('MAINTENANCE');
    writeAudit_(user, '', '', [{ entityType: 'Company', entityId: '', action: 'company.init', diff: { companyName: c.companyName, ledgerStartDate: c.ledgerStartDate, keepCatalog: c.keepCatalog, from: old.main, to: made.mainId, preBackup: pre && pre.id || '', copied: made.copied } }]);
    alertAdmin_('Đã khởi tạo dữ liệu mới', 'Công ty mới: ' + c.companyName + ' · bởi ' + user.email + ' · dữ liệu cũ giữ nguyên (quay lại bằng company.initRollback).');
    return { ok: true, companyName: c.companyName, ledgerStartDate: c.ledgerStartDate, copied: made.copied, previousMain: old.main, preBackup: pre && pre.id || '', note: 'Dữ liệu cũ giữ nguyên trong Drive. Hãy đăng nhập lại / tải lại trang. Nhập tài khoản quỹ, đối tác, số dư đầu kỳ cho công ty mới.' };
}
function companyInitRollback_(user, req) {
    requirePerm_(user, 'backup.restore');
    if (user.role !== 'APPROVER')
        throw err_('FORBIDDEN', 'Chỉ Kế toán trưởng/người duyệt được quay lại dữ liệu trước khi khởi tạo.');
    if (!String((req.payload || {}).reason || '').trim())
        throw err_('VALIDATION_FAILED', 'Nhập lý do quay lại.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do.' }]);
    return withLock_(30000, function () {
        var p = props_(), prev = safeJson_(p.getProperty('INIT_PREV'), null);
        if (!prev)
            throw err_('STATE_TRANSITION_INVALID', 'Không có bộ dữ liệu trước đó để quay lại.');
        if (p.getProperty('MAINTENANCE') === '1' || p.getProperty('RESTORE_CANDIDATE'))
            throw err_('STATE_TRANSITION_INVALID', 'Đang bảo trì hoặc có yêu cầu khôi phục; hủy trước khi quay lại.');
        // Còn giao dịch đang mở ở bộ hiện tại: đổi con trỏ DB lúc này sẽ bỏ rơi chúng (ghi dở vào bộ đang rời đi) → từ chối, chờ xong rồi quay lại.
        if (Object.keys(safeJson_(p.getProperty('OPEN_TX'), {})).length)
            throw err_('STATE_TRANSITION_INVALID', 'Còn giao dịch đang xử lý; chờ hoàn tất rồi quay lại.');
        var cur = { main: p.getProperty('DB_MAIN_ID'), draft: p.getProperty('DB_DRAFT_ID') || '', name: maxStr_(cfgGet_('entity.name', ''), 200) };
        p.setProperty('MAINTENANCE', '1');
        try {
            p.setProperty('DB_MAIN_ID', prev.main);
            if (prev.draft)
                p.setProperty('DB_DRAFT_ID', prev.draft);
            p.setProperty('INIT_PREV', JSON.stringify({ main: cur.main, draft: cur.draft, at: nowIso_(), byEmail: user.email, companyName: cur.name, preBackup: '' }));
            p.setProperty('OPEN_TX', '{}');
            HDR_OK_ = {};
            bumpDataVersion_();
            resetMemo_();
            rmInvalidate_();
            writeAudit_(user, '', '', [{ entityType: 'Company', entityId: '', action: 'company.initRollback', diff: { to: prev.main, reason: maxStr_(req.payload.reason, 300) } }]);
        }
        finally {
            p.deleteProperty('MAINTENANCE');
        }
        return { ok: true, nowUsing: prev.main };
    });
}
function backupCancelRestore_(user, req) {
    requirePerm_(user, 'backup.restore');
    return withLock_(30000, function () { return backupCancelRestoreLocked_(user, req); });
}
function backupCancelRestoreLocked_(user, req) {
    requirePerm_(user, 'backup.restore');
    var cand = safeJson_(props_().getProperty('RESTORE_CANDIDATE'), null);
    if (cand && cand.candidateId && cand.candidateId !== props_().getProperty('DB_MAIN_ID')) {
        try {
            DriveApp.getFileById(cand.candidateId).setTrashed(true);
        }
        catch (e) {
            console.error('CANDIDATE_TRASH_FAIL ' + e);
        }
    }
    props_().deleteProperty('RESTORE_CANDIDATE');
    props_().deleteProperty('MAINTENANCE');
    writeAudit_(user, '', '', [{ entityType: 'Backup', entityId: '', action: 'backup.cancelRestore', diff: null }]);
    return { ok: true };
}
var COUNTED_DOC_STATUS_ = { POSTED: 1, REVERSED: 1 };
// Ngày đưa chứng từ vào sổ công nợ. Mặc định (POSTING) = NGÀY GHI NHẬN, nên ghi nhận muộn không làm đổi sổ đã chốt ở ngày trước.
// Chế độ DOC (tham số dateBasis: 'DOC' trên các lệnh đọc) = ngày chứng từ; chỉ để xem/đối chiếu, báo cáo ghi rõ cơ sở ngày.
var DATE_BASIS_ = 'POSTING';
function docEffDate_(d) {
    if (DATE_BASIS_ !== 'DOC' && COUNTED_DOC_STATUS_[d.status] && d.postingDate)
        return d.postingDate;
    return d.docDate || d.postingDate || '';
}
function computeBalances(docs, lines, allocs, asOf) {
    var docMap = {}, byLine = {}, byDoc = {};
    docs.forEach(function (d) { if (COUNTED_DOC_STATUS_[d.status] && docEffDate_(d) <= asOf)
        docMap[d.id] = d; });
    lines.forEach(function (l) {
        var d = docMap[l.docId];
        if (!d)
            return;
        if (l.adjustsLineId)
            return;
        byLine[l.id] = { gross: l.grossMinor, adjust: 0, alloc: 0, out: 0, docId: l.docId };
    });
    lines.forEach(function (l) {
        var d = docMap[l.docId];
        if (!d || !l.adjustsLineId)
            return;
        if (byLine[l.adjustsLineId])
            byLine[l.adjustsLineId].adjust += l.grossMinor;
    });
    allocs.forEach(function (a) {
        if (a.effectiveDate > asOf)
            return;
        if (byLine[a.debtLineId])
            byLine[a.debtLineId].alloc += a.amountMinor;
    });
    Object.keys(byLine).forEach(function (id) {
        var b = byLine[id];
        b.out = b.gross + b.adjust - b.alloc;
        var D = byDoc[b.docId] = byDoc[b.docId] || { gross: 0, adjust: 0, alloc: 0, out: 0 };
        D.gross += b.gross;
        D.adjust += b.adjust;
        D.alloc += b.alloc;
        D.out += b.out;
    });
    Object.keys(byDoc).forEach(function (id) { byDoc[id].status = payStatus_(byDoc[id]); });
    Object.keys(byLine).forEach(function (id) { byLine[id].status = payStatus_(byLine[id]); });
    return { byLine: byLine, byDoc: byDoc };
}
function payStatus_(b) {
    var total = b.gross + b.adjust;
    if (b.out < 0)
        return 'CREDIT';
    if (b.out === 0)
        return total === 0 && b.alloc === 0 ? 'ZERO' : 'PAID';
    return b.alloc === 0 ? 'UNPAID' : 'PARTIAL';
}
function paymentBalances(payments, allocs, asOf) {
    var out = {};
    payments.forEach(function (p) {
        if (p.status !== 'POSTED' && p.status !== 'REVERSED')
            return;
        if (p.effectiveDate > asOf)
            return;
        var amt = p.amountMinor;
        if (p.status === 'REVERSED' && p.reversedDate && p.reversedDate <= asOf)
            amt = 0;
        out[p.id] = { amount: amt, alloc: 0, unalloc: 0 };
    });
    allocs.forEach(function (a) {
        if (a.effectiveDate > asOf || !a.paymentId || !out[a.paymentId])
            return;
        out[a.paymentId].alloc += a.amountMinor;
    });
    Object.keys(out).forEach(function (id) { out[id].unalloc = out[id].amount - out[id].alloc; });
    return out;
}
function agingBucket(dueDate, asOf) {
    if (!dueDate)
        return 'MISSING_DUE';
    var d = daysBetween_(dueDate, asOf);
    if (d <= 0)
        return 'NOT_DUE';
    if (d <= 30)
        return 'D1_30';
    if (d <= 60)
        return 'D31_60';
    if (d <= 90)
        return 'D61_90';
    return 'D90P';
}
var AGING_BUCKETS = ['NOT_DUE', 'D1_30', 'D31_60', 'D61_90', 'D90P', 'MISSING_DUE'];
var AGING_LABELS = { NOT_DUE: 'Chưa đến hạn', D1_30: '1–30 ngày', D31_60: '31–60 ngày', D61_90: '61–90 ngày', D90P: 'Trên 90 ngày', MISSING_DUE: 'Chưa xác định hạn' };
function checkAllocation(payment, unalloc, items, effectiveDate) {
    var errs = [], total = 0;
    if (payment.status !== 'POSTED')
        errs.push({ path: 'paymentId', code: 'PAYMENT_NOT_POSTED', message: 'Phiếu chưa được ghi nhận.' });
    items.forEach(function (it, i) {
        var p = 'items[' + i + ']';
        if (!Number.isSafeInteger(it.amount) || it.amount <= 0) {
            errs.push({ path: p + '.amountMinor', code: 'AMOUNT_INVALID', message: 'Số tiền phân bổ phải là số nguyên dương.' });
            return;
        }
        total += it.amount;
        if (!it.line || !it.doc) {
            errs.push({ path: p + '.debtLineId', code: 'NOT_FOUND', message: 'Không tìm thấy dòng phí.' });
            return;
        }
        if (it.doc.partnerId !== payment.partnerId)
            errs.push({ path: p + '.debtLineId', code: 'PARTNER_MISMATCH', message: 'Chứng từ thuộc đối tác khác với phiếu.' });
        if (it.doc.currency !== payment.currency)
            errs.push({ path: p + '.debtLineId', code: 'CURRENCY_MISMATCH', message: 'Khác tiền tệ (' + it.doc.currency + ' ≠ ' + payment.currency + ').' });
        if ((payment.direction === 'IN' && it.doc.direction !== 'AR') || (payment.direction === 'OUT' && it.doc.direction !== 'AP'))
            errs.push({ path: p + '.debtLineId', code: 'DIRECTION_MISMATCH', message: 'Phiếu thu chỉ phân bổ cho phải thu, phiếu chi cho phải trả.' });
        if (it.doc.status !== 'POSTED')
            errs.push({ path: p + '.debtLineId', code: 'DOC_NOT_POSTED', message: 'Chứng từ chưa ghi nhận.' });
        if (effectiveDate < docEffDate_(it.doc))
            errs.push({ path: p + '.debtLineId', code: 'DATE_BEFORE_DOC', message: 'Ngày phân bổ trước ngày chứng từ.' });
        if (it.amount > it.outFuture)
            errs.push({ path: p + '.amountMinor', code: 'ALLOC_OVER_LINE', message: 'Vượt số dư dòng: còn ' + it.outFuture + ', đề nghị ' + it.amount + '.' });
    });
    if (total > unalloc)
        errs.push({ path: 'items', code: 'ALLOC_OVER_PAYMENT', message: 'Vượt số tiền chưa phân bổ của phiếu: còn ' + unalloc + ', đề nghị ' + total + '.' });
    var seen = {};
    items.forEach(function (it, i) { if (it.line) {
        if (seen[it.line.id])
            errs.push({ path: 'items[' + i + '].debtLineId', code: 'DUPLICATE_LINE', message: 'Dòng phí bị chọn hai lần.' });
        seen[it.line.id] = 1;
    } });
    return errs;
}
function suggestFifo(unalloc, candidates) {
    var left = unalloc, out = [];
    candidates.slice().sort(function (a, b) { return cmpStr_(docEffDate_(a.doc) || '9999', docEffDate_(b.doc) || '9999') || (a.line.lineNo - b.line.lineNo); })
        .forEach(function (c) {
        if (left <= 0 || c.out <= 0)
            return;
        var take = Math.min(left, c.out);
        out.push({ debtLineId: c.line.id, amountMinor: take });
        left -= take;
    });
    return { items: out, remaining: left };
}
function suggestMatch(row, cands) {
    var text = normText_((row.description || '') + ' ' + (row.docRef || '')), amount = row.amountMinor, tokens = {};
    var byDoc = {};
    cands.forEach(function (c) { if (c.out > 0) {
        var d = byDoc[c.docId] = byDoc[c.docId] || { docId: c.docId, docNo: c.docNo, invoiceNo: c.invoiceNo, svc: c.svc, docDate: c.docDate, out: 0, lines: [] };
        d.out += c.out;
        d.lines.push(c);
    } });
    var docs = Object.keys(byDoc).map(function (k) { return byDoc[k]; });
    function mentioned(d) { return [d.invoiceNo, d.docNo, d.svc].some(function (t) { var n = normText_(t); return n.length >= 3 && (' ' + text + ' ').indexOf(' ' + n + ' ') >= 0; }); }
    function take(list, limit) {
        var left = limit, items = [];
        list.slice().sort(function (a, b) { return cmpStr_(a.docDate || '9999', b.docDate || '9999') || cmpStr_(a.docNo, b.docNo); }).forEach(function (d) {
            d.lines.slice().sort(function (a, b) { return cmpStr_(a.debtLineId, b.debtLineId); }).forEach(function (l) { if (left <= 0)
                return; var t = Math.min(left, l.out); items.push({ debtLineId: l.debtLineId, docId: l.docId, docNo: d.docNo, amountMinor: t }); left -= t; });
        });
        return { items: items, remaining: left };
    }
    var refDocs = docs.filter(mentioned), refSum = refDocs.reduce(function (s, d) { return s + d.out; }, 0);
    if (refDocs.length && refSum === amount)
        return { basis: 'REF_EXACT', confidence: 'HIGH', items: take(refDocs, amount).items, remaining: 0 };
    var exact = docs.filter(function (d) { return d.out === amount; });
    if (exact.length === 1)
        return { basis: 'AMOUNT_EXACT', confidence: 'HIGH', items: take(exact, amount).items, remaining: 0 };
    if (refDocs.length) {
        var t = take(refDocs, amount);
        return { basis: 'REF_PARTIAL', confidence: 'MEDIUM', items: t.items, remaining: t.remaining };
    }
    if (!docs.length)
        return { basis: 'NONE', confidence: 'NONE', items: [], remaining: amount };
    var f = take(docs, amount);
    return { basis: 'FIFO', confidence: 'LOW', items: f.items, remaining: f.remaining };
}
var DOC_TYPES_NEW_ = ['INVOICE', 'DEBIT_NOTE', 'VENDOR_STATEMENT'];
var VAT_MODES_ = ['NONE', 'EXCLUSIVE', 'UNCONFIRMED'];
var DUE_SOURCES_ = ['NONE', 'CONTRACT', 'PARTNER_TERM', 'MANUAL'];
// R35: SL (số lượng, tối đa 3 số lẻ; lưu ở cột containerQty cho tương thích dữ liệu cũ) × đơn giá (tối đa 4 số lẻ, đơn vị chính của tiền tệ) = thành tiền. Tính bằng BigInt, làm tròn half-up.
function decStr_(n) { var t = String(n); return /e/i.test(t) ? '' : t; }
function scaledInt_(n, scale) { var t = decStr_(n), m = /^(\d+)(?:\.(\d+))?$/.exec(t); if (!m || (m[2] || '').length > scale)
    return null; return BigInt(m[1] + ((m[2] || '') + '0000000000').slice(0, scale)); }
function mulQtyPrice_(qty, price, dec) {
    var q = scaledInt_(qty, 3), u = scaledInt_(price, 4);
    if (q === null || u === null)
        return null;
    var den = BigInt(10000000), num = q * u * BigInt(Math.pow(10, dec));
    return Number((num * BigInt(2) + den) / (den * BigInt(2)));
}
// Đọc số thập phân từ ô nhập hàng loạt: "2,5", "1.234,5678", "5000", "12.5" (dấu chấm đơn + 1–2 số lẻ coi là thập phân). null = trống; NaN = sai.
function parseDecText_(s, maxDec) {
    s = String(s === undefined || s === null ? '' : s).replace(/\s/g, '');
    if (!s)
        return null;
    var ip, fp = '', cm = s.indexOf(',');
    if (cm >= 0) {
        ip = s.slice(0, cm).replace(/\./g, '');
        fp = s.slice(cm + 1);
    }
    else if (/^\d+\.\d{1,4}$/.test(s) && s.split('.')[1].length <= maxDec && s.split('.')[1].length !== 3) {
        ip = s.split('.')[0];
        fp = s.split('.')[1];
    }
    else
        ip = s.replace(/\./g, '');
    if (!/^\d+$/.test(ip) || (fp !== '' && !/^\d+$/.test(fp)) || fp.length > maxDec)
        return NaN;
    return Number(ip + (fp ? '.' + fp : ''));
}
function calcLine_(l, idx, allowNegative, cur) {
    var errs = [], p = 'lines[' + idx + ']';
    var net = l.netMinor;
    if (!Number.isSafeInteger(net))
        errs.push({ path: p + '.netMinor', code: 'AMOUNT_INVALID', message: 'Số tiền phải là số nguyên (đơn vị nhỏ nhất).' });
    else if (Math.abs(net) > MONEY_MAX)
        errs.push({ path: p + '.netMinor', code: 'AMOUNT_OVERFLOW', message: 'Số tiền quá lớn.' });
    else if (!allowNegative && net <= 0)
        errs.push({ path: p + '.netMinor', code: 'AMOUNT_NOT_POSITIVE', message: 'Số tiền phải lớn hơn 0.' });
    var mode = l.vatMode || '';
    if (VAT_MODES_.indexOf(mode) < 0)
        errs.push({ path: p + '.vatMode', code: 'TAX_REQUIRED', message: 'Chọn chế độ thuế: không chịu thuế / có thuế suất / chưa xác nhận.' });
    // R35 (chị chốt 26/10, mục 6A): khoản thu hộ / chi hộ KHÔNG chịu thuế — chỉ ghi và ghép theo tiền gốc.
    if (l.isPassThrough && mode !== 'NONE' && VAT_MODES_.indexOf(mode) >= 0)
        errs.push({ path: p + '.vatMode', code: 'PASS_THROUGH_VAT', message: 'Khoản thu hộ / chi hộ không tính VAT: chọn "không chịu thuế" (VAT của khoản gốc thuộc hóa đơn đứng tên khách hàng).' });
    var vat = 0, rate = null;
    if (mode === 'EXCLUSIVE') {
        if (!Number.isInteger(l.vatRateBp) || l.vatRateBp < 0 || l.vatRateBp > 3000)
            errs.push({ path: p + '.vatRateBp', code: 'TAX_RATE_INVALID', message: 'Thuế suất không hợp lệ (0–30%).' });
        else {
            rate = l.vatRateBp;
            if (!errs.length)
                vat = vatMinor(net, rate);
        }
    }
    var cq = l.containerQty, up = l.unitPrice, hasQ = cq !== null && cq !== undefined && cq !== '', hasU = up !== null && up !== undefined && up !== '';
    if (hasQ && (typeof cq !== 'number' || !isFinite(cq) || cq < 0 || scaledInt_(cq, 3) === null))
        errs.push({ path: p + '.containerQty', code: 'QTY_INVALID', message: 'Số lượng phải là số ≥ 0, tối đa 3 số lẻ, hoặc để trống.' });
    if (hasU && (typeof up !== 'number' || !isFinite(up) || up < 0 || scaledInt_(up, 4) === null))
        errs.push({ path: p + '.unitPrice', code: 'UNIT_PRICE_INVALID', message: 'Đơn giá phải là số ≥ 0, tối đa 4 số lẻ, hoặc để trống.' });
    else if (hasU && !hasQ)
        errs.push({ path: p + '.unitPrice', code: 'UNIT_PRICE_NEEDS_QTY', message: 'Có đơn giá thì phải nhập số lượng.' });
    else if (hasU && hasQ && cur && Number.isSafeInteger(net) && !errs.some(function (e) { return e.path === p + '.containerQty'; })) {
        var expect = mulQtyPrice_(cq, up, (currencyMap_()[cur] || { decimals: 0 }).decimals);
        if (expect === null || expect !== net)
            errs.push({ path: p + '.netMinor', code: 'NET_MISMATCH', message: 'Thành tiền phải bằng số lượng × đơn giá' + (expect === null ? '' : ' (= ' + fmtMoney_(expect, cur) + ')') + '.' });
    }
    if (!String(l.description || '').trim())
        errs.push({ path: p + '.description', code: 'REQUIRED', message: 'Nhập diễn giải.' });
    if (String(l.description || '').length > 1000)
        errs.push({ path: p + '.description', code: 'TOO_LONG', message: 'Diễn giải tối đa 1000 ký tự.' });
    if (!l.feeTypeCode)
        errs.push({ path: p + '.feeTypeCode', code: 'REQUIRED', message: 'Chọn loại phí.' });
    var gross = Number.isSafeInteger(net) ? net + vat : 0;
    return { errors: errs, line: {
            lineNo: idx + 1, feeTypeCode: l.feeTypeCode || '', description: maxStr_(l.description, 1000), serviceFileId: '', serviceCode: String(l.serviceCode || '').trim().toUpperCase().slice(0, 30), shipmentRefId: l.shipmentRefId || '',
            containerQty: (cq === '' || cq === undefined) ? null : cq, unitPrice: hasU ? up : null, netMinor: net, vatMode: mode, vatRateBp: rate, vatMinor: vat, grossMinor: gross,
            isPassThrough: l.isPassThrough ? 1 : 0, adjustsLineId: l.adjustsLineId || '', statementPeriod: l.statementPeriod || '', lotNote: maxStr_(l.lotNote, 200),
            taxConfirmedBy: ''
        } };
}
function validateDocInput_(inp, env) {
    var errs = [];
    function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
    var direction = inp.direction;
    if (direction !== 'AR' && direction !== 'AP')
        E('direction', 'REQUIRED', 'Chọn chiều công nợ (phải thu/phải trả).');
    var docType = inp.docType || 'INVOICE';
    if (DOC_TYPES_NEW_.indexOf(docType) < 0)
        E('docType', 'INVALID', 'Loại chứng từ không hợp lệ.');
    var partner = env.partner;
    if (!partner)
        E('partnerId', 'REQUIRED', 'Chọn đối tác.');
    else {
        if (partner.status !== 'ACTIVE')
            E('partnerId', 'PARTNER_INACTIVE', 'Đối tác đã ngừng sử dụng.');
        if (direction === 'AR' && !partner.isCustomer)
            E('partnerId', 'PARTNER_ROLE', 'Đối tác không có vai trò khách hàng.');
        if (direction === 'AP' && !partner.isSupplier)
            E('partnerId', 'PARTNER_ROLE', 'Đối tác không có vai trò nhà cung cấp.');
    }
    if (!env.currencies[inp.currency])
        E('currency', 'REQUIRED', 'Chọn tiền tệ.');
    if (!inp.businessGroupCode || env.groups.indexOf(inp.businessGroupCode) < 0)
        E('businessGroupCode', 'REQUIRED', 'Chọn nhóm nghiệp vụ.');
    if (!isDate_(inp.docDate))
        E('docDate', 'DATE_INVALID', 'Nhập ngày chứng từ hợp lệ (dd/MM/yyyy).');
    else if (env.ledgerStart && inp.docDate < env.ledgerStart)
        E('docDate', 'DATE_BEFORE_LEDGER_START', 'Ngày chứng từ trước ngày đầu sổ (' + env.ledgerStart + '); khoản này phải nhập ở màn hình dư đầu kỳ.');
    ['invoiceDate', 'dueDate', 'expectedPayDate'].forEach(function (f) { if (inp[f] && !isDate_(inp[f]))
        E(f, 'DATE_INVALID', 'Ngày không hợp lệ.'); });
    if (inp.statementPeriod && !isMonth_(inp.statementPeriod))
        E('statementPeriod', 'PERIOD_INVALID', 'Kỳ quyết toán dạng yyyy-MM.');
    var dueSource = inp.dueDateSource || 'NONE';
    if (DUE_SOURCES_.indexOf(dueSource) < 0)
        E('dueDateSource', 'INVALID', 'Căn cứ hạn không hợp lệ.');
    if (inp.dueDate && dueSource === 'NONE')
        E('dueDateSource', 'DUE_SOURCE_REQUIRED', 'Có ngày đến hạn thì phải chọn căn cứ (hợp đồng/điều khoản/nhập tay).');
    if (!inp.dueDate && dueSource !== 'NONE')
        dueSource = 'NONE';
    ['invoiceNo', 'invoiceSerial', 'statusNote', 'batchLabel'].forEach(function (f) { if (String(inp[f] || '').length > 200)
        E(f, 'TOO_LONG', 'Tối đa 200 ký tự.'); });
    var lines = [], total = 0, rawLines = inp.lines || [];
    if (!rawLines.length)
        E('lines', 'REQUIRED', 'Cần ít nhất một dòng phí.');
    if (rawLines.length > 200)
        E('lines', 'TOO_MANY', 'Tối đa 200 dòng phí.');
    rawLines.forEach(function (l, i) {
        var r = calcLine_(l, i, false, inp.currency);
        if (env.feeTypes && l.feeTypeCode && env.feeTypes.indexOf(l.feeTypeCode) < 0)
            r.errors.push({ path: 'lines[' + i + '].feeTypeCode', code: 'INVALID', message: 'Loại phí không tồn tại.' });
        if (env.serviceCodes && r.line.serviceCode && env.serviceCodes.indexOf(r.line.serviceCode) < 0)
            r.errors.push({ path: 'lines[' + i + '].serviceCode', code: 'INVALID', message: 'Mã dịch vụ không tồn tại hoặc đã ngừng dùng.' });
        r.errors.forEach(function (e) { errs.push(e); });
        lines.push(r.line);
        total += r.line.grossMinor;
    });
    if (Math.abs(total) > MONEY_MAX)
        E('lines', 'AMOUNT_OVERFLOW', 'Tổng tiền quá lớn.');
    return { errors: errs, lines: lines, doc: {
            direction: direction, docType: docType, partnerId: partner ? partner.id : '', currency: inp.currency, businessGroupCode: inp.businessGroupCode,
            docDate: inp.docDate || '', invoiceNo: maxStr_(inp.invoiceNo, 200).trim(), invoiceSerial: maxStr_(inp.invoiceSerial, 200).trim(), invoiceDate: inp.invoiceDate || '',
            statementPeriod: inp.statementPeriod || '', dueDate: inp.dueDate || '', dueDateSource: dueSource, expectedPayDate: inp.expectedPayDate || '',
            statusNote: maxStr_(inp.statusNote, 500), batchLabel: maxStr_(inp.batchLabel, 100), totalGrossMinor: total
        } };
}
function findDuplicateDocs_(doc, existing, selfId) {
    var out = [];
    existing.forEach(function (d) {
        if (d.id === selfId || d.partnerId !== doc.partnerId || d.currency !== doc.currency || d.status === 'DELETED')
            return;
        if (doc.invoiceNo && d.invoiceNo === doc.invoiceNo && (d.invoiceSerial || '') === (doc.invoiceSerial || ''))
            out.push({ id: d.id, docNo: d.docNo, reason: 'Cùng số hóa đơn' });
        else if (d.docDate === doc.docDate && d.totalGrossMinor === doc.totalGrossMinor && d.direction === doc.direction)
            out.push({ id: d.id, docNo: d.docNo, reason: 'Cùng ngày và số tiền' });
    });
    return out;
}
function docWarnings_(doc, lines, bal) {
    var w = [];
    if (bal && bal.out > 0 && !doc.dueDate)
        w.push({ code: 'W-DUE', message: 'Chưa có ngày đến hạn' });
    if (lines.some(function (l) { return l.vatMode === 'UNCONFIRMED'; }))
        w.push({ code: 'W-TAX', message: 'Thuế chưa xác nhận' });
    var dup = safeJson_(doc.warningsJson, null);
    if (dup && dup.duplicates && dup.duplicates.length && !dup.acknowledged)
        w.push({ code: 'W-DUP', message: 'Nghi trùng với ' + dup.duplicates.map(function (x) { return x.docNo || x.id; }).join(', ') });
    return w;
}
function allocateMinor(total, weights) {
    var sumW = weights.reduce(function (a, b) { return a + b; }, 0);
    if (!Number.isSafeInteger(total) || !weights.length || !(sumW > 0) || weights.some(function (w) { return !Number.isSafeInteger(w) || w < 0; }))
        throw new Error('allocateMinor: đầu vào không hợp lệ');
    var neg = total < 0, T = Math.abs(total), base = [], rem = [], used = 0;
    weights.forEach(function (w, i) { var num = BigInt(T) * BigInt(w), q = num / BigInt(sumW); base.push(Number(q)); rem.push({ i: i, r: Number(num - q * BigInt(sumW)) }); used += Number(q); });
    rem.sort(function (a, b) { return b.r - a.r || a.i - b.i; });
    for (var k = 0; k < T - used; k++)
        base[rem[k].i]++;
    return base.map(function (x) { return neg ? -x : x; });
}
var FOLLOW_KINDS_ = ['PROMISE', 'DISPUTE', 'NOTE', 'CALL', 'REMINDER_SENT', 'STATEMENT_SENT'];
function buildOverview_(led, followups, asOf, partnersById) {
    var res = { AR: {}, AP: {} }, byDoc = {};
    led.lines.forEach(function (l) {
        var d = led.docById[l.docId], b = led.bal.byLine[l.id];
        if (!b || b.out <= 0)
            return;
        var dir = d.direction, key = d.partnerId + '|' + d.currency, it = res[dir][key] = res[dir][key] || { partnerId: d.partnerId, partnerName: partnerName_(led.pm, d.partnerId), currency: d.currency, outstanding: 0, overdue: 0, overdueMaxDays: 0, dueSoon7: 0, notDue: 0, missingDue: 0, docs: [] };
        it.outstanding += b.out;
        var dk = d.id, doc = byDoc[dk];
        if (!doc) {
            doc = byDoc[dk] = { docId: d.id, docNo: d.docNo, invoiceNo: d.invoiceNo, dueDate: d.dueDate, out: 0, days: d.dueDate ? daysBetween_(d.dueDate, asOf) : null, key: dir + '|' + key };
            it.docs.push(doc);
        }
        doc.out += b.out;
        if (!d.dueDate)
            it.missingDue += b.out;
        else {
            var days = daysBetween_(d.dueDate, asOf);
            if (days > 0) {
                it.overdue += b.out;
                it.overdueMaxDays = Math.max(it.overdueMaxDays, days);
            }
            else if (days >= -7)
                it.dueSoon7 += b.out;
            else
                it.notDue += b.out;
        }
    });
    var fu = groupBy_(followups.filter(function (f) { return !f.followDate || f.followDate <= asOf; }), function (f) { return f.direction + '|' + f.partnerId; });
    ['AR', 'AP'].forEach(function (dir) {
        Object.keys(res[dir]).forEach(function (k) {
            var it = res[dir][k], list = (fu[dir + '|' + it.partnerId] || []).sort(function (a, b) { return cmpStr_(b.followDate, a.followDate) || cmpStr_(b.id, a.id); });
            var promise = list.filter(function (f) { return f.kind === 'PROMISE' && f.status === 'OPEN' && f.currency === it.currency; })[0];
            it.promise = promise ? { date: promise.promisedDate, amountMinor: promise.promisedAmountMinor, broken: promise.promisedDate < asOf && it.overdue > 0, id: promise.id } : null;
            it.disputes = list.filter(function (f) { return f.kind === 'DISPUTE' && f.status === 'OPEN'; }).length;
            var rem = list.filter(function (f) { return f.kind === 'REMINDER_SENT'; })[0];
            it.lastReminder = rem ? rem.followDate : '';
            var p = partnersById[it.partnerId];
            it.contactEmail = p ? p.contactEmail : '';
            it.creditLimit = p && p.creditLimitCurrency === it.currency ? p.creditLimitMinor : null;
            it.docs = it.docs.filter(function (x) { return x.days !== null && x.days >= -7; }).sort(function (a, b) { return b.days - a.days; });
        });
    });
    var out = { AR: [], AP: [], totals: { AR: {}, AP: {} } };
    ['AR', 'AP'].forEach(function (dir) {
        out[dir] = Object.keys(res[dir]).map(function (k) { return res[dir][k]; }).filter(function (x) { return x.overdue > 0 || x.dueSoon7 > 0 || x.missingDue > 0 || x.disputes || (x.promise && x.promise.broken); }).sort(function (a, b) { return b.overdue - a.overdue || b.dueSoon7 - a.dueSoon7; });
        out[dir].forEach(function (x) { var t = out.totals[dir][x.currency] = out.totals[dir][x.currency] || { overdue: 0, dueSoon7: 0, missingDue: 0, partners: 0 }; t.overdue += x.overdue; t.dueSoon7 += x.dueSoon7; t.missingDue += x.missingDue; if (x.overdue > 0)
            t.partners++; });
    });
    return out;
}
function alertOverview_(user, req) {
    requirePerm_(user, 'read');
    var asOf = (req.payload && req.payload.asOf) || todayVn_();
    if (!isDate_(asOf) || asOf < ledgerStart_())
        throw err_('VALIDATION_FAILED', 'Ngày chốt không hợp lệ.');
    var led = loadLedger_(user, asOf), partners = byId_(repoValid_('Partner'));
    var fl = repoValid_('Followup').filter(function (f) { return inScope_(user, partners[f.partnerId], ''); });
    var ov = buildOverview_(led, fl, asOf, partners);
    ov.asOf = asOf;
    return ov;
}
function followupOut_(f, pm) { return { id: f.id, partnerId: f.partnerId, partnerName: partnerName_(pm, f.partnerId), docId: f.docId, direction: f.direction, kind: f.kind, followDate: f.followDate, promisedDate: f.promisedDate, promisedAmountMinor: f.promisedAmountMinor, currency: f.currency, channel: f.channel, note: f.note, status: f.status, createdBy: f.createdBy, createdAt: f.createdAt, version: f.version }; }
function followupList_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, pm = partnerMap_(), rows = repoValid_('Followup').filter(function (f) {
        if (!inScope_(user, pm[f.partnerId], ''))
            return false;
        if (p.partnerId && f.partnerId !== p.partnerId)
            return false;
        if (p.docId && f.docId !== p.docId)
            return false;
        if (p.kind && f.kind !== p.kind)
            return false;
        if (p.status && f.status !== p.status)
            return false;
        return true;
    }).sort(function (a, b) { return cmpStr_(b.followDate, a.followDate) || cmpStr_(b.id, a.id); });
    var pg = paginate_(rows, p.page, p.pageSize || 50);
    return { items: pg.items.map(function (f) { return followupOut_(f, pm); }), total: pg.total, page: pg.page, pageSize: pg.pageSize };
}
function followupSave_(user, req) {
    requirePerm_(user, 'collect.write');
    var p = req.payload || {}, errs = [];
    function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
    if (['PROMISE', 'DISPUTE', 'NOTE', 'CALL'].indexOf(p.kind) < 0)
        E('kind', 'REQUIRED', 'Chọn loại ghi nhận.');
    var dir = p.direction === 'AP' ? 'AP' : 'AR', date = p.followDate || todayVn_();
    if (!isDate_(date))
        E('followDate', 'DATE_INVALID', 'Ngày không hợp lệ.');
    if (p.kind === 'PROMISE') {
        if (!isDate_(p.promisedDate))
            E('promisedDate', 'DATE_INVALID', 'Nhập ngày cam kết thanh toán.');
        else if (isDate_(date) && p.promisedDate < date)
            E('promisedDate', 'DATE_INVALID', 'Ngày cam kết không được trước ngày ghi nhận.');
        if (!Number.isSafeInteger(p.promisedAmountMinor) || p.promisedAmountMinor <= 0)
            E('promisedAmountMinor', 'AMOUNT_INVALID', 'Nhập số tiền cam kết (số nguyên dương).');
        if (!currencyMap_()[p.currency])
            E('currency', 'REQUIRED', 'Chọn tiền tệ.');
    }
    if ((p.kind === 'DISPUTE' || p.kind === 'NOTE') && !String(p.note || '').trim())
        E('note', 'REQUIRED', 'Nhập nội dung.');
    if (errs.length)
        throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
    return runTx_(user, { requestId: req.requestId, action: 'followup.save', payload: p, failAt: req.failAt }, function (tx) {
        var partner = tx.find('Partner', p.partnerId);
        if (!partner)
            throw err_('NOT_FOUND', 'Không tìm thấy đối tác.');
        assertVisible_(user, partner, '', '', 'Không tìm thấy đối tác.');
        if (p.docId) {
            var d = tx.find('DebtDoc', p.docId);
            if (!d || d.partnerId !== partner.id)
                throw err_('VALIDATION_FAILED', 'Chứng từ không thuộc đối tác.');
            if (!inScope_(user, partner, d.businessGroupCode))
                throw err_('VALIDATION_FAILED', 'Chứng từ không thuộc đối tác.');
        }
        var row = tx.insert('Followup', { partnerId: partner.id, docId: p.docId || '', direction: dir, kind: p.kind, followDate: date, promisedDate: p.kind === 'PROMISE' ? p.promisedDate : '', promisedAmountMinor: p.kind === 'PROMISE' ? p.promisedAmountMinor : null,
            currency: p.currency || '', channel: maxStr_(p.channel, 30), note: maxStr_(p.note, 500), status: (p.kind === 'PROMISE' || p.kind === 'DISPUTE') ? 'OPEN' : 'DONE' });
        return { result: { id: row.id }, audit: [{ entityType: 'Followup', entityId: row.id, action: 'followup.' + p.kind.toLowerCase(), diff: { partner: partner.shortName, promisedDate: p.promisedDate, amount: p.promisedAmountMinor } }] };
    });
}
function followupClose_(user, req) {
    requirePerm_(user, 'collect.write');
    return runTx_(user, { requestId: req.requestId, action: 'followup.close', payload: req.payload, failAt: req.failAt }, function (tx) {
        var f = tx.find('Followup', req.payload.id);
        if (!f)
            throw err_('NOT_FOUND', 'Không tìm thấy ghi nhận.');
        var fdoc = f.docId ? tx.find('DebtDoc', f.docId) : null;
        assertVisible_(user, tx.find('Partner', f.partnerId), fdoc ? fdoc.businessGroupCode : '', '', 'Không tìm thấy ghi nhận.');
        if (f.status !== 'OPEN')
            throw err_('STATE_TRANSITION_INVALID', 'Ghi nhận đã đóng.');
        tx.update('Followup', f.id, { status: 'DONE', note: maxStr_(f.note + (req.payload.note ? ' | Đóng: ' + req.payload.note : ' | Đã đóng'), 500) }, req.payload.ifVersion);
        return { result: { id: f.id, status: 'DONE' }, audit: [{ entityType: 'Followup', entityId: f.id, action: 'followup.close', diff: { note: req.payload.note } }] };
    });
}
function buildReminderText_(entityName, partnerName, currency, asOf, docs, senderName, bank, decimals) {
    function money(v) { var neg = v < 0, a = Math.abs(v); if (decimals === 0)
        return (neg ? '-' : '') + String(a).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); var ip = Math.floor(a / Math.pow(10, decimals)), fp = ('00' + (a % Math.pow(10, decimals))).slice(-decimals); return (neg ? '-' : '') + String(ip).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + fp; }
    function dm(d) { return d ? d.slice(8) + '/' + d.slice(5, 7) + '/' + d.slice(0, 4) : '—'; }
    var total = docs.reduce(function (s, x) { return s + x.out; }, 0), lines = docs.map(function (x, i) { return (i + 1) + '. HĐ/CT ' + (x.invoiceNo || x.docNo || '—') + ' · hạn ' + dm(x.dueDate) + ' · còn ' + money(x.out) + ' ' + currency + ' · quá hạn ' + x.days + ' ngày'; });
    return 'Kính gửi ' + partnerName + ',\n\n' + (entityName || 'Chúng tôi') + ' xin gửi bảng đối chiếu các khoản công nợ đã quá hạn tại ngày ' + dm(asOf) + ':\n\n' + lines.join('\n') + '\n\nTổng quá hạn: ' + money(total) + ' ' + currency + '.\n\nĐề nghị Quý khách kiểm tra, thanh toán hoặc phản hồi nếu có chênh lệch. Nếu đã thanh toán, xin bỏ qua thư này và vui lòng gửi chứng từ chuyển tiền để chúng tôi đối chiếu.'
        + (bank ? '\n\nThông tin chuyển khoản: ' + bank : '') + '\n\nTrân trọng,\n' + (senderName || '') + '\n' + (entityName || '');
}
function reminderPreview_(user, req) {
    requirePerm_(user, 'collect.write');
    var p = req.payload || {}, asOf = p.asOf || todayVn_(), partner = repoFind_('Partner', p.partnerId);
    if (!partner)
        throw err_('NOT_FOUND', 'Không tìm thấy đối tác.');
    assertVisible_(user, partner, '', '', 'Không tìm thấy đối tác.');
    if (!isDate_(asOf) || asOf < ledgerStart_())
        throw err_('VALIDATION_FAILED', 'Ngày chốt không hợp lệ.');
    var led = loadLedger_(user, asOf), cur = p.currency || 'VND', docs = {};
    led.lines.forEach(function (l) {
        var d = led.docById[l.docId], b = led.bal.byLine[l.id];
        if (!b || b.out <= 0 || d.partnerId !== partner.id || d.direction !== 'AR' || d.currency !== cur || !d.dueDate)
            return;
        var days = daysBetween_(d.dueDate, asOf);
        if (days <= 0)
            return;
        var x = docs[d.id] = docs[d.id] || { docNo: d.docNo, invoiceNo: d.invoiceNo, dueDate: d.dueDate, out: 0, days: days };
        x.out += b.out;
    });
    var list = Object.keys(docs).map(function (k) { return docs[k]; }).sort(function (a, b) { return b.days - a.days; });
    if (!list.length)
        throw err_('NOTHING_OVERDUE', 'Đối tác không có khoản quá hạn (đã có hạn thanh toán) để nhắc.');
    var entity = cfgGet_('entity.name', ''), body = buildReminderText_(entity, partner.legalName || partner.shortName, cur, asOf, list, user.displayName, cfgGet_('entity.bank', ''), curInfoDec_(cur));
    return { to: partner.contactEmail, hasEmail: !!partner.contactEmail, subject: 'Đối chiếu công nợ quá hạn tại ' + asOf.slice(8) + '/' + asOf.slice(5, 7) + '/' + asOf.slice(0, 4) + ' – ' + (entity || ''), body: body, docs: list, currency: cur, total: list.reduce(function (s, x) { return s + x.out; }, 0) };
}
function curInfoDec_(c) { var m = currencyMap_()[c]; return m ? m.decimals : 0; }
function reminderSend_(user, req) {
    requirePerm_(user, 'collect.write');
    var p = req.payload || {};
    if (!String(p.subject || '').trim() || !String(p.body || '').trim())
        throw err_('VALIDATION_FAILED', 'Nhập tiêu đề và nội dung thư.');
    if (String(p.body).length > 10000 || String(p.subject).length > 200)
        throw err_('VALIDATION_FAILED', 'Thư quá dài.');
    if (typeof MailApp.getRemainingDailyQuota === 'function' && MailApp.getRemainingDailyQuota() < 1)
        throw err_('MAIL_QUOTA', 'Đã hết hạn mức gửi email trong ngày.');
    /* Bước 1 (trong khóa, chống trùng theo requestId): ghi nhận "đang gửi". Bước 2 (ngoài khóa): gửi thư. Bước 3: đánh dấu đã gửi / thất bại.
       Gửi lại cùng requestId không gửi thêm thư nếu đã gửi; nếu bước 3 hỏng thì bản ghi còn ở trạng thái "đang gửi" để người dùng thấy. */
    var q = runTx_(user, { requestId: req.requestId, action: 'reminder.send', payload: p, failAt: req.failAt }, function (tx) {
        var partner = tx.find('Partner', p.partnerId);
        if (!partner)
            throw err_('NOT_FOUND', 'Không tìm thấy đối tác.');
        assertVisible_(user, partner, '', '', 'Không tìm thấy đối tác.');
        if (!partner.contactEmail)
            throw err_('NO_CONTACT_EMAIL', 'Đối tác chưa có email liên hệ. Cập nhật ở hồ sơ đối tác.');
        var row = tx.insert('Followup', { partnerId: partner.id, docId: '', direction: 'AR', kind: 'REMINDER_QUEUED', followDate: todayVn_(), promisedDate: '', promisedAmountMinor: null, currency: p.currency || '', channel: 'EMAIL', note: maxStr_('Đang gửi tới ' + partner.contactEmail + ': ' + p.subject, 500), status: 'OPEN' });
        return { result: { id: row.id, sentTo: partner.contactEmail }, audit: [{ entityType: 'Followup', entityId: row.id, action: 'reminder.queue', diff: { partner: partner.shortName, to: partner.contactEmail } }] };
    });
    var cur = repoFind_('Followup', q.id);
    if (cur && cur.kind === 'REMINDER_SENT')
        return q;
    if (cur && cur.kind === 'REMINDER_FAILED')
        throw err_('REQUEST_FAILED', 'Lần gửi trước thất bại. Hãy đóng cửa sổ rồi soạn lại thư để gửi lần mới.');
    function mark(ok, why) {
        return runTx_(user, { requestId: 'rmk:' + q.id, action: 'reminder.mark', payload: { id: q.id, ok: ok } }, function (tx) {
            var f = tx.find('Followup', q.id);
            if (!f)
                throw err_('NOT_FOUND', 'Không tìm thấy ghi nhận.');
            tx.update('Followup', f.id, { kind: ok ? 'REMINDER_SENT' : 'REMINDER_FAILED', status: 'DONE', note: maxStr_((ok ? 'Gửi tới ' : 'GỬI THẤT BẠI tới ') + q.sentTo + ': ' + p.subject + (ok ? '' : ' – ' + why), 500) });
            return { result: { id: f.id }, audit: [{ entityType: 'Followup', entityId: f.id, action: ok ? 'reminder.send' : 'reminder.failed', diff: { to: q.sentTo } }] };
        });
    }
    try {
        MailApp.sendEmail({ to: q.sentTo, subject: maxStr_(p.subject, 200), body: String(p.body), replyTo: user.email, name: cfgGet_('entity.name', '') || 'Kế toán công nợ' });
    }
    catch (e) {
        try {
            mark(false, String(e && e.message || e).slice(0, 120));
        }
        catch (e2) { }
        throw err_('MAIL_FAILED', 'Không gửi được thư. Kiểm tra email liên hệ của đối tác hoặc hạn mức email rồi soạn lại.');
    }
    try {
        mark(true);
    }
    catch (e) {
        try {
            mark(true);
        }
        catch (e2) {
            return { id: q.id, sentTo: q.sentTo, markPending: true };
        }
    }
    return q;
}
function digestItems_(ov) {
    return { ar: ov.AR.filter(function (x) { return x.overdue > 0 || (x.promise && x.promise.broken); }).slice(0, 15), ap: ov.AP.filter(function (x) { return x.overdue > 0 || x.dueSoon7 > 0; }).slice(0, 15) };
}
function buildDigestText_(ov) {
    function line(it) { return '- ' + it.partnerName + ' (' + it.currency + '): quá hạn ' + it.overdue + ' (tối đa ' + it.overdueMaxDays + ' ngày)' + (it.promise ? ' · cam kết ' + it.promise.date + (it.promise.broken ? ' ĐÃ NHỠ' : '') : '') + (it.disputes ? ' · tranh chấp ' + it.disputes : ''); }
    var it0 = digestItems_(ov), ar = it0.ar, ap = it0.ap;
    return 'Công nợ tại ' + ov.asOf + '\n\nPHẢI THU QUÁ HẠN (' + ar.length + '):\n' + (ar.length ? ar.map(line).join('\n') : '(không có)') + '\n\nPHẢI TRẢ QUÁ HẠN / ĐẾN HẠN 7 NGÀY (' + ap.length + '):\n' + (ap.length ? ap.map(function (it) { return '- ' + it.partnerName + ' (' + it.currency + '): quá hạn ' + it.overdue + ' · đến hạn 7 ngày ' + it.dueSoon7; }).join('\n') : '(không có)');
}
function overdueDigestTrigger() {
    try {
        resetMemo_();
        var asOf = todayVn_();
        if (asOf < ledgerStart_())
            return;
        var errs = [];
        repoValid_('AppUser').filter(function (u) { return u.status === 'ACTIVE' && roleHas_(u.role, 'collect.write'); }).forEach(function (u) {
            try {
                var user = { id: u.id, email: u.email, role: u.role, scope: safeJson_(u.scopeJson, {}) }, ov = alertOverview_(user, { payload: { asOf: asOf } }), it = digestItems_(ov);
                if (!it.ar.length && !it.ap.length)
                    return;
                MailApp.sendEmail(u.email, '[KATY AP/AR] Bản tin quá hạn ' + asOf, buildDigestText_(ov));
            }
            catch (e) {
                errs.push(u.email + ': ' + e);
            }
        });
        if (errs.length)
            alertAdmin_('Bản tin quá hạn lỗi một phần', errs.join('\n'));
    }
    catch (e) {
        alertAdmin_('Bản tin quá hạn lỗi', String(e));
    }
}
function cfgGet_(key, def) { var r = repoFind_('Config', key); return r ? r.value : def; }
function ledgerStart_() { return cfgGet_('ledgerStartDate', '2026-01-01'); }
function catalogList_(type, includeInactive) {
    return repoValid_('Catalog').filter(function (c) { return c.catalogType === type && (includeInactive || c.active === 1); })
        .sort(function (a, b) { return a.sortOrder - b.sortOrder || cmpStr_(a.code, b.code); });
}
function serviceMap_() {
    if (MEMO_.svcmap)
        return MEMO_.svcmap;
    var m = {};
    catalogList_('SERVICE_CODE', true).forEach(function (c) { m[c.code] = { name: c.name, active: c.active === 1, department: String(safeJson_(c.attrsJson, {}).department || '') }; });
    return (MEMO_.svcmap = m);
}
function orderServices_(o) {
    var l = safeJson_(o && o.servicesJson, null);
    if (Array.isArray(l) && l.length)
        return l;
    return o && o.serviceCode ? [{ code: o.serviceCode, hsdvNo: o.hsdvNo || '' }] : [];
}
function serviceDept_(code) { var r = serviceMap_()[code]; return r ? r.department : ''; }
function servicesOut_(o) { return orderServices_(o).map(function (x) { return { code: x.code, name: serviceLabel_(x.code), hsdvNo: x.hsdvNo || '', department: serviceDept_(x.code) }; }); }
function serviceNoOf_(order, code) { var f = orderServices_(order).filter(function (x) { return x.code === code; })[0]; return f ? f.hsdvNo || '' : ''; }
// mã dịch vụ của khoản: ghi trên khoản; khoản cũ chưa ghi thì lấy mã duy nhất của PO (nếu PO chỉ có một mã)
function accrualServiceCode_(a, order) {
    if (a.serviceCode)
        return a.serviceCode;
    var sv = order ? orderServices_(order) : [];
    return sv.length === 1 ? sv[0].code : '';
}
// kiểm tra/chọn mã dịch vụ cho khoản thuộc đơn; trả { code } hoặc { err }
function pickAccrualService_(order, wanted) {
    var sv = orderServices_(order), w = String(wanted || '').trim().toUpperCase();
    if (!sv.length)
        return { err: 'Đơn chưa có mã dịch vụ: mở đơn, chọn mã dịch vụ rồi lưu trước.' };
    if (!w)
        return sv.length === 1 ? { code: sv[0].code } : { err: 'PO có ' + sv.length + ' mã dịch vụ: chọn mã dịch vụ của khoản.' };
    if (!sv.some(function (x) { return x.code === w; }))
        return { err: 'Mã dịch vụ ' + w + ' không thuộc các mã của PO.' };
    return { code: w };
}
function hsdvAbbr_(partner) {
    return normText_(partner && partner.shortName).replace(/[^a-z0-9]/g, '').toUpperCase();
}
// Số HSDV: GML/<mã dịch vụ>/<viết tắt khách>-<yy>/<STT 3 số>; STT đếm theo khách + mã dịch vụ + năm.
function hsdvNumber_(env, partner, serviceCode, orderDate, orders) {
    var abbr = hsdvAbbr_(partner), yy = String(orderDate || '').slice(2, 4);
    if (!abbr)
        throw err_('VALIDATION_FAILED', 'Khách hàng chưa có tên viết tắt hợp lệ để lập số HSDV.', [{ path: 'customerPartnerId', code: 'HSDV_ABBR', message: 'Đặt "Tên viết tắt" (chữ/số) cho khách hàng.' }]);
    var used = {};
    (orders || []).forEach(function (o) { orderServices_(o).forEach(function (x) { if (x.hsdvNo)
        used[x.hsdvNo] = 1; }); });
    var key = 'seq.HSDV.' + serviceCode + '.' + abbr + '.' + yy, prefix = 'GML/' + serviceCode + '/' + abbr + '-' + yy + '/', no = '', guard = 0;
    do {
        no = prefix + ('000' + env.nextSeq(key)).slice(-3);
        if (env.preview || ++guard > 200)
            break;
    } while (used[no]);
    return no;
}
function serviceLabel_(code) { var r = serviceMap_()[code]; return code ? (r && r.name && r.name !== code ? code + ' – ' + r.name : code) : ''; }
function currencyMap_() {
    if (MEMO_['v:curMap'])
        return MEMO_['v:curMap'];
    var m = {};
    catalogList_('CURRENCY').forEach(function (c) { var a = safeJson_(c.attrsJson, {}); m[c.code] = { decimals: a.decimals === undefined ? 0 : a.decimals, name: c.name }; });
    return (MEMO_['v:curMap'] = m);
}
function partnerMap_() { return byId_(repoValid_('Partner')); }
function partnerName_(pm, id) { var p = pm[id]; return p ? (p.shortName || p.legalName) : ''; }
// Đường ĐỌC danh sách chứng từ có thể đọc CHỌN CỘT (bật bằng API perf.set / hàm perfListSliceSet; lưu ở Script Properties): chỉ các cột docList_ thực sự dùng. Mặc định TẮT (đọc nguyên bảng) cho đến khi đo trên Google thật.
var LIST_COLS_ = {
    DebtDoc: ['id', 'docNo', 'direction', 'docType', 'partnerId', 'currency', 'businessGroupCode', 'docDate', 'postingDate', 'invoiceNo', 'dueDate', 'status', 'totalGrossMinor', 'statusNote', 'batchLabel', 'isOpening', 'warningsJson', 'createdBy', 'version'],
    DebtLine: ['id', 'docId', 'description', 'vatMode', 'grossMinor', 'adjustsLineId', 'accrualId', 'serviceCode'],
    Allocation: ['debtLineId', 'amountMinor', 'effectiveDate']
};
function perfListSlice_() { return MEMO_.listSlice === true; }
function perfSliceGap_() { var g = Number(props_().getProperty('PERF_SLICE_GAP') || 3); return Number.isInteger(g) && g >= 0 && g <= 8 ? g : 3; }
// Cờ lưu ở Script Properties (không đọc thêm Sheet): bật/tắt đọc chọn cột bằng API perf.set hoặc hàm trình soạn thảo perfListSliceSet(on, gap).
function perfSliceOn_() { return props_().getProperty('PERF_LIST_SLICE') === '1'; }
function perfGet_(user, req) { requirePerm_(user, 'sys.health'); return { listSlice: perfSliceOn_(), sliceGap: perfSliceGap_() }; }
function perfSet_(user, req) {
    requirePerm_(user, 'user.manage');
    var p = req.payload || {}, on = p.listSlice === true || p.listSlice === '1', gap = p.sliceGap === undefined ? perfSliceGap_() : Number(p.sliceGap);
    if (!Number.isInteger(gap) || gap < 0 || gap > 8)
        throw err_('VALIDATION_FAILED', 'sliceGap phải là số nguyên 0–8.', [{ path: 'sliceGap', code: 'INVALID', message: 'Nhập 0–8.' }]);
    return runTx_(user, { requestId: req.requestId, action: 'perf.set', payload: p, failAt: req.failAt }, function (tx) {
        props_().setProperty('PERF_LIST_SLICE', on ? '1' : '0');
        props_().setProperty('PERF_SLICE_GAP', String(gap));
        return { result: { listSlice: on, sliceGap: gap }, audit: [{ entityType: 'Config', entityId: 'perf', action: 'perf.set', diff: { listSlice: on, sliceGap: gap } }] };
    });
}
function perfListSliceSet(on, gap) { props_().setProperty('PERF_LIST_SLICE', on ? '1' : '0'); if (gap !== undefined)
    props_().setProperty('PERF_SLICE_GAP', String(gap)); }
function listRows_(t) { return perfListSlice_() ? repoSliceValid_(t, LIST_COLS_[t], MEMO_.listGap) : repoValid_(t); }
function loadLedger_(user, asOf) {
    var pm = partnerMap_();
    var docs = listRows_('DebtDoc').filter(function (d) { return inScope_(user, pm[d.partnerId], d.businessGroupCode); });
    var dset = byId_(docs);
    var lines = listRows_('DebtLine').filter(function (l) { return dset[l.docId]; });
    var lset = byId_(lines);
    var allocs = listRows_('Allocation').filter(function (a) { return lset[a.debtLineId]; });
    var tl0 = Date.now(), balances = computeBalances(docs, lines, allocs, asOf);
    statStep_('ledgerMs', Date.now() - tl0);
    var led = { pm: pm, docs: docs, docById: dset, lines: lines, lineById: lset, allocs: allocs, bal: balances, asOf: asOf };
    var pays = null, pbal = null;
    Object.defineProperty(led, 'payments', { enumerable: true, get: function () {
            if (!pays)
                pays = repoValid_('Payment').filter(function (p) { return inScope_(user, pm[p.partnerId], ''); });
            return pays;
        } });
    Object.defineProperty(led, 'payBal', { enumerable: true, get: function () {
            if (!pbal)
                pbal = paymentBalances(led.payments, allocs, asOf);
            return pbal;
        } });
    return led;
}
function periodIdOf_(date) { return monthOf_(date); }
function assertPeriodOpen_(tx, date) {
    var ls = ledgerStart_();
    if (date < ls)
        throw err_('DATE_BEFORE_LEDGER_START', 'Ngày ' + date + ' trước ngày đầu sổ ' + ls + '.');
    var id = periodIdOf_(date), per = null;
    tx._per = tx._per || {};
    if (tx._per[id])
        return id;
    tx.rows('Period').forEach(function (p) { if (p.id === id)
        per = p; });
    if (!per) {
        tx.insert('Period', { id: id, startDate: id + '-01', endDate: monthEnd_(id), status: 'OPEN' });
        tx._per[id] = 1;
        return id;
    }
    if (per.status === 'CLOSED')
        throw err_('PERIOD_CLOSED', 'Kỳ ' + id + ' đã khóa. Hãy lập điều chỉnh vào kỳ đang mở.');
    return id;
}
function serviceCodesOfDoc_(lines) {
    var out = [];
    lines.forEach(function (l) { if (l.serviceCode && out.indexOf(l.serviceCode) < 0)
        out.push(l.serviceCode); });
    return out;
}
function fmtUser_(users, id) { var u = users[id]; return u ? (u.displayName || u.email) : id; }
function applyPartnerTerm_(doc, partner) {
    if (doc.dueDate || !partner || partner.paymentTermDays === null || partner.paymentTermDays === undefined)
        return false;
    var base = doc.invoiceDate || doc.docDate;
    if (!isDate_(base))
        return false;
    doc.dueDate = addDays_(base, partner.paymentTermDays);
    doc.dueDateSource = 'PARTNER_TERM';
    return true;
}
function creditStatus_(tx, partnerId, currency, asOf, extra) {
    var p = tx.find('Partner', partnerId), out = { limit: null, exposure: 0, overLimit: false, overdue: [], violations: [] };
    if (!p)
        return out;
    var led = loadLedger_(SYS_ADMIN_, asOf), exposure = 0, maxDays = Number(cfgGet_('credit.maxOverdueDays', '0'));
    led.lines.forEach(function (l) {
        var d = led.docById[l.docId], b = led.bal.byLine[l.id];
        if (!b || d.partnerId !== partnerId || d.direction !== 'AR' || d.currency !== currency || b.out <= 0)
            return;
        exposure += b.out;
        if (d.dueDate && daysBetween_(d.dueDate, asOf) > maxDays)
            out.overdue.push({ docNo: d.docNo, out: b.out, days: daysBetween_(d.dueDate, asOf) });
    });
    led.docs.forEach(function (d) { if (d.partnerId === partnerId && d.direction === 'AR' && d.currency === currency && (d.status === 'SUBMITTED' || d.status === 'APPROVED'))
        exposure += d.totalGrossMinor; });
    tx.rows('Accrual').forEach(function (a) { if (a.kind === 'REVENUE' && a.partnerId === partnerId && a.currency === currency && (a.status === 'OPEN' || (a.status === 'INVOICING' && (function () { var dd = tx.find('DebtDoc', a.docId); return !dd || dd.status === 'DRAFT' || dd.status === 'REJECTED'; })())))
        exposure += a.grossMinor; });
    exposure += extra || 0;
    out.exposure = exposure;
    if (p.creditLimitMinor !== null && p.creditLimitMinor !== undefined && p.creditLimitCurrency === currency) {
        out.limit = p.creditLimitMinor;
        if (exposure > p.creditLimitMinor) {
            out.overLimit = true;
            out.violations.push('Vượt hạn mức công nợ: dư nợ + phát sinh chưa thu ' + exposure + ' > hạn mức ' + p.creditLimitMinor + ' ' + currency);
        }
    }
    if (out.overdue.length)
        out.violations.push('Khách đang có ' + out.overdue.length + ' khoản quá hạn (tối đa ' + out.overdue.reduce(function (m, x) { return Math.max(m, x.days); }, 0) + ' ngày)');
    return out;
}
function enforceCredit_(tx, user, partnerId, currency, asOf, extra, payload) {
    var st = creditStatus_(tx, partnerId, currency, asOf, extra);
    if (!st.violations.length)
        return [];
    var policy = cfgGet_('credit.policy', 'WARN');
    if (policy !== 'BLOCK')
        return st.violations.map(function (v) { return { code: 'W-CREDIT', message: v }; });
    if (payload && payload.overrideCredit) {
        if (!can_(user, 'credit.override'))
            throw err_('FORBIDDEN', 'Chỉ người duyệt được vượt hạn mức/quá hạn.');
        if (!String(payload.overrideReason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do vượt hạn mức.', [{ path: 'overrideReason', code: 'REQUIRED', message: 'Nhập lý do.' }]);
        return st.violations.map(function (v) { return { code: 'W-CREDIT-OVERRIDE', message: v + ' – đã được ' + user.email + ' cho vượt: ' + payload.overrideReason }; });
    }
    throw err_('CREDIT_BLOCKED', st.violations.join('; ') + '. ' + (can_(user, 'credit.override') ? 'Có thể vượt hạn mức kèm lý do.' : 'Cần người duyệt cho phép vượt.'));
}
function dashSlot_(root, cur, dir) {
    root[cur] = root[cur] || {};
    return root[cur][dir] = root[cur][dir] || { gross: 0, settled: 0, out: 0, count: 0, due: { NOT_DUE: 0, D1_30: 0, D31_60: 0, D61_90: 0, D90P: 0, MISSING_DUE: 0 }, dueCount: { NOT_DUE: 0, D1_30: 0, D31_60: 0, D61_90: 0, D90P: 0, MISSING_DUE: 0 },
        dueSoon7: 0, partners: {}, groups: {} };
}
function dashAggregate_(led, asOf, filt) {
    var root = {}, missingDue = { count: 0, amount: {} }, unconfirmed = 0;
    led.lines.forEach(function (l) {
        var b = led.bal.byLine[l.id];
        if (!b)
            return;
        var d = led.docById[l.docId];
        if (filt.group && d.businessGroupCode !== filt.group)
            return;
        if (filt.partnerId && d.partnerId !== filt.partnerId)
            return;
        if (filt.currency && d.currency !== filt.currency)
            return;
        var s = dashSlot_(root, d.currency, d.direction);
        s.gross += b.gross + b.adjust;
        s.settled += b.alloc;
        s.out += b.out;
        s.count++;
        var pn = partnerName_(led.pm, d.partnerId), pp = s.partners[d.partnerId] = s.partners[d.partnerId] || { partnerId: d.partnerId, name: pn, out: 0 };
        pp.out += b.out;
        var gg = s.groups[d.businessGroupCode] = s.groups[d.businessGroupCode] || { group: d.businessGroupCode, out: 0 };
        gg.out += b.out;
        if (b.out > 0) {
            var bk = agingBucket(d.dueDate, asOf);
            s.due[bk] += b.out;
            s.dueCount[bk]++;
            if (d.dueDate) {
                var dd = daysBetween_(asOf, d.dueDate);
                if (dd >= 0 && dd <= 7)
                    s.dueSoon7 += b.out;
            }
            if (!d.dueDate) {
                missingDue.count++;
                missingDue.amount[d.currency] = (missingDue.amount[d.currency] || 0) + b.out;
            }
        }
        if (l.vatMode === 'UNCONFIRMED')
            unconfirmed++;
    });
    return { root: root, missingDue: missingDue, unconfirmed: unconfirmed };
}
function dashboardQuality_(user, led, agg, p) {
    var pm = { DRAFT: 0, SUBMITTED: 0, APPROVED: 0 }, pending = {}, dup = 0;
    led.docs.forEach(function (d) {
        if ((p.group && d.businessGroupCode !== p.group) || (p.partnerId && d.partnerId !== p.partnerId) || (p.currency && d.currency !== p.currency))
            return;
        if (pm[d.status] !== undefined) {
            pm[d.status]++;
            pending[d.currency] = (pending[d.currency] || 0) + d.totalGrossMinor;
        }
        var w = safeJson_(d.warningsJson, null);
        if (w && w.duplicates && w.duplicates.length && !w.acknowledged && d.status !== 'DELETED')
            dup++;
    });
    var openTx = can_(user, 'backup.list') ? Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {})).length : 0;
    return { missingDue: agg.missingDue, unconfirmedTaxLines: agg.unconfirmed, duplicateDocs: dup, pendingDocs: pm, pendingAmountByCurrency: pending, ordersNoService: repoValid_('Order').filter(function (o) { return o.status === 'OPEN' && !orderServices_(o).length && inScope_(user, led.pm[o.customerPartnerId], o.businessGroupCode); }).length, openTx: openTx };
}
function workbenchSummaryLive_(user, req) {
    requirePerm_(user, 'dashboard.read');
    var p = req.payload || {}, asOf = p.asOf || todayVn_(), ls = ledgerStart_();
    if (!isDate_(asOf))
        throw err_('VALIDATION_FAILED', 'Ngày chốt không hợp lệ');
    if (asOf < ls)
        return { noHistory: true, ledgerStartDate: ls, asOf: asOf, quality: null };
    var led = loadLedger_(user, asOf), agg = dashAggregate_(led, asOf, p);
    return { asOf: asOf, quality: dashboardQuality_(user, led, agg, p) };
}
function dashboardSummaryLive_(user, req) {
    requirePerm_(user, 'dashboard.read');
    var p = req.payload || {}, asOf = p.asOf || todayVn_(), ls = ledgerStart_();
    if (!isDate_(asOf))
        throw err_('VALIDATION_FAILED', 'Ngày chốt không hợp lệ');
    if (asOf < ls)
        return { noHistory: true, ledgerStartDate: ls, asOf: asOf, message: 'Chưa có dữ liệu trước ngày đầu sổ (' + ls + ').' };
    var led = loadLedger_(user, asOf), agg = dashAggregate_(led, asOf, p), sections = {};
    Object.keys(agg.root).forEach(function (cur) {
        sections[cur] = {};
        Object.keys(agg.root[cur]).forEach(function (dir) {
            var s = agg.root[cur][dir];
            sections[cur][dir] = { gross: s.gross, settled: s.settled, out: s.out, count: s.count, due: s.due, dueCount: s.dueCount, dueSoon7: s.dueSoon7,
                topPartners: Object.keys(s.partners).map(function (k) { return s.partners[k]; }).filter(function (x) { return x.out > 0; }).sort(function (a, b) { return b.out - a.out; }).slice(0, 10),
                byGroup: Object.keys(s.groups).map(function (k) { return s.groups[k]; }).filter(function (x) { return x.out !== 0; }).sort(function (a, b) { return b.out - a.out; }) };
        });
    });
    var adv = {};
    led.payments.forEach(function (x) {
        var b = led.payBal[x.id];
        if (!b || b.unalloc <= 0)
            return;
        if (p.partnerId && x.partnerId !== p.partnerId)
            return;
        if (p.currency && x.currency !== p.currency)
            return;
        var k = adv[x.currency] = adv[x.currency] || { IN: { advance: 0, other: 0, count: 0 }, OUT: { advance: 0, other: 0, count: 0 } };
        k[x.direction][x.purpose === 'ADVANCE' ? 'advance' : 'other'] += b.unalloc;
        k[x.direction].count++;
    });
    var quality = dashboardQuality_(user, led, agg, p), bookTotals = bookDebtTotals_(led, { partnerId: p.partnerId, group: p.group, currency: p.currency });
    var months = [], cur = monthOf_(ls), endM = monthOf_(asOf), guard = 0;
    while (cur <= endM && guard++ < 60) {
        months.push(cur);
        var y = +cur.slice(0, 4), m = +cur.slice(5, 7);
        cur = m === 12 ? (y + 1) + '-01' : y + '-' + ('0' + (m + 1)).slice(-2);
    }
    var trend = { months: months, enough: months.length >= 2, series: {}, note: months.length >= 2 ? '' : 'Chưa đủ lịch sử để vẽ xu hướng (cần ít nhất 2 tháng kể từ ngày đầu sổ ' + ls + ').' };
    months.forEach(function (mo, idx) {
        var me = monthEnd_(mo);
        if (me > asOf)
            me = asOf;
        var b = computeBalances(led.docs, led.lines, led.allocs, me);
        Object.keys(b.byLine).forEach(function (id) {
            var d = led.docById[b.byLine[id].docId];
            if (p.currency && d.currency !== p.currency)
                return;
            var k = d.direction + ':' + d.currency, s = trend.series[k] = trend.series[k] || { out: months.map(function () { return 0; }), issued: months.map(function () { return 0; }), paid: months.map(function () { return 0; }) };
            s.out[idx] += b.byLine[id].out;
        });
    });
    led.docs.forEach(function (d) {
        if (!COUNTED_DOC_STATUS_[d.status] || d.isOpening || !d.docDate || d.docDate > asOf)
            return;
        var i = months.indexOf(monthOf_(d.docDate));
        if (i < 0)
            return;
        var k = d.direction + ':' + d.currency, s = trend.series[k];
        if (s)
            s.issued[i] += d.totalGrossMinor;
    });
    led.payments.forEach(function (x) {
        if ((x.status !== 'POSTED' && x.status !== 'REVERSED') || x.source === 'OPENING' || x.effectiveDate > asOf)
            return;
        var k = (x.direction === 'IN' ? 'AR:' : 'AP:') + x.currency, s = trend.series[k];
        if (!s)
            return;
        var i = months.indexOf(monthOf_(x.effectiveDate));
        if (i >= 0)
            s.paid[i] += x.amountMinor;
        if (x.status === 'REVERSED' && x.reversedDate && x.reversedDate <= asOf) {
            var j = months.indexOf(monthOf_(x.reversedDate));
            if (j >= 0)
                s.paid[j] -= x.amountMinor;
        }
    });
    return { asOf: asOf, ledgerStartDate: ls, sections: sections, advances: adv, bookTotals: bookTotals, quality: quality, trend: trend, dataVersion: dataVersion_(), generatedAt: nowIso_(),
        limits: 'Số dư tính từ chứng từ và phân bổ đã ghi nhận; không suy ngược từ số đã thanh toán hiện tại.' };
}
function dashboardUninvoicedLive_(user, req) {
    requirePerm_(user, 'dashboard.read');
    var p = req.payload || {}, asOf = p.asOf || todayVn_();
    if (!isDate_(asOf))
        throw err_('VALIDATION_FAILED', 'Ngày chốt không hợp lệ');
    var OD = orderListData_(user, asOf, true), unin = {}, docById = accrualCtx_();
    function slot(c) { return unin[c] = unin[c] || { revenue: 0, cost: 0, revenueCount: 0, costCount: 0, invoicingRevenue: 0, invoicingCost: 0, invoicingCount: 0 }; }
    function put(a) {
        if (!a || (a.status !== 'OPEN' && a.status !== 'INVOICING') || (p.currency && a.currency !== p.currency))
            return;
        var o = slot(a.currency), rev = a.kind === 'REVENUE';
        if (a.status === 'INVOICING') {
            o[rev ? 'invoicingRevenue' : 'invoicingCost'] += a.grossMinor;
            o.invoicingCount++;
        }
        else {
            o[rev ? 'revenue' : 'cost'] += a.grossMinor;
            o[rev ? 'revenueCount' : 'costCount']++;
        }
    }
    OD.acc.forEach(function (a0) { put(accrualAt_(a0, asOf, docById)); });
    costsOutsideOrders_(user).forEach(function (x) { put(accrualAt_(x.a, asOf, docById)); });
    return { asOf: asOf, uninvoiced: unin, dataVersion: dataVersion_() };
}
function docEnv_(tx, partnerId, user) {
    var cur = currencyMap_(), pt = partnerId ? tx.find('Partner', partnerId) : null;
    if (pt && user && !inScope_(user, pt, ''))
        pt = null; // đối tác ngoài phạm vi xử lý như không tồn tại (không lộ ID)
    return { partner: pt, currencies: cur,
        groups: catalogList_('BUSINESS_GROUP').map(function (c) { return c.code; }),
        feeTypes: catalogList_('FEE_TYPE').map(function (c) { return c.code; }), serviceCodes: catalogList_('SERVICE_CODE').map(function (c) { return c.code; }), ledgerStart: ledgerStart_() };
}
// Chứng từ thuộc PO nào: dòng phí → khoản phát sinh (accrualId) → đơn hàng; chi phí chia nhiều đơn thì theo phần chia. poRefs = số PO gửi NCC trên khoản phát sinh.
// Liên kết chứng từ → PO. Quyền PO dùng đúng chính sách của orderGet_/orderInScope_: PO ngoài phạm vi KHÔNG xuất hiện ở mã, ID, số lượng, tìm kiếm hay bộ lọc; chỉ đánh dấu "restricted" (có liên kết nhưng không được xem).
// Dòng điều chỉnh/đảo (adjustsLineId) kế thừa PO của đúng dòng gốc (chống vòng lặp, giới hạn độ sâu); khoản chia nhiều PO lấy qua AccrualSplit.
function orderLinkCtx_(user) {
    return { user: user, pm: partnerMap_(), orders: byId_(repoSliceValid_('Order', ['id', 'orderNo', 'poNo', 'customerPartnerId', 'businessGroupCode', 'status'])), accs: byId_(repoSliceValid_('Accrual', ['id', 'orderId', 'poRef'])), splits: groupBy_(repoSliceValid_('AccrualSplit', ['id', 'accrualId', 'orderId']), function (x) { return x.accrualId; }), lineById: byId_(perfListSlice_() ? repoSliceValid_('DebtLine', LIST_COLS_.DebtLine, MEMO_.listGap) : repoValid_('DebtLine')), memo: {} };
}
function lineAccrualIds_(ctx, l) {
    if (ctx.memo[l.id] !== undefined)
        return ctx.memo[l.id];
    var cur = l, seen = {}, depth = 0, res = [];
    while (cur && depth++ < 8 && !seen[cur.id]) {
        seen[cur.id] = 1;
        if (cur.accrualId && ctx.accs[cur.accrualId]) {
            res = [cur.accrualId];
            break;
        }
        cur = cur.adjustsLineId ? ctx.lineById[cur.adjustsLineId] : null;
    }
    return (ctx.memo[l.id] = res);
}
function docOrderIndex_(user, lines, ctx) {
    ctx = ctx || orderLinkCtx_(user);
    var out = {};
    lines.forEach(function (l) {
        lineAccrualIds_(ctx, l).forEach(function (aid) {
            var a = ctx.accs[aid], e = out[l.docId] = out[l.docId] || { o: {}, r: {}, restricted: false }, hidden = false;
            (a.orderId ? [a.orderId] : (ctx.splits[a.id] || []).map(function (x) { return x.orderId; })).forEach(function (id) {
                var o = ctx.orders[id];
                if (!o)
                    return;
                if (orderInScope_(ctx.user, o, ctx.pm))
                    e.o[o.id] = { id: o.id, orderNo: o.orderNo, poNo: o.poNo || '' };
                else
                    hidden = true;
            });
            if (hidden)
                e.restricted = true;
            else if (a.poRef)
                e.r[a.poRef] = 1;
        });
    });
    var res = {};
    Object.keys(out).forEach(function (k) { res[k] = { orders: Object.keys(out[k].o).map(function (i) { return out[k].o[i]; }), poRefs: Object.keys(out[k].r), restricted: out[k].restricted }; });
    return res;
}
function docRowOut_(d, led, sfMap, lineByDoc, ox) {
    var b = led.bal.byDoc[d.id], lines = lineByDoc[d.id] || [], posted = !!b;
    var bk = posted && b.out > 0 ? agingBucket(d.dueDate, led.asOf) : '';
    return { id: d.id, docNo: d.docNo, direction: d.direction, docType: d.docType, partnerId: d.partnerId, partnerName: partnerName_(led.pm, d.partnerId),
        currency: d.currency, group: d.businessGroupCode, docDate: d.docDate, invoiceNo: d.invoiceNo, dueDate: d.dueDate, status: d.status,
        totalGrossMinor: posted ? b.gross + b.adjust : d.totalGrossMinor, allocatedMinor: posted ? b.alloc : 0, outstandingMinor: posted ? b.out : null,
        payStatus: posted ? b.status : '', aging: bk, statusNote: d.statusNote, batchLabel: d.batchLabel, isOpening: d.isOpening,
        services: serviceCodesOfDoc_(lines), orders: ox && ox[d.id] ? ox[d.id].orders.slice(0, 6) : [], orderCount: ox && ox[d.id] ? ox[d.id].orders.length : 0, ordersRestricted: !!(ox && ox[d.id] && ox[d.id].restricted), poRefs: ox && ox[d.id] ? ox[d.id].poRefs.slice(0, 4) : [], warnings: docWarnings_(d, lines, b), createdBy: d.createdBy, version: d.version };
}
function validateListDates_(p) {
    ['from', 'to'].forEach(function (key) { if (p[key] && !isDate_(p[key]))
        throw err_('VALIDATION_FAILED', 'Ngày lọc không hợp lệ.', [{ path: key, code: 'DATE_INVALID', message: 'Ngày không hợp lệ' }]); });
    if (p.from && p.to && p.from > p.to)
        throw err_('VALIDATION_FAILED', 'Từ ngày phải trước hoặc bằng đến ngày.');
}
// ---- Bộ lọc nâng cao (adv) dùng chung cho danh sách chứng từ / đơn hàng / phiếu thu-chi ----
// adv = { sel: {khóa: [giá trị…]}, range: {khóa: {from, to}}, flag: {khóa: true} }. Kiểm tra chặt theo từng màn hình; lọc chạy SAU giới hạn phạm vi người dùng.
var ADV_MAX_VALUES_ = 50;
var ADV_SPEC_ = {
    docs: { sel: ['partnerId', 'group', 'currency', 'status', 'payStatus', 'aging', 'orderId'], range: { amountMinor: 'amount', dueDate: 'date', docDate: 'date' }, flag: ['overdue', 'missingDue', 'hasWarning', 'onlyOutstanding', 'onlyOpening', 'noOrder'] },
    orders: { sel: ['orderId', 'partnerId', 'group', 'status', 'serviceCode'], range: { orderDate: 'date' }, flag: ['onlyUninvoiced', 'onlyMissingService', 'onlyInvoicing', 'includeArchived', 'onlyArchived'] },
    payments: { sel: ['direction', 'partnerId', 'cashAccountCode', 'status', 'currency'], range: { amountMinor: 'amount', effectiveDate: 'date' }, flag: ['onlyUnallocated'] }
};
function advBad_(path, msg) { return err_('VALIDATION_FAILED', msg, [{ path: path, code: 'ADV_INVALID', message: msg }]); }
function advParse_(screen, adv, legacyCurrency) {
    var spec = ADV_SPEC_[screen], out = { sel: {}, range: {}, flag: {} };
    if (adv === undefined || adv === null)
        return out;
    if (typeof adv !== 'object' || Array.isArray(adv))
        throw advBad_('adv', 'Bộ lọc nâng cao phải là một đối tượng.');
    Object.keys(adv).forEach(function (g) { if (g !== 'sel' && g !== 'range' && g !== 'flag')
        throw advBad_('adv.' + g, 'Nhóm điều kiện lọc không hợp lệ: ' + g); });
    var sel = adv.sel || {}, rng = adv.range || {}, flg = adv.flag || {};
    [sel, rng, flg].forEach(function (x, i) { if (typeof x !== 'object' || Array.isArray(x))
        throw advBad_('adv.' + ['sel', 'range', 'flag'][i], 'Nhóm điều kiện lọc phải là đối tượng.'); });
    Object.keys(sel).forEach(function (k) {
        if (spec.sel.indexOf(k) < 0)
            throw advBad_('adv.sel.' + k, 'Màn hình này không lọc theo "' + k + '".');
        var v = sel[k];
        if (!Array.isArray(v))
            throw advBad_('adv.sel.' + k, 'Giá trị chọn phải là danh sách.');
        if (v.length > ADV_MAX_VALUES_)
            throw advBad_('adv.sel.' + k, 'Chọn tối đa ' + ADV_MAX_VALUES_ + ' giá trị cho mỗi điều kiện.');
        var vals = [];
        v.forEach(function (x) {
            if (typeof x !== 'string' || x.length > 100)
                throw advBad_('adv.sel.' + k, 'Giá trị lọc không hợp lệ.');
            if (x !== '' && vals.indexOf(x) < 0)
                vals.push(x);
        });
        if (vals.length)
            out.sel[k] = vals;
    });
    Object.keys(rng).forEach(function (k) {
        var kind = spec.range[k];
        if (!kind)
            throw advBad_('adv.range.' + k, 'Màn hình này không lọc khoảng theo "' + k + '".');
        var r = rng[k];
        if (!r || typeof r !== 'object' || Array.isArray(r))
            throw advBad_('adv.range.' + k, 'Khoảng lọc phải gồm từ/đến.');
        Object.keys(r).forEach(function (e) { if (e !== 'from' && e !== 'to')
            throw advBad_('adv.range.' + k, 'Khoảng lọc chỉ gồm from và to.'); });
        var from = r.from === undefined || r.from === null || r.from === '' ? null : r.from, to = r.to === undefined || r.to === null || r.to === '' ? null : r.to;
        if (from === null && to === null)
            return;
        [from, to].forEach(function (x) {
            if (x === null)
                return;
            if (kind === 'date' ? (typeof x !== 'string' || !isDate_(x)) : !Number.isSafeInteger(x))
                throw advBad_('adv.range.' + k, kind === 'date' ? 'Ngày lọc không hợp lệ.' : 'Số tiền lọc phải là số nguyên (đơn vị nhỏ nhất).');
        });
        if (from !== null && to !== null && from > to)
            throw advBad_('adv.range.' + k, 'Giá trị "từ" phải nhỏ hơn hoặc bằng "đến".');
        out.range[k] = { from: from, to: to };
    });
    Object.keys(flg).forEach(function (k) {
        if (spec.flag.indexOf(k) < 0)
            throw advBad_('adv.flag.' + k, 'Màn hình này không có điều kiện nhanh "' + k + '".');
        if (typeof flg[k] !== 'boolean')
            throw advBad_('adv.flag.' + k, 'Điều kiện nhanh phải là đúng/sai.');
        if (flg[k])
            out.flag[k] = true;
    });
    if (out.range.amountMinor) {
        var cur = out.sel.currency || (legacyCurrency ? [legacyCurrency] : []);
        if (cur.length !== 1)
            throw advBad_('adv.range.amountMinor', 'Chỉ lọc theo số tiền khi chọn đúng một tiền tệ.');
    }
    return out;
}
function advIn_(a, key, v) { var s = a.sel[key]; return !s || s.indexOf(v) >= 0; }
function advRange_(a, key, v) {
    var r = a.range[key];
    if (!r)
        return true;
    if (v === null || v === undefined || v === '')
        return false;
    return (r.from === null || v >= r.from) && (r.to === null || v <= r.to);
}
// Đọc nhiều bảng rời nhau đã được rào ở doPost: beginReadSnapshot_/assertReadSnapshot_ (đổi phiên bản dữ liệu giữa chừng → SERVER_BUSY "vui lòng tải lại"); đường đọc chọn cột dùng đúng rào này.
function docList_(user, req) {
    try {
        return docListCore_(user, req);
    }
    finally {
        MEMO_.listSlice = false;
    }
}
function docListCore_(user, req) {
    requirePerm_(user, 'read');
    MEMO_.listSlice = perfSliceOn_();
    MEMO_.listGap = MEMO_.listSlice ? perfSliceGap_() : 0; // đặt lại mỗi lần (resetMemo_ khi đọc lại xóa cờ)
    var p = req.payload || {}, asOf = p.asOf || todayVn_();
    if (!isDate_(asOf))
        throw err_('VALIDATION_FAILED', 'Ngày chốt không hợp lệ');
    validateListDates_(p);
    var adv = advParse_('docs', p.adv, p.currency);
    var tf0 = Date.now(), led = loadLedger_(user, asOf), lineByDoc = groupBy_(led.lines, function (l) { return l.docId; }), q = normText_(p.q), cand = [];
    statStep_('loadMs', Date.now() - tf0);
    var tf1 = Date.now();
    // Chỉ dựng chỉ mục PO cho TOÀN BỘ chứng từ khi cần tìm/lọc theo PO; ngược lại chỉ dựng cho các dòng của trang hiện tại.
    var octx = null, needIdx = !!(q || adv.sel.orderId || adv.flag.noOrder), ox = needIdx ? docOrderIndex_(user, led.lines, (octx = orderLinkCtx_(user))) : null;
    // Lọc và sắp xếp trên dữ liệu thô; chỉ dựng đầy đủ các dòng của trang hiện tại (tránh dựng hàng chục nghìn đối tượng).
    led.docs.forEach(function (d) {
        if (p.direction && d.direction !== p.direction)
            return;
        if (p.partnerId && d.partnerId !== p.partnerId)
            return;
        if (p.group && d.businessGroupCode !== p.group)
            return;
        if (p.currency && d.currency !== p.currency)
            return;
        if (p.status && d.status !== p.status)
            return;
        if (p.batchLabel && d.batchLabel !== p.batchLabel)
            return;
        if (p.from && docEffDate_(d) < p.from)
            return;
        if (p.to && docEffDate_(d) > p.to)
            return;
        if (!p.includeDeleted && d.status === 'DELETED')
            return;
        var b = led.bal.byDoc[d.id], posted = !!b, lines = lineByDoc[d.id] || [], out = posted ? b.out : null;
        if (p.payStatus && (posted ? b.status : '') !== p.payStatus)
            return;
        if (p.aging && (posted && b.out > 0 ? agingBucket(d.dueDate, led.asOf) : '') !== p.aging)
            return;
        if (p.onlyOutstanding && !(out > 0))
            return;
        if (!advIn_(adv, 'partnerId', d.partnerId) || !advIn_(adv, 'group', d.businessGroupCode) || !advIn_(adv, 'currency', d.currency) || !advIn_(adv, 'status', d.status) || !advIn_(adv, 'payStatus', posted ? b.status : ''))
            return;
        if (adv.sel.aging && adv.sel.aging.indexOf(posted && b.out > 0 ? agingBucket(d.dueDate, led.asOf) : '') < 0)
            return;
        if (adv.range.amountMinor && !advRange_(adv, 'amountMinor', posted ? b.gross + b.adjust : d.totalGrossMinor))
            return;
        if (!advRange_(adv, 'dueDate', d.dueDate) || !advRange_(adv, 'docDate', docEffDate_(d)))
            return;
        if (adv.flag.overdue && !(out > 0 && d.dueDate && d.dueDate < led.asOf))
            return;
        if (adv.flag.missingDue && !(out > 0 && !d.dueDate))
            return;
        if (adv.flag.hasWarning && !(d.warningsJson && d.warningsJson !== '[]' && d.warningsJson !== 'null'))
            return;
        if (adv.flag.onlyOutstanding && !(out > 0))
            return;
        if (adv.flag.onlyOpening && !d.isOpening)
            return;
        var dox = ox ? ox[d.id] : null;
        if (adv.sel.orderId && !(dox && dox.orders.some(function (o) { return adv.sel.orderId.indexOf(o.id) >= 0; })))
            return;
        if (adv.flag.noOrder && dox && (dox.orders.length || dox.restricted))
            return;
        if (q) {
            var hay = normText_([dox ? dox.orders.map(function (o) { return o.orderNo + ' ' + o.poNo; }).join(' ') + ' ' + dox.poRefs.join(' ') : '', d.docNo, d.invoiceNo, partnerName_(led.pm, d.partnerId), d.statusNote, d.batchLabel, serviceCodesOfDoc_(lines).join(' '), lines.map(function (l) { return l.description; }).join(' ')].join(' '));
            if (hay.indexOf(q) < 0)
                return;
        }
        cand.push({ d: d, b: b, out: out, gross: posted ? b.gross + b.adjust : d.totalGrossMinor });
    });
    var sortKey = { docDate: 1, docNo: 1, partnerName: 1, totalGrossMinor: 1, outstandingMinor: 1, dueDate: 1, status: 1 }[p.sort] ? p.sort : 'docDate', dir = p.dir === 'asc' ? 1 : -1, nameCache = {};
    function keyOf(c) {
        switch (sortKey) {
            case 'partnerName': return nameCache[c.d.partnerId] = nameCache[c.d.partnerId] !== undefined ? nameCache[c.d.partnerId] : partnerName_(led.pm, c.d.partnerId);
            case 'totalGrossMinor': return c.gross;
            case 'outstandingMinor': return c.out;
            default: return c.d[sortKey];
        }
    }
    cand.forEach(function (c) { c.k = keyOf(c); });
    cand.sort(function (a, b) {
        var x = a.k, y = b.k;
        if (x === null || x === undefined)
            x = typeof y === 'number' ? -Infinity : '';
        if (y === null || y === undefined)
            y = typeof x === 'number' ? -Infinity : '';
        return (x < y ? -1 : x > y ? 1 : 0) * dir || cmpStr_(a.d.id, b.d.id);
    });
    var totals = {};
    cand.forEach(function (c) {
        if (c.out === null)
            return;
        var t = totals[c.d.currency] = totals[c.d.currency] || { gross: 0, allocated: 0, outstanding: 0 };
        t.gross += c.gross;
        t.allocated += c.b.alloc;
        t.outstanding += c.out;
    });
    statStep_('filterSortMs', Date.now() - tf1);
    var tf2 = Date.now(), pg = paginate_(cand, p.page, p.pageSize);
    if (!ox) {
        var pageLines = [];
        pg.items.forEach(function (c) { (lineByDoc[c.d.id] || []).forEach(function (l) { pageLines.push(l); }); });
        ox = docOrderIndex_(user, pageLines);
    }
    var outItems = pg.items.map(function (c) { return docRowOut_(c.d, led, null, lineByDoc, ox); });
    statStep_('pageMs', Date.now() - tf2);
    return { items: outItems, total: pg.total, page: pg.page, pageSize: pg.pageSize, totalsByCurrency: totals, asOf: asOf, dataVersion: dataVersion_(), adv: adv };
}
function docActions_(user, d) {
    var a = [], mine = d.createdBy === user.id, appr = user.role === 'APPROVER';
    if (d.status === 'DRAFT' && can_(user, 'doc.write') && (mine || appr)) {
        a.push('save');
        if (can_(user, 'doc.submit'))
            a.push('submit');
        a.push('delete');
    }
    // Bị từ chối: người lập (nhập liệu) được sửa và gửi lại; người duyệt được xóa.
    if (d.status === 'REJECTED' && can_(user, 'doc.write')) {
        if (mine) {
            a.push('save');
            if (can_(user, 'doc.submit'))
                a.push('submit');
        }
        if (appr)
            a.push('delete');
    }
    if (d.status === 'SUBMITTED' && can_(user, 'doc.approve') && d.createdBy !== user.id && d.submittedBy !== user.id) {
        a.push('approve');
        a.push('reject');
    }
    if (d.status === 'APPROVED' && can_(user, 'doc.post'))
        a.push('post');
    if (d.status === 'POSTED' && can_(user, 'doc.adjust') && ['INVOICE', 'DEBIT_NOTE', 'VENDOR_STATEMENT'].indexOf(d.docType) >= 0) {
        a.push('adjust');
        a.push('reverse');
    }
    return a;
}
// Đối chiếu cha = con do máy chủ tính (giao diện chỉ hiển thị). Người bị giới hạn phạm vi chỉ thấy chứng từ trong phạm vi nên phép tính chỉ gồm phần đó.
function docReconcile_(user, d, lines, allocs, bal, asOf) {
    var childSum = 0, allocSum = 0;
    lines.forEach(function (l) { childSum += l.grossMinor || 0; });
    allocs.forEach(function (a) { if (!a.effectiveDate || a.effectiveDate <= asOf)
        allocSum += a.amountMinor || 0; });
    var ledgerAlloc = bal ? bal.alloc : 0;
    return { lineCount: lines.length, allocCount: allocs.length, childSumMinor: childSum, parentMinor: d.totalGrossMinor, childOk: childSum === d.totalGrossMinor, childDiffMinor: childSum - d.totalGrossMinor,
        allocSumMinor: allocSum, ledgerAllocMinor: ledgerAlloc, allocOk: allocSum === ledgerAlloc, allocDiffMinor: allocSum - ledgerAlloc, currency: d.currency, scoped: !(user.scope && user.scope.allPartners) };
}
function docGet_(user, req) {
    requirePerm_(user, 'read');
    var d = repoFind_('DebtDoc', req.payload.id);
    if (!d)
        throw err_('NOT_FOUND', 'Không tìm thấy chứng từ.');
    var pm = partnerMap_();
    assertVisible_(user, pm[d.partnerId], d.businessGroupCode, '', 'Không tìm thấy chứng từ.');
    var asOf = req.payload.asOf || todayVn_();
    var led = loadLedger_(user, asOf), shr = byId_(repoValid_('ShipmentRef')), accMapD = byId_(repoValid_('Accrual')), ordMapD = {};
    repoValid_('Order').forEach(function (o) { if (orderInScope_(user, o, pm))
        ordMapD[o.id] = o; });
    var lines = repoValid_('DebtLine').filter(function (l) { return l.docId === d.id; }).sort(function (a, b) { return a.lineNo - b.lineNo; });
    var payments = byId_(repoValid_('Payment'));
    var allocs = repoValid_('Allocation').filter(function (a) { return a.docId === d.id; }).map(function (a) {
        var pay = payments[a.paymentId];
        return { id: a.id, paymentId: a.paymentId, payNo: pay ? pay.payNo : '', amountMinor: a.amountMinor, effectiveDate: a.effectiveDate, debtLineId: a.debtLineId, reversesAllocId: a.reversesAllocId, fxDiffBaseMinor: a.fxDiffBaseMinor || 0 };
    });
    var bal = led.bal.byDoc[d.id];
    var users = byId_(repoValid_('AppUser'));
    var history = repoReadAll_('AuditLog').filter(function (a) { return a.entityType === 'DebtDoc' && a.entityId === d.id; })
        .map(function (a) { return { at: a.at, by: a.actorEmail, action: a.action }; });
    return { doc: Object.assign({}, docRowOut_(d, led, null, { [d.id]: lines }), {
            invoiceSerial: d.invoiceSerial, invoiceDate: d.invoiceDate, statementPeriod: d.statementPeriod, dueDateSource: d.dueDateSource, expectedPayDate: d.expectedPayDate,
            rejectReason: d.rejectReason, postingDate: d.postingDate, periodId: d.periodId, approvedBy: fmtUser_(users, d.approvedBy), createdByName: fmtUser_(users, d.createdBy),
            adjustsDocId: d.adjustsDocId, reversesDocId: d.reversesDocId, assuranceLevel: d.assuranceLevel, source: d.source, warningsJson: d.warningsJson, fxRateE4: d.fxRateE4 || 0, fxRate: fxText_(d.fxRateE4), fxSource: d.fxSource || '', totalBaseMinor: d.totalBaseMinor === undefined || d.totalBaseMinor === '' ? null : d.totalBaseMinor
        }),
        lines: lines.map(function (l) {
            var lb = led.bal.byLine[l.id], r = shr[l.shipmentRefId], ac = l.accrualId ? accMapD[l.accrualId] : null, od = ac && ac.orderId ? ordMapD[ac.orderId] : null;
            return { id: l.id, lineNo: l.lineNo, feeTypeCode: l.feeTypeCode, description: l.description, serviceCode: l.serviceCode || '', hsdvNo: od && l.serviceCode ? serviceNoOf_(od, l.serviceCode) : '', department: l.serviceCode ? serviceDept_(l.serviceCode) : '', declNo: r ? r.refValue : '', declDate: r ? r.refDate : '',
                containerQty: l.containerQty, unitPrice: l.unitPrice, netMinor: l.netMinor, vatMode: l.vatMode, vatRateBp: l.vatRateBp, vatMinor: l.vatMinor, grossMinor: l.grossMinor, isPassThrough: l.isPassThrough,
                adjustsLineId: l.adjustsLineId, lotNote: l.lotNote, statementPeriod: l.statementPeriod, allocatedMinor: lb ? lb.alloc : 0, outstandingMinor: lb ? lb.out : null };
        }),
        allocations: allocs, reconcile: docReconcile_(user, d, lines, allocs, bal, asOf), actions: docActions_(user, d), history: history, partner: partnerOut_(pm[d.partnerId]), asOf: asOf,
        pendingNote: d.status === 'POSTED' ? '' : 'Chứng từ chưa ghi nhận: chưa tính vào công nợ.' };
}
function resolveLineRefs_(tx, rawLines, lines, group, partnerId, direction) {
    var shrCache = {};
    tx.rows('ShipmentRef').forEach(function (r) { shrCache[r.refType + '|' + r.refValue + '|' + r.refDate] = r; });
    rawLines.forEach(function (raw, i) {
        var decl = String(raw.declNo || '').trim();
        if (decl) {
            var key = 'CUSTOMS_DECL|' + decl + '|' + (raw.declDate || ''), r = shrCache[key];
            if (raw.declDate && !isDate_(raw.declDate))
                throw err_('VALIDATION_FAILED', 'Ngày tờ khai không hợp lệ', [{ path: 'lines[' + i + '].declDate', code: 'DATE_INVALID', message: 'Ngày tờ khai không hợp lệ.' }]);
            if (!r) {
                r = tx.insert('ShipmentRef', { refType: 'CUSTOMS_DECL', refValue: decl, refDate: raw.declDate || '', serviceFileId: '', linkStatus: 'UNLINKED', evidence: '', lotNote: '' });
                shrCache[key] = r;
            }
            lines[i].shipmentRefId = r.id;
        }
    });
}
function docSave_(user, req) {
    requirePerm_(user, 'doc.write');
    var p = req.payload, prior = p && p.id ? repoFind_('DebtDoc', p.id) : null, fxCur = p && (p.currency || (prior && prior.currency)), fxDate = p && (p.docDate || (prior && prior.docDate));
    var fxp = (p && currencyMap_()[fxCur] && isDate_(fxDate) && fxDate >= ledgerStart_()) ? fxResolve_(user, fxCur, fxDate, p.fxRate) : null;
    return runTx_(user, { requestId: req.requestId, action: 'doc.save', payload: p, failAt: req.failAt }, function (tx) {
        var env = docEnv_(tx, p.partnerId, user), existing = p.id ? tx.find('DebtDoc', p.id) : null;
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy chứng từ.');
        if (existing) {
            assertVisible_(user, tx.find('Partner', existing.partnerId), existing.businessGroupCode, '', 'Không tìm thấy chứng từ.');
            if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED')
                throw err_('STATE_TRANSITION_INVALID', 'Chỉ sửa được chứng từ ở trạng thái nháp/bị từ chối. Chứng từ đã ghi nhận phải điều chỉnh hoặc đảo.');
            if (existing.status === 'REJECTED' ? existing.createdBy !== user.id : (existing.createdBy !== user.id && user.role !== 'APPROVER'))
                throw err_('FORBIDDEN', existing.status === 'REJECTED' ? 'Chứng từ bị từ chối: chỉ người lập được sửa và gửi lại.' : 'Chỉ người lập hoặc người duyệt được sửa bản nháp.');
        }
        var keepLines = !!(existing && existing.source === 'ORDER');
        if (keepLines) {
            p = Object.assign({}, p, { direction: existing.direction, partnerId: existing.partnerId, currency: existing.currency, businessGroupCode: existing.businessGroupCode,
                lines: tx.rows('DebtLine').filter(function (l) { return l.docId === existing.id; }).sort(function (x, y) { return x.lineNo - y.lineNo; }).map(function (l) {
                    return { feeTypeCode: l.feeTypeCode, description: l.description, netMinor: l.netMinor, vatMode: l.vatMode, vatRateBp: l.vatRateBp, containerQty: l.containerQty, unitPrice: l.unitPrice, isPassThrough: l.isPassThrough, serviceCode: l.serviceCode || '', declNo: '' };
                }) });
            env = docEnv_(tx, p.partnerId, user);
        }
        var v = validateDocInput_(p, env);
        if (v.errors.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', v.errors);
        assertScope_(user, env.partner, p.businessGroupCode);
        if (!keepLines)
            resolveLineRefs_(tx, p.lines, v.lines, p.businessGroupCode, env.partner.id, p.direction);
        var autoDue = (!keepLines || !existing.dueDate) && !p.dueDate ? applyPartnerTerm_(v.doc, env.partner) : false;
        var dups = findDuplicateDocs_(v.doc, tx.rows('DebtDoc'), existing && existing.id);
        var dfx = v.doc.currency !== BASE_CUR_ ? (fxp && fxp.cur === v.doc.currency && fxp.date === v.doc.docDate ? { e4: fxp.e4, source: fxp.source } : (function () { var f = fxFind_(v.doc.currency, v.doc.docDate, tx.rows('FxRate')); return f ? { e4: f.rateE4, source: f.source } : null; })()) : null;
        if (v.doc.currency !== BASE_CUR_ && !dfx)
            throw err_('FX_RATE_MISSING', 'Chưa có tỷ giá ' + v.doc.currency + '/' + BASE_CUR_ + ' ngày ' + rptDateVn_(v.doc.docDate) + '. Nhập ở ô "Tỷ giá" hoặc menu Tỷ giá.', [{ path: 'fxRate', code: 'FX_RATE_MISSING', message: 'Nhập tỷ giá ngày ' + rptDateVn_(v.doc.docDate) + '.' }]);
        var fields = Object.assign({}, v.doc, { fxRateE4: dfx ? dfx.e4 : 0, fxSource: dfx ? dfx.source : '', totalBaseMinor: dfx ? fxToBase_(v.doc.totalGrossMinor, (currencyMap_()[v.doc.currency] || { decimals: 0 }).decimals, dfx.e4) : v.doc.totalGrossMinor }, { status: 'DRAFT', source: 'MANUAL', assuranceLevel: 'VERIFIED', warningsJson: dups.length ? JSON.stringify({ duplicates: dups }) : '',
            searchText: normText_(env.partner.shortName + ' ' + v.doc.invoiceNo) });
        var doc;
        if (existing) {
            doc = tx.update('DebtDoc', existing.id, keepLines ? Object.assign({}, fields, { source: 'ORDER' }) : fields, p.ifVersion);
            if (!keepLines)
                tx.rows('DebtLine').forEach(function (l) { if (l.docId === existing.id)
                    tx.update('DebtLine', l.id, { isDeleted: 1 }); });
        }
        else
            doc = tx.insert('DebtDoc', Object.assign({ docNo: '', isOpening: 0, adjustsDocId: '', reversesDocId: '' }, fields));
        if (!keepLines)
            v.lines.forEach(function (l) { tx.insert('DebtLine', Object.assign({}, l, { docId: doc.id })); });
        return { result: { id: doc.id, status: 'DRAFT', version: existing ? existing.version + 1 : 1, totalGrossMinor: v.doc.totalGrossMinor, dueDate: v.doc.dueDate, dueAutoApplied: autoDue,
                warnings: dups.map(function (d) { return { code: 'W-DUP', message: 'Nghi trùng (' + d.reason + '): ' + (d.docNo || d.id) }; }).concat(v.lines.some(function (l) { return l.vatMode === 'UNCONFIRMED'; }) ? [{ code: 'W-TAX', message: 'Thuế chưa xác nhận' }] : []).concat(v.doc.dueDate ? [] : [{ code: 'W-DUE', message: 'Chưa có ngày đến hạn' }]) },
            audit: [{ entityType: 'DebtDoc', entityId: doc.id, action: existing ? 'doc.update' : 'doc.create', diff: { total: v.doc.totalGrossMinor, lines: v.lines.length } }] };
    });
}
function docTransition_(user, req, perm, action, fn) {
    requirePerm_(user, perm);
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: action, payload: p, failAt: req.failAt }, function (tx) {
        var d = tx.find('DebtDoc', p.id);
        if (!d)
            throw err_('NOT_FOUND', 'Không tìm thấy chứng từ.');
        assertVisible_(user, tx.find('Partner', d.partnerId), d.businessGroupCode, '', 'Không tìm thấy chứng từ.');
        var out = fn(tx, d, p);
        return { result: Object.assign({ id: d.id, version: d.version + 1 }, out.result), audit: [{ entityType: 'DebtDoc', entityId: d.id, action: action, diff: out.diff || null }] };
    });
}
function mustBe_(d, statuses) { if (statuses.indexOf(d.status) < 0)
    throw err_('STATE_TRANSITION_INVALID', 'Chứng từ đang ở trạng thái ' + d.status + ', không thực hiện được thao tác này.'); }
function docSubmit_(user, req) {
    return docTransition_(user, req, 'doc.submit', 'doc.submit', function (tx, d, p) {
        mustBe_(d, ['DRAFT', 'REJECTED']);
        if (d.status === 'REJECTED' ? d.createdBy !== user.id : (d.createdBy !== user.id && user.role !== 'APPROVER'))
            throw err_('FORBIDDEN', 'Chỉ người lập được gửi duyệt.');
        var lines = tx.rows('DebtLine').filter(function (l) { return l.docId === d.id; });
        if (!lines.length)
            throw err_('VALIDATION_FAILED', 'Chứng từ chưa có dòng phí.');
        if (sumBy_(lines, function (l) { return l.grossMinor; }) !== d.totalGrossMinor)
            throw err_('TOTAL_MISMATCH', 'Tổng dòng phí không khớp tổng chứng từ.');
        var no = d.docNo;
        if (!no) {
            var prefix = d.docType === 'REVERSAL' ? 'DH' : (d.docType === 'ADJ_INC' || d.docType === 'ADJ_DEC') ? 'DC' : (d.direction === 'AR' ? 'PT' : 'PTR'), y = (d.docDate || todayVn_()).slice(0, 4);
            no = prefix + '-' + y + '-' + ('000000' + tx.nextSeq('seq.' + prefix + '.' + y)).slice(-6);
        }
        tx.update('DebtDoc', d.id, { status: 'SUBMITTED', docNo: no, submittedBy: user.id, rejectReason: '' }, p.ifVersion);
        return { result: { status: 'SUBMITTED', docNo: no } };
    });
}
function docApprove_(user, req) {
    return docTransition_(user, req, 'doc.approve', 'doc.approve', function (tx, d, p) {
        mustBe_(d, ['SUBMITTED']);
        if (d.createdBy === user.id || d.submittedBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập/gửi duyệt không được tự duyệt.');
        tx.update('DebtDoc', d.id, { status: 'APPROVED', approvedBy: user.id, approvedAt: tx.now }, p.ifVersion);
        return { result: { status: 'APPROVED' } };
    });
}
function docReject_(user, req) {
    return docTransition_(user, req, 'doc.approve', 'doc.reject', function (tx, d, p) {
        mustBe_(d, ['SUBMITTED']);
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do từ chối.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do từ chối.' }]);
        if (d.createdBy === user.id || d.submittedBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập không được tự từ chối.');
        tx.update('DebtDoc', d.id, { status: 'REJECTED', rejectReason: maxStr_(p.reason, 500) }, p.ifVersion);
        return { result: { status: 'REJECTED' }, diff: { reason: p.reason } };
    });
}
function docDelete_(user, req) {
    return docTransition_(user, req, 'doc.write', 'doc.delete', function (tx, d, p) {
        mustBe_(d, ['DRAFT', 'REJECTED']);
        if (d.status === 'REJECTED' ? user.role !== 'APPROVER' : (d.createdBy !== user.id && user.role !== 'APPROVER'))
            throw err_('FORBIDDEN', d.status === 'REJECTED' ? 'Chứng từ bị từ chối: chỉ người duyệt được xóa.' : 'Chỉ người lập hoặc người duyệt được xóa bản nháp.');
        tx.update('DebtDoc', d.id, { status: 'DELETED', isDeleted: 1 }, p.ifVersion);
        tx.rows('DebtLine').forEach(function (l) { if (l.docId === d.id)
            tx.update('DebtLine', l.id, { isDeleted: 1 }); });
        releaseAccrualsOfDoc_(tx, d.id);
        return { result: { status: 'DELETED' } };
    });
}
function docPost_(user, req) {
    fxPrepDoc_(user, req.payload);
    return docTransition_(user, req, 'doc.post', 'doc.post', function (tx, d, p) {
        mustBe_(d, ['APPROVED']);
        var w = safeJson_(d.warningsJson, null);
        if (w && w.duplicates && w.duplicates.length && !w.acknowledged) {
            if (!p.acknowledgeDuplicates || !String(p.reason || '').trim())
                throw err_('DUPLICATE_SUSPECTED', 'Chứng từ nghi trùng với ' + w.duplicates.map(function (x) { return x.docNo || x.id; }).join(', ') + '. Xác nhận kèm lý do để ghi nhận.');
            w.acknowledged = { by: user.id, reason: maxStr_(p.reason, 300) };
        }
        var date = p.postingDate || d.docDate || todayVn_();
        if (!isDate_(date))
            throw err_('VALIDATION_FAILED', 'Ngày ghi nhận không hợp lệ');
        if (p.postingDate && date > todayVn_())
            throw err_('VALIDATION_FAILED', 'Ngày ghi nhận không được ở tương lai.', [{ path: 'postingDate', code: 'DATE_FUTURE', message: 'Không sau hôm nay.' }]);
        if (d.docDate && date < d.docDate)
            throw err_('VALIDATION_FAILED', 'Ngày ghi nhận không được trước ngày chứng từ (' + d.docDate + ').', [{ path: 'postingDate', code: 'DATE_BEFORE_DOC', message: 'Không trước ' + d.docDate + '.' }]);
        var periodId = assertPeriodOpen_(tx, date), creditWarn = [];
        if (d.docType === 'ADJ_DEC') {
            var dl = tx.rows('DebtLine').filter(function (l) { return l.docId === d.id; }), balNow = computeBalances(tx.rows('DebtDoc'), tx.rows('DebtLine'), tx.rows('Allocation'), '9999-12-31'), need = {};
            dl.forEach(function (l) { need[l.adjustsLineId] = (need[l.adjustsLineId] || 0) - l.grossMinor; });
            Object.keys(need).forEach(function (lid) { var bb = balNow.byLine[lid]; if (!bb || need[lid] > bb.out)
                throw err_('ADJ_OVER_OUTSTANDING', 'Điều chỉnh giảm vượt số dư còn lại của dòng gốc (đã có thanh toán/điều chỉnh khác). Sửa hoặc xóa bản nháp này.'); });
        }
        if (d.direction === 'AR' && d.docType !== 'REVERSAL' && d.docType !== 'ADJ_DEC' && !d.isOpening)
            creditWarn = enforceCredit_(tx, user, d.partnerId, d.currency, date > todayVn_() ? date : todayVn_(), 0, p);
        if (d.docType === 'REVERSAL') {
            var orig = tx.find('DebtDoc', d.reversesDocId);
            if (!orig || orig.status !== 'POSTED')
                throw err_('STATE_TRANSITION_INVALID', 'Chứng từ gốc không còn ở trạng thái đã ghi nhận.');
            var olines = byId_(tx.rows('DebtLine').filter(function (l) { return l.docId === orig.id; })), allocSum = 0;
            tx.rows('Allocation').forEach(function (a) { if (olines[a.debtLineId])
                allocSum += a.amountMinor; });
            if (allocSum !== 0)
                throw err_('ALLOC_EXISTS', 'Chứng từ gốc còn phân bổ thanh toán. Hãy đảo phân bổ trước khi đảo chứng từ.');
            tx.update('DebtDoc', orig.id, { status: 'REVERSED' });
        }
        tx.update('DebtDoc', d.id, Object.assign({ status: 'POSTED', postingDate: date, periodId: periodId, warningsJson: w ? JSON.stringify(w) : d.warningsJson }, fxStampFields_(d, tx.rows('FxRate'))), p.ifVersion);
        if (d.docType === 'REVERSAL')
            releaseAccrualsOfDoc_(tx, d.reversesDocId);
        else
            markAccrualsInvoiced_(tx, d.id);
        return { result: { status: 'POSTED', periodId: periodId, postingDate: date, warnings: creditWarn }, diff: creditWarn.length ? { credit: creditWarn.map(function (x) { return x.message; }) } : null };
    });
}
function docReverse_(user, req) {
    requirePerm_(user, 'doc.adjust');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'doc.reverse', payload: p, failAt: req.failAt }, function (tx) {
        var o = tx.find('DebtDoc', p.docId);
        if (!o)
            throw err_('NOT_FOUND', 'Không tìm thấy chứng từ gốc.');
        assertVisible_(user, tx.find('Partner', o.partnerId), o.businessGroupCode, '', 'Không tìm thấy chứng từ gốc.');
        if (o.status !== 'POSTED')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ đảo được chứng từ đã ghi nhận.');
        if (o.docType === 'REVERSAL' || o.docType === 'ADJ_INC' || o.docType === 'ADJ_DEC')
            throw err_('STATE_TRANSITION_INVALID', 'Không đảo chứng từ đảo/điều chỉnh; hãy lập điều chỉnh ngược lại.');
        if (tx.rows('DebtDoc').some(function (d) { return d.adjustsDocId === o.id && (d.docType === 'ADJ_INC' || d.docType === 'ADJ_DEC') && ['DELETED', 'REJECTED'].indexOf(d.status) < 0; }))
            throw err_('HAS_ADJUSTMENTS', 'Chứng từ đã có điều chỉnh (kể cả bản nháp/đang chờ). Xóa các bản điều chỉnh chưa ghi nhận hoặc lập điều chỉnh ngược để đưa chứng từ về nguyên trạng trước khi đảo.');
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do đảo.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do đảo.' }]);
        if (tx.rows('DebtDoc').some(function (d) { return d.reversesDocId === o.id && d.status !== 'DELETED' && d.status !== 'REJECTED'; }))
            throw err_('ALREADY_REVERSING', 'Đã có chứng từ đảo cho chứng từ này.');
        var date = p.docDate || todayVn_();
        if (!isDate_(date) || date < ledgerStart_() || (docEffDate_(o) && date < docEffDate_(o)))
            throw err_('VALIDATION_FAILED', 'Ngày chứng từ đảo không hợp lệ', [{ path: 'docDate', code: 'DATE_INVALID', message: 'Ngày không hợp lệ, trước ngày đầu sổ hoặc trước ngày chứng từ gốc.' }]);
        var lines = tx.rows('DebtLine').filter(function (l) { return l.docId === o.id && !l.adjustsLineId; });
        var rev = tx.insert('DebtDoc', { docNo: '', direction: o.direction, docType: 'REVERSAL', partnerId: o.partnerId, currency: o.currency, businessGroupCode: o.businessGroupCode,
            docDate: date, invoiceNo: '', invoiceSerial: '', invoiceDate: '', statementPeriod: '', dueDate: '', dueDateSource: 'NONE', expectedPayDate: '', statusNote: 'Đảo ' + o.docNo + ': ' + maxStr_(p.reason, 200),
            batchLabel: o.batchLabel, totalGrossMinor: -o.totalGrossMinor, status: 'DRAFT', isOpening: 0, source: 'MANUAL', assuranceLevel: 'VERIFIED', reversesDocId: o.id, adjustsDocId: o.id,
            searchText: normText_(o.docNo) });
        lines.forEach(function (l, i) {
            tx.insert('DebtLine', { docId: rev.id, lineNo: i + 1, feeTypeCode: l.feeTypeCode, description: 'Đảo: ' + l.description, serviceCode: l.serviceCode || '', shipmentRefId: l.shipmentRefId, containerQty: l.containerQty,
                netMinor: -l.netMinor, vatMode: l.vatMode, vatRateBp: l.vatRateBp, vatMinor: -l.vatMinor, grossMinor: -l.grossMinor, isPassThrough: l.isPassThrough, adjustsLineId: l.id, statementPeriod: l.statementPeriod });
        });
        var sum = sumBy_(lines, function (l) { return l.grossMinor; });
        if (sum !== o.totalGrossMinor)
            throw err_('TOTAL_MISMATCH', 'Tổng dòng phí gốc không khớp.');
        return { result: { id: rev.id, status: 'DRAFT' }, audit: [{ entityType: 'DebtDoc', entityId: rev.id, action: 'doc.reverse.create', diff: { of: o.id, reason: p.reason } }] };
    });
}
function pendingAdjDec_(tx, docId) {
    var docs = {}, out = {};
    tx.rows('DebtDoc').forEach(function (d) { if (d.docType === 'ADJ_DEC' && d.adjustsDocId === docId && ['DRAFT', 'SUBMITTED', 'APPROVED'].indexOf(d.status) >= 0)
        docs[d.id] = 1; });
    tx.rows('DebtLine').forEach(function (l) { if (docs[l.docId] && l.adjustsLineId)
        out[l.adjustsLineId] = (out[l.adjustsLineId] || 0) - l.grossMinor; });
    return out;
}
function docAdjust_(user, req) {
    requirePerm_(user, 'doc.adjust');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'doc.adjust', payload: p, failAt: req.failAt }, function (tx) {
        var o = tx.find('DebtDoc', p.docId);
        if (!o)
            throw err_('NOT_FOUND', 'Không tìm thấy chứng từ gốc.');
        assertVisible_(user, tx.find('Partner', o.partnerId), o.businessGroupCode, '', 'Không tìm thấy chứng từ gốc.');
        if (o.status !== 'POSTED')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ điều chỉnh chứng từ đã ghi nhận.');
        if (p.kind !== 'INC' && p.kind !== 'DEC')
            throw err_('VALIDATION_FAILED', 'Chọn điều chỉnh tăng hoặc giảm.');
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do điều chỉnh.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do điều chỉnh.' }]);
        var date = p.docDate || todayVn_();
        if (!isDate_(date) || date < ledgerStart_())
            throw err_('VALIDATION_FAILED', 'Ngày không hợp lệ', [{ path: 'docDate', code: 'DATE_INVALID', message: 'Ngày không hợp lệ hoặc trước ngày đầu sổ.' }]);
        var olines = byId_(tx.rows('DebtLine').filter(function (l) { return l.docId === o.id && !l.adjustsLineId; }));
        var led = loadLedger_({ role: 'APPROVER', scope: { allPartners: true } }, '9999-12-31');
        var errs = [], total = 0, sign = p.kind === 'DEC' ? -1 : 1, out = [], takenByLine = {}, pendingDec = pendingAdjDec_(tx, o.id);
        (p.lines || []).forEach(function (l, i) {
            var t = olines[l.targetLineId], path = 'lines[' + i + ']';
            if (!t) {
                errs.push({ path: path + '.targetLineId', code: 'NOT_FOUND', message: 'Chọn dòng phí gốc.' });
                return;
            }
            if (!Number.isSafeInteger(l.amountMinor) || l.amountMinor <= 0) {
                errs.push({ path: path + '.amountMinor', code: 'AMOUNT_INVALID', message: 'Số tiền phải là số nguyên dương.' });
                return;
            }
            var b = led.bal.byLine[t.id];
            takenByLine[t.id] = (takenByLine[t.id] || 0) + l.amountMinor;
            var room = b ? b.out - (pendingDec[t.id] || 0) : 0;
            if (sign < 0 && b && takenByLine[t.id] > room)
                errs.push({ path: path + '.amountMinor', code: 'ADJ_OVER_OUTSTANDING', message: 'Giảm quá số dư còn lại của dòng (' + b.out + (pendingDec[t.id] ? ', trừ ' + pendingDec[t.id] + ' đang chờ ở bản điều chỉnh khác' : '') + ').' });
            if (!String(l.description || '').trim())
                errs.push({ path: path + '.description', code: 'REQUIRED', message: 'Nhập diễn giải.' });
            total += sign * l.amountMinor;
            out.push({ t: t, l: l });
        });
        if (!out.length && !errs.length)
            errs.push({ path: 'lines', code: 'REQUIRED', message: 'Cần ít nhất một dòng điều chỉnh.' });
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        var adj = tx.insert('DebtDoc', { docNo: '', direction: o.direction, docType: sign > 0 ? 'ADJ_INC' : 'ADJ_DEC', partnerId: o.partnerId, currency: o.currency, businessGroupCode: o.businessGroupCode,
            docDate: date, invoiceNo: '', invoiceSerial: '', invoiceDate: '', statementPeriod: '', dueDate: '', dueDateSource: 'NONE', expectedPayDate: '', statusNote: maxStr_(p.reason, 300), batchLabel: o.batchLabel,
            totalGrossMinor: total, status: 'DRAFT', isOpening: 0, source: 'MANUAL', assuranceLevel: 'VERIFIED', adjustsDocId: o.id, reversesDocId: '', searchText: normText_(o.docNo) });
        out.forEach(function (x, i) {
            tx.insert('DebtLine', { docId: adj.id, lineNo: i + 1, feeTypeCode: x.t.feeTypeCode, description: maxStr_(x.l.description, 1000), serviceCode: x.t.serviceCode || '', shipmentRefId: x.t.shipmentRefId,
                netMinor: sign * x.l.amountMinor, vatMode: 'NONE', vatMinor: 0, grossMinor: sign * x.l.amountMinor, adjustsLineId: x.t.id });
        });
        var taxWarn = out.some(function (x) { return x.t.vatMode === 'EXCLUSIVE'; }) ? [{ code: 'W-ADJ-VAT', message: 'Dòng gốc có thuế GTGT: điều chỉnh này không tách VAT. Thuế xử lý bằng hóa đơn điều chỉnh theo quy định; bảng kê thuế liệt kê riêng các điều chỉnh.' }] : [];
        return { result: { id: adj.id, status: 'DRAFT', docType: adj.docType, warnings: taxWarn }, audit: [{ entityType: 'DebtDoc', entityId: adj.id, action: 'doc.adjust.create', diff: { of: o.id, kind: p.kind, total: total } }] };
    });
}
function driveFolder_(propKey, name) {
    var id = props_().getProperty(propKey);
    if (id) {
        try {
            return DriveApp.getFolderById(id);
        }
        catch (e) { }
    }
    var f = DriveApp.createFolder(name);
    f.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
    props_().setProperty(propKey, f.getId());
    return f;
}
function moneyCell_(v, cur) {
    if (typeof v !== 'number')
        return v === undefined || v === null ? '' : sanitizeCell_(String(v));
    var dec = (currencyMap_()[cur] || { decimals: 0 }).decimals;
    return v / Math.pow(10, dec);
}
// ===== Mẫu báo cáo chuyên nghiệp (PDF / Excel) =====
// reportLayout_ là hàm thuần: dựng bố cục (ô, gộp ô, kiểu, độ rộng) từ dữ liệu báo cáo; buildReportSheet_ chỉ áp bố cục này lên Google Sheets.
var RPT_STYLE_ = { brand: '#1f3a5f', headFill: '#1f3a5f', headInk: '#ffffff', zebra: '#f6f8fb', group: '#e3eaf4', subtotal: '#eef2f8', total: '#d5e0f0', border: '#b9c3d3', muted: '#6b7280', danger: '#b00020' };
function rptDateVn_(v) { return HAKFormat.formatDate(v, ''); }
// Ô ngày trong Excel: ngày thật (12:00 để không lệch múi giờ) định dạng dd/MM/yyyy; ngày sai lịch thì giữ chuỗi gốc.
function rptDateCell_(v) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(v == null ? '' : v)); if (!m) return v == null ? '' : String(v); var y = +m[1], mo = +m[2], d = +m[3], dt = new Date(y, mo - 1, d, 12, 0, 0); return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d ? dt : String(v); }
function rptColWidth_(c, rows) {
    if (c.type === 'money')
        return 112;
    if (c.type === 'date')
        return 84;
    if (c.type === 'int')
        return Math.max(64, String(c.label || '').length * 5 + 20);
    var mx = String(c.label || '').length * 7 + 18;
    rows.forEach(function (r) { var v = r.cells[c.key]; if (v !== undefined && v !== null)
        mx = Math.max(mx, Math.min(String(v).length, 60) * 6.4 + 16); });
    return Math.round(Math.max(64, Math.min(300, mx)));
}
function rptSummaryLines_(rep) {
    var cols = rep.columns.filter(function (c) { return c.type === 'money'; }), out = [];
    rep.rows.forEach(function (r) {
        if (r.t !== 'total' || !cols.length)
            return;
        var dec = (currencyMap_()[r.currency] || { decimals: 0 }).decimals, parts = [];
        cols.forEach(function (c) { var v = r.cells[c.key]; if (typeof v === 'number' && !/^Lũy kế/.test(c.label))
            parts.push(c.label + ' ' + formatMinorVn_(v, dec)); });
        if (parts.length)
            out.push((r.currency ? r.currency + ' — ' : '') + String(r.cells[rep.columns[0].key] || 'Tổng') + ': ' + parts.slice(0, 5).join(' · '));
    });
    return out.slice(0, 6);
}
function reportLayout_(rep, label) {
    var cols = rep.columns, nc = cols.length, e = rep.meta.entity || {}, rows = [], merges = [], widths = cols.map(function (c) { return rptColWidth_(c, rep.rows); }), totalW = widths.reduce(function (a, b) { return a + b; }, 0);
    function blank() { var a = []; for (var i = 0; i < nc; i++)
        a.push(''); return a; }
    function line(kind, text, o) { var cells = blank(); cells[0] = text; rows.push(Object.assign({ kind: kind, cells: cells, height: 20 }, o || {})); merges.push([rows.length, 1, 1, nc]); return rows.length; }
    function est(text, w) { return Math.max(1, Math.ceil(String(text).length * 6.4 / Math.max(120, w))); }
    if (totalW < 560 && totalW > 0) {
        var k = 560 / totalW;
        widths = widths.map(function (w) { return Math.round(w * k); });
        totalW = widths.reduce(function (a, b) { return a + b; }, 0);
    }
    var contact = [e.address, e.taxCode ? 'MST: ' + e.taxCode : '', e.phone ? 'ĐT: ' + e.phone : '', e.email].filter(Boolean).join(' · ');
    var company = e.name || '(Chưa cấu hình tên doanh nghiệp: Config entity.name)', title = rep.title + (rep.meta.statementPeriod ? ' – THÁNG ' + rep.meta.statementPeriod.slice(5) + '/' + rep.meta.statementPeriod.slice(0, 4) : '');
    var p = rep.meta.params || {}, sub = ['Ngày chốt: ' + rptDateVn_(rep.meta.asOf)];
    if (p.from && p.to)
        sub.push('Từ ' + rptDateVn_(p.from) + ' đến ' + rptDateVn_(p.to));
    if (rep.meta.partner)
        sub.push('Đối tác: ' + rep.meta.partner);
    if (rep.meta.order)
        sub.push('Đơn hàng: ' + rep.meta.order);
    if (p.currency)
        sub.push('Tiền tệ: ' + p.currency);
    if (p.group)
        sub.push('Nhóm: ' + p.group);
    sub.push('Cơ sở ngày: ' + (rep.meta.dateBasis || 'Ngày ghi nhận'));
    var subText = sub.join('  ·  '), code = 'GML-RPT-' + rep.code.slice(1), compact = nc >= 6, frozen, hdr;
    function span(kind, parts, height) {
        // parts: [[chỉ số cột bắt đầu, số cột, văn bản]] — mỗi phần là một ô gộp
        var cells = blank(), row = rows.length + 1;
        parts.forEach(function (x) { cells[x[0]] = x[2]; merges.push([row, x[0] + 1, 1, x[1]]); });
        rows.push({ kind: kind, cells: cells, height: height, parts: parts.map(function (x) { return [x[0], x[1]]; }) });
    }
    if (compact) {
        // Băng tiêu đề gọn (3 hàng cố định, lặp ở mọi trang in): công ty | tên báo cáo | trạng thái, địa chỉ | mã mẫu, tiêu đề cột.
        var lw = Math.max(2, Math.round(nc * 0.28)), rw = Math.max(2, Math.round(nc * 0.28)), mw = nc - lw - rw;
        if (mw < 2) {
            mw = 2;
            lw = Math.max(1, Math.floor((nc - mw) / 2));
            rw = nc - mw - lw;
        }
        var midW = widths.slice(lw, lw + mw).reduce(function (a, b) { return a + b; }, 0), tl = Math.max(1, Math.ceil(title.length * 9.6 / Math.max(120, midW))), tsize = tl <= 1 ? 15 : 12;
        if (tl > 1)
            tl = Math.max(1, Math.ceil(title.length * 7.6 / Math.max(120, midW)));
        span('mast1', [[0, lw, company], [lw, mw, title], [lw + mw, rw, label || '']], tl <= 1 ? 34 : 15 * tl + 10);
        rows[rows.length - 1].titleSize = tsize;
        span('mast2', [[0, lw + mw, contact || ' '], [lw + mw, rw, code + ' · Ngày chốt ' + rptDateVn_(rep.meta.asOf)]], 20);
        frozen = 3;
    }
    else {
        // Bảng hẹp (ví dụ biên bản đối chiếu): khối tiêu đề đầy đủ, không đóng băng.
        var l2 = Math.max(1, Math.ceil(nc * 0.65)), r2 = nc - l2;
        if (r2 > 0)
            span('company', [[0, l2, company], [l2, r2, code]], 24);
        else
            span('company', [[0, nc, company]], 24);
        line('contact', contact || ' ', { height: 18 });
        line('title', title, { height: 34 });
        line('subtitle', subText, { height: 16 * est(subText, totalW) + 4 });
        line('status', label || '', { height: 20 });
        line('spacer', ' ', { height: 6 });
        frozen = 0;
    }
    hdr = rows.length + 1;
    rows.push({ kind: 'header', cells: cols.map(function (c) { return c.label; }), height: 36 });
    if (compact) {
        line('band', 'Điều kiện báo cáo: ' + subText, { height: 14 * est(subText, totalW) + 6 });
    }
    var sum = rptSummaryLines_(rep);
    if (sum.length) {
        line('summaryHead', 'TÓM TẮT', { height: 20 });
        sum.forEach(function (t) { line('summary', t, { height: 18 * est(t, totalW) }); });
    }
    var dataStart = rows.length + 1;
    var n = 0;
    rep.rows.forEach(function (r) {
        var dec = (currencyMap_()[r.currency] || { decimals: 0 }).decimals;
        var cells = cols.map(function (c) {
            var v = r.cells[c.key];
            if (c.type === 'money')
                return moneyCell_(v, r.currency);
            if (v === undefined || v === null)
                return '';
            if (c.type === 'date')
                return rptDateCell_(v);
            return typeof v === 'number' ? v : sanitizeCell_(String(v));
        });
        var fm = cols.map(function (c) { return c.type === 'money' ? (dec === 0 ? '#,##0;[Red]-#,##0;0' : '#,##0.00;[Red]-#,##0.00;0.00') : (c.type === 'int' ? '#,##0' : (c.type === 'date' ? 'dd/MM/yyyy' : '@')); });
        if (r.t === 'data')
            n++;
        rows.push({ kind: r.t, cells: cells, fmts: fm, zebra: r.t === 'data' && n % 2 === 0, height: 0 });
    });
    var firstData = dataStart, lastData = dataStart + rep.rows.length - 1;
    line('spacer', ' ', { height: 8 });
    rep.words.forEach(function (w) { var t = 'BẰNG CHỮ: ' + w; line('words', t, { height: 18 * est(t, totalW) }); });
    rep.notes.forEach(function (t) { line('note', 'Ghi chú: ' + t, { height: 16 * est(t, totalW) }); });
    if (rep.meta.bank && rep.code === 'R05')
        line('note', 'THÔNG TIN CHUYỂN KHOẢN: ' + rep.meta.bank, { height: 18 });
    var sig = null;
    if (rep.signatures) {
        line('spacer', ' ', { height: 10 });
        var s = rep.bothParties ? ['ĐẠI DIỆN BÊN A (' + (e.name || 'GML') + ')', '', 'ĐẠI DIỆN BÊN B (' + (rep.meta.partner || '') + ')'] : ['Người lập', 'Người kiểm tra', 'Người duyệt'], a = Math.max(1, Math.floor(nc / 3)), cells = blank(), c2 = blank(), c3 = blank();
        cells[0] = s[0];
        if (s[1])
            cells[Math.min(nc - 1, a)] = s[1];
        cells[Math.min(nc - 1, nc < 5 ? nc - 1 : 2 * a)] = s[2];
        var hint = rep.bothParties ? '(Ký, ghi rõ họ tên, đóng dấu)' : '(Ký, ghi rõ họ tên)';
        cells.forEach(function (v, i) { if (v)
            c2[i] = hint; });
        rows.push({ kind: 'sig', cells: cells, height: 20 });
        rows.push({ kind: 'sigHint', cells: c2, height: 18 });
        rows.push({ kind: 'sigSpace', cells: blank(), height: 56 });
        rows.push({ kind: 'sigName', cells: (function () { var z = blank(); if (!rep.bothParties)
                z[0] = rep.meta.user || ''; return z; })(), height: 20 });
        sig = rows.length - 3;
    }
    line('spacer', ' ', { height: 8 });
    line('footer', 'Tài liệu nội bộ · lập từ KATY AP/AR' + (rep.meta.user ? ' · người lập: ' + rep.meta.user : '') + ' · phiên bản dữ liệu ' + (rep.meta.dataVersion || '') + ' · ' + rep.code, { height: 16 });
    return { sheetName: rep.code, widths: widths, rows: rows, merges: merges, frozenRows: frozen, headerRow: hdr, firstData: firstData, lastData: lastData, nc: nc, orientation: rep.orientation, landscape: rep.orientation !== 'portrait', paper: nc > 14 ? 'A3' : 'A4',
        help: reportHelpRows_(rep) };
}
// Trang "Hướng dẫn đọc" đi kèm tệp Excel: cách tính, nguồn, phạm vi lọc, các lưu ý chung.
function reportHelpRows_(rep) {
    var p = rep.meta.params || {}, out = [['HƯỚNG DẪN ĐỌC BÁO CÁO ' + rep.code, ''], ['Tên báo cáo', rep.title], ['Ngày chốt', rptDateVn_(rep.meta.asOf)], ['Cơ sở ngày', rep.meta.dateBasis || 'Ngày ghi nhận'],
        ['Tiền tệ', 'Mỗi tiền tệ được trình bày và cộng riêng; không quy đổi, không cộng chéo VND với USD.'], ['Số tiền', 'Làm tròn theo số lẻ của từng tiền tệ; số âm màu đỏ.']];
    Object.keys(p).forEach(function (k) { if (p[k] !== '' && p[k] !== undefined && p[k] !== null && typeof p[k] !== 'object')
        out.push(['Tham số ' + k, String(p[k])]); });
    rep.notes.forEach(function (t) { out.push(['Ghi chú', t]); });
    out.push(['Nguồn', 'Dữ liệu từ KATY AP/AR tại thời điểm xuất; số liệu có hiệu lực theo cơ sở ngày nêu trên. Bản nháp chưa chốt không thay cho bản chốt (có mã băm).']);
    return out;
}
function buildReportSheet_(rep, label) {
    var L = reportLayout_(rep, label), ss = SpreadsheetApp.create('TMP_RPT_' + rep.code + '_' + Date.now()), sh = ss.getSheets()[0], nc = L.nc, R = RPT_STYLE_;
    sh.setName(L.sheetName);
    sh.setHiddenGridlines(true);
    var maxCols = sh.getMaxColumns();
    if (maxCols > nc + 1)
        sh.deleteColumns(nc + 1, maxCols - nc - 1);
    var nr = L.rows.length;
    if (sh.getMaxRows() < nr + 2)
        sh.insertRowsAfter(sh.getMaxRows(), nr + 2 - sh.getMaxRows());
    var all = sh.getRange(1, 1, nr, nc);
    all.setFontFamily('Arial').setFontSize(10).setVerticalAlignment('middle');
    var fmtAll = L.rows.map(function (r) { return r.fmts || r.cells.map(function () { return '@'; }); });
    all.setNumberFormats(fmtAll);
    all.setValues(L.rows.map(function (r) { return r.cells; }));
    L.merges.forEach(function (m) { sh.getRange(m[0], m[1], m[2], m[3]).merge(); });
    L.rows.forEach(function (r, i) {
        var rg = sh.getRange(i + 1, 1, 1, nc), k = r.kind;
        if (r.height)
            sh.setRowHeight(i + 1, r.height);
        if (k === 'mast1') {
            rg.setVerticalAlignment('middle');
            sh.getRange(i + 1, r.parts[0][0] + 1).setFontWeight('bold').setFontColor(R.brand).setFontSize(11).setWrap(true).setHorizontalAlignment('left');
            sh.getRange(i + 1, r.parts[1][0] + 1).setFontWeight('bold').setFontColor(R.brand).setFontSize(r.titleSize || 15).setWrap(true).setHorizontalAlignment('center');
            sh.getRange(i + 1, r.parts[2][0] + 1).setFontWeight('bold').setFontColor(R.danger).setFontSize(8).setWrap(true).setHorizontalAlignment('right');
        }
        else if (k === 'mast2') {
            rg.setFontColor(R.muted).setFontSize(8).setBorder(null, null, true, null, null, null, R.brand, SpreadsheetApp.BorderStyle.SOLID);
            sh.getRange(i + 1, r.parts[0][0] + 1).setWrap(true).setHorizontalAlignment('left');
            sh.getRange(i + 1, r.parts[1][0] + 1).setHorizontalAlignment('right');
        }
        else if (k === 'band')
            rg.setFontStyle('italic').setFontColor('#374151').setFontSize(9).setWrap(true).setBackground('#fafbfd');
        else if (k === 'company') {
            rg.setFontWeight('bold').setFontColor(R.brand);
            sh.getRange(i + 1, 1).setFontSize(13);
            if (r.parts[1])
                sh.getRange(i + 1, r.parts[1][0] + 1).setHorizontalAlignment('right').setFontColor(R.muted).setFontWeight('normal').setFontSize(9);
        }
        else if (k === 'contact')
            rg.setFontColor(R.muted).setFontSize(9);
        else if (k === 'title')
            rg.setFontWeight('bold').setFontSize(16).setFontColor(R.brand).setHorizontalAlignment('center');
        else if (k === 'subtitle')
            rg.setHorizontalAlignment('center').setFontColor('#374151').setFontSize(10).setWrap(true);
        else if (k === 'status')
            rg.setHorizontalAlignment('center').setFontColor(R.danger).setFontWeight('bold').setFontSize(9);
        else if (k === 'summaryHead')
            rg.setFontWeight('bold').setBackground(R.group).setFontColor(R.brand);
        else if (k === 'summary')
            rg.setBackground('#fafbfd').setWrap(true).setFontSize(10);
        else if (k === 'header') {
            rg.setBackground(R.headFill).setFontColor(R.headInk).setFontWeight('bold').setWrap(true).setHorizontalAlignment('center');
        }
        else if (k === 'group')
            rg.setBackground(R.group).setFontWeight('bold');
        else if (k === 'subtotal')
            rg.setBackground(R.subtotal).setFontWeight('bold');
        else if (k === 'total')
            rg.setBackground(R.total).setFontWeight('bold');
        else if (k === 'data' && r.zebra)
            rg.setBackground(R.zebra);
        else if (k === 'words')
            rg.setFontStyle('italic').setFontWeight('bold').setWrap(true);
        else if (k === 'note')
            rg.setFontStyle('italic').setFontColor('#374151').setFontSize(9).setWrap(true);
        else if (k === 'sig' || k === 'sigName')
            rg.setFontWeight('bold');
        else if (k === 'sigHint')
            rg.setFontStyle('italic').setFontColor(R.muted).setFontSize(9);
        else if (k === 'footer')
            rg.setHorizontalAlignment('center').setFontColor(R.muted).setFontSize(8);
    });
    // thân bảng: viền, căn lề theo kiểu cột, xuống dòng cho cột chữ
    var bodyRows = L.lastData - L.headerRow + 1;
    sh.getRange(L.headerRow, 1, bodyRows, nc).setBorder(true, true, true, true, true, true, R.border, SpreadsheetApp.BorderStyle.SOLID);
    if (L.lastData >= L.firstData) {
        rep.columns.forEach(function (c, i) {
            var rg = sh.getRange(L.firstData, i + 1, L.lastData - L.firstData + 1, 1);
            rg.setHorizontalAlignment(c.align === 'right' ? 'right' : c.align === 'center' ? 'center' : 'left');
            if (c.type === 'text')
                rg.setWrap(true);
            rg.setVerticalAlignment('top');
        });
        L.rows.forEach(function (r, i) { if (r.kind === 'total')
            sh.getRange(i + 1, 1, 1, nc).setBorder(true, null, true, null, null, null, R.brand, SpreadsheetApp.BorderStyle.SOLID_MEDIUM); });
    }
    L.widths.forEach(function (w, i) { sh.setColumnWidth(i + 1, w); });
    sh.setFrozenRows(L.frozenRows);
    sh.setTabColor(R.brand);
    var logoId = cfgGet_('entity.logoFileId', '');
    if (logoId) {
        try {
            var img = sh.insertImage(DriveApp.getFileById(logoId).getBlob(), nc, 1);
            img.setHeight(40).setWidth(100);
        }
        catch (x) { }
    }
    // trang hướng dẫn đọc (chỉ xuất hiện trong tệp Excel; PDF xuất theo gid của trang báo cáo)
    try {
        var hs = ss.insertSheet('Hướng dẫn đọc'), hp = L.help;
        hs.getRange(1, 1, hp.length, 2).setValues(hp).setFontFamily('Arial').setWrap(true).setVerticalAlignment('top');
        hs.getRange(1, 1).setFontWeight('bold').setFontSize(13).setFontColor(R.brand);
        hs.getRange(2, 1, hp.length - 1, 1).setFontWeight('bold');
        hs.setColumnWidth(1, 160);
        hs.setColumnWidth(2, 560);
        hs.setHiddenGridlines(true);
    }
    catch (x) { }
    SpreadsheetApp.flush();
    return { ss: ss, sheet: sh, layout: L };
}
function exportReportFile_(rep, fmt, label) {
    var built = buildReportSheet_(rep, label), ss = built.ss;
    try {
        var portrait = rep.orientation === 'portrait', base = 'https://docs.google.com/spreadsheets/d/' + ss.getId() + '/export?gid=' + built.sheet.getSheetId();
        var url = fmt === 'xlsx' ? base + '&format=xlsx' : base + '&format=pdf&size=' + (rep.columns.length > 14 ? 'A3' : 'A4') + '&portrait=' + portrait + '&fitw=true&gridlines=false&fzr=true&sheetnames=false&printtitle=false&pagenum=CENTER&horizontal_alignment=CENTER&top_margin=0.5&bottom_margin=0.6&left_margin=0.4&right_margin=0.4';
        var resp = UrlFetchApp.fetch(url, { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
        if (resp.getResponseCode() !== 200)
            throw err_('EXPORT_FAILED', 'Không xuất được tệp (' + resp.getResponseCode() + ').');
        return resp.getBlob();
    }
    finally {
        discardTempSheet_(ss, built.sheet);
    }
}
/* Xóa tệp bảng tính tạm: xóa hẳn nếu đã bật dịch vụ nâng cao Drive API (Drive.Files.remove), nếu không thì xóa sạch nội dung rồi bỏ vào thùng rác để dữ liệu báo cáo không nằm lại trong thùng rác 30 ngày. */
function discardTempSheet_(ss, sheet) {
    var id = ss.getId();
    try {
        Drive.Files.remove(id);
        return true;
    }
    catch (e) { }
    try {
        sheet.clear();
        SpreadsheetApp.flush();
    }
    catch (e) { }
    try {
        DriveApp.getFileById(id).setTrashed(true);
    }
    catch (e) { }
    return false;
}
function blobOut_(blob, name, fmt) {
    var bytes = blob.getBytes();
    return { fileName: name + '.' + fmt, mimeType: fmt === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', sizeBytes: bytes.length, base64: Utilities.base64Encode(bytes) };
}
function reportExport_(user, req) {
    requirePerm_(user, 'report.export');
    var fmt = req.payload.format === 'xlsx' ? 'xlsx' : 'pdf', rep = reportRun_(user, req);
    var blob = exportReportFile_(rep, fmt, 'BẢN NHÁP – CHƯA CHỐT · in lúc ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') + ' · ' + (user.displayName || user.email));
    writeAudit_(user, req.requestId || '', '', [{ entityType: 'Report', entityId: rep.code, action: 'report.export', diff: { format: fmt, params: rep.meta.params } }]);
    return blobOut_(blob, rep.code + '_' + rep.meta.asOf, fmt);
}
/* Khóa phiên bản bản chốt: cùng mã báo cáo, kỳ/ngày chốt, đối tác VÀ cùng bộ lọc (nhóm, tiền tệ, chiều, quỹ, khoảng ngày, đối tác lọc) mới là phiên bản của nhau. */
function snapshotKey_(rep) {
    var m = rep.meta, p = m.params || {};
    var key = rep.code + '-' + (m.statementPeriod || m.asOf) + (m.partnerShort ? '-' + normText_(m.partnerShort).replace(/ /g, '') : (m.partner ? '-' + normText_(m.partner).replace(/ /g, '').slice(0, 12) : ''));
    [['g', p.group], ['c', p.currency], ['d', p.direction], ['q', p.cashAccountCode], ['f', p.from], ['t', p.to], ['p', p.partnerId], ['o', p.onlyOutstanding ? 'Y' : '']].forEach(function (x) {
        var v = String(x[1] === undefined || x[1] === null ? '' : x[1]).replace(/[^A-Za-z0-9]/g, '').slice(0, 24);
        if (v)
            key += '-' + x[0] + v;
    });
    return key;
}
function reportIssue_(user, req) {
    requirePerm_(user, 'report.issue');
    if (req.payload && req.payload.params && req.payload.params.dateBasis === 'DOC')
        throw err_('VALIDATION_FAILED', 'Bản chốt chỉ lập theo ngày ghi nhận (không lập theo chế độ ngày chứng từ).', [{ path: 'params.dateBasis', code: 'DATE_BASIS', message: 'Chọn cơ sở ngày: ngày ghi nhận.' }]);
    var rep = reportRun_(user, req);
    if (rep.issueBlockers.length)
        throw err_('TAX_UNCONFIRMED', rep.issueBlockers.join(' '));
    var key = snapshotKey_(rep), txPayload = { code: rep.code, key: key, params: rep.meta.params };
    if (req.requestId) {
        var prior = findTxByRequest_(req.requestId);
        if (prior)
            return replayTx_(prior, sha256Hex_(JSON.stringify(txPayload)), user, 'report.issue');
    }
    function labelFor(list) { return 'RPT-' + key + '-v' + ('0' + (list.length + 1)).slice(-2); }
    function sameKey(s) { return s.versionLabel.indexOf('RPT-' + key + '-v') === 0; }
    var label = labelFor(repoValid_('ReportSnapshot').filter(sameKey));
    var json = JSON.stringify(rep), hash = sha256Hex_(json), folder = driveFolder_('REPORT_FOLDER_ID', 'CONGNO_REPORTS');
    var dataFile = folder.createFile(label + '.json', json, 'application/json');
    var pdfBlob = exportReportFile_(rep, 'pdf', 'BẢN CHỐT ' + label + ' · chụp lúc ' + Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm') + ' · mã dữ liệu ' + hash.slice(0, 8));
    var pdfFile = folder.createFile(pdfBlob.setName(label + '.pdf'));
    try {
        return runTx_(user, { requestId: req.requestId, action: 'report.issue', payload: txPayload }, function (tx) {
            var existing = tx.rows('ReportSnapshot').filter(sameKey);
            if (labelFor(existing) !== label)
                throw err_('SERVER_BUSY', 'Vừa có bản chốt khác của cùng báo cáo được phát hành; vui lòng thử lại.');
            existing.forEach(function (s) { tx.update('ReportSnapshot', s.id, { status: 'SUPERSEDED' }); });
            var row = tx.insert('ReportSnapshot', { reportCode: rep.code, versionLabel: label, paramsJson: JSON.stringify(rep.meta.params), asOfDate: rep.meta.asOf, dataFileId: dataFile.getId(), pdfFileId: pdfFile.getId(),
                dataSha256: hash, status: 'ISSUED', issuedBy: user.id, issuedAt: tx.now, dataVersion: dataVersion_() });
            return { result: { id: row.id, versionLabel: label, dataSha256: hash }, audit: [{ entityType: 'ReportSnapshot', entityId: row.id, action: 'report.issue', diff: { label: label, hash: hash } }] };
        });
    }
    catch (e) {
        try {
            dataFile.setTrashed(true);
            pdfFile.setTrashed(true);
        }
        catch (x) { }
        throw e;
    }
}
/* Bản chốt có đối tác: theo phạm vi đối tác. Bản chốt không gắn đối tác (R01, R02, R03, R07, R08, R09) chứa dữ liệu theo phạm vi của người phát hành, nên chỉ người có phạm vi toàn bộ hoặc chính người phát hành được xem. */
function fullScope_(user) { var sc = user.scope || {}; return !!sc.allPartners && !(sc.businessGroups && sc.businessGroups.length); }
function snapshotVisible_(user, s, pm) {
    var prm = safeJson_(s.paramsJson, {});
    if (prm.partnerId)
        return inScope_(user, pm[prm.partnerId], '');
    return fullScope_(user) || s.issuedBy === user.id;
}
function reportSnapshots_(user, req) {
    requirePerm_(user, 'report.read');
    var pm = partnerMap_();
    var items = repoValid_('ReportSnapshot').filter(function (s) { if (req.payload && req.payload.code && s.reportCode !== req.payload.code)
        return false; return snapshotVisible_(user, s, pm); })
        .sort(function (a, b) { return cmpStr_(b.issuedAt, a.issuedAt); }).map(function (s) { return { id: s.id, versionLabel: s.versionLabel, reportCode: s.reportCode, asOfDate: s.asOfDate, status: s.status, issuedAt: s.issuedAt, dataSha256: s.dataSha256 }; });
    return { items: items };
}
function reportSnapshotExport_(user, req) {
    requirePerm_(user, 'report.export');
    var s = repoFind_('ReportSnapshot', req.payload.id);
    if (!s)
        throw err_('NOT_FOUND', 'Không tìm thấy bản chốt.');
    if (!snapshotVisible_(user, s, partnerMap_()))
        throw err_('OUT_OF_SCOPE', 'Ngoài phạm vi dữ liệu được cấp.');
    var json = DriveApp.getFileById(s.dataFileId).getBlob().getDataAsString();
    if (sha256Hex_(json) !== s.dataSha256)
        throw err_('SNAPSHOT_CORRUPT', 'Dữ liệu bản chốt không khớp mã băm.');
    var fmt = req.payload.format === 'xlsx' ? 'xlsx' : 'pdf', rep = JSON.parse(json);
    var blob = exportReportFile_(rep, fmt, 'BẢN CHỐT ' + s.versionLabel + (s.status === 'SUPERSEDED' ? ' (đã được thay thế)' : '') + ' · mã dữ liệu ' + s.dataSha256.slice(0, 8));
    writeAudit_(user, req.requestId || '', '', [{ entityType: 'ReportSnapshot', entityId: s.id, action: 'report.exportSnapshot', diff: { format: fmt } }]);
    return blobOut_(blob, s.versionLabel, fmt);
}
var BANK_TEMPLATE_COLS = ['Ngày', 'Tài khoản quỹ', 'Thu', 'Chi', 'Mã GD ngân hàng', 'Đối tác', 'Diễn giải', 'Số HĐ/Mã dịch vụ'];
function parseCsv_(text) {
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < text.length; i++) {
        var c = text[i];
        if (q) {
            if (c === '"' && text[i + 1] === '"') {
                f += '"';
                i++;
            }
            else if (c === '"')
                q = false;
            else
                f += c;
        }
        else if (c === '"')
            q = true;
        else if (c === ',') {
            row.push(f);
            f = '';
        }
        else if (c === '\n') {
            row.push(f);
            rows.push(row);
            row = [];
            f = '';
        }
        else if (c !== '\r')
            f += c;
    }
    if (f !== '' || row.length) {
        row.push(f);
        rows.push(row);
    }
    return rows;
}
function parseDateVn_(s) {
    var m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(s).trim());
    if (!m)
        return null;
    var d = +m[1], mo = +m[2], y = +m[3], dt = new Date(Date.UTC(y, mo - 1, d));
    if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d)
        return null;
    return y + '-' + ('0' + mo).slice(-2) + '-' + ('0' + d).slice(-2);
}
function parseAmountMinor_(s, decimals) {
    s = String(s).trim();
    if (s === '')
        return { empty: true };
    var dec = decimals === 0 ? 0 : (Number.isInteger(decimals) && decimals > 0 && decimals <= 6 ? decimals : 2), neg = s[0] === '-';
    if (neg)
        s = s.slice(1);
    s = s.replace(/\s/g, '');
    var lastDot = s.lastIndexOf('.'), lastComma = s.lastIndexOf(','), sep = null;
    if (dec && lastDot >= 0 && lastComma >= 0)
        sep = lastComma > lastDot ? ',' : '.';
    else if (dec && lastComma >= 0 && s.length - lastComma - 1 <= dec)
        sep = ',';
    else if (dec && lastDot >= 0 && s.length - lastDot - 1 <= dec)
        sep = '.';
    var parts = sep ? s.split(sep) : [s];
    if (parts.length > 2 || (sep && !new RegExp('^\\d{1,' + dec + '}$').test(parts[1])))
        return { error: 'AMOUNT_FORMAT' };
    var ip = parts[0], fp = parts[1] || '';
    if (!/^\d+$/.test(ip)) {
        if (!/^\d{1,3}([.,]\d{3})+$/.test(ip) || (ip.indexOf('.') >= 0 && ip.indexOf(',') >= 0))
            return { error: 'AMOUNT_FORMAT' };
        ip = ip.replace(/[.,]/g, '');
    }
    var minor = Number(ip + (fp + '000000').slice(0, dec));
    if (!Number.isSafeInteger(minor) || minor > 9999999999999)
        return { error: 'AMOUNT_OVERFLOW' };
    return { minor: neg ? -minor : minor };
}
function validateBankCsv_(text, accounts, ledgerStart) {
    var table = parseCsv_(text), out = [], seen = {}, rowIssues;
    var header = table[0] || [];
    var hdrJoin = header.map(function (x) { return x.trim(); }).join('|');
    if (BANK_TEMPLATE_COLS.join('|') !== hdrJoin && BANK_TEMPLATE_COLS.join('|').replace('Mã dịch vụ', 'HSDV') !== hdrJoin)
        return { fatal: 'HEADER_MISMATCH', expected: BANK_TEMPLATE_COLS, got: header };
    for (var i = 1; i < table.length; i++) {
        var r = table[i];
        if (r.every(function (x) { return String(x).trim() === ''; }))
            continue;
        rowIssues = [];
        var acc = accounts[String(r[1]).trim()], cur = acc && acc.currency, dec = cur === 'USD' ? 2 : 0;
        var date = parseDateVn_(r[0]);
        if (!date)
            rowIssues.push({ code: 'DATE_INVALID', severity: 'ERROR' });
        else if (date < ledgerStart)
            rowIssues.push({ code: 'DATE_BEFORE_LEDGER_START', severity: 'ERROR' });
        if (!acc)
            rowIssues.push({ code: 'ACCOUNT_UNKNOWN', severity: 'ERROR' });
        var thu = parseAmountMinor_(r[2], dec), chi = parseAmountMinor_(r[3], dec);
        if (thu.error)
            rowIssues.push({ code: thu.error, field: 'Thu', severity: 'ERROR' });
        if (chi.error)
            rowIssues.push({ code: chi.error, field: 'Chi', severity: 'ERROR' });
        var hasThu = thu.minor !== undefined, hasChi = chi.minor !== undefined;
        if (hasThu && hasChi)
            rowIssues.push({ code: 'BOTH_IN_OUT', severity: 'ERROR' });
        if (!hasThu && !hasChi && !thu.error && !chi.error)
            rowIssues.push({ code: 'NO_AMOUNT', severity: 'ERROR' });
        if ((hasThu && thu.minor <= 0) || (hasChi && chi.minor <= 0))
            rowIssues.push({ code: 'AMOUNT_NOT_POSITIVE', severity: 'ERROR' });
        var key = [r[1], date, hasThu ? 'IN' + thu.minor : 'OUT' + chi.minor, String(r[4]).trim()].join('|');
        if (seen[key] !== undefined)
            rowIssues.push({ code: 'SUSPECT_DUPLICATE', severity: 'WARNING', ref: seen[key] });
        else
            seen[key] = i + 1;
        if (String(r[5]).trim() === '')
            rowIssues.push({ code: 'PARTNER_MISSING', severity: 'WARNING' });
        out.push({ rowNo: i + 1, issues: rowIssues, data: { date: date, account: String(r[1]).trim(), currency: cur,
                direction: hasThu ? 'IN' : 'OUT', amountMinor: hasThu ? thu.minor : chi.minor, bankRef: String(r[4]).trim(),
                partnerText: String(r[5]).trim(), description: String(r[6]).trim(), docRef: String(r[7]).trim() } });
    }
    var sum = { rows: out.length, errors: 0, warnings: 0, byCurrency: {} };
    out.forEach(function (x) {
        x.issues.forEach(function (i) { if (i.severity === 'ERROR')
            sum.errors++;
        else
            sum.warnings++; });
        if (!x.issues.some(function (i) { return i.severity === 'ERROR'; })) {
            var b = sum.byCurrency[x.data.currency] = sum.byCurrency[x.data.currency] || { IN: 0, OUT: 0 };
            b[x.data.direction] += x.data.amountMinor;
        }
    });
    return { rows: out, summary: sum };
}
function bankAccountsMap_() { var m = {}; catalogList_('CASH_ACCOUNT').forEach(function (c) { m[c.code] = safeJson_(c.attrsJson, {}); }); return m; }
function assertImportFullScope_(user) {
    if (!fullScope_(user))
        throw err_('OUT_OF_SCOPE', 'Sao kê ngân hàng là số liệu toàn công ty: chỉ người có phạm vi toàn bộ đối tác và nhóm nghiệp vụ được nhập, rà soát và ghi.');
}
function importBankPreview_(user, req) {
    requirePerm_(user, 'import.write');
    assertImportFullScope_(user);
    var p = req.payload;
    if (!p.csv || typeof p.csv !== 'string')
        throw err_('VALIDATION_FAILED', 'Chưa có nội dung tệp.');
    if (p.csv.length > 2000000)
        throw err_('VALIDATION_FAILED', 'Tệp quá lớn (tối đa 2 MB).');
    var sha = sha256Hex_(p.csv), ls = ledgerStart_(), accounts = bankAccountsMap_();
    return runTx_(user, { requestId: req.requestId, action: 'import.bankPreview', payload: { sha: sha, fileName: p.fileName }, failAt: req.failAt }, function (tx) {
        if (tx.rows('ImportBatch').some(function (b) { return b.fileSha256 === sha && b.status !== 'CANCELLED' && b.sourceType === 'BANK_STATEMENT'; }))
            throw err_('DUPLICATE_FILE', 'Tệp này đã được nhập (cùng nội dung).');
        var v = validateBankCsv_(p.csv, accounts, ls);
        if (v.fatal)
            throw err_('HEADER_MISMATCH', 'Tiêu đề cột không đúng mẫu. Cần: ' + BANK_TEMPLATE_COLS.join(' | '));
        if (v.rows.length > 1000)
            throw err_('VALIDATION_FAILED', 'Tối đa 1.000 dòng một tệp.');
        var partners = tx.rows('Partner'), pays = tx.rows('Payment');
        v.rows.forEach(function (r) {
            var d = r.data;
            if (d.date && d.account && d.bankRef)
                pays.forEach(function (x) { if (x.status !== 'DELETED' && x.cashAccountCode === d.account && x.effectiveDate === d.date && x.amountMinor === d.amountMinor && x.bankRef === d.bankRef)
                    r.issues.push({ code: 'DUPLICATE_EXISTING', severity: 'WARNING', message: 'Đã có phiếu ' + x.payNo + ' cùng ngày/số tiền/mã giao dịch.' }); });
            var t = normText_(d.partnerText), match = null;
            if (t)
                partners.forEach(function (x) {
                    if (match === false)
                        return;
                    var roleOk = x.status === 'ACTIVE' && (d.direction === 'IN' ? x.isCustomer : x.isSupplier);
                    if (roleOk && (normText_(x.shortName) === t || normText_(x.legalName) === t))
                        match = match ? false : x;
                });
            if (match)
                d.partnerId = match.id;
            else if (!r.issues.some(function (i) { return i.severity === 'ERROR'; }))
                r.issues.push({ code: 'PARTNER_UNMATCHED', severity: 'ERROR', message: 'Chưa xác định đối tác (' + (d.partnerText || 'trống') + '). Chọn đối tác hoặc loại dòng.' });
        });
        var led = loadLedger_(user, '9999-12-31'), left = {};
        v.rows.forEach(function (r) {
            var d = r.data;
            if (!d.partnerId || r.issues.some(function (i) { return i.severity === 'ERROR'; }))
                return;
            var cands = [];
            led.lines.forEach(function (l) {
                var doc = led.docById[l.docId], bl = led.bal.byLine[l.id];
                if (!bl || doc.status !== 'POSTED' || doc.partnerId !== d.partnerId || doc.currency !== d.currency)
                    return;
                if ((d.direction === 'IN') !== (doc.direction === 'AR'))
                    return;
                var out = bl.out - (left[l.id] || 0);
                if (out > 0)
                    cands.push({ debtLineId: l.id, docId: doc.id, docNo: doc.docNo, invoiceNo: doc.invoiceNo, svc: l.serviceCode || '', out: out, docDate: docEffDate_(doc) });
            });
            var sg = suggestMatch(d, cands);
            d.suggest = sg;
            d.apply = false;
            sg.items.forEach(function (it) { left[it.debtLineId] = (left[it.debtLineId] || 0) + it.amountMinor; });
        });
        var b = tx.insert('ImportBatch', { fileName: maxStr_(p.fileName, 200), fileSha256: sha, mode: 'TRANSACTIONAL', sourceType: 'BANK_STATEMENT', status: 'IN_REVIEW', summaryJson: JSON.stringify(v.summary) });
        v.rows.forEach(function (r) {
            var hasErr = r.issues.some(function (i) { return i.severity === 'ERROR'; });
            tx.insert('ImportRow', { batchId: b.id, rowNo: r.rowNo, dataJson: JSON.stringify(r.data), issuesJson: JSON.stringify(r.issues), decision: hasErr ? 'PENDING' : 'ACCEPT' });
        });
        return { result: { batchId: b.id, summary: v.summary }, audit: [{ entityType: 'ImportBatch', entityId: b.id, action: 'import.bankPreview', diff: { rows: v.rows.length, file: p.fileName } }] };
    });
}
function importRowOut_(r) { return { id: r.id, rowNo: r.rowNo, data: safeJson_(r.dataJson, {}), issues: safeJson_(r.issuesJson, []), decision: r.decision }; }
function importBatchSummary_(rows) {
    var s = { rows: rows.length, accepted: 0, errors: 0, byCurrency: {} };
    rows.forEach(function (r) {
        var iss = safeJson_(r.issuesJson, []);
        if (iss.some(function (i) { return i.severity === 'ERROR'; }) && r.decision !== 'REJECT')
            s.errors++;
        if (r.decision === 'ACCEPT') {
            var d = safeJson_(r.dataJson, {});
            s.accepted++;
            var b = s.byCurrency[d.currency] = s.byCurrency[d.currency] || { IN: 0, OUT: 0 };
            b[d.direction] += d.amountMinor;
        }
    });
    return s;
}
function importGet_(user, req) {
    requirePerm_(user, 'read');
    var b = repoFind_('ImportBatch', req.payload.batchId);
    if (!b || b.sourceType !== 'BANK_STATEMENT')
        throw err_('NOT_FOUND', 'Không tìm thấy lô nhập.');
    var rows = repoValid_('ImportRow').filter(function (r) { return r.batchId === b.id; }).sort(function (a, c) { return a.rowNo - c.rowNo; });
    if (!fullScope_(user)) {
        var pmS = partnerMap_();
        rows = rows.filter(function (r) { var pid = safeJson_(r.dataJson, {}).partnerId; return !!pid && inScope_(user, pmS[pid], ''); });
    }
    var sum = importBatchSummary_(rows), pg = paginate_(rows, req.payload.page, req.payload.pageSize || 200);
    return { batch: { id: b.id, fileName: b.fileName, status: b.status, version: b.version, createdBy: b.createdBy }, summary: sum, summaryHash: sha256Hex_(JSON.stringify(rows.filter(function (r) { return r.decision === 'ACCEPT'; }).map(function (r) { return [r.dataJson]; }))),
        rows: pg.items.map(importRowOut_), total: pg.total, page: pg.page };
}
function importList_(user, req) {
    requirePerm_(user, 'read');
    if (!fullScope_(user))
        return { items: [] };
    return { items: repoValid_('ImportBatch').filter(function (b) { return b.sourceType === 'BANK_STATEMENT'; }).sort(function (a, b) { return cmpStr_(b.createdAt, a.createdAt); })
            .map(function (b) { return { id: b.id, fileName: b.fileName, status: b.status, createdAt: b.createdAt, summary: safeJson_(b.summaryJson, {}) }; }) };
}
function importRowDecide_(user, req) {
    requirePerm_(user, 'import.write');
    assertImportFullScope_(user);
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'import.rowDecide', payload: p, failAt: req.failAt }, function (tx) {
        var r = tx.find('ImportRow', p.rowId);
        if (!r)
            throw err_('NOT_FOUND', 'Không tìm thấy dòng.');
        var b = tx.find('ImportBatch', r.batchId);
        if (!b || b.status !== 'IN_REVIEW')
            throw err_('STATE_TRANSITION_INVALID', 'Lô không còn ở bước rà soát.');
        var d = safeJson_(r.dataJson, {}), iss = safeJson_(r.issuesJson, []), decision = p.decision || r.decision;
        if (['ACCEPT', 'REJECT'].indexOf(decision) < 0)
            throw err_('VALIDATION_FAILED', 'Quyết định không hợp lệ.');
        if (p.partnerId) {
            var pt = tx.find('Partner', p.partnerId);
            if (!pt || (d.direction === 'IN' ? !pt.isCustomer : !pt.isSupplier))
                throw err_('VALIDATION_FAILED', 'Đối tác không đúng vai trò.', [{ path: 'partnerId', code: 'PARTNER_ROLE', message: 'Đối tác không đúng vai trò.' }]);
            d.partnerId = pt.id;
            iss = iss.filter(function (i) { return i.code !== 'PARTNER_UNMATCHED'; });
        }
        if (decision === 'ACCEPT' && iss.some(function (i) { return i.severity === 'ERROR'; }))
            throw err_('IMPORT_HAS_ERRORS', 'Dòng còn lỗi, không thể chấp nhận. Sửa nguồn hoặc loại dòng.');
        if (p.apply !== undefined)
            d.apply = !!p.apply && decision === 'ACCEPT' && !!(d.suggest && d.suggest.items && d.suggest.items.length);
        if (decision !== 'ACCEPT')
            d.apply = false;
        tx.update('ImportRow', r.id, { dataJson: JSON.stringify(d), issuesJson: JSON.stringify(iss), decision: decision });
        return { result: { id: r.id, decision: decision, apply: !!d.apply } };
    });
}
function importCancel_(user, req) {
    requirePerm_(user, 'import.write');
    assertImportFullScope_(user);
    return runTx_(user, { requestId: req.requestId, action: 'import.cancel', payload: req.payload, failAt: req.failAt }, function (tx) {
        var b = tx.find('ImportBatch', req.payload.batchId);
        if (!b || b.status !== 'IN_REVIEW')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ hủy được lô đang rà soát.');
        tx.update('ImportBatch', b.id, { status: 'CANCELLED' });
        return { result: { status: 'CANCELLED' } };
    });
}
function importBankCommit_(user, req) {
    requirePerm_(user, 'import.approve');
    assertImportFullScope_(user);
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'import.bankCommit', payload: p, failAt: req.failAt }, function (tx) {
        var b = tx.find('ImportBatch', p.batchId);
        if (!b || b.sourceType !== 'BANK_STATEMENT' || b.status !== 'IN_REVIEW')
            throw err_('STATE_TRANSITION_INVALID', 'Lô không ở bước rà soát.');
        if (b.createdBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người nhập không được tự duyệt lô.');
        var rows = tx.rows('ImportRow').filter(function (r) { return r.batchId === b.id; }).sort(function (a, c) { return a.rowNo - c.rowNo; });
        var acc = rows.filter(function (r) { return r.decision === 'ACCEPT'; });
        var hash = sha256Hex_(JSON.stringify(acc.map(function (r) { return [r.dataJson]; })));
        if (p.expectedSummaryHash !== hash)
            throw err_('SUMMARY_CHANGED', 'Dữ liệu đã thay đổi sau bản xem trước. Tải lại và xác nhận lại.');
        if (rows.some(function (r) { return r.decision === 'PENDING'; }))
            throw err_('IMPORT_NOT_REVIEWED', 'Còn dòng chưa quyết định (chấp nhận/loại).');
        if (!acc.length)
            throw err_('VALIDATION_FAILED', 'Không có dòng nào được chấp nhận.');
        var accounts = bankAccountsMap_(), periods = {}, n = 0, errs = [];
        acc.forEach(function (r) {
            var d = safeJson_(r.dataJson, {}), iss = safeJson_(r.issuesJson, []);
            if (iss.some(function (i) { return i.severity === 'ERROR'; }) || !d.partnerId) {
                errs.push({ path: 'row' + r.rowNo, code: 'IMPORT_HAS_ERRORS', message: 'Dòng ' + r.rowNo + ' còn lỗi.' });
                return;
            }
            try {
                periods[d.date] = periods[d.date] || assertPeriodOpen_(tx, d.date);
            }
            catch (e) {
                errs.push({ path: 'row' + r.rowNo, code: e.code || 'ERROR', message: 'Dòng ' + r.rowNo + ': ' + (e.userMessage || e.message) });
            }
        });
        var paysNow = tx.rows('Payment'), seenKey = {};
        acc.forEach(function (r) {
            var d = safeJson_(r.dataJson, {}), iss = safeJson_(r.issuesJson, []), srcKey = b.fileSha256.slice(0, 12) + '#' + r.rowNo;
            if (!accounts[d.account])
                errs.push({ path: 'row' + r.rowNo, code: 'ACCOUNT_UNKNOWN', message: 'Dòng ' + r.rowNo + ': tài khoản quỹ không còn dùng được.' });
            if (paysNow.some(function (x) { return x.sourceKey === srcKey && x.status !== 'DELETED'; }))
                errs.push({ path: 'row' + r.rowNo, code: 'DUPLICATE_EXISTING', message: 'Dòng ' + r.rowNo + ' đã được ghi trước đó.' });
            var ack = iss.some(function (i) { return i.code === 'DUPLICATE_EXISTING'; });
            if (!ack && d.bankRef && paysNow.some(function (x) { return x.status !== 'DELETED' && x.cashAccountCode === d.account && x.effectiveDate === d.date && x.amountMinor === d.amountMinor && x.bankRef === d.bankRef; }))
                errs.push({ path: 'row' + r.rowNo, code: 'DUPLICATE_EXISTING', message: 'Dòng ' + r.rowNo + ': từ lúc xem trước đã có phiếu cùng ngày/số tiền/mã giao dịch. Tải lại lô và quyết định lại.' });
            var k = [d.account, d.date, d.amountMinor, d.bankRef].join('|');
            if (d.bankRef && !ack && seenKey[k])
                errs.push({ path: 'row' + r.rowNo, code: 'DUPLICATE_IN_BATCH', message: 'Dòng ' + r.rowNo + ' trùng dòng ' + seenKey[k] + ' trong cùng lô.' });
            else if (d.bankRef)
                seenKey[k] = r.rowNo;
        });
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Có dòng không ghi được', errs);
        // R35: nhập sao kê vào QUỸ TIỀN MẶT (VND hoặc ngoại tệ) không được làm quỹ âm/vượt quỹ — cộng dồn cả lô theo thứ tự ngày.
        var impEv = {}, impPay = {};
        acc.forEach(function (r) {
            var d = safeJson_(r.dataJson, {});
            if (!d.account || !accounts[d.account] || accounts[d.account].type !== 'CASH')
                return;
            if (d.currency === BASE_CUR_)
                (impEv[d.account] = impEv[d.account] || []).push({ ref: 'imp#' + r.rowNo, date: d.date, docNo: 'IMP' + ('0000' + r.rowNo).slice(-5), thu: d.direction === 'IN', amt: d.amountMinor, text: '', kind: d.direction });
            else
                (impPay[d.account] = impPay[d.account] || []).push({ id: 'imp#' + r.rowNo, payNo: 'IMP' + ('0000' + r.rowNo).slice(-5), direction: d.direction, cashAccountCode: d.account, currency: d.currency, amountMinor: d.amountMinor, effectiveDate: d.date, status: 'POSTED', fxRateE4: 0, amountBaseMinor: 0 });
        });
        var impOver = function () { return Object.keys(impPay).reduce(function (n, code) {
            var pa = fxPoolRun_(null, null).accounts[code];
            return n + (pa ? pa.events.filter(function (e) { return e.fallback && e.over; }).length : 0);
        }, 0); };
        Object.keys(impEv).forEach(function (code) {
            var a = cashAccountsAll_().filter(function (x) { return x.code === code; })[0];
            if (a && cashLines_(a, null, null, impEv[code]).lines.filter(function (l) { return l.bal < 0; }).length > cashLines_(a, null, null).lines.filter(function (l) { return l.bal < 0; }).length)
                throw err_('CASH_OVERDRAFT', 'Lô nhập làm quỹ tiền mặt ' + code + ' âm / vượt số dư tại một ngày nào đó. Kiểm tra số tiền, ngày hoặc loại bớt dòng chi.');
        });
        if (Object.keys(impPay).length) {
            var overBefore = impOver(), flat = [];
            Object.keys(impPay).forEach(function (c) { flat = flat.concat(impPay[c]); });
            POOL_EXTRA_ = flat;
            try {
                if (impOver() > overBefore)
                    throw err_('CASH_OVERDRAFT', 'Lô nhập làm quỹ tiền mặt ngoại tệ vượt số dư tại một ngày nào đó. Kiểm tra số tiền, ngày hoặc loại bớt dòng chi.');
            }
            finally {
                POOL_EXTRA_ = null;
            }
        }
        var seenPeriod = {}, allocCount = 0, allocSkipped = 0, docsAll = tx.rows('DebtDoc'), linesAll = tx.rows('DebtLine'), allocsAll = tx.rows('Allocation'), balAll = computeBalances(docsAll, linesAll, allocsAll, '9999-12-31'), docById = byId_(docsAll), lineById = byId_(linesAll), used = {};
        acc.forEach(function (r) {
            var d = safeJson_(r.dataJson, {}), prefix = d.direction === 'IN' ? 'PH' : 'PC', y = d.date.slice(0, 4);
            var no = prefix + '-' + y + '-' + ('000000' + tx.nextSeq('seq.' + prefix + '.' + y)).slice(-6);
            var payRow = tx.insert('Payment', { payNo: no, direction: d.direction, partnerId: d.partnerId, currency: d.currency, amountMinor: d.amountMinor, effectiveDate: d.date, method: 'BANK', cashAccountCode: d.account,
                bankRef: d.bankRef, purpose: 'SETTLE', status: 'POSTED', periodId: monthOf_(d.date), postingDate: d.date, approvedBy: user.id, note: maxStr_(d.description + (d.docRef ? ' [' + d.docRef + ']' : ''), 500),
                source: 'IMPORT', sourceKey: b.fileSha256.slice(0, 12) + '#' + r.rowNo });
            n++;
            if (d.apply && d.suggest && d.suggest.items) {
                var room = d.amountMinor;
                d.suggest.items.forEach(function (it) {
                    var ln = lineById[it.debtLineId], doc = ln ? docById[ln.docId] : null, bl = ln ? balAll.byLine[ln.id] : null;
                    if (!ln || !doc || !bl || doc.status !== 'POSTED' || doc.partnerId !== d.partnerId || doc.currency !== d.currency || d.date < docEffDate_(doc) || (doc.direction === 'AR') !== (d.direction === 'IN')) {
                        allocSkipped++;
                        return;
                    }
                    var amt = Math.min(it.amountMinor, room, bl.out - (used[ln.id] || 0));
                    if (amt <= 0) {
                        allocSkipped++;
                        return;
                    }
                    tx.insert('Allocation', { paymentId: payRow.id, debtLineId: ln.id, docId: doc.id, partnerId: d.partnerId, currency: d.currency, amountMinor: amt, effectiveDate: d.date, status: 'ACTIVE', reversesAllocId: '', periodId: monthOf_(d.date), note: 'Gợi ý từ sao kê (' + d.suggest.basis + ')' });
                    used[ln.id] = (used[ln.id] || 0) + amt;
                    room -= amt;
                    allocCount++;
                });
            }
        });
        tx.update('ImportBatch', b.id, { status: 'COMMITTED', committedBy: user.id, committedAt: tx.now });
        return { result: { status: 'COMMITTED', payments: n, allocations: allocCount, allocationsSkipped: allocSkipped }, audit: [{ entityType: 'ImportBatch', entityId: b.id, action: 'import.bankCommit', diff: { payments: n, allocations: allocCount } }] };
    });
}
var OPENING_KINDS_ = ['AR', 'AP', 'CASH', 'CREDIT'];
function validateOpeningRow_(r, env) {
    var issues = [];
    function E(code, msg, field) { issues.push({ code: code, severity: 'ERROR', field: field || '', message: msg }); }
    if (OPENING_KINDS_.indexOf(r.kind) < 0) {
        E('KIND', 'Loại dòng không hợp lệ.');
        return issues;
    }
    var cur;
    if (r.kind === 'CASH') {
        var acc = env.cashAccounts[r.cashAccountCode];
        if (!acc)
            E('ACCOUNT_UNKNOWN', 'Chọn tài khoản quỹ.', 'cashAccountCode');
        else
            cur = acc.currency;
    }
    else {
        var p = env.partners[r.partnerId];
        if (!p)
            E('PARTNER_REQUIRED', 'Chọn đối tác.', 'partnerId');
        else if (p.status !== 'ACTIVE')
            E('PARTNER_INACTIVE', 'Đối tác đã ngừng sử dụng.', 'partnerId');
        else if (r.kind === 'AR' && !p.isCustomer)
            E('PARTNER_ROLE', 'Đối tác không phải khách hàng.', 'partnerId');
        else if (r.kind === 'AP' && !p.isSupplier)
            E('PARTNER_ROLE', 'Đối tác không phải nhà cung cấp.', 'partnerId');
        else if (r.kind === 'CREDIT') {
            if (r.direction !== 'IN' && r.direction !== 'OUT')
                E('DIRECTION', 'Chọn nhận trước (IN) hoặc trả trước (OUT).', 'direction');
            else if ((r.direction === 'IN' && !p.isCustomer) || (r.direction === 'OUT' && !p.isSupplier))
                E('PARTNER_ROLE', 'Đối tác không đúng vai trò.', 'partnerId');
        }
        cur = r.currency;
        if (!env.currencies[cur])
            E('CURRENCY_REQUIRED', 'Chọn tiền tệ.', 'currency');
        if ((r.kind === 'AR' || r.kind === 'AP') && (!r.businessGroupCode || env.groups.indexOf(r.businessGroupCode) < 0))
            E('GROUP_REQUIRED', 'Chọn nhóm nghiệp vụ.', 'businessGroupCode');
    }
    if (!Number.isSafeInteger(r.amountMinor) || r.amountMinor < 0 || r.amountMinor > MONEY_MAX)
        E('AMOUNT_INVALID', 'Số tiền phải là số nguyên không âm.', 'amountMinor');
    else if (r.amountMinor === 0 && r.kind !== 'CASH')
        E('AMOUNT_ZERO', 'Số tiền phải lớn hơn 0 (dòng trống hãy xóa).', 'amountMinor');
    if (r.serviceCode && env.serviceCodes.indexOf(r.serviceCode) < 0)
        E('SERVICE_CODE_UNKNOWN', 'Mã dịch vụ không tồn tại hoặc đã ngừng dùng.', 'serviceCode');
    if (r.docDate && (!isDate_(r.docDate) || r.docDate >= env.ledgerStart))
        E('DATE_INVALID', 'Ngày chứng từ gốc phải hợp lệ và trước ngày đầu sổ ' + env.ledgerStart + ' (hoặc để trống nếu không biết).', 'docDate');
    if (r.dueDate && !isDate_(r.dueDate))
        E('DATE_INVALID', 'Hạn thanh toán không hợp lệ.', 'dueDate');
    else if (r.dueDate && r.docDate && isDate_(r.docDate) && r.dueDate < r.docDate)
        E('DUE_BEFORE_DOC', 'Hạn thanh toán không được trước ngày chứng từ.', 'dueDate');
    return issues;
}
function openingEnv_() {
    var acc = {};
    catalogList_('CASH_ACCOUNT').forEach(function (c) { acc[c.code] = safeJson_(c.attrsJson, {}); });
    return { cashAccounts: acc, partners: partnerMap_(), currencies: currencyMap_(), groups: catalogList_('BUSINESS_GROUP').map(function (c) { return c.code; }), serviceCodes: catalogList_('SERVICE_CODE').map(function (c) { return c.code; }), ledgerStart: ledgerStart_() };
}
function openingSummary_(rows) {
    var s = {};
    rows.forEach(function (r) {
        var cur = r.kind === 'CASH' ? (r._cur || '') : r.currency, k = s[cur] = s[cur] || { AR: 0, AP: 0, CASH: 0, CREDIT_IN: 0, CREDIT_OUT: 0 };
        if (r.kind === 'CREDIT')
            k[r.direction === 'IN' ? 'CREDIT_IN' : 'CREDIT_OUT'] += r.amountMinor || 0;
        else
            k[r.kind] += r.amountMinor || 0;
    });
    return s;
}
function openingBatch_() {
    var b = repoValid_('ImportBatch').filter(function (x) { return x.mode === 'OPENING' && x.status !== 'CANCELLED'; });
    return b.length ? b[b.length - 1] : null;
}
function openingLoad_(batch) {
    var env = openingEnv_();
    var rows = repoValid_('ImportRow').filter(function (r) { return r.batchId === batch.id; }).sort(function (a, b) { return a.rowNo - b.rowNo; });
    var data = rows.map(function (r) { var d = safeJson_(r.dataJson, {}); if (d.kind === 'CASH' && env.cashAccounts[d.cashAccountCode])
        d._cur = env.cashAccounts[d.cashAccountCode].currency; return d; });
    return { rows: rows, data: data, env: env };
}
function openingGet_(user, req) {
    if (!can_(user, 'opening.write') && !can_(user, 'read'))
        throw err_('FORBIDDEN', 'Không đủ quyền.');
    var b = openingBatch_();
    if (!b)
        return { batch: null, rows: [], summary: {}, ledgerStartDate: ledgerStart_() };
    var L = openingLoad_(b), pmap = L.env.partners, vis = [];
    L.data.forEach(function (d, i) { if (!d.partnerId || inScope_(user, pmap[d.partnerId], d.businessGroupCode))
        vis.push(i); });
    if (vis.length !== L.data.length) {
        L = { rows: vis.map(function (i) { return L.rows[i]; }), data: vis.map(function (i) { return L.data[i]; }), env: L.env };
    }
    return { batch: { id: b.id, status: b.status, createdBy: b.createdBy, version: b.version, committedAt: b.committedAt, note: safeJson_(b.summaryJson, {}).note || '', summaryHash: safeJson_(b.summaryJson, {}).hash || '', rejectReason: safeJson_(b.summaryJson, {}).rejectReason || '' },
        rows: L.data.map(function (d, i) { return Object.assign({}, d, { issues: safeJson_(L.rows[i].issuesJson, []) }); }), summary: openingSummary_(L.data), ledgerStartDate: ledgerStart_() };
}
function assertOpeningFullScope_(user) {
    if (!fullScope_(user))
        throw err_('OUT_OF_SCOPE', 'Dư đầu kỳ là số liệu toàn công ty: chỉ người có phạm vi toàn bộ đối tác và nhóm nghiệp vụ được lập, gửi, duyệt.');
}
function openingSave_(user, req) {
    requirePerm_(user, 'opening.write');
    assertOpeningFullScope_(user);
    var p = req.payload;
    if (!Array.isArray(p.rows) || p.rows.length > 1000)
        throw err_('VALIDATION_FAILED', 'Tối đa 1.000 dòng một lần lưu.');
    return runTx_(user, { requestId: req.requestId, action: 'opening.save', payload: p, failAt: req.failAt }, function (tx) {
        var b = openingBatch_();
        if (b && b.status === 'COMMITTED')
            throw err_('OPENING_COMMITTED', 'Dư đầu kỳ đã được ghi nhận, không sửa trực tiếp. Công nợ sai thì sửa bằng chứng từ điều chỉnh/đảo; số dư quỹ đầu kỳ sai cần quản trị xử lý.');
        if (b && b.status === 'SUBMITTED')
            throw err_('STATE_TRANSITION_INVALID', 'Đang chờ duyệt. Hãy từ chối để sửa.');
        if (b && b.createdBy !== user.id && user.role !== 'APPROVER')
            throw err_('FORBIDDEN', 'Chỉ người lập được sửa bản nháp.');
        var env = openingEnv_(), errCount = 0;
        var rows = p.rows.map(function (r, i) {
            var clean = { kind: r.kind, partnerId: r.partnerId || '', businessGroupCode: r.businessGroupCode || '', currency: r.currency || '', serviceCode: String(r.serviceCode || '').trim().toUpperCase().slice(0, 30),
                invoiceNo: maxStr_(r.invoiceNo, 100).trim(), docDate: r.docDate || '', dueDate: r.dueDate || '', amountMinor: r.amountMinor, note: maxStr_(r.note, 300), cashAccountCode: r.cashAccountCode || '', direction: r.direction || '' };
            var issues = validateOpeningRow_(clean, env);
            errCount += issues.length;
            return { clean: clean, issues: issues, rowNo: i + 1 };
        });
        var seen = {};
        var seenCash = {};
        rows.forEach(function (r) {
            if (r.clean.kind === 'CASH') {
                if (r.clean.cashAccountCode && seenCash[r.clean.cashAccountCode])
                    r.issues.push({ code: 'DUPLICATE_ACCOUNT', severity: 'ERROR', field: 'cashAccountCode', message: 'Tài khoản quỹ đã có ở dòng ' + seenCash[r.clean.cashAccountCode] + ': mỗi quỹ chỉ một dòng số dư.' });
                else if (r.clean.cashAccountCode)
                    seenCash[r.clean.cashAccountCode] = r.rowNo;
                return;
            }
            var k = [r.clean.kind, r.clean.direction, r.clean.partnerId, r.clean.currency, r.clean.serviceCode, r.clean.invoiceNo, r.clean.amountMinor].join('|');
            if (seen[k])
                r.issues.push({ code: 'SUSPECT_DUPLICATE', severity: 'WARNING', message: 'Nghi trùng với dòng ' + seen[k] });
            else
                seen[k] = r.rowNo;
        });
        var batch;
        if (!b)
            batch = tx.insert('ImportBatch', { fileName: 'Dư đầu kỳ ' + ledgerStart_(), fileSha256: '', mode: 'OPENING', sourceType: 'MANUAL_PASTE', status: 'DRAFT', summaryJson: JSON.stringify({ note: p.note || '' }) });
        else {
            batch = tx.update('ImportBatch', b.id, { status: 'DRAFT', summaryJson: JSON.stringify({ note: p.note || '' }) }, p.ifVersion);
            tx.rows('ImportRow').forEach(function (r) { if (r.batchId === b.id)
                tx.update('ImportRow', r.id, { isDeleted: 1 }); });
        }
        rows.forEach(function (r) { tx.insert('ImportRow', { batchId: batch.id, rowNo: r.rowNo, dataJson: JSON.stringify(r.clean), issuesJson: JSON.stringify(r.issues), decision: 'ACCEPT' }); });
        var data = rows.map(function (r) { var d = r.clean; if (d.kind === 'CASH' && env.cashAccounts[d.cashAccountCode])
            d._cur = env.cashAccounts[d.cashAccountCode].currency; return d; });
        var errors = rows.reduce(function (n, r) { return n + r.issues.filter(function (i) { return i.severity === 'ERROR'; }).length; }, 0);
        return { result: { batchId: batch.id, status: 'DRAFT', rows: rows.length, errors: errors, summary: openingSummary_(data) },
            audit: [{ entityType: 'ImportBatch', entityId: batch.id, action: 'opening.save', diff: { rows: rows.length, errors: errors } }] };
    });
}
function openingSubmit_(user, req) {
    requirePerm_(user, 'opening.write');
    assertOpeningFullScope_(user);
    return runTx_(user, { requestId: req.requestId, action: 'opening.submit', payload: req.payload, failAt: req.failAt }, function (tx) {
        var b = openingBatch_();
        if (!b || b.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Không có bản nháp để gửi duyệt.');
        var L = openingLoad_(b);
        if (!L.data.length)
            throw err_('VALIDATION_FAILED', 'Chưa có dòng nào.');
        var bad = L.rows.filter(function (r) { return safeJson_(r.issuesJson, []).some(function (i) { return i.severity === 'ERROR'; }); }).length;
        if (bad)
            throw err_('IMPORT_HAS_ERRORS', 'Còn ' + bad + ' dòng lỗi. Sửa trước khi gửi duyệt.');
        var summary = openingSummary_(L.data), hash = sha256Hex_(JSON.stringify([summary, L.data]));
        var prev = safeJson_(b.summaryJson, {});
        tx.update('ImportBatch', b.id, { status: 'SUBMITTED', summaryJson: JSON.stringify({ note: prev.note || '', summary: summary, hash: hash }) }, req.payload && req.payload.ifVersion);
        return { result: { status: 'SUBMITTED', summary: summary, summaryHash: hash }, audit: [{ entityType: 'ImportBatch', entityId: b.id, action: 'opening.submit', diff: { summary: summary } }] };
    });
}
function openingReject_(user, req) {
    requirePerm_(user, 'opening.approve');
    assertOpeningFullScope_(user);
    return runTx_(user, { requestId: req.requestId, action: 'opening.reject', payload: req.payload, failAt: req.failAt }, function (tx) {
        var b = openingBatch_();
        if (!b || b.status !== 'SUBMITTED')
            throw err_('STATE_TRANSITION_INVALID', 'Không có bản đang chờ duyệt.');
        if (!String(req.payload.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do từ chối.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do.' }]);
        var prev = safeJson_(b.summaryJson, {});
        prev.rejectReason = maxStr_(req.payload.reason, 300);
        tx.update('ImportBatch', b.id, { status: 'DRAFT', summaryJson: JSON.stringify(prev) });
        return { result: { status: 'DRAFT' }, audit: [{ entityType: 'ImportBatch', entityId: b.id, action: 'opening.reject', diff: { reason: req.payload.reason } }] };
    });
}
function openingCommit_(user, req) {
    requirePerm_(user, 'opening.approve');
    assertOpeningFullScope_(user);
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'opening.commit', payload: p, failAt: req.failAt }, function (tx) {
        var b = openingBatch_();
        if (!b || b.status !== 'SUBMITTED')
            throw err_('STATE_TRANSITION_INVALID', 'Không có bản đang chờ duyệt.');
        if (b.createdBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập không được tự duyệt dư đầu kỳ.');
        var meta = safeJson_(b.summaryJson, {});
        if (!p.expectedSummaryHash || p.expectedSummaryHash !== meta.hash)
            throw err_('SUMMARY_CHANGED', 'Bản xem trước không khớp dữ liệu hiện tại. Hãy tải lại và xác nhận lại.');
        var L = openingLoad_(b), ls = ledgerStart_(), periodId = assertPeriodOpen_(tx, ls), created = { docs: 0, payments: 0, cash: 0 };
        var stale = [];
        L.data.forEach(function (r, i) { validateOpeningRow_(r, L.env).forEach(function (is) { if (is.severity === 'ERROR')
            stale.push({ path: 'row' + (i + 1), code: is.code, message: 'Dòng ' + (i + 1) + ': ' + is.message }); }); });
        if (stale.length)
            throw err_('IMPORT_HAS_ERRORS', 'Dữ liệu danh mục đã đổi từ lúc lưu: còn ' + stale.length + ' lỗi. Từ chối để người lập sửa lại.', stale.slice(0, 20));
        L.data.forEach(function (r, i) {
            if (r.kind === 'AR' || r.kind === 'AP') {
                var no = 'OPN-' + ('000000' + tx.nextSeq('seq.OPN')).slice(-6);
                var d = tx.insert('DebtDoc', { docNo: no, direction: r.kind, docType: 'INVOICE', partnerId: r.partnerId, currency: r.currency, businessGroupCode: r.businessGroupCode, docDate: r.docDate || '',
                    invoiceNo: r.invoiceNo, invoiceSerial: '', invoiceDate: '', statementPeriod: '', dueDate: r.dueDate || '', dueDateSource: r.dueDate ? 'MANUAL' : 'NONE', expectedPayDate: '', statusNote: r.note,
                    batchLabel: '', totalGrossMinor: r.amountMinor, status: 'POSTED', periodId: periodId, postingDate: ls, approvedBy: user.id, approvedAt: tx.now, isOpening: 1, source: 'OPENING',
                    sourceKey: b.id + '#' + (i + 1), assuranceLevel: 'MANUAL', searchText: normText_(no + ' ' + r.invoiceNo) });
                tx.insert('DebtLine', { docId: d.id, lineNo: 1, feeTypeCode: 'OPENING_LUMP', description: 'Số dư đầu kỳ ' + ls + (r.serviceCode ? ' – ' + r.serviceCode : '') + (r.note ? ' – ' + r.note : ''), serviceCode: r.serviceCode || '',
                    netMinor: r.amountMinor, vatMode: 'UNCONFIRMED', vatMinor: 0, grossMinor: r.amountMinor });
                created.docs++;
            }
            else if (r.kind === 'CREDIT') {
                var pno = 'OPN-' + (r.direction === 'IN' ? 'PH' : 'PC') + '-' + ('000000' + tx.nextSeq('seq.OPNPAY')).slice(-6);
                tx.insert('Payment', { payNo: pno, direction: r.direction, partnerId: r.partnerId, currency: r.currency, amountMinor: r.amountMinor, effectiveDate: ls, method: 'OTHER', cashAccountCode: '',
                    bankRef: '', purpose: 'ADVANCE', status: 'POSTED', periodId: periodId, postingDate: ls, approvedBy: user.id, note: 'Dư đầu kỳ: ' + r.note, source: 'OPENING', sourceKey: b.id + '#' + (i + 1) });
                created.payments++;
            }
            else if (r.kind === 'CASH') {
                tx.insert('OpeningBalance', { kind: 'CASH', partnerId: '', direction: '', currency: r._cur, amountMinor: r.amountMinor, cashAccountCode: r.cashAccountCode, ledgerStartDate: ls, batchId: b.id, note: r.note });
                created.cash++;
            }
        });
        tx.update('ImportBatch', b.id, { status: 'COMMITTED', committedBy: user.id, committedAt: tx.now });
        return { result: { status: 'COMMITTED', created: created, summary: meta.summary }, audit: [{ entityType: 'ImportBatch', entityId: b.id, action: 'opening.commit', diff: { created: created, summary: meta.summary } }] };
    });
}
var ORDER_STATUS_ = ['OPEN', 'CLOSED', 'CANCELLED'];
// Tổng theo tiền tệ (không quy đổi/cộng chéo). revenueNet/costNet = doanh thu/chi phí DỊCH VỤ ĐÃ GHI NHẬN (khoản đã lập hóa đơn, INVOICED; không gồm thu hộ/chi hộ); lãi gộp chỉ tính trên hai số này.
// Nguyên tắc: có hóa đơn mới ghi nhận doanh thu/chi phí. Khoản chưa lập (OPEN) và đang lập hóa đơn (INVOICING) chưa vào doanh thu/chi phí/lãi; vẫn hiện ở uninvoiced*/invoicing* (số đã gồm thuế).
// Thu hộ/chi hộ (isPassThrough) tách riêng: passRevenue = CHI HỘ (phải thu lại của khách), passCost = THU HỘ (phải trả lại), passGap = chi hộ − thu hộ (số hộ chưa đối ứng, KHÔNG phải lợi nhuận).
// Nhóm trạng thái hóa đơn (gồm cả khoản hộ, vì vẫn là nghĩa vụ phải thu/phải trả): OPEN = chưa lập, INVOICING = đang lập (hóa đơn nháp/chờ duyệt), INVOICED = đã ghi nhận.
// Đối chiếu: revenueGross = uninvoicedRevenue + invoicingRevenue + invoicedRevenue (tương tự chi phí).
function orderTotals(accruals) {
    var out = {};
    accruals.forEach(function (a) {
        if (a.status === 'CANCELLED')
            return;
        var t = out[a.currency] = out[a.currency] || { revenueNet: 0, costNet: 0, revenueGross: 0, costGross: 0, uninvoicedRevenue: 0, uninvoicedCost: 0, invoicingRevenue: 0, invoicingCost: 0,
            invoicedRevenue: 0, invoicedCost: 0, passRevenue: 0, passCost: 0, passUnverified: 0 };
        var rev = a.kind === 'REVENUE', st = a.status === 'OPEN' ? 'uninvoiced' : a.status === 'INVOICING' ? 'invoicing' : 'invoiced', sfx = rev ? 'Revenue' : 'Cost';
        t[(rev ? 'revenue' : 'cost') + 'Gross'] += a.grossMinor;
        t[st + sfx] += a.grossMinor;
        if (a.isPassThrough)
            t[rev ? 'passRevenue' : 'passCost'] += a.grossMinor;
        else {
            if (st === 'invoiced')
                t[rev ? 'revenueNet' : 'costNet'] += a.netMinor;
            if (a.feeTypeCode === 'PASS_THROUGH')
                t.passUnverified++;
        }
    });
    Object.keys(out).forEach(function (c) { var t = out[c]; t.margin = t.revenueNet - t.costNet; t.marginPct = t.revenueNet > 0 ? Math.round(t.margin * 10000 / t.revenueNet) / 100 : null; t.passGap = t.passRevenue - t.passCost; t.incompleteRevenue = t.uninvoicedRevenue + t.invoicingRevenue; t.incompleteCost = t.uninvoicedCost + t.invoicingCost; });
    return out;
}
function orderInScope_(user, o, pm) { return inScope_(user, pm[o.customerPartnerId], o.businessGroupCode); }
function orderListData_(user, asOf, withCancelled) {
    var pm = partnerMap_(), orders = repoValid_('Order').filter(function (o) { return o.status !== 'DELETED' && orderInScope_(user, o, pm); }), oset = byId_(orders);
    var acc = repoValid_('Accrual').filter(function (a) { return oset[a.orderId]; });
    var shares = costShareRows_(oset, withCancelled);
    return { pm: pm, orders: orders, acc: acc, shares: shares, accByOrder: groupBy_(acc.concat(shares), function (a) { return a.orderId; }) };
}
function costShareRows_(oset, withCancelled) {
    var accs = byId_(repoValid_('Accrual')), out = [];
    repoValid_('AccrualSplit').forEach(function (sp) {
        var a = accs[sp.accrualId];
        if (!a || (a.status === 'CANCELLED' && !(withCancelled && a.cancelledDate)) || !oset[sp.orderId])
            return;
        out.push({ id: sp.id, orderId: sp.orderId, sharedFrom: a.id, kind: 'COST', partnerId: a.partnerId, poRef: a.poRef, accrualDate: a.accrualDate, feeTypeCode: a.feeTypeCode, description: a.description, containerQty: null,
            netMinor: sp.shareNetMinor, vatMode: a.vatMode, vatRateBp: a.vatRateBp, vatMinor: sp.shareVatMinor, grossMinor: sp.shareGrossMinor, isPassThrough: a.isPassThrough, currency: a.currency, status: a.status, cancelledDate: a.cancelledDate || '', docId: a.docId, debtLineId: a.debtLineId, note: a.note, version: a.version, basis: sp.basis });
    });
    return out;
}
function costsOutsideOrders_(user) {
    var pm = partnerMap_(), orders = byId_(repoValid_('Order')), splitsBy = groupBy_(repoValid_('AccrualSplit'), function (x) { return x.accrualId; }), out = [];
    repoValid_('Accrual').forEach(function (a) {
        if (a.orderId || a.kind !== 'COST')
            return;
        var sp = splitsBy[a.id] || [];
        if (!inScope_(user, pm[a.partnerId], ''))
            return;
        if (sp.some(function (x) { var o = orders[x.orderId]; return !o || !orderInScope_(user, o, pm); }))
            return;
        out.push({ a: a, splits: sp });
    });
    return out;
}
function orderOut_(o, D) {
    var list = D.accByOrder[o.id] || [];
    return { id: o.id, orderNo: o.orderNo, poNo: o.poNo, customerPartnerId: o.customerPartnerId, customerName: partnerName_(D.pm, o.customerPartnerId), orderDate: o.orderDate, group: o.businessGroupCode, currency: o.currency,
        services: servicesOut_(o), serviceCode: orderServices_(o).length ? orderServices_(o)[0].code : '', serviceName: servicesOut_(o).map(function (x) { return x.code; }).join(', '), hsdvNo: servicesOut_(o).map(function (x) { return x.hsdvNo; }).filter(Boolean).join(', '), status: o.status, archivedAt: o.archivedAt || '', archivedBy: o.archivedBy || '', archiveNote: o.archiveNote || '', note: o.note, version: o.version, totals: orderTotals(list), accrualCount: list.filter(function (a) { return a.status !== 'CANCELLED'; }).length };
}
// R36: danh sách đơn NHẸ cho ô lọc "Đơn hàng / PO" (chỉ bảng Order + Partner). Thay cho order.list (đọc thêm Accrual, DebtDoc, DebtLine… chỉ để lấy nhãn). Cùng phạm vi xem như order.list; gồm cả đơn đã lưu trữ/đã hủy.
var ORDER_OPTIONS_MAX_ = 5000;
function orderOptions_(user, req) {
    requirePerm_(user, 'read');
    var pm = partnerMap_(), list = repoValid_('Order').filter(function (o) { return o.status !== 'DELETED' && orderInScope_(user, o, pm); });
    list.sort(function (a, b) { return cmpStr_(b.orderDate || '', a.orderDate || '') || cmpStr_(a.orderNo || '', b.orderNo || ''); });
    return { total: list.length, truncated: list.length > ORDER_OPTIONS_MAX_, items: list.slice(0, ORDER_OPTIONS_MAX_).map(function (o) { return { id: o.id, orderNo: o.orderNo, poNo: o.poNo || '', customerName: partnerName_(pm, o.customerPartnerId) }; }) };
}
function orderList_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, adv = advParse_('orders', p.adv, ''), D = orderListData_(user, p.asOf || todayVn_()), q = normText_(p.q), cand = [], actx = accrualCtx_(), today = todayVn_();
    validateListDates_(p);
    Object.keys(D.accByOrder).forEach(function (id) { D.accByOrder[id] = D.accByOrder[id].map(function (x) { return accrualAt_(x, today, actx); }).filter(Boolean); });
    D.orders.forEach(function (o) {
        if (p.status && o.status !== p.status)
            return;
        if (o.archivedAt && !(adv.flag.includeArchived || adv.flag.onlyArchived || p.includeArchived))
            return;
        if (adv.flag.onlyArchived && !o.archivedAt)
            return;
        if (p.partnerId && o.customerPartnerId !== p.partnerId)
            return;
        if (p.group && o.businessGroupCode !== p.group)
            return;
        if (!advIn_(adv, 'orderId', o.id) || !advIn_(adv, 'partnerId', o.customerPartnerId) || !advIn_(adv, 'group', o.businessGroupCode) || !advIn_(adv, 'status', o.status) || !advRange_(adv, 'orderDate', o.orderDate))
            return;
        if (p.from && o.orderDate < p.from)
            return;
        if (p.to && o.orderDate > p.to)
            return;
        if (adv.sel.serviceCode && !orderServices_(o).some(function (x) { return adv.sel.serviceCode.indexOf(x.code) >= 0; }))
            return;
        if (adv.flag.onlyMissingService && orderServices_(o).length)
            return;
        if (adv.flag.onlyUninvoiced || adv.flag.onlyInvoicing) {
            var ta = orderTotals(D.accByOrder[o.id] || []);
            if (adv.flag.onlyUninvoiced && !Object.keys(ta).some(function (c) { return ta[c].incompleteRevenue > 0 || ta[c].incompleteCost > 0; }))
                return;
            if (adv.flag.onlyInvoicing && !Object.keys(ta).some(function (c) { return ta[c].invoicingRevenue > 0 || ta[c].invoicingCost > 0; }))
                return;
        }
        if (p.onlyMissingService && orderServices_(o).length)
            return;
        if (p.onlyUninvoiced) {
            var t = orderTotals(D.accByOrder[o.id] || []);
            if (!Object.keys(t).some(function (c) { return t[c].incompleteRevenue > 0 || t[c].incompleteCost > 0; }))
                return;
        }
        if (q) {
            var sv = servicesOut_(o);
            if (normText_([o.orderNo, o.poNo, sv.map(function (x) { return x.hsdvNo; }).filter(Boolean).join(', '), partnerName_(D.pm, o.customerPartnerId), sv.map(function (x) { return x.code; }).join(', '), o.note].join(' ')).indexOf(q) < 0)
                return;
        }
        cand.push(o);
    });
    cand.sort(function (a, b) { return cmpStr_(b.orderDate, a.orderDate) || cmpStr_(b.orderNo, a.orderNo); });
    var pg = paginate_(cand, p.page, p.pageSize);
    return { items: pg.items.map(function (o) { return orderOut_(o, D); }), total: pg.total, page: pg.page, pageSize: pg.pageSize, adv: adv };
}
// Đối chiếu đơn hàng (cha) = các khoản phát sinh (con): theo từng tiền tệ, tổng khoản (không tính khoản hủy) = chưa lập + đang lập + đã lập; phần chia của chi phí chung phải cộng đúng bằng khoản gốc.
function orderReconcile_(oo, rows, proj) {
    var cur = {}, bad = [], parents = {};
    proj.forEach(function (a) {
        if (a.status === 'CANCELLED')
            return;
        var c = cur[a.currency] = cur[a.currency] || { childSumMinor: 0, revenueMinor: 0, costMinor: 0 };
        c.childSumMinor += a.grossMinor;
        if (a.kind === 'REVENUE') c.revenueMinor += a.grossMinor; else c.costMinor += a.grossMinor;
    });
    rows.forEach(function (a) {
        if (a.status === 'CANCELLED' || !a.sharedFrom)
            return;
        var s = parents[a.sharedFrom] = parents[a.sharedFrom] || { net: 0, gross: 0 };
        s.net += a.netMinor; s.gross += a.grossMinor;
    });
    var accs = byId_(repoValid_('Accrual'));
    Object.keys(parents).forEach(function (id) {
        var par = accs[id], split = groupBy_(repoValid_('AccrualSplit'), function (x) { return x.accrualId; })[id] || [], all = 0;
        split.forEach(function (x) { all += x.shareGrossMinor; });
        if (par && all !== par.grossMinor)
            bad.push({ accrualId: id, parentMinor: par.grossMinor, shareSumMinor: all });
    });
    var ok = true;
    Object.keys(cur).forEach(function (c) {
        var t = oo.totals[c] || {}, byState = (t.uninvoicedRevenue || 0) + (t.uninvoicedCost || 0) + (t.invoicingRevenue || 0) + (t.invoicingCost || 0) + (t.invoicedRevenue || 0) + (t.invoicedCost || 0);
        cur[c].stateSumMinor = byState;
        cur[c].ok = byState === cur[c].childSumMinor;
        if (!cur[c].ok) ok = false;
    });
    return { byCurrency: cur, splitMismatches: bad, childOk: ok && !bad.length };
}
// R36: lãi gộp quy đổi VND (THAM KHẢO) của một đơn. Chỉ tính khoản ĐÃ GHI NHẬN (INVOICED, không phải thu hộ/chi hộ): khoản chưa lập hóa đơn chưa là doanh thu/chi phí ghi nhận nên không vào lãi.
// Mỗi lần ghi nhận (hóa đơn gốc và từng điều chỉnh) quy đổi theo tỷ giá ĐÃ LƯU trên chính chứng từ đó (fxRateE4); VND giữ nguyên. Khoản đã ghi nhận nhưng chứng từ chưa có tỷ giá thì không tính và đếm vào missing.
// Phần chia nhiều đơn: chia theo tỷ lệ phần của khoản gốc.
function orderBaseTotals_(list, asOf, ctx, accById) {
    var cm = currencyMap_(), out = { currency: BASE_CUR_, revenue: 0, cost: 0, margin: 0, marginPct: null, byCurrency: {}, missing: 0 }, pcache = {};
    function parentTotals_(pid, cur) {
        if (pcache[pid])
            return pcache[pid];
        var p = accById[pid], dec = (cm[cur] || { decimals: 0 }).decimals, res = pcache[pid] = { N: 0, B: 0, ok: true };
        if (!p) {
            res.ok = false;
            return res;
        }
        var cand = Object.keys(ctx.byAcc[pid] || {}).map(function (k) { return ctx.byAcc[pid][k]; }).filter(function (d) { return d.docType !== 'ADJ_INC' && d.docType !== 'ADJ_DEC' && d.status === 'POSTED' && (d.postingDate || docEffDate_(d)) <= asOf && !(ctx.revOf[d.id] && ctx.revOf[d.id] <= asOf); });
        var d0 = cand[0] || (p.docId ? ctx.docById[p.docId] : null);
        function add(net, rate) {
            res.N += net;
            if (cur === BASE_CUR_)
                res.B += net;
            else if (rate > 0)
                res.B += fxToBase_(net, dec, rate);
            else
                res.ok = false;
        }
        add(p.netMinor, d0 ? d0.fxRateE4 : 0);
        (ctx.adjBy[pid] || []).forEach(function (x) { if (x.eff <= asOf)
            add(x.net, x.rate); });
        return res;
    }
    list.forEach(function (a) {
        if (a.status !== 'INVOICED' || a.isPassThrough)
            return;
        var pid = a.sharedFrom || a.id, pt = parentTotals_(pid, a.currency);
        if (!pt.ok) {
            out.missing++;
            return;
        }
        var base = !a.sharedFrom ? pt.B : (pt.N === 0 ? 0 : Number((BigInt(a.netMinor) * BigInt(pt.B) * BigInt(2) + BigInt(pt.N)) / (BigInt(pt.N) * BigInt(2)))), rev = a.kind === 'REVENUE', bc = out.byCurrency[a.currency] = out.byCurrency[a.currency] || { foreign: 0, base: 0 };
        out[rev ? 'revenue' : 'cost'] += base;
        bc.foreign += a.netMinor;
        bc.base += base;
    });
    Object.keys(out.byCurrency).forEach(function (c) { var b = out.byCurrency[c], dec = (cm[c] || { decimals: 0 }).decimals; b.avgRate = b.foreign ? Math.round(b.base / (b.foreign / Math.pow(10, dec)) * 100) / 100 : null; });
    out.margin = out.revenue - out.cost;
    out.marginPct = out.revenue > 0 ? Math.round(out.margin * 10000 / out.revenue) / 100 : null;
    return out;
}
function orderGet_(user, req) {
    requirePerm_(user, 'read');
    var o = repoFind_('Order', req.payload.id);
    if (!o)
        throw err_('NOT_FOUND', 'Không tìm thấy đơn hàng.');
    var pm = partnerMap_();
    assertVisible_(user, pm[o.customerPartnerId], o.businessGroupCode, 'đơn hàng');
    var asOf = req.payload.asOf || todayVn_(), led = loadLedger_({ role: 'APPROVER', scope: { allPartners: true } }, asOf);
    var acc = repoValid_('Accrual').filter(function (a) { return a.orderId === o.id; }).concat(costShareRows_({ [o.id]: o }).filter(function (x) { return x.orderId === o.id; })).sort(function (a, b) { return cmpStr_(a.accrualDate, b.accrualDate) || cmpStr_(a.id, b.id); });
    var docs = byId_(repoValid_('DebtDoc'));
    var out = acc.map(function (a) {
        var d = docs[a.docId], lb = led.bal.byLine[a.debtLineId];
        return { id: a.id, kind: a.kind, serviceCode: a.sharedFrom ? '' : accrualServiceCode_(a, o), hsdvNo: a.sharedFrom ? '' : serviceNoOf_(o, accrualServiceCode_(a, o)), department: a.sharedFrom ? '' : serviceDept_(accrualServiceCode_(a, o)), partnerId: a.partnerId, partnerName: partnerName_(pm, a.partnerId), poRef: a.poRef, accrualDate: a.accrualDate, feeTypeCode: a.feeTypeCode, description: a.description, containerQty: a.containerQty, unitPrice: a.unitPrice,
            netMinor: a.netMinor, vatMode: a.vatMode, vatRateBp: a.vatRateBp, vatMinor: a.vatMinor, grossMinor: a.grossMinor, isPassThrough: a.isPassThrough, currency: a.currency, status: a.status, note: a.note, version: a.version,
            docId: a.docId, docNo: d ? d.docNo : '', docStatus: d ? d.status : '', invoiceNo: d ? d.invoiceNo : '', sharedFrom: a.sharedFrom || '', outstandingMinor: lb && !a.sharedFrom ? lb.out : null, allocatedMinor: lb && !a.sharedFrom ? lb.alloc : null };
    });
    var linked = {};
    out.forEach(function (a) { if (a.docId)
        linked[a.docId] = { id: a.docId, docNo: a.docNo, status: a.docStatus, direction: a.kind === 'REVENUE' ? 'AR' : 'AP', invoiceNo: a.invoiceNo }; });
    var actx = accrualCtx_(), proj = acc.map(function (x) { return accrualAt_(x, todayVn_(), actx); }).filter(Boolean), oo = orderOut_(o, { pm: pm, accByOrder: { [o.id]: proj } });
    var rc = orderReconcile_(oo, out, proj);
    oo.baseTotals = orderBaseTotals_(proj, todayVn_(), actx, byId_(repoValid_('Accrual')));
    return { order: oo, accruals: out, reconcile: rc, documents: Object.keys(linked).map(function (k) { return linked[k]; }), canEdit: can_(user, 'order.write') && o.status === 'OPEN', asOf: asOf };
}
function orderSave_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'order.save', payload: p, failAt: req.failAt }, function (tx) {
        var errs = [], env = docEnv_(tx, p.customerPartnerId, user), existing = p.id ? tx.find('Order', p.id) : null;
        function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy đơn hàng.');
        if (existing)
            assertVisible_(user, tx.find('Partner', existing.customerPartnerId), existing.businessGroupCode, 'đơn hàng');
        if (existing && existing.status !== 'OPEN')
            throw err_('STATE_TRANSITION_INVALID', 'Đơn hàng đã đóng/hủy, không sửa.');
        if (!env.partner)
            E('customerPartnerId', 'REQUIRED', 'Chọn khách hàng.');
        else if (!env.partner.isCustomer)
            E('customerPartnerId', 'PARTNER_ROLE', 'Đối tác không phải khách hàng.');
        if (!env.currencies[p.currency])
            E('currency', 'REQUIRED', 'Chọn tiền tệ chính của đơn.');
        if (!p.businessGroupCode || env.groups.indexOf(p.businessGroupCode) < 0)
            E('businessGroupCode', 'REQUIRED', 'Chọn nhóm nghiệp vụ.');
        if (!isDate_(p.orderDate))
            E('orderDate', 'DATE_INVALID', 'Nhập ngày đơn hàng hợp lệ.');
        else if (p.orderDate < ledgerStart_())
            E('orderDate', 'DATE_BEFORE_LEDGER_START', 'Ngày đơn trước ngày đầu sổ ' + ledgerStart_() + ': khoản còn nợ phải nhập ở màn hình dư đầu kỳ.');
        if (String(p.poNo || '').length > 100)
            E('poNo', 'TOO_LONG', 'Số PO tối đa 100 ký tự.');
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        assertScope_(user, env.partner, p.businessGroupCode);
        var poNo = String(p.poNo || '').trim(), warnings = [];
        if (poNo)
            tx.rows('Order').forEach(function (o) { if ((!existing || o.id !== existing.id) && o.customerPartnerId === env.partner.id && normText_(o.poNo) === normText_(poNo) && o.status !== 'CANCELLED')
                warnings.push({ code: 'W-DUP', message: 'Số PO đã có ở đơn ' + o.orderNo }); });
        var rmap = serviceMap_(), curSv = existing ? orderServices_(existing) : [], codes = [];
        (Array.isArray(p.serviceCodes) ? p.serviceCodes : (p.serviceCode ? [p.serviceCode] : [])).forEach(function (c) { c = String(c || '').trim().toUpperCase(); if (c && codes.indexOf(c) < 0)
            codes.push(c); });
        if (!codes.length)
            errs.push({ path: 'serviceCodes', code: 'REQUIRED', message: 'Chọn ít nhất một mã dịch vụ cho PO.' });
        if (codes.length > 10)
            errs.push({ path: 'serviceCodes', code: 'TOO_MANY', message: 'Tối đa 10 mã dịch vụ cho một PO.' });
        codes.forEach(function (c) {
            var had = curSv.some(function (x) { return x.code === c; });
            if (!rmap[c] || (!rmap[c].active && !had))
                errs.push({ path: 'serviceCodes', code: 'INVALID', message: 'Mã dịch vụ ' + c + ' không tồn tại hoặc đã ngừng dùng.' });
        });
        if (existing)
            curSv.forEach(function (x) {
                if (codes.indexOf(x.code) >= 0)
                    return;
                if (tx.rows('Accrual').some(function (a) { return a.orderId === existing.id && a.status !== 'CANCELLED' && accrualServiceCode_(a, existing) === x.code; }))
                    errs.push({ path: 'serviceCodes', code: 'SERVICE_IN_USE', message: 'Mã ' + x.code + ' đã có khoản doanh thu/chi phí trong PO: không bỏ được (hủy các khoản đó trước).' });
            });
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        // Khóa kỳ: đơn có ngày thuộc kỳ đã khóa không đổi ngày/khách/nhóm/tiền tệ (ảnh hưởng báo cáo kỳ đó); đơn mới không được lập vào kỳ đã khóa.
        if (!existing || existing.orderDate !== p.orderDate)
            assertPeriodOpen_(tx, p.orderDate);
        if (existing && existing.orderDate && (existing.orderDate !== p.orderDate || existing.customerPartnerId !== env.partner.id || existing.businessGroupCode !== p.businessGroupCode || existing.currency !== p.currency))
            assertPeriodOpen_(tx, existing.orderDate);
        var anyNo = curSv.some(function (x) { return x.hsdvNo; });
        if (anyNo && (existing.customerPartnerId !== env.partner.id || String(existing.orderDate || '').slice(0, 4) !== String(p.orderDate).slice(0, 4)))
            throw err_('HSDV_LOCKED', 'Đơn đã được cấp số HSDV: không đổi khách hàng hoặc năm của ngày đơn. Hủy đơn và tạo đơn mới nếu cần.');
        var allOrders = tx.rows('Order'), newSv = codes.map(function (c) {
            var old = curSv.filter(function (x) { return x.code === c; })[0];
            return { code: c, hsdvNo: old && old.hsdvNo ? old.hsdvNo : hsdvNumber_(tx, env.partner, c, p.orderDate, allOrders) };
        });
        var fields = { customerPartnerId: env.partner.id, poNo: poNo, orderDate: p.orderDate, businessGroupCode: p.businessGroupCode, currency: p.currency, servicesJson: JSON.stringify(newSv), serviceCode: newSv[0].code, hsdvNo: newSv[0].hsdvNo, note: maxStr_(p.note, 500), searchText: normText_(env.partner.shortName + ' ' + poNo + ' ' + newSv.map(function (x) { return x.code + ' ' + x.hsdvNo; }).join(' ')) };
        var row;
        if (existing)
            row = tx.update('Order', existing.id, fields, p.ifVersion);
        else {
            var y = p.orderDate.slice(0, 4);
            row = tx.insert('Order', Object.assign({ orderNo: 'DH-' + y + '-' + ('000000' + tx.nextSeq('seq.DH.' + y)).slice(-6), status: 'OPEN' }, fields));
        }
        return { result: { id: row.id, orderNo: row.orderNo || existing.orderNo, services: newSv, hsdvNo: newSv.map(function (x) { return x.hsdvNo; }).join(', '), version: existing ? existing.version + 1 : 1, warnings: warnings }, audit: [{ entityType: 'Order', entityId: row.id, action: existing ? 'order.update' : 'order.create', diff: fields }] };
    });
}
function orderAssignService_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload || {}, ids = Array.isArray(p.orderIds) ? p.orderIds.filter(function (x, i, a) { return typeof x === 'string' && a.indexOf(x) === i; }) : [], code = String(p.serviceCode || '').trim().toUpperCase();
    if (!ids.length || ids.length > 200)
        throw err_('VALIDATION_FAILED', 'Chọn từ 1 đến 200 PO.', [{ path: 'orderIds', code: 'REQUIRED', message: 'Chọn PO cần gán mã.' }]);
    var rm = serviceMap_();
    if (!rm[code] || !rm[code].active)
        throw err_('VALIDATION_FAILED', 'Mã dịch vụ không tồn tại hoặc đã ngừng dùng.', [{ path: 'serviceCode', code: 'INVALID', message: 'Chọn mã dịch vụ hợp lệ.' }]);
    return runTx_(user, { requestId: req.requestId, action: 'order.assignService', payload: p, failAt: req.failAt }, function (tx) {
        var all = tx.rows('Order'), assigned = [], skipped = [];
        ids.forEach(function (id) {
            var o = tx.find('Order', id);
            if (!o) {
                skipped.push({ id: id, reason: 'Không tìm thấy PO.' });
                return;
            }
            var partner = tx.find('Partner', o.customerPartnerId);
            if (!inScope_(user, partner, o.businessGroupCode)) {
                skipped.push({ id: id, reason: 'Không tìm thấy PO.' });
                return;
            }
            if (o.status === 'CANCELLED') {
                skipped.push({ id: id, orderNo: o.orderNo, reason: 'PO đã hủy.' });
                return;
            }
            if (orderServices_(o).length) {
                skipped.push({ id: id, orderNo: o.orderNo, reason: 'PO đã có mã dịch vụ.' });
                return;
            }
            if (!isDate_(o.orderDate) || !hsdvAbbr_(partner)) {
                skipped.push({ id: id, orderNo: o.orderNo, reason: 'Thiếu ngày đơn hoặc tên viết tắt của khách để cấp số HSDV.' });
                return;
            }
            var sv = [{ code: code, hsdvNo: hsdvNumber_(tx, partner, code, o.orderDate, all) }];
            tx.update('Order', o.id, { servicesJson: JSON.stringify(sv), serviceCode: code, hsdvNo: sv[0].hsdvNo, searchText: normText_(partner.shortName + ' ' + (o.poNo || '') + ' ' + code + ' ' + sv[0].hsdvNo) });
            o.servicesJson = JSON.stringify(sv);
            assigned.push({ id: o.id, orderNo: o.orderNo, hsdvNo: sv[0].hsdvNo });
        });
        return { result: { assigned: assigned, skipped: skipped }, audit: [{ entityType: 'Order', entityId: 'bulk', action: 'order.assignService', diff: { code: code, assigned: assigned.length, skipped: skipped.length } }] };
    });
}
function orderSetStatus_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'order.setStatus', payload: p, failAt: req.failAt }, function (tx) {
        var o = tx.find('Order', p.id);
        if (!o)
            throw err_('NOT_FOUND', 'Không tìm thấy đơn hàng.');
        assertVisible_(user, tx.find('Partner', o.customerPartnerId), o.businessGroupCode, 'đơn hàng');
        if (ORDER_STATUS_.indexOf(p.status) < 0)
            throw err_('VALIDATION_FAILED', 'Trạng thái không hợp lệ.');
        if (o.archivedAt)
            throw err_('ORDER_ARCHIVED', 'Đơn đã lưu trữ: hãy mở lại lưu trữ (kèm lý do) trước khi đổi trạng thái.');
        if (o.status === 'CANCELLED')
            throw err_('STATE_TRANSITION_INVALID', 'Đơn đã hủy: các khoản phát sinh đã bị hủy theo, không mở lại. Hãy tạo đơn mới.');
        if (o.status === p.status)
            throw err_('STATE_TRANSITION_INVALID', 'Đơn đã ở trạng thái này.');
        var acc = tx.rows('Accrual').filter(function (a) { return a.orderId === o.id && a.status !== 'CANCELLED'; });
        if (p.status === 'CANCELLED') {
            var accsAll = byId_(tx.rows('Accrual')), shared = tx.rows('AccrualSplit').filter(function (sp) { var pa = accsAll[sp.accrualId]; return sp.orderId === o.id && pa && pa.status !== 'CANCELLED'; });
            if (shared.length)
                throw err_('ORDER_HAS_SHARED_COST', 'Đơn đang nhận phần chi phí chia từ ' + shared.length + ' khoản dùng chung. Hãy sửa lại cách chia (hoặc hủy khoản đó) trước khi hủy đơn.');
        }
        if (p.status === 'CANCELLED' && acc.some(function (a) { return a.status !== 'OPEN'; }))
            throw err_('ORDER_HAS_INVOICES', 'Đơn đã có hóa đơn: không hủy được. Hãy đảo hóa đơn trước.');
        if (p.status === 'CLOSED' && acc.some(function (a) { return a.status === 'OPEN' || a.status === 'INVOICING'; }) && !p.force)
            throw err_('ORDER_HAS_UNINVOICED', 'Còn khoản phát sinh chưa lập hoặc đang lập hóa đơn (chưa hoàn tất). Xác nhận đóng đơn khi cố ý bỏ qua.');
        if (p.status === 'CANCELLED') {
            var plinks = tx.rows('PassLink');
            if (acc.some(function (a) { return passLinkedSum_(plinks, a.id) > 0; }))
                throw err_('ORDER_HAS_PASS_LINKS', 'Đơn có khoản thu hộ/chi hộ đang được bù trừ. Gỡ ghép ở màn Thu hộ / Chi hộ trước khi hủy đơn.');
            assertPeriodOpen_(tx, todayVn_());
            acc.forEach(function (a) { tx.update('Accrual', a.id, { status: 'CANCELLED', cancelledDate: todayVn_() }); });
        }
        tx.update('Order', o.id, p.status === 'CANCELLED' ? { status: p.status, cancelledDate: todayVn_() } : { status: p.status }, p.ifVersion);
        return { result: { id: o.id, status: p.status }, audit: [{ entityType: 'Order', entityId: o.id, action: 'order.' + p.status.toLowerCase(), diff: { force: !!p.force } }] };
    });
}
// ---- Lưu trữ PO: chỉ ĐỔI TRẠNG THÁI (archivedAt), không chuyển/xóa hồ sơ; ID và liên kết giữ nguyên; mở lại được ----
var ARCH_ACK_ = ['UNALLOCATED_CASH', 'PASS_THROUGH_GAP', 'ONE_SIDED'];
function orderArchiveAnalysis_(o) {
    var today = todayVn_(), pm = partnerMap_(), led = loadLedger_(RM_USER_, today), actx = accrualCtx_(), oset = {}, blockers = [], warnings = [];
    oset[o.id] = o;
    var raw = repoValid_('Accrual').filter(function (a) { return a.orderId === o.id; }).concat(costShareRows_(oset));
    var list = raw.map(function (x) { return accrualAt_(x, today, actx); }).filter(function (a) { return a && a.status !== 'CANCELLED'; }), docs = byId_(repoValid_('DebtDoc'));
    function B(code, message, items) { blockers.push({ code: code, message: message, items: items || [] }); }
    function W(code, message, items) { warnings.push({ code: code, message: message, items: items || [] }); }
    if (o.status !== 'CLOSED')
        B('NOT_CLOSED', 'Đơn chưa hoàn thành: phải ở trạng thái "Đã đóng" mới lưu trữ được.');
    if (!list.length)
        B('NO_ACCRUALS', 'Đơn chưa có khoản doanh thu/chi phí nào: chưa đủ dữ liệu để kết luận đã quyết toán.');
    var un = list.filter(function (a) { return a.status === 'OPEN' || a.status === 'INVOICING'; });
    if (un.length)
        B('UNINVOICED', 'Còn ' + un.length + ' khoản phát sinh chưa lập xong hóa đơn.', un.map(function (a) { return (a.kind === 'REVENUE' ? 'Doanh thu ' : 'Chi phí ') + (a.description || a.id) + ' ' + a.grossMinor + ' ' + a.currency; }));
    var pend = {};
    list.forEach(function (a) { var d = a.docId && docs[a.docId]; if (d && (d.status === 'DRAFT' || d.status === 'SUBMITTED' || d.status === 'APPROVED'))
        pend[d.id] = d.docNo + ' (' + d.status + ')'; });
    if (Object.keys(pend).length)
        B('PENDING_DOCS', 'Còn chứng từ đang chờ duyệt/ghi sổ.', Object.keys(pend).map(function (k) { return pend[k]; }));
    // Còn phải thu / phải trả: kiểm tra RIÊNG từng chiều, đối tác, tiền tệ (không bù trừ)
    var out = {}, partners = {}, curs = {};
    list.forEach(function (a) {
        partners[a.partnerId] = 1;
        curs[a.currency] = 1;
        if (a.status !== 'INVOICED' || !a.debtLineId)
            return;
        var b = led.bal.byLine[a.debtLineId];
        if (!b || b.out === 0)
            return;
        var dir = a.kind === 'REVENUE' ? 'AR' : 'AP', k = [dir, a.partnerId, a.currency].join('|');
        out[k] = out[k] || { dir: dir, partnerId: a.partnerId, partner: partnerName_(pm, a.partnerId), currency: a.currency, outMinor: 0, shared: 0 };
        out[k].outMinor += b.out;
        if (a.sharedFrom)
            out[k].shared++;
    });
    var outRows = Object.keys(out).map(function (k) { return out[k]; });
    if (outRows.length)
        B('OUTSTANDING', 'Còn công nợ chưa tất toán (xét riêng từng đối tác và tiền tệ, không bù trừ phải thu với phải trả).', outRows.map(function (r) { return (r.dir === 'AR' ? 'Phải thu ' : 'Phải trả ') + r.partner + ': ' + r.outMinor + ' ' + r.currency + (r.shared ? ' (gồm chi phí dùng chung)' : ''); }));
    // Tiền chưa phân bổ / ứng trước của các đối tác trong đơn (cùng tiền tệ)
    var unal = [];
    led.payments.forEach(function (p) { var b = led.payBal[p.id]; if (b && b.unalloc !== 0 && p.status === 'POSTED' && partners[p.partnerId] && curs[p.currency])
        unal.push(partnerName_(pm, p.partnerId) + ': phiếu ' + p.payNo + ' chưa phân bổ ' + b.unalloc + ' ' + p.currency); });
    if (unal.length)
        W('UNALLOCATED_CASH', 'Đối tác trong đơn còn khoản ứng/tiền chưa phân bổ. Chỉ bỏ qua nếu khoản đó thuộc việc khác.', unal);
    var tot = orderTotals(list), gap = [];
    Object.keys(tot).forEach(function (c) { if (tot[c].passGap)
        gap.push('Thu hộ/chi hộ lệch ' + tot[c].passGap + ' ' + c); });
    if (gap.length)
        W('PASS_THROUGH_GAP', 'Thu hộ và chi hộ chưa khớp nhau.', gap);
    var hasRev = list.some(function (a) { return a.kind === 'REVENUE'; }), hasCost = list.some(function (a) { return a.kind === 'COST'; });
    if (list.length && (!hasRev || !hasCost))
        W('ONE_SIDED', 'Đơn chỉ có ' + (hasRev ? 'doanh thu, chưa có chi phí' : 'chi phí, chưa có doanh thu') + '. Xác nhận tập hợp đã đủ.');
    return { orderId: o.id, orderNo: o.orderNo, status: o.status, archivedAt: o.archivedAt || '', eligible: !blockers.length, blockers: blockers, warnings: warnings, needsConfirm: true, version: o.version };
}
function orderArchiveCheck_(user, req) {
    requirePerm_(user, 'read');
    var o = repoFind_('Order', req.payload.id);
    if (!o)
        throw err_('NOT_FOUND', 'Không tìm thấy đơn hàng.');
    assertVisible_(user, partnerMap_()[o.customerPartnerId], o.businessGroupCode, 'đơn hàng');
    return orderArchiveAnalysis_(o);
}
function orderArchive_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'order.archive', payload: p, failAt: req.failAt }, function (tx) {
        var o = tx.find('Order', p.id);
        if (!o)
            throw err_('NOT_FOUND', 'Không tìm thấy đơn hàng.');
        assertVisible_(user, tx.find('Partner', o.customerPartnerId), o.businessGroupCode, 'đơn hàng');
        if (o.archivedAt)
            throw err_('STATE_TRANSITION_INVALID', 'Đơn đã được lưu trữ.');
        if (p.confirmComplete !== true)
            throw err_('ORDER_ARCHIVE_NEEDS_CONFIRM', 'Cần xác nhận đã tập hợp đủ doanh thu, chi phí và chứng từ của đơn.');
        var an = orderArchiveAnalysis_(o);
        if (!an.eligible)
            throw err_('ORDER_NOT_ARCHIVABLE', 'Chưa lưu trữ được: ' + an.blockers.map(function (b) { return b.message; }).join(' '), an.blockers.map(function (b) { return { path: b.code, code: b.code, message: b.message }; }));
        var acks = Array.isArray(p.acks) ? p.acks : [], miss = an.warnings.filter(function (w) { return acks.indexOf(w.code) < 0; });
        if (miss.length)
            throw err_('ORDER_ARCHIVE_NEEDS_ACK', 'Cần xác nhận riêng: ' + miss.map(function (w) { return w.message; }).join(' '), miss.map(function (w) { return { path: w.code, code: w.code, message: w.message }; }));
        var note = maxStr_(String(p.note || '').trim(), 300);
        if (an.warnings.length && !note)
            throw err_('VALIDATION_FAILED', 'Nhập ghi chú lý do khi bỏ qua cảnh báo.', [{ path: 'note', code: 'REQUIRED', message: 'Nhập ghi chú.' }]);
        tx.update('Order', o.id, { archivedAt: nowIso_(), archivedBy: user.email, archiveNote: note }, p.ifVersion);
        return { result: { id: o.id, archived: true }, audit: [{ entityType: 'Order', entityId: o.id, action: 'order.archived', diff: { acks: acks, note: note } }] };
    });
}
function orderUnarchive_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'order.unarchive', payload: p, failAt: req.failAt }, function (tx) {
        var o = tx.find('Order', p.id);
        if (!o)
            throw err_('NOT_FOUND', 'Không tìm thấy đơn hàng.');
        assertVisible_(user, tx.find('Partner', o.customerPartnerId), o.businessGroupCode, 'đơn hàng');
        if (!o.archivedAt)
            throw err_('STATE_TRANSITION_INVALID', 'Đơn chưa được lưu trữ.');
        var reason = maxStr_(String(p.reason || '').trim(), 300);
        if (!reason)
            throw err_('VALIDATION_FAILED', 'Nhập lý do mở lại đơn đã lưu trữ.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do.' }]);
        tx.update('Order', o.id, { archivedAt: '', archivedBy: '', archiveNote: '' }, p.ifVersion);
        return { result: { id: o.id, archived: false }, audit: [{ entityType: 'Order', entityId: o.id, action: 'order.unarchived', diff: { reason: reason, wasArchivedAt: o.archivedAt, wasArchivedBy: o.archivedBy } }] };
    });
}
function accrualSave_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'accrual.save', payload: p, failAt: req.failAt }, function (tx) {
        var existing = p.id ? tx.find('Accrual', p.id) : null, errs = [], pm = byId_(tx.rows('Partner'));
        function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy khoản phát sinh.');
        if (existing) {
            // Khoản ngoài phạm vi (theo đơn hoặc theo đối tác) trả NOT_FOUND ngay, trước mọi kiểm tra trạng thái/đơn khác.
            var eo0 = existing.orderId ? tx.find('Order', existing.orderId) : null;
            if (eo0)
                assertVisible_(user, pm[eo0.customerPartnerId], eo0.businessGroupCode, 'khoản phát sinh');
            else
                assertVisible_(user, pm[existing.partnerId], '', 'khoản phát sinh');
        }
        if (existing && existing.status !== 'OPEN')
            throw err_('STATE_TRANSITION_INVALID', 'Khoản đã lập hóa đơn, không sửa. Hãy xóa/đảo hóa đơn trước.');
        var mode = p.allocMode || (p.orderId ? 'ORDER' : (existing && !existing.orderId ? (tx.rows('AccrualSplit').some(function (x) { return x.accrualId === existing.id; }) ? 'SHARED' : 'GENERAL') : 'ORDER'));
        if (['ORDER', 'GENERAL', 'SHARED'].indexOf(mode) < 0)
            throw err_('VALIDATION_FAILED', 'Cách gắn chi phí không hợp lệ.');
        if (ACCRUAL_KINDS_.indexOf(p.kind) < 0)
            E('kind', 'REQUIRED', 'Chọn doanh thu hoặc chi phí.');
        if (p.kind === 'REVENUE' && mode !== 'ORDER')
            E('allocMode', 'REVENUE_NEEDS_ORDER', 'Doanh thu phải thuộc một đơn hàng/PO.');
        var o = null, orders = byId_(tx.rows('Order'));
        if (mode === 'ORDER') {
            o = orders[p.orderId];
            if (!o)
                throw err_('NOT_FOUND', 'Không tìm thấy đơn hàng.');
            assertVisible_(user, pm[o.customerPartnerId], o.businessGroupCode, 'đơn hàng');
            if (o.status !== 'OPEN')
                throw err_('STATE_TRANSITION_INVALID', 'Đơn hàng đã đóng/hủy.');
        }
        if (existing && existing.orderId) {
            var oe = orders[existing.orderId];
            if (oe)
                assertVisible_(user, pm[oe.customerPartnerId], oe.businessGroupCode, 'khoản phát sinh');
        }
        var partner = p.partnerId ? pm[p.partnerId] : null;
        if (partner && mode !== 'ORDER' && !inScope_(user, partner, ''))
            partner = null; // ngoài phạm vi: xử lý như không tồn tại
        if (!partner)
            E('partnerId', 'REQUIRED', p.kind === 'COST' ? 'Chọn nhà cung cấp.' : 'Chọn khách hàng.');
        else if (p.kind === 'REVENUE' && !partner.isCustomer)
            E('partnerId', 'PARTNER_ROLE', 'Doanh thu phải ghi cho khách hàng.');
        else if (p.kind === 'COST' && !partner.isSupplier)
            E('partnerId', 'PARTNER_ROLE', 'Chi phí phải ghi cho nhà cung cấp.');
        if (partner && mode !== 'ORDER')
            assertScope_(user, partner, '');
        if (existing && !existing.orderId)
            assertVisible_(user, pm[existing.partnerId], '', 'khoản phát sinh');
        var svcCode = '';
        if (mode === 'ORDER' && o) {
            var pk = pickAccrualService_(o, p.serviceCode);
            if (pk.err)
                E('serviceCode', 'SERVICE_CODE', pk.err);
            else
                svcCode = pk.code;
        }
        var cur = currencyMap_();
        if (!cur[p.currency])
            E('currency', 'REQUIRED', 'Chọn tiền tệ.');
        if (!isDate_(p.accrualDate))
            E('accrualDate', 'DATE_INVALID', 'Nhập ngày phát sinh hợp lệ.');
        else if (p.accrualDate < ledgerStart_())
            E('accrualDate', 'DATE_BEFORE_LEDGER_START', 'Ngày phát sinh trước ngày đầu sổ.');
        var feeTypes = catalogList_('FEE_TYPE').map(function (c) { return c.code; });
        var calc = calcLine_({ feeTypeCode: p.feeTypeCode, description: p.description, netMinor: p.netMinor, vatMode: p.vatMode, vatRateBp: p.vatRateBp, containerQty: p.containerQty, unitPrice: p.unitPrice, isPassThrough: p.isPassThrough }, 0, false, p.currency);
        calc.errors.forEach(function (e) { errs.push({ path: e.path.replace(/^lines\[0\]\./, ''), code: e.code, message: e.message }); });
        if (p.feeTypeCode && feeTypes.indexOf(p.feeTypeCode) < 0)
            E('feeTypeCode', 'INVALID', 'Loại phí không tồn tại.');
        var shares = null;
        if (mode === 'SHARED')
            shares = splitCostShares_(p, calc.line, orders, pm, user, E);
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        // Khoản đang được bù trừ thu hộ/chi hộ: không đổi loại, tiền tệ, đối tác, đơn, bỏ đánh dấu hộ, hay giảm số tiền xuống dưới phần đã ghép. Phải gỡ ghép trước.
        if (existing) {
            var linkedSum = passLinkedSum_(tx.rows('PassLink'), existing.id);
            if (linkedSum > 0) {
                var l0 = calc.line, why = '';
                if (p.kind !== existing.kind || p.currency !== existing.currency || partner.id !== existing.partnerId || (mode === 'ORDER' ? o.id : '') !== (existing.orderId || ''))
                    why = 'đổi loại/tiền tệ/đối tác/đơn';
                else if (!l0.isPassThrough)
                    why = 'bỏ đánh dấu thu hộ/chi hộ';
                else if (l0.grossMinor < linkedSum)
                    why = 'giảm số tiền xuống ' + l0.grossMinor + ' (đã ghép ' + linkedSum + ')';
                if (why)
                    throw err_('STATE_TRANSITION_INVALID', 'Khoản đang được bù trừ thu hộ/chi hộ nên không thể ' + why + '. Gỡ ghép ở màn Thu hộ / Chi hộ trước.');
            }
        }
        // Khóa kỳ: không tạo/sửa/chuyển khoản có ngày thuộc kỳ đã khóa (kiểm cả ngày cũ lẫn ngày mới). Nghiệp vụ phát sinh sau khóa kỳ ghi vào kỳ đang mở hoặc mở lại kỳ theo quy trình.
        if (existing && existing.accrualDate)
            assertPeriodOpen_(tx, existing.accrualDate);
        assertPeriodOpen_(tx, p.accrualDate);
        var l = calc.line, fields = { orderId: mode === 'ORDER' ? o.id : '', serviceCode: svcCode, kind: p.kind, partnerId: partner.id, poRef: maxStr_(p.poRef, 100).trim(), accrualDate: p.accrualDate, feeTypeCode: l.feeTypeCode, description: l.description, containerQty: l.containerQty, unitPrice: l.unitPrice,
            netMinor: l.netMinor, vatMode: l.vatMode, vatRateBp: l.vatRateBp, vatMinor: l.vatMinor, grossMinor: l.grossMinor, isPassThrough: l.isPassThrough, currency: p.currency, note: maxStr_(p.note, 300) };
        var creditWarn = p.kind === 'REVENUE' ? enforceCredit_(tx, user, partner.id, p.currency, todayVn_(), existing ? l.grossMinor - existing.grossMinor : l.grossMinor, p) : [];
        var row = existing ? tx.update('Accrual', existing.id, fields, p.ifVersion) : tx.insert('Accrual', Object.assign({ status: 'OPEN', docId: '', debtLineId: '' }, fields));
        tx.rows('AccrualSplit').forEach(function (x) { if (x.accrualId === row.id)
            tx.update('AccrualSplit', x.id, { isDeleted: 1 }); });
        if (shares)
            shares.forEach(function (x) { tx.insert('AccrualSplit', { accrualId: row.id, orderId: x.orderId, shareNetMinor: x.net, shareVatMinor: x.vat, shareGrossMinor: x.net + x.vat, basis: x.basis, note: '' }); });
        return { result: { id: row.id, grossMinor: l.grossMinor, status: 'OPEN', allocMode: mode, splitCount: shares ? shares.length : 0, warnings: creditWarn },
            audit: [{ entityType: o ? 'Order' : 'Accrual', entityId: o ? o.id : row.id, action: existing ? 'accrual.update' : 'accrual.create', diff: { kind: p.kind, gross: l.grossMinor, currency: p.currency, mode: mode, orders: shares ? shares.length : undefined } }] };
    });
}
function splitCostShares_(p, line, orders, pm, user, E) {
    var sp = Array.isArray(p.splits) ? p.splits : [], seen = {}, ok = true;
    if (sp.length < 2) {
        E('splits', 'SPLIT_MIN', 'Chia cho nhiều đơn cần ít nhất 2 đơn. Chỉ một đơn thì chọn "thuộc một đơn".');
        return null;
    }
    sp.forEach(function (x, i) {
        var o = orders[x.orderId], path = 'splits[' + i + '].orderId';
        if (!o) {
            E(path, 'ORDER_NOT_FOUND', 'Dòng ' + (i + 1) + ': không tìm thấy đơn hàng.');
            ok = false;
            return;
        }
        // Kiểm tra phạm vi TRƯỚC: đơn ngoài phạm vi không được lộ số đơn/trạng thái qua thông báo (trả cùng thông điệp như không tìm thấy).
        if (!orderInScope_(user, o, pm)) {
            E(path, 'ORDER_NOT_FOUND', 'Dòng ' + (i + 1) + ': không tìm thấy đơn hàng.');
            ok = false;
            return;
        }
        if (seen[o.id]) {
            E(path, 'ORDER_DUP', 'Dòng ' + (i + 1) + ': đơn ' + o.orderNo + ' bị trùng.');
            ok = false;
            return;
        }
        seen[o.id] = 1;
        if (o.status !== 'OPEN') {
            E(path, 'ORDER_NOT_OPEN', 'Dòng ' + (i + 1) + ': đơn ' + o.orderNo + ' đã đóng/hủy.');
            ok = false;
        }
    });
    if (!ok || !Number.isSafeInteger(line.netMinor))
        return null;
    var net = line.netMinor, weights, basis;
    if (p.equal) {
        weights = sp.map(function () { return 1; });
        basis = 'EQUAL';
    }
    else if (sp.every(function (x) { return x.pct !== undefined && x.pct !== null && x.pct !== ''; })) {
        weights = sp.map(function (x) { return Math.round(Number(x.pct) * 100); });
        basis = 'PERCENT';
        if (weights.some(function (w) { return !(w > 0); }) || weights.reduce(function (a, b) { return a + b; }, 0) !== 10000) {
            E('splits', 'SPLIT_PCT_SUM', 'Tổng phần trăm các đơn phải đúng 100%.');
            return null;
        }
    }
    else {
        weights = sp.map(function (x) { return Number(x.netMinor); });
        basis = 'AMOUNT';
        if (weights.some(function (w) { return !Number.isSafeInteger(w) || w <= 0; })) {
            E('splits', 'SPLIT_AMOUNT', 'Mỗi đơn phải có số tiền lớn hơn 0 (hoặc dùng phần trăm / chia đều).');
            return null;
        }
        if (weights.reduce(function (a, b) { return a + b; }, 0) !== net) {
            E('splits', 'SPLIT_SUM', 'Tổng các phần (' + weights.reduce(function (a, b) { return a + b; }, 0) + ') phải bằng số tiền trước thuế của khoản (' + net + ').');
            return null;
        }
    }
    var nets = basis === 'AMOUNT' ? weights : allocateMinor(net, weights), vats = allocateMinor(line.vatMinor || 0, nets.map(function (n) { return n > 0 ? n : 0; }).some(function (n) { return n > 0; }) ? nets : nets.map(function () { return 1; }));
    return sp.map(function (x, i) { return { orderId: x.orderId, net: nets[i], vat: vats[i], basis: basis }; });
}
var ACCRUAL_KINDS_ = ['REVENUE', 'COST'];
function accrualCancel_(user, req) {
    requirePerm_(user, 'order.write');
    return runTx_(user, { requestId: req.requestId, action: 'accrual.cancel', payload: req.payload, failAt: req.failAt }, function (tx) {
        var a = tx.find('Accrual', req.payload.id);
        if (!a)
            throw err_('NOT_FOUND', 'Không tìm thấy khoản phát sinh.');
        var o = a.orderId ? tx.find('Order', a.orderId) : null;
        if (o)
            assertVisible_(user, tx.find('Partner', o.customerPartnerId), o.businessGroupCode, 'khoản phát sinh');
        else
            assertVisible_(user, tx.find('Partner', a.partnerId), '', 'khoản phát sinh');
        if (a.status === 'CANCELLED')
            throw err_('STATE_TRANSITION_INVALID', 'Khoản này đã được hủy trước đó.');
        if (a.status !== 'OPEN')
            throw err_('STATE_TRANSITION_INVALID', 'Khoản đã lập hóa đơn, không hủy trực tiếp.');
        if (tx.rows('PassLink').some(function (l) { return l.status === 'ACTIVE' && l.isDeleted !== 1 && (l.costAccrualId === a.id || l.revenueAccrualId === a.id); }))
            throw err_('STATE_TRANSITION_INVALID', 'Khoản thu hộ/chi hộ đang được ghép đối ứng. Gỡ ghép ở màn Thu hộ / Chi hộ trước khi hủy.');
        assertPeriodOpen_(tx, todayVn_());
        tx.update('Accrual', a.id, { status: 'CANCELLED', cancelledDate: todayVn_() }, req.payload.ifVersion);
        return { result: { id: a.id, status: 'CANCELLED' }, audit: [{ entityType: o ? 'Order' : 'Accrual', entityId: o ? o.id : a.id, action: 'accrual.cancel', diff: { accrual: a.id } }] };
    });
}
function accrualList_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, D = orderListData_(user, todayVn_()), orders = byId_(D.orders), rows = [];
    function pass(a) { return !(a.status === 'CANCELLED' || (p.kind && a.kind !== p.kind) || (p.status && a.status !== p.status) || (p.partnerId && a.partnerId !== p.partnerId) || (p.currency && a.currency !== p.currency)); }
    function base(a) { return { id: a.id, version: a.version, serviceCode: a.serviceCode || '', poRef: a.poRef, partnerId: a.partnerId, kind: a.kind, partnerName: partnerName_(D.pm, a.partnerId), accrualDate: a.accrualDate, feeTypeCode: a.feeTypeCode, description: a.description, grossMinor: a.grossMinor, netMinor: a.netMinor, vatMode: a.vatMode, vatRateBp: a.vatRateBp, vatMinor: a.vatMinor, containerQty: a.containerQty, unitPrice: a.unitPrice, isPassThrough: a.isPassThrough, note: a.note, currency: a.currency, status: a.status, docId: a.docId }; }
    D.acc.forEach(function (a) {
        if (!pass(a))
            return;
        var o = orders[a.orderId];
        rows.push(Object.assign(base(a), { serviceCode: accrualServiceCode_(a, o), hsdvNo: serviceNoOf_(o, accrualServiceCode_(a, o)), department: serviceDept_(accrualServiceCode_(a, o)), orderId: a.orderId, orderNo: o.orderNo, poNo: o.poNo, orderStatus: o.status, allocMode: 'ORDER', splitCount: 0 }));
    });
    if (!p.kind || p.kind === 'COST')
        costsOutsideOrders_(user).forEach(function (x) {
            var a = x.a;
            if (!pass(a))
                return;
            var shared = x.splits.length > 0;
            rows.push(Object.assign(base(a), { orderId: '', orderNo: shared ? 'Chia ' + x.splits.length + ' đơn' : 'Chi phí chung', poNo: '', orderStatus: '', allocMode: shared ? 'SHARED' : 'GENERAL', splitCount: x.splits.length,
                splits: x.splits.map(function (sp) { var o = orders[sp.orderId]; return { orderId: sp.orderId, orderNo: o ? o.orderNo : '', poNo: o ? o.poNo : '', netMinor: sp.shareNetMinor, vatMinor: sp.shareVatMinor, grossMinor: sp.shareGrossMinor, basis: sp.basis }; }) }));
        });
    // Danh sách chờ phân bổ: chi phí chung (không thuộc đơn, không chia) hoặc chi phí của đơn nhưng chưa gắn mã dịch vụ/HSDV.
    var waitingCount = rows.filter(function (x) { return x.kind === 'COST' && (x.allocMode === 'GENERAL' || (x.orderId && !x.serviceCode)); }).length;
    if (p.waiting)
        rows = rows.filter(function (x) { return x.kind === 'COST' && (x.allocMode === 'GENERAL' || (x.orderId && !x.serviceCode)); });
    rows.sort(function (a, b) { return cmpStr_(a.accrualDate, b.accrualDate); });
    var pg = paginate_(rows, p.page, p.pageSize || 50);
    return { items: pg.items, total: pg.total, page: pg.page, pageSize: pg.pageSize, waitingCount: waitingCount };
}
/* ── Thu hộ / Chi hộ ──
   CHI HỘ = mình chi trả hộ khách rồi THU LẠI của khách: khoản phải thu (REVENUE) đánh dấu isPassThrough. THU HỘ = mình thu tiền hộ rồi phải TRẢ LẠI: khoản phải trả (COST) đánh dấu isPassThrough.
   PassLink bù trừ một khoản thu hộ (COST) với một khoản chi hộ (REVENUE) của cùng khách (một phần hoặc toàn bộ): số còn mở = tổng khoản − tổng ghép ACTIVE. Không sinh bút toán; chỉ theo dõi đối ứng từng khoản. */
var PASS_AGING_ = [30, 60, 90];
function passVisible_(user, a, orders, pm, splitsBy) {
    if (a.orderId) {
        var o = orders[a.orderId];
        return !!o && inScope_(user, pm[o.customerPartnerId], o.businessGroupCode);
    }
    if (!inScope_(user, pm[a.partnerId], ''))
        return false;
    return (splitsBy[a.id] || []).every(function (sp) { var so = orders[sp.orderId]; return !!so && inScope_(user, pm[so.customerPartnerId], so.businessGroupCode); });
}
// Tổng đang ghép (ACTIVE) của một khoản; dùng để chặn sửa/hủy làm hỏng bù trừ.
function passLinkedSum_(links, accId) {
    var s = 0;
    links.forEach(function (l) { if (l.status === 'ACTIVE' && l.isDeleted !== 1 && (l.costAccrualId === accId || l.revenueAccrualId === accId))
        s += l.amountMinor; });
    return s;
}
function passBuild_(user, rows, asOf) {
    var accs = rows.Accrual, orders = byId_(rows.Order), pm = byId_(rows.Partner), splitsBy = groupBy_(rows.AccrualSplit, function (x) { return x.accrualId; }), linked = { COST: {}, REVENUE: {} }, items = [];
    rows.PassLink.forEach(function (l) {
        if (l.status !== 'ACTIVE' || l.isDeleted === 1)
            return;
        linked.COST[l.costAccrualId] = (linked.COST[l.costAccrualId] || 0) + l.amountMinor;
        linked.REVENUE[l.revenueAccrualId] = (linked.REVENUE[l.revenueAccrualId] || 0) + l.amountMinor;
    });
    accs.forEach(function (a) {
        if (!a.isPassThrough || a.status === 'CANCELLED' || a.isDeleted === 1 || !passVisible_(user, a, orders, pm, splitsBy))
            return;
        var o = a.orderId ? orders[a.orderId] : null, sp = splitsBy[a.id] || [], lk = linked[a.kind][a.id] || 0, open = a.grossMinor - lk, custId = a.kind === 'REVENUE' ? a.partnerId : (o ? o.customerPartnerId : '');
        items.push({ id: a.id, version: a.version, kind: a.kind, side: a.kind === 'REVENUE' ? 'CHI_HO' : 'THU_HO', partnerId: a.partnerId, partnerName: partnerName_(pm, a.partnerId), customerId: custId, customerName: custId ? partnerName_(pm, custId) : '',
            orderId: a.orderId || '', orderNo: o ? o.orderNo : (sp.length ? 'Chia ' + sp.length + ' đơn' : 'Chung'), poNo: o ? o.poNo : '', poRef: a.poRef || '', accrualDate: a.accrualDate, feeTypeCode: a.feeTypeCode, description: a.description, currency: a.currency,
            grossMinor: a.grossMinor, linkedMinor: lk, openMinor: open, state: lk === 0 ? 'OPEN' : (open > 0 ? 'PARTIAL' : 'MATCHED'), ageDays: Math.max(0, daysBetween_(a.accrualDate, asOf)), docId: a.docId || '' });
    });
    return items;
}
function passBucket_(days) { return days <= PASS_AGING_[0] ? 0 : days <= PASS_AGING_[1] ? 1 : days <= PASS_AGING_[2] ? 2 : 3; }
function passSummary_(items) {
    var out = {};
    items.forEach(function (x) {
        var t = out[x.currency] = out[x.currency] || { chiHo: 0, thuHo: 0, chiHoLinked: 0, thuHoLinked: 0, chiHoOpen: 0, thuHoOpen: 0, count: 0, chiAging: [0, 0, 0, 0], thuAging: [0, 0, 0, 0] };
        var chi = x.side === 'CHI_HO';
        t.count++;
        t[chi ? 'chiHo' : 'thuHo'] += x.grossMinor;
        t[chi ? 'chiHoLinked' : 'thuHoLinked'] += x.linkedMinor;
        t[chi ? 'chiHoOpen' : 'thuHoOpen'] += x.openMinor;
        if (x.openMinor > 0)
            t[chi ? 'chiAging' : 'thuAging'][passBucket_(x.ageDays)] += x.openMinor;
    });
    Object.keys(out).forEach(function (c) { out[c].gap = out[c].thuHo - out[c].chiHo; out[c].openGap = out[c].thuHoOpen - out[c].chiHoOpen; });
    return out;
}
function passRepoRows_() { return { Accrual: repoValid_('Accrual'), Order: repoValid_('Order'), Partner: repoValid_('Partner'), AccrualSplit: repoValid_('AccrualSplit'), PassLink: repoValid_('PassLink') }; }
function passTxRows_(tx) { return { Accrual: tx.rows('Accrual'), Order: tx.rows('Order'), Partner: tx.rows('Partner'), AccrualSplit: tx.rows('AccrualSplit'), PassLink: tx.rows('PassLink') }; }
function passList_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, asOf = isDate_(p.asOf) ? p.asOf : todayVn_(), all = passBuild_(user, passRepoRows_(), asOf), q = String(p.q || '').trim().toLowerCase();
    var items = all.filter(function (x) {
        return !((p.side && x.side !== p.side) || (p.state && x.state !== p.state) || (p.partnerId && x.customerId !== p.partnerId && x.partnerId !== p.partnerId) || (p.currency && x.currency !== p.currency) || (p.orderId && x.orderId !== p.orderId) ||
            (p.from && x.accrualDate < p.from) || (p.to && x.accrualDate > p.to) || (q && (x.description + ' ' + x.partnerName + ' ' + x.customerName + ' ' + x.orderNo + ' ' + x.poNo + ' ' + x.poRef).toLowerCase().indexOf(q) < 0));
    });
    items.sort(function (a, b) { return cmpStr_(b.accrualDate, a.accrualDate); });
    var pg = paginate_(items, p.page, p.pageSize || 50);
    return { items: pg.items, total: pg.total, page: pg.page, pageSize: pg.pageSize, summary: passSummary_(items), asOf: asOf };
}
// Gợi ý khoản đối ứng: cùng tiền tệ, phía ngược lại, còn số chưa ghép; ưu tiên cùng đơn, rồi cùng khách.
function passCandidates_(user, req) {
    requirePerm_(user, 'read');
    var id = (req.payload || {}).accrualId, all = passBuild_(user, passRepoRows_(), todayVn_()), me = all.filter(function (x) { return x.id === id; })[0];
    if (!me)
        throw err_('NOT_FOUND', 'Không tìm thấy khoản thu hộ/chi hộ.');
    var items = all.filter(function (x) { return x.side !== me.side && x.currency === me.currency && x.openMinor > 0; }).map(function (x) {
        var sameOrder = !!me.orderId && me.orderId === x.orderId, sameCust = !!me.customerId && me.customerId === x.customerId;
        return Object.assign({}, x, { rank: sameOrder ? 0 : sameCust ? 1 : 2, basis: sameOrder ? 'Cùng đơn' : sameCust ? 'Cùng khách' : 'Khác đơn/khách' });
    });
    items.sort(function (a, b) { return a.rank - b.rank || cmpStr_(a.accrualDate, b.accrualDate); });
    return { item: me, items: items.slice(0, 50) };
}
function passLinks_(user, req) {
    requirePerm_(user, 'read');
    var id = (req.payload || {}).accrualId, rows = passRepoRows_(), vis = byId_(passBuild_(user, rows, todayVn_()));
    if (!vis[id])
        throw err_('NOT_FOUND', 'Không tìm thấy khoản thu hộ/chi hộ.');
    return { items: rows.PassLink.filter(function (l) { return l.status === 'ACTIVE' && l.isDeleted !== 1 && (l.costAccrualId === id || l.revenueAccrualId === id) && vis[l.costAccrualId] && vis[l.revenueAccrualId]; }).map(function (l) {
        var c = vis[l.costAccrualId], r = vis[l.revenueAccrualId];
        return { id: l.id, version: l.version, costAccrualId: l.costAccrualId, revenueAccrualId: l.revenueAccrualId, amountMinor: l.amountMinor, currency: l.currency, linkDate: l.linkDate, note: l.note,
            costText: c.description + ' · ' + c.partnerName + ' · ' + c.orderNo, revenueText: r.description + ' · ' + r.partnerName + ' · ' + r.orderNo };
    }) };
}
function passLink_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'passthrough.link', payload: p, failAt: req.failAt }, function (tx) {
        var vis = byId_(passBuild_(user, passTxRows_(tx), todayVn_())), c = vis[p.costAccrualId], r = vis[p.revenueAccrualId];
        if (!c || c.kind !== 'COST' || !r || r.kind !== 'REVENUE')
            throw err_('NOT_FOUND', 'Không tìm thấy khoản chi hộ hoặc thu hộ để ghép.');
        if (c.currency !== r.currency)
            throw err_('VALIDATION_FAILED', 'Hai khoản khác tiền tệ, không ghép được.', [{ path: 'currency', code: 'CURRENCY_MISMATCH', message: 'Chi hộ ' + c.currency + ', thu hộ ' + r.currency + '.' }]);
        var max = Math.min(c.openMinor, r.openMinor), amt = p.amountMinor === undefined || p.amountMinor === null || p.amountMinor === '' ? max : Number(p.amountMinor);
        if (!(max > 0))
            throw err_('STATE_TRANSITION_INVALID', 'Một trong hai khoản đã ghép hết.');
        if (!isFinite(amt) || Math.floor(amt) !== amt || amt <= 0)
            throw err_('VALIDATION_FAILED', 'Số tiền ghép phải là số nguyên dương.', [{ path: 'amountMinor', code: 'INVALID', message: 'Số tiền ghép không hợp lệ.' }]);
        if (amt > max)
            throw err_('VALIDATION_FAILED', 'Số ghép vượt phần còn mở (tối đa ' + max + ').', [{ path: 'amountMinor', code: 'EXCEEDS_OPEN', message: 'Tối đa ' + max + '.' }]);
        var mismatch = (c.orderId && r.orderId && c.orderId !== r.orderId) || (c.customerId && r.customerId && c.customerId !== r.customerId);
        if (mismatch && !p.confirmMismatch)
            throw err_('CONFIRM_REQUIRED', 'Hai khoản thuộc đơn/khách hàng khác nhau. Xác nhận nếu vẫn muốn ghép.', [{ path: 'confirmMismatch', code: 'MISMATCH', message: 'Khác đơn/khách hàng.' }]);
        // R35 (chị chốt 26/10, mục 5B): khoản hộ ngoại tệ khác ngày → chênh lệch tỷ giá phát sinh khi bù trừ được ghi nhận vào lãi/lỗ tỷ giá ĐÃ THỰC HIỆN (chiều 'PASS' trong bút toán chênh lệch tỷ giá).
        // Chênh lệch = giá trị VND của phần ghép theo tỷ giá ngày khoản chi hộ (phải thu lại) − theo tỷ giá ngày khoản thu hộ (phải trả lại). Thiếu tỷ giá một trong hai ngày: ghi 0 và cảnh báo.
        var fx = { costRateE4: 0, revRateE4: 0, fxDiffBaseMinor: 0 }, fxWarn = '';
        if (c.currency !== BASE_CUR_) {
            var rates = tx.rows('FxRate'), ca = tx.find('Accrual', c.id), ra = tx.find('Accrual', r.id), dec = (currencyMap_()[c.currency] || { decimals: 0 }).decimals;
            fx.costRateE4 = (fxFind_(c.currency, ca.accrualDate, rates) || {}).rateE4 || 0;
            fx.revRateE4 = (fxFind_(c.currency, ra.accrualDate, rates) || {}).rateE4 || 0;
            if (fx.costRateE4 > 0 && fx.revRateE4 > 0)
                fx.fxDiffBaseMinor = fxToBase_(amt, dec, fx.revRateE4) - fxToBase_(amt, dec, fx.costRateE4);
            else
                fxWarn = 'Thiếu tỷ giá ' + c.currency + ' tại ngày của một trong hai khoản: chênh lệch tỷ giá ghi 0, hãy nhập tỷ giá rồi gỡ ghép và ghép lại.';
        }
        var row = tx.insert('PassLink', { costAccrualId: c.id, revenueAccrualId: r.id, currency: c.currency, amountMinor: amt, status: 'ACTIVE', linkDate: todayVn_(), note: maxStr_(p.note, 300), costRateE4: fx.costRateE4, revRateE4: fx.revRateE4, fxDiffBaseMinor: fx.fxDiffBaseMinor });
        return { result: { id: row.id, amountMinor: amt, mismatch: !!mismatch, fxDiffBaseMinor: fx.fxDiffBaseMinor, warning: fxWarn }, audit: [{ entityType: 'PassLink', entityId: row.id, action: 'passthrough.link', diff: { cost: c.id, revenue: r.id, amountMinor: amt, mismatch: !!mismatch } }] };
    });
}
function passUnlink_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'passthrough.unlink', payload: p, failAt: req.failAt }, function (tx) {
        var l = tx.find('PassLink', p.id), vis = l ? byId_(passBuild_(user, passTxRows_(tx), todayVn_())) : {};
        if (!l || l.isDeleted === 1 || !vis[l.costAccrualId] || !vis[l.revenueAccrualId])
            throw err_('NOT_FOUND', 'Không tìm thấy bản ghép.');
        if (l.status !== 'ACTIVE')
            throw err_('STATE_TRANSITION_INVALID', 'Bản ghép đã được gỡ trước đó.');
        tx.update('PassLink', l.id, { status: 'CANCELLED' }, p.ifVersion);
        return { result: { id: l.id, status: 'CANCELLED' }, audit: [{ entityType: 'PassLink', entityId: l.id, action: 'passthrough.unlink', diff: { cost: l.costAccrualId, revenue: l.revenueAccrualId, amountMinor: l.amountMinor } }] };
    });
}
// Đối chiếu theo khách hàng hoặc theo đơn: mỗi (nhóm, tiền tệ) một dòng, kèm tuổi khoản còn mở.
function passReport_(user, req) {
    requirePerm_(user, 'report.read');
    var p = req.payload || {}, asOf = isDate_(p.asOf) ? p.asOf : todayVn_(), by = p.groupBy === 'ORDER' ? 'ORDER' : 'CUSTOMER', out = {};
    passBuild_(user, passRepoRows_(), asOf).forEach(function (x) {
        if ((p.currency && x.currency !== p.currency) || (p.from && x.accrualDate < p.from) || (p.to && x.accrualDate > p.to))
            return;
        var key = (by === 'ORDER' ? (x.orderId || 'none') : (x.customerId || 'none')) + '|' + x.currency;
        var r = out[key] = out[key] || { key: key, name: by === 'ORDER' ? (x.orderId ? x.orderNo + (x.poNo ? ' · ' + x.poNo : '') : x.orderNo) : (x.customerName || 'Chưa xác định khách'), customerName: x.customerName, currency: x.currency,
            chiHo: 0, thuHo: 0, chiHoOpen: 0, thuHoOpen: 0, count: 0, oldestOpen: '', maxAge: 0 };
        var chi = x.side === 'CHI_HO';
        r.count++;
        r[chi ? 'chiHo' : 'thuHo'] += x.grossMinor;
        r[chi ? 'chiHoOpen' : 'thuHoOpen'] += x.openMinor;
        if (x.openMinor > 0 && (!r.oldestOpen || x.accrualDate < r.oldestOpen)) {
            r.oldestOpen = x.accrualDate;
            r.maxAge = x.ageDays;
        }
    });
    var rows = Object.keys(out).map(function (k) { var r = out[k]; r.gap = r.thuHo - r.chiHo; r.openGap = r.thuHoOpen - r.chiHoOpen; return r; });
    if (p.onlyOpen)
        rows = rows.filter(function (r) { return r.chiHoOpen !== 0 || r.thuHoOpen !== 0; });
    rows.sort(function (a, b) { return cmpStr_(a.name, b.name) || cmpStr_(a.currency, b.currency); });
    return { groupBy: by, asOf: asOf, items: rows, summary: passSummary_(passBuild_(user, passRepoRows_(), asOf).filter(function (x) { return !((p.currency && x.currency !== p.currency) || (p.from && x.accrualDate < p.from) || (p.to && x.accrualDate > p.to)); })) };
}
function accrualInvoice_(user, req) {
    requirePerm_(user, 'order.write');
    requirePerm_(user, 'doc.write');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'accrual.invoice', payload: p, failAt: req.failAt }, function (tx) {
        var ids = p.accrualIds || [];
        if (!ids.length)
            throw err_('VALIDATION_FAILED', 'Chọn ít nhất một khoản phát sinh.', [{ path: 'accrualIds', code: 'REQUIRED', message: 'Chọn ít nhất một khoản.' }]);
        var seenIds = {};
        ids.forEach(function (id) {
            if (seenIds[id])
                throw err_('VALIDATION_FAILED', 'Có khoản phát sinh bị chọn hai lần.', [{ path: 'accrualIds', code: 'DUPLICATE', message: 'Mỗi khoản chỉ được chọn một lần.' }]);
            seenIds[id] = 1;
        });
        var accs = ids.map(function (id) { return tx.find('Accrual', id); });
        if (accs.some(function (a) { return !a; }))
            throw err_('NOT_FOUND', 'Có khoản phát sinh không tồn tại.');
        var orders = byId_(tx.rows('Order')), first = accs[0], kind = first.kind, pmx = byId_(tx.rows('Partner')), splitsBy = groupBy_(tx.rows('AccrualSplit'), function (x) { return x.accrualId; }), groups = {}, hasNoGroup = false;
        accs.forEach(function (a) {
            var o = a.orderId ? orders[a.orderId] : null, sps = splitsBy[a.id] || [];
            if (o) {
                assertVisible_(user, pmx[o.customerPartnerId], o.businessGroupCode, 'khoản phát sinh', 'Có khoản phát sinh không tồn tại.');
                groups[o.businessGroupCode] = 1;
                if (o.status !== 'OPEN')
                    throw err_('STATE_TRANSITION_INVALID', 'Đơn ' + o.orderNo + ' đã đóng/hủy.');
            }
            else {
                assertVisible_(user, pmx[a.partnerId], '', 'khoản phát sinh', 'Có khoản phát sinh không tồn tại.');
                if (!sps.length)
                    hasNoGroup = true;
                sps.forEach(function (sp) { var so = orders[sp.orderId]; if (!so)
                    return; assertVisible_(user, pmx[so.customerPartnerId], so.businessGroupCode, 'khoản phát sinh', 'Có khoản phát sinh không tồn tại.'); groups[so.businessGroupCode] = 1; if (so.status !== 'OPEN')
                    throw err_('STATE_TRANSITION_INVALID', 'Đơn ' + so.orderNo + ' (được chia chi phí) đã đóng/hủy.'); });
            }
            if (a.status !== 'OPEN')
                throw err_('STATE_TRANSITION_INVALID', 'Khoản "' + a.description.slice(0, 40) + '" đã lập hóa đơn hoặc bị hủy.');
            if (a.kind !== kind)
                throw err_('MIXED_KIND', 'Không gộp doanh thu và chi phí trong một hóa đơn.');
            if (a.partnerId !== first.partnerId)
                throw err_('PARTNER_MISMATCH', 'Các khoản thuộc đối tác khác nhau: mỗi hóa đơn chỉ một đối tác.');
            if (a.currency !== first.currency)
                throw err_('CURRENCY_MISMATCH', 'Các khoản khác tiền tệ: mỗi hóa đơn chỉ một tiền tệ.');
        });
        var group = p.businessGroupCode || Object.keys(groups)[0];
        if ((Object.keys(groups).length !== 1 || hasNoGroup) && !p.businessGroupCode)
            throw err_('VALIDATION_FAILED', hasNoGroup ? 'Có chi phí chung (không thuộc đơn): chọn nhóm nghiệp vụ cho hóa đơn.' : 'Các đơn thuộc nhiều nhóm nghiệp vụ: chọn nhóm cho hóa đơn.', [{ path: 'businessGroupCode', code: 'REQUIRED', message: 'Chọn nhóm nghiệp vụ.' }]);
        if (kind === 'COST' && (!String(p.invoiceNo || '').trim() || !isDate_(p.invoiceDate)))
            throw err_('VALIDATION_FAILED', 'Hóa đơn mua phải có số hóa đơn và ngày hóa đơn của nhà cung cấp.', [{ path: 'invoiceNo', code: 'REQUIRED', message: 'Nhập số hóa đơn của NCC.' }, { path: 'invoiceDate', code: 'REQUIRED', message: 'Nhập ngày hóa đơn.' }].filter(function (f) { return f.path === 'invoiceNo' ? !String(p.invoiceNo || '').trim() : !isDate_(p.invoiceDate); }));
        var partner = tx.find('Partner', first.partnerId);
        var raw = accs.map(function (a) { return { feeTypeCode: a.feeTypeCode, description: a.description, netMinor: a.netMinor, vatMode: a.vatMode, vatRateBp: a.vatRateBp, containerQty: a.containerQty, unitPrice: a.unitPrice, isPassThrough: a.isPassThrough, serviceCode: a.orderId && orders[a.orderId] ? accrualServiceCode_(a, orders[a.orderId]) : '', declNo: '', lotNote: a.poRef ? 'PO ' + a.poRef : '' }; });
        var input = { direction: kind === 'REVENUE' ? 'AR' : 'AP', docType: 'INVOICE', partnerId: first.partnerId, currency: first.currency, businessGroupCode: group, docDate: p.docDate || p.invoiceDate || '', invoiceNo: p.invoiceNo, invoiceSerial: p.invoiceSerial, invoiceDate: p.invoiceDate,
            statementPeriod: p.statementPeriod, dueDate: p.dueDate, dueDateSource: p.dueDateSource, statusNote: p.statusNote, batchLabel: p.batchLabel, lines: raw };
        var v = validateDocInput_(input, docEnv_(tx, first.partnerId));
        if (v.errors.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu hóa đơn chưa hợp lệ', v.errors);
        resolveLineRefs_(tx, raw, v.lines, group, partner.id, input.direction);
        var autoDue = applyPartnerTerm_(v.doc, partner);
        var dups = findDuplicateDocs_(v.doc, tx.rows('DebtDoc'), null);
        var doc = tx.insert('DebtDoc', Object.assign({ docNo: '', isOpening: 0, adjustsDocId: '', reversesDocId: '' }, v.doc, { status: 'DRAFT', source: 'ORDER', assuranceLevel: 'VERIFIED', sourceKey: accs.map(function (a) { return a.id; }).join(','),
            warningsJson: dups.length ? JSON.stringify({ duplicates: dups }) : '', searchText: normText_(partner.shortName + ' ' + v.doc.invoiceNo) }));
        v.lines.forEach(function (l, i) {
            var line = tx.insert('DebtLine', Object.assign({}, l, { docId: doc.id, accrualId: accs[i].id }));
            tx.update('Accrual', accs[i].id, { status: 'INVOICING', docId: doc.id, debtLineId: line.id });
        });
        return { result: { docId: doc.id, direction: input.direction, totalGrossMinor: v.doc.totalGrossMinor, dueDate: v.doc.dueDate, dueAutoApplied: autoDue, warnings: dups.map(function (d) { return { code: 'W-DUP', message: 'Nghi trùng với ' + (d.docNo || d.id) }; }) },
            audit: [{ entityType: 'DebtDoc', entityId: doc.id, action: 'accrual.invoice', diff: { accruals: ids, total: v.doc.totalGrossMinor } }] };
    });
}
function releaseAccrualsOfDoc_(tx, docId) {
    tx.rows('Accrual').forEach(function (a) { if (a.docId === docId && (a.status === 'INVOICING' || a.status === 'INVOICED'))
        tx.update('Accrual', a.id, { status: 'OPEN', docId: '', debtLineId: '' }); });
}
function markAccrualsInvoiced_(tx, docId) {
    tx.rows('Accrual').forEach(function (a) { if (a.docId === docId && a.status === 'INVOICING')
        tx.update('Accrual', a.id, { status: 'INVOICED' }); });
}
function bulkVat_(v) {
    var s = normText_(v).replace(/ /g, '');
    if (!s || s === 'chua' || s === 'chuaxacnhan')
        return { mode: 'UNCONFIRMED', bp: null };
    if (s === 'kct' || s === 'khongchiuthue')
        return { mode: 'NONE', bp: null };
    var n = Number(String(v).replace('%', '').replace(',', '.').trim());
    if (isFinite(n) && n >= 0 && n <= 30)
        return { mode: 'EXCLUSIVE', bp: Math.round(n * 100) };
    return null;
}
function bulkFindFee_(feeTypes, v) { var n = normText_(v); if (!n)
    return null; for (var i = 0; i < feeTypes.length; i++)
    if (normText_(feeTypes[i].code) === n || normText_(feeTypes[i].name) === n)
        return feeTypes[i].code; return null; }
function bulkBuild_(env, kind, rows) {
    var partners = env.rows('Partner').filter(function (p) { return p.status === 'ACTIVE'; }), feeTypes = catalogList_('FEE_TYPE'), cur = currencyMap_(), groups = catalogList_('BUSINESS_GROUP').map(function (c) { return c.code; }), ls = ledgerStart_();
    var closedMonths = {}, orders = env.rows('Order').filter(function (o) { return o.status === 'OPEN'; }), newOrders = {}, createdIds = {}, rmap = serviceMap_(), results = [], created = { orders: 0, accruals: 0 }, creditExtra = {};
    env.rows('Period').forEach(function (pe) { if (pe.status === 'CLOSED')
        closedMonths[pe.id] = 1; });
    function pfind(name, role) { var n = normText_(name), hits = partners.filter(function (p) { return (role === 'C' ? p.isCustomer : p.isSupplier) && (normText_(p.shortName) === n || normText_(p.legalName) === n); }); return hits.length === 1 ? hits[0] : (hits.length > 1 ? 'AMBIGUOUS' : null); }
    rows.forEach(function (r, i) {
        var issues = [], svcCode = '', res = { rowNo: i + 1, issues: issues, ok: false, summary: '' };
        function E(f, c, m) { issues.push({ field: f, code: c, message: m, severity: 'ERROR' }); }
        var vat = bulkVat_(r.vat), fee = bulkFindFee_(feeTypes, r.feeType), partnerName = kind === 'REVENUE' ? r.customer : r.supplier, partner = pfind(partnerName, kind === 'REVENUE' ? 'C' : 'S');
        if (partner === null)
            E(kind === 'REVENUE' ? 'customer' : 'supplier', 'PARTNER_UNKNOWN', (kind === 'REVENUE' ? 'Khách hàng' : 'Nhà cung cấp') + ' "' + partnerName + '" chưa có (hoặc sai vai trò) trong danh sách đối tác.');
        else if (partner === 'AMBIGUOUS')
            E(kind === 'REVENUE' ? 'customer' : 'supplier', 'PARTNER_AMBIGUOUS', 'Tên "' + partnerName + '" khớp nhiều đối tác.');
        if (!vat)
            E('vat', 'TAX_INVALID', 'Thuế: ghi KCT, số % (vd 8), hoặc để trống/"chưa" = chưa xác nhận.');
        if (!fee)
            E('feeType', 'FEE_UNKNOWN', 'Loại phí "' + r.feeType + '" không có trong danh mục (dùng mã hoặc tên).');
        var date = r.date;
        if (!isDate_(date))
            E('date', 'DATE_INVALID', 'Ngày không hợp lệ (dd/MM/yyyy).');
        else if (date < ls)
            E('date', 'DATE_BEFORE_LEDGER_START', 'Ngày trước ngày đầu sổ.');
        else if (closedMonths[date.slice(0, 7)])
            E('date', 'PERIOD_CLOSED', 'Kỳ ' + date.slice(0, 7) + ' đã khóa: không nhập vào kỳ đã khóa (dùng ngày thuộc kỳ đang mở hoặc xin mở lại kỳ).');
        var cq = parseDecText_(r.containerQty, 3), up = parseDecText_(r.unitPrice, 4);
        if (Number.isNaN(cq)) {
            E('containerQty', 'QTY_INVALID', 'Số lượng không hợp lệ (tối đa 3 số lẻ).');
            cq = null;
        }
        if (Number.isNaN(up)) {
            E('unitPrice', 'UNIT_PRICE_INVALID', 'Đơn giá không hợp lệ (tối đa 4 số lẻ).');
            up = null;
        }
        function doCalc(currency) {
            if (!vat || !fee || !currency || !cur[currency])
                return;
            var dec = cur[currency].decimals, net = r.netText !== undefined ? parseAmountMinor_(r.netText, dec === 0 ? 0 : 2) : { minor: r.netMinor };
            if (net.empty && cq !== null && up !== null) {
                var mq = mulQtyPrice_(cq, up, dec);
                if (mq !== null)
                    net = { minor: mq };
            }
            if (net.error || net.empty) {
                E('netMinor', net.error || 'AMOUNT_REQUIRED', 'Số tiền không hợp lệ' + (dec === 0 ? ' (VND: số nguyên đồng).' : ' (tối đa 2 số lẻ).'));
                return;
            }
            var calc = calcLine_({ feeTypeCode: fee, description: r.description, netMinor: net.minor, vatMode: vat.mode, vatRateBp: vat.bp, containerQty: cq, unitPrice: up, isPassThrough: r.isPassThrough }, 0, false, currency);
            calc.errors.forEach(function (e) { E(e.path.replace(/^lines\[0\]\./, ''), e.code, e.message); });
            res.line = calc.line;
        }
        var order = null, currency = '';
        if (kind === 'REVENUE') {
            currency = String(r.currency || '').trim().toUpperCase();
            if (!cur[currency])
                E('currency', 'CURRENCY_UNKNOWN', 'Tiền tệ không hợp lệ.');
            var grp = String(r.group || '').trim().toUpperCase();
            if (groups.indexOf(grp) < 0)
                E('group', 'GROUP_UNKNOWN', 'Nhóm nghiệp vụ "' + r.group + '" không có trong danh mục.');
            doCalc(currency);
            if (partner && partner !== 'AMBIGUOUS' && !issues.length) {
                if (!inScope_(env.user, partner, grp))
                    E('customer', 'OUT_OF_SCOPE', 'Ngoài phạm vi dữ liệu của bạn.');
                else {
                    var poNo = String(r.poNo || '').trim(), rc = String(r.serviceCode || '').trim().toUpperCase(), key = partner.id + '|' + normText_(poNo);
                    if (!rc)
                        E('serviceCode', 'SERVICE_CODE_REQUIRED', 'Chọn mã dịch vụ của khoản (PO có thể có nhiều mã).');
                    else if (!rmap[rc] || !rmap[rc].active)
                        E('serviceCode', 'SERVICE_CODE_UNKNOWN', 'Mã dịch vụ "' + rc + '" không có trong danh mục (hoặc đã ngừng dùng).');
                    if (!issues.length && !hsdvAbbr_(partner))
                        E('customer', 'HSDV_ABBR', 'Khách hàng chưa có tên viết tắt hợp lệ để lập số HSDV.');
                    if (!issues.length) {
                        order = newOrders[key] || null;
                        if (!order && poNo)
                            order = orders.filter(function (o) { return o.customerPartnerId === partner.id && normText_(o.poNo) === normText_(poNo); })[0] || null;
                        if (order && !newOrders[key]) {
                            order = Object.assign({}, order);
                            newOrders[key] = order;
                        }
                        if (!order) {
                            var first = [{ code: rc, hsdvNo: hsdvNumber_(env, partner, rc, date, orders.concat(Object.keys(newOrders).map(function (k) { return newOrders[k]; }))) }];
                            order = env.insert('Order', { orderNo: 'DH-' + date.slice(0, 4) + '-' + ('000000' + env.nextSeq('seq.DH.' + date.slice(0, 4))).slice(-6), customerPartnerId: partner.id, poNo: poNo, orderDate: date, businessGroupCode: grp, currency: currency, servicesJson: JSON.stringify(first), serviceCode: first[0].code, hsdvNo: first[0].hsdvNo, status: 'OPEN', note: 'Nhập hàng loạt', searchText: normText_(partner.shortName + ' ' + poNo + ' ' + rc) });
                            newOrders[key] = order;
                            createdIds[order.id] = 1;
                            created.orders++;
                        }
                        else if (!orderServices_(order).some(function (x) { return x.code === rc; })) {
                            var sv = orderServices_(order).concat([{ code: rc, hsdvNo: hsdvNumber_(env, partner, rc, order.orderDate || date, orders.concat(Object.keys(newOrders).map(function (k) { return newOrders[k]; }))) }]);
                            order.servicesJson = JSON.stringify(sv);
                            if (!order.serviceCode) {
                                order.serviceCode = sv[0].code;
                                order.hsdvNo = sv[0].hsdvNo;
                            }
                            if (!createdIds[order.id])
                                env.update('Order', order.id, { servicesJson: order.servicesJson, serviceCode: order.serviceCode, hsdvNo: order.hsdvNo });
                            created.services = (created.services || 0) + 1;
                        }
                        svcCode = rc;
                    }
                }
            }
        }
        else {
            var ref = String(r.orderRef || '').trim(), nref = normText_(ref), mode = 'ORDER', splitsIn = null, equalAll = false, pmById = byId_(env.rows('Partner'));
            var allOrders = orders.concat(Object.keys(newOrders).map(function (k) { return newOrders[k]; }));
            function findOrder(token) {
                // Chỉ xét đơn TRONG phạm vi: đơn ngoài phạm vi trả đúng thông điệp "không tìm thấy" (không lộ sự tồn tại, trạng thái hay số lượng đơn khớp).
                var vis = function (o) { return inScope_(env.user, pmById[o.customerPartnerId], o.businessGroupCode); };
                var n = normText_(token), c = allOrders.filter(function (o) { return normText_(o.orderNo) === n && vis(o); });
                if (!c.length)
                    c = orders.filter(function (o) { return o.poNo && normText_(o.poNo) === n && vis(o); });
                if (c.length === 0)
                    return { err: 'Không tìm thấy đơn đang mở theo "' + token + '".' };
                if (c.length > 1)
                    return { err: '"' + token + '" khớp ' + c.length + ' đơn; dùng số đơn (DH-…).' };
                return { o: c[0] };
            }
            if (!ref || nref === 'chung' || nref === 'chi phi chung')
                mode = 'GENERAL';
            else if (ref.indexOf(';') >= 0)
                mode = 'SHARED';
            if (mode === 'ORDER') {
                var fo = findOrder(ref);
                if (fo.err)
                    E('orderRef', fo.err.indexOf('ngoài phạm vi') >= 0 ? 'OUT_OF_SCOPE' : (fo.err.indexOf('khớp') >= 0 ? 'ORDER_AMBIGUOUS' : 'ORDER_NOT_FOUND'), fo.err);
                else
                    order = fo.o;
                if (order) {
                    var pkb = pickAccrualService_(order, r.serviceCode);
                    if (pkb.err)
                        E('serviceCode', 'SERVICE_CODE', pkb.err);
                    else
                        svcCode = pkb.code;
                    currency = String(r.currency || order.currency).trim().toUpperCase();
                    if (!cur[currency])
                        E('currency', 'CURRENCY_UNKNOWN', 'Tiền tệ không hợp lệ.');
                    else
                        doCalc(currency);
                }
            }
            else {
                currency = String(r.currency || '').trim().toUpperCase();
                if (!cur[currency])
                    E('currency', 'CURRENCY_UNKNOWN', 'Chi phí chung hoặc chia nhiều đơn phải ghi tiền tệ (VND/USD).');
                if (partner && partner !== 'AMBIGUOUS' && !inScope_(env.user, partner, ''))
                    E('supplier', 'OUT_OF_SCOPE', 'Nhà cung cấp ngoài phạm vi dữ liệu của bạn.');
                if (mode === 'SHARED') {
                    var toks = ref.split(';').map(function (t) { return t.trim(); }).filter(Boolean);
                    splitsIn = [];
                    var anyVal = false, noVal = false;
                    toks.forEach(function (t, ti) {
                        var k = t.lastIndexOf(':'), name = k >= 0 ? t.slice(0, k).trim() : t, val = k >= 0 ? t.slice(k + 1).trim() : '', f = findOrder(name);
                        if (f.err) {
                            E('orderRef', 'ORDER_NOT_FOUND', 'Phần ' + (ti + 1) + ': ' + f.err);
                            return;
                        }
                        if (!val) {
                            noVal = true;
                            splitsIn.push({ orderId: f.o.id });
                            return;
                        }
                        anyVal = true;
                        if (/%$/.test(val))
                            splitsIn.push({ orderId: f.o.id, pct: Number(val.replace('%', '').replace(',', '.')) });
                        else {
                            var am = parseAmountMinor_(val, cur[currency] && cur[currency].decimals === 0 ? 0 : 2);
                            if (am.error || am.empty)
                                E('orderRef', 'SPLIT_AMOUNT', 'Phần ' + (ti + 1) + ': số tiền "' + val + '" không hợp lệ.');
                            else
                                splitsIn.push({ orderId: f.o.id, netMinor: am.minor });
                        }
                    });
                    if (anyVal && noVal)
                        E('orderRef', 'SPLIT_MIXED', 'Mỗi phần đều ghi số tiền/phần trăm, hoặc không phần nào ghi (chia đều).');
                    equalAll = !anyVal;
                }
                if (cur[currency])
                    doCalc(currency);
            }
            if (mode === 'SHARED' && res.line && !issues.length) {
                var byIdOrders = byId_(allOrders), shareErr = [];
                res.shares = splitCostShares_({ splits: splitsIn, equal: equalAll }, res.line, byIdOrders, pmById, env.user, function (f, c, m) { E('orderRef', c, m); });
            }
        }
        if (!issues.length && res.line && (order || (kind === 'COST' && mode !== 'ORDER'))) {
            var a = env.insert('Accrual', { orderId: order ? order.id : '', serviceCode: order ? svcCode : '', kind: kind, partnerId: partner.id, poRef: kind === 'COST' ? maxStr_(r.poRef, 100).trim() : '', accrualDate: date, feeTypeCode: res.line.feeTypeCode, description: res.line.description, containerQty: res.line.containerQty, unitPrice: res.line.unitPrice,
                netMinor: res.line.netMinor, vatMode: res.line.vatMode, vatRateBp: res.line.vatRateBp, vatMinor: res.line.vatMinor, grossMinor: res.line.grossMinor, isPassThrough: res.line.isPassThrough, currency: currency, status: 'OPEN', docId: '', debtLineId: '', note: 'Nhập hàng loạt' });
            if (res.shares)
                res.shares.forEach(function (x) { env.insert('AccrualSplit', { accrualId: a.id, orderId: x.orderId, shareNetMinor: x.net, shareVatMinor: x.vat, shareGrossMinor: x.net + x.vat, basis: x.basis, note: '' }); });
            created.accruals++;
            res.ok = true;
            res.orderNo = order ? order.orderNo : (res.shares ? 'chia ' + res.shares.length + ' đơn' : 'chi phí chung');
            res.summary = (kind === 'REVENUE' ? 'Doanh thu ' : 'Chi phí ') + fmtPlain_(res.line.grossMinor, cur[currency].decimals) + ' ' + currency + ' → ' + (order ? (String(order.id).indexOf('preview_') === 0 ? 'đơn mới' + (order.poNo ? ' (PO ' + order.poNo + ')' : '') : order.orderNo) : (res.shares ? 'chia cho ' + res.shares.length + ' đơn' : 'chi phí chung (không thuộc đơn)'));
            if (kind === 'REVENUE') {
                var ck = partner.id + '|' + currency;
                creditExtra[ck] = (creditExtra[ck] || 0) + res.line.grossMinor;
            }
        }
        results.push(res);
    });
    return { results: results, created: created, creditExtra: creditExtra };
}
function fmtPlain_(minor, dec) { return formatMinorVn_(minor, dec); }
function orderBulkPreview_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload || {};
    if (['REVENUE', 'COST'].indexOf(p.kind) < 0)
        throw err_('VALIDATION_FAILED', 'Chọn loại nhập (PO/doanh thu hoặc chi phí).');
    if (!Array.isArray(p.rows) || !p.rows.length)
        throw err_('VALIDATION_FAILED', 'Chưa có dòng nào.');
    if (p.rows.length > 1000)
        throw err_('VALIDATION_FAILED', 'Tối đa 1.000 dòng một lần.');
    var seq = 0, env = { preview: true, update: function () { }, user: user, rows: function (t) { return repoValid_(t); }, insert: function (t, o) { return Object.assign({ id: 'preview_' + (++seq) }, o); }, nextSeq: function () { return 0; } };
    var out = bulkBuild_(env, p.kind, p.rows), bad = out.results.filter(function (r) { return !r.ok; }).length;
    return { rows: out.results.map(function (r) { return { rowNo: r.rowNo, ok: r.ok, issues: r.issues, summary: r.summary }; }), errors: bad, created: out.created, canCommit: bad === 0 };
}
function orderBulkCommit_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload || {};
    if (['REVENUE', 'COST'].indexOf(p.kind) < 0)
        throw err_('VALIDATION_FAILED', 'Chọn loại nhập.');
    if (!Array.isArray(p.rows) || !p.rows.length || p.rows.length > 1000)
        throw err_('VALIDATION_FAILED', 'Số dòng không hợp lệ (1–1.000).');
    return runTx_(user, { requestId: req.requestId, action: 'order.bulkCommit', payload: p, failAt: req.failAt }, function (tx) {
        var out = bulkBuild_({ user: user, rows: tx.rows, insert: tx.insert, update: tx.update, nextSeq: tx.nextSeq }, p.kind, p.rows), bad = out.results.filter(function (r) { return !r.ok; });
        if (bad.length)
            throw err_('VALIDATION_FAILED', 'Còn ' + bad.length + ' dòng lỗi, chưa ghi dòng nào.', bad.reduce(function (a, r) { return a.concat(r.issues.map(function (i) { return { path: 'row' + r.rowNo + '.' + i.field, code: i.code, message: 'Dòng ' + r.rowNo + ': ' + i.message }; })); }, []));
        var warnings = [];
        Object.keys(out.creditExtra).forEach(function (k) { var x = k.split('|'); enforceCredit_(tx, user, x[0], x[1], todayVn_(), out.creditExtra[k], p).forEach(function (w) { warnings.push(w); }); });
        return { result: { created: out.created, warnings: warnings }, audit: [{ entityType: 'Order', entityId: 'bulk', action: 'order.bulk.' + p.kind.toLowerCase(), diff: { created: out.created } }] };
    });
}
// ---- Nhập hàng loạt HÓA ĐƠN bán (phải thu) / hóa đơn mua (phải trả): mỗi hóa đơn = một chứng từ NHÁP nhiều dòng phí; dùng đúng luật kiểm tra của doc.save.
// Có cột "Số đơn / PO khách": dòng phí được GẮN vào đơn (ghép với khoản phát sinh còn mở cùng số tiền, nếu không có thì tạo khoản phát sinh mới) → hóa đơn hiện ở cột Đơn hàng/PO. ----
var INV_BULK_MAX_ = 500;
function invBulkBuild_(env, user, dir, rows) {
    var partners = env.rows('Partner').filter(function (x) { return x.status === 'ACTIVE' && (dir === 'AR' ? x.isCustomer : x.isSupplier) && inScope_(user, x, ''); }), allPartners = byId_(env.rows('Partner')), feeTypes = catalogList_('FEE_TYPE'), cur = currencyMap_();
    var groupsCat = catalogList_('BUSINESS_GROUP').map(function (c) { return c.code; }), svc = catalogList_('SERVICE_CODE').map(function (c) { return c.code; }), ls = ledgerStart_();
    var orders = env.rows('Order').filter(function (o) { return o.status === 'OPEN' && inScope_(user, allPartners[o.customerPartnerId], o.businessGroupCode); }), accruals = env.rows('Accrual').filter(function (a) { return a.status === 'OPEN' && a.kind === (dir === 'AR' ? 'REVENUE' : 'COST'); }), claimed = {}, closed = {};
    env.rows('Period').forEach(function (pe) { if (pe.status === 'CLOSED')
        closed[pe.id] = 1; });
    var kind = dir === 'AR' ? 'REVENUE' : 'COST', results = rows.map(function (r, i) { return { rowNo: i + 1, ok: true, issues: [], summary: '' }; }), groups = {}, order = [];
    function E(i, f, c, m) { results[i].ok = false; results[i].issues.push({ field: f, code: c, message: m, severity: 'ERROR' }); }
    function pfind(name) {
        var n = normText_(name), hits = partners.filter(function (x) { return normText_(x.shortName) === n || normText_(x.legalName) === n || (x.taxCode && normText_(x.taxCode) === n); });
        return hits.length === 1 ? hits[0] : (hits.length > 1 ? 'AMBIGUOUS' : null);
    }
    function ofind(txt, partner) {
        var n = normText_(txt), hits = orders.filter(function (o) { return normText_(o.orderNo) === n; });
        if (!hits.length)
            hits = orders.filter(function (o) { return o.poNo && normText_(o.poNo) === n && (dir !== 'AR' || o.customerPartnerId === partner.id); });
        return hits.length === 1 ? hits[0] : (hits.length > 1 ? 'AMBIGUOUS' : null);
    }
    rows.forEach(function (r, i) {
        var partner = pfind(r.partner), no = String(r.invoiceNo || '').trim(), currency = String(r.currency || 'VND').trim().toUpperCase() || 'VND';
        if (partner === null)
            E(i, 'partner', 'PARTNER_UNKNOWN', (dir === 'AR' ? 'Khách hàng' : 'Nhà cung cấp') + ' "' + r.partner + '" chưa có, đã ngừng hoặc sai vai trò.');
        else if (partner === 'AMBIGUOUS')
            E(i, 'partner', 'PARTNER_AMBIGUOUS', 'Tên "' + r.partner + '" khớp nhiều đối tác (dùng tên pháp lý hoặc mã số thuế).');
        if (!no)
            E(i, 'invoiceNo', 'INVOICE_NO_REQUIRED', 'Thiếu số hóa đơn (dùng để gom các dòng phí cùng một hóa đơn).');
        if (partner && typeof partner === 'object' && no) {
            var key = [partner.id, normText_(no), normText_(r.serial), currency].join('|');
            if (!groups[key]) {
                groups[key] = { partner: partner, no: no, serial: String(r.serial || '').trim(), currency: currency, rows: [] };
                order.push(key);
            }
            groups[key].rows.push(i);
        }
    });
    var docs = [], created = { docs: 0, lines: 0, linked: 0, newAccruals: 0, matchedAccruals: 0 }, total = {}, existing = env.rows('DebtDoc'), creditExtra = {};
    var HEAD = ['invoiceDate', 'docDate', 'due', 'expectedPay', 'period'];
    order.forEach(function (key) {
        var g = groups[key], first = rows[g.rows[0]], partner = g.partner, bad = false, lines = [], rawLines = [], rowOfLine = [], links = [], withOrder = 0;
        var head = { invoiceDate: first.invoiceDate, docDate: first.docDate || first.invoiceDate, due: first.due || '', expectedPay: first.expectedPay || '', period: String(first.period || '').trim(), group: String(first.group || '').trim().toUpperCase() };
        if (!cur[g.currency])
            g.rows.forEach(function (i) { E(i, 'currency', 'CURRENCY_UNKNOWN', 'Tiền tệ "' + g.currency + '" không hợp lệ.'); });
        if (!isDate_(head.invoiceDate))
            E(g.rows[0], 'invoiceDate', 'DATE_INVALID', 'Ngày hóa đơn không hợp lệ (dd/MM/yyyy).');
        ['docDate', 'due', 'expectedPay'].forEach(function (f) { if (head[f] && !isDate_(head[f]))
            E(g.rows[0], f, 'DATE_INVALID', 'Ngày không hợp lệ (dd/MM/yyyy).'); });
        g.rows.forEach(function (i, k) {
            var r = rows[i];
            if (k > 0) {
                var diff = HEAD.some(function (f) { var a = f === 'docDate' ? (r.docDate || r.invoiceDate) : (r[f] || ''), b = head[f] || ''; return String(a || '').trim() !== String(b || '').trim(); }) || String(r.group || '').trim().toUpperCase() !== head.group;
                if (diff)
                    E(i, 'invoiceNo', 'HEADER_MISMATCH', 'Ngày/hạn/kỳ/nhóm khác với dòng đầu của cùng hóa đơn ' + g.no + ' (các dòng cùng hóa đơn phải giống nhau).');
            }
            var fee = bulkFindFee_(feeTypes, r.feeType), vat = bulkVat_(r.vat), sc = String(r.serviceCode || '').trim().toUpperCase();
            if (!fee)
                E(i, 'feeType', 'FEE_UNKNOWN', 'Loại phí "' + r.feeType + '" không có trong danh mục (dùng mã hoặc tên).');
            if (!vat)
                E(i, 'vat', 'TAX_INVALID', 'Thuế: ghi KCT, số % (vd 8), hoặc để trống = chưa xác nhận.');
            if (sc && svc.indexOf(sc) < 0)
                E(i, 'serviceCode', 'SERVICE_CODE_UNKNOWN', 'Mã dịch vụ "' + sc + '" không có trong danh mục.');
            var dec = cur[g.currency] ? cur[g.currency].decimals : 0, net = parseAmountMinor_(r.netText === undefined ? '' : r.netText, dec === 0 ? 0 : 2), cq = parseDecText_(r.containerQty, 3), up = parseDecText_(r.unitPrice, 4);
            if (net.empty && cq !== null && up !== null && !Number.isNaN(cq) && !Number.isNaN(up)) {
                var mq2 = mulQtyPrice_(cq, up, dec);
                if (mq2 !== null)
                    net = { minor: mq2 };
            }
            if (net.error || net.empty)
                E(i, 'netMinor', net.error || 'AMOUNT_REQUIRED', 'Số tiền không hợp lệ' + (dec === 0 ? ' (VND: số nguyên đồng).' : ' (tối đa 2 số lẻ).'));
            if (!String(r.description || '').trim())
                E(i, 'description', 'DESCRIPTION_REQUIRED', 'Thiếu diễn giải.');
            if (r.declDate && !isDate_(r.declDate))
                E(i, 'declDate', 'DATE_INVALID', 'Ngày tờ khai không hợp lệ (dd/MM/yyyy).');
            if (Number.isNaN(cq)) {
                E(i, 'containerQty', 'QTY_INVALID', 'Số lượng không hợp lệ (tối đa 3 số lẻ).');
                cq = null;
            }
            if (Number.isNaN(up)) {
                E(i, 'unitPrice', 'UNIT_PRICE_INVALID', 'Đơn giá không hợp lệ (tối đa 4 số lẻ).');
                up = null;
            }
            var raw = { feeTypeCode: fee || '', description: String(r.description || '').trim(), netMinor: net.minor, vatMode: vat ? vat.mode : 'UNCONFIRMED', vatRateBp: vat ? vat.bp : null, serviceCode: sc, isPassThrough: r.isPassThrough ? 1 : 0, containerQty: cq, unitPrice: up, declNo: String(r.declNo || '').trim(), declDate: r.declDate || '', lotNote: String(r.lotNote || '').trim().slice(0, 200) };
            lines.push(raw);
            rawLines.push(raw);
            rowOfLine.push(i);
            var ot = String(r.order || '').trim(), od = null;
            if (ot) {
                withOrder++;
                od = ofind(ot, partner);
                if (od === null)
                    E(i, 'order', 'ORDER_UNKNOWN', 'Không tìm thấy đơn đang mở theo số đơn/PO "' + ot + '"' + (dir === 'AR' ? ' của khách này.' : '.'));
                else if (od === 'AMBIGUOUS')
                    E(i, 'order', 'ORDER_AMBIGUOUS', '"' + ot + '" khớp nhiều đơn: ghi số đơn DH-… cho chính xác.');
                else {
                    var oc = allPartners[od.customerPartnerId];
                    if (dir === 'AR' && od.customerPartnerId !== partner.id)
                        E(i, 'order', 'ORDER_PARTNER_MISMATCH', 'Đơn ' + od.orderNo + ' thuộc khách khác.');
                    if (!inScope_(user, oc, od.businessGroupCode))
                        E(i, 'order', 'OUT_OF_SCOPE', 'Đơn ' + od.orderNo + ' ngoài phạm vi dữ liệu của bạn.');
                    var pk = pickAccrualService_(od, sc);
                    if (pk.err)
                        E(i, 'serviceCode', 'SERVICE_CODE', pk.err);
                    else
                        raw.serviceCode = pk.code;
                    if (head.group && head.group !== od.businessGroupCode)
                        E(i, 'group', 'GROUP_ORDER_MISMATCH', 'Nhóm nghiệp vụ khác nhóm của đơn ' + od.orderNo + ' (' + od.businessGroupCode + ').');
                }
            }
            links.push({ order: od && typeof od === 'object' ? od : null, poRef: String(r.poRef || '').trim().slice(0, 100) });
        });
        if (withOrder && withOrder !== g.rows.length)
            E(g.rows[0], 'order', 'ORDER_ALL_OR_NONE', 'Hóa đơn ' + g.no + ': nếu gắn PO thì MỌI dòng phí của hóa đơn đều phải có số đơn/PO (hoặc bỏ trống cả hóa đơn).');
        if (withOrder && !head.group) {
            var og = links.filter(function (l) { return l.order; })[0];
            if (og)
                head.group = og.order.businessGroupCode;
        }
        var linkedGroups = {};
        links.forEach(function (l) { if (l.order)
            linkedGroups[l.order.businessGroupCode] = 1; });
        if (Object.keys(linkedGroups).length > 1)
            E(g.rows[0], 'order', 'ORDERS_MULTI_GROUP', 'Hóa đơn ' + g.no + ' gắn các đơn thuộc nhiều nhóm nghiệp vụ: tách thành các hóa đơn riêng.');
        var p = { direction: dir, docType: 'INVOICE', partnerId: partner.id, currency: g.currency, businessGroupCode: head.group, docDate: head.docDate, invoiceNo: g.no, invoiceSerial: g.serial, invoiceDate: head.invoiceDate, dueDate: head.due, dueDateSource: head.due ? 'MANUAL' : 'NONE', expectedPayDate: head.expectedPay, statementPeriod: head.period, statusNote: String(first.note || '').slice(0, 500), batchLabel: '', lines: lines };
        var v = validateDocInput_(p, { partner: partner, currencies: cur, groups: groupsCat, feeTypes: feeTypes.map(function (f) { return f.code; }), serviceCodes: svc, ledgerStart: ls });
        v.errors.forEach(function (e) {
            var m = /^lines\[(\d+)\]\.(\w+)/.exec(e.path), i = m ? rowOfLine[Number(m[1])] : g.rows[0], f = m ? ({ netMinor: 'netMinor', vatMode: 'vat', vatRateBp: 'vat', feeTypeCode: 'feeType', description: 'description' }[m[2]] || m[2]) : ({ docDate: 'docDate', invoiceDate: 'invoiceDate', businessGroupCode: 'group', statementPeriod: 'period', dueDate: 'due', expectedPayDate: 'expectedPay' }[e.path] || e.path);
            if (!results[i].issues.some(function (x) { return x.field === f && x.code === e.code; }))
                E(i, f, e.code, e.message);
        });
        if (!inScope_(user, partner, head.group)) {
            E(g.rows[0], 'partner', 'OUT_OF_SCOPE', 'Ngoài phạm vi dữ liệu của bạn.');
        }
        if (withOrder && head.docDate && closed[head.docDate.slice(0, 7)])
            E(g.rows[0], 'docDate', 'PERIOD_CLOSED', 'Kỳ ' + head.docDate.slice(0, 7) + ' đã khóa: không tạo khoản phát sinh vào kỳ đã khóa.');
        bad = g.rows.some(function (i) { return !results[i].ok; });
        if (bad)
            return;
        // Ghép từng dòng gắn PO với khoản phát sinh còn mở cùng đơn/đối tác/tiền tệ/số tiền; không có thì sẽ tạo khoản mới.
        var plan = [];
        links.forEach(function (l, k) {
            if (!l.order) {
                plan.push(null);
                return;
            }
            var gross = v.lines[k].grossMinor, cands = accruals.filter(function (a) { return !claimed[a.id] && a.orderId === l.order.id && a.partnerId === partner.id && a.currency === g.currency && a.grossMinor === gross; });
            var pick = cands.filter(function (a) { return a.feeTypeCode === v.lines[k].feeTypeCode; })[0] || cands[0] || null;
            if (pick) {
                claimed[pick.id] = 1;
                plan.push({ orderId: l.order.id, orderNo: l.order.orderNo, accrualId: pick.id, poRef: l.poRef });
                created.matchedAccruals++;
            }
            else {
                plan.push({ orderId: l.order.id, orderNo: l.order.orderNo, accrualId: '', poRef: l.poRef });
                created.newAccruals++;
                if (dir === 'AR') {
                    var ck = partner.id + '|' + g.currency;
                    creditExtra[ck] = (creditExtra[ck] || 0) + gross;
                }
            }
            created.linked++;
        });
        var doc = v.doc;
        applyPartnerTerm_(doc, partner);
        var dups = findDuplicateDocs_(doc, existing, null);
        docs.push({ doc: doc, lines: v.lines, raw: rawLines, plan: withOrder ? plan : null, dups: dups, rows: g.rows, partner: partner, group: head.group });
        created.docs++;
        created.lines += v.lines.length;
        total[doc.currency] = (total[doc.currency] || 0) + doc.totalGrossMinor;
        g.rows.forEach(function (i, k) {
            var pl = withOrder ? plan[k] : null;
            results[i].summary = (dir === 'AR' ? 'HĐ bán ' : 'HĐ mua ') + g.no + ' · ' + partner.shortName + ' · ' + doc.currency + (pl ? ' · gắn ' + pl.orderNo + (pl.accrualId ? ' (khớp khoản phát sinh sẵn có)' : ' (tạo khoản phát sinh mới)') : ' · không gắn PO') + (dups.length ? ' · ⚠ nghi trùng ' + dups.map(function (d) { return d.docNo || d.id; }).join(', ') : '');
        });
    });
    return { results: results, docs: docs, created: created, totals: total, dupCount: docs.filter(function (d) { return d.dups.length; }).length, creditExtra: creditExtra };
}
// Gợi ý ghép dòng hóa đơn (đọc từ XML) với khoản phát sinh còn mở của PO/Cost: cùng chiều, đối tác, tiền tệ và số tiền (thành tiền hoặc trước thuế). Chỉ ĐỌC.
function docBulkSuggest_(user, req) {
    requirePerm_(user, 'order.write');
    var p = req.payload || {}, dir = p.direction, lines = Array.isArray(p.lines) ? p.lines.slice(0, 200) : [];
    if (dir !== 'AR' && dir !== 'AP')
        throw err_('VALIDATION_FAILED', 'Chọn chiều hóa đơn.');
    var partner = repoFind_('Partner', String(p.partnerId || ''));
    if (!partner || !inScope_(user, partner, ''))
        return { items: lines.map(function () { return { candidates: [] }; }) };
    var cur = currencyMap_(), currency = String(p.currency || 'VND').toUpperCase(), dec = cur[currency] ? cur[currency].decimals : 0, pm = partnerMap_(), orders = byId_(repoValid_('Order')), kind = dir === 'AR' ? 'REVENUE' : 'COST';
    var open = repoValid_('Accrual').filter(function (a) { return a.status === 'OPEN' && a.kind === kind && a.partnerId === partner.id && a.currency === currency && a.orderId && orders[a.orderId] && orders[a.orderId].status === 'OPEN' && inScope_(user, pm[orders[a.orderId].customerPartnerId], orders[a.orderId].businessGroupCode); });
    var used = {};
    return { items: lines.map(function (l) {
            var net = parseAmountMinor_(l.netText === undefined ? '' : l.netText, dec === 0 ? 0 : 2), vat = bulkVat_(l.vat);
            if (net.error || net.empty || !vat)
                return { candidates: [] };
            var calc = calcLine_({ feeTypeCode: 'X', description: 'x', netMinor: net.minor, vatMode: vat.mode, vatRateBp: vat.bp }, 0, true).line, cands = open.filter(function (a) { return !used[a.id] && (a.grossMinor === calc.grossMinor || a.netMinor === net.minor); });
            cands.sort(function (a, b) { return (b.grossMinor === calc.grossMinor ? 1 : 0) - (a.grossMinor === calc.grossMinor ? 1 : 0); });
            var out = cands.slice(0, 5).map(function (a) { var o = orders[a.orderId]; return { id: a.id, orderNo: o.orderNo, poNo: o.poNo || '', serviceCode: a.serviceCode || '', description: a.description, accrualDate: a.accrualDate, feeTypeCode: a.feeTypeCode, grossMinor: a.grossMinor, exact: a.grossMinor === calc.grossMinor, group: o.businessGroupCode }; });
            if (out.length === 1 && out[0].exact)
                used[out[0].id] = 1;
            return { candidates: out };
        }) };
}
function docBulkPreview_(user, req) {
    requirePerm_(user, 'doc.write');
    var p = req.payload || {};
    if (p.direction !== 'AR' && p.direction !== 'AP')
        throw err_('VALIDATION_FAILED', 'Chọn hóa đơn bán (phải thu) hoặc hóa đơn mua (phải trả).');
    if (!Array.isArray(p.rows) || !p.rows.length)
        throw err_('VALIDATION_FAILED', 'Chưa có dòng nào.');
    if (p.rows.length > INV_BULK_MAX_)
        throw err_('VALIDATION_FAILED', 'Tối đa ' + INV_BULK_MAX_ + ' dòng một lần.');
    if (p.rows.some(function (r) { return String(r.order || '').trim(); }))
        requirePerm_(user, 'order.write');
    var out = invBulkBuild_({ rows: function (t) { return repoValid_(t); } }, user, p.direction, p.rows), bad = out.results.filter(function (r) { return !r.ok; }).length;
    return { rows: out.results, errors: bad, created: out.created, totals: out.totals, duplicates: out.dupCount, canCommit: bad === 0 };
}
function docBulkCommit_(user, req) {
    requirePerm_(user, 'doc.write');
    var p = req.payload || {};
    if (p.direction !== 'AR' && p.direction !== 'AP')
        throw err_('VALIDATION_FAILED', 'Chọn hóa đơn bán hoặc mua.');
    if (!Array.isArray(p.rows) || !p.rows.length || p.rows.length > INV_BULK_MAX_)
        throw err_('VALIDATION_FAILED', 'Số dòng không hợp lệ (1–' + INV_BULK_MAX_ + ').');
    if (p.submit)
        requirePerm_(user, 'doc.submit');
    if (p.rows.some(function (r) { return String(r.order || '').trim(); }))
        requirePerm_(user, 'order.write');
    return runTx_(user, { requestId: req.requestId, action: 'doc.bulkCommit', payload: p, failAt: req.failAt }, function (tx) {
        var out = invBulkBuild_({ rows: tx.rows }, user, p.direction, p.rows), bad = out.results.filter(function (r) { return !r.ok; });
        if (bad.length)
            throw err_('VALIDATION_FAILED', 'Còn ' + bad.length + ' dòng lỗi, chưa ghi hóa đơn nào.', bad.reduce(function (a, r) { return a.concat(r.issues.map(function (i) { return { path: 'row' + r.rowNo + '.' + i.field, code: i.code, message: 'Dòng ' + r.rowNo + ': ' + i.message }; })); }, []).slice(0, 50));
        var warnings = [];
        Object.keys(out.creditExtra).forEach(function (k) { var x = k.split('|'); enforceCredit_(tx, user, x[0], x[1], todayVn_(), out.creditExtra[k], p).forEach(function (w) { warnings.push(w); }); });
        var label = maxStr_(String(p.batchLabel || '').trim() || ('Nhập hàng loạt ' + todayVn_()), 100), kind = p.direction === 'AR' ? 'REVENUE' : 'COST';
        out.docs.forEach(function (d) {
            var linked = !!d.plan, fields = Object.assign({}, d.doc, { batchLabel: label, status: 'DRAFT', source: linked ? 'ORDER' : 'MANUAL', assuranceLevel: 'VERIFIED', warningsJson: d.dups.length ? JSON.stringify({ duplicates: d.dups }) : '', searchText: normText_(d.partner.shortName + ' ' + d.doc.invoiceNo) }), no = '';
            if (p.submit) {
                var prefix = d.doc.direction === 'AR' ? 'PT' : 'PTR', y = (d.doc.docDate || todayVn_()).slice(0, 4);
                no = prefix + '-' + y + '-' + ('000000' + tx.nextSeq('seq.' + prefix + '.' + y)).slice(-6);
                fields = Object.assign(fields, { status: 'SUBMITTED', submittedBy: user.id });
            }
            resolveLineRefs_(tx, d.raw, d.lines, d.group, d.partner.id, d.doc.direction);
            var doc = tx.insert('DebtDoc', Object.assign({ docNo: no, isOpening: 0, adjustsDocId: '', reversesDocId: '' }, fields)), keys = [];
            if (linked)
                assertPeriodOpen_(tx, d.doc.docDate);
            d.lines.forEach(function (l, k) {
                var pl = linked ? d.plan[k] : null, accId = pl ? pl.accrualId : '', acc = null;
                if (pl && !accId) {
                    acc = tx.insert('Accrual', { orderId: pl.orderId, serviceCode: d.raw[k].serviceCode, kind: kind, partnerId: d.partner.id, poRef: pl.poRef, accrualDate: d.doc.docDate, feeTypeCode: l.feeTypeCode, description: l.description, containerQty: l.containerQty === undefined ? null : l.containerQty, unitPrice: l.unitPrice === undefined ? null : l.unitPrice,
                        netMinor: l.netMinor, vatMode: l.vatMode, vatRateBp: l.vatRateBp, vatMinor: l.vatMinor, grossMinor: l.grossMinor, isPassThrough: l.isPassThrough, currency: d.doc.currency, status: 'INVOICING', docId: doc.id, debtLineId: '', note: 'Tạo từ nhập hàng loạt hóa đơn ' + d.doc.invoiceNo });
                    accId = acc.id;
                }
                var line = tx.insert('DebtLine', Object.assign({}, l, { docId: doc.id, accrualId: accId }));
                if (acc)
                    acc.debtLineId = line.id;
                else if (accId) {
                    var upd = { status: 'INVOICING', docId: doc.id, debtLineId: line.id };
                    if (pl.poRef)
                        upd.poRef = pl.poRef;
                    tx.update('Accrual', accId, upd);
                }
                if (accId)
                    keys.push(accId);
            });
            if (linked)
                doc.sourceKey = keys.join(',');
        });
        return { result: { created: out.created, totals: out.totals, duplicates: out.dupCount, submitted: !!p.submit, batchLabel: label, warnings: warnings }, audit: [{ entityType: 'DebtDoc', entityId: 'bulk', action: 'doc.bulk.' + p.direction.toLowerCase(), diff: { docs: out.created.docs, lines: out.created.lines, linked: out.created.linked, newAccruals: out.created.newAccruals, matchedAccruals: out.created.matchedAccruals, submitted: !!p.submit, batchLabel: label } }] };
    });
}
function partnerList_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, pm = repoValid_('Partner'), q = normText_(p.q);
    var list = pm.filter(function (x) {
        if (!inScope_(user, x, ''))
            return false;
        if (p.role === 'CUSTOMER' && !x.isCustomer)
            return false;
        if (p.role === 'SUPPLIER' && !x.isSupplier)
            return false;
        if (p.status && x.status !== p.status)
            return false;
        return !q || x.searchText.indexOf(q) >= 0;
    }).sort(function (a, b) { return cmpStr_(normText_(a.shortName), normText_(b.shortName)); });
    var pg = paginate_(list, p.page, p.pageSize || 50);
    return { items: pg.items.map(partnerOut_), total: pg.total, page: pg.page, pageSize: pg.pageSize };
}
function partnerOut_(x) {
    return { id: x.id, partnerNo: x.partnerNo, legalName: x.legalName, shortName: x.shortName, taxCode: x.taxCode, isCustomer: x.isCustomer, isSupplier: x.isSupplier,
        paymentTermDays: x.paymentTermDays, bankInfo: x.bankInfo, status: x.status, scopeTags: x.scopeTags, version: x.version, contactEmail: x.contactEmail, creditLimitMinor: x.creditLimitMinor, creditLimitCurrency: x.creditLimitCurrency,
        address: x.address || '', phone: x.phone || '', contactName: x.contactName || '', contactTitle: x.contactTitle || '', bankAccountNo: x.bankAccountNo || '', bankName: x.bankName || '' };
}
function partnerGet_(user, req) {
    requirePerm_(user, 'read');
    var p = repoFind_('Partner', req.payload.id);
    if (!p)
        throw err_('NOT_FOUND', 'Không tìm thấy đối tác.');
    assertVisible_(user, p, '', '', 'Không tìm thấy đối tác.');
    var led = loadLedger_(user, req.payload.asOf || todayVn_());
    var bal = { AR: {}, AP: {} };
    led.docs.forEach(function (d) {
        if (d.partnerId !== p.id)
            return;
        var b = led.bal.byDoc[d.id];
        if (!b)
            return;
        var o = bal[d.direction][d.currency] = bal[d.direction][d.currency] || { gross: 0, alloc: 0, out: 0 };
        o.gross += b.gross + b.adjust;
        o.alloc += b.alloc;
        o.out += b.out;
    });
    var unalloc = {};
    led.payments.forEach(function (pay) {
        if (pay.partnerId !== p.id || !led.payBal[pay.id])
            return;
        var k = pay.direction + ':' + pay.currency;
        unalloc[k] = (unalloc[k] || 0) + led.payBal[pay.id].unalloc;
    });
    var credit = {};
    Object.keys(bal.AR).forEach(function (c) {
        var exp = bal.AR[c].out, over = 0;
        led.lines.forEach(function (l) { var d = led.docById[l.docId], b = led.bal.byLine[l.id]; if (b && d.partnerId === p.id && d.direction === 'AR' && d.currency === c && b.out > 0 && d.dueDate && d.dueDate < led.asOf)
            over += b.out; });
        credit[c] = { exposure: exp, overdue: over, limit: p.creditLimitCurrency === c ? p.creditLimitMinor : null };
    });
    return { partner: partnerOut_(p), balances: bal, credit: credit, unallocated: unalloc, asOf: led.asOf,
        note: p.isCustomer && p.isSupplier ? 'Đối tác có hai vai trò: số dư phải thu và phải trả được tính riêng, KHÔNG bù trừ.' : '' };
}
function maskTail_(v) { v = String(v || ''); return v.length > 4 ? '***' + v.slice(-4) : (v ? '***' : ''); }
function maskPartnerDiff_(f) {
    var o = Object.assign({}, f);
    o.bankAccountNo = maskTail_(o.bankAccountNo);
    o.phone = maskTail_(o.phone);
    delete o.searchText;
    return o;
}
function partnerContactErrors_(p, E) {
    if (p.phone && !/^[0-9+().\-\s]{6,20}$/.test(String(p.phone).trim()))
        E('phone', 'PHONE_INVALID', 'Số điện thoại 6–20 ký tự (số, +, khoảng trắng, dấu - . ( )).');
    if (p.bankAccountNo && !/^[0-9A-Za-z\-\s]{4,34}$/.test(String(p.bankAccountNo).trim()))
        E('bankAccountNo', 'BANK_ACCOUNT_INVALID', 'Số tài khoản 4–34 ký tự (chữ, số, gạch).');
}
function partnerContactFields_(p) {
    return { address: maxStr_(p.address, 300).trim(), phone: maxStr_(p.phone, 20).trim(), contactName: maxStr_(p.contactName, 100).trim(), contactTitle: maxStr_(p.contactTitle, 100).trim(),
        bankAccountNo: maxStr_(p.bankAccountNo, 34).trim(), bankName: maxStr_(p.bankName, 150).trim() };
}
function partnerSave_(user, req) {
    requirePerm_(user, 'partner.write');
    var p = req.payload, errs = [];
    function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
    if (!String(p.shortName || '').trim())
        E('shortName', 'REQUIRED', 'Nhập tên viết tắt.');
    if (!String(p.legalName || '').trim())
        E('legalName', 'REQUIRED', 'Nhập tên pháp lý.');
    if (!p.isCustomer && !p.isSupplier)
        E('isCustomer', 'ROLE_REQUIRED', 'Chọn ít nhất một vai trò (khách hàng/nhà cung cấp).');
    if (p.taxCode && !/^\d{10}(-\d{3})?$/.test(String(p.taxCode).trim()))
        E('taxCode', 'TAX_CODE_INVALID', 'Mã số thuế gồm 10 số hoặc 10 số-3 số.');
    if (p.paymentTermDays !== null && p.paymentTermDays !== undefined && p.paymentTermDays !== '' && (!Number.isInteger(p.paymentTermDays) || p.paymentTermDays < 0 || p.paymentTermDays > 365))
        E('paymentTermDays', 'INVALID', 'Số ngày hạn nợ 0–365 hoặc để trống.');
    if (p.contactEmail && !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(String(p.contactEmail).trim()))
        E('contactEmail', 'EMAIL_INVALID', 'Email liên hệ không hợp lệ (một địa chỉ).');
    partnerContactErrors_(p, E);
    var hasLimit = p.creditLimitMinor !== null && p.creditLimitMinor !== undefined && p.creditLimitMinor !== '';
    if (hasLimit && (!Number.isSafeInteger(p.creditLimitMinor) || p.creditLimitMinor < 0 || p.creditLimitMinor > MONEY_MAX))
        E('creditLimitMinor', 'AMOUNT_INVALID', 'Hạn mức phải là số nguyên không âm.');
    if (hasLimit && !currencyMap_()[p.creditLimitCurrency])
        E('creditLimitCurrency', 'REQUIRED', 'Chọn tiền tệ của hạn mức.');
    if (hasLimit && !p.isCustomer)
        E('creditLimitMinor', 'PARTNER_ROLE', 'Hạn mức công nợ chỉ áp dụng cho khách hàng.');
    if (errs.length)
        throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
    return runTx_(user, { requestId: req.requestId, action: 'partner.save', payload: p, failAt: req.failAt }, function (tx) {
        var existing = p.id ? tx.find('Partner', p.id) : null;
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy đối tác.');
        if (existing)
            assertVisible_(user, existing, '', '', 'Không tìm thấy đối tác.');
        var newScoped = { id: existing ? existing.id : '', scopeTags: maxStr_(p.scopeTags, 200) };
        if (!inScope_(user, newScoped, ''))
            throw err_('OUT_OF_SCOPE', 'Thẻ phạm vi của đối tác phải thuộc phạm vi dữ liệu của chị/anh (nếu không đối tác sẽ biến mất khỏi tầm nhìn).');
        var norm = normText_(p.legalName), nShort = normText_(p.shortName), warnings = [];
        tx.rows('Partner').forEach(function (o) {
            if (existing && o.id === existing.id)
                return;
            if (p.taxCode && o.taxCode && o.taxCode === String(p.taxCode).trim())
                warnings.push({ code: 'PARTNER_SUSPECT_DUP', message: 'Trùng mã số thuế với ' + o.shortName });
            else if (normText_(o.legalName) === norm || normText_(o.shortName) === nShort)
                warnings.push({ code: 'PARTNER_SUSPECT_DUP', message: 'Trùng tên với ' + o.shortName });
        });
        var fields = { legalName: maxStr_(p.legalName, 200).trim(), shortName: maxStr_(p.shortName, 50).trim(), taxCode: String(p.taxCode || '').trim(),
            isCustomer: p.isCustomer ? 1 : 0, isSupplier: p.isSupplier ? 1 : 0, paymentTermDays: (p.paymentTermDays === '' || p.paymentTermDays === undefined) ? null : p.paymentTermDays,
            bankInfo: maxStr_(p.bankInfo, 500), status: p.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE', scopeTags: maxStr_(p.scopeTags, 200), contactEmail: String(p.contactEmail || '').trim(),
            searchText: normText_(p.shortName + ' ' + p.legalName + ' ' + p.taxCode + ' ' + (p.contactName || '') + ' ' + (p.phone || '')) };
        Object.assign(fields, partnerContactFields_(p));
        var newLimit = hasLimit ? p.creditLimitMinor : null, newCur = hasLimit ? p.creditLimitCurrency : '';
        if ((existing ? (existing.creditLimitMinor !== newLimit || existing.creditLimitCurrency !== newCur) : hasLimit) && !can_(user, 'config.finance'))
            throw err_('FORBIDDEN', 'Chỉ Kế toán trưởng/người duyệt được đặt hoặc đổi hạn mức công nợ.');
        fields.creditLimitMinor = newLimit;
        fields.creditLimitCurrency = newCur;
        var row;
        if (existing) {
            if ((existing.isCustomer && !fields.isCustomer) || (existing.isSupplier && !fields.isSupplier)) {
                var used = tx.rows('DebtDoc').some(function (d) { return d.partnerId === existing.id && ((!fields.isCustomer && d.direction === 'AR') || (!fields.isSupplier && d.direction === 'AP')); });
                if (used)
                    throw err_('PARTNER_ROLE_IN_USE', 'Không thể bỏ vai trò đã có chứng từ.');
            }
            row = tx.update('Partner', existing.id, fields, p.ifVersion);
        }
        else {
            fields.partnerNo = 'DT-' + ('0000' + tx.nextSeq('seq.partner')).slice(-4);
            row = tx.insert('Partner', fields);
        }
        return { result: { id: row.id, partnerNo: row.partnerNo || existing.partnerNo, version: existing ? existing.version + 1 : 1, warnings: warnings },
            audit: [{ entityType: 'Partner', entityId: row.id, action: existing ? 'partner.update' : 'partner.create', diff: maskPartnerDiff_(fields) }] };
    });
}
function partnerBulkCommit_(user, req) {
    requirePerm_(user, 'partner.write');
    var rows = (req.payload || {}).rows;
    if (!(user.scope || {}).allPartners)
        throw err_('OUT_OF_SCOPE', 'Nhập hàng loạt đối tác chỉ dành cho người có phạm vi toàn bộ đối tác.');
    if (!Array.isArray(rows) || !rows.length || rows.length > 500)
        throw err_('VALIDATION_FAILED', 'Số dòng không hợp lệ (1–500).');
    var errs = [], seen = {};
    function yes_(v) { var s = normText_(v); return s === '1' || s === 'co' || s === 'x' || s === 'true' || s === 'y'; }
    var clean = rows.map(function (r, i) {
        function E(f, m) { errs.push({ path: 'row' + (i + 1) + '.' + f, code: 'INVALID', message: 'Dòng ' + (i + 1) + ': ' + m }); }
        var o = { shortName: String(r.shortName || '').trim(), legalName: String(r.legalName || '').trim(), taxCode: String(r.taxCode || '').trim(), isCustomer: yes_(r.isCustomer) ? 1 : 0, isSupplier: yes_(r.isSupplier) ? 1 : 0,
            contactEmail: String(r.contactEmail || '').trim(), address: r.address, phone: r.phone, contactName: r.contactName, contactTitle: r.contactTitle, bankAccountNo: r.bankAccountNo, bankName: r.bankName, term: String(r.paymentTermDays === undefined || r.paymentTermDays === null ? '' : r.paymentTermDays).trim() };
        if (!o.shortName)
            E('shortName', 'thiếu tên viết tắt.');
        if (!o.legalName)
            o.legalName = o.shortName;
        if (!o.isCustomer && !o.isSupplier)
            E('isCustomer', 'chọn ít nhất khách hàng hoặc nhà cung cấp (ghi 1 hoặc Có).');
        if (o.taxCode && !/^\d{10}(-\d{3})?$/.test(o.taxCode))
            E('taxCode', 'mã số thuế gồm 10 số hoặc 10 số-3 số.');
        if (o.contactEmail && !/^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]+$/.test(o.contactEmail))
            E('contactEmail', 'email không hợp lệ.');
        partnerContactErrors_(o, function (path, code, msg) { E(path, msg); });
        o.paymentTermDays = null;
        if (o.term !== '') {
            var n = Number(o.term);
            if (!Number.isInteger(n) || n < 0 || n > 365)
                E('paymentTermDays', 'số ngày hạn nợ 0–365 hoặc để trống.');
            else
                o.paymentTermDays = n;
        }
        var k = normText_(o.shortName);
        if (k && seen[k])
            E('shortName', 'trùng tên viết tắt với dòng ' + seen[k] + '.');
        else if (k)
            seen[k] = i + 1;
        return o;
    });
    if (errs.length)
        throw err_('VALIDATION_FAILED', 'Còn ' + errs.length + ' lỗi, chưa ghi dòng nào.', errs);
    return runTx_(user, { requestId: req.requestId, action: 'partner.bulkCommit', payload: req.payload, failAt: req.failAt }, function (tx) {
        var have = {};
        tx.rows('Partner').forEach(function (p) { have[normText_(p.shortName)] = 1; });
        var created = 0, skipped = [];
        clean.forEach(function (o) {
            if (have[normText_(o.shortName)]) {
                skipped.push(o.shortName);
                return;
            }
            tx.insert('Partner', Object.assign({ partnerNo: 'DT-' + ('0000' + tx.nextSeq('seq.partner')).slice(-4), legalName: maxStr_(o.legalName, 200), shortName: maxStr_(o.shortName, 50), taxCode: o.taxCode, isCustomer: o.isCustomer, isSupplier: o.isSupplier,
                paymentTermDays: o.paymentTermDays, bankInfo: '', status: 'ACTIVE', scopeTags: '', contactEmail: o.contactEmail, creditLimitMinor: null, creditLimitCurrency: '', searchText: normText_(o.shortName + ' ' + o.legalName + ' ' + o.taxCode + ' ' + (o.contactName || '') + ' ' + (o.phone || '')) }, partnerContactFields_(o)));
            created++;
        });
        return { result: { created: created, skipped: skipped }, audit: [{ entityType: 'Partner', entityId: 'bulk', action: 'partner.create', diff: { created: created, skipped: skipped } }] };
    });
}
var PAY_METHODS_ = ['BANK', 'CASH', 'OTHER'];
var PAY_PURPOSES_ = ['SETTLE', 'ADVANCE', 'REFUND'];
function payRowOut_(p, led, users) {
    var b = led.payBal[p.id];
    return { id: p.id, payNo: p.payNo, direction: p.direction, partnerId: p.partnerId, partnerName: partnerName_(led.pm, p.partnerId), currency: p.currency, amountMinor: p.amountMinor,
        effectiveDate: p.effectiveDate, method: p.method, cashAccountCode: p.cashAccountCode, bankRef: p.bankRef, purpose: p.purpose, status: p.status, note: p.note,
        allocatedMinor: b ? b.alloc : 0, unallocatedMinor: b ? b.unalloc : null, fxRateE4: p.fxRateE4 || 0, fxRate: fxText_(p.fxRateE4), fxSource: p.fxSource || '', amountBaseMinor: p.amountBaseMinor === undefined || p.amountBaseMinor === '' ? null : p.amountBaseMinor, createdBy: p.createdBy, version: p.version, rejectReason: p.rejectReason, source: p.source,
        warnings: safeJson_(p.warningsJson, []) };
}
function payActions_(user, p, unalloc) {
    var a = [], mine = p.createdBy === user.id, appr = user.role === 'APPROVER';
    if (p.status === 'DRAFT' && can_(user, 'payment.write') && (mine || appr)) {
        a.push('save');
        if (can_(user, 'payment.submit'))
            a.push('submit');
        a.push('delete');
    }
    if (p.status === 'REJECTED' && can_(user, 'payment.write')) {
        if (mine) {
            a.push('save');
            if (can_(user, 'payment.submit'))
                a.push('submit');
        }
        if (appr)
            a.push('delete');
    }
    if (p.status === 'SUBMITTED' && can_(user, 'payment.approve') && p.createdBy !== user.id && p.submittedBy !== user.id) {
        a.push('approve');
        a.push('reject');
    }
    if (p.status === 'APPROVED' && can_(user, 'payment.approve'))
        a.push('post');
    if (p.status === 'POSTED') {
        if (can_(user, 'payment.allocate') && unalloc > 0)
            a.push('allocate');
        if (can_(user, 'payment.reverse'))
            a.push('reverse');
    }
    return a;
}
// ===== Tỷ giá ngoại tệ (đồng tiền ghi sổ: VND) =====
// Tỷ giá lưu số nguyên ×10.000 (VND cho 1 đơn vị ngoại tệ). Nguồn: MANUAL (nhập tay, luôn ưu tiên) hoặc GOOGLE (Google Finance, chỉ tự lấy khi ngày đó chưa có tỷ giá nhập tay).
var BASE_CUR_ = 'VND';
function fxE4_(v) {
    var s = String(v == null ? '' : v).trim();
    if (!/^\d{1,9}(\.\d{1,4})?$/.test(s))
        return 0;
    var p = s.split('.'), n = Number(p[0]) * 10000 + Number((p[1] || '').padEnd(4, '0'));
    return n > 0 && Number.isSafeInteger(n) ? n : 0;
}
function fxText_(e4) { return e4 > 0 ? formatMinorVn_(e4, 4).replace(/,?0+$/, '') : ''; }
function fxToBase_(minor, dec, e4) {
    var num = BigInt(minor) * BigInt(e4), den = BigInt(10000) * BigInt(Math.pow(10, dec)), neg = num < BigInt(0), a = neg ? -num : num, q = (a * BigInt(2) + den) / (den * BigInt(2)), r = Number(neg ? -q : q);
    if (!Number.isSafeInteger(r) || Math.abs(r) > MONEY_MAX * 100)
        throw err_('AMOUNT_OVERFLOW', 'Số tiền quy đổi quá lớn.');
    return r;
}
function fxFind_(cur, date, rows) {
    var best = null;
    (rows || repoValid_('FxRate')).forEach(function (r) {
        if (r.currency !== cur || r.rateDate !== date || !(r.rateE4 > 0))
            return;
        if (!best || (r.source === 'MANUAL' && best.source !== 'MANUAL') || (r.source === best.source && r.version >= best.version))
            best = r;
    });
    return best;
}
// Tỷ giá gần nhất trước hoặc đúng ngày (chỉ dùng cho báo cáo xem, không dùng để ghi sổ).
function fxNearest_(cur, date, rows) {
    var best = null;
    (rows || repoValid_('FxRate')).forEach(function (r) {
        if (r.currency !== cur || r.rateDate > date || !(r.rateE4 > 0))
            return;
        if (!best || r.rateDate > best.rateDate || (r.rateDate === best.rateDate && (r.source === 'MANUAL' && best.source !== 'MANUAL')))
            best = r;
    });
    return best;
}
// Chọn dòng Google Finance gần nhất không sau ngày yêu cầu từ bảng giá trị [[ngày, giá đóng cửa], ...]; hàm thuần để kiểm thử.
function fxPickGoogle_(values, date) {
    var best = null;
    (values || []).forEach(function (row) {
        if (!row || row.length < 2)
            return;
        var d = row[0] instanceof Date ? Utilities.formatDate(row[0], 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd') : String(row[0]).slice(0, 10), v = typeof row[1] === 'number' ? row[1] : Number(String(row[1]).replace(',', '.'));
        if (!isDate_(d) || d > date || !(v > 0) || !isFinite(v))
            return;
        if (!best || d > best.date)
            best = { date: d, rateE4: Math.round(v * 10000) };
    });
    return best && best.rateE4 > 0 ? best : null;
}
function fxGoogle_(cur, date) {
    if (!/^[A-Z]{3}$/.test(cur) || !isDate_(date))
        return null;
    var ss = null;
    try {
        ss = SpreadsheetApp.create('TMP_FX_' + cur + '_' + Date.now());
        var sh = ss.getSheets()[0], y = date.slice(0, 4), m = Number(date.slice(5, 7)), d = Number(date.slice(8, 10));
        sh.getRange('A1').setFormula('=GOOGLEFINANCE("CURRENCY:' + cur + BASE_CUR_ + '","close",DATE(' + y + ',' + m + ',' + d + '-7),DATE(' + y + ',' + m + ',' + d + '))');
        for (var i = 0; i < 6; i++) {
            SpreadsheetApp.flush();
            var vals = sh.getDataRange().getValues();
            if (!(vals.length && String(vals[0][0]) === 'Loading...')) {
                if (vals.length && String(vals[0][0]).charAt(0) === '#')
                    return null;
                return fxPickGoogle_(vals.slice(1), date);
            }
            Utilities.sleep(1000);
        }
        return null;
    }
    catch (e) {
        return null;
    }
    finally {
        try {
            if (ss)
                DriveApp.getFileById(ss.getId()).setTrashed(true);
        }
        catch (e2) { }
    }
}
function fxStore_(user, cur, date, e4, source, note) {
    return runTx_(user, { requestId: uid_('fx'), action: 'fx.store', payload: { cur: cur, date: date, e4: e4, source: source } }, function (tx) {
        var rows = tx.rows('FxRate'), same = rows.filter(function (r) { return r.currency === cur && r.rateDate === date && r.source === source && r.isDeleted !== 1; })[0], row;
        if (same)
            row = tx.update('FxRate', same.id, { rateE4: e4, note: note || same.note });
        else
            row = tx.insert('FxRate', { rateDate: date, currency: cur, rateE4: e4, source: source, note: note || '' });
        return { result: { id: row.id }, audit: [{ entityType: 'FxRate', entityId: row.id, action: 'fx.' + source.toLowerCase(), diff: { currency: cur, date: date, rate: fxText_(e4) } }] };
    });
}
// Xác định tỷ giá của một ngày: nhập tay trên phiếu > bảng tỷ giá (nhập tay trước, Google sau) > tự lấy Google Finance > báo thiếu. Gọi TRƯỚC khi mở giao dịch ghi sổ (có thể ghi bảng tỷ giá).
function fxResolve_(user, cur, date, manual) {
    if (!cur || cur === BASE_CUR_ || !isDate_(date))
        return null;
    if (manual !== undefined && manual !== null && String(manual).trim() !== '') {
        var m = fxE4_(manual);
        if (!m)
            throw err_('VALIDATION_FAILED', 'Tỷ giá không hợp lệ.', [{ path: 'fxRate', code: 'FX_INVALID', message: 'Nhập tỷ giá dạng số dương, tối đa 4 số lẻ.' }]);
        if (!fxFind_(cur, date))
            fxStore_(user, cur, date, m, 'MANUAL', 'Nhập trên chứng từ');
        return { cur: cur, date: date, e4: m, source: 'MANUAL' };
    }
    var f = fxFind_(cur, date);
    if (f)
        return { cur: cur, date: date, e4: f.rateE4, source: f.source };
    var g = fxGoogle_(cur, date);
    if (g) {
        fxStore_(user, cur, date, g.rateE4, 'GOOGLE', 'Google Finance, giá đóng cửa ngày ' + g.date);
        return { cur: cur, date: date, e4: g.rateE4, source: 'GOOGLE' };
    }
    throw err_('FX_RATE_MISSING', 'Chưa có tỷ giá ' + cur + '/' + BASE_CUR_ + ' ngày ' + rptDateVn_(date) + ' và không lấy được từ Google Finance. Hãy nhập tỷ giá ở ô "Tỷ giá" hoặc menu Tỷ giá.', [{ path: 'fxRate', code: 'FX_RATE_MISSING', message: 'Nhập tỷ giá ngày ' + rptDateVn_(date) + '.' }]);
}
function fxList_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, rows = repoValid_('FxRate').filter(function (r) { return (!p.currency || r.currency === p.currency) && (!p.from || r.rateDate >= p.from) && (!p.to || r.rateDate <= p.to); });
    rows.sort(function (a, b) { return a.rateDate < b.rateDate ? 1 : a.rateDate > b.rateDate ? -1 : (a.source < b.source ? -1 : 1); });
    var total = rows.length, size = Math.min(Math.max(Number(p.pageSize) || 100, 1), 500), page = Math.max(Number(p.page) || 1, 1);
    return { total: total, items: rows.slice((page - 1) * size, page * size).map(function (r) { return { id: r.id, rateDate: r.rateDate, currency: r.currency, rate: fxText_(r.rateE4), rateE4: r.rateE4, source: r.source, note: r.note, createdBy: r.createdBy, version: r.version }; }) };
}
function fxSave_(user, req) {
    requirePerm_(user, 'fx.write');
    var p = req.payload || {}, cm = currencyMap_(), errs = [];
    if (!p.currency || p.currency === BASE_CUR_ || !cm[p.currency])
        errs.push({ path: 'currency', code: 'REQUIRED', message: 'Chọn ngoại tệ (không phải ' + BASE_CUR_ + ').' });
    if (!isDate_(p.rateDate) || p.rateDate > addDays_(todayVn_(), 1))
        errs.push({ path: 'rateDate', code: 'DATE_INVALID', message: 'Nhập ngày hợp lệ, không ở tương lai.' });
    var e4 = fxE4_(p.rate);
    if (!e4)
        errs.push({ path: 'rate', code: 'FX_INVALID', message: 'Nhập tỷ giá dạng số dương, tối đa 4 số lẻ.' });
    if (errs.length)
        throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
    return runTx_(user, { requestId: req.requestId, action: 'fx.save', payload: p, failAt: req.failAt }, function (tx) {
        var same = tx.rows('FxRate').filter(function (r) { return r.currency === p.currency && r.rateDate === p.rateDate && r.source === 'MANUAL' && r.isDeleted !== 1; })[0], row;
        if (same)
            row = tx.update('FxRate', same.id, { rateE4: e4, note: maxStr_(p.note, 200) }, p.ifVersion);
        else
            row = tx.insert('FxRate', { rateDate: p.rateDate, currency: p.currency, rateE4: e4, source: 'MANUAL', note: maxStr_(p.note, 200) });
        return { result: { id: row.id, rate: fxText_(e4), replaced: !!same }, audit: [{ entityType: 'FxRate', entityId: row.id, action: same ? 'fx.update' : 'fx.create', diff: { currency: p.currency, date: p.rateDate, rate: fxText_(e4), before: same ? fxText_(same.rateE4) : null } }] };
    });
}
// Lấy tỷ giá Google Finance cho một ngày (khi ngày đó chưa có tỷ giá nhập tay). Không đè tỷ giá nhập tay.
function fxFetch_(user, req) {
    requirePerm_(user, 'fx.write');
    var p = req.payload || {}, cm = currencyMap_();
    if (!p.currency || p.currency === BASE_CUR_ || !cm[p.currency] || !isDate_(p.rateDate))
        throw err_('VALIDATION_FAILED', 'Chọn ngoại tệ và ngày hợp lệ.');
    var manual = fxFind_(p.currency, p.rateDate);
    if (manual && manual.source === 'MANUAL')
        return { skipped: true, reason: 'Ngày này đã có tỷ giá nhập tay; tỷ giá nhập tay luôn được ưu tiên.', rate: fxText_(manual.rateE4) };
    var g = fxGoogle_(p.currency, p.rateDate);
    if (!g)
        throw err_('FX_FETCH_FAILED', 'Không lấy được tỷ giá từ Google Finance cho ' + p.currency + ' ngày ' + rptDateVn_(p.rateDate) + '. Hãy nhập tay.');
    var r = fxStore_(user, p.currency, p.rateDate, g.rateE4, 'GOOGLE', 'Google Finance, giá đóng cửa ngày ' + g.date);
    return { id: r.id, rate: fxText_(g.rateE4), quoteDate: g.date };
}
// Chênh lệch tỷ giá đã thực hiện của một lần phân bổ (VND, dương = lãi): số nguyên tệ × (tỷ giá ngày thu/chi − tỷ giá ngày ghi nhận chứng từ), thu hộ chiều ngược lại với chi.
function fxAllocDiff_(pay, doc, amount, rows) {
    if (!pay || pay.currency === BASE_CUR_ || !amount)
        return { diff: 0, payE4: 0, docE4: 0 };
    var f1 = pay.fxRateE4 > 0 ? null : fxFind_(pay.currency, pay.effectiveDate, rows), f2 = doc.fxRateE4 > 0 ? null : fxFind_(pay.currency, doc.docDate, rows);
    var pr = pay.fxRateE4 > 0 ? pay.fxRateE4 : (f1 ? f1.rateE4 : 0), dr = doc.fxRateE4 > 0 ? doc.fxRateE4 : (f2 ? f2.rateE4 : 0);
    if (!pr || !dr)
        return { diff: 0, payE4: pr, docE4: dr };
    var dec = (currencyMap_()[pay.currency] || { decimals: 0 }).decimals, pb = fxToBase_(amount, dec, pr), db = fxToBase_(amount, dec, dr);
    return { diff: pay.direction === 'IN' ? pb - db : db - pb, payE4: pr, docE4: dr };
}
// Trước khi phân bổ: bảo đảm có tỷ giá của ngày phiếu và ngày chứng từ (tự lấy Google nếu thiếu). Thiếu thì không chặn phân bổ, chênh lệch ghi 0 và cảnh báo.
function fxPrepAlloc_(user, p) {
    try {
        var pay = repoFind_('Payment', p.paymentId);
        if (!pay || pay.currency === BASE_CUR_)
            return;
        if (!(pay.fxRateE4 > 0))
            fxResolve_(user, pay.currency, pay.effectiveDate);
        (p.items || []).forEach(function (it) {
            var l = repoFind_('DebtLine', it.debtLineId), d = l ? repoFind_('DebtDoc', l.docId) : null;
            if (d && d.currency === pay.currency && !(d.fxRateE4 > 0))
                fxResolve_(user, d.currency, d.docDate);
        });
    }
    catch (e) { }
}
// Gắn tỷ giá cho chứng từ chưa có (tạo từ PO/Cost, hàng loạt, XML...): lấy theo ngày chứng từ trong bảng tỷ giá.
function fxStampFields_(d, rows) {
    if (!d || d.currency === BASE_CUR_ || d.fxRateE4 > 0)
        return {};
    var f = fxFind_(d.currency, d.docDate, rows);
    if (!f)
        return {};
    return { fxRateE4: f.rateE4, fxSource: f.source, totalBaseMinor: fxToBase_(d.totalGrossMinor || 0, (currencyMap_()[d.currency] || { decimals: 0 }).decimals, f.rateE4) };
}
function fxPrepDoc_(user, p) {
    try {
        var d = p && p.id ? repoFind_('DebtDoc', p.id) : null;
        if (d && d.currency !== BASE_CUR_ && !(d.fxRateE4 > 0) && isDate_(d.docDate))
            fxResolve_(user, d.currency, d.docDate);
    }
    catch (e) { }
}
// Điền tỷ giá cho các chứng từ ngoại tệ cũ chưa có (tối đa 15 ngày/tệ cần tra Google mỗi lần chạy; chạy lại để làm tiếp).
function fxBackfill_(user, req) {
    fxEntryGate_(user, 'fx.backfill');
    var docs = repoValid_('DebtDoc').filter(function (d) { return d.currency !== BASE_CUR_ && !(d.fxRateE4 > 0) && isDate_(d.docDate) && d.status !== 'DELETED'; }), keys = {}, lookups = 0, unresolved = {};
    docs.forEach(function (d) { keys[d.currency + '|' + d.docDate] = [d.currency, d.docDate]; });
    Object.keys(keys).sort().forEach(function (k) {
        var cur = keys[k][0], date = keys[k][1];
        if (fxFind_(cur, date))
            return;
        if (lookups >= 15) {
            unresolved[k] = 1;
            return;
        }
        lookups++;
        try {
            fxResolve_(user, cur, date);
        }
        catch (e) {
            unresolved[k] = 1;
        }
    });
    var res = runTx_(user, { requestId: req.requestId, action: 'fx.backfill', payload: req.payload || {}, failAt: req.failAt }, function (tx) {
        var rows = tx.rows('FxRate'), n = 0;
        var closed = {}, skippedClosed = 0;
        tx.rows('Period').forEach(function (pr) { if (pr.status === 'CLOSED')
            closed[pr.id] = 1; });
        tx.rows('DebtDoc').forEach(function (d) {
            if (d.isDeleted === 1 || d.currency === BASE_CUR_ || d.fxRateE4 > 0)
                return;
            if (closed[d.periodId || monthOf_(d.postingDate || d.docDate || '')]) {
                skippedClosed++;
                return;
            }
            var f = fxStampFields_(d, rows);
            if (f.fxRateE4) {
                tx.update('DebtDoc', d.id, f);
                n++;
            }
        });
        return { result: { stamped: n, skippedClosed: skippedClosed }, audit: [{ entityType: 'DebtDoc', entityId: '-', action: 'fx.backfill', diff: { stamped: n, skippedClosed: skippedClosed } }] };
    });
    return { stamped: res.stamped, skippedClosed: res.skippedClosed, candidates: docs.length, lookups: lookups, remaining: Object.keys(unresolved).length, message: Object.keys(unresolved).length ? 'Còn ' + Object.keys(unresolved).length + ' ngày chưa có tỷ giá (Google không trả hoặc quá giới hạn lượt): nhập tay hoặc chạy lại.' : '' };
}
// Công nợ ngoại tệ còn lại tại ngày chốt, quy đổi theo tỷ giá ghi nhận và tỷ giá gần nhất không sau ngày chốt (dùng cho R14 và bút toán đánh giá lại).
// ===== R36: GIÁ TRỊ GHI SỔ VND của công nợ =====
// Mỗi dòng chứng từ còn nợ = số còn nợ NGUYÊN TỆ × tỷ giá ĐÃ LƯU trên chính chứng từ lúc ghi nhận (fxRateE4); VND giữ nguyên. Chứng từ cũ chưa có tỷ giá: dùng tỷ giá bảng Tỷ giá theo ngày chứng từ; vẫn không có → trả null (không tính, báo thiếu).
// Tiền thu/chi chưa phân bổ (ứng trước) quy đổi theo tỷ giá/số tiền VND đã lưu trên chính phiếu. Không dùng tỷ giá ngày chốt (đánh giá lại cuối kỳ là việc của R14).
function bookCtx_() { return { rates: repoValid_('FxRate'), cm: currencyMap_(), dr: {} }; }
function bookDocRate_(bc, d) {
    var v = bc.dr[d.id];
    if (v === undefined)
        v = bc.dr[d.id] = d.fxRateE4 > 0 ? d.fxRateE4 : ((fxFind_(d.currency, d.docDate, bc.rates) || {}).rateE4 || 0);
    return v;
}
function bookOfLine_(bc, d, minor) {
    if (d.currency === BASE_CUR_)
        return minor;
    var e4 = bookDocRate_(bc, d);
    return e4 > 0 ? fxToBase_(minor, (bc.cm[d.currency] || { decimals: 0 }).decimals, e4) : null;
}
function bookOfAdv_(bc, x, unalloc) {
    if (x.currency === BASE_CUR_)
        return unalloc;
    if (x.amountBaseMinor > 0 && x.amountMinor > 0)
        return Number((BigInt(x.amountBaseMinor) * BigInt(unalloc) * BigInt(2) + BigInt(x.amountMinor)) / (BigInt(x.amountMinor) * BigInt(2)));
    var e4 = x.fxRateE4 > 0 ? x.fxRateE4 : ((fxFind_(x.currency, x.effectiveDate, bc.rates) || {}).rateE4 || 0);
    return e4 > 0 ? fxToBase_(unalloc, (bc.cm[x.currency] || { decimals: 0 }).decimals, e4) : null;
}
// Tổng công nợ quy đổi VND theo chiều (AR/AP): out (còn nợ), credit (dòng thanh toán thừa, không trừ vào out), adv (ứng trước), net = out − adv; byCur giữ số nguyên tệ và số quy đổi từng tiền tệ. ronr = ròng phải thu − phải trả.
function bookDebtTotals_(led, filter) {
    filter = filter || {};
    var bc = bookCtx_(), res = { currency: BASE_CUR_, AR: { out: 0, credit: 0, adv: 0, net: 0, byCur: {} }, AP: { out: 0, credit: 0, adv: 0, net: 0, byCur: {} }, net: 0, missing: 0 };
    function cell(dir, cur) { return res[dir].byCur[cur] = res[dir].byCur[cur] || { out: 0, outB: 0, adv: 0, advB: 0 }; }
    led.lines.forEach(function (l) {
        var b = led.bal.byLine[l.id], d = led.docById[l.docId];
        if (!b || !d || b.out === 0 || (filter.partnerId && d.partnerId !== filter.partnerId) || (filter.group && d.businessGroupCode !== filter.group) || (filter.currency && d.currency !== filter.currency))
            return;
        var v = bookOfLine_(bc, d, b.out);
        if (v === null) {
            res.missing++;
            return;
        }
        if (b.out > 0) {
            var c = cell(d.direction, d.currency);
            c.out += b.out;
            c.outB += v;
            res[d.direction].out += v;
        }
        else
            res[d.direction].credit += -v;
    });
    led.payments.forEach(function (x) {
        var b = led.payBal[x.id];
        if (!b || b.unalloc <= 0 || x.status !== 'POSTED' || (filter.partnerId && x.partnerId !== filter.partnerId) || (filter.currency && x.currency !== filter.currency))
            return;
        var v = bookOfAdv_(bc, x, b.unalloc), dir = x.direction === 'IN' ? 'AR' : 'AP';
        if (v === null) {
            res.missing++;
            return;
        }
        var c = cell(dir, x.currency);
        c.adv += b.unalloc;
        c.advB += v;
        res[dir].adv += v;
    });
    ['AR', 'AP'].forEach(function (dir) { res[dir].net = res[dir].out - res[dir].adv; });
    res.net = res.AR.net - res.AP.net;
    return res;
}
function fxRevalLines_(user, asOf, filter) {
    filter = filter || {};
    var led = loadLedger_(user, asOf), rates = repoValid_('FxRate'), agg = {}, miss = 0, noRate = {};
    led.lines.forEach(function (l) {
        var b = led.bal.byLine[l.id], d = led.docById[l.docId];
        if (!b || b.out === 0 || !d || d.currency === BASE_CUR_ || (filter.currency && d.currency !== filter.currency) || (filter.group && d.businessGroupCode !== filter.group))
            return;
        var k = d.direction + '|' + d.currency, a = agg[k] = agg[k] || { dir: d.direction, cur: d.currency, out: 0, orig: 0, now: 0, conv: 0 }, dec = (currencyMap_()[d.currency] || { decimals: 0 }).decimals;
        var dr = d.fxRateE4 > 0 ? d.fxRateE4 : ((fxFind_(d.currency, d.docDate, rates) || {}).rateE4 || 0), cr = (fxNearest_(d.currency, asOf, rates) || {}).rateE4 || 0;
        a.out += b.out;
        if (!cr)
            noRate[d.currency] = 1;
        if (!dr || !cr) {
            miss++;
            return;
        }
        a.conv += b.out;
        a.orig += fxToBase_(b.out, dec, dr);
        a.now += fxToBase_(b.out, dec, cr);
    });
    var items = Object.keys(agg).sort().map(function (k) {
        var a = agg[k], n = fxNearest_(a.cur, asOf, rates);
        a.rateE4 = n ? n.rateE4 : 0;
        a.rateDate = n ? n.rateDate : '';
        a.diff = (a.dir === 'AR' ? 1 : -1) * (a.now - a.orig);
        return a;
    });
    return { items: items, missing: miss, noRate: Object.keys(noRate) };
}
// ===== Quỹ ngoại tệ: tỷ giá xuất theo BÌNH QUÂN GIA QUYỀN DI ĐỘNG =====
// Mỗi tài khoản quỹ ngoại tệ (Catalog CASH_ACCOUNT có tiền tệ khác VND) là một "kho" tiền: số dư đầu kỳ (định giá theo tỷ giá ngày đầu sổ) + phiếu thu (nhập, theo tỷ giá ngày thực thu) − phiếu chi (xuất theo bình quân di động).
// Phiếu chi từ quỹ ngoại tệ ghi sổ theo tỷ giá bình quân tại thời điểm chi (không phát sinh lãi/lỗ trên quỹ); chênh lệch với tỷ giá ghi nợ của hóa đơn là chênh lệch đã thực hiện (xử lý ở phân bổ).
// Thứ tự: theo ngày hiệu lực; cùng ngày thu trước chi; sau đó theo số phiếu. Chọn DAY ở Config fx.outMethod để quay về tỷ giá theo ngày chi.
function fxOutMethod_() { return cfgGet_('fx.outMethod', 'MOVING_AVG') === 'DAY' ? 'DAY' : 'MOVING_AVG'; }
function fxAvgE4_(baseMinor, foreignMinor, dec) {
    var den = BigInt(foreignMinor), num = BigInt(baseMinor) * BigInt(Math.pow(10, dec)) * BigInt(10000);
    return Number((num * BigInt(2) + den) / (den * BigInt(2)));
}
var POOL_EXTRA_ = null; // R35: danh sách phiếu giả định (lô nhập hàng loạt chưa ghi) để kiểm vượt quỹ ngoại tệ
function fxPoolRun_(include, asOf, includeX, includeE) {
    var cmap = currencyMap_(), rates = repoValid_('FxRate'), ls = ledgerStart_(), res = { accounts: {}, byPayment: {}, byTransfer: {}, byExchange: {}, byAdjust: {} };
    repoValid_('Catalog').forEach(function (c) {
        var a = c.catalogType === 'CASH_ACCOUNT' ? safeJson_(c.attrsJson, {}) : null;
        if (a && a.currency && a.currency !== BASE_CUR_ && cmap[a.currency])
            res.accounts[c.code] = { code: c.code, name: c.name, currency: a.currency, decimals: cmap[a.currency].decimals, openingF: 0, openingB: 0, openingE4: 0, openingRateMissing: false, incomplete: false, inF: 0, inB: 0, outF: 0, outB: 0, xInF: 0, xInB: 0, xOutF: 0, xOutB: 0, eInF: 0, eInB: 0, eOutF: 0, eOutB: 0, aInF: 0, aInB: 0, aOutF: 0, aOutB: 0, balF: 0, balB: 0, events: [], warnings: [] };
    });
    repoValid_('OpeningBalance').forEach(function (o) { var a = o.kind === 'CASH' ? res.accounts[o.cashAccountCode] : null; if (a)
        a.openingF += o.amountMinor; });
    Object.keys(res.accounts).forEach(function (code) {
        var a = res.accounts[code];
        if (a.openingF) {
            var f = fxFind_(a.currency, ls, rates);
            if (f) {
                a.openingE4 = f.rateE4;
                a.openingB = fxToBase_(a.openingF, a.decimals, f.rateE4);
            }
            else {
                a.openingRateMissing = true;
                a.warnings.push('Chưa có tỷ giá ' + a.currency + ' tại ngày đầu sổ ' + rptDateVn_(ls) + ': số dư đầu kỳ chưa được định giá.');
            }
        }
        a.balF = a.openingF;
        a.balB = a.openingB;
    });
    var evs = [];
    repoValid_('Payment').forEach(function (x) { if (x.status === 'POSTED' && !(include && include.id === x.id))
        evs.push({ k: 'P', x: x }); });
    if (include)
        evs.push({ k: 'P', x: include });
    if (POOL_EXTRA_)
        POOL_EXTRA_.forEach(function (x) { evs.push({ k: 'P', x: x }); });
    xferRows_().forEach(function (x) { if (x.status === 'POSTED' && !(includeX && includeX.id === x.id))
        evs.push({ k: 'X', x: x }); });
    if (includeX)
        evs.push({ k: 'X', x: includeX });
    exchRows_().forEach(function (x) { if (x.status === 'POSTED' && !(includeE && includeE.id === x.id))
        evs.push({ k: 'E', x: x }); });
    if (includeE)
        evs.push({ k: 'E', x: includeE });
    // Xử lý chênh lệch kiểm kê quỹ ngoại tệ: thiếu xuất theo bình quân; thừa nhập theo tỷ giá bình quân của quỹ (R35; biên bản cũ giữ tỷ giá đã lưu).
    countRows_().forEach(function (x) { if (x.status === 'CONFIRMED' && x.adjustStatus === 'POSTED' && x.diffMinor !== 0)
        evs.push({ k: 'A', x: Object.assign({}, x, { effectiveDate: x.countDate }) }); });
    evs = evs.filter(function (e) {
        var x = e.x;
        if (CASH_EXCL_ && CASH_EXCL_[x.id])
            return false;
        if (asOf && x.effectiveDate > asOf)
            return false;
        if (e.k === 'E') {
            var ea = res.accounts[x.foreignAccount];
            return !!ea && ea.currency === x.currency;
        }
        if (e.k === 'A') {
            var aa = res.accounts[x.accountCode];
            return !!aa && aa.currency === x.currency;
        }
        if (e.k === 'X') {
            var f = res.accounts[x.fromAccount], t = res.accounts[x.toAccount];
            return !!f && !!t && f.currency === x.currency && t.currency === x.currency;
        }
        var a = res.accounts[x.cashAccountCode];
        return !!a && x.currency === a.currency;
    });
    var rank = function (e) { return e.k === 'A' ? 3 : e.k === 'X' ? 1 : e.k === 'E' ? (e.x.kind === 'BUY' ? 0 : 2) : e.x.direction === 'IN' ? 0 : 2; };
    evs.sort(function (a, b) { return cmpStr_(a.x.effectiveDate, b.x.effectiveDate) || rank(a) - rank(b) || cmpStr_(a.x.payNo || a.x.transferNo || a.x.exchangeNo || a.x.countNo || a.x.id, b.x.payNo || b.x.transferNo || b.x.exchangeNo || b.x.countNo || b.x.id); });
    // Xuất F khỏi quỹ a theo bình quân; thiếu số dư/dữ liệu thì dùng tỷ giá ngày (fallback) và cảnh báo. Trả {e4, B, fb}.
    function outLeg(a, F, dayE4, storedBase, label) {
        a._over = a.balF < F; // R35: xuất vượt số dư quỹ (khác với thiếu dữ liệu bình quân) — dùng để chặn chi vượt quỹ tiền mặt
        var avgOk = a.balF >= F && a.balF > 0 && a.balB > 0 && !a.incomplete && !a.openingRateMissing, e4 = 0, B, fb = false;
        if (avgOk) {
            if (F === a.balF) {
                B = a.balB;
                e4 = fxAvgE4_(B, F, a.decimals);
            }
            else {
                e4 = fxAvgE4_(a.balB, a.balF, a.decimals);
                B = fxToBase_(F, a.decimals, e4);
            }
            a.balF -= F;
            a.balB -= B;
        }
        else {
            fb = true;
            e4 = dayE4;
            B = dayE4 ? fxToBase_(F, a.decimals, dayE4) : (storedBase || 0);
            a.warnings.push(label + ' ' + (a.balF < F ? 'vượt số dư quỹ ' + fmtMoney_(a.balF, a.currency) : 'quỹ chưa đủ dữ liệu bình quân') + ': tạm ghi theo tỷ giá ngày.');
            var oldF = a.balF, take = Math.min(F, oldF);
            a.balB = oldF > 0 ? (take === oldF ? 0 : a.balB - Math.round(a.balB * take / oldF)) : 0;
            a.balF = Math.max(0, oldF - F);
        }
        return { e4: e4, B: B, fb: fb };
    }
    function push(a, e, extra) { if (extra && extra.fallback)
        extra.over = !!a._over; a.events.push(Object.assign({ date: e.x.effectiveDate, payId: e.x.id, payNo: e.x.payNo || e.x.transferNo || e.x.exchangeNo || e.x.countNo || '', balF: a.balF, balB: a.balB, avgE4: a.balF > 0 && a.balB > 0 ? fxAvgE4_(a.balB, a.balF, a.decimals) : 0 }, extra)); }
    evs.forEach(function (e) {
        var x = e.x, F = e.k === 'E' ? x.foreignMinor : e.k === 'A' ? Math.abs(x.diffMinor) : x.amountMinor;
        if (e.k === 'A') {
            var aa = res.accounts[x.accountCode];
            if (x.diffMinor < 0) {
                var ao = outLeg(aa, F, (fxFind_(x.currency, x.effectiveDate, rates) || {}).rateE4 || 0, 0, 'Xử lý kiểm kê ' + (x.countNo || x.id));
                aa.aOutF += F;
                aa.aOutB += ao.B;
                res.byAdjust[x.id] = { rateE4: ao.e4, baseMinor: ao.B, fallback: ao.fb };
                push(aa, e, { direction: 'AOUT', foreignMinor: F, baseMinor: ao.B, fallback: ao.fb });
            }
            else {
                // R35 (chị chốt 26/10, mục 7B): quỹ thừa nhập theo tỷ giá BÌNH QUÂN của quỹ tại thời điểm đó (không phát sinh lãi/lỗ trên quỹ). Chỉ khi quỹ chưa có bình quân (hết tiền / chưa định giá) mới dùng tỷ giá ngày kiểm kê.
                // Biên bản đã xử lý trước R35 có adjustRateE4 > 0 giữ nguyên tỷ giá đã lưu.
                var avgOk = aa.balF > 0 && aa.balB > 0 && !aa.incomplete && !aa.openingRateMissing,
                    ar = x.adjustRateE4 > 0 ? x.adjustRateE4 : (avgOk ? fxAvgE4_(aa.balB, aa.balF, aa.decimals) : ((fxFind_(x.currency, x.effectiveDate, rates) || {}).rateE4 || 0)), ab = ar ? fxToBase_(F, aa.decimals, ar) : 0;
                if (!ar) {
                    aa.incomplete = true;
                    aa.warnings.push('Xử lý thừa quỹ ' + (x.countNo || x.id) + ' chưa có bình quân và chưa có tỷ giá ngày kiểm kê.');
                }
                aa.balF += F;
                aa.balB += ab;
                aa.aInF += F;
                aa.aInB += ab;
                res.byAdjust[x.id] = { rateE4: ar, baseMinor: ab, fallback: false };
                push(aa, e, { direction: 'AIN', foreignMinor: F, baseMinor: ab, fallback: false });
            }
            return;
        }
        if (e.k === 'E') {
            var xa = res.accounts[x.foreignAccount];
            if (x.kind === 'BUY') {
                xa.balF += F;
                xa.balB += x.baseMinor;
                xa.eInF += F;
                xa.eInB += x.baseMinor;
                res.byExchange[x.id] = { rateE4: x.rateE4 || 0, baseMinor: x.baseMinor, fallback: false };
                push(xa, e, { direction: 'EBUY', foreignMinor: F, baseMinor: x.baseMinor, fallback: false, peer: x.baseAccount });
            }
            else {
                var eo = outLeg(xa, F, (fxFind_(x.currency, x.effectiveDate, rates) || {}).rateE4 || 0, x.costBaseMinor, 'Bán ngoại tệ ' + (x.exchangeNo || x.id));
                xa.eOutF += F;
                xa.eOutB += eo.B;
                res.byExchange[x.id] = { rateE4: eo.e4, baseMinor: eo.B, fallback: eo.fb };
                push(xa, e, { direction: 'ESELL', foreignMinor: F, baseMinor: eo.B, fallback: eo.fb, peer: x.baseAccount });
            }
            return;
        }
        if (e.k === 'X') {
            var fa = res.accounts[x.fromAccount], ta = res.accounts[x.toAccount], dE4 = (fxFind_(x.currency, x.effectiveDate, rates) || {}).rateE4 || 0, o = outLeg(fa, F, dE4, x.baseMinor, 'Chuyển quỹ ' + (x.transferNo || x.id));
            ta.balF += F;
            ta.balB += o.B;
            fa.xOutF += F;
            fa.xOutB += o.B;
            ta.xInF += F;
            ta.xInB += o.B;
            res.byTransfer[x.id] = { rateE4: o.e4, baseMinor: o.B, fallback: o.fb };
            push(fa, e, { direction: 'XOUT', foreignMinor: F, baseMinor: o.B, fallback: o.fb, peer: x.toAccount });
            push(ta, e, { direction: 'XIN', foreignMinor: F, baseMinor: o.B, fallback: o.fb, peer: x.fromAccount });
            return;
        }
        var a = res.accounts[x.cashAccountCode], dayE4 = x.fxRateE4 > 0 ? x.fxRateE4 : ((fxFind_(x.currency, x.effectiveDate, rates) || {}).rateE4 || 0), B;
        if (x.direction === 'IN') {
            B = dayE4 ? (x.fxRateE4 > 0 && x.amountBaseMinor > 0 ? x.amountBaseMinor : fxToBase_(F, a.decimals, dayE4)) : 0;
            if (!dayE4) {
                a.incomplete = true;
                a.warnings.push('Phiếu thu ' + (x.payNo || x.id) + ' chưa có tỷ giá: quỹ chưa tính được bình quân.');
            }
            a.balF += F;
            a.balB += B;
            a.inF += F;
            a.inB += B;
            push(a, e, { direction: 'IN', foreignMinor: F, baseMinor: B, fallback: false });
        }
        else {
            var o2 = outLeg(a, F, dayE4, x.amountBaseMinor, 'Phiếu chi ' + (x.payNo || x.id));
            a.outF += F;
            a.outB += o2.B;
            res.byPayment[x.id] = { accountCode: a.code, rateE4: o2.e4, baseMinor: o2.B, fallback: o2.fb };
            push(a, e, { direction: 'OUT', foreignMinor: F, baseMinor: o2.B, fallback: o2.fb });
        }
    });
    Object.keys(res.accounts).forEach(function (code) { var a = res.accounts[code]; a.avgE4 = a.balF > 0 && a.balB > 0 ? fxAvgE4_(a.balB, a.balF, a.decimals) : 0; });
    return res;
}
function fxPoolReport_(user, req) {
    fxEntryGate_(user, 'fx.entry.read');
    var p = req.payload || {}, asOf = isDate_(p.asOf) ? p.asOf : todayVn_(), run = fxPoolRun_(null, asOf), rates = repoValid_('FxRate'), maOn = fxOutMethod_() === 'MOVING_AVG', pays = byId_(repoValid_('Payment')), xfers = byId_(xferRows_()), exs = byId_(exchRows_()), items = [];
    Object.keys(run.accounts).sort().forEach(function (code) {
        var a = run.accounts[code], n = fxNearest_(a.currency, asOf, rates), mism = [];
        a.events.forEach(function (e) {
            if (e.direction === 'XIN' || e.direction === 'EBUY')
                return;
            if (e.direction === 'ESELL') {
                var ce = run.byExchange[e.payId], se = exs[e.payId];
                if (ce && !ce.fallback && se && se.costBaseMinor !== ce.baseMinor)
                    mism.push({ payId: e.payId, payNo: e.payNo, kind: 'EXCH', date: e.date, foreignMinor: e.foreignMinor, storedRate: fxText_(se.costBaseMinor && se.foreignMinor ? fxAvgE4_(se.costBaseMinor, se.foreignMinor, a.decimals) : 0), newRate: fxText_(ce.rateE4), storedBase: se.costBaseMinor || 0, newBase: ce.baseMinor });
                return;
            }
            var isX = e.direction === 'XOUT', c = isX ? run.byTransfer[e.payId] : run.byPayment[e.payId], s = isX ? xfers[e.payId] : pays[e.payId];
            // Phiếu chi chỉ được tính lại khi đang dùng bình quân VÀ phiếu đó đã ghi theo bình quân (fxSource MOVING_AVG): phiếu ghi theo tỷ giá ngày chi giữ nguyên.
            if (!isX && (!maOn || !s || s.fxSource !== 'MOVING_AVG'))
                return;
            if (c && !c.fallback && s && (s.fxRateE4 !== c.rateE4 || s.amountBaseMinor !== c.baseMinor)) {
                var sb = isX ? s.baseMinor : s.amountBaseMinor;
                if (isX ? (s.rateE4 !== c.rateE4 || s.baseMinor !== c.baseMinor) : true)
                    mism.push({ payId: e.payId, payNo: e.payNo, kind: isX ? 'XFER' : 'PAY', date: e.date, foreignMinor: e.foreignMinor, storedRate: fxText_(isX ? s.rateE4 : s.fxRateE4), newRate: fxText_(c.rateE4), storedBase: sb || 0, newBase: c.baseMinor });
            }
        });
        var closeBase = a.balF > 0 && n && !a.openingRateMissing && !a.incomplete ? fxToBase_(a.balF, a.decimals, n.rateE4) : 0;
        items.push({ code: a.code, name: a.name, currency: a.currency, decimals: a.decimals, openingF: a.openingF, openingB: a.openingB, inF: a.inF, inB: a.inB, outF: a.outF, outB: a.outB, xInF: a.xInF, xOutF: a.xOutF, xInB: a.xInB, xOutB: a.xOutB, eInF: a.eInF, eOutF: a.eOutF, eInB: a.eInB, eOutB: a.eOutB, balF: a.balF, balB: a.balB, avgRate: fxText_(a.avgE4), closingRate: n ? fxText_(n.rateE4) : '', closingRateDate: n ? n.rateDate : '',
            closingBase: closeBase, revalDiff: closeBase ? closeBase - a.balB : 0, warnings: a.warnings.slice(0, 20), mismatches: mism, events: p.detail === a.code ? a.events.map(function (e) { return Object.assign({}, e, { avgRate: fxText_(e.avgE4) }); }) : undefined });
    });
    return { items: items, method: fxOutMethod_(), asOf: asOf };
}
// Tính lại tỷ giá của các phiếu chi từ quỹ ngoại tệ khi có phiếu thu/đầu kỳ được bổ sung lùi ngày (bình quân thay đổi). Bỏ qua phiếu/phân bổ thuộc kỳ đã khóa.
function fxPoolRecalc_(user, req) {
    fxEntryGate_(user, 'fx.backfill');
    return runTx_(user, { requestId: req.requestId, action: 'fx.poolRecalc', payload: req.payload || {}, failAt: req.failAt }, function (tx) {
        var run = fxPoolRun_(null, null), rates = tx.rows('FxRate'), closed = {}, changed = 0, skipped = 0, allocs = 0, list = [];
        tx.rows('Period').forEach(function (pr) { if (pr.status === 'CLOSED')
            closed[pr.id] = 1; });
        var docs = byId_(tx.rows('DebtDoc')), allocBy = groupBy_(tx.rows('Allocation'), function (a) { return a.paymentId; });
        var maOn = fxOutMethod_() === 'MOVING_AVG';
        tx.rows('Payment').forEach(function (x) {
            var c = run.byPayment[x.id];
            if (!maOn || x.fxSource !== 'MOVING_AVG' || !c || c.fallback || x.isDeleted === 1 || x.status !== 'POSTED' || (x.fxRateE4 === c.rateE4 && x.amountBaseMinor === c.baseMinor))
                return;
            var as = allocBy[x.id] || [];
            if (closed[x.periodId || monthOf_(x.effectiveDate)] || as.some(function (a) { return closed[a.periodId || monthOf_(a.effectiveDate)]; })) {
                skipped++;
                return;
            }
            var np = Object.assign({}, x, { fxRateE4: c.rateE4, amountBaseMinor: c.baseMinor });
            tx.update('Payment', x.id, { fxRateE4: c.rateE4, fxSource: 'MOVING_AVG', amountBaseMinor: c.baseMinor });
            as.forEach(function (a) {
                var d = docs[a.docId];
                if (!d)
                    return;
                var fx = fxAllocDiff_(np, d, a.amountMinor, rates);
                if (fx.payE4 && fx.docE4 && (fx.payE4 !== a.fxPayRateE4 || fx.diff !== a.fxDiffBaseMinor)) {
                    tx.update('Allocation', a.id, { fxPayRateE4: fx.payE4, fxDocRateE4: fx.docE4, fxDiffBaseMinor: fx.diff });
                    allocs++;
                }
            });
            changed++;
            if (list.length < 100)
                list.push({ payNo: x.payNo, from: fxText_(x.fxRateE4), to: fxText_(c.rateE4) });
        });
        tx.rows('CashTransfer').forEach(function (x) {
            var c = run.byTransfer[x.id];
            if (!c || c.fallback || x.isDeleted === 1 || x.status !== 'POSTED' || (x.rateE4 === c.rateE4 && x.baseMinor === c.baseMinor))
                return;
            if (closed[x.periodId || monthOf_(x.effectiveDate)]) {
                skipped++;
                return;
            }
            tx.update('CashTransfer', x.id, { rateE4: c.rateE4, baseMinor: c.baseMinor });
            changed++;
            if (list.length < 100)
                list.push({ payNo: x.transferNo, from: fxText_(x.rateE4), to: fxText_(c.rateE4) });
        });
        tx.rows('CashExchange').forEach(function (x) {
            var c = run.byExchange[x.id];
            if (!c || c.fallback || x.isDeleted === 1 || x.status !== 'POSTED' || x.kind !== 'SELL' || x.costBaseMinor === c.baseMinor)
                return;
            if (closed[x.periodId || monthOf_(x.effectiveDate)]) {
                skipped++;
                return;
            }
            tx.update('CashExchange', x.id, { costBaseMinor: c.baseMinor, diffMinor: x.baseMinor - c.baseMinor });
            changed++;
            if (list.length < 100)
                list.push({ payNo: x.exchangeNo, from: fmtMoney_(x.diffMinor, 'VND'), to: fmtMoney_(x.baseMinor - c.baseMinor, 'VND') });
        });
        // R35 (chị chốt 26/10, mục 3B): phiếu bị ảnh hưởng nằm trong kỳ đã khóa thì KHÔNG tính lại một phần — phải mở khóa kỳ theo quy trình rồi tính lại. Ném lỗi trước khi commit nên không đổi dữ liệu.
        if (skipped > 0)
            throw err_('PERIOD_CLOSED', 'Có ' + skipped + ' chứng từ bị ảnh hưởng nằm trong kỳ đã khóa. Hãy mở khóa kỳ liên quan theo quy trình, rồi tính lại bình quân (không tính lại một phần).');
        return { result: { changed: changed, allocations: allocs, skippedClosed: skipped, items: list }, audit: [{ entityType: 'Payment', entityId: '-', action: 'fx.poolRecalc', diff: { changed: changed, allocations: allocs, skippedClosed: skipped } }] };
    });
}
// ===== Chuyển nội bộ giữa hai quỹ ngoại tệ cùng tiền tệ =====
// Quỹ chuyển đi xuất theo bình quân di động; quỹ nhận nhập đúng giá trị VND đó (không phát sinh chênh lệch tỷ giá). Quy trình: nháp → ghi nhận (người khác người lập) → có thể đảo.
// Đọc an toàn: trang tính chưa được tạo (chưa chạy ensureSchema sau khi cập nhật) coi như chưa có phiếu chuyển quỹ.
function xferRows_() { try {
    return repoValid_('CashTransfer');
}
catch (e) {
    return [];
} }
function xferOut_(x) { return { id: x.id, version: x.version, transferNo: x.transferNo || '', currency: x.currency, fromAccount: x.fromAccount, toAccount: x.toAccount, amountMinor: x.amountMinor, effectiveDate: x.effectiveDate, status: x.status, periodId: x.periodId || '', rate: fxText_(x.rateE4), baseMinor: x.baseMinor || 0, reversedDate: x.reversedDate || '', note: x.note || '', createdBy: x.createdBy || '' }; }
function xferGate_(user, perm) {
    requirePerm_(user, perm);
    if (!fxCompanyWide_(user))
        throw err_('FORBIDDEN', 'Chuyển quỹ là số liệu toàn công ty: chỉ tài khoản có phạm vi TOÀN BỘ đối tác và nhóm nghiệp vụ mới được thao tác.');
}
function xferList_(user, req) {
    xferGate_(user, 'read');
    var p = req.payload || {}, rows = xferRows_().filter(function (x) { return x.status !== 'DELETED' && (!p.status || x.status === p.status) && (!p.account || x.fromAccount === p.account || x.toAccount === p.account); });
    rows.sort(function (a, b) { return cmpStr_(b.effectiveDate, a.effectiveDate) || cmpStr_(b.transferNo || b.id, a.transferNo || a.id); });
    var pg = paginate_(rows, p.page, p.pageSize || 50);
    return { items: pg.items.map(xferOut_), total: pg.total, page: pg.page, pageSize: pg.pageSize };
}
function xferSave_(user, req) {
    xferGate_(user, 'payment.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'transfer.save', payload: p, failAt: req.failAt }, function (tx) {
        var errs = [];
        function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
        var existing = p.id ? tx.find('CashTransfer', p.id) : null;
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu chuyển quỹ.');
        if (existing && existing.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ sửa được phiếu nháp. Phiếu đã ghi nhận phải đảo.');
        if (existing && existing.createdBy !== user.id && user.role !== 'APPROVER')
            throw err_('FORBIDDEN', 'Chỉ người lập hoặc người duyệt được sửa bản nháp.');
        var accs = {};
        tx.rows('Catalog').forEach(function (c) { if (c.catalogType === 'CASH_ACCOUNT' && c.active === 1)
            accs[c.code] = safeJson_(c.attrsJson, {}); });
        var from = accs[p.fromAccount], to = accs[p.toAccount];
        if (!from)
            E('fromAccount', 'REQUIRED', 'Chọn quỹ chuyển đi.');
        if (!to)
            E('toAccount', 'REQUIRED', 'Chọn quỹ nhận.');
        if (from && to) {
            if (p.fromAccount === p.toAccount)
                E('toAccount', 'SAME_ACCOUNT', 'Quỹ nhận phải khác quỹ chuyển đi.');
            if (!from.currency || from.currency === BASE_CUR_ || from.currency !== to.currency)
                E('toAccount', 'CURRENCY_MISMATCH', 'Hai quỹ phải cùng một ngoại tệ (khác VND). Đổi tiền giữa hai ngoại tệ không phải chuyển nội bộ.');
        }
        if (!Number.isSafeInteger(p.amountMinor) || p.amountMinor <= 0)
            E('amountMinor', 'AMOUNT_INVALID', 'Số tiền phải là số nguyên lớn hơn 0.');
        else if (p.amountMinor > MONEY_MAX)
            E('amountMinor', 'AMOUNT_OVERFLOW', 'Số tiền quá lớn.');
        if (!isDate_(p.effectiveDate))
            E('effectiveDate', 'DATE_INVALID', 'Nhập ngày chuyển hợp lệ.');
        else if (p.effectiveDate < ledgerStart_())
            E('effectiveDate', 'DATE_BEFORE_LEDGER_START', 'Ngày trước ngày đầu sổ ' + ledgerStart_() + '.');
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        var fields = { currency: from.currency, fromAccount: p.fromAccount, toAccount: p.toAccount, amountMinor: p.amountMinor, effectiveDate: p.effectiveDate, note: maxStr_(p.note, 500), status: 'DRAFT' };
        var row;
        if (existing)
            row = tx.update('CashTransfer', existing.id, fields, p.ifVersion);
        else {
            var no = 'CQ-' + p.effectiveDate.slice(0, 4) + '-' + ('000000' + tx.nextSeq('seq.CQ.' + p.effectiveDate.slice(0, 4))).slice(-6);
            row = tx.insert('CashTransfer', Object.assign({ transferNo: no, rateE4: 0, baseMinor: 0, periodId: '', postingDate: '', reversedDate: '' }, fields));
        }
        return { result: { id: row.id, status: 'DRAFT', transferNo: row.transferNo || (existing && existing.transferNo) || '' }, audit: [{ entityType: 'CashTransfer', entityId: row.id, action: existing ? 'transfer.update' : 'transfer.create', diff: { from: p.fromAccount, to: p.toAccount, amountMinor: p.amountMinor } }] };
    });
}
function xferDelete_(user, req) {
    xferGate_(user, 'payment.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'transfer.delete', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashTransfer', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu chuyển quỹ.');
        if (x.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ xóa được phiếu nháp.');
        if (x.createdBy !== user.id && user.role !== 'APPROVER')
            throw err_('FORBIDDEN', 'Chỉ người lập hoặc người duyệt được xóa bản nháp.');
        tx.update('CashTransfer', x.id, { status: 'DELETED', isDeleted: 1 }, p.ifVersion);
        return { result: { status: 'DELETED' }, audit: [{ entityType: 'CashTransfer', entityId: x.id, action: 'transfer.delete', diff: null }] };
    });
}
function xferPost_(user, req) {
    xferGate_(user, 'payment.approve');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'transfer.post', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashTransfer', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu chuyển quỹ.');
        if (x.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ ghi nhận được phiếu nháp.');
        if (x.createdBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập không được tự ghi nhận.');
        assertCashNotOverdrawn_(x.fromAccount, { xfer: Object.assign({}, x, { status: 'POSTED' }) }, 'Phiếu chuyển quỹ ' + (x.transferNo || ''));
        var periodId = assertPeriodOpen_(tx, x.effectiveDate), run = fxPoolRun_(null, null, Object.assign({}, x, { status: 'POSTED' })), c = run.byTransfer[x.id];
        if (!c)
            throw err_('VALIDATION_FAILED', 'Quỹ không hợp lệ hoặc đã ngừng sử dụng.');
        tx.update('CashTransfer', x.id, { status: 'POSTED', periodId: periodId, postingDate: x.effectiveDate, rateE4: c.rateE4, baseMinor: c.baseMinor }, p.ifVersion);
        var warn = c.fallback ? (run.accounts[x.fromAccount].warnings.slice(-2)) : [];
        return { result: { status: 'POSTED', periodId: periodId, rate: fxText_(c.rateE4), baseMinor: c.baseMinor, fallback: c.fallback, warnings: warn }, audit: [{ entityType: 'CashTransfer', entityId: x.id, action: 'transfer.post', diff: { rateE4: c.rateE4, baseMinor: c.baseMinor, fallback: c.fallback } }] };
    });
}
function xferReverse_(user, req) {
    xferGate_(user, 'payment.reverse');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'transfer.reverse', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashTransfer', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu chuyển quỹ.');
        if (x.status !== 'POSTED')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ đảo được phiếu đã ghi nhận.');
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do đảo.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do đảo.' }]);
        var date = p.date || todayVn_();
        if (!isDate_(date) || date < x.effectiveDate)
            throw err_('VALIDATION_FAILED', 'Ngày đảo không hợp lệ (không trước ngày chuyển).');
        assertCashNotOverdrawn_(x.toAccount, { excl: x.id }, 'Đảo phiếu chuyển quỹ ' + (x.transferNo || ''));
        assertPeriodOpen_(tx, date);
        tx.update('CashTransfer', x.id, { status: 'REVERSED', reversedDate: date, note: maxStr_((x.note ? x.note + ' | ' : '') + 'Đảo: ' + p.reason, 500) }, p.ifVersion);
        return { result: { status: 'REVERSED' }, audit: [{ entityType: 'CashTransfer', entityId: x.id, action: 'transfer.reverse', diff: { reason: p.reason } }] };
    });
}
// ===== Mua / bán ngoại tệ (đổi giữa quỹ ngoại tệ và quỹ VND) =====
// BÁN: quỹ ngoại tệ xuất theo bình quân di động (giá vốn), quỹ VND thu số tiền thực nhận; chênh lệch = thu − giá vốn là lãi/lỗ tỷ giá đã thực hiện (vào bút toán chênh lệch tỷ giá, loại "Bán ngoại tệ").
// MUA: quỹ VND chi số tiền thực trả, quỹ ngoại tệ nhập theo đúng số VND đó (không phát sinh chênh lệch; làm bình quân thay đổi).
function exchRows_() { try {
    return repoValid_('CashExchange');
}
catch (e) {
    return [];
} }
function exchOut_(x) { return { id: x.id, version: x.version, exchangeNo: x.exchangeNo || '', kind: x.kind, currency: x.currency, foreignAccount: x.foreignAccount, baseAccount: x.baseAccount, foreignMinor: x.foreignMinor, baseMinor: x.baseMinor, rate: fxText_(x.rateE4), effectiveDate: x.effectiveDate, status: x.status, periodId: x.periodId || '', costBaseMinor: x.costBaseMinor || 0, diffMinor: x.diffMinor || 0, reversedDate: x.reversedDate || '', note: x.note || '', createdBy: x.createdBy || '' }; }
function exchList_(user, req) {
    xferGate_(user, 'read');
    var p = req.payload || {}, rows = exchRows_().filter(function (x) { return x.status !== 'DELETED' && (!p.status || x.status === p.status) && (!p.kind || x.kind === p.kind); });
    rows.sort(function (a, b) { return cmpStr_(b.effectiveDate, a.effectiveDate) || cmpStr_(b.exchangeNo || b.id, a.exchangeNo || a.id); });
    var pg = paginate_(rows, p.page, p.pageSize || 50);
    return { items: pg.items.map(exchOut_), total: pg.total, page: pg.page, pageSize: pg.pageSize };
}
function exchSave_(user, req) {
    xferGate_(user, 'payment.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'exchange.save', payload: p, failAt: req.failAt }, function (tx) {
        var errs = [];
        function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
        var existing = p.id ? tx.find('CashExchange', p.id) : null;
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu mua/bán ngoại tệ.');
        if (existing && existing.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ sửa được phiếu nháp. Phiếu đã ghi nhận phải đảo.');
        if (existing && existing.createdBy !== user.id && user.role !== 'APPROVER')
            throw err_('FORBIDDEN', 'Chỉ người lập hoặc người duyệt được sửa bản nháp.');
        var accs = {};
        tx.rows('Catalog').forEach(function (c) { if (c.catalogType === 'CASH_ACCOUNT' && c.active === 1)
            accs[c.code] = safeJson_(c.attrsJson, {}); });
        var fa = accs[p.foreignAccount], ba = accs[p.baseAccount], dec = 0;
        if (p.kind !== 'BUY' && p.kind !== 'SELL')
            E('kind', 'REQUIRED', 'Chọn mua hoặc bán ngoại tệ.');
        if (!fa || !fa.currency || fa.currency === BASE_CUR_)
            E('foreignAccount', 'REQUIRED', 'Chọn quỹ ngoại tệ.');
        else
            dec = (currencyMap_()[fa.currency] || { decimals: 2 }).decimals;
        if (!ba || ba.currency !== BASE_CUR_)
            E('baseAccount', 'REQUIRED', 'Chọn quỹ VND (tiền mặt hoặc tài khoản ngân hàng VND).');
        if (!Number.isSafeInteger(p.foreignMinor) || p.foreignMinor <= 0)
            E('foreignMinor', 'AMOUNT_INVALID', 'Số ngoại tệ phải là số nguyên lớn hơn 0.');
        else if (p.foreignMinor > MONEY_MAX)
            E('foreignMinor', 'AMOUNT_OVERFLOW', 'Số tiền quá lớn.');
        if (!Number.isSafeInteger(p.baseMinor) || p.baseMinor <= 0)
            E('baseMinor', 'AMOUNT_INVALID', 'Số VND phải là số nguyên lớn hơn 0.');
        else if (p.baseMinor > MONEY_MAX * 100)
            E('baseMinor', 'AMOUNT_OVERFLOW', 'Số tiền quá lớn.');
        if (!isDate_(p.effectiveDate))
            E('effectiveDate', 'DATE_INVALID', 'Nhập ngày giao dịch hợp lệ.');
        else if (p.effectiveDate < ledgerStart_())
            E('effectiveDate', 'DATE_BEFORE_LEDGER_START', 'Ngày trước ngày đầu sổ ' + ledgerStart_() + '.');
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        var fields = { kind: p.kind, currency: fa.currency, foreignAccount: p.foreignAccount, baseAccount: p.baseAccount, foreignMinor: p.foreignMinor, baseMinor: p.baseMinor, rateE4: fxAvgE4_(p.baseMinor, p.foreignMinor, dec), effectiveDate: p.effectiveDate, note: maxStr_(p.note, 500), status: 'DRAFT' };
        var row;
        if (existing)
            row = tx.update('CashExchange', existing.id, fields, p.ifVersion);
        else {
            var no = 'MB-' + p.effectiveDate.slice(0, 4) + '-' + ('000000' + tx.nextSeq('seq.MB.' + p.effectiveDate.slice(0, 4))).slice(-6);
            row = tx.insert('CashExchange', Object.assign({ exchangeNo: no, periodId: '', postingDate: '', costBaseMinor: 0, diffMinor: 0, reversedDate: '' }, fields));
        }
        return { result: { id: row.id, status: 'DRAFT', exchangeNo: row.exchangeNo || (existing && existing.exchangeNo) || '', rate: fxText_(fields.rateE4) }, audit: [{ entityType: 'CashExchange', entityId: row.id, action: existing ? 'exchange.update' : 'exchange.create', diff: { kind: p.kind, foreignMinor: p.foreignMinor, baseMinor: p.baseMinor } }] };
    });
}
function exchDelete_(user, req) {
    xferGate_(user, 'payment.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'exchange.delete', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashExchange', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu mua/bán ngoại tệ.');
        if (x.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ xóa được phiếu nháp.');
        if (x.createdBy !== user.id && user.role !== 'APPROVER')
            throw err_('FORBIDDEN', 'Chỉ người lập hoặc người duyệt được xóa bản nháp.');
        tx.update('CashExchange', x.id, { status: 'DELETED', isDeleted: 1 }, p.ifVersion);
        return { result: { status: 'DELETED' }, audit: [{ entityType: 'CashExchange', entityId: x.id, action: 'exchange.delete', diff: null }] };
    });
}
function exchPost_(user, req) {
    xferGate_(user, 'payment.approve');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'exchange.post', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashExchange', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu mua/bán ngoại tệ.');
        if (x.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ ghi nhận được phiếu nháp.');
        if (x.createdBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập không được tự ghi nhận.');
        if (x.kind === 'SELL')
            assertCashNotOverdrawn_(x.foreignAccount, { exch: Object.assign({}, x, { status: 'POSTED' }) }, 'Phiếu bán ngoại tệ ' + (x.exchangeNo || ''));
        else
            assertCashNotOverdrawn_(x.baseAccount, { vnd: { ref: x.id, date: x.effectiveDate, docNo: x.exchangeNo, thu: false, amt: x.baseMinor, text: '', kind: 'EXCH' } }, 'Phiếu mua ngoại tệ ' + (x.exchangeNo || ''));
        var periodId = assertPeriodOpen_(tx, x.effectiveDate), upd = { status: 'POSTED', periodId: periodId, postingDate: x.effectiveDate }, info = { status: 'POSTED', periodId: periodId, warnings: [] };
        if (x.kind === 'SELL') {
            var run = fxPoolRun_(null, null, null, Object.assign({}, x, { status: 'POSTED' })), c = run.byExchange[x.id];
            if (!c)
                throw err_('VALIDATION_FAILED', 'Quỹ ngoại tệ không hợp lệ hoặc đã ngừng sử dụng.');
            upd.costBaseMinor = c.baseMinor;
            upd.diffMinor = x.baseMinor - c.baseMinor;
            info.costBaseMinor = c.baseMinor;
            info.diffMinor = upd.diffMinor;
            info.fallback = c.fallback;
            if (c.fallback)
                info.warnings = run.accounts[x.foreignAccount].warnings.slice(-2);
        }
        tx.update('CashExchange', x.id, upd, p.ifVersion);
        return { result: info, audit: [{ entityType: 'CashExchange', entityId: x.id, action: 'exchange.post', diff: { kind: x.kind, cost: upd.costBaseMinor || 0, diff: upd.diffMinor || 0 } }] };
    });
}
function exchReverse_(user, req) {
    xferGate_(user, 'payment.reverse');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'exchange.reverse', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashExchange', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu mua/bán ngoại tệ.');
        if (x.status !== 'POSTED')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ đảo được phiếu đã ghi nhận.');
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do đảo.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do đảo.' }]);
        var date = p.date || todayVn_();
        if (!isDate_(date) || date < x.effectiveDate)
            throw err_('VALIDATION_FAILED', 'Ngày đảo không hợp lệ (không trước ngày giao dịch).');
        assertCashNotOverdrawn_(x.kind === 'SELL' ? x.baseAccount : x.foreignAccount, { excl: x.id }, 'Đảo phiếu ' + (x.kind === 'SELL' ? 'bán' : 'mua') + ' ngoại tệ ' + (x.exchangeNo || ''));
        assertPeriodOpen_(tx, date);
        tx.update('CashExchange', x.id, { status: 'REVERSED', reversedDate: date, note: maxStr_((x.note ? x.note + ' | ' : '') + 'Đảo: ' + p.reason, 500) }, p.ifVersion);
        return { result: { status: 'REVERSED' }, audit: [{ entityType: 'CashExchange', entityId: x.id, action: 'exchange.reverse', diff: { reason: p.reason } }] };
    });
}
// ===== Sổ quỹ (tiền mặt, ngân hàng, ngoại tệ) =====
// Mỗi tài khoản quỹ một sổ: số dư đầu kỳ + thu/chi từ phiếu thu/chi đã ghi nhận, chuyển quỹ, mua/bán ngoại tệ, kèm tồn sau mỗi dòng.
// Quỹ ngoại tệ có thêm giá trị VND ghi sổ và tỷ giá bình quân sau mỗi dòng. Chỉ chứng từ ĐÃ GHI NHẬN; phiếu đã đảo không hiện.
function cashAccountsAll_() {
    var out = [];
    repoValid_('Catalog').forEach(function (c) {
        if (c.catalogType !== 'CASH_ACCOUNT')
            return;
        var a = safeJson_(c.attrsJson, {});
        out.push({ code: c.code, name: c.name, currency: a.currency || BASE_CUR_, type: a.type || '', active: c.active === 1 });
    });
    out.sort(function (a, b) { return cmpStr_(a.currency === BASE_CUR_ ? '0' + a.code : '1' + a.currency + a.code, b.currency === BASE_CUR_ ? '0' + b.code : '1' + b.currency + b.code); });
    return out;
}
// R35 (chị chốt 26/10, mục 1B): QUỸ TIỀN MẶT (CASH_ACCOUNT có type = CASH) không được chi/chuyển/bán vượt số dư; quỹ ngân hàng giữ cách cũ (tạm ghi theo tỷ giá ngày + cảnh báo).
// Chặn khi thao tác sắp ghi nhận làm PHÁT SINH THÊM điểm âm/vượt quỹ so với trước đó (số âm có sẵn từ dữ liệu cũ không bị đổ lỗi cho phiếu mới).
var CASH_EXCL_ = null;
function cashOverCount_(acc, spec) {
    spec = spec || {};
    CASH_EXCL_ = spec.excl ? (function (o) { o[spec.excl] = 1; return o; })({}) : null;
    try {
        return cashOverCount0_(acc, spec);
    }
    finally {
        CASH_EXCL_ = null;
    }
}
function cashOverCount0_(acc, spec) {
    if (acc.currency === BASE_CUR_)
        return cashLines_(acc, null, null, spec.vnd).lines.filter(function (l) { return l.bal < 0; }).length;
    var pool = fxPoolRun_(spec.pay || null, null, spec.xfer || null, spec.exch || null), pa = pool.accounts[acc.code];
    return pa ? pa.events.filter(function (e) { return e.fallback && e.over; }).length : 0;
}
function assertCashNotOverdrawn_(accCode, spec, label) {
    var acc = cashAccountsAll_().filter(function (a) { return a.code === accCode; })[0];
    if (!acc || acc.type !== 'CASH')
        return;
    if (cashOverCount_(acc, spec) > cashOverCount_(acc, null))
        throw err_('CASH_OVERDRAFT', label + ' vượt số dư quỹ tiền mặt ' + accCode + ' tại ngày hiệu lực. Hãy kiểm tra số dư, ngày hiệu lực hoặc chuyển tiền vào quỹ trước.');
}
function cashLines_(acc, asOf, pool, extraEv) {
    var pm = partnerMap_(), lines = [];
    if (acc.currency !== BASE_CUR_) {
        var pa = pool.accounts[acc.code];
        if (!pa)
            return { lines: [], openingF: 0, openingB: 0, warnings: [] };
        var pays = byId_(repoValid_('Payment'));
        pa.events.forEach(function (e) {
            var p = pays[e.payId], text = '', kind = e.direction;
            if (e.direction === 'IN' || e.direction === 'OUT')
                text = (e.direction === 'IN' ? 'Thu ' : 'Chi ') + (p ? partnerName_(pm, p.partnerId) : '') + (p && p.bankRef ? ' · ' + p.bankRef : '');
            else if (e.direction === 'XIN')
                text = 'Nhận chuyển từ quỹ ' + e.peer;
            else if (e.direction === 'XOUT')
                text = 'Chuyển sang quỹ ' + e.peer;
            else if (e.direction === 'EBUY')
                text = 'Mua ngoại tệ (trả VND từ quỹ ' + e.peer + ')';
            else if (e.direction === 'AIN' || e.direction === 'AOUT') {
                text = 'Xử lý chênh lệch kiểm kê (' + (e.direction === 'AIN' ? 'thừa' : 'thiếu') + ' quỹ)';
                kind = 'ADJ';
            }
            else
                text = 'Bán ngoại tệ (thu VND vào quỹ ' + e.peer + ')';
            var thu = e.direction === 'IN' || e.direction === 'XIN' || e.direction === 'EBUY' || e.direction === 'AIN';
            lines.push({ ref: e.payId, date: e.date, docNo: e.payNo, kind: kind, text: text, thu: thu ? e.foreignMinor : 0, chi: thu ? 0 : e.foreignMinor, bal: e.balF, thuB: thu ? e.baseMinor : 0, chiB: thu ? 0 : e.baseMinor, balB: e.balB, avgRate: fxText_(e.avgE4), fallback: !!e.fallback });
        });
        return { lines: lines, openingF: pa.openingF, openingB: pa.openingB, warnings: pa.warnings.slice(0, 20) };
    }
    var opening = 0, evs = [];
    repoValid_('OpeningBalance').forEach(function (o) { if (o.kind === 'CASH' && o.cashAccountCode === acc.code)
        opening += o.amountMinor; });
    repoValid_('Payment').forEach(function (p) { if (p.status === 'POSTED' && p.cashAccountCode === acc.code && p.currency === BASE_CUR_ && (!asOf || p.effectiveDate <= asOf))
        evs.push({ ref: p.id, date: p.effectiveDate, docNo: p.payNo, thu: p.direction === 'IN', amt: p.amountMinor, text: (p.direction === 'IN' ? 'Thu ' : 'Chi ') + partnerName_(pm, p.partnerId) + (p.bankRef ? ' · ' + p.bankRef : ''), kind: p.direction }); });
    // Xử lý chênh lệch kiểm kê quỹ (đã xác nhận biên bản và đã ghi nhận xử lý): đưa số dư sổ quỹ về đúng số kiểm đếm, đặt cuối ngày kiểm kê.
    countRows_().forEach(function (x) { if (x.status === 'CONFIRMED' && x.adjustStatus === 'POSTED' && x.accountCode === acc.code && x.diffMinor !== 0 && (!asOf || x.countDate <= asOf))
        evs.push({ ref: x.id, date: x.countDate, docNo: x.countNo, thu: x.diffMinor > 0, amt: Math.abs(x.diffMinor), last: 1, text: 'Xử lý chênh lệch kiểm kê (' + (x.diffMinor > 0 ? 'thừa' : 'thiếu') + ' quỹ): ' + (CASH_ADJ_KINDS_[x.adjustKind] || x.adjustKind), kind: 'ADJ' }); });
    exchRows_().forEach(function (x) { if (x.status === 'POSTED' && x.baseAccount === acc.code && (!asOf || x.effectiveDate <= asOf))
        evs.push({ ref: x.id, date: x.effectiveDate, docNo: x.exchangeNo, thu: x.kind === 'SELL', amt: x.baseMinor, text: x.kind === 'SELL' ? 'Bán ' + x.currency + ' thu VND (quỹ ' + x.foreignAccount + ')' : 'Mua ' + x.currency + ' chi VND (quỹ ' + x.foreignAccount + ')', kind: x.kind === 'SELL' ? 'ESELL' : 'EBUY' }); });
    if (extraEv)
        evs = evs.concat(extraEv);
    if (CASH_EXCL_)
        evs = evs.filter(function (e) { return !CASH_EXCL_[e.ref]; });
    evs.sort(function (a, b) { return cmpStr_(a.date, b.date) || (a.last || 0) - (b.last || 0) || (a.thu === b.thu ? 0 : a.thu ? -1 : 1) || cmpStr_(a.docNo || '', b.docNo || ''); });
    var bal = opening;
    evs.forEach(function (e) {
        bal += e.thu ? e.amt : -e.amt;
        lines.push({ ref: e.ref, date: e.date, docNo: e.docNo, kind: e.kind, text: e.text, thu: e.thu ? e.amt : 0, chi: e.thu ? 0 : e.amt, bal: bal });
    });
    return { lines: lines, openingF: opening, openingB: opening, warnings: bal < 0 ? ['Quỹ âm ' + fmtMoney_(bal, BASE_CUR_) + ' sau các phát sinh đã ghi nhận.'] : [] };
}
function cashBook_(user, req) {
    xferGate_(user, 'report.read');
    var p = req.payload || {}, to = isDate_(p.to) ? p.to : todayVn_(), from = isDate_(p.from) ? p.from : ledgerStart_(), accounts = cashAccountsAll_(), pool = fxPoolRun_(null, to), summary = [];
    if (from > to)
        throw err_('VALIDATION_FAILED', 'Từ ngày phải không sau đến ngày.', [{ path: 'from', code: 'RANGE', message: 'Từ ngày phải không sau đến ngày.' }]);
    accounts.forEach(function (a) {
        var r = cashLines_(a, to, pool), last = r.lines.length ? r.lines[r.lines.length - 1] : null;
        summary.push({ code: a.code, name: a.name, currency: a.currency, type: a.type, active: a.active, balMinor: last ? last.bal : r.openingF, balBaseMinor: a.currency === BASE_CUR_ ? (last ? last.bal : r.openingF) : (last ? last.balB : r.openingB) });
    });
    var res = { from: from, to: to, accounts: accounts, summary: summary };
    if (!p.account)
        return res;
    var acc = accounts.filter(function (a) { return a.code === p.account; })[0];
    if (!acc)
        throw err_('NOT_FOUND', 'Không tìm thấy tài khoản quỹ.');
    var r2 = cashLines_(acc, to, pool), foreign = acc.currency !== BASE_CUR_, before = r2.lines.filter(function (l) { return l.date < from; }), inRange = r2.lines.filter(function (l) { return l.date >= from; }), lb = before.length ? before[before.length - 1] : null;
    var openF = lb ? lb.bal : r2.openingF, openB = foreign ? (lb ? lb.balB : r2.openingB) : openF, tot = { thu: 0, chi: 0, thuB: 0, chiB: 0 };
    inRange.forEach(function (l) { tot.thu += l.thu; tot.chi += l.chi; tot.thuB += l.thuB || 0; tot.chiB += l.chiB || 0; });
    var closeF = inRange.length ? inRange[inRange.length - 1].bal : openF, closeB = foreign ? (inRange.length ? inRange[inRange.length - 1].balB : openB) : closeF;
    res.account = acc;
    res.book = { opening: openF, openingBase: openB, thu: tot.thu, chi: tot.chi, thuBase: tot.thuB, chiBase: tot.chiB, closing: closeF, closingBase: closeB, lines: inRange, foreign: foreign, warnings: r2.warnings };
    return res;
}
// ===== Đối chiếu quỹ với sao kê ngân hàng =====
// Số dư sao kê = số dư sổ quỹ − khoản thu chưa lên sao kê + khoản chi chưa lên sao kê + (khoản chỉ có trên sao kê: phí, lãi…). Chênh lệch còn lại phải = 0 mới xác nhận được.
// Khoản đã khớp ở lần xác nhận trước không hiện lại; khoản chỉ có trên sao kê chưa ghi sổ được chuyển tiếp sang lần sau cho đến khi đánh dấu đã ghi sổ.
function reconRows_() { try {
    return repoValid_('BankRecon');
}
catch (e) {
    return [];
} }
function reconOut_(r) { return { id: r.id, version: r.version, accountCode: r.accountCode, currency: r.currency, stmtDate: r.stmtDate, stmtBalanceMinor: r.stmtBalanceMinor, bookBalanceMinor: r.bookBalanceMinor, diffMinor: r.diffMinor, status: r.status, cleared: safeJson_(r.clearedJson, []), stmtOnly: safeJson_(r.stmtOnlyJson, []), resolved: safeJson_(r.resolvedJson, []), note: r.note || '', confirmedBy: r.confirmedBy || '', confirmedAt: r.confirmedAt || '' }; }
function reconContext_(accCode, stmtDate, exceptId, poolIn) {
    var acc = cashAccountsAll_().filter(function (a) { return a.code === accCode; })[0];
    if (!acc)
        throw err_('NOT_FOUND', 'Không tìm thấy tài khoản quỹ.');
    if (!isDate_(stmtDate))
        throw err_('VALIDATION_FAILED', 'Nhập ngày sao kê hợp lệ.', [{ path: 'stmtDate', code: 'DATE_INVALID', message: 'Nhập ngày sao kê hợp lệ.' }]);
    var pool = poolIn || fxPoolRun_(null, stmtDate), r = cashLines_(acc, stmtDate, pool), prev = reconRows_().filter(function (x) { return x.accountCode === accCode && x.status === 'CONFIRMED' && x.id !== exceptId && x.stmtDate < stmtDate; }), clearedPrev = {}, carried = [];
    prev.sort(function (a, b) { return cmpStr_(a.stmtDate, b.stmtDate); });
    prev.forEach(function (x) {
        safeJson_(x.clearedJson, []).forEach(function (k) { clearedPrev[k] = 1; });
        safeJson_(x.stmtOnlyJson, []).forEach(function (it, i) { carried.push(Object.assign({ id: x.id + '#' + i, fromRecon: x.id, fromDate: x.stmtDate }, it)); });
    });
    // một khoản chuyển tiếp coi là đã xử lý nếu bất kỳ lần xác nhận sau đó đánh dấu nó đã ghi sổ
    var resolvedAll = {};
    prev.forEach(function (x) { safeJson_(x.resolvedJson, []).forEach(function (k) { resolvedAll[k] = 1; }); });
    carried = carried.filter(function (c) { return !resolvedAll[c.id]; });
    var lines = r.lines.filter(function (l) { return !clearedPrev[l.ref]; }), book = r.lines.length ? r.lines[r.lines.length - 1].bal : r.openingF;
    return { acc: acc, lines: lines, book: book, carried: carried, prev: prev, clearedPrev: clearedPrev };
}
function reconCalc_(ctx, cleared, resolved, stmtOnly, stmtBalance) {
    var cl = {}, rs = {}, uThu = 0, uChi = 0, cNet = 0, sNet = 0;
    cleared.forEach(function (k) { cl[k] = 1; });
    resolved.forEach(function (k) { rs[k] = 1; });
    ctx.lines.forEach(function (l) { if (!cl[l.ref]) {
        uThu += l.thu;
        uChi += l.chi;
    } });
    ctx.carried.forEach(function (c) { if (!rs[c.id])
        cNet += c.amountMinor; });
    stmtOnly.forEach(function (it) { sNet += it.amountMinor; });
    var adjusted = ctx.book - uThu + uChi + cNet + sNet;
    return { unclearedThu: uThu, unclearedChi: uChi, carriedNet: cNet, stmtOnlyNet: sNet, adjusted: adjusted, diff: stmtBalance - adjusted };
}
function bankReconView_(user, req) {
    xferGate_(user, 'report.read');
    var p = req.payload || {}, stmtDate = isDate_(p.stmtDate) ? p.stmtDate : todayVn_(), ctx = reconContext_(p.account, stmtDate, null);
    var cur = reconRows_().filter(function (x) { return x.accountCode === p.account && x.stmtDate === stmtDate && x.status !== 'DELETED'; })[0] || null;
    var done = reconRows_().filter(function (x) { return x.accountCode === p.account && x.status === 'CONFIRMED'; }).sort(function (a, b) { return cmpStr_(b.stmtDate, a.stmtDate); }).slice(0, 12).map(function (x) { return { id: x.id, stmtDate: x.stmtDate, stmtBalanceMinor: x.stmtBalanceMinor, confirmedBy: x.confirmedBy, confirmedAt: x.confirmedAt }; });
    return { account: ctx.acc, stmtDate: stmtDate, bookBalance: ctx.book, lines: ctx.lines, carried: ctx.carried, recon: cur ? reconOut_(cur) : null, history: done };
}
// Gợi ý ghép dòng sao kê dán vào với phát sinh sổ quỹ chưa khớp: cùng chiều, đúng số tiền, lệch ngày không quá 7 ngày; mỗi dòng sổ quỹ chỉ ghép một lần.
function bankReconSuggest_(user, req) {
    xferGate_(user, 'report.read');
    var p = req.payload || {}, lines = Array.isArray(p.lines) ? p.lines.slice(0, 500) : [], ctx = reconContext_(p.account, p.stmtDate, null), used = {}, matches = [], unmatched = [];
    lines.forEach(function (st, idx) {
        if (!isDate_(st.date) || !Number.isSafeInteger(st.amountMinor) || st.amountMinor === 0) {
            unmatched.push(idx);
            return;
        }
        var best = null, bd = 99;
        ctx.lines.forEach(function (l) {
            if (used[l.ref])
                return;
            var amt = st.amountMinor > 0 ? l.thu : l.chi;
            if (amt !== Math.abs(st.amountMinor) || (st.amountMinor > 0 ? l.chi : l.thu) !== 0)
                return;
            var d = Math.abs(daysBetween_(l.date, st.date));
            if (d <= 7 && d < bd) {
                best = l;
                bd = d;
            }
        });
        if (best) {
            used[best.ref] = 1;
            matches.push({ idx: idx, ref: best.ref, days: bd });
        }
        else
            unmatched.push(idx);
    });
    return { matches: matches, unmatched: unmatched };
}
function bankReconSave_(user, req) {
    xferGate_(user, 'payment.write');
    var p = req.payload || {};
    if (p.confirm)
        requirePerm_(user, 'payment.approve');
    return runTx_(user, { requestId: req.requestId, action: 'bank.reconSave', payload: p, failAt: req.failAt }, function (tx) {
        var ctx = reconContext_(p.account, p.stmtDate, p.id || null), errs = [];
        function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
        var existing = tx.rows('BankRecon').filter(function (x) { return x.accountCode === p.account && x.stmtDate === p.stmtDate && x.status !== 'DELETED' && x.isDeleted !== 1; })[0] || null;
        if (existing && existing.status === 'CONFIRMED')
            throw err_('STATE_TRANSITION_INVALID', 'Đối chiếu ngày này đã xác nhận. Mở lại trước khi sửa.');
        if (existing && p.id && existing.id !== p.id)
            throw err_('STATE_TRANSITION_INVALID', 'Đã có bản đối chiếu cho ngày này.');
        if (!Number.isSafeInteger(p.stmtBalanceMinor))
            E('stmtBalanceMinor', 'AMOUNT_INVALID', 'Nhập số dư theo sao kê ngân hàng.');
        var valid = {};
        ctx.lines.forEach(function (l) { valid[l.ref] = 1; });
        var cleared = (Array.isArray(p.cleared) ? p.cleared : []).filter(function (k, i, a) { return a.indexOf(k) === i; });
        cleared.forEach(function (k) { if (!valid[k])
            E('cleared', 'UNKNOWN_LINE', 'Có dòng sổ quỹ không còn trong danh sách chưa khớp.'); });
        var so = (Array.isArray(p.stmtOnly) ? p.stmtOnly : []);
        if (so.length > 200)
            E('stmtOnly', 'TOO_MANY', 'Tối đa 200 dòng chỉ có trên sao kê.');
        var stmtOnly = so.map(function (it, i) {
            if (!isDate_(it.date) || !Number.isSafeInteger(it.amountMinor) || it.amountMinor === 0)
                E('stmtOnly[' + i + ']', 'INVALID', 'Dòng ' + (i + 1) + ': ngày hoặc số tiền không hợp lệ.');
            return { date: it.date, amountMinor: it.amountMinor, text: maxStr_(it.text, 200) };
        });
        var carriedIds = {};
        ctx.carried.forEach(function (c) { carriedIds[c.id] = 1; });
        var resolved = (Array.isArray(p.resolved) ? p.resolved : []).filter(function (k) { return carriedIds[k]; });
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        var calc = reconCalc_(ctx, cleared, resolved, stmtOnly, p.stmtBalanceMinor);
        if (p.confirm && calc.diff !== 0)
            throw err_('RECON_NOT_BALANCED', 'Chưa cân: còn chênh lệch ' + fmtMoney_(calc.diff, ctx.acc.currency) + ' ' + ctx.acc.currency + '. Kiểm tra các khoản chưa khớp hoặc thêm khoản chỉ có trên sao kê.');
        var fields = { accountCode: p.account, currency: ctx.acc.currency, stmtDate: p.stmtDate, stmtBalanceMinor: p.stmtBalanceMinor, bookBalanceMinor: ctx.book, diffMinor: calc.diff, status: p.confirm ? 'CONFIRMED' : 'DRAFT', clearedJson: JSON.stringify(cleared), stmtOnlyJson: JSON.stringify(stmtOnly), resolvedJson: JSON.stringify(resolved), note: maxStr_(p.note, 500) };
        if (p.confirm) {
            fields.confirmedBy = user.email;
            fields.confirmedAt = nowIso_();
        }
        var row = existing ? tx.update('BankRecon', existing.id, fields, p.ifVersion) : tx.insert('BankRecon', fields);
        return { result: { id: row.id, status: fields.status, diffMinor: calc.diff, calc: calc }, audit: [{ entityType: 'BankRecon', entityId: row.id, action: p.confirm ? 'bank.reconConfirm' : 'bank.reconSave', diff: { account: p.account, stmtDate: p.stmtDate, diff: calc.diff, cleared: cleared.length, stmtOnly: stmtOnly.length } }] };
    });
}
function bankReconCalc_(user, req) {
    xferGate_(user, 'report.read');
    var p = req.payload || {}, ctx = reconContext_(p.account, p.stmtDate, p.id || null), stmtOnly = (Array.isArray(p.stmtOnly) ? p.stmtOnly : []).filter(function (it) { return Number.isSafeInteger(it.amountMinor); }), bal = Number.isSafeInteger(p.stmtBalanceMinor) ? p.stmtBalanceMinor : 0;
    return reconCalc_(ctx, Array.isArray(p.cleared) ? p.cleared : [], Array.isArray(p.resolved) ? p.resolved : [], stmtOnly, bal);
}
function bankReconReopen_(user, req) {
    xferGate_(user, 'payment.approve');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'bank.reconReopen', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('BankRecon', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy bản đối chiếu.');
        if (x.status !== 'CONFIRMED')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ mở lại được bản đã xác nhận.');
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do mở lại.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do mở lại.' }]);
        if (tx.rows('BankRecon').some(function (o) { return o.accountCode === x.accountCode && o.status === 'CONFIRMED' && o.stmtDate > x.stmtDate && o.isDeleted !== 1; }))
            throw err_('STATE_TRANSITION_INVALID', 'Đã có lần đối chiếu sau ngày này được xác nhận. Mở lại từ lần mới nhất trở về trước.');
        tx.update('BankRecon', x.id, { status: 'DRAFT', confirmedBy: '', confirmedAt: '', note: maxStr_((x.note ? x.note + ' | ' : '') + 'Mở lại: ' + p.reason, 500) }, p.ifVersion);
        return { result: { status: 'DRAFT' }, audit: [{ entityType: 'BankRecon', entityId: x.id, action: 'bank.reconReopen', diff: { reason: p.reason } }] };
    });
}
// ===== Kiểm kê quỹ =====
// Đếm thực tế (theo mệnh giá hoặc nhập tổng) so với số dư sổ quỹ cuối ngày kiểm kê. Người lập khác người xác nhận; chênh lệch phải có lý do. Chưa tự lập phiếu xử lý chênh lệch.
function countRows_() { try {
    return repoValid_('CashCount');
}
catch (e) {
    return [];
} }
function countOut_(x) { return { id: x.id, version: x.version, countNo: x.countNo || '', accountCode: x.accountCode, currency: x.currency, countDate: x.countDate, bookMinor: x.bookMinor, countedMinor: x.countedMinor, diffMinor: x.diffMinor, denominations: safeJson_(x.denomJson, {}), status: x.status, reason: x.reason || '', note: x.note || '', createdBy: x.createdBy || '', confirmedBy: x.confirmedBy || '', confirmedAt: x.confirmedAt || '', adjustStatus: x.adjustStatus || '', adjustKind: x.adjustKind || '', adjustNote: x.adjustNote || '', adjustedBy: x.adjustedBy || '' }; }
function countBook_(accCode, date) {
    var acc = cashAccountsAll_().filter(function (a) { return a.code === accCode; })[0];
    if (!acc)
        throw err_('NOT_FOUND', 'Không tìm thấy tài khoản quỹ.');
    if (!isDate_(date))
        throw err_('VALIDATION_FAILED', 'Nhập ngày kiểm kê hợp lệ.', [{ path: 'countDate', code: 'DATE_INVALID', message: 'Nhập ngày kiểm kê hợp lệ.' }]);
    var r = cashLines_(acc, date, fxPoolRun_(null, date));
    return { acc: acc, book: r.lines.length ? r.lines[r.lines.length - 1].bal : r.openingF };
}
function countPreview_(user, req) {
    xferGate_(user, 'report.read');
    var p = req.payload || {}, b = countBook_(p.account, p.countDate || todayVn_());
    return { account: b.acc, countDate: p.countDate || todayVn_(), bookMinor: b.book };
}
function countList_(user, req) {
    xferGate_(user, 'report.read');
    var p = req.payload || {}, rows = countRows_().filter(function (x) { return x.status !== 'DELETED' && (!p.account || x.accountCode === p.account); });
    rows.sort(function (a, b) { return cmpStr_(b.countDate, a.countDate) || cmpStr_(b.countNo || '', a.countNo || ''); });
    var pg = paginate_(rows, p.page, p.pageSize || 50);
    return { items: pg.items.map(countOut_), total: pg.total, page: pg.page, pageSize: pg.pageSize };
}
function countSave_(user, req) {
    xferGate_(user, 'payment.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'cashcount.save', payload: p, failAt: req.failAt }, function (tx) {
        var b = countBook_(p.account, p.countDate), errs = [];
        function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
        if (p.countDate > todayVn_())
            E('countDate', 'DATE_FUTURE', 'Không kiểm kê cho ngày tương lai.');
        var denom = {}, counted = 0, hasDen = p.denominations && typeof p.denominations === 'object' && Object.keys(p.denominations).length > 0;
        if (hasDen) {
            Object.keys(p.denominations).forEach(function (k) {
                var d = Number(k), n = p.denominations[k];
                if (!Number.isSafeInteger(d) || d <= 0 || !Number.isSafeInteger(n) || n < 0) {
                    E('denominations', 'INVALID', 'Mệnh giá hoặc số tờ không hợp lệ: ' + k);
                    return;
                }
                if (n > 0) {
                    denom[k] = n;
                    counted += d * n;
                }
            });
        }
        else if (Number.isSafeInteger(p.countedMinor) && p.countedMinor >= 0)
            counted = p.countedMinor;
        else
            E('countedMinor', 'AMOUNT_INVALID', 'Nhập số tiền kiểm đếm hoặc số tờ theo mệnh giá.');
        if (!Number.isSafeInteger(counted) || counted > MONEY_MAX * 100)
            E('countedMinor', 'AMOUNT_OVERFLOW', 'Số tiền quá lớn.');
        var diff = counted - b.book;
        if (diff !== 0 && !String(p.reason || '').trim())
            E('reason', 'REQUIRED', 'Quỹ ' + (diff < 0 ? 'thiếu' : 'thừa') + ' ' + fmtMoney_(Math.abs(diff), b.acc.currency) + ': nhập nguyên nhân/giải trình.');
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        var existing = tx.rows('CashCount').filter(function (x) { return x.accountCode === p.account && x.countDate === p.countDate && x.status !== 'DELETED' && x.isDeleted !== 1; })[0] || null;
        if (existing && existing.status === 'CONFIRMED')
            throw err_('STATE_TRANSITION_INVALID', 'Ngày này đã có biên bản kiểm kê được xác nhận.');
        var fields = { accountCode: p.account, currency: b.acc.currency, countDate: p.countDate, bookMinor: b.book, countedMinor: counted, diffMinor: diff, denomJson: JSON.stringify(denom), status: 'DRAFT', reason: maxStr_(p.reason, 500), note: maxStr_(p.note, 500) };
        var row;
        if (existing)
            row = tx.update('CashCount', existing.id, fields, p.ifVersion);
        else {
            var no = 'KK-' + p.countDate.slice(0, 4) + '-' + ('000000' + tx.nextSeq('seq.KK.' + p.countDate.slice(0, 4))).slice(-6);
            row = tx.insert('CashCount', Object.assign({ countNo: no, confirmedBy: '', confirmedAt: '' }, fields));
        }
        return { result: { id: row.id, status: 'DRAFT', countNo: row.countNo || (existing && existing.countNo) || '', bookMinor: b.book, countedMinor: counted, diffMinor: diff }, audit: [{ entityType: 'CashCount', entityId: row.id, action: 'cashcount.save', diff: { account: p.account, date: p.countDate, book: b.book, counted: counted } }] };
    });
}
function countConfirm_(user, req) {
    xferGate_(user, 'payment.approve');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'cashcount.confirm', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashCount', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy biên bản kiểm kê.');
        if (x.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ xác nhận được biên bản nháp.');
        if (x.createdBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập biên bản không được tự xác nhận.');
        var b = countBook_(x.accountCode, x.countDate);
        if (b.book !== x.bookMinor)
            throw err_('STALE_COUNT', 'Sổ quỹ ngày ' + x.countDate + ' đã thay đổi từ lúc kiểm kê (' + fmtMoney_(x.bookMinor, x.currency) + ' → ' + fmtMoney_(b.book, x.currency) + '). Lập lại biên bản.');
        tx.update('CashCount', x.id, { status: 'CONFIRMED', confirmedBy: user.email, confirmedAt: nowIso_() }, p.ifVersion);
        return { result: { status: 'CONFIRMED', diffMinor: x.diffMinor }, audit: [{ entityType: 'CashCount', entityId: x.id, action: 'cashcount.confirm', diff: { diff: x.diffMinor } }] };
    });
}
var CASH_ADJ_KINDS_ = { EXPENSE: 'Tính vào chi phí/thu nhập khác', COMPENSATION: 'Người chịu trách nhiệm bồi thường/nộp lại', PENDING: 'Chờ xử lý (treo)' };
// Ghi nhận xử lý chênh lệch kiểm kê: đưa số dư sổ quỹ về đúng số kiểm đếm. Chỉ quỹ VND; quỹ ngoại tệ cần xử lý bằng phiếu thường.
function countAdjust_(user, req) {
    xferGate_(user, 'payment.approve');
    var p = req.payload || {};
    if (!CASH_ADJ_KINDS_[p.kind])
        throw err_('VALIDATION_FAILED', 'Chọn cách xử lý chênh lệch.', [{ path: 'kind', code: 'REQUIRED', message: 'Chọn cách xử lý chênh lệch.' }]);
        // R35 (mục 7B): thừa quỹ ngoại tệ nhập theo tỷ giá bình quân của quỹ (tính khi dựng sổ quỹ), nên không cần tra tỷ giá ngày kiểm kê.
    var fxp = null;
    return runTx_(user, { requestId: req.requestId, action: 'cashcount.adjust', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashCount', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy biên bản kiểm kê.');
        if (x.status !== 'CONFIRMED')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ xử lý chênh lệch của biên bản đã xác nhận.');
        if (x.diffMinor === 0)
            throw err_('STATE_TRANSITION_INVALID', 'Biên bản khớp, không có chênh lệch cần xử lý.');
        if (x.adjustStatus === 'POSTED')
            throw err_('STATE_TRANSITION_INVALID', 'Chênh lệch đã được xử lý.');
        var nowBook = countBook_(x.accountCode, x.countDate);
        if (nowBook.book !== x.bookMinor)
            throw err_('STALE_COUNT', 'Sổ quỹ ngày ' + x.countDate + ' đã thay đổi từ lúc kiểm kê (' + fmtMoney_(x.bookMinor, x.currency) + ' → ' + fmtMoney_(nowBook.book, x.currency) + '): số chênh lệch không còn đúng. Lập biên bản kiểm kê mới.');
        assertPeriodOpen_(tx, x.countDate);
        var upd = { adjustStatus: 'POSTED', adjustKind: p.kind, adjustNote: maxStr_(p.note, 500), adjustedBy: user.email, adjustedAt: nowIso_(), adjustRateE4: fxp ? fxp.e4 : 0 };
        tx.update('CashCount', x.id, upd, p.ifVersion);
        var info = { adjustStatus: 'POSTED', diffMinor: x.diffMinor };
        if (fxp)
            info.rate = fxText_(fxp.e4);
        return { result: info, audit: [{ entityType: 'CashCount', entityId: x.id, action: 'cashcount.adjust', diff: { kind: p.kind, diff: x.diffMinor } }] };
    });
}
function countAdjustReverse_(user, req) {
    xferGate_(user, 'payment.reverse');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'cashcount.adjustReverse', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashCount', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy biên bản kiểm kê.');
        if (x.adjustStatus !== 'POSTED')
            throw err_('STATE_TRANSITION_INVALID', 'Chưa có xử lý chênh lệch để đảo.');
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do đảo.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do đảo.' }]);
        if (x.diffMinor > 0)
            assertCashNotOverdrawn_(x.accountCode, { excl: x.id }, 'Đảo xử lý thừa quỹ ' + (x.countNo || ''));
        assertPeriodOpen_(tx, x.countDate);
        tx.update('CashCount', x.id, { adjustStatus: '', adjustRateE4: 0, adjustNote: maxStr_((x.adjustNote ? x.adjustNote + ' | ' : '') + 'Đảo: ' + p.reason, 500) }, p.ifVersion);
        return { result: { adjustStatus: '' }, audit: [{ entityType: 'CashCount', entityId: x.id, action: 'cashcount.adjustReverse', diff: { reason: p.reason } }] };
    });
}
// Tổng quan đối chiếu mọi tài khoản quỹ: lần xác nhận gần nhất và số khoản còn chưa đối chiếu đến ngày chỉ định.
function bankReconOverview_(user, req) {
    xferGate_(user, 'report.read');
    var p = req.payload || {}, asOf = isDate_(p.asOf) ? p.asOf : todayVn_(), pool = fxPoolRun_(null, asOf), rows = reconRows_(), counts = countRows_(), out = [];
    cashAccountsAll_().forEach(function (a) {
        if (!a.active)
            return;
        var ctx = reconContext_(a.code, asOf, null, pool), conf = rows.filter(function (x) { return x.accountCode === a.code && x.status === 'CONFIRMED'; }).sort(function (x, y) { return cmpStr_(y.stmtDate, x.stmtDate); })[0] || null, draft = rows.filter(function (x) { return x.accountCode === a.code && x.status === 'DRAFT' && x.isDeleted !== 1; })[0] || null;
        var cnt = counts.filter(function (x) { return x.accountCode === a.code && x.status === 'CONFIRMED'; }).sort(function (x, y) { return cmpStr_(y.countDate, x.countDate); })[0] || null, thu = 0, chi = 0;
        ctx.lines.forEach(function (l) { thu += l.thu; chi += l.chi; });
        out.push({ code: a.code, name: a.name, currency: a.currency, type: a.type, bookBalance: ctx.book, pending: ctx.lines.length, pendingThu: thu, pendingChi: chi, carried: ctx.carried.length, lastRecon: conf ? conf.stmtDate : '', lastReconBalance: conf ? conf.stmtBalanceMinor : 0, lastReconBy: conf ? conf.confirmedBy : '', daysSince: conf ? Math.max(0, daysBetween_(conf.stmtDate, asOf)) : null, draftDate: draft ? draft.stmtDate : '',
            lastCount: cnt ? cnt.countDate : '', lastCountDiff: cnt ? cnt.diffMinor : 0, lastCountAdjusted: cnt ? cnt.adjustStatus === 'POSTED' : false, daysSinceCount: cnt ? Math.max(0, daysBetween_(cnt.countDate, asOf)) : null });
    });
    return { asOf: asOf, items: out };
}
function countDelete_(user, req) {
    xferGate_(user, 'payment.write');
    var p = req.payload || {};
    return runTx_(user, { requestId: req.requestId, action: 'cashcount.delete', payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('CashCount', p.id);
        if (!x || x.isDeleted === 1)
            throw err_('NOT_FOUND', 'Không tìm thấy biên bản kiểm kê.');
        if (x.status !== 'DRAFT')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ xóa được biên bản nháp.');
        if (x.createdBy !== user.id && user.role !== 'APPROVER')
            throw err_('FORBIDDEN', 'Chỉ người lập hoặc người duyệt được xóa bản nháp.');
        tx.update('CashCount', x.id, { status: 'DELETED', isDeleted: 1 }, p.ifVersion);
        return { result: { status: 'DELETED' }, audit: [{ entityType: 'CashCount', entityId: x.id, action: 'cashcount.delete', diff: null }] };
    });
}
function fxMethodSet_(user, req) {
    fxEntryGate_(user, 'fx.backfill');
    var m = (req.payload || {}).method;
    if (m !== 'MOVING_AVG' && m !== 'DAY')
        throw err_('VALIDATION_FAILED', 'Phương pháp: MOVING_AVG (bình quân di động) hoặc DAY (theo ngày chi).', [{ path: 'method', code: 'INVALID', message: 'Chọn phương pháp hợp lệ.' }]);
    return runTx_(user, { requestId: req.requestId, action: 'fx.method.set', payload: req.payload, failAt: req.failAt }, function (tx) {
        if (tx.find('Config', 'fx.outMethod'))
            tx.update('Config', 'fx.outMethod', { value: m });
        else
            tx.insert('Config', { id: 'fx.outMethod', value: m });
        return { result: { method: m }, audit: [{ entityType: 'Config', entityId: 'fx.outMethod', action: 'fx.method.set', diff: { method: m } }] };
    });
}
// ===== Bút toán chênh lệch tỷ giá theo tháng (đã thực hiện + đánh giá lại cuối tháng, tự đảo kỳ sau). Số dương = lãi, âm = lỗ. =====
var FX_TYPE_VN_ = { REALIZED: 'Chênh lệch đã thực hiện', UNREALIZED: 'Đánh giá lại cuối kỳ', UNREALIZED_REVERSAL: 'Đảo đánh giá lại kỳ trước', REVERSAL: 'Đảo bút toán' };
// ---- Chính sách quyền: bút toán chênh lệch tỷ giá là số liệu TỔNG HỢP TOÀN CÔNG TY ----
// Chỉ tài khoản có phạm vi toàn công ty (allPartners=true và không giới hạn nhóm nghiệp vụ) VÀ được cấp đúng quyền mới xem/lập/ghi nhận/đảo.
// Quyền mặc định: chỉ ADMIN. Quyền cho tài khoản khác cấp bằng Config 'fx.entry.grants' (JSON {"<userId>":["fx.entry.read",...]}) qua fx.grants.set (cần user.manage) hoặc hàm fxGrantEntryPerms().
var FX_ENTRY_PERMS_ = ['fx.entry.read', 'fx.entry.write', 'fx.entry.post', 'fx.entry.reverse', 'fx.backfill'];
var FX_COMPANY_USER_ = { id: '__company__', email: '', role: 'ADMIN', scope: { allPartners: true } };
function fxCompanyWide_(user) {
    var sc = (user && user.scope) || {};
    return sc.allPartners === true && !(Array.isArray(sc.businessGroups) && sc.businessGroups.length);
}
function fxGrants_(user) {
    var set = {};
    (PERMS_[user.role] || []).forEach(function (p) { if (FX_ENTRY_PERMS_.indexOf(p) >= 0)
        set[p] = 1; });
    var cfg = safeJson_(cfgGet_('fx.entry.grants', ''), {}), g = cfg && cfg[user.id];
    if (Array.isArray(g))
        g.forEach(function (p) { if (FX_ENTRY_PERMS_.indexOf(p) >= 0)
            set[p] = 1; });
    return set;
}
function fxEntryGate_(user, perm) {
    if (FX_ENTRY_PERMS_.indexOf(perm) < 0)
        throw err_('FORBIDDEN', 'Quyền không hợp lệ.');
    if (!fxCompanyWide_(user))
        throw err_('FORBIDDEN', 'Bút toán chênh lệch tỷ giá là số liệu toàn công ty: chỉ tài khoản có phạm vi TOÀN BỘ đối tác và TOÀN BỘ nhóm nghiệp vụ mới được thao tác.');
    if (!fxGrants_(user)[perm])
        throw err_('FORBIDDEN', 'Tài khoản chưa được cấp quyền ' + perm + ' cho bút toán chênh lệch tỷ giá (quản trị cấp ở Config fx.entry.grants).');
}
function fxGrantSummary_(user) {
    var g = fxCompanyWide_(user) ? fxGrants_(user) : {};
    return { companyWide: fxCompanyWide_(user), read: !!g['fx.entry.read'], write: !!g['fx.entry.write'], post: !!g['fx.entry.post'], reverse: !!g['fx.entry.reverse'], backfill: !!g['fx.backfill'] };
}
function fxGrantsGet_(user, req) {
    requirePerm_(user, 'user.manage');
    return { grants: safeJson_(cfgGet_('fx.entry.grants', ''), {}), perms: FX_ENTRY_PERMS_ };
}
function fxGrantsSet_(user, req) {
    requirePerm_(user, 'user.manage');
    var p = req.payload || {}, errs = [];
    if (!p.userId || !repoFind_('AppUser', p.userId))
        errs.push({ path: 'userId', code: 'NOT_FOUND', message: 'Không tìm thấy người dùng.' });
    var perms = Array.isArray(p.perms) ? p.perms : [];
    perms.forEach(function (x) { if (FX_ENTRY_PERMS_.indexOf(x) < 0)
        errs.push({ path: 'perms', code: 'INVALID', message: 'Quyền không hợp lệ: ' + x }); });
    if (errs.length)
        throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
    return runTx_(user, { requestId: req.requestId, action: 'fx.grants.set', payload: p, failAt: req.failAt }, function (tx) {
        var cur = tx.find('Config', 'fx.entry.grants'), map = safeJson_(cur ? cur.value : '', {});
        if (perms.length)
            map[p.userId] = perms.filter(function (x, i) { return perms.indexOf(x) === i; });
        else
            delete map[p.userId];
        if (cur)
            tx.update('Config', 'fx.entry.grants', { value: JSON.stringify(map) });
        else
            tx.insert('Config', { id: 'fx.entry.grants', value: JSON.stringify(map) });
        return { result: { userId: p.userId, perms: map[p.userId] || [] }, audit: [{ entityType: 'Config', entityId: 'fx.entry.grants', action: 'fx.grants.set', diff: { userId: p.userId, perms: map[p.userId] || [] } }] };
    });
}
// Chạy trong trình soạn thảo Apps Script để cấp quyền (không ghi cứng email trong mã): fxGrantEntryPerms('ketoan@congty.vn', ['fx.entry.read','fx.entry.write'])
function fxGrantEntryPerms(email, perms) {
    var u = repoValid_('AppUser').filter(function (x) { return x.email === email; })[0];
    if (!u)
        throw new Error('Không có người dùng ' + email);
    return fxGrantsSet_({ id: 'script', email: 'script', role: 'ADMIN' }, { requestId: uid_('grant'), payload: { userId: u.id, perms: perms || [] } });
}
function fxMonthOf_(periodId) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(String(periodId || '')))
        throw err_('VALIDATION_FAILED', 'Kỳ không hợp lệ (yyyy-MM).', [{ path: 'periodId', code: 'INVALID', message: 'Nhập kỳ dạng yyyy-MM.' }]);
    return periodId;
}
// Tính trên TOÀN BỘ dữ liệu công ty (không theo quyền người gọi); chỉ gọi sau khi đã qua fxEntryGate_ và (khi ghi) trong runTx_ đang giữ khóa.
function fxPeriodItems_(periodId) {
    fxMonthOf_(periodId);
    var from = periodId + '-01', to = monthEnd_(periodId), entries = repoValid_('FxEntry'), warnings = [], items = [];
    var posted = entries.filter(function (e) { return e.periodId === periodId && e.status === 'POSTED'; });
    var byCur = {};
    repoValid_('Allocation').forEach(function (a) {
        if (!a.currency || a.currency === BASE_CUR_ || a.effectiveDate < from || a.effectiveDate > to)
            return;
        var o = byCur[a.currency] = byCur[a.currency] || { diff: 0, amt: 0, n: 0, miss: 0 };
        o.diff += a.fxDiffBaseMinor || 0;
        o.amt += a.amountMinor;
        o.n++;
        if (!(a.fxPayRateE4 > 0 && a.fxDocRateE4 > 0))
            o.miss++;
    });
    Object.keys(byCur).sort().forEach(function (c) {
        var o = byCur[c], already = 0;
        posted.forEach(function (e) { if (e.entryType === 'REALIZED' && e.currency === c && !e.direction)
            already += e.amountBaseMinor; });
        var amt = o.diff - already;
        if (o.miss)
            warnings.push(o.miss + ' lần phân bổ ' + c + ' thiếu tỷ giá nên chênh lệch tính 0.');
        if (amt !== 0)
            items.push({ entryType: 'REALIZED', currency: c, direction: '', foreignMinor: o.amt, rateE4: 0, amountBaseMinor: amt, asOf: to, reversesId: '', note: FX_TYPE_VN_.REALIZED + ' ' + c + ' kỳ ' + periodId + ' (' + o.n + ' lần phân bổ)' + (already ? ', phần điều chỉnh sau khi đã ghi nhận' : '') });
    });
    // Chênh lệch bán ngoại tệ (thu VND − giá vốn bình quân của quỹ), tính theo phiếu bán đã ghi nhận trong tháng.
    var exAgg = {};
    exchRows_().forEach(function (x) {
        if (x.status !== 'POSTED' || x.kind !== 'SELL' || x.effectiveDate < from || x.effectiveDate > to)
            return;
        var o = exAgg[x.currency] = exAgg[x.currency] || { diff: 0, amt: 0, n: 0 };
        o.diff += x.diffMinor || 0;
        o.amt += x.foreignMinor;
        o.n++;
    });
    Object.keys(exAgg).sort().forEach(function (c) {
        var o = exAgg[c], already = 0;
        posted.forEach(function (e) { if (e.entryType === 'REALIZED' && e.currency === c && e.direction === 'EXCH')
            already += e.amountBaseMinor; });
        if (o.diff - already !== 0)
            items.push({ entryType: 'REALIZED', currency: c, direction: 'EXCH', foreignMinor: o.amt, rateE4: 0, amountBaseMinor: o.diff - already, asOf: to, reversesId: '', note: 'Chênh lệch bán ngoại tệ ' + c + ' kỳ ' + periodId + ' (' + o.n + ' lần bán)' + (already ? ', phần điều chỉnh sau khi đã ghi nhận' : '') });
    });
    // R35: chênh lệch tỷ giá khi bù trừ khoản thu hộ / chi hộ ngoại tệ khác ngày (bản ghép còn hiệu lực, ngày ghép trong tháng).
    var psAgg = {};
    repoValid_('PassLink').forEach(function (l) {
        if (l.status !== 'ACTIVE' || !l.currency || l.currency === BASE_CUR_ || l.linkDate < from || l.linkDate > to)
            return;
        var o = psAgg[l.currency] = psAgg[l.currency] || { diff: 0, amt: 0, n: 0 };
        o.diff += l.fxDiffBaseMinor || 0;
        o.amt += l.amountMinor;
        o.n++;
    });
    Object.keys(psAgg).sort().forEach(function (c) {
        var o = psAgg[c], already = 0;
        posted.forEach(function (e) { if (e.entryType === 'REALIZED' && e.currency === c && e.direction === 'PASS')
            already += e.amountBaseMinor; });
        if (o.diff - already !== 0)
            items.push({ entryType: 'REALIZED', currency: c, direction: 'PASS', foreignMinor: o.amt, rateE4: 0, amountBaseMinor: o.diff - already, asOf: to, reversesId: '', note: 'Chênh lệch tỷ giá bù trừ thu hộ / chi hộ ' + c + ' kỳ ' + periodId + ' (' + o.n + ' lần ghép)' + (already ? ', phần điều chỉnh sau khi đã ghi nhận' : '') });
    });
    var prev = (function () { var y = +periodId.slice(0, 4), m = +periodId.slice(5, 7); m--; if (!m) { m = 12; y--; } return y + '-' + ('0' + m).slice(-2); })();
    // Phần đảo kỳ trước: bỏ qua CHỈ khi đã có bút toán đảo ĐÃ GHI NHẬN cho bản gốc. Bản nháp (kể cả của kỳ này, sẽ bị thay khi tạo lại) hoặc bản đã hủy/xóa mềm không được chặn việc dựng lại.
    entries.forEach(function (e) {
        if (e.entryType === 'UNREALIZED' && e.periodId === prev && e.status === 'POSTED' && !entries.some(function (r) { return r.reversesId === e.id && r.entryType === 'UNREALIZED_REVERSAL' && r.status === 'POSTED'; }))
            items.push({ entryType: 'UNREALIZED_REVERSAL', currency: e.currency, direction: e.direction, foreignMinor: e.foreignMinor, rateE4: e.rateE4, amountBaseMinor: -e.amountBaseMinor, asOf: from, reversesId: e.id, note: FX_TYPE_VN_.UNREALIZED_REVERSAL + ' ' + e.currency + ' (kỳ ' + prev + ')' });
    });
    var rv = fxRevalLines_(FX_COMPANY_USER_, to, {});
    rv.items.forEach(function (a) {
        if (!a.conv && a.out)
            return;
        if (a.diff !== 0)
            items.push({ entryType: 'UNREALIZED', currency: a.cur, direction: a.dir, foreignMinor: a.out, rateE4: a.rateE4, amountBaseMinor: a.diff, asOf: to, reversesId: '', note: FX_TYPE_VN_.UNREALIZED + ' ' + a.cur + ' ' + (a.dir === 'AR' ? 'phải thu' : 'phải trả') + ' tại ' + rptDateVn_(to) + ' theo tỷ giá ' + fxText_(a.rateE4) + ' (' + rptDateVn_(a.rateDate) + ')' });
    });
    // Quỹ tiền ngoại tệ: số dư cuối kỳ × tỷ giá cuối kỳ − giá trị ghi sổ (bình quân di động); tự đảo kỳ sau như công nợ.
    var cashPool = fxPoolRun_(null, to), cashAgg = {}, allRates = repoValid_('FxRate');
    Object.keys(cashPool.accounts).forEach(function (code) {
        var a = cashPool.accounts[code];
        if (a.balF <= 0)
            return;
        if (a.openingRateMissing || a.incomplete) {
            warnings.push('Quỹ ' + a.code + ' (' + a.currency + ') chưa đủ tỷ giá để định giá nên chưa đánh giá lại.');
            return;
        }
        var k = cashAgg[a.currency] = cashAgg[a.currency] || { F: 0, B: 0, dec: a.decimals };
        k.F += a.balF;
        k.B += a.balB;
    });
    Object.keys(cashAgg).sort().forEach(function (c) {
        var k = cashAgg[c], n = fxNearest_(c, to, allRates);
        if (!n) {
            warnings.push('Chưa có tỷ giá ' + c + ' nào không sau ' + rptDateVn_(to) + ' nên chưa đánh giá lại quỹ.');
            return;
        }
        var diff = fxToBase_(k.F, k.dec, n.rateE4) - k.B;
        if (diff !== 0)
            items.push({ entryType: 'UNREALIZED', currency: c, direction: 'CASH', foreignMinor: k.F, rateE4: n.rateE4, amountBaseMinor: diff, asOf: to, reversesId: '', note: FX_TYPE_VN_.UNREALIZED + ' ' + c + ' quỹ tiền tại ' + rptDateVn_(to) + ' (tỷ giá ' + fxText_(n.rateE4) + ')' });
    });
    if (rv.missing)
        warnings.push(rv.missing + ' dòng công nợ ngoại tệ thiếu tỷ giá nên chưa đánh giá lại.');
    rv.noRate.forEach(function (c) { warnings.push('Chưa có tỷ giá ' + c + ' nào không sau ' + rptDateVn_(to) + '.'); });
    if (posted.length)
        warnings.push('Kỳ này đã có bút toán ghi nhận: chỉ thêm phần chênh lệch phát sinh thêm của "đã thực hiện"; đánh giá lại cuối kỳ cần đảo bút toán cũ trước nếu muốn tính lại.');
    items = items.filter(function (it) { return !(it.entryType === 'UNREALIZED' && posted.some(function (e) { return e.entryType === 'UNREALIZED' && e.currency === it.currency && e.direction === it.direction; })); });
    return { periodId: periodId, from: from, to: to, items: items, warnings: warnings };
}
function fxEntryOut_(e) { return { id: e.id, periodId: e.periodId, entryType: e.entryType, typeName: FX_TYPE_VN_[e.entryType] || e.entryType, currency: e.currency, direction: e.direction, foreignMinor: e.foreignMinor, rate: fxText_(e.rateE4), amountBaseMinor: e.amountBaseMinor, status: e.status, reversesId: e.reversesId, asOf: e.asOf, note: e.note, version: e.version }; }
// Chữ ký bản nháp của một kỳ: id:phiên bản:số tiền của từng nháp còn hiệu lực. Ghi nhận phải mang đúng chữ ký đã xem.
function fxDraftSig_(drafts) {
    return sha256Hex_(drafts.map(function (e) { return e.id + ':' + e.version + ':' + e.amountBaseMinor; }).sort().join('|')).slice(0, 24);
}
function fxItemKey_(x) { return [x.entryType, x.currency, x.direction || '', x.reversesId || ''].join('|'); }
function fxItemSig_(x) { return [fxItemKey_(x), x.amountBaseMinor, x.foreignMinor || 0, x.rateE4 || 0].join('|'); }
function fxEntryPreview_(user, req) {
    fxEntryGate_(user, 'fx.entry.read');
    var r = fxPeriodItems_((req.payload || {}).periodId), all = repoValid_('FxEntry').filter(function (e) { return e.periodId === r.periodId; }), drafts = all.filter(function (e) { return e.status === 'DRAFT'; });
    return { periodId: r.periodId, items: r.items, warnings: r.warnings, entries: all.map(fxEntryOut_), draftSig: fxDraftSig_(drafts), asOf: r.to, dataVersion: dataVersion_() };
}
function fxEntryList_(user, req) {
    fxEntryGate_(user, 'fx.entry.read');
    var p = req.payload || {};
    return { items: repoValid_('FxEntry').filter(function (e) { return !p.periodId || e.periodId === p.periodId; }).sort(function (a, b) { return a.periodId < b.periodId ? 1 : a.periodId > b.periodId ? -1 : 0; }).map(fxEntryOut_) };
}
function fxEntryCreate_(user, req) {
    fxEntryGate_(user, 'fx.entry.write');
    var p = req.payload || {};
    fxMonthOf_(p.periodId);
    return runTx_(user, { requestId: req.requestId, action: 'fx.entryCreate', payload: p, failAt: req.failAt }, function (tx) {
        // Tính LẠI dưới khóa giao dịch (dữ liệu nguồn hiện hành), không dùng ảnh chụp lấy trước khóa.
        var r = fxPeriodItems_(p.periodId);
        tx.rows('FxEntry').forEach(function (e) { if (e.periodId === r.periodId && e.status === 'DRAFT' && e.isDeleted !== 1)
            tx.update('FxEntry', e.id, { isDeleted: 1, status: 'CANCELLED' }); });
        r.items.forEach(function (it) { tx.insert('FxEntry', { periodId: r.periodId, entryType: it.entryType, currency: it.currency, direction: it.direction || '', foreignMinor: it.foreignMinor || 0, rateE4: it.rateE4 || 0, amountBaseMinor: it.amountBaseMinor, status: 'DRAFT', reversesId: it.reversesId || '', asOf: it.asOf, note: it.note }); });
        return { result: { created: r.items.length, warnings: r.warnings }, audit: [{ entityType: 'FxEntry', entityId: r.periodId, action: 'fx.entryCreate', diff: { count: r.items.length, total: r.items.reduce(function (t, x) { return t + x.amountBaseMinor; }, 0) } }] };
    });
}
function fxEntryPost_(user, req) {
    fxEntryGate_(user, 'fx.entry.post');
    var p = req.payload || {};
    fxMonthOf_(p.periodId);
    if (!p.draftSig)
        throw err_('VALIDATION_FAILED', 'Thiếu chữ ký bản nháp: hãy xem lại bản nháp rồi ghi nhận.', [{ path: 'draftSig', code: 'REQUIRED', message: 'Xem lại bản nháp trước khi ghi nhận.' }]);
    return runTx_(user, { requestId: req.requestId, action: 'fx.entryPost', payload: p, failAt: req.failAt }, function (tx) {
        var drafts = tx.rows('FxEntry').filter(function (e) { return e.periodId === p.periodId && e.status === 'DRAFT' && e.isDeleted !== 1; });
        if (!drafts.length)
            throw err_('NOT_FOUND', 'Kỳ này chưa có bút toán nháp.');
        if (drafts.some(function (e) { return e.createdBy === user.id; }))
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập bút toán không được tự ghi nhận.');
        assertPeriodOpen_(tx, monthEnd_(p.periodId));
        // So sánh: (1) chữ ký (id, phiên bản, số tiền) các nháp người ghi nhận đã xem; (2) tính lại từ dữ liệu nguồn hiện hành (tỷ giá, chứng từ, phân bổ, bút toán đã ghi) — khác nhau thì từ chối, yêu cầu lập lại.
        if (fxDraftSig_(drafts) !== p.draftSig)
            throw err_('STALE_DRAFT', 'Bản nháp đã thay đổi sau lúc bạn xem. Hãy tải lại và xem lại trước khi ghi nhận.');
        var fresh = fxPeriodItems_(p.periodId).items.map(fxItemSig_).sort(), have = drafts.map(fxItemSig_).sort();
        if (JSON.stringify(fresh) !== JSON.stringify(have))
            throw err_('STALE_DRAFT', 'Số liệu nguồn (tỷ giá, chứng từ, phân bổ hoặc bút toán đã ghi) đã thay đổi từ lúc lập bản nháp. Hãy lập lại bút toán nháp rồi ghi nhận.');
        drafts.forEach(function (e) { tx.update('FxEntry', e.id, { status: 'POSTED' }, e.version); });
        return { result: { posted: drafts.length }, audit: [{ entityType: 'FxEntry', entityId: p.periodId, action: 'fx.entryPost', diff: { count: drafts.length, sig: p.draftSig } }] };
    });
}
function fxEntryReverse_(user, req) {
    fxEntryGate_(user, 'fx.entry.reverse');
    var p = req.payload || {};
    if (!String(p.reason || '').trim())
        throw err_('VALIDATION_FAILED', 'Nhập lý do đảo.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do đảo.' }]);
    if (p.ifVersion === undefined || p.ifVersion === null)
        throw err_('VALIDATION_FAILED', 'Thiếu phiên bản bút toán: hãy tải lại rồi đảo.', [{ path: 'ifVersion', code: 'REQUIRED', message: 'Thiếu phiên bản.' }]);
    return runTx_(user, { requestId: req.requestId, action: 'fx.entryReverse', payload: p, failAt: req.failAt }, function (tx) {
        var e = tx.find('FxEntry', p.id);
        if (!e)
            throw err_('NOT_FOUND', 'Không tìm thấy bút toán.');
        if (e.status !== 'POSTED' || e.entryType === 'REVERSAL')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ đảo được bút toán đã ghi nhận.');
        assertPeriodOpen_(tx, monthEnd_(e.periodId));
        tx.update('FxEntry', e.id, { status: 'REVERSED' }, p.ifVersion);
        var row = tx.insert('FxEntry', { periodId: e.periodId, entryType: 'REVERSAL', currency: e.currency, direction: e.direction, foreignMinor: e.foreignMinor, rateE4: e.rateE4, amountBaseMinor: -e.amountBaseMinor, status: 'POSTED', reversesId: e.id, asOf: e.asOf, note: 'Đảo: ' + maxStr_(p.reason, 200) });
        return { result: { id: row.id }, audit: [{ entityType: 'FxEntry', entityId: e.id, action: 'fx.entryReverse', diff: { reason: p.reason } }] };
    });
}
function paymentList_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, asOf = p.asOf || todayVn_();
    if (!isDate_(asOf))
        throw err_('VALIDATION_FAILED', 'Ngày chốt không hợp lệ.');
    validateListDates_(p);
    var adv = advParse_('payments', p.adv, p.currency);
    var led = loadLedger_(user, asOf), users = {}, q = normText_(p.q), cand = [];
    led.payments.forEach(function (x) {
        if (!advIn_(adv, 'direction', x.direction) || !advIn_(adv, 'partnerId', x.partnerId) || !advIn_(adv, 'cashAccountCode', x.cashAccountCode) || !advIn_(adv, 'status', x.status) || !advIn_(adv, 'currency', x.currency))
            return;
        if (!advRange_(adv, 'amountMinor', x.amountMinor) || !advRange_(adv, 'effectiveDate', x.effectiveDate))
            return;
        if (adv.flag.onlyUnallocated && !(led.payBal[x.id] && led.payBal[x.id].unalloc > 0))
            return;
        if (p.direction && x.direction !== p.direction)
            return;
        if (p.partnerId && x.partnerId !== p.partnerId)
            return;
        if (p.status && x.status !== p.status)
            return;
        if (p.cashAccountCode && x.cashAccountCode !== p.cashAccountCode)
            return;
        if (p.currency && x.currency !== p.currency)
            return;
        if (p.from && x.effectiveDate < p.from)
            return;
        if (p.to && x.effectiveDate > p.to)
            return;
        if (p.onlyUnallocated && !(led.payBal[x.id] && led.payBal[x.id].unalloc > 0))
            return;
        if (x.status === 'DELETED' && !p.includeDeleted)
            return;
        if (q && normText_([x.payNo, x.bankRef, partnerName_(led.pm, x.partnerId), x.note].join(' ')).indexOf(q) < 0)
            return;
        cand.push(x);
    });
    cand.sort(function (a, b) { return cmpStr_(b.effectiveDate, a.effectiveDate) || cmpStr_(b.payNo, a.payNo); });
    var totals = {};
    cand.forEach(function (x) {
        if (x.status !== 'POSTED')
            return;
        var bb = led.payBal[x.id], k = x.direction + ':' + x.currency, t = totals[k] = totals[k] || { amount: 0, unallocated: 0 };
        t.amount += x.amountMinor;
        t.unallocated += bb ? bb.unalloc : 0;
    });
    var pg = paginate_(cand, p.page, p.pageSize);
    return { items: pg.items.map(function (x) { return payRowOut_(x, led, users); }), total: pg.total, page: pg.page, pageSize: pg.pageSize, totals: totals, asOf: asOf, adv: adv };
}
function paymentGet_(user, req) {
    requirePerm_(user, 'read');
    var x = repoFind_('Payment', req.payload.id);
    if (!x)
        throw err_('NOT_FOUND', 'Không tìm thấy phiếu.');
    var pm = partnerMap_();
    assertVisible_(user, pm[x.partnerId], '', '', 'Không tìm thấy phiếu.');
    var led = loadLedger_(user, '9999-12-31'), docs = byId_(repoValid_('DebtDoc')), lines = byId_(repoValid_('DebtLine'));
    var allocs = repoValid_('Allocation').filter(function (a) { return a.paymentId === x.id; }).map(function (a) {
        var d = docs[a.docId], l = lines[a.debtLineId];
        return { id: a.id, debtLineId: a.debtLineId, docId: a.docId, docNo: d ? d.docNo : '', invoiceNo: d ? d.invoiceNo : '', lineDesc: l ? l.description : '', amountMinor: a.amountMinor,
            effectiveDate: a.effectiveDate, reversesAllocId: a.reversesAllocId, fxDiffBaseMinor: a.fxDiffBaseMinor || 0 };
    });
    var out = payRowOut_(x, led, {});
    out.allocPlan = safeJson_(x.allocPlanJson, []).map(function (pl) { var d = docs[pl.docId], b = led.bal.byDoc ? led.bal.byDoc[pl.docId] : null; return { docId: pl.docId, amountMinor: pl.amountMinor, docNo: d ? d.docNo : '', invoiceNo: d ? d.invoiceNo : '', outstandingMinor: b ? b.out : null }; });
    var un = out.unallocatedMinor;
    var allocSum = allocs.reduce(function (t, a) { return t + (a.amountMinor || 0); }, 0);
    return { payment: out, allocations: allocs, reconcile: { allocCount: allocs.length, parentMinor: x.amountMinor, allocSumMinor: allocSum, ledgerAllocMinor: out.allocatedMinor, allocOk: allocSum === out.allocatedMinor && allocSum <= x.amountMinor && allocSum >= 0, allocDiffMinor: allocSum - out.allocatedMinor, overAllocated: allocSum > x.amountMinor, currency: x.currency, scoped: !(user.scope && user.scope.allPartners) }, actions: payActions_(user, x, un || 0), warnings: out.warnings,
        history: repoReadAll_('AuditLog').filter(function (a) { return a.entityType === 'Payment' && a.entityId === x.id; }).map(function (a) { return { at: a.at, by: a.actorEmail, action: a.action }; }) };
}
function paymentSave_(user, req) {
    requirePerm_(user, 'payment.write');
    var p = req.payload, fxp = (p && currencyMap_()[p.currency] && isDate_(p.effectiveDate) && p.effectiveDate >= ledgerStart_()) ? fxResolve_(user, p.currency, p.effectiveDate, p.fxRate) : null;
    return runTx_(user, { requestId: req.requestId, action: 'payment.save', payload: p, failAt: req.failAt }, function (tx) {
        var errs = [];
        function E(path, code, msg) { errs.push({ path: path, code: code, message: msg }); }
        var existing = p.id ? tx.find('Payment', p.id) : null;
        if (p.id && !existing)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu.');
        if (existing) {
            assertVisible_(user, tx.find('Partner', existing.partnerId), '', '', 'Không tìm thấy phiếu.');
            if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED')
                throw err_('STATE_TRANSITION_INVALID', 'Chỉ sửa được phiếu nháp. Phiếu đã ghi nhận phải đảo.');
            if (existing.status === 'REJECTED' ? existing.createdBy !== user.id : (existing.createdBy !== user.id && user.role !== 'APPROVER'))
                throw err_('FORBIDDEN', existing.status === 'REJECTED' ? 'Phiếu bị từ chối: chỉ người lập được sửa và gửi lại.' : 'Chỉ người lập hoặc người duyệt được sửa bản nháp.');
        }
        var partner = p.partnerId ? tx.find('Partner', p.partnerId) : null, cur = currencyMap_();
        if (partner && !inScope_(user, partner, ''))
            partner = null; // đối tác ngoài phạm vi xử lý như không tồn tại
        if (p.direction !== 'IN' && p.direction !== 'OUT')
            E('direction', 'REQUIRED', 'Chọn thu hoặc chi.');
        if (!partner)
            E('partnerId', 'REQUIRED', 'Chọn đối tác.');
        else if ((p.direction === 'IN' && !partner.isCustomer) || (p.direction === 'OUT' && !partner.isSupplier))
            E('partnerId', 'PARTNER_ROLE', p.direction === 'IN' ? 'Đối tác không phải khách hàng.' : 'Đối tác không phải nhà cung cấp.');
        if (!cur[p.currency])
            E('currency', 'REQUIRED', 'Chọn tiền tệ.');
        if (!Number.isSafeInteger(p.amountMinor) || p.amountMinor <= 0)
            E('amountMinor', 'AMOUNT_INVALID', 'Số tiền phải là số nguyên lớn hơn 0.');
        else if (p.amountMinor > MONEY_MAX)
            E('amountMinor', 'AMOUNT_OVERFLOW', 'Số tiền quá lớn.');
        if (!isDate_(p.effectiveDate))
            E('effectiveDate', 'DATE_INVALID', 'Nhập ngày hiệu lực hợp lệ.');
        else if (p.effectiveDate < ledgerStart_())
            E('effectiveDate', 'DATE_BEFORE_LEDGER_START', 'Ngày trước ngày đầu sổ ' + ledgerStart_() + '.');
        if (PAY_METHODS_.indexOf(p.method || 'BANK') < 0)
            E('method', 'INVALID', 'Hình thức không hợp lệ.');
        if (PAY_PURPOSES_.indexOf(p.purpose || 'SETTLE') < 0)
            E('purpose', 'INVALID', 'Mục đích không hợp lệ.');
        var acc = null;
        tx.rows('Catalog').forEach(function (c) { if (c.catalogType === 'CASH_ACCOUNT' && c.code === p.cashAccountCode && c.active === 1)
            acc = c; });
        if (!acc)
            E('cashAccountCode', 'REQUIRED', 'Chọn tài khoản quỹ (khai báo ở Danh mục).');
        else if (safeJson_(acc.attrsJson, {}).currency !== p.currency)
            E('cashAccountCode', 'CURRENCY_MISMATCH', 'Tài khoản quỹ khác tiền tệ của phiếu.');
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Dữ liệu chưa hợp lệ', errs);
        assertScope_(user, partner, '');
        var warnings = [];
        if (p.bankRef)
            tx.rows('Payment').forEach(function (o) {
                if (existing && o.id === existing.id)
                    return;
                if (o.bankRef === String(p.bankRef).trim() && o.cashAccountCode === p.cashAccountCode && o.amountMinor === p.amountMinor)
                    warnings.push({ code: 'W-DUP', message: 'Nghi trùng với phiếu ' + o.payNo + ' (cùng mã giao dịch và số tiền)' });
            });
        var fields = { direction: p.direction, partnerId: partner.id, currency: p.currency, amountMinor: p.amountMinor, effectiveDate: p.effectiveDate, method: p.method || 'BANK',
            cashAccountCode: p.cashAccountCode, bankRef: maxStr_(p.bankRef, 100).trim(), purpose: p.purpose || 'SETTLE', note: maxStr_(p.note, 500), status: 'DRAFT', source: 'MANUAL',
            warningsJson: warnings.length ? JSON.stringify(warnings) : '' };
        // R35: chọn sẵn hóa đơn/chứng từ cần thanh toán ngay trên phiếu (kế hoạch phân bổ theo chứng từ). Khi phiếu được GHI NHẬN, hệ thống tự phân bổ theo kế hoạch này.
        if (p.allocPlan !== undefined) {
            var arrPlan = Array.isArray(p.allocPlan) ? p.allocPlan : [], planOut = [];
            if (arrPlan.length > 200)
                throw err_('VALIDATION_FAILED', 'Tối đa 200 chứng từ trong một phiếu.', [{ path: 'allocPlan', code: 'TOO_MANY', message: 'Tối đa 200 chứng từ.' }]);
            if (arrPlan.length) {
                var docsP = tx.rows('DebtDoc'), linesP = tx.rows('DebtLine'), balP = computeBalances(docsP, linesP, tx.rows('Allocation'), '9999-12-31'), dmP = byId_(docsP), outP = {}, seenP = {}, sumP = 0, perr = [];
                linesP.forEach(function (l) { var b = balP.byLine[l.id]; if (b && b.out > 0)
                    outP[l.docId] = (outP[l.docId] || 0) + b.out; });
                arrPlan.forEach(function (it, ix) {
                    var d = it && dmP[it.docId], pth = 'allocPlan[' + ix + '].amountMinor';
                    if (!d || d.status !== 'POSTED' || d.partnerId !== partner.id || d.currency !== p.currency || (p.direction === 'IN') !== (d.direction === 'AR') || !inScope_(user, partner, d.businessGroupCode))
                        return perr.push({ path: pth, code: 'DOC_INVALID', message: 'Chứng từ không hợp lệ cho phiếu này (khác đối tác, tiền tệ, chiều hoặc chưa ghi nhận).' });
                    if (seenP[d.id])
                        return perr.push({ path: pth, code: 'DUPLICATE', message: 'Chứng từ bị chọn hai lần.' });
                    seenP[d.id] = 1;
                    if (!Number.isSafeInteger(it.amountMinor) || it.amountMinor <= 0)
                        return perr.push({ path: pth, code: 'AMOUNT_INVALID', message: 'Số tiền phân bổ phải là số nguyên dương.' });
                    if (it.amountMinor > (outP[d.id] || 0))
                        return perr.push({ path: pth, code: 'EXCEEDS_OUTSTANDING', message: 'Vượt số còn nợ của chứng từ ' + d.docNo + ' (còn ' + fmtMoney_(outP[d.id] || 0, p.currency) + ').' });
                    sumP += it.amountMinor;
                    planOut.push({ docId: d.id, amountMinor: it.amountMinor });
                });
                if (!perr.length && sumP > p.amountMinor)
                    perr.push({ path: 'allocPlan', code: 'EXCEEDS_PAYMENT', message: 'Tổng phân bổ (' + fmtMoney_(sumP, p.currency) + ') vượt số tiền của phiếu.' });
                if (perr.length)
                    throw err_('VALIDATION_FAILED', 'Chọn hóa đơn thanh toán chưa hợp lệ', perr);
            }
            fields.allocPlanJson = planOut.length ? JSON.stringify(planOut) : '';
        }
        fields.fxRateE4 = fxp ? fxp.e4 : 0;
        fields.fxSource = fxp ? fxp.source : '';
        fields.amountBaseMinor = fxp ? fxToBase_(p.amountMinor, cur[p.currency].decimals, fxp.e4) : p.amountMinor;
        var row = existing ? tx.update('Payment', existing.id, fields, p.ifVersion) : tx.insert('Payment', Object.assign({ payNo: '' }, fields));
        return { result: { id: row.id, status: 'DRAFT', version: existing ? existing.version + 1 : 1, warnings: warnings },
            audit: [{ entityType: 'Payment', entityId: row.id, action: existing ? 'payment.update' : 'payment.create', diff: { amountMinor: p.amountMinor, currency: p.currency } }] };
    });
}
function payTransition_(user, req, perm, action, fn) {
    requirePerm_(user, perm);
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: action, payload: p, failAt: req.failAt }, function (tx) {
        var x = tx.find('Payment', p.id);
        if (!x)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu.');
        assertVisible_(user, tx.find('Partner', x.partnerId), '', '', 'Không tìm thấy phiếu.');
        var out = fn(tx, x, p);
        return { result: Object.assign({ id: x.id }, out.result), audit: [{ entityType: 'Payment', entityId: x.id, action: action, diff: out.diff || null }] };
    });
}
function paySubmit_(user, req) {
    return payTransition_(user, req, 'payment.submit', 'payment.submit', function (tx, x, p) {
        mustBe_(x, ['DRAFT', 'REJECTED']);
        if (x.status === 'REJECTED' ? x.createdBy !== user.id : (x.createdBy !== user.id && user.role !== 'APPROVER'))
            throw err_('FORBIDDEN', 'Chỉ người lập được gửi duyệt.');
        var no = x.payNo;
        if (!no) {
            var prefix = x.direction === 'IN' ? 'PH' : 'PC', y = x.effectiveDate.slice(0, 4);
            no = prefix + '-' + y + '-' + ('000000' + tx.nextSeq('seq.' + prefix + '.' + y)).slice(-6);
        }
        tx.update('Payment', x.id, { status: 'SUBMITTED', payNo: no, submittedBy: user.id, rejectReason: '' }, p.ifVersion);
        return { result: { status: 'SUBMITTED', payNo: no } };
    });
}
function payApprove_(user, req) {
    return payTransition_(user, req, 'payment.approve', 'payment.approve', function (tx, x, p) {
        mustBe_(x, ['SUBMITTED']);
        if (x.createdBy === user.id || x.submittedBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập không được tự duyệt.');
        tx.update('Payment', x.id, { status: 'APPROVED', approvedBy: user.id }, p.ifVersion);
        return { result: { status: 'APPROVED' } };
    });
}
function payReject_(user, req) {
    return payTransition_(user, req, 'payment.approve', 'payment.reject', function (tx, x, p) {
        mustBe_(x, ['SUBMITTED']);
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do từ chối.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do từ chối.' }]);
        if (x.createdBy === user.id || x.submittedBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người lập không được tự từ chối.');
        tx.update('Payment', x.id, { status: 'REJECTED', rejectReason: maxStr_(p.reason, 500) }, p.ifVersion);
        return { result: { status: 'REJECTED' } };
    });
}
function payDelete_(user, req) {
    return payTransition_(user, req, 'payment.write', 'payment.delete', function (tx, x, p) {
        mustBe_(x, ['DRAFT', 'REJECTED']);
        if (x.status === 'REJECTED' ? user.role !== 'APPROVER' : (x.createdBy !== user.id && user.role !== 'APPROVER'))
            throw err_('FORBIDDEN', x.status === 'REJECTED' ? 'Phiếu bị từ chối: chỉ người duyệt được xóa.' : 'Chỉ người lập hoặc người duyệt được xóa bản nháp.');
        tx.update('Payment', x.id, { status: 'DELETED', isDeleted: 1 }, p.ifVersion);
        return { result: { status: 'DELETED' } };
    });
}
// Tự phân bổ theo kế hoạch chọn hóa đơn đã lưu trên phiếu khi ghi nhận. Không làm hỏng việc ghi nhận: nếu phân bổ không thực hiện được thì phiếu vẫn ghi nhận và kết quả báo lý do (phân bổ tay sau).
function payApplyPlan_(user, tx, pay, p) {
    var plan = safeJson_(pay.allocPlanJson, []);
    if (!plan.length)
        return null;
    try {
        var docs = tx.rows('DebtDoc'), lines = tx.rows('DebtLine'), bal = computeBalances(docs, lines, tx.rows('Allocation'), '9999-12-31'), items = [], short = 0;
        plan.forEach(function (pl) {
            var left = pl.amountMinor;
            lines.filter(function (l) { return l.docId === pl.docId; }).sort(function (a, b) { return a.lineNo - b.lineNo; }).forEach(function (l) {
                var b = bal.byLine[l.id];
                if (!b || b.out <= 0 || left <= 0)
                    return;
                var t = Math.min(left, b.out);
                items.push({ debtLineId: l.id, amountMinor: t });
                left -= t;
            });
            short += left;
        });
        if (!items.length)
            return { applied: false, message: 'Các chứng từ đã chọn không còn nợ: phiếu ghi nhận nhưng chưa phân bổ.' };
        var pays = tx.rows('Payment').map(function (r) { return r.id === pay.id ? Object.assign({}, r, pay, { status: 'POSTED' }) : r; });
        var core = allocApplyCore_(user, tx, Object.assign({}, pay, { status: 'POSTED' }), items, pay.effectiveDate, 'Phân bổ theo chứng từ chọn trên phiếu', pays);
        tx.update('Payment', pay.id, { allocPlanJson: '' }, undefined);
        return { applied: true, allocatedMinor: core.total, lines: core.lines, shortMinor: short, message: short > 0 ? 'Một số chứng từ không còn đủ số nợ: còn ' + fmtMoney_(short, pay.currency) + ' chưa phân bổ.' : '' };
    }
    catch (e) {
        return { applied: false, message: 'Không tự phân bổ được theo chứng từ đã chọn: ' + String(e && (e.userMessage || e.message) || e).slice(0, 200) + ' — phiếu vẫn được ghi nhận; hãy phân bổ tay.' };
    }
}
function payPost_(user, req) {
    return payTransition_(user, req, 'payment.approve', 'payment.post', function (tx, x, p) {
        mustBe_(x, ['APPROVED']);
        var periodId = assertPeriodOpen_(tx, x.effectiveDate);
        if (x.direction === 'OUT' && x.cashAccountCode)
            assertCashNotOverdrawn_(x.cashAccountCode, x.currency === BASE_CUR_ ? { vnd: { ref: x.id, date: x.effectiveDate, docNo: x.payNo, thu: false, amt: x.amountMinor, text: '', kind: 'OUT' } } : { pay: Object.assign({}, x, { status: 'POSTED' }) }, 'Phiếu chi ' + (x.payNo || ''));
        var upd = { status: 'POSTED', periodId: periodId, postingDate: x.effectiveDate }, fxInfo = null;
        // Chi từ quỹ ngoại tệ: tỷ giá ghi sổ = bình quân gia quyền di động của quỹ tại thời điểm chi (phiếu thu giữ tỷ giá ngày thực thu).
        if (x.direction === 'OUT' && x.currency !== BASE_CUR_ && fxOutMethod_() === 'MOVING_AVG') {
            var pool = fxPoolRun_(Object.assign({}, x, { status: 'POSTED' }), null), c = pool.byPayment[x.id];
            if (c && !c.fallback) {
                upd.fxRateE4 = c.rateE4;
                upd.fxSource = 'MOVING_AVG';
                upd.amountBaseMinor = c.baseMinor;
                fxInfo = { method: 'MOVING_AVG', rate: fxText_(c.rateE4), amountBaseMinor: c.baseMinor };
            }
            else if (c) {
                var pa = pool.accounts[c.accountCode];
                fxInfo = { method: 'DAY', fallback: true, warnings: pa ? pa.warnings.slice(-3) : [] };
            }
        }
        tx.update('Payment', x.id, upd, p.ifVersion);
        var planRes = payApplyPlan_(user, tx, Object.assign({}, x, upd), p);
        return { result: { status: 'POSTED', periodId: periodId, fx: fxInfo, alloc: planRes }, diff: fxInfo };
    });
}
function payReverse_(user, req) {
    return payTransition_(user, req, 'payment.reverse', 'payment.reverse', function (tx, x, p) {
        mustBe_(x, ['POSTED']);
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do đảo.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do đảo.' }]);
        // R35 (chị chốt 27/10): đảo phiếu thu vào quỹ TIỀN MẶT mà tiền đã chi (làm quỹ âm / vượt quỹ) bị chặn.
        if (x.direction === 'IN' && x.cashAccountCode)
            assertCashNotOverdrawn_(x.cashAccountCode, { excl: x.id }, 'Đảo phiếu thu ' + (x.payNo || ''));
        var allocSum = 0;
        tx.rows('Allocation').forEach(function (a) { if (a.paymentId === x.id)
            allocSum += a.amountMinor; });
        if (allocSum !== 0)
            throw err_('ALLOC_EXISTS', 'Phiếu còn phân bổ cho chứng từ. Hãy đảo phân bổ trước.');
        var date = p.date || todayVn_();
        if (!isDate_(date) || date < x.effectiveDate)
            throw err_('VALIDATION_FAILED', 'Ngày đảo không hợp lệ (không trước ngày hiệu lực phiếu).');
        assertPeriodOpen_(tx, date);
        tx.update('Payment', x.id, { status: 'REVERSED', reversedDate: date, rejectReason: maxStr_(p.reason, 500) }, p.ifVersion);
        return { result: { status: 'REVERSED' }, diff: { reason: p.reason } };
    });
}
function allocApplyCore_(user, tx, pay, rawItems, eff, note, paysOverride) {
        var periodId = assertPeriodOpen_(tx, eff);
        var docs = tx.rows('DebtDoc'), lines = tx.rows('DebtLine'), allocs = tx.rows('Allocation'), pays = paysOverride || tx.rows('Payment');
        var bal = computeBalances(docs, lines, allocs, '9999-12-31'), pb = paymentBalances(pays, allocs, '9999-12-31');
        var dm = byId_(docs), lm = byId_(lines);
        var pmA = byId_(tx.rows('Partner'));
        var items = (rawItems || []).map(function (it) {
            var l = lm[it.debtLineId], dd = l ? dm[l.docId] : null;
            if (dd && !inScope_(user, pmA[dd.partnerId], dd.businessGroupCode)) {
                l = null;
                dd = null; // dòng/chứng từ ngoài phạm vi xử lý như không tồn tại ("Không tìm thấy dòng phí.")
            }
            var b = l ? bal.byLine[l.id] : null;
            return { amount: it.amountMinor, line: l, doc: dd, outFuture: b ? b.out : 0 };
        });
        if (!items.length)
            throw err_('VALIDATION_FAILED', 'Chọn ít nhất một dòng phí để phân bổ', [{ path: 'items', code: 'REQUIRED', message: 'Chọn ít nhất một dòng.' }]);
        var errs = checkAllocation(pay, pb[pay.id] ? pb[pay.id].unalloc : 0, items, eff);
        if (errs.length)
            throw err_('VALIDATION_FAILED', 'Phân bổ không hợp lệ', errs);
        items.forEach(function (it) { assertScope_(user, tx.find('Partner', it.doc.partnerId), it.doc.businessGroupCode); });
        var fxRows = tx.rows('FxRate'), fxDiffTotal = 0, fxMissing = 0;
        var created = items.map(function (it) {
            var fx = fxAllocDiff_(pay, it.doc, it.amount, fxRows);
            if (pay.currency !== BASE_CUR_ && (!fx.payE4 || !fx.docE4))
                fxMissing++;
            fxDiffTotal += fx.diff;
            return tx.insert('Allocation', { paymentId: pay.id, debtLineId: it.line.id, docId: it.doc.id, partnerId: pay.partnerId, currency: pay.currency, amountMinor: it.amount,
                effectiveDate: eff, status: 'ACTIVE', reversesAllocId: '', periodId: periodId, note: maxStr_(note, 300), fxPayRateE4: fx.payE4, fxDocRateE4: fx.docE4, fxDiffBaseMinor: fx.diff });
        });
    var total = sumBy_(items, function (i) { return i.amount; });
    return { created: created, total: total, unalloc: pb[pay.id].unalloc - total, fxDiffTotal: fxDiffTotal, fxMissing: fxMissing, lines: items.length };
}
function paymentAllocate_(user, req) {
    requirePerm_(user, 'payment.allocate');
    var p = req.payload;
    fxPrepAlloc_(user, p);
    return runTx_(user, { requestId: req.requestId, action: 'payment.allocate', payload: p, failAt: req.failAt }, function (tx) {
        var pay = tx.find('Payment', p.paymentId);
        if (!pay)
            throw err_('NOT_FOUND', 'Không tìm thấy phiếu.');
        assertVisible_(user, tx.find('Partner', pay.partnerId), '', '', 'Không tìm thấy phiếu.');
        if (p.ifVersion !== undefined && p.ifVersion !== null && Number(p.ifVersion) !== pay.version)
            throw err_('VERSION_CONFLICT', 'Phiếu đã thay đổi, hãy tải lại.');
        var eff = p.effectiveDate || (pay.effectiveDate > todayVn_() ? pay.effectiveDate : todayVn_());
        if (!isDate_(eff))
            throw err_('VALIDATION_FAILED', 'Ngày phân bổ không hợp lệ', [{ path: 'effectiveDate', code: 'DATE_INVALID', message: 'Ngày không hợp lệ.' }]);
        if (eff < pay.effectiveDate)
            throw err_('VALIDATION_FAILED', 'Ngày phân bổ không được trước ngày hiệu lực của phiếu', [{ path: 'effectiveDate', code: 'DATE_BEFORE_PAYMENT', message: 'Không trước ngày hiệu lực phiếu (' + pay.effectiveDate + ').' }]);
        var core = allocApplyCore_(user, tx, pay, p.items, eff, p.note);
        tx.update('Payment', pay.id, { note: pay.note }, undefined);
        return { result: { allocationIds: core.created.map(function (a) { return a.id; }), allocatedMinor: core.total, unallocatedMinor: core.unalloc, fxDiffBaseMinor: core.fxDiffTotal, fxMissing: core.fxMissing },
            audit: [{ entityType: 'Payment', entityId: pay.id, action: 'payment.allocate', diff: { total: core.total, lines: core.lines } }] };
    });
}
function paymentReverseAllocation_(user, req) {
    requirePerm_(user, 'payment.reverse');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'payment.reverseAllocation', payload: p, failAt: req.failAt }, function (tx) {
        var a = tx.find('Allocation', p.allocationId);
        if (!a || a.amountMinor <= 0)
            throw err_('NOT_FOUND', 'Không tìm thấy phân bổ.');
        assertVisible_(user, tx.find('Partner', a.partnerId), '', '', 'Không tìm thấy phân bổ.');
        var reversed = 0;
        tx.rows('Allocation').forEach(function (x) { if (x.reversesAllocId === a.id)
            reversed += -x.amountMinor; });
        var amount = p.amountMinor === undefined || p.amountMinor === null ? a.amountMinor - reversed : p.amountMinor;
        if (!Number.isSafeInteger(amount) || amount <= 0 || amount > a.amountMinor - reversed)
            throw err_('VALIDATION_FAILED', 'Số tiền đảo không hợp lệ (còn đảo được ' + (a.amountMinor - reversed) + ')', [{ path: 'amountMinor', code: 'AMOUNT_INVALID', message: 'Tối đa ' + (a.amountMinor - reversed) + '.' }]);
        var date = p.effectiveDate || todayVn_();
        if (!isDate_(date) || date < a.effectiveDate)
            throw err_('VALIDATION_FAILED', 'Ngày đảo không được trước ngày phân bổ.', [{ path: 'effectiveDate', code: 'DATE_INVALID', message: 'Không trước ' + a.effectiveDate + '.' }]);
        var periodId = assertPeriodOpen_(tx, date);
        var row = tx.insert('Allocation', { paymentId: a.paymentId, debtLineId: a.debtLineId, docId: a.docId, partnerId: a.partnerId, currency: a.currency, amountMinor: -amount, effectiveDate: date,
            status: 'ACTIVE', reversesAllocId: a.id, periodId: periodId, note: maxStr_(p.note || 'Đảo phân bổ', 300), fxPayRateE4: a.fxPayRateE4 || 0, fxDocRateE4: a.fxDocRateE4 || 0,
            fxDiffBaseMinor: a.fxDiffBaseMinor ? -Math.round(a.fxDiffBaseMinor * amount / a.amountMinor) : 0 });
        return { result: { id: row.id, reversedMinor: amount }, audit: [{ entityType: 'Payment', entityId: a.paymentId, action: 'payment.reverseAllocation', diff: { allocation: a.id, amount: amount } }] };
    });
}
// Chứng từ còn nợ của một đối tác (theo chiều, tiền tệ) để chọn thanh toán ngay trên phiếu thu/chi.
function paymentOpenDocs_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {};
    if ((p.direction !== 'IN' && p.direction !== 'OUT') || !p.partnerId || !p.currency)
        return { items: [] };
    assertVisible_(user, partnerMap_()[p.partnerId], '', '', 'Không tìm thấy đối tác.');
    var led = loadLedger_(user, '9999-12-31'), by = {}, items = [];
    led.lines.forEach(function (l) {
        var d = led.docById[l.docId], b = led.bal.byLine[l.id];
        if (!d || !b || d.partnerId !== p.partnerId || d.currency !== p.currency || d.status !== 'POSTED' || b.out <= 0 || (p.direction === 'IN') !== (d.direction === 'AR'))
            return;
        var x = by[d.id];
        if (!x) {
            x = by[d.id] = { docId: d.id, docNo: d.docNo, invoiceNo: d.invoiceNo || '', docDate: d.docDate || '', dueDate: d.dueDate || '', outstandingMinor: 0, description: l.description || '', lineCount: 0, lines: [] };
            items.push(x);
        }
        x.outstandingMinor += b.out;
        x.lineCount++;
        x.lines.push({ description: l.description || '', outstandingMinor: b.out });
    });
    items.sort(function (a, b) { return cmpStr_(a.docDate, b.docDate) || cmpStr_(a.docNo, b.docNo); });
    return { items: items };
}
function paymentSuggest_(user, req) {
    requirePerm_(user, 'read');
    var pay = repoFind_('Payment', req.payload.paymentId);
    if (!pay)
        throw err_('NOT_FOUND', 'Không tìm thấy phiếu.');
    assertVisible_(user, partnerMap_()[pay.partnerId], '', '', 'Không tìm thấy phiếu.');
    var led = loadLedger_(user, '9999-12-31'), un = led.payBal[pay.id] ? led.payBal[pay.id].unalloc : 0, cands = [];
    led.lines.forEach(function (l) {
        var d = led.docById[l.docId], b = led.bal.byLine[l.id];
        if (!d || !b || d.partnerId !== pay.partnerId || d.currency !== pay.currency || d.status !== 'POSTED' || b.out <= 0)
            return;
        if ((pay.direction === 'IN') !== (d.direction === 'AR'))
            return;
        cands.push({ line: l, doc: d, out: b.out });
    });
    var s = suggestFifo(un, cands), lm = byId_(led.lines);
    return { unallocatedMinor: un, suggestion: s.items, remainingMinor: s.remaining,
        candidates: cands.map(function (c) { return { debtLineId: c.line.id, docId: c.doc.id, docNo: c.doc.docNo, invoiceNo: c.doc.invoiceNo, docDate: c.doc.docDate, description: c.line.description, outstandingMinor: c.out, dueDate: c.doc.dueDate }; }) };
}
function periodList_(user, req) {
    requirePerm_(user, 'read');
    var ls = ledgerStart_(), today = todayVn_(), have = byId_(repoValid_('Period')), out = [], cur = monthOf_(ls), end = monthOf_(today);
    var guard = 0;
    while (cur <= end && guard++ < 120) {
        var p = have[cur];
        out.push({ id: cur, status: p ? p.status : 'OPEN', closedBy: p ? p.closedBy : '', closedAt: p ? p.closedAt : '', reopenRequestedBy: p ? p.reopenRequestedBy : '', reopenReason: p ? p.reopenReason : '', version: p ? p.version : 0 });
        var y = +cur.slice(0, 4), m = +cur.slice(5, 7);
        cur = m === 12 ? (y + 1) + '-01' : y + '-' + ('0' + (m + 1)).slice(-2);
    }
    return { items: out.reverse(), ledgerStartDate: ls };
}
function periodChecklist_(id) {
    var items = [], pending = 0;
    repoValid_('DebtDoc').forEach(function (d) { if (['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].indexOf(d.status) >= 0 && monthOf_(d.docDate || d.createdAt.slice(0, 10)) === id)
        pending++; });
    items.push({ code: 'DOC_PENDING', ok: pending === 0, message: pending ? pending + ' chứng từ chưa ghi nhận trong kỳ' : 'Không còn chứng từ chờ xử lý' });
    var pp = 0;
    repoValid_('Payment').forEach(function (x) { if (['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'].indexOf(x.status) >= 0 && monthOf_(x.effectiveDate) === id)
        pp++; });
    items.push({ code: 'PAY_PENDING', ok: pp === 0, message: pp ? pp + ' phiếu thu/chi chưa ghi nhận trong kỳ' : 'Không còn phiếu chờ xử lý' });
    var per = byId_(repoValid_('Period')), cur = monthOf_(ledgerStart_()), firstOpen = '', g = 0;
    while (cur < id && g++ < 240) {
        if (!per[cur] || per[cur].status !== 'CLOSED') {
            firstOpen = cur;
            break;
        }
        var cy = +cur.slice(0, 4), cm = +cur.slice(5, 7);
        cur = cm === 12 ? (cy + 1) + '-01' : cy + '-' + ('0' + (cm + 1)).slice(-2);
    }
    items.push({ code: 'PRIOR_OPEN', ok: !firstOpen, message: firstOpen ? 'Kỳ ' + firstOpen + ' chưa khóa: khóa các kỳ trước theo thứ tự' : 'Các kỳ trước đã khóa' });
    var ob = openingBatch_();
    items.push({ code: 'OPENING_PENDING', ok: !ob || ob.status === 'COMMITTED', message: ob && ob.status !== 'COMMITTED' ? 'Dư đầu kỳ chưa được duyệt và ghi nhận' : 'Dư đầu kỳ đã xử lý' });
    var open = Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {})).length;
    items.push({ code: 'TX_OPEN', ok: open === 0, message: open ? open + ' thao tác ghi chưa hoàn tất' : 'Không có thao tác ghi dở' });
    var unc = repoValid_('ImportBatch').filter(function (b) { return b.status === 'IN_REVIEW' || b.status === 'SUBMITTED'; }).length;
    items.push({ code: 'IMPORT_OPEN', ok: unc === 0, message: unc ? unc + ' lô nhập chưa xử lý' : 'Không còn lô nhập dang dở' });
    return items;
}
function periodCheck_(user, req) { requirePerm_(user, 'read'); if (!isMonth_(req.payload.id))
    throw err_('VALIDATION_FAILED', 'Kỳ không hợp lệ'); return { id: req.payload.id, checklist: periodChecklist_(req.payload.id) }; }
function periodClose_(user, req) {
    requirePerm_(user, 'period.close');
    var id = req.payload.id;
    if (!isMonth_(id))
        throw err_('VALIDATION_FAILED', 'Kỳ không hợp lệ');
    if (id > todayVn_().slice(0, 7))
        throw err_('VALIDATION_FAILED', 'Không khóa kỳ trong tương lai (' + id + ').', [{ path: 'id', code: 'PERIOD_FUTURE', message: 'Kỳ ' + id + ' chưa bắt đầu.' }]);
    if (id < ledgerStart_().slice(0, 7))
        throw err_('VALIDATION_FAILED', 'Kỳ ' + id + ' trước tháng đầu sổ (' + ledgerStart_().slice(0, 7) + ').', [{ path: 'id', code: 'PERIOD_BEFORE_LEDGER', message: 'Kỳ trước ngày đầu sổ.' }]);
    return runTx_(user, { requestId: req.requestId, action: 'period.close', payload: req.payload, failAt: req.failAt }, function (tx) {
        var chk = periodChecklist_(id), bad = chk.filter(function (c) { return !c.ok; });
        if (bad.length)
            throw err_('PERIOD_CHECK_FAILED', 'Chưa đủ điều kiện khóa kỳ: ' + bad.map(function (b) { return b.message; }).join('; '), bad.map(function (b) { return { path: b.code, code: b.code, message: b.message }; }));
        var per = tx.find('Period', id), row;
        if (!per)
            row = tx.insert('Period', { id: id, startDate: id + '-01', endDate: monthEnd_(id), status: 'CLOSED', closedBy: user.id, closedAt: tx.now });
        else {
            if (per.status === 'CLOSED')
                throw err_('STATE_TRANSITION_INVALID', 'Kỳ đã khóa.');
            row = tx.update('Period', id, { status: 'CLOSED', closedBy: user.id, closedAt: tx.now, reopenRequestedBy: '', reopenReason: '' }, req.payload.ifVersion);
        }
        return { result: { id: id, status: 'CLOSED' }, audit: [{ entityType: 'Period', entityId: id, action: 'period.close', diff: null }] };
    });
}
function periodReopenRequest_(user, req) {
    requirePerm_(user, 'period.reopenRequest');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'period.reopenRequest', payload: p, failAt: req.failAt }, function (tx) {
        var per = tx.find('Period', p.id);
        if (!per || per.status !== 'CLOSED')
            throw err_('STATE_TRANSITION_INVALID', 'Chỉ yêu cầu mở lại kỳ đã khóa.');
        if (!String(p.reason || '').trim())
            throw err_('VALIDATION_FAILED', 'Nhập lý do mở lại.', [{ path: 'reason', code: 'REQUIRED', message: 'Nhập lý do.' }]);
        tx.update('Period', p.id, { reopenRequestedBy: user.id, reopenReason: maxStr_(p.reason, 300) });
        return { result: { id: p.id, status: 'CLOSED', reopenRequested: true }, audit: [{ entityType: 'Period', entityId: p.id, action: 'period.reopenRequest', diff: { reason: p.reason } }] };
    });
}
function periodReopenConfirm_(user, req) {
    requirePerm_(user, 'period.reopenConfirm');
    var p = req.payload;
    return runTx_(user, { requestId: req.requestId, action: 'period.reopenConfirm', payload: p, failAt: req.failAt }, function (tx) {
        var per = tx.find('Period', p.id);
        if (!per || per.status !== 'CLOSED' || !per.reopenRequestedBy)
            throw err_('STATE_TRANSITION_INVALID', 'Chưa có yêu cầu mở lại hợp lệ.');
        if (per.reopenRequestedBy === user.id)
            throw err_('SELF_APPROVAL_FORBIDDEN', 'Người yêu cầu không được tự xác nhận.');
        tx.update('Period', p.id, { status: 'REOPENED' });
        return { result: { id: p.id, status: 'REOPENED' }, audit: [{ entityType: 'Period', entityId: p.id, action: 'period.reopenConfirm', diff: { reason: per.reopenReason } }] };
    });
}
function rcNum_(v) { return typeof v === 'number' && isFinite(v) ? v : (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : null); }
function rcStr_(v) { return v === null || v === undefined ? '' : String(v).trim(); }
function rcMinor_(v, cur) { return cur === 'USD' ? Math.round(v * 100) : Math.round(v); }
function rcIsTotal_(s) { return /^(t[oổ]ng|c[oộ]ng)/i.test(normText_(s).replace(/^(\w)/, '$1')) || /^t[ổo]ng/i.test(String(s).trim().toLowerCase()); }
/* Khóa so khớp: bỏ dấu, chữ hoa/thường, khoảng trắng và dấu phân cách; số thuần túy bỏ số 0 đầu. */
function rcKey_(s) {
    var k = normText_(s).replace(/ /g, '');
    return /^\d+$/.test(k) ? (k.replace(/^0+/, '') || '0') : k;
}
function reconParseWorkbook(sheets) {
    var out = { ar: [], ap: [], bmt: [], gaps: [], skipped: {}, seen: {} }, DEC = currencyMap_();
    function skip(k) { out.skipped[k] = (out.skipped[k] || 0) + 1; }
    function seen(k, r) { if (r.some(function (c) { return c !== null && c !== undefined && String(c).trim() !== ''; }))
        out.seen[k] = (out.seen[k] || 0) + 1; }
    function rcMinor_(v, cur) { var m = DEC[cur], dec = m ? m.decimals : (cur === 'USD' ? 2 : 0); return Math.round(Number((v * Math.pow(10, dec)).toFixed(6))); }
    [['fwd', 'VND', 'FWD'], ['cbt', 'USD', 'CBT']].forEach(function (d) {
        (sheets[d[0]] || []).forEach(function (r, i) {
            if (i < 2)
                return;
            seen(d[0], r);
            var partner = rcStr_(r[1]), svc = rcStr_(r[2]), debit = rcNum_(r[4]);
            if (!partner || !svc || debit === null || /^t[ổo]ng/i.test(partner.toLowerCase())) {
                if (partner || svc || r[4] !== undefined && r[4] !== '')
                    skip(d[0]);
                return;
            }
            var paid = rcNum_(r[5]) || 0;
            out.ar.push({ sheet: d[0], row: i + 1, group: d[2], currency: d[1], partner: partner, svc: svc, debit: rcMinor_(debit, d[1]), paid: rcMinor_(paid, d[1]), out: rcMinor_(debit, d[1]) - rcMinor_(paid, d[1]), status: rcStr_(r[7]) });
        });
    });
    (sheets.ncc || []).forEach(function (r, i) {
        if (i < 2)
            return;
        seen('ncc', r);
        var partner = rcStr_(r[1]), debit = rcNum_(r[7]);
        if (!partner || debit === null || /^t[ổo]ng/i.test(rcStr_(r[0]).toLowerCase())) {
            if (partner)
                skip('ncc');
            return;
        }
        var cur = rcStr_(r[6]) || 'VND', paid = rcNum_(r[8]) || 0;
        out.ap.push({ sheet: 'ncc', row: i + 1, partner: partner, invoiceNo: rcStr_(r[4]), currency: cur, debit: rcMinor_(debit, cur), paid: rcMinor_(paid, cur), out: rcMinor_(debit, cur) - rcMinor_(paid, cur), status: rcStr_(r[10]), desc: rcStr_(r[5]).slice(0, 80) });
    });
    (sheets.bmt || []).forEach(function (r, i) {
        if (i < 2)
            return;
        seen('bmt', r);
        var svc = rcStr_(r[1]);
        if (!/^GML\//i.test(svc)) {
            if (rcStr_(r[0]) && !/^t[ổo]ng/i.test(rcStr_(r[0]).toLowerCase()))
                skip('bmt');
            return;
        }
        var st = normText_(r[8]), kind = st.indexOf('da thanh toan') === 0 ? 'PAID' : st.indexOf('chua thanh toan') === 0 ? 'UNPAID' : st.indexOf('chua du giay to') === 0 ? 'HOLD' : st.indexOf('chua co du lieu') === 0 ? 'GAP' : 'UNKNOWN';
        if (kind === 'UNKNOWN')
            skip('bmt (trạng thái lạ: "' + rcStr_(r[8]).slice(0, 30) + '")');
        var vc = rcNum_(r[3]), ht = rcNum_(r[5]), any = false;
        [[vc, r[4], 'Phí vận chuyển'], [ht, r[6], 'Phí hạ tầng']].forEach(function (x) {
            if (x[0] === null)
                return;
            any = true;
            out.bmt.push({ sheet: 'bmt', row: i + 1, svc: svc, invoiceNo: rcStr_(x[1]), kind: kind, fee: x[2], amount: Math.round(x[0]), batch: rcStr_(r[9]), status: rcStr_(r[8]) });
        });
        if (!any)
            out.gaps.push({ sheet: 'bmt', row: i + 1, svc: svc, status: rcStr_(r[8]), batch: rcStr_(r[9]) });
    });
    return out;
}
function reconCompare(parsed, sys) {
    var sections = [], notes = [];
    function pmatch(name) {
        var n = normText_(name), hits = sys.partners.filter(function (p) { var s = normText_(p.shortName), l = normText_(p.legalName); return n === s || n === l || (s.length >= 3 && n.indexOf(s) >= 0); });
        return hits.length === 1 ? hits[0] : null;
    }
    ['FWD:VND', 'CBT:USD'].forEach(function (k) {
        var g = k.split(':')[0], cur = k.split(':')[1], ex = {}, sy = {}, exTotal = 0, syTotal = 0;
        parsed.ar.filter(function (r) { return r.group === g; }).forEach(function (r) { var key = rcKey_(r.svc); ex[key] = ex[key] || { label: r.svc, v: 0, n: 0 }; ex[key].v += r.out; ex[key].n++; exTotal += r.out; });
        sys.arLines.filter(function (l) { return l.currency === cur && (!g || l.group === g || !l.group); }).forEach(function (l) { var key = l.svc ? rcKey_(l.svc) : '(chưa có mã dịch vụ)'; sy[key] = sy[key] || { label: l.svc || '(không có HSDV)', v: 0 }; sy[key].v += l.out; syTotal += l.out; });
        var rows = [], keys = {};
        Object.keys(ex).concat(Object.keys(sy)).forEach(function (x) { keys[x] = 1; });
        var matched = 0;
        Object.keys(keys).sort().forEach(function (key) {
            var e = ex[key], s = sy[key], ev = e ? e.v : 0, sv = s ? s.v : 0;
            if (e && s && ev === sv) {
                matched++;
                return;
            }
            if (!e && sv === 0)
                return;
            rows.push({ key: (e || s).label, excel: e ? ev : null, system: s ? sv : null, diff: sv - ev, status: !s ? (ev === 0 ? 'MISSING_PAID' : 'MISSING_IN_SYSTEM') : !e ? 'ONLY_IN_SYSTEM' : 'DIFF', note: e && e.n > 1 ? 'HSDV lặp ' + e.n + ' dòng trong Excel (đã cộng)' : '' });
        });
        sections.push({ id: 'AR-' + g, title: 'Phải thu ' + g + ' (' + cur + ') – theo mã dịch vụ', currency: cur, excelTotal: exTotal, systemTotal: syTotal, diff: syTotal - exTotal, matched: matched, rows: rows });
    });
    var outOfScope = {};
    sys.arLines.forEach(function (l) {
        var inFwd = l.currency === 'VND' && (l.group === 'FWD' || !l.group), inCbt = l.currency === 'USD' && (l.group === 'CBT' || !l.group);
        if (inFwd || inCbt || !l.out)
            return;
        var k = (l.group || '(không nhóm)') + ' · ' + l.currency;
        outOfScope[k] = (outOfScope[k] || 0) + l.out;
    });
    Object.keys(outOfScope).filter(function (k) { return outOfScope[k] !== 0; }).forEach(function (k) {
        notes.push('Phải thu của nhóm/tiền tệ ' + k + ' còn ' + outOfScope[k] + ' (đơn vị nhỏ nhất) không có trong file Excel mẫu (chỉ có FWD–VND và CBT–USD) nên KHÔNG được so sánh.');
    });
    var apEx = {}, apSys = {}, apTot = {}, apSysTot = {}, apRows = [], unmatchedP = {};
    parsed.ap.forEach(function (r) {
        var p = pmatch(r.partner);
        if (!p) {
            unmatchedP[r.partner] = 1;
        }
        var key = (p ? p.id : 'x:' + normText_(r.partner)) + '|' + rcKey_(r.invoiceNo) + '|' + r.currency;
        apEx[key] = apEx[key] || { label: (p ? p.shortName : r.partner) + ' · HĐ ' + r.invoiceNo, v: 0, cur: r.currency, desc: r.desc };
        apEx[key].v += r.out;
        apTot[r.currency] = (apTot[r.currency] || 0) + r.out;
    });
    var exPartners = {};
    parsed.ap.forEach(function (r) { var p = pmatch(r.partner); if (p)
        exPartners[p.id] = 1; });
    sys.apDocs.filter(function (d) { return exPartners[d.partnerId]; }).forEach(function (d) {
        var key = d.partnerId + '|' + rcKey_(d.invoiceNo) + '|' + d.currency, pn = sys.partners.filter(function (x) { return x.id === d.partnerId; })[0];
        apSys[key] = apSys[key] || { label: (pn ? pn.shortName : d.partnerId) + ' · HĐ ' + (d.invoiceNo || '(không số HĐ)'), v: 0, cur: d.currency };
        apSys[key].v += d.out;
        apSysTot[d.currency] = (apSysTot[d.currency] || 0) + d.out;
    });
    var apCur = {};
    Object.keys(apTot).concat(Object.keys(apSysTot)).forEach(function (c) { apCur[c] = 1; });
    Object.keys(apCur).forEach(function (cur) {
        var rows = [], matched = 0, keys = {};
        Object.keys(apEx).concat(Object.keys(apSys)).forEach(function (x) { keys[x] = 1; });
        Object.keys(keys).sort().forEach(function (key) {
            var e = apEx[key], s = apSys[key];
            if ((e && e.cur !== cur) || (!e && s && s.cur !== cur))
                return;
            var ev = e ? e.v : 0, sv = s ? s.v : 0;
            if (e && s && ev === sv) {
                matched++;
                return;
            }
            if (!e && sv === 0)
                return;
            rows.push({ key: (e || s).label, excel: e ? ev : null, system: s ? sv : null, diff: sv - ev, status: !s ? (ev === 0 ? 'MISSING_PAID' : 'MISSING_IN_SYSTEM') : !e ? 'ONLY_IN_SYSTEM' : 'DIFF', note: e ? e.desc : '' });
        });
        sections.push({ id: 'AP-NCC-' + cur, title: 'Phải trả NCC/Shipper (' + cur + ') – theo đối tác và số hóa đơn', currency: cur, excelTotal: apTot[cur] || 0, systemTotal: apSysTot[cur] || 0, diff: (apSysTot[cur] || 0) - (apTot[cur] || 0), matched: matched, rows: rows });
    });
    if (parsed.ap.length) {
        var absent = {};
        sys.apDocs.forEach(function (d) {
            if (exPartners[d.partnerId] || !d.out)
                return;
            var k = d.partnerId + '|' + d.currency;
            absent[k] = (absent[k] || 0) + d.out;
        });
        var absentList = Object.keys(absent).filter(function (k) { return absent[k] !== 0; }).map(function (k) { var x = k.split('|'), pn = sys.partners.filter(function (q) { return q.id === x[0]; })[0]; return (pn ? pn.shortName : x[0]) + ' (' + x[1] + ') ' + absent[k]; });
        if (absentList.length)
            notes.push('Phải trả trong hệ thống của đối tác KHÔNG xuất hiện trong sheet NCC của Excel (không so sánh, đơn vị nhỏ nhất): ' + absentList.slice(0, 15).join('; ') + (absentList.length > 15 ? '… (+' + (absentList.length - 15) + ')' : '') + '.');
    }
    if (Object.keys(unmatchedP).length)
        notes.push('Nhà cung cấp trong Excel chưa khớp được đối tác nào (hoặc khớp nhiều): ' + Object.keys(unmatchedP).join('; ') + '. Hãy đặt tên viết tắt đối tác trùng một phần tên trong Excel.');
    var bp = pmatch('BMT'), bex = {}, bsy = {}, bExTot = 0, bSyTot = 0, holdTotal = 0, bRows = [], bMatched = 0;
    parsed.bmt.forEach(function (r) {
        if (r.kind === 'HOLD') {
            holdTotal += r.amount;
            return;
        }
        if (r.kind === 'GAP' || r.kind === 'UNKNOWN')
            return;
        var out = r.kind === 'UNPAID' ? r.amount : 0, key = rcKey_(r.invoiceNo) || ('svc:' + r.svc + ':' + r.fee);
        bex[key] = bex[key] || { label: 'HĐ ' + (r.invoiceNo || '?') + ' · ' + r.svc + ' · ' + r.fee + (r.batch ? ' · ' + r.batch : ''), v: 0 };
        bex[key].v += out;
        bExTot += out;
    });
    if (bp)
        sys.apDocs.filter(function (d) { return d.partnerId === bp.id; }).forEach(function (d) { var key = rcKey_(d.invoiceNo) || ('doc:' + d.docId); bsy[key] = bsy[key] || { label: 'HĐ ' + d.invoiceNo, v: 0 }; bsy[key].v += d.out; bSyTot += d.out; });
    else
        notes.push('Chưa có đối tác tên "BMT" trong hệ thống nên không đối chiếu được mục BMT.');
    if (bp) {
        var bkeys = {};
        Object.keys(bex).concat(Object.keys(bsy)).forEach(function (x) { bkeys[x] = 1; });
        Object.keys(bkeys).sort().forEach(function (key) { var e = bex[key], s = bsy[key], ev = e ? e.v : 0, sv = s ? s.v : 0; if (e && s && ev === sv) {
            bMatched++;
            return;
        } if (!e && sv === 0)
            return; bRows.push({ key: (e || s).label, excel: e ? ev : null, system: s ? sv : null, diff: sv - ev, status: !s ? (ev === 0 ? 'MISSING_PAID' : 'MISSING_IN_SYSTEM') : !e ? 'ONLY_IN_SYSTEM' : 'DIFF', note: '' }); });
        sections.push({ id: 'AP-BMT', title: 'Phải trả BMT (VND) – theo số hóa đơn (chưa thanh toán theo trạng thái chữ)', currency: 'VND', excelTotal: bExTot, systemTotal: bSyTot, diff: bSyTot - bExTot, matched: bMatched, rows: bRows });
    }
    if (holdTotal)
        notes.push('BMT "Chưa đủ giấy tờ": ' + holdTotal + ' VND – không nằm trong so sánh; hệ thống phải để ở trạng thái chờ (không ghi nhận).');
    if (parsed.gaps.length)
        notes.push('BMT không có số tiền (không phải 0): ' + parsed.gaps.length + ' mã (' + parsed.gaps.slice(0, 12).map(function (g) { return g.svc.split('/').pop(); }).join(', ') + (parsed.gaps.length > 12 ? '…' : '') + ').');
    var parsedCount = { fwd: parsed.ar.filter(function (r) { return r.sheet === 'fwd'; }).length, cbt: parsed.ar.filter(function (r) { return r.sheet === 'cbt'; }).length, ncc: parsed.ap.length, bmt: parsed.bmt.length + parsed.gaps.length };
    Object.keys(parsed.seen || {}).forEach(function (k) {
        if (parsed.seen[k] > 0 && !parsedCount[k])
            notes.push('Sheet ' + k.toUpperCase() + ': có ' + parsed.seen[k] + ' dòng dữ liệu nhưng không đọc được dòng nào. File có thể không đúng mẫu cột (hệ thống đọc theo vị trí cột cố định); kiểm tra trước khi tin kết quả.');
    });
    var sk = Object.keys(parsed.skipped);
    if (sk.length)
        notes.push('Dòng không đọc được (bỏ qua, kiểm tra tay): ' + sk.map(function (k) { return k + ' ' + parsed.skipped[k]; }).join(', '));
    notes.push('Cột "Đã thu/đã trả" trong Excel của các dòng "ĐÃ NHẬN" là số suy ra từ trạng thái; chênh lệch với sổ thu/chi thật cần đối chiếu sao kê.');
    return { sections: sections, notes: notes, excelRows: { ar: parsed.ar.length, ap: parsed.ap.length, bmt: parsed.bmt.length, gaps: parsed.gaps.length } };
}
function reconExcel_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, sheets = p.sheets || {}, asOf = p.asOf || todayVn_();
    if (!isDate_(asOf) || asOf < ledgerStart_())
        throw err_('VALIDATION_FAILED', 'Ngày đối chiếu không hợp lệ (phải từ ngày đầu sổ).');
    var big = 0;
    ['fwd', 'cbt', 'ncc', 'bmt'].forEach(function (k) { if (!Array.isArray(sheets[k]))
        sheets[k] = []; big += sheets[k].length; });
    if (big > 5000)
        throw err_('VALIDATION_FAILED', 'File quá lớn (tối đa 5.000 dòng).');
    var parsed = reconParseWorkbook(sheets), led = loadLedger_(user, asOf), sysArLines = [], apDocs = [];
    led.lines.forEach(function (l) {
        var b = led.bal.byLine[l.id];
        if (!b)
            return;
        var d = led.docById[l.docId];
        if (d.direction === 'AR')
            sysArLines.push({ currency: d.currency, group: d.businessGroupCode, svc: l.serviceCode || '', out: b.out });
    });
    led.docs.forEach(function (d) { var b = led.bal.byDoc[d.id]; if (d.direction === 'AP' && b)
        apDocs.push({ partnerId: d.partnerId, invoiceNo: d.invoiceNo, currency: d.currency, out: b.out, docId: d.id }); });
    var res = reconCompare(parsed, { arLines: sysArLines, apDocs: apDocs, partners: repoValid_('Partner').filter(function (x) { return inScope_(user, x, ''); }).map(function (x) { return { id: x.id, shortName: x.shortName, legalName: x.legalName }; }) });
    res.asOf = asOf;
    writeAudit_(user, req.requestId || '', '', [{ entityType: 'Recon', entityId: 'excel', action: 'recon.excel', diff: { asOf: asOf, rows: res.excelRows } }]);
    return res;
}
var REPORTS_ = {
    R01: { title: 'BÁO CÁO TỔNG HỢP CÔNG NỢ CUỐI NGÀY', orientation: 'portrait' },
    R02: { title: 'BẢNG CHI TIẾT CÔNG NỢ PHẢI THU KHÁCH HÀNG', orientation: 'landscape' },
    R03: { title: 'BẢNG CHI TIẾT CÔNG NỢ PHẢI TRẢ NCC/SHIPPER', orientation: 'landscape' },
    R04: { title: 'BẢNG CÔNG NỢ THEO MÃ DỊCH VỤ VÀ ĐỢT', orientation: 'landscape' },
    R05: { title: 'BẢNG QUYẾT TOÁN CÔNG NỢ', orientation: 'landscape' },
    R06: { title: 'BIÊN BẢN ĐỐI CHIẾU/XÁC NHẬN CÔNG NỢ', orientation: 'portrait' },
    R07: { title: 'BÁO CÁO TUỔI NỢ', orientation: 'landscape' },
    R08: { title: 'SỔ THU/CHI VÀ PHÂN BỔ THANH TOÁN', orientation: 'landscape' },
    R09: { title: 'BÁO CÁO DOANH THU – CHI PHÍ – LÃI GỘP THEO ĐƠN HÀNG/MÃ DỊCH VỤ', orientation: 'landscape' },
    R10: { title: 'BẢNG KÊ HÀNG HÓA, DỊCH VỤ BÁN RA (THUẾ GTGT)', orientation: 'landscape' },
    R11: { title: 'BẢNG KÊ HÀNG HÓA, DỊCH VỤ MUA VÀO (THUẾ GTGT)', orientation: 'landscape' },
    R12: { title: 'DỰ BÁO DÒNG TIỀN THU – CHI THEO HẠN THANH TOÁN', orientation: 'landscape' },
    R13: { title: 'CHÊNH LỆCH TỶ GIÁ ĐÃ THỰC HIỆN', orientation: 'landscape' },
    R14: { title: 'CÔNG NỢ NGOẠI TỆ QUY ĐỔI VND TẠI NGÀY CHỐT', orientation: 'landscape' }
};
var PAY_STATUS_VN_ = { UNPAID: 'Chưa thanh toán', PARTIAL: 'Thanh toán một phần', PAID: 'Đã thanh toán', CREDIT: 'Ghi có', ZERO: '—' };
function newReport_(code, params, columns) {
    var def = REPORTS_[code];
    return { code: code, title: def.title, orientation: def.orientation, meta: { dateBasis: DATE_BASIS_ === 'DOC' ? 'Ngày chứng từ' : 'Ngày ghi nhận', asOf: params.asOf || todayVn_(), params: params, generatedAt: nowIso_(), dataVersion: dataVersion_(),
            entity: { name: cfgGet_('entity.name', ''), address: cfgGet_('entity.address', ''), taxCode: cfgGet_('entity.taxCode', ''), bank: cfgGet_('entity.bank', ''), phone: cfgGet_('entity.phone', ''), email: cfgGet_('entity.email', '') } },
        columns: columns, rows: [], notes: [DATE_BASIS_ === 'DOC' ? 'CƠ SỞ NGÀY: NGÀY CHỨNG TỪ (chế độ xem/đối chiếu, có thể khác sổ đã chốt theo ngày ghi nhận).' : 'Cơ sở ngày: ngày ghi nhận chứng từ vào sổ (chứng từ ghi nhận sau ngày chốt không làm đổi số tại ngày chốt).'], words: [], issueBlockers: [] };
}
function col_(key, label, type, align) { return { key: key, label: label, type: type || 'text', align: align || (type === 'money' || type === 'int' ? 'right' : (type === 'date' ? 'center' : 'left')) }; }
function addRow_(rep, t, cells, currency) { rep.rows.push({ t: t, cells: cells, currency: currency || '' }); }
function reportRun_(user, req) {
    requirePerm_(user, 'report.read');
    var p = req.payload || {}, code = p.code;
    if (!REPORTS_[code])
        throw err_('NOT_FOUND', 'Mẫu báo cáo không tồn tại.');
    var params = Object.assign({}, p.params || {});
    DATE_BASIS_ = params.dateBasis === 'DOC' ? 'DOC' : 'POSTING';
    if (params.asOf && !isDate_(params.asOf))
        throw err_('VALIDATION_FAILED', 'Ngày chốt không hợp lệ');
    params.asOf = params.asOf || todayVn_();
    if (params.asOf < ledgerStart_())
        throw err_('NO_HISTORY', 'Chưa có dữ liệu trước ngày đầu sổ (' + ledgerStart_() + ').');
    var fn = { R01: rep01_, R02: rep02_, R03: rep02_, R04: rep04_, R05: rep05_, R06: rep06_, R07: rep07_, R08: rep08_, R09: rep09_, R10: rep10_, R11: rep11_, R12: rep12_, R13: rep13_, R14: rep14_ }[code];
    var rep;
    try {
        rep = fn(user, code, params);
    }
    finally {
        DATE_BASIS_ = 'POSTING';
    }
    rep.meta.user = user.displayName || user.email;
    return rep;
}
function sumCur_(map, cur, key, v) { var m = map[cur] = map[cur] || {}; m[key] = (m[key] || 0) + v; }
function rep01_(user, code, params) {
    var led = loadLedger_(user, params.asOf), rep = newReport_(code, params, [col_('stt', 'STT', 'int', 'center'), col_('label', 'Loại công nợ / nhóm nghiệp vụ'), col_('currency', 'Tiền tệ', 'text', 'center'),
        col_('gross', 'Tổng phải thu/trả', 'money'), col_('settled', 'Đã thu/đã trả', 'money'), col_('out', 'Còn công nợ', 'money'), col_('note', 'Ghi chú')]);
    var groupsName = {};
    catalogList_('BUSINESS_GROUP', true).forEach(function (c) { groupsName[c.code] = c.name || c.code; });
    var agg = {}, tot = {}, aggB = {}, totB = { AR: { g: 0, s: 0, o: 0 }, AP: { g: 0, s: 0, o: 0 } }, bc = bookCtx_(), hasForeign = false, missB = 0;
    led.lines.forEach(function (l) {
        var b = led.bal.byLine[l.id];
        if (!b)
            return;
        var d = led.docById[l.docId];
        if (params.group && d.businessGroupCode !== params.group)
            return;
        // R36: giá trị ghi sổ VND (tỷ giá đã lưu trên chứng từ); đã thu quy đổi = tổng − còn lại để ba cột luôn khớp
        if (d.currency !== BASE_CUR_)
            hasForeign = true;
        var gB = bookOfLine_(bc, d, b.gross + b.adjust), oB = bookOfLine_(bc, d, b.out);
        if (gB === null || oB === null)
            missB++;
        else {
            var kb = d.direction + '|' + d.businessGroupCode, ab = aggB[kb] = aggB[kb] || { g: 0, s: 0, o: 0 };
            ab.g += gB;
            ab.s += gB - oB;
            ab.o += oB;
            totB[d.direction].g += gB;
            totB[d.direction].s += gB - oB;
            totB[d.direction].o += oB;
        }
        var k = [d.direction, d.businessGroupCode, d.currency].join('|'), a = agg[k] = agg[k] || { g: 0, s: 0, o: 0, partners: {} };
        a.g += b.gross + b.adjust;
        a.s += b.alloc;
        a.o += b.out;
        if (b.out > 0)
            a.partners[partnerName_(led.pm, d.partnerId)] = 1;
        var tk = d.direction + '|' + d.currency, t = tot[tk] = tot[tk] || { g: 0, s: 0, o: 0 };
        t.g += b.gross + b.adjust;
        t.s += b.alloc;
        t.o += b.out;
    });
    var n = 0;
    Object.keys(agg).sort().forEach(function (k) {
        var x = k.split('|'), a = agg[k];
        addRow_(rep, 'data', { stt: ++n, label: (x[0] === 'AR' ? 'Phải thu – ' : 'Phải trả – ') + (groupsName[x[1]] || x[1]), currency: x[2], gross: a.g, settled: a.s, out: a.o, note: Object.keys(a.partners).slice(0, 4).join(', ') }, x[2]);
    });
    ['AR', 'AP'].forEach(function (dir) {
        Object.keys(tot).filter(function (k) { return k.indexOf(dir + '|') === 0; }).sort().forEach(function (k) {
            var cur = k.split('|')[1], t = tot[k];
            addRow_(rep, 'total', { label: dir === 'AR' ? 'TỔNG PHẢI THU' : 'TỔNG PHẢI TRẢ', currency: cur, gross: t.g, settled: t.s, out: t.o }, cur);
        });
    });
    if (hasForeign) {
        // Quy đổi VND (tham khảo): mỗi dòng chứng từ theo tỷ giá đã lưu trên chứng từ; tiền chưa phân bổ theo tỷ giá/số VND đã lưu trên phiếu. Ròng = (phải thu − ứng trước) − (phải trả − trả trước).
        addRow_(rep, 'group', { stt: 'Quy đổi ' + BASE_CUR_ + ' – theo tỷ giá đã lưu trên từng chứng từ (tham khảo)' }, BASE_CUR_);
        Object.keys(aggB).sort().forEach(function (k) {
            var x = k.split('|'), a = aggB[k];
            addRow_(rep, 'data', { stt: ++n, label: (x[0] === 'AR' ? 'Phải thu – ' : 'Phải trả – ') + (groupsName[x[1]] || x[1]), currency: BASE_CUR_, gross: a.g, settled: a.s, out: a.o }, BASE_CUR_);
        });
        var advB = { AR: 0, AP: 0 };
        led.payments.forEach(function (x) { var b = led.payBal[x.id]; if (b && b.unalloc > 0 && x.status === 'POSTED') {
            var v = bookOfAdv_(bc, x, b.unalloc);
            if (v === null)
                missB++;
            else
                advB[x.direction === 'IN' ? 'AR' : 'AP'] += v;
        } });
        ['AR', 'AP'].forEach(function (dir) {
            addRow_(rep, 'total', { label: dir === 'AR' ? 'TỔNG PHẢI THU QUY ĐỔI VND' : 'TỔNG PHẢI TRẢ QUY ĐỔI VND', currency: BASE_CUR_, gross: totB[dir].g, settled: totB[dir].s, out: totB[dir].o }, BASE_CUR_);
            if (advB[dir])
                addRow_(rep, 'data', { label: dir === 'AR' ? 'Tiền thu chưa phân bổ (ứng trước) quy đổi VND' : 'Tiền chi chưa phân bổ (trả trước) quy đổi VND', currency: BASE_CUR_, settled: advB[dir], out: -advB[dir] }, BASE_CUR_);
        });
        addRow_(rep, 'total', { label: 'CÔNG NỢ RÒNG QUY ĐỔI VND (phải thu − phải trả, sau khi trừ ứng trước)', currency: BASE_CUR_, out: (totB.AR.o - advB.AR) - (totB.AP.o - advB.AP) }, BASE_CUR_);
        if (missB)
            rep.notes.push(missB + ' dòng/phiếu chưa có tỷ giá ghi nhận (chứng từ hoặc bảng Tỷ giá) nên chưa được quy đổi VND; số nguyên tệ ở các phần trên vẫn đủ.');
        rep.notes.push('Phần "Quy đổi VND" là giá trị ghi sổ theo tỷ giá đã lưu lúc ghi nhận (không đánh giá lại theo tỷ giá ngày chốt – xem R14).');
    }
    if (!rep.rows.length)
        rep.notes.push('Chưa có dữ liệu công nợ đã ghi nhận trong phạm vi quyền.');
    var pend = {};
    led.docs.forEach(function (d) { if (['DRAFT', 'SUBMITTED', 'APPROVED'].indexOf(d.status) >= 0 && (!params.group || d.businessGroupCode === params.group)) {
        var m = pend[d.currency] = pend[d.currency] || { n: 0, a: 0 };
        m.n++;
        m.a += d.totalGrossMinor;
    } });
    Object.keys(pend).forEach(function (c) { rep.notes.push('Chờ ghi nhận (không nằm trong tổng): ' + pend[c].n + ' chứng từ, ' + fmtMoney_(pend[c].a, c) + ' ' + c); });
    var adv = {};
    led.payments.forEach(function (x) { var b = led.payBal[x.id]; if (b && b.unalloc > 0) {
        var k = x.direction + ':' + x.currency;
        adv[k] = (adv[k] || 0) + b.unalloc;
    } });
    Object.keys(adv).forEach(function (k) { var a = k.split(':'); rep.notes.push((a[0] === 'IN' ? 'Tiền nhận chưa phân bổ/ứng trước: ' : 'Tiền trả chưa phân bổ/trả trước: ') + fmtMoney_(adv[k], a[1]) + ' ' + a[1]); });
    rep.notes.push('Các phần theo từng tiền tệ được theo dõi riêng, không cộng chéo; số quy đổi VND chỉ nằm ở phần "Quy đổi VND" riêng (nếu có). Số dư tính tại ngày chốt ' + params.asOf + '.');
    rep.signatures = true;
    return rep;
}
function fmtMoney_(minor, cur) {
    if (minor === null || minor === undefined || minor === '')
        return '';
    return formatMinorVn_(minor, (currencyMap_()[cur] || { decimals: 0 }).decimals);
}
/* Chứng từ có hiện trong báo cáo chi tiết tại ngày chốt không: đã ghi nhận, hoặc đã bị đảo sau ngày chốt (tại ngày chốt vẫn còn hiệu lực nên còn số). Chứng từ đảo xong trước ngày chốt, đã về 0, thì ẩn. */
function docShownAt_(d, b) {
    if (!b || !COUNTED_DOC_STATUS_[d.status])
        return false;
    return d.status === 'POSTED' || b.gross + b.adjust !== 0 || b.alloc !== 0 || b.out !== 0;
}
function rep02_(user, code, params) {
    var dir = code === 'R02' ? 'AR' : 'AP';
    var led = loadLedger_(user, params.asOf), lineByDoc = groupBy_(led.lines, function (l) { return l.docId; });
    var rep = newReport_(code, params, [col_('stt', 'STT', 'int', 'center'), col_('docNo', 'Số CT'), col_('docDate', 'Ngày CT', 'date'), col_('invoiceNo', 'Số HĐ'), col_('svc', 'Mã dịch vụ'),
        col_('desc', 'Nội dung'), col_('gross', dir === 'AR' ? 'Phải thu' : 'Phải trả', 'money'), col_('settled', dir === 'AR' ? 'Đã thu' : 'Đã trả', 'money'), col_('out', dir === 'AR' ? 'Còn phải thu' : 'Còn phải trả', 'money'),
        col_('dueDate', 'Đến hạn', 'date'), col_('status', 'Tình trạng (tính)'), col_('note', 'Ghi chú (người nhập)')]);
    var docs = led.docs.filter(function (d) {
        return d.direction === dir && docShownAt_(d, led.bal.byDoc[d.id]) && (!params.partnerId || d.partnerId === params.partnerId) && (!params.group || d.businessGroupCode === params.group) &&
            (!params.currency || d.currency === params.currency) && (!params.onlyOutstanding || led.bal.byDoc[d.id].out !== 0);
    }).sort(function (a, b) { return cmpStr_(partnerName_(led.pm, a.partnerId), partnerName_(led.pm, b.partnerId)) || cmpStr_(a.currency, b.currency) || cmpStr_(docEffDate_(a), docEffDate_(b)) || cmpStr_(a.docNo, b.docNo); });
    var grand = {}, cur = null, sub = null, n = 0, lastKey = '', advBy = {}, payDir = dir === 'AR' ? 'IN' : 'OUT', bc = bookCtx_(), baseBy = {}, hasForeign = false, missB = 0;
    // Tiền thu/chi đã ghi nhận nhưng chưa phân bổ vào chứng từ (ứng trước) theo đối tác + tiền tệ: tính vào số "đã thu/đã trả" ở mức đối tác (phân bổ theo chứng từ vẫn giữ nguyên ở từng dòng).
    led.payments.forEach(function (x) { var b = led.payBal[x.id]; if (b && b.unalloc !== 0 && x.direction === payDir)
        advBy[x.partnerId + '|' + x.currency] = (advBy[x.partnerId + '|' + x.currency] || 0) + b.unalloc; });
    function flush() { if (sub) {
        addRow_(rep, 'subtotal', { desc: 'Cộng ' + sub.name, currency: sub.cur, gross: sub.g, settled: sub.s, out: sub.o }, sub.cur);
        var adv = advBy[sub.key] || 0;
        if (adv) {
            // MỘT dòng: số tiền chưa phân bổ ghi ngay trong nhãn; "đã thu/đã trả" gồm cả phần này, "còn" đã trừ phần này
            addRow_(rep, 'subtotal', { desc: 'Cộng ' + sub.name + ' – ' + (dir === 'AR' ? 'đã thu gồm ứng trước ' : 'đã trả gồm trả trước ') + fmtMoney_(adv, sub.cur) + ' ' + sub.cur, currency: sub.cur, gross: sub.g, settled: sub.s + adv, out: sub.o - adv }, sub.cur);
            sumCur_(grand, sub.cur, 'a', adv);
        }
    } }
    docs.forEach(function (d) {
        var key = d.partnerId + '|' + d.currency;
        if (key !== lastKey) {
            flush();
            sub = { name: partnerName_(led.pm, d.partnerId), cur: d.currency, g: 0, s: 0, o: 0, key: key };
            addRow_(rep, 'group', { stt: sub.name + ' – ' + d.currency }, d.currency);
            lastKey = key;
        }
        var b = led.bal.byDoc[d.id], hs = serviceCodesOfDoc_(lineByDoc[d.id] || []).join(', '), first = (lineByDoc[d.id] || []).slice().sort(function (x, y) { return x.lineNo - y.lineNo; })[0];
        addRow_(rep, 'data', { stt: ++n, docNo: d.docNo, docDate: d.docDate, invoiceNo: d.invoiceNo, svc: hs, desc: first ? first.description : '', gross: b.gross + b.adjust, settled: b.alloc, out: b.out, dueDate: d.dueDate || '—',
            status: PAY_STATUS_VN_[b.status] || '', note: d.statusNote }, d.currency);
        // R36: giá trị ghi sổ VND của chứng từ (tỷ giá lưu trên chứng từ); đã thu quy đổi = tổng − còn lại
        if (d.currency !== BASE_CUR_)
            hasForeign = true;
        var gB = bookOfLine_(bc, d, b.gross + b.adjust), oB = bookOfLine_(bc, d, b.out);
        if (gB === null || oB === null)
            missB++;
        else {
            var pbk = baseBy[d.partnerId] = baseBy[d.partnerId] || { name: partnerName_(led.pm, d.partnerId), g: 0, s: 0, o: 0 };
            pbk.g += gB;
            pbk.s += gB - oB;
            pbk.o += oB;
        }
        sub.g += b.gross + b.adjust;
        sub.s += b.alloc;
        sub.o += b.out;
        sumCur_(grand, d.currency, 'g', b.gross + b.adjust);
        sumCur_(grand, d.currency, 's', b.alloc);
        sumCur_(grand, d.currency, 'o', b.out);
    });
    flush();
    Object.keys(grand).sort().forEach(function (c) {
        addRow_(rep, 'total', { desc: 'TỔNG CỘNG ' + c, currency: c, gross: grand[c].g, settled: grand[c].s, out: grand[c].o }, c);
        var ga = grand[c].a || 0;
        if (ga)
            addRow_(rep, 'total', { desc: 'TỔNG CỘNG – ' + (dir === 'AR' ? 'đã thu gồm ứng trước ' : 'đã trả gồm trả trước ') + fmtMoney_(ga, c) + ' ' + c, currency: c, gross: grand[c].g, settled: grand[c].s + ga, out: grand[c].o - ga }, c);
    });
    if (hasForeign) {
        // Quy đổi VND (tham khảo): gộp mọi tiền tệ của từng đối tác theo tỷ giá đã lưu trên chứng từ/phiếu
        addRow_(rep, 'group', { stt: 'Quy đổi ' + BASE_CUR_ + ' – theo tỷ giá đã lưu trên từng chứng từ (tham khảo)' }, BASE_CUR_);
        var tb = { g: 0, s: 0, o: 0 }, advTot = 0, advPart = {}, nb = 0;
        led.payments.forEach(function (x) { var pb2 = led.payBal[x.id]; if (pb2 && pb2.unalloc > 0 && x.status === 'POSTED' && x.direction === payDir && baseBy[x.partnerId]) {
            var v = bookOfAdv_(bc, x, pb2.unalloc);
            if (v === null)
                missB++;
            else {
                advPart[x.partnerId] = (advPart[x.partnerId] || 0) + v;
                advTot += v;
            }
        } });
        Object.keys(baseBy).sort(function (a, c) { return cmpStr_(baseBy[a].name, baseBy[c].name); }).forEach(function (k) {
            var o = baseBy[k];
            addRow_(rep, 'data', { stt: ++nb, desc: o.name, currency: BASE_CUR_, gross: o.g, settled: o.s, out: o.o }, BASE_CUR_);
            tb.g += o.g;
            tb.s += o.s;
            tb.o += o.o;
        });
        addRow_(rep, 'total', { desc: 'TỔNG QUY ĐỔI VND', currency: BASE_CUR_, gross: tb.g, settled: tb.s, out: tb.o }, BASE_CUR_);
        if (advTot)
            addRow_(rep, 'total', { desc: 'TỔNG QUY ĐỔI VND – ' + (dir === 'AR' ? 'đã thu gồm ứng trước ' : 'đã trả gồm trả trước ') + fmtMoney_(advTot, BASE_CUR_) + ' ' + BASE_CUR_, currency: BASE_CUR_, gross: tb.g, settled: tb.s + advTot, out: tb.o - advTot }, BASE_CUR_);
        if (missB)
            rep.notes.push(missB + ' chứng từ/phiếu chưa có tỷ giá ghi nhận nên chưa được quy đổi VND (số nguyên tệ vẫn đủ).');
        rep.notes.push('Phần "Quy đổi VND" là giá trị ghi sổ theo tỷ giá đã lưu lúc ghi nhận, gộp mọi tiền tệ của từng đối tác (không đánh giá lại theo tỷ giá ngày chốt – xem R14).');
    }
    if (!docs.length)
        rep.notes.push('Không có chứng từ phù hợp bộ lọc.');
    rep.notes.push('Từng dòng chứng từ chỉ hiện phần đã phân bổ vào chứng từ đó. Tiền ' + (dir === 'AR' ? 'thu' : 'chi') + ' chưa phân bổ (ứng trước) của đối tác hiện ở dòng "gồm ' + (dir === 'AR' ? 'ứng trước' : 'trả trước') + '" cuối mỗi đối tác (ghi rõ số tiền trong nhãn dòng): đó là số ' + (dir === 'AR' ? 'đã thu' : 'đã trả') + ' thực tế của đối tác và số còn ' + (dir === 'AR' ? 'phải thu' : 'phải trả') + ' sau khi trừ ứng trước (chỉ tính cho đối tác có chứng từ trong báo cáo).');
    rep.notes.push('Ô "Đến hạn" hiển thị — khi chưa có căn cứ hạn thanh toán; không suy từ ngày hóa đơn.');
    rep.signatures = true;
    return rep;
}
function rep04_(user, code, params) {
    if (!params.partnerId)
        throw err_('VALIDATION_FAILED', 'Chọn đối tác', [{ path: 'partnerId', code: 'REQUIRED', message: 'Chọn đối tác.' }]);
    var led = loadLedger_(user, params.asOf), pm = led.pm, p = pm[params.partnerId];
    if (!p || !inScope_(user, p, ''))
        throw err_('OUT_OF_SCOPE', 'Ngoài phạm vi dữ liệu được cấp.');
    var dir = params.direction || 'AP';
    var rep = newReport_(code, params, [col_('stt', 'STT', 'int', 'center'), col_('svc', 'Mã dịch vụ'), col_('qty', 'SL cont', 'int'), col_('fee', 'Loại phí'), col_('invoiceNo', 'Số HĐ'), col_('invoiceDate', 'Ngày HĐ', 'date'),
        col_('gross', 'Thành tiền', 'money'), col_('settled', 'Đã thanh toán', 'money'), col_('out', 'Còn lại', 'money'), col_('status', 'Trạng thái (tính)'), col_('batch', 'Đợt')]);
    var lineByDoc = groupBy_(led.lines, function (l) { return l.docId; }), docs = led.docs.filter(function (d) { return d.partnerId === p.id && d.direction === dir && (!params.currency || d.currency === params.currency); });
    var posted = docs.filter(function (d) { return docShownAt_(d, led.bal.byDoc[d.id]); }), hold = docs.filter(function (d) { return ['DRAFT', 'SUBMITTED', 'APPROVED'].indexOf(d.status) >= 0; });
    var groups = groupBy_(posted, function (d) { return (d.batchLabel || 'Chưa xác định') + '|' + d.currency; }), n = 0, grand = {};
    Object.keys(groups).sort().forEach(function (k) {
        var parts = k.split('|'), cur = parts[1], sub = { g: 0, s: 0, o: 0 };
        addRow_(rep, 'group', { svc: 'Đợt: ' + parts[0] + ' (' + cur + ')' }, cur);
        groups[k].sort(function (a, b) { return cmpStr_(serviceCodesOfDoc_(lineByDoc[a.id] || []).join(), serviceCodesOfDoc_(lineByDoc[b.id] || []).join()) || cmpStr_(a.docNo, b.docNo); }).forEach(function (d) {
            var b = led.bal.byDoc[d.id], ls = lineByDoc[d.id] || [], qty = ls.some(function (l) { return l.containerQty !== null; }) ? sumBy_(ls, function (l) { return l.containerQty || 0; }) : '';
            addRow_(rep, 'data', { stt: ++n, svc: serviceCodesOfDoc_(ls).join(', ') || '—', qty: qty, fee: ls.map(function (l) { return feeNameOf_(l.feeTypeCode); }).filter(function (x, i, a) { return a.indexOf(x) === i; }).join(', '), invoiceNo: d.invoiceNo || '—', invoiceDate: d.invoiceDate || '—',
                gross: b.gross + b.adjust, settled: b.alloc, out: b.out, status: PAY_STATUS_VN_[b.status] || '', batch: d.batchLabel || '' }, cur);
            sub.g += b.gross + b.adjust;
            sub.s += b.alloc;
            sub.o += b.out;
            sumCur_(grand, cur, 'g', b.gross + b.adjust);
            sumCur_(grand, cur, 's', b.alloc);
            sumCur_(grand, cur, 'o', b.out);
        });
        addRow_(rep, 'subtotal', { svc: 'Cộng đợt ' + parts[0], gross: sub.g, settled: sub.s, out: sub.o }, cur);
    });
    Object.keys(grand).sort().forEach(function (c) { addRow_(rep, 'total', { svc: 'TỔNG CỘNG', gross: grand[c].g, settled: grand[c].s, out: grand[c].o }, c); });
    if (hold.length) {
        addRow_(rep, 'group', { svc: 'CHƯA GHI NHẬN (chờ giấy tờ/duyệt) – KHÔNG nằm trong tổng' });
        hold.forEach(function (d) { addRow_(rep, 'data', { stt: '', svc: serviceCodesOfDoc_(lineByDoc[d.id] || []).join(', ') || '—', invoiceNo: d.invoiceNo || '—', invoiceDate: d.invoiceDate || '—', gross: d.totalGrossMinor, status: d.status, batch: d.batchLabel || '' }, d.currency); });
    }
    rep.meta.partner = p.shortName;
    rep.signatures = true;
    return rep;
}
function rep05_(user, code, params) {
    if (!params.partnerId)
        throw err_('VALIDATION_FAILED', 'Chọn đối tác', [{ path: 'partnerId', code: 'REQUIRED', message: 'Chọn đối tác.' }]);
    if (!isMonth_(params.statementPeriod))
        throw err_('VALIDATION_FAILED', 'Chọn kỳ quyết toán (yyyy-MM)', [{ path: 'statementPeriod', code: 'REQUIRED', message: 'Chọn kỳ quyết toán.' }]);
    var dir = params.direction || 'AR', cur = params.currency || 'VND', pm = partnerMap_(), p = pm[params.partnerId];
    if (!p)
        throw err_('NOT_FOUND', 'Không tìm thấy đối tác.');
    assertVisible_(user, p, '', '', 'Không tìm thấy đối tác.');
    var asOf = params.asOf;
    var docs = repoValid_('DebtDoc').filter(function (d) { return d.partnerId === p.id && d.direction === dir && d.currency === cur && COUNTED_DOC_STATUS_[d.status] && !d.isOpening && docEffDate_(d) <= asOf && inScope_(user, p, d.businessGroupCode); });
    var dset = byId_(docs), shr = byId_(repoValid_('ShipmentRef'));
    var allLines = repoValid_('DebtLine').filter(function (l) { return dset[l.docId]; }), baseLines = allLines.filter(function (l) { return !l.adjustsLineId; }), baseById = byId_(baseLines);
    function periodOf(l) { return l.statementPeriod || dset[l.docId].statementPeriod; }
    var lines = baseLines.filter(function (l) { return periodOf(l) === params.statementPeriod; });
    var adjLines = allLines.filter(function (l) { var o = l.adjustsLineId && baseById[l.adjustsLineId]; return o && periodOf(o) === params.statementPeriod; })
        .sort(function (a, b) { return cmpStr_(docEffDate_(dset[a.docId]), docEffDate_(dset[b.docId])) || cmpStr_(dset[a.docId].docNo, dset[b.docId].docNo) || a.lineNo - b.lineNo; });
    var rep = newReport_('R05', params, [col_('stt', 'STT', 'int', 'center'), col_('decl', 'Số TKHQ'), col_('declDate', 'Ngày', 'date'), col_('desc', 'Diễn giải'), col_('qty', 'SL cont', 'int'),
        col_('net', 'Phí dịch vụ (trước thuế)', 'money'), col_('rate', 'VAT %', 'text', 'center'), col_('vat', 'Tiền VAT', 'money'), col_('svc', 'Tổng phí dịch vụ', 'money'), col_('pass', 'Chi phí khác (chi hộ)', 'money'),
        col_('total', 'Tổng thành tiền', 'money'), col_('lot', 'Ghi chú (mã lô)')]);
    var byDecl = groupBy_(lines, function (l) { return l.shipmentRefId || ('none:' + l.id); });
    var keys = Object.keys(byDecl).sort(function (a, b) { var ra = shr[a], rb = shr[b]; return cmpStr_(ra ? ra.refDate : '9', rb ? rb.refDate : '9') || cmpStr_(a, b); });
    var T = { qty: 0, net: 0, vat: 0, svc: 0, pass: 0, total: 0 }, n = 0, blockers = {};
    keys.forEach(function (k) {
        var r = shr[k], ls = byDecl[k].sort(function (a, b) { return a.lineNo - b.lineNo; });
        n++;
        ls.forEach(function (l, i) {
            var pass = l.isPassThrough ? l.grossMinor : 0, svcNet = l.isPassThrough ? 0 : l.netMinor, vat = l.isPassThrough ? 0 : l.vatMinor;
            if (l.vatMode === 'UNCONFIRMED' && !l.isPassThrough)
                blockers[l.id] = 1;
            var rate = l.vatMode === 'EXCLUSIVE' ? (l.vatRateBp / 100) + '%' : l.vatMode === 'NONE' ? 'KCT' : '?';
            addRow_(rep, 'data', { stt: i === 0 ? n : '', decl: i === 0 && r ? r.refValue : '', declDate: i === 0 && r ? r.refDate : '', desc: l.description, qty: i === 0 && l.containerQty !== null ? l.containerQty : (l.containerQty === null ? '' : l.containerQty),
                net: svcNet, rate: rate, vat: vat, svc: svcNet + vat, pass: pass, total: svcNet + vat + pass, lot: l.lotNote }, cur);
            T.qty += l.containerQty || 0;
            T.net += svcNet;
            T.vat += vat;
            T.svc += svcNet + vat;
            T.pass += pass;
            T.total += svcNet + vat + pass;
        });
    });
    adjLines.forEach(function (l) {
        var ad = dset[l.docId], pass = l.isPassThrough ? l.grossMinor : 0, svcNet = l.isPassThrough ? 0 : l.netMinor, vat = l.isPassThrough ? 0 : l.vatMinor;
        addRow_(rep, 'data', { stt: '', decl: '', declDate: docEffDate_(ad), desc: (ad.docType === 'REVERSAL' ? 'Đảo ' : 'Điều chỉnh ') + (ad.docNo || '') + ': ' + l.description, qty: '', net: svcNet, rate: l.vatMode === 'EXCLUSIVE' ? (l.vatRateBp / 100) + '%' : 'KCT', vat: vat,
            svc: svcNet + vat, pass: pass, total: svcNet + vat + pass, lot: l.lotNote || '' }, cur);
        T.net += svcNet;
        T.vat += vat;
        T.svc += svcNet + vat;
        T.pass += pass;
        T.total += svcNet + vat + pass;
    });
    addRow_(rep, 'total', { desc: 'CỘNG', qty: T.qty, net: T.net, vat: T.vat, svc: T.svc, pass: T.pass, total: T.total }, cur);
    rep.notes.push('Tính tại ngày chốt ' + asOf + ': chỉ gồm chứng từ và điều chỉnh/đảo có ngày hiệu lực đến ngày này. Các dòng "Đảo/Điều chỉnh" thuộc kỳ của dòng phí gốc; điều chỉnh tăng/giảm nhập theo số tiền gộp, không tách thuế.');
    if (!lines.length)
        rep.notes.push('Không có dòng phí thuộc kỳ quyết toán ' + params.statementPeriod + ' (kỳ quyết toán lấy theo trường "kỳ quyết toán", không theo tháng của ngày tờ khai).');
    rep.words = [amountToWords(T.total, cur, { nghin: 'nghìn' })];
    var cnt = Object.keys(blockers).length;
    if (cnt)
        rep.issueBlockers.push('Còn ' + cnt + ' dòng phí chưa xác nhận thuế (vatMode=UNCONFIRMED): chỉ in được BẢN NHÁP cho đến khi kế toán thuế xác nhận.');
    rep.meta.partner = p.legalName;
    rep.meta.partnerShort = p.shortName;
    rep.meta.statementPeriod = params.statementPeriod;
    rep.meta.currency = cur;
    rep.meta.bank = cfgGet_('entity.bank', '');
    rep.signatures = true;
    return rep;
}
function rep06_(user, code, params) {
    if (!params.partnerId)
        throw err_('VALIDATION_FAILED', 'Chọn đối tác', [{ path: 'partnerId', code: 'REQUIRED', message: 'Chọn đối tác.' }]);
    var ls = ledgerStart_(), from = params.from || ls, to = params.to || params.asOf;
    if (!isDate_(from) || !isDate_(to) || from > to)
        throw err_('VALIDATION_FAILED', 'Khoảng thời gian không hợp lệ');
    if (from < ls)
        from = ls;
    var pm = partnerMap_(), p = pm[params.partnerId];
    if (!p)
        throw err_('NOT_FOUND', 'Không tìm thấy đối tác.');
    assertVisible_(user, p, '', '', 'Không tìm thấy đối tác.');
    var led = loadLedger_(user, to), docs = led.docs.filter(function (d) { return d.partnerId === p.id && d.status !== 'DELETED'; }), dset = byId_(docs);
    var lines = led.lines.filter(function (l) { return dset[l.docId]; }), allocs = led.allocs.filter(function (a) { return dset[a.docId]; });
    var rep = newReport_(code, Object.assign({}, params, { from: from, to: to }), [col_('item', 'Chỉ tiêu'), col_('amount', 'Số tiền', 'money'), col_('currency', 'Tiền tệ', 'text', 'center')]);
    var combos = {};
    docs.forEach(function (d) { combos[d.direction + '|' + d.currency] = 1; });
    Object.keys(combos).sort().forEach(function (k) {
        var x = k.split('|'), dir = x[0], cur = x[1], inc = 0, adj = 0, dec = 0, opening = 0;
        var before = from === ls ? null : computeBalances(docs, lines, allocs, addDays_(from, -1));
        var after = computeBalances(docs, lines, allocs, to);
        lines.forEach(function (l) {
            var d = dset[l.docId];
            if (d.direction !== dir || d.currency !== cur || !COUNTED_DOC_STATUS_[d.status])
                return;
            var eff = docEffDate_(d);
            if (d.isOpening && from === ls) {
                if (!l.adjustsLineId)
                    opening += l.grossMinor;
                return;
            }
            if (eff < from || eff > to)
                return;
            if (l.adjustsLineId)
                adj += l.grossMinor;
            else
                inc += l.grossMinor;
        });
        allocs.forEach(function (a) { var d = dset[a.docId]; if (d && d.direction === dir && d.currency === cur && a.effectiveDate >= from && a.effectiveDate <= to)
            dec += a.amountMinor; });
        if (before)
            Object.keys(before.byLine).forEach(function (id) { var d = dset[before.byLine[id].docId]; if (d.direction === dir && d.currency === cur)
                opening += before.byLine[id].out; });
        var closing = 0;
        Object.keys(after.byLine).forEach(function (id) { var d = dset[after.byLine[id].docId]; if (d.direction === dir && d.currency === cur)
            closing += after.byLine[id].out; });
        var calc = opening + inc + adj - dec, title = (dir === 'AR' ? 'PHẢI THU' : 'PHẢI TRẢ') + ' – ' + cur;
        addRow_(rep, 'group', { item: title }, cur);
        addRow_(rep, 'data', { item: 'Dư đầu kỳ (' + from + ')', amount: opening, currency: cur }, cur);
        addRow_(rep, 'data', { item: 'Phát sinh tăng', amount: inc, currency: cur }, cur);
        addRow_(rep, 'data', { item: 'Điều chỉnh/đảo', amount: adj, currency: cur }, cur);
        addRow_(rep, 'data', { item: dir === 'AR' ? 'Đã thu trong kỳ' : 'Đã trả trong kỳ', amount: -dec, currency: cur }, cur);
        addRow_(rep, 'total', { item: 'Dư cuối kỳ (' + to + ')', amount: closing, currency: cur }, cur);
        var payDir = dir === 'AR' ? 'IN' : 'OUT', unalloc = 0, pbal = led.payBal;
        led.payments.forEach(function (x) { if (x.partnerId === p.id && x.currency === cur && x.direction === payDir && pbal[x.id])
            unalloc += pbal[x.id].unalloc; });
        if (unalloc !== 0) {
            addRow_(rep, 'data', { item: (dir === 'AR' ? 'Phiếu thu' : 'Phiếu chi') + ' chưa phân bổ vào chứng từ (ứng trước) tại ' + to, amount: -unalloc, currency: cur }, cur);
            addRow_(rep, 'total', { item: 'Dư ' + (dir === 'AR' ? 'phải thu' : 'phải trả') + ' sau khi trừ ứng trước', amount: closing - unalloc, currency: cur }, cur);
            rep.words.push(title + ' (sau khi trừ ứng trước): ' + amountToWords(closing - unalloc, cur));
        }
        if (calc !== closing)
            rep.notes.push('CẢNH BÁO: ' + title + ' – dư tính theo công thức (' + fmtMoney_(calc, cur) + ') khác dư cuối kỳ (' + fmtMoney_(closing, cur) + '). Kiểm tra dữ liệu trước khi gửi đối tác.');
        rep.words.push(title + ': ' + amountToWords(closing, cur));
        var open = [];
        lines.forEach(function (l) { var b = after.byLine[l.id]; var d = dset[l.docId]; if (b && b.out > 0 && d.direction === dir && d.currency === cur)
            open.push({ d: d, l: l, b: b }); });
        open.sort(function (a, b) { return cmpStr_(docEffDate_(a.d), docEffDate_(b.d)); });
        if (open.length) {
            addRow_(rep, 'group', { item: 'Phụ lục – các khoản còn nợ tại ' + to + ' (' + cur + ')' }, cur);
            open.forEach(function (o) { addRow_(rep, 'data', { item: (o.d.docNo || '') + ' | ' + (o.d.invoiceNo || '—') + ' | ' + (docEffDate_(o.d) || '—') + ' | ' + maxStr_(o.l.description, 80) + (o.d.dueDate ? ' | hạn ' + o.d.dueDate : ''), amount: o.b.out, currency: cur }, cur); });
        }
    });
    if (!rep.rows.length)
        rep.notes.push('Chưa có số liệu công nợ của đối tác trong kỳ.');
    rep.notes.push('Hai bên thống nhất / chênh lệch (ghi tay): ......................................................');
    rep.meta.partner = p.legalName;
    rep.meta.partnerTax = p.taxCode;
    rep.signatures = true;
    rep.bothParties = true;
    return rep;
}
function rep07_(user, code, params) {
    var led = loadLedger_(user, params.asOf), rep = newReport_(code, params, [col_('partner', 'Đối tác'), col_('currency', 'Tiền tệ', 'text', 'center')]
        .concat(AGING_BUCKETS.map(function (b) { return col_(b, AGING_LABELS[b], 'money'); })).concat([col_('total', 'Tổng còn nợ', 'money')]));
    var credit = {}, bc = bookCtx_(), baseBy = { AR: {}, AP: {} }, hasForeign = false, missB = 0;
    ['AR', 'AP'].forEach(function (dir) {
        var by = {}, any = false;
        led.lines.forEach(function (l) {
            var b = led.bal.byLine[l.id];
            if (!b)
                return;
            var d = led.docById[l.docId];
            if (d.direction !== dir || (params.currency && d.currency !== params.currency) || (params.group && d.businessGroupCode !== params.group))
                return;
            if (b.out < 0) {
                credit[dir + '|' + d.currency] = (credit[dir + '|' + d.currency] || 0) - b.out;
                return;
            }
            if (b.out === 0)
                return;
            var k = d.partnerId + '|' + d.currency, o = by[k] = by[k] || { total: 0 };
            var bk = agingBucket(d.dueDate, params.asOf);
            o[bk] = (o[bk] || 0) + b.out;
            o.total += b.out;
            any = true;
            // R36: giá trị ghi sổ VND theo cùng nhóm tuổi nợ
            if (d.currency !== BASE_CUR_)
                hasForeign = true;
            var vb = bookOfLine_(bc, d, b.out);
            if (vb === null)
                missB++;
            else {
                var ob = baseBy[dir][d.partnerId] = baseBy[dir][d.partnerId] || { total: 0 };
                ob[bk] = (ob[bk] || 0) + vb;
                ob.total += vb;
            }
        });
        if (!any)
            return;
        addRow_(rep, 'group', { partner: dir === 'AR' ? 'PHẢI THU' : 'PHẢI TRẢ' });
        var tot = {};
        Object.keys(by).sort(function (a, b) { return cmpStr_(partnerName_(led.pm, a.split('|')[0]), partnerName_(led.pm, b.split('|')[0])); }).forEach(function (k) {
            var x = k.split('|'), o = by[k], cells = { partner: partnerName_(led.pm, x[0]), currency: x[1], total: o.total };
            AGING_BUCKETS.forEach(function (b) { cells[b] = o[b] || 0; sumCur_(tot, x[1], b, o[b] || 0); });
            sumCur_(tot, x[1], 'total', o.total);
            addRow_(rep, 'data', cells, x[1]);
        });
        Object.keys(tot).sort().forEach(function (c) { var cells = { partner: 'TỔNG ' + (dir === 'AR' ? 'PHẢI THU' : 'PHẢI TRẢ'), currency: c, total: tot[c].total }; AGING_BUCKETS.forEach(function (b) { cells[b] = tot[c][b] || 0; }); addRow_(rep, 'total', cells, c); });
    });
    if (hasForeign) {
        addRow_(rep, 'group', { partner: 'QUY ĐỔI ' + BASE_CUR_ + ' – theo tỷ giá đã lưu trên từng chứng từ (tham khảo)' }, BASE_CUR_);
        ['AR', 'AP'].forEach(function (dir) {
            var ks = Object.keys(baseBy[dir]);
            if (!ks.length)
                return;
            addRow_(rep, 'group', { partner: (dir === 'AR' ? 'PHẢI THU' : 'PHẢI TRẢ') + ' – quy đổi ' + BASE_CUR_ }, BASE_CUR_);
            var tt = { total: 0 };
            ks.sort(function (a, c) { return cmpStr_(partnerName_(led.pm, a), partnerName_(led.pm, c)); }).forEach(function (k) {
                var o = baseBy[dir][k], cells = { partner: partnerName_(led.pm, k), currency: BASE_CUR_, total: o.total };
                AGING_BUCKETS.forEach(function (b) { cells[b] = o[b] || 0; tt[b] = (tt[b] || 0) + (o[b] || 0); });
                tt.total += o.total;
                addRow_(rep, 'data', cells, BASE_CUR_);
            });
            var tc = { partner: 'TỔNG ' + (dir === 'AR' ? 'PHẢI THU' : 'PHẢI TRẢ') + ' QUY ĐỔI ' + BASE_CUR_, currency: BASE_CUR_, total: tt.total };
            AGING_BUCKETS.forEach(function (b) { tc[b] = tt[b] || 0; });
            addRow_(rep, 'total', tc, BASE_CUR_);
        });
        if (missB)
            rep.notes.push(missB + ' dòng chưa có tỷ giá ghi nhận nên chưa được quy đổi VND (số nguyên tệ ở các phần trên vẫn đủ).');
        rep.notes.push('Phần "Quy đổi VND" là giá trị ghi sổ theo tỷ giá đã lưu lúc ghi nhận, gộp mọi tiền tệ của từng đối tác theo cùng nhóm tuổi nợ (không đánh giá lại theo tỷ giá ngày chốt – xem R14).');
    }
    if (!rep.rows.length)
        rep.notes.push('Không có khoản còn nợ tại ngày chốt.');
    var adv = {};
    led.payments.forEach(function (x) { var b = led.payBal[x.id]; if (b && b.unalloc > 0 && (!params.currency || x.currency === params.currency)) {
        var k = (x.direction === 'IN' ? 'AR' : 'AP') + '|' + x.currency;
        adv[k] = (adv[k] || 0) + b.unalloc;
    } });
    Object.keys(Object.assign({}, credit, adv)).sort().forEach(function (k) {
        var x = k.split('|'), parts = [];
        if (credit[k])
            parts.push('dòng thanh toán thừa ' + fmtMoney_(credit[k], x[1]));
        if (adv[k])
            parts.push('tiền ' + (x[0] === 'AR' ? 'thu' : 'chi') + ' chưa phân bổ ' + fmtMoney_(adv[k], x[1]));
        rep.notes.push((x[0] === 'AR' ? 'Phải thu' : 'Phải trả') + ' ' + x[1] + ' – chưa trừ vào bảng tuổi nợ: ' + parts.join('; ') + '.');
    });
    rep.notes.push('Tuổi nợ tính theo ngày đến hạn đã xác nhận. Khoản chưa có ngày đến hạn nằm ở nhóm riêng "Thiếu ngày đến hạn", không gộp vào "Chưa đến hạn".');
    rep.signatures = true;
    return rep;
}
function rep08_(user, code, params) {
    if (!params.cashAccountCode)
        throw err_('VALIDATION_FAILED', 'Chọn tài khoản quỹ', [{ path: 'cashAccountCode', code: 'REQUIRED', message: 'Chọn tài khoản quỹ.' }]);
    var ls = ledgerStart_(), from = params.from || ls, to = params.to || params.asOf;
    if (!isDate_(from) || !isDate_(to) || from > to)
        throw err_('VALIDATION_FAILED', 'Khoảng thời gian không hợp lệ');
    if (from < ls)
        from = ls;
    var acc = null;
    catalogList_('CASH_ACCOUNT', true).forEach(function (c) { if (c.code === params.cashAccountCode)
        acc = c; });
    if (!acc)
        throw err_('NOT_FOUND', 'Không tìm thấy tài khoản quỹ.');
    var usc = user.scope || {};
    if (!usc.allPartners || (usc.businessGroups && usc.businessGroups.length))
        throw err_('OUT_OF_SCOPE', 'Sổ quỹ chỉ dành cho người dùng có phạm vi toàn bộ đối tác và nhóm kinh doanh, vì tồn quỹ không chia theo đối tác.');
    var cur = safeJson_(acc.attrsJson, {}).currency, pm = partnerMap_(), docs = byId_(repoValid_('DebtDoc')), allocs = repoValid_('Allocation');
    var openBal = 0;
    repoValid_('OpeningBalance').forEach(function (o) { if (o.kind === 'CASH' && o.cashAccountCode === acc.code)
        openBal += o.amountMinor; });
    var mv = [];
    repoValid_('Payment').filter(function (x) { return x.cashAccountCode === acc.code; }).forEach(function (x) {
        if (x.status !== 'POSTED' && x.status !== 'REVERSED')
            return;
        mv.push({ date: x.effectiveDate, pay: x, sign: x.direction === 'IN' ? 1 : -1, rev: false });
        if (x.status === 'REVERSED' && x.reversedDate)
            mv.push({ date: x.reversedDate, pay: x, sign: x.direction === 'IN' ? -1 : 1, rev: true });
    });
    mv.sort(function (a, b) { return cmpStr_(a.date, b.date) || cmpStr_(a.pay.payNo, b.pay.payNo); });
    var rep = newReport_(code, Object.assign({}, params, { from: from, to: to }), [col_('date', 'Ngày', 'date'), col_('payNo', 'Số phiếu'), col_('bankRef', 'Mã GD ngân hàng'), col_('partner', 'Đối tác'),
        col_('desc', 'Diễn giải / phân bổ cho'), col_('in', 'Thu', 'money'), col_('out', 'Chi', 'money'), col_('bal', 'Tồn quỹ', 'money'), col_('unalloc', 'Chưa phân bổ', 'money')]);
    var running = openBal;
    mv.forEach(function (m) { if (m.date < from)
        running += m.sign * m.pay.amountMinor; });
    addRow_(rep, 'data', { desc: 'Dư đầu kỳ (' + from + ')', bal: running }, cur);
    var tin = 0, tout = 0, pb = paymentBalances(repoValid_('Payment'), allocs, to), allocDesc = {};
    // Một lượt duyệt phân bổ (giữ thứ tự gốc) thay cho quét lại toàn bộ cho từng phiếu.
    allocs.forEach(function (a) {
        if (!(a.amountMinor > 0) || a.effectiveDate > to)
            return;
        var d = docs[a.docId];
        (allocDesc[a.paymentId] = allocDesc[a.paymentId] || []).push((d ? d.docNo : '?') + ': ' + fmtMoney_(a.amountMinor, cur));
    });
    mv.forEach(function (m) {
        if (m.date < from || m.date > to)
            return;
        var amt = m.sign * m.pay.amountMinor;
        running += amt;
        var al = allocDesc[m.pay.id] || [];
        addRow_(rep, 'data', { date: m.date, payNo: m.rev ? m.pay.payNo + ' (ĐẢO)' : m.pay.payNo, bankRef: m.pay.bankRef, partner: partnerName_(pm, m.pay.partnerId),
            desc: (m.rev ? 'Đảo phiếu: ' + m.pay.rejectReason : (m.pay.note || '')) + (al.length ? ' → ' + al.join('; ') : ''), 'in': amt > 0 ? amt : '', out: amt < 0 ? -amt : '', bal: running,
            unalloc: m.rev ? '' : (pb[m.pay.id] ? pb[m.pay.id].unalloc : '') }, cur);
        if (amt > 0)
            tin += amt;
        else
            tout += -amt;
    });
    addRow_(rep, 'total', { desc: 'Cộng phát sinh / Tồn cuối kỳ (' + to + ')', 'in': tin, out: tout, bal: running }, cur);
    if (params.statementBalanceMinor !== undefined && params.statementBalanceMinor !== null && params.statementBalanceMinor !== '') {
        var diff = running - Number(params.statementBalanceMinor);
        rep.notes.push('Số dư theo sao kê ngân hàng: ' + fmtMoney_(Number(params.statementBalanceMinor), cur) + ' ' + cur + ' · Chênh lệch với sổ: ' + fmtMoney_(diff, cur) + ' ' + cur + (diff === 0 ? ' (khớp)' : ' (CẦN XỬ LÝ – hệ thống không tự điều chỉnh)'));
    }
    rep.notes.push('Sổ tính từ phiếu thu/chi đã ghi nhận và phân bổ; dư đầu kỳ lấy từ màn hình nhập dư đầu kỳ.');
    rep.meta.account = acc.code + ' – ' + acc.name + ' (' + cur + ')';
    rep.signatures = true;
    return rep;
}
/* Bảng kê thuế GTGT (bán ra: phải thu AR; mua vào: phải trả AP). Kỳ lọc theo ngày hóa đơn (không có thì ngày chứng từ). Chỉ tiền VND; dòng chi hộ không phải doanh thu/hàng mua nên không kê. */
function repVat_(user, code, params, dir) {
    var isOut = dir === 'AR', to = params.to || params.asOf, from = params.from || (String(to).slice(0, 8) + '01');
    if (!isDate_(from) || !isDate_(to) || from > to)
        throw err_('VALIDATION_FAILED', 'Khoảng thời gian không hợp lệ');
    var led = loadLedger_(user, to), lineByDoc = groupBy_(led.lines, function (l) { return l.docId; });
    var rep = newReport_(code, Object.assign({}, params, { from: from, to: to }), [col_('stt', 'STT', 'int', 'center'), col_('form', 'Ký hiệu hóa đơn'), col_('invoiceNo', 'Số hóa đơn'), col_('invoiceDate', 'Ngày hóa đơn', 'date'),
        col_('partner', isOut ? 'Tên người mua' : 'Tên người bán'), col_('taxCode', 'Mã số thuế'), col_('desc', 'Mặt hàng / dịch vụ'), col_('net', isOut ? 'Doanh số chưa có thuế' : 'Giá trị chưa có thuế', 'money'),
        col_('rate', 'Thuế suất', 'text', 'center'), col_('vat', isOut ? 'Thuế GTGT' : 'Thuế GTGT mua vào', 'money'), col_('note', 'Ghi chú')]);
    var buckets = {}, unconfirmed = [], adjust = [], rates = repoValid_('FxRate'), cnt = { fxConv: 0, fxFallback: 0, nonVnd: 0, passThrough: 0, noInvoiceNo: 0, usedDocDate: 0, noTax: 0, hold: 0 };
    led.docs.forEach(function (d) {
        if (d.direction !== dir || d.isOpening)
            return;
        var date = d.invoiceDate || docEffDate_(d);
        if (!date || date < from || date > to)
            return;
        if (['DRAFT', 'SUBMITTED', 'APPROVED'].indexOf(d.status) >= 0) {
            cnt.hold++;
            return;
        }
        if (!COUNTED_DOC_STATUS_[d.status])
            return;
        var dcur = d.currency !== BASE_CUR_, fxr = 0, dec = (currencyMap_()[d.currency] || { decimals: 0 }).decimals;
        if (dcur) {
            var fr = fxFind_(d.currency, date, rates);
            fxr = fr ? fr.rateE4 : (d.fxRateE4 > 0 ? d.fxRateE4 : 0);
            if (!fxr) {
                cnt.nonVnd++;
                return;
            }
            cnt.fxConv++;
            if (!fr)
                cnt.fxFallback++;
        }
        var cv = function (x) { return dcur ? fxToBase_(x, dec, fxr) : x; };
        var p = led.pm[d.partnerId] || {}, isAdj = d.docType === 'ADJ_INC' || d.docType === 'ADJ_DEC';
        (lineByDoc[d.id] || []).slice().sort(function (a, b) { return a.lineNo - b.lineNo; }).forEach(function (l) {
            if (l.isPassThrough) {
                cnt.passThrough++;
                return;
            }
            var row = { form: d.invoiceSerial || '', invoiceNo: d.invoiceNo || (d.docType === 'REVERSAL' ? '' : '—'), invoiceDate: date, partner: p.legalName || p.shortName || '', taxCode: p.taxCode || '', desc: maxStr_(l.description, 90),
                note: (d.docNo || '') + (d.docType === 'REVERSAL' ? ' · ĐẢO' : '') + (isAdj ? ' · ĐIỀU CHỈNH' : '') + (d.status === 'REVERSED' ? ' · đã bị đảo' : '') };
            if (dcur)
                row.note += ' · ' + d.currency + ' ' + fmtMoney_(l.grossMinor, d.currency) + ' × ' + fxText_(fxr);
            if (isAdj) {
                row.net = cv(l.grossMinor);
                row.vat = 0;
                row.rate = '?';
                adjust.push(row);
                return;
            }
            if (!d.invoiceNo && d.docType !== 'REVERSAL')
                cnt.noInvoiceNo++;
            if (!d.invoiceDate)
                cnt.usedDocDate++;
            if (l.vatMode === 'UNCONFIRMED') {
                row.net = cv(l.netMinor);
                row.vat = cv(l.vatMinor);
                row.rate = '?';
                unconfirmed.push(row);
                return;
            }
            var rate = l.vatMode === 'EXCLUSIVE' ? l.vatRateBp : 'KCT';
            row.net = cv(l.netMinor);
            row.vat = l.vatMode === 'EXCLUSIVE' ? cv(l.vatMinor) : 0;
            row.rate = l.vatMode === 'EXCLUSIVE' ? (l.vatRateBp / 100) + '%' : 'KCT';
            if (row.vat && !p.taxCode)
                cnt.noTax++;
            (buckets[rate] = buckets[rate] || { rate: rate, label: rate === 'KCT' ? 'Hàng hóa, dịch vụ không chịu thuế GTGT' : 'Hàng hóa, dịch vụ chịu thuế suất ' + (rate / 100) + '%', rows: [] }).rows.push(row);
        });
    });
    var keys = Object.keys(buckets).sort(function (a, b) { return (a === 'KCT' ? 1e9 : Number(a)) - (b === 'KCT' ? 1e9 : Number(b)); }), n = 0, T = { net: 0, vat: 0 };
    function sortRows(rows) { return rows.sort(function (a, b) { return cmpStr_(a.invoiceDate, b.invoiceDate) || cmpStr_(a.invoiceNo, b.invoiceNo); }); }
    keys.forEach(function (k) {
        var b = buckets[k], s = { net: 0, vat: 0 };
        addRow_(rep, 'group', { stt: b.label }, 'VND');
        sortRows(b.rows).forEach(function (r) { r.stt = ++n; addRow_(rep, 'data', r, 'VND'); s.net += r.net; s.vat += r.vat; });
        addRow_(rep, 'subtotal', { desc: 'Cộng ' + (k === 'KCT' ? 'không chịu thuế' : 'thuế suất ' + (k / 100) + '%'), net: s.net, vat: s.vat }, 'VND');
        T.net += s.net;
        T.vat += s.vat;
    });
    addRow_(rep, 'total', { desc: isOut ? 'TỔNG DOANH SỐ BÁN RA VÀ THUẾ GTGT' : 'TỔNG GIÁ TRỊ MUA VÀO VÀ THUẾ GTGT', net: T.net, vat: T.vat }, 'VND');
    if (adjust.length) {
        addRow_(rep, 'group', { stt: 'ĐIỀU CHỈNH TĂNG/GIẢM – chưa tách thuế, KHÔNG nằm trong tổng' }, 'VND');
        sortRows(adjust).forEach(function (r) { r.stt = ''; addRow_(rep, 'data', r, 'VND'); });
    }
    if (unconfirmed.length) {
        addRow_(rep, 'group', { stt: 'CHƯA XÁC NHẬN THUẾ – KHÔNG nằm trong tổng' }, 'VND');
        sortRows(unconfirmed).forEach(function (r) { r.stt = ''; addRow_(rep, 'data', r, 'VND'); });
        rep.issueBlockers.push('Còn ' + unconfirmed.length + ' dòng phí chưa xác nhận thuế (vatMode=UNCONFIRMED): chỉ in được BẢN NHÁP cho đến khi kế toán thuế xác nhận.');
    }
    if (!keys.length && !adjust.length && !unconfirmed.length)
        rep.notes.push('Không có hóa đơn ' + (isOut ? 'bán ra' : 'mua vào') + ' đã ghi nhận trong kỳ ' + from + ' – ' + to + '.');
    rep.words.push('Tổng thuế GTGT ' + (isOut ? 'đầu ra' : 'đầu vào') + ': ' + amountToWords(T.vat, 'VND'));
    rep.notes.push('Kỳ lọc theo ngày hóa đơn (không có thì lấy ngày chứng từ). Chỉ chứng từ ĐÃ GHI NHẬN (VND hoặc ngoại tệ đã có tỷ giá); dòng chi hộ không kê. Hóa đơn bị đảo: dòng gốc và dòng đảo (số âm) cùng nằm theo ngày của từng chứng từ.');
    if (!isOut)
        rep.notes.push('Hệ thống chưa phân loại hóa đơn mua vào "đủ điều kiện khấu trừ" (hóa đơn hợp lệ, thanh toán không dùng tiền mặt từ 20 triệu…); bảng liệt kê toàn bộ thuế đầu vào đã ghi nhận, kế toán thuế cần rà trước khi kê khai.');
    if (cnt.nonVnd)
        rep.notes.push(cnt.nonVnd + ' chứng từ ngoại tệ KHÔNG nằm trong bảng kê vì chưa có tỷ giá (nhập ở menu Tỷ giá rồi chạy lại).');
    if (cnt.fxConv)
        rep.notes.push(cnt.fxConv + ' chứng từ ngoại tệ đã quy đổi VND theo tỷ giá ngày hóa đơn trong bảng Tỷ giá' + (cnt.fxFallback ? ' (' + cnt.fxFallback + ' chứng từ không có tỷ giá đúng ngày hóa đơn nên dùng tỷ giá ngày chứng từ)' : '') + '; kế toán thuế cần đối chiếu với tỷ giá quy định (thường tỷ giá mua/bán của ngân hàng thương mại nơi giao dịch).');
    if (cnt.hold)
        rep.notes.push(cnt.hold + ' chứng từ trong kỳ chưa ghi nhận (nháp/chờ duyệt/đã duyệt) không có trong bảng kê.');
    if (cnt.passThrough)
        rep.notes.push(cnt.passThrough + ' dòng chi hộ không kê.');
    if (cnt.noInvoiceNo)
        rep.notes.push(cnt.noInvoiceNo + ' dòng thuộc chứng từ chưa có số hóa đơn (hiện "—").');
    if (cnt.usedDocDate)
        rep.notes.push(cnt.usedDocDate + ' dòng chưa có ngày hóa đơn: dùng ngày chứng từ để xác định kỳ.');
    if (cnt.noTax)
        rep.notes.push(cnt.noTax + ' dòng có thuế nhưng đối tác chưa có mã số thuế.');
    rep.signatures = true;
    return rep;
}
function rep10_(user, code, params) { return repVat_(user, code, params, 'AR'); }
var CF_BUCKETS_ = [['OVERDUE', 'Quá hạn (cần thu/trả ngay)'], ['D7', 'Trong 7 ngày tới'], ['D14', '8 – 14 ngày'], ['D30', '15 – 30 ngày'], ['D60', '31 – 60 ngày'], ['D90', '61 – 90 ngày'], ['D90P', 'Trên 90 ngày'], ['NODUE', 'Chưa xác định hạn (không nằm trong lũy kế)']];
var CF_BUCKETS_WEEK_ = [['OVERDUE', 'Quá hạn (cần thu/trả ngay)'], ['W1', 'Tuần 1 (0 – 7 ngày tới)'], ['W2', 'Tuần 2 (8 – 14 ngày)'], ['W3', 'Tuần 3 (15 – 21 ngày)'], ['W4', 'Tuần 4 (22 – 28 ngày)'], ['D60', '29 – 60 ngày'], ['D90', '61 – 90 ngày'], ['D90P', 'Trên 90 ngày'], ['NODUE', 'Chưa xác định hạn (không nằm trong lũy kế)']];
function cfBucket_(date, asOf, weekly) {
    if (!date)
        return 'NODUE';
    var d = daysBetween_(asOf, date);
    if (d < 0)
        return 'OVERDUE';
    if (weekly)
        return d <= 7 ? 'W1' : d <= 14 ? 'W2' : d <= 21 ? 'W3' : d <= 28 ? 'W4' : d <= 60 ? 'D60' : d <= 90 ? 'D90' : 'D90P';
    return d <= 7 ? 'D7' : d <= 14 ? 'D14' : d <= 30 ? 'D30' : d <= 60 ? 'D60' : d <= 90 ? 'D90' : 'D90P';
}
// R12: dự báo dòng tiền theo ngày dự kiến thanh toán (nếu có) hoặc hạn thanh toán; từng tiền tệ riêng; chỉ gồm chứng từ đã ghi nhận.
// Tiền khách đã thu / tiền đã chi NCC nhưng chưa phân bổ vào chứng từ được trừ riêng thành các dòng bù trừ (không làm sai các nhóm thời hạn).
function rep12_(user, code, params) {
    if (params.granularity && params.granularity !== 'WEEK')
        throw err_('VALIDATION_FAILED', 'Cách chia thời hạn không hợp lệ.', [{ path: 'granularity', code: 'INVALID', message: 'Chọn chia theo nhóm chuẩn hoặc theo tuần.' }]);
    var weekly = params.granularity === 'WEEK', buckets = weekly ? CF_BUCKETS_WEEK_ : CF_BUCKETS_;
    var led = loadLedger_(user, params.asOf), rep = newReport_(code, params, [col_('bucket', 'Nhóm thời hạn'), col_('currency', 'Tiền tệ', 'text', 'center'), col_('ar', 'Dự kiến thu (phải thu)', 'money'), col_('ap', 'Dự kiến chi (phải trả)', 'money'), col_('net', 'Chênh lệch thu – chi', 'money'), col_('cum', 'Lũy kế chênh lệch', 'money'), col_('cnt', 'Số chứng từ', 'int')]);
    var agg = {}, adv = {};
    led.lines.forEach(function (l) {
        var b = led.bal.byLine[l.id];
        if (!b || b.out <= 0)
            return;
        var d = led.docById[l.docId];
        if ((params.currency && d.currency !== params.currency) || (params.group && d.businessGroupCode !== params.group))
            return;
        var cur = agg[d.currency] = agg[d.currency] || {}, k = cfBucket_(d.expectedPayDate || d.dueDate, params.asOf, weekly), o = cur[k] = cur[k] || { ar: 0, ap: 0, docs: {} };
        o[d.direction === 'AR' ? 'ar' : 'ap'] += b.out;
        o.docs[d.id] = 1;
    });
    var advNote = false;
    if (!params.group)
        led.payments.forEach(function (x) {
            var b = led.payBal[x.id];
            if (!b || b.unalloc <= 0 || (params.currency && x.currency !== params.currency) || x.status !== 'POSTED')
                return;
            var o = adv[x.currency] = adv[x.currency] || { inMinor: 0, outMinor: 0, inCnt: 0, outCnt: 0 };
            if (x.direction === 'IN') { o.inMinor += b.unalloc; o.inCnt++; }
            else { o.outMinor += b.unalloc; o.outCnt++; }
            advNote = true;
        });
    var curs = {};
    Object.keys(agg).concat(Object.keys(adv)).forEach(function (c) { curs[c] = 1; });
    Object.keys(curs).sort().forEach(function (c) {
        addRow_(rep, 'group', { bucket: 'TIỀN TỆ ' + c, currency: c }, c);
        var cum = 0, tAr = 0, tAp = 0, tCnt = 0, nodue = null, A = agg[c] || {};
        buckets.forEach(function (bk) {
            var o = A[bk[0]];
            if (!o)
                return;
            var net = o.ar - o.ap, cnt = Object.keys(o.docs).length;
            if (bk[0] === 'NODUE') {
                nodue = { bucket: bk[1], currency: c, ar: o.ar, ap: o.ap, net: net, cum: null, cnt: cnt };
                return;
            }
            cum += net;
            tAr += o.ar;
            tAp += o.ap;
            tCnt += cnt;
            addRow_(rep, 'data', { bucket: bk[1], currency: c, ar: o.ar, ap: o.ap, net: net, cum: cum, cnt: cnt }, c);
        });
        addRow_(rep, 'total', { bucket: 'TỔNG CÓ HẠN ' + c, currency: c, ar: tAr, ap: tAp, net: tAr - tAp, cum: tAr - tAp, cnt: tCnt }, c);
        var ad = adv[c];
        if (ad) {
            if (ad.inMinor)
                addRow_(rep, 'data', { bucket: 'Trừ: tiền khách đã thu chưa phân bổ', currency: c, ar: -ad.inMinor, ap: 0, net: -ad.inMinor, cum: null, cnt: ad.inCnt }, c);
            if (ad.outMinor)
                addRow_(rep, 'data', { bucket: 'Trừ: tiền đã chi NCC chưa phân bổ', currency: c, ar: 0, ap: -ad.outMinor, net: ad.outMinor, cum: null, cnt: ad.outCnt }, c);
            addRow_(rep, 'total', { bucket: 'DỰ KIẾN SAU BÙ TRỪ ' + c, currency: c, ar: tAr - ad.inMinor, ap: tAp - ad.outMinor, net: (tAr - ad.inMinor) - (tAp - ad.outMinor), cum: null, cnt: null }, c);
        }
        if (nodue)
            addRow_(rep, 'data', nodue, c);
    });
    if (!rep.rows.length)
        rep.notes.push('Không có khoản còn nợ hoặc tiền chưa phân bổ tại ngày chốt.');
    rep.notes.push('Ngày dự kiến = ngày dự kiến thanh toán nếu đã nhập, ngược lại là ngày đến hạn. Khoản chưa xác định hạn nằm riêng và KHÔNG tính vào lũy kế: cần bổ sung hạn để dự báo đúng.');
    rep.notes.push(params.group ? 'Đang lọc theo nhóm nghiệp vụ: không trừ tiền chưa phân bổ (phiếu thu/chi không gắn nhóm).' : 'Tiền khách đã thu và tiền đã chi NCC chưa phân bổ vào chứng từ được trừ ở dòng bù trừ riêng (sẽ bù vào phải thu/phải trả khi phân bổ).');
    rep.notes.push('Chưa tính thuế, phí ngân hàng, chênh lệch tỷ giá, lương và chi phí cố định; từng tiền tệ trình bày riêng, không cộng chéo VND với USD.');
    return rep;
}
// R13: chênh lệch tỷ giá ĐÃ THỰC HIỆN theo từng lần phân bổ thu/chi (VND; dương = lãi, âm = lỗ). Chỉ liệt kê, không ghi sổ.
function rep13_(user, code, params) {
    var from = params.from || params.asOf.slice(0, 8) + '01', to = params.to || params.asOf;
    if (!isDate_(from) || !isDate_(to) || from > to)
        throw err_('VALIDATION_FAILED', 'Khoảng ngày không hợp lệ.');
    var led = loadLedger_(user, to), rep = newReport_(code, Object.assign({}, params, { from: from, to: to }), [col_('date', 'Ngày thu/chi', 'date'), col_('payNo', 'Số phiếu'), col_('docNo', 'Chứng từ'), col_('partner', 'Đối tác'), col_('currency', 'Ngoại tệ', 'text', 'center'),
        col_('amount', 'Số nguyên tệ phân bổ', 'text', 'right'), col_('docRate', 'Tỷ giá ngày chứng từ', 'text', 'right'), col_('payRate', 'Tỷ giá ngày thu/chi', 'text', 'right'), col_('diff', 'Chênh lệch (VND)', 'money')]);
    var payById = byId_(repoValid_('Payment')), total = 0, missing = 0, cnt = 0, rows = led.allocs.filter(function (a) { return a.currency !== BASE_CUR_ && a.effectiveDate >= from && a.effectiveDate <= to && (!params.currency || a.currency === params.currency); });
    rows.sort(function (a, b) { return a.effectiveDate < b.effectiveDate ? -1 : a.effectiveDate > b.effectiveDate ? 1 : (a.id < b.id ? -1 : 1); });
    rows.forEach(function (a) {
        var pay = payById[a.paymentId] || {}, doc = led.docById[a.docId] || {}, miss = !(a.fxPayRateE4 > 0 && a.fxDocRateE4 > 0);
        if (miss)
            missing++;
        total += a.fxDiffBaseMinor || 0;
        cnt++;
        addRow_(rep, 'data', { date: a.effectiveDate, payNo: pay.payNo || '', docNo: doc.docNo || '', partner: partnerName_(led.pm, a.partnerId), currency: a.currency, amount: fmtMoney_(a.amountMinor, a.currency),
            docRate: miss && !a.fxDocRateE4 ? 'thiếu' : fxText_(a.fxDocRateE4), payRate: miss && !a.fxPayRateE4 ? 'thiếu' : fxText_(a.fxPayRateE4), diff: miss ? 0 : (a.fxDiffBaseMinor || 0) }, BASE_CUR_);
    });
    addRow_(rep, 'total', { date: '', payNo: 'TỔNG CHÊNH LỆCH TỶ GIÁ ĐÃ THỰC HIỆN', docNo: '', partner: '', currency: '', amount: cnt + ' dòng', docRate: '', payRate: '', diff: total }, BASE_CUR_);
    rep.notes.push('Chênh lệch = số nguyên tệ phân bổ × (tỷ giá ngày thu/chi − tỷ giá ngày ghi nhận chứng từ); phải thu: tỷ giá tăng là lãi, phải trả: tỷ giá tăng là lỗ. Dương là lãi, âm là lỗ. Tỷ giá lấy theo ngày thực thu/chi; nhập tay được ưu tiên, nếu chưa có thì lấy Google Finance.');
    if (missing)
        rep.notes.push(missing + ' dòng thiếu tỷ giá (chứng từ hoặc phiếu cũ chưa có tỷ giá): chênh lệch tính 0 — hãy nhập tỷ giá ở menu Tỷ giá cho các ngày đó.');
    rep.notes.push('Báo cáo chỉ liệt kê để kế toán hạch toán; ứng dụng chưa tự ghi bút toán chênh lệch tỷ giá.');
    return rep;
}
// R14: công nợ ngoại tệ còn lại quy đổi VND theo tỷ giá gần nhất không sau ngày chốt; chênh lệch CHƯA thực hiện chỉ để tham khảo (chưa ghi sổ).
function rep14_(user, code, params) {
    var rep = newReport_(code, params, [col_('dir', 'Loại công nợ'), col_('currency', 'Ngoại tệ', 'text', 'center'), col_('amount', 'Còn nợ (nguyên tệ)', 'text', 'right'), col_('rate', 'Tỷ giá ngày chốt', 'text', 'right'),
        col_('orig', 'Quy đổi theo tỷ giá ghi nhận (VND)', 'money'), col_('now', 'Quy đổi theo tỷ giá ngày chốt (VND)', 'money'), col_('diff', 'Chênh lệch chưa thực hiện (VND)', 'money')]);
    var rv = fxRevalLines_(user, params.asOf, { currency: params.currency, group: params.group });
    rv.items.forEach(function (a) {
        addRow_(rep, 'data', { dir: a.dir === 'AR' ? 'Phải thu' : 'Phải trả', currency: a.cur, amount: fmtMoney_(a.out, a.cur), rate: a.rateE4 ? fxText_(a.rateE4) + ' (' + rptDateVn_(a.rateDate) + ')' : 'chưa có', orig: a.orig, now: a.now, diff: a.diff }, BASE_CUR_);
    });
    if (!rep.rows.length)
        rep.notes.push('Không có công nợ ngoại tệ còn lại tại ngày chốt.');
    if (rv.missing)
        rep.notes.push(rv.missing + ' dòng công nợ thiếu tỷ giá ghi nhận hoặc tỷ giá ngày chốt nên chưa quy đổi VND (cột nguyên tệ vẫn đủ). Nhập tỷ giá ở menu Tỷ giá.');
    rv.noRate.forEach(function (c) { rep.notes.push('Chưa có tỷ giá ' + c + ' nào không sau ngày chốt.'); });
    rep.notes.push('Tỷ giá ngày chốt là tỷ giá gần nhất trong bảng tỷ giá không sau ngày chốt (báo cáo không tự lấy Google Finance). Chênh lệch chưa thực hiện chỉ để tham khảo ở báo cáo này; bút toán đánh giá lại tạo ở menu Tỷ giá → Bút toán chênh lệch.');
    return rep;
}
function rep11_(user, code, params) { return repVat_(user, code, params, 'AP'); }
/* Trạng thái khoản phát sinh tại ngày chốt: bỏ khoản phát sinh sau ngày chốt; khoản đã lập hóa đơn mà hóa đơn ghi nhận sau ngày chốt thì coi là chưa lập. */
// Ngữ cảnh dựng trạng thái hóa đơn của khoản phát sinh theo ngày chốt: dựa vào LỊCH SỬ liên kết (DebtLine.accrualId giữ nguyên sau khi đảo/xóa) thay vì trạng thái hiện tại.
function accrualCtx_() {
    var docById = {}, docAll = {}, byAcc = {}, revOf = {}, lineAcc = {}, adjLines = [], adjBy = {};
    repoCommitted_('DebtDoc').forEach(function (d) {
        docAll[d.id] = d;
        if (d.isDeleted !== 1)
            docById[d.id] = d;
        if (d.docType === 'REVERSAL' && d.status === 'POSTED' && d.reversesDocId)
            revOf[d.reversesDocId] = d.postingDate || docEffDate_(d);
    });
    // Một lượt qua các dòng: lịch sử liên kết khoản–hóa đơn (giữ cả dòng/hóa đơn đã xóa mềm; thời điểm xóa = updatedAt) và các dòng điều chỉnh.
    repoCommitted_('DebtLine').forEach(function (l) {
        if (l.accrualId && docAll[l.docId]) {
            var m = byAcc[l.accrualId] = byAcc[l.accrualId] || {};
            m[l.docId] = docAll[l.docId];
        }
        if (l.isDeleted === 1)
            return;
        if (l.accrualId)
            lineAcc[l.id] = l.accrualId;
        if (l.adjustsLineId)
            adjLines.push(l);
    });
    // Điều chỉnh tăng/giảm đã ghi nhận: cộng vào khoản gốc theo ngày hiệu lực của điều chỉnh.
    adjLines.forEach(function (l) {
        var d = docById[l.docId], aid = lineAcc[l.adjustsLineId];
        if (!aid || !d || (d.docType !== 'ADJ_INC' && d.docType !== 'ADJ_DEC') || d.status !== 'POSTED')
            return;
        (adjBy[aid] = adjBy[aid] || []).push({ eff: d.postingDate || docEffDate_(d), net: l.netMinor || 0, gross: l.grossMinor || 0, rate: d.fxRateE4 || 0 });
    });
    return { docById: docById, byAcc: byAcc, revOf: revOf, adjBy: adjBy, accById: byId_(repoValid_('Accrual')), splitsBy: groupBy_(repoValid_('AccrualSplit'), function (x) { return x.accrualId; }) };
}
// Chia tổng theo trọng số, bảo toàn tổng: phần nguyên theo tỷ lệ, phần dư chia theo phần lẻ lớn nhất (hòa thì theo thứ tự ổn định).
function apportion_(total, weights) {
    var sign = total < 0 ? -1 : 1, t = Math.abs(total), sum = weights.reduce(function (s, w) { return s + w; }, 0), out = weights.map(function () { return 0; });
    if (!sum || !t)
        return out;
    var rem = [], used = 0;
    weights.forEach(function (w, i) { var q = Math.floor(t * w / sum); out[i] = q; used += q; rem.push({ i: i, f: t * w - q * sum }); });
    rem.sort(function (a, b) { return b.f - a.f || a.i - b.i; });
    for (var k = 0; k < t - used; k++)
        out[rem[k % rem.length].i]++;
    return out.map(function (v) { return sign * v; });
}
function vnDateOf_(iso) {
    if (!iso)
        return '';
    var t = new Date(iso);
    return isNaN(t.getTime()) ? String(iso).slice(0, 10) : Utilities.formatDate(t, 'Asia/Ho_Chi_Minh', 'yyyy-MM-dd');
}
// Trạng thái hóa đơn (OPEN/INVOICING/INVOICED) của khoản tại ngày chốt: ngày hiệu lực của hóa đơn gốc/đảo quyết định, không phải trạng thái hôm nay.
function accrualInvState_(a, asOf, ctx) {
    var aid = a.sharedFrom || a.id, docs = ctx.byAcc[aid] ? Object.keys(ctx.byAcc[aid]).map(function (k) { return ctx.byAcc[aid][k]; }) : [];
    if (!docs.length) {
        // Dữ liệu cũ chưa có liên kết dòng–khoản: dùng hóa đơn hiện giữ khoản.
        var d0 = a.docId ? ctx.docById[a.docId] : null;
        if (a.status === 'INVOICED' && d0 && (d0.postingDate || docEffDate_(d0)) > asOf)
            return 'OPEN';
        return a.status === 'CANCELLED' ? 'OPEN' : a.status;
    }
    var invoicing = false;
    for (var i = 0; i < docs.length; i++) {
        var d = docs[i], posted = d.status === 'POSTED' || d.status === 'REVERSED', eff = posted ? (d.postingDate || docEffDate_(d)) : '', rev = ctx.revOf[d.id] || '';
        if (posted && eff <= asOf && !(rev && rev <= asOf))
            return 'INVOICED';
        var created = vnDateOf_(d.createdAt);
        if (created && created > asOf)
            continue;
        if (d.status === 'DELETED' && vnDateOf_(d.updatedAt) <= asOf)
            continue;
        // đã đảo xong trước ngày chốt thì không còn giữ khoản; còn lại (nháp/chờ duyệt/ghi nhận sau ngày chốt) là đang lập
        if (posted && eff <= asOf && rev && rev <= asOf)
            continue;
        invoicing = true;
    }
    return invoicing ? 'INVOICING' : 'OPEN';
}
function accrualAt_(a, asOf, ctx) {
    if (a.accrualDate && a.accrualDate > asOf)
        return null;
    var cancelledNow = a.status === 'CANCELLED';
    if (cancelledNow && !(a.cancelledDate && a.cancelledDate > asOf))
        return a;
    var st = accrualInvState_(a, asOf, ctx), out = st === a.status ? a : Object.assign({}, a, { status: st });
    // điều chỉnh đã ghi nhận có hiệu lực đến ngày chốt (khoản chia nhiều đơn: chia theo tỷ lệ phần của đơn)
    var pid = a.sharedFrom || a.id, adj = (ctx.adjBy[pid] || []).filter(function (x) { return x.eff <= asOf; });
    if (adj.length) {
        var dn = 0, dg = 0;
        adj.forEach(function (x) { dn += x.net; dg += x.gross; });
        if (a.sharedFrom) {
            // chia cả bộ phần của khoản gốc cùng lúc để tổng các phần đúng bằng điều chỉnh gốc
            var sps = (ctx.splitsBy[a.sharedFrom] || []).slice().sort(function (x, y) { return cmpStr_(x.id, y.id); }), ix = -1;
            sps.forEach(function (x, i) { if (x.id === a.id)
                ix = i; });
            dn = ix < 0 ? 0 : apportion_(dn, sps.map(function (x) { return x.shareNetMinor; }))[ix];
            dg = ix < 0 ? 0 : apportion_(dg, sps.map(function (x) { return x.shareGrossMinor; }))[ix];
        }
        out = Object.assign({}, out, { netMinor: a.netMinor + dn, grossMinor: a.grossMinor + dg });
    }
    return out;
}
function rep09_(user, code, params) {
    var D = orderListData_(user, params.asOf, true), rep = newReport_(code, params, [col_('stt', 'STT', 'int', 'center'), col_('order', 'Đơn hàng'), col_('po', 'Số PO'), col_('customer', 'Khách hàng'), col_('svc', 'Mã dịch vụ'), col_('hsdv', 'Số HSDV'), col_('dept', 'Bộ phận thực hiện'),
        col_('rev', 'Doanh thu dịch vụ đã ghi nhận (trước thuế)', 'money'), col_('cost', 'Chi phí dịch vụ đã ghi nhận (trước thuế)', 'money'), col_('margin', 'Lãi gộp dịch vụ (đã ghi nhận)', 'money'), col_('pct', 'Tỷ suất', 'text', 'right'),
        col_('passRev', 'Chi hộ (thu lại của khách)', 'money'), col_('passCost', 'Thu hộ (trả lại khách)', 'money'), col_('passGap', 'Chênh lệch hộ (chi hộ − thu hộ, chưa đối ứng)', 'money'), col_('state', 'Tình trạng số liệu'),
        col_('unRev', 'Doanh thu chưa lập HĐ (đã gồm thuế)', 'money'), col_('unCost', 'Chi phí chưa nhận HĐ (đã gồm thuế)', 'money'), col_('invRev', 'Doanh thu đang lập HĐ', 'money'), col_('invCost', 'Chi phí đang lập HĐ', 'money')]);
    var asOf = params.asOf, docById = accrualCtx_(), accBy = {}, qOrder = normText_(params.q || '');
    Object.keys(D.accByOrder).forEach(function (id) { accBy[id] = D.accByOrder[id].map(function (a) { return accrualAt_(a, asOf, docById); }).filter(Boolean); });
    var rows = D.orders.filter(function (o) { return (o.status !== 'CANCELLED' || (o.cancelledDate && o.cancelledDate > asOf)) && (!o.orderDate || o.orderDate <= asOf) && (!params.partnerId || o.customerPartnerId === params.partnerId) && (!params.group || o.businessGroupCode === params.group) && (!params.from || o.orderDate >= params.from) && (!params.to || o.orderDate <= params.to) && (!params.orderId || o.id === params.orderId) && (!qOrder || normText_(o.orderNo).indexOf(qOrder) >= 0 || normText_(o.poNo).indexOf(qOrder) >= 0); })
        .sort(function (a, b) { return cmpStr_(a.orderDate, b.orderDate) || cmpStr_(a.orderNo, b.orderNo); });
    function zero() { return { rev: 0, cost: 0, passRev: 0, passCost: 0, un: 0, unc: 0, inv: 0, invc: 0, unv: 0, hasRev: false }; }
    function add(e, t) { e.rev += t.revenueNet; e.cost += t.costNet; e.passRev += t.passRevenue; e.passCost += t.passCost; e.un += t.uninvoicedRevenue; e.unc += t.uninvoicedCost; e.inv += t.invoicingRevenue; e.invc += t.invoicingCost; e.unv += t.passUnverified; if (t.revenueNet > 0)
        e.hasRev = true; }
    function stateOf(e) {
        if (e.hasRev && e.cost === 0)
            return 'Chưa đủ dữ liệu: chưa có chi phí';
        var parts = [];
        if (e.un || e.unc || e.inv || e.invc)
            parts.push('còn khoản chưa/đang lập hóa đơn (chưa tính vào lãi)');
        if (e.unv)
            parts.push(e.unv + ' khoản chi hộ chờ xác minh');
        if (e.passRev !== e.passCost)
            parts.push('số hộ chưa đối ứng');
        return parts.length ? 'Lãi gộp theo khoản đã ghi nhận – ' + parts.join('; ') : 'Đủ dữ liệu';
    }
    function out(e, extra) { return Object.assign({ rev: e.rev, cost: e.cost, margin: e.rev - e.cost, pct: e.rev > 0 ? Math.round((e.rev - e.cost) * 10000 / e.rev) / 100 + '%' : '—', passRev: e.passRev, passCost: e.passCost, passGap: e.passRev - e.passCost, state: stateOf(e), unRev: e.un, unCost: e.unc, invRev: e.inv, invCost: e.invc }, extra); }
    if (params.orderId || qOrder) {
        var fo = params.orderId ? D.orders.filter(function (x) { return x.id === params.orderId; })[0] : null;
        rep.meta.order = params.orderId ? (fo ? fo.orderNo + (fo.poNo ? ' · PO ' + fo.poNo : '') : '(không có trong phạm vi xem)') : 'số đơn/PO chứa "' + String(params.q).trim() + '"';
    }
    var byCur = {}, n = 0, baseRows = [], accBase = byId_(repoValid_('Accrual'));
    rows.forEach(function (o) {
        var accs = accBy[o.id] || [], buckets = [];
        orderServices_(o).forEach(function (sv) { buckets.push({ code: sv.code, hsdv: sv.hsdvNo || '', list: accs.filter(function (a) { return !a.sharedFrom && accrualServiceCode_(a, o) === sv.code; }) }); });
        buckets.push({ code: '', hsdv: '', list: accs.filter(function (a) { return a.sharedFrom || !accrualServiceCode_(a, o); }) });
        buckets.forEach(function (bk) {
            var t = orderTotals(bk.list);
            if (!params.currency) {
                var bt = orderBaseTotals_(bk.list, asOf, docById, accBase);
                if (bt.revenue || bt.cost || bt.missing)
                    baseRows.push({ o: o, svc: bk.code, hsdv: bk.hsdv, dept: bk.code ? serviceDept_(bk.code) : '', bt: bt });
            }
            Object.keys(t).forEach(function (c) {
                if (params.currency && c !== params.currency)
                    return;
                (byCur[c] = byCur[c] || []).push({ o: o, t: t[c], svc: bk.code, hsdv: bk.hsdv, dept: bk.code ? serviceDept_(bk.code) : '' });
            });
        });
    });
    var genAll = (params.partnerId || params.group || params.orderId || qOrder) ? [] : costsOutsideOrders_(user).map(function (x) { var aa = accrualAt_(x.a, asOf, docById); return aa ? { a: aa, splits: x.splits } : null; }).filter(Boolean).filter(function (x) { var a = x.a; return !x.splits.length && a.status !== 'CANCELLED' && (!params.currency || a.currency === params.currency) && (!params.from || a.accrualDate >= params.from) && (!params.to || a.accrualDate <= params.to); });
    genAll.forEach(function (x) { byCur[x.a.currency] = byCur[x.a.currency] || []; });
    Object.keys(byCur).sort().forEach(function (c) {
        addRow_(rep, 'group', { stt: 'Tiền tệ ' + c }, c);
        var T = zero();
        byCur[c].forEach(function (x) {
            var e = zero();
            add(e, x.t);
            addRow_(rep, 'data', out(e, { stt: ++n, order: x.o.orderNo, po: x.o.poNo || '—', customer: partnerName_(D.pm, x.o.customerPartnerId), svc: x.svc || '(chưa gắn mã)', hsdv: x.hsdv || '—', dept: x.dept || '—' }), c);
            add(T, x.t);
        });
        var gen = genAll.filter(function (x) { return x.a.currency === c; }), ge = zero();
        if (gen.length) {
            var gt = orderTotals(gen.map(function (x) { return x.a; }))[c];
            add(ge, gt);
            addRow_(rep, 'data', out(ge, { stt: ++n, order: 'Chi phí chung', po: '—', customer: '(không thuộc đơn hàng)', svc: '(chưa gắn mã)', hsdv: '—', dept: '—' }), c);
            add(T, gt);
        }
        addRow_(rep, 'total', out(T, { order: 'TỔNG ' + c }), c);
        var perCode = {}, order = [];
        byCur[c].forEach(function (x) {
            var k = x.svc || '', e = perCode[k] = perCode[k] || (order.push(k), zero());
            add(e, x.t);
        });
        if (gen.length) {
            var pe = perCode[''] = perCode[''] || (order.push(''), zero());
            add(pe, orderTotals(gen.map(function (x) { return x.a; }))[c]);
        }
        addRow_(rep, 'group', { stt: 'Tổng hợp theo mã dịch vụ – ' + c }, c);
        order.sort().forEach(function (k) {
            addRow_(rep, 'subtotal', out(perCode[k], { order: k || '(chưa gắn mã / chi phí chung / chia nhiều đơn)', svc: k || '—', dept: k ? serviceDept_(k) || '—' : '—' }), c);
        });
    });
    if (!params.currency && Object.keys(byCur).some(function (c) { return c !== BASE_CUR_; })) {
        // Quy đổi VND (tham khảo): chỉ khoản đã ghi nhận, mỗi lần ghi nhận theo tỷ giá đã lưu trên chính chứng từ đó; gộp mọi tiền tệ của từng đơn/mã dịch vụ.
        addRow_(rep, 'group', { stt: 'Quy đổi ' + BASE_CUR_ + ' – chỉ khoản đã ghi nhận, theo tỷ giá lưu trên từng chứng từ (tham khảo)' }, BASE_CUR_);
        var BT = zero(), perB = {}, orderB = [], nb = 0, missB = 0;
        function eb(bt) { var e = zero(); e.rev = bt.revenue; e.cost = bt.cost; e.hasRev = bt.revenue > 0; return e; }
        function stB(cells, miss) { if (miss)
            cells.state = 'Thiếu tỷ giá: ' + miss + ' khoản đã ghi nhận chưa được tính'; return cells; }
        baseRows.forEach(function (x) {
            addRow_(rep, 'data', stB(out(eb(x.bt), { stt: ++nb, order: x.o.orderNo, po: x.o.poNo || '—', customer: partnerName_(D.pm, x.o.customerPartnerId), svc: x.svc || '(chưa gắn mã)', hsdv: x.hsdv || '—', dept: x.dept || '—' }), x.bt.missing), BASE_CUR_);
            BT.rev += x.bt.revenue;
            BT.cost += x.bt.cost;
            missB += x.bt.missing;
            var k = x.svc || '', pe = perB[k] = perB[k] || (orderB.push(k), zero());
            pe.rev += x.bt.revenue;
            pe.cost += x.bt.cost;
            pe.hasRev = pe.hasRev || x.bt.revenue > 0;
        });
        if (genAll.length) {
            var gb = orderBaseTotals_(genAll.map(function (x) { return x.a; }), asOf, docById, accBase);
            if (gb.revenue || gb.cost || gb.missing) {
                addRow_(rep, 'data', stB(out(eb(gb), { stt: ++nb, order: 'Chi phí chung', po: '—', customer: '(không thuộc đơn hàng)', svc: '(chưa gắn mã)', hsdv: '—', dept: '—' }), gb.missing), BASE_CUR_);
                BT.rev += gb.revenue;
                BT.cost += gb.cost;
                missB += gb.missing;
                var pg = perB[''] = perB[''] || (orderB.push(''), zero());
                pg.rev += gb.revenue;
                pg.cost += gb.cost;
            }
        }
        BT.hasRev = BT.rev > 0;
        addRow_(rep, 'total', stB(out(BT, { order: 'TỔNG QUY ĐỔI ' + BASE_CUR_ }), missB), BASE_CUR_);
        addRow_(rep, 'group', { stt: 'Tổng hợp theo mã dịch vụ – quy đổi ' + BASE_CUR_ }, BASE_CUR_);
        orderB.sort().forEach(function (k) {
            addRow_(rep, 'subtotal', out(perB[k], { order: k || '(chưa gắn mã / chi phí chung / chia nhiều đơn)', svc: k || '—', dept: k ? serviceDept_(k) || '—' : '—' }), BASE_CUR_);
        });
    }
    if (!rep.rows.length)
        rep.notes.push('Chưa có đơn hàng/khoản phát sinh trong bộ lọc.');
    rep.notes.push('Tính tại ngày chốt ' + asOf + ': chỉ gồm đơn hàng và khoản phát sinh có ngày đến ngày này. Khoản đã hủy vẫn được tính tại các ngày chốt trước ngày hủy (ngày hủy được lưu từ bản này; khoản hủy từ bản cũ chưa có ngày hủy nên vẫn bị loại ở mọi ngày chốt). Khoản đã lập hóa đơn tính theo ngày ghi nhận hóa đơn (ghi nhận sau ngày chốt thì tại ngày chốt vẫn là "chưa lập HĐ").');
    rep.notes.push('Trạng thái hóa đơn: "chưa lập HĐ" (OPEN) + "đang lập HĐ" (hóa đơn nháp/chờ duyệt, INVOICING) + "đã ghi nhận công nợ" (INVOICED) = tổng khoản hợp lệ; các cột HĐ là số đã gồm thuế và gồm cả khoản hộ vì vẫn là nghĩa vụ phải thu/phải trả.');
    rep.notes.push('Doanh thu dịch vụ và chi phí dịch vụ KHÔNG gồm thu hộ/chi hộ. Chi hộ (phải thu lại của khách) và thu hộ (phải trả lại khách) hiện ở cột riêng; "Chênh lệch hộ" = chi hộ − thu hộ là số hộ chưa đối ứng, không phải lợi nhuận và không tự đưa vào lãi gộp. Chi phí loại "Chi hộ" nhưng chưa đánh dấu chi hộ được nêu là "chờ xác minh" ở cột tình trạng.');
    rep.notes.push('Mỗi đơn được tách theo mã dịch vụ của khoản (mỗi mã một dòng, kèm số HSDV và bộ phận thực hiện); khoản chia cho nhiều đơn, chi phí chung và khoản cũ chưa gắn mã nằm ở dòng "chưa gắn mã". Cuối mỗi tiền tệ có bảng tổng hợp theo mã. Lãi gộp ở các phần trên tính theo từng tiền tệ, không cộng chéo; số quy đổi VND chỉ nằm ở phần "Quy đổi VND" riêng bên dưới.');
    rep.notes.push('Doanh thu, chi phí và lãi gộp CHỈ tính khoản đã lập hóa đơn (đã ghi nhận); khoản chưa/đang lập hóa đơn chưa là doanh thu/chi phí ghi nhận nên không vào lãi (xem các cột HĐ). Tình trạng số liệu: "Chưa đủ dữ liệu" khi có doanh thu dịch vụ nhưng chưa có chi phí dịch vụ; "Lãi gộp theo khoản đã ghi nhận – …" khi còn khoản chưa/đang lập hóa đơn, số hộ chưa đối ứng hoặc chi hộ chờ xác minh.');
    if (!params.currency)
        rep.notes.push('Phần "Quy đổi VND" (tham khảo, hiện khi có tiền tệ khác VND): chỉ khoản đã ghi nhận, mỗi lần ghi nhận (hóa đơn gốc và từng điều chỉnh) quy đổi theo tỷ giá đã lưu trên chính chứng từ đó; khoản đã ghi nhận mà chứng từ chưa có tỷ giá không được tính và ghi ở cột Tình trạng. Chọn một tiền tệ cụ thể thì không hiện phần này.');
    rep.signatures = true;
    return rep;
}
function feeNameOf_(code) { var all = catalogList_('FEE_TYPE', true); for (var i = 0; i < all.length; i++)
    if (all[i].code === code)
        return all[i].name; return code; }
var STALE_MS = 2 * 60 * 1000;
var LOCK_WAIT_MS = 20000;
function nextId_(table) { return uid_(ID_PREFIX_[table] || 'row'); }
function txPayloadHash_(payload) {
    var value = payload;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
        value = Object.assign({}, value);
        delete value.draftId;
        delete value.draftVersion;
    }
    return sha256Hex_(JSON.stringify(value === undefined ? null : value));
}
function replayTxWithPayload_(prior, payload, user, action) {
    var legacy = sha256Hex_(JSON.stringify(payload === undefined ? null : payload));
    return replayTx_(prior, prior.payloadHash === legacy ? legacy : txPayloadHash_(payload), user, action);
}
function runTx_(user, meta, build) {
    resetMemoDirect_();
    var requestId = meta.requestId || uid_('req'), payloadHash = txPayloadHash_(meta.payload);
    var failAt = props_().getProperty('ENV') === 'TEST' ? meta.failAt : null;
    function failpoint(x) { if (failAt === x)
        throw new Error('FAILPOINT:' + x); }
    var prior = findTxByRequest_(requestId);
    if (prior)
        return replayTxWithPayload_(prior, meta.payload, user, meta.action);
    var lock = LockService.getScriptLock(), tLock0 = Date.now();
    if (!lock.tryLock(LOCK_WAIT_MS)) {
        statAdd_('lockWaitMs', Date.now() - tLock0);
        throw err_('SERVER_BUSY', 'Hệ thống đang bận, vui lòng thử lại.');
    }
    var tHeld0 = Date.now();
    statAdd_('lockWaitMs', tHeld0 - tLock0);
    LOCKED_ = true;
    try {
        resetMemoDirect_();
        recoverStale_(0);
        prior = findTxByRequest_(requestId);
        if (prior)
            return replayTxWithPayload_(prior, meta.payload, user, meta.action);
        var now = nowIso_(), txId = nextId_('SysTx'), inserts = {}, updates = [], seq = {}, seqIns = {}, auditList = [];
        var tx = {
            user: user, now: now, txId: txId,
            rows: function (t) { return repoValid_(t); },
            find: function (t, id) { return repoFind_(t, id); },
            insert: function (t, obj) {
                var o = Object.assign({}, obj);
                if (!o.id)
                    o.id = nextId_(t);
                if (!NOSYS_[t])
                    Object.assign(o, { createdAt: now, createdBy: user.id, updatedAt: now, updatedBy: user.id, version: 1, isDeleted: 0, commitState: 'P', txId: txId });
                (inserts[t] = inserts[t] || []).push(o);
                return o;
            },
            update: function (t, id, patch, ifVersion) {
                var cur = null, i;
                for (i = 0; i < updates.length; i++)
                    if (updates[i].t === t && updates[i].id === id)
                        cur = updates[i].after;
                var base = cur || repoFind_(t, id);
                if (!base)
                    throw err_('NOT_FOUND', 'Không tìm thấy bản ghi ' + t + '/' + id);
                if (ifVersion !== undefined && ifVersion !== null && Number(ifVersion) !== base.version)
                    throw err_('VERSION_CONFLICT', 'Bản ghi đã được người khác thay đổi. Hãy tải lại.');
                var after = Object.assign({}, base, patch, { updatedAt: now, updatedBy: user.id, version: base.version + 1, txId: txId });
                var existing = null;
                for (i = 0; i < updates.length; i++)
                    if (updates[i].t === t && updates[i].id === id)
                        existing = updates[i];
                if (existing)
                    existing.after = after;
                else
                    updates.push({ t: t, id: id, row: base._row, after: after });
                return after;
            },
            nextSeq: function (key) {
                var n;
                if (seq[key] !== undefined) {
                    n = seq[key] + 1;
                    seq[key] = n;
                    if (seqIns[key])
                        seqIns[key].value = String(n);
                    else
                        tx.update('Config', key, { value: String(n) });
                    return n;
                }
                var cfg = repoFind_('Config', key);
                n = cfg ? Number(cfg.value) + 1 : 1;
                seq[key] = n;
                if (cfg)
                    tx.update('Config', key, { value: String(n) });
                else
                    seqIns[key] = tx.insert('Config', { id: key, value: String(n) });
                return n;
            }
        };
        var built = build(tx) || {};
        (built.audit || []).forEach(function (a) { auditList.push(a); });
        var plan = { ins: [], upd: [] }, tables = Object.keys(inserts);
        // Kiểm tra tiêu đề thật của mọi bảng sắp ghi TRƯỚC khi ghi bất cứ thứ gì (SysTx cũng vậy).
        repoSheet_('SysTx', true);
        tables.forEach(function (t) { repoSheet_(t, true); });
        updates.forEach(function (u) { repoSheet_(u.t, true); });
        appendRows_('SysTx', [{ id: txId, requestId: requestId, action: meta.action, actor: user.email, payloadHash: payloadHash, status: 'PENDING',
                startedAt: now, resultJson: JSON.stringify(built.result === undefined ? null : built.result) }]);
        var sysRow = repoLastRows_('SysTx', 1)[0]._row;
        setOpenTx_(txId, 'PENDING');
        // Nhật ký kiểm toán được ghi TRƯỚC dữ liệu (result = PENDING, mã xác định theo giao dịch); khi commit/hoàn tác sẽ đổi thành OK/ROLLED_BACK.
        var auditRows = auditRowsOf_(user, requestId, txId, auditList, now);
        if (auditRows.length) {
            var aStart = repoSheet_('AuditLog', true).getLastRow() + 1;
            repoAppend_('AuditLog', auditRows);
            plan.audit = { start: aStart, n: auditRows.length };
        }
        updates.forEach(function (u) { plan.upd.push({ t: u.t, row: u.row, before: repoReadRaw_(u.t, u.row) }); });
        tables.forEach(function (t) {
            var start = repoSheet_(t).getLastRow() + 1;
            plan.ins.push({ t: t, start: start, n: inserts[t].length });
        });
        repoSetCell_('SysTx', sysRow, 'planJson', JSON.stringify(plan));
        failpoint('AFTER_PLAN');
        tables.forEach(function (t) { repoAppend_(t, inserts[t]); });
        failpoint('AFTER_INSERT');
        updates.forEach(function (u) { repoWriteRow_(u.t, u.row, u.after); });
        failpoint('AFTER_UPDATE');
        repoSetCell_('SysTx', sysRow, 'status', 'COMMITTED');
        repoSetCell_('SysTx', sysRow, 'committedAt', nowIso_());
        setOpenTx_(txId, 'COMMITTED');
        failpoint('AFTER_COMMIT');
        finalizeTx_({ id: txId, _row: sysRow, planJson: JSON.stringify(plan) });
        return built.result === undefined ? null : built.result;
    }
    finally {
        LOCKED_ = false;
        lock.releaseLock();
        statAdd_('lockHeldMs', Date.now() - tHeld0);
    }
}
function appendRows_(t, objs) { return repoAppend_(t, objs); }
function findTxByField_(field, value) {
    if (typeof value !== 'string' || !value || value.length > 100)
        throw err_('VALIDATION_FAILED', 'Mã yêu cầu không hợp lệ.');
    var cols = parseCols_('SysTx'), col = -1;
    for (var i = 0; i < cols.length; i++)
        if (cols[i].name === field)
            col = i + 1;
    if (col < 1)
        throw err_('INTERNAL_ERROR', 'Không tìm thấy cột giao dịch.');
    var sheet = repoSheet_('SysTx'), last = sheet.getLastRow();
    if (last < 2)
        return null;
    statAdd_('txLookupRows', last - 1);
    var hits = sheet.getRange(2, col, last - 1, 1).createTextFinder(value).matchEntireCell(true).matchCase(true).useRegularExpression(false).findAll();
    if (!hits.length)
        return null;
    if (hits.length > 1)
        throw err_('IDEMPOTENCY_MISMATCH', 'Có mã giao dịch trùng trong lịch sử; cần quản trị viên kiểm tra.');
    return rowToObj_(cols, repoReadRaw_('SysTx', hits[0].getRow()), hits[0].getRow());
}
function findTxByRequest_(requestId) { return findTxByField_('requestId', requestId); }
function replayTx_(prior, payloadHash, user, action) {
    if (!user || String(prior.actor || '').trim().toLowerCase() !== String(user.email || '').trim().toLowerCase() || prior.action !== action)
        throw err_('IDEMPOTENCY_MISMATCH', 'Mã yêu cầu đã được sử dụng cho một thao tác khác.');
    if (prior.payloadHash !== payloadHash)
        throw err_('IDEMPOTENCY_MISMATCH', 'Cùng requestId nhưng nội dung khác.');
    if (prior.status === 'COMMITTED' || prior.status === 'FINALIZED')
        return safeJson_(prior.resultJson, null);
    if (prior.status === 'PENDING')
        throw err_('REQUEST_IN_PROGRESS', 'Yêu cầu đang được xử lý.');
    throw err_('REQUEST_FAILED', 'Yêu cầu trước đó đã bị hủy (' + prior.status + '). Hãy tạo yêu cầu mới.');
}
function auditRowsOf_(user, requestId, txId, list, at) {
    return (list || []).map(function (a, i) {
        var diff = JSON.stringify(a.diff || null);
        if (diff.length > 40000)
            diff = JSON.stringify({ truncated: true, head: diff.slice(0, 30000) });
        return { id: 'aud_' + txId + '_' + i, at: at || nowIso_(), actorUserId: user.id, actorEmail: user.email, action: a.action, entityType: a.entityType,
            entityId: a.entityId, diffJson: diff, txId: txId, requestId: requestId, result: 'PENDING', reasonCode: '' };
    });
}
// Đổi result của các dòng nhật ký thuộc giao dịch (chạy lại nhiều lần vẫn an toàn). Ưu tiên vị trí đã lưu trong plan; không khớp thì tìm theo txId.
function auditFinish_(txId, loc, result) {
    var s = repoSheet_('AuditLog', true), cols = parseCols_('AuditLog'), ti = -1, ri = -1;
    cols.forEach(function (c, i) { if (c.name === 'txId')
        ti = i + 1; if (c.name === 'result')
        ri = i + 1; });
    var rows = [];
    if (loc && loc.n && s.getLastRow() >= loc.start + loc.n - 1) {
        var ids = s.getRange(loc.start, ti, loc.n, 1).getValues();
        if (ids.every(function (r) { return r[0] === txId; }))
            for (var k = 0; k < loc.n; k++)
                rows.push(loc.start + k);
    }
    if (!rows.length && s.getLastRow() >= 2)
        s.getRange(2, ti, s.getLastRow() - 1, 1).createTextFinder(txId).matchEntireCell(true).matchCase(true).findAll().forEach(function (c) { rows.push(c.getRow()); });
    rows.forEach(function (r) { var cur = s.getRange(r, ri).getValue(); if (cur === 'PENDING')
        s.getRange(r, ri).setValue(result); });
}
function finalizeTx_(tx) {
    var plan = safeJson_(tx.planJson, { ins: [] });
    (plan.ins || []).forEach(function (b) { repoSetColumn_(b.t, b.start, b.n, 'commitState', 'C'); });
    auditFinish_(tx.id, plan.audit, 'OK');
    repoSetCell_('SysTx', tx._row, 'status', 'FINALIZED');
    repoSetCell_('SysTx', tx._row, 'finalizedAt', nowIso_());
    setOpenTx_(tx.id, null);
    bumpDataVersion_();
}
function rollbackTx_(tx) {
    var plan = safeJson_(tx.planJson, { ins: [], upd: [] });
    (plan.upd || []).forEach(function (u) { repoWriteRaw_(u.t, u.row, u.before); });
    (plan.ins || []).forEach(function (b) { repoSetColumn_(b.t, b.start, b.n, 'commitState', 'A'); });
    auditFinish_(tx.id, plan.audit, 'ROLLED_BACK');
    repoSetCell_('SysTx', tx._row, 'status', 'ROLLED_BACK');
    setOpenTx_(tx.id, null);
}
function recoverStale_(staleMs) {
    var limit = staleMs === undefined ? STALE_MS : staleMs, out = { rolledBack: 0, finalized: 0 };
    var open = safeJson_(props_().getProperty('OPEN_TX'), {});
    var ids = Object.keys(open);
    if (!ids.length)
        return out;
    ids.map(function (id) { var t = findTxByField_('id', id); if (!t)
        setOpenTx_(id, null); return t; }).filter(function (t) { return !!t; }).forEach(function (t) {
        if (t.status !== 'PENDING' && t.status !== 'COMMITTED')
            return;
        if (t.status === 'PENDING' && Date.now() - new Date(t.startedAt).getTime() >= limit) {
            rollbackTx_(t);
            out.rolledBack++;
        }
        else if (t.status === 'COMMITTED') {
            finalizeTx_(t);
            out.finalized++;
        }
    });
    resetMemoDirect_();
    return out;
}
// ===== Bảng tổng hợp định kỳ (read model) =====
// Bộ kích hoạt 5 phút dựng sẵn các số liệu tổng hợp (không phụ thuộc người xem) vào bảng ReadModel; màn hình tổng hợp chỉ đọc bảng nhỏ này
// thay vì đọc/tính lại toàn bộ sổ. Hàng dựng sẵn mang đủ khóa (đối tác, nhóm) để lọc theo PHẠM VI của từng người khi đọc.
// Bảng là dữ liệu dẫn xuất: xóa/dựng lại bất cứ lúc nào (rmRebuildAll_) mà không mất dữ liệu gốc; không đi qua runTx_ và không tăng phiên bản dữ liệu.
var RM_USER_ = { id: 'system', email: 'system', displayName: 'Hệ thống', role: 'APPROVER', scope: { allPartners: true } };
var RM_CHUNK_ = 40000, RM_MAX_PARTS_ = 60;
var RM_MODELS_ = { PARTNERS: 1, ORDERS: 1, COSTS: 1, WORKBENCH: 1, DASHBOARD: 1, UNINVOICED: 1 };
function rmMaxAgeMin_() { var v = Number(cfgGet_('summary.maxAgeMin', '15')); return isFinite(v) && v > 0 ? v : 15; }
function rmPartners_(asOf) {
    var led = loadLedger_(RM_USER_, asOf), agg = {}, bc = bookCtx_();
    led.lines.forEach(function (l) {
        var b = led.bal.byLine[l.id];
        if (!b)
            return;
        var d = led.docById[l.docId], k = [d.direction, d.partnerId, d.businessGroupCode || '', d.currency].join('|');
        // *B = giá trị ghi sổ quy đổi VND (R36); baseMiss = số dòng chưa có tỷ giá ghi nhận nên chưa quy đổi
        var o = agg[k] = agg[k] || { dir: d.direction, p: d.partnerId, g: d.businessGroupCode || '', c: d.currency, out: 0, credit: 0, overdue: 0, due7: 0, missing: 0, maxDays: 0, docs: {}, oldest: '', outB: 0, creditB: 0, overdueB: 0, due7B: 0, missingB: 0, baseMiss: 0 };
        var vb = b.out === 0 ? 0 : bookOfLine_(bc, d, b.out);
        if (b.out < 0) {
            o.credit += -b.out;
            if (vb === null)
                o.baseMiss++;
            else
                o.creditB += -vb;
            return;
        }
        if (b.out === 0)
            return;
        o.out += b.out;
        o.docs[d.id] = 1;
        if (vb === null)
            o.baseMiss++;
        else
            o.outB += vb;
        if (!d.dueDate) {
            o.missing += b.out;
            if (vb !== null)
                o.missingB += vb;
        }
        else {
            var days = daysBetween_(d.dueDate, asOf);
            if (days > 0) {
                o.overdue += b.out;
                if (vb !== null)
                    o.overdueB += vb;
                o.maxDays = Math.max(o.maxDays, days);
            }
            else if (days >= -7) {
                o.due7 += b.out;
                if (vb !== null)
                    o.due7B += vb;
            }
        }
        var dd = docEffDate_(d);
        if (!o.oldest || dd < o.oldest)
            o.oldest = dd;
    });
    var rows = Object.keys(agg).sort().map(function (k) { var o = agg[k]; o.docs = Object.keys(o.docs).length; return o; });
    led.payments.forEach(function (x) {
        var b = led.payBal[x.id];
        if (b && b.unalloc > 0 && x.status === 'POSTED') {
            var av = bookOfAdv_(bc, x, b.unalloc);
            rows.push({ adv: 1, dir: x.direction === 'IN' ? 'AR' : 'AP', p: x.partnerId, g: '', c: x.currency, amt: b.unalloc, amtB: av === null ? 0 : av, baseMiss: av === null ? 1 : 0 });
        }
    });
    return rows;
}
function rmOrders_(asOf) {
    var D = orderListData_(RM_USER_, asOf, false), actx = accrualCtx_(), led = loadLedger_(RM_USER_, asOf), rows = [];
    D.orders.forEach(function (o) {
        if (o.archivedAt)
            return;
        var list = (D.accByOrder[o.id] || []).map(function (x) { return accrualAt_(x, asOf, actx); }).filter(Boolean), t = orderTotals(list), arOut = {}, apOut = {}, any = o.status === 'OPEN';
        list.forEach(function (a) {
            if (a.kind === 'COST' && a.status === 'INVOICED' && a.debtLineId && !a.sharedFrom) {
                var bp = led.bal.byLine[a.debtLineId];
                if (bp && bp.out > 0) {
                    apOut[a.currency] = (apOut[a.currency] || 0) + bp.out;
                    any = true;
                }
            }
            if (a.kind === 'REVENUE' && a.status === 'INVOICED' && a.debtLineId && !a.sharedFrom) {
                var b = led.bal.byLine[a.debtLineId];
                if (b && b.out > 0) {
                    arOut[a.currency] = (arOut[a.currency] || 0) + b.out;
                    any = true;
                }
            }
        });
        var cur = {};
        Object.keys(t).forEach(function (c) {
            var x = t[c];
            cur[c] = { rev: x.revenueGross, un: x.uninvoicedRevenue, ing: x.invoicingRevenue, inv: x.invoicedRevenue, ar: arOut[c] || 0, ap: apOut[c] || 0, cost: x.costGross, unc: x.uninvoicedCost, ingc: x.invoicingCost, margin: x.margin, pass: x.passGap };
            if (x.incompleteRevenue > 0 || x.incompleteCost > 0)
                any = true;
        });
        Object.keys(arOut).concat(Object.keys(apOut)).forEach(function (c) { if (!cur[c])
            cur[c] = { rev: 0, un: 0, ing: 0, inv: 0, ar: arOut[c] || 0, ap: apOut[c] || 0, cost: 0, unc: 0, ingc: 0, margin: 0, pass: 0 }; });
        if (!any)
            return;
        rows.push({ id: o.id, no: o.orderNo, po: o.poNo || '', cp: o.customerPartnerId, g: o.businessGroupCode, d: o.orderDate, st: o.status, hs: servicesOut_(o).map(function (x) { return x.hsdvNo; }).filter(Boolean).join(', '), cur: cur });
    });
    rows.sort(function (a, b) { return cmpStr_(b.d, a.d) || cmpStr_(b.no, a.no); });
    return rows;
}
function rmCosts_(asOf) {
    var led = loadLedger_(RM_USER_, asOf), actx = accrualCtx_(), orders = byId_(repoValid_('Order')), docs = byId_(repoValid_('DebtDoc')), splitsBy = groupBy_(repoValid_('AccrualSplit'), function (x) { return x.accrualId; }), rows = [];
    repoValid_('Accrual').forEach(function (a0) {
        if (a0.kind !== 'COST')
            return;
        var a = accrualAt_(a0, asOf, actx);
        if (!a || a.status === 'CANCELLED')
            return;
        var out = a.grossMinor, d = a.docId ? docs[a.docId] : null;
        if (a.status === 'INVOICED') {
            var b = a.debtLineId ? led.bal.byLine[a.debtLineId] : null;
            out = b ? Math.max(0, b.out) : 0;
        }
        if (out <= 0)
            return;
        var o = a.orderId ? orders[a.orderId] : null, sps = splitsBy[a.id] || [], sc = [];
        if (o)
            sc.push([o.customerPartnerId, o.businessGroupCode]);
        else {
            sc.push([a.partnerId, '']);
            sps.forEach(function (sp) { var so = orders[sp.orderId]; if (so)
                sc.push([so.customerPartnerId, so.businessGroupCode]); });
        }
        rows.push({ id: a.id, p: a.partnerId, o: a.orderId || '', on: o ? o.orderNo : (sps.length ? 'Chia ' + sps.length + ' đơn' : 'Chi phí chung'), ds: a.description || '', d: a.accrualDate, c: a.currency, gross: a.grossMinor, out: out, st: a.status, doc: d ? d.docNo : '', due: d ? d.dueDate : '', sc: sc, pt: a.isPassThrough ? 1 : 0 });
    });
    rows.sort(function (a, b) { return cmpStr_(a.d, b.d) || cmpStr_(a.id, b.id); });
    return rows;
}
function rmWorkbench_(asOf) { return workbenchSummaryLive_(RM_USER_, { payload: { asOf: asOf } }); }
function rmDashboard_(asOf) { return dashboardSummaryLive_(RM_USER_, { payload: { asOf: asOf } }); }
function rmUninvoiced_(asOf) { return dashboardUninvoicedLive_(RM_USER_, { payload: { asOf: asOf } }); }
function rmBuild_(model, asOf) {
    var fn = { PARTNERS: rmPartners_, ORDERS: rmOrders_, COSTS: rmCosts_, WORKBENCH: rmWorkbench_, DASHBOARD: rmDashboard_, UNINVOICED: rmUninvoiced_ }[model];
    if (!fn)
        throw err_('NOT_FOUND', 'Không có mô hình tổng hợp ' + model);
    return fn(asOf);
}
function rmChunks_(value) {
    if (!Array.isArray(value))
        return [JSON.stringify(value)];
    var parts = [], cur = [], len = 2;
    value.forEach(function (r) {
        var j = JSON.stringify(r);
        if (cur.length && len + j.length + 1 > RM_CHUNK_) {
            parts.push('[' + cur.join(',') + ']');
            cur = [];
            len = 2;
        }
        cur.push(j);
        len += j.length + 1;
    });
    parts.push('[' + cur.join(',') + ']');
    return parts;
}
// Ghi các mảnh của một khóa vào bảng ReadModel (ghi đè tại chỗ, không tạo hàng thừa). Gọi khi đang giữ khóa script.
function rmWriteKey_(key, value, meta) {
    var parts = rmChunks_(value);
    if (parts.length > RM_MAX_PARTS_ || parts.some(function (p) { return p.length > 49000; }))
        return false;
    delete MEMO_['t:ReadModel'];
    delete MEMO_['v:ReadModel'];
    var ex = repoReadAll_('ReadModel').filter(function (r) { return r.model === key; }).sort(function (a, b) { return a.part - b.part; }), append = [];
    parts.forEach(function (j, i) {
        var o = { id: ex[i] ? ex[i].id : uid_('rdm'), model: key, part: i, parts: parts.length, json: j, dataVersion: meta.dataVersion, builtAt: meta.builtAt, asOf: meta.asOf, version: 1, isDeleted: 0, commitState: 'C', txId: '', createdAt: meta.builtAt, createdBy: 'system', updatedAt: meta.builtAt, updatedBy: 'system' };
        if (ex[i])
            repoWriteRow_('ReadModel', ex[i]._row, o);
        else
            append.push(o);
    });
    for (var k = parts.length; k < ex.length; k++)
        repoWriteRow_('ReadModel', ex[k]._row, Object.assign({}, ex[k], { json: '', parts: 0, isDeleted: 1, updatedAt: meta.builtAt }));
    if (append.length)
        repoAppend_('ReadModel', append);
    delete MEMO_['t:ReadModel'];
    delete MEMO_['v:ReadModel'];
    return true;
}
// Ghi một khóa riêng lẻ (khóa script chỉ giữ rất ngắn để không chặn người đang ghi sổ).
function rmStore_(key, value, meta) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(8000))
        return false;
    try {
        return rmWriteKey_(key, value, meta);
    }
    finally {
        lock.releaseLock();
    }
}
// Đọc một khóa: trả null nếu thiếu/không đủ mảnh/các mảnh lệch thời điểm dựng (đang được ghi dở).
function rmReadKey_(key) {
    var rows = repoValid_('ReadModel').filter(function (r) { return r.model === key && r.parts > 0; }).sort(function (a, b) { return a.part - b.part; });
    if (!rows.length)
        return null;
    var n = rows[0].parts, at = rows[0].builtAt;
    if (rows.length !== n)
        return null;
    for (var i = 0; i < n; i++)
        if (rows[i].part !== i || rows[i].parts !== n || rows[i].builtAt !== at || rows[i].dataVersion !== rows[0].dataVersion || rows[i].asOf !== rows[0].asOf)
            return null;
    try {
        var parts = rows.map(function (r) { return JSON.parse(r.json); }), value = Array.isArray(parts[0]) ? parts.reduce(function (a, b) { return a.concat(b); }, []) : parts[0];
        return { value: value, dataVersion: rows[0].dataVersion, builtAt: at, asOf: rows[0].asOf };
    }
    catch (e) {
        return null;
    }
}
// Bản kê (manifest) là điểm công bố DUY NHẤT của một bộ bản dựng: chứa khe đang dùng (A/B), thời điểm/phiên bản dữ liệu chung, các mô hình có trong bộ và tình trạng lần dựng.
function rmManifest_() { var r = rmReadKey_('MANIFEST'); return r ? r.value : null; }
function rmLoad_(model) {
    var mf = rmManifest_();
    if (!mf || !mf.models || mf.models.indexOf(model) < 0)
        return null;
    var snap = rmReadKey_(mf.slot + ':' + model);
    if (!snap || snap.builtAt !== mf.builtAt || snap.dataVersion !== mf.dataVersion)
        return null;
    return snap;
}
function rmFresh_(snap, asOf) {
    if (!snap || snap.asOf !== asOf)
        return false;
    var ageMin = (Date.now() - new Date(snap.builtAt).getTime()) / 60000;
    return isFinite(ageMin) && ageMin >= 0 && ageMin <= rmMaxAgeMin_();
}
function rmStatus_(mf) { var st = (mf && mf.status) || {}; return { failures: st.failures || 0, lastError: st.lastError || '', lastOkAt: st.lastOkAt || (mf ? mf.builtAt : ''), lastAttemptAt: st.lastAttemptAt || '' }; }
// Ghi tình trạng lần dựng (không đổi bộ bản dựng đang công bố).
function rmRecordStatus_(patch) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(8000))
        return;
    try {
        var mf = rmManifest_() || { slot: '', builtAt: '', dataVersion: -1, asOf: '', models: [] };
        mf.status = Object.assign({}, mf.status || {}, patch);
        rmWriteKey_('MANIFEST', mf, { dataVersion: mf.dataVersion, builtAt: mf.builtAt || nowIso_(), asOf: mf.asOf });
    }
    finally {
        lock.releaseLock();
    }
}
// Dựng TOÀN BỘ các mô hình dưới cùng một phiên bản dữ liệu; chỉ công bố khi tất cả thành công và dữ liệu không đổi trong lúc dựng (hàng rào đọc).
// Ghi vào khe còn lại rồi lật bản kê bằng một lần ghi: lỗi giữa chừng thì bộ cũ vẫn nguyên vẹn.
// Giấy phép dựng: chỉ một lượt dựng cả bộ tại một thời điểm (hết hạn sau 5 phút nếu tiến trình chết).
var RM_LEASE_TOKEN_ = null;
function rmLease_(on, token) {
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(3000))
        return false;
    try {
        var cur = safeJson_(props_().getProperty('RM_LEASE'), null);
        if (on) {
            if (cur && Date.now() - new Date(cur.at).getTime() < 600000)
                return false;
            token = token || uid_('lease');
            props_().setProperty('RM_LEASE', JSON.stringify({ at: nowIso_(), token: token }));
            RM_LEASE_TOKEN_ = token;
            return true;
        }
        token = token || RM_LEASE_TOKEN_;
        if (!cur || !token || cur.token !== token)
            return false;
        props_().deleteProperty('RM_LEASE');
        if (RM_LEASE_TOKEN_ === token)
            RM_LEASE_TOKEN_ = null;
        return true;
    }
    finally { lock.releaseLock(); }
}
function rmBuildSet_() {
    var token = uid_('lease');
    if (!rmLease_(true, token))
        throw Object.assign(err_('BUILD_BUSY', 'Đang có lượt dựng khác.'), { stale: true });
    try { return rmBuildSetLocked_(token); }
    finally { rmLease_(false, token); }
}
function rmBuildSetLocked_(leaseToken) {
    var today = todayVn_(), v = beginReadSnapshot_(), values = {}, names = Object.keys(RM_MODELS_);
    names.forEach(function (m) { values[m] = rmBuild_(m, today); });
    assertReadSnapshot_(v);
    var meta = { dataVersion: v, builtAt: nowIso_(), asOf: today }, models = [];
    resetMemo_();
    MEMO_.cacheOk = true;
    var old = rmManifest_(), slot = old && old.slot === 'A' ? 'B' : 'A';
    // Bước 1 — ghi vào khe KHÔNG được công bố, KHÔNG giữ khóa script (đã có giấy phép dựng; người đọc chỉ đọc khe đang công bố): không chặn thao tác ghi sổ.
    names.forEach(function (m) { if (rmWriteKey_(slot + ':' + m, values[m], meta))
        models.push(m); });
    if (models.length !== names.length)
        throw err_('INTERNAL_ERROR', 'Mô hình quá lớn, không lưu được: ' + names.filter(function (m) { return models.indexOf(m) < 0; }).join(', '));
    // Bước 2 — công bố trong khóa NGẮN: kiểm lại nguồn rồi lật bản kê.
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(8000))
        throw err_('SERVER_BUSY', 'Đang có tiến trình ghi khác; chưa công bố được bản tổng hợp.');
    try {
        resetMemo_();
        MEMO_.cacheOk = true;
        var owned = safeJson_(props_().getProperty('RM_LEASE'), null);
        if (!owned || !leaseToken || owned.token !== leaseToken)
            throw Object.assign(err_('STALE_BUILD', 'Lượt dựng không còn quyền công bố.'), { stale: true });
        var cur = rmManifest_();
        if (dataVersion_() !== v || Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {})).length || (cur && cur.dataVersion > v))
            throw Object.assign(err_('STALE_BUILD', 'Dữ liệu nguồn đã đổi trong lúc dựng; bỏ bản dựng này, giữ bộ đang công bố.'), { stale: true });
        rmWriteKey_('MANIFEST', { slot: slot, builtAt: meta.builtAt, dataVersion: v, asOf: today, models: models, status: { failures: 0, lastError: '', lastOkAt: meta.builtAt, lastAttemptAt: meta.builtAt, lastAlertAt: cur && cur.status ? cur.status.lastAlertAt || '' : '' } }, meta);
        props_().setProperty('RM_GEN', meta.builtAt);
    }
    finally {
        lock.releaseLock();
    }
    // Dọn bản dựng kiểu cũ (ngoài khóa; chỉ dữ liệu dẫn xuất).
    try {
        repoReadAll_('ReadModel').forEach(function (r) { if (r.isDeleted !== 1 && r.model !== 'MANIFEST' && r.model !== 'RECON' && !/^[AB]:/.test(r.model) && !/^TEST/.test(r.model))
            repoWriteRow_('ReadModel', r._row, Object.assign({}, r, { json: '', parts: 0, isDeleted: 1 })); });
    }
    catch (e) {
        console.warn('rm cleanup ' + e);
    }
    return { dataVersion: v, builtAt: meta.builtAt, asOf: today, slot: slot, models: names };
}
function rmAlertOnce_(subject, body) {
    try {
        var mf = rmManifest_(), last = mf && mf.status ? mf.status.lastAlertAt : '';
        if (last && Date.now() - new Date(last).getTime() < 7200000)
            return false;
        alertAdmin_(subject, body);
        rmRecordStatus_({ lastAlertAt: nowIso_() });
        return true;
    }
    catch (e) {
        return false;
    }
}
function rmRefreshIfNeeded_(force, quiet) {
    var today = todayVn_(), cur = dataVersion_();
    resetMemo_();
    MEMO_.cacheOk = true;
    cachePrefetch_();
    var mf = rmManifest_();
    if (!force && mf && mf.asOf === today && mf.dataVersion === cur)
        return { rebuilt: [], failed: [], skipped: true };
    try {
        var r = rmBuildSet_();
        return { rebuilt: r.models, failed: [], builtAt: r.builtAt, dataVersion: r.dataVersion };
    }
    catch (e) {
        var msg = String(e && (e.userMessage || e.message) || e).slice(0, 300), fails = rmStatus_(mf).failures + 1;
        if (e && (e.stale || e.code === 'SERVER_BUSY'))
            return { rebuilt: [], failed: [msg], stale: true };
        if (quiet)
            return { rebuilt: [], failed: [msg] };
        rmRecordStatus_({ failures: fails, lastError: msg, lastAttemptAt: nowIso_() });
        if (fails >= 3)
            rmAlertOnce_('Bảng tổng hợp dựng lỗi ' + fails + ' lần liên tiếp', 'Lỗi gần nhất: ' + msg + '. Các màn tổng hợp đang tính trực tiếp (chậm hơn). Kiểm tra nhật ký thực thi bộ kích hoạt recoverTrigger.');
        return { rebuilt: [], failed: [msg] };
    }
}
// Sau khi đổi cơ sở dữ liệu (khôi phục/quay lại): bỏ mọi bản dựng sẵn để không hiện số của dữ liệu cũ; bộ kích hoạt hoặc lần xem kế tiếp dựng lại.
function rmInvalidate_() {
    try {
        props_().setProperty('RM_GEN', 'inv-' + nowIso_());
        resetMemo_();
        repoReadAll_('ReadModel').forEach(function (r) { if (r.isDeleted !== 1)
            repoWriteRow_('ReadModel', r._row, Object.assign({}, r, { json: '', parts: 0, isDeleted: 1 })); });
        resetMemo_();
    }
    catch (e) {
        console.warn('rmInvalidate_ ' + e);
    }
}
function rmRebuildAll_() { return rmRefreshIfNeeded_(true); }
// Hàm công khai (không có dấu gạch dưới) để chạy từ trình soạn thảo Apps Script sau khi triển khai.
function rebuildSummaries() {
    var r = rmRebuildAll_();
    Logger.log('Đã dựng: ' + r.rebuilt.join(', ') + (r.failed.length ? ' · LỖI: ' + r.failed.join('; ') : ''));
    return r;
}
// Đọc cho người dùng: dùng bản dựng sẵn nếu còn mới (cùng ngày, chưa quá tuổi); nếu không (hoặc yêu cầu tính lại ngay) thì dựng lại cả bộ để mọi người cùng thấy số mới;
// không dựng được (đang bận/lỗi) thì tính trực tiếp riêng mô hình này mà không công bố.
function rmServe_(model, live) {
    var today = todayVn_(), snap = live ? null : rmLoad_(model);
    if (snap && rmFresh_(snap, today))
        return { value: snap.value, source: 'SNAPSHOT', builtAt: snap.builtAt, dataVersion: snap.dataVersion, asOf: snap.asOf, status: rmStatus_(rmManifest_()) };
    var mf0 = rmManifest_();
    if (!live && mf0 && mf0.dataVersion !== dataVersion_() && (Date.now() - new Date(mf0.builtAt).getTime()) > 3 * rmMaxAgeMin_() * 60000)
        rmAlertOnce_('Bảng tổng hợp lâu không được cập nhật', 'Bản dựng lúc ' + mf0.builtAt + ' đã cũ hơn ' + 3 * rmMaxAgeMin_() + ' phút trong khi dữ liệu đã thay đổi. Kiểm tra bộ kích hoạt recoverTrigger (installTriggers).');
    // Chỉ nút "Tính lại ngay" (live) hoặc lần đầu chưa có bộ nào mới dựng cả bộ; còn lại tính riêng mô hình cần xem, không công bố (bộ kích hoạt lo việc dựng nền).
    var rf = live || !mf0 ? rmRefreshIfNeeded_(true, true) : { failed: ['skip'] };
    if (!rf.failed.length) {
        resetMemo_();
        MEMO_.cacheOk = true;
        var s2 = rmLoad_(model);
        if (s2)
            return { value: s2.value, source: 'LIVE', builtAt: s2.builtAt, dataVersion: s2.dataVersion, asOf: s2.asOf, status: rmStatus_(rmManifest_()) };
    }
    var v = beginReadSnapshot_(), value = rmBuild_(model, today);
    assertReadSnapshot_(v);
    return { value: value, source: 'LIVE', builtAt: nowIso_(), dataVersion: v, asOf: today, status: rmStatus_(rmManifest_()) };
}
// ---- Đối soát hằng đêm: bảng tổng hợp so với sổ gốc + kiểm tra toàn vẹn sổ công nợ (chỉ ĐỌC, không sửa dữ liệu) ----
function reconSample_(arr) { return arr.slice(0, 8); }
function reconChecks_() {
    var today = todayVn_(), checks = [];
    function add(code, title, level, items, note) { checks.push({ code: code, title: title, status: items.length ? level : 'OK', count: items.length, samples: reconSample_(items), note: note || '' }); }
    var docs = repoValid_('DebtDoc'), lines = repoValid_('DebtLine'), allocs = repoValid_('Allocation'), pays = repoValid_('Payment'), accs = repoValid_('Accrual'), pm = partnerMap_();
    var docById = byId_(docs), lineById = byId_(lines), payById = byId_(pays), lineSum = {};
    lines.forEach(function (l) { lineSum[l.docId] = (lineSum[l.docId] || 0) + (l.grossMinor || 0); });
    // 1. Tổng dòng = tổng chứng từ
    var bad1 = [];
    docs.forEach(function (d) { if (COUNTED_DOC_STATUS_[d.status] && (lineSum[d.id] || 0) !== (d.totalGrossMinor || 0))
        bad1.push(d.docNo + ' (' + d.currency + '): dòng ' + (lineSum[d.id] || 0) + ' ≠ tổng ' + (d.totalGrossMinor || 0)); });
    add('DOC_LINES_SUM', 'Tổng các dòng bằng tổng chứng từ', 'FAIL', bad1);
    // 2. Bản ghi mồ côi
    var orph = [];
    lines.forEach(function (l) { if (!docById[l.docId])
        orph.push('Dòng ' + l.id + ' → chứng từ ' + l.docId + ' không tồn tại'); });
    allocs.forEach(function (a) {
        if (!lineById[a.debtLineId])
            orph.push('Phân bổ ' + a.id + ' → dòng ' + a.debtLineId + ' không tồn tại');
        else if (a.docId && lineById[a.debtLineId].docId !== a.docId)
            orph.push('Phân bổ ' + a.id + ' lệch chứng từ so với dòng');
        if (a.paymentId && !payById[a.paymentId])
            orph.push('Phân bổ ' + a.id + ' → phiếu ' + a.paymentId + ' không tồn tại');
    });
    accs.forEach(function (a) {
        if (a.status === 'INVOICED' && (!a.docId || !docById[a.docId]))
            orph.push('Phát sinh ' + a.id + ' đã lập hóa đơn nhưng chứng từ ' + (a.docId || '(trống)') + ' không còn');
    });
    docs.forEach(function (d) { if (COUNTED_DOC_STATUS_[d.status] && !pm[d.partnerId])
        orph.push('Chứng từ ' + d.docNo + ' → đối tác ' + d.partnerId + ' không tồn tại'); });
    add('ORPHANS', 'Không có bản ghi mồ côi', 'FAIL', orph);
    // 3. Phân bổ vượt phiếu thu/chi; khác loại tiền
    var over = [], paySum = {}, cur = [];
    allocs.forEach(function (a) {
        if (a.paymentId)
            paySum[a.paymentId] = (paySum[a.paymentId] || 0) + (a.amountMinor || 0);
        var l = lineById[a.debtLineId], p = payById[a.paymentId], d = l && docById[l.docId];
        if (p && d && p.currency !== d.currency)
            cur.push('Phân bổ ' + a.id + ': phiếu ' + p.currency + ' ↔ chứng từ ' + d.currency);
    });
    pays.forEach(function (p) { if ((p.status === 'POSTED' || p.status === 'REVERSED') && (paySum[p.id] || 0) > (p.amountMinor || 0))
        over.push(p.payNo + ': phân bổ ' + paySum[p.id] + ' > số tiền ' + p.amountMinor); });
    add('PAY_OVERALLOC', 'Phân bổ không vượt số tiền phiếu thu/chi', 'FAIL', over);
    add('ALLOC_CURRENCY', 'Phân bổ cùng loại tiền với chứng từ', 'FAIL', cur);
    // 4. Phát sinh đã đóng đơn nhưng còn dở dang
    var ordById = byId_(repoValid_('Order')), stuck = [];
    accs.forEach(function (a) { var o = ordById[a.orderId]; if (o && o.status === 'CLOSED' && (a.status === 'OPEN' || a.status === 'INVOICING') && !a.isPassThrough)
        stuck.push('Đơn ' + o.orderNo + ': phát sinh ' + a.id + ' (' + a.status + ')'); });
    add('CLOSED_WITH_OPEN', 'Đơn đã đóng không còn phát sinh chưa lập hóa đơn', 'WARN', stuck);
    // 5. Tổng độc lập từ dữ liệu gốc so với bảng tổng hợp đang công bố (theo hướng/loại tiền)
    var mf = rmManifest_(), tot = {}, note = '';
    docs.forEach(function (d) {
        if (!COUNTED_DOC_STATUS_[d.status] || docEffDate_(d) > today)
            return;
        var k = d.direction + '|' + d.currency;
        tot[k] = tot[k] || 0;
    });
    lines.forEach(function (l) { var d = docById[l.docId]; if (d && COUNTED_DOC_STATUS_[d.status] && docEffDate_(d) <= today)
        tot[d.direction + '|' + d.currency] += l.grossMinor || 0; });
    allocs.forEach(function (a) {
        if (a.effectiveDate > today)
            return;
        var l = lineById[a.debtLineId], d = l && docById[l.docId];
        if (d && COUNTED_DOC_STATUS_[d.status] && docEffDate_(d) <= today && !l.adjustsLineId)
            tot[d.direction + '|' + d.currency] -= a.amountMinor || 0;
    });
    var diffs = [];
    if (!mf || mf.dataVersion !== dataVersion_() || mf.asOf !== today)
        note = 'Bảng tổng hợp chưa theo kịp dữ liệu hiện tại — bỏ qua so sánh số tổng (sẽ so lần sau).';
    else {
        var snap = rmLoad_('PARTNERS'), s = {};
        if (snap) {
            snap.value.forEach(function (r) { if (r.adv)
                return; var k = r.dir + '|' + r.c; s[k] = (s[k] || 0) + r.out - r.credit; });
            var keys = {};
            Object.keys(tot).concat(Object.keys(s)).forEach(function (k) { keys[k] = 1; });
            Object.keys(keys).forEach(function (k) { if ((tot[k] || 0) !== (s[k] || 0))
                diffs.push(k.replace('|', ' ') + ': sổ gốc ' + (tot[k] || 0) + ' ≠ bảng tổng hợp ' + (s[k] || 0)); });
        }
        else
            note = 'Không đọc được bản dựng PARTNERS.';
    }
    add('SUMMARY_TOTALS', 'Tổng công nợ bảng tổng hợp khớp sổ gốc (từng chiều, từng loại tiền)', 'FAIL', diffs, note);
    // 6. Bảng tổng hợp = tính trực tiếp (cùng phiên bản dữ liệu)
    var mism = [];
    if (mf && mf.dataVersion === dataVersion_() && mf.asOf === today) {
        ['PARTNERS', 'ORDERS', 'COSTS'].forEach(function (m) {
            var s2 = rmLoad_(m);
            if (!s2)
                return mism.push(m + ': không đọc được bản dựng');
            if (JSON.stringify(s2.value) !== JSON.stringify(rmBuild_(m, today)))
                mism.push(m + ': khác kết quả tính trực tiếp');
        });
    }
    add('SUMMARY_VS_LIVE', 'Bảng tổng hợp giống kết quả tính trực tiếp', 'FAIL', mism, mf && mf.dataVersion === dataVersion_() ? '' : 'Bỏ qua: bản dựng chưa theo kịp dữ liệu.');
    // 6b. PO đã lưu trữ nhưng còn nghĩa vụ/dữ liệu chưa hoàn tất
    var arch = [];
    repoValid_('Order').forEach(function (o) {
        if (!o.archivedAt)
            return;
        var an = orderArchiveAnalysis_(o);
        an.blockers.forEach(function (b) { arch.push('Đơn ' + o.orderNo + ' (lưu trữ ' + String(o.archivedAt).slice(0, 10) + '): ' + b.message + (b.items.length ? ' ' + b.items.slice(0, 2).join('; ') : '')); });
    });
    add('ARCHIVED_OBLIGATIONS', 'PO đã lưu trữ không còn nghĩa vụ hay dữ liệu chưa hoàn tất', 'FAIL', arch, 'Nếu đúng là có phát sinh sau lưu trữ: mở lại lưu trữ đơn (kèm lý do) để theo dõi tiếp.');
    // 7. Giao dịch dở dang
    var open = Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {}));
    add('OPEN_TX', 'Không có giao dịch ghi dở dang', 'WARN', open.map(function (t) { return t; }));
    return checks;
}
function reconRun_(opts) {
    opts = opts || {};
    var checks = reconChecks_(), fail = checks.filter(function (c) { return c.status === 'FAIL'; }).length, warn = checks.filter(function (c) { return c.status === 'WARN'; }).length;
    var res = { runAt: nowIso_(), dataVersion: dataVersion_(), asOf: todayVn_(), status: fail ? 'FAIL' : warn ? 'WARN' : 'OK', failCount: fail, warnCount: warn, checks: checks, by: opts.by || 'trigger' };
    rmStore_('RECON', res, { dataVersion: res.dataVersion, builtAt: res.runAt, asOf: res.asOf });
    if (fail && !opts.noAlert)
        alertAdmin_('Đối soát công nợ phát hiện ' + fail + ' mục LỖI', checks.filter(function (c) { return c.status === 'FAIL'; }).map(function (c) { return '• ' + c.title + ' (' + c.count + '): ' + c.samples.slice(0, 3).join(' | '); }).join('\n') + '\nXem màn "Tổng hợp công nợ" → tab Đối soát.');
    return res;
}
function reconcileTrigger() {
    try {
        resetMemo_();
        MEMO_.cacheOk = true;
        cachePrefetch_();
        reconRun_({ by: 'trigger' });
    }
    catch (e) {
        alertAdmin_('Đối soát hằng đêm không chạy được', String(e && e.message || e));
    }
}
function summaryReconcile_(user, req) {
    requirePerm_(user, 'audit.read');
    var p = req.payload || {};
    if (p.run) {
        resetMemo_();
        MEMO_.cacheOk = true;
        return reconRun_({ by: user.email, noAlert: true });
    }
    var r = rmReadKey_('RECON');
    return r ? r.value : { status: 'NEVER', checks: [], runAt: '' };
}
function rmMeta_(r) { return { source: r.source, builtAt: r.builtAt, asOf: r.asOf, dataVersion: r.dataVersion, currentDataVersion: dataVersion_(), behind: Math.max(0, dataVersion_() - r.dataVersion), maxAgeMin: rmMaxAgeMin_(), setId: r.builtAt, status: r.status || { failures: 0, lastError: '', lastOkAt: '' } }; }
function summaryPartners_(user, req) {
    requirePerm_(user, 'read');
    var r = rmServe_('PARTNERS', !!(req.payload && req.payload.live)), pm = partnerMap_(), by = {}, bookReady = true;
    r.value.forEach(function (x) {
        var p = pm[x.p];
        if (!inScope_(user, p, x.g))
            return;
        var o = by[x.p] = by[x.p] || { partnerId: x.p, name: partnerName_(pm, x.p), isCustomer: p ? p.isCustomer : 0, isSupplier: p ? p.isSupplier : 0, AR: {}, AP: {}, adv: { AR: {}, AP: {} }, base: { AR: { out: 0, overdue: 0, due7: 0, missing: 0, adv: 0, net: 0, miss: 0 }, AP: { out: 0, overdue: 0, due7: 0, missing: 0, adv: 0, net: 0, miss: 0 } } };
        if (x.adv) {
            o.adv[x.dir][x.c] = (o.adv[x.dir][x.c] || 0) + x.amt;
            if (x.amtB === undefined)
                bookReady = false;
            o.base[x.dir].adv += x.amtB || 0;
            o.base[x.dir].miss += x.baseMiss || 0;
            return;
        }
        if (x.outB === undefined)
            bookReady = false;
        var bs = o.base[x.dir];
        bs.out += x.outB || 0;
        bs.overdue += x.overdueB || 0;
        bs.due7 += x.due7B || 0;
        bs.missing += x.missingB || 0;
        bs.miss += x.baseMiss || 0;
        var c = o[x.dir][x.c] = o[x.dir][x.c] || { out: 0, credit: 0, overdue: 0, due7: 0, missing: 0, maxDays: 0, docs: 0, oldest: '' };
        c.out += x.out;
        c.credit += x.credit;
        c.overdue += x.overdue;
        c.due7 += x.due7;
        c.missing += x.missing;
        c.maxDays = Math.max(c.maxDays, x.maxDays);
        c.docs += x.docs;
        if (x.oldest && (!c.oldest || x.oldest < c.oldest))
            c.oldest = x.oldest;
    });
    var items = Object.keys(by).map(function (k) { return by[k]; }), totals = { AR: {}, AP: {} };
    items.sort(function (a, b) { return cmpStr_(a.name, b.name); });
    // Còn nợ ròng theo đối tác = còn nợ theo chứng từ − tiền chưa phân bổ (ứng trước) cùng chiều/tiền tệ; âm = đối tác đang dư ứng trước.
    items.forEach(function (o) { o.net = { AR: {}, AP: {} }; ['AR', 'AP'].forEach(function (dir) { var cs = {}; Object.keys(o[dir]).forEach(function (c) { cs[c] = 1; }); Object.keys(o.adv[dir]).forEach(function (c) { cs[c] = 1; }); Object.keys(cs).forEach(function (c) { var n = (o[dir][c] ? o[dir][c].out : 0) - (o.adv[dir][c] || 0); if (n)
        o.net[dir][c] = n; }); }); });
    items.forEach(function (o) { ['AR', 'AP'].forEach(function (dir) { Object.keys(o[dir]).forEach(function (c) { var t = totals[dir][c] = totals[dir][c] || { out: 0, overdue: 0, due7: 0, missing: 0 }, x = o[dir][c]; t.out += x.out; t.overdue += x.overdue; t.due7 += x.due7; t.missing += x.missing; }); }); });
    // Quy đổi VND theo giá trị ghi sổ (R36): bảng dựng bởi bản cũ chưa có số quy đổi → bookReady=false (giao diện nhắc "Làm mới"). Ròng = còn nợ − tiền chưa phân bổ.
    var book = { AR: { out: 0, overdue: 0, due7: 0, missing: 0, adv: 0, net: 0, miss: 0 }, AP: { out: 0, overdue: 0, due7: 0, missing: 0, adv: 0, net: 0, miss: 0 }, net: 0 };
    items.forEach(function (o) { ['AR', 'AP'].forEach(function (dir) { var b = o.base[dir]; b.net = b.out - b.adv; Object.keys(b).forEach(function (k) { book[dir][k] += b[k]; }); }); });
    book.net = book.AR.net - book.AP.net;
    return { meta: rmMeta_(r), items: items, totals: totals, book: book, bookReady: bookReady };
}
function summaryOrders_(user, req) {
    requirePerm_(user, 'read');
    var r = rmServe_('ORDERS', !!(req.payload && req.payload.live)), pm = partnerMap_();
    var items = r.value.filter(function (x) { return inScope_(user, pm[x.cp], x.g); }).map(function (x) { return Object.assign({}, x, { customer: partnerName_(pm, x.cp) }); }), totals = {};
    items.forEach(function (x) { Object.keys(x.cur).forEach(function (c) { var t = totals[c] = totals[c] || { rev: 0, un: 0, ing: 0, ar: 0, ap: 0, cost: 0, unc: 0 }, y = x.cur[c]; t.rev += y.rev; t.un += y.un; t.ing += y.ing; t.ar += y.ar; t.ap += y.ap || 0; t.cost += y.cost; t.unc += y.unc; }); });
    return { meta: rmMeta_(r), items: items, totals: totals };
}
function summaryCosts_(user, req) {
    requirePerm_(user, 'read');
    var r = rmServe_('COSTS', !!(req.payload && req.payload.live)), pm = partnerMap_();
    var items = r.value.filter(function (x) { return x.sc.every(function (k) { return inScope_(user, pm[k[0]], k[1]); }); }).map(function (x) { return Object.assign({}, x, { supplier: partnerName_(pm, x.p) }); }), totals = {};
    items.forEach(function (x) { var t = totals[x.c] = totals[x.c] || { out: 0, unbilled: 0, billed: 0 }; t.out += x.out; if (x.st === 'INVOICED') t.billed += x.out; else t.unbilled += x.out; });
    return { meta: rmMeta_(r), items: items, totals: totals };
}
// ---- Bản nháp nhập liệu (file DRAFT/XEM NHANH, nhóm A) ----
// Không đi qua runTx_, không tăng phiên bản dữ liệu, không ghi nhật ký (chưa phải nghiệp vụ). Chỉ chủ bản nháp đọc/sửa/xóa. "Làm mới" bảng tổng hợp không đụng bảng này.
var DRAFT_KINDS_ = { DOC: 'DebtDoc', PAYMENT: 'Payment', ORDER: 'Order', ACCRUAL: 'Accrual' };
var DRAFT_PERM_ = { DOC: 'doc.write', PAYMENT: 'payment.write', ORDER: 'order.write', ACCRUAL: 'order.write' };
var DRAFT_CLEAR_ACTIONS_ = { 'doc.save': 1, 'payment.save': 1, 'order.save': 1, 'accrual.save': 1 };
var DRAFT_MAX_ = 45000, DRAFT_KEEP_DAYS_ = 30, DRAFT_WARN_DAYS_ = 7;
function draftOwn_(user, id) {
    var r = repoReadAll_('DraftEntry').filter(function (x) { return x.id === id; })[0];
    return r && r.ownerId === user.id ? r : null;
}
// Bản nháp tự xóa sau DRAFT_KEEP_DAYS_ ngày kể từ lần lưu cuối (chính sách hiện hữu). daysLeft/expiring giúp người dùng thấy hạn và xuất/giữ nội dung trước khi hết hạn.
function draftDaysLeft_(r) {
    var t = r.updatedAt ? new Date(r.updatedAt).getTime() : NaN;
    return isNaN(t) ? null : Math.max(0, Math.ceil((t + DRAFT_KEEP_DAYS_ * 86400000 - Date.now()) / 86400000));
}
function draftOut_(r, withData) {
    var t = r.targetId && DRAFT_KINDS_[r.kind] ? repoFind_(DRAFT_KINDS_[r.kind], r.targetId) : null, o = { id: r.id, kind: r.kind, targetId: r.targetId, slot: r.slot, baseVersion: r.baseVersion, title: r.title, updatedAt: r.updatedAt, version: r.version, stale: !!(r.targetId && t && t.version > r.baseVersion), targetGone: !!(r.targetId && !t), daysLeft: draftDaysLeft_(r), expiring: draftDaysLeft_(r) !== null && draftDaysLeft_(r) <= DRAFT_WARN_DAYS_ };
    if (withData)
        o.data = safeJson_(r.dataJson, null);
    return o;
}
function draftSave_(user, req) {
    var p = req.payload || {};
    if (!DRAFT_KINDS_[p.kind])
        throw err_('VALIDATION_FAILED', 'Loại bản nháp không hợp lệ.');
    requirePerm_(user, DRAFT_PERM_[p.kind]);
    var id = p.id ? String(p.id) : uid_('drf');
    if (!/^drf_[A-Za-z0-9]{8,40}$/.test(id))
        throw err_('VALIDATION_FAILED', 'Mã bản nháp không hợp lệ.');
    var json = JSON.stringify(p.data === undefined ? null : p.data);
    if (json.length > DRAFT_MAX_)
        throw err_('VALIDATION_FAILED', 'Bản nháp quá lớn (' + json.length + ' ký tự); hãy lưu chứng từ thay vì lưu nháp.');
    var target = p.targetId ? String(p.targetId) : '';
    if (target) {
        var t = repoFind_(DRAFT_KINDS_[p.kind], target);
        if (!t)
            throw err_('NOT_FOUND', 'Bản ghi gốc của bản nháp không còn.');
        assertVisible_(user, partnerMap_()[t.partnerId || t.customerPartnerId], t.businessGroupCode || '', '', 'Bản ghi gốc của bản nháp không còn.');
    }
    return withLock_(8000, function () {
        resetMemo_();
        var ex = repoReadAll_('DraftEntry').filter(function (x) { return x.id === id; })[0], now = nowIso_();
        if (ex && ex.ownerId !== user.id)
            throw err_('FORBIDDEN', 'Bản nháp thuộc người khác.');
        if (ex && ex.isDeleted === 1)
            return { id: id, discarded: true };
        // Gửi lại đúng nội dung đã lưu (mất phản hồi lần trước) → coi là thành công, không báo xung đột.
        if (ex && p.ifVersion !== undefined && Number(p.ifVersion) !== ex.version && ex.kind === p.kind && ex.targetId === target && ex.dataJson === json)
            return { id: id, version: ex.version, updatedAt: ex.updatedAt, replay: true };
        if (ex && p.ifVersion !== undefined && Number(p.ifVersion) !== ex.version)
            throw err_('VERSION_CONFLICT', 'Bản nháp đã thay đổi ở phiên khác. Hãy tải lại hoặc lưu thành bản nháp mới.');
        var row = { id: id, kind: p.kind, ownerId: user.id, targetId: target, slot: maxStr_(p.slot, 80), baseVersion: Number(p.baseVersion) || 0, title: maxStr_(p.title, 200), dataJson: json, version: ex ? ex.version + 1 : 1, isDeleted: 0, commitState: 'C', txId: '', createdAt: ex ? ex.createdAt : now, createdBy: ex ? ex.createdBy : user.id, updatedAt: now, updatedBy: user.id };
        if (ex)
            repoWriteRow_('DraftEntry', ex._row, row);
        else
            repoAppend_('DraftEntry', [row]);
        return { id: id, version: row.version, updatedAt: now };
    });
}
function draftList_(user, req) {
    var p = req.payload || {};
    var items = repoValid_('DraftEntry').filter(function (r) { return r.ownerId === user.id && (!p.kind || r.kind === p.kind) && (p.targetId === undefined || r.targetId === (p.targetId || '')) && (p.slot === undefined || r.slot === (p.slot || '')); })
        .sort(function (a, b) { return cmpStr_(b.updatedAt, a.updatedAt); });
    var out = items.slice(0, 100).map(function (r) { return draftOut_(r, false); });
    return { items: out, retentionDays: DRAFT_KEEP_DAYS_, warnDays: DRAFT_WARN_DAYS_, expiringCount: items.filter(function (r) { var d = draftDaysLeft_(r); return d !== null && d <= DRAFT_WARN_DAYS_; }).length };
}
function draftGet_(user, req) {
    var r = draftOwn_(user, String(req.payload.id || ''));
    if (!r || r.isDeleted === 1)
        throw err_('NOT_FOUND', 'Không tìm thấy bản nháp.');
    return draftOut_(r, true);
}
function draftDiscard_(user, req) {
    return withLock_(8000, function () {
        resetMemo_();
        var r = draftOwn_(user, String(req.payload.id || ''));
        if (!r)
            throw err_('NOT_FOUND', 'Không tìm thấy bản nháp.');
        if (req.payload.ifVersion !== undefined && Number(req.payload.ifVersion) !== r.version)
            throw err_('VERSION_CONFLICT', 'Bản nháp đã thay đổi; chưa xóa.');
        if (r.isDeleted !== 1)
            repoWriteRow_('DraftEntry', r._row, Object.assign({}, r, { dataJson: '', isDeleted: 1, updatedAt: nowIso_() }));
        return { id: r.id, discarded: true };
    });
}
// Dọn bản nháp sau khi lưu vào CHÍNH thành công; lỗi ở đây không làm hỏng thao tác chính (nháp thừa sẽ bị dọn theo hạn).
function draftClearQuiet_(user, id, version, action, targetId) {
    try {
        return withLock_(8000, function () {
            resetMemo_();
            var d = draftOwn_(user, String(id));
            if (!d || d.isDeleted === 1)
                return { cleared: true };
            var kind = { 'doc.save': 'DOC', 'payment.save': 'PAYMENT', 'order.save': 'ORDER', 'accrual.save': 'ACCRUAL' }[action];
            if (version === undefined || Number(version) !== d.version || (kind && d.kind !== kind) || (d.targetId && d.targetId !== targetId))
                return { cleared: false };
            repoWriteRow_('DraftEntry', d._row, Object.assign({}, d, { dataJson: '', isDeleted: 1, updatedAt: nowIso_() }));
            return { cleared: true };
        });
    }
    catch (e) {
        console.warn('draftClear ' + e);
        return { cleared: false };
    }
}
function draftPurge_(days) {
    var cut = new Date(Date.now() - (days || DRAFT_KEEP_DAYS_) * 86400000).toISOString(), n = 0;
    withLock_(15000, function () {
        resetMemo_();
        repoReadAll_('DraftEntry').forEach(function (r) { if (r.isDeleted !== 1 && r.updatedAt < cut) {
            repoWriteRow_('DraftEntry', r._row, Object.assign({}, r, { dataJson: '', isDeleted: 1 }));
            n++;
        } });
    });
    return n;
}
// ---- Hàng chờ duyệt: gom mọi thứ đang chờ người dùng này (duyệt hoặc ghi nhận) ở một chỗ ----
function approvalList_(user, req) {
    requirePerm_(user, 'read');
    var p = req.payload || {}, pm = partnerMap_(), users = byId_(repoValid_('AppUser')), items = [], waitingOthers = 0, today = todayVn_();
    function who(id) { var u = users[id]; return u ? (u.displayName || u.email) : ''; }
    function days(iso) { var t = iso ? String(iso).slice(0, 10) : today; return Math.max(0, daysBetween_(t, today)); }
    function add(kind, step, x, no, amt, date, partnerId, dir, canAct, why) {
        if (!canAct) {
            waitingOthers++;
            if (!p.includeBlocked)
                return;
        }
        items.push({ kind: kind, step: step, id: x.id, no: no || '(nháp)', partnerName: partnerName_(pm, partnerId), direction: dir, currency: x.currency, amountMinor: amt, date: date, submittedBy: who(x.submittedBy || x.createdBy), waitDays: days(x.updatedAt), canAct: canAct, why: why || '', version: x.version });
    }
    if (can_(user, 'doc.approve') || can_(user, 'doc.post'))
        repoValid_('DebtDoc').forEach(function (d) {
            if ((d.status !== 'SUBMITTED' && d.status !== 'APPROVED') || !inScope_(user, pm[d.partnerId], d.businessGroupCode))
                return;
            if (d.status === 'SUBMITTED' && can_(user, 'doc.approve')) {
                var own = d.createdBy === user.id || d.submittedBy === user.id;
                add('DOC', 'APPROVE', d, d.docNo, d.totalGrossMinor, d.docDate, d.partnerId, d.direction, !own, own ? 'Bạn là người lập/gửi — cần người khác duyệt.' : '');
            }
            else if (d.status === 'APPROVED' && can_(user, 'doc.post'))
                add('DOC', 'POST', d, d.docNo, d.totalGrossMinor, d.docDate, d.partnerId, d.direction, true, '');
        });
    if (can_(user, 'payment.approve'))
        repoValid_('Payment').forEach(function (x) {
            if ((x.status !== 'SUBMITTED' && x.status !== 'APPROVED') || !inScope_(user, pm[x.partnerId], ''))
                return;
            if (x.status === 'SUBMITTED') {
                var own = x.createdBy === user.id || x.submittedBy === user.id;
                add('PAYMENT', 'APPROVE', x, x.payNo, x.amountMinor, x.effectiveDate, x.partnerId, x.direction === 'IN' ? 'AR' : 'AP', !own, own ? 'Bạn là người lập/gửi — cần người khác duyệt.' : '');
            }
            else
                add('PAYMENT', 'POST', x, x.payNo, x.amountMinor, x.effectiveDate, x.partnerId, x.direction === 'IN' ? 'AR' : 'AP', true, '');
        });
    if (can_(user, 'opening.approve'))
        repoValid_('ImportBatch').forEach(function (b) { if (b.status === 'SUBMITTED' && b.mode === 'OPENING') {
            items.push({ kind: 'OPENING', step: 'APPROVE', id: b.id, no: b.fileName || 'Số dư đầu kỳ', partnerName: '', direction: '', currency: '', amountMinor: 0, date: String(b.committedAt || '').slice(0, 10), submittedBy: '', waitDays: 0, canAct: true, why: '', version: b.version });
        } });
    items.sort(function (a, b) { return b.waitDays - a.waitDays || cmpStr_(a.no, b.no); });
    var counts = { total: items.filter(function (i) { return i.canAct; }).length, approve: items.filter(function (i) { return i.canAct && i.step === 'APPROVE'; }).length, post: items.filter(function (i) { return i.canAct && i.step === 'POST'; }).length, waitingOthers: waitingOthers };
    return { counts: counts, items: p.summaryOnly ? [] : items.slice(0, 200), truncated: items.length > 200 };
}
// ---- Trạng thái hệ thống cho quản trị: gom mọi tín hiệu sức khỏe một chỗ ----
function sysStatus_(user, req) {
    requirePerm_(user, 'sys.health');
    var p = req.payload || {}, now = Date.now(), mf = rmManifest_(), flags = [], alerts = repoValid_('SystemAlert').sort(function (a, b) { return cmpStr_(b.lastAt, a.lastAt); }), unacked = alerts.filter(function (a) { return !a.ackedAt; });
    var openTx = safeJson_(props_().getProperty('OPEN_TX'), {}), lease = safeJson_(props_().getProperty('RM_LEASE'), null), age = mf ? Math.round((now - new Date(mf.builtAt).getTime()) / 60000) : null, st = rmStatus_(mf);
    function F(level, code, text) { flags.push({ level: level, code: code, text: text }); }
    if (!mf)
        F('WARN', 'NO_SUMMARY', 'Chưa có bộ bảng tổng hợp dựng sẵn (chạy rebuildSummaries hoặc đợi bộ kích hoạt).');
    else if (mf.dataVersion !== dataVersion_() && age > 3 * rmMaxAgeMin_())
        F('WARN', 'SUMMARY_STALE', 'Bảng tổng hợp cũ ' + age + ' phút trong khi dữ liệu đã đổi — kiểm tra bộ kích hoạt recoverTrigger.');
    if (st.failures > 0)
        F(st.failures >= 3 ? 'FAIL' : 'WARN', 'BUILD_FAILED', 'Dựng bảng tổng hợp lỗi ' + st.failures + ' lần liên tiếp: ' + st.lastError);
    var recon = rmReadKey_('RECON');
    if (!recon)
        F('INFO', 'NO_RECON', 'Chưa có kết quả đối soát (chạy ở Tổng hợp công nợ → Đối soát, hoặc đợi 02:00).');
    else if (recon.value.status === 'FAIL')
        F('FAIL', 'RECON_FAIL', 'Đối soát lần ' + recon.value.runAt + ' có ' + recon.value.failCount + ' mục LỖI.');
    else if (now - new Date(recon.value.runAt).getTime() > 36 * 3600000)
        F('WARN', 'RECON_OLD', 'Đối soát lần gần nhất đã quá 36 giờ — bộ kích hoạt reconcileTrigger có chạy không?');
    Object.keys(openTx).forEach(function (k) { F('WARN', 'OPEN_TX', 'Giao dịch ghi chưa hoàn tất: ' + k + ' (' + openTx[k] + ')'); });
    if (lease && now - new Date(lease.at).getTime() > 600000)
        F('INFO', 'LEASE_OLD', 'Giấy phép dựng tồn tại quá 10 phút (sẽ tự hết hạn).');
    var b = repoValid_('BackupCatalog').sort(function (a, c) { return cmpStr_(c.createdAt, a.createdAt); })[0];
    if (!b)
        F('WARN', 'NO_BACKUP', 'Chưa có bản sao lưu nào.');
    else if (now - new Date(b.createdAt).getTime() > 48 * 3600000)
        F('WARN', 'BACKUP_OLD', 'Bản sao lưu gần nhất đã quá 48 giờ (' + b.createdAt.slice(0, 16) + ').');
    else if (b.verifyStatus === 'FAILED')
        F('FAIL', 'BACKUP_VERIFY', 'Bản sao lưu gần nhất xác minh THẤT BẠI.');
    var auditFails = Number(props_().getProperty('AUDIT_FAIL_COUNT') || 0);
    if (auditFails > 0)
        F('WARN', 'AUDIT_FAIL', 'Có ' + auditFails + ' lần ghi nhật ký thất bại.');
    if (!props_().getProperty('DB_DRAFT_ID'))
        F('INFO', 'NO_DRAFT_DB', 'Chưa tách file DRAFT/XEM NHANH (chạy setupDraftDb).');
    var trg = [];
    try {
        trg = ScriptApp.getProjectTriggers().map(function (t) { return t.getHandlerFunction(); });
        ['recoverTrigger', 'backupDailyTrigger', 'reconcileTrigger', 'archiveTrigger', 'overdueDigestTrigger'].forEach(function (h) { if (trg.indexOf(h) < 0)
            F('WARN', 'NO_TRIGGER', 'Thiếu bộ kích hoạt ' + h + ' (chạy installTriggers).'); });
    }
    catch (e) { }
    unacked.forEach(function (a) { F(a.level === 'FAIL' ? 'FAIL' : 'WARN', 'ALERT', a.subject + (a.count > 1 ? ' (×' + a.count + ')' : '')); });
    var worst = flags.some(function (f) { return f.level === 'FAIL'; }) ? 'FAIL' : flags.some(function (f) { return f.level === 'WARN'; }) ? 'WARN' : 'OK';
    var out = { status: worst, flagCount: flags.filter(function (f) { return f.level !== 'INFO'; }).length, unackedAlerts: unacked.length, serverTime: nowIso_() };
    if (p.summaryOnly)
        return out;
    return Object.assign(out, { flags: flags, alerts: alerts.slice(0, 30).map(function (a) { return { id: a.id, at: a.at, lastAt: a.lastAt, level: a.level, subject: a.subject, body: a.body, count: a.count, emailOk: a.emailOk, ackedBy: a.ackedBy, ackedAt: a.ackedAt }; }),
        build: mf ? { builtAt: mf.builtAt, ageMin: age, dataVersion: mf.dataVersion, currentDataVersion: dataVersion_(), models: mf.models, failures: st.failures, lastError: st.lastError, lastOkAt: st.lastOkAt } : null,
        recon: recon ? { status: recon.value.status, runAt: recon.value.runAt, failCount: recon.value.failCount, warnCount: recon.value.warnCount } : null,
        triggers: trg, openTx: Object.keys(openTx).length, schemaVersion: SCHEMA_VERSION, draftDb: !!props_().getProperty('DB_DRAFT_ID'),
        rows: { DebtDoc: repoRowCount_('DebtDoc'), DebtLine: repoRowCount_('DebtLine'), Allocation: repoRowCount_('Allocation'), Payment: repoRowCount_('Payment'), Accrual: repoRowCount_('Accrual'), SysTx: repoRowCount_('SysTx'), AuditLog: repoRowCount_('AuditLog'), DraftEntry: repoRowCount_('DraftEntry') },
        lastBackup: b ? { at: b.createdAt, verifyStatus: b.verifyStatus } : null });
}
function sysAlertAck_(user, req) {
    requirePerm_(user, 'sys.health');
    return withLock_(5000, function () {
        resetMemo_();
        var n = 0, ids = req.payload.id ? [String(req.payload.id)] : null;
        repoReadAll_('SystemAlert').forEach(function (r) { if (r.isDeleted !== 1 && !r.ackedAt && (!ids || ids.indexOf(r.id) >= 0)) {
            repoWriteRow_('SystemAlert', r._row, Object.assign({}, r, { ackedBy: user.email, ackedAt: nowIso_() }));
            n++;
        } });
        return { acked: n };
    });
}
// Đo thời gian THẬT trên Apps Script (chạy từ trình soạn thảo, chỉ ĐỌC): gửi kết quả trong Nhật ký thực thi cho người hỗ trợ để tối ưu theo số đo thật.
function measureSystem() {
    var out = { at: nowIso_(), schema: SCHEMA_VERSION, dataVersion: dataVersion_(), tables: {}, models: {}, steps: {} };
    function time(fn) { var t = Date.now(); try { fn(); } catch (e) { return { ms: Date.now() - t, error: String(e).slice(0, 120) }; } return { ms: Date.now() - t }; }
    resetMemoDirect_();
    ['DebtDoc', 'DebtLine', 'Allocation', 'Payment', 'Accrual', 'Order', 'Partner', 'ReadModel', 'DraftEntry', 'SysTx', 'AuditLog'].forEach(function (t) {
        resetMemoDirect_();
        var n = 0, r = time(function () { n = repoReadAll_(t).length; });
        out.tables[t] = { rows: n, readMs: r.ms };
    });
    resetMemoDirect_();
    var today = todayVn_();
    Object.keys(RM_MODELS_).forEach(function (m) { resetMemoDirect_(); out.models[m] = time(function () { rmBuild_(m, today); }); });
    out.steps.lockAcquireMs = time(function () { var l = LockService.getScriptLock(); l.waitLock(10000); l.releaseLock(); }).ms;
    out.steps.cachePutGetMs = time(function () { var c = CacheService.getScriptCache(); c.put('measure', 'x', 30); c.get('measure'); }).ms;
    resetMemoDirect_();
    out.steps.docListColdMs = time(function () { docList_({ id: 'm', email: 'm', role: 'APPROVER', scope: { allPartners: true } }, { payload: { pageSize: 25 } }); }).ms;
    out.steps.approvalListMs = time(function () { approvalList_({ id: 'm', email: 'm', role: 'APPROVER', scope: { allPartners: true } }, { payload: {} }); }).ms;
    var slow = [];
    Object.keys(out.models).forEach(function (m) { if (out.models[m].ms > 20000)
        slow.push(m); });
    out.advice = slow.length ? 'Mô hình dựng quá 20 giây: ' + slow.join(', ') + ' — cần tối ưu/gia tăng; hạn mức 1 lượt Apps Script là 6 phút.' : 'Các mô hình dựng dưới 20 giây.';
    Logger.log(JSON.stringify(out, null, 1));
    return out;
}
// Đo doc.list THEO TỪNG BƯỚC trên staging (chạy từ trình soạn thảo; chỉ ĐỌC, chỉ đổi generation cache): measureDocList(5) hoặc measureDocList(30, true) để so đọc chọn cột.
// Mỗi điều kiện chạy n lần; báo trung vị (p50) và, CHỈ KHI n ≥ 20, p95. Với n < 20 không có p95 có ý nghĩa. Kết quả ghi vào Nhật ký thực thi (JSON).
function measureDocList(n, slice) {
    n = Math.max(1, Math.min(Number(n) || 5, 60));
    var user = { id: 'm', email: 'm', role: 'APPROVER', scope: { allPartners: true } }, prevSlice = props_().getProperty('PERF_LIST_SLICE'), out = { at: nowIso_(), schema: SCHEMA_VERSION, dataVersion: dataVersion_(), n: n, slice: !!slice, p95Note: n >= 20 ? 'p95 tính từ ' + n + ' mẫu' : 'n < 20: không tính p95 (không đủ mẫu)', conditions: {} };
    function pct(a, p) { var b = a.slice().sort(function (x, y) { return x - y; }); return b[Math.min(b.length - 1, Math.max(0, Math.ceil(p * b.length) - 1))]; }
    function run(name, prep) {
        var rows = [];
        for (var i = 0; i < n; i++) {
            resetMemoDirect_();
            prep(i);
            statReset_();
            var t0 = Date.now(), r = docList_(user, { payload: { direction: 'AR', pageSize: 25, page: 1 } }), ms = Date.now() - t0;
            rows.push({ ms: ms, reads: STAT_.reads, cells: STAT_.cells, steps: Object.assign({}, STAT_.steps), total: r.total, bytes: JSON.stringify(r).length });
        }
        var ms2 = rows.map(function (x) { return x.ms; }), stepNames = {};
        rows.forEach(function (x) { Object.keys(x.steps).forEach(function (k) { stepNames[k] = 1; }); });
        var steps = {};
        Object.keys(stepNames).forEach(function (k) { var v = rows.map(function (x) { return x.steps[k] || 0; }); steps[k] = { p50: pct(v, 0.5), max: Math.max.apply(null, v) }; });
        out.conditions[name] = { reads: rows[rows.length - 1].reads, cells: rows[rows.length - 1].cells, total: rows[rows.length - 1].total, bytes: rows[rows.length - 1].bytes, msP50: pct(ms2, 0.5), msP95: n >= 20 ? pct(ms2, 0.95) : null, msMin: Math.min.apply(null, ms2), msMax: Math.max.apply(null, ms2), steps: steps };
    }
    try {
        props_().setProperty('PERF_LIST_SLICE', slice ? '1' : '0');
        run('coldNoCache', function () { MEMO_.cacheOk = false; });
        run('cacheEmpty', function () { Object.keys(CACHED_TABLES_).forEach(function (t) { bumpGen_(t); }); MEMO_.cacheOk = true; });
        run('warmTableCache', function (i) { MEMO_.cacheOk = true; if (i === 0)
            docList_(user, { payload: { direction: 'AR', pageSize: 25, page: 1 } }); resetMemoDirect_(); MEMO_.cacheOk = true; });
        run('afterWrite', function () { ['DebtDoc', 'DebtLine', 'Allocation'].forEach(function (t) { bumpGen_(t); }); MEMO_.cacheOk = true; });
    }
    finally {
        props_().setProperty('PERF_LIST_SLICE', prevSlice === null ? '0' : prevSlice);
    }
    Logger.log(JSON.stringify(out, null, 1));
    return out;
}
function summaryRefresh_(user, req) {
    requirePerm_(user, 'dashboard.read');
    var r = rmRefreshIfNeeded_(!!(req.payload && req.payload.force));
    return { rebuilt: r.rebuilt, failed: r.failed.length, builtAt: nowIso_() };
}
// Màn tổng quan/Bàn làm việc: dùng bản dựng sẵn cho người có phạm vi toàn bộ khi yêu cầu không kèm bộ lọc; còn lại tính trực tiếp.
function snapOrLive_(user, req, model, liveFn) {
    var p = req.payload || {}, today = todayVn_();
    var plain = Object.keys(p).every(function (k) { return k === 'asOf' || k === 'live'; }) && (!p.asOf || p.asOf === today);
    if (!plain || !fullScope_(user))
        return liveFn(user, req);
    var r = rmServe_(model, !!p.live);
    return Object.assign({}, r.value, { snapshot: rmMeta_(r) });
}
function workbenchSummary_(user, req) { requirePerm_(user, 'dashboard.read'); return snapOrLive_(user, req, 'WORKBENCH', workbenchSummaryLive_); }
function dashboardSummary_(user, req) { requirePerm_(user, 'dashboard.read'); return snapOrLive_(user, req, 'DASHBOARD', dashboardSummaryLive_); }
function dashboardUninvoiced_(user, req) { requirePerm_(user, 'dashboard.read'); return snapOrLive_(user, req, 'UNINVOICED', dashboardUninvoicedLive_); }
// Làm ấm cache bảng (gọi từ bộ kích hoạt 5 phút): người dùng ít khi gặp lần đọc nguội (đọc cả bảng từ Sheets).
function warmCache_() {
    resetMemo_();
    MEMO_.cacheOk = true;
    var v = beginReadSnapshot_();
    cachePrefetch_();
    Object.keys(CACHED_TABLES_).forEach(function (t) { repoReadAll_(t); });
    assertReadSnapshot_(v);
}
// Bộ nhớ đệm kết quả đọc: cùng người dùng + phạm vi + hành động + tham số + phiên bản dữ liệu + ngày → trả lại kết quả cũ, không đọc bảng.
// Mọi thao tác ghi tăng phiên bản dữ liệu nên khóa cũ tự vô hiệu; chỉ áp cho các hành động đọc thuần (không ghi nhật ký).
var RC_ACTIONS_ = { 'doc.list': 1, 'doc.get': 1, 'order.list': 1, 'order.options': 1, 'order.get': 1, 'payment.list': 1, 'payment.get': 1, 'dashboard.summary': 1, 'dashboard.uninvoiced': 1, 'workbench.summary': 1, 'approval.list': 1, 'alert.overview': 1, 'accrual.list': 1, 'report.run': 1, 'app.bootstrap': 1 };
var RC_TTL_ = 600, RC_MAX_ = 90000;
var RM_ACTIONS_ = { 'dashboard.summary': 1, 'dashboard.uninvoiced': 1, 'workbench.summary': 1, 'app.bootstrap': 1 };
function respKey_(user, action, payload, version) {
    return 'rc:' + sha256Hex_([props_().getProperty('DB_MAIN_ID') || '', props_().getProperty('DB_AUDIT_ID') || '', props_().getProperty('DB_DRAFT_ID') || '', SCHEMA_VERSION, user.id, user.role, JSON.stringify(user.scope || {}), action, JSON.stringify(payload === undefined ? {} : payload), version, todayVn_(), props_().getProperty('MAINTENANCE') || '', RM_ACTIONS_[action] ? (props_().getProperty('RM_GEN') || '') : ''].join('|')).slice(0, 48);
}
function cachedRead_(user, action, payload, version, run) {
    if (!RC_ACTIONS_[action] || !MEMO_.cacheOk || version === undefined || version === null)
        return run();
    var key = null;
    try {
        key = respKey_(user, action, payload, version);
        var hit = CacheService.getScriptCache().get(key);
        if (hit) {
            STAT_.rcHit = (STAT_.rcHit || 0) + 1;
            return JSON.parse(hit);
        }
    }
    catch (e) { }
    cachePrefetchRows_(action);
    var data = run();
    try {
        var j = JSON.stringify(data);
        if (key && j.length <= RC_MAX_)
            CacheService.getScriptCache().put(key, j, RC_TTL_);
    }
    catch (e) { }
    return data;
}
function recoverTrigger() { var l = LockService.getScriptLock(); if (!l.tryLock(5000))
    return; LOCKED_ = true; try {
    recoverStale_(0);
}
finally {
    LOCKED_ = false;
    l.releaseLock();
}
try {
    warmCache_();
}
catch (e) {
    console.warn('warmCache_ ' + e);
}
try {
    rmRefreshIfNeeded_(false);
}
catch (e) {
    console.warn('rmRefreshIfNeeded_ ' + e);
} }
function bumpDataVersion_() {
    var p = props_(), v = Number(p.getProperty('dataVersion') || 0) + 1;
    p.setProperty('dataVersion', String(v));
    return v;
}
function dataVersion_() { return Number(props_().getProperty('dataVersion') || 0); }
function writeAudit_(user, requestId, txId, list) {
    try {
        if (!list || !list.length)
            return;
        var at = nowIso_();
        var rows = list.map(function (a) {
            return { id: uid_('aud'), at: at, actorUserId: user.id, actorEmail: user.email, action: a.action, entityType: a.entityType,
                entityId: a.entityId, diffJson: JSON.stringify(a.diff || null), txId: txId, requestId: requestId, result: 'OK', reasonCode: '' };
        });
        withLock_(10000, function () { repoAppend_('AuditLog', rows); });
    }
    catch (e) {
        console.error('AUDIT_FAIL ' + e);
        try {
            props_().setProperty('AUDIT_FAIL_COUNT', String(Number(props_().getProperty('AUDIT_FAIL_COUNT') || 0) + 1));
            props_().setProperty('AUDIT_FAIL_LAST', nowIso_() + ' ' + maxStr_(String(e), 200));
            alertAdmin_('Ghi nhật ký kiểm toán thất bại', String(e));
        }
        catch (e2) { }
    }
}
function auditDeny_(email, action, code, message) {
    try {
        if (!SIG_OK_) {
            console.warn('DENY_UNSIGNED ' + code + ' ' + maxStr_(action, 40));
            return;
        }
        if (code === 'RATE_LIMITED') {
            var cc = CacheService.getScriptCache(), ck = 'rld:' + email + ':' + Math.floor(Date.now() / 60000);
            if (cc.get(ck))
                return;
            cc.put(ck, '1', 90);
        }
        var drow = [{ id: uid_('aud'), at: nowIso_(), actorUserId: '', actorEmail: email || '', action: action || '', entityType: '', entityId: '',
                diffJson: JSON.stringify({ message: maxStr_(message, 300) }), txId: '', requestId: '', result: 'DENIED', reasonCode: code }];
        withLock_(10000, function () { repoAppend_('AuditLog', drow); });
    }
    catch (e) {
        console.error('AUDIT_DENY_FAIL ' + e);
    }
}
function sha256Hex_(s) {
    return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
        .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}
var ROUTES_CACHE_ = null;
function routes_() {
    if (ROUTES_CACHE_)
        return ROUTES_CACHE_;
    return (ROUTES_CACHE_ = {
        'app.bootstrap': { fn: appBootstrap_ }, 'app.whoami': { fn: function (user) { return { email: user.email, role: user.role }; } }, 'tx.status': { fn: txStatus_ }, 'sys.health': { fn: sysHealth_ },
        'partner.list': { fn: partnerList_ }, 'partner.get': { fn: partnerGet_ }, 'partner.save': { fn: partnerSave_, write: true }, 'partner.bulkCommit': { fn: partnerBulkCommit_, write: true },
        'doc.list': { fn: docList_ }, 'doc.get': { fn: docGet_ }, 'doc.save': { fn: docSave_, write: true }, 'doc.submit': { fn: docSubmit_, write: true }, 'doc.approve': { fn: docApprove_, write: true },
        'doc.reject': { fn: docReject_, write: true }, 'doc.post': { fn: docPost_, write: true }, 'doc.delete': { fn: docDelete_, write: true }, 'doc.adjust': { fn: docAdjust_, write: true }, 'doc.reverse': { fn: docReverse_, write: true },
        'order.list': { fn: orderList_ }, 'order.options': { fn: orderOptions_ }, 'order.get': { fn: orderGet_ }, 'order.save': { fn: orderSave_, write: true }, 'order.setStatus': { fn: orderSetStatus_, write: true }, 'order.archiveCheck': { fn: orderArchiveCheck_ }, 'order.archive': { fn: orderArchive_, write: true }, 'order.unarchive': { fn: orderUnarchive_, write: true }, 'order.assignService': { fn: orderAssignService_, write: true },
        'accrual.save': { fn: accrualSave_, write: true }, 'accrual.cancel': { fn: accrualCancel_, write: true }, 'accrual.invoice': { fn: accrualInvoice_, write: true }, 'accrual.list': { fn: accrualList_ }, 'order.bulkPreview': { fn: orderBulkPreview_ }, 'order.bulkCommit': { fn: orderBulkCommit_, write: true }, 'doc.bulkPreview': { fn: docBulkPreview_ }, 'doc.bulkSuggest': { fn: docBulkSuggest_ }, 'doc.bulkCommit': { fn: docBulkCommit_, write: true },
        'passthrough.list': { fn: passList_ }, 'passthrough.candidates': { fn: passCandidates_ }, 'passthrough.links': { fn: passLinks_ }, 'passthrough.link': { fn: passLink_, write: true }, 'passthrough.unlink': { fn: passUnlink_, write: true }, 'passthrough.report': { fn: passReport_ },
        'transfer.list': { fn: xferList_ }, 'transfer.save': { fn: xferSave_, write: true }, 'transfer.post': { fn: xferPost_, write: true }, 'transfer.reverse': { fn: xferReverse_, write: true }, 'transfer.delete': { fn: xferDelete_, write: true },
        'exchange.list': { fn: exchList_ }, 'exchange.save': { fn: exchSave_, write: true }, 'exchange.post': { fn: exchPost_, write: true }, 'exchange.reverse': { fn: exchReverse_, write: true }, 'exchange.delete': { fn: exchDelete_, write: true }, 'cash.book': { fn: cashBook_ }, 'bank.reconView': { fn: bankReconView_ }, 'bank.reconCalc': { fn: bankReconCalc_ }, 'bank.reconSuggest': { fn: bankReconSuggest_ }, 'bank.reconSave': { fn: bankReconSave_, write: true }, 'bank.reconReopen': { fn: bankReconReopen_, write: true },
        'cashcount.preview': { fn: countPreview_ }, 'cashcount.list': { fn: countList_ }, 'cashcount.save': { fn: countSave_, write: true }, 'cashcount.adjust': { fn: countAdjust_, write: true }, 'cashcount.adjustReverse': { fn: countAdjustReverse_, write: true }, 'bank.reconOverview': { fn: bankReconOverview_ }, 'cashcount.confirm': { fn: countConfirm_, write: true }, 'cashcount.delete': { fn: countDelete_, write: true },
        'fx.poolReport': { fn: fxPoolReport_ }, 'fx.poolRecalc': { fn: fxPoolRecalc_, write: true }, 'fx.method.set': { fn: fxMethodSet_, write: true },
        'perf.get': { fn: perfGet_ }, 'perf.set': { fn: perfSet_, write: true },
        'fx.list': { fn: fxList_ }, 'fx.save': { fn: fxSave_, write: true }, 'fx.fetch': { fn: fxFetch_, write: true }, 'fx.backfill': { fn: fxBackfill_, write: true }, 'fx.grants.get': { fn: fxGrantsGet_ }, 'fx.grants.set': { fn: fxGrantsSet_, write: true }, 'fx.entryPreview': { fn: fxEntryPreview_ }, 'fx.entryList': { fn: fxEntryList_ }, 'fx.entryCreate': { fn: fxEntryCreate_, write: true }, 'fx.entryPost': { fn: fxEntryPost_, write: true }, 'fx.entryReverse': { fn: fxEntryReverse_, write: true }, 'payment.list': { fn: paymentList_ }, 'payment.get': { fn: paymentGet_ }, 'payment.save': { fn: paymentSave_, write: true }, 'payment.submit': { fn: paySubmit_, write: true },
        'payment.approve': { fn: payApprove_, write: true }, 'payment.reject': { fn: payReject_, write: true }, 'payment.post': { fn: payPost_, write: true }, 'payment.delete': { fn: payDelete_, write: true },
        'payment.reverse': { fn: payReverse_, write: true }, 'payment.openDocs': { fn: paymentOpenDocs_ }, 'payment.allocate': { fn: paymentAllocate_, write: true }, 'payment.reverseAllocation': { fn: paymentReverseAllocation_, write: true }, 'payment.suggest': { fn: paymentSuggest_ },
        'opening.get': { fn: openingGet_ }, 'opening.save': { fn: openingSave_, write: true }, 'opening.submit': { fn: openingSubmit_, write: true }, 'opening.reject': { fn: openingReject_, write: true }, 'opening.commit': { fn: openingCommit_, write: true },
        'import.bankPreview': { fn: importBankPreview_, write: true }, 'import.get': { fn: importGet_ }, 'import.list': { fn: importList_ }, 'import.rowDecide': { fn: importRowDecide_, write: true },
        'import.cancel': { fn: importCancel_, write: true }, 'import.bankCommit': { fn: importBankCommit_, write: true },
        'period.list': { fn: periodList_ }, 'period.check': { fn: periodCheck_ }, 'period.close': { fn: periodClose_, write: true }, 'period.reopenRequest': { fn: periodReopenRequest_, write: true }, 'period.reopenConfirm': { fn: periodReopenConfirm_, write: true },
        'dashboard.summary': { fn: dashboardSummary_ }, 'workbench.summary': { fn: workbenchSummary_ }, 'summary.partners': { fn: summaryPartners_ }, 'summary.orders': { fn: summaryOrders_ }, 'summary.costs': { fn: summaryCosts_ }, 'summary.refresh': { fn: summaryRefresh_ }, 'summary.reconcile': { fn: summaryReconcile_ }, 'approval.list': { fn: approvalList_ }, 'sys.status': { fn: sysStatus_ }, 'sys.alertAck': { fn: sysAlertAck_, draft: true }, 'draft.save': { fn: draftSave_, draft: true }, 'draft.list': { fn: draftList_, draft: true }, 'draft.get': { fn: draftGet_, draft: true }, 'draft.discard': { fn: draftDiscard_, draft: true }, 'dashboard.uninvoiced': { fn: dashboardUninvoiced_ }, 'recon.excel': { fn: reconExcel_ }, 'alert.overview': { fn: alertOverview_ }, 'followup.list': { fn: followupList_ }, 'followup.save': { fn: followupSave_, write: true }, 'followup.close': { fn: followupClose_, write: true },
        'reminder.preview': { fn: reminderPreview_ }, 'reminder.send': { fn: reminderSend_, write: true },
        'report.run': { fn: reportRun_ }, 'report.export': { fn: reportExport_ }, 'report.issue': { fn: reportIssue_, write: true }, 'report.snapshots': { fn: reportSnapshots_ }, 'report.snapshotExport': { fn: reportSnapshotExport_ },
        'backup.run': { fn: backupRun_, backup: true }, 'backup.list': { fn: backupList_, backup: true }, 'backup.verify': { fn: backupVerify_, backup: true }, 'backup.restorePrepare': { fn: backupRestorePrepare_, backup: true },
        'company.initStatus': { fn: companyInitStatus_, backup: true }, 'company.initRequest': { fn: companyInitRequest_, backup: true }, 'company.initCancel': { fn: companyInitCancel_, backup: true }, 'company.initConfirm': { fn: companyInitConfirm_, backup: true }, 'company.initRollback': { fn: companyInitRollback_, backup: true },
        'backup.switch': { fn: backupSwitch_, backup: true }, 'backup.rollbackSwitch': { fn: backupRollbackSwitch_, backup: true }, 'backup.cancelRestore': { fn: backupCancelRestore_, backup: true },
        'user.list': { fn: userList_ }, 'user.save': { fn: userSave_, write: true }, 'catalog.list': { fn: catalogList2_ }, 'catalog.save': { fn: catalogSave_, write: true },
        'config.get': { fn: configGet_ }, 'config.set': { fn: configSet_, write: true }, 'audit.list': { fn: auditList_ }
    });
}
var READ_BATCH_MAX_ = 8;
function rateLimit_(email) {
    var c = CacheService.getScriptCache(), k = 'rl:' + email + ':' + Math.floor(Date.now() / 60000), n = Number(c.get(k) || 0) + 1;
    c.put(k, String(n), 90);
    if (n > Number(props_().getProperty('RATE_LIMIT_PER_MIN') || 120))
        throw err_('RATE_LIMITED', 'Quá nhiều yêu cầu, vui lòng chờ một chút.');
}
function dispatch_(user, action, payloadObj) {
    var route = routes_()[action];
    if (!route)
        throw err_('NOT_FOUND', 'Chức năng không tồn tại: ' + action);
    if (props_().getProperty('MAINTENANCE') === '1' && route.write)
        throw err_('MAINTENANCE_MODE', 'Hệ thống đang bảo trì/khôi phục dữ liệu.');
    DATE_BASIS_ = !route.write && payloadObj.payload && payloadObj.payload.dateBasis === 'DOC' ? 'DOC' : 'POSTING';
    var res = route.fn(user, { requestId: payloadObj.requestId, payload: payloadObj.payload === undefined ? {} : payloadObj.payload, failAt: payloadObj.failAt });
    if (DRAFT_CLEAR_ACTIONS_[action] && payloadObj.payload && payloadObj.payload.draftId) {
        var cleaned = draftClearQuiet_(user, payloadObj.payload.draftId, payloadObj.payload.draftVersion, action, res && res.id);
        if (res && cleaned && !cleaned.cleared)
            res.draftRetained = true;
    }
    return res;
}
function doPost(e) {
    var t0 = Date.now(), out, email = '', action = '', tAuth = 0;
    SIG_OK_ = false;
    LOCKED_ = false;
    statReset_();
    try {
        var body = JSON.parse(e.postData.contents);
        email = String(body.email || '').toLowerCase();
        action = String(body.action || '');
        var rt0 = routes_()[action];
        resetMemo_();
        MEMO_.cacheOk = action === 'sys.batch' || !!(rt0 && !rt0.write && !rt0.draft && !rt0.backup && action !== 'tx.status');
        var user = verifyGatewayRequest_(body);
        rateLimit_(user.email);
        tAuth = Date.now() - t0;
        var fenceRead = action === 'sys.batch' || !!(rt0 && !rt0.write && !rt0.draft && !rt0.backup && action !== 'tx.status'), readVersion = fenceRead ? beginReadSnapshot_() : null;
        var po = body.payloadJson ? JSON.parse(body.payloadJson) : {}, data;
        if (action === 'sys.batch') {
            var calls = (po.payload && po.payload.calls) || [];
            if (calls.length > READ_BATCH_MAX_)
                throw err_('VALIDATION_FAILED', 'Tối đa ' + READ_BATCH_MAX_ + ' lệnh một lần.');
            data = calls.map(function (c) {
                var r = routes_()[c.action];
                if (!r || r.write || r.backup)
                    return { ok: false, error: { code: 'NOT_FOUND' } };
                try {
                    return { ok: true, data: cachedRead_(user, c.action, c.payload, readVersion, function () { return dispatch_(user, c.action, { payload: c.payload }); }) };
                }
                catch (er) {
                    return { ok: false, error: errOut_(er) };
                }
            });
        }
        else
            data = cachedRead_(user, action, po.payload, readVersion, function () { return dispatch_(user, action, po); });
        if (fenceRead)
            assertReadSnapshot_(readVersion);
        out = { ok: true, data: data, dataVersion: dataVersion_(), ms: Date.now() - t0, stat: { authMs: tAuth, runMs: Date.now() - t0 - tAuth, steps: STAT_.steps, reads: STAT_.reads, cells: STAT_.cells, txLookupRows: STAT_.txLookupRows || 0, cacheHit: STAT_.cacheHit, cacheMiss: STAT_.cacheMiss, responseCacheHit: STAT_.rcHit || 0, lockWaitMs: STAT_.lockWaitMs, lockHeldMs: STAT_.lockHeldMs, tables: STAT_.tables } };
    }
    catch (er) {
        var eo = errOut_(er);
        if (['UNAUTHENTICATED', 'FORBIDDEN', 'OUT_OF_SCOPE', 'RATE_LIMITED'].indexOf(eo.code) >= 0)
            auditDeny_(email, action, eo.code, eo.message);
        if (eo.code === 'INTERNAL_ERROR')
            console.error('INTERNAL ' + action + ' ' + (er && er.stack || er));
        if (eo.code === 'INTERNAL_ERROR') {
            try {
                alertAdmin_('Lỗi hệ thống ở thao tác ' + action, String(er && (er.stack || er.message) || er).slice(0, 1200), 'WARN');
            }
            catch (e9) { }
        }
        out = { ok: false, error: eo, ms: Date.now() - t0 };
    }
    return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function beginReadSnapshot_() {
    if (Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {})).length) {
        var lock = LockService.getScriptLock();
        if (lock.tryLock(0)) {
            LOCKED_ = true;
            try {
                var ok = MEMO_.cacheOk;
                resetMemoDirect_();
                recoverStale_(0);
                resetMemoDirect_();
                MEMO_.cacheOk = ok;
                cachePrefetch_();
            }
            finally {
                LOCKED_ = false;
                lock.releaseLock();
            }
        }
        if (Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {})).length)
            throw err_('SERVER_BUSY', 'Dữ liệu đang được cập nhật; vui lòng thử lại.');
    }
    return dataVersion_();
}
function assertReadSnapshot_(version) {
    if (Object.keys(safeJson_(props_().getProperty('OPEN_TX'), {})).length || dataVersion_() !== version)
        throw err_('SERVER_BUSY', 'Dữ liệu vừa thay đổi; vui lòng tải lại.');
}
function errOut_(er) {
    var code = er && er.code ? er.code : 'INTERNAL_ERROR';
    var retry = ['SERVER_BUSY', 'REQUEST_IN_PROGRESS', 'INTERNAL_ERROR', 'MAINTENANCE_MODE', 'RATE_LIMITED'].indexOf(code) >= 0;
    var msg = code === 'INTERNAL_ERROR' ? 'Lỗi hệ thống. Hãy kiểm tra trạng thái thao tác trước khi thử lại.' : (er.userMessage || String(er.message || code));
    if (code === 'UNAUTHENTICATED')
        msg = 'Không xác minh được danh tính.';
    return { code: code, message: msg, fields: er && er.fields ? er.fields : null, retryable: retry };
}
function doGet() { return ContentService.createTextOutput(JSON.stringify({ ok: false, error: { code: 'UNAUTHENTICATED' } })).setMimeType(ContentService.MimeType.JSON); }
function setupBackend() {
    var p = props_();
    if (!p.getProperty('DB_MAIN_ID'))
        p.setProperty('DB_MAIN_ID', SpreadsheetApp.create('CONGNO_DB_MAIN').getId());
    if (!p.getProperty('DB_AUDIT_ID'))
        p.setProperty('DB_AUDIT_ID', SpreadsheetApp.create('CONGNO_DB_AUDIT').getId());
    if (!p.getProperty('DB_DRAFT_ID'))
        p.setProperty('DB_DRAFT_ID', SpreadsheetApp.create('CONGNO_DB_DRAFT').getId());
    var secretNew = false;
    if (!p.getProperty('HMAC_SECRET')) {
        p.setProperty('HMAC_SECRET', Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, Utilities.getUuid() + Utilities.getUuid() + Date.now())));
        secretNew = true;
    }
    if (!p.getProperty('ENV'))
        p.setProperty('ENV', 'PROD');
    if (!p.getProperty('BOOTSTRAP_ADMIN'))
        p.setProperty('BOOTSTRAP_ADMIN', 'THAY-BANG-GMAIL-QUAN-TRI@gmail.com');
    var mig = migrateHeaders_();
    if (mig.length)
        Logger.log('Đã thêm cột: ' + mig.join(', '));
    Object.keys(TABLES_).forEach(function (t) { repoSheet_(t); });
    seedDefaults_();
    installTriggers();
    if (secretNew)
        Logger.log('HMAC_SECRET (dán vào Script Properties của Gateway, KHÔNG commit/chia sẻ):\n' + p.getProperty('HMAC_SECRET'));
    else
        Logger.log('HMAC_SECRET đã có sẵn (xem Project Settings → Script Properties); không in lại.');
    Logger.log('Việc cần làm: (1) sửa BOOTSTRAP_ADMIN = email Gmail quản trị đầu tiên; (2) đặt ALERT_EMAIL nếu muốn nhận cảnh báo; (3) Deploy Web app: Execute as Me, Anyone; (4) dán URL /exec vào Gateway (BACKEND_URL).');
}
var SERVICE_CODE_SEED_ = [['CFN', 'Chuyển phát nhanh (GML/CFN)', 'Chuyển phát nhanh'], ['FWD', 'Forwarding (GML/FWD)', 'Forwarding'], ['CBT', 'Vận tải xuyên biên giới (GML/CBT)', 'Vận tải xuyên biên giới'], ['MV', 'Moving & Relocation (GML/MV)', 'Moving & Relocation'], ['TRD', 'Trading (GML/TRD)', 'Trading']];
function seedServiceCodes() {
    withLock_(30000, function () {
        resetMemo_();
        var now = nowIso_(), sys = { createdAt: now, createdBy: 'system', updatedAt: now, updatedBy: 'system', version: 1, isDeleted: 0, commitState: 'C', txId: '' }, have = {}, rows = [];
        repoReadAll_('Catalog').forEach(function (c) { have[c.catalogType + '|' + c.code] = 1; });
        SERVICE_CODE_SEED_.forEach(function (x, i) { if (!have['SERVICE_CODE|' + x[0]])
            rows.push(Object.assign({ id: uid_('cat'), catalogType: 'SERVICE_CODE', code: x[0], name: x[1], attrsJson: JSON.stringify({ department: x[2] }), active: 1, sortOrder: i + 1 }, sys)); });
        if (rows.length)
            repoAppend_('Catalog', rows);
        bumpGen_('Catalog');
        Logger.log('Đã thêm ' + rows.length + ' mã dịch vụ (đã có sẵn ' + (SERVICE_CODE_SEED_.length - rows.length) + ').');
    });
}
function seedDefaults_() {
    resetMemo_();
    var now = nowIso_(), sys = { createdAt: now, createdBy: 'system', updatedAt: now, updatedBy: 'system', version: 1, isDeleted: 0, commitState: 'C', txId: '' };
    var have = {};
    repoReadAll_('Catalog').forEach(function (c) { have[c.catalogType + '|' + c.code] = 1; });
    var rows = [];
    function cat(type, code, name, attrs, order) { if (!have[type + '|' + code])
        rows.push(Object.assign({ id: uid_('cat'), catalogType: type, code: code, name: name, attrsJson: JSON.stringify(attrs || {}), active: 1, sortOrder: order || 100 }, sys)); }
    cat('CURRENCY', 'VND', 'Đồng Việt Nam', { decimals: 0, symbol: '₫' }, 1);
    cat('CURRENCY', 'USD', 'Đô la Mỹ', { decimals: 2, symbol: '$' }, 2);
    cat('BUSINESS_GROUP', 'FWD', 'FWD – phải thu VND', { currency: 'VND' }, 1);
    cat('BUSINESS_GROUP', 'CBT', 'CBT – phải thu USD', { currency: 'USD' }, 2);
    cat('BUSINESS_GROUP', 'NCC', 'NCC/Shipper', {}, 3);
    cat('BUSINESS_GROUP', 'BMT', 'BMT', {}, 4);
    cat('BUSINESS_GROUP', 'KHAC', 'Khác', {}, 9);
    SERVICE_CODE_SEED_.forEach(function (x, i) { cat('SERVICE_CODE', x[0], x[1], { department: x[2] }, i + 1); });
    [['OPENING_LUMP', 'Số dư đầu kỳ (gộp)'], ['TRUCKING', 'Cước vận chuyển'], ['CONT_LIFT', 'Phí nâng/hạ container'], ['CUSTOMS_SERVICE', 'Phí dịch vụ thủ tục hải quan'], ['PERMIT', 'Phí xin giấy phép'],
        ['INFRA', 'Phí hạ tầng'], ['PASS_THROUGH', 'Chi hộ'], ['OTHER', 'Khác']].forEach(function (f, i) { cat('FEE_TYPE', f[0], f[1], { defaultVatMode: 'UNCONFIRMED' }, i + 1); });
    if (rows.length)
        repoAppend_('Catalog', rows);
    var cfg = {};
    repoReadAll_('Config').forEach(function (c) { cfg[c.id] = 1; });
    var crow = [];
    [['ledgerStartDate', '2026-01-01'], ['entity.name', ''], ['entity.shortName', ''], ['entity.address', ''], ['entity.taxCode', ''], ['entity.bank', ''], ['backup.retention.daily', '14'], ['archive.sysTxDays', '90'], ['archive.auditMonths', '24'], ['credit.policy', 'WARN'], ['credit.maxOverdueDays', '0']].forEach(function (kv) { if (!cfg[kv[0]])
        crow.push(Object.assign({ id: kv[0], value: kv[1] }, sys)); });
    if (crow.length)
        repoAppend_('Config', crow);
}
// Dành cho hệ thống ĐÃ chạy trước đây: tạo file DRAFT/XEM NHANH, chuyển ReadModel + bản nháp sang đó. An toàn khi chạy lại.
function setupDraftDb() {
    var p = props_(), created = false;
    if (!p.getProperty('DB_DRAFT_ID')) {
        p.setProperty('DB_DRAFT_ID', SpreadsheetApp.create('CONGNO_DB_DRAFT').getId());
        created = true;
    }
    resetMemoDirect_();
    HDR_OK_ = {};
    Object.keys(DRAFT_HOME_TABLES_).forEach(function (t) { repoSheet_(t, true); });
    try {
        rmInvalidate_();
        rmRebuildAll_();
    }
    catch (e) {
        Logger.log('Chưa dựng được bảng tổng hợp ngay (sẽ dựng bằng bộ kích hoạt): ' + e);
    }
    Logger.log((created ? 'Đã tạo file DRAFT/XEM NHANH: ' : 'File DRAFT/XEM NHANH đã có: ') + p.getProperty('DB_DRAFT_ID') + '. Sheet ReadModel cũ trong file chính không còn dùng; có thể xóa tay sau khi kiểm tra.');
    return { draftId: p.getProperty('DB_DRAFT_ID') };
}
function installTriggers() {
    ScriptApp.getProjectTriggers().forEach(function (t) { var f = t.getHandlerFunction(); if (f === 'backupDailyTrigger' || f === 'recoverTrigger' || f === 'overdueDigestTrigger' || f === 'archiveTrigger' || f === 'reconcileTrigger')
        ScriptApp.deleteTrigger(t); });
    ScriptApp.newTrigger('backupDailyTrigger').timeBased().atHour(1).everyDays(1).inTimezone('Asia/Ho_Chi_Minh').create();
    ScriptApp.newTrigger('recoverTrigger').timeBased().everyMinutes(10).create();
    ScriptApp.newTrigger('overdueDigestTrigger').timeBased().atHour(8).everyDays(1).inTimezone('Asia/Ho_Chi_Minh').create();
    ScriptApp.newTrigger('reconcileTrigger').timeBased().atHour(2).everyDays(1).inTimezone('Asia/Ho_Chi_Minh').create();
    ScriptApp.newTrigger('archiveTrigger').timeBased().atHour(3).everyDays(1).inTimezone('Asia/Ho_Chi_Minh').create();
}
// Chỉ ĐỌC (không tạo/xóa gì): liệt kê bộ kích hoạt của dự án, đếm theo hàm và báo trùng/thiếu. Chạy trước khi quyết định có cần installTriggers() hay không.
function checkTriggers() {
    var want = { backupDailyTrigger: 1, recoverTrigger: 1, overdueDigestTrigger: 1, reconcileTrigger: 1, archiveTrigger: 1 }, count = {}, out = { ok: true, problems: [], counts: {} };
    ScriptApp.getProjectTriggers().forEach(function (t) { var f = t.getHandlerFunction(); count[f] = (count[f] || 0) + 1; });
    Object.keys(want).forEach(function (f) {
        out.counts[f] = count[f] || 0;
        if (!count[f])
            out.problems.push('Thiếu bộ kích hoạt ' + f);
        else if (count[f] > 1)
            out.problems.push('Trùng ' + count[f] + ' bộ kích hoạt ' + f + ' (chạy installTriggers() để dọn và tạo lại đúng 1)');
    });
    out.ok = !out.problems.length;
    Logger.log(JSON.stringify(out));
    return out;
}
// ---- Lưu trữ: chuyển dòng cũ của SysTx và AuditLog sang tệp CONGNO_ARCHIVE_<bảng>_<năm> rồi xóa khỏi bảng đang dùng ----
var ARCHIVE_BATCH_ = 2000;
function archiveTrigger() {
    try {
        archiveOldData();
        draftPurge_();
    }
    catch (e) {
        alertAdmin_('Lưu trữ dữ liệu cũ thất bại', String(e));
    }
}
function archiveSheetFor_(table, year) {
    var key = 'ARCH_' + table + '_' + year, id = props_().getProperty(key), ss;
    if (id) {
        ss = SpreadsheetApp.openById(id);
    }
    else {
        ss = SpreadsheetApp.create('CONGNO_ARCHIVE_' + table + '_' + year);
        props_().setProperty(key, ss.getId());
    }
    var sh = ss.getSheetByName(table), cols = parseCols_(table);
    if (!sh) {
        sh = ss.getSheets()[0];
        sh.setName(table);
        sh.getRange(1, 1, 1, cols.length).setValues([cols.map(function (c) { return c.name; })]);
        sh.setFrozenRows(1);
        sh.getRange(1, 1, sh.getMaxRows(), cols.length).setNumberFormat('@');
    }
    return sh;
}
function archiveTable_(table, isOld, isFinal) {
    repoSheet_(table, true);
    var home = openDb_(tableHome_(table)), live = home.getSheetByName(table), cols = parseCols_(table), res = { table: table, archived: 0 };
    if (!live || live.getLastRow() < 2)
        return res;
    var idIdx = 0, pend = safeJson_(props_().getProperty('ARCH_PENDING_' + table), null), n, rows;
    if (pend) {
        // lần trước đã chép sang kho nhưng chưa xóa kịp: kiểm tra đúng các dòng đó rồi chỉ xóa, không chép lại
        var chk = live.getRange(2, 1, pend.n, cols.length).getValues();
        if (chk.length === pend.n && chk[0][idIdx] === pend.firstId && chk[pend.n - 1][idIdx] === pend.lastId) {
            live.deleteRows(2, pend.n);
            props_().deleteProperty('ARCH_PENDING_' + table);
            res.archived = pend.n;
            return res;
        }
        props_().deleteProperty('ARCH_PENDING_' + table);
    }
    var take = Math.min(ARCHIVE_BATCH_, live.getLastRow() - 1);
    rows = live.getRange(2, 1, take, cols.length).getValues();
    n = 0;
    while (n < rows.length && isOld(rows[n]) && isFinal(rows[n]))
        n++;
    if (!n)
        return res;
    rows = rows.slice(0, n);
    var byYear = {}, order = [];
    rows.forEach(function (r) { var y = String(isOld.yearOf(r)); if (!byYear[y]) {
        byYear[y] = [];
        order.push(y);
    } byYear[y].push(r); });
    props_().setProperty('ARCH_PENDING_' + table, JSON.stringify({ n: n, firstId: rows[0][idIdx], lastId: rows[n - 1][idIdx] }));
    try {
        order.forEach(function (y) {
            var sh = archiveSheetFor_(table, y), start = sh.getLastRow() + 1, part = byYear[y];
            sh.getRange(start, 1, part.length, cols.length).setValues(part);
            SpreadsheetApp.flush();
            var back = sh.getRange(start + part.length - 1, 1).getValue();
            if (sh.getLastRow() !== start + part.length - 1 || back !== part[part.length - 1][idIdx])
                throw new Error('Kiểm tra bản lưu trữ ' + table + '/' + y + ' không khớp; không xóa dữ liệu gốc.');
        });
    }
    catch (e) {
        props_().deleteProperty('ARCH_PENDING_' + table);
        throw e;
    }
    live.deleteRows(2, n);
    props_().deleteProperty('ARCH_PENDING_' + table);
    res.archived = n;
    return res;
}
function archiveOldData() {
    return withLock_(30000, function () {
        if (props_().getProperty('MAINTENANCE') === '1')
            return { skipped: 'maintenance' };
        resetMemo_();
        var days = Math.max(30, Number(cfgGet_('archive.sysTxDays', '90')) || 90), months = Math.max(12, Number(cfgGet_('archive.auditMonths', '24')) || 24), now = new Date();
        var cutTx = new Date(now.getTime() - days * 86400000).toISOString(), ca = new Date(now.getTime());
        ca.setMonth(ca.getMonth() - months);
        var cutAudit = ca.toISOString();
        var txOld = function (r) { return String(r[6]) && String(r[6]) < cutTx; };
        txOld.yearOf = function (r) { return String(r[6]).slice(0, 4) || 'khac'; };
        var auOld = function (r) { return String(r[1]) && String(r[1]) < cutAudit; };
        auOld.yearOf = function (r) { return String(r[1]).slice(0, 4) || 'khac'; };
        var out = [archiveTable_('SysTx', txOld, function (r) { return r[5] === 'FINALIZED' || r[5] === 'ROLLED_BACK'; }), archiveTable_('AuditLog', auOld, function (r) { return r[10] !== 'PENDING'; })];
        resetMemo_();
        if (out[0].archived || out[1].archived)
            Logger.log('Lưu trữ: SysTx ' + out[0].archived + ' dòng, AuditLog ' + out[1].archived + ' dòng.');
        return { results: out };
    });
}
// Pha 1 (chỉ đọc): liệt kê mọi lệch tiêu đề. Phần lõi + cột hệ thống phải đúng tuyệt đối; cột bổ sung (EXTRA_COLS_) được phép còn trống.
function headerProblems_() {
    var out = [];
    Object.keys(TABLES_).forEach(function (t) {
        var s = openDb_(tableHome_(t)).getSheetByName(t);
        if (!s)
            return;
        var cols = parseCols_(t), extra = (EXTRA_COLS_[t] || []).length, base = cols.length - extra, width = Math.min(s.getMaxColumns(), cols.length);
        var got = width ? s.getRange(1, 1, 1, width).getValues()[0] : [];
        for (var i = 0; i < base; i++)
            if (String(got[i] === undefined ? '' : got[i]).trim() !== cols[i].name)
                out.push(t + ': cột ' + (i + 1) + ' cần "' + cols[i].name + '" nhưng là "' + (got[i] === undefined ? '' : got[i]) + '"');
        for (var j = base; j < cols.length; j++) {
            var g = String(got[j] === undefined ? '' : got[j]).trim();
            if (g !== '' && g !== cols[j].name)
                out.push(t + ': cột bổ sung ' + (j + 1) + ' cần "' + cols[j].name + '" hoặc để trống nhưng là "' + g + '"');
        }
    });
    return out;
}
// Pha 2: chỉ thêm tiêu đề còn thiếu ở cuối bảng, sau khi pha 1 sạch toàn bộ; xong thì đọc lại xác minh và làm mới cache.
function migrateHeaders_() {
    var bad = headerProblems_();
    if (bad.length)
        throw err_('SCHEMA_MISMATCH', 'Có bảng lệch tiêu đề, chưa thêm cột nào: ' + bad.slice(0, 5).join('; '));
    var added = [];
    Object.keys(EXTRA_COLS_).forEach(function (t) {
        var s = openDb_(tableHome_(t)).getSheetByName(t);
        if (!s)
            return;
        var cols = parseCols_(t), base = cols.length - EXTRA_COLS_[t].length;
        if (s.getMaxColumns() < cols.length)
            s.insertColumnsAfter(s.getMaxColumns(), cols.length - s.getMaxColumns());
        var got = s.getRange(1, 1, 1, cols.length).getValues()[0];
        for (var i = base; i < cols.length; i++) {
            if (String(got[i]).trim() === '') {
                s.getRange(1, i + 1).setValue(cols[i].name);
                s.getRange(1, i + 1, s.getMaxRows(), 1).setNumberFormat(cols[i].type === 's' ? '@' : '0');
                added.push(t + '.' + cols[i].name);
            }
        }
    });
    SpreadsheetApp.flush();
    HDR_OK_ = {};
    HDR_FRESH_ = {};
    var after = headerProblems_();
    if (after.length)
        throw err_('SCHEMA_MISMATCH', 'Sau khi thêm cột vẫn lệch: ' + after.slice(0, 5).join('; '));
    Object.keys(EXTRA_COLS_).forEach(function (t) { bumpGen_(t); });
    return added;
}
function ensureSchema() {
    var pre = headerProblems_();
    if (pre.length) {
        Logger.log('LỆCH SCHEMA (' + pre.length + ') – chưa ghi gì, hãy sửa tiêu đề rồi chạy lại:\n' + pre.join('\n'));
        return pre;
    }
    var mig = migrateHeaders_();
    if (mig.length)
        Logger.log('Đã thêm cột: ' + mig.join(', '));
    var bad = schemaProblems_();
    if (bad.length)
        Logger.log('LỆCH SCHEMA (' + bad.length + '):\n' + bad.join('\n'));
    else
        Logger.log('Đã kiểm tra đủ ' + Object.keys(TABLES_).length + ' bảng, tiêu đề cột khớp.');
    return bad;
}
// Kiểm tra dữ liệu cũ bị ảnh hưởng khi sổ đổi sang cơ sở NGÀY GHI NHẬN: chứng từ đã ghi nhận có ngày ghi nhận khác tháng với ngày chứng từ
// (trước đây tính theo ngày chứng từ). Số công nợ tại các ngày chốt nằm giữa hai ngày đó sẽ khác bản cũ. Chỉ liệt kê, không sửa gì.
function ledgerDateImpact_() {
    var out = [], closed = {};
    repoValid_('Period').forEach(function (p) { if (p.status === 'CLOSED')
        closed[p.id] = 1; });
    repoValid_('DebtDoc').forEach(function (d) {
        if (!COUNTED_DOC_STATUS_[d.status] || !d.docDate || !d.postingDate || d.isOpening || d.docDate.slice(0, 7) === d.postingDate.slice(0, 7))
            return;
        out.push({ docNo: d.docNo, docDate: d.docDate, postingDate: d.postingDate, status: d.status, docPeriodClosed: !!closed[d.docDate.slice(0, 7)] });
    });
    return out;
}
function auditLedgerDates() {
    var r = ledgerDateImpact_();
    Logger.log('Chứng từ đã ghi nhận khác tháng với ngày chứng từ: ' + r.length + (r.length ? '\n' + r.slice(0, 50).map(function (x) { return x.docNo + ' | chứng từ ' + x.docDate + ' | ghi nhận ' + x.postingDate + (x.docPeriodClosed ? ' | kỳ chứng từ đã khóa' : ''); }).join('\n') : ''));
    return r;
}
function clearReadCache() { Object.keys(CACHED_TABLES_).forEach(function (t) { bumpGen_(t); }); Logger.log('Đã làm mới bộ nhớ đệm đọc.'); }
