/**
 * FBT Freshers Party 2026 - QR Check-in API
 * Sheet layout: header row 4, data from row 5
 * A Pass ID | B Full Name | C Roll Number | D Dept/Batch | E Contact | F Ticket Type
 * G Check-in Status | H Gate Check-in Time | I QR Code | J Notes
 */

const KEY = 'FBT2026';        // <-- apni marzi ka secret code rakh lein (scanner.html mein bhi same likhna hai)
const HEADER_ROWS = 4;
const COL = { ID: 1, NAME: 2, ROLL: 3, DEPT: 4, CONTACT: 5, TYPE: 6, STATUS: 7, TIME: 8 };

function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.key !== KEY) return out({ result: 'error', message: 'Wrong key' });
  try {
    if (p.action === 'checkin') return out(checkIn(p.id));
    if (p.action === 'stats') return out(stats());
    return out({ result: 'ok', message: 'FBT check-in API is running' });
  } catch (err) {
    return out({ result: 'error', message: String(err) });
  }
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
}

function checkIn(rawId) {
  // QR mein "PassID|Name|Contact|Type" hota hai, hum sirf Pass ID lete hain
  const id = String(rawId || '').split('|')[0].trim().toUpperCase();
  if (!id) return { result: 'error', message: 'Empty QR' };

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sh = getSheet();
    const last = sh.getLastRow();
    if (last <= HEADER_ROWS) return { result: 'notfound', id: id };

    const ids = sh.getRange(HEADER_ROWS + 1, COL.ID, last - HEADER_ROWS, 1).getValues();
    let rowIndex = -1;
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]).trim().toUpperCase() === id) { rowIndex = HEADER_ROWS + 1 + i; break; }
    }
    if (rowIndex === -1) return { result: 'notfound', id: id };

    const row = sh.getRange(rowIndex, 1, 1, COL.TIME).getValues()[0];
    const info = {
      id: row[COL.ID - 1],
      name: row[COL.NAME - 1],
      roll: row[COL.ROLL - 1],
      dept: row[COL.DEPT - 1],
      contact: row[COL.CONTACT - 1],
      type: row[COL.TYPE - 1]
    };
    const tz = SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone();

    if (String(row[COL.STATUS - 1]).trim() === 'Checked In') {
      const t = row[COL.TIME - 1];
      info.time = (t instanceof Date) ? Utilities.formatDate(t, tz, 'HH:mm:ss') : String(t);
      info.result = 'already';
      return info;
    }

    const now = new Date();
    sh.getRange(rowIndex, COL.STATUS).setValue('Checked In');
    sh.getRange(rowIndex, COL.TIME).setNumberFormat('HH:mm:ss').setValue(now);
    SpreadsheetApp.flush();
    info.time = Utilities.formatDate(now, tz, 'HH:mm:ss');
    info.result = 'ok';
    return info;
  } finally {
    lock.releaseLock();
  }
}

function stats() {
  const sh = getSheet();
  const last = sh.getLastRow();
  if (last <= HEADER_ROWS) return { result: 'ok', total: 0, checked: 0 };
  const vals = sh.getRange(HEADER_ROWS + 1, 1, last - HEADER_ROWS, COL.STATUS).getValues();
  let total = 0, checked = 0;
  vals.forEach(r => {
    if (String(r[COL.ID - 1]).trim() !== '') {
      total++;
      if (String(r[COL.STATUS - 1]).trim() === 'Checked In') checked++;
    }
  });
  return { result: 'ok', total: total, checked: checked };
}
