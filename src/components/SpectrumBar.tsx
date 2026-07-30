export interface SpectrumMarker {
  id: string;
  position: number; // 0 (인간중심) ~ 100 (생태중심)
  label: string;
  color: string;
  emphasized?: boolean;
}

interface Props {
  markers: SpectrumMarker[];
}

// 위치가 서로 가까운(또는 같은) 마커의 이름표가 겹치지 않도록, 점(위치)은 실제 값 그대로
// 두고 이름표만 위로 층층이 쌓아 올려요. 값이 정말 같은 안이라면 점도 정확히 같은 자리에
// 겹쳐 찍혀야 그 자체로 의미가 있어요(예: 실제 배치가 똑같으면 같은 지점에 찍혀야 함).
const LABEL_COLLISION_THRESHOLD = 9;

function assignLabelLanes(markers: SpectrumMarker[]): Map<string, number> {
  const sorted = [...markers].sort((a, b) => a.position - b.position);
  const laneLastPos: number[] = [];
  const lanes = new Map<string, number>();
  for (const m of sorted) {
    let lane = 0;
    while (
      laneLastPos[lane] !== undefined &&
      Math.abs(m.position - laneLastPos[lane]) < LABEL_COLLISION_THRESHOLD
    ) {
      lane++;
    }
    laneLastPos[lane] = m.position;
    lanes.set(m.id, lane);
  }
  return lanes;
}

export default function SpectrumBar({ markers }: Props) {
  const lanes = assignLabelLanes(markers);
  return (
    <div className="spectrum">
      <div className="spectrum-track">
        {markers.map((m) => (
          <div
            key={m.id}
            className={`spectrum-marker${m.emphasized ? " emphasized" : ""}`}
            style={{ left: `${m.position}%`, background: m.color }}
            title={m.label}
          >
            <span
              className="spectrum-marker-label"
              style={{ top: `${-22 - (lanes.get(m.id) ?? 0) * 16}px` }}
            >
              {m.label}
            </span>
          </div>
        ))}
      </div>
      <div className="spectrum-ends">
        <span>인간중심주의</span>
        <span>균형·조화</span>
        <span>생태중심주의</span>
      </div>
    </div>
  );
}
