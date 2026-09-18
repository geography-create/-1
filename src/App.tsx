import { useEffect, useMemo, useState } from "react";
import CompareScreen from "./screens/CompareScreen.tsx";
import DesignScreen from "./screens/DesignScreen.tsx";
import IntroScreen from "./screens/IntroScreen.tsx";
import PrintSheet from "./screens/PrintSheet.tsx";
import ResultScreen from "./screens/ResultScreen.tsx";
import TeacherGuide from "./screens/TeacherGuide.tsx";
import WriteScreen from "./screens/WriteScreen.tsx";
import { evaluate, type Placement } from "./lib/engine.ts";
import {
  clearDraft,
  EMPTY_DRAFT,
  loadDraft,
  MAX_PLANS,
  saveDraft,
  type Draft,
  type SavedPlan,
} from "./lib/storage.ts";

const STEPS = ["과제 안내", "배치", "결과", "안 비교", "서술 연습"];

function hasParam(name: string): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get(name) === "1";
}

export default function App() {
  const [draft, setDraft] = useState<Draft>(() => loadDraft());
  const [savedAt, setSavedAt] = useState<string>(draft.savedAt);
  const [showGuide, setShowGuide] = useState(false);
  const teacher = useMemo(() => hasParam("teacher"), []);
  // ?sheet=1 은 인쇄용 종이 답안지. 연습 화면과 완전히 분리된 출력물이다.
  const [showSheet, setShowSheet] = useState(() => hasParam("sheet"));

  const result = useMemo(() => evaluate(draft.placement), [draft.placement]);

  // 답안이 바뀔 때마다 브라우저에만 저장한다. 서버로 나가는 것은 없다.
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
  }, [draft.step, showGuide, showSheet]);

  const patch = (next: Partial<Draft>) => setDraft((d) => ({ ...d, ...next }));
  const goto = (step: number) => patch({ step });

  function handleSavePlan() {
    setDraft((d) => {
      if (d.plans.length >= MAX_PLANS) return d;
      const plan: SavedPlan = {
        id: `plan-${Date.now()}`,
        label: `${d.plans.length + 1}번 안`,
        placement: { ...d.placement },
        savedAt: new Date().toISOString(),
      };
      return { ...d, plans: [...d.plans, plan] };
    });
  }

  function handleRemovePlan(id: string) {
    setDraft((d) => ({
      ...d,
      // 지운 뒤에도 1번·2번 안 번호가 순서대로 남게 다시 매긴다.
      plans: d.plans
        .filter((p) => p.id !== id)
        .map((p, i) => ({ ...p, label: `${i + 1}번 안` })),
    }));
  }

  function handleLoadPlan(plan: SavedPlan) {
    patch({ placement: { ...plan.placement }, step: 1 });
  }

  function handleReset() {
    if (!window.confirm("배치와 저장한 안, 서술 연습을 모두 지우고 처음부터 다시 할까요?")) return;
    clearDraft();
    setDraft({ ...EMPTY_DRAFT });
    setSavedAt("");
  }

  const reachable = (step: number) => step <= 1 || result.placedCount > 0;

  if (showSheet) {
    return (
      <div className="app">
        <PrintSheet onClose={() => setShowSheet(false)} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="masthead">
        <p className="eyebrow">도시의 미래 탐구 · 수행평가 연습</p>
        <h1>한여울시 도시 설계 — 누구의 도시를 만들 것인가</h1>
        <p className="muted small" style={{ marginBottom: 0 }}>
          시험은 종이에 칩니다. 이 앱은 <b>계산하는 법과 판을 읽는 법</b>을 미리 익히는
          연습장입니다.
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
            이 브라우저에만 자동 저장됨 ·{" "}
            {new Date(savedAt).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        ) : null}
      </header>

      {showGuide ? (
        <TeacherGuide
          onClose={() => setShowGuide(false)}
          onOpenSheet={() => {
            setShowGuide(false);
            setShowSheet(true);
          }}
        />
      ) : draft.step === 0 ? (
        <IntroScreen onStart={() => goto(1)} />
      ) : draft.step === 1 ? (
        <DesignScreen
          placement={draft.placement}
          setPlacement={(placement: Placement) => patch({ placement })}
          plans={draft.plans}
          onSavePlan={handleSavePlan}
          onLoadPlan={handleLoadPlan}
          onRemovePlan={handleRemovePlan}
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
        <CompareScreen
          placement={draft.placement}
          plans={draft.plans}
          onLoadPlan={handleLoadPlan}
          onBack={() => goto(2)}
          onNext={() => goto(4)}
        />
      ) : (
        <WriteScreen
          answers={draft.answers}
          setAnswer={(key, value) => patch({ answers: { ...draft.answers, [key]: value } })}
          checks={draft.checks}
          setCheck={(key, value) => patch({ checks: { ...draft.checks, [key]: value } })}
          result={result}
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
