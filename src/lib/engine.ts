// 배치를 생활권별 지수로 바꾸는 계산기.
//
// 이 앱은 종이 수행평가의 연습 도구다. 그래서 학생이 종이에서 똑같이 따라 할 수 있도록
// 규칙을 일부러 적게 뒀다 — 보정 4가지, 재난 2가지, 전부 정수, 무작위 없음.
// 종합 생활 편익도 가중치 없이 세 지수를 그냥 더한다.

import {
  CELLS_BY_ZONE,
  FIXED_PLACEMENT,
  GAP_DANGER,
  GAP_WARN,
  GREEN_NEEDED,
  GRID,
  LOWLAND_PER_DEFENSE,
  ZONES,
  neighborsOf,
  type Cell,
  type Zone,
  type ZoneId,
} from "../data/city.ts";
import {
  FACILITY_BY_ID,
  terrainAllows,
  type Facility,
  type FacilityId,
} from "../data/facilities.ts";

export interface Triple {
  social: number;
  economy: number;
  environment: number;
}

/** 학생이 새로 놓은 시설만. 기존 시가지는 FIXED_PLACEMENT에 따로 있다. */
export type Placement = Record<number, FacilityId>;

const ZERO: Triple = { social: 0, economy: 0, environment: 0 };

function add(a: Triple, b: Triple): Triple {
  return {
    social: a.social + b.social,
    economy: a.economy + b.economy,
    environment: a.environment + b.environment,
  };
}

/** 종합 생활 편익 = 세 지수의 단순 합. 종이에서 암산할 수 있어야 하므로 가중치를 두지 않는다. */
export function benefitOf(t: Triple): number {
  return t.social + t.economy + t.environment;
}

/** 기존 시가지와 학생 배치를 합친, 실제로 판 위에 있는 모든 것. */
export function fullPlacement(placement: Placement): Record<number, FacilityId> {
  return { ...FIXED_PLACEMENT, ...placement };
}

export interface Adjustment {
  label: string;
  delta: Triple;
}

export interface EventOutcome {
  year: number;
  name: string;
  hit: boolean;
  requirement: string;
  delta: Triple;
}

export interface ZoneResult {
  zone: Zone;
  cellCount: number;
  lowlandCount: number;
  greenCount: number;
  /** 기존 시가지 건물 수 / 학생이 새로 놓은 수. */
  fixedCount: number;
  placedCount: number;
  base: Triple;
  fromExisting: Triple;
  fromPlaced: Triple;
  adjustments: Adjustment[];
  /** 배치 직후(0년차). */
  afterBuild: Triple;
  storm: EventOutcome;
  heat: EventOutcome;
  /** 6년차 최종. */
  final: Triple;
  benefit: number;
}

export interface NonHumanIndicator {
  key: "riverLife" | "urbanForest" | "animalPath";
  name: string;
  value: number;
  caption: string;
}

export type GapLevel = "안정" | "경계" | "위험";

export interface CityResult {
  zones: ZoneResult[];
  byZone: Record<ZoneId, ZoneResult>;
  timeline: { year: number; label: string; totals: Triple }[];
  nonHuman: NonHumanIndicator[];
  bestZone: ZoneResult;
  worstZone: ZoneResult;
  gap: number;
  gapLevel: GapLevel;
  spent: number;
  placedCount: number;
}

function facilityAt(all: Record<number, FacilityId>, cell: Cell): Facility | null {
  const id = all[cell.index];
  return id ? FACILITY_BY_ID[id] : null;
}

/** 녹지로 세는 칸: 도시 숲, 습지 복원, 그리고 아직 건드리지 않은 논·습지. */
function isGreen(all: Record<number, FacilityId>, cell: Cell): boolean {
  const f = facilityAt(all, cell);
  if (f) return Boolean(f.green);
  return cell.terrain === "wetland";
}

// ---------------------------------------------------------------- 배치 규칙

export function placementError(
  placement: Placement,
  facilityId: FacilityId,
  cell: Cell,
): string | null {
  const all = fullPlacement(placement);
  const facility = FACILITY_BY_ID[facilityId];

  if (facility.fixedOnly) return "이 건물은 처음부터 있던 것이라 새로 놓을 수 없습니다.";
  const terrain = terrainAllows(facility, cell);
  if (terrain) return terrain;
  if (FIXED_PLACEMENT[cell.index])
    return `${FACILITY_BY_ID[FIXED_PLACEMENT[cell.index]].name}이(가) 이미 있는 칸입니다. 기존 시가지는 지울 수 없습니다.`;
  if (placement[cell.index]) return "이미 다른 시설을 놓은 칸입니다.";

  if (facilityId === "industrial") {
    const hasSewage = (CELLS_BY_ZONE[cell.zone as ZoneId] ?? []).some(
      (c) => all[c.index] === "sewage",
    );
    if (!hasSewage)
      return "산업단지는 같은 생활권에 하수·빗물처리시설이 먼저 있어야 놓을 수 있습니다.";
  }

  if (facilityId === "logistics") {
    const nextToRoad = neighborsOf(cell).some((n) => all[n.index] === "brt");
    if (!nextToRoad) return "물류창고는 간선도로와 맞닿은 칸에만 놓을 수 있습니다.";
  }

  return null;
}

/** 다른 시설의 선행 조건을 무너뜨리는 철거를 막는다. 기존 시가지는 아예 철거 대상이 아니다. */
export function removalError(placement: Placement, cell: Cell): string | null {
  if (FIXED_PLACEMENT[cell.index]) return "기존 시가지는 지울 수 없습니다.";
  const id = placement[cell.index];
  if (!id) return null;
  const all = fullPlacement(placement);

  if (id === "sewage") {
    const zoneCells = CELLS_BY_ZONE[cell.zone as ZoneId] ?? [];
    const otherSewage = zoneCells.some(
      (c) => c.index !== cell.index && all[c.index] === "sewage",
    );
    const hasIndustrial = zoneCells.some((c) => all[c.index] === "industrial");
    if (hasIndustrial && !otherSewage)
      return "이 생활권의 산업단지가 이 시설을 필요로 합니다. 산업단지를 먼저 치워 주세요.";
  }

  if (id === "brt") {
    const dependent = neighborsOf(cell).filter((n) => all[n.index] === "logistics");
    const orphan = dependent.some(
      (w) => !neighborsOf(w).some((n) => n.index !== cell.index && all[n.index] === "brt"),
    );
    if (orphan)
      return "맞닿은 물류창고가 이 도로를 필요로 합니다. 물류창고를 먼저 치워 주세요.";
  }

  return null;
}

export function totalSpent(placement: Placement): number {
  return Object.values(placement).reduce((sum, id) => sum + FACILITY_BY_ID[id].cost, 0);
}

// ------------------------------------------------------------ 생활권별 계산

/**
 * 보정은 네 가지뿐이다. 학생이 종이에서 셀 수 있어야 하기 때문에
 * 하천 인접 가감·녹지 연결 보너스처럼 계산이 번거로운 것은 비인간 지표로 옮겼다.
 */
function zoneAdjustments(all: Record<number, FacilityId>, cells: Cell[]): Adjustment[] {
  const out: Adjustment[] = [];
  const has = (id: FacilityId) => cells.some((c) => all[c.index] === id);

  if (!has("brt"))
    out.push({
      label: "교통 소외 — 간선도로가 한 곳도 없음",
      delta: { ...ZERO, social: -1 },
    });

  if (!has("welfare") && !has("school"))
    out.push({
      label: "공공서비스 소외 — 보건·복지센터도 학교도 없음",
      delta: { ...ZERO, social: -1 },
    });

  const paved = cells.filter((c) => {
    if (c.terrain !== "wetland") return false;
    const id = all[c.index];
    return Boolean(id) && !FACILITY_BY_ID[id].green;
  }).length;
  if (paved > 0)
    out.push({
      label: `논·습지를 덮은 칸 ${paved}곳`,
      delta: { ...ZERO, environment: -paved },
    });

  const clashes = cells.filter((c) => {
    const id = all[c.index];
    if (!id || !FACILITY_BY_ID[id].industry) return false;
    return neighborsOf(c).some((n) => {
      const nid = all[n.index];
      return Boolean(nid) && Boolean(FACILITY_BY_ID[nid].housing);
    });
  }).length;
  if (clashes > 0)
    out.push({
      label: `주택과 바로 맞닿은 공장·산업단지 ${clashes}곳`,
      delta: { ...ZERO, social: -clashes },
    });

  return out;
}

function sumEffects(all: Record<number, FacilityId>, cells: Cell[], fixed: boolean): Triple {
  return cells.reduce((acc, c) => {
    const id = all[c.index];
    if (!id) return acc;
    const isFixedCell = c.index in FIXED_PLACEMENT;
    if (isFixedCell !== fixed) return acc;
    return add(acc, FACILITY_BY_ID[id].effect);
  }, { ...ZERO });
}

function computeZone(placement: Placement, zone: Zone): ZoneResult {
  const all = fullPlacement(placement);
  const cells = CELLS_BY_ZONE[zone.id];

  const fromExisting = sumEffects(all, cells, true);
  const fromPlaced = sumEffects(all, cells, false);
  const adjustments = zoneAdjustments(all, cells);
  const afterBuild = adjustments.reduce(
    (acc, a) => add(acc, a.delta),
    add(zone.base, add(fromExisting, fromPlaced)),
  );

  const greenCount = cells.filter((c) => isGreen(all, c)).length;
  const lowlandCount = cells.filter((c) => c.lowland).length;

  // 물 받이 = 녹지 칸 수 + 저류지(저지대 2, 그 밖 1) + 하수·빗물처리시설 1.
  // 땅이 물을 머금는 것이 먼저고, 시설은 그것을 보태는 것이다.
  const builtDefense = cells.reduce((sum, c) => {
    const id = all[c.index];
    if (!id) return sum;
    const f = FACILITY_BY_ID[id];
    if (!f.floodDefense) return sum;
    return sum + (f.id === "basin" && c.lowland ? 2 : f.floodDefense);
  }, 0);
  const defense = greenCount + builtDefense;
  const floodNeeded = Math.ceil(lowlandCount / LOWLAND_PER_DEFENSE);
  const stormHit = defense < floodNeeded;
  const storm: EventOutcome = {
    year: 3,
    name: "집중호우",
    hit: stormHit,
    requirement: `저지대 ${lowlandCount}칸 ÷ ${LOWLAND_PER_DEFENSE} → 물 받이 ${floodNeeded} 필요 / 지금 ${defense} (녹지 ${greenCount} + 시설 ${builtDefense})`,
    delta: stormHit ? { social: -2, economy: -2, environment: 0 } : { ...ZERO },
  };

  const heatHit = greenCount < GREEN_NEEDED;
  const heat: EventOutcome = {
    year: 6,
    name: "기록적 폭염",
    hit: heatHit,
    requirement: `녹지 ${GREEN_NEEDED}칸 필요 / 지금 ${greenCount}칸`,
    delta: heatHit ? { social: -1, economy: 0, environment: -1 } : { ...ZERO },
  };

  const final = add(add(afterBuild, storm.delta), heat.delta);

  return {
    zone,
    cellCount: cells.length,
    lowlandCount,
    greenCount,
    fixedCount: cells.filter((c) => c.index in FIXED_PLACEMENT).length,
    placedCount: cells.filter((c) => placement[c.index]).length,
    base: zone.base,
    fromExisting,
    fromPlaced,
    adjustments,
    afterBuild,
    storm,
    heat,
    final,
    benefit: benefitOf(final),
  };
}

// ------------------------------------------------------------ 비인간 지표
//
// 이 셋은 손으로 세기 번거로워서 앱에서만 점수로 보여 준다.
// 종이 답안에서는 "하천변에 무엇을 놓았나", "녹지가 이어졌나 끊겼나"를
// 눈으로 보고 서술하면 된다.

const RIVER_LIFE_WEIGHT: Partial<Record<FacilityId, number>> = {
  wetland: 14,
  forest: 10,
  sewage: 8,
  basin: 4,
  industrial: -18,
  oldFactory: -18,
  logistics: -10,
  mall: -10,
  apartment: -10,
  oldHousing: -6,
  publicHousing: -4,
  shops: -4,
  brt: -4,
  school: -4,
  welfare: -4,
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** 녹지 칸들을 상하좌우로 이어 붙여 덩어리로 묶는다. */
function greenClusters(all: Record<number, FacilityId>): Cell[][] {
  const seen = new Set<number>();
  const clusters: Cell[][] = [];
  for (const cell of GRID) {
    if (seen.has(cell.index) || !isGreen(all, cell)) continue;
    const stack = [cell];
    const cluster: Cell[] = [];
    seen.add(cell.index);
    while (stack.length > 0) {
      const cur = stack.pop() as Cell;
      cluster.push(cur);
      for (const n of neighborsOf(cur)) {
        if (!seen.has(n.index) && isGreen(all, n)) {
          seen.add(n.index);
          stack.push(n);
        }
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function computeNonHuman(placement: Placement): NonHumanIndicator[] {
  const all = fullPlacement(placement);

  let riverLife = 50;
  for (const cell of GRID) {
    if (!cell.riverside) continue;
    const id = all[cell.index];
    if (id) riverLife += RIVER_LIFE_WEIGHT[id] ?? 0;
    else if (cell.terrain === "wetland") riverLife += 6;
  }

  const clusters = greenClusters(all);
  const largest = clusters.reduce((max, c) => Math.max(max, c.length), 0);
  const riverConnected = clusters
    .filter((c) => c.some((cell) => cell.riverside))
    .reduce((sum, c) => sum + c.length, 0);

  return [
    {
      key: "riverLife",
      name: "하천 생태",
      value: clamp(riverLife),
      caption: "하천과 맞닿은 칸에 무엇을 놓았는지로 정해집니다.",
    },
    {
      key: "urbanForest",
      name: "도시 숲",
      value: clamp(largest * 9),
      caption: `가장 크게 이어진 녹지 덩어리 ${largest}칸. 녹지는 흩어 놓을수록 약해집니다.`,
    },
    {
      key: "animalPath",
      name: "도시 속 동물",
      value: clamp(riverConnected * 10),
      caption: `하천까지 녹지로 이어진 칸 ${riverConnected}칸. 끊기면 오갈 길이 사라집니다.`,
    },
  ];
}

// ---------------------------------------------------------------- 종합

export function evaluate(placement: Placement): CityResult {
  const zones = ZONES.map((z) => computeZone(placement, z));
  const byZone = Object.fromEntries(zones.map((z) => [z.zone.id, z])) as Record<
    ZoneId,
    ZoneResult
  >;

  const sum = (pick: (z: ZoneResult) => Triple) =>
    zones.reduce((acc, z) => add(acc, pick(z)), { ...ZERO });

  const afterStorm = zones.reduce(
    (acc, z) => add(acc, add(z.afterBuild, z.storm.delta)),
    { ...ZERO },
  );

  const sorted = [...zones].sort((a, b) => b.benefit - a.benefit);
  const bestZone = sorted[0];
  const worstZone = sorted[sorted.length - 1];
  const gap = bestZone.benefit - worstZone.benefit;
  const gapLevel: GapLevel = gap >= GAP_DANGER ? "위험" : gap >= GAP_WARN ? "경계" : "안정";

  return {
    zones,
    byZone,
    timeline: [
      { year: 0, label: "배치 직후", totals: sum((z) => z.afterBuild) },
      { year: 3, label: "집중호우 뒤", totals: afterStorm },
      { year: 6, label: "폭염 뒤", totals: sum((z) => z.final) },
    ],
    nonHuman: computeNonHuman(placement),
    bestZone,
    worstZone,
    gap,
    gapLevel,
    spent: totalSpent(placement),
    placedCount: Object.keys(placement).length,
  };
}
