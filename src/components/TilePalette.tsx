import { TILE_TYPES, type TileTypeKey } from "../data/grid";

interface Props {
  armed: TileTypeKey | null;
  remaining: Record<TileTypeKey, number>;
  remainingBudget: number;
  onArm: (key: TileTypeKey | null) => void;
}

export default function TilePalette({ armed, remaining, remainingBudget, onArm }: Props) {
  return (
    <div className="tile-palette" role="radiogroup" aria-label="배치할 타일 고르기">
      {TILE_TYPES.map((t) => {
        const left = remaining[t.key];
        const disabled = left <= 0 || t.cost > remainingBudget;
        return (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={armed === t.key}
            className={`tile-chip${armed === t.key ? " armed" : ""}${disabled ? " depleted" : ""}`}
            disabled={disabled}
            title={t.description}
            onClick={() => onArm(armed === t.key ? null : t.key)}
          >
            <span className="tile-chip-icon">{t.icon}</span>
            <span className="tile-chip-label">{t.label}</span>
            <span className="tile-chip-cost">코스트 {t.cost}</span>
            <span className="tile-chip-count">
              {left}/{t.maxCount}
            </span>
          </button>
        );
      })}
    </div>
  );
}
