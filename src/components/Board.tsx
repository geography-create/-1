// 9x9 격자 지도. 하천은 고정이고, 나머지 칸에 시설을 놓는다.

import {
  FIXED_PLACEMENT,
  GRID,
  SIZE,
  ZONES,
  ZONE_BY_ID,
  cellAt,
  type Cell,
} from "../data/city.ts";
import { FACILITY_BY_ID } from "../data/facilities.ts";
import type { Placement } from "../lib/engine.ts";
import { COL_LABELS, ZONE_COLORS, cellName } from "../lib/labels.ts";

/** 이웃 칸과 생활권이 다르면 그 방향에 굵은 경계선을 긋는다. */
function edgeClasses(cell: Cell): string {
  const dirs: Array<[string, Cell | undefined]> = [
    ["edge-t", cellAt(cell.row - 1, cell.col)],
    ["edge-b", cellAt(cell.row + 1, cell.col)],
    ["edge-l", cellAt(cell.row, cell.col - 1)],
    ["edge-r", cellAt(cell.row, cell.col + 1)],
  ];
  return dirs
    .filter(([, n]) => (n ? n.zone !== cell.zone : cell.zone !== null))
    .map(([cls]) => cls)
    .join(" ");
}

interface Props {
  placement: Placement;
  /** 읽기 전용이면 클릭이 동작하지 않는다(결과·서술 화면). */
  readOnly?: boolean;
  onCellClick?: (cell: Cell) => void;
  /** 이 생활권 칸만 진하게 보여 준다. */
  focusZone?: string | null;
}

export default function Board({ placement, readOnly, onCellClick, focusZone }: Props) {
  return (
    <div className="board-wrap">
      <div className="board" role="group" aria-label="한여울시 9칸 x 9칸 격자 지도">
        <div className="corner" aria-hidden="true" />
        {COL_LABELS.map((label) => (
          <div className="axis" key={label} aria-hidden="true">
            {label}
          </div>
        ))}
        {Array.from({ length: SIZE }, (_, row) => (
          <FragmentRow
            key={row}
            row={row}
            placement={placement}
            readOnly={readOnly}
            onCellClick={onCellClick}
            focusZone={focusZone}
          />
        ))}
      </div>

      <ul className="legend" style={{ listStyle: "none", paddingLeft: 0 }}>
        {ZONES.map((z) => (
          <li key={z.id}>
            <span
              className="swatch"
              style={{
                background: `color-mix(in srgb, ${ZONE_COLORS[z.id]} var(--zone-tint), var(--surface-1))`,
              }}
            />
            {z.name}
            <span className="muted"> ({z.short})</span>
          </li>
        ))}
      </ul>
      <ul className="legend" style={{ listStyle: "none", paddingLeft: 0, marginTop: 6 }}>
        <li>
          <span className="swatch" style={{ background: "var(--river)" }} />
          하천(배치 불가)
        </li>
        <li>
          <span
            className="swatch"
            style={{
              backgroundColor: "var(--wetland)",
              backgroundImage:
                "repeating-linear-gradient(45deg, transparent 0 3px, color-mix(in srgb, var(--zone-beodeul) 35%, transparent) 3px 5px)",
            }}
          />
          남아 있는 논·습지
        </li>
        <li>
          <span
            className="swatch"
            style={{
              background: "transparent",
              borderStyle: "dashed",
              borderColor: "var(--river-ink)",
            }}
          />
          저지대(집중호우 침수 위험)
        </li>
        <li>
          <span
            className="swatch"
            style={{
              backgroundColor: "var(--surface-1)",
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 3px, color-mix(in srgb, var(--text-muted) 30%, transparent) 3px 5px)",
            }}
          />
          기존 시가지(지울 수 없음)
        </li>
        <li>굵은 선 = 생활권 경계</li>
      </ul>
    </div>
  );
}

function FragmentRow({
  row,
  placement,
  readOnly,
  onCellClick,
  focusZone,
}: Props & { row: number }) {
  return (
    <>
      <div className="axis row-label" aria-hidden="true">
        {row + 1}
      </div>
      {Array.from({ length: SIZE }, (_, col) => {
        const cell = GRID[row * SIZE + col];
        return (
          <BoardCell
            key={cell.index}
            cell={cell}
            placement={placement}
            readOnly={readOnly}
            onCellClick={onCellClick}
            focusZone={focusZone}
          />
        );
      })}
    </>
  );
}

function BoardCell({
  cell,
  placement,
  readOnly,
  onCellClick,
  focusZone,
}: Props & { cell: Cell }) {
  const fixedId = FIXED_PLACEMENT[cell.index];
  const facilityId = fixedId ?? placement[cell.index];
  const facility = facilityId ? FACILITY_BY_ID[facilityId] : null;
  const isRiver = cell.terrain === "river";
  const zoneName = cell.zone ? ZONE_BY_ID[cell.zone].name : "하천";

  const label = [
    cellName(cell),
    zoneName,
    isRiver ? "하천" : cell.terrain === "wetland" ? "논·습지" : null,
    cell.lowland ? "저지대" : null,
    facility
      ? `${facility.name}${fixedId ? " (기존 시가지, 지울 수 없음)" : " 배치됨"}`
      : "비어 있음",
  ]
    .filter(Boolean)
    .join(", ");

  const dim = Boolean(focusZone) && cell.zone !== focusZone;

  return (
    <button
      type="button"
      className={`cell ${edgeClasses(cell)} ${!readOnly && !isRiver ? "selectable" : ""}`}
      data-zone={cell.zone ?? "river"}
      data-terrain={cell.terrain}
      data-lowland={cell.lowland ? "yes" : "no"}
      data-filled={facility ? "yes" : "no"}
      data-fixed={fixedId ? "yes" : "no"}
      style={dim ? { opacity: 0.32 } : undefined}
      disabled={readOnly || isRiver || Boolean(fixedId)}
      aria-label={label}
      title={label}
      onClick={() => onCellClick?.(cell)}
    >
      {facility ? facility.glyph : isRiver ? "~" : ""}
    </button>
  );
}
