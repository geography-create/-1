import { useEffect, useState } from "react";
import { cellKey, isRiver, simulateGrid, type Placements, type ReasonKey, type SavedPlan, type TileTypeKey } from "./data/grid";
import IntroScreen from "./screens/IntroScreen";
import ExploreScreen from "./screens/ExploreScreen";
import CompareScreen from "./screens/CompareScreen";
import WrapupScreen from "./screens/WrapupScreen";
import TeacherGuide from "./screens/TeacherGuide";
import "./App.css";

type Screen = "intro" | "explore" | "compare" | "wrapup";

const STAGES: { key: Screen; label: string }[] = [
  { key: "intro", label: "도입" },
  { key: "explore", label: "탐색" },
  { key: "compare", label: "비교" },
  { key: "wrapup", label: "정리" },
];

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function App() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [placements, setPlacements] = useState<Placements>({});
  const [history, setHistory] = useState<Placements[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [reflection, setReflection] = useState("");
  const [finished, setFinished] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screen]);

  function pushHistory() {
    setHistory((h) => [...h, placements]);
  }

  function handlePlaceTile(row: number, col: number, type: TileTypeKey) {
    const key = cellKey(row, col);
    if (isRiver(row, col) || placements[key]) return;
    pushHistory();
    setPlacements((prev) => ({ ...prev, [key]: type }));
  }

  function handleRemoveTile(row: number, col: number) {
    const key = cellKey(row, col);
    if (!placements[key]) return;
    pushHistory();
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleReset() {
    pushHistory();
    setPlacements({});
  }

  function handleUndo() {
    setHistory((h) => {
      if (h.length === 0) return h;
      const next = h[h.length - 1];
      setPlacements(next);
      return h.slice(0, -1);
    });
  }

  function handleSavePlan(reason: ReasonKey, note: string) {
    const plan: SavedPlan = {
      id: makeId(),
      label: `안 ${savedPlans.length + 1}`,
      placements: { ...placements },
      values: simulateGrid(placements),
      reason,
      reasonNote: note,
      savedAt: Date.now(),
    };
    setSavedPlans((plans) => [...plans, plan]);
  }

  function handleLoadPlan(id: string) {
    const plan = savedPlans.find((p) => p.id === id);
    if (!plan) return;
    pushHistory();
    setPlacements({ ...plan.placements });
  }

  function handleDeletePlan(id: string) {
    setSavedPlans((plans) => plans.filter((p) => p.id !== id));
  }

  const stageIndex = STAGES.findIndex((s) => s.key === screen);

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">🌿 승기천 정비 시뮬레이터</span>
        <ol className="stage-tracker">
          {STAGES.map((s, i) => (
            <li key={s.key} className={i === stageIndex ? "active" : i < stageIndex ? "done" : ""}>
              {s.label}
            </li>
          ))}
        </ol>
      </header>

      <main className="app-main">
        {screen === "intro" && <IntroScreen onStart={() => setScreen("explore")} />}
        {screen === "explore" && (
          <ExploreScreen
            placements={placements}
            onPlaceTile={handlePlaceTile}
            onRemoveTile={handleRemoveTile}
            onReset={handleReset}
            onUndo={handleUndo}
            canUndo={history.length > 0}
            savedPlans={savedPlans}
            onSavePlan={handleSavePlan}
            onLoadPlan={handleLoadPlan}
            onDeletePlan={handleDeletePlan}
            onNext={() => setScreen("compare")}
            onBack={() => setScreen("intro")}
          />
        )}
        {screen === "compare" && (
          <CompareScreen
            savedPlans={savedPlans}
            onNext={() => setScreen("wrapup")}
            onBack={() => setScreen("explore")}
          />
        )}
        {screen === "wrapup" && (
          <WrapupScreen
            savedPlans={savedPlans}
            reflection={reflection}
            onReflectionChange={setReflection}
            finished={finished}
            onFinish={() => setFinished(true)}
            onBack={() => setScreen("compare")}
          />
        )}
      </main>

      <TeacherGuide open={guideOpen} onToggle={() => setGuideOpen((o) => !o)} />
    </div>
  );
}

export default App;
