// 가상 도시 「한여울시」의 9x9 격자 지형, 생활권, 그리고 처음부터 깔려 있는 기존 시가지.
//
// 이 앱은 종이 수행평가를 위한 연습 도구라서, 모든 수치는 학생이 손으로 더할 수 있는
// 크기로 잡혀 있다. 수업에서 난이도를 바꾸고 싶으면 이 파일과 facilities.ts만 고치면 된다.

import type { FacilityId } from "./facilities.ts";

export const SIZE = 9;

/** 각 행에서 하천이 지나가는 열 번호. 한 행에 한 칸씩, 굽이치며 남북으로 흐른다. */
export const RIVER_COL_BY_ROW = [4, 4, 3, 3, 4, 4, 5, 5, 4] as const;

export type ZoneId = "garam" | "saedeul" | "dolmaru" | "beodeul";

export interface Zone {
  id: ZoneId;
  name: string;
  short: string;
  summary: string;
  /**
   * 판 위의 건물로는 표현할 수 없는 그 동네만의 사정. 아주 작게(-1~+1)만 준다.
   * 나머지 출발선 차이는 전부 기존 시가지 타일이 대신 말해 준다.
   */
  base: { social: number; economy: number; environment: number };
  baseReason: string;
}

export const ZONES: Zone[] = [
  {
    id: "garam",
    name: "가람마루",
    short: "북서",
    summary:
      "하천 서안의 구도심. 좁은 골목에 오래된 집과 가게가 붙어 있고, 세대주 절반이 65세 이상이다.",
    base: { social: 1, economy: 0, environment: 0 },
    baseReason: "사회 +1 — 수십 년 이어진 이웃 관계와 골목 상권이 살아 있다.",
  },
  {
    id: "saedeul",
    name: "새들녘",
    short: "북동",
    summary:
      "20년 전 조성된 신시가지. 간선도로가 이미 지나고 아파트값이 시에서 가장 높다.",
    base: { social: -1, economy: 0, environment: 0 },
    baseReason: "사회 −1 — 낮에는 대부분 도심으로 나가 있어 주민 모임이 거의 없다.",
  },
  {
    id: "dolmaru",
    name: "돌마루",
    short: "남서",
    summary:
      "하천보다 지대가 낮은 공단 배후지. 공장이 예전부터 돌아가고 있고 반지하 주택 침수 이력이 있다.",
    base: { social: -1, economy: 0, environment: 0 },
    baseReason: "사회 −1 — 대기질과 소음 민원이 시에서 가장 많다.",
  },
  {
    id: "beodeul",
    name: "버들숲",
    short: "남동",
    summary:
      "논과 습지가 남아 있는 외곽. 집은 몇 채 없고 시내버스가 하루 6회뿐이다.",
    base: { social: 0, economy: 0, environment: 1 },
    baseReason: "환경 +1 — 재두루미가 겨울을 나는 습지가 남아 있다.",
  },
];

export const ZONE_BY_ID: Record<ZoneId, Zone> = Object.fromEntries(
  ZONES.map((z) => [z.id, z]),
) as Record<ZoneId, Zone>;

export type Terrain = "river" | "wetland" | "plain";

export interface Cell {
  index: number;
  row: number;
  col: number;
  terrain: Terrain;
  /** 하천 칸은 어떤 생활권에도 속하지 않는다(도시 공용 공간). */
  zone: ZoneId | null;
  /** 하천과 상하좌우로 맞닿은 칸. 습지 복원은 여기에만 놓을 수 있다. */
  riverside: boolean;
  /** 지대가 낮아 집중호우 때 물이 차는 칸. */
  lowland: boolean;
}

/** 배치 전부터 논·습지가 남아 있는 칸. 여기에 건물을 놓으면 그만큼 사라진다. */
const WETLAND_CELLS: ReadonlyArray<[number, number]> = [
  [5, 7],
  [6, 7],
  [6, 8],
  [7, 7],
  [7, 8],
  [8, 7],
  [8, 8],
  [7, 4],
  [8, 3],
];

/**
 * 처음부터 깔려 있는 기존 시가지. 학생은 지울 수 없고 빈 칸에만 새로 놓을 수 있다.
 * 생활권마다 무엇이 이미 있는지가 곧 출발선의 차이다 —
 * 새들녘만 간선도로를 갖고 있어 교통 소외를 면하고, 돌마루는 공장을 안고 시작한다.
 */
export const EXISTING_CITY: ReadonlyArray<[number, number, FacilityId]> = [
  // 가람마루 — 노후 주택이 빽빽하고 녹지도 공공시설도 없다
  [0, 1, "oldHousing"],
  [1, 1, "oldHousing"],
  [1, 2, "oldHousing"],
  [2, 1, "oldHousing"],
  [1, 0, "shops"],
  // 새들녘 — 간선도로를 이미 갖춰 교통 소외를 면하고 시작한다.
  // 건물 수는 적지만(구도심과 달리 성기게 지어져서) 그 하나하나가 새것이다.
  [0, 6, "apartment"],
  [2, 6, "brt"],
  // 돌마루 — 공장을 안고 시작한다. 주택을 공장 옆에 놓을지는 학생이 정한다
  [6, 0, "oldFactory"],
  [6, 1, "oldFactory"],
  [8, 1, "oldHousing"],
  // 버들숲 — 집이 몇 채뿐이다
  [5, 6, "oldHousing"],
];

function zoneOf(row: number, col: number): ZoneId | null {
  const riverCol = RIVER_COL_BY_ROW[row];
  if (col === riverCol) return null;
  const north = row <= 4;
  const west = col < riverCol;
  if (north) return west ? "garam" : "saedeul";
  return west ? "dolmaru" : "beodeul";
}

function buildGrid(): Cell[] {
  const wetland = new Set(WETLAND_CELLS.map(([r, c]) => r * SIZE + c));
  const cells: Cell[] = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const index = row * SIZE + col;
      const isRiver = RIVER_COL_BY_ROW[row] === col;
      const zone = zoneOf(row, col);
      const riverside =
        !isRiver &&
        [
          [row - 1, col],
          [row + 1, col],
          [row, col - 1],
          [row, col + 1],
        ].some(
          ([r, c]) =>
            r >= 0 && r < SIZE && c >= 0 && c < SIZE && RIVER_COL_BY_ROW[r] === c,
        );
      cells.push({
        index,
        row,
        col,
        terrain: isRiver ? "river" : wetland.has(index) ? "wetland" : "plain",
        zone,
        riverside,
        // 하천과 맞닿은 칸, 그리고 하천 쪽으로 기운 돌마루의 낮은 땅.
        lowland: !isRiver && (riverside || (zone === "dolmaru" && col >= 2)),
      });
    }
  }
  return cells;
}

export const GRID: Cell[] = buildGrid();

export function cellAt(row: number, col: number): Cell | undefined {
  if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return undefined;
  return GRID[row * SIZE + col];
}

/** 상하좌우로 맞닿은 칸들. 대각선은 인접으로 보지 않는다. */
export function neighborsOf(cell: Cell): Cell[] {
  return [
    cellAt(cell.row - 1, cell.col),
    cellAt(cell.row + 1, cell.col),
    cellAt(cell.row, cell.col - 1),
    cellAt(cell.row, cell.col + 1),
  ].filter((c): c is Cell => c !== undefined);
}

export const CELLS_BY_ZONE: Record<ZoneId, Cell[]> = ZONES.reduce(
  (acc, zone) => {
    acc[zone.id] = GRID.filter((c) => c.zone === zone.id);
    return acc;
  },
  {} as Record<ZoneId, Cell[]>,
);

/** 칸 번호 → 기존 시가지 시설. 학생 배치와 합쳐서 계산한다. */
export const FIXED_PLACEMENT: Record<number, FacilityId> = Object.fromEntries(
  EXISTING_CITY.map(([r, c, id]) => [r * SIZE + c, id]),
);

export function isFixed(cellIndex: number): boolean {
  return cellIndex in FIXED_PLACEMENT;
}

/** 학생이 새로 놓는 데 쓸 수 있는 예산. 시설 비용은 1~3이다. */
export const BUDGET = 18;

/** 집중호우를 견디려면 저지대 몇 칸당 물 받이 1이 필요한지. */
export const LOWLAND_PER_DEFENSE = 4;

/**
 * 생활권 격차의 경계·위험 판정선.
 * 켄텍 문제는 지수 하나를 놓고 3/5로 갈랐지만, 여기서 비교하는 종합 생활 편익은
 * 세 지수를 더한 값이라 눈금이 세 배다. 그래서 같은 뜻이 되도록 6/10으로 둔다.
 */
export const GAP_WARN = 6;
export const GAP_DANGER = 10;

/** 폭염을 견디는 데 필요한 생활권별 최소 녹지 칸 수. */
export const GREEN_NEEDED = 2;
