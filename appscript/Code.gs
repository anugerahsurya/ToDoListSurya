// ============================================================
// APLIKASI MANAJEMEN KEGIATAN — Google Apps Script Backend
// ============================================================
// Deploy sebagai: Web App
//   - Execute as: Me
//   - Who has access: Anyone (atau Anyone with Google account)
//
// Struktur Spreadsheet:
//   Sheet "Kegiatan": id | nama | deskripsi | deadline | createdAt | status
//   Sheet "Subtask":  id | kegiatanId | nama | selesai | buktiFotoUrl | updatedAt | urutan
// ============================================================

var FOLDER_NAME = 'Aplikasi Manajemen Kegiatan';
var SS_ID = ''; // Isi dengan Spreadsheet ID Anda setelah dibuat

// ── Helper ──────────────────────────────────────────────────
function getSpreadsheet() {
  if (SS_ID) return SpreadsheetApp.openById(SS_ID);
  // Auto-detect: gunakan spreadsheet yang terhubung ke script ini
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getOrCreateSheet(name, headers) {
  var ss = getSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    // Style header
    var headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#636B2F');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
  }
  return sheet;
}

function generateId() {
  return Utilities.getUuid();
}

function nowISO() {
  return new Date().toISOString();
}

function sheetToObjects(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  return data.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) {
      obj[h] = row[i];
    });
    return obj;
  });
}

function getOrCreateDriveFolder() {
  var folders = DriveApp.getFoldersByName(FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(FOLDER_NAME);
}

// ── CORS Headers ────────────────────────────────────────────
function corsResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── doGet Handler ────────────────────────────────────────────
function doGet(e) {
  try {
    var action = e.parameter.action;
    var result;

    if (action === 'getKegiatanList') {
      result = getKegiatanList();
    } else if (action === 'getKegiatanById') {
      result = getKegiatanById(e.parameter.id);
    } else if (action === 'getSubtaskList') {
      result = getSubtaskList(e.parameter.kegiatanId);
    } else {
      result = { error: 'Action tidak dikenal: ' + action };
    }

    return corsResponse(result);
  } catch(err) {
    return corsResponse({ error: err.toString() });
  }
}

// ── doPost Handler ───────────────────────────────────────────
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;
    var result;

    if      (action === 'addKegiatan')    result = addKegiatan(body);
    else if (action === 'updateKegiatan') result = updateKegiatan(body);
    else if (action === 'deleteKegiatan') result = deleteKegiatan(body.id);
    else if (action === 'addSubtask')     result = addSubtask(body);
    else if (action === 'updateSubtask')  result = updateSubtask(body);
    else if (action === 'deleteSubtask')  result = deleteSubtask(body.id);
    else if (action === 'uploadBukti')    result = uploadBukti(body);
    else result = { error: 'Action tidak dikenal: ' + action };

    return corsResponse(result);
  } catch(err) {
    return corsResponse({ error: err.toString() });
  }
}

// ════════════════════════════════════════════════════════════
// KEGIATAN FUNCTIONS
// ════════════════════════════════════════════════════════════
var KEGIATAN_HEADERS = ['id', 'nama', 'deskripsi', 'deadline', 'createdAt', 'status'];

function getKegiatanList() {
  var sheet = getOrCreateSheet('Kegiatan', KEGIATAN_HEADERS);
  var kegiatanList = sheetToObjects(sheet);

  // Hitung progress subtask untuk setiap kegiatan
  var subtaskSheet = getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  var allSubtasks = sheetToObjects(subtaskSheet);

  return kegiatanList.map(function(k) {
    var subs = allSubtasks.filter(function(s) { return s.kegiatanId === k.id; });
    k.totalSubtask = subs.length;
    k.selesaiSubtask = subs.filter(function(s) { return s.selesai === true || s.selesai === 'TRUE'; }).length;
    return k;
  });
}

function getKegiatanById(id) {
  var sheet = getOrCreateSheet('Kegiatan', KEGIATAN_HEADERS);
  var list = sheetToObjects(sheet);
  var found = list.find(function(k) { return k.id === id; });
  if (!found) return { error: 'Kegiatan tidak ditemukan' };

  var subtaskSheet = getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  var allSubtasks = sheetToObjects(subtaskSheet);
  var subs = allSubtasks.filter(function(s) { return s.kegiatanId === id; });
  found.totalSubtask = subs.length;
  found.selesaiSubtask = subs.filter(function(s) { return s.selesai === true || s.selesai === 'TRUE'; }).length;
  return found;
}

function addKegiatan(data) {
  var sheet = getOrCreateSheet('Kegiatan', KEGIATAN_HEADERS);
  var id = generateId();
  var now = nowISO();
  var row = [
    id,
    data.nama || '',
    data.deskripsi || '',
    data.deadline || '',
    now,
    data.status || 'aktif'
  ];
  sheet.appendRow(row);
  return {
    id: id, nama: data.nama, deskripsi: data.deskripsi,
    deadline: data.deadline, createdAt: now,
    status: data.status || 'aktif',
    totalSubtask: 0, selesaiSubtask: 0
  };
}

function updateKegiatan(data) {
  var sheet = getOrCreateSheet('Kegiatan', KEGIATAN_HEADERS);
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idIdx = headers.indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === data.id) {
      KEGIATAN_HEADERS.forEach(function(h, col) {
        if (h !== 'id' && h !== 'createdAt' && data[h] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(data[h]);
        }
      });
      return getKegiatanById(data.id);
    }
  }
  return { error: 'Kegiatan tidak ditemukan' };
}

function deleteKegiatan(id) {
  var sheet = getOrCreateSheet('Kegiatan', KEGIATAN_HEADERS);
  var allData = sheet.getDataRange().getValues();
  var idIdx = allData[0].indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      // Hapus juga semua subtask terkait
      deleteSubtaskByKegiatanId(id);
      return { success: true };
    }
  }
  return { error: 'Kegiatan tidak ditemukan' };
}

// ════════════════════════════════════════════════════════════
// SUBTASK FUNCTIONS
// ════════════════════════════════════════════════════════════
var SUBTASK_HEADERS = ['id', 'kegiatanId', 'nama', 'selesai', 'buktiFotoUrl', 'updatedAt', 'urutan'];

function getSubtaskList(kegiatanId) {
  var sheet = getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  var list = sheetToObjects(sheet);
  return list
    .filter(function(s) { return s.kegiatanId === kegiatanId; })
    .map(function(s) {
      s.selesai = (s.selesai === true || s.selesai === 'TRUE');
      return s;
    })
    .sort(function(a, b) { return (a.urutan || 0) - (b.urutan || 0); });
}

function addSubtask(data) {
  var sheet = getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  var id = generateId();
  var now = nowISO();

  // Hitung urutan berikutnya
  var existing = sheetToObjects(sheet).filter(function(s) { return s.kegiatanId === data.kegiatanId; });
  var urutan = existing.length + 1;

  var row = [
    id,
    data.kegiatanId || '',
    data.nama || '',
    false,
    '',
    now,
    urutan
  ];
  sheet.appendRow(row);
  return { id: id, kegiatanId: data.kegiatanId, nama: data.nama, selesai: false, buktiFotoUrl: '', updatedAt: now, urutan: urutan };
}

function updateSubtask(data) {
  var sheet = getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idIdx = headers.indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === data.id) {
      SUBTASK_HEADERS.forEach(function(h, col) {
        if (h !== 'id' && h !== 'kegiatanId' && data[h] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(
            h === 'updatedAt' ? nowISO() : data[h]
          );
        }
      });
      // Paksa update updatedAt
      var updatedAtIdx = headers.indexOf('updatedAt');
      if (updatedAtIdx >= 0) sheet.getRange(i + 1, updatedAtIdx + 1).setValue(nowISO());
      return { success: true, id: data.id };
    }
  }
  return { error: 'Subtask tidak ditemukan' };
}

function deleteSubtask(id) {
  var sheet = getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  var allData = sheet.getDataRange().getValues();
  var idIdx = allData[0].indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Subtask tidak ditemukan' };
}

function deleteSubtaskByKegiatanId(kegiatanId) {
  var sheet = getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  var allData = sheet.getDataRange().getValues();
  var kegiatanIdIdx = allData[0].indexOf('kegiatanId');

  // Hapus dari bawah ke atas
  for (var i = allData.length - 1; i >= 1; i--) {
    if (allData[i][kegiatanIdIdx] === kegiatanId) {
      sheet.deleteRow(i + 1);
    }
  }
  return { success: true };
}

// ════════════════════════════════════════════════════════════
// UPLOAD BUKTI (Google Drive)
// ════════════════════════════════════════════════════════════
function uploadBukti(data) {
  try {
    var folder = getOrCreateDriveFolder();
    var base64Data = data.base64;
    var filename = data.filename || ('bukti_' + new Date().getTime() + '.png');

    // Hapus prefix data URL jika ada (e.g. "data:image/png;base64,")
    if (base64Data.indexOf(',') > -1) {
      base64Data = base64Data.split(',')[1];
    }

    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, 'image/png', filename);

    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    var fileId = file.getId();
    var viewUrl = 'https://drive.google.com/uc?id=' + fileId + '&export=view';

    // Update subtask jika ada subtaskId
    if (data.subtaskId) {
      updateSubtask({ id: data.subtaskId, buktiFotoUrl: viewUrl });
    }

    return { success: true, url: viewUrl, fileId: fileId };
  } catch(err) {
    return { error: 'Upload gagal: ' + err.toString() };
  }
}

// ════════════════════════════════════════════════════════════
// SETUP FUNCTION — Jalankan sekali untuk inisialisasi
// ════════════════════════════════════════════════════════════
function setupSpreadsheet() {
  getOrCreateSheet('Kegiatan', KEGIATAN_HEADERS);
  getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  Logger.log('Setup selesai! Spreadsheet ID: ' + getSpreadsheet().getId());
}
