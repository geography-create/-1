import { useEffect, useState } from "react";
import {
  activeSynergies,
  computeActualSpectrumPosition,
  getBadge,
  type ReasonKey,
  type SavedPlan,
} from "../data/grid";
import { isSubmissionConfigured, submitToSheet } from "../lib/submit";
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

const PERSPECTIVE_LABELS: Record<ReasonKey, string> = {
  human: "인간중심주의",
  balance: "균형·조화",
  nature: "생태중심주의",
};

const MARKER_COLORS = ["#c96f34", "#7a6fb0", "#2f6f5e", "#3f7dc4", "#b0546f"];

function actualPerspectiveLabel(position: number): string {
  if (position < 32) return "인간중심주의";
  if (position < 68) return "균형·조화";
  return "생태중심주의";
}

export default function WrapupScreen({
  savedPlans,
  reflection,
  onReflectionChange,
  finished,
  onFinish,
  onBack,
}: Props) {
  const [classNo, setClassNo] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [name, setName] = useState("");
  const [finalReason, setFinalReason] = useState("");
  const [finalPlanId, setFinalPlanId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sentToSheet, setSentToSheet] = useState(false);

  useEffect(() => {
    if (savedPlans.length === 0) return;
    if (!finalPlanId || !savedPlans.some((p) => p.id === finalPlanId)) {
      setFinalPlanId(savedPlans[savedPlans.length - 1].id);
    }
  }, [savedPlans, finalPlanId]);

  const finalPlan = savedPlans.find((p) => p.id === finalPlanId) ?? savedPlans[savedPlans.length - 1];

  const markers: SpectrumMarker[] = savedPlans.map((plan, i) => {
    const position = Math.max(4, Math.min(96, REASON_POSITION[plan.reason]));
    return {
      id: plan.id,
      position,
      label: plan.label,
      color: MARKER_COLORS[i % MARKER_COLORS.length],
      emphasized: plan.id === finalPlan?.id,
    };
  });

  const actualMarkers: SpectrumMarker[] = savedPlans.map((plan, i) => {
    const position = Math.max(4, Math.min(96, computeActualSpectrumPosition(plan.values)));
    return {
      id: plan.id,
      position,
      label: plan.label,
      color: MARKER_COLORS[i % MARKER_COLORS.length],
      emphasized: plan.id === finalPlan?.id,
    };
  });

  const canFinish =
    Boolean(reflection.trim()) &&
    Boolean(finalReason.trim()) &&
    Boolean(classNo.trim()) &&
    Boolean(studentNo.trim()) &&
    Boolean(name.trim()) &&
    savedPlans.length > 0;

  async function handleFinish() {
    if (!canFinish || !finalPlan) return;
    setSubmitting(true);

    const badge = getBadge(finalPlan.values);
    const synergies = activeSynergies(finalPlan.placements);
    const synergySummary =
      synergies.length > 0
        ? synergies.map(({ synergy, count }) => `${synergy.label}${count > 1 ? ` ×${count}` : ""}`).join(" · ")
        : "없음";

    const actualPosition = computeActualSpectrumPosition(finalPlan.values);

    const ok = await submitToSheet({
      classNo: classNo.trim(),
      studentNo: studentNo.trim(),
      name: name.trim(),
      perspective: PERSPECTIVE_LABELS[finalPlan.reason],
      reasonNote: finalPlan.reasonNote,
      finalReason: finalReason.trim(),
      actualPerspective: actualPerspectiveLabel(actualPosition),
      actualPosition,
      reflection: reflection.trim(),
      badge: `${badge.icon} ${badge.label}`,
      synergySummary,
    });

    setSentToSheet(ok);
    setSubmitting(false);
    onFinish();
  }

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
            <p className="spectrum-label">내가 말한 이유</p>
            <SpectrumBar markers={markers} />
            <p className="spectrum-label spectrum-label-second">실제 배치 결과</p>
            <SpectrumBar markers={actualMarkers} />
            {finalPlan && (
              <p className="muted spectrum-note">
                진하게 표시된 <strong>{finalPlan.label}</strong>이 아래에서 고를 최종 안이에요. 두 그래프
                위치가 다르다면, 말한 이유와 실제로 지은 것 사이에 차이가 있었다는 뜻이에요 — 왜 그런지
                이야기해 보세요.
              </p>
            )}
          </>
        )}
      </div>

      {savedPlans.length > 0 && (
        <div className="panel">
          <h2>최종 선택 이유</h2>
          <p className="muted">어떤 안을 최종안으로 제출할지 골라주세요.</p>
          <div className="reason-chips final-plan-picker">
            {savedPlans.map((plan) => (
              <button
                key={plan.id}
                type="button"
                className={`reason-chip${finalPlanId === plan.id ? " selected" : ""}`}
                onClick={() => setFinalPlanId(plan.id)}
                disabled={finished}
              >
                {plan.label}
              </button>
            ))}
          </div>
          <p className="muted">
            <strong>{finalPlan?.label}</strong>을 최종안으로 고른 이유를, 포기한 다른 안과 비교해서
            설명해 보세요.
          </p>
          <textarea
            rows={3}
            value={finalReason}
            onChange={(e) => setFinalReason(e.target.value)}
            placeholder="예) 안 1보다 텃밭공원을 늘렸다. 편의성은 조금 낮아지지만 생태 다양성이 더 중요하다고 판단했다."
            disabled={finished}
          />
        </div>
      )}

      <div className="concept-grid">
        <div className={`concept-card human${finalPlan?.reason === "human" ? " active" : ""}`}>
          <h3>
            인간중심주의
            {finalPlan?.reason === "human" && <span className="active-badge">✓ 내 최종 선택</span>}
          </h3>
          <p>자연을 인간의 삶에 필요한 도구나 자원으로 바라보며, 인간의 이익과 편의를 우선하는 관점이에요.</p>
        </div>
        <div className={`concept-card nature${finalPlan?.reason === "nature" ? " active" : ""}`}>
          <h3>
            생태중심주의
            {finalPlan?.reason === "nature" && <span className="active-badge">✓ 내 최종 선택</span>}
          </h3>
          <p>인간도 자연의 일부이며, 자연은 그 자체로 존중받아야 할 고유한 가치를 지닌다고 보는 관점이에요.</p>
        </div>
      </div>

      <p className="muted">
        참고로 오늘 다룬 두 관점 외에도, 인간과 자연의 조화를 강조하는 관점처럼 다양한 시각이 있어요. 어떤
        관점이 정답이라기보다, 자신의 선택을 얼마나 타당한 근거로 설명할 수 있는지가 중요해요.
        {finalPlan?.reason === "balance" && " 방금 고른 최종안은 그 조화의 관점에 가장 가까워요."}
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
          disabled={finished}
        />
      </div>

      {!finished && (
        <div className="panel">
          <h2>제출 정보</h2>
          <p className="muted">
            선생님이 결과를 확인할 수 있도록 반·번호·이름을 입력해 주세요.
            {isSubmissionConfigured()
              ? " 작성 완료를 누르면 이 정보와 한 줄 성찰이 선생님의 구글 시트로 전송돼요."
              : " (현재는 시트 연동이 설정되지 않아 이 기기에만 표시돼요.)"}
          </p>
          <div className="submit-fields">
            <label>
              반
              <input type="text" inputMode="numeric" value={classNo} onChange={(e) => setClassNo(e.target.value)} placeholder="예) 3" />
            </label>
            <label>
              번호
              <input type="text" inputMode="numeric" value={studentNo} onChange={(e) => setStudentNo(e.target.value)} placeholder="예) 12" />
            </label>
            <label className="submit-field-name">
              이름
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="예) 홍길동" />
            </label>
          </div>
        </div>
      )}

      {finished && (
        <div className="notice-box success">
          <h2>작성 완료</h2>
          <p>
            {isSubmissionConfigured()
              ? sentToSheet
                ? "선생님의 구글 시트로 제출을 시도했어요. 실제로 기록됐는지는 선생님이 시트에서 확인해 주세요."
                : "시트로 전송하는 데 실패했어요. 네트워크 연결을 확인하고 선생님께 알려주세요."
              : "이 기기에서 작성이 완료됐어요. 시트 연동이 설정되지 않아 별도로 전송되지는 않았어요."}
          </p>
          <p>새로고침하면 기록이 사라지니, 선생님이 확인할 때까지 화면을 그대로 두세요.</p>
        </div>
      )}

      <footer className="screen-footer">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← 비교로
        </button>
        {!finished && (
          <button type="button" className="primary-btn" onClick={handleFinish} disabled={!canFinish || submitting}>
            {submitting ? "제출 중..." : "작성 완료"}
          </button>
        )}
      </footer>
      {!finished && !canFinish && (
        <p className="muted">
          반·번호·이름을 모두 입력하고, 최종 선택 이유와 한 줄 성찰을 작성하면 완료할 수 있어요.
        </p>
      )}
    </section>
  );
}
