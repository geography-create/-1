import { useMemo, useState } from "react";
import {
  INDICATORS,
  REASON_OPTIONS,
  TILE_TYPES,
  TOTAL_BUDGET,
  countByType,
  simulateGrid,
  type IndicatorValues,
  type Placements,
  type ReasonKey,
  type SavedPlan,
  type TileTypeKey,
} from "../data/grid";
import TileGrid from "../components/TileGrid";
import TilePalette from "../components/TilePalette";
import IndicatorRadar from "../components/IndicatorRadar";

interface Props {
  placements: Placements;
  onPlaceTile: (row: number, col: number, type: TileTypeKey) => void;
  onRemoveTile: (row: number, col: number) => void;
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
  savedPlans: SavedPlan[];
  onSavePlan: (reason: ReasonKey, note: string) => void;
  onLoadPlan: (id: string) => void;
  onDeletePlan: (id: string) => void;
  onNext: () => void;
}

const CURRENT_COLOR = "#2f6f5e";

export default function ExploreScreen({
  placements,
  onPlaceTile,
  onRemoveTile,
  onReset,
  onUndo,
  canUndo,
  savedPlans,
  onSavePlan,
  onLoadPlan,
  onDeletePlan,
  onNext,
}: Props) {
  const [armed, setArmed] = useState<TileTypeKey | null>(null);
  const [savePanelOpen, setSavePanelOpen] = useState(false);
  const [reason, setReason] = useState<ReasonKey | null>(null);
  const [note, setNote] = useState("");

  const values: IndicatorValues = useMemo(() => simulateGrid(placements), [placements]);
  const placedCounts = useMemo(() => countByType(placements), [placements]);
  const remaining = useMemo(() => {
    const r = {} as Record<TileTypeKey, number>;
    for (const t of TILE_TYPES) r[t.key] = t.maxCount - placedCounts[t.key];
    return r;
  }, [placedCounts]);
  const totalPlaced = Object.keys(placements).length;

  function handleCellClick(row: number, col: number) {
    const occupied = Object.prototype.hasOwnProperty.call(placements, `${row},${col}`);
    if (occupied) {
      onRemoveTile(row, col);
      return;
    }
    if (armed && remaining[armed] > 0) {
      onPlaceTile(row, col, armed);
      if (remaining[armed] - 1 <= 0) setArmed(null);
    }
  }

  function confirmSave() {
    if (!reason) return;
    onSavePlan(reason, note.trim());
    setSavePanelOpen(false);
    setReason(null);
    setNote("");
  }

  return (
    <section className="screen explore-screen">
      <header className="screen-header">
        <p className="eyebrow">탐색 · 20분</p>
        <h1>내가 정하는 승기천 마을</h1>
        <p className="lede">
          팔레트에서 타일을 고른 뒤 빈 칸을 눌러 배치하세요. 놓인 타일을 다시 누르면 없앨 수 있어요.
          타일은 종류마다 <strong>2개씩, 총 {TOTAL_BUDGET}개</strong>만 쓸 수 있어요. 서로 다른 안을{" "}
          <strong>3개</strong> 저장하고, 함께 오르지 않는 지표 짝이 있는지 찾아보세요.
        </p>
      </header>

      <div className="explore-layout">
        <div className="grid-column">
          <TilePalette armed={armed} remaining={remaining} onArm={setArmed} />
          <p className="budget-line">
            배치한 칸 <strong>{totalPlaced}</strong> / {TOTAL_BUDGET}
            {armed && <span className="armed-hint"> · 빈 칸을 눌러 배치하세요</span>}
          </p>
          <TileGrid placements={placements} onCellClick={handleCellClick} />
          <p className="muted grid-hint">
            파란 칸은 승기천이에요. 하천과 맞닿은 칸에 무엇을 놓느냐에 따라 지표가 더 크게 바뀌어요.
          </p>
        </div>

        <aside className="explore-side">
          <div className="panel">
            <IndicatorRadar datasets={[{ label: "현재 안", color: CURRENT_COLOR, values }]} size={260} />
            <ul className="indicator-bars">
              {INDICATORS.map((ind) => (
                <li key={ind.key}>
                  <div className="indicator-bar-label">
                    <span>{ind.label}</span>
                    <span>{values[ind.key]}</span>
                  </div>
                  <div className="indicator-bar-track">
                    <div
                      className="indicator-bar-fill"
                      style={{ width: `${values[ind.key]}%`, background: CURRENT_COLOR }}
                    />
                  </div>
                </li>
              ))}
            </ul>

            <div className="explore-actions">
              <button type="button" className="ghost-btn" onClick={onUndo} disabled={!canUndo}>
                ↩ 되돌리기
              </button>
              <button type="button" className="ghost-btn" onClick={onReset}>
                ⟲ 초기화
              </button>
            </div>

            {!savePanelOpen ? (
              <button type="button" className="primary-btn full" onClick={() => setSavePanelOpen(true)}>
                이 안 저장하기
              </button>
            ) : (
              <div className="save-panel">
                <p>이 안을 선택한 주된 이유는 무엇인가요?</p>
                <div className="reason-chips">
                  {REASON_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      className={`reason-chip${reason === opt.key ? " selected" : ""}`}
                      onClick={() => setReason(opt.key)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="(선택) 이유를 조금 더 적어보세요"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={2}
                />
                <div className="save-panel-actions">
                  <button type="button" className="ghost-btn" onClick={() => setSavePanelOpen(false)}>
                    취소
                  </button>
                  <button type="button" className="primary-btn" onClick={confirmSave} disabled={!reason}>
                    저장 완료
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <div className="saved-plans">
        <h2>
          저장된 안 · {savedPlans.length}개{" "}
          {savedPlans.length < 3 && <span className="hint-badge">3개 이상 권장</span>}
        </h2>
        {savedPlans.length === 0 ? (
          <p className="muted">아직 저장한 안이 없어요. 위에서 타일을 배치한 뒤 저장해 보세요.</p>
        ) : (
          <div className="plan-cards">
            {savedPlans.map((plan) => (
              <div key={plan.id} className="plan-card">
                <div className="plan-card-head">
                  <strong>{plan.label}</strong>
                  <button type="button" className="icon-btn" onClick={() => onDeletePlan(plan.id)} aria-label="삭제">
                    ×
                  </button>
                </div>
                <TileGrid placements={plan.placements} compact />
                <p className="plan-reason">{REASON_OPTIONS.find((r) => r.key === plan.reason)?.label}</p>
                {plan.reasonNote && <p className="plan-note">“{plan.reasonNote}”</p>}
                <ul className="plan-mini-values">
                  {INDICATORS.map((ind) => (
                    <li key={ind.key}>
                      {ind.shortLabel} {plan.values[ind.key]}
                    </li>
                  ))}
                </ul>
                <button type="button" className="ghost-btn small" onClick={() => onLoadPlan(plan.id)}>
                  이 안 불러오기
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="screen-footer">
        <button type="button" className="primary-btn" onClick={onNext} disabled={savedPlans.length < 2}>
          다음: 모둠과 비교하기 →
        </button>
        {savedPlans.length < 2 && <p className="muted">안을 2개 이상 저장하면 비교할 수 있어요.</p>}
      </footer>
    </section>
  );
}
