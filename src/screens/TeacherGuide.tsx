// 주소 뒤에 ?teacher=1 을 붙였을 때만 뜨는 교사용 안내. 학생 링크에는 붙이지 않는다.

import { BUDGET } from "../data/city.ts";
import { FACILITIES } from "../data/facilities.ts";

export default function TeacherGuide({ onClose }: { onClose: () => void }) {
  return (
    <section className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <h2 style={{ marginBottom: 0 }}>교사용 진행 안내</h2>
        <button type="button" className="btn" onClick={onClose}>
          닫기
        </button>
      </div>

      <h3 style={{ marginTop: 18 }}>차시 배분(2차시 기준)</h3>
      <ol>
        <li>
          <b>1차시 도입 10분</b> — 과제 안내와 채점 기준 공개, 네 생활권의 초기 조건 확인.
          "잘 만든 도시가 아니라 설명할 수 있는 도시"라는 점을 못박습니다.
        </li>
        <li>
          <b>1차시 배치 35분</b> — 예산 {BUDGET} 안에서 배치. 화면에 3년차 집중호우·6년차
          폭염 예고가 실시간으로 뜹니다.
        </li>
        <li>
          <b>2차시 결과 확인 10분</b> — 생활권 격차 판정과 비인간 지표 확인.
        </li>
        <li>
          <b>2차시 서술 35분</b> — 세 문항 작성 후 제출.
        </li>
      </ol>

      <h3>채점할 때 눈여겨볼 지점</h3>
      <ul>
        <li>
          ②번에서 <b>초기 조건 탓으로만</b> 설명하면 3점입니다. 돌마루가 낮은 이유를 "원래
          저지대라서"로 끝내지 않고 "내가 저류지를 새들녘에 먼저 놓아서"까지 갔는지 봅니다.
        </li>
        <li>
          ①번 5점은 비인간 존재까지 다룬 경우입니다. 화면의 <b>하천 생태·도시 숲·도시 속
          동물</b> 세 지표가 그 근거가 되도록 만들어 두었습니다.
        </li>
        <li>
          일부러 한 생활권을 비워 둔 학생도 있습니다. 그 자체는 감점 사유가 아니며, 그
          선택을 ②·③번에서 설명했는지로 판단합니다.
        </li>
      </ul>

      <h3>계산 규칙 요약</h3>
      <ul>
        <li>생활권 지수 = 초기 조건 + 시설 효과 + 보정(인접·소외) + 재난 피해</li>
        <li>종합 생활 편익 = 사회×0.4 + 경제×0.3 + 환경×0.3</li>
        <li>생활권 간 격차 3 이상 경계, 5 이상 위험</li>
        <li>
          3년차 집중호우: 저지대 칸 수 ÷ 3(올림)만큼의 물 받이 능력이 없으면 사회 −3, 경제
          −3, 환경 −1
        </li>
        <li>6년차 폭염: 생활권 칸 수 ÷ 6(올림)만큼의 녹지가 없으면 사회 −2, 환경 −1</li>
        <li>무작위 요소 없음 — 같은 배치는 반 전체에서 같은 결과가 나옵니다.</li>
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
                </td>
                <td className="num">{f.cost}</td>
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
          학생 답안은 브라우저 안(localStorage)에만 자동 저장됩니다. 공용 기기라면 제출 후
          "처음부터 다시"로 지우게 안내하세요.
        </li>
        <li>
          시크릿 모드나 저장소 차단 환경에서는 자동 저장이 되지 않습니다. 한 차시 안에
          끝내도록 안내하는 편이 안전합니다.
        </li>
        <li>평가 계획서에 AI 활용 X로 되어 있어 앱에도 AI 기능을 넣지 않았습니다.</li>
      </ul>
    </section>
  );
}
