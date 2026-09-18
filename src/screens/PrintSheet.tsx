// 종이 수행평가 답안지. 화면이 아니라 A4 출력물이 최종 형태다.
// 앱과 같은 데이터에서 만들어지므로 시설 값을 고치면 답안지도 같이 따라온다.

import PrintBoard, { PrintBoardLegend } from "../components/PrintBoard.tsx";
import {
  BUDGET,
  GAP_DANGER,
  GAP_WARN,
  GREEN_NEEDED,
  LOWLAND_PER_DEFENSE,
  ZONES,
} from "../data/city.ts";
import { FACILITIES, PLACEABLE } from "../data/facilities.ts";
import { QUESTIONS, TOTAL_POINTS } from "../data/rubric.ts";
import { ZONE_MARK } from "../lib/labels.ts";

const FIXED_TILES = FACILITIES.filter((f) => f.fixedOnly);

function sign(n: number): string {
  if (n === 0) return "0";
  return n > 0 ? `+${n}` : `${n}`;
}

export default function PrintSheet({ onClose }: { onClose: () => void }) {
  return (
    <div className="sheet">
      <div className="sheet-toolbar">
        <button type="button" className="btn" onClick={onClose}>
          연습 화면으로
        </button>
        <span className="muted small">
          A4 세로로 인쇄하세요. 색을 쓰지 않아 흑백 복사기를 거쳐도 구분됩니다.
        </span>
        <button type="button" className="btn primary" onClick={() => window.print()}>
          인쇄 / PDF로 저장
        </button>
      </div>

      {/* ------------------------------------------------------------ 1면 */}
      <section className="sheet-page">
        <header className="sheet-head">
          <h1>한여울시 도시 설계 — 누구의 도시를 만들 것인가</h1>
          <table className="sheet-id">
            <tbody>
              <tr>
                <th>반</th>
                <td />
                <th>번호</th>
                <td />
                <th>이름</th>
                <td className="wide" />
              </tr>
            </tbody>
          </table>
        </header>

        <p className="sheet-task">
          아래 격자 지도 위에 예산 <b>{BUDGET}</b> 안에서 도시 시설을 배치하고, 생활권별 결과를
          계산표에 정리한 뒤 세 가지 질문에 서술로 답하시오. 하천 칸과 빗금 친 기존 시가지에는
          놓을 수 없다. 배치는 시설 이름의 <b>한 글자 표시</b>를 칸에 적어 나타낸다.
        </p>

        <div className="sheet-map">
          <PrintBoard />
          <div className="sheet-side">
            <PrintBoardLegend />
            <div>
              <b className="sheet-side-title">예산 쓴 내역</b>
              <table className="budget-tally">
                <thead>
                  <tr>
                    <th>시설</th>
                    <th>개수</th>
                    <th>비용 합</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 7 }, (_, n) => (
                    <tr key={n}>
                      <td className="name" />
                      <td />
                      <td />
                    </tr>
                  ))}
                  <tr className="sum">
                    <th>합계 / {BUDGET}</th>
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </section>

      {/* ------------------------------------------------------------ 2면 */}
      <section className="sheet-page">
        <h2>시설 값 (예산 {BUDGET})</h2>
        <table className="sheet-table">
          <thead>
            <tr>
              <th>표시</th>
              <th>시설</th>
              <th className="n">비용</th>
              <th className="n">사회</th>
              <th className="n">경제</th>
              <th className="n">환경</th>
              <th>조건</th>
            </tr>
          </thead>
          <tbody>
            {PLACEABLE.map((f) => (
              <tr key={f.id}>
                <td className="c">
                  <b>{f.glyph}</b>
                </td>
                <td>{f.name}</td>
                <td className="n">{f.cost}</td>
                <td className="n">{sign(f.effect.social)}</td>
                <td className="n">{sign(f.effect.economy)}</td>
                <td className="n">{sign(f.effect.environment)}</td>
                <td className="note">{f.note}</td>
              </tr>
            ))}
            {FIXED_TILES.map((f) => (
              <tr key={f.id} className="dim">
                <td className="c">
                  <b>{f.glyph}</b>
                </td>
                <td>{f.name} (기존)</td>
                <td className="n">—</td>
                <td className="n">{sign(f.effect.social)}</td>
                <td className="n">{sign(f.effect.economy)}</td>
                <td className="n">{sign(f.effect.environment)}</td>
                <td className="note">{f.note}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2>계산 규칙</h2>
        <table className="sheet-table">
          <tbody>
            <tr>
              <th className="lead">종합 생활 편익</th>
              <td>사회 + 경제 + 환경</td>
            </tr>
            <tr>
              <th className="lead">생활권 격차</th>
              <td>
                가장 높은 생활권 − 가장 낮은 생활권. {GAP_WARN} 미만 <b>안정</b>, {GAP_WARN} 이상{" "}
                <b>경계</b>, {GAP_DANGER} 이상 <b>위험</b>
              </td>
            </tr>
            <tr>
              <th className="lead" rowSpan={4}>
                보정
              </th>
              <td>간선도로(차)가 한 곳도 없는 생활권 → 사회 −1</td>
            </tr>
            <tr>
              <td>보건·복지센터(복)도 학교(학)도 없는 생활권 → 사회 −1</td>
            </tr>
            <tr>
              <td>논·습지를 덮은 칸 하나마다 → 환경 −1</td>
            </tr>
            <tr>
              <td>주택(임·아·낡)과 바로 맞닿은 공장·산업단지(산·공·물) 하나마다 → 사회 −1</td>
            </tr>
            <tr>
              <th className="lead">3년차 집중호우</th>
              <td>
                저지대 칸 수 ÷ {LOWLAND_PER_DEFENSE}(올림)만큼 물 받이가 없으면 사회 −2, 경제 −2
                <br />
                <b>
                  물 받이 = 녹지 칸 수 + 빗물 저류지(저지대 2, 그 밖 1) + 하수·빗물처리시설 1
                </b>
              </td>
            </tr>
            <tr>
              <th className="lead">6년차 폭염</th>
              <td>
                생활권 녹지가 {GREEN_NEEDED}칸 미만이면 사회 −1, 환경 −1
                <br />
                녹지 = 도시 숲(숲) + 습지 복원(습) + 아직 덮지 않은 논·습지
              </td>
            </tr>
          </tbody>
        </table>

      </section>

      {/* ------------------------------------------------------------ 3면 */}
      <section className="sheet-page">
        <h2>생활권별 계산 ①②</h2>
        {ZONES.slice(0, 2).map((z) => (
          <ZoneCalc key={z.id} zone={z} />
        ))}
      </section>

      {/* ------------------------------------------------------------ 4면 */}
      <section className="sheet-page">
        <h2>생활권별 계산 ③④</h2>
        {ZONES.slice(2).map((z) => (
          <ZoneCalc key={z.id} zone={z} />
        ))}

        <table className="sheet-table summary">
          <tbody>
            <tr>
              <th className="lead">가장 높은 생활권</th>
              <td className="blank" />
              <th className="lead">가장 낮은 생활권</th>
              <td className="blank" />
            </tr>
            <tr>
              <th className="lead">생활권 격차</th>
              <td className="blank" />
              <th className="lead">수준</th>
              <td>안정 · 경계 · 위험 (동그라미)</td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* ------------------------------------------------------------ 5면 */}
      <section className="sheet-page">
        <h2>서술 (3문항 {TOTAL_POINTS}점)</h2>
        <p className="sheet-note">
          채점 기준을 함께 싣습니다. 무엇을 담아야 하는지 확인하고 쓰세요.
        </p>
        {QUESTIONS.map((q, i) => (
          <table className="sheet-table bands" key={q.key}>
            <thead>
              <tr>
                <th colSpan={2}>
                  {i + 1}. {q.element}
                </th>
              </tr>
            </thead>
            <tbody>
              {q.bands.map((b) => (
                <tr key={b.points}>
                  <th className="n">{b.points}점</th>
                  <td>{b.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ))}
        <Answer index={1} question={QUESTIONS[0]} lines={9} />
      </section>

      {/* ------------------------------------------------------------ 6면 */}
      <section className="sheet-page">
        <Answer index={2} question={QUESTIONS[1]} lines={11} />
        <Answer index={3} question={QUESTIONS[2]} lines={11} />
      </section>
    </div>
  );
}

function ZoneCalc({ zone: z }: { zone: (typeof ZONES)[number] }) {
  return (
    <div className="sheet-calc">
      <div className="sheet-calc-head">
        <b>
          <span className="pb-key pb-key-zone">{ZONE_MARK[z.id]}</span> {z.name}
        </b>
        <span className="sheet-calc-note">{z.baseReason}</span>
      </div>
      <div className="sheet-calc-head">
        <span>
          칸 수 <i className="fill" /> · 저지대 <i className="fill" />칸 · 녹지{" "}
          <i className="fill" />칸 · 물 받이 <i className="fill" /> / 필요 <i className="fill" />
        </span>
      </div>
      <table className="sheet-table calc">
        <thead>
          <tr>
            <th>줄</th>
            <th className="n">사회</th>
            <th className="n">경제</th>
            <th className="n">환경</th>
            <th className="n">종합</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>출발선</td>
            <td className="n">{sign(z.base.social)}</td>
            <td className="n">{sign(z.base.economy)}</td>
            <td className="n">{sign(z.base.environment)}</td>
            <td className="n blank" />
          </tr>
          <tr>
            <td>
              기존 시가지 <i className="fill" />곳
            </td>
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
          </tr>
          <tr>
            <td>
              내가 놓은 시설 <i className="fill" />곳
            </td>
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
          </tr>
          {[0, 1].map((n) => (
            <tr key={n}>
              <td>
                보정 <i className="fill wide" />
              </td>
              <td className="n blank" />
              <td className="n blank" />
              <td className="n blank" />
              <td className="n blank" />
            </tr>
          ))}
          <tr className="rule">
            <th>배치 직후 (0년차)</th>
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
          </tr>
          <tr>
            <td>3년차 집중호우 &nbsp; 침수 · 견딤</td>
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
          </tr>
          <tr>
            <td>6년차 폭염 &nbsp; 피해 · 견딤</td>
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
          </tr>
          <tr className="rule total">
            <th>최종 (6년차)</th>
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
            <td className="n blank" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function Answer({
  index,
  question,
  lines,
}: {
  index: number;
  question: (typeof QUESTIONS)[number];
  lines: number;
}) {
  return (
    <div className="sheet-question">
      <h3>
        {index}. {question.prompt}
      </h3>
      <div className="sheet-lines">
        {Array.from({ length: lines }, (_, n) => (
          <div className="sheet-line" key={n} />
        ))}
      </div>
    </div>
  );
}
