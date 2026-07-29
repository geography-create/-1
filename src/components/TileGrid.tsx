import { GRID_SIZE, TILE_TYPES, cellKey, isRiver, type Placements, type VisualSynergyEdge } from "../data/grid";

interface Props {
  placements: Placements;
  onCellClick?: (row: number, col: number) => void;
  compact?: boolean;
  label?: string;
  edges?: VisualSynergyEdge[];
}

export default function TileGrid({ placements, onCellClick, compact, label, edges }: Props) {
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
      <div className="tile-grid-stack">
        <div className="tile-grid">{cells}</div>
        {edges && edges.length > 0 && (
          <svg
            className="synergy-overlay"
            viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {edges.map((e) => (
              <line
                key={e.key}
                x1={e.from.col + 0.5}
                y1={e.from.row + 0.5}
                x2={e.to.col + 0.5}
                y2={e.to.row + 0.5}
                stroke={e.color}
                strokeWidth={0.16}
                strokeLinecap="round"
                opacity={0.8}
              >
                <title>{e.label}</title>
              </line>
            ))}
          </svg>
        )}
      </div>
    </div>
  );
}
