// 서술 연습 화면. 실제 평가는 종이에 쓰므로 여기서 쓴 글은 어디로도 전송되지 않는다.
// 브라우저 안에만 남고, 필요하면 인쇄해서 들고 갈 수 있다.

import { QUESTIONS, type Question } from "../data/rubric.ts";
import type { CityResult } from "../lib/engine.ts";

interface Props {
  answers: { q1: string; q2: string; q3: string };
  setAnswer: (key: "q1" | "q2" | "q3", value: string) => void;
  checks: Record<string, boolean>;
  setCheck: (key: string, value: boolean) => void;
  result: CityResult;
  onBack: () => void;
}

export default function WriteScreen({
  answers,
  setAnswer,
  checks,
  setCheck,
  result,
  onBack,
}: Props) {
  return (
    <>
      <section className="card">
        <h2>서술 연습</h2>
        <p className="notice">
          실제 수행평가는 <b>종이에 직접 씁니다.</b> 여기서 쓴 글은 어디로도 전송되지 않고 이
          브라우저에만 남습니다. 미리 한 번 써 보면서 무엇을 담아야 하는지 감을 잡는 용도예요.
        </p>
        <div className="scroll-x">
          <table className="data">
            <tbody>
              <tr>
                <th>혜택 최하 생활권</th>
                <td>
                  {result.worstZone.zone.name} (종합 {result.worstZone.benefit})
                </td>
                <th>혜택 최상</th>
                <td>
                  {result.bestZone.zone.name} (종합 {result.bestZone.benefit})
                </td>
              </tr>
              <tr>
                <th>생활권 격차</th>
                <td>
                  {result.gap} ({result.gapLevel} 수준)
                </td>
                <th>비인간 지표</th>
                <td>{result.nonHuman.map((n) => `${n.name} ${n.value}`).join(" · ")}</td>
              </tr>
              <tr>
                <th>집중호우</th>
                <td>
                  침수{" "}
                  {result.zones
                    .filter((z) => z.storm.hit)
                    .map((z) => z.zone.name)
                    .join(", ") || "없음"}
                </td>
                <th>폭염</th>
                <td>
                  피해{" "}
                  {result.zones
                    .filter((z) => z.heat.hit)
                    .map((z) => z.zone.name)
                    .join(", ") || "없음"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {QUESTIONS.map((q, i) => (
        <AnswerBlock
          key={q.key}
          index={i + 1}
          question={q}
          value={answers[q.key]}
          onChange={(v) => setAnswer(q.key, v)}
          checks={checks}
          setCheck={setCheck}
        />
      ))}

      <div className="nav-row">
        <button type="button" className="btn" onClick={onBack}>
          비교 화면으로
        </button>
        <span />
        <button type="button" className="btn primary" onClick={() => window.print()}>
          인쇄 / PDF로 저장
        </button>
      </div>
    </>
  );
}

function AnswerBlock({
  index,
  question,
  value,
  onChange,
  checks,
  setCheck,
}: {
  index: number;
  question: Question;
  value: string;
  onChange: (v: string) => void;
  checks: Record<string, boolean>;
  setCheck: (key: string, value: boolean) => void;
}) {
  const len = value.trim().length;
  const inputId = `answer-${question.key}`;

  return (
    <section className="card answer-block">
      <h3>
        {index}. {question.prompt}
      </h3>
      <p className="muted small">채점 요소 {question.element}</p>

      <label htmlFor={inputId} className="muted small">
        답안 (연습)
      </label>
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="자기 배치와 계산 과정에 나온 숫자를 근거로 삼아 쓰세요."
      />
      <div className="count-row">
        <span>{len}자</span>
        <span>{len >= question.minChars ? "시험지 한 칸 분량쯤 됩니다" : ""}</span>
      </div>

      <details style={{ marginTop: 10 }} open>
        <summary>이 문항의 채점 기준</summary>
        <div className="scroll-x">
          <table className="data" style={{ marginTop: 8 }}>
            <tbody>
              {question.bands.map((b) => (
                <tr key={b.points}>
                  <th className="num" style={{ width: "3.5em" }}>
                    {b.points}점
                  </th>
                  <td>{b.text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="small" style={{ marginTop: 10, marginBottom: 0 }}>
        <b>내 답에 이것이 들어 있나요?</b>
      </p>
      <ul className="checklist">
        {question.checklist.map((item, i) => {
          const key = `${question.key}-${i}`;
          return (
            <li key={key}>
              <label>
                <input
                  type="checkbox"
                  checked={Boolean(checks[key])}
                  onChange={(e) => setCheck(key, e.target.checked)}
                />
                <span>{item}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
