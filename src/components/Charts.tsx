// 결과 화면의 두 그래프. 외부 라이브러리 없이 SVG로 직접 그린다.
// 세 지수의 색은 어디서나 같고, 색만으로 구분하지 않도록 이름표를 함께 붙인다.

import type { CityResult, Triple, ZoneResult } from "../lib/engine.ts";
import { SERIES } from "../lib/labels.ts";

function Legend() {
  return (
    <div className="chart-legend">
      {SERIES.map((s) => (
        <span key={s.key}>
          <span className="key" style={{ background: s.color }} />
          {s.name} 지수
        </span>
      ))}
    </div>
  );
}

/** 값이 끝나는 쪽 모서리만 둥근 막대. 기준선(0) 쪽은 각지게 둔다. */
function barPath(zeroX: number, endX: number, y: number, h: number): string {
  const r = Math.min(4, Math.abs(endX - zeroX));
  if (endX >= zeroX) {
    const x1 = endX;
    return `M${zeroX},${y} H${x1 - r} Q${x1},${y} ${x1},${y + r} V${y + h - r} Q${x1},${y + h} ${x1 - r},${y + h} H${zeroX} Z`;
  }
  const x1 = endX;
  return `M${zeroX},${y} H${x1 + r} Q${x1},${y} ${x1},${y + r} V${y + h - r} Q${x1},${y + h} ${x1 + r},${y + h} H${zeroX} Z`;
}

// ------------------------------------------------- 생활권별 세 지수 막대

const LABEL_W = 86;
const PLOT_X = 92;
const PLOT_W = 372;
const BAR_H = 14;
const BAR_GAP = 2;
const ZONE_GAP = 16;

export function ZoneBars({ zones }: { zones: ZoneResult[] }) {
  const values = zones.flatMap((z) => [
    z.final.social,
    z.final.economy,
    z.final.environment,
  ]);
  const lo = Math.min(0, ...values) - 1;
  const hi = Math.max(0, ...values) + 1;
  const span = hi - lo || 1;
  const x = (v: number) => PLOT_X + ((v - lo) / span) * PLOT_W;
  const zeroX = x(0);

  const groupH = SERIES.length * BAR_H + (SERIES.length - 1) * BAR_GAP;
  const rowH = groupH + ZONE_GAP;
  const height = zones.length * rowH + 24;

  return (
    <figure className="chart">
      <figcaption>
        생활권별 세 지수 (6년차 최종). 0보다 왼쪽은 배치 전보다 나빠졌다는 뜻입니다.
      </figcaption>
      <Legend />
      <svg
        className="plot"
        viewBox={`0 0 ${PLOT_X + PLOT_W + 46} ${height}`}
        role="img"
        aria-label="생활권별 사회·경제·환경 지수 막대그래프"
      >
        <line className="axis-line" x1={zeroX} y1={8} x2={zeroX} y2={height - 18} />
        {zones.map((z, zi) => {
          const top = zi * rowH + 10;
          return (
            <g key={z.zone.id}>
              <text className="zone" x={LABEL_W} y={top + groupH / 2 + 4} textAnchor="end">
                {z.zone.name}
              </text>
              {SERIES.map((s, si) => {
                const v = z.final[s.key as keyof Triple];
                const y = top + si * (BAR_H + BAR_GAP);
                const endX = x(v);
                const labelX = endX >= zeroX ? endX + 5 : endX - 5;
                return (
                  <g key={s.key}>
                    <title>{`${z.zone.name} ${s.name} 지수 ${v}`}</title>
                    <path d={barPath(zeroX, endX, y, BAR_H)} fill={s.color} />
                    <text
                      className="value"
                      x={labelX}
                      y={y + BAR_H - 3}
                      textAnchor={endX >= zeroX ? "start" : "end"}
                    >
                      {v}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

// ------------------------------------------------------- 도시 전체 추이

/** 눈금이 -5, 0, 5, 10 처럼 떨어지도록 축 범위를 다듬는다. */
function niceScale(min: number, max: number) {
  const rough = Math.max(1, (max - min) / 5);
  const mag = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rough) ?? mag * 10;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 100) / 100);
  return { lo, hi, ticks };
}

export function Timeline({ result }: { result: CityResult }) {
  const pts = result.timeline;
  const values = pts.flatMap((p) => [
    p.totals.social,
    p.totals.economy,
    p.totals.environment,
  ]);
  const scale = niceScale(Math.min(0, ...values), Math.max(0, ...values));
  const lo = scale.lo;
  const hi = scale.hi;
  const span = hi - lo || 1;

  const W = 520;
  const H = 230;
  const padL = 34;
  const padR = 78;
  const padT = 12;
  const padB = 38;

  const x = (i: number) => padL + (i / (pts.length - 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - (v - lo) / span) * (H - padT - padB);

  return (
    <figure className="chart">
      <figcaption>
        도시 전체 합계의 변화. 3년차에 집중호우, 6년차에 기록적 폭염이 옵니다.
      </figcaption>
      <Legend />
      <svg
        className="plot"
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label="도시 전체 사회·경제·환경 지수의 0년·3년·6년 변화 선그래프"
      >
        {scale.ticks.map((v) => (
          <g key={v}>
            <line className="grid-line" x1={padL} y1={y(v)} x2={W - padR} y2={y(v)} />
            <text x={padL - 6} y={y(v) + 4} textAnchor="end">
              {v}
            </text>
          </g>
        ))}
        <line className="axis-line" x1={padL} y1={y(0)} x2={W - padR} y2={y(0)} />

        {pts.map((p, i) => (
          <text key={p.year} x={x(i)} y={H - 18} textAnchor="middle">
            {p.year}년 · {p.label}
          </text>
        ))}

        {SERIES.map((s) => {
          const d = pts
            .map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.totals[s.key as keyof Triple])}`)
            .join(" ");
          const last = pts[pts.length - 1].totals[s.key as keyof Triple];
          return (
            <g key={s.key}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
              {pts.map((p, i) => (
                <circle
                  key={p.year}
                  cx={x(i)}
                  cy={y(p.totals[s.key as keyof Triple])}
                  r={4.5}
                  fill={s.color}
                  stroke="var(--surface-1)"
                  strokeWidth={2}
                >
                  <title>{`${p.year}년 ${p.label} · ${s.name} ${p.totals[s.key as keyof Triple]}`}</title>
                </circle>
              ))}
              <text className="value" x={W - padR + 9} y={y(last) + 4}>
                {s.name} {last}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}
