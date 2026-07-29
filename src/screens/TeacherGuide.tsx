interface Props {
  open: boolean;
  onToggle: () => void;
}

const STAGES = [
  {
    time: "도입 · 5분",
    title: "같은 하천, 다른 사진",
    body: [
      "승기천 복개 구간과 생태하천 구간 사진을 비교해 제시하고, 어느 쪽이 좋은 하천인지 거수로 물어보세요.",
      "웹앱 링크를 배포하고, 학생이 개인 기기로 접속해 화면이 뜨는지 확인하도록 안내하세요.",
    ],
  },
  {
    time: "탐색 · 20분",
    title: "여섯 가지를 직접 정하기",
    body: [
      "초기화·되돌리기 사용법을 안내한 뒤 자유롭게 조작할 시간을 주세요.",
      "6개 항목을 바꾸며 지표 변화를 확인하고, 서로 다른 안을 3개 저장하도록 하세요.",
      "함께 오르지 않는(상충하는) 지표 짝을 스스로 찾아보도록 유도하세요.",
    ],
  },
  {
    time: "비교 · 15분",
    title: "왜 다르게 골랐을까",
    body: [
      "4인 모둠을 구성해 화면을 나란히 놓고 비교하도록 하세요.",
      "처음 안과 최종 안의 차이를 설명하게 하고, 순회하며 관점에 이름을 붙여 주세요.",
      "무엇을 포기했는지 서로 묻고, 이유가 갈리는 지점을 기록하도록 안내하세요.",
    ],
  },
  {
    time: "정리 · 10분",
    title: "이유가 관점을 가른다",
    body: [
      "제출 후 스펙트럼 결과를 함께 공유하고 두 자연관 개념을 정리하세요.",
      "한 줄 성찰을 작성·발표하며, 같은 선택도 이유에 따라 관점이 달라짐을 확인하세요.",
    ],
  },
];

export default function TeacherGuide({ open, onToggle }: Props) {
  return (
    <>
      <button type="button" className="teacher-toggle" onClick={onToggle}>
        {open ? "안내 닫기" : "교사용 진행 안내"}
      </button>
      {open && (
        <div className="teacher-guide">
          <h2>수업 진행 안내</h2>
          <p className="muted">
            탐구 질문: 승기천을 아끼자는 같은 결론이, 왜 서로 다른 관점이 될 수 있을까?
          </p>
          <ol>
            {STAGES.map((s) => (
              <li key={s.title}>
                <p className="stage-time">{s.time}</p>
                <p className="stage-title">{s.title}</p>
                <ul>
                  {s.body.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
          <h3>AI·디지털 활용 유의사항</h3>
          <ul>
            <li>지표 수치는 교육용 가상 모델이므로 실제 사업의 예측값으로 오해하지 않도록 안내하세요.</li>
            <li>로그인·개인정보 수집이 없으며, 새로고침 시 기록이 사라짐을 미리 알려주세요.</li>
            <li>특정 자연관을 정답으로 제시하지 말고, 논거의 타당성을 기준으로 피드백하세요.</li>
            <li>실제 승기천 사업 자료를 인용할 때는 출처와 시점을 함께 제시하세요.</li>
          </ul>
        </div>
      )}
    </>
  );
}
