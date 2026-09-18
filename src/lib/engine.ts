// 배치 결과를 생활권별 지수와 비인간 지표로 바꾸는 계산기.
// 무작위 요소는 하나도 없다. 같은 배치는 언제나 같은 결과를 낸다(수행평가이므로).

import {
  CELLS_BY_ZONE,
  GRID,
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

export type Placement = Record<number, FacilityId>;

const ZERO: Triple = { social: 0, economy: 0, environment: 0 };

function add(a: Triple, b: Triple): Triple {
  return {
    social: a.social + b.social,
    economy: a.economy + b.economy,
    environment: a.environment + b.environment,
  };
}

export interface Adjustment {
  label: string;
  delta: Triple;
}

export interface EventOutcome {
  year: number;
  name: string;
  /** 이 생활권이 피해를 입었는지. */
  hit: boolean;
  requirement: string;
  delta: Triple;
}

export interface ZoneResult {
  zone: Zone;
  cellCount: number;
  lowlandCount: number;
  facilityCount: number;
  base: Triple;
  fromFacilities: Triple;
  adjustments: Adjustment[];
  /** 배치 직후(0년차). */
  afterBuild: Triple;
  storm: EventOutcome;
  heat: EventOutcome;
  /** 6년차 최종. */
  final: Triple;
  /** 종합 생활 편익 지수. 사회 0.4 + 경제 0.3 + 환경 0.3. */
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
  /** 도시 전체 합계. 0년 / 3년(집중호우 뒤) / 6년(폭염 뒤). */
  timeline: { year: number; label: string; totals: Triple }[];
  nonHuman: NonHumanIndicator[];
  bestZone: ZoneResult;
  worstZone: ZoneResult;
  gap: number;
  gapLevel: GapLevel;
  spent: number;
  placedCount: number;
}

function facilityAt(placement: Placement, cell: Cell): Facility | null {
  const id = placement[cell.index];
  return id ? FACILITY_BY_ID[id] : null;
}

/** 녹지로 세는 칸: 도시 숲, 습지 복원, 그리고 아직 개발하지 않은 논·습지. */
function isGreen(placement: Placement, cell: Cell): boolean {
  const f = facilityAt(placement, cell);
  if (f) return Boolean(f.green);
  return cell.terrain === "wetland";
}

// ---------------------------------------------------------------- 배치 규칙

export function placementError(
  placement: Placement,
  facilityId: FacilityId,
  cell: Cell,
): string | null {
  const facility = FACILITY_BY_ID[facilityId];
  const terrain = terrainAllows(facility, cell);
  if (terrain) return terrain;
  if (placement[cell.index]) return "이미 다른 시설이 놓인 칸입니다.";

  if (facilityId === "industrial") {
    const hasSewage = (CELLS_BY_ZONE[cell.zone as ZoneId] ?? []).some(
      (c) => placement[c.index] === "sewage",
    );
    if (!hasSewage)
      return "산업단지는 같은 생활권에 하수·빗물처리시설이 먼저 있어야 놓을 수 있습니다.";
  }

  if (facilityId === "logistics") {
    const nextToBrt = neighborsOf(cell).some((n) => placement[n.index] === "brt");
    if (!nextToBrt)
      return "물류창고는 간선도로·BRT 정류장과 맞닿은 칸에만 놓을 수 있습니다.";
  }

  return null;
}

/** 다른 시설의 선행 조건을 무너뜨리는 철거를 막는다. */
export function removalError(placement: Placement, cell: Cell): string | null {
  const id = placement[cell.index];
  if (!id) return null;

  if (id === "sewage") {
    const zoneCells = CELLS_BY_ZONE[cell.zone as ZoneId] ?? [];
    const otherSewage = zoneCells.some(
      (c) => c.index !== cell.index && placement[c.index] === "sewage",
    );
    const hasIndustrial = zoneCells.some((c) => placement[c.index] === "industrial");
    if (hasIndustrial && !otherSewage)
      return "이 생활권의 산업단지가 이 시설을 필요로 합니다. 산업단지를 먼저 치워 주세요.";
  }

  if (id === "brt") {
    const dependent = neighborsOf(cell).filter((n) => placement[n.index] === "logistics");
    const orphan = dependent.some(
      (w) => !neighborsOf(w).some((n) => n.index !== cell.index && placement[n.index] === "brt"),
    );
    if (orphan)
      return "맞닿은 물류창고가 이 정류장을 필요로 합니다. 물류창고를 먼저 치워 주세요.";
  }

  return null;
}

export function totalSpent(placement: Placement): number {
  return Object.values(placement).reduce((sum, id) => sum + FACILITY_BY_ID[id].cost, 0);
}

// ------------------------------------------------------------ 생활권별 계산

function zoneAdjustments(placement: Placement, cells: Cell[]): Adjustment[] {
  const out: Adjustment[] = [];
  const counts = (id: FacilityId) => cells.filter((c) => placement[c.index] === id).length;

  const riversideSewage = cells.filter(
    (c) => c.riverside && placement[c.index] === "sewage",
  ).length;
  if (riversideSewage > 0)
    out.push({
      label: `하천과 맞닿은 하수·빗물처리시설 ${riversideSewage}곳`,
      delta: { ...ZERO, environment: 2 * riversideSewage },
    });

  const riversideIndustry = cells.filter(
    (c) => c.riverside && placement[c.index] === "industrial",
  ).length;
  if (riversideIndustry > 0)
    out.push({
      label: `하천과 맞닿은 산업단지 ${riversideIndustry}곳`,
      delta: { ...ZERO, environment: -2 * riversideIndustry },
    });

  const connectedForest = cells.filter((c) => {
    if (placement[c.index] !== "forest") return false;
    return neighborsOf(c).some((n) => n.index !== c.index && isGreen(placement, n));
  }).length;
  if (connectedForest > 0)
    out.push({
      label: `다른 녹지와 이어진 도시 숲 ${connectedForest}곳`,
      delta: { ...ZERO, environment: 2 * connectedForest },
    });

  const pavedWetland = cells.filter(
    (c) => c.terrain === "wetland" && placement[c.index] && !FACILITY_BY_ID[placement[c.index]].green,
  ).length;
  if (pavedWetland > 0)
    out.push({
      label: `남아 있던 논·습지를 덮은 칸 ${pavedWetland}곳`,
      delta: { ...ZERO, environment: -2 * pavedWetland },
    });

  const clashes = cells.filter((c) => {
    if (placement[c.index] !== "industrial") return false;
    return neighborsOf(c).some((n) => {
      const id = placement[n.index];
      return id === "publicHousing" || id === "apartment";
    });
  }).length;
  if (clashes > 0)
    out.push({
      label: `주거지와 바로 맞닿은 산업단지 ${clashes}곳`,
      delta: { ...ZERO, social: -2 * clashes },
    });

  const malls = counts("mall");
  const shops = counts("shops");
  if (malls > 0 && shops > 0)
    out.push({
      label: `대형쇼핑몰에 매출이 몰려 근린상가 ${shops}곳의 효과 감소`,
      delta: { ...ZERO, economy: -shops },
    });

  if (counts("brt") === 0)
    out.push({
      label: "간선도로·BRT 정류장이 한 곳도 없음(교통 소외)",
      delta: { ...ZERO, social: -2 },
    });

  if (counts("welfare") === 0 && counts("school") === 0)
    out.push({
      label: "보건·복지센터도 학교도 없음(공공서비스 소외)",
      delta: { ...ZERO, social: -2 },
    });

  return out;
}

function benefitOf(t: Triple): number {
  return Math.round((t.social * 0.4 + t.economy * 0.3 + t.environment * 0.3) * 10) / 10;
}

function computeZone(placement: Placement, zone: Zone): ZoneResult {
  const cells = CELLS_BY_ZONE[zone.id];
  const placed = cells.filter((c) => placement[c.index]);

  const fromFacilities = placed.reduce(
    (acc, c) => add(acc, FACILITY_BY_ID[placement[c.index]].effect),
    { ...ZERO },
  );
  const adjustments = zoneAdjustments(placement, cells);
  const afterBuild = adjustments.reduce(
    (acc, a) => add(acc, a.delta),
    add(zone.base, fromFacilities),
  );

  const lowlandCount = cells.filter((c) => c.lowland).length;
  const floodDefense = placed.reduce((sum, c) => {
    const f = FACILITY_BY_ID[placement[c.index]];
    if (!f.floodDefense) return sum;
    // 저류지는 저지대에 놓아야 제값을 한다.
    if (f.id === "basin" && !c.lowland) return sum + 1;
    return sum + f.floodDefense;
  }, 0);
  const floodRequired = Math.ceil(lowlandCount / 4);
  const stormHit = floodDefense < floodRequired;
  const storm: EventOutcome = {
    year: 3,
    name: "집중호우",
    hit: stormHit,
    requirement: `저지대 ${lowlandCount}칸 → 필요한 물 받이 능력 ${floodRequired} / 현재 ${floodDefense}`,
    delta: stormHit ? { social: -3, economy: -3, environment: -1 } : { ...ZERO },
  };

  const greenCells = cells.filter((c) => isGreen(placement, c)).length;
  const greenRequired = Math.ceil(cells.length / 6);
  const heatHit = greenCells < greenRequired;
  const heat: EventOutcome = {
    year: 6,
    name: "기록적 폭염",
    hit: heatHit,
    requirement: `생활권 ${cells.length}칸 → 필요한 녹지 ${greenRequired}칸 / 현재 ${greenCells}칸`,
    delta: heatHit ? { social: -2, economy: 0, environment: -1 } : { ...ZERO },
  };

  const final = add(add(afterBuild, storm.delta), heat.delta);

  return {
    zone,
    cellCount: cells.length,
    lowlandCount,
    facilityCount: placed.length,
    base: zone.base,
    fromFacilities,
    adjustments,
    afterBuild,
    storm,
    heat,
    final,
    benefit: benefitOf(final),
  };
}

// ------------------------------------------------------------ 비인간 지표

const RIVER_LIFE_WEIGHT: Partial<Record<FacilityId, number>> = {
  wetland: 7,
  forest: 5,
  sewage: 4,
  basin: 2,
  industrial: -9,
  logistics: -5,
  mall: -5,
  apartment: -5,
  publicHousing: -2,
  shops: -2,
  brt: -2,
  school: -2,
  welfare: -2,
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** 녹지 칸들을 상하좌우로 이어 붙여 덩어리로 묶는다. */
function greenClusters(placement: Placement): Cell[][] {
  const seen = new Set<number>();
  const clusters: Cell[][] = [];
  for (const cell of GRID) {
    if (seen.has(cell.index) || !isGreen(placement, cell)) continue;
    const stack = [cell];
    const cluster: Cell[] = [];
    seen.add(cell.index);
    while (stack.length > 0) {
      const cur = stack.pop() as Cell;
      cluster.push(cur);
      for (const n of neighborsOf(cur)) {
        if (!seen.has(n.index) && isGreen(placement, n)) {
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
  let riverLife = 50;
  for (const cell of GRID) {
    if (!cell.riverside) continue;
    const id = placement[cell.index];
    if (id) riverLife += RIVER_LIFE_WEIGHT[id] ?? 0;
    else if (cell.terrain === "wetland") riverLife += 3;
  }

  const clusters = greenClusters(placement);
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
      value: clamp(largest * 8),
      caption: `가장 크게 이어진 녹지 덩어리 ${largest}칸. 녹지는 흩어놓을수록 약해집니다.`,
    },
    {
      key: "animalPath",
      name: "도시 속 동물",
      value: clamp(riverConnected * 10),
      caption: `하천까지 녹지로 이어진 칸 ${riverConnected}칸. 끊기면 동물이 오갈 길이 사라집니다.`,
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
  const gap = Math.round((bestZone.benefit - worstZone.benefit) * 10) / 10;
  const gapLevel: GapLevel = gap >= 5 ? "위험" : gap >= 3 ? "경계" : "안정";

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
