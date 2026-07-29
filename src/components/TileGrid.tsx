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
            {edges.map((e) => {
              const inset = 0.12;
              const horizontal = e.from.row === e.to.row;
              const minCol = Math.min(e.from.col, e.to.col);
              const minRow = Math.min(e.from.row, e.to.row);
              const x = minCol + inset;
              const y = minRow + inset;
              const width = (horizontal ? 2 : 1) - inset * 2;
              const height = (horizontal ? 1 : 2) - inset * 2;
              return (
                <rect
                  key={e.key}
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={0.22}
                  fill={e.color}
                  fillOpacity={0.28}
                >
                  <title>{e.label}</title>
                </rect>
              );
            })}
          </svg>
        )}
      </div>
    </div>
  );
}
