// 도시 시설 카드.
// 모든 숫자는 학생이 종이에서 손으로 더할 수 있도록 작게 잡았다.
// 비용은 1~3, 지수 효과는 각각 -3~+3 범위를 넘지 않는다.

import type { Cell } from "./city.ts";

export type FacilityId =
  // 학생이 놓을 수 있는 시설
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
  | "basin"
  // 처음부터 깔려 있어 지울 수 없는 기존 시가지
  | "oldHousing"
  | "oldFactory";

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
  /** 기존 시가지 전용. 팔레트에 뜨지 않고 학생이 지울 수도 없다. */
  fixedOnly?: boolean;
  /** 하천 인접 칸에만 놓을 수 있는 시설인지. */
  riversideOnly?: boolean;
  /** 녹지로 세는 시설인지(폭염 판정과 도시 숲 지표에 쓰인다). */
  green?: boolean;
  /** 주거로 세는 시설인지(산업과 맞닿으면 사회 지수가 깎인다). */
  housing?: boolean;
  /** 산업으로 세는 시설인지. */
  industry?: boolean;
  /** 녹지가 아니면서 집중호우 때 물을 받아주는 시설의 기여분. */
  floodDefense?: number;
}

export const FACILITIES: Facility[] = [
  {
    id: "publicHousing",
    name: "공공임대주택",
    group: "주거",
    glyph: "임",
    cost: 2,
    effect: { social: 2, economy: 1, environment: -1 },
    note: "집값 걱정 없이 오래 살 수 있는 집. 그만큼 땅은 덮인다.",
    housing: true,
  },
  {
    id: "apartment",
    name: "민간 아파트",
    group: "주거",
    glyph: "아",
    cost: 2,
    effect: { social: 0, economy: 2, environment: -1 },
    note: "세수와 지가가 오른다. 원래 살던 세입자가 밀려날 수 있다.",
    housing: true,
  },
  {
    id: "industrial",
    name: "산업단지",
    group: "산업",
    glyph: "산",
    cost: 3,
    effect: { social: -1, economy: 3, environment: -2 },
    note: "일자리가 크게 는다. 같은 생활권에 하수·빗물처리시설이 먼저 있어야 한다.",
    industry: true,
  },
  {
    id: "logistics",
    name: "물류창고",
    group: "산업",
    glyph: "물",
    cost: 2,
    effect: { social: -1, economy: 2, environment: -1 },
    note: "간선도로와 맞닿은 칸에만 놓을 수 있다.",
    industry: true,
  },
  {
    id: "shops",
    name: "근린상가",
    group: "상업",
    glyph: "상",
    cost: 1,
    effect: { social: 1, economy: 1, environment: 0 },
    note: "걸어서 장을 볼 수 있게 된다.",
  },
  {
    id: "mall",
    name: "대형쇼핑몰",
    group: "상업",
    glyph: "몰",
    cost: 3,
    effect: { social: 0, economy: 3, environment: -2 },
    note: "매출이 크게 몰린다. 넓은 주차장만큼 땅을 덮는다.",
  },
  {
    id: "brt",
    name: "간선도로·BRT",
    group: "기반",
    glyph: "차",
    cost: 2,
    effect: { social: 2, economy: 1, environment: -1 },
    note: "간선도로가 하나도 없는 생활권은 교통 소외로 사회 −1.",
  },
  {
    id: "sewage",
    name: "하수·빗물처리시설",
    group: "기반",
    glyph: "수",
    cost: 2,
    effect: { social: 0, economy: 0, environment: 2 },
    note: "산업단지의 선행 조건. 집중호우 때 물 받이 1.",
    floodDefense: 1,
  },
  {
    id: "forest",
    name: "도시 숲",
    group: "녹지",
    glyph: "숲",
    cost: 1,
    effect: { social: 1, economy: 0, environment: 2 },
    note: "녹지로 센다. 폭염도 막고 집중호우 때 물도 받는다.",
    green: true,
  },
  {
    id: "wetland",
    name: "하천 둔치 습지 복원",
    group: "녹지",
    glyph: "습",
    cost: 2,
    effect: { social: 1, economy: -1, environment: 3 },
    note: "하천과 맞닿은 칸에만 놓을 수 있다. 녹지로 센다.",
    riversideOnly: true,
    green: true,
  },
  {
    id: "welfare",
    name: "보건·복지센터",
    group: "공공",
    glyph: "복",
    cost: 2,
    effect: { social: 3, economy: 0, environment: 0 },
    note: "보건·복지센터도 학교도 없는 생활권은 공공서비스 소외로 사회 −1.",
  },
  {
    id: "school",
    name: "학교·평생학습관",
    group: "공공",
    glyph: "학",
    cost: 3,
    effect: { social: 3, economy: 1, environment: 0 },
    note: "아이와 어르신이 함께 쓰는 배움터. 공공서비스 소외를 막아 준다.",
  },
  {
    id: "basin",
    name: "빗물 저류지",
    group: "방재",
    glyph: "저",
    cost: 2,
    effect: { social: 1, economy: 0, environment: 1 },
    note: "저지대에 놓으면 물 받이 2, 그 밖에는 1.",
    floodDefense: 1,
  },

  // ----------------------------------------- 기존 시가지(고정, 지울 수 없음)
  {
    id: "oldHousing",
    name: "노후 주택",
    group: "주거",
    glyph: "낡",
    cost: 0,
    effect: { social: 0, economy: 0, environment: -1 },
    note: "이미 사람이 살고 있는 오래된 집. 지울 수 없다.",
    fixedOnly: true,
    housing: true,
  },
  {
    id: "oldFactory",
    name: "기존 공장",
    group: "산업",
    glyph: "공",
    cost: 0,
    effect: { social: -1, economy: 2, environment: -2 },
    note: "예전부터 돌아가던 공장. 지울 수 없다.",
    fixedOnly: true,
    industry: true,
  },
];

export const FACILITY_BY_ID: Record<FacilityId, Facility> = Object.fromEntries(
  FACILITIES.map((f) => [f.id, f]),
) as Record<FacilityId, Facility>;

/** 팔레트에 뜨는 것만. 기존 시가지는 제외. */
export const PLACEABLE = FACILITIES.filter((f) => !f.fixedOnly);

/** 칸 자체의 조건만으로 판단하는 배치 가능 여부. 선행 조건은 engine에서 따로 본다. */
export function terrainAllows(facility: Facility, cell: Cell): string | null {
  if (cell.terrain === "river") return "하천 칸에는 시설을 놓을 수 없습니다.";
  if (facility.riversideOnly && !cell.riverside)
    return "하천과 맞닿은 칸에만 놓을 수 있는 시설입니다.";
  return null;
}
