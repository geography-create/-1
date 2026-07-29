import { useState } from "react";
import { INDICATORS, REASON_OPTIONS, TILE_TYPES, countByType, getBadge, type SavedPlan } from "../data/grid";
import IndicatorRadar from "../components/IndicatorRadar";
import TileGrid from "../components/TileGrid";

interface Props {
  savedPlans: SavedPlan[];
  onNext: () => void;
  onBack: () => void;
}

const COLOR_A = "#c96f34";
const COLOR_B = "#2f6f5e";

export default function CompareScreen({ savedPlans, onNext, onBack }: Props) {
  const [idA, setIdA] = useState(savedPlans[0]?.id ?? "");
  const [idB, setIdB] = useState(savedPlans[savedPlans.length - 1]?.id ?? "");
  const [note, setNote] = useState("");

  const planA = savedPlans.find((p) => p.id === idA) ?? savedPlans[0];
  const planB = savedPlans.find((p) => p.id === idB) ?? savedPlans[savedPlans.length - 1];

  if (!planA || !planB) {
    return (
      <section className="screen">
        <p>비교할 안이 부족해요. 탐색 화면에서 안을 2개 이상 저장해 주세요.</p>
        <button type="button" className="primary-btn" onClick={onBack}>
          ← 탐색으로 돌아가기
        </button>
      </section>
    );
  }

  const countsA = countByType(planA.placements);
  const countsB = countByType(planB.placements);
  const typeDiffs = TILE_TYPES.map((t) => ({ type: t, from: countsA[t.key], to: countsB[t.key] })).filter(
    (d) => d.from !== d.to,
  );

  return (
    <section className="screen compare-screen">
      <header className="screen-header">
        <p className="eyebrow">비교 · 15분</p>
        <h1>왜 다르게 골랐을까</h1>
        <p className="lede">
          모둠 친구와 화면을 나란히 놓고, 처음 안과 최종 안이 무엇을 포기하고 무엇을 얻었는지
          이야기해 보세요.
        </p>
      </header>

      <div className="compare-pickers">
        <label>
          첫 번째 안
          <select value={planA.id} onChange={(e) => setIdA(e.target.value)}>
            {savedPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          두 번째 안
          <select value={planB.id} onChange={(e) => setIdB(e.target.value)}>
            {savedPlans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="compare-grids">
        <TileGrid placements={planA.placements} compact label={planA.label} />
        <TileGrid placements={planB.placements} compact label={planB.label} />
      </div>

      <div className="compare-layout">
        <IndicatorRadar
          datasets={[
            { label: planA.label, color: COLOR_A, values: planA.values },
            { label: planB.label, color: COLOR_B, values: planB.values },
          ]}
        />

        <div className="compare-details">
          <div className="compare-block">
            <h2>지표 변화</h2>
            <ul className="indicator-diff-list">
              {INDICATORS.map((ind) => {
                const delta = planB.values[ind.key] - planA.values[ind.key];
                return (
                  <li key={ind.key}>
                    <span>{ind.label}</span>
                    <span className={delta > 0 ? "delta-up" : delta < 0 ? "delta-down" : "delta-flat"}>
                      {planA.values[ind.key]} → {planB.values[ind.key]}
                      {delta !== 0 && (delta > 0 ? ` (+${delta})` : ` (${delta})`)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="compare-block">
            <h2>바뀐 타일 개수</h2>
            {typeDiffs.length === 0 ? (
              <p className="muted">두 안의 타일 구성이 동일해요.</p>
            ) : (
              <ul className="item-diff-list">
                {typeDiffs.map(({ type, from, to }) => {
                  const delta = to - from;
                  return (
                    <li key={type.key}>
                      <strong>
                        {type.icon} {type.label}
                      </strong>
                      <span>
                        {from}개 → {to}개 ({delta > 0 ? `+${delta}` : delta})
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="compare-block">
            <h2>선택 이유</h2>
            <p>
              <strong>{planA.label}</strong>: {REASON_OPTIONS.find((r) => r.key === planA.reason)?.label}
            </p>
            <p>
              <strong>{planB.label}</strong>: {REASON_OPTIONS.find((r) => r.key === planB.reason)?.label}
            </p>
          </div>

          <div className="compare-block">
            <h2>칭호</h2>
            <p>
              <strong>{planA.label}</strong>: {getBadge(planA.values).icon} {getBadge(planA.values).label}
            </p>
            <p>
              <strong>{planB.label}</strong>: {getBadge(planB.values).icon} {getBadge(planB.values).label}
            </p>
          </div>
        </div>
      </div>

      <div className="panel">
        <h2>모둠에서 나온 이야기 (선택)</h2>
        <p className="muted">무엇을 포기했는지, 이유가 갈린 지점은 어디였는지 적어보세요.</p>
        <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="모둠 토의 내용을 자유롭게 적어보세요" />
      </div>

      <footer className="screen-footer">
        <button type="button" className="ghost-btn" onClick={onBack}>
          ← 탐색으로
        </button>
        <button type="button" className="primary-btn" onClick={onNext}>
          다음: 정리하기 →
        </button>
      </footer>
    </section>
  );
}
