import { QUESTIONS, type Question } from "../data/rubric.ts";
import type { CityResult } from "../lib/engine.ts";

interface Props {
  answers: { q1: string; q2: string; q3: string };
  setAnswer: (key: "q1" | "q2" | "q3", value: string) => void;
  checks: Record<string, boolean>;
  setCheck: (key: string, value: boolean) => void;
  result: CityResult;
  onBack: () => void;
  onNext: () => void;
}

export default function WriteScreen({
  answers,
  setAnswer,
  checks,
  setCheck,
  result,
  onBack,
  onNext,
}: Props) {
  const ready = QUESTIONS.every((q) => answers[q.key].trim().length >= q.minChars);

  return (
    <>
      <section className="card">
        <h2>서술 작성</h2>
        <p className="muted small">
          세 문항 모두 각 {QUESTIONS[0].minChars}자 이상 써야 제출 화면으로 넘어갑니다. 글자 수는
          기준일 뿐이고, 점수는 아래 채점 기준으로 매깁니다. 쓰는 동안 자동 저장됩니다.
        </p>
        <div className="notice">
          <b>내 결과 한눈에</b> — 혜택이 가장 적게 돌아간 생활권은{" "}
          <b>{result.worstZone.zone.name}</b>(종합 {result.worstZone.benefit}), 가장 많이 돌아간 곳은{" "}
          <b>{result.bestZone.zone.name}</b>(종합 {result.bestZone.benefit}), 격차{" "}
          {result.gap}({result.gapLevel} 수준). 비인간 지표는{" "}
          {result.nonHuman.map((n) => `${n.name} ${n.value}`).join(" · ")}.
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
          결과 다시 보기
        </button>
        <span className="muted small">
          {ready ? "" : "아직 분량을 채우지 못한 문항이 있습니다."}
        </span>
        <button type="button" className="btn primary" disabled={!ready} onClick={onNext}>
          제출 화면으로
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
  const enough = len >= question.minChars;
  const inputId = `answer-${question.key}`;

  return (
    <section className="card answer-block">
      <h3>
        {index}. {question.prompt}
      </h3>
      <p className="muted small">채점 요소 {question.element}</p>

      <label htmlFor={inputId} className="muted small">
        답안
      </label>
      <textarea
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="자기 배치와 화면에 나온 숫자를 근거로 삼아 쓰세요."
      />
      <div className="count-row">
        <span>
          {len}자 {enough ? "" : `(${question.minChars}자 이상 필요)`}
        </span>
        <span>{enough ? "분량 충족" : ""}</span>
      </div>

      <details style={{ marginTop: 10 }}>
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
