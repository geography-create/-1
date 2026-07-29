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

export default function SpectrumBar({ markers }: Props) {
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
            <span className="spectrum-marker-label">{m.label}</span>
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
