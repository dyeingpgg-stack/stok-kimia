/** Mutasi Kimia Dyeing - Backend (Google Apps Script)
 *  Deploy: Deploy > New deployment > Web app > Execute as: Me > Who has access: Anyone
 *  Script Properties (Project Settings): APP_TOKEN (opsional), GEMINI_API_KEY, GEMINI_MODEL (opsional) */
const SHEET_ID = '1permlYdPpNDIpFkugH2tq79y5BKPO70RHgMNBC_IGF4';
const SHEET_NAME = 'MUTASI';
const CK = 'mutasi_v1_', CACHE_TTL = 60, CHUNK = 30000;

function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function prop_(k) { return PropertiesService.getScriptProperties().getProperty(k); }
function authOk_(t) { const need = prop_('APP_TOKEN'); return !need || need === t; }

function doGet(e) {
  try {
    const p = (e && e.parameter) || {};
    if (!authOk_(p.token)) return json_({ status: 'error', message: 'Token tidak valid. Isi token di menu Setting.' });
    let raw = cacheGet_();
    if (!raw) { raw = JSON.stringify(getMutasiData_()); cachePut_(raw); }
    const data = JSON.parse(raw);
    return json_({ status: 'success', total: data.length, data: data });
  } catch (err) { return json_({ status: 'error', message: String(err) }); }
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!authOk_(body.token)) return json_({ status: 'error', message: 'Token tidak valid.' });
    if (body.action !== 'ai') return json_({ status: 'error', message: 'Action tidak dikenal.' });
    const key = prop_('GEMINI_API_KEY');
    if (!key) return json_({ status: 'error', message: 'GEMINI_API_KEY belum diisi di Script Properties.' });
    const model = prop_('GEMINI_MODEL') || 'gemini-3-flash-preview';
    const payload = { contents: [{ parts: [{ text: String(body.prompt || '').slice(0, 20000) }] }] };
    if (body.system) payload.systemInstruction = { parts: [{ text: String(body.system).slice(0, 4000) }] };
    const res = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
      method: 'post', contentType: 'application/json', headers: { 'x-goog-api-key': key },
      payload: JSON.stringify(payload), muteHttpExceptions: true
    });
    const j = JSON.parse(res.getContentText());
    const text = j.candidates && j.candidates[0] && j.candidates[0].content && j.candidates[0].content.parts[0].text;
    if (!text) return json_({ status: 'error', message: (j.error && j.error.message) || 'Respons AI kosong.' });
    return json_({ status: 'success', text: text });
  } catch (err) { return json_({ status: 'error', message: String(err) }); }
}

function cachePut_(s) {
  const c = CacheService.getScriptCache(), n = Math.ceil(s.length / CHUNK), o = {};
  for (let i = 0; i < n; i++) o[CK + i] = s.substr(i * CHUNK, CHUNK);
  o[CK + 'n'] = String(n);
  try { c.putAll(o, CACHE_TTL); } catch (e) {}
}
function cacheGet_() {
  const c = CacheService.getScriptCache(), n = Number(c.get(CK + 'n'));
  if (!n) return null;
  const keys = []; for (let i = 0; i < n; i++) keys.push(CK + i);
  const m = c.getAll(keys); let s = '';
  for (let i = 0; i < n; i++) { if (m[CK + i] == null) return null; s += m[CK + i]; }
  return s;
}

function parseNum_(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = String(val).trim();
  if (str.includes(',') && str.includes('.')) {
    str = str.indexOf('.') < str.indexOf(',') ? str.replace(/\./g, '').replace(',', '.') : str.replace(/,/g, '');
  } else if (str.includes(',')) { str = str.replace(',', '.'); }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

function txt_(v) {
  if (v instanceof Date) return Utilities.formatDate(v, Session.getScriptTimeZone(), 'dd-MM-yyyy');
  return String(v == null ? '' : v).trim();
}

function getMutasiData_() {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan!');
  const rows = sheet.getDataRange().getValues().slice(1);
  const out = [];
  rows.forEach(function (r) {
    const nama = txt_(r[5]);
    if (!nama || nama.toUpperCase() === 'NAMA') return;
    out.push({
      iD: txt_(r[0]), noUrut: r[1] || (out.length + 1), kodeEntry: txt_(r[3]), kodeKimia: txt_(r[4]),
      nama: nama, jenis: txt_(r[6]), uom: txt_(r[7]),
      stockAwal: parseNum_(r[8]), pemasukan: parseNum_(r[9]), pemakaian: parseNum_(r[10]),
      returnVal: parseNum_(r[11]), stockAkhir: parseNum_(r[12]), periode: txt_(r[13])
    });
  });
  return out;
}
