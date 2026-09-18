// 수행평가 도중 새로고침하거나 브라우저를 닫아도 답안이 날아가지 않도록
// 브라우저 안(localStorage)에 자동 저장한다. 서버로 나가는 것은 없다.

import type { Placement } from "./engine.ts";

const KEY = "hanyeoul-urban-design-v1";

export interface Draft {
  placement: Placement;
  answers: { q1: string; q2: string; q3: string };
  /** 서술 문항별 자기점검 체크박스 상태. 키는 "q1-0" 처럼 문항+항목 번호. */
  checks: Record<string, boolean>;
  student: { classNo: string; studentNo: string; name: string };
  step: number;
  submitted: boolean;
  savedAt: string;
}

export const EMPTY_DRAFT: Draft = {
  placement: {},
  answers: { q1: "", q2: "", q3: "" },
  checks: {},
  student: { classNo: "", studentNo: "", name: "" },
  step: 0,
  submitted: false,
  savedAt: "",
};

export function loadDraft(): Draft {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY_DRAFT;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    return {
      ...EMPTY_DRAFT,
      ...parsed,
      placement: parsed.placement ?? {},
      answers: { ...EMPTY_DRAFT.answers, ...parsed.answers },
      checks: parsed.checks ?? {},
      student: { ...EMPTY_DRAFT.student, ...parsed.student },
    };
  } catch {
    // 시크릿 모드 등 저장소를 쓸 수 없는 환경에서도 앱은 그대로 동작해야 한다.
    return EMPTY_DRAFT;
  }
}

export function saveDraft(draft: Omit<Draft, "savedAt">): string {
  const savedAt = new Date().toISOString();
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...draft, savedAt }));
  } catch {
    return "";
  }
  return savedAt;
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 지울 수 없어도 할 수 있는 일이 없다.
  }
}
