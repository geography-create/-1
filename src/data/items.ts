// 승기천 정비 시뮬레이터 — 데이터 모델
// 6개 정비 항목(3단계)과 5개 지표, 그리고 지표 계산 로직을 정의합니다.
// 지표 수치는 교육용으로 설계한 가상 모델이며 실제 승기천 정비사업의 예측값이 아닙니다.

export type IndicatorKey =
  | "flood"
  | "convenience"
  | "biodiversity"
  | "water"
  | "scenery";

export interface Indicator {
  key: IndicatorKey;
  label: string;
  shortLabel: string;
  description: string;
  base: number;
}

export const INDICATORS: Indicator[] = [
  {
    key: "flood",
    label: "홍수 안전성",
    shortLabel: "안전",
    description: "폭우가 왔을 때 물이 넘치지 않고 잘 빠지는 정도예요.",
    base: 26,
  },
  {
    key: "convenience",
    label: "이용 편의성",
    shortLabel: "편의",
    description: "사람들이 걷고, 쉬고, 운동하기 편한 정도예요.",
    base: 30,
  },
  {
    key: "biodiversity",
    label: "생태 다양성",
    shortLabel: "생태",
    description: "물고기, 곤충, 식물이 살아가기 좋은 정도예요.",
    base: 75,
  },
  {
    key: "water",
    label: "수질",
    shortLabel: "수질",
    description: "물이 스스로 깨끗해지는 자정 능력이 있는 정도예요.",
    base: 70,
  },
  {
    key: "scenery",
    label: "경관 자연성",
    shortLabel: "경관",
    description: "인공적이지 않고 자연 그대로처럼 보이는 정도예요.",
    base: 68,
  },
];

export interface ItemLevel {
  label: string;
  description: string;
}

export interface RestorationItem {
  key: string;
  title: string;
  icon: string;
  question: string;
  levels: [ItemLevel, ItemLevel, ItemLevel];
  // 레벨 2(최대)일 때의 지표 변화량. 레벨 0은 변화 없음, 레벨 1은 절반 적용.
  effects: Partial<Record<IndicatorKey, number>>;
}

export const ITEMS: RestorationItem[] = [
  {
    key: "streambed",
    title: "하천 바닥(하상) 처리",
    icon: "🪨",
    question: "하천 바닥은 어떻게 할까요?",
    levels: [
      {
        label: "자연 그대로 두기",
        description: "자갈과 모래가 섞인 원래 하상을 그대로 유지해요.",
      },
      {
        label: "일부만 보강하기",
        description: "군데군데 자연석으로 바닥을 보강해요.",
      },
      {
        label: "콘크리트로 포장하기",
        description: "하상 전체를 콘크리트로 덮어 물이 빠르게 흐르게 해요.",
      },
    ],
    effects: { flood: 16, biodiversity: -10, water: -14 },
  },
  {
    key: "embankment",
    title: "제방·호안 형태",
    icon: "🧱",
    question: "물가의 둑(제방)은 어떤 모양으로 할까요?",
    levels: [
      {
        label: "완경사 자연형 호안",
        description: "흙과 식물로 덮인 완만한 경사를 그대로 둬요.",
      },
      {
        label: "계단식 혼합 호안",
        description: "돌과 식재를 섞은 계단형 호안으로 정비해요.",
      },
      {
        label: "수직 콘크리트 옹벽",
        description: "수직 콘크리트 벽을 세워 하천 폭을 최대한 확보해요.",
      },
    ],
    effects: { flood: 14, biodiversity: -10, convenience: 10 },
  },
  {
    key: "trail",
    title: "수변 산책로",
    icon: "🚶",
    question: "물가를 따라 걷는 길은 어떻게 만들까요?",
    levels: [
      {
        label: "최소한의 흙길만",
        description: "다니는 흔적만 남기고 따로 포장하지 않아요.",
      },
      {
        label: "기본 산책로",
        description: "일부 구간만 나무 데크나 보도블록으로 포장해요.",
      },
      {
        label: "폭 넓은 포장길 + 자전거길",
        description: "전 구간을 넓게 포장해 자전거까지 다닐 수 있게 해요.",
      },
    ],
    effects: { convenience: 16, biodiversity: -6, scenery: -12 },
  },
  {
    key: "vegetation",
    title: "수변 식생",
    icon: "🌾",
    question: "물가에는 어떤 식물을 심을까요?",
    levels: [
      {
        label: "자생종 그대로 복원",
        description: "원래 그 자리에 살던 식물들을 그대로 살려요.",
      },
      {
        label: "자생종 + 관상용 혼합",
        description: "일부 구간에 보기 좋은 관상용 식물을 함께 심어요.",
      },
      {
        label: "관상용 화단 위주 조성",
        description: "화려한 관상용 화단을 중심으로 꾸며요.",
      },
    ],
    effects: { biodiversity: -10, water: -16, scenery: -10 },
  },
  {
    key: "facility",
    title: "조명·편의시설",
    icon: "💡",
    question: "밤에도 이용할 수 있는 시설을 둘까요?",
    levels: [
      {
        label: "설치하지 않음",
        description: "야간 이용은 제한되지만 하천은 밤에도 고요해요.",
      },
      {
        label: "최소한의 조명만",
        description: "안전을 위한 최소한의 조명만 설치해요.",
      },
      {
        label: "조명·운동기구·화장실 전면 설치",
        description: "밤에도 누구나 편하게 이용할 수 있도록 갖춰요.",
      },
    ],
    effects: { convenience: 14, biodiversity: -8, water: -10 },
  },
  {
    key: "channel",
    title: "하천 폭·물길",
    icon: "🌊",
    question: "굽이치는 물길은 그대로 둘까요?",
    levels: [
      {
        label: "자연 곡선 그대로 유지",
        description: "원래의 굽이치는 물길을 건드리지 않아요.",
      },
      {
        label: "일부 구간만 곧게 정비",
        description: "급하게 굽은 일부 구간만 완만하게 다듬어요.",
      },
      {
        label: "직선으로 넓게 확장",
        description: "물길을 곧게 펴고 폭을 넓혀 통수량을 늘려요.",
      },
    ],
    effects: { flood: 18, biodiversity: -10, scenery: -14 },
  },
];

// 승기천의 현재와 비슷한, 사람의 편의를 우선한 정비 상태를 시작점으로 둡니다.
export const DEFAULT_LEVELS: number[] = [2, 2, 1, 2, 1, 2];

export type IndicatorValues = Record<IndicatorKey, number>;

export function simulate(levels: number[]): IndicatorValues {
  const values = {} as IndicatorValues;
  for (const indicator of INDICATORS) {
    let total = indicator.base;
    ITEMS.forEach((item, i) => {
      const delta = item.effects[indicator.key];
      if (delta === undefined) return;
      const level = levels[i] ?? 0;
      total += delta * (level / 2);
    });
    values[indicator.key] = Math.max(0, Math.min(100, Math.round(total)));
  }
  return values;
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

export interface SavedPlan {
  id: string;
  label: string;
  levels: number[];
  values: IndicatorValues;
  reason: ReasonKey;
  reasonNote: string;
  savedAt: number;
}
