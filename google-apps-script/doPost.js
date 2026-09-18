// 한여울시 도시 설계 수행평가 — 학생 제출 결과를 구글 시트에 한 줄씩 기록하는 Apps Script
//
// 사용 방법은 저장소 루트 README.md의 "교사용 결과 수합 설정"을 참고하세요.
// 요약: 구글 시트를 새로 만들고 확장 프로그램 > Apps Script에 이 파일 내용을 붙여넣은 뒤
// 웹 앱으로 배포하고, 발급된 URL을 VITE_SHEET_WEBHOOK_URL 값으로 쓰면 됩니다.

var HEADERS = [
  "제출시각",
  "반",
  "번호",
  "이름",
  "쓴 예산",
  "시설 수",
  "배치 내역",
  "생활권별 최종 지수",
  "생활권 격차",
  "격차 수준",
  "혜택 최하 생활권",
  "혜택 최상 생활권",
  "비인간 지표",
  "재난 결과",
  "자기점검",
  "①(지속가능성·회복력) 답안",
  "②(도시에 대한 권리·공공성) 답안",
  "③(시민 참여·한계 인식) 답안",
];

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.classNo || "",
    data.studentNo || "",
    data.name || "",
    data.spent != null ? data.spent : "",
    data.placedCount != null ? data.placedCount : "",
    data.placementText || "",
    data.zoneSummary || "",
    data.gap != null ? data.gap : "",
    data.gapLevel || "",
    data.worstZone || "",
    data.bestZone || "",
    data.nonHumanSummary || "",
    data.eventSummary || "",
    data.selfCheck || "",
    data.q1 || "",
    data.q2 || "",
    data.q3 || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ result: "ok" })
  ).setMimeType(ContentService.MimeType.JSON);
}
