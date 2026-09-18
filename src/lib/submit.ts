// 최종 제출을 구글 시트(Apps Script 웹 앱)로 보내는 도우미.
// 설정 방법은 README.md의 "교사용 결과 수합 설정"을 참고하세요.

export interface SubmissionPayload {
  classNo: string;
  studentNo: string;
  name: string;
  /** 배치한 시설을 "칸(행,열) 시설명" 형태로 이어붙인 문자열. */
  placementText: string;
  spent: number;
  placedCount: number;
  zoneSummary: string;
  gap: number;
  gapLevel: string;
  worstZone: string;
  bestZone: string;
  nonHumanSummary: string;
  eventSummary: string;
  q1: string;
  q2: string;
  q3: string;
  /** 학생이 스스로 체크한 자기점검 항목 수 / 전체. */
  selfCheck: string;
}

const ENDPOINT = import.meta.env.VITE_SHEET_WEBHOOK_URL as string | undefined;

export function isSubmissionConfigured(): boolean {
  return Boolean(ENDPOINT);
}

// Apps Script 웹 앱은 CORS 때문에 브라우저에서 응답을 읽을 수 없다. 그래서 no-cors로
// 보내고, 실제 기록 여부는 선생님이 시트를 열어 확인해야 한다.
export async function submitToSheet(payload: SubmissionPayload): Promise<boolean> {
  if (!ENDPOINT) return false;
  try {
    await fetch(ENDPOINT, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (err) {
    console.error("[한여울시] 구글 시트 전송 실패:", err);
    return false;
  }
}
