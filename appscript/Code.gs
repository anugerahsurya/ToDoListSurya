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
    } else if (action === 'getProgresList') {
      result = getProgresList();
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
    else if (action === 'addProgresItem') result = addProgresItem(body);
    else if (action === 'updateProgresItem') result = updateProgresItem(body);
    else if (action === 'deleteProgresItem') result = deleteProgresItem(body.id);
    else if (action === 'uploadBuktiProgres') result = uploadBuktiProgres(body);
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
// PROGRES RANCANGAN AKTUALISASI
// ════════════════════════════════════════════════════════════
var PROGRES_HEADERS = [
  'id', 'noKegiatan', 'kegiatan', 'noTahapan', 'tahapanKegiatan', 'outputHasil',
  'mingguAwal', 'mingguAkhir', 'deadlineText', 'deadlineStart', 'deadlineEnd',
  'bentukBukti', 'statusSubmit', 'buktiUrl', 'buktiType', 'createdAt', 'updatedAt'
];

var PROGRES_FOLDER_NAME = 'Rancangan Aktualisasi Surya';

function getOrCreateProgresFolders() {
  var baseFolders = DriveApp.getFoldersByName(PROGRES_FOLDER_NAME);
  var baseFolder;
  if (baseFolders.hasNext()) {
    baseFolder = baseFolders.next();
  } else {
    baseFolder = DriveApp.createFolder(PROGRES_FOLDER_NAME);
  }

  var getOrCreateSub = function(parent, name) {
    var subs = parent.getFoldersByName(name);
    if (subs.hasNext()) return subs.next();
    return parent.createFolder(name);
  };

  return {
    base: baseFolder,
    gambar: getOrCreateSub(baseFolder, 'Gambar'),
    pdf: getOrCreateSub(baseFolder, 'PDF'),
    link: getOrCreateSub(baseFolder, 'Link')
  };
}

function getProgresList() {
  var sheet = getOrCreateSheet('ProgresAktualisasi', PROGRES_HEADERS);
  var list = sheetToObjects(sheet);
  return list.map(function(item, idx) {
    // If noTahapan is a Date or ISO string
    if (item.noTahapan instanceof Date) {
      item.noTahapan = item.noKegiatan ? (item.noKegiatan + '.' + item.noTahapan.getDate()) : String(idx + 1);
    } else if (typeof item.noTahapan === 'string' && item.noTahapan.indexOf('T') > -1 && item.noTahapan.indexOf('Z') > -1) {
      item.noTahapan = item.noKegiatan ? (item.noKegiatan + '.' + (idx + 1)) : String(idx + 1);
    }
    // Clean deadlineStart and deadlineEnd
    if (item.deadlineStart instanceof Date) {
      item.deadlineStart = Utilities.formatDate(item.deadlineStart, 'Asia/Jakarta', 'yyyy-MM-dd');
    }
    if (item.deadlineEnd instanceof Date) {
      item.deadlineEnd = Utilities.formatDate(item.deadlineEnd, 'Asia/Jakarta', 'yyyy-MM-dd');
    }
    return item;
  });
}

function addProgresItem(data) {
  var sheet = getOrCreateSheet('ProgresAktualisasi', PROGRES_HEADERS);
  var id = generateId();
  var now = nowISO();
  var row = [
    id,
    data.noKegiatan || '',
    data.kegiatan || '',
    data.noTahapan || '',
    data.tahapanKegiatan || '',
    data.outputHasil || '',
    data.mingguAwal || '',
    data.mingguAkhir || '',
    data.deadlineText || '',
    data.deadlineStart || '',
    data.deadlineEnd || '',
    data.bentukBukti || '',
    data.statusSubmit || 'Belum Submit',
    data.buktiUrl || '',
    data.buktiType || '',
    now,
    now
  ];
  sheet.appendRow(row);
  return { id: id, success: true };
}

function updateProgresItem(data) {
  var sheet = getOrCreateSheet('ProgresAktualisasi', PROGRES_HEADERS);
  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var idIdx = headers.indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === data.id) {
      PROGRES_HEADERS.forEach(function(h, col) {
        if (h !== 'id' && h !== 'createdAt' && data[h] !== undefined) {
          sheet.getRange(i + 1, col + 1).setValue(
            h === 'updatedAt' ? nowISO() : data[h]
          );
        }
      });
      // Force update updatedAt if not provided in payload but we updated something
      var updatedAtIdx = headers.indexOf('updatedAt');
      if (updatedAtIdx >= 0 && data.updatedAt === undefined) {
        sheet.getRange(i + 1, updatedAtIdx + 1).setValue(nowISO());
      }
      return { success: true, id: data.id };
    }
  }
  return { error: 'Progres tidak ditemukan' };
}

function deleteProgresItem(id) {
  var sheet = getOrCreateSheet('ProgresAktualisasi', PROGRES_HEADERS);
  var allData = sheet.getDataRange().getValues();
  var idIdx = allData[0].indexOf('id');

  for (var i = 1; i < allData.length; i++) {
    if (allData[i][idIdx] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { error: 'Progres tidak ditemukan' };
}

function uploadBuktiProgres(data) {
  try {
    var folders = getOrCreateProgresFolders();
    var folder;
    
    if (data.buktiType === 'pdf') {
      folder = folders.pdf;
    } else if (data.buktiType === 'link') {
      folder = folders.link;
    } else {
      folder = folders.gambar;
    }

    // Format nama file <No. Tahapan>-<Nama Tahapan Kegiatan>
    var filename = data.filename || ('bukti_' + new Date().getTime());
    var viewUrl = '';
    var fileId = '';

    if (data.buktiType === 'link') {
      // Untuk link, kita buat file txt
      var file = folder.createFile(filename + '.txt', data.url || data.base64);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileId = file.getId();
      viewUrl = 'https://drive.google.com/uc?id=' + fileId + '&export=view';
    } else {
      var base64Data = data.base64;
      if (base64Data.indexOf(',') > -1) {
        base64Data = base64Data.split(',')[1];
      }
      var decoded = Utilities.base64Decode(base64Data);
      var mimeType = data.buktiType === 'pdf' ? 'application/pdf' : 'image/png';
      
      // Pastikan ada ekstensi di filename
      if (data.buktiType === 'pdf' && !filename.toLowerCase().endsWith('.pdf')) {
        filename += '.pdf';
      } else if (data.buktiType === 'image' && !filename.toLowerCase().endsWith('.png') && !filename.toLowerCase().endsWith('.jpg') && !filename.toLowerCase().endsWith('.jpeg')) {
        filename += '.png'; // default fallback for image
      }

      var blob = Utilities.newBlob(decoded, mimeType, filename);
      var file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      fileId = file.getId();
      viewUrl = 'https://drive.google.com/uc?id=' + fileId + '&export=view';
    }

    if (data.progresId) {
      updateProgresItem({
        id: data.progresId,
        buktiUrl: viewUrl,
        buktiType: data.buktiType,
        statusSubmit: 'Sudah Submit'
      });
    }

    return { success: true, url: viewUrl, fileId: fileId };
  } catch(err) {
    return { error: 'Upload gagal: ' + err.toString() };
  }
}

// ════════════════════════════════════════════════════════════
// SEED PROGRES (Jalankan sekali)
// ════════════════════════════════════════════════════════════
function seedProgresData() {
  var sheet = getOrCreateSheet('ProgresAktualisasi', PROGRES_HEADERS);
  // Clear if not empty except headers
  if (sheet.getLastRow() > 1) {
    sheet.deleteRows(2, sheet.getLastRow() - 1);
  }

  var dataToSeed = [
    { noKeg: 1, keg: 'Identifikasi kebutuhan pengembangan dashboard web', noTahap: '1.1', tahap: 'Mempelajari mekanisme pengelolaan Data Tunggal Sosial Ekonomi Nasional (DTSEN) dan PODES', out: 'Catatan hasil mempelajari mekanisme pengelolaan DTSEN dan PODES', startWeek: 'III', endWeek: 'IV', dlText: '17 – 22 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-22' },
    { noKeg: 1, keg: 'Identifikasi kebutuhan pengembangan dashboard web', noTahap: '1.2', tahap: 'Memahami metadata DTSEN dan PODES serta mengidentifikasi masalah yang muncul dalam pengelolaannya', out: 'Catatan metadata untuk data yang digunakan serta rincian masalah pengelolaan DTSEN saat ini dan kemungkinan masalah di kemudian hari', startWeek: 'III', endWeek: 'IV', dlText: '17 – 22 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-22' },
    { noKeg: 1, keg: 'Identifikasi kebutuhan pengembangan dashboard web', noTahap: '1.3', tahap: 'Melakukan identifikasi kebutuhan pengguna bersama mentor dan subject matter', out: 'Ringkasan terkait kebutuhan pengguna', startWeek: 'III', endWeek: 'IV', dlText: '17 – 22 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-22' },
    { noKeg: 1, keg: 'Identifikasi kebutuhan pengembangan dashboard web', noTahap: '1.4', tahap: 'Menyusun dokumen kebutuhan sistem', out: 'Catatan mengenai dokumen kebutuhan sistem', startWeek: 'III', endWeek: 'IV', dlText: '17 – 22 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-22' },
    
    { noKeg: 2, keg: 'Merancang kebutuhan dashboard', noTahap: '2.1', tahap: 'Identifikasi fitur yang akan dikembangkan', out: 'Catatan daftar fitur yang dibutuhkan', startWeek: 'III', endWeek: 'IV', dlText: '17 – 29 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-29' },
    { noKeg: 2, keg: 'Merancang kebutuhan dashboard', noTahap: '2.2', tahap: 'Merancang arsitektur sistem yang akan digunakan', out: 'Kerangka kerja projek', startWeek: 'III', endWeek: 'IV', dlText: '17 – 29 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-29' },
    { noKeg: 2, keg: 'Merancang kebutuhan dashboard', noTahap: '2.3', tahap: 'Merancang basis data sistem', out: 'Rincian mengenai tabel dan nama kolomnya', startWeek: 'III', endWeek: 'IV', dlText: '17 – 29 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-29' },
    { noKeg: 2, keg: 'Merancang kebutuhan dashboard', noTahap: '2.4', tahap: 'Merancang antarmuka dashboard', out: 'Template dashboard yang akan diadaptasi', startWeek: 'III', endWeek: 'IV', dlText: '17 – 29 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-29' },
    { noKeg: 2, keg: 'Merancang kebutuhan dashboard', noTahap: '2.5', tahap: 'Melakukan konsultasi hasil perancangan', out: 'Catatan konsultasi dengan mentor', startWeek: 'III', endWeek: 'IV', dlText: '17 – 29 Agustus 2026', dlStart: '2026-08-17', dlEnd: '2026-08-29' },

    { noKeg: 3, keg: 'Pengembangan Dashboard', noTahap: '3.1', tahap: 'Mengembangkan basis data sistem', out: 'Basis data sistem yang sudah siap digunakan', startWeek: 'IV', endWeek: 'I', dlText: '23 Agustus – 5 September 2026', dlStart: '2026-08-23', dlEnd: '2026-09-05' },
    { noKeg: 3, keg: 'Pengembangan Dashboard', noTahap: '3.2', tahap: 'Mengembangkan backend sistem yang dikembangkan', out: 'Fungsional website yang sudah bekerja', startWeek: 'IV', endWeek: 'I', dlText: '23 Agustus – 5 September 2026', dlStart: '2026-08-23', dlEnd: '2026-09-05' },
    { noKeg: 3, keg: 'Pengembangan Dashboard', noTahap: '3.3', tahap: 'Mengembangkan dashboard visualisasi dan penyajian insight', out: 'Integrasi antarmuka, backend, dan koneksi ke basis data', startWeek: 'IV', endWeek: 'I', dlText: '23 Agustus – 5 September 2026', dlStart: '2026-08-23', dlEnd: '2026-09-05' },
    { noKeg: 3, keg: 'Pengembangan Dashboard', noTahap: '3.4', tahap: 'Konsultasi hasil pengembangan sistem', out: 'Catatan konsultasi dengan mentor', startWeek: 'IV', endWeek: 'I', dlText: '23 Agustus – 5 September 2026', dlStart: '2026-08-23', dlEnd: '2026-09-05' },

    { noKeg: 4, keg: 'Integrasi dan pengujian dashboard yang dikembangkan', noTahap: '4.1', tahap: 'Mengintegrasikan seluruh modul aplikasi', out: 'Tampilan awal dashboard yang sudah selaras seluruh modulnya', startWeek: 'I', endWeek: 'II', dlText: '1 – 12 September 2026', dlStart: '2026-09-01', dlEnd: '2026-09-12' },
    { noKeg: 4, keg: 'Integrasi dan pengujian dashboard yang dikembangkan', noTahap: '4.2', tahap: 'Melakukan pengujian sistem', out: 'Tabel status hasil pengujian sistem', startWeek: 'I', endWeek: 'II', dlText: '1 – 12 September 2026', dlStart: '2026-09-01', dlEnd: '2026-09-12' },
    { noKeg: 4, keg: 'Integrasi dan pengujian dashboard yang dikembangkan', noTahap: '4.3', tahap: 'Melakukan perbaikan bug pada sistem hasil pengujian', out: 'Lembar revisi dari hasil pengujian yang masih error', startWeek: 'I', endWeek: 'II', dlText: '1 – 12 September 2026', dlStart: '2026-09-01', dlEnd: '2026-09-12' },
    { noKeg: 4, keg: 'Integrasi dan pengujian dashboard yang dikembangkan', noTahap: '4.4', tahap: 'Melakukan konsultasi hasil pengujian', out: 'Catatan konsultasi dengan mentor', startWeek: 'I', endWeek: 'II', dlText: '1 – 12 September 2026', dlStart: '2026-09-01', dlEnd: '2026-09-12' },
    { noKeg: 4, keg: 'Integrasi dan pengujian dashboard yang dikembangkan', noTahap: '4.5', tahap: 'Melakukan hosting website', out: 'Website yang sudah bisa diakses secara public', startWeek: 'I', endWeek: 'II', dlText: '1 – 12 September 2026', dlStart: '2026-09-01', dlEnd: '2026-09-12' },

    { noKeg: 5, keg: 'Implementasi dan sosialisasi dashboard yang dikembangkan', noTahap: '5.1', tahap: 'Menyusun pedoman penggunaan aplikasi', out: 'Buku pedoman penggunaan', startWeek: 'II', endWeek: 'II', dlText: '6 – 12 September 2026', dlStart: '2026-09-06', dlEnd: '2026-09-12' },
    { noKeg: 5, keg: 'Implementasi dan sosialisasi dashboard yang dikembangkan', noTahap: '5.2', tahap: 'Menyiapkan bahan tayang penggunaan aplikasi', out: 'Bahan tayang terkait dashboard', startWeek: 'II', endWeek: 'II', dlText: '6 – 12 September 2026', dlStart: '2026-09-06', dlEnd: '2026-09-12' },
    { noKeg: 5, keg: 'Implementasi dan sosialisasi dashboard yang dikembangkan', noTahap: '5.3', tahap: 'Melaksanakan implementasi dan sosialisasi penggunaan aplikasi', out: 'Kegiatan sosialisasi penggunaan aplikasi pada subject matter', startWeek: 'II', endWeek: 'II', dlText: '6 – 12 September 2026', dlStart: '2026-09-06', dlEnd: '2026-09-12' },
    { noKeg: 5, keg: 'Implementasi dan sosialisasi dashboard yang dikembangkan', noTahap: '5.4', tahap: 'Melakukan pendampingan pengguna terkait penggunaan aplikasi', out: 'Bukti Kegiatan Pendampingan', startWeek: 'II', endWeek: 'II', dlText: '6 – 12 September 2026', dlStart: '2026-09-06', dlEnd: '2026-09-12' },

    { noKeg: 6, keg: 'Evaluasi dan penyempurnaan dashboard', noTahap: '6.1', tahap: 'Mengumpulkan umpan balik pengguna', out: 'Response google form dari penggunaan aplikasi oleh user', startWeek: 'II', endWeek: 'III', dlText: '6 – 19 September 2026', dlStart: '2026-09-06', dlEnd: '2026-09-19' },
    { noKeg: 6, keg: 'Evaluasi dan penyempurnaan dashboard', noTahap: '6.2', tahap: 'Melakukan analisis hasil umpan balik pengguna', out: 'Laporan ringkas evaluasi pengguna', startWeek: 'II', endWeek: 'III', dlText: '6 – 19 September 2026', dlStart: '2026-09-06', dlEnd: '2026-09-19' },
    { noKeg: 6, keg: 'Evaluasi dan penyempurnaan dashboard', noTahap: '6.3', tahap: 'Konsultasi dengan mentor terkait hasil analisis pengguna aplikasi', out: 'Catatan konsultasi dengan mentor terkait penyesuaian pada aplikasi', startWeek: 'II', endWeek: 'III', dlText: '6 – 19 September 2026', dlStart: '2026-09-06', dlEnd: '2026-09-19' },
    { noKeg: 6, keg: 'Evaluasi dan penyempurnaan dashboard', noTahap: '6.4', tahap: 'Melakukan penyempurnaan Dashboard Rangkiang', out: 'Dashboard yang sudah dilakukan penyesuaian', startWeek: 'III', endWeek: 'IV', dlText: '13 – 26 September 2026', dlStart: '2026-09-13', dlEnd: '2026-09-26' },
    { noKeg: 6, keg: 'Evaluasi dan penyempurnaan dashboard', noTahap: '6.5', tahap: 'Menyusun Laporan Akhir Aktualisasi', out: 'Laporan Akhir aktualisasi', startWeek: 'III', endWeek: 'IV', dlText: '13 – 26 September 2026', dlStart: '2026-09-13', dlEnd: '2026-09-26' }
  ];

  dataToSeed.forEach(function(d) {
    addProgresItem({
      noKegiatan: d.noKeg,
      kegiatan: d.keg,
      noTahapan: d.noTahap,
      tahapanKegiatan: d.tahap,
      outputHasil: d.out,
      mingguAwal: d.startWeek,
      mingguAkhir: d.endWeek,
      deadlineText: d.dlText,
      deadlineStart: d.dlStart,
      deadlineEnd: d.dlEnd,
      bentukBukti: 'Belum ditentukan',
      statusSubmit: 'Belum Submit'
    });
  });
  
  return { success: true, count: dataToSeed.length };
}

// ════════════════════════════════════════════════════════════
// SETUP FUNCTION — Jalankan sekali untuk inisialisasi
// ════════════════════════════════════════════════════════════
function setupSpreadsheet() {
  getOrCreateSheet('Kegiatan', KEGIATAN_HEADERS);
  getOrCreateSheet('Subtask', SUBTASK_HEADERS);
  getOrCreateSheet('ProgresAktualisasi', PROGRES_HEADERS);
  getOrCreateProgresFolders();
  seedProgresData();
  Logger.log('Setup selesai! Spreadsheet ID: ' + getSpreadsheet().getId());
}
