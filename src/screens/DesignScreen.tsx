import { useMemo, useState } from "react";
import Board from "../components/Board.tsx";
import Meters from "../components/Meters.tsx";
import ZoneMath from "../components/ZoneMath.tsx";
import { BUDGET, FIXED_PLACEMENT, GAP_DANGER, GAP_WARN, type Cell } from "../data/city.ts";
import { FACILITY_BY_ID, PLACEABLE, type Facility, type FacilityId } from "../data/facilities.ts";
import {
  evaluate,
  placementError,
  removalError,
  totalSpent,
  type Placement,
} from "../lib/engine.ts";
import { cellName, josa } from "../lib/labels.ts";
import { MAX_PLANS, type SavedPlan } from "../lib/storage.ts";

interface Props {
  placement: Placement;
  setPlacement: (next: Placement) => void;
  plans: SavedPlan[];
  onSavePlan: () => void;
  onLoadPlan: (plan: SavedPlan) => void;
  onRemovePlan: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function DesignScreen({
  placement,
  setPlacement,
  plans,
  onSavePlan,
  onLoadPlan,
  onRemovePlan,
  onBack,
  onNext,
}: Props) {
  const [selected, setSelected] = useState<FacilityId | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  const spent = totalSpent(placement);
  const remaining = BUDGET - spent;
  const result = useMemo(() => evaluate(placement), [placement]);

  function handleCell(cell: Cell) {
    if (FIXED_PLACEMENT[cell.index]) return;

    if (placement[cell.index]) {
      const err = removalError(placement, cell);
      if (err) {
        setMessage({ kind: "error", text: err });
        return;
      }
      const removed = FACILITY_BY_ID[placement[cell.index]];
      const next = { ...placement };
      delete next[cell.index];
      setPlacement(next);
      setMessage({
        kind: "ok",
        text: `${cellName(cell)} 칸의 ${removed.name}${josa(removed.name, "을", "를")} 치웠습니다. (+${removed.cost})`,
      });
      return;
    }

    if (!selected) {
      setMessage({ kind: "error", text: "먼저 오른쪽에서 놓을 시설을 고르세요." });
      return;
    }
    const facility = FACILITY_BY_ID[selected];
    if (facility.cost > remaining) {
      setMessage({
        kind: "error",
        text: `예산이 ${remaining} 남았습니다. ${facility.name}${josa(facility.name, "은", "는")} ${facility.cost}이 듭니다.`,
      });
      return;
    }
    const err = placementError(placement, selected, cell);
    if (err) {
      setMessage({ kind: "error", text: err });
      return;
    }
    setPlacement({ ...placement, [cell.index]: selected });
    setMessage({
      kind: "ok",
      text: `${cellName(cell)} 칸에 ${facility.name}${josa(facility.name, "을", "를")} 놓았습니다. (−${facility.cost})`,
    });
  }

  const canProceed = result.placedCount > 0;
  const emptySlots = Math.max(0, MAX_PLANS - plans.length);

  return (
    <>
      <div className="design-layout">
        <div>
          <section className="card">
            <h2>한여울시 격자 지도</h2>
            <p className="muted small">
              오른쪽에서 시설을 고른 뒤 빈 칸을 누르면 놓입니다. 내가 놓은 칸을 다시 누르면
              치워지고 예산이 돌아옵니다. 빗금 친 칸은 이미 있던 건물이라 지울 수 없습니다.
            </p>
            <Board placement={placement} onCellClick={handleCell} />
            {message ? (
              <p className={`notice ${message.kind === "error" ? "error" : "ok"}`} role="status">
                {message.text}
              </p>
            ) : null}
          </section>

          <section className="card">
            <h2>계산 과정</h2>
            <p className="muted small">
              시험지에서는 이 표를 직접 손으로 채우게 됩니다. 지금 어떤 줄에서 어떤 숫자가
              붙는지 눈에 익혀 두세요. 종합은 사회·경제·환경을 그냥 더한 값입니다.
            </p>
            {result.zones.map((z) => (
              <ZoneMath key={z.zone.id} zone={z} />
            ))}
          </section>
        </div>

        <div>
          <section className="card">
            <div className="budget-bar">
              <span className="amount">{remaining}</span>
              <span className="muted">
                / {BUDGET} 남음 · 내가 놓은 것 {result.placedCount}개
              </span>
            </div>
            <div className="budget-track">
              <div style={{ width: `${Math.min(100, (spent / BUDGET) * 100)}%` }} />
            </div>
            {selected ? (
              <SelectedNote facility={FACILITY_BY_ID[selected]} />
            ) : (
              <p className="muted small" style={{ marginTop: 10 }}>
                아래에서 시설을 고르세요.
              </p>
            )}
            <div className="palette">
              {PLACEABLE.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={selected === f.id}
                  disabled={f.cost > remaining}
                  onClick={() => {
                    setSelected(f.id);
                    setMessage(null);
                  }}
                  title={f.note}
                >
                  <span className="fac-name">
                    <span className="fac-glyph">{f.glyph}</span>
                    {f.name}
                  </span>
                  <span className="fac-effect">
                    <span>{f.cost}</span>
                    <span className="s">사 {fmt(f.effect.social)}</span>
                    <span className="e">경 {fmt(f.effect.economy)}</span>
                    <span className="v">환 {fmt(f.effect.environment)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>지금 생활권 격차</h3>
            <p>
              가장 높은 <b>{result.bestZone.zone.name}</b> {result.bestZone.benefit} · 가장 낮은{" "}
              <b>{result.worstZone.zone.name}</b> {result.worstZone.benefit} · 차이{" "}
              <b>{result.gap}</b>{" "}
              <span
                className={`tag ${
                  result.gapLevel === "위험" ? "danger" : result.gapLevel === "경계" ? "warn" : "good"
                }`}
              >
                {result.gapLevel}
              </span>
            </p>
            <p className="muted small" style={{ marginBottom: 0 }}>
              차이 {GAP_WARN} 미만 안정 · {GAP_WARN} 이상 경계 · {GAP_DANGER} 이상 위험
            </p>
          </section>

          <section className="card">
            <h3>안 저장해 두기</h3>
            <p className="muted small">
              지금 배치를 담아 두면 나중에 다른 안과 나란히 놓고 비교할 수 있습니다. 최대{" "}
              {MAX_PLANS}개.
            </p>
            <button
              type="button"
              className="btn"
              disabled={emptySlots === 0 || result.placedCount === 0}
              onClick={onSavePlan}
            >
              지금 배치를 {plans.length + 1}번 안으로 저장
            </button>
            <div className="plan-slots">
              {plans.map((plan) => (
                <div className="plan-slot" key={plan.id}>
                  <b>{plan.label}</b>
                  <div className="muted small">
                    시설 {Object.keys(plan.placement).length}개 · 격차{" "}
                    {evaluate(plan.placement).gap}
                  </div>
                  <div className="row">
                    <button type="button" onClick={() => onLoadPlan(plan)}>
                      불러오기
                    </button>
                    <button type="button" className="remove" onClick={() => onRemovePlan(plan.id)}>
                      지우기
                    </button>
                  </div>
                </div>
              ))}
              {Array.from({ length: emptySlots }, (_, i) => (
                <div className="plan-slot empty" key={`empty-${i}`}>
                  빈 자리
                </div>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>비인간 이웃</h3>
            <p className="muted small">
              이 셋은 손으로 세기 번거로워 앱에서만 점수로 보여 줍니다. 종이에서는 하천변에
              무엇을 놓았는지, 녹지가 이어졌는지 끊겼는지를 눈으로 보고 쓰면 됩니다.
            </p>
            <Meters
              items={result.nonHuman.map((n) => ({
                name: n.name,
                value: n.value,
                caption: n.caption,
              }))}
            />
          </section>
        </div>
      </div>

      <div className="nav-row">
        <button type="button" className="btn" onClick={onBack}>
          과제 안내로
        </button>
        <span className="muted small">
          {canProceed ? "" : "시설을 하나 이상 놓아야 넘어갈 수 있습니다."}
        </span>
        <button type="button" className="btn primary" disabled={!canProceed} onClick={onNext}>
          결과 확인하기
        </button>
      </div>
    </>
  );
}

function SelectedNote({ facility }: { facility: Facility }) {
  return (
    <div className="notice">
      <b>{facility.name}</b> (비용 {facility.cost}) — {facility.note}
    </div>
  );
}

function fmt(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}
