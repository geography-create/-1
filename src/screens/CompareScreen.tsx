// 저장해 둔 배치안을 나란히 놓고 보는 화면.
// "무엇을 바꾸면 무엇이 달라지는가"를 눈으로 익히는 것이 이 연습 도구의 핵심이다.

import Board from "../components/Board.tsx";
import { ZONES } from "../data/city.ts";
import { evaluate, type Placement } from "../lib/engine.ts";
import type { SavedPlan } from "../lib/storage.ts";

interface Props {
  placement: Placement;
  plans: SavedPlan[];
  onLoadPlan: (plan: SavedPlan) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function CompareScreen({ placement, plans, onLoadPlan, onBack, onNext }: Props) {
  const entries = [
    { id: "current", label: "지금 배치", placement, plan: null as SavedPlan | null },
    ...plans.map((p) => ({ id: p.id, label: p.label, placement: p.placement, plan: p })),
  ];
  const results = entries.map((e) => ({ ...e, result: evaluate(e.placement) }));

  return (
    <>
      <section className="card">
        <h2>안 비교</h2>
        {plans.length === 0 ? (
          <p className="notice">
            아직 저장한 안이 없습니다. 배치 화면에서 <b>안 저장해 두기</b>를 눌러 두면 여기서
            나란히 볼 수 있어요. 같은 예산으로 전혀 다른 도시를 만들어 보고, 무엇이 달라지는지
            비교해 보세요.
          </p>
        ) : (
          <p className="muted small">
            같은 예산이라도 어디에 놓느냐에 따라 격차가 얼마나 달라지는지 보세요. 종이 시험에서
            물어보는 건 결국 이 차이를 설명할 수 있느냐입니다.
          </p>
        )}

        <div className="scroll-x">
          <table className="data">
            <thead>
              <tr>
                <th>안</th>
                {ZONES.map((z) => (
                  <th className="num" key={z.id}>
                    {z.name}
                  </th>
                ))}
                <th className="num">격차</th>
                <th>수준</th>
                <th>혜택 최하</th>
                <th className="num">쓴 예산</th>
              </tr>
            </thead>
            <tbody>
              {results.map((e) => (
                <tr key={e.id}>
                  <td>
                    <b>{e.label}</b>
                  </td>
                  {ZONES.map((z) => (
                    <td className="num" key={z.id}>
                      {e.result.byZone[z.id].benefit}
                    </td>
                  ))}
                  <td className="num">{e.result.gap}</td>
                  <td>
                    <span
                      className={`tag ${
                        e.result.gapLevel === "위험"
                          ? "danger"
                          : e.result.gapLevel === "경계"
                            ? "warn"
                            : "good"
                      }`}
                    >
                      {e.result.gapLevel}
                    </span>
                  </td>
                  <td>{e.result.worstZone.zone.name}</td>
                  <td className="num">{e.result.spent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="scroll-x" style={{ marginTop: 16 }}>
          <table className="data">
            <thead>
              <tr>
                <th>안</th>
                <th className="num">하천 생태</th>
                <th className="num">도시 숲</th>
                <th className="num">도시 속 동물</th>
                <th>재난을 견딘 생활권</th>
              </tr>
            </thead>
            <tbody>
              {results.map((e) => (
                <tr key={e.id}>
                  <td>{e.label}</td>
                  {e.result.nonHuman.map((n) => (
                    <td className="num" key={n.key}>
                      {n.value}
                    </td>
                  ))}
                  <td>
                    호우 {e.result.zones.filter((z) => !z.storm.hit).length}/4 · 폭염{" "}
                    {e.result.zones.filter((z) => !z.heat.hit).length}/4
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {plans.length > 0 ? (
        <section className="card">
          <h2>저장한 안의 지도</h2>
          <div className="plan-boards">
            {plans.map((p) => (
              <div key={p.id}>
                <h3>{p.label}</h3>
                <Board placement={p.placement} readOnly />
                <button
                  type="button"
                  className="btn"
                  style={{ marginTop: 8 }}
                  onClick={() => onLoadPlan(p)}
                >
                  이 안 이어서 고치기
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <div className="nav-row">
        <button type="button" className="btn" onClick={onBack}>
          결과로 돌아가기
        </button>
        <button type="button" className="btn primary" onClick={onNext}>
          서술 연습하러 가기
        </button>
      </div>
    </>
  );
}
