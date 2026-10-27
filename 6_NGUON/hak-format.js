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
