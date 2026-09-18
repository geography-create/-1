// 연습 기록을 브라우저 안에만 저장한다. 서버로 나가는 것은 없고, 개인정보도 받지 않는다.

import type { Placement } from "./engine.ts";

const KEY = "hanyeoul-urban-practice-v2";

/** 나란히 놓고 비교하려고 따로 담아 둔 배치안. */
export interface SavedPlan {
  id: string;
  label: string;
  placement: Placement;
  savedAt: string;
}

export const MAX_PLANS = 3;

export interface Draft {
  placement: Placement;
  answers: { q1: string; q2: string; q3: string };
  checks: Record<string, boolean>;
  plans: SavedPlan[];
  step: number;
  savedAt: string;
}

export const EMPTY_DRAFT: Draft = {
  placement: {},
  answers: { q1: "", q2: "", q3: "" },
  checks: {},
  plans: [],
  step: 0,
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
      plans: Array.isArray(parsed.plans) ? parsed.plans.slice(0, MAX_PLANS) : [],
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
