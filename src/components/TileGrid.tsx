import { GRID_SIZE, TILE_TYPES, cellKey, isRiver, type Placements } from "../data/grid";

interface Props {
  placements: Placements;
  onCellClick?: (row: number, col: number) => void;
  compact?: boolean;
  label?: string;
}

export default function TileGrid({ placements, onCellClick, compact, label }: Props) {
  const readOnly = !onCellClick;
  const cells = [];
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const key = cellKey(row, col);
      const river = isRiver(row, col);
      const typeKey = placements[key];
      const type = typeKey ? TILE_TYPES.find((t) => t.key === typeKey) : undefined;
      const className = [
        "grid-cell",
        river && "river",
        type && "filled",
        type && `tile-${type.key}`,
      ]
        .filter(Boolean)
        .join(" ");

      cells.push(
        <button
          key={key}
          type="button"
          className={className}
          disabled={river || readOnly}
          onClick={() => onCellClick?.(row, col)}
          aria-label={river ? "하천" : type ? type.label : "빈 땅"}
          title={river ? "하천 (고정)" : type ? type.label : "빈 땅"}
        >
          {type && <span className="grid-cell-icon">{type.icon}</span>}
        </button>,
      );
    }
  }

  return (
    <div className={`tile-grid-wrap${compact ? " compact" : ""}`}>
      {label && <p className="tile-grid-label">{label}</p>}
      <div className="tile-grid">{cells}</div>
    </div>
  );
}
