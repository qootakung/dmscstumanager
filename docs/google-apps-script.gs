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
 *    (URL ปัจจุบันที่ใช้อยู่:
 *     https://script.google.com/macros/s/AKfycbw7Ujpowe1C57qpV_M7ADlcDSm39RKatMp-FwtbJVE9HLe11G87Y5sJXHlD182O0Jr5/exec)
 */

const SHEET_ID = '16WWGVsNOpLnutgi-rcPAWuovYTkvb0vP_U0Q_Nos-alByKGHWTv3Q0X5';
const SHEET_NAME = 'uppic';
const DRIVE_FOLDER_ID = '1Ca0K1iIezJGO65aFFsMangrAwDIe9sx3';

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    let photoUrl = '';
    if (body.photoBase64 && body.photoMimeType) {
      const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
      const bytes = Utilities.base64Decode(body.photoBase64);
      const fileName = body.photoFileName ||
        (body.studentId + '_' + new Date().getTime() + '.jpg');
      const blob = Utilities.newBlob(bytes, body.photoMimeType, fileName);
      const file = folder.createFile(blob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      photoUrl = 'https://drive.google.com/uc?export=view&id=' + file.getId();
    }

    const ss = SpreadsheetApp.openById(SHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        'วันที่บันทึก','เลขประจำตัวนักเรียน','เลขบัตรประชาชน',
        'ชื่อ-นามสกุล','ชื่อเล่น','เบอร์โทร',
        'ระดับชั้น','ปีการศึกษา','รูปภาพ (URL)'
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
      photoUrl
    ];

    if (rowIndex > 0) {
      // ถ้าไม่มีรูปใหม่ ให้คงรูปเดิมไว้
      if (!photoUrl) row[8] = data[rowIndex - 1][8] || '';
      sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', photoUrl: photoUrl }))
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