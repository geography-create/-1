// 승기천 정비 시뮬레이터 — 학생 제출 결과를 구글 시트에 기록하는 Apps Script
//
// 사용 방법은 저장소 루트의 README.md "교사용 대시보드 설정" 항목을 참고하세요.
// 요약: 구글 시트를 새로 만들고 확장 프로그램 > Apps Script에 이 파일 내용을 붙여넣은 뒤
// 웹 앱으로 배포하면, 배포 시 발급되는 URL을 웹앱의 VITE_SHEET_WEBHOOK_URL 값으로 쓰면 됩니다.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "제출시각",
      "반",
      "번호",
      "이름",
      "관점",
      "안별 선택 이유 메모",
      "최종 선택 이유(비교)",
      "실제 배치 결과(관점)",
      "실제 배치 결과(수치 0~100)",
      "한 줄 성찰",
      "칭호",
      "발동한 시너지",
    ]);
  }

  var data = JSON.parse(e.postData.contents);

  sheet.appendRow([
    new Date(),
    data.classNo || "",
    data.studentNo || "",
    data.name || "",
    data.perspective || "",
    data.reasonNote || "",
    data.finalReason || "",
    data.actualPerspective || "",
    data.actualPosition ?? "",
    data.reflection || "",
    data.badge || "",
    data.synergySummary || "",
  ]);

  return ContentService.createTextOutput(
    JSON.stringify({ result: "ok" }),
  ).setMimeType(ContentService.MimeType.JSON);
}
