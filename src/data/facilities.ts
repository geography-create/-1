// 학생이 격자 위에 놓는 도시 시설 카드.
// 비용과 세 지수(사회·경제·환경) 효과, 그리고 배치 선행 조건을 여기서 정한다.

import type { Cell } from "./city.ts";

export type FacilityId =
  | "publicHousing"
  | "apartment"
  | "industrial"
  | "logistics"
  | "shops"
  | "mall"
  | "brt"
  | "sewage"
  | "forest"
  | "wetland"
  | "welfare"
  | "school"
  | "basin";

export type FacilityGroup = "주거" | "산업" | "상업" | "기반" | "녹지" | "공공" | "방재";

export interface Facility {
  id: FacilityId;
  name: string;
  group: FacilityGroup;
  /** 보드 위 칸에 찍히는 한 글자. 색만으로 구분하지 않기 위해 반드시 붙인다. */
  glyph: string;
  cost: number;
  effect: { social: number; economy: number; environment: number };
  note: string;
  /** 하천 인접 칸에만 놓을 수 있는 시설인지. */
  riversideOnly?: boolean;
  /** 녹지로 세는 시설인지(도시 숲 연결성과 폭염 판정에 쓰인다). */
  green?: boolean;
  /** 집중호우 때 물을 받아주는 정도. */
  floodDefense?: number;
}

export const FACILITIES: Facility[] = [
  {
    id: "publicHousing",
    name: "공공임대주택",
    group: "주거",
    glyph: "임",
    cost: 12,
    effect: { social: 3, economy: 1, environment: -1 },
    note: "집값 걱정 없이 오래 살 수 있는 집이 생긴다. 그만큼 땅은 덮인다.",
  },
  {
    id: "apartment",
    name: "민간 아파트 단지",
    group: "주거",
    glyph: "아",
    cost: 10,
    effect: { social: 1, economy: 3, environment: -2 },
    note: "세수와 지가가 오른다. 원래 살던 세입자가 밀려날 수 있다.",
  },
  {
    id: "industrial",
    name: "산업단지",
    group: "산업",
    glyph: "공",
    cost: 16,
    effect: { social: -1, economy: 6, environment: -4 },
    note: "일자리가 크게 늘지만 같은 생활권에 하수·빗물처리시설이 먼저 있어야 한다.",
  },
  {
    id: "logistics",
    name: "물류창고",
    group: "산업",
    glyph: "물",
    cost: 8,
    effect: { social: -1, economy: 3, environment: -2 },
    note: "간선도로·BRT 정류장에 맞닿은 칸에만 놓을 수 있다.",
  },
  {
    id: "shops",
    name: "근린상가",
    group: "상업",
    glyph: "상",
    cost: 6,
    effect: { social: 2, economy: 2, environment: -1 },
    note: "걸어서 장을 볼 수 있게 된다.",
  },
  {
    id: "mall",
    name: "대형복합쇼핑몰",
    group: "상업",
    glyph: "몰",
    cost: 14,
    effect: { social: 1, economy: 5, environment: -3 },
    note: "매출이 몰린다. 같은 생활권 근린상가의 경제 효과가 절반으로 줄어든다.",
  },
  {
    id: "brt",
    name: "간선도로·BRT 정류장",
    group: "기반",
    glyph: "차",
    cost: 9,
    effect: { social: 3, economy: 2, environment: -1 },
    note: "정류장이 하나도 없는 생활권은 교통 소외로 사회 지수가 깎인다.",
  },
  {
    id: "sewage",
    name: "하수·빗물처리시설",
    group: "기반",
    glyph: "수",
    cost: 11,
    effect: { social: 1, economy: 0, environment: 4 },
    note: "하천 인접 칸에 놓으면 환경 +2를 더 받는다. 산업단지의 선행 조건이다.",
    floodDefense: 2,
  },
  {
    id: "forest",
    name: "도시 숲",
    group: "녹지",
    glyph: "숲",
    cost: 7,
    effect: { social: 2, economy: 0, environment: 4 },
    note: "다른 녹지와 맞닿게 놓으면 환경 +2를 더 받는다.",
    green: true,
    floodDefense: 1,
  },
  {
    id: "wetland",
    name: "하천 둔치 습지 복원",
    group: "녹지",
    glyph: "습",
    cost: 8,
    effect: { social: 1, economy: -1, environment: 5 },
    note: "하천과 맞닿은 칸에만 놓을 수 있다. 하천 생태와 물난리 모두에 가장 크게 기여한다.",
    riversideOnly: true,
    green: true,
    floodDefense: 2,
  },
  {
    id: "welfare",
    name: "보건·복지센터",
    group: "공공",
    glyph: "복",
    cost: 10,
    effect: { social: 5, economy: 0, environment: 0 },
    note: "보건·복지센터도 학교도 없는 생활권은 공공서비스 소외로 사회 지수가 깎인다.",
  },
  {
    id: "school",
    name: "학교·평생학습관",
    group: "공공",
    glyph: "학",
    cost: 12,
    effect: { social: 4, economy: 1, environment: 0 },
    note: "아이와 어르신이 함께 쓰는 배움터. 공공서비스 소외를 막아 준다.",
  },
  {
    id: "basin",
    name: "빗물 저류지",
    group: "방재",
    glyph: "저",
    cost: 9,
    effect: { social: 2, economy: -1, environment: 2 },
    note: "집중호우 때 가장 확실한 방어 수단이다. 저지대에 놓아야 제값을 한다.",
    floodDefense: 3,
  },
];

export const FACILITY_BY_ID: Record<FacilityId, Facility> = Object.fromEntries(
  FACILITIES.map((f) => [f.id, f]),
) as Record<FacilityId, Facility>;

/** 칸 자체의 조건만으로 판단할 수 있는 배치 가능 여부. 선행 조건은 engine에서 따로 본다. */
export function terrainAllows(facility: Facility, cell: Cell): string | null {
  if (cell.terrain === "river") return "하천 칸에는 시설을 놓을 수 없습니다.";
  if (facility.riversideOnly && !cell.riverside)
    return "하천과 맞닿은 칸에만 놓을 수 있는 시설입니다.";
  return null;
}
