import RiverIllustration from "../components/RiverIllustration";

interface Props {
  onStart: () => void;
}

export default function IntroScreen({ onStart }: Props) {
  return (
    <section className="screen intro-screen">
      <p className="eyebrow">통합사회1 · Ⅲ. 자연환경과 인간</p>
      <h1>승기천 정비 시뮬레이터</h1>
      <p className="lede">
        같은 하천인데, 사진 속 두 모습은 왜 이렇게 다를까요? 오늘은 여러분이 직접 승기천을 정비하는
        계획을 세우며, 그 이유를 찾아봅니다.
      </p>

      <div className="river-compare">
        <RiverIllustration variant="culvert" title="① 복개된 하천 구간" />
        <RiverIllustration variant="eco" title="② 생태하천으로 복원된 구간" />
      </div>

      <div className="intro-question">
        <strong>어느 쪽이 더 좋은 하천일까요?</strong>
        <p>선생님의 안내에 따라 손을 들어 의견을 나눠 보세요.</p>
      </div>

      <div className="notice-box">
        <h2>시작하기 전에</h2>
        <ul>
          <li>이 시뮬레이터의 지표 수치는 교육용으로 만든 가상 모델이에요. 실제 승기천 정비사업의 예측값이 아니에요.</li>
          <li>로그인 없이 진행돼요. 배치를 탐색하고 비교하는 동안은 이름을 입력하지 않아요.</li>
          <li>맨 마지막 정리 단계에서만 반·번호·이름과 한 줄 성찰을 입력하고, 선생님이 결과를 확인해요. 새로고침하면 그 전까지의 기록은 사라져요.</li>
          <li>정답은 없어요. 어떤 자연관을 선택하든, 왜 그렇게 생각했는지가 중요해요.</li>
        </ul>
      </div>

      <button type="button" className="primary-btn" onClick={onStart}>
        내 기기로 시작하기
      </button>
    </section>
  );
}
