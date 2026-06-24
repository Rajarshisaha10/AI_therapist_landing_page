/**
 * TheraSeek waitlist — Google Apps Script backend
 * Receives form POSTs and appends each signup as a row in the bound Sheet.
 *
 * SETUP (one time, ~3 min):
 *  1. Create a Google Sheet (e.g. "TheraSeek Waitlist").
 *  2. Extensions → Apps Script. Delete the default code, paste THIS file.
 *  3. Click Deploy → New deployment → type: Web app.
 *       - Description: theraseek waitlist
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Deploy → authorize when prompted → copy the "Web app URL".
 *  4. Paste that URL into website/config.js  (WAITLIST_ENDPOINT).
 *  5. To change later: Deploy → Manage deployments → edit → New version.
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = (data.email || '').trim();
    if (!email) return _json({ ok: false, error: 'no email' });

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Email', 'Source']);
    }
    sheet.appendRow([new Date(), email, data.source || 'landing']);
    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return _json({ ok: true, msg: 'TheraSeek waitlist is live' });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
