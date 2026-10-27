/* khối chú thích chứa 1n ?? a?.b 1_000 và `template` */
// dòng chú thích 1n ?? a?.b 1_000
var s = "chuỗi 1n ?? a?.b 1_000";
var t = 'chuỗi 1n ?? a?.b';
var u = `template 1n ${1 + 1} ?? a?.b`;
var re = /1n??a?.b/;
var cond = s ? t : u;
var obj = { a: 1 };
var z = obj.a ? obj.a : 0;
var half = 1 / 2;
var str = "http://example.com/?q=1&r=2";
