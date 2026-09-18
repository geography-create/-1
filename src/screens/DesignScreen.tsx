import { useMemo, useState } from "react";
import Board from "../components/Board.tsx";
import { cellName, josa } from "../lib/labels.ts";
import Meters from "../components/Meters.tsx";
import { BUDGET, type Cell } from "../data/city.ts";
import {
  FACILITIES,
  FACILITY_BY_ID,
  type Facility,
  type FacilityId,
} from "../data/facilities.ts";
import {
  evaluate,
  placementError,
  removalError,
  totalSpent,
  type Placement,
} from "../lib/engine.ts";

const MIN_SPEND = 60;

interface Props {
  placement: Placement;
  setPlacement: (next: Placement) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function DesignScreen({ placement, setPlacement, onBack, onNext }: Props) {
  const [selected, setSelected] = useState<FacilityId | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "ok"; text: string } | null>(null);

  const spent = totalSpent(placement);
  const remaining = BUDGET - spent;
  const result = useMemo(() => evaluate(placement), [placement]);

  function handleCell(cell: Cell) {
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
        text: `${cellName(cell)} 칸의 ${removed.name}${josa(removed.name, "을", "를")} 치웠습니다.`,
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
        text: `예산이 ${remaining} 남았습니다. ${facility.name}은(는) ${facility.cost}이 듭니다.`,
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

  const emptyZones = result.zones.filter((z) => z.facilityCount === 0);
  const stormRisk = result.zones.filter((z) => z.storm.hit);
  const heatRisk = result.zones.filter((z) => z.heat.hit);
  const canProceed = spent >= MIN_SPEND && spent <= BUDGET;

  return (
    <>
      <div className="design-layout">
        <section className="card">
          <h2>한여울시 격자 지도</h2>
          <p className="muted small">
            오른쪽에서 시설을 고른 뒤 빈 칸을 누르면 놓입니다. 이미 놓은 칸을 다시 누르면
            치워집니다.
          </p>
          <Board placement={placement} onCellClick={handleCell} />
          {message ? (
            <p className={`notice ${message.kind === "error" ? "error" : "ok"}`} role="status">
              {message.text}
            </p>
          ) : null}
        </section>

        <div>
          <section className="card">
            <div className="budget-bar">
              <span className="amount">{remaining}</span>
              <span className="muted">
                / {BUDGET} 남음 · 시설 {result.placedCount}개
              </span>
            </div>
            <div className="budget-track">
              <div style={{ width: `${Math.min(100, (spent / BUDGET) * 100)}%` }} />
            </div>
            <p className="muted small" style={{ marginTop: 8 }}>
              최소 {MIN_SPEND} 이상 써야 다음 단계로 넘어갈 수 있습니다.
            </p>
            {selected ? (
              <SelectedNote facility={FACILITY_BY_ID[selected]} />
            ) : (
              <p className="muted small">아래에서 시설을 고르세요.</p>
            )}
            <div className="palette">
              {FACILITIES.map((f) => (
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
                    <span>{f.cost}억</span>
                    <span className="s">사 {fmt(f.effect.social)}</span>
                    <span className="e">경 {fmt(f.effect.economy)}</span>
                    <span className="v">환 {fmt(f.effect.environment)}</span>
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <h3>지금 생활권별 지수</h3>
            <p className="muted small">재난은 아직 반영하지 않은, 배치 직후 값입니다.</p>
            <div className="scroll-x">
              <table className="data">
                <thead>
                  <tr>
                    <th>생활권</th>
                    <th className="num">시설</th>
                    <th className="num">사회</th>
                    <th className="num">경제</th>
                    <th className="num">환경</th>
                  </tr>
                </thead>
                <tbody>
                  {result.zones.map((z) => (
                    <tr key={z.zone.id}>
                      <td>{z.zone.name}</td>
                      <td className="num">{z.facilityCount}</td>
                      <td className="num">{z.afterBuild.social}</td>
                      <td className="num">{z.afterBuild.economy}</td>
                      <td className="num">{z.afterBuild.environment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="card">
            <h3>비인간 이웃</h3>
            <Meters
              items={result.nonHuman.map((n) => ({
                name: n.name,
                value: n.value,
                caption: n.caption,
              }))}
            />
          </section>

          <section className="card">
            <h3>지금 이대로라면</h3>
            <ul className="small">
              {stormRisk.length > 0 ? (
                <li>
                  <span className="tag danger">3년차 집중호우</span>{" "}
                  {stormRisk.map((z) => z.zone.name).join(", ")}
                  {josa(stormRisk[stormRisk.length - 1].zone.name, "이", "가")} 견디지 못합니다.
                </li>
              ) : (
                <li>
                  <span className="tag good">3년차 집중호우</span> 네 생활권 모두 견딥니다.
                </li>
              )}
              {heatRisk.length > 0 ? (
                <li>
                  <span className="tag danger">6년차 폭염</span>{" "}
                  {heatRisk.map((z) => z.zone.name).join(", ")}의 녹지가 모자랍니다.
                </li>
              ) : (
                <li>
                  <span className="tag good">6년차 폭염</span> 네 생활권 모두 녹지가 충분합니다.
                </li>
              )}
              {emptyZones.length > 0 ? (
                <li>
                  <span className="tag warn">빈 생활권</span>{" "}
                  {emptyZones.map((z) => z.zone.name).join(", ")}에 아무것도 놓지 않았습니다.
                  일부러 그랬다면 그 이유를 서술에 쓰면 됩니다.
                </li>
              ) : null}
            </ul>
          </section>
        </div>
      </div>

      <div className="nav-row">
        <button type="button" className="btn" onClick={onBack}>
          과제 안내로
        </button>
        <span className="muted small">
          {canProceed ? "" : `${Math.max(0, MIN_SPEND - spent)}만큼 더 써야 합니다.`}
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
      <b>{facility.name}</b> ({facility.cost}억) — {facility.note}
    </div>
  );
}

function fmt(n: number): string {
  return n > 0 ? `+${n}` : `${n}`;
}
