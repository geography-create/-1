import type { RestorationItem } from "../data/items";

interface Props {
  item: RestorationItem;
  level: number;
  onChange: (level: number) => void;
}

export default function ItemControl({ item, level, onChange }: Props) {
  return (
    <div className="item-control">
      <div className="item-control-head">
        <span className="item-icon" aria-hidden>
          {item.icon}
        </span>
        <div>
          <h3>{item.title}</h3>
          <p className="item-question">{item.question}</p>
        </div>
      </div>
      <div className="item-options" role="radiogroup" aria-label={item.title}>
        {item.levels.map((lv, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={level === i}
            className={`item-option${level === i ? " selected" : ""}`}
            onClick={() => onChange(i)}
          >
            <span className="item-option-label">{lv.label}</span>
            <span className="item-option-desc">{lv.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
