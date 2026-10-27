/* XLSX tối giản, không phụ thuộc thư viện ngoài: GHI (nhiều sheet, kiểu ô, gộp ô, đóng băng, danh sách chọn, tự lọc) và ĐỌC (ô chữ/số/ngày) cho tệp mẫu nhập hàng loạt. */
var XLSXLite = (function () {
    var enc = new TextEncoder(), dec = new TextDecoder('utf-8');
    var CRC = (function () { var t = [], c, n, k; for (n = 0; n < 256; n++) { c = n; for (k = 0; k < 8; k++)
        c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
    function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++)
        c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
    function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
    function colName(i) { var s = ''; i++; while (i > 0) { var m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; }
    function colIndex(letters) { var n = 0; for (var i = 0; i < letters.length; i++)
        n = n * 26 + (letters.charCodeAt(i) - 64); return n - 1; }
    async function deflateRaw(bytes) {
        if (typeof CompressionStream === 'undefined')
            return null;
        var cs = new CompressionStream('deflate-raw'), w = cs.writable.getWriter();
        w.write(bytes);
        w.close();
        return new Uint8Array(await new Response(cs.readable).arrayBuffer());
    }
    async function inflateRaw(bytes) {
        var ds = new DecompressionStream('deflate-raw'), w = ds.writable.getWriter();
        w.write(bytes);
        w.close();
        return new Uint8Array(await new Response(ds.readable).arrayBuffer());
    }
    function u16(n) { return [n & 255, (n >>> 8) & 255]; }
    function u32(n) { return [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255]; }
    async function zip(files) {
        var parts = [], central = [], offset = 0;
        for (var i = 0; i < files.length; i++) {
            var f = files[i], raw = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(raw), packed = await deflateRaw(raw), method = packed && packed.length < raw.length ? 8 : 0, data = method ? packed : raw, name = enc.encode(f.name);
            var lh = new Uint8Array([0x50, 0x4b, 3, 4].concat(u16(20), u16(0x0800), u16(method), u16(0), u16(0x21), u32(crc), u32(data.length), u32(raw.length), u16(name.length), u16(0)));
            parts.push(lh, name, data);
            central.push(new Uint8Array([0x50, 0x4b, 1, 2].concat(u16(20), u16(20), u16(0x0800), u16(method), u16(0), u16(0x21), u32(crc), u32(data.length), u32(raw.length), u16(name.length), u16(0), u16(0), u16(0), u16(0), u32(0), u32(offset))), name);
            offset += lh.length + name.length + data.length;
        }
        var cdSize = 0;
        central.forEach(function (c) { cdSize += c.length; });
        var end = new Uint8Array([0x50, 0x4b, 5, 6].concat(u16(0), u16(0), u16(files.length), u16(files.length), u32(cdSize), u32(offset), u16(0)));
        var all = parts.concat(central, [end]), total = 0;
        all.forEach(function (p) { total += p.length; });
        var out = new Uint8Array(total), pos = 0;
        all.forEach(function (p) { out.set(p, pos); pos += p.length; });
        return out;
    }
    // ---- GHI ----
    function Styles() {
        var fonts = [], fills = ['<fill><patternFill patternType="none"/></fill>', '<fill><patternFill patternType="gray125"/></fill>'], borders = ['<border><left/><right/><top/><bottom/><diagonal/></border>'], numFmts = {}, xfs = [], keyIdx = {}, nf = 164;
        function idx(arr, xml) { var i = arr.indexOf(xml); if (i < 0) {
            arr.push(xml);
            i = arr.length - 1;
        } return i; }
        fonts.push('<font><sz val="10"/><name val="Calibri"/></font>');
        xfs.push('<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>');
        function side(n, c) { return c ? '<' + n + ' style="thin"><color rgb="' + c + '"/></' + n + '>' : '<' + n + '/>'; }
        return {
            get: function (o) {
                if (!o)
                    return 0;
                var key = JSON.stringify(o);
                if (keyIdx[key] !== undefined)
                    return keyIdx[key];
                var f = o.font || {}, font = '<font>' + (f.b ? '<b/>' : '') + (f.i ? '<i/>' : '') + '<sz val="' + (f.sz || 10) + '"/><color rgb="' + (f.color || 'FF1F2937') + '"/><name val="' + (f.name || 'Calibri') + '"/></font>', fi = idx(fonts, font);
                var fill = o.fill ? idx(fills, '<fill><patternFill patternType="solid"><fgColor rgb="' + o.fill + '"/><bgColor indexed="64"/></patternFill></fill>') : 0;
                var bc = o.border, bd = bc ? idx(borders, '<border>' + side('left', bc) + side('right', bc) + side('top', bc) + side('bottom', bc) + '<diagonal/></border>') : 0;
                var nfid = 0;
                if (o.numFmt === '@')
                    nfid = 49;
                else if (o.numFmt) {
                    if (!numFmts[o.numFmt])
                        numFmts[o.numFmt] = nf++;
                    nfid = numFmts[o.numFmt];
                }
                var a = o.align || {}, al = '<alignment' + (a.h ? ' horizontal="' + a.h + '"' : '') + ' vertical="' + (a.v || 'center') + '"' + (a.wrap ? ' wrapText="1"' : '') + (a.indent ? ' indent="' + a.indent + '"' : '') + '/>';
                xfs.push('<xf numFmtId="' + nfid + '" fontId="' + fi + '" fillId="' + fill + '" borderId="' + bd + '" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1" applyNumberFormat="1">' + al + '</xf>');
                return (keyIdx[key] = xfs.length - 1);
            },
            xml: function () {
                var nfx = Object.keys(numFmts).map(function (k) { return '<numFmt numFmtId="' + numFmts[k] + '" formatCode="' + esc(k) + '"/>'; }).join('');
                return '<' + '?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' + (nfx ? '<numFmts count="' + Object.keys(numFmts).length + '">' + nfx + '</numFmts>' : '') + '<fonts count="' + fonts.length + '">' + fonts.join('') + '</fonts><fills count="' + fills.length + '">' + fills.join('') + '</fills><borders count="' + borders.length + '">' + borders.join('') + '</borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="' + xfs.length + '">' + xfs.join('') + '</cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
            }
        };
    }
    function sheetXml(sh, st) {
        var rows = sh.rows || [], out = [], maxC = 0;
        rows.forEach(function (r, ri) {
            if (!r)
                return;
            var cells = r.cells || [], x = '';
            cells.forEach(function (c, ci) {
                if (!c)
                    return;
                maxC = Math.max(maxC, ci + 1);
                var ref = colName(ci) + (ri + 1), s = c.s ? st.get(c.s) : 0;
                if (c.v === undefined || c.v === null || c.v === '')
                    x += '<c r="' + ref + '"' + (s ? ' s="' + s + '"' : '') + '/>';
                else if (typeof c.v === 'number')
                    x += '<c r="' + ref + '"' + (s ? ' s="' + s + '"' : '') + '><v>' + c.v + '</v></c>';
                else
                    x += '<c r="' + ref + '"' + (s ? ' s="' + s + '"' : '') + ' t="inlineStr"><is><t xml:space="preserve">' + esc(c.v) + '</t></is></c>';
            });
            out.push('<row r="' + (ri + 1) + '"' + (r.h ? ' ht="' + r.h + '" customHeight="1"' : '') + '>' + x + '</row>');
        });
        var fz = sh.freeze, pane = fz ? '<pane' + (fz.col ? ' xSplit="' + fz.col + '"' : '') + (fz.row ? ' ySplit="' + fz.row + '"' : '') + ' topLeftCell="' + colName(fz.col || 0) + ((fz.row || 0) + 1) + '" activePane="' + (fz.col && fz.row ? 'bottomRight' : fz.row ? 'bottomLeft' : 'topRight') + '" state="frozen"/>' : '';
        var x = '<' + '?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">';
        x += '<sheetPr>' + (sh.tabColor ? '<tabColor rgb="' + sh.tabColor + '"/>' : '') + '<pageSetUpPr fitToPage="1"/></sheetPr>';
        x += '<dimension ref="A1:' + colName(Math.max(maxC, 1) - 1) + Math.max(rows.length, 1) + '"/>';
        x += '<sheetViews><sheetView workbookViewId="0"' + (sh.showGrid === false ? ' showGridLines="0"' : '') + (sh.active ? ' tabSelected="1"' : '') + (sh.zoom ? ' zoomScale="' + sh.zoom + '"' : '') + '>' + pane + '</sheetView></sheetViews><sheetFormatPr defaultRowHeight="18"/>';
        if (sh.cols)
            x += '<cols>' + sh.cols.map(function (c, i) { return '<col min="' + (i + 1) + '" max="' + (i + 1) + '" width="' + (c.w || 12) + '" customWidth="1"' + (c.hidden ? ' hidden="1"' : '') + '/>'; }).join('') + '</cols>';
        x += '<sheetData>' + out.join('') + '</sheetData>';
        if (sh.filter)
            x += '<autoFilter ref="' + sh.filter + '"/>';
        if (sh.merges && sh.merges.length)
            x += '<mergeCells count="' + sh.merges.length + '">' + sh.merges.map(function (m) { return '<mergeCell ref="' + m + '"/>'; }).join('') + '</mergeCells>';
        if (sh.validations && sh.validations.length)
            x += '<dataValidations count="' + sh.validations.length + '">' + sh.validations.map(function (v) {
                return '<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="1"' + (v.warn ? ' errorStyle="warning"' : '') + (v.title ? ' promptTitle="' + esc(v.title.slice(0, 32)) + '"' : '') + (v.prompt ? ' prompt="' + esc(v.prompt.slice(0, 255)) + '"' : '') + (v.error ? ' errorTitle="Giá trị chưa có trong danh mục" error="' + esc(v.error.slice(0, 255)) + '"' : '') + ' sqref="' + v.sqref + '"><formula1>' + esc(v.list) + '</formula1></dataValidation>';
            }).join('') + '</dataValidations>';
        x += '<pageMargins left="0.4" right="0.4" top="0.5" bottom="0.5" header="0.3" footer="0.3"/><pageSetup paperSize="9" orientation="' + (sh.landscape === false ? 'portrait' : 'landscape') + '" fitToWidth="1" fitToHeight="0"/></worksheet>';
        return x;
    }
    async function write(wb) {
        var st = Styles(), files = [], names = wb.sheets.map(function (s) { return s.name; });
        var sheetsXml = wb.sheets.map(function (s, i) { return sheetXml(s, st); });
        files.push({ name: '[Content_Types].xml', data: '<' + '?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + names.map(function (n, i) { return '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'; }).join('') + '</Types>' });
        files.push({ name: '_rels/.rels', data: '<' + '?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' });
        files.push({ name: 'xl/workbook.xml', data: '<' + '?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView activeTab="0"/></bookViews><sheets>' + wb.sheets.map(function (s, i) { return '<sheet name="' + esc(s.name) + '" sheetId="' + (i + 1) + '"' + (s.hidden ? ' state="hidden"' : '') + ' r:id="rId' + (i + 1) + '"/>'; }).join('') + '</sheets>' + (wb.definedNames || '') + '</workbook>' });
        files.push({ name: 'xl/_rels/workbook.xml.rels', data: '<' + '?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + names.map(function (n, i) { return '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>'; }).join('') + '<Relationship Id="rId' + (names.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' });
        files.push({ name: 'xl/styles.xml', data: st.xml() });
        sheetsXml.forEach(function (x, i) { files.push({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: x }); });
        return zip(files);
    }
    // ---- ĐỌC ----
    function unesc(s) { return s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, function (m, d) { return String.fromCharCode(+d); }).replace(/&#x([0-9a-f]+);/gi, function (m, d) { return String.fromCharCode(parseInt(d, 16)); }).replace(/&amp;/g, '&'); }
    async function unzip(buf) {
        var b = new Uint8Array(buf), dv = new DataView(b.buffer, b.byteOffset, b.byteLength), end = -1, i;
        for (i = b.length - 22; i >= Math.max(0, b.length - 66000); i--)
            if (dv.getUint32(i, true) === 0x06054b50) {
                end = i;
                break;
            }
        if (end < 0)
            throw new Error('Không phải tệp .xlsx hợp lệ.');
        var n = dv.getUint16(end + 10, true), p = dv.getUint32(end + 16, true), files = {};
        for (i = 0; i < n; i++) {
            if (dv.getUint32(p, true) !== 0x02014b50)
                throw new Error('Tệp .xlsx bị hỏng.');
            var method = dv.getUint16(p + 10, true), csize = dv.getUint32(p + 20, true), nlen = dv.getUint16(p + 28, true), xlen = dv.getUint16(p + 30, true), clen = dv.getUint16(p + 32, true), off = dv.getUint32(p + 42, true), name = dec.decode(b.subarray(p + 46, p + 46 + nlen));
            var lnlen = dv.getUint16(off + 26, true), lxlen = dv.getUint16(off + 28, true), start = off + 30 + lnlen + lxlen, data = b.subarray(start, start + csize);
            files[name] = { method: method, data: data };
            p += 46 + nlen + xlen + clen;
        }
        return files;
    }
    async function text(files, name) {
        var f = files[name];
        if (!f)
            return null;
        var d = f.method === 8 ? await inflateRaw(f.data) : f.data;
        return dec.decode(d);
    }
    function isDateFmt(id, code) { if ((id >= 14 && id <= 22) || (id >= 45 && id <= 47))
        return true; return !!code && /[dmy]/i.test(code.replace(/"[^"]*"|\[[^\]]*\]|\\./g, '')) && !/[hs]/i.test(code.replace(/"[^"]*"|\[[^\]]*\]|\\./g, '').replace(/mm?/gi, '')) || (!!code && /d+[\/\-.]m+|m+[\/\-.]d+|y+/i.test(code)); }
    function serialToVn(n) { var ms = Math.round((n - 25569) * 86400000), d = new Date(ms); function z(x) { return ('0' + x).slice(-2); } return z(d.getUTCDate()) + '/' + z(d.getUTCMonth() + 1) + '/' + d.getUTCFullYear(); }
    async function read(buf) {
        var files = await unzip(buf), wbx = await text(files, 'xl/workbook.xml');
        if (!wbx)
            throw new Error('Không đọc được sổ làm việc trong tệp .xlsx.');
        var rels = await text(files, 'xl/_rels/workbook.xml.rels') || '', relMap = {};
        rels.replace(/<Relationship\b[^>]*>/g, function (t) { var id = /Id="([^"]+)"/.exec(t), tg = /Target="([^"]+)"/.exec(t); if (id && tg)
            relMap[id[1]] = tg[1].replace(/^\//, '').replace(/^(?!xl\/)/, 'xl/'); return t; });
        var sheetList = [];
        wbx.replace(/<sheet\b[^>]*>/g, function (t) { var nm = /name="([^"]*)"/.exec(t), rid = /r:id="([^"]+)"/.exec(t), stt = /state="([^"]+)"/.exec(t); if (nm && rid)
            sheetList.push({ name: unesc(nm[1]), path: relMap[rid[1]], hidden: !!stt && stt[1] !== 'visible' }); return t; });
        var ssx = await text(files, 'xl/sharedStrings.xml'), sst = [];
        if (ssx)
            ssx.replace(/<si\b[^>]*>([\s\S]*?)<\/si>/g, function (m, inner) { var s = ''; inner.replace(/<t\b[^>]*>([\s\S]*?)<\/t>/g, function (mm, t) { s += unesc(t); return mm; }); sst.push(s); return m; });
        var stx = await text(files, 'xl/styles.xml') || '', fmtCode = {}, dateXf = [];
        stx.replace(/<numFmt\b[^>]*>/g, function (t) { var i = /numFmtId="(\d+)"/.exec(t), c = /formatCode="([^"]*)"/.exec(t); if (i && c)
            fmtCode[i[1]] = unesc(c[1]); return t; });
        var xfBlock = /<cellXfs\b[^>]*>([\s\S]*?)<\/cellXfs>/.exec(stx);
        if (xfBlock)
            xfBlock[1].replace(/<xf\b[^>]*>/g, function (t) { var i = /numFmtId="(\d+)"/.exec(t); dateXf.push(i ? isDateFmt(+i[1], fmtCode[i[1]]) : false); return t; });
        var out = [];
        for (var si = 0; si < sheetList.length; si++) {
            var sx = await text(files, sheetList[si].path);
            if (sx === null)
                continue;
            var rows = [];
            sx.replace(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g, function (m, inner) {
                var rn = /\br="(\d+)"/.exec(m), arr = [];
                if (inner)
                    inner.replace(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g, function (mc, attrs, body) {
                        var ref = /\br="([A-Z]+)\d+"/.exec(attrs), t = /\bt="([^"]+)"/.exec(attrs), s = /\bs="(\d+)"/.exec(attrs), v = '';
                        if (!ref)
                            return mc;
                        if (body) {
                            var vv = /<v>([\s\S]*?)<\/v>/.exec(body);
                            if (t && t[1] === 'inlineStr') {
                                body.replace(/<t\b[^>]*>([\s\S]*?)<\/t>/g, function (a, b) { v += unesc(b); return a; });
                            }
                            else if (vv) {
                                v = unesc(vv[1]);
                                if (t && t[1] === 's')
                                    v = sst[+v] === undefined ? '' : sst[+v];
                                else if (t && t[1] === 'b')
                                    v = v === '1' ? '1' : '0';
                                else if (!t || t[1] === 'n') {
                                    if (s && dateXf[+s[1]] && isFinite(+v) && +v > 0)
                                        v = serialToVn(+v);
                                    else if (/^-?\d+(\.\d+)?E[+-]?\d+$/i.test(v))
                                        v = String(Number(v));
                                }
                            }
                        }
                        arr[colIndex(ref[1])] = v;
                        return mc;
                    });
                var r = rn ? +rn[1] - 1 : rows.length;
                while (rows.length < r)
                    rows.push([]);
                for (var k = 0; k < arr.length; k++)
                    if (arr[k] === undefined)
                        arr[k] = '';
                rows[r] = arr;
                return m;
            });
            out.push({ name: sheetList[si].name, hidden: sheetList[si].hidden, rows: rows });
        }
        return { sheets: out };
    }
    return { write: write, read: read, colName: colName };
})();
