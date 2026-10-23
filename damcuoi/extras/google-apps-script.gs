/* Lưu "Xác nhận tham dự" + lời chúc của khách vào Google Sheets.
   Cách cài: xem HUONG-DAN.md, mục 4. Dán toàn bộ file này vào Apps Script của bảng tính.
   Muốn ẩn một lời chúc khỏi trang cưới: gõ x vào cột "Ẩn lời chúc" của dòng đó. */

const SHEET_NAME = 'Xác nhận';
const HEADERS = ['Thời gian', 'Tên', 'Tham dự', 'Số người', 'Khách bên', 'Lời chúc', 'Mã khách', 'Ẩn lời chúc (gõ x)'];

// Trang cưới gửi câu trả lời về đây.
function doPost(e) {
  const p = (e && e.parameter) || {};
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    sheet_().appendRow([
      new Date(),
      safe_(p.name, 80),
      p.attend === 'no' ? 'Không' : 'Có',
      Math.min(Math.max(parseInt(p.count, 10) || 1, 1), 20),
      safe_(p.side, 20),
      safe_(p.message, 500),
      safe_(p.guest_key, 40),
      '',
    ]);
  } finally {
    lock.releaseLock();
  }
  return json_({ ok: true });
}

// Trang cưới đọc danh sách lời chúc (bỏ qua dòng đã đánh dấu ẩn).
function doGet(e) {
  if (!e || !e.parameter || e.parameter.action !== 'wishes') return json_({ ok: true });
  const rows = sheet_().getDataRange().getValues().slice(1);
  const wishes = rows
    .filter((r) => String(r[5]).trim() && !String(r[7]).trim())
    .slice(-80)
    .reverse()
    .map((r) => ({ name: String(r[1]), message: String(r[5]) }));
  return json_(wishes);
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Chặn chữ bắt đầu bằng = + - @ để không ai chèn được công thức vào bảng tính.
function safe_(v, max) {
  const s = String(v == null ? '' : v).slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
