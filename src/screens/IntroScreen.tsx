import { BUDGET, ZONES } from "../data/city.ts";
import {
  ACHIEVEMENT_STANDARDS,
  BIG_IDEA,
  LEVELS,
  QUESTIONS,
  TASK_STATEMENT,
  TOTAL_POINTS,
} from "../data/rubric.ts";

export default function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <>
      <section className="card">
        <h2>이 수행평가에서 할 일</h2>
        <p>{TASK_STATEMENT}</p>
        <ol>
          <li>
            <b>배치</b> — 한여울시 9칸×9칸 지도 위에, 예산 <b>{BUDGET}</b>(억 원) 안에서
            도시 시설을 놓습니다. 하천이 지나는 칸에는 놓을 수 없습니다.
          </li>
          <li>
            <b>결과 확인</b> — 배치가 생활권마다 어떤 결과를 냈는지, 3년차 집중호우와
            6년차 폭염을 견뎠는지 확인합니다.
          </li>
          <li>
            <b>서술</b> — 아래 세 질문에 답합니다. 점수는 이 서술로 매깁니다.
          </li>
        </ol>
        <ol>
          {QUESTIONS.map((q) => (
            <li key={q.key}>{q.prompt}</li>
          ))}
        </ol>
        <div className="notice">
          배치 자체에는 점수가 없습니다. <b>잘 만든 도시</b>가 아니라 <b>자기 선택을 설명할 수 있는
          도시</b>를 만드세요. 무엇을 포기했는지 설명할 수 있다면 그 배치가 좋은 배치입니다.
        </div>
        <p className="muted small">
          이 과제는 AI 도구를 쓰지 않고 스스로 작성합니다. 작성 중인 내용은 이 브라우저에만
          자동 저장되며, 마지막 제출 단계에서만 선생님께 전송됩니다.
        </p>
      </section>

      <section className="card">
        <h2>한여울시의 네 생활권</h2>
        <p className="muted small">
          생활권마다 출발선이 다릅니다. 이 차이는 여러분이 만든 것이 아니지만, 여기서
          무엇을 하느냐는 여러분이 정합니다.
        </p>
        <div className="scroll-x">
          <table className="data">
            <thead>
              <tr>
                <th>생활권</th>
                <th>위치</th>
                <th>지금 사정</th>
                <th className="num">사회</th>
                <th className="num">경제</th>
                <th className="num">환경</th>
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
                  <td className="num">{z.base.social}</td>
                  <td className="num">{z.base.economy}</td>
                  <td className="num">{z.base.environment}</td>
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
          배치 시작하기
        </button>
      </div>
    </>
  );
}
