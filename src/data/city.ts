// 가상 도시 「한여울시」의 9x9 격자 지형과 생활권 정의.
// 수업에서 수치를 조정하고 싶으면 이 파일과 facilities.ts만 고치면 된다.

export const SIZE = 9;

/** 각 행에서 하천이 지나가는 열 번호. 한 행에 한 칸씩, 굽이치며 남북으로 흐른다. */
export const RIVER_COL_BY_ROW = [4, 4, 3, 3, 4, 4, 5, 5, 4] as const;

export type ZoneId = "garam" | "saedeul" | "dolmaru" | "beodeul";

export interface Zone {
  id: ZoneId;
  name: string;
  short: string;
  /** 생활권을 한 줄로 설명하는 초기 조건. 도입 화면과 결과 화면에 쓴다. */
  summary: string;
  /** 배치 전부터 갖고 있는 출발 점수(사회, 경제, 환경). 생활권마다 다르다. */
  base: { social: number; economy: number; environment: number };
}

export const ZONES: Zone[] = [
  {
    id: "garam",
    name: "가람마루",
    short: "북서",
    summary:
      "하천 서안의 구도심. 좁은 골목에 주택과 상가가 빽빽하고 세대주 절반이 65세 이상이다. 공원이 한 곳도 없다.",
    base: { social: 2, economy: 3, environment: 1 },
  },
  {
    id: "saedeul",
    name: "새들녘",
    short: "북동",
    summary:
      "20년 전 조성된 신시가지. 넓은 도로와 학교, 대형 병원이 이미 있고 아파트 값이 시에서 가장 높다.",
    base: { social: 4, economy: 5, environment: 2 },
  },
  {
    id: "dolmaru",
    name: "돌마루",
    short: "남서",
    summary:
      "하천보다 지대가 낮은 공단 배후지. 3년 전 집중호우 때 반지하 주택이 침수됐고 대기질 민원이 가장 많다.",
    base: { social: 1, economy: 2, environment: 0 },
  },
  {
    id: "beodeul",
    name: "버들숲",
    short: "남동",
    summary:
      "논과 습지가 남아 있는 외곽. 재두루미가 겨울을 나는 곳이지만 시내버스가 하루 6회뿐이라 주민은 고령층이 대부분이다.",
    base: { social: 1, economy: 1, environment: 5 },
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

/** 배치 전부터 논·습지가 남아 있는 칸. 여기에 시설을 놓으면 그만큼 사라진다. */
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
        // 하천과 맞닿은 칸과 남서쪽 저지대(돌마루) 전체가 침수 위험 지역이다.
        lowland: !isRiver && (riverside || zone === "dolmaru"),
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

/** 예산. 시설 비용 단위와 같다(단위: 억 원). */
export const BUDGET = 100;
