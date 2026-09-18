import { useEffect, useMemo, useState } from "react";
import DesignScreen from "./screens/DesignScreen.tsx";
import IntroScreen from "./screens/IntroScreen.tsx";
import ResultScreen from "./screens/ResultScreen.tsx";
import SubmitScreen from "./screens/SubmitScreen.tsx";
import TeacherGuide from "./screens/TeacherGuide.tsx";
import WriteScreen from "./screens/WriteScreen.tsx";
import { evaluate, type Placement } from "./lib/engine.ts";
import { clearDraft, EMPTY_DRAFT, loadDraft, saveDraft, type Draft } from "./lib/storage.ts";

const STEPS = ["과제 안내", "배치", "결과", "서술", "제출"];

function isTeacherView(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("teacher") === "1";
}

export default function App() {
  const [draft, setDraft] = useState<Draft>(() => loadDraft());
  const [savedAt, setSavedAt] = useState<string>(draft.savedAt);
  const [showGuide, setShowGuide] = useState(false);
  const teacher = useMemo(isTeacherView, []);

  const result = useMemo(() => evaluate(draft.placement), [draft.placement]);

  // 답안이 바뀔 때마다 브라우저에 자동 저장한다(서버로 나가는 것은 없다).
  useEffect(() => {
    const timer = setTimeout(() => {
      const { savedAt: _ignored, ...rest } = draft;
      const at = saveDraft(rest);
      if (at) setSavedAt(at);
    }, 400);
    return () => clearTimeout(timer);
  }, [draft]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [draft.step, showGuide]);

  const patch = (next: Partial<Draft>) => setDraft((d) => ({ ...d, ...next }));
  const goto = (step: number) => patch({ step });

  const reachable = (step: number) => {
    if (step <= 1) return true;
    if (step === 2) return result.placedCount > 0;
    if (step === 3) return result.placedCount > 0;
    return result.placedCount > 0;
  };

  function handleReset() {
    if (!window.confirm("배치와 서술을 모두 지우고 처음부터 다시 시작할까요?")) return;
    clearDraft();
    setDraft({ ...EMPTY_DRAFT });
    setSavedAt("");
  }

  return (
    <div className="app">
      <header className="masthead">
        <p className="eyebrow">도시의 미래 탐구 · 수행평가</p>
        <h1>한여울시 도시 설계 — 누구의 도시를 만들 것인가</h1>
        <p className="muted small" style={{ marginBottom: 0 }}>
          9칸×9칸 격자 위에 예산 안에서 시설을 배치하고, 생활권별 결과를 근거로 세 질문에
          답합니다.
        </p>
        <ul className="steps">
          {STEPS.map((label, i) => (
            <li key={label}>
              <button
                type="button"
                aria-current={draft.step === i ? "step" : undefined}
                disabled={!reachable(i)}
                onClick={() => goto(i)}
              >
                {i + 1}. {label}
              </button>
            </li>
          ))}
          <li>
            <button type="button" onClick={handleReset}>
              처음부터 다시
            </button>
          </li>
        </ul>
        {savedAt ? (
          <p className="save-hint" role="status">
            이 브라우저에 자동 저장됨 ·{" "}
            {new Date(savedAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        ) : null}
      </header>

      {showGuide ? (
        <TeacherGuide onClose={() => setShowGuide(false)} />
      ) : draft.step === 0 ? (
        <IntroScreen onStart={() => goto(1)} />
      ) : draft.step === 1 ? (
        <DesignScreen
          placement={draft.placement}
          setPlacement={(placement: Placement) => patch({ placement })}
          onBack={() => goto(0)}
          onNext={() => goto(2)}
        />
      ) : draft.step === 2 ? (
        <ResultScreen
          placement={draft.placement}
          result={result}
          onBack={() => goto(1)}
          onNext={() => goto(3)}
        />
      ) : draft.step === 3 ? (
        <WriteScreen
          answers={draft.answers}
          setAnswer={(key, value) => patch({ answers: { ...draft.answers, [key]: value } })}
          checks={draft.checks}
          setCheck={(key, value) => patch({ checks: { ...draft.checks, [key]: value } })}
          result={result}
          onBack={() => goto(2)}
          onNext={() => goto(4)}
        />
      ) : (
        <SubmitScreen
          placement={draft.placement}
          result={result}
          answers={draft.answers}
          checks={draft.checks}
          student={draft.student}
          setStudent={(student) => patch({ student })}
          submitted={draft.submitted}
          setSubmitted={(submitted) => patch({ submitted })}
          onBack={() => goto(3)}
        />
      )}

      {teacher ? (
        <button type="button" className="teacher-fab" onClick={() => setShowGuide((v) => !v)}>
          {showGuide ? "학생 화면으로" : "교사용 진행 안내"}
        </button>
      ) : null}
    </div>
  );
}
