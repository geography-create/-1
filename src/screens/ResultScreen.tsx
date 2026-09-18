import Board from "../components/Board.tsx";
import { Timeline, ZoneBars } from "../components/Charts.tsx";
import Meters from "../components/Meters.tsx";
import ZoneMath from "../components/ZoneMath.tsx";
import { FIXED_PLACEMENT, GAP_DANGER, GAP_WARN, GRID } from "../data/city.ts";
import { FACILITY_BY_ID } from "../data/facilities.ts";
import type { CityResult, Placement } from "../lib/engine.ts";
import { cellName } from "../lib/labels.ts";

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
          종합 생활 편익이 가장 높은 곳은 <b>{result.bestZone.zone.name}</b>(
          {result.bestZone.benefit}), 가장 낮은 곳은 <b>{result.worstZone.zone.name}</b>(
          {result.worstZone.benefit})입니다. 차이는 <b>{result.gap}</b>,{" "}
          <span className={`tag ${gapTag}`}>{result.gapLevel} 수준</span>입니다.
        </p>
        <p className="muted small">
          종합 생활 편익 = 사회 + 경제 + 환경. 차이 {GAP_WARN} 미만은 안정, {GAP_WARN} 이상은
          경계, {GAP_DANGER} 이상은 위험으로 봅니다.
        </p>
        <div className="scroll-x">
          <table className="data">
            <thead>
              <tr>
                <th>생활권</th>
                <th className="num">사회</th>
                <th className="num">경제</th>
                <th className="num">환경</th>
                <th className="num">종합</th>
                <th>집중호우</th>
                <th>폭염</th>
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
                    <span className={`tag ${z.storm.hit ? "danger" : "good"}`}>
                      {z.storm.hit ? "침수" : "견딤"}
                    </span>
                  </td>
                  <td>
                    <span className={`tag ${z.heat.hit ? "danger" : "good"}`}>
                      {z.heat.hit ? "피해" : "견딤"}
                    </span>
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
          hint="종이 답안에서는 점수 대신 '하천변에 무엇을 놓았는지', '녹지가 이어졌는지 끊겼는지'를 눈으로 보고 쓰면 됩니다."
        />
      </section>

      <section className="card">
        <h2>계산 과정 다시 보기</h2>
        <p className="muted small">
          시험지에서는 이 표를 직접 채웁니다. 어떤 줄에서 숫자가 갈렸는지 확인하세요.
        </p>
        {result.zones.map((z) => (
          <ZoneMath key={z.zone.id} zone={z} />
        ))}
      </section>

      <div className="two-col">
        <section className="card">
          <h2>최종 배치</h2>
          <Board placement={placement} readOnly />
        </section>
        <section className="card">
          <h2>내가 놓은 시설</h2>
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
                {GRID.filter((c) => placement[c.index] && !FIXED_PLACEMENT[c.index]).map((c) => {
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
          저장한 안 비교하기
        </button>
      </div>
    </>
  );
}
