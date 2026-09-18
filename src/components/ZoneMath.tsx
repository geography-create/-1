// 생활권 하나의 계산 과정을 종이에 옮겨 적을 수 있는 형태로 펼쳐 보여 주는 표.
// 실제 수행평가는 종이에서 손으로 계산하므로, 이 표의 줄 순서가 곧 학생이 따라 할 순서다.

import type { ZoneResult } from "../lib/engine.ts";
import { benefitOf } from "../lib/engine.ts";

function sign(n: number): string {
  if (n === 0) return "";
  return n > 0 ? `+${n}` : `${n}`;
}

export default function ZoneMath({ zone: z }: { zone: ZoneResult }) {
  const afterBenefit = benefitOf(z.afterBuild);

  return (
    <div className="zone-math">
      <div className="zone-math-head">
        <h4>{z.zone.name}</h4>
        <span className="muted small">
          {z.cellCount}칸 · 기존 {z.fixedCount}곳 · 내가 놓은 것 {z.placedCount}곳 · 저지대{" "}
          {z.lowlandCount}칸 · 녹지 {z.greenCount}칸
        </span>
      </div>
      <div className="scroll-x">
        <table className="data calc">
          <thead>
            <tr>
              <th>줄</th>
              <th className="num">사회</th>
              <th className="num">경제</th>
              <th className="num">환경</th>
              <th className="num">종합</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                출발선
                <br />
                <span className="muted small">{z.zone.baseReason}</span>
              </td>
              <td className="num">{sign(z.base.social)}</td>
              <td className="num">{sign(z.base.economy)}</td>
              <td className="num">{sign(z.base.environment)}</td>
              <td className="num" />
            </tr>
            <tr>
              <td>기존 시가지 {z.fixedCount}곳</td>
              <td className="num">{sign(z.fromExisting.social)}</td>
              <td className="num">{sign(z.fromExisting.economy)}</td>
              <td className="num">{sign(z.fromExisting.environment)}</td>
              <td className="num" />
            </tr>
            <tr>
              <td>내가 놓은 시설 {z.placedCount}곳</td>
              <td className="num">{sign(z.fromPlaced.social)}</td>
              <td className="num">{sign(z.fromPlaced.economy)}</td>
              <td className="num">{sign(z.fromPlaced.environment)}</td>
              <td className="num" />
            </tr>
            {z.adjustments.map((a) => (
              <tr key={a.label}>
                <td>{a.label}</td>
                <td className="num">{sign(a.delta.social)}</td>
                <td className="num">{sign(a.delta.economy)}</td>
                <td className="num">{sign(a.delta.environment)}</td>
                <td className="num" />
              </tr>
            ))}
            <tr className="subtotal">
              <th>배치 직후 (0년차)</th>
              <th className="num">{z.afterBuild.social}</th>
              <th className="num">{z.afterBuild.economy}</th>
              <th className="num">{z.afterBuild.environment}</th>
              <th className="num">{afterBenefit}</th>
            </tr>
            <tr>
              <td>
                3년차 집중호우{" "}
                <span className={`tag ${z.storm.hit ? "danger" : "good"}`}>
                  {z.storm.hit ? "침수" : "견딤"}
                </span>
                <br />
                <span className="muted small">{z.storm.requirement}</span>
              </td>
              <td className="num">{sign(z.storm.delta.social)}</td>
              <td className="num">{sign(z.storm.delta.economy)}</td>
              <td className="num">{sign(z.storm.delta.environment)}</td>
              <td className="num" />
            </tr>
            <tr>
              <td>
                6년차 폭염{" "}
                <span className={`tag ${z.heat.hit ? "danger" : "good"}`}>
                  {z.heat.hit ? "피해" : "견딤"}
                </span>
                <br />
                <span className="muted small">{z.heat.requirement}</span>
              </td>
              <td className="num">{sign(z.heat.delta.social)}</td>
              <td className="num">{sign(z.heat.delta.economy)}</td>
              <td className="num">{sign(z.heat.delta.environment)}</td>
              <td className="num" />
            </tr>
            <tr className="total">
              <th>최종 (6년차)</th>
              <th className="num">{z.final.social}</th>
              <th className="num">{z.final.economy}</th>
              <th className="num">{z.final.environment}</th>
              <th className="num">{z.benefit}</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
