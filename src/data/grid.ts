// 승기천 정비 시뮬레이터 — 6x6 타일 배치 데이터 모델
// 하천은 고정된 위치에 있고, 학생은 제한된 개수의 타일을 빈 칸에 배치합니다.
// 지표 수치는 교육용으로 설계한 가상 모델이며 실제 승기천 정비사업의 예측값이 아닙니다.

export type IndicatorKey =
  | "flood"
  | "convenience"
  | "biodiversity"
  | "water"
  | "scenery"
  | "acceptance";

export interface Indicator {
  key: IndicatorKey;
  label: string;
  shortLabel: string;
  description: string;
}

export const INDICATORS: Indicator[] = [
  {
    key: "flood",
    label: "홍수 안전성",
    shortLabel: "안전",
    description: "폭우가 왔을 때 물이 넘치지 않고 잘 빠지는 정도예요.",
  },
  {
    key: "convenience",
    label: "이용 편의성",
    shortLabel: "편의",
    description: "사람들이 살고, 일하고, 이동하기 편한 정도예요.",
  },
  {
    key: "biodiversity",
    label: "생태 다양성",
    shortLabel: "생태",
    description: "물고기, 곤충, 식물이 살아가기 좋은 정도예요.",
  },
  {
    key: "water",
    label: "수질",
    shortLabel: "수질",
    description: "물이 스스로 깨끗해지는 자정 능력이 있는 정도예요.",
  },
  {
    key: "scenery",
    label: "경관 자연성",
    shortLabel: "경관",
    description: "인공적이지 않고 자연 그대로처럼 보이는 정도예요.",
  },
  {
    key: "acceptance",
    label: "주민 수용성",
    shortLabel: "수용성",
    description:
      "주민들이 이 계획을 얼마나 받아들일 만하다고 느끼는지예요. 이용 편의성과 생태·수질·경관(자연 지표 평균)의 차이가 클수록 낮아져요 — 한쪽으로 치우친 계획일수록 불만이 커진다는 뜻이에요.",
  },
];

export type IndicatorValues = Record<IndicatorKey, number>;

export const GRID_SIZE = 6;

export interface Cell {
  row: number;
  col: number;
}

// 승기천이 마을을 가로지르는 고정된 물길이에요. 학생은 이 칸들을 바꿀 수 없어요.
export const RIVER_PATH: Cell[] = [
  { row: 0, col: 1 },
  { row: 1, col: 2 },
  { row: 2, col: 2 },
  { row: 3, col: 3 },
  { row: 4, col: 3 },
  { row: 5, col: 4 },
];

export function cellKey(row: number, col: number): string {
  return `${row},${col}`;
}

const RIVER_SET = new Set(RIVER_PATH.map((c) => cellKey(c.row, c.col)));

export function isRiver(row: number, col: number): boolean {
  return RIVER_SET.has(cellKey(row, col));
}

function neighborsOf(row: number, col: number): Cell[] {
  return [
    { row: row - 1, col },
    { row: row + 1, col },
    { row, col: col - 1 },
    { row, col: col + 1 },
  ];
}

export function riverNeighborsOf(row: number, col: number): Cell[] {
  return neighborsOf(row, col).filter((c) => RIVER_SET.has(cellKey(c.row, c.col)));
}

export function isRiverAdjacent(row: number, col: number): boolean {
  return riverNeighborsOf(row, col).length > 0;
}

export type TileTypeKey = "residential" | "building" | "power" | "road" | "park";

export interface TileType {
  key: TileTypeKey;
  label: string;
  icon: string;
  cost: number;
  maxCount: number;
  description: string;
  examples: string;
  // 타일 하나를 놓았을 때의 지표 변화량
  effects: Partial<Record<IndicatorKey, number>>;
  // 하천과 맞닿은 칸에 놓였을 때 추가로 더해지는 변화량
  riverBonus: Partial<Record<IndicatorKey, number>>;
}

export const TILE_TYPES: TileType[] = [
  {
    key: "residential",
    label: "주거지",
    icon: "🏠",
    cost: 3,
    maxCount: 4,
    description: "사람들이 실제로 살아가는 공간이에요.",
    examples: "예: 아파트, 단독주택, 빌라",
    effects: { convenience: 6, biodiversity: -5, water: -3 },
    riverBonus: { biodiversity: -4, water: -4 },
  },
  {
    key: "building",
    label: "상업·공공건물",
    icon: "🏢",
    cost: 3,
    maxCount: 4,
    description: "사람들이 모이고 이용하는 건물이에요.",
    examples: "예: 가게, 식당, 도서관, 주민센터",
    effects: { convenience: 7, scenery: -6, biodiversity: -4 },
    riverBonus: { biodiversity: -4, water: -4 },
  },
  {
    key: "power",
    label: "전기·통신 시설",
    icon: "⚡",
    cost: 2,
    maxCount: 4,
    description: "생활에 꼭 필요한 기반 시설이에요.",
    examples: "예: 전봇대, 변전소, 가로등, 통신 중계기",
    effects: { convenience: 4, scenery: -7, biodiversity: -3 },
    riverBonus: { biodiversity: -4, water: -4 },
  },
  {
    key: "road",
    label: "도로",
    icon: "🛣️",
    cost: 2,
    maxCount: 4,
    description: "차와 사람이 다니도록 포장된 길이에요.",
    examples: "예: 차도, 인도, 자전거도로",
    effects: { convenience: 6, flood: -6, water: -4 },
    riverBonus: { biodiversity: -4, water: -4 },
  },
  {
    key: "park",
    label: "텃밭·공원",
    icon: "🌳",
    cost: 1,
    maxCount: 4,
    description: "나무를 심거나 가꾸는 녹지 공간이에요.",
    examples: "예: 공원, 주말농장, 화단, 산책로변 녹지",
    effects: { biodiversity: 6, water: 4, scenery: 3, convenience: 3, flood: 3 },
    riverBonus: { biodiversity: 4, water: 4 },
  },
];

// 타일마다 코스트가 달라요. 이 예산 안에서 자유롭게 조합을 짜야 해요.
export const TILE_BUDGET = 14;

export const TILE_COMPAT_NOTE =
  "타일 종류는 서로 자유롭게 섞어 놓을 수 있어요. 예를 들어 상업·공공건물 바로 옆에 텃밭·공원을 두는 것도 가능해요. 다만 그 조합이 지표에 어떤 영향을 주는지는 직접 배치해 보며 확인해 보세요. 또한 특정 타일끼리 맞닿으면 추가로 지표가 바뀌는 '시너지'도 있어요 — 아래 시너지 안내를 참고하세요.";

export const BASE_VALUES: IndicatorValues = {
  flood: 50,
  convenience: 20,
  biodiversity: 80,
  water: 75,
  scenery: 70,
  // 주민 수용성은 타일 효과로 직접 쌓이지 않고, simulateGrid 마지막에 다른 지표로부터 계산돼요.
  acceptance: 0,
};

// 칸 좌표("row,col") -> 그 칸에 놓인 타일 종류
export type Placements = Record<string, TileTypeKey>;

export interface Synergy {
  key: string;
  pair: [TileTypeKey, TileTypeKey];
  label: string;
  hint: string;
  color: string;
  effects: Partial<Record<IndicatorKey, number>>;
}

// 두 타일이 서로 맞닿아 있을 때(하천과의 인접 여부와 무관) 추가로 발동하는 효과예요.
export const SYNERGIES: Synergy[] = [
  {
    key: "park-residential",
    pair: ["park", "residential"],
    label: "생활 속 녹지",
    hint: "텃밭·공원 바로 옆 주거지는 삶의 질과 생태 다양성이 함께 좋아져요.",
    color: "#2f6f5e",
    effects: { biodiversity: 3, convenience: 2 },
  },
  {
    key: "park-park",
    pair: ["park", "park"],
    label: "연결된 녹지",
    hint: "텃밭·공원끼리 맞닿으면 생물이 오가는 통로가 되어 생태 다양성이 크게 좋아져요.",
    color: "#5aa06e",
    effects: { biodiversity: 4 },
  },
  {
    key: "road-park",
    pair: ["road", "park"],
    label: "가로수길",
    hint: "도로 옆 텃밭·공원은 가로수길처럼 느껴져서 경관과 편의가 함께 좋아져요.",
    color: "#c9973a",
    effects: { scenery: 2, convenience: 1 },
  },
  {
    key: "building-building",
    pair: ["building", "building"],
    label: "상업지 과밀",
    hint: "상업·공공건물이 두 개 붙어 있으면 혼잡해져서 오히려 편의성이 떨어져요.",
    color: "#b0413e",
    effects: { convenience: -3 },
  },
  {
    key: "power-residential",
    pair: ["power", "residential"],
    label: "생활 인프라 민원",
    hint: "전기·통신 시설 바로 옆 주거지는 경관에 대한 불만이 커져요.",
    color: "#a85a8a",
    effects: { scenery: -3 },
  },
];

// 하천과 맞닿았을 때도 시너지와 같은 방식으로 시각화해요.
export const RIVER_SYNERGY_COLOR = "#3f7dc4";
export const RIVER_SYNERGY_LABEL = "하천과 맞닿음";

const SYNERGY_MAP = new Map<string, Synergy>(
  SYNERGIES.map((s) => [[...s.pair].sort().join("|"), s]),
);

function synergyFor(a: TileTypeKey, b: TileTypeKey): Synergy | undefined {
  return SYNERGY_MAP.get([a, b].sort().join("|"));
}

// 맞닿은 두 칸을 한 번씩만 세기 위해 오른쪽·아래쪽 이웃만 확인해요.
function adjacentFilledPairs(placements: Placements): [string, string][] {
  const pairs: [string, string][] = [];
  for (const key of Object.keys(placements)) {
    const [row, col] = key.split(",").map(Number);
    const rightKey = cellKey(row, col + 1);
    const downKey = cellKey(row + 1, col);
    if (placements[rightKey]) pairs.push([key, rightKey]);
    if (placements[downKey]) pairs.push([key, downKey]);
  }
  return pairs;
}

export function activeSynergies(placements: Placements): { synergy: Synergy; count: number }[] {
  const counts = new Map<string, number>();
  for (const [a, b] of adjacentFilledPairs(placements)) {
    const synergy = synergyFor(placements[a], placements[b]);
    if (!synergy) continue;
    counts.set(synergy.key, (counts.get(synergy.key) ?? 0) + 1);
  }
  return SYNERGIES.filter((s) => counts.has(s.key)).map((synergy) => ({
    synergy,
    count: counts.get(synergy.key)!,
  }));
}

export interface VisualSynergyEdge {
  key: string;
  from: Cell;
  to: Cell;
  color: string;
  label: string;
}

// 그리드 위에 시너지(하천 포함)를 선으로 이어 보여주기 위한 좌표 목록이에요.
// 한 칸이 여러 시너지에 동시에 걸쳐 있어도 각 변이 독립적으로 그려져서 모두 표시돼요.
export function visualSynergyEdges(placements: Placements): VisualSynergyEdge[] {
  const edges: VisualSynergyEdge[] = [];
  for (const [a, b] of adjacentFilledPairs(placements)) {
    const synergy = synergyFor(placements[a], placements[b]);
    if (!synergy) continue;
    const [rowA, colA] = a.split(",").map(Number);
    const [rowB, colB] = b.split(",").map(Number);
    edges.push({
      key: `${synergy.key}:${a}-${b}`,
      from: { row: rowA, col: colA },
      to: { row: rowB, col: colB },
      color: synergy.color,
      label: synergy.label,
    });
  }
  for (const key of Object.keys(placements)) {
    const [row, col] = key.split(",").map(Number);
    for (const river of riverNeighborsOf(row, col)) {
      edges.push({
        key: `river:${key}-${cellKey(river.row, river.col)}`,
        from: { row, col },
        to: river,
        color: RIVER_SYNERGY_COLOR,
        label: RIVER_SYNERGY_LABEL,
      });
    }
  }
  return edges;
}

export function simulateGrid(placements: Placements): IndicatorValues {
  const totals: IndicatorValues = { ...BASE_VALUES };
  for (const [key, typeKey] of Object.entries(placements)) {
    const type = TILE_TYPES.find((t) => t.key === typeKey);
    if (!type) continue;
    for (const [ind, delta] of Object.entries(type.effects) as [IndicatorKey, number][]) {
      totals[ind] += delta;
    }
    const [row, col] = key.split(",").map(Number);
    if (isRiverAdjacent(row, col)) {
      for (const [ind, delta] of Object.entries(type.riverBonus) as [IndicatorKey, number][]) {
        totals[ind] += delta;
      }
    }
  }
  for (const [a, b] of adjacentFilledPairs(placements)) {
    const synergy = synergyFor(placements[a], placements[b]);
    if (!synergy) continue;
    for (const [ind, delta] of Object.entries(synergy.effects) as [IndicatorKey, number][]) {
      totals[ind] += delta;
    }
  }
  const clamped = {} as IndicatorValues;
  for (const k of Object.keys(totals) as IndicatorKey[]) {
    if (k === "acceptance") continue;
    clamped[k] = Math.max(0, Math.min(100, Math.round(totals[k])));
  }
  clamped.acceptance = computeAcceptance(clamped);
  return clamped;
}

// 주민 수용성 = 두 방향의 불만을 각각 따로 계산해서 뺀 값이에요.
// 이용 편의성이 너무 낮으면 "왜 이렇게 불편하게 두냐"는 불만이, 자연 지표(생태·수질·경관
// 평균)가 너무 낮으면 "너무 많이 훼손했다"는 불만이 커져요. 둘을 별도로 계산하기 때문에
// 한쪽만 극단으로 밀어붙여도(예: 예산을 편의 시설에 몰아서 자연을 크게 훼손) 수용성이
// 떨어지고, 반대로 아무것도 안 지어 편의가 방치돼도 수용성이 떨어져요.
const ACCEPTANCE_CONVENIENCE_MIN = 45;
const ACCEPTANCE_NATURE_MIN = 65;
const ACCEPTANCE_PENALTY_FACTOR = 2.5;

function computeAcceptance(values: IndicatorValues): number {
  const natureAvg = (values.biodiversity + values.water + values.scenery) / 3;
  const underdevelopedComplaint = Math.max(0, ACCEPTANCE_CONVENIENCE_MIN - values.convenience);
  const overdevelopedComplaint = Math.max(0, ACCEPTANCE_NATURE_MIN - natureAvg);
  const penalty = (underdevelopedComplaint + overdevelopedComplaint) * ACCEPTANCE_PENALTY_FACTOR;
  return Math.max(0, Math.min(100, Math.round(100 - penalty)));
}

export function countByType(placements: Placements): Record<TileTypeKey, number> {
  const counts = {} as Record<TileTypeKey, number>;
  for (const t of TILE_TYPES) counts[t.key] = 0;
  for (const typeKey of Object.values(placements)) counts[typeKey]++;
  return counts;
}

export function spentBudget(placements: Placements): number {
  let spent = 0;
  for (const typeKey of Object.values(placements)) {
    const type = TILE_TYPES.find((t) => t.key === typeKey);
    if (type) spent += type.cost;
  }
  return spent;
}

export type ReasonKey = "human" | "nature" | "balance";

export interface ReasonOption {
  key: ReasonKey;
  label: string;
  description: string;
}

export const REASON_OPTIONS: ReasonOption[] = [
  {
    key: "human",
    label: "사람의 안전과 편의를 위해",
    description: "사람이 안전하고 편리하게 이용하는 것이 가장 중요하다고 생각했어요.",
  },
  {
    key: "nature",
    label: "자연 그대로의 가치를 지키기 위해",
    description: "하천과 생물이 그 자체로 소중하다고 생각했어요.",
  },
  {
    key: "balance",
    label: "사람과 자연의 균형을 위해",
    description: "둘 중 하나만 고르기보다 서로 균형을 맞추려고 했어요.",
  },
];

export interface Mission {
  key: string;
  label: string;
  difficulty: "기본" | "심화" | "최상";
  description: string;
  targets: Partial<Record<IndicatorKey, number>>;
}

export const MISSIONS: Mission[] = [
  {
    key: "convenience-nature",
    label: "사람도 자연도",
    difficulty: "기본",
    description: "이용 편의성 50 이상과 생태 다양성 60 이상을 동시에 만족하는 안을 만들어보세요.",
    targets: { convenience: 50, biodiversity: 60 },
  },
  {
    key: "clean-and-lively",
    label: "깨끗하고 북적이게",
    difficulty: "심화",
    description: "이용 편의성 55 이상, 생태 다양성 55 이상, 수질 65 이상을 동시에 만족하는 안을 만들어보세요.",
    targets: { convenience: 55, biodiversity: 55, water: 65 },
  },
  {
    key: "safe-city-nature",
    label: "안전한 마을과 자연의 균형",
    difficulty: "최상",
    description:
      "홍수 안전성 47 이상, 이용 편의성 55 이상, 생태 다양성 55 이상을 동시에 만족하는 안을 만들어보세요. 도로를 많이 놓을수록 홍수 안전성이 크게 떨어진다는 점에 주의하세요.",
    targets: { flood: 47, convenience: 55, biodiversity: 55 },
  },
];

export function checkMission(mission: Mission, values: IndicatorValues): boolean {
  return (Object.entries(mission.targets) as [IndicatorKey, number][]).every(
    ([key, min]) => values[key] >= min,
  );
}

export interface Badge {
  key: string;
  label: string;
  icon: string;
  description: string;
}

interface BadgeRule extends Badge {
  test: (values: IndicatorValues) => boolean;
}

// 저장한 안의 지표 조합을 보고 자동으로 붙는 칭호예요. 위에서부터 먼저 맞는 것으로 정해져요.
const BADGE_RULES: BadgeRule[] = [
  {
    key: "safety-first",
    label: "안전 제일주의자",
    icon: "🛡️",
    description: "다른 무엇보다 홍수 안전성을 우선했어요.",
    test: (v) => v.flood >= 55,
  },
  {
    key: "eco-guardian",
    label: "생태 지킴이",
    icon: "🌿",
    description: "생태 다양성과 수질을 특히 높게 지켰어요.",
    test: (v) => v.biodiversity >= 82 && v.water >= 78,
  },
  {
    key: "city-builder",
    label: "번영 마을 건축가",
    icon: "🏙️",
    description: "이용 편의성을 크게 끌어올린 대신 자연은 많이 양보했어요.",
    test: (v) => v.convenience >= 45 && v.biodiversity <= 55,
  },
  {
    key: "balancer",
    label: "균형 설계자",
    icon: "⚖️",
    description: "어느 한쪽에 치우치지 않고 골고루 신경 썼어요.",
    test: (v) => {
      const nums = [v.flood, v.convenience, v.biodiversity, v.water, v.scenery];
      return Math.max(...nums) - Math.min(...nums) <= 30 && v.convenience >= 32;
    },
  },
  {
    key: "untouched",
    label: "손대지 않은 마을",
    icon: "🌾",
    description: "아직 마을에 큰 변화를 주지 않았어요.",
    test: (v) => v.convenience <= 26,
  },
  {
    key: "explorer",
    label: "실험적 설계자",
    icon: "🧪",
    description: "독특한 조합을 시도하고 있어요.",
    test: () => true,
  },
];

export function getBadge(values: IndicatorValues): Badge {
  return BADGE_RULES.find((rule) => rule.test(values))!;
}

export interface SavedPlan {
  id: string;
  label: string;
  placements: Placements;
  values: IndicatorValues;
  reason: ReasonKey;
  reasonNote: string;
  savedAt: number;
}
