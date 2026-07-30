// 정리 화면 제출을 구글 시트(Apps Script 웹 앱)로 전송하는 도우미.
// 설정 방법은 README.md의 "교사용 대시보드 설정"을 참고하세요.

export interface SubmissionPayload {
  classNo: string;
  studentNo: string;
  name: string;
  perspective: string;
  reasonNote: string;
  finalReason: string;
  reflection: string;
  badge: string;
  synergySummary: string;
}

const ENDPOINT = import.meta.env.VITE_SHEET_WEBHOOK_URL as string | undefined;

export function isSubmissionConfigured(): boolean {
  return Boolean(ENDPOINT);
}

// Apps Script 웹 앱은 브라우저에서 보낸 요청의 응답을 CORS 때문에 읽을 수 없어서
// no-cors로 전송한다. 즉 실제 기록 성공 여부는 이 함수의 반환값으로 알 수 없고,
// 네트워크 요청 자체가 실패했는지만 확인할 수 있다.
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
    // 개발자 도구 콘솔에서 실패 원인을 확인할 수 있도록 남겨둔다(교사에게는 노출되지 않음).
    console.error("[승기천 시뮬레이터] 구글 시트 전송 실패:", err);
    return false;
  }
}
