import Board from "../components/Board.tsx";
import { cellName } from "../lib/labels.ts";
import { Timeline, ZoneBars } from "../components/Charts.tsx";
import Meters from "../components/Meters.tsx";
import { GRID } from "../data/city.ts";
import { FACILITY_BY_ID } from "../data/facilities.ts";
import type { CityResult, Placement, ZoneResult } from "../lib/engine.ts";

interface Props {
  placement: Placement;
  result: CityResult;
  onBack: () => void;
  onNext: () => void;
}

export default function ResultScreen({ placement, result, onBack, onNext }: Props) {
  const gapTag =
    result.gapLevel === "위험" ? "danger" : result.gapLevel === "경계" ? "warn" : "good";

  return (
    <>
      <section className="card">
        <h2>생활권 간 격차</h2>
        <p>
          종합 생활 편익 지수가 가장 높은 곳은 <b>{result.bestZone.zone.name}</b>(
          {result.bestZone.benefit}), 가장 낮은 곳은 <b>{result.worstZone.zone.name}</b>(
          {result.worstZone.benefit})입니다. 차이는 <b>{result.gap}</b>이고,{" "}
          <span className={`tag ${gapTag}`}>{result.gapLevel} 수준</span>입니다.
        </p>
        <p className="muted small">
          차이 3 미만은 안정, 3 이상 5 미만은 경계, 5 이상은 위험으로 봅니다. 종합 생활 편익
          지수는 사회 지수 0.4 + 경제 지수 0.3 + 환경 지수 0.3으로 계산합니다.
        </p>
        <div className="scroll-x">
          <table className="data">
            <thead>
              <tr>
                <th>생활권</th>
                <th className="num">사회</th>
                <th className="num">경제</th>
                <th className="num">환경</th>
                <th className="num">종합 생활 편익</th>
                <th>3년차 집중호우</th>
                <th>6년차 폭염</th>
              </tr>
            </thead>
            <tbody>
              {result.zones.map((z) => (
                <tr key={z.zone.id}>
                  <td>
                    <b>{z.zone.name}</b>
                    {z.zone.id === result.worstZone.zone.id ? (
                      <>
                        {" "}
                        <span className="tag danger">최하</span>
                      </>
                    ) : null}
                  </td>
                  <td className="num">{z.final.social}</td>
                  <td className="num">{z.final.economy}</td>
                  <td className="num">{z.final.environment}</td>
                  <td className="num">
                    <b>{z.benefit}</b>
                  </td>
                  <td>
                    {z.storm.hit ? (
                      <span className="tag danger">침수</span>
                    ) : (
                      <span className="tag good">견딤</span>
                    )}
                  </td>
                  <td>
                    {z.heat.hit ? (
                      <span className="tag danger">피해</span>
                    ) : (
                      <span className="tag good">견딤</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="two-col">
        <section className="card">
          <h2>생활권별 세 지수</h2>
          <ZoneBars zones={result.zones} />
        </section>
        <section className="card">
          <h2>도시 전체의 6년</h2>
          <Timeline result={result} />
        </section>
      </div>

      <section className="card">
        <h2>비인간 이웃은 어떻게 되었나</h2>
        <Meters
          items={result.nonHuman.map((n) => ({
            name: n.name,
            value: n.value,
            caption: n.caption,
          }))}
          hint="세 지표 모두 100점 만점입니다. 서술 ①번에서 이 결과를 근거로 쓸 수 있습니다."
        />
      </section>

      <section className="card">
        <h2>생활권마다 무슨 일이 있었나</h2>
        <p className="muted small">
          숫자가 어디서 왔는지 그대로 펼쳐 놓았습니다. 서술 ②번은 여기서 근거를 찾으면 됩니다.
        </p>
        {result.zones.map((z) => (
          <ZoneDetail key={z.zone.id} zone={z} />
        ))}
      </section>

      <div className="two-col">
        <section className="card">
          <h2>최종 배치</h2>
          <Board placement={placement} readOnly />
        </section>
        <section className="card">
          <h2>배치한 시설 목록</h2>
          <div className="scroll-x">
            <table className="data">
              <thead>
                <tr>
                  <th>칸</th>
                  <th>생활권</th>
                  <th>시설</th>
                  <th className="num">비용</th>
                </tr>
              </thead>
              <tbody>
                {GRID.filter((c) => placement[c.index]).map((c) => {
                  const f = FACILITY_BY_ID[placement[c.index]];
                  return (
                    <tr key={c.index}>
                      <td>{cellName(c)}</td>
                      <td>{result.zones.find((z) => z.zone.id === c.zone)?.zone.name ?? "-"}</td>
                      <td>{f.name}</td>
                      <td className="num">{f.cost}</td>
                    </tr>
                  );
                })}
                <tr>
                  <th colSpan={3}>합계</th>
                  <th className="num">{result.spent}</th>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="nav-row">
        <button type="button" className="btn" onClick={onBack}>
          배치 고치러 가기
        </button>
        <button type="button" className="btn primary" onClick={onNext}>
          서술 쓰러 가기
        </button>
      </div>
    </>
  );
}

function ZoneDetail({ zone: z }: { zone: ZoneResult }) {
  return (
    <details style={{ marginBottom: 8 }}>
      <summary>
        <b>{z.zone.name}</b> — 종합 생활 편익 {z.benefit} · 시설 {z.facilityCount}개 ·{" "}
        {z.cellCount}칸(저지대 {z.lowlandCount}칸)
      </summary>
      <p className="muted small" style={{ marginTop: 8 }}>
        {z.zone.summary}
      </p>
      <div className="scroll-x">
        <table className="data">
          <thead>
            <tr>
              <th>단계</th>
              <th className="num">사회</th>
              <th className="num">경제</th>
              <th className="num">환경</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>출발선(초기 조건)</td>
              <td className="num">{z.base.social}</td>
              <td className="num">{z.base.economy}</td>
              <td className="num">{z.base.environment}</td>
            </tr>
            <tr>
              <td>놓은 시설의 효과</td>
              <td className="num">{z.fromFacilities.social}</td>
              <td className="num">{z.fromFacilities.economy}</td>
              <td className="num">{z.fromFacilities.environment}</td>
            </tr>
            {z.adjustments.map((a) => (
              <tr key={a.label}>
                <td>{a.label}</td>
                <td className="num">{a.delta.social || ""}</td>
                <td className="num">{a.delta.economy || ""}</td>
                <td className="num">{a.delta.environment || ""}</td>
              </tr>
            ))}
            <tr>
              <th>배치 직후(0년차)</th>
              <th className="num">{z.afterBuild.social}</th>
              <th className="num">{z.afterBuild.economy}</th>
              <th className="num">{z.afterBuild.environment}</th>
            </tr>
            <tr>
              <td>
                3년차 집중호우 {z.storm.hit ? "(침수)" : "(견딤)"}
                <br />
                <span className="muted small">{z.storm.requirement}</span>
              </td>
              <td className="num">{z.storm.delta.social || ""}</td>
              <td className="num">{z.storm.delta.economy || ""}</td>
              <td className="num">{z.storm.delta.environment || ""}</td>
            </tr>
            <tr>
              <td>
                6년차 폭염 {z.heat.hit ? "(피해)" : "(견딤)"}
                <br />
                <span className="muted small">{z.heat.requirement}</span>
              </td>
              <td className="num">{z.heat.delta.social || ""}</td>
              <td className="num">{z.heat.delta.economy || ""}</td>
              <td className="num">{z.heat.delta.environment || ""}</td>
            </tr>
            <tr>
              <th>최종(6년차)</th>
              <th className="num">{z.final.social}</th>
              <th className="num">{z.final.economy}</th>
              <th className="num">{z.final.environment}</th>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  );
}
