import type { ReasonKey, SavedPlan } from "../data/items";
import SpectrumBar, { type SpectrumMarker } from "../components/SpectrumBar";

interface Props {
  savedPlans: SavedPlan[];
  reflection: string;
  onReflectionChange: (text: string) => void;
  finished: boolean;
  onFinish: () => void;
  onBack: () => void;
}

const REASON_POSITION: Record<ReasonKey, number> = {
  human: 14,
  balance: 50,
  nature: 86,
};

const MARKER_COLORS = ["#c96f34", "#7a6fb0", "#2f6f5e", "#3f7dc4", "#b0546f"];

export default function WrapupScreen({
  savedPlans,
  reflection,
  onReflectionChange,
  finished,
  onFinish,
  onBack,
}: Props) {
  const finalPlan = savedPlans[savedPlans.length - 1];

  const markers: SpectrumMarker[] = savedPlans.map((plan, i) => {
    const stagger = (i - (savedPlans.length - 1) / 2) * 3;
    const position = Math.max(4, Math.min(96, REASON_POSITION[plan.reason] + stagger));
    return {
      id: plan.id,
      position,
      label: plan.label,
      color: MARKER_COLORS[i % MARKER_COLORS.length],
      emphasized: plan.id === finalPlan?.id,
    };
  });

  return (
    <section className="screen wrapup-screen">
      <header className="screen-header">
        <p className="eyebrow">정리 · 10분</p>
        <h1>이유가 관점을 가른다</h1>
        <p className="lede">
          내가 저장한 안들이 스펙트럼의 어디쯤에 놓이는지 확인하고, 같은 선택도 이유에 따라 관점이
          달라진다는 것을 정리해 보세요.
        </p>
      </header>

      <div className="panel">
        <h2>내 안들의 위치</h2>
        {savedPlans.length === 0 ? (
          <p className="muted">저장된 안이 없어요. 탐색 화면으로 돌아가 안을 저장해 보세요.</p>
        ) : (
          <>
            <SpectrumBar markers={markers} />
            {finalPlan && (
              <p className="muted spectrum-note">
                진하게 표시된 <strong>{finalPlan.label}</strong>이 가장 최근에 저장한 최종 안이에요.
              </p>
            )}
          </>
        )}
      </div>

      <div className="concept-grid">
        <div className="concept-card human">
          <h3>인간중심주의</h3>
          <p>자연을 인간의 삶에 필요한 도구나 자원으로 바라보며, 인간의 이익과 편의를 우선하는 관점이에요.</p>
        </div>
        <div className="concept-card nature">
          <h3>생태중심주의</h3>
          <p>인간도 자연의 일부이며, 자연은 그 자체로 존중받아야 할 고유한 가치를 지닌다고 보는 관점이에요.</p>
        </div>
      </div>

      <p className="muted">
        참고로 오늘 다룬 두 관점 외에도, 인간과 자연의 조화를 강조하는 관점처럼 다양한 시각이 있어요. 어떤
        관점이 정답이라기보다, 자신의 선택을 얼마나 타당한 근거로 설명할 수 있는지가 중요해요.
      </p>

      <div className="panel">
        <h2>한 줄 성찰</h2>
        <p className="muted">
          오늘 활동에서 느낀 점, 또는 이유가 갈렸던 순간을 한 줄로 적어보세요.
        </p>
        <textarea
          rows={3}
          value={reflection}
          onChange={(e) => onReflectionChange(e.target.value)}
          placeholder="예) 나는 산책로를 넓히고 싶었지만, 짝은 물고기가 다칠까봐 반대했다..."
        />
      </div>

      {finished ? (
        <div className="notice-box success">
          <h2>작성 완료</h2>
          <p>선생님이 화면을 확인하러 오실 거예요. 새로고침하면 기록이 사라지니 그대로 기다려 주세요.</p>
        </div>
      ) : (
        <footer className="screen-footer">
          <button type="button" className="ghost-btn" onClick={onBack}>
            ← 비교로
          </button>
          <button
            type="button"
            className="primary-btn"
            onClick={onFinish}
            disabled={!reflection.trim() || savedPlans.length === 0}
          >
            작성 완료
          </button>
        </footer>
      )}
      {!finished && !reflection.trim() && <p className="muted">한 줄 성찰을 작성하면 완료할 수 있어요.</p>}
    </section>
  );
}
