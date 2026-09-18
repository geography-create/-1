import {
  BUDGET,
  GAP_DANGER,
  GAP_WARN,
  GREEN_NEEDED,
  LOWLAND_PER_DEFENSE,
  ZONES,
} from "../data/city.ts";
import { FACILITIES, PLACEABLE } from "../data/facilities.ts";
import {
  ACHIEVEMENT_STANDARDS,
  BIG_IDEA,
  LEVELS,
  QUESTIONS,
  TOTAL_POINTS,
} from "../data/rubric.ts";

const FIXED_TILES = FACILITIES.filter((f) => f.fixedOnly);

export default function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="card">
        <h2>이건 연습입니다</h2>
        <p>
          실제 수행평가는 <b>종이에 칩니다.</b> 종이에서는 앱이 대신 계산해 주지 않으니, 시설을
          어디에 놓았을 때 어떤 숫자가 붙는지를 <b>직접 더할 수 있어야</b> 합니다. 이 앱은 그
          계산을 눈에 익히는 연습장이에요.
        </p>
        <ul>
          <li>배치 화면에는 네 생활권의 <b>계산 과정이 항상 펼쳐져</b> 있습니다.</li>
          <li>여러 가지 안을 저장해 두고 <b>나란히 비교</b>할 수 있습니다.</li>
          <li>반·번호·이름을 묻지 않고, 쓴 내용은 어디로도 전송되지 않습니다.</li>
        </ul>
        <p className="muted small" style={{ marginBottom: 0 }}>
          시험에서 물어볼 세 가지는 아래와 같습니다. 배치 자체에는 점수가 없고, 자기 선택을
          설명할 수 있느냐로 점수가 갈립니다.
        </p>
        <ol style={{ marginTop: 8 }}>
          {QUESTIONS.map((q) => (
            <li key={q.key}>{q.prompt}</li>
          ))}
        </ol>
      </section>

      <section className="card">
        <h2>계산 규칙 — 이것만 외우면 됩니다</h2>
        <div className="scroll-x">
          <table className="data">
            <tbody>
              <tr>
                <th style={{ width: "11em" }}>종합 생활 편익</th>
                <td>사회 + 경제 + 환경 (그냥 더합니다)</td>
              </tr>
              <tr>
                <th>생활권 격차</th>
                <td>
                  가장 높은 생활권 − 가장 낮은 생활권. {GAP_WARN} 미만 <b>안정</b>, {GAP_WARN} 이상{" "}
                  <b>경계</b>, {GAP_DANGER} 이상 <b>위험</b>
                </td>
              </tr>
              <tr>
                <th>예산</th>
                <td>{BUDGET}. 시설 하나에 1~3이 듭니다.</td>
              </tr>
              <tr>
                <th rowSpan={4}>보정 (네 가지뿐)</th>
                <td>간선도로가 한 곳도 없는 생활권 → 사회 −1 (교통 소외)</td>
              </tr>
              <tr>
                <td>보건·복지센터도 학교도 없는 생활권 → 사회 −1 (공공서비스 소외)</td>
              </tr>
              <tr>
                <td>논·습지를 덮은 칸 하나마다 → 환경 −1</td>
              </tr>
              <tr>
                <td>주택과 바로 맞닿은 공장·산업단지 하나마다 → 사회 −1</td>
              </tr>
              <tr>
                <th>3년차 집중호우</th>
                <td>
                  저지대 칸 수 ÷ {LOWLAND_PER_DEFENSE}(올림)만큼 물 받이가 없으면 사회 −2, 경제 −2.
                  <br />
                  <b>물 받이 = 녹지 칸 수 + 빗물 저류지(저지대 2, 그 밖 1) + 하수·빗물처리시설 1</b>
                </td>
              </tr>
              <tr>
                <th>6년차 폭염</th>
                <td>
                  생활권에 녹지가 {GREEN_NEEDED}칸 미만이면 사회 −1, 환경 −1. 녹지는 도시 숲,
                  습지 복원, 그리고 아직 덮지 않은 논·습지입니다.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="muted small" style={{ marginTop: 10, marginBottom: 0 }}>
          하천 생태·도시 숲·도시 속 동물(비인간 이웃)은 손으로 세기 번거로워 앱에서만 점수로
          보여 줍니다. 종이에서는 "하천변에 무엇을 놓았나", "녹지가 이어졌나 끊겼나"를 눈으로
          보고 쓰면 됩니다.
        </p>
      </section>

      <section className="card">
        <h2>시설 값</h2>
        <div className="scroll-x">
          <table className="data">
            <thead>
              <tr>
                <th>시설</th>
                <th className="num">비용</th>
                <th className="num">사회</th>
                <th className="num">경제</th>
                <th className="num">환경</th>
                <th>조건</th>
              </tr>
            </thead>
            <tbody>
              {PLACEABLE.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span className="fac-glyph">{f.glyph}</span> {f.name}
                  </td>
                  <td className="num">{f.cost}</td>
                  <td className="num">{f.effect.social}</td>
                  <td className="num">{f.effect.economy}</td>
                  <td className="num">{f.effect.environment}</td>
                  <td className="small">{f.note}</td>
                </tr>
              ))}
              {FIXED_TILES.map((f) => (
                <tr key={f.id}>
                  <td>
                    <span className="fac-glyph">{f.glyph}</span> {f.name}
                  </td>
                  <td className="num">—</td>
                  <td className="num">{f.effect.social}</td>
                  <td className="num">{f.effect.economy}</td>
                  <td className="num">{f.effect.environment}</td>
                  <td className="small">{f.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>한여울시의 네 생활권</h2>
        <p className="muted small">
          출발선이 다릅니다. 무엇이 이미 깔려 있는지는 지도에서 직접 세어 보세요. 아래 숫자는
          건물로는 표현할 수 없는 그 동네만의 사정입니다.
        </p>
        <div className="scroll-x">
          <table className="data">
            <thead>
              <tr>
                <th>생활권</th>
                <th>위치</th>
                <th>지금 사정</th>
                <th>출발선 보정</th>
              </tr>
            </thead>
            <tbody>
              {ZONES.map((z) => (
                <tr key={z.id}>
                  <td>
                    <b>{z.name}</b>
                  </td>
                  <td>{z.short}</td>
                  <td>{z.summary}</td>
                  <td className="small">{z.baseReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <h2>무엇을 보고 점수를 매기나요</h2>
        <p className="muted small">
          채점 기준은 처음부터 공개합니다. 서술 3문항 합계 {TOTAL_POINTS}점입니다.
        </p>
        <div className="scroll-x">
          <table className="data">
            <thead>
              <tr>
                <th>채점 요소</th>
                <th>채점 기준</th>
                <th className="num">배점</th>
              </tr>
            </thead>
            <tbody>
              {QUESTIONS.map((q) =>
                q.bands.map((band, i) => (
                  <tr key={`${q.key}-${band.points}`}>
                    {i === 0 ? (
                      <th rowSpan={q.bands.length} scope="rowgroup">
                        {q.element}
                      </th>
                    ) : null}
                    <td>{band.text}</td>
                    <td className="num">{band.points}점</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>

        <details style={{ marginTop: 14 }}>
          <summary>성취기준과 평가 기준(A~E) 보기</summary>
          <ul style={{ marginTop: 10 }}>
            {ACHIEVEMENT_STANDARDS.map((s) => (
              <li key={s.code}>
                {s.lead ? "" : "(연계) "}
                <b>[{s.code}]</b> {s.text}
              </li>
            ))}
          </ul>
          <p className="muted small">
            <b>핵심 아이디어</b> {BIG_IDEA}
          </p>
          <div className="scroll-x">
            <table className="data">
              <tbody>
                {LEVELS.map((l) => (
                  <tr key={l.grade}>
                    <th style={{ width: "2.5em", textAlign: "center" }}>{l.grade}</th>
                    <td>{l.text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </section>

      <div className="nav-row">
        <span />
        <button type="button" className="btn primary" onClick={onStart}>
          연습 시작하기
        </button>
      </div>
    </>
  );
}
