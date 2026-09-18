// 0~100 눈금의 지표 막대. 세 지표 모두 같은 눈금이라 색은 한 가지만 쓴다
// (색이 아니라 왼쪽 이름표가 무엇인지 말해 준다).

interface Item {
  name: string;
  value: number;
  caption?: string;
}

export default function Meters({ items, hint }: { items: Item[]; hint?: string }) {
  return (
    <div>
      <div className="meter-row">
        {items.map((it) => (
          <div className="meter" key={it.name}>
            <span>{it.name}</span>
            <span
              className="track"
              role="img"
              aria-label={`${it.name} ${it.value}점 (100점 만점)`}
              title={it.caption ?? `${it.name} ${it.value}`}
            >
              <span className="fill" style={{ width: `${it.value}%` }} />
            </span>
            <span className="val">{it.value}</span>
          </div>
        ))}
      </div>
      {hint ? <p className="muted small" style={{ marginTop: 8 }}>{hint}</p> : null}
      <ul className="muted small" style={{ marginTop: 8 }}>
        {items
          .filter((it) => it.caption)
          .map((it) => (
            <li key={it.name}>
              <b>{it.name}</b> — {it.caption}
            </li>
          ))}
      </ul>
    </div>
  );
}
