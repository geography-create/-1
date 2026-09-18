// 보드 칸과 지수 계열의 이름표. 컴포넌트 파일 밖으로 빼 두어야
// 파일 하나가 컴포넌트만 내보내는 규칙(fast refresh)을 지킬 수 있다.

import type { Cell } from "../data/city.ts";

export const COL_LABELS = ["가", "나", "다", "라", "마", "바", "사", "아", "자"];

/** "다4" 처럼 사람이 부르기 쉬운 칸 이름. */
export function cellName(cell: Cell): string {
  return `${COL_LABELS[cell.col]}${cell.row + 1}`;
}

export const SERIES = [
  { key: "social", name: "사회", color: "var(--social)" },
  { key: "economy", name: "경제", color: "var(--economy)" },
  { key: "environment", name: "환경", color: "var(--environment)" },
] as const;

/** 받침 유무에 따라 조사를 고른다. "근린상가를", "산업단지를", "공장을". */
export function josa(word: string, withJong: string, withoutJong: string): string {
  const last = word.charCodeAt(word.length - 1);
  if (Number.isNaN(last) || last < 0xac00 || last > 0xd7a3) return withoutJong;
  return (last - 0xac00) % 28 === 0 ? withoutJong : withJong;
}

/** 네 생활권을 지도 위에서 구분하는 색. 세 지수(사회·경제·환경)의 색과 겹치지 않게 골랐다. */
export const ZONE_COLORS: Record<string, string> = {
  garam: "var(--zone-garam)",
  saedeul: "var(--zone-saedeul)",
  dolmaru: "var(--zone-dolmaru)",
  beodeul: "var(--zone-beodeul)",
};

/** 종이 답안지에서 생활권을 가려내는 한 글자 표식. 색을 못 쓰는 흑백 출력용이다. */
export const ZONE_MARK: Record<string, string> = {
  garam: "가",
  saedeul: "새",
  dolmaru: "돌",
  beodeul: "버",
};
