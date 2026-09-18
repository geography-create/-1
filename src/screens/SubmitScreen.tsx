import { useState } from "react";
import { cellName } from "../lib/labels.ts";
import { GRID } from "../data/city.ts";
import { FACILITY_BY_ID } from "../data/facilities.ts";
import { QUESTIONS } from "../data/rubric.ts";
import type { CityResult, Placement } from "../lib/engine.ts";
import { isSubmissionConfigured, submitToSheet } from "../lib/submit.ts";

interface Props {
  placement: Placement;
  result: CityResult;
  answers: { q1: string; q2: string; q3: string };
  checks: Record<string, boolean>;
  student: { classNo: string; studentNo: string; name: string };
  setStudent: (next: { classNo: string; studentNo: string; name: string }) => void;
  submitted: boolean;
  setSubmitted: (v: boolean) => void;
  onBack: () => void;
}

export default function SubmitScreen({
  placement,
  result,
  answers,
  checks,
  student,
  setStudent,
  submitted,
  setSubmitted,
  onBack,
}: Props) {
  const [sending, setSending] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const filled = student.classNo.trim() && student.studentNo.trim() && student.name.trim();
  const totalChecks = QUESTIONS.reduce((n, q) => n + q.checklist.length, 0);
  const doneChecks = Object.values(checks).filter(Boolean).length;

  async function handleSubmit() {
    if (!filled) {
      setNote("반·번호·이름을 모두 입력해 주세요.");
      return;
    }
    setSending(true);
    const placementText = GRID.filter((c) => placement[c.index])
      .map((c) => `${cellName(c)} ${FACILITY_BY_ID[placement[c.index]].name}`)
      .join(" / ");
    const zoneSummary = result.zones
      .map(
        (z) =>
          `${z.zone.name} 사${z.final.social} 경${z.final.economy} 환${z.final.environment} 종합${z.benefit}`,
      )
      .join(" / ");
    const eventSummary = result.zones
      .map(
        (z) =>
          `${z.zone.name}: 호우 ${z.storm.hit ? "침수" : "견딤"}, 폭염 ${z.heat.hit ? "피해" : "견딤"}`,
      )
      .join(" / ");

    const ok = await submitToSheet({
      classNo: student.classNo.trim(),
      studentNo: student.studentNo.trim(),
      name: student.name.trim(),
      placementText,
      spent: result.spent,
      placedCount: result.placedCount,
      zoneSummary,
      gap: result.gap,
      gapLevel: result.gapLevel,
      worstZone: result.worstZone.zone.name,
      bestZone: result.bestZone.zone.name,
      nonHumanSummary: result.nonHuman.map((n) => `${n.name} ${n.value}`).join(" / "),
      eventSummary,
      q1: answers.q1,
      q2: answers.q2,
      q3: answers.q3,
      selfCheck: `${doneChecks}/${totalChecks}`,
    });
    setSending(false);
    setSubmitted(true);
    setNote(
      ok
        ? "제출을 보냈습니다. 선생님 시트에 기록되었는지는 선생님이 확인합니다."
        : "이 기기에서는 제출 완료로 표시했지만, 전송 주소가 설정되어 있지 않아 선생님께 전송되지는 않았습니다. 아래 요약을 인쇄하거나 선생님 안내에 따라 제출하세요.",
    );
  }

  return (
    <>
      <section className="card">
        <h2>제출</h2>
        {!isSubmissionConfigured() ? (
          <p className="notice">
            이 배포본에는 전송 주소가 설정되어 있지 않습니다. 선생님 안내에 따라 아래 요약을
            인쇄하거나 화면을 제출하세요.
          </p>
        ) : null}
        <div className="field-row">
          <label>
            반
            <input
              value={student.classNo}
              onChange={(e) => setStudent({ ...student, classNo: e.target.value })}
              inputMode="numeric"
            />
          </label>
          <label>
            번호
            <input
              value={student.studentNo}
              onChange={(e) => setStudent({ ...student, studentNo: e.target.value })}
              inputMode="numeric"
            />
          </label>
          <label>
            이름
            <input
              value={student.name}
              onChange={(e) => setStudent({ ...student, name: e.target.value })}
            />
          </label>
        </div>
        <p className="muted small" style={{ marginTop: 10 }}>
          자기점검 {doneChecks}/{totalChecks}개 확인함. 제출 전에 아래 요약을 한 번 읽어 보세요.
        </p>
        <div className="nav-row" style={{ marginTop: 12 }}>
          <button type="button" className="btn" onClick={onBack}>
            서술 고치러 가기
          </button>
          <span />
          <span style={{ display: "flex", gap: 10 }}>
            <button type="button" className="btn" onClick={() => window.print()}>
              인쇄 / PDF 저장
            </button>
            <button
              type="button"
              className="btn primary"
              disabled={sending || !filled}
              onClick={handleSubmit}
            >
              {submitted ? "다시 제출하기" : "작성 완료·제출"}
            </button>
          </span>
        </div>
        {note ? (
          <p className="notice ok" role="status">
            {note}
          </p>
        ) : null}
      </section>

      <section className="card">
        <h2>제출 요약</h2>
        <p className="muted small">
          {student.classNo || "?"}반 {student.studentNo || "?"}번 {student.name || "이름 미입력"} ·
          예산 {result.spent} 사용 · 시설 {result.placedCount}개
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
              </tr>
            </thead>
            <tbody>
              {result.zones.map((z) => (
                <tr key={z.zone.id}>
                  <td>{z.zone.name}</td>
                  <td className="num">{z.final.social}</td>
                  <td className="num">{z.final.economy}</td>
                  <td className="num">{z.final.environment}</td>
                  <td className="num">{z.benefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="small" style={{ marginTop: 10 }}>
          생활권 격차 {result.gap} ({result.gapLevel} 수준) · 최하{" "}
          {result.worstZone.zone.name} · 비인간 지표{" "}
          {result.nonHuman.map((n) => `${n.name} ${n.value}`).join(", ")}
        </p>

        {QUESTIONS.map((q, i) => (
          <div key={q.key} style={{ marginTop: 16 }}>
            <h3>
              {i + 1}. {q.prompt}
            </h3>
            <p style={{ whiteSpace: "pre-wrap" }}>{answers[q.key]}</p>
          </div>
        ))}
      </section>
    </>
  );
}
