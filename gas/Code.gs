/**
 * Mutasi Kimia Dyeing - Google Apps Script
 * Deploy: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone
 * Stok Akhir = Stock Awal + Pemasukan - Pemakaian - Return  (satuan gram)
 */
const SHEET_ID = '1permlYdPpNDIpFkugH2tq79y5BKPO70RHgMNBC_IGF4';
const SHEET_NAME = 'MUTASI';

function doGet(e) {
  var a = e && e.parameter && e.parameter.action;
  if (a === 'getData') {
    var o;
    try { o = apiData(); } catch (err) { o = { status: 'error', message: String(err) }; }
    return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
  }
  return HtmlService.createHtmlOutputFromFile('Index').setTitle('Mutasi Kimia Dyeing')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Angka sheet memakai format Indonesia: titik = ribuan, koma = desimal.
function num_(v) {
  if (typeof v === 'number') return v;
  var s = String(v == null ? '' : v).replace(/[^\d.,-]/g, '');
  if (!s) return 0;
  if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  var n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}
function r2_(x) { return Math.round(x * 100) / 100; }
function pKey_(per) { // "01-05-2024 s/d 31-05-2024" -> "2024-05"
  var m = String(per).match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  return m ? m[3] + '-' + ('0' + m[2]).slice(-2) : '';
}

function apiData() {
  var sh = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sh) throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan');
  var v = sh.getDataRange().getValues();
  var h = v[0].map(function (x) { return String(x).trim().toLowerCase(); });
  var c = function (n) { var i = h.indexOf(n); if (i < 0) throw new Error('Kolom "' + n + '" tidak ada'); return i; };
  var I = { entry: c('kode.entry'), kode: c('kode.kimia'), nama: c('nama'), jenis: c('jenis'), awal: c('stock awal'),
    masuk: c('pemasukan'), pakai: c('pemakaian'), ret: c('return'), akhir: c('stock akhir'), per: c('periode'), cat: c('catatan') };

  var map = {}, dup = 0;
  for (var r = 1; r < v.length; r++) {
    var x = v[r], nama = String(x[I.nama] || '').trim(), jn = String(x[I.jenis] || '').trim();
    if (!nama || /grand total/i.test(jn)) continue;         // baris kosong & total
    var per = String(x[I.per] || '').trim(), p = pKey_(per);
    if (!p) continue;
    var o = { p: p, per: per, kode: String(x[I.kode] || '').trim(), entry: String(x[I.entry] || '').trim(), nama: nama, jenis: jn,
      awal: num_(x[I.awal]), masuk: num_(x[I.masuk]), pakai: num_(x[I.pakai]), ret: num_(x[I.ret]), akhir: num_(x[I.akhir]),
      cat: String(x[I.cat] || '').trim() };
    o.act = o.awal + o.masuk + o.pakai + o.ret + o.akhir;
    var k = p + '|' + nama.toUpperCase();
    if (map[k]) { dup++; if (o.act > map[k].act) map[k] = o; } // salinan periode lama: simpan yang berisi data
    else map[k] = o;
  }
  var rows = Object.keys(map).map(function (k) { return map[k]; });

  // Jenis & kode kimia di sheet kadang bergeser: pakai nilai terbanyak per nama
  var vote = function (f) {
    var t = {}, best = {};
    rows.forEach(function (o) { var n = o.nama.toUpperCase(); t[n] = t[n] || {}; if (o[f]) t[n][o[f]] = (t[n][o[f]] || 0) + 1; });
    Object.keys(t).forEach(function (n) { best[n] = Object.keys(t[n]).sort(function (a, b) { return t[n][b] - t[n][a]; })[0] || ''; });
    return best;
  };
  var bj = vote('jenis'), bk = vote('kode');
  rows.forEach(function (o) { var n = o.nama.toUpperCase(); o.jenis = bj[n] || o.jenis; o.kode = bk[n] || o.kode; });

  // Validasi: rumus stok & kesinambungan antar bulan
  rows.sort(function (a, b) { return a.p < b.p ? -1 : a.p > b.p ? 1 : 0; });
  var prev = {};
  rows.forEach(function (o) {
    var n = o.nama.toUpperCase();
    o.sel = r2_(o.akhir - (o.awal + o.masuk - o.pakai - o.ret));
    o.beda = prev[n] === undefined ? null : r2_(o.awal - prev[n]);
    prev[n] = o.akhir;
    delete o.act;
  });
  return { status: 'success', total: rows.length, dup: dup, updated: new Date().toISOString(), data: rows };
}
