// 주소 뒤에 ?teacher=1 을 붙였을 때만 뜨는 교사용 안내. 학생 링크에는 붙이지 않는다.

import {
  BUDGET,
  GAP_DANGER,
  GAP_WARN,
  GREEN_NEEDED,
  LOWLAND_PER_DEFENSE,
  ZONES,
} from "../data/city.ts";
import { FACILITIES } from "../data/facilities.ts";
import { evaluate } from "../lib/engine.ts";

const BARE = evaluate({});

export default function TeacherGuide({ onClose }: { onClose: () => void }) {
  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ marginBottom: 0 }}>교사용 진행 안내</h2>
        <button type="button" className="btn" onClick={onClose}>
          닫기
        </button>
      </div>

      <h3 style={{ marginTop: 18 }}>이 앱의 위치</h3>
      <p>
        수행평가 <b>직전 연습용</b>입니다. 평가 당일에는 쓰지 않고 종이로 진행합니다. 그래서
        개인정보를 받지 않고 제출 기능도 없습니다. 학생 기록은 그 기기의 브라우저에만 남습니다.
      </p>
      <p>
        학생이 종이에서 손으로 계산해야 하므로, 규칙은 <b>보정 4가지 + 재난 2가지</b>로
        줄였습니다. 종합 생활 편익도 가중치 없이 세 지수를 그냥 더합니다. 무작위 요소는 없어서
        같은 배치는 반 전체에서 같은 결과가 나옵니다.
      </p>

      <h3>차시 배분(1차시 연습 기준)</h3>
      <ol>
        <li>
          <b>10분</b> — 과제 안내 화면으로 계산 규칙과 채점 기준을 함께 읽습니다. 규칙표를
          칠판에 띄워 두면 좋습니다.
        </li>
        <li>
          <b>20분</b> — 자유 배치. 계산 과정 표가 항상 보이므로, 한 칸 놓을 때마다 어느 줄이
          바뀌는지 따라가게 합니다.
        </li>
        <li>
          <b>10분</b> — 안을 2~3개 저장해 비교 화면에서 격차를 견줍니다.
        </li>
        <li>
          <b>10분</b> — 서술 연습. 채점 기준을 펼쳐 놓고 5점이 되려면 무엇이 더 필요한지 짚습니다.
        </li>
      </ol>

      <h3>아무것도 놓지 않았을 때의 출발값</h3>
      <p className="muted small">
        기존 시가지와 출발선 보정, 소외 감점과 재난까지 모두 반영한 값입니다. 학생이 여기서
        시작합니다.
      </p>
      <div className="scroll-x">
        <table className="data">
          <thead>
            <tr>
              <th>생활권</th>
              <th className="num">칸</th>
              <th className="num">저지대</th>
              <th className="num">사회</th>
              <th className="num">경제</th>
              <th className="num">환경</th>
              <th className="num">종합</th>
            </tr>
          </thead>
          <tbody>
            {BARE.zones.map((z) => (
              <tr key={z.zone.id}>
                <td>{z.zone.name}</td>
                <td className="num">{z.cellCount}</td>
                <td className="num">{z.lowlandCount}</td>
                <td className="num">{z.final.social}</td>
                <td className="num">{z.final.economy}</td>
                <td className="num">{z.final.environment}</td>
                <td className="num">
                  <b>{z.benefit}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="small">
        출발 격차 <b>{BARE.gap}</b> ({BARE.gapLevel} 수준), 최하{" "}
        {BARE.worstZone.zone.name}. 학생은 예산 {BUDGET}으로 이 격차를 줄이거나, 줄이지 않기로
        선택하고 그 이유를 설명하게 됩니다.
      </p>

      <h3>채점할 때 눈여겨볼 지점</h3>
      <ul>
        <li>
          ②번에서 <b>초기 조건 탓으로만</b> 설명하면 3점입니다. 기존 시가지를 판에 깔아 두었기
          때문에 "원래 낮아서"가 아니라 "공장 두 칸이 이미 있어서"까지는 쉽게 나옵니다. 거기서
          한 걸음 더 나아가 <b>자기 배치</b>와 연결했는지를 봅니다.
        </li>
        <li>
          ①번 5점은 비인간 존재까지 다룬 경우입니다. 앱의 <b>하천 생태·도시 숲·도시 속 동물</b>{" "}
          패널이 그 감각을 잡아 주지만, 종이에서는 수치가 없으니 "하천변에 무엇을 놓았는지"를
          근거로 쓰게 안내하세요.
        </li>
        <li>
          일부러 한 생활권을 비워 둔 학생도 있습니다. 그 자체는 감점 사유가 아니며, 그 선택을
          ②·③번에서 설명했는지로 판단합니다.
        </li>
      </ul>

      <h3>계산 규칙 요약</h3>
      <ul>
        <li>생활권 지수 = 출발선 보정 + 기존 시가지 + 놓은 시설 + 보정 4종 + 재난 2종</li>
        <li>종합 생활 편익 = 사회 + 경제 + 환경 (가중치 없음)</li>
        <li>
          생활권 격차 {GAP_WARN} 이상 경계, {GAP_DANGER} 이상 위험. 종합이 세 지수의 합이라
          켄텍 문제의 3/5을 같은 뜻이 되도록 세 배로 옮긴 값이다.
        </li>
        <li>
          3년차 집중호우: 저지대 칸 수 ÷ {LOWLAND_PER_DEFENSE}(올림)만큼 물 받이가 없으면 사회
          −2, 경제 −2. 물 받이 = 녹지 칸 수 + 저류지(저지대 2, 그 밖 1) + 하수처리 1
        </li>
        <li>6년차 폭염: 녹지 {GREEN_NEEDED}칸 미만이면 사회 −1, 환경 −1</li>
      </ul>

      <h3>생활권 출발선 보정과 그 이유</h3>
      <ul className="small">
        {ZONES.map((z) => (
          <li key={z.id}>
            <b>{z.name}</b> — {z.baseReason}
          </li>
        ))}
      </ul>

      <h3>시설 수치표</h3>
      <div className="scroll-x">
        <table className="data">
          <thead>
            <tr>
              <th>시설</th>
              <th className="num">비용</th>
              <th className="num">사회</th>
              <th className="num">경제</th>
              <th className="num">환경</th>
              <th>조건·메모</th>
            </tr>
          </thead>
          <tbody>
            {FACILITIES.map((f) => (
              <tr key={f.id}>
                <td>
                  {f.glyph} {f.name}
                  {f.fixedOnly ? " (기존)" : ""}
                </td>
                <td className="num">{f.fixedOnly ? "—" : f.cost}</td>
                <td className="num">{f.effect.social}</td>
                <td className="num">{f.effect.economy}</td>
                <td className="num">{f.effect.environment}</td>
                <td className="small">{f.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3>유의사항</h3>
      <ul>
        <li>
          학생 기록은 브라우저 안(localStorage)에만 남습니다. 공용 기기라면 다음 반이 오기 전
          상단 "처음부터 다시"로 지우게 안내하세요.
        </li>
        <li>시크릿 모드나 저장소 차단 환경에서는 자동 저장이 되지 않습니다.</li>
        <li>평가 계획서에 AI 활용 X로 되어 있어 앱에도 AI 기능을 넣지 않았습니다.</li>
        <li>
          수치를 바꾸려면 <code>src/data/facilities.ts</code>(시설)와{" "}
          <code>src/data/city.ts</code>(예산·기존 시가지·재난 기준)만 고치면 됩니다.
        </li>
      </ul>
    </section>
  );
}
