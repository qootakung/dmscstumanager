/**
 * Google Apps Script — รับข้อมูลนักเรียนรายบุคคลจากแอป DMSC Student Manager
 *
 * วิธีติดตั้ง:
 * 1) เปิด https://script.google.com → New project
 * 2) วางโค้ดนี้ลงในไฟล์ Code.gs
 * 3) Deploy → New deployment → Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4) คัดลอก URL ของ Web app มาใส่ในตัวแปร APPSCRIPT_URL ของหน้าเว็บ
 *    (URL ปัจจุบันที่หน้าเว็บส่งไป:
 *     https://script.google.com/macros/s/AKfycbwQYp7L4Bfc66uofuMB0m3i1N4a7L7dtFykTF3Jpk2i-vdsN65XFpe2JPIxT6nFCz-X0A/exec)
 */

// ไฟล์ Google Sheet ที่ใช้บันทึกข้อมูล: https://docs.google.com/spreadsheets/d/1nvgAyvbHjVVrP3XdNkz3q3lmzholsxthA1qkm5EQAgU/edit
const SHEET_ID = '1nvgAyvbHjVVrP3XdNkz3q3lmzholsxthA1qkm5EQAgU';
const SHEET_NAME = 'uppic';
const DRIVE_FOLDER_ID = '1Ca0K1iIezJGO65aFFsMangrAwDIe9sx3';

function doPost(e) {
  try {
    const rawBody = e && e.postData && e.postData.contents ? e.postData.contents : '';
    const body = rawBody ? JSON.parse(rawBody) : (e.parameter.payload ? JSON.parse(e.parameter.payload) : {});

    let photoUrl = '';
    let photoError = '';
    const cleanPhotoBase64 = body.photoBase64 ? String(body.photoBase64).replace(/^data:[^,]+,/, '').replace(/\s/g, '') : '';
    if (cleanPhotoBase64 && body.photoMimeType) {
      try {
        const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
        const bytes = Utilities.base64Decode(cleanPhotoBase64);
        const safeStudentId = body.studentId || 'student';
        const fileName = body.photoFileName ||
          (safeStudentId + '_' + new Date().getTime() + '.jpg');
        const blob = Utilities.newBlob(bytes, body.photoMimeType, fileName);
        const file = folder.createFile(blob);
        try {
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        } catch (shareErr) {
          photoError = 'อัปโหลดรูปเข้า Drive แล้ว แต่บัญชี/โดเมน Google ไม่อนุญาตให้ตั้งค่าแชร์สาธารณะ: ' + String(shareErr);
        }
        photoUrl = 'https://drive.google.com/file/d/' + file.getId() + '/view';
      } catch (fileErr) {
        photoError = 'บันทึกรูปลง Drive ไม่สำเร็จ: ' + String(fileErr);
      }
    } else if (body.photoBase64 && !body.photoMimeType) {
      photoError = 'มีข้อมูลรูปภาพ แต่ไม่พบชนิดไฟล์รูปภาพ (photoMimeType)';
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'วันที่บันทึก','เลขประจำตัวนักเรียน','เลขบัตรประชาชน',
        'ชื่อ-นามสกุล','ชื่อเล่น','เบอร์โทร',
        'ระดับชั้น','ปีการศึกษา','รูปภาพ (URL)','หมายเหตุรูปภาพ'
      ]);
    }

    // หากมีแถวของนักเรียนคนเดิมอยู่แล้ว ให้อัปเดตทับ
    const data = sheet.getDataRange().getValues();
    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][1]) === String(body.studentId) && body.studentId) {
        rowIndex = i + 1;
        break;
      }
    }

    const row = [
      new Date(),
      body.studentId || '',
      body.citizenId || '',
      body.fullName || '',
      body.nickname || '',
      body.phone || '',
      body.grade || '',
      body.academicYear || '',
      photoUrl,
      photoError
    ];

    if (rowIndex > 0) {
      // ถ้าไม่มีรูปใหม่ ให้คงรูปเดิมไว้
      if (!photoUrl) row[8] = data[rowIndex - 1][8] || '';
      if (!photoError) row[9] = data[rowIndex - 1][9] || '';
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', photoUrl: photoUrl, photoError: photoError, photoBytes: cleanPhotoBase64 ? cleanPhotoBase64.length : 0 }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet() {
  return ContentService.createTextOutput('DMSC uppic endpoint is running.');
}

// ใช้ทดสอบใน Apps Script Editor: เลือกฟังก์ชัน testWrite แล้วกด Run
// ถ้าสำเร็จ จะมีแถว TEST_APPS_SCRIPT เพิ่ม/อัปเดตในชีต uppic และมีไฟล์ TEST_APPS_SCRIPT.png ในโฟลเดอร์ Drive
function testWrite() {
  const result = doPost({
    postData: {
      contents: JSON.stringify({
        studentId: 'TEST_APPS_SCRIPT',
        citizenId: '',
        fullName: 'ทดสอบ Apps Script',
        nickname: 'ทดสอบ',
        phone: '0999999999',
        grade: 'ป.1',
        academicYear: '2567',
        photoBase64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
        photoMimeType: 'image/png',
        photoFileName: 'TEST_APPS_SCRIPT.png'
      })
    },
    parameter: {}
  });
  Logger.log(result.getContent());
}