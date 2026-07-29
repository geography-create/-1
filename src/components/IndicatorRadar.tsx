import { INDICATORS, type IndicatorValues } from "../data/grid";

export interface RadarDataset {
  label: string;
  color: string;
  values: IndicatorValues;
}

interface Props {
  datasets: RadarDataset[];
  size?: number;
}

const SIZE = 300;
const CENTER = SIZE / 2;
const MAX_R = 105;
const RINGS = [20, 40, 60, 80, 100];

function pointFor(index: number, value: number) {
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / INDICATORS.length;
  const r = (MAX_R * value) / 100;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)] as const;
}

function polygonPoints(values: IndicatorValues) {
  return INDICATORS.map((ind, i) => pointFor(i, values[ind.key]).join(",")).join(" ");
}

export default function IndicatorRadar({ datasets, size = SIZE }: Props) {
  return (
    <div className="indicator-radar">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={size} height={size} role="img" aria-label="지표 그래프">
        {RINGS.map((ring) => (
          <polygon
            key={ring}
            points={INDICATORS.map((_, i) => pointFor(i, ring).join(",")).join(" ")}
            fill="none"
            stroke="#cdd9d2"
            strokeWidth={1}
          />
        ))}
        {INDICATORS.map((ind, i) => {
          const [x, y] = pointFor(i, 100);
          return (
            <line key={ind.key} x1={CENTER} y1={CENTER} x2={x} y2={y} stroke="#cdd9d2" strokeWidth={1} />
          );
        })}
        {datasets.map((ds) => (
          <polygon
            key={ds.label}
            points={polygonPoints(ds.values)}
            fill={ds.color}
            fillOpacity={0.28}
            stroke={ds.color}
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ))}
        {datasets.map((ds) =>
          INDICATORS.map((ind, i) => {
            const [x, y] = pointFor(i, ds.values[ind.key]);
            return <circle key={ds.label + ind.key} cx={x} cy={y} r={3.5} fill={ds.color} />;
          }),
        )}
        {INDICATORS.map((ind, i) => {
          const [x, y] = pointFor(i, 122);
          return (
            <text
              key={ind.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="radar-label"
            >
              {ind.shortLabel}
            </text>
          );
        })}
      </svg>
      {datasets.length > 1 && (
        <ul className="radar-legend">
          {datasets.map((ds) => (
            <li key={ds.label}>
              <span className="legend-dot" style={{ background: ds.color }} />
              {ds.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
