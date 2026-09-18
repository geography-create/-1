// 종이 답안지에 들어가는 9x9 격자.
//
// 화면용 Board와 달리 (1) 판을 시계방향 90도 돌려 그리고, (2) 색을 전혀 쓰지 않는다.
// 흑백 복사기를 거쳐도 살아남아야 하므로 구분은 전부 무늬·선·글자로만 한다.

import { FIXED_PLACEMENT, GRID, SIZE, ZONES, type Cell } from "../data/city.ts";
import { FACILITY_BY_ID } from "../data/facilities.ts";
import { COL_LABELS, ZONE_MARK } from "../lib/labels.ts";

/**
 * 화면 좌표 (dr, dc)에 그릴 원래 칸.
 * 시계방향 90도 회전이므로 원래 (r, c) → 화면 (c, SIZE-1-r), 역으로 r = SIZE-1-dc, c = dr.
 * 칸 이름(가1, 다3 …)은 원래 그대로라서 앱에서 익힌 좌표가 종이에서도 그대로 통한다.
 */
function sourceCell(dr: number, dc: number): Cell {
  const row = SIZE - 1 - dc;
  const col = dr;
  return GRID[row * SIZE + col];
}

function edgeClasses(cell: Cell, dr: number, dc: number): string {
  // 회전한 뒤의 상하좌우 이웃을 화면 좌표로 찾는다.
  const dirs: Array<[string, number, number]> = [
    ["edge-t", dr - 1, dc],
    ["edge-b", dr + 1, dc],
    ["edge-l", dr, dc - 1],
    ["edge-r", dr, dc + 1],
  ];
  return dirs
    .filter(([, r, c]) => {
      if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return cell.zone !== null;
      return sourceCell(r, c).zone !== cell.zone;
    })
    .map(([cls]) => cls)
    .join(" ");
}

export default function PrintBoard() {
  return (
    <div className="print-board-wrap">
      <div className="print-board">
        <div className="pb-corner" />
        {/* 회전 탓에 번호 축은 9에서 1로 내려간다. 칸 이름을 원래대로 지키기 위한 대가다. */}
        {Array.from({ length: SIZE }, (_, dc) => (
          <div className="pb-axis" key={`top-${dc}`}>
            {SIZE - dc}
          </div>
        ))}
        {Array.from({ length: SIZE }, (_, dr) => (
          <PrintRow key={dr} dr={dr} />
        ))}
      </div>
      <p className="pb-compass">
        ← 남 &nbsp;·&nbsp; 북 → &nbsp;&nbsp;(화면에서 보던 지도를 시계 방향으로 90° 돌린 것입니다.
        칸 이름은 그대로입니다.)
      </p>
    </div>
  );
}

function PrintRow({ dr }: { dr: number }) {
  return (
    <>
      <div className="pb-axis pb-axis-row">{COL_LABELS[dr]}</div>
      {Array.from({ length: SIZE }, (_, dc) => {
        const cell = sourceCell(dr, dc);
        const fixedId = FIXED_PLACEMENT[cell.index];
        const facility = fixedId ? FACILITY_BY_ID[fixedId] : null;
        const isRiver = cell.terrain === "river";
        return (
          <div
            key={dc}
            className={`pb-cell ${edgeClasses(cell, dr, dc)}`}
            data-terrain={cell.terrain}
            data-lowland={cell.lowland ? "yes" : "no"}
            data-fixed={fixedId ? "yes" : "no"}
          >
            {cell.zone ? <span className="pb-zone">{ZONE_MARK[cell.zone]}</span> : null}
            <span className="pb-glyph">{facility ? facility.glyph : isRiver ? "~" : ""}</span>
          </div>
        );
      })}
    </>
  );
}

export function PrintBoardLegend() {
  return (
    <ul className="pb-legend">
      {ZONES.map((z) => (
        <li key={z.id}>
          <span className="pb-key pb-key-zone">{ZONE_MARK[z.id]}</span>
          {z.name}
        </li>
      ))}
      <li>
        <span className="pb-key" data-terrain="river">
          ~
        </span>
        하천(놓을 수 없음)
      </li>
      <li>
        <span className="pb-key" data-terrain="wetland" />
        남아 있는 논·습지
      </li>
      <li>
        <span className="pb-key" data-fixed="yes" />
        기존 시가지(지울 수 없음)
      </li>
      <li>
        <span className="pb-key" data-lowland="yes" />
        저지대(집중호우 침수 위험)
      </li>
      <li>굵은 선 = 생활권 경계</li>
    </ul>
  );
}
